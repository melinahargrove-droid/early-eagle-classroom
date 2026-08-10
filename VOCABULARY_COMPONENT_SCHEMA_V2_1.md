# Vocabulary Component Schema v2.1 — Permanent

This fixes the sequencing bug where a dedicated vocabulary visual could accidentally replace a book-spread slide.

## Data model
- **Book slide:** `type: "book"` and uses `img`.
- **Vocabulary slide:** `type: "vocabulary"` and uses `visual`.
- A vocabulary card may not use `img`.
- A book card may not point to `/vocabulary/` artwork.
- A vocabulary card may not point to `/lola-read1/book-*` artwork.

## Vocabulary component
Every vocabulary slide renders as one single card:
1. Word
2. Short preschool-friendly definition
3. Dedicated concept visual
4. Optional `Try It!` action

The concept visual is part of the vocabulary card. It never becomes its own slide.

## Read Aloud sequence
Book spread → vocabulary card (when required) → next book spread.

For this lesson:
- Pages 23–24 use `book-14.png`
- Next slide is **Exhausting** with `exhausting-visual.jpg`
- Then the after-reading discussion continues.
