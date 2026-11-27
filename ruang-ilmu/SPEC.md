# Ruang Ilmu · Spec: Siri (ilmu pemilik)

## Matlamat
- Masukkan ilmu yang telah dihasilkan pemilik ke Ruang Ilmu sebagai **Siri episod** yang boleh dibaca, didengar dan diikuti kemajuannya.
- Kelompok pertama:
  1. **Tadabbur Surah al-Mukminun**: skrip soal-jawab subuh (Google Drive, fail `SMU …` bersegmen "Tadabbur Surah Mukminun", Sep–Nov 2026, dijangka 12–14 episod).
  2. **Akhlak dan Adab**: skrip soal-jawab dhuha (folder Drive `DUHA`, fail `AB …`, Ogos 2026, dijangka 4–5 episod).
  3. **Kenali Munafik**: senarai semak muhasabah daripada analisis pemilik atas kitab *Ẓāhirat al-Nifāq* (al-Maydani), dokumen Drive "Analisis Kitab — ظاهرة النفاق…" (keputusan pemilik; artifak "Checklist Kenali Munafik" ialah senarai semak produksi karusel, bukan kandungan). Hanya Qism 1–2 (takrif, sifat, nas) digunakan; bahagian sejarah dan pertubuhan (Qism 3–4) tidak dimasukkan kerana ia dakwaan pengarang yang dipertikaikan.
  4. **Kenali Kebenaran**: daripada artifak "Kenali Kebenaran — 5 Berhala Kaum Nuh a.s.".
  5. **Kuliah Pemikiran**: artifak "Kuliah 1 — Mata Hati Tersasar", "Kuliah 2 — Buaian Pemikiran", "Kuliah 3 — Lima Kunci Fikiran" (dengan "Peta Sebab Kesilapan Berfikir" sebagai bahan iringan).
  6. **Sip n Speak**: siri kosong berlabel "Akan datang".
- Setiap ayat dan hadis dipaparkan dengan teks Arab, maksud dan rujukan, dan disemak oleh sistem integriti sedia ada.

## Bukan matlamat
- Tidak memuat skrip SMU/Dhuha selain kelompok di atas (kelompok kedua selepas format disahkan).
- Episod bertarikh hadapan (skrip yang disediakan awal) **dipaparkan hanya apabila tarikhnya tiba** (keputusan pemilik), mengikut jam peranti pembaca.
- Tidak menambah takhrij atau huraian baharu ke atas skrip. Teks dikekalkan hampir verbatim; pembetulan hanya untuk format dan ejaan yang jelas silap.
- Tiada backend; kemajuan kekal dalam peranti seperti ciri sedia ada.

## Peraturan kandungan (keputusan pemilik)
- Skrip dipaparkan **hampir verbatim** secara awam.
- **Dibuang**: nama program (Assalamualaikum Subuh / Dhuha), nama panel, segmen kempen dan derma (MUSIL, Akademi Al-Bayan, QR, akaun), lajur "Insert video / photo" dan "Durasi", serta semua pautan Drive.
- **Dikekalkan**: nama segmen (menjadi nama siri), tarikh, tajuk episod, soalan, jawapan, ayat dan hadis bersama rujukan yang tertulis.
- Hadis tanpa rujukan dalam skrip asal dilabel **"Rujukan belum dinyatakan"** dan disenaraikan dalam Studio sebagai isu untuk disemak. Tiada rujukan direka.

## Skrin dan aliran
1. **Siri** (`#siri`, pautan baharu "Siri" dalam navigasi atas dan tab Teroka): kad setiap siri dengan jenis, bilangan episod, ringkasan dan bar kemajuan. Sip n Speak sebagai kad bergaris putus "Akan datang".
2. **Halaman siri** (`#s.<slug>`): tajuk, ringkasan, kemajuan, butang "Mula / Sambung episod N", senarai episod (nombor, tajuk, bilangan soalan, status).
3. **Episod soal-jawab** (`#e.<slug>`): pengepala (siri, episod N daripada M, julat ayat, tarikh), bar tindakan (Dengar, Simpan, Kongsi), kemudian soalan demi soalan. Arah paparan ditentukan pemilik daripada mock-up:
   - **A. Bacaan berterusan**: semua soalan dan jawapan terbuka.
   - **B. Akordion**: soalan sahaja, jawapan dibuka apabila ditekan ("cuba jawab sendiri dahulu").
   Kemudian: Kad integriti, "Tanda episod selesai", navigasi episod sebelum/seterusnya.
