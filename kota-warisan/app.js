/* Kota Warisan · enjin permainan.
   Kampung (bina, kutip, latih), perang masa nyata atas grid isometrik, puak simulasi, misi, kitab hikayat dan kuiz.
   Keadaan disimpan dalam localStorage peranti ini. Data imbangan ada dalam data.js. */
'use strict';

/* ================= Utiliti ================= */
const $ = s => document.querySelector(s);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const kini = () => Date.now();
const acak = Math.random;
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function fmtN(n) { return Math.floor(n).toLocaleString('en-US').replace(/,/g, ' '); }
function fmtK(n) { n = Math.floor(n); if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'J'; if (n >= 1e4) return Math.round(n / 1000) + 'K'; return fmtN(n); }
function masa(s) { s = Math.max(0, Math.ceil(s)); if (s >= 3600) return Math.floor(s / 3600) + 'j ' + Math.floor(s % 3600 / 60) + 'm'; if (s >= 60) return Math.floor(s / 60) + 'm ' + (s % 60) + 's'; return s + 's'; }
function rng(seed) { let s = (seed >>> 0) || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
const pilih = (a, r = acak) => a[Math.floor(r() * a.length)];
function hariIni() { const d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
function cincang(s) { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
const _sh = new Map();
function shade(h, f) {
  const k = h + f; let v = _sh.get(k); if (v) return v;
  let r, g, b;
  if (h[0] === '#') { const n = parseInt(h.slice(1), 16); r = n >> 16; g = n >> 8 & 255; b = n & 255; }
  else [r, g, b] = h.match(/\d+/g).map(Number);
  if (f < 0) { r *= 1 + f; g *= 1 + f; b *= 1 + f; } else { r += (255 - r) * f; g += (255 - g) * f; b += (255 - b) * f; }
  v = `rgb(${r | 0},${g | 0},${b | 0})`; _sh.set(k, v); return v;
}
function campur(a, b, t) {
  const x = parseInt(a.slice(1), 16), y = parseInt(b.slice(1), 16);
  const m = (s) => Math.round(((x >> s) & 255) * (1 - t) + ((y >> s) & 255) * t);
  return '#' + ((1 << 24) | (m(16) << 16) | (m(8) << 8) | m(0)).toString(16).slice(1);
}

/* ================= Ikon ================= */
const IKON = {
  emas: '<svg class="ikon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#f6c431" stroke="#7a4f00" stroke-width="2"/><circle cx="12" cy="12" r="5.5" fill="none" stroke="#c48a00" stroke-width="2"/><path d="M7.5 8a6 6 0 0 1 4.5-2.2" stroke="#fff6c8" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>',
  beras: '<svg class="ikon" viewBox="0 0 24 24"><path d="M6 22c3-6 5-11 11-19" stroke="#3f6b14" stroke-width="2" fill="none" stroke-linecap="round"/><g fill="#8fd14f" stroke="#3f6b14" stroke-width="1.2"><ellipse cx="9.5" cy="14.5" rx="2" ry="3.4" transform="rotate(-30 9.5 14.5)"/><ellipse cx="13.8" cy="12.6" rx="2" ry="3.4" transform="rotate(40 13.8 12.6)"/><ellipse cx="11.8" cy="8.6" rx="2" ry="3.4" transform="rotate(-25 11.8 8.6)"/><ellipse cx="16.4" cy="7.6" rx="2" ry="3.2" transform="rotate(45 16.4 7.6)"/><ellipse cx="16" cy="3.4" rx="1.7" ry="2.8" transform="rotate(20 16 3.4)"/></g></svg>',
  timah: '<svg class="ikon" viewBox="0 0 24 24"><path d="M3 15 7 7h10l4 8z" fill="#9fb4c8" stroke="#2d3c4a" stroke-width="2" stroke-linejoin="round"/><path d="M3 15h18v4H3z" fill="#6f8496" stroke="#2d3c4a" stroke-width="2" stroke-linejoin="round"/><path d="M8.5 10h6" stroke="#eef5fb" stroke-width="1.5" stroke-linecap="round"/></svg>',
  mutiara: '<svg class="ikon" viewBox="0 0 24 24"><defs><radialGradient id="gmt" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff"/><stop offset=".5" stop-color="#f3d9e8"/><stop offset="1" stop-color="#b98aa6"/></radialGradient></defs><circle cx="12" cy="12" r="9" fill="url(#gmt)" stroke="#6b3d58" stroke-width="2"/><circle cx="9" cy="8.5" r="2" fill="#fff" opacity=".9"/></svg>',
  serang: '<svg viewBox="0 0 48 48"><g stroke="#2a0d0b" stroke-width="2.4" stroke-linejoin="round"><path d="M9 6 31 28l-3 3L6 9z" fill="#f1f1ec"/><path d="M39 6 17 28l3 3L42 9z" fill="#f1f1ec"/><path d="M14 31l6-6 3 3-6 6zM34 31l-6-6-3 3 6 6z" fill="#f4c20d"/><path d="M15 35l-6 6M33 35l6 6" stroke-width="5" stroke-linecap="round"/></g></svg>',
  bina: '<svg viewBox="0 0 24 24"><path d="M13.5 3.5l7 7-3 3-7-7z" fill="#cfd6dc" stroke="#1d1208" stroke-width="1.6" stroke-linejoin="round"/><path d="M12.5 8.5 3.5 17.5l3 3 9-9" fill="#c28a4e" stroke="#1d1208" stroke-width="1.6" stroke-linejoin="round"/></svg>',
  tentera: '<svg viewBox="0 0 24 24"><path d="M12 2c1.6 2 1.6 4 0 6 1.6 2 1.6 4 0 6v4" stroke="#e6e6e6" stroke-width="2.2" fill="none" stroke-linecap="round"/><path d="M8 18h8" stroke="#f4c20d" stroke-width="2.4" stroke-linecap="round"/><path d="M12 18v4" stroke="#7a4a22" stroke-width="3" stroke-linecap="round"/></svg>',
  puak: '<svg viewBox="0 0 24 24" fill="#fff4dc" stroke="#1d1208" stroke-width="1.4"><circle cx="6" cy="9" r="2.6"/><circle cx="18" cy="9" r="2.6"/><path d="M1.5 19a4.5 4.5 0 0 1 9 0z"/><path d="M13.5 19a4.5 4.5 0 0 1 9 0z"/><circle cx="12" cy="7.5" r="3.2" fill="#f4c20d"/><path d="M6 21a6 6 0 0 1 12 0z" fill="#f4c20d"/></svg>',
  kitab: '<svg viewBox="0 0 24 24"><path d="M3 5c3-1.5 6-1.5 9 0v15c-3-1.5-6-1.5-9 0z" fill="#b8322f" stroke="#1d1208" stroke-width="1.5" stroke-linejoin="round"/><path d="M21 5c-3-1.5-6-1.5-9 0v15c3-1.5 6-1.5 9 0z" fill="#8f1d21" stroke="#1d1208" stroke-width="1.5" stroke-linejoin="round"/><path d="M5.5 8.5c1.6-.5 3-.5 4.5 0M14 8.5c1.5-.5 3-.5 4.5 0" stroke="#f4c20d" stroke-width="1.4"/></svg>',
  tetapan: '<svg viewBox="0 0 24 24"><g stroke="#1d1208" stroke-width="1.5" fill="#cfd6dc"><path d="M10 2h4l.6 3 2.4 1.4 2.9-1 2 3.4-2.3 2v2.4l2.3 2-2 3.4-2.9-1L14.6 19l-.6 3h-4l-.6-3L7 17.6l-2.9 1-2-3.4 2.3-2v-2.4l-2.3-2 2-3.4 2.9 1L9.4 5z" stroke-linejoin="round"/><circle cx="12" cy="12" r="3.2" fill="#7a5230"/></g></svg>',
  bintang: on => `<svg viewBox="0 0 24 24"><path d="M12 2l3 6.6 7.2.8-5.4 4.9 1.5 7.1L12 17.8 5.7 21.4l1.5-7.1L1.8 9.4 9 8.6z" fill="${on ? '#f4c20d' : '#4a3a2a'}" stroke="#1d1208" stroke-width="1.5" stroke-linejoin="round"/></svg>`,
  bendahara: '<svg class="muka" viewBox="0 0 40 40"><circle cx="20" cy="20" r="19" fill="#8f1d21" stroke="#140c07" stroke-width="2"/><circle cx="20" cy="23" r="10" fill="#c98b5a"/><path d="M9 18c1-8 21-8 22 0l-2 2c-4-3-14-3-18 0z" fill="#1d1d22"/><path d="M11 16c4-3 14-3 18 0" stroke="#f4c20d" stroke-width="1.6" fill="none"/><path d="M14 27c2 1.6 4 1.6 6 .4 2 1.2 4 1.2 6-.4" stroke="#3a2416" stroke-width="1.8" fill="none" stroke-linecap="round"/><circle cx="16.5" cy="22" r="1.2" fill="#1d1208"/><circle cx="23.5" cy="22" r="1.2" fill="#1d1208"/><path d="M15 33c3 2 7 2 10 0v4H15z" fill="#f4c20d"/></svg>',
};
const ik = r => IKON[r];

/* ================= Keadaan ================= */
const KUNCI = 'kotaWarisan.v1';
let S = null;
let mode = 'kampung';
let pilihan = null;           // bangunan yang dipilih
let BT = null;                // keadaan perang
let mulaSesi = kini(), sudahIngatRehat = false;

function keadaanBaru() {
  const t = kini(), bld = []; let id = 1;
  const add = (k, x, y) => bld.push({ id: id++, t: k, x, y, lv: 1, busy: null, store: 0, last: t });
  add('istana', 10, 10);
  add('sawah', 6, 10); add('lombong_emas', 15, 10);
  add('peti_emas', 10, 6); add('jelapang', 10, 15);
  add('balai_tentera', 15, 15); add('kem', 18, 14);
  add('bangsal_tukang', 6, 6); add('bangsal_tukang', 6, 15);
  add('meriam_lela', 14, 8);
  bld.find(b => b.t === 'lombong_emas').store = 180;
  bld.find(b => b.t === 'sawah').store = 120;
  return {
    v: 1, nama: 'Penghulu', res: { emas: 800, beras: 800, timah: 0, mutiara: 50 }, xp: 0, maruah: 0, bld, nextId: id,
    army: { pendekar: 10 }, gilir: [], gilirMula: t,
    troopLv: { pendekar: 1, pemanah: 1, gajah: 1, pemecah: 1, hulubalang: 1 }, kaji: null,
    bantuan: [], puak: null, misi: null, langkah: 0,
    stat: { naik: 0, menang: 0, kalah: 0, derma: 0, kumpulEmas: 0, kumpul: 0, latih: 0, bintang3: 0, bintang: 0, kuiz: 0, pertahan: 0, serang: 0, latihGajah: 0, latihPemanah: 0, gotong: 0 },
    capai: {}, hikayat: {}, hikayatBaru: 0, laporan: [], laporanBaru: 0, perisai: 0, lastSeen: t, kempen: [],
    kuiz: { hari: '', jawab: 0 }, bunyi: true,
  };
}
function simpan() { if (!S) return; S.lastSeen = kini(); try { localStorage.setItem(KUNCI, JSON.stringify(S, (k, v) => k === 'letak' ? undefined : v)); } catch (e) { /* storan disekat */ } }
function muat() { try { const j = localStorage.getItem(KUNCI); if (j) { const o = JSON.parse(j); if (o && o.v === 1 && Array.isArray(o.bld)) return o; } } catch (e) { } return null; }

/* ================= Peraturan ================= */
const istana = () => S.bld.find(b => b.t === 'istana');
const istLv = () => istana().lv;
const bil = t => S.bld.filter(b => b.t === t).length;
const aktif = b => b.lv >= 1 && !b.busy;
const adaAktif = t => S.bld.some(b => b.t === t && b.lv >= 1);
function maxLvUntuk(t, L) {
  const d = B[t];
  if (t === 'istana') return 7;
  if (t === 'anjung_laksamana') return clamp(L * 2 - 7, 0, 7);
  if (t === 'anjung_srikandi') return clamp(L * 2 - 11, 0, 7);
  if (t === 'ranjau') return Math.min(d.max, Math.ceil(L / 2));
  if (t === 'balai_ilmu') return clamp(L - 2, 0, d.max);
  if (t === 'balai_muafakat') return clamp(L - 1, 0, d.max);
  return Math.min(d.max, L + 1);
}
const maxLv = t => maxLvUntuk(t, istLv());
const had = t => t === 'istana' ? 1 : BIL[t][istLv() - 1];
function bukaPada(t) { for (let L = 1; L <= 7; L++) if (BIL[t][L - 1] > 0) return L; return 8; }
function kos(t, lv) {
  const d = B[t];
  if (t === 'istana') return ['emas', KOS_ISTANA[lv - 1]];
  if (t === 'bangsal_tukang') return ['mutiara', KOS_BANGSAL[bil('bangsal_tukang')] ?? 900];
  if (d.hero) return lv === 1 ? ['emas', d.kos[1]] : ['timah', Math.round(800 * Math.pow(1.55, lv - 2))];
  return [d.kos[0], Math.round(d.kos[1] * Math.pow(d.kos[2], lv - 1))];
}
const masaBina = (t, lv) => B[t].tb ? Math.round(B[t].tb * T_MUL[lv - 1]) : 0;
const hpBangunan = (t, lv) => Math.round(B[t].hp * Math.pow(t === 'kota' ? 1.7 : 1.25, lv - 1));
const dmgPertahanan = (t, lv) => B[t].def.dmg * Math.pow(1.28, lv - 1);
const kadar = b => B[b.t].kadar * Math.pow(1.6, b.lv - 1);
const capPengumpul = b => kadar(b) * 1200;
function capSumber(r) {
  if (r === 'mutiara') return Infinity;
  const L = istLv(); let c = r === 'timah' ? ISTANA_TIMAH[L - 1] : CAP_ISTANA[L - 1];
  for (const b of S.bld) if (B[b.t].simpan === r && b.lv >= 1) c += (r === 'timah' ? CAP_TIMAH : CAP_SIMPAN)[b.lv - 1];
  return c;
}
function tambah(r, n) { const c = capSumber(r), dulu = S.res[r]; S.res[r] = Math.max(dulu, Math.min(c, dulu + n)); return S.res[r] - dulu; }
const cukup = ([r, n]) => S.res[r] >= n;
function bayar(k) { if (!cukup(k)) return false; S.res[k[0]] -= k[1]; return true; }
const jumlahTukang = () => bil('bangsal_tukang');
const tukangSibuk = () => S.bld.filter(b => b.busy).length;
const tukangLapang = () => jumlahTukang() - tukangSibuk();
const ruangTentera = () => S.bld.reduce((c, b) => c + (b.t === 'kem' && b.lv >= 1 ? KEM_CAP[b.lv - 1] : 0), 0);
const ruangGuna = () => Object.entries(S.army).reduce((c, [k, n]) => c + TR[k].ruang * n, 0);
const ruangGilir = () => S.gilir.reduce((c, k) => c + TR[k].ruang, 0);
const balaiMaks = () => S.bld.reduce((m, b) => b.t === 'balai_tentera' ? Math.max(m, b.lv) : m, 0);
const capBantuan = () => { const b = S.bld.find(x => x.t === 'balai_muafakat'); return b && b.lv >= 1 ? 5 + 5 * b.lv : 0; };
const ruangBantuan = () => S.bantuan.reduce((c, k) => c + TR[k].ruang, 0);
const maxKaji = () => { const b = S.bld.find(x => x.t === 'balai_ilmu'); return b && b.lv >= 1 ? b.lv + 1 : 1; };
const kosKaji = (k, lv) => Math.round(KOS_KAJI[k] * Math.pow(2.3, lv - 2));
const ligaDari = m => { let l = LIGA[0]; for (const x of LIGA) if (m >= x.min) l = x; return l; };
const pangkat = () => Math.floor(Math.sqrt(S.xp / 40)) + 1;
function tambahXP(n) { const p = pangkat(); S.xp += n; if (pangkat() > p) { toast(`Pangkat naik ke ${pangkat()}!`); sfx('siap'); } }
const namaBangunan = (t, lv) => t === 'kota' ? (lv >= 4 ? 'Kota Batu' : 'Kota Kayu') : B[t].n;
const wiraSedia = k => { const b = S.bld.find(x => x.t === WIRA[k].bina); return b && b.lv >= 1 && !b.busy ? b.lv : 0; };

/* ================= Masa: binaan, hasil, latihan ================= */
function kemaskini(t) {
  for (const b of S.bld) {
    if (b.busy) {
      if (t >= b.busy.until) { const u = b.busy.until; siapBina(b); b.last = u; } else { b.last = t; continue; }
    }
    if (B[b.t].hasil && b.lv >= 1) { const dt = (t - b.last) / 1000; if (dt > 0) b.store = Math.min(capPengumpul(b), b.store + kadar(b) * dt); }
    b.last = t;
  }
  prosesGilir(t);
  if (S.kaji && t >= S.kaji.until) {
    S.troopLv[S.kaji.k] = S.kaji.lv; toast(`Kajian siap: ${TR[S.kaji.k].n} kini tahap ${S.kaji.lv}`); sfx('siap'); S.kaji = null; perluRender = true;
  }
  semakLangkah();
}
function siapBina(b) {
  const lv = b.busy.toLv; b.lv = lv; b.busy = null;
  tambahXP(b.t === 'istana' ? 50 * lv : 6 * lv + 4);
  S.stat.naik++; misi('naik');
  if (b.t === 'balai_muafakat') bukaPuak();
  toast(`${namaBangunan(b.t, lv)} siap, kini tahap ${lv}`); sfx('siap');
  if (b.t === 'istana') setTimeout(() => paparEra(lv), 200);
  semakHikayat(); perluRender = true;
  if (pilihan === b) paparPanel();
}
function prosesGilir(t) {
  const n = S.bld.filter(b => b.t === 'balai_tentera' && aktif(b)).length;
  if (!S.gilir.length || !n) { S.gilirMula = t; return; }
  let jaga = 0;
  while (S.gilir.length && jaga++ < 400) {
    const k = S.gilir[0], perlu = TR[k].masa * 1000 / n;
    if (ruangGuna() + TR[k].ruang > ruangTentera()) { S.gilirMula = t; break; }
    if (t - S.gilirMula < perlu) break;
    S.gilir.shift(); S.army[k] = (S.army[k] || 0) + 1; S.gilirMula += perlu;
    S.stat.latih++; misi('latih');
    if (k === 'gajah') S.stat.latihGajah++;
    if (k === 'pemanah') S.stat.latihPemanah++;
    perluRender = true;
  }
  if (!S.gilir.length) S.gilirMula = t;
  semakHikayat();
}

/* ================= Hikayat, misi, pencapaian, langkah ================= */
const SYARAT = {
  mula: () => true, sungaibatu: () => istLv() >= 2, langkasuka: () => istLv() >= 3, srivijaya: () => S.stat.menang >= 5,
  batubersurat: () => adaAktif('balai_ilmu'), melaka: () => istLv() >= 4, chengho: () => (S.kempen[3] || 0) > 0,
  hangtuah: () => adaAktif('anjung_laksamana'), hukumkanun: () => S.stat.naik >= 10, orangLaut: () => (S.kempen[0] || 0) > 0,
  gajah: () => S.stat.latihGajah > 0, sumpit: () => S.stat.latihPemanah > 0,
  lela: () => S.bld.some(b => b.t === 'meriam_lela' && b.lv >= 2), jelapang: () => S.bld.some(b => b.t === 'jelapang' && b.lv >= 2),
  gotong: () => adaAktif('balai_muafakat'), jatuh1511: () => istLv() >= 5, fatimah: () => adaAktif('anjung_srikandi'),
  timah: () => adaAktif('lombong_timah'), pangkor: () => istLv() >= 6, pejuang: () => S.stat.pertahan >= 3,
  merdeka: () => istLv() >= 7, malaysia: () => S.stat.gotong >= 1, jalur: () => S.stat.bintang >= 30,
};
function semakHikayat(senyap) {
  for (const h of HIKAYAT) {
    if (S.hikayat[h.k] || !SYARAT[h.k]()) continue;
    S.hikayat[h.k] = kini(); S.hikayatBaru++;
    if (!senyap && h.k !== 'mula') toast(`Kad Hikayat baharu: ${h.t}`);
  }
}
function semakMisi() {
  const h = hariIni();
  if (S.misi && S.misi.hari === h) return;
  const r = rng(cincang(h)), jenis = MISI_JENIS.slice(), ambil = [];
  while (ambil.length < 3) ambil.push(jenis.splice(Math.floor(r() * jenis.length), 1)[0]);
  S.misi = { hari: h, senarai: ambil.map(m => ({ k: m.k, n: m.n(istLv()), p: 0, ambil: false })), bonus: false };
}
function misi(k, n = 1) { semakMisi(); for (const m of S.misi.senarai) if (m.k === k && !m.ambil) m.p = Math.min(m.n, m.p + n); }
function nilaiCapai(k) { if (k === 'hikayat') return Object.keys(S.hikayat).length; return S.stat[k] || 0; }
const LANGKAH = [
  { t: 'Ketik Lombong Emas untuk mengutip emas yang sudah terkumpul.', ok: () => S.stat.kumpulEmas > 0, g: ['emas', 200] },
  { t: 'Naik taraf Meriam Lela supaya kota lebih selamat daripada lanun.', ok: () => S.bld.some(b => b.t === 'meriam_lela' && (b.lv >= 2 || b.busy)), g: ['beras', 300] },
  { t: 'Latih 5 Pendekar di Balai Tentera.', ok: () => S.stat.latih >= 5, g: ['mutiara', 10] },
  { t: 'Tekan Serang, kemudian tewaskan Lanun Pulau Besar dalam Kempen Selat.', ok: () => (S.kempen[0] || 0) > 0, g: ['emas', 500] },
  { t: 'Bina 5 Kota Kayu di sekeliling Istana. Buka menu Bina, tab Pertahanan.', ok: () => bil('kota') >= 5, g: ['beras', 500] },
  { t: 'Naik taraf Istana ke tahap 2 untuk membuka era Lembah Bujang.', ok: () => istLv() >= 2 || !!istana().busy, g: ['mutiara', 25] },
];
function semakLangkah() {
  const l = LANGKAH[S.langkah];
  if (!l || !l.ok()) return;
  if (l.g[0] === 'mutiara') S.res.mutiara += l.g[1]; else tambah(l.g[0], l.g[1]);
  toast(`Tugasan selesai! +${fmtN(l.g[1])} ${SUMBER[l.g[0]].n}`); sfx('kutip');
  S.langkah++; nasihatSeterus = 0;
}

/* ================= Puak (simulasi) ================= */
function bukaPuak() {
  if (S.puak) return;
  const r = rng(77), nama = NAMA_ORANG.slice().sort(() => r() - .5).slice(0, 9);
  const ahli = nama.map((n, i) => ({ n, lv: clamp(istLv() + Math.floor(r() * 3) - 1, 1, 7), maruah: Math.round(80 + r() * 380 + i * 12), derma: Math.floor(r() * 40) }));
  S.puak = { nama: NAMA_PUAK, ahli, chat: [], idSeterus: 1, seterus: kini() + 8000, mintaLagi: 0, minta: null, goal: goalBaru(), belumBaca: 0 };
  chat({ sys: true, t: `Kau menyertai puak ${NAMA_PUAK}.` });
  chat({ dari: ahli[0].n, t: 'Selamat datang ke Anak Selat! Jangan segan minta bantuan tentera, kami tolong.' });
}
function goalBaru() { const L = istLv(); return { sasaran: 15000 * L, prog: Math.round(1500 * L * acak()), aku: 0, g: { mutiara: 30 + L * 10, emas: 1500 * L, beras: 1500 * L } }; }
function chat(m) { const p = S.puak; m.id = p.idSeterus++; m.masa = kini(); p.chat.push(m); if (p.chat.length > 50) p.chat.splice(0, p.chat.length - 50); if (!m.aku) p.belumBaca++; perluRenderPuak = true; }
function jenisDibuka() { const m = balaiMaks(); return Object.keys(TR).filter(k => TR[k].buka <= Math.max(1, m)); }
function puakDetik() {
  const p = S.puak; if (!p) return;
  const t = kini();
  // bantuan untuk permintaan pemain
  if (p.minta && acak() < .25) {
    const cap = capBantuan(), baki = cap - ruangBantuan();
    if (baki <= 0) { p.minta = null; chat({ sys: true, t: 'Balai Muafakat kau sudah penuh dengan bantuan.' }); }
    else {
      const a = pilih(p.ahli), jenis = Object.keys(TR).filter(k => TR[k].buka <= Math.min(5, a.lv + 1) && TR[k].ruang <= baki);
      const k = p.minta.k && TR[p.minta.k].ruang <= baki && acak() < .7 ? p.minta.k : pilih(jenis.length ? jenis : ['pendekar']);
      const n = Math.max(1, Math.min(Math.floor(baki / TR[k].ruang), 1 + Math.floor(acak() * 3)));
      for (let i = 0; i < n; i++) S.bantuan.push(k);
      a.derma += n; chat({ sys: true, t: `${a.n} menderma ${n} ${TR[k].n} kepada kau.` });
      if (ruangBantuan() >= cap) p.minta = null;
    }
  }
  if (t < p.seterus) return;
  p.seterus = t + (18 + acak() * 30) * 1000;
  const a = pilih(p.ahli), roll = acak();
  if (roll < .3) {
    const pilihan2 = jenisDibuka(), k = pilih(pilihan2);
    const perlu = TR[k].ruang >= 4 ? 1 : TR[k].ruang === 2 ? 2 : 3 + Math.floor(acak() * 3);
    chat({ dari: a.n, t: `Sesiapa ada ${TR[k].n}? Nak serang ${pilih(NAMA_LANUN)} kejap lagi.`, minta: { k, perlu, dapat: 0 } });
  } else if (roll < .48) chat({ dari: a.n, t: pilih(SEMBANG.tip) });
  else if (roll < .6) chat({ dari: a.n, t: pilih(SEMBANG.salam) });
  else if (roll < .78) chat({ dari: a.n, t: pilih(SEMBANG.bangga) });
  else chat({ dari: a.n, t: pilih(SEMBANG.ilmu) });
  // ahli lain menolong permintaan lama
  for (const m of p.chat) if (m.minta && m.minta.dapat < m.minta.perlu && acak() < .35) m.minta.dapat++;
  // gotong-royong bergerak
  if (p.goal.prog < p.goal.sasaran) p.goal.prog = Math.min(p.goal.sasaran, p.goal.prog + Math.round((200 + acak() * 700) * istLv()));
  for (const x of p.ahli) x.maruah = Math.max(0, x.maruah + Math.round((acak() - .42) * 14));
}

/* ================= Audio ================= */
let AC = null, bunyiTerakhir = {};
function bukaAudio() {
  if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { AC = null; } }
  if (AC && AC.state === 'suspended') AC.resume().catch(() => {});
}
function nada(f, d, jenis = 'sine', vol = .12, f2 = 0, lengah = 0) {
  if (!AC) return;
  const t0 = AC.currentTime + lengah, o = AC.createOscillator(), g = AC.createGain();
  o.type = jenis; o.frequency.setValueAtTime(f, t0); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + d);
  g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(.001, t0 + d);
  o.connect(g).connect(AC.destination); o.start(t0); o.stop(t0 + d + .02);
}
let _hingar = null;
function hingar(d, vol = .2, tapis = 900) {
  if (!AC) return;
  if (!_hingar) { _hingar = AC.createBuffer(1, AC.sampleRate, AC.sampleRate); const a = _hingar.getChannelData(0); for (let i = 0; i < a.length; i++) a[i] = acak() * 2 - 1; }
  const s = AC.createBufferSource(), g = AC.createGain(), f = AC.createBiquadFilter(), t0 = AC.currentTime;
  s.buffer = _hingar; f.type = 'lowpass'; f.frequency.value = tapis;
  g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(.001, t0 + d);
  s.connect(f).connect(g).connect(AC.destination); s.start(t0); s.stop(t0 + d);
}
function sfx(n) {
  if (!S || !S.bunyi || !AC) return;
  const t = performance.now(); if (bunyiTerakhir[n] && t - bunyiTerakhir[n] < 60) return; bunyiTerakhir[n] = t;
  switch (n) {
    case 'kutip': nada(988, .08, 'triangle', .1); nada(1319, .12, 'triangle', .09, 0, .06); break;
    case 'bina': hingar(.08, .12, 2500); nada(220, .1, 'square', .05, 0, .02); hingar(.08, .1, 2500); break;
    case 'siap': [523, 659, 784, 1047].forEach((f, i) => nada(f, .18, 'triangle', .09, 0, i * .08)); break;
    case 'salah': nada(200, .18, 'sawtooth', .06, 140); break;
    case 'ketik': nada(660, .04, 'triangle', .05); break;
    case 'meriam': hingar(.25, .22, 600); nada(90, .2, 'sine', .15, 40); break;
    case 'damak': nada(1800, .05, 'triangle', .03, 900); break;
    case 'bom': hingar(.5, .3, 400); nada(70, .4, 'sine', .2, 30); break;
    case 'runtuh': hingar(.6, .25, 700); break;
    case 'pukul': hingar(.05, .07, 3000); break;
    case 'gong': nada(196, 1.4, 'sine', .16, 190); nada(392, .9, 'sine', .05); break;
    case 'menang': [392, 494, 587, 784, 988].forEach((f, i) => nada(f, .3, 'triangle', .1, 0, i * .12)); break;
    case 'kalah': [392, 330, 262].forEach((f, i) => nada(f, .35, 'triangle', .09, 0, i * .18)); break;
  }
}

/* ================= Kanvas & kamera ================= */
const cv = $('#cv');
let ctx = cv.getContext('2d');
let W = 0, H = 0, DPR = 1;
const TW = 64, TH = 32, ZS = 30, ZMIN = .28, ZMAX = 1.8;
const cam = { x: 0, y: 0, z: 1 };
function ubahSaiz() { DPR = Math.min(2, window.devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR); hadKamera(); }
function P(x, y, z = 0) { return [(x - y) * TW / 2, (x + y) * TH / 2 - z * ZS]; }
function skrinKeDunia(sx, sy) {
  const wx = (sx - W / 2) / cam.z + cam.x, wy = (sy - H / 2) / cam.z + cam.y;
  return [(wx / (TW / 2) + wy / (TH / 2)) / 2, (wy / (TH / 2) - wx / (TW / 2)) / 2];
}
const keSkrin = (p) => [(p[0] - cam.x) * cam.z + W / 2, (p[1] - cam.y) * cam.z + H / 2];
function hadKamera() { cam.z = clamp(cam.z, ZMIN, ZMAX); cam.x = clamp(cam.x, -G * TW / 2 - 200, G * TW / 2 + 200); cam.y = clamp(cam.y, -150, G * TH + 250); }
function kameraAsal() { const c = P(G / 2, G / 2); cam.x = c[0]; cam.y = c[1] - 10; cam.z = clamp(Math.min(W / (G * TW * .78), H / (G * TH * 1.05)), .42, 1.05); hadKamera(); }
function zoomDi(sx, sy, z) {
  z = clamp(z, ZMIN, ZMAX);
  const wx = (sx - W / 2) / cam.z + cam.x, wy = (sy - H / 2) / cam.z + cam.y;
  cam.z = z; cam.x = wx - (sx - W / 2) / z; cam.y = wy - (sy - H / 2) / z; hadKamera();
}

/* ---------- primitif lukisan ---------- */
const GARIS = 'rgba(20,10,4,.5)';
function poly(pts, fill, stroke) {
  ctx.beginPath();
  for (let i = 0; i < pts.length; i++) { const p = P(pts[i][0], pts[i][1], pts[i][2]); if (i) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]); }
  ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1; ctx.stroke(); }
}
function prism(x0, y0, x1, y1, z0, z1, c, garis = true) {
  const st = garis ? GARIS : null;
  poly([[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]], shade(c, -.18), st);
  poly([[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]], shade(c, -.34), st);
  poly([[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], c, st);
}
function tapak(x0, y0, x1, y1, c, z = 0) { poly([[x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z]], c); }
function tiang(x0, y0, x1, y1, z0, z1, c, w = .1) {
  for (const [x, y] of [[x0, y0], [x1 - w, y0], [x0, y1 - w], [x1 - w, y1 - w]]) prism(x, y, x + w, y + w, z0, z1, c, false);
}
function tanduk(x, y, z, dx, dy) {
  const a = P(x, y, z), m = P(x + dx * .26, y + dy * .26, z + .04), b = P(x + dx * .3, y + dy * .3, z + .42);
  ctx.strokeStyle = '#e0b03a'; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.quadraticCurveTo(m[0], m[1], b[0], b[1]); ctx.stroke();
}
function bumbung(x0, y0, x1, y1, zb, rh, c, o = {}) {
  const zr = zb + rh, dinding = o.dinding || shade(c, -.3);
  if (o.paksi === 'y') {
    const xm = (x0 + x1) / 2;
    poly([[x0, y0, zb], [x0, y1, zb], [xm, y1, zr], [xm, y0, zr]], shade(c, .08), GARIS);
    poly([[x1, y0, zb], [x1, y1, zb], [xm, y1, zr], [xm, y0, zr]], shade(c, -.22), GARIS);
    poly([[x0, y1, zb], [x1, y1, zb], [xm, y1, zr]], dinding, GARIS);
    if (o.tanduk) { tanduk(xm, y0, zr, 0, -1); tanduk(xm, y1, zr, 0, 1); }
    return;
  }
  const ym = (y0 + y1) / 2, g = o.gonjong || 0;
  if (g) {
    const xa = x0 + (x1 - x0) * .25, xb = x1 - (x1 - x0) * .25, xm = (x0 + x1) / 2;
    const rabung = [[x1 + .25, ym, zr + g], [xb, ym, zr + g * .28], [xm, ym, zr], [xa, ym, zr + g * .28], [x0 - .25, ym, zr + g]];
    poly([[x0, y0, zb], [x1, y0, zb], ...rabung], shade(c, .1), GARIS);
    poly([[x1, y0, zb], [x1, y1, zb], [x1 + .25, ym, zr + g]], dinding, GARIS);
    poly([[x0, y1, zb], [x1, y1, zb], ...rabung], shade(c, -.12), GARIS);
    return;
  }
  poly([[x0, y0, zb], [x1, y0, zb], [x1, ym, zr], [x0, ym, zr]], shade(c, .08), GARIS);
  poly([[x1, y0, zb], [x1, y1, zb], [x1, ym, zr]], dinding, GARIS);
  poly([[x0, y1, zb], [x1, y1, zb], [x1, ym, zr], [x0, ym, zr]], shade(c, -.12), GARIS);
  if (o.tanduk) { tanduk(x0, ym, zr, -1, 0); tanduk(x1, ym, zr, 1, 0); }
}
function limas(x0, y0, x1, y1, zb, rh, c) {
  const a = [(x0 + x1) / 2, (y0 + y1) / 2, zb + rh];
  poly([[x0, y0, zb], [x1, y0, zb], a], shade(c, .12), GARIS);
  poly([[x0, y0, zb], [x0, y1, zb], a], shade(c, .02), GARIS);
  poly([[x1, y0, zb], [x1, y1, zb], a], shade(c, -.28), GARIS);
  poly([[x0, y1, zb], [x1, y1, zb], a], shade(c, -.1), GARIS);
}
function bulat(x, y, r, c) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = c; ctx.fill(); }
function garis(x1, y1, x2, y2, w, c) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineWidth = w; ctx.strokeStyle = c; ctx.lineCap = 'round'; ctx.stroke(); }
function garisD(a, b, w, c) { const p = P(...a), q = P(...b); garis(p[0], p[1], q[0], q[1], w, c); }
function bendera(x, y, z0, tg, corak, ts) {
  const a = P(x, y, z0), b = P(x, y, z0 + tg);
  garis(a[0], a[1], b[0], b[1], 2, '#3a2416');
  const w = 26, h = 16, n = 8, sw = w / n, ofs = i => Math.sin(ts * 4 + i * .7) * 1.8 * (i / n);
  for (let i = 0; i < n; i++) {
    const fx = b[0] + i * sw, fy = b[1] + ofs(i);
    if (corak === 'jalur') {
      const sh = h / 7;
      for (let s = 0; s < 7; s++) { ctx.fillStyle = s % 2 ? '#ffffff' : '#cc0001'; ctx.fillRect(fx, fy + s * sh, sw + .6, sh + .3); }
      if (i < n / 2) { ctx.fillStyle = '#010066'; ctx.fillRect(fx, fy, sw + .6, h * 4 / 7); }
    } else { ctx.fillStyle = corak; ctx.fillRect(fx, fy, sw + .6, h); }
  }
  if (corak === 'jalur') {
    const cx = b[0] + sw * 1.6, cy = b[1] + ofs(2) + h * 2 / 7;
    bulat(cx, cy, 3, '#ffcc00'); bulat(cx + 1.1, cy, 2.5, '#010066'); bulat(cx + 4.2, cy, 1.6, '#ffcc00');
  } else if (corak === '#f4c20d') { bulat(b[0] + w / 2, b[1] + ofs(4) + h / 2, 3, '#8f1d21'); }
}

