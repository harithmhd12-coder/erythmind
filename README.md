# Erythmind · App

Dunia 3D peribadi Eryth Sayf sebagai app sebenar: boleh dipasang di skrin utama Android, iPhone dan komputer, dibuka sesiapa melalui satu pautan, dengan kawalan penuh di tangan pemilik.

- **Data** disulitkan dalam peranti dengan PIN sebelum dihantar. Supabase dan GitHub hanya menyimpan teks rawak.
- **Pemilik** dibuktikan kepada pelayan melalui akaun emel + kata laluan. PIN dunia tidak pernah keluar dari peranti.
- **Tetamu** masuk dengan pas PIN masing-masing. Pemilik boleh mengunci dunia, mengeluarkan atau menyekat peranti, dan melihat log masuk. Semua ini dikuatkuasakan oleh pelayan.

## Persediaan sekali sahaja

### 1. Supabase
1. Buat projek baharu di [supabase.com](https://supabase.com). Simpan kata laluan pangkalan data di tempat selamat. Kau tidak perlu memberikannya kepada sesiapa.
2. **SQL Editor → New query**: tampal seluruh isi [`supabase/setup.sql`](supabase/setup.sql). Tukar `GANTI_DENGAN_EMEL_KAU` kepada emel pemilik, kemudian tekan **Run**.
3. **Authentication → Sign In / Providers**:
   - hidupkan **Allow anonymous sign-ins** (setiap pelawat diberi identiti peranti tanpa mendaftar);
   - pastikan **Confirm email** HIDUP (ini yang menghalang orang lain mendaftar dengan emel kau).
4. **Authentication → URL Configuration**: letak pautan app (langkah 3 di bawah) sebagai **Site URL**.
5. **Realtime → Settings**: matikan **Allow public access**, supaya room hanya menerima peranti yang dibenarkan.
6. **Project Settings → API**: salin **Project URL** dan kunci **anon / publishable** ke dalam [`app/config.js`](app/config.js).
   Jangan sesekali letak kunci **service_role / secret** di mana-mana.

### 2. Daftar akaun pemilik
Buka app, tekan **Pemilik? Log masuk akaun** di skrin pintu, isi emel yang sama seperti dalam `setup.sql` dan kata laluan baharu (bukan PIN dunia), kemudian tekan **Daftar kali pertama**. Sahkan melalui emel, kemudian log masuk.

### 3. GitHub Pages
Repo ini mesti **public** untuk GitHub Pages percuma. Itu selamat: tiada rahsia dalam kod, dan kunci anon memang direka untuk awam.
**Settings → Pages → Build and deployment**: Source *Deploy from a branch*, Branch `main`, folder `/ (root)`.
Pautan app: `https://NAMA-GITHUB-KAU.github.io/NAMA-REPO/`

### 4. Pindahkan dunia dari claude.ai
1. Dalam versi claude.ai: **Tetapan & Sandaran → Muat turun sandaran tersulit**.
2. Dalam app (sudah log masuk sebagai pemilik): bina dunia dengan PIN sementara, kemudian **Tetapan & Sandaran → Pulihkan daripada fail sandaran**.
3. Masuk semula dengan PIN asal kau. Semua rekod, zon dan pas tetamu kembali.

## Pasang di telefon
- **Android (Chrome)**: buka pautan app → menu ⋮ → *Install app* / *Tambah ke skrin utama*.
- **iPhone (Safari)**: buka pautan app → butang Kongsi → *Add to Home Screen*.

## Kawalan pemilik (butang **Kawalan Penuh** selepas masuk sebagai pemilik)
| Kawalan | Kesan |
|---|---|
| Kunci dunia | Semua tetamu disekat serta-merta. Pelayan menolak bacaan, tulisan dan room mereka. |
| Keluarkan | Tetamu itu dikeluarkan dari room dan dunianya terkunci. Dia boleh masuk semula dengan PIN. |
| Sekat peranti | Peranti itu ditolak oleh pelayan sehingga kau menyahsekat. |
| Log masuk | Siapa masuk, sebagai apa, berapa kali, kali terakhir. |
| Pas Tetamu | Cipta, ubah kuasa, tetapkan tempoh (1/7/30/90 hari) atau batalkan pas. |

## Mengemas kini app
Dunia asal disunting dalam folder sumber `erythmind/` (yang sama dengan artifak claude.ai). Untuk membawa perubahan ke app:
```
python3 tools/build.py ../erythmind
git add -A && git commit -m "Kemas kini dunia" && git push
```
Telefon yang sudah memasang app menerima versi baharu sendiri pada bukaan seterusnya.

## Struktur
```
index.html            dijana oleh tools/build.py
js/                   kod dunia (disalin dari sumber)
assets/               model 3D dan peta (hanya yang digunakan)
app/config.js         sambungan Supabase kau
app/supabase-shim.js  storan, room dan identiti di atas Supabase
app/kawalan.js        akaun pemilik, kunci dunia, sekat, log masuk
vendor/supabase.js    supabase-js 2.45.4
supabase/setup.sql    jadual dan peraturan keselamatan
sw.js, manifest.webmanifest, icons/   app boleh dipasang dan dibuka tanpa internet
```

## Grafik dan warna dunia

Dunia menggunakan pipeline warna asal yang serasi dengan shader tanah dan gred filem sedia ada, material bertekstur dan relief tanah, langit berawan dengan aurora, planet bercincin, air beralun, pokok fotografi, aksen tenaga, pulau terapung dan air terjun hiasan. Tetapan **Gaya grafik → Sci-fi Fantasy** memilih rupa baharu; **RTS Klasik** kekal sebagai gaya lalai; pilihan yang sudah disimpan tidak diubah. Kualiti Auto masih menyesuaikan peranti, termasuk mengurangkan kesan pada GPU perisian.

Game terus membuka pintu akses tanpa intro atau video. Logo dikekalkan di pintu akses dan ikon app. Model 3D dimuat selari dengan sambungan akaun. Semua library Three.js r128 disimpan dalam `vendor/three/` bersama lesen MIT.

Untuk pembangunan biasa, tiada langkah bina diperlukan:

```sh
cd /workspace/erythmind
python3 -m http.server 8000 --bind 127.0.0.1
```

Ujian browser menggunakan Node, Playwright dan Chromium yang tersedia dalam persekitaran pembangunan:

```sh
node tests/graphics-smoke.cjs
```

Ujian mengasingkan sambungan akaun dalam browser kepada storan tempatan sementara. Ia menyemak 40 model, pintu akses terus tanpa intro, warna material dan output renderer, shader pada tiga tahap kualiti, penukaran gaya serta enam lapisan dunia. Ia tidak menguji akaun atau pangkalan data Supabase sebenar. `CHROMIUM_PATH` dan `TEST_ORIGIN` boleh menggantikan lokasi browser/server.
