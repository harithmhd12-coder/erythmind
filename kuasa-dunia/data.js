/* Kuasa Dunia · data permainan.
   Enjin seperti Clash of Clans (bina pangkalan, latih tentera, serang, pakatan) atas tema pertembungan geopolitik.
   Dataset negara di bawah ialah ANGGARAN BUNDAR setakat 2024/2025 daripada sumber awam (IMF, SIPRI dan lain-lain).
   Ia untuk permainan; tambah atau ubah negara dengan menyalin satu baris dalam NEGARA. */
'use strict';

const G = 24;
const T_MUL = [1, 4, 12, 30, 60, 120, 240, 360, 480, 600];
const CAP_SIMPAN = [1500, 3000, 6000, 12000, 25000, 50000, 100000];
const CAP_ISTANA = [1000, 2000, 4000, 8000, 15000, 25000, 40000];
const CAP_TIMAH = [2000, 4000, 8000, 15000, 25000, 40000, 60000];
const ISTANA_TIMAH = [0, 0, 0, 0, 500, 1000, 2000];
const KOS_ISTANA = [0, 1000, 4000, 12000, 30000, 70000, 150000];
const KOS_BANGSAL = [0, 0, 150, 300, 600];
const KEM_CAP = [20, 30, 40, 50, 60, 70, 80];

const SUMBER = {
  dana: { n: 'Dana', w: '#f6c431' },
  minyak: { n: 'Minyak', w: '#3a3f4a' },
  nadir: { n: 'Unsur Nadir', w: '#7fd6c2' },
  intel: { n: 'Intel', w: '#9ab8ff' },
};

/* Tahap Markas Komando = fasa kuasa */
const ERA = [
  { nama: 'Pos Sempadan', masa: 'Pertahanan asas' },
  { nama: 'Pangkalan Serantau', masa: 'Radar & kubu' },
  { nama: 'Komando Wilayah', masa: 'Pertahanan udara' },
  { nama: 'Komando Bersama', masa: 'Operasi gabungan' },
  { nama: 'Pusat Strategik', masa: 'Unsur nadir & perang elektronik' },
  { nama: 'Kuasa Serantau', masa: 'Unjuran kuasa' },
  { nama: 'Kuasa Global', masa: 'Pengaruh sejagat' },
];

const B = {
  markas: { n: 'Markas Komando', s: 4, max: 7, hp: 1600, kat: 'teras', tb: 15,
    d: 'Pusat arahan negara. Naik taraf untuk membuka fasa kuasa baharu, bangunan dan tahap lebih tinggi.' },
  zon_industri: { n: 'Zon Industri', s: 3, max: 7, hp: 420, kat: 'ekonomi', kos: ['minyak', 150, 2.0], tb: 5, hasil: 'dana', kadar: .5,
    d: 'Kilang dan perniagaan menjana dana negara.' },
  telaga_minyak: { n: 'Telaga Minyak', s: 3, max: 7, hp: 420, kat: 'ekonomi', kos: ['dana', 150, 2.0], tb: 5, hasil: 'minyak', kadar: .5,
    d: 'Bahan api untuk melatih tentera dan menggerakkan logistik.' },
  lombong_nadir: { n: 'Lombong Unsur Nadir', s: 3, max: 7, hp: 450, kat: 'ekonomi', kos: ['minyak', 5000, 1.7], tb: 20, hasil: 'nadir', kadar: .15,
    d: 'Mineral kritikal untuk elektronik ketenteraan. Diperlukan untuk menaik taraf komander.' },
  bank: { n: 'Bank Pusat', s: 3, max: 7, hp: 700, kat: 'ekonomi', kos: ['minyak', 300, 2.1], tb: 6, simpan: 'dana', d: 'Menyimpan dana negara.' },
  depot_minyak: { n: 'Depot Bahan Api', s: 3, max: 7, hp: 700, kat: 'ekonomi', kos: ['dana', 300, 2.1], tb: 6, simpan: 'minyak', d: 'Tangki simpanan bahan api strategik.' },
  gudang_nadir: { n: 'Gudang Unsur Nadir', s: 3, max: 7, hp: 800, kat: 'ekonomi', kos: ['minyak', 8000, 1.8], tb: 20, simpan: 'nadir', d: 'Menyimpan mineral kritikal.' },
  pusat_risikan: { n: 'Pusat Risikan', s: 2, max: 7, hp: 500, kat: 'ekonomi', kos: ['dana', 3000, 2.2], tb: 15, hasil: 'intel', kadar: .004,
    d: 'Mengumpul Intel untuk propaganda, operasi proksi dan bendera palsu. Tahap lebih tinggi menyukarkan operasi musuh dikesan.' },
  pejabat_jurutera: { n: 'Pejabat Jurutera', s: 2, max: 1, hp: 250, kat: 'ekonomi', d: 'Setiap pejabat memberi satu pasukan jurutera untuk membina serentak.' },
  berek: { n: 'Berek Tentera', s: 3, max: 7, hp: 400, kat: 'tentera', kos: ['minyak', 200, 2.3], tb: 6, d: 'Melatih tentera. Tahap lebih tinggi membuka unit baharu.' },
  kem: { n: 'Kem Tentera', s: 3, max: 7, hp: 350, kat: 'tentera', kos: ['minyak', 250, 2.4], tb: 8, d: 'Menempatkan tentera sebelum operasi. Menentukan saiz pasukan.' },
  makmal: { n: 'Makmal Pertahanan', s: 3, max: 6, hp: 500, kat: 'tentera', kos: ['minyak', 2500, 2.0], tb: 15, d: 'Penyelidikan senjata untuk menguatkan unit. Kuiz geopolitik di sini.' },
  pusat_pakatan: { n: 'Pusat Pakatan', s: 3, max: 6, hp: 600, kat: 'tentera', kos: ['dana', 1000, 2.4], tb: 10, d: 'Hubungan dengan blok sekutu. Menempatkan pasukan bantuan sekutu.' },
  artileri: { n: 'Artileri', s: 2, max: 7, hp: 420, kat: 'pertahanan', kos: ['dana', 250, 2.2], tb: 6, def: { dmg: 20, rate: 1.0, range: 5.5, jenis: 'peluru' }, d: 'Meriam jarak sederhana. Sasaran darat sahaja.' },
  menara_mesingan: { n: 'Menara Mesingan', s: 2, max: 7, hp: 380, kat: 'pertahanan', kos: ['dana', 800, 2.1], tb: 8, def: { dmg: 13, rate: .6, range: 7.5, jenis: 'damak', udara: true }, d: 'Tembakan pantas ke sasaran darat dan udara.' },
  pelancar_roket: { n: 'Pelancar Roket', s: 3, max: 7, hp: 600, kat: 'pertahanan', kos: ['dana', 5000, 1.9], tb: 20, def: { dmg: 34, rate: 4, range: 9, min: 3, splash: 1.5, jenis: 'bom' }, d: 'Roket melengkung ke atas kumpulan musuh. Tidak boleh menembak terlalu dekat.' },
  pertahanan_udara: { n: 'Pertahanan Udara', s: 3, max: 7, hp: 650, kat: 'pertahanan', kos: ['dana', 2500, 2.0], tb: 15, def: { dmg: 60, rate: 1.2, range: 9.5, jenis: 'misil', udara: true, hanyaUdara: true }, d: 'Peluru berpandu permukaan-ke-udara. Memusnahkan dron dan helikopter.' },
  radar: { n: 'Radar', s: 2, max: 7, hp: 350, kat: 'pertahanan', kos: ['dana', 1500, 2.1], tb: 10, radar: true, d: 'Selagi radar berfungsi, semua pertahanan menembak 15% lebih jauh. Musnahkan radar musuh dahulu.' },
  tembok: { n: 'Tembok', s: 1, max: 7, hp: 300, kat: 'pertahanan', kos: ['dana', 50, 2.5], tb: 0, d: 'Beg pasir pada awalnya, konkrit bertetulang apabila dinaik taraf.' },
  periuk_api: { n: 'Periuk Api', s: 1, max: 4, hp: 1, kat: 'pertahanan', kos: ['dana', 400, 2.0], tb: 0, trap: { dmg: 60, r: 1.3 }, d: 'Tersembunyi sehingga dipijak. Risikan boleh mendedahkannya sebelum serangan.' },
  pos_komando: { n: 'Pos Komander', s: 3, max: 7, hp: 600, kat: 'tentera', kos: ['dana', 10000, 1], tb: 30, hero: 'komander', d: 'Markas Komander Pasukan Khas. Tahap seterusnya dinaik taraf dengan unsur nadir.' },
  pos_elit: { n: 'Pos Penembak Elit', s: 3, max: 7, hp: 600, kat: 'tentera', kos: ['dana', 40000, 1], tb: 40, hero: 'elit', d: 'Markas Penembak Elit. Tahap seterusnya dinaik taraf dengan unsur nadir.' },
};
const BIL = {
  zon_industri: [1, 2, 3, 4, 5, 6, 6], telaga_minyak: [1, 2, 3, 4, 5, 6, 6], lombong_nadir: [0, 0, 0, 0, 1, 2, 3],
  bank: [1, 1, 2, 2, 3, 3, 4], depot_minyak: [1, 1, 2, 2, 3, 3, 4], gudang_nadir: [0, 0, 0, 0, 1, 1, 1], pusat_risikan: [0, 0, 1, 1, 1, 2, 2],
  pejabat_jurutera: [5, 5, 5, 5, 5, 5, 5], berek: [1, 2, 2, 3, 3, 4, 4], kem: [1, 1, 2, 2, 3, 3, 4],
  makmal: [0, 0, 1, 1, 1, 1, 1], pusat_pakatan: [0, 1, 1, 1, 1, 1, 1],
  artileri: [2, 2, 2, 3, 3, 4, 5], menara_mesingan: [0, 1, 1, 2, 3, 3, 4], pelancar_roket: [0, 0, 1, 1, 1, 2, 2],
  pertahanan_udara: [0, 0, 1, 1, 2, 2, 3], radar: [0, 1, 1, 1, 2, 2, 2],
  tembok: [25, 50, 75, 100, 125, 175, 225], periuk_api: [0, 2, 2, 4, 4, 6, 6],
  pos_komando: [0, 0, 0, 1, 1, 1, 1], pos_elit: [0, 0, 0, 0, 0, 1, 1],
};

