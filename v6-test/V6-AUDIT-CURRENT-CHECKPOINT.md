# EEA Classroom Companion V6 — Current Audit Checkpoint

**Updated:** 2026-09-12

## Continuity instruction
This is the authoritative short handoff for the next audit chat. **Do not restart the V6 audit. Do not re-audit completed sections unless a later finding explicitly reopens them.** Read `V6-AUDIT-MASTER.md` for the long history, then resume from **NEXT** below.

## Audit objective
Finish `v6-test` as the one authoritative, self-contained EEA Classroom Companion. It should not depend accidentally on old builds, duplicate implementations, stale files, or incompatible state. AM/PM class state must stay isolated where appropriate, shared teacher setup must stay shared, and the finished app must survive fresh install, migration, packaging, and offline use.

## Major completed work
- AM/PM profile architecture implemented and audited.
- Home shows a read-only AM/PM indicator.
- Attendance, Star, Choose a Friend, and Center Choice use the canonical 20-child model at runtime.
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
- GitHub Actions static audit is GREEN: 144 V6 HTML/JS/CSS files scanned, 107 static local HTML destinations, zero missing local references, zero offline-cache warnings, and core JavaScript syntax checks pass.
- Current service-worker cache is `eea-companion-v12`.

## Important source-of-truth rules verified
- Choose a Friend starts with the current Star when present.
- Center Choice starts with the current Star when present.
- Star rotation is alphabetical.
- If the scheduled Star is absent, that child is held pending and the next present eligible child becomes Star.
- Once today's Star is resolved/substituted, a late-arriving originally scheduled child does not reclaim Star that day.

## Star lifecycle validation completed
- 🔧 Closed the Star morning stale-attendance edge case.
- `class-profile.js` now sanitizes restored/live attendance state: if `eea-attendance-date` is not today, the present list/count/date are cleared before attendance-dependent tools can use them.
- ✅ Cycle rollover logic resets the served list only after every active child has actually served; a pending absent child therefore prevents premature cycle rollover until that child eventually serves.
- 🔧 Teacher Star override no longer consumes two children from the rotation on the same day. If today's automatically resolved Star is replaced, the replaced child is removed from today's served set and remains eligible in the ongoing cycle.
- 🔧 After a teacher override, next-in-line is recalculated from the earliest unserved child so alphabetical rotation stays coherent.
- 🔧 Changing today's Star through Teacher Mode clears today's Star reveal flag, so the newly chosen Star receives a fresh reveal instead of appearing already revealed.
- ✅ Saving the same Star again does not unnecessarily clear reveal state.
- ✅ Star reveal state (`eea-star-revealed-date`) is class-specific through the AM/PM profile key set and naturally expires by date comparison.
- ✅ Static V6 audit passed after the Star override/reveal changes, including core JavaScript syntax checks.

## Open / intentionally unfinished items
- `choose-a-friend.html` and `center-choice.html` still physically contain old 18-name fallback arrays. Runtime helpers override them with the canonical 20-child roster, so this is source clutter rather than an active classroom bug.
- Final compatibility-shim keep/delete review is still pending.
- A true installed-browser/SmartBoard fresh-install + migration + offline smoke test is still required before declaring V6 production source of truth.

## EXACT STOPPING POINT
The **Star lifecycle behavior validation is complete** at the source level. Do not reopen Star unless a later runtime test contradicts it.

### NEXT — resume here, not earlier
Move forward into **final compatibility/fallback cleanup**, then runtime validation.

Recommended next checks:
1. Review remaining compatibility-only shim pages and keep only those still protecting genuine links/bookmarks.
2. Replace/remove the dead 18-name fallback source clutter in `choose-a-friend.html` and `center-choice.html` only if it can be done without destabilizing those large inline pages.
3. Real fresh-install test: canonical 20 roster, AM default, clean PM, Home indicator, Attendance → Star → Choose a Friend → Center Choice.
4. Existing-data migration test: existing classroom remains AM, PM starts clean, switching back restores AM exactly.
5. Installed/offline smoke test: Home, Attendance, Star, pickers, Timer, Teacher's Desk, Daily Lessons/week runner, Calm Down, Clean Up.
6. Only after runtime tests pass, declare `v6-test` the production/source-of-truth build.