/* ---------- dunia: tanah, laut, pokok ---------- */
const POKOK = (() => {
  const r = rng(7), a = [];
  for (let i = 0; i < 170; i++) {
    const x = -11 + r() * (G + 22), y = -11 + r() * (G + 15);
    if (x > -1.2 && x < G + 1.2 && y > -1.2 && y < G + 1.2) continue;
    a.push({ x, y, j: 'pokok', s: .7 + r() * .6, w: r() });
  }
  for (let i = 0; i < 26; i++) a.push({ x: -6 + r() * (G + 14), y: G + 2.6 + r() * 1.2, j: 'kelapa', s: .8 + r() * .4, w: r() });
  return a;
})();
function lukisPokok(p, ts) {
  const [sx, sy] = P(p.x, p.y, 0);
  ctx.save(); ctx.translate(sx, sy); ctx.scale(p.s, p.s);
  ctx.fillStyle = 'rgba(0,0,0,.22)'; ctx.beginPath(); ctx.ellipse(0, 0, 18, 7, 0, 0, 7); ctx.fill();
  if (p.j === 'kelapa') {
    const goyang = Math.sin(ts * 1.2 + p.w * 6) * 2;
    ctx.strokeStyle = '#7a5a34'; ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(6, -24, 4 + goyang, -46); ctx.stroke();
    ctx.strokeStyle = '#3f8a35'; ctx.lineWidth = 3.4;
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + p.w; ctx.beginPath(); ctx.moveTo(4 + goyang, -46); ctx.quadraticCurveTo(4 + goyang + Math.cos(a) * 14, -54 + Math.sin(a) * 4, 4 + goyang + Math.cos(a) * 22, -40 + Math.sin(a) * 6); ctx.stroke(); }
    bulat(4 + goyang, -44, 3, '#6b4a1f');
  } else {
    garis(0, 0, 0, -18, 5, '#5b3a20');
    const c = p.w < .5 ? '#2f6b2a' : '#3b7d31';
    bulat(-8, -24, 11, shade(c, -.15)); bulat(8, -25, 11, shade(c, -.1)); bulat(0, -34, 13, c); bulat(-3, -38, 6, shade(c, .15));
  }
  ctx.restore();
}
function lukisTanah(ts) {
  // laut dan pantai di bawah kiri
  poly([[-40, G + 4.6, 0], [G + 40, G + 4.6, 0], [G + 40, G + 60, 0], [-40, G + 60, 0]], '#2b7f9c');
  poly([[-40, G + 1.8, 0], [G + 40, G + 1.8, 0], [G + 40, G + 4.6, 0], [-40, G + 4.6, 0]], '#e2cf98');
  poly([[-40, G + 4.3, 0], [G + 40, G + 4.3, 0], [G + 40, G + 4.7, 0], [-40, G + 4.7, 0]], 'rgba(255,255,255,.35)');
  ctx.strokeStyle = 'rgba(255,255,255,.28)'; ctx.lineWidth = 2;
  for (let i = 0; i < 6; i++) {
    const yy = G + 6.5 + i * 2.2, ofs = (ts * .4 + i * .37) % 1;
    ctx.beginPath();
    for (let x = -20; x <= G + 30; x += 1.5) { const p = P(x + ofs * 1.5, yy + Math.sin(x * .9 + ts + i) * .12, 0); if (x === -20) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]); }
    ctx.stroke();
  }
  lukisPerahu(ts);
  // tanah kota
  poly([[-.3, -.3, 0], [G + .3, -.3, 0], [G + .3, G + .3, 0], [-.3, G + .3, 0]], '#4f8a35');
  poly([[0, 0, 0], [G, 0, 0], [G, G, 0], [0, G, 0]], '#74b04a');
  ctx.fillStyle = 'rgba(255,255,255,.05)';
  for (let i = 0; i < G; i++) for (let j = (i & 1); j < G; j += 2) {
    const a = P(i, j), b = P(i + 1, j), c = P(i + 1, j + 1), d = P(i, j + 1);
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(d[0], d[1]); ctx.fill();
  }
}
function lukisPerahu(ts) {
  const x = ((ts * .35) % (G + 50)) - 20, y = G + 9.5;
  const [sx, sy] = P(x, y, 0), bob = Math.sin(ts * 2) * 1.5;
  ctx.save(); ctx.translate(sx, sy + bob);
  ctx.fillStyle = '#5b3a20'; ctx.beginPath(); ctx.moveTo(-30, -6); ctx.quadraticCurveTo(0, 8, 32, -10); ctx.lineTo(24, -2); ctx.quadraticCurveTo(0, 6, -24, 0); ctx.closePath(); ctx.fill();
  garis(0, -2, 0, -46, 2.5, '#3a2416');
  ctx.fillStyle = '#e9dcc0'; ctx.beginPath(); ctx.moveTo(1, -44); ctx.quadraticCurveTo(20, -30, 18, -8); ctx.lineTo(1, -8); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#b8322f'; ctx.beginPath(); ctx.moveTo(-1, -40); ctx.lineTo(-14, -10); ctx.lineTo(-1, -10); ctx.closePath(); ctx.fill();
  ctx.restore();
}