/* unit: kos dalam minyak; udara = terbang melepasi tembok dan hanya boleh ditembak pertahanan anti-udara */
const TR = {
  infantri: { n: 'Infantri', ruang: 1, kos: 25, masa: 4, hp: 55, dps: 10, jarak: .55, laju: 1.8, sasar: 'semua', buka: 1, d: 'Askar serba guna. Murah dan cepat dilatih.' },
  penembak: { n: 'Penembak Tepat', ruang: 1, kos: 50, masa: 5, hp: 24, dps: 9, jarak: 3.6, laju: 2.0, sasar: 'semua', buka: 2, d: 'Menembak dari jauh, melepasi tembok.' },
  kereta_kebal: { n: 'Kereta Kebal', ruang: 5, kos: 300, masa: 20, hp: 520, dps: 16, jarak: 1.2, laju: 1.0, sasar: 'pertahanan', buka: 3, d: 'Berperisai tebal. Menyasarkan pertahanan terlebih dahulu.' },
  jurutera_tempur: { n: 'Jurutera Tempur', ruang: 2, kos: 120, masa: 10, hp: 26, dps: 40, jarak: .35, laju: 2.6, sasar: 'tembok', buka: 4, d: 'Bahan letupan untuk memecahkan tembok. Kerosakan 15 kali ganda pada tembok.' },
  dron: { n: 'Dron Serang', ruang: 2, kos: 160, masa: 12, hp: 110, dps: 26, jarak: 2.5, laju: 2.4, sasar: 'semua', udara: true, buka: 4, d: 'Terbang melepasi tembok. Lemah terhadap pertahanan udara dan mesingan.' },
  komando: { n: 'Komando', ruang: 4, kos: 400, masa: 30, hp: 330, dps: 45, jarak: .6, laju: 1.5, sasar: 'semua', buka: 5, d: 'Pasukan elit yang tahan lasak dan berbahaya dalam pertempuran dekat.' },
  helikopter: { n: 'Helikopter Serang', ruang: 6, kos: 600, masa: 40, hp: 650, dps: 42, jarak: 3.0, laju: 1.6, sasar: 'pertahanan', udara: true, buka: 6, d: 'Unit udara berat yang memburu pertahanan. Musuh utama: pertahanan udara.' },
};
const KOS_KAJI = { infantri: 1500, penembak: 2500, kereta_kebal: 5000, jurutera_tempur: 5000, dron: 6000, komando: 12000, helikopter: 18000 };
const MASA_KAJI = [0, 0, 60, 180, 480, 1200, 2400, 3600];

