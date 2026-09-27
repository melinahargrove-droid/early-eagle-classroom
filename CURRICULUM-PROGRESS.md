# Curriculum Image Progress

Updated: September 26, 2026 (America/Chicago).

## Active work — Unit 2 Week 1

User correction, September 26, 2026: **Stay in Unit 2 Week 1. Return to Unit 1 later.** This supersedes earlier resume instructions. Do not start Unit 1 or Unit 2 Week 2 without user direction.

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
