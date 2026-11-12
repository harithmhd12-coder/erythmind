/* Tuntas · data tetap: kelas tugasan, senarai tugasan asal, emosi, kebiasaan minimalis dan peringatan. */
'use strict';

/* Kelas tugasan ikut berat kerja. Setiap kelas membawa model Claude yang sesuai,
   panjang satu blok fokus dan rehat antara blok. Susunan ini juga susunan kerja wajib:
   yang berat dahulu. */
const KELAS = {
  berat:    { nama: 'Berat',    model: 'Fable 5.2',  blok: 90, rehat: 15, mata: 3, ringkas: 'Kerja berat dan terbuka' },
  harian:   { nama: 'Harian',   model: 'Opus 5.5',   blok: 50, rehat: 10, mata: 2, ringkas: 'Model harian' },
  ringan:   { nama: 'Ringan',   model: 'Sonnet 5.5', blok: 25, rehat: 5,  mata: 1, ringkas: 'Kerja ringan dan berulang' },
  automasi: { nama: 'Automasi', model: 'Haiku 5.5',  blok: 15, rehat: 5,  mata: 1, ringkas: 'Jarang, hanya automasi' }
};
const SUSUNAN_KELAS = ['berat', 'harian', 'ringan', 'automasi'];

const TUGASAN_ASAL = [
  ['berat', 'Penyelidikan "negara Islam" dalam fiqh klasik'],
  ['berat', 'Penyusunan buku hutang dan nazar'],
  ['berat', 'Kertas kerja BRI dengan JMNS'],
  ['berat', 'Perundingan Syariah: wakalah bil ujrah, wakaf, infaq, zakat'],
  ['berat', 'Soalan agama yang isunya baharu atau khilaf'],
  ['harian', 'Soal-jawab Assalam Subuh, Duha & Tahajjud (rujukan Shamela)'],
  ['harian', 'Skrip Tanyalah Ustaz TV3/TV9'],
  ['harian', 'Nota kuliah masjid dan syarah kitab'],
  ['harian', 'Artikel harian Facebook (ghazw fikri)'],
  ['harian', 'Kapsul Tahajud'],
  ['harian', 'Video motion grafik'],
  ['harian', 'Game kuiz murid dan dashboard guru'],
  ['ringan', 'Karusel Instagram siri "Kenali ..."'],
  ['ringan', 'Caption, poster dan slaid ikut templat'],
  ['ringan', "Sip 'n Go Coffee: kandungan, harga, promosi"],
  ['ringan', "Sip n Speak"],
  ['ringan', 'Affiliate dan Amway'],
  ['ringan', 'WIP dan KPI'],
  ['ringan', 'Emel, mesej, tukar format, baiki dokumen kecil'],
  ['automasi', 'Kerja pukal: tag, susun, tukar format fail'],
  ['automasi', 'Enjin soalan kuiz melalui API']
];

/* Emosi. Setiap emosi negatif membawa satu intervensi wajib sebelum blok fokus bermula.
   Perasaan diakui; kerja tetap jalan. */
const EMOSI = {
  tenang:      { label: 'Tenang',      nada: 'positif', ikon: '◯' },
  bersemangat: { label: 'Bersemangat', nada: 'positif', ikon: '△' },
  syukur:      { label: 'Syukur',      nada: 'positif', ikon: '✧' },
  yakin:       { label: 'Yakin',       nada: 'positif', ikon: '▲' },
  letih:       { label: 'Letih',       nada: 'negatif', ikon: '▽', iv: 'rehatAktif' },
  malas:       { label: 'Malas',       nada: 'negatif', ikon: '—', iv: 'duaMinit' },
  cemas:       { label: 'Cemas',       nada: 'negatif', ikon: '≈', iv: 'nafas' },
  terbeban:    { label: 'Terbeban',    nada: 'negatif', ikon: '▦', iv: 'pecahkan' },
  bosan:       { label: 'Bosan',       nada: 'negatif', ikon: '…', iv: 'makna' },
  kecewa:      { label: 'Kecewa',      nada: 'negatif', ikon: '↓', iv: 'lepaskan' },
  sedih:       { label: 'Sedih',       nada: 'negatif', ikon: '◡', iv: 'lepaskan' },
  marah:       { label: 'Marah',       nada: 'negatif', ikon: '✕', iv: 'sejukkan' }
};

/* Intervensi: jenis 'masa' memaksa kiraan detik; jenis 'tulis' memaksa satu ayat jujur. */
const INTERVENSI = {
  nafas:      { tajuk: 'Pernafasan kotak', jenis: 'masa', saat: 64, arahan: 'Tarik 4 saat. Tahan 4. Hembus 4. Tahan 4. Ulang sehingga kiraan tamat. Cemas mengecil apabila badan perlahan.' },
  sejukkan:   { tajuk: 'Sejukkan dahulu', jenis: 'masa', saat: 60, arahan: 'Duduk. Bahu turun. Hembus lebih panjang daripada tarik. Jika boleh, ambil wuduk. Marah bukan bahan bakar kerja yang teliti.' },
  rehatAktif: { tajuk: 'Rehat aktif 2 minit', jenis: 'masa', saat: 120, arahan: 'Bangun. Minum segelas air. Regang leher dan belakang. Basuh muka. Letih diurus, bukan dijadikan alasan.' },
  duaMinit:   { tajuk: 'Peraturan 2 minit', jenis: 'tulis', soalan: 'Tulis langkah pertama yang boleh dibuat dalam 2 minit.', contoh: 'Buka fail dan tulis tajuk bahagian 1', arahan: 'Malas hilang selepas bermula, bukan sebelum. Kau hanya perlu mula. Jam tetap berjalan untuk blok penuh.' },
  pecahkan:   { tajuk: 'Pecahkan', jenis: 'tulis', soalan: 'Tulis satu langkah terkecil. Satu sahaja.', contoh: 'Senaraikan 3 rujukan utama', arahan: 'Terbeban bermaksud kau sedang memikul semuanya serentak. Pikul satu.' },
  makna:      { tajuk: 'Kembali kepada niat', jenis: 'tulis', soalan: 'Kenapa kerja ini penting? Siapa yang mendapat manfaat?', contoh: 'Jemaah perlukan jawapan yang tepat', arahan: 'Bosan muncul apabila kerja terputus daripada maknanya. Sambungkan semula.' },
  lepaskan:   { tajuk: 'Lepaskan', jenis: 'tulis', soalan: 'Tulis satu ayat tentang apa yang memberatkan hati. Kemudian letak di sini.', contoh: 'Aku kecewa draf semalam ditolak', arahan: 'Fa inna maʿa al-ʿusri yusra. Bersama kesulitan ada kemudahan. Hati ditulis, tangan bekerja.' }
};

