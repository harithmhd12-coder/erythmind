/* Malaysia Kita · data.
   Angka permulaan ialah anggaran yang dibundarkan, berpandukan statistik awam (Banci 2020, anggaran KDNK negeri,
   pembahagian kerusi Dewan Rakyat). Ia untuk permainan dan pembelajaran, bukan sumber rasmi.
   Sempadan negeri dipermudahkan menjadi poligon (bujur, lintang). */
'use strict';

const DEG = 5, LON0 = 109.5, LAT0 = 4.3;   // unjuran peta: 1 darjah = 5 unit

/* ---------- titik sempadan dikongsi (bujur, lintang) ---------- */
const P_ = {
  TH0: [100.13, 6.69], TH1: [100.36, 6.66], TH2: [100.55, 6.50], TH3: [100.82, 6.38], TH4: [101.00, 6.10], TH5: [101.08, 5.80],
  TH6: [101.35, 5.82], TH7: [101.58, 5.86], TH8: [101.82, 5.75], TH9: [102.00, 6.05], TH10: [102.09, 6.24],
  EC1: [102.28, 6.18], EC2: [102.50, 5.86], EC3: [102.80, 5.70], EC4: [103.14, 5.33], EC5: [103.42, 4.76], EC6: [103.42, 4.18],
  EC7: [103.36, 3.80], EC8: [103.45, 3.48], EC9: [103.48, 3.00], EC10: [103.62, 2.65], EC11: [103.84, 2.43], EC12: [104.10, 1.95], EC13: [104.28, 1.40],
  SC1: [104.00, 1.45], SC2: [103.76, 1.48], SC3: [103.51, 1.27],
  WC1: [103.35, 1.55], WC2: [102.93, 1.85], WC3: [102.57, 2.05], WC4: [102.45, 2.13], WC5: [102.25, 2.19], WC6: [101.99, 2.40], WC7: [101.80, 2.52],
  WC8: [101.72, 2.62], WC9: [101.32, 3.00], WC10: [101.22, 3.35], WC11: [100.82, 3.85], WC12: [100.62, 4.22], WC13: [100.55, 4.80], WC14: [100.38, 5.12],
  WC15: [100.36, 5.40], WC16: [100.36, 5.58], WC17: [100.30, 6.10], WC18: [100.20, 6.30], WC19: [100.13, 6.42],
  PK1: [100.30, 6.45], PN1: [100.48, 5.56], PN2: [100.53, 5.35], PN3: [100.48, 5.14],
  KP1: [100.75, 5.17], KP2: [100.95, 5.35], KP3: [101.05, 5.60],
  PKl1: [101.55, 5.40], PKl2: [101.45, 5.00], PKl3: [101.42, 4.62],
  PP1: [101.35, 4.30], PP2: [101.45, 4.00], PP3: [101.58, 3.82], PS1: [101.10, 3.75], PS2: [101.40, 3.72],
  KlP1: [101.80, 4.66], KlP2: [102.10, 4.55], KlP3: [102.40, 4.70], KT1: [102.45, 5.55], KT2: [102.58, 5.28], KT3: [102.40, 5.00],
  TP1: [102.70, 4.55], TP2: [103.00, 4.35], TP3: [103.22, 4.25],
  SP1: [101.75, 3.55], SP2: [101.82, 3.28], SP3: [101.90, 3.10], SN1: [101.86, 2.95], SN2: [101.79, 2.76],
  NP1: [102.25, 3.05], NP2: [102.55, 2.85], NJ: [102.68, 2.62], NM1: [102.10, 2.47], NM2: [102.28, 2.50], NMJ: [102.45, 2.42], MJ1: [102.52, 2.28], NJ1: [102.58, 2.52],
  PJ1: [103.00, 2.62], PJ2: [103.30, 2.70],
  SW1: [109.65, 2.08], SW2: [110.33, 1.72], SW3: [110.95, 1.62], SW4: [111.40, 2.12], SW5: [111.75, 2.85], SW6: [112.10, 2.93], SW7: [113.03, 3.18], SW8: [113.99, 4.40],
  BR1: [114.08, 4.59], BR2: [114.45, 4.25], BR3: [114.75, 4.05], BR4: [114.85, 4.45], BR5: [115.00, 4.85], SW9: [115.20, 4.83], SW10: [115.38, 4.90], SS: [115.45, 4.98],
  SS1: [115.55, 4.60], TRI: [115.60, 4.25],
  KB1: [115.20, 3.20], KB2: [114.60, 2.30], KB3: [113.80, 1.55], KB4: [112.50, 1.50], KB5: [111.80, 1.30], KB6: [111.20, 1.02], KB7: [110.50, 0.95], KB8: [110.00, 1.40], KB9: [109.68, 1.80],
};
const tt = s => s.split(' ').map(k => P_[k]);

/* ---------- 16 wilayah ----------
   pop juta (Banci 2020), luas km², kerusi Dewan Rakyat, kdnk RM bilion (anggaran nominal),
   etnik [Bumiputera, Cina, India, Lain-lain] % warganegara (anggaran), bandar % (anggaran),
   fit = kesesuaian jenis projek, banjir = risiko banjir 0..1, hutan = litupan hiasan peta */
