# v5.20.23 — Weather Overlay Only

This build is based directly on v5.20.17, the last known-good Home layout before weather experiments.

Weather architecture:
- Two absolute-positioned canvas overlays only.
- No changes to dashboard-grid, topbar, timer, Friends Today, tool dock, Teacher Mode, or panel sizing/placement.
- Live Mayfield, KY weather fetched via Open-Meteo using fixed Mayfield coordinates.
- Seasonal rendering is layered inside the canvases.
- Cached fallback is used if live weather fails.
- Refresh every 15 minutes.

Goal: weather must never participate in or modify Home layout.
