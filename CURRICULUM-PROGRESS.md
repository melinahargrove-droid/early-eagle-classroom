# Curriculum Image Progress

Updated: October 1, 2026 (America/Chicago).

## Completed work — seasonal attendance asset restoration

### Pumpkin Patch and Halloween attendance — October 1, 2026

**Done and verified:** Both selectable themes route through `attendance.html` to the active `attendance-approved.html`. Eight referenced PNGs under `v6-test/assets/assets/attendance-themes/` were missing, while the exact originals already existed at the repository root. All eight live target paths returned 404 before repair. The matching pumpkin/haunted-house backgrounds, crate/bucket overlays and pumpkin/ghost/candy frames are now restored as byte-identical copies at their original references. Root originals remain intact; no artwork was generated, edited, moved or replaced.

`attendance-approved.html` remains byte-for-byte unchanged (SHA-256 `11ed98a3fa2848b585f483177461571001d31bc5a0b5ab55bfdc8e5e08887e67`), including positions, settings, roster/attendance handling and controls. Router, selector, other themes, curriculum and service worker are unchanged. The cache stays `eea-companion-v82`; unsuccessful responses are not stored, so restored files load at their existing URLs without a cache change. Copying into V6 keeps ZIP/Windows packaging self-contained rather than depending on root-relative external files.

**Tests and publication:** The focused regression failed against the original missing pumpkin asset, then passed after restoration. It pins all eight original SHA-256 hashes and PNG dimensions, the unchanged page hash and both routes, and exercises the empty state plus 202 synthetic pieces across every size bucket through waiting/here, photo toggle and reset. All existing local regressions, 145 inline scripts, static references, core JavaScript syntax and whitespace pass. Independent review found no blocking issues.

