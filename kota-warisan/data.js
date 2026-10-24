/* Kota Warisan · data permainan.
   Semua angka imbangan, bangunan, tentera, hikayat dan kuiz di sini supaya mudah ditala tanpa menyentuh enjin. */
'use strict';

const G = 24;                                   // saiz grid kota (petak)
const T_MUL = [1, 4, 12, 30, 60, 120, 240, 360, 480, 600];
const CAP_SIMPAN = [1500, 3000, 6000, 12000, 25000, 50000, 100000];
const CAP_ISTANA = [1000, 2000, 4000, 8000, 15000, 25000, 40000];
const CAP_TIMAH = [2000, 4000, 8000, 15000, 25000, 40000, 60000];
const ISTANA_TIMAH = [0, 0, 0, 0, 500, 1000, 2000];
const KOS_ISTANA = [0, 1000, 4000, 12000, 30000, 70000, 150000];
const KOS_BANGSAL = [0, 0, 150, 300, 600];
const KEM_CAP = [20, 30, 40, 50, 60, 70, 80];

const SUMBER = {
  emas: { n: 'Emas', w: '#f6c431' },
  beras: { n: 'Beras', w: '#8fd14f' },
  timah: { n: 'Timah', w: '#9fb4c8' },
  mutiara: { n: 'Mutiara', w: '#f3d9e8' },
};

/* Setiap tahap Istana membuka satu era. */
const ERA = [
  { nama: 'Kampung Tepian', masa: 'Permulaan' },
  { nama: 'Lembah Bujang', masa: 'Kedah Tua' },
  { nama: 'Langkasuka & Srivijaya', masa: 'Abad ke-2 hingga ke-13' },
  { nama: 'Kesultanan Melaka', masa: 'Sekitar 1400' },
  { nama: 'Johor & Perak', masa: 'Selepas 1511' },
  { nama: 'Era Perjuangan', masa: 'Abad ke-19' },
  { nama: 'Merdeka & Malaysia', masa: '1957 · 1963' },
];

