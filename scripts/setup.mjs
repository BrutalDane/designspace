/** One-time (and safe to repeat) local setup. Run with: npm run setup */
import { existsSync, readFileSync, writeFileSync, copyFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { say, fail, run, capture, npx } from "./lib.mjs";

const major = Number(process.versions.node.split(".")[0]);
if (major < 22) fail(`Node.js 22 or newer is needed (you have ${process.versions.node}). Install the LTS version from nodejs.org.`);

say("Checking Docker…");
if (!capture("docker", ["info"]).ok) fail("Docker isn't running. Start Docker Desktop, wait until it says it's running, then run `npm run setup` again.");

if (!existsSync(".env")) {
  say("Creating your local settings file (.env)…");
  copyFileSync(".env.example", ".env");
  const env = readFileSync(".env", "utf8").replace("BETTER_AUTH_SECRET=generated-by-setup", `BETTER_AUTH_SECRET=${randomBytes(32).toString("hex")}`);
  writeFileSync(".env", env);
}

say("Starting the local database…");
if (!run("docker", ["compose", "up", "-d", "--wait"])) fail("The database didn't start. Is Docker Desktop running?");

say("Updating the database structure…");
if (!npx(["drizzle-kit", "migrate"])) fail("Updating the database failed. Send me the message above.");

say("Checking for a GM account…");
const has = capture("docker", ["compose", "exec", "-T", "db", "psql", "-U", "designspace", "-d", "designspace", "-tAc", 'select count(*) from "user"']);
if (has.ok && Number(has.out.trim()) > 0) console.log("  A GM account already exists.");
else {
  console.log("  No GM account yet. Let's create yours.");
  if (!npx(["tsx", "scripts/create-gm.ts"])) fail("Creating the GM account failed.");
}

say("Ready. Start Designspace with:  npm run dev   and open http://localhost:3000");
