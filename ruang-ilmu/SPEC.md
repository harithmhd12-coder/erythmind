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
6. **Kuliah**: dipaparkan sebagai artikel Ruang Ilmu biasa dalam satu siri.
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
