# EEA Classroom Companion — Source of Truth

Status: Approved restoration baseline for `v6-restoration`

This document defines intended behavior for the Early Eagle Academy Classroom Companion. When older files, experiments, branches, or legacy pages conflict with this document, this document wins unless a later approved decision explicitly replaces it.

## Core product rule

Early Eagle is a **single-class classroom app**. Do not add AM/PM or multi-class switching here. Multi-class support belongs in the future commercial version only.

The Home screen is for **using tools with children**. Teacher's Desk is for **managing/editing classroom settings and content**.

## Shared classroom state

Authoritative chain:

**Roster → Today's Attendance → Today's Star → Choose a Friend / Center Choice / Friends Today**

### Attendance
- Present-only attendance.
- Attendance is date-stamped.
- Friends Today reads today's attendance count only.
- If attendance has not been taken today, dependent tools must not silently assume every child is present; prompt the teacher to take attendance first.

### Star of the Day
- No repeats until all eligible children have served.
- Star rotation/history persists across days.
- Today's reveal state resets daily.
- Home shows `???` until today's Star has been revealed.

### Choose a Friend
- Today's present Star goes first.
- Then every other present child is used once before the cycle completes.
- Absent children are excluded.

### Center Choice
- Today's present Star chooses first.
- Then every other present child chooses once.
- Absent children are excluded.
- Preserve the current Center Choice experience where possible.
- Enforce capacities and CLOSED centers.
- Keep reset, undo, and randomizer.
- Resetting Center Choice must not reset attendance or Star rotation.

## Home screen

Keep the current overall visual design. Fix behavior/wiring rather than redesigning.

- Schedule activity tap opens its activity popup/details rather than advancing by accident.
- Big Now panel opens the same popup.
- Star panel shows `???` until reveal, then today's Star.
- Friends Today reads only today's Attendance.
- Quick Timer is a standalone timer and **never opens Clean Up**.
- Full Timer is a general-purpose timer and does not automatically mean Clean Up.
- Clean Up automation belongs to the Centers workflow.
- Keep Attendance, Choose a Friend, Center Choice, Clean Up, Movement, Calm Down, Daily Lessons, Stay in Your Center, Teacher Mode.
- Eddie Says is a future feature after restoration stability.

## Schedule system

Keep working editor features: reorder, rename display labels, assign times, show/hide, choose/upload pictures, add custom activities.

Use stable internal activity IDs so renaming does not break behavior.

Each activity may have:
- picture / large Now image
- classroom rules/reminders
- optional audio
- optional linked app action

Tapping a schedule row opens details. Progression uses an explicit teacher **Done / Next Activity** action.

Recess/Outside keeps Eddie + weather behavior and may also have rules/audio.

Schedule popup logic belongs in Schedule/Home code, not `star-engine.js`.

## Daily Lessons — master direction

**Restore the Version 1 teaching experience while preserving current V6 curriculum/content and newer lesson-navigation improvements.**

Daily Lessons should:
- open on the correct week/day
- show a persistent lesson path/sidebar
- check off completed sections
- clearly highlight the current/next section
- allow the teacher to leave for breakfast/recess/lunch/etc.
- resume at the next unfinished section when returning later
- keep the same shell across Weeks 1–8 even when section count/type varies

Typical path can include Community Meeting, Read Aloud, Centers, Small Groups, Building Blocks, Storytelling, and Closing Circle.

### Day/week state
- Active instructional day is determined centrally.
- **No lesson page or runner may silently default to Monday.**
- If day state is missing/corrupt, return to Daily Lessons rather than guessing Monday.

### Completion
- A section reports Done to the persistent shell.
- Done marks that section complete and makes the next one current.
- X/back returns to the lesson overview without falsely marking complete.
- Remove obsolete Read Aloud → Choose a Friend detours.
- Remove obsolete `week5-plan.html` routing.

Preserve correct V6 curriculum content: Community Meeting, Read Aloud pages, vocabulary, teaching stops, Previous/Next boundaries, partial-read logic, Centers, Small Groups, Building Blocks, Storytelling, Closing Circle.

Week 5 must not switch to a stripped-down shell; replace literal `Visual placeholder` text and retain valid content.

## Centers workflow

Authoritative flow:

**Center Choice → Stay in Your Center → Clean Up**

Only auto-transition according to teacher-configured options.

Stay in Your Center keeps the egg/baby eagle experience and teacher-adjustable duration.

## Movement

- Category selectable on the front-facing Movement page.
- Teacher selects duration/time.
- Eddie/app chooses songs automatically.
- Avoid repeats in the same day until eligible songs in the category are exhausted.
- Do not repeat back-to-back when unused eligible songs remain.
- Reset used-song pool daily.
- Teacher's Desk gets a dedicated Movement Songs management area.

## Clean Up Song

- Reliability over fancy synchronization.
- One authoritative playback clock.
- Avoid competing audio/video/lyrics timers.
- Perfect lyric synchronization is not a launch requirement.

## Teacher's Desk

Teacher's Desk is management, not a duplicate Home screen.

### My Classroom
- Students
- Star of the Day
- Centers & Capacity

### Content & Activities
- Class Schedule
- Schedule Pictures & Rules
- Movement Songs
- Lessons & Links

### App & Data
- App Settings
- School Calendar
- Backup & Restore

### Daily Reset
- Reset Daily Activities
- Clear Center Choices
- End of Day Wrap Up

Keep destructive controls visually separated. `star-engine.js` should eventually contain Star logic only.

## Weather / Outdoor

Keep saved-location weather, child-friendly conditions, Eddie guidance, and outdoor yes/no presentation.

## Calm Down

Keep current concept unless a later QA pass finds a specific defect.

## Eddie Says

Future feature after the existing app is stable.

## Daily reset contract

Reset daily:
- attendance
- Star reveal state, not rotation history
- Choose a Friend queue
- Center Choice selections
- schedule progress
- Daily Lessons day progress
- Movement used-song pool
- temporary timers

Do not reset daily:
- student roster
- Star rotation/history
- center configuration/capacities
- schedule configuration
- schedule pictures/rules/audio
- Movement library/categories
- curriculum
- Teacher's Desk settings

Leaving and returning during the same day must not wipe valid daily progress.

## Full classroom simulation requirement

Before calling restoration stable, simulate a real day: Attendance → Star → Choose a Friend → Center Choice → Community Meeting → leave for breakfast → return and verify Read Aloud is waiting → Read Aloud → Centers → Stay in Your Center → Clean Up → Movement → schedule transitions → Weather/Recess → later Daily Lessons → Closing Circle → End of Day. Also refresh/reopen at several points.

## Repository cleanup requirement

The repository is large and contains legacy/test/duplicate/abandoned files. **Do not mass-delete before restoration is stable.**

After classroom simulation passes:
- keep production pages/shared modules/required assets/current docs
- temporarily archive useful legacy references
- remove obsolete test pages, abandoned duplicates, superseded lesson runners/pages, dead routing pages, unused media experiments, and clearly unused duplicate assets

Final goal: one obvious authoritative file/module for each major feature and a substantially smaller production tree.

## Restoration build order

1. Protect current V6 and establish this Source of Truth
2. Shared classroom state
3. Home + Schedule
4. V1-style Daily Lessons restoration with V6 curriculum
5. Centers workflow
6. Movement + Clean Up media reliability
7. Teacher's Desk reorganization
8. Smaller standalone tools QA
9. Daily reset testing
10. Full classroom simulation
11. Repository cleanup/slimming