const NEGERI = [
  { k: 'PLS', n: 'Perlis', ibu: 'Kangar', j: 'Negeri', g: 'Indera Kayangan', pop: .29, luas: 821, kerusi: 3, kdnk: 6.5, etnik: [89, 8, 1, 2], bandar: 54, tumbuh: .032, kerja: 3.4,
    ibuLL: [100.20, 6.44], label: [100.24, 6.53], banjir: .3, hutan: .08, sektor: 'Padi, perkhidmatan awam, sempadan Padang Besar',
    fit: { tek: .7, data: .6, port: .6, padi: 1.5, agro: .8, pel: .9, tenaga: 1.2, mg: 0, angkut: .8 },
    poli: [tt('TH0 TH1 PK1 WC18 WC19')] },
  { k: 'KDH', n: 'Kedah', ibu: 'Alor Setar', j: 'Negeri', g: 'Darul Aman', pop: 2.13, luas: 9492, kerusi: 15, kdnk: 62, etnik: [80, 12, 7, 1], bandar: 67, tumbuh: .036, kerja: 3.4,
    ibuLL: [100.37, 6.12], label: [100.68, 5.92], banjir: .3, hutan: .18, sektor: 'Jelapang padi, Taman Hi-Tech Kulim, pelancongan Langkawi',
    fit: { tek: 1.2, data: 1.0, port: .8, padi: 1.6, agro: .9, pel: 1.3, tenaga: 1.2, mg: 0, angkut: .9 },
    poli: [tt('TH1 TH2 TH3 TH4 TH5 KP3 KP2 KP1 PN3 PN2 PN1 WC16 WC17 WC18 PK1'), [[99.66, 6.40], [99.84, 6.46], [99.93, 6.33], [99.80, 6.21], [99.68, 6.27]]] },
  { k: 'PNG', n: 'Pulau Pinang', ibu: 'George Town', j: 'Negeri', g: 'Pulau Mutiara', pop: 1.74, luas: 1048, kerusi: 13, kdnk: 128, etnik: [45, 41, 10, 4], bandar: 92, tumbuh: .05, kerja: 2.6,
    ibuLL: [100.33, 5.41], label: [100.30, 5.36], banjir: .3, hutan: .05, sektor: 'Elektrik & elektronik, semikonduktor, pelancongan warisan',
    fit: { tek: 1.6, data: 1.1, port: 1.3, padi: .6, agro: .3, pel: 1.5, tenaga: .8, mg: 0, angkut: 1.3 },
    poli: [tt('WC16 PN1 PN2 PN3 WC14 WC15'), [[100.19, 5.47], [100.32, 5.46], [100.34, 5.31], [100.27, 5.23], [100.18, 5.28], [100.17, 5.40]]] },
  { k: 'PRK', n: 'Perak', ibu: 'Ipoh', j: 'Negeri', g: 'Darul Ridzuan', pop: 2.50, luas: 21035, kerusi: 24, kdnk: 100, etnik: [58, 29, 12, 1], bandar: 72, tumbuh: .037, kerja: 3.5,
    ibuLL: [101.08, 4.60], label: [101.02, 4.85], banjir: .35, hutan: .45, sektor: 'Pembuatan, pertanian, pelancongan, warisan bijih timah',
    fit: { tek: 1.0, data: .9, port: 1.0, padi: 1.2, agro: 1.1, pel: 1.1, tenaga: 1.1, mg: 0, angkut: 1.0 },
    poli: [tt('TH5 TH6 TH7 PKl1 PKl2 PKl3 PP1 PP2 PP3 PS2 PS1 WC11 WC12 WC13 WC14 PN3 KP1 KP2 KP3')] },
  { k: 'SGR', n: 'Selangor', ibu: 'Shah Alam', j: 'Negeri', g: 'Darul Ehsan', pop: 6.99, luas: 7951, kerusi: 22, kdnk: 470, etnik: [59, 28, 12, 1], bandar: 96, tumbuh: .05, kerja: 3.0,
    ibuLL: [101.52, 3.07], label: [101.32, 3.42], banjir: .4, hutan: .2, sektor: 'Pembuatan, logistik Pelabuhan Klang, KLIA, perkhidmatan',
    fit: { tek: 1.4, data: 1.5, port: 1.6, padi: 1.1, agro: .7, pel: 1.0, tenaga: .9, mg: 0, angkut: 1.4 },
    poli: [tt('WC11 PS1 PS2 PP3 SP1 SP2 SP3 SN1 SN2 WC8 WC9 WC10')],
    lubang: [[[101.61, 3.24], [101.76, 3.23], [101.76, 3.06], [101.67, 3.03], [101.60, 3.12]], [[101.66, 2.98], [101.73, 2.97], [101.72, 2.88], [101.65, 2.89]]] },
  { k: 'KUL', n: 'Kuala Lumpur', ibu: 'Kuala Lumpur', j: 'Wilayah Persekutuan', g: 'Ibu negara', pop: 1.98, luas: 243, kerusi: 11, kdnk: 285, etnik: [48, 41, 10, 1], bandar: 100, tumbuh: .045, kerja: 3.0,
    ibuLL: [101.69, 3.14], label: [101.69, 3.15], banjir: .3, hutan: 0, sektor: 'Kewangan, perkhidmatan, ibu pejabat syarikat, pelancongan',
    fit: { tek: 1.2, data: 1.2, port: 0, padi: 0, agro: 0, pel: 1.4, tenaga: .5, mg: 0, angkut: 1.6 },
    poli: [[[101.61, 3.24], [101.76, 3.23], [101.76, 3.06], [101.67, 3.03], [101.60, 3.12]]] },
  { k: 'PJY', n: 'Putrajaya', ibu: 'Putrajaya', j: 'Wilayah Persekutuan', g: 'Pusat pentadbiran', pop: .11, luas: 49, kerusi: 1, kdnk: 11, etnik: [98, 1, 1, 0], bandar: 100, tumbuh: .04, kerja: 2.5,
    ibuLL: [101.69, 2.93], label: [101.69, 2.92], banjir: .05, hutan: .1, sektor: 'Pentadbiran kerajaan persekutuan',
    fit: { tek: .8, data: .9, port: 0, padi: 0, agro: 0, pel: .9, tenaga: .8, mg: 0, angkut: 1.0 },
    poli: [[[101.66, 2.98], [101.73, 2.97], [101.72, 2.88], [101.65, 2.89]]] },
  { k: 'NSN', n: 'Negeri Sembilan', ibu: 'Seremban', j: 'Negeri', g: 'Darul Khusus', pop: 1.20, luas: 6686, kerusi: 8, kdnk: 65, etnik: [62, 21, 15, 2], bandar: 70, tumbuh: .04, kerja: 3.2,
    ibuLL: [101.94, 2.73], label: [102.16, 2.78], banjir: .2, hutan: .35, sektor: 'Pembuatan, logistik, pelancongan Port Dickson',
    fit: { tek: 1.1, data: 1.1, port: .9, padi: .8, agro: 1.0, pel: 1.0, tenaga: 1.0, mg: 0, angkut: 1.0 },
    poli: [tt('WC8 SN2 SN1 SP3 NP1 NP2 NJ NJ1 NMJ NM2 NM1 WC6 WC7')] },
  { k: 'MLK', n: 'Melaka', ibu: 'Bandaraya Melaka', j: 'Negeri', g: 'Negeri bersejarah', pop: 1.00, luas: 1664, kerusi: 6, kdnk: 56, etnik: [71, 22, 6, 1], bandar: 91, tumbuh: .04, kerja: 2.8,
    ibuLL: [102.25, 2.20], label: [102.28, 2.32], banjir: .2, hutan: .12, sektor: 'Pelancongan warisan UNESCO, pembuatan',
    fit: { tek: 1.0, data: .9, port: 1.0, padi: .7, agro: .6, pel: 1.5, tenaga: .9, mg: .8, angkut: 1.0 },
    poli: [tt('WC6 NM1 NM2 NMJ MJ1 WC4 WC5')] },
  { k: 'JHR', n: 'Johor', ibu: 'Johor Bahru', j: 'Negeri', g: "Darul Ta'zim", pop: 4.01, luas: 19166, kerusi: 26, kdnk: 175, etnik: [61, 32, 6, 1], bandar: 77, tumbuh: .055, kerja: 3.1,
    ibuLL: [103.76, 1.49], label: [103.30, 2.05], banjir: .5, hutan: .35, sektor: 'Pusat data, pembuatan, Pelabuhan Tanjung Pelepas, Pengerang, sawit',
    fit: { tek: 1.3, data: 1.6, port: 1.6, padi: .7, agro: 1.3, pel: 1.1, tenaga: 1.1, mg: 1.1, angkut: 1.2 },
    poli: [tt('WC4 MJ1 NMJ NJ1 NJ PJ1 PJ2 EC10 EC11 EC12 EC13 SC1 SC2 SC3 WC1 WC2 WC3')] },
  { k: 'PHG', n: 'Pahang', ibu: 'Kuantan', j: 'Negeri', g: 'Darul Makmur', pop: 1.59, luas: 35965, kerusi: 14, kdnk: 78, etnik: [79, 15, 4, 2], bandar: 52, tumbuh: .037, kerja: 3.3,
    ibuLL: [103.33, 3.82], label: [102.55, 3.75], banjir: .8, hutan: .75, sektor: 'Sawit, pelancongan tanah tinggi, Pelabuhan Kuantan, bauksit',
    fit: { tek: .9, data: .8, port: 1.2, padi: .9, agro: 1.4, pel: 1.3, tenaga: 1.2, mg: .6, angkut: 1.0 },
    poli: [tt('PKl3 KlP1 KlP2 KlP3 TP1 TP2 TP3 EC6 EC7 EC8 EC9 EC10 PJ2 PJ1 NJ NP2 NP1 SP3 SP2 SP1 PP3 PP2 PP1')] },
  { k: 'TRG', n: 'Terengganu', ibu: 'Kuala Terengganu', j: 'Negeri', g: 'Darul Iman', pop: 1.15, luas: 13035, kerusi: 8, kdnk: 42, etnik: [97, 2, 0, 1], bandar: 66, tumbuh: .034, kerja: 3.9,
    ibuLL: [103.14, 5.33], label: [102.95, 4.95], banjir: .85, hutan: .6, sektor: 'Minyak & gas Kerteh, perikanan, pelancongan pulau',
    fit: { tek: .8, data: .7, port: 1.0, padi: 1.0, agro: 1.0, pel: 1.2, tenaga: 1.1, mg: 1.5, angkut: .9 },
    poli: [tt('EC2 EC3 EC4 EC5 EC6 TP3 TP2 TP1 KlP3 KT3 KT2 KT1')] },
  { k: 'KTN', n: 'Kelantan', ibu: 'Kota Bharu', j: 'Negeri', g: 'Darul Naim', pop: 1.79, luas: 15099, kerusi: 14, kdnk: 33, etnik: [95, 3, 0, 2], bandar: 44, tumbuh: .032, kerja: 4.3,
    ibuLL: [102.24, 6.13], label: [101.98, 5.30], banjir: .9, hutan: .6, sektor: 'Pertanian, kraf tangan, perdagangan sempadan',
    fit: { tek: .7, data: .6, port: .6, padi: 1.3, agro: 1.0, pel: 1.0, tenaga: 1.0, mg: 0, angkut: .8 },
    poli: [tt('TH7 TH8 TH9 TH10 EC1 EC2 KT1 KT2 KT3 KlP3 KlP2 KlP1 PKl3 PKl2 PKl1')] },
  { k: 'SBH', n: 'Sabah', ibu: 'Kota Kinabalu', j: 'Negeri', g: 'Negeri di Bawah Bayu', pop: 3.42, luas: 73904, kerusi: 25, kdnk: 103, etnik: [84, 9, 0, 7], bandar: 55, tumbuh: .03, kerja: 5.8,
    ibuLL: [116.07, 5.98], label: [117.10, 5.30], banjir: .3, hutan: .8, sektor: 'Sawit, minyak & gas, eko-pelancongan Kinabalu, perikanan',
    fit: { tek: .7, data: .7, port: 1.2, padi: .8, agro: 1.6, pel: 1.5, tenaga: 1.1, mg: 1.3, angkut: 1.2 },
    poli: [[P_.SS, [115.55, 5.10], [115.75, 5.55], [116.05, 6.00], [116.45, 6.45], [116.73, 7.03], [116.95, 6.75], [117.30, 6.65], [117.70, 6.40], [118.12, 5.85], [118.55, 5.40], [119.25, 5.20], [118.80, 4.95], [118.35, 4.95], [118.62, 4.45], [117.90, 4.25], [117.60, 4.17], [117.00, 4.25], [116.20, 4.30], [115.85, 4.35], P_.TRI, P_.SS1]] },
  { k: 'SWK', n: 'Sarawak', ibu: 'Kuching', j: 'Negeri', g: 'Bumi Kenyalang', pop: 2.45, luas: 124450, kerusi: 31, kdnk: 175, etnik: [75, 24, 0, 1], bandar: 57, tumbuh: .04, kerja: 3.6,
    ibuLL: [110.35, 1.55], label: [112.90, 2.45], banjir: .4, hutan: .9, sektor: 'LNG Bintulu, tenaga hidro, sawit, balak, ekonomi hijau',
    fit: { tek: 1.1, data: 1.0, port: 1.2, padi: .8, agro: 1.5, pel: 1.2, tenaga: 1.8, mg: 1.5, angkut: 1.2 },
    poli: [tt('SW1 SW2 SW3 SW4 SW5 SW6 SW7 SW8 BR1 BR2 BR3 BR4 BR5 SW9 SW10 SS SS1 TRI KB1 KB2 KB3 KB4 KB5 KB6 KB7 KB8 KB9')] },
  { k: 'LBN', n: 'Labuan', ibu: 'Bandar Labuan', j: 'Wilayah Persekutuan', g: 'Pusat kewangan luar pesisir', pop: .095, luas: 91, kerusi: 1, kdnk: 7, etnik: [82, 12, 1, 5], bandar: 89, tumbuh: .035, kerja: 3.5,
    ibuLL: [115.24, 5.28], label: [115.22, 5.31], banjir: .1, hutan: .2, sektor: 'Kewangan luar pesisir (IBFC), sokongan minyak & gas, pelabuhan',
    fit: { tek: .8, data: .8, port: 1.1, padi: 0, agro: 0, pel: 1.0, tenaga: .8, mg: 1.0, angkut: .7 },
    poli: [[[115.17, 5.38], [115.27, 5.36], [115.28, 5.25], [115.20, 5.22], [115.15, 5.30]]] },
];
const NEG = Object.fromEntries(NEGERI.map(n => [n.k, n]));
const JUMLAH_KERUSI = NEGERI.reduce((a, n) => a + n.kerusi, 0);   // 222

