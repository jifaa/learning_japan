const fs = require('fs');
const Papa = require('papaparse');

const csv = fs.readFileSync('data/seed/jlpt_n5_vocabulary_seed_with_examples.csv', 'utf-8');
const result = Papa.parse(csv, { header: true, skipEmptyLines: true });
const rows = result.data;
const h = result.meta.fields;
const meaningIdIdx = h.indexOf('meaning_id');
const exprIdx = h.indexOf('expression');

// Specific fixes for entries with English meanings
const fixes = {
  // あ行
  'vocab_n5_0022': { meaning: 'arah sana (sopan)', expr: 'あちら' },
  'vocab_n5_0023': { meaning: 'panas (cuaca/lingkungan)', expr: '暑い' },
  'vocab_n5_0024': { meaning: 'panas (benda/cairan)', expr: '熱い' },
  'vocab_n5_0032': { meaning: 'itu di sana, aquela, oh (ekspresi ragu)', expr: 'あの' },
  'vocab_n5_0036': { meaning: 'tidak terlalu, sisa', expr: '余り' },
  'vocab_n5_0041': { meaning: 'ada (benda mati)', expr: '有る' },
  'vocab_n5_0043': { meaning: 'itu di sana', expr: 'あれ' },
  'vocab_n5_0048': { meaning: 'bagaimana (sopan)', expr: 'いかが' },
  'vocab_n5_0050': { meaning: 'berapa banyak, berapa tahun', expr: 'いくつ' },
  'vocab_n5_0051': { meaning: 'berapa (harga/ jumlah)', expr: 'いくら' },
  'vocab_n5_0061': { meaning: 'hari ke-5, lima hari', expr: '五日' },
  'vocab_n5_0063': { meaning: 'lima buah', expr: '五つ' },
  'vocab_n5_0064': { meaning: 'selalu, biasanya', expr: 'いつも' },
  'vocab_n5_0071': { meaning: 'ada (makhluk hidup)', expr: '居る' },

  // か行
  'vocab_n5_0090': { meaning: 'bahasa Inggris', expr: '英語' },
  'vocab_n5_0105': { meaning: 'bangun (dari tidur), terjadi', expr: '起きる' },
  'vocab_n5_0111': { meaning: 'kakek (laki-laki)', expr: 'おじいさん' },
  'vocab_n5_0127': { meaning: 'kakak perempuan (sopan)', expr: 'お姉さん' },
  'vocab_n5_0133': { meaning: 'polisi (sapaan ramah)', expr: 'お回りさん' },
  'vocab_n5_0143': { meaning: 'penghitung lantai bangunan', expr: '～階' },
  'vocab_n5_0144': { meaning: 'negara asing', expr: '外国' },
  'vocab_n5_0153': { meaning: 'membutuhkan (waktu, uang)', expr: 'かかる' },
  'vocab_n5_0158': { meaning: 'meletakkan di, menggantung di', expr: '掛ける' },
  'vocab_n5_0164': { meaning: 'orang/cara (sopan)', expr: '方' },
  'vocab_n5_0167': { meaning: 'penghitung bulan', expr: '～月' },
  'vocab_n5_0173': { meaning: 'vas bunga', expr: '花瓶' },
  'vocab_n5_0174': { meaning: 'memakai (di kepala)', expr: 'かぶる' },
  'vocab_n5_0183': { meaning: 'kari (singkatan)', expr: 'カレー' },

  // た行
  'vocab_n5_0206': { meaning: 'saudara kandung', expr: '兄弟' },
  'vocab_n5_0212': { meaning: 'singkatan kilo (kilogram)', expr: 'キロ; キログラム' },

  // な行
  'vocab_n5_0254': { meaning: 'hari ke-9, sembilan hari', expr: '九日' },
  'vocab_n5_0258': { meaning: 'orang ini (sopan), arah ini', expr: 'こちら' },
  'vocab_n5_0259': { meaning: 'orang ini, arah ini', expr: 'こっち' },
  'vocab_n5_0285': { meaning: 'dingin (cuaca)', expr: '寒い' },
  'vocab_n5_0307': { meaning: 'menutup, tertutup', expr: '閉まる' },

  // は行
  'vocab_n5_0337': { meaning: 'setiap, masing-masing', expr: '～ずつ' },
  'vocab_n5_0358': { meaning: 'ya (setuju), sepertinya, memang begitu', expr: 'そう; そうです' },
  'vocab_n5_0361': { meaning: 'tempat itu, situ, bawah', expr: 'そこ' },
  'vocab_n5_0374': { meaning: 'tidak apa-apa, aman', expr: '大丈夫' },
  'vocab_n5_0380': { meaning: 'hanya, sekadar', expr: '～だけ' },
  'vocab_n5_0383': { meaning: 'mengeluarkan, mengirim', expr: '出す' },
  'vocab_n5_0398': { meaning: 'perlahan-lahan', expr: '段々' },
  'vocab_n5_0403': { meaning: 'dekat, sekitarnya', expr: '近く' },

  // や行
  'vocab_n5_0412': { meaning: 'satu hari, hari ke-1 bulan', expr: '一日' },
  'vocab_n5_0419': { meaning: 'menyalakan, menempelkan', expr: 'つける' },
  'vocab_n5_0430': { meaning: 'bisa, mampu', expr: 'できる' },

  // ら行
  'vocab_n5_0446': { meaning: 'bagaimana', expr: 'どう' },
  'vocab_n5_0447': { meaning: 'kenapa', expr: 'どうして' },
  'vocab_n5_0448': { meaning: 'silakan, tolong', expr: 'どうぞ' },
  'vocab_n5_0453': { meaning: 'hari ke-10, sepuluh hari', expr: '十日' },
  'vocab_n5_0454': { meaning: 'penghitung jam', expr: '～時' },
  'vocab_n5_0483': { meaning: 'kenapa', expr: 'なぜ' },
  'vocab_n5_0489': { meaning: 'hari ke-7, tujuh hari', expr: '七日' },
  'vocab_n5_0495': { meaning: 'apa jenis', expr: '何～' },
  'vocab_n5_0500': { meaning: 'hari ke-, penghitung hari', expr: '～日' },
  'vocab_n5_0524': { meaning: 'memakai (bawahan/celana)', expr: 'はく' },
  'vocab_n5_0530': { meaning: 'kali pertama', expr: '初めて' },
  'vocab_n5_0537': { meaning: 'hari ke-20, dua puluh hari', expr: '二十日' },

  // や行 (continued)
  'vocab_n5_0585': { meaning: 'hari ke-2, dua hari', expr: '二日' },
  'vocab_n5_0622': { meaning: 'depan, sebelum', expr: '～前' },
  'vocab_n5_0642': { meaning: 'hari ke-3, tiga hari', expr: '三日' },
  'vocab_n5_0645': { meaning: 'semua kalian, semuanya', expr: '皆さん' },
  'vocab_n5_0650': { meaning: 'hari ke-6, enam hari', expr: '六日' },
  'vocab_n5_0660': { meaning: 'halo (di telepon)', expr: 'もしもし' },
  'vocab_n5_0682': { meaning: 'pelan-pelan', expr: 'ゆっくりと' },
  'vocab_n5_0683': { meaning: 'hari ke-8, delapan hari', expr: '八日' },
};

// Apply fixes
let fixed = 0;
rows.forEach(row => {
  const id = row.id;
  if (fixes[id]) {
    row[h[meaningIdIdx]] = fixes[id].meaning;
    fixed++;
  }
});

console.log('Fixed:', fixed, 'entries');

// Save
const output = Papa.unparse(rows, { columns: h });
fs.writeFileSync('data/seed/jlpt_n5_vocabulary_seed_with_examples.csv', output, 'utf-8');
console.log('CSV saved!');
