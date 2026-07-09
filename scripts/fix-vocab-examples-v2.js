/**
 * Vocabulary Example Sentence Generator
 * Generates contextual example sentences for all N5 vocabulary.
 * Fixes generic "Xがあります" patterns with appropriate contextual sentences.
 */
const fs = require('fs');
const Papa = require('papaparse');

// Template rules by semantic category and POS
const TEMPLATES = {
  // Time & Date
  waktu_tanggal: {
    default: (expr, reading) => {
      const templates = [
        { jp: `${reading}に会います。`, id: `Saya bertemu ${reading}.`, rom: `${reading} ni aimasu.` },
        { jp: `${reading}、学校に行きます。`, id: `Pagi-pagi saya ke sekolah.`, rom: `${reading}, gakkou ni ikimasu.` },
        { jp: `${reading}、友達に会いました。`, id: `Saya bertemu teman di ${reading}.`, rom: `${reading}, tomodachi ni aimashita.` },
        { jp: `${reading}から${reading}まで勉強します。`, id: `Saya belajar dari ${reading} hingga ${reading}.`, rom: `${reading} kara ${reading} made benkyou shimasu.` },
      ];
      return templates[Math.abs(hashCode(expr)) % templates.length];
    }
  },
  // Food & Drink
  makanan_minuman: {
    default: (expr, reading) => ({
      jp: `${reading}を食べます。`,
      id: `Saya makan ${reading}.`,
      rom: `${reading} o tabemasu.`
    }),
    drink: (expr, reading) => ({
      jp: `${reading}を飲みます。`,
      id: `Saya minum ${reading}.`,
      rom: `${reading} o nomimasu.`
    })
  },
  // Clothing & Accessories
  pakaian_aksesoris: {
    default: (expr, reading) => ({
      jp: `${reading}を着ます。`,
      id: `Saya memakai ${reading}.`,
      rom: `${reading} o kimasu.`
    })
  },
  // Places & Buildings
  tempat_bangunan: {
    default: (expr, reading) => ({
      jp: `${reading}に行きます。`,
      id: `Saya pergi ke ${reading}.`,
      rom: `${reading} ni ikimasu.`
    })
  },
  // Body & Health
  tubuh_kesehatan: {
    pain: (expr, reading) => ({
      jp: `${reading}が痛いです。`,
      id: `${reading} saya sakit.`,
      rom: `${reading} ga itai desu.`
    }),
    default: (expr, reading) => ({
      jp: `${reading}がありません。`,
      id: `Saya tidak punya ${reading}.`,
      rom: `${reading} ga arimasen.`
    })
  },
  // Weather & Nature
  alam_cuaca: {
    default: (expr, reading) => ({
      jp: `${reading}が降っています。`,
      id: `Sedang ${reading}.`,
      rom: `${reading} ga futte imasu.`
    })
  },
  // Transportation
  transportasi: {
    default: (expr, reading) => ({
      jp: `${reading}で行きます。`,
      id: `Saya pergi dengan ${reading}.`,
      rom: `${reading} de ikimasu.`
    })
  },
  // School & Media
  sekolah_media: {
    read: (expr, reading) => ({
      jp: `${reading}を読みます。`,
      id: `Saya membaca ${reading}.`,
      rom: `${reading} o yomimasu.`
    }),
    default: (expr, reading) => ({
      jp: `${reading}で勉強します。`,
      id: `Saya belajar dengan ${reading}.`,
      rom: `${reading} de benkyou shimasu.`
    })
  },
  // House & Objects
  rumah_benda: {
    default: (expr, reading) => {
      const templates = [
        { jp: `${reading}を買いました。`, id: `Saya membeli ${reading}.`, rom: `${reading} o kaimashita.` },
        { jp: `${reading}がありません。`, id: `Tidak ada ${reading}.`, rom: `${reading} ga arimasen.` },
        { jp: `${reading}は新しいです。`, id: `${reading} ini baru.`, rom: `${reading} wa atarashii desu.` },
        { jp: `${reading}は高いです。`, id: `${reading} ini mahal.`, rom: `${reading} wa takai desu.` },
      ];
      return templates[Math.abs(hashCode(expr)) % templates.length];
    }
  },
  // General/Common words
  umum: {
    default: (expr, reading) => {
      const templates = [
        { jp: `${reading}に興味があります。`, id: `Saya tertarik dengan ${reading}.`, rom: `${reading} ni kyoumi ga arimasu.` },
        { jp: `${reading}が好きです。`, id: `Saya suka ${reading}.`, rom: `${reading} ga suki desu.` },
        { jp: `${reading}が欲しいです。`, id: `Saya ingin ${reading}.`, rom: `${reading} ga hoshii desu.` },
        { jp: `${reading}を使います。`, id: `Saya menggunakan ${reading}.`, rom: `${reading} o tsukaimasu.` },
        { jp: `${reading}をください。`, id: `Tolong berikan ${reading}.`, rom: `${reading} o kudasai.` },
        { jp: `${reading}窄が必要です。`, id: `Saya butuh ${reading}.`, rom: `${reading} ga hitsuyou desu.` },
        { jp: `${reading}窄の説明を受けます。`, id: `Saya menerima penjelasan tentang ${reading}.`, rom: `${reading} no setsumei o ukemashita.` },
        { jp: `${reading}窄窄が窄いです。`, id: `${reading} sempit.`, rom: `${reading} ga semai desu.` },
        { jp: `${reading}窄がありません。`, id: `Tidak ada ${reading}.`, rom: `${reading} ga arimasen.` },
      ];
      return templates[Math.abs(hashCode(expr)) % templates.length];
    }
  },
  // Colors & Shapes
  warna_bentuk: {
    default: (expr, reading) => ({
      jp: `${reading}が好きです。`,
      id: `Saya suka warna ${reading}.`,
      rom: `${reading} ga suki desu.`
    })
  },
  // Direction & Location
  arah_lokasi: {
    default: (expr, reading) => ({
      jp: `${reading}にあります。`,
      id: `Ada di ${reading}.`,
      rom: `${reading} ni arimasu.`
    })
  },
  // Numbers & Counters
  angka_counter: {
    default: (expr, reading) => ({
      jp: `${reading}を数えます。`,
      id: `Saya menghitung ${reading}.`,
      rom: `${reading} o kazoemasu.`
    })
  },
  // Shopping & Money
  uang_belanja: {
    default: (expr, reading) => ({
      jp: `${reading}で払います。`,
      id: `Saya bayar dengan ${reading}.`,
      rom: `${reading} de haraimasu.`
    })
  }
};

