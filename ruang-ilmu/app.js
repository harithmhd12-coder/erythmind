/* Ruang Ilmu · app.
   Satu halaman, banyak paparan. Laluan dibaca dari #token (contoh #a.bias-pengesahan) supaya pautan boleh dikongsi.
   Data pengguna disimpan dalam localStorage peranti ini. Dalam produksi, lapisan simpan()/muat() digantikan dengan backend. */
(() => {
'use strict';

/* ================= Utiliti ================= */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const sorot = s => esc(s).replace(/==(.+?)==/g, '<mark>$1</mark>');
const polos = s => String(s ?? '').replace(/==/g, '');
const BULAN = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'];
const tarikh = iso => { const d = new Date(iso); return isNaN(d) ? '' : `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`; };
const hariIni = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const rm = n => 'RM' + n.toFixed(2);
const kiraPerkataan = s => (String(s).match(/\S+/g) || []).length;
const KAT = Object.fromEntries(KATEGORI.map(k => [k.id, k]));
const PROD = Object.fromEntries(PRODUK.map(p => [p.id, p]));

const IKON = {
  main: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l11-6.5z"/></svg>',
  jeda: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/></svg>',
  dengar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="14" width="5" height="6" rx="1.5"/><rect x="16" y="14" width="5" height="6" rx="1.5"/></svg>',
  lihat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m10 9 5 3-5 3z" fill="currentColor"/></svg>',
  simpan: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 3h12v18l-6-4-6 4z"/></svg>',
  simpanPenuh: '<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.8"><path d="M6 3h12v18l-6-4-6 4z"/></svg>',
  kongsi: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></svg>',
  aa: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 19 8 6l5 13M5 14h6M14 19l3.5-9 3.5 9M15.2 16h4.6"/></svg>',
  tanda: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m5 12 5 5 9-10"/></svg>',
  undur: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M11 7 6 12l5 5M18 7l-5 5 5 5"/></svg>',
  maju: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m13 7 5 5-5 5M6 7l5 5-5 5"/></svg>',
  tutup: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 6l12 12M18 6 6 18"/></svg>'
};

/* ================= Keadaan pengguna ================= */
const KUNCI = 'ruangilmu.v1';
const asal = () => ({
  simpan: [], selesai: {}, kuiz: {}, nota: {}, posisi: {}, format: {}, akses: {}, dengar: {}, lihat: {},
  xp: 0, hari: {}, laluanSiap: {}, rehat: 0, laporan: [], draf: [], troli: {}, pesanan: [],
  surat: null, akaun: null, ahli: null,
  tetapan: { tema: 'sistem', fon: 1, notifikasi: 'mingguan', sorokKopi: false, matlamat: 10, siri: true }
});
let S = (() => {
  try {
    const r = JSON.parse(localStorage.getItem(KUNCI) || 'null');
    if (r && typeof r === 'object') { const a = asal(); return Object.assign(a, r, { tetapan: Object.assign(a.tetapan, r.tetapan || {}) }); }
  } catch (e) { /* storan disekat: guna keadaan baharu */ }
  return asal();
})();
const simpan = () => { try { localStorage.setItem(KUNCI, JSON.stringify(S)); } catch (e) { /* abaikan */ } };
const rekodHari = () => (S.hari[hariIni()] ||= { saat: 0, aktif: false });
const tandaAktif = () => { rekodHari().aktif = true; simpan(); };
const tambahXP = (n, sebab) => { S.xp += n; tandaAktif(); toast(`+${n} XP · ${sebab}`); kemasPengepala(); };

/* ================= Kandungan ================= */
function drafKeArtikel(d) {
  const bahagian = []; let semasa = null;
  String(d.isi || '').split(/\n\s*\n/).map(x => x.trim()).filter(Boolean).forEach(blok => {
    if (blok.startsWith('## ')) { semasa = { h: blok.slice(3).split('\n')[0], v: '', p: [] }; const baki = blok.split('\n').slice(1).join(' ').trim(); if (baki) semasa.p.push(baki); bahagian.push(semasa); }
    else { if (!semasa) { semasa = { h: 'Pengenalan', v: '', p: [] }; bahagian.push(semasa); } semasa.p.push(blok.replace(/\n/g, ' ')); }
  });
  return {
    slug: 'd-' + d.id, tajuk: d.tajuk, dek: d.dek, kategori: d.kategori, tag: d.tag, tahap: d.tahap,
    terbit: d.terbit || hariIni(), kemas: d.kemas || hariIni(), ringkas60: d.ringkas60, bahagian,
    fakta: [], kuiz: [], refleksi: '', rujukan: d.sumber, berkaitan: [], penulis: d.penulis, penyemak: d.penyemak, drafStudio: true
  };
}
const semua = () => KANDUNGAN.concat(S.draf.filter(d => d.langkah >= 6).map(drafKeArtikel));
const cari = slug => semua().find(a => a.slug === slug);
const teksPenuh = a => [a.ringkas60, ...a.bahagian.flatMap(b => b.p)].join(' ');
const minit = a => {
  const w = kiraPerkataan(teksPenuh(a));
  return { baca: Math.max(2, Math.round(w / 200)), dengar: Math.max(2, Math.round(w / 150)), lihat: Math.max(1, Math.round(adegan(a).reduce((t, x) => t + x.saat, 0) / 60)) };
};
const penulis = a => a.penulis || 'Meja Editorial Ruang Ilmu';
const penyemak = a => a.penyemak || `Penyemak bidang (${KAT[a.kategori]?.nama.split(' & ')[0] || 'Umum'})`;
const selesai = slug => !!S.selesai[slug];
const disimpan = slug => S.simpan.includes(slug);

function adegan(a) {
  const ayat = s => (polos(s).match(/[^.!?]+[.!?]+/g) || [polos(s)]).map(x => x.trim());
  const duaAyat = s => ayat(s).slice(0, 2).join(' ');
  const x = [
    { kat: KAT[a.kategori]?.nama || '', v: '', h: a.tajuk, cap: a.dek || '' },
    { kat: 'Faham dalam 60 saat', v: '60 s', h: ayat(a.ringkas60)[0], cap: ayat(a.ringkas60).slice(1, 3).join(' ') },
    ...a.bahagian.map(b => ({ kat: 'Bab', v: b.v || '', h: b.h, cap: duaAyat(b.p[0] || '') }))
  ];
  if (a.refleksi) x.push({ kat: 'Soalan refleksi', v: '?', h: a.refleksi, cap: 'Jeda sebentar dan fikirkan jawapan kau sendiri.' });
  return x.map(s => ({ ...s, saat: Math.max(6, Math.round(kiraPerkataan(s.cap + ' ' + s.h) / 2.4)) }));
}

/* ================= Carian ================= */
const HENTI = new Set('kenapa mengapa apa apakah bagaimana macam mana aku saya kau kita yang dan di ke dari untuk dengan ini itu sesuatu bila patut adakah ada atau pada dalam tentang selalu boleh lebih the of a an to is'.split(' '));
const pangkas = w => {
  let s = w;
  s = s.replace(/^(meng|meny|mem|men|me|ber|be|ter|di|ke|peng|pem|pen|per|pe|se)(?=[a-z]{4,})/, '');
  s = s.replace(/(kan|an|nya|lah|i)$/, m => (s.length - m.length >= 4 ? '' : m));
  return s;
};
const token = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9\s-]/g, ' ').split(/[\s-]+/).filter(w => w.length > 1 && !HENTI.has(w)).map(pangkas);
let INDEKS = null;
function bina() {
  INDEKS = semua().map(a => ({ a, medan: [[token(a.tajuk), 4], [token(a.tag.join(' ')), 3], [token((KAT[a.kategori]?.nama || '') + ' ' + a.dek), 2], [token(teksPenuh(a)), 1]] }));
}
function carian(q) {
  if (!INDEKS) bina();
  const t = token(q); if (!t.length) return [];
  return INDEKS.map(({ a, medan }) => {
    let skor = 0, padan = 0;
    t.forEach(w => { let ada = false; medan.forEach(([ws, berat]) => { const n = ws.filter(x => x === w || (w.length >= 4 && (x.startsWith(w) || w.startsWith(x) && x.length >= 4))).length; if (n) { skor += berat * Math.min(n, 3); ada = true; } }); if (ada) padan++; });
    return { a, skor: skor * (padan / t.length) };
  }).filter(r => r.skor > 0).sort((x, y) => y.skor - x.skor).map(r => r.a);
}

/* ================= Toast & modal ================= */
let toastT;
function toast(m) { const t = $('#toast'); t.textContent = m; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, 2600); }
function bukaModal(tajuk, isi) {
  $('#lapisan').innerHTML = `<div class="lapik"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="modalTajuk"><div class="modal-kepala"><h2 id="modalTajuk" class="h-seksyen" style="font-size:1.6rem">${tajuk}</h2><button class="ikon-btn" data-act="tutup-modal" aria-label="Tutup">${IKON.tutup}</button></div>${isi}</div></div>`;
  const f = $('#lapisan input, #lapisan textarea, #lapisan button.btn'); if (f) f.focus();
}
const tutupModal = () => { $('#lapisan').innerHTML = ''; };

/* ================= Komponen ================= */
function botol(p) {
  const w = p.warna;
  if (p.jenis.startsWith('Biji')) return `<svg viewBox="0 0 100 120" aria-hidden="true"><path d="M24 22h52l6 88H18z" fill="${w}"/><path d="M24 22h52v8H24z" fill="#1b1410" opacity=".55"/><rect x="30" y="48" width="40" height="40" fill="#fffaf2"/><text x="50" y="64" text-anchor="middle" font-family="Newsreader, Georgia, serif" font-style="italic" font-size="8" fill="#1b1410">Sip 'n Go</text><text x="50" y="76" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="4.6" fill="#1b1410">LIBERICA · 250G</text></svg>`;
  if (p.id === 'sng-kotak-rehat') return `<svg viewBox="0 0 120 100" aria-hidden="true"><path d="M14 36h92v54H14z" fill="${w}"/><path d="M14 36 30 18h92l-16 18z" fill="#1b1410" opacity=".35"/><path d="M106 36 122 18v54l-16 18z" fill="#1b1410" opacity=".5"/><rect x="28" y="50" width="64" height="26" fill="#fffaf2"/><text x="60" y="62" text-anchor="middle" font-family="Newsreader, Georgia, serif" font-style="italic" font-size="9" fill="#1b1410">Sip 'n Go</text><text x="60" y="71" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="4.6" fill="#1b1410">COFFEE BREAK · 4×</text></svg>`;
  const kata = p.nama.split(' '); const b1 = kata.slice(0, Math.ceil(kata.length / 2)).join(' '), b2 = kata.slice(Math.ceil(kata.length / 2)).join(' ');
  return `<svg viewBox="0 0 80 200" aria-hidden="true"><rect x="28" y="6" width="24" height="16" rx="3" fill="#1b1410"/><path d="M30 22h20v14c0 6 16 10 16 22v130a8 8 0 0 1-8 8H22a8 8 0 0 1-8-8V58c0-12 16-16 16-22z" fill="${w}"/><rect x="14" y="92" width="52" height="62" fill="#fffaf2"/><text x="40" y="112" text-anchor="middle" font-family="Newsreader, Georgia, serif" font-style="italic" font-size="10" fill="#1b1410">Sip 'n Go</text><line x1="24" y1="119" x2="56" y2="119" stroke="#a5362a" stroke-width=".8"/><text x="40" y="130" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="5" fill="#1b1410">${esc(b1.toUpperCase())}</text><text x="40" y="138" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="5" fill="#1b1410">${esc(b2.toUpperCase())}</text><text x="40" y="148" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="4" fill="#6a625a">250 ML</text></svg>`;
}
const fmtLencana = a => { const m = minit(a); return `<div class="lencana-format"><span>Baca ${m.baca} min</span><span>Dengar ${m.dengar} min</span><span>Lihat ${m.lihat} min</span>${selesai(a.slug) ? '<span class="cip selesai">Selesai</span>' : ''}</div>`; };
const kadArtikel = (a, sampul = true) => `<article class="artikel-kad">
  ${sampul ? `<a class="sampul" href="#a.${a.slug}" data-kat="${esc(KAT[a.kategori]?.nama)}" tabindex="-1" aria-hidden="true"><span>${esc(a.bahagian[0]?.v || a.tajuk.split(' ').slice(0, 3).join(' '))}</span></a>` : ''}
  <div class="meta"><span>${esc(KAT[a.kategori]?.nama)}</span><span>${esc(a.tahap)}</span></div>
  <h3><a href="#a.${a.slug}">${esc(a.tajuk)}</a></h3>
  <p>${esc(a.dek)}</p>${fmtLencana(a)}</article>`;
const barisDengar = (a, i) => { const m = minit(a); const aktif = Pemain.slug === a.slug && Pemain.main; return `<li><div class="baris"><span class="no">${String(i + 1).padStart(2, '0')}</span><div class="tajuk-baris"><a href="#a.${a.slug}">${esc(a.tajuk)}</a><span class="meta"><span>${esc(KAT[a.kategori]?.nama)}</span><span>${m.dengar} min</span>${S.dengar[a.slug] ? `<span>Sambung dari bahagian ${S.dengar[a.slug] + 1}</span>` : ''}</span></div><button class="main-btn" data-act="dengar" data-slug="${a.slug}" aria-label="${aktif ? 'Jeda' : 'Dengar'} ${esc(a.tajuk)}">${aktif ? IKON.jeda : IKON.main}</button></div></li>`; };
const kepalaSeksyen = (eyebrow, tajuk, teks, pautan) => `<div class="seksyen-kepala"><div><span class="eyebrow">${eyebrow}</span><h2 class="h-seksyen">${tajuk}</h2>${teks ? `<p>${teks}</p>` : ''}</div>${pautan || ''}</div>`;
const borangSurat = id => S.surat
  ? `<p class="kecil-nota">Kau sudah melanggan Surat Ilmu sebagai <b>${esc(S.surat.emel)}</b>. Surat seterusnya tiba pagi Ahad.</p>`
  : `<form class="borang-surat" data-borang="surat"><label class="sr" for="${id}">Emel kau</label><input id="${id}" type="email" required placeholder="nama@emel.com" autocomplete="email"><button class="btn merah" type="submit">Langgan percuma</button></form>
     <p class="kecil-nota"><label><input type="checkbox" id="${id}-setuju" required> Aku setuju menerima Surat Ilmu mingguan. Boleh berhenti bila-bila masa.</label></p>`;

function cadangan(n = 3, kecuali = []) {
  const minat = {};
  Object.keys(S.selesai).concat(S.simpan).forEach(s => { const a = cari(s); if (a) minat[a.kategori] = (minat[a.kategori] || 0) + 1; });
  return semua().filter(a => !selesai(a.slug) && !kecuali.includes(a.slug))
    .map(a => ({ a, s: (minat[a.kategori] || 0) * 2 + (a.pilihan ? 1 : 0) + (S.akses[a.slug] ? -0.5 : 0) + new Date(a.terbit).getTime() / 1e13 }))
    .sort((x, y) => y.s - x.s).slice(0, n).map(x => x.a);
}
const ilmuHariIni = () => { const n = Math.floor(Date.now() / 864e5); const senarai = KANDUNGAN; return senarai[n % senarai.length]; };

/* ================= Laluan ================= */
const kemajuanLaluan = l => { const siap = l.item.filter(selesai).length; return { siap, jumlah: l.item.length, peratus: Math.round(siap / l.item.length * 100) }; };
const kadLaluan = l => { const k = kemajuanLaluan(l); return `<a class="laluan-kad" href="#l.${l.slug}"><span class="eyebrow">${l.item.length} langkah · ${esc(l.kurator)}</span><h3>${esc(l.nama)}</h3><p>${esc(l.ringkas)}</p><div class="bar" role="progressbar" aria-valuenow="${k.peratus}" aria-valuemin="0" aria-valuemax="100"><i style="width:${k.peratus}%"></i></div><span class="meta"><span>${k.siap}/${k.jumlah} selesai</span></span></a>`; };
function semakLaluan() {
  LALUAN.forEach(l => { if (!S.laluanSiap[l.slug] && l.item.every(selesai)) { S.laluanSiap[l.slug] = hariIni(); simpan(); setTimeout(() => tambahXP(50, `Laluan "${l.nama}" selesai`), 900); } });
}

