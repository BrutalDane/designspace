"use client";
import { useActionState } from "react";
import { signIn, type FormState } from "@/app/actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(signIn, undefined);
  return (
    <form action={action} className="stack" noValidate>
      <label className="field">Email
        <input id="email" name="email" type="email" autoComplete="username" required aria-describedby="email-err" />
        {state?.fieldErrors?.email && <span className="err" id="email-err">{state.fieldErrors.email[0]}</span>}
      </label>
      <label className="field">Password
        <input id="password" name="password" type="password" autoComplete="current-password" required aria-describedby="pw-err" />
        {state?.fieldErrors?.password && <span className="err" id="pw-err">{state.fieldErrors.password[0]}</span>}
      </label>
      {state?.error && <p className="alert" role="alert">{state.error}</p>}
      <button className="btn primary" type="submit" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</button>
    </form>
  );
}