const WIRA = {
  komander: { n: 'Komander Pasukan Khas', hp: 1100, dps: 70, jarak: .8, laju: 1.7, bina: 'pos_komando', kuasa: 'Serbuan Senyap', kd: 'Kerosakan berganda selama 6 saat dan pulih 35% nyawa.' },
  elit: { n: 'Penembak Elit', hp: 700, dps: 48, jarak: 4.0, laju: 1.8, bina: 'pos_elit', kuasa: 'Penanda Sasaran', kd: 'Memulihkan dan menguatkan unit di sekeliling.' },
};
const TAKTIK = {
  ew: { n: 'Perang Elektronik', r: 3.5, dur: 6, buka: 3, d: 'Melumpuhkan pertahanan dalam bulatan selama 6 saat.' },
  bekalan: { n: 'Bekalan Udara', r: 3.5, dur: 8, buka: 4, d: 'Ubat dan peluru dijatuhkan: memulihkan unit dalam bulatan.' },
  udara: { n: 'Serangan Udara', r: 2.2, dur: 1.4, buka: 5, d: 'Jet menggugurkan bom ke atas bangunan dalam bulatan.' },
};
const DOKTRIN = {
  kilat: { n: 'Serangan Kilat', d: 'Unit 25% lebih laju, nyawa 10% kurang.', laju: 1.25, hp: .9, dmg: 1 },
  berat: { n: 'Tembakan Berat', d: 'Kerosakan 20% lebih tinggi, unit 15% lebih perlahan.', laju: .85, hp: 1, dmg: 1.2 },
  lapis: { n: 'Pertahanan Berlapis', d: 'Nyawa unit 20% lebih tinggi, kerosakan 10% kurang.', laju: 1, hp: 1.2, dmg: .9 },
};

const LIGA = [
  { n: 'Kuasa Kecil', min: 0, w: '#b07a4a', bonus: 0 },
  { n: 'Kuasa Serantau', min: 200, w: '#c9c9c9', bonus: 300 },
  { n: 'Kuasa Pertengahan', min: 500, w: '#e8b923', bonus: 800 },
  { n: 'Kuasa Besar', min: 900, w: '#b06ce0', bonus: 2000 },
  { n: 'Kuasa Utama', min: 1400, w: '#e05a4a', bonus: 5000 },
  { n: 'Kuasa Super', min: 2000, w: '#5fd3e0', bonus: 10000 },
];

/* ================= DATASET NEGARA =================
   k kod ISO, n nama, wil wilayah, blok keanggotaan, kdnk USD bilion (nominal, anggaran 2024), pop juta,
   belanja = belanja ketenteraan USD bilion (anggaran 2024), nuklear (dimiliki atau dipercayai dimiliki),
   ll [lintang, bujur] ibu kota untuk jarak logistik, kuat = kekuatan sumber (minyak | nadir | teknologi | kewangan),
   sekutu / seteru / tegang = hubungan semasa yang ketara, nota = situasi semasa ringkas. */