/* negara jiran untuk peta (warna pudar) */
const JIRAN = [
  { n: 'Thailand', label: [101.0, 7.35], poli: [[...tt('TH10 TH9 TH8 TH7 TH6 TH5 TH4 TH3 TH2 TH1 TH0'), [99.75, 7.20], [99.80, 8.60], [100.35, 8.60], [100.65, 7.30], [101.40, 6.95]]] },
  { n: 'Singapura', label: [103.83, 1.25], poli: [[[103.62, 1.33], [103.75, 1.41], [103.92, 1.40], [104.05, 1.36], [103.98, 1.28], [103.80, 1.26], [103.65, 1.27]]] },
  { n: 'Indonesia', label: [101.2, 0.4], poli: [[[95.3, 5.6], [97.5, 5.2], [98.7, 3.8], [100.3, 2.2], [101.4, 1.75], [102.5, 1.05], [103.4, 0.6], [104.5, -1.0], [106.0, -3.0], [105.8, -5.8], [104.5, -5.9], [102.3, -4.0], [100.4, -1.0], [98.8, 1.7], [97.0, 3.5], [95.2, 5.4]],
    [P_.SW1, ...tt('KB9 KB8 KB7 KB6 KB5 KB4 KB3 KB2 KB1 TRI'), [115.85, 4.35], [116.20, 4.30], [117.00, 4.25], [117.60, 4.17], [117.90, 3.50], [118.10, 1.00], [117.00, -1.00], [116.50, -3.50], [114.50, -4.00], [111.00, -3.00], [110.00, -1.50], [109.00, 0.00], [109.20, 1.50]],
    [[103.95, 1.15], [104.15, 1.18], [104.20, 1.02], [104.00, .98]], [[104.30, 1.18], [104.60, 1.15], [104.62, .95], [104.35, .95]]], label2: [113.0, 0.2] },
  { n: 'Brunei', label: [114.70, 4.62], poli: [[P_.BR1, [114.55, 4.85], [114.85, 5.00], [115.07, 5.03], [115.02, 4.90], P_.BR5, P_.BR4, P_.BR3, P_.BR2]] },
  { n: 'Filipina', label: [118.6, 8.6], poli: [[[117.05, 8.0], [117.6, 8.6], [118.4, 9.5], [118.9, 9.9], [119.2, 9.6], [118.2, 8.5], [117.3, 7.85]], [[119.8, 5.9], [120.5, 6.1], [120.6, 5.8], [119.9, 5.65]], [[121.0, 6.0], [121.4, 6.15], [121.3, 5.85]]] },
];

/* ---------- negara untuk diplomasi ----------
   h = hubungan awal, w = keutamaan tersembunyi dalam rundingan [tarif, perkhidmatan, pelaburan, buruh/alam sekitar] */
