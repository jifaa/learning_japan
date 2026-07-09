const fs = require('fs');
const path = require('path');

const fixes = {
  "一日": "satu hari",
  "お母さん": "ibu (formal)",
  "お父さん": "ayah (formal)",
  "風邪": "masuk angin, flu",
  "家庭": "rumah tangga, keluarga",
  "クラス": "kelas",
  "コップ": "gelas",
  "～ころ; ～ごろ": "sekitar, kira-kira (waktu)",
  "さあ": "ayo, mari, nah",
  "～歳": "~ tahun (umur)",
  "先": "masa depan, ujung, sebelumnya",
  "咲く": "mekar",
  "作文": "karangan, esai",
  "～冊": "penghitung untuk buku (jilid)",
  "散歩": "jalan-jalan",
  "～時": "pukul ~ (jam)",
  "仕事": "pekerjaan",
  "下": "bawah",
  "死ぬ": "mati, meninggal",
  "閉める": "menutup",
  "締める": "mengikat, mengencangkan",
  "～すぎ": "melewati, terlalu ~",
  "すぐに": "segera",
  "背": "tinggi badan",
  "そば": "samping, dekat, mi soba",
  "～台": "penghitung untuk kendaraan, mesin",
  "大学": "universitas",
  "沢山": "banyak",
  "茶碗": "mangkuk nasi",
  "丁度": "tepat, pas",
  "ちょっと": "sedikit, sebentar",
  "つまらない": "membosankan, tidak penting",
  "時計": "jam",
  "年": "tahun, umur",
  "どっち": "yang mana (dari dua)",
  "飛ぶ": "terbang, melompat",
  "止まる": "berhenti",
  "鶏肉": "daging ayam",
  "取る": "mengambil, mendapatkan",
  "どれ": "yang mana",
  "無くす": "menghilangkan",
  "七つ": "tujuh buah",
  "なる": "menjadi",
  "～杯": "penghitung untuk cangkir/gelas",
  "入る": "masuk, berisi",
  "初め; 始め": "permulaan, awal",
  "二十歳": "umur 20 tahun",
  "貼る": "menempelkan",
  "晩御飯": "makan malam",
  "～匹": "penghitung untuk hewan kecil (ekor)",
  "一つ": "satu buah",
  "ページ": "halaman (buku)",
  "ポスト": "kotak pos",
  "～本": "penghitung untuk benda panjang silindris",
  "毎朝": "setiap pagi",
  "毎月": "setiap bulan",
  "毎年": "setiap tahun",
  "毎晩": "setiap malam",
  "まっすぐ": "lurus",
  "六つ": "enam buah",
  "問題": "masalah, pertanyaan",
  "休み": "libur, istirahat",
  "夕飯": "makan malam",
  "よく": "sering, dengan baik",
  "横": "samping, lebar",
  "呼ぶ": "memanggil",
  "留学生": "pelajar asing"
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
console.log('Successfully updated CSV with the final remaining Indonesian meanings.');