/* ================= Lencana & siri ================= */
function lencanaSenarai() {
  const katSiap = new Set(Object.keys(S.selesai).map(s => cari(s)?.kategori).filter(Boolean));
  const formatGuna = new Set(Object.values(S.format).flatMap(f => Object.keys(f)));
  const kuizPenuh = Object.entries(S.kuiz).some(([slug, j]) => { const a = cari(slug); return a && a.kuiz.length && a.kuiz.every((q, i) => j[i] === q.j); });
  const hariAktif = Object.values(S.hari).filter(h => h.aktif).length;
  return [
    { s: 'Ⅰ', n: 'Langkah pertama', d: 'Selesaikan satu kandungan.', ok: Object.keys(S.selesai).length >= 1 },
    { s: '◎', n: 'Tiga deria', d: 'Baca, lihat dan dengar sekurang-kurangnya sekali.', ok: ['baca', 'lihat', 'dengar'].every(f => formatGuna.has(f)) },
    { s: '✓', n: 'Faham betul', d: 'Jawab semua soalan satu kuiz dengan tepat.', ok: kuizPenuh },
    { s: '⟶', n: 'Penjejak laluan', d: 'Lengkapkan satu laluan ilmu.', ok: Object.keys(S.laluanSiap).length >= 1 },
    { s: '⁂', n: 'Pengembara bidang', d: 'Selesaikan kandungan dalam tiga bidang.', ok: katSiap.size >= 3 },
    { s: '☕', n: 'Rehat bermakna', d: 'Habiskan satu sesi Coffee Break 15 minit.', ok: S.rehat >= 1 },
    { s: '¶', n: 'Nota pertama', d: 'Tulis nota atau jawapan refleksi.', ok: Object.values(S.nota).some(n => n && n.trim().length > 10) },
    { s: '七', n: 'Tujuh hari ilmu', d: 'Aktif pada tujuh hari berbeza. Tidak perlu berturut-turut.', ok: hariAktif >= 7 }
  ];
}
function kiraSiri() {
  const aktif = d => S.hari[d]?.aktif;
  const fmt = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const d = new Date(); if (!aktif(fmt(d))) d.setDate(d.getDate() - 1);
  let kira = 0, rehat = 0, kosongBerturut = 0;
  for (let i = 0; i < 400; i++) {
    if (aktif(fmt(d))) { kira++; kosongBerturut = 0; }
    else { kosongBerturut++; if (kosongBerturut > 1 || rehat >= Math.floor(kira / 6) + 1) break; rehat++; }
    d.setDate(d.getDate() - 1);
  }
  return kira;
}

/* ================= Pemain audio (Dengar) ================= */
const sokongSuara = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
const Pemain = {
  slug: null, seg: [], i: 0, main: false, laju: 1, tidur: 0, tidurHingga: 0, id: 0, suara: null,
  /* Dipecah ikut ayat (maksimum ~220 aksara) kerana sesetengah suara pelayar terhenti pada ucapan yang panjang. */
  segmen(a) {
    const pecah = t => { const ay = polos(t).match(/[^.!?]+[.!?]*/g) || [polos(t)]; const out = []; ay.forEach(x => { x = x.trim(); if (!x) return; if (out.length && (out[out.length - 1] + ' ' + x).length <= 220) out[out.length - 1] += ' ' + x; else out.push(x); }); return out; };
    return [a.tajuk + '. ' + polos(a.dek), ...pecah('Faham dalam enam puluh saat. ' + a.ringkas60), ...a.bahagian.flatMap(b => [b.h + '.', ...b.p.flatMap(pecah)])];
  },
  pilihSuara() {
    if (!sokongSuara) return null;
    const v = speechSynthesis.getVoices();
    return v.find(x => /^ms/i.test(x.lang)) || v.find(x => /^id/i.test(x.lang)) || v.find(x => x.default) || v[0] || null;
  },
  mula(slug, dari) {
    if (!sokongSuara) { toast('Pelayar ini tidak menyokong bacaan suara. Cuba Chrome atau Safari terkini.'); return; }
    const a = cari(slug); if (!a) return;
    Video.henti();
    this.slug = slug; this.seg = this.segmen(a);
    this.i = Math.min(dari ?? S.dengar[slug] ?? 0, this.seg.length - 1);
    S.akses[slug] = Date.now(); simpan();
    this.main = true; this.cakap(); this.lukis(); kemasButangMain();
  },
  cakap() {
    speechSynthesis.cancel();
    const id = ++this.id;
    const u = new SpeechSynthesisUtterance(this.seg[this.i]);
    this.suara ||= this.pilihSuara();
    if (this.suara) { u.voice = this.suara; u.lang = this.suara.lang; } else u.lang = 'ms-MY';
    u.rate = this.laju;
    u.onend = () => { if (id !== this.id || !this.main) return; this.seterusnya(true); };
    u.onerror = e => { if (id !== this.id || e.error === 'interrupted' || e.error === 'canceled') return; this.main = false; this.lukis(); kemasButangMain(); toast('Suara terhenti. Tekan main untuk cuba semula.'); };
    speechSynthesis.speak(u);
  },
  seterusnya(auto) {
    if (auto && this.tidurHingga && Date.now() >= this.tidurHingga) { this.jeda(); toast('Pemasa tidur: audio dihentikan.'); this.tidur = 0; this.tidurHingga = 0; this.lukis(); return; }
    this.i++;
    S.dengar[this.slug] = this.i; simpan();
    if (this.i >= this.seg.length) {
      this.main = false; S.dengar[this.slug] = 0; (S.format[this.slug] ||= {}).dengar = true; tandaAktif();
      toast('Selesai mendengar. Jawab kuiz untuk mengukuhkan ingatan.'); this.i = 0; this.lukis(); kemasButangMain(); return;
    }
    if (this.i >= 2) { (S.format[this.slug] ||= {}).dengar = true; simpan(); }
    this.cakap(); this.lukis();
  },
  togol() { if (this.main) this.jeda(); else { this.main = true; this.cakap(); this.lukis(); kemasButangMain(); } },
  jeda() { this.main = false; this.id++; if (sokongSuara) speechSynthesis.cancel(); this.lukis(); kemasButangMain(); },
  lompat(n) { this.i = Math.max(0, Math.min(this.seg.length - 1, this.i + n)); S.dengar[this.slug] = this.i; simpan(); if (this.main) this.cakap(); this.lukis(); },
  tukarLaju() { const l = [1, 1.25, 1.5, 0.85]; this.laju = l[(l.indexOf(this.laju) + 1) % l.length]; if (this.main) this.cakap(); this.lukis(); },
  tukarTidur() { const t = [0, 15, 30, 60]; this.tidur = t[(t.indexOf(this.tidur) + 1) % t.length]; this.tidurHingga = this.tidur ? Date.now() + this.tidur * 60000 : 0; toast(this.tidur ? `Pemasa tidur: ${this.tidur} minit` : 'Pemasa tidur dimatikan'); this.lukis(); },
  tutup() { this.jeda(); this.slug = null; $('#pemain').hidden = true; kemasButangMain(); },
  lukis() {
    const el = $('#pemain'); const a = this.slug && cari(this.slug);
    if (!a) { el.hidden = true; return; }
    el.hidden = false;
    const p = Math.round(this.i / Math.max(1, this.seg.length - 1) * 100);
    el.innerHTML = `<button class="main-btn" data-act="pemain-togol" aria-label="${this.main ? 'Jeda' : 'Main'}">${this.main ? IKON.jeda : IKON.main}</button>
      <div class="info"><b><a href="#a.${a.slug}" style="text-decoration:none">${esc(a.tajuk)}</a></b><small>Bahagian ${this.i + 1} daripada ${this.seg.length} · suara ${esc(this.suara?.name || 'peranti')}${this.tidur ? ` · tidur ${this.tidur} min` : ''}</small><div class="bar"><i style="width:${p}%"></i></div></div>
      <div class="kawalan"><button data-act="pemain-undur" aria-label="Bahagian sebelum">${IKON.undur}</button><button data-act="pemain-maju" aria-label="Bahagian seterusnya">${IKON.maju}</button><button data-act="pemain-laju" aria-label="Kelajuan">${this.laju}×</button><button data-act="pemain-tidur" aria-label="Pemasa tidur">z${this.tidur ? this.tidur : ''}</button><button data-act="pemain-tutup" aria-label="Tutup pemain">${IKON.tutup}</button></div>`;
  }
};
if (sokongSuara) speechSynthesis.addEventListener?.('voiceschanged', () => { Pemain.suara = Pemain.pilihSuara(); });
function kemasButangMain() {
  $$('[data-act="dengar"]').forEach(b => { const aktif = Pemain.slug === b.dataset.slug && Pemain.main; if (b.classList.contains('main-btn')) b.innerHTML = aktif ? IKON.jeda : IKON.main; else b.setAttribute('aria-pressed', aktif ? 'true' : 'false'); });
}

/* ================= Pemain visual (Lihat) ================= */
const Video = {
  slug: null, x: [], i: 0, t: 0, main: false, kapsyen: true, narasi: false, cakapSiap: true, pemasa: null,
  sedia(slug) { this.henti(); const a = cari(slug); this.slug = slug; this.x = adegan(a); this.i = Math.min(S.lihat[slug] || 0, this.x.length - 1); this.t = 0; this.lukis(); },
  mula() {
    if (!this.slug) return;
    if (Pemain.main) Pemain.jeda();
    this.main = true; S.akses[this.slug] = Date.now(); simpan();
    this.bacaNarasi();
    clearInterval(this.pemasa);
    this.pemasa = setInterval(() => this.detik(), 100);
    this.lukis();
  },
  detik() {
    if (!this.main) return;
    this.t += 0.1;
    const s = this.x[this.i];
    if (this.t >= s.saat && (this.cakapSiap || !this.narasi)) this.ke(this.i + 1);
    else this.lukisMasa();
  },
  ke(i) {
    if (i >= this.x.length) { this.main = false; clearInterval(this.pemasa); this.i = this.x.length - 1; this.t = this.x[this.i].saat; S.lihat[this.slug] = 0; (S.format[this.slug] ||= {}).lihat = true; tandaAktif(); toast('Video selesai. Teruskan dengan artikel penuh atau kuiz.'); this.lukis(); return; }
    this.i = Math.max(0, i); this.t = 0; S.lihat[this.slug] = this.i; if (this.i >= 2) (S.format[this.slug] ||= {}).lihat = true; simpan();
    if (this.main) this.bacaNarasi();
    this.lukis();
  },
  bacaNarasi() {
    if (!this.narasi || !sokongSuara) { this.cakapSiap = true; return; }
    speechSynthesis.cancel(); this.cakapSiap = false;
    const s = this.x[this.i]; const u = new SpeechSynthesisUtterance(`${s.h}. ${s.cap}`);
    const v = Pemain.pilihSuara(); if (v) { u.voice = v; u.lang = v.lang; } else u.lang = 'ms-MY';
    u.onend = u.onerror = () => { this.cakapSiap = true; };
    speechSynthesis.speak(u);
  },
  jeda() { this.main = false; clearInterval(this.pemasa); if (this.narasi && sokongSuara) speechSynthesis.cancel(); this.cakapSiap = true; this.lukis(); },
  henti() { this.main = false; clearInterval(this.pemasa); if (this.narasi && sokongSuara && !Pemain.main) speechSynthesis.cancel(); },
  masaMula(i) { return this.x.slice(0, i).reduce((t, s) => t + s.saat, 0); },
  lukisMasa() {
    $$('.garis-masa button i').forEach((el, j) => { el.style.width = j < this.i ? '100%' : j === this.i ? Math.min(100, this.t / this.x[j].saat * 100) + '%' : '0'; });
    const m = $('#masaVideo'); if (m) { const s = Math.floor(this.masaMula(this.i) + this.t), jum = this.masaMula(this.x.length); m.textContent = `${fmtMasa(s)} / ${fmtMasa(jum)}`; }
  },
  lukis() {
    const p = $('#pentas'); if (!p || !this.slug) return;
    $$('.adegan', p).forEach((el, j) => el.classList.toggle('aktif', j === this.i));
    const sk = $('#sariKata'); if (sk) { sk.hidden = !this.kapsyen; sk.innerHTML = `<span>${esc(this.x[this.i].cap)}</span>`; }
    const b = $('#videoMain'); if (b) { b.innerHTML = this.main ? IKON.jeda : IKON.main; b.setAttribute('aria-label', this.main ? 'Jeda' : 'Main'); }
    $$('.bab-senarai button').forEach((el, j) => el.classList.toggle('aktif', j === this.i));
    const k = $('#togolKapsyen'); if (k) k.setAttribute('aria-pressed', this.kapsyen);
    const n = $('#togolNarasi'); if (n) n.setAttribute('aria-pressed', this.narasi);
    this.lukisMasa();
  }
};
const fmtMasa = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

/* ================= Rehat 15 minit ================= */
const FASA = [{ n: 'Baca', d: 'Lima minit membaca', saat: 300 }, { n: 'Dengar / Lihat', d: 'Lima minit mendengar atau menonton', saat: 300 }, { n: 'Refleksi', d: 'Lima minit menulis', saat: 300 }];
const Rehat = {
  slug: null, mula: 0, terkumpul: 0, main: false, pemasa: null,
  jumlah() { return this.terkumpul + (this.main ? (Date.now() - this.mula) / 1000 : 0); },
  fasa() { const t = this.jumlah(); return t >= 900 ? 3 : Math.floor(t / 300); },
  togol() {
    if (this.main) { this.terkumpul = this.jumlah(); this.main = false; }
    else { this.mula = Date.now(); this.main = true; }
    clearInterval(this.pemasa);
    if (this.main) this.pemasa = setInterval(() => this.detik(), 500);
    this.lukis();
  },
  langkau() { const f = this.fasa(); this.terkumpul = Math.min(900, (f + 1) * 300); if (this.main) this.mula = Date.now(); this.detik(); this.lukis(); },
  set() { this.terkumpul = 0; this.main = false; clearInterval(this.pemasa); this.lukis(); },
  detik() {
    const f0 = this._f; const f = this.fasa(); this._f = f;
    if (f >= 3) { clearInterval(this.pemasa); this.main = false; this.terkumpul = 900; S.rehat++; simpan(); tambahXP(15, 'Coffee Break 15 minit selesai'); if (CURR.v === 'rehat') render(); return; }
    if (f0 !== undefined && f0 !== f && CURR.v === 'rehat') render(); else this.lukis();
  },
  lukis() {
    const m = $('#masaRehat'); if (!m) return;
    const baki = Math.max(0, 300 - (this.jumlah() % 300)); const f = this.fasa();
    m.textContent = f >= 3 ? '0:00' : fmtMasa(baki);
    $$('.fasa > div').forEach((el, j) => { el.classList.toggle('aktif', j === f); el.classList.toggle('siap', j < f); });
    const b = $('#rehatMain'); if (b) b.textContent = this.main ? 'Jeda' : this.terkumpul ? 'Sambung' : 'Mula rehat';
  }
};

/* ================= Paparan ================= */
let CURR = { v: 'utama', p: '' };
const NAV_TAB = { utama: 'utama', surat: 'utama', teroka: 'teroka', baca: 'teroka', lihat: 'teroka', dengar: 'dengar', laluan: 'teroka', l: 'teroka', a: 'teroka', v: 'teroka', kopi: 'kopi', p: 'kopi', troli: 'kopi', o: 'kopi', rehat: 'kopi', profil: 'profil', ahli: 'profil', masuk: 'profil' };
const NAV_ATAS = { baca: 'baca', a: 'baca', lihat: 'lihat', v: 'lihat', dengar: 'dengar', teroka: 'teroka', laluan: 'laluan', l: 'laluan', kopi: 'kopi', p: 'kopi', troli: 'kopi', o: 'kopi', rehat: 'kopi', ahli: 'ahli' };

const V = {};

