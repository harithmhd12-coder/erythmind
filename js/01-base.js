'use strict';
/* ================= utilities ================= */
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const LS = {
  get(k, d){ try{ const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); }catch(e){ return d; } },
  set(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} },
};
const CL = (window.claude && typeof window.claude.use === 'function') ? window.claude : null;
const use = name => CL ? CL.use(name).catch(() => null) : Promise.resolve(null);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const fmtDate = t => { try{ return new Date(t).toLocaleDateString('ms-MY', {day:'numeric', month:'short', year:'numeric'}); }catch(e){ return new Date(t).toDateString(); } };
const fmtHM = m => { m = ((Math.round(m) % 1440) + 1440) % 1440; return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); };
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clone = o => JSON.parse(JSON.stringify(o));
// an error as shown to the owner: the server's "not allowed" code is spelled out (in the app it means the owner account is not signed in here)
function errText(e){ const c = e?.code || e?.message || String(e); return String(c) === '42501' ? 'pelayan menolak: akaun pemilik belum log masuk di pelayar ini' : c; }
function toast(msg, kind = '', ms = 3800){
  const el = document.createElement('div'); el.className = 'toast ' + kind; el.textContent = msg;
  $('#toast').appendChild(el); setTimeout(() => el.remove(), ms);
  while($('#toast').children.length > 4) $('#toast').firstChild.remove();
}
function flash(color){
  const f = $('#flash'); f.style.background = `radial-gradient(circle, transparent 30%, ${color})`;
  f.style.transition = 'none'; f.style.opacity = '1';
  requestAnimationFrame(() => { f.style.transition = 'opacity .8s'; f.style.opacity = '0'; });
}
function mulberry(a){ return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

/* ================= world geography ================= */
const LAB = {x:0, y:48, z:-14, r:26};                 // Labophase (layer 1)
const MAIN = {x:333, z:-67, r:230};                  // Tanah Besar (public mainland)
const BRIDGE = {ax:66, az:-13.2, bx:142, bz:-28.6, w:8, h:.6};
const NVY = -140;                                     // Nivelham (layer 2): cavern floor under Tanah Besar
const CAVE = {x:MAIN.x, z:MAIN.z, r:198, ceil:128, lip:185, open:[45, 95]};   // open = arch sector (deg)
const R2D_ = 180 / Math.PI;
const caveAng = (x, z) => { let a = Math.atan2(z - CAVE.z, x - CAVE.x) * R2D_; return a < 0 ? a + 360 : a; };
const inOpening = (x, z) => { const a = caveAng(x, z); return a >= CAVE.open[0] && a <= CAVE.open[1]; };
function inAbyss(x, z){ const r = Math.hypot(x - CAVE.x, z - CAVE.z); return r > CAVE.lip && r < 480 && inOpening(x, z); }
const PANG = {x:130, y:260, z:-40, r:118};           // Istana Pangaea (layer 3): floating castle island above the clouds
const BASE = {x:-150, z:960, rIn:160, rOut:260, top:9, open:55};   // Pangkalan Laut: crescent naval island ~1 km south
BASE.face = Math.atan2(-BASE.z, -BASE.x);            // bay mouth faces the main archipelago
BASE.back = BASE.face + Math.PI;
BASE.hq = {x:BASE.x + Math.cos(BASE.back) * 228, z:BASE.z + Math.sin(BASE.back) * 228};
BASE.plaza = {x:BASE.x + Math.cos(BASE.back) * 180, z:BASE.z + Math.sin(BASE.back) * 180};
BASE.ops = {x:BASE.x + Math.cos(BASE.back) * 197, z:BASE.z + Math.sin(BASE.back) * 197};
BASE.gate = {x:BASE.x + Math.cos(BASE.face) * 380, z:BASE.z + Math.sin(BASE.face) * 380};
BASE.dock = {x:BASE.x + Math.cos(BASE.back) * 150, z:BASE.z + Math.sin(BASE.back) * 150};
BASE.hills = [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([u, v]) => { const r = 228 + u * 26, a = BASE.back + v * 40 / 228; return [BASE.x + Math.cos(a) * r, BASE.z + Math.sin(a) * r]; });
// crescent island: flat fortified top, sheer brick-and-steel walls, four small hills round the headquarters
function baseIslandH(x, z){
  const dx = x - BASE.x, dz = z - BASE.z; if(Math.abs(dx) > BASE.rOut + 4 || Math.abs(dz) > BASE.rOut + 4) return -30;
  const r = Math.hypot(dx, dz); if(r > BASE.rOut || r < BASE.rIn - 30) return -30;
  let a = Math.atan2(dz, dx) - BASE.face; a = Math.atan2(Math.sin(a), Math.cos(a));
  const half = BASE.open / R2D_, rm = (BASE.rIn + BASE.rOut) / 2, cr = (BASE.rOut - BASE.rIn) / 2;
  let inside = Math.abs(a) >= half && r >= BASE.rIn;
  if(!inside){ const s = Math.sign(a) || 1, ca = BASE.face + s * half; inside = Math.hypot(x - (BASE.x + Math.cos(ca) * rm), z - (BASE.z + Math.sin(ca) * rm)) < cr; }
  if(!inside) return -30;
  let h = BASE.top; BASE.hills.forEach(([hx, hz]) => { const d = Math.hypot(x - hx, z - hz); if(d < 13) h += 7 * (1 - smooth(4, 13, d)); });
  return h;
}
const LIBH = {x:-2600, y:-400, z:-2600, hw:25, hl:62, h:30};   // Dewan Baitul Hikmah (layer 4): the great hall inside the Owl Library
const MAZE = {x:2600, y:-400, z:2600, n:21, b:4};            // Labirin Memori (layer 5): the maze inside the Marine headquarters
MAZE.G = MAZE.n * 2 + 1; MAZE.half = MAZE.G * MAZE.b / 2;
function layerBase(l){ return l === 1 ? LAB.y : l === 2 ? NVY : l === 3 ? PANG.y : l === 4 ? LIBH.y : l === 5 ? MAZE.y : 0; }
const indoorLayer = l => l === 2 || l === 4 || l === 5;
const OVERVIEW = [{x:230, z:-40}, {x:0, z:-14}, {x:333, z:-67}, {x:PANG.x, z:PANG.z}, {x:LIBH.x, z:LIBH.z}, {x:MAZE.x, z:MAZE.z}];
const DISTRICTS = [
  {name:'Teras Erythmind', sub:'Fabriophase · zon simpanan peribadi', at:[0, 0], layer:0},
  {name:'Pusat Komuniti Awam', sub:'Menara Jam · Masjid · Dewan', at:[185, -40], layer:0},
  {name:'Kota Awam', sub:'Bandar futuristik separa urban', at:[300, -188], layer:0},
  {name:'Taman Falsafah', sub:'Stoa & kolam renungan', at:[292, 100], layer:0},
  {name:'Menara Strategi', sub:'Bilik gerakan', at:[230, 80], layer:0},
  {name:'Balai Cerap', sub:'Teropong & soalan besar', at:[480, 40], layer:0},
  {name:'Banjaran Nivelham', sub:'Pintu ke lapisan bawah', at:[455, -165], layer:0},
  {name:'Tasik Tenang', sub:'Padang rusa & kuda', at:[340, -40], layer:0},
  {name:'Lembah Nivelham', sub:'Salji tebal · binatang buas gergasi', at:[320, -150], layer:2},
  {name:'Perkampungan Gua Besar', sub:'Rumah kayu balak · Dewan Panjang', at:[300, 48], layer:2},
  {name:'Mata Air Hikmah', sub:'Pokok Purba · Laluan Dahan 8', at:[395, 22], layer:2},
  {name:'Jurang Nivelham', sub:'Gerbang batu ke dunia bawah', at:[400, 160], layer:0},
  {name:'Istana Pangaea', sub:'Lapisan puncak · Majlis Syura rahsia', at:[PANG.x, PANG.z], layer:3},
  {name:'Pangkalan Laut Erythmind', sub:'Pulau bulan sabit · Teluk Pengepung', at:[BASE.hq.x, BASE.hq.z], layer:0},
];

/* ================= vault zones ================= */
const FEELINGS = [['Gembira',2],['Bersyukur',2],['Teruja',2],['Tenang',1],['Bangga',1],['Rindu',0],['Bosan',0],['Keliru',-1],['Risau',-1],['Letih',-1],['Sedih',-2],['Marah',-2],['Kecewa',-2]];
const STATUSES = ['Idea','Sedang dibina','Siap','Ditangguh'];
const ZONES = {
  memori:{name:'Pantai Memori', layer:0, at:[0,57], r:8, color:'#ffb86b', keeper:'INGAT',
    blurb:'Setiap kenangan disimpan dalam botol cahaya di sepanjang pantai. Makin banyak memori, makin banyak botol terdampar.',
    fields:[{k:'title',l:'Tajuk kenangan',t:'text'},{k:'date',l:'Tarikh',t:'date'},{k:'place',l:'Tempat',t:'text'},{k:'people',l:'Bersama siapa',t:'text'},{k:'body',l:'Cerita penuh',t:'area'}]},
  ilmu:{name:'Akademi Ilmu', layer:0, at:[29,0], r:6, color:'#8fb8ff', keeper:'HIKMAH',
    blurb:'Perpustakaan untuk semua yang kau pelajari: nota buku, kelas, pengalaman dan kefahaman sendiri.',
    fields:[{k:'title',l:'Topik',t:'text'},{k:'source',l:'Sumber (buku, guru, pengalaman)',t:'text'},{k:'tags',l:'Tag',t:'text'},{k:'body',l:'Nota & kefahaman',t:'area'}]},
  fikir:{name:'Makmal Cara Fikir', layer:1, at:[LAB.x-15, LAB.z+9], r:7, color:'#9fc8ff', keeper:'NALAR',
    blurb:'Makmal model mental: prinsip, rangka keputusan dan cara kau menganalisis dunia. Hanya di Labophase, di dalam Frontier Dome.',
    fields:[{k:'cat',l:'Kategori',t:'select',opts:['Peribadi','Alat Berfikir Umum','Fizik, Kimia & Biologi','Pemikiran Sistem','Matematik','Ekonomi','Seni','Ketenteraan & Strategi','Sifat Manusia & Penilaian']},{k:'title',l:'Prinsip / model mental',t:'text'},{k:'body',l:'Bagaimana aku berfikir tentang ini',t:'area'},{k:'example',l:'Contoh penggunaan',t:'area'},{k:'tags',l:'Tag',t:'text'}]},
  emosi:{name:'Hutan Emosi', layer:0, at:[-38,6], r:8, color:'#9be37a', keeper:'RASA',
    blurb:'Pokok Rasa di tengah hutan berubah warna mengikut emosi kau. Kelip-kelip di sini adalah perasaan yang kau rekodkan.',
    fields:[{k:'feeling',l:'Perasaan',t:'select',opts:FEELINGS.map(f => f[0])},{k:'intensity',l:'Intensiti (1–10)',t:'range'},{k:'date',l:'Tarikh',t:'date'},{k:'title',l:'Pencetus',t:'text'},{k:'body',l:'Apa yang aku rasa & kenapa',t:'area'}]},
  rancang:{name:'Kilang Rancangan', layer:0, at:[21,-21], r:6, color:'#ff8a5c', keeper:'ARAH',
    blurb:'Kilang tempat idea dibentuk menjadi rancangan, dan rancangan dikeluarkan menjadi hasil. Robot bekerja lebih sibuk bila banyak projek berjalan.',
    fields:[{k:'title',l:'Matlamat',t:'text'},{k:'status',l:'Status',t:'select',opts:STATUSES},{k:'deadline',l:'Tarikh sasaran',t:'date'},{k:'tags',l:'Tag',t:'text'},{k:'body',l:'Langkah-langkah',t:'area'}]},
  strategi:{name:'Menara Strategi', layer:0, at:[230,93], r:8, color:'#ffd27a', keeper:'ARAH',
    blurb:'Bilik gerakan di puncak bukit. Meja peta hologram untuk menyusun strategi, membaca medan dan merancang gerakan balas.',
    fields:[{k:'title',l:'Nama strategi / kempen',t:'text'},{k:'status',l:'Status',t:'select',opts:['Dirangka','Dilaksana','Selesai','Dibatalkan']},{k:'objective',l:'Objektif akhir',t:'text'},{k:'terrain',l:'Medan: pesaing, sumber, kekangan',t:'area'},{k:'moves',l:'Langkah & gerakan balas',t:'area'}]},
  falsafah:{name:'Taman Falsafah', layer:0, at:[292,100], r:9, color:'#c9b8ff', keeper:'HIKMAH',
    blurb:'Stoa di tepi kolam renungan. Tempat persoalan besar disoal, direnung, dan pendirian kau dicatat bersama perubahannya.',
    fields:[{k:'question',l:'Persoalan',t:'text'},{k:'body',l:'Renungan',t:'area'},{k:'stance',l:'Pendirian semasa',t:'area'},{k:'tags',l:'Tag',t:'text'}]},
  rahsia:{name:'Dewan Panjang Rahsia', layer:2, at:[300,41], r:8, color:'#ff9b5e', keeper:'PERISAI',
    blurb:'Dewan kayu balak terbesar di Perkampungan Gua Besar, Nivelham. Pelan rahsia disimpan di sini. Peti Bubo boleh mengunci sesuatu pelan sehingga tarikh tertentu.',
    fields:[{k:'codename',l:'Nama kod',t:'text'},{k:'body',l:'Pelan rahsia',t:'area'},{k:'risk',l:'Risiko & pelan kontingensi',t:'area'},{k:'reveal',l:'Peti Bubo: sembunyi sehingga (pilihan)',t:'date',noToday:true}]},
  pemikir:{name:'Arkib Pemikir', layer:4, at:[LIBH.x, LIBH.z - 30], r:6, color:'#e8c27a', keeper:'NALAR',
    blurb:'Perpustakaan gergasi di atas Laluan Dahan 8. Arkib pemikir: esei, teori, sistem dan Kitab Tiga Zaman. Medan Pembesar Bubo membesarkan setiap tulisan yang dibaca di sini.',
    fields:[{k:'kind',l:'Jenis',t:'select',opts:['Esei','Teori','Sistem & rangka','Bacaan kritikal','Kitab Tiga Zaman']},{k:'title',l:'Tajuk',t:'text'},{k:'body',l:'Isi',t:'area',ph:'Untuk Kitab Tiga Zaman: tulis tiga bahagian. Zaman Sebelum, Zaman Perubahan, Zaman Sekarang.'},{k:'sources',l:'Rujukan',t:'text'}]},
  buku:{name:'Katalog Bacaan', layer:4, at:[LIBH.x, LIBH.z - 52], r:6, color:'#d8a93a', keeper:'NALAR',
    blurb:'Meja pustakawan Dewan Baitul Hikmah. 1000 buku di rak dewan: tekan mana-mana buku untuk mencatat buku yang kau baca. Buku yang sudah diisi bertukar warna dan berjalur emas.',
    fields:[{k:'title',l:'Tajuk buku',t:'text'},{k:'author',l:'Penulis',t:'text'},{k:'status',l:'Status',t:'select',opts:['Selesai dibaca','Sedang dibaca','Mahu dibaca']},{k:'rating',l:'Penilaian',t:'range'},{k:'date',l:'Tarikh habis baca',t:'date',noToday:true},{k:'body',l:'Ringkasan & pengajaran',t:'area'},{k:'quotes',l:'Petikan kegemaran',t:'area'},{k:'tags',l:'Tag',t:'text'}]},
  buruk:{name:'Arkib Memori Terburuk', layer:5, at:[MAZE.x, MAZE.z], r:6, color:'#8fa8d8', keeper:'PERISAI',
    blurb:'Di tengah Labirin Memori. Setiap dementor di labirin memegang satu memori buruk. Yang kosong terbang rawak; yang sudah diisi akan mengejar kau. Bila kau sudah berdamai dengan sesuatu memori, tukar statusnya: dementor itu bertukar menjadi cahaya.',
    fields:[{k:'title',l:'Memori buruk',t:'text'},{k:'date',l:'Bila berlaku',t:'date',noToday:true},{k:'body',l:'Apa yang berlaku',t:'area'},{k:'feeling',l:'Perasaan yang masih tinggal',t:'text'},{k:'lesson',l:'Apa yang aku belajar / mahu lepaskan',t:'area'},{k:'status',l:'Status',t:'select',opts:['Masih menghantui','Sedang dipulihkan','Sudah berdamai']}]},
  syura:{name:'Majlis Syura', layer:3, at:[PANG.x, PANG.z - 10], r:7, color:'#e8b04a', keeper:'PERISAI',
    blurb:'Meja bulat di Dewan Syura, Istana Pangaea. Mesyuarat rahsia kau bersama rakan kongsi terpilih. Kerusi di atas pentas sengaja dibiarkan kosong: kedaulatan mutlak milik Allah, manusia memimpin dengan syura.',
    fields:[{k:'title',l:'Agenda mesyuarat',t:'text'},{k:'date',l:'Tarikh',t:'date'},{k:'attendees',l:'Hadir',t:'text'},{k:'status',l:'Status',t:'select',opts:['Dibincang','Diputuskan','Dilaksana','Ditangguh']},{k:'body',l:'Perbincangan',t:'area'},{k:'decision',l:'Keputusan syura',t:'area'},{k:'actions',l:'Tindakan & penanggungjawab',t:'area'}]},
  armada:{name:'Bilik Gerakan Armada', layer:0, at:[BASE.ops.x, BASE.ops.z], r:7, color:'#7fb2ff', keeper:'PERISAI',
    blurb:'Bilik gerakan di Oris Plaza, Pangkalan Laut. Operasi, pertahanan dan logistik maritim kau. Pelan disulitkan hujung ke hujung.',
    fields:[{k:'title',l:'Nama operasi',t:'text'},{k:'status',l:'Status',t:'select',opts:['Dirangka','Siap siaga','Dilaksana','Selesai']},{k:'objective',l:'Objektif',t:'text'},{k:'assets',l:'Aset & armada',t:'area'},{k:'body',l:'Pelan & laluan',t:'area'}]},
};
const ZONE_IDS = Object.keys(ZONES);
const SATS = [
  {id:'NALAR',   role:'Logik, analisis & arkib pemikir', zone:'fikir',   layer:1, at:[LAB.x-9,  LAB.z+13]},
  {id:'RASA',    role:'Penjaga emosi',                   zone:'emosi',   layer:0, at:[-31, 12]},
  {id:'INGAT',   role:'Penjaga memori',                  zone:'memori',  layer:0, at:[7, 52]},
  {id:'HIKMAH',  role:'Pustakawan ilmu & falsafah',      zone:'ilmu',    layer:0, at:[28, 7]},
  {id:'ARAH',    role:'Jurutera rancangan & strategi',   zone:'rancang', layer:0, at:[16, -25]},
  {id:'ILHAM',   role:'Kreativiti, hologram & komuniti', zone:null,      layer:0, at:[-5, 10]},
  {id:'PERISAI', role:'Keselamatan · pautan Bavar-373',  zone:'rahsia',  layer:1, at:[LAB.x+6, LAB.z+20]},
];
const DISHES = [
  ['Nasi Lemak Diraja','🍛','Sambal sotong, rendang tok, telur mata kerbau.'],
  ['Wagyu A5 Panggang','🥩','Dibakar hologram plasma 0.8 saat setiap sisi.'],
  ['Parfait Gergasi','🍨','Versi mini parfait yang terapung di plaza.'],
  ['Teh Tarik Awan','🧋','Buih dibuat daripada awan laut tiruan Island A.C.'],
  ['Sushi Omakase','🍣','12 keping, dipotong oleh lengan robot Fabriophase.'],
  ['Kunafa Keju','🧀','Rangup di luar, keju meleleh di dalam.'],
];
const MISSILES = ['Fateh-110','Zolfaghar','Shahab-3','Ghadr-110','Sejjil','Khorramshahr','Fattah'];
const TANKS = ['Karrar','Zulfiqar'];
const WEATHER = {
  cerah:{label:'Cerah', note:'Island A.C. aktif. Suhu 27°C, lembap 62%. Langit ikut masa sebenar.', grey:0, fog:1, fx:'none', snow:0},
  hujan:{label:'Hujan Lembut', note:'Kelembapan dinaikkan. Hutan Emosi disiram, guruh jauh sekali-sekala.', grey:.55, fog:.55, fx:'rain', snow:0},
  salji:{label:'Salji Asal', note:'Island A.C. dimatikan. Inilah Erythmind yang asal: pulau musim sejuk.', grey:.35, fog:.5, fx:'snow', snow:1, wind:.25},
  berangin:{label:'Angin Kencang', note:'Angin kencang bertiup. Pokok meliuk lentok, daun hijau berterbangan.', grey:.12, fog:.9, fx:'leaf', leafCol:0x6aa04a, wind:.9},
  ribut:{label:'Ribut Petir', note:'Hujan lebat, angin kuat dan kilat sambar-menyambar di langit.', grey:.78, fog:.42, fx:'rain', rain:.8, wind:.95, dim:.18, lightning:1},
  monsun:{label:'Monsun Timur Laut', note:'Hujan lebat berpanjangan dari Laut China Selatan, angin sederhana.', grey:.66, fog:.48, fx:'rain', rain:.65, wind:.55, dim:.08},
  kabus:{label:'Kabus Pagi', note:'Kabus tebal menyelubungi bandar dan hutan. Jarak penglihatan pendek.', grey:.3, fog:.22, tint:0xe6edf2, tintK:.45, fx:'none', wind:.05},
  jerebu:{label:'Jerebu', note:'Udara berjerebu kekuningan, matahari malap. Indeks pencemaran tinggi.', grey:.22, fog:.3, tint:0xc0a078, tintK:.55, dim:.25, fx:'dust', wind:.12},
  bunga:{label:'Musim Bunga', note:'Pokok berbunga merah jambu, kelopak bunga gugur ditiup angin lembut.', grey:0, fog:1, tint:0xffe4f0, tintK:.12, fx:'petal', wind:.3, leaves:'bunga', grass:0x7ccf68},
  luruh:{label:'Musim Luruh', note:'Daun bertukar jingga dan merah, berguguran ke tanah.', grey:.08, fog:.85, tint:0xffd8a8, tintK:.16, fx:'leaf', leafCol:0xe0782a, wind:.45, leaves:'luruh', grass:0x9aa450, ground:0xb8903a},
  kemarau:{label:'Kemarau Panas', note:'Panas terik 36°C, rumput kering kekuningan, udara berdebu.', grey:0, fog:.75, tint:0xffd890, tintK:.25, fx:'dust', wind:.15, leaves:'kemarau', grass:0xb8b060, ground:0xc8b070},
  aurora:{label:'Langit Aurora', note:'Langit gelap kebiruan dengan tirai aurora hijau dan ungu menari.', grey:0, fog:1, tint:0x0a1838, tintK:.72, dim:.45, fx:'none', aurora:1, wind:.05},
  pelangi:{label:'Selepas Hujan · Pelangi', note:'Gerimis halus berhenti perlahan, pelangi melengkung di langit.', grey:.12, fog:.85, fx:'rain', rain:.08, rainOp:.22, wind:.1, rainbow:1},
};
const YT = {
  siang:{label:'Siang · slow living', url:'https://www.youtube.com/live/HEu6GkbVdhY'},
  azan:{label:'Azan', url:'https://youtu.be/dOcPeqxobpc'},
  quran:{label:'Bacaan Al-Quran', url:'https://youtu.be/vN26sr5NiS8'},
  malam:{label:'Malam · zikir penenang hati', url:'https://youtu.be/Hy7Sk2k8zy8'},
  hujan:{label:'Hujan · ambien', url:'https://youtu.be/DRFHklnN-SM'},
  salji:{label:'Salji · soothing', url:'https://youtu.be/Hf6YwNRGjWs'},
};
// JAKIM zones (representative coordinates for the calculation)
const JAKIM = [
  ['WLY01','Kuala Lumpur, Putrajaya',3.139,101.687],['WLY02','Labuan',5.280,115.241],['SGR01','Gombak, Petaling, Sepang, Hulu Langat',3.073,101.518],
  ['SGR02','Kuala Selangor, Sabak Bernam',3.339,101.250],['SGR03','Klang, Kuala Langat',3.044,101.446],['JHR02','Johor Bahru, Kota Tinggi',1.493,103.741],
  ['JHR03','Kluang, Pontian',2.031,103.318],['JHR04','Batu Pahat, Muar, Segamat',1.854,102.932],['KDH01','Kota Setar, Kubang Pasu',6.121,100.367],
  ['KDH05','Kulim, Bandar Baharu',5.365,100.562],['KTN01','Kota Bharu, Bachok, Pasir Mas',6.125,102.238],['MLK01','Melaka',2.189,102.250],
  ['NGS02','Seremban, Port Dickson',2.726,101.942],['PHG02','Kuantan, Pekan',3.808,103.326],['PHG04','Bentong, Raub, Lipis',3.522,101.909],
  ['PLS01','Perlis',6.440,100.198],['PNG01','Pulau Pinang',5.414,100.329],['PRK02','Ipoh, Kinta, Kampar',4.598,101.090],
  ['PRK06','Kuala Kangsar, Taiping',4.851,100.737],['TRG01','Kuala Terengganu, Marang',5.330,103.140],['SBH07','Kota Kinabalu, Penampang',5.980,116.073],
  ['SBH01','Sandakan',5.840,118.117],['SBH02','Tawau',4.245,117.891],['SWK08','Kuching, Bau, Lundu',1.553,110.359],
  ['SWK03','Sibu, Mukah',2.288,111.830],['SWK01','Miri, Limbang',4.399,113.991],
];

/* ================= crypto (Eryth Records vault) ================= */
const te = new TextEncoder(), td = new TextDecoder();
const ITER = 310000;
const rand = n => crypto.getRandomValues(new Uint8Array(n));
const b64 = u8 => { let s = ''; for(let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s); };
const unb64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
const rid = n => b64(rand(n)).replace(/[^a-zA-Z0-9]/g, '').slice(0, 16) || String(Date.now());
async function kekFrom(pin, salt, iter){
  const base = await crypto.subtle.importKey('raw', te.encode(pin), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({name:'PBKDF2', salt:unb64(salt), iterations:iter, hash:'SHA-256'}, base, {name:'AES-GCM', length:256}, false, ['encrypt','decrypt']);
}
const aesKey = raw => crypto.subtle.importKey('raw', raw, {name:'AES-GCM'}, false, ['encrypt','decrypt']);
async function seal(key, bytes, aad){
  const iv = rand(12);
  const ct = await crypto.subtle.encrypt({name:'AES-GCM', iv, additionalData:te.encode(aad)}, key, bytes);
  return {iv:b64(iv), ct:b64(new Uint8Array(ct))};
}
async function unseal(key, box, aad){
  const pt = await crypto.subtle.decrypt({name:'AES-GCM', iv:unb64(box.iv), additionalData:te.encode(aad)}, key, unb64(box.ct));
  return new Uint8Array(pt);
}

/* ================= state ================= */
let store = null, core = null, artifactOwner = true, myUid = null;
let session = null;              // {role:'owner'|'guest', name, gender, gid, MK, keys:{zone:CryptoKey}, lab, niv}
const raw = new Map();           // id -> encrypted record
const plain = new Map();         // id -> {id,z,t,u,iv,data|bad}
const bavar = {tamper:0, fails:0};
const pub = {board:[], guestbook:[], reports:[], risikan:[]};
let gloves = LS.get('erythmind.gloves', true);
let weatherKey = LS.get('erythmind.weather2', 'cerah');
let seaClouds = LS.get('erythmind.seaclouds', true);
let lastActive = performance.now();
const AUTO_LOCK_MS = 10 * 60 * 1000;

function canZone(z){ return !!(session && session.keys[z]); }
function canLab(){ return !!(session && (session.role === 'owner' || session.lab)); }
function canNiv(){ return !!(session && (session.role === 'owner' || session.niv)); }
function canIstana(){ return !!(session && (session.role === 'owner' || session.istana)); }
function canLaut(){ return !!(session && (session.role === 'owner' || session.laut)); }
function isOwner(){ return session?.role === 'owner'; }
function entriesOf(z){
  const key = e => (e.data?.date ? Date.parse(e.data.date) : e.t) || 0;
  return [...plain.values()].filter(e => e.z === z).sort((a, b) => key(b) - key(a));
}
function counts(){ const c = {}; ZONE_IDS.forEach(z => c[z] = 0); plain.forEach(e => { if(!e.bad && c[e.z] != null) c[e.z]++; }); return c; }
function moodValence(){
  const since = Date.now() - 14 * 864e5; let s = 0, n = 0;
  plain.forEach(e => { if(e.z === 'emosi' && !e.bad && (e.u || e.t) > since){ const f = FEELINGS.find(x => x[0] === e.data.feeling); if(f){ const w = (+e.data.intensity || 5) / 5; s += f[1] * w; n += w; } } });
  return n ? clamp(s / n, -2, 2) : null;
}
function equilibrium(){
  const c = counts(); const zs = ZONE_IDS.filter(z => canZone(z)); const tot = zs.reduce((a, z) => a + c[z], 0);
  if(!tot || zs.length < 2) return {index:null, hungry:null};
  let h = 0; zs.forEach(z => { const p = c[z] / tot; if(p > 0) h -= p * Math.log(p); });
  const hungry = zs.reduce((m, z) => c[z] < c[m] ? z : m, zs[0]);
  return {index:Math.round(100 * h / Math.log(zs.length)), hungry};
}

/* ================= storage backends ================= */
function dbStore(db){
  const coreRef = db.doc('world/core'), vcol = db.collection('vault');
  const boardRef = db.doc('awam/papan'), risRef = db.doc('risikan/log');
  const err = what => e => toast(`Sambungan ${what} terputus (${e.code}). Muat semula halaman.`, 'bad');
  return {
    kind:'db',
    watch(onCore, onVault){
      coreRef.onSnapshot(s => onCore(s.exists ? s.data() : null, s.metadata.fromCache), err('Eryth Records'));
      vcol.limit(1000).onSnapshot(s => onVault(s.docs.map(d => [d.id, d.data()])), err('bilik kebal'));
    },
    watchPublic(onBoard, onBook){
      boardRef.onSnapshot(s => onBoard(s.exists ? (s.data().posts || []) : []), () => {});
      db.collection('bukutamu').limit(200).onSnapshot(s => onBook(s.docs.map(d => ({id:d.id, ...d.data()}))), () => {});
    },
    watchIntel(onReports, onRis){
      db.collection('laporan').limit(200).onSnapshot(s => onReports(s.docs.map(d => ({id:d.id, ...d.data()}))), () => {});
      risRef.onSnapshot(s => onRis(s.exists ? (s.data().events || []) : []), () => {});
    },
    peek: async () => (await coreRef.get()).exists,
    setCore: c => coreRef.set(c),
    put: (id, rec) => vcol.doc(id).set(rec),
    del: id => vcol.doc(id).delete(),
    setBoard: posts => boardRef.set({posts}),
    sign: (uid, rec) => db.doc('bukutamu/' + uid).set(rec),
    report: (uid, rec) => db.doc('laporan/' + uid).set(rec),
    setRisikan: events => risRef.set({events}),
  };
}
function localStore(){
  let c = LS.get('erythmind.core', null), v = LS.get('erythmind.vault', {});
  let fc = () => {}, fv = () => {}, fb = () => {}, fg = () => {}, fr = () => {}, fs = () => {};
  const emitV = () => fv(Object.entries(v));
  const later = f => setTimeout(f, 0);
  return {
    kind:'local',
    watch(onCore, onVault){ fc = onCore; fv = onVault; later(() => { onCore(c, false); emitV(); }); },
    watchPublic(onBoard, onBook){ fb = onBoard; fg = onBook; later(() => { onBoard(LS.get('erythmind.papan', [])); onBook(LS.get('erythmind.bukutamu', [])); }); },
    watchIntel(onReports, onRis){ fr = onReports; fs = onRis; later(() => { onReports([]); onRis(LS.get('erythmind.risikan', [])); }); },
    async setCore(n){ c = n; LS.set('erythmind.core', c); later(() => fc(c, false)); },
    async put(id, rec){ v[id] = rec; LS.set('erythmind.vault', v); later(emitV); },
    async del(id){ delete v[id]; LS.set('erythmind.vault', v); later(emitV); },
    async setBoard(posts){ LS.set('erythmind.papan', posts); later(() => fb(posts)); },
    async sign(uid, rec){ const g = LS.get('erythmind.bukutamu', []).filter(x => x.id !== uid); g.push({id:uid, ...rec}); LS.set('erythmind.bukutamu', g); later(() => fg(g)); },
    async report(){},
    async setRisikan(events){ LS.set('erythmind.risikan', events); later(() => fs(events)); },
  };
}
