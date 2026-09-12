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
- 🗑️ Confirmed obsolete + removed
- 🔁 Reopened
- ⬜ Not yet audited

## Verified Completed Work
- 🔧 Fresh-install roster mismatch fixed: Attendance, Students, and Star use the canonical 20-child roster / IDs.
- 🔧 AM/PM class architecture added through `class-profile.js` and Teacher's Desk.
- 🔧 Existing classroom data remains the AM profile during migration; PM seeds a clean canonical roster.
- 🔧 Shared setup remains shared rather than needlessly duplicated.
- 🔧 Home now loads `class-profile.js` and shows a small read-only AM Class / PM Class indicator for the active profile.
- ✅ Attendance flow verified against the current roster and today's attendance state.
- ✅ Star engine verified: attendance-aware alphabetical rotation, pending absent Star behavior, and teacher override update the full Star state.
- ✅ Star Management uses the shared Star engine.
- 🔧 `star-of-the-day.html` now references the local V6 Home background and Star artwork directly rather than raw `v6-clean-build` URLs.
- ✅ Choose a Friend begins with the current Star when present.
- ✅ Center Choice begins with the current Star when present.
- 🔧 `eea-choose-friend-state-v1` is included in `class-profile.js`, so saved Choose a Friend rounds are isolated between AM and PM classes.
- 🔧 Center Choice now saves/restores same-day counts, picker queue, current child, center assignment history, undo state, and runtime closed-center state through `eea-center-choice-state-v1`.
- 🔧 `eea-center-choice-state-v1` is included in `class-profile.js`, so Center Choice progress is isolated between AM and PM classes.
- 🔧 Home and Teacher's Desk daily reset handling now explicitly clears `eea-choose-friend-state-v1` and `eea-center-choice-state-v1`; Teacher's Desk Clear Center Choices also clears the saved Center Choice state.
- 🔧 Choose a Friend and Center Choice no longer treat missing/stale attendance as if everyone is present.
- 🔧 Fresh direct entry to Choose a Friend / Center Choice now uses the canonical 20-child roster rather than behaviorally relying on old 18-child fallback lists.
- 🔧 Choose a Friend persistence/fixed-stick behavior now lives in `choose-a-friend-state.js`; the older `choose-a-friend-audio-fix.js` is only a compatibility loader.
- 🔧 Center Choice persistence/attendance repair now lives in `center-choice-state.js`; `name-audio-engine.js` is back to shared name-audio behavior plus a compatibility loader for the state helper.
- 🔧 Service-worker logic consolidated: `sw.js` is authoritative and `service-worker.js` imports it for compatibility.
- 🔧 Legacy `choose-friend.html` links are protected by a compatibility redirect to authoritative `choose-a-friend.html`.
- ✅ Backup & Restore collects all `eea-` localStorage keys, so class profiles and picker states are included automatically.
- ✅ Weeks 3–9 use the newer full-screen lesson-runner pattern and correctly route post-read-aloud to `choose-a-friend.html`.
- ✅ Week 8's `week8-sections.html` and Week 9's `week9-sections.html` are intentional consolidation, not duplicate implementations.

## Legacy Lesson Consolidation Completed
- 🔧 `daily-lessons-v2.html` no longer contains a competing lesson-plan implementation; it redirects to current `daily-lessons.html`.
- 🔧 generic `lesson-runner.html` no longer contains an older Week 1–2 runner implementation; it redirects to current `daily-lessons.html`.
- 🔧 `week5-plan.html` no longer contains a separate Week 5 Today’s Plan implementation; it redirects into current `daily-lessons.html?week=5`.
- 🔧 `community-meeting-week1-new.html` no longer contains an alternate Week 1 implementation; it redirects to the current day-specific Week 1 Community Meeting pages.
- ✅ `week3-plan.html` and `week4-plan.html` were already compatibility redirects into current `daily-lessons.html`.
- ✅ `calendar-management.html`, `curriculum-pacing.html`, `clean-up.html`, `read-aloud-week1-plan.html`, and `choose-friend.html` are intentional compatibility redirects/aliases.
- 🗑️ Old Week 6, Week 7, and Week 8 standalone plan screens were removed because current `daily-lessons.html` opens the current week runners directly.
- 🗑️ Old Week 3–5 Center wrapper pages were removed because current week runners no longer use those plan-shell detours.
- 🗑️ Ten day-specific Week 2 Storytelling / Closing Circle wrappers were removed; the current Week 2 runner uses one shared Storytelling page and one shared Closing Circle page for all five days.

