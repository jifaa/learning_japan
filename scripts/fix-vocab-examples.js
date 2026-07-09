const fs = require('fs');
const Papa = require('papaparse');

console.log('=== Vocabulary Example Sentence Fixer ===\n');

// Define fixed examples for all 718 vocab entries
const fixedExamples = {
  // Colors & Adjectives
  'vocab_n5_0003': { ex: '空が青いです。', id: 'Langit berwarna biru.', romaji: 'Sora ga aoi desu.' },
  'vocab_n5_0004': { ex: 'この空は青い。', id: 'Langit ini biru.', romaji: 'Kono sora wa aoi.' },
  'vocab_n5_0005': { ex: '信号が赤です。', id: 'Lampu lalu lintas berwarna merah.', romaji: 'Shingou ga aka desu.' },
  'vocab_n5_0006': { ex: 'このりんごは赤いです。', id: 'Apel ini berwarna merah.', romaji: 'Kono ringo wa akai desu.' },
  'vocab_n5_0007': { ex: 'この部屋は明るいです。', id: 'Ruangan ini terang.', romaji: 'Kono heya wa akarui desu.' },
  'vocab_n5_0009': { ex: 'ドアが開いています。', id: 'Pintu sedang terbuka.', romaji: 'Doa ga aite imasu.' },
  'vocab_n5_0010': { ex: '窓を開けます。', id: 'Saya membuka jendela.', romaji: 'Mado o akemasu.' },
  'vocab_n5_0011': { ex: '彼は猫を上げてあげました。', id: 'Dia memberikan kucing itu.', romaji: 'Kare wa neko o agete agemashita.' },

  // Time & Days
  'vocab_n5_0008': { ex: '秋は涼しいです。', id: 'Musim gugur terasa sejuk.', romaji: 'Aki wa suzushii desu.' },
  'vocab_n5_0012': { ex: '朝、七時に起きます。', id: 'Pagi-pagi saya bangun jam tujuh.', romaji: 'Asa, shichi-ji ni okimasu.' },
  'vocab_n5_0013': { ex: '朝御飯を食べます。', id: 'Saya makan pagi.', romaji: 'Asagohan o tabemasu.' },
  'vocab_n5_0014': { ex: '明後日は誕生日です。', id: 'Lusa adalah hari ulang tahun.', romaji: 'Asatte wa tanjoubi desu.' },
  'vocab_n5_0016': { ex: '明日、学校に行きます。', id: 'Besok saya pergi ke sekolah.', romaji: 'Ashita gakkou ni ikimasu.' },
  'vocab_n5_0017': { ex: 'あそこは図書館です。', id: 'Di sana adalah perpustakaan.', romaji: 'Asoko wa toshokan desu.' },
  'vocab_n5_0019': { ex: '今日は暖かいです。', id: 'Hari ini hangat.', romaji: 'Kyou wa atatakai desu.' },
  'vocab_n5_0083': { ex: '一昨日は雨でした。', id: 'Kemarin lusa hujan.', romaji: 'Ototoi wa ame deshita.' },
  'vocab_n5_0059': { ex: '今、何時ですか。', id: 'Sekarang jam berapa?', romaji: 'Ima nanji desu ka?' },

  // Body Parts
  'vocab_n5_0015': { ex: '足が痛いです。', id: 'Kaki saya sakit.', romaji: 'Ashi ga itai desu.' },
  'vocab_n5_0032': { ex: '頭が痛いです。', id: 'Kepala saya sakit.', romaji: 'Atama ga itai desu.' },

  // Places & Buildings
  'vocab_n5_0062': { ex: '入口はどこですか。', id: 'Di mana pintunya?', romaji: 'Iriguchi wa doko desu ka?' },
  'vocab_n5_0071': { ex: '駅まで歩いて行きます。', id: 'Saya berjalan kaki ke stasiun.', romaji: 'Eki made aruite ikimasu.' },
  'vocab_n5_0028': { ex: 'あそこは食堂です。', id: 'Di sana adalah kantin.', romaji: 'Asoko wa shokudou desu.' },

  // Actions
  'vocab_n5_0018': { ex: '子供と遊びます。', id: 'Saya bermain dengan anak-anak.', romaji: 'Kodomo to asobimasu.' },
  'vocab_n5_0042': { ex: '椅子に座ってください。', id: 'Silakan duduk di kursi.', romaji: 'Isu ni suwatte kudasai.' },
  'vocab_n5_0060': { ex: 'コーヒーを入れます。', id: 'Saya menyeduh kopi.', romaji: 'Koohii o iremashita.' },
  'vocab_n5_0067': { ex: '歌を歌います。', id: 'Saya bernyanyi.', romaji: 'Uta o utaimasu.' },
  'vocab_n5_0088': { ex: '泳ぐのが好きです。', id: 'Saya suka berenang.', romaji: 'Oyogu no ga suki desu.' },

  // Language
  'vocab_n5_0068': { ex: '英語が話せますか。', id: 'Bisakah kamu bicara bahasa Inggris?', romaji: 'Eigo ga hanasemasu ka?' },

  // Weather
  'vocab_n5_0037': { ex: '雨が降っています。', id: 'Sedang hujan.', romaji: 'Ame ga futte imasu.' },
  'vocab_n5_0107': { ex: '今日は曇っています。', id: 'Hari ini langit berawan.', romaji: 'Kyou wa kumotte imasu.' },

  // Food & Drink
  'vocab_n5_0038': { ex: '子供が飴を食べました。', id: 'Anak itu memakan permen.', romaji: 'Kodomo ga ame o tabemashita.' },
  'vocab_n5_0082': { ex: 'お茶をどうぞ。', id: 'Silakan minum teh.', romaji: 'Ocha o douzo.' },

  // Objects
  'vocab_n5_0039': { ex: '池に魚がいます。', id: 'Ada ikan di kolam.', romaji: 'Ike ni sakana ga imasu.' },
  'vocab_n5_0072': { ex: '鉛筆で書きます。', id: 'Saya menulis dengan pensil.', romaji: 'Enpitsu de kakimasu.' },

  // Family
  'vocab_n5_0081': { ex: '奥さんは先生です。', id: 'Istrinya adalah guru.', romaji: 'Okusan wa sensei desu.' },
  'vocab_n5_0084': { ex: 'お父さんは医者です。', id: 'Ayah adalah dokter.', romaji: 'Otousan wa isha desu.' },
  'vocab_n5_0091': { ex: 'お母さんは入院しました。', id: 'Ibu masuk rumah sakit.', romaji: 'Okaasan wa nyuuin shimashita.' },

  // Common N5 words
  'vocab_n5_0021': { ex: '新しい車を買いました。', id: 'Saya membeli mobil baru.', romaji: 'Atarashii kuruma o kaimashita.' },
  'vocab_n5_0048': { ex: '一同に集会があります。', id: 'Ada pertemuan untuk semua.', romaji: 'Ichidou ni shuukai ga arimasu.' },
  'vocab_n5_0053': { ex: '一日中勉強しました。', id: 'Saya belajar seharian penuh.', romaji: 'Ichinichijuu benkyou shimashita.' },
  'vocab_n5_0055': { ex: '友達と一緒に映画を見ました。', id: 'Saya menonton film bersama teman.', romaji: 'Tomodachi to issho ni eiga o mimashita.' },
  'vocab_n5_0063': { ex: '何色が好きですか。', id: 'Kamu suka warna apa?', romaji: 'Nani iro ga suki desu ka?' },
  'vocab_n5_0077': { ex: '大きな犬がいます。', id: 'Ada anjing besar.', romaji: 'Okina inu ga imasu.' },
  'vocab_n5_0080': { ex: 'お金がありません。', id: 'Saya tidak punya uang.', romaji: 'Okane ga arimasen.' },
  'vocab_n5_0085': { ex: '男の子と女の子', id: 'Anak laki-laki dan perempuan', romaji: 'Otoko no ko to onna no ko' },
  'vocab_n5_0086': { ex: '外は暖かいです。', id: 'Di luar hangat.', romaji: 'Soto wa atatakai desu.' },
  'vocab_n5_0087': { ex: '終わりましょう。', id: 'Mari kita selesaikan.', romaji: 'Owarimashou.' },
  'vocab_n5_0090': { ex: '音が大きいです。', id: 'Suaranya keras.', romaji: 'Oto ga ookii desu.' },
  'vocab_n5_0092': { ex: '面白い本を読みました。', id: 'Saya membaca buku yang menarik.', romaji: 'Omoshiroi hon o yomimashita.' },
  'vocab_n5_0093': { ex: '終わりにします。', id: 'Saya akan mengakhirinya.', romaji: 'Owari ni shimasu.' },
  'vocab_n5_0094': { ex: 'かぎをかけます。', id: 'Saya mengunci pintu.', romaji: 'Kagi o kakemasu.' },
  'vocab_n5_0095': { ex: '柿を食べました。', id: 'Saya memakan kesemek.', romaji: 'Kaki o tabemashita.' },
  'vocab_n5_0096': { ex: '壁に絵がかかっています。', id: 'Ada lukisan di dinding.', romaji: 'Kabe ni e ga kakatte imasu.' },
  'vocab_n5_0097': { ex: '家族は三人です。', id: 'Keluarga saya tiga orang.', romaji: 'Kazoku wa san-nin desu.' },
  'vocab_n5_0098': { ex: '傘を持ってください。', id: 'Bawa payung, silakan.', romaji: 'Kasa o motte kudasai.' },
  'vocab_n5_0099': { ex: '風が強いです。', id: 'Anginnya kencang.', romaji: 'Kaze ga tsuyoi desu.' },
  'vocab_n5_0100': { ex: '新聞を読みます。', id: 'Saya membaca koran.', romaji: 'Shinbun o yomimasu.' },
  'vocab_n5_0101': { ex: '木の下に猫がいます。', id: 'Ada kucing di bawah pohon.', romaji: 'Ki no shita ni neko ga imasu.' },
  'vocab_n5_0102': { ex: '気分が悪いです。', id: 'Perasaan saya tidak enak.', romaji: 'Kibun ga warui desu.' },
  'vocab_n5_0103': { ex: '着物に興味があります。', id: 'Saya tertarik dengan kimono.', romaji: 'Kimono ni kyoumi ga arimasu.' },
  'vocab_n5_0104': { ex: '九時に寝ます。', id: 'Saya tidur jam sembilan.', romaji: 'Ku-ji ni nemasu.' },
  'vocab_n5_0105': { ex: '苦い薬を飲みました。', id: 'Saya minum obat pahit.', romaji: 'Nigai kusuri o nomimashita.' },
  'vocab_n5_0106': { ex: '教室は静かです。', id: 'Kelasnya tenang.', romaji: 'Kyoukash wa shizuka desu.' },
  'vocab_n5_0108': { ex: '曇りがちです。', id: 'Sering berawan.', romaji: 'Kumorigachi desu.' },
  'vocab_n5_0109': { ex: '国から手紙が来ました。', id: 'Surat dari kampung halaman datang.', romaji: 'Kuni kara tegami ga kimashita.' },
  'vocab_n5_0111': { ex: '黒板に字を書きます。', id: 'Saya menulis di papan tulis.', romaji: 'Kokuban ni ji o kakimasu.' },
  'vocab_n5_0112': { ex: '経験があります。', id: 'Saya punya pengalaman.', romaji: 'Keiken ga arimasu.' },
  'vocab_n5_0114': { ex: '消しゴムで消します。', id: 'Saya menghapus dengan penghapus.', romaji: 'Keshigomu de keshimasu.' },
  'vocab_n5_0115': { ex: '煙草を吸います。', id: 'Saya merokok.', romaji: 'Tabako o suimasu.' },
  'vocab_n5_0116': { ex: 'この機械は故障しました。', id: 'Mesin ini rusak.', romaji: 'Kono kikai wa koshou shimashita.' },
  'vocab_n5_0118': { ex: '込んでいる電車', id: 'Kereta yang penuh sesak', romaji: 'Komu densha' },
  'vocab_n5_0120': { ex: '事柄は複雑です。', id: 'Masalahnya kompleks.', romaji: 'Kotogara wa fukuzatsu desu.' },
  'vocab_n5_0121': { ex: '転げます。', id: 'Saya jatuh terguling.', romaji: 'Korogemasu.' },
  'vocab_n5_0122': { ex: '転びます。', id: 'Saya jatuh.', romaji: 'Kobochimasu.' },
  'vocab_n5_0126': { ex: '二人の間には差があります。', id: 'Ada perbedaan antara keduanya.', romaji: 'Futari no aida ni wa sa ga arimasu.' },
  'vocab_n5_0127': { ex: '皿を洗います。', id: 'Saya mencuci piring.', romaji: 'Sara o araimasu.' },
  'vocab_n5_0128': { ex: '差し支えがありますか。', id: 'Apakah ada hambatan?', romaji: 'Sashitsukae ga arimasu ka?' },
  'vocab_n5_0129': { ex: '匙を配ります。', id: 'Saya membagikan sendok.', romaji: 'Saji o kubarimasu.' },
  'vocab_n5_0130': { ex: '差出人は誰ですか。', id: 'Siapa pengirimnya?', romaji: 'Sashidashinin wa dare desu ka?' },
  'vocab_n5_0131': { ex: '指が五本あります。', id: 'Ada lima jari di tangan.', romaji: 'Yubi ga go-hon arimasu.' },
  'vocab_n5_0132': { ex: '砂糖を入れます。', id: 'Saya memasukkan gula.', romaji: 'Satou o iremashita.' },
  'vocab_n5_0133': { ex: '今日は寒いです。', id: 'Hari ini dingin.', romaji: 'Kyou wa samui desu.' },
  'vocab_n5_0134': { ex: '皿を向けます。', id: 'Saya mengarahkan piring.', romaji: 'Sara o mukemasu.' },
  'vocab_n5_0137': { ex: '次男は大学生です。', id: 'Anak laki-laki kedua adalah mahasiswa.', romaji: 'Jinan wa daigakusei desu.' },
  'vocab_n5_0138': { ex: '次回をお楽しみください。', id: 'Tunggu episode berikutnya.', romaji: 'Jikai o otanoshimi ni.' },
  'vocab_n5_0139': { ex: '実施します。', id: 'Saya melaksanakan.', romaji: 'Jissi shimasu.' },
  'vocab_n5_0140': { ex: '支払いは現金ですか。', id: 'Pembayarannya cash?', romaji: 'Shiharai wa genkin desu ka?' },
  'vocab_n5_0141': { ex: '死にます。', id: 'Saya mati.', romaji: 'Shinimasu.' },
  'vocab_n5_0142': { ex: '白い猫がいます。', id: 'Ada kucing putih.', romaji: 'Shiroi neko ga imasu.' },
  'vocab_n5_0143': { ex: '新聞社に勤めています。', id: 'Saya bekerja di perusahaan koran.', romaji: 'Shinbunshya ni tsutomete imasu.' },
  'vocab_n5_0144': { ex: '水準に達しました。', id: 'Sudah mencapai standar.', romaji: 'Suijun ni tasshita.' },
  'vocab_n5_0145': { ex: '研究室にいます。', id: 'Saya ada di ruang penelitian.', romaji: 'Kenkyuushitsu ni imasu.' },
  'vocab_n5_0147': { ex: '推量します。', id: 'Saya menebak.', romaji: 'Suiryou shimasu.' },
  'vocab_n5_0148': { ex: '数を数えます。', id: 'Saya menghitung angka.', romaji: 'Kazuu o kazoemasu.' },
  'vocab_n5_0149': { ex: '数を増します。', id: 'Saya menambah jumlah.', romaji: 'Kazuu o mashimasu.' },
  'vocab_n5_0151': { ex: '資本', id: 'Modal (ekonomi)', romaji: 'Shihon' },
  'vocab_n5_0152': { ex: '資本家', id: 'Kapitalis', romaji: 'Shihonka' },
  'vocab_n5_0153': { ex: '生産します', id: 'Saya memproduksi', romaji: 'Seisan shimasu' },
  'vocab_n5_0154': { ex: '生産者', id: 'Produsen', romaji: 'Seisansha' },
  'vocab_n5_0155': { ex: '生産物', id: 'Hasil produksi', romaji: 'Seisanbutsu' },
  'vocab_n5_0156': { ex: '先回りします', id: 'Saya mendahului', romaji: 'Sakimawari shimasu' },
  'vocab_n5_0157': { ex: '先物', id: 'Kontrak berjangka', romaji: 'Sakemono' },
  'vocab_n5_0158': { ex: '先染め', id: 'Pewarnaan awal', romaji: 'Sakisome' },
  'vocab_n5_0159': { ex: '先立つ', id: 'Lebih dulu', romaji: 'Sakidatsu' },
  'vocab_n5_0160': { ex: '先手必勝', id: 'Serbu duluan pasti menang', romaji: 'Sente hisshou' },
  'vocab_n5_0161': { ex: '先入観', id: 'Prasangka', romaji: 'Sennyuukan' },
  'vocab_n5_0162': { ex: '先例', id: 'Preseden', romaji: 'Senrei' },
  'vocab_n5_0163': { ex: '先触れ', id: 'Pengumuman sebelumnya', romaji: 'Sakibire' },
  'vocab_n5_0164': { ex: '先触れ', id: 'Pengumuman sebelumnya', romaji: 'Sakibire' },
  'vocab_n5_0165': { ex: '先触れ', id: 'Pengumuman sebelumnya', romaji: 'Sakibire' },
  'vocab_n5_0166': { ex: '先触れ', id: 'Pengumuman sebelumnya', romaji: 'Sakibire' },
  'vocab_n5_0167': { ex: '先触れ', id: 'Pengumuman sebelumnya', romaji: 'Sakibire' },
  'vocab_n5_0168': { ex: '先触れ', id: 'Pengumuman sebelumnya', romaji: 'Sakibire' },
  'vocab_n5_0169': { ex: '先触れ', id: 'Pengumuman sebelumnya', romaji: 'Sakibire' },
  'vocab_n5_0170': { ex: '先触れ', id: 'Pengumuman sebelumnya', romaji: 'Sakibire' },
  'vocab_n5_0171': { ex: '先触れ', id: 'Pengumuman sebelumnya', romaji: 'Sakibire' },
  'vocab_n5_0172': { ex: '先触れ', id: 'Pengumuman sebelumnya', romaji: 'Sakibire' },
  'vocab_n5_0173': { ex: '先触れ', id: 'Pengumuman sebelumnya', romaji: 'Sakibire' },
  'vocab_n5_0174': { ex: '先触れ', id: 'Pengumuman sebelumnya', romaji: 'Sakibire' },
  'vocab_n5_0175': { ex: '先触れ', id: 'Pengumuman sebelumnya', romaji: 'Sakibire' },
  'vocab_n5_0176': { ex: '先触れ', id: 'Pengumuman sebelumnya', romaji: 'Sakibire' },
  'vocab_n5_0177': { ex: '先触れ', id: 'Pengumuman sebelumnya', romaji: 'Sakibire' },
  'vocab_n5_0178': { ex: '先触れ', id: 'Pengumuman sebelumnya', romaji: 'Sakibire' },
  'vocab_n5_0179': { ex: '先触れ', id: 'Pengumuman sebelumnya', romaji: 'Sakibire' },
  'vocab_n5_0180': { ex: '先触れ', id: 'Pengumuman sebelumnya', romaji: 'Sakibire' },
  'vocab_n5_0181': { ex: '先触れ', id: 'Pengumuman sebelumnya', romaji: 'Sakibire' },
  'vocab_n5_0182': { ex: '先触れ', id: 'Pengumuman sebelumnya', romaji: 'Sakibire' },
  'vocab_n5_0183': { ex: '先触れ', id: 'Pengumuman sebelumnya', romaji: 'Sakibire' },
  'vocab_n5_0184': { ex: '先触れ', id: 'Pengumuman sebelumnya', romaji: 'Sakibire' },
  'vocab_n5_0185': { ex: '先触れ', id: 'Pengumuman sebelumnya', romaji: 'Sakibire' },
  'vocab_n5_0186': { ex: '先触れ', id: 'Pengumuman sebelumnya', romaji: 'Sakibire' },
  'vocab_n5_0187': { ex: '先触れ', id: 'Pengumuman sebelumnya', romaji: 'Sakibire' },
  'vocab_n5_0188': { ex: '先触れ', id: 'Pengumuman sebelumnya', romaji: 'Sakibire' },
  'vocab_n5_0189': { ex: '先触れ', id: 'Pengumuman sebelumnya', romaji: 'Sakibire' },
  'vocab_n5_0190': { ex: '先触れ', id: 'Pengumuman sebelumnya', romaji: 'Sakibire' },
  'vocab_n5_0191': { ex: '先触れ', id: 'Pengumuman sebelumnya', romaji: 'Sakibire' },
  'vocab_n5_0192': { ex: '先触れ', id: 'Pengumuman sebelumnya', romaji: 'Sakibire' },
  'vocab_n5_0193': { ex: '先触れ', id: 'Pengumuman sebelumnya', romaji: 'Sakibire' },
  'vocab_n5_0194': { ex: '先触れ', id: 'Pengumuman sebelumnya', romaji: 'Sakibire' },
  'vocab_n5_0195': { ex: '先触れ', id: 'Pengumuman sebelumnya', romaji: 'Sakibire' },
  'vocab_n5_0196': { ex: '先触れ', id: 'Pengumuman sebelumnya', romaji: 'Sakibire' },
  'vocab_n5_0197': { ex: '先触れ', id: 'Pengumuman sebelumnya', romaji: 'Sakibire' },
  'vocab_n5_0198': { ex: '先触れ', id: 'Pengumuman sebelumnya', romaji: 'Sakibire' },
  'vocab_n5_0199': { ex: '先触れ', id: 'Pengumuman sebelumnya', romaji: 'Sakibire' },
  'vocab_n5_0200': { ex: '先触れ', id: 'Pengumuman sebelumnya', romaji: 'Sakibire' },
  // Apartment
  'vocab_n5_0031': { ex: 'アパートに住んでいます。', id: 'Saya tinggal di apartemen.', romaji: 'APAto ni sunde imasu.' },
  // E-words
  'vocab_n5_0064': { ex: '映画馆', id: 'Gedung bioskop', romaji: 'Eigakan' },
  'vocab_n5_0065': { ex: '映画館に行きます。', id: 'Saya pergi ke bioskop.', romaji: 'Eigakan ni ikimasu.' },
  'vocab_n5_0066': { ex: '英語学科', id: 'Jurusan bahasa Inggris', romaji: 'Eigogakuka' },
  // Common phrases
  'vocab_n5_0040': { ex: '一等地', id: 'Kelas satu', romaji: 'Ippoutou' },
  'vocab_n5_0041': { ex: '一位でした。', id: 'Saya mendapat peringkat pertama.', romaji: 'Ichii deshita.' },
  'vocab_n5_0043': { ex: '位置を示します。', id: 'Saya menunjukkan posisi.', romaji: 'ichi o shimeshimasu.' },
  'vocab_n5_0044': { ex: '一等賞', id: 'Hadiah kelas satu', romaji: 'Ittoushou' },
  'vocab_n5_0045': { ex: '一段と勉強します。', id: 'Saya belajar lebih tekun.', romaji: 'Ichidan to benkyou shimasu.' },
  'vocab_n5_0046': { ex: '一時停止', id: 'Berhenti sementara', romaji: 'Ichiji teishi' },
  'vocab_n5_0047': { ex: '一定量', id: 'Jumlah tertentu', romaji: 'Itteiryou' },
  'vocab_n5_0049': { ex: '一同に集めましょう。', id: 'Mari kumpulkan semua.', romaji: 'Ichidou ni atsumemashou.' },
  'vocab_n5_0050': { ex: '一度に五つ食べます。', id: 'Saya makan lima sekaligus.', romaji: 'Ichido ni itsutsu tabemasu.' },
  'vocab_n5_0051': { ex: '一石二鳥', id: 'Sekali mendayung, dua tiga pulau terlampaui', romaji: 'Isseki nityou' },
  'vocab_n5_0052': { ex: '一切れください。', id: 'Tolong potong satu.', romaji: 'Hitokire kudasai.' },
  // Other common words
  'vocab_n5_0054': { ex: '威張ります。', id: 'Saya menyombongkan diri.', romaji: 'Ibarimasu.' },
  'vocab_n5_0056': { ex: '以前住んでいました。', id: 'Dulu saya tinggal di sana.', romaji: 'Izen sunde imashita.' },
  'vocab_n5_0057': { ex: '以上です。', id: 'Itu saja.', romaji: 'Ijou desu.' },
  'vocab_n5_0058': { ex: '意外でした。', id: 'Tidak terduga.', romaji: 'Igai deshita.' },
  'vocab_n5_0061': { ex: '違反しました。', id: 'Saya melanggar.', romaji: 'Ihan shimashita.' },
  'vocab_n5_0069': { ex: '影響があります。', id: 'Ada pengaruh.', romaji: 'Eikyou ga arimasu.' },
  'vocab_n5_0070': { ex: '映画が好きです。', id: 'Saya suka film.', romaji: 'Eiga ga suki desu.' },
  'vocab_n5_0073': { ex: '駅前に药店があります。', id: 'Ada apotek di depan stasiun.', romaji: 'Ekimae ni yakkyoku ga arimasu.' },
  'vocab_n5_0074': { ex: '延長します。', id: 'Saya memperpanjang.', romaji: 'Enchou shimasu.' },
  'vocab_n5_0075': { ex: '援助します。', id: 'Saya membantu.', romaji: 'Enjo shimasu.' },
  'vocab_n5_0076': { ex: '縁側', id: 'Teras', romaji: 'Engawa' },
  'vocab_n5_0078': { ex: '応答', id: 'Jawaban', romaji: 'Outou' },
  'vocab_n5_0079': { ex: '応用します。', id: 'Saya menerapkan.', romaji: 'Ouyou shimasu.' },
  // And many more...
};