Both push and PR audit/Chromium runs and both Windows builds passed on exact head `1f65179f9b17807bccdd916f989aa622b1d863fa`. Isolated Chromium serves only V6 package files; it reproduces the original 404 failures, then verifies both selectors/redirects, decoded backgrounds/overlays/CSS portrait frames, waiting/here transitions, saved attendance after reload, photo controls/reset, close/re-entry and empty state without JavaScript page errors. The [eight synthetic before/after screenshots](https://github.com/melinahargrove-droid/early-eagle-classroom/actions/runs/36855805987/artifacts/11158477506) were inspected. PR [#228](https://github.com/melinahargrove-droid/early-eagle-classroom/pull/228) merged as `365393453f8d19687bc0596afb38a5dfea553eed`; remote/main's tree matched the tested head. Merged-main audit, Windows build, ZIP package and [Pages deployment #36856372542](https://github.com/melinahargrove-droid/early-eagle-classroom/actions/runs/36856372542) all succeeded. The ZIP build log explicitly includes and successfully tests all eight files.

**Actual published app:** All eight restored URLs return HTTP 200 and match the root originals byte-for-byte. Each decoded at its original dimensions in the cloud browser; the pumpkin background previously observed as a live 404 now visibly loads. At 1180×757, the theme selector reaches each existing empty-class attendance view, with the correct pumpkin/halloween stage and no roster pieces; reload preserves each route. The original cloud test theme, School Bus, was restored afterward. No class roster was created or cleared, and no real student records/photos were used. No app-origin warning/error was captured after publication; browser-extension metadata errors were separate.

**Limits:** Empty attendance intentionally exits before rendering scene images, so populated-state interaction and visual composition are verified only in isolated CI with synthetic data. The live browser verified deployed asset decoding and both empty-state routes, not a populated classroom session. Local Chromium cannot launch because its socket operation is unavailable. Installed-PWA upgrades, first-use offline behavior and physical classroom-device acceptance are not claimed. Existing layout and positioning remain unchanged.

**Next:** This defined asset-only repair is complete. No adjacent implementation is included.

## Completed work — Week 8 Triangle Hunt picture and access

### Unit 1 Week 8 Centers — October 1, 2026

**Done and verified in the actual app:** Reproduced Thursday's Revisit Triangle Hunt loading missing `assets/math.webp` with zero natural dimensions, plus the normal Daily Lessons → Week 8 → Thursday → Centers route skipping the second page entirely. The revisit now reuses Tuesday's existing `assets/focus-3s/unit-1/week-8/centers/triangle-hunt.png`. Its inspected pixels show children searching classroom triangle templates with clipboards, matching the original lesson and revisit directions. Original image SHA-256 remains `5cf6625ea591405c3f3b66dd9abe5dea04676bdb8b98135026c05d0eb5c4cc3f`; no artwork was created, edited or replaced.

Following the established Weeks 3–5 pattern, Centers exposes its actual index/total and recognizes the existing runner parameter. The runner reads that state for the final Centers boundary, including at click time, so all 33 internal teaching pages remain reachable and the last page alone hands off to same-day Thinking & Feedback. A normalized data hash permits only this exact revisit image change; all teaching text, day mappings, other artwork, layout and other Week 8 lesson sections remain unchanged. Cache is `eea-companion-v82`; Unit 2 remains sections v30 / reader v20.

**Tests and publication:** The focused regression fails against the original missing-image mapping. Independent negative controls also fail with the original runner and with the live-state click guard removed. Local tests pass all 33 Week 8 teaching pages across five day flows (9/6/10/2/6), exact content/image mappings, Teacher Notes, repeated synchronization, rapid internal clicks, a deliberately stale final-boundary marker and same-day final handoffs. Existing regressions pass 32 Week 1 Centers pages, 47 Week 2 reader pages plus Community flows, 89 Weeks 3–5 Centers pages, 108 Unit 2 renders/history checks, 145 inline scripts, static references, core syntax and whitespace. Independent review found no blocking issues.

Both push and PR audit/Chromium runs and both Windows builds passed on exact head `20f1faaea4067a4cbc8e0d20cc4baf7c1be85033`. The Chromium suite covers normal Daily Lessons entry for every weekday, all 33 decoded images, repeated notes, same-task rapid clicks, standalone/revisit variants, reload and the original Tuesday introduction, with no JavaScript page errors. PR [#226](https://github.com/melinahargrove-droid/early-eagle-classroom/pull/226) merged as `9a017e215a320d24c3f79c9c357cf707af1c6fb3`. Remote/main and all seven published files matched the tested tree; the three live runtime files matched byte-for-byte. Merged-main audit, Windows build, ZIP package and [Pages deployment #36853253326](https://github.com/melinahargrove-droid/early-eagle-classroom/actions/runs/36853253326) all succeeded.

**Actual published app:** At 1180×757 in the cloud browser, entered Centers through Daily Lessons on all five weekdays and traversed all 33 original teaching pages. Every image decoded at 1536×1024; Teacher Notes opened and closed on every page; each internal Next Step/Next Center stayed within the lesson and every final handoff reached same-day Thinking & Feedback. Thursday's normal entry and repeated reentry now reach the restored picture visibly in the preserved layout. Standalone Thursday progression, direct revisit and both existing runner-parameter variants, reload, Review Original Introduction, and browser Back/Forward between the standalone revisit and original introduction also passed. The original Tuesday hunt image remained identical. No app-origin warnings or errors were captured after deployment; extension metadata errors were separate from the app.

**Limits:** Local Chromium was unavailable; real-browser automation passed in CI and the deployed app was checked separately in the cloud browser. JSDOM rapid-click testing lets pending visual promises settle before destroying its iframe, then clears the final-boundary marker; CI exercises the entire rapid sequence in one actual browser task. Extra clicks after final navigation, installed-PWA/service-worker upgrades/offline behavior and physical classroom-device acceptance are not claimed. Existing Centers X and editor/Review Original auxiliary return semantics were not changed; browser Back/Forward acceptance above is limited to the observed standalone revisit/original-introduction pair.

**Next:** This defined picture/access chunk is complete. No adjacent implementation is included. Keep any Centers outer-exit/auxiliary-return work and PR #121 curriculum proposals separate.

## Completed work — Week 1 Centers exit repair

### Unit 1 Week 1 Centers return — September 30, 2026

**Done and verified in the actual app:** Reproduced Daily Lessons → Week 1 → Monday → Centers → Next Step → X loading the current weekday's Day Overview inside the iframe while the outer URL/title remained the Monday runner. The Week 1 runner now binds only Centers' existing `#exit` to its existing outer Day Overview function, with explicit week 1 and the selected weekday. Teacher Notes' separate `#close` still dismisses only its panel. The complete Centers HTML remains byte-for-byte unchanged (SHA-256 `652f118a9ea08b194e97ca02518408a187b3ce8bd9ce03f341a0d64b7e89352c`), preserving all 32 teaching pages, mappings, images, styles, Review Original links and internal Next/Done handlers. Final Done still reaches the same day's Storytelling. Cache is `eea-companion-v81`; Unit 2 remains sections v30 / reader v20.

**Tests and publication:** The focused JSDOM regression and an independent negative control fail against the original code at the missing outer-overview assertion, then pass with the fix. Local checks pass all 32 Week 1 Centers pages, 47 Week 2 reader pages plus Community return flows, 89 Weeks 3–5 Centers/Math pages, 108 Unit 2 renders/history checks, 145 inline scripts, static references, core syntax and whitespace. The full Centers page hash guards against unrelated content or layout changes. Existing audit CI now includes first/internal/final X for all weekdays, repeated real overview reentry without nested runners, Back/Forward, no false completion on exit, notes-close separation, all 32 original image decodes, and same-day final Storytelling handoffs. It waits for the original page's animation-frame image assignment rather than changing the rendering behavior.

Both push and PR audits, including all existing and new real-Chromium regressions without JavaScript page errors, passed on exact final head `82a2643b1e23592bd1804b8f219f9878a12212df`. The PR Windows build passed. PR [#224](https://github.com/melinahargrove-droid/early-eagle-classroom/pull/224) merged as `686e43b0700e7f8165dc5d8fed70ce5fb1ac5936`; remote/main and all six published files were verified. Merged-main audit, Windows build, ZIP package and [Pages deployment #36809269954](https://github.com/melinahargrove-droid/early-eagle-classroom/actions/runs/36809269954) succeeded.

**Actual published app:** At 1188×761 in the cloud browser, entered all five weekdays through Daily Lessons → Open Centers. X from every first page and after Next returned to the top-level overview with the exact week/day preserved and no iframe. Thursday/Friday's after-Next checks exercised their final pages. Reentered every day repeatedly with no nested runner, traversed all 32 original teaching pages (10/8/10/2/2), decoded every original image, opened/closed Teacher Notes independently on each page, and verified each final Done → same-day Storytelling. Friday Back/Forward restored the correct Centers/overview pair with no nesting. Screenshots confirmed the preserved lesson layout and correct Friday overview. No app-origin warnings or JavaScript errors were captured; browser-extension metadata errors were separate from the app.

**Limits:** JSDOM captures only the outer overview assignment because it cannot execute full navigation. Unmodified full navigation is covered in real Chromium and the published browser. The existing hidden runner Day Overview handler was exercised programmatically in automated tests; no new visible control was added. Review Original/editor auxiliary return semantics, installed-PWA/offline behavior and classroom-device acceptance are not claimed. No curriculum, features, artwork, redesign or other-week runtime code changed.

**Next:** This defined Week 1 Centers exit chunk is complete. No adjacent implementation is included. Keep Week 8 missing art, custom editor/Review Original return paths and PR #121 curriculum proposals separate.

## Completed work — Week 2 Community return repair

### Unit 1 Week 2 Community Meeting return — September 30, 2026

**Done and verified in the actual app:** Reproduced the published reader Previous → Community final page → inert Next: Read Aloud sequence in the cloud browser. The runner inferred boundaries from labels/disabled state that its own synchronization changes. Community now exposes its existing index/total; the runner reads that state for both boundaries and internal reset/landing, restores the internal Previous label, and prepares each document once. The original Community HTML is byte-for-byte unchanged except for the read-only state function. No lesson, book/day mapping, image, layout, other week, or curriculum proposal changed. Cache is `eea-companion-v80`; Unit 2 remains sections v30 / reader v20.

**Tests and publication:** The new regression failed on the original delayed final-boundary assertion before the fix. Local tests pass all 47 reader pages, five-day Community return flows, 89 Centers/Math pages, 108 Unit 2 renders/history, all 145 inline scripts, static references, required core syntax and whitespace. Existing Chromium coverage now includes delayed/repeated synchronization, first/final/internal controls, repeated Teacher Notes, two-way Community ↔ reader round trips, completed Community restart, duplicate preparation, Community image decoding, and intentional outer Overview/Exit for all five weekdays. The test server now decodes the existing spaced PNG filenames and waits for the runner's existing next-task control synchronization. No new workflow was added.

Both push and PR audits passed on final head `7236ff3991ae60bba639792edadadb6e21f371e0`, including the full Week 2, Centers/Math and Unit 2 real-Chromium regressions with no JavaScript page errors. The required PR Windows build passed. PR [#222](https://github.com/melinahargrove-droid/early-eagle-classroom/pull/222) merged as `154afab214ce96f8eee68ee8c0d961ed77c4b3a2`; remote/main was verified. Merged-main audit, ZIP package, Windows build and [Pages deployment #36806674219](https://github.com/melinahargrove-droid/early-eagle-classroom/actions/runs/36806674219) succeeded.

**Actual published app:** At 1188×761 in the cloud browser, verified all five weekdays: reader Previous lands at Community's final Name Movements page; repeated Teacher Notes and delayed sync preserve Next: Read Aloud; internal Previous reaches Child Pose and stable Day Overview; internal Next stays within Community; repeated final handoffs reopen the correct weekday's first reader page. Both existing Community illustrations decode at 1536×1024 and the preserved layout was visually inspected. Deliberate first-page Day Overview and × each return the outer window to the correct week/day overview. Tuesday–Friday were entered through actual Daily Lessons → Open Read Aloud controls. No app-origin JavaScript errors were captured; browser-extension metadata errors were separate from the app.

**Limits:** JSDOM's Community navigation tests omit only the visual override helper because its queued MutationObservers outlive JSDOM's destroyed iframe globals. Real Chromium runs the actual helper without stubbing and verifies both images and clean teardown. Installed-PWA/offline behavior, custom-image editor return semantics, and physical classroom-device acceptance are not claimed. No new artwork or curriculum interpretation was included.

**Next:** This defined Community return chunk is complete. The earlier deferred Week 2 return issue below is resolved by this entry. Keep unrelated visual/editor return work, Week 8's missing math asset and PR #121 curriculum proposals separate; do not start adjacent work from this chunk automatically.

## Active work — approved Unit 1 missing math visuals

### Unit 1 Weeks 4–5 Math pictures — September 30, 2026

**Done:** The user approved creating and inserting lesson-specific watercolor pictures without a draft review. Read the official Cubes With Friends and Making Groups lessons and inspected the linked group template. Created six source-grounded realistic-watercolor pictures for the nine previously blank Math teaching screens: Week 4 Monday's four steps and Thursday revisit; Week 5 Monday's three steps and Thursday revisit. Checked the single cube, three-cube stack, group of two portraits, and groups of two and three. Original PNGs are retained in Library; optimized same-resolution WebP derivatives are used in the app. See `v6-test/assets/focus-3s/unit-1/math-visuals-source.md` for sources, mappings, original hashes, and prompts.

Every existing lesson field, day mapping, page style, control, and finished asset is preserved except the four missing Math card image paths and three targeted step-image overrides. Regression hashes normalize only those exact approved image fields before comparing to the unchanged original curriculum hashes. Cache advances to `eea-companion-v79`. Unit 2 stays sections v30 / reader v20.

**Done — tests and publication:** All 89 Centers DOM pages, all 47 Week 2 reader pages, all 108 Unit 2 section renders/history checks, 145 inline scripts, core JavaScript syntax, static references, and whitespace pass locally. The Centers browser test now requires all 89 image displays to decode, including all nine repaired Math screens. Both push and PR audit/Chromium runs and both Windows builds passed on exact head `b8b269a385ec5d74124575723bd87cfc4b48cac9`. PR [#220](https://github.com/melinahargrove-droid/early-eagle-classroom/pull/220) merged as `aa944b947ff4cc0494617742f329fec68ac7dce3`; remote/main and all six asset blob hashes were verified. Merged-main audit, ZIP package, Windows build, and [Pages deployment #36803577660](https://github.com/melinahargrove-droid/early-eagle-classroom/actions/runs/36803577660) succeeded.

**Done — actual published app:** In the cloud browser at 1188×761, entered the affected days through Daily Lessons → Open Centers and traversed all 25 teaching screens across Week 4 Monday/Thursday and Week 5 Monday/Thursday. All nine new Math displays decoded at 1536×1024 and were visually inspected in their preserved layouts. Verified the single cube, the exactly-three-cube stack, the two portrait cards, and the separately grouped two/three cards. Repeated Teacher Notes open/close worked on every affected Math screen. Internal Next Step/Next Center stayed inside Centers; each day's final handoff reached the correct same-day Thinking & Feedback. X returned the outer window to the correct week/day overview for all four affected day flows. No app-origin warnings or JavaScript errors were captured. The six retained originals, all pre-existing completed artwork, and all teaching content remain intact.

**In progress:** None within this nine-screen Math-picture chunk; the implementation and live acceptance are complete.

**Next:** This approved missing-Math-visual chunk is complete. Resume only another clearly defined approved task from this checkpoint; do not automatically replace unrelated Week 8 art or expand curriculum/navigation scope.

**Waiting / deliberately outside this chunk:** No user draft approval is needed. Week 8's separate missing math asset, Week 2 Community return issue, auxiliary Review Original/editor return semantics, installed-PWA/offline behavior and physical classroom-device acceptance remain outside this repair.

## Active work — approved Unit 1 runtime repairs

On September 30, 2026, the user approved repairing the broken Unit 1 Read Aloud and Centers scripts after the completed Unit 2 Week 1 work. Finish one defined chunk before starting the next: Week 2 Read Aloud first, then the known Weeks 3–5 Centers script errors. This limited runtime scope supersedes the earlier Unit 1 deferral; it does not authorize curriculum remapping or redesign. Preserve the current published book/day mappings, lesson content, assets, and structure. PR #121's curriculum changes remain outside this repair.

### Unit 1 Weeks 3–5 Centers — runtime repair — September 30, 2026

**Done and verified in the actual app:** Reproduced the published Week 3 blank Centers view and `Unexpected token ':'` in the cloud browser. All three Centers files had the same misplaced closing array bracket: Monday was not closed before Tuesday, and an extra bracket closed Friday. Moved only those two brackets per data object. Exact data-byte comparison and pinned data hashes confirm every existing lesson field, day mapping, image path, markup and style remains unchanged.

After the syntax repair, reproduced all three lesson runners skipping from the first Centers screen directly to Thinking & Feedback. Centers now expose their actual teaching-step state; runners hand off only after the final internal step. Final button labels name the already-existing Thinking & Feedback destination, and Centers' X leaves the outer runner for the same week/day overview. Week 3 final-page landing uses the existing Centers advance control. No new Previous control or enlargement dialog was added. Cache is `eea-companion-v78`; Unit 2 remains sections v30 / reader v20 unchanged. No image asset files, Unit 2 files or Week 2 reader files were modified.

Local JSDOM tests pass all **89 existing Centers teaching pages across all 15 day flows**: exact titles, directions, materials, vocabulary, image mappings, repeated Teacher Notes, repeated runner synchronization, same-day final handoffs and Week 3 end landing. The inline audit now compiles **all 145 scripts with no allowlist**. Static references, required core syntax and whitespace pass. Existing Week 2 reader and Unit 2 history DOM regressions remain green.

Both push and PR audits passed on exact head `2d0a8f14b1d4712fda67c173f8a17b9afc3f2841`, including real Chromium tests for all 89 Centers screens, all available image decoding, repeated notes, final same-day handoffs and outer Exit on each weekday. The existing full Week 2 reader and Unit 2 history/dialog Chromium regressions also passed with no JavaScript page errors. Both Windows checks passed. PR [#218](https://github.com/melinahargrove-droid/early-eagle-classroom/pull/218) merged as `3e67da858cdca4fc24d4321d0b48b92782819c9f`; remote/main was verified. Merged-main audit, ZIP package, Windows build and [Pages deployment #36773106292](https://github.com/melinahargrove-droid/early-eagle-classroom/actions/runs/36773106292) all succeeded. This Pages run deployed normally on its first attempt.

Actual published cloud-browser checks at **1180×757** passed all 15 day flows and all 89 teaching screens: full internal Next Step/Next Center sequences, repeated Teacher Notes open/close on first and last screens, correct final Thinking & Feedback handoff retaining the weekday, and deliberate X returning the outer window to the correct week/day overview. Week 5 Friday also launched through the actual Daily Lessons → Open Centers control; Week 3 Tuesday end landing opened its final Model the Routine screen. Screenshots confirmed the preserved large illustration/directions layout and final handoff button. All **80 screens with available original illustrations** decode at **1536×1024**. No app-origin JavaScript errors were captured after deployment.

Live regression smoke checks also passed: Week 2 Monday I Love Us! reader → same-day Centers, plus Unit 2 Thursday Writing page 8 → Centers page 5 → browser Back restoring Writing page 8 / selector 7 / URL step 7, and Forward restoring Centers page 5 / selector 4 / URL step 4. Existing Playdough artwork remained visible.

**Separate known image blocker, unchanged:** `assets/math.webp` is absent from the repository and fails to load in the live app. Four cards use it, totaling **nine teaching screens**: Week 4 Monday Cubes With Friends (four steps), Thursday Revisit Cubes With Friends (one), Week 5 Monday Making Groups (three), and Thursday Revisit Making Groups (one). Those exact mappings remain preserved; replacement artwork was not chosen or invented. This runtime acceptance does not claim those images are repaired.

**Other acceptance limits:** Existing Review Original Introduction and visual-editor auxiliary-page return semantics were not changed or accepted as part of this narrow runtime repair. These Centers pages have no existing Previous control or enlargement modal. Existing source-warning cards and all curriculum interpretation remain untouched. The earlier Week 2 Community return issue remains deferred. Installed-PWA/offline and classroom-device acceptance remain unverified.

**Next:** The three known Weeks 3–5 Centers inline-script failures and premature-finish defects are complete. Keep any missing-image restoration and auxiliary return-flow work separate; verify the intended existing source/pattern before proposing a next chunk. Do not apply PR #121's curriculum changes or expand into unrelated Unit 1 navigation or redesign.

### Unit 1 Week 2 Read Aloud — runtime repair — September 30, 2026

**Done and verified in the actual app:** Reproduced the published blank title, uninitialized image and inert Next button in the cloud browser, with `SyntaxError: Unexpected token ')'`. Removed exactly three surplus closing parentheses from the Wednesday–Friday data objects. All five days now initialize: Monday/Tuesday retain I Love Us! and their existing reading illustration; Wednesday–Friday retain Shhh! and the same 15 Google support-slide URLs. No lesson text, source mappings or image files changed.

The runner's repeated synchronization also erased its own reader boundary markers after replacing button labels. It now uses the reader's index/total state for first/final-page detection; its internal reset stops at reader page zero instead of treating the enabled Community Meeting boundary as another internal Previous click. This is restricted to the Week 2 reader path. Cache advanced to `eea-companion-v77`. Unit 2 remains on sections v30 / reader v20 without modifications.

Local checks: all 47 existing Week 2 reader page renders across five weekdays, image URL mappings, guide toggle, repeated Teacher Notes open/close, internal Previous/Next, final-page landing and same-day Centers handoff pass in JSDOM. Existing Unit 2 regression passes all 108 section renders plus history/resume behavior. Static-reference audit, core syntax and whitespace checks pass. New inline-script compilation checks 142 scripts successfully and explicitly reports only the three previously known Centers errors in `week3-intro-centers.html`, `week4-intro-centers.html`, and `week5-intro-centers.html`; these are deferred, not presented as passing. CI also runs real Chromium Week 2 reader and existing Unit 2 history regressions. Both PR and push audit/Windows checks passed on exact head `870e8529c8a88dbe6d5ea256a0b5b247573a1ddb`. The Chromium logs confirm all five reader days and the full existing Unit 2 history/dialog regression with no JavaScript page errors. PR [#216](https://github.com/melinahargrove-droid/early-eagle-classroom/pull/216) merged as `f5d7c52520acfe643f13aa5e930efe84e9eab286`; remote/main is verified. Merged-main audit, ZIP packaging and Windows build passed.

[Pages deployment #36762079447](https://github.com/melinahargrove-droid/early-eagle-classroom/actions/runs/36762079447) initially built successfully but its deploy job remained at “waiting for github-pages deployment approval.” The current connection could not approve it, no reviewers were listed, and the signed-in owner's Summary showed no approval control. The exact cause was not established. The user cancelled that stuck attempt at 19:57 UTC. One supported retry of the same deploy job, commit and environment then completed successfully at 20:03 UTC. No protections, repository settings, code or access permissions were changed to recover deployment.

Actual live cloud-browser checks at **1180×757** passed all five reader days and all **47 existing page steps**: expected titles/read numbers, internal Next/Previous, stable final handoffs to the correct weekday's Centers, hidden-guide reveal before advancing, repeated Teacher Notes open/close, final-page landing, deliberate Exit with Friday preserved, and first-page Previous reaching Wednesday Community Meeting. Tuesday was also launched through the actual Daily Lessons → Open Read Aloud control. Monday/Tuesday's original local illustration decodes at 1536×1024. All **15 distinct Google support-slide images** loaded in the embedded Thursday reader at 960×540; the same preserved URLs are used Wednesday–Friday. Direct export navigation had produced `ERR_BLOCKED_BY_CLIENT`, but embedded-image verification resolved that concern: no in-app image-access blocker was found. Visible screenshot inspection confirmed the support image and teaching-guide overlay. No app-origin JavaScript errors were captured during the published checks.

A live Unit 2 smoke check also passed: Thursday Writing page 8 → Centers page 5 → browser Back restores Writing page 8 / selector 7 / URL step 7, and Forward restores Centers page 5 / selector 4 / URL step 4. Existing Playdough artwork was visible. The full Unit 2 Chromium regression remains green, and all Unit 2 code/assets are unchanged by this repair.

**Known separate limitation:** Reader Previous reaches Community Meeting's last page, but Community's own repeated synchronization clears its Next-to-Read-Aloud boundary. This pre-existing section-0 defect was confirmed in the live app and remains explicitly deferred. This checkpoint accepts the scoped reader runtime repair, not all Week 2 navigation. Installed-PWA/offline and classroom-device acceptance remain unverified.

**Next:** Repair the three known Week 3–5 Centers inline-script failures as the next defined chunk. Preserve all current curriculum, images and structure. Keep the Community return issue recorded separately; do not expand scope or apply PR #121's curriculum changes.

## Completed work — Unit 2 Week 1

### Unit 2 Week 1 — browser history synchronization — September 30, 2026

**Done and verified in the actual app:** Reproduced the current published bug in the cloud browser: Thursday Writing → Extend and connect home → Next: Centers → Playdough Explore → browser Back showed Vocabulary / 1 of 8, while the selector still chose Extend and connect home and Previous incorrectly said Writing. The iframe returned to Writing but the runner retained its Centers section; the browser also restored a select value independently from the freshly initialized lesson index.

The focused repair stores the internal step in the existing section URL/history entry (no new entries for internal steps), restores the rendered index from that URL, and normalizes the selector after browser form restoration. The runner derives the section from its actual loaded lesson, synchronizes its URL and existing section-only resume state, and avoids duplicate listeners on restored documents. Section handoffs retain their existing first-page behavior. Read Aloud retains its own page/teaching-stop state and is not given a section-step parameter. No lesson text, images, layouts, section order, or other units are changed.

Active section script: `week9-sections-v30.js`; reader unchanged at `week9-read-aloud-v20.js`; service-worker cache: `eea-companion-v76`. Prior versioned files are preserved. All **108 existing section renders and layout classes** match v29 across all weekdays. DOM regression tests cover reconstructed Writing/Centers history URLs, repeated restoration, page counter/selector/URL/saved-section agreement, deferred form restoration, invalid steps, internal Previous/Next, no extra internal history entries, and repeated preparation without duplicate boundary handling. Static references, required core syntax, active section/runner syntax, and whitespace pass.

A dedicated Chromium regression is included in the static-audit workflow to test actual Back/Forward, reload, both shared Favorite Foods flows, soup-page selection, enlargement Close/Escape, Playdough cancellation, Exit/return, Finish, weekday-specific boundaries, and Read Aloud teaching-stop behavior. Both push and PR audits passed on final head `eba35ade38a69f7619a43060f7139618b992a2d7`, including the complete Chromium regression with no page errors; the required PR Windows build also passed. PR [#214](https://github.com/melinahargrove-droid/early-eagle-classroom/pull/214) merged as `e681ce80d24e3137989c4aa3e65e6381ae908826`; remote/main was verified. Merged-main static/browser audit, ZIP packaging, Windows build and [Pages deployment](https://github.com/melinahargrove-droid/early-eagle-classroom/actions/runs/36756702886) all succeeded.

Actual cloud-browser verification at **1180×757** passed: Writing page 8 → Centers Explore → Back restores the exact Writing page 8 and matching selector, count, Previous/Next labels, and outer/iframe URLs; Forward restores Centers page 5. Repeated Back/Forward and reload remain aligned. Centers page 13 → Math → repeated Back/Forward also restores the correct endpoints. Model writing enlargement, repeated Close and Escape, Notice food colors' same-page book selection and Escape, internal Previous/Next, and deliberate Exit → browser Back all passed. The original Model writing source visual/layout remains intact and was visually inspected. CI enables BFCache but its observed Exit/Back was a reconstructed document (`pageshow.persisted: false`), so BFCache-specific acceptance is not claimed. Installed-PWA/offline and classroom-device acceptance remain unverified.

**Next:** This navigation chunk is complete. Read-only inventory of the remaining active Unit 2 Week 1 visuals found no further objectively missing visual, and no additional objectively broken item is currently verified. Do not invent additional image work or redesigns. Continue only from a clearly verified unfinished item within the approved scope; ask about subjective curriculum/design decisions. Unit 1 and Unit 2 Week 2 remain deferred.

### Favorite Foods — Model writing source visual — September 30, 2026

**Done and verified in the actual app:** Model writing uses the authoritative one-page Favorite Foods picture-and-word sheet. Rendered the complete original PDF page at 2400×1855 as `assets/focus-3s/unit-2/week-1/centers/favorite-foods-visual.jpg`, with all 15 food labels, title, and Boston Public Schools attribution preserved and visually inspected. No invented or redrawn art. Source: [Favorite Foods Visuals PDF](https://drive.google.com/file/d/1ibp6u7YMAtoQ7siuVXmtZ9dUrasJUdWt/view); PDF SHA-256 `fe5cd576ff358dd454b7eca0313f92203aa32bf885797c70fa13d7a2cb6e1875`; JPEG SHA-256 `ca79a0441a508d3dee35f6bd1372efc9887142e7562561f0469fa66ec74e1c31`. Reproducible rasterization: `pdftoppm -f 1 -singlefile -scale-to 2400 -jpeg -jpegopt quality=95,optimize=y` on the original source PDF.

The existing large-image/teaching-directions and native enlargement-dialog pattern is reused. Thursday Writing **4 of 8**, Thursday Centers **9 of 13**, and Friday's optional Writing revisit use the shared page. All original model-writing directions, source links, lead text, navigation, and other lesson pages remain intact. Teacher Notes retain Thursday/Friday scheduling guidance. The full source sheet is visible uncropped in both the lesson and enlarged view.

Active section script: `week9-sections-v29.js`; reader unchanged at `week9-read-aloud-v20.js`; service-worker cache: `eea-companion-v75`. Existing versioned scripts are preserved. HTML and worker load the new script, and the new JPEG is discoverable for precaching.

Validation: static-reference audit, required core JavaScript syntax, active section syntax, whitespace, source-pixel inspection, image dimensions/hash, and worker asset discovery pass. DOM regression checks pass for the three shared appearances: correct source sheet/alt labels, exact teaching wording and all three source links, repeat enlargement/Close, Next/Previous, return from Notice food colors, and vocabulary selection. All other **105 screen renders and layout classes** match v28 across all weekdays, with identical lesson counts. Local browser rendering is unavailable in this environment. Actual cloud-browser verification at 1180×757 passed the Thursday Writing and Centers paths, including both lesson-runner routes, plus Friday’s Writing revisit: the complete source sheet decodes at 2400×1855, enlarged labels/attribution remain legible, directions fit without scrolling, native Escape returns focus to the opener, repeated enlargement/Close works, source notes expand, and Next/Previous stay within the lesson. The deployed JPEG SHA-256 matches the source raster exactly. PR [#212](https://github.com/melinahargrove-droid/early-eagle-classroom/pull/212) merged as `319bc100a66af3a09d2a1f3f31f76bae3b0303af`; remote/main was verified, all four branch/PR checks passed, and merged-main Pages, static audit, ZIP package and Windows build all succeeded. [Verified Pages deployment](https://github.com/melinahargrove-droid/early-eagle-classroom/actions/runs/36751537520). Installed-PWA/offline and classroom-device acceptance remain unverified.

**Favorite Foods image pass complete:** Model writing is complete. A visual check of the existing Favorite Foods artwork confirms that the children drawing an apple and soup with matching colors already support Create and collect and the Facilitate questions. Prepare, Respect and support, and Extend and connect home primarily contain teacher setup/support/extension guidance; their unchanged generic illustration alone is not an unfinished child-facing image requirement.

**Next:** Review the next existing Unit 2 Week 1 child-facing activity for a source-matched visual need; the next unfinished item is not yet identified and requires a read-only inventory check. The Thursday runner continues from Centers to Math (Autumn Leaves), which already has its distinct step pictures. No further objectively missing source visual is identified in Favorite Foods: preserve its remaining pages as they are. New art, curriculum interpretation or restructuring requires the user's direction. Unit 1 and Unit 2 Week 2 remain deferred.

**Waiting on Me:** No remaining blocker for Model writing. Any new artwork, subjective layout choice, or curriculum interpretation requires review; classroom-device/offline acceptance remains unverified.

### Favorite Foods — Notice food colors — September 30, 2026

**Done:** Notice food colors now reuses the original Soup Day spreads `soup-day/pages-03-04.jpg` and `soup-day/pages-27-28.jpg`, visually inspected against the carrots and colorful soup called for in the existing directions. No new art, resizing or recompression. SHA-256 hashes: `8f09598a2f53b660e8f6b732cf65ca302cee22999b09d3681476fc73a59e81dd` and `49cf33ccc80e0885445eab6fb5816a161edebc38ad303d334b5bd5111b77f2cc`. The established Making Soup layout, page selector, enlargement and Close controls are reused. The shared page remains Thursday Writing 3 of 8 and Thursday Centers 8 of 13; Friday's optional Writing revisit uses the same shared implementation. Exact teaching wording, three original source links, scheduling guidance, all other Favorite Foods cards and finished Vocabulary are preserved. The adapted-book source is additionally linked in Teacher Notes.

Active section script: `week9-sections-v28.js`; reader unchanged at `week9-read-aloud-v20.js`; service-worker cache: `eea-companion-v74`. Original image assets and CSS are unchanged. HTML and worker reference the new version; both book images are discoverable for precaching.

Validation: static-reference audit, required core JavaScript syntax checks, active section syntax and whitespace pass. DOM checks pass for both Thursday flows: page selection, enlargement/Close, source links/notes, Next/Previous and Vocabulary selection. All unaffected section renders and lesson counts match v27 across all five weekdays; curriculum data is unchanged. All active section literal assets exist. Local browser rendering is unavailable in this execution environment; actual cloud-browser rendering, native Escape behavior and publication verification are tracked in this change's pull request. These checks are not full classroom-device or installed-PWA/offline acceptance.

**In Progress:** Unit 2 Week 1, remaining Favorite Foods teaching pages. Prepare, Model writing, Create and collect, Respect and support, Facilitate, and Extend and connect home remain unchanged.

**Next:** Inspect the authoritative linked Favorite Foods Visuals PDF before changing Model writing or creating any new art. Continue narrowly within approved existing patterns; keep Unit 1 and Unit 2 Week 2 deferred.

**Waiting on Me:** No additional input needed for this existing-image placement; publication is approved. Any new artwork or subjective redesign needs the user's review. Classroom-device/offline acceptance remains unverified.

### Playdough Color Mixing — five teaching pages — September 28, 2026

User approved the review recommendation: replace the eight Playdough screens with **Vocabulary, Plan a color, Mix, Compare and improve, and Explore**, all with a large left visual and directions on the right. Vocabulary uses five selectable word buttons (Improve, Knead, Mix, Roll, Squeeze), keeping selection within the same lesson step. The existing exploration picture is reused for Vocabulary and Explore. Prepare, Facilitate and Support and extend are preserved word-for-word in expandable Teacher Notes on all five pages. Notes also retain the original current-step text and invitation. Explore shows its original first invitation sentence; the full Explore and document paragraph remains in notes.

Confirmed the original Playdough center PDF (`1Vv6CnxUlBEK0prh2fHktPjIz2paLLObB`) uses **Goodbye Summer, Hello Autumn pages 21–22**: start with yellow and a pinch of red, then add a little brown to move closer to gold. Plan a color reuses the original unmodified `goodbye-summer-hello-autumn/page-11.png` (source slide 12; SHA-256 `151e40329c278b6aa02935357b5f65fdea63ae430d32c5acf7c2f4ea5a4f1262`). Plan, Mix and Compare provide an enlarged view of that spread, with Close/Escape returning to the same teaching step. All three original center sources remain; the adapted-book source is also linked.

Created and inspected two realistic watercolor close-ups, preserving the original **1536×1024 PNGs** without resizing or recompression:
- `assets/focus-3s/unit-2/week-1/centers/playdough-mix.png` — teacher hands fold yellow dough around a small pinch of red; SHA-256 `2bc7a052ad57d72b55a3d14e9ca0fac074b6c703c404c8de81dbdab8a4c10aca`.
- `assets/focus-3s/unit-2/week-1/centers/playdough-compare.png` — a small pinch of brown added to light orange dough, beside an autumn-gold sample; SHA-256 `a096fa1deb18032ddf9524842aa4cdb2c8b845fa3ecfa53bba3dd3f34769f509`.

Thursday Centers now has **13 pages**: five Playdough pages, followed by the eight unchanged Favorite Foods pages. Every other weekday/section data set matches v26 exactly; read-aloud, Writing, scheduling, prior removals and eight-page Math remain intact. Active section script: `week9-sections-v27.js`; reader remains `week9-read-aloud-v20.js`; service-worker cache: `eea-companion-v73`. HTML/service-worker references are updated, and the worker discovers both new PNGs and the original book spread.

Validation: exact curriculum/data/source preservation, PNG hashes/dimensions, worker discovery, syntax and whitespace checks pass. A standalone `qa/week9-playdough-layout.html` fixture exercises the actual runner at fixed desktop/mobile viewport sizes without adding controls to the classroom interface. Browser layout, word selection, book-dialog, navigation and live publication verification are recorded in this change's pull request/Pages deployment. Next: the remaining **Favorite Foods** teaching pages. Stay in Unit 2 Week 1.

### Sprinkle vocabulary installed; Writing match verified — September 27, 2026

User approved the new Sprinkle picture and requested installation, then asked to ensure the Writing page matches Wednesday's. Installed the original **1536×1024 PNG** at `assets/focus-3s/unit-2/week-1/vocabulary/sprinkle-parsley.png`, preserved byte-for-byte without resizing or recompression (SHA-256 `23732b950647719c7af115bff5c29112fe5f0162253d8dc25e5125b15f3f16a5`). It shows a preschooler sprinkling small parsley pieces from her fingertips onto vegetable soup. The illustration and installed page were visually inspected.

Only Thursday's **Sprinkle** vocabulary screen (21 of 25) uses the new picture, with descriptive alt text and the original-vocabulary-illustration caption. Definition, teaching note, Teacher Notes, lesson source and all other lesson content remain unchanged. Previous returns to original book pages 25–26; Continue opens pages 27–28. Chop, Sizzle and Broth, the full Soup Day sequence, Friday's reading and both autumn choices remain intact.

**Writing comparison:** Wednesday's former Favorite Foods lesson was deliberately moved to Thursday after Soup Day (Friday optional revisit). Compared the earlier approved Wednesday implementation (`week9-sections-v3.js`, PR #179 / commit `956569b70235d93c9d91bc6b807f1dff711d71e6`) with current Thursday (`week9-sections-v26.js`): all eight cards, original artwork, exact lesson wording, sources, five vocabulary choices, vocabulary renderer and its CSS match. Only the previously approved scheduling note differs. No Writing redesign or content change was needed. Browser checks at 1280×666 confirm the large left picture, all five word buttons, no vocabulary direction scrolling, expandable Teacher Notes/source links, internal Previous and Thursday handoff. Wednesday continues to skip Writing as requested.

Active reader: `week9-read-aloud-v20.js`; section script remains `week9-sections-v26.js`; service-worker cache: `eea-companion-v72`. HTML and worker references are updated and the PNG is discovered for precaching. Exact read-aloud data comparison confirms only Sprinkle's picture changes. Browser checks at 1280×666 passed original image decoding, large left picture, no direction scrolling, exact wording/notes/source and Pages 25–26 ↔ Sprinkle ↔ Pages 27–28 navigation, with no JavaScript errors. Publication/live verification is recorded in this change's pull request/Pages deployment. Next center remains **Playdough Color Mixing**, then the remaining Favorite Foods pages.

### Broth vocabulary picture installed — September 27, 2026

User approved the new realistic watercolor and requested installation. Installed the original **1536×1024 PNG** at `assets/focus-3s/unit-2/week-1/vocabulary/broth-pouring.png`, preserved byte-for-byte without resizing or recompression (SHA-256 `ae7707e9053bdc14a3dcd7c9a5643553c9e5d520903e8f9db321d19322843c10`). It shows a mother pouring clear golden broth from a glass pitcher into a pot containing carrots, celery and onions. The original illustration and installed page were visually inspected.

Only Thursday's **Broth** vocabulary screen (13 of 25) uses the new picture, with descriptive alt text and the established original-vocabulary-illustration caption. The definition, teaching note, Teacher Notes, lesson source and all other lesson content remain unchanged. Previous returns to original book pages 11–12; Continue opens pages 13–14. Chop and Sizzle's approved pictures, the complete Soup Day sequence, Friday's reading and both autumn choices remain intact.

Active reader: `week9-read-aloud-v19.js`; section script remains `week9-sections-v26.js`; service-worker cache: `eea-companion-v71`. HTML and worker references are updated and the PNG is discovered for precaching. Exact lesson-data comparison confirms only the requested picture changes. Browser checks at 1280×666 passed original PNG decoding, large left picture, no direction scrolling, exact wording/notes/source, and Pages 11–12 ↔ Broth ↔ Pages 13–14 navigation, with no JavaScript errors. Publication verification is recorded in this change's pull request/Pages deployment. User requested a new **Sprinkle** picture after publishing Broth; create one preview next. Next center remains **Playdough Color Mixing**, then the remaining Favorite Foods pages.

### Sizzle vocabulary picture installed — September 27, 2026

User approved the new realistic watercolor and requested installation. Installed the original **1536×1024 PNG** at `assets/focus-3s/unit-2/week-1/vocabulary/sizzle-vegetables.png`, preserved byte-for-byte without resizing or recompression (SHA-256 `6b2020bc8c62af4d810cfc819a2e4ebb26ec7c402751122ff212be95f1acc1fd`). It shows a mother stirring carrots, onions and celery in a pan, with visible bubbles in the oil and gentle steam. The generated picture and installed page were visually inspected.

Only Thursday's **Sizzle** vocabulary screen (11 of 25) uses the new picture, with descriptive alt text and the established original-vocabulary-illustration caption. The definition, teaching note, Teacher Notes, lesson source and all other lesson content remain unchanged. Previous returns to original book pages 9–10; Continue opens pages 11–12. Chop's approved picture, the complete Soup Day sequence, Friday's reading and both autumn choices remain intact.

Active reader: `week9-read-aloud-v18.js`; section script remains `week9-sections-v26.js`; service-worker cache: `eea-companion-v70`. HTML and worker references are updated and the PNG is discovered for precaching. Exact lesson-data comparison confirms only the requested picture changes. Browser checks at 1280×666 passed original PNG decoding, large left picture, no direction scrolling, exact wording/notes/source, and Pages 9–10 ↔ Sizzle ↔ Pages 11–12 navigation, with no JavaScript errors. Publication verification is recorded in this change's pull request/Pages deployment. Next center remains **Playdough Color Mixing**, then the remaining Favorite Foods pages.

### Chop vocabulary picture installed — September 27, 2026

User approved the newly generated realistic watercolor and asked to put it in. Installed the original **1536×1024 PNG** at `assets/focus-3s/unit-2/week-1/vocabulary/chop-carrots.png`, preserved byte-for-byte without resizing or recompression (SHA-256 `49d2ea2449057832264cce84d15cb8627d714ed09384fc7fe18e0028e63d49ee`). It shows a mother chopping a carrot into small pieces with a rounded green child-safe knife while her preschooler watches. The illustration was visually inspected for natural faces, hands, preschool proportions, and a clear chopping action.

Only Thursday's **Chop** vocabulary screen (9 of 25) uses the new picture, with descriptive alt text and the established original-vocabulary-illustration caption. The definition, teaching note, Teacher Notes, lesson source, and all other lesson content remain unchanged. Previous returns to the original book pages 7–8; Continue opens pages 9–10. The complete Soup Day book sequence, Friday's reading and both autumn choices remain intact.

Active reader: `week9-read-aloud-v17.js`; section script remains `week9-sections-v26.js`; service-worker cache: `eea-companion-v69`. HTML and worker references are updated and the PNG is discovered for precaching. Exact lesson-data comparison confirms only the requested picture changes. Browser checks at 1280×666 passed original PNG decoding, large left picture, no direction scrolling, exact wording/notes/source, and Pages 7–8 ↔ Chop ↔ Pages 9–10 navigation, with no JavaScript errors. Publication verification is recorded in this change's pull request/Pages deployment. Next center remains **Playdough Color Mixing**, then the remaining Favorite Foods pages.

### Thursday Connect to Another Book uses the Little Red Hen cover — September 27, 2026

User requested the cover of **The Little Red Hen (Makes a Pizza)** on Thursday's **Connect to Another Book** page. Installed the visually verified publisher cover (Philemon Sturges / Amy Walrod, ISBN 9780142301890) at `assets/focus-3s/unit-2/week-1/soup-day/connection-little-red-hen-cover.jpg`. Preserved the downloaded 450×450 JPEG bytes, SHA-256 `66760fb48c41e4308c7bf7832af17c54c7c1d558903b229cea7777e468476deb`. Publisher page/image URLs and provenance are recorded in `soup-day-pages.json` under `relatedBooks`.

Only the connection page's picture changes, with matching book title below it and descriptive alt text. Thursday remains 25 screens and Friday 20; all original Soup Day pictures, both autumn book choices, lesson wording, Teacher Notes, source links and navigation remain unchanged. Active reader: `week9-read-aloud-v16.js`; section script remains `week9-sections-v26.js`; service-worker cache: `eea-companion-v68`. HTML and worker references are updated, and the cover is discovered for precaching.

Validation: exact lesson-data comparison confirms only this one image path changes. Browser checks at 1280×666 passed original cover decoding, matching caption, no direction scrolling, exact notes/source/wording, and Before Reading ↔ Connect to Another Book ↔ Title Page navigation, with no JavaScript errors. Publication verification is recorded in this change's pull request/Pages deployment. Next center remains **Playdough Color Mixing**, then the remaining Favorite Foods pages.

### Soup Day original book pictures installed throughout both readings — September 27, 2026

User supplied the **Soup Day – Adapted Text** presentation and requested the remaining book pictures. Visually mapped all **18 original JPEGs**: cover, title page, dedication, and fifteen spreads covering printed pages 1–30. Added the fifteen missing images without resizing or recompression; the existing cover, pages 7–8 and pages 11–12 match the attachment byte-for-byte and are reused. All images, source slide/media mappings, dimensions, original hashes, adapted captions, and the attached snapshot hash are recorded in `soup-day-pages.json`.

Thursday now has **25 read-aloud screens**, including the complete book in order, four separate vocabulary screens, the after-reading discussion, and closing. Friday has **20 screens**, including the complete book, all original retelling prompts, the recipe, after-reading discussion, and closing. Both use original book pictures throughout. Teaching stops open on the matching book spread; vocabulary Previous returns to its source spread. The actual supplied pages place **Sprinkle after pages 25–26** and Friday's **pasta completion prompt on pages 19–20**, correcting the prior supplemental cue labels (page 16 / pages 13–16). Friday's washing and chopping questions share the verified pages 7–8 spread; both exact questions remain. Adapted captions are taken from the supplied slides. Teacher Notes retain the original lesson guidance and source links; both autumn choices and all section/center content remain unchanged.

Active reader: `week9-read-aloud-v15.js`; active section script remains `week9-sections-v26.js`; service-worker cache: `eea-companion-v67`. HTML and worker references are updated; all eighteen JPEGs are discovered for precaching. Validation: original hashes, complete reading order, unchanged autumn plans, exact original teaching-stop/vocabulary wording, and corrected source-page mapping passed. Browser walkthroughs at 1280×666 passed every Thursday/Friday screen, every Previous action, every two-click teaching stop, all picture decoding at original dimensions, notes, direction fit without scrolling, and same-day Foundational Literacy handoff, with no JavaScript errors. Publication verification is recorded in this change's pull request/Pages deployment.

Continue section by section in Unit 2 Week 1. Next center remains **Playdough Color Mixing**, then the remaining Favorite Foods pages.

### Thursday Before Reading uses the Soup Day cover — September 27, 2026

User requested the book cover in place of the supplemental picture on **Thursday → Read Aloud → Before Reading**. Installed the actual **Soup Day** cover by Melissa Iwai from slide 1 of the previously supplied adapted-text presentation (`1zCm9Hsu3eWLCKWQHYzvwmPMACF0T3uBaxkRXvD15KZI`). Original embedded `ppt/media/image16.jpg` is preserved byte-for-byte at `assets/focus-3s/unit-2/week-1/soup-day/cover.jpg` (1873×2048; SHA-256 `98d0acc14c656bcce138e0fa35766cbaeb82d2896b4001cd0411965ad6f341a7`). Cover provenance is recorded in `soup-day-pages.json`.

Only Thursday's opening picture changes. The cover has accurate alt text and no supplemental-illustration caption. All lesson wording, Teacher Notes, original source links, other read-aloud pictures, both autumn book choices, and navigation remain unchanged. Thursday retains 14 screens; Friday retains its existing opening illustration.

Active reader: `week9-read-aloud-v14.js`; active section script remains `week9-sections-v26.js`; service-worker cache: `eea-companion-v66`. HTML and worker references are updated. Validation: exact lesson-data comparison, original JPEG byte comparison, image decoding, worker asset discovery, and browser checks at 1280×666 passed. The cover appears left of the directions, directions fit without scrolling, notes/source remain intact, and Next/Previous return correctly. Friday's opening remains unchanged; no JavaScript errors. Publication verification is tracked in this change's pull request/Pages deployment.

Continue section by section in Unit 2 Week 1. Next center remains **Playdough Color Mixing**, then the remaining Favorite Foods pages.

### Making Soup Model the sequence picture installed — September 27, 2026

User requested a new picture for **Model the sequence**, then explicitly asked to put it in. Created one realistic watercolor illustration of a teacher demonstrating stirring pretend soup while two preschoolers watch, with chopped orange carrots/red peppers and a bowl of pasta ready to add. Inspected natural faces, lifelike eyes, hands, preschool proportions, and the teaching action. The built-in image generator produced the original **1536×1024 PNG**, copied byte-for-byte without resizing or recompression to `assets/focus-3s/unit-2/week-1/centers/making-soup-model-sequence.png`. SHA-256: `c2684f99d882a94cf926f4327e09b5f5659ca6c842e38e3ce8cf7de769973ea2`.

Only the Model the sequence card uses the new picture, on both Wednesday and Friday. Making Soup remains four pages. Connect remains 2 of 4 with both original Soup Day spreads and enlargement controls. Vocabulary and Play together retain their existing illustration. All remaining wording, Teacher Notes, source links, scheduling and navigation remain unchanged.

Active section script: `week9-sections-v26.js`; service-worker cache: `eea-companion-v65`. HTML and worker references are updated. Validation: exact data comparison confirms only the requested image path changes; the worker discovers the PNG for precaching. Browser checks at 1280×666 passed both weekdays: original image dimensions and decoding, large left picture with directions fitting without scrolling, exact notes/source links, Connect ↔ Model ↔ Play navigation, and no JavaScript errors. Publication verification is tracked in this change’s pull request/Pages deployment.

Continue section by section in Unit 2 Week 1. Next center remains **Playdough Color Mixing**, then the remaining Favorite Foods pages.

### Making Soup Prepare the kitchen page removed — September 27, 2026

User explicitly requested removing **Prepare the kitchen**. Making Soup now has **four** teaching pages: Vocabulary, Connect, Model the sequence, and Play together. Vocabulary advances directly to Connect, and Connect Previous returns to Vocabulary. **Connect is now 2 of 4** and keeps both original Soup Day spreads (pages 7–8 and 11–12), page selectors, and the enlarged book view. The remaining exact lesson wording, notes, source links, images, and day scheduling are unchanged.

The removal applies to Wednesday and Friday. Wednesday Centers now has four Making Soup pages before Math. Friday Centers has thirteen pages: four Making Soup pages, Building Autumn Trees, and eight Autumn Leaves pages. Active section script: `week9-sections-v25.js`; service-worker cache: `eea-companion-v64`. HTML and service-worker references use the new script.

Validation: compared all weekday/section data to v24 and confirmed that only the requested card is removed. Browser verification at 1280×666 passed Vocabulary → Connect, Connect Previous → Vocabulary, Connect Next → Model, both book spreads, enlarged-view controls/Close/Escape, exact Teacher Notes and original links, the 2-of-4 count, no desktop direction scrolling, both weekdays’ center counts and same-day Math handoff. No JavaScript errors; syntax and whitespace checks pass. Publication verification is tracked in this change’s pull request/Pages deployment.

Continue section by section in Unit 2 Week 1. Next center remains **Playdough Color Mixing**, then the remaining Favorite Foods pages.

### Making Soup Connect includes the referenced Soup Day pages — September 27, 2026

User requested the book pages on the teaching slide so they can point to them. The **Connect** page now displays the actual **Soup Day pages 7–8 and 11–12**, with buttons to switch spreads without changing the lesson step. **Enlarge pages** (or tapping the picture) opens a large book view with the same page controls. Close/Escape returns to Connect in place. The five Making Soup pages remain separate on Wednesday and Friday; the other four keep their existing illustration.

Source: the connected Drive **Soup Day - Adapted Text** presentation (`1zCm9Hsu3eWLCKWQHYzvwmPMACF0T3uBaxkRXvD15KZI`). Source slide 7 labels printed pages 7–8 and contains the washing/chopping spread; slide 9 labels printed pages 11–12 and contains the broth/remaining vegetables spread. Both were visually verified against the center plan’s opening lines. The two original embedded JPEGs are preserved byte-for-byte in `assets/focus-3s/unit-2/week-1/soup-day/`. Mapping, dimensions, source URLs and hashes are recorded in `soup-day-pages.json`. This does not convert or replace the separate Soup Day read-aloud.

All original lesson wording, Teacher Notes and three source links remain. Connect adds the adapted book source link. Active section script: `week9-sections-v24.js`; service-worker cache: `eea-companion-v63`. The worker discovers both complete image paths in the active script for offline precaching.

Validation passed at 1280×666, 1024×560, 1920×998 and 390×844: both full spreads decode at original width 2048, page switching and enlargement preserve step 3, Close and Escape return correctly, notes/source links remain, Previous/Next visit Prepare/Model correctly, and desktop content fits without scrolling. Wednesday/Friday center counts and same-day Math handoffs pass. All original section data matches v23, with no JavaScript errors. Publication verification is tracked in this change’s pull request/Pages deployment.

Continue section by section in Unit 2 Week 1. Next center remains **Playdough Color Mixing**, then the remaining Favorite Foods pages.

### Making Soup split into five teaching pages — September 27, 2026

User reconsidered the single introduction and selected **five teaching pages**: Vocabulary, Prepare the kitchen, Connect, Model the sequence, and Play together. Each page uses the existing unmodified Making Soup picture on the left and its exact original teaching text on the right. The original invitation, Facilitate, Support and extend, and all three source links are preserved in expandable Teacher Notes on every page. This supersedes the earlier single-page Making Soup decision; no new artwork was generated.

The change applies to both the Wednesday introduction and Friday revisit. Wednesday Centers now has five pages and then advances to Math. Friday Centers has fourteen pages: five Making Soup pages, Building Autumn Trees, and eight Autumn Leaves pages. Internal Previous/Next stays within the center sequence; first-page Previous preserves the day-specific prior section; final Centers completion advances to Math. All other section data, scheduling, and the eight-page Math finish at Home remain unchanged.

Active section script: `week9-sections-v23.js`; service-worker cache: `eea-companion-v62`. HTML and worker references are updated. Validation passed for all five pages at 1280×666, 1024×560, 1920×998, and 390×844, including exact directions, two note sections, three sources, image loading, internal Previous/Next, and no desktop direction scrolling. Both weekdays' section boundaries, Friday center transitions, Math handoff/finish label, and exit to the correct day overview passed with no JavaScript errors. Publication verification is tracked in this change’s pull request/Pages deployment.

Continue section by section in Unit 2 Week 1. Next center remains **Playdough Color Mixing**, then the remaining Favorite Foods pages.

### Tuesday Autumn Poster layout corrected — September 27, 2026

User requested fixing the Writing & Drawing page shown in their screenshot: **Add to Our Autumn Poster**. Its existing picture is now large on the left. The exact original **Prepare** text appears beside it on the right. The original invitation blurb, Invite prompt, and Revisit guidance are preserved in expandable Teacher Notes. No artwork or lesson wording changed; this remains one Tuesday Writing page between Foundational Literacy and Centers.

Active section script: `week9-sections-v22.js`; service-worker cache: `eea-companion-v61`. HTML and service-worker references use the new script. The compact desktop adjustment applies only to this poster page. All other section/card data and scheduling are unchanged, including the completed centers and eight Math pages ending at Home.

Validation: original text and image-path comparisons passed; every other weekday/section data set matches v21. Browser checks passed at 1280×666, 1024×560, 1920×998, and 390×844, with no desktop direction scrolling and working expandable notes. Verified Tuesday Foundational Literacy ↔ Writing ↔ Centers and X → Tuesday Day Overview with no JavaScript errors. Publication verification is tracked in this change’s pull request/Pages deployment.

Continue section by section in Unit 2 Week 1. Next center remains **Playdough Color Mixing**, then the remaining Favorite Foods pages.

### Making Soup single-page introduction — September 27, 2026

Continuing the section-by-section review of Unit 2 Week 1 Centers. Making Soup now uses the approved one-page introduction layout: its existing picture enlarged on the left, the original invitation on the right, and expandable Teacher Notes. All seven original teaching sections (Vocabulary, Prepare the kitchen, Connect, Model the sequence, Play together, Facilitate, Support and extend) and all three source links are preserved. No artwork or lesson wording changed.

This applies to the Wednesday introduction and Friday revisit. Wednesday Centers is now one Making Soup page, followed by the Math section. Friday Centers has ten pages: Making Soup, Building Autumn Trees, then the eight Autumn Leaves pages. Day-specific first-page Previous, internal navigation, and final Centers → Math are preserved. Active section script: `week9-sections-v21.js`; service-worker cache: `eea-companion-v60`.

Validation: browser checks passed at 1280×666, 1024×560, 1920×998, and 390×844. Desktop introduction content and navigation fit without scrolling; Teacher Notes retain the exact seven original sections and three source links. Wednesday and Friday previous-section links, internal center navigation, Centers → Math, the eight-page Math finish label, and exit to the correct day overview passed with no JavaScript errors. Data comparisons confirm all other center cards, lesson wording, and resources are unchanged.

The eight Math pages still end with Finish Today → Home. All previous removals and scheduling decisions remain. Next center to review: **Playdough Color Mixing**, then the remaining Favorite Foods pages. Stay in Unit 2 Week 1 and continue section by section. Publication verification is tracked in this change’s pull request/Pages deployment.

### Exploring Fall Texts single-page introduction — September 27, 2026

Workflow confirmed with the user: continue **section by section across Unit 2 Week 1**, using the current repository to find the next activity that needs review. Do not assume a move to the next weekday or recreate finished work.

Reviewed Exploring Fall Texts and applied the approved center-introduction layout used by Nature Arrangements and Building Autumn Trees. Its existing picture is large on the left; the original activity invitation appears on the right. All seven original teaching sections (Vocabulary, Prepare, Model with a book, Model with a photograph, Explore and care, Facilitate, Support) and all three source links are preserved in expandable Teacher Notes. No artwork or lesson wording changed.

Exploring Fall Texts is now one page. Tuesday Centers has nine pages: its introduction followed by the eight existing Autumn Leaves pages. Internal Next/Previous, first-page Previous → Writing, and final Centers → Math retain the same weekday. Active section script: `week9-sections-v20.js`; service-worker cache: `eea-companion-v59`.

Validation: preserved the exact invitation, seven original note sections, existing image path, and all three source links. Browser layout checks passed at 1280×666, 1024×560, 1920×998 and 390×844; desktop directions fit without scrolling. Verified expandable notes, Exploring Fall Texts ↔ Autumn Leaves, Writing ↔ Centers → Math, Math’s final Finish Today label, and X → Tuesday overview. No JavaScript errors; syntax and whitespace checks pass.

The eight Math pages still end with Finish Today → Home. All earlier section removals and scheduling decisions remain. Next center to review: **Making Soup**, followed by Playdough Color Mixing and the remaining Favorite Foods pages. Stay in Unit 2 Week 1. Publication verification is tracked in this change’s pull request/Pages deployment.

### Math is the final section — September 27, 2026

User requested removing **Thinking & Feedback, Storytelling & Acting, and Closing Circle** from Unit 2 Week 1. Removed all three from all five days, including Day Overview and the active lesson content. **Play and discuss (8 of 8) is now the final daily lesson page. Finish Today returns directly to Home and clears the lesson resume.** Math’s internal Previous/Next behavior and its first-page Previous → Centers remain intact.

The remaining section IDs stay stable. Old runner links to sections 7–9 and direct feedback/storytelling/closing links finish at Home, preserving the selected week/day and clearing obsolete resume data. The overview clears saved resumes for those removed end sections instead of offering a removed lesson. Monday/Wednesday now show five overview cards; Tuesday/Thursday/Friday show six, in the preserved three-column layout.

All eight Autumn Leaves Math pages and pictures remain. Support and Outside and home remain removed. Preserve the earlier Centers, Launchpad, writing schedule, and both autumn read-aloud decisions. Active section script: `week9-sections-v19.js`; service-worker cache: `eea-companion-v58`. No further end-of-day section follows Math in this week. Stay in Unit 2 Week 1; Unit 1 is unchanged.

Validation: all remaining section data (wording, images and source resources) matches the prior version across all five days. Browser checks at 1280×666 passed every weekday’s overview, all eight Math pages without direction scrolling, internal Previous/Next, Finish Today → Home with resume clearing, and all retired section/direct links and saved resumes. Unit 1 overview remains unchanged. No JavaScript page errors; script/inline syntax and whitespace checks pass.

The preceding Outside and home removal was merged in PR #194 (`31fe4434a7225d3bccad37275a64d545bdf8b1e5`) and verified live. Publication verification for this combined change is tracked in its pull request/Pages deployment.

### Autumn Leaves Outside and home page removed — September 27, 2026

User explicitly requested removing Outside and home too. This supersedes the prior nine-page sequence and the instruction to create its picture. Autumn Leaves now has **eight** separate teaching pages, each with its installed picture. **Play and discuss is the final Math page**, and its Next button advances directly to Thinking & Feedback. Previous returns to Model equal. The shared Tuesday/Friday Centers appearances use the same eight-page Autumn Leaves sequence. Support remains removed. All remaining lesson wording, source links, large-left-picture layout, expandable Teacher Notes, and section navigation are preserved.

Active section script: `week9-sections-v18.js`; service-worker cache: `eea-companion-v57`. No further Autumn Leaves pictures are pending for these eight pages. Stay in Unit 2 Week 1; await the next requested activity.

Validation: all eight remaining pages preserve exact text, images and four source links. Browser checks passed at 1280×666, 1024×560, 1920×998 and 390×844 with no desktop direction scrolling. Verified Model equal ↔ Play and discuss, expandable Teacher Notes, final Math → Thinking & Feedback, and the final-page state in both shared Centers appearances. No JavaScript page errors.

The preceding Support removal was merged in PR #193 (`2f6fe83fadbb48859e952d3f299bb16474b2b5a5`) and verified on the live site. Publication verification for this removal is tracked in its pull request/Pages deployment.

### Autumn Leaves Support page removed — September 27, 2026

User explicitly requested removing the Support page entirely. This supersedes the earlier ten-page requirement and the instruction to create/install a Support picture. Autumn Leaves now has **nine** separate teaching pages: Play and discuss advances directly to Outside and home, and Previous returns directly to Play and discuss. The shared Tuesday/Friday Centers appearances use the same nine-page sequence. The generated Support picture was not installed. All eight previously installed math pictures, remaining lesson wording, source links, large-left-picture layout, expandable Teacher Notes, and section navigation are preserved.

Active section script: `week9-sections-v17.js`; service-worker cache: `eea-companion-v56`. Next distinct picture: **Outside and home**, based on its existing text. Stay in Unit 2 Week 1.

Validation: all nine remaining pages preserve their exact text, images and four source links. Browser checks passed at 1280×666, 1024×560, 1920×998 and 390×844; desktop directions fit without scrolling. Verified Play and discuss ↔ Outside and home, Teacher Notes, final Math → Thinking & Feedback, and both shared Centers appearances. No JavaScript page errors.

Before this change, verified PR #192's merge (`9aff892a5f8717bb75c3d2bd8b65b2a2d6c5bf9a`) and successful Pages deployment. The live section HTML, v16 script and v55 worker matched the repository; the live Play and Discuss PNG matched the original SHA-256 byte-for-byte. Publication verification for this removal is tracked in its pull request/Pages deployment.

### Autumn Leaves Play and Discuss picture installed — September 27, 2026

Created and installed the requested illustration of children comparing three leaves and two leaves on their trees, with matching dot cards and five-frames holding the remaining leaves. User authorized creation and insertion together. Shared Centers appearance uses the same picture. Original PNG preserved byte-for-byte at `assets/focus-3s/unit-2/week-1/math/autumn-leaves-play-discuss.png`. All ten teaching pages and earlier pictures remain. Next distinct picture: Support. Active section script: `week9-sections-v16.js`; cache v55.

### Autumn Leaves Model Equal picture installed — September 27, 2026

Created and installed the original illustration of two children comparing trees with one orange leaf each, matching the Model equal example. User authorized creation and insertion together. Shared Centers appearance uses the same picture. Original PNG preserved byte-for-byte at `assets/focus-3s/unit-2/week-1/math/autumn-leaves-equal.png`. All ten teaching pages and earlier images remain. Next distinct picture: Play and discuss. Active section script: `week9-sections-v15.js`; cache v54.

### Autumn Leaves Model One Less picture installed — September 27, 2026

Installed the approved original illustration of a child removing one leaf from four, leaving three on the tree, on the Model one less page, including its shared Centers appearance. Original PNG preserved byte-for-byte at `assets/focus-3s/unit-2/week-1/math/autumn-leaves-one-less.png`. Earlier approved pictures and all ten teaching pages remain intact. Next distinct picture: Model equal. Active section script: `week9-sections-v14.js`; cache v53.

### Autumn Leaves Model One More picture installed — September 27, 2026

Installed the approved original illustration of a child adding one leaf to the three already on a tree on the Model one more page, including its shared Centers appearance. Original PNG preserved byte-for-byte at `assets/focus-3s/unit-2/week-1/math/autumn-leaves-one-more.png`. Earlier approved pictures and all ten teaching pages remain intact. Next distinct picture: Model one less. Active section script: `week9-sections-v13.js`; cache v52.

### Autumn Leaves Model Counting picture installed — September 27, 2026

Installed the approved original illustration of a teacher and child counting three leaves on a tree to match a three-dot card on the Model counting page, including its shared Centers appearance. Original PNG preserved byte-for-byte at `assets/focus-3s/unit-2/week-1/math/autumn-leaves-counting.png`. Earlier approved pictures and all ten lesson pages remain intact. Next distinct picture: Model one more. Active section script: `week9-sections-v12.js`; cache v51.

### Autumn Leaves Compare Leaves picture installed — September 27, 2026

Installed the approved original illustration of a child comparing a paper leaf with leaves pictured in an open book on the Compare Leaves page, including its shared Centers appearance. Original PNG preserved byte-for-byte at `assets/focus-3s/unit-2/week-1/math/autumn-leaves-compare.png`. Vocabulary and Prepare retain their approved pictures. Next distinct picture: Model counting. Active section script: `week9-sections-v11.js`; cache v50.

### Autumn Leaves Prepare picture installed — September 27, 2026

Installed the approved original picture of the tree template, five paper leaves, five-frame, and dot cards on the Prepare page, including its shared Centers appearance. Original PNG preserved byte-for-byte at `assets/focus-3s/unit-2/week-1/math/autumn-leaves-prepare.png`. Vocabulary retains its approved image. Next distinct picture: Compare leaves. Active section script: `week9-sections-v10.js`; cache v49.

### Autumn Leaves Vocabulary picture installed — September 27, 2026

Installed the user-approved original illustration of two children comparing groups of autumn leaves on the Vocabulary page only, including its shared Centers appearance. Preserved the original PNG byte-for-byte at `assets/focus-3s/unit-2/week-1/math/autumn-leaves-vocabulary.png`. All ten pages and lesson text remain. Next distinct picture: Prepare. Active section script: `week9-sections-v9.js`; cache v48.

### Autumn Leaves math layout — September 27, 2026

Preserved all ten Autumn Leaves pages and original teaching text. Each page now shows a large image on the left, its step title and directions on the right, and expandable source notes. The shared layout also applies when this activity appears in Centers. User wants distinct step pictures; create and review them one at a time, starting with Vocabulary. Existing approved illustration remains until replacement approval. Active section script: `week9-sections-v8.js`; cache v47.

### Literacy Small Groups removed — September 27, 2026

Removed the Literacy Small Groups section from all five days of Unit 2 Week 1 at the user’s request. Daily overview cards and forward/back navigation now connect Centers directly to Math. Old section-5 links and saved resumes open Math; old direct smallgroups views display Math. Existing section IDs remain stable, and Monday/Wednesday still skip Writing. Removed the unused word-play lesson content from the active script. Active section script: `week9-sections-v7.js`; cache v46.

### Building Autumn Trees single-page introduction — September 27, 2026

Combined the six Building Autumn Trees screens into one page using the same layout as Nature Arrangements. The existing picture is large on the left; the original activity invitation and expandable Teacher Notes are on the right. All six original teaching sections and four source links are preserved. This applies to Monday and the Friday revisit. Monday Centers now has two pages, Nature Arrangements followed by Building Autumn Trees, then continues to Literacy Small Groups. Active section script: `week9-sections-v6.js`; cache v45.

### Nature Arrangements single-page introduction — September 27, 2026

Combined the six Nature Arrangements screens into one introduction at the user’s request. The existing image is enlarged on the left, with the activity title and original short invitation on the right. Expandable Teacher Notes preserve every original vocabulary, preparation, modeling, facilitation, extension paragraph, and source link. Next opens Building Autumn Trees; Previous returns to the combined page. Monday Centers now has seven screens. Active section script: `week9-sections-v5.js`; cache v44.

### Favorite Foods moved after Soup Day — September 27, 2026

User-directed schedule change: introduce Favorite Foods Writing on Thursday after the first Soup Day read-aloud, with Friday as an optional revisit. Removed Writing from Monday and Wednesday’s overview and sequential lesson flow; Foundational Literacy continues to Centers on those days. Tuesday’s separate Autumn Poster remains. Moved the Favorite Foods center introduction from Wednesday to Thursday. Updated teacher scheduling notes and Launchpad return guidance. Stable section IDs are preserved, including direct links and saved resume handling. Active section script: `week9-sections-v4.js`; cache v43. This supersedes earlier Wednesday introduction guidance.

### Favorite Foods vocabulary layout — September 27, 2026

Redesigned the shared Favorite Foods vocabulary screen with the existing illustration enlarged on the left, a single word and definition on the right, and five selectable word buttons. Favorite starts with the approved question “What is your favorite food?” Teacher Notes hold scheduling guidance, full original vocabulary definitions, and source links. Removed repeated Writing & Drawing text from this screen. Word selection stays within the same lesson step, preserves the section sequence, and applies wherever this shared vocabulary screen appears. Active section script: `week9-sections-v3.js`; cache v42.

### Launchpad screen fit — September 27, 2026

Reduced vertical card spacing and made title/art sizing respond to available height after the user reported scrolling on the Launchpad page. Added compact layouts for shorter browser windows and phones. The full launch card, return guidance, and navigation remain visible at the checked classroom viewport sizes. Cache v41.

### Daily Launchpad link — September 27, 2026

At the user’s direction, Foundational Literacy for all five days of Unit 2 Week 1 now consists of one large Launchpad for Pre-K link card. It opens `https://olt.reallygreatreading.com/teacher/packages/olt-launchpad-standard/` in a new tab. Removed the prior Foundational Literacy lesson directions and source/support links from this section. The lesson runner retains same-day Read Aloud → Foundational Literacy → Writing navigation. Active section script: `week9-sections-v2.js`; cache v40.

### Drizzle vocabulary image — September 27, 2026

Installed the approved original 1536×1024 watercolor of a child feeling gentle rain at `v6-test/assets/focus-3s/unit-2/week-1/vocabulary/drizzle-autumn-rain.png`. Goodbye Summer Monday’s **Drizzle** screen uses this image immediately after pages 15–16, with descriptive alt text and the original-illustration caption. Active reader: `week9-read-aloud-v13.js`; cache v39.

### Shared Chill vocabulary image — September 27, 2026

Goodbye Summer Monday’s **Chill** now reuses the approved `vocabulary/chilly-autumn-breeze.png` illustration from My Autumn Book, as requested. Its definition and position after pages 17–18 are preserved. Active reader: `week9-read-aloud-v12.js`; cache v38. Drizzle is the next image awaiting creation and review.

### First-page teacher notes — September 26, 2026

Removed the instructions to introduce Autumn and Change from Goodbye Summer Monday’s first-page teacher notes at the user’s request. Vocabulary screens retain their approved placement. Active reader: `week9-read-aloud-v11.js`; cache v37.

### Change vocabulary placement — September 26, 2026

Moved Goodbye Summer Monday’s **Change** vocabulary screen and approved tree illustration directly after printed pages 21–22, “Hello to the changing leaves.” Previous returns to that spread; Continue advances to pages 23–24. Updated the pre-reading teacher note to match. Active reader: `week9-read-aloud-v10.js`; cache v36.

### Season vocabulary placement — September 26, 2026

Moved Goodbye Summer Monday’s **Season** vocabulary screen directly after the flower spread on printed pages 11–12, where the original book uses the word. Previous returns to that spread; Continue advances to pages 13–14. Removed the conflicting pre-reading instruction. Installed the user-approved original 1536×1024 four-season watercolor at `v6-test/assets/focus-3s/unit-2/week-1/vocabulary/season-four-seasons.png`, with descriptive alt text and the original-illustration caption. Active reader: `week9-read-aloud-v9.js`; cache v35.

### Goodbye Summer, Hello Autumn adapted pages — September 26, 2026

Connected the supplied adapted-text PowerPoint to the existing Goodbye Summer choice for Monday–Wednesday. Extracted the cover and all 15 original embedded PNGs byte-for-byte; omitted only blank slide 17. The exact adapted sentences appear beneath the uncropped illustrations. Source slide/printed-page mapping, captions and hashes are in `v6-test/goodbye-summer-pages.json`.

Monday reads the complete book with the mapped stops and five vocabulary screens, then revisits printed pages 3–10 for acting. Tuesday reads printed pages 9–23 only; the last supplied spread includes page 24, so its notes and title explicitly stop at page 23. A picture picker supports shared writing without changing the lesson position. Wednesday displays selected acting scenes for the source roles. My Autumn Book and Soup Day stay available, and read-aloud completion continues directly to same-day Foundational Literacy. Active reader: `week9-read-aloud-v8.js`; cache v34 includes the image manifest for precaching.

### Read-aloud completion — September 26, 2026

User requested removing the instruction to open Choose a Friend after the read-aloud. Unit 2 Week 1 now continues directly from the final read-aloud screen to **Foundational Literacy** for the same weekday. Removed the special Choose a Friend button label and redirect from the Week 9 runner; normal section navigation and teaching-stop gating remain in place. This supersedes earlier checkpoint references to the Week 9 Choose a Friend handoff. Cache advanced to v33.

### Return vocabulary image — September 26, 2026

Installed the user-approved realistic watercolor showing the same tree through autumn, winter, spring, summer, and autumn again at `v6-test/assets/focus-3s/unit-2/week-1/vocabulary/return-autumn-seasons.png`. Preserved the original 1536×1024 PNG. My Autumn Book Monday’s **Return** vocabulary screen uses this visual to match the source definition “To happen again,” with descriptive alt text and the original-illustration caption. Story spread 15 and lesson wording remain unchanged. Active reader is `week9-read-aloud-v7.js`, with cache v32, to deliver the update to existing classroom devices.

### Celebrate vocabulary image — September 26, 2026

Installed the user-approved realistic watercolor of preschool friends celebrating a birthday at `v6-test/assets/focus-3s/unit-2/week-1/vocabulary/celebrate-birthday.png`. Preserved the original 1536×1024 PNG. My Autumn Book Monday’s **Celebrate** vocabulary screen uses the new visual with descriptive alt text and the original-illustration caption. Story spread 7 and lesson wording remain unchanged. Active reader is `week9-read-aloud-v6.js`, with cache v31, to deliver the update to existing classroom devices.

### Chilly vocabulary image — September 26, 2026

Installed the user-approved realistic watercolor of a child hugging their arms against a cool autumn breeze at `v6-test/assets/focus-3s/unit-2/week-1/vocabulary/chilly-autumn-breeze.png`. Preserved the original 1536×1024 PNG. My Autumn Book Monday’s **Chilly** vocabulary screen uses the new visual with descriptive alt text and the original-illustration caption. Story spread 4 and lesson wording remain unchanged. Active reader is `week9-read-aloud-v5.js`, with cache v30, to deliver the update to existing classroom devices.

### Investigate vocabulary image — September 26, 2026

Installed the user-approved realistic watercolor of a child examining an autumn leaf with a magnifying glass at `v6-test/assets/focus-3s/unit-2/week-1/vocabulary/investigate-autumn-leaf.png`. Preserved the original 1536×1024 PNG. My Autumn Book Monday’s **Investigate** vocabulary screen now uses this original visual with descriptive alt text. Story spread 2 and lesson wording remain unchanged. Active reader is `week9-read-aloud-v4.js`, with cache v29, to deliver the new image to existing classroom devices.

### Change vocabulary image — September 26, 2026

Installed the user-approved original realistic watercolor of the same tree in summer and autumn at `v6-test/assets/focus-3s/unit-2/week-1/vocabulary/change-summer-autumn.png`. The original 1536×1024 PNG is preserved. Both Monday autumn read-aloud options use it on the **Change** vocabulary screen only. Added descriptive alt text and an original-illustration caption; book pages and lesson wording are unchanged. Active reader is now `week9-read-aloud-v3.js` to bypass older cached scripts, with cache v28.

### Read-aloud cached-script fix — September 26, 2026

User screenshot showed the new My Autumn Book selector alongside the old Goodbye Summer lesson. Reproduced with the actual v25 service worker: HTML is fetched from the network, but JavaScript is cache-first and ignores query strings. A cache-version bump alone cannot update an already active worker immediately.

The reader now loads `week9-read-aloud-v2.js`, a distinct asset URL with the verified reader implementation, so even the old worker fetches it. The old script URL is retained for compatibility. Updated precache entry and cache v27. Verified the exact old-cache mismatch, then a normal reload with the fix: correct title, cover, 24 Monday screens, working selector, and first story spread. No JavaScript errors; no browser data needs to be cleared. Future changes to this reader should update the versioned script URL when incompatible with cached code.

### My Autumn Book reader — complete and connected

User confirmed the cover and all 15 story spreads are complete on September 26, 2026. Originals are preserved unchanged in `v6-test/assets/focus-3s/unit-2/week-1/my-autumn-book/`; inventory and individually verified curriculum cue mapping are in `v6-test/my-autumn-book-pages.json`.

- Monday–Wednesday now offer a persistent book selector: **My Autumn Book** (default) or **Goodbye Summer, Hello Autumn**. Changing books starts that day's selected lesson at its beginning. Thursday–Friday remain Soup Day.
- My Autumn Book lessons use the BPS plan at `https://drive.google.com/file/d/1bmzMgck416qYVqLtigfFVYlVsHcR9AOy/view`. Monday reads all 15 spreads, includes six vocabulary screens and the mapped teaching stops, then revisits the trees/leaves spread for acting and personal connections. Tuesday shows the scrapbook during setup, reads only spreads 1–9 (printed pages 1–18), then creates the Autumn Poster. A separate picture picker supports revisiting illustrations during shared writing without advancing the reading sequence. Wednesday uses the suggested acting scenes with rotating roles and an option to pass.
- Book spreads fill the teaching area, stay uncropped, and offer expandable Teacher Notes. Next reveals a required teaching stop before advancing. Source vocabulary cards and character puppets are linked in notes.
- Existing Goodbye Summer and Soup Day teaching content is retained. Overview names both autumn options. Service-worker cache advanced to v26.
- Validation: all eight day/book combinations passed image decoding, internal Previous, teaching-stop gating, and Choose a Friend handoff with the correct weekday and Foundational Literacy resume. Tuesday's nine-spread limit and picture revisits passed. Desktop, laptop, tablet and phone navigation checked; desktop/laptop and phone book layouts visually inspected. No JavaScript errors. Publication is tracked by the pull request for `unit2-my-autumn-book`.

Next: teacher walkthrough of the new read-aloud choice in Unit 2 Week 1. Unit 1 remains deferred.

### Star Pose visible teaching steps — September 26, 2026

User refined the Community Meeting layout: Monday’s Star Pose now shows the exact Set up, Imagine and Breathe steps on the classroom-facing page beside the large left image. Those three steps are removed from Teacher Notes; Support, Notice, teacher guidance and source links remain expandable. Other Community Meeting activities are unchanged. Cache advanced to v25. Verified visible step text, absence of duplicates in notes, collapsed/expanded disclosure, desktop/laptop layout and weekday navigation.

### Community Meeting layout — September 26, 2026

User requested a larger picture on the left and expandable teacher notes after reviewing Monday’s Star Pose screenshot. Applied this layout to Unit 2 Week 1 Community Meeting only. Activity title and short prompt remain visible on the right; all existing directions, supports, observations and source links are preserved inside a native, keyboard-accessible Teacher Notes disclosure, closed by default. The picture is uncropped. Notes can scroll in the right pane without displacing navigation. Other section layouts remain unchanged. Cache advanced to v24.

Verified all five Community Meeting activities in Chromium: image left and enlarged, notes closed initially, mouse/keyboard expansion, intact source links, no outer stage scrolling at 1909×975, and correct weekday read-aloud handoff. Also checked 1366×768, 800×600 and 390×844 navigation visibility; inspected closed/open desktop and laptop screenshots. Syntax/diff checks passed. No image files or lesson wording changed.

### Current source-based content update — September 26, 2026

Compared the uploaded Unit 2 Digital Arc, its linked Week 1 Plan, the Community Meeting plan, both read-aloud lesson PDFs, all seven center lesson PDFs, and the Foundational Literacy Support Cards. The user authorized filling the identified gaps.

- Restored individual physical-book page cues for all five reads. Autumn Read 2 still reads only pages 9–23; Read 3 remains an acting read. Added dedicated vocabulary screens (five Autumn terms and four Soup Day terms), two-click teaching stops, the Little Red Hen connection, and Friday’s broth sound / pasta completion cues.
- Expanded all seven centers into navigable teaching steps with vocabulary, preparation, modeling, facilitation, differentiation and extensions. Autumn Leaves now models one more, one less and equal separately. Each center links its original lesson and available resource PDFs.
- Added a distinct Storytelling & Acting section for children’s own stories. Thinking & Feedback remains separate. Week 9 overview/runner now agree on ten sections; legacy Closing Circle resumes migrate from index 8 to 9 once.
- Added the verified Blocks, Soup, Playdough, Favorite Foods and transition literacy support cards as optional choices. They are not presented as a prescribed daily small-group sequence. The original Nature Arrangements card contains unrelated shop/fix/tool examples; it is linked and flagged for teacher review, not silently rewritten.
- Kept the existing replacement Foundational Literacy routine. Original Week 6 daily scripts and the user’s replacement materials have not been supplied; do not invent them. The source names Heggerty Week 6 Days 1–3 only.
- Preserved approved image files and the existing Choose a Friend handoff. Supplemental images are explicitly labeled as physical-book teaching cues, not digital book pages. Reused the existing stage illustration for children’s story acting.
- Writing/Math revisits and small-group practice are identified as optional companion activities. Closing Circle and feedback prompts are distinguished from prescribed source text.
- Cache version advanced to v23.

### Verification of this update

Headless Chromium at 1920×1080 traversed the complete ten-section Week 9 path for Monday–Friday, including every sequential card, all optional literacy choices, the read-aloud teaching stops and vocabulary screens. Checks covered internal Previous, first/final boundaries, final teaching-stop gating, Choose a Friend resume data and re-entry through Daily Lessons, middle-card launch, deliberate X return with weekday preserved, final return to Home, and legacy resume migration. No JavaScript page errors. All 42 image URLs used by these updated paths decoded; 28 source/resource links were present. Inspected screenshots of the overview, Friday’s broth stop, math modeling, vocabulary and story acting. JavaScript syntax and diff whitespace checks passed.

This verifies the updated physical-book companion flow, not an adapted digital-book implementation or classroom-device/offline acceptance. No custom-image controls exist in these Week 9 pages, so custom-image first-paint tests are not applicable to this update. Current use of shared images is intentional; do not recreate approved art merely because it is reused. Friday’s six dedicated images remain published from PR #156.

### Resume next

Stay in **Unit 2 Week 1**. Review the expanded teaching steps to select the next useful dedicated visual, especially the separate one-more/one-less/equal demonstrations or vocabulary. Do not switch to Unit 1 or Week 2. Confirm source-card discrepancies or obtain replacement literacy materials before adding content in those areas. Check this update’s pull request/Pages deployment for publication status.

## Completed batch — Unit 2 Week 1 Friday

Focus on Pre-K 3s → Unit 2 → Week 1 → Friday.
The six Friday-specific supplemental teaching images below have been created and connected. Thursday was already completed on main at `609bd97b138b1ab39b0463a73f58569f5a475846` (PR #155).

These are original teaching cues. Read Soup Day from the physical classroom book; these images do not reproduce the book pages. Approved lesson questions, teacher notes, section order, and navigation code remain unchanged.

| Friday section | Image filename |
| --- | --- |
| Soup Day Read 2 — Opening: retell the story | `retell-the-story.png` |
| Soup Day Read 2 — Pages 1–10: market, wash, chop, cook | `market-wash-chop-cook.png` |
| Soup Day Read 2 — Pages 11–16: broth, waiting, spices, pasta | `broth-wait-spices-pasta.png` |
| Soup Day Read 2 — Page 29 and closing: use a recipe | `follow-a-recipe.png` |
| Thinking & Feedback — color discoveries | `thinking-feedback.png` |
| Closing Circle — Colors All Around Us | `closing-circle.png` |

Asset directory: `v6-test/assets/focus-3s/unit-2/week-1/friday/`.
Consumers: `v6-test/week9-read-aloud.js` and `v6-test/week9-sections.js`.
Original generated PNGs are preserved. Five are 1536×1024; the four-scene market/wash/chop/cook panorama is 2048×768. Existing image styles use `object-fit: contain`.

## Existing Friday visuals retained

- Community Meeting: `community/problem-stories.jpg`.
- Center revisits: Making Soup, Building Autumn Trees, Autumn Leaves.
- Foundational Literacy, Literacy Small Groups, Writing & Drawing, and Math retain the existing shared weekly illustrations.

## Checks before publication

- All six PNGs decoded successfully.
- Both updated lesson scripts and the service worker passed JavaScript syntax checks.
- Original lesson text was compared against the parent revision and is unchanged.
- All literal image references in both week scripts exist in the repository.
- Executed Friday scripts with a DOM stub: all four read-aloud images map to their steps; Previous/Next and final-step state pass; reflection and closing select Friday images.
- Service worker cache advanced from v19 to v20; both external Week 9 scripts are included in precaching so their literal image URLs are discovered.
- Browser rendering and remote deployment are verified separately after merging. No claim of full five-day curriculum or device/offline acceptance is made here.

## Publication status

The user explicitly approved publishing these six images and the prepared app update to `melinahargrove-droid/early-eagle-classroom` and updating the live app on September 26, 2026. Publishing branch: `unit2-week1-friday-visuals`. The prior approval block is resolved. Check the corresponding pull request and GitHub Pages deployment for remote publication status; the image and code checks above were completed locally before publication.

## Completed image — Unit 1 Week 1 Tuesday

The approved realistic watercolor image for Blocks Exploration → Step 4, **Explore & Create**, is connected in `v6-test/centers-week1.html`.

- Asset: `v6-test/assets/focus-3s/unit-1/week-1/centers/blocks/explore-and-create.png`.
- Original generated 1536×1024 PNG preserved. Approved September 26, 2026.
- Visual direction: natural faces, eyes, and child proportions with soft realistic watercolor texture; avoid dot eyes and cartoon proportions.
- Only this step’s image reference changed. Lesson wording and navigation are unchanged.
- Service-worker cache advanced to v21 to deliver the updated page and image.
- Friday’s preceding batch was merged in PR #156 (`ce234c20944f593db44c0b283193cee49def6d7d`); Pages deployment and all six live assets were verified.
- This batch’s publication and deployment status can be verified in its corresponding pull request.

## Completed image — Unit 1 Week 1 Wednesday (further Unit 1 work deferred)

Dramatic Play → Cooking → Step 5, **Clean Up the Kitchen**: user-approved realistic watercolor visual is connected in `v6-test/centers-week1.html`.

- Asset: `v6-test/assets/focus-3s/unit-1/week-1/centers/dramatic-play/clean-up-the-kitchen.png`.
- Original generated 1536×1024 PNG preserved; approved for insertion September 26, 2026.
- Children return pretend food, pots, and dishes using picture labels, matching the existing teaching step.
- Only this step’s image reference changed; lesson text and navigation remain unchanged. Cache advanced to v22.
- The preceding Explore & Create image was published in PR #157; its live page was visually verified.
- Check this image’s corresponding pull request/deployment for publication status.

## Resume next

Remain in **Unit 2 Week 1**. Current screen image coverage is complete; the next useful work is a source check of the incomplete literacy content and a full lesson walkthrough. Create new visuals only for a confirmed, approved lesson need. Unit 1 is deferred until the user says to return. Preserve the approved realistic watercolor style with natural faces and child proportions.