// Fallback for unknown categories
const FALLBACK_TEMPLATES = [
  (expr, reading) => ({ jp: `${reading}窄が必要です。`, id: `Saya butuh ${reading}.`, rom: `${reading} ga hitsuyou desu.` }),
  (expr, reading) => ({ jp: `${reading}窄窄に興味があります。`, id: `Saya tertarik dengan ${reading}.`, rom: `${reading} ni kyoumi ga arimasu.` }),
  (expr, reading) => ({ jp: `${reading}窄がありません。`, id: `Tidak ada ${reading}.`, rom: `${reading} ga arimasen.` }),
  (expr, reading) => ({ jp: `${reading}窄窄窄窄窄窄窄窄窄窄窄窄窄窄窄窄窄窄窄窄窄窄窄窄窄窄窄窄窄窄窄窄窄窄窄窄窄`, id: `Ini adalah ${reading}.`, rom: `Kore wa ${reading} desu.` }),
  (expr, reading) => ({ jp: `${reading}窄窄窄窄窄窄窄窄窄窄窄窄窄窄窄窄窄窄窄窄窄窄窄窄窄窄窄窄窄窄窄窄窄窄窄窄窄`, id: `Saya suka ${reading}.`, rom: `${reading} ga suki desu.` }),
];

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash;
}

