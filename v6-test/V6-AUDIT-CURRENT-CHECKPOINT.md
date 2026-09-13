# EEA Classroom Companion V6 — Current Audit Checkpoint

**Updated:** 2026-09-12

## Continuity instruction
This is the authoritative short handoff for the next audit chat. **Do not restart the V6 audit. Do not re-audit completed sections unless a later finding explicitly reopens them.** This checkpoint overrides stale historical statements in `V6-AUDIT-MASTER.md` when the two disagree.

## Audit objective
Finish `v6-test` as the one authoritative, self-contained EEA Classroom Companion. It should not depend accidentally on old builds, duplicate implementations, stale files, or incompatible state. AM/PM class state must stay isolated where appropriate, shared teacher setup must stay shared, and the finished app must survive fresh install, migration, packaging, and offline use.

## Source-level audit status: COMPLETE / GREEN
The code/reference/compatibility phase is complete. Do not go back through finished features unless runtime testing exposes a reproducible regression.

### Latest automated validation
- GitHub Actions run **34731439341** (service-worker v13 cache bump) completed GREEN.
- GitHub Actions run **34731495592** (restored Classroom Protection syntax coverage) completed GREEN.
- The static audit reports no missing local HTML/JS/CSS references and core JavaScript syntax checks pass.
- `classroom-protection.js` is once again explicitly covered by `node --check` because it is a live runtime dependency of `students.html`.
- The latest GitHub Pages build for commit `3ba023e9ea607c0f82133e66db2f20f346edadc4` completed its Jekyll build and artifact upload successfully; final deployment was still publishing when this checkpoint was written.

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
- Week 6/7/8 plan-return compatibility aliases are present because current lesson pages still reference them.

## Important source-of-truth rules verified
- There is **no built-in canonical sample roster**. The app supports up to 20 students, but actual names come from the teacher-managed Students roster.
- Empty means empty. Classroom features must never manufacture sample students.
- AM and PM each keep their own real roster and class-specific activity state.
- Choose a Friend starts with the current Star when that Star is present.
- Center Choice starts with the current Star when that Star is present.
- Star rotation is alphabetical.
- If the scheduled Star is absent, that child remains pending and the next present eligible child becomes Star.
- Once today's Star is resolved/substituted, a late-arriving originally scheduled child does not reclaim Star that day.

## Roster source-of-truth cleanup — completed behaviorally
- `class-profile.js` no longer seeds sample students. New/empty AM or PM profiles stay empty.
- `students.html` no longer manufactures a sample roster and shows an intentional empty state.
- `attendance.html` loads only the real active-class roster and shows an intentional empty state when needed.
- `star-engine.js` reads only `eea-students-v1`; empty roster stays empty.
- `choose-a-friend-state.js` replaces the inline legacy roster with the real active-class roster before a real round is used, preserves Star-first behavior, and provides intentional empty-roster / no-attendance handling.
- `center-choice-state.js` applies the same real-roster/attendance rules while preserving saved-round behavior and Star-first order.
- AM/PM isolation is confirmed in `class-profile.js`: `eea-students-v1`, `eea-choose-friend-state-v1`, and `eea-center-choice-state-v1` are class-profile keys.

## Remaining optional roster source cleanup
- `choose-a-friend.html` still physically contains the old 18-name `FALLBACK` literal, but runtime behavior is neutralized by `choose-a-friend-state.js`.
- `center-choice.html` still physically contains the old 18-name `FALLBACK` literal, but runtime behavior is neutralized by `center-choice-state.js` loaded through `name-audio-engine.js`.
- Removing those literals is desirable source cleanup but **not a production blocker** and should not be attempted with a risky full-page rewrite merely for cosmetic source purity.

## Compatibility-shim review — COMPLETE
The static audit now reports inbound references for compatibility candidates so keep/delete decisions are evidence-based.

### Retained because current V6 pages still reference them
- `calendar-management.html` — used by Teacher's Desk and `curriculum-pacing.html`.
- `curriculum-pacing.html` — used by `daily-lessons.html`.
- `choose-friend.html` — used by Week 1 and Week 2 lesson runners.
- `clean-up.html` — used by Week 1 and Week 2 lesson runners.
- `daily-lessons-v2.html` — still used by multiple Week 1/2 section pages.
- `week3-plan.html` through `week8-plan.html` — still used as return/compatibility routes by current lesson pages.

### Retained for installed-app compatibility
- `service-worker.js` — current source does not reference it, but an older installed browser may still have that exact service-worker URL registered. It remains a tiny compatibility entry point that imports authoritative `sw.js`.

### Removed because no current static inbound references remained
- `community-meeting-week1-new.html`
- `lesson-runner.html`
- `read-aloud-week1-plan.html`

## Important correction — Classroom Protection is LIVE
`classroom-protection.js` is **not obsolete**. Current `students.html` loads it and uses `EEAProtection` for the **Protect Classroom Data** recovery-file feature and protected-save behavior. Older statements in `V6-AUDIT-MASTER.md` saying this file was removed are stale. Do not delete it.

## Offline / deployment state
- Authoritative service worker: `sw.js`.
- Compatibility service-worker entry: `service-worker.js` → imports `sw.js`.
- Current audited cache version: **`eea-companion-v13`**.
- The v13 bump was intentional so existing cache-first installs receive the recent runtime JavaScript repairs rather than remaining on older helpers.
- Static offline-reference coverage is GREEN.
- True offline behavior still requires an installed-browser/device test; source inspection cannot prove service-worker lifecycle, browser storage, audio-unlock, or physical SmartBoard behavior.

## Final runtime test document
A controlled final checklist now lives at:

`v6-test/V6-RUNTIME-SMOKE-TEST.md`

It covers:
1. fresh-install / genuinely empty class,
2. AM/PM isolation,
3. Star lifecycle + Star-first Choose a Friend / Center Choice,
4. navigation + saved state,
5. existing-data migration,
6. Backup / Restore + Classroom Protection,
7. installed/offline PWA behavior,
8. actual SmartBoard/classroom-device flow,
9. final production decision.

## Open / intentionally unfinished items
- Confirm the latest GitHub Pages deployment finishes successfully after the final audit/workflow commits.
- Perform the real-browser/device checklist in `V6-RUNTIME-SMOKE-TEST.md`.
- Fix only issues that can be reproduced during that runtime pass.
- Only after the required runtime sections pass should `v6-test` be declared the production source of truth.

## EXACT STOPPING POINT
**Source-level V6 audit is complete and GREEN. Compatibility cleanup is complete. Cache is v13. Classroom Protection has been correctly restored to audit coverage. The project is now in final runtime/device validation, not source re-audit.**

### NEXT — resume here, not earlier
1. Confirm the latest GitHub Pages deployment is successful.
2. Use `V6-RUNTIME-SMOKE-TEST.md` as the authoritative live-test order.
3. Begin with the fresh-install / empty-class test in a clean browser profile or device.
4. Then test AM/PM isolation and Star-first chooser behavior.
5. Continue through migration, backup/restore, offline installed-PWA, and actual SmartBoard flow.
6. Record/fix any reproducible failure; do not reopen unrelated completed source sections.
7. When all required runtime sections pass, update this checkpoint to declare `v6-test` the production source of truth.

## New-chat instruction
In the next Project chat, say:

**Continue the EEA V6 audit from `v6-test/V6-AUDIT-CURRENT-CHECKPOINT.md`.**