const B = {
  istana: { n: 'Istana', s: 4, max: 7, hp: 1500, kat: 'teras', tb: 15,
    d: 'Pusat kota dan lambang zaman. Naik taraf Istana untuk membuka era sejarah baharu, bangunan baharu dan tahap yang lebih tinggi.' },
  lombong_emas: { n: 'Lombong Emas', s: 3, max: 7, hp: 420, kat: 'ekonomi', kos: ['beras', 150, 2.0], tb: 5, hasil: 'emas', kadar: .5,
    d: 'Menggali emas dari perut bumi. Pahang dan Kelantan terkenal dengan emas sejak dahulu.' },
  sawah: { n: 'Sawah Padi', s: 3, max: 7, hp: 420, kat: 'ekonomi', kos: ['emas', 150, 2.0], tb: 5, hasil: 'beras', kadar: .5,
    d: 'Menghasilkan beras untuk memberi makan tentera. Padi menguning tanda hasil sedia dituai.' },
  lombong_timah: { n: 'Lombong Timah', s: 3, max: 7, hp: 450, kat: 'ekonomi', kos: ['beras', 5000, 1.7], tb: 20, hasil: 'timah', kadar: .15,
    d: 'Mendulang bijih timah dengan palong. Timah diperlukan untuk menaik taraf pahlawan.' },
  peti_emas: { n: 'Perbendaharaan', s: 3, max: 7, hp: 700, kat: 'ekonomi', kos: ['beras', 300, 2.1], tb: 6, simpan: 'emas',
    d: 'Menyimpan emas kota. Lebih banyak dan lebih tinggi tahapnya, lebih besar simpanan.' },
  jelapang: { n: 'Jelapang', s: 3, max: 7, hp: 700, kat: 'ekonomi', kos: ['emas', 300, 2.1], tb: 6, simpan: 'beras',
    d: 'Rumah padi bertiang tinggi supaya beras kekal kering dan selamat daripada tikus.' },
  gudang_timah: { n: 'Gudang Timah', s: 3, max: 7, hp: 800, kat: 'ekonomi', kos: ['beras', 8000, 1.8], tb: 20, simpan: 'timah',
    d: 'Menyimpan jongkong timah.' },
  bangsal_tukang: { n: 'Bangsal Tukang', s: 2, max: 1, hp: 250, kat: 'ekonomi',
    d: 'Setiap bangsal memberi seorang tukang. Lebih ramai tukang, lebih banyak binaan serentak.' },
  balai_tentera: { n: 'Balai Tentera', s: 3, max: 7, hp: 400, kat: 'tentera', kos: ['beras', 200, 2.3], tb: 6,
    d: 'Melatih tentera. Tahap lebih tinggi membuka jenis tentera baharu. Lebih banyak balai, latihan lebih pantas.' },
  kem: { n: 'Medan Kawad', s: 3, max: 7, hp: 350, kat: 'tentera', kos: ['beras', 250, 2.4], tb: 8,
    d: 'Tempat tentera berkumpul sebelum berangkat. Menentukan saiz bala tentera kau.' },
  balai_ilmu: { n: 'Balai Ilmu', s: 3, max: 6, hp: 500, kat: 'tentera', kos: ['beras', 2500, 2.0], tb: 15,
    d: 'Cendekiawan mengkaji taktik untuk menguatkan tentera. Kuiz sejarah harian juga diadakan di sini.' },
  balai_muafakat: { n: 'Balai Muafakat', s: 3, max: 6, hp: 600, kat: 'tentera', kos: ['emas', 1000, 2.4], tb: 10,
    d: 'Tempat bermuafakat bersama puak. Menyimpan tentera bantuan daripada rakan.' },
  meriam_lela: { n: 'Meriam Lela', s: 2, max: 7, hp: 420, kat: 'pertahanan', kos: ['emas', 250, 2.2], tb: 6,
    def: { dmg: 20, rate: 1.0, range: 5.5, jenis: 'peluru' }, d: 'Meriam gangsa kecil yang lazim di kapal dan kubu Alam Melayu.' },
  menara_sumpit: { n: 'Menara Sumpit', s: 2, max: 7, hp: 380, kat: 'pertahanan', kos: ['emas', 800, 2.1], tb: 8,
    def: { dmg: 13, rate: .6, range: 7.5, jenis: 'damak' }, d: 'Penyumpit menembak damak dari ketinggian. Jarak jauh, tembakan pantas.' },
  meriam_besar: { n: 'Meriam Besar', s: 3, max: 7, hp: 600, kat: 'pertahanan', kos: ['emas', 5000, 1.9], tb: 20,
    def: { dmg: 34, rate: 4, range: 9, min: 3, splash: 1.5, jenis: 'bom' }, d: 'Peluru besar melengkung jatuh ke atas kumpulan musuh. Tidak dapat menembak sasaran yang terlalu dekat.' },
  kota: { n: 'Kota', s: 1, max: 7, hp: 300, kat: 'pertahanan', kos: ['emas', 50, 2.5], tb: 0,
    d: 'Tembok pertahanan. Kayu pada awalnya, batu apabila dinaik taraf ke tahap 4.' },
  ranjau: { n: 'Ranjau Buluh', s: 1, max: 4, hp: 1, kat: 'pertahanan', kos: ['emas', 400, 2.0], tb: 0,
    trap: { dmg: 60, r: 1.3 }, d: 'Buluh runcing tersembunyi. Musuh tidak nampak sehingga terpijak.' },
  anjung_laksamana: { n: 'Anjung Laksamana', s: 3, max: 7, hp: 600, kat: 'tentera', kos: ['emas', 10000, 1], tb: 30, hero: 'tuah',
    d: 'Kediaman Laksamana Hang Tuah. Tahap seterusnya dinaik taraf dengan timah.' },
  anjung_srikandi: { n: 'Anjung Srikandi', s: 3, max: 7, hp: 600, kat: 'tentera', kos: ['emas', 40000, 1], tb: 40, hero: 'fatimah',
    d: 'Kediaman Tun Fatimah, srikandi Melaka. Tahap seterusnya dinaik taraf dengan timah.' },
};