const NEGARA = [
  { k: 'SG', n: 'Singapura', blok: 'ASEAN', h: 72, w: [2, 5, 4, 2], arah: [103.8, 1.3], petunjuk: 'Singapura amat mementingkan akses perkhidmatan dan kewangan, juga pelaburan rentas tambak.', isu: 'Air Johor, RTS Link, pekerja rentas sempadan' },
  { k: 'ID', n: 'Indonesia', blok: 'ASEAN', h: 70, w: [3, 2, 3, 5], arah: [106.8, -6.2], petunjuk: 'Jakarta sangat sensitif tentang kebajikan pekerja migrannya.', isu: 'Pekerja migran, jerebu, sempadan maritim' },
  { k: 'TH', n: 'Thailand', blok: 'ASEAN', h: 66, w: [4, 2, 3, 3], arah: [100.5, 13.7], petunjuk: 'Bangkok mahukan tarif lebih rendah untuk produk pertanian dan automotifnya.', isu: 'Keselamatan sempadan, perdagangan getah' },
  { k: 'BN', n: 'Brunei', blok: 'ASEAN', h: 80, w: [2, 3, 4, 2], arah: [114.9, 4.9], petunjuk: 'Brunei berminat dengan pelaburan bersama dan rangkaian jalan Pan Borneo.', isu: 'Pan Borneo, tenaga' },
  { k: 'PH', n: 'Filipina', blok: 'ASEAN', h: 56, w: [3, 2, 2, 4], arah: [121.0, 14.6], petunjuk: 'Manila menumpukan kebajikan pekerja dan keselamatan maritim Sulu.', isu: 'Keselamatan Laut Sulu, tuntutan Sabah' },
  { k: 'VN', n: 'Vietnam', blok: 'ASEAN', h: 62, w: [4, 2, 3, 2], arah: [105.8, 21.0], petunjuk: 'Hanoi mahu akses pasaran untuk barangan pembuatannya.', isu: 'Perikanan, Laut China Selatan' },
  { k: 'CN', n: 'China', blok: 'Asia', h: 66, w: [3, 2, 5, 1], arah: [116.4, 39.9], petunjuk: 'Beijing paling berminat dengan peluang pelaburan infrastruktur dan kenderaan elektrik.', isu: 'Rakan dagang terbesar, Laut China Selatan, ECRL' },
  { k: 'US', n: 'Amerika Syarikat', blok: 'Barat', h: 62, w: [3, 4, 3, 4], arah: [-77.0, 38.9], petunjuk: 'Washington menekankan perlindungan harta intelek, standard buruh dan akses perkhidmatan.', isu: 'Semikonduktor, kawalan eksport, tarif' },
  { k: 'JP', n: 'Jepun', blok: 'Asia', h: 76, w: [2, 3, 5, 3], arah: [139.7, 35.7], petunjuk: 'Tokyo mahu kestabilan untuk pelaburan teknologi jangka panjang.', isu: 'Dasar Pandang ke Timur, teknologi hijau' },
  { k: 'KR', n: 'Korea Selatan', blok: 'Asia', h: 66, w: [3, 3, 4, 2], arah: [127.0, 37.6], petunjuk: 'Seoul berminat dengan pasaran bateri dan kandungan kreatif.', isu: 'Perjanjian perdagangan, bateri EV' },
  { k: 'IN', n: 'India', blok: 'Asia', h: 60, w: [5, 3, 2, 2], arah: [77.2, 28.6], petunjuk: 'New Delhi mahu tarif lebih rendah, terutama minyak sawit dan perkhidmatan IT.', isu: 'Minyak sawit, perkhidmatan IT' },
  { k: 'SA', n: 'Arab Saudi', blok: 'Asia Barat', h: 70, w: [2, 2, 4, 1], arah: [46.7, 24.7], petunjuk: 'Riyadh mencari peluang pelaburan dana kekayaan berdaulat.', isu: 'Pelaburan, kuota haji, tenaga' },
  { k: 'EU', n: 'Kesatuan Eropah', blok: 'Barat', h: 52, w: [3, 3, 2, 5], arah: [4.35, 50.85], petunjuk: 'Brussels hanya bergerak jika ada komitmen alam sekitar dan buruh yang jelas.', isu: 'Peraturan penebangan hutan (EUDR), minyak sawit' },
  { k: 'AU', n: 'Australia', blok: 'Barat', h: 64, w: [4, 3, 3, 3], arah: [149.1, -35.3], petunjuk: 'Canberra seimbang, tetapi peka pada tarif pertanian.', isu: 'Pendidikan, keselamatan serantau' },
];
const NEGARA_K = Object.fromEntries(NEGARA.map(n => [n.k, n]));
const ISU_RUNDING = [
  { n: 'Turunkan tarif import', kos: 'Petani & industri tempatan kurang senang', sok: { agro: -2 } },
  { n: 'Buka sektor perkhidmatan', kos: 'Profesional bandar risau persaingan', sok: { bandar: -2 } },
  { n: 'Insentif pelaburan', kos: 'Kos RM 1.5 bilion daripada perbendaharaan', rm: -1.5 },
  { n: 'Standard buruh & alam sekitar', kos: 'Pertumbuhan industri perlahan sedikit', tumbuh: -.001 },
];
const HASIL_RUNDING = [
  { k: 'pelaburan', n: 'Pelaburan langsung', perlu: 45, d: 'Syarikat mereka membuka kilang baharu di negeri pilihan kau.' },
  { k: 'fta', n: 'Perjanjian perdagangan bebas', perlu: 65, d: 'Eksport meningkat; pertumbuhan nasional naik secara kekal.' },
  { k: 'teknologi', n: 'Pemindahan teknologi', perlu: 80, d: 'Teknologi tinggi memacu ekonomi digital dan hijau.' },
];

/* ---------- projek ---------- */
const T_PROJEK = [1, 3, 8, 20, 45];
const PROJEK = {
  sekolah: { n: 'Sekolah & Kolej', kat: 'Sosial', kos: 1.2, tb: 20, fit: null, buka: 1, sok: 1.1, tumbuh: .0012, upkeep: .03, ikon: 'sekolah', d: 'Pendidikan berkualiti menaikkan pendapatan jangka panjang dan sokongan keluarga.' },
  hospital: { n: 'Hospital & Klinik', kat: 'Sosial', kos: 1.6, tb: 25, fit: null, buka: 1, sok: 1.3, upkeep: .05, ikon: 'hospital', d: 'Rakyat lebih sihat. Mengurangkan kesan wabak.' },
  rumah: { n: 'Rumah Mampu Milik', kat: 'Sosial', kos: 1.4, tb: 20, fit: null, buka: 1, sok: 1.2, bandar: true, upkeep: .02, ikon: 'rumah', d: 'Paling berkesan di negeri yang ramai penduduk bandar.' },
  tebatan: { n: 'Tebatan Banjir', kat: 'Sosial', kos: 1.5, tb: 25, fit: null, buka: 1, sok: .4, banjir: true, upkeep: .02, ikon: 'tebatan', d: 'Mengurangkan kerosakan dan kemarahan rakyat ketika banjir monsun.' },
  padi: { n: 'Pertanian Pintar', kat: 'Ekonomi', kos: 1.0, tb: 15, fit: 'padi', buka: 1, sok: .6, tumbuh: .0015, makanan: 1, upkeep: .01, ikon: 'padi', d: 'Meningkatkan hasil padi dan jaminan makanan negara.' },
  pelancongan: { n: 'Pelancongan', kat: 'Ekonomi', kos: 1.8, tb: 20, fit: 'pel', buka: 1, tumbuh: .002, hasil: .14, upkeep: .02, ikon: 'pelancongan', d: 'Menjana hasil setiap minit. Terbaik di negeri bertarikan semula jadi atau warisan.' },
  pelabuhan: { n: 'Pelabuhan & Logistik', kat: 'Ekonomi', kos: 4, tb: 40, fit: 'port', buka: 2, tumbuh: .003, hasil: .26, upkeep: .05, ikon: 'pelabuhan', d: 'Hab perdagangan Selat Melaka. Menjana hasil yang besar.' },
  agro: { n: 'Ladang & Agro-komoditi', kat: 'Ekonomi', kos: 1.5, tb: 20, fit: 'agro', buka: 2, tumbuh: .002, hasil: .12, upkeep: .01, eu: -1, ikon: 'agro', d: 'Sawit dan getah. Kesatuan Eropah kurang senang kecuali dasar sawit lestari aktif.' },
  minyak: { n: 'Minyak & Gas', kat: 'Ekonomi', kos: 6, tb: 50, fit: 'mg', buka: 2, tumbuh: .003, hasil: .4, upkeep: .06, hijau: -1, ikon: 'minyak', d: 'Hasil paling besar, tetapi menjauhkan sasaran sifar bersih.' },
  tenaga: { n: 'Tenaga Boleh Baharu', kat: 'Ekonomi', kos: 3, tb: 35, fit: 'tenaga', buka: 2, tumbuh: .0015, hijau: 2, upkeep: .02, ikon: 'tenaga', d: 'Solar dan hidro. Mendekatkan sasaran tenaga hijau, disukai Jepun dan Eropah.' },
  teknologi: { n: 'Taman Teknologi E&E', kat: 'Ekonomi', kos: 3, tb: 35, fit: 'tek', buka: 3, tumbuh: .0042, hasil: .2, upkeep: .04, ikon: 'teknologi', d: 'Semikonduktor dan elektronik. Pertumbuhan tinggi di negeri yang sesuai.' },
  pusatdata: { n: 'Pusat Data', kat: 'Ekonomi', kos: 4, tb: 40, fit: 'data', buka: 3, tumbuh: .0035, hasil: .22, upkeep: .05, tenagaPerlu: 1, ikon: 'pusatdata', d: 'Ekonomi digital. Perlukan tenaga yang banyak.' },
  angkutan: { n: 'Transit Awam', kat: 'Sosial', kos: 3.5, tb: 35, fit: 'angkut', buka: 4, sok: 1.0, bandar: true, tumbuh: .002, upkeep: .05, ikon: 'angkutan', d: 'LRT, bas dan rel bandar. Mengurangkan kesesakan.' },
};
/* projek mega: merentas negeri, satu kali bina */
const MEGA = {
  ecrl: { n: 'Laluan Rel Pantai Timur (ECRL)', negeri: ['KTN', 'TRG', 'PHG', 'SGR'], kos: 40, tb: 600, buka: 4, tumbuh: .006, sok: 5, laluan: [[102.24, 6.13], [103.14, 5.33], [103.35, 4.25], [103.33, 3.82], [102.40, 3.50], [101.72, 3.25], [101.39, 3.00]], d: 'Rel menghubungkan Kota Bharu, Kuala Terengganu dan Kuantan ke Pelabuhan Klang.' },
  panborneo: { n: 'Lebuhraya Pan Borneo', negeri: ['SWK', 'SBH'], kos: 30, tb: 600, buka: 4, tumbuh: .006, sok: 6, laluan: [[110.35, 1.55], [111.82, 2.30], [113.04, 3.17], [113.99, 4.40], [115.40, 4.88], [116.07, 5.98], [117.0, 6.6], [118.12, 5.84], [117.89, 4.25]], d: 'Lebuh raya menghubungkan bandar utama Sarawak dan Sabah.' },
  rts: { n: 'RTS Link Johor Bahru–Singapura', negeri: ['JHR'], kos: 10, tb: 300, buka: 5, tumbuh: .005, sok: 3, syaratNegara: ['SG', 65], laluan: [[103.76, 1.47], [103.80, 1.43]], d: 'Transit rentas sempadan. Memerlukan hubungan baik dengan Singapura.' },
  mrt3: { n: 'MRT Laluan Lingkaran', negeri: ['KUL', 'SGR'], kos: 30, tb: 480, buka: 3, tumbuh: .004, sok: 5, bulatan: [101.69, 3.13, .16], d: 'Laluan lingkaran mengelilingi Lembah Klang.' },
  lrtpg: { n: 'LRT Pulau Pinang', negeri: ['PNG'], kos: 10, tb: 300, buka: 3, tumbuh: .004, sok: 6, laluan: [[100.36, 5.36], [100.31, 5.37], [100.28, 5.30], [100.27, 5.26]], d: 'Rel ringan dari Seberang Perai ke George Town dan Bayan Lepas.' },
};

