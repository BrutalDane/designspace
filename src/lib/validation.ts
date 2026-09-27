import * as z from "zod";
import { RULESETS, CALENDARS } from "@/lib/reference";

export const CampaignInput = z.object({
  name: z.string().trim().min(2, { error: "Give the campaign a name of at least 2 characters." }).max(80, { error: "Keep the name under 80 characters." }),
  setting: z.string().trim().max(200, { error: "Keep the setting under 200 characters." }).default(""),
  ruleset: z.enum(Object.keys(RULESETS) as [string, ...string[]], { error: "Pick a ruleset from the list." }),
  calendar: z.enum(Object.keys(CALENDARS) as [string, ...string[]], { error: "Pick a calendar from the list." }),
});
export type CampaignInput = z.infer<typeof CampaignInput>;

export const SignInInput = z.object({
  email: z.email({ error: "Enter the email address of the GM account." }).trim(),
  password: z.string().min(1, { error: "Enter your password." }),
});
