/* Ruang Ilmu · kandungan contoh.
   Dalam produksi, data ini datang dari CMS (lihat Studio). Di sini ia disimpan sebagai fail statik
   supaya prototaip boleh dibuka tanpa pelayan. Teks ==begini== dipaparkan sebagai sorotan.

   Skema bahan (Kandungan). Struktur ini dibina untuk menutup lubang yang didedahkan oleh
   Ryan Holiday dalam "Trust Me, I'm Lying" (lihat TAKTIK di bawah):
   - tajuk, dek, ringkas60  Tajuk yang berbentuk soalan mesti dijawab dalam ringkas60 (lawan umpan klik).
   - rujukan[]              { j, t }  j = primer | ulasan | rasmi | esei | pengiraan. Sumber asal, bukan "menurut laporan".
   - dakwaan[]              { t, j, s }  Dakwaan utama. j = fakta | pengiraan | tafsiran | dibahas | riwayat | pendapat | nasihat.
                            s = indeks rujukan yang menyokongnya. Fakta dan pengiraan wajib ada s.
   - terbit, kemas          Tarikh. Sejarah versi dan pembetulan dijana daripada ini dan daripada Studio.
   - pasangan               Produk Sip 'n Go yang dipaparkan bersama. Sentiasa disertakan pendedahan kepentingan.
*/

const KATEGORI = [
  { id: 'agama', nama: 'Agama & Kerohanian', ringkas: 'Tafsir, hadis, sirah, adab, turath dan pemikiran Islam.' },
  { id: 'psikologi', nama: 'Psikologi & Manusia', ringkas: 'Bias kognitif, emosi, tabiat, hubungan dan pemikiran kritis.' },
  { id: 'sejarah', nama: 'Sejarah & Tamadun', ringkas: 'Tokoh, kerajaan, peristiwa dan sejarah idea.' },
  { id: 'sains', nama: 'Sains & Alam', ringkas: 'Angkasa, biologi, teknologi dan fenomena harian.' },
  { id: 'kreatif', nama: 'Kreativiti & Teknologi', ringkas: 'AI, reka bentuk, penulisan, media dan produktiviti.' },
  { id: 'kehidupan', nama: 'Kehidupan & Kewangan', ringkas: 'Literasi kewangan, kerjaya, komunikasi dan keputusan hidup.' }
];

