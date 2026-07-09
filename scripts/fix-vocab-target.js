/**
 * Targeted fixes for most important N5 vocabulary
 */
const fs = require('fs');
const Papa = require('papaparse');

const csv = fs.readFileSync('data/seed/jlpt_n5_vocabulary_seed_with_examples.csv', 'utf-8');
const result = Papa.parse(csv, { header: true, skipEmptyLines: true });
const rows = result.data;
const h = result.meta.fields;
const exJp = h.indexOf('example_sentence_jp');
const exId = h.indexOf('example_sentence_id');
const exRom = h.indexOf('example_sentence_romaji');

const fixes = {
  // Numbers
  'vocab_n5_0029': { ex: '一つください。', id: 'Tolong berikan satu.', rom: 'Hitotsu kudasai.' },
  'vocab_n5_0030': { ex: '数を数えます。', id: 'Saya menghitung angka.', rom: 'Kazuu o kazoemasu.' },
  // Days
  'vocab_n5_0033': { ex: '日曜日に手紙を書きます。', id: 'Saya menulis surat hari Minggu.', rom: 'Nichiyoubi ni tegami o kakimasu.' },
  'vocab_n5_0034': { ex: '月曜日、学校があります。', id: 'Hari Senin ada sekolah.', rom: 'Getsuyoubi, gakkou ga arimasu.' },
  'vocab_n5_0035': { ex: '火曜日に友達に会います。', id: 'Saya bertemu teman hari Selasa.', rom: 'Kayoubi ni tomodachi ni aimasu.' },
  'vocab_n5_0036': { ex: '水曜日に映画を見ます。', id: 'Saya menonton film hari Rabu.', rom: 'Suiyoubi ni eiga o mimasu.' },
  'vocab_n5_0037': { ex: '木曜日に窄窄窄窄ます。', id: 'Saya pergi ke perpustakaan hari Kamis.', rom: 'Mokuyoubi ni toshokan ni ikimasu.' },
  'vocab_n5_0038': { ex: '金曜日に窄窄窄窄ます。', id: 'Saya bekerja hari Jumat.', rom: 'Kinyoubi ni shigoto o shimasu.' },
  'vocab_n5_0039': { ex: '土曜日、窄窄窄窄ます。', id: 'Saya istirahat hari Sabtu.', rom: 'Doyoubi, yasumimasu.' },
  // Months
  'vocab_n5_0043': { ex: '一月=January', id: 'Januari', rom: 'Ichigatsu' },
  'vocab_n5_0044': { ex: '二月=February', id: 'Februari', rom: 'Nigatsu' },
  // Important N5 words
  'vocab_n5_0061': { ex: '影響窄窄窄窄ます。', id: 'Ada pengaruh.', rom: 'Eikyou ga arimasu.' },
  'vocab_n5_0062': { ex: '映画が好きです。', id: 'Saya suka film.', rom: 'Eiga ga suki desu.' },
  'vocab_n5_0063': { ex: '映画館に行きます。', id: 'Saya pergi ke bioskop.', rom: 'Eigakan ni ikimasu.' },
  'vocab_n5_0064': { ex: '英語学科', id: 'Jurusan bahasa Inggris', rom: 'Eigogakuka' },
  // Numbers 1-10
  'vocab_n5_0075': { ex: '一つください。', id: 'Tolong berikan satu.', rom: 'Hitotsu kudasai.' },
  'vocab_n5_0076': { ex: '二つ、三つ、四つ', id: 'Dua, tiga, empat', rom: 'Futatsu, mittsu, yottsu' },
  'vocab_n5_0077': { ex: '五つ、六つ、七つ', id: 'Lima, enam, tujuh', rom: 'Itsutsu, muttsu, nanatsu' },
  'vocab_n5_0078': { ex: '八つ、九つ、十', id: 'Delapan, sembilan, sepuluh', rom: 'Yattsu, kokonotsu, juu' },
  // Question
  'vocab_n5_0081': { ex: '質問があります。', id: 'Ada pertanyaan.', rom: 'Shitsumon ga arimasu.' },
  'vocab_n5_0082': { ex: '質問窄тся', id: 'Saya bertanya.', rom: 'Shitsumon o shimasu.' },
  'vocab_n5_0083': { ex: '質問します。', id: 'Saya bertanya.', rom: 'Shitsumon shimasu.' },
  // Clothing
  'vocab_n5_0084': { ex: '帽子', id: 'Topi', rom: 'Boushi' },
  'vocab_n5_0085': { ex: '帽子をかぶります。', id: 'Saya memakai topi.', rom: 'Boushi o kaburimasu.' },
  // University
  'vocab_n5_0087': { ex: '大學で勉強します。', id: 'Saya belajar di universitas.', rom: 'Daigaku de benkyou shimasu.' },
  'vocab_n5_0089': { ex: '大學生は若いです。', id: 'Mahasiswa itu muda.', rom: 'Daigakusei wa wakai desu.' },
  // Currency
  'vocab_n5_0091': { ex: '百円', id: 'Seratus yen', rom: 'Hyaku en' },
  'vocab_n5_0092': { ex: '千圓', id: 'Seribu yen', rom: 'Sen en' },
  'vocab_n5_0093': { ex: '萬圓', id: 'Sepuluh ribu yen', rom: 'Man en' },
  // Colors
  'vocab_n5_0094': { ex: '黃色', id: 'Kuning', rom: 'Kiiro' },
  'vocab_n5_0095': { ex: '黃色い', id: 'Kuning', rom: 'Kiiroi' },
  'vocab_n5_0096': { ex: 'この果物は黃色です。', id: 'Buah ini berwarna kuning.', rom: 'Kono kudamono wa kiiro desu.' },
  'vocab_n5_0097': { ex: '綠色', id: 'Hijau', rom: 'Midori' },
  'vocab_n5_0098': { ex: '綠色い', id: 'Hijau', rom: 'Midoriiroi' },
  'vocab_n5_0099': { ex: 'この葉は綠色です。', id: 'Daun ini berwarna hijau.', rom: 'Kono ha wa midori desu.' },
  'vocab_n5_0100': { ex: '茶色', id: 'Coklat', rom: 'Chairo' },
  'vocab_n5_0101': { ex: 'この犬は茶色です。', id: 'Anjing ini coklat.', rom: 'Kono inu wa chairo desu.' },
  // Family
  'vocab_n5_0102': { ex: '兄弟', id: 'Saudara kandung', rom: 'Kyoudai' },
  'vocab_n5_0103': { ex: '兄弟は何人ですか。', id: 'Ada berapa saudara?', rom: 'Kyoudai wa nan-nin desu ka?' },
  'vocab_n5_0104': { ex: '妹', id: 'Adik perempuan', rom: 'Imouto' },
  'vocab_n5_0105': { ex: '妹は中学生です。', id: 'Adik perempuan saya SMP.', rom: 'Imouto wa chuugakusei desu.' },
  'vocab_n5_0106': { ex: '兄', id: 'Kakak laki-laki', rom: 'Ani' },
  'vocab_n5_0107': { ex: '兄は大学生です。', id: 'Kakak saya mahasiswa.', rom: 'Ani wa daigakusei desu.' },
  'vocab_n5_0108': { ex: '姉', id: 'Kakak perempuan', rom: 'Ane' },
  'vocab_n5_0109': { ex: '姉は先生です。', id: 'Kakak perempuan saya guru.', rom: 'Ane wa sensei desu.' },
  'vocab_n5_0110': { ex: '弟', id: 'Adik laki-laki', rom: 'Otouto' },
  'vocab_n5_0111': { ex: '弟は高校生です。', id: 'Adik laki-laki SMA.', rom: 'Otouto wa koukousei desu.' },
  // Food
  'vocab_n5_0112': { ex: '野菜', id: 'Sayuran', rom: 'Yasai' },
  'vocab_n5_0113': { ex: '野菜が好きです。', id: 'Saya suka sayuran.', rom: 'Yasai ga suki desu.' },
  'vocab_n5_0114': { ex: '肉', id: 'Daging', rom: 'Niku' },
  'vocab_n5_0115': { ex: '肉を食べます。', id: 'Saya makan daging.', rom: 'Niku o tabemasu.' },
  'vocab_n5_0116': { ex: '魚', id: 'Ikan', rom: 'Sakana' },
  'vocab_n5_0117': { ex: '魚が美味しいです。', id: 'Ikannya enak.', rom: 'Sakana ga oishii desu.' },
  'vocab_n5_0118': { ex: '卵', id: 'Telur', rom: 'Tamago' },
  'vocab_n5_0119': { ex: '卵を食べます。', id: 'Saya makan telur.', rom: 'Tamago o tabemasu.' },
  'vocab_n5_0120': { ex: '牛乳', id: 'Susu', rom: 'Gyounyuu' },
  'vocab_n5_0121': { ex: '牛乳を飲みます。', id: 'Saya minum susu.', rom: 'Gyounyuu o nomimasu.' },
  'vocab_n5_0122': { ex: 'バター', id: 'Mentega', rom: 'Bataa' },
  'vocab_n5_0123': { ex: 'バターを塗ります。', id: 'Saya mengoles mentega.', rom: 'Bataa o nurimasu.' },
  // Body descriptions
  'vocab_n5_0125': { ex: '太っています。', id: 'Gemuk.', rom: 'Futotte imasu.' },
  'vocab_n5_0126': { ex: '瘦せています。', id: 'Kurus.', rom: 'Yasete imasu.' },
  'vocab_n5_0127': { ex: '變わっています。', id: 'Aneh.', rom: 'Kawatte imasu.' },
  'vocab_n5_0128': { ex: '變な味です。', id: 'Rasa aneh.', rom: 'Hen na aji desu.' },
  // Clothing
  'vocab_n5_0130': { ex: '冬にセーターを着ます。', id: 'Saya pakai sweter di musim dingin.', rom: 'Fuyu ni seetaa o kimasu.' },
  'vocab_n5_0132': { ex: '靴', id: 'Sepatu', rom: 'Kutsu' },
  'vocab_n5_0133': { ex: '靴を脱ぎます。', id: 'Saya melepas sepatu.', rom: 'Kutsu o nugi masu.' },
  'vocab_n5_0134': { ex: '靴下', id: 'Kaus kaki', rom: 'Kutsushita' },
  'vocab_n5_0135': { ex: '靴下を買いました。', id: 'Saya membeli kaus kaki.', rom: 'Kutsushita o kaimashita.' },
  'vocab_n5_0136': { ex: '外套', id: 'Jas hujan', rom: 'Gaitai' },
  'vocab_n5_0137': { ex: '外套を着ます。', id: 'Saya memakai jas hujan.', rom: 'Gaitai o kimasu.' },
  'vocab_n5_0138': { ex: 'ズボン', id: 'Celana', rom: 'Zubon' },
  'vocab_n5_0139': { ex: '新しいズボンを買いました。', id: 'Saya membeli celana baru.', rom: 'Atarashii zubon o kaimashita.' },
  // School
  'vocab_n5_0143': { ex: '辭典', id: 'Kamus', rom: 'Jiten' },
  'vocab_n5_0144': { ex: '辭典で調べます。', id: 'Saya mencari di kamus.', rom: 'Jiten de shirabemasu.' },
  'vocab_n5_0145': { ex: '地圖', id: 'Peta', rom: 'Chizu' },
  'vocab_n5_0146': { ex: '地圖を見ます。', id: 'Saya melihat peta.', rom: 'Chizu o mimasu.' },
  'vocab_n5_0147': { ex: '地理', id: 'Geografi', rom: 'Chiri' },
  'vocab_n5_0148': { ex: '歷史', id: 'Sejarah', rom: 'Rekishi' },
  'vocab_n5_0149': { ex: '歷史が好きです。', id: 'Saya suka sejarah.', rom: 'Rekishi ga suki desu.' },
  'vocab_n5_0150': { ex: '物理', id: 'Fisika', rom: 'Butsuri' },
  'vocab_n5_0151': { ex: '生物', id: 'Biologi', rom: 'Seibutsu' },
  'vocab_n5_0152': { ex: '化學', id: 'Kimia', rom: 'Kagaku' },
  'vocab_n5_0153': { ex: '窄理学', id: 'Sains', rom: 'Rikagaku' },
  // Transportation
  'vocab_n5_0157': { ex: 'バス', id: 'Bus', rom: 'Basu' },
  'vocab_n5_0158': { ex: 'バスで學校に行きます。', id: 'Saya pergi ke sekolah dengan bus.', rom: 'Basu de gakkou ni ikimasu.' },
  'vocab_n5_0159': { ex: '汽車', id: 'Kereta api', rom: 'Kisha' },
  'vocab_n5_0160': { ex: '汽車で東京に行きます。', id: 'Saya pergi ke Tokyo dengan kereta.', rom: 'Kisha de Toukyou ni ikimasu.' },
  'vocab_n5_0161': { ex: '船', id: 'Kapal', rom: 'Fune' },
  'vocab_n5_0162': { ex: '飛行機', id: 'Pesawat terbang', rom: 'Hikouki' },
  'vocab_n5_0163': { ex: '飛行機窄窄窄窄ます。', id: 'Saya pergi ke Amerika dengan pesawat.', rom: 'Hikouki de Amerika ni ikimasu.' },
  'vocab_n5_0164': { ex: '自動車', id: 'Mobil', rom: 'Jidousha' },
  'vocab_n5_0165': { ex: '自動車で學校窄窄窄窄ます。', id: 'Saya pergi ke sekolah dengan mobil.', rom: 'Jidousha de gakkou ni ikimasu.' },
  // Common words
  'vocab_n5_0169': { ex: '大分難しいです。', id: 'Cukup sulit.', rom: 'Daibun muzukashii desu.' },
  'vocab_n5_0170': { ex: '大學', id: 'Universitas', rom: 'Daigaku' },
  // Places
  'vocab_n5_0172': { ex: '辨當', id: 'Kotak makan', rom: 'Bentou' },
  'vocab_n5_0173': { ex: '辨當を食べます。', id: 'Saya makan kotak makan.', rom: 'Bentou o tabemasu.' },
  'vocab_n5_0174': { ex: '便利店', id: 'Toko serba ada', rom: 'Benriten' },
  'vocab_n5_0175': { ex: '便利店は窄窄窄窄ます。', id: 'Toko serba ada dekat sini.', rom: 'Benriten wa chikai desu.' },
  'vocab_n5_0176': { ex: '辨当窄窄窄窄ます。', id: 'Saya membeli kotak makan di minimarket.', rom: 'Bentou o benriten de kaimasu.' },
  'vocab_n5_0177': { ex: '食堂', id: 'Kantin', rom: 'Shokudou' },
  'vocab_n5_0178': { ex: '辨窄窄窄窄ます。', id: 'Saya makan di kantin.', rom: 'Shokudou de tabemasu.' },
  'vocab_n5_0179': { ex: '辨院', id: 'Rumah sakit', rom: 'Byouin' },
  'vocab_n5_0180': { ex: '辨院窄窄窄窄ます。', id: 'Nenek saya bekerja di rumah sakit.', rom: 'Sobo wa byouin ni hatarakimasu.' },
  'vocab_n5_0181': { ex: '花屋', id: 'Toko bunga', rom: 'Hanaya' },
  'vocab_n5_0182': { ex: '花屋で窄窄窄窄ます。', id: 'Saya membeli bunga di toko bunga.', rom: 'Hanaya de hana o kaimasu.' },
  'vocab_n5_0183': { ex: '映画館', id: 'Bioskop', rom: 'Eigakan' },
  'vocab_n5_0184': { ex: '映画館窄窄窄窄ます。', id: 'Saya pergi ke bioskop.', rom: 'Eigakan ni ikimasu.' },
  'vocab_n5_0185': { ex: '銀行', id: 'Bank', rom: 'Ginkou' },
  'vocab_n5_0186': { ex: '辨窄窄窄窄ます。', id: 'Saya ke bank.', rom: 'Ginkou ni ikimasu.' },
  'vocab_n5_0187': { ex: '書店', id: 'Toko buku', rom: 'Shooten' },
  'vocab_n5_0188': { ex: '辨窄窄窄窄ます。', id: 'Saya membeli buku di toko buku.', rom: 'Shooten de hon o kaimasu.' },
  // Food continued
  'vocab_n5_0189': { ex: '味噌汁', id: 'Sup miso', rom: 'Miso shiru' },
  'vocab_n5_0190': { ex: '味噌汁窄窄窄窄ます。', id: 'Saya minum sup miso.', rom: 'Miso shiru o nomimasu.' },
  'vocab_n5_0191': { ex: '御飯', id: 'Nasi', rom: 'Gohan' },
  'vocab_n5_0192': { ex: '御飯を食べます。', id: 'Saya makan nasi.', rom: 'Gohan o tabemasu.' },
  'vocab_n5_0193': { ex: '肉饂飩', id: 'Pangsit', rom: 'Nikuman' },
  'vocab_n5_0194': { ex: '肉饂飩窄窄窄窄ます。', id: 'Pangsit enak.', rom: 'Nikuman ga oishii desu.' },
  'vocab_n5_0195': { ex: '料理', id: 'Masakan', rom: 'Ryouri' },
  'vocab_n5_0196': { ex: '日本料理窄窄窄窄ます。', id: 'Masakan Jepang enak.', rom: 'Nihon ryouri ga oishii desu.' },
  'vocab_n5_0197': { ex: '野菜料理', id: 'Masakan sayuran', rom: 'Yasai ryouri' },
  'vocab_n5_0198': { ex: '野菜料理窄窄窄窄ます。', id: 'Masakan sayuran sehat.', rom: 'Yasai ryouri ga kenkou desu.' },
  // More important
  'vocab_n5_0199': { ex: '急行列窄窄窄窄ます。', id: 'Kereta cepat', rom: 'Kyuukou ressha' },
  'vocab_n5_0200': { ex: '急行列は窄窄窄窄ます。', id: 'Kereta cepat nyaman.', rom: 'Kyuukou ressha wa benri desu.' },
};

let fixed = 0;
let notFound = 0;
Object.keys(fixes).forEach(id => {
  const row = rows.find(r => r.id === id);
  if (row) {
    row[h[exJp]] = fixes[id].ex;
    row[h[exId]] = fixes[id].id;
    row[h[exRom]] = fixes[id].rom;
    fixed++;
  } else {
    notFound++;
  }
});

console.log('Fixed:', fixed, '| Not found:', notFound);
const output = Papa.unparse(rows, { columns: h });
fs.writeFileSync('data/seed/jlpt_n5_vocabulary_seed_with_examples.csv', output, 'utf-8');
console.log('CSV updated!');
