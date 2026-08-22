# Early Eagle Academy Lesson Section Master Rules

These rules are the production contract for all future units and weeks in `v6-test`. New lesson pages should be built from these rules rather than by copying older one-off implementations. If an older week conflicts with this document, preserve locked curriculum/content decisions but bring interaction behavior back to this contract.

## 1. Global lesson-flow rules

1. `daily-lessons.html` is the single Day Overview / Today’s Plan screen. Do not create a second competing day-plan layout for a week.
2. Each week gets one lesson runner that owns transitions **between** sections.
3. Each section page owns navigation **inside** that section.
4. The runner may intercept Previous only at the true first internal step of a section, and may intercept Next/Done only at the true final internal step.
5. Once a user moves past the first internal step, Previous must return to the immediately previous screen inside the section. It must never unexpectedly exit to the previous activity.
6. X / close / back-to-overview is the deliberate escape route from a section. Normal completion advances to the next section.
7. Preserve week and weekday in every route. Never allow a generic fallback to Week 1 or Monday.
8. Starting any card from the Day Overview should enter that section through the week’s lesson runner so completion continues forward.
9. Do not use hard-coded returns to a week-specific `*-plan.html` page when the shared Daily Lessons overview exists.
10. Do not redesign locked Week 1/2 visual structures without explicit approval.

## 2. Daily Lessons / Today’s Plan master

- Use the shared `daily-lessons.html` visual shell.
- Week selector and weekday selector must preserve the selected week/day.
- Lesson cards are clickable and route through that week’s runner with a section index.
- `Start Today’s Lessons` starts at section 0.
- The overview is not part of the sequential teaching path; it is a launch/return screen.
- Returning intentionally via X/back should preserve the current week and weekday.

## 3. Lesson runner master

The runner is a wrapper/orchestrator only. It must not duplicate lesson content.

- Runner responsibilities: section order, week/day persistence, transition to previous/next activity, completion state.
- Section responsibilities: internal pages/slides/cards, vocabulary screens, pop-outs, teacher notes, visuals.
- Previous boundary rule: runner owns Previous only when the section itself is at its first internal step.
- Forward boundary rule: runner owns Next/Done only when the section itself is at its final internal step and all required final teaching-stop behavior has been completed.
- The runner must resync boundaries after every internal navigation click; do not set a boundary once and leave it stale.
- Never infer section position from a button label alone when a reliable section state/count exists.
- When jumping directly to a middle section from the Day Overview, completion must still advance to the next section.

## 4. Community Meeting master

- Preserve the approved Community Meeting visual layout.
- Internal cards/steps use Previous and Next normally.
- On the first card only, Previous may become `Day Overview` through the runner.
- On the final card only, Done/Next advances to Read Aloud.
- X/close returns to Day Overview, preserving week/day.
- Mindful practice, conversation prompt, movement/game, and closing content must come from verified curriculum; EEA extensions must be explicitly labeled as extensions.
- Visual edit controls may be added without changing the approved classroom-facing composition.

## 5. Read Aloud master

### Required screen order

1. Before Reading / Before We Read blurb.
2. Adapted book pages in actual reading order.
3. Vocabulary pages inserted immediately after the adapted book slide that contains the curriculum cue.
4. Curriculum teaching-stop pop-outs attached to the adapted image that actually contains the printed book page/illustration.
5. Finish Read Aloud handoff to the next lesson section.

### Printed-page mapping

- Curriculum page numbers are printed book pages, not adapted slide numbers.
- Never use a blanket offset.
- Audit every stop against the adapted JPG/PNG illustration individually.
- If an adapted spread condenses multiple printed pages, attach the stop to the adapted image that contains the referenced illustration/text.

### Vocabulary

- True vocabulary terms are dedicated full vocabulary screens, not teaching-stop pop-ups.
- Vocabulary screens come after the associated book slide.
- Prediction/discussion questions remain pop-outs on the book illustration unless the curriculum explicitly treats them as vocabulary.
- Vocabulary Previous returns to the associated prior book slide.
- Vocabulary Continue moves to the next book/teaching screen.

### Before-reading blurb

- Every Read Aloud has a small pre-read purpose/setup blurb, including acting-out reads.
- Acting reads may have no page-specific teaching stops and still require the pre-read acting/setup guidance.
- Do not invent new curriculum questions merely because a read has no page-specific stops.