/* ---------- Pusat Pentadbiran Putrajaya: tahap = fasa ---------- */
const FASA = [
  { n: 'Penggal Pertama', kos: 0, tb: 0 },
  { n: 'Pemulihan Ekonomi', kos: 15, tb: 60, syarat: null },
  { n: 'Ekonomi Digital', kos: 30, tb: 180, syarat: s => s.stat.projek >= 8 ? null : 'Siapkan 8 projek' },
  { n: 'Rangkaian Nasional', kos: 50, tb: 420, syarat: s => s.perjanjian.length >= 1 ? null : 'Meterai 1 perjanjian antarabangsa' },
  { n: 'Ekonomi Hijau', kos: 75, tb: 900, syarat: s => s.stat.pru >= 1 ? null : 'Menang 1 PRU' },
  { n: 'Hab Serantau', kos: 100, tb: 1500, syarat: s => s.mega.length >= 1 ? null : 'Siapkan 1 projek mega' },
  { n: 'Negara Maju', kos: 140, tb: 2400, syarat: s => s.perjanjian.length >= 3 ? null : 'Meterai 3 perjanjian antarabangsa' },
];

/* ---------- dasar ---------- */
const DASAR = {
  sst: { n: 'Cukai Jualan & Perkhidmatan', pilihan: ['6%', '8%', '10%'], awal: 1, mp: 6, d: 'Lebih tinggi menambah hasil tetapi menaikkan inflasi dan kemarahan pengguna.' },
  subsidi: { n: 'Subsidi Bahan Api', pilihan: ['Pukal', 'Separa bersasar', 'Bersasar', 'Harga pasaran'], awal: 1, mp: 10, d: 'Subsidi pukal popular tetapi sangat mahal dan turut dinikmati golongan kaya serta warga asing.' },
  bantuan: { n: 'Bantuan Tunai Rakyat', pilihan: ['Rendah', 'Sederhana', 'Tinggi'], awal: 1, mp: 4, d: 'Menampan kos sara hidup B40, terutamanya apabila subsidi dikurangkan.' },
  gaji: { n: 'Gaji Minimum', pilihan: ['RM1,500', 'RM1,700', 'RM2,000'], awal: 1, mp: 6, d: 'Lebih tinggi menaikkan sokongan pekerja tetapi menambah kos majikan dan sedikit pengangguran.' },
  asing: { n: 'Kuota Pekerja Asing', pilihan: ['Longgar', 'Sederhana', 'Ketat'], awal: 1, mp: 5, d: 'Longgar mempercepat industri; ketat membuka peluang kerja rakyat tempatan tetapi melambatkan pertumbuhan.' },
  didik: { n: 'Peruntukan Pendidikan', pilihan: ['Biasa', 'Tinggi'], awal: 0, mp: 4, d: 'Pelaburan jangka panjang dalam modal insan. Menambah perbelanjaan.' },
  sawit: { n: 'Sawit Lestari (MSPO Ketat)', pilihan: ['Tidak', 'Ya'], awal: 0, mp: 5, d: 'Memulihkan hubungan dengan Eropah. Pertumbuhan agro sedikit perlahan.' },
  ma63: { n: 'Hak MA63 Sabah & Sarawak', pilihan: ['Status quo', 'Desentralisasi'], awal: 0, mp: 14, perlembagaan: true, d: 'Menyerahkan lebih kuasa dan hasil kepada Sabah dan Sarawak mengikut Perjanjian Malaysia 1963. Pindaan perlembagaan memerlukan dua pertiga Dewan Rakyat (148 kerusi).' },
};

/* ---------- peristiwa ----------
   bulan = bulan kalendar 0..11 yang dibenarkan, negeri = calon negeri sasaran, p = peluang relatif.
   kesan: rm, mp, pg, sok (semua negeri), sokN (negeri sasaran), sokL {kod: n}, perpaduan, inflasi, tumbuh (12 bulan), tumbuhN, hub {kod: n}, hutang
   nasihat [ekonomi, sosial, politik]: 1 sokong, -1 bantah, 0 neutral */