V.utama = () => {
  const h = ilmuHariIni(); const m = minit(h);
  const sambung = Object.entries(S.akses).sort((x, y) => y[1] - x[1]).map(([s]) => cari(s)).filter(a => a && !selesai(a.slug)).slice(0, 3);
  const rek = rekodHari(); const minitHari = Math.floor(rek.saat / 60);
  return `
  <div class="bekas">
    <section class="hero">
      <div class="hero-teks">
        <span class="eyebrow">Surat Ilmu · setiap pagi Ahad</span>
        <h1 class="h-besar">Ilmu yang tahan zaman, <em>dihidang ketika rehat.</em></h1>
        <p class="lede">Baca, lihat dan dengar ilmu yang disemak sumbernya: agama, psikologi, sejarah dan sains. Lima minit sehari, tanpa iklan yang mengganggu bacaan.</p>
        <div id="surat-borang">${borangSurat('emelHero')}</div>
        <div class="format-strip"><span><b>Baca</b>artikel 2–15 min</span><span><b>Lihat</b>video penerangan</span><span><b>Dengar</b>audio sambil bergerak</span></div>
      </div>
      <aside class="kad-hari" aria-label="Satu ilmu untuk hari ini">
        <span class="eyebrow">Satu ilmu untuk hari ini</span>
        <h2><a href="#a.${h.slug}">${esc(h.tajuk)}</a></h2>
        <p class="enam-puluh">${esc(h.ringkas60)}</p>
        <div class="meta"><span>${esc(KAT[h.kategori].nama)}</span><span>Disemak ${tarikh(h.kemas)}</span></div>
        <div class="butang-format">
          <a class="btn kecil" href="#a.${h.slug}">Baca ${m.baca} min</a>
          <button class="btn kecil garis" data-act="dengar" data-slug="${h.slug}">${IKON.dengar.replace('<svg', '<svg width="16" height="16"')} Dengar ${m.dengar} min</button>
          <a class="btn kecil garis" href="#v.${h.slug}">Lihat ${m.lihat} min</a>
        </div>
      </aside>
    </section>
  </div>

  ${sambung.length ? `<div class="bekas"><section class="seksyen">${kepalaSeksyen('Teruskan penerokaan', 'Sambung dari tempat terakhir', `Hari ini: ${minitHari} daripada ${S.tetapan.matlamat} minit ritual ilmu.`, '<a class="pautan" href="#profil">Lihat peta ilmu</a>')}
    <ul class="senarai-baris">${sambung.map((a, i) => `<li><div class="baris"><span class="no">${String(i + 1).padStart(2, '0')}</span><div class="tajuk-baris"><a href="#a.${a.slug}">${esc(a.tajuk)}</a><span class="meta">${S.posisi[a.slug] ? `<span>Dibaca ${S.posisi[a.slug]}%</span>` : ''}${S.dengar[a.slug] ? `<span>Audio bahagian ${S.dengar[a.slug] + 1}</span>` : ''}${S.lihat[a.slug] ? `<span>Video bab ${S.lihat[a.slug] + 1}</span>` : ''}</span></div><a class="btn kecil garis" href="#a.${a.slug}">Sambung</a></div></li>`).join('')}</ul></section></div>` : ''}

  <div class="bekas"><section class="seksyen">${kepalaSeksyen('Untuk rasa ingin tahu kau', 'Pilihan seterusnya', 'Dicadangkan berdasarkan bidang yang kau teroka. Tiada suapan tanpa penghujung: tiga pilihan sudah cukup.')}
    <div class="grid-artikel tiga">${cadangan(3).map(a => kadArtikel(a)).join('')}</div></section></div>

  <div class="bekas"><section class="seksyen">${kepalaSeksyen('Teroka bidang ilmu', 'Enam bidang, satu rasa ingin tahu', '', '<a class="pautan" href="#teroka">Cari dengan soalan</a>')}
    <div class="grid-kategori">${KATEGORI.map(k => `<a class="kategori-kad" href="#teroka.${k.id}"><h3>${esc(k.nama)}<small>${semua().filter(a => a.kategori === k.id).length} bahan</small></h3><p>${esc(k.ringkas)}</p></a>`).join('')}</div></section></div>

  <div class="bekas"><section class="seksyen">${kepalaSeksyen('Koleksi pilihan kurator', 'Laluan ilmu', 'Topik yang disusun mengikut urutan. Setiap langkah membina yang seterusnya.', '<a class="pautan" href="#laluan">Semua laluan</a>')}
    <div class="grid-laluan">${LALUAN.map(kadLaluan).join('')}</div></section></div>

  <div class="bekas"><section class="seksyen">${kepalaSeksyen('Dengar sambil bergerak', 'Audio terkini', 'Setiap artikel boleh didengar. Sesuai untuk perjalanan, rehat atau sebelum tidur.', '<a class="pautan" href="#dengar">Semua audio</a>')}
    <ul class="senarai-baris">${semua().slice().sort((x, y) => y.terbit.localeCompare(x.terbit)).slice(0, 5).map(barisDengar).join('')}</ul></section></div>

  ${S.tetapan.sorokKopi ? '' : jalurKopi()}

  <div class="bekas"><section class="seksyen">${kepalaSeksyen('Baru diterbitkan', 'Telah disemak dan diterbitkan', '', '<a class="pautan" href="#baca">Arkib bacaan</a>')}
    <ul class="senarai-baris">${semua().slice().sort((x, y) => y.terbit.localeCompare(x.terbit)).slice(0, 6).map((a, i) => `<li><div class="baris"><span class="no">${tarikh(a.terbit).split(' ').slice(0, 2).join(' ')}</span><div class="tajuk-baris"><a href="#a.${a.slug}">${esc(a.tajuk)}</a><span class="meta"><span>${esc(KAT[a.kategori]?.nama)}</span><span>${minit(a).baca} min baca</span></span></div><span class="cip">${esc(a.tahap)}</span></div></li>`).join('')}</ul></section></div>

  <div class="bekas"><section class="seksyen">${kepalaSeksyen('Keahlian', 'Belajar lebih dalam, dengan tenang.', 'Kandungan asas kekal percuma. Keahlian membuka koleksi premium, audio penuh dan laluan mendalam.', '<a class="btn" href="#ahli">Lihat pakej</a>')}</section></div>`;
};

function jalurKopi() {
  const pilih = ['sng-kopi-susu', 'sng-spanish-latte', 'sng-americano'].map(id => PROD[id]);
  return `<section class="jalur-kopi" aria-label="Sip 'n Go Coffee"><div class="bekas">
    <div style="display:grid;gap:16px;align-content:start;min-width:0">
      <span class="eyebrow">Coffee Break · teman rehat</span>
      <div class="sng-logo">Sip <span>'n</span> Go</div>
      <p class="lede">Kopi siap minum untuk menemani sesi ilmu kau. Pilihan, bukan syarat: semua kandungan percuma kekal percuma.</p>
      <div class="rehat-15"><b style="font-family:var(--serif);font-size:1.3rem">The 15-Minute Coffee Break</b><p>Lima minit membaca, lima minit mendengar atau menonton, lima minit refleksi.</p><a class="btn kecil" href="#rehat">Mula rehat 15 minit</a></div>
    </div>
    <div style="display:grid;gap:20px;min-width:0"><div class="grid-produk">${pilih.map(kadProduk).join('')}</div><div><a class="btn garis" href="#kopi">Lihat kedai Sip 'n Go</a></div></div>
  </div></section>`;
}
const kadProduk = p => `<a class="produk-kad" href="#p.${p.id}"><div class="botol">${botol(p)}</div><h3>${esc(p.nama)}</h3><span class="meta"><span>${esc(p.jenis)}</span></span><span class="harga">${rm(p.harga)}</span></a>`;

V.surat = V.utama;

V.baca = () => {
  const senarai = semua().slice().sort((x, y) => y.terbit.localeCompare(x.terbit));
  return `<div class="bekas"><header class="halaman-kepala"><span class="eyebrow">Baca</span><h1>Artikel, nota dan e-buku</h1><p class="lede">Artikel pendek 2–5 minit dan bacaan mendalam. Setiap satu bermula dengan ringkasan "Faham dalam 60 saat", diakhiri dengan sumber dan kuiz.</p></header>
  <section class="seksyen">${kepalaSeksyen('Arkib', 'Semua artikel', `${senarai.length} artikel telah disemak.`)}<div class="grid-artikel tiga">${senarai.map(a => kadArtikel(a)).join('')}</div></section>
  <section class="seksyen">${kepalaSeksyen('E-buku & nota digital', 'Koleksi tersusun', 'Untuk pembaca yang mahu pergi lebih jauh.')}
  <div class="grid-laluan">${EBUKU.map(e => `<div class="laluan-kad"><span class="eyebrow">${e.halaman} halaman · ${e.plus ? 'Knowledge Plus' : 'Percuma'}</span><h3>${esc(e.tajuk)}</h3><p>${esc(e.ringkas)}</p><span class="meta"><span>${esc(e.harga)}</span></span>${e.plus ? `<a class="btn kecil garis" href="#ahli">Buka dengan keahlian</a>` : `<a class="btn kecil garis" href="#surat">Dapatkan melalui Surat Ilmu</a>`}</div>`).join('')}</div></section></div>`;
};

V.lihat = () => {
  const senarai = semua();
  return `<div class="bekas"><header class="halaman-kepala"><span class="eyebrow">Lihat</span><h1>Video penerangan</h1><p class="lede">Penerangan visual 1–3 minit dengan bab, sari kata dan transkrip. Setiap video berkongsi fakta dan sumber yang sama dengan artikelnya.</p></header>
  <section class="seksyen"><div class="grid-artikel tiga">${senarai.map(a => { const m = minit(a); return `<article class="artikel-kad"><a class="sampul" href="#v.${a.slug}" data-kat="${esc(KAT[a.kategori]?.nama)}" style="background:var(--jalur);border-color:var(--jalur)"><span style="color:#e3a35d">${esc(a.bahagian[0]?.v || '▶')}</span></a><div class="meta"><span>${m.lihat} min</span><span>${adegan(a).length} bab</span><span>Sari kata</span></div><h3><a href="#v.${a.slug}">${esc(a.tajuk)}</a></h3></article>`; }).join('')}</div></section></div>`;
};

V.dengar = () => {
  const s = semua();
  const kumpulan = [
    { n: 'Dalam perjalanan', d: 'Lima minit atau kurang.', x: s.filter(a => minit(a).dengar <= 5) },
    { n: 'Rehat kopi', d: 'Tentang kopi, untuk diminum bersama kopi.', x: s.filter(a => a.kopi) },
    { n: 'Sebelum tidur', d: 'Topik yang tenang. Pasang pemasa tidur pada pemain.', x: s.filter(a => ['agama', 'sejarah'].includes(a.kategori)) },
    { n: 'Belajar', d: 'Teknik dan pemikiran untuk belajar lebih baik.', x: s.filter(a => ['psikologi', 'kreatif'].includes(a.kategori)) }
  ];
  return `<div class="bekas"><header class="halaman-kepala"><span class="eyebrow">Dengar</span><h1>Dengar sambil bergerak</h1><p class="lede">Setiap artikel boleh didengar. Pemain menyambung dari tempat terakhir, ada kawalan kelajuan dan pemasa tidur.</p>
  <p class="kecil-nota">${sokongSuara ? 'Prototaip ini menggunakan suara sintetik peranti kau. Versi pelancaran akan menggunakan rakaman narator manusia.' : 'Pelayar ini tidak menyokong bacaan suara. Cuba Chrome atau Safari terkini.'}</p></header>
  ${kumpulan.map(k => `<section class="seksyen">${kepalaSeksyen('Koleksi audio', k.n, k.d)}<ul class="senarai-baris">${k.x.map(barisDengar).join('')}</ul></section>`).join('')}</div>`;
};

V.teroka = (kat) => {
  const soalan = ['Kenapa aku selalu bertangguh?', 'Bagaimana sesuatu kepercayaan terbentuk?', 'Bila patut berhenti minum kopi?', 'Kenapa langit biru?', 'Cara belajar supaya tidak lupa'];
  return `<div class="bekas"><header class="halaman-kepala"><span class="eyebrow">Teroka</span><h1>Tanya apa yang kau ingin tahu</h1></header>
  <form class="carian-besar" data-borang="cari" role="search"><label class="sr" for="medanCari">Cari ilmu</label><input id="medanCari" type="search" placeholder="Cari topik atau tanya soalan…" value="${esc(CARI.q)}" autocomplete="off"><button class="btn" type="submit">Cari</button></form>
  <div style="display:grid;gap:14px;padding-block:18px">
    <div class="cadangan-soalan">${soalan.map(q => `<button type="button" data-act="soalan" data-q="${esc(q)}">${esc(q)}</button>`).join('')}</div>
    <div class="penapis" role="group" aria-label="Tapis bidang"><button type="button" data-act="tapis-kat" data-kat="" aria-pressed="${!kat}">Semua bidang</button>${KATEGORI.map(k => `<button type="button" data-act="tapis-kat" data-kat="${k.id}" aria-pressed="${kat === k.id}">${esc(k.nama)}</button>`).join('')}</div>
    <div class="penapis" role="group" aria-label="Tapis tahap">${['', 'Asas', 'Pertengahan'].map(t => `<button type="button" data-act="tapis-tahap" data-tahap="${t}" aria-pressed="${CARI.tahap === t}">${t || 'Semua tahap'}</button>`).join('')}<button type="button" data-act="tapis-pendek" aria-pressed="${CARI.pendek}">5 minit atau kurang</button></div>
  </div>
  <section class="seksyen" id="hasilCari" aria-live="polite">${hasilCari(kat)}</section></div>`;
};
const CARI = { q: '', tahap: '', pendek: false };
function hasilCari(kat) {
  let x = CARI.q.trim() ? carian(CARI.q) : semua().slice().sort((a, b) => b.terbit.localeCompare(a.terbit));
  if (kat) x = x.filter(a => a.kategori === kat);
  if (CARI.tahap) x = x.filter(a => a.tahap === CARI.tahap);
  if (CARI.pendek) x = x.filter(a => minit(a).baca <= 5);
  const tajuk = CARI.q.trim() ? `${x.length} hasil untuk "${esc(CARI.q)}"` : kat ? esc(KAT[kat].nama) : 'Semua bahan';
  return `<div class="seksyen-kepala"><div><span class="eyebrow">Hasil</span><h2 class="h-seksyen">${tajuk}</h2>${kat ? `<p>${esc(KAT[kat].ringkas)}</p>` : ''}</div></div>` +
    (x.length ? `<div class="grid-artikel tiga">${x.map(a => kadArtikel(a)).join('')}</div>` : `<p class="kosong">Belum ada bahan yang sepadan. Cuba perkataan lain, atau <button class="pautan" data-act="cadang-topik">cadangkan topik ini</button> kepada pasukan editorial.</p>`);
}

V.laluan = () => `<div class="bekas"><header class="halaman-kepala"><span class="eyebrow">Laluan ilmu</span><h1>Koleksi yang disusun mengikut urutan</h1><p class="lede">Ikut satu laluan dari mula hingga habis, atau keluar bila-bila masa. Kemajuan kau tidak hilang jika kau berehat.</p></header>
  <section class="seksyen"><div class="grid-laluan">${LALUAN.map(kadLaluan).join('')}</div></section></div>`;

V.l = slug => {
  const l = LALUAN.find(x => x.slug === slug); if (!l) return V.tiada();
  const k = kemajuanLaluan(l); const seterusnya = l.item.find(s => !selesai(s));
  return `<div class="bekas"><header class="halaman-kepala"><span class="eyebrow">Laluan · ${esc(l.kurator)}</span><h1>${esc(l.nama)}</h1><p class="lede">${esc(l.ringkas)}</p>
  <div class="bar" style="max-width:420px"><i style="width:${k.peratus}%"></i></div><span class="meta"><span>${k.siap} daripada ${k.jumlah} langkah selesai</span>${S.laluanSiap[l.slug] ? `<span>Lengkap pada ${tarikh(S.laluanSiap[l.slug])}</span>` : ''}</span>
  ${seterusnya ? `<div><a class="btn" href="#a.${seterusnya}">${k.siap ? 'Sambung laluan' : 'Mula laluan'}</a></div>` : '<p><b>Laluan ini lengkap. Pilih laluan baharu di bawah.</b></p>'}</header>
  <section class="seksyen"><ul class="senarai-baris">${l.item.map((s, i) => { const a = cari(s); return `<li><div class="baris"><span class="no">${String(i + 1).padStart(2, '0')}</span><div class="tajuk-baris"><a href="#a.${s}">${esc(a.tajuk)}</a><span class="meta"><span>${esc(KAT[a.kategori].nama)}</span><span>${minit(a).baca} min</span></span></div>${selesai(s) ? '<span class="cip selesai">Selesai</span>' : s === seterusnya ? '<span class="cip merah">Seterusnya</span>' : '<span class="cip">Belum</span>'}</div></li>`; }).join('')}</ul></section>
  <section class="seksyen">${kepalaSeksyen('Laluan lain', 'Teroka arah lain', '')}<div class="grid-laluan">${LALUAN.filter(x => x !== l).map(kadLaluan).join('')}</div></section></div>`;
};

