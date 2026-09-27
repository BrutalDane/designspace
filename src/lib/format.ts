/** How dates and times are shown everywhere in the app (for example "27 Sept 2026, 16:33"). */
export const formatWhen = (d: Date) => d.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
