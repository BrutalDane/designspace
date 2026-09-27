/** Reference data that is part of the product, not user content. Grows with M1 (entry types) and later rulesets. */
export const RULESETS: Record<string, { name: string; short: string }> = {
  dnd2014: { name: "Dungeons & Dragons 5e (2014)", short: "D&D 2014" },
};
export const CALENDARS: Record<string, { name: string }> = {
  harptos: { name: "Calendar of Harptos" },
  simple: { name: "Simple 12 × 30" },
};
export const WORKSPACES = [
  { slug: "wiki", label: "Wiki" },
  { slug: "build", label: "Worldbuilding" },
  { slug: "sessions", label: "Sessions" },
] as const;
