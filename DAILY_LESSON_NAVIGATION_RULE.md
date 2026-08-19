# Early Eagle Academy — Daily Lesson Navigation Rule

Status: LOCKED design/behavior rule unless explicitly changed by the user.

## Core rule

The **day is the navigation container**. Lesson navigation must never advance from one weekday's component to the same component on the next weekday.

For every curriculum week, selecting a day creates one continuous teaching path for that day.

### Standard daily sequence

1. Community Meeting
2. Read Aloud
3. Centers
4. Storytelling
5. Closing Circle
6. Daily lesson complete / return to Daily Lessons

Example for Week 2 Monday:

`Monday Community Meeting → Monday Read Aloud → Monday Centers → Monday Storytelling → Monday Closing Circle → Done`

The same structure applies independently to Tuesday, Wednesday, Thursday, and Friday.

## Multi-screen lesson rule

If a component contains multiple child-facing screens/pages, the **Next** control must advance through those internal screens first. Only after the component's final internal screen should **Next** hand off to the next component in the same selected day.

Example:

`Monday Read Aloud page 1 → page 2 → page 3 → final page → Monday Centers`

## What must never happen

- Monday Community Meeting → Tuesday Community Meeting
- Monday Read Aloud → Tuesday Read Aloud
- Cycling through weekdays before completing the current day's lesson sequence
- Returning to the hub between components unless the teacher intentionally chooses to leave

## Scope

This rule applies to:

- Week 1 and Week 2 already in the app
- Every future curriculum week added to the Classroom Companion
- Every current and future lesson component that uses Next/Previous navigation
- Any new curriculum section inserted into the daily sequence later

If the daily sequence is expanded in the future, the new component is inserted into the selected day's path rather than creating a separate weekday carousel.

## Navigation state

The app should preserve the selected `week`, `day`, and current `component` while moving between lesson pages. Internal page state belongs to the individual component. A component handoff must keep the original week/day unchanged.
