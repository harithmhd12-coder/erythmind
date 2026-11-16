# Ruang Ilmu · Plan: Siri (ilmu pemilik)

Rujuk `SPEC.md`. Ujian dalam `tests/ruang-ilmu-smoke.cjs` (baharu), dihidang dengan `python3 -m http.server 8000 --bind 127.0.0.1`.

1. [x] **Model dan rangka Siri.** Cipta `siri.js` (SIRI, EPISOD kosong, Sip n Speak), muatkan dalam `index.html`, tambah laluan `#siri`, `#s.<slug>`, pautan nav "Siri", penyesuai `episodKeBahan`.
   Fail: `siri.js`, `index.html`, `app.js`, `styles.css`. Ujian: `#siri` papar kad, Sip n Speak "Akan datang", tiada ralat konsol.
2. [ ] **Paparan episod soal-jawab** (arah A atau B yang dipilih pemilik): blok teks, ayat (Arab RTL + fon Amiri), hadis, label "Rujukan belum dinyatakan", navigasi episod, tanda selesai.
   Fail: `app.js`, `styles.css`, `index.html` (fon). Ujian: episod contoh papar soalan dan ayat; tanda selesai mengemas kini kemajuan siri.
3. [ ] **Import Tadabbur Surah al-Mukminun.** Baca setiap fail SMU bersegmen Tadabbur Surah Mukminun dari Drive, buang nama program, panel, kempen dan pautan, tukar ke EPISOD.
   Fail: `siri.js`. Ujian: setiap episod dibuka tanpa ralat; carian teks terlarang (nama program, panel, MUSIL, Al-Bayan, drive.google) pulang kosong.
4. [ ] **Import Akhlak dan Adab** (fail AB dalam folder DUHA) dengan peraturan yang sama.
   Fail: `siri.js`. Ujian: sama seperti tugasan 3.
5. [ ] **Integrasi**: carian, Teroka (Agama), halaman utama "Siri terkini", peta ilmu, Simpanan, pemain Dengar (langkau Arab), Kad integriti dan semakan Studio (hadis tanpa rujukan disenaraikan).
   Fail: `app.js`. Ujian: carian "kebenaran" dan "malu"; teks pemain tiada aksara Arab; Studio menyenaraikan isu rujukan.
6. [ ] **Kenali Munafik** sebagai senarai semak peribadi (daripada artifak Checklist Kenali Munafik).
   Fail: `siri.js`, `app.js`, `styles.css`. Ujian: tanda kekal selepas muat semula; tiada permintaan rangkaian baharu.
7. [ ] **Kenali Kebenaran** sebagai karusel (daripada artifak 5 Berhala Kaum Nuh).
   Fail: `siri.js`, `app.js`, `styles.css`. Ujian: leret dan kekunci anak panah menukar slaid.
8. [ ] **Kuliah Pemikiran** (Kuliah 1–3 + Peta Sebab Kesilapan Berfikir) sebagai artikel dalam satu siri.
   Fail: `siri.js`. Ujian: tiga kuliah dibuka; semakan integriti lulus.
9. [ ] **Release prep, Security review, Final review.** README, versi cache `sw.js`, semua ujian, 400px/1366px, mod gelap, `/security-review`, `/code-review`, kriteria penerimaan satu demi satu, PR.

## Susulan selepas kelompok pertama
- Kelompok kedua: skrip SMU dan Dhuha selebihnya.
- Bahan Sip n Speak daripada pemilik.
- Semakan takhrij hadis yang berlabel "Rujukan belum dinyatakan".
