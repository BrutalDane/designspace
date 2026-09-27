import { execSync } from "node:child_process";
import postgres from "postgres";

/** Fresh test database for every run: migrate, wipe, and create two GM accounts (the second is used to prove isolation). */
export default async function globalSetup() {
  const url = process.env.TEST_DATABASE_URL ?? "postgres://designspace:designspace-local-only@localhost:54329/designspace_test";
  const env = { ...process.env, DATABASE_URL: url, BETTER_AUTH_SECRET: "test-secret-0123456789abcdef0123456789" };
  execSync("npx drizzle-kit migrate", { env, stdio: "inherit" });
  const sql = postgres(url, { max: 1 });
  await sql`truncate table campaign, session, account, verification, "user" cascade`;
  await sql.end();
  for (const [email, name] of [["gm@example.test", "Test GM"], ["other@example.test", "Other GM"]])
    execSync(`npx tsx scripts/create-gm.ts --email ${email} --name "${name}" --password "correct-horse-battery"`, { env, stdio: "inherit" });
}
