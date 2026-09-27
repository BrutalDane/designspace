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
