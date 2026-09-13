# EEA Classroom Companion V6 — Current Audit Checkpoint

**Updated:** 2026-09-12

## Continuity instruction
This is the authoritative short handoff for the next audit chat. **Do not restart the V6 audit. Do not re-audit completed sections unless a later finding explicitly reopens them.** This checkpoint overrides stale historical statements in `V6-AUDIT-MASTER.md` when the two disagree.

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
- Removing those literals is still desirable source cleanup, but it is not currently a behavioral blocker and should not be attempted with a risky full-page rewrite.

## Compatibility-shim review — completed
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

## Important correction — Classroom Protection is live
`classroom-protection.js` is **not obsolete**. The current `students.html` loads it and actively uses `EEAProtection` for the **Protect Classroom Data** recovery-file feature and protected-save behavior. Older audit notes that say this file was deleted/obsolete are stale and must not be followed.

## Automated audit status
- The stale `node --check v6-test/classroom-protection.js` line was removed from the workflow earlier because the audit notes incorrectly considered that file deleted; the file itself is actually live and is still syntax-covered indirectly only if added back later.
- `scripts/audit_v6_static.py` now reports compatibility inbound references in addition to missing local references and offline review.
- The compatibility-reference run after cleanup was GREEN: 141 V6 HTML/JS/CSS files scanned, 107 static local HTML destinations, no missing local HTML/JS/CSS references, and core JavaScript syntax checks passed.
- `sw.js` cache version was bumped from `eea-companion-v12` to **`eea-companion-v13`** after the recent runtime helper changes so installed classrooms do not remain stuck on older cache-first JavaScript.
- GitHub Actions run **34731439341** was triggered by the v13 cache bump. Check its final result before moving past source validation.

## Open / intentionally unfinished items
- Confirm GitHub Actions run **34731439341** is GREEN after the v13 cache bump.
- Optional only: remove the dead inline 18-name fallback literals from `choose-a-friend.html` and `center-choice.html` if it can be done safely without a risky large inline-page rewrite.
- A true installed-browser/SmartBoard fresh-install + migration + offline smoke test is still required before declaring V6 production source of truth.

## EXACT STOPPING POINT
Compatibility-shim keep/delete review is complete, three dead aliases were removed, active compatibility routes were documented, Classroom Protection was reclassified correctly as a live Students feature, and the service-worker cache was bumped to v13 to force current runtime JavaScript into existing installs.

### NEXT — resume here, not earlier
1. Check GitHub Actions run **34731439341** (`Audit V6 Static App`, commit `4d2f75b3b5138986fba44d3aee90e0c51c69e4c3`).
2. If GREEN, source-level compatibility cleanup is complete.
3. Do **not** delete `classroom-protection.js`; it is used by `students.html`.
4. Do **not** delete the retained compatibility aliases listed above unless their inbound references are first migrated to authoritative routes.
5. Move to final runtime validation: fresh install, existing-data migration, AM↔PM switching, Choose a Friend/Center Choice empty-roster and Star-first behavior, offline navigation, and installed/SmartBoard smoke tests.
6. Only after those live tests pass should `v6-test` be declared the production source of truth.

## New-chat instruction
In the next Project chat, say:

**Continue the EEA V6 audit from `v6-test/V6-AUDIT-CURRENT-CHECKPOINT.md`.**
