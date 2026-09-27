/**
 * Proves the newest backup can actually be restored: loads it into a throwaway database and counts what's inside.
 * Run monthly with: npm run backup:verify
 */
import "dotenv/config";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import { say, fail, pgTool } from "./lib.mjs";

const dir = process.env.BACKUP_DIR || join(homedir(), "Designspace-backups");
let files = [];
try { files = readdirSync(dir).filter((f) => /^designspace-.*\.sql$/.test(f)).sort(); } catch { /* no folder yet */ }
if (!files.length) fail(`No backups found in ${dir}. Run \`npm run backup\` first.`);
const newest = join(dir, files.at(-1));
const scratch = "designspace_restore_check";

const direct = process.env.DS_NO_DOCKER === "1";
const admin = direct ? ["--dbname", process.env.DATABASE_URL] : ["-U", "designspace", "-d", "designspace"];
const target = direct ? ["--dbname", process.env.DATABASE_URL.replace(/\/[^/?]+(\?|$)/, `/${scratch}$1`)] : ["-U", "designspace", "-d", scratch];

pgTool("psql", [...admin, "-v", "ON_ERROR_STOP=1", "-c", `DROP DATABASE IF EXISTS ${scratch}`]);
if (!pgTool("psql", [...admin, "-v", "ON_ERROR_STOP=1", "-c", `CREATE DATABASE ${scratch}`]).ok) fail("Couldn't create the throwaway database.");
const load = pgTool("psql", [...target, "-q", "-v", "ON_ERROR_STOP=1"], { input: readFileSync(newest, "utf8") });
const counts = load.ok ? pgTool("psql", [...target, "-tAc", 'select (select count(*) from "user")||\' GM account(s), \'||(select count(*) from campaign)||\' campaign(s)\'']) : { ok: false, out: "", err: load.err };
pgTool("psql", [...admin, "-c", `DROP DATABASE IF EXISTS ${scratch}`]);
if (!counts.ok) fail(`Restoring ${newest} FAILED. The backup can't be trusted. ${counts.err.trim()}`);
say(`Restore check passed for ${files.at(-1)}: ${counts.out.trim()}.`);
