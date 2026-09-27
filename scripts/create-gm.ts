/**
 * Creates the GM account. Nobody can sign up from the website, so this is the only way in.
 * Interactive:  npm run gm:create
 * Scripted:     npm run gm:create -- --email a@b.c --name Thor --password "..."   (used by tests)
 */
import "dotenv/config";
import { createInterface } from "node:readline";
import { stdin, stdout } from "node:process";
import { Writable } from "node:stream";
import { auth } from "../src/lib/auth";

function arg(name: string) { const i = process.argv.indexOf(`--${name}`); return i > -1 ? process.argv[i + 1] : undefined; }

// Everything the prompt echoes goes through here, so typing can be hidden while a password is entered.
let hidden = false;
const screen = new Writable({ write(chunk, encoding, done) { if (!hidden) stdout.write(chunk, encoding); done(); } });

async function main() {
  const rl = createInterface({ input: stdin, output: screen, terminal: stdin.isTTY });
  const lines = rl[Symbol.asyncIterator]();
  const ask = async (question: string, hide = false): Promise<string> => {
    stdout.write(question);
    hidden = hide;
    const { value } = await lines.next();
    hidden = false;
    if (hide) stdout.write("\n");
    return value ?? "";
  };
  const askHidden = (question: string) => ask(question, true);
  const email = (arg("email") ?? (await ask("GM email: "))).trim().toLowerCase();
  const name = (arg("name") ?? (await ask("Your name (shown in the app): "))).trim();
  let password = arg("password");
  if (password === undefined) {
    password = await askHidden("Password (at least 12 characters, hidden while you type): ");
    if (password !== (await askHidden("Type the password again: "))) { rl.close(); throw new Error("The two passwords didn't match. Nothing changed; please run it again."); }
  }
  rl.close();
  if (!email.includes("@") || name.length < 1) throw new Error("Please give a valid email and a name.");
  if (password.length < 12) throw new Error("The password must be at least 12 characters.");
  const ctx = await auth.$context;
  if (await ctx.internalAdapter.findUserByEmail(email)) { console.log(`A GM account for ${email} already exists. Nothing changed.`); return; }
  const hash = await ctx.password.hash(password);
  const user = await ctx.internalAdapter.createUser({ email, name, emailVerified: true }, { method: "email-password" });
  await ctx.internalAdapter.linkAccount({ userId: user.id, providerId: "credential", accountId: user.id, password: hash });
  console.log(`GM account created for ${email}. Sign in at ${process.env.BETTER_AUTH_URL ?? "http://localhost:3000"}/login`);
}
main().then(() => process.exit(0)).catch((e) => { console.error(e instanceof Error ? e.message : e); process.exit(1); });