/* ---------- bangunan ---------- */
let petaKota = new Set();
function lukisBangunan(b, o = {}) {
  const d = B[b.t], s = d.s, x0 = b.x, y0 = b.y, x1 = x0 + s, y1 = y0 + s, cx = x0 + s / 2, cy = y0 + s / 2, lv = Math.max(1, b.lv), ts = o.ts || 0;
  if (o.mati) { lukisRuntuhan(b); return; }
  if (b.t !== 'kota' && b.t !== 'ranjau') tapak(x0 + .06, y0 + .06, x1 - .06, y1 - .06, 'rgba(40,28,10,.25)');
  const isi = o.isi || 0;
  switch (b.t) {
    case 'istana': {
      const batu = lv >= 6 ? '#ded6c6' : '#c19a62', kayu = lv >= 4 ? '#8a4b22' : '#9a6a3a', atap = lv >= 4 ? '#5a2618' : '#86643a';
      prism(x0 + .2, y0 + .2, x1 - .2, y1 - .2, 0, .32, batu);
      bendera(x0 + .45, y0 + .45, .32, lv >= 4 ? 3.6 : 3, lv >= 7 ? 'jalur' : lv >= 4 ? '#f4c20d' : '#8f1d21', ts);
      if (lv >= 2) prism(cx - .5, y1 - .5, cx + .5, y1 - .2, .32, .45, shade(batu, -.1));
      const bx0 = x0 + .6, by0 = y0 + .7, bx1 = x1 - .6, by1 = y1 - .7;
      tiang(bx0, by0, bx1, by1, .32, .8, '#3d2412', .14);
      prism(bx0, by0, bx1, by1, .8, 1.65, kayu);
      if (lv >= 3) { garisD([bx0, by1, 1.25], [bx1, by1, 1.25], 2, '#f4c20d'); garisD([bx1, by1, 1.25], [bx1, by0, 1.25], 2, '#e0b03a'); }
      for (let i = 1; i < 4; i++) { const xx = bx0 + (bx1 - bx0) * i / 4; garisD([xx, by1, .95], [xx, by1, 1.45], 3, '#2a170b'); }
      bumbung(bx0 - .3, by0 - .3, bx1 + .3, by1 + .3, 1.65, 1.05 + (lv >= 5 ? .15 : 0), atap, { tanduk: lv >= 3, dinding: shade(kayu, -.15) });
      if (lv >= 3) bumbung(cx - .75, by0 + .15, cx + .75, by1 - .15, 2.45, .75, campur(atap, '#ffffff', .08), { tanduk: lv >= 5, dinding: shade(kayu, -.1) });
      if (lv >= 5) bumbung(cx - .35, cy - .35, cx + .35, cy + .35, 3.05, .5, campur(atap, '#ffffff', .14));
      if (lv >= 2) { prism(cx - .55, by1 + .05, cx + .55, y1 - .3, .32, 1.05, shade(kayu, .05)); limas(cx - .7, by1 - .05, cx + .7, y1 - .15, 1.05, .45, atap); }
      break;
    }
    case 'lombong_emas': {
      tapak(x0 + .25, y0 + .25, x1 - .25, y1 - .25, '#7a5a34');
      tapak(x0 + .7, y0 + .7, x1 - .7, y1 - .7, '#3a2615');
      const r = rng(b.id * 31 + 7), n = 3 + Math.floor(isi * 9);
      for (let i = 0; i < n; i++) { const p = P(x0 + .8 + r() * (s - 1.6), y0 + .8 + r() * (s - 1.6), .02); bulat(p[0], p[1], 2.2 + r() * 2, i % 3 ? '#f6c431' : '#ffe27a'); }
      prism(x0 + .55, cy - .07, x0 + .7, cy + .07, 0, 1.15, '#5a3a1e', false);
      prism(x1 - .7, cy - .07, x1 - .55, cy + .07, 0, 1.15, '#5a3a1e', false);
      prism(x0 + .55, cy - .07, x1 - .55, cy + .07, 1.15, 1.27, '#6b4423');
      garisD([cx, cy, 1.15], [cx, cy, .45 + Math.sin(ts * 2 + b.id) * .2], 1.2, '#2a1a10');
      prism(cx - .12, cy - .12, cx + .12, cy + .12, .3 + Math.sin(ts * 2 + b.id) * .2, .5 + Math.sin(ts * 2 + b.id) * .2, '#7a5230');
      prism(x1 - 1.05, y1 - .85, x1 - .4, y1 - .45, 0, .32, '#6b4423');
      prism(x1 - .98, y1 - .8, x1 - .47, y1 - .5, .32, .32 + .12 + isi * .2, '#f6c431', false);
      if (lv >= 3) { prism(x0 + .35, y1 - .75, x0 + .9, y1 - .35, 0, .3, '#6b4423'); prism(x0 + .4, y1 - .7, x0 + .85, y1 - .4, .3, .45, '#f6c431', false); }
      break;
    }
    case 'sawah': {
      tapak(x0 + .15, y0 + .15, x1 - .15, y1 - .15, '#8a6a3e');
      const hijau = campur('#5aa83c', '#e3c24a', Math.round(clamp(isi * 1.1, 0, 1) * 16) / 16);
      tapak(x0 + .3, y0 + .3, x1 - .3, y1 - .3, campur('#4f8fa0', hijau, .75));
      for (let i = 1; i <= 6; i++) { const yy = y0 + .3 + i * (s - .6) / 7; garisD([x0 + .38, yy, .02], [x1 - .38, yy, .02], 2.6, shade(hijau, -.12)); }
      garisD([cx, y0 + .3, .03], [cx, y1 - .3, .03], 2, '#8a6a3e');
      tiang(x0 + .25, y0 + .25, x0 + .95, y0 + .95, 0, .45, '#4a2c16', .08);
      prism(x0 + .25, y0 + .25, x0 + .95, y0 + .95, .45, .62, '#a07a48');
      limas(x0 + .18, y0 + .18, x0 + 1.02, y0 + 1.02, .62, .45, '#8a6a3a');
      if (lv >= 3) { const p = P(x1 - .7, y1 - .7, 0); garis(p[0], p[1], p[0], p[1] - 22, 1.6, '#5b3a20'); garis(p[0] - 7, p[1] - 15, p[0] + 7, p[1] - 15, 1.6, '#5b3a20'); bulat(p[0], p[1] - 24, 3.4, '#e9dcc0'); }
      break;
    }
    case 'lombong_timah': {
      tapak(x0 + .2, y0 + .2, x1 - .2, y1 - .2, '#8f7f6a');
      tapak(x0 + .5, cy, x1 - .5, y1 - .45, '#5f8aa3');
      prism(x0 + .4, cy - .5, x0 + .52, cy - .38, 0, 1.3, '#5a3a1e', false);
      prism(x1 - .6, cy - .5, x1 - .48, cy - .38, 0, .55, '#5a3a1e', false);
      poly([[x0 + .35, cy - .58, 1.35], [x1 - .4, cy - .58, .6], [x1 - .4, cy - .3, .6], [x0 + .35, cy - .3, 1.35]], '#8a5a2e', GARIS);
      for (let i = 0; i < 2 + Math.floor(isi * 5); i++) prism(x0 + .5 + (i % 3) * .32, y0 + .35 + Math.floor(i / 3) * .3, x0 + .76 + (i % 3) * .32, y0 + .55 + Math.floor(i / 3) * .3, 0, .13, '#b7c7d6');
      break;
    }
    case 'peti_emas': {
      prism(x0 + .3, y0 + .3, x1 - .3, y1 - .3, 0, .25, '#b39a6b');
      prism(x0 + .6, y0 + .6, x1 - .6, y1 - .6, .25, 1.25, '#7c4a22');
      poly([[cx - .28, y1 - .6, .25], [cx + .28, y1 - .6, .25], [cx + .28, y1 - .6, .85], [cx - .28, y1 - .6, .85]], '#f4c20d', GARIS);
      limas(x0 + .42, y0 + .42, x1 - .42, y1 - .42, 1.25, .85 + lv * .03, '#8f1d21');
      const r = rng(b.id * 13), n = Math.floor(isi * 10);
      for (let i = 0; i < n; i++) { const p = P(x0 + .45 + r() * (s - .9), y1 - .45 - r() * .2, .27); bulat(p[0], p[1], 3, '#f6c431'); }
      break;
    }
    case 'jelapang': {
      tiang(x0 + .6, y0 + .6, x1 - .6, y1 - .6, 0, .8, '#3d2412', .14);
      prism(x0 + .55, y0 + .55, x1 - .55, y1 - .55, .8, 1.6, '#b08850');
      for (let i = 1; i < 5; i++) garisD([x0 + .55, y1 - .55, .8 + i * .16], [x1 - .55, y1 - .55, .8 + i * .16], .8, 'rgba(60,35,10,.4)');
      bumbung(x0 + .35, y0 + .35, x1 - .35, y1 - .35, 1.6, 1.0, '#7b5a2e', { paksi: 'y', dinding: '#9a7440' });
      const n = 1 + Math.floor(isi * 5);
      for (let i = 0; i < n; i++) prism(x0 + .25 + i * .42, y1 - .45, x0 + .6 + i * .42, y1 - .15, 0, .3, '#efe4c8');
      break;
    }
    case 'gudang_timah': {
      prism(x0 + .35, y0 + .35, x1 - .35, y1 - .35, 0, 1.1, '#8d969e');
      prism(x0 + .25, y0 + .25, x1 - .25, y1 - .25, 1.1, 1.25, '#6b737a');
      for (let i = 0; i < 2 + Math.floor(isi * 6); i++) prism(x0 + .5 + (i % 4) * .48, y0 + .5 + Math.floor(i / 4) * .5, x0 + .85 + (i % 4) * .48, y0 + .7 + Math.floor(i / 4) * .5, 1.25, 1.4, '#c3d2e0');
      break;
    }
    case 'bangsal_tukang': {
      tiang(x0 + .35, y0 + .35, x1 - .35, y1 - .35, 0, .35, '#3d2412', .1);
      prism(x0 + .35, y0 + .35, x1 - .35, y1 - .35, .35, .95, '#a0784a');
      bumbung(x0 + .2, y0 + .2, x1 - .2, y1 - .2, .95, .7, '#7b5a2e');
      if (o.tukangLapang) lukisUnit({ t: 'tukang', x: x1 - .2, y: y1 + .1, arah: -1, langkah: ts * 3, serang: Math.sin(ts * 6) > .3 ? .1 : 0 });
      break;
    }
    case 'balai_tentera': {
      bendera(x1 - .5, y0 + .5, 0, 2.6, '#b8322f', ts);
      tiang(x0 + .5, y0 + .7, x1 - .5, y1 - .7, 0, .35, '#3d2412', .12);
      prism(x0 + .5, y0 + .7, x1 - .5, y1 - .7, .35, 1.15, '#9a5a2c');
      bumbung(x0 + .3, y0 + .5, x1 - .3, y1 - .5, 1.15, .95, '#6e3a1c', { tanduk: lv >= 4 });
      for (let i = 0; i < 3; i++) garisD([x0 + .6 + i * .25, y1 - .3, 0], [x0 + .7 + i * .25, y1 - .3, 1.2], 1.6, '#c9c9c9');
      break;
    }
    case 'kem': {
      tapak(x0 + .15, y0 + .15, x1 - .15, y1 - .15, '#a3824f');
      const khemah = Math.min(4, 1 + Math.floor(lv / 2));
      const sudut = [[x0 + .25, y0 + .25], [x1 - 1.05, y0 + .25], [x0 + .25, y1 - 1.05], [x1 - 1.05, y1 - 1.05]];
      for (let i = 0; i < khemah; i++) limas(sudut[i][0], sudut[i][1], sudut[i][0] + .8, sudut[i][1] + .8, 0, .75, i % 2 ? '#e6d5b0' : '#d9c39a');
      const p = P(cx, cy, 0), f = Math.sin(ts * 9) * 1.5;
      bulat(p[0], p[1], 6, '#3a2416'); bulat(p[0], p[1] - 4, 4.5 + f * .4, '#f08a24'); bulat(p[0], p[1] - 6, 2.5 + f * .3, '#ffd24a');
      break;
    }
    case 'balai_ilmu': {
      tiang(x0 + .55, y0 + .7, x1 - .55, y1 - .7, 0, .55, '#3d2412', .12);
      prism(x0 + .55, y0 + .7, x1 - .55, y1 - .7, .55, 1.3, '#8a5a2e');
      garisD([x0 + .55, y1 - .7, .95], [x1 - .55, y1 - .7, .95], 2, '#f4c20d');
      bumbung(x0 + .35, y0 + .5, x1 - .35, y1 - .5, 1.3, .85, '#2b211a', { gonjong: .75 + lv * .05, dinding: '#a3703a' });
      break;
    }
    case 'balai_muafakat': {
      prism(x0 + .3, y0 + .3, x1 - .3, y1 - .3, 0, .35, '#b39a6b');
      tiang(x0 + .5, y0 + .5, x1 - .5, y1 - .5, .35, 1.3, '#5a3a1e', .13);
      limas(x0 + .25, y0 + .25, x1 - .25, y1 - .25, 1.3, 1.0, '#7b3b1e');
      bendera(cx, cy, 2.3, 1.2, '#2f7d32', ts);
      break;
    }
    case 'meriam_lela': {
      prism(x0 + .22, y0 + .22, x1 - .22, y1 - .22, 0, .3, '#7a5230');
      const a = b.sudut ?? Math.PI / 4, p = P(cx, cy, .55), q = P(cx + Math.cos(a) * .8, cy + Math.sin(a) * .8, .62);
      bulat(...P(cx - Math.sin(a) * .25, cy + Math.cos(a) * .25, .38), 4.5, '#3a2416');
      garis(p[0], p[1], q[0], q[1], 9 + lv * .4, '#4a3418'); garis(p[0], p[1], q[0], q[1], 6.5 + lv * .4, lv >= 4 ? '#d4a44a' : '#b8873b');
      bulat(q[0], q[1], 3, '#2a1a0c');
      bulat(...P(cx + Math.sin(a) * .25, cy - Math.cos(a) * .25, .38), 4.5, '#3a2416');
      if (b.kilat > 0) bulat(q[0], q[1], 7, 'rgba(255,200,80,.9)');
      break;
    }
    case 'menara_sumpit': {
      const h = 2 + lv * .06;
      tiang(x0 + .4, y0 + .4, x1 - .4, y1 - .4, 0, h, '#5a3a1e', .12);
      garisD([x0 + .45, y1 - .45, .2], [x1 - .45, y1 - .45, h - .3], 1.4, '#5a3a1e'); garisD([x1 - .45, y1 - .45, .2], [x0 + .45, y1 - .45, h - .3], 1.4, '#5a3a1e');
      prism(x0 + .3, y0 + .3, x1 - .3, y1 - .3, h, h + .18, '#7a5230');
      lukisUnit({ t: 'pemanah', x: cx, y: cy, z: h + .18, arah: Math.cos((b.sudut ?? 0) - Math.PI / 4) >= 0 ? 1 : -1, serang: b.kilat > 0 ? .2 : 0 });
      tiang(x0 + .3, y0 + .3, x1 - .3, y1 - .3, h + .18, h + .95, '#5a3a1e', .07);
      limas(x0 + .2, y0 + .2, x1 - .2, y1 - .2, h + .95, .55, '#8a6a3a');
      break;
    }
    case 'meriam_besar': {
      prism(x0 + .35, y0 + .35, x1 - .35, y1 - .35, 0, .6, '#9a9184');
      for (let i = 0; i < 4; i++) prism(x0 + .35 + i * .62, y1 - .5, x0 + .6 + i * .62, y1 - .35, .6, .78, '#9a9184', false);
      const a = b.sudut ?? Math.PI / 4, p = P(cx, cy, .7), q = P(cx + Math.cos(a) * .45, cy + Math.sin(a) * .45, 1.45);
      garis(p[0], p[1], q[0], q[1], 17, '#1a1a1a'); garis(p[0], p[1], q[0], q[1], 13, '#3a3a3a'); bulat(q[0], q[1], 6.5, '#111');
      if (lv >= 4) bulat(p[0], p[1], 4, '#d4a44a');
      break;
    }
    case 'kota': {
      const batu = lv >= 4, c = lv >= 6 ? '#d6cfc0' : batu ? '#a8a29a' : lv >= 2 ? '#9a6232' : '#8b5a2b', k = .22, h = batu ? 1.0 : .9;
      const hidup = o.petaKota || petaKota;
      if (hidup.has((b.x + 1) + ',' + b.y)) prism(b.x + .5, b.y + .5 - k * .8, b.x + 1.5, b.y + .5 + k * .8, 0, h * .9, c);
      if (hidup.has(b.x + ',' + (b.y + 1))) prism(b.x + .5 - k * .8, b.y + .5, b.x + .5 + k * .8, b.y + 1.5, 0, h * .9, c);
      prism(b.x + .5 - k, b.y + .5 - k, b.x + .5 + k, b.y + .5 + k, 0, h, shade(c, .06));
      if (!batu) { const p = P(b.x + .5, b.y + .5, h); ctx.fillStyle = shade(c, -.1); ctx.beginPath(); ctx.moveTo(p[0] - 5, p[1]); ctx.lineTo(p[0], p[1] - 7); ctx.lineTo(p[0] + 5, p[1]); ctx.fill(); }
      else if (lv >= 6) { const p = P(b.x + .5, b.y + .5, h); bulat(p[0], p[1], 2, '#f4c20d'); }
      break;
    }
    case 'ranjau': {
      for (let i = 0; i < 5; i++) { const p = P(b.x + .25 + (i % 3) * .25, b.y + .3 + (i >> 1) * .2, 0); garis(p[0], p[1], p[0] + 1, p[1] - 8, 2, '#c9b36a'); }
      break;
    }
    case 'anjung_laksamana': case 'anjung_srikandi': {
      const tuah = b.t === 'anjung_laksamana';
      prism(x0 + .25, y0 + .25, x1 - .25, y1 - .25, 0, .3, '#c9b48a');
      tiang(x0 + .45, y0 + .45, x1 - .45, y1 - .45, .3, 1.6, '#5a3a1e', .12);
      if (b.lv >= 1 && !b.busy && !o.perang) lukisUnit({ t: tuah ? 'tuah' : 'fatimah', x: cx + .15, y: cy + .15, z: .3, arah: 1, langkah: 0 });
      limas(x0 + .3, y0 + .3, x1 - .3, y1 - .3, 1.6, .85, tuah ? '#c8960a' : '#8f1d21');
      break;
    }
  }
  if (b.busy || b.lv === 0) lukisPerancah(b, ts);
}
function lukisPerancah(b, ts) {
  const s = B[b.t].s, x0 = b.x + .1, y0 = b.y + .1, x1 = b.x + s - .1, y1 = b.y + s - .1, h = Math.min(2.2, s * .6);
  for (const [x, y] of [[x0, y1], [x1, y1], [x1, y0]]) garisD([x, y, 0], [x, y, h], 2, '#d9b56a');
  for (let i = 1; i <= 3; i++) { const z = h * i / 3.2; garisD([x0, y1, z], [x1, y1, z], 1.6, '#c9a45a'); garisD([x1, y1, z], [x1, y0, z], 1.6, '#c9a45a'); }
  lukisUnit({ t: 'tukang', x: x1 + .25, y: (y0 + y1) / 2 + .3, arah: -1, langkah: 0, serang: Math.sin(ts * 7 + b.id) > .2 ? .1 : 0 });
}
function lukisRuntuhan(b) {
  const s = B[b.t].s;
  if (b.t === 'kota') { prism(b.x + .3, b.y + .3, b.x + .7, b.y + .7, 0, .15, '#6b5a4a'); return; }
  tapak(b.x + .15, b.y + .15, b.x + s - .15, b.y + s - .15, '#4a3a2a');
  const r = rng(b.id * 17 + 3);
  for (let i = 0; i < 3 + s * 2; i++) { const x = b.x + .3 + r() * (s - .8), y = b.y + .3 + r() * (s - .8); prism(x, y, x + .25 + r() * .2, y + .25 + r() * .2, 0, .1 + r() * .25, r() < .5 ? '#7a6a58' : '#6b4423'); }
}

/* ---------- tentera ---------- */
function lukisUnit(u) {
  const [sx, sy] = P(u.x, u.y, u.z || 0);
  const c = ctx, hayun = Math.sin(u.langkah || 0) * 2.2, besar = { gajah: 1, hulubalang: 1.2, tuah: 1.3, fatimah: 1.25 }[u.t] || 1;
  c.save(); c.translate(sx, sy);
  c.fillStyle = 'rgba(0,0,0,.28)'; c.beginPath(); c.ellipse(0, 0, u.t === 'gajah' ? 17 : 7 * besar, u.t === 'gajah' ? 6.5 : 3 * besar, 0, 0, 7); c.fill();
  if (u.aura) { c.fillStyle = 'rgba(255,214,90,.35)'; c.beginPath(); c.ellipse(0, -14, 16, 20, 0, 0, 7); c.fill(); }
  c.scale((u.arah < 0 ? -1 : 1) * besar, besar);
  const kaki = (w = '#2a1a10') => { garis(-2, -6, -2.5 - hayun * .5, 0, 2.4, w); garis(2, -6, 2.5 + hayun * .5, 0, 2.4, w); };
  const kepala = (y = -18, r = 3.6) => bulat(0, y, r, '#c98b5a');
  const badan = (w, y = -15, h = 10) => { c.fillStyle = w; c.beginPath(); c.roundRect ? c.roundRect(-4.5, y, 9, h, 3) : c.rect(-4.5, y, 9, h); c.fill(); };
  switch (u.t) {
    case 'pendekar':
      kaki(); badan('#1c1c22'); c.fillStyle = '#b8322f'; c.fillRect(-5, -8.5, 10, 3.4); c.fillStyle = '#f4c20d'; c.fillRect(-5, -8.9, 10, .9);
      kepala(); c.fillStyle = '#b8322f'; c.beginPath(); c.moveTo(-4.2, -19.6); c.lineTo(4.2, -19.6); c.lineTo(2.6, -24.5); c.lineTo(-.8, -22.4); c.closePath(); c.fill();
      garis(-3.6, -20.2, 3.8, -20.2, 1, '#f4c20d');
      if (u.serang > 0) garis(4, -12, 11, -16, 1.8, '#eeeeee'); else garis(4, -9, 7, -5, 1.6, '#c0c0c0');
      break;
    case 'pemanah':
      kaki(); badan('#2e6b3f'); c.fillStyle = '#7a5230'; c.fillRect(-5, -8.5, 10, 2.6); kepala(); c.fillStyle = '#f4c20d'; c.fillRect(-3.8, -20.4, 7.6, 1.6);
      garis(1, -15.5, u.serang > 0 ? 16 : 13, u.serang > 0 ? -16.5 : -19, 1.8, '#7a5a2e');
      break;
    case 'tukang':
      kaki(); badan('#3d5a80'); kepala(); c.fillStyle = '#e9dcc0'; c.beginPath(); c.ellipse(0, -20.5, 5.5, 1.8, 0, 0, 7); c.fill(); c.beginPath(); c.arc(0, -20.5, 3, Math.PI, 0); c.fill();
      if (u.serang > 0) { garis(3, -12, 9, -18, 1.8, '#6b4423'); garis(7, -20, 11, -16, 3, '#9aa3ab'); } else { garis(3, -12, 10, -10, 1.8, '#6b4423'); garis(10, -13, 10, -7, 3, '#9aa3ab'); }
      break;
    case 'gajah': {
      for (const [x, y] of [[-8, -2], [-3, 0], [5, -2], [10, 0]]) garis(x, -10, x + hayun * .3 * (x > 0 ? 1 : -1), y, 4.5, '#5e5e5e');
      c.fillStyle = '#808080'; c.beginPath(); c.ellipse(0, -14, 14, 9, 0, 0, 7); c.fill();
      c.fillStyle = '#d4a017'; c.fillRect(-9, -21, 14, 7); c.fillStyle = '#b8322f'; c.fillRect(-8, -20, 12, 5);
      bulat(12, -16, 6.5, '#8a8a8a'); c.fillStyle = '#6e6e6e'; c.beginPath(); c.ellipse(9, -16, 3.6, 5.2, 0, 0, 7); c.fill();
      c.strokeStyle = '#7a7a7a'; c.lineWidth = 3.4; c.beginPath(); c.moveTo(17, -15); c.quadraticCurveTo(21, -8, 18 + (u.serang > 0 ? 4 : 0), -3); c.stroke();
      garis(15.5, -12, 19.5, -10, 2, '#f5f0e0'); bulat(13.5, -18, 1.1, '#111');
      c.fillStyle = '#8f1d21'; c.fillRect(-6, -29, 11, 7); c.fillStyle = '#f4c20d'; c.beginPath(); c.moveTo(-7, -29); c.lineTo(6, -29); c.lineTo(-.5, -34); c.closePath(); c.fill();
      bulat(-.5, -27.5, 2.2, '#c98b5a');
      break;
    }
    case 'pemecah':
      kaki(); badan('#5a3a1e'); kepala(); c.fillStyle = '#1c1c22'; c.fillRect(-3.8, -21, 7.6, 1.8);
      bulat(0, -27, 5.6, '#7a4a22'); garis(-5.4, -27, 5.4, -27, 1.2, '#3a2210'); garis(-4.6, -24.4, 4.6, -24.4, 1.2, '#3a2210');
      bulat(3.5, -33, 1.4 + acak() * 1.2, '#ffb020'); garis(2, -31, 3.5, -33, 1, '#3a2210');
      break;
    case 'hulubalang':
      kaki('#1d1208'); c.fillStyle = '#8f1d21'; c.fillRect(-6, -17, 12, 12); badan('#d4a017', -16, 7); kepala(-19.5, 3.8);
      c.fillStyle = '#d4a017'; c.beginPath(); c.arc(0, -21, 4.3, Math.PI, 0); c.fill(); c.fillRect(-.6, -28, 1.2, 4);
      garis(7, -32, 7, 0, 1.8, '#6b4423'); c.fillStyle = '#e6e6e6'; c.beginPath(); c.moveTo(5.5, -32); c.lineTo(7, -37); c.lineTo(8.5, -32); c.fill();
      bulat(-6, -11, 4.6, '#7a5230'); c.strokeStyle = '#d4a017'; c.lineWidth = 1.2; c.beginPath(); c.arc(-6, -11, 4.6, 0, 7); c.stroke();
      if (u.serang > 0) garis(7, -20, 15, -24, 2, '#e6e6e6');
      break;
    case 'tuah':
      kaki(); badan('#f3ead6'); c.fillStyle = '#8f1d21'; c.fillRect(-5, -9, 10, 4); c.fillStyle = '#f4c20d'; c.fillRect(-5, -7.8, 10, 1);
      kepala(); c.fillStyle = '#8f1d21'; c.beginPath(); c.moveTo(-4.4, -19.4); c.lineTo(4.4, -19.4); c.lineTo(3, -25); c.lineTo(-1.5, -23.5); c.closePath(); c.fill();
      c.fillStyle = '#f4c20d'; c.fillRect(-4.2, -20, 8.4, 1.2);
      if (u.serang > 0) garis(4, -12, 13, -17, 2.2, '#ffe27a'); else garis(4, -9, 8, -5, 2, '#ffe27a');
      break;
    case 'fatimah':
      c.fillStyle = '#8f1d21'; c.beginPath(); c.moveTo(-4.5, -15); c.lineTo(4.5, -15); c.lineTo(6, 0); c.lineTo(-6, 0); c.closePath(); c.fill();
      c.fillStyle = '#f4c20d'; c.fillRect(-5.5, -4, 11, 1.4); kepala(-18, 3.4);
      c.fillStyle = '#d4a017'; c.beginPath(); c.arc(0, -18.5, 4.4, Math.PI * 1.05, Math.PI * 1.95); c.lineTo(5, -12); c.lineTo(3, -12); c.closePath(); c.fill();
      c.strokeStyle = '#6b4423'; c.lineWidth = 1.6; c.beginPath(); c.arc(7, -12, 6, -1.2, 1.2); c.stroke(); garis(9.2, -17.6, 9.2, -6.4, .7, '#eee');
      break;
  }
  c.restore();
}

