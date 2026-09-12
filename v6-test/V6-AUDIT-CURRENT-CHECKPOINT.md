# EEA Classroom Companion V6 — Current Audit Checkpoint

**Updated:** 2026-09-12

## Continuity instruction
This is the authoritative short handoff for the next audit chat. **Do not restart the V6 audit. Do not re-audit completed sections unless a later finding explicitly reopens them.** Read `V6-AUDIT-MASTER.md` for the long history, then resume from **NEXT** below.

## Audit objective
Finish `v6-test` as the one authoritative, self-contained EEA Classroom Companion. It should not depend accidentally on old builds, duplicate implementations, stale files, or incompatible state. AM/PM class state must stay isolated where appropriate, shared teacher setup must stay shared, and the finished app must survive fresh install, migration, packaging, and offline use.

## Major work completed before this checkpoint
- AM/PM profile architecture implemented and audited.
- Home shows a read-only AM/PM indicator.
- Attendance, Star, Choose a Friend, and Center Choice use the canonical 20-child model at runtime.
- Choose a Friend and Center Choice persistence are class-specific.
- Both Choose a Friend and Center Choice **begin with the current present Star**, then continue through the other present children.
- Timer, Home quick timer, schedule progress, Stay in Your Center, Movement history, lesson completion/resume state, and other daily class state have been audited for AM/PM separation.
- Stay in Your Center now supports Start/Pause/Reset, persistence, hatch completion, and Clean Up handoff.
- Timer settings, Name Audio, Celebration/Reveal Sounds, Lock on Home, Show Photos, and Auto-Stay behavior were wired/verified; the fake Animations setting was removed.
- Star, Movement, and Timer legacy artwork dependencies were localized into `v6-test`.
- Structural cleanup removed dozens of obsolete/test/duplicate files; remaining compatibility pages are intentional or awaiting final keep/delete review.
- Service worker is authoritative through `sw.js`; offline behavior was expanded substantially.
- Home now registers the service worker, not only `install.html`.
- PWA 192x192 and 512x512 icons were generated from the existing approved SVG; Home advertises the manifest.
- Windows packaging uses current `v6-test`; legacy asset fetching is conditional rather than unconditional. Latest checked Windows build completed successfully through packaging and artifact upload.
- Backup & Restore captures the entire `eea-` namespace, including both AM/PM profiles and active-class state.
- `classroom-protection.js` was restored after Students was found to reference a missing protection helper; it is included in the offline shell.
- Week 1–9 runner dependencies and compatibility routes were added to offline coverage.
- Missing Week 6/7/8 plan-return aliases were restored as compatibility redirects to the authoritative Daily Lessons flow.
- A repeatable GitHub Actions static audit was added (`Audit V6 Static App`). Latest checked run is GREEN: 144 V6 HTML/JS/CSS files scanned, 107 static local HTML destinations, **zero missing local references, zero offline-cache warnings**, and core JavaScript syntax checks passed.
- Current service-worker cache after the latest compatibility/offline work is `eea-companion-v12`.

## Important corrected source-of-truth rules verified
- Choose a Friend starts with the current Star of the Day when the Star is present.
- Center Choice also starts with the current Star of the Day when the Star is present.
- Star rotation is alphabetical.
- If the scheduled Star is absent, that child is held pending and the next present eligible child becomes Star.
- Once today's Star has been resolved/substituted, a late-arriving originally scheduled child should **not reclaim Star that day**.

## Open / intentionally unfinished items
- `choose-a-friend.html` and `center-choice.html` still physically contain old 18-name fallback arrays. Runtime helpers replace/override that behavior with the canonical 20-child roster, so this is source clutter rather than an active classroom bug. Clean it only when it can be done without destabilizing the large inline pages.
- Final compatibility-shim keep/delete review is still pending.
- A true installed-browser/SmartBoard fresh-install + migration + offline smoke test is still required before declaring V6 production source of truth.

## EXACT STOPPING POINT
We had just moved into the final **Star → Choose a Friend → Center Choice behavior validation**.

Already verified in this pass:
1. `choose-a-friend-state.js` builds a fresh queue as **Star first, then shuffled present classmates**.
2. `center-choice.html` `refillFriendQueue()` also builds **Star first, then shuffled present classmates**.
3. `star-engine.js` sorts the roster alphabetically, places absent scheduled Stars into `pendingIds`, chooses the next present eligible child, and does not let a late arrival reclaim Star after today's Star has already been resolved.

### NEXT — resume here, not earlier
**Finish the Star morning attendance-date edge case.** `star-engine.js` reads `eea-attendance-present`, but its `presentIds()` function does not itself check `eea-attendance-date`. Determine whether `EEAStar.resolveToday()` can run before today's Attendance flow has refreshed/reset yesterday's attendance list. If yes, fix it so stale prior-day attendance can never influence today's Star. If no, document why the lifecycle guarantees safety.

After that:
1. Finish remaining Star lifecycle edge cases only if not already covered.
2. Continue forward through any remaining behavior validation; do not reopen completed Home/Timer/Movement/etc. sections without a dependency reason.
3. Final compatibility/fallback cleanup.
4. Real fresh-install test: canonical 20 roster, AM default, clean PM, Home indicator, Attendance → Star → Choose a Friend → Center Choice.
5. Existing-data migration test: existing classroom remains AM, PM starts clean, switching back restores AM exactly.
6. Installed/offline smoke test: Home, Attendance, Star, pickers, Timer, Teacher's Desk, Daily Lessons/week runner, Calm Down, Clean Up.
7. Only after runtime tests pass, declare `v6-test` the production/source-of-truth build.
