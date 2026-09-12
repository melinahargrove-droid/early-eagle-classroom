# EEA Classroom Companion V6 — Current Audit Checkpoint

**Updated:** 2026-09-12

## Continuity instruction
This is the authoritative short handoff for the next audit chat. **Do not restart the V6 audit. Do not re-audit completed sections unless a later finding explicitly reopens them.** Read `V6-AUDIT-MASTER.md` only for long-history detail, then resume from **NEXT** below.

## Audit objective
Finish `v6-test` as the one authoritative, self-contained EEA Classroom Companion. It should not depend accidentally on old builds, duplicate implementations, stale files, or incompatible state. AM/PM class state must stay isolated where appropriate, shared teacher setup must stay shared, and the finished app must survive fresh install, migration, packaging, and offline use.

## Major completed work
- AM/PM profile architecture implemented and audited.
- Home shows a read-only AM/PM indicator.
- Choose a Friend and Center Choice saved rounds are class-specific and both begin with the current present Star.
- Timer, Home quick timer, schedule progress, Stay in Your Center, Movement history, lesson completion/resume, and other daily class state were audited for AM/PM separation.
- Stay in Your Center supports Start/Pause/Reset, persistence, hatch completion, and Clean Up handoff.
- Timer settings, Name Audio, Celebration/Reveal Sounds, Lock on Home, Show Photos, and Auto-Stay were wired/verified; the fake Animations setting was removed.
- Star, Movement, and Timer legacy artwork dependencies were localized into `v6-test`.
- Structural cleanup removed dozens of obsolete/test/duplicate files.
- Service worker is authoritative through `sw.js`; Home also registers it.
- PWA 192x192 and 512x512 icons were generated from the approved SVG; Home advertises the manifest.
- Windows packaging uses current `v6-test`; latest checked Windows build completed successfully through artifact upload.
- Backup & Restore captures the full `eea-` namespace, including both class profiles and active-class state.
- Week 1–9 runner dependencies and compatibility routes are covered offline.
- Missing Week 6/7/8 plan-return aliases were restored as compatibility redirects.

## Important source-of-truth rules verified
- There is **no built-in canonical sample roster**. The app supports up to 20 students, but actual names come from the teacher-managed Students roster.
- Empty means empty. Classroom features must never manufacture sample students.
- AM and PM each keep their own real roster and class-specific activity state.
- Choose a Friend starts with the current Star when that Star is present.
- Center Choice starts with the current Star when that Star is present.
- Star rotation is alphabetical.
- If the scheduled Star is absent, that child remains pending and the next present eligible child becomes Star.
- Once today's Star is resolved/substituted, a late-arriving originally scheduled child does not reclaim Star that day.

## Star lifecycle validation completed
- Stale attendance is sanitized before attendance-dependent tools can use it.
- Cycle rollover waits until every active child has actually served.
- Teacher Star override no longer consumes two children from the rotation on the same day.
- After override, next-in-line is recalculated from the earliest unserved child.
- Changing today's Star through Teacher Mode clears today's reveal flag; saving the same Star again does not.
- Reveal state is class-specific and date-scoped.

## Roster source-of-truth cleanup — completed behaviorally
- `class-profile.js` no longer seeds sample students. New/empty AM or PM profiles stay empty.
- `students.html` no longer manufactures a sample roster and shows an intentional empty state.
- `attendance.html` loads only the real active-class roster and shows an intentional empty state when needed.
- `star-engine.js` already reads only `eea-students-v1`; empty roster stays empty.
- `choose-a-friend-state.js` now immediately replaces the inline legacy roster with the real active-class roster, preserves Star-first behavior, and shows:
  - **No students yet → Open Students** when the class roster is empty.
  - **No friends marked present yet → Open Attendance** when today has no eligible attendance.
- `choose-a-friend-state.js` no longer lets a zero-eligible saved state masquerade as a completed round.
- `center-choice-state.js` now applies the same real-roster/attendance rules and intentional empty-state UX while preserving saved-round behavior and Star-first order.
- AM/PM isolation is confirmed in `class-profile.js`: `eea-students-v1`, `eea-choose-friend-state-v1`, and `eea-center-choice-state-v1` are all class-profile keys.

## Important remaining source cleanup
- `choose-a-friend.html` still physically contains the old 18-name `FALLBACK` array, but runtime behavior is neutralized by `choose-a-friend-state.js` before a real round can be used.
- `center-choice.html` still physically contains the old 18-name `FALLBACK` array, but runtime behavior is neutralized by `center-choice-state.js` loaded through `name-audio-engine.js`.
- Removing those literals from the large inline HTML files is still desirable final source cleanup, but behavior no longer depends on them.

## Automated audit finding/fix
- The V6 static workflow itself had become stale: `.github/workflows/audit-v6-static.yml` still ran `node --check v6-test/classroom-protection.js` even though that obsolete helper had already been deleted.
- 🔧 Removed that dead syntax-check line so the audit can evaluate current V6 rather than fail on a deleted file.
- The latest `Audit V6 Static App` run for commit `f7efee8d5397a8222950961a666e1c4f1859e6d9` was still in progress at the moment this checkpoint was updated. Do not assume green until its final conclusion is checked.

## Open / intentionally unfinished items
- Confirm the latest static audit result after the workflow fix; inspect and repair any genuine failures.
- Complete the final compatibility-shim keep/delete review.
- Optionally remove the now-dead inline 18-name fallback literals from the two large HTML pages without changing their visual layout or behavior.
- A true installed-browser/SmartBoard fresh-install + migration + offline smoke test is still required before declaring V6 production source of truth.

## EXACT STOPPING POINT
Roster consumer behavior is repaired through Star, Choose a Friend, and Center Choice. AM/PM empty-roster isolation is confirmed. The audit workflow was repaired so it no longer checks deleted `classroom-protection.js`.

### NEXT — resume here, not earlier
1. Check the final result of GitHub Actions run **34726399089** (`Audit V6 Static App`, commit `f7efee8d5397a8222950961a666e1c4f1859e6d9`).
2. If it is red, inspect the failing step and fix the actual regression; rerun until green.
3. Then perform the final compatibility-shim reference review. Current known compatibility files include `calendar-management.html`, `curriculum-pacing.html`, `clean-up.html`, `read-aloud-week1-plan.html`, `choose-friend.html`, `daily-lessons-v2.html`, `lesson-runner.html`, Week 3/4/5 plan redirects, `community-meeting-week1-new.html`, and `service-worker.js`.
4. Keep only shims that still protect real current/legacy links; delete truly unreferenced duplicates.
5. If practical, remove the dead inline 18-name fallback literals from `choose-a-friend.html` and `center-choice.html` after behavioral protection is already in place.
6. Finish with real fresh-install, existing-data migration, installed/offline, and SmartBoard smoke tests.

## New-chat instruction
In the next Project chat, say:

**Continue the EEA V6 audit from `v6-test/V6-AUDIT-CURRENT-CHECKPOINT.md`.**
