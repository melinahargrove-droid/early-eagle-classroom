// Compile every inline classic script without executing it or fetching resources.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '../v6-test');
// Confirmed pre-existing errors, deferred to the separately scoped Centers repair.
// Remove each entry when that page is repaired; never silently skip new failures.
const known = new Map([
  ['week3-intro-centers.html#2', "Unexpected token ':'"],
  ['week4-intro-centers.html#2', "Unexpected token ':'"],
  ['week5-intro-centers.html#2', "Unexpected token ':'"]
]);
let checked = 0;
for (const file of fs.readdirSync(root).filter(file => file.endsWith('.html')).sort()) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  for (const [index, match] of [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)].entries()) {
    const attrs = match[1];
    if (/\bsrc\s*=/i.test(attrs)) continue;
    const type = attrs.match(/\btype\s*=\s*["']([^"']+)["']/i)?.[1];
    if (type && !/^(?:text|application)\/(?:java|ecma)script$/i.test(type)) continue;
    const key = `${file}#${index}`;
    let error;
    try { new vm.Script(match[2], { filename: key }); } catch (e) { error = e; }
    if (known.has(key)) {
      assert.equal(error?.message, known.get(key), `${key}: update the known-failure list when repaired`);
      console.log(`KNOWN DEFERRED: ${key}: ${error.message}`);
      known.delete(key);
    } else {
      assert.ifError(error);
      checked++;
    }
  }
}
assert.equal(known.size, 0, 'Every known failure was found');
console.log(`${checked} inline scripts compile; 3 explicitly listed Centers failures deferred`);
