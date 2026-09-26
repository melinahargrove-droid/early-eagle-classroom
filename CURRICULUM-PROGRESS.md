# Curriculum Image Progress

Updated: September 26, 2026 (America/Chicago).

## Previous completed batch — Unit 2 Week 1 Friday

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

## Current stopping point — Unit 1 Week 1 Tuesday

The approved realistic watercolor image for Blocks Exploration → Step 4, **Explore & Create**, is connected in `v6-test/centers-week1.html`.

- Asset: `v6-test/assets/focus-3s/unit-1/week-1/centers/blocks/explore-and-create.png`.
- Original generated 1536×1024 PNG preserved. Approved September 26, 2026.
- Visual direction: natural faces, eyes, and child proportions with soft realistic watercolor texture; avoid dot eyes and cartoon proportions.
- Only this step’s image reference changed. Lesson wording and navigation are unchanged.
- Service-worker cache advanced to v21 to deliver the updated page and image.
- Friday’s preceding batch was merged in PR #156 (`ce234c20944f593db44c0b283193cee49def6d7d`); Pages deployment and all six live assets were verified.
- This batch’s publication and deployment status can be verified in its corresponding pull request.

## Resume next

Continue Unit 1 Week 1’s detailed image pass. Library & Listening’s Choose a Book, Gentle Hands, and Put It Back images are present, as are Blocks’ first three visuals and the approved Explore & Create image. Wednesday Dramatic Play’s **Clean Up the Kitchen** is the next specific teaching step without its own image; it currently falls back to the general Dramatic Play illustration. Create that visual from the existing step text, preserving the realistic watercolor style. Do not regenerate approved images. This checkpoint does not claim the whole week has passed full curriculum/device QA.
