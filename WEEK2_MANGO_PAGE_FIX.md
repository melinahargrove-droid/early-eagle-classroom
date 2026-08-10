# v5.20.09 — Week 2 Too Many Mangos Page Integration

Root cause:
- Week 1 Read 1 and Read 2 included actual adapted book-page cards.
- Week 2 Read 3 and Read 4 contained discussion/acting cards but did not include the book-page cards themselves.
- Therefore the supplied Mango assets were working, but Week 2 never asked the Read Aloud component to render them.

Fix:
- Week 2 Monday Read 3 now includes the actual second-half Mango pages at the curriculum stopping points.
- Week 2 Tuesday Read 4 now includes actual Mango pages before each acting point.
- The same shared Read Aloud placement rule is used; no Week 2-specific sizing override was added.
- Week 1 remains unchanged.