const NEGARA = [
  { k: 'US', n: 'Amerika Syarikat', wil: 'Amerika', blok: ['NATO', 'G7', 'QUAD', 'AUKUS'], kdnk: 29200, pop: 335, belanja: 997, nuklear: true, ll: [38.9, -77.0], kuat: ['minyak', 'teknologi', 'kewangan'], sekutu: ['GB', 'JP', 'KR', 'AU', 'CA', 'IL', 'PH'], seteru: ['RU', 'IR', 'KP'], tegang: ['CN'], nota: 'Belanja pertahanan terbesar dunia dan rangkaian pakatan global.' },
  { k: 'CA', n: 'Kanada', wil: 'Amerika', blok: ['NATO', 'G7'], kdnk: 2210, pop: 41, belanja: 29, ll: [45.4, -75.7], kuat: ['minyak', 'nadir'], sekutu: ['US', 'GB'], nota: 'Pengeluar tenaga dan mineral kritikal.' },
  { k: 'MX', n: 'Mexico', wil: 'Amerika', blok: [], kdnk: 1850, pop: 130, belanja: 11, ll: [19.4, -99.1], kuat: ['minyak'], nota: 'Rakan dagang utama Amerika Syarikat.' },
  { k: 'BR', n: 'Brazil', wil: 'Amerika', blok: ['BRICS'], kdnk: 2180, pop: 212, belanja: 21, ll: [-15.8, -47.9], kuat: ['minyak', 'nadir'], nota: 'Kuasa serantau Amerika Latin; anggota pengasas BRICS.' },
  { k: 'AR', n: 'Argentina', wil: 'Amerika', blok: [], kdnk: 630, pop: 46, belanja: 3, ll: [-34.6, -58.4], kuat: ['nadir'], tegang: ['GB'], nota: 'Tuntutan ke atas Kepulauan Falkland/Malvinas.' },
  { k: 'GB', n: 'United Kingdom', wil: 'Eropah', blok: ['NATO', 'G7', 'AUKUS'], kdnk: 3590, pop: 68, belanja: 82, nuklear: true, ll: [51.5, -0.1], kuat: ['kewangan'], sekutu: ['US', 'AU', 'CA', 'UA'], seteru: ['RU'], nota: 'Kuasa nuklear dan anggota tetap Majlis Keselamatan PBB.' },
  { k: 'FR', n: 'Perancis', wil: 'Eropah', blok: ['NATO', 'G7', 'EU'], kdnk: 3170, pop: 68, belanja: 65, nuklear: true, ll: [48.9, 2.35], kuat: ['teknologi'], sekutu: ['DE', 'UA'], nota: 'Kuasa nuklear dan pengeksport senjata utama.' },
  { k: 'DE', n: 'Jerman', wil: 'Eropah', blok: ['NATO', 'G7', 'EU'], kdnk: 4710, pop: 84, belanja: 88, ll: [52.5, 13.4], kuat: ['teknologi'], sekutu: ['FR', 'UA', 'PL'], nota: 'Ekonomi terbesar Eropah; menaikkan belanja pertahanan sejak 2022.' },
  { k: 'IT', n: 'Itali', wil: 'Eropah', blok: ['NATO', 'G7', 'EU'], kdnk: 2380, pop: 59, belanja: 38, ll: [41.9, 12.5], kuat: ['teknologi'], nota: 'Kuasa Mediterranean dan pengeluar pertahanan.' },
  { k: 'ES', n: 'Sepanyol', wil: 'Eropah', blok: ['NATO', 'EU'], kdnk: 1730, pop: 48, belanja: 25, ll: [40.4, -3.7], kuat: [], nota: 'Pintu masuk Mediterranean ke Atlantik.' },
  { k: 'PL', n: 'Poland', wil: 'Eropah', blok: ['NATO', 'EU'], kdnk: 910, pop: 37, belanja: 38, ll: [52.2, 21.0], kuat: [], sekutu: ['US', 'UA', 'DE'], seteru: ['RU'], nota: 'Antara pembelanja pertahanan tertinggi NATO berbanding KDNK.' },
  { k: 'NL', n: 'Belanda', wil: 'Eropah', blok: ['NATO', 'EU'], kdnk: 1230, pop: 18, belanja: 22, ll: [52.4, 4.9], kuat: ['teknologi', 'kewangan'], nota: 'Pengeluar mesin cip litografi termaju dunia.' },
  { k: 'SE', n: 'Sweden', wil: 'Eropah', blok: ['NATO', 'EU'], kdnk: 600, pop: 10.5, belanja: 12, ll: [59.3, 18.1], kuat: ['teknologi'], nota: 'Menyertai NATO pada 2024.' },
  { k: 'NO', n: 'Norway', wil: 'Eropah', blok: ['NATO'], kdnk: 480, pop: 5.5, belanja: 10, ll: [59.9, 10.75], kuat: ['minyak'], nota: 'Pengeksport gas utama Eropah.' },
  { k: 'GR', n: 'Greece', wil: 'Eropah', blok: ['NATO', 'EU'], kdnk: 250, pop: 10.4, belanja: 8, ll: [38.0, 23.7], kuat: [], tegang: ['TR'], nota: 'Pertikaian maritim di Laut Aegean.' },
  { k: 'UA', n: 'Ukraine', wil: 'Eropah', blok: [], kdnk: 190, pop: 37, belanja: 65, ll: [50.45, 30.5], kuat: ['nadir'], sekutu: ['PL', 'GB', 'DE', 'FR'], seteru: ['RU'], nota: 'Mempertahankan diri daripada pencerobohan berskala penuh Rusia sejak Februari 2022.' },
  { k: 'RU', n: 'Rusia', wil: 'Eropah', blok: ['BRICS', 'SCO', 'CSTO'], kdnk: 2160, pop: 144, belanja: 149, nuklear: true, ll: [55.75, 37.6], kuat: ['minyak', 'nadir'], sekutu: ['CN', 'IR', 'KP'], seteru: ['UA', 'US', 'GB', 'PL'], nota: 'Berperang di Ukraine sejak 2022 dan dikenakan sekatan Barat.' },
  { k: 'TR', n: 'Turkiye', wil: 'Eropah', blok: ['NATO'], kdnk: 1320, pop: 85, belanja: 25, ll: [39.9, 32.9], kuat: ['teknologi'], tegang: ['GR'], nota: 'Mengawal Selat Bosphorus; pengeluar dron utama.' },
  { k: 'IL', n: 'Israel', wil: 'Asia Barat', blok: [], kdnk: 540, pop: 10, belanja: 47, nuklear: true, ll: [32.1, 34.8], kuat: ['teknologi'], sekutu: ['US'], seteru: ['IR'], nota: 'Perang di Gaza sejak Oktober 2023; pertempuran 12 hari dengan Iran pada Jun 2025. Status nuklear tidak diisytiharkan.' },
  { k: 'IR', n: 'Iran', wil: 'Asia Barat', blok: ['BRICS', 'SCO'], kdnk: 430, pop: 90, belanja: 8, ll: [35.7, 51.4], kuat: ['minyak'], sekutu: ['RU'], seteru: ['IL', 'US'], nota: 'Program nuklear menjadi isu antarabangsa; diserang Israel dan Amerika Syarikat pada Jun 2025.' },
  { k: 'SA', n: 'Arab Saudi', wil: 'Asia Barat', blok: ['GCC'], kdnk: 1110, pop: 33, belanja: 80, ll: [24.7, 46.7], kuat: ['minyak', 'kewangan'], sekutu: ['AE', 'US'], nota: 'Pengeksport minyak terbesar; memulihkan hubungan dengan Iran pada 2023.' },
  { k: 'AE', n: 'Emiriah Arab Bersatu', wil: 'Asia Barat', blok: ['GCC', 'BRICS'], kdnk: 540, pop: 10, belanja: 23, ll: [24.45, 54.4], kuat: ['minyak', 'kewangan'], sekutu: ['SA'], nota: 'Hab kewangan dan logistik Teluk.' },
  { k: 'QA', n: 'Qatar', wil: 'Asia Barat', blok: ['GCC'], kdnk: 220, pop: 3, belanja: 10, ll: [25.3, 51.5], kuat: ['minyak', 'kewangan'], nota: 'Pengeksport LNG utama dan pengantara rundingan serantau.' },
  { k: 'EG', n: 'Mesir', wil: 'Afrika', blok: ['BRICS', 'KA'], kdnk: 380, pop: 107, belanja: 3, ll: [30.0, 31.2], kuat: [], nota: 'Mengawal Terusan Suez; hasilnya terjejas oleh krisis Laut Merah.' },
  { k: 'ET', n: 'Ethiopia', wil: 'Afrika', blok: ['BRICS', 'KA'], kdnk: 160, pop: 129, belanja: 1, ll: [9.0, 38.7], kuat: [], tegang: ['EG'], nota: 'Empangan Renaissance di Sungai Nil menimbulkan ketegangan dengan Mesir.' },
  { k: 'NG', n: 'Nigeria', wil: 'Afrika', blok: ['KA'], kdnk: 250, pop: 230, belanja: 2, ll: [9.06, 7.5], kuat: ['minyak'], nota: 'Negara paling ramai penduduk di Afrika.' },
  { k: 'ZA', n: 'Afrika Selatan', wil: 'Afrika', blok: ['BRICS', 'KA'], kdnk: 400, pop: 63, belanja: 3, ll: [-25.7, 28.2], kuat: ['nadir'], nota: 'Pengeluar mineral kritikal dan anggota BRICS.' },
  { k: 'CN', n: 'China', wil: 'Asia Timur', blok: ['BRICS', 'SCO'], kdnk: 18750, pop: 1410, belanja: 314, nuklear: true, ll: [39.9, 116.4], kuat: ['nadir', 'teknologi'], sekutu: ['RU', 'PK', 'KP'], seteru: ['TW'], tegang: ['US', 'JP', 'PH', 'IN', 'VN'], nota: 'Ekonomi kedua terbesar dunia; pertikaian di Laut China Selatan dan Selat Taiwan.' },
  { k: 'JP', n: 'Jepun', wil: 'Asia Timur', blok: ['G7', 'QUAD'], kdnk: 4070, pop: 124, belanja: 55, ll: [35.7, 139.7], kuat: ['teknologi'], sekutu: ['US', 'AU', 'PH'], seteru: ['KP'], tegang: ['CN'], nota: 'Menggandakan belanja pertahanan menjelang 2027.' },
  { k: 'KR', n: 'Korea Selatan', wil: 'Asia Timur', blok: [], kdnk: 1870, pop: 52, belanja: 48, ll: [37.6, 127.0], kuat: ['teknologi'], sekutu: ['US'], seteru: ['KP'], nota: 'Masih dalam gencatan senjata dengan Korea Utara sejak 1953.' },
  { k: 'KP', n: 'Korea Utara', wil: 'Asia Timur', blok: [], kdnk: 30, pop: 26, belanja: 4, nuklear: true, ll: [39.0, 125.75], kuat: [], sekutu: ['RU', 'CN'], seteru: ['KR', 'US', 'JP'], nota: 'Program nuklear dan peluru berpandu; perjanjian pertahanan dengan Rusia pada 2024.' },
  { k: 'TW', n: 'Taiwan', wil: 'Asia Timur', blok: [], kdnk: 780, pop: 23, belanja: 17, ll: [25.0, 121.5], kuat: ['teknologi'], sekutu: ['US'], seteru: ['CN'], nota: 'Pengeluar utama cip termaju dunia; ketegangan di Selat Taiwan.' },
  { k: 'IN', n: 'India', wil: 'Asia Selatan', blok: ['BRICS', 'SCO', 'QUAD'], kdnk: 3890, pop: 1440, belanja: 86, nuklear: true, ll: [28.6, 77.2], kuat: ['teknologi'], seteru: ['PK'], tegang: ['CN'], nota: 'Negara paling ramai penduduk; pertempuran rentas sempadan dengan Pakistan pada Mei 2025.' },
  { k: 'PK', n: 'Pakistan', wil: 'Asia Selatan', blok: ['SCO'], kdnk: 370, pop: 245, belanja: 10, nuklear: true, ll: [33.7, 73.1], kuat: [], sekutu: ['CN'], seteru: ['IN'], nota: 'Kuasa nuklear; pertikaian Kashmir dengan India.' },
  { k: 'BD', n: 'Bangladesh', wil: 'Asia Selatan', blok: [], kdnk: 450, pop: 172, belanja: 4, ll: [23.8, 90.4], kuat: [], nota: 'Menampung pelarian Rohingya dari Myanmar.' },
  { k: 'ID', n: 'Indonesia', wil: 'Asia Tenggara', blok: ['ASEAN', 'BRICS'], kdnk: 1400, pop: 281, belanja: 9, ll: [-6.2, 106.8], kuat: ['nadir', 'minyak'], nota: 'Negara ASEAN terbesar; menyertai BRICS pada 2025; pengeluar nikel utama.' },
  { k: 'MY', n: 'Malaysia', wil: 'Asia Tenggara', blok: ['ASEAN'], kdnk: 420, pop: 34, belanja: 4, ll: [3.14, 101.7], kuat: ['minyak', 'teknologi'], nota: 'Berkecuali; menjaga Selat Melaka; tuntutan bertindih di Laut China Selatan.' },
  { k: 'SG', n: 'Singapura', wil: 'Asia Tenggara', blok: ['ASEAN'], kdnk: 550, pop: 6, belanja: 13, ll: [1.35, 103.8], kuat: ['kewangan', 'teknologi'], nota: 'Hab perdagangan dan kewangan dengan angkatan tentera berteknologi tinggi.' },
  { k: 'TH', n: 'Thailand', wil: 'Asia Tenggara', blok: ['ASEAN'], kdnk: 530, pop: 72, belanja: 6, ll: [13.75, 100.5], kuat: [], nota: 'Sekutu perjanjian Amerika Syarikat yang juga rapat dengan China.' },
  { k: 'VN', n: 'Vietnam', wil: 'Asia Tenggara', blok: ['ASEAN'], kdnk: 470, pop: 100, belanja: 7, ll: [21.0, 105.85], kuat: ['nadir'], tegang: ['CN'], nota: 'Tuntutan di Laut China Selatan; hab pembuatan yang berkembang.' },
  { k: 'PH', n: 'Filipina', wil: 'Asia Tenggara', blok: ['ASEAN'], kdnk: 460, pop: 115, belanja: 5, ll: [14.6, 121.0], kuat: ['nadir'], sekutu: ['US', 'JP'], tegang: ['CN'], nota: 'Insiden berulang dengan kapal China di Laut China Selatan.' },
  { k: 'MM', n: 'Myanmar', wil: 'Asia Tenggara', blok: ['ASEAN'], kdnk: 65, pop: 54, belanja: 3, ll: [19.75, 96.1], kuat: ['nadir'], nota: 'Perang saudara sejak rampasan kuasa tentera 2021.' },
  { k: 'BN', n: 'Brunei', wil: 'Asia Tenggara', blok: ['ASEAN'], kdnk: 15, pop: .45, belanja: .5, ll: [4.9, 114.9], kuat: ['minyak'], nota: 'Pengeluar minyak dan gas kecil yang kaya.' },
  { k: 'AU', n: 'Australia', wil: 'Oseania', blok: ['QUAD', 'AUKUS'], kdnk: 1800, pop: 27, belanja: 34, ll: [-35.3, 149.1], kuat: ['nadir', 'minyak'], sekutu: ['US', 'GB', 'JP'], tegang: ['CN'], nota: 'Kapal selam nuklear melalui AUKUS; pengeluar mineral kritikal.' },
  { k: 'NZ', n: 'New Zealand', wil: 'Oseania', blok: [], kdnk: 260, pop: 5.2, belanja: 2, ll: [-41.3, 174.8], kuat: [], sekutu: ['AU'], nota: 'Dasar bebas nuklear.' },
];
const BLOK = {
  NATO: 'Pakatan Atlantik Utara', EU: 'Kesatuan Eropah', G7: 'Kumpulan Tujuh', BRICS: 'BRICS', SCO: 'Pertubuhan Kerjasama Shanghai', CSTO: 'Pertubuhan Perjanjian Keselamatan Kolektif',
  ASEAN: 'ASEAN', QUAD: 'Dialog Keselamatan Segi Empat', AUKUS: 'AUKUS', GCC: 'Majlis Kerjasama Teluk', KA: 'Kesatuan Afrika',
};
const tierNegara = n => n.belanja >= 140 ? 7 : n.belanja >= 60 ? 6 : n.belanja >= 40 ? 5 : n.belanja >= 15 ? 4 : n.belanja >= 6 ? 3 : n.belanja >= 2 ? 2 : 1;

