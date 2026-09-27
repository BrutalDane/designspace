# Decisions

One line each: date · decision · why. Product decisions are Thor's; technical ones are Claude's.

- 2026-09-27 · Local-first: develop and run on Thor's computer until M3 · Thor develops locally with the Max plan; no hosting cost until players need access.
- 2026-09-27 · Next.js 16 + React 19 + TypeScript (strict), one codebase · One language front to back, most widely supported, fewer moving parts.
- 2026-09-27 · PostgreSQL 16 in Docker locally, Drizzle ORM with versioned migrations · Proven database; migrations make every structure change reviewable and repeatable.
- 2026-09-27 · Better Auth for sign-in · Covers email+password now, 2FA and Discord later, stores sessions in our own database.
- 2026-09-27 · No public sign-up; GM account created with `npm run gm:create` · Single-GM private tool; nothing to attack on a sign-up form.
- 2026-09-27 · Password minimum 12 characters; one neutral error for wrong email or password · Standard guidance; doesn't reveal which accounts exist.
- 2026-09-27 · 2FA is required before the app goes online (M3), not in M0 · While local-only the app is reachable only from Thor's computer (DB bound to 127.0.0.1).
- 2026-09-27 · All data access through one data-access layer that checks ownership; unknown or foreign campaign ids return 404 · Prevents data leaks by construction; ids can't be probed.
- 2026-09-27 · Fonts bundled with the app (@fontsource), not loaded from Google · Works offline, faster, avoids sending visitors' IPs to Google (GDPR).
- 2026-09-27 · Backups go outside the project folder (default ~/Designspace-backups), keep newest 30, restore check script · A backup is only trusted once it has been restored.
- 2026-09-27 · Tests run against a production build and a separate test database · Tests prove what will actually ship and never touch real data.
- 2026-09-27 · Accessibility gate: no serious/critical axe issues (WCAG 2.2 AA); muted text colour darkened to pass contrast · Found by the gate in M0.
- 2026-09-27 · Accept 4 moderate npm-audit advisories in drizzle-kit's bundled esbuild (dev-only tool, the vulnerable esbuild dev server is never run); CI fails on high/critical · Only fix is a breaking downgrade; re-check monthly.
- 2026-09-27 · Scripts start programs without a shell; only `npx` goes through one, and only with plain-word arguments · On Windows a shell splits multi-word arguments, which silently broke the backup restore check.
- 2026-09-27 · Local dev uses Node.js 24 LTS (installed via winget); CI stays on Node 22 · Both meet `engines: >=22`; the gate passed on both.
- 2026-09-27 · Commits from Thor's computer are authored as Thor (project-level git setting) · Commits link to his GitHub account.
- 2026-09-27 · Wiki entries store identity and tree position only; all page text lives in numbered, never-edited versions, and the newest version is the page · One place for each fact; history comes free and can't drift from the page.
- 2026-09-27 · Saving checks the version the editor started from; a stale save is refused with the typed text kept, never merged or overwritten · Two tabs can't silently lose work.
- 2026-09-27 · Restoring an old version saves a copy as the newest version · History is never rewritten.
- 2026-09-27 · Place types, groups, sections, infobox fields and allowed parents are copied exactly from `reference/wiki-page-design.md`; the invented slice-1 sets and loosened nesting are removed · Code follows the reference (reference/README.md).
- 2026-09-27 · Dungeon level is left for a later slice (it needs keyed areas); Site does not stand in for it · reference/README.md allows this.
- 2026-09-27 · "Summary" is called "Lead" as in the reference; migrations carry existing text across · One name for one thing.
- 2026-09-27 · A page placed before the nesting fix keeps its parent until the GM picks an allowed one in the editor's Parent field; nothing is moved automatically · The GM decides; no silent changes to data.
- 2026-09-27 · Moving a page (Parent) is not a new page version; only the text is versioned · Parent is where the page sits, not what it says.
- 2026-09-27 · Links: the GM types [[Title]] or [[Title|shown text]] (prototype syntax); saved text stores the page id and the editor shows the current title again · Renaming a page never breaks links, with no link table to keep in sync.
- 2026-09-27 · Links to, Linked from and "On this page" are worked out from page text on each view · Nothing is stored twice; fine at campaign scale, revisit if pages number in the thousands.
- 2026-09-27 · A [[Title]] shared by two pages is refused with a plain message instead of guessing · The GM decides which page is meant.
- 2026-09-27 · A link can only resolve to a page in the same campaign; other ids show as "unknown page" · Links can't be used to probe other campaigns.
