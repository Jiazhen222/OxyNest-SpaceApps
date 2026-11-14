'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const root = path.resolve(__dirname, '..');

function fixture(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'oxynest-validation-'));
  t.after(() => fs.rmSync(dir, {recursive: true, force: true}));
  fs.cpSync(path.join(root, 'data'), path.join(dir, 'data'), {recursive: true});
  fs.mkdirSync(path.join(dir, 'tools'));
  fs.copyFileSync(path.join(root, 'tools/check-structure.cjs'), path.join(dir, 'tools/check-structure.cjs'));
  return dir;
}
function mutate(dir, file, change) {
  const target = path.join(dir, 'data', file);
  const data = JSON.parse(fs.readFileSync(target, 'utf8'));
  change(data);
  fs.writeFileSync(target, JSON.stringify(data));
}
function run(dir) {
  const result = spawnSync(process.execPath, [path.join(dir, 'tools/check-structure.cjs')], {encoding: 'utf8'});
  assert.ifError(result.error);
  return {status: result.status, output: result.stdout + result.stderr};
}

test('real handoff reports the unresolved food metric without source-location false positives', () => {
  const result = run(root);
  assert.equal(result.status, 1);
  assert.match(result.output, /unresolved metric food_days_left/);
  assert.match(result.output, /Structural errors: 1\./);
});

test('broken recipe reference is rejected', t => {
  const dir = fixture(t);
  mutate(dir, 'recipes.json', d => {d.recipes[0].required_modules = ['nonexistent_module'];});
  assert.match(run(dir).output, /unresolved module nonexistent_module/);
});

test('ambiguous quiz answers are rejected', t => {
  const dir = fixture(t);
  mutate(dir, 'quiz.json', d => {d.tiles.find(x => x.quiz).quiz.options_explorer.forEach(x => {x.correct = true;});});
  assert.match(run(dir).output, /invalid explorer options/);
});

test('missing and malformed files report actionable errors', t => {
  const dir = fixture(t);
  fs.unlinkSync(path.join(dir, 'data/alarms.json'));
  fs.writeFileSync(path.join(dir, 'data/consumption.json'), '{invalid');
  const result = run(dir);
  assert.equal(result.status, 1);
  assert.match(result.output, /alarms:.*ENOENT/);
  assert.match(result.output, /consumption:/);
});

test('wrong container types and null event choices produce diagnostics without crashing', t => {
  const dir = fixture(t);
  mutate(dir, 'modules.json', d => {d.modules = {};});
  mutate(dir, 'wheel.json', d => {d.events[0].choices = [null];});
  const result = run(dir);
  assert.equal(result.status, 1);
  assert.match(result.output, /modules.modules: expected array/);
  assert.match(result.output, /event solar_output_drop choice: missing id/);
  assert.doesNotMatch(result.output, /TypeError|at Object\./);
});
