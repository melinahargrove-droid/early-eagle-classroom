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
- 🔧 `eea-choose-friend-state-v1` is included in `class-profile.js`, so saved Choose a Friend rounds are isolated between AM and PM classes.
- 🔧 Center Choice now saves/restores same-day counts, picker queue, current child, center assignment history, undo state, and runtime closed-center state through `eea-center-choice-state-v1`.
- 🔧 `eea-center-choice-state-v1` is included in `class-profile.js`, so Center Choice progress is isolated between AM and PM classes.
- 🔧 Choose a Friend and Center Choice no longer treat missing/stale attendance as if everyone is present; unknown attendance produces no eligible picker queue.
- 🔧 Fresh direct entry to Choose a Friend / Center Choice now seeds and uses the canonical 20-child roster instead of behaviorally relying on their old embedded 18-child fallback lists.
- 🔧 Service-worker logic consolidated: `sw.js` is authoritative and `service-worker.js` is now a compatibility entry that imports `sw.js` instead of maintaining a second cache implementation.
- 🔧 Legacy `choose-friend.html` links are protected by a compatibility redirect to authoritative `choose-a-friend.html`, preserving query/hash parameters.
- ✅ Backup & Restore collects all `eea-` localStorage keys, so class profile objects and the new picker state keys are included automatically.
- ✅ Weeks 3–9 use the newer full-screen lesson-runner pattern and correctly route post-read-aloud to `choose-a-friend.html`.
- ✅ Week 8's shared `week8-sections.html` and Week 9's shared `week9-sections.html` are intentional section consolidation, not duplicate implementations.

## Open Functional / State Findings
- ⚠️ Home has no read-only AM/PM active-class indicator.
- ⚠️ Home / Teacher's Desk daily-reset lists do not explicitly remove the actual `eea-choose-friend-state-v1` or new `eea-center-choice-state-v1` keys. Both saved states are date-scoped and will not restore across dates, so this is cleanup rather than a current cross-day behavior failure.
- ⚠️ The original Choose a Friend and Center Choice HTML source still contains old 18-name fallback arrays, although the loaded helpers now replace fresh fallback behavior with the canonical 20-child roster. Remove the dead arrays when those large pages are next rationalized.
- 🔧 Week 1 and Week 2 shell-era sidebar Quick Tools still reference old filename `choose-friend.html`, but the compatibility redirect now sends those links to authoritative `choose-a-friend.html`. Direct runner cleanup can wait until the older shell code is rationalized.

## Structural / Source-of-Truth Findings
- ⚠️ `star-of-the-day.html` still contains raw GitHub URLs under `v6-clean-build`, but `star-engine.js` already maps both exact references at runtime to local V6 assets: the background to `assets/home/home-screen-background.png` and the Star artwork to `assets/home/star-of-the-day.png`. Source cleanup remains desirable because the browser can begin the legacy request before the script rewrites it, but the exact local equivalents are now confirmed.
- ⚠️ Choose a Friend core persistence / fixed-stick behavior still lives inside a misleading file named `choose-a-friend-audio-fix.js`. It now also owns canonical roster and attendance-eligibility repair, increasing the need to rename/rationalize this helper later.
- ⚠️ Center Choice persistence and attendance repair currently live as a pathname-specific extension inside `name-audio-engine.js`. This avoids rewriting the large visual page safely, but should eventually be split into a clearly named shared picker/state helper.
- 🔧 `sw.js` is the single authoritative service-worker implementation; `service-worker.js` is compatibility-only.
- ✅ `manifest.webmanifest` starts and scopes the installed app to `./index.html` / `./` inside V6.
- ✅ `calendar-management.html` is an intentional compatibility redirect to `calendar-management-v2.html` rather than a competing implementation.
- ✅ `curriculum-pacing.html` is an intentional compatibility redirect into the current calendar-management/pacing system.
- ✅ `clean-up.html` is an intentional compatibility redirect to `clean-up-song.html`.
- ✅ `read-aloud-week1-plan.html` is a compatibility redirect to authoritative `week1-read-aloud.html`, preserving the selected day.
- ⚠️ `daily-lessons.html` is the active Home-routed lesson overview; `daily-lessons-v2.html` and `daily-lessons-fixed.html` are older parallel implementations.
- 🔗 Day-specific Week 2 wrappers such as `closing-circle-week2-monday.html` and `storytelling-week2-monday.html` explicitly route back to legacy `daily-lessons-v2.html`; classify this family with the old V2 lesson-plan cluster rather than current Week 2 runtime.
- 🔗 `week3-centers.html`, `week4-centers.html`, and `week5-centers.html` are old plan-shell wrappers around authoritative `center-choice.html`.
- ✅ `week3-plan.html` and `week4-plan.html` are compatibility redirects into current `daily-lessons.html`, not parallel implementations.
- 🔗 `week5-plan.html` is still a full standalone Today’s Plan implementation with its own routing table; unlike Week 3–4 plan pages, it is a genuine parallel/legacy UI.
- 🔗 Generic `lesson-runner.html` is an older Week 1–2 shell-era runner with stale tooling and older lesson mappings; current daily lessons route to week-specific runners instead.
- ⚠️ Week 5's active lesson runner loads `week5-read-aloud.html`; `week5-read-aloud-v3.html` is a parallel older implementation unless another active route is found.
- ⚠️ `community-meeting-week1-new.html` is not used by the current Week 1 lesson runner; Week 1 uses day-specific Community Meeting files instead. Treat `-new` as legacy/alternate unless another active route is found.
- ✅ `audio-test.html`, `browser-test.html`, `clean-up-block-test.html`, `video-test.html`, and `week3-visual-test.html` are development/diagnostic pages, not authoritative classroom runtime. `browser-test.html` intentionally unregisters V6 service workers and clears V6 caches before reopening lessons, so it must remain outside normal app navigation.

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
- `star-of-the-day.html` (runtime; source still contains legacy URLs but runtime localizer maps them to V6 assets)
- `choose-a-friend.html`
- `choose-a-friend-audio-fix.js` (runtime helper; name/ownership needs later cleanup)
- `center-choice.html`
- `name-audio-engine.js` (runtime shared audio + current Center Choice state shim)
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
- `week3-plan.html` -> current `daily-lessons.html?week=3`
- `week4-plan.html` -> current `daily-lessons.html?week=4`

