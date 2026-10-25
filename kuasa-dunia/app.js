/* Kuasa Dunia · enjin permainan.
   Pangkalan (bina, kutip, latih), operasi masa nyata atas grid isometrik, pakatan simulasi, operasi strategik,
   imej antarabangsa dan ketegangan, misi, Fail Risikan dan kuiz geopolitik.
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
  dana: '<svg class="ikon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#f6c431" stroke="#7a4f00" stroke-width="2"/><circle cx="12" cy="12" r="5.5" fill="none" stroke="#c48a00" stroke-width="2"/><path d="M7.5 8a6 6 0 0 1 4.5-2.2" stroke="#fff6c8" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>',
  minyak: '<svg class="ikon" viewBox="0 0 24 24"><path d="M12 2.5C9 7.5 5.5 11 5.5 15a6.5 6.5 0 0 0 13 0c0-4-3.5-7.5-6.5-12.5z" fill="#3a3f4a" stroke="#0e1014" stroke-width="2" stroke-linejoin="round"/><path d="M9 14.5a3.2 3.2 0 0 0 2.4 3.4" stroke="#9aa3b5" stroke-width="1.8" fill="none" stroke-linecap="round"/></svg>',
  nadir: '<svg class="ikon" viewBox="0 0 24 24"><path d="M12 2 19 8.5 12 22 5 8.5z" fill="#7fd6c2" stroke="#1d4b44" stroke-width="2" stroke-linejoin="round"/><path d="M5 8.5h14M12 2v20M8.5 8.5 12 22l3.5-13.5" stroke="#1d4b44" stroke-width="1.2" fill="none"/><path d="M9 6.5 12 4" stroke="#eafffa" stroke-width="1.5" stroke-linecap="round"/></svg>',
  intel: '<svg class="ikon" viewBox="0 0 24 24"><path d="M2 12c3-5 6.5-7 10-7s7 2 10 7c-3 5-6.5 7-10 7s-7-2-10-7z" fill="#dfe8ff" stroke="#1b2a4a" stroke-width="2" stroke-linejoin="round"/><circle cx="12" cy="12" r="4.2" fill="#4f7bd9" stroke="#1b2a4a" stroke-width="1.6"/><circle cx="12" cy="12" r="1.7" fill="#0e1830"/><circle cx="13.4" cy="10.6" r=".9" fill="#fff"/></svg>',
  serang: '<svg viewBox="0 0 48 48"><g stroke="#2a0d0b" stroke-width="2.4"><circle cx="24" cy="24" r="15" fill="none" stroke="#f1f1ec" stroke-width="4.5"/><circle cx="24" cy="24" r="15" fill="none"/><circle cx="24" cy="24" r="5" fill="#f4c20d"/><path d="M24 3v11M24 34v11M3 24h11M34 24h11" stroke="#f1f1ec" stroke-width="5" stroke-linecap="round"/><path d="M24 3v11M24 34v11M3 24h11M34 24h11" stroke-linecap="round"/></g></svg>',
  bina: '<svg viewBox="0 0 24 24"><path d="M13.5 3.5l7 7-3 3-7-7z" fill="#cfd6dc" stroke="#1d1208" stroke-width="1.6" stroke-linejoin="round"/><path d="M12.5 8.5 3.5 17.5l3 3 9-9" fill="#c28a4e" stroke="#1d1208" stroke-width="1.6" stroke-linejoin="round"/></svg>',
  tentera: '<svg viewBox="0 0 24 24"><path d="M3.5 15c0-5.5 3.8-9.5 8.5-9.5s8.5 4 8.5 9.5z" fill="#7b8a4a" stroke="#1d1208" stroke-width="1.5" stroke-linejoin="round"/><path d="M2 15h20v2.5H2z" fill="#4d5a2a" stroke="#1d1208" stroke-width="1.5" stroke-linejoin="round"/><path d="M8 9.5c1.5-1.5 4-2 6-1.4" stroke="#b9c88a" stroke-width="1.4" fill="none" stroke-linecap="round"/><path d="M12 18v3" stroke="#f4c20d" stroke-width="2.4"/></svg>',
  puak: '<svg viewBox="0 0 24 24" fill="#fff4dc" stroke="#1d1208" stroke-width="1.4"><circle cx="6" cy="9" r="2.6"/><circle cx="18" cy="9" r="2.6"/><path d="M1.5 19a4.5 4.5 0 0 1 9 0z"/><path d="M13.5 19a4.5 4.5 0 0 1 9 0z"/><circle cx="12" cy="7.5" r="3.2" fill="#f4c20d"/><path d="M6 21a6 6 0 0 1 12 0z" fill="#f4c20d"/></svg>',
  kitab: '<svg viewBox="0 0 24 24"><path d="M2.5 6.5V19a1.5 1.5 0 0 0 1.5 1.5h16a1.5 1.5 0 0 0 1.5-1.5V8.5A1.5 1.5 0 0 0 20 7h-8.5L9.5 4.5H4A1.5 1.5 0 0 0 2.5 6z" fill="#c9a24a" stroke="#1d1208" stroke-width="1.5" stroke-linejoin="round"/><rect x="6" y="11" width="12" height="5" rx="1" fill="#b8322f" stroke="#1d1208" stroke-width="1.2"/><path d="M8 13.5h8" stroke="#fff4dc" stroke-width="1.3"/></svg>',
  ops: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9.5" fill="#1d2a3a" stroke="#1d1208" stroke-width="1.5"/><path d="M12 12 19.5 7.5A9 9 0 0 0 12 2.5z" fill="#4fd17a" opacity=".8"/><circle cx="12" cy="12" r="5.5" fill="none" stroke="#4fd17a" stroke-width="1"/><circle cx="12" cy="12" r="1.6" fill="#4fd17a"/><circle cx="16" cy="8.5" r="1.3" fill="#ff5a4a"/><circle cx="8" cy="15.5" r="1.1" fill="#ffd24a"/></svg>',
  tetapan: '<svg viewBox="0 0 24 24"><g stroke="#1d1208" stroke-width="1.5" fill="#cfd6dc"><path d="M10 2h4l.6 3 2.4 1.4 2.9-1 2 3.4-2.3 2v2.4l2.3 2-2 3.4-2.9-1L14.6 19l-.6 3h-4l-.6-3L7 17.6l-2.9 1-2-3.4 2.3-2v-2.4l-2.3-2 2-3.4 2.9 1L9.4 5z" stroke-linejoin="round"/><circle cx="12" cy="12" r="3.2" fill="#7a5230"/></g></svg>',
  bintang: on => `<svg viewBox="0 0 24 24"><path d="M12 2l3 6.6 7.2.8-5.4 4.9 1.5 7.1L12 17.8 5.7 21.4l1.5-7.1L1.8 9.4 9 8.6z" fill="${on ? '#f4c20d' : '#4a3a2a'}" stroke="#1d1208" stroke-width="1.5" stroke-linejoin="round"/></svg>`,
  bendahara: '<svg class="muka" viewBox="0 0 40 40"><circle cx="20" cy="20" r="19" fill="#2b4a7a" stroke="#0b1424" stroke-width="2"/><path d="M8 38c1-7 6-10 12-10s11 3 12 10" fill="#5d6b35"/><path d="M16 28l4 4 4-4" fill="#e9e3d0"/><circle cx="20" cy="21" r="8.5" fill="#c98b5a"/><path d="M10.5 17c.5-5 4.5-8 10-8s9 2.5 9.5 6.5l-1 1.5H11z" fill="#7a1d24"/><circle cx="25.5" cy="13" r="1.8" fill="#f4c20d"/><path d="M15.5 25c2.5 1.6 6.5 1.6 9 0" stroke="#3a2416" stroke-width="1.6" fill="none" stroke-linecap="round"/><circle cx="16.8" cy="20.5" r="1.1" fill="#1d1208"/><circle cx="23.2" cy="20.5" r="1.1" fill="#1d1208"/><path d="M11 33h5v2h-5z" fill="#f4c20d"/></svg>',
};
const ik = r => IKON[r];

/* ================= Keadaan ================= */
const KUNCI = 'kuasaDunia.v1';
let S = null;
let mode = 'kampung';
let pilihan = null;           // bangunan yang dipilih
let BT = null;                // keadaan perang
let mulaSesi = kini(), sudahIngatRehat = false;

function keadaanBaru() {
  const t = kini(), bld = []; let id = 1;
  const add = (k, x, y) => bld.push({ id: id++, t: k, x, y, lv: 1, busy: null, store: 0, last: t });
  add('markas', 10, 10);
  add('telaga_minyak', 6, 10); add('zon_industri', 15, 10);
  add('bank', 10, 6); add('depot_minyak', 10, 15);
  add('berek', 15, 15); add('kem', 18, 14);
  add('pejabat_jurutera', 6, 6); add('pejabat_jurutera', 6, 15);
  add('artileri', 14, 8);
  bld.find(b => b.t === 'zon_industri').store = 180;
  bld.find(b => b.t === 'telaga_minyak').store = 120;
  return {
    v: 1, nama: 'Komander', negara: null, res: { dana: 800, minyak: 800, nadir: 0, intel: 30 }, xp: 0, maruah: 0, bld, nextId: id,
    army: { infantri: 10 }, gilir: [], gilirMula: t,
    troopLv: Object.fromEntries(Object.keys(TR).map(k => [k, 1])), kaji: null,
    bantuan: [], puak: null, misi: null, langkah: 0,
    imej: 60, tegang: 10, sekatan: 0, buff: { propaganda: 0, proksi: 0, palsu: 0 }, opsCd: {}, opsLog: [], doktrin: 'kilat',
    stat: { naik: 0, menang: 0, kalah: 0, derma: 0, kumpulDana: 0, kumpul: 0, latih: 0, bintang3: 0, bintang: 0, kuiz: 0, pertahan: 0, serang: 0, latihDron: 0, latihKebal: 0, gotong: 0, ops: 0, bongkar: 0, ops_propaganda: 0, ops_proksi: 0, ops_benderapalsu: 0, ops_diplomasi: 0, sekatan: 0 },
    capai: {}, hikayat: {}, hikayatBaru: 0, laporan: [], laporanBaru: 0, perisai: 0, lastSeen: t, kempen: [],
    kuiz: { hari: '', jawab: 0 }, bunyi: true,
  };
}
function simpan() { if (!S) return; S.lastSeen = kini(); try { localStorage.setItem(KUNCI, JSON.stringify(S, (k, v) => k === 'letak' ? undefined : v)); } catch (e) { /* storan disekat */ } }
function muat() { try { const j = localStorage.getItem(KUNCI); if (j) { const o = JSON.parse(j); if (o && o.v === 1 && Array.isArray(o.bld)) return o; } } catch (e) { } return null; }

/* ================= Peraturan ================= */
const markas = () => S.bld.find(b => b.t === 'markas');
const istLv = () => markas().lv;
const bil = t => S.bld.filter(b => b.t === t).length;
const aktif = b => b.lv >= 1 && !b.busy;
const adaAktif = t => S.bld.some(b => b.t === t && b.lv >= 1);
function maxLvUntuk(t, L) {
  const d = B[t];
  if (t === 'markas') return 7;
  if (t === 'pos_komando') return clamp(L * 2 - 7, 0, 7);
  if (t === 'pos_elit') return clamp(L * 2 - 11, 0, 7);
  if (t === 'periuk_api') return Math.min(d.max, Math.ceil(L / 2));
  if (t === 'makmal') return clamp(L - 2, 0, d.max);
  if (t === 'pusat_pakatan') return clamp(L - 1, 0, d.max);
  return Math.min(d.max, L + 1);
}
const maxLv = t => maxLvUntuk(t, istLv());
const had = t => t === 'markas' ? 1 : BIL[t][istLv() - 1];
function bukaPada(t) { for (let L = 1; L <= 7; L++) if (BIL[t][L - 1] > 0) return L; return 8; }
function kos(t, lv) {
  const d = B[t];
  if (t === 'markas') return ['dana', KOS_ISTANA[lv - 1]];
  if (t === 'pejabat_jurutera') return ['intel', KOS_BANGSAL[bil('pejabat_jurutera')] ?? 900];
  if (d.hero) return lv === 1 ? ['dana', d.kos[1]] : ['nadir', Math.round(800 * Math.pow(1.55, lv - 2))];
  return [d.kos[0], Math.round(d.kos[1] * Math.pow(d.kos[2], lv - 1))];
}
const masaBina = (t, lv) => B[t].tb ? Math.round(B[t].tb * T_MUL[lv - 1]) : 0;
const hpBangunan = (t, lv) => Math.round(B[t].hp * Math.pow(t === 'tembok' ? 1.7 : 1.25, lv - 1));
const dmgPertahanan = (t, lv) => B[t].def.dmg * Math.pow(1.28, lv - 1);
const kadar = b => B[b.t].kadar * Math.pow(1.6, b.lv - 1) * (S ? bonusSumber(B[b.t].hasil) * kadarSekatan() : 1);
const capPengumpul = b => kadar(b) * 1200;
function capSumber(r) {
  if (r === 'intel') return Infinity;
  const L = istLv(); let c = r === 'nadir' ? ISTANA_TIMAH[L - 1] : CAP_ISTANA[L - 1];
  for (const b of S.bld) if (B[b.t].simpan === r && b.lv >= 1) c += (r === 'nadir' ? CAP_TIMAH : CAP_SIMPAN)[b.lv - 1];
  return c;
}
function tambah(r, n) { const c = capSumber(r), dulu = S.res[r]; S.res[r] = Math.max(dulu, Math.min(c, dulu + n)); return S.res[r] - dulu; }
const cukup = ([r, n]) => S.res[r] >= n;
function bayar(k) { if (!cukup(k)) return false; S.res[k[0]] -= k[1]; return true; }
const jumlahTukang = () => bil('pejabat_jurutera');
const tukangSibuk = () => S.bld.filter(b => b.busy).length;
const tukangLapang = () => jumlahTukang() - tukangSibuk();
const ruangTentera = () => S.bld.reduce((c, b) => c + (b.t === 'kem' && b.lv >= 1 ? KEM_CAP[b.lv - 1] : 0), 0);
const ruangGuna = () => Object.entries(S.army).reduce((c, [k, n]) => c + TR[k].ruang * n, 0);
const ruangGilir = () => S.gilir.reduce((c, k) => c + TR[k].ruang, 0);
const balaiMaks = () => S.bld.reduce((m, b) => b.t === 'berek' ? Math.max(m, b.lv) : m, 0);
const capBantuan = () => { const b = S.bld.find(x => x.t === 'pusat_pakatan'); return b && b.lv >= 1 ? 5 + 5 * b.lv : 0; };
const ruangBantuan = () => S.bantuan.reduce((c, k) => c + TR[k].ruang, 0);
const maxKaji = () => { const b = S.bld.find(x => x.t === 'makmal'); return b && b.lv >= 1 ? b.lv + 1 : 1; };
const kosKaji = (k, lv) => Math.round(KOS_KAJI[k] * Math.pow(2.3, lv - 2));
const ligaDari = m => { let l = LIGA[0]; for (const x of LIGA) if (m >= x.min) l = x; return l; };
const pangkat = () => Math.floor(Math.sqrt(S.xp / 40)) + 1;
function tambahXP(n) { const p = pangkat(); S.xp += n; if (pangkat() > p) { toast(`Pangkat naik ke ${pangkat()}!`); sfx('siap'); } }
const namaBangunan = (t, lv) => t === 'tembok' ? (lv >= 6 ? 'Tembok Konkrit Bertetulang' : lv >= 4 ? 'Tembok Konkrit' : 'Beg Pasir') : (asetSlot(t) || B[t]).n;
const wiraSedia = k => { const b = S.bld.find(x => x.t === WIRA[k].bina); return b && b.lv >= 1 && !b.busy ? b.lv : 0; };
/* Negara pemain: kekuatan sumber dalam dataset memberi bonus kecil. */
const negaraKu = () => NEGARA.find(n => n.k === S.negara) || NEGARA.find(n => n.k === 'MY');
const negaraDari = k => NEGARA.find(n => n.k === k);
/* Aset negara: nama sebenar dan mod imbangan untuk setiap slot permainan (lihat ASET dalam data.js). */
const asetSlot = slot => (S && ASET[S.negara] || []).find(a => a.slot === slot);
const modAset = slot => (asetSlot(slot) || {}).mod || {};
const namaUnit = k => (asetSlot(k) || TR[k] || WIRA[k]).n;
const namaTaktik = k => (asetSlot(k) || TAKTIK[k]).n;
const kosUnit = k => Math.round(TR[k].kos * (modAset(k).kos || 1));
const namaSlot = k => (TR[k] || B[k] || TAKTIK[k] || {}).n;
const BONUS_KUAT = { minyak: ['minyak', 1.2], nadir: ['nadir', 1.3], kewangan: ['dana', 1.2], teknologi: ['kaji', .8] };
function bonusSumber(r) { let f = 1; for (const k of negaraKu().kuat || []) { const b = BONUS_KUAT[k]; if (b && b[0] === r) f *= b[1]; } return f; }
const disekat = () => S.sekatan > kini();
const kadarSekatan = () => disekat() ? .7 : 1;
const ketegangan = () => clamp(Math.round(S.tegang), 0, 100);
function ubahImej(n) { S.imej = clamp(S.imej + n, 0, 100); if (S.imej < 30 && !disekat()) kenaSekatan(20); }
function kenaSekatan(min) { S.sekatan = Math.max(S.sekatan, kini()) + min * 60e3; S.stat.sekatan++; toast(`Sekatan ekonomi dikenakan selama ${min} minit: hasil −30%.`, true); semakHikayat(); }
function sekutuBlok() {
  const n = negaraKu(), blok = new Set(n.blok), out = [];
  for (const x of NEGARA) if (x.k !== n.k && (x.blok.some(b => blok.has(b)) || (n.sekutu || []).includes(x.k)) && !(n.seteru || []).includes(x.k)) out.push(x);
  return out;
}

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
  // ketegangan reda dan imej pulih perlahan-lahan dengan masa
  const dtm = Math.max(0, (t - (S.detikDunia || t)) / 60e3); S.detikDunia = t;
  if (dtm > 0) { S.tegang = Math.max(0, S.tegang - dtm * .8); if (S.imej < 60) S.imej = Math.min(60, S.imej + dtm * .25); }
  if (S.kaji && t >= S.kaji.until) {
    S.troopLv[S.kaji.k] = S.kaji.lv; toast(`Kajian siap: ${TR[S.kaji.k].n} kini tahap ${S.kaji.lv}`); sfx('siap'); S.kaji = null; perluRender = true;
  }
  semakLangkah();
}
function siapBina(b) {
  const lv = b.busy.toLv; b.lv = lv; b.busy = null;
  tambahXP(b.t === 'markas' ? 50 * lv : 6 * lv + 4);
  S.stat.naik++; misi('naik');
  if (b.t === 'pusat_pakatan') bukaPuak();
  toast(`${namaBangunan(b.t, lv)} siap, kini tahap ${lv}`); sfx('siap');
  if (b.t === 'markas') setTimeout(() => paparEra(lv), 200);
  semakHikayat(); perluRender = true;
  if (pilihan === b) paparPanel();
}
function prosesGilir(t) {
  const n = S.bld.filter(b => b.t === 'berek' && aktif(b)).length;
  if (!S.gilir.length || !n) { S.gilirMula = t; return; }
  let jaga = 0;
  while (S.gilir.length && jaga++ < 400) {
    const k = S.gilir[0], perlu = TR[k].masa * 1000 / n;
    if (ruangGuna() + TR[k].ruang > ruangTentera()) { S.gilirMula = t; break; }
    if (t - S.gilirMula < perlu) break;
    S.gilir.shift(); S.army[k] = (S.army[k] || 0) + 1; S.gilirMula += perlu;
    S.stat.latih++; misi('latih');
    if (k === 'kereta_kebal') S.stat.latihKebal++;
    if (k === 'dron') S.stat.latihDron++;
    perluRender = true;
  }
  if (!S.gilir.length) S.gilirMula = t;
  semakHikayat();
}

