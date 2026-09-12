# EEA Classroom Companion V6 — Current Audit Checkpoint

**Updated:** 2026-09-12

## Continuity instruction
This is the authoritative short handoff for the next audit chat. **Do not restart the V6 audit. Do not re-audit completed sections unless a later finding explicitly reopens them.** Read `V6-AUDIT-MASTER.md` for the long history, then resume from **NEXT** below.

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
- GitHub Actions static audit was GREEN before the latest roster-source changes: 144 V6 HTML/JS/CSS files scanned, 107 static local HTML destinations, zero missing local references, zero offline-cache warnings, and core JavaScript syntax checks passed.
- Current service-worker cache at the last completed offline audit was `eea-companion-v12`.

## Important source-of-truth rules verified
- Choose a Friend starts with the current Star when present.
- Center Choice starts with the current Star when present.
- Star rotation is alphabetical.
- If the scheduled Star is absent, that child is held pending and the next present eligible child becomes Star.
- Once today's Star is resolved/substituted, a late-arriving originally scheduled child does not reclaim Star that day.

## Star lifecycle validation completed
- 🔧 Closed the Star morning stale-attendance edge case.
- `class-profile.js` sanitizes restored/live attendance state: if `eea-attendance-date` is not today, the present list/count/date are cleared before attendance-dependent tools can use them.
- ✅ Cycle rollover resets the served list only after every active child has actually served; a pending absent child prevents premature rollover until that child serves.
- 🔧 Teacher Star override no longer consumes two children from the rotation on the same day.
- 🔧 After a teacher override, next-in-line is recalculated from the earliest unserved child so alphabetical rotation stays coherent.
- 🔧 Changing today's Star through Teacher Mode clears today's reveal flag, so the newly chosen Star receives a fresh reveal.
- ✅ Saving the same Star again does not unnecessarily clear reveal state.
- ✅ Star reveal state is class-specific through the AM/PM profile key set and naturally expires by date comparison.

## NEW — roster source-of-truth cleanup in progress
A more important issue was found while cleaning the old 18-name picker fallbacks: V6 had multiple places that could manufacture a sample classroom roster when no real roster existed.

### Completed in this newest pass
- 🔧 `class-profile.js` no longer seeds the hard-coded 20-child sample roster on first load, save, or AM/PM restore.
- Empty AM/PM class profiles now remain genuinely empty instead of silently receiving sample children.
- 🔧 `students.html` no longer creates the sample 20-child roster when storage is empty.
- Students now treats `eea-students-v1` as the teacher-managed source of truth and shows a clear **No students yet** empty state with **Add Student** as the setup path.
- 🔧 A syntax typo introduced during that Students edit was caught immediately and corrected before continuing.
- 🔧 `attendance.html` no longer creates or persists a fallback/sample roster.
- Attendance now loads only the real active-class roster. If the class is empty, it shows **No students in this class yet** with an **Open Students** button rather than displaying or creating imaginary children.
- These changes are already committed to `main` in `v6-test`.

### Important corrected source-of-truth rule
**There is no canonical built-in 20-child class roster.** The app supports up to 20 students, but actual student names come from the teacher-managed roster in Teacher's Desk/Students. Empty means empty. AM and PM each keep their own real roster. Classroom features must never invent students when that roster is missing.

## Open / intentionally unfinished items
- `star-engine.js` still contains a hard-coded 20-name fallback roster and must be changed to respect an empty real roster.
- `choose-a-friend.html` still contains the old 18-name fallback array. Its newer helper currently repairs runtime behavior, but the page itself should stop inventing students.
- `center-choice.html` still contains the old 18-name fallback array and should likewise respect an empty real roster.
- After those three consumers are fixed, verify their empty-roster UX so Star/Choose a Friend/Center Choice fail safely and guide the teacher to Students rather than appearing broken.
- Re-run the automated static/syntax audit after the roster consumer changes.
- Final compatibility-shim keep/delete review remains pending.
- A true installed-browser/SmartBoard fresh-install + migration + offline smoke test is still required before declaring V6 production source of truth.

## EXACT STOPPING POINT
The **roster foundation and Attendance have been corrected**, and the connection interrupted immediately afterward. Do not redo those changes.

### NEXT — resume here, not earlier
Continue the roster source-of-truth repair in this exact order:

1. **`star-engine.js`** — remove the hard-coded 20-child fallback behavior so an empty real roster remains empty and Star cannot operate on imaginary children.
2. **`choose-a-friend.html`** — remove/neutralize the old 18-child fallback and provide intentional empty-roster behavior without disturbing its visual layout. Preserve the rule that a normal populated round starts with the current present Star.
3. **`center-choice.html`** — remove/neutralize the old 18-child fallback and provide intentional empty-roster behavior. Preserve Star-first and all saved-round behavior.
4. Verify AM/PM empty-roster behavior: empty PM must stay empty; switching back must restore the real AM roster exactly.
5. Run the automated V6 static/syntax audit and fix any regression.
6. Then return to the remaining compatibility-shim keep/delete review.
7. After source cleanup, perform fresh-install, existing-data migration, and installed/offline smoke tests.

## New-chat instruction
In the next Project chat, say:

**Continue the EEA V6 audit from `v6-test/V6-AUDIT-CURRENT-CHECKPOINT.md`.**

The next chat should begin at `star-engine.js` roster fallback cleanup — **not** at Home, Attendance, Star lifecycle, structural cleanup, or the beginning of the audit.
