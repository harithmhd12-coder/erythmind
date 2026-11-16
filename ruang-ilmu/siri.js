/* Ruang Ilmu · Siri: ilmu yang dihasilkan pemilik (lihat SPEC.md).
   Skrip soal-jawab disalin hampir verbatim. Nama program, nama panel, segmen kempen,
   lajur media dan pautan Drive dibuang mengikut keputusan pemilik.

   SIRI[]    { slug, nama, jenis, ringkas, kategori, episod: [slug] }
             jenis = soal-jawab | senarai-semak | karusel | kuliah | akan-datang
   EPISOD[]  { slug, siri, no, tajuk, tarikh, julat, tag,
               soalan: [{ s, blok: [ {j:'teks', t} | {j:'ayat', ar, maksud, ruj} | {j:'hadis', ar, maksud, ruj} ] }] }
             Hadis dengan ruj kosong dipaparkan sebagai "Rujukan belum dinyatakan". Tiada rujukan direka.
   SEMAK     { [slugSiri]: { pengenalan, item: [{ t, dalil: { ar, maksud, ruj } }] } }
   KARUSEL   { [slugSiri]: { slaid: [{ tajuk, isi, ruj }] } }
   KULIAH[]  Bahan berbentuk artikel Ruang Ilmu biasa, dengan medan siri. */

const SIRI = [
  { slug: 'tadabbur-al-mukminun', nama: 'Tadabbur Surah al-Mukminun', jenis: 'soal-jawab', kategori: 'agama',
    ringkas: 'Soal-jawab tadabbur ayat demi ayat tentang sikap manusia terhadap kebenaran, dan akibatnya.', episod: [] },
  { slug: 'akhlak-dan-adab', nama: 'Akhlak dan Adab', jenis: 'soal-jawab', kategori: 'agama',
    ringkas: 'Malu, muraqabah, kesempurnaan Islam dan adab sesama manusia.', episod: [] },
  { slug: 'kenali-munafik', nama: 'Kenali Munafik', jenis: 'senarai-semak', kategori: 'agama',
    ringkas: 'Tanda-tanda nifaq daripada al-Quran dan sunnah, untuk muhasabah diri.', episod: [] },
  { slug: 'kenali-kebenaran', nama: 'Kenali Kebenaran', jenis: 'karusel', kategori: 'agama',
    ringkas: 'Lima berhala kaum Nuh a.s.: bagaimana penghormatan kepada orang soleh bertukar menjadi sembahan.', episod: [] },
  { slug: 'kuliah-pemikiran', nama: 'Kuliah Pemikiran', jenis: 'kuliah', kategori: 'psikologi',
    ringkas: 'Mata hati tersasar, buaian pemikiran dan lima kunci fikiran.', episod: [] },
  { slug: 'sip-n-speak', nama: 'Sip n Speak', jenis: 'akan-datang', kategori: 'kehidupan',
    ringkas: 'Bual santai bersama kopi. Episod pertama sedang disediakan.', episod: [] }
];

const EPISOD = [];
const SEMAK = {};
const KARUSEL = {};
const KULIAH = [];
