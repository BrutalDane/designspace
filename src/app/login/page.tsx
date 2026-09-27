import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/dal";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in · Designspace" };

export default async function LoginPage() {
  if (await getSession()) redirect("/");
  return (
    <main className="narrow" id="main">
      <h1 className="display">Designspace</h1>
      <p className="muted">A campaign studio for the GM.</p>
      <section className="card stack" aria-labelledby="gm-h">
        <h2 id="gm-h">Sign in as GM</h2>
        <LoginForm />
      </section>
    </main>
  );
}
