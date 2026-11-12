# Tuntas · Fokus sampai siap

Tracker harian yang tegas, dengan konsep **focus work until done** dan **minimalist lifestyle**. Ia boleh dipasang sebagai app (PWA) di telefon dan komputer, dan berfungsi tanpa internet.

Di GitHub Pages, app ini dibuka di `https://NAMA-GITHUB.github.io/erythmind/tuntas/` selepas digabungkan ke `main`.

## Aliran sehari

| Masa | Apa berlaku |
|---|---|
| Pagi | **Ikrar.** Pilih emosi dan tenaga. Pilih paling banyak 3 tugasan (paling banyak 1 Berat). Setiap satu perlu takrif siap hari ini. Tahan butang untuk berikrar. Selepas itu pelan dikunci. |
| Siang | **Fokus.** Hanya tugasan semasa boleh dimulakan: hutang dahulu, kemudian Berat → Harian → Ringan → Automasi. Mod fokus mengunci seluruh app. |
| Malam | **Muhasabah.** Ia dibuka pada 18:00 atau selepas semua ikrar selesai. Isikan emosi hari ini, kemenangan, penghalang, syukur, pengajaran dan langkah pertama esok. Hari ditutup selepas itu. |

## Peraturan disiplin

- Keluar dari app semasa blok fokus dikira sebagai **gangguan**. Lebih 2 gangguan menjadikan blok **tidak sah**, dan minit blok itu tidak dikira. Menutup app terus juga dikesan.
- Tugasan hanya boleh ditanda **siap** dengan bukti bertulis, pengesahan takrif dan tekanan tahan.
- **Lepaskan** perlukan sebab sekurang-kurangnya 30 aksara dan tekanan tahan 5 saat. Hari itu menjadi GAGAL dan tugasan masuk **Kubur Tugasan**.
- Tugasan yang belum siap apabila hari ditutup menjadi **hutang**. Hutang wajib dibawa ke ikrar seterusnya, di atas tugasan lain.
- **Tangguh** dibenarkan 2 kali sehari. Tugasan itu kekal sebagai tugasan semasa.
- Hanya satu jeda pendek 3 minit dibenarkan bagi setiap blok. **Jeda solat** (20 minit) tidak dikenakan penalti.
- Keputusan hari:
  - **LULUS**: semua siap, muhasabah dibuat, ikrar tepat masa dan sekurang-kurangnya 60% kebiasaan minimalis dibuat.
  - **SEPARA**: semua siap, tetapi ikrar lewat atau kebiasaan minimalis kurang 60%.
  - **GAGAL**: selain dua keadaan di atas.
- Streak hanya bertambah pada hari LULUS. Satu hari rehat mingguan boleh dipilih.
- Hari bermula jam 4:00 pagi, jadi kerja lewat malam dan tahajjud kekal dalam hari yang sama.

## Ciri emosi

- **Murabbi**: wajah penjaga yang berubah antara bangga, gembira, tenang, risau, tegas dan kecewa, ikut keadaan disiplin kau.
- **Check-in emosi** (12 emosi) dibuat ketika ikrar, sebelum setiap blok, selepas setiap blok dan ketika muhasabah.
- **Intervensi wajib** bagi emosi negatif sebelum blok bermula. Ia tidak boleh dilangkau:
  - cemas: pernafasan kotak 64 saat
  - marah: sejukkan 60 saat
  - letih: rehat aktif 2 minit
  - malas: peraturan 2 minit
  - terbeban: pecahkan kepada satu langkah
  - bosan: kembali kepada niat
  - kecewa atau sedih: lepaskan, bersama ayat al-Insyirāḥ
- **Tergoda?**: tunggang ombak dorongan selama 90 saat. Menang atau kalah dicatat.
- **Peti fikiran**: tulis fikiran yang mengganggu semasa fokus, kemudian uruskannya ketika muhasabah.
- **Peta emosi 30 hari** disertai wawasan tentang kadar blok sah yang dimulakan dalam emosi negatif berbanding emosi positif.
- **Peringatan harian**: al-ʿAṣr, al-Insyirāḥ, hadith tentang masa, istiqamah dan itqān, serta satu petikan Atomic Habits.

## Minimalis

- **Kebiasaan harian** (had 5, boleh diubah)
- **Log barang keluar**: sedekah, buang, jual atau kitar semula
- **Senarai tunggu 30 hari**: butang beli hanya terbuka selepas 30 hari, dan jumlah wang yang dijimatkan dikira.

## Kelas tugasan

| Kelas | Model | Blok / rehat |
|---|---|---|
| Berat | Fable 5.2 | 90 / 15 min |
| Harian | Opus 5.5 | 50 / 10 min |
| Ringan | Sonnet 5.5 | 25 / 5 min |
| Automasi | Haiku 5.5 | 15 / 5 min |

Pustaka tugasan dimuatkan dengan senarai tugasan sedia ada dan boleh diubah dalam Tetapan (had 30).

## Data

Semua data disimpan dalam `localStorage` peranti sahaja. Gunakan **Tetapan → Muat turun sandaran** setiap minggu. Fail sandaran itu boleh dipulihkan di peranti lain.

## Ujian

```
python3 -m http.server 8000 --bind 127.0.0.1 &
node tests/tuntas-smoke.cjs
```

Ujian ini mengawal jam browser untuk menguji satu hari penuh: ikrar, fokus, gangguan, dorongan, rehat, intervensi, bukti siap, muhasabah, hutang esok, senarai tunggu dan rekod.