4. **Senarai semak** (Kenali Munafik): item semak untuk muhasabah diri; tanda disimpan dalam peranti sahaja dan tidak pernah dihantar.
5. **Karusel** (Kenali Kebenaran): slaid boleh leret, dengan nombor slaid, rujukan dan teks alternatif.
6. **Kuliah**: tiga kuliah daripada "Peta Sebab Kesilapan Berfikir" (sebelas sebab, al-Maydani, *Basa'ir li al-Muslim al-Mu'asir* Fasal 4, hlm. 105–151). Kerana mengandungi matan Arab dan dalil, kuliah menggunakan susun atur episod (bacaan berterusan) dengan label "Kuliah N daripada 3", "Sebab N" dan "Amalan". Nota cara menyampaikan untuk penceramah tidak dipaparkan. Kuliah tiada tarikh.
- Episod juga muncul dalam Teroka/carian (bidang Agama & Kerohanian), halaman utama (seksyen "Siri terkini"), peta ilmu, Simpanan dan pemain audio.

## Model data dan storan
Fail baharu `ruang-ilmu/siri.js` (dimuat selepas `data.js`):
```
SIRI = [{ slug, nama, jenis: 'soal-jawab'|'senarai-semak'|'karusel'|'kuliah'|'akan-datang',
          ringkas, kategori, episod: [slug] }]
EPISOD = [{ slug, siri, no, tajuk, tarikh, julat,
            soalan: [{ s, blok: [ {j:'teks', t} | {j:'ayat', ar, maksud, ruj} | {j:'hadis', ar, maksud, ruj|null} ] }] }]
SEMAK = { [slug]: { kitab, pengenalan: [p], kumpulan: [{ tajuk, item: [{ t, hlm, dalil?: {j, ar, maksud, ruj} }] }], doa } }  // Kenali Munafik
KARUSEL = { [slug]: { tajuk, slaid: [{ label, tajuk, ar?, maksud?, ruj?, isi?, nama?, butir?, langkah?, alur?, nota?, petik? }] } }  // Kenali Kebenaran
```
- Fungsi penyesuai `episodKeBahan(e)` menukar setiap episod kepada bentuk bahan sedia ada, supaya simpan, selesai, dengar, carian, peta ilmu dan Kad integriti berfungsi tanpa kod pendua. `rujukan` dijana daripada `ruj` ayat/hadis (jenis `primer`), dan `dakwaan` dijana sebagai satu dakwaan `fakta` bagi setiap ayat/hadis yang dirujuk.
- Kemajuan siri = episod selesai ÷ jumlah episod (guna `S.selesai` sedia ada).
- Tanda senarai semak disimpan dalam `S.semak[slug][kunci] = tarikh` (localStorage) dan ditapis bentuknya semasa dimuat. Semua item ditanda = siri selesai; "Kosongkan tanda" untuk muhasabah semula.
- Episod disaring `tarikh <= hari ini` sebelum didaftar ke siri, carian, utama dan Studio.

## Teks UI penting
- Navigasi: "Siri". Tajuk halaman: "Siri". Lede: "Himpunan soal-jawab, kuliah dan karusel. Ikut satu siri dari mula hingga habis."
- Episod: "Episod N daripada M", "Soalan N", "Tanda episod selesai", "Rujukan belum dinyatakan".
- Sip n Speak: "Akan datang. Episod pertama sedang disediakan."
- Senarai semak: "Untuk muhasabah diri, bukan untuk menilai orang lain. Tanda kau disimpan dalam peranti ini sahaja."