const KANDUNGAN = [
  {
    slug: 'kenapa-percaya-ramalan',
    tajuk: 'Kenapa manusia mudah mempercayai ramalan?',
    dek: 'Satu eksperimen bilik kuliah tahun 1949 menunjukkan betapa mudahnya kita melihat diri sendiri dalam ayat yang ditulis untuk semua orang.',
    kategori: 'psikologi', tag: ['bias kognitif', 'kesan Barnum', 'pemikiran kritis'], tahap: 'Asas',
    terbit: '2026-09-08', kemas: '2026-10-14', pilihan: true,
    ringkas60: 'Ayat ramalan biasanya cukup umum untuk sesuai dengan hampir semua orang, tetapi cukup peribadi bunyinya sehingga kita rasa ia ditulis untuk kita. Ahli psikologi memanggilnya kesan Barnum atau kesan Forer. Kita mengingati ramalan yang tepat dan melupakan yang meleset, jadi keyakinan terus bertambah.',
    bahagian: [
      { h: 'Eksperimen Forer', v: '4.26 / 5', p: [
        'Pada tahun 1948, ahli psikologi Bertram Forer memberikan ujian personaliti kepada pelajarnya. Seminggu kemudian, setiap pelajar menerima "analisis peribadi". Hakikatnya, semua pelajar menerima teks yang sama, dan sebahagian besarnya diambil daripada buku horoskop.',
        'Pelajar diminta menilai ketepatan analisis itu dari 0 hingga 5. Purata penilaian ialah ==4.26==. Hampir semua orang merasakan teks yang sama itu menggambarkan diri mereka dengan baik. Kajian ini diterbitkan pada tahun 1949.'
      ]},
      { h: 'Ayat yang muat untuk semua orang', v: '"Kadang-kadang"', p: [
        'Cuba baca ayat ini: "Kau ada potensi yang belum digunakan sepenuhnya. Kadang-kadang kau peramah, kadang-kadang kau lebih suka bersendirian." Ayat seperti ini benar untuk hampir semua manusia kerana ia merangkumi kedua-dua hujung.',
        'Pada tahun 1956, ahli psikologi Paul Meehl menamakan fenomena ini ==kesan Barnum==, sempena pemain sarkas P. T. Barnum yang terkenal kerana menyediakan "sesuatu untuk semua orang".'
      ]},
      { h: 'Ingatan yang memilih', v: 'Kena / Meleset', p: [
        'Kesan Barnum dikuatkan oleh cara ingatan bekerja. Ramalan yang menjadi terasa luar biasa, jadi kita mengingatinya. Ramalan yang meleset terasa biasa, jadi kita melupakannya. Lama-kelamaan, rekod dalam kepala kita kelihatan jauh lebih tepat daripada rekod sebenar.',
        'Ini berkait rapat dengan bias pengesahan: kita cenderung mencari bukti yang menyokong apa yang sudah kita percaya.'
      ]},
      { h: 'Ujian ringkas untuk kau guna', v: '3 soalan', p: [
        'Apabila membaca ramalan, ujian personaliti atau analisis "tepat sekali" tentang diri kau, tanya tiga soalan. Adakah ayat ini juga benar untuk kawan aku? Adakah ia boleh dibuktikan salah? Berapa kali ramalan seperti ini pernah meleset?',
        'Jika ayat itu tidak boleh salah, ia juga tidak memberitahu apa-apa yang baharu.'
      ]}
    ],
    fakta: ['Pelajar Forer menilai teks horoskop yang sama sebagai 4.26 daripada 5 untuk ketepatan.', 'Istilah "kesan Barnum" dicipta oleh Paul Meehl pada tahun 1956.', 'Ayat yang tidak boleh dibuktikan salah tidak memberikan maklumat baharu.'],
    kuiz: [
      { s: 'Apakah yang sebenarnya diterima oleh semua pelajar Forer?', p: ['Analisis yang berbeza mengikut ujian masing-masing', 'Teks yang sama, sebahagian besarnya daripada buku horoskop', 'Keputusan ujian IQ'], j: 1, t: 'Semua pelajar menerima teks yang sama, tetapi kebanyakan mereka menilainya sangat tepat.' },
      { s: 'Kenapa ayat "kadang-kadang kau peramah, kadang-kadang kau suka bersendirian" terasa tepat?', p: ['Ia merangkumi kedua-dua hujung, jadi benar untuk hampir semua orang', 'Ia berdasarkan data peribadi', 'Ia ditulis oleh pakar'], j: 0, t: 'Ayat yang merangkumi semua kemungkinan hampir mustahil untuk salah.' },
      { s: 'Apakah peranan ingatan dalam kepercayaan kepada ramalan?', p: ['Kita mengingati semua ramalan dengan sama rata', 'Kita mengingati yang kena dan melupakan yang meleset', 'Ingatan tidak berkaitan'], j: 1, t: 'Ingatan yang memilih membuatkan rekod ramalan kelihatan lebih tepat daripada sebenarnya.' }
    ],
    refleksi: 'Bilakah kali terakhir kau rasa sesuatu "sangat tepat tentang diri aku"? Adakah ia juga tepat untuk orang lain?',
    rujukan: [
      { j: 'primer', t: 'Forer, B. R. (1949). The fallacy of personal validation. Journal of Abnormal and Social Psychology, 44(1), 118–123.' },
      { j: 'primer', t: 'Meehl, P. E. (1956). Wanted — a good cookbook. American Psychologist, 11(6), 263–272.' },
      { j: 'ulasan', t: 'Dickson, D. H., & Kelly, I. W. (1985). The "Barnum effect" in personality assessment: A review of the literature. Psychological Reports, 57(2), 367–382.' }
    ],
    dakwaan: [
      { t: "Pelajar Forer menilai teks umum yang sama sebagai purata 4.26 daripada 5 untuk ketepatan.", j: 'fakta', s: [0] },
      { t: "Istilah \"kesan Barnum\" diperkenalkan oleh Paul Meehl pada tahun 1956.", j: 'fakta', s: [1] },
      { t: "Kesan ini berulang dalam banyak kajian penilaian personaliti selepas Forer.", j: 'fakta', s: [2] },
      { t: "Ingatan yang memilih menguatkan kepercayaan kepada ramalan.", j: 'tafsiran', s: [] }
    ],
    berkaitan: ['bias-pengesahan', 'menulis-untuk-berfikir'], pasangan: 'classic'
  },
  {
    slug: 'bias-pengesahan',
    tajuk: 'Bias pengesahan: kenapa kita hanya mencari bukti yang setuju',
    dek: 'Teka-teki tiga nombor oleh Peter Wason menunjukkan kita lebih suka membuktikan diri betul daripada menguji sama ada kita salah.',
    kategori: 'psikologi', tag: ['bias kognitif', 'membuat keputusan'], tahap: 'Asas',
    terbit: '2026-09-15', kemas: '2026-10-10',
    ringkas60: 'Bias pengesahan ialah kecenderungan mencari, mentafsir dan mengingati maklumat yang menyokong pandangan sedia ada. Dalam ujian 2-4-6, kebanyakan peserta hanya menguji contoh yang mengesahkan tekaan mereka, lalu terlepas peraturan sebenar. Cara melawannya: cari dengan sengaja bukti yang boleh membuktikan kau salah.',
    bahagian: [
      { h: 'Teka-teki 2-4-6', v: '2 · 4 · 6', p: [
        'Pada tahun 1960, Peter Wason memberitahu peserta bahawa urutan 2, 4, 6 mematuhi satu peraturan rahsia. Mereka boleh mencadangkan urutan lain, dan penyelidik akan menjawab "patuh" atau "tidak patuh".',
        'Kebanyakan peserta meneka "tambah dua" dan menguji 8, 10, 12 atau 20, 22, 24. Semuanya patuh, jadi mereka yakin. Peraturan sebenar jauh lebih mudah: ==mana-mana tiga nombor yang semakin besar==.'
      ]},
      { h: 'Kenapa kita terlepas', v: '✓ ✓ ✓', p: [
        'Peserta jarang menguji urutan yang dijangka gagal, seperti 1, 2, 3 atau 6, 4, 2. Padahal ujian seperti itulah yang paling banyak memberi maklumat.',
        'Dalam kehidupan, corak yang sama berlaku apabila kita membaca berita yang menyokong pendirian kita, atau bertanya soalan yang jawapannya sudah kita jangka.'
      ]},
      { h: 'Cara melawan', v: 'Buktikan aku salah', p: [
        'Sebelum membuat keputusan penting, tulis satu perkara yang akan membuatkan kau berubah fikiran. Kemudian cari bukti itu dengan sengaja.',
        'Satu lagi cara ialah meminta seseorang yang tidak bersetuju untuk menerangkan hujahnya sehingga kau boleh mengulanginya dengan adil. Jika kau tidak boleh, kau belum benar-benar memahami pandangan itu.'
      ]}
    ],
    fakta: ['Peraturan sebenar ujian Wason ialah "tiga nombor yang semakin besar".', 'Ujian yang dijangka gagal biasanya memberi lebih banyak maklumat.', 'Tulis dahulu apa yang akan membuatkan kau berubah fikiran.'],
    kuiz: [
      { s: 'Apakah peraturan sebenar dalam ujian 2-4-6?', p: ['Tambah dua setiap kali', 'Nombor genap sahaja', 'Mana-mana tiga nombor yang semakin besar'], j: 2, t: 'Peraturannya sangat luas, sebab itu tekaan "tambah dua" sentiasa kelihatan betul.' },
      { s: 'Ujian manakah yang paling banyak memberi maklumat?', p: ['8, 10, 12', '1, 2, 3', '20, 22, 24'], j: 1, t: '1, 2, 3 menguji sama ada "tambah dua" benar-benar perlu.' },
      { s: 'Apakah satu cara melawan bias pengesahan?', p: ['Membaca lebih banyak sumber yang bersetuju', 'Menulis apa yang akan membuatkan kau berubah fikiran, kemudian mencarinya', 'Membuat keputusan dengan cepat'], j: 1, t: 'Mencari bukti yang menentang memaksa kita menguji, bukan sekadar mengesahkan.' }
    ],
    refleksi: 'Pilih satu pendapat kuat yang kau pegang. Apakah bukti yang akan membuatkan kau mengubahnya?',
    rujukan: [
      { j: 'primer', t: 'Wason, P. C. (1960). On the failure to eliminate hypotheses in a conceptual task. Quarterly Journal of Experimental Psychology, 12(3), 129–140.' },
      { j: 'ulasan', t: 'Nickerson, R. S. (1998). Confirmation bias: A ubiquitous phenomenon in many guises. Review of General Psychology, 2(2), 175–220.' }
    ],
    dakwaan: [
      { t: "Dalam ujian 2-4-6, kebanyakan peserta hanya menguji contoh yang mengesahkan tekaan mereka.", j: 'fakta', s: [0] },
      { t: "Bias pengesahan dilaporkan dalam pelbagai bidang termasuk perubatan, undang-undang dan sains.", j: 'fakta', s: [1] },
      { t: "Menulis syarat yang akan mengubah fikiran membantu menguji kepercayaan sendiri.", j: 'nasihat', s: [] }
    ],
    berkaitan: ['kenapa-percaya-ramalan', 'kenapa-bertangguh']
  },
  {
    slug: 'kenapa-bertangguh',
    tajuk: 'Kenapa aku selalu bertangguh?',
    dek: 'Bertangguh jarang berpunca daripada malas. Ia lebih kerap berpunca daripada otak yang menghargai keselesaan sekarang lebih daripada ganjaran nanti.',
    kategori: 'psikologi', tag: ['tabiat', 'produktiviti', 'emosi'], tahap: 'Asas',
    terbit: '2026-09-22', kemas: '2026-10-12', pilihan: true,
    ringkas60: 'Kita bertangguh kerana ganjaran tugas terasa jauh, manakala rasa tidak selesa terasa dekat. Ahli psikologi memanggilnya bias masa kini. Bertangguh juga cara mengelak emosi seperti bosan, takut gagal atau keliru. Langkah yang terbukti membantu: pecahkan tugas, tetapkan pelan "jika-maka", dan mulakan untuk dua minit sahaja.',
    bahagian: [
      { h: 'Masa kini menang', v: 'Sekarang > Nanti', p: [
        'Otak manusia memberi nilai lebih kepada ganjaran yang dekat. Menonton satu video sekarang terasa lebih bernilai daripada markah yang baik tiga minggu lagi, walaupun kita tahu yang kedua lebih penting.',
        'Dalam kajian meta oleh Piers Steel (2007), bertangguh paling kuat dikaitkan dengan ==tugas yang tidak menyeronokkan, ganjaran yang jauh dan sifat mudah terganggu==.'
      ]},
      { h: 'Bertangguh ialah pengurusan emosi', v: 'Elak rasa', p: [
        'Apabila tugas membuatkan kita rasa bosan, keliru atau takut gagal, menangguhnya memberi kelegaan serta-merta. Kelegaan itu ialah ganjaran kecil yang mengukuhkan tabiat bertangguh.',
        'Sebab itu nasihat "berdisiplinlah" jarang berkesan. Lebih berguna untuk bertanya: rasa apa yang aku cuba elak sekarang?'
      ]},
      { h: 'Tiga langkah yang membantu', v: 'Jika … maka …', p: [
        'Pertama, pecahkan tugas sehingga langkah pertama jelas dan kecil, seperti "buka fail dan tulis tajuk". Kedua, buat pelan jika-maka: "Jika selesai makan tengah hari, maka aku buka laporan itu." Kajian Peter Gollwitzer menunjukkan pelan seperti ini meningkatkan kemungkinan bertindak.',
        'Ketiga, berjanji untuk bermula selama ==dua minit sahaja==. Selalunya bahagian paling sukar ialah bermula, bukan meneruskan.'
      ]}
    ],
    fakta: ['Bertangguh berkait kuat dengan tugas tidak menyeronokkan dan ganjaran yang jauh.', 'Menangguh memberi kelegaan emosi serta-merta, lalu tabiat itu diperkukuh.', 'Pelan "jika-maka" meningkatkan kemungkinan bertindak.'],
    kuiz: [
      { s: 'Apakah maksud bias masa kini?', p: ['Kita lebih menghargai ganjaran dekat berbanding ganjaran jauh', 'Kita lebih suka berita terkini', 'Kita melupakan masa lalu'], j: 0, t: 'Ganjaran sekarang terasa lebih besar walaupun nilai sebenarnya lebih kecil.' },
      { s: 'Kenapa bertangguh boleh menjadi tabiat?', p: ['Kerana kita malas sejak lahir', 'Kerana ia memberi kelegaan emosi serta-merta', 'Kerana tugas terlalu mudah'], j: 1, t: 'Kelegaan itu bertindak sebagai ganjaran.' },
      { s: 'Contoh pelan jika-maka yang baik ialah…', p: ['"Aku akan lebih rajin."', '"Jika selesai solat Asar, maka aku buka nota Bab 3."', '"Minggu depan aku mula."'], j: 1, t: 'Pelan yang baik menyebut pencetus yang jelas dan tindakan yang spesifik.' }
    ],
    refleksi: 'Apakah satu tugas yang kau tangguh sekarang? Apakah langkah dua minit pertamanya?',
    rujukan: [
      { j: 'ulasan', t: 'Steel, P. (2007). The nature of procrastination: A meta-analytic and theoretical review. Psychological Bulletin, 133(1), 65–94.' },
      { j: 'ulasan', t: 'Gollwitzer, P. M. (1999). Implementation intentions: Strong effects of simple plans. American Psychologist, 54(7), 493–503.' },
      { j: 'ulasan', t: 'Sirois, F., & Pychyl, T. (2013). Procrastination and the priority of short-term mood regulation. Social and Personality Psychology Compass, 7(2), 115–127.' }
    ],
    dakwaan: [
      { t: "Bertangguh paling kuat dikaitkan dengan tugas tidak menyeronokkan, ganjaran yang jauh dan sifat mudah terganggu.", j: 'fakta', s: [0] },
      { t: "Pelan jika-maka meningkatkan kemungkinan seseorang bertindak.", j: 'fakta', s: [1] },
      { t: "Bertangguh boleh difahami sebagai cara mengurus emosi jangka pendek.", j: 'tafsiran', s: [2] },
      { t: "Berjanji untuk bermula selama dua minit memudahkan langkah pertama.", j: 'nasihat', s: [] }
    ],
    berkaitan: ['pengulangan-berjarak', 'kuasa-pertumbuhan-berganda'], pasangan: 'caramel'
  },
  {
    slug: 'pengulangan-berjarak',
    tajuk: 'Pengulangan berjarak: cara belajar yang tidak mudah lupa',
    dek: 'Pada tahun 1885, seorang ahli psikologi Jerman menghafal ribuan suku kata tanpa makna untuk menjawab satu soalan: berapa cepat kita lupa?',
    kategori: 'kreatif', tag: ['belajar', 'ingatan', 'produktiviti'], tahap: 'Asas',
    terbit: '2026-09-29', kemas: '2026-10-05',
    ringkas60: 'Hermann Ebbinghaus mendapati ingatan merosot paling cepat dalam beberapa jam dan hari pertama. Mengulang kaji pada selang yang semakin panjang, misalnya selepas 1 hari, 3 hari, 1 minggu dan 1 bulan, membuatkan ingatan bertahan lebih lama berbanding mengulang banyak kali dalam satu sesi. Menguji diri lebih berkesan daripada membaca semula.',
    bahagian: [
      { h: 'Lengkung lupa', v: '1885', p: [
        'Hermann Ebbinghaus menguji dirinya sendiri dengan senarai suku kata tanpa makna seperti "DAX" dan "BOK". Dia mengukur berapa banyak usaha yang dijimatkan apabila mempelajari semula senarai yang sama selepas masa tertentu.',
        'Hasilnya ialah ==lengkung lupa==: penurunan paling curam berlaku tidak lama selepas belajar, kemudian kadarnya semakin perlahan.'
      ]},
      { h: 'Jarak lebih baik daripada longgok', v: '1 · 3 · 7 · 30', p: [
        'Ebbinghaus juga mendapati ulang kaji yang dijarakkan lebih berkesan daripada ulang kaji yang dilonggokkan dalam satu masa. Penemuan ini, yang dikenali sebagai kesan jarak, telah diulang dalam ratusan kajian sejak itu.',
        'Jadual mudah untuk dicuba: ulang kaji selepas 1 hari, 3 hari, 7 hari dan 30 hari. Setiap kali ingatan hampir pudar, usaha mengingat semula menguatkannya.'
      ]},
      { h: 'Uji, jangan baca semula', v: '?', p: [
        'Membaca semula nota terasa produktif kerana bahan itu nampak biasa. Tetapi rasa biasa tidak sama dengan boleh mengingat. Menutup buku dan cuba menulis semula idea utama, atau menjawab kuiz, memaksa otak mengeluarkan maklumat.',
        'Sebab itu setiap artikel di Ruang Ilmu ada tiga soalan kuiz. ==Kuiz itu bukan peperiksaan; ia alat mengingat.=='
      ]}
    ],
    fakta: ['Ingatan merosot paling cepat sejurus selepas belajar.', 'Ulang kaji pada 1, 3, 7 dan 30 hari ialah jadual mudah untuk bermula.', 'Menguji diri lebih berkesan daripada membaca semula.'],
    kuiz: [
      { s: 'Bilakah ingatan merosot paling cepat menurut lengkung lupa?', p: ['Sejurus selepas belajar', 'Selepas setahun', 'Kadarnya sama sepanjang masa'], j: 0, t: 'Penurunan paling curam berlaku dalam tempoh awal.' },
      { s: 'Apakah kesan jarak?', p: ['Belajar dalam bilik yang luas', 'Ulang kaji yang dijarakkan lebih berkesan daripada yang dilonggokkan', 'Belajar jauh dari rumah'], j: 1, t: 'Selang antara sesi membuatkan ingatan lebih tahan.' },
      { s: 'Kenapa membaca semula kurang berkesan?', p: ['Rasa biasa disangka boleh mengingat', 'Ia terlalu memenatkan', 'Nota selalu salah'], j: 0, t: 'Mengeluarkan maklumat dari ingatan lebih menguatkannya.' }
    ],
    refleksi: 'Pilih satu perkara yang kau pelajari minggu ini. Bila kau akan mengujinya semula?',
    rujukan: [
      { j: 'primer', t: 'Ebbinghaus, H. (1885/1913). Memory: A Contribution to Experimental Psychology. Teachers College, Columbia University.' },
      { j: 'ulasan', t: 'Cepeda, N. J., et al. (2006). Distributed practice in verbal recall tasks: A review and quantitative synthesis. Psychological Bulletin, 132(3), 354–380.' },
      { j: 'primer', t: 'Roediger, H. L., & Karpicke, J. D. (2006). Test-enhanced learning. Psychological Science, 17(3), 249–255.' }
    ],
    dakwaan: [
      { t: "Ingatan merosot paling cepat sejurus selepas belajar.", j: 'fakta', s: [0] },
      { t: "Ulang kaji yang dijarakkan lebih berkesan daripada ulang kaji yang dilonggokkan.", j: 'fakta', s: [1] },
      { t: "Menguji diri menghasilkan ingatan jangka panjang yang lebih baik daripada membaca semula.", j: 'fakta', s: [2] },
      { t: "Jadual 1, 3, 7 dan 30 hari ialah titik mula yang mudah.", j: 'nasihat', s: [] }
    ],
    berkaitan: ['menulis-untuk-berfikir', 'adab-menuntut-ilmu']
  },
  {
    slug: 'menulis-untuk-berfikir',
    tajuk: 'Menulis untuk berfikir, bukan sekadar merakam fikiran',
    dek: 'Kita sering menyangka kita sudah faham, sehingga kita cuba menulisnya.',
    kategori: 'kreatif', tag: ['penulisan', 'pemikiran kritis'], tahap: 'Asas',
    terbit: '2026-10-06', kemas: '2026-10-06',
    ringkas60: 'Menulis memaksa idea yang kabur menjadi ayat yang jelas. Jurang dalam kefahaman hanya kelihatan apabila kita cuba menerangkannya langkah demi langkah. Cuba tulis satu perenggan setiap hari tentang sesuatu yang kau baca, seolah-olah menerangkannya kepada kawan yang tidak pernah mendengarnya.',
    bahagian: [
      { h: 'Ilusi faham', v: 'Faham?', p: [
        'Dalam satu siri kajian, Leonid Rozenblit dan Frank Keil meminta peserta menilai sejauh mana mereka faham cara objek harian berfungsi, seperti zip. Selepas diminta menerangkannya langkah demi langkah, penilaian mereka jatuh. Fenomena ini dinamakan ==ilusi kedalaman penjelasan==.',
        'Menulis mendedahkan ilusi ini dengan cepat. Jika kau tersekat pada ayat ketiga, di situlah kefahaman kau berhenti.'
      ]},
      { h: 'Ayat memaksa pilihan', v: '¶', p: [
        'Fikiran boleh memegang beberapa idea yang bercanggah tanpa kita sedar. Ayat tidak boleh. Untuk menulis, kita perlu memilih perkataan, susunan dan hubungan sebab-akibat.',
        'Penulis esei Paul Graham pernah menyatakan bahawa menulis tentang sesuatu, walaupun perkara yang kita rasa kita tahu, biasanya menunjukkan kita tidak tahu sebaik yang disangka.'
      ]},
      { h: 'Amalan satu perenggan', v: '5 minit', p: [
        'Selepas membaca, tutup artikel dan tulis satu perenggan: apa idea utama, kenapa ia benar, dan di mana ia boleh digunakan. Gunakan ruang Nota peribadi di bawah setiap artikel.',
        'Jangan risau tentang gaya. Matlamatnya ialah kejelasan. ==Tulisan yang jelas lahir daripada fikiran yang jelas, dan sebaliknya.=='
      ]}
    ],
    fakta: ['Penilaian kefahaman jatuh selepas peserta cuba menerangkannya langkah demi langkah.', 'Ayat memaksa kita memilih susunan dan hubungan sebab-akibat.', 'Satu perenggan selepas membaca sudah cukup untuk bermula.'],
    kuiz: [
      { s: 'Apakah ilusi kedalaman penjelasan?', p: ['Kita menyangka kita faham lebih daripada sebenarnya', 'Penjelasan yang terlalu panjang', 'Lukisan yang mengelirukan'], j: 0, t: 'Ilusi itu terdedah apabila kita perlu menerangkan langkah demi langkah.' },
      { s: 'Kenapa menulis membantu berfikir?', p: ['Ia memaksa kita memilih perkataan dan susunan', 'Ia lebih cepat daripada bercakap', 'Ia menggantikan membaca'], j: 0, t: 'Ayat tidak boleh memegang idea yang bercanggah tanpa disedari.' },
      { s: 'Apakah matlamat amalan satu perenggan?', p: ['Gaya bahasa yang indah', 'Kejelasan idea utama', 'Bilangan perkataan yang banyak'], j: 1, t: 'Kejelasan dahulu, gaya kemudian.' }
    ],
    refleksi: 'Tulis satu perenggan tentang artikel terakhir yang kau baca di sini, tanpa melihatnya semula.',
    rujukan: [
      { j: 'primer', t: 'Rozenblit, L., & Keil, F. (2002). The misunderstood limits of folk science: An illusion of explanatory depth. Cognitive Science, 26(5), 521–562.' },
      { j: 'esei', t: 'Graham, P. (2022). Putting Ideas into Words. paulgraham.com.' }
    ],
    dakwaan: [
      { t: "Penilaian kefahaman peserta jatuh selepas mereka cuba menerangkan langkah demi langkah.", j: 'fakta', s: [0] },
      { t: "Menulis mendedahkan bahawa kita tidak tahu sebaik yang disangka.", j: 'pendapat', s: [1] },
      { t: "Satu perenggan selepas membaca sudah cukup untuk bermula.", j: 'nasihat', s: [] }
    ],
    berkaitan: ['pengulangan-berjarak', 'bias-pengesahan'], pasangan: 'caramel'
  },
  {
    slug: 'baitul-hikmah',
    tajuk: 'Baitul Hikmah: rumah ilmu di Baghdad',
    dek: 'Bagaimana sebuah kota abad kesembilan menjadi tempat ilmu Yunani, Parsi dan India diterjemah, dibahas dan dikembangkan.',
    kategori: 'sejarah', tag: ['tamadun Islam', 'Abbasiyah', 'terjemahan'], tahap: 'Pertengahan',
    terbit: '2026-09-10', kemas: '2026-10-01', pilihan: true,
    ringkas60: 'Baitul Hikmah di Baghdad berkembang di bawah Khilafah Abbasiyah, terutama pada zaman al-Ma\'mun (813–833). Ia menjadi pusat gerakan terjemahan karya Yunani, Parsi dan India ke bahasa Arab. Sarjana seperti al-Khwarizmi bekerja dalam suasana ini. Baghdad dimusnahkan oleh tentera Mongol pada tahun 1258.',
    bahagian: [
      { h: 'Kota yang dibina untuk ilmu', v: '762 M', p: [
        'Baghdad diasaskan oleh Khalifah al-Mansur pada tahun 762 sebagai ibu kota baharu Abbasiyah. Kedudukannya di laluan perdagangan membawa pedagang, manuskrip dan sarjana dari pelbagai tamadun.',
        'Kertas, yang teknik pembuatannya tiba dari Asia Tengah, menjadikan penyalinan buku lebih murah berbanding kulit dan papirus. Ini membantu ledakan penulisan.'
      ]},
      { h: 'Gerakan terjemahan', v: 'Yunani → Arab', p: [
        'Di bawah al-Ma\'mun, karya Aristotle, Galen, Euclid dan Ptolemy diterjemah ke bahasa Arab. Penterjemah seperti Hunayn ibn Ishaq terkenal kerana membandingkan beberapa manuskrip sebelum menterjemah, satu kaedah yang sangat teliti untuk zamannya.',
        'Terjemahan bukan sekadar menyalin. Sarjana mengulas, membetulkan dan ==mengembangkan== karya asal.'
      ]},
      { h: 'Al-Khwarizmi dan algebra', v: 'al-jabr', p: [
        'Muhammad ibn Musa al-Khwarizmi menulis kitab tentang penyelesaian persamaan sekitar tahun 820. Perkataan "algebra" berasal daripada al-jabr dalam tajuk kitab itu, dan perkataan "algoritma" berasal daripada namanya.',
        'Karyanya membantu menyebarkan sistem angka Hindu-Arab yang kemudian digunakan di seluruh dunia.'
      ]},
      { h: 'Apa yang kita tahu, apa yang dibahas', v: '1258', p: [
        'Sejarawan masih membahaskan bentuk sebenar Baitul Hikmah: sama ada ia perpustakaan istana, akademi atau rangkaian sarjana. Sumber awal tidak memberi gambaran yang lengkap.',
        'Yang jelas, pada tahun 1258 tentera Mongol menawan dan memusnahkan Baghdad. Banyak manuskrip hilang. Tetapi ilmu yang telah disalin sudah tersebar ke Kaherah, Cordoba dan kota-kota lain.'
      ]}
    ],
    fakta: ['Baghdad diasaskan pada tahun 762 oleh Khalifah al-Mansur.', 'Perkataan "algebra" berasal daripada al-jabr dalam kitab al-Khwarizmi.', 'Bentuk sebenar Baitul Hikmah masih dibahas oleh sejarawan.'],
    kuiz: [
      { s: 'Di bawah khalifah manakah gerakan terjemahan paling berkembang?', p: ['Al-Ma\'mun', 'Harun ar-Rasyid sahaja', 'Al-Mansur sahaja'], j: 0, t: 'Zaman al-Ma\'mun (813–833) sering dikaitkan dengan kemuncak gerakan terjemahan.' },
      { s: 'Perkataan "algoritma" berasal daripada…', p: ['Nama al-Khwarizmi', 'Bahasa Yunani', 'Nama sebuah kota'], j: 0, t: 'Nama al-Khwarizmi dilatinkan, lalu menjadi "algoritma".' },
      { s: 'Apakah yang berlaku kepada Baghdad pada tahun 1258?', p: ['Menjadi ibu kota baharu', 'Ditawan dan dimusnahkan oleh tentera Mongol', 'Dilanda gempa bumi'], j: 1, t: 'Banyak manuskrip hilang, tetapi ilmu telah tersebar ke kota lain.' }
    ],
    refleksi: 'Apakah persamaan antara gerakan terjemahan Baghdad dengan cara ilmu tersebar di internet hari ini?',
    rujukan: [
      { j: 'ulasan', t: 'Gutas, D. (1998). Greek Thought, Arabic Culture: The Graeco-Arabic Translation Movement in Baghdad. Routledge.' },
      { j: 'ulasan', t: 'Al-Khalili, J. (2011). The House of Wisdom: How Arabic Science Saved Ancient Knowledge. Penguin.' },
      { j: 'primer', t: 'Rashed, R. (ed.) (2009). Al-Khwarizmi: The Beginnings of Algebra. Saqi Books.' }
    ],
    dakwaan: [
      { t: "Gerakan terjemahan karya Yunani ke bahasa Arab berkembang di Baghdad pada zaman Abbasiyah.", j: 'fakta', s: [0] },
      { t: "Perkataan \"algebra\" berasal daripada al-jabr dalam tajuk kitab al-Khwarizmi.", j: 'fakta', s: [2] },
      { t: "Baghdad ditawan dan dimusnahkan oleh tentera Mongol pada tahun 1258.", j: 'fakta', s: [1] },
      { t: "Bentuk sebenar Baitul Hikmah, sama ada perpustakaan, akademi atau rangkaian sarjana, masih dibahas.", j: 'dibahas', s: [0] }
    ],
    berkaitan: ['ibn-al-haytham', 'adab-menuntut-ilmu']
  },
  {
    slug: 'ibn-al-haytham',
    tajuk: 'Ibn al-Haytham dan cahaya yang masuk ke mata',
    dek: 'Seribu tahun lalu, seorang sarjana di Kaherah menguji idea tentang penglihatan dengan bilik gelap, lubang kecil dan eksperimen yang boleh diulang.',
    kategori: 'sains', tag: ['optik', 'kaedah saintifik', 'tamadun Islam'], tahap: 'Pertengahan',
    terbit: '2026-09-17', kemas: '2026-10-03',
    ringkas60: 'Ibn al-Haytham (sekitar 965–1040) menulis Kitab al-Manazir, karya besar tentang optik. Dia berhujah bahawa kita melihat kerana cahaya dari objek masuk ke mata, bukan kerana mata memancarkan sinar. Dia menekankan eksperimen yang boleh diulang dan sikap ragu terhadap autoriti, sebab itu dia sering disebut antara perintis kaedah saintifik.',
    bahagian: [
      { h: 'Dua teori penglihatan', v: 'Mata → / → Mata', p: [
        'Sebelum Ibn al-Haytham, ramai sarjana mengikuti teori bahawa mata memancarkan sinar ke arah objek. Teori lain berkata sesuatu dari objek masuk ke mata, tetapi butirannya kabur.',
        'Dalam Kitab al-Manazir, yang ditulis sekitar 1011–1021, Ibn al-Haytham menggabungkan geometri, anatomi mata dan eksperimen untuk berhujah bahawa ==cahaya dari setiap titik objek bergerak lurus ke mata==.'
      ]},
      { h: 'Bilik gelap', v: '◐', p: [
        'Dia mengkaji bagaimana cahaya melalui lubang kecil ke dalam bilik gelap dan membentuk imej terbalik pada dinding. Prinsip ini, yang kemudian dikenali sebagai camera obscura, menunjukkan cahaya bergerak dalam garis lurus.',
        'Dia juga menyusun eksperimen tentang pantulan dan pembiasan cahaya, dan merekod keputusannya dengan teliti.'
      ]},
      { h: 'Ragu sebagai disiplin', v: 'Uji', p: [
        'Dalam satu karyanya yang mengkritik Ptolemy, Ibn al-Haytham menulis bahawa pencari kebenaran tidak sepatutnya hanya mempercayai tulisan orang terdahulu, tetapi menguji dan menyoalnya. Sikap ini menjadikan dia tokoh penting dalam sejarah kaedah saintifik.',
        'Kitab al-Manazir diterjemah ke bahasa Latin sebagai De aspectibus dan dibaca oleh sarjana Eropah seperti Roger Bacon dan Johannes Kepler.'
      ]}
    ],
    fakta: ['Kitab al-Manazir ditulis sekitar 1011–1021.', 'Camera obscura menunjukkan cahaya bergerak dalam garis lurus.', 'Terjemahan Latinnya dikenali sebagai De aspectibus.'],
    kuiz: [
      { s: 'Menurut Ibn al-Haytham, bagaimana kita melihat?', p: ['Mata memancarkan sinar', 'Cahaya dari objek masuk ke mata', 'Otak mencipta imej tanpa cahaya'], j: 1, t: 'Dia menyokong teori cahaya masuk ke mata dengan geometri dan eksperimen.' },
      { s: 'Apakah yang ditunjukkan oleh camera obscura?', p: ['Cahaya bergerak dalam garis lurus', 'Cahaya tidak boleh dipantulkan', 'Warna terhasil daripada bunyi'], j: 0, t: 'Imej terbalik terbentuk kerana cahaya bergerak lurus melalui lubang.' },
      { s: 'Kenapa dia dikaitkan dengan kaedah saintifik?', p: ['Dia menekankan eksperimen dan menyoal autoriti', 'Dia mencipta teleskop', 'Dia menolak matematik'], j: 0, t: 'Sikap menguji, bukan sekadar menerima, ialah teras kaedah saintifik.' }
    ],
    refleksi: 'Apakah satu perkara yang kau percaya hanya kerana orang lain berkata begitu? Bagaimana kau boleh mengujinya?',
    rujukan: [
      { j: 'primer', t: 'Sabra, A. I. (trans.) (1989). The Optics of Ibn al-Haytham, Books I–III. Warburg Institute.' },
      { j: 'ulasan', t: 'Lindberg, D. C. (1976). Theories of Vision from al-Kindi to Kepler. University of Chicago Press.' }
    ],
    dakwaan: [
      { t: "Kitab al-Manazir berhujah bahawa cahaya dari objek masuk ke mata.", j: 'fakta', s: [0, 1] },
      { t: "Terjemahan Latinnya dibaca oleh sarjana Eropah termasuk Roger Bacon dan Kepler.", j: 'fakta', s: [1] },
      { t: "Gelaran \"perintis kaedah saintifik\" ialah tafsiran yang lazim tetapi dibahas oleh sejarawan sains.", j: 'dibahas', s: [1] }
    ],
    berkaitan: ['baitul-hikmah', 'langit-biru']
  },
  {
    slug: 'langit-biru',
    tajuk: 'Kenapa langit biru, dan kenapa senja jingga?',
    dek: 'Jawapannya terletak pada saiz molekul udara dan panjang gelombang cahaya.',
    kategori: 'sains', tag: ['fizik', 'cahaya', 'fenomena harian'], tahap: 'Asas',
    terbit: '2026-09-24', kemas: '2026-09-24',
    ringkas60: 'Cahaya matahari mengandungi semua warna. Molekul udara menyerakkan cahaya bergelombang pendek, seperti biru, jauh lebih banyak daripada cahaya bergelombang panjang seperti merah. Ini dipanggil penyerakan Rayleigh. Ketika senja, cahaya melalui lapisan udara yang lebih tebal, jadi kebanyakan biru telah terserak dan yang sampai kepada kita ialah jingga dan merah.',
    bahagian: [
      { h: 'Cahaya putih ialah campuran', v: 'Merah → Ungu', p: [
        'Cahaya matahari kelihatan putih, tetapi ia gabungan semua warna pelangi. Setiap warna mempunyai panjang gelombang tersendiri. Merah sekitar 700 nanometer, biru sekitar 450 nanometer.',
        'Apabila cahaya memasuki atmosfera, ia bertembung dengan molekul nitrogen dan oksigen yang jauh lebih kecil daripada panjang gelombangnya.'
      ]},
      { h: 'Penyerakan Rayleigh', v: '1/λ⁴', p: [
        'Fizikawan Lord Rayleigh menunjukkan bahawa jumlah cahaya yang diserakkan oleh zarah yang sangat kecil berkadar songsang dengan ==kuasa empat panjang gelombang==. Maksudnya, biru diserakkan kira-kira lima hingga enam kali lebih banyak daripada merah.',
        'Cahaya biru yang terserak ini datang kepada kita dari setiap arah di langit. Sebab itu seluruh langit kelihatan biru, bukan hanya kawasan sekitar matahari.'
      ]},
      { h: 'Kenapa bukan ungu?', v: '?', p: [
        'Ungu diserakkan lebih banyak daripada biru, tetapi matahari memancarkan kurang cahaya ungu, sebahagiannya diserap tinggi di atmosfera, dan mata manusia kurang sensitif kepadanya.',
        'Ketika matahari terbit dan terbenam, cahaya merentasi lapisan udara yang jauh lebih tebal. Kebanyakan cahaya biru telah terserak sebelum sampai, jadi yang tinggal ialah ==jingga dan merah==.'
      ]}
    ],
    fakta: ['Biru (~450 nm) diserakkan kira-kira 5–6 kali lebih banyak daripada merah (~700 nm).', 'Cahaya terserak datang dari setiap arah, jadi seluruh langit kelihatan biru.', 'Senja jingga kerana cahaya merentasi lapisan udara yang lebih tebal.'],
    kuiz: [
      { s: 'Warna manakah diserakkan paling banyak oleh molekul udara?', p: ['Merah', 'Biru', 'Kuning'], j: 1, t: 'Gelombang pendek diserakkan jauh lebih banyak.' },
      { s: 'Kenapa langit tidak kelihatan ungu?', p: ['Ungu tidak wujud dalam cahaya matahari', 'Matahari memancarkan kurang ungu dan mata kurang sensitif kepadanya', 'Ungu dipantulkan oleh laut'], j: 1, t: 'Gabungan pancaran matahari, penyerapan dan sensitiviti mata.' },
      { s: 'Kenapa senja berwarna jingga?', p: ['Matahari menjadi lebih sejuk', 'Cahaya merentasi lebih banyak udara, jadi biru telah terserak', 'Awan berwarna jingga'], j: 1, t: 'Laluan lebih panjang menapis keluar biru.' }
    ],
    refleksi: 'Apakah fenomena harian lain yang kau lihat setiap hari tetapi belum tahu sebabnya?',
    rujukan: [
      { j: 'primer', t: 'Strutt, J. W. (Lord Rayleigh) (1871). On the light from the sky, its polarization and colour. Philosophical Magazine, 41, 107–120.' },
      { j: 'ulasan', t: 'Bohren, C. F. (1987). Clouds in a Glass of Beer: Simple Experiments in Atmospheric Physics. Wiley.' }
    ],
    dakwaan: [
      { t: "Penyerakan oleh zarah yang sangat kecil berkadar songsang dengan kuasa empat panjang gelombang.", j: 'fakta', s: [0] },
      { t: "Biru (~450 nm) diserakkan kira-kira 5–6 kali lebih banyak daripada merah (~700 nm).", j: 'pengiraan', s: [0] },
      { t: "Langit tidak kelihatan ungu kerana pancaran matahari, penyerapan atmosfera dan sensitiviti mata.", j: 'fakta', s: [1] }
    ],
    berkaitan: ['ibn-al-haytham', 'kafein-dan-tidur']
  },
  {
    slug: 'adab-menuntut-ilmu',
    tajuk: 'Adab sebelum ilmu: tradisi belajar dalam Islam',
    dek: 'Para ulama silam menulis bukan sahaja tentang apa yang perlu dipelajari, tetapi bagaimana menjadi seorang penuntut ilmu.',
    kategori: 'agama', tag: ['adab', 'turath', 'belajar'], tahap: 'Asas',
    terbit: '2026-09-12', kemas: '2026-10-08', pilihan: true,
    ringkas60: 'Tradisi keilmuan Islam meletakkan adab sebagai asas sebelum menuntut ilmu. Kitab Ta\'lim al-Muta\'allim oleh az-Zarnuji dan bab ilmu dalam Ihya\' Ulum al-Din oleh al-Ghazali membincangkan niat, memilih guru, menghormati ilmu dan istiqamah. Prinsip ini masih relevan untuk sesiapa yang ingin belajar dengan bermakna.',
    bahagian: [
      { h: 'Ilmu sebagai tuntutan', v: 'Wajib', p: [
        'Sebuah hadis yang diriwayatkan oleh Ibn Majah menyebut bahawa menuntut ilmu itu wajib ke atas setiap Muslim. Para ulama menghuraikan bahawa ilmu yang wajib bagi setiap individu ialah ilmu yang diperlukan untuk menunaikan kewajipan agamanya, manakala ilmu lain menjadi fardu kifayah untuk masyarakat.',
        'Tuntutan ini menjadikan belajar sebagai sebahagian daripada ibadah, bukan sekadar jalan ke kerjaya.'
      ]},
      { h: 'Ta\'lim al-Muta\'allim', v: 'Abad ke-13', p: [
        'Burhanuddin az-Zarnuji menulis Ta\'lim al-Muta\'allim, sebuah kitab ringkas tentang cara belajar. Kitab ini masih dibaca di pondok dan pesantren di Nusantara hingga hari ini.',
        'Antara tema utamanya: ==membetulkan niat==, memilih ilmu dan guru dengan teliti, bersabar, menghormati guru dan kitab, serta mengulang kaji secara konsisten.'
      ]},
      { h: 'Pelajari adab sebelum ilmunya', v: 'Adab', p: [
        'Diriwayatkan bahawa ibu Imam Malik memakaikannya pakaian penuntut ilmu dan berpesan supaya dia pergi kepada gurunya Rabi\'ah dan mempelajari adabnya sebelum ilmunya.',
        'Dalam Ihya\' Ulum al-Din, Imam al-Ghazali membezakan ilmu yang membawa manfaat dengan ilmu yang hanya dicari untuk berbangga atau berdebat. Ukurannya bukan berapa banyak yang diketahui, tetapi ==bagaimana ilmu itu mengubah diri==.'
      ]},
      { h: 'Untuk pembaca hari ini', v: 'Niat · Guru · Istiqamah', p: [
        'Prinsip yang sama boleh diamalkan ketika belajar dalam talian. Mulakan dengan niat yang jelas. Semak sumber dan siapa yang menulisnya. Belajar sedikit tetapi berterusan.',
        'Untuk persoalan hukum yang khusus, rujuk guru atau pihak berautoriti yang berkelayakan. Artikel ini ialah pengenalan, bukan fatwa.'
      ]}
    ],
    fakta: ['Ta\'lim al-Muta\'allim oleh az-Zarnuji masih dibaca di pondok dan pesantren.', 'Ulama membezakan ilmu fardu ain dan fardu kifayah.', 'Ukuran ilmu ialah bagaimana ia mengubah diri.'],
    kuiz: [
      { s: 'Siapakah penulis Ta\'lim al-Muta\'allim?', p: ['Imam al-Ghazali', 'Burhanuddin az-Zarnuji', 'Ibn Khaldun'], j: 1, t: 'Az-Zarnuji menulisnya sebagai panduan ringkas untuk penuntut ilmu.' },
      { s: 'Apakah pesanan ibu Imam Malik menurut riwayat?', p: ['Belajar adab gurunya sebelum ilmunya', 'Belajar seberapa cepat yang boleh', 'Belajar bersendirian'], j: 0, t: 'Adab dianggap pintu kepada ilmu.' },
      { s: 'Menurut perbincangan al-Ghazali, ukuran ilmu yang bermanfaat ialah…', p: ['Bilangan kitab yang dibaca', 'Bagaimana ilmu itu mengubah diri', 'Kemenangan dalam perdebatan'], j: 1, t: 'Ilmu yang bermanfaat membuahkan amal dan perubahan diri.' }
    ],
    refleksi: 'Apakah niat kau ketika membuka Ruang Ilmu hari ini?',
    rujukan: [
      { j: 'primer', t: 'Az-Zarnuji, B. Ta\'lim al-Muta\'allim Tariq at-Ta\'allum. Pelbagai edisi dan terjemahan.' },
      { j: 'primer', t: 'Al-Ghazali, A. H. Ihya\' Ulum al-Din, Kitab al-\'Ilm. Pelbagai edisi.' },
      { j: 'primer', t: 'Sunan Ibn Majah, Kitab al-Muqaddimah, hadis tentang kewajipan menuntut ilmu.' }
    ],
    dakwaan: [
      { t: "Hadis tentang kewajipan menuntut ilmu diriwayatkan oleh Ibn Majah.", j: 'fakta', s: [2] },
      { t: "Ta'lim al-Muta'allim membincangkan niat, pemilihan guru, kesabaran dan ulang kaji.", j: 'fakta', s: [0] },
      { t: "Kisah pesanan ibu Imam Malik ialah riwayat yang masyhur dalam tradisi keilmuan.", j: 'riwayat', s: [] },
      { t: "Ukuran ilmu yang bermanfaat ialah perubahan diri.", j: 'tafsiran', s: [1] }
    ],
    berkaitan: ['hadis-niat', 'baitul-hikmah']
  },
  {
    slug: 'hadis-niat',
    tajuk: '"Sesungguhnya setiap amalan bergantung pada niat"',
    dek: 'Kenapa Imam al-Bukhari meletakkan hadis ini di permulaan Sahihnya, dan apa maknanya dalam kehidupan harian.',
    kategori: 'agama', tag: ['hadis', 'niat', 'turath'], tahap: 'Asas',
    terbit: '2026-10-02', kemas: '2026-10-09',
    ringkas60: 'Hadis niat diriwayatkan oleh Umar ibn al-Khattab dan direkodkan oleh al-Bukhari dan Muslim. Al-Bukhari meletakkannya sebagai hadis pertama dalam Sahihnya. Ia mengajar bahawa nilai sesuatu amalan bergantung pada niat di sebaliknya. Para ulama menganggapnya antara hadis yang menjadi paksi ajaran Islam.',
    bahagian: [
      { h: 'Teks dan perawi', v: 'Bukhari · Muslim', p: [
        'Hadis ini diriwayatkan oleh Umar ibn al-Khattab. Maksudnya: "Sesungguhnya setiap amalan bergantung pada niat, dan setiap orang mendapat apa yang dia niatkan." Ia direkodkan oleh al-Bukhari dan Muslim.',
        'Hadis ini datang dengan contoh hijrah: sesiapa yang berhijrah kerana Allah dan Rasul-Nya, hijrahnya kerana Allah dan Rasul-Nya. Sesiapa yang berhijrah kerana dunia, dia mendapat apa yang dia tuju.'
      ]},
      { h: 'Kenapa di permulaan kitab', v: 'Hadis No. 1', p: [
        'Imam al-Bukhari membuka Sahihnya dengan hadis ini. Ramai ulama melihatnya sebagai peringatan kepada penulis dan pembaca supaya membetulkan niat sebelum menuntut ilmu.',
        'Ibn Rajab al-Hanbali dalam Jami\' al-\'Ulum wa al-Hikam menukilkan pandangan sebahagian ulama, termasuk Imam al-Syafi\'i dan Imam Ahmad, bahawa hadis ini ==merangkumi sebahagian besar ilmu==.'
      ]},
      { h: 'Niat dalam kehidupan harian', v: 'Amal biasa → ibadah', p: [
        'Para ulama menghuraikan bahawa perbuatan harian seperti bekerja, makan atau berehat boleh bernilai ibadah apabila diniatkan dengan baik dan dilakukan dengan cara yang dibenarkan.',
        'Ini juga mengajar kejujuran terhadap diri. Sebelum memulakan sesuatu, tanya: untuk apa aku melakukan ini?'
      ]}
    ],
    fakta: ['Hadis niat ialah hadis pertama dalam Sahih al-Bukhari.', 'Ia diriwayatkan oleh Umar ibn al-Khattab.', 'Amalan harian boleh bernilai ibadah dengan niat yang baik.'],
    kuiz: [
      { s: 'Siapakah perawi hadis niat?', p: ['Abu Hurairah', 'Umar ibn al-Khattab', 'Aisyah'], j: 1, t: 'Hadis ini diriwayatkan oleh Umar ibn al-Khattab.' },
      { s: 'Di manakah al-Bukhari meletakkan hadis ini?', p: ['Di akhir kitab', 'Sebagai hadis pertama Sahihnya', 'Dalam bab jual beli sahaja'], j: 1, t: 'Ia membuka Sahih al-Bukhari.' },
      { s: 'Contoh yang disebut dalam hadis ini ialah…', p: ['Hijrah', 'Puasa', 'Zakat'], j: 0, t: 'Hijrah dijadikan contoh bagaimana niat menentukan nilai amalan.' }
    ],
    refleksi: 'Pilih satu rutin harian kau. Apakah niat yang boleh menjadikannya lebih bermakna?',
    rujukan: [
      { j: 'primer', t: 'Sahih al-Bukhari, Kitab Bad\' al-Wahy, hadis no. 1.' },
      { j: 'primer', t: 'Sahih Muslim, Kitab al-Imarah, hadis no. 1907.' },
      { j: 'ulasan', t: 'Ibn Rajab al-Hanbali. Jami\' al-\'Ulum wa al-Hikam, syarah hadis pertama.' }
    ],
    dakwaan: [
      { t: "Hadis niat diriwayatkan oleh Umar ibn al-Khattab dan direkodkan oleh al-Bukhari dan Muslim.", j: 'fakta', s: [0, 1] },
      { t: "Al-Bukhari meletakkannya sebagai hadis pertama dalam Sahihnya.", j: 'fakta', s: [0] },
      { t: "Sebahagian ulama menganggap hadis ini merangkumi sebahagian besar ilmu.", j: 'tafsiran', s: [2] }
    ],
    berkaitan: ['adab-menuntut-ilmu', 'kenapa-bertangguh']
  },
  {
    slug: 'sejarah-kopi',
    tajuk: 'Dari Yaman ke cawan kau: sejarah ringkas kopi',
    dek: 'Kopi bermula sebagai minuman yang membantu ahli sufi berjaga malam, kemudian mengubah cara dunia bersembang dan berdagang.',
    kategori: 'sejarah', tag: ['kopi', 'perdagangan', 'tamadun Islam'], tahap: 'Asas', kopi: true,
    terbit: '2026-09-19', kemas: '2026-10-11',
    ringkas60: 'Bukti terawal yang boleh dipercayai tentang minuman kopi datang dari biara sufi di Yaman pada pertengahan abad ke-15. Pelabuhan Mokha menjadi pusat eksportnya. Kedai kopi kemudian muncul di Makkah, Kaherah dan Istanbul, sebelum kopi tiba di Eropah pada abad ke-17. Kisah Kaldi dan kambingnya ialah legenda yang hanya ditulis pada tahun 1671.',
    bahagian: [
      { h: 'Legenda dan bukti', v: 'Kaldi?', p: [
        'Kisah popular menceritakan seorang pengembala Habsyah bernama Kaldi yang melihat kambingnya bertenaga selepas memakan buah kopi. Kisah ini menarik, tetapi catatan bertulisnya yang terawal muncul pada tahun 1671, berabad-abad selepas kopi diminum.',
        'Bukti sejarah yang lebih kukuh menunjukkan kopi diminum dalam ==biara sufi di Yaman pada pertengahan abad ke-15==, untuk membantu mereka berjaga semasa zikir malam.'
      ]},
      { h: 'Mokha dan kedai kopi', v: 'al-Makha', p: [
        'Pelabuhan Mokha di Yaman menjadi pintu eksport kopi ke dunia. Nama "mocha" hari ini berasal daripadanya.',
        'Kedai kopi muncul di Makkah dan Kaherah, dan pada tahun 1550-an di Istanbul. Ia menjadi tempat orang bersembang, bermain catur, mendengar puisi dan berbincang tentang berita. Sebab itu kedai kopi kadang-kadang dicurigai oleh pihak berkuasa.'
      ]},
      { h: 'Ke Eropah dan ke Nusantara', v: 'Abad ke-17', p: [
        'Pedagang membawa kopi ke Venice dan London pada abad ke-17. Rumah kopi London dikenali sebagai "penny universities" kerana dengan harga secawan kopi, seseorang boleh mendengar perbincangan intelektual.',
        'Belanda mula menanam kopi di Jawa pada akhir abad ke-17. Di Malaysia hari ini, Johor terkenal dengan ==kopi Liberica==, spesies berbiji besar dengan aroma yang khas.'
      ]}
    ],
    fakta: ['Kisah Kaldi hanya muncul dalam tulisan pada tahun 1671.', 'Nama "mocha" berasal daripada pelabuhan Mokha di Yaman.', 'Rumah kopi London digelar "penny universities".'],
    kuiz: [
      { s: 'Di manakah bukti terawal yang kukuh tentang minuman kopi?', p: ['Biara sufi di Yaman', 'Istana di Paris', 'Ladang di Brazil'], j: 0, t: 'Pertengahan abad ke-15, dalam kalangan ahli sufi Yaman.' },
      { s: 'Nama "mocha" berasal daripada…', p: ['Sejenis coklat', 'Pelabuhan Mokha di Yaman', 'Nama seorang pedagang'], j: 1, t: 'Mokha ialah pelabuhan eksport kopi yang utama.' },
      { s: 'Kenapa rumah kopi London digelar "penny universities"?', p: ['Kopi dijual kepada pelajar universiti sahaja', 'Dengan harga secawan kopi, seseorang boleh mendengar perbincangan intelektual', 'Ia dibina oleh universiti'], j: 1, t: 'Kedai kopi menjadi ruang pertukaran idea.' }
    ],
    refleksi: 'Di manakah "ruang ilmu" kau sendiri: tempat kau paling banyak berbincang dan belajar?',
    rujukan: [
      { j: 'ulasan', t: 'Hattox, R. S. (1985). Coffee and Coffeehouses: The Origins of a Social Beverage in the Medieval Near East. University of Washington Press.' },
      { j: 'ulasan', t: 'Ellis, M. (2004). The Coffee House: A Cultural History. Weidenfeld & Nicolson.' },
      { j: 'ulasan', t: 'Pendergrast, M. (2010). Uncommon Grounds: The History of Coffee and How It Transformed Our World. Basic Books.' }
    ],
    dakwaan: [
      { t: "Bukti terawal yang kukuh tentang minuman kopi datang dari biara sufi di Yaman pada pertengahan abad ke-15.", j: 'fakta', s: [0, 2] },
      { t: "Kisah Kaldi dan kambingnya hanya muncul dalam tulisan pada tahun 1671.", j: 'fakta', s: [2] },
      { t: "Rumah kopi London digelar \"penny universities\".", j: 'fakta', s: [1] }
    ],
    berkaitan: ['sains-espresso', 'baitul-hikmah'], pasangan: 'classic'
  },
  {
    slug: 'sains-espresso',
    tajuk: 'Sains di sebalik secawan espresso',
    dek: 'Tekanan, suhu, masa dan saiz kisaran. Empat pemboleh ubah yang menentukan sama ada espresso terasa masam, pahit atau seimbang.',
    kategori: 'sains', tag: ['kopi', 'kimia', 'fenomena harian'], tahap: 'Pertengahan', kopi: true,
    terbit: '2026-10-09', kemas: '2026-10-15',
    ringkas60: 'Espresso dibuat dengan menolak air panas sekitar 90–96°C melalui kopi yang dikisar halus pada tekanan kira-kira 9 bar, selama 25–30 saat. Jika air mengalir terlalu cepat, sebatian masam diekstrak tetapi yang manis belum sempat larut. Jika terlalu lama, sebatian pahit mula mendominasi. Crema terbentuk daripada karbon dioksida yang terperangkap dalam minyak kopi.',
    bahagian: [
      { h: 'Empat pemboleh ubah', v: '9 bar', p: [
        'Mesin espresso biasanya menolak air pada tekanan sekitar ==9 bar==, iaitu sembilan kali tekanan atmosfera. Suhu air lazimnya antara 90 hingga 96°C.',
        'Resipi asas ialah kira-kira 18 gram kopi kisar untuk menghasilkan sekitar 36 gram espresso dalam 25 hingga 30 saat. Barista mengubah saiz kisaran untuk mengawal kelajuan aliran.'
      ]},
      { h: 'Masam, manis, pahit', v: 'Ekstraksi', p: [
        'Sebatian dalam kopi larut pada kadar berbeza. Asid buah larut dahulu, kemudian gula dan sebatian perisa, dan akhir sekali sebatian yang lebih pahit.',
        'Espresso yang kurang diekstrak terasa masam dan nipis. Yang terlebih diekstrak terasa pahit dan kering. Matlamat barista ialah titik tengah di mana ==kemanisan dan keasidan seimbang==.'
      ]},
      { h: 'Rahsia crema', v: 'CO₂', p: [
        'Biji kopi yang baru dipanggang masih menyimpan karbon dioksida. Di bawah tekanan, gas ini larut dalam minyak dan air, kemudian membentuk buih halus apabila tekanan dilepaskan. Itulah crema.',
        'Crema yang tebal biasanya menandakan biji yang segar, tetapi ia bukan satu-satunya ukuran rasa yang baik.'
      ]}
    ],
    fakta: ['Mesin espresso menolak air pada sekitar 9 bar.', 'Resipi asas: 18 g kopi menghasilkan sekitar 36 g espresso dalam 25–30 saat.', 'Crema terbentuk daripada karbon dioksida dalam biji yang baru dipanggang.'],
    kuiz: [
      { s: 'Berapakah tekanan lazim mesin espresso?', p: ['Sekitar 2 bar', 'Sekitar 9 bar', 'Sekitar 30 bar'], j: 1, t: 'Kira-kira sembilan kali tekanan atmosfera.' },
      { s: 'Espresso yang terlalu masam biasanya…', p: ['Kurang diekstrak', 'Terlebih diekstrak', 'Terlalu banyak susu'], j: 0, t: 'Asid larut dahulu; gula belum sempat diekstrak.' },
      { s: 'Crema terbentuk daripada…', p: ['Susu', 'Karbon dioksida yang terperangkap dalam minyak kopi', 'Gula yang terbakar'], j: 1, t: 'Gas dari biji yang baru dipanggang membentuk buih halus.' }
    ],
    refleksi: 'Apakah satu proses harian lain yang kualitinya bergantung pada keseimbangan masa dan suhu?',
    rujukan: [
      { j: 'ulasan', t: 'Illy, A., & Viani, R. (eds.) (2005). Espresso Coffee: The Science of Quality (2nd ed.). Elsevier Academic Press.' },
      { j: 'rasmi', t: 'Specialty Coffee Association. Coffee Brewing Control Chart dan garis panduan pengekstrakan.' }
    ],
    dakwaan: [
      { t: "Espresso lazimnya dibancuh pada tekanan sekitar 9 bar dan suhu air 90–96°C.", j: 'fakta', s: [0] },
      { t: "Kurang ekstrak menghasilkan rasa masam; terlebih ekstrak menghasilkan rasa pahit.", j: 'fakta', s: [0, 1] },
      { t: "Crema terbentuk daripada karbon dioksida dalam biji yang baru dipanggang.", j: 'fakta', s: [0] }
    ],
    berkaitan: ['sejarah-kopi', 'kafein-dan-tidur'], pasangan: 'mocha'
  },
  {
    slug: 'kafein-dan-tidur',
    tajuk: 'Kafein dan tidur: bila cawan terakhir sepatutnya?',
    dek: 'Kafein tidak memberi tenaga. Ia menyembunyikan rasa penat, dan kesannya bertahan lebih lama daripada yang kita sangka.',
    kategori: 'sains', tag: ['kopi', 'kesihatan', 'tidur'], tahap: 'Asas', kopi: true,
    terbit: '2026-10-13', kemas: '2026-10-16', pilihan: true,
    ringkas60: 'Kafein menghalang adenosina, bahan kimia yang membina rasa mengantuk sepanjang hari. Separuh hayatnya pada orang dewasa yang sihat ialah sekitar lima jam, walaupun ia berbeza antara individu. Satu kajian mendapati kafein yang diambil enam jam sebelum tidur masih mengurangkan tidur lebih daripada sejam. Ramai pakar mencadangkan cawan terakhir sebelum awal petang.',
    bahagian: [
      { h: 'Bagaimana kafein bekerja', v: 'Adenosina', p: [
        'Sepanjang kita berjaga, adenosina terkumpul dalam otak dan mewujudkan tekanan untuk tidur. Kafein mempunyai bentuk yang hampir sama dan melekat pada reseptor adenosina tanpa mengaktifkannya.',
        'Hasilnya, isyarat penat tersekat buat sementara. Kafein ==tidak menghapuskan rasa penat==; ia menangguhkannya.'
      ]},
      { h: 'Separuh hayat lima jam', v: '≈ 5 jam', p: [
        'Separuh hayat kafein pada orang dewasa yang sihat secara purata sekitar lima jam, tetapi boleh berbeza dari kira-kira dua hingga sepuluh jam bergantung pada genetik, kehamilan, ubat dan merokok.',
        'Jika kau minum secawan kopi pada pukul 4 petang, separuh daripada kafeinnya mungkin masih dalam badan pada pukul 9 malam.'
      ]},
      { h: 'Bukti tentang tidur', v: '6 jam', p: [
        'Dalam kajian oleh Christopher Drake dan rakan-rakan (2013), 400 mg kafein yang diambil enam jam sebelum tidur mengurangkan jumlah tidur lebih daripada sejam, walaupun peserta tidak selalu menyedarinya.',
        'Pihak Berkuasa Keselamatan Makanan Eropah (EFSA) menganggap sehingga 400 mg kafein sehari secara umumnya selamat untuk orang dewasa yang sihat, dan 200 mg untuk wanita hamil. Satu shot espresso mengandungi kira-kira 60–70 mg. Untuk nasihat peribadi, rujuk pengamal perubatan.'
      ]}
    ],
    fakta: ['Kafein menghalang reseptor adenosina tanpa mengaktifkannya.', 'Separuh hayat kafein pada orang dewasa sihat: purata sekitar 5 jam.', 'Satu shot espresso mengandungi kira-kira 60–70 mg kafein.'],
    kuiz: [
      { s: 'Apakah yang dilakukan kafein dalam otak?', p: ['Menambah tenaga baharu', 'Menghalang reseptor adenosina', 'Menghasilkan adenosina'], j: 1, t: 'Ia menyekat isyarat penat buat sementara.' },
      { s: 'Separuh hayat purata kafein pada orang dewasa sihat ialah sekitar…', p: ['30 minit', '5 jam', '24 jam'], j: 1, t: 'Purata sekitar lima jam, tetapi berbeza antara individu.' },
      { s: 'Dalam kajian Drake (2013), kafein enam jam sebelum tidur…', p: ['Tidak memberi kesan', 'Mengurangkan tidur lebih daripada sejam', 'Memanjangkan tidur'], j: 1, t: 'Kesannya ketara walaupun peserta tidak selalu menyedarinya.' }
    ],
    refleksi: 'Pukul berapa cawan kopi terakhir kau semalam? Bagaimana tidur kau?',
    rujukan: [
      { j: 'primer', t: 'Drake, C., et al. (2013). Caffeine effects on sleep taken 0, 3, or 6 hours before going to bed. Journal of Clinical Sleep Medicine, 9(11), 1195–1200.' },
      { j: 'rasmi', t: 'EFSA Panel on Dietetic Products, Nutrition and Allergies (2015). Scientific Opinion on the safety of caffeine. EFSA Journal, 13(5), 4102.' },
      { j: 'ulasan', t: 'Institute of Medicine (2001). Caffeine for the Sustainment of Mental Task Performance. National Academies Press.' }
    ],
    dakwaan: [
      { t: "400 mg kafein enam jam sebelum tidur mengurangkan jumlah tidur lebih daripada sejam.", j: 'fakta', s: [0] },
      { t: "Sehingga 400 mg kafein sehari dianggap selamat untuk orang dewasa yang sihat, dan 200 mg untuk wanita hamil.", j: 'fakta', s: [1] },
      { t: "Separuh hayat kafein berbeza antara individu, dengan purata sekitar lima jam.", j: 'fakta', s: [2] },
      { t: "Untuk nasihat peribadi, rujuk pengamal perubatan.", j: 'nasihat', s: [] }
    ],
    berkaitan: ['sains-espresso', 'pengulangan-berjarak'], pasangan: 'choc'
  },
  {
    slug: 'kuasa-pertumbuhan-berganda',
    tajuk: 'Kuasa pertumbuhan berganda: kenapa bermula awal lebih penting',
    dek: 'RM100 sebulan selama 30 tahun bukan RM36,000. Dengan pulangan 5% setahun, ia menghampiri RM83,000.',
    kategori: 'kehidupan', tag: ['kewangan', 'simpanan', 'masa'], tahap: 'Asas',
    terbit: '2026-10-16', kemas: '2026-10-18',
    ringkas60: 'Pertumbuhan berganda berlaku apabila pulangan turut menjana pulangan. RM100 sebulan pada kadar pulangan 5% setahun menjadi kira-kira RM41,000 selepas 20 tahun, tetapi kira-kira RM83,000 selepas 30 tahun. Sepuluh tahun tambahan hampir menggandakan hasil. Peraturan 72 memberi anggaran cepat berapa lama wang berganda.',
    bahagian: [
      { h: 'Pulangan atas pulangan', v: 'RM100 / bulan', p: [
        'Bayangkan kau menyimpan RM100 sebulan dalam pelaburan yang memberi pulangan purata 5% setahun. Selepas 20 tahun, kau telah memasukkan RM24,000, dan nilainya menjadi kira-kira ==RM41,000==.',
        'Jika kau mula sepuluh tahun lebih awal dan menyimpan selama 30 tahun, kau memasukkan RM36,000 dan nilainya menjadi kira-kira ==RM83,000==. Masa tambahan bekerja lebih keras daripada wang tambahan.'
      ]},
      { h: 'Peraturan 72', v: '72 ÷ 6 = 12', p: [
        'Untuk anggaran cepat, bahagikan 72 dengan kadar pulangan tahunan. Pada 6% setahun, wang berganda dalam kira-kira 12 tahun. Pada 9%, kira-kira 8 tahun.',
        'Peraturan yang sama juga bekerja ke arah sebaliknya: inflasi 3% setahun menghakis separuh nilai wang dalam kira-kira 24 tahun.'
      ]},
      { h: 'Bukan hanya wang', v: '1% sehari', p: [
        'Konsep yang sama berlaku pada ilmu dan tabiat. Membaca lima minit sehari kelihatan kecil, tetapi selepas setahun ia melebihi 30 jam bacaan, dan setiap idea baharu memudahkan idea seterusnya difahami.',
        'Nota: angka di atas ialah ilustrasi, bukan nasihat kewangan. Pulangan sebenar berubah-ubah. Bagi yang mengutamakan patuh syariah, pilih instrumen yang diluluskan oleh majlis penasihat syariah dan rujuk perancang kewangan berlesen.'
      ]}
    ],
    fakta: ['RM100 sebulan pada 5% setahun: ~RM41,000 selepas 20 tahun, ~RM83,000 selepas 30 tahun.', 'Peraturan 72: 72 ÷ kadar pulangan = tahun untuk berganda.', 'Inflasi 3% setahun menghakis separuh nilai wang dalam ~24 tahun.'],
    kuiz: [
      { s: 'Apakah pertumbuhan berganda?', p: ['Pulangan turut menjana pulangan', 'Menyimpan dua kali sebulan', 'Pinjaman berganda'], j: 0, t: 'Pertumbuhan dikira atas jumlah yang semakin besar.' },
      { s: 'Menggunakan Peraturan 72, berapa lama wang berganda pada 6% setahun?', p: ['6 tahun', '12 tahun', '72 tahun'], j: 1, t: '72 ÷ 6 = 12.' },
      { s: 'Apakah kesan menyimpan 10 tahun lebih awal dalam contoh di atas?', p: ['Hasil hampir berganda', 'Tiada perbezaan', 'Hasil berkurang'], j: 0, t: 'Dari ~RM41,000 kepada ~RM83,000.' }
    ],
    refleksi: 'Apakah satu tabiat kecil yang, jika diulang setiap hari selama setahun, akan memberi kesan besar?',
    rujukan: [
      { j: 'pengiraan', t: 'Pengiraan nilai masa depan anuiti: RM100 sebulan, kadar 5% setahun dikompaun bulanan.' },
      { j: 'rasmi', t: 'Bank Negara Malaysia. Portal pendidikan kewangan (bnm.gov.my) untuk bahan literasi kewangan.' }
    ],
    dakwaan: [
      { t: "RM100 sebulan pada 5% setahun menjadi ~RM41,000 selepas 20 tahun dan ~RM83,000 selepas 30 tahun.", j: 'pengiraan', s: [0] },
      { t: "Peraturan 72 memberi anggaran cepat tempoh wang berganda.", j: 'pengiraan', s: [0] },
      { t: "Angka ialah ilustrasi, bukan nasihat kewangan.", j: 'nasihat', s: [1] }
    ],
    berkaitan: ['kenapa-bertangguh', 'pengulangan-berjarak']
  },
  {
    slug: 'taktik-manipulasi-media',
    tajuk: 'Trust Me, I\'m Lying: bagaimana berita palsu naik tangga',
    dek: 'Seorang pemasar mendedahkan cara dia memanipulasi blog dan media. Tujuannya bukan untuk ditiru, tetapi supaya kita boleh mengenalinya.',
    kategori: 'kreatif', tag: ['celik media', 'manipulasi', 'pemikiran kritis'], tahap: 'Pertengahan',
    terbit: '2026-10-24', kemas: '2026-10-24', pilihan: true,
    ringkas60: 'Dalam Trust Me, I\'m Lying (2012), Ryan Holiday menerangkan bagaimana cerita kecil di blog kecil dipetik oleh laman yang lebih besar sehingga menjadi berita nasional, tanpa sesiapa menyemak sumber asalnya. Sistem yang dibayar mengikut pageview menggalakkan tajuk yang membangkitkan emosi dan berita yang diterbitkan dahulu, disemak kemudian. Pembetulan pula jarang sampai kepada pembaca asal.',
    bahagian: [
      { h: 'Pengakuan seorang pemasar', v: '2012', p: [
        'Ryan Holiday pernah menjadi pengarah pemasaran American Apparel. Dalam Trust Me, I\'m Lying, dia menceritakan bagaimana dia sendiri mencipta liputan media untuk pelanggannya, termasuk merosakkan papan iklan sebuah filem yang dipromosikannya, kemudian menghantar gambarnya kepada blog secara tanpa nama.',
        'Buku itu ditulis sebagai pengakuan. Holiday berhujah bahawa ==masalahnya bukan pada seorang manipulator, tetapi pada sistem yang memberi ganjaran kepada manipulasi==.'
      ]},
      { h: 'Naik tangga', v: 'Kecil → besar', p: [
        'Taktik paling terkenal dalam buku itu ialah "trading up the chain". Cerita dimulakan di blog kecil yang mudah menerima tip. Laman yang lebih besar memetik blog itu, kemudian akhbar memetik laman besar itu. Pada setiap anak tangga, sumber asal semakin jauh dan semakin sedikit orang yang menyemaknya.',
        'Holiday memanggil ini ilusi sumber dalam "ekonomi pautan": setiap laman memautkan laman sebelumnya, jadi cerita kelihatan disahkan oleh banyak pihak walaupun semuanya bersandar pada satu tip yang sama.'
      ]},
      { h: 'Apa yang tersebar, bukan apa yang benar', v: 'Marah > sedih', p: [
        'Holiday memetik kajian Jonah Berger dan Katherine Milkman (2012) terhadap artikel New York Times. Artikel yang membangkitkan emosi berintensiti tinggi seperti kagum, marah dan cemas lebih kerap dikongsi. Artikel yang membuatkan pembaca sedih kurang dikongsi.',
        'Apabila pendapatan bergantung pada pageview, penerbit terdorong memilih apa yang tersebar. Tajuk menjadi produk, dan ==kemarahan menjadi bahan api yang paling murah==.'
      ]},
      { h: 'Terbit dahulu, betulkan kemudian', v: 'Mitos pembetulan', p: [
        'Holiday mengkritik apa yang dipanggilnya kewartawanan berulang: terbitkan dengan cepat, kemudian kemas kini jika ada yang salah. Masalahnya, pembetulan jarang dibaca oleh orang yang membaca versi asal.',
        'Dia mencadangkan model langganan sebagai jalan keluar, kerana penerbit yang dibayar oleh pembaca setia lebih bergantung pada kepercayaan berbanding klik sekali lalu.'
      ]},
      { h: 'Empat soalan sebelum percaya', v: '4 soalan', p: [
        'Siapa sumber asal, bukan siapa yang terakhir memetik? Siapa yang mendapat untung jika aku percaya dan berkongsi? Adakah tajuk ini benar-benar dijawab dalam isinya? Bilakah ia dikemas kini, dan apa yang telah dibetulkan?',
        'Setiap bahan di Ruang Ilmu kini menjawab empat soalan ini dalam ==Kad integriti== di hujung artikel.'
      ]}
    ],
    fakta: ['Cerita boleh "naik tangga" dari blog kecil ke berita nasional tanpa sumber asalnya disemak.', 'Kandungan yang membangkitkan kagum, marah dan cemas lebih kerap dikongsi berbanding kandungan yang menyedihkan.', 'Pembetulan jarang sampai kepada pembaca versi asal.'],
    kuiz: [
      { s: 'Apakah maksud "trading up the chain"?', p: ['Cerita dari blog kecil dipetik oleh laman yang semakin besar', 'Menjual saham syarikat media', 'Menulis artikel bersiri'], j: 0, t: 'Setiap anak tangga memetik yang sebelumnya, jadi sumber asal jarang disemak.' },
      { s: 'Menurut kajian Berger dan Milkman, artikel jenis apa yang paling jarang dikongsi?', p: ['Yang membangkitkan rasa kagum', 'Yang membangkitkan kemarahan', 'Yang membuatkan pembaca sedih'], j: 2, t: 'Emosi berintensiti rendah seperti sedih kurang mendorong perkongsian.' },
      { s: 'Apakah penyelesaian yang dicadangkan Holiday?', p: ['Lebih banyak iklan', 'Model langganan yang bergantung pada kepercayaan pembaca', 'Tajuk yang lebih pendek'], j: 1, t: 'Pembaca yang membayar memberi ganjaran kepada kepercayaan, bukan klik.' }
    ],
    refleksi: 'Fikirkan satu berita yang kau kongsi baru-baru ini. Siapa sumber asalnya?',
    rujukan: [
      { j: 'primer', t: 'Holiday, R. (2012). Trust Me, I\'m Lying: Confessions of a Media Manipulator. Portfolio/Penguin. Edisi 2013 dengan prakata dan dua lampiran baharu.' },
      { j: 'primer', t: 'Berger, J., & Milkman, K. L. (2012). What makes online content viral? Journal of Marketing Research, 49(2), 192–205.' }
    ],
    dakwaan: [
      { t: 'Holiday menerangkan bagaimana cerita dari blog kecil dipetik oleh laman yang lebih besar tanpa sumber asalnya disemak.', j: 'fakta', s: [0] },
      { t: 'Artikel yang membangkitkan kagum, marah atau cemas lebih kerap dikongsi; artikel yang menyedihkan kurang dikongsi.', j: 'fakta', s: [1] },
      { t: 'Model bayaran mengikut pageview memberi ganjaran kepada manipulasi.', j: 'pendapat', s: [0] },
      { t: 'Model langganan lebih selari dengan kepercayaan pembaca.', j: 'pendapat', s: [0] }
    ],
    berkaitan: ['bias-pengesahan', 'kenapa-percaya-ramalan']
  }
];

