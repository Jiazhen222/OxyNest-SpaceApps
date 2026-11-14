'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {files, toEnglish, prepare} = require('../tools/prepare-english-data.cjs');

test('English projection preserves values, identity and source input', () => {
  const source = {id: 'unchanged', name: 'Beyond Earth: Settler', name_zh: '\u4e2d\u6587', rate: 0.035,
    rows: [{concept_label: 'NASA Research Concept / \u6982\u5ff5\u63a2\u7d22', source: 'https://science.nasa.gov/moon/facts/'}]};
  const before = JSON.stringify(source);
  assert.deepEqual(toEnglish(source), {id: 'unchanged', name: 'OxyNest', rate: 0.035,
    rows: [{concept_label: 'NASA Research Concept', source: 'https://science.nasa.gov/moon/facts/'}]});
  assert.equal(JSON.stringify(source), before);
});

test('untranslated display text and field names stop preparation', () => {
  assert.throws(() => toEnglish({title: 'Untranslated \u4e2d\u6587'}), /untranslated/);
  assert.throws(() => toEnglish({'\u4e2d\u6587': 'value'}), /field name/);
});

test('projection keeps gameplay numbers and references in all nine real datasets', () => {
  const root = path.resolve(__dirname, '..');
  for (const file of files) {
    const source = JSON.parse(fs.readFileSync(path.join(root, 'data', file), 'utf8'));
    const result = toEnglish(source);
    assert.doesNotMatch(JSON.stringify(result), /\p{Script=Han}/u);
    function compare(a, b, key = '') {
      if (key.endsWith('_zh')) return;
      if (Array.isArray(a)) { assert.equal(b.length, a.length); a.forEach((x, i) => compare(x, b[i])); }
      else if (a && typeof a === 'object') for (const [k, v] of Object.entries(a)) compare(v, b[k], k);
      else if (typeof a !== 'string' || ['id','source','terminal_metric','classification','parameter_status'].includes(key)) assert.deepEqual(b, a);
    }
    compare(source, result);
  }
});

test('invalid input leaves an existing generated output untouched', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'oxynest-test-'));
  t.after(() => fs.rmSync(root, {recursive: true, force: true}));
  fs.mkdirSync(path.join(root, 'data'));
  for (const file of files) fs.writeFileSync(path.join(root, 'data', file), '{}');
  const output = path.join(root, 'runtime', 'data');
  fs.mkdirSync(output, {recursive: true});
  fs.writeFileSync(path.join(output, 'alarms.json'), 'existing output');
  fs.writeFileSync(path.join(root, 'data', files.at(-1)), '{invalid');
  assert.throws(() => prepare(root));
  assert.equal(fs.readFileSync(path.join(output, 'alarms.json'), 'utf8'), 'existing output');
});