## Kriteria penerimaan
1. `#siri` memaparkan 6 kad siri; Sip n Speak berlabel "Akan datang" dan tidak boleh dibuka sebagai siri kosong yang rosak.
2. Setiap episod Tadabbur al-Mukminun dan Akhlak & Adab dalam kelompok pertama boleh dibuka melalui `#e.<slug>`, memaparkan semua soalan, dan tiada teks nama program, nama panel, kempen, QR atau pautan Drive.
3. Setiap blok ayat memaparkan teks Arab (RTL), maksud dan rujukan surah:ayat.
4. Hadis tanpa rujukan dilabel "Rujukan belum dinyatakan" dan disenaraikan dalam Studio.
5. "Tanda episod selesai" mengemas kini bar kemajuan siri dan peta ilmu.
6. Carian "kebenaran" atau "malu" memulangkan episod yang berkaitan.
7. Pemain Dengar membaca soalan dan maksud (teks Arab dilangkau).
8. Senarai semak Kenali Munafik mengingati tanda selepas muat semula, dan tiada data dihantar keluar.
9. Karusel Kenali Kebenaran boleh dileret dan dikawal dengan papan kekunci.
10. Tiada ralat konsol dan tiada limpahan mendatar pada 400px dan 1366px, mod terang dan gelap.
11. Semakan integriti Studio lulus untuk semua bahan selain isu "Rujukan belum dinyatakan" yang disengajakan.
12. Episod bertarikh selepas hari ini tidak muncul dalam senarai siri, carian atau pautan terus, dan muncul pada tarikhnya.

---

# Tambahan: Kuliah 4 · WUI 1.0 (sumber luar)

## Matlamat
- Tambah rakaman "WUI 1.0: Kolonial Kapitalis, Neo Liberalisme" (sesi "Projek Israelisasi di Asia Tenggara", penceramah Prof. Farish, dimuat naik oleh saluran YouTube Abdul Razak) sebagai **Kuliah 4** dalam siri Kuliah Pemikiran.
- Dilabel jelas sebagai **sumber luar**, dengan kredit penceramah, saluran dan pautan asal.

## Bukan matlamat
- Bukan transkrip verbatim. Rakaman 2 jam 12 minit, transkrip mesin bermutu sederhana, dan kandungan milik pihak lain.
- Tiada video dibenam (tiada sambungan ke YouTube sehingga pembaca menekan pautan).
- Soal jawab penonton yang tidak jelas dalam rakaman, dan ramalan tentang individu sebenar (contoh: siapa "akan mati"), tidak dimasukkan.

