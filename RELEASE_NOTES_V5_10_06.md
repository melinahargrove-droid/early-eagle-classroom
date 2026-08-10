# v5.10.06 — Read Aloud → Centers Progression Fix

Root cause:
The Read Aloud uses its own teaching-flow screen and completion function. That function marked Read Aloud complete but forced the shared lesson index to 1, which is the Read Aloud position itself.

Fix:
- On Read Aloud completion, locate Read Aloud in the current daily lesson path.
- Advance the shared lesson index to the item immediately after it.
- Return to Today's Lessons and render that next item.
- For the current Week 1 path, the next item is Centers.
- No Read Aloud content, visuals, or internal card sequence changed.