/* Fail Risikan: kad maklumat geopolitik yang terbuka apabila pemain maju */
const HIKAYAT = [
  { k: 'mula', era: 'Doktrin', t: 'Logistik Menang Perang', s: 'Mulakan permainan', p: 'Ungkapan yang kerap dipetik dalam kalangan pegawai tentera: amatur bercakap tentang taktik, profesional bercakap tentang logistik. Bahan api, peluru dan makanan menentukan sejauh mana tentera boleh bergerak.' },
  { k: 'melaka', era: 'Titik sempit', t: 'Selat Melaka', s: 'Markas tahap 2', p: 'Antara laluan perkapalan tersibuk dunia, menghubungkan Lautan Hindi dan Pasifik. Sebahagian besar import minyak China, Jepun dan Korea Selatan melaluinya.' },
  { k: 'hormuz', era: 'Titik sempit', t: 'Selat Hormuz', s: 'Markas tahap 3', p: 'Kira-kira satu perlima minyak dunia melalui selat sempit antara Iran dan Oman. Sebarang gangguan di sini menggoncang harga tenaga global.' },
  { k: 'udara', era: 'Doktrin', t: 'Kuasa Udara', s: 'Bina Pertahanan Udara', p: 'Penguasaan udara membolehkan pasukan darat bergerak dengan selamat. Pertahanan udara berlapis menjadi jawapan negara yang lebih kecil.' },
  { k: 'dron', era: 'Teknologi', t: 'Revolusi Dron', s: 'Latih Dron Serang pertama', p: 'Dron murah mengubah medan perang moden, memaksa tentera membina pertahanan anti-dron dan perang elektronik.' },
  { k: 'nadir', era: 'Sumber', t: 'Unsur Nadir Bumi', s: 'Bina Lombong Unsur Nadir', p: 'Penting untuk magnet motor elektrik, peluru berpandu dan elektronik. China menguasai sebahagian besar pemprosesan unsur nadir dunia.' },
  { k: 'cip', era: 'Teknologi', t: 'Semikonduktor', s: 'Bina Makmal Pertahanan', p: 'Taiwan menghasilkan sebahagian besar cip termaju dunia, manakala mesin litografi termaju dibuat di Belanda. Rantaian bekalan cip menjadi isu keselamatan.' },
  { k: 'nato', era: 'Pakatan', t: 'Perkara 5 NATO', s: 'Bina Pusat Pakatan', p: 'Serangan ke atas satu anggota dianggap serangan ke atas semua. Perkara ini hanya pernah digunakan sekali, selepas serangan 11 September 2001.' },
  { k: 'asean', era: 'Pakatan', t: 'ASEAN', s: 'Menang 3 operasi', p: 'Ditubuhkan pada 1967 di Bangkok. Prinsip tidak campur tangan dan konsensus menjadi teras diplomasi Asia Tenggara.' },
  { k: 'propaganda', era: 'Perang maklumat', t: 'Perang Maklumat', s: 'Lancarkan kempen propaganda', p: 'Naratif mempengaruhi semangat rakyat, sokongan antarabangsa dan kesediaan sekutu membantu. Kepercayaan yang hilang sukar dibina semula.' },
  { k: 'proksi', era: 'Strategi', t: 'Perang Proksi', s: 'Sokong operasi proksi', p: 'Kuasa besar menyokong pihak lain bertempur bagi pihak mereka untuk mengelak konfrontasi langsung. Risikonya: konflik berpanjangan dan senjata jatuh ke tangan yang salah.' },
  { k: 'benderapalsu', era: 'Operasi rahsia', t: 'Operasi Bendera Palsu', s: 'Cuba operasi bendera palsu', p: 'Serangan yang direka supaya kelihatan dilakukan pihak lain. Sejarah menunjukkan banyak yang akhirnya terbongkar dan memusnahkan kredibiliti pelakunya.' },
  { k: 'sekatan', era: 'Ekonomi', t: 'Sekatan Ekonomi', s: 'Imej antarabangsa jatuh bawah 30', p: 'Alat tekanan tanpa peperangan: pembekuan aset, larangan eksport teknologi dan sekatan perbankan. Ia melemahkan ekonomi sasaran secara perlahan.' },
  { k: 'nuklear', era: 'Pencegahan', t: 'Pencegahan Nuklear', s: 'Markas tahap 6', p: 'Sembilan negara dipercayai memiliki senjata nuklear. Logik kemusnahan bersama menjadikan perang langsung antara kuasa nuklear amat berbahaya.' },
  { k: 'lcs', era: 'Titik panas', t: 'Laut China Selatan', s: 'Menang 10 operasi', p: 'Beberapa negara termasuk Malaysia, Filipina, Vietnam, Brunei dan China mempunyai tuntutan bertindih ke atas perairan dan terumbu.' },
  { k: 'suez', era: 'Titik sempit', t: 'Laut Merah & Suez', s: 'Markas tahap 4', p: 'Serangan ke atas kapal di Laut Merah sejak akhir 2023 memaksa banyak kapal mengelilingi Afrika, menambah masa dan kos penghantaran.' },
  { k: 'asimetri', era: 'Doktrin', t: 'Perang Asimetri', s: 'Pertahankan pangkalan 3 kali', p: 'Kekuatan bukan sekadar bilangan kereta kebal. Pasukan kecil yang mengenali medan dan bekalan yang kukuh boleh menyusahkan kuasa yang jauh lebih besar.' },
  { k: 'berkecuali', era: 'Diplomasi', t: 'Imbangan Kuasa', s: 'Selesaikan satu Operasi Bersama pakatan', p: 'Negara kecil dan sederhana sering mengimbangi antara kuasa besar untuk mendapat manfaat ekonomi tanpa terikat kepada satu blok.' },
];