/* Bilangan maksimum setiap bangunan mengikut tahap Istana 1..7 */
const BIL = {
  lombong_emas: [1, 2, 3, 4, 5, 6, 6], sawah: [1, 2, 3, 4, 5, 6, 6], lombong_timah: [0, 0, 0, 0, 1, 2, 3],
  peti_emas: [1, 1, 2, 2, 3, 3, 4], jelapang: [1, 1, 2, 2, 3, 3, 4], gudang_timah: [0, 0, 0, 0, 1, 1, 1],
  bangsal_tukang: [5, 5, 5, 5, 5, 5, 5], balai_tentera: [1, 2, 2, 3, 3, 4, 4], kem: [1, 1, 2, 2, 3, 3, 4],
  balai_ilmu: [0, 0, 1, 1, 1, 1, 1], balai_muafakat: [0, 1, 1, 1, 1, 1, 1],
  meriam_lela: [2, 2, 2, 3, 3, 4, 5], menara_sumpit: [0, 1, 1, 2, 3, 3, 4], meriam_besar: [0, 0, 1, 1, 1, 2, 2],
  kota: [25, 50, 75, 100, 125, 175, 225], ranjau: [0, 2, 2, 4, 4, 6, 6],
  anjung_laksamana: [0, 0, 0, 1, 1, 1, 1], anjung_srikandi: [0, 0, 0, 0, 0, 1, 1],
};

const TR = {
  pendekar: { n: 'Pendekar', ruang: 1, kos: 25, masa: 4, hp: 50, dps: 10, jarak: .55, laju: 1.8, sasar: 'semua', buka: 1,
    d: 'Pesilat berkeris. Murah, pantas dan berani.' },
  pemanah: { n: 'Penyumpit', ruang: 1, kos: 50, masa: 5, hp: 22, dps: 8, jarak: 3.5, laju: 2.0, sasar: 'semua', buka: 2,
    d: 'Menyumpit damak dari jauh dan boleh menembak melepasi kota.' },
  gajah: { n: 'Gajah Perang', ruang: 5, kos: 300, masa: 20, hp: 460, dps: 14, jarak: .8, laju: 1.0, sasar: 'pertahanan', buka: 3,
    d: 'Gajah berpelana dan berperisai. Menyasarkan pertahanan terlebih dahulu.' },
  pemecah: { n: 'Pembawa Bedil', ruang: 2, kos: 120, masa: 10, hp: 25, dps: 40, jarak: .35, laju: 2.6, sasar: 'kota', buka: 4,
    d: 'Membawa tong ubat bedil untuk meletupkan kota. Kerosakan 15 kali ganda pada tembok.' },
  hulubalang: { n: 'Hulubalang', ruang: 4, kos: 400, masa: 30, hp: 320, dps: 45, jarak: .6, laju: 1.4, sasar: 'semua', buka: 5,
    d: 'Panglima bertombak dan berperisai. Kuat dan tahan lasak.' },
};
const KOS_KAJI = { pendekar: 1500, pemanah: 2500, gajah: 5000, pemecah: 5000, hulubalang: 12000 };
const MASA_KAJI = [0, 0, 60, 180, 480, 1200, 2400, 3600];

const WIRA = {
  tuah: { n: 'Hang Tuah', hp: 1100, dps: 70, jarak: .8, laju: 1.7, bina: 'anjung_laksamana', kuasa: 'Taming Sari',
    kd: 'Kerosakan berganda selama 6 saat dan pulih 35% nyawa.' },
  fatimah: { n: 'Tun Fatimah', hp: 700, dps: 48, jarak: 3.5, laju: 1.8, bina: 'anjung_srikandi', kuasa: 'Semangat Srikandi',
    kd: 'Memulihkan dan menyemarakkan tentera di sekeliling beliau.' },
};
const TAKTIK = {
  gendang: { n: 'Gendang Perang', r: 3.5, dur: 8, buka: 3, d: 'Tentera dalam bulatan bergerak dan menyerang lebih pantas.' },
  ubat: { n: 'Ubat Akar Kayu', r: 3.5, dur: 8, buka: 4, d: 'Memulihkan nyawa tentera dalam bulatan.' },
};

const LIGA = [
  { n: 'Kampung', min: 0, w: '#b07a4a', bonus: 0 },
  { n: 'Mukim', min: 200, w: '#c9c9c9', bonus: 300 },
  { n: 'Daerah', min: 500, w: '#e8b923', bonus: 800 },
  { n: 'Negeri', min: 900, w: '#b06ce0', bonus: 2000 },
  { n: 'Kesultanan', min: 1400, w: '#e05a4a', bonus: 5000 },
  { n: 'Empayar', min: 2000, w: '#5fd3e0', bonus: 10000 },
];

