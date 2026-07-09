const fs = require('fs');
const path = require('path');

const fixes = {
  "お酒": "sake, minuman keras",
  "にぎやか": "ramai, sibuk"
};

const csvPath = path.join(__dirname, 'data', 'seed', 'jlpt_n5_vocabulary_seed_with_examples.csv');
const data = fs.readFileSync(csvPath, 'utf8');

const lines = data.split('\n');
const headers = lines[0].split(',');
const meaningIdIdx = headers.indexOf('meaning_id');
const expressionIdx = headers.indexOf('expression');

let updatedLines = [lines[0]];

for (let i = 1; i < lines.length; i++) {
  if (!lines[i].trim()) {
    updatedLines.push(lines[i]);
    continue;
  }
  
  const parts = lines[i].match(/(?!\s*$)\s*(?:'([^'\\]*(?:\\[\s\S][^'\\]*)*)'|"([^"\\]*(?:\\[\s\S][^"\\]*)*)"|([^,'"\s\\]*(?:\s+[^,'"\s\\]+)*))\s*(?:,|$)/g);
  if (!parts) {
    updatedLines.push(lines[i]);
    continue;
  }
  
  const cleanedParts = parts.map(p => p.replace(/,$/, '').trim().replace(/^"|"$/g, ''));
  if (cleanedParts.length > meaningIdIdx) {
    const expr = cleanedParts[expressionIdx];
    
    if (fixes[expr]) {
      const newToken = fixes[expr].includes(',') ? `"${fixes[expr]}"` : fixes[expr];
      const hasComma = parts[meaningIdIdx].endsWith(',');
      parts[meaningIdIdx] = newToken + (hasComma ? ',' : '');
      updatedLines.push(parts.join(''));
      continue;
    }
  }
  updatedLines.push(lines[i]);
}

fs.writeFileSync(csvPath, updatedLines.join('\n'));
console.log('Successfully updated CSV with the last remaining Indonesian meanings.');