const KUIZ = [
  { s: 'NATO ditubuhkan pada tahun…', p: ['1945', '1949', '1955', '1991'], j: 1 },
  { s: 'Berapakah anggota NATO selepas Sweden menyertai pada 2024?', p: ['28', '30', '32', '35'], j: 2 },
  { s: 'Berapakah anggota tetap Majlis Keselamatan PBB?', p: ['3', '5', '7', '10'], j: 1 },
  { s: 'Yang manakah BUKAN anggota tetap Majlis Keselamatan PBB?', p: ['Perancis', 'China', 'India', 'Rusia'], j: 2 },
  { s: 'Selat Hormuz terletak antara Iran dan…', p: ['Iraq', 'Oman', 'Yaman', 'Pakistan'], j: 1 },
  { s: 'Selat Melaka memisahkan Semenanjung Malaysia dengan…', p: ['Jawa', 'Borneo', 'Sumatera', 'Sulawesi'], j: 2 },
  { s: 'Negara dengan belanja ketenteraan terbesar dunia ialah…', p: ['China', 'Rusia', 'Amerika Syarikat', 'India'], j: 2 },
  { s: 'Huruf asal BRICS mewakili Brazil, Rusia, India, China dan…', p: ['Singapura', 'Afrika Selatan', 'Sepanyol', 'Sweden'], j: 1 },
  { s: 'Perkara 5 NATO hanya pernah digunakan selepas…', p: ['Perang Teluk 1991', 'Serangan 11 September 2001', 'Krisis Crimea 2014', 'Perang Ukraine 2022'], j: 1 },
  { s: 'Negara yang menghasilkan sebahagian besar cip termaju dunia ialah…', p: ['Jerman', 'Taiwan', 'India', 'Brazil'], j: 1 },
  { s: 'Negara yang menguasai pemprosesan unsur nadir bumi dunia ialah…', p: ['Australia', 'Amerika Syarikat', 'China', 'Kanada'], j: 2 },
  { s: 'Anggota QUAD ialah Amerika Syarikat, Jepun, Australia dan…', p: ['India', 'Korea Selatan', 'United Kingdom', 'Filipina'], j: 0 },
  { s: 'AUKUS dianggotai Australia, Amerika Syarikat dan…', p: ['Kanada', 'United Kingdom', 'New Zealand', 'Jepun'], j: 1 },
  { s: 'Gencatan senjata Perang Korea ditandatangani pada tahun…', p: ['1950', '1953', '1961', '1975'], j: 1 },
  { s: 'Terusan Suez menghubungkan Laut Mediterranean dengan…', p: ['Laut Hitam', 'Laut Merah', 'Teluk Parsi', 'Laut Arab'], j: 1 },
  { s: 'ASEAN ditubuhkan pada tahun 1967 di…', p: ['Kuala Lumpur', 'Jakarta', 'Bangkok', 'Manila'], j: 2 },
  { s: 'Berapakah negara yang dipercayai memiliki senjata nuklear?', p: ['5', '7', '9', '12'], j: 2 },
  { s: 'Dalam permainan ini, Radar musuh yang masih berfungsi akan…', p: ['Memulihkan bangunan', 'Menambah jarak tembakan pertahanan', 'Menyembunyikan periuk api', 'Menambah dana'], j: 1 },
  { s: 'Unit udara tidak boleh ditembak oleh…', p: ['Menara Mesingan', 'Pertahanan Udara', 'Artileri', 'Komander'], j: 2 },
  { s: 'Operasi bendera palsu yang terbongkar biasanya menyebabkan…', p: ['Imej antarabangsa naik', 'Kredibiliti hancur dan sekatan', 'Tiada kesan', 'Sekutu bertambah'], j: 1 },
  { s: 'Negara manakah menyertai NATO pada 2023?', p: ['Sweden', 'Finland', 'Austria', 'Ireland'], j: 1 },
  { s: 'Kumpulan G7 TIDAK termasuk…', p: ['Kanada', 'Itali', 'China', 'Jepun'], j: 2 },
  { s: 'Pertubuhan Kerjasama Shanghai (SCO) dipimpin bersama oleh China dan…', p: ['Rusia', 'Jepun', 'Australia', 'Kanada'], j: 0 },
  { s: 'Negara ASEAN yang menyertai BRICS sebagai anggota penuh pada 2025 ialah…', p: ['Malaysia', 'Thailand', 'Indonesia', 'Vietnam'], j: 2 },
];

