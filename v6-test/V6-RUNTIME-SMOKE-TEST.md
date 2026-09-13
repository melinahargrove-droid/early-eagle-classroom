# EEA Classroom Companion V6 — Final Runtime Smoke Test

Use this checklist only after the source-level V6 audit is GREEN. Test the deployed/installed `v6-test` build, not an older folder or cached copy.

## Pass criteria
V6 is ready to become the production source of truth only when every required section below passes on a real browser/device. Record any failure before changing data so it can be reproduced.

## 1. Fresh-install / empty-class test
Use a browser profile or device with no existing EEA site data.

- Open V6 Home.
- Confirm Home loads without console-visible/broken-page behavior.
- Open Teacher's Desk → Students.
- Confirm the active class roster is genuinely empty; no sample names appear.
- Open Attendance.
- Confirm the page says there are no students in this class and offers the Students setup path.
- Open Choose a Friend.
- Confirm no sample sticks/names appear and the page intentionally directs setup toward Students.
- Open Center Choice.
- Confirm no sample names appear and the chooser cannot create an imaginary child.
- Confirm Star of the Day does not manufacture a student.

**PASS:** empty really means empty everywhere.

## 2. AM / PM isolation test
In AM, add three distinctive students such as `AM One`, `AM Two`, `AM Three`. Mark two present and create some daily state (Star/chooser/center choice or schedule progress).

- Switch to PM in Teacher's Desk.
- Confirm PM starts with its own empty roster and does not inherit AM names or daily state.
- Add two distinctive PM students such as `PM One`, `PM Two` and mark them present.
- Use Choose a Friend and/or Center Choice enough to create PM round state.
- Switch back to AM.
- Confirm the exact AM roster returns.
- Confirm AM attendance and saved chooser/center state return rather than PM state.
- Switch to PM again and confirm PM state returns unchanged.

**PASS:** AM and PM class-specific data never bleed into one another.

## 3. Star lifecycle + Star-first test
Use a populated class with today's attendance marked.

- Confirm Star rotation follows alphabetical order.
- With the scheduled Star present, open Choose a Friend and confirm the first chosen friend is today's Star.
- Reset/create a fresh Center Choice round and confirm the first chooser is today's Star.
- Test an absent scheduled Star: mark that child absent before Star resolution and confirm the next present eligible child becomes Star while the absent child remains pending.
- If practical, mark the originally scheduled child present later the same day and confirm they do not reclaim Star after the substitute was resolved.

**PASS:** Star lifecycle and both Star-first flows match the source-of-truth rules.

## 4. Saved-state / navigation test
- Begin a Choose a Friend round, choose at least one child, navigate away, then return. Confirm the round resumes correctly.
- Begin Center Choice, assign at least one child, navigate away, then return. Confirm counts/current progress resume correctly.
- Start the full-screen Timer, navigate away, return, and confirm remaining/running state resumes correctly.
- Start the Home quick timer, navigate away, return, and confirm it resumes correctly.
- Start Stay in Your Center, pause/resume as applicable, navigate away, return, and confirm hatch/timer progress is retained.
- Advance the Daily Schedule, reload Home, and confirm schedule progress remains coherent.

**PASS:** current-day state survives ordinary navigation/reload without cross-class leakage.

## 5. Existing-data migration test
Use a browser/device containing real pre-profile classroom data or restore a representative backup made before AM/PM profiles.

- Open the current V6 build.
- Confirm existing classroom roster/data remains the AM class.
- Confirm switching to PM does not overwrite AM.
- Switch back to AM and verify original data is still intact.
- Confirm no sample roster is injected during migration.

**PASS:** old classroom data survives migration and becomes AM without destructive overwrite.

## 6. Backup / Restore test
- Create distinctive AM and PM data.
- Export a V6 backup.
- Change/remove enough data to make restoration obvious.
- Restore the backup.
- Confirm both class profiles, active-class state, roster data, and major classroom state return.
- If using Classroom Protection from Students, confirm its recovery-file workflow still opens/updates as expected in a supported browser.

**PASS:** recovery covers both profiles and current V6 state.

## 7. Offline / installed-PWA test
First open/install V6 while online and allow the service worker to finish installing. Current audited cache version is `eea-companion-v13`.

- Close/reopen the installed app once while still online.
- Disconnect the device from the network (or use browser DevTools Offline).
- Launch Home.
- Open Attendance, Students, Star, Choose a Friend, Center Choice, Timer, Stay in Your Center, Teacher's Desk, Daily Lessons, and at least one Week 1–9 lesson route.
- Confirm local artwork needed by those screens appears.
- Confirm normal local navigation works without a network connection.
- Confirm intentionally external content (for example YouTube/live network resources) is the only content expected to be unavailable offline.
- Reconnect and confirm the app recovers normally.

**PASS:** the installed classroom shell and core lesson/classroom paths work offline.

## 8. SmartBoard / classroom-device test
Run on the actual classroom display/browser if possible.

- Confirm 1920×1080 Home and major full-screen tools fit without browser-scroll surprises.
- Confirm large touch targets respond reliably: Home tools, Choose a Friend, Center Choice, Timer controls, schedule progress, close/home controls.
- Confirm audio can be unlocked by a normal touch/click and then plays as expected.
- Confirm no accidental browser zoom/selection behavior makes normal classroom use difficult.
- Run a short realistic flow: Attendance → Home → Star → lesson → Choose a Friend/Center Choice → Stay in Your Center → Clean Up.

**PASS:** the complete classroom flow is usable on the real display.

## 9. Final production decision
Only after Sections 1–8 pass:

- Record the tested browser/device and date.
- Record any intentionally unsupported/offline-external behavior.
- Mark `v6-test` as the production source of truth in the audit checkpoint/master documentation.
- Do not remove compatibility redirects that the static audit still reports as referenced unless their callers are migrated first.