/* ================= Lukisan utama ================= */
function lukis(ts) {
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.fillStyle = '#2f5d29'; ctx.fillRect(0, 0, W, H);
  ctx.setTransform(DPR * cam.z, 0, 0, DPR * cam.z, DPR * (W / 2 - cam.x * cam.z), DPR * (H / 2 - cam.y * cam.z));
  lukisTanah(ts);
  const perang = mode === 'perang' && BT;
  const senarai = perang ? BT.blds : S.bld;
  petaKota = new Set();
  for (const b of senarai) if (b.t === 'kota' && !b.mati) petaKota.add(b.x + ',' + b.y);
  if (perang && (BT.kilat > 0 || !BT.mula)) {
    ctx.fillStyle = BT.kilat > 0 ? `rgba(230,60,40,${.12 + .18 * Math.min(1, BT.kilat)})` : 'rgba(230,60,40,.12)';
    for (const k of BT.sekat) { const [i, j] = k.split(',').map(Number); const a = P(i, j), b2 = P(i + 1, j), c = P(i + 1, j + 1), d = P(i, j + 1); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b2[0], b2[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(d[0], d[1]); ctx.fill(); }
  }
  if (!perang && pilihan && !S.letak) {
    const s = B[pilihan.t].s, al = .45 + .25 * Math.sin(ts * 5);
    poly([[pilihan.x - .08, pilihan.y - .08, 0], [pilihan.x + s + .08, pilihan.y - .08, 0], [pilihan.x + s + .08, pilihan.y + s + .08, 0], [pilihan.x - .08, pilihan.y + s + .08, 0]], `rgba(255,255,255,${al * .35})`, `rgba(255,255,255,${al})`);
  }
  if (perang) for (const z of BT.zon) {
    const p = P(z.x, z.y), rx = z.r * TW / Math.SQRT2, ry = z.r * TH / Math.SQRT2, f = 1 - z.t / z.dur;
    ctx.fillStyle = z.jenis === 'ubat' ? `rgba(120,230,120,${.22 * f + .05})` : `rgba(240,120,200,${.22 * f + .05})`;
    ctx.strokeStyle = z.jenis === 'ubat' ? 'rgba(170,255,170,.8)' : 'rgba(255,170,230,.8)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(p[0], p[1], rx, ry, 0, 0, 7); ctx.fill(); ctx.stroke();
  }
  const benda = [];
  for (const b of senarai) {
    if (b.t === 'ranjau' && perang) continue;
    if (S.letak && !S.letak.baru && S.letak.b === b) continue;
    const s = B[b.t].s; benda.push({ k: b.x + b.y + s, b });
  }
  for (const p of POKOK) benda.push({ k: p.x + p.y, p });
  if (perang) for (const u of BT.units) if (u.hp > 0) benda.push({ k: u.x + u.y, u });
  if (!perang) for (const u of tenteraKem()) benda.push({ k: u.x + u.y, u });
  benda.sort((a, b) => a.k - b.k);
  const lapang = tukangLapang();
  let kiraBangsal = 0;
  for (const e of benda) {
    if (e.p) lukisPokok(e.p, ts);
    else if (e.u) lukisUnit(e.u);
    else {
      const b = e.b, o = { ts, perang, mati: perang && b.mati };
      if (B[b.t].hasil) o.isi = (perang ? (b.lootBaki ? .6 : 0) : b.store / capPengumpul(b));
      else if (B[b.t].simpan) o.isi = perang ? .4 + .6 * (b.lootBaki ? (b.lootBaki.emas + b.lootBaki.beras + b.lootBaki.timah) / Math.max(1, b.lootJum) : 0) : S.res[B[b.t].simpan] / Math.max(1, capSumber(B[b.t].simpan));
      if (b.t === 'bangsal_tukang' && !perang) o.tukangLapang = kiraBangsal++ < lapang;
      if (perang && b.kena > 0) { ctx.globalAlpha = .75; lukisBangunan(b, o); ctx.globalAlpha = 1; }
      else lukisBangunan(b, o);
    }
  }
  if (perang) { lukisPeluru(); lukisKesan(ts); }
  if (S.letak) lukisHantu(ts);
  // lapisan skrin
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  if (perang) lukisAtasPerang(); else lukisAtasKampung(ts);
}
function tenteraKem() {
  const out = [], kem = S.bld.filter(b => b.t === 'kem' && b.lv >= 1); if (!kem.length) return out;
  const jenis = []; for (const [k, n] of Object.entries(S.army)) for (let i = 0; i < Math.min(n, 8); i++) jenis.push(k);
  const per = Math.ceil(Math.min(jenis.length, 14 * kem.length) / kem.length);
  kem.forEach((b, ki) => {
    const sub = jenis.slice(ki * per, ki * per + per);
    sub.forEach((t, i) => { const a = i / Math.max(1, sub.length) * Math.PI * 2 + ki; const r = t === 'gajah' ? 1.05 : .8 + (i % 2) * .3; out.push({ t, x: b.x + 1.5 + Math.cos(a) * r, y: b.y + 1.5 + Math.sin(a) * r, arah: Math.cos(a + Math.PI) - Math.sin(a + Math.PI) > 0 ? 1 : -1, langkah: 0 }); });
  });
  return out;
}
function lukisHantu(ts) {
  const L = S.letak, s = B[L.t].s, ok = bolehLetak(L.t, L.x, L.y, L.b);
  poly([[L.x, L.y, 0], [L.x + s, L.y, 0], [L.x + s, L.y + s, 0], [L.x, L.y + s, 0]], ok ? 'rgba(90,230,90,.45)' : 'rgba(240,70,50,.5)', ok ? '#bfffbf' : '#ffb0a0');
  ctx.globalAlpha = .82;
  lukisBangunan({ id: 999, t: L.t, x: L.x, y: L.y, lv: L.b ? L.b.lv : 1, busy: null }, { ts });
  ctx.globalAlpha = 1;
  ctx.fillStyle = 'rgba(255,255,255,.85)';
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const q = P(L.x + s / 2 + dx * (s / 2 + .55), L.y + s / 2 + dy * (s / 2 + .55)); ctx.beginPath(); ctx.arc(q[0], q[1], 4, 0, 7); ctx.fill(); }
}
function lukisAtasKampung(ts) {
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (const b of S.bld) {
    const s = B[b.t].s;
    if (b.busy) {
      const [x, y] = keSkrin(P(b.x + s / 2, b.y + s / 2, s * .9 + .8)), w = 58, f = clamp((kini() - b.busy.mula) / (b.busy.until - b.busy.mula), 0, 1);
      ctx.fillStyle = 'rgba(10,6,3,.8)'; ctx.fillRect(x - w / 2 - 2, y - 7, w + 4, 14);
      ctx.fillStyle = '#6fcf4a'; ctx.fillRect(x - w / 2, y - 5, w * f, 10);
      ctx.font = '700 10px Andika, sans-serif'; ctx.fillStyle = '#fff'; ctx.fillText(masa((b.busy.until - kini()) / 1000), x, y + .5);
    } else if (B[b.t].hasil && b.lv >= 1 && b.store >= Math.max(5, capPengumpul(b) * .06)) {
      const [x, y] = keSkrin(P(b.x + s / 2, b.y + s / 2, 2.1)), bob = Math.sin(ts * 3 + b.id) * 3, penuh = b.store >= capPengumpul(b) * .999;
      ctx.fillStyle = 'rgba(10,6,3,.55)'; ctx.beginPath(); ctx.ellipse(x, y + 16 + bob * .2, 8, 3, 0, 0, 7); ctx.fill();
      ctx.fillStyle = penuh ? '#fff6c8' : '#ffffff'; ctx.strokeStyle = '#140c07'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(x, y + bob, 13, 0, 7); ctx.fill(); ctx.stroke();
      lukisIkonSumber(B[b.t].hasil, x, y + bob, 8);
    }
  }
}
function lukisIkonSumber(r, x, y, rr) {
  if (r === 'emas') { bulat(x, y, rr, '#f6c431'); ctx.strokeStyle = '#7a4f00'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(x, y, rr, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.arc(x, y, rr * .5, 0, 7); ctx.stroke(); }
  else if (r === 'beras') { for (let i = 0; i < 4; i++) { ctx.fillStyle = '#8fd14f'; ctx.strokeStyle = '#3f6b14'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(x - 3 + (i % 2) * 6, y - 4 + (i >> 1) * 7, 2.6, 4, (i % 2 ? .5 : -.5), 0, 7); ctx.fill(); ctx.stroke(); } }
  else if (r === 'timah') { ctx.fillStyle = '#9fb4c8'; ctx.strokeStyle = '#2d3c4a'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x - rr, y + 4); ctx.lineTo(x - rr * .5, y - 4); ctx.lineTo(x + rr * .5, y - 4); ctx.lineTo(x + rr, y + 4); ctx.closePath(); ctx.fill(); ctx.stroke(); }
}

/* ================= Input ================= */
const jari = new Map();
let gerak = null, tahan = null;
cv.addEventListener('pointerdown', e => {
  bukaAudio();
  try { cv.setPointerCapture(e.pointerId); } catch (er) { }
  jari.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (jari.size === 2) {
    const [a, b] = [...jari.values()];
    gerak = { jenis: 'cubit', d0: Math.hypot(a.x - b.x, a.y - b.y) || 1, z0: cam.z, m0: [(a.x + b.x) / 2, (a.y + b.y) / 2], c0: [cam.x, cam.y] };
    batalTahan(); return;
  }
  const [gx, gy] = skrinKeDunia(e.clientX, e.clientY);
  let seret = false, ox = 0, oy = 0;
  if (S.letak && mode === 'kampung') {
    const s = B[S.letak.t].s;
    if (gx >= S.letak.x - .5 && gx < S.letak.x + s + .5 && gy >= S.letak.y - .5 && gy < S.letak.y + s + .5) { seret = true; ox = gx - S.letak.x; oy = gy - S.letak.y; }
  }
  gerak = { jenis: 'tekan', x0: e.clientX, y0: e.clientY, c0: [cam.x, cam.y], gerak: false, seret, ox, oy };
  if (mode === 'perang') mulaTahan(e.clientX, e.clientY);
});
cv.addEventListener('pointermove', e => {
  const p = jari.get(e.pointerId); if (!p) return;
  p.x = e.clientX; p.y = e.clientY;
  if (!gerak) return;
  if (gerak.jenis === 'cubit' && jari.size >= 2) {
    const [a, b] = [...jari.values()];
    const z = clamp(gerak.z0 * Math.hypot(a.x - b.x, a.y - b.y) / gerak.d0, ZMIN, ZMAX);
    const m = [(a.x + b.x) / 2, (a.y + b.y) / 2];
    const wx = (gerak.m0[0] - W / 2) / gerak.z0 + gerak.c0[0], wy = (gerak.m0[1] - H / 2) / gerak.z0 + gerak.c0[1];
    cam.z = z; cam.x = wx - (m[0] - W / 2) / z; cam.y = wy - (m[1] - H / 2) / z; hadKamera();
  } else if (gerak.jenis === 'tekan') {
    const dx = e.clientX - gerak.x0, dy = e.clientY - gerak.y0;
    if (!gerak.gerak && Math.hypot(dx, dy) > 9) { gerak.gerak = true; if (!(tahan && tahan.aktif)) batalTahan(); }
    if (!gerak.gerak) return;
    if (tahan && tahan.aktif) { tahan.x = e.clientX; tahan.y = e.clientY; return; }
    if (gerak.seret && S.letak) {
      const [gx, gy] = skrinKeDunia(e.clientX, e.clientY), s = B[S.letak.t].s;
      S.letak.x = clamp(Math.round(gx - gerak.ox), 0, G - s); S.letak.y = clamp(Math.round(gy - gerak.oy), 0, G - s);
    } else { cam.x = gerak.c0[0] - dx / cam.z; cam.y = gerak.c0[1] - dy / cam.z; hadKamera(); }
  }
});
function lepasJari(e, batal) {
  const ada = jari.has(e.pointerId); jari.delete(e.pointerId);
  if (!ada) return;
  if (!batal && gerak && gerak.jenis === 'tekan' && !gerak.gerak && !(tahan && tahan.dilepas)) ketik(e.clientX, e.clientY);
  batalTahan();
  gerak = null;
}
cv.addEventListener('pointerup', e => lepasJari(e, false));
cv.addEventListener('pointercancel', e => lepasJari(e, true));
cv.addEventListener('wheel', e => { e.preventDefault(); zoomDi(e.clientX, e.clientY, cam.z * Math.exp(-e.deltaY * .0015)); }, { passive: false });
cv.addEventListener('contextmenu', e => e.preventDefault());
function mulaTahan(x, y) {
  batalTahan();
  tahan = { x, y, aktif: false, dilepas: false };
  tahan.t1 = setTimeout(() => {
    if (!tahan) return; tahan.aktif = true;
    const ulang = () => { if (!tahan) return; const [gx, gy] = skrinKeDunia(tahan.x, tahan.y); if (lepas(gx, gy, true)) tahan.dilepas = true; tahan.t2 = setTimeout(ulang, 120); };
    ulang();
  }, 260);
}
function batalTahan() { if (tahan) { clearTimeout(tahan.t1); clearTimeout(tahan.t2); } tahan = null; }
function cariBangunanSkrin(sx, sy) {
  for (const ofs of [0, 14, 28, 44]) {
    const [gx, gy] = skrinKeDunia(sx, sy + ofs * cam.z);
    for (let i = S.bld.length - 1; i >= 0; i--) { const b = S.bld[i], s = B[b.t].s; if (gx >= b.x && gx < b.x + s && gy >= b.y && gy < b.y + s) return b; }
  }
  return null;
}
function ketik(sx, sy) {
  const [gx, gy] = skrinKeDunia(sx, sy);
  if (mode === 'perang') { lepas(gx, gy); return; }
  if (S.letak) { const s = B[S.letak.t].s; S.letak.x = clamp(Math.round(gx - s / 2), 0, G - s); S.letak.y = clamp(Math.round(gy - s / 2), 0, G - s); return; }
  const b = cariBangunanSkrin(sx, sy);
  if (b && B[b.t].hasil && b.lv >= 1 && b.store >= 1) kutip(b);
  pilihBangunan(b);
}
addEventListener('keydown', e => {
  if (e.key === 'Escape') { if (!$('#modal').hidden) tutupModal(); else if (S.letak) batalLetak(); else pilihBangunan(null); }
});

/* ================= Tindakan kampung ================= */
function pilihBangunan(b) { if (b && b !== pilihan) sfx('ketik'); pilihan = b; paparPanel(); }
function kutip(b) {
  const r = B[b.t].hasil, dapat = Math.floor(tambah(r, Math.floor(b.store)));
  if (dapat <= 0) { toast(`Simpanan ${SUMBER[r].n} penuh. Naik taraf ${r === 'emas' ? 'Perbendaharaan' : r === 'beras' ? 'Jelapang' : 'Gudang Timah'}.`, true); return; }
  b.store -= dapat;
  if (r === 'emas') S.stat.kumpulEmas += dapat;
  S.stat.kumpul += dapat; misi('kumpul', dapat);
  apungTeks(b, `+${fmtN(dapat)}`, SUMBER[r].w);
  sfx('kutip'); semakLangkah(); kemaskiniHUD();
}
let apungan = [];
function apungTeks(b, txt, w) { const s = B[b.t].s; apungan.push({ x: b.x + s / 2, y: b.y + s / 2, z: 2, txt, w, t: 0 }); }
function naikTaraf(b) {
  if (b.busy) return;
  const lvB = b.lv + 1;
  if (lvB > maxLv(b.t)) { toast(b.t === 'istana' ? 'Istana sudah di tahap tertinggi.' : 'Naik taraf Istana dahulu untuk membuka tahap seterusnya.', true); sfx('salah'); return; }
  const k = kos(b.t, lvB), tm = masaBina(b.t, lvB);
  if (tm > 0 && tukangLapang() <= 0) { toast('Semua tukang sedang sibuk. Tunggu siap atau bina Bangsal Tukang.', true); sfx('salah'); return; }
  if (k[1] > capSumber(k[0])) { toast(`Simpanan ${SUMBER[k[0]].n} terlalu kecil (${fmtK(capSumber(k[0]))}). Naik taraf atau tambah gudang.`, true); sfx('salah'); return; }
  if (!bayar(k)) { toast(`${SUMBER[k[0]].n} tidak cukup. Perlu ${fmtN(k[1])}, ada ${fmtN(S.res[k[0]])}.`, true); sfx('salah'); return; }
  if (tm <= 0) { b.lv = lvB; S.stat.naik++; misi('naik'); tambahXP(2); semakHikayat(); toast(`${namaBangunan(b.t, lvB)} kini tahap ${lvB}`); }
  else b.busy = { until: kini() + tm * 1000, toLv: lvB, mula: kini() };
  sfx('bina'); paparPanel(); kemaskiniHUD(); simpan(); semakLangkah();
}
const kosPercepat = b => Math.max(1, Math.ceil((b.busy.until - kini()) / 1000 / 40));
function percepat(b) {
  if (!b.busy) return; const c = kosPercepat(b);
  if (S.res.mutiara < c) { toast(`Mutiara tidak cukup. Perlu ${c}.`, true); sfx('salah'); return; }
  S.res.mutiara -= c; b.busy.until = kini(); kemaskini(kini()); kemaskiniHUD(); simpan();
}
function bolehLetak(t, x, y, kecuali) {
  const s = B[t].s; if (x < 0 || y < 0 || x + s > G || y + s > G) return false;
  for (const b of S.bld) { if (b === kecuali) continue; const s2 = B[b.t].s; if (x < b.x + s2 && x + s > b.x && y < b.y + s2 && y + s > b.y) return false; }
  return true;
}
function cariTempat(t, dekat) {
  const s = B[t].s, [cx, cy] = dekat || [G / 2 - s / 2, G / 2 - s / 2];
  for (let r = 0; r < G; r++) for (let dx = -r; dx <= r; dx++) for (let dy = -r; dy <= r; dy++) {
    if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
    const x = Math.round(cx + dx), y = Math.round(cy + dy); if (bolehLetak(t, x, y)) return [x, y];
  }
  return null;
}
function mulaLetak(t, dekat) {
  const tempat = cariTempat(t, dekat);
  if (!tempat) { toast('Tiada ruang kosong. Pindahkan bangunan untuk memberi ruang.', true); return; }
  S.letak = { t, x: tempat[0], y: tempat[1], baru: true };
  pilihan = null; tutupModal(); paparLetak();
  const p = P(tempat[0] + B[t].s / 2, tempat[1] + B[t].s / 2); cam.x = p[0]; cam.y = p[1]; hadKamera();
}
function mulaPindah(b) { S.letak = { t: b.t, x: b.x, y: b.y, baru: false, b }; pilihan = null; paparPanel(); paparLetak(); }
function batalLetak() { S.letak = null; paparLetak(); paparPanel(); }
function sahLetak() {
  const L = S.letak; if (!L) return;
  if (!bolehLetak(L.t, L.x, L.y, L.b)) { toast('Tidak boleh diletak di situ. Pilih kawasan hijau.', true); sfx('salah'); return; }
  if (!L.baru) { L.b.x = L.x; L.b.y = L.y; S.letak = null; pilihan = L.b; sfx('bina'); paparLetak(); paparPanel(); simpan(); return; }
  const t = L.t, k = kos(t, 1), tm = masaBina(t, 1);
  if (bil(t) >= had(t)) { toast(`Had ${B[t].n} untuk Istana tahap ${istLv()} sudah dicapai.`, true); batalLetak(); return; }
  if (tm > 0 && tukangLapang() <= 0) { toast('Semua tukang sedang sibuk.', true); sfx('salah'); return; }
  if (k[0] !== 'mutiara' && k[1] > capSumber(k[0])) { toast(`Simpanan ${SUMBER[k[0]].n} terlalu kecil.`, true); sfx('salah'); return; }
  if (!bayar(k)) { toast(`${SUMBER[k[0]].n} tidak cukup. Perlu ${fmtN(k[1])}.`, true); sfx('salah'); return; }
  const b = { id: S.nextId++, t, x: L.x, y: L.y, lv: tm > 0 ? 0 : 1, busy: tm > 0 ? { until: kini() + tm * 1000, toLv: 1, mula: kini() } : null, store: 0, last: kini() };
  S.bld.push(b); sfx('bina');
  if (tm === 0) { S.stat.naik++; misi('naik'); semakHikayat(); }
  if (t === 'bangsal_tukang') toast('Tukang baharu sedia bekerja!');
  semakLangkah();
  if (t === 'kota' || t === 'ranjau') {
    if (bil(t) < had(t) && cukup(kos(t, 1))) {
      const nx = L.x + (L.arahY ? 0 : 1), ny = L.y + (L.arahY ? 1 : 0);
      if (bolehLetak(t, nx, ny)) { L.x = nx; L.y = ny; } else { const tp = cariTempat(t, [L.x, L.y]); if (tp) { L.x = tp[0]; L.y = tp[1]; } else S.letak = null; }
      paparLetak(); kemaskiniHUD(); simpan(); return;
    }
  }
  S.letak = null; pilihan = b; paparLetak(); paparPanel(); kemaskiniHUD(); simpan();
}
function latih(k, n = 1) {
  const d = TR[k];
  for (let i = 0; i < n; i++) {
    if (balaiMaks() < d.buka) { toast(`Naik taraf Balai Tentera ke tahap ${d.buka} untuk melatih ${d.n}.`, true); sfx('salah'); return; }
    if (ruangGuna() + ruangGilir() + d.ruang > ruangTentera()) { toast('Medan Kawad sudah penuh. Naik taraf atau bina Medan Kawad baharu.', true); sfx('salah'); return; }
    if (S.res.beras < d.kos) { toast(`Beras tidak cukup untuk ${d.n}.`, true); sfx('salah'); return; }
    S.res.beras -= d.kos; if (!S.gilir.length) S.gilirMula = kini(); S.gilir.push(k);
  }
  sfx('ketik'); kemaskiniHUD(); perluRender = true;
}
function batalGilir(i) { const k = S.gilir[i]; if (!k) return; S.gilir.splice(i, 1); tambah('beras', TR[k].kos); if (i === 0) S.gilirMula = kini(); perluRender = true; kemaskiniHUD(); }
function mulaKaji(k) {
  const lv = S.troopLv[k] + 1;
  if (S.kaji) { toast('Balai Ilmu sedang menjalankan kajian lain.', true); return; }
  const bi = S.bld.find(x => x.t === 'balai_ilmu'); if (!bi || !aktif(bi)) { toast('Balai Ilmu sedang dinaik taraf atau belum siap.', true); return; }
  if (lv > maxKaji()) { toast('Naik taraf Balai Ilmu untuk kajian tahap lebih tinggi.', true); return; }
  if (balaiMaks() < TR[k].buka) { toast(`Buka ${TR[k].n} di Balai Tentera dahulu.`, true); return; }
  const c = kosKaji(k, lv);
  if (c > capSumber('beras')) { toast('Simpanan beras terlalu kecil untuk kajian ini.', true); return; }
  if (!bayar(['beras', c])) { toast(`Beras tidak cukup. Perlu ${fmtN(c)}.`, true); sfx('salah'); return; }
  S.kaji = { k, lv, until: kini() + MASA_KAJI[lv] * 1000, mula: kini() }; sfx('bina'); perluRender = true; kemaskiniHUD(); simpan();
}

