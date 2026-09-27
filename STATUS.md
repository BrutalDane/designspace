# Status

_Last updated: 2026-09-27 (session 1)_

## Where we are
**M0 Foundations (local): built and tested in Claude's workspace.** Waiting for Thor's one-time setup to run it on his computer.

Works now: GM sign-in (no public sign-up), campaign list and creation, the three workspaces as empty shells,
local database with migrations, backup + restore check, quality gate (10 browser journeys incl. isolation and
accessibility, unit tests, lint, types, build) and the GitHub Actions workflow.

## Waiting on Thor
1. Open this folder in **Claude Code** (Claude desktop app → Code) so Claude can run commands on this Windows computer.
   The Cowork session that built M0 could only reach this folder through an isolated Linux environment, not Windows itself.
2. Create a private GitHub repository named `designspace` on github.com (no README).
3. Type the GM password yourself when `npm run gm:create` asks for it (Claude never sees it).

## Next session (Claude Code, on Thor's Windows computer)
1. Check for Node.js LTS (22+), Git and Docker Desktop; install what's missing with `winget` (Thor approves the installer prompts).
2. `npm run setup` (Thor types the GM password), `npm run dev`, walk Thor through the M0 checks below.
3. Connect GitHub: `git remote add origin https://github.com/<user>/designspace.git`, `git push -u origin main`; confirm the Quality gate run is green.
4. Record anything that felt off in FRICTION.md, then start M1 slice 1.

## M0 checks for Thor
1. `npm run dev`, open http://localhost:3000. You're sent to sign in.
2. Sign in with your GM account.
3. Create a campaign; it opens on the Wiki.
4. Switch between Wiki, Worldbuilding and Sessions.
5. `npm run backup`, then `npm run backup:verify`.

## Next
M1 Wiki core, slice 1: entry types and layouts for places (World → Region → Settlement → District → Building/Site), the tree, and page editing with history.
