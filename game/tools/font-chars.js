// The characters the bundled Chinese font (fonts/*.subset.woff2) must contain.
// Run: node tools/font-chars.js   -> writes fonts/subset-chars.txt
// Then cut new font files with tools/subset-font.py (see fonts/README.md).
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');

function fontChars() {
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(root, 'js/i18n.js'), 'utf8'), sandbox);
  const zh = sandbox.window.OX_I18N.zh;
  let text = Object.values(zh).join('');
  text += '中文';                                            // the language button
  text += fs.readFileSync(path.join(root, 'index.html'), 'utf8').replace(/[\u0000-⿿]/g, ''); // any Chinese in the page
  for (let c = 0x20; c <= 0x7e; c++) text += String.fromCharCode(c);   // basic Latin, digits
  for (let c = 0xa0; c <= 0xff; c++) text += String.fromCharCode(c);   // Latin-1 (°, ×, ·)
  text += '–—‘’“”…•→←';                                     // general punctuation
  text += '，。！？：；、（）《》【】「」『』～·〇';                // full-width punctuation for future edits
  return Array.from(new Set(Array.from(text))).filter(ch => ch.trim() || ch === ' ').sort().join('');
}

module.exports = { fontChars };

if (require.main === module) {
  const chars = fontChars();
  fs.mkdirSync(path.join(root, 'fonts'), { recursive: true });
  fs.writeFileSync(path.join(root, 'fonts', 'subset-chars.txt'), chars, 'utf8');
  const cjk = Array.from(chars).filter(ch => ch.codePointAt(0) >= 0x3000).length;
  console.log(`fonts/subset-chars.txt written: ${Array.from(chars).length} characters (${cjk} Chinese or full-width).`);
}