const LALUAN = [
  { slug: 'berfikir-jelas', nama: 'Berfikir dengan jelas', ringkas: 'Kenali perangkap minda yang paling biasa dan cara mengelaknya.', kurator: 'Meja Editorial', item: ['kenapa-percaya-ramalan', 'bias-pengesahan', 'menulis-untuk-berfikir', 'kenapa-bertangguh'] },
  { slug: 'tamadun-ilmu', nama: 'Tamadun ilmu', ringkas: 'Dari adab penuntut ilmu ke bilik gelap Ibn al-Haytham.', kurator: 'Meja Editorial', item: ['hadis-niat', 'adab-menuntut-ilmu', 'baitul-hikmah', 'ibn-al-haytham'] },
  { slug: 'biji-ke-cawan', nama: 'Kopi: dari biji ke cawan', ringkas: 'Sejarah, sains dan kesan kopi pada tidur. Sesuai dibaca bersama secawan.', kurator: 'Meja Editorial × Sip \'n Go', item: ['sejarah-kopi', 'sains-espresso', 'kafein-dan-tidur'] },
  { slug: 'celik-media', nama: 'Celik media', ringkas: 'Kenali cara maklumat dimanipulasi, dan cara membaca dengan skeptikal yang sihat.', kurator: 'Meja Editorial', item: ['taktik-manipulasi-media', 'kenapa-percaya-ramalan', 'bias-pengesahan', 'menulis-untuk-berfikir'] },
  { slug: 'belajar-cara-belajar', nama: 'Belajar cara belajar', ringkas: 'Teknik yang disokong kajian untuk mengingat lebih lama dan bertangguh kurang.', kurator: 'Meja Editorial', item: ['pengulangan-berjarak', 'kenapa-bertangguh', 'menulis-untuk-berfikir', 'kuasa-pertumbuhan-berganda'] }
];