/* Kitab Hikayat: kad sejarah yang terbuka apabila pemain maju. */
const HIKAYAT = [
  { k: 'mula', era: 'Zaman purba', t: 'Semenanjung Emas', s: 'Mulakan permainan',
    p: 'Ahli geografi Yunani, Ptolemy, dalam karyanya Geographia (abad ke-2 Masihi) menamakan Semenanjung Tanah Melayu sebagai Golden Chersonese, iaitu Semenanjung Emas. Nama ini menunjukkan betapa terkenalnya bumi ini dengan emas sejak zaman purba.' },
  { k: 'sungaibatu', era: 'Kedah Tua', t: 'Sungai Batu, Lembah Bujang', s: 'Istana tahap 2',
    p: 'Penggalian arkeologi di Sungai Batu, Kedah menemui tapak peleburan besi, jeti dan monumen yang dianggarkan berusia sejak sekitar abad ke-6 Sebelum Masihi. Ia antara bukti tamadun terawal di Asia Tenggara.' },
  { k: 'langkasuka', era: 'Abad ke-2', t: 'Langkasuka', s: 'Istana tahap 3',
    p: 'Kerajaan awal di utara Semenanjung yang disebut dalam catatan China. Ia dipercayai wujud sejak sekitar abad ke-2 Masihi dan menjadi persinggahan pedagang antara India dan China.' },
  { k: 'srivijaya', era: 'Abad ke-7 hingga ke-13', t: 'Srivijaya', s: 'Menang 5 serangan',
    p: 'Empayar maritim yang berpusat di Palembang, Sumatera. Srivijaya mengawal laluan perdagangan di Selat Melaka dan menjadi pusat pengajian agama Buddha yang terkenal.' },
  { k: 'batubersurat', era: '1303', t: 'Batu Bersurat Terengganu', s: 'Bina Balai Ilmu',
    p: 'Ditemui di Kuala Berang, Terengganu. Batu ini bertarikh 702 Hijrah (1303 Masihi) dan ditulis dalam tulisan Jawi. Ia antara bukti terawal kedatangan Islam di Semenanjung.' },
  { k: 'melaka', era: 'Sekitar 1400', t: 'Parameswara & Melaka', s: 'Istana tahap 4',
    p: 'Sekitar tahun 1400, Parameswara membuka Melaka. Menurut Sejarah Melayu, baginda melihat seekor pelanduk menendang anjing pemburu di bawah sepohon pokok melaka. Melaka kemudian menjadi pelabuhan entrepot yang terkenal di dunia.' },
  { k: 'chengho', era: '1405–1433', t: 'Laksamana Cheng Ho', s: 'Selesai Kempen Selat peringkat 4',
    p: 'Armada besar Dinasti Ming di bawah Laksamana Cheng Ho (Zheng He) singgah di Melaka beberapa kali antara 1405 hingga 1433. Hubungan ini membantu Melaka berkembang dan dihormati.' },
  { k: 'hangtuah', era: 'Kesultanan Melaka', t: 'Laksamana Hang Tuah', s: 'Bina Anjung Laksamana',
    p: 'Tokoh lagenda dalam Hikayat Hang Tuah, laksamana yang setia kepada Sultan Melaka bersama Hang Jebat, Hang Kasturi, Hang Lekir dan Hang Lekiu. Ungkapan "Takkan Melayu hilang di dunia" sering dikaitkan dengan beliau.' },
  { k: 'hukumkanun', era: 'Kesultanan Melaka', t: 'Hukum Kanun Melaka', s: 'Siapkan 10 naik taraf',
    p: 'Undang-undang bertulis Kesultanan Melaka yang mengatur pemerintahan, perdagangan dan kehidupan rakyat. Undang-undang Laut Melaka pula mengatur urusan pelayaran.' },
  { k: 'orangLaut', era: 'Selat Melaka', t: 'Orang Laut', s: 'Menang Kempen Selat peringkat 1',
    p: 'Masyarakat pelaut yang arif tentang selat dan pulau. Mereka setia kepada Kesultanan Melaka dan membantu menjaga laluan perdagangan daripada lanun.' },
  { k: 'gajah', era: 'Alam Melayu', t: 'Gajah Perang', s: 'Latih Gajah Perang pertama',
    p: 'Kerajaan-kerajaan Melayu menggunakan gajah dalam peperangan, pengangkutan dan istiadat diraja. Sejarah Melayu banyak menyebut gajah tunggangan raja dan pembesar.' },
  { k: 'sumpit', era: 'Warisan peribumi', t: 'Sumpitan', s: 'Latih Penyumpit pertama',
    p: 'Senjata tradisional Orang Asli di Semenanjung dan masyarakat peribumi Borneo. Anak sumpitnya dipanggil damak, dan sumpitan digunakan untuk berburu.' },
  { k: 'lela', era: 'Alam Melayu', t: 'Meriam Lela', s: 'Meriam Lela tahap 2',
    p: 'Meriam gangsa kecil yang lazim di kapal dan kubu di Alam Melayu. Ada antaranya dihias dengan ukiran yang halus.' },
  { k: 'jelapang', era: 'Warisan', t: 'Jelapang Padi', s: 'Jelapang tahap 2',
    p: 'Kedah dan Perlis dikenali sebagai jelapang padi negara. Dataran sawahnya yang luas membekalkan beras kepada seluruh negara.' },
  { k: 'gotong', era: 'Warisan', t: 'Gotong-royong', s: 'Bina Balai Muafakat',
    p: 'Amalan bekerjasama untuk kebaikan bersama seperti membina rumah, menuai padi atau membersihkan kampung. Bulat air kerana pembetung, bulat manusia kerana muafakat.' },
  { k: 'jatuh1511', era: '1511', t: 'Kejatuhan Melaka', s: 'Istana tahap 5',
    p: 'Portugis di bawah Afonso de Albuquerque menawan Melaka pada 1511. Sultan Mahmud Shah berundur, dan waris baginda kemudian mengasaskan Kesultanan Johor dan Perak.' },
  { k: 'fatimah', era: 'Kesultanan Melaka', t: 'Tun Fatimah', s: 'Bina Anjung Srikandi',
    p: 'Puteri Bendahara Tun Mutahir dan permaisuri Sultan Mahmud Shah. Tradisi lisan mengangkat beliau sebagai srikandi yang turut menentang Portugis.' },
  { k: 'timah', era: 'Abad ke-19', t: 'Bijih Timah', s: 'Bina Lombong Timah',
    p: 'Pada abad ke-19, Larut dan Lembah Kinta di Perak menjadi antara kawasan pengeluar timah terbesar dunia. Timah juga pernah dijadikan mata wang, seperti wang tampang di Pahang.' },
  { k: 'pangkor', era: '1874', t: 'Perjanjian Pangkor', s: 'Istana tahap 6',
    p: 'Perjanjian Pangkor 1874 membawa sistem Residen British ke Perak. Ia menjadi titik permulaan campur tangan British di negeri-negeri Melayu.' },
  { k: 'pejuang', era: '1850-an hingga 1915', t: 'Pejuang Tanah Air', s: 'Berjaya pertahankan kota 3 kali',
    p: 'Dato\' Maharaja Lela di Perak (1875), Mat Kilau di Pahang (1891–1895), Mat Salleh di Sabah (1894–1900), Rentap di Sarawak (1850-an) dan Tok Janggut di Kelantan (1915) bangkit mempertahankan tanah air.' },
  { k: 'merdeka', era: '31 Ogos 1957', t: 'Merdeka!', s: 'Istana tahap 7',
    p: 'Di Stadium Merdeka, Kuala Lumpur, Tunku Abdul Rahman melaungkan "Merdeka!" sebanyak tujuh kali. Persekutuan Tanah Melayu mencapai kemerdekaan.' },
  { k: 'malaysia', era: '16 September 1963', t: 'Malaysia', s: 'Selesaikan satu Gotong-royong puak',
    p: 'Persekutuan Tanah Melayu, Sabah, Sarawak dan Singapura bergabung membentuk Malaysia. Singapura keluar pada 9 Ogos 1965. Perpaduan pelbagai kaum menjadi asas negara.' },
  { k: 'jalur', era: '1997', t: 'Jalur Gemilang', s: 'Kumpul 30 bintang serangan',
    p: 'Bendera Malaysia mempunyai 14 jalur merah dan putih serta bulan sabit dan bintang pecah 14. Nama Jalur Gemilang diumumkan pada 31 Ogos 1997.' },
];

