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
- 🔗 Intentional external / compatibility dependency
- 🗑️ Confirmed obsolete + removed
- 🔁 Reopened
- ⬜ Not yet audited

## Verified Completed Work
- 🔧 Fresh-install roster mismatch fixed: Attendance, Students, and Star use the canonical 20-child roster / IDs.
- 🔧 AM/PM class architecture added through `class-profile.js` and Teacher's Desk.
- 🔧 Existing pre-profile classroom data remains the AM profile during migration; PM seeds a clean canonical roster.
- 🔧 Shared setup remains shared rather than needlessly duplicated.
- 🔧 Movement recent-song history (`eea-movement-history-v1`) is class-specific so AM and PM do not influence one another's song-avoidance history.
- 🔧 Home loads `class-profile.js` and shows a small read-only AM Class / PM Class indicator for the active profile.
- ✅ Attendance flow verified against current roster and today's attendance state.
- ✅ Star engine verified: attendance-aware alphabetical rotation, pending absent-Star behavior, and teacher override update the full Star state.
- ✅ Star Management uses the shared Star engine.
- 🔧 `star-of-the-day.html` uses local V6 Home background and Star artwork rather than raw `v6-clean-build` URLs.
- ✅ Choose a Friend begins with the current Star when present.
- ✅ Center Choice begins with the current Star when present.
- 🔧 Choose a Friend and Center Choice saved round state are isolated between AM and PM.
- 🔧 Choose a Friend and Center Choice no longer treat missing/stale attendance as if everyone is present.
- 🔧 Fresh direct entry to Choose a Friend / Center Choice uses canonical 20-child behavior rather than relying on old 18-child fallback arrays.
- 🔧 Choose a Friend persistence/fixed-stick behavior lives in `choose-a-friend-state.js`; `choose-a-friend-audio-fix.js` is compatibility loading only.
- 🔧 Center Choice persistence/attendance repair lives in `center-choice-state.js`; `name-audio-engine.js` remains the shared name-audio layer.
- 🔧 `name-audio-engine.js` reads `eea-app-settings`, so Use Name Audio actually turns name audio on/off.
- 🔧 Service-worker logic consolidated: `sw.js` is authoritative and `service-worker.js` imports it for compatibility.
- 🔧 Legacy `choose-friend.html` links are protected by a compatibility redirect to authoritative `choose-a-friend.html`.
- ✅ Backup & Restore collects all `eea-` localStorage keys, so AM/PM profiles, picker states, app settings, and other V6 state are included automatically.
- ✅ Weeks 3–9 use the current full-screen lesson-runner pattern and correctly route post-read-aloud to `choose-a-friend.html`.
- ✅ Week 8 `week8-sections.html` and Week 9 `week9-sections.html` are intentional consolidated implementations, not duplicates.

## Timer / Schedule / Center-Stay Audit Completed
- 🔧 Full-screen `timer.html` persists selected duration, remaining time, running/paused status, and resumes correctly after navigation.
- 🔧 Timer reads App Settings for default duration, Timer Sounds, and Auto-open Clean Up.
- 🔧 Timer's former repo-root image dependencies were copied into `v6-test/assets/` as `timer-back.png` and `timer-front.png`; Timer now uses those local V6 assets.
- ✅ Full-screen Timer hands off to `clean-up-song.html` on expiry when Auto-open Clean Up is enabled; when disabled, it remains on the completed Timer screen.
- 🔧 Home quick timer persists through `eea-home-timer-state` and resumes correctly after navigation.
- ✅ Full-screen Timer and Home quick-timer state are class-specific through AM/PM profiles.
- ✅ Schedule configuration remains shared setup through `eea-schedule-config`.
- ✅ Daily schedule progress remains class-specific through `eea-schedule-progress` and resets with the daily lifecycle.
- 🔧 Home preserves the completed-schedule display after reload instead of reviving the last activity.
- 🔧 `stay-in-your-center.html` has the intended default 5-minute timer with ±1 minute, Start, Pause, and Reset.
- 🔧 Stay-in-Center countdown persists after navigation and is isolated between AM and PM through `eea-center-stay-state-v1`.
- 🔧 Stay-in-Center restores hatch progress and hands off to Clean Up when the egg finishes hatching.
- 🔧 Teacher's Desk Reset Daily Activities and End of Day explicitly clear `eea-center-stay-state-v1`.