V.a = slug => {
  const a = cari(slug); if (!a) return V.tiada();
  const m = minit(a); const jawapan = S.kuiz[slug] || {};
  const laluan = LALUAN.find(l => l.item.includes(slug));
  const lepas = laluan && laluan.item[laluan.item.indexOf(slug) + 1];
  const prod = a.pasangan && PROD[a.pasangan];
  const pos = S.posisi[slug] || 0;
  return `<div class="bekas"><article class="artikel">
  <div class="badan-utama">
    <header class="artikel-kepala">
      <div class="meta"><a href="#teroka.${a.kategori}" style="color:var(--merah);text-decoration:none">${esc(KAT[a.kategori]?.nama)}</a><span>${esc(a.tahap)}</span>${a.drafStudio ? '<span>Dari Studio</span>' : ''}</div>
      <h1>${esc(a.tajuk)}</h1>
      <p class="lede">${esc(a.dek)}</p>
      <div class="meta"><span>Oleh ${esc(penulis(a))}</span><span>Disemak oleh ${esc(penyemak(a))}</span><span>Kemas kini ${tarikh(a.kemas)}</span></div>
    </header>
    <div class="bar-tindakan" style="position:relative">
      <button class="btn-tindak" data-act="dengar" data-slug="${slug}" aria-pressed="${Pemain.slug === slug && Pemain.main}">${IKON.dengar} Dengar ${m.dengar} min</button>
      <a class="btn-tindak" href="#v.${slug}">${IKON.lihat} Lihat ${m.lihat} min</a>
      <span class="ruang"></span>
      ${pos > 5 && pos < 95 ? `<button class="btn-tindak" data-act="sambung-baca">Sambung ${pos}%</button>` : ''}
      <button class="btn-tindak" data-act="simpan" data-slug="${slug}" aria-pressed="${disimpan(slug)}">${disimpan(slug) ? IKON.simpanPenuh : IKON.simpan} ${disimpan(slug) ? 'Disimpan' : 'Simpan'}</button>
      <button class="btn-tindak" data-act="kongsi" aria-label="Salin pautan">${IKON.kongsi}</button>
      <button class="btn-tindak" data-act="tetapan-baca" aria-label="Tetapan bacaan" aria-expanded="false">${IKON.aa}</button>
    </div>
    <section class="enam-puluh-kotak" aria-label="Faham dalam 60 saat"><span class="eyebrow">Faham dalam 60 saat</span><p>${sorot(a.ringkas60)}</p></section>
    <div class="prosa" id="prosa">${a.bahagian.map((b, i) => `<h2 id="bab-${i}">${esc(b.h)}</h2>${b.p.map(p => `<p>${sorot(p)}</p>`).join('')}`).join('')}</div>
    ${a.fakta.length ? `<section style="display:grid;gap:14px"><span class="eyebrow">Kad fakta</span><div class="kad-fakta-baris">${a.fakta.map((f, i) => `<div class="kad-fakta"><b>FAKTA ${i + 1}/${a.fakta.length}</b><p>${esc(f)}</p><span class="meta"><span>Ruang Ilmu · ${esc(KAT[a.kategori].nama)}</span></span></div>`).join('')}</div></section>` : ''}
    <div class="kotak isi" style="display:flex;flex-wrap:wrap;gap:14px;justify-content:space-between;align-items:center">
      <div style="display:grid;gap:4px;min-width:0"><b style="font-family:var(--serif);font-size:1.2rem">${selesai(slug) ? 'Kau telah menyelesaikan bahan ini.' : 'Sudah habis membaca?'}</b><span class="kecil-nota">${selesai(slug) ? `Ditanda pada ${tarikh(S.selesai[slug])}.` : 'Tanda selesai untuk mengemas kini peta ilmu dan laluan kau.'}</span></div>
      <button class="btn ${selesai(slug) ? 'garis' : ''}" data-act="selesai" data-slug="${slug}">${selesai(slug) ? IKON.tanda.replace('<svg', '<svg width="16" height="16"') + ' Selesai' : 'Tanda selesai'}</button>
    </div>
    ${a.kuiz.length ? `<section class="kotak" aria-label="Kuiz"><span class="eyebrow">Kuiz · 3 soalan</span><h3>Uji ingatan, bukan peperiksaan</h3>${a.kuiz.map((q, i) => { const dijawab = jawapan[i] !== undefined; return `<div class="kuiz-soalan"><b>${i + 1}. ${esc(q.s)}</b><div class="pilihan">${q.p.map((p, j) => `<button ${dijawab ? 'disabled' : ''} class="${dijawab && j === q.j ? 'betul' : dijawab && j === jawapan[i] ? 'salah' : ''}" data-act="jawab" data-slug="${slug}" data-q="${i}" data-j="${j}">${esc(p)}</button>`).join('')}</div>${dijawab ? `<p class="terang">${jawapan[i] === q.j ? 'Betul. ' : 'Belum tepat. '}${esc(q.t)}</p>` : ''}</div>`; }).join('')}
      ${Object.keys(jawapan).length === a.kuiz.length ? `<p class="kecil-nota">Skor: ${a.kuiz.filter((q, i) => jawapan[i] === q.j).length}/${a.kuiz.length}. <button class="pautan" data-act="ulang-kuiz" data-slug="${slug}">Cuba semula</button> (XP hanya untuk cubaan pertama).</p>` : ''}</section>` : ''}
    <section class="kotak" aria-label="Refleksi dan nota"><span class="eyebrow">${a.refleksi ? 'Soalan refleksi' : 'Nota peribadi'}</span>${a.refleksi ? `<h3>${esc(a.refleksi)}</h3>` : ''}<label class="sr" for="nota-${slug}">Nota peribadi</label><textarea id="nota-${slug}" rows="4" data-nota="${slug}" placeholder="Tulis jawapan atau nota kau. Disimpan secara automatik dan hanya kau yang boleh lihat.">${esc(S.nota[slug] || '')}</textarea><span class="kecil-nota" id="notaStatus">${S.nota[slug] ? 'Disimpan.' : ''}</span></section>
    <section style="display:grid;gap:12px;max-width:var(--lajur)"><span class="eyebrow">Sumber & rujukan</span><ol class="rujukan">${a.rujukan.map(r => `<li>${esc(r)}</li>`).join('')}</ol>
      <p class="kecil-nota">Kemas kini terakhir ${tarikh(a.kemas)}. Terjumpa kesilapan? <button class="pautan" data-act="lapor" data-slug="${slug}">Laporkan kesilapan</button>. Baca <a class="pautan" href="#tentang">standard editorial</a> kami.</p></section>
    ${prod && !S.tetapan.sorokKopi ? `<aside class="teman-kopi" aria-label="Teman bacaan"><div class="botol">${botol(prod)}</div><p><b>Teman bacaan:</b> ${esc(prod.nama)} dari Sip 'n Go. ${esc(prod.nota)} <a class="pautan" href="#p.${prod.id}">Lihat</a> · <span>Pilihan, bukan syarat.</span></p></aside>` : ''}
    <section style="display:grid;gap:20px">
      ${lepas ? `<div class="kotak"><span class="eyebrow">Seterusnya dalam laluan "${esc(laluan.nama)}"</span><h3><a href="#a.${lepas}" style="text-decoration:none">${esc(cari(lepas).tajuk)} →</a></h3></div>` : ''}
      <span class="eyebrow">Jika kau minat ini, teroka ini pula</span>
      <div class="grid-artikel">${(a.berkaitan.length ? a.berkaitan.map(cari).filter(Boolean) : cadangan(2, [slug])).map(x => kadArtikel(x, false)).join('')}</div>
    </section>
  </div>
  <aside class="sisi" aria-label="Isi kandungan"><div><span class="eyebrow">Isi kandungan</span><ol class="isi-kandungan">${a.bahagian.map((b, i) => `<li><a href="#a.${slug}" data-act="bab" data-bab="${i}">${esc(b.h)}</a></li>`).join('')}</ol>
    <div class="meta" style="margin-top:8px"><span>${m.baca} min baca</span><span>${a.rujukan.length} sumber</span></div>
    ${a.tag.length ? `<div class="lencana-format">${a.tag.map(t => `<span>${esc(t)}</span>`).join('')}</div>` : ''}</div></aside>
  </article></div>`;
};

V.v = slug => {
  const a = cari(slug); if (!a) return V.tiada();
  const x = adegan(a); let t = 0;
  return `<div class="bekas" style="padding-block:32px">
  <div class="dua-lajur"><div style="min-width:0;display:grid;gap:4px">
    <div class="pentas" id="pentas" aria-label="Video penerangan: ${esc(a.tajuk)}">
      ${x.map((s, j) => `<div class="adegan${j === 0 ? ' aktif' : ''}">${s.kat ? `<span class="kat">${esc(s.kat)}</span>` : ''}${s.v ? `<span class="v">${esc(s.v)}</span>` : ''}<span class="h">${esc(s.h)}</span></div>`).join('')}
      <div class="sari-kata" id="sariKata"></div>
    </div>
    <div class="kawalan-video">
      <button class="main-btn" id="videoMain" data-act="video-togol" aria-label="Main">${IKON.main}</button>
      <div class="garis-masa">${x.map((s, j) => `<button data-act="video-ke" data-i="${j}" aria-label="Bab ${j + 1}"><i></i></button>`).join('')}</div>
      <span class="meta" id="masaVideo">0:00</span>
      <button class="btn-tindak" id="togolKapsyen" data-act="video-kapsyen" aria-pressed="true">Sari kata</button>
      <button class="btn-tindak" id="togolNarasi" data-act="video-narasi" aria-pressed="false" ${sokongSuara ? '' : 'disabled'}>Narasi</button>
    </div>
    <header class="artikel-kepala" style="padding-top:12px"><div class="meta"><span>${esc(KAT[a.kategori]?.nama)}</span><span>${m2(a)} min</span><span>Disemak ${tarikh(a.kemas)}</span></div><h1 style="font-size:clamp(1.8rem,4vw,2.6rem)">${esc(a.tajuk)}</h1>
      <div class="butang-format"><a class="btn kecil" href="#a.${slug}">Baca artikel penuh</a><button class="btn kecil garis" data-act="dengar" data-slug="${slug}">Dengar versi audio</button><button class="btn kecil garis" data-act="simpan" data-slug="${slug}" aria-pressed="${disimpan(slug)}">${disimpan(slug) ? 'Disimpan' : 'Simpan'}</button></div></header>
    <p class="kecil-nota">Prototaip: video dipaparkan sebagai penerangan visual animasi. Versi pelancaran akan menggunakan video yang dihasilkan pasukan media, dengan bab dan transkrip yang sama.</p>
  </div>
  <aside style="display:grid;gap:22px;align-content:start;min-width:0">
    <div style="display:grid;gap:8px"><span class="eyebrow">Bab</span><ol class="bab-senarai">${x.map((s, j) => { const mula = t; t += s.saat; return `<li><button data-act="video-ke" data-i="${j}"><span>${fmtMasa(mula)}</span>${esc(s.h)}</button></li>`; }).join('')}</ol></div>
    <details><summary style="cursor:pointer;font-weight:600">Transkrip penuh</summary><div class="prosa" style="font-size:1rem;margin-top:12px">${x.map(s => `<p><b>${esc(s.h)}</b> ${esc(s.cap)}</p>`).join('')}</div></details>
    <div style="display:grid;gap:8px"><span class="eyebrow">Sumber</span><ol class="rujukan">${a.rujukan.map(r => `<li>${esc(r)}</li>`).join('')}</ol></div>
  </aside></div></div>`;
};
const m2 = a => minit(a).lihat;

V.kopi = () => {
  const subjek = semua().filter(a => a.kopi);
  return `<section class="jalur-kopi"><div class="bekas" style="grid-template-columns:1fr">
    <div style="display:grid;gap:16px;max-width:52rem"><span class="eyebrow">Kedai Coffee Break</span><div class="sng-logo" style="font-size:clamp(3rem,9vw,6rem)">Sip <span>'n</span> Go Coffee</div>
    <p class="lede">Kopi siap minum, biji kopi tempatan dan kotak rehat. Teman kepada pengalaman ilmu, bukan syarat untuk mengaksesnya.</p>
    <div class="butang-format"><a class="btn" href="#rehat">Mula rehat 15 minit</a><a class="btn garis" href="#troli">Troli${kiraTroli() ? ` (${kiraTroli()})` : ''}</a>${S.pesanan.length ? `<a class="btn garis" href="#o.${S.pesanan[0].id}">Pesanan terakhir</a>` : ''}</div></div>
  </div></section>
  <div class="bekas">
    <section class="seksyen">${kepalaSeksyen('Menu', 'Pilih teman rehat kau', 'Harga contoh untuk prototaip. Ambil sendiri di kiosk atau hantar ke rumah.')}<div class="grid-produk">${PRODUK.map(kadProduk).join('')}</div></section>
    <section class="seksyen">${kepalaSeksyen('Coffee + Knowledge', 'Padanan kopi dan bacaan', 'Setiap kopi dipadankan dengan satu bacaan. Minum sambil faham sesuatu yang baharu.')}
      <ul class="senarai-baris">${PRODUK.filter(p => p.pasangan).map(p => { const a = cari(p.pasangan); return `<li><div class="baris" style="grid-template-columns:56px 1fr auto"><div class="botol" style="aspect-ratio:1">${botol(p)}</div><div class="tajuk-baris"><a href="#p.${p.id}">${esc(p.nama)}</a><span class="meta"><span>dengan</span><a href="#a.${a.slug}" style="color:var(--merah)">${esc(a.tajuk)}</a></span></div><span class="harga meta">${rm(p.harga)}</span></div></li>`; }).join('')}</ul></section>
    <section class="seksyen">${kepalaSeksyen('Coffee as a subject', 'Ilmu tentang kopi', 'Sejarah, sains dan kesan kopi, ditulis dengan standard editorial yang sama.')}<div class="grid-artikel tiga">${subjek.map(a => kadArtikel(a)).join('')}</div></section>
    <section class="seksyen">${kepalaSeksyen('Coffee Break Club', 'Kelab untuk peminum kopi yang suka membaca', 'Kotak bulanan, kandungan khas dan acara bersama penulis. Harga sedang diuji.', `<a class="btn garis" href="#ahli">Sertai senarai menunggu</a>`)}</section>
  </div>`;
};
const kiraTroli = () => Object.values(S.troli).reduce((t, n) => t + n, 0);

V.p = id => {
  const p = PROD[id]; if (!p) return V.tiada();
  const a = p.pasangan && cari(p.pasangan);
  return `<div class="bekas"><div class="produk-halaman">
    <div class="botol">${botol(p)}</div>
    <div style="display:grid;gap:18px;min-width:0">
      <a class="pautan" href="#kopi" style="font-weight:600">← Sip 'n Go Coffee</a>
      <span class="eyebrow">${esc(p.jenis)}</span><h1 class="h-besar" style="font-size:clamp(2.2rem,5vw,3.4rem)">${esc(p.nama)}</h1>
      <p class="lede">${esc(p.nota)}</p>
      <span style="font-family:var(--serif);font-size:1.8rem">${rm(p.harga)}</span>
      <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:stretch"><div class="kuantiti"><button data-act="kuantiti-produk" data-d="-1" aria-label="Kurang">−</button><span id="kuantitiProduk">1</span><button data-act="kuantiti-produk" data-d="1" aria-label="Tambah">+</button></div><button class="btn merah" data-act="tambah-troli" data-id="${p.id}">Tambah ke troli</button></div>
      <div class="jadual-bekas"><table class="jadual"><tbody>
        <tr><th>Ramuan</th><td>${esc(p.ramuan)}</td></tr>
        <tr><th>Alergen</th><td>${p.alergen.length ? esc(p.alergen.join(', ')) : 'Tiada alergen utama diisytiharkan'}</td></tr>
        <tr><th>Kafein</th><td>${p.kafein == null ? 'Bergantung pada cara bancuhan' : `Anggaran ${p.kafein} mg sebotol`}${p.kafein > 100 ? ' · elakkan selepas awal petang' : ''}</td></tr>
        <tr><th>Simpanan</th><td>${p.jenis.startsWith('RTD') ? 'Sejukkan pada 0–4°C. Minum dalam 3 hari selepas dibuka.' : 'Simpan di tempat kering dan sejuk.'}</td></tr>
        ${a ? `<tr><th>Bacaan padanan</th><td><a class="pautan" href="#a.${a.slug}">${esc(a.tajuk)}</a></td></tr>` : ''}
      </tbody></table></div>
      ${p.kafein > 100 ? `<p class="kecil-nota">Ingin tahu kenapa? Baca <a class="pautan" href="#a.kafein-dan-tidur">Kafein dan tidur</a>.</p>` : ''}
    </div></div>
    <section class="seksyen">${kepalaSeksyen('Lagi dari Sip \'n Go', 'Pilihan lain', '')}<div class="grid-produk">${PRODUK.filter(x => x.id !== id).slice(0, 4).map(kadProduk).join('')}</div></section></div>`;
};

function jumlahTroli() {
  const baris = Object.entries(S.troli).filter(([id, n]) => PROD[id] && n > 0).map(([id, n]) => ({ p: PROD[id], n }));
  const sub = baris.reduce((t, b) => t + b.p.harga * b.n, 0);
  return { baris, sub };
}
V.troli = () => {
  const { baris, sub } = jumlahTroli();
  const hantar = TROLI.kaedah === 'hantar' ? 5 : 0;
  return `<div class="bekas"><header class="halaman-kepala"><span class="eyebrow">Sip 'n Go Coffee</span><h1>Troli</h1></header>
  ${baris.length ? `<div class="dua-lajur" style="padding-bottom:40px"><div style="min-width:0">
    ${baris.map(b => `<div class="troli-baris"><div class="botol">${botol(b.p)}</div><div style="min-width:0;display:grid;gap:4px"><a href="#p.${b.p.id}" style="font-family:var(--serif);font-size:1.15rem;font-weight:600;text-decoration:none">${esc(b.p.nama)}</a><span class="meta"><span>${rm(b.p.harga)}</span>${b.p.alergen.length ? `<span>Alergen: ${esc(b.p.alergen.join(', '))}</span>` : ''}</span></div><div class="kuantiti"><button data-act="troli-ubah" data-id="${b.p.id}" data-d="-1" aria-label="Kurang">−</button><span>${b.n}</span><button data-act="troli-ubah" data-id="${b.p.id}" data-d="1" aria-label="Tambah">+</button></div></div>`).join('')}
    <p style="padding-top:14px"><a class="pautan" href="#kopi">← Tambah lagi</a></p>
  </div>
  <form class="kotak" data-borang="bayar" style="align-content:start">
    <h3>Butiran pesanan</h3>
    <div class="pilihan-radio" role="radiogroup" aria-label="Cara terima">
      <label><input type="radio" name="kaedah" value="ambil" ${TROLI.kaedah === 'ambil' ? 'checked' : ''} data-act="kaedah"> <span><b>Ambil sendiri</b><br><small class="kecil-nota">Kiosk Sip 'n Go. Sedia dalam 10 minit. Percuma.</small></span></label>
      <label><input type="radio" name="kaedah" value="hantar" ${TROLI.kaedah === 'hantar' ? 'checked' : ''} data-act="kaedah"> <span><b>Penghantaran</b><br><small class="kecil-nota">Dalam kawasan 10 km. RM5.00.</small></span></label>
    </div>
    <div class="borang-grid dua"><div class="medan"><label for="pNama">Nama</label><input id="pNama" required autocomplete="name" value="${esc(S.akaun?.nama || '')}"></div><div class="medan"><label for="pTel">Telefon</label><input id="pTel" required inputmode="tel" autocomplete="tel" pattern="[0-9+\\-\\s]{9,15}" placeholder="012-345 6789"></div></div>
    ${TROLI.kaedah === 'hantar' ? `<div class="medan"><label for="pAlamat">Alamat penghantaran</label><textarea id="pAlamat" rows="2" required autocomplete="street-address"></textarea></div>` : ''}
    <div class="medan"><label for="pBayar">Kaedah bayaran</label><select id="pBayar"><option>FPX perbankan dalam talian</option><option>E-dompet</option><option>Kad debit / kredit</option>${TROLI.kaedah === 'ambil' ? '<option>Bayar di kiosk</option>' : ''}</select></div>
    <div class="jumlah"><div><span>Jumlah kecil</span><span>${rm(sub)}</span></div><div><span>Penghantaran</span><span>${rm(hantar)}</span></div><div class="akhir"><span>Jumlah</span><span>${rm(sub + hantar)}</span></div></div>
    <p class="amaran-demo">Mod demo: tiada bayaran sebenar dikenakan dan tiada butiran kad diminta. Gerbang pembayaran tempatan disambung semasa pelancaran.</p>
    <button class="btn merah" type="submit">Buat pesanan · ${rm(sub + hantar)}</button>
  </form></div>` : `<p class="kosong">Troli kosong. <a class="pautan" href="#kopi">Lihat menu Sip 'n Go</a></p>`}
  ${S.pesanan.length ? `<section class="seksyen">${kepalaSeksyen('Pesanan', 'Pesanan terdahulu', '')}<ul class="senarai-baris">${S.pesanan.map(o => `<li><div class="baris"><span class="no">${tarikh(o.masa).split(' ').slice(0, 2).join(' ')}</span><div class="tajuk-baris"><a href="#o.${o.id}">${esc(o.id)}</a><span class="meta"><span>${o.item.map(i => `${i.n}× ${esc(PROD[i.id]?.nama)}`).join(', ')}</span></span></div><span class="meta">${rm(o.jumlah)}</span></div></li>`).join('')}</ul></section>` : ''}
  </div>`;
};
const TROLI = { kaedah: 'ambil' };

const STATUS = o => o.kaedah === 'hantar' ? ['Pesanan diterima', 'Sedang disediakan', 'Dalam penghantaran', 'Telah dihantar'] : ['Pesanan diterima', 'Sedang disediakan', 'Sedia untuk diambil', 'Telah diambil'];
const tahapPesanan = o => { const m = (Date.now() - o.masa) / 60000; return m < 1 ? 0 : m < 3 ? 1 : m < 8 ? 2 : 3; };
V.o = id => {
  const o = S.pesanan.find(x => x.id === id); if (!o) return V.tiada();
  const t = tahapPesanan(o); const st = STATUS(o);
  return `<div class="bekas"><header class="halaman-kepala"><span class="eyebrow">Pesanan ${esc(o.id)}</span><h1>${esc(st[t])}</h1><p class="lede">${o.kaedah === 'hantar' ? 'Penghantaran ke alamat kau.' : 'Ambil di kiosk Sip \'n Go dengan menunjukkan nombor pesanan.'}</p></header>
  <div class="dua-lajur" style="padding-bottom:40px"><div class="kotak" style="min-width:0"><ol class="status-garis">${st.map((s, i) => `<li class="${i <= t ? 'siap' : ''}"><span><b>${esc(s)}</b>${i === 0 ? `<br><small class="kecil-nota">${new Date(o.masa).toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' })}</small>` : ''}</span></li>`).join('')}</ol>
    <p class="amaran-demo">Mod demo: status bergerak sendiri mengikut masa untuk menunjukkan aliran pesanan.</p>
    <div class="butang-format"><button class="btn" data-act="pesan-semula" data-id="${o.id}">Pesan semula</button><a class="btn garis" href="#rehat">Mula rehat 15 minit sementara menunggu</a></div></div>
  <div class="kotak" style="align-content:start;min-width:0"><h3>Ringkasan</h3>${o.item.map(i => `<div class="jumlah"><div><span>${i.n}× ${esc(PROD[i.id]?.nama)}</span><span>${rm(PROD[i.id].harga * i.n)}</span></div></div>`).join('')}<div class="jumlah"><div><span>Penghantaran</span><span>${rm(o.hantar)}</span></div><div class="akhir"><span>Jumlah</span><span>${rm(o.jumlah)}</span></div></div><span class="meta"><span>${esc(o.bayar)}</span><span>${esc(o.nama)}</span></span></div></div></div>`;
};

V.rehat = () => {
  if (!Rehat.slug || !cari(Rehat.slug)) Rehat.slug = cadangan(1)[0]?.slug || ilmuHariIni().slug;
  const a = cari(Rehat.slug); const f = Rehat.fasa();
  const isi = [
    `<div class="enam-puluh-kotak"><span class="eyebrow">Faham dalam 60 saat</span><p>${sorot(a.ringkas60)}</p></div><div class="prosa">${a.bahagian.slice(0, 2).map(b => `<h2>${esc(b.h)}</h2>${b.p.map(p => `<p>${sorot(p)}</p>`).join('')}`).join('')}</div><p><a class="pautan" href="#a.${a.slug}">Buka artikel penuh</a> <span class="kecil-nota">(pemasa terus berjalan)</span></p>`,
    `<p class="lede">Pilih satu: dengar versi audio, atau tonton penerangan visual.</p><div class="butang-format"><button class="btn" data-act="dengar" data-slug="${a.slug}">${IKON.dengar.replace('<svg', '<svg width="16" height="16"')} Dengar artikel</button><a class="btn garis" href="#v.${a.slug}">Tonton penerangan</a></div>`,
    `<h3 style="font-size:1.5rem">${esc(a.refleksi || 'Apakah satu perkara yang kau pelajari hari ini?')}</h3><label class="sr" for="nota-rehat">Refleksi</label><textarea id="nota-rehat" rows="5" data-nota="${a.slug}" placeholder="Tulis dengan bebas. Tiada yang menilai.">${esc(S.nota[a.slug] || '')}</textarea><span class="kecil-nota" id="notaStatus"></span>`,
    `<h3 style="font-size:1.6rem">Rehat 15 minit selesai.</h3><p class="lede">Kau sudah membaca, mendengar dan berfikir. Itu sudah cukup untuk hari ini.</p><div class="butang-format"><a class="btn" href="#a.${a.slug}">Jawab kuiz</a><button class="btn garis" data-act="rehat-set">Rehat baharu</button></div>`
  ][f];
  return `<div class="bekas"><header class="halaman-kepala"><span class="eyebrow">The 15-Minute Coffee Break</span><h1>Lima, lima, lima.</h1><p class="lede">Lima minit membaca, lima minit mendengar atau menonton, lima minit refleksi. Kopi boleh menemani, tetapi tidak diwajibkan.</p></header>
  <div class="jam-rehat"><div class="fasa">${FASA.map((x, i) => `<div class="${i === f ? 'aktif' : i < f ? 'siap' : ''}"><b>${x.n}</b><small>5 minit</small></div>`).join('')}</div>
    <div class="masa" id="masaRehat" role="timer" aria-live="off">5:00</div>
    <div class="butang-format" style="justify-content:center"><button class="btn merah" id="rehatMain" data-act="rehat-togol">Mula rehat</button><button class="btn garis" data-act="rehat-langkau">Langkau fasa</button>${Rehat.terkumpul ? '<button class="btn garis" data-act="rehat-set">Set semula</button>' : ''}</div>
    <div class="medan" style="max-width:420px;width:100%;text-align:left"><label for="pilihRehat">Topik rehat ini</label><select id="pilihRehat" data-act="pilih-rehat">${semua().map(x => `<option value="${x.slug}" ${x.slug === a.slug ? 'selected' : ''}>${esc(x.tajuk)}</option>`).join('')}</select></div>
  </div>
  <section class="seksyen"><div style="max-width:var(--lajur);margin:0 auto;display:grid;gap:18px"><span class="eyebrow">${f < 3 ? `Fasa ${f + 1}: ${FASA[f].d}` : 'Selesai'}</span><h2 class="h-seksyen">${esc(a.tajuk)}</h2>${isi}</div></section>
  ${S.tetapan.sorokKopi ? '' : `<section class="seksyen"><div style="max-width:var(--lajur);margin:0 auto;display:grid;gap:14px"><span class="eyebrow">Teman rehat (pilihan)</span><div class="grid-produk">${['sng-kopi-susu', 'sng-americano', 'sng-decaf'].map(i => kadProduk(PROD[i])).join('')}</div></div></section>`}</div>`;
};

V.ahli = () => `<div class="bekas"><header class="halaman-kepala"><span class="eyebrow">Keahlian</span><h1>Berfikir lebih jelas. Belajar dengan tenang.</h1><p class="lede">Ilmu asas kekal percuma. Keahlian menyokong penulis dan penyemak, serta membuka koleksi yang lebih mendalam.</p></header>
  <section style="padding-bottom:40px"><div class="grid-pakej">
    <div class="pakej"><span class="eyebrow">Explorer</span><h3>Peneroka</h3><div class="nilai">Percuma</div><ul><li>Semua artikel, audio dan video asas</li><li>Simpanan, nota dan kemajuan</li><li>Laluan ilmu dan kuiz</li><li>Surat Ilmu mingguan</li></ul><a class="btn garis" href="#profil">${S.akaun ? 'Akaun aktif' : 'Mula percuma'}</a></div>
    <div class="pakej utama"><span class="eyebrow">Knowledge Plus</span><h3>Ilmu Plus</h3><div class="nilai">RM15 <small>/ bulan · harga sedang diuji</small></div><ul><li>Semua dalam Explorer</li><li>E-buku dan koleksi premium</li><li>Audio narator manusia dan muat turun luar talian</li><li>Laluan mendalam dan sesi soal jawab bulanan</li></ul><button class="btn merah" data-act="ahli" data-pakej="Knowledge Plus">${S.ahli === 'Knowledge Plus' ? 'Dalam senarai menunggu' : 'Sertai senarai menunggu'}</button></div>
    <div class="pakej"><span class="eyebrow">Coffee Break Club</span><h3>Kelab Rehat Kopi</h3><div class="nilai">Diuji <small>/ bulan</small></div><ul><li>Semua dalam Knowledge Plus</li><li>Kotak kopi bulanan Sip 'n Go</li><li>Kandungan khas tentang kopi</li><li>Promosi ahli dan acara bersama penulis</li></ul><button class="btn garis" data-act="ahli" data-pakej="Coffee Break Club">${S.ahli === 'Coffee Break Club' ? 'Dalam senarai menunggu' : 'Sertai senarai menunggu'}</button></div>
  </div><p class="kecil-nota" style="padding-top:14px">Pakej dan harga ialah hipotesis yang sedang diuji dengan pembaca. Tiada caj dikenakan semasa menyertai senarai menunggu.</p></section>
  <section class="seksyen"><div class="dua-kolum-teks">
    <div class="blok-teks"><h3>Adakah kandungan percuma akan kekal percuma?</h3><p>Ya. Artikel, audio dan video asas kekal percuma. Keahlian menambah koleksi, bukan mengunci yang sedia ada.</p></div>
    <div class="blok-teks"><h3>Perlukah aku membeli kopi?</h3><p>Tidak. Sip 'n Go ialah teman rehat yang pilihan. Kau boleh menyembunyikan semua promosi kopi dalam tetapan profil.</p></div>
    <div class="blok-teks"><h3>Ke mana wang keahlian pergi?</h3><p>Kepada penulis, penyemak dan narator yang menghasilkan kandungan, serta kos pengehosan media.</p></div>
    <div class="blok-teks"><h3>Boleh berhenti bila-bila masa?</h3><p>Boleh. Kemajuan, nota dan simpanan kau kekal dalam akaun Explorer.</p></div>
  </div></section></div>`;

function petaIlmu() {
  const W = 800, H = 560, cx = 400, cy = 272;
  const pos = {}; const s = semua();
  const nod = KATEGORI.map((k, i) => {
    const sud = -Math.PI / 2 + i * Math.PI * 2 / KATEGORI.length;
    const kx = cx + 300 * Math.cos(sud), ky = cy + 170 * Math.sin(sud);
    const ahli = s.filter(a => a.kategori === k.id);
    ahli.forEach((a, j) => { const t = j * Math.PI * 2 / Math.max(1, ahli.length) + 0.4; const r = ahli.length > 1 ? 40 : 0; pos[a.slug] = [kx + r * Math.cos(t), ky + r * Math.sin(t)]; });
    const bawah = Math.sin(sud) > 0.9; const ly = bawah ? ky + 80 : ky - 72;
    const siap = ahli.filter(a => selesai(a.slug)).length;
    return `<g><circle cx="${kx}" cy="${ky}" r="62" class="peta-kawasan${siap ? ' ada' : ''}"/><text x="${kx}" y="${ly}" text-anchor="middle" class="peta-label">${esc(k.nama)}</text><text x="${kx}" y="${ly + 15}" text-anchor="middle" class="peta-kira">${siap}/${ahli.length} selesai</text></g>`;
  }).join('');
  const garis = new Set(); let tepi = '';
  s.forEach(a => (a.berkaitan || []).forEach(b => { if (!pos[b]) return; const k = [a.slug, b].sort().join('|'); if (garis.has(k)) return; garis.add(k); const [x1, y1] = pos[a.slug], [x2, y2] = pos[b]; const kedua = selesai(a.slug) && selesai(b); tepi += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" class="peta-garis${kedua ? ' kuat' : ''}"/>`; }));
  const titik = s.map(a => { const [x, y] = pos[a.slug]; const k = selesai(a.slug) ? 'selesai' : (S.format[a.slug] || S.akses[a.slug]) ? 'dibuka' : ''; return `<a href="#a.${a.slug}"><title>${esc(a.tajuk)}</title><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="9" class="peta-nod ${k}"/></a>`; }).join('');
  return `<svg class="peta-ilmu" viewBox="0 0 ${W} ${H}" role="img" aria-label="Peta ilmu peribadi: bidang dan topik yang telah diteroka">${nod}${tepi}${titik}</svg>`;
}

