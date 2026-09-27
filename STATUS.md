# Status

_Last updated: 2026-09-27 (session 2, Claude Code on Thor's Windows computer)_

## Where we are
**M0 Foundations: done and running on Thor's computer.** Thor passed all five M0 checks (sign-in, campaign, workspaces,
backup, restore check). The full quality gate (`npm run check`) is green on Windows too.
GitHub: https://github.com/BrutalDane/designspace (private); the Quality gate run on GitHub is green.

Installed this session: Node.js 24 LTS (Git and Docker Desktop were already there). Playwright's test browser is installed.
Fixed: setup and backup scripts on Windows (see DECISIONS.md / FRICTION.md).

## Waiting on Thor
Nothing.

## Next session
1. Small follow-up: hide the password while typing in `gm:create` (FRICTION.md).
2. CI housekeeping: GitHub warns that actions/checkout@v4 and setup-node@v4 use retired Node 20; move to current versions.
3. Start M1 slice 1.

## Everyday use (Windows PowerShell: type `npm.cmd` instead of `npm`)
- Start: Docker Desktop running, then `npm.cmd run dev`, open http://localhost:3000.
- Claude can also start it from the Code tab (`.claude/launch.json`, name `designspace`).

## Next
M1 Wiki core, slice 1: entry types and layouts for places (World → Region → Settlement → District → Building/Site), the tree, and page editing with history.
