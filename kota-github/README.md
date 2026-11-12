# Kota GitHub

Profil GitHub menjadi kota 3D yang hidup di atas pulau terapung. Taip mana-mana nama pengguna dan kotanya tumbuh di depan mata.

Buka: `https://harithmhd12-coder.github.io/erythmind/kota-github/`
Kota orang lain: tambah `?u=nama-pengguna`, contohnya `kota-github/?u=torvalds`.

## Cara kota dibaca

| GitHub | Dalam kota |
|---|---|
| Repo | Bangunan. Warna ikut bahasa utama repo |
| Bintang | Bangunan lebih tinggi (saiz repo menambah sedikit) |
| Push awam (90 hari lepas) | Trak commit membawa mesej commit sebenar ke bangunan repo itu |
| Isu terbuka | Api di bumbung, makin banyak isu makin marak |
| PR terbuka | Kren di atas bumbung (sehingga 3) |
| Push dalam 14 hari | Cincin biru bercahaya di kaki bangunan |
| Fork | Rumah berbumbung pelana |
| Repo diarkib | Bangunan kelabu |
| Profil | Plaza tengah dengan avatar berputar |

## Kawalan

- Seret untuk pusing, cubit atau tatal untuk zum, seret dua jari (atau Shift + seret) untuk anjak.
- Ketik bangunan untuk butiran repo dan pautan ke GitHub.
- **Tur**: lawatan berpandu ke setiap ciri kota.
- **Ikut trak**: kamera mengikut satu trak commit sehingga ia menghantar push.
- **Malam**: tingkap menyala; repo aktif lebih terang.
- **Kongsi**: salin pautan kota.

## Data

Semua data ditarik terus dari API awam GitHub dalam pelayar pelawat, tanpa token dan tanpa pelayan:
profil, repo (sehingga 300), acara awam, satu carian PR terbuka, dan mesej commit bagi push terbaru.
Hasilnya disimpan dalam pelayar selama 15 minit. Setiap 90 saat kota menyemak push baharu dengan
permintaan bersyarat (ETag), yang tidak dikira dalam had 60 permintaan sejam GitHub.

Fail statik sahaja; Three.js r128 dikongsi dari `../vendor/three/`.
