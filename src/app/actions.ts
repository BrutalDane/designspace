"use server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { insertCampaign, requireGM } from "@/lib/dal";
import * as z from "zod";
import { CampaignInput, SignInInput } from "@/lib/validation";

export type FormState = { error?: string; fieldErrors?: Record<string, string[] | undefined> } | undefined;

export async function signIn(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = SignInInput.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  try {
    await auth.api.signInEmail({ body: parsed.data, headers: await headers() });
  } catch {
    // Same message whether the email or the password is wrong, so the form can't be used to discover accounts.
    return { error: "That email and password don't match a GM account." };
  }
  redirect("/");
}

export async function signOut() {
  await auth.api.signOut({ headers: await headers() });
  redirect("/login");
}

export async function createCampaign(_: FormState, formData: FormData): Promise<FormState> {
  await requireGM();
  const parsed = CampaignInput.safeParse({
    name: formData.get("name"), setting: formData.get("setting") ?? "",
    ruleset: formData.get("ruleset"), calendar: formData.get("calendar"),
  });
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  const c = await insertCampaign(parsed.data);
  redirect(`/c/${c.id}/wiki`);
}