/* Sembilan taktik dalam "Trust Me, I'm Lying" (Ryan Holiday) dan benteng yang dibina dalam Ruang Ilmu.
   Dipaparkan di halaman Tentang dan digunakan oleh semakan Studio. */
const TAKTIK = [
  { n: 1, taktik: 'Penulis kurang dibayar, jadi bantu bayar bil mereka', bahaya: 'Kandungan siap dari pihak berkepentingan diterbitkan sebagai berita.', benteng: 'Rakan komersial tidak boleh menulis, menyemak atau mengubah isi. Setiap padanan Sip \'n Go dilabel dengan pendedahan kepentingan.' },
  { n: 2, taktik: 'Beritahu apa yang mereka mahu dengar', bahaya: 'Cerita dipilih kerana sesuai dengan naratif, bukan kerana benar.', benteng: 'Setiap dakwaan utama dilabel fakta, tafsiran, dibahas atau pendapat, dan dipautkan kepada sumbernya.' },
  { n: 3, taktik: 'Beri apa yang tersebar, bukan apa yang baik', bahaya: 'Kemarahan dan kebimbangan dipilih kerana mudah dikongsi.', benteng: 'Tiada senarai "paling popular". Cadangan berdasarkan minat dan laluan, bukan tontonan. Kami memilih rasa ingin tahu dan kagum, bukan kemarahan.' },
  { n: 4, taktik: 'Bantu mereka memperdaya pembaca', bahaya: 'Tajuk berbentuk soalan yang tidak pernah dijawab.', benteng: 'Tajuk berbentuk soalan wajib dijawab dalam "Faham dalam 60 saat". Studio menyemak tajuk sebelum terbit.' },
  { n: 5, taktik: 'Jual sesuatu yang boleh dijual sekali lalu', bahaya: 'Setiap artikel bersaing untuk klik sekali, jadi sensasi menang.', benteng: 'Model langganan: Surat Ilmu mingguan dan keahlian. Ukuran kejayaan ialah pembaca kembali, bukan klik.' },
  { n: 6, taktik: 'Jadikan semuanya tentang tajuk', bahaya: 'Tajuk menjanjikan lebih daripada isi.', benteng: 'Semakan umpan klik: tiada huruf besar penuh, tiada "!!", tiada frasa seperti "anda tak akan percaya".' },
  { n: 7, taktik: 'Bunuh dengan kebaikan pageview', bahaya: 'Penerbit dibayar mengikut tontonan, jadi tontonan menjadi matlamat.', benteng: 'Studio tidak memaparkan pageview sebagai ukuran utama. Yang diukur: kadar lengkap, kuiz tepat, disimpan dan pembaca kembali.' },
  { n: 8, taktik: 'Gunakan teknologi melawan dirinya', bahaya: 'Komen palsu, suntingan dan isyarat trending dimanipulasi.', benteng: 'Tiada komen terbuka atau carta trending. Maklum balas pembaca masuk ke Studio sebagai laporan yang disemak manusia.' },
  { n: 9, taktik: 'Reka sahaja (semua orang buat)', bahaya: 'Dakwaan tanpa sumber disebarkan, kemudian dipetik semula.', benteng: 'Dakwaan fakta dan pengiraan tanpa sumber disekat oleh semakan integriti data. Sumber dibezakan antara primer, ulasan dan rasmi.' }
];
const BENTENG_LAIN = [
  { n: 'Ekonomi pautan', benteng: 'Sumber dirujuk terus kepada asalnya, dengan jenis sumber dinyatakan. Kad fakta dikongsi bersama sumbernya.' },
  { n: 'Kewartawanan berulang', benteng: 'Bahan diterbitkan hanya selepas langkah Semakan dalam aliran kerja editorial. Setiap perubahan direkod dalam sejarah versi.' },
  { n: 'Mitos pembetulan', benteng: 'Pembetulan dipaparkan di atas artikel, dan pembaca yang pernah membuka bahan itu dimaklumkan di halaman utama.' }
];

