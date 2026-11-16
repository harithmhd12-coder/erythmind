# Ruang Ilmu · Plan: Siri (ilmu pemilik)

Rujuk `SPEC.md`. Ujian dalam `tests/ruang-ilmu-smoke.cjs` (baharu), dihidang dengan `python3 -m http.server 8000 --bind 127.0.0.1`.

1. [x] **Model dan rangka Siri.** Cipta `siri.js` (SIRI, EPISOD kosong, Sip n Speak), muatkan dalam `index.html`, tambah laluan `#siri`, `#s.<slug>`, pautan nav "Siri", penyesuai `episodKeBahan`.
   Fail: `siri.js`, `index.html`, `app.js`, `styles.css`. Ujian: `#siri` papar kad, Sip n Speak "Akan datang", tiada ralat konsol.
2. [x] **Paparan episod soal-jawab** (arah A, dipilih pemilik): blok teks, ayat (Arab RTL + fon Amiri), hadis, label "Rujukan belum dinyatakan", navigasi episod, tanda selesai.
   Fail: `app.js`, `styles.css`, `index.html` (fon). Ujian: episod contoh papar soalan dan ayat; tanda selesai mengemas kini kemajuan siri.
3. [x] **Import Tadabbur Surah al-Mukminun.** (15 episod, 2 Sep–26 Nov 2026; "Beradab dalam Tindakan" 7/10 bukan segmen ini, tidak dimasukkan) Baca setiap fail SMU bersegmen Tadabbur Surah Mukminun dari Drive, buang nama program, panel, kempen dan pautan, tukar ke EPISOD.
   Fail: `siri.js`. Ujian: setiap episod dibuka tanpa ralat; carian teks terlarang (nama program, panel, MUSIL, Al-Bayan, drive.google) pulang kosong.
4. [x] **Import Akhlak dan Adab** (4 episod, Ogos 2026; 11 hadis tanpa rujukan dilabel) (fail AB dalam folder DUHA) dengan peraturan yang sama.
   Fail: `siri.js`. Ujian: sama seperti tugasan 3.
5. [x] **Integrasi**: carian, Teroka (Agama), halaman utama "Siri terkini", peta ilmu, Simpanan, pemain Dengar (langkau Arab), Kad integriti dan semakan Studio (hadis tanpa rujukan disenaraikan).
   Fail: `app.js`. Ujian: carian "kebenaran" dan "malu"; teks pemain tiada aksara Arab; Studio menyenaraikan isu rujukan.
6. [x] **Kenali Munafik** sebagai senarai semak muhasabah (17 soalan dalam 4 kumpulan, daripada analisis al-Maydani Qism 1–2, dalil ayat/hadis sahih dengan rujukan dan halaman PDF), serta **sekatan tarikh episod** (episod 18–26 Nov muncul pada tarikhnya).
   Fail: `siri.js`, `app.js`, `styles.css`. Ujian: tanda kekal selepas muat semula; tiada permintaan rangkaian; data rosak ditapis; `page.clock` 16 Nov → 12 episod, 18 Nov → episod Rabbi Arji'un muncul.
7. [x] **Kenali Kebenaran** sebagai karusel 12 slaid (daripada reka bentuk 5 Berhala Kaum Nuh; slaid 11 tanpa nama akaun dan kapsyen pengunggah, nama penyedia tidak dipaparkan).
   Fail: `siri.js`, `app.js`, `styles.css`. Ujian: butang, titik, kekunci anak panah dan leret mendatar menukar slaid; kedudukan kekal selepas tanda selesai.
8. [x] **Kuliah Pemikiran**: 3 kuliah (11 sebab + amalan) daripada Peta Sebab Kesilapan Berfikir, dalam susun atur episod berlabel Kuliah/Sebab; 1 hadis (fitrah) dilabel "Rujukan belum dinyatakan" seperti nota pemilik.
   Fail: `siri.js`, `app.js`. Ujian: tiga kuliah dibuka, 11 sebab, matan RTL berujukan, tiada nota penceramah; semakan integriti lulus.
9. [x] **Release prep, Security review, Final review.** README, versi cache `sw.js`, semua ujian, 400px/1366px, mod gelap, `/security-review`, `/code-review`, kriteria penerimaan satu demi satu, PR.

## Susulan selepas kelompok pertama
- Dideploy melalui PR #16 (16 Nov 2026). Semua fail app di GitHub Pages sepadan dengan `main`; ujian asap lulus terhadap laman sebenar.
- Sekatan tarikh dikira semasa app dimuat: app yang terbuka melepasi tengah malam perlu dibuka semula untuk episod hari baharu.
- Kemas: kotak "selesai" berulang dalam tiga templat (paparanEpisod, paparanSemak, paparanKarusel).
- Nombor WhatsApp Sip 'n Go (`SNG.whatsapp`) masih kosong.
- Kelompok kedua: skrip SMU dan Dhuha selebihnya.
- Bahan Sip n Speak daripada pemilik.
- Semakan takhrij 12 hadis yang berlabel "Rujukan belum dinyatakan" (11 Akhlak dan Adab, 1 hadis fitrah Kuliah 1).

## Tambahan: Kuliah 4 · WUI 1.0 (menunggu "ya" pemilik)
10. [ ] **Data Kuliah 4**: nota bahagian demi bahagian daripada transkrip, kredit dan pautan minit, dakwaan untuk disemak, bacaan yang disyorkan. Fail: `siri.js`. Ujian: 4 kuliah, kredit dan pautan YouTube wujud, tiada iframe, Studio lulus.
11. [ ] **Paparan sumber luar**: kotak kredit, pautan "Tonton bahagian ini", kotak dakwaan belum disemak. Fail: `app.js`, `styles.css`. Ujian: tiada permintaan rangkaian ke YouTube semasa dibuka; 400px/1366px, gelap.
12. [ ] **Release prep, Security review, Final review, PR** (cache `ruang-ilmu-7`).
