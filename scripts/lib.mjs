import { spawnSync } from "node:child_process";
export const say = (m) => console.log(`\n▸ ${m}`);
export const fail = (m) => { console.error(`\n✖ ${m}\n`); process.exit(1); };
export function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { stdio: "inherit", shell: process.platform === "win32", ...opts });
  return r.status === 0;
}
export function capture(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { encoding: "utf8", shell: process.platform === "win32", maxBuffer: 1 << 30, ...opts });
  return { ok: r.status === 0, out: r.stdout ?? "", err: r.stderr ?? "" };
}
/** Runs a Postgres tool inside the local database container (or directly, when DS_NO_DOCKER=1, e.g. in CI). */
export function pgTool(tool, args, opts = {}) {
  if (process.env.DS_NO_DOCKER === "1") return capture(tool, args, opts);
  return capture("docker", ["compose", "exec", "-T", "db", tool, ...args], opts);
}