## Kandungan
- Nota kuliah tersusun mengikut bahagian rakaman (minit), ditulis semula dengan ringkas dan **dinisbahkan kepada penceramah** ("Menurut penceramah…").
- Setiap bahagian ada pautan "Tonton bahagian ini" ke YouTube pada minit berkenaan.
- **Dakwaan penceramah yang belum disemak** (contoh: kaitan Nvidia–Israel, AOPIG, editorial Financial Times 1996 tentang Taliban, statistik penggunaan media sosial) disenaraikan dalam kotak berasingan dan dilabel jenis `dibahas`/`pendapat`, bukan `fakta`.
- Ulasan penutup moderator (Surah al-Kahfi; dakwaan tentang Snouck Hurgronje dan kerangka fardu ain) dilabel sebagai pandangan moderator.
- "Bacaan yang disyorkan penceramah": Varoufakis (*Technofeudalism*), Basil Davidson (*The Black Man's Burden*), Susan Strange (*Casino Capitalism*), *Hikayat Abdullah*, Bonhoeffer (teori kebodohan), Syed Hussein Alatas (kolonial kapitalisme), Jomo K. S., George Monbiot.

## Kriteria penerimaan
13. `#s.kuliah-pemikiran` memaparkan 4 kuliah; Kuliah 4 berlabel "Sumber luar" dengan nama penceramah, saluran dan pautan YouTube asal.
14. Setiap bahagian Kuliah 4 ada pautan minit ke YouTube (`rel="noopener"`, buka tab baharu); tiada iframe dan tiada permintaan ke YouTube semasa halaman dibuka.
15. Dakwaan dalam rakaman telah disemak pemilik (17 Nov 2026) dan dimasukkan ke dalam isi bahagian berkenaan, dinisbahkan kepada penceramah atau moderator. Kad integriti menyenaraikannya sebagai `tafsiran` bersumberkan rakaman; tiada yang berlabel `fakta` tanpa sumber bertulis. Semakan integriti Studio lulus.
16. Tiada teks soal jawab penonton yang kabur dan tiada ramalan tentang individu sebenar.

---

# Tambahan: Pemurnian laras bahasa (gaya *Dewan Sastera*, DBP)

## Matlamat
- Murnikan laras bahasa Ruang Ilmu mengikut gaya majalah *Dewan Sastera* (DBP, September 2023): bahasa baku, ayat lengkap dan tertib, penanda wacana yang jelas, ejaan dan istilah DBP.

## Keputusan pemilik
- Kata ganti **"kau" dikekalkan**.
- Istilah Inggeris UI (Coffee Break, Studio, XP, Explorer, Knowledge Plus) **dikekalkan**.
- Skop: teks UI, bahan Ruang Ilmu (`data.js`), nota siri, senarai semak, karusel, Kuliah 1–4, dan **skrip SMU/Dhuha dengan laras penuh** (menggantikan keputusan "hampir verbatim" untuk ayat; isi dan makna kekal).
- `alatas.js` (Kuliah 5) tidak disentuh.

## Peraturan
- Ejaan dan istilah DBP: *telah pun*, *al-Quran* di tengah ayat, *a.s.*, *r.a.*, *syubhat*, *mengapakah*.
- Kata pemeri: *ialah* sebelum frasa nama; *adalah* sebelum frasa adjektif atau sendi nama; tiada *adalah merupakan* atau *adalah dengan*.
- Kata sendi tepat (*daripada/dari*, *kepada/pada*, *dalam era*); *di mana* tidak dipakai sebagai kata hubung relatif.
- Kata pinjaman Inggeris dalam isi diganti padanan Melayu (*online* → *dalam talian*), kecuali nama, jenama dan istilah UI yang dikekalkan.
- Senarai tanpa koma sebelum *dan/atau* terakhir.
- **Tidak diubah:** matan Arab, terjemahan ayat dan hadis, rujukan, nama, nombor, tarikh, slug dan petikan kitab.

## Kriteria penerimaan
17. Ujian laras automatik: tiada pola terlarang (*telahpun*, *adalah merupakan*, *adalah dengan*, *karena*, *online*, *syubhah*, *Al-Quran* di tengah ayat, *AS* sebagai singkatan) dalam teks yang dipaparkan daripada `app.js`, `data.js` dan `siri.js`.
18. Matan Arab, terjemahan ayat/hadis dan rujukan sama seperti sebelum suntingan (ujian membandingkan cap jari setiap blok `ayat`/`hadis`/`petikan`).
19. Semua ujian sedia ada lulus; carian "benci kebenaran" dan "sifat malu" masih menemui episod.

---

# Tambahan: Mod fokus bacaan (palet kertas hangat, tema Sepia/Malam, rehat mata)

## Matlamat
- Kurangkan keletihan mata dan gangguan untuk sesi bacaan panjang (30 minit ke atas).
- Kejujuran: tiada warna yang menghalang rasa mengantuk. Yang dibina ialah kontras selesa, latar tidak silau, tipografi lapang, gangguan dikurangkan, dan peringatan rehat mata (peraturan 20-20-20).

## Keputusan pemilik
- Palet **Kertas hangat** menggantikan "Modern Clean & Academic" untuk tema terang; mod gelap menjadi **Gelap hangat**.
- Tema baharu dalam tetapan Aa dan Profil: **Sepia** dan **Malam** (gelap, kontras lebih rendah, tiada aksen biru).
- **Peringatan rehat mata setiap 20 minit** bacaan aktif, boleh dimatikan dalam Profil.
- Skop: seluruh app, dengan tipografi bacaan dan pengepala yang menyorok pada halaman artikel dan episod.

## Token warna
| Tema | Latar | Permukaan | Teks | Kelabu | Aksen | Sorotan |
|---|---|---|---|---|---|---|
| Terang (kertas hangat) | #FAF7F0 | #F2EDE2 | #2A2622 | #6B635A | #2F5D8A | #F3E3B5 |
| Sepia | #F4ECD8 | #EADFC6 | #3B2F22 | #6E5E4B | #7A4E2D | #E8D59E |
| Gelap (hangat) | #1C1B19 | #252320 | #E6E1D8 | #A49D92 | #8FB4D9 | #4A4128 |
| Malam | #14110E | #1D1915 | #CDBFA8 | #8E8270 | #D4A373 | #3D3222 |

Jalur gelap Sip 'n Go kekal sebagai identiti jenama.

## Tipografi dan susun atur bacaan
- Prosa dan huraian episod: jarak baris 1.78, lajur maksimum 36rem (sekitar 65 aksara).
- Pengepala atas menyorok apabila menatal ke bawah pada halaman artikel/episod, dan muncul semula apabila menatal ke atas.
- Animasi dihormati mengikut `prefers-reduced-motion`.

## Rehat mata
- Masa bacaan aktif dikira hanya apabila tab kelihatan, pengguna berada di halaman artikel, episod atau siri, dan ada aktiviti dalam 60 saat terakhir.
- Selepas 20 minit, jalur kecil (`role="status"`) muncul: "Rehatkan mata 20 saat. Pandang sesuatu sejauh 6 meter." dengan butang "Baik". Jalur tidak menghalang bacaan.
- Tetapan "Peringatan rehat mata" dalam Profil (lalai: hidup), disimpan dalam `S.tetapan.rehatMata`.

## Kriteria penerimaan
20. Kontras teks utama terhadap latar: sekurang-kurangnya 7:1 dalam keempat-empat tema; teks kelabu sekurang-kurangnya 4.5:1; teks utama tema terang tidak melebihi 16:1 (kurang silau berbanding hitam pada putih).
21. Tetapan Aa dan Profil menawarkan Sistem, Terang, Sepia, Gelap dan Malam; pilihan kekal selepas muat semula; `meta theme-color` mengikut tema.
22. Dengan `page.clock`, jalur rehat mata muncul selepas 20 minit bacaan aktif di halaman episod, hilang apabila "Baik" ditekan, dan tidak muncul jika tetapan dimatikan.
23. Pengepala menyorok semasa menatal ke bawah pada halaman episod dan muncul semula apabila menatal ke atas.
24. Tiada limpahan mendatar dan tiada ralat konsol dalam keempat-empat tema pada 400px dan 1366px.

---

# Tambahan: Sambung membaca dan reka bentuk baharu (gabungan)

## Matlamat
- Pembaca yang kembali ke app terus dibawa ke halaman terakhir yang dibaca, pada kedudukan tatal yang sama.
- Rupa baharu yang lebih "perpustakaan": halaman Utama ikut gaya halaman buku (rujukan video pemilik), komponen seluruh app ikut gaya Book Haven (rujukan Dribbble). Warna kekal seperti asal dalam kelima-lima tema.

## Bukan matlamat
- Tiada gambar, logo atau jenama daripada rujukan. Kulit buku dan lencana dilukis dengan CSS.
- Tiada testimoni atau ulasan pembaca rekaan (bahagian "What Readers Are Saying" dalam video tidak dibina).
- Halaman bacaan (artikel, episod) kekal dalam mod fokus: tipografi bacaan, Newsreader dan pengepala menyorok tidak berubah.
- Tiada perubahan pada kandungan, palet atau token warna.

## Keputusan pemilik
- Arah reka bentuk: **gabungan**. Utama ikut arah B (halaman buku), komponen ikut arah A (Book Haven).
- Lalai yang dinyatakan dan tidak dibantah: buka terus ke halaman terakhir, dengan nota kecil; kad "Sambung membaca" di Utama; fon serif klasik untuk tajuk, menu dan butang.

## Sambung membaca
- `S.terakhir = { hash, peratus, masa }` disimpan setiap kali pembaca menatal (bertangguh 400 ms) di halaman artikel (`#a.`), episod (`#e.`) dan siri (`#s.`). `peratus` ialah kedudukan tatal berbanding ketinggian dokumen.
- Semasa app dibuka (muat pertama sahaja), jika hash kosong atau `#utama`, tetapan "Sambung dari tempat terakhir" hidup, `S.terakhir` wujud, bahannya masih ada, berumur kurang daripada 14 hari dan `peratus` di bawah 95: app pergi ke `S.terakhir.hash` dan tatal ke kedudukan itu.
- Pautan terus (contohnya `#baca` atau `#a.slug`) dihormati; tiada lencongan.
- Lencongan berlaku sekali sahaja bagi setiap sesi (`sessionStorage`). Menekan Utama selepas itu kekal di Utama.
- Selepas lencongan, jalur kecil `role="status"`: "Disambung dari tempat terakhir." dengan pautan "Ke Utama" dan butang tutup. Jalur hilang sendiri selepas 8 saat.
- Utama memaparkan kad "Sambung membaca" di atas sekali (jika `S.terakhir` sah): tajuk bahan, nama siri jika episod, bar kemajuan dan butang "Sambung". Butang membawa ke halaman dan kedudukan yang sama.
- Tetapan Profil "Sambung dari tempat terakhir" (lalai: hidup), disimpan dalam `S.tetapan.sambungAuto`. Kad Utama kekal walaupun tetapan dimatikan.
- Data kekal dalam peranti (localStorage), sama seperti kemajuan bacaan sedia ada.

## Komponen seluruh app (gaya A)
- Fon serif klasik **EB Garamond** (Google Fonts) untuk logo, menu atas, tajuk halaman dan seksyen, butang dan pil. Label kecil, borang dan meta kekal Public Sans. Prosa bacaan kekal Newsreader.
- Menu atas: serif, halaman aktif berwarna aksen dengan garis bawah 2px.
- Butang utama: serif, sudut 8px, bayang lembut. Butang garis kekal.
- Pil kategori: bulat penuh, latar permukaan, aktif berwarna aksen.
- Tajuk seksyen utama: tengah, huruf besar, garis bawah aksen.
- Kad siri bergaya kulit buku: bahagian atas berwarna (aksen atau dakwat, ikut tema) dengan nama siri, bahagian bawah dengan ringkasan, bar kemajuan dan bilangan selesai.

## Halaman Utama (gaya B)
Susunan dari atas:
1. Kad "Sambung membaca" (jika ada).
2. Hero: kulit buku siri pilihan (siri terbaru yang ada episod) dengan lencana bulat bilangan episod, tajuk "Hidup akhir zaman keras, *hadapi zaman fitnah dengan Ilmu & Iman*", lede dan borang langganan. Kulit buku ialah pautan ke siri itu.
3. Petikan: وَقُل رَّبِّ زِدْنِي عِلْمًا, "Dan berdoalah dengan berkata: 'Wahai Tuhanku, tambahilah ilmuku.'" (Surah Taha, ayat 114; terjemahan mengikut gaya Tafsir Pimpinan ar-Rahman yang digunakan dalam siri).
4. Tiga bulatan statistik dikira daripada data: bilangan bahan, siri dan episod/kuliah yang sudah terbit.
5. Tiga tonggak "Ilmu. Iman. Amal.": Ilmu yang disemak, Iman yang tenang, Amal yang konsisten.
6. Panel gelap "Satu ilmu untuk hari ini" (kandungan sama seperti kad sedia ada, dengan butang Baca/Dengar/Lihat).
7. Siri pilihan: tajuk tengah bergaris, pil penapis (Semua dan setiap jenis siri), kad siri kulit buku.
8. Jalur berwarna aksen "Mula dengan satu siri" dengan pil pautan ke setiap siri.
9. Seksyen sedia ada dikekalkan dengan gaya komponen baharu: Pembetulan, cadangan, bidang ilmu, Siri terkini, Laluan, Audio, jalur Kopi, Baru diterbitkan, Keahlian. Senarai "Teruskan penerokaan" kekal.

## Teks UI penting
- "Sambung membaca", "Sambung", "Disambung dari tempat terakhir.", "Ke Utama"
- Profil: "Sambung dari tempat terakhir" / "Bila app dibuka semula, terus ke halaman terakhir yang kau baca."
- "Ilmu. Iman. Amal.", "Ilmu yang disemak", "Iman yang tenang", "Amal yang konsisten", "Siri pilihan", "Mula dengan satu siri"

## Kriteria penerimaan
25. Buka episod, tatal ke kira-kira 50%, muat semula pada `#utama` dalam tab baharu: app berada di episod itu dengan kedudukan tatal dalam lingkungan 10% daripada asal, dan jalur "Disambung dari tempat terakhir." kelihatan.
26. Pautan terus `#baca` tidak dilencongkan. Dalam sesi yang sama, menekan Utama kekal di Utama.
27. Tiada lencongan apabila tetapan dimatikan, apabila `S.terakhir` berumur lebih 14 hari (diuji dengan `page.clock`), atau apabila `peratus` 95 ke atas.
28. Kad "Sambung membaca" di Utama membawa ke halaman dan kedudukan yang betul.
29. Nombor statistik di Utama sama dengan kiraan daripada data; pil penapis siri menapis kad dengan betul.
30. Menu atas, tajuk, butang dan pil menggunakan EB Garamond; prosa artikel kekal Newsreader.
31. Teks pada butang, pil aktif, panel gelap dan jalur aksen mencapai kontras sekurang-kurangnya 4.5:1 dalam kelima-lima tema.
32. Tiada limpahan mendatar dan tiada ralat konsol pada 400px dan 1366px dalam semua tema.