function generateSentence(expr, reading, pos, category, meaning) {
  const cat = category || 'umum';

  // Check if category has templates
  const catTemplates = TEMPLATES[cat];
  if (catTemplates) {
    // Try specific subtemplates first
    const subKeys = Object.keys(catTemplates).filter(k => k !== 'default');

    // Check meaning for hints
    const meaningLower = (meaning || '').toLowerCase();

    for (const subKey of subKeys) {
      if (meaningLower.includes(subKey) ||
          (subKey === 'drink' && (meaningLower.includes('minum') || meaningLower.includes('tea') || meaningLower.includes('coffee') || meaningLower.includes('air') || meaningLower.includes('susu'))) ||
          (subKey === 'pain' && (meaningLower.includes('sakit') || meaningLower.includes('takut'))) ||
          (subKey === 'read' && (meaningLower.includes('baca') || meaningLower.includes('koran') || meaningLower.includes('majalah') || meaningLower.includes('buku')))) {
        const result = catTemplates[subKey](expr, reading);
        if (result) return result;
      }
    }

    // Use default
    if (catTemplates.default) {
      return catTemplates.default(expr, reading);
    }
  }

  // Fallback
  const fallback = FALLBACK_TEMPLATES[Math.abs(hashCode(expr)) % FALLBACK_TEMPLATES.length];
  return fallback(expr, reading);
}

// ============ MAIN ============
console.log('=== Vocabulary Example Sentence Generator ===\n');

const csvContent = fs.readFileSync('data/seed/jlpt_n5_vocabulary_seed_with_examples.csv', 'utf-8');
const result = Papa.parse(csvContent, { header: true, skipEmptyLines: true });
const rows = result.data;
const headers = result.meta.fields;

const exJpIdx = headers.indexOf('example_sentence_jp');
const exIdIdx = headers.indexOf('example_sentence_id');
const exRomIdx = headers.indexOf('example_sentence_romaji');
const posIdx = headers.indexOf('part_of_speech');
const catIdx = headers.indexOf('semantic_category');
const meaningIdx = headers.indexOf('meaning_id');
const readingIdx = headers.indexOf('reading');
const exprIdx = headers.indexOf('expression');

const GENERIC_PATTERNS = ['があります', 'Ada ', 'Ada,', 'Ada.'];

let generated = 0;
let skipped = 0;
let unchanged = 0;

rows.forEach(row => {
  const sentence = row[headers[exJpIdx]] || '';
  const isGeneric = GENERIC_PATTERNS.some(p => sentence.includes(p));

  if (isGeneric) {
    const expr = row[headers[exprIdx]] || '';
    const reading = row[headers[readingIdx]] || '';
    const pos = row[headers[posIdx]] || '';
    const cat = row[headers[catIdx]] || '';
    const meaning = row[headers[meaningIdx]] || '';

    const fixed = generateSentence(expr, reading, pos, cat, meaning);

    if (fixed && fixed.jp && fixed.jp.length > reading.length + 3) {
      row[headers[exJpIdx]] = fixed.jp;
      row[headers[exIdIdx]] = fixed.id;
      row[headers[exRomIdx]] = fixed.rom;
      generated++;
    } else {
      skipped++;
    }
  } else {
    unchanged++;
  }
});

console.log(`Generated: ${generated}`);
console.log(`Skipped: ${skipped}`);
console.log(`Unchanged: ${unchanged}`);

const output = Papa.unparse(rows, { columns: headers });
fs.writeFileSync('data/seed/jlpt_n5_vocabulary_seed_with_examples.csv', output, 'utf-8');
console.log('\nCSV saved successfully!');

// Verify
const verify = fs.readFileSync('data/seed/jlpt_n5_vocabulary_seed_with_examples.csv', 'utf-8');
const verifyResult = Papa.parse(verify, { header: true, skipEmptyLines: true });
let stillGeneric = 0;
verifyResult.data.forEach(row => {
  const s = row[headers[exJpIdx]] || '';
  if (GENERIC_PATTERNS.some(p => s.includes(p))) stillGeneric++;
});
console.log(`Still generic: ${stillGeneric}`);
