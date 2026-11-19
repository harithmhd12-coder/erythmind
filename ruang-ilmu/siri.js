/* Ruang Ilmu · Siri: ilmu yang dihasilkan pemilik (lihat SPEC.md).
   Skrip soal-jawab disalin hampir verbatim. Nama program, nama panel, segmen kempen,
   lajur media dan pautan Drive dibuang mengikut keputusan pemilik.

   SIRI[]    { slug, nama, jenis, ringkas, kategori, episod: [slug] }
             jenis = soal-jawab | senarai-semak | karusel | kuliah | akan-datang
   EPISOD[]  Episod bertarikh hadapan disembunyikan sehingga tarikhnya tiba.
             { slug, siri, no, tajuk, tarikh, julat, tag,
               soalan: [{ s, blok: [ {j:'teks', t} | {j:'ayat', ar, maksud, ruj} | {j:'hadis', ar, maksud, ruj} | {j:'petikan', ar, maksud, ruj} ] }] }
             petikan = petikan kitab tafsir atau syarah (bukan ayat atau hadis).
             Hadis dengan ruj kosong dipaparkan sebagai "Rujukan belum dinyatakan". Tiada rujukan direka.
   SEMAK     { [slugSiri]: { kitab, pengenalan: [p], kumpulan: [{ tajuk, item: [{ t, hlm, dalil?: { j, ar, maksud, ruj } }] }], doa } }
   KARUSEL   { [slugSiri]: { tajuk, slaid: [{ label, tajuk, besar?, ar?, maksud?, ruj?, isi?: [p], nama?: [[ar, latin]], butir?: [[k, v]], langkah?: [p], alur?: [p], nota?: [tajuk, teks], petik?, ruj2? }] } }
   Kuliah    Disimpan sebagai EPISOD dengan siri kuliah-pemikiran; soalan.label = "Sebab N" atau "Amalan", tarikh kosong.
             Sumber luar: luar { tajuk, sesi, penceramah, saluran, url, nota }, soalan[].mula (saat), dakwaan [{ t, j, mula, oleh?: 'moderator' }], bacaan [teks], kategori? (menggantikan kategori siri). */

const SIRI = [
  { slug: 'tadabbur-al-mukminun', nama: 'Tadabbur Surah al-Mukminun', jenis: 'soal-jawab', kategori: 'agama',
    ringkas: 'Soal-jawab tadabbur ayat demi ayat tentang sikap manusia terhadap kebenaran, dan akibatnya.', episod: [] },
  { slug: 'akhlak-dan-adab', nama: 'Akhlak dan Adab', jenis: 'soal-jawab', kategori: 'agama',
    ringkas: 'Malu, muraqabah, kesempurnaan Islam dan adab sesama manusia.', episod: [] },
  { slug: 'kenali-munafik', nama: 'Kenali Munafik', jenis: 'senarai-semak', kategori: 'agama',
    ringkas: 'Tanda-tanda nifaq daripada al-Quran dan sunnah, untuk muhasabah diri.', episod: [] },
  { slug: 'kenali-kebenaran', nama: 'Kenali Kebenaran', jenis: 'karusel', kategori: 'agama',
    ringkas: 'Lima berhala kaum Nuh a.s.: bagaimana penghormatan kepada orang soleh bertukar menjadi sembahan.', episod: [] },
  { slug: 'kuliah-pemikiran', nama: 'Kuliah Pemikiran', jenis: 'kuliah', kategori: 'psikologi', unit: ['Kuliah', 'bahagian'],
    ringkas: "Sebelas sebab mata hati tersasar menurut al-Maydani (Basa'ir li al-Muslim al-Mu'asir, Fasal 4) dalam tiga kuliah, kuliah tentang kapitalisme kolonial dan bacaan Mitos Peribumi Malas karya Syed Hussein Alatas.", episod: [] },
  { slug: 'sip-n-speak', nama: 'Sip n Speak', jenis: 'akan-datang', kategori: 'kehidupan',
    ringkas: 'Bual santai bersama kopi. Episod pertama sedang disediakan.', episod: [] }
];

