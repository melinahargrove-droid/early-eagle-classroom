# v5.9.84 — Vocabulary Component/Sequence Structural Fix

- Fixed the root sequencing bug instead of patching individual slides.
- Book slides and vocabulary slides now use different asset fields:
  - books = `img`
  - vocabulary = `visual`
- Restored Pages 23–24 to the actual book spread (`book-14.png`).
- `Exhausting` now contains its dedicated tired-child visual inside the same vocabulary card.
- `Jumping pants` uses the same reusable component/schema.
- Added validation that catches:
  - vocabulary cards using `img`
  - vocabulary visuals pointing to book spreads
  - book slides pointing to vocabulary artwork
  - vocabulary cards missing a dedicated visual
- Dedicated vocabulary visuals can no longer accidentally become standalone book slides.