V.profil = () => {
  const rek = rekodHari(); const minitHari = Math.floor(rek.saat / 60); const g = S.tetapan.matlamat;
  const p = Math.min(1, minitHari / g); const C = 2 * Math.PI * 52;
  const L = lencanaSenarai(); const siri = kiraSiri();
  const nota = Object.entries(S.nota).filter(([, n]) => n && n.trim());
  return `<div class="bekas"><header class="halaman-kepala"><span class="eyebrow">${S.akaun ? 'Akaun' : 'Tetamu · data disimpan dalam peranti ini'}</span><h1>${S.akaun ? `Salam, ${esc(S.akaun.nama)}.` : 'Peta ilmu kau'}</h1>
  ${S.akaun ? `<p class="lede">${esc(S.akaun.emel)}</p>` : `<p class="lede">Kau boleh meneroka tanpa mendaftar. Cipta akaun untuk menyelaras simpanan dan kemajuan merentas peranti.</p><div><button class="btn" data-act="masuk">Cipta akaun / log masuk</button></div>`}</header>
  <div class="statistik"><div><b>${S.xp}</b><span>XP kefahaman</span></div><div><b>${Object.keys(S.selesai).length}</b><span>bahan selesai</span></div><div><b>${Object.values(S.hari).filter(h => h.aktif).length}</b><span>hari aktif</span></div>${S.tetapan.siri ? `<div><b>${siri}</b><span>siri hari · 1 hari rehat seminggu dibenarkan</span></div>` : ''}<div><b>${S.rehat}</b><span>Coffee Break 15 minit</span></div></div>

  <section class="seksyen"><div class="ritual"><svg class="cincin" viewBox="0 0 120 120" role="img" aria-label="${minitHari} daripada ${g} minit hari ini"><circle cx="60" cy="60" r="52" fill="none" stroke="var(--garis)" stroke-width="8"/><circle cx="60" cy="60" r="52" fill="none" stroke="var(--merah)" stroke-width="8" stroke-linecap="${p > 0 ? 'round' : 'butt'}" stroke-dasharray="${(C * p).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 60 60)"/><text x="60" y="58" text-anchor="middle" font-family="Newsreader, Georgia, serif" font-size="28" fill="var(--dakwat)">${minitHari}</text><text x="60" y="78" text-anchor="middle" font-family="Public Sans, sans-serif" font-size="11" fill="var(--kelabu)">/ ${g} minit</text></svg>
    <div style="display:grid;gap:10px;min-width:0;flex:1 1 260px"><span class="eyebrow">Ritual ilmu harian</span><h2 class="h-seksyen">${p >= 1 ? 'Matlamat hari ini tercapai.' : 'Sasaran kecil, setiap hari.'}</h2><p class="kecil-nota">Masa dikira semasa membaca, mendengar atau menonton. XP pula hanya diberi untuk kefahaman: tanda selesai, kuiz dan laluan.</p>
    <div class="segmen" role="group" aria-label="Matlamat harian" style="max-width:300px">${[5, 10, 20].map(n => `<button data-act="matlamat" data-n="${n}" aria-pressed="${g === n}">${n} minit</button>`).join('')}</div></div></div></section>

  <section class="seksyen">${kepalaSeksyen('Peta ilmu peribadi', 'Bidang yang telah kau teroka', 'Setiap titik ialah satu topik. Merah: selesai. Bergaris: sudah dibuka. Garisan menunjukkan topik yang berkaitan.')}<div class="peta-bekas">${petaIlmu()}</div></section>

  <section class="seksyen">${kepalaSeksyen('Lencana', `${L.filter(x => x.ok).length} daripada ${L.length}`, 'Ganjaran untuk kefahaman dan kepelbagaian, bukan masa skrin.')}<div class="lencana-grid">${L.map(x => `<div class="lencana ${x.ok ? 'dapat' : ''}"><span class="simbol" aria-hidden="true">${x.s}</span><b>${esc(x.n)}</b><small>${esc(x.d)}</small></div>`).join('')}</div></section>

  <section class="seksyen">${kepalaSeksyen('Koleksi peribadi', 'Simpanan', S.simpan.length ? '' : 'Tekan Simpan pada mana-mana artikel atau video.')}${S.simpan.length ? `<div class="grid-artikel tiga">${S.simpan.map(cari).filter(Boolean).map(a => kadArtikel(a, false)).join('')}</div>` : ''}</section>

  ${nota.length ? `<section class="seksyen">${kepalaSeksyen('Nota', 'Nota dan refleksi kau', '')}<ul class="senarai-baris">${nota.map(([s, n]) => { const a = cari(s); return a ? `<li><div class="baris" style="grid-template-columns:1fr"><div class="tajuk-baris"><a href="#a.${s}">${esc(a.tajuk)}</a><span style="font-family:var(--serif);color:var(--kelabu)">${esc(n.slice(0, 220))}${n.length > 220 ? '…' : ''}</span></div></div></li>` : ''; }).join('')}</ul></section>` : ''}

  ${S.pesanan.length ? `<section class="seksyen">${kepalaSeksyen('Sip \'n Go', 'Pesanan kopi', '', '<a class="pautan" href="#troli">Troli</a>')}<ul class="senarai-baris">${S.pesanan.slice(0, 5).map(o => `<li><div class="baris"><span class="no">${tarikh(o.masa).split(' ').slice(0, 2).join(' ')}</span><div class="tajuk-baris"><a href="#o.${o.id}">${esc(o.id)}</a><span class="meta"><span>${STATUS(o)[tahapPesanan(o)]}</span></span></div><button class="btn kecil garis" data-act="pesan-semula" data-id="${o.id}">Pesan semula</button></div></li>`).join('')}</ul></section>` : ''}

  <section class="seksyen">${kepalaSeksyen('Tetapan', 'Pengalaman kau, peraturan kau', '')}<div class="tetapan-senarai">
    <div class="tetapan-baris"><div><b>Tema</b><small>Ikut sistem, terang atau gelap.</small></div><div class="segmen" role="group" aria-label="Tema">${[['sistem', 'Sistem'], ['light', 'Terang'], ['dark', 'Gelap']].map(([v, n]) => `<button data-act="tema" data-v="${v}" aria-pressed="${S.tetapan.tema === v}">${n}</button>`).join('')}</div></div>
    <div class="tetapan-baris"><div><b>Saiz teks bacaan</b></div><div class="segmen" role="group" aria-label="Saiz teks">${['S', 'M', 'L', 'XL'].map((n, i) => `<button data-act="fon" data-v="${i}" aria-pressed="${S.tetapan.fon === i}">${n}</button>`).join('')}</div></div>
    <div class="tetapan-baris"><div><b>Kekerapan peringatan</b><small>Kau yang tentukan. Tiada peringatan bertubi-tubi.</small></div><div class="segmen" role="group" aria-label="Notifikasi">${[['tiada', 'Tiada'], ['mingguan', 'Mingguan'], ['harian', 'Harian']].map(([v, n]) => `<button data-act="notifikasi" data-v="${v}" aria-pressed="${S.tetapan.notifikasi === v}">${n}</button>`).join('')}</div></div>
    <div class="tetapan-baris"><div><b>Paparkan siri hari</b><small>Matikan jika siri membuatkan kau rasa tertekan.</small></div><button class="suis" role="switch" aria-checked="${S.tetapan.siri}" data-act="suis" data-k="siri" aria-label="Paparkan siri hari"></button></div>
    <div class="tetapan-baris"><div><b>Sembunyikan promosi kopi</b><small>Buang jalur Sip 'n Go dan cadangan kopi dari halaman bacaan.</small></div><button class="suis" role="switch" aria-checked="${S.tetapan.sorokKopi}" data-act="suis" data-k="sorokKopi" aria-label="Sembunyikan promosi kopi"></button></div>
    <div class="tetapan-baris"><div><b>Pasang sebagai app</b><small>Buka Ruang Ilmu dari skrin utama telefon atau komputer.</small></div><button class="btn kecil garis" data-act="pasang">Pasang app</button></div>
    <div class="tetapan-baris"><div><b>Padam data dalam peranti ini</b><small>Kemajuan, nota, troli dan pesanan akan dipadam.</small></div><button class="btn kecil garis" data-act="padam-data">Padam data</button></div>
    ${S.akaun ? `<div class="tetapan-baris"><div><b>Log keluar</b></div><button class="btn kecil garis" data-act="keluar">Log keluar</button></div>` : ''}
  </div></section></div>`;
};