const EBUKU = [
  { slug: 'eb-berfikir-jelas', tajuk: 'Buku Kecil Berfikir Jelas', ringkas: 'Nota tersusun 12 bias kognitif dengan contoh harian dan latihan.', halaman: 48, harga: 'RM19', plus: true },
  { slug: 'eb-kopi', tajuk: 'Panduan Rehat Kopi 15 Minit', ringkas: 'Panduan bergambar untuk membina ritual membaca bersama kopi.', halaman: 24, harga: 'Percuma untuk pelanggan surat', plus: false },
  { slug: 'eb-turath', tajuk: 'Pengenalan Kitab Turath untuk Pembaca Baharu', ringkas: 'Kenali 10 kitab klasik dan cara mula membacanya dengan berpandu.', halaman: 64, harga: 'RM25', plus: true }
];

/* Sip 'n Go Coffee & Bakery. Menu, harga dan bahan diambil daripada laman rasmi Sip 'n Go.
   Gambar botol dan foto: media/sng/. */
const SNG = {
  nama: "Sip 'n Go Coffee & Bakery",
  slogan: 'Dah ngopi ke belum hari ni?',
  moto: '1 kopi sehari, 1 ilmu baru.',
  ringkas: 'Kopi, matcha dan coklat buatan tangan dalam botol. Dibancuh segar, digoncang sebelum diminum, dan dibawa ke mana saja. Setiap botol datang bersama satu kad ilmu.',
  lokasi: 'Taman Arked, Dengkil, Selangor',
  peta: 'https://www.google.com/maps/search/?api=1&query=Taman+Arked+Dengkil+Selangor',
  instagram: 'https://www.instagram.com/sipngocoffeebakery/',
  ig: '@sipngocoffeebakery',
  hashtag: '#SipnGo',
  /* Nombor WhatsApp penerima order, format antarabangsa tanpa + (contoh 60123456789).
     Kosong: WhatsApp akan meminta pengguna memilih penerima. */
  whatsapp: '',
  nilai: [
    { h: 'Rasa yang jujur', p: 'Biji kopi dari Ethiopia, Colombia dan Brazil, susu segar, coklat premium Scrippo dan matcha Shizuko.' },
    { h: 'Satu botol, satu ilmu', p: 'Setiap botol disertakan satu kad ilmu. Order 3 kopi, dapat 3 ilmu yang berbeza.' },
    { h: 'Bawa ke mana saja', p: 'Macam Touch \'n Go yang dibawa ke mana-mana, cuma yang ini bawa kopi, bukan kad.' }
  ],
  biji: [
    { negara: 'Ethiopia', untuk: 'Classic Latte, Caramel Latte dan Rich Mocha.' },
    { negara: 'Colombia', untuk: 'Classic Latte dan Caramel Latte.' },
    { negara: 'Brazil', untuk: 'Classic Latte, Caramel Latte dan Rich Mocha.' }
  ],
  ulasan: [
    { q: 'As a matcha lover, saya approved! … after dah campur ais, ya Allah sedap betul! Creamy dan tak manis tu paking love.', siapa: 'Pelanggan · Matcha Latte' },
    { q: 'Balance well. Manis pun blend sekali, cam tak too manis, too pahit or too grassy. Just nice.', siapa: 'Pelanggan · Matcha Latte' },
    { q: 'Saya bukan peminat latte, tapi saya suka dengan caramel latte yang awak bagi. Rasa manis berlemak plus ada hint of burnt sugar.', siapa: 'Pelanggan · Caramel Latte' }
  ]
};