### Legacy plan-shell / wrapper cluster confirmed
- generic `lesson-runner.html` (older Week 1–2 shell-era runner)
- `daily-lessons-v2.html`
- `week5-plan.html` (full parallel Today’s Plan implementation)
- day-specific Week 2 storytelling wrappers tied to `daily-lessons-v2.html`
- day-specific Week 2 closing-circle wrappers tied to `daily-lessons-v2.html`
- `week3-centers.html` -> `center-choice.html`, then back to `week3-plan.html`
- `week4-centers.html` -> `center-choice.html`, then back to `week4-plan.html`
- `week5-centers.html` -> `center-choice.html`, then back to legacy `week5-plan.html`

### Likely legacy / duplicate; verify remaining incoming links before removal
- `daily-lessons-fixed.html`
- `week5-read-aloud-v3.html`
- `community-meeting-week1-new.html`
- other old `*-plan.html` pages associated with the V2/plan-shell cluster

### Development / diagnostic only
- `audio-test.html`
- `browser-test.html`
- `clean-up-block-test.html`
- `video-test.html`
- `week3-visual-test.html`

### Editors / utilities still requiring dependency classification
- visual/layout editor and override utilities; do not classify `visual-editor.html` or `lesson-visual-edit.js` as legacy because current lessons actively use them.

## Current Audit Checkpoint
**Main week-runner and picker-state audits are complete enough to move from inventory into remaining user-facing fixes.** Next prioritize Home class visibility, source-level Star localization, explicit reset-key cleanup, then rationalize helper ownership and legacy files.

### Next high-priority fixes
1. Add read-only Home AM/PM active-class indicator.
2. Clean Star of the Day source URLs to use the already-confirmed local V6 background and Star asset directly.
3. Add `eea-choose-friend-state-v1` and `eea-center-choice-state-v1` to explicit daily-reset handling, even though both states are already date-scoped.
4. Remove dead embedded 18-child fallback arrays when the large picker pages are next edited.
5. Rationalize Choose a Friend state logic out of the misleading `audio-fix` helper and Center Choice state logic out of the audio helper into clearly named picker/state modules.
6. Finish remaining legacy duplicate/editor classification and remove or isolate files that are not part of authoritative V6.
7. Decide whether legacy plan-shell compatibility wrappers should remain, redirect into current flows, or be removed from V6.

## Continuity Rule
Do not restart the audit when a new chat begins. Resume from **Current Audit Checkpoint**. Revisit a completed area only when a later dependency forces it to be marked 🔁 Reopened.
