EARLY EAGLE ACADEMY COMPANION — v2.0.1 MOBILE FIX

Replace only these two files in GitHub:

css/app.css
js/sceneManager.js

What this fixes:
- Anchors the fixed classroom canvas to the exact center of every viewport.
- Keeps the artwork and all overlays together while scaling.
- Prevents the scene from disappearing on tall phone screens.
- Does not touch any artwork, student data, audio, or other app files.

After committing the two replacements, Netlify should redeploy automatically.


## v5.3 Teacher Mode schedule editor
Teacher Mode can now edit each schedule activity name and time, choose the matching What’s Next illustration, reorder activities, remove activities, and add new activities (up to 9 so the locked Home schedule layout stays intact). What’s Next sayings remain editable per schedule row.

v5.5 additions
- Friends Today supports 20+ students in pages of 10 with previous/next controls.
- Teacher Mode attendance editor marks absent students and updates Present/Absent totals.
- End Day clears attendance for the next school day.
- Star of the Day uses attendance: an absent scheduled Star is skipped for the day without losing their place in rotation.
- Teacher Mode Star controls now include Previous, Next, and Choose Student.

V5.5.1 fix: Mark All Present now clears daily absences immediately, refreshes Friends Today and Star of the Day, and saves without requiring the Teacher Mode Save button.
V5.5.2 visual fix: Star of the Day artwork edges now feather naturally into the cream Home panel so the star and sparkles no longer appear inside a rectangular image box.
