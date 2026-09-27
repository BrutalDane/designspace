/** Makes a full backup of the local database, outside the project folder. Run with: npm run backup */
import "dotenv/config";
import { mkdirSync, writeFileSync, readdirSync, unlinkSync, statSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import { say, fail, pgTool } from "./lib.mjs";

const dir = process.env.BACKUP_DIR || join(homedir(), "Designspace-backups");
const keep = 30;
mkdirSync(dir, { recursive: true });
const stamp = new Date().toISOString().replace(/[:T]/g, "-").slice(0, 16);
const file = join(dir, `designspace-${stamp}.sql`);

const args = process.env.DS_NO_DOCKER === "1"
  ? ["--dbname", process.env.DATABASE_URL, "--no-owner", "--clean", "--if-exists"]
  : ["-U", "designspace", "-d", "designspace", "--no-owner", "--clean", "--if-exists"];
const r = pgTool("pg_dump", args);
if (!r.ok || !r.out.includes("PostgreSQL database dump")) fail(`The backup failed. ${r.err.trim()}`);
writeFileSync(file, r.out);

const old = readdirSync(dir).filter((f) => /^designspace-.*\.sql$/.test(f)).sort().reverse().slice(keep);
old.forEach((f) => unlinkSync(join(dir, f)));
say(`Backup saved: ${file} (${Math.round(statSync(file).size / 1024)} KB). Keeping the newest ${keep}.`);
