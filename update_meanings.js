const fs = require('fs');
const path = require('path');

const dict = {
  "Ah!, Oh!": "Ah!, Oh!",
  "over there": "di sana",
  "(hard) candy": "permen",
  "together": "bersama",
  "disagreeable, detestable, unpleasant": "tidak menyenangkan, menyebalkan",
  "various": "bermacam-macam",
  "coat, jacket": "jaket, mantel",
  "movie, film": "film",
  "movie theater, cinema": "bioskop",
  "yes": "ya",
  "honorable ~ (honorific)": "~ yang terhormat (sapaan sopan)",
  "confections, sweets, snack": "kue, permen, camilan",
  "money": "uang",
  "s) wife (hon.)": "istri (orang lain)",
  "plate, dish": "piring",
  "adult": "orang dewasa",
  "stomach": "perut",
  "same, identical": "sama",
  "aunt": "bibi, tante",
  "grandmother, female senior-citizen": "nenek",
  "(number of) months": "~ bulan (jumlah)",
  "katakana": "katakana",
  "feel": "merasa (untuk orang ketiga)",
  "calendar": "kalender",
  "~ side": "sebelah ~, sisi ~",
  "guitar": "gitar",
  "bank": "bank",
  "approximate (quantity)": "kira-kira (jumlah)",
  "gram": "gram",
  "word, language": "bahasa ~",
  "wallet": "dompet",
  "sugar": "gula",
  "Mr. ~, Ms. ~": "Sdr/i. ~",
  "salt": "garam",
  "~ hours": "~ jam",
  "quiet, calm": "tenang, sepi",
  "well, well then": "kalau begitu, nah",
  "shirt": "kemeja",
  "shower": "shower, pancuran",
  "during, while": "selama, sedang",
  "~ weeks": "~ minggu",
  "soy sauce": "kecap asin",
  "skirt": "rok",
  "heater (lit: stove)": "pemanas ruangan",
  "spoon": "sendok",
  "sport(s)": "olahraga",
  "trousers": "celana panjang",
  "sweater": "sweter",
  "soap": "sabun",
  "s suit": "jas",
  "zero": "nol",
  "that": "itu",
  "embassy": "kedutaan besar",
  "important": "penting",
  "kitchen": "dapur",
  "plural suffix": "bentuk jamak",
  "length, height": "panjang, tinggi (vertikal)",
  "building": "bangunan, gedung",
  "enjoyable, fun": "menyenangkan",
  "tobacco, cigarettes": "rokok",
  "perhaps, probably, maybe": "mungkin",
  "egg": "telur",
  "someone": "seseorang",
  "during, while ~ing": "selama, sedang",
  "tape": "pita kaset",
  "tape recorder": "perekam pita kaset",
  "test": "tes, ujian",
  "then, well, so": "kalau begitu",
  "animal": "hewan, binatang",
  "place": "tempat",
  "library": "perpustakaan",
  "very (much), greatly, exceedingly": "sangat",
  "who": "siapa (sopan)",
  "which": "yang mana",
  "friend": "teman",
  "Saturday": "hari Sabtu",
  "chicken (lit., bird)": "burung",
  "knife": "pisau",
  "summer vacation": "liburan musim panas",
  "et cetera": "dan lain-lain",
  "lukewarm": "suam-suam kuku, agak hangat",
  "tie, necktie": "dasi",
  "~ years": "tahun ~",
  "tooth": "gigi",
  "ashtray": "asbak",
  "postcard": "kartu pos",
  "box": "kotak",
  "bridge": "jembatan",
  "chopsticks": "sumpit",
  "(something) begins": "dimulai",
  "butter": "mentega",
  "flower": "bunga",
  "nose": "hidung",
  "talk (chat), story": "cerita, pembicaraan",
  "spring": "musim semi",
  "handkerchief": "saputangan",
  "half": "setengah",
  "hiragana": "hiragana",
  "film (roll of)": "film, klise",
  "fork": "garpu",
  "~ minutes": "~ menit",
  "bed": "tempat tidur",
  "pet": "hewan peliharaan",
  "area, vicinity": "sekitar, daerah",
  "pen": "pena",
  "ball-point pen": "pulpen",
  "hotel": "hotel",
  "bookshelf": "rak buku",
  "real, true": "benar, nyata",
  "every week": "setiap minggu",
  "match": "korek api",
  "round, circular": "bulat, bundar",
  "all, everyone, everybody": "semua, semua orang",
  "beyond, over there": "sebelah sana, seberang",
  "village": "desa",
  "meter": "meter",
  "Thursday": "hari Kamis",
  "more": "lebih",
  "thing (concrete object)": "barang, benda",
  "gate": "gerbang",
  "greengrocer": "toko sayur",
  "Western-style clothes": "pakaian gaya barat",
  "radio": "radio",
  "radio cassette player": "radio kaset",
  "splendid, fine": "megah, hebat",
  "parents (lit., both parents)": "kedua orang tua",
  "travel, trip": "perjalanan, wisata",
  "zero, nought": "nol",
  "refrigerator": "kulkas",
  "(to) practice": "latihan",
  "corridor": "lorong, koridor"
};

const csvPath = path.join(__dirname, 'data', 'seed', 'jlpt_n5_vocabulary_seed_with_examples.csv');
const data = fs.readFileSync(csvPath, 'utf8');

const lines = data.split('\n');
const headers = lines[0].split(',');
const meaningIdIdx = headers.indexOf('meaning_id');
const meaningEnIdx = headers.indexOf('meaning_en');

let updatedLines = [lines[0]];

for (let i = 1; i < lines.length; i++) {
  if (!lines[i].trim()) {
    updatedLines.push(lines[i]);
    continue;
  }
  
  // Custom CSV split considering quotes
  const parts = lines[i].match(/(?!\s*$)\s*(?:'([^'\\]*(?:\\[\s\S][^'\\]*)*)'|"([^"\\]*(?:\\[\s\S][^"\\]*)*)"|([^,'"\s\\]*(?:\s+[^,'"\s\\]+)*))\s*(?:,|$)/g);
  if (!parts) {
    updatedLines.push(lines[i]);
    continue;
  }
  
  const cleanedParts = parts.map(p => p.replace(/,$/, '').trim().replace(/^"|"$/g, ''));
  if (cleanedParts.length > meaningEnIdx) {
    let mId = cleanedParts[meaningIdIdx];
    let mEn = cleanedParts[meaningEnIdx];
    
    if ((mId === mEn || !mId) && dict[mEn]) {
      // Reconstruct the line correctly
      // We must replace the actual CSV token, so let's find the original token in parts array
      const newToken = dict[mEn].includes(',') ? `"${dict[mEn]}"` : dict[mEn];
      
      // Note: parts includes the trailing comma, we need to preserve it
      const originalTokenWithComma = parts[meaningIdIdx];
      const hasComma = originalTokenWithComma.endsWith(',');
      parts[meaningIdIdx] = newToken + (hasComma ? ',' : '');
      
      updatedLines.push(parts.join(''));
      continue;
    }
  }
  updatedLines.push(lines[i]);
}

fs.writeFileSync(csvPath, updatedLines.join('\n'));
console.log('Successfully updated CSV with Indonesian meanings.');
