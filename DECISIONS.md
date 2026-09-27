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
