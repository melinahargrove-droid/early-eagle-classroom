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
- 🔧 Legacy `choose-friend.html` links are now protected by a compatibility redirect to authoritative `choose-a-friend.html`, preserving query/hash parameters.
- ✅ Backup & Restore collects all `eea-` localStorage keys, so class profile objects are included automatically.
- ✅ Weeks 3–9 use the newer full-screen lesson-runner pattern and correctly route post-read-aloud to `choose-a-friend.html`.
- ✅ Week 8's shared `week8-sections.html` and Week 9's shared `week9-sections.html` are intentional section consolidation, not duplicate implementations.

## Open Functional / State Findings
- ⚠️ Center Choice has no persistent round state. Counts, picker order, selected child, history, and undo state reset when the page is left/reopened.
- ⚠️ Choose a Friend and Center Choice treat missing today's attendance as if every student is present. Direct entry, especially into a fresh PM class, can therefore include absent/unknown children.
- ⚠️ Choose a Friend and Center Choice still contain an old 18-child fallback roster instead of the canonical 20-child roster.
- ⚠️ Home has no read-only AM/PM active-class indicator.
- ⚠️ Home / Teacher's Desk daily-reset lists do not yet reference the actual `eea-choose-friend-state-v1` state key.
- 🔧 Week 1 and Week 2 shell-era sidebar Quick Tools still reference old filename `choose-friend.html`, but the new compatibility redirect now sends those links to authoritative `choose-a-friend.html`. Direct runner cleanup can wait until the older shell code is rationalized.

## Structural / Source-of-Truth Findings
- 🔗 `star-of-the-day.html` still loads its background and Star artwork from raw GitHub URLs under `v6-clean-build`. The background has a verified local V6 equivalent at `assets/home/home-screen-background.png`; the exact local equivalent of the smiling Star artwork still needs confirmation before replacing that URL.
- ⚠️ Choose a Friend core persistence / fixed-stick behavior lives inside a file named `choose-a-friend-audio-fix.js`, mixing core state logic with what appears to be a patch/audio helper.
- 🔧 `sw.js` is now the single authoritative service-worker implementation; `service-worker.js` is compatibility-only.
- ✅ `manifest.webmanifest` starts and scopes the installed app to `./index.html` / `./` inside V6.
- ✅ `calendar-management.html` is an intentional compatibility redirect to `calendar-management-v2.html` rather than a competing implementation.
- ✅ `curriculum-pacing.html` is an intentional compatibility redirect into the current calendar-management/pacing system.
- ✅ `clean-up.html` is an intentional compatibility redirect to `clean-up-song.html`.
- ✅ `read-aloud-week1-plan.html` is a compatibility redirect to authoritative `week1-read-aloud.html`, preserving the selected day.
- ⚠️ `daily-lessons.html` is the active Home-routed lesson overview; `daily-lessons-v2.html` and `daily-lessons-fixed.html` are older parallel implementations.
- 🔗 Day-specific Week 2 wrappers such as `closing-circle-week2-monday.html` and `storytelling-week2-monday.html` explicitly route back to legacy `daily-lessons-v2.html`; classify this family with the old V2 lesson-plan cluster rather than current Week 2 runtime.
- 🔗 `week3-centers.html`, `week4-centers.html`, and `week5-centers.html` are old plan-shell wrappers around authoritative `center-choice.html`; they route their close behavior back to old `week3-plan.html`, `week4-plan.html`, and `week5-plan.html` pages.
- 🔗 Generic `lesson-runner.html` is an older Week 1–2 shell-era runner with stale `choose-friend.html` tooling and older lesson mappings; current daily lessons route to week-specific runners instead.
- ⚠️ Week 5's active lesson runner loads `week5-read-aloud.html`; `week5-read-aloud-v3.html` is a parallel older implementation unless another active route is found.
- ⚠️ `community-meeting-week1-new.html` is not used by the current Week 1 lesson runner; Week 1 uses day-specific Community Meeting files instead. Treat `-new` as legacy/alternate unless another active route is found.
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
- `star-of-the-day.html` (runtime, but still has legacy asset dependencies)
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
- `lesson-runner-week6.html`
- `lesson-runner-week7.html`
- `lesson-runner-week8.html`
- `lesson-runner-week9.html`
- `week5-read-aloud.html`
- `week8-sections.html`
- `week9-sections.html`
- `backup-restore.html`

### Intentional compatibility redirects / aliases confirmed
- `calendar-management.html` -> `calendar-management-v2.html`
- `curriculum-pacing.html` -> calendar management / curriculum schedule
- `clean-up.html` -> `clean-up-song.html`
- `service-worker.js` -> authoritative `sw.js` via `importScripts`
- `read-aloud-week1-plan.html` -> `week1-read-aloud.html`
- `choose-friend.html` -> authoritative `choose-a-friend.html`

### Legacy plan-shell / wrapper cluster confirmed
- generic `lesson-runner.html` (older Week 1–2 shell-era runner)
- `daily-lessons-v2.html`
- day-specific Week 2 storytelling wrappers tied to `daily-lessons-v2.html`
- day-specific Week 2 closing-circle wrappers tied to `daily-lessons-v2.html`
- `week3-centers.html` -> `center-choice.html`, then back to `week3-plan.html`
- `week4-centers.html` -> `center-choice.html`, then back to `week4-plan.html`
- `week5-centers.html` -> `center-choice.html`, then back to `week5-plan.html`

### Likely legacy / duplicate; verify remaining incoming links before removal
- `daily-lessons-fixed.html`
- `week5-read-aloud-v3.html`
- `community-meeting-week1-new.html`
- `week3-plan.html`, `week4-plan.html`, `week5-plan.html` and related old plan pages
- other `*-plan.html` pages associated with the old V2/plan-shell cluster

### Development / test files requiring classification
- `audio-test.html`
- `browser-test.html`
- `clean-up-block-test.html`
- `video-test.html`
- `week3-visual-test.html`
- visual/layout editor and override utilities that may or may not still be runtime dependencies; do not classify `visual-editor.html` or `lesson-visual-edit.js` as legacy without tracing because current lessons actively use them.

## Current Audit Checkpoint
**Continue classifying the old plan-shell cluster and development/test files, then move into the remaining state fixes.** The modern week-specific lesson runner path is now confirmed through Week 9.

### Next high-priority fixes
1. Add `eea-choose-friend-state-v1` to daily-reset handling. (`class-profile.js` portion is complete.)
2. Add true Center Choice persistent state and class separation.
3. Localize Star of the Day background immediately and replace Star artwork only after its exact local V6 equivalent is confirmed.
4. Replace stale 18-child fallbacks with canonical roster behavior.
5. Change attendance-unknown picker behavior so unknown does not mean everyone present.
6. Add read-only Home AM/PM indicator.
7. Rationalize Choose a Friend persistence out of the misleading `audio-fix` patch structure.
8. Finish legacy duplicate / development-file classification and remove or isolate files that are not part of authoritative V6.
9. Once the legacy cluster is mapped, decide whether its compatibility wrappers should remain, redirect into current flows, or be removed from V6.

## Continuity Rule
Do not restart the audit when a new chat begins. Resume from **Current Audit Checkpoint**. Revisit a completed area only when a later dependency forces it to be marked 🔁 Reopened.
