# Changelog

## M1 slice 1: Places in the Wiki (2026-09-27)
- Create places from World down to Site, with only sensible nesting offered.
- Each kind of place has its own page layout; empty sections stay hidden.
- The Places tree, breadcrumbs and "Inside" lists for moving around.
- Edit pages with full history: read any older version and restore it.
- Tests: nesting rules, history, stale-save protection, isolation between GMs and campaigns, accessibility and phone layout of every new page.

## Windows setup (2026-09-27)
- Setup, backup and restore check now work on Windows; README explains `npm.cmd` for PowerShell.
- `gm:create` hides the password while it is typed and asks for it twice.
- CI uses current GitHub Actions (v7, Node 24 runtime).

## M0 Foundations (2026-09-27)
- GM sign-in, campaign list and creation, the three workspaces as empty shells.
- Local database with migrations; backup and restore check.
- Quality gate: lint, strict types, unit tests, build, browser journeys (sign-in, campaigns, isolation, accessibility, phone layout), CI workflow.
