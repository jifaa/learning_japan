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
  'vocab_n5_0020': { ex: '頭が痛いです。', id: 'Kepala saya sakit.', rom: 'Atama ga itai desu.' },
  'vocab_n5_0037': { ex: '雨が降っています。', id: 'Sedang hujan.', rom: 'Ame ga futte imasu.' },
  'vocab_n5_0038': { ex: '子供が飴を食べました。', id: 'Anak itu memakan permen.', rom: 'Kodomo ga ame o tabemashita.' },
  'vocab_n5_0039': { ex: '野菜を洗います。', id: 'Saya mencuci sayuran.', rom: 'Yasai o araimasu.' },
  'vocab_n5_0060': { ex: '五日に會います。', id: 'Saya bertemu hari ke-lima.', rom: 'Itsuka ni aimasu.' },
  'vocab_n5_0061': { ex: '五日', id: 'Hari ke-lima', rom: 'Itsuka' },
  'vocab_n5_0082': { ex: '子供が生まれました。', id: 'Anak lahir.', rom: 'Kodomo ga umaremashita.' },
  'vocab_n5_0084': { ex: '車を売ります。', id: 'Saya menjual mobil.', rom: 'Kuruma o urimasu.' },
  'vocab_n5_0091': { ex: 'ええ、窄う。', id: 'Ya, benar begitu.', rom: 'Ee, sou.' },
  'vocab_n5_0092': { ex: '駅まで歩いて行きます。', id: 'Saya berjalan kaki ke stasiun.', rom: 'Eki made aruite ikimasu.' },
  'vocab_n5_0093': { ex: 'エレベーターに乗ります。', id: 'Saya naik elevator.', rom: 'Erebettaa ni norimasu.' },
  'vocab_n5_0094': { ex: '五百円', id: 'Lima ratus yen', rom: 'Go-hyaku en' },
  'vocab_n5_0097': { ex: '牛肉が美味しいです。', id: 'Daging sapi enak.', rom: 'Gyuuniku ga oishii desu.' },
  'vocab_n5_0100': { ex: '大きな犬がいます。', id: 'Ada anjing besar.', rom: 'Okina inu ga imasu.' },
  'vocab_n5_0102': { ex: 'お母さんは入院しました。', id: 'Ibu masuk rumah sakit.', rom: 'Okaasan wa nyuuin shimashita.' },
  'vocab_n5_0104': { ex: 'お金がありません。', id: 'Saya tidak punya uang.', rom: 'Okane ga arimasen.' },
  'vocab_n5_0106': { ex: 'ここに置きます。', id: 'Saya taruh di sini.', rom: 'Koko ni okimasu.' },
  'vocab_n5_0108': { ex: 'お酒を飲みます。', id: 'Saya minum alkohol.', rom: 'Osake o nomimasu.' },
  'vocab_n5_0110': { ex: '伯父は入院しました。', id: 'Paman masuk rumah sakit.', rom: 'Oji wa nyuuin shimashita.' },
  'vocab_n5_0112': { ex: '日本語を教えます。', id: 'Saya mengajar bahasa Jepang.', rom: 'Nihongo o oshiemasu.' },
  'vocab_n5_0114': { ex: '汽車が遅いです。', id: 'Kereta lambat.', rom: 'Kisha ga osoi desu.' },
  'vocab_n5_0116': { ex: 'お手洗いに行きます。', id: 'Saya ke toilet.', rom: 'Otearai ni ikimasu.' },
  'vocab_n5_0118': { ex: '弟は高校生です。', id: 'Adik laki-laki SMA.', rom: 'Otouto wa koukousei desu.' },
  'vocab_n5_0120': { ex: '男の子と女の子', id: 'Anak laki-laki dan perempuan', rom: 'Otoko no ko to onna no ko' },
  'vocab_n5_0129': { ex: 'おばあさんがいます。', id: 'Ada nenek.', rom: 'Obaasan ga imasu.' },
  'vocab_n5_0132': { ex: '日本語を覚えます。', id: 'Saya menghafal bahasa Jepang.', rom: 'Nihongo o oboemasu.' },
  'vocab_n5_0134': { ex: 'この荷物は重いです。', id: 'Barang ini berat.', rom: 'Kono nimotsu wa omoi desu.' },
  'vocab_n5_0136': { ex: '海で泳ぎます。', id: 'Saya berenang di laut.', rom: 'Umi de oyogimasu.' },
  'vocab_n5_0143': { ex: '三階', id: 'Lantai tiga', rom: 'San-gai' },
  'vocab_n5_0145': { ex: '外国人が話します。', id: 'Orang asing berbicara.', rom: 'Gaikokujin ga hanashimasu.' },
  'vocab_n5_0147': { ex: '階段を上ります。', id: 'Saya naik tangga.', rom: 'Kaidan o agarimasu.' },
  'vocab_n5_0148': { ex: '買い物好感です。', id: 'Saya suka belanja.', rom: 'Kaimono ga suki desu.' },
  'vocab_n5_0150': { ex: '本を返します。', id: 'Saya mengembalikan buku.', rom: 'Hon o kaeshimasu.' },
  'vocab_n5_0151': { ex: '家に帰ります。', id: 'Saya pulang ke rumah.', rom: 'Ie ni kaerimasu.' },
  'vocab_n5_0152': { ex: '顔', id: 'Wajah', rom: 'Kao' },
  'vocab_n5_0153': { ex: '時間がかかります。', id: 'Butuh waktu lama.', rom: 'Jikan ga kakaru.' },
  'vocab_n5_0157': { ex: '六个月', id: 'Enam bulan', rom: 'Rok-kagetsu' },
  'vocab_n5_0159': { ex: '絵をかきます。', id: 'Saya menggambar.', rom: 'E o kakimasu.' },
  'vocab_n5_0161': { ex: '友達に本を貸します。', id: 'Saya meminjamkan buku ke teman.', rom: 'Tomodachi ni hon o kasu shimasu.' },
  'vocab_n5_0163': { ex: '風邪を引きません。', id: 'Saya tidak masuk angin.', rom: 'Kaze o hipimasen.' },
  'vocab_n5_0165': { ex: '家族は三人です。', id: 'Keluarga saya tiga orang.', rom: 'Kazoku wa san-nin desu.' },
  'vocab_n5_0170': { ex: '家庭', id: 'Rumah tangga', rom: 'Katei' },
  'vocab_n5_0172': { ex: '鞄', id: 'Tas', rom: 'Kaban' },
  'vocab_n5_0175': { ex: '紙に書きます。', id: 'Saya menulis di kertas.', rom: 'Kami ni kakimasu.' },
  'vocab_n5_0176': { ex: '写真を撮ります。', id: 'Saya mengambil foto.', rom: 'Shashin o torimasu.' },
  'vocab_n5_0177': { ex: '火曜日に会います。', id: 'Saya bertemu hari Selasa.', rom: 'Kayoubi ni aimasu.' },
  'vocab_n5_0178': { ex: 'この料理は辛いです。', id: 'Masakan ini pedas.', rom: 'Kono ryouri wa karai desu.' },
  'vocab_n5_0179': { ex: '体', id: 'Tubuh', rom: 'Karada' },
  'vocab_n5_0180': { ex: '図書館から借ります。', id: 'Saya pinjam dari perpustakaan.', rom: 'Toshokan kara karimasu.' },
  'vocab_n5_0181': { ex: '恥ずかしがります。', id: 'Terasa malu.', rom: 'Hazukashigari masu.' },
  'vocab_n5_0182': { ex: 'この鞄は軽いです。', id: 'Tas ini ringan.', rom: 'Kono kaban wa karui desu.' },
  'vocab_n5_0184': { ex: 'カレンダーを見ます。', id: 'Saya melihat kalender.', rom: 'Karendaa o mimasu.' },
  'vocab_n5_0185': { ex: '川が流れます。', id: 'Sungai mengalir.', rom: 'Kawa ga nagaremasu.' },
  'vocab_n5_0186': { ex: '可愛い犬がいます。', id: 'Ada anjing yang imut.', rom: 'Kawaii inu ga imasu.' },
  'vocab_n5_0187': { ex: '漢字を勉強します。', id: 'Saya belajar kanji.', rom: 'Kanji o benkyou shimasu.' },
  'vocab_n5_0190': { ex: '黄色', id: 'Kuning', rom: 'Kiiro' },
  'vocab_n5_0191': { ex: 'このバナナは黄色です。', id: 'Pisang ini kuning.', rom: 'Kono banana wa kiiro desu.' },
  'vocab_n5_0194': { ex: '北', id: 'Utara', rom: 'Kita' },
  'vocab_n5_0195': { ex: 'ギターを弾きます。', id: 'Saya memetik gitar.', rom: 'Gitaa o hikimasu.' },
  'vocab_n5_0196': { ex: 'この部屋は汚くないです。', id: 'Kamar ini tidak kotor.', rom: 'Kono heya wa kitanakunai desu.' },
  'vocab_n5_0198': { ex: '切手をayeします。', id: 'Saya membeli perangko.', rom: 'Kitte o kaimasu.' },
  'vocab_n5_0199': { ex: '切符を買います。', id: 'Saya membeli tiket.', rom: 'Kippu o kaimasu.' },
  'vocab_n5_0217': { ex: '薬を飲みます。', id: 'Saya minum obat.', rom: 'Kusuri o nomimasu.' },
  'vocab_n5_0220': { ex: '口', id: 'Mulut', rom: 'Kuchi' },
  'vocab_n5_0249': { ex: '声が大きいです。', id: 'Suaranya keras.', rom: 'Koe ga ookii desu.' },
  'vocab_n5_0292': { ex: '塩', id: 'Garam', rom: 'Shio' },
  'vocab_n5_0296': { ex: '仕事をします。', id: 'Saya bekerja.', rom: 'Shigoto o shimasu.' },
  'vocab_n5_0299': { ex: '下', id: 'Bawah', rom: 'Shita' },
  'vocab_n5_0301': { ex: '質問があります。', id: 'Ada pertanyaan.', rom: 'Shitsumon ga arimasu.' },
  'vocab_n5_0313': { ex: 'シャワーを浴びます。', id: 'Saya mandi shower.', rom: 'Shawaa o abimasu.' },
  'vocab_n5_0338': { ex: 'ストーブは窄在旁边です。', id: 'Pemanas di samping.', rom: 'Sutoubu wa tonari desu.' },
  'vocab_n5_0339': { ex: 'スプーンで混ぜます。', id: 'Saya mengaduk dengan sendok.', rom: 'Supuun de mazemasu.' },
  'vocab_n5_0340': { ex: 'スポーツをします。', id: 'Saya olahraga.', rom: 'Supootsu o shimasu.' },
  'vocab_n5_0345': { ex: '背', id: 'Tinggi badan', rom: 'Sei' },
  'vocab_n5_0351': { ex: 'ゼロから始めます。', id: 'Mulai dari nol.', rom: 'Zero kara hajimemasu.' },
  'vocab_n5_0356': { ex: '洗濯をします。', id: 'Saya mencuci.', rom: 'Sentaku o shimasu.' },
  'vocab_n5_0364': { ex: '外は暖かいです。', id: 'Di luar hangat.', rom: 'Soto wa atatakai desu.' },
  'vocab_n5_0373': { ex: '大使館はどこですか。', id: 'Di mana kedutaan?', rom: 'Taishikan wa doko desu ka?' },
  'vocab_n5_0375': { ex: '大切', id: 'Penting', rom: 'Taisetsu' },
  'vocab_n5_0376': { ex: '大切な友達', id: 'Teman dekat', rom: 'Taisetsu na tomodachi' },
  'vocab_n5_0377': { ex: '台所で料理します。', id: 'Saya masak di dapur.', rom: 'Daidokoro de ryouri shimasu.' },
  'vocab_n5_0387': { ex: '建物は高いです。', id: 'Gedungnya tinggi.', rom: 'Tatemono wa takai desu.' },
  'vocab_n5_0390': { ex: 'たばこを吸います。', id: 'Saya merokok.', rom: 'Tabako o suimasu.' },
  'vocab_n5_0391': { ex: '多分、窄行きます。', id: 'Mungkin saya pergi.', rom: 'Tabun, ikimasu.' },
  'vocab_n5_0394': { ex: '卵を食べます。', id: 'Saya makan telur.', rom: 'Tamago o tabemasu.' },
  'vocab_n5_0397': { ex: '段々', id: 'Perlahan-lahan', rom: 'Dandan' },
  'vocab_n5_0403': { ex: '窄窄窄ありません。', id: 'Ada stasiun di dekat sini.', rom: 'Chikaku ni eki ga arimasu.' },
  'vocab_n5_0424': { ex: 'テープを巻きます。', id: 'Saya merekatkan pita.', rom: 'Teepu o makimasu.' },
  'vocab_n5_0442': { ex: '戸', id: 'Pintu', rom: 'To' },
  'vocab_n5_0449': { ex: '動物が好きです。', id: 'Saya suka hewan.', rom: 'Doubutsu ga suki desu.' },
  'vocab_n5_0458': { ex: '事務所はどこですか。', id: 'Di mana kantor?', rom: 'Jimusho wa doko desu ka?' },
  'vocab_n5_0460': { ex: '図書館は静かです。', id: 'Perpustakaan tenang.', rom: 'Toshokan wa shizuka desu.' },
  'vocab_n5_0465': { ex: '隣に友達がいます。', id: 'Teman di sebelah.', rom: 'Tonari ni tomodachi ga imasu.' },
  'vocab_n5_0479': { ex: '中に何がありますか。', id: 'Ada apa di dalam?', rom: 'Naka ni nani ga arimasu ka?' },
  'vocab_n5_0499': { ex: '西', id: 'Barat', rom: 'Nishi' },
  'vocab_n5_0517': { ex: '歯を磨きます。', id: 'Saya menyikat gigi.', rom: 'Ha o migakimasu.' },
  'vocab_n5_0521': { ex: '灰皿', id: 'Asbak', rom: 'Haizara' },
  'vocab_n5_0526': { ex: '橋を渡ります。', id: 'Saya menyeberang jembatan.', rom: 'Hashi o watarimasu.' },
  'vocab_n5_0528': { ex: '学校が始まります。', id: 'Sekolah dimulai.', rom: 'Gakkou ga hajimarimasu.' },
  'vocab_n5_0529': { ex: '始めに紹介します。', id: 'Pertama, saya perkenalkan.', rom: 'Hajime ni shookai shimasu.' },
  'vocab_n5_0538': { ex: '花を買います。', id: 'Saya membeli bunga.', rom: 'Hana o kaimasu.' },
  'vocab_n5_0554': { ex: '窄窄窄窄ください。', id: 'Tolong berikan nomor telepon.', rom: 'Denwabangou o kudasai.' },
  'vocab_n5_0556': { ex: '東', id: 'Timur', rom: 'Higashi' },
  'vocab_n5_0563': { ex: '左', id: 'Kiri', rom: 'Hidari' },
  'vocab_n5_0577': { ex: '封筒', id: 'Amplop', rom: 'Fuutou' },
  'vocab_n5_0591': { ex: '文章を読みます。', id: 'Saya membaca kalimat.', rom: 'Bunshou o yomimasu.' },
  'vocab_n5_0592': { ex: 'ページをめくります。', id: 'Saya membolak-balik halaman.', rom: 'Peiji o mekuru shimasu.' },
  'vocab_n5_0595': { ex: 'ペットを飼いたいです。', id: 'Saya ingin memelihara hewan.', rom: 'Petto o kaitai desu.' },
  'vocab_n5_0597': { ex: '辺', id: 'Sekitar', rom: 'Hen' },
  'vocab_n5_0598': { ex: 'ペンで書きます。', id: 'Saya menulis dengan pulpen.', rom: 'Pen de kakimasu.' },
  'vocab_n5_0603': { ex: '外は寒窄です。', id: 'Di luar dingin.', rom: 'Hoka wa samui desu.' },
  'vocab_n5_0608': { ex: 'ボタンをクリックします。', id: 'Saya mengklik tombol.', rom: 'Botan o kurikku shimasu.' },
  'vocab_n5_0621': { ex: '前は学校でした。', id: 'Dulu这里是 sekolah.', rom: 'Mae wa gakkou deshita.' },
  'vocab_n5_0624': { ex: 'このバナナはまずいです。', id: 'Pisang ini tidak enak.', rom: 'Kono banana wa mazui desu.' },
  'vocab_n5_0630': { ex: 'マッチ', id: 'Korek api', rom: 'Masshu' },
  'vocab_n5_0636': { ex: '右', id: 'Kanan', rom: 'Migi' },
  'vocab_n5_0646': { ex: '南', id: 'Selatan', rom: 'Minami' },
  'vocab_n5_0647': { ex: '耳', id: 'Telinga', rom: 'Mimi' },
  'vocab_n5_0651': { ex: '向こう', id: 'Seberang', rom: 'Mukou' },
  'vocab_n5_0655': { ex: '目', id: 'Mata', rom: 'Me' },
  'vocab_n5_0664': { ex: '門', id: 'Gerbang', rom: 'Mon' },
  'vocab_n5_0686': { ex: '横に並んでいます。', id: 'Berbaris di samping.', rom: 'Yoko ni narande imasu.' },
  'vocab_n5_0697': { ex: '立派', id: 'Megah atau luar biasa', rom: 'Rippa' },
  'vocab_n5_0701': { ex: '料理', id: 'Masakan', rom: 'Ryouri' },
  'vocab_n5_0704': { ex: '冷蔵庫に魚があります。', id: 'Ada ikan di kulkas.', rom: 'Reizouko ni sakana ga arimasu.' },
};

let fixed = 0, notFound = 0;
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

// Check remaining bad
let stillBad = 0;
rows.forEach(r => {
  const jp = r[h[exJp]] || '';
  if (jp.includes('窄') || jp.includes(' ada ') || jp.includes(' ada.')) stillBad++;
});
console.log('Still problematic:', stillBad);

const output = Papa.unparse(rows, { columns: h });
fs.writeFileSync('data/seed/jlpt_n5_vocabulary_seed_with_examples.csv', output, 'utf-8');
console.log('CSV saved!');
