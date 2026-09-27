# Status

_Last updated: 2026-09-27 (session 1)_

## Where we are
**M0 Foundations (local): built and tested in Claude's workspace.** Waiting for Thor's one-time setup to run it on his computer.

Works now: GM sign-in (no public sign-up), campaign list and creation, the three workspaces as empty shells,
local database with migrations, backup + restore check, quality gate (10 browser journeys incl. isolation and
accessibility, unit tests, lint, types, build) and the GitHub Actions workflow.

## Waiting on Thor
1. Install Node.js LTS, Git and Docker Desktop (Claude guides).
2. Create a private GitHub repository named `designspace` (Claude guides), so the code is pushed and the quality gate runs.
3. Run `npm run setup`, sign in, try the M0 checks (below), and say what felt off.

## M0 checks for Thor
1. `npm run dev`, open http://localhost:3000. You're sent to sign in.
2. Sign in with your GM account.
3. Create a campaign; it opens on the Wiki.
4. Switch between Wiki, Worldbuilding and Sessions.
5. `npm run backup`, then `npm run backup:verify`.

## Next
M1 Wiki core, slice 1: entry types and layouts for places (World → Region → Settlement → District → Building/Site), the tree, and page editing with history.
