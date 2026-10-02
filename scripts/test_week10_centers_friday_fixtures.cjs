// Expected activities come from existing, source-reviewed Week 2 plans rather
// than from the new Friday runtime or a second copy of its selector registry.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(process.env.WEEK10_FRIDAY_APP_ROOT || path.join(__dirname, '../v6-test'));
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const plans = Object.fromEntries(['monday', 'tuesday', 'wednesday', 'thursday'].map(day => [day, JSON.parse(read(`week10-centers-${day}-plan.json`))]));
const activities = [
  {key: 'nature-arrangements', label: 'Nature Arrangements', pages: plans.monday.slice(0, 1)},
  {key: 'building-autumn-trees', label: 'Building Autumn Trees', pages: plans.monday.slice(1, 2)},
  {key: 'cooking-soup', label: 'Cooking Soup', pages: plans.tuesday.slice(0, 4)},
  {key: 'storytelling-props', label: 'Storytelling with Props', pages: plans.tuesday.slice(4, 5)},
  {key: 'leaf-collections', label: 'Leaf Collections', pages: plans.wednesday.slice(0, 1)},
  {key: 'multilingual-color-poem', label: 'Multilingual Color Poem', pages: plans.wednesday.slice(1, 2)},
  {key: 'class-soup', label: 'Class Soup', pages: plans.thursday.slice(0, 1)}
];
const sourcePlan = 'https://docs.google.com/document/d/1lYe4_XN0sIUJeeEt2kbxzxtzqkteNSX9woHXpfXlb7Y/edit';
module.exports = {root, read, plans, activities, sourcePlan};
