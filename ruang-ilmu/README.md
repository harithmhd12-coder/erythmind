# Ruang Ilmu · Ilmu + Coffee Break

Platform web dan app (PWA) yang dibina daripada *Blueprint Platform Ilmu + Coffee Break* (Versi 1.0, Oktober 2026), dengan gaya editorial ala [fs.blog](https://fs.blog). Bahagian kopi menggunakan jenama **Sip 'n Go Coffee**.

Satu kod, dua bentuk: website responsif di komputer, dan app boleh dipasang di telefon (tab bawah, buka dari skrin utama, berfungsi luar talian untuk bahan yang pernah dibuka).

## Apa yang ada (ikut blueprint)

| Blueprint | Dalam app |
|---|---|
| §3 Baca, Lihat, Dengar | Artikel dengan "Faham dalam 60 saat", sorotan, isi kandungan, tetapan saiz teks dan tema; video penerangan dengan bab, sari kata, transkrip dan narasi; audio dengan sambung dari tempat terakhir, kelajuan dan pemasa tidur |
| §4 Kategori & metadata | 6 bidang, 14 bahan contoh lengkap dengan penulis, penyemak, tahap, tag, tarikh kemas kini, sumber dan bahan berkaitan |
| §5 Reka bentuk pengalaman | Halaman utama: teruskan penerokaan, cadangan, bidang, koleksi kurator, satu ilmu untuk hari ini, audio, Coffee Break, baru diterbitkan. Teroka tanpa daftar |
| §6 Explore Loop | Laluan ilmu, peta ilmu peribadi, ritual harian 5/10/20 minit, XP untuk kefahaman (bukan masa skrin), 8 lencana, siri hari dengan hari rehat dan boleh dimatikan, kawalan kekerapan peringatan |
| §7 Integrasi kopi | Kedai Sip 'n Go (ramuan, alergen, anggaran kafein), troli, pengambilan atau penghantaran, status pesanan, pesan semula; padanan Coffee + Knowledge; Coffee as a Subject; The 15-Minute Coffee Break; pilihan sembunyikan semua promosi kopi |
| §8 Model pendapatan | Pakej Explorer / Knowledge Plus / Coffee Break Club dengan senarai menunggu (uji kesanggupan membayar), e-buku |
| §10 Sistem editorial | Studio: draf, aliran kerja 7 langkah, semakan metadata minimum sebelum terbit, laporan kesilapan pembaca |
| §11, §12 | Halaman Tentang: misi, prinsip, standard editorial, peranan komuniti, pelan 12 bulan |

## Buka

Fail statik sahaja, tiada langkah bina.

```
cd ruang-ilmu
python3 -m http.server 8000
# buka http://localhost:8000
```

Di GitHub Pages (repo ini dihidangkan dari `main`, folder root), app ini berada di `https://NAMA-GITHUB.github.io/erythmind/ruang-ilmu/` selepas digabungkan ke `main`.

## Pautan halaman

Setiap paparan mempunyai pautan sendiri: `#utama`, `#baca`, `#lihat`, `#dengar`, `#teroka`, `#teroka.psikologi`, `#laluan`, `#l.berfikir-jelas`, `#a.kenapa-percaya-ramalan` (artikel), `#v.kenapa-percaya-ramalan` (video), `#kopi`, `#p.sng-spanish-latte` (produk), `#troli`, `#rehat`, `#ahli`, `#profil`, `#tentang`, `#studio`.

## Struktur

```
index.html            rangka halaman, kepala, tab bar telefon
styles.css            token warna (terang + gelap), tipografi, susun atur
data.js               kategori, 14 bahan, laluan, e-buku, produk Sip 'n Go
app.js                router, paparan, pemain audio/video, kedai, profil, studio
manifest.webmanifest  app boleh dipasang (ikon, pintasan Dengar / Rehat / Kedai)
sw.js                 luar talian: rangkaian dahulu, salinan simpanan bila tiada internet
icons/                ikon app
```

## Had prototaip (perlu sebelum pelancaran)

- **Data pengguna** (kemajuan, nota, troli, pesanan, draf Studio) disimpan dalam `localStorage` peranti. Langkah seterusnya: sambung ke backend (blueprint §9 mencadangkan Supabase/PostgreSQL) dan log masuk emel sebenar.
- **Bayaran** dalam mod demo; tiada caj dan tiada butiran kad diminta. Sambung ke gerbang pembayaran tempatan (FPX, e-dompet).
- **Audio** menggunakan suara sintetik pelayar (Web Speech). Gantikan dengan rakaman narator.
- **Video** ialah penerangan visual animasi yang dijana daripada artikel. Gantikan dengan video sebenar; bab dan transkrip sudah tersedia.
- **Harga, pakej dan kafein** ialah andaian yang perlu disahkan. Bahan contoh perlu disemak oleh penyemak bidang sebenar (terutama kandungan agama) sebelum diterbitkan.
- "Ruang Ilmu" ialah nama kerja seperti dalam blueprint.
