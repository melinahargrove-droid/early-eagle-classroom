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
- ✅ Attendance flow verified against the current roster and today's attendance state.
- ✅ Star engine verified: attendance-aware alphabetical rotation, pending absent Star behavior, and teacher override update the full Star state.
- ✅ Star Management uses the shared Star engine.
- ✅ Choose a Friend begins with the current Star when present.
- ✅ Center Choice begins with the current Star when present.
- 🔧 `eea-choose-friend-state-v1` is included in `class-profile.js`, so saved Choose a Friend rounds are isolated between AM and PM classes.
- 🔧 Center Choice now saves/restores same-day counts, picker queue, current child, center assignment history, undo state, and runtime closed-center state through `eea-center-choice-state-v1`.
- 🔧 `eea-center-choice-state-v1` is included in `class-profile.js`, so Center Choice progress is isolated between AM and PM classes.
- 🔧 Choose a Friend and Center Choice no longer treat missing/stale attendance as if everyone is present.
- 🔧 Fresh direct entry to Choose a Friend / Center Choice now uses the canonical 20-child roster rather than behaviorally relying on old 18-child fallback lists.
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

## Confirmed Obsolete Files Removed
- 🗑️ `audio-test.html`
- 🗑️ `browser-test.html`
- 🗑️ `clean-up-block-test.html`
- 🗑️ `video-test.html`
- 🗑️ `week3-visual-test.html`
- 🗑️ `daily-lessons-fixed.html`
- 🗑️ `week5-read-aloud-v3.html`

## Open Functional / State Findings
- ⚠️ Home has no read-only AM/PM active-class indicator.
- ⚠️ Home / Teacher's Desk daily-reset lists do not explicitly remove `eea-choose-friend-state-v1` or `eea-center-choice-state-v1`. Both states are date-scoped, so this is cleanup rather than an active cross-day failure.
- ⚠️ Original Choose a Friend and Center Choice HTML still contain old 18-name fallback arrays even though runtime helpers now replace the behavior with the canonical roster.
- 🔧 Week 1 and Week 2 shell-era sidebar Quick Tools still reference old filename `choose-friend.html`, but the compatibility redirect safely reaches `choose-a-friend.html`.

## Open Structural / Source-of-Truth Findings
- ⚠️ `star-of-the-day.html` source still contains raw `v6-clean-build` GitHub URLs. `star-engine.js` already rewrites those exact references at runtime to local V6 assets, but the source should be cleaned to use local V6 paths directly.
- ⚠️ Choose a Friend persistence / fixed-stick logic lives in misleadingly named `choose-a-friend-audio-fix.js`.
- ⚠️ Center Choice persistence and attendance repair currently live as a pathname-specific extension inside `name-audio-engine.js`.
- ⚠️ Day-specific Week 2 wrappers tied to the former V2 lesson-plan flow still need a keep/delete decision.
- ⚠️ `week3-centers.html`, `week4-centers.html`, and `week5-centers.html` are old plan-shell wrappers around authoritative `center-choice.html`; decide whether they are still needed for compatibility.
- ⚠️ `daily-lessons-v2.html`, `lesson-runner.html`, `week5-plan.html`, and `community-meeting-week1-new.html` are now compatibility-only shims. Once incoming-link checks are complete, decide whether to keep the shim or delete the file entirely.
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
- `choose-a-friend-audio-fix.js` (runtime helper; ownership/name needs later cleanup)
- `center-choice.html`
- `name-audio-engine.js` (runtime shared audio + current Center Choice state shim)
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
**Legacy lesson implementation consolidation is complete. Seven confirmed obsolete files have been removed. Continue the cleanup by deciding which remaining compatibility wrappers can now be deleted, then return to remaining user-facing fixes.**

### Next Steps
1. Check incoming links for the remaining old compatibility wrappers and delete the ones that no current V6 route needs.
2. Add a read-only Home AM/PM active-class indicator.
3. Replace Star of the Day source URLs with direct local V6 asset paths.
4. Add picker state keys to explicit daily-reset handling.
5. Remove dead embedded 18-child fallback arrays when the picker pages are rationalized.
6. Move picker state logic into clearly named helpers rather than audio-named files.
7. Finish editor/utility classification and remove anything else proven non-runtime.
8. Continue full functional audit only after this cleanup section is closed.

## Continuity Rule
Do not restart the audit when a new chat begins. Resume from **Current Audit Checkpoint**. Revisit a completed area only when a later dependency forces it to be marked 🔁 Reopened.
