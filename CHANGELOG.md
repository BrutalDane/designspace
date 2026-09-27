# Changelog

## M1 slice 2: Links (2026-09-27)
- Link pages with [[Title]] or [[Title|shown text]] in the lead, infobox and sections; links to pages that don't exist yet show grey and come alive when the page is made.
- Renaming a page keeps every link to it working.
- **Bold**, *italic*, line breaks and "- " lists in page text, as in the prototype.
- Right pane: On this page, Linked from, Links to and recent history.
- Tests: link storage and display, renames, shared titles, and that links never reveal pages from another campaign.

## M1 slice 1: Places in the Wiki (2026-09-27)
- Place types from the reference: World / Plane, Region, Settlement, District, Building / Landmark, Site, Dungeon (Dungeon level follows).
- Pages follow the decided anatomy: lead, "Read aloud" first impression, grouped sections, the "At the table" GM group, quiet "Not written yet" lines, automatic "contains" lists and the infobox.
- Only decided parents are offered, when creating a page and in the editor's Parent field (the way to move a page).
- Collapsible tree, breadcrumbs, and editing with full history: read any older version and restore it.
- Tests: decided types and nesting, page anatomy, history, moving, stale-save protection, isolation between GMs and campaigns (including a forged Parent), accessibility and phone layout.

## Windows setup (2026-09-27)
- Setup, backup and restore check now work on Windows; README explains `npm.cmd` for PowerShell.
- `gm:create` hides the password while it is typed and asks for it twice.
- CI uses current GitHub Actions (v7, Node 24 runtime).

## M0 Foundations (2026-09-27)
- GM sign-in, campaign list and creation, the three workspaces as empty shells.
- Local database with migrations; backup and restore check.
- Quality gate: lint, strict types, unit tests, build, browser journeys (sign-in, campaigns, isolation, accessibility, phone layout), CI workflow.