/* Kad Ilmu yang disertakan dengan setiap botol. */
const KAD_ILMU = {
  set: 'Set #1 · Rezeki Itu Milik Siapa',
  kad: [
    { kod: 'HR-001', huruf: 'A', teks: 'Ingat tau, bos tempat kita kerja tu cuma bayar gaji, tapi yang betul-betul bagi rezeki tu Allah.', dalil: 'Yā Razzāq — Wahai Yang Maha Pemberi Rezeki. (sebut ketika mula kerja)' },
    { kod: 'HR-002', huruf: 'B', teks: 'Percaya tak, sebenarnya pagi ni kau dah ada seluruh dunia dalam tangan kau.', dalil: '“Sesiapa bangun pagi dalam keadaan aman, sihat, dan ada makanan hari itu — seolah dunia seluruhnya miliknya.” (HR Tirmizi, 2346)' },
    { kod: 'HR-003', huruf: 'C', teks: 'Kadang-kadang rezeki tu datang berderap dari pintu yang kau tak expect langsung.', dalil: '“Dan sesiapa berserah diri kepada Allah, maka Allah cukuplah baginya.” — at-Talaq: 3' },
    { kod: 'HR-004', huruf: 'D', teks: 'Ada banyak benda dalam hidup ni yang kita tak perasan pun, rupa-rupanya benda tu lah rezeki paling besar.', dalil: '“Dan sesiapa yang bersyukur, faedahnya itu terpulang kepada dirinya sendiri.” — Luqman: 12' }
  ]
};

