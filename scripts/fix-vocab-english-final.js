const fs = require('fs');
const Papa = require('papaparse');

const csv = fs.readFileSync('data/seed/jlpt_n5_vocabulary_seed_with_examples.csv', 'utf-8');
const result = Papa.parse(csv, { header: true, skipEmptyLines: true });
const rows = result.data;
const h = result.meta.fields;
const meaningIdx = h.indexOf('meaning_id');

// Final cleanup - only true English words that need fixing
const fixes = {
  'vocab_n5_0113': 'menekan, mendorong',
  'vocab_n5_0133': 'polisi (sapaan ramah)',
  'vocab_n5_0212': 'singkatan kilo (kilogram)',
  'vocab_n5_0213': 'singkatan kilo (kilometer)',
  'vocab_n5_0250': 'jas, lapangan tenis',
  'vocab_n5_0281': 'mengangkat (tangan), membuka (payung)',
  'vocab_n5_0360': 'dan, juga',
  'vocab_n5_0366': 'dekat, di samping, soba',
  'vocab_n5_0389': 'meminta, memesan',
  'vocab_n5_0434': 'toko serba ada',
  'vocab_n5_0440': 'kereta listrik',
  'vocab_n5_0442': 'pintu geser Jepang',
  'vocab_n5_0450': 'terima kasih, bagaimana pun juga',
  'vocab_n5_0474': 'memotret, merekam',
  'vocab_n5_0506': 'melepas pakaian',
  'vocab_n5_0560': 'memainkan alat musik',
  'vocab_n5_0614': 'penghitung benda pipih',
  'vocab_n5_0705': 'rekaman/piringan hitam',
  'vocab_n5_0710': 'kemeja kerja',
  'vocab_n5_0272': 'seperti ini, semacam ini',
  'vocab_n5_0320': 'kuat, tahan lama',
  'vocab_n5_0481': 'membuat suara (hewan)',
  'vocab_n5_0676': 'sore (sebelum malam)',
};

let fixed = 0;
rows.forEach(row => {
  const id = row.id;
  if (fixes[id]) {
    row[h[meaningIdx]] = fixes[id];
    fixed++;
  }
});

console.log('Fixed:', fixed, 'entries');

// Save
const output = Papa.unparse(rows, { columns: h });
fs.writeFileSync('data/seed/jlpt_n5_vocabulary_seed_with_examples.csv', output, 'utf-8');
console.log('CSV saved!');

// Verify by showing a sample
console.log('\nSample of updated entries:');
rows.slice(0, 10).forEach(r => {
  console.log(r[h[3]] + ': ' + r[h[meaningIdx]]);
});