/* Latihan Lawan (OPFOR): senario rekaan untuk kempen pemain seorang. Semua nama di sini fiksyen. */
const KEMPEN = [
  { n: 'Latihan Pos Hadapan', L: 1, c: 'Latihan pertama menentang pasukan lawan rekaan. Rampas pos sempadan yang dijaga ringan.' },
  { n: 'Kubu Bukit Kelabu', L: 1, c: 'Lawan berkubu di atas bukit dengan dua meriam. Gunakan infantri secara berkumpulan.' },
  { n: 'Depot Sungai Senyap', L: 2, c: 'Depot bahan api lawan. Rampas minyak untuk menampung logistik.' },
  { n: 'Jambatan Besi', L: 2, c: 'Lawan menyekat laluan bekalan di jambatan. Pecahkan tembok dengan Jurutera Tempur.' },
  { n: 'Lapangan Terbang Utara', L: 3, c: 'Radar lawan memanjangkan jarak tembakan. Musnahkan radar dahulu.' },
  { n: 'Pangkalan Tanjung Kabus', L: 3, c: 'Kabus menyembunyikan periuk api. Hantar risikan sebelum mendarat.' },
  { n: 'Kubu Lembah Batu', L: 4, c: 'Pertahanan berlapis dengan pelancar roket. Pancing tembakan dengan kereta kebal.' },
  { n: 'Pusat Komunikasi Gamma', L: 4, c: 'Lumpuhkan pusat komunikasi dengan Perang Elektronik sebelum unit masuk.' },
  { n: 'Benteng Pantai Merah', L: 5, c: 'Pertahanan udara padat. Dron akan musnah jika dihantar terlalu awal.' },
  { n: 'Kompleks Gunung Besi', L: 5, c: 'Kompleks bawah tanah dengan tembok konkrit. Rancang laluan masuk dengan teliti.' },
  { n: 'Ibu Pejabat Lawan', L: 6, c: 'Markas utama pasukan lawan. Selaraskan darat, udara dan taktik.' },
  { n: 'Latihan Akhir: Badai Utara', L: 7, c: 'Ujian terakhir akademi. Kemenangan membuktikan doktrin dan logistik kau.' },
];

