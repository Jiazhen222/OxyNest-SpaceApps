'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8').replace(/^\uFEFF/, '');
const box = { window: {} };
vm.createContext(box);
for (const name of ['content', 'i18n']) {
  vm.runInContext(read(`game/js/${name}.js`), box, { filename: name });
}
const C = box.window.OX_CONTENT;
const I = box.window.OX_I18N;

test('published game files retain the received handoff bytes', () => {
  const manifest = JSON.parse(read('docs/GAME_SOURCE_MANIFEST.json'));
  assert.equal(manifest.files.length, 18);
  for (const file of manifest.files) {
    const bytes = fs.readFileSync(path.join(root, file.path));
    assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), file.sha256, file.path);
  }
});

test('both languages have matching keys and interpolation parameters', () => {
  assert.deepEqual(Object.keys(I.en).sort(), Object.keys(I.zh).sort());
  const parameters = text => (text.match(/\{\w+\}/g) || []).sort();
  for (const key of Object.keys(I.en)) {
    assert.deepEqual(parameters(I.en[key]), parameters(I.zh[key]), key);
  }
});

test('every choice offers exactly one correct role and valid ordered options', () => {
  for (const [id, choice] of Object.entries(C.CHOICES)) {
    assert.equal(Object.values(choice.roles).filter(role => role === 'c').length, 1, id);
    assert.equal(new Set(choice.order).size, choice.order.length, id);
    for (const option of choice.order) assert.ok(Object.hasOwn(choice.roles, option), `${id}: ${option}`);
  }
});

test('age settings preserve the received difficulty differences', () => {
  assert.equal(C.LEVELS.explorer.countdown, 0);
  assert.equal(C.LEVELS.explorer.numbers, false);
  assert.equal(C.LEVELS.engineer.pause, true);
  assert.ok(C.LEVELS.engineer.countdown > C.LEVELS.commander.countdown);
  assert.equal(C.LEVELS.commander.chain, true);
  assert.equal(C.LEVELS.commander.units, true);
});

test('first-try rewards exceed retries and wrong choices reduce survival', () => {
  assert.ok(C.REWARD.first.stars > C.REWARD.later.stars);
  assert.ok(C.REWARD.first.survival > C.REWARD.later.survival);
  assert.ok(C.REWARD.later.survival > 0);
  assert.ok(C.REWARD.wrong.survival < 0);
});

test('game entry references existing local styles and scripts', () => {
  const html = read('game/index.html');
  const assets = [...html.matchAll(/(?:src|href)=["']([^"']+\.(?:js|css))["']/g)].map(match => match[1]);
  assert.ok(assets.length >= 6);
  for (const asset of assets) {
    const resolved = path.resolve(root, 'game', asset);
    assert.ok(resolved.startsWith(path.join(root, 'game') + path.sep), asset);
    assert.ok(fs.statSync(resolved).isFile(), asset);
  }
});