const EPISOD = [
  { slug: 'interaksi-sesama-manusia', siri: 'akhlak-dan-adab', tarikh: '2026-08-04', tajuk: 'Interaksi Sesama Manusia', tag: ['akhlak', 'adab', 'sahabat', 'jiran'],
    soalan: [
      { s: 'Mengapakah Islam menitikberatkan soal memilih rakan?', blok: [
        { j: 'teks', t: 'Islam sangat menitikberatkan soal memilih rakan kerana pengaruh persekitaran memainkan peranan yang amat penting dalam membentuk akhlak seseorang, sehinggakan tindakan menjauhi rakan-rakan yang buruk itu dikira sebagai sebahagian daripada kesempurnaan taubat. Rakan yang baik akan sentiasa membawa aura positif dan manfaat, manakala rakan yang buruk hanya akan mendedahkan kita kepada pelbagai bentuk keburukan.' },
        { j: 'teks', t: 'Kepentingan memilih rakan ini telah dijelaskan dengan sangat indah melalui dalil sabda Nabi SAW berdasarkan riwayat Al-Bukhari dan Muslim:' },
        { j: 'hadis', ar: 'إِنَّمَا مَثَلُ جَلِيسِ الصَّالِحِ وَجَلِيسِ السُّوءِ كَحَامِلِ الْمِسْكِ وَنَافِخِ الْكِيرِ، حَامِلُ الْمِسْكِ إِمَّا أَنْ يُحْذِيَكَ، وَإِمَّا أَنْ تَبْتَاعَ مِنْهُ، وَإِمَّا أَنْ تَجِدَ مِنْهُ رِيحًا طَيِّبَةً، وَنَافِخُ الْكِيرِ إِمَّا أَنْ يُحْرِقَ ثِيَابَكَ، وَإِمَّا أَنْ تَجِدَ مِنْهُ رِيحًا خَبِيثَةً', maksud: '', ruj: 'HR al-Bukhari dan Muslim' },
        { j: 'teks', t: 'Berdasarkan hadis tersebut, baginda SAW mengumpamakan rakan yang soleh seperti pembawa minyak wangi kasturi; di mana kita pasti akan mendapat kebaikan, sama ada dia memberikannya kepada kita, kita membelinya daripada dia, atau sekurang-kurangnya kita akan mendapat tempias bau yang harum. Sebaliknya, rakan yang buruk pula diumpamakan seperti peniup api tukang besi; di mana kehadirannya mendatangkan kesan negatif, sama ada percikan apinya akan membakar pakaian kita, atau sekurang-kurangnya kita akan terpalit dengan bau yang busuk daripadanya.' }
      ]},
      { s: 'Bagaimanakah Islam mengajar cara untuk bersosial sesama manusia?', blok: [
        { j: 'teks', t: 'Islam mengajar umatnya agar membina asas pergaulan dan sosial yang menjamin keharmonian serta keselamatan orang lain. Asas ini menuntut setiap Muslim untuk sentiasa menjaga tingkah laku dan tutur kata agar tidak menyakiti orang sekeliling, sebagaimana sabda Nabi SAW:' },
        { j: 'hadis', ar: 'الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ', maksud: 'Seorang Muslim yang sebenar itu adalah mereka yang orang Islam lain terselamat daripada keburukan lidah dan tangannya.', ruj: '' },
        { j: 'teks', t: 'Apabila bersosial di tempat awam seperti jalanan atau tempat berkumpul, Islam menetapkan adab-adab dan tanggungjawab moral yang perlu dipatuhi bagi memelihara hak masyarakat awam. Hal ini dijelaskan oleh Rasulullah SAW apabila para sahabat ingin duduk berbual di jalanan, menerusi sabdanya:' },
        { j: 'hadis', ar: 'إِذَا أَبَيْتُمْ إِلَّا الْمَجْلِسَ فَأَعْطُوا الطَّرِيقَ حَقَّهُ... غَضُّ الْبَصَرِ، وَكَفُّ الْأَذَى، وَرَدُّ السَّلَامِ، وَالْأَمْرُ بِالْمَعْرُوفِ، وَالنَّهْيُ عَنِ الْمُنْكَرِ', maksud: 'Jika kamu enggan melainkan tetap mahu duduk-duduk di situ, maka berikanlah jalan itu haknya, iaitu menundukkan pandangan, menahan diri daripada menyakiti, menjawab salam, menyuruh kepada kebaikan, dan mencegah kemungkaran.', ruj: 'HR Abu Daud, 4815' },
        { j: 'teks', t: 'Selain itu, etika bersosial dalam konteks yang lebih rapat seperti jiran tetangga dan tetamu juga dikaitkan secara langsung dengan kesempurnaan iman kepada Allah dan hari akhirat. Baginda SAW memberikan panduan yang sangat jelas agar kita sentiasa berbuat baik dan menjaga lisan melalui sabdanya:' },
        { j: 'hadis', ar: 'مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيُكْرِمْ ضَيْفَهُ، وَمَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيُحْسِنْ إِلَى جَارِهِ، وَمَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ', maksud: 'Sesiapa yang beriman kepada Allah dan hari akhirat, maka hendaklah dia memuliakan tetamunya. Dan sesiapa yang beriman kepada Allah dan hari akhirat, maka hendaklah dia berbuat baik kepada jirannya. Dan sesiapa yang beriman kepada Allah dan hari akhirat, maka hendaklah dia berkata yang baik atau diam.', ruj: 'HR Bukhari, 6018' }
      ]}
    ]},
  { slug: 'kesempurnaan-islam', siri: 'akhlak-dan-adab', tarikh: '2026-08-11', tajuk: 'Kesempurnaan Islam', tag: ['akhlak', 'adab', 'khusyuk', 'masa'],
    soalan: [
      { s: 'Bagaimana Islam mengajar cara menghindari gangguan dalam beribadah?', blok: [
        { j: 'teks', t: 'Islam mengajar umatnya untuk membina kesedaran mental bahawa segala urusan duniawi selain Allah SWT adalah sia-sia agar hati lebih fokus dan tidak melayang ketika beribadah. Asas ini bersandarkan kepada sabda Rasulullah SAW yang membenarkan bait syair penyair Arab:' },
        { j: 'hadis', ar: 'أَلَا كُلُّ شَيْءٍ مَا خَلَا اللَّهَ بَاطِلُ', maksud: 'Ketahuilah, setiap sesuatu selain Allah itu adalah batil.', ruj: '' },
        { j: 'teks', t: 'Ini sebagai peringatan agar kebesaran Allah sahaja yang hadir di dalam hati.' },
        { j: 'teks', t: 'Dari sudut tindakan fizikal pula, Islam menuntut kita menyingkirkan atau menjauhi sebarang objek yang berpotensi menarik perhatian mata dan mengganggu tumpuan. Hal ini dicontohkan secara praktikal oleh Rasulullah SAW apabila baginda menukarkan pakaian bersulam (khamisah) yang dipakainya kepada pakaian tebal yang tidak bercorak (anbijaniyyah) demi menjaga kualiti dan fokus ibadahnya.' },
        { j: 'teks', t: 'Tindakan baginda itu dilakukan semata-mata untuk menutup ruang kelalaian pandangan dengan serta-merta ketika sedang bermunajat. Ia dijelaskan menerusi sabda baginda:' },
        { j: 'hadis', ar: 'إِنِّي كُنْتُ أَنْظُرُ إِلَى عَلَمِهَا فِي الصَّلَاةِ', maksud: 'Sesungguhnya aku terpandang pada coraknya ketika di dalam solat.', ruj: '' },
        { j: 'teks', t: 'Kemudian ditegaskan lagi kemudaratan hal tersebut dalam riwayat lain:' },
        { j: 'hadis', ar: 'فَإِنَّهَا أَلْهَتْنِي فِي صَلَاتِي', maksud: 'Maka sesungguhnya ia telah melalaikan aku dalam solatku.', ruj: '' }
      ]},
      { s: 'Apakah ciri kesempurnaan Islam seseorang?', blok: [
        { j: 'teks', t: 'Ciri utama kesempurnaan dan kebaikan Islam seseorang individu terletak pada kebijaksanaannya dalam menguruskan masa serta perhatiannya. Hal ini dapat dicapai apabila seseorang Muslim itu mengambil langkah untuk meninggalkan apa jua urusan, perkataan, atau perbuatan yang tidak mendatangkan manfaat (sia-sia) kepada dirinya, baik dari sudut dunia mahupun akhirat.' },
        { j: 'teks', t: 'Prinsip ini merupakan satu panduan kukuh yang telah ditetapkan oleh baginda Nabi SAW. Terdapat pelbagai jalur periwayatan bagi hadis ini, antaranya melalui Abu Hurairah RA dan riwayat sahih secara mursal daripada Ali bin Al-Husain, di mana Rasulullah SAW telah bersabda:' },
        { j: 'hadis', ar: 'مِنْ حُسْنِ إِسْلَامِ الْمَرْءِ تَرْكُهُ مَا لَا يَعْنِيهِ', maksud: 'Sebahagian daripada kebaikan keislaman seseorang itu adalah dia meninggalkan apa yang tidak bermanfaat baginya.', ruj: '' },
        { j: 'teks', t: 'Oleh itu, tindakan mengelakkan diri daripada mencampuri perkara yang melalaikan bukan sahaja menjaga kualiti iman seseorang, malah ia merupakan bukti nyata akan keelokan dan kesempurnaan pegangan agamanya.' }
      ]}
    ]},
  { slug: 'muraqabah', siri: 'akhlak-dan-adab', tarikh: '2026-08-18', tajuk: 'Muraqabah', tag: ['akhlak', 'adab', 'ihsan', 'muraqabah'],
    soalan: [
      { s: 'Apakah yang dimaksudkan dengan konsep Ihsan, dan bagaimanakah ia membentuk sikap sentiasa muraqabah dalam diri seorang hamba ketika beribadah?', blok: [
        { j: 'teks', t: 'Konsep Ihsan merujuk kepada tahap penghayatan kerohanian tertinggi di mana seorang hamba menyembah dan beribadah kepada Allah SWT seolah-olah dia sedang melihat-Nya secara langsung di hadapannya. Sekiranya dia tidak mampu mencapai tahap kepekaan spiritual tersebut, dia wajib menanamkan keyakinan yang teguh bahawa Allah SWT sentiasa melihat, memantau, dan menyedari setiap gerak-gerinya.' },
        { j: 'teks', t: 'Penghayatan inilah yang secara langsung membentuk sikap muraqabah (rasa sentiasa diawasi) dalam diri seorang hamba. Apabila seseorang sentiasa sedar bahawa pemerhatian Allah tidak pernah luput daripadanya, hatinya akan terdorong untuk beribadah dengan penuh ikhlas, khusyuk, dan berwaspada daripada melakukan maksiat atau kecuaian, kerana dia tahu tiada apa yang tersembunyi daripada pandangan pencipta-Nya.' },
        { j: 'teks', t: 'Konsep dan asas penting ini dijelaskan dengan jelas melalui sabda Rasulullah SAW ketika menjawab pertanyaan mengenai Ihsan dalam hadis Jibril yang masyhur:' },
        { j: 'hadis', ar: 'الْإِحْسَانُ أَنْ تَعْبُدَ اللَّهَ كَأَنَّكَ تَرَاهُ، فَإِنْ لَمْ تَكُنْ تَرَاهُ فَإِنَّهُ يَرَاكَ', maksud: 'Ihsan itu adalah engkau menyembah Allah seolah-olah engkau melihat-Nya, maka sekiranya engkau tidak dapat melihat-Nya, maka ketahuilah bahawa sesungguhnya Dia melihatmu.', ruj: 'HR Bukhari, 50' }
      ]},
      { s: 'Apakah tahap keimanan yang paling tinggi bagi seseorang?', blok: [
        { j: 'teks', t: 'Tahap keimanan yang paling afdal atau utama bagi seseorang hamba adalah apabila dia memiliki kesedaran dan keyakinan mutlak bahawa Allah SWT sentiasa bersamanya walau di mana jua dia berada. Perasaan ini merupakan teras kepada amalan muraqabah yang menuntut seseorang untuk sentiasa merasai pengawasan Allah dalam setiap tindakan dan tingkah lakunya.' },
        { j: 'teks', t: 'Keutamaan mencapai tahap keimanan tertinggi ini telah ditegaskan secara langsung oleh Rasulullah SAW. Perkara ini dibuktikan menerusi sebuah hadis yang diriwayatkan daripada \'Ubadah bin al-Samit RA, di mana baginda telah bersabda:' },
        { j: 'hadis', ar: 'أَفْضَلُ الْإِيمَانِ أَنْ تَعْلَمَ أَنَّ اللَّهَ مَعَكَ حَيْثُمَا كُنْتَ', maksud: 'Sebaik-baik iman ialah engkau mengetahui bahawa Allah sentiasa bersamamu walau di mana jua engkau berada.', ruj: 'HR Tabrani, 8796' },
        { j: 'teks', t: 'Walau bagaimanapun, konsep kebersamaan Allah dengan hamba-Nya di sini perlulah difahami dengan landasan akidah yang betul. Sebagaimana yang telah dijelaskan oleh Syeikh Ahmad, maksud Allah sentiasa bersama hamba-Nya itu adalah kebersamaan dari sudut ilmu-Nya (pengetahuan-Nya). Ini bermakna Allah sentiasa memerhati dan Maha Mengetahui segala perbuatan, keadaan, dan isi hati hamba-Nya pada setiap masa.' }
      ]}
    ]},
  { slug: 'sifat-malu', siri: 'akhlak-dan-adab', tarikh: '2026-08-25', tajuk: 'Sifat Malu', tag: ['akhlak', 'adab', 'malu', 'iman', 'digital'],
    soalan: [
      { s: 'Bagaimanakah sifat malu itu menjadi perisai yang mencegah daripada melakukan kemaksiatan secara terang-terangan mahupun sembunyi?', blok: [
        { j: 'teks', t: 'Sifat malu berkait rapat dengan kesempurnaan iman. Sifat malu adalah komponen utama dalam keimanan seseorang. Apabila iman bertapak kukuh di dalam hati, sifat malu akan wujud secara semula jadi. Perasaan malu kepada Allah SWT akan melahirkan rasa sentiasa diawasi (muraqabah), sekaligus menjadi perisai yang menghalang seseorang daripada melakukan maksiat walaupun bersendirian di tempat yang tersembunyi.' },
        { j: 'hadis', ar: 'دَعْهُ، فَإِنَّ الْحَيَاءَ مِنَ الْإِيمَانِ', maksud: 'Biarkan dia, kerana sesungguhnya sifat malu itu adalah sebahagian daripada iman.', ruj: '' },
        { j: 'teks', t: 'Sifat malu menghalang terjadinya keburukan. Sifat malu yang sebenar tidak akan membiarkan pemiliknya terjebak ke lembah dosa. Ia sentiasa membimbing tingkah laku ke arah ketaatan dan secara automatik menahan diri daripada melakukan perbuatan keji yang boleh mengundang murka Allah mahupun celaan manusia.' },
        { j: 'hadis', ar: 'وَالْحَيَاءُ لَا يَأْتِي إِلَّا بِخَيْرٍ', maksud: '...dan sifat malu itu tidak mendatangkan (sesuatu) melainkan kebaikan.', ruj: '' },
        { j: 'teks', t: 'Malu merupakan suatu kebaikan. Sifat malu merangkumi kebaikan secara keseluruhan, baik dari segi akhlak, pertuturan, mahupun tindakan fizikal. Orang yang memiliki sifat ini akan berasa segan dan jijik untuk mempamerkan dosa atau berbangga dengan maksiat secara terang-terangan, kerana sifat malu itu memelihara maruahnya secara total.' },
        { j: 'hadis', ar: 'الْحَيَاءُ كُلُّهُ خَيْرٌ', maksud: 'Sifat malu itu keseluruhannya adalah kebaikan…', ruj: '' }
      ]},
      { s: 'Apakah langkah-langkah praktikal yang boleh kita lakukan pada hari ini untuk memelihara daripada anasir yang merosakkan iman di era digital?', blok: [
        { j: 'teks', t: 'Memelihara pancaindera dan fikiran. Di era digital, kita terdedah kepada lambakan maklumat dan visual melalui skrin peranti. Langkah praktikalnya adalah dengan menapis dan menjaga pandangan mata, pendengaran, serta fikiran daripada melihat atau membaca kandungan yang tidak bermanfaat, lucah, atau fitnah di media sosial.' },
        { j: 'hadis', ar: 'فَلْيَحْفَظِ الرَّأْسَ وَمَا وَعَى', maksud: '...maka hendaklah dia memelihara kepala dan apa yang ada padanya (pancaindera dan fikiran)...', ruj: '' },
        { j: 'teks', t: 'Memastikan sumber pendapatan bebas unsur haram. Kita perlu berhati-hati dalam setiap transaksi digital, perniagaan online, atau penjanaan pendapatan melalui internet agar bebas daripada unsur penipuan, riba, atau perkara syubhah. Ini memastikan rezeki yang membesarkan tubuh badan dan masuk ke dalam perut kekal halal dan diberkati.' },
        { j: 'hadis', ar: 'وَلْيَحْفَظِ الْبَطْنَ وَمَا حَوَى', maksud: '...hendaklah dia memelihara perut dan apa yang dikandungnya (rezeki yang halal)...', ruj: '' },
        { j: 'teks', t: 'Tidak terpedaya dengan ilusi media sosial. Dunia digital sering memaparkan ilusi kesempurnaan, kemewahan, dan gaya hidup materialistik. Langkah terbaik untuk memelihara iman adalah dengan tidak berlumba-lumba mengejar erti kejayaan palsu tersebut, sebaliknya mengehadkan masa skrin, bermuhasabah tentang kematian, dan meletakkan matlamat akhirat sebagai keutamaan.' },
        { j: 'hadis', ar: 'وَلْيَذْكُرِ الْمَوْتَ وَالْبِلَى، وَمَنْ أَرَادَ الْآخِرَةَ تَرَكَ زِينَةَ الدُّنْيَا', maksud: '...dan hendaklah dia sentiasa mengingati kematian dan kehancuran jasad. Dan sesiapa yang menginginkan akhirat, dia akan meninggalkan perhiasan dunia.', ruj: '' }
      ]}
    ]},
  { slug: 'kehormatan-diri', siri: 'tadabbur-al-mukminun', tarikh: '2026-09-02', julat: 'Ayat 5–6', tajuk: 'Kehormatan Diri', tag: ['tadabbur', 'al-Mukminun', 'iffah', 'maruah'],
    soalan: [
      { s: 'Bagaimana konsep kesucian dan kehormatan diri dalam Islam?', blok: [
        { j: 'teks', t: 'Konsep kesucian (Al-Iffah) dan memelihara kehormatan diri merupakan antara ciri utama dan terpenting bagi orang yang beriman dalam Islam, sebagaimana yang ditegaskan dalam Surah Al-Mu\'minun. Penjagaan kemaluan dan kehormatan ini diberi penekanan yang sangat khusus di dalam Al-Quran. Walaupun seseorang itu sudah memiliki sifat terpuji yang lain, seperti sentiasa menjauhi perkara yang sia-sia, tuntutan untuk memelihara kesucian ini tetap diangkat secara berasingan bagi menunjukkan betapa tingginya nilai maruah dan kesucian di sisi agama.' },
        { j: 'ayat', ar: 'وَٱلَّذِينَ هُمْ لِفُرُوجِهِمْ حَـٰفِظُونَ', maksud: 'Dan mereka yang menjaga kehormatannya.', ruj: 'Surah al-Mukminun, ayat 5' },
        { j: 'teks', t: 'Dari sudut fitrah, Islam amat mengakui bahawa manusia memiliki dorongan nafsu syahwat yang sangat kuat dan secara semula jadinya cenderung ke arah perkara-perkara yang melanggar batas. Oleh hal yang demikian, konsep kesucian ini menuntut sebuah perjuangan rohani yang aktif untuk menahan dan mengawal kehendak nafsu tersebut. Kesempurnaan sifat kesucian hanya dapat dicapai apabila seseorang individu itu berjaya menundukkan dorongan syahwatnya demi mematuhi perintah Tuhan, sebuah komitmen yang turut ditekankan kekuatannya melalui gaya bahasa Al-Quran itu sendiri.' },
        { j: 'teks', t: 'Bagi mengimbangi fitrah tersebut, penjagaan kehormatan diri dalam Islam datang dengan batasan penyaluran yang sangat jelas dan teratur. Berdasarkan penelitian pakar tatabahasa Arab terhadap ayat ini, perbuatan "menjaga" (menahan diri) bermaksud individu tersebut dilarang secara mutlak daripada melepaskan hawa nafsunya dalam semua keadaan, kecuali hanya kepada saluran yang halal dan sah menurut syarak, iaitu pasangan mereka (isteri). Ini membuktikan bahawa Islam tidak menindas fitrah manusia, sebaliknya memandu kesucian itu melalui kawalan yang penuh tanggungjawab.' }
      ]},
      { s: 'Bagaimana etika dan batasan hukum terhadap hamba sahaya dahulu boleh dipraktikkan dalam konteks sosial zaman kini?', blok: [
        { j: 'teks', t: 'Walaupun sistem perhambaan telah terhapus pada zaman moden, prinsip asas mengenai ketegasan batasan pergaulan dan kehormatan kekal sangat relevan. Sejarah perundangan fiqh menunjukkan bahawa walaupun terdapat kelonggaran pada masa lalu, ia tetap diikat dengan syarat yang sangat ketat; misalnya larangan mutlak menghampiri wanita yang sedang haid, isteri/hamba kepada orang lain, atau ketika wujudnya halangan syarak seperti Zihar. Dalam konteks hari ini, etika ini mengajar masyarakat moden untuk sentiasa menghormati batasan hubungan antara manusia, memelihara kesucian ikatan perkahwinan yang sah, dan tidak mengambil kesempatan ke atas individu lain tanpa mengira status sosial atau kedudukan mereka.' },
        { j: 'ayat', ar: 'إِلَّا عَلَىٰٓ أَزْوَٰجِهِمْ أَوْ مَا مَلَكَتْ أَيْمَـٰنُهُمْ فَإِنَّهُمْ غَيْرُ مَلُومِينَ', maksud: 'Kecuali kepada isterinya atau hamba sahayanya maka sesungguhnya mereka tidak tercela.', ruj: 'Surah al-Mukminun, ayat 6' },
        { j: 'teks', t: 'Selain itu, etika dalam memahami dan mengaplikasikan hukum agama dapat dipelajari secara langsung melalui kisah Saidina Umar R.A. dan wanita yang tersalah tafsir mengenai hukum perhubungan. Tindakan wanita tersebut menggunakan logik akalnya sendiri untuk menghalalkan perbuatan yang diharamkan telah membawa kepada tindakan tatatertib yang tegas. Di zaman kini, sejarah ini menjadi peringatan agar masyarakat tidak sewenang-wenangnya memanipulasi atau mentafsirkan teks-teks agama mengikut hawa nafsu atau logik peribadi untuk menghalalkan perbuatan yang tidak bermoral. Ia menegaskan kewajipan merujuk kepada pihak berautoriti dan pakar bagi mengelakkan kecelaruan sosial.' },
        { j: 'teks', t: 'Akhir sekali, perbahasan ulama mengenai penggunaan kata ganti nama "ما" (apa) yang pada masa lalu meletakkan hamba seolah-olah "barang dagangan" memberikan pengajaran besar tentang evolusi nilai kemanusiaan.' },
        { j: 'ayat', ar: 'أَوْ مَا مَلَكَتْ أَيْمَـٰنُهُمْ', maksud: '... atau hamba sahayanya..', ruj: 'Surah al-Mukminun, ayat 6' },
        { j: 'teks', t: 'Konteks sosial moden menuntut kita untuk menjadikan sejarah ini sebagai titik tolak untuk menolak sebarang bentuk eksploitasi manusia, penindasan kelas, atau pemerdagangan orang (modern slavery). Pemahaman terhadap etika perundangan masa lalu ini seharusnya memotivasikan kita untuk memastikan setiap hubungan sesama manusia dibina atas dasar keadilan, ihsan, dan penghormatan terhadap hak asasi, bukannya melayan manusia lain sebagai komoditi.' }
      ]}
    ]},
  { slug: 'buku-catatan-amal-manusia', siri: 'tadabbur-al-mukminun', tarikh: '2026-09-05', julat: 'Ayat 62–63', tajuk: 'Buku Catatan Amal Manusia', tag: ['tadabbur', 'al-Mukminun', 'hisab', 'catatan amal'],
    soalan: [
      { s: 'Apakah tafsiran yang diberikan oleh para ulama mengenai perkataan "Kitab" dalam firman Allah وَلَدَيْنَا كِتَابٌ يَنطِقُ بِالْحَقِّ?', blok: [
        { j: 'teks', t: 'Para ulama menafsirkan perkataan "Kitab" dalam firman Allah:' },
        { j: 'ayat', ar: 'وَلَدَيْنَا كِتَابٌ يَنطِقُ بِالْحَقِّ', maksud: 'Dan di sisi Kami ada sebuah Kitab yang berbicara dengan kebenaran.', ruj: 'Surah al-Mukminun, ayat 62' },
        { j: 'teks', t: 'Secara utamanya sebagai buku catatan amal manusia. Kitab ini berfungsi memaparkan realiti perbuatan manusia dengan sangat tepat, merekodkan segala amalan secara terperinci sama ada amalan yang besar mahupun yang kecil bagi tujuan proses hisab atau pembalasan kelak.' },
        { j: 'teks', t: 'Selain daripada tafsiran utama tersebut, terdapat juga pendapat minoriti dalam kalangan ulama yang membawakan pandangan berbeza. Sebahagian daripada mereka menafsirkan perkataan "Kitab" di dalam firman tersebut merujuk kepada Lauh Mahfuz, manakala sebahagian pandangan yang lain pula menafsirkannya sebagai al-Quran.' },
        { j: 'teks', t: 'Kewujudan "Kitab" ini melengkapkan prinsip keadilan dan kelebihan Allah SWT yang mutlak seperti mana yang ditegaskan dalam potongan ayat seterusnya, iaitu:' },
        { j: 'ayat', ar: 'وَهُمْ لَا يُظْلَمُونَ', maksud: 'Dan mereka tidak dizalimi.', ruj: 'Surah al-Mukminun, ayat 62' },
        { j: 'teks', t: 'Melalui perbahasan tersebut, manusia dijanjikan bahawa mereka tidak akan dizalimi pada hari akhirat kelak, sama ada menerusi pengurangan pahala kebaikan yang dilakukan atau penambahan azab melebihi apa yang sepatutnya.' }
      ]},
      { s: 'Bagaimanakah para ulama menafsirkan perkataan "ghamrah" (غَمْرَةٍ)?', blok: [
        { j: 'teks', t: 'Para ulama memberikan penafsiran yang berbeza mengenai perkataan "ghamrah" (غَمْرَةٍ) bersandarkan kepada firman Allah SWT:' },
        { j: 'ayat', ar: 'بَلْ قُلُوبُهُمْ فِي غَمْرَةٍ مِّنْ هَٰذَا', maksud: 'Bahkan hati mereka berada dalam kelalaian dari kebenaran ini.', ruj: 'Surah al-Mukminun, ayat 63' },
        { j: 'teks', t: 'Menurut tafsiran ulama, perkataan ini merujuk kepada keadaan hati golongan kafir yang tenggelam dalam kejahilan dan kelalaian terhadap kebenaran catatan amal, yang mendorong mereka berterusan melakukan pelbagai maksiat dan kekufuran termasuklah mencela al-Quran.' },
        { j: 'teks', t: 'Dalam menghuraikan bentuk kelalaian tersebut, ulama seperti Mujahid dan Qatadah memberikan perincian terhadap perkataan ini yang menjadi punca kejahilan mereka. Mereka berpendapat bahawa hati golongan kafir itu lalai daripada menyedari kebenaran al-Quran, mesej agama Islam secara keseluruhannya, kebaikan amalan orang-orang mukmin, ataupun terlepas pandang terhadap kebenaran yang dibawa oleh Nabi Muhammad SAW.' },
        { j: 'teks', t: 'Walau bagaimanapun, Abu Muslim mengemukakan pandangan yang berbeza dan disokong oleh Imam Ar-Razi, di mana beliau mengaitkan ayat ini dengan keadaan orang-orang Mukmin. Beliau menafsirkan "ghamrah" sebagai perasaan bimbang, takut, dan bingung di dalam hati orang beriman yang sentiasa memikirkan sama ada amalan wajib serta ibadah sunat mereka diterima atau ditolak oleh Allah SWT, sungguhpun pandangan ini dianggap agak lemah dan sedikit lari daripada kejelasan konteks ayat oleh sebahagian pihak.' }
      ]}
    ]},
  { slug: 'penyesalan-yang-terlambat', siri: 'tadabbur-al-mukminun', tarikh: '2026-09-09', julat: 'Ayat 64–65', tajuk: 'Penyesalan yang Terlambat', tag: ['tadabbur', 'al-Mukminun', 'taubat', 'azab'],
    soalan: [
      { s: 'Apakah yang dimaksudkan dengan golongan “مُتْرَفِيهِمْ” yang disebut dalam ayat 64 Surah Al-Mukminun, dan bagaimanakah keadaan mereka apabila azab Allah menimpa?', blok: [
        { j: 'teks', t: 'Firman Allah SWT:' },
        { j: 'ayat', ar: 'حَتَّىٰ إِذَا أَخَذْنَا مُتْرَفِيهِم بِالْعَذَابِ إِذَا هُمْ يَجْأَرُونَ', maksud: 'Sehingga apabila Kami timpakan azab kepada golongan mewah (pemimpin-pemimpin yang berfoya-foya) dalam kalangan mereka, tiba-tiba mereka menjerit meminta pertolongan.', ruj: 'Surah al-Mukminun, ayat 64' },
        { j: 'teks', t: 'Golongan “مُتْرَفِيهِمْ” merujuk kepada pemimpin dan pembesar masyarakat yang ditenggelami kemewahan dan kesenangan dunia, sehingga mereka menjadi paling angkuh dalam menolak seruan kebenaran, sekaligus menjadi punca utama masyarakat mereka mengingkari para Rasul.' },
        { j: 'teks', t: 'Perkataan “يَجْأَرُونَ” digunakan oleh Allah SWT bukan sekadar bermaksud menangis biasa, tetapi ia menggambarkan jeritan dan rintihan yang kuat seperti seekor binatang ternakan yang keresahan menahan kesakitan, sebagai gambaran betapa dahsyat dan tidak tertanggungnya azab yang menimpa mereka pada ketika itu.' },
        { j: 'teks', t: 'Ini menjadi peringatan bahawa kemewahan dan kekuasaan di dunia tidak akan mampu melindungi seseorang daripada azab Allah apabila ia diturunkan, malah golongan yang paling berkuasa dan gah sekalipun akan tunduk merintih dalam ketakutan yang amat sangat.' }
      ]},
      { s: 'Mengapakah rintihan dan jeritan mereka meminta pertolongan pada ketika itu tidak lagi memberi sebarang manfaat, sebagaimana disebut dalam ayat 65?', blok: [
        { j: 'teks', t: 'Firman Allah SWT menjawab jeritan mereka:' },
        { j: 'ayat', ar: 'لَا تَجْأَرُوا الْيَوْمَ ۖ إِنَّكُم مِّنَّا لَا تُنصَرُونَ', maksud: '(Lalu dikatakan kepada mereka): Janganlah kamu menjerit-jerit meminta pertolongan pada hari ini, sesungguhnya kamu tidak akan mendapat sebarang pertolongan daripada Kami.', ruj: 'Surah al-Mukminun, ayat 65' },
        { j: 'teks', t: 'Ayat ini menegaskan bahawa pintu pertolongan dan keampunan telah tertutup sebaik sahaja azab benar-benar menimpa, kerana masa untuk beriman dan bertaubat sudah pun berakhir.' },
        { j: 'teks', t: 'Prinsip ini turut disebut dalam kisah Firaun yang cuba beriman ketika ditenggelamkan, namun keimanannya pada saat-saat terakhir itu tidak lagi diterima. Firman Allah SWT:' },
        { j: 'ayat', ar: 'آلْآنَ وَقَدْ عَصَيْتَ قَبْلُ وَكُنتَ مِنَ الْمُفْسِدِينَ', maksud: 'Apakah sekarang (baru kamu beriman), padahal sesungguhnya kamu telah derhaka sejak dahulu, dan kamu termasuk orang-orang yang melakukan kerosakan?', ruj: 'Surah Yunus, ayat 91' },
        { j: 'teks', t: 'Allah SWT turut menjelaskan kaedah umum ini secara jelas dalam ayat lain, iaitu keimanan yang muncul selepas seseorang benar-benar menyaksikan azab tidak lagi mendatangkan sebarang manfaat kepadanya. Firman Allah SWT:' },
        { j: 'ayat', ar: 'فَلَمْ يَكُ يَنفَعُهُمْ إِيمَانُهُمْ لَمَّا رَأَوْا بَأْسَنَا', maksud: 'Maka iman mereka tidak berguna lagi bagi mereka tatkala mereka telah melihat azab Kami.', ruj: 'Surah Ghafir, ayat 85' },
        { j: 'teks', t: 'Justeru, ayat ini mengajar kita supaya bersegera bertaubat dan kembali kepada Allah selagi pintu taubat masih terbuka.' }
      ]}
    ]},
  { slug: 'sombong-menolak-kebenaran', siri: 'tadabbur-al-mukminun', tarikh: '2026-09-16', julat: 'Ayat 66–67', tajuk: 'Sombong Menolak Kebenaran', tag: ['tadabbur', 'al-Mukminun', 'sombong', 'lidah'],
    soalan: [
      { s: 'Apakah maksud firman Allah “فَكُنتُمْ عَلَىٰ أَعْقَابِكُمْ تَنكِصُونَ” pada ayat 66, dan bagaimanakah ia menggambarkan sikap sebahagian kaum musyrikin Quraisy terhadap Al-Quran?', blok: [
        { j: 'teks', t: 'Firman Allah SWT:' },
        { j: 'ayat', ar: 'قَدْ كَانَتْ آيَاتِي تُتْلَىٰ عَلَيْكُمْ فَكُنتُمْ عَلَىٰ أَعْقَابِكُمْ تَنكِصُونَ', maksud: 'Sesungguhnya ayat-ayat-Ku telah dibacakan kepada kamu, tetapi kamu berpaling undur ke belakang (menolaknya dengan angkuh).', ruj: 'Surah al-Mukminun, ayat 66' },
        { j: 'teks', t: 'Ungkapan “berpaling undur ke belakang” ini menggambarkan penolakan yang keras dan segera, seolah-olah mereka melarikan diri sebaik sahaja mendengar kebenaran dibacakan, walaupun kebenaran itu telah disampaikan dengan jelas dan berulang kali kepada mereka.' },
        { j: 'teks', t: 'Sikap sebegini turut digambarkan Allah SWT pada kaum musyrikin yang lain, di mana mereka bukan sekadar enggan mendengar, malah saling menghasut sesama sendiri supaya membuat kecoh dan bising ketika Al-Quran dibacakan agar suara bacaan itu tidak dapat didengari dengan jelas. Firman Allah SWT:' },
        { j: 'ayat', ar: 'وَقَالَ الَّذِينَ كَفَرُوا لَا تَسْمَعُوا لِهَٰذَا الْقُرْآنِ وَالْغَوْا فِيهِ لَعَلَّكُمْ تَغْلِبُونَ', maksud: 'Dan orang-orang yang kafir berkata: Janganlah kamu dengar Al-Quran ini dan buatlah gangguan (bising) terhadapnya, supaya kamu dapat mengalahkannya.', ruj: 'Surah Fussilat, ayat 26' },
        { j: 'teks', t: 'Sikap seperti ini menjadi pengajaran penting bahawa penolakan terhadap kebenaran selalunya bukan berpunca daripada kekurangan dalil, tetapi lebih kepada kesombongan hati yang enggan tunduk walaupun kebenaran itu telah terang dan nyata di hadapan mata.' }
      ]},
      { s: 'Apakah tafsiran ulama mengenai perkataan “سَامِرًا تَهْجُرُونَ” pada ayat 67, dan apakah pengajaran yang boleh diambil daripadanya?', blok: [
        { j: 'teks', t: 'Firman Allah SWT:' },
        { j: 'ayat', ar: 'مُسْتَكْبِرِينَ بِهِ سَامِرًا تَهْجُرُونَ', maksud: '(Kamu berpaling) dalam keadaan sombong (dengan kedudukan kamu sebagai penjaga Baitullah), sambil kamu berbual-bual di waktu malam dengan percakapan yang buruk (mengata-ngatakan Al-Quran).', ruj: 'Surah al-Mukminun, ayat 67' },
        { j: 'teks', t: 'Menurut tafsiran ulama, perkataan “سَامِرًا” merujuk kepada kebiasaan sebahagian pemuka Quraisy yang berkumpul berbual-bual pada waktu malam di sekitar Kaabah, manakala “تَهْجُرُونَ” pula membawa maksud percakapan yang tidak elok, sama ada dalam bentuk mengata-ngatakan Al-Quran dan Nabi SAW, atau bercakap perkara yang sia-sia dan tidak membawa faedah.' },
        { j: 'teks', t: 'Ayat ini menunjukkan bahawa kesombongan mereka terhadap kedudukan sebagai penjaga Baitullah menjadikan hati mereka lebih keras dan lebih berani mempersendakan wahyu Allah, sedangkan kemuliaan sesuatu kedudukan sepatutnya mendekatkan seseorang kepada kebenaran, bukan menjauhkannya.' },
        { j: 'teks', t: 'Pengajaran yang boleh diambil ialah kepentingan menjaga pertuturan lidah terutamanya dalam majlis-majlis perbualan, supaya ia tidak dipenuhi dengan percakapan yang sia-sia atau buruk, sebagaimana yang ditegaskan Rasulullah SAW dalam sabdanya riwayat Abu Hurairah RA:' },
        { j: 'hadis', ar: 'مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ', maksud: 'Sesiapa yang beriman kepada Allah dan Hari Akhirat, maka hendaklah dia berkata-kata yang baik, atau (jika tidak mampu) hendaklah dia berdiam diri.', ruj: 'HR Bukhari, 6018' }
      ]}
    ]},
  { slug: 'ganjaran-tuhanmu-lebih-baik', siri: 'tadabbur-al-mukminun', tarikh: '2026-09-30', julat: 'Ayat 72–74', tajuk: 'Ganjaran Tuhanmu Lebih Baik', tag: ['tadabbur', 'al-Mukminun', 'ikhlas', 'istiqamah'],
    soalan: [
      { s: 'Apakah maksud firman Allah “أَمْ تَسْأَلُهُمْ خَرْجًا” pada ayat 72, dan mengapakah ganjaran daripada Allah SWT dinyatakan lebih baik daripada sebarang upah yang diberikan oleh manusia?', blok: [
        { j: 'teks', t: 'Firman Allah SWT:' },
        { j: 'ayat', ar: 'أَمْ تَسْأَلُهُمْ خَرْجًا فَخَرَاجُ رَبِّكَ خَيْرٌ ۖ وَهُوَ خَيْرُ الرَّازِقِينَ', maksud: 'Atau adakah engkau (wahai Muhammad) meminta kepada mereka sesuatu bayaran (upah kerana menyampaikan Islam)? (Tidak! Kerana) upah pemberian Tuhanmu adalah lebih baik, dan Dia lah jua sebaik-baik Pemberi rezeki.', ruj: 'Surah al-Mukminun, ayat 72' },
        { j: 'teks', t: 'Imam al-Alusi menjelaskan bahawa ayat ini adalah peralihan kepada satu lagi teguran terhadap kaum musyrikin, seolah-olah mereka mendakwa Rasulullah SAW meminta bayaran atas dakwah baginda sehingga menjadi alasan untuk tidak beriman. Kata beliau:' },
        { j: 'petikan', ar: 'وَكَانَ الْمُرَادُ أَمْ يَزْعُمُونَ أَنَّكَ تَسْأَلُهُمْ عَلَى أَدَاءِ الرِّسَالَةِ خَرْجًا أَيْ جُعْلًا فَلِأَجْلِ ذَلِكَ لَا يُؤْمِنُونَ بِكَ', maksud: 'Dan yang dimaksudkan ialah: Adakah mereka mendakwa bahawa engkau meminta daripada mereka \'kharj\', iaitu upah, atas penyampaian risalah, lalu kerana itulah mereka tidak beriman kepadamu?', ruj: 'Tafsir Ruh al-Ma\'ani, al-Alusi, jld. 9, hlm. 254' },
        { j: 'teks', t: 'Hakikatnya Rasulullah SAW tidak pernah meminta upah daripada mereka, maka alasan tersebut tertolak sama sekali.' },
        { j: 'teks', t: 'Firman-Nya “فَخَرَاجُ رَبِّكَ خَيْرٌ” pula menjadi sebab mengapa baginda tidak perlu meminta upah daripada manusia. Imam al-Alusi berkata:' },
        { j: 'petikan', ar: 'أَيْ رِزْقُهُ فِي الدُّنْيَا وَثَوَابُهُ فِي الْآخِرَةِ ... فَإِنَّ مَا رَزَقَكَ اللَّهُ تَعَالَى فِي الدُّنْيَا وَالْعُقْبَى خَيْرٌ مِنْ ذَلِكَ لِسَعَتِهِ وَدَوَامِهِ وَعَدَمِ تَحَمُّلِ مِنَّةِ الرِّجَالِ فِيهِ', maksud: 'Iaitu rezeki-Nya di dunia dan pahala-Nya di akhirat ... kerana sesungguhnya apa yang Allah Taala kurniakan kepadamu di dunia dan akhirat adalah lebih baik daripada upah itu, disebabkan keluasannya, kekekalannya dan tiadanya beban terhutang budi kepada manusia padanya.', ruj: 'Tafsir Ruh al-Ma\'ani, al-Alusi, jld. 9, hlm. 254' },
        { j: 'teks', t: 'Pendirian bahawa ganjaran pendakwah hanyalah daripada Allah SWT ditegaskan lagi dalam firman-Nya:' },
        { j: 'ayat', ar: 'قُلْ مَا سَأَلْتُكُم مِّنْ أَجْرٍ فَهُوَ لَكُمْ ۖ إِنْ أَجْرِيَ إِلَّا عَلَى اللَّهِ ۖ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ شَهِيدٌ', maksud: 'Katakanlah: Apa jua upah yang aku minta dari kamu (kerana menyampaikan ugama Allah), maka itu adalah untuk kamu. Upahku hanyalah dari Allah, dan Ia Maha Menyaksikan tiap-tiap sesuatu.', ruj: 'Surah Saba\', ayat 47' },
        { j: 'teks', t: 'Pengajarannya, setiap orang yang menyampaikan kebaikan hendaklah meletakkan harapan kepada ganjaran Allah SWT yang luas dan kekal, bukan kepada pujian atau imbalan manusia yang sedikit dan akan hilang.' }
      ]},
      { s: 'Apakah yang dimaksudkan dengan “صِرَاطٍ مُّسْتَقِيمٍ” dalam ayat 73, dan mengapakah orang yang tidak beriman kepada hari akhirat disifatkan sebagai “لَنَاكِبُونَ” dalam ayat 74?', blok: [
        { j: 'teks', t: 'Firman Allah SWT:' },
        { j: 'ayat', ar: 'وَإِنَّكَ لَتَدْعُوهُمْ إِلَىٰ صِرَاطٍ مُّسْتَقِيمٍ', maksud: 'Dan sesungguhnya engkau (wahai Muhammad) menyeru mereka ke jalan yang lurus.', ruj: 'Surah al-Mukminun, ayat 73' },
        { j: 'teks', t: 'Imam al-Alusi mentafsirkan jalan yang lurus ini sebagai jalan yang kelurusannya diakui oleh akal yang sejahtera:' },
        { j: 'petikan', ar: 'تَشْهَدُ الْعُقُولُ السَّلِيمَةُ بِاسْتِقَامَتِهِ لَيْسَ فِيهِ شَائِبَةُ اعْوِجَاجٍ تُوجِبُ الِاتِّهَامَ', maksud: 'Akal-akal yang sejahtera menyaksikan kelurusannya; tiada padanya sebarang unsur bengkok yang boleh menimbulkan tuduhan.', ruj: 'Tafsir Ruh al-Ma\'ani, al-Alusi, jld. 9, hlm. 254' },
        { j: 'teks', t: 'Beliau turut menukilkan kesimpulan al-Zamakhsyari bahawa melalui ayat-ayat ini Allah SWT telah menegakkan hujah ke atas mereka: Rasul yang diutus ialah insan yang mereka kenali luar dan dalam, tidak menjadikan dakwah sebagai jalan untuk meraih harta mereka, dan tidak menyeru melainkan kepada agama Islam yang merupakan jalan yang lurus. Firman Allah SWT:' },
        { j: 'ayat', ar: 'وَإِنَّ الَّذِينَ لَا يُؤْمِنُونَ بِالْآخِرَةِ عَنِ الصِّرَاطِ لَنَاكِبُونَ', maksud: 'Dan sesungguhnya orang-orang yang tidak beriman kepada hari akhirat, tetap menyimpang dari jalan yang lurus itu.', ruj: 'Surah al-Mukminun, ayat 74' },
        { j: 'teks', t: 'Perkataan “لَنَاكِبُونَ” ditafsirkan oleh Imam al-Alusi sebagai “لَعَادِلُونَ”, iaitu benar-benar berpaling dan menyimpang. Beliau menjelaskan bahawa sifat tidak beriman kepada akhirat disebut sebagai isyarat kepada punca penyimpangan mereka:' },
        { j: 'petikan', ar: 'فَإِنَّ الْإِيمَانَ بِالْآخِرَةِ وَخَوْفَ مَا فِيهَا مِنَ الدَّوَاهِي مِنْ أَقْوَى الدَّوَاعِي إِلَى طَلَبِ الْحَقِّ وَسُلُوكِ سَبِيلِهِ', maksud: 'Kerana sesungguhnya beriman kepada hari akhirat dan takut kepada bencana-bencana yang ada padanya adalah antara pendorong yang paling kuat untuk mencari kebenaran dan menempuh jalannya.', ruj: 'Tafsir Ruh al-Ma\'ani, al-Alusi, jld. 9, hlm. 254' },
        { j: 'teks', t: 'Justeru, setelah jalan yang lurus itu jelas, seorang mukmin dituntut untuk beriman dan terus istiqamah di atasnya. Daripada Sufyan bin Abdullah al-Thaqafi RA, beliau berkata:' },
        { j: 'hadis', ar: 'قُلْتُ: يَا رَسُولَ اللَّهِ، قُلْ لِي فِي الْإِسْلَامِ قَوْلًا لَا أَسْأَلُ عَنْهُ أَحَدًا بَعْدَكَ، قَالَ: قُلْ: آمَنْتُ بِاللَّهِ، ثُمَّ اسْتَقِمْ', maksud: 'Aku berkata: Wahai Rasulullah, katakanlah kepadaku satu ucapan dalam Islam yang aku tidak perlu bertanya tentangnya kepada sesiapa pun selepasmu. Baginda bersabda: Katakanlah: Aku beriman kepada Allah, kemudian beristiqamahlah.', ruj: 'HR Muslim, 38' },
        { j: 'teks', t: 'Pengajarannya, keyakinan yang kukuh terhadap hari akhirat adalah benteng yang memelihara seseorang agar tidak tergelincir daripada jalan yang lurus, dan istiqamah di atas jalan itulah bukti keimanan yang sebenar.' }
      ]}
    ]},
  { slug: 'tidak-tunduk-walau-diuji', siri: 'tadabbur-al-mukminun', tarikh: '2026-10-07', julat: 'Ayat 75–77', tajuk: 'Tidak Tunduk Walau Diuji', tag: ['tadabbur', 'al-Mukminun', 'ujian', 'taubat'],
    soalan: [
      { s: 'Apakah maksud firman Allah pada ayat 75 bahawa sekiranya Allah merahmati kaum musyrikin dan menghilangkan kesusahan mereka, nescaya mereka tetap berterusan dalam kesesatan?', blok: [
        { j: 'teks', t: 'Firman Allah SWT:' },
        { j: 'ayat', ar: 'وَلَوْ رَحِمْنَاهُمْ وَكَشَفْنَا مَا بِهِم مِّن ضُرٍّ لَّلَجُّوا فِي طُغْيَانِهِمْ يَعْمَهُونَ', maksud: 'Dan jika Kami kasihani mereka serta Kami hapuskan kesusahan yang menimpa mereka, nescaya mereka berkeras dalam kederhakaan mereka, dalam keadaan meraba-raba (tidak mendapat petunjuk).', ruj: 'Surah al-Mukminun, ayat 75' },
        { j: 'teks', t: 'Ayat ini mendedahkan kekerasan hati kaum musyrikin. Kesusahan yang menimpa sepatutnya menyedarkan mereka. Namun begitu, sekiranya kesusahan tersebut dihilangkan sekalipun mereka tidak akan bersyukur, sebaliknya akan kembali kekal dalam kesesatan dan kederhakaan.' },
        { j: 'teks', t: 'Imam al-Alusi dalam Ruh al-Ma\'ani mengaitkan ayat ini dengan kesempitan makanan yang menimpa kaum Quraisy, antaranya selepas Thumamah bin Uthal RA, pemimpin Yamamah, memeluk Islam lalu bersumpah kepada mereka:' },
        { j: 'hadis', ar: 'لَا يَأْتِيكُمْ مِنَ الْيَمَامَةِ حَبَّةُ حِنْطَةٍ حَتَّى يَأْذَنَ فِيهَا رَسُولُ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ', maksud: 'Tidak akan sampai kepada kamu dari Yamamah walau sebiji gandum pun, sehinggalah Rasulullah SAW mengizinkannya.', ruj: 'HR Muslim, 1764' },
        { j: 'teks', t: 'Walaupun kaum Quraisy merasai kesempitan hidup akibat sekatan ini, ia tidak menjadikan hati mereka lembut untuk menerima kebenaran, sebagaimana yang digambarkan oleh ayat tersebut.' },
        { j: 'teks', t: 'Sikap yang sama turut digambarkan oleh Allah SWT tentang orang-orang kafir yang memohon untuk dikembalikan ke dunia setelah melihat neraka. Firman Allah SWT:' },
        { j: 'ayat', ar: 'وَلَوْ رُدُّوا لَعَادُوا لِمَا نُهُوا عَنْهُ وَإِنَّهُمْ لَكَاذِبُونَ', maksud: '...dan kalaulah mereka dikembalikan (ke dunia) tentulah mereka akan mengulangi apa yang mereka dilarang melakukannya; dan sesungguhnya mereka adalah orang-orang yang tetap berdusta.', ruj: 'Surah al-An\'am, ayat 28' },
        { j: 'teks', t: 'Pengajarannya, hati yang telah dikuasai kesombongan tidak akan berubah dengan ujian atau nikmat semata-mata, maka kita hendaklah sentiasa memohon kepada Allah agar dilembutkan hati untuk menerima hidayah kebenaran.' }
      ]},
      { s: 'Mengapakah kaum musyrikin tetap tidak tunduk dan merendah diri kepada Allah walaupun telah ditimpa azab, dan apakah kesudahan mereka?', blok: [
        { j: 'teks', t: 'Firman Allah SWT:' },
        { j: 'ayat', ar: 'وَلَقَدْ أَخَذْنَاهُم بِالْعَذَابِ فَمَا اسْتَكَانُوا لِرَبِّهِمْ وَمَا يَتَضَرَّعُونَ', maksud: 'Dan demi sesungguhnya, Kami telah menimpakan azab kepada mereka, maka mereka tidak juga tunduk kepada Tuhan mereka, dan mereka tidak pula merendah diri berdoa kepada-Nya.', ruj: 'Surah al-Mukminun, ayat 76' },
        { j: 'teks', t: 'Perkataan “اسْتَكَانُوا” bermaksud tunduk dan merendah diri, manakala “يَتَضَرَّعُونَ” bermaksud merayu dan berdoa dengan penuh kehinaan diri kepada Allah. Tujuan ujian dan musibah ialah untuk mengembalikan manusia kepada Allah, namun kaum musyrikin tetap ingin kekal dalam kesesatan.' },
        { j: 'teks', t: 'Allah SWT menjelaskan punca sebenar mengapa mereka tidak merendah diri ketika ditimpa kesusahan. Firman Allah SWT:' },
        { j: 'ayat', ar: 'فَلَوْلَا إِذْ جَاءَهُم بَأْسُنَا تَضَرَّعُوا وَلَٰكِن قَسَتْ قُلُوبُهُمْ وَزَيَّنَ لَهُمُ الشَّيْطَانُ مَا كَانُوا يَعْمَلُونَ', maksud: 'Maka alangkah eloknya kalau mereka berdoa kepada Kami dengan merendah diri (serta insaf dan bertaubat) ketika mereka ditimpa azab Kami? Tetapi yang sebenarnya hati mereka keras (tidak mahu menerima kebenaran), dan Syaitan pula memperelokkan pada (pandangan) mereka apa yang mereka telah lakukan.', ruj: 'Surah al-An\'am, ayat 43' },
        { j: 'teks', t: 'Kekerasan hati dan tipu daya syaitan yang menghiasi perbuatan buruk adalah penghalang utama seseorang daripada kembali kepada Allah ketika diuji.' },
        { j: 'teks', t: 'Akibat keengganan ini, Allah SWT menggambarkan kesudahan mereka apabila azab yang lebih dahsyat didatangkan. Firman Allah SWT:' },
        { j: 'ayat', ar: 'حَتَّىٰ إِذَا فَتَحْنَا عَلَيْهِم بَابًا ذَا عَذَابٍ شَدِيدٍ إِذَا هُمْ فِيهِ مُبْلِسُونَ', maksud: 'Sehingga apabila Kami bukakan kepada mereka pintu azab yang amat berat (yang tidak disangka-sangka), tiba-tiba mereka berputus asa (daripada mendapat sebarang pertolongan).', ruj: 'Surah al-Mukminun, ayat 77' },
        { j: 'teks', t: 'Perkataan “مُبْلِسُونَ” bermaksud berputus asa dan kebingungan tanpa sebarang harapan. Justeru, ayat ini mengajar kita supaya menjadikan setiap ujian kecil sebagai peluang untuk bertaubat sebelum datangnya ketika yang tidak lagi memberi ruang untuk kembali.' }
      ]}
    ]},
  { slug: 'sedikit-yang-bersyukur', siri: 'tadabbur-al-mukminun', tarikh: '2026-10-14', julat: 'Ayat 78–80', tajuk: 'Sedikit yang Bersyukur', tag: ['tadabbur', 'al-Mukminun', 'syukur', 'akal'],
    soalan: [
      { s: 'Apakah hikmah Allah SWT menyebut nikmat pendengaran, penglihatan dan hati dan mengapakah ayat ini diakhiri dengan teguran “قَلِيلًا مَّا تَشْكُرُونَ”?', blok: [
        { j: 'teks', t: 'Firman Allah SWT:' },
        { j: 'ayat', ar: 'وَهُوَ الَّذِي أَنشَأَ لَكُمُ السَّمْعَ وَالْأَبْصَارَ وَالْأَفْئِدَةَ ۚ قَلِيلًا مَّا تَشْكُرُونَ', maksud: 'Dan Dia lah yang mengadakan bagi kamu pendengaran dan penglihatan serta hati (untuk kamu bersyukur, tetapi) amatlah sedikit kamu bersyukur.', ruj: 'Surah al-Mukminun, ayat 78' },
        { j: 'teks', t: 'Setelah menyebut kedegilan kaum musyrikin, Allah SWT mengingatkan mereka dengan nikmat pancaindera dan hati yang menjadi alat untuk mengenal kebenaran. Namun mereka tidak menggunakannya untuk mendengar ayat-ayat Allah, melihat tanda-tanda kekuasaan-Nya dan memikirkannya, maka itulah tanda sedikitnya kesyukuran mereka.' },
        { j: 'teks', t: 'Nikmat pendengaran, penglihatan dan hati ini juga akan dipersoalkan oleh Allah SWT pada hari akhirat. Firman Allah SWT:' },
        { j: 'ayat', ar: 'وَلَا تَقْفُ مَا لَيْسَ لَكَ بِهِ عِلْمٌ ۚ إِنَّ السَّمْعَ وَالْبَصَرَ وَالْفُؤَادَ كُلُّ أُولَٰئِكَ كَانَ عَنْهُ مَسْئُولًا', maksud: 'Dan janganlah engkau mengikut apa yang engkau tidak mempunyai pengetahuan mengenainya; sesungguhnya pendengaran dan penglihatan serta hati, semua anggota-anggota itu tetap akan ditanya tentang apa yang dilakukannya.', ruj: 'Surah al-Isra\', ayat 36' },
        { j: 'teks', t: 'Syukur yang sebenar bukan sekadar ucapan di lidah, tetapi menggunakan setiap nikmat yang dikurniakan pada jalan yang diredai oleh Allah SWT.' },
        { j: 'teks', t: 'Oleh kerana bersyukur dengan sempurna memerlukan bantuan Allah, Rasulullah SAW berpesan kepada Muaz bin Jabal RA agar tidak meninggalkan doa ini pada setiap penghujung solat:' },
        { j: 'hadis', ar: 'اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ', maksud: 'Ya Allah, bantulah aku untuk mengingati-Mu, bersyukur kepada-Mu dan memperelokkan ibadah kepada-Mu.', ruj: 'HR Abu Daud, 1522' },
        { j: 'teks', t: 'Doa ini mengajar kita bahawa kemampuan untuk bersyukur itu sendiri adalah satu nikmat yang perlu dipohon daripada Allah SWT.' }
      ]},
      { s: 'Apakah tanda-tanda kekuasaan Allah yang disebut dalam ayat seterusnya dan apakah pengajaran di sebalik pertanyaan “أَفَلَا تَعْقِلُونَ”?', blok: [
        { j: 'teks', t: 'Firman Allah SWT:' },
        { j: 'ayat', ar: 'وَهُوَ الَّذِي ذَرَأَكُمْ فِي الْأَرْضِ وَإِلَيْهِ تُحْشَرُونَ', maksud: 'Dan Dia lah yang menciptakan dan mengembangkan kamu di bumi, dan kepada-Nya lah kamu akan dihimpunkan.', ruj: 'Surah al-Mukminun, ayat 79' },
        { j: 'teks', t: 'Allah SWT yang menciptakan manusia dan membiakkan mereka di seluruh pelosok bumi, Dia jua yang akan menghimpunkan mereka semua pada hari kiamat untuk dihisab. Ayat ini mengaitkan permulaan kejadian dengan kesudahan, supaya manusia sedar bahawa hidup ini bukan tanpa tujuan.' },
        { j: 'teks', t: 'Firman Allah SWT:' },
        { j: 'ayat', ar: 'وَهُوَ الَّذِي يُحْيِي وَيُمِيتُ وَلَهُ اخْتِلَافُ اللَّيْلِ وَالنَّهَارِ ۚ أَفَلَا تَعْقِلُونَ', maksud: 'Dan Dia lah yang menghidupkan dan yang mematikan, dan Dia lah yang menentukan pertukaran malam dan siang; maka tidakkah kamu mahu berfikir?', ruj: 'Surah al-Mukminun, ayat 80' },
        { j: 'teks', t: 'Pertanyaan “أَفَلَا تَعْقِلُونَ” adalah teguran agar manusia menggunakan akal. Tuhan yang berkuasa menghidupkan, mematikan dan mengatur pertukaran malam dan siang dengan begitu teratur, pastinya berkuasa pula untuk menghidupkan semula manusia selepas mati.' },
        { j: 'teks', t: 'Pertukaran malam dan siang ini dijadikan oleh Allah SWT sebagai bahan renungan bagi golongan yang berakal. Firman Allah SWT:' },
        { j: 'ayat', ar: 'إِنَّ فِي خَلْقِ السَّمَاوَاتِ وَالْأَرْضِ وَاخْتِلَافِ اللَّيْلِ وَالنَّهَارِ لَآيَاتٍ لِّأُولِي الْأَلْبَابِ', maksud: 'Sesungguhnya pada kejadian langit dan bumi, dan pada pertukaran malam dan siang, ada tanda-tanda (kekuasaan, kebijaksanaan, dan keluasan rahmat Allah) bagi orang-orang yang berakal.', ruj: 'Surah Ali \'Imran, ayat 190' },
        { j: 'teks', t: 'Justeru, setiap kali kita melihat pergantian waktu Subuh dan malam, hendaklah ia mengingatkan kita tentang kekuasaan Allah dan singkatnya usia yang dikurniakan.' }
      ]}
    ]},
  { slug: 'mengulangi-alasan-orang-terdahulu', siri: 'tadabbur-al-mukminun', tarikh: '2026-10-21', julat: 'Ayat 81–83', tajuk: 'Mengulangi Alasan Orang Terdahulu', tag: ['tadabbur', 'al-Mukminun', 'kebangkitan', 'taklid'],
    soalan: [
      { s: 'Apakah ucapan kaum musyrikin yang disebut dalam ayat 81 dan 82, dan bagaimanakah Al-Quran menjawab keraguan mereka terhadap hari kebangkitan?', blok: [
        { j: 'teks', t: 'Firman Allah SWT:' },
        { j: 'ayat', ar: 'بَلْ قَالُوا مِثْلَ مَا قَالَ الْأَوَّلُونَ ۝ قَالُوا أَإِذَا مِتْنَا وَكُنَّا تُرَابًا وَعِظَامًا أَإِنَّا لَمَبْعُوثُونَ', maksud: '(Mereka tidak juga mahu berfikir) bahkan mereka mengatakan seperti yang telah dikatakan oleh orang-orang yang terdahulu. Mereka berkata: Adakah apabila kami telah mati dan menjadi tanah serta tulang, adakah kami akan dibangkitkan hidup semula?', ruj: 'Surah al-Mukminun, ayat 81–82' },
        { j: 'teks', t: 'Kaum musyrikin Quraisy tidak membawa hujah baharu, sebaliknya sekadar mengulangi keraguan umat-umat terdahulu yang mengingkari hari kebangkitan. Mereka menganggap mustahil jasad yang telah hancur menjadi tanah dan tulang dapat dihidupkan semula.' },
        { j: 'teks', t: 'Allah SWT menjawab keraguan ini dengan hujah yang sangat jelas, iaitu Tuhan yang mencipta pada kali pertama sudah tentu mampu menghidupkannya semula. Firman Allah SWT:' },
        { j: 'ayat', ar: 'وَضَرَبَ لَنَا مَثَلًا وَنَسِيَ خَلْقَهُ ۖ قَالَ مَن يُحْيِي الْعِظَامَ وَهِيَ رَمِيمٌ ۝ قُلْ يُحْيِيهَا الَّذِي أَنشَأَهَا أَوَّلَ مَرَّةٍ ۖ وَهُوَ بِكُلِّ خَلْقٍ عَلِيمٌ', maksud: 'Serta ia mengemukakan satu misal perbandingan kepada Kami (tentang kekuasaan Kami), dan ia lupa akan keadaan kejadiannya, sambil ia bertanya: Siapakah yang dapat menghidupkan tulang-tulang yang telah hancur? Katakanlah: Tulang-tulang yang hancur itu akan dihidupkan oleh Tuhan yang telah menjadikannya pada awal mula wujudnya; dan Dia Maha Mengetahui akan segala keadaan makhluk-makhluk (yang diciptakan-Nya).', ruj: 'Surah Yasin, ayat 78–79' },
        { j: 'teks', t: 'Allah SWT turut menegaskan bahawa mengulangi penciptaan adalah lebih mudah bagi-Nya menurut logik akal manusia sendiri. Firman Allah SWT:' },
        { j: 'ayat', ar: 'وَهُوَ الَّذِي يَبْدَأُ الْخَلْقَ ثُمَّ يُعِيدُهُ وَهُوَ أَهْوَنُ عَلَيْهِ', maksud: 'Dan Dia lah yang memulakan kejadian makhluk-makhluk, kemudian Ia mengembalikannya (hidup semula sesudah matinya), sedang perkara itu adalah lebih mudah bagi-Nya.', ruj: 'Surah ar-Rum, ayat 27' },
        { j: 'teks', t: 'Pengajarannya, keimanan kepada hari kebangkitan adalah asas yang mendorong seseorang untuk beramal soleh dan menjauhi maksiat.' }
      ]},
      { s: 'Apakah maksud tuduhan “أَسَاطِيرُ الْأَوَّلِينَ” dalam ayat 83, dan apakah bahaya sikap bertaklid buta yang menolak kebenaran?', blok: [
        { j: 'teks', t: 'Firman Allah SWT:' },
        { j: 'ayat', ar: 'لَقَدْ وُعِدْنَا نَحْنُ وَآبَاؤُنَا هَٰذَا مِن قَبْلُ إِنْ هَٰذَا إِلَّا أَسَاطِيرُ الْأَوَّلِينَ', maksud: 'Sesungguhnya kami dan datuk nenek kami telah diberikan janji dengan ini dari dahulu lagi; ini semua hanyalah cerita-cerita dongeng orang-orang dahulu kala.', ruj: 'Surah al-Mukminun, ayat 83' },
        { j: 'teks', t: 'Perkataan “أَسَاطِيرُ” bermaksud cerita-cerita yang ditulis dan dihikayatkan oleh orang terdahulu tanpa kebenarannya. Kaum musyrikin berhujah bahawa janji kebangkitan telah lama didengar oleh datuk nenek mereka namun tidak pernah berlaku, lalu mereka menganggapnya sebagai dongeng semata-mata.' },
        { j: 'teks', t: 'Sikap berpegang kepada amalan nenek moyang tanpa menilai kebenarannya ini dicela oleh Allah SWT. Firman Allah SWT:' },
        { j: 'ayat', ar: 'وَإِذَا قِيلَ لَهُمُ اتَّبِعُوا مَا أَنزَلَ اللَّهُ قَالُوا بَلْ نَتَّبِعُ مَا أَلْفَيْنَا عَلَيْهِ آبَاءَنَا ۗ أَوَلَوْ كَانَ آبَاؤُهُمْ لَا يَعْقِلُونَ شَيْئًا وَلَا يَهْتَدُونَ', maksud: 'Dan apabila dikatakan kepada mereka: Turutlah akan apa yang telah diturunkan oleh Allah, mereka menjawab: (Tidak), bahkan kami (hanya) menurut apa yang kami dapati datuk nenek kami melakukannya. Patutkah (mereka menurutnya) sekalipun datuk neneknya itu tidak faham sesuatu (apa pun tentang perkara-perkara agama), dan tidak pula mendapat petunjuk hidayah (dari Allah)?', ruj: 'Surah al-Baqarah, ayat 170' },
        { j: 'teks', t: 'Allah SWT menjelaskan bahawa punca seseorang menganggap ayat-ayat Allah sebagai dongeng ialah hati yang telah tertutup oleh dosa. Firman Allah SWT:' },
        { j: 'ayat', ar: 'إِذَا تُتْلَىٰ عَلَيْهِ آيَاتُنَا قَالَ أَسَاطِيرُ الْأَوَّلِينَ ۝ كَلَّا ۖ بَلْ ۜ رَانَ عَلَىٰ قُلُوبِهِم مَّا كَانُوا يَكْسِبُونَ', maksud: 'Apabila dibacakan kepadanya ayat-ayat keterangan Kami, ia berkata: (Ini ialah) cerita-cerita dongeng orang-orang dahulu kala. Sebenarnya! (Ayat-ayat Kami itu tidak ada cacatnya) bahkan mata hati mereka telah diselaputi kekotoran (dosa), dengan sebab (perbuatan kufur dan maksiat) yang mereka kerjakan.', ruj: 'Surah al-Mutaffifin, ayat 13–14' },
        { j: 'teks', t: 'Justeru, kita hendaklah sentiasa membersihkan hati dengan taubat dan istighfar agar hati kekal peka dan tunduk apabila mendengar ayat-ayat Allah dibacakan.' }
      ]}
    ]},
  { slug: 'mengakui-tuhan-tetapi-tidak-bertaqwa', siri: 'tadabbur-al-mukminun', tarikh: '2026-10-28', julat: 'Ayat 84–87', tajuk: 'Mengakui Tuhan tetapi Tidak Bertaqwa', tag: ['tadabbur', 'al-Mukminun', 'tauhid', 'taqwa'],
    soalan: [
      { s: 'Apakah soalan pertama yang Allah SWT perintahkan Nabi SAW ajukan kepada kaum musyrikin dalam ayat 84 dan 85, dan apakah hujah di sebalik teguran “أَفَلَا تَذَكَّرُونَ”?', blok: [
        { j: 'teks', t: 'Firman Allah SWT:' },
        { j: 'ayat', ar: 'قُل لِّمَنِ الْأَرْضُ وَمَن فِيهَا إِن كُنتُمْ تَعْلَمُونَ ۝ سَيَقُولُونَ لِلَّهِ ۚ قُلْ أَفَلَا تَذَكَّرُونَ', maksud: 'Tanyakanlah (wahai Muhammad): \'Kepunyaan siapakah bumi ini dan segala yang ada padanya, kalau kamu mengetahui?\' Mereka akan menjawab: \'Kepunyaan Allah\'. Katakanlah: \'Mengapa kamu tidak mahu ingat (dan insaf)?\'', ruj: 'Surah al-Mukminun, ayat 84–85' },
        { j: 'teks', t: 'Setelah menyebut penolakan kaum musyrikin terhadap hari kebangkitan, Allah SWT memerintahkan Nabi SAW menyoal mereka tentang pemilik bumi dan segala makhluk di dalamnya. Mereka sendiri tidak dapat menafikan bahawa bumi ini milik Allah, maka pengakuan itu meruntuhkan hujah mereka yang menolak kebangkitan.' },
        { j: 'teks', t: 'Pengakuan kaum musyrikin bahawa Allah ialah Pencipta ini turut dirakamkan dalam ayat lain. Firman Allah SWT:' },
        { j: 'ayat', ar: 'وَلَئِن سَأَلْتَهُم مَّنْ خَلَقَ السَّمَاوَاتِ وَالْأَرْضَ لَيَقُولُنَّ اللَّهُ ۚ قُلِ الْحَمْدُ لِلَّهِ ۚ بَلْ أَكْثَرُهُمْ لَا يَعْلَمُونَ', maksud: 'Dan sesungguhnya jika engkau (wahai Muhammad) bertanya kepada mereka (yang musyrik) itu: \'Siapakah yang menciptakan langit dan bumi?\' Sudah tentu mereka akan menjawab: \'Allah\'. Ucapkanlah (wahai Muhammad): \'Alhamdulillah\' (sebagai bersyukur disebabkan pengakuan mereka yang demikian - tidak mengingkari Allah), bahkan kebanyakan mereka tidak mengetahui (hakikat tauhid dan pengertian syirik).', ruj: 'Surah Luqman, ayat 25' },
        { j: 'teks', t: 'Mereka mengakui Allah sebagai Pencipta dan Pemilik, tetapi masih menyekutukan-Nya dalam ibadah dan menolak hari kebangkitan. Pengakuan di lidah semata-mata tidak memadai tanpa keimanan dan ketaatan yang sebenar.' },
        { j: 'teks', t: 'Imam al-Alusi dalam Ruh al-Ma\'ani menjelaskan maksud teguran “أَفَلَا تَذَكَّرُونَ”:' },
        { j: 'petikan', ar: 'أَفَلا تَذَكَّرُونَ أي أتعلمون أو أتقولون ذلك فلا تتذكرون أي من فطر الأرض ومن فيها ابتداء قادر على إعادتها ثانيا فإن البدء ليس بأهون من الإعادة بل الأمر بالعكس في قياس المعقول', maksud: 'Tidakkah kamu mahu mengambil peringatan? Iaitu: adakah kamu mengetahui atau mengucapkan hal itu lalu kamu tidak mengambil peringatan? Maksudnya, Tuhan yang menciptakan bumi dan penghuninya pada permulaan berkuasa mengembalikannya semula, kerana memulakan penciptaan tidaklah lebih mudah daripada mengulanginya; bahkan menurut neraca akal, keadaannya adalah sebaliknya.', ruj: 'Tafsir Ruh al-Ma\'ani, al-Alusi, jld. 9, hlm. 257' },
        { j: 'teks', t: 'Allah SWT juga menyuruh manusia mengambil peringatan daripada kejadian diri mereka sendiri. Firman Allah SWT:' },
        { j: 'ayat', ar: 'وَلَقَدْ عَلِمْتُمُ النَّشْأَةَ الْأُولَىٰ فَلَوْلَا تَذَكَّرُونَ', maksud: 'Dan demi sesungguhnya, kamu telah sedia mengetahui tentang ciptaan diri kamu kali pertama, maka ada baiknya kalau kamu mengambil ingatan (bahawa Allah yang telah menciptakan kamu dari tiada kepada ada, berkuasa membangkitkan kamu hidup semula pada hari akhirat kelak).', ruj: 'Surah al-Waqi\'ah, ayat 62' },
        { j: 'teks', t: 'Pengajarannya, sesiapa yang benar-benar mengingati asal kejadiannya akan yakin bahawa kebangkitan itu pasti berlaku, lalu bersiap sedia dengan amal soleh.' }
      ]},
      { s: 'Mengapakah lafaz “رَبُّ” diulang pada “وَرَبُّ الْعَرْشِ الْعَظِيمِ”, dan mengapakah teguran berubah kepada “أَفَلَا تَتَّقُونَ”?', blok: [
        { j: 'teks', t: 'Firman Allah SWT:' },
        { j: 'ayat', ar: 'قُلْ مَن رَّبُّ السَّمَاوَاتِ السَّبْعِ وَرَبُّ الْعَرْشِ الْعَظِيمِ ۝ سَيَقُولُونَ لِلَّهِ ۚ قُلْ أَفَلَا تَتَّقُونَ', maksud: 'Tanyakanlah lagi: \'Siapakah Tuhan yang memiliki dan mentadbirkan langit yang tujuh, dan Tuhan yang mempunyai Arasy yang besar?\' Mereka akan menjawab: \'(Semuanya) kepunyaan Allah\'. Katakanlah: \'Mengapa kamu tidak mahu bertaqwa?\'', ruj: 'Surah al-Mukminun, ayat 86–87' },
        { j: 'teks', t: 'Soalan Allah tentang bumi kepada langit yang tujuh dan Arasy yang agung. Imam al-Alusi dalam Ruh al-Ma\'ani menjelaskan sebab lafaz “رَبّ” diulang pada “وَرَبُّ الْعَرْشِ الْعَظِيمِ”:' },
        { j: 'petikan', ar: 'أعيد لفظ الرب تنويها بشأن العرش ورفعا لمحله من أن يكون تبعا للسماوات وجودا وذكرا', maksud: 'Lafaz \'ar-Rabb\' diulang sebagai pengagungan terhadap Arasy dan untuk mengangkat kedudukannya daripada sekadar menjadi pengikut kepada langit, sama ada dari sudut kewujudan mahupun sebutan.', ruj: 'Tafsir Ruh al-Ma\'ani, al-Alusi, jld. 9, hlm. 257' },
        { j: 'teks', t: 'Tuhan langit, bumi dan Arasy inilah yang diagungkan oleh Rasulullah SAW ketika ditimpa kesusahan. Daripada Ibn Abbas RA, bahawa Nabi SAW membaca ketika kesusahan:' },
        { j: 'hadis', ar: 'لَا إِلَهَ إِلَّا اللَّهُ الْعَظِيمُ الْحَلِيمُ، لَا إِلَهَ إِلَّا اللَّهُ رَبُّ الْعَرْشِ الْعَظِيمِ، لَا إِلَهَ إِلَّا اللَّهُ رَبُّ السَّمَوَاتِ وَرَبُّ الْأَرْضِ، وَرَبُّ الْعَرْشِ الْكَرِيمِ', maksud: 'Tiada tuhan yang berhak disembah melainkan Allah Yang Maha Agung lagi Maha Penyantun. Tiada tuhan yang berhak disembah melainkan Allah, Tuhan yang memiliki Arasy yang agung. Tiada tuhan yang berhak disembah melainkan Allah, Tuhan langit dan Tuhan bumi, serta Tuhan yang memiliki Arasy yang mulia.', ruj: 'HR al-Bukhari, 6346; HR Muslim, 2730' },
        { j: 'teks', t: 'Kaum musyrikin mengakui sifat ketuhanan ini sekadar di lidah, sedangkan orang beriman menjadikannya tempat bergantung dan berlindung ketika diuji.' },
        { j: 'teks', t: 'Imam al-Alusi menjelaskan peningkatan teguran pada penghujung setiap ayat, iaitu daripada “أَفَلَا تَذَكَّرُونَ” kepada “أَفَلَا تَتَّقُونَ”:' },
        { j: 'petikan', ar: 'فعيروا أولا بعدم التذكر فإن أيسر النظر يكفي في انحلال عقدهم ثم بعدم الاتقاء وفيه وعيد ثم بالتعجب من خدع عقولهم', maksud: 'Maka mereka ditegur pada mulanya kerana tidak mengambil peringatan, kerana pemerhatian yang paling ringan pun memadai untuk meleraikan kekusutan fikiran mereka; kemudian ditegur kerana tidak bertaqwa, dan padanya terkandung ancaman; kemudian dengan rasa hairan terhadap tipu daya yang memperdaya akal mereka.', ruj: 'Tafsir Ruh al-Ma\'ani, al-Alusi, jld. 9, hlm. 258' },
        { j: 'teks', t: 'Mereka tahu bahawa Allah ialah Tuhan yang memiliki segala-galanya, tetapi ilmu itu tidak melahirkan rasa takut dan ketaatan. Firman Allah SWT:' },
        { j: 'ayat', ar: 'إِنَّمَا يَخْشَى اللَّهَ مِنْ عِبَادِهِ الْعُلَمَاءُ ۗ إِنَّ اللَّهَ عَزِيزٌ غَفُورٌ', maksud: 'Sebenarnya yang menaruh bimbang dan takut (melanggar perintah) Allah dari kalangan hamba-hambaNya hanyalah orang-orang yang berilmu. Sesungguhnya Allah Maha Kuasa, lagi Maha Pengampun.', ruj: 'Surah Fatir, ayat 28' },
        { j: 'teks', t: 'Pengajarannya, ilmu dan pengakuan terhadap kebesaran Allah mesti melahirkan taqwa dalam amalan.' }
      ]}
    ]},
  { slug: 'kuasa-mutlak-allah', siri: 'tadabbur-al-mukminun', tarikh: '2026-11-04', julat: 'Ayat 88–91', tajuk: 'Kuasa Mutlak Allah', tag: ['tadabbur', 'al-Mukminun', 'tauhid', 'malakut'],
    soalan: [
      { s: 'Apakah maksud “مَلَكُوتُ كُلِّ شَيْءٍ” dan “يُجِيرُ وَلَا يُجَارُ عَلَيْهِ” dalam ayat 88 dan 89 Surah al-Mukminun menurut Imam al-Alusi?', blok: [
        { j: 'teks', t: 'Firman Allah SWT:' },
        { j: 'ayat', ar: 'قُلْ مَن بِيَدِهِ مَلَكُوتُ كُلِّ شَيْءٍ وَهُوَ يُجِيرُ وَلَا يُجَارُ عَلَيْهِ إِن كُنتُمْ تَعْلَمُونَ ۝ سَيَقُولُونَ لِلَّهِ ۚ قُلْ فَأَنَّىٰ تُسْحَرُونَ', maksud: 'Katakanlah (wahai Muhammad): \'Siapakah yang di tanganNya kuasa pemerintahan tiap-tiap sesuatu, dan Dia juga yang memberi perlindungan (kepada sesiapa yang dikehendakiNya) sedang tiada sesiapa yang dapat memberi perlindungan terhadapNya, jika kamu mengetahui?\' Mereka akan menjawab: \'Kepunyaan Allah\'. Katakanlah: \'Kalau demikian, bagaimanakah kamu boleh terpesong dari mengakui keesaan Allah?\'', ruj: 'Surah al-Mukminun, ayat 88–89' },
        { j: 'teks', t: 'Imam al-Alusi dalam Ruh al-Ma\'ani menjelaskan maksud “مَلَكُوتُ”:' },
        { j: 'petikan', ar: 'قُلْ مَنْ بِيَدِهِ مَلَكُوتُ كُلِّ شَيْءٍ مِمَّا ذُكِرَ وَمِمَّا لَمْ يُذْكَرْ وَصِيغَةُ الْمَلَكُوتِ لِلْمُبَالَغَةِ فِي الْمُلْكِ فَالْمُرَادُ بِهِ الْمُلْكُ الشَّامِلُ الظَّاهِرُ', maksud: 'Katakanlah: Siapakah yang di tangan-Nya malakut segala sesuatu, daripada yang disebut dan yang tidak disebut. Bentuk perkataan \'malakut\' membawa maksud mubalaghah (penekanan) pada kekuasaan, maka yang dimaksudkan ialah kekuasaan yang menyeluruh lagi jelas.', ruj: 'Tafsir Ruh al-Ma\'ani, al-Alusi, jld. 9, hlm. 258' },
        { j: 'teks', t: 'Imam al-Alusi menjelaskan bahawa Allah yang memberi perlindungan, dan tiada sesiapa yang mampu menghalang-Nya:' },
        { j: 'petikan', ar: 'وَهُوَ يُجِيرُ أَيْ يَمْنَعُ مَنْ يَشَاءُ مِمَّنْ يَشَاءُ وَلَا يُجَارُ عَلَيْهِ وَلَا يُمْنَعُ أَحَدٌ مِنْهُ جَلَّ وَعَلَا أَحَدًا', maksud: 'Dan Dia memberi perlindungan, iaitu menghalang sesiapa yang Dia kehendaki daripada sesiapa yang Dia kehendaki; dan tiada yang dapat memberi perlindungan terhadap-Nya, iaitu tiada seorang pun yang dapat menghalang Allah Yang Maha Tinggi daripada sesiapa pun.', ruj: 'Tafsir Ruh al-Ma\'ani, al-Alusi, jld. 9, hlm. 258' },
        { j: 'teks', t: 'Hal ini ditegaskan oleh firman Allah SWT dalam Surah al-Jinn:' },
        { j: 'ayat', ar: 'قُلْ إِنِّي لَن يُجِيرَنِي مِنَ اللَّهِ أَحَدٌ وَلَنْ أَجِدَ مِن دُونِهِ مُلْتَحَدًا', maksud: 'Katakanlah (wahai Muhammad): \'Sesungguhnya aku sekali-kali tidak akan ada sesiapa pun yang dapat memberi perlindungan kepadaku dari (azab) Allah, dan aku tidak akan beroleh sebarang tempat berlindung selain daripadaNya.\'', ruj: 'Surah al-Jinn, ayat 22' },
        { j: 'teks', t: 'Imam al-Alusi menukilkan dari al-Kashf bahawa soalan-soalan dalam ayat 84 hingga 89 disusun secara berperingkat:' },
        { j: 'petikan', ar: 'ثُمَّ سُئِلَ عَمَّنْ لَهُ السَّمَوَاتُ وَالْعَرْشُ الْعَظِيمُ وَالْأَرْضُ بِالنِّسْبَةِ إِلَيْهِ كَلَا شَيْءٍ ثُمَّ سُئِلَ عَمَّنْ بِيَدِهِ مَلَكُوتُ كُلِّ شَيْءٍ فَأَتَى بِأَعَمِّ الْعَامِّ وَكَلِمَةِ الْإِحَاطَةِ', maksud: 'Kemudian mereka ditanya tentang siapakah pemilik langit dan Arasy yang agung, sedangkan bumi berbanding Arasy tiada nilainya. Kemudian ditanya pula tentang siapakah yang di tangan-Nya malakut segala sesuatu, lalu didatangkan dengan lafaz yang paling umum dan perkataan yang meliputi segala-galanya.', ruj: 'Tafsir Ruh al-Ma\'ani, al-Alusi, jld. 9, hlm. 258' },
        { j: 'teks', t: 'Pengajarannya, kekuasaan Allah meliputi segala sesuatu, maka seorang mukmin tiada perlindungan melainkan kepada-Nya. Firman Allah SWT:' },
        { j: 'ayat', ar: 'فَسُبْحَانَ الَّذِي بِيَدِهِ مَلَكُوتُ كُلِّ شَيْءٍ وَإِلَيْهِ تُرْجَعُونَ', maksud: 'Maka Maha Suci Allah yang di tanganNya kuasa pemerintahan tiap-tiap sesuatu, dan kepadaNyalah kamu semua dikembalikan.', ruj: 'Surah Yasin, ayat 83' }
      ]},
      { s: 'Bagaimanakah ayat 90 dan 91 Surah al-Mukminun menafikan anak dan sekutu bagi Allah, dan apakah hujah “إِذًا لَّذَهَبَ كُلُّ إِلَٰهٍ بِمَا خَلَقَ”?', blok: [
        { j: 'teks', t: 'Firman Allah SWT:' },
        { j: 'ayat', ar: 'بَلْ أَتَيْنَاهُم بِالْحَقِّ وَإِنَّهُمْ لَكَاذِبُونَ ۝ مَا اتَّخَذَ اللَّهُ مِن وَلَدٍ وَمَا كَانَ مَعَهُ مِنْ إِلَٰهٍ ۚ إِذًا لَّذَهَبَ كُلُّ إِلَٰهٍ بِمَا خَلَقَ وَلَعَلَا بَعْضُهُمْ عَلَىٰ بَعْضٍ ۚ سُبْحَانَ اللَّهِ عَمَّا يَصِفُونَ', maksud: 'Bahkan Kami telah membawa kepada mereka kebenaran, dan sesungguhnya mereka adalah pendusta. Allah tidak mempunyai anak, dan tidak ada sebarang tuhan bersama-Nya; (jika ada) tentulah tiap-tiap tuhan itu akan membawa (menguasai) makhluk yang diciptakannya, dan tentulah setengah dari mereka mengalahkan setengahnya yang lain. Maha Suci Allah dari apa yang mereka sifatkan.', ruj: 'Surah al-Mukminun, ayat 90–91' },
        { j: 'teks', t: 'Imam al-Alusi menjelaskan:' },
        { j: 'petikan', ar: 'بَلْ أَتَيْنَاهُمْ بِالْحَقِّ إِضْرَابٌ عَنْ قَوْلِهِمْ إِنْ هَذَا إِلَّا أَسَاطِيرُ الْأَوَّلِينَ وَالْمُرَادُ بِالْحَقِّ الْوَعْدُ بِالْبَعْثِ', maksud: '\'Bahkan Kami telah membawa kepada mereka kebenaran\' ialah penolakan terhadap kata-kata mereka: \'Ini tidak lain hanyalah dongeng orang-orang dahulu\'; dan yang dimaksudkan dengan \'al-haqq\' ialah janji kebangkitan.', ruj: 'Tafsir Ruh al-Ma\'ani, al-Alusi, jld. 9, hlm. 258' },
        { j: 'teks', t: 'Imam al-Alusi menghuraikan hujah “لَذَهَبَ كُلُّ إِلَٰهٍ بِمَا خَلَقَ”:' },
        { j: 'petikan', ar: 'أَيْ لَاسْتَبَدَّ بِالَّذِي خَلَقَهُ وَاسْتَقَلَّ بِهِ تَصَرُّفًا وَامْتَازَ مُلْكُهُ عَنْ مُلْكِ الْآخَرِ وَلَعَلَا بَعْضُهُمْ عَلَى بَعْضٍ وَلَوَقَعَ التَّحَارُبُ وَالتَّغَالُبُ بَيْنَهُمْ كَمَا هُوَ الْجَارِي فِيمَا بَيْنَ الْمُلُوكِ', maksud: 'Iaitu setiap tuhan akan menguasai secara bersendirian makhluk yang diciptakannya dan bebas mentadbirnya, kerajaannya terpisah daripada kerajaan yang lain, sebahagian mereka akan mengatasi sebahagian yang lain, dan tentulah berlaku peperangan serta saling mengalahkan antara mereka sebagaimana yang berlaku antara raja-raja.', ruj: 'Tafsir Ruh al-Ma\'ani, al-Alusi, jld. 9, hlm. 258' },
        { j: 'teks', t: 'Imam al-Alusi menukilkan daripada al-Kashf bahawa ayat ini merupakan bukti yang jelas tentang tauhid:' },
        { j: 'petikan', ar: 'وَفِي الْكَشْفِ قَدْ لَاحَ لَنَا مِنْ لُطْفِ اللَّهِ تَعَالَى وَتَأْيِيدِهِ أَنَّ الْآيَةَ بُرْهَانٌ نَيِّرٌ عَلَى تَوْحِيدِهِ سُبْحَانَهُ', maksud: 'Dan dalam al-Kashf: telah jelas bagi kami daripada kelembutan dan pertolongan Allah Taala bahawa ayat ini merupakan bukti yang terang-benderang tentang keesaan-Nya Yang Maha Suci.', ruj: 'Tafsir Ruh al-Ma\'ani, al-Alusi, jld. 9, hlm. 259' },
        { j: 'teks', t: 'Hal ini selari dengan firman Allah SWT:' },
        { j: 'ayat', ar: 'لَوْ كَانَ فِيهِمَا آلِهَةٌ إِلَّا اللَّهُ لَفَسَدَتَا ۚ فَسُبْحَانَ اللَّهِ رَبِّ الْعَرْشِ عَمَّا يَصِفُونَ', maksud: 'Kalaulah ada di langit dan di bumi tuhan-tuhan yang lain dari Allah, tentulah rosak binasa keduanya. Maka Maha Suci Allah, Tuhan yang mempunyai Arasy, dari apa yang mereka sifatkan.', ruj: 'Surah al-Anbiya\', ayat 22' }
      ]}
    ]},
  { slug: 'menolak-kejahatan-dengan-kebaikan', siri: 'tadabbur-al-mukminun', tarikh: '2026-11-11', julat: 'Ayat 92–98', tajuk: 'Menolak Kejahatan dengan Kebaikan', tag: ['tadabbur', 'al-Mukminun', 'akhlak', 'doa'],
    soalan: [
      { s: 'Mengapakah Nabi SAW diperintahkan berdoa agar tidak dijadikan bersama kaum yang zalim, sedangkan Baginda terpelihara daripada azab tersebut?', blok: [
        { j: 'teks', t: 'Firman Allah SWT:' },
        { j: 'ayat', ar: 'عَالِمِ الْغَيْبِ وَالشَّهَادَةِ فَتَعَالَىٰ عَمَّا يُشْرِكُونَ ۝ قُل رَّبِّ إِمَّا تُرِيَنِّي مَا يُوعَدُونَ ۝ رَبِّ فَلَا تَجْعَلْنِي فِي الْقَوْمِ الظَّالِمِينَ', maksud: 'Dia mengetahui perkara yang ghaib dan yang nyata; maka Maha Tinggilah Ia dari apa yang mereka sekutukan. Katakanlah (wahai Muhammad): \'Wahai Tuhanku! Sekiranya Engkau (takdirkan) memperlihatkan kepadaku azab yang dijanjikan kepada mereka; maka (jika demikian) wahai Tuhanku, janganlah Engkau jadikan daku termasuk dalam kalangan kaum yang zalim itu.\'', ruj: 'Surah al-Mukminun, ayat 92–94' },
        { j: 'teks', t: 'Imam al-Alusi menjelaskan hikmah perintah berdoa ini:' },
        { j: 'petikan', ar: 'وَفِي أَمْرِهِ ﷺ أَنْ يَدْعُوَ بِذَلِكَ مَعَ أَنَّهُ فِي حِرْزٍ عَظِيمٍ مِنْ أَنْ يُجْعَلَ قَرِينًا لَهُمْ إِيذَانٌ بِكَمَالِ فَظَاعَةِ الْعَذَابِ الْمَوْعُودِ', maksud: 'Dalam perintah kepada Baginda SAW berdoa dengan doa itu, walaupun Baginda berada dalam perlindungan yang besar daripada dijadikan bersama mereka, terdapat pemberitahuan tentang betapa dahsyatnya azab yang dijanjikan.', ruj: 'Tafsir Ruh al-Ma\'ani, al-Alusi, jld. 9, hlm. 260' },
        { j: 'teks', t: 'Imam al-Alusi menyebut pendapat lain bahawa perintah itu menunjukkan sifat kehambaan:' },
        { j: 'petikan', ar: 'وَقِيلَ أُمِرَ ﷺ بِذَلِكَ هَضْمًا لِنَفْسِهِ وَإِظْهَارًا لِكَمَالِ الْعُبُودِيَّةِ', maksud: 'Dan dikatakan: Baginda SAW diperintahkan demikian sebagai merendah diri dan menzahirkan kesempurnaan kehambaan.', ruj: 'Tafsir Ruh al-Ma\'ani, al-Alusi, jld. 9, hlm. 260' },
        { j: 'teks', t: 'Allah SWT menegaskan bahawa Dia berkuasa memperlihatkan azab itu, namun menangguhkannya. Firman-Nya:' },
        { j: 'ayat', ar: 'وَإِنَّا عَلَىٰ أَن نُّرِيَكَ مَا نَعِدُهُمْ لَقَادِرُونَ', maksud: 'Dan sesungguhnya Kami berkuasa memperlihatkan kepadamu (wahai Muhammad) azab yang Kami janjikan kepada mereka.', ruj: 'Surah al-Mukminun, ayat 95' },
        { j: 'teks', t: 'Kata Imam al-Alusi:' },
        { j: 'petikan', ar: 'لَكِنَّا لَا نَفْعَلُ بَلْ نُؤَخِّرُهُ عَنْهُمْ... أَوْ لِأَنَّا لَا نُعَذِّبُهُمْ وَأَنْتَ فِيهِمْ', maksud: 'Namun Kami tidak melakukannya, bahkan Kami menangguhkannya... atau kerana Kami tidak menyeksa mereka sedang engkau berada di antara mereka.', ruj: 'Tafsir Ruh al-Ma\'ani, al-Alusi, jld. 9, hlm. 260' },
        { j: 'teks', t: 'Hal ini selari dengan firman Allah SWT:' },
        { j: 'ayat', ar: 'وَمَا كَانَ اللَّهُ لِيُعَذِّبَهُمْ وَأَنتَ فِيهِمْ ۚ وَمَا كَانَ اللَّهُ مُعَذِّبَهُمْ وَهُمْ يَسْتَغْفِرُونَ', maksud: 'Dan Allah tidak akan menyeksa mereka sedang engkau (wahai Muhammad) berada di antara mereka; dan Allah tidak akan menyeksa mereka sedang mereka (meminta ampun) beristighfar.', ruj: 'Surah al-Anfal, ayat 33' }
      ]},
      { s: 'Apakah maksud “ادْفَعْ بِالَّتِي هِيَ أَحْسَنُ” dan mengapakah Nabi SAW diperintahkan berlindung daripada hasutan syaitan dalam ayat tersebut?', blok: [
        { j: 'teks', t: 'Firman Allah SWT:' },
        { j: 'ayat', ar: 'ادْفَعْ بِالَّتِي هِيَ أَحْسَنُ السَّيِّئَةَ ۚ نَحْنُ أَعْلَمُ بِمَا يَصِفُونَ', maksud: 'Tolaklah (kejahatan mereka) dengan cara yang lebih baik; Kami lebih mengetahui apa yang mereka sifatkan.', ruj: 'Surah al-Mukminun, ayat 96' },
        { j: 'teks', t: 'Imam al-Alusi menjelaskan tingkatan menolak kejahatan:' },
        { j: 'petikan', ar: 'أَيِ ادْفَعْ بِالْحَسَنَةِ الَّتِي هِيَ أَحْسَنُ الْحَسَنَاتِ الَّتِي يُدْفَعُ بِهَا السَّيِّئَةُ بِأَنْ تُحْسِنَ إِلَى الْمُسِيءِ فِي مُقَابَلَتِهَا مَا اسْتَطَعْتَ، وَدُونَ هَذَا فِي الْحُسْنِ أَنْ يُحْسِنَ إِلَيْهِ فِي الْجُمْلَةِ، وَدُونَهُ أَنْ يَصْفَحَ عَنْ إِسَاءَتِهِ فَقَطْ', maksud: 'Iaitu tolaklah dengan kebaikan yang paling baik daripada kebaikan yang boleh digunakan untuk menolak kejahatan, dengan berbuat baik kepada orang yang berbuat jahat sebagai balasannya sedaya yang mampu. Yang lebih rendah daripada itu ialah berbuat baik kepadanya sekadarnya, dan yang lebih rendah lagi ialah memaafkan kejahatannya sahaja.', ruj: 'Tafsir Ruh al-Ma\'ani, al-Alusi, jld. 9, hlm. 260–261' },
        { j: 'teks', t: 'Hal ini selari dengan firman Allah SWT:' },
        { j: 'ayat', ar: 'وَلَا تَسْتَوِي الْحَسَنَةُ وَلَا السَّيِّئَةُ ۚ ادْفَعْ بِالَّتِي هِيَ أَحْسَنُ فَإِذَا الَّذِي بَيْنَكَ وَبَيْنَهُ عَدَاوَةٌ كَأَنَّهُ وَلِيٌّ حَمِيمٌ', maksud: 'Dan tidaklah sama kebaikan dengan kejahatan. Tolaklah (kejahatan yang ditujukan kepadamu) dengan cara yang lebih baik; apabila engkau berbuat demikian, maka orang yang menaruh permusuhan terhadapmu akan menjadi seolah-olah sahabat karib.', ruj: 'Surah Fussilat, ayat 34' },
        { j: 'teks', t: 'Imam al-Alusi menukilkan athar daripada Anas RA tentang contoh amalan ayat ini:' },
        { j: 'petikan', ar: 'يَقُولُ الرَّجُلُ لِأَخِيهِ مَا لَيْسَ فِيهِ فَيَقُولُ: إِنْ كُنْتَ كَاذِبًا فَأَنَا أَسْأَلُ اللَّهَ تَعَالَى أَنْ يَغْفِرَ لَكَ وَإِنْ كُنْتَ صَادِقًا فَأَنَا أَسْأَلُ اللَّهَ تَعَالَى أَنْ يَغْفِرَ لِي', maksud: 'Seorang lelaki mengatakan kepada saudaranya sesuatu yang tiada padanya, lalu dia menjawab: \'Jika engkau berdusta, aku memohon kepada Allah Taala agar mengampunimu; dan jika engkau benar, aku memohon kepada Allah Taala agar mengampuniku.\'', ruj: 'Tafsir Ruh al-Ma\'ani, al-Alusi, jld. 9, hlm. 261' },
        { j: 'teks', t: 'Selepas itu Allah SWT mengajar Nabi SAW berlindung daripada syaitan:' },
        { j: 'ayat', ar: 'وَقُل رَّبِّ أَعُوذُ بِكَ مِنْ هَمَزَاتِ الشَّيَاطِينِ ۝ وَأَعُوذُ بِكَ رَبِّ أَن يَحْضُرُونِ', maksud: 'Dan katakanlah: \'Wahai Tuhanku! Aku berlindung kepadaMu daripada hasutan syaitan-syaitan. Dan aku berlindung kepadaMu, wahai Tuhanku, supaya mereka tidak hadir (mendampingiku).\'', ruj: 'Surah al-Mukminun, ayat 97–98' },
        { j: 'teks', t: 'Imam al-Alusi menyebut doa yang diajar Nabi SAW:' },
        { j: 'hadis', ar: 'كَانَ رَسُولُ اللَّهِ ﷺ يُعَلِّمُنَا كَلِمَاتٍ نَقُولُهُنَّ عِنْدَ النَّوْمِ مِنَ الْفَزَعِ: بِسْمِ اللَّهِ أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّةِ مِنْ غَضَبِهِ وَعِقَابِهِ وَشَرِّ عِبَادِهِ وَمِنْ هَمَزَاتِ الشَّيَاطِينِ وَأَنْ يَحْضُرُونِ', maksud: 'Rasulullah SAW mengajar kami beberapa kalimah yang kami ucapkan ketika tidur kerana rasa takut: \'Dengan nama Allah, aku berlindung dengan kalimah-kalimah Allah yang sempurna daripada kemurkaan-Nya, azab-Nya, kejahatan hamba-hamba-Nya, dan daripada hasutan syaitan-syaitan, serta daripada kehadiran mereka.\'', ruj: 'HR Abu Daud, 3893; dinukil dalam Tafsir Ruh al-Ma\'ani, al-Alusi, jld. 9, hlm. 261' }
      ]}
    ]},
  { slug: 'permintaan-di-saat-nazak', siri: 'tadabbur-al-mukminun', tarikh: '2026-11-18', julat: 'Ayat 99–101', tajuk: 'Permintaan di Saat Nazak (Rabbi Arji\'un)', tag: ['tadabbur', 'al-Mukminun', 'maut', 'barzakh'],
    soalan: [
      { s: 'Apakah permintaan orang yang zalim ketika maut menjemputnya, dan mengapakah Allah SWT menjawabnya dengan ungkapan tegas iaitu tidak sekali-kali?', blok: [
        { j: 'teks', t: 'Firman Allah SWT:' },
        { j: 'ayat', ar: 'حَتَّىٰ إِذَا جَاءَ أَحَدَهُمُ الْمَوْتُ قَالَ رَبِّ ارْجِعُونِ', maksud: 'Sehingga apabila sampai ajal maut kepada salah seorang daripada mereka, dia (merayu) berkata: Wahai Tuhanku, kembalikanlah aku (ke dunia).', ruj: 'Surah al-Mukminun, ayat 99' },
        { j: 'teks', t: 'Imam al-Alusi dalam Ruh al-Ma\'ani membincangkan sebab lafaz jamak "ارجعون" digunakan adalah kerana ia adalah bentuk ta\'zim (pengagungan) dalam seruan kepada Allah, atau seruan itu turut ditujukan kepada para malaikat maut. (Lihat Tafsir Ruh al-Ma\'ani, al-Alusi, jld. 9, hlm. 262)' },
        { j: 'teks', t: 'Permintaan itu disambung dengan harapannya untuk kembali beramal:' },
        { j: 'ayat', ar: 'لَعَلِّي أَعْمَلُ صَالِحًا فِيمَا تَرَكْتُ ۚ كَلَّا', maksud: 'Supaya aku dapat beramal soleh pada apa yang telah aku tinggalkan (dahulu). Tidak sekali-kali (tidak akan dikembalikan).', ruj: 'Surah al-Mukminun, ayat 100' },
        { j: 'teks', t: 'Imam al-Alusi menjelaskan bahawa "فِيمَا تَرَكْتُ" merujuk kepada iman dan amal soleh yang dia tinggalkan semasa hidup dan menurut sebahagian riwayat yang disandarkan kepada Ibn Abbas, ia juga merujuk khusus kepada zakat yang tidak dibayar dan haji yang tidak ditunaikan. (Lihat Tafsir Ruh al-Ma\'ani, al-Alusi, jld. 9, hlm. 263)' },
        { j: 'teks', t: 'Kata "كَلَّا" ditafsirkan oleh Imam al-Alusi sebagai tegahan dan penolakan daripada Allah SWT terhadap permintaannya, bukan ucapan si mati sendiri. Beliau menjelaskan:' },
        { j: 'ayat', ar: 'إِنَّهَا كَلِمَةٌ هُوَ قَائِلُهَا', maksud: 'Sesungguhnya ia (permintaan \'rabbi arji\'un\' itu) hanyalah satu ucapan yang akan tetap diucapkannya (tanpa membawa apa-apa hasil).', ruj: 'Surah al-Mukminun, ayat 100' }
      ]},
      { s: 'Apakah maksud "barzakh" yang menghalang orang yang telah mati daripada kembali ke dunia, dan apakah yang akan berlaku kepada hubungan kekeluargaan pada hari kiamat?', blok: [
        { j: 'teks', t: 'Allah SWT menerangkan sebab tegahan-Nya terhadap permintaan "rabbi arji\'un":' },
        { j: 'ayat', ar: 'وَمِن وَرَائِهِم بَرْزَخٌ إِلَىٰ يَوْمِ يُبْعَثُونَ', maksud: 'Dan di hadapan mereka ada barzakh (penghalang) sehingga hari mereka dibangkitkan semula.', ruj: 'Surah al-Mukminun, ayat 100' },
        { j: 'teks', t: 'Imam al-Alusi menjelaskan "وَرَائِهِمْ" di sini bermaksud "di hadapan mereka", dan barzakh itu ialah penghalang yang menghalang mereka daripada kembali ke dunia sehingga tiba hari kebangkitan. (Lihat Tafsir Ruh al-Ma\'ani, al-Alusi, jld. 9, hlm. 263)' },
        { j: 'teks', t: 'Allah SWT menggambarkan detik kebangkitan selepas tiupan sangkakala:' },
        { j: 'ayat', ar: 'فَإِذَا نُفِخَ فِي الصُّورِ فَلَا أَنسَابَ بَيْنَهُمْ يَوْمَئِذٍ وَلَا يَتَسَاءَلُونَ', maksud: 'Maka apabila ditiup sangkakala, maka pada hari itu tidak ada lagi hubungan kerabat antara mereka, dan mereka tidak lagi bertanya-tanyaan sesama sendiri (disebabkan dahsyatnya ketakutan hari itu).', ruj: 'Surah al-Mukminun, ayat 101' },
        { j: 'teks', t: 'Imam al-Alusi menukilkan riwayat daripada Umar ibn al-Khattab RA tentang pengecualian pada hari itu:' },
        { j: 'hadis', ar: 'كُلُّ سَبَبٍ وَنَسَبٍ مُنْقَطِعٌ يَوْمَ الْقِيَامَةِ إِلَّا سَبَبِي وَنَسَبِي', maksud: 'Setiap hubungan sebab dan nasab terputus pada hari kiamat, kecuali hubungan sebab dan nasabku (Rasulullah SAW).', ruj: 'Dinukil dalam Tafsir Ruh al-Ma\'ani, al-Alusi, jld. 9, hlm. 264' }
      ]}
    ]},
  { slug: 'timbangan-amal-penentu-kejayaan', siri: 'tadabbur-al-mukminun', tarikh: '2026-11-25', julat: 'Ayat 102–104', tajuk: 'Timbangan Amal Penentu Kejayaan', tag: ['tadabbur', 'al-Mukminun', 'mizan', 'akhirat'],
    soalan: [
      { s: 'Apakah maksud berat timbangan dan ringan timbangan amal dalam ayat 102–103 Surah al-Mukminun, dan apakah kesudahan bagi setiap golongan tersebut?', blok: [
        { j: 'teks', t: 'Firman Allah SWT:' },
        { j: 'ayat', ar: 'فَمَن ثَقُلَتْ مَوَازِينُهُ فَأُولَٰئِكَ هُمُ الْمُفْلِحُونَ', maksud: 'Oleh itu, sesiapa yang berat timbangan (amal baik)nya, maka merekalah orang-orang yang berjaya.', ruj: 'Surah al-Mukminun, ayat 102' },
        { j: 'teks', t: 'Firman Allah SWT:' },
        { j: 'ayat', ar: 'وَمَنْ خَفَّتْ مَوَازِينُهُ فَأُولَٰئِكَ الَّذِينَ خَسِرُوا أَنفُسَهُمْ فِي جَهَنَّمَ خَالِدُونَ', maksud: 'Dan sesiapa yang ringan timbangan (amal baik)nya, maka merekalah orang-orang yang merugikan dirinya sendiri; mereka tetap kekal di dalam neraka Jahannam.', ruj: 'Surah al-Mukminun, ayat 103' },
        { j: 'teks', t: 'Imam al-Alusi menjelaskan maksud "berat timbangan" itu:' },
        { j: 'petikan', ar: 'فَمَنْ ثَقُلَتْ مَوَازِينُهُ أَيْ مَوْزُونَاتُ حَسَنَاتِهِ مِنَ الْعَقَائِدِ وَالْأَعْمَالِ', maksud: 'Maksud \'berat timbangannya\' ialah amal-amal baiknya yang ditimbang, iaitu akidah dan amalan soleh.', ruj: 'Tafsir Ruh al-Ma\'ani, al-Alusi, jld. 9, hlm. 265' }
      ]},
      { s: 'Bagaimanakah Allah SWT menggambarkan keadaan wajah ahli neraka dalam ayat 104?', blok: [
        { j: 'teks', t: 'Firman Allah SWT:' },
        { j: 'ayat', ar: 'تَلْفَحُ وُجُوهَهُمُ النَّارُ وَهُمْ فِيهَا كَالِحُونَ', maksud: 'Api neraka membakar muka mereka, dan mereka berada di dalamnya dalam keadaan yang buruk rupa (bibir tertarik menampakkan gigi).', ruj: 'Surah al-Mukminun, ayat 104' },
        { j: 'teks', t: 'Imam al-Alusi menjelaskan maksud كَالِحُونَ:' },
        { j: 'petikan', ar: 'وَهُمْ فِيهَا كَالِحُونَ مُتَقَلِّصُو الشِّفَاهِ عَنِ الْأَسْنَانِ مِنْ أَثَرِ ذَلِكَ اللَّفْحِ', maksud: 'Dan mereka di dalamnya (neraka) dalam keadaan \'kalihun\', iaitu bibir-bibir mereka tertarik naik daripada gigi akibat kesan bahang bakaran itu.', ruj: 'Tafsir Ruh al-Ma\'ani, al-Alusi, jld. 9, hlm. 265' },
        { j: 'teks', t: 'Imam al-Alusi menukilkan hadith yang menerangkan gambaran ini dengan lebih terperinci:' },
        { j: 'hadis', ar: 'تَشْوِيهُ النَّارِ فَتَقَلَّصُ شَفَتُهُ الْعُلْيَا حَتَّى تَبْلُغَ وَسَطَ رَأْسِهِ وَتَسْتَرْخِي شَفَتُهُ السُّفْلَى حَتَّى تَضْرِبَ سُرَّتَهُ', maksud: '(Itulah) kehinaan (wajah) akibat api neraka; bibir atasnya tertarik naik sehingga mencecah pertengahan kepalanya, dan bibir bawahnya melondoh turun sehingga menyentuh pusatnya.', ruj: 'HR Tirmizi, 2587; dinukil dalam Tafsir Ruh al-Ma\'ani, al-Alusi, jld. 9, hlm. 265' }
      ]}
    ]},
  { slug: 'penyesalan-ahli-neraka', siri: 'tadabbur-al-mukminun', tarikh: '2026-11-26', julat: 'Ayat 105–110', tajuk: 'Penyesalan Ahli Neraka', tag: ['tadabbur', 'al-Mukminun', 'akhirat', 'mengejek'],
    soalan: [
      { s: 'Apakah teguran Allah SWT kepada ahli neraka dalam ayat ini dan bagaimanakah Allah menjawab permohonan mereka untuk dikeluarkan dari neraka?', blok: [
        { j: 'teks', t: 'Allah SWT menegur ahli neraka dengan mengingatkan sebab azab mereka. Firman-Nya:' },
        { j: 'ayat', ar: 'أَلَمْ تَكُنْ آيَاتِي تُتْلَىٰ عَلَيْكُمْ فَكُنتُم بِهَا تُكَذِّبُونَ', maksud: 'Bukankah ayat-ayat-Ku telah dibacakan kepada kamu, lalu kamu selalu mendustakannya?', ruj: 'Surah al-Mukminun, ayat 105' },
        { j: 'teks', t: 'Imam al-Alusi menjelaskan:' },
        { j: 'petikan', ar: 'أَلَمْ تَكُنْ آيَاتِي تُتْلَى عَلَيْكُمْ عَلَى إِضْمَارِ الْقَوْلِ أَيْ يُقَالُ لَهُمْ تَعْنِيفًا وَتَوْبِيخًا وَتَذْكِيرًا لِمَا بِهِ اسْتَحَقُّوا مَا ابْتُلُوا بِهِ مِنَ الْعَذَابِ', maksud: '\'Bukankah ayat-ayat-Ku telah dibacakan kepada kamu\' ialah dengan menyimpan perkataan \'dikatakan\', iaitu dikatakan kepada mereka sebagai teguran keras, kecaman dan peringatan tentang sebab mereka layak menerima azab yang menimpa mereka.', ruj: 'Tafsir Ruh al-Ma\'ani, al-Alusi, jld. 9, hlm. 265–266' },
        { j: 'teks', t: 'Hal ini selari dengan firman Allah SWT:' },
        { j: 'ayat', ar: 'وَأَمَّا الَّذِينَ كَفَرُوا أَفَلَمْ تَكُنْ آيَاتِي تُتْلَىٰ عَلَيْكُمْ فَاسْتَكْبَرْتُمْ وَكُنتُمْ قَوْمًا مُّجْرِمِينَ', maksud: 'Dan adapun orang-orang yang kafir (akan dikatakan kepada mereka): \'Bukankah ayat-ayat-Ku telah dibacakan kepada kamu, lalu kamu berlaku sombong takbur dan kamu menjadi kaum yang berdosa?\'', ruj: 'Surah al-Jathiyah, ayat 31' },
        { j: 'teks', t: 'Ahli neraka mengaku kesesatan mereka lalu memohon dikeluarkan. Firman Allah SWT:' },
        { j: 'ayat', ar: 'قَالُوا رَبَّنَا غَلَبَتْ عَلَيْنَا شِقْوَتُنَا وَكُنَّا قَوْمًا ضَالِّينَ ۝ رَبَّنَا أَخْرِجْنَا مِنْهَا فَإِنْ عُدْنَا فَإِنَّا ظَالِمُونَ', maksud: 'Mereka berkata: \'Wahai Tuhan kami! Kami telah dikalahkan oleh kejahatan nasib kami dan menjadilah kami kaum yang sesat. Wahai Tuhan kami! Keluarkanlah kami daripadanya (neraka); kemudian jika kami kembali (kepada kekufuran) maka sesungguhnya kami adalah orang-orang yang zalim\'.', ruj: 'Surah al-Mukminun, ayat 106–107' },
        { j: 'teks', t: 'Imam al-Alusi menjelaskan maksud permohonan mereka:' },
        { j: 'petikan', ar: 'أَيْ رَبَّنَا أَخْرِجْنَا مِنَ النَّارِ وَأَرْجِعْنَا إِلَى الدُّنْيَا فَإِنْ عُدْنَا بَعْدَ ذَلِك إِلَى مَا كُنَّا عَلَيْهِ فِيهَا مِنَ الْكُفْرِ وَالْمَعَاصِي فَإِنَّا مُتَجَاوِزُونَ الْحَدَّ فِي الظُّلْمِ', maksud: 'Iaitu: Wahai Tuhan kami, keluarkanlah kami daripada neraka dan kembalikanlah kami ke dunia; jika selepas itu kami kembali kepada kekufuran dan maksiat yang kami lakukan di dunia, maka sesungguhnya kami melampaui batas dalam kezaliman.', ruj: 'Tafsir Ruh al-Ma\'ani, al-Alusi, jld. 9, hlm. 266' },
        { j: 'teks', t: 'Allah SWT menyatakan bahawa permintaan mereka tidak jujur:' },
        { j: 'ayat', ar: 'وَلَوْ رُدُّوا لَعَادُوا لِمَا نُهُوا عَنْهُ وَإِنَّهُمْ لَكَاذِبُونَ', maksud: '...dan kalaulah mereka dikembalikan (ke dunia), tentulah mereka akan mengulangi juga apa yang mereka telah dilarang melakukannya, dan sesungguhnya mereka adalah pendusta.', ruj: 'Surah al-An\'am, ayat 28' },
        { j: 'teks', t: 'Allah SWT menjawab permohonan mereka dengan penolakan yang tegas. Firman-Nya:' },
        { j: 'ayat', ar: 'قَالَ اخْسَئُوا فِيهَا وَلَا تُكَلِّمُونِ', maksud: 'Allah berfirman: \'Tinggallah kamu dengan kehinaan di dalamnya, dan janganlah kamu berkata-kata dengan-Ku\'.', ruj: 'Surah al-Mukminun, ayat 108' },
        { j: 'teks', t: 'Imam al-Alusi menjelaskan:' },
        { j: 'petikan', ar: 'قَالَ اللَّهُ سُبْحَانَهُ إِقْنَاطًا لَهُمْ أَشَدَّ إِقْنَاطٍ: اخْسَؤُوا فِيهَا، أَيْ ذَلُّوا وَانْزَجِرُوا انْزِجَارَ الْكِلَابِ إِذَا زُجِرَتْ، أَوِ اسْكُتُوا سُكُوتَ هَوَانٍ، وَلَا تُكَلِّمُونِ بِاسْتِدْعَاءِ الْإِخْرَاجِ مِنَ النَّارِ وَالرَّجْعِ إِلَى الدُّنْيَا', maksud: 'Allah SWT berfirman untuk memutuskan harapan mereka sepenuhnya: \'Ikhsa\'u fiha\', iaitu hina dan tersingkirlah kamu sebagaimana anjing apabila dihalau, atau diamlah dengan diam yang penuh kehinaan; dan \'janganlah kamu berkata-kata dengan-Ku\' dengan memohon dikeluarkan daripada neraka dan dikembalikan ke dunia.', ruj: 'Tafsir Ruh al-Ma\'ani, al-Alusi, jld. 9, hlm. 266' },
        { j: 'teks', t: 'Pada hari itu mereka tidak lagi dapat berhujah. Firman Allah SWT:' },
        { j: 'ayat', ar: 'هَٰذَا يَوْمُ لَا يَنطِقُونَ ۝ وَلَا يُؤْذَنُ لَهُمْ فَيَعْتَذِرُونَ', maksud: 'Inilah hari yang mereka tidak dapat berkata-kata. Dan tidak diizinkan mereka (memberi alasan), maka mereka tidak berdalih lagi.', ruj: 'Surah al-Mursalat, ayat 35–36' }
      ]},
      { s: 'Apakah sebab Allah SWT menolak permohonan ahli neraka dan siapakah "segolongan hamba-Ku" yang mereka ejek di dunia itu?', blok: [
        { j: 'teks', t: 'Allah SWT menjelaskan bahawa penolakan itu berpunca daripada sikap mereka terhadap golongan yang beriman. Firman-Nya:' },
        { j: 'ayat', ar: 'إِنَّهُ كَانَ فَرِيقٌ مِّنْ عِبَادِي يَقُولُونَ رَبَّنَا آمَنَّا فَاغْفِرْ لَنَا وَارْحَمْنَا وَأَنتَ خَيْرُ الرَّاحِمِينَ', maksud: 'Sesungguhnya telah ada segolongan daripada hamba-hamba-Ku (di dunia) berdoa dengan berkata: \'Wahai Tuhan kami! Kami telah beriman, maka ampunkanlah dosa kami dan berilah rahmat kepada kami, dan Engkaulah jua sebaik-baik pemberi rahmat\'.', ruj: 'Surah al-Mukminun, ayat 109' },
        { j: 'teks', t: 'Imam al-Alusi menjelaskan:' },
        { j: 'petikan', ar: 'إِنَّهُ تَعْلِيلٌ لِمَا قَبْلَهُ مِنَ الزَّجْرِ عَنِ الدُّعَاءِ... فَرِيقٌ مِنْ عِبَادِي وَهُمُ الْمُؤْمِنُونَ، وَقِيلَ: هُمُ الصَّحَابَةُ، وَقِيلَ: أَهْلُ الصُّفَّةِ رَضِيَ اللَّهُ تَعَالَى عَنْهُمْ أَجْمَعِينَ', maksud: 'Ayat ini ialah alasan bagi teguran sebelumnya yang menghalang mereka daripada berdoa... \'segolongan daripada hamba-Ku\' ialah orang-orang beriman; dikatakan juga mereka ialah para sahabat, dan dikatakan juga ahli Suffah RA seluruhnya.', ruj: 'Tafsir Ruh al-Ma\'ani, al-Alusi, jld. 9, hlm. 267' },
        { j: 'teks', t: 'Doa mereka sama seperti doa orang beriman yang dirakamkan Allah SWT:' },
        { j: 'ayat', ar: 'رَّبَّنَا إِنَّنَا سَمِعْنَا مُنَادِيًا يُنَادِي لِلْإِيمَانِ أَنْ آمِنُوا بِرَبِّكُمْ فَآمَنَّا ۚ رَبَّنَا فَاغْفِرْ لَنَا ذُنُوبَنَا', maksud: 'Wahai Tuhan kami! Sesungguhnya kami telah mendengar seruan seorang penyeru (Rasul) yang menyeru kepada iman, katanya: \'Berimanlah kamu kepada Tuhan kamu\', maka kami pun beriman. Wahai Tuhan kami! Ampunkanlah dosa-dosa kami.', ruj: 'Surah Ali \'Imran, ayat 193' },
        { j: 'teks', t: 'Allah SWT menyebut perbuatan buruk mereka terhadap golongan beriman itu. Firman-Nya:' },
        { j: 'ayat', ar: 'فَاتَّخَذْتُمُوهُمْ سِخْرِيًّا حَتَّىٰ أَنسَوْكُمْ ذِكْرِي وَكُنتُم مِّنْهُمْ تَضْحَكُونَ', maksud: 'Maka kamu menjadikan mereka sebagai bahan ejekan, sehingga kamu lupa mengingati Aku (disebabkan sibuk mengejek mereka), dan kamu pula selalu mentertawakan mereka.', ruj: 'Surah al-Mukminun, ayat 110' },
        { j: 'teks', t: 'Imam al-Alusi menjelaskan:' },
        { j: 'petikan', ar: 'فَاتَّخَذْتُمُوهُمْ سِخْرِيًّا أَيْ هُزُوًا... حَتَّى أَنْسَوْكُمْ بِتَشَاغُلِكُمْ بِالِاسْتِهْزَاءِ بِهِمْ ذِكْرِي أَيْ خَوْفَ عِقَابِي فِي هَذَا الْيَوْمِ. وَكُنْتُمْ مِنْهُمْ تَضْحَكُونَ وَذَلِك غَايَةُ الِاسْتِهْزَاءِ', maksud: '\'Maka kamu menjadikan mereka sebagai bahan ejekan\', iaitu sebagai bahan olok-olok... sehingga kesibukan kamu mengejek mereka menyebabkan kamu lupa mengingati-Ku, iaitu takut kepada azab-Ku pada hari ini. \'Dan kamu pula mentertawakan mereka\', dan itulah kemuncak sikap mengejek.', ruj: 'Tafsir Ruh al-Ma\'ani, al-Alusi, jld. 9, hlm. 267' },
        { j: 'teks', t: 'Sikap ini dicela oleh Allah SWT dalam firman-Nya:' },
        { j: 'ayat', ar: 'إِنَّ الَّذِينَ أَجْرَمُوا كَانُوا مِنَ الَّذِينَ آمَنُوا يَضْحَكُونَ ۝ وَإِذَا مَرُّوا بِهِمْ يَتَغَامَزُونَ', maksud: 'Sesungguhnya orang-orang yang berdosa itu, adalah mereka (di dunia) mentertawakan orang-orang yang beriman. Dan apabila orang-orang yang beriman lalu di hadapan mereka, mereka mengenyit-ngenyitkan mata (mengejek).', ruj: 'Surah al-Mutaffifin, ayat 29–30' },
        { j: 'teks', t: 'Imam al-Alusi menukilkan satu lagi huraian tentang maksud ayat ini, bahawa Allah menolak doa mereka kerana mereka mengejek para wali-Nya sehingga lupa takut kepada-Nya:' },
        { j: 'petikan', ar: 'وَقِيلَ: التَّعْلِيلُ عَلَى مَعْنَى إِنَّمَا خَسَأْنَاكُمْ كَالْكَلْبِ وَلَمْ نَحْتَفِلْكُمْ إِذْ دَعَوْتُمْ لِأَنَّكُمُ اسْتَهْزَأْتُمْ غَايَةَ الِاسْتِهْزَاءِ بِأَوْلِيَائِي حِينَ دَعَوْا وَاسْتَمَرَّ ذَلِك مِنْكُمْ حَتَّى نَسِيتُمْ ذِكْرِي بِالْكُلِّيَّةِ وَلَمْ تَخَافُوا عِقَابِي فَهَذَا جَزَاؤُكُمْ', maksud: 'Dan dikatakan: alasan ini bermaksud, Kami hanya menghina kamu seperti anjing dan tidak mengendahkan kamu ketika kamu berdoa, kerana kamu telah mengejek wali-wali-Ku sehabis-habis ejekan ketika mereka berdoa, dan ia berterusan daripada kamu sehingga kamu melupakan-Ku sepenuhnya serta tidak takut akan azab-Ku; maka inilah balasan kamu.', ruj: 'Tafsir Ruh al-Ma\'ani, al-Alusi, jld. 9, hlm. 267' },
        { j: 'teks', t: 'Allah SWT melarang sikap menghina orang beriman:' },
        { j: 'ayat', ar: 'يَا أَيُّهَا الَّذِينَ آمَنُوا لَا يَسْخَرْ قَوْمٌ مِّن قَوْمٍ عَسَىٰ أَن يَكُونُوا خَيْرًا مِّنْهُمْ', maksud: 'Wahai orang-orang yang beriman! Janganlah suatu kaum mencemuh dan merendah-rendahkan kaum yang lain, (kerana) harus puak yang dicemuh itu lebih baik daripada mereka.', ruj: 'Surah al-Hujurat, ayat 11' }
      ]}
    ]},
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
/* Kuliah Pemikiran: tiga kuliah daripada "Peta Sebab Kesilapan Berfikir" (sebelas sebab mata hati tersasar,
   Basa'ir li al-Muslim al-Mu'asir, Fasal 4, hlm. 105–151). Matan Arab disemak pemilik pada imej halaman kitab;
   nombor halaman ialah nombor cetakan. Nota cara menyampaikan untuk penceramah tidak dimasukkan. Tiada tarikh kuliah. */
EPISOD.push(
  {"slug":"mengapa-mata-hati-boleh-tersasar","siri":"kuliah-pemikiran","tarikh":"","julat":"Sebab 1–5 · hlm. 105–123","tajuk":"Mengapa Mata Hati Boleh Tersasar","tag":["pemikiran","basirah","al-Maydani","kesilapan berfikir"],"soalan":[{"s":"Waham daripada jiwa yang bergoncang (الوهم)","label":"Sebab 1","blok":[{"j":"teks","t":"Takut, tamak, syahwat atau marah menggoncang jiwa, lalu fikiran hilang imbangan dan mata hati tersasar. Yang penting ialah urutannya: jiwa bergoncang dahulu, kemudian fikiran, barulah mata hati."},{"j":"petikan","ar":"فيفقد الفكر توازنه، فتزيغ البصيرة عن الرؤية الصحيحة","maksud":"Lalu fikiran kehilangan keseimbangan, seterusnya basirah menyimpang daripada penglihatan yang benar. [terjemahan makna]","ruj":"Basa'ir li al-Muslim al-Mu'asir, al-Maydani, hlm. 107"},{"j":"ayat","ar":"إِذْ جَاءُوكُمْ مِنْ فَوْقِكُمْ وَمِنْ أَسْفَلَ مِنْكُمْ وَإِذْ زَاغَتِ الْأَبْصَارُ وَبَلَغَتِ الْقُلُوبُ الْحَنَاجِرَ وَتَظُنُّونَ بِاللَّهِ الظُّنُونَا","maksud":"Ketika mereka datang kepada kamu dari sebelah atas kamu dan dari sebelah bawah kamu, dan ketika penglihatan menjadi tersasar dan hati naik ke kerongkong, sedang kamu menyangka terhadap Allah dengan pelbagai sangkaan. [terjemahan makna]","ruj":"Surah al-Ahzab, ayat 10 · dibawa pengarang, hlm. 108"},{"j":"teks","t":"Yang mengalaminya para sahabat, bukan orang jahat. Pengarang menyebutnya keadaan tidak sihat yang sementara dan dimaafkan kerana keuzuran."},{"j":"teks","t":"Isu semasa: Penyebaran maklumat yang belum sahih. Ketika banjir, kemalangan atau kejadian jenayah, maklumat belum disahkan tersebar pantas dalam kumpulan WhatsApp, dan ketakutan bersama menjadikan kita menerima tanpa saringan."}]},{"s":"Alat yang lemah bertemu hati yang bangga (الغرور بالنفس)","label":"Sebab 2","blok":[{"j":"teks","t":"Orang yang bangga dengan dirinya mengintai melalui lubang pintu, melihat lima orang, lalu mendakwa tiada orang lain. Dia benar bahawa ada lima orang, tetapi tersilap bahawa tiada yang lain."},{"j":"petikan","ar":"وكان عليه أن يقول: لم أرَ غير خمسة أشخاص","maksud":"Sepatutnya dia berkata: aku tidak melihat selain lima orang. [terjemahan makna]","ruj":"Basa'ir li al-Muslim al-Mu'asir, al-Maydani, hlm. 110"},{"j":"petikan","ar":"والغرور بالنفس ينفخ فيها حتى تتورّم تورُّماً مَرَضِيّاً، فيُعْشِي على البصيرة والفكر وأدوات الحسّ","maksud":"Perasaan bangga diri meniup jiwa sehingga ia membengkak dengan bengkak yang berpenyakit, lalu merabunkan basirah, fikiran dan alat deria. [terjemahan makna]","ruj":"Basa'ir li al-Muslim al-Mu'asir, al-Maydani, hlm. 111"},{"j":"ayat","ar":"مَا زَاغَ الْبَصَرُ وَمَا طَغَىٰ","maksud":"Penglihatan itu tidak tersasar dan tidak pula melampaui batas. [terjemahan makna]","ruj":"Surah al-Najm, ayat 17 · dibawa pengarang, hlm. 109"},{"j":"teks","t":"Pengarang menjadikannya bukti bahawa Allah memelihara Rasulullah daripada dua penyakit sekali gus: menyimpang dan menokok tambah."},{"j":"teks","t":"Isu semasa: Budaya \"saya sudah tahu\". Satu keratan berita, satu klip pendek atau satu pihak sahaja dijadikan keseluruhan cerita."}]},{"s":"Pandangan bermula betul tetapi menyimpang (الحَوَل الفكري)","label":"Sebab 3","blok":[{"j":"teks","t":"Juling pemikiran: memulakan perjalanan dengan betul, tetapi tidak menyemak setiap langkah, lalu terpesong sambil menyangka masih di atas kebenaran. Pengarang juga menegur pendakwah yang menghukum manusia atas fitrah mereka."},{"j":"teks","t":"Menegur perbuatan ialah amar makruf. Menghukum fitrah menutup pintu taubat."},{"j":"petikan","ar":"ثمّ يسير غير متحرٍّ عن صحة المسيرة مع كلّ خطوة","maksud":"Kemudian berjalan tanpa menyemak ketepatan perjalanannya pada setiap langkah. [terjemahan makna]","ruj":"Basa'ir li al-Muslim al-Mu'asir, al-Maydani, hlm. 111"},{"j":"petikan","ar":"إنهم مفطورون على الشرّ، أو على الكفر","maksud":"Ungkapan yang ditegur: mereka memang difitrahkan atas kejahatan atau atas kekufuran. [terjemahan makna]","ruj":"Basa'ir li al-Muslim al-Mu'asir, al-Maydani, hlm. 116 (teguran kepada golongan agama)"},{"j":"ayat","ar":"فَأَقِمْ وَجْهَكَ لِلدِّينِ حَنِيفًا فِطْرَتَ اللَّهِ الَّتِي فَطَرَ النَّاسَ عَلَيْهَا لَا تَبْدِيلَ لِخَلْقِ اللَّهِ ذَلِكَ الدِّينُ الْقَيِّمُ وَلَكِنَّ أَكْثَرَ النَّاسِ لَا يَعْلَمُونَ","maksud":"Maka hadapkanlah wajahmu kepada agama dalam keadaan lurus. Itulah fitrah Allah yang Dia menciptakan manusia atasnya. Tiada penggantian bagi ciptaan Allah. Itulah agama yang lurus, tetapi kebanyakan manusia tidak mengetahui. [terjemahan makna]","ruj":"Surah al-Rum, ayat 30 · dibawa pengarang, hlm. 117"},{"j":"hadis","ar":"كُلُّ مَوْلُودٍ يُولَدُ عَلَى الفِطْرَةِ حَتَّى يُعْرِبَ عَنْهُ لِسَانُهُ، فَأَبَوَاهُ يُهَوِّدَانِهِ أَوْ يُنَصِّرَانِهِ أَوْ يُمَجِّسَانِهِ","maksud":"Setiap yang dilahirkan itu dilahirkan atas fitrah, sehinggalah lidahnya dapat berkata-kata. Maka kedua ibu bapanyalah yang menjadikannya Yahudi, atau Nasrani, atau Majusi. [terjemahan makna]","ruj":null},{"j":"teks","t":"Isu semasa: Bahasa yang menghukum fitrah. \"Memang jenis begitu\", \"memang sudah rosak\", \"memang tidak boleh diharap\" ditujukan kepada individu, kaum, penduduk sesuatu kawasan, bekas banduan atau bekas penagih."}]},{"s":"Hakikat berdampingan dengan syubhat (المشتبهات)","label":"Sebab 4","blok":[{"j":"teks","t":"Pengarang membezakan manhaj tingkah laku peribadi daripada hukum. Menjauhi syubhat ialah wara' untuk diri sendiri. Menghukum haram atau wajib untuk semua orang memerlukan dalil."},{"j":"petikan","ar":"أمّا الأحكام فلا يجوز البتّ فيها بالتحريم أو بالإيجاب مع وجود الاشتباه","maksud":"Adapun hukum, tidak harus diputuskan haram atau wajib sedangkan syubhat masih wujud. [terjemahan makna]","ruj":"Basa'ir li al-Muslim al-Mu'asir, al-Maydani, hlm. 119"},{"j":"hadis","ar":"إنّ الحلال بيّنٌ، وإنّ الحرام بيّنٌ، وبينهما أمورٌ مُشتبهاتٌ لا يعلمهنّ كثيرٌ من الناس، فمن اتّقى الشبهات فقد استبرأ لدينه وعِرضه، ومن وقع في الشبهات وقع في الحرام، كالراعي يرعى حول الحمى، يوشك أن يرتع فيه، ألا وإنّ لكلّ ملكٍ حمىً، ألا وإنّ حمى الله محارمُه، ألا وإنّ في الجسد مضغةً إذا صلحت صلح الجسد كله، وإذا فسدت فسد الجسد كله، ألا وهي القلب","maksud":"Yang halal itu jelas dan yang haram itu jelas, dan antara keduanya syubhat yang tidak diketahui kebanyakan manusia. Sesiapa memelihara dirinya daripada syubhat, dia telah membersihkan agama dan maruahnya. Setiap raja ada kawasan larangan, dan kawasan larangan Allah ialah perkara yang diharamkan-Nya. Di dalam jasad ada seketul daging; apabila ia baik, baiklah seluruh jasad. Ketahuilah, itulah hati. [terjemahan makna]","ruj":"Sahih al-Bukhari dan Sahih Muslim (hadis al-Nu'man bin Basyir), dibawa pengarang pada hlm. 118"},{"j":"teks","t":"Hadis ini mengajar berhati-hati untuk diri sendiri, bukan memberi kuasa menghukum orang lain. Rasulullah menutupnya dengan hati, bukan senarai hukum."},{"j":"teks","t":"Isu semasa: Mengharamkan sebelum menyelidik. Perkara baharu dilabel haram sebelum kajian syarak yang mencukupi, dan kehati-hatian peribadi dinaikkan menjadi hukum untuk seluruh masyarakat."}]},{"s":"Serupa sifatnya walaupun jauh berbeza (الشبه الجزئي)","label":"Sebab 5","blok":[{"j":"teks","t":"Keserupaan sebahagian tidak bermakna serupa seluruhnya. Manusia dan keldai sama-sama ada dua mata, tetapi tidak sah menyamakan keduanya. Pengarang menegur helah keserupaan separa untuk meyakinkan khalayak."},{"j":"petikan","ar":"فإنّه لا يصحّ لنا أن نقول: الإنسان حماري","maksud":"Tidak sah kita menyatakan bahawa manusia itu bercirikan keldai. [terjemahan makna]","ruj":"Basa'ir li al-Muslim al-Mu'asir, al-Maydani, hlm. 122"},{"j":"petikan","ar":"ومن أمثلة ذلك إطلاق أسماء الاشتراكية أو الرأسمالية أو الديمقراطية أو الديكتاتورية على نظام الإسلام","maksud":"Antara contohnya ialah melabelkan sistem Islam dengan nama sosialisme, kapitalisme, demokrasi atau diktator. [terjemahan makna]","ruj":"Basa'ir li al-Muslim al-Mu'asir, al-Maydani, hlm. 122"},{"j":"ayat","ar":"وَالَّذِينَ كَفَرُوا أَعْمَالُهُمْ كَسَرَابٍ بِقِيعَةٍ يَحْسَبُهُ الظَّمْآنُ مَاءً حَتَّى إِذَا جَاءَهُ لَمْ يَجِدْهُ شَيْئًا وَوَجَدَ اللَّهَ عِنْدَهُ فَوَفَّاهُ حِسَابَهُ وَاللَّهُ سَرِيعُ الْحِسَابِ","maksud":"Dan orang-orang yang kufur, amalan mereka umpama fatamorgana di tanah rata yang disangka air oleh orang yang dahaga, sehingga apabila dia mendatanginya, dia tidak mendapati apa-apa pun. Dan dia mendapati Allah di sisinya, lalu Allah menyempurnakan hisabnya. [terjemahan makna]","ruj":"Surah al-Nur, ayat 39 · dibawa pengarang, hlm. 120"},{"j":"teks","t":"Fatamorgana benar-benar kelihatan seperti air. Orang yang dahaga bukan pembohong; dia yakin apa yang dilihatnya ialah air."},{"j":"teks","t":"Isu semasa: Label ringkas yang menyamakan perkara yang jauh berbeza. Contoh dalam kitab: melabelkan sistem Islam dengan nama ideologi. Jangan menyebut nama mana-mana pihak semasa."}]},{"s":"Amalan untuk minggu ini","label":"Amalan","blok":[{"j":"teks","t":"1. Ubah satu ayat. Ganti \"memang tidak ada\" dengan \"saya tidak nampak\", dan \"dia memang begitu\" dengan \"perbuatan dia yang itu tidak betul\"."},{"j":"teks","t":"2. Beri jeda sehari. Tangguhkan keputusan besar yang timbul ketika marah, takut atau terlalu teruja."},{"j":"teks","t":"3. Berhenti menyebarkan sebelum menyemak. Sudah baca sepenuhnya? Tahu sumbernya? Ada manfaat?"}]}]},
  {"slug":"buaian-pemikiran","siri":"kuliah-pemikiran","tarikh":"","julat":"Sebab 6 · hlm. 123–143","tajuk":"Buaian Pemikiran","tag":["pemikiran","basirah","al-Maydani","kesilapan berfikir"],"soalan":[{"s":"Reaksi balas pantas ke hujung yang bertentangan (الأرجوحة الفكرية)","label":"Sebab 6","blok":[{"j":"teks","t":"Sebab terpanjang: 21 halaman dan lapan contoh. Penolakan kita betul, tetapi lompatan ke kutub bertentangan yang silap. Buaian pemikiran dilambungkan oleh pemilik kepentingan, sedangkan bumi hakikat berada di bawah kaki, di antara dua hujung."},{"j":"petikan","ar":"وبعملهم هذا ينتقلون من خطأ إلى خطأ آخر مثل الذي فرّوا منه، وربّما يكون الذي انتقلوا إليه أفحش وأشدّ بُعداً عن الحقيقة","maksud":"Dengan perbuatan itu mereka berpindah daripada satu kesilapan kepada kesilapan yang lain, malah adakalanya lebih buruk daripada yang asal. [terjemahan makna]","ruj":"Basa'ir li al-Muslim al-Mu'asir, al-Maydani, hlm. 123–124"},{"j":"petikan","ar":"ولرأوا أنّ أرض الحقيقة موجودة تحت أقدامهم بين الأقصيين","maksud":"Mereka akan menyedari bahawa bumi hakikat berada di bawah kaki mereka, di antara dua hujung. [terjemahan makna]","ruj":"Basa'ir li al-Muslim al-Mu'asir, al-Maydani, hlm. 125"},{"j":"petikan","ar":"إنّ شدّة التمسّك شيءٌ، والغلوّ شيءٌ آخر","maksud":"Kuat berpegang pada agama itu satu perkara, melampau itu satu perkara yang lain. [terjemahan makna]","ruj":"Basa'ir li al-Muslim al-Mu'asir, al-Maydani, hlm. 127"},{"j":"hadis","ar":"أَوَ يَأْتِي الخيرُ بالشرِّ؟! ... أَوَ خَيْرٌ هُوَ؟!","maksud":"Sahabat bertanya: adakah kebaikan mendatangkan keburukan? Rasulullah menjawab: adakah ia itu memang suatu kebaikan? [terjemahan makna]","ruj":"Sahih Muslim, menurut sandaran pengarang pada hlm. 140"},{"j":"teks","t":"Baginda membetulkan andaian soalan dan menunjukkan pintu ketiga. Harta ialah wasilah, tidak baik atau jahat pada zatnya. Pengarang menyandarkannya sebagai hadis sahih riwayat Muslim."},{"j":"ayat","ar":"يَاأَيُّهَا الَّذِينَ آمَنُوا إِنْ جَاءَكُمْ فَاسِقٌ بِنَبَإٍ فَتَبَيَّنُوا أَنْ تُصِيبُوا قَوْمًا بِجَهَالَةٍ فَتُصْبِحُوا عَلَى مَا فَعَلْتُمْ نَادِمِينَ","maksud":"Wahai orang-orang yang beriman, jika datang kepada kamu seorang fasik membawa sesuatu berita, maka selidikilah terlebih dahulu, supaya kamu tidak menimpakan sesuatu kaum dengan perkara yang tidak diingini dengan sebab kejahilan kamu, lalu kamu menjadi menyesal. [terjemahan makna]","ruj":"Surah al-Hujurat, ayat 6 · dalil tambahan, bukan daripada halaman kitab"},{"j":"teks","t":"Tabayyun ialah berhenti di tengah untuk menyemak, lawan kepada lompatan pantas."},{"j":"teks","t":"Isu semasa: Perpecahan dua kutub. Setiap pihak makin ekstrem sebagai reaksi kepada pihak lain, dan suara seimbang hilang."},{"j":"teks","t":"Isu semasa: Kehilangan ruang harus. Segala-galanya dimasukkan ke dalam wajib atau haram."},{"j":"teks","t":"Isu semasa: Mengharamkan wasilah yang neutral. Teknologi dan platform dihukum haram kerana kebanyakan orang menyalahgunakannya (halaman 140)."},{"j":"teks","t":"Isu semasa: Aurat dan penampilan. Ayunan antara mengabaikan sepenuhnya dengan menambah syarat yang tidak dituntut Syarak (halaman 126–127)."}]},{"s":"Amalan untuk minggu ini","label":"Amalan","blok":[{"j":"teks","t":"1. Cari pilihan ketiga. Sebelum menolak sesuatu pendirian, tanya apakah kedudukan di pertengahan."},{"j":"teks","t":"2. Akui kebenaran pada pihak yang kita tolak, dan satu kelemahan pada pihak yang kita pilih."},{"j":"teks","t":"3. Kembalikan ruang harus. Berhenti mewajibkan dan mengharamkan perkara yang tidak diwajibkan dan tidak diharamkan oleh Syarak."}]}]},
  {"slug":"lima-penyakit-yang-mengunci-fikiran","siri":"kuliah-pemikiran","tarikh":"","julat":"Sebab 7–11 · hlm. 144–151","tajuk":"Lima Penyakit yang Mengunci Fikiran","tag":["pemikiran","basirah","al-Maydani","kesilapan berfikir"],"soalan":[{"s":"Idea lama yang sudah mengendap (سوابق الأفكار)","label":"Sebab 7","blok":[{"j":"teks","t":"Idea terdahulu yang tetap merabunkan mata hati, kecuali apabila ia hakikat yang jelas dan tidak dicemari kebatilan. Tiga faktor kuasanya: kebiasaan, takbur dan ikatan kepentingan. Akhirnya akal menjadi membatu."},{"j":"teks","t":"Kuliah ini tidak mengajak membuang warisan. Ia mengajak memeriksanya."},{"j":"petikan","ar":"ومن شأن سوابق الأفكار الثوابت، أن تُعْشِي البصر والبصيرة","maksud":"Sifat idea terdahulu yang tetap ialah merabunkan penglihatan dan mata hati, kecuali apabila ia hakikat yang jelas. [terjemahan makna]","ruj":"Basa'ir li al-Muslim al-Mu'asir, al-Maydani, hlm. 144"},{"j":"petikan","ar":"ومن أمراض سوابق الأفكار تحجّرُ الذهن، وتبلّدُه","maksud":"Antara penyakitnya ialah akal menjadi membatu dan tumpul. [terjemahan makna]","ruj":"Basa'ir li al-Muslim al-Mu'asir, al-Maydani, hlm. 146"},{"j":"ayat","ar":"وَكَذَلِكَ مَا أَرْسَلْنَا مِنْ قَبْلِكَ فِي قَرْيَةٍ مِنْ نَذِيرٍ إِلَّا قَالَ مُتْرَفُوهَا إِنَّا وَجَدْنَا آبَاءَنَا عَلَى أُمَّةٍ وَإِنَّا عَلَى آثَارِهِمْ مُقْتَدُونَ","maksud":"Dan demikianlah, Kami tidak mengutuskan sebelummu seorang pemberi peringatan pun dalam sesebuah negeri, melainkan berkata orang-orang yang mewah hidupnya di situ: kami mendapati bapa-bapa kami menganut suatu jalan, dan kami hanya mengikut jejak langkah mereka. [terjemahan makna]","ruj":"Surah al-Zukhruf, ayat 23 · dalil tambahan, bukan daripada halaman kitab"},{"j":"teks","t":"Menggabungkan kebiasaan yang mengendap dan taklid buta. Yang mengucapkannya golongan yang paling banyak kepentingan."},{"j":"teks","t":"Isu semasa: Adat yang dinaikkan taraf menjadi agama. Amalan turun-temurun dalam majlis perkahwinan, kematian dan kenduri dianggap tuntutan agama semata-mata kerana sudah lama diamalkan."}]},{"s":"Taasub (التعصّب)","label":"Sebab 8","blok":[{"j":"teks","t":"Taasub ialah cabang keakuan, individu atau kumpulan. Dahulukan garis pemisah pengarang: menyokong yang benar kerana ia benar bukan taasub. Pengarang menegur taasub sehingga dalam kalangan ulama, pendakwah dan pertubuhan Islam."},{"j":"petikan","ar":"على أنّنا حينئذٍ لا نُسمّيه تعصّباً، بل هو انتصار للحقّ بالحقّ","maksud":"Ketika itu kita tidak menamakannya taasub; ia adalah memenangkan kebenaran dengan kebenaran. [terjemahan makna]","ruj":"Basa'ir li al-Muslim al-Mu'asir, al-Maydani, hlm. 146"},{"j":"petikan","ar":"والتعصّب فرعٌ من فروع الأنانية الفردية أو الجماعية","maksud":"Taasub ialah satu cabang daripada cabang keakuan, individu atau kumpulan. [terjemahan makna]","ruj":"Basa'ir li al-Muslim al-Mu'asir, al-Maydani, hlm. 146"},{"j":"petikan","ar":"كوحيد القرن الذي يرتبط بصره بخطوط الرؤية المتصلة برأس قرنه","maksud":"Umpama badak sumbu yang penglihatannya terikat dengan garis pandangan yang bersambung ke hujung tanduknya. [terjemahan makna]","ruj":"Basa'ir li al-Muslim al-Mu'asir, al-Maydani, hlm. 147"},{"j":"ayat","ar":"إِنَّ اللَّهَ لَا يَظْلِمُ النَّاسَ شَيْئًا وَلَكِنَّ النَّاسَ أَنْفُسَهُمْ يَظْلِمُونَ","maksud":"Sesungguhnya Allah tidak menzalimi manusia sedikit pun, akan tetapi manusia itulah yang menzalimi diri mereka sendiri. [terjemahan makna]","ruj":"Surah Yunus, ayat 44 · dalil tambahan, bukan daripada halaman kitab"},{"j":"teks","t":"Tiada ayat khusus bagi sebab ini dalam nota. Yunus 44 digunakan untuk merumuskan kelima-lima sebab terakhir."},{"j":"teks","t":"Isu semasa: Taasub parti dan jemaah. Membela pemimpin pilihan walaupun jelas bersalah, dan menyerang pihak lawan walaupun jelas benar."},{"j":"teks","t":"Isu semasa: Taasub kepada penceramah kegemaran. Menerima setiap pandangan tanpa penilaian dan menyerang kritikan yang berasas."}]},{"s":"Tergesa-gesa menghukum (التسرّع)","label":"Sebab 9","blok":[{"j":"teks","t":"Berpada dengan pandangan sepintas lalu tanpa menyelidik hakikat menjerumuskan seseorang ke dalam banyak kesilapan. Lima faktor: bangga diri, malas berfikir, hanyut bersama orang ramai, gejolak emosi dan desakan keperluan."},{"j":"petikan","ar":"إنّ التسرّع في إصدار الأحكام دون رويّة، مع عدم وضوح الرؤية","maksud":"Tergesa-gesa mengeluarkan hukum tanpa pertimbangan sedangkan pandangan belum jelas. [terjemahan makna]","ruj":"Basa'ir li al-Muslim al-Mu'asir, al-Maydani, hlm. 147"},{"j":"petikan","ar":"يستغلّهم عادةً أصحاب المصالح والأهواء، ببثّ الأفكار السريعة بينهم","maksud":"Khalayak yang digerakkan emosi seketika lazimnya dieksploitasi oleh pemilik kepentingan dengan menyebarkan idea yang pantas. [terjemahan makna]","ruj":"Basa'ir li al-Muslim al-Mu'asir, al-Maydani, hlm. 148"},{"j":"ayat","ar":"يَاأَيُّهَا الَّذِينَ آمَنُوا إِنْ جَاءَكُمْ فَاسِقٌ بِنَبَإٍ فَتَبَيَّنُوا أَنْ تُصِيبُوا قَوْمًا بِجَهَالَةٍ فَتُصْبِحُوا عَلَى مَا فَعَلْتُمْ نَادِمِينَ","maksud":"Wahai orang-orang yang beriman, jika datang kepada kamu seorang fasik membawa sesuatu berita, maka selidikilah terlebih dahulu, supaya kamu tidak menimpakan sesuatu kaum dengan perkara yang tidak diingini dengan sebab kejahilan kamu, lalu kamu menjadi menyesal. [terjemahan makna]","ruj":"Surah al-Hujurat, ayat 6 · dalil tambahan, bukan daripada halaman kitab"},{"j":"teks","t":"Akibat yang disebut ialah menyesal, kerana kemudaratan itu tidak boleh ditarik balik."},{"j":"teks","t":"Isu semasa: Penghakiman viral. Menjadi hakim dalam masa lima minit di ruangan komen berdasarkan satu klip yang tidak lengkap konteksnya."}]},{"s":"Hawa nafsu dan kepentingan peribadi (الغشاوة)","label":"Sebab 10","blok":[{"j":"teks","t":"Hawa nafsu, syahwat dan kepentingan duniawi membentangkan selaput ke atas mata hati, sehingga yang benar nampak batil dan yang batil nampak benar, mengikut tebalnya selaput. Kerana berperingkat, ia boleh dinipiskan."},{"j":"petikan","ar":"ومن شأن أهواء النفوس وشهواتها ومصالحها الخاصّة الدنيوية، أن تُعمي بصيرة الإنسان","maksud":"Sifat hawa nafsu, syahwat dan kepentingan duniawi peribadi ialah membutakan mata hati manusia. [terjemahan makna]","ruj":"Basa'ir li al-Muslim al-Mu'asir, al-Maydani, hlm. 149"},{"j":"petikan","ar":"فمن كان له هوى في اتجاه فكريٍّ معين، حجب عنه هذا الهوى رؤية الاتجاهات الأخرى","maksud":"Hawa itu melindunginya daripada melihat haluan lain. [terjemahan makna]","ruj":"Basa'ir li al-Muslim al-Mu'asir, al-Maydani, hlm. 149"},{"j":"ayat","ar":"أَفَرَأَيْتَ مَنِ اتَّخَذَ إِلَهَهُ هَوَاهُ وَأَضَلَّهُ اللَّهُ عَلَى عِلْمٍ وَخَتَمَ عَلَى سَمْعِهِ وَقَلْبِهِ وَجَعَلَ عَلَى بَصَرِهِ غِشَاوَةً فَمَنْ يَهْدِيهِ مِنْ بَعْدِ اللَّهِ أَفَلَا تَذَكَّرُونَ","maksud":"Maka adakah engkau melihat orang yang menjadikan hawa nafsunya sebagai tuhannya, dan Allah menghukumnya sesat berdasarkan pengetahuan-Nya, dan Allah memeteraikan pendengarannya dan hatinya, serta meletakkan selaput pada penglihatannya? [terjemahan makna]","ruj":"Surah al-Jathiyah, ayat 23 · dalil tambahan, bukan daripada halaman kitab"},{"j":"teks","t":"Perkataan غِشَاوَة (selaput) sama dengan yang digunakan pengarang pada halaman 149."},{"j":"teks","t":"Isu semasa: Konflik kepentingan yang tidak diakui. Menolak sesuatu dengan alasan prinsip, sedangkan puncanya ia menjejaskan periuk nasi atau kedudukan."}]},{"s":"Taklid buta (التقليد الأعمى)","label":"Sebab 11","blok":[{"j":"teks","t":"Pengarang mengiktiraf taklid sebagai keperluan. Yang menjadi penyakit ialah taklid tanpa mata hati pada setiap langkah dan dakwaan bahawa imam pasti benar dalam setiap masalah. Teguran ini dua hala: kepada pengikut mazhab dan kepada penyeru gagasan tidak bermazhab yang sezaman."},{"j":"petikan","ar":"من الحقّ أنّ التقليد ضرورة","maksud":"Antara kebenarannya ialah taklid itu suatu keperluan. [terjemahan makna]","ruj":"Basa'ir li al-Muslim al-Mu'asir, al-Maydani, hlm. 150"},{"j":"petikan","ar":"لكنّ الأتباع لا يُعذرون عند الله في ادّعاء أنّ إمامهم على صواب قطعاً في كلّ مسألة اجتهد فيها","maksud":"Para pengikut tidak dimaafkan di sisi Allah dalam mendakwa imam mereka pasti benar secara muktamad dalam setiap masalah yang diijtihadkannya. [terjemahan makna]","ruj":"Basa'ir li al-Muslim al-Mu'asir, al-Maydani, hlm. 151"},{"j":"petikan","ar":"وبمثل هذا الخطأ الفاحش يقع دعاة اللامذهبية المعاصرون","maksud":"Dengan kesilapan keji yang serupa juga terjatuhnya para penyeru gagasan tidak bermazhab yang sezaman. [terjemahan makna]","ruj":"Basa'ir li al-Muslim al-Mu'asir, al-Maydani, hlm. 151 (teguran dua hala)"},{"j":"ayat","ar":"وَكَذَلِكَ مَا أَرْسَلْنَا مِنْ قَبْلِكَ فِي قَرْيَةٍ مِنْ نَذِيرٍ إِلَّا قَالَ مُتْرَفُوهَا إِنَّا وَجَدْنَا آبَاءَنَا عَلَى أُمَّةٍ وَإِنَّا عَلَى آثَارِهِمْ مُقْتَدُونَ","maksud":"Dan demikianlah, Kami tidak mengutuskan sebelummu seorang pemberi peringatan pun dalam sesebuah negeri, melainkan berkata orang-orang yang mewah hidupnya di situ: kami hanya mengikut jejak langkah mereka. [terjemahan makna]","ruj":"Surah al-Zukhruf, ayat 23 · dalil tambahan, bukan daripada halaman kitab"},{"j":"teks","t":"Yang ditegur bukan mazhab. Yang ditegur ialah dakwaan kepastian yang mutlak."},{"j":"teks","t":"Isu semasa: Taasub kepada penceramah kegemaran dan percaya mutlak kepada seorang tokoh, sama ada tokoh mazhab atau tokoh sezaman, sehingga kritikan yang berasas diserang."}]},{"s":"Amalan untuk minggu ini","label":"Amalan","blok":[{"j":"teks","t":"1. Ucapkan satu pengakuan: sebut satu perkara yang betul pada pihak yang kita tidak setuju, di hadapan orang."},{"j":"teks","t":"2. Beri jeda sebelum menghakimi. Adakah saya tahu keseluruhan cerita, atau baru nampak satu keratan?"},{"j":"teks","t":"3. Ubah satu ayat. Dalam isu khilafiah, ganti \"ini yang betul\" dengan \"ini pandangan yang saya ikuti\"."}]}]}
);

/* Kuliah 4 (sumber luar): nota daripada rakaman "WUI 1.0: Kolonial Kapitalis, Neo Liberalisme".
   Ditulis semula secara ringkas daripada transkrip mesin rakaman (bukan verbatim) dan dinisbahkan kepada penceramah.
   Soal jawab penonton yang tidak jelas dan ramalan tentang individu sebenar tidak dimasukkan.
   mula = saat dalam rakaman (untuk pautan minit ke YouTube). */
EPISOD.push({
  slug: 'kolonial-kapitalis-neoliberalisme', siri: 'kuliah-pemikiran', kategori: 'sejarah', tarikh: '', julat: 'Sumber luar · rakaman 2 jam 12 minit',
  tajuk: 'WUI 1.0: Kolonial Kapitalis, Neo Liberalisme', tag: ['kolonialisme', 'kapitalisme', 'neoliberalisme', 'teknofeudalisme', 'geopolitik'],
  luar: {
    tajuk: 'WUI 1.0: Kolonial Kapitalis, Neo Liberalisme', sesi: 'Projek Israelisasi di Asia Tenggara',
    penceramah: 'Prof. Farish', saluran: 'Abdul Razak', url: 'https://www.youtube.com/watch?v=4uPTvYYC9bw',
    nota: 'Nota ini ringkasan Ruang Ilmu daripada rakaman, bukan transkrip. Pandangan ialah pandangan penceramah. Tonton rakaman asal untuk kata-kata sebenar.'
  },
  soalan: [
    { s: 'Kolonialisme baharu bermula dengan modal', label: 'Bahagian 1', mula: 0, blok: [
      { j: 'teks', t: 'Menurut penceramah, membincangkan Zionisme di rantau ini bermakna membincangkan kolonialisme baharu. Penjajahan moden berbeza daripada empayar klasik seperti Rom, Assyria atau Mesir. Ia ialah kolonial kapitalisme yang muncul sejak abad ke-17.' },
      { j: 'teks', t: 'Soalan asasnya: bagaimana beberapa ribu orang Belanda boleh menguasai Indonesia selama lebih 200 tahun, dan beberapa ribu orang Inggeris menguasai India? Jawapan penceramah: kehebatan kolonial kapitalisme ialah ia membuka ruang untuk masyarakat yang dijajah mengambil bahagian dalam penjajahan mereka sendiri.' },
      { j: 'teks', t: 'Pengaruh hari ini masuk melalui modal dan lobi perniagaan, bukan lobi politik. Soalan yang perlu ditanya: sudahkah kita mencapai kedaulatan ekonomi, atau kita bergantung kepada struktur global yang tidak kita kawal?' },
      { j: 'teks', t: 'Syarikat India Timur Inggeris, kata penceramah, sangat dibenci di Parlimen Inggeris sendiri kerana ia beroperasi di luar batas perlembagaan dan menguntungkan golongan oligarki, bukan rakyat Inggeris. Untuk zaman ini beliau mencadangkan tulisan dan syarahan Yanis Varoufakis tentang teknofeudalisme.' }
    ]},
    { s: 'Adakah kolonialisme sudah tamat?', label: 'Bahagian 2', mula: 420, blok: [
      { j: 'teks', t: 'Moderator memperkenalkan tajuk sesi, "Projek Israelisasi di Asia Tenggara": wacana tentang Zionisme tidak harus tertumpu di Asia Barat sahaja kerana pengaruhnya juga bergerak di rantau ini.' },
      { j: 'teks', t: 'Penceramah mempersoalkan istilah "pascakolonial". Ia memberi gambaran seolah-olah kolonialisme telah tamat. Sejarah tidak bergerak secara episodik seperti siri Netflix (prakolonial, kolonial, pascakolonial). Ia bergerak ke pelbagai arah dan boleh berulang.' },
      { j: 'teks', t: 'Masyarakat pascakolonial cenderung mengingati keganasan zaman penjajahan: perang, pembunuhan, pengeboman. Yang lebih kekal ialah struktur dan institusi yang dibawa penjajah.' }
    ]},
    { s: 'Struktur kolonial kapitalisme: pasaran tawanan dan kontrak', label: 'Bahagian 3', mula: 720, blok: [
      { j: 'teks', t: 'Penceramah merujuk istilah "kolonial kapitalisme" yang digunakan Syed Hussein Alatas: kolonialisme moden tidak boleh difahami tanpa kapitalisme kerana keduanya saling menyokong. Belanda tidak datang ke Indonesia untuk bercuti di Bali. Tujuannya membina sistem ekonomi yang menjadikan tanah jajahan bergantung.' },
      { j: 'teks', t: 'Pasaran tawanan (captive market): ambil sumber tanah jajahan, proses di negara penjajah, kemudian jual semula. Contohnya getah dibawa ke England, dijadikan tayar, dan tayar dijual semula kepada kita.' },
      { j: 'teks', t: 'Tentera kolonial di India dan Indonesia (KNIL) kebanyakannya anak tempatan. Kenapa mereka sanggup? Kerana kolonial kapitalisme membawa sesuatu yang baharu: kontrak. Penceramah memetik episod dalam tulisan Munsyi Abdullah ketika tentera Syarikat India Timur berkumpul di Melaka sebelum menyerang Jawa (1811–1816). Askar India yang ditanya menjawab bahawa di bawah raja mereka dikerah tanpa gaji, sedangkan syarikat memberi gaji tetap, bekalan, senjata dan jaminan untuk keluarga jika mereka mati.' },
      { j: 'teks', t: 'Selepas merdeka, negara-negara bekas jajahan mewarisi peta dan sempadan yang dilukis di London, The Hague, Paris dan Madrid. Gagasan menyatukan semula wilayah seperti Melayu Raya, Indonesia Raya dan Maphilindo semuanya gagal. Penceramah mencadangkan buku Basil Davidson, The Black Man\'s Burden: Africa and the Curse of the Nation-State.' },
      { j: 'teks', t: 'Negara baharu masuk ke pentas antarabangsa yang peraturan dan normanya telah ditetapkan kuasa kolonial. Kita juga menerima konsep negara bangsa seolah-olah ia jatuh dari langit, padahal ia hasil proses kuasa.' }
    ]},
    { s: 'Pembangunan dan neoliberalisme', label: 'Bahagian 4', mula: 1560, blok: [
      { j: 'teks', t: 'Menurut penceramah, "pembangunan" ialah konsep abad ke-19 yang lahir bersama kapitalisme. Pertumbuhan 4% sering bermakna 4% lagi alam dimusnahkan, tetapi ia tetap dianggap positif kerana kita semua patuh kepada logik yang sama.' },
      { j: 'teks', t: 'Neoliberalisme muncul sekitar 1980. Selepas Perang Dunia Kedua, negara-negara Eropah membina negara kebajikan: perkhidmatan kesihatan percuma (NHS), pendidikan murah, pos, elektrik dan kereta api milik kerajaan, iaitu milik rakyat. Tesis neoliberal pula: negara harus mengecil dan institusi seperti hospital dan universiti harus diswastakan atas nama kecekapan dan persaingan.' },
      { j: 'teks', t: 'Hasilnya, kata penceramah, kos dipotong, pekerja dibuang dan yuran naik. Di England ia dikenali sebagai Thatcherisme, di Amerika Reaganomics. Ia datang dalam satu pakej bersama naratif kebebasan individu dan "pilihan".' },
      { j: 'teks', t: 'Contoh yang beliau saksikan sebagai pelajar di England pada 1980-an: syarikat awam disenaraikan dan rakyat biasa ditawarkan saham kecil. Rakyat biasa akhirnya menjual saham itu, dan saham berpindah ke tangan syarikat besar. Penceramah menyifatkannya sebagai "rampasan kuasa terhadap rakyat" yang semuanya sah di sisi undang-undang.' }
    ]},
    { s: 'Krisis 1997–98, kapitalisme kasino dan teknofeudalisme', label: 'Bahagian 5', mula: 2160, blok: [
      { j: 'teks', t: 'Malaysia dan Indonesia mengikut model yang sama pada 1980-an dan 1990-an melalui penswastaan. Penceramah menyebut ahli ekonomi Jomo K. S. yang sejak 1980-an telah memberi amaran tentang kesan jangka panjangnya.' },
      { j: 'teks', t: 'Kilang-kilang Barat berpindah ke negara berkos rendah. Penceramah memberi contoh Amerika: pekerja marah kerana kehilangan kerja dan menyalahkan China, tetapi yang memindahkan modal ke China ialah golongan kapitalis mereka sendiri.' },
      { j: 'teks', t: 'Ekonomi pascaindustri bergantung kepada perbankan, kewangan dan spekulasi, yang disebut Susan Strange sebagai "kapitalisme kasino". Menurut penceramah, kemasukan bank dan modal asing atas nama liberalisasi, ditambah pinjaman yang diberi tanpa saringan, mencipta gelembung yang pecah dalam krisis kewangan Asia 1997–98.' },
      { j: 'teks', t: 'Lima faktor keadaan hari ini, menurut penceramah: (1) peralihan ke kapitalisme pascaindustri, (2) ekonomi perkhidmatan dan kewangan, (3) logik neoliberal yang tidak berubah, (4) negara yang mengecil dan melemah, dan (5) elit kapitalis teknologi yang semakin kuat, iaitu teknofeudalisme. Konflik hari ini jarang berlaku secara terbuka. Ia berlaku melalui teknologi, data dan pelaburan.' }
    ]},
    { s: 'Media sosial, universiti dan "Berkeley Mafia"', label: 'Bahagian 6', mula: 2760, blok: [
      { j: 'teks', t: 'Penceramah bimbang dengan kebergantungan rantau ini kepada media sosial sebagai sumber maklumat. Analisis politik di rantau ini juga sering melihat sejarah sebagai tarikh dan nama, sedangkan sejarah ialah proses.' },
      { j: 'teks', t: 'Pendidikan politik diperlukan, terutama untuk aktivis muda. Ia memerlukan kefahaman tentang ekonomi baharu dan teknologi, termasuk daripada orang yang pernah bekerja di dalam syarikat teknologi.' },
      { j: 'teks', t: 'Universiti di negara Selatan, kata penceramah, mengejar KPI dan kedudukan antarabangsa mengikut standard Barat. Beliau belum bertemu "universiti Selatan" yang mengajar teori kebergantungan atau bagaimana kemiskinan dan ketidaksamaan dihasilkan oleh struktur. Di Indonesia, teknokrat yang dilatih di Amerika dan dikenali sebagai "Berkeley Mafia" membawa pulang model ekonomi yang sama.' },
      { j: 'teks', t: 'Kapitalisme juga boleh menjadi inklusif apabila ada peluang keuntungan. Penceramah memberi contoh muzik jazz dan Michael Jackson, juga ekonomi hijab. Yang tidak diterima ialah gerakan yang anti-hegemoni dan anti-kapitalis, lalu dilabel ekstremis. Peraturannya mudah: kamu boleh masuk ke dalam sistem, tetapi mesti patuh.' }
    ]},
    { s: 'Kebergantungan dan keretakan masyarakat', label: 'Bahagian 7', mula: 3600, blok: [
      { j: 'teks', t: 'Negara seperti Malaysia bergantung kepada pihak lain untuk payung keselamatan dan senjata, jadi ia boleh dikenakan sekatan atau dikambinghitamkan. Penceramah bimbang krisis ekonomi akan memecahkan keretakan sedia ada dalam masyarakat, seperti yang berlaku di Indonesia pada 1998.' },
      { j: 'teks', t: 'Kita perlu memahami landskap sosial dan politik negara sendiri secara mendalam, termasuk mengapa sesetengah kelompok tidak bersimpati dengan isu Palestin. Generasi Z yang sinis dan tiada jaminan masa depan menjadi tanah subur untuk politik konflik.' },
      { j: 'teks', t: 'Satu soalan yang tidak selesa: penjajah berjaya kerana sebahagian daripada kita turut bekerjasama. Ketidakupayaan berdepan dengan realiti ini, kata penceramah, mendorong kita lari kepada nostalgia dan fantasi.' }
    ]},
    { s: 'Garis merah dan persaingan kuasa kapitalis', label: 'Bahagian 8', mula: 4260, blok: [
      { j: 'teks', t: 'Menurut penceramah, ada "garis merah" bagi pemimpin Dunia Ketiga. Sesetengah musuh dikekalkan kerana berguna, dan seseorang menjadi sasaran apabila kepentingan ekonomi menjadi lebih penting. Konflik yang dilaporkan media antarabangsa mungkin seperti wayang kulit: ada kepentingan lain di belakangnya.' },
      { j: 'teks', t: 'Beliau tidak bersetuju bahawa dunia kembali kepada Perang Dingin. China dan Rusia kini mengamalkan kapitalisme (China dalam bentuk kapitalisme autoritarian), jadi persaingan hari ini ialah antara kuasa-kuasa kapitalis seperti abad ke-19.' },
      { j: 'teks', t: 'Pelaburan tidak percuma; ia datang dengan syarat. Kerana itu kita perlu memahami apa yang sebenarnya berlaku apabila modal asing masuk. Penceramah juga menggalakkan kita belajar tentang Afrika terus daripada orang Afrika, bukan melalui saluran berita Barat.' }
    ]},
    { s: 'Pembodohan masyarakat dan agama yang dijinakkan', label: 'Bahagian 9', mula: 5040, blok: [
      { j: 'teks', t: 'Penceramah memetik Dietrich Bonhoeffer tentang kebodohan: individu yang jahil tidak berdosa, tetapi masyarakat boleh diperbodohkan secara sengaja. Dahulu melalui propaganda, kini melalui hiburan. Media sosial, kata beliau, ialah senjata yang memudahkan masyarakat dilaga-lagakan.' },
      { j: 'teks', t: 'Melawan dengan meniru tidak mengubah apa-apa. Penceramah memberi contoh "Mecca Cola" dan "Zam Zam Cola": hujungnya tetap cola. Yang kurang ialah solidariti dengan rakyat biasa di Barat yang juga ditindas oleh sistem yang sama. Jawapannya ialah meningkatkan kefahaman rasional, sama seperti melawan kepercayaan karut dengan sains.' },
      { j: 'teks', t: 'Kekayaan itu relatif dan ditentukan masyarakat. Seorang diri di pulau dengan 500 tan emas tidak kaya dan tidak miskin. Konsep asas seperti kuasa, kekayaan dan rasuah boleh diajar dengan mudah di surau dan madrasah. Penceramah juga menyebut bahawa wacana kuasa dan hegemoni sudah ada dalam tradisi Islam: "dari Ibn Khaldun ke Gramsci tidak jauh".' },
      { j: 'teks', t: 'Legasi kolonial: politik, ekonomi dan keselamatan dipegang penjajah, manakala agama dan adat diserahkan kepada raja-raja. Akibatnya, menurut penceramah, agama dikecilkan kepada ritual dan dipisahkan daripada politik. Pengaruh luar pula tidak perlu hadir secara fizikal; ia boleh dikawal dari jauh, seperti Mesir di bawah Inggeris.' }
    ]},
    { s: 'Gen Z, negara broker dan kemandirian sains', label: 'Bahagian 10', mula: 6000, blok: [
      { j: 'teks', t: 'Penceramah mencadangkan isu Palestin dilihat sebagai isu kemanusiaan dan isu Dunia Ketiga, bukan semata-mata isu agama, supaya solidariti lebih luas.' },
      { j: 'teks', t: 'Generasi Z menghadapi ekonomi gig dan "tamatnya pekerjaan tetap", jadi isu geopolitik terasa jauh. Modal kini merentas negara (post-state capital). Mengikut ramalan Varoufakis, negara bergerak daripada "negara rentier" kepada "negara broker" untuk syarikat gergasi, dan rakyat biasa hilang suara.' },
      { j: 'teks', t: 'Universiti tidak harus sekadar melahirkan pekerja teknologi. Kita perlukan masyarakat yang fasih teknologi dengan minda kritis, dan aktivisme baharu dengan perbendaharaan kata baharu. Penceramah mencadangkan surau dan madrasah menganjurkan pengajian asas tentang teknologi dan bagaimana syarikat teknologi membuat untung.' },
      { j: 'teks', t: 'Tentang kemandirian: Iran membina asas saintifiknya sendiri di bawah sekatan, dan China menarik saintis antarabangsa dengan fakulti berbahasa Inggeris. Menurut penceramah, Malaysia perlu meletakkan penyelidikan sains, tenaga dan keselamatan makanan sebagai keutamaan keselamatan negara, bukan sibuk bertelagah tentang siapa mencipta batik atau nasi ayam.' }
    ]},
    { s: 'Penutup moderator: Surah al-Kahfi dan wang', label: 'Penutup', mula: 7560, blok: [
      { j: 'teks', t: 'Pandangan moderator: wacana agama hari ini masih memakai kerangka zaman kolonial, sehingga isu kuasa dan penjajahan jarang dibincangkan di surau.' },
      { j: 'teks', t: 'Moderator melihat Surah al-Kahfi sebagai surah untuk berdepan zaman fitnah. Empat kisahnya menyentuh soal harta: Ashabul Kahfi membawa bekal wang, pemilik dua kebun (monopoli harta), Nabi Musa dan Khidir (upah), dan Zulqarnain (cukai). Menurutnya, wang menentukan sama ada kita dijajah atau berdikari.' }
    ]}
  ],
  dakwaan: [
    { t: 'Nvidia mempunyai kaitan dengan Israel, dan pelaburan Nvidia di Malaysia membawa pengaruh itu masuk ke universiti, teknologi dan ekonomi.', j: 'dibahas', mula: 120 },
    { t: 'Lobi normalisasi dengan Israel di Indonesia datang daripada lobi perniagaan; Indonesia antara pengeksport minyak sawit terbesar ke Israel.', j: 'dibahas', mula: 120 },
    { t: 'Kira-kira lapan tahun lalu Netanyahu memaparkan peta dan berkata "we are colouring the map blue".', j: 'dibahas', mula: 480, oleh: 'moderator' },
    { t: 'Pemimpin anti-kolonial tahun 1960-an seperti Lumumba dan Nkrumah dibunuh atau digulingkan.', j: 'dibahas', mula: 780 },
    { t: 'Indonesia, Thailand dan Filipina mempunyai kadar penggunaan media sosial tertinggi di dunia (lebih 8 jam sehari), berbanding Jepun sekitar 1 jam 40 minit.', j: 'dibahas', mula: 2780 },
    { t: 'Sekitar 1996, editorial Financial Times menyambut Taliban menawan Kabul kerana ia membuka jalan untuk saluran paip minyak dan gas.', j: 'dibahas', mula: 3480 },
    { t: 'Penurunan taraf Indonesia oleh MSCI ialah amaran politik terhadap reformasi kerajaan.', j: 'pendapat', mula: 3540 },
    { t: 'African Oil Policy Initiative Group (AOPIG) ditubuhkan di Washington selepas Perang Teluk untuk menguasai minyak Afrika, dengan kepentingan Israel di belakangnya.', j: 'dibahas', mula: 4740 },
    { t: 'Minyak dan gas sesetengah negara Afrika telah dijual untuk tempoh 75 tahun.', j: 'dibahas', mula: 4900 },
    { t: 'Banyak konflik di Afrika dirancang dari luar untuk mengekalkan kelemahan negara-negara Afrika.', j: 'pendapat', mula: 5160 },
    { t: 'Kerangka fardu ain yang sempit dan istilah "lingkaran syaitan" berasal daripada Snouck Hurgronje.', j: 'dibahas', mula: 7560, oleh: 'moderator' }
  ],
  bacaan: [
    'Yanis Varoufakis, Technofeudalism (dan syarahan dalam talian beliau)',
    'Syed Hussein Alatas, tentang kolonial kapitalisme',
    "Basil Davidson, The Black Man's Burden: Africa and the Curse of the Nation-State",
    'Abdullah Munsyi, Hikayat Abdullah',
    'Susan Strange, Casino Capitalism',
    'Jomo K. S., tulisan tentang ekonomi politik Malaysia sejak 1980-an',
    'Dietrich Bonhoeffer, tentang kebodohan (theory of stupidity)',
    'George Monbiot, tentang pembangunan'
  ]
});

/* Kuliah 5: ringkasan bacaan edisi bahasa Malaysia. */
EPISOD.push({
  "slug": "perangai-bangsa-melayu",
  "siri": "kuliah-pemikiran",
  "kategori": "sejarah",
  "tarikh": "",
  "julat": "Ringkasan mengikut bab · Mitos Peribumi Malas (1989)",
  "tajuk": "Perangai Bangsa Melayu",
  "tag": [
    "Syed Hussein Alatas",
    "Mitos Peribumi Malas",
    "kolonialisme",
    "sejarah Melayu",
    "watak nasional"
  ],
  "sumber": [
    "primer: Syed Hussein Alatas. Mitos Peribumi Malas. Edisi bahasa Malaysia. Kuala Lumpur: Dewan Bahasa dan Pustaka, 1989. ISBN 983-62-0765-1."
  ],
  "soalan": [
    {
      "s": "Apa yang disiasat Alatas?",
      "label": "Pendahuluan · hlm. xi–xvii",
      "blok": [
        { "j": "teks", "t": "Syed Hussein Alatas meneliti bagaimana gambaran orang Melayu, Jawa dan Filipina sebagai “peribumi malas” terbentuk, siapa yang menyebarkannya, dan apa kegunaannya dalam pemerintahan kolonial. Kajian ini membandingkan catatan sejarah dari abad ke-16 hingga abad ke-20 dengan keadaan sosial dan ekonomi masyarakat yang digambarkan." },
        { "j": "teks", "t": "Alatas menggunakan sosiologi pengetahuan untuk menghubungkan idea dengan kedudukan orang yang menghasilkannya. Dalam kerangka beliau, ideologi kolonial membantu mewajarkan suatu susunan kuasa dengan menonjolkan pemerhatian yang menyokongnya dan mengetepikan bukti yang mengganggu gambaran itu." }
      ]
    },
    {
      "s": "Gambaran awal orang Melayu",
      "label": "Bab 1–2 · hlm. 1–21",
      "blok": [
        { "j": "teks", "t": "Alatas membandingkan catatan tentang masyarakat Melayu sebelum dan sekitar zaman Raffles dengan tulisan pegawai British pada zaman penguasaan British. Catatan awal dan sumber Melayu memberi bahan untuk melihat kegiatan ekonomi, kewajipan dan nilai masyarakat dari lebih daripada satu sudut." },
        { "j": "teks", "t": "Hugh Clifford dan Frank Swettenham menulis ketika masyarakat Melayu sedang mengalami perubahan besar di bawah pemerintahan British. Alatas membaca gambaran mereka dengan mengambil kira siapa yang ditemui pegawai kolonial dan bagaimana kedudukan mereka membentuk tafsiran tentang seluruh masyarakat." }
      ]
    },
    {
      "s": "Gambaran di Filipina dan Jawa",
      "label": "Bab 3–4 · hlm. 22–44",
      "blok": [
        { "j": "teks", "t": "Di Filipina, Alatas meneliti penilaian penulis Eropah dalam konteks penguasaan Sepanyol. Catatan seperti tulisan Careri dan Jagor menunjukkan bagaimana pemerhati mencantumkan pemerhatian tentang amalan harian dengan kesimpulan luas tentang kebolehan dan kerajinan penduduk." },
        { "j": "teks", "t": "Di Jawa, tanggapan bahawa orang Jawa malas semakin kuat ketika kuasa Belanda berkembang. Alatas mengaitkan penggunaan gambaran itu dengan pertikaian antara golongan liberal dan konservatif pada zaman sistem tanaman paksa. Perdebatan tentang watak penduduk juga merupakan perdebatan tentang cara mengurus tenaga kerja." }
      ]
    },
    {
      "s": "Apakah yang dikira sebagai kerja?",
      "label": "Bab 5 · hlm. 45–60",
      "blok": [
        { "j": "teks", "t": "Menurut Alatas, gambaran peribumi malas mendapat kekuatannya ketika takrif kerja kapitalis kolonial menjadi ukuran utama. Kerja yang menyara rumah tangga atau dilakukan untuk pasaran setempat mudah terlepas daripada penilaian pihak yang memerlukan buruh bagi perusahaan mereka." },
        { "j": "teks", "t": "Keengganan seseorang bekerja dalam suatu perusahaan boleh dipengaruhi oleh pilihan lain, upah dan keadaan kerja. Alatas meminta pembaca membezakan antara pemerhatian bahawa seseorang mengelakkan pekerjaan tertentu dengan kesimpulan tentang tabiat kerjanya dalam semua keadaan." }
      ]
    },
    {
      "s": "Bagaimana buruh diperoleh?",
      "label": "Bab 6 · hlm. 61–78",
      "blok": [
        { "j": "teks", "t": "Alatas membandingkan sistem tanaman paksa di Jawa, kerja paksa di Filipina dan penggunaan buruh kontrak dari China serta India di Malaya. Kaedah pengerahan ini timbul dalam susunan kuasa dan pasaran buruh yang berbeza." },
        { "j": "teks", "t": "Di Malaya, pekerja kontrak yang dipuji kerana rajin boleh tetap terikat pada keadaan kerja yang menindas. Perbandingan itu menunjukkan bahawa penilaian tentang siapa yang rajin atau malas perlu dibaca bersama kepentingan majikan, kebebasan pekerja untuk memilih dan cara keuntungan perusahaan diperoleh." }
      ]
    },
    {
      "s": "Jawapan José Rizal",
      "label": "Bab 7 · hlm. 79–96",
      "blok": [
        { "j": "teks", "t": "Alatas membincangkan esei José Rizal mengenai kemalasan yang diterbitkan secara bersiri dalam La Solidaridad pada 1890. Rizal meneliti bagaimana keadaan di bawah pemerintahan Sepanyol, termasuk paksaan dan halangan terhadap kegiatan ekonomi, boleh melemahkan dorongan untuk berusaha." },
        { "j": "teks", "t": "Rangka sejarah Rizal mengalihkan pertanyaan daripada sifat yang kononnya diwarisi kepada keadaan yang boleh berubah. Pertanyaan itu juga membuka ruang untuk melihat kegiatan masyarakat Filipina sebelum dan semasa penjajahan." }
      ]
    },
    {
      "s": "Daripada pemerhatian kepada stereotaip",
      "label": "Bab 8–9 · bermula hlm. 97",
      "blok": [
        { "j": "teks", "t": "Alatas mempersoalkan kaedah pemerhati yang mengubah kesan sepintas lalu dan pengalaman dengan kelompok tertentu menjadi gambaran watak nasional. Kesimpulan tentang seluruh masyarakat memerlukan bukti yang lebih luas daripada anekdot atau pemerhatian terhadap segelintir orang." },
        { "j": "teks", "t": "Dalam perbincangan tentang masyarakat Melayu, Alatas mengaitkan tuduhan malas dengan keengganan bekerja di ladang kolonial. Untuk menilai kerajinan, pembaca perlu melihat pekerjaan yang dilakukan dalam pelbagai keadaan serta memahami kedudukan sosial dan peluang mereka yang diperhatikan. (Bab 9, hlm. 104.)" }
      ]
    },
    {
      "s": "Bagaimana label itu hidup selepas penjajahan?",
      "label": "Bab 10–11 · hlm. 140–184",
      "blok": [
        { "j": "teks", "t": "Alatas meneliti kembali penjelasan tentang kemunduran Melayu dalam Revolusi Mental, terbitan 1971. Beliau mengkritik cara perbahasan itu menyandarkan masalah sosial dan ekonomi pada sifat umum orang Melayu, walaupun keadaan sejarah dan pengalaman orang yang dibincangkan berbeza-beza." },
        { "j": "teks", "t": "Alatas menunjukkan masalah membuat kesimpulan tentang sesuatu bangsa daripada tingkah laku sebahagian anggotanya. Tindak tanduk suatu kumpulan dalam keadaan khusus perlu dijelaskan dengan meneliti keadaan dan peranan kumpulan tersebut. Generalisasi tentang watak seluruh bangsa memerlukan bukti lain. (Bab 11, hlm. 173–174.)" }
      ]
    },
    {
      "s": "Ke mana perginya pedagang peribumi?",
      "label": "Bab 12 · hlm. 185–208",
      "blok": [
        { "j": "teks", "t": "Alatas menunjukkan bahawa masyarakat Melayu, Jawa dan Filipina mempunyai golongan pedagang. Dalam contoh Filipina, beliau membaca catatan Pedro Chirino tentang perdagangan setempat yang berkembang dan meneliti bagaimana penguasaan Sepanyol menyempitkan ruang perdagangan penduduk." },
        { "j": "teks", "t": "Nasib pedagang peribumi memberi cara lain untuk menafsirkan perubahan ekonomi. Apabila kuasa kolonial mengubah siapa yang boleh berdagang dan bagaimana perdagangan dijalankan, kesan perubahan itu boleh berpanjangan merentas generasi." }
      ]
    },
    {
      "s": "Cara menilai dakwaan tentang perangai bangsa",
      "label": "Penutup · bermula hlm. 209",
      "blok": [
        { "j": "teks", "t": "Alatas mengakui bahawa sebahagian pemerhatian kolonial boleh menggambarkan individu atau kelompok yang benar-benar ditemui, khususnya golongan yang rapat dengan pentadbiran kolonial. Hujahnya ialah pemerhatian itu perlu diuji sebelum diperluas kepada seluruh masyarakat." },
        { "j": "teks", "t": "Apabila berdepan dakwaan tentang “perangai bangsa”, tanyakan siapa yang membuat dakwaan itu, siapa yang sebenarnya diperhatikan, dan keadaan sejarah atau ekonomi apa yang mempengaruhi tingkah laku tersebut." }
      ]
    }
  ]
});

/* Kenali Munafik: senarai semak muhasabah, disusun daripada analisis pemilik atas kitab
   Zahirat al-Nifaq wa Khaba'ith al-Munafiqin fi al-Tarikh (al-Maydani). "hlm." = halaman PDF kitab.
   Hanya Qism 1–2 (takrif, sifat dan nas) digunakan. Bahagian sejarah dan pertubuhan (Qism 3–4) tidak dimasukkan. */
const SEMAK = {
  'kenali-munafik': {
    kitab: "ʿAbd al-Raḥmān Ḥasan Ḥabannakah al-Maydānī, Ẓāhirat al-Nifāq wa Khabā'ith al-Munāfiqīn fī al-Tārīkh",
    pengenalan: [
      'Para sahabat takut nifaq ada pada diri mereka sendiri. Umar r.a. bertanya kepada Huzaifah, "Adakah aku daripada mereka?" Al-Hasan al-Basri berkata: tiada yang takutkan nifaq melainkan mukmin, dan tiada yang merasa aman daripadanya melainkan munafik. (hlm. 77–81)',
      'Senarai ini menyentuh nifaq kecil, iaitu sifat dan perbuatan yang boleh menjangkiti sesiapa sahaja. Nifaq besar ialah kufur dalam hati yang disembunyikan, dan hanya Allah yang mengetahui isi hati.',
      'Berlemah lembut, memberi hadiah, memaafkan dan bermanis muka untuk mendamaikan, berdakwah atau melunakkan hati bukan nifaq. Maksiat kerana tewas kepada nafsu sambil mengakui hak Allah juga berbeza daripada menolak ketaatan secara ingkar. (hlm. 28–29, 73–77, 87, 105)'
    ],
    kumpulan: [
      { tajuk: 'Lidah, janji dan amanah', item: [
        { t: 'Apabila aku bercakap, adakah aku berdusta, walaupun sedikit atau sekadar bergurau?', hlm: '73–77',
          dalil: { j: 'hadis', ar: 'آيَةُ الْمُنَافِقِ ثَلَاثٌ: إِذَا حَدَّثَ كَذَبَ، وَإِذَا وَعَدَ أَخْلَفَ، وَإِذَا اؤْتُمِنَ خَانَ', maksud: 'Tanda orang munafik ada tiga: apabila bercakap dia berdusta, apabila berjanji dia mungkir, dan apabila diberi amanah dia khianat.', ruj: 'Sahih al-Bukhari, no. 33; Sahih Muslim, no. 59' } },
        { t: 'Apabila aku berjanji, adakah aku memungkirinya tanpa uzur?', hlm: '73–77' },
        { t: 'Apabila aku diberi amanah, sama ada harta, rahsia atau jawatan, adakah aku mengkhianatinya?', hlm: '73–77' },
        { t: 'Apabila aku berbalah, adakah aku melampaui batas dan tidak lagi berlaku adil?', hlm: '73–77',
          dalil: { j: 'hadis', ar: 'أَرْبَعٌ مَنْ كُنَّ فِيهِ كَانَ مُنَافِقًا خَالِصًا، وَمَنْ كَانَتْ فِيهِ خَصْلَةٌ مِنْهُنَّ كَانَتْ فِيهِ خَصْلَةٌ مِنَ النِّفَاقِ حَتَّى يَدَعَهَا: إِذَا اؤْتُمِنَ خَانَ، وَإِذَا حَدَّثَ كَذَبَ، وَإِذَا عَاهَدَ غَدَرَ، وَإِذَا خَاصَمَ فَجَرَ', maksud: 'Empat perkara, sesiapa yang ada padanya keempat-empatnya maka dia munafik tulen, dan sesiapa yang ada padanya satu daripadanya maka ada padanya satu sifat nifaq sehingga dia meninggalkannya: apabila diberi amanah dia khianat, apabila bercakap dia berdusta, apabila membuat perjanjian dia mungkir, dan apabila berbalah dia melampaui batas.', ruj: 'Sahih al-Bukhari, no. 34; Sahih Muslim, no. 58' } },
        { t: 'Adakah aku menjadikan sumpah sebagai perisai untuk menutup kesalahan?', hlm: '781–810',
          dalil: { j: 'ayat', ar: 'اتَّخَذُوا أَيْمَانَهُمْ جُنَّةً فَصَدُّوا عَن سَبِيلِ اللَّهِ', maksud: 'Mereka menjadikan sumpah mereka sebagai perisai, lalu mereka menghalang manusia dari jalan Allah.', ruj: 'Surah al-Munafiqun, ayat 2' } }
      ]},
      { tajuk: 'Ibadah dan niat', item: [
        { t: 'Adakah aku solat dengan malas dan berzikir sedikit apabila tiada orang yang melihat?', hlm: '59–66',
          dalil: { j: 'ayat', ar: 'وَإِذَا قَامُوا إِلَى الصَّلَاةِ قَامُوا كُسَالَىٰ يُرَاءُونَ النَّاسَ وَلَا يَذْكُرُونَ اللَّهَ إِلَّا قَلِيلًا', maksud: 'Dan apabila mereka berdiri untuk solat, mereka berdiri dengan malas. Mereka hendak menunjuk-nunjuk kepada manusia, dan mereka tidak mengingati Allah melainkan sedikit.', ruj: "Surah al-Nisa', ayat 142" } },
        { t: 'Adakah aku beramal supaya dilihat dan dipuji orang?', hlm: '87–97',
          dalil: { j: 'ayat', ar: 'الَّذِينَ هُمْ يُرَاءُونَ', maksud: 'Orang-orang yang berbuat riyak.', ruj: "Surah al-Ma'un, ayat 6" } },
        { t: 'Adakah solat Isyak dan Subuh berjemaah terasa paling berat bagiku?', hlm: '73–77',
          dalil: { j: 'hadis', ar: 'لَيْسَ صَلَاةٌ أَثْقَلَ عَلَى الْمُنَافِقِينَ مِنَ الْفَجْرِ وَالْعِشَاءِ، وَلَوْ يَعْلَمُونَ مَا فِيهِمَا لَأَتَوْهُمَا وَلَوْ حَبْوًا', maksud: 'Tiada solat yang lebih berat bagi orang munafik daripada solat Subuh dan Isyak. Sekiranya mereka tahu ganjaran pada keduanya, nescaya mereka akan datang walaupun dengan merangkak.', ruj: 'Sahih al-Bukhari, no. 657; Sahih Muslim, no. 651' } },
        { t: 'Apabila aku duduk dalam majlis ilmu, adakah aku keluar tanpa memahami apa-apa?', hlm: '661–698',
          dalil: { j: 'ayat', ar: 'حَتَّىٰ إِذَا خَرَجُوا مِنْ عِندِكَ قَالُوا لِلَّذِينَ أُوتُوا الْعِلْمَ مَاذَا قَالَ آنِفًا', maksud: 'Sehingga apabila mereka keluar dari sisimu, mereka bertanya kepada orang yang diberi ilmu: Apakah yang dikatakannya tadi?', ruj: 'Surah Muhammad, ayat 16' } }
      ]},
      { tajuk: 'Sikap terhadap kebenaran', item: [
        { t: 'Apabila aku ditegur supaya bertakwa, adakah ego aku bangkit?', hlm: '224–239',
          dalil: { j: 'ayat', ar: 'وَإِذَا قِيلَ لَهُ اتَّقِ اللَّهَ أَخَذَتْهُ الْعِزَّةُ بِالْإِثْمِ', maksud: 'Dan apabila dikatakan kepadanya: Bertakwalah kepada Allah, dia dibawa oleh keangkuhannya untuk berbuat dosa.', ruj: 'Surah al-Baqarah, ayat 206' } },
        { t: 'Adakah aku hanya menerima hukum Allah apabila ia menguntungkan aku?', hlm: '752–768',
          dalil: { j: 'ayat', ar: 'وَإِذَا دُعُوا إِلَى اللَّهِ وَرَسُولِهِ لِيَحْكُمَ بَيْنَهُمْ إِذَا فَرِيقٌ مِّنْهُم مُّعْرِضُونَ ۝ وَإِن يَكُن لَّهُمُ الْحَقُّ يَأْتُوا إِلَيْهِ مُذْعِنِينَ', maksud: 'Dan apabila mereka diajak kepada Allah dan Rasul-Nya supaya Rasul menghukum di antara mereka, tiba-tiba segolongan daripada mereka berpaling. Tetapi jika kebenaran berada di pihak mereka, mereka datang kepadanya dengan patuh.', ruj: 'Surah al-Nur, ayat 48–49' } },
        { t: 'Apabila agama diperolok dalam majlis atau perbualan, adakah aku terus duduk dan diam?', hlm: '613–642',
          dalil: { j: 'ayat', ar: 'إِنَّكُمْ إِذًا مِّثْلُهُمْ', maksud: '(Jika kamu terus duduk bersama mereka) sesungguhnya kamu sama seperti mereka.', ruj: "Surah al-Nisa', ayat 140" } },
        { t: 'Apabila aku diuji kerana berpegang dengan agama, adakah aku menganggap gangguan manusia seberat azab Allah?', hlm: '147–154',
          dalil: { j: 'ayat', ar: 'وَمِنَ النَّاسِ مَن يَقُولُ آمَنَّا بِاللَّهِ فَإِذَا أُوذِيَ فِي اللَّهِ جَعَلَ فِتْنَةَ النَّاسِ كَعَذَابِ اللَّهِ', maksud: 'Dan di antara manusia ada yang berkata: Kami beriman kepada Allah. Tetapi apabila dia disakiti kerana Allah, dia menganggap fitnah manusia itu seperti azab Allah.', ruj: "Surah al-'Ankabut, ayat 10" } }
      ]},
      { tajuk: 'Sikap terhadap orang beriman', item: [
        { t: 'Adakah aku bercakap lain di hadapan seseorang, dan lain di belakangnya?', hlm: '54–56, 77–81',
          dalil: { j: 'ayat', ar: 'وَإِذَا لَقُوا الَّذِينَ آمَنُوا قَالُوا آمَنَّا وَإِذَا خَلَوْا إِلَىٰ شَيَاطِينِهِمْ قَالُوا إِنَّا مَعَكُمْ إِنَّمَا نَحْنُ مُسْتَهْزِئُونَ', maksud: 'Dan apabila mereka berjumpa dengan orang beriman, mereka berkata: Kami telah beriman. Tetapi apabila mereka kembali kepada syaitan-syaitan mereka, mereka berkata: Sesungguhnya kami bersama kamu, kami hanya memperolok-olok.', ruj: 'Surah al-Baqarah, ayat 14' } },
        { t: 'Adakah aku berasa senang apabila saudara seiman ditimpa susah, dan terganggu apabila dia mendapat nikmat?', hlm: '284–302',
          dalil: { j: 'ayat', ar: 'إِن تَمْسَسْكُمْ حَسَنَةٌ تَسُؤْهُمْ وَإِن تُصِبْكُمْ سَيِّئَةٌ يَفْرَحُوا بِهَا', maksud: 'Jika kamu mendapat kebaikan, mereka berasa susah hati. Dan jika kamu ditimpa keburukan, mereka bergembira dengannya.', ruj: 'Surah Ali Imran, ayat 120' } },
        { t: 'Adakah aku menyindir atau memperlekeh orang yang bersedekah, sama ada banyak atau sedikit?', hlm: '943–1216',
          dalil: { j: 'ayat', ar: 'الَّذِينَ يَلْمِزُونَ الْمُطَّوِّعِينَ مِنَ الْمُؤْمِنِينَ فِي الصَّدَقَاتِ وَالَّذِينَ لَا يَجِدُونَ إِلَّا جُهْدَهُمْ فَيَسْخَرُونَ مِنْهُمْ', maksud: 'Orang-orang yang mencela orang beriman yang bersedekah dengan sukarela, dan mencela orang yang tidak memperoleh (untuk disedekahkan) melainkan sekadar kemampuannya, lalu mereka mengejeknya.', ruj: 'Surah al-Taubah, ayat 79' } },
        { t: 'Adakah aku menyebarkan berita, sama ada yang menenangkan atau yang menakutkan, sebelum menyemaknya?', hlm: '504–571, 733–740',
          dalil: { j: 'ayat', ar: 'وَإِذَا جَاءَهُمْ أَمْرٌ مِّنَ الْأَمْنِ أَوِ الْخَوْفِ أَذَاعُوا بِهِ', maksud: 'Dan apabila datang kepada mereka sesuatu berita tentang keamanan atau ketakutan, mereka terus menyebarkannya.', ruj: "Surah al-Nisa', ayat 83" } }
      ]}
    ],
    doa: { ar: 'اللهم احفظنا من النفاق وقنا شرور المنافقين وامنحنا البصيرة لمعرفتهم', maksud: 'Ya Allah, peliharalah kami daripada nifaq, lindungilah kami daripada kejahatan orang munafik, dan kurniakanlah kami basirah untuk mengenali mereka.', ruj: 'Doa penutup al-Maydani, Khatimah (hlm. 1415–1416)' }
  }
};
/* Kenali Kebenaran: karusel "5 Berhala Kaum Nuh" (12 slaid) daripada reka bentuk pemilik.
   Slaid 11 tanpa nama akaun dan kapsyen pengunggah video; nama penyedia tidak dipaparkan. */
const KARUSEL = {
  'kenali-kebenaran': {
    tajuk: '5 Berhala Kaum Nuh',
    slaid: [
      { label: 'Kisah kaum Nuh a.s.', tajuk: '5 Berhala Kaum Nuh', isi: ['Bagaimana lelaki soleh bertukar menjadi sembahan, sebelum Nabi Nuh a.s. diutus.'],
        nama: [['وَدٌّ'], ['سُوَاعٌ'], ['يَغُوثُ'], ['يَعُوقُ'], ['نَسْرٌ']], kulit: true },
      { label: 'Asal manusia', tajuk: 'Asalnya manusia bertauhid',
        ar: '«وَإِنِّي خَلَقْتُ عِبَادِي حُنَفَاءَ كُلَّهُمْ، وَإِنَّهُمْ أَتَتْهُمُ الشَّيَاطِينُ فَاجْتَالَتْهُمْ عَنْ دِينِهِمْ»',
        maksud: 'Aku jadikan semua hamba-Ku hanif (lurus bertauhid). Lalu syaitan datang dan memesongkan mereka daripada agama mereka.',
        ruj: 'Hadis qudsi · Sahih Muslim no. 2865 (‘Iyad bin Himar r.a.)',
        isi: ['Syirik datang kemudian, sebagai penyimpangan. Ia bukan asal manusia.'], ruj2: 'Salah al-Khalidi, al-Qasas al-Qur’ani, j.1, ms. 161–162' },
      { label: 'Disebut dalam al-Quran', tajuk: 'Lima nama, lima sembahan',
        ar: '﴿وَقَالُوا لَا تَذَرُنَّ آلِهَتَكُمْ وَلَا تَذَرُنَّ وَدًّا وَلَا سُوَاعًا وَلَا يَغُوثَ وَيَعُوقَ وَنَسْرًا﴾',
        maksud: 'Mereka berkata: “Jangan sekali-kali kamu tinggalkan tuhan-tuhan kamu. Jangan tinggalkan Wadd, Suwa‘, Yaghuth, Ya‘uq dan Nasr.”',
        ruj: 'Surah Nuh 71:23',
        nama: [['وَدٌّ', 'Wadd'], ['سُوَاعٌ', 'Suwa‘'], ['يَغُوثُ', 'Yaghuth'], ['يَعُوقُ', 'Ya‘uq'], ['نَسْرٌ', 'Nasr']],
        isi: ['Nama-nama ini sudah ada pada zaman Nuh a.s. Mari kenali satu demi satu.'] },
      { label: 'Berhala 1 daripada 5', besar: 'وَدٌّ', tajuk: 'Wadd',
        ar: '«أَمَّا وَدٌّ فَكَانَتْ لِكَلْبٍ بِدَوْمَةِ الْجَنْدَلِ»', maksud: 'Wadd menjadi milik kabilah Kalb di Dumat al-Jandal.',
        butir: [['Kabilah', 'Kalb'], ['Lokasi', 'Dumat al-Jandal, kota di antara Madinah, Iraq dan Syam']],
        ruj: 'Sahih al-Bukhari no. 4920 · riwayat Ibn ‘Abbas r.a.' },
      { label: 'Berhala 2 daripada 5', besar: 'سُوَاعٌ', tajuk: 'Suwa‘',
        ar: '«وَأَمَّا سُوَاعٌ فَكَانَتْ لِهُذَيْلٍ»', maksud: 'Suwa‘ menjadi milik kabilah Hudhayl.',
        butir: [['Kabilah', 'Hudhayl'], ['Kesudahan', 'Dihancurkan oleh ‘Amr bin al-‘As r.a. pada Ramadan 8H']],
        ruj: 'Sahih al-Bukhari no. 4920 · butiran kesudahan: syarah hadis' },
      { label: 'Berhala 3 daripada 5', besar: 'يَغُوثُ', tajuk: 'Yaghuth',
        ar: '«وَأَمَّا يَغُوثُ فَكَانَتْ لِمُرَادٍ، ثُمَّ لِبَنِي غُطَيْفٍ بِالْجُرْفِ عِنْدَ سَبَإٍ»', maksud: 'Yaghuth milik Murad, kemudian Bani Ghutayf di al-Jurf berhampiran Saba’.',
        butir: [['Kabilah', 'Murad, kemudian Bani Ghutayf'], ['Lokasi', 'Al-Jurf, berhampiran Saba’ (Yaman)']],
        ruj: 'Sahih al-Bukhari no. 4920 · riwayat Ibn ‘Abbas r.a.' },
      { label: 'Berhala 4 daripada 5', besar: 'يَعُوقُ', tajuk: 'Ya‘uq',
        ar: '«وَأَمَّا يَعُوقُ فَكَانَتْ لِهَمْدَانَ»', maksud: 'Ya‘uq menjadi milik kabilah Hamdan.',
        butir: [['Kabilah', 'Hamdan'], ['Lokasi', 'Tidak dinyatakan dalam hadis']],
        ruj: 'Sahih al-Bukhari no. 4920 · riwayat Ibn ‘Abbas r.a.' },
      { label: 'Berhala 5 daripada 5', besar: 'نَسْرٌ', tajuk: 'Nasr',
        ar: '«وَأَمَّا نَسْرٌ فَكَانَتْ لِحِمْيَرَ، لِآلِ ذِي الْكَلَاعِ»', maksud: 'Nasr milik Himyar, iaitu keluarga Dhi al-Kala‘.',
        butir: [['Kabilah', 'Himyar (keluarga Dhi al-Kala‘)'], ['Lokasi', 'Tidak dinyatakan dalam hadis']],
        ruj: 'Sahih al-Bukhari no. 4920 · riwayat Ibn ‘Abbas r.a.' },
      { label: 'Bagaimana ia bermula', tajuk: 'Bermula dengan niat yang nampak baik',
        ar: '«أَسْمَاءُ رِجَالٍ صَالِحِينَ مِنْ قَوْمِ نُوحٍ، فَلَمَّا هَلَكُوا أَوْحَى الشَّيْطَانُ إِلَى قَوْمِهِمْ: أَنِ انْصِبُوا إِلَى مَجَالِسِهِمُ الَّتِي كَانُوا يَجْلِسُونَ أَنْصَابًا وَسَمُّوهَا بِأَسْمَائِهِمْ، فَفَعَلُوا، فَلَمْ تُعْبَدْ»',
        ruj: 'Sahih al-Bukhari no. 4920 · Ibn ‘Abbas r.a.',
        langkah: ['Mereka lelaki soleh dari kaum Nuh. Lalu mereka wafat.', 'Syaitan membisikkan: dirikan tugu di tempat majlis mereka dahulu.', 'Tugu diberi nama mereka. Ketika itu, belum ada sesiapa menyembahnya.'] },
      { label: 'Titik putus', tajuk: 'Disembah apabila ilmu hilang',
        ar: '«حَتَّى إِذَا هَلَكَ أُولَئِكَ، وَتَنَسَّخَ الْعِلْمُ، عُبِدَتْ»', maksud: 'Sehingga apabila generasi itu mati dan ilmu terhapus, tugu-tugu itu pun disembah.',
        ruj: 'Sahih al-Bukhari no. 4920 · Ibn ‘Abbas r.a.',
        alur: ['Tugu didirikan', 'Nama diabadikan', 'Ilmu terhapus', 'Disembah'],
        nota: ['Nota tahqiq', 'Riwayat ini mawquf pada Ibn ‘Abbas r.a. Al-Khalidi mengambilnya sebagai penguat (isti‘nas), tidak menjazamkannya. Al-Qasas al-Qur’ani, j.1, ms. 163.'] },
      { label: 'Isu terkini', tajuk: 'Bentuk berubah. Soalannya sama.',
        isi: ['Slaid asal memaparkan visual daripada rakaman sebuah konsert yang dikongsi di media sosial.'],
        langkah: ['Siapa atau apa yang dijulang tinggi?', 'Apa yang diagungkan oleh ribuan penonton?', 'Adakah ilmu untuk membezakan hiburan daripada pengagungan masih ada?'] },
      { label: 'Nuh a.s. diutus', tajuk: 'Rasul pertama kepada penduduk bumi',
        ar: '﴿لَقَدْ أَرْسَلْنَا نُوحًا إِلَىٰ قَوْمِهِ فَقَالَ يَا قَوْمِ اعْبُدُوا اللَّهَ مَا لَكُم مِّنْ إِلَٰهٍ غَيْرُهُ﴾',
        maksud: 'Kami mengutus Nuh kepada kaumnya. Dia berkata: “Wahai kaumku, sembahlah Allah. Tiada tuhan bagi kamu selain-Nya.”',
        ruj: 'Surah al-A‘raf 7:59',
        petik: 'Syirik jarang bermula dengan menyembah. Ia bermula dengan mengagungkan secara berlebihan.',
        ruj2: 'Rujukan: Salah al-Khalidi, al-Qasas al-Qur’ani, j.1, ms. 161–165 · Sahih al-Bukhari no. 4920 · Sahih Muslim no. 2865 · hadis syafaat (al-Bukhari dan Muslim)' }
    ]
  }
};