/* Menu. kategori: kopi | matcha | coklat. profil: ringan | manis | pekat. pasangan: bacaan Ruang Ilmu yang dipadankan. */
const PRODUK = [
  { id: 'classic', nama: 'Classic Latte', kategori: 'kopi', harga: 9, nota: 'Smooth, creamy, lightly fruity and not overly sweet.', bahan: ['Biji Ethiopia, Colombia & Brazil', 'Susu segar'], profil: 'ringan', warna: '#E2B67D', kafein: true, pasangan: 'sejarah-kopi', sebab: 'Biji dari tiga negara, untuk kisah kopi dari Yaman ke dunia.' },
  { id: 'caramel', nama: 'Caramel Latte', kategori: 'kopi', harga: 11, nota: 'Creamy, rich caramel, perfectly balanced.', bahan: ['Biji Ethiopia, Colombia & Brazil', 'Susu segar'], profil: 'manis', warna: '#D49A55', kafein: true, pasangan: 'menulis-untuk-berfikir', sebab: 'Manis berlemak, teman untuk sesi menulis satu perenggan.' },
  { id: 'mocha', nama: 'Rich Mocha', kategori: 'kopi', harga: 11, nota: 'Rich cocoa, balanced espresso & creamy finish.', bahan: ['Biji Ethiopia + Brazil', 'Coklat premium Scrippo', 'Susu segar'], profil: 'pekat', warna: '#9A6450', kafein: true, pasangan: 'sains-espresso', sebab: 'Espresso yang seimbang, untuk faham sains di sebalik secawan espresso.' },
  { id: 'matcha', nama: 'Matcha Latte', kategori: 'matcha', harga: 11, nota: 'Smooth, creamy, and naturally umami.', bahan: ['Matcha Shizuko', 'Susu segar'], profil: 'ringan', warna: '#A9C96A', kafein: true, pasangan: 'pengulangan-berjarak', sebab: 'Tenang dan fokus, untuk sesi ulang kaji yang dijarakkan.' },
  { id: 'straw', nama: 'Strawberry Matcha', kategori: 'matcha', harga: 12, nota: 'Smooth, creamy, and naturally umami, with chunky strawberry syrup.', bahan: ['Matcha Shizuko', 'Sirap strawberi berketul', 'Susu segar'], profil: 'manis', warna: '#C9D98E', kafein: true, pasangan: 'langit-biru', sebab: 'Hijau dan merah dalam satu botol, untuk soalan tentang warna langit.' },
  { id: 'choc', nama: 'Artisanal Chocolate', kategori: 'coklat', harga: 9, nota: 'Rich chocolate with a creamy texture and bold, authentic flavor.', bahan: ['Coklat premium Scrippo', 'Susu segar'], profil: 'pekat', warna: '#8A5442', kafein: false, pasangan: 'kafein-dan-tidur', sebab: 'Tanpa kopi. Pilihan untuk bacaan waktu malam.' }
];
