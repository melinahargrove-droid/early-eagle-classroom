# v5.20.12 Clothing Memory access fix
Root cause: the renderer checked `lesson.title`, which is the generic value
"Literacy Small Groups". The curriculum activity name "Clothing Memory" is
stored in `lesson.title2`, so the Play button condition never became true.

Fix: trigger on `lesson.title2 === "Clothing Memory"` and show the game button
on the Find a Match activity card (2 of 4). The reusable game component itself
is unchanged.