## Calm Down / Movement / Media / Teacher Utilities Audit
- ✅ `calm-down.html` uses local V6 artwork/audio/navigation and no accidental old-build dependency was found.
- 🔧 `movement.html` no longer points to raw assets on the `v6-clean-build` branch.
- 🔧 The exact Eddie Movement PNG was reused as `v6-test/assets/eddie-movement.png`, preserving approved artwork without substitution.
- 🔧 Movement background uses local `assets/home/home-screen-background.png`.
- ✅ Movement YouTube playback is an intentional external-media feature, not a legacy app dependency.
- ✅ `movement-song-library.html` is the authoritative teacher-managed movement library and stores categories / YouTube video IDs locally.
- ✅ `media-management.html` is an intentional configuration hub: built-in defaults point to current V6 pages, while external URLs are teacher-entered resources.
- ✅ `backup-restore.html` is the single current backup implementation and includes the full `eea-` namespace plus custom visuals.
- 🗑️ Abandoned secondary backup helper `classroom-protection.js` was removed after confirming nothing current calls its `EEAProtection` API or metadata/event keys.
- 🔧 Name Audio setting controls the shared name-audio engine.
- 🔧 Timer length, Timer Sounds, and Auto-open Clean Up settings control `timer.html`.
- ✅ Center Choice honors `showPhotos` and `autoStay`.
- ✅ Star of the Day honors `revealSounds` for its reveal chime.
- 🔧 Center Choice selection/full-center sounds honor the same `revealSounds` preference.
- 🔧 `lockOnHome` clears the Teacher Mode unlock session when returning Home, requiring the PIN again when enabled.
- 🔧 The unwired `animations` toggle was removed from App Settings instead of presenting a preference that did nothing. The current gentle motion is now described as part of the classroom experience.
- ✅ `liveWeather`, `weatherLocation`, and `weatherScenes` remain explicitly labeled future-ready/future integration; they are not treated as completed weather features.

## Editor / Visual Utility Classification Completed
- ✅ `now-window-settings.html` is the authoritative Teacher utility for Home Now illustrations, popup pictures, and popup audio.
- ✅ `visual-editor.html` is the authoritative Teacher Visual Editor using the larger IndexedDB visual store.
- ✅ `visual-store.js` is the authoritative visual storage layer, including migration from the old localStorage visual key.
- ✅ `lesson-visual-edit.js` is the current lesson helper that identifies editable visuals, loads overrides, and routes edits through `visual-editor.html`.
- ✅ Backup & Restore includes the visual store.
- 🗑️ Removed development-only visual calibration tools: `basket-layout-editor.html`, `community-meeting-image-editor.html`, `community-meeting-image-editor.js`, Tuesday/Wednesday/Thursday/Friday Community Meeting image editors, and `nervous-image-editor.html`.
- ✅ `bombaloo-source-info.json` and `bombaloo-upload-note.txt` are retained as provenance/build notes, not runtime screens.

## Install / Offline Audit
- ✅ `install.html` registers authoritative `sw.js`; `manifest.webmanifest` starts inside the `v6-test` scope.
- 🔧 Home/classroom runtime now also registers `./sw.js`, so normal Companion use receives service-worker installation/updates even if the special Install page was not used first.
- 🔧 Previous service-worker behavior was insufficient for reliable offline use because only a tiny shell was pre-cached and HTML was effectively network-only.
- 🔧 Current cache is `eea-companion-v7`.
- 🔧 `sw.js` pre-caches main classroom/Teacher screens, Week 1–9 lesson runners, key shared section pages, runtime helpers, and core app assets.
- 🔧 During install, the worker scans cached V6 text/HTML/JS for local quoted `assets/...` references and pre-caches those automatically, while intentionally skipping large MP4/WebM/MOV files from mandatory installation.
- 🔧 Same-origin HTML is network-first with cache fallback; successful online page loads are retained for later offline use.
- 🔧 Offline cache matching ignores query strings so routes such as `daily-lessons.html?week=5` can use the cached base page.
- 🔧 Same-origin non-HTML resources use cache-first with network fill.
- ⚠️ Source-level offline logic is substantially stronger, but a true installed-browser/SmartBoard offline test has not yet been performed. Do not label install fully device-validated until that test is completed.

## Structural Sweep
- ✅ Known `v6-clean-build` dependencies in Star and Movement were localized into V6.
- ✅ Known repo-root Timer image escapes were localized into V6.
- ✅ GitHub code-search passes returned no matches for `v6-clean-build`, the repo raw-GitHub asset prefix, or `../` under `v6-test`; GitHub marked those searches incomplete, so runtime validation remains the final guard.
- ✅ Current Week 6 runner explicitly uses `week6-intro-centers.html`, `week6-small-groups.html`, `week6-building-blocks.html`, and `week6-storytelling.html`; those are active and retained.
- ✅ Current Week 7 runner explicitly uses `week7-intro-centers.html`, `week7-small-groups.html`, `week7-building-blocks.html`, and `week7-storytelling.html`; those are active and retained.
- 🗑️ Removed unreferenced alternate lesson/wrapper pages that pointed back to obsolete plan screens: `what-riley-wore-read-3-plan.html`, `week3-lessons.html`, `week8-lessons.html`, `week6-centers.html`, and `week7-centers.html`.
- ✅ No dangling references were found to the deleted `week6-plan.html`, `week7-plan.html`, `week8-plan.html`, `week3-lessons.html`, or `week8-lessons.html` in the checks performed after removal.

