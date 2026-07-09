const fs = require('fs');
const meanings = JSON.parse(fs.readFileSync('all_meanings.json', 'utf8'));
let words = new Set();
meanings.forEach(m => {
  if (!m.mId) return;
  m.mId.toLowerCase().replace(/[^a-z0-9]/g, ' ').split(/\s+/).forEach(w => {
    if (w.length > 2) words.add(w);
  });
});
fs.writeFileSync('all_words.txt', Array.from(words).sort().join('\n'));
console.log('Saved to all_words.txt');
