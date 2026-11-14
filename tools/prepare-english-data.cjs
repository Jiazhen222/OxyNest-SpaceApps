'use strict';

// Generate presentation-ready data without editing the supplied handoffs.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const files = Object.freeze([
  'alarms.json', 'consumption.json', 'destinations.json',
  'failure_chains.json', 'modules.json', 'quiz.json',
  'recipes.json', 'wheel.json', 'reality_vs_game.json'
]);
const han = /\p{Script=Han}/u;

function toEnglish(value, location = '$') {
  if (Array.isArray(value)) return value.map((item, i) => toEnglish(item, `${location}[${i}]`));
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value)
      .filter(([key]) => !key.endsWith('_zh'))
      .map(([key, item]) => {
        if (han.test(key)) throw new Error(`${location}: non-English field name`);
        return [key, toEnglish(item, `${location}.${key}`)];
      }));
  }
  if (typeof value !== 'string') return value;
  let text = value.replaceAll('Beyond Earth: Settler', 'OxyNest');
  // This supplied bilingual label has an explicit English counterpart.
  if (location.endsWith('.concept_label') && text === 'NASA Research Concept / \u6982\u5ff5\u63a2\u7d22') {
    text = 'NASA Research Concept';
  }
  if (han.test(text)) throw new Error(`${location}: untranslated Chinese text`);
  return text;
}

function prepare(root = path.resolve(__dirname, '..')) {
  const destination = path.join(root, 'runtime', 'data');
  // Parse and inspect the entire input before writing any generated file.
  const prepared = files.map(file => {
    const bytes = fs.readFileSync(path.join(root, 'data', file));
    const output = JSON.stringify(toEnglish(JSON.parse(bytes.toString('utf8'))), null, 2) + '\n';
    return {file, output, sourceSha256: crypto.createHash('sha256').update(bytes).digest('hex')};
  });
  fs.mkdirSync(destination, {recursive: true});
  for (const {file, output} of prepared) fs.writeFileSync(path.join(destination, file), output);
  const manifest = {
    purpose: 'English data projection; not scientific validation or a playable build.',
    transforms: ['Remove _zh fields', 'Use English concept labels', 'Update legacy project name'],
    sources: Object.fromEntries(prepared.map(({file, sourceSha256}) => [file, sourceSha256]))
  };
  fs.writeFileSync(path.join(destination, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  return destination;
}

if (require.main === module) {
  try {
    console.log(`Prepared nine English datasets: ${prepare()}`);
    console.log('Integration references and scientific claims still require review.');
  } catch (error) {
    console.error(`Data preparation failed: ${error.message}`);
    process.exitCode = 1;
  }
}

module.exports = {files, toEnglish, prepare};
