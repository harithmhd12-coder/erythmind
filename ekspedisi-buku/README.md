# Ekspedisi Buku

Game diorama isometrik 3D (gaya "miniature diorama") untuk memahami buku bab demi bab tanpa membelek halaman. Setiap buku menjadi satu peta. Setiap bab menjadi satu mercu tanda dengan pencerita, misi dan cabaran, dan semuanya disusun ikut kronologi buku.

Fail statik sahaja, tiada langkah bina. Three.js r128 diambil dari `../vendor/three/`.

```sh
cd erythmind            # akar repo
python3 -m http.server 8000
# buka http://localhost:8000/ekspedisi-buku/
```

## Buku (205 bab, dwibahasa BM/EN)

| Buku | Bab | Daerah |
|---|---|---|
| Atomic Habits (James Clear) | 22 | 6 |
| The Art of Thinking Clearly (Rolf Dobelli) | 99 | 10 |
| Clear Thinking (Shane Parrish) | 28 | 5 |
| Trust Me, I'm Lying (Ryan Holiday) | 26 | 4 |
| Ẓāhirat al-Nifāq (analisis kitab, al-Maydānī) | 30 | 6 |

Kandungan ditulis semula dengan kata-kata sendiri, bukan petikan panjang. Fail PDF tidak dimuatkan ke dalam game.

## Gelung permainan

1. **Pencerita** di setiap bab memberi cerita pembuka dan misi. Semua misi dijana daripada data bab yang sama (3 idea + soalan dilema), jadi tiada kandungan tambahan perlu ditulis:
   - **🧭 Ikut Jejak:** ikut jejak kaki bercahaya ke 3 persimpangan. Setiap persimpangan ada dua bendera dengan dua kenyataan, dan hanya satu daripada bab ini. Salah pilih = jalan mati, dan bintang dipotong.
   - **🔍 Siasat:** periksa 5 objek atau saksi. 2 daripadanya petunjuk palsu dari bab lain. Dalam cabaran, pemain mesti memilih 3 petunjuk yang benar.
   - **💰 Kejar Pencuri:** pencuri lari dengan AI yang mencari jalan menjauhi pemain dalam kawasan terhad. Tangkap dia 3 kali dengan berlari dan memotong jalan.
   - **📦 Hantar Barang:** hantar bungkusan kepada 3 penerima. Penggoda 😈 di tengah jalan menawarkan ganjaran segera. Terima = misi gagal (−1 nyawa). Tolak atau elak jalan = lulus.
   - **🧱 Susun Timbal:** Sokoban di jalan raya. Tolak blok konsep ke tapak bernombor mengikut urutan. Hanya untuk bab yang ada urutan (`data/urutan.js`).
   - **🗣 Tanya Penduduk** dan **⏱ Lawan Masa** (3 serpihan dalam 70 saat).
   - **Misi signature** (16, satu bab khas setiap satu, ditetapkan dalam `EB.SIGNATURE` di `js/signature.js`):

     | Buku | Misi |
     |---|---|
     | Atomic Habits | 🌱 Kebun 1% (pokok kekal yang perlu disiram setiap hari sebenar, berbuah selepas 7 hari, layu jika terlepas 2 hari) · 🏠 Rumah Persekitaran (susun barang, NPC “hidup sehari”) · 🪨 Rantaian Tabiat (batu loncatan berirama, jangan terlepas dua kali) |
     | The Art of Thinking Clearly | 🪦 Kubur Kegagalan · 🎡 Roda Rolet · ⚓ Pasar Sauh · 🦍 Gorila Tersembunyi |
     | Clear Thinking | ⏸ Detik Biasa (tahan butang BALAS) · 🍲 HALT (bar lapar & letih) · 💣 Peluru sebelum Meriam |
     | Trust Me, I'm Lying | 🔗 Jejak Rantaian sumber · 📰 Bilik Berita (klik lawan kepercayaan) · 🔥 Pembetulan (padam khabar palsu) |
     | Ẓāhirat al-Nifāq | 🪞 Cermin Muhasabah (rekod sebenar pemain) · 🗣 Lahn al-Qaul (kata lawan perbuatan) · 🕌 Masjid Dhirar |
