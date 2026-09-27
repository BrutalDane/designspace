# Designspace

A campaign studio for the GM: a wiki, an AI co-GM for worldbuilding, and session prep, with a player wiki on top.

## Start it (on your computer)

You need three free programs installed once: **Node.js** (LTS), **Git** and **Docker Desktop**.

1. Start **Docker Desktop** and wait until it says it's running.
2. Open a terminal in this folder and run:
   ```
   npm run setup
   ```
   The first time, it asks for your GM email, name and a password (at least 12 characters).
3. Start Designspace:
   ```
   npm run dev
   ```
   Open http://localhost:3000 and sign in.

To stop it, press `Ctrl+C` in the terminal. Your data stays in the database until next time.

## Everyday commands

| Command | What it does |
|---|---|
| `npm run dev` | Start Designspace at http://localhost:3000 |
| `npm run backup` | Save a full backup to the `Designspace-backups` folder in your home folder |
| `npm run backup:verify` | Prove the newest backup can be restored (do this monthly) |
| `npm run check` | Run the whole quality gate: lint, types, tests, build, browser journeys, accessibility |

## How the project is run

See `CLAUDE.md` for the working rules, `STATUS.md` for where things stand, `DECISIONS.md` for why things are the way they are, and `FRICTION.md` for anything that felt clumsy.
