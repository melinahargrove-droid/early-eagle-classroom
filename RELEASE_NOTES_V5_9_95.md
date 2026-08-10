# v5.9.95 — Community Meeting Illustration Set

All four Week 1 Community Meeting teaching-flow pages now use the same
storybook/watercolor demonstration-illustration system:

1. Belly Breaths — child demonstrating belly breathing.
2. Conversation — children sharing feelings about starting school.
3. Name Ball — preschool friends playing Name Ball together.
4. Community Meeting Complete — welcoming classroom community scene.

Implementation rule:
- Every Community Meeting flow card may declare its own `visual` asset.
- `renderCommunityMeetingFlow()` remains the single renderer.
- The existing sequence, curriculum lookup, navigation, materials, and teacher notes are unchanged.
- `visualKey` fallbacks remain available, but the Week 1 cards now all use dedicated illustrations.