/* Lawan dalam mod berbilang pemain: negara rekaan supaya tiada negara sebenar menjadi sasaran serangan. */
const NAMA_LAWAN = ['Republik Varkana', 'Kesatuan Ostrel', 'Federasi Durmont', 'Kerajaan Selvaria', 'Republik Kaltheon', 'Persekutuan Mirengo',
  'Kesultanan Azhurah', 'Republik Tervon', 'Konfederasi Lunaris', 'Negara Bersatu Orvesk', 'Republik Pelagon', 'Federasi Nordhaven'];
const NAMA_KOMANDER = ['Jen. Hakim', 'Lt. Kol. Aisyah', 'Mej. Daniel', 'Kol. Mei Ling', 'Kapt. Arjun', 'Jen. Sofia', 'Mej. Kenji', 'Kol. Amara', 'Lt. Faris', 'Kapt. Elena'];
const NAMA_PUAK = 'Pakatan';

/* Operasi bukan konvensional. Semuanya abstrak: kos, kesan permainan dan risiko terbongkar. */
const OPS = {
  propaganda: { n: 'Kempen Propaganda', kos: { intel: 3, dana: 2000 }, risiko: .12, buka: 2, cd: 300,
    d: 'Naikkan semangat rakyat dan tentera: kerosakan unit +10% untuk 3 operasi seterusnya.',
    bongkar: 'Media antarabangsa mendedahkan kempen itu. Imej −8.', imej: -8 },
  proksi: { n: 'Sokong Pasukan Proksi', kos: { intel: 5, minyak: 3000 }, risiko: .25, buka: 3, cd: 600,
    d: 'Pasukan proksi melemahkan lawan seterusnya: nyawa pertahanan lawan −20% untuk 2 operasi.',
    bongkar: 'Bantuan kepada proksi dikesan. Imej −15 dan ketegangan naik.', imej: -15 },
  benderapalsu: { n: 'Operasi Bendera Palsu', kos: { intel: 8 }, risiko: .45, buka: 4, cd: 900,
    d: 'Cipta alasan perang: operasi seterusnya tidak menaikkan ketegangan dan rampasan +30%.',
    bongkar: 'Operasi terbongkar! Imej −30 dan sekatan ekonomi dikenakan.', imej: -30, sekatan: true },
  diplomasi: { n: 'Misi Diplomatik', kos: { dana: 4000 }, risiko: 0, buka: 2, cd: 600,
    d: 'Pulihkan hubungan: imej +10, ketegangan −20.', imej: 10 },
};

const MISI_JENIS = [
  { k: 'kumpul', t: n => `Kumpul ${fmtN(n)} hasil dari zon industri dan telaga`, n: L => 1500 * L },
  { k: 'menang', t: n => `Menang ${n} operasi`, n: () => 2 },
  { k: 'derma', t: n => `Hantar ${n} unit bantuan kepada sekutu`, n: () => 5 },
  { k: 'latih', t: n => `Latih ${n} unit`, n: L => 15 + 5 * L },
  { k: 'naik', t: n => `Siapkan ${n} naik taraf`, n: () => 2 },
  { k: 'kuiz', t: n => `Jawab ${n} soalan kuiz geopolitik dengan betul`, n: () => 3 },
  { k: 'bintang', t: n => `Dapat ${n} bintang dalam operasi`, n: () => 5 },
  { k: 'ops', t: n => `Jalankan ${n} operasi strategik`, n: () => 2 },
];

const CAPAI = [
  { k: 'naik', n: 'Arkitek Pertahanan', d: 'Siapkan naik taraf', t: [5, 25, 100] },
  { k: 'menang', n: 'Panglima Medan', d: 'Menang operasi', t: [5, 25, 100] },
  { k: 'derma', n: 'Sekutu Setia', d: 'Hantar unit bantuan kepada sekutu', t: [10, 100, 500] },
  { k: 'kumpulDana', n: 'Ekonomi Perang', d: 'Kumpul dana dari zon industri', t: [5000, 100000, 1000000] },
  { k: 'bintang3', n: 'Kemenangan Mutlak', d: 'Operasi tiga bintang', t: [1, 10, 50] },
  { k: 'kuiz', n: 'Penganalisis', d: 'Jawapan kuiz yang betul', t: [5, 30, 100] },
  { k: 'hikayat', n: 'Arkib Risikan', d: 'Buka kad Fail Risikan', t: [5, 12, HIKAYAT.length] },
  { k: 'pertahan', n: 'Benteng Negara', d: 'Berjaya mempertahankan pangkalan', t: [1, 10, 50] },
];
const GANJARAN_CAPAI = [10, 30, 80];

const SEMBANG = {
  salam: ['Salam semua, laporan masuk.', 'Pagi semua, ada operasi hari ni?', 'Baru habis taklimat. Apa cerita?', 'Hadir. Siapa perlukan bantuan?', 'Salam dari markas.'],
  tip: ['Tip: musnahkan Radar dulu, baru pertahanan lawan pendek jaraknya.', 'Jangan hantar dron sebelum Pertahanan Udara lawan lumpuh.',
    'Kereta kebal di depan untuk tarik tembakan, penembak tepat di belakang.', 'Jurutera Tempur kena lepas dekat tembok, kalau jauh habis kena tembak.',
    'Hantar risikan dulu. Periuk api yang nampak boleh dielak.', 'Logistik penting: operasi jauh makan banyak minyak. Pangkalan sekutu berdekatan jimatkan kos.',
    'Pelancar Roket tak boleh tembak jarak dekat. Masuk rapat terus!', 'Bendera palsu memang menggoda, tapi risiko terbongkar tinggi.'],
  bangga: ['Markas aku naik tahap baru!', 'Tiga bintang tadi, operasi bersih!', 'Rampasan besar, depot lawan penuh minyak.', 'Pangkalan aku tahan serangan semalam.'],
  ilmu: ['Tahukah kau? Selat Melaka antara laluan kapal tersibuk dunia.', 'Tahukah kau? ASEAN ditubuhkan di Bangkok pada 1967.',
    'Tahukah kau? Finland dan Sweden menyertai NATO selepas 2022.', 'Tahukah kau? Selat Hormuz laluan kira-kira satu perlima minyak dunia.',
    'Tahukah kau? Majlis Keselamatan PBB ada 5 anggota tetap dengan kuasa veto.'],
  terima: ['Terima kasih {n}!', 'Mantap {n}, bantuan sampai!', 'Diterima, {n}. Terima kasih!', 'Terbaik {n}!'],
};
