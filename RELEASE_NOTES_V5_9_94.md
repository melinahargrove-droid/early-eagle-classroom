# v5.9.94 — Community Meeting Parent-Grid Root Fix

Root cause fixed:

The Daily Lessons stage (`.lesson-stage-content`) is itself a two-column grid.
The entire Community Meeting component was being inserted into only the first
column of that parent grid. That is why the visual remained narrow even after
the internal Community Meeting layout was changed, and why a huge blank area
remained on the right.

Fix:
- Community Meeting now spans BOTH parent stage columns (`grid-column: 1 / -1`).
- The reusable component then divides the full stage into approximately:
  - 38% teaching copy
  - 62% demonstration visual
- The illustration retains its natural aspect ratio with `object-fit: contain`.
- The same full-stage behavior applies to future Community Meeting visual cards.
- Curriculum data, sequence, Teacher Materials, Quick Tools, and navigation are unchanged.
