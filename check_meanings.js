const fs = require('fs');
const path = require('path');
const csvPath = path.join(__dirname, 'data', 'seed', 'jlpt_n5_vocabulary_seed_with_examples.csv');
const data = fs.readFileSync(csvPath, 'utf8');

const lines = data.split('\n');
const headers = lines[0].split(',');
const meaningIdIdx = headers.indexOf('meaning_id');
const meaningEnIdx = headers.indexOf('meaning_en');
const expressionIdx = headers.indexOf('expression');

let allMeanings = [];

for (let i = 1; i < lines.length; i++) {
  if (!lines[i].trim()) continue;
  const parts = lines[i].match(/(?!\s*$)\s*(?:'([^'\\]*(?:\\[\s\S][^'\\]*)*)'|"([^"\\]*(?:\\[\s\S][^"\\]*)*)"|([^,'"\s\\]*(?:\s+[^,'"\s\\]+)*))\s*(?:,|$)/g);
  if (!parts) continue;
  
  const cleanedParts = parts.map(p => p.replace(/,$/, '').trim().replace(/^"|"$/g, ''));
  if (cleanedParts.length > meaningEnIdx) {
    const mId = cleanedParts[meaningIdIdx] || "";
    const mEn = cleanedParts[meaningEnIdx] || "";
    const expr = cleanedParts[expressionIdx] || "";
    allMeanings.push({ expr, mEn, mId });
  }
}

fs.writeFileSync('all_meanings.json', JSON.stringify(allMeanings, null, 2));
console.log('Saved to all_meanings.json, total:', allMeanings.length);