V.tentang = () => `<div class="bekas"><header class="halaman-kepala"><span class="eyebrow">Tentang Ruang Ilmu</span><h1>Orang datang kerana kandungan, kembali kerana pengalaman, dan membeli kerana kepercayaan.</h1><p class="lede">Ruang Ilmu ialah platform untuk membaca, melihat, mendengar dan meneroka ilmu dalam pengalaman yang santai, menarik, mudah diakses dan boleh dipercayai. Sip 'n Go Coffee ialah teman rehatnya.</p></header>
  <section class="seksyen"><div class="dua-kolum-teks">
    <div class="blok-teks"><h3>Misi</h3><ul><li>Menjadikan ilmu lebih mudah difahami oleh orang awam.</li><li>Membolehkan pengguna belajar mengikut masa, minat dan gaya mereka.</li><li>Menghubungkan ilmu daripada pelbagai bidang.</li><li>Membina tabiat pembelajaran sepanjang hayat.</li><li>Menyokong pencipta kandungan dan perniagaan kopi dalam ekosistem yang sama.</li></ul></div>
    <div class="blok-teks"><h3>Prinsip produk</h3><ul><li>Ilmu dahulu: kandungan berkualiti ialah sebab utama pengguna datang.</li><li>Pelbagai format: satu topik dalam teks, visual dan audio.</li><li>Penerokaan berhubung melalui laluan dan cadangan yang relevan.</li><li>Gamifikasi sihat: tiada hukuman apabila berehat.</li><li>Perniagaan yang jelas: kandungan percuma, produk digital dan kopi dibezakan.</li></ul></div>
  </div></section>
  <section class="seksyen" id="standard">${kepalaSeksyen('Standard editorial', 'Bagaimana setiap bahan dihasilkan', '')}
  <div class="jadual-bekas"><table class="jadual"><thead><tr><th>Langkah</th><th>Aktiviti</th><th>Kawalan kualiti</th></tr></thead><tbody>${LANGKAH.map((l, i) => `<tr><td>${i + 1}. ${l[0]}</td><td>${l[1]}</td><td>${l[2]}</td></tr>`).join('')}</tbody></table></div>
  <div class="dua-kolum-teks" style="padding-top:28px"><div class="blok-teks"><h3>Kami berjanji</h3><ul><li>Membezakan fakta, tafsiran dan pendapat.</li><li>Menyediakan sumber yang boleh diperiksa dan tarikh kemas kini.</li><li>Menjelaskan hak penggunaan teks, imej, audio dan video.</li><li>Membetulkan kesilapan secara terbuka.</li></ul></div>
  <div class="blok-teks"><h3>Untuk topik sensitif</h3><ul><li>Kandungan agama membezakan teks sumber, terjemahan, huraian dan pendapat, dan disemak oleh penyemak yang berkelayakan.</li><li>Kandungan psikologi dan kesihatan mengelak diagnosis dan dakwaan sebab-akibat tanpa bukti mencukupi.</li><li>AI boleh membantu penyelidikan awal dan penyuntingan, tetapi tidak menggantikan semakan manusia.</li></ul></div></div>
  <p style="padding-top:20px"><button class="btn garis" data-act="lapor">Laporkan kesilapan</button> <a class="btn garis" href="#studio">Lihat Studio editorial</a></p></section>
  <section class="seksyen">${kepalaSeksyen('Pelan', 'Pelan pelaksanaan 12 bulan', 'Jadual ialah sasaran perancangan, bukan jaminan tempoh.')}
  <div class="jadual-bekas"><table class="jadual"><thead><tr><th>Tempoh</th><th>Fokus</th><th>Hasil yang dikehendaki</th></tr></thead><tbody>
    <tr><td>Bulan 1</td><td>Temu bual 15–25 pengguna, prototaip, 10–15 kandungan, uji minat kopi</td><td>Bukti masalah dan konsep mempunyai tarikan</td></tr>
    <tr><td>Bulan 2–3</td><td>MVP website, CMS, kandungan teks/audio/video, simpanan, kedai kopi, analitik</td><td>Versi beta yang boleh diuji</td></tr>
    <tr><td>Bulan 4–6</td><td>Laluan ilmu, kuiz, cadangan, ujian keahlian dan kempen kopi</td><td>Bukti pengguna kembali dan permintaan berbayar</td></tr>
    <tr><td>Bulan 7–9</td><td>Penyumbang terpilih, koleksi premium, acara, SEO dan kerjasama</td><td>Kandungan berkembang dengan proses terkawal</td></tr>
    <tr><td>Bulan 10–12</td><td>Nilai aplikasi native, luar talian, audio dan langganan</td><td>Keputusan pengembangan berdasarkan data</td></tr>
  </tbody></table></div></section>
  <section class="seksyen">${kepalaSeksyen('Komuniti', 'Peranan penyumbang', 'Kami bermula dengan pasukan editorial. Penyertaan dibuka secara berperingkat selepas proses stabil.')}
  <div class="dua-kolum-teks"><div class="blok-teks"><h3>Kurator, penyumbang, penyemak</h3><p>Kurator memilih topik dan menyusun koleksi. Penyumbang menghasilkan artikel, audio atau video. Penyemak memastikan ketepatan, konteks, bahasa dan kesesuaian.</p></div><div class="blok-teks"><h3>Ingin menyumbang?</h3><p>Hantar cadangan topik atau minat menjadi penyumbang. Kami akan menghubungi apabila penyertaan dibuka.</p><div><button class="btn kecil garis" data-act="cadang-topik">Cadangkan topik</button></div></div></div></section>
  <p class="kecil-nota" style="padding-bottom:32px">"Ruang Ilmu" ialah nama kerja. Identiti dan nama akhir akan diuji sebelum pelancaran.</p></div>`;