2. Setiap langkah misi membuka satu idea utama bab. Kesilapan semasa misi (jalan mati, susunan salah) mengurangkan bintang bab itu.
3. **Cabaran:** satu soalan dilema hidup sebenar, satu soalan "idea mana dari bab ini", dan kadangkala satu soalan ulang kaji bab lama. Jawapan salah ditanya semula dan menolak 1 nyawa.
4. Selesai bab: bintang 1 hingga 3, XP, streak harian, Kad Ilmu dalam album, dan pintu kabus ke bab seterusnya terbuka.
5. **Penjaga Daerah: Pertarungan Kad.** Penjaga melancarkan 5 serangan (situasi atau idea). Pemain menangkis dengan memilih Kad Ilmu bab yang betul daripada album, dalam 25 saat setiap satu. Lulus jika tersilap tidak lebih daripada sekali. Di separuh akhir buku, tajuk kad disembunyikan, jadi pemain mesti ingat bab mengikut nombor dan kronologi.
6. **Nyawa:** pulih 1 setiap 4 minit, atau lebih cepat melalui ulang kaji.
7. **Ulang kaji berjarak:** soalan bab lama muncul semula selepas 1, 3, 7, 16 dan 35 hari.

Album Kad Ilmu yang lengkap ialah ringkasan seluruh buku.

## Kawalan

- **Komputer:** WASD atau anak panah untuk bergerak (Shift untuk lari).
  - Klik tanah atau NPC untuk berjalan ke situ (pencarian laluan A*).
  - F, Space atau Enter untuk bercakap.
  - Q/E untuk pusing kamera, roda tetikus untuk zum.
  - M untuk peta, K untuk album.
- **Telefon:** seret di separuh kiri untuk joystick (tolak jauh untuk lari).
  - Ketik tanah untuk berjalan ke situ.
  - Seret di kanan untuk pusing kamera, cubit untuk zum.

Pergerakan menggunakan momentum (pecutan dan geseran), pusingan licin, condong badan ketika membelok, animasi langkah prosedural, debu kaki ketika berlari, dan kamera yang mengekor dengan sedikit pandangan ke hadapan.

## Struktur

```
index.html, gaya.css, manifest.webmanifest, ikon.svg
js/dunia.js      grid, susun atur peta, model diorama (digabung sebaris), air, kabus, tilt-shift
js/watak.js      model watak, animasi, A*, pengawal pemain, penduduk
js/misi.js       pengendali misi umum
js/signature.js  16 misi signature dan Kebun 1%
js/awan.js       simpanan awan Supabase dan gabungan simpanan
js/permainan.js  aliran misi, cabaran, pertarungan kad, nyawa/XP/streak, ulang kaji, album, peta, input, simpanan
data/*.js        kandungan buku
```

## Menambah buku baharu

Cipta `data/nama-buku.js` dan masukkan dalam `index.html`:

```js
EB.daftar({
  id: 'nama-buku', tajuk: 'Tajuk', pengarang: 'Pengarang', warna: '#e07a3f', ikon: '📘',
  ringkas: 'Ringkasan BM|Summary EN',
  bahagian: [
    { n: 'Nama daerah|District name', tema: 'kampung', // kampung | ladang | hutan | tasik | bandar
      bab: [ EB.B('Tajuk|Title', 'Cerita pembuka|Opening story',
                  ['Idea 1|Idea 1', 'Idea 2|Idea 2', 'Idea 3|Idea 3'],
                  'Soalan dilema|Dilemma question',
                  ['Jawapan betul|Correct', 'Salah|Wrong', 'Salah|Wrong'],
                  'Penerangan & pengajaran|Explanation & lesson') ] },
  ],
});
```

Jawapan betul sentiasa ditulis pertama; game mengocok susunan pilihan. Peta, kabus, misi dan soalan automatik dijana sendiri daripada data ini.

