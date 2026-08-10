# v5.20.13 Clothing Memory opening fix

Root cause:
- `app.js` is intentionally wrapped in an IIFE.
- The new Memory Game controls used inline `onclick` calls.
- The Memory Game functions were private inside the IIFE, so clicking the visible
  button could not resolve `openMemoryGame()`.

Fix:
- Added a narrow public bridge for the five Memory Game actions.
- Kept the game state private.
- Replaced the footer's direct access to private `memoryGameState` with an
  exported `restartMemoryGame()` helper.
- No lesson sequence, curriculum data, or visual layout was changed.
