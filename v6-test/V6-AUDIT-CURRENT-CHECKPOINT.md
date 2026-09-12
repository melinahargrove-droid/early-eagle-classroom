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

## Newly completed since the prior checkpoint
- 🔧 Closed the Star morning stale-attendance edge case.
- Normal Home flow already cleared daily attendance and routed through Attendance before calling `EEAStar.resolveToday()`.
- To protect unusual restore/direct-entry states too, `class-profile.js` now runs `sanitizeAttendanceState()` on app load and whenever AM/PM profile state is restored.
- If `eea-attendance-date` is not today, V6 clears `eea-attendance-present`, resets `eea-attendance-count` to `0`, and removes the stale attendance date before attendance-dependent tools can use it.
- This protects Star, Friends Today, Choose a Friend, and Center Choice from prior-day attendance leakage at the shared state layer.

## Open / intentionally unfinished items
- `choose-a-friend.html` and `center-choice.html` still physically contain old 18-name fallback arrays. Runtime helpers override them with the canonical 20-child roster, so this is source clutter rather than an active classroom bug.
- Final compatibility-shim keep/delete review is still pending.
- A true installed-browser/SmartBoard fresh-install + migration + offline smoke test is still required before declaring V6 production source of truth.

## EXACT STOPPING POINT
The **Star morning attendance-date edge case is fixed**. Do not reopen it unless a later runtime test contradicts the source-level result.

### NEXT — resume here, not earlier
Continue the final **Star lifecycle behavior validation** only for edge cases not already covered, then move forward.

Recommended next checks:
1. Confirm Star cycle rollover after every active child has served once, including pending-absence behavior at the end of a cycle.
2. Confirm teacher Star override does not corrupt next-in-line rotation or pending absent children.
3. Confirm Star reveal state is class-specific and resets on the correct daily lifecycle.
4. Then leave Star and continue final behavior validation; do not reopen completed Home/Timer/Movement/etc. sections without a dependency reason.
5. Final compatibility/fallback cleanup.
6. Real fresh-install test: canonical 20 roster, AM default, clean PM, Home indicator, Attendance → Star → Choose a Friend → Center Choice.
7. Existing-data migration test: existing classroom remains AM, PM starts clean, switching back restores AM exactly.
8. Installed/offline smoke test: Home, Attendance, Star, pickers, Timer, Teacher's Desk, Daily Lessons/week runner, Calm Down, Clean Up.
9. Only after runtime tests pass, declare `v6-test` the production/source-of-truth build.
