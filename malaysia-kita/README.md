# Malaysia Kita

Permainan strategi pentadbiran: kau Perdana Menteri Malaysia. Peta 3D diorama 13 negeri dan 3 Wilayah Persekutuan, dengan data geografi dan demografi (anggaran dibundarkan, Banci 2020 dan sumber awam).

Buka `index.html` dalam pelayar. three.js r128 dimuat daripada cdnjs.

## Lima bidang
| Bidang | Mekanik |
|---|---|
| Pentadbiran | Projek di setiap negeri (13 jenis, tahap 1–5) dengan pemasa dan pasukan projek. Kesesuaian negeri (bintang) menentukan pulangan. Projek mega: ECRL, Pan Borneo, RTS Link, MRT Lingkaran, LRT Pulau Pinang. Pusat Pentadbiran Putrajaya = 7 fasa. |
| Ekonomi | Simulasi bulanan: KDNK negeri, hasil cukai, subsidi, faedah hutang, inflasi, pengangguran. Had hutang 65% KDNK. Belanjawan tahunan setiap Januari. Bon kerajaan. |
| Politik | 222 kerusi Dewan Rakyat mengikut negeri. Dasar perlu Modal Politik dan undian; pindaan perlembagaan perlu 148. PRU setiap 60 bulan atau bubar awal. Gabungan dengan Blok Borneo. Pilihan raya kecil. |
| Sosial | Sokongan per negeri, perpaduan, komposisi etnik, kepadatan, risiko banjir. Peristiwa bermusim (banjir monsun Nov–Jan, jerebu). Permohonan kerajaan negeri. |
| Diplomasi | 14 rakan (ASEAN, China, AS, Jepun, Korea, India, Arab Saudi, EU, Australia). Lawatan rasmi, Meja Rundingan (teka keutamaan tersembunyi), pelaburan, FTA, pemindahan teknologi. Keseimbangan China–AS. |

Tiga penasihat (ekonomi, sosial, politik) memberi pandangan bercanggah pada setiap peristiwa. Parti dan watak rekaan.

## Struktur
```
index.html   HUD dan modal
styles.css   tema Jalur Gemilang
data.js      negeri (poligon, data), negara, projek, dasar, peristiwa, kuiz
peta.js      peta 3D (three.js): negeri diekstrud, hutan, gunung, bandar, projek, kapal, pelantar
app.js       simulasi, politik, diplomasi, UI, input
```