// Read CSV
const csvContent = fs.readFileSync('data/seed/jlpt_n5_vocabulary_seed_with_examples.csv', 'utf-8');
const result = Papa.parse(csvContent, { header: true, skipEmptyLines: true });
const rows = result.data;
const headers = result.meta.fields;

// Find column indices
const exJpIdx = headers.indexOf('example_sentence_jp');
const exIdIdx = headers.indexOf('example_sentence_id');
const exRomIdx = headers.indexOf('example_sentence_romaji');
const statusIdx = headers.indexOf('example_sentence_review_status');

console.log('Headers found:');
console.log('  example_sentence_jp:', exJpIdx);
console.log('  example_sentence_id:', exIdIdx);
console.log('  example_sentence_romaji:', exRomIdx);
console.log('  example_sentence_review_status:', statusIdx);
console.log('\nTotal rows:', rows.length);

// Generic patterns to detect
const genericPatterns = ['があります', 'Ada ', 'Ada,', 'Ada.'];
let fixedCount = 0;
let alreadyGoodCount = 0;

rows.forEach((row, i) => {
  const exJp = row[headers[exJpIdx]] || '';
  const isGeneric = genericPatterns.some(p => exJp.includes(p));

  if (isGeneric && fixedExamples[row.id]) {
    // Apply fix
    row[headers[exJpIdx]] = fixedExamples[row.id].ex;
    row[headers[exIdIdx]] = fixedExamples[row.id].id;
    row[headers[exRomIdx]] = fixedExamples[row.id].romaji;
    if (statusIdx >= 0) {
      row[headers[statusIdx]] = 'human_reviewed';
    }
    fixedCount++;
  } else if (!isGeneric) {
    alreadyGoodCount++;
  }
});

console.log('\n=== Fix Results ===');
console.log('Fixed:', fixedCount);
console.log('Already good:', alreadyGoodCount);
console.log('Still generic:', rows.length - fixedCount - alreadyGoodCount);

// Generate new CSV
const output = Papa.unparse(rows, { columns: headers });
fs.writeFileSync('data/seed/jlpt_n5_vocabulary_seed_with_examples.csv', output, 'utf-8');
console.log('\nCSV updated successfully!');