/* ================= Perang ================= */
function janaPangkalan(L, seed) {
  const r = rng(seed), occ = new Set(), blds = []; let id = 1;
  const muat = (x, y, s) => { if (x < 1 || y < 1 || x + s > G - 1 || y + s > G - 1) return false; for (let i = x; i < x + s; i++) for (let j = y; j < y + s; j++) if (occ.has(i + ',' + j)) return false; return true; };
  const letak = (t, x, y, lv) => { const s = B[t].s; for (let i = x; i < x + s; i++) for (let j = y; j < y + s; j++) occ.add(i + ',' + j); blds.push({ id: id++, t, x, y, lv }); };
  const lvR = t => { const m = Math.max(1, maxLvUntuk(t, L) - 1); return clamp(m - Math.floor(r() * 1.6), 1, m); };
  letak('istana', 10, 10, L);
  const cincin = L >= 5 ? [4, 19] : L >= 3 ? [6, 17] : L === 2 ? [7, 16] : null, dinding = [];
  const ruangDalam = cincin ? [cincin[0] + 1, cincin[1] - 1] : [7, 16];
  if (cincin) {
    const [a, z] = cincin;
    for (let i = a; i <= z; i++) dinding.push([i, a], [i, z]);
    for (let i = a + 1; i < z; i++) dinding.push([a, i], [z, i]);
    if (L >= 4) { for (let i = 9; i <= 14; i++) dinding.push([i, 9], [i, 14]); for (let i = 10; i < 14; i++) dinding.push([9, i], [14, i]); }
    const celah = L <= 3 ? Math.floor(r() * 3) : 0;
    for (let c = 0; c < celah; c++) dinding.splice(Math.floor(r() * (cincin[1] - cincin[0])), 1);
    for (const [x, y] of dinding) occ.add(x + ',' + y);
  }
  const dalam = ['meriam_besar', 'peti_emas', 'jelapang', 'gudang_timah', 'meriam_lela', 'menara_sumpit', 'balai_muafakat', 'balai_ilmu'];
  const luar = ['lombong_emas', 'sawah', 'lombong_timah', 'balai_tentera', 'kem', 'bangsal_tukang'];
  const cubaLetak = (t, kawasan) => {
    const s = B[t].s;
    for (let n = 0; n < 220; n++) {
      const x = kawasan[0] + Math.floor(r() * (kawasan[1] - kawasan[0] - s + 2)), y = kawasan[0] + Math.floor(r() * (kawasan[1] - kawasan[0] - s + 2));
      if (muat(x, y, s)) { letak(t, x, y, lvR(t)); return true; }
    }
    return false;
  };
  for (const t of dalam) {
    const n = t === 'bangsal_tukang' ? 2 : BIL[t][L - 1];
    for (let i = 0; i < n; i++) if (!cubaLetak(t, ruangDalam)) cubaLetak(t, [1, G - 2]);
  }
  for (const t of luar) {
    const n = t === 'bangsal_tukang' ? 2 + Math.floor(L / 2) : BIL[t][L - 1];
    for (let i = 0; i < n; i++) cubaLetak(t, [1, G - 2]);
  }
  const kotaLv = lvR('kota');
  for (const [x, y] of dinding) blds.push({ id: id++, t: 'kota', x, y, lv: kotaLv });
  for (let i = 0; i < BIL.ranjau[L - 1]; i++) for (let n = 0; n < 60; n++) { const x = ruangDalam[0] + Math.floor(r() * (ruangDalam[1] - ruangDalam[0])), y = ruangDalam[0] + Math.floor(r() * (ruangDalam[1] - ruangDalam[0])); if (muat(x, y, 1)) { letak('ranjau', x, y, lvR('ranjau')); break; } }
  const asas = [600, 1500, 4000, 9000, 18000, 32000, 50000][L - 1], m = .5 + r(), karam = r() < .1;
  const f = karam ? 2.5 : 1;
  return { blds, karam, loot: { emas: Math.round(asas * m * f), beras: Math.round(asas * m * (.8 + r() * .4) * f), timah: L >= 5 ? Math.round(asas * .035 * m * f) : 0 } };
}
function mulaPerang(lawan) {
  const pg = janaPangkalan(lawan.L, lawan.seed);
  const mf = lawan.jenis === 'kempen' && (S.kempen[lawan.idx] || 0) > 0 ? .3 : 1;
  const blds = pg.blds.map(b => ({ ...b, maxHp: hpBangunan(b.t, b.lv), hp: hpBangunan(b.t, b.lv), mati: false, cd: acak(), sudut: Math.PI / 4, kena: 0, kilat: 0 }));
  // agihan rampasan
  for (const r of ['emas', 'beras', 'timah']) {
    const jum = pg.loot[r] * mf; if (!jum) continue;
    const gudang = blds.filter(b => B[b.t].simpan === r), pungut = blds.filter(b => B[b.t].hasil === r), ist = blds.find(b => b.t === 'istana');
    const bahagi = (arr, n) => { for (const b of arr) { b.loot = b.loot || { emas: 0, beras: 0, timah: 0 }; b.loot[r] += n / arr.length; } };
    if (gudang.length) bahagi(gudang, jum * .7); else bahagi([ist], jum * .7);
    if (pungut.length) bahagi(pungut, jum * .2); else bahagi([ist], jum * .2);
    bahagi([ist], jum * .1);
  }
  for (const b of blds) if (b.loot) { b.lootBaki = { ...b.loot }; b.lootJum = b.loot.emas + b.loot.beras + b.loot.timah; }
  const sekat = new Set();
  for (const b of blds) { if (b.t === 'ranjau') continue; const s = B[b.t].s; for (let i = b.x - 1; i < b.x + s + 1; i++) for (let j = b.y - 1; j < b.y + s + 1; j++) sekat.add(i + ',' + j); }
  const dinding = new Map(); for (const b of blds) if (b.t === 'kota') dinding.set(b.x + ',' + b.y, b);
  const L = istLv();
  BT = {
    lawan, karam: pg.karam, blds, units: [], proj: [], fx: [], zon: [], masa: 150, mula: false, tamat: false, tunggu: 0, laju: 1,
    tentera: Object.fromEntries(Object.entries(S.army).filter(([, n]) => n > 0)),
    wira: { tuah: wiraSedia('tuah') ? 'sedia' : 'tiada', fatimah: wiraSedia('fatimah') ? 'sedia' : 'tiada' }, wiraU: {},
    taktik: { gendang: L >= 3 ? (L >= 6 ? 2 : 1) : 0, ubat: L >= 4 ? (L >= 7 ? 2 : 1) : 0 },
    bantuan: S.bantuan.slice(), rampas: { emas: 0, beras: 0, timah: 0 }, jumlahLoot: { emas: 0, beras: 0, timah: 0 },
    istanaMati: false, jumlah: blds.filter(b => b.t !== 'kota' && b.t !== 'ranjau').length, musnah: 0, sekat, dinding, kilat: 0, pilih: null,
  };
  for (const b of blds) if (b.loot) for (const r in b.loot) BT.jumlahLoot[r] += b.loot[r];
  BT.pilih = Object.keys(BT.tentera)[0] || (BT.wira.tuah === 'sedia' ? 'tuah' : BT.bantuan.length ? 'bantuan' : null);
  mode = 'perang'; pilihan = null; S.letak = null;
  $('#hudKampung').hidden = true; $('#hudPerang').hidden = false; tutupModal();
  kameraAsal(); binaKadPerang(); paparHudPerang(); sfx('gong');
}
function bolehLepas(gx, gy) {
  const i = Math.floor(gx), j = Math.floor(gy);
  if (i < -3 || j < -3 || i > G + 2 || j > G + 2) return false;
  return !BT.sekat.has(i + ',' + j);
}
function unitBaru(t, x, y, lv, wira) {
  const d = wira ? WIRA[t] : TR[t], f = wira ? 1 + .12 * (lv - 1) : 1 + .22 * (lv - 1);
  const u = { id: acak(), t, x, y, lv, hp: d.hp * f, maxHp: d.hp * f, dps: d.dps * f, jarak: d.jarak, laju: d.laju, sasar: wira ? 'semua' : d.sasar, sasaran: null, cd: 0, arah: 1, langkah: acak() * 6, serang: 0, kuasa: 0, wira: !!wira };
  BT.units.push(u); return u;
}
function lepas(gx, gy, ulangan) {
  if (!BT || BT.tamat) return false;
  const k = BT.pilih; if (!k) { toast('Pilih tentera di bawah dahulu.', true); return false; }
  if (k === 'gendang' || k === 'ubat') {
    if (ulangan || !(BT.taktik[k] > 0)) return false;
    BT.taktik[k]--; BT.zon.push({ jenis: k, x: gx, y: gy, r: TAKTIK[k].r, t: 0, dur: TAKTIK[k].dur }); sfx(k === 'gendang' ? 'gong' : 'kutip');
    BT.mula = true; paparKad(); return true;
  }
  if (!bolehLepas(gx, gy)) { BT.kilat = 1.2; if (!ulangan) { sfx('salah'); toast('Lepaskan tentera di luar kawasan merah.', true); } return false; }
  if (k in TR) {
    if (!(BT.tentera[k] > 0)) return false;
    BT.tentera[k]--; S.army[k] = Math.max(0, (S.army[k] || 0) - 1); if (!S.army[k]) delete S.army[k];
    unitBaru(k, gx + (acak() - .5) * .3, gy + (acak() - .5) * .3, S.troopLv[k]);
    if (!BT.tentera[k]) { delete BT.tentera[k]; BT.pilih = Object.keys(BT.tentera)[0] || BT.pilih; }
  } else if (k === 'tuah' || k === 'fatimah') {
    if (BT.wira[k] !== 'sedia' || ulangan) return false;
    BT.wira[k] = 'aktif'; BT.wiraU[k] = unitBaru(k, gx, gy, wiraSedia(k), true); sfx('gong');
  } else if (k === 'bantuan') {
    if (!BT.bantuan.length || ulangan) return false;
    for (const t of BT.bantuan) unitBaru(t, gx + (acak() - .5) * 1.2, gy + (acak() - .5) * 1.2, S.troopLv[t]);
    BT.bantuan = []; S.bantuan = [];
  } else return false;
  if (!BT.mula) { BT.mula = true; S.stat.serang++; }
  paparKad(); return true;
}
function gunaKuasa(k) {
  const u = BT.wiraU[k]; if (!u || u.hp <= 0 || BT.wira[k] !== 'aktif') return;
  BT.wira[k] = 'guna'; sfx('gong');
  if (k === 'tuah') { u.kuasa = 6; u.hp = Math.min(u.maxHp, u.hp + u.maxHp * .35); }
  else { for (const v of BT.units) if (v.hp > 0 && Math.hypot(v.x - u.x, v.y - u.y) < 4.5) v.hp = Math.min(v.maxHp, v.hp + v.maxHp * .4); BT.zon.push({ jenis: 'gendang', x: u.x, y: u.y, r: 4, t: 0, dur: 5, ikut: u }); u.kuasa = 5; }
  BT.fx.push({ j: 'cincin', x: u.x, y: u.y, t: 0, dur: .8, w: '#ffd65a' });
  paparKad();
}
function titikDekat(px, py, b) { const s = B[b.t].s, nx = clamp(px, b.x, b.x + s), ny = clamp(py, b.y, b.y + s); return [nx, ny, Math.hypot(px - nx, py - ny)]; }
function cariSasaran(u) {
  let calon = BT.blds.filter(b => !b.mati && b.t !== 'ranjau' && b.t !== 'kota');
  if (u.sasar === 'pertahanan') { const c = calon.filter(b => B[b.t].def); if (c.length) calon = c; }
  if (u.sasar === 'kota') { const w = BT.blds.filter(b => !b.mati && b.t === 'kota'); if (w.length) calon = w; }
  let best = null, bd = 1e9;
  for (const b of calon) { const d = titikDekat(u.x, u.y, b)[2]; if (d < bd) { bd = d; best = b; } }
  return best;
}
function buffZon(u) {
  let laju = 1, dmg = 1;
  for (const z of BT.zon) {
    if (z.ikut) { z.x = z.ikut.x; z.y = z.ikut.y; }
    if (Math.hypot(u.x - z.x, u.y - z.y) > z.r) continue;
    if (z.jenis === 'gendang') { laju = 1.5; dmg = 1.6; } else u.hp = Math.min(u.maxHp, u.hp + u.maxHp * .12 / 30);
  }
  return { laju, dmg };
}
function rosakBangunan(b, dmg) {
  if (b.mati) return;
  const dulu = b.hp; b.hp = Math.max(0, b.hp - dmg); b.kena = .12;
  const f = (dulu - b.hp) / b.maxHp;
  if (b.lootBaki) for (const r of ['emas', 'beras', 'timah']) { const a = Math.min(b.lootBaki[r], b.loot[r] * f); b.lootBaki[r] -= a; BT.rampas[r] += a; }
  if (b.hp > 0) return;
  b.mati = true;
  if (b.lootBaki) { let teks = []; for (const r of ['emas', 'beras', 'timah']) { BT.rampas[r] += b.lootBaki[r]; if (b.loot[r] >= 1) teks.push([r, b.loot[r]]); b.lootBaki[r] = 0; } teks.forEach(([r, n], i) => BT.fx.push({ j: 'teks', x: b.x + B[b.t].s / 2, y: b.y + B[b.t].s / 2, z: 2 + i * .7, t: 0, dur: 1.4, txt: '+' + fmtK(n), w: SUMBER[r].w })); }
  if (b.t === 'kota') { BT.fx.push({ j: 'debu', x: b.x + .5, y: b.y + .5, t: 0, dur: .6 }); BT.dinding.delete(b.x + ',' + b.y); sfx('pukul'); return; }
  BT.musnah++; if (b.t === 'istana') BT.istanaMati = true;
  BT.fx.push({ j: 'letup', x: b.x + B[b.t].s / 2, y: b.y + B[b.t].s / 2, t: 0, dur: .8, r: B[b.t].s * .6 });
  sfx('runtuh');
}
function rosakUnit(u, dmg) { if (u.hp <= 0) return; u.hp -= dmg; u.kena = .12; if (u.hp <= 0) BT.fx.push({ j: 'asap', x: u.x, y: u.y, t: 0, dur: .7 }); }
function kemaskiniUnit(u, dt) {
  const bf = buffZon(u);
  if (u.kuasa > 0) { u.kuasa -= dt; u.aura = true; } else u.aura = false;
  if (u.serang > 0) u.serang -= dt;
  let t = u.sasaran; if (!t || t.mati) t = u.sasaran = cariSasaran(u);
  u.bergerak = false;
  if (!t) return;
  const [nx, ny, d] = titikDekat(u.x, u.y, t);
  if (d <= u.jarak + .06) {
    u.cd -= dt * (bf.laju > 1 ? 1.3 : 1);
    if (u.cd > 0) return;
    u.cd = 1; u.serang = .25;
    const sx = (nx - u.x) - (ny - u.y); if (Math.abs(sx) > .01) u.arah = sx > 0 ? 1 : -1;
    let dmg = u.dps * bf.dmg * (u.t === 'tuah' && u.kuasa > 0 ? 2.2 : 1);
    if (u.t === 'pemecah') {
      u.hp = 0; BT.fx.push({ j: 'letup', x: u.x, y: u.y, t: 0, dur: .6, r: 1 }); sfx('bom');
      for (const b of BT.blds) { if (b.mati || b.t === 'ranjau') continue; if (titikDekat(u.x, u.y, b)[2] <= 1.2) rosakBangunan(b, b.t === 'kota' ? dmg * 15 : dmg); }
      return;
    }
    if (u.jarak > 1.5) BT.proj.push({ j: u.t === 'fatimah' ? 'panah' : 'damak', dari: [u.x, u.y, .6], ke: [nx, ny, .5], t: 0, dur: Math.max(.15, d / 14), dmg, sasaranB: t });
    else { rosakBangunan(t, dmg); BT.fx.push({ j: 'percik', x: nx, y: ny, t: 0, dur: .25 }); sfx('pukul'); }
    return;
  }
  const dx = nx - u.x, dy = ny - u.y, L2 = Math.hypot(dx, dy) || 1, langkah = u.laju * bf.laju * dt;
  const x2 = u.x + dx / L2 * langkah, y2 = u.y + dy / L2 * langkah;
  const w = BT.dinding.get(Math.floor(x2) + ',' + Math.floor(y2));
  if (w && w !== t && !w.mati) { u.sasaran = w; return; }
  u.x = x2; u.y = y2; u.bergerak = true; u.langkah += dt * 11;
  const sx = dx - dy; if (Math.abs(sx) > .05) u.arah = sx > 0 ? 1 : -1;
  for (const b of BT.blds) if (b.t === 'ranjau' && !b.mati && Math.hypot(u.x - b.x - .5, u.y - b.y - .5) < .7) {
    b.mati = true; const dm = B.ranjau.trap.dmg * Math.pow(1.3, b.lv - 1);
    for (const v of BT.units) if (Math.hypot(v.x - b.x - .5, v.y - b.y - .5) < B.ranjau.trap.r) rosakUnit(v, dm);
    BT.fx.push({ j: 'ranjau', x: b.x + .5, y: b.y + .5, t: 0, dur: .9 }); sfx('pukul');
  }
}
function kemaskiniPertahanan(b, dt) {
  if (b.kilat > 0) b.kilat -= dt;
  b.cd -= dt; if (b.cd > 0) return;
  const df = B[b.t].def, s = B[b.t].s, cx = b.x + s / 2, cy = b.y + s / 2, r = df.range * (1 + .02 * (b.lv - 1));
  let best = null, bd = 1e9;
  for (const u of BT.units) { if (u.hp <= 0) continue; const d = Math.hypot(u.x - cx, u.y - cy) - s * .35; if (d <= r && d >= (df.min || 0) && d < bd) { bd = d; best = u; } }
  if (!best) { b.cd = .2; return; }
  b.cd = df.rate; b.sudut = Math.atan2(best.y - cy, best.x - cx); b.kilat = .1;
  const dmg = dmgPertahanan(b.t, b.lv);
  if (df.jenis === 'bom') { BT.proj.push({ j: 'bom', dari: [cx, cy, 1.4], ke: [best.x, best.y, 0], t: 0, dur: 1.3, dmg, splash: df.splash }); sfx('meriam'); }
  else if (df.jenis === 'peluru') { BT.proj.push({ j: 'peluru', dari: [cx + Math.cos(b.sudut) * .8, cy + Math.sin(b.sudut) * .8, .6], ke: [best.x, best.y, .4], t: 0, dur: Math.max(.1, bd / 13), dmg, sasaranU: best }); sfx('meriam'); }
  else { BT.proj.push({ j: 'damakP', dari: [cx, cy, 2.4], ke: [best.x, best.y, .5], t: 0, dur: Math.max(.1, bd / 16), dmg, sasaranU: best }); sfx('damak'); }
}
function kemaskiniPerang(dt) {
  if (BT.tamat) return;
  if (BT.kilat > 0) BT.kilat -= dt;
  if (BT.mula) BT.masa -= dt;
  for (const z of BT.zon) z.t += dt;
  BT.zon = BT.zon.filter(z => z.t < z.dur);
  for (const u of BT.units) { if (u.kena > 0) u.kena -= dt; if (u.hp > 0) kemaskiniUnit(u, dt); }
  for (const b of BT.blds) { if (b.kena > 0) b.kena -= dt; if (!b.mati && B[b.t].def) kemaskiniPertahanan(b, dt); }
  for (const p of BT.proj) {
    p.t += dt; if (p.t < p.dur) continue; p.habis = true;
    if (p.j === 'bom') { for (const u of BT.units) if (u.hp > 0 && Math.hypot(u.x - p.ke[0], u.y - p.ke[1]) <= p.splash) rosakUnit(u, p.dmg); BT.fx.push({ j: 'letup', x: p.ke[0], y: p.ke[1], t: 0, dur: .5, r: .9 }); sfx('bom'); }
    else if (p.sasaranU) rosakUnit(p.sasaranU, p.dmg);
    else if (p.sasaranB) rosakBangunan(p.sasaranB, p.dmg);
  }
  BT.proj = BT.proj.filter(p => !p.habis);
  for (const f of BT.fx) f.t += dt;
  BT.fx = BT.fx.filter(f => f.t < f.dur);
  for (const k in BT.wiraU) if (BT.wiraU[k].hp <= 0 && BT.wira[k] !== 'mati') { BT.wira[k] = 'mati'; paparKad(); }
  BT.units = BT.units.filter(u => u.hp > 0);
  const hidup = BT.units.length > 0;
  const baki = Object.values(BT.tentera).some(n => n > 0) || BT.bantuan.length > 0 || BT.wira.tuah === 'sedia' || BT.wira.fatimah === 'sedia';
  if (BT.musnah >= BT.jumlah || (BT.mula && BT.masa <= 0)) tamatPerang();
  else if (BT.mula && !hidup && !baki) { BT.tunggu += dt; if (BT.tunggu > 1.5) tamatPerang(); }
}
const bintangPerang = () => (BT.musnah / BT.jumlah >= .5 ? 1 : 0) + (BT.istanaMati ? 1 : 0) + (BT.musnah >= BT.jumlah ? 1 : 0);
function lukisPeluru() {
  for (const p of BT.proj) {
    const f = p.t / p.dur, x = p.dari[0] + (p.ke[0] - p.dari[0]) * f, y = p.dari[1] + (p.ke[1] - p.dari[1]) * f;
    let z = p.dari[2] + (p.ke[2] - p.dari[2]) * f;
    if (p.j === 'bom') { z += 4 * 3.2 * f * (1 - f); const g = P(x, y, 0); ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(g[0], g[1], 6, 3, 0, 0, 7); ctx.fill(); const q = P(x, y, z); bulat(q[0], q[1], 6, '#151515'); bulat(q[0] - 2, q[1] - 2, 2, '#555'); }
    else if (p.j === 'peluru') { const q = P(x, y, z); bulat(q[0], q[1], 3.4, '#1a1a1a'); }
    else { const q = P(x, y, z), dx = p.ke[0] - p.dari[0], dy = p.ke[1] - p.dari[1], L = Math.hypot(dx, dy) || 1, q2 = P(x - dx / L * .45, y - dy / L * .45, z); garis(q2[0], q2[1], q[0], q[1], p.j === 'panah' ? 2 : 1.6, p.j === 'panah' ? '#f4c20d' : '#efe2b8'); }
  }
}
function lukisKesan() {
  for (const f of BT.fx) {
    const k = f.t / f.dur, p = P(f.x, f.y, 0);
    if (f.j === 'letup') { ctx.globalAlpha = 1 - k; bulat(p[0], p[1] - 10, (10 + 34 * k) * f.r, '#ff9a2a'); bulat(p[0], p[1] - 12, (6 + 22 * k) * f.r, '#ffe27a'); ctx.globalAlpha = (1 - k) * .6; bulat(p[0] - 8, p[1] - 26 - 20 * k, 14 * f.r, '#6b6b6b'); bulat(p[0] + 10, p[1] - 30 - 24 * k, 12 * f.r, '#8a8a8a'); ctx.globalAlpha = 1; }
    else if (f.j === 'asap' || f.j === 'debu') { ctx.globalAlpha = (1 - k) * .7; bulat(p[0], p[1] - 6 - 10 * k, 6 + 8 * k, f.j === 'debu' ? '#b59a72' : '#d9d9d9'); ctx.globalAlpha = 1; }
    else if (f.j === 'percik') { ctx.globalAlpha = 1 - k; for (let i = 0; i < 4; i++) { const a = i * 1.6 + f.x; garis(p[0], p[1] - 10, p[0] + Math.cos(a) * 10 * k, p[1] - 10 + Math.sin(a) * 8 * k, 2, '#ffe9a0'); } ctx.globalAlpha = 1; }
    else if (f.j === 'ranjau') { ctx.globalAlpha = 1 - k; for (let i = 0; i < 6; i++) garis(p[0] - 10 + i * 4, p[1] + 2, p[0] - 9 + i * 4, p[1] - 12 * Math.min(1, k * 4), 2.2, '#d8c27a'); ctx.globalAlpha = 1; }
    else if (f.j === 'cincin') { ctx.globalAlpha = 1 - k; ctx.strokeStyle = f.w; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(p[0], p[1], 20 + 70 * k, 10 + 35 * k, 0, 0, 7); ctx.stroke(); ctx.globalAlpha = 1; }
  }
}
function lukisAtasPerang() {
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (const b of BT.blds) {
    if (b.mati || b.hp >= b.maxHp || b.t === 'ranjau') continue;
    const s = B[b.t].s, [x, y] = keSkrin(P(b.x + s / 2, b.y + s / 2, b.t === 'kota' ? 1.3 : s * .7 + .6)), w = b.t === 'kota' ? 22 : 40;
    ctx.fillStyle = 'rgba(10,6,3,.8)'; ctx.fillRect(x - w / 2 - 1, y - 3, w + 2, 6);
    ctx.fillStyle = '#ffd24a'; ctx.fillRect(x - w / 2, y - 2, w * b.hp / b.maxHp, 4);
  }
  for (const u of BT.units) {
    if (u.hp >= u.maxHp && !u.wira) continue;
    const [x, y] = keSkrin(P(u.x, u.y, u.t === 'gajah' ? 1.4 : u.wira ? 1.3 : 1)), w = u.wira ? 30 : 18;
    ctx.fillStyle = 'rgba(10,6,3,.8)'; ctx.fillRect(x - w / 2 - 1, y - 3, w + 2, 5);
    ctx.fillStyle = u.wira ? '#ffd24a' : '#6fdc4a'; ctx.fillRect(x - w / 2, y - 2, w * clamp(u.hp / u.maxHp, 0, 1), 3);
  }
  for (const f of BT.fx) if (f.j === 'teks') {
    const k = f.t / f.dur, [x, y] = keSkrin(P(f.x, f.y, f.z + k * 1.5));
    ctx.globalAlpha = 1 - k * k; ctx.font = '400 17px "Lilita One", sans-serif'; ctx.lineWidth = 4; ctx.strokeStyle = '#140c07'; ctx.strokeText(f.txt, x, y); ctx.fillStyle = f.w; ctx.fillText(f.txt, x, y); ctx.globalAlpha = 1;
  }
}
function lukisApungan(dt) {
  if (!apungan.length || mode !== 'kampung') { apungan = []; return; }
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (const a of apungan) {
    a.t += dt; const k = a.t / 1.3, [x, y] = keSkrin(P(a.x, a.y, a.z + k * 2));
    ctx.globalAlpha = clamp(1 - k * k, 0, 1); ctx.font = '400 20px "Lilita One", sans-serif'; ctx.lineWidth = 4; ctx.strokeStyle = '#140c07'; ctx.strokeText(a.txt, x, y); ctx.fillStyle = a.w; ctx.fillText(a.txt, x, y); ctx.globalAlpha = 1;
  }
  apungan = apungan.filter(a => a.t < 1.3);
}
function tamatPerang() {
  if (BT.tamat) return; BT.tamat = true;
  const bin = bintangPerang(), menang = bin > 0, lw = BT.lawan, peratus = Math.round(100 * BT.musnah / BT.jumlah);
  const dapat = {};
  for (const r of ['emas', 'beras', 'timah']) dapat[r] = Math.floor(tambah(r, Math.floor(BT.rampas[r])));
  let maruah = 0, bonus = null;
  if (lw.jenis === 'jiran') {
    if (menang) { maruah = 8 + bin * 6 + Math.floor(acak() * 6); const lg = ligaDari(S.maruah); if (lg.bonus) { const n = Math.round(lg.bonus * bin / 3); bonus = { emas: Math.floor(tambah('emas', n)), beras: Math.floor(tambah('beras', n)) }; } }
    else maruah = -(6 + Math.floor(acak() * 8));
    S.maruah = Math.max(0, S.maruah + maruah);
  }
  if (lw.jenis === 'kempen') S.kempen[lw.idx] = Math.max(S.kempen[lw.idx] || 0, bin);
  if (menang) { S.stat.menang++; misi('menang'); tambahXP(5 + bin * 5); } else S.stat.kalah++;
  S.stat.bintang += bin; misi('bintang', bin); if (bin === 3) S.stat.bintang3++;
  if (S.puak && dapat.emas > 0) { S.puak.goal.prog = Math.min(S.puak.goal.sasaran, S.puak.goal.prog + dapat.emas); S.puak.goal.aku += dapat.emas; }
  semakHikayat(); semakLangkah(); simpan();
  sfx(menang ? 'menang' : 'kalah');
  setTimeout(() => paparKeputusan({ bin, menang, peratus, dapat, maruah, bonus, lw }), 700);
}
function pulangKota() {
  BT = null; mode = 'kampung';
  $('#hudPerang').hidden = true; $('#hudKampung').hidden = false;
  tutupModal(); kameraAsal(); kemaskiniHUD(); paparPanel(); simpan();
}
const kosCari = () => [50, 100, 200, 350, 500, 750, 1000][istLv() - 1];
function cariLawan() {
  const c = kosCari();
  if (!bayar(['emas', c])) { toast(`Emas tidak cukup untuk mencari lawan (${fmtN(c)}).`, true); sfx('salah'); return; }
  const L = clamp(istLv() + (acak() < .2 ? -1 : acak() < .15 ? 1 : 0), 1, 7);
  const nama = `${pilih(NAMA_ORANG)} · ${pilih(NAMA_TEMPAT)}`;
  const seed = Math.floor(acak() * 1e9);
  if (mode === 'perang' && BT && !BT.mula) { BT = null; }
  mulaPerang({ jenis: 'jiran', nama, L, seed });
}
function serangKempen(i) { const k = KEMPEN[i]; mulaPerang({ jenis: 'kempen', idx: i, nama: k.n, L: k.L, seed: 1000 + i * 77 }); }