const KUIZ = [
  { s: 'Bilakah Persekutuan Tanah Melayu mencapai kemerdekaan?', p: ['31 Ogos 1957', '16 September 1963', '31 Ogos 1963', '9 Ogos 1965'], j: 0 },
  { s: 'Malaysia dibentuk pada tarikh…', p: ['31 Ogos 1957', '16 September 1963', '1 Januari 1960', '9 Ogos 1965'], j: 1 },
  { s: 'Siapakah yang melaungkan "Merdeka!" di Stadium Merdeka pada 1957?', p: ['Tun Abdul Razak', 'Tunku Abdul Rahman', 'Tun Hussein Onn', 'Dato\' Onn Jaafar'], j: 1 },
  { s: 'Di manakah Batu Bersurat Terengganu ditemui?', p: ['Kuala Berang', 'Kuala Terengganu', 'Dungun', 'Kemaman'], j: 0 },
  { s: 'Batu Bersurat Terengganu bertarikh tahun…', p: ['1303 Masihi', '1400 Masihi', '1511 Masihi', '1824 Masihi'], j: 0 },
  { s: 'Siapakah pengasas Kesultanan Melaka?', p: ['Hang Tuah', 'Sultan Mahmud Shah', 'Parameswara', 'Tun Perak'], j: 2 },
  { s: 'Melaka jatuh ke tangan Portugis pada tahun…', p: ['1400', '1511', '1641', '1786'], j: 1 },
  { s: 'Laksamana Dinasti Ming yang singgah di Melaka ialah…', p: ['Kublai Khan', 'Cheng Ho', 'Marco Polo', 'Ibnu Battutah'], j: 1 },
  { s: 'Tapak arkeologi Sungai Batu terletak di…', p: ['Lembah Bujang, Kedah', 'Gua Niah, Sarawak', 'Lenggong, Perak', 'Kuala Selinsing, Perak'], j: 0 },
  { s: 'Ptolemy menamakan Semenanjung Tanah Melayu sebagai…', p: ['Suvarnabhumi', 'Golden Chersonese', 'Nusantara', 'Malaya'], j: 1 },
  { s: 'Lembah Kinta di Perak terkenal dengan perlombongan…', p: ['Emas', 'Arang batu', 'Bijih timah', 'Bauksit'], j: 2 },
  { s: 'Perjanjian Pangkor ditandatangani pada tahun…', p: ['1824', '1874', '1896', '1909'], j: 1 },
  { s: 'Pejuang yang menentang British di Pahang pada 1891–1895 ialah…', p: ['Mat Kilau', 'Rentap', 'Mat Salleh', 'Tok Janggut'], j: 0 },
  { s: 'Mat Salleh memimpin penentangan di…', p: ['Kelantan', 'Sarawak', 'Sabah', 'Perak'], j: 2 },
  { s: 'Rentap ialah pahlawan dari…', p: ['Sabah', 'Sarawak', 'Pahang', 'Kedah'], j: 1 },
  { s: 'Tok Janggut memimpin penentangan pada 1915 di…', p: ['Terengganu', 'Kelantan', 'Negeri Sembilan', 'Johor'], j: 1 },
  { s: 'Dato\' Maharaja Lela dikaitkan dengan peristiwa di…', p: ['Pasir Salak', 'Pulau Pinang', 'Kuala Lumpur', 'Melaka'], j: 0 },
  { s: 'Empayar maritim yang berpusat di Palembang ialah…', p: ['Majapahit', 'Srivijaya', 'Funan', 'Champa'], j: 1 },
  { s: 'Ungkapan "Takkan Melayu hilang di dunia" dikaitkan dengan…', p: ['Hang Jebat', 'Tun Perak', 'Hang Tuah', 'Tun Teja'], j: 2 },
  { s: 'Tun Fatimah ialah puteri kepada…', p: ['Bendahara Tun Mutahir', 'Tun Perak', 'Sultan Mansur Shah', 'Laksamana Hang Tuah'], j: 0 },
  { s: 'Negeri yang dikenali sebagai jelapang padi negara ialah…', p: ['Kedah', 'Pahang', 'Johor', 'Sabah'], j: 0 },
  { s: 'Anak sumpitan dipanggil…', p: ['Lembing', 'Damak', 'Badik', 'Tombak'], j: 1 },
  { s: 'Singapura keluar daripada Malaysia pada…', p: ['31 Ogos 1957', '16 September 1963', '9 Ogos 1965', '13 Mei 1969'], j: 2 },
  { s: 'Kerajaan Melayu awal di utara Semenanjung yang disebut dalam catatan China ialah…', p: ['Langkasuka', 'Johor-Riau', 'Brunei', 'Pasai'], j: 0 },
  { s: 'Undang-undang bertulis Kesultanan Melaka dikenali sebagai…', p: ['Hukum Kanun Melaka', 'Perlembagaan Persekutuan', 'Undang-undang Kedah', 'Adat Perpatih'], j: 0 },
  { s: 'Berapakah bilangan jalur merah dan putih pada Jalur Gemilang?', p: ['11', '13', '14', '16'], j: 2 },
  { s: 'Melaka berkembang sebagai pelabuhan…', p: ['Perikanan', 'Entrepot', 'Tentera', 'Persendirian'], j: 1 },
  { s: 'Bumbung rumah gadang Negeri Sembilan yang melengkung tajam dipanggil…', p: ['Gonjong', 'Limas', 'Perabung', 'Serambi'], j: 0 },
];