/* ================= Fail Risikan, misi, pencapaian, langkah ================= */
const SYARAT = {
  mula: () => true, melaka: () => istLv() >= 2, hormuz: () => istLv() >= 3, udara: () => adaAktif('pertahanan_udara'),
  dron: () => S.stat.latihDron > 0, nadir: () => adaAktif('lombong_nadir'), cip: () => adaAktif('makmal'),
  nato: () => adaAktif('pusat_pakatan'), asean: () => S.stat.menang >= 3, propaganda: () => S.stat.ops_propaganda > 0,
  proksi: () => S.stat.ops_proksi > 0, benderapalsu: () => S.stat.ops_benderapalsu > 0, sekatan: () => S.stat.sekatan > 0,
  nuklear: () => istLv() >= 6, lcs: () => S.stat.menang >= 10, suez: () => istLv() >= 4, asimetri: () => S.stat.pertahan >= 3,
  berkecuali: () => S.stat.gotong >= 1,
};
function semakHikayat(senyap) {
  for (const h of HIKAYAT) {
    if (S.hikayat[h.k] || !SYARAT[h.k]()) continue;
    S.hikayat[h.k] = kini(); S.hikayatBaru++;
    if (!senyap && h.k !== 'mula') toast(`Fail Risikan baharu: ${h.t}`);
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
  { t: 'Ketik Zon Industri untuk mengutip dana negara yang sudah terkumpul.', ok: () => S.stat.kumpulDana > 0, g: ['dana', 200] },
  { t: 'Naik taraf Artileri supaya pangkalan lebih selamat daripada serangan.', ok: () => S.bld.some(b => b.t === 'artileri' && (b.lv >= 2 || b.busy)), g: ['minyak', 300] },
  { t: 'Latih 5 Infantri di Berek Tentera.', ok: () => S.stat.latih >= 5, g: ['intel', 5] },
  { t: 'Tekan Operasi, kemudian menangi Latihan Pos Hadapan dalam tab Latihan OPFOR.', ok: () => (S.kempen[0] || 0) > 0, g: ['dana', 500] },
  { t: 'Bina 5 Beg Pasir di sekeliling Markas. Buka menu Bina, tab Pertahanan.', ok: () => bil('tembok') >= 5, g: ['minyak', 500] },
  { t: 'Naik taraf Markas Komando ke tahap 2 untuk membuka fasa Pangkalan Serantau.', ok: () => istLv() >= 2 || !!markas().busy, g: ['intel', 10] },
];
function semakLangkah() {
  const l = LANGKAH[S.langkah];
  if (!l || !l.ok()) return;
  if (l.g[0] === 'intel') S.res.intel += l.g[1]; else tambah(l.g[0], l.g[1]);
  toast(`Tugasan selesai! +${fmtN(l.g[1])} ${SUMBER[l.g[0]].n}`); sfx('kutip');
  S.langkah++; nasihatSeterus = 0;
}

/* ================= Pakatan (simulasi) ================= */
const namaPakatan = () => { const n = negaraKu(), b = n.blok.find(x => ['NATO', 'ASEAN', 'CSTO', 'GCC', 'SCO', 'KA', 'EU', 'BRICS', 'QUAD', 'AUKUS', 'G7'].includes(x)); return b ? `${NAMA_PUAK} ${b}` : `${NAMA_PUAK} Bebas`; };
function bukaPuak() {
  if (S.puak) return;
  const r = rng(cincang(S.negara || 'MY')), calon = sekutuBlok().sort((a, b) => b.belanja - a.belanja).slice(0, 9);
  while (calon.length < 5) { const x = pilih(NEGARA, r); if (x.k !== S.negara && !calon.includes(x)) calon.push(x); }
  const ahli = calon.map((x, i) => ({ n: `${pilih(NAMA_KOMANDER, r)} (${x.n})`, k: x.k, lv: clamp(Math.round(tierNegara(x) * .6 + istLv() * .4 + r() - .5), 1, 7), maruah: Math.round(80 + r() * 380 + tierNegara(x) * 30 + i * 4), derma: Math.floor(r() * 40) }));
  S.puak = { nama: namaPakatan(), ahli, chat: [], idSeterus: 1, seterus: kini() + 8000, mintaLagi: 0, minta: null, goal: goalBaru(), belumBaca: 0 };
  chat({ sys: true, t: `${negaraKu().n} menyertai ${S.puak.nama}.` });
  chat({ dari: ahli[0].n, t: 'Selamat datang ke pakatan! Minta bantuan unit bila perlu, kami hantar.' });
}
function goalBaru() { const L = istLv(); return { sasaran: 15000 * L, prog: Math.round(1500 * L * acak()), aku: 0, g: { intel: 30 + L * 10, dana: 1500 * L, minyak: 1500 * L } }; }
function chat(m) { const p = S.puak; m.id = p.idSeterus++; m.masa = kini(); p.chat.push(m); if (p.chat.length > 50) p.chat.splice(0, p.chat.length - 50); if (!m.aku) p.belumBaca++; perluRenderPuak = true; }
function jenisDibuka() { const m = balaiMaks(); return Object.keys(TR).filter(k => TR[k].buka <= Math.max(1, m)); }
function puakDetik() {
  const p = S.puak; if (!p) return;
  const t = kini();
  // bantuan untuk permintaan pemain
  if (p.minta && acak() < .25) {
    const cap = capBantuan(), baki = cap - ruangBantuan();
    if (baki <= 0) { p.minta = null; chat({ sys: true, t: 'Pusat Pakatan kau sudah penuh dengan bantuan.' }); }
    else {
      const a = pilih(p.ahli), jenis = Object.keys(TR).filter(k => TR[k].buka <= Math.min(6, a.lv + 1) && TR[k].ruang <= baki);
      const k = p.minta.k && TR[p.minta.k].ruang <= baki && acak() < .7 ? p.minta.k : pilih(jenis.length ? jenis : ['infantri']);
      const n = Math.max(1, Math.min(Math.floor(baki / TR[k].ruang), 1 + Math.floor(acak() * 3)));
      for (let i = 0; i < n; i++) S.bantuan.push(k);
      a.derma += n; chat({ sys: true, t: `${a.n} menghantar ${n} ${TR[k].n} kepada kau.` });
      if (ruangBantuan() >= cap) p.minta = null;
    }
  }
  if (t < p.seterus) return;
  p.seterus = t + (18 + acak() * 30) * 1000;
  const a = pilih(p.ahli), roll = acak();
  if (roll < .3) {
    const pilihan2 = jenisDibuka(), k = pilih(pilihan2);
    const perlu = TR[k].ruang >= 4 ? 1 : TR[k].ruang === 2 ? 2 : 3 + Math.floor(acak() * 3);
    chat({ dari: a.n, t: `Sesiapa ada ${TR[k].n}? Ada operasi ke atas ${pilih(NAMA_LAWAN)} kejap lagi.`, minta: { k, perlu, dapat: 0 } });
  } else if (roll < .48) chat({ dari: a.n, t: pilih(SEMBANG.tip) });
  else if (roll < .6) chat({ dari: a.n, t: pilih(SEMBANG.salam) });
  else if (roll < .78) chat({ dari: a.n, t: pilih(SEMBANG.bangga) });
  else chat({ dari: a.n, t: pilih(SEMBANG.ilmu) });
  // ahli lain menolong permintaan lama
  for (const m of p.chat) if (m.minta && m.minta.dapat < m.minta.perlu && acak() < .35) m.minta.dapat++;
  // operasi bersama bergerak
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
    case 'misil': hingar(.35, .12, 2200); nada(600, .3, 'sawtooth', .03, 1400); break;
    case 'bom': hingar(.5, .3, 400); nada(70, .4, 'sine', .2, 30); break;
    case 'runtuh': hingar(.6, .25, 700); break;
    case 'pukul': hingar(.05, .07, 3000); break;
    case 'gong': nada(196, 1.4, 'sine', .16, 190); nada(392, .9, 'sine', .05); break;
    case 'menang': [392, 494, 587, 784, 988].forEach((f, i) => nada(f, .3, 'triangle', .1, 0, i * .12)); break;
    case 'kalah': [392, 330, 262].forEach((f, i) => nada(f, .35, 'triangle', .09, 0, i * .18)); break;
  }
}

/* ================= Kanvas, kamera & lapisan atas =================
   Dunia dilukis dalam 3D oleh grafik.js pada #gl. Kanvas #cv di atasnya menerima sentuhan
   dan melukis bar nyawa, gelembung hasil dan teks terapung. */
