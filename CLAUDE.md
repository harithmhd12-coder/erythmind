# Erythmind · cara kerja Claude

Repo ini memuatkan beberapa app web statik (PWA) yang dihidangkan oleh GitHub Pages daripada `main`:

| App | Folder |
|---|---|
| Dunia 3D | root |
| Ruang Ilmu | `ruang-ilmu/` |
| Ekspedisi Buku | `ekspedisi-buku/` |
| Tuntas | `tuntas/` |

Pemilik berkomunikasi dalam bahasa Melayu. Teks UI, dokumen dan mesej commit ditulis dalam bahasa Melayu.

## Aliran kerja wajib untuk setiap app atau ciri baharu

Idea → Questions → Mock-ups → Spec → Plan → "Ya" pemilik → Build loop (setiap tugasan) → Release prep → Security review → Final review → Deploy → After deploy

Jangan langkau peringkat. Jangan tulis kod produksi sebelum pemilik berkata "ya".

**Pengecualian.** Pembetulan pepijat kecil yang jelas, atau perubahan satu-dua baris yang diminta secara langsung, boleh terus ke Build loop. Peringkat Release prep, Security review, Final review, Deploy dan After deploy tetap terpakai. Sebutkan dengan jelas bahawa jalan pintas ini digunakan.

### 1. Idea
Nyatakan semula idea pemilik dalam 2–4 baris:
- masalah yang diselesaikan
- untuk siapa
- rupa "berjaya"

### 2. Questions
Tanya hanya soalan yang mengubah reka bentuk:
- Gunakan AskUserQuestion, paling banyak 4 soalan.
- Letakkan pilihan yang disyorkan di tempat pertama.
- Perkara yang ada jawapan lalai munasabah tidak perlu ditanya. Pilih lalai itu dan nyatakannya.

### 3. Mock-ups
Bina mock-up skrin utama sebagai HTML statik di scratchpad, kemudian tangkap skrin pada lebar telefon (400px) dengan Playwright. Hantar kepada pemilik dengan SendUserFile.
- Sediakan 2 arah jika ada pilihan reka bentuk yang sebenar.
- Gunakan rujukan visual pemilik jika ada. Ambil gaya, bukan jenama, logo atau gambar orang lain.
- Mock-up tidak di-commit.

### 4. Spec
Tulis `<app>/SPEC.md` dengan kandungan berikut:
- matlamat dan bukan-matlamat
- skrin dan aliran
- peraturan perniagaan
- model data dan storan
- teks UI penting
- kriteria penerimaan yang boleh diuji

### 5. Plan
Tulis `<app>/PLAN.md` sebagai senarai tugasan bernombor. Setiap tugasan:
- cukup kecil untuk satu commit
- menamakan fail yang disentuh
- menyatakan cara ia diuji

Tugasan terakhir sentiasa Release prep, Security review dan Final review.

### 6. "Ya" pemilik
Berhenti di sini. Ringkaskan Spec dan Plan dalam beberapa baris, kemudian tunggu persetujuan yang jelas.
- Jika pemilik meminta perubahan, kemas kini SPEC.md dan PLAN.md, kemudian minta "ya" semula.
- Persetujuan ini hanya untuk skop yang dibentangkan. Skop baharu memerlukan persetujuan baharu.

### 7. Build loop (setiap tugasan)
Untuk setiap tugasan dalam PLAN.md, ikut susunan:
1. Laksanakan tugasan.
2. Tambah atau kemas kini ujian Playwright dalam `tests/<app>-smoke.cjs`. Hidangkan repo dengan `python3 -m http.server 8000 --bind 127.0.0.1` dan kawal jam dengan `page.clock` untuk logik berasaskan masa.
3. Jalankan ujian. Jika gagal, baiki dahulu. Jangan sekali-kali langkau atau lemahkan ujian.
4. Tangkap skrin dan semak sendiri. Hantar kepada pemilik jika rupa berubah.
5. Satu commit bagi setiap tugasan, kemudian push ke branch kerja.
6. Tandakan tugasan siap dalam PLAN.md. Lapor 1–2 baris.

### 8. Release prep
- Kemas kini `<app>/README.md`.
- Naikkan versi cache dalam `<app>/sw.js`.
- Semak `manifest.webmanifest` dan ikon.
- Jalankan semua ujian app itu.
- Semak lebar telefon, mod gelap dan keadaan kosong.
- Semak tiada ralat konsol.

### 9. Security review
Jalankan skill `/security-review` pada perubahan, kemudian semak senarai ini:
- Semua teks pengguna melalui `esc()` sebelum masuk `innerHTML`.
- Tiada rahsia, token atau kunci `service_role` dalam kod.
- Skrip luar hanya dari CDN yang dibenarkan, dengan versi tepat.
- Data peribadi kekal dalam peranti, atau disulitkan, seperti yang dinyatakan dalam Spec.
- Fail sandaran yang dipulihkan disahkan bentuknya.

Baiki semua penemuan sebelum meneruskan.

### 10. Final review
Jalankan skill `/code-review` pada keseluruhan diff berbanding `main`.
- Baiki penemuan yang sah.
- Jalankan semula ujian.
- Hantar tangkapan skrin akhir.
- Bandingkan dengan kriteria penerimaan dalam SPEC.md, satu demi satu.

### 11. Deploy
Aliran kerja ini dikira sebagai permintaan pemilik untuk membuka PR.
- Buka PR ke `main` dengan ringkasan, ujian yang dijalankan dan keputusan semakan.
- Berikan pautan PR kepada pemilik. Pemilik yang merge, bukan Claude.

### 12. After deploy
Selepas pemilik merge:
- Tunggu GitHub Pages deploy, dan sahkan setiap fail app dihidangkan dengan versi baharu.
- Jalankan ujian asap terhadap URL sebenar (`TEST_ORIGIN`).
- Selaraskan branch kerja dengan `main`.
- Berikan pemilik pautan app dan langkah membuka semula (tutup app sepenuhnya, kemudian buka semula).
- Catat perkara susulan dalam PLAN.md.

## Teknikal
- Tiada langkah bina untuk app statik. Buka melalui `python3 -m http.server`.
- Pautan langsung: `https://harithmhd12-coder.github.io/erythmind/<app>/`
- Playwright dan Chromium sudah dipasang. Jangan jalankan `playwright install`.
- Mesej commit: ringkas, dalam bahasa Melayu, diawali nama app (contoh: `Tuntas: ...`).