const PERISTIWA = [
  { k: 'banjir', t: 'Banjir Monsun', bulan: [10, 11, 0], negeri: ['KTN', 'TRG', 'PHG', 'JHR'], p: 3,
    teks: n => `Hujan lebat monsun timur laut menenggelamkan beberapa daerah di ${n}. Ribuan mangsa dipindahkan ke pusat pemindahan sementara.`,
    pilihan: [
      { t: 'Bantuan segera RM3 bilion dan kerahkan ATM', kesan: { rm: -3, sokN: 8 }, banjir: true, nasihat: [-1, 1, 1] },
      { t: 'NADMA dengan peruntukan RM1 bilion', kesan: { rm: -1, sokN: 2 }, banjir: true, nasihat: [1, 0, 0] },
      { t: 'Serahkan kepada kerajaan negeri', kesan: { sokN: -9, perpaduan: -1 }, banjir: true, nasihat: [1, -1, -1] }] },
  { k: 'jerebu', t: 'Jerebu Rentas Sempadan', bulan: [6, 7, 8, 9], p: 2,
    teks: () => 'Indeks Pencemaran Udara melepasi paras tidak sihat di Lembah Klang dan Sarawak. Titik panas dikesan di seberang Selat.',
    pilihan: [
      { t: 'Hantar nota bantahan kepada Indonesia', kesan: { hub: { ID: -5 }, sok: 1 }, nasihat: [0, 1, 1] },
      { t: 'Tawarkan bantuan pemadam kebakaran dan dorong perjanjian jerebu ASEAN', kesan: { pg: -4, hub: { ID: 4 }, rm: -.3 }, nasihat: [0, 1, 0] },
      { t: 'Pembenihan awan dan agihan pelitup muka', kesan: { rm: -.5, sok: .5 }, nasihat: [-1, 1, 0] }] },
  { k: 'beras', t: 'Harga Beras Import Melonjak', p: 2,
    teks: () => 'Negara pengeksport beras menyekat eksport. Harga beras import di pasaran naik hampir 30%, dan rakyat berebut membeli beras tempatan.',
    pilihan: [
      { t: 'Subsidi harga beras import (RM2 bilion)', kesan: { rm: -2, inflasi: -.3, sok: 1.5 }, nasihat: [-1, 1, 1] },
      { t: 'Tingkatkan tanaman padi tempatan: diskaun 50% projek Pertanian Pintar', kesan: { sok: -1 }, diskaun: 'padi', nasihat: [1, 0, -1] },
      { t: 'Kawal harga siling', kesan: { inflasi: -.2, tumbuh: -.002, sok: .5 }, nasihat: [-1, 0, 1] }] },
  { k: 'minyakNaik', t: 'Harga Minyak Dunia Naik', p: 2,
    teks: () => 'Konflik di Asia Barat menaikkan harga minyak mentah melebihi USD100 setong. Hasil petroleum meningkat, tetapi kos subsidi bahan api turut melambung.',
    pilihan: [
      { t: 'Kekalkan harga runcit; tanggung kos subsidi', kesan: { rm: -2, sok: 1 }, nasihat: [-1, 1, 1] },
      { t: 'Gunakan hasil tambahan untuk kurangkan hutang', kesan: { hutang: -8, sok: -1 }, nasihat: [1, -1, -1] },
      { t: 'Simpan dalam dana kekayaan negara', kesan: { rm: 6, sok: -.5 }, nasihat: [1, 0, 0] }] },
  { k: 'ringgit', t: 'Ringgit Melemah', p: 1.5,
    teks: () => 'Kadar faedah global naik dan dana asing keluar. Ringgit jatuh ke paras terendah dalam beberapa tahun. Eksport lebih kompetitif tetapi harga barangan import naik.',
    pilihan: [
      { t: 'Galakkan syarikat berkaitan kerajaan bawa pulang dana', kesan: { inflasi: -.3, mp: -3 }, nasihat: [1, 0, -1] },
      { t: 'Promosi eksport dan pelancongan', kesan: { rm: -1, tumbuh: .003 }, nasihat: [1, 0, 0] },
      { t: 'Biarkan pasaran menentukan', kesan: { inflasi: .6, tumbuh: .002, sok: -1 }, nasihat: [0, -1, -1] }] },
  { k: 'cip', t: 'Gergasi Semikonduktor Mahu Melabur', p: 2, pilihNegeri: ['PNG', 'KDH', 'JHR', 'SWK'],
    teks: () => 'Syarikat cip dari Amerika Syarikat merancang kilang bernilai berbilion ringgit di Asia Tenggara. Kau boleh menawarkan satu lokasi. Pilihan negeri yang sesuai menentukan kejayaan.',
    pilihan: [
      { t: 'Tawarkan Pulau Pinang', negeri: 'PNG', kesan: { hub: { US: 3 } }, fdi: 'teknologi', nasihat: [1, 0, 0] },
      { t: 'Tawarkan Kedah (Kulim)', negeri: 'KDH', kesan: { hub: { US: 3 } }, fdi: 'teknologi', nasihat: [0, 1, 1] },
      { t: 'Tawarkan Johor', negeri: 'JHR', kesan: { hub: { US: 3 } }, fdi: 'teknologi', nasihat: [1, 0, 0] },
      { t: 'Tawarkan Sarawak', negeri: 'SWK', kesan: { hub: { US: 3 } }, fdi: 'teknologi', nasihat: [-1, 1, 1] }] },
  { k: 'pusatdataCN', t: 'Pelaburan Pusat Data Gergasi', p: 1.5,
    teks: () => 'Syarikat teknologi China dan Amerika bersaing membina pusat data di Johor. Kedua-duanya mahukan bekalan elektrik dan air yang besar.',
    pilihan: [
      { t: 'Terima pelabur China', kesan: { hub: { CN: 5, US: -4 } }, fdi: 'pusatdata', negeri: 'JHR', nasihat: [1, 0, 0] },
      { t: 'Terima pelabur Amerika', kesan: { hub: { US: 5, CN: -4 } }, fdi: 'pusatdata', negeri: 'JHR', nasihat: [1, 0, 0] },
      { t: 'Terima kedua-duanya dengan syarat tenaga hijau', kesan: { hub: { US: 2, CN: 2 }, rm: -2 }, fdi: 'pusatdata', negeri: 'JHR', perluHijau: true, nasihat: [0, 1, 1] }] },
  { k: 'lcs', t: 'Insiden di Beting Patinggi Ali', p: 1.5,
    teks: () => 'Kapal pengawal pantai asing berlegar berhampiran Beting Patinggi Ali (Luconia Shoals) di luar pesisir Sarawak, mengganggu operasi minyak dan gas.',
    pilihan: [
      { t: 'Hantar nota bantahan rasmi dan rondaan Maritim', kesan: { hub: { CN: -6 }, sok: 2, sokL: { SWK: 4 } }, nasihat: [-1, 0, 1] },
      { t: 'Diplomasi senyap secara dua hala', kesan: { hub: { CN: 2 }, sokL: { SWK: -3 } }, nasihat: [1, 0, -1] },
      { t: 'Bawa ke meja ASEAN untuk Kod Tatalaku', kesan: { pg: -5, hub: { CN: -1, VN: 3, PH: 3, ID: 2 } }, nasihat: [0, 0, 1] }] },
  { k: 'air', t: 'Rundingan Harga Air Johor', p: 1, syarat: s => s.hubungan.SG > 40,
    teks: () => 'Johor membekalkan air mentah kepada Singapura di bawah perjanjian 1962 yang tamat pada 2061. Kerajaan Johor mendesak harga disemak.',
    pilihan: [
      { t: 'Desak semakan harga segera', kesan: { hub: { SG: -6 }, sokL: { JHR: 6 }, rm: 1 }, nasihat: [1, 0, 1] },
      { t: 'Kaitkan dengan kerjasama RTS Link dan zon ekonomi', kesan: { pg: -4, hub: { SG: 3 }, sokL: { JHR: 2 } }, nasihat: [1, 0, 0] },
      { t: 'Kekalkan status quo', kesan: { hub: { SG: 2 }, sokL: { JHR: -4 } }, nasihat: [0, 0, -1] }] },
  { k: 'eudr', t: 'Peraturan Penebangan Hutan Eropah', p: 1.5,
    teks: () => 'Kesatuan Eropah mewajibkan bukti bahawa minyak sawit tidak berasal daripada tanah yang ditebang. Pekebun kecil di Sabah, Sarawak dan Pahang bimbang.',
    pilihan: [
      { t: 'Bantah di Pertubuhan Perdagangan Dunia', kesan: { hub: { EU: -6 }, sokL: { SBH: 3, SWK: 3, PHG: 2 } }, nasihat: [0, 0, 1] },
      { t: 'Bantu pekebun kecil memenuhi syarat ketertelusan (RM1 bilion)', kesan: { rm: -1, hub: { EU: 6 }, sokL: { SBH: 1, SWK: 1 } }, nasihat: [0, 1, 0] },
      { t: 'Alihkan eksport ke India dan China', kesan: { hub: { IN: 4, CN: 3, EU: -2 }, pg: -3 }, nasihat: [1, 0, 0] }] },
  { k: 'bakat', t: 'Penghijrahan Bakat', p: 1.5,
    teks: () => 'Laporan menunjukkan ratusan ribu rakyat Malaysia berkemahiran tinggi bekerja di Singapura dan luar negara kerana gaji lebih tinggi.',
    pilihan: [
      { t: 'Insentif cukai untuk pakar yang pulang (RM1 bilion)', kesan: { rm: -1, tumbuh: .002 }, nasihat: [1, 0, 0] },
      { t: 'Program kemahiran dan gaji progresif', kesan: { rm: -1.5, sok: 1 }, nasihat: [0, 1, 1] },
      { t: 'Biarkan; kiriman wang pulang juga menyumbang', kesan: { tumbuh: -.002 }, nasihat: [-1, -1, 0] }] },
  { k: 'perkauman', t: 'Ketegangan di Media Sosial', p: 2,
    teks: () => 'Video tular berunsur perkauman mencetuskan perbalahan dalam talian. Pemimpin masyarakat menggesa kerajaan bertindak.',
    pilihan: [
      { t: 'Program dialog antara kaum dan agama (RM0.5 bilion)', kesan: { rm: -.5, perpaduan: 6 }, nasihat: [0, 1, 1] },
      { t: 'Tindakan undang-undang tegas terhadap penyebar', kesan: { perpaduan: 3, mp: -2 }, nasihat: [0, 1, 0] },
      { t: 'Biarkan reda sendiri', kesan: { perpaduan: -8, sok: -1 }, nasihat: [0, -1, -1] }] },
  { k: 'skandal', t: 'Dakwaan Rasuah di Kementerian', p: 1.5,
    teks: () => 'Laporan audit mendedahkan perolehan bernilai ratusan juta ringgit tanpa tender terbuka di sebuah kementerian.',
    pilihan: [
      { t: 'Serahkan kepada SPRM untuk siasatan bebas', kesan: { mp: -5, sok: 3 }, nasihat: [1, 1, -1] },
      { t: 'Menteri berkenaan diarah bercuti', kesan: { mp: -8, sok: 5 }, nasihat: [0, 1, 0] },
      { t: 'Nafikan dan teruskan', kesan: { mp: 3, sok: -7, perpaduan: -2 }, nasihat: [-1, -1, 1] }] },
  { k: 'meleset', t: 'Kemelesetan Ekonomi Global', p: 1,
    teks: () => 'Permintaan eksport merudum apabila ekonomi utama dunia meleset. Kilang di Pulau Pinang, Johor dan Selangor mula mengurangkan syif.',
    pilihan: [
      { t: 'Pakej rangsangan besar (RM10 bilion)', kesan: { rm: -10, tumbuh: -.004, sok: 2 }, nasihat: [0, 1, 1] },
      { t: 'Rangsangan bersasar untuk PKS (RM4 bilion)', kesan: { rm: -4, tumbuh: -.01 }, nasihat: [1, 0, 0] },
      { t: 'Berjimat; kawal defisit', kesan: { tumbuh: -.018, sok: -3 }, nasihat: [1, -1, -1] }] },
  { k: 'pelancong', t: 'Tahun Melawat Malaysia', p: 1.2,
    teks: () => 'Kempen pelancongan antarabangsa boleh menarik jutaan pengunjung ke Malaysia jika dipromosi dengan baik.',
    pilihan: [
      { t: 'Promosi besar-besaran (RM1.5 bilion)', kesan: { rm: -1.5 }, bonusHasil: 'pelancongan', nasihat: [1, 0, 1] },
      { t: 'Promosi digital berskala kecil (RM0.3 bilion)', kesan: { rm: -.3 }, bonusHasil: 'pelancongankecil', nasihat: [1, 0, 0] },
      { t: 'Tiada peruntukan tambahan', kesan: {}, nasihat: [0, 0, -1] }] },
  { k: 'pekerja', t: 'Isu Pekerja Migran', p: 1.5,
    teks: () => 'Laporan media antarabangsa mendakwa sebahagian pekerja migran di ladang dan kilang dilayan dengan buruk. Indonesia menangguhkan penghantaran pekerja baharu.',
    pilihan: [
      { t: 'Perketat penguatkuasaan dan tandatangani MoU perlindungan', kesan: { pg: -3, hub: { ID: 6, US: 2, EU: 2 }, tumbuh: -.002 }, nasihat: [0, 1, 0] },
      { t: 'Cari sumber pekerja dari negara lain', kesan: { hub: { ID: -4 } }, nasihat: [1, -1, 0] },
      { t: 'Automasi industri (RM2 bilion)', kesan: { rm: -2, tumbuh: .002 }, nasihat: [1, 0, 0] }] },
  { k: 'penuaan', t: 'Malaysia Menjadi Negara Tua', p: 1,
    teks: () => 'Unjuran menunjukkan 15% rakyat berumur 60 tahun ke atas menjelang 2030. Simpanan persaraan ramai pekerja tidak mencukupi.',
    pilihan: [
      { t: 'Naikkan umur persaraan sektor awam', kesan: { sok: -2, tumbuh: .002, mp: -3 }, nasihat: [1, -1, -1] },
      { t: 'Skim pencen dan penjagaan warga emas (RM2 bilion)', kesan: { rm: -2, sok: 2 }, nasihat: [-1, 1, 1] },
      { t: 'Galakkan automasi dan pekerja mahir', kesan: { rm: -1, tumbuh: .001 }, nasihat: [1, 0, 0] }] },
  { k: 'gempa', t: 'Gempa Bumi di Ranau', negeri: ['SBH'], p: .5,
    teks: () => 'Gegaran berukuran sederhana melanda Ranau berhampiran Gunung Kinabalu. Jalan dan sekolah rosak, pendaki terkandas.',
    pilihan: [
      { t: 'Operasi menyelamat dan bina semula (RM1.5 bilion)', kesan: { rm: -1.5, sokL: { SBH: 7 } }, nasihat: [0, 1, 1] },
      { t: 'Bantuan asas sahaja', kesan: { rm: -.4, sokL: { SBH: -3 } }, nasihat: [1, -1, -1] }] },
  { k: 'eksport', t: 'Ledakan Eksport E&E', p: 1.2,
    teks: () => 'Permintaan cip untuk kecerdasan buatan melonjak. Kilang E&E beroperasi pada kapasiti penuh.',
    pilihan: [
      { t: 'Latih 50,000 jurutera dan juruteknik (RM1 bilion)', kesan: { rm: -1, tumbuh: .004 }, nasihat: [1, 1, 0] },
      { t: 'Kenakan levi keuntungan luar biasa', kesan: { rm: 4, hub: { US: -2 }, tumbuh: -.001 }, nasihat: [0, 0, 1] }] },
  { k: 'pilihanraya', t: 'Pilihan Raya Kecil', p: 1.2, negeri: null,
    teks: n => `Kematian seorang wakil rakyat mencetuskan pilihan raya kecil di ${n}. Keputusannya dilihat sebagai ujian populariti kerajaan.`,
    pilihan: [
      { t: 'Kempen besar dengan janji projek (RM1 bilion)', kesan: { rm: -1, sokN: 4 }, prk: true, nasihat: [-1, 0, 1] },
      { t: 'Kempen sederhana berasaskan rekod kerajaan', kesan: {}, prk: true, nasihat: [1, 0, 0] }] },
  { k: 'sukan', t: 'Kejayaan Sukan Antarabangsa', p: .8,
    teks: () => 'Atlet negara memenangi pingat emas di temasya antarabangsa. Seluruh negara bersorak.',
    pilihan: [
      { t: 'Sambutan dan dana pembangunan sukan (RM0.3 bilion)', kesan: { rm: -.3, perpaduan: 5, sok: 1.5 }, nasihat: [0, 1, 1] },
      { t: 'Ucapan tahniah sahaja', kesan: { perpaduan: 2 }, nasihat: [1, 0, 0] }] },
];

