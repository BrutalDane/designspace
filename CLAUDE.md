@AGENTS.md

# Working on Designspace

Owner: Thor (product decisions). Claude is technical lead, developer and quality owner.
Thor is not a programmer: explain in plain language, never ask him to choose between technologies,
and ask one multiple-choice question only when a choice affects money, privacy, how the tool feels, or can't be undone.

## Every session
1. Read `STATUS.md`, then `DECISIONS.md` and `FRICTION.md`. The product reference is prototype v6 and the
   decisions note in the claude.ai Project "TTRPG - Designspace" (`claude/designspace-decisions.md`, `claude/build-plan.md`).
2. Work in slices. Each slice: a short brief (goal, journey in Thor's words, left out, 3–5 checks) →
   build on a branch with tests → `npm run check` green → self-review (code + friction) → Thor tries it → merge.
3. End of session: update `STATUS.md`, add one-line entries to `DECISIONS.md` / `FRICTION.md` / `CHANGELOG.md`, commit and push.

## Principles that every change is reviewed against
- Lean: one concept per job; the same information never lives in two places; no double bookkeeping.
- The GM decides canon. AI output is a proposal until accepted. Player views are built on the server from revealed parts only.
- Every data access goes through `src/lib/dal.ts` and checks who is asking. Pages never query the database directly.
- Plain, specific interface copy. WCAG 2.2 AA. Works at phone width.

## Quality gate (`npm run check`, and GitHub Actions on every push)
Lint, strict TypeScript, unit tests (Vitest), production build, browser journeys (Playwright) including
security isolation tests and an axe accessibility scan, and in CI also `npm audit` and a backup/restore check.
Never skip or weaken a test to get green; fix the cause or record why in DECISIONS.md.

## Standing checks
- Every 5 slices: lean audit of the whole app against the principles above (record findings in FRICTION.md).
- Monthly: `npm run backup:verify`, dependency updates, cost check (once online), OWASP Top 10 review.

## Tech notes
Next.js 16 (App Router, `proxy.ts` replaces middleware), React 19, TypeScript strict, PostgreSQL 16 via Docker,
Drizzle ORM + drizzle-kit migrations (`drizzle/`), Better Auth (email+password now; 2FA before going online; Discord in M3),
fonts bundled via @fontsource (no Google calls). Local DB on port 54329; tests use the `designspace_test` database.