## Confirmed Obsolete Files Removed — 23 Total
### Test / diagnostic pages
- 🗑️ `audio-test.html`
- 🗑️ `browser-test.html`
- 🗑️ `clean-up-block-test.html`
- 🗑️ `video-test.html`
- 🗑️ `week3-visual-test.html`

### Duplicate / legacy lesson pages
- 🗑️ `daily-lessons-fixed.html`
- 🗑️ `week5-read-aloud-v3.html`
- 🗑️ `week3-centers.html`
- 🗑️ `week4-centers.html`
- 🗑️ `week5-centers.html`
- 🗑️ `week6-plan.html`
- 🗑️ `week7-plan.html`
- 🗑️ `week8-plan.html`

### Obsolete Week 2 day-specific wrappers
- 🗑️ `closing-circle-week2-monday.html`
- 🗑️ `closing-circle-week2-tuesday.html`
- 🗑️ `closing-circle-week2-wednesday.html`
- 🗑️ `closing-circle-week2-thursday.html`
- 🗑️ `closing-circle-week2-friday.html`
- 🗑️ `storytelling-week2-monday.html`
- 🗑️ `storytelling-week2-tuesday.html`
- 🗑️ `storytelling-week2-wednesday.html`
- 🗑️ `storytelling-week2-thursday.html`
- 🗑️ `storytelling-week2-friday.html`

## Open Functional / State Findings
- ✅ No active picker behavior currently depends on the stale 18-name inline fallback arrays; the canonical roster helpers take control before a real round is used.
- 🔧 Week 1 and Week 2 shell-era sidebar Quick Tools still reference old filename `choose-friend.html`, but the compatibility redirect safely reaches `choose-a-friend.html`.

## Open Structural / Source-of-Truth Findings
- ⚠️ `choose-a-friend.html` and `center-choice.html` still physically contain old 18-name fallback arrays. These are now dead source clutter, not active classroom behavior; remove when those large inline pages are next rationalized rather than risking a layout rewrite solely for cleanup.
- ⚠️ `daily-lessons-v2.html`, `lesson-runner.html`, `week5-plan.html`, and `community-meeting-week1-new.html` are now compatibility-only shims. They contain no competing lesson logic; keep only while old-link protection is useful.
- ⚠️ Remaining layout/editor utilities still need final classification. Do not treat `visual-editor.html` or `lesson-visual-edit.js` as legacy because current lessons actively use them.

## Authoritative Runtime Confirmed
- `index.html`
- `manifest.webmanifest`
- `install.html`
- `sw.js`
- `class-profile.js`
- `attendance.html`
- `star-engine.js`
- `star-management.html`
- `star-of-the-day.html`
- `choose-a-friend.html`
- `choose-a-friend-state.js`
- `choose-a-friend-audio-fix.js` (compatibility loader only)
- `center-choice.html`
- `center-choice-state.js`
- `name-audio-engine.js`
- `teachers-desk.html`
- `daily-lessons.html`
- `calendar-management-v2.html`
- `clean-up-song.html`
- `lesson-runner-week1.html` through `lesson-runner-week9.html`
- `week5-read-aloud.html`
- `week8-sections.html`
- `week9-sections.html`
- `backup-restore.html`

## Current Audit Checkpoint
**Picker behavior/state is now functionally stabilized and ownership has been separated into correctly named helpers. The stale 18-name arrays are dead source clutter only. Continue the functional audit forward rather than reopening picker behavior.**

### Next Steps
1. Audit timer behavior and class-specific timer state.
2. Audit schedule / “What’s Next?” progress and AM/PM separation.
3. Audit Stay in Your Center timer / clean-up handoff.
4. Continue Calm Down, Movement, media links, and remaining Teacher Mode utilities.
5. Finish editor/utility classification opportunistically as those files are touched.

## Continuity Rule
Do not restart the audit when a new chat begins. Resume from **Current Audit Checkpoint**. Revisit a completed area only when a later dependency forces it to be marked 🔁 Reopened.