const cv = $('#cv');
let ctx = cv.getContext('2d');
let W = 0, H = 0, DPR = 1;
const ZMIN = .5, ZMAX = 3.5; // zoom kamera ortografik: tinggi pandangan = 40 / z unit dunia
const cam = { x: G / 2, y: G / 2, z: 1 };
function ubahSaiz() { DPR = Math.min(2, window.devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR); G3.saiz(W, H, DPR); hadKamera(); }
const skrinKeDunia = (sx, sy) => G3.skrinKeDunia(sx, sy);
function hadKamera() { cam.z = clamp(cam.z, ZMIN, ZMAX); cam.x = clamp(cam.x, -4, G + 4); cam.y = clamp(cam.y, -4, G + 6); }
function kameraAsal() {
  // muatkan kira-kira 24 unit lebar (potret) atau 27 unit tinggi (landskap) pangkalan
  const asp = W / Math.max(1, H), vh = Math.max(24 / asp, 27);
  cam.x = G / 2; cam.y = G / 2 + .5; cam.z = 40 / vh; hadKamera();
}
function kunciTitik(sx, sy, gx, gy) { const [a, b] = skrinKeDunia(sx, sy); cam.x += gx - a; cam.y += gy - b; hadKamera(); }
function zoomDi(sx, sy, z) { const [gx, gy] = skrinKeDunia(sx, sy); cam.z = clamp(z, ZMIN, ZMAX); kunciTitik(sx, sy, gx, gy); }
function bulat(x, y, r, c) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = c; ctx.fill(); }
function garis(x1, y1, x2, y2, w, c) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineWidth = w; ctx.strokeStyle = c; ctx.lineCap = 'round'; ctx.stroke(); }
function lukis(ts, dt) {
  G3.render(ts);
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.clearRect(0, 0, W, H);
  if (mode === 'perang' && BT) lukisAtasPerang(); else lukisAtasKampung(ts);
  lukisApungan(dt);
}
function tenteraKem() {
  const out = [], kem = S.bld.filter(b => b.t === 'kem' && b.lv >= 1); if (!kem.length) return out;
  const jenis = []; for (const [k, n] of Object.entries(S.army)) for (let i = 0; i < Math.min(n, 8); i++) jenis.push(k);
  const per = Math.ceil(Math.min(jenis.length, 14 * kem.length) / kem.length);
  kem.forEach((b, ki) => {
    const sub = jenis.slice(ki * per, ki * per + per), kx = b.x + 1.5, ky = b.y + 1.5;
    sub.forEach((t, i) => { const a = i / Math.max(1, sub.length) * Math.PI * 2 + ki, r = TR[t].ruang >= 5 ? 1.05 : .62 + (i % 2) * .3; out.push({ t, x: kx + Math.cos(a) * r, y: ky + Math.sin(a) * r, kx, ky }); });
  });
  return out;
}
function lukisAtasKampung(ts) {
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (const b of S.bld) {
    const s = B[b.t].s, h = G3.tinggi(b.t, b.lv);
    if (b.busy) {
      const [x, y] = G3.ke2D(b.x + s / 2, b.y + s / 2, h + .45), w = 58, f = clamp((kini() - b.busy.mula) / (b.busy.until - b.busy.mula), 0, 1);
      ctx.fillStyle = 'rgba(10,6,3,.8)'; ctx.fillRect(x - w / 2 - 2, y - 7, w + 4, 14);
      ctx.fillStyle = '#6fcf4a'; ctx.fillRect(x - w / 2, y - 5, w * f, 10);
      ctx.font = '700 10px Andika, sans-serif'; ctx.fillStyle = '#fff'; ctx.fillText(masa((b.busy.until - kini()) / 1000), x, y + .5);
    } else if (B[b.t].hasil && b.lv >= 1 && b.store >= Math.max(5, capPengumpul(b) * .06)) {
      const [x, y] = G3.ke2D(b.x + s / 2, b.y + s / 2, h + .75), bob = Math.sin(ts * 3 + b.id) * 3, penuh = b.store >= capPengumpul(b) * .999;
      ctx.fillStyle = 'rgba(10,6,3,.35)'; ctx.beginPath(); ctx.ellipse(x, y + 18, 8, 3, 0, 0, 7); ctx.fill();
      ctx.fillStyle = penuh ? '#fff6c8' : '#ffffff'; ctx.strokeStyle = '#140c07'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(x, y + bob, 14, 0, 7); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x - 5, y + bob + 12); ctx.lineTo(x, y + bob + 19); ctx.lineTo(x + 5, y + bob + 12); ctx.fill();
      lukisIkonSumber(B[b.t].hasil, x, y + bob, 8);
    }
  }
}
function lukisIkonSumber(r, x, y, rr) {
  if (r === 'dana') { bulat(x, y, rr, '#f6c431'); ctx.strokeStyle = '#7a4f00'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(x, y, rr, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.arc(x, y, rr * .5, 0, 7); ctx.stroke(); }
  else if (r === 'minyak') { ctx.fillStyle = '#3a3f4a'; ctx.strokeStyle = '#0e1014'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x, y - rr); ctx.quadraticCurveTo(x + rr * .9, y + rr * .1, x + rr * .65, y + rr * .5); ctx.arc(x, y + rr * .35, rr * .68, .2, Math.PI - .2); ctx.quadraticCurveTo(x - rr * .9, y + rr * .1, x, y - rr); ctx.fill(); ctx.stroke(); }
  else if (r === 'nadir') { ctx.fillStyle = '#7fd6c2'; ctx.strokeStyle = '#1d4b44'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x, y - rr); ctx.lineTo(x + rr * .75, y - rr * .2); ctx.lineTo(x, y + rr); ctx.lineTo(x - rr * .75, y - rr * .2); ctx.closePath(); ctx.fill(); ctx.stroke(); }
  else if (r === 'intel') { ctx.fillStyle = '#dfe8ff'; ctx.strokeStyle = '#1b2a4a'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(x, y, rr, rr * .6, 0, 0, 7); ctx.fill(); ctx.stroke(); bulat(x, y, rr * .38, '#4f7bd9'); }
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
    const m0 = [(a.x + b.x) / 2, (a.y + b.y) / 2];
    gerak = { jenis: 'cubit', d0: Math.hypot(a.x - b.x, a.y - b.y) || 1, z0: cam.z, g0: skrinKeDunia(m0[0], m0[1]) };
    batalTahan(); return;
  }
  const [gx, gy] = skrinKeDunia(e.clientX, e.clientY);
  let seret = false, ox = 0, oy = 0;
  if (S.letak && mode === 'kampung') {
    const s = B[S.letak.t].s;
    if (gx >= S.letak.x - .5 && gx < S.letak.x + s + .5 && gy >= S.letak.y - .5 && gy < S.letak.y + s + .5) { seret = true; ox = gx - S.letak.x; oy = gy - S.letak.y; }
  }
  gerak = { jenis: 'tekan', x0: e.clientX, y0: e.clientY, g0: [gx, gy], gerak: false, seret, ox, oy };
  if (mode === 'perang') mulaTahan(e.clientX, e.clientY);
});
cv.addEventListener('pointermove', e => {
  const p = jari.get(e.pointerId); if (!p) return;
  p.x = e.clientX; p.y = e.clientY;
  if (!gerak) return;
  if (gerak.jenis === 'cubit' && jari.size >= 2) {
    const [a, b] = [...jari.values()];
    cam.z = clamp(gerak.z0 * Math.hypot(a.x - b.x, a.y - b.y) / gerak.d0, ZMIN, ZMAX);
    kunciTitik((a.x + b.x) / 2, (a.y + b.y) / 2, gerak.g0[0], gerak.g0[1]);
  } else if (gerak.jenis === 'tekan') {
    const dx = e.clientX - gerak.x0, dy = e.clientY - gerak.y0;
    if (!gerak.gerak && Math.hypot(dx, dy) > 9) { gerak.gerak = true; if (!(tahan && tahan.aktif)) batalTahan(); }
    if (!gerak.gerak) return;
    if (tahan && tahan.aktif) { tahan.x = e.clientX; tahan.y = e.clientY; return; }
    if (gerak.seret && S.letak) {
      const [gx, gy] = skrinKeDunia(e.clientX, e.clientY), s = B[S.letak.t].s;
      S.letak.x = clamp(Math.round(gx - gerak.ox), 0, G - s); S.letak.y = clamp(Math.round(gy - gerak.oy), 0, G - s);
    } else kunciTitik(e.clientX, e.clientY, gerak.g0[0], gerak.g0[1]);
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
const cariBangunanSkrin = (sx, sy) => G3.pilihDi(sx, sy);
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
  const r = B[b.t].hasil, dapat = Math.floor(tambah(r, r === 'intel' ? Math.floor(b.store) : Math.floor(b.store)));
  if (dapat <= 0) { toast(`Simpanan ${SUMBER[r].n} penuh. Naik taraf ${r === 'dana' ? 'Bank Pusat' : r === 'minyak' ? 'Depot Bahan Api' : 'Gudang Unsur Nadir'}.`, true); return; }
  b.store -= dapat;
  if (r === 'dana') S.stat.kumpulDana += dapat;
  S.stat.kumpul += dapat; misi('kumpul', dapat);
  apungTeks(b, `+${fmtN(dapat)}`, SUMBER[r].w);
  sfx('kutip'); semakLangkah(); kemaskiniHUD();
}
let apungan = [];
function apungTeks(b, txt, w) { const s = B[b.t].s; apungan.push({ x: b.x + s / 2, y: b.y + s / 2, z: G3.tinggi(b.t, b.lv) + .3, txt, w, t: 0 }); }
function naikTaraf(b) {
  if (b.busy) return;
  const lvB = b.lv + 1;
  if (lvB > maxLv(b.t)) { toast(b.t === 'markas' ? 'Markas sudah di tahap tertinggi.' : 'Naik taraf Markas Komando dahulu untuk membuka tahap seterusnya.', true); sfx('salah'); return; }
  const k = kos(b.t, lvB), tm = masaBina(b.t, lvB);
  if (tm > 0 && tukangLapang() <= 0) { toast('Semua jurutera sedang sibuk. Tunggu siap atau bina Pejabat Jurutera.', true); sfx('salah'); return; }
  if (k[1] > capSumber(k[0])) { toast(`Simpanan ${SUMBER[k[0]].n} terlalu kecil (${fmtK(capSumber(k[0]))}). Naik taraf atau tambah gudang.`, true); sfx('salah'); return; }
  if (!bayar(k)) { toast(`${SUMBER[k[0]].n} tidak cukup. Perlu ${fmtN(k[1])}, ada ${fmtN(S.res[k[0]])}.`, true); sfx('salah'); return; }
  if (tm <= 0) { b.lv = lvB; S.stat.naik++; misi('naik'); tambahXP(2); semakHikayat(); toast(`${namaBangunan(b.t, lvB)} kini tahap ${lvB}`); }
  else b.busy = { until: kini() + tm * 1000, toLv: lvB, mula: kini() };
  sfx('bina'); paparPanel(); kemaskiniHUD(); simpan(); semakLangkah();
}
const kosPercepat = b => Math.max(1, Math.ceil((b.busy.until - kini()) / 1000 / 40));
function percepat(b) {
  if (!b.busy) return; const c = kosPercepat(b);
  if (S.res.intel < c) { toast(`Intel tidak cukup. Perlu ${c}.`, true); sfx('salah'); return; }
  S.res.intel -= c; b.busy.until = kini(); kemaskini(kini()); kemaskiniHUD(); simpan();
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
  cam.x = tempat[0] + B[t].s / 2; cam.y = tempat[1] + B[t].s / 2; hadKamera();
}
function mulaPindah(b) { S.letak = { t: b.t, x: b.x, y: b.y, baru: false, b }; pilihan = null; paparPanel(); paparLetak(); }
function batalLetak() { S.letak = null; paparLetak(); paparPanel(); }
function sahLetak() {
  const L = S.letak; if (!L) return;
  if (!bolehLetak(L.t, L.x, L.y, L.b)) { toast('Tidak boleh diletak di situ. Pilih kawasan hijau.', true); sfx('salah'); return; }
  if (!L.baru) { L.b.x = L.x; L.b.y = L.y; S.letak = null; pilihan = L.b; sfx('bina'); paparLetak(); paparPanel(); simpan(); return; }
  const t = L.t, k = kos(t, 1), tm = masaBina(t, 1);
  if (bil(t) >= had(t)) { toast(`Had ${B[t].n} untuk Markas tahap ${istLv()} sudah dicapai.`, true); batalLetak(); return; }
  if (tm > 0 && tukangLapang() <= 0) { toast('Semua jurutera sedang sibuk.', true); sfx('salah'); return; }
  if (k[0] !== 'intel' && k[1] > capSumber(k[0])) { toast(`Simpanan ${SUMBER[k[0]].n} terlalu kecil.`, true); sfx('salah'); return; }
  if (!bayar(k)) { toast(`${SUMBER[k[0]].n} tidak cukup. Perlu ${fmtN(k[1])}.`, true); sfx('salah'); return; }
  const b = { id: S.nextId++, t, x: L.x, y: L.y, lv: tm > 0 ? 0 : 1, busy: tm > 0 ? { until: kini() + tm * 1000, toLv: 1, mula: kini() } : null, store: 0, last: kini() };
  S.bld.push(b); sfx('bina');
  if (tm === 0) { S.stat.naik++; misi('naik'); semakHikayat(); }
  if (t === 'pejabat_jurutera') toast('Pasukan jurutera baharu sedia bekerja!');
  semakLangkah();
  if (t === 'tembok' || t === 'periuk_api') {
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
    if (balaiMaks() < d.buka) { toast(`Naik taraf Berek Tentera ke tahap ${d.buka} untuk melatih ${namaUnit(k)}.`, true); sfx('salah'); return; }
    if (ruangGuna() + ruangGilir() + d.ruang > ruangTentera()) { toast('Kem Tentera sudah penuh. Naik taraf atau bina Kem baharu.', true); sfx('salah'); return; }
    if (S.res.minyak < kosUnit(k)) { toast(`Minyak tidak cukup untuk ${namaUnit(k)}.`, true); sfx('salah'); return; }
    S.res.minyak -= kosUnit(k); if (!S.gilir.length) S.gilirMula = kini(); S.gilir.push(k);
  }
  sfx('ketik'); kemaskiniHUD(); perluRender = true;
}
function batalGilir(i) { const k = S.gilir[i]; if (!k) return; S.gilir.splice(i, 1); tambah('minyak', kosUnit(k)); if (i === 0) S.gilirMula = kini(); perluRender = true; kemaskiniHUD(); }
function mulaKaji(k) {
  const lv = S.troopLv[k] + 1;
  if (S.kaji) { toast('Makmal sedang menjalankan kajian lain.', true); return; }
  const bi = S.bld.find(x => x.t === 'makmal'); if (!bi || !aktif(bi)) { toast('Makmal sedang dinaik taraf atau belum siap.', true); return; }
  if (lv > maxKaji()) { toast('Naik taraf Makmal untuk kajian tahap lebih tinggi.', true); return; }
  if (balaiMaks() < TR[k].buka) { toast(`Buka ${TR[k].n} di Berek Tentera dahulu.`, true); return; }
  const c = kosKaji(k, lv);
  if (c > capSumber('minyak')) { toast('Simpanan minyak terlalu kecil untuk kajian ini.', true); return; }
  if (!bayar(['minyak', c])) { toast(`Minyak tidak cukup. Perlu ${fmtN(c)}.`, true); sfx('salah'); return; }
  S.kaji = { k, lv, until: kini() + Math.round(MASA_KAJI[lv] * bonusSumber('kaji')) * 1000, mula: kini() }; sfx('bina'); perluRender = true; kemaskiniHUD(); simpan();
}

/* ================= Perang ================= */
function janaPangkalan(L, seed) {
  const r = rng(seed), occ = new Set(), blds = []; let id = 1;
  const muat = (x, y, s) => { if (x < 1 || y < 1 || x + s > G - 1 || y + s > G - 1) return false; for (let i = x; i < x + s; i++) for (let j = y; j < y + s; j++) if (occ.has(i + ',' + j)) return false; return true; };
  const letak = (t, x, y, lv) => { const s = B[t].s; for (let i = x; i < x + s; i++) for (let j = y; j < y + s; j++) occ.add(i + ',' + j); blds.push({ id: id++, t, x, y, lv }); };
  const lvR = t => { const m = Math.max(1, maxLvUntuk(t, L) - 1); return clamp(m - Math.floor(r() * 1.6), 1, m); };
  letak('markas', 10, 10, L);
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
  const dalam = ['pelancar_roket', 'pertahanan_udara', 'radar', 'bank', 'depot_minyak', 'gudang_nadir', 'artileri', 'menara_mesingan', 'pusat_pakatan', 'makmal'];
  const luar = ['zon_industri', 'telaga_minyak', 'lombong_nadir', 'pusat_risikan', 'berek', 'kem', 'pejabat_jurutera'];
  const cubaLetak = (t, kawasan) => {
    const s = B[t].s;
    for (let n = 0; n < 220; n++) {
      const x = kawasan[0] + Math.floor(r() * (kawasan[1] - kawasan[0] - s + 2)), y = kawasan[0] + Math.floor(r() * (kawasan[1] - kawasan[0] - s + 2));
      if (muat(x, y, s)) { letak(t, x, y, lvR(t)); return true; }
    }
    return false;
  };
  for (const t of dalam) {
    const n = t === 'pejabat_jurutera' ? 2 : BIL[t][L - 1];
    for (let i = 0; i < n; i++) if (!cubaLetak(t, ruangDalam)) cubaLetak(t, [1, G - 2]);
  }
  for (const t of luar) {
    const n = t === 'pejabat_jurutera' ? 2 + Math.floor(L / 2) : BIL[t][L - 1];
    for (let i = 0; i < n; i++) cubaLetak(t, [1, G - 2]);
  }
  const kotaLv = lvR('tembok');
  for (const [x, y] of dinding) blds.push({ id: id++, t: 'tembok', x, y, lv: kotaLv });
  for (let i = 0; i < BIL.periuk_api[L - 1]; i++) for (let n = 0; n < 60; n++) { const x = ruangDalam[0] + Math.floor(r() * (ruangDalam[1] - ruangDalam[0])), y = ruangDalam[0] + Math.floor(r() * (ruangDalam[1] - ruangDalam[0])); if (muat(x, y, 1)) { letak('periuk_api', x, y, lvR('periuk_api')); break; } }
  const asas = [600, 1500, 4000, 9000, 18000, 32000, 50000][L - 1], m = .5 + r(), karam = r() < .1;
  const f = karam ? 2.5 : 1;
  return { blds, karam, loot: { dana: Math.round(asas * m * f), minyak: Math.round(asas * m * (.8 + r() * .4) * f), nadir: L >= 5 ? Math.round(asas * .035 * m * f) : 0 } };
}
/* Logistik: kos minyak ikut jarak; pangkalan sekutu berdekatan (pakatan) memberi diskaun. */
function kosLogistik(lw) {
  const asas = lw.jarak * .06 * (.7 + istLv() * .3);
  const diskaun = (S.puak ? .25 : 0) + (negaraKu().kuat.includes('minyak') ? .1 : 0);
  return { kos: Math.round(asas * (1 - diskaun)), diskaun };
}
function mulaPerang(lawan) {
  const pg = janaPangkalan(lawan.L, lawan.seed);
  const mf = lawan.jenis === 'kempen' && (S.kempen[lawan.idx] || 0) > 0 ? .3 : 1;
  const hpF = S.buff.proksi > 0 ? .8 : 1;
  const blds = pg.blds.map(b => ({ ...b, maxHp: hpBangunan(b.t, b.lv) * (B[b.t].def || b.t === 'radar' ? hpF : 1), hp: hpBangunan(b.t, b.lv) * (B[b.t].def || b.t === 'radar' ? hpF : 1), mati: false, cd: acak(), sudut: Math.PI / 4, kena: 0, kilat: 0 }));
  // agihan rampasan
  for (const r of ['dana', 'minyak', 'nadir']) {
    const jum = pg.loot[r] * mf; if (!jum) continue;
    const gudang = blds.filter(b => B[b.t].simpan === r), pungut = blds.filter(b => B[b.t].hasil === r), ist = blds.find(b => b.t === 'markas');
    const bahagi = (arr, n) => { for (const b of arr) { b.loot = b.loot || { dana: 0, minyak: 0, nadir: 0 }; b.loot[r] += n / arr.length; } };
    if (gudang.length) bahagi(gudang, jum * .7); else bahagi([ist], jum * .7);
    if (pungut.length) bahagi(pungut, jum * .2); else bahagi([ist], jum * .2);
    bahagi([ist], jum * .1);
  }
  for (const b of blds) if (b.loot) { b.lootBaki = { ...b.loot }; b.lootJum = b.loot.dana + b.loot.minyak + b.loot.nadir; }
  const sekat = new Set();
  for (const b of blds) { if (b.t === 'periuk_api') continue; const s = B[b.t].s; for (let i = b.x - 1; i < b.x + s + 1; i++) for (let j = b.y - 1; j < b.y + s + 1; j++) sekat.add(i + ',' + j); }
  const dinding = new Map(); for (const b of blds) if (b.t === 'tembok') dinding.set(b.x + ',' + b.y, b);
  const L = istLv();
  if (lawan.jarak == null) lawan.jarak = lawan.jenis === 'kempen' ? 300 + lawan.idx * 60 : 600;
  BT = {
    lawan, karam: pg.karam, blds, units: [], proj: [], fx: [], zon: [], masa: 150, mula: false, tamat: false, tunggu: 0, laju: 1,
    tentera: Object.fromEntries(Object.entries(S.army).filter(([, n]) => n > 0)),
    wira: { komander: wiraSedia('komander') ? 'sedia' : 'tiada', elit: wiraSedia('elit') ? 'sedia' : 'tiada' }, wiraU: {},
    taktik: { ew: L >= 3 ? (L >= 6 ? 2 : 1) : 0, bekalan: L >= 4 ? (L >= 7 ? 2 : 1) : 0, udara: L >= 5 ? (L >= 7 ? 2 : 1) : 0, laut: L >= 6 ? 1 : 0, balistik: L >= 7 && kini() >= (S.balistikSedia || 0) ? 1 : 0 },
    logistik: kosLogistik(lawan), risik: false, doktrin: S.doktrin || 'kilat', radar: false,
    propaganda: S.buff.propaganda > 0, proksi: S.buff.proksi > 0, palsu: S.buff.palsu > 0,
    bantuan: S.bantuan.slice(), rampas: { dana: 0, minyak: 0, nadir: 0 }, jumlahLoot: { dana: 0, minyak: 0, nadir: 0 },
    istanaMati: false, jumlah: blds.filter(b => b.t !== 'tembok' && b.t !== 'periuk_api').length, musnah: 0, sekat, dinding, kilat: 0, pilih: null,
  };
  for (const b of blds) if (b.loot) for (const r in b.loot) BT.jumlahLoot[r] += b.loot[r];
  BT.pilih = Object.keys(BT.tentera)[0] || (BT.wira.komander === 'sedia' ? 'komander' : BT.bantuan.length ? 'bantuan' : null);
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
  const d = wira ? WIRA[t] : TR[t], f = wira ? 1 + .12 * (lv - 1) : 1 + .22 * (lv - 1), dk = DOKTRIN[BT.doktrin] || DOKTRIN.kilat, pr = BT.propaganda ? 1.1 : 1;
  const ma = wira ? {} : modAset(t), hp = d.hp * f * dk.hp * (ma.hp || 1);
  const u = { id: acak(), t, x, y, lv, hp, maxHp: hp, dps: d.dps * f * dk.dmg * pr * (ma.dmg || 1), jarak: d.jarak * (ma.jarak || 1), laju: d.laju * dk.laju * (ma.laju || 1), sasar: wira ? 'semua' : d.sasar, udara: !wira && !!d.udara, kamikaze: !!ma.kamikaze, siluman: !!ma.siluman, sasaran: null, cd: 0, arah: 1, langkah: acak() * 6, serang: 0, kuasa: 0, wira: !!wira };
  BT.units.push(u); return u;
}
/* Mula operasi: bayar logistik sekali, guna buff operasi strategik. */
function mulaOperasi() {
  if (BT.mula) return true;
  const c = BT.logistik.kos;
  if (S.res.minyak < c) { toast(`Minyak tidak cukup untuk logistik operasi (${fmtN(c)}).`, true); sfx('salah'); return false; }
  S.res.minyak -= c; BT.mula = true; S.stat.serang++;
  for (const k of ['propaganda', 'proksi', 'palsu']) if (BT[k] && S.buff[k] > 0) S.buff[k]--;
  return true;
}
function risik() {
  if (!BT || BT.mula || BT.risik) return;
  if (S.res.intel < 2) { toast('Perlu 2 Intel untuk pengintaian.', true); sfx('salah'); return; }
  S.res.intel -= 2; BT.risik = true; toast('Pengintaian siap: periuk api lawan kini kelihatan.'); sfx('kutip'); paparHudPerang(); paparKad();
}
function tukarDoktrin() {
  if (!BT || BT.mula) return;
  const k = Object.keys(DOKTRIN), i = (k.indexOf(BT.doktrin) + 1) % k.length;
  BT.doktrin = S.doktrin = k[i]; sfx('ketik'); toast(`Doktrin: ${DOKTRIN[k[i]].n}. ${DOKTRIN[k[i]].d}`); paparHudPerang(); paparKad();
}
function serangUdara(gx, gy) {
  const n = 6, dmg = 260 * (1 + .25 * Math.max(0, istLv() - 5)) * (modAset('udara').dmg || 1);
  for (let i = 0; i < n; i++) { const a = acak() * 6.28, r = Math.sqrt(acak()) * TAKTIK.udara.r * .8, x = gx + Math.cos(a) * r, y = gy + Math.sin(a) * r; BT.proj.push({ j: 'bomU', dari: [x - 2.5, y - 2.5, 12], ke: [x, y, 0], t: -i * .09, dur: .9, dmg, splash: 1.3 }); }
}
function serangLaut(gx, gy) {
  const dmg = 420 * (1 + .25 * Math.max(0, istLv() - 6)) * (modAset('laut').dmg || 1);
  for (let i = 0; i < 4; i++) { const a = acak() * 6.28, r = Math.sqrt(acak()) * TAKTIK.laut.r * .7, x = gx + Math.cos(a) * r, y = gy + Math.sin(a) * r; BT.proj.push({ j: 'misilL', dari: [gx + (i - 1.5) * 1.6, G + 8, .5], ke: [x, y, .3], t: -i * .18, dur: 1.2, dmg, splash: 1.2 }); }
  sfx('misil');
}
function serangBalistik(gx, gy) {
  BT.proj.push({ j: 'balistik', dari: [gx - 9, gy - 9, 28], ke: [gx, gy, 0], t: 0, dur: 2.2, dmg: 1600 * (modAset('balistik').dmg || 1), splash: TAKTIK.balistik.r });
}
function lepas(gx, gy, ulangan) {
  if (!BT || BT.tamat) return false;
  const k = BT.pilih; if (!k) { toast('Pilih unit di bawah dahulu.', true); return false; }
  if (TAKTIK[k]) {
    if (ulangan || !(BT.taktik[k] > 0)) return false;
    if (TAKTIK[k].kos && S.res.dana < TAKTIK[k].kos) { toast(`${namaTaktik(k)} perlu ${fmtN(TAKTIK[k].kos)} dana.`, true); sfx('salah'); return false; }
    if (!mulaOperasi()) return false;
    if (TAKTIK[k].kos) { S.res.dana -= TAKTIK[k].kos; S.balistikSedia = kini() + TAKTIK[k].sedia * 60e3; }
    BT.taktik[k]--; BT.zon.push({ jenis: k, x: gx, y: gy, r: TAKTIK[k].r, t: 0, dur: TAKTIK[k].dur }); sfx(k === 'bekalan' ? 'kutip' : 'gong');
    if (k === 'udara') serangUdara(gx, gy);
    if (k === 'laut') serangLaut(gx, gy);
    if (k === 'balistik') serangBalistik(gx, gy);
    paparKad(); return true;
  }
  if (!bolehLepas(gx, gy)) { BT.kilat = 1.2; if (!ulangan) { sfx('salah'); toast('Lepaskan unit di luar kawasan merah.', true); } return false; }
  if (!BT.mula && !mulaOperasi()) return false;
  if (k in TR) {
    if (!(BT.tentera[k] > 0)) return false;
    BT.tentera[k]--; S.army[k] = Math.max(0, (S.army[k] || 0) - 1); if (!S.army[k]) delete S.army[k];
    unitBaru(k, gx + (acak() - .5) * .3, gy + (acak() - .5) * .3, S.troopLv[k]);
    const nb = modAset(k).bawa ?? TR[k].bawa ?? 0;
    for (let i = 0; i < nb; i++) unitBaru('infantri', gx + (acak() - .5) * .9, gy + (acak() - .5) * .9, S.troopLv.infantri);
    if (!BT.tentera[k]) { delete BT.tentera[k]; BT.pilih = Object.keys(BT.tentera)[0] || BT.pilih; }
  } else if (k === 'komander' || k === 'elit') {
    if (BT.wira[k] !== 'sedia' || ulangan) return false;
    BT.wira[k] = 'aktif'; BT.wiraU[k] = unitBaru(k, gx, gy, wiraSedia(k), true); sfx('gong');
  } else if (k === 'bantuan') {
    if (!BT.bantuan.length || ulangan) return false;
    for (const t of BT.bantuan) unitBaru(t, gx + (acak() - .5) * 1.2, gy + (acak() - .5) * 1.2, S.troopLv[t]);
    BT.bantuan = []; S.bantuan = [];
  } else return false;
  paparKad(); return true;
}
function gunaKuasa(k) {
  const u = BT.wiraU[k]; if (!u || u.hp <= 0 || BT.wira[k] !== 'aktif') return;
  BT.wira[k] = 'guna'; sfx('gong');
  if (k === 'komander') { u.kuasa = 6; u.hp = Math.min(u.maxHp, u.hp + u.maxHp * .35); }
  else { for (const v of BT.units) if (v.hp > 0 && Math.hypot(v.x - u.x, v.y - u.y) < 4.5) v.hp = Math.min(v.maxHp, v.hp + v.maxHp * .4); BT.zon.push({ jenis: 'semangat', x: u.x, y: u.y, r: 4, t: 0, dur: 5, ikut: u }); u.kuasa = 5; }
  BT.fx.push({ j: 'cincin', x: u.x, y: u.y, t: 0, dur: .8, w: '#ffd65a' });
  paparKad();
}
function titikDekat(px, py, b) { const s = B[b.t].s, nx = clamp(px, b.x, b.x + s), ny = clamp(py, b.y, b.y + s); return [nx, ny, Math.hypot(px - nx, py - ny)]; }
function cariSasaran(u) {
  let calon = BT.blds.filter(b => !b.mati && b.t !== 'periuk_api' && b.t !== 'tembok');
  if (u.sasar === 'pertahanan') { const c = calon.filter(b => B[b.t].def); if (c.length) calon = c; }
  if (u.sasar === 'tembok') { const w = BT.blds.filter(b => !b.mati && b.t === 'tembok'); if (w.length) calon = w; }
  let best = null, bd = 1e9;
  for (const b of calon) { const d = titikDekat(u.x, u.y, b)[2]; if (d < bd) { bd = d; best = b; } }
  return best;
}
function buffZon(u) {
  let laju = 1, dmg = 1;
  for (const z of BT.zon) {
    if (z.ikut) { z.x = z.ikut.x; z.y = z.ikut.y; }
    if (Math.hypot(u.x - z.x, u.y - z.y) > z.r) continue;
    if (z.jenis === 'semangat') { laju = 1.4; dmg = 1.5; } else if (z.jenis === 'bekalan') u.hp = Math.min(u.maxHp, u.hp + u.maxHp * .12 / 30);
  }
  return { laju, dmg };
}
function rosakBangunan(b, dmg) {
  if (b.mati) return;
  const dulu = b.hp; b.hp = Math.max(0, b.hp - dmg); b.kena = .12;
  const f = (dulu - b.hp) / b.maxHp;
  if (b.lootBaki) for (const r of ['dana', 'minyak', 'nadir']) { const a = Math.min(b.lootBaki[r], b.loot[r] * f); b.lootBaki[r] -= a; BT.rampas[r] += a; }
  if (b.hp > 0) return;
  b.mati = true;
  if (b.lootBaki) { let teks = []; for (const r of ['dana', 'minyak', 'nadir']) { BT.rampas[r] += b.lootBaki[r]; if (b.loot[r] >= 1) teks.push([r, b.loot[r]]); b.lootBaki[r] = 0; } teks.forEach(([r, n], i) => BT.fx.push({ j: 'teks', x: b.x + B[b.t].s / 2, y: b.y + B[b.t].s / 2, z: 2 + i * .7, t: 0, dur: 1.4, txt: '+' + fmtK(n), w: SUMBER[r].w })); }
  if (b.t === 'tembok') { BT.fx.push({ j: 'debu', x: b.x + .5, y: b.y + .5, t: 0, dur: .6 }); BT.dinding.delete(b.x + ',' + b.y); sfx('pukul'); return; }
  BT.musnah++; if (b.t === 'markas') BT.istanaMati = true;
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
    let dmg = u.dps * bf.dmg * (u.t === 'komander' && u.kuasa > 0 ? 2.2 : 1);
    if (u.kamikaze) {
      u.hp = 0; BT.fx.push({ j: 'letup', x: nx, y: ny, t: 0, dur: .6, r: 1 }); sfx('bom');
      for (const b of BT.blds) { if (b.mati || b.t === 'periuk_api') continue; if (titikDekat(nx, ny, b)[2] <= 1) rosakBangunan(b, dmg * 5); }
      return;
    }
    if (u.t === 'jurutera_tempur') {
      u.hp = 0; BT.fx.push({ j: 'letup', x: u.x, y: u.y, t: 0, dur: .6, r: 1 }); sfx('bom');
      for (const b of BT.blds) { if (b.mati || b.t === 'periuk_api') continue; if (titikDekat(u.x, u.y, b)[2] <= 1.2) rosakBangunan(b, b.t === 'tembok' ? dmg * 15 : dmg); }
      return;
    }
    const pc = !u.wira && TR[u.t].percik;
    if (u.jarak > 1.5) BT.proj.push({ j: u.t === 'elit' ? 'panah' : pc ? 'roketU' : u.t === 'helikopter' || u.t === 'jet' ? 'misil' : 'damak', dari: [u.x, u.y, .6 + G3.terbang(u.t)], ke: [nx, ny, .5], t: 0, dur: Math.max(.15, d / (pc ? 7 : 14)), dmg, sasaranB: t, percik: pc });
    else { rosakBangunan(t, dmg); BT.fx.push({ j: 'percik', x: nx, y: ny, t: 0, dur: .25 }); sfx('pukul'); }
    return;
  }
  const dx = nx - u.x, dy = ny - u.y, L2 = Math.hypot(dx, dy) || 1, langkah = u.laju * bf.laju * dt;
  const x2 = u.x + dx / L2 * langkah, y2 = u.y + dy / L2 * langkah;
  const w = u.udara ? null : BT.dinding.get(Math.floor(x2) + ',' + Math.floor(y2));
  if (w && w !== t && !w.mati) { u.sasaran = w; return; }
  u.x = x2; u.y = y2; u.bergerak = true; u.langkah += dt * 11;
  const sx = dx - dy; if (Math.abs(sx) > .05) u.arah = sx > 0 ? 1 : -1;
  if (!u.udara) for (const b of BT.blds) if (b.t === 'periuk_api' && !b.mati && Math.hypot(u.x - b.x - .5, u.y - b.y - .5) < .7) {
    b.mati = true; const dm = B.periuk_api.trap.dmg * Math.pow(1.3, b.lv - 1);
    for (const v of BT.units) if (!v.udara && Math.hypot(v.x - b.x - .5, v.y - b.y - .5) < B.periuk_api.trap.r) rosakUnit(v, dm);
    BT.fx.push({ j: 'periuk_api', x: b.x + .5, y: b.y + .5, t: 0, dur: .9 }); sfx('pukul');
  }
}
function kemaskiniPertahanan(b, dt) {
  if (b.kilat > 0) b.kilat -= dt;
  b.cd -= dt; if (b.cd > 0) return;
  const df = B[b.t].def, s = B[b.t].s, cx = b.x + s / 2, cy = b.y + s / 2, r = df.range * (1 + .02 * (b.lv - 1)) * (BT.radar ? 1.15 : 1);
  if (BT.zon.some(z => z.jenis === 'ew' && Math.hypot(cx - z.x, cy - z.y) <= z.r + s * .3)) { b.cd = .25; b.jam = true; return; }
  b.jam = false;
  let best = null, bd = 1e9;
  for (const u of BT.units) { if (u.hp <= 0 || (u.udara ? !df.udara : df.hanyaUdara)) continue; const d = Math.hypot(u.x - cx, u.y - cy) - s * .35; if (d <= (u.siluman ? r * .6 : r) && d >= (u.udara ? 0 : df.min || 0) && d < bd) { bd = d; best = u; } }
  if (!best) { b.cd = .2; return; }
  b.cd = df.rate; b.sudut = Math.atan2(best.y - cy, best.x - cx); b.kilat = .1;
  const dmg = dmgPertahanan(b.t, b.lv);
  if (df.jenis === 'bom') { BT.proj.push({ j: 'bom', dari: [cx, cy, 1.4], ke: [best.x, best.y, 0], t: 0, dur: 1.3, dmg, splash: df.splash }); sfx('meriam'); }
  else if (df.jenis === 'peluru') { BT.proj.push({ j: 'peluru', dari: [cx + Math.cos(b.sudut) * .8, cy + Math.sin(b.sudut) * .8, .6], ke: [best.x, best.y, .4], t: 0, dur: Math.max(.1, bd / 13), dmg, sasaranU: best }); sfx('meriam'); }
  else if (df.jenis === 'misil') { BT.proj.push({ j: 'misil', dari: [cx, cy, 1.2], ke: [best.x, best.y, G3.terbang(best.t) + .3], t: 0, dur: Math.max(.25, bd / 11), dmg, sasaranU: best }); sfx('misil'); }
  else { BT.proj.push({ j: 'damakP', dari: [cx, cy, 2.4], ke: [best.x, best.y, G3.terbang(best.t) + .5], t: 0, dur: Math.max(.1, bd / 16), dmg, sasaranU: best }); sfx('damak'); }
}
function kemaskiniPerang(dt) {
  if (BT.tamat) return;
  if (BT.kilat > 0) BT.kilat -= dt;
  if (BT.mula) BT.masa -= dt;
  BT.radar = BT.blds.some(b => b.t === 'radar' && !b.mati);
  for (const z of BT.zon) z.t += dt;
  BT.zon = BT.zon.filter(z => z.t < z.dur);
  for (const u of BT.units) { if (u.kena > 0) u.kena -= dt; if (u.hp > 0) kemaskiniUnit(u, dt); }
  for (const b of BT.blds) { if (b.kena > 0) b.kena -= dt; if (!b.mati && B[b.t].def) kemaskiniPertahanan(b, dt); }
  for (const p of BT.proj) {
    p.t += dt; if (p.t < p.dur) continue; p.habis = true;
    if (p.j === 'bomU' || p.j === 'misilL' || p.j === 'balistik') { for (const b of BT.blds) if (!b.mati && b.t !== 'periuk_api' && titikDekat(p.ke[0], p.ke[1], b)[2] <= p.splash) rosakBangunan(b, b.t === 'tembok' ? p.dmg * .5 : p.dmg); BT.fx.push({ j: 'letup', x: p.ke[0], y: p.ke[1], t: 0, dur: p.j === 'balistik' ? 1.1 : .6, r: p.j === 'balistik' ? 2.6 : 1.1 }); sfx('bom'); }
    else if (p.j === 'roketU') { for (const b of BT.blds) if (!b.mati && b.t !== 'periuk_api' && titikDekat(p.ke[0], p.ke[1], b)[2] <= p.percik) rosakBangunan(b, b === p.sasaranB ? p.dmg : p.dmg * .5); BT.fx.push({ j: 'letup', x: p.ke[0], y: p.ke[1], t: 0, dur: .5, r: .7 }); sfx('bom'); }
    else if (p.j === 'bom') { for (const u of BT.units) if (u.hp > 0 && Math.hypot(u.x - p.ke[0], u.y - p.ke[1]) <= p.splash) rosakUnit(u, p.dmg); BT.fx.push({ j: 'letup', x: p.ke[0], y: p.ke[1], t: 0, dur: .5, r: .9 }); sfx('bom'); }
    else if (p.sasaranU) rosakUnit(p.sasaranU, p.dmg);
    else if (p.sasaranB) rosakBangunan(p.sasaranB, p.dmg);
  }
  BT.proj = BT.proj.filter(p => !p.habis);
  for (const f of BT.fx) f.t += dt;
  BT.fx = BT.fx.filter(f => f.t < f.dur);
  for (const k in BT.wiraU) if (BT.wiraU[k].hp <= 0 && BT.wira[k] !== 'mati') { BT.wira[k] = 'mati'; paparKad(); }
  BT.units = BT.units.filter(u => u.hp > 0);
  const hidup = BT.units.length > 0;
  const baki = Object.values(BT.tentera).some(n => n > 0) || BT.bantuan.length > 0 || BT.wira.komander === 'sedia' || BT.wira.elit === 'sedia';
  if (BT.musnah >= BT.jumlah || (BT.mula && BT.masa <= 0)) tamatPerang();
  else if (BT.mula && !hidup && !baki) { BT.tunggu += dt; if (BT.tunggu > 1.5) tamatPerang(); }
}
const bintangPerang = () => (BT.musnah / BT.jumlah >= .5 ? 1 : 0) + (BT.istanaMati ? 1 : 0) + (BT.musnah >= BT.jumlah ? 1 : 0);
function lukisAtasPerang() {
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (const b of BT.blds) {
    if (b.mati || b.hp >= b.maxHp || b.t === 'periuk_api') continue;
    const s = B[b.t].s, [x, y] = G3.ke2D(b.x + s / 2, b.y + s / 2, G3.tinggi(b.t, b.lv) + .3), w = b.t === 'tembok' ? 22 : 40;
    ctx.fillStyle = 'rgba(10,6,3,.8)'; ctx.fillRect(x - w / 2 - 1, y - 3, w + 2, 6);
    ctx.fillStyle = '#ffd24a'; ctx.fillRect(x - w / 2, y - 2, w * b.hp / b.maxHp, 4);
  }
  for (const u of BT.units) {
    if (u.hp >= u.maxHp && !u.wira) continue;
    const [x, y] = G3.ke2D(u.x, u.y, G3.tinggiUnit(u.t) + .18 + G3.terbang(u.t)), w = u.wira ? 30 : 18;
    ctx.fillStyle = 'rgba(10,6,3,.8)'; ctx.fillRect(x - w / 2 - 1, y - 3, w + 2, 5);
    ctx.fillStyle = u.wira ? '#ffd24a' : '#6fdc4a'; ctx.fillRect(x - w / 2, y - 2, w * clamp(u.hp / u.maxHp, 0, 1), 3);
  }
  for (const f of BT.fx) if (f.j === 'teks') {
    const k = f.t / f.dur, [x, y] = G3.ke2D(f.x, f.y, f.z * .8 + k * 1.4);
    ctx.globalAlpha = 1 - k * k; ctx.font = '400 17px "Lilita One", sans-serif'; ctx.lineWidth = 4; ctx.strokeStyle = '#140c07'; ctx.strokeText(f.txt, x, y); ctx.fillStyle = f.w; ctx.fillText(f.txt, x, y); ctx.globalAlpha = 1;
  }
}
function lukisApungan(dt) {
  if (!apungan.length || mode !== 'kampung') { apungan = []; return; }
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (const a of apungan) {
    a.t += dt; const k = a.t / 1.3, [x, y] = G3.ke2D(a.x, a.y, a.z + k * 1.6);
    ctx.globalAlpha = clamp(1 - k * k, 0, 1); ctx.font = '400 20px "Lilita One", sans-serif'; ctx.lineWidth = 4; ctx.strokeStyle = '#140c07'; ctx.strokeText(a.txt, x, y); ctx.fillStyle = a.w; ctx.fillText(a.txt, x, y); ctx.globalAlpha = 1;
  }
  apungan = apungan.filter(a => a.t < 1.3);
}
function tamatPerang() {
  if (BT.tamat) return; BT.tamat = true;
  const bin = bintangPerang(), menang = bin > 0, lw = BT.lawan, peratus = Math.round(100 * BT.musnah / BT.jumlah);
  const dapat = {};
  const fRampas = BT.palsu ? 1.3 : 1;
  for (const r of ['dana', 'minyak', 'nadir']) dapat[r] = Math.floor(tambah(r, Math.floor(BT.rampas[r] * fRampas)));
  let maruah = 0, bonus = null, tegang = 0;
  if (lw.jenis === 'jiran' && BT.mula) { tegang = BT.palsu ? 0 : 6 + Math.round(BT.musnah / BT.jumlah * 6); S.tegang = clamp(S.tegang + tegang, 0, 100); }
  if (lw.jenis === 'jiran') {
    if (menang) { maruah = 8 + bin * 6 + Math.floor(acak() * 6); const lg = ligaDari(S.maruah); if (lg.bonus) { const n = Math.round(lg.bonus * bin / 3); bonus = { dana: Math.floor(tambah('dana', n)), minyak: Math.floor(tambah('minyak', n)) }; } }
    else maruah = -(6 + Math.floor(acak() * 8));
    S.maruah = Math.max(0, S.maruah + maruah);
  }
  if (lw.jenis === 'kempen') S.kempen[lw.idx] = Math.max(S.kempen[lw.idx] || 0, bin);
  if (menang) { S.stat.menang++; misi('menang'); tambahXP(5 + bin * 5); } else S.stat.kalah++;
  S.stat.bintang += bin; misi('bintang', bin); if (bin === 3) S.stat.bintang3++;
  if (S.puak && dapat.dana > 0) { S.puak.goal.prog = Math.min(S.puak.goal.sasaran, S.puak.goal.prog + dapat.dana); S.puak.goal.aku += dapat.dana; }
  semakHikayat(); semakLangkah(); simpan();
  sfx(menang ? 'menang' : 'kalah');
  setTimeout(() => paparKeputusan({ bin, menang, peratus, dapat, maruah, bonus, lw, tegang, palsu: BT && BT.palsu }), 700);
}
function pulangKota() {
  BT = null; mode = 'kampung';
  $('#hudPerang').hidden = true; $('#hudKampung').hidden = false;
  tutupModal(); kameraAsal(); kemaskiniHUD(); paparPanel(); simpan();
}
const kosCari = () => [50, 100, 200, 350, 500, 750, 1000][istLv() - 1];
function cariLawan() {
  const c = kosCari();
  if (!bayar(['dana', c])) { toast(`Dana tidak cukup untuk mencari sasaran (${fmtN(c)}).`, true); sfx('salah'); return; }
  const L = clamp(istLv() + (acak() < .2 ? -1 : acak() < .15 ? 1 : 0), 1, 7);
  const nama = `${pilih(NAMA_LAWAN)} · ${pilih(NAMA_KOMANDER)}`;
  const seed = Math.floor(acak() * 1e9), jarak = Math.round(400 + acak() * 7600);
  if (mode === 'perang' && BT && !BT.mula) { BT = null; }
  mulaPerang({ jenis: 'jiran', nama, L, seed, jarak });
}
function serangKempen(i) { const k = KEMPEN[i]; mulaPerang({ jenis: 'kempen', idx: i, nama: k.n, L: k.L, seed: 1000 + i * 77, jarak: 300 + i * 60 }); }

/* ================= Serangan semasa ketiadaan ================= */
function skorPertahanan(L, blds) {
  let s = 0;
  for (const b of blds) {
    const d = B[b.t]; if (b.lv < 1) continue;
    if (d.def) { const ma = modAset(b.t); s += dmgPertahanan(b.t, b.lv) * (ma.dmg || 1) / d.def.rate * d.def.range * (ma.range || 1) / 5 * 10; }
    else if (b.t === 'tembok') s += b.lv * .6;
    else if (b.t === 'periuk_api') s += 4;
    else if (d.hero) s += b.lv * 12;
  }
  return s + L * 4;
}
function skorJangkaan(L) {
  let s = 0;
  for (const t of ['artileri', 'menara_mesingan', 'pelancar_roket', 'pertahanan_udara']) s += BIL[t][L - 1] * (dmgPertahanan(t, Math.max(1, maxLvUntuk(t, L) - 1)) / B[t].def.rate * B[t].def.range / 5 * 10);
  return s + BIL.tembok[L - 1] * Math.max(1, L - 1) * .6 * .7 + L * 4;
}
function seranganLuar(jauh) {
  if (jauh < 5 * 60e3 || kini() < S.perisai) return [];
  const peluang = Math.min(3, Math.floor(jauh / (40 * 60e3)) + 1), L = istLv(), out = [], had = .3 + ketegangan() / 200;
  const tahan = skorPertahanan(L, S.bld), jangka = skorJangkaan(L);
  for (let i = 0; i < peluang; i++) {
    if (acak() > had) continue;
    const kuasa = jangka * (.55 + acak() * .9), nisbah = tahan / kuasa;
    const bin = nisbah > 1.25 ? 0 : nisbah > .95 ? 1 : nisbah > .7 ? 2 : 3;
    const pct = [0, .05, .1, .16][bin], hilang = { dana: Math.floor(S.res.dana * pct), minyak: Math.floor(S.res.minyak * pct) };
    S.res.dana -= hilang.dana; S.res.minyak -= hilang.minyak;
    const m = bin === 0 ? 8 + Math.floor(acak() * 5) : -(3 * bin + Math.floor(acak() * 4));
    S.maruah = Math.max(0, S.maruah + m);
    if (bin === 0) S.stat.pertahan++;
    const lap = { masa: kini() - Math.floor(acak() * jauh), nama: `${pilih(NAMA_LAWAN)} · ${pilih(NAMA_KOMANDER)}`, L: clamp(L + Math.round(acak() * 2 - 1), 1, 7), bin, hilang, m, seed: Math.floor(acak() * 1e9), balas: false, jarak: Math.round(400 + acak() * 7600) };
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
  $('#sumber').innerHTML = ['dana', 'minyak', 'nadir', 'intel'].map(r => `<div class="bar ${r}" id="bar-${r}" style="--w:${SUMBER[r].w}" title="${SUMBER[r].n}"><div class="isi"><i></i><small></small><b class="nombor">0</b></div>${ik(r)}</div>`).join('');
  for (const r of ['dana', 'minyak', 'nadir', 'intel']) { const el = $('#bar-' + r); barEl[r] = { el, i: el.querySelector('i'), b: el.querySelector('b'), s: el.querySelector('small') }; }
  $('#btnSerang').innerHTML = IKON.serang + 'Operasi';
  const nav = [['navBina', 'bina', 'Bina'], ['navTentera', 'tentera', 'Tentera'], ['navOps', 'ops', 'Strategi'], ['navPuak', 'puak', 'Pakatan'], ['navKitab', 'kitab', 'Arkib'], ['navTetapan', 'tetapan', 'Tetapan']];
  for (const [id, ic, n] of nav) $('#' + id).innerHTML = IKON[ic] + `<span>${n}</span><span class="titik" hidden></span>`;
  $('#btnSerang').onclick = () => { bukaAudio(); bukaSerang(); };
  $('#navBina').onclick = () => { bukaAudio(); bukaKedai(); };
  $('#navTentera').onclick = () => { bukaAudio(); bukaTentera(); };
  $('#navPuak').onclick = () => { bukaAudio(); bukaPuakModal(); };
  $('#navOps').onclick = () => { bukaAudio(); bukaOps(); };
  $('#navKitab').onclick = () => { bukaAudio(); bukaKitab(); };
  $('#navTetapan').onclick = () => { bukaAudio(); bukaTetapan(); };
  $('#letakOk').onclick = sahLetak; $('#letakBatal').onclick = batalLetak;
  $('#modalTutup').onclick = tutupModal;
  $('#modal').addEventListener('pointerdown', e => { if (e.target.id === 'modal') tutupModal(); });
}
function lencana(id, n) { const t = $('#' + id + ' .titik'); if (!t) return; t.hidden = !n; t.textContent = n > 9 ? '9+' : n; }
function kemaskiniHUD() {
  if (!S || mode !== 'kampung') { if (mode === 'perang' && BT) paparHudPerang(); return; }
  for (const r of ['dana', 'minyak', 'nadir', 'intel']) {
    const e = barEl[r]; e.b.textContent = fmtN(S.res[r]);
    if (r !== 'intel') { const c = capSumber(r); e.i.style.width = clamp(100 * S.res[r] / Math.max(1, c), 0, 100) + '%'; e.s.textContent = 'Maks ' + fmtK(c); }
  }
  barEl.nadir.el.hidden = istLv() < 5 && S.res.nadir <= 0;
  $('#tukang').innerHTML = `${IKON.bina.replace('<svg', '<svg class="ikon"')} Jurutera ${tukangLapang()}/${jumlahTukang()}${S.perisai > kini() ? ` <small>Perisai ${masa((S.perisai - kini()) / 1000)}</small>` : ''}`;
  const tg = ketegangan(), im = Math.round(S.imej);
  $('#dunia').innerHTML = `<span title="Imej antarabangsa" class="${im < 30 ? 'teruk' : ''}">Imej <b class="nombor">${im}</b></span><span title="Ketegangan: makin tinggi, makin kerap pangkalan diserang" class="${tg >= 60 ? 'teruk' : ''}">Tegang <b class="nombor">${tg}</b></span>${disekat() ? `<span class="teruk">Sekatan ${masa((S.sekatan - kini()) / 1000)}</span>` : ''}`;
  $('#namaPemain').textContent = `${S.nama} · ${negaraKu().n}`;
  const pk = pangkat(), lo = 40 * (pk - 1) ** 2, hi = 40 * pk ** 2;
  $('#pangkatNo').textContent = pk; $('#pangkat').style.setProperty('--xp', (100 * (S.xp - lo) / (hi - lo)) + '%');
  const lg = ligaDari(S.maruah); $('#namaLiga').textContent = lg.n; $('#lencanaLiga').style.background = lg.w; $('#maruah').textContent = fmtN(S.maruah);
  lencana('navPuak', S.puak ? S.puak.belumBaca : 0);
  lencana('navKitab', bolehTuntut() + S.hikayatBaru + S.laporanBaru);
  lencana('navOps', istLv() >= 2 && Object.keys(OPS).some(k => opsSedia(k)) ? 1 : 0);
  lencana('navTentera', 0);
  const st = $('#panelStatus'); if (st && pilihan) st.innerHTML = statusBangunan(pilihan);
  const pc = $('#btnPercepat'); if (pc && pilihan && pilihan.busy) pc.querySelector('.kos').innerHTML = `${ik('intel')} ${kosPercepat(pilihan)}`;
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
  if (d.simpan) return `Simpanan ${SUMBER[d.simpan].n} negara <b class="nombor">${fmtN(S.res[d.simpan])}/${fmtN(capSumber(d.simpan))}</b>`;
  if (d.def) return `Kerosakan ${Math.round(dmgPertahanan(b.t, b.lv) / d.def.rate)}/saat · jarak ${d.def.range} petak · ${d.def.hanyaUdara ? 'udara sahaja' : d.def.udara ? 'darat & udara' : 'darat sahaja'}`;
  if (d.radar) return 'Memanjangkan jarak tembakan semua pertahanan sebanyak 15% selagi berfungsi.';
  if (b.t === 'kem') return `Unit <b class="nombor">${ruangGuna()}/${ruangTentera()}</b> ruang`;
  if (b.t === 'berek') return S.gilir.length ? `Melatih ${TR[S.gilir[0]].n} · ${S.gilir.length} dalam giliran` : 'Tiada latihan berjalan';
  if (b.t === 'makmal') return S.kaji ? `Mengkaji ${TR[S.kaji.k].n} tahap ${S.kaji.lv} · baki ${masa((S.kaji.until - kini()) / 1000)}` : 'Tiada kajian berjalan';
  if (b.t === 'pusat_pakatan') return `Bantuan sekutu <b class="nombor">${ruangBantuan()}/${capBantuan()}</b> ruang`;
  if (b.t === 'markas') return `Fasa ${ERA[b.lv - 1].nama} · ${ERA[b.lv - 1].masa}`;
  if (d.hero) return `${WIRA[d.hero].n} tahap ${b.lv} · ${WIRA[d.hero].kuasa}`;
  if (b.t === 'pejabat_jurutera') return `${tukangLapang()} daripada ${jumlahTukang()} pasukan jurutera lapang`;
  return esc(d.d);
}
function btnKos(k) { const ada = S.res[k[0]] >= k[1]; return `<span class="kos ${ada ? '' : 'kurang'}">${ik(k[0])} ${fmtK(k[1])}</span>`; }
function paparPanel() {
  const el = $('#panel'), b = pilihan;
  if (!b || mode !== 'kampung' || S.letak || !S.bld.includes(b)) { el.hidden = true; if (b && !S.bld.includes(b)) pilihan = null; return; }
  const d = B[b.t], butang = [];
  butang.push(`<button class="btn kayu" data-b="info">Maklumat</button>`);
  if (b.busy) butang.push(`<button class="btn hijau" id="btnPercepat" data-b="percepat">Siapkan<span class="kos">${ik('intel')} ${kosPercepat(b)}</span></button>`);
  else if (b.lv < d.max && b.t !== 'pejabat_jurutera') {
    const lvB = b.lv + 1, buka = lvB <= maxLv(b.t);
    butang.push(buka ? `<button class="btn" data-b="naik">Naik taraf${btnKos(kos(b.t, lvB))}</button>` : `<button class="btn mati" data-b="naik">Naik taraf<small>Perlu Markas ${istLv() + 1}</small></button>`);
  }
  if (d.hasil && b.lv >= 1) butang.push(`<button class="btn hijau" data-b="kutip">Kutip<span class="kos">${ik(d.hasil)} ${fmtK(b.store)}</span></button>`);
  if (b.t === 'berek' || b.t === 'kem') butang.push(`<button class="btn merah" data-b="latih">Latih unit</button>`);
  if (b.t === 'makmal' && b.lv >= 1) butang.push(`<button class="btn merah" data-b="kaji">Kaji</button><button class="btn hijau" data-b="kuiz">Kuiz geopolitik</button>`);
  if (b.t === 'pusat_pakatan' && b.lv >= 1) butang.push(`<button class="btn merah" data-b="puak">Pakatan</button>`);
  if (b.t === 'pusat_risikan' && b.lv >= 1) butang.push(`<button class="btn merah" data-b="ops">Operasi strategik</button>`);
  if (b.t === 'tembok') butang.push(`<button class="btn kayu" data-b="kotaBaru">Bina tembok lagi</button>`);
  butang.push(`<button class="btn kayu" data-b="pindah">Pindah</button>`);
  el.innerHTML = `<div class="jalur-amaran"></div><div class="kepala"><h3>${esc(namaBangunan(b.t, b.lv))}</h3><span class="tahap">${b.lv === 0 ? 'Sedang dibina' : 'Tahap ' + b.lv + ' / ' + maxLv(b.t)}</span></div><div class="status" id="panelStatus">${statusBangunan(b)}</div><div class="tindakan">${butang.join('')}</div>`;
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
    else if (a === 'ops') bukaOps();
    else if (a === 'pindah') mulaPindah(b);
    else if (a === 'kotaBaru') { if (bil('tembok') >= had('tembok')) toast('Had tembok sudah dicapai.', true); else mulaLetak('tembok', [b.x + 1, b.y]); }
  });
}
function paparLetak() {
  const el = $('#letakKawal'), L = S.letak;
  el.hidden = !L;
  $('#bawahKiri').hidden = !!L; $('#bawahKanan').hidden = !!L;
  if (!L) return;
  $('#letakNama').innerHTML = L.baru ? `${esc(B[L.t].n)} ${btnKos(kos(L.t, 1))}${L.t === 'tembok' || L.t === 'periuk_api' ? ` <small>${bil(L.t)}/${had(L.t)}</small>` : ''}` : `Pindah ${esc(namaBangunan(L.t, L.b.lv))}`;
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
    if (tukangLapang() > 0) tips.push('Ada jurutera yang lapang. Naik taraf sesuatu supaya pangkalan terus berkembang.');
    if (ruangGuna() + ruangGilir() < ruangTentera() * .5) tips.push('Kem Tentera masih lengang. Latih unit untuk operasi seterusnya.');
    if (S.puak && !S.puak.minta && kini() > S.puak.mintaLagi && ruangBantuan() < capBantuan()) tips.push('Minta bantuan unit daripada sekutu di Pusat Pakatan.');
    if (bolehTuntut()) tips.push('Ada ganjaran menunggu dalam Arkib. Buka dan tuntut!');
    if (S.kuiz.hari !== hariIni() || S.kuiz.jawab < 5) if (adaAktif('makmal')) tips.push('Kuiz geopolitik hari ini belum habis. Jawab di Makmal untuk Intel.');
    if (ketegangan() >= 60) tips.push('Ketegangan tinggi: pangkalan lebih kerap diserang. Pertimbangkan Misi Diplomatik.');
    if (S.imej < 40) tips.push('Imej antarabangsa rendah. Jika jatuh bawah 30, sekatan ekonomi akan dikenakan.');
    if (istLv() >= 2 && Object.keys(OPS).some(k => opsSedia(k))) tips.push('Operasi strategik sedia. Buka menu Strategi.');
    tips.push(`Fasa kuasa: ${ERA[istLv() - 1].nama}. Naik taraf Markas Komando untuk fasa seterusnya.`);
    teks = tips[nasihatIdx++ % tips.length];
  }
  el.innerHTML = `${IKON.bendahara}<div class="kata"><b>Penasihat Keselamatan</b>${esc(teks)}${ganjaran ? '<br>' + ganjaran : ''}</div>`;
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
function tutupModal(paksa) {
  if (paksa !== true && modalCur && modalCur.tajuk === 'Pilih negara' && !S.negara) { toast('Pilih negara dahulu. Malaysia ialah pilihan lalai.'); return; }
  $('#modal').hidden = true; modalCur = null; if (mode === 'perang' && BT && BT.tamat) pulangKota();
}
$('#modal').addEventListener('pointerdown', () => { tekanModal = true; });
addEventListener('pointerup', () => { tekanModal = false; });
function lukisKeKanvas(el, fn, skala = 1) {
  const r = el.getBoundingClientRect(), w = Math.max(40, r.width || 120), h = Math.max(40, r.height || 96), d = Math.min(2, window.devicePixelRatio || 1);
  el.width = Math.round(w * d); el.height = Math.round(h * d);
  const lama = ctx; ctx = el.getContext('2d');
  ctx.setTransform(d * skala, 0, 0, d * skala, w * d / 2, h * d * .5);
  try { fn(w / skala, h / skala); } finally { ctx = lama; }
}
function lukisFoto(el, src) {
  const r = el.getBoundingClientRect(), d = Math.min(2, window.devicePixelRatio || 1), w = Math.max(40, r.width || 120), h = Math.max(40, r.height || 96);
  el.width = Math.round(w * d); el.height = Math.round(h * d);
  const c = el.getContext('2d'), k = Math.min(el.width / src.width, el.height / src.height), dw = src.width * k, dh = src.height * k;
  c.drawImage(src, (el.width - dw) / 2, (el.height - dh) / 2, dw, dh);
}
const lukisPratonton = (el, t) => lukisFoto(el, G3.foto('b', t));
const lukisPratontonUnit = (el, t) => lukisFoto(el, G3.foto('u', t));

