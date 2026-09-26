# Curriculum Image Progress

Updated: September 26, 2026 (America/Chicago).

## Active work — Unit 2 Week 1

User correction, September 26, 2026: **Stay in Unit 2 Week 1. Return to Unit 1 later.** This supersedes earlier resume instructions. Do not start Unit 1 or Unit 2 Week 2 without user direction.

### Current image coverage check

Executed both current Week 9 lesson scripts for all five weekdays and all section views: 65 rendered teaching cards/read-aloud steps, using 43 unique images. Every screen selected an image, every selected image exists in the repository, and all 43 live image URLs returned HTTP 200 with image content types. This is image coverage and availability verification, not a complete curriculum or classroom-device acceptance audit.

Friday’s six dedicated images are published (PR #156) and visually checked. Shared weekly images are intentional existing assets; do not treat reuse alone as an unfinished or broken visual.

### Remaining content follow-up

Foundational Literacy still points to the current replacement routine and Literacy Small Groups still points to a current small-group plan instead of providing full daily sequences. Their images exist. Verify the approved Focus on Pre-K 3s source and replacement literacy materials before expanding these sections; do not invent lesson scripts or activities. No new missing-image slot was found in the current week screens.

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