## Legacy Lesson Consolidation Completed
- 🔧 `daily-lessons-v2.html` redirects to current `daily-lessons.html`.
- 🔧 generic `lesson-runner.html` redirects to current `daily-lessons.html`.
- 🔧 `week5-plan.html` redirects into current `daily-lessons.html?week=5`.
- 🔧 `community-meeting-week1-new.html` redirects to current day-specific Week 1 Community Meeting pages.
- ✅ `week3-plan.html` and `week4-plan.html` are compatibility redirects into current `daily-lessons.html`.
- ✅ `calendar-management.html`, `curriculum-pacing.html`, `clean-up.html`, `read-aloud-week1-plan.html`, and `choose-friend.html` are intentional compatibility redirects/aliases pending final keep/delete decision.
- 🗑️ Old Week 6, Week 7, and Week 8 standalone plan screens removed.
- 🗑️ Old Week 3–5 Center wrapper pages removed.
- 🗑️ Ten day-specific Week 2 Storytelling / Closing Circle wrappers removed; Week 2 uses shared pages.

## Confirmed Obsolete Files Removed — 37 Total
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
- 🗑️ `what-riley-wore-read-3-plan.html`
- 🗑️ `week3-lessons.html`
- 🗑️ `week8-lessons.html`
- 🗑️ `week6-centers.html`
- 🗑️ `week7-centers.html`

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

### Obsolete developer/editor utilities
- 🗑️ `basket-layout-editor.html`
- 🗑️ `community-meeting-image-editor.html`
- 🗑️ `community-meeting-image-editor.js`
- 🗑️ `community-meeting-tuesday-image-editor.html`
- 🗑️ `community-meeting-wednesday-image-editor.html`
- 🗑️ `community-meeting-thursday-image-editor.html`
- 🗑️ `community-meeting-friday-image-editor.html`
- 🗑️ `nervous-image-editor.html`

### Abandoned duplicate infrastructure
- 🗑️ `classroom-protection.js`

## Open Functional / State Findings
- ✅ No active picker behavior depends on the stale 18-name inline fallback arrays; canonical roster helpers take control before a real round is used.
- 🔧 Week 1 and Week 2 shell-era sidebar Quick Tools still reference old filename `choose-friend.html`, but the compatibility redirect safely reaches `choose-a-friend.html`.
- ⚠️ True browser/device fresh-install, migration, and offline behavior still need live validation; source-level checks cannot substitute for that final runtime test.

## Open Structural / Source-of-Truth Findings
- ⚠️ `choose-a-friend.html` and `center-choice.html` still physically contain old 18-name fallback arrays. They are dead source clutter, not active classroom behavior; final cleanup should replace/remove them without disturbing the large inline pages.
- ⚠️ Compatibility-only shims remain. Keep only those still useful for protecting real old links after the final reference pass.

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
- `now-window-settings.html`
- `visual-editor.html`
- `visual-store.js`
- `lesson-visual-edit.js`

## Current Audit Checkpoint
**Source-level consolidation is now deep into final cleanup: major classroom flows, Teacher settings, editors, backup, AM/PM state, structural dependencies, and offline strategy have been audited and repaired. Thirty-seven obsolete files have been removed. Do not reopen completed feature audits. Next work is the final compatibility/fallback cleanup plus real installed-browser fresh-install/migration/offline validation when a deploy/browser target is available.**

### Next Steps
1. Final reference pass on compatibility shims; keep only those protecting genuine current/legacy links.
2. Replace/remove the dead 18-name fallback source clutter in `choose-a-friend.html` and `center-choice.html` without altering active behavior.
3. Perform real fresh-install browser test: canonical 20-child roster, AM default, clean PM profile, Home indicator, Attendance → Star → Choose a Friend → Center Choice.
4. Perform existing-data migration test: existing classroom remains AM, PM starts clean, switch back restores AM exactly.
5. Perform installed/offline test after service-worker activation: Home, Attendance, Star, pickers, Timer, Teacher's Desk, Daily Lessons/week runner, Calm Down, and Clean Up.
6. Only after those runtime tests, declare V6 the production source of truth.

## Continuity Rule
Do not restart the audit when a new chat begins. Resume from **Current Audit Checkpoint**. Revisit a completed area only when a later dependency forces it to be marked 🔁 Reopened.