/* ================= Serangan semasa ketiadaan ================= */
function skorPertahanan(L, blds) {
  let s = 0;
  for (const b of blds) {
    const d = B[b.t]; if (b.lv < 1) continue;
    if (d.def) s += dmgPertahanan(b.t, b.lv) / d.def.rate * d.def.range / 5 * 10;
    else if (b.t === 'kota') s += b.lv * .6;
    else if (b.t === 'ranjau') s += 4;
    else if (d.hero) s += b.lv * 12;
  }
  return s + L * 4;
}
function skorJangkaan(L) {
  let s = 0;
  for (const t of ['meriam_lela', 'menara_sumpit', 'meriam_besar']) s += BIL[t][L - 1] * (dmgPertahanan(t, Math.max(1, maxLvUntuk(t, L) - 1)) / B[t].def.rate * B[t].def.range / 5 * 10);
  return s + BIL.kota[L - 1] * Math.max(1, L - 1) * .6 * .7 + L * 4;
}
function seranganLuar(jauh) {
  if (jauh < 5 * 60e3 || kini() < S.perisai) return [];
  const peluang = Math.min(3, Math.floor(jauh / (40 * 60e3)) + 1), L = istLv(), out = [];
  const tahan = skorPertahanan(L, S.bld), jangka = skorJangkaan(L);
  for (let i = 0; i < peluang; i++) {
    if (acak() > .45) continue;
    const kuasa = jangka * (.55 + acak() * .9), nisbah = tahan / kuasa;
    const bin = nisbah > 1.25 ? 0 : nisbah > .95 ? 1 : nisbah > .7 ? 2 : 3;
    const pct = [0, .05, .1, .16][bin], hilang = { emas: Math.floor(S.res.emas * pct), beras: Math.floor(S.res.beras * pct) };
    S.res.emas -= hilang.emas; S.res.beras -= hilang.beras;
    const m = bin === 0 ? 8 + Math.floor(acak() * 5) : -(3 * bin + Math.floor(acak() * 4));
    S.maruah = Math.max(0, S.maruah + m);
    if (bin === 0) S.stat.pertahan++;
    const lap = { masa: kini() - Math.floor(acak() * jauh), nama: `${pilih(NAMA_ORANG)} · ${pilih(NAMA_TEMPAT)}`, L: clamp(L + Math.round(acak() * 2 - 1), 1, 7), bin, hilang, m, seed: Math.floor(acak() * 1e9), balas: false };
    S.laporan.unshift(lap); out.push(lap); S.laporanBaru++;
    if (bin >= 2) { S.perisai = kini() + 30 * 60e3; break; }
  }
  S.laporan = S.laporan.slice(0, 20);
  return out;
}

/* ================= HUD & panel ================= */
const barEl = {};
let perluRender = false, perluRenderPuak = false, nasihatSeterus = 0, nasihatSenyap = 0, nasihatIdx = 0;
function binaHUD() {
  $('#sumber').innerHTML = ['emas', 'beras', 'timah', 'mutiara'].map(r => `<div class="bar ${r}" id="bar-${r}" style="--w:${SUMBER[r].w}" title="${SUMBER[r].n}"><div class="isi"><i></i><small></small><b class="nombor">0</b></div>${ik(r)}</div>`).join('');
  for (const r of ['emas', 'beras', 'timah', 'mutiara']) { const el = $('#bar-' + r); barEl[r] = { el, i: el.querySelector('i'), b: el.querySelector('b'), s: el.querySelector('small') }; }
  $('#btnSerang').innerHTML = IKON.serang + 'Serang';
  const nav = [['navBina', 'bina', 'Bina'], ['navTentera', 'tentera', 'Tentera'], ['navPuak', 'puak', 'Puak'], ['navKitab', 'kitab', 'Kitab'], ['navTetapan', 'tetapan', 'Tetapan']];
  for (const [id, ic, n] of nav) $('#' + id).innerHTML = IKON[ic] + `<span>${n}</span><span class="titik" hidden></span>`;
  $('#btnSerang').onclick = () => { bukaAudio(); bukaSerang(); };
  $('#navBina').onclick = () => { bukaAudio(); bukaKedai(); };
  $('#navTentera').onclick = () => { bukaAudio(); bukaTentera(); };
  $('#navPuak').onclick = () => { bukaAudio(); bukaPuakModal(); };
  $('#navKitab').onclick = () => { bukaAudio(); bukaKitab(); };
  $('#navTetapan').onclick = () => { bukaAudio(); bukaTetapan(); };
  $('#letakOk').onclick = sahLetak; $('#letakBatal').onclick = batalLetak;
  $('#modalTutup').onclick = tutupModal;
  $('#modal').addEventListener('pointerdown', e => { if (e.target.id === 'modal') tutupModal(); });
}
function lencana(id, n) { const t = $('#' + id + ' .titik'); if (!t) return; t.hidden = !n; t.textContent = n > 9 ? '9+' : n; }
function kemaskiniHUD() {
  if (!S || mode !== 'kampung') { if (mode === 'perang' && BT) paparHudPerang(); return; }
  for (const r of ['emas', 'beras', 'timah', 'mutiara']) {
    const e = barEl[r]; e.b.textContent = fmtN(S.res[r]);
    if (r !== 'mutiara') { const c = capSumber(r); e.i.style.width = clamp(100 * S.res[r] / Math.max(1, c), 0, 100) + '%'; e.s.textContent = 'Maks ' + fmtK(c); }
  }
  barEl.timah.el.hidden = istLv() < 5 && S.res.timah <= 0;
  $('#tukang').innerHTML = `${IKON.bina.replace('<svg', '<svg class="ikon"')} Tukang ${tukangLapang()}/${jumlahTukang()}${S.perisai > kini() ? ` <small>Perisai ${masa((S.perisai - kini()) / 1000)}</small>` : ''}`;
  $('#namaPemain').textContent = S.nama;
  const pk = pangkat(), lo = 40 * (pk - 1) ** 2, hi = 40 * pk ** 2;
  $('#pangkatNo').textContent = pk; $('#pangkat').style.setProperty('--xp', (100 * (S.xp - lo) / (hi - lo)) + '%');
  const lg = ligaDari(S.maruah); $('#namaLiga').textContent = 'Liga ' + lg.n; $('#lencanaLiga').style.background = lg.w; $('#maruah').textContent = fmtN(S.maruah);
  lencana('navPuak', S.puak ? S.puak.belumBaca : 0);
  lencana('navKitab', bolehTuntut() + S.hikayatBaru + S.laporanBaru);
  lencana('navTentera', 0);
  const st = $('#panelStatus'); if (st && pilihan) st.innerHTML = statusBangunan(pilihan);
  const pc = $('#btnPercepat'); if (pc && pilihan && pilihan.busy) pc.querySelector('.kos').innerHTML = `${ik('mutiara')} ${kosPercepat(pilihan)}`;
  if (pilihan && pilihan.busy == null && $('#btnPercepat')) paparPanel();
  paparNasihat();
}
function bolehTuntut() {
  semakMisi(); let n = S.misi.senarai.filter(m => m.p >= m.n && !m.ambil).length;
  if (!S.misi.bonus && S.misi.senarai.every(m => m.ambil)) n++;
  for (const c of CAPAI) { const tier = S.capai[c.k] || 0; if (tier < 3 && nilaiCapai(c.k) >= c.t[tier]) n++; }
  return n;
}
function statusBangunan(b) {
  const d = B[b.t];
  if (b.busy) return `Sedang ${b.lv === 0 ? 'dibina' : `dinaik taraf ke tahap ${b.busy.toLv}`} · baki <b class="nombor">${masa((b.busy.until - kini()) / 1000)}</b>`;
  if (d.hasil) return `${SUMBER[d.hasil].n} terkumpul <b class="nombor">${fmtN(b.store)}/${fmtN(capPengumpul(b))}</b> · ${fmtN(kadar(b) * 60)}/minit`;
  if (d.simpan) return `Simpanan ${SUMBER[d.simpan].n} kota <b class="nombor">${fmtN(S.res[d.simpan])}/${fmtN(capSumber(d.simpan))}</b>`;
  if (d.def) return `Kerosakan ${Math.round(dmgPertahanan(b.t, b.lv) / d.def.rate)}/saat · jarak ${d.def.range} petak`;
  if (b.t === 'kem') return `Tentera <b class="nombor">${ruangGuna()}/${ruangTentera()}</b> ruang`;
  if (b.t === 'balai_tentera') return S.gilir.length ? `Melatih ${TR[S.gilir[0]].n} · ${S.gilir.length} dalam giliran` : 'Tiada latihan berjalan';
  if (b.t === 'balai_ilmu') return S.kaji ? `Mengkaji ${TR[S.kaji.k].n} tahap ${S.kaji.lv} · baki ${masa((S.kaji.until - kini()) / 1000)}` : 'Tiada kajian berjalan';
  if (b.t === 'balai_muafakat') return `Bantuan puak <b class="nombor">${ruangBantuan()}/${capBantuan()}</b> ruang`;
  if (b.t === 'istana') return `Era ${ERA[b.lv - 1].nama} · ${ERA[b.lv - 1].masa}`;
  if (d.hero) return `${WIRA[d.hero].n} tahap ${b.lv} · ${WIRA[d.hero].kuasa}`;
  if (b.t === 'bangsal_tukang') return `${tukangLapang()} daripada ${jumlahTukang()} tukang lapang`;
  return esc(d.d);
}
function btnKos(k) { const ada = S.res[k[0]] >= k[1]; return `<span class="kos ${ada ? '' : 'kurang'}">${ik(k[0])} ${fmtK(k[1])}</span>`; }
function paparPanel() {
  const el = $('#panel'), b = pilihan;
  if (!b || mode !== 'kampung' || S.letak || !S.bld.includes(b)) { el.hidden = true; if (b && !S.bld.includes(b)) pilihan = null; return; }
  const d = B[b.t], butang = [];
  butang.push(`<button class="btn kayu" data-b="info">Maklumat</button>`);
  if (b.busy) butang.push(`<button class="btn hijau" id="btnPercepat" data-b="percepat">Siapkan<span class="kos">${ik('mutiara')} ${kosPercepat(b)}</span></button>`);
  else if (b.lv < d.max && b.t !== 'bangsal_tukang') {
    const lvB = b.lv + 1, buka = lvB <= maxLv(b.t);
    butang.push(buka ? `<button class="btn" data-b="naik">Naik taraf${btnKos(kos(b.t, lvB))}</button>` : `<button class="btn mati" data-b="naik">Naik taraf<small>Perlu Istana ${istLv() + 1}</small></button>`);
  }
  if (d.hasil && b.lv >= 1) butang.push(`<button class="btn hijau" data-b="kutip">Kutip<span class="kos">${ik(d.hasil)} ${fmtK(b.store)}</span></button>`);
  if (b.t === 'balai_tentera' || b.t === 'kem') butang.push(`<button class="btn merah" data-b="latih">Latih tentera</button>`);
  if (b.t === 'balai_ilmu' && b.lv >= 1) butang.push(`<button class="btn merah" data-b="kaji">Kaji</button><button class="btn hijau" data-b="kuiz">Kuiz sejarah</button>`);
  if (b.t === 'balai_muafakat' && b.lv >= 1) butang.push(`<button class="btn merah" data-b="puak">Puak</button>`);
  if (b.t === 'kota') butang.push(`<button class="btn kayu" data-b="kotaBaru">Bina kota lagi</button>`);
  butang.push(`<button class="btn kayu" data-b="pindah">Pindah</button>`);
  el.innerHTML = `<div class="songket"></div><div class="kepala"><h3>${esc(namaBangunan(b.t, b.lv))}</h3><span class="tahap">${b.lv === 0 ? 'Sedang dibina' : 'Tahap ' + b.lv + ' / ' + maxLv(b.t)}</span></div><div class="status" id="panelStatus">${statusBangunan(b)}</div><div class="tindakan">${butang.join('')}</div>`;
  el.hidden = false;
  el.querySelectorAll('[data-b]').forEach(x => x.onclick = () => {
    const a = x.dataset.b;
    if (a === 'info') bukaInfo(b);
    else if (a === 'naik') naikTaraf(b);
    else if (a === 'percepat') percepat(b);
    else if (a === 'kutip') { if (b.store >= 1) kutip(b); paparPanel(); }
    else if (a === 'latih') bukaTentera();
    else if (a === 'kaji') bukaIlmu('kaji');
    else if (a === 'kuiz') bukaIlmu('kuiz');
    else if (a === 'puak') bukaPuakModal();
    else if (a === 'pindah') mulaPindah(b);
    else if (a === 'kotaBaru') { if (bil('kota') >= had('kota')) toast('Had kota sudah dicapai.', true); else mulaLetak('kota', [b.x + 1, b.y]); }
  });
}
function paparLetak() {
  const el = $('#letakKawal'), L = S.letak;
  el.hidden = !L;
  $('#bawahKiri').hidden = !!L; $('#bawahKanan').hidden = !!L;
  if (!L) return;
  $('#letakNama').innerHTML = L.baru ? `${esc(B[L.t].n)} ${btnKos(kos(L.t, 1))}${L.t === 'kota' || L.t === 'ranjau' ? ` <small>${bil(L.t)}/${had(L.t)}</small>` : ''}` : `Pindah ${esc(namaBangunan(L.t, L.b.lv))}`;
}
function paparNasihat() {
  const el = $('#bendahara'), t = kini();
  if (mode !== 'kampung' || S.letak || pilihan || t < nasihatSenyap) { el.hidden = true; return; }
  if (t < nasihatSeterus && !el.hidden) return;
  nasihatSeterus = t + 7000;
  const l = LANGKAH[S.langkah];
  let teks, ganjaran = '';
  if (l) { teks = l.t; ganjaran = `<span class="ganjaran">Ganjaran ${ik(l.g[0])} ${fmtN(l.g[1])}</span>`; }
  else {
    const tips = [];
    const penuh = S.bld.find(b => B[b.t].hasil && b.lv >= 1 && b.store >= capPengumpul(b) * .9);
    if (penuh) tips.push(`${B[penuh.t].n} hampir penuh. Ketik untuk kutip.`);
    if (tukangLapang() > 0) tips.push('Ada tukang yang lapang. Naik taraf sesuatu supaya kota terus berkembang.');
    if (ruangGuna() + ruangGilir() < ruangTentera() * .5) tips.push('Medan Kawad masih lengang. Latih tentera untuk serangan seterusnya.');
    if (S.puak && !S.puak.minta && kini() > S.puak.mintaLagi && ruangBantuan() < capBantuan()) tips.push('Minta bantuan tentera daripada puak di Balai Muafakat.');
    if (bolehTuntut()) tips.push('Ada ganjaran menunggu dalam Kitab. Buka dan tuntut!');
    if (S.kuiz.hari !== hariIni() || S.kuiz.jawab < 5) if (adaAktif('balai_ilmu')) tips.push('Kuiz sejarah hari ini belum habis. Jawab di Balai Ilmu untuk mutiara.');
    tips.push(`Era kau: ${ERA[istLv() - 1].nama}. Naik taraf Istana untuk ke era seterusnya.`);
    teks = tips[nasihatIdx++ % tips.length];
  }
  el.innerHTML = `${IKON.bendahara}<div class="kata"><b>Tok Bendahara</b>${esc(teks)}${ganjaran ? '<br>' + ganjaran : ''}</div>`;
  el.hidden = false;
  el.onclick = () => { el.hidden = true; nasihatSenyap = kini() + 25000; };
}
let toastAkhir = '';
function toast(msg, ralat) {
  const box = $('#toast'); if (msg === toastAkhir && box.lastChild && !box.lastChild.dataset.lama) return;
  toastAkhir = msg;
  const d = document.createElement('div'); d.textContent = msg; if (ralat) d.className = 'ralat';
  box.appendChild(d); while (box.children.length > 3) box.firstChild.remove();
  setTimeout(() => { d.dataset.lama = 1; d.remove(); if (toastAkhir === msg) toastAkhir = ''; }, 2600);
}

/* ================= Modal ================= */
let modalCur = null, tekanModal = false;
function bukaModal(tajuk, tabs, render, tabAwal) {
  modalCur = { tajuk, tabs, render, tab: tabAwal || (tabs && tabs[0] && tabs[0][0]) };
  $('#modal').hidden = false; $('#modalTajuk').textContent = tajuk;
  renderModal();
}
function renderModal() {
  if (!modalCur) return;
  const { tabs, render } = modalCur, tabEl = $('#modalTab');
  tabEl.innerHTML = tabs ? tabs.map(([k, n, titik]) => `<button data-tab="${k}" class="${k === modalCur.tab ? 'aktif' : ''}">${n}${titik ? ` <span class="titik" style="position:static;display:inline-block">${titik}</span>` : ''}</button>`).join('') : '';
  tabEl.hidden = !tabs;
  tabEl.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { modalCur.tab = b.dataset.tab; sfx('ketik'); renderModal(); $('#modalIsi').scrollTop = 0; });
  const isi = $('#modalIsi'), atas = isi.scrollTop;
  render(modalCur.tab, isi);
  isi.scrollTop = atas;
}
function tutupModal() { $('#modal').hidden = true; modalCur = null; if (mode === 'perang' && BT && BT.tamat) pulangKota(); }
$('#modal').addEventListener('pointerdown', () => { tekanModal = true; });
addEventListener('pointerup', () => { tekanModal = false; });
function lukisKeKanvas(el, fn, skala = 1) {
  const r = el.getBoundingClientRect(), w = Math.max(40, r.width || 120), h = Math.max(40, r.height || 96), d = Math.min(2, window.devicePixelRatio || 1);
  el.width = Math.round(w * d); el.height = Math.round(h * d);
  const lama = ctx; ctx = el.getContext('2d');
  ctx.setTransform(d * skala, 0, 0, d * skala, w * d / 2, h * d * .5);
  try { fn(w / skala, h / skala); } finally { ctx = lama; }
}
function lukisPratonton(el, t) {
  lukisKeKanvas(el, (w, h) => {
    const s = B[t].s, k = Math.min(w / (s * TW * 1.15), h / (s * TH + 4 * ZS + 10));
    ctx.scale(k, k); const c = P(s / 2, s / 2, 1.1); ctx.translate(-c[0], -c[1]);
    lukisBangunan({ id: 5, t, x: 0, y: 0, lv: 1, busy: null, store: 0 }, { ts: 1, isi: .5, petaKota: new Set() });
  });
}
function lukisPratontonUnit(el, t) {
  lukisKeKanvas(el, () => { ctx.translate(0, t === 'gajah' ? 16 : 18); ctx.scale(t === 'gajah' ? 1.05 : 1.45, t === 'gajah' ? 1.05 : 1.45); lukisUnit({ t, x: 0, y: 0, arah: 1, langkah: 0 }); });
}