/* Kempen Selat: 12 kubu lanun bertambah sukar. */
const KEMPEN = [
  { n: 'Lanun Pulau Besar', L: 1, c: 'Lanun mengganggu nelayan di Pulau Besar. Orang Laut meminta bantuan kota kau.' },
  { n: 'Teluk Si Tempang', L: 1, c: 'Si Tempang menyorok di teluk dengan harta rampasan dari kapal dagang.' },
  { n: 'Sarang Batu Karang', L: 2, c: 'Sarang lanun di sebalik batu karang. Mereka mula membina kota kayu.' },
  { n: 'Benteng Ombak Merah', L: 2, c: 'Armada Ombak Merah menyekat kapal ke pelabuhan. Pedagang menunggu laluan dibuka.' },
  { n: 'Kubu Tanjung Gelap', L: 3, c: 'Lampu tanjung dipadam supaya kapal karam. Hapuskan kubu ini.' },
  { n: 'Kota Ular Laut', L: 3, c: 'Ketua lanun bergelar Ular Laut mempunyai meriam besar curi.' },
  { n: 'Armada Layar Hitam', L: 4, c: 'Kapal berlayar hitam berlabuh di pulau tersorok. Mereka bersenjata lengkap.' },
  { n: 'Pangkalan Nakhoda Kejam', L: 4, c: 'Nakhoda Kejam menjadikan pulau ini pangkalan untuk merompak laluan rempah.' },
  { n: 'Kubu Pulau Berkabut', L: 5, c: 'Kabut tebal menyembunyikan kubu berlapis. Bawa pembawa bedil untuk kota batu.' },
  { n: 'Benteng Tiga Selat', L: 5, c: 'Tiga ketua lanun bersatu di satu benteng yang menguasai tiga laluan.' },
  { n: 'Kota Raja Lanun', L: 6, c: 'Raja Lanun menghimpun harta seluruh selat. Inilah ujian sebenar panglima.' },
  { n: 'Takhta Lanun Lautan', L: 7, c: 'Kubu terakhir. Kemenangan di sini memulihkan keamanan seluruh Selat Melaka.' },
];

