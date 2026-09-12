# EEA Classroom Companion V6 Audit Master

## Purpose
Create one authoritative, self-contained, working V6 build in `v6-test`.

V6 is not complete until it:
- runs as one source of truth rather than a patchwork of old builds,
- has no accidental dependencies on `v6-clean-build`, older folders, obsolete assets, or stale duplicate implementations,
- keeps app-owned assets local unless a resource is intentionally external,
- uses one authoritative implementation per feature,
- preserves compatible state across the full classroom flow,
- isolates AM and PM class-specific state while keeping truly shared setup shared,
- works on a fresh install and preserves existing classroom data during migration,
- and has one authoritative service-worker/offline-cache path.

## Status Key
- ✅ Audited + passed
- 🔧 Audited + fixed
- ⚠️ Audited + issue still open
- 🔗 Legacy / external dependency
- 🔁 Reopened
- ⬜ Not yet audited

## Verified Completed Work
- 🔧 Fresh-install roster mismatch fixed: Attendance, Students, and Star use the canonical 20-child roster / IDs.
- 🔧 AM/PM class architecture added through `class-profile.js` and Teacher's Desk.
- 🔧 Existing classroom data remains the AM profile during migration; PM seeds a clean canonical roster.
- 🔧 Shared setup remains shared rather than needlessly duplicated.
- ✅ Attendance flow verified against the current roster and today's attendance state.
- ✅ Star engine verified: attendance-aware alphabetical rotation, pending absent Star behavior, and teacher override update the full Star state.
- ✅ Star Management uses the shared Star engine.
- ✅ Choose a Friend begins with the current Star when present.
- ✅ Center Choice begins with the current Star when present.
- 🔧 `eea-choose-friend-state-v1` is now included in `class-profile.js`, so saved Choose a Friend rounds are isolated between AM and PM classes.
- 🔧 Service-worker logic consolidated: `sw.js` is authoritative and `service-worker.js` is now a compatibility entry that imports `sw.js` instead of maintaining a second cache implementation.
- ✅ Backup & Restore collects all `eea-` localStorage keys, so class profile objects are included automatically.

## Open Functional / State Findings
- ⚠️ Center Choice has no persistent round state. Counts, picker order, selected child, history, and undo state reset when the page is left/reopened.
- ⚠️ Choose a Friend and Center Choice treat missing today's attendance as if every student is present. Direct entry, especially into a fresh PM class, can therefore include absent/unknown children.
- ⚠️ Choose a Friend and Center Choice still contain an old 18-child fallback roster instead of the canonical 20-child roster.
- ⚠️ Home has no read-only AM/PM active-class indicator.
- ⚠️ Home / Teacher's Desk daily-reset lists do not yet reference the actual `eea-choose-friend-state-v1` state key.
- ⚠️ Week 1 and Week 2 lesson-runner sidebar Quick Tools link "Choose a Friend" to nonexistent `choose-friend.html`. Their automatic post-read-aloud flow correctly uses `choose-a-friend.html`; the sidebar links need correction.

## Structural / Source-of-Truth Findings
- 🔗 `star-of-the-day.html` still loads its background and Star artwork from raw GitHub URLs under `v6-clean-build`; local V6 equivalents already exist.
- ⚠️ Choose a Friend core persistence / fixed-stick behavior lives inside a file named `choose-a-friend-audio-fix.js`, mixing core state logic with what appears to be a patch/audio helper.
- 🔧 `sw.js` is now the single authoritative service-worker implementation; `service-worker.js` is compatibility-only.
- ✅ `manifest.webmanifest` starts and scopes the installed app to `./index.html` / `./` inside V6.
- ✅ `calendar-management.html` is an intentional compatibility redirect to `calendar-management-v2.html` rather than a competing implementation.
- ✅ `clean-up.html` is an intentional compatibility redirect to `clean-up-song.html`.
- ⚠️ `daily-lessons.html` is the active Home-routed lesson overview; `daily-lessons-v2.html` and `daily-lessons-fixed.html` are older parallel implementations that need legacy classification/removal once incoming-link checks are complete.
- ⚠️ Week 5's active lesson runner loads `week5-read-aloud.html`; `week5-read-aloud-v3.html` is a parallel older implementation unless another active route is found.
- ⚠️ `community-meeting-week1-new.html` is not used by the current Week 1 lesson runner; Week 1 uses day-specific Community Meeting files instead. Treat `-new` as legacy/alternate unless another active route is found.
- ✅ Weeks 3–4 use the newer full-screen runner pattern and correctly route post-read-aloud to `choose-a-friend.html`; Week 1–2 still retain older shell-era sidebar code.
- ⚠️ `v6-test` contains multiple development/test/editor files and versioned alternatives. Each must be classified as authoritative runtime, intentional compatibility redirect, development tool, or removable legacy file before V6 is declared clean.

## Dependency Inventory — Current Classification
### Authoritative runtime confirmed
- `index.html`
- `manifest.webmanifest`
- `install.html`
- `sw.js`
- `class-profile.js`
- `attendance.html`
- `star-engine.js`
- `star-management.html`
- `star-of-the-day.html` (runtime, but has legacy asset dependency)
- `choose-a-friend.html`
- `center-choice.html`
- `teachers-desk.html`
- `daily-lessons.html`
- `calendar-management-v2.html`
- `clean-up-song.html`
- `lesson-runner-week1.html`
- `lesson-runner-week2.html`
- `lesson-runner-week3.html`
- `lesson-runner-week4.html`
- `lesson-runner-week5.html`
- `week5-read-aloud.html`
- `backup-restore.html`

### Intentional compatibility redirects / aliases confirmed
- `calendar-management.html` -> `calendar-management-v2.html`
- `clean-up.html` -> `clean-up-song.html`
- `service-worker.js` -> authoritative `sw.js` via `importScripts`

### Likely legacy / duplicate; verify incoming links before removal
- `daily-lessons-v2.html`
- `daily-lessons-fixed.html`
- `week5-read-aloud-v3.html`
- `community-meeting-week1-new.html`

### Development / test files requiring classification
- `audio-test.html`
- `browser-test.html`
- `clean-up-block-test.html`
- `video-test.html`
- `week3-visual-test.html`
- visual/layout editor and override utilities that may or may not still be runtime dependencies

## Current Audit Checkpoint
**Continue structural dependency inventory from Week 5 onward and classify remaining versioned/test/editor files.** Then fix the remaining daily-flow state bugs and legacy references.

### Next high-priority fixes
1. Add `eea-choose-friend-state-v1` to daily-reset handling. (`class-profile.js` portion is complete.)
2. Add true Center Choice persistent state and class separation.
3. Localize Star of the Day assets into V6 paths.
4. Replace stale 18-child fallbacks with canonical roster behavior.
5. Change attendance-unknown picker behavior so unknown does not mean everyone present.
6. Add read-only Home AM/PM indicator.
7. Correct Week 1–2 runner sidebar links from `choose-friend.html` to `choose-a-friend.html`.
8. Rationalize Choose a Friend persistence out of the misleading `audio-fix` patch structure.
9. Finish legacy duplicate / development-file classification and remove or isolate files that are not part of authoritative V6.

## Continuity Rule
Do not restart the audit when a new chat begins. Resume from **Current Audit Checkpoint**. Revisit a completed area only when a later dependency forces it to be marked 🔁 Reopened.
