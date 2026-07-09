const fs = require('fs');
const Papa = require('papaparse');

const csv = fs.readFileSync('data/seed/jlpt_n5_vocabulary_seed_with_examples.csv', 'utf-8');
const result = Papa.parse(csv, { header: true, skipEmptyLines: true });
const rows = result.data;
const h = result.meta.fields;
const meaningIdx = h.indexOf('meaning_id');

// All remaining fixes
const fixes = {
  // あ行
  'vocab_n5_0022': 'arah sana (sopan)',
  'vocab_n5_0023': 'panas (cuaca/lingkungan)',
  'vocab_n5_0024': 'panas (benda/cairan)',
  'vocab_n5_0041': 'ada (benda mati)',
  'vocab_n5_0048': 'bagaimana (sopan)',
  'vocab_n5_0050': 'berapa banyak, berapa buah',
  'vocab_n5_0051': 'berapa (harga/jumlah)',
  'vocab_n5_0061': 'hari ke-5, lima hari',
  'vocab_n5_0063': 'lima buah',
  'vocab_n5_0071': 'ada (makhluk hidup)',

  // か行
  'vocab_n5_0090': 'bahasa Inggris',
  'vocab_n5_0113': 'menekan, mendorong',
  'vocab_n5_0127': 'kakak perempuan (sopan)',
  'vocab_n5_0133': 'polisi (sapaan ramah)',
  'vocab_n5_0144': 'negara asing',
  'vocab_n5_0153': 'membutuhkan (waktu, uang)',
  'vocab_n5_0158': 'meletakkan di, menggantung di',
  'vocab_n5_0159': 'mendial, menelepon',
  'vocab_n5_0164': 'orang/cara (sopan)',
  'vocab_n5_0173': 'vas bunga',

  // た行
  'vocab_n5_0206': 'saudara kandung',
  'vocab_n5_0212': 'singkatan kilo (kilogram)',
  'vocab_n5_0213': 'singkatan kilo (kilometer)',
  'vocab_n5_0242': 'penghitung benda kecil (buah, cangkir)',
  'vocab_n5_0250': 'jas, lapangan tenis',
  'vocab_n5_0254': 'hari ke-9, sembilan hari',
  'vocab_n5_0255': 'sembilan buah',
  'vocab_n5_0270': 'bulan ini',
  'vocab_n5_0272': 'seperti ini, semacam ini',

  // な行
  'vocab_n5_0281': 'mengangkat (tangan), membuka (payung)',
  'vocab_n5_0285': 'dingin (cuaca)',

  // は行
  'vocab_n5_0320': 'kuat, tahan lama',
  'vocab_n5_0353': 'bulan lalu',
  'vocab_n5_0358': 'ya (setuju), sepertinya, memang begitu',
  'vocab_n5_0360': 'dan, juga',
  'vocab_n5_0361': 'tempat itu, situ, bawah',
  'vocab_n5_0366': 'dekat, di samping, soba',
  'vocab_n5_0375': 'sangat suka',
  'vocab_n5_0389': 'meminta, memesan',
  'vocab_n5_0404': 'kereta bawah tanah',

  // や行
  'vocab_n5_0434': 'singkatan department store',
  'vocab_n5_0440': 'kereta listrik',
  'vocab_n5_0442': 'pintu geser Jepang',
  'vocab_n5_0450': 'terima kasih, bagaimana pun juga',
  'vocab_n5_0457': 'mana, di mana',
  'vocab_n5_0461': 'yang mana (sopan), ke mana',
  'vocab_n5_0465': 'di samping, sebelah',
  'vocab_n5_0474': 'memotret, merekam',
  'vocab_n5_0476': 'jenis apa, seperti apa',
  'vocab_n5_0481': 'membuat suara (hewan)',

  // ら行
  'vocab_n5_0495': 'apa jenis',
  'vocab_n5_0506': 'melepas pakaian',
  'vocab_n5_0537': 'hari ke-20, duapuluh hari',

  // わ行
  'vocab_n5_0560': 'memainkan alat musik',
  'vocab_n5_0582': 'dua buah',
  'vocab_n5_0584': 'dua orang',
  'vocab_n5_0585': 'hari ke-2, dua hari',
  'vocab_n5_0614': 'penghitung benda pipih',
  'vocab_n5_0642': 'hari ke-3, tiga hari',
  'vocab_n5_0643': 'tiga buah',
  'vocab_n5_0645': 'semua kalian, semuanya',
  'vocab_n5_0673': 'delapan buah',
  'vocab_n5_0676': 'sore (sebelum malam)',
  'vocab_n5_0678': 'kantor pos',
  'vocab_n5_0683': 'hari ke-8, delapan hari',
  'vocab_n5_0687': 'hari ke-4, empat hari',
  'vocab_n5_0688': 'empat buah',
  'vocab_n5_0693': 'bulan depan',
  'vocab_n5_0705': 'rekaman/piringan hitam',
  'vocab_n5_0710': 'kemeja kerja',
};

// Apply fixes
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