const NAMA_ORANG = ['Awang', 'Siti Aishah', 'Ah Seng', 'Kavitha', 'Jimmy Gimbang', 'Dayang Nurul', 'Muthu', 'Mei Ling', 'Hafiz', 'Wan Faridah',
  'Rosli', 'Aminah', 'Liew Chee Keong', 'Gopal', 'Juliana Sinsua', 'Faizal', 'Nadia', 'Tan Boon Huat', 'Priya', 'Johari', 'Linda Jugah', 'Azman', 'Suraya', 'Kumar'];
const NAMA_TEMPAT = ['Parit Raja', 'Bukit Merah', 'Sungai Rambai', 'Tanjung Dawai', 'Batu Uban', 'Kuala Sepetang', 'Pekan Nanas', 'Lubuk Kawah',
  'Kampung Kuantan', 'Teluk Intan', 'Padang Besar', 'Bukit Kayu Hitam', 'Sri Aman', 'Kota Belud', 'Tasik Chini', 'Merbok', 'Chemor', 'Pulau Ketam'];
const NAMA_LANUN = ['Si Parut', 'Nakhoda Gelap', 'Si Kudung', 'Panglima Kabut', 'Si Gigi Emas', 'Kapitan Karang'];
const NAMA_PUAK = 'Anak Selat';