function bukaInfo(b) {
  const d = B[b.t], baris = [];
  baris.push(['Tahap', `${b.lv} / ${maxLv(b.t)} (maksimum ${d.max})`]);
  baris.push(['Nyawa', fmtN(hpBangunan(b.t, Math.max(1, b.lv)))]);
  if (d.def) baris.push(['Kerosakan', `${Math.round(dmgPertahanan(b.t, Math.max(1, b.lv)) / d.def.rate)} sesaat`], ['Jarak', `${d.def.range} petak${d.def.min ? `, minimum ${d.def.min}` : ''}`]);
  if (d.hasil) baris.push(['Kadar', `${fmtN(kadar(b) * 3600)} ${SUMBER[d.hasil].n} sejam`], ['Muatan', fmtN(capPengumpul(b))]);
  if (d.simpan) baris.push(['Muatan', fmtN((d.simpan === 'timah' ? CAP_TIMAH : CAP_SIMPAN)[Math.max(1, b.lv) - 1])]);
  if (b.t === 'kem') baris.push(['Muatan tentera', KEM_CAP[Math.max(1, b.lv) - 1] + ' ruang']);
  if (b.t === 'istana') baris.push(['Era', `${ERA[b.lv - 1].nama} (${ERA[b.lv - 1].masa})`], ['Era seterusnya', b.lv < 7 ? ERA[b.lv].nama : 'Era tertinggi dicapai']);
  if (d.hero) baris.push(['Pahlawan', WIRA[d.hero].n], ['Kuasa', `${WIRA[d.hero].kuasa}: ${WIRA[d.hero].kd}`]);
  bukaModal(namaBangunan(b.t, b.lv), null, (_, isi) => {
    isi.innerHTML = `<div style="display:flex;gap:12px;flex-wrap:wrap;align-items:flex-start"><canvas id="infoKanvas" style="width:150px;height:120px;border-radius:10px;background:radial-gradient(ellipse at 50% 70%,#9bd06a,#5f9c3c 70%);flex:none"></canvas><div style="flex:1;min-width:200px"><p>${esc(d.d)}</p>${baris.map(([a, v]) => `<div class="baris" style="margin-bottom:6px;padding:6px 10px"><div class="teks"><small>${a}</small><b style="font-size:14px">${esc(v)}</b></div></div>`).join('')}</div></div>`;
    lukisPratonton($('#infoKanvas'), b.t);
  });
}
function bukaKedai() {
  pilihan = null; paparPanel();
  bukaModal('Bina', [['ekonomi', 'Ekonomi'], ['pertahanan', 'Pertahanan'], ['tentera', 'Tentera']], (tab, isi) => {
    const jenis = Object.keys(B).filter(t => B[t].kat === tab);
    isi.innerHTML = `<div class="grid-kad">${jenis.map(t => {
      const h = had(t), n = bil(t), k = kos(t, 1), kunci = h === 0, penuh = n >= h;
      const label = kunci ? `Buka pada Istana ${bukaPada(t)}` : penuh ? `Had dicapai (${n}/${h})` : `${n}/${h} dibina`;
      return `<div class="kedai ${kunci ? 'kunci' : ''}"><canvas data-pt="${t}"></canvas><h4>${esc(B[t].n)}</h4><div class="kecil">${esc(B[t].d)}</div><div class="kecil"><b>${label}</b>${masaBina(t, 1) ? ` · ${masa(masaBina(t, 1))}` : ''}</div><button class="btn ${kunci || penuh ? 'mati' : ''}" data-bina="${t}">${btnKos(k)}</button></div>`;
    }).join('')}</div>`;
    isi.querySelectorAll('[data-pt]').forEach(c => lukisPratonton(c, c.dataset.pt));
    isi.querySelectorAll('[data-bina]').forEach(btn => btn.onclick = () => {
      const t = btn.dataset.bina, h = had(t);
      if (h === 0) { toast(`${B[t].n} dibuka pada Istana tahap ${bukaPada(t)}.`, true); return; }
      if (bil(t) >= h) { toast(`Had ${B[t].n} sudah dicapai. Naik taraf Istana untuk lebih.`, true); return; }
      if (!cukup(kos(t, 1))) { toast(`${SUMBER[kos(t, 1)[0]].n} tidak cukup.`, true); sfx('salah'); return; }
      mulaLetak(t);
    });
  });
}
function bukaTentera() {
  pilihan = null; paparPanel();
  bukaModal('Tentera', [['latih', 'Latih'], ['pahlawan', 'Pahlawan'], ['bantuan', 'Bantuan puak']], (tab, isi) => {
    if (tab === 'latih') {
      const cap = ruangTentera(), guna = ruangGuna(), gilir = ruangGilir();
      const sedang = S.gilir.length ? TR[S.gilir[0]] : null, n = S.bld.filter(b => b.t === 'balai_tentera' && aktif(b)).length;
      isi.innerHTML = `<div class="ruang"><span>Ruang tentera <span class="nombor">${guna} + ${gilir} / ${cap}</span></span><div class="meter"><i style="width:${100 * guna / Math.max(1, cap)}%"></i></div></div>
        ${S.gilir.length ? `<div class="kecil" style="font-size:12px">Sedang melatih ${esc(sedang.n)} · ${n ? `${n} balai aktif` : 'balai sedang dinaik taraf, latihan berhenti'}</div><div class="baris-gilir">${S.gilir.map((k, i) => `<span class="gilir">${esc(TR[k].n)} <button data-batal="${i}" aria-label="Batal">✕</button></span>`).slice(0, 30).join('')}${S.gilir.length > 30 ? `<span class="gilir">+${S.gilir.length - 30} lagi</span>` : ''}</div>` : '<p class="kecil" style="font-size:12px">Ketik tentera untuk mula melatih. Latihan berjalan walaupun kau keluar dari permainan.</p>'}
        <div class="grid-kad">${Object.keys(TR).map(k => {
        const d = TR[k], buka = balaiMaks() >= d.buka;
        return `<div class="kedai ${buka ? '' : 'kunci'}"><canvas data-un="${k}" style="height:84px"></canvas><h4>${esc(d.n)} <small>tahap ${S.troopLv[k]}</small></h4><div class="kecil">${esc(d.d)}</div><div class="kecil">${buka ? `Ruang ${d.ruang} · ${d.masa}s · ada <b>${S.army[k] || 0}</b>` : `<b>Balai Tentera tahap ${d.buka}</b>`}</div><div style="display:flex;gap:6px"><button class="btn ${buka ? '' : 'mati'}" data-latih="${k}" style="flex:1">+1 ${btnKos(['beras', d.kos])}</button><button class="btn kayu ${buka ? '' : 'mati'}" data-latih5="${k}">+5</button></div></div>`;
      }).join('')}</div>`;
      isi.querySelectorAll('[data-un]').forEach(c => lukisPratontonUnit(c, c.dataset.un));
      isi.querySelectorAll('[data-latih]').forEach(b => b.onclick = () => latih(b.dataset.latih, 1));
      isi.querySelectorAll('[data-latih5]').forEach(b => b.onclick = () => latih(b.dataset.latih5, 5));
      isi.querySelectorAll('[data-batal]').forEach(b => b.onclick = () => batalGilir(+b.dataset.batal));
    } else if (tab === 'pahlawan') {
      isi.innerHTML = Object.entries(WIRA).map(([k, w]) => {
        const b = S.bld.find(x => x.t === w.bina), lv = wiraSedia(k);
        return `<div class="baris"><canvas data-un="${k}" style="width:64px;height:64px;flex:none;border-radius:10px;background:#e9dcc1"></canvas><div class="teks"><b>${esc(w.n)}</b><small>${b ? (b.busy ? 'Sedang dinaik taraf, tidak boleh berperang' : `Tahap ${b.lv} · sedia berperang`) : `Bina ${esc(B[w.bina].n)} (Istana ${bukaPada(w.bina)})`}</small><small>Kuasa ${esc(w.kuasa)}: ${esc(w.kd)}</small></div>${lv ? '' : ''}</div>`;
      }).join('') + '<p class="kecil" style="font-size:12px">Pahlawan tidak hilang selepas perang. Dalam perang, ketik kad pahlawan sekali lagi selepas dilepaskan untuk menggunakan kuasa.</p>';
      isi.querySelectorAll('[data-un]').forEach(c => lukisPratontonUnit(c, c.dataset.un));
    } else {
      const cap = capBantuan();
      if (!cap) { isi.innerHTML = `<p>Bina Balai Muafakat (Istana tahap 2) untuk menyertai puak dan menerima bantuan tentera.</p>`; return; }
      const kira = {}; for (const k of S.bantuan) kira[k] = (kira[k] || 0) + 1;
      isi.innerHTML = `<div class="ruang"><span>Bantuan dalam Balai Muafakat <span class="nombor">${ruangBantuan()}/${cap}</span></span><div class="meter emas"><i style="width:${100 * ruangBantuan() / cap}%"></i></div></div>${Object.keys(kira).length ? Object.entries(kira).map(([k, n]) => `<div class="baris"><div class="teks"><b>${esc(TR[k].n)} × ${n}</b></div></div>`).join('') : '<p>Tiada bantuan lagi. Minta daripada rakan puak.</p>'}<button class="btn merah" id="btnMintaT">Minta bantuan</button>`;
      $('#btnMintaT').onclick = () => { mintaBantuan(); renderModal(); };
    }
  });
}
function bukaIlmu(tab) {
  bukaModal('Balai Ilmu', [['kaji', 'Kajian'], ['kuiz', 'Kuiz sejarah']], (t, isi) => {
    if (t === 'kaji') {
      isi.innerHTML = `${S.kaji ? `<div class="baris"><div class="teks"><b>Mengkaji ${esc(TR[S.kaji.k].n)} tahap ${S.kaji.lv}</b><small>Baki <span data-sampai="${S.kaji.until}">${masa((S.kaji.until - kini()) / 1000)}</span></small><div class="meter"><i data-meter-mula="${S.kaji.mula}" data-meter-tamat="${S.kaji.until}" style="width:${100 * clamp((kini() - S.kaji.mula) / (S.kaji.until - S.kaji.mula), 0, 1)}%"></i></div></div></div>` : '<p>Pilih tentera untuk dikaji. Setiap tahap menambah nyawa dan kerosakan sebanyak 22%.</p>'}
      ${Object.keys(TR).map(k => {
        const lv = S.troopLv[k], nx = lv + 1, buka = balaiMaks() >= TR[k].buka, had2 = nx <= maxKaji();
        return `<div class="baris"><canvas data-un="${k}" style="width:56px;height:56px;flex:none;border-radius:10px;background:#e9dcc1"></canvas><div class="teks"><b>${esc(TR[k].n)} · tahap ${lv}</b><small>${!buka ? `Buka di Balai Tentera tahap ${TR[k].buka}` : !had2 ? 'Naik taraf Balai Ilmu untuk tahap seterusnya' : `Ke tahap ${nx} · ${masa(MASA_KAJI[nx])}`}</small></div>${buka && had2 ? `<button class="btn ${S.kaji ? 'mati' : ''}" data-kaji="${k}">${btnKos(['beras', kosKaji(k, nx)])}</button>` : ''}</div>`;
      }).join('')}`;
      isi.querySelectorAll('[data-un]').forEach(c => lukisPratontonUnit(c, c.dataset.un));
      isi.querySelectorAll('[data-kaji]').forEach(b => b.onclick = () => mulaKaji(b.dataset.kaji));
    } else renderKuiz(isi);
  }, tab);
}
let kuizSesi = null;
function renderKuiz(isi) {
  if (S.kuiz.hari !== hariIni()) S.kuiz = { hari: hariIni(), jawab: 0 };
  const baki = Math.max(0, 5 - S.kuiz.jawab);
  if (!kuizSesi) {
    isi.innerHTML = `<h3>Kuiz Sejarah Malaysia</h3><p>Jawab soalan tentang sejarah Tanah Melayu dan Malaysia. ${baki ? `Hari ini masih ada <b>${baki}</b> soalan berganjaran: setiap jawapan betul memberi ${ik('mutiara')} 3 mutiara.` : 'Ganjaran hari ini sudah habis. Kau masih boleh berlatih.'}</p><button class="btn merah" id="mulaKuiz">Mula kuiz</button>`;
    $('#mulaKuiz').onclick = () => { const r = rng(cincang(hariIni()) + S.stat.kuiz * 7 + Math.floor(acak() * 999)); const idx = KUIZ.map((_, i) => i).sort(() => r() - .5).slice(0, 5); kuizSesi = { idx, i: 0, betul: 0, jawab: null }; renderKuiz(isi); };
    return;
  }
  const q = KUIZ[kuizSesi.idx[kuizSesi.i]];
  if (!q) { isi.innerHTML = `<h3>Tamat!</h3><p>Kau menjawab ${kuizSesi.betul} daripada 5 dengan betul.</p><button class="btn merah" id="ulangKuiz">Kuiz lagi</button>`; $('#ulangKuiz').onclick = () => { kuizSesi = null; renderKuiz(isi); }; return; }
  isi.innerHTML = `<small style="font-weight:700;color:var(--merah)">Soalan ${kuizSesi.i + 1} / 5</small><h3>${esc(q.s)}</h3><div class="kuiz-pilihan">${q.p.map((p, i) => `<button data-j="${i}" class="${kuizSesi.jawab == null ? '' : i === q.j ? 'betul' : i === kuizSesi.jawab ? 'salah' : ''}">${esc(p)}</button>`).join('')}</div>${kuizSesi.jawab != null ? `<p style="margin-top:10px">${kuizSesi.jawab === q.j ? 'Betul!' : `Jawapan betul: <b>${esc(q.p[q.j])}</b>.`}</p><button class="btn" id="seterusKuiz">Seterusnya</button>` : ''}`;
  isi.querySelectorAll('[data-j]').forEach(b => b.onclick = () => {
    if (kuizSesi.jawab != null) return;
    kuizSesi.jawab = +b.dataset.j;
    if (kuizSesi.jawab === q.j) {
      kuizSesi.betul++; S.stat.kuiz++; misi('kuiz'); tambahXP(5); sfx('kutip');
      if (S.kuiz.jawab < 5) { S.res.mutiara += 3; toast('+3 mutiara'); }
    } else sfx('salah');
    S.kuiz.jawab++; kemaskiniHUD(); simpan(); renderKuiz(isi);
  });
  const sn = $('#seterusKuiz'); if (sn) sn.onclick = () => { kuizSesi.i++; kuizSesi.jawab = null; renderKuiz(isi); };
}
function mintaBantuan() {
  const p = S.puak; if (!p) { toast('Bina Balai Muafakat untuk menyertai puak.', true); return; }
  const cap = capBantuan(); if (ruangBantuan() >= cap) { toast('Balai Muafakat sudah penuh.', true); return; }
  if (p.minta) { toast('Permintaan kau masih terbuka.', true); return; }
  if (kini() < p.mintaLagi) { toast(`Boleh minta lagi dalam ${masa((p.mintaLagi - kini()) / 1000)}.`, true); return; }
  const k = pilih(jenisDibuka());
  p.minta = { k, masa: kini() }; p.mintaLagi = kini() + 3 * 60e3;
  chat({ dari: S.nama, aku: true, t: `Minta bantuan tentera, terutamanya ${TR[k].n}. Terima kasih!` });
  toast('Permintaan dihantar kepada puak.'); simpan();
}
function bukaPuakModal(tab) {
  pilihan = null; paparPanel();
  if (!S.puak) { bukaModal('Puak', null, (_, isi) => { isi.innerHTML = `<h3>Belum menyertai puak</h3><p>Bina <b>Balai Muafakat</b> (dibuka pada Istana tahap 2) untuk menyertai puak ${NAMA_PUAK}. Ahli puak berkongsi tentera, berbual tentang strategi dan bergotong-royong mencapai sasaran bersama.</p>`; }); return; }
  S.puak.belumBaca = 0;
  bukaModal(`Puak ${S.puak.nama}`, [['sembang', 'Sembang'], ['ahli', 'Ahli'], ['gotong', 'Gotong-royong']], (t, isi) => {
    const p = S.puak; p.belumBaca = 0;
    if (t === 'sembang') {
      isi.innerHTML = `<div class="ruang"><span>Bantuan: <span class="nombor">${ruangBantuan()}/${capBantuan()}</span></span><button class="btn merah" id="btnMinta">${p.minta ? 'Menunggu bantuan…' : kini() < p.mintaLagi ? `Minta lagi ${masa((p.mintaLagi - kini()) / 1000)}` : 'Minta bantuan'}</button></div>
        <div class="sembang" id="senaraiSembang"></div>
        <form id="borangSembang" style="display:flex;gap:6px;margin-top:10px"><input id="inputSembang" maxlength="120" placeholder="Tulis mesej kepada puak" style="flex:1;min-width:0;font:inherit;font-size:16px;padding:8px 10px;border-radius:8px;border:2px solid #c9b48a;background:#fff;color:#2a1a0c"><button class="btn" type="submit">Hantar</button></form>`;
      renderSembang();
      $('#btnMinta').onclick = () => { mintaBantuan(); renderModal(); };
      $('#borangSembang').onsubmit = e => {
        e.preventDefault(); const v = $('#inputSembang').value.trim(); if (!v) return;
        chat({ dari: S.nama, aku: true, t: v }); $('#inputSembang').value = '';
        setTimeout(() => { if (!S.puak) return; chat({ dari: pilih(S.puak.ahli).n, t: pilih(['Setuju!', 'Betul tu.', 'Haha, mantap.', 'Jom serang sama-sama!', 'Noted, terima kasih.', 'InsyaAllah, nanti aku tolong.']) }); }, 2500 + acak() * 3000);
        renderSembang();
      };
    } else if (t === 'ahli') {
      const semua = [...p.ahli.map(a => ({ ...a, aku: false })), { n: S.nama, maruah: S.maruah, lv: istLv(), derma: S.stat.derma, aku: true }].sort((a, b) => b.maruah - a.maruah);
      isi.innerHTML = semua.map((a, i) => `<div class="baris" style="${a.aku ? 'background:#fff6d6;border-color:#d8a437' : ''}"><b style="font-family:var(--f-papar);font-size:18px;width:28px;text-align:center">${i + 1}</b><div class="teks"><b>${esc(a.n)}${a.aku ? ' (kau)' : ''}</b><small>Istana ${a.lv} · Liga ${ligaDari(a.maruah).n} · derma ${a.derma}</small></div><b class="nombor" style="font-family:var(--f-papar)">${fmtN(a.maruah)}</b></div>`).join('');
    } else {
      const g = p.goal, siap = g.prog >= g.sasaran;
      isi.innerHTML = `<h3>Gotong-royong: Kumpul ${fmtN(g.sasaran)} emas bersama</h3><p>Setiap emas yang kau rampas dalam serangan turut dikira. Apabila sasaran dicapai, semua ahli menerima ganjaran.</p>
        <div class="meter emas" style="height:18px"><i style="width:${100 * g.prog / g.sasaran}%"></i></div><p class="nombor" style="margin-top:6px"><b>${fmtN(g.prog)}</b> / ${fmtN(g.sasaran)} · sumbangan kau ${fmtN(g.aku)}</p>
        <p>Ganjaran: ${ik('mutiara')} ${g.g.mutiara} · ${ik('emas')} ${fmtN(g.g.emas)} · ${ik('beras')} ${fmtN(g.g.beras)}</p>
        <button class="btn ${siap ? 'hijau' : 'mati'}" id="tuntutGotong">${siap ? 'Tuntut ganjaran' : 'Belum selesai'}</button>`;
      $('#tuntutGotong').onclick = () => {
        if (!siap) return;
        S.res.mutiara += g.g.mutiara; tambah('emas', g.g.emas); tambah('beras', g.g.beras);
        S.stat.gotong++; p.goal = goalBaru(); chat({ sys: true, t: 'Gotong-royong selesai! Sasaran baharu telah ditetapkan.' });
        sfx('menang'); semakHikayat(); kemaskiniHUD(); simpan(); renderModal();
      };
    }
  }, tab);
}
function renderSembang() {
  const el = $('#senaraiSembang'); if (!el || !S.puak) return;
  el.innerHTML = S.puak.chat.slice(-30).map(m => {
    if (m.sys) return `<div class="mesej sistem">${esc(m.t)}</div>`;
    let minta = '';
    if (m.minta) {
      const ada = S.army[m.minta.k] || 0, penuh = m.minta.dapat >= m.minta.perlu;
      minta = `<div class="minta"><small>${esc(TR[m.minta.k].n)} ${m.minta.dapat}/${m.minta.perlu}</small><div class="meter"><i style="width:${100 * m.minta.dapat / m.minta.perlu}%"></i></div>${penuh ? '<small>Lengkap</small>' : `<button class="btn ${ada ? 'hijau' : 'mati'}" data-derma="${m.id}" style="padding:4px 10px">Derma${ada ? ` (${ada})` : ''}</button>`}</div>`;
    }
    return `<div class="mesej ${m.aku ? 'aku' : ''}"><b>${esc(m.dari)}</b><p>${esc(m.t)}</p>${minta}</div>`;
  }).join('');
  el.querySelectorAll('[data-derma]').forEach(b => b.onclick = () => derma(+b.dataset.derma));
  perluRenderPuak = false;
}
function derma(id) {
  const m = S.puak.chat.find(x => x.id === id); if (!m || !m.minta) return;
  const k = m.minta.k;
  if (!(S.army[k] > 0)) { toast(`Kau tiada ${TR[k].n} untuk diderma. Latih dahulu.`, true); sfx('salah'); return; }
  if (m.minta.dapat >= m.minta.perlu) return;
  S.army[k]--; if (!S.army[k]) delete S.army[k];
  m.minta.dapat++; S.stat.derma++; misi('derma'); tambahXP(3); S.res.mutiara += 1; sfx('kutip');
  if (m.minta.dapat >= m.minta.perlu) setTimeout(() => { if (S.puak) chat({ dari: m.dari, t: pilih(SEMBANG.terima).replace('{n}', S.nama) }); }, 900);
  kemaskiniHUD(); simpan(); renderSembang();
}
function bukaKitab(tab) {
  pilihan = null; paparPanel(); semakMisi();
  const tabs = () => { const tm = S.misi.senarai.filter(m => m.p >= m.n && !m.ambil).length + (!S.misi.bonus && S.misi.senarai.every(m => m.ambil) ? 1 : 0); const tc = CAPAI.filter(c => (S.capai[c.k] || 0) < 3 && nilaiCapai(c.k) >= c.t[S.capai[c.k] || 0]).length; return [['misi', 'Misi harian', tm], ['capai', 'Pencapaian', tc], ['hikayat', 'Hikayat', S.hikayatBaru], ['laporan', 'Pertahanan', S.laporanBaru]]; };
  bukaModal('Kitab', tabs(), (t, isi) => {
    if (t === 'misi') {
      const m = S.misi, semua = m.senarai.every(x => x.ambil);
      isi.innerHTML = `<p>Tiga misi baharu setiap hari. Setiap misi memberi ${ik('mutiara')} 15 mutiara, dan bonus ${ik('mutiara')} 25 jika ketiga-tiganya selesai.</p>${m.senarai.map((x, i) => {
        const j = MISI_JENIS.find(y => y.k === x.k), siap = x.p >= x.n;
        return `<div class="baris"><div class="teks"><b>${esc(j.t(x.n))}</b><div class="meter"><i style="width:${100 * x.p / x.n}%"></i></div><small class="nombor">${fmtN(x.p)} / ${fmtN(x.n)}</small></div>${x.ambil ? '<small>Dituntut</small>' : `<button class="btn ${siap ? 'hijau' : 'mati'}" data-misi="${i}">${ik('mutiara')} 15</button>`}</div>`;
      }).join('')}<div class="baris"><div class="teks"><b>Bonus harian</b><small>Selesaikan ketiga-tiga misi</small></div>${m.bonus ? '<small>Dituntut</small>' : `<button class="btn ${semua ? 'hijau' : 'mati'}" id="bonusMisi">${ik('mutiara')} 25</button>`}</div>`;
      isi.querySelectorAll('[data-misi]').forEach(b => b.onclick = () => { const x = m.senarai[+b.dataset.misi]; if (x.p < x.n || x.ambil) return; x.ambil = true; S.res.mutiara += 15; sfx('kutip'); kemaskiniHUD(); simpan(); modalCur.tabs = tabs(); renderModal(); });
      const bb = $('#bonusMisi'); if (bb) bb.onclick = () => { if (!semua || m.bonus) return; m.bonus = true; S.res.mutiara += 25; sfx('menang'); kemaskiniHUD(); simpan(); modalCur.tabs = tabs(); renderModal(); };
    } else if (t === 'capai') {
      isi.innerHTML = CAPAI.map(c => {
        const tier = S.capai[c.k] || 0, v = nilaiCapai(c.k), sasar = c.t[Math.min(2, tier)], siap = tier < 3 && v >= c.t[tier];
        return `<div class="baris"><div style="display:flex;gap:1px;flex:none">${[0, 1, 2].map(i => `<span style="width:18px;height:18px;display:inline-block">${IKON.bintang(i < tier)}</span>`).join('')}</div><div class="teks"><b>${esc(c.n)}</b><small>${esc(c.d)}: <span class="nombor">${fmtN(Math.min(v, sasar))} / ${fmtN(sasar)}</span></small><div class="meter"><i style="width:${tier >= 3 ? 100 : 100 * Math.min(1, v / sasar)}%"></i></div></div>${tier >= 3 ? '<small>Lengkap</small>' : `<button class="btn ${siap ? 'hijau' : 'mati'}" data-capai="${c.k}">${ik('mutiara')} ${GANJARAN_CAPAI[tier]}</button>`}</div>`;
      }).join('');
      isi.querySelectorAll('[data-capai]').forEach(b => b.onclick = () => { const c = CAPAI.find(x => x.k === b.dataset.capai), tier = S.capai[c.k] || 0; if (tier >= 3 || nilaiCapai(c.k) < c.t[tier]) return; S.capai[c.k] = tier + 1; S.res.mutiara += GANJARAN_CAPAI[tier]; sfx('menang'); kemaskiniHUD(); simpan(); modalCur.tabs = tabs(); renderModal(); });
    } else if (t === 'hikayat') {
      S.hikayatBaru = 0;
      const n = Object.keys(S.hikayat).length;
      isi.innerHTML = `<p>Kad terbuka apabila kota kau maju melalui zaman. <b>${n} / ${HIKAYAT.length}</b> dikumpul.</p><div class="hikayat">${HIKAYAT.map(h => S.hikayat[h.k] ? `<div class="kad-hikayat"><div class="jalur"></div><div class="dalam"><small>${esc(h.era)}</small><b>${esc(h.t)}</b><p>${esc(h.p)}</p></div></div>` : `<div class="kad-hikayat kunci"><div class="dalam"><small>Terkunci</small><b>${esc(h.t)}</b><p>Syarat: ${esc(h.s)}</p></div></div>`).join('')}</div>`;
    } else {
      S.laporanBaru = 0;
      isi.innerHTML = S.laporan.length ? S.laporan.map((l, i) => `<div class="baris"><div style="display:flex;flex:none">${[0, 1, 2].map(j => `<span style="width:18px;height:18px;display:inline-block">${IKON.bintang(j < l.bin)}</span>`).join('')}</div><div class="teks"><b>${l.bin === 0 ? 'Berjaya dipertahankan' : 'Kota diserang'}: ${esc(l.nama)}</b><small>${new Date(l.masa).toLocaleString('ms-MY', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} · Istana ${l.L} · Maruah ${l.m > 0 ? '+' : ''}${l.m}${l.hilang.emas || l.hilang.beras ? ` · hilang ${fmtN(l.hilang.emas)} emas, ${fmtN(l.hilang.beras)} beras` : ''}</small></div>${l.bin > 0 && !l.balas ? `<button class="btn merah" data-balas="${i}">Balas</button>` : ''}</div>`).join('') : '<p>Belum ada serangan ke atas kota kau. Kota diserang hanya semasa kau tiada, dan perisai melindungi selepas kekalahan besar.</p>';
      isi.querySelectorAll('[data-balas]').forEach(b => b.onclick = () => { const l = S.laporan[+b.dataset.balas]; if (!Object.values(S.army).some(n => n > 0)) { toast('Latih tentera dahulu.', true); return; } l.balas = true; mulaPerang({ jenis: 'jiran', nama: l.nama, L: l.L, seed: l.seed }); });
    }
    kemaskiniHUD();
  }, tab);
}
function bukaSerang() {
  pilihan = null; paparPanel();
  bukaModal('Serang', [['jiran', 'Cari lawan'], ['kempen', 'Kempen Selat']], (t, isi) => {
    const jumlah = Object.values(S.army).reduce((a, b) => a + b, 0), ada = jumlah > 0 || wiraSedia('tuah') || S.bantuan.length;
    const ringkas = Object.entries(S.army).filter(([, n]) => n > 0).map(([k, n]) => `${TR[k].n} × ${n}`).join(', ') || 'Tiada tentera';
    if (t === 'jiran') {
      const lg = ligaDari(S.maruah);
      isi.innerHTML = `<h3>Serbu kampung jiran</h3><p>Rampas emas dan beras daripada kota lain. Menang menambah maruah dan bonus liga; kalah mengurangkan maruah. Setiap kota berbeza, jadi rampasan pun berubah-ubah.</p>
        <div class="baris"><div class="teks"><b>Bala tentera kau</b><small>${esc(ringkas)}${S.bantuan.length ? ` · bantuan puak ${S.bantuan.length}` : ''}</small></div></div>
        <div class="baris"><div class="teks"><b>Liga ${lg.n} · maruah ${fmtN(S.maruah)}</b><small>Bonus liga untuk kemenangan tiga bintang: ${fmtN(lg.bonus)} emas dan beras</small></div></div>
        <button class="btn merah" id="btnCari" style="font-size:18px;padding:12px 18px">Cari lawan ${btnKos(['emas', kosCari()])}</button>`;
      $('#btnCari').onclick = () => { if (!ada) { toast('Latih tentera dahulu di Balai Tentera.', true); sfx('salah'); return; } cariLawan(); };
    } else {
      isi.innerHTML = `<p>Bantu Orang Laut membersihkan Selat Melaka daripada lanun. Rampasan penuh pada kemenangan pertama; ulangan memberi 30%.</p>${KEMPEN.map((k, i) => {
        const bin = S.kempen[i] || 0, buka = i === 0 || (S.kempen[i - 1] || 0) > 0;
        return `<div class="baris" style="${buka ? '' : 'opacity:.55'}"><b style="font-family:var(--f-papar);font-size:18px;width:26px;text-align:center">${i + 1}</b><div class="teks"><b>${esc(k.n)}</b><small>${esc(k.c)}</small><small>Kekuatan kubu: Istana ${k.L}</small></div><div style="display:flex;flex-direction:column;align-items:center;gap:4px"><div style="display:flex">${[0, 1, 2].map(j => `<span style="width:16px;height:16px;display:inline-block">${IKON.bintang(j < bin)}</span>`).join('')}</div>${buka ? `<button class="btn merah" data-kempen="${i}">Serang</button>` : '<small>Terkunci</small>'}</div></div>`;
      }).join('')}`;
      isi.querySelectorAll('[data-kempen]').forEach(b => b.onclick = () => { if (!ada) { toast('Latih tentera dahulu di Balai Tentera.', true); sfx('salah'); return; } serangKempen(+b.dataset.kempen); });
    }
  });
}
function bukaTetapan() {
  pilihan = null; paparPanel();
  bukaModal('Tetapan', null, (_, isi) => {
    isi.innerHTML = `<div class="medan"><label for="inputNama"><b>Nama penghulu</b></label><input id="inputNama" maxlength="20" value="${esc(S.nama)}"></div>
      <div class="baris"><div class="teks"><b>Bunyi</b><small>Kesan bunyi pertempuran dan binaan</small></div><button class="btn kayu" id="btnBunyi">${S.bunyi ? 'Hidup' : 'Mati'}</button></div>
      <h3>Tentang Kota Warisan</h3><p>Permainan bina kota bertemakan sejarah Tanah Melayu dan Malaysia. Setiap tahap Istana membuka satu era, dari Lembah Bujang hingga Merdeka. Kad Kitab Hikayat merangkum fakta sejarah ringkas; kuiz harian menguji ingatan.</p>
      <p>Tiada pembelian sebenar. Semua mutiara diperoleh dengan bermain. Kota terus berkembang semasa kau tiada, jadi tak perlu berjaga sepanjang masa.</p>
      <p>Simpanan permainan disimpan dalam pelayar peranti ini sahaja.</p>
      <div class="baris" style="border-color:#e0a090"><div class="teks"><b>Mula semula</b><small>Padam kota dan semua kemajuan pada peranti ini.</small></div><button class="btn merah" id="btnReset">Mula semula</button></div>`;
    $('#inputNama').onchange = e => { S.nama = e.target.value.trim().slice(0, 20) || 'Penghulu'; kemaskiniHUD(); simpan(); };
    $('#btnBunyi').onclick = () => { S.bunyi = !S.bunyi; bukaAudio(); sfx('ketik'); simpan(); renderModal(); };
    let sah = false;
    $('#btnReset').onclick = e => {
      if (!sah) { sah = true; e.target.textContent = 'Ketik sekali lagi untuk padam'; return; }
      S = keadaanBaru(); semakHikayat(true); semakMisi(); pilihan = null; tutupModal(); kameraAsal(); kemaskiniHUD(); simpan(); toast('Kota baharu dibuka.');
    };
  });
}
function paparEra(lv) {
  const e = ERA[lv - 1], kad = HIKAYAT.find(h => ({ 2: 'sungaibatu', 3: 'langkasuka', 4: 'melaka', 5: 'jatuh1511', 6: 'pangkor', 7: 'merdeka' })[lv] === h.k);
  sfx('gong');
  bukaModal(`Era baharu: ${e.nama}`, null, (_, isi) => {
    isi.innerHTML = `<p style="font-weight:700">Istana kini tahap ${lv} · ${esc(e.masa)}</p>${kad ? `<div class="kad-hikayat" style="margin-bottom:12px"><div class="jalur"></div><div class="dalam"><small>${esc(kad.era)}</small><b>${esc(kad.t)}</b><p>${esc(kad.p)}</p></div></div>` : ''}<p>Bangunan dan tahap baharu kini dibuka. Lihat menu Bina.</p><button class="btn merah" id="eraOk">Teruskan</button>`;
    $('#eraOk').onclick = tutupModal;
  });
}
function paparKeputusan(r) {
  bukaModal(r.menang ? 'Kemenangan!' : 'Kekalahan', null, (_, isi) => {
    const kk = KEMPEN[r.lw.idx];
    isi.innerHTML = `<div class="keputusan"><div class="bintang-besar">${[0, 1, 2].map(i => IKON.bintang(i < r.bin)).join('')}</div><h3>${esc(r.lw.nama)} · ${r.peratus}% musnah</h3>
      <div class="angka">${['emas', 'beras', 'timah'].filter(x => r.dapat[x] > 0 || x !== 'timah').map(x => `<span>${ik(x)} ${fmtN(r.dapat[x])}</span>`).join('')}</div>
      ${r.lw.jenis === 'jiran' ? `<p>Maruah ${r.maruah >= 0 ? '+' : ''}${r.maruah} · kini ${fmtN(S.maruah)} (Liga ${ligaDari(S.maruah).n})</p>` : ''}
      ${r.bonus ? `<p>Bonus liga: ${ik('emas')} ${fmtN(r.bonus.emas)} · ${ik('beras')} ${fmtN(r.bonus.beras)}</p>` : ''}
      ${BT && BT.karam ? '<p><b>Kapal dagang karam!</b> Rampasan kubu ini luar biasa besar.</p>' : ''}
      ${r.lw.jenis === 'kempen' && r.menang && kk ? `<p>${esc(kk.n)} ditewaskan. Selat semakin aman.</p>` : ''}
      ${!r.menang ? '<p>Cuba susunan lain: hantar Gajah dahulu untuk menarik tembakan, kemudian Pendekar dan Penyumpit di belakang.</p>' : ''}
      <button class="btn hijau" id="pulang" style="font-size:18px;padding:12px 22px">Pulang ke kota</button></div>`;
    $('#pulang').onclick = pulangKota;
  });
}