/* Kebiasaan minimalis harian. Had lima: minimalis juga terpakai pada senarai kebiasaan. */
const KEBIASAAN_ASAL = [
  'Satu barang keluar (buang, sedekah atau jual)',
  'Tiada belian di luar senarai',
  'Media sosial 30 minit atau kurang',
  'Meja dan skrin desktop bersih sebelum tidur',
  'Telefon diletak jauh selepas 10:30 malam'
];

const DORONGAN = ['Telefon / media sosial', 'Makan / snek', 'Mengantuk', 'Kerja lain', 'Fikiran risau', 'Lain-lain'];

/* Peringatan. Teks Arab dan rujukan disemak; terjemahan ringkas. */
const PERINGATAN = [
  { ar: 'وَالْعَصْرِ ﴿١﴾ إِنَّ الْإِنسَانَ لَفِي خُسْرٍ ﴿٢﴾ إِلَّا الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ وَتَوَاصَوْا بِالْحَقِّ وَتَوَاصَوْا بِالصَّبْرِ ﴿٣﴾',
    ms: 'Demi masa. Sesungguhnya manusia dalam kerugian, kecuali yang beriman, beramal soleh, berpesan dengan kebenaran dan berpesan dengan kesabaran.', rj: 'al-ʿAṣr 103:1–3' },
  { ar: 'فَإِذَا فَرَغْتَ فَانصَبْ',
    ms: 'Apabila engkau selesai daripada satu urusan, teruslah bersungguh-sungguh dengan urusan berikutnya.', rj: 'al-Insyirāḥ 94:7' },
  { ar: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا ﴿٥﴾ إِنَّ مَعَ الْعُسْرِ يُسْرًا ﴿٦﴾',
    ms: 'Sesungguhnya bersama kesulitan ada kemudahan. Sesungguhnya bersama kesulitan ada kemudahan.', rj: 'al-Insyirāḥ 94:5–6' },
  { ar: 'نِعْمَتَانِ مَغْبُونٌ فِيهِمَا كَثِيرٌ مِنَ النَّاسِ: الصِّحَّةُ وَالْفَرَاغُ',
    ms: 'Dua nikmat yang ramai manusia tertipu padanya: kesihatan dan masa lapang.', rj: 'Riwayat al-Bukhārī' },
  { ar: 'أَحَبُّ الْأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ',
    ms: 'Amalan yang paling disukai Allah ialah yang berterusan walaupun sedikit.', rj: 'Riwayat al-Bukhārī dan Muslim' },
  { ar: 'إِنَّ اللَّهَ يُحِبُّ إِذَا عَمِلَ أَحَدُكُمْ عَمَلًا أَنْ يُتْقِنَهُ',
    ms: 'Allah suka apabila seseorang daripada kamu melakukan satu kerja, dia melakukannya dengan teliti.', rj: 'Riwayat al-Ṭabarānī dan al-Bayhaqī' },
  { ar: '',
    ms: 'Kau tidak naik ke tahap matlamat. Kau jatuh ke tahap sistem kau.', rj: 'James Clear, Atomic Habits' }
];

/* Murabbi: penjaga disiplin. Wajahnya berubah ikut keadaan kau. */
const MURABBI = {
  bangga:  ['Istiqamah kau nampak. Jangan berhenti sekarang.', 'Ini rupa disiplin. Kekalkan.', 'Sistem kau sedang bekerja. Teruskan.'],
  gembira: ['Semua ikrar ditunaikan. Tutup hari dengan muhasabah.', 'Siap. Itu yang dijanjikan, itu yang dibuat.'],
  tenang:  ['Satu tugasan. Satu blok. Mula.', 'Jangan fikir semua. Fikir yang di depan mata.', 'Kerja yang dimulakan perlu disiapkan.'],
  risau:   ['Masa berjalan. Ikrar belum dibuat.', 'Hari belum ditutup. Muhasabah menunggu.'],
  tegas:   ['Kau keluar dari fokus. Dicatat. Kembali.', 'Ikrar lewat. Disiplin bermula sebelum kerja bermula.', 'Tiada tugasan baharu sebelum yang ini siap.'],
  kecewa:  ['Ada hutang kerja semalam. Bayar dahulu.', 'Semalam gagal. Hari ini bukan untuk mengulanginya.']
};

const HARI = ['Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu'];
const BULAN = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'];
