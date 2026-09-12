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
- 🔧 `star-of-the-day.html` now references local V6 Home background and Star artwork directly rather than raw `v6-clean-build` URLs.
- ✅ Choose a Friend begins with the current Star when present.
- ✅ Center Choice begins with the current Star when present.
- 🔧 `eea-choose-friend-state-v1` is included in `class-profile.js`, so saved Choose a Friend rounds are isolated between AM and PM classes.
- 🔧 Center Choice now saves/restores same-day counts, picker queue, current child, center assignment history, undo state, and runtime closed-center state through `eea-center-choice-state-v1`.
- 🔧 `eea-center-choice-state-v1` is included in `class-profile.js`, so Center Choice progress is isolated between AM and PM classes.
- 🔧 Home and Teacher's Desk daily reset handling explicitly clears the saved Choose a Friend and Center Choice states.
- 🔧 Choose a Friend and Center Choice no longer treat missing/stale attendance as if everyone is present.
- 🔧 Fresh direct entry to Choose a Friend / Center Choice uses the canonical 20-child roster rather than behaviorally relying on old 18-child fallback lists.
- 🔧 Choose a Friend persistence/fixed-stick behavior lives in `choose-a-friend-state.js`; `choose-a-friend-audio-fix.js` is now only a compatibility loader.
- 🔧 Center Choice persistence/attendance repair lives in `center-choice-state.js`; `name-audio-engine.js` is back to shared name-audio behavior plus a compatibility loader.
- 🔧 `name-audio-engine.js` now reads `eea-app-settings`, so the Use Name Audio setting actually turns name audio on/off.
- 🔧 Service-worker logic consolidated: `sw.js` is authoritative and `service-worker.js` imports it for compatibility.
- 🔧 Legacy `choose-friend.html` links are protected by a compatibility redirect to authoritative `choose-a-friend.html`.
- ✅ Backup & Restore collects all `eea-` localStorage keys, so AM/PM class profiles, picker states, app settings, and other V6 state are included automatically.
- ✅ Weeks 3–9 use the newer full-screen lesson-runner pattern and correctly route post-read-aloud to `choose-a-friend.html`.
- ✅ Week 8's `week8-sections.html` and Week 9's `week9-sections.html` are intentional consolidation, not duplicate implementations.

## Timer / Schedule / Center-Stay Audit Completed
- 🔧 Full-screen `timer.html` persists selected duration, remaining time, running/paused status, and resumes correctly after navigation.
- 🔧 Timer now reads App Settings for default duration, Timer Sounds, and Auto-open Clean Up.
- 🔧 Timer's former root-level `../timer back.png` and `../timer front.png` dependencies were copied into `v6-test/assets/` as `timer-back.png` and `timer-front.png`; `timer.html` now uses those local V6 assets.
- ✅ Full-screen Timer hands off to `clean-up-song.html` when time expires when Auto-open Clean Up is enabled; when disabled, it remains on the completed Timer screen.
- 🔧 Home quick timer persists through `eea-home-timer-state` and resumes correctly after navigation.
- ✅ Full-screen Timer and Home quick-timer state are class-specific through the AM/PM profile system.
- ✅ Schedule configuration remains shared setup through `eea-schedule-config`.
- ✅ Daily schedule progress remains class-specific through `eea-schedule-progress` and resets with the daily lifecycle.
- 🔧 Home now preserves the fully completed schedule display after reload instead of bringing the last activity back.
- 🔧 `stay-in-your-center.html` has the intended default 5-minute timer with ±1 minute, Start, Pause, and Reset.
- 🔧 Stay-in-Center countdown persists after navigation and is isolated between AM and PM through `eea-center-stay-state-v1`.
- 🔧 Stay-in-Center restores hatch progress and automatically hands off to the Clean Up song when the egg finishes hatching.

## Calm Down / Movement / Media / Teacher Utilities Audit
- ✅ `calm-down.html` uses local V6 artwork/audio/navigation and has no accidental old-build dependency found in this pass.
- 🔧 `movement.html` no longer points to raw assets on the `v6-clean-build` branch.
- 🔧 The exact Eddie Movement PNG was reused from the old branch as `v6-test/assets/eddie-movement.png`, preserving the approved artwork without substitution.
- 🔧 Movement's background now uses local `assets/home/home-screen-background.png`.
- ✅ Movement's YouTube playback is an intentional external-media feature, not a legacy app dependency.
- ✅ `movement-song-library.html` is the authoritative teacher-managed movement library and stores teacher-created categories / YouTube video IDs locally.
- ✅ `media-management.html` is an intentional configuration hub: built-in defaults point to current V6 pages, while external URLs are only teacher-entered/tested resources.
- ✅ `backup-restore.html` is one current implementation and includes the entire `eea-` namespace plus custom visuals; no competing backup system found in this pass.
- 🔧 App Settings name-audio preference now controls the shared name-audio engine.
- 🔧 App Settings default Timer length, Timer Sounds, and Auto-open Clean Up preferences now control `timer.html`.
- ✅ Center Choice already honors `showPhotos` and `autoStay` from App Settings.