### Teaching stops

- On a slide with a teaching stop: first Next reveals the stop; second Next continues.
- A final-slide teaching stop must appear before Finish is allowed to leave the Read Aloud.
- Pop-outs should not permanently cover the book after the teacher continues.

### Previous navigation — locked rule

- Previous must always let the teacher revisit the prior Read Aloud screen/page for reiteration.
- Previous may leave the Read Aloud **only from the true first Read Aloud screen**.
- The runner must never leave a stale `Previous Activity` override attached after the user advances.
- On book pages, Previous goes to the previous book/teaching screen.
- On vocabulary pages, Previous goes back to the source book page.
- X/back is the intentional exit to Day Overview.

### Partial reads

- If the curriculum says read only the first half, the reader must actually stop at the designated adapted slide.
- The next read must resume at the verified adapted slide, not restart or continue past the stop point.

### Finish behavior

- Finish Read Aloud advances to the next lesson section through the runner.
- It must never route to a generic Read Aloud, Week 1 default, or Day Overview during normal completion.

## 6. Centers master

- Use the approved center-introduction card style.
- Show a real center visual; never leave literal placeholder text in production.
- If multiple center introductions occur that day, Next advances internally through them.
- Done on the final center advances to the next lesson section through the runner.
- X/close returns to Day Overview.
- Preserve image edit buttons where the approved pattern supports teacher customization.

## 7. Small Groups master

- Use the approved choice-card / lesson-card presentation.
- Use `Foundational Literacy` terminology; do not reintroduce retired `Heggerty` labels unless the curriculum explicitly requires it.
- Internal lesson navigation stays inside Small Groups.
- Final completion advances through the runner.
- X/close returns to Day Overview.
- Preserve verified curriculum activity names/materials; do not generate substitute activities to fill empty space.

## 8. Building Blocks master

- Building Blocks may use an entry/choice screen when multiple math experiences are available.
- The page must clearly distinguish choices from sequential required steps.
- Completing the selected/required Building Blocks flow advances to Storytelling through the runner.
- X/close returns to Day Overview.

## 9. Storytelling master

- Preserve the approved storytelling structure for the day/week.
- Do not display production placeholders such as `Visual placeholder` to children.
- Mon–Thu teacher story pages and Friday child-storytelling prompts should retain their established roles when used by the curriculum.
- Final completion advances to Closing Circle through the runner.
- X/close returns to Day Overview.

## 10. Closing Circle master

- Closing Circle is the final teaching section of the day unless a future curriculum explicitly adds another section.
- Internal steps stay inside Closing Circle.
- Final completion returns to the app Home screen, not a random lesson or Day Overview.
- X/close may return to Day Overview if the teacher intentionally exits early.

## 11. Visual and teacher-control rules

- Classroom-facing screens remain clean and SmartBoard-readable.
- Teacher Notes are secondary controls and should not replace curriculum prompts on the teaching screen.
- Editable visuals should use the established edit-button pattern without shifting the approved layout.
- Do not bake temporary debugging controls, placeholder labels, or population/test-mode text into production lesson pages.

## 12. Required QA before any week is called complete

For every weekday, test the full path from Day Overview:

1. Start Community Meeting.
2. Complete it and verify Read Aloud opens for the same week/day.
3. Verify the Read Aloud pre-read blurb.
4. Advance through every book slide, teaching stop, and vocabulary screen.
5. At several points, press Previous and verify it stays inside the Read Aloud and goes backward correctly.
6. Verify final teaching stops appear before Finish.
7. Finish Read Aloud and verify the next section opens.
8. Complete every later section and verify each advances to the next activity.
9. Verify X/back intentionally returns to the correct Day Overview.
10. Repeat by launching at least one middle lesson card directly from Day Overview.
11. Verify no route falls back to Week 1, Monday, Lola, or another generic default.
12. Verify no production placeholders remain.

A week is not approved until this end-to-end QA passes for all five days.

## 13. Future-unit build rule

When Unit 2+ is added, start from this contract and the latest approved section implementation. Do not copy a one-off older week and then patch differences. Build the week runner and section pages to satisfy this document first, then populate verified curriculum content.