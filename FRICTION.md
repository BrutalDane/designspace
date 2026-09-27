# Friction log

Anything that felt clumsy, slow or confusing: who noticed, what, and what happened to it.

| Date | Noticed by | Friction | Status |
|---|---|---|---|
| 2026-09-27 | Claude | First run needs three installs (Node, Git, Docker) and a terminal. Unavoidable for local development; kept to one `npm run setup` command with plain error messages. | Accepted for M0. Revisit when going online (M3). |
| 2026-09-27 | Claude | "Setting" label broke onto two lines ("SETTING / OPTIONAL"). | Fixed in M0. |
| 2026-09-27 | Thor | `npm run setup` failed in PowerShell: Windows blocks the `npm` shortcut script by default. | Use `npm.cmd` in PowerShell; noted in README. No security setting changed. |
| 2026-09-27 | Claude | Setup and backup scripts split multi-word commands on Windows, so the restore check always failed there. CI (Linux) couldn't catch it. | Fixed. Consider a Windows CI run if Windows-only issues recur. |
| 2026-09-27 | Claude | `gm:create` shows the password on screen while it is typed. | Fixed: hidden while typing, asked twice. |
| 2026-09-27 | Claude | A terminal opened before Node.js was installed can't find `npm`; a new window is needed. | One-time; accepted. |
| 2026-09-27 | Thor | Slice 1 felt like forms, not a wiki, and drifted from the decided design (invented sections, missing types, loose nesting, hidden empty sections). Claude had filled gaps from a failed earlier iteration. | Fixed: rebuilt to `reference/` (page anatomy, types, nesting, infobox, read-aloud). Claude no longer uses other iterations. |
| 2026-09-27 | Claude | The prototype's editor is itself a list of labelled fields (Title, Parent, Lead, infobox fields, sections). Slice 1 now matches it. | Open: ask Thor after he tries it whether editing still feels too much like a form. |
| 2026-09-27 | Claude | GitHub caught two problems local runs missed: the Parent list came out in random order (database order), and the accessibility scan could run before the page title had streamed in. | Fixed: parents sorted by title; the scan waits for the title. |
| 2026-09-27 | Thor | Slice 2 asked the GM to type [[ ]] links: not obvious (the check said "write it" without explaining the brackets) and not his job. | Decided: links come from Worldbuilding (M4). Editor no longer mentions link syntax; the Wiki keeps showing and tracking links. |
| 2026-09-27 | Thor | "I cannot click anything": Claude stopped the running app to rename folders (Windows locks them) and restarted it without telling Thor; the app was down, then rebuilding. | Claude now says before stopping the app and when it is back. |
| 2026-09-27 | Claude (lean audit, slices 1–4) | Data access: only the data-access layer and sign-in touch the database; every server action goes through checked functions. Nothing is stored twice: page text only in versions, links and all lists worked out on view, Parent only in the tree. | Passed. |
| 2026-09-27 | Claude (lean audit) | Leftovers and repetition: an unused function and two unused types, one unused style, date formatting written three times, sort-by-title four times, test helpers copied into three files, one layout still named "place". | Fixed on `chore/lean-audit`. |
| 2026-09-27 | Claude (lean audit) | Possible double bookkeeping: the campaign's "Setting" text (M0 campaign form) can say the same as the World / Plane page. | Open: ask Thor whether the campaign card should show its World page instead of a typed setting. |
| 2026-09-27 | Claude (lean audit) | "Contains" shows both in the infobox and as a list on the page. Same derived data shown twice, no storage; it follows the prototype. | Accepted. |
