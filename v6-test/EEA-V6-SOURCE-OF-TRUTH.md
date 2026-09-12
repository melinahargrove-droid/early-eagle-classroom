# EEA Classroom Companion V6 — Stabilization Source of Truth

This file defines the personal Early Eagle Academy Classroom Companion during stabilization. It is intentionally separate from the commercial Little Classroom product.

## Branch policy

- `v6-restoration` is the reference/rescue branch.
- `eea-v6-stabilization` is the active personal EEA stabilization branch.
- Do not add new production work to older V6 branches while stabilization is underway.
- Preserve working behavior first; consolidate architecture only after the current behavior is verified.

## Locked classroom rules

- Personal EEA uses one class roster. AM/PM class switching is commercial-only and does not belong in this build.
- EEA currently uses 8 centers.
- Choose a Friend begins with the current Star of the Day, then uses the remaining present children.
- Center Choice begins with the current Star of the Day, then uses the remaining present children.
- Star rotation is alphabetical and attendance-aware. An absent scheduled Star remains pending and receives the turn when present again.
- Stay in Your Center defaults to 5 minutes and follows the initial Center Choice round.
- Storytelling is teacher-led Monday–Thursday and child-led Friday.
- Closing Circle is the final teaching section and normal completion returns Home.

## Lesson architecture contract

`LESSON-SECTION-MASTER-RULES.md` is the production contract for lesson behavior.

- `daily-lessons.html` is the single Day Overview / Today’s Plan.
- Each week has one lesson runner that owns transitions between sections.
- Section pages own navigation inside their own section.
- Do not create or restore competing `weekX-plan.html` navigation.
- Do not route normal lesson completion to `daily-lessons-v2.html` or another obsolete overview.
- Preserve week and weekday throughout the lesson flow.
- Read Aloud vocabulary uses dedicated screens after the associated adapted-book slide.
- Custom teacher visuals have first-paint priority over defaults.

## Stabilization priorities

1. Repair broken routes without changing intended classroom behavior.
2. Remove dependencies on obsolete branches and files outside the canonical V6 app folder.
3. Make teacher-only routes consistently enforce Teacher Mode access.
4. Consolidate duplicate daily-state, roster, settings, schedule, and calendar logic only after stabilization.
5. Normalize older curriculum weeks to the lesson master rules.
6. Archive obsolete duplicate implementations after their replacements are verified.

## Verified / repaired during the current stabilization pass

- Choose a Friend uses the attendance-aware Star-first queue and the selected child is committed before that child's audio is played.
- Choose a Friend requires today's attendance before the chooser can run.
- Center Choice uses the same Star-first rule, loads the shared `name-audio-engine.js`, and now requires today's attendance before the chooser can run.
- Home no longer uses the obsolete capture-phase Now-panel handler that interfered with schedule interactions.
- Home's newer schedule controller is active, and a completed schedule remains complete after reload instead of snapping back to the final activity.
- The Students management screen, Attendance, Star engine, Choose a Friend, and Center Choice now share the same personal Early Eagle fallback roster instead of conflicting demo rosters.
- Morning Attendance remains incomplete while the Attendance screen is open and is marked complete only when the teacher deliberately closes Attendance; an interrupted morning check-in will be required again from Home.
- Star of the Day now requires today's attendance, resolves the current Star only through the canonical rotation state, no longer accepts the obsolete direct-name URL override, uses V6-local Home/star artwork, and honors the Calm Animations preference.
- Stay in Your Center preserves the locked 5-minute default and now provides Start/Pause/Resume, audible wiggle/crack/hatch progression, a visible countdown, and an automatic handoff to the Clean Up song after hatching.
- Week 8 Friday Storytelling was audited and already correctly uses child storytelling; Monday–Thursday remain adult-led.
- Unit 2 Week 1 / Week 9 Read Aloud completion now advances directly to Foundational Literacy through the lesson runner. The obsolete Choose a Friend detour was removed so normal lesson completion follows the master section contract.
- The shared Daily Lessons overview was verified to represent Week 9 as nine sections in the correct order.
- Week 9 Teacher Lesson Editor / Manager context now displays the correct Unit 2 Week 1 nine-section labels instead of falling back to Week 8 labels.
- The main Classroom Timer now honors the App Settings default timer length and Timer Sounds preference. Home's quick timer also honors Timer Sounds.
- Home schedule detail keys are normalized by activity meaning rather than row position, preventing Breakfast/Circle Time and other reordered activities from receiving the wrong picture, rules, or audio.
- Existing schedule detail maps receive a compatibility remap so older positional picture/rule/audio customizations continue to resolve after semantic schedule-key normalization.
- The `weekX-plan.html` files currently present in V6 are compatibility redirects into `daily-lessons.html`, not competing week-plan interfaces; reachable legacy exits should still be cleaned up over time but do not currently strand users in obsolete UI.

## Known high-confidence issues still open

- Older code still contains links to `clean-up.html`; the canonical page is `clean-up-song.html`. A temporary compatibility redirect is present during stabilization.
- Some screens still reference assets from `v6-clean-build` or outside `v6-test`.
- Daily reset/state behavior is defined in more than one place.
- App Settings still contains options/copy beyond the Timer settings that do not consistently match current behavior.
- Teacher-only management pages still need a complete route-by-route access-guard audit.
- Older lesson screens may still contain obsolete `weekX-plan.html` and `daily-lessons-v2.html` navigation even though the current `weekX-plan.html` files are compatibility redirects.

## Rule for fixes

When current code, older notes, and remembered behavior disagree, do not silently choose one. Preserve the working implementation and verify the intended EEA behavior before changing it unless the issue is already locked in this file or `LESSON-SECTION-MASTER-RULES.md`.
