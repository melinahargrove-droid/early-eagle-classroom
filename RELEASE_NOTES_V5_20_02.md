# v5.20.02 — App Initialization / Viewport Regression Fix

Root cause:
- v5.20.01 contained an invalid JavaScript expression in a dynamically generated
  Read Aloud image `alt` attribute.
- That syntax error prevented `app.js` from loading at all.
- Because app initialization did not run, the normal 1920×1080 viewport scaling
  and positioning logic never executed, which made the dashboard appear shifted
  down and to the right.

Fix:
- Corrected the malformed JavaScript string.
- Verified `app.js` with `node --check` before packaging.
- Preserved the existing dashboard CSS and layout unchanged.
- Preserved all Too Many Mangos Week 1 Read Aloud content and supplied adapted
  book-page assets.