const LANGKAH = [
  ['Pemilihan topik', 'Pilih soalan pengguna dan jurang pengetahuan', 'Relevan dan jelas skopnya'],
  ['Penyelidikan', 'Kumpul sumber primer dan sekunder', 'Catat sumber dan tarikh akses'],
  ['Penulisan', 'Bina manuskrip utama', 'Hujah dan struktur jelas'],
  ['Semakan', 'Semak fakta, bahasa, konteks dan dakwaan', 'Penyemak yang sesuai dengan bidang'],
  ['Adaptasi', 'Sediakan artikel, audio, video dan visual', 'Format sesuai dengan medium'],
  ['Penerbitan', 'Tambah metadata dan pautan berkaitan', 'Semak paparan dan hak media'],
  ['Penilaian', 'Ukur penggunaan dan maklum balas', 'Baiki kandungan berdasarkan bukti']
];

function semakMetadata(d) {
  return [
    ['Tajuk dan ringkasan', !!(d.tajuk && d.dek && d.ringkas60)],
    ['Kategori, tag dan tahap', !!(d.kategori && d.tag?.length && d.tahap)],
    ['Isi sekurang-kurangnya 80 perkataan', kiraPerkataan(d.isi || '') >= 80],
    ['Sekurang-kurangnya satu sumber', (d.sumber || []).length >= 1],
    ['Penulis dan penyemak dinamakan', !!(d.penulis && d.penyemak)]
  ];
}
V.studio = () => `<div class="bekas"><header class="halaman-kepala"><span class="eyebrow">Studio editorial · prototaip CMS</span><h1>Dari soalan pembaca ke bahan yang disemak</h1><p class="lede">Setiap bahan melalui tujuh langkah. Butang terbit hanya aktif apabila metadata minimum lengkap. Draf disimpan dalam peranti ini.</p><div><button class="btn" data-act="draf-baru">Draf baharu</button></div></header>
  <section class="seksyen">${kepalaSeksyen('Dalam proses', `${S.draf.length} draf`, S.draf.length ? '' : 'Belum ada draf. Mulakan dengan satu soalan yang sering ditanya pembaca.')}
  ${S.draf.map(d => { const sm = semakMetadata(d); const lengkap = sm.every(x => x[1]); return `<div class="studio-baris"><div class="atas"><b style="font-family:var(--serif);font-size:1.25rem">${esc(d.tajuk || 'Tanpa tajuk')}</b><span class="meta"><span>${esc(KAT[d.kategori]?.nama || '—')}</span><span>Langkah ${Math.min(d.langkah + 1, 7)}/7: ${LANGKAH[Math.min(d.langkah, 6)][0]}</span>${d.langkah >= 6 ? '<span style="color:var(--baik)">Diterbitkan</span>' : ''}</span></div>
    <div class="aliran" aria-hidden="true">${LANGKAH.map((l, i) => `<span class="${i <= d.langkah ? 'siap' : ''}"></span>`).join('')}</div>
    <ul class="semak-senarai">${sm.map(([n, ok]) => `<li class="${ok ? 'ok' : ''}">${n}</li>`).join('')}</ul>
    <div class="butang-format"><button class="btn kecil garis" data-act="draf-sunting" data-id="${d.id}">Sunting</button>${d.langkah < 5 ? `<button class="btn kecil" data-act="draf-maju" data-id="${d.id}">Maju ke ${LANGKAH[d.langkah + 1][0]}</button>` : d.langkah === 5 ? `<button class="btn kecil merah" data-act="draf-maju" data-id="${d.id}" ${lengkap ? '' : 'disabled'}>Terbitkan</button>${lengkap ? '' : '<span class="kecil-nota">Lengkapkan metadata untuk terbit.</span>'}` : `<a class="btn kecil" href="#a.d-${d.id}">Lihat bahan</a>`}<button class="btn kecil garis" data-act="draf-padam" data-id="${d.id}">Padam</button></div></div>`; }).join('')}</section>
  <section class="seksyen">${kepalaSeksyen('Diterbitkan', `${KANDUNGAN.length} bahan contoh`, 'Semua bahan contoh mempunyai sumber, metadata dan status semakan.')}
  <div class="jadual-bekas"><table class="jadual"><thead><tr><th>Tajuk</th><th>Bidang</th><th>Sumber</th><th>Kemas kini</th></tr></thead><tbody>${KANDUNGAN.map(a => `<tr><td><a class="pautan" href="#a.${a.slug}" style="font-weight:400">${esc(a.tajuk)}</a></td><td>${esc(KAT[a.kategori].nama)}</td><td>${a.rujukan.length}</td><td>${tarikh(a.kemas)}</td></tr>`).join('')}</tbody></table></div></section>
  ${S.laporan.length ? `<section class="seksyen">${kepalaSeksyen('Maklum balas', 'Laporan dan cadangan pembaca', '')}<ul class="senarai-baris">${S.laporan.map(l => `<li><div class="baris" style="grid-template-columns:1fr"><div class="tajuk-baris"><b>${esc(l.jenis)}${l.slug ? ` · ${esc(cari(l.slug)?.tajuk || l.slug)}` : ''}</b><span style="color:var(--kelabu)">${esc(l.teks)}</span><span class="meta"><span>${tarikh(l.masa)}</span></span></div></div></li>`).join('')}</ul></section>` : ''}</div>`;

function borangDraf(d) {
  return `<form class="borang-grid" data-borang="draf" data-id="${d?.id || ''}">
    <div class="medan"><label for="dTajuk">Tajuk</label><input id="dTajuk" required value="${esc(d?.tajuk)}" placeholder="Soalan atau tajuk yang jelas"></div>
    <div class="medan"><label for="dDek">Ringkasan satu ayat</label><input id="dDek" value="${esc(d?.dek)}"></div>
    <div class="borang-grid dua"><div class="medan"><label for="dKat">Kategori</label><select id="dKat">${KATEGORI.map(k => `<option value="${k.id}" ${d?.kategori === k.id ? 'selected' : ''}>${esc(k.nama)}</option>`).join('')}</select></div><div class="medan"><label for="dTahap">Tahap</label><select id="dTahap">${['Asas', 'Pertengahan', 'Mendalam'].map(t => `<option ${d?.tahap === t ? 'selected' : ''}>${t}</option>`).join('')}</select></div></div>
    <div class="medan"><label for="dTag">Tag (pisahkan dengan koma)</label><input id="dTag" value="${esc((d?.tag || []).join(', '))}"></div>
    <div class="medan"><label for="dRingkas">Faham dalam 60 saat</label><textarea id="dRingkas" rows="3">${esc(d?.ringkas60)}</textarea></div>
    <div class="medan"><label for="dIsi">Isi (mulakan bab dengan "## ", pisahkan perenggan dengan baris kosong, ==sorotan==)</label><textarea id="dIsi" rows="8">${esc(d?.isi)}</textarea></div>
    <div class="medan"><label for="dSumber">Sumber (satu setiap baris)</label><textarea id="dSumber" rows="3">${esc((d?.sumber || []).join('\n'))}</textarea></div>
    <div class="borang-grid dua"><div class="medan"><label for="dPenulis">Penulis</label><input id="dPenulis" value="${esc(d?.penulis)}"></div><div class="medan"><label for="dPenyemak">Penyemak</label><input id="dPenyemak" value="${esc(d?.penyemak)}"></div></div>
    <button class="btn" type="submit">Simpan draf</button></form>`;
}

V.tiada = () => `<div class="bekas"><header class="halaman-kepala"><span class="eyebrow">Tidak dijumpai</span><h1>Halaman ini tiada di rak kami.</h1><p class="lede">Mungkin pautannya sudah berubah. <a class="pautan" href="#teroka">Cari ilmu</a> atau kembali ke <a class="pautan" href="#utama">halaman utama</a>.</p></header></div>`;

/* ================= Kaki ================= */
function kaki() {
  $('#kaki').innerHTML = `<div class="bekas">
    <div><a class="jenama" href="#utama"><b>Ruang Ilmu<i>.</i></b></a><p class="kecil-nota" style="margin-top:10px;max-width:28ch">Ilmu yang tahan zaman, dengan Sip 'n Go Coffee sebagai teman rehat.</p></div>
    <div><h4>Format</h4><ul><li><a href="#baca">Baca</a></li><li><a href="#lihat">Lihat</a></li><li><a href="#dengar">Dengar</a></li><li><a href="#laluan">Laluan ilmu</a></li><li><a href="#teroka">Teroka & cari</a></li></ul></div>
    <div><h4>Sip 'n Go Coffee</h4><ul><li><a href="#kopi">Kedai</a></li><li><a href="#rehat">Rehat 15 minit</a></li><li><a href="#ahli">Coffee Break Club</a></li><li><a href="#troli">Troli & pesanan</a></li></ul></div>
    <div><h4>Ruang Ilmu</h4><ul><li><a href="#tentang">Tentang & standard editorial</a></li><li><a href="#ahli">Keahlian</a></li><li><a href="#studio">Studio editorial</a></li><li><button class="pautan" data-act="lapor" style="color:inherit;font-weight:400;text-decoration:none">Laporkan kesilapan</button></li><li><button class="pautan" data-act="privasi" style="color:inherit;font-weight:400;text-decoration:none">Privasi & terma</button></li></ul></div>
    <p class="nota-kaki">Prototaip ${new Date().getFullYear()}. Kemajuan, nota, troli dan pesanan disimpan dalam peranti ini sahaja. Harga dan pakej ialah andaian yang sedang diuji. "Ruang Ilmu" ialah nama kerja.</p>
  </div>`;
}

