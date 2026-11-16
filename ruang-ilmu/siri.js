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

const EPISOD = [
  { slug: 'benci-kepada-kebenaran', siri: 'tadabbur-al-mukminun', tarikh: '2026-09-23', julat: 'Ayat 68–71', tajuk: 'Benci kepada Kebenaran', tag: ['tadabbur', 'al-Mukminun', 'kebenaran'],
    soalan: [
      { s: 'Apakah teguran Allah SWT terhadap sikap kaum musyrikin Quraisy yang tidak mahu mengakui bahawa mereka sebenarnya amat mengenali Rasul mereka sendiri?', blok: [
        { j: 'teks', t: 'Firman Allah SWT:' },
        { j: 'ayat', ar: 'أَفَلَمْ يَدَّبَّرُوا الْقَوْلَ أَمْ جَاءَهُم مَّا لَمْ يَأْتِ آبَاءَهُمُ الْأَوَّلِينَ', maksud: 'Mengapakah mereka tidak mahu merenung dan memikirkan (kandungan) Al-Quran itu? Atau adakah telah datang kepada mereka sesuatu yang tidak pernah datang kepada nenek moyang mereka yang terdahulu?', ruj: 'Surah al-Mukminun, ayat 68' },
        { j: 'teks', t: 'Perkataan "يَدَّبَّرُوا" (tadabbur) membawa maksud merenung dan memikirkan sesuatu perkara sehingga memahaminya, bukan sekadar mendengar secara sambil lewa. Teguran ini menunjukkan bahawa sekiranya mereka benar-benar mentadabbur kandungan Al-Quran secara jujur dan rela, nescaya mereka akan menemui kebenaran serta keindahan kandungannya. Ayat ini turut menepis alasan bahawa mereka menolak kerana risalah ini adalah sesuatu yang asing, meskipun seruan tauhid dan kisah para Rasul telahpun dikenali sejak zaman Nabi Ibrahim AS lagi. Firman Allah SWT:' },
        { j: 'ayat', ar: 'أَمْ لَمْ يَعْرِفُوا رَسُولَهُمْ فَهُمْ لَهُ مُنكِرُونَ', maksud: 'Atau kerana mereka tidak mengenali Rasul mereka, lalu kerana itu mereka mengingkarinya?', ruj: 'Surah al-Mukminun, ayat 69' },
        { j: 'teks', t: 'Pertikaian kaum musyrik ini retorik, sebenarnya mereka sememangnya amat mengenali peribadi Nabi Muhammad SAW sejak baginda kecil lagi, sama ada dari sudut nasab keturunan, sifat amanah, kejujuran, mahupun akhlaknya yang mulia sehingga digelar "Al-Amin" oleh kaum Quraisy sendiri sebelum baginda dilantik menjadi Rasul. Justeru, pengingkaran mereka berpunca dari kesombongan dan kepentingan duniawi semata-mata.' },
        { j: 'teks', t: 'Golongan Ahli Kitab juga turut mengenali kebenaran risalah Nabi Muhammad SAW dengan sangat jelas, namun sebahagian mereka sengaja menyembunyikannya kerana hasad dengki dan kepentingan peribadi. Kejujuran hati dalam menerima kebenaran adalah lebih utama berbanding sekadar mengenali atau mengetahuinya semata-mata. Firman Allah SWT:' },
        { j: 'ayat', ar: 'الَّذِينَ آتَيْنَاهُمُ الْكِتَابَ يَعْرِفُونَهُ كَمَا يَعْرِفُونَ أَبْنَاءَهُمْ وَإِنَّ فَرِيقًا مِّنْهُمْ لَيَكْتُمُونَ الْحَقَّ وَهُمْ يَعْلَمُونَ', maksud: 'Orang-orang yang telah Kami berikan Kitab kepada mereka, mengenalinya (Rasulullah) sebagaimana mereka mengenali anak-anak mereka sendiri, dan sesungguhnya segolongan daripada mereka sememangnya menyembunyikan kebenaran itu sedangkan mereka mengetahuinya.', ruj: 'Surah al-Baqarah, ayat 146' }
      ]},
      { s: 'Mengapakah tuduhan gila yang dilemparkan kepada Nabi Muhammad SAW ditangkis sepenuhnya oleh Allah SWT?', blok: [
        { j: 'teks', t: 'Firman Allah SWT:' },
        { j: 'ayat', ar: 'أَمْ يَقُولُونَ بِهِ جِنَّةٌ ۚ بَلْ جَاءَهُم بِالْحَقِّ وَأَكْثَرُهُمْ لِلْحَقِّ كَارِهُونَ', maksud: 'Atau adakah mereka mengatakan: Padanya ada penyakit gila? (Tidak!) Bahkan dia telah membawa kepada mereka kebenaran, tetapi kebanyakan mereka benci kepada kebenaran itu.', ruj: 'Surah al-Mukminun, ayat 70' },
        { j: 'teks', t: 'Allah SWT menolak sekeras-kerasnya tuduhan gila yang dilemparkan kaum musyrikin, kerana pada hakikatnya apa yang dibawa oleh Nabi Muhammad SAW ialah kebenaran yang jelas dan tersusun, bukan igauan seorang yang tidak siuman. Ayat ini turut mendedahkan punca sebenar penentangan mereka, iaitu bukan kerana kekurangan hujah atau bukti, tetapi kerana hati mereka telah dipenuhi kebencian terhadap kebenaran itu sendiri, sehingga walau apa jua dalil dikemukakan, mereka tetap enggan menerimanya. Firman Allah SWT:' },
        { j: 'ayat', ar: 'وَلَوِ اتَّبَعَ الْحَقُّ أَهْوَاءَهُمْ لَفَسَدَتِ السَّمَاوَاتُ وَالْأَرْضُ وَمَن فِيهِنَّ ۚ بَلْ أَتَيْنَاهُم بِذِكْرِهِمْ فَهُمْ عَن ذِكْرِهِم مُّعْرِضُونَ', maksud: 'Dan sekiranya kebenaran itu menurut hawa nafsu mereka, nescaya rosak binasalah langit dan bumi serta segala yang ada padanya. (Tidak sedemikian) bahkan Kami telah mendatangkan kepada mereka peringatan (Al-Quran) yang menjadi kemuliaan bagi mereka sendiri, namun mereka tetap berpaling daripada peringatan itu.', ruj: 'Surah al-Mukminun, ayat 71' },
        { j: 'teks', t: 'Ayat ini juga menjelaskan bahawa kebenaran bersifat tetap dan mutlak, tidak boleh diubah mengikut citarasa atau kehendak hawa nafsu manusia. Sekiranya kebenaran ini tunduk kepada kehendak hawa nafsu setiap individu yang berbeza-beza, nescaya berlaku kerosakan dan kekacauan yang amat besar di langit dan di bumi. Sebaliknya, Al-Quran yang diturunkan itu panduan mutlak untuk manusia mengukur kebenaran. Firman Allah SWT:' },
        { j: 'ayat', ar: 'وَمَنْ أَضَلُّ مِمَّنِ اتَّبَعَ هَوَاهُ بِغَيْرِ هُدًى مِّنَ اللَّهِ ۚ إِنَّ اللَّهَ لَا يَهْدِي الْقَوْمَ الظَّالِمِينَ', maksud: '...dan siapakah yang lebih sesat daripada orang yang menurut hawa nafsunya dengan tidak berdasarkan sebarang petunjuk dari Allah? Sesungguhnya Allah tidak memberi petunjuk kepada kaum yang zalim.', ruj: 'Surah al-Qasas, ayat 50' }
      ]}
    ]}
];
const SEMAK = {};
const KARUSEL = {};
const KULIAH = [];
