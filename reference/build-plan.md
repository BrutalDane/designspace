# TTRPG Designspace: build plan and way of working

Written 2026-09-27, after prototype v6 was accepted as the first prototype.
Owner: Thor (product). Technical lead, developer and quality: Claude.

---

## 1. Who decides what

| Thor decides (product) | Claude decides (technical), explains in plain words, and records |
|---|---|
| What the tool should do and why | How it is built: languages, database, hosting, libraries |
| Whether a finished piece feels right to use | Code quality, tests, security, backups |
| Money: the monthly ceiling (set: **€50–100** for hosting plus AI combined) | How to stay inside that ceiling |
| When players get access, and when the real campaign moves in (set: **after the build is complete**) | The order of the work, and how big each step is |
| Pace (set: **about one working session a week**, and the app itself used about once a week) | How much fits in each session |
| Where development happens (set: **locally, on Thor's computer**, using the Max plan) | How the local setup works |

**Rule:** Claude never asks Thor to choose between technologies. When a choice affects money, privacy, how the tool feels, or can't easily be undone, Claude explains the consequence in plain language and asks one multiple-choice question.

---

## 2. What we build it with, in plain words

- **One program, one language.** The whole app is a website written in TypeScript: the part you click and the part on the server. One language means fewer moving parts and fewer places for bugs.
  - *Technical:* Next.js (React) with TypeScript in strict mode.
- **One database.** Everything lives in one well-established database (PostgreSQL): pages, the parent-child tree, links, reveals, the timeline, sessions, proposals and history.
  - Every change is stored as a revision, so nothing is ever lost and every change can be traced.
  - *Technical:* Drizzle ORM with versioned migrations. Page fields are stored as JSONB and validated against the type definitions.
- **Files** such as maps and portraits go in separate file storage.
  - *Technical:* S3-compatible storage (Cloudflare R2 once online, with an EU jurisdiction option).
- **Sign-in:**
  - **GM:** a private account with two-step sign-in (a passkey, or a password plus a code).
  - **Players:** "Sign in with Discord". The app asks Discord only who the player is and whether they're in the campaign's server with the right role. It never reads messages.
  - *Technical:* the Discord scopes are `identify` and `guilds.members.read` (per Discord's documentation, this scope lets the app read the user's own member record in a server). Whether role IDs come back in that record gets confirmed in M3.
- **The AI co-GM:** Anthropic's Claude API, called only from the server so the key is never exposed.
  - Only the context the co-GM is supposed to see is sent: the hierarchy-based context, never the whole campaign.
  - Each call is logged with what was sent and what it cost.
  - A monthly spending cap per campaign is enforced by the app.
  - *Technical:* it sits behind our own "co-GM service" layer, so the provider could be swapped later. A mid-range model does the drafting and a cheaper one does routine checks. Rules and type definitions are prompt-cached.
- **Local first.** Development happens on Thor's computer, and during M0–M2 the app runs there too: the database runs in Docker, and the app opens in the browser at a local address. That means no hosting cost until the app has to be reachable from outside, which is at the latest the player wiki in M3. It can move online earlier if Thor wants to reach it from elsewhere.
  - *Technical:* Docker Compose runs Postgres and object storage locally. Local and hosted use identical configuration, so going online is a deployment, not a rebuild.
- **Hosting (from M3):** a managed platform in the EU (GDPR, and players' Discord identities are personal data). There are no servers for you to maintain.
  - *Technical:* Railway, EU West (Amsterdam), for the app and Postgres, with Render as the fallback. Plan and backup details are confirmed at setup.
- **Your data stays yours:**
  - Automatic backups: local ones during M0–M2, then nightly ones stored separately once online.
  - A restore test every month. A backup that hasn't been restored isn't trusted.
  - **Export to an Obsidian-style Markdown vault** with wikilinks, available at any time. The same format is used later to import your GM vault.

### Expected running cost (estimates, to be measured once running)
| Item | Estimate per month |
|---|---|
| Hosting (app, database, file storage) | $0 during M0–M2 (local). About $5–15 once online, at weekly use |
| AI (from M4), with the app used about once a week | about $2–10. One post-session pass ≈ $0.10–0.30, one Worldbuilding reply ≈ $0.03–0.10 |
| **Total** | well inside €50–100, most likely under €25 |

The app shows actual spend on the campaign settings page. At 80% of the cap it warns you, and at 100% AI features pause until the next month. Everything else keeps working.

**Two separate Claude costs, and they don't overlap:**
- **Thor's Claude subscription (Max)** covers our development sessions (Cowork and Claude Code on Thor's computer), where Claude builds the app. It is not part of the €50–100.
- **The app's own AI** (the co-GM inside Designspace) uses the Claude API, billed separately through the Claude Console with prepaid credits and a spending limit.
  - A subscription doesn't cover API usage, **including when the app runs locally**: the co-GM's calls always go to the API.
  - This is what the €50–100 budget pays for, alongside hosting.
  - During development, automated tests use a stand-in co-GM, so tests cost nothing.

---

## 3. How we work: one small, finished piece at a time

Each piece of work is a **slice**: something small you can actually click and try, locally during M0–M2 and on a private test link once online. There are no long stretches where nothing is visible. At about one session a week, a slice is sized to be built in one session and tried by Thor before the next.

**Every slice goes through the same six steps:**
1. **Clarify.** Claude writes a short slice brief:
   - the goal
   - the journey, in your words ("As GM I…")
   - what's deliberately left out
   - three to five things you'll check

   You answer any multiple-choice questions. This takes minutes, not a document stack.
2. **Build.** Claude builds it with automated tests, on a separate branch so the working version is never touched.
3. **Automatic quality gate.** Nothing moves on unless all of these pass:
   - type and lint checks
   - unit tests and database tests
   - end-to-end journeys: a robot clicks through the real screens, like the checks done on the prototype
   - **security tests that prove players can never retrieve GM-only content**
   - an accessibility scan
   - a dependency security audit

   The gate runs on GitHub on every change, and can also be run locally.
4. **Claude's review:**
   - code review
   - a **friction review**:
     - How many clicks do the main tasks take?
     - Does any information now live in two places?
     - Does anything need double bookkeeping?
     - Does it follow the principles: lean, one concept per job, the GM decides canon?
   - screenshots
5. **You try it,** with a short "try this" list. Your reactions go into the friction log.
6. **Release.** The change is merged, and once online, deployed. Claude updates the status note, the change log and the decisions log.

**Standing checks:**
- **Every five slices:** a lean audit of the whole app against the principles, to catch bloat before it settles in.
- **Every month:** a backup restore test, dependency updates, a cost check, and a security review against the OWASP Top 10.
- **Accessibility:** WCAG 2.2 AA as the target.

**Best-practice references used:** Nielsen's usability heuristics for the friction reviews, WCAG 2.2 for accessibility, OWASP for security, small releases and the test pyramid for development, and the lean principles in the decisions note for scope.

**What we avoid (lesson from Campaign-Design-Studio):** paperwork out of proportion to the work. There are no dozens of decision documents before any code. Each decision is one line in the log, with the reason. Process exists to catch problems, not to produce documents.

---

## 4. How continuity works

Claude does not remember earlier sessions by itself. Continuity lives in files that every session reads first and updates last:
- `STATUS.md`: where we are, what's next, anything waiting on Thor.
- `DECISIONS.md`: one line per decision, with the reason.
- `FRICTION.md`: everything that felt clumsy, and what happened to it.
- `CLAUDE.md`: how to work on this project (these rules).
- This plan and the decisions note, kept in the claude.ai Project and copied into `reference/`.

The code lives in a **private GitHub repository on Thor's account**, with the working copy in the "TTRPG - Designspace" folder on Thor's computer.

---

## 5. Milestones

Prototype v6 is the reference for how things should work. Each milestone is a set of slices, and each ends with something usable.

| # | Milestone | You'll be able to… |
|---|---|---|
| M0 | Foundations (local) | Start the app locally with one command, sign in as GM, see the empty three-workspace shell and campaign list, and trust that local backups run. Also: the quality gate running on GitHub. |
| M1 | Wiki core | Create and edit pages of all 22 types with their layouts, nest them in the tree, link them, search, see history, and export to Markdown. |
| M2 | Sessions | Plan sessions, run table mode, log notes and clock ticks, write the summary, and keep the timeline and fronts (no AI yet; everything by hand). |
| M3 | Player wiki (goes online) | Reveal parts to the party or to one character, use player versions and names, and run the spoiler check. Players sign in with Discord (the role test happens here) and use the journal. The app moves to EU hosting, with nightly backups. |
| M4 | Co-GM | Worldbuilding threads by type, automatic context, and change sets with review and accept. The API account and spending cap go live. |
| M5 | Living world | The AI post-session pass: consequences, timeline events, and reveals under your rules, with exceptions coming to you as questions. |
| M6 | Move in | Import the GM vault through a staged import (read-only copy → dry run → review → import), plus map uploads and polish. Then your campaign moves in, and players get access when you say so. |

Rough pace at about one session a week: M0–M1 in the first month or so, then roughly one milestone every two to four weeks. Re-estimated after M0.

### One-time setup by Thor (Claude guides each step), only when it's needed
- **M0:** a private GitHub repository on Thor's account, plus the local tools on Thor's computer (Node.js, Git, Docker Desktop). Claude checks what is already installed first.
- **M3:** a hosting account (Railway) with a spending limit, and a Discord application for the player sign-in.
- **M4:** a Claude Console (API) account with prepaid credits and a monthly limit, used only by the app.

---

## 6. Risks and how they're handled
| Risk | Handling |
|---|---|
| The AI makes a wrong reveal or draft | Secrets are excluded by rule, every change can be undone, the spoiler check always runs, and nothing becomes canon without you. |
| Players see GM content through a bug | Player pages are built on the server from revealed parts only, and automated security tests on every change try to fetch hidden content as a player. |
| Costs creep up | The cap is enforced by the app, spend is visible in settings, and cheaper models do routine work. |
| Data loss | Backups (local, then nightly online), monthly restore tests, Markdown export at any time, and revisions for every change. |
| The local machine is the only copy during M0–M2 | The code is pushed to GitHub after every session, and the database backup is copied outside the project folder. |
| Bloat and friction grow | Friction review every slice and a lean audit every five slices. |
| Lock-in to a provider | Standard Postgres, our own AI layer in front of the provider, and Markdown export. |
