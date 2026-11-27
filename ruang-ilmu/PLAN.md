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

## Tambahan: Kuliah 4 · WUI 1.0 (diluluskan pemilik)
10. [x] **Data Kuliah 4**: nota bahagian demi bahagian daripada transkrip, kredit dan pautan minit, dakwaan untuk disemak, bacaan yang disyorkan. Fail: `siri.js`. Ujian: 4 kuliah, kredit dan pautan YouTube wujud, tiada iframe, Studio lulus.
11. [x] **Paparan sumber luar**: kotak kredit, pautan "Tonton bahagian ini", kotak dakwaan belum disemak. Fail: `app.js`, `styles.css`. Ujian: tiada permintaan rangkaian ke YouTube semasa dibuka; 400px/1366px, gelap.
12. [x] **Release prep, Security review, Final review, PR** (cache `ruang-ilmu-7`).
   Nota: tugasan 10 dan 11 tergabung dalam satu commit (a1ec429) kerana ujian data bergantung pada paparan.

### Susulan Kuliah 4
- Dideploy melalui PR #17 (17 Nov 2026). Semua fail app di GitHub Pages sepadan dengan `main`; ujian asap lulus terhadap laman sebenar.
- Sahkan pautan minit sepadan dengan video YouTube (diandaikan sama panjang dengan fail Drive).
- Sahkan nama penuh penceramah ("Prof. Farish" seperti disebut dalam rakaman).
- [x] 11 dakwaan dalam rakaman disemak pemilik (17 Nov 2026) dan dimasukkan ke dalam isi; kotak "belum disemak" dibuang (jalan pintas: perubahan kecil diminta terus). Dilabel `tafsiran`; untuk label `fakta`, sumber bertulis setiap dakwaan diperlukan.
- Ujian belum meliputi laluan kotak "belum disemak" (episod sumber luar tanpa `disemak`); tambah ujian apabila sumber luar baharu dimasukkan.
- Dakwaan Kuliah 4 yang disemak dideploy melalui PR #18 (20 Nov 2026), bersama gabungan Kuliah 5 Alatas daripada `main`; cache `ruang-ilmu-9`. Semua fail app di GitHub Pages sepadan dengan `main`; ujian asap lulus terhadap laman sebenar.

## Tambahan: Pemurnian laras bahasa (diluluskan pemilik, dideploy)
13. [x] **Panduan dan ujian laras**: `ruang-ilmu/GAYA.md` (peraturan), ujian pola terlarang, dan cap jari matan/terjemahan/rujukan sebelum suntingan. Fail: `GAYA.md`, `tests/ruang-ilmu-smoke.cjs`, `tests/ruang-ilmu-cap-jari.json`, `tests/ruang-ilmu-laras.cjs`. Ujian: gagal pada teks sekarang untuk pola terlarang; cap jari lulus.
14. [x] **Teks UI**: navigasi, butang, mesej, halaman Utama, Baca, Lihat, Dengar, Teroka, Siri, Kopi, Keahlian, Profil, Tentang, Studio. Fail: `app.js`, `index.html`, `manifest.webmanifest`. Ujian: semua ujian lulus; tangkapan skrin 400px.
15. [x] **Bahan Ruang Ilmu**: 15 bahan, laluan, taktik dan benteng, e-buku, teks Sip 'n Go (ulasan pelanggan dan teks Kad Ilmu kekal verbatim kerana petikan sebenar jenama). Fail: `data.js`. Ujian: laras dan semakan integriti Studio lulus.
16. [x] **Tadabbur Surah al-Mukminun** (15 episod, laras penuh). Fail: `siri.js`. Ujian: laras dan cap jari lulus.
17. [x] **Akhlak dan Adab, Kuliah 1–4, Kenali Munafik, Kenali Kebenaran**. Fail: `siri.js`. Ujian: laras dan cap jari lulus.
18. [x] **Release prep, Security review, Final review, PR** (cache `ruang-ilmu-10`).

### Susulan laras bahasa
- Dideploy melalui PR #19 (20 Nov 2026). Semua fail app di GitHub Pages sepadan dengan `main`; ujian asap dan ujian laras lulus terhadap laman sebenar.
- Bahan baharu mesti mengikut `GAYA.md`; ujian laras akan gagal jika pola tidak baku muncul semula.
- Jika matan, terjemahan atau rujukan sengaja diubah, jana semula cap jari: `node tests/ruang-ilmu-laras.cjs --cap-jari`.

## Tambahan: Mod fokus bacaan (diluluskan pemilik, dideploy)
19. [x] **Palet dan tema**: token Kertas hangat, Gelap hangat, Sepia, Malam; pilihan tema dalam Aa dan Profil; `meta theme-color`. Fail: `styles.css`, `app.js`, `index.html`. Ujian: kontras setiap tema, pilihan kekal selepas muat semula.
20. [x] **Tipografi bacaan dan pengepala menyorok**. Fail: `styles.css`, `app.js`. Ujian: pengepala menyorok/muncul, tiada limpahan 400px/1366px.
21. [x] **Rehat mata 20 minit**: pengiraan masa aktif, jalur status, tetapan Profil. Fail: `app.js`, `styles.css`. Ujian: `page.clock` 20 minit, butang Baik, tetapan mati.
22. [x] **Release prep, Security review, Final review, PR** (cache `ruang-ilmu-12`).

### Susulan mod fokus bacaan
- Dideploy melalui PR #20 (23 Nov 2026), cache `ruang-ilmu-12`. Semua fail app di GitHub Pages sepadan dengan `main`; ujian asap lulus terhadap laman sebenar.
- Kosmetik: dalam grid tema (Aa), sel kosong selepas "Malam" berwarna garis; boleh diisi atau disusun 5 lajur di skrin lebar.

- Tajuk utama "Hidup akhir zaman keras, hadapi zaman fitnah dengan Ilmu & Iman" dideploy melalui PR #21 (cache `ruang-ilmu-13`); disahkan di laman sebenar.

## Tambahan: Sambung membaca dan reka bentuk gabungan (menunggu "ya" pemilik)
23. [x] **Sambung membaca**: `S.terakhir`, simpanan semasa tatal, lencongan sekali sesi semasa app dibuka, jalur "Disambung dari tempat terakhir", kad Utama, tetapan Profil. Fail: `app.js`, `styles.css`. Ujian: kriteria 25–28 (muat semula dalam konteks baharu, pautan terus, tetapan mati, `page.clock` 14 hari, 95%).
24. [ ] **Komponen gaya A**: EB Garamond dalam `index.html`, token fon klasik, menu serif bergaris bawah, butang, pil, tajuk seksyen tengah, kad siri kulit buku. Fail: `index.html`, `styles.css`, `app.js` (`kadSiri`). Ujian: kriteria 30–32 pada halaman Siri, Teroka dan Utama.
25. [ ] **Utama gaya B**: hero kulit buku dan lencana, petikan Taha 114, statistik, tiga tonggak, panel ilmu hari ini, siri pilihan dengan pil penapis, jalur "Mula dengan satu siri". Fail: `app.js`, `styles.css`. Ujian: kriteria 29, 31, 32; tangkapan skrin 400px dan 1366px dalam lima tema.
26. [ ] **Release prep, Security review, Final review, PR** (cache melebihi versi di `main`, kini `ruang-ilmu-14`).

