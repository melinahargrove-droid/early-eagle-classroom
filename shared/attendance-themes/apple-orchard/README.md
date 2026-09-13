# Apple Orchard — Shared Attendance Theme

This folder is the portable source-of-truth package for the finished Apple Orchard attendance theme.

## What belongs here
- `background.png` — approved child-facing Apple Orchard background
- `waiting-apple.png` — child piece used while Not Here Yet
- `basket-apple.png` — child piece used after check-in
- `thumbnail.png` — theme-picker thumbnail
- `theme-config.json` — locked basket curve, pile coordinates, counter offsets, and behavior
- `theme.js` — tiny renderer helper with no EEA-specific roster/state code
- `theme.css` — reusable theme classes

## Locked behavior
- Waiting/tree positions are stable and belong to each child.
- Checked-in apples fill the basket in check-in order using the approved overlapping pile coordinates.
- The basket front mask uses Melina's hand-traced curve.
- Names show on waiting apples and are hidden after check-in.
- Counter offsets are locked to Here (-4, 0) and Waiting (-8, +5) pixels.

## Integration rule
The host app owns roster, photos, AM/PM class state, attendance persistence, and click behavior. This theme package owns only Apple Orchard visuals/layout behavior.

Do not make Little Attendance or a commercial build depend on EEA localStorage keys. Copy/package this entire folder into each release so it works offline. GitHub is the master source, not a runtime dependency.