## Legacy Lesson Consolidation Completed
- 🔧 `daily-lessons-v2.html` redirects to current `daily-lessons.html`.
- 🔧 generic `lesson-runner.html` redirects to current `daily-lessons.html`.
- 🔧 `week5-plan.html` redirects into current `daily-lessons.html?week=5`.
- 🔧 `community-meeting-week1-new.html` redirects to the current day-specific Week 1 Community Meeting pages.
- ✅ `week3-plan.html` and `week4-plan.html` were already compatibility redirects into current `daily-lessons.html`.
- ✅ `calendar-management.html`, `curriculum-pacing.html`, `clean-up.html`, `read-aloud-week1-plan.html`, and `choose-friend.html` are intentional compatibility redirects/aliases.
- 🗑️ Old Week 6, Week 7, and Week 8 standalone plan screens removed.
- 🗑️ Old Week 3–5 Center wrapper pages removed.
- 🗑️ Ten day-specific Week 2 Storytelling / Closing Circle wrappers removed; Week 2 now uses shared pages.

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
- ✅ No active picker behavior depends on the stale 18-name inline fallback arrays; canonical roster helpers take control before a real round is used.
- 🔧 Week 1 and Week 2 shell-era sidebar Quick Tools still reference old filename `choose-friend.html`, but the compatibility redirect safely reaches `choose-a-friend.html`.
- ⚠️ Explicit Teacher's Desk daily reset does not yet remove `eea-center-stay-state-v1`; that state is date-scoped so it cannot leak into a new school day, but explicit reset cleanup should be added when Teacher's Desk is next touched.
- ⚠️ Remaining App Settings preferences still need a final cross-screen verification pass, especially `revealSounds`, `animations`, `lockOnHome`, and future/weather flags. Do not assume a visible toggle is wired everywhere until verified.

## Open Structural / Source-of-Truth Findings
- ⚠️ `choose-a-friend.html` and `center-choice.html` still physically contain old 18-name fallback arrays. These are dead source clutter, not active classroom behavior; remove when those large inline pages are next rationalized.
- ⚠️ `daily-lessons-v2.html`, `lesson-runner.html`, `week5-plan.html`, and `community-meeting-week1-new.html` are compatibility-only shims. Keep only while old-link protection is useful.
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
- `timer.html`
- `stay-in-your-center.html`
- `calm-down.html`
- `movement.html`
- `movement-song-library.html`
- `media-management.html`
- `daily-lessons.html`
- `schedule-management.html`
- `calendar-management-v2.html`
- `clean-up-song.html`
- `lesson-runner-week1.html` through `lesson-runner-week9.html`
- `week5-read-aloud.html`
- `week8-sections.html`
- `week9-sections.html`
- `backup-restore.html`
- `app-settings.html`

## Current Audit Checkpoint
**Calm Down, Movement, Media/Links, Movement Song Library, Backup & Restore, and the major App Settings connections are audited. Movement and Timer are now self-contained for the legacy assets identified in these passes. Do not reopen these areas unless a later dependency forces it. Continue with the remaining Teacher Mode/settings verification and editor/utility classification.**

### Next Steps
1. Verify remaining App Settings behavior across screens (`revealSounds`, `animations`, `lockOnHome`; future/weather toggles can remain explicitly future-only if labeled that way).
2. Add `eea-center-stay-state-v1` to explicit Teacher's Desk daily/end-of-day reset cleanup.
3. Finish classification of `visual-editor.html`, `lesson-visual-edit.js`, Now Window/settings utilities, and any remaining editor/helper files.
4. Run a final structural sweep for old branch/raw asset/root escapes after the editor classification.
5. Then begin fresh-install / migration / offline-cache validation of the consolidated V6.

## Continuity Rule
Do not restart the audit when a new chat begins. Resume from **Current Audit Checkpoint**. Revisit a completed area only when a later dependency forces it to be marked 🔁 Reopened.
