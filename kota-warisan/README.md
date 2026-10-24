# Kota Warisan

Permainan bina kota bertemakan sejarah Tanah Melayu dan Malaysia, menggunakan sistem yang sama seperti Clash of Clans: ekonomi sumber, masa naik taraf, pertempuran, puak dan ganjaran berlapis.

Buka `index.html` terus dalam pelayar. Tiada pelayan atau binaan diperlukan. Simpanan permainan berada dalam `localStorage` peranti.

## Sistem
| Sistem | Dalam Kota Warisan |
|---|---|
| Sumber | Emas (bangunan & pertahanan), Beras (tentera & kajian), Timah (pahlawan, dari Istana 5), Mutiara (mempercepat; diperoleh dengan bermain sahaja) |
| Masa & tukang | Setiap naik taraf mengambil masa dan seorang tukang. Hasil lombong dan sawah terus bertambah semasa pemain tiada |
| Istana = era | Tahap 1–7: Kampung Tepian, Lembah Bujang, Langkasuka & Srivijaya, Kesultanan Melaka, Johor & Perak, Era Perjuangan, Merdeka & Malaysia |
| Pertempuran | Pendekar, Penyumpit, Gajah Perang, Pembawa Bedil, Hulubalang; pahlawan Hang Tuah dan Tun Fatimah; taktik Gendang Perang dan Ubat Akar Kayu |
| Pertahanan | Meriam Lela, Menara Sumpit, Meriam Besar, Kota Kayu/Batu, Ranjau Buluh |
| Lawan | Kempen Selat (12 kubu lanun) dan Cari Lawan (kampung jiran rawak, rampasan berubah-ubah, maruah & liga) |
| Puak | Puak simulasi "Anak Selat": sembang, derma dan minta tentera, papan kedudukan, Gotong-royong |
| Ganjaran | Misi harian, Pencapaian berbintang, Kitab Hikayat (23 kad sejarah), Kuiz sejarah harian |

## Struktur
```
index.html   rangka HUD dan modal
styles.css   gaya (kayu jati, kuning diraja, songket)
data.js      imbangan, bangunan, tentera, hikayat, kuiz, kempen
app.js       enjin: masa, lukisan isometrik kanvas, input, perang, puak, UI
```
Semua angka imbangan ada dalam `data.js`.