/* ================= Router ================= */
function bacaHash() {
  const h = decodeURIComponent(location.hash.replace(/^#/, '')) || 'utama';
  const i = h.indexOf('.');
  return i > 0 ? { v: h.slice(0, i), p: h.slice(i + 1) } : { v: h, p: '' };
}
function render() {
  const r = bacaHash();
  const lama = CURR; CURR = r;
  if (lama.v === 'v' && (r.v !== 'v' || r.p !== lama.p)) Video.henti();
  const fn = V[r.v] || V.tiada;
  const main = $('#kandungan');
  main.innerHTML = fn(r.p);
  document.title = tajukHalaman(r);
  $$('[data-nav]').forEach(a => { if (a.dataset.nav === NAV_ATAS[r.v]) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
  $$('[data-tab]').forEach(a => { if (a.dataset.tab === (NAV_TAB[r.v] || '')) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
  $('#kemajuanBaca').hidden = r.v !== 'a';
  selepasRender(r, lama);
}
function tajukHalaman(r) {
  if (r.v === 'a' || r.v === 'v') { const a = cari(r.p); return a ? `${a.tajuk} · Ruang Ilmu` : 'Ruang Ilmu'; }
  if (r.v === 'p') return `${PROD[r.p]?.nama || 'Kopi'} · Sip 'n Go Coffee`;
  const n = { baca: 'Baca', lihat: 'Lihat', dengar: 'Dengar', teroka: 'Teroka', laluan: 'Laluan Ilmu', kopi: "Sip 'n Go Coffee", troli: 'Troli', rehat: 'Coffee Break 15 Minit', ahli: 'Keahlian', profil: 'Profil', tentang: 'Tentang', studio: 'Studio' }[r.v];
  return n ? `${n} · Ruang Ilmu` : 'Ruang Ilmu';
}
function selepasRender(r, lama) {
  const samaHalaman = lama.v === r.v && lama.p === r.p;
  if (!samaHalaman) window.scrollTo(0, 0);
  if (r.v === 'surat') { const e = $('#emelHero'); const s = $('#surat-borang'); if (s) s.scrollIntoView({ block: 'center' }); if (e) e.focus({ preventScroll: true }); }
  if (r.v === 'a') pasangBacaan(r.p);
  if (r.v === 'v') { if (Video.slug !== r.p || !samaHalaman) Video.sedia(r.p); Video.lukis(); }
  if (r.v === 'rehat') { Rehat.lukis(); }
  if (Pemain.slug) Pemain.lukis();
  kemasPengepala();
}
function kemasPengepala() {
  const n = kiraTroli(); const b = $('#kiraTroli'); b.hidden = !n; b.textContent = n;
}

/* ================= Bacaan: kemajuan, isi kandungan ================= */
let pemerhati, gulungT;
function pasangBacaan(slug) {
  S.akses[slug] = Date.now(); simpan();
  const pro = $('#prosa'); if (!pro) return;
  pemerhati?.disconnect();
  const tajuk = $$('h2', pro); const pautan = $$('.isi-kandungan a');
  if ('IntersectionObserver' in window) {
    pemerhati = new IntersectionObserver(en => { en.forEach(e => { if (e.isIntersecting) { const i = tajuk.indexOf(e.target); pautan.forEach((p, j) => p.classList.toggle('aktif', j === i)); } }); }, { rootMargin: '-20% 0px -70% 0px' });
    tajuk.forEach(t => pemerhati.observe(t));
  }
}
window.addEventListener('scroll', () => {
  if (CURR.v !== 'a') return;
  const pro = $('#prosa'); if (!pro) return;
  const r = pro.getBoundingClientRect(); const tinggi = r.height - innerHeight * 0.6;
  const p = Math.max(0, Math.min(100, Math.round((-r.top + innerHeight * 0.2) / Math.max(1, tinggi) * 100)));
  $('#kemajuanBaca').style.width = p + '%';
  clearTimeout(gulungT);
  gulungT = setTimeout(() => {
    const slug = CURR.p; if (!cari(slug)) return;
    if (p > (S.posisi[slug] || 0) || p < 3) S.posisi[slug] = p;
    if (p >= 80) (S.format[slug] ||= {}).baca = true;
    simpan();
  }, 400);
}, { passive: true });

/* Masa ritual: dikira hanya ketika halaman kelihatan dan pengguna sedang membaca, menonton atau mendengar. */
setInterval(() => {
  if (document.visibilityState !== 'visible' && !Pemain.main) return;
  const aktif = Pemain.main || (Video.main && CURR.v === 'v') || (CURR.v === 'a' && Date.now() - (window.__gerak || 0) < 60000) || (Rehat.main);
  if (!aktif) return;
  const r = rekodHari(); const sebelum = Math.floor(r.saat / 60); r.saat += 5;
  if (Math.floor(r.saat / 60) >= S.tetapan.matlamat && sebelum < S.tetapan.matlamat) { r.aktif = true; toast(`Ritual ${S.tetapan.matlamat} minit hari ini tercapai.`); }
  simpan();
}, 5000);
['scroll', 'pointermove', 'keydown', 'touchstart'].forEach(e => window.addEventListener(e, () => { window.__gerak = Date.now(); }, { passive: true }));

/* ================= Tema ================= */
function terapTetapan() {
  const t = S.tetapan.tema; if (t === 'sistem') document.documentElement.removeAttribute('data-theme'); else document.documentElement.setAttribute('data-theme', t);
  document.documentElement.style.setProperty('--fs-bacaan', ['1.05rem', '1.2rem', '1.35rem', '1.5rem'][S.tetapan.fon] || '1.2rem');
}

/* ================= Aksi ================= */
const A = {};
A['tutup-modal'] = tutupModal;
A.dengar = el => { const s = el.dataset.slug; if (Pemain.slug === s) Pemain.togol(); else Pemain.mula(s); };
A['pemain-togol'] = () => Pemain.togol();
A['pemain-undur'] = () => Pemain.lompat(-1);
A['pemain-maju'] = () => Pemain.lompat(1);
A['pemain-laju'] = () => Pemain.tukarLaju();
A['pemain-tidur'] = () => Pemain.tukarTidur();
A['pemain-tutup'] = () => Pemain.tutup();
A['video-togol'] = () => { if (Video.main) Video.jeda(); else { if (Video.i === Video.x.length - 1 && Video.t >= Video.x[Video.i].saat) Video.ke(0); Video.mula(); } };
A['video-ke'] = el => { Video.ke(+el.dataset.i); if (!Video.main) Video.mula(); };
A['video-kapsyen'] = () => { Video.kapsyen = !Video.kapsyen; Video.lukis(); };
A['video-narasi'] = () => { Video.narasi = !Video.narasi; if (!Video.narasi && sokongSuara) { speechSynthesis.cancel(); Video.cakapSiap = true; } else if (Video.main) Video.bacaNarasi(); Video.lukis(); };
A.simpan = el => {
  const s = el.dataset.slug; const i = S.simpan.indexOf(s);
  if (i >= 0) S.simpan.splice(i, 1); else S.simpan.unshift(s);
  simpan(); toast(i >= 0 ? 'Dibuang dari simpanan' : 'Disimpan dalam koleksi peribadi'); render();
};
A.kongsi = () => {
  const url = location.href;
  const gagal = () => bukaModal('Salin pautan', `<div class="medan"><label for="pautanKongsi">Pautan</label><input id="pautanKongsi" readonly value="${esc(url)}"></div>`) || setTimeout(() => $('#pautanKongsi')?.select(), 30);
  try { navigator.clipboard.writeText(url).then(() => toast('Pautan disalin'), gagal); } catch (e) { gagal(); }
};
A['sambung-baca'] = () => {
  const pro = $('#prosa'); const p = S.posisi[CURR.p] || 0; if (!pro) return;
  const r = pro.getBoundingClientRect(); window.scrollTo({ top: scrollY + r.top + (r.height - innerHeight * 0.6) * p / 100 - innerHeight * 0.2, behavior: 'smooth' });
};
A['tetapan-baca'] = el => {
  const ada = $('.popover'); if (ada) { ada.remove(); el.setAttribute('aria-expanded', 'false'); return; }
  el.setAttribute('aria-expanded', 'true');
  const d = document.createElement('div'); d.className = 'popover'; d.style.right = '0'; d.style.top = '100%';
  d.innerHTML = `<b>Tetapan bacaan</b><div class="segmen" role="group" aria-label="Saiz teks">${['S', 'M', 'L', 'XL'].map((n, i) => `<button data-act="fon" data-v="${i}" aria-pressed="${S.tetapan.fon === i}">${n}</button>`).join('')}</div><div class="segmen" role="group" aria-label="Tema">${[['sistem', 'Sistem'], ['light', 'Terang'], ['dark', 'Gelap']].map(([v, n]) => `<button data-act="tema" data-v="${v}" aria-pressed="${S.tetapan.tema === v}">${n}</button>`).join('')}</div>`;
  el.parentElement.appendChild(d);
};
A.fon = el => { S.tetapan.fon = +el.dataset.v; simpan(); terapTetapan(); $$('[data-act="fon"]').forEach(b => b.setAttribute('aria-pressed', b === el || +b.dataset.v === S.tetapan.fon)); };
A.tema = el => { S.tetapan.tema = el.dataset.v; simpan(); terapTetapan(); $$('[data-act="tema"]').forEach(b => b.setAttribute('aria-pressed', b.dataset.v === S.tetapan.tema)); };
A.selesai = el => {
  const s = el.dataset.slug;
  if (S.selesai[s]) { delete S.selesai[s]; simpan(); toast('Tanda selesai dibuang'); render(); return; }
  S.selesai[s] = hariIni(); (S.format[s] ||= {}).baca = true;
  if (!S.xpSelesai?.[s]) { (S.xpSelesai ||= {})[s] = 1; tambahXP(20, 'Bahan selesai'); } else { tandaAktif(); toast('Ditanda selesai'); }
  semakLaluan(); render();
};
A.jawab = el => {
  const s = el.dataset.slug, q = +el.dataset.q, j = +el.dataset.j; const a = cari(s);
  const pertama = !(S.xpKuiz?.[s]?.[q]);
  (S.kuiz[s] ||= {})[q] = j;
  if (pertama) { ((S.xpKuiz ||= {})[s] ||= {})[q] = 1; if (j === a.kuiz[q].j) tambahXP(10, 'Jawapan tepat'); else tandaAktif(); }
  simpan();
  const y = scrollY; render(); window.scrollTo(0, y);
};
A['ulang-kuiz'] = el => { delete S.kuiz[el.dataset.slug]; simpan(); const y = scrollY; render(); window.scrollTo(0, y); };
A.lapor = el => {
  const s = el.dataset.slug || (CURR.v === 'a' ? CURR.p : '');
  bukaModal('Laporkan kesilapan', `<form class="borang-grid" data-borang="lapor" data-slug="${esc(s)}"><p class="kecil-nota">${s ? `Untuk: <b>${esc(cari(s)?.tajuk)}</b>. ` : ''}Terangkan apa yang salah dan, jika boleh, sertakan sumber pembetulan. Pasukan editorial menyemak setiap laporan.</p><div class="medan"><label for="lJenis">Jenis</label><select id="lJenis"><option>Fakta tidak tepat</option><option>Sumber tidak sesuai</option><option>Bahasa atau ejaan</option><option>Isu hak cipta</option><option>Lain-lain</option></select></div><div class="medan"><label for="lTeks">Butiran</label><textarea id="lTeks" rows="4" required></textarea></div><button class="btn" type="submit">Hantar laporan</button></form>`);
};
A['cadang-topik'] = () => bukaModal('Cadangkan topik', `<form class="borang-grid" data-borang="lapor" data-jenis="Cadangan topik"><div class="medan"><label for="lTeks">Soalan atau topik yang kau ingin tahu</label><textarea id="lTeks" rows="3" required>${esc(CARI.q)}</textarea></div><button class="btn" type="submit">Hantar cadangan</button></form>`);
A.soalan = el => { CARI.q = el.dataset.q; const m = $('#medanCari'); if (m) m.value = CARI.q; $('#hasilCari').innerHTML = hasilCari(CURR.p); };
A['tapis-kat'] = el => { location.hash = el.dataset.kat ? 'teroka.' + el.dataset.kat : 'teroka'; };
A['tapis-tahap'] = el => { CARI.tahap = el.dataset.tahap; render(); };
A['tapis-pendek'] = () => { CARI.pendek = !CARI.pendek; render(); };
A['kuantiti-produk'] = el => { const s = $('#kuantitiProduk'); s.textContent = Math.max(1, Math.min(20, +s.textContent + +el.dataset.d)); };
A['tambah-troli'] = el => { const n = +($('#kuantitiProduk')?.textContent || 1); S.troli[el.dataset.id] = (S.troli[el.dataset.id] || 0) + n; simpan(); kemasPengepala(); toast(`${n}× ${PROD[el.dataset.id].nama} ditambah ke troli`); };
A['troli-ubah'] = el => { const id = el.dataset.id; S.troli[id] = Math.max(0, (S.troli[id] || 0) + +el.dataset.d); if (!S.troli[id]) delete S.troli[id]; simpan(); render(); };
A.kaedah = el => { if (TROLI.kaedah !== el.value) { TROLI.kaedah = el.value; const nama = $('#pNama')?.value, tel = $('#pTel')?.value; render(); if (nama) $('#pNama').value = nama; if (tel) $('#pTel').value = tel; } };
A['pesan-semula'] = el => { const o = S.pesanan.find(x => x.id === el.dataset.id); if (!o) return; o.item.forEach(i => { S.troli[i.id] = (S.troli[i.id] || 0) + i.n; }); simpan(); location.hash = 'troli'; toast('Item pesanan lama ditambah ke troli'); };
A['rehat-togol'] = () => Rehat.togol();
A['rehat-langkau'] = () => { Rehat.langkau(); render(); };
A['rehat-set'] = () => { Rehat.set(); render(); };
A.ahli = el => { S.ahli = el.dataset.pakej; simpan(); toast(`Kau dalam senarai menunggu ${S.ahli}. Tiada caj dikenakan.`); render(); };
A.matlamat = el => { S.tetapan.matlamat = +el.dataset.n; simpan(); render(); };
A.notifikasi = el => { S.tetapan.notifikasi = el.dataset.v; simpan(); toast('Kekerapan peringatan dikemas kini'); render(); };
A.suis = el => { const k = el.dataset.k; S.tetapan[k] = !S.tetapan[k]; simpan(); render(); };
A['padam-data'] = () => bukaModal('Padam semua data?', `<p>Kemajuan, XP, nota, simpanan, troli, pesanan dan draf Studio dalam peranti ini akan dipadam. Tindakan ini tidak boleh dibatalkan.</p><div class="butang-format"><button class="btn merah" data-act="padam-sah">Ya, padam</button><button class="btn garis" data-act="tutup-modal">Batal</button></div>`);
A['padam-sah'] = () => { S = asal(); simpan(); INDEKS = null; tutupModal(); terapTetapan(); toast('Data dipadam'); render(); };
A.masuk = () => bukaModal('Akaun Ruang Ilmu', `<form class="borang-grid" data-borang="akaun"><p class="kecil-nota">Prototaip: akaun disimpan dalam peranti ini sahaja untuk menunjukkan aliran. Versi pelancaran menggunakan log masuk emel yang selamat.</p><div class="medan"><label for="aNama">Nama paparan</label><input id="aNama" required autocomplete="nickname"></div><div class="medan"><label for="aEmel">Emel</label><input id="aEmel" type="email" required autocomplete="email" value="${esc(S.surat?.emel || '')}"></div><button class="btn" type="submit">Teruskan</button></form>`);
A.keluar = () => { S.akaun = null; simpan(); toast('Kau telah log keluar. Kemajuan kekal dalam peranti ini.'); render(); };
A.privasi = () => bukaModal('Privasi & terma', `<div class="blok-teks"><p>Prototaip ini tidak menghantar data ke mana-mana pelayan. Semua kemajuan, nota dan pesanan disimpan dalam storan pelayar peranti kau.</p><p>Versi pelancaran akan mengumpul data minimum: emel untuk akaun dan surat, kemajuan pembelajaran, dan butiran pesanan untuk penghantaran. Data tidak dijual. Kau boleh meminta data dipadam bila-bila masa.</p><p>Kandungan dilindungi hak cipta Ruang Ilmu atau pemilik asal yang dinyatakan dalam sumber.</p></div>`);
A.pasang = () => {
  if (window.__pasang) { window.__pasang.prompt(); window.__pasang = null; return; }
  bukaModal('Pasang Ruang Ilmu', `<div class="blok-teks"><p><b>Android (Chrome):</b> menu ⋮ → <i>Install app</i> atau <i>Tambah ke skrin utama</i>.</p><p><b>iPhone (Safari):</b> butang Kongsi → <i>Add to Home Screen</i>.</p><p><b>Komputer (Chrome/Edge):</b> ikon pasang di hujung bar alamat.</p><p class="kecil-nota">App yang dipasang dibuka tanpa bar pelayar dan boleh membuka bahan yang pernah dibaca walaupun tanpa internet.</p></div>`);
};
A['pilih-rehat'] = () => {};
A.bab = el => { const h = $('#bab-' + el.dataset.bab); if (h) h.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
A['draf-baru'] = () => bukaModal('Draf baharu', borangDraf(null));
A['draf-sunting'] = el => bukaModal('Sunting draf', borangDraf(S.draf.find(d => d.id === el.dataset.id)));
A['draf-maju'] = el => {
  const d = S.draf.find(x => x.id === el.dataset.id); if (!d) return;
  if (d.langkah === 5 && !semakMetadata(d).every(x => x[1])) { toast('Lengkapkan metadata dahulu'); return; }
  d.langkah++; if (d.langkah === 6) { d.terbit = hariIni(); d.kemas = hariIni(); INDEKS = null; toast('Diterbitkan. Bahan kini muncul di Teroka.'); }
  simpan(); render();
};
A['draf-padam'] = el => { S.draf = S.draf.filter(d => d.id !== el.dataset.id); INDEKS = null; simpan(); render(); };

document.addEventListener('click', e => {
  if (e.target.classList?.contains('lapik')) { tutupModal(); return; }
  const t = e.target.closest('[data-act]');
  if (!$('.popover')?.contains(e.target) && !e.target.closest('[data-act="tetapan-baca"]')) $('.popover')?.remove();
  if (t && t.tagName === 'SELECT') return;
  if (t && t.tagName === 'INPUT' && t.type === 'radio') { A[t.dataset.act]?.(t, e); return; }
  if (!t) return;
  const f = A[t.dataset.act]; if (!f) return;
  e.preventDefault(); f(t, e);
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') { tutupModal(); $('.popover')?.remove(); } });
document.addEventListener('change', e => {
  if (e.target.id === 'pilihRehat') { Rehat.slug = e.target.value; render(); }
});

let notaT;
document.addEventListener('input', e => {
  const s = e.target.dataset?.nota;
  if (s) { clearTimeout(notaT); const st = $('#notaStatus'); if (st) st.textContent = 'Menyimpan…'; notaT = setTimeout(() => { S.nota[s] = e.target.value; tandaAktif(); if (st) st.textContent = 'Disimpan.'; }, 500); return; }
  if (e.target.id === 'medanCari') { CARI.q = e.target.value; $('#hasilCari').innerHTML = hasilCari(CURR.v === 'teroka' ? CURR.p : ''); }
});

document.addEventListener('submit', e => {
  const f = e.target; const jenis = f.dataset.borang; if (!jenis) return;
  e.preventDefault();
  if (jenis === 'surat') {
    const emel = f.querySelector('input[type="email"]').value.trim();
    S.surat = { emel, tarikh: hariIni() }; simpan(); toast('Terima kasih. Surat Ilmu pertama tiba pagi Ahad.');
    $$('#surat-borang').forEach(el => { el.innerHTML = borangSurat('emelHero'); });
  }
  if (jenis === 'cari') { CARI.q = $('#medanCari').value; $('#hasilCari').innerHTML = hasilCari(CURR.p); $('#hasilCari').scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  if (jenis === 'lapor') { S.laporan.unshift({ jenis: f.dataset.jenis || $('#lJenis')?.value || 'Laporan', slug: f.dataset.slug || '', teks: $('#lTeks').value.trim(), masa: Date.now() }); simpan(); tutupModal(); toast('Terima kasih. Pasukan editorial akan menyemaknya.'); }
  if (jenis === 'akaun') { S.akaun = { nama: $('#aNama').value.trim(), emel: $('#aEmel').value.trim() }; simpan(); tutupModal(); toast(`Selamat datang, ${S.akaun.nama}.`); render(); }
  if (jenis === 'bayar') {
    const { baris, sub } = jumlahTroli(); if (!baris.length) return;
    const hantar = TROLI.kaedah === 'hantar' ? 5 : 0;
    const id = 'SNG-' + Math.random().toString(36).slice(2, 6).toUpperCase();
    S.pesanan.unshift({ id, masa: Date.now(), item: baris.map(b => ({ id: b.p.id, n: b.n })), hantar, jumlah: sub + hantar, kaedah: TROLI.kaedah, bayar: $('#pBayar').value, nama: $('#pNama').value.trim() });
    S.troli = {}; simpan(); kemasPengepala(); location.hash = 'o.' + id;
  }
  if (jenis === 'draf') {
    const id = f.dataset.id || Math.random().toString(36).slice(2, 8);
    let d = S.draf.find(x => x.id === id); if (!d) { d = { id, langkah: 0 }; S.draf.unshift(d); }
    Object.assign(d, {
      tajuk: $('#dTajuk').value.trim(), dek: $('#dDek').value.trim(), kategori: $('#dKat').value, tahap: $('#dTahap').value,
      tag: $('#dTag').value.split(',').map(x => x.trim()).filter(Boolean), ringkas60: $('#dRingkas').value.trim(), isi: $('#dIsi').value,
      sumber: $('#dSumber').value.split('\n').map(x => x.trim()).filter(Boolean), penulis: $('#dPenulis').value.trim(), penyemak: $('#dPenyemak').value.trim(), kemas: hariIni()
    });
    INDEKS = null; simpan(); tutupModal(); toast('Draf disimpan'); render();
  }
});

/* Status pesanan bergerak sendiri dalam mod demo. */
setInterval(() => { if (CURR.v === 'o') { const y = scrollY; render(); window.scrollTo(0, y); } }, 20000);

/* ================= App boleh dipasang ================= */
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); window.__pasang = e; });
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  try { navigator.serviceWorker.register('sw.js').catch(() => {}); } catch (e) { /* bingkai tanpa service worker */ }
}

/* ================= Mula ================= */
terapTetapan();
kaki();
window.addEventListener('hashchange', render);
render();
})();