/* ---------- kuiz Malaysia kini ---------- */
const KUIZ = [
  { s: 'Berapakah bilangan negeri di Malaysia?', p: ['13', '14', '15', '16'], j: 0 },
  { s: 'Berapakah bilangan Wilayah Persekutuan?', p: ['2', '3', '4', '5'], j: 1 },
  { s: 'Yang manakah BUKAN Wilayah Persekutuan?', p: ['Labuan', 'Putrajaya', 'Melaka', 'Kuala Lumpur'], j: 2 },
  { s: 'Negeri terbesar di Malaysia ialah…', p: ['Pahang', 'Sabah', 'Sarawak', 'Johor'], j: 2 },
  { s: 'Negeri terkecil di Malaysia ialah…', p: ['Melaka', 'Perlis', 'Pulau Pinang', 'Negeri Sembilan'], j: 1 },
  { s: 'Negeri paling ramai penduduk ialah…', p: ['Johor', 'Sabah', 'Selangor', 'Perak'], j: 2 },
  { s: 'Berapakah jumlah kerusi Dewan Rakyat?', p: ['192', '222', '232', '250'], j: 1 },
  { s: 'Majoriti mudah untuk membentuk kerajaan memerlukan sekurang-kurangnya…', p: ['100 kerusi', '112 kerusi', '120 kerusi', '148 kerusi'], j: 1 },
  { s: 'Pindaan perlembagaan memerlukan sokongan…', p: ['Separuh Dewan', 'Dua pertiga Dewan', 'Tiga suku Dewan', 'Semua ahli'], j: 1 },
  { s: 'Negeri dengan kerusi parlimen terbanyak ialah…', p: ['Selangor', 'Johor', 'Sarawak', 'Sabah'], j: 2 },
  { s: 'Ibu negeri Sabah ialah…', p: ['Sandakan', 'Kota Kinabalu', 'Tawau', 'Labuan'], j: 1 },
  { s: 'Ibu negeri Kelantan ialah…', p: ['Kuala Terengganu', 'Kota Bharu', 'Tumpat', 'Gua Musang'], j: 1 },
  { s: 'Ibu negeri Pahang ialah…', p: ['Temerloh', 'Bentong', 'Kuantan', 'Pekan'], j: 2 },
  { s: 'Ibu negeri Selangor ialah…', p: ['Petaling Jaya', 'Klang', 'Shah Alam', 'Kuala Lumpur'], j: 2 },
  { s: 'Ibu negeri Perak ialah…', p: ['Ipoh', 'Taiping', 'Kuala Kangsar', 'Teluk Intan'], j: 0 },
  { s: 'Ibu negeri Kedah ialah…', p: ['Sungai Petani', 'Kulim', 'Alor Setar', 'Langkawi'], j: 2 },
  { s: 'Pusat pentadbiran kerajaan persekutuan terletak di…', p: ['Kuala Lumpur', 'Putrajaya', 'Cyberjaya', 'Shah Alam'], j: 1 },
  { s: 'Gunung tertinggi di Malaysia ialah…', p: ['Gunung Tahan', 'Gunung Kinabalu', 'Gunung Mulu', 'Gunung Ledang'], j: 1 },
  { s: 'Sungai terpanjang di Malaysia ialah…', p: ['Sungai Pahang', 'Sungai Perak', 'Sungai Rajang', 'Sungai Kinabatangan'], j: 2 },
  { s: 'Hujung paling selatan tanah besar Asia terletak di…', p: ['Tanjung Piai, Johor', 'Desaru, Johor', 'Port Dickson', 'Mersing'], j: 0 },
  { s: 'Negeri yang digelar "Bumi Kenyalang" ialah…', p: ['Sabah', 'Sarawak', 'Pahang', 'Terengganu'], j: 1 },
  { s: '"Negeri di Bawah Bayu" merujuk kepada…', p: ['Labuan', 'Sarawak', 'Sabah', 'Kedah'], j: 2 },
  { s: 'Pulau Pinang terkenal sebagai hab industri…', p: ['Minyak & gas', 'Elektrik & elektronik', 'Sawit', 'Perkapalan'], j: 1 },
  { s: 'Perjanjian yang membentuk Malaysia pada 1963 dikenali sebagai…', p: ['MA63', 'Perjanjian Pangkor', 'Deklarasi KL', 'Piagam ASEAN'], j: 0 },
  { s: 'Rakan dagang terbesar Malaysia sejak 2009 ialah…', p: ['Singapura', 'Amerika Syarikat', 'Jepun', 'China'], j: 3 },
  { s: 'ASEAN ditubuhkan pada tahun…', p: ['1957', '1963', '1967', '1971'], j: 2 },
  { s: 'Labuan terkenal sebagai pusat…', p: ['Kewangan luar pesisir', 'Penerbangan', 'Pertanian', 'Pendidikan'], j: 0 },
  { s: 'Pelabuhan tersibuk di Malaysia ialah…', p: ['Pelabuhan Kuantan', 'Pelabuhan Klang', 'Pelabuhan Bintulu', 'Pelabuhan Pulau Pinang'], j: 1 },
  { s: 'Lapangan Terbang Antarabangsa Kuala Lumpur (KLIA) terletak di…', p: ['Kuala Lumpur', 'Sepang, Selangor', 'Putrajaya', 'Negeri Sembilan'], j: 1 },
  { s: 'Umur minimum mengundi di Malaysia kini ialah…', p: ['18 tahun', '21 tahun', '17 tahun', '20 tahun'], j: 0 },
  { s: 'Dewan Negara mempunyai berapa orang senator?', p: ['50', '70', '100', '222'], j: 1 },
  { s: 'Banjir monsun paling kerap melanda negeri pantai timur antara bulan…', p: ['Mac–Mei', 'Jun–Ogos', 'November–Januari', 'Ogos–Oktober'], j: 2 },
  { s: 'Kumpulan etnik terbesar di Sarawak ialah…', p: ['Melayu', 'Iban', 'Cina', 'Bidayuh'], j: 1 },
  { s: 'Kumpulan etnik terbesar di Sabah ialah…', p: ['Bajau', 'Murut', 'Kadazan-Dusun', 'Melayu'], j: 2 },
  { s: 'Bumiputera membentuk kira-kira berapa peratus warganegara Malaysia (Banci 2020)?', p: ['50%', '60%', '70%', '80%'], j: 2 },
  { s: 'Had statutori hutang kerajaan persekutuan yang sering dirujuk ialah…', p: ['45% KDNK', '55% KDNK', '65% KDNK', '85% KDNK'], j: 2 },
];

