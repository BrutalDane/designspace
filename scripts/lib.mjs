import { spawnSync } from "node:child_process";
export const say = (m) => console.log(`\n▸ ${m}`);
export const fail = (m) => { console.error(`\n✖ ${m}\n`); process.exit(1); };
// No shell: each argument reaches the program exactly as given. (On Windows a shell splits "select count(*) from …" into words.)
export function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { stdio: "inherit", ...opts });
  return r.status === 0;
}
export function capture(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { encoding: "utf8", maxBuffer: 1 << 30, ...opts });
  return { ok: r.status === 0, out: r.stdout ?? "", err: r.stderr ?? "" };
}
/** Runs a project tool through npx. Windows can only start npx through a shell, so arguments must be plain words. */
export function npx(args) {
  if (args.some((a) => /[\s"'&|<>^%]/.test(a))) throw new Error(`npx arguments must be plain words: ${args.join(" ")}`);
  return spawnSync(`npx ${args.join(" ")}`, { stdio: "inherit", shell: true }).status === 0;
}
/** Runs a Postgres tool inside the local database container (or directly, when DS_NO_DOCKER=1, e.g. in CI). */
export function pgTool(tool, args, opts = {}) {
  if (process.env.DS_NO_DOCKER === "1") return capture(tool, args, opts);
  return capture("docker", ["compose", "exec", "-T", "db", tool, ...args], opts);
}