function bukaInfo(b) {
  const d = B[b.t], baris = [];
  baris.push(['Tahap', `${b.lv} / ${maxLv(b.t)} (maksimum ${d.max})`]);
  baris.push(['Nyawa', fmtN(hpBangunan(b.t, Math.max(1, b.lv)))]);
  if (d.def) baris.push(['Kerosakan', `${Math.round(dmgPertahanan(b.t, Math.max(1, b.lv)) / d.def.rate)} sesaat`], ['Jarak', `${d.def.range} petak${d.def.min ? `, minimum ${d.def.min}` : ''}`], ['Sasaran', d.def.hanyaUdara ? 'Udara sahaja' : d.def.udara ? 'Darat dan udara' : 'Darat sahaja']);
  if (d.hasil) baris.push(['Kadar', `${fmtN(kadar(b) * 3600)} ${SUMBER[d.hasil].n} sejam`], ['Muatan', fmtN(capPengumpul(b))]);
  if (d.simpan) baris.push(['Muatan', fmtN((d.simpan === 'nadir' ? CAP_TIMAH : CAP_SIMPAN)[Math.max(1, b.lv) - 1])]);
  if (b.t === 'kem') baris.push(['Muatan unit', KEM_CAP[Math.max(1, b.lv) - 1] + ' ruang']);
  if (b.t === 'markas') baris.push(['Fasa', `${ERA[b.lv - 1].nama} (${ERA[b.lv - 1].masa})`], ['Fasa seterusnya', b.lv < 7 ? ERA[b.lv].nama : 'Fasa tertinggi dicapai'], ['Negara', negaraKu().n]);
  if (d.hero) baris.push(['Komander', WIRA[d.hero].n], ['Kuasa', `${WIRA[d.hero].kuasa}: ${WIRA[d.hero].kd}`]);
  const as = asetSlot(b.t); if (as) baris.push(['Aset negara', `${as.kat} · slot ${B[b.t].n}`], ['Kesan', as.kesan]);
  bukaModal(namaBangunan(b.t, b.lv), null, (_, isi) => {
    isi.innerHTML = `<div style="display:flex;gap:12px;flex-wrap:wrap;align-items:flex-start"><canvas id="infoKanvas" style="width:150px;height:120px;border-radius:10px;background:radial-gradient(ellipse at 50% 70%,#b9c48a,#6b7a3a 70%);flex:none"></canvas><div style="flex:1;min-width:200px"><p>${esc(d.d)}</p>${baris.map(([a, v]) => `<div class="baris" style="margin-bottom:6px;padding:6px 10px"><div class="teks"><small>${a}</small><b style="font-size:14px">${esc(v)}</b></div></div>`).join('')}</div></div>`;
    lukisPratonton($('#infoKanvas'), b.t);
  });
}
function bukaKedai() {
  pilihan = null; paparPanel();
  bukaModal('Bina', [['ekonomi', 'Ekonomi'], ['pertahanan', 'Pertahanan'], ['tentera', 'Tentera']], (tab, isi) => {
    const jenis = Object.keys(B).filter(t => B[t].kat === tab);
    isi.innerHTML = `<div class="grid-kad">${jenis.map(t => {
      const h = had(t), n = bil(t), k = kos(t, 1), kunci = h === 0, penuh = n >= h;
      const label = kunci ? `Buka pada Markas ${bukaPada(t)}` : penuh ? `Had dicapai (${n}/${h})` : `${n}/${h} dibina`;
      return `<div class="kedai ${kunci ? 'kunci' : ''}"><canvas data-pt="${t}"></canvas><h4>${esc(namaBangunan(t, 1))}</h4>${asetSlot(t) ? `<div class="kecil aset">${esc(B[t].n)} · ${esc(asetSlot(t).kesan)}</div>` : ''}<div class="kecil">${esc(B[t].d)}</div><div class="kecil"><b>${label}</b>${masaBina(t, 1) ? ` · ${masa(masaBina(t, 1))}` : ''}</div><button class="btn ${kunci || penuh ? 'mati' : ''}" data-bina="${t}">${btnKos(k)}</button></div>`;
    }).join('')}</div>`;
    isi.querySelectorAll('[data-pt]').forEach(c => lukisPratonton(c, c.dataset.pt));
    isi.querySelectorAll('[data-bina]').forEach(btn => btn.onclick = () => {
      const t = btn.dataset.bina, h = had(t);
      if (h === 0) { toast(`${B[t].n} dibuka pada Markas tahap ${bukaPada(t)}.`, true); return; }
      if (bil(t) >= h) { toast(`Had ${B[t].n} sudah dicapai. Naik taraf Markas untuk lebih.`, true); return; }
      if (!cukup(kos(t, 1))) { toast(`${SUMBER[kos(t, 1)[0]].n} tidak cukup.`, true); sfx('salah'); return; }
      mulaLetak(t);
    });
  });
}
function bukaTentera() {
  pilihan = null; paparPanel();
  bukaModal('Tentera', [['latih', 'Latih'], ['pahlawan', 'Komander'], ['bantuan', 'Bantuan sekutu']], (tab, isi) => {
    if (tab === 'latih') {
      const cap = ruangTentera(), guna = ruangGuna(), gilir = ruangGilir();
      const sedang = S.gilir.length ? TR[S.gilir[0]] : null, n = S.bld.filter(b => b.t === 'berek' && aktif(b)).length;
      isi.innerHTML = `<div class="ruang"><span>Ruang unit <span class="nombor">${guna} + ${gilir} / ${cap}</span></span><div class="meter"><i style="width:${100 * guna / Math.max(1, cap)}%"></i></div></div>
        ${S.gilir.length ? `<div class="kecil" style="font-size:12px">Sedang melatih ${esc(namaUnit(S.gilir[0]))} · ${n ? `${n} berek aktif` : 'berek sedang dinaik taraf, latihan berhenti'}</div><div class="baris-gilir">${S.gilir.map((k, i) => `<span class="gilir">${esc(namaUnit(k))} <button data-batal="${i}" aria-label="Batal">✕</button></span>`).slice(0, 30).join('')}${S.gilir.length > 30 ? `<span class="gilir">+${S.gilir.length - 30} lagi</span>` : ''}</div>` : '<p class="kecil" style="font-size:12px">Ketik unit untuk mula melatih. Latihan berjalan walaupun kau keluar dari permainan. Unit udara terbang melepasi tembok tetapi hanya boleh ditembak Pertahanan Udara dan Menara Mesingan.</p>'}
        <div class="grid-kad">${Object.keys(TR).map(k => {
        const d = TR[k], buka = balaiMaks() >= d.buka, as = asetSlot(k);
        return `<div class="kedai ${buka ? '' : 'kunci'}"><canvas data-un="${k}" style="height:84px"></canvas><h4>${esc(namaUnit(k))} <small>tahap ${S.troopLv[k]}</small></h4>${as ? `<div class="kecil aset">${esc(d.n)} · ${esc(as.kesan)}</div>` : ''}<div class="kecil">${esc(d.d)}</div><div class="kecil">${buka ? `${d.udara ? 'Udara · ' : ''}Ruang ${d.ruang} · ${d.masa}s · ada <b>${S.army[k] || 0}</b>` : `<b>Berek Tentera tahap ${d.buka}</b>`}</div><div style="display:flex;gap:6px"><button class="btn ${buka ? '' : 'mati'}" data-latih="${k}" style="flex:1">+1 ${btnKos(['minyak', kosUnit(k)])}</button><button class="btn kayu ${buka ? '' : 'mati'}" data-latih5="${k}">+5</button></div></div>`;
      }).join('')}</div>`;
      isi.querySelectorAll('[data-un]').forEach(c => lukisPratontonUnit(c, c.dataset.un));
      isi.querySelectorAll('[data-latih]').forEach(b => b.onclick = () => latih(b.dataset.latih, 1));
      isi.querySelectorAll('[data-latih5]').forEach(b => b.onclick = () => latih(b.dataset.latih5, 5));
      isi.querySelectorAll('[data-batal]').forEach(b => b.onclick = () => batalGilir(+b.dataset.batal));
    } else if (tab === 'pahlawan') {
      isi.innerHTML = Object.entries(WIRA).map(([k, w]) => {
        const b = S.bld.find(x => x.t === w.bina), lv = wiraSedia(k);
        return `<div class="baris"><canvas data-un="${k}" style="width:64px;height:64px;flex:none;border-radius:10px;background:#dfe3d0"></canvas><div class="teks"><b>${esc(w.n)}</b><small>${b ? (b.busy ? 'Sedang dinaik taraf, tidak boleh bertugas' : `Tahap ${b.lv} · sedia bertugas`) : `Bina ${esc(B[w.bina].n)} (Markas ${bukaPada(w.bina)})`}</small><small>Kuasa ${esc(w.kuasa)}: ${esc(w.kd)}</small></div>${lv ? '' : ''}</div>`;
      }).join('') + '<p class="kecil" style="font-size:12px">Komander tidak hilang selepas operasi. Dalam operasi, ketik kad komander sekali lagi selepas dilepaskan untuk menggunakan kuasa.</p>';
      isi.querySelectorAll('[data-un]').forEach(c => lukisPratontonUnit(c, c.dataset.un));
    } else {
      const cap = capBantuan();
      if (!cap) { isi.innerHTML = `<p>Bina Pusat Pakatan (Markas tahap 2) untuk menyertai pakatan dan menerima bantuan unit daripada negara sekutu.</p>`; return; }
      const kira = {}; for (const k of S.bantuan) kira[k] = (kira[k] || 0) + 1;
      isi.innerHTML = `<div class="ruang"><span>Bantuan dalam Pusat Pakatan <span class="nombor">${ruangBantuan()}/${cap}</span></span><div class="meter dana"><i style="width:${100 * ruangBantuan() / cap}%"></i></div></div>${Object.keys(kira).length ? Object.entries(kira).map(([k, n]) => `<div class="baris"><div class="teks"><b>${esc(TR[k].n)} × ${n}</b></div></div>`).join('') : '<p>Tiada bantuan lagi. Minta daripada sekutu pakatan.</p>'}<button class="btn merah" id="btnMintaT">Minta bantuan</button>`;
      $('#btnMintaT').onclick = () => { mintaBantuan(); renderModal(); };
    }
  });
}
function bukaIlmu(tab) {
  bukaModal('Makmal', [['kaji', 'Kajian'], ['kuiz', 'Kuiz geopolitik']], (t, isi) => {
    if (t === 'kaji') {
      isi.innerHTML = `${S.kaji ? `<div class="baris"><div class="teks"><b>Mengkaji ${esc(TR[S.kaji.k].n)} tahap ${S.kaji.lv}</b><small>Baki <span data-sampai="${S.kaji.until}">${masa((S.kaji.until - kini()) / 1000)}</span></small><div class="meter"><i data-meter-mula="${S.kaji.mula}" data-meter-tamat="${S.kaji.until}" style="width:${100 * clamp((kini() - S.kaji.mula) / (S.kaji.until - S.kaji.mula), 0, 1)}%"></i></div></div></div>` : `<p>Pilih unit untuk dikaji. Setiap tahap menambah nyawa dan kerosakan sebanyak 22%.${negaraKu().kuat.includes('teknologi') ? ' Bonus teknologi negara: kajian 20% lebih cepat.' : ''}</p>`}
      ${Object.keys(TR).map(k => {
        const lv = S.troopLv[k], nx = lv + 1, buka = balaiMaks() >= TR[k].buka, had2 = nx <= maxKaji();
        return `<div class="baris"><canvas data-un="${k}" style="width:56px;height:56px;flex:none;border-radius:10px;background:#dfe3d0"></canvas><div class="teks"><b>${esc(namaUnit(k))} · tahap ${lv}</b><small>${!buka ? `Buka di Berek Tentera tahap ${TR[k].buka}` : !had2 ? 'Naik taraf Makmal untuk tahap seterusnya' : `Ke tahap ${nx} · ${masa(MASA_KAJI[nx] * bonusSumber('kaji'))}`}</small></div>${buka && had2 ? `<button class="btn ${S.kaji ? 'mati' : ''}" data-kaji="${k}">${btnKos(['minyak', kosKaji(k, nx)])}</button>` : ''}</div>`;
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
    isi.innerHTML = `<h3>Kuiz Geopolitik</h3><p>Jawab soalan tentang pakatan, titik sempit laluan laut dan hubungan antarabangsa. ${baki ? `Hari ini masih ada <b>${baki}</b> soalan berganjaran: setiap jawapan betul memberi ${ik('intel')} 1 Intel.` : 'Ganjaran hari ini sudah habis. Kau masih boleh berlatih.'}</p><button class="btn merah" id="mulaKuiz">Mula kuiz</button>`;
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
      if (S.kuiz.jawab < 5) { S.res.intel += 1; toast('+1 Intel'); }
    } else sfx('salah');
    S.kuiz.jawab++; kemaskiniHUD(); simpan(); renderKuiz(isi);
  });
  const sn = $('#seterusKuiz'); if (sn) sn.onclick = () => { kuizSesi.i++; kuizSesi.jawab = null; renderKuiz(isi); };
}
function mintaBantuan() {
  const p = S.puak; if (!p) { toast('Bina Pusat Pakatan untuk menyertai pakatan.', true); return; }
  const cap = capBantuan(); if (ruangBantuan() >= cap) { toast('Pusat Pakatan sudah penuh.', true); return; }
  if (p.minta) { toast('Permintaan kau masih terbuka.', true); return; }
  if (kini() < p.mintaLagi) { toast(`Boleh minta lagi dalam ${masa((p.mintaLagi - kini()) / 1000)}.`, true); return; }
  const k = pilih(jenisDibuka());
  p.minta = { k, masa: kini() }; p.mintaLagi = kini() + 3 * 60e3;
  chat({ dari: `${S.nama} (${negaraKu().n})`, aku: true, t: `Minta bantuan unit, terutamanya ${TR[k].n}. Terima kasih!` });
  toast('Permintaan dihantar kepada pakatan.'); simpan();
}
function bukaPuakModal(tab) {
  pilihan = null; paparPanel();
  if (!S.puak) { bukaModal('Pakatan', null, (_, isi) => { isi.innerHTML = `<h3>Belum menyertai pakatan</h3><p>Bina <b>Pusat Pakatan</b> (dibuka pada Markas tahap 2) untuk menyertai pakatan bersama negara yang sama blok dengan ${esc(negaraKu().n)}. Sekutu berkongsi unit, berbincang strategi dan menjalankan Operasi Bersama. Pangkalan sekutu juga menjimatkan 25% kos logistik.</p>`; }); return; }
  S.puak.belumBaca = 0;
  bukaModal(S.puak.nama, [['sembang', 'Komunikasi'], ['ahli', 'Anggota'], ['gotong', 'Operasi Bersama']], (t, isi) => {
    const p = S.puak; p.belumBaca = 0;
    if (t === 'sembang') {
      isi.innerHTML = `<div class="ruang"><span>Bantuan: <span class="nombor">${ruangBantuan()}/${capBantuan()}</span></span><button class="btn merah" id="btnMinta">${p.minta ? 'Menunggu bantuan…' : kini() < p.mintaLagi ? `Minta lagi ${masa((p.mintaLagi - kini()) / 1000)}` : 'Minta bantuan'}</button></div>
        <div class="sembang" id="senaraiSembang"></div>
        <form id="borangSembang" style="display:flex;gap:6px;margin-top:10px"><input id="inputSembang" maxlength="120" placeholder="Tulis mesej kepada pakatan" style="flex:1;min-width:0;font:inherit;font-size:16px;padding:8px 10px;border-radius:8px;border:2px solid #9aa58a;background:#fff;color:#1a2010"><button class="btn" type="submit">Hantar</button></form>`;
      renderSembang();
      $('#btnMinta').onclick = () => { mintaBantuan(); renderModal(); };
      $('#borangSembang').onsubmit = e => {
        e.preventDefault(); const v = $('#inputSembang').value.trim(); if (!v) return;
        chat({ dari: `${S.nama} (${negaraKu().n})`, aku: true, t: v }); $('#inputSembang').value = '';
        setTimeout(() => { if (!S.puak) return; chat({ dari: pilih(S.puak.ahli).n, t: pilih(['Setuju!', 'Diterima.', 'Roger, faham.', 'Jom operasi sama-sama!', 'Noted, terima kasih.', 'Nanti aku hantar bantuan.']) }); }, 2500 + acak() * 3000);
        renderSembang();
      };
    } else if (t === 'ahli') {
      const semua = [...p.ahli.map(a => ({ ...a, aku: false })), { n: `${S.nama} (${negaraKu().n})`, maruah: S.maruah, lv: istLv(), derma: S.stat.derma, aku: true }].sort((a, b) => b.maruah - a.maruah);
      isi.innerHTML = semua.map((a, i) => `<div class="baris" style="${a.aku ? 'background:#f1f6dc;border-color:#9aa83a' : ''}"><b style="font-family:var(--f-papar);font-size:18px;width:28px;text-align:center">${i + 1}</b><div class="teks"><b>${esc(a.n)}${a.aku ? ' (kau)' : ''}</b><small>Markas ${a.lv} · ${ligaDari(a.maruah).n} · bantuan ${a.derma}</small></div><b class="nombor" style="font-family:var(--f-papar)">${fmtN(a.maruah)}</b></div>`).join('');
    } else {
      const g = p.goal, siap = g.prog >= g.sasaran;
      isi.innerHTML = `<h3>Operasi Bersama: kumpul ${fmtN(g.sasaran)} dana untuk dana pertahanan pakatan</h3><p>Setiap dana yang kau rampas dalam operasi turut dikira. Apabila sasaran dicapai, semua anggota menerima ganjaran.</p>
        <div class="meter dana" style="height:18px"><i style="width:${100 * g.prog / g.sasaran}%"></i></div><p class="nombor" style="margin-top:6px"><b>${fmtN(g.prog)}</b> / ${fmtN(g.sasaran)} · sumbangan kau ${fmtN(g.aku)}</p>
        <p>Ganjaran: ${ik('intel')} ${g.g.intel} · ${ik('dana')} ${fmtN(g.g.dana)} · ${ik('minyak')} ${fmtN(g.g.minyak)}</p>
        <button class="btn ${siap ? 'hijau' : 'mati'}" id="tuntutGotong">${siap ? 'Tuntut ganjaran' : 'Belum selesai'}</button>`;
      $('#tuntutGotong').onclick = () => {
        if (!siap) return;
        S.res.intel += g.g.intel; tambah('dana', g.g.dana); tambah('minyak', g.g.minyak);
        S.stat.gotong++; p.goal = goalBaru(); chat({ sys: true, t: 'Operasi Bersama selesai! Sasaran baharu telah ditetapkan.' });
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
      minta = `<div class="minta"><small>${esc(TR[m.minta.k].n)} ${m.minta.dapat}/${m.minta.perlu}</small><div class="meter"><i style="width:${100 * m.minta.dapat / m.minta.perlu}%"></i></div>${penuh ? '<small>Lengkap</small>' : `<button class="btn ${ada ? 'hijau' : 'mati'}" data-derma="${m.id}" style="padding:4px 10px">Hantar${ada ? ` (${ada})` : ''}</button>`}</div>`;
    }
    return `<div class="mesej ${m.aku ? 'aku' : ''}"><b>${esc(m.dari)}</b><p>${esc(m.t)}</p>${minta}</div>`;
  }).join('');
  el.querySelectorAll('[data-derma]').forEach(b => b.onclick = () => derma(+b.dataset.derma));
  perluRenderPuak = false;
}
function derma(id) {
  const m = S.puak.chat.find(x => x.id === id); if (!m || !m.minta) return;
  const k = m.minta.k;
  if (!(S.army[k] > 0)) { toast(`Kau tiada ${TR[k].n} untuk dihantar. Latih dahulu.`, true); sfx('salah'); return; }
  if (m.minta.dapat >= m.minta.perlu) return;
  S.army[k]--; if (!S.army[k]) delete S.army[k];
  m.minta.dapat++; S.stat.derma++; misi('derma'); tambahXP(3); S.res.intel += 1; sfx('kutip');
  if (m.minta.dapat >= m.minta.perlu) setTimeout(() => { if (S.puak) chat({ dari: m.dari, t: pilih(SEMBANG.terima).replace('{n}', S.nama) }); }, 900);
  kemaskiniHUD(); simpan(); renderSembang();
}
function bukaKitab(tab) {
  pilihan = null; paparPanel(); semakMisi();
  const tabs = () => { const tm = S.misi.senarai.filter(m => m.p >= m.n && !m.ambil).length + (!S.misi.bonus && S.misi.senarai.every(m => m.ambil) ? 1 : 0); const tc = CAPAI.filter(c => (S.capai[c.k] || 0) < 3 && nilaiCapai(c.k) >= c.t[S.capai[c.k] || 0]).length; return [['misi', 'Misi harian', tm], ['capai', 'Pencapaian', tc], ['hikayat', 'Fail Risikan', S.hikayatBaru], ['laporan', 'Pertahanan', S.laporanBaru]]; };
  bukaModal('Arkib', tabs(), (t, isi) => {
    if (t === 'misi') {
      const m = S.misi, semua = m.senarai.every(x => x.ambil);
      isi.innerHTML = `<p>Tiga misi baharu setiap hari. Setiap misi memberi ${ik('intel')} 15 Intel, dan bonus ${ik('intel')} 25 jika ketiga-tiganya selesai.</p>${m.senarai.map((x, i) => {
        const j = MISI_JENIS.find(y => y.k === x.k), siap = x.p >= x.n;
        return `<div class="baris"><div class="teks"><b>${esc(j.t(x.n))}</b><div class="meter"><i style="width:${100 * x.p / x.n}%"></i></div><small class="nombor">${fmtN(x.p)} / ${fmtN(x.n)}</small></div>${x.ambil ? '<small>Dituntut</small>' : `<button class="btn ${siap ? 'hijau' : 'mati'}" data-misi="${i}">${ik('intel')} 15</button>`}</div>`;
      }).join('')}<div class="baris"><div class="teks"><b>Bonus harian</b><small>Selesaikan ketiga-tiga misi</small></div>${m.bonus ? '<small>Dituntut</small>' : `<button class="btn ${semua ? 'hijau' : 'mati'}" id="bonusMisi">${ik('intel')} 25</button>`}</div>`;
      isi.querySelectorAll('[data-misi]').forEach(b => b.onclick = () => { const x = m.senarai[+b.dataset.misi]; if (x.p < x.n || x.ambil) return; x.ambil = true; S.res.intel += 15; sfx('kutip'); kemaskiniHUD(); simpan(); modalCur.tabs = tabs(); renderModal(); });
      const bb = $('#bonusMisi'); if (bb) bb.onclick = () => { if (!semua || m.bonus) return; m.bonus = true; S.res.intel += 25; sfx('menang'); kemaskiniHUD(); simpan(); modalCur.tabs = tabs(); renderModal(); };
    } else if (t === 'capai') {
      isi.innerHTML = CAPAI.map(c => {
        const tier = S.capai[c.k] || 0, v = nilaiCapai(c.k), sasar = c.t[Math.min(2, tier)], siap = tier < 3 && v >= c.t[tier];
        return `<div class="baris"><div style="display:flex;gap:1px;flex:none">${[0, 1, 2].map(i => `<span style="width:18px;height:18px;display:inline-block">${IKON.bintang(i < tier)}</span>`).join('')}</div><div class="teks"><b>${esc(c.n)}</b><small>${esc(c.d)}: <span class="nombor">${fmtN(Math.min(v, sasar))} / ${fmtN(sasar)}</span></small><div class="meter"><i style="width:${tier >= 3 ? 100 : 100 * Math.min(1, v / sasar)}%"></i></div></div>${tier >= 3 ? '<small>Lengkap</small>' : `<button class="btn ${siap ? 'hijau' : 'mati'}" data-capai="${c.k}">${ik('intel')} ${GANJARAN_CAPAI[tier]}</button>`}</div>`;
      }).join('');
      isi.querySelectorAll('[data-capai]').forEach(b => b.onclick = () => { const c = CAPAI.find(x => x.k === b.dataset.capai), tier = S.capai[c.k] || 0; if (tier >= 3 || nilaiCapai(c.k) < c.t[tier]) return; S.capai[c.k] = tier + 1; S.res.intel += GANJARAN_CAPAI[tier]; sfx('menang'); kemaskiniHUD(); simpan(); modalCur.tabs = tabs(); renderModal(); });
    } else if (t === 'hikayat') {
      S.hikayatBaru = 0;
      const n = Object.keys(S.hikayat).length;
      isi.innerHTML = `<p>Fail terbuka apabila negara kau maju. Setiap fail ialah ringkasan fakta geopolitik sebenar. <b>${n} / ${HIKAYAT.length}</b> dikumpul.</p><div class="hikayat">${HIKAYAT.map(h => S.hikayat[h.k] ? `<div class="kad-hikayat"><div class="jalur"></div><div class="dalam"><small>${esc(h.era)}</small><b>${esc(h.t)}</b><p>${esc(h.p)}</p></div></div>` : `<div class="kad-hikayat kunci"><div class="dalam"><small>Terkunci</small><b>${esc(h.t)}</b><p>Syarat: ${esc(h.s)}</p></div></div>`).join('')}</div>`;
    } else {
      S.laporanBaru = 0;
      isi.innerHTML = S.laporan.length ? S.laporan.map((l, i) => `<div class="baris"><div style="display:flex;flex:none">${[0, 1, 2].map(j => `<span style="width:18px;height:18px;display:inline-block">${IKON.bintang(j < l.bin)}</span>`).join('')}</div><div class="teks"><b>${l.bin === 0 ? 'Berjaya dipertahankan' : 'Pangkalan diserang'}: ${esc(l.nama)}</b><small>${new Date(l.masa).toLocaleString('ms-MY', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} · Markas ${l.L} · Pengaruh ${l.m > 0 ? '+' : ''}${l.m}${l.hilang.dana || l.hilang.minyak ? ` · hilang ${fmtN(l.hilang.dana)} dana, ${fmtN(l.hilang.minyak)} minyak` : ''}</small></div>${l.bin > 0 && !l.balas ? `<button class="btn merah" data-balas="${i}">Balas</button>` : ''}</div>`).join('') : '<p>Belum ada serangan ke atas pangkalan kau. Pangkalan diserang hanya semasa kau tiada; ketegangan tinggi menambah kekerapan. Perisai melindungi selepas kekalahan besar.</p>';
      isi.querySelectorAll('[data-balas]').forEach(b => b.onclick = () => { const l = S.laporan[+b.dataset.balas]; if (!Object.values(S.army).some(n => n > 0)) { toast('Latih unit dahulu.', true); return; } l.balas = true; mulaPerang({ jenis: 'jiran', nama: l.nama, L: l.L, seed: l.seed, jarak: l.jarak || 2000 }); });
    }
    kemaskiniHUD();
  }, tab);
}
function bukaSerang() {
  pilihan = null; paparPanel();
  bukaModal('Operasi', [['jiran', 'Cari sasaran'], ['kempen', 'Latihan OPFOR']], (t, isi) => {
    const jumlah = Object.values(S.army).reduce((a, b) => a + b, 0), ada = jumlah > 0 || wiraSedia('komander') || S.bantuan.length;
    const ringkas = Object.entries(S.army).filter(([, n]) => n > 0).map(([k, n]) => `${namaUnit(k)} × ${n}`).join(', ') || 'Tiada unit';
    const buff = [S.buff.propaganda && `Propaganda ×${S.buff.propaganda}`, S.buff.proksi && `Proksi ×${S.buff.proksi}`, S.buff.palsu && `Alasan perang ×${S.buff.palsu}`].filter(Boolean).join(' · ');
    if (t === 'jiran') {
      const lg = ligaDari(S.maruah);
      isi.innerHTML = `<h3>Operasi ke atas negara rekaan</h3><p>Serbu pangkalan negara fiksyen untuk merampas dana dan minyak. Menang menambah Pengaruh dan bonus tahap kuasa; kalah mengurangkannya. Setiap operasi menaikkan <b>ketegangan</b> kecuali ada alasan perang. Kos logistik minyak bergantung pada jarak.</p>
        <div class="baris"><div class="teks"><b>Pasukan kau</b><small>${esc(ringkas)}${S.bantuan.length ? ` · bantuan sekutu ${S.bantuan.length}` : ''}</small></div></div>
        <div class="baris"><div class="teks"><b>${lg.n} · Pengaruh ${fmtN(S.maruah)}</b><small>Bonus untuk kemenangan tiga bintang: ${fmtN(lg.bonus)} dana dan minyak</small></div></div>
        <div class="baris"><div class="teks"><b>Status dunia</b><small>Imej ${Math.round(S.imej)} · Ketegangan ${ketegangan()}${buff ? ` · ${buff}` : ''}</small></div></div>
        <button class="btn merah" id="btnCari" style="font-size:18px;padding:12px 18px">Cari sasaran ${btnKos(['dana', kosCari()])}</button>`;
      $('#btnCari').onclick = () => { if (!ada) { toast('Latih unit dahulu di Berek Tentera.', true); sfx('salah'); return; } cariLawan(); };
    } else {
      isi.innerHTML = `<p>Akademi latihan menentang pasukan lawan rekaan (OPFOR). Rampasan penuh pada kemenangan pertama; ulangan memberi 30%. Latihan tidak menaikkan ketegangan.</p>${KEMPEN.map((k, i) => {
        const bin = S.kempen[i] || 0, buka = i === 0 || (S.kempen[i - 1] || 0) > 0;
        return `<div class="baris" style="${buka ? '' : 'opacity:.55'}"><b style="font-family:var(--f-papar);font-size:18px;width:26px;text-align:center">${i + 1}</b><div class="teks"><b>${esc(k.n)}</b><small>${esc(k.c)}</small><small>Kekuatan lawan: Markas ${k.L}</small></div><div style="display:flex;flex-direction:column;align-items:center;gap:4px"><div style="display:flex">${[0, 1, 2].map(j => `<span style="width:16px;height:16px;display:inline-block">${IKON.bintang(j < bin)}</span>`).join('')}</div>${buka ? `<button class="btn merah" data-kempen="${i}">Mula</button>` : '<small>Terkunci</small>'}</div></div>`;
      }).join('')}`;
      isi.querySelectorAll('[data-kempen]').forEach(b => b.onclick = () => { if (!ada) { toast('Latih unit dahulu di Berek Tentera.', true); sfx('salah'); return; } serangKempen(+b.dataset.kempen); });
    }
  });
}

/* ================= Operasi strategik & dunia ================= */
const opsBuka = k => istLv() >= OPS[k].buka && (k === 'diplomasi' || adaAktif('pusat_risikan'));
const opsSedia = k => opsBuka(k) && kini() >= (S.opsCd[k] || 0) && Object.entries(OPS[k].kos).every(([r, n]) => S.res[r] >= n);
function jalankanOps(k) {
  const o = OPS[k];
  if (!opsBuka(k)) { toast(k === 'diplomasi' ? `Dibuka pada Markas ${o.buka}.` : `Perlu Pusat Risikan dan Markas ${o.buka}.`, true); sfx('salah'); return; }
  if (kini() < (S.opsCd[k] || 0)) { toast(`Operasi ini sedang bertenang: ${masa((S.opsCd[k] - kini()) / 1000)}.`, true); return; }
  for (const [r, n] of Object.entries(o.kos)) if (S.res[r] < n) { toast(`${SUMBER[r].n} tidak cukup (perlu ${fmtN(n)}).`, true); sfx('salah'); return; }
  for (const [r, n] of Object.entries(o.kos)) S.res[r] -= n;
  S.opsCd[k] = kini() + o.cd * 1000; S.stat.ops++; S.stat['ops_' + k] = (S.stat['ops_' + k] || 0) + 1; misi('ops');
  // Pusat Risikan bertahap tinggi mengurangkan risiko terbongkar
  const pr = S.bld.filter(b => b.t === 'pusat_risikan' && b.lv >= 1).reduce((m, b) => Math.max(m, b.lv), 0);
  const risiko = Math.max(0, o.risiko - pr * .03), bongkar = acak() < risiko;
  let hasil;
  if (k === 'diplomasi') { ubahImej(o.imej); S.tegang = Math.max(0, S.tegang - 20); hasil = 'Hubungan dipulihkan: imej +10, ketegangan −20.'; }
  else if (bongkar) {
    S.stat.bongkar++; ubahImej(o.imej); S.tegang = clamp(S.tegang + 10, 0, 100);
    if (o.sekatan && !disekat()) kenaSekatan(30);
    hasil = o.bongkar;
  } else {
    if (k === 'propaganda') S.buff.propaganda += 3; else if (k === 'proksi') S.buff.proksi += 2; else if (k === 'benderapalsu') S.buff.palsu += 1;
    hasil = 'Berjaya tanpa dikesan. ' + o.d;
  }
  S.opsLog.unshift({ k, masa: kini(), bongkar, hasil }); S.opsLog = S.opsLog.slice(0, 12);
  toast(hasil, bongkar); sfx(bongkar ? 'kalah' : 'siap'); semakHikayat(); kemaskiniHUD(); simpan(); renderModal();
}
function bukaOps(tab) {
  pilihan = null; paparPanel();
  bukaModal('Strategi', [['ops', 'Operasi strategik'], ['aset', 'Aset negara'], ['dunia', 'Hubungan dunia'], ['negara', 'Dataset negara']], (t, isi) => {
    if (t === 'aset') { renderAset(isi); return; }
    if (t === 'ops') {
      const pr = S.bld.filter(b => b.t === 'pusat_risikan' && b.lv >= 1).reduce((m, b) => Math.max(m, b.lv), 0);
      isi.innerHTML = `<p>Operasi bukan konvensional memberi kelebihan dalam operasi seterusnya, tetapi boleh terbongkar dan menjatuhkan imej antarabangsa. Imej bawah 30 mencetuskan sekatan ekonomi. ${pr ? `Pusat Risikan tahap ${pr} mengurangkan risiko terbongkar sebanyak ${pr * 3}%.` : 'Bina <b>Pusat Risikan</b> (Markas 3) untuk membuka operasi rahsia.'}</p>
        <div class="baris"><div class="teks"><b>Imej ${Math.round(S.imej)} · Ketegangan ${ketegangan()}${disekat() ? ` · Sekatan ${masa((S.sekatan - kini()) / 1000)}` : ''}</b><div class="meter dana"><i style="width:${S.imej}%"></i></div><small>Kelebihan aktif: propaganda ${S.buff.propaganda}, proksi ${S.buff.proksi}, alasan perang ${S.buff.palsu} (dikira setiap operasi)</small></div></div>
        ${Object.entries(OPS).map(([k, o]) => {
          const buka = opsBuka(k), cd = Math.max(0, (S.opsCd[k] || 0) - kini()), risiko = Math.max(0, o.risiko - pr * .03);
          return `<div class="baris" style="${buka ? '' : 'opacity:.55'}"><div class="teks"><b>${esc(o.n)}</b><small>${esc(o.d)}</small><small>${o.risiko ? `Risiko terbongkar ${Math.round(risiko * 100)}% · ` : ''}${Object.entries(o.kos).map(([r, n]) => `${ik(r)} ${fmtN(n)}`).join(' ')}${buka ? '' : ` · Markas ${o.buka}${k === 'diplomasi' ? '' : ' + Pusat Risikan'}`}</small></div>${buka ? (cd ? `<small class="nombor" data-sampai="${S.opsCd[k]}">${masa(cd / 1000)}</small>` : `<button class="btn ${k === 'diplomasi' ? 'hijau' : 'merah'} ${opsSedia(k) ? '' : 'mati'}" data-ops="${k}">Lancar</button>`) : ''}</div>`;
        }).join('')}
        ${S.opsLog.length ? `<h3>Log operasi</h3>${S.opsLog.slice(0, 6).map(l => `<div class="mesej ${l.bongkar ? 'bongkar' : ''}"><b>${esc(OPS[l.k].n)}</b><p>${esc(l.hasil)}</p></div>`).join('')}` : ''}`;
      isi.querySelectorAll('[data-ops]').forEach(b => b.onclick = () => jalankanOps(b.dataset.ops));
    } else if (t === 'dunia') {
      const n = negaraKu(), nama = k => (negaraDari(k) || { n: k }).n, senarai = (a, w) => (a && a.length ? a.map(k => `<span class="cip" style="--w:${w}">${esc(nama(k))}</span>`).join('') : '<small>Tiada</small>');
      isi.innerHTML = `<h3>${esc(n.n)}</h3><p>${esc(n.nota)}</p>
        <div class="grid-statistik"><div><small>KDNK</small><b>USD ${fmtN(n.kdnk)} bil</b></div><div><small>Penduduk</small><b>${n.pop} juta</b></div><div><small>Belanja pertahanan</small><b>USD ${n.belanja} bil</b></div><div><small>Tahap kekuatan</small><b>${tierNegara(n)} / 7</b></div></div>
        <div class="baris"><div class="teks"><b>Blok</b><div class="cip-baris">${n.blok.length ? n.blok.map(b => `<span class="cip" title="${esc(BLOK[b] || b)}">${esc(b)}</span>`).join('') : '<small>Tidak menyertai blok utama</small>'}</div></div></div>
        <div class="baris"><div class="teks"><b>Sekutu rapat</b><div class="cip-baris">${senarai(n.sekutu, '#2f9a3a')}</div></div></div>
        <div class="baris"><div class="teks"><b>Pertikaian / ketegangan</b><div class="cip-baris">${senarai([...(n.seteru || []), ...(n.tegang || [])], '#b8322f')}</div></div></div>
        <div class="baris"><div class="teks"><b>Kekuatan sumber</b><small>${n.kuat.length ? n.kuat.map(k => ({ minyak: 'Minyak & gas: hasil minyak +20%, logistik −10%', nadir: 'Mineral kritikal: hasil unsur nadir +30%', kewangan: 'Kewangan: hasil dana +20%', teknologi: 'Teknologi: kajian 20% lebih cepat' })[k]).join(' · ') : 'Tiada bonus khusus'}</small></div></div>
        <p class="kecil" style="font-size:12px">Hubungan dan angka ialah anggaran ringkas daripada sumber awam untuk tujuan permainan. Operasi dalam permainan hanya menyasarkan negara rekaan.</p>`;
    } else renderNegara(isi, false);
  }, tab);
}
/* Inventori aset sebenar negara pemain dan negara lain dalam dataset ASET. */
let asetLihat = null;
function renderAset(isi) {
  const k = asetLihat || S.negara, n = negaraDari(k) || negaraKu(), sen = ASET[k] || [], ada = Object.keys(ASET);
  const jenisSlot = sl => TR[sl] ? 'u' : B[sl] ? 'b' : 't';
  isi.innerHTML = `<p>Aset sebenar dipetakan kepada slot permainan. Kesan ialah imbangan permainan rekaan, bukan prestasi sebenar. Negara tanpa data menggunakan unit generik. Tambah aset dalam <code>data.js</code> → <code>ASET</code>.</p>
    <div class="cip-baris" style="margin-bottom:8px">${ada.map(x => `<button class="cip ${x === k ? 'aktif' : ''}" data-aset="${x}">${esc(negaraDari(x).n)}${x === S.negara ? ' (kau)' : ''}</button>`).join('')}</div>
    <h3>${esc(n.n)}</h3>
    ${sen.length ? `<div class="senarai-aset">${sen.map((a, i) => `<div class="baris"><canvas data-aset-i="${i}" style="width:84px;height:66px;flex:none;border-radius:10px;background:#dfe3d0"></canvas><div class="teks"><b>${esc(a.n)}</b><small>Kategori: ${esc(a.kat)}</small><small>Peranan game: ${esc(a.peranan)}</small><small class="aset">Slot: ${esc(namaSlot(a.slot))} · ${esc(a.kesan)}</small></div></div>`).join('')}</div>` : '<p>Belum ada data aset untuk negara ini.</p>'}
    ${k !== S.negara ? '<p class="kecil" style="font-size:12px">Aset hanya digunakan oleh negara yang kau pimpin. Tukar negara dalam Tetapan.</p>' : ''}`;
  isi.querySelectorAll('[data-aset]').forEach(b => b.onclick = () => { asetLihat = b.dataset.aset; renderAset(isi); });
  const lama = S.negara; S.negara = k; // pratonton guna warna aset negara yang dilihat
  try {
    isi.querySelectorAll('[data-aset-i]').forEach(c => { const a = sen[+c.dataset.asetI], j = jenisSlot(a.slot); if (j === 'u') lukisPratontonUnit(c, a.slot); else if (j === 'b') lukisPratonton(c, a.slot); else lukisKeKanvas(c, () => lukisIkonTaktik(a.slot), 1.4); });
  } finally { S.negara = lama; }
}
let tapisWil = 'Semua';
function renderNegara(isi, pilihMod) {
  const wil = ['Semua', ...new Set(NEGARA.map(n => n.wil))];
  const sen = NEGARA.filter(n => tapisWil === 'Semua' || n.wil === tapisWil).slice().sort((a, b) => b.belanja - a.belanja);
  isi.innerHTML = `${pilihMod ? '<p>Pilih negara yang kau pimpin. Kekuatan sumber negara memberi bonus kecil; blok menentukan sekutu dalam pakatan. Semua negara boleh menang dengan strategi yang betul.</p>' : `<p>${NEGARA.length} negara dalam dataset (anggaran 2024/2025). Tambah negara lain dengan menyalin satu baris dalam <code>data.js</code>.</p>`}
    <div class="cip-baris" style="margin-bottom:8px">${wil.map(w => `<button class="cip ${w === tapisWil ? 'aktif' : ''}" data-wil="${esc(w)}">${esc(w)}</button>`).join('')}</div>
    <div class="senarai-negara">${sen.map(n => `<div class="baris ${n.k === S.negara ? 'pilih' : ''}"><span class="kod">${n.k}</span><div class="teks"><b>${esc(n.n)}${n.nuklear ? ' <small title="Kuasa nuklear">☢</small>' : ''}</b><small>${esc(n.blok.join(' · ') || 'Tiada blok')}${ASET[n.k] ? ` · ${ASET[n.k].length} aset` : ''} · KDNK ${fmtK(n.kdnk)} bil · ${n.pop} juta · belanja ${n.belanja} bil</small><small>${esc(n.nota)}</small></div>${pilihMod ? `<button class="btn ${n.k === 'MY' ? 'hijau' : ''}" data-negara="${n.k}">Pimpin</button>` : `<b class="nombor" style="font-family:var(--f-papar)">T${tierNegara(n)}</b>`}</div>`).join('')}</div>`;
  isi.querySelectorAll('[data-wil]').forEach(b => b.onclick = () => { tapisWil = b.dataset.wil; renderNegara(isi, pilihMod); });
  isi.querySelectorAll('[data-negara]').forEach(b => b.onclick = () => {
    S.negara = b.dataset.negara; const n = negaraKu();
    if (S.puak) S.puak.nama = namaPakatan();
    toast(`Kau kini memimpin ${n.n}.`); sfx('gong'); kemaskiniHUD(); simpan(); tutupModal(true);
  });
}
function pilihNegara() {
  bukaModal('Pilih negara', null, (_, isi) => renderNegara(isi, true));
}

function bukaTetapan() {
  pilihan = null; paparPanel();
  bukaModal('Tetapan', null, (_, isi) => {
    isi.innerHTML = `<div class="medan"><label for="inputNama"><b>Nama komander</b></label><input id="inputNama" maxlength="20" value="${esc(S.nama)}"></div>
      <div class="baris"><div class="teks"><b>Negara</b><small>${esc(negaraKu().n)} · ${esc(negaraKu().blok.join(', ') || 'tiada blok')}</small></div><button class="btn kayu" id="btnNegara">Tukar</button></div>
      <div class="baris"><div class="teks"><b>Bunyi</b><small>Kesan bunyi operasi dan binaan</small></div><button class="btn kayu" id="btnBunyi">${S.bunyi ? 'Hidup' : 'Mati'}</button></div>
      <h3>Tentang Kuasa Dunia</h3><p>Permainan strategi bina pangkalan bertemakan pertembungan geopolitik. Bina ekonomi dan pertahanan, latih unit darat dan udara, rancang logistik, pilih doktrin, jalankan operasi strategik dan urus imej antarabangsa. Fail Risikan dan kuiz merangkum fakta geopolitik sebenar.</p>
      <p>Semua operasi ketenteraan dalam permainan menyasarkan negara dan pasukan rekaan. Dataset negara sebenar digunakan untuk pilihan negara, blok, sekutu dan bonus sumber.</p>
      <p>Tiada pembelian sebenar. Simpanan permainan disimpan dalam pelayar peranti ini sahaja.</p>
      <div class="baris" style="border-color:#e0a090"><div class="teks"><b>Mula semula</b><small>Padam pangkalan dan semua kemajuan pada peranti ini.</small></div><button class="btn merah" id="btnReset">Mula semula</button></div>`;
    $('#inputNama').onchange = e => { S.nama = e.target.value.trim().slice(0, 20) || 'Komander'; kemaskiniHUD(); simpan(); };
    $('#btnNegara').onclick = pilihNegara;
    $('#btnBunyi').onclick = () => { S.bunyi = !S.bunyi; bukaAudio(); sfx('ketik'); simpan(); renderModal(); };
    let sah = false;
    $('#btnReset').onclick = e => {
      if (!sah) { sah = true; e.target.textContent = 'Ketik sekali lagi untuk padam'; return; }
      S = keadaanBaru(); semakHikayat(true); semakMisi(); pilihan = null; tutupModal(); kameraAsal(); kemaskiniHUD(); simpan(); pilihNegara();
    };
  });
}
function paparEra(lv) {
  const e = ERA[lv - 1], kad = HIKAYAT.find(h => ({ 2: 'melaka', 3: 'hormuz', 4: 'suez', 6: 'nuklear' })[lv] === h.k);
  sfx('gong');
  bukaModal(`Fasa baharu: ${e.nama}`, null, (_, isi) => {
    isi.innerHTML = `<p style="font-weight:700">Markas Komando kini tahap ${lv} · ${esc(e.masa)}</p>${kad ? `<div class="kad-hikayat" style="margin-bottom:12px"><div class="jalur"></div><div class="dalam"><small>${esc(kad.era)}</small><b>${esc(kad.t)}</b><p>${esc(kad.p)}</p></div></div>` : ''}<p>Bangunan dan tahap baharu kini dibuka. Lihat menu Bina.</p><button class="btn merah" id="eraOk">Teruskan</button>`;
    $('#eraOk').onclick = tutupModal;
  });
}
function paparKeputusan(r) {
  bukaModal(r.menang ? 'Kemenangan!' : 'Kekalahan', null, (_, isi) => {
    const kk = KEMPEN[r.lw.idx];
    isi.innerHTML = `<div class="keputusan"><div class="bintang-besar">${[0, 1, 2].map(i => IKON.bintang(i < r.bin)).join('')}</div><h3>${esc(r.lw.nama)} · ${r.peratus}% musnah</h3>
      <div class="angka">${['dana', 'minyak', 'nadir'].filter(x => r.dapat[x] > 0 || x !== 'nadir').map(x => `<span>${ik(x)} ${fmtN(r.dapat[x])}</span>`).join('')}</div>
      ${r.lw.jenis === 'jiran' ? `<p>Pengaruh ${r.maruah >= 0 ? '+' : ''}${r.maruah} · kini ${fmtN(S.maruah)} (${ligaDari(S.maruah).n})</p>` : ''}
      ${r.lw.jenis === 'jiran' ? `<p>${r.palsu ? 'Alasan perang digunakan: ketegangan tidak naik, rampasan +30%.' : `Ketegangan +${r.tegang} · kini ${ketegangan()}`}</p>` : ''}
      ${r.bonus ? `<p>Bonus tahap kuasa: ${ik('dana')} ${fmtN(r.bonus.dana)} · ${ik('minyak')} ${fmtN(r.bonus.minyak)}</p>` : ''}
      ${BT && BT.karam ? '<p><b>Simpanan strategik ditemui!</b> Rampasan pangkalan ini luar biasa besar.</p>' : ''}
      ${r.lw.jenis === 'kempen' && r.menang && kk ? `<p>${esc(kk.n)} selesai. Doktrin kau semakin matang.</p>` : ''}
      ${!r.menang ? '<p>Cuba susunan lain: musnahkan Radar dahulu, hantar Kereta Kebal untuk menarik tembakan, lumpuhkan pertahanan dengan Perang Elektronik, kemudian unit udara.</p>' : ''}
      <button class="btn hijau" id="pulang" style="font-size:18px;padding:12px 22px">Pulang ke pangkalan</button></div>`;
    $('#pulang').onclick = pulangKota;
  });
}

/* ================= HUD perang ================= */
function binaKadPerang() {
  const k = [];
  for (const [t, n] of Object.entries(BT.tentera)) k.push({ id: t, kelas: '', nama: namaUnit(t), n });
  for (const w of ['komander', 'elit']) if (BT.wira[w] !== 'tiada') k.push({ id: w, kelas: 'wira', nama: WIRA[w].n });
  for (const t of Object.keys(TAKTIK)) if (BT.taktik[t] > 0) k.push({ id: t, kelas: 'taktik', nama: namaTaktik(t) });
  if (BT.bantuan.length) k.push({ id: 'bantuan', kelas: 'bantuan', nama: 'Bantuan sekutu' });
  $('#perangBawah').innerHTML = `<div class="kad-wrap">${k.map(x => `<button class="kad ${x.kelas}" data-kad="${x.id}" aria-label="${esc(x.nama)}"><canvas></canvas><span class="k-bil"></span><span class="k-nama">${esc(x.nama)}</span><span class="kuasa" hidden>Kuasa</span></button>`).join('') || '<p style="margin:0;padding:10px">Tiada unit. Pulang dan latih di Berek Tentera.</p>'}</div><div class="kawal"><button class="btn kayu" id="btnDoktrin"></button><button class="btn kayu" id="btnRisik"></button><button class="btn kayu" id="btnLaju">x1</button><button class="btn" id="btnSeterus"></button><button class="btn merah" id="btnTamat"></button></div>`;
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
  $('#btnDoktrin').onclick = tukarDoktrin; $('#btnRisik').onclick = risik;
  $('#btnSeterus').onclick = () => cariLawan();
  $('#btnTamat').onclick = () => { if (!BT.mula) { BT = null; pulangKota(); } else tamatPerang(); };
  paparKad();
}
function lukisIkonTaktik(id) {
  if (id === 'ew') {
    ctx.fillStyle = '#4d5a2a'; ctx.fillRect(-10, 2, 20, 12); garis(0, 2, 0, -12, 2.4, '#cfd6dc'); bulat(0, -13, 3, '#7fd0ff');
    ctx.strokeStyle = '#7fd0ff'; ctx.lineWidth = 2; for (const r of [7, 12]) { ctx.beginPath(); ctx.arc(0, -13, r, -2.4, -.7); ctx.stroke(); }
  } else if (id === 'bekalan') {
    ctx.fillStyle = '#e9e3d0'; ctx.beginPath(); ctx.arc(0, -8, 13, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#6b7a3a'; ctx.lineWidth = 1.2; ctx.stroke();
    for (const x of [-12, 12]) garis(x, -8, x * .35, 5, 1.2, '#3a3a2a');
    ctx.fillStyle = '#6b7a3a'; ctx.fillRect(-7, 4, 14, 11); ctx.fillStyle = '#fff'; ctx.fillRect(-1.5, 6, 3, 7); ctx.fillRect(-4, 8.5, 8, 2);
  } else if (id === 'laut') {
    ctx.fillStyle = '#2a6fa8'; ctx.fillRect(-18, 6, 36, 10);
    ctx.fillStyle = '#3a3f46'; ctx.beginPath(); ctx.ellipse(0, 4, 16, 5, 0, 0, 7); ctx.fill(); ctx.fillRect(-4, -4, 8, 7);
    garis(2, -6, 10, -20, 2.6, '#f4f4f0'); bulat(11, -21, 2.4, '#ff8a1a');
  } else if (id === 'balistik') {
    ctx.fillStyle = '#e9e3d0'; ctx.beginPath(); ctx.moveTo(0, -20); ctx.lineTo(5, -12); ctx.lineTo(5, 8); ctx.lineTo(-5, 8); ctx.lineTo(-5, -12); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#b8322f'; ctx.fillRect(-5, -6, 10, 3); ctx.fillStyle = '#5d6b35'; ctx.beginPath(); ctx.moveTo(-5, 2); ctx.lineTo(-10, 10); ctx.lineTo(-5, 8); ctx.moveTo(5, 2); ctx.lineTo(10, 10); ctx.lineTo(5, 8); ctx.fill();
    for (const [x, w] of [[0, '#ff8a1a'], [0, '#ffe066']]) bulat(x, 13 + (w === '#ffe066' ? -1 : 1), w === '#ffe066' ? 2.4 : 4, w);
  } else if (id === 'udara') {
    ctx.fillStyle = '#9aa3ab'; ctx.beginPath(); ctx.moveTo(-16, 0); ctx.lineTo(14, -3); ctx.lineTo(16, 0); ctx.lineTo(14, 3); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(2, 0); ctx.lineTo(-6, -12); ctx.lineTo(-10, -12); ctx.lineTo(-4, 0); ctx.lineTo(-10, 12); ctx.lineTo(-6, 12); ctx.closePath(); ctx.fill();
    for (const x of [-4, 3]) bulat(x, 9, 2.5, '#25272b'); garis(-2, 14, -2, 18, 2, '#ff8a1a');
  } else {
    garis(-8, 14, -8, -18, 2.4, '#3a3f46'); ctx.fillStyle = '#2f6fba'; ctx.fillRect(-8, -18, 20, 13); ctx.fillStyle = '#f4c20d'; bulat(2, -11.5, 3.5, '#f4c20d');
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
  const sn = $('#btnSeterus'); if (sn) { sn.hidden = BT.mula || BT.lawan.jenis !== 'jiran'; sn.innerHTML = `Seterusnya ${btnKos(['dana', kosCari()])}`; }
  const tm = $('#btnTamat'); if (tm) tm.textContent = BT.mula ? 'Tamat' : 'Pulang';
  const dk = $('#btnDoktrin'); if (dk) { dk.hidden = BT.mula; dk.innerHTML = `Doktrin<small>${esc(DOKTRIN[BT.doktrin].n)}</small>`; }
  const rs = $('#btnRisik'); if (rs) { rs.hidden = BT.mula || BT.risik; rs.innerHTML = `Risik ${btnKos(['intel', 2])}`; }
}
function paparHudPerang() {
  if (!BT) return;
  const baki = r => Math.max(0, BT.jumlahLoot[r] - BT.rampas[r]);
  const lg = BT.logistik, bf = [BT.propaganda && 'Propaganda +10%', BT.proksi && 'Proksi: pertahanan −20%', BT.palsu && 'Alasan perang'].filter(Boolean);
  $('#perangAtasKiri').innerHTML = `<h4>${esc(BT.lawan.nama)}</h4><div class="rampasan">${['dana', 'minyak', 'nadir'].filter(r => BT.jumlahLoot[r] > 0).map(r => `<div>${ik(r)}<span class="nombor">${fmtN(baki(r))}</span></div>`).join('')}</div><div class="kecil">Rampasan tersedia${BT.karam ? ' · simpanan strategik!' : ''}</div>
    <div class="kecil logistik">${BT.mula ? 'Logistik dibayar' : 'Logistik'} ${ik('minyak')} <b class="nombor">${fmtN(lg.kos)}</b> · ${fmtN(BT.lawan.jarak)} km${lg.diskaun ? ` · diskaun ${Math.round(lg.diskaun * 100)}%` : ''}</div>
    <div class="kecil">${BT.radar ? 'Radar lawan aktif: jarak pertahanan +15%' : 'Radar lawan lumpuh'}${bf.length ? ' · ' + bf.join(' · ') : ''}</div>`;
  $('#perangTengah').innerHTML = BT.mula ? `<small>Tamat dalam</small><b class="nombor">${masa(BT.masa)}</b>` : `<small>Perancangan · ${esc(DOKTRIN[BT.doktrin].n)}</small><b style="font-size:15px">Ketik di luar kawasan merah</b>`;
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
      if (perluRender && modalCur && !tekanModal && ['Tentera', 'Makmal'].includes(modalCur.tajuk) && !(modalCur.tajuk === 'Makmal' && modalCur.tab === 'kuiz')) { renderModal(); perluRender = false; }
      document.querySelectorAll('[data-sampai]').forEach(e => e.textContent = masa((+e.dataset.sampai - kini()) / 1000));
      document.querySelectorAll('[data-meter-mula]').forEach(e => e.style.width = 100 * clamp((kini() - e.dataset.meterMula) / (e.dataset.meterTamat - e.dataset.meterMula), 0, 1) + '%');
    }
    if (detikPuak > 1) { detikPuak = 0; puakDetik(); if (perluRenderPuak && modalCur && S.puak && modalCur.tajuk === S.puak.nama && modalCur.tab === 'sembang' && !tekanModal && document.activeElement?.id !== 'inputSembang') { const el = $('#modalIsi'), bawah = el.scrollHeight - el.scrollTop - el.clientHeight < 40; renderSembang(); if (bawah) el.scrollTop = el.scrollHeight; S.puak.belumBaca = 0; } }
    if (detikSimpan > 5) { detikSimpan = 0; simpan(); if (!sudahIngatRehat && kini() - mulaSesi > 45 * 60e3) { sudahIngatRehat = true; toast('Dah 45 minit bermain. Rehat sekejap; pangkalan kau terus berkembang semasa kau tiada.'); } }
    lukis(t / 1000, dt);
  } catch (e) { console.error(e); }
  requestAnimationFrame(gelung);
}

/* ================= Mula ================= */
function mula(data) {
  S = (data && data.S) || muat() || keadaanBaru();
  const asas = keadaanBaru();
  S.stat = { ...asas.stat, ...S.stat };
  for (const k of ['imej', 'tegang', 'sekatan', 'buff', 'opsCd', 'opsLog', 'doktrin']) if (S[k] == null) S[k] = asas[k];
  for (const k in TR) if (!S.troopLv[k]) S.troopLv[k] = 1;
  if (!G3.sedia) { G3.mula($('#gl')); G3.sedia = true; }
  binaHUD(); ubahSaiz(); kameraAsal();
  const jauh = kini() - (S.lastSeen || kini());
  kemaskini(kini());
  semakHikayat(true); semakMisi();
  // mesej pakatan semasa ketiadaan
  if (S.puak && jauh > 60e3) for (let i = 0; i < Math.min(4, Math.floor(jauh / 60e3)); i++) { S.puak.seterus = 0; puakDetik(); }
  const lap = seranganLuar(jauh);
  kemaskiniHUD(); paparPanel(); simpan();
  if (!S.negara) pilihNegara();
  else if (lap.length) {
    bukaModal('Semasa kau tiada', null, (_, isi) => {
      isi.innerHTML = `<p>Pangkalan kau diserang ${lap.length} kali.</p>${lap.map(l => `<div class="baris"><div style="display:flex;flex:none">${[0, 1, 2].map(j => `<span style="width:18px;height:18px;display:inline-block">${IKON.bintang(j < l.bin)}</span>`).join('')}</div><div class="teks"><b>${l.bin === 0 ? 'Berjaya dipertahankan!' : 'Diserang'} · ${esc(l.nama)}</b><small>Pengaruh ${l.m > 0 ? '+' : ''}${l.m}${l.hilang.dana ? ` · hilang ${fmtN(l.hilang.dana)} dana, ${fmtN(l.hilang.minyak)} minyak` : ''}</small></div></div>`).join('')}<p>${S.perisai > kini() ? `Perisai aktif selama ${masa((S.perisai - kini()) / 1000)}.` : 'Kuatkan pertahanan dan letak gudang di dalam tembok. Ketegangan rendah mengurangkan serangan.'}</p><button class="btn merah" id="okLap">Faham</button>`;
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