/* ---------- misi, pencapaian, wawasan ---------- */
const MISI_JENIS = [
  { k: 'kutip', t: n => `Kutip RM${n} bilion hasil projek`, n: L => 4 + 2 * L },
  { k: 'projek', t: n => `Siapkan ${n} projek atau naik taraf`, n: () => 2 },
  { k: 'peristiwa', t: n => `Selesaikan ${n} peristiwa`, n: () => 2 },
  { k: 'lawatan', t: n => `Buat ${n} lawatan rasmi luar negara`, n: () => 1 },
  { k: 'kuiz', t: n => `Jawab ${n} soalan kuiz dengan betul`, n: () => 3 },
  { k: 'permintaan', t: n => `Tunaikan ${n} permintaan kerajaan negeri`, n: () => 1 },
];
const CAPAI = [
  { k: 'projek', n: 'Pembina Negara', d: 'Projek disiapkan', t: [5, 25, 80] },
  { k: 'kutip', n: 'Perbendaharaan Kukuh', d: 'RM bilion dikutip daripada projek', t: [20, 200, 1000] },
  { k: 'peristiwa', n: 'Pengurus Krisis', d: 'Peristiwa diselesaikan', t: [5, 25, 80] },
  { k: 'perjanjian', n: 'Diplomat Ulung', d: 'Perjanjian antarabangsa', t: [1, 4, 10] },
  { k: 'pru', n: 'Mandat Rakyat', d: 'PRU dimenangi', t: [1, 2, 4] },
  { k: 'kuiz', n: 'Pakar Malaysia', d: 'Jawapan kuiz betul', t: [5, 30, 100] },
  { k: 'negeriPuas', n: 'Disayangi Rakyat', d: 'Negeri dengan sokongan 70% serentak', t: [3, 8, 16] },
  { k: 'mega', n: 'Projek Mega', d: 'Projek mega disiapkan', t: [1, 3, 5] },
];
const GANJARAN_CAPAI = [5, 15, 40];   // Modal Politik