## Simpanan awan (Supabase)

Pemain boleh log masuk dengan emel (pautan log masuk atau kod 6 digit, tanpa kata laluan). Semua pemain di peranti itu kemudian disimpan ke akaun mereka, dan boleh disambung di peranti lain dengan emel yang sama. Pilihan **Guna tanpa emel** menyimpan ke awan untuk peranti itu sahaja.

- Projek Supabase sama dengan Erythmind (`../app/config.js`), tetapi sesi disimpan di bawah kunci berasingan (`ekspedisi-buku.auth`). Log masuk game tidak menyentuh sesi pemilik atau tetamu Erythmind.
- Jadual `public.eb_simpanan` (`supabase/ekspedisi-buku.sql`): satu baris setiap pemain, dan RLS membenarkan setiap akaun membaca dan menulis baris sendiri sahaja. Had 200 KB setiap baris dan 12 pemain setiap akaun.
- Penyegerakan berlaku semasa membuka game (jika sudah log masuk), selepas log masuk, 4 saat selepas setiap simpanan, dan apabila rangkaian kembali. Data dari beberapa peranti **digabung**, bukan ditindih: bab terjauh, bintang tertinggi, XP tertinggi, hari kebun dan ulang kaji digabungkan. Pemain bernama sama yang dicipta sebelum log masuk disatukan dengan pemain di awan.
- Game tidak menghubungi Supabase langsung sehingga pemain memilih untuk log masuk.

### Persediaan sekali (pemilik projek Supabase)

1. **SQL Editor → New query**: tampal seluruh `supabase/ekspedisi-buku.sql` → **Run**. Ia tidak mengubah jadual atau peraturan Erythmind.
2. **Authentication → URL Configuration → Redirect URLs**: tambah `https://harithmhd12-coder.github.io/erythmind/ekspedisi-buku/**`. Tanpa ini, pautan dalam emel akan membawa pemain ke Site URL (app Erythmind) dan bukan ke game.
3. **Authentication → Emails → SMTP Settings**: sambungkan SMTP sendiri (contohnya Resend atau Brevo, ada pelan percuma). Perkhidmatan emel bawaan Supabase hanya menghantar kepada ahli pasukan projek dan dengan had yang sangat rendah, jadi pemain awam tidak akan menerima emel tanpa langkah ini.
4. (Pilihan) **Authentication → Emails → Templates**: dalam templat *Magic Link* dan *Confirm signup*, tambah `{{ .Token }}` supaya emel juga mengandungi kod 6 digit. Ini berguna apabila pemain membuka emel di peranti lain.
5. *Allow anonymous sign-ins* sudah hidup untuk Erythmind; ia hanya digunakan oleh pilihan **Guna tanpa emel**.

## Pemain & simpanan

- Pada lawatan pertama, pemain memasukkan **nama** dan memilih **warna watak**. Nama dipaparkan di atas kepala watak dan di layar mula.
- Satu peranti boleh ada **beberapa pemain**. Setiap pemain ada kemajuan, XP, streak, kebun dan statistik sendiri. Tukar melalui butang ⇄ di layar mula atau Tetapan.
- Kemajuan **disimpan automatik** dalam `localStorage`: setiap 5 saat, setiap kali bab selesai, dan apabila tab ditutup atau disembunyikan. Butang **▶ Sambung** di layar mula membawa pemain terus ke bab terakhir.
- **Kod simpanan** (Tetapan → Kod simpanan) mengeksport seluruh ekspedisi sebagai kod `EB1.…` atau fail `.json`. Di peranti lain, **Sambung dari kod** memulihkannya. Kod ini juga berguna jika data browser dibersihkan.
- Kunci storan: `ekspedisi-buku.profil` (senarai pemain), `ekspedisi-buku.data.<id>` (data setiap pemain), `ekspedisi-buku.tetapan` (bahasa, kualiti, bunyi). Simpanan versi lama (`ekspedisi-buku.v1`) dipindahkan secara automatik ke pemain pertama.