const MISI_JENIS = [
  { k: 'kumpul', t: n => `Kumpul ${fmtN(n)} hasil dari lombong dan sawah`, n: L => 1500 * L },
  { k: 'menang', t: n => `Menang ${n} serangan`, n: () => 2 },
  { k: 'derma', t: n => `Derma ${n} tentera kepada puak`, n: () => 5 },
  { k: 'latih', t: n => `Latih ${n} tentera`, n: L => 15 + 5 * L },
  { k: 'naik', t: n => `Siapkan ${n} naik taraf`, n: () => 2 },
  { k: 'kuiz', t: n => `Jawab ${n} soalan kuiz dengan betul`, n: () => 3 },
  { k: 'bintang', t: n => `Dapat ${n} bintang dalam serangan`, n: () => 5 },
];

const CAPAI = [
  { k: 'naik', n: 'Pembina Kota', d: 'Siapkan naik taraf', t: [5, 25, 100] },
  { k: 'menang', n: 'Pahlawan Selat', d: 'Menang serangan', t: [5, 25, 100] },
  { k: 'derma', n: 'Dermawan', d: 'Derma tentera kepada puak', t: [10, 100, 500] },
  { k: 'kumpulEmas', n: 'Semenanjung Emas', d: 'Kumpul emas dari lombong', t: [5000, 100000, 1000000] },
  { k: 'bintang3', n: 'Panglima Agung', d: 'Serangan tiga bintang', t: [1, 10, 50] },
  { k: 'kuiz', n: 'Cendekiawan', d: 'Jawapan kuiz yang betul', t: [5, 30, 100] },
  { k: 'hikayat', n: 'Penglipur Lara', d: 'Buka kad Kitab Hikayat', t: [5, 12, HIKAYAT.length] },
  { k: 'pertahan', n: 'Kota Teguh', d: 'Berjaya mempertahankan kota', t: [1, 10, 50] },
];
const GANJARAN_CAPAI = [10, 30, 80];

const SEMBANG = {
  salam: ['Assalamualaikum semua!', 'Selamat pagi geng Anak Selat!', 'Hai semua, baru balik kerja.', 'Apa khabar semua?', 'Salam, ada sesiapa online?'],
  tip: ['Tip: hantar Gajah dulu untuk tarik tembakan, baru lepas Penyumpit di belakang.', 'Jangan letak Perbendaharaan di luar kota, senang kena rompak.',
    'Pembawa Bedil kena hantar dekat kota, kalau jauh habis kena tembak.', 'Naik taraf Lombong dulu, nanti senang nak kumpul emas.',
    'Gendang Perang paling berkesan bila tentera berkumpul.', 'Meriam Besar tak boleh tembak dekat. Masuk rapat terus!'],
  bangga: ['Alhamdulillah, Istana aku naik tahap baru!', 'Dapat tiga bintang tadi, puas hati!', 'Rampasan besar hari ni, kapal dagang karam!', 'Kota aku berjaya tahan serangan lanun semalam.'],
  ilmu: ['Tahukah kau? Jalur Gemilang ada 14 jalur.', 'Tahukah kau? Cheng Ho singgah di Melaka beberapa kali.', 'Baru tahu Batu Bersurat Terengganu bertarikh 1303.',
    'Tahukah kau? Sungai Batu di Kedah antara tapak tamadun terawal di Asia Tenggara.', 'Tahukah kau? Rentap pahlawan Iban dari Sarawak.'],
  terima: ['Terima kasih {n}!', 'Terbaik {n}, terima kasih!', 'Jasamu dikenang, {n}!', 'Mantap {n}!'],
};