/* ================= HUD perang ================= */
function binaKadPerang() {
  const k = [];
  for (const [t, n] of Object.entries(BT.tentera)) k.push({ id: t, kelas: '', nama: TR[t].n, n });
  for (const w of ['tuah', 'fatimah']) if (BT.wira[w] !== 'tiada') k.push({ id: w, kelas: 'wira', nama: WIRA[w].n });
  for (const t of ['gendang', 'ubat']) if (BT.taktik[t] > 0) k.push({ id: t, kelas: 'taktik', nama: TAKTIK[t].n });
  if (BT.bantuan.length) k.push({ id: 'bantuan', kelas: 'bantuan', nama: 'Bantuan puak' });
  $('#perangBawah').innerHTML = `<div class="kad-wrap">${k.map(x => `<button class="kad ${x.kelas}" data-kad="${x.id}" aria-label="${esc(x.nama)}"><canvas></canvas><span class="k-bil"></span><span class="k-nama">${esc(x.nama)}</span><span class="kuasa" hidden>Kuasa</span></button>`).join('') || '<p style="margin:0;padding:10px">Tiada tentera. Pulang dan latih di Balai Tentera.</p>'}</div><div class="kawal"><button class="btn kayu" id="btnLaju">x1</button><button class="btn" id="btnSeterus"></button><button class="btn merah" id="btnTamat"></button></div>`;
  $('#perangBawah').querySelectorAll('[data-kad]').forEach(el => {
    const id = el.dataset.kad, cv2 = el.querySelector('canvas');
    if (TR[id] || WIRA[id]) lukisPratontonUnit(cv2, id);
    else lukisKeKanvas(cv2, () => lukisIkonTaktik(id));
    el.onclick = () => {
      bukaAudio();
      if (WIRA[id] && BT.wira[id] === 'aktif') { gunaKuasa(id); return; }
      BT.pilih = id; sfx('ketik'); paparKad();
    };
  });
  $('#btnLaju').onclick = () => { BT.laju = BT.laju === 1 ? 2 : 1; $('#btnLaju').textContent = 'x' + BT.laju; };
  $('#btnSeterus').onclick = () => cariLawan();
  $('#btnTamat').onclick = () => { if (!BT.mula) { BT = null; pulangKota(); } else tamatPerang(); };
  paparKad();
}
function lukisIkonTaktik(id) {
  if (id === 'gendang') {
    ctx.fillStyle = '#7a4a22'; ctx.fillRect(-12, -10, 24, 18); ctx.fillStyle = '#e9dcc0'; ctx.beginPath(); ctx.ellipse(0, -10, 12, 4, 0, 0, 7); ctx.fill();
    ctx.strokeStyle = '#3a2416'; ctx.lineWidth = 1.5; for (let i = -10; i <= 10; i += 5) { ctx.beginPath(); ctx.moveTo(i, -8); ctx.lineTo(i + 2.5, 7); ctx.stroke(); }
    garis(-16, -22, -4, -12, 2.4, '#d4a017'); garis(16, -22, 4, -12, 2.4, '#d4a017');
  } else if (id === 'ubat') {
    ctx.fillStyle = '#5aa83c'; ctx.beginPath(); ctx.moveTo(-9, -6); ctx.lineTo(9, -6); ctx.lineTo(12, 12); ctx.lineTo(-12, 12); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#7a5230'; ctx.fillRect(-4, -14, 8, 8); ctx.fillStyle = '#b8f0a0'; bulat(-3, 3, 3, '#b8f0a0'); garis(-4, -20, 4, -14, 2, '#3f8a35');
  } else {
    garis(-8, 14, -8, -18, 2.4, '#3a2416'); ctx.fillStyle = '#2f7d32'; ctx.fillRect(-8, -18, 20, 13); ctx.fillStyle = '#f4c20d'; bulat(2, -11.5, 3.5, '#f4c20d');
  }
}
function paparKad() {
  if (!BT) return;
  document.querySelectorAll('#perangBawah [data-kad]').forEach(el => {
    const id = el.dataset.kad, bil2 = el.querySelector('.k-bil'), ku = el.querySelector('.kuasa');
    let n = '', habis = false;
    if (TR[id]) { n = BT.tentera[id] || 0; habis = !n; n = 'x' + n; }
    else if (WIRA[id]) { const s = BT.wira[id]; habis = s === 'guna' || s === 'mati'; n = s === 'sedia' ? 'Tahap ' + wiraSedia(id) : s === 'aktif' ? 'Medan' : s === 'mati' ? 'Gugur' : 'Medan'; ku.hidden = s !== 'aktif'; }
    else if (TAKTIK[id]) { n = 'x' + BT.taktik[id]; habis = !BT.taktik[id]; }
    else { n = 'x' + BT.bantuan.length; habis = !BT.bantuan.length; }
    bil2.textContent = n; el.classList.toggle('habis', habis); el.classList.toggle('pilih', BT.pilih === id && !habis);
  });
  const sn = $('#btnSeterus'); if (sn) { sn.hidden = BT.mula || BT.lawan.jenis !== 'jiran'; sn.innerHTML = `Seterusnya ${btnKos(['emas', kosCari()])}`; }
  const tm = $('#btnTamat'); if (tm) tm.textContent = BT.mula ? 'Tamat' : 'Pulang';
}
function paparHudPerang() {
  if (!BT) return;
  const baki = r => Math.max(0, BT.jumlahLoot[r] - BT.rampas[r]);
  $('#perangAtasKiri').innerHTML = `<h4>${esc(BT.lawan.nama)}</h4><div class="rampasan">${['emas', 'beras', 'timah'].filter(r => BT.jumlahLoot[r] > 0).map(r => `<div>${ik(r)}<span class="nombor">${fmtN(baki(r))}</span></div>`).join('')}</div><div class="kecil">Rampasan tersedia${BT.karam ? ' · kapal dagang karam!' : ''}</div>`;
  $('#perangTengah').innerHTML = BT.mula ? `<small>Tamat dalam</small><b class="nombor">${masa(BT.masa)}</b>` : `<small>Pengintaian</small><b style="font-size:15px">Ketik di luar kawasan merah</b>`;
  $('#perangKanan').innerHTML = `<div class="bintang">${[0, 1, 2].map(i => IKON.bintang(i < bintangPerang())).join('')}</div><b class="nombor">${Math.round(100 * BT.musnah / BT.jumlah)}%</b><small>musnah</small>`;
}

/* ================= Gelung utama ================= */
let lalu = performance.now(), akum = 0, detik = 0, detikSimpan = 0, detikPuak = 0;
function gelung(t) {
  const dt = Math.min(.1, (t - lalu) / 1000); lalu = t;
  try {
    if (mode === 'perang' && BT) {
      akum += dt * BT.laju;
      while (akum >= 1 / 30) { kemaskiniPerang(1 / 30); akum -= 1 / 30; if (!BT || BT.tamat) break; }
    }
    detik += dt; detikSimpan += dt; detikPuak += dt;
    if (detik > .25) {
      detik = 0; kemaskini(kini()); kemaskiniHUD();
      if (perluRender && modalCur && !tekanModal && ['Tentera', 'Balai Ilmu'].includes(modalCur.tajuk) && !(modalCur.tajuk === 'Balai Ilmu' && modalCur.tab === 'kuiz')) { renderModal(); perluRender = false; }
      document.querySelectorAll('[data-sampai]').forEach(e => e.textContent = masa((+e.dataset.sampai - kini()) / 1000));
      document.querySelectorAll('[data-meter-mula]').forEach(e => e.style.width = 100 * clamp((kini() - e.dataset.meterMula) / (e.dataset.meterTamat - e.dataset.meterMula), 0, 1) + '%');
    }
    if (detikPuak > 1) { detikPuak = 0; puakDetik(); if (perluRenderPuak && modalCur && modalCur.tajuk.startsWith('Puak') && modalCur.tab === 'sembang' && !tekanModal && document.activeElement?.id !== 'inputSembang') { const el = $('#modalIsi'), bawah = el.scrollHeight - el.scrollTop - el.clientHeight < 40; renderSembang(); if (bawah) el.scrollTop = el.scrollHeight; S.puak.belumBaca = 0; } }
    if (detikSimpan > 5) { detikSimpan = 0; simpan(); if (!sudahIngatRehat && kini() - mulaSesi > 45 * 60e3) { sudahIngatRehat = true; toast('Dah 45 minit bermain. Rehat sekejap; kota kau terus berkembang semasa kau tiada.'); } }
    lukis(t / 1000);
    lukisApungan(dt);
  } catch (e) { console.error(e); }
  requestAnimationFrame(gelung);
}

/* ================= Mula ================= */
function mula(data) {
  S = (data && data.S) || muat() || keadaanBaru();
  S.stat = { ...keadaanBaru().stat, ...S.stat };
  binaHUD(); ubahSaiz(); kameraAsal();
  const jauh = kini() - (S.lastSeen || kini());
  kemaskini(kini());
  semakHikayat(true); semakMisi();
  // mesej puak semasa ketiadaan
  if (S.puak && jauh > 60e3) for (let i = 0; i < Math.min(4, Math.floor(jauh / 60e3)); i++) { S.puak.seterus = 0; puakDetik(); }
  const lap = seranganLuar(jauh);
  kemaskiniHUD(); paparPanel(); simpan();
  if (lap.length) {
    bukaModal('Semasa kau tiada', null, (_, isi) => {
      isi.innerHTML = `<p>Kota kau diserang ${lap.length} kali.</p>${lap.map(l => `<div class="baris"><div style="display:flex;flex:none">${[0, 1, 2].map(j => `<span style="width:18px;height:18px;display:inline-block">${IKON.bintang(j < l.bin)}</span>`).join('')}</div><div class="teks"><b>${l.bin === 0 ? 'Berjaya dipertahankan!' : 'Diserang'} · ${esc(l.nama)}</b><small>Maruah ${l.m > 0 ? '+' : ''}${l.m}${l.hilang.emas ? ` · hilang ${fmtN(l.hilang.emas)} emas, ${fmtN(l.hilang.beras)} beras` : ''}</small></div></div>`).join('')}<p>${S.perisai > kini() ? `Perisai aktif selama ${masa((S.perisai - kini()) / 1000)}.` : 'Kuatkan pertahanan dan susun kota supaya gudang berada di dalam kota.'}</p><button class="btn merah" id="okLap">Faham</button>`;
      $('#okLap').onclick = () => { S.laporanBaru = 0; tutupModal(); };
    });
  }
  requestAnimationFrame(t => { lalu = t; requestAnimationFrame(gelung); });
}
addEventListener('resize', ubahSaiz);
document.addEventListener('visibilitychange', () => { if (document.hidden) simpan(); });
addEventListener('pagehide', simpan);
window.claude?.hot?.snapshot?.(() => ({ S }));
if (window.claude?.hot?.ready) window.claude.hot.ready(mula); else mula(window.claude?.hot?.data ?? {});
