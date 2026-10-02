// Geometry shared by Thursday local Chromium and real Pages acceptance.
// A wrapped inline link has one client rect per line. Its union-box center can
// lie between lines or in unlinked trailing whitespace, so it is not a
// valid click probe. Require every rendered fragment to fit and hit the target.
const assert = require('node:assert/strict');
function inspectTarget(el) {
  const doc = el.ownerDocument, viewport = doc.defaultView, union = el.getBoundingClientRect();
  // Include descendant spans/icons as well, so a visible outer box cannot hide
  // a clipped or covered inner fragment. Descendant hits belong to the target.
  const rendered = [el, ...el.querySelectorAll('*')].flatMap(node => [...node.getClientRects()]);
  const fragments = rendered.filter(r => r.width > 0 && r.height > 0).map(r => {
    const x = r.x + r.width / 2, y = r.y + r.height / 2;
    const hit = doc.elementFromPoint(x, y);
    return {
      x: r.x, y: r.y, width: r.width, height: r.height,
      inside: r.x >= 0 && r.y >= 0 && r.right <= viewport.innerWidth + 1 && r.bottom <= viewport.innerHeight + 1,
      hit: !!hit && (hit === el || el.contains(hit))
    };
  });
  const style = typeof viewport.getComputedStyle === 'function' ? viewport.getComputedStyle(el) : null;
  return {
    width: union.width, height: union.height,
    scrollWidth: el.scrollWidth, clientWidth: el.clientWidth, scrollHeight: el.scrollHeight, clientHeight: el.clientHeight,
    fontSize: style?.fontSize || null, lineHeight: style?.lineHeight || null,
    textFits: el.scrollWidth <= el.clientWidth + 1 && el.scrollHeight <= el.clientHeight + 1,
    fragments,
    inside: fragments.length > 0 && fragments.every(r => r.inside),
    hit: fragments.length > 0 && fragments.every(r => r.hit)
  };
}
async function target(locator, label) {
  const geometry = await locator.evaluate(inspectTarget);
  assert(geometry.width > 0 && geometry.height > 0 && geometry.textFits && geometry.inside && geometry.hit,
    `${label}: every rendered fragment is visible, unclipped and unobscured ${JSON.stringify(geometry)}`);
}
function rect(x, y, width, height) { return {x, y, width, height, right: x + width, bottom: y + height}; }
function fixture(fragments, options = {}) {
  const union = rect(Math.min(...fragments.map(r => r.x)), Math.min(...fragments.map(r => r.y)),
    Math.max(...fragments.map(r => r.right)) - Math.min(...fragments.map(r => r.x)),
    Math.max(...fragments.map(r => r.bottom)) - Math.min(...fragments.map(r => r.y)));
  const outside = {}, descendant = {getClientRects: () => options.descendantRects || []}, el = {
    scrollWidth: options.overflow ? 120 : 100, clientWidth: 100, scrollHeight: 47, clientHeight: 47,
    getBoundingClientRect: () => union, getClientRects: () => fragments, contains: node => node === descendant,
    querySelectorAll: () => options.descendantRects ? [descendant] : []
  };
  el.ownerDocument = {defaultView: {innerWidth: options.width || 1180, innerHeight: 757}, elementFromPoint(x, y) {
    const index = fragments.findIndex(r => x >= r.x && x <= r.right && y >= r.y && y <= r.bottom);
    return index < 0 || index === options.blocked ? outside : options.descendant ? descendant : el;
  }};
  return el;
}
async function regression() {
  // Deterministic reproduction of the observed 293.1875 x 47 union rectangle:
  // line 2 is much shorter, and the union center falls between the real lines.
  const wrapped = fixture([rect(850, 520, 293.1875, 23), rect(850, 544, 90, 23)]);
  const union = wrapped.getBoundingClientRect();
  assert.notEqual(wrapped.ownerDocument.elementFromPoint(union.x + union.width / 2, union.y + union.height / 2), wrapped,
    'Previous union-center probe reproduces the false negative');
  const probe = inspectTarget(wrapped);
  assert.equal(probe.fragments.length, 2); assert(probe.fragments.every(r => r.hit && r.inside));
  await target({evaluate: fn => fn(wrapped)}, 'Wrapped source link');
  await target({evaluate: fn => fn(fixture([rect(30, 40, 180, 48)], {descendant: true}))}, 'Button descendant hit');
  const wrappedSpans = fixture([rect(850, 520, 293.1875, 23), rect(850, 544, 90, 23)], {descendant: true, descendantRects: [rect(850, 520, 293.1875, 23), rect(850, 544, 90, 23)]});
  assert.equal(inspectTarget(wrappedSpans).fragments.length, 4, 'All nested-span fragments inspected, not only the outer anchor');
  await target({evaluate: fn => fn(wrappedSpans)}, 'Wrapped nested spans');
  for (const [name, el] of [
    ['obscured second fragment', fixture([rect(850, 520, 293.1875, 23), rect(850, 544, 90, 23)], {blocked: 1})],
    ['clipped second fragment', fixture([rect(850, 520, 293.1875, 23), rect(1150, 544, 90, 23)])],
    ['clipped inner span', fixture([rect(30, 40, 180, 48)], {descendantRects: [rect(1170, 40, 100, 23)]})],
    ['overflowing text', fixture([rect(30, 40, 180, 48)], {overflow: true})],
    ['no rendered fragments', fixture([rect(30, 40, 0, 0)])]
  ]) await assert.rejects(() => target({evaluate: fn => fn(el)}, name), /every rendered fragment/);
  console.log('PASS: wrapped-link union-center false negative reproduced; all fragments required; obscured, clipped, overflowing and empty targets rejected');
}
module.exports = {inspectTarget, target};
if (require.main === module) regression().catch(error => { console.error(error); process.exitCode = 1; });
