/* Malaysia Kita · enjin permainan.
   Kau Perdana Menteri. Kalendar bergerak sebulan setiap ~40 saat semasa bermain; projek dan hasil berjalan dalam masa nyata.
   Lima bidang: pentadbiran (projek), ekonomi (belanjawan & dasar), politik (Dewan Rakyat & PRU),
   sosial (sokongan, perpaduan, krisis) dan diplomasi (hubungan & rundingan).
   Keadaan disimpan dalam localStorage peranti ini. */
'use strict';

/* ================= Utiliti ================= */
const $ = s => document.querySelector(s);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const kini = () => Date.now();
const acak = Math.random;
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pilih = (a, r = acak) => a[Math.floor(r() * a.length)];
const fmt = (n, d = 1) => (Math.round(n * 10 ** d) / 10 ** d).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const fmtN = n => Math.round(n).toLocaleString('en-US');
const rm = n => 'RM' + fmt(n, n >= 100 ? 0 : 1) + ' bil';
function masa(s) { s = Math.max(0, Math.ceil(s)); if (s >= 3600) return Math.floor(s / 3600) + 'j ' + Math.floor(s % 3600 / 60) + 'm'; if (s >= 60) return Math.floor(s / 60) + 'm ' + (s % 60) + 's'; return s + 's'; }
function rng(seed) { let s = (seed >>> 0) || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
function hariIni() { const d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
function cincang(s) { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
function campur(a, b, t) { const x = parseInt(a.slice(1), 16), y = parseInt(b.slice(1), 16), m = s => Math.round(((x >> s) & 255) * (1 - t) + ((y >> s) & 255) * t); return '#' + ((1 << 24) | (m(16) << 16) | (m(8) << 8) | m(0)).toString(16).slice(1); }
function skala3(v, a, b, w1, w2, w3) { const t = clamp((v - a) / (b - a), 0, 1); return t < .5 ? campur(w1, w2, t * 2) : campur(w2, w3, t * 2 - 2 + 1); }
const BULAN = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'];
const sigmoid = x => 1 / (1 + Math.exp(-x));
function gauss() { return (acak() + acak() + acak() - 1.5) / .5; }

/* ================= Ikon ================= */
const IK = {
  rm: '<svg class="ikon" viewBox="0 0 24 24"><rect x="2" y="6" width="20" height="12" rx="2.5" fill="#3fb06a" stroke="#0e3b22" stroke-width="1.8"/><circle cx="12" cy="12" r="3.2" fill="#c8f0d0" stroke="#0e3b22" stroke-width="1.4"/><path d="M5 9v6M19 9v6" stroke="#0e3b22" stroke-width="1.4"/></svg>',
  mp: '<svg class="ikon" viewBox="0 0 24 24"><path d="M12 2.5l2.8 5.8 6.4.9-4.6 4.5 1.1 6.3L12 17l-5.7 3 1.1-6.3-4.6-4.5 6.4-.9z" fill="#ffcc1d" stroke="#5a3d00" stroke-width="1.6" stroke-linejoin="round"/></svg>',
  pg: '<svg class="ikon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9.5" fill="#4aa8e8" stroke="#0b2a5b" stroke-width="1.8"/><path d="M3 12h18M12 2.5c3 3 3 16 0 19M12 2.5c-3 3-3 16 0 19" stroke="#0b2a5b" stroke-width="1.3" fill="none"/></svg>',
  sok: '<svg class="ikon" viewBox="0 0 24 24"><path d="M12 21s-8-5.2-8-11a4.6 4.6 0 0 1 8-3.1A4.6 4.6 0 0 1 20 10c0 5.8-8 11-8 11z" fill="#ff5a6a" stroke="#5a0b14" stroke-width="1.6" stroke-linejoin="round"/></svg>',
  projek: '<svg viewBox="0 0 24 24"><path d="M3 21h18" stroke="#0b1a33" stroke-width="2" stroke-linecap="round"/><rect x="4" y="9" width="6" height="12" fill="#ffcc1d" stroke="#0b1a33" stroke-width="1.5"/><rect x="12" y="4" width="8" height="17" fill="#9fd8ff" stroke="#0b1a33" stroke-width="1.5"/><path d="M14 7h4M14 10h4M14 13h4M6 12h2M6 15h2" stroke="#0b1a33" stroke-width="1.2"/></svg>',
  dasar: '<svg viewBox="0 0 24 24"><rect x="4" y="2.5" width="16" height="19" rx="2" fill="#fff" stroke="#0b1a33" stroke-width="1.5"/><path d="M8 7h8M8 11h8M8 15h5" stroke="#0b1a33" stroke-width="1.5" stroke-linecap="round"/><circle cx="17" cy="17" r="3.2" fill="#d1202f" stroke="#0b1a33" stroke-width="1.2"/></svg>',
  diplomasi: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="#4aa8e8" stroke="#0b1a33" stroke-width="1.5"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" stroke="#0b1a33" stroke-width="1.1" fill="none"/><path d="M15 15l5 5" stroke="#ffcc1d" stroke-width="2.4" stroke-linecap="round"/></svg>',
  parlimen: '<svg viewBox="0 0 24 24"><path d="M3 20h18M5 20v-8M9 20v-8M15 20v-8M19 20v-8M3 11h18L12 4z" stroke="#0b1a33" stroke-width="1.6" fill="#ffcc1d" stroke-linejoin="round"/></svg>',
  laporan: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" fill="#fff" stroke="#0b1a33" stroke-width="1.5"/><path d="M7 16v-3M11 16V9M15 16v-5M19 16V7" stroke="#d1202f" stroke-width="2.2" stroke-linecap="round"/></svg>',
  peristiwa: '<svg viewBox="0 0 48 48"><path d="M24 5 44 41H4z" fill="#ffcc1d" stroke="#3a1300" stroke-width="3" stroke-linejoin="round"/><path d="M24 18v11" stroke="#3a1300" stroke-width="4" stroke-linecap="round"/><circle cx="24" cy="35" r="2.6" fill="#3a1300"/></svg>',
  tetapan: '<svg viewBox="0 0 24 24"><g stroke="#0b1a33" stroke-width="1.5" fill="#dfe6ee"><path d="M10 2h4l.6 3 2.4 1.4 2.9-1 2 3.4-2.3 2v2.4l2.3 2-2 3.4-2.9-1L14.6 19l-.6 3h-4l-.6-3L7 17.6l-2.9 1-2-3.4 2.3-2v-2.4l-2.3-2 2-3.4 2.9 1L9.4 5z" stroke-linejoin="round"/><circle cx="12" cy="12" r="3.2" fill="#0b2a5b"/></g></svg>',
  jeda: '<svg viewBox="0 0 24 24"><rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor"/><rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor"/></svg>',
  main: '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>',
  laju: '<svg viewBox="0 0 24 24"><path d="M3 5v14l9-7zM12 5v14l9-7z" fill="currentColor"/></svg>',
  bintang: on => `<svg viewBox="0 0 24 24"><path d="M12 2l3 6.6 7.2.8-5.4 4.9 1.5 7.1L12 17.8 5.7 21.4l1.5-7.1L1.8 9.4 9 8.6z" fill="${on ? '#ffcc1d' : '#c9d2de'}" stroke="#0b1a33" stroke-width="1.4" stroke-linejoin="round"/></svg>`,
  pm: '<svg class="muka" viewBox="0 0 40 40"><circle cx="20" cy="20" r="19" fill="#0b2a5b" stroke="#ffcc1d" stroke-width="2"/><circle cx="20" cy="17" r="7.5" fill="#d9a079"/><path d="M12.5 14.5c0-5 15-5 15 0v-2.5c0-4.5-15-4.5-15 0z" fill="#1d1d22"/><path d="M8 37c1.5-8 22.5-8 24 0z" fill="#22314f"/><path d="M18 29.5l2 6 2-6z" fill="#d1202f"/><path d="M17 29.5h6l-3 2.5z" fill="#fff"/></svg>',
};
const PENASIHAT = [
  { k: 'e', n: 'Dr. Aisyah', b: 'Ekonomi', svg: '<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="19" fill="#1f7a5a"/><path d="M9 26c0-12 22-12 22 0v10H9z" fill="#2c3e73"/><circle cx="20" cy="19" r="6.5" fill="#c98b5a"/><path d="M11 19c0-10 18-10 18 0 0 4-1.5 9-3 11h-12c-1.5-2-3-7-3-11zm4 0c0 3 2 5.5 5 5.5s5-2.5 5-5.5-2-6-5-6-5 3-5 6z" fill="#3a6f9c"/><circle cx="17.5" cy="19" r=".9" fill="#1d1208"/><circle cx="22.5" cy="19" r=".9" fill="#1d1208"/></svg>' },
  { k: 's', n: 'Encik Rajan', b: 'Sosial', svg: '<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="19" fill="#b85c1f"/><path d="M9 37c1-8 21-8 22 0z" fill="#f3efe3"/><circle cx="20" cy="18" r="7" fill="#8a5a3a"/><path d="M13 16c0-6 14-6 14 0-2-2-12-2-14 0z" fill="#1d1d22"/><path d="M16 21.5c2.5 1.2 5.5 1.2 8 0" stroke="#1d1208" stroke-width="1.6" fill="none" stroke-linecap="round"/><circle cx="17.5" cy="17.5" r=".9" fill="#1d1208"/><circle cx="22.5" cy="17.5" r=".9" fill="#1d1208"/></svg>' },
  { k: 'p', n: 'Puan Mei Ling', b: 'Politik', svg: '<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="19" fill="#8a2a5a"/><path d="M9 37c1-8 21-8 22 0z" fill="#d1202f"/><path d="M11 23c-1-11 19-11 18 0l-1.5 3h-15z" fill="#1d1d22"/><circle cx="20" cy="18.5" r="6.6" fill="#ecc39c"/><path d="M13.5 16c1-5 12-5 13 0-4-1.5-9-1.5-13 0z" fill="#1d1d22"/><circle cx="17.5" cy="18.5" r=".9" fill="#1d1208"/><circle cx="22.5" cy="18.5" r=".9" fill="#1d1208"/></svg>' },
];
const BENDERA = {
  SG: '<rect width="30" height="10" fill="#ed2939"/><rect y="10" width="30" height="10" fill="#fff"/><circle cx="6.5" cy="5" r="3" fill="#fff"/><circle cx="7.6" cy="5" r="2.6" fill="#ed2939"/>',
  ID: '<rect width="30" height="10" fill="#ce1126"/><rect y="10" width="30" height="10" fill="#fff"/>',
  TH: '<rect width="30" height="20" fill="#a51931"/><rect y="3.3" width="30" height="13.4" fill="#f4f5f8"/><rect y="6.7" width="30" height="6.6" fill="#2d2a4a"/>',
  BN: '<rect width="30" height="20" fill="#f7e017"/><path d="M0 6l30 7v4L0 10z" fill="#fff"/><path d="M0 10l30 7v3H28L0 13.5z" fill="#000"/><circle cx="15" cy="10" r="3" fill="#cf1126"/>',
  PH: '<rect width="30" height="10" fill="#0038a8"/><rect y="10" width="30" height="10" fill="#ce1126"/><path d="M0 0l12 10L0 20z" fill="#fff"/><circle cx="4.5" cy="10" r="1.8" fill="#fcd116"/>',
  VN: '<rect width="30" height="20" fill="#da251d"/><path d="M15 4.5l1.6 4.8h5l-4 3 1.5 4.8-4.1-3-4.1 3 1.5-4.8-4-3h5z" fill="#ff0"/>',
  CN: '<rect width="30" height="20" fill="#de2910"/><path d="M6 2.5l1 3h3.1l-2.5 1.8 1 3L6 8.5 3.4 10.3l1-3L1.9 5.5H5z" fill="#ffde00"/>',
  US: '<rect width="30" height="20" fill="#fff"/>' + [0, 2, 4, 6, 8, 10, 12].map(i => `<rect y="${i * 1.54}" width="30" height="1.54" fill="#b22234"/>`).join('') + '<rect width="12" height="10.8" fill="#3c3b6e"/>',
  JP: '<rect width="30" height="20" fill="#fff"/><circle cx="15" cy="10" r="5.5" fill="#bc002d"/>',
  KR: '<rect width="30" height="20" fill="#fff"/><path d="M10 10a5 5 0 0 1 10 0z" fill="#cd2e3a"/><path d="M10 10a5 5 0 0 0 10 0z" fill="#0047a0"/>',
  IN: '<rect width="30" height="6.7" fill="#ff9933"/><rect y="6.7" width="30" height="6.6" fill="#fff"/><rect y="13.3" width="30" height="6.7" fill="#138808"/><circle cx="15" cy="10" r="2.3" fill="none" stroke="#000080" stroke-width=".8"/>',
  SA: '<rect width="30" height="20" fill="#006c35"/><rect x="7" y="13" width="16" height="1.4" fill="#fff"/><path d="M8 8h14" stroke="#fff" stroke-width="1.6"/>',
  EU: '<rect width="30" height="20" fill="#003399"/>' + Array.from({ length: 12 }, (_, i) => `<circle cx="${15 + Math.cos(i / 12 * 6.283) * 6}" cy="${10 + Math.sin(i / 12 * 6.283) * 6}" r=".9" fill="#ffcc00"/>`).join(''),
  AU: '<rect width="30" height="20" fill="#00008b"/><path d="M0 0l13 9M13 0L0 9" stroke="#fff" stroke-width="1.6"/><path d="M6.5 0v9M0 4.5h13" stroke="#fff" stroke-width="2.6"/><path d="M6.5 0v9M0 4.5h13" stroke="#e4002b" stroke-width="1.2"/><circle cx="22" cy="6" r="1" fill="#fff"/><circle cx="25" cy="11" r="1" fill="#fff"/><circle cx="20" cy="14" r="1" fill="#fff"/><circle cx="7" cy="15" r="1.6" fill="#fff"/>',
};
const bendera = k => `<svg class="bendera" viewBox="0 0 30 20" aria-hidden="true">${BENDERA[k]}</svg>`;

/* ================= Keadaan ================= */
const KUNCI = 'malaysiaKita.v1';
let S = null, mode = 'peta', pilihanN = null, mulaSesi = kini(), sudahIngatRehat = false;
const cam = { x: 0, z: 0, zum: 1 };

function keadaanBaru() {
  const t = kini(), r = rng(2026), negeri = {};
  for (const n of NEGERI) negeri[n.k] = { pop: n.pop, kdnk: n.kdnk, sok: Math.round(44 + r() * 14), kerja: n.kerja, tumbuhSemasa: n.tumbuh, mod: 0, projek: [], hasil: 0, last: t, lawatan: -99 };
  const tambahP = (k, j) => negeri[k].projek.push({ j, lv: 1, busy: null });
  tambahP('SGR', 'pelabuhan'); tambahP('PNG', 'teknologi'); tambahP('KDH', 'padi'); tambahP('TRG', 'minyak'); tambahP('SBH', 'pelancongan'); tambahP('SWK', 'tenaga'); tambahP('JHR', 'pusatdata');
  negeri.SGR.hasil = 1.6; negeri.TRG.hasil = .8;
  const kdnk = NEGERI.reduce((a, n) => a + n.kdnk, 0);
  return {
    v: 1, negeri, nama: 'Anda', bulan: 0, penggal: 1, bulanPenggal: 0, rm: 30, hutang: kdnk * .64, mp: 15, pg: 15, inflasi: 2.0, kejutan: 0, perpaduan: 62,
    dasar: Object.fromEntries(Object.entries(DASAR).map(([k, d]) => [k, d.awal])),
    hubungan: Object.fromEntries(NEGARA.map(n => [n.k, n.h])), lawatan: {}, perjanjian: [],
    kerusi: { kami: 128, borneo: 22, lawan: 72 }, putrajaya: { lv: 1, busy: null }, megaProjek: {}, mega: [],
    peristiwa: [], permintaan: [], diskaun: {}, bonusHasil: null, tumbuhMod: [], fokus: null,
    stat: { projek: 0, kutip: 0, peristiwa: 0, perjanjian: 0, pru: 0, kuiz: 0, negeriPuas: 0, mega: 0, lawatan: 0, dasar: 0, permintaan: 0, ketik: 0 },
    capai: {}, misi: null, kuiz: { hari: '', jawab: 0 }, langkah: 0, laju: 1, lensa: 'peta', berita: [], sejarahPRU: [], legasi: [], bunyi: true, lastSeen: t, acc: 0, nextId: 1, tamat: false,
  };
}
function simpan() { if (!S) return; S.lastSeen = kini(); try { localStorage.setItem(KUNCI, JSON.stringify(S)); } catch (e) { /* storan disekat */ } }
function muat() { try { const j = localStorage.getItem(KUNCI); if (j) { const o = JSON.parse(j); if (o && o.v === 1 && o.negeri) return o; } } catch (e) { } return null; }

/* ================= Peraturan asas ================= */
const kdnkJumlah = () => NEGERI.reduce((a, n) => a + S.negeri[n.k].kdnk, 0);
const popJumlah = () => NEGERI.reduce((a, n) => a + S.negeri[n.k].pop, 0);
const perKapita = k => k ? S.negeri[k].kdnk / S.negeri[k].pop : kdnkJumlah() / popJumlah();   // RM ribu seorang
const sokNasional = () => NEGERI.reduce((a, n) => a + S.negeri[n.k].sok * S.negeri[n.k].pop, 0) / popJumlah();
const kerjaNasional = () => NEGERI.reduce((a, n) => a + S.negeri[n.k].kerja * S.negeri[n.k].pop, 0) / popJumlah();
const hutangPct = () => 100 * S.hutang / kdnkJumlah();
const fasa = () => S.putrajaya.lv;
const pasukanJumlah = () => 2 + (fasa() >= 2) + (fasa() >= 4) + (fasa() >= 6);
const pasukanSibuk = () => NEGERI.reduce((a, n) => a + S.negeri[n.k].projek.filter(p => p.busy).length, 0) + (S.putrajaya.busy ? 1 : 0) + Object.values(S.megaProjek).filter(m => !m.siap).length;
const pasukanLapang = () => pasukanJumlah() - pasukanSibuk();
const maxLvProjek = () => Math.min(5, fasa() + 1);
const fitNilai = (k, j) => { const f = PROJEK[j].fit; return f ? NEG[k].fit[f] : 1; };
const kosProjek = (j, lv) => PROJEK[j].kos * Math.pow(1.8, lv - 1) * (S.diskaun[j] > S.bulan ? .5 : 1) * (S.fokus === 'pembangunan' ? .8 : 1);
const masaProjek = (j, lv) => Math.round(PROJEK[j].tb * T_PROJEK[lv - 1]);
const projekDi = (k, j) => S.negeri[k].projek.find(p => p.j === j);
const kadarHasil = k => S.negeri[k].projek.reduce((a, p) => { const d = PROJEK[p.j]; if (!d.hasil || p.lv < 1 || p.busy) return a; let m = 1; if (S.bonusHasil && S.bonusHasil.j === p.j && S.bonusHasil.sampai > S.bulan) m = S.bonusHasil.x; return a + d.hasil * p.lv * fitNilai(k, p.j) * m; }, 0);   // RM bil / minit
const capHasil = k => kadarHasil(k) * 25;
function indeksHijau() { let h = 18; for (const n of NEGERI) for (const p of S.negeri[n.k].projek) { if (p.lv < 1) continue; if (p.j === 'tenaga') h += p.lv * 2.2 * NEG[n.k].fit.tenaga; if (p.j === 'minyak') h -= p.lv * .8; } return clamp(h, 0, 100); }
function tahapNegeri(k) { const st = S.negeri[k], lvSum = st.projek.reduce((a, p) => a + p.lv, 0), pk = perKapita(k); return clamp(1 + Math.floor(lvSum / 3) + (pk > 60 ? 1 : 0) + (pk > 110 ? 1 : 0), 1, 6); }
const namaBulan = b => `${BULAN[b % 12]} ${2026 + Math.floor(b / 12)}`;
function tambahBerita(t) { S.berita.unshift({ b: S.bulan, t }); S.berita = S.berita.slice(0, 40); paparTicker(); }
function ubahSok(k, n) { const st = S.negeri[k]; st.mod += n; st.sok = clamp(st.sok + n * .5, 3, 97); }
function ubahSokSemua(n) { for (const x of NEGERI) ubahSok(x.k, n); }
function ubahHub(k, n) { S.hubungan[k] = clamp(S.hubungan[k] + n, 0, 100); }

/* ================= Masa nyata: projek & hasil ================= */
function kemaskiniMasa(t) {
  for (const n of NEGERI) {
    const st = S.negeri[n.k];
    for (const p of st.projek) if (p.busy && t >= p.busy.until) {
      p.lv = p.busy.toLv; p.busy = null; S.stat.projek++; misi('projek');
      toast(`${PROJEK[p.j].n} di ${n.n} siap (tahap ${p.lv})`); sfx('siap'); tambahBerita(`${PROJEK[p.j].n} tahap ${p.lv} dirasmikan di ${n.n}.`);
      perluRender = true;
    }
    const dt = (t - st.last) / 60000;
    if (dt > 0) { const r = kadarHasil(n.k); if (r > 0) st.hasil = Math.min(capHasil(n.k), st.hasil + r * dt); }
    st.last = t;
  }
  if (S.putrajaya.busy && t >= S.putrajaya.busy.until) {
    S.putrajaya.lv = S.putrajaya.busy.toLv; S.putrajaya.busy = null; S.stat.projek++;
    sfx('gong'); tambahBerita(`Kerajaan memasuki fasa ${FASA[fasa() - 1].n}.`);
    setTimeout(() => bukaModal(`Fasa baharu: ${FASA[fasa() - 1].n}`, null, (_, isi) => { isi.innerHTML = `<p>Pusat Pentadbiran Putrajaya kini tahap ${fasa()}.</p><p><b>Dibuka:</b> ${Object.values(PROJEK).filter(d => d.buka === fasa()).map(d => esc(d.n)).join(', ') || 'tahap projek lebih tinggi'}${Object.values(MEGA).some(d => d.buka === fasa()) ? `; projek mega ${Object.values(MEGA).filter(d => d.buka === fasa()).map(d => esc(d.n)).join(', ')}` : ''}.</p><p>Pasukan projek: ${pasukanJumlah()}. Tahap projek maksimum: ${maxLvProjek()}.</p><button class="btn merah" id="okFasa">Teruskan</button>`; $('#okFasa').onclick = tutupModal; }), 150);
    perluRender = true;
  }
  for (const [k, m] of Object.entries(S.megaProjek)) if (!m.siap && t >= m.until) {
    m.siap = true; S.mega.push(k); S.stat.mega++;
    for (const nk of MEGA[k].negeri) ubahSok(nk, MEGA[k].sok);
    sfx('menang'); toast(`Projek mega siap: ${MEGA[k].n}!`); tambahBerita(`${MEGA[k].n} mula beroperasi.`);
  }
  semakLangkah();
}

/* ================= Simulasi bulanan ================= */
function bulanan() {
  S.bulan++; S.bulanPenggal++;
  const d = S.dasar, K0 = kdnkJumlah(), bulanKal = S.bulan % 12;
  const fta = S.perjanjian.filter(p => p.jenis === 'fta').length, tek = S.perjanjian.filter(p => p.jenis === 'teknologi').length;
  const modNasional = S.tumbuhMod.reduce((a, m) => a + m.v, 0);
  const tenagaAda = NEGERI.some(n => (projekDi(n.k, 'tenaga') || {}).lv >= 1);
  let upkeep = 0;
  for (const n of NEGERI) {
    const st = S.negeri[n.k];
    let g = n.tumbuh + modNasional + Math.min(6, fta) * .0015 + tek * .002;
    g += [.004, 0, -.004][d.asing] + [0, 0, -.002][d.gaji] + (d.didik && S.bulan > 24 ? .002 : 0) + (d.sawit ? -.0006 * ((projekDi(n.k, 'agro') || {}).lv || 0) : 0);
    for (const p of st.projek) {
      if (p.lv < 1) continue; const pd = PROJEK[p.j];
      g += (pd.tumbuh || 0) * p.lv * fitNilai(n.k, p.j) * (pd.tenagaPerlu && !tenagaAda ? .5 : 1);
      upkeep += pd.upkeep * p.lv;
    }
    for (const mk of S.mega) if (MEGA[mk].negeri.includes(n.k)) g += MEGA[mk].tumbuh;
    g = clamp(g, -.06, .12); st.tumbuhSemasa = g; st.kdnk *= 1 + g / 12;
    st.pop *= 1 + (.011 + .004 * (st.sok - 50) / 50 + (n.bandar > 85 ? .002 : 0) - (n.bandar < 55 ? .001 : 0)) / 12;
    const sasarKerja = n.kerja - 14 * (g - n.tumbuh) + [.25, 0, -.3][d.asing] + [0, 0, .2][d.gaji];
    st.kerja += (clamp(sasarKerja, 1.5, 12) - st.kerja) * .2;
  }
  // ekonomi nasional
  const K = kdnkJumlah();
  const hasilKadar = .10 + [.045, .06, .075][d.sst] - (d.ma63 ? .004 : 0);
  const subsidiKos = [.032, .022, .012, .003][d.subsidi], bantuanKos = [.003, .006, .011][d.bantuan], didikKos = d.didik ? .004 : 0;
  const hasil = K * hasilKadar / 12, belanja = K * (.108 + subsidiKos + bantuanKos + didikKos) / 12 + S.hutang * .042 / 12 + upkeep + (S.fokus === 'sosial' ? K * .004 / 12 : 0);
  S.bajetLalu = { hasil, belanja, upkeep };
  S.rm += hasil - belanja;
  if (S.rm < 0) { S.hutang += -S.rm; S.rm = 0; }
  const sasarInf = 2 + [-.4, 0, .6, 1.5][d.subsidi] + [-.3, 0, .5][d.sst] + [0, 0, .25][d.gaji];
  S.inflasi += (sasarInf - S.inflasi) * .25 + S.kejutan; S.kejutan *= .8; S.inflasi = clamp(S.inflasi, -1, 12);
  // sokongan negeri
  for (const n of NEGERI) {
    const st = S.negeri[n.k];
    let servis = 0;
    for (const p of st.projek) { if (p.lv < 1) continue; const pd = PROJEK[p.j]; if (pd.sok) servis += pd.sok * p.lv * (pd.bandar ? .3 + n.bandar / 100 : 1) * (pd.banjir ? n.banjir * 2 : 1); }
    servis = Math.min(14, servis * .9);
    let sasar = 52 + 250 * (st.tumbuhSemasa - .04) - 3.5 * (S.inflasi - 2) - 2.5 * (st.kerja - 3.3) + servis
      + [4, 0, -3, -8][d.subsidi] + [-2, 0, 3][d.bantuan] + [2, 0, -3][d.sst] + [-1.5, 0, 2.5][d.gaji] * (n.bandar / 100) + (S.perpaduan - 60) * .1 + st.mod
      + (S.fokus === 'sosial' ? 2 : S.fokus === 'disiplin' ? -1.5 : 0);
    if ((n.k === 'SBH' || n.k === 'SWK')) sasar += d.ma63 ? 8 : -3;
    if (perKapita(n.k) < perKapita() * .5 && st.projek.length < 3) sasar -= 3;
    st.sok += (clamp(sasar, 5, 95) - st.sok) * .18; st.mod *= .88;
  }
  // perpaduan, modal politik, pengaruh, hubungan
  S.perpaduan += ((60 + (d.didik ? 3 : 0) + (S.inflasi > 4 ? -4 : 0)) - S.perpaduan) * .04; S.perpaduan = clamp(S.perpaduan, 0, 100);
  const sn = sokNasional();
  S.mp = clamp(S.mp + (sn >= 50 ? 1 : 0) + (sn >= 60 ? 1 : 0) - (sn < 38 ? 1 : 0), 0, 99);
  const purataHub = NEGARA.reduce((a, n) => a + S.hubungan[n.k], 0) / NEGARA.length;
  S.pg = clamp(S.pg + 1 + (purataHub >= 68 ? 1 : 0), 0, 99);
  for (const n of NEGARA) S.hubungan[n.k] += (n.h - S.hubungan[n.k]) * .02;
  const beza = S.hubungan.CN - S.hubungan.US;
  if (Math.abs(beza) > 25) { ubahHub(beza > 0 ? 'US' : 'CN', -1); if (S.bulan % 6 === 0) tambahBerita(`Penganalisis: Malaysia dilihat condong ke arah ${beza > 0 ? 'China' : 'Amerika Syarikat'}.`); }
  S.tumbuhMod = S.tumbuhMod.map(m => ({ ...m, baki: m.baki - 1 })).filter(m => m.baki > 0);
  if (hutangPct() > 65 && !S.amaranHutang) { S.amaranHutang = true; S.kejutan += .3; ubahSokSemua(-2); tambahBerita('Agensi penarafan memberi amaran: hutang melepasi 65% KDNK.'); toast('Hutang melepasi had 65% KDNK. Kos pinjaman meningkat.', true); }
  if (hutangPct() < 60) S.amaranHutang = false;
  // capaian negeri puas
  S.stat.negeriPuas = Math.max(S.stat.negeriPuas, NEGERI.filter(n => S.negeri[n.k].sok >= 70).length);
  // peristiwa, permintaan negeri
  for (const p of S.peristiwa.slice()) if (S.bulan - p.mula >= 3) { const ev = PERISTIWA.find(e => e.k === p.k); selesaiPeristiwa(p, ev.pilihan.length - 1, true); }
  if (S.peristiwa.length < 3 && acak() < .42) janaPeristiwa();
  for (const q of S.permintaan.slice()) if (S.bulan > q.sampai) { ubahSok(q.negeri, -5); S.permintaan = S.permintaan.filter(x => x !== q); tambahBerita(`Kerajaan negeri ${NEG[q.negeri].n} kecewa permohonan ${PROJEK[q.j].n} tidak dipenuhi.`); }
  if (S.permintaan.length < 2 && acak() < .2) janaPermintaan();
  if (bulanKal === 0 && S.bulan > 0) setTimeout(laporanTahunan, 300);
  if (S.bulanPenggal >= 60) setTimeout(() => jalankanPRU(false), 400);
  if (S.bulan % 3 === 0) tambahBerita(`KDNK suku tahun ini tumbuh ${fmt((K / K0 - 1) * 1200, 1)}% (kadar tahunan). Inflasi ${fmt(S.inflasi)}%.`);
  if (bulanKal === 10) tambahBerita('Jabatan Meteorologi: monsun timur laut bermula. Negeri pantai timur diminta bersiap sedia.');
  perluRender = true; simpan();
}

/* ================= Peristiwa ================= */
function janaPeristiwa() {
  const bk = S.bulan % 12, baru = S.peristiwa.map(p => p.k), elak = (S.peristiwaLalu || []).slice(-3);
  const calon = PERISTIWA.filter(e => (!e.bulan || e.bulan.includes(bk)) && !baru.includes(e.k) && !elak.includes(e.k) && (!e.syarat || e.syarat(S)));
  if (!calon.length) return;
  let jum = calon.reduce((a, e) => a + e.p, 0), x = acak() * jum, ev = calon[0];
  for (const e of calon) { x -= e.p; if (x <= 0) { ev = e; break; } }
  let negeri = null;
  if (ev.k === 'pilihanraya') negeri = pilih(NEGERI.filter(n => n.kerusi > 2)).k;
  else if (ev.negeri) { const w = ev.negeri.map(k => ev.k === 'banjir' ? NEG[k].banjir : 1); let y = acak() * w.reduce((a, b) => a + b, 0); negeri = ev.negeri[0]; for (let i = 0; i < w.length; i++) { y -= w[i]; if (y <= 0) { negeri = ev.negeri[i]; break; } } }
  const p = { id: S.nextId++, k: ev.k, negeri, mula: S.bulan };
  S.peristiwa.push(p); S.peristiwaLalu = [...(S.peristiwaLalu || []), ev.k].slice(-5);
  if (ev.k === 'jerebu') PETA.jerebu(true);
  toast(`Peristiwa baharu: ${ev.t}${negeri ? ' · ' + NEG[negeri].n : ''}`, true); sfx('amaran');
  tambahBerita(`${ev.t}${negeri ? ' di ' + NEG[negeri].n : ''}.`);
}
function selesaiPeristiwa(p, i, auto) {
  const ev = PERISTIWA.find(e => e.k === p.k), c = ev.pilihan[i], k = c.kesan || {};
  let f = 1;
  if (c.banjir && p.negeri) { const tb = (projekDi(p.negeri, 'tebatan') || {}).lv || 0; f = Math.max(.15, 1 - .18 * tb); }
  if (k.rm) S.rm += k.rm < 0 ? k.rm * (c.banjir ? .6 + .4 * f : 1) : k.rm;
  if (S.rm < 0) { S.hutang += -S.rm; S.rm = 0; }
  if (k.mp) S.mp = clamp(S.mp + k.mp, 0, 99);
  if (k.pg) S.pg = clamp(S.pg + k.pg, 0, 99);
  if (k.sok) ubahSokSemua(k.sok);
  if (k.sokN && p.negeri) ubahSok(p.negeri, k.sokN < 0 ? k.sokN * f : k.sokN);
  if (c.banjir && p.negeri && f < 1 && i > 0) ubahSok(p.negeri, 3 * (1 - f));
  if (k.sokL) for (const [nk, v] of Object.entries(k.sokL)) ubahSok(nk, v);
  if (k.perpaduan) S.perpaduan = clamp(S.perpaduan + k.perpaduan, 0, 100);
  if (k.inflasi) S.kejutan += k.inflasi;
  if (k.tumbuh) S.tumbuhMod.push({ v: k.tumbuh, baki: 12 });
  if (k.hub) for (const [nk, v] of Object.entries(k.hub)) ubahHub(nk, v);
  if (k.hutang) S.hutang = Math.max(0, S.hutang + k.hutang);
  let nota = '';
  if (c.diskaun) { S.diskaun[c.diskaun] = S.bulan + 6; nota = `Projek ${PROJEK[c.diskaun].n} diskaun 50% selama 6 bulan.`; }
  if (c.bonusHasil) { S.bonusHasil = { j: 'pelancongan', x: c.bonusHasil === 'pelancongan' ? 2.2 : 1.4, sampai: S.bulan + 6 }; nota = 'Hasil projek pelancongan meningkat selama 6 bulan.'; }
  if (c.fdi && c.negeri) nota = terimaPelaburan(c.negeri, c.fdi, c.perluHijau);
  if (c.prk && p.negeri) {
    const menang = S.negeri[p.negeri].sok + gauss() * 6 > 49;
    if (menang) { S.mp = clamp(S.mp + 4, 0, 99); nota = `Calon kerajaan menang pilihan raya kecil di ${NEG[p.negeri].n}.`; }
    else { S.mp = clamp(S.mp - 4, 0, 99); if (S.kerusi.kami > 0) { S.kerusi.kami--; if (['SBH', 'SWK'].includes(p.negeri)) S.kerusi.borneo++; else S.kerusi.lawan++; } nota = `Kerajaan tewas dalam pilihan raya kecil di ${NEG[p.negeri].n}. Kerusi berkurang satu.`; }
  }
  if (p.k === 'jerebu') PETA.jerebu(false);
  S.peristiwa = S.peristiwa.filter(x => x !== p);
  S.stat.peristiwa++; misi('peristiwa');
  const label = `${ev.t}${p.negeri ? ' (' + NEG[p.negeri].n + ')' : ''}`;
  if (auto) { toast(`${label}: tiada keputusan, keadaan dibiarkan.`, true); tambahBerita(`Kerajaan dikritik kerana lambat bertindak dalam isu ${ev.t.toLowerCase()}.`); ubahSokSemua(-1); }
  else tambahBerita(`Keputusan kerajaan: ${c.t}.`);
  if (nota) toast(nota);
  kemaskiniHUD(); simpan();
  return nota;
}
function terimaPelaburan(k, j, perluHijau) {
  const p = projekDi(k, j), fit = fitNilai(k, j);
  if (!fit) return `${NEG[k].n} tidak sesuai untuk ${PROJEK[j].n}. Pelabur menarik diri.`;
  const kualiti = perluHijau && indeksHijau() < 30 ? .5 : fit;
  if (p) { if (!p.busy && p.lv < 5) p.lv++; } else S.negeri[k].projek.push({ j, lv: 1, busy: null });
  S.tumbuhMod.push({ v: .0015 * kualiti, baki: 18 }); ubahSok(k, 2 + kualiti * 2);
  S.stat.projek++;
  return kualiti >= 1.3 ? `Pilihan tepat! ${NEG[k].n} memang kuat dalam ${PROJEK[j].n}. Pelaburan berjaya besar.` : kualiti >= 1 ? `Pelaburan diterima di ${NEG[k].n}.` : `Pelaburan diterima, tetapi ${NEG[k].n} kurang sesuai. Kesannya kecil.`;
}
function janaPermintaan() {
  const keperluan = { KTN: ['tebatan', 'hospital'], TRG: ['tebatan', 'sekolah'], PHG: ['tebatan', 'pelancongan'], JHR: ['tebatan', 'rumah'], SBH: ['hospital', 'sekolah'], SWK: ['hospital', 'sekolah'], PNG: ['rumah', 'angkutan'], KUL: ['rumah', 'angkutan'], SGR: ['rumah', 'tebatan'], KDH: ['padi', 'sekolah'], PLS: ['padi', 'sekolah'], PRK: ['hospital', 'pelancongan'], NSN: ['sekolah', 'rumah'], MLK: ['pelancongan', 'rumah'], PJY: ['sekolah'], LBN: ['hospital'] };
  const n = pilih(NEGERI.filter(x => !S.permintaan.some(q => q.negeri === x.k)));
  if (!n) return;
  const j = pilih(keperluan[n.k].filter(j2 => PROJEK[j2].buka <= fasa() && fitNilai(n.k, j2) > 0)); if (!j) return;
  const p = projekDi(n.k, j), sasarLv = p ? Math.min(5, p.lv + 1) : 1;
  if (sasarLv > maxLvProjek()) return;
  S.permintaan.push({ id: S.nextId++, negeri: n.k, j, lv: sasarLv, sampai: S.bulan + 6 });
  toast(`Kerajaan negeri ${n.n} memohon ${PROJEK[j].n}${sasarLv > 1 ? ' tahap ' + sasarLv : ''}.`);
  tambahBerita(`Kerajaan negeri ${n.n} memohon ${PROJEK[j].n}.`);
}
function semakPermintaan() {
  for (const q of S.permintaan.slice()) {
    const p = projekDi(q.negeri, q.j);
    if (p && p.lv >= q.lv && !p.busy) {
      S.permintaan = S.permintaan.filter(x => x !== q); ubahSok(q.negeri, 8); S.mp = clamp(S.mp + 2, 0, 99); S.stat.permintaan++; misi('permintaan');
      toast(`Permohonan ${NEG[q.negeri].n} ditunaikan. Rakyat ${NEG[q.negeri].n} berterima kasih!`); sfx('menang');
    }
  }
}

/* ================= Tindakan pentadbiran ================= */
function bolehBina(k, j) {
  const d = PROJEK[j];
  if (d.buka > fasa()) return `Dibuka pada fasa ${d.buka} (${FASA[d.buka - 1].n})`;
  if (fitNilai(k, j) <= 0) return `${NEG[k].n} tidak sesuai untuk projek ini`;
  return null;
}
function binaProjek(k, j) {
  const halang = bolehBina(k, j); if (halang) { toast(halang, true); sfx('salah'); return; }
  const p = projekDi(k, j), lv = p ? p.lv + 1 : 1;
  if (p && p.busy) return;
  if (lv > maxLvProjek()) { toast(`Naik taraf Putrajaya untuk tahap ${lv}.`, true); sfx('salah'); return; }
  if (pasukanLapang() <= 0) { toast('Semua pasukan projek sedang bertugas. Tunggu siap atau naik taraf Putrajaya.', true); sfx('salah'); return; }
  const kos = kosProjek(j, lv);
  if (S.rm < kos) { toast(`Perbendaharaan tidak cukup (${rm(kos)}). Kutip hasil, atau terbitkan bon di menu Dasar.`, true); sfx('salah'); return; }
  S.rm -= kos;
  const busy = { until: kini() + masaProjek(j, lv) * 1000, mula: kini(), toLv: lv };
  if (p) p.busy = busy; else S.negeri[k].projek.push({ j, lv: 0, busy });
  sfx('bina'); toast(`${PROJEK[j].n} ${lv > 1 ? 'dinaik taraf' : 'dibina'} di ${NEG[k].n}`); perluRender = true; kemaskiniHUD(); simpan(); semakLangkah();
}
function percepat(k, j) {
  const p = projekDi(k, j); if (!p || !p.busy) return;
  const c = Math.max(1, Math.ceil((p.busy.until - kini()) / 1000 / 45));
  if (S.mp < c) { toast(`Modal Politik tidak cukup (${c}).`, true); return; }
  S.mp -= c; p.busy.until = kini(); kemaskiniMasa(kini()); kemaskiniHUD();
}
function kutip(k) {
  const st = S.negeri[k], n = st.hasil; if (n < .05) return 0;
  S.rm += n; st.hasil = 0; S.stat.kutip += n; misi('kutip', n);
  apung(k, '+' + rm(n), '#3fd06a'); sfx('kutip'); kemaskiniHUD(); semakLangkah(); return n;
}
function lawatanKerja(k) {
  const st = S.negeri[k];
  if (S.bulan - st.lawatan < 6) { toast(`Lawatan kerja ke ${NEG[k].n} boleh dibuat semula pada ${namaBulan(st.lawatan + 6)}.`, true); return; }
  if (S.mp < 3) { toast('Modal Politik tidak cukup (3).', true); return; }
  S.mp -= 3; st.lawatan = S.bulan; ubahSok(k, 6); sfx('kutip'); toast(`Lawatan kerja ke ${NEG[k].n}: rakyat menyambut mesra.`); kemaskiniHUD(); paparPanel();
}
function naikPutrajaya() {
  const lv = fasa() + 1; if (lv > 7) return;
  if (S.putrajaya.busy) return;
  const f = FASA[lv - 1], halang = f.syarat && f.syarat(S);
  if (halang) { toast(`Syarat fasa ${f.n}: ${halang}.`, true); sfx('salah'); return; }
  if (pasukanLapang() <= 0) { toast('Semua pasukan projek sedang bertugas.', true); return; }
  if (S.rm < f.kos) { toast(`Perbendaharaan tidak cukup (${rm(f.kos)}).`, true); sfx('salah'); return; }
  S.rm -= f.kos; S.putrajaya.busy = { until: kini() + f.tb * 1000, mula: kini(), toLv: lv };
  sfx('bina'); toast(`Peralihan ke fasa ${f.n} bermula.`); perluRender = true; kemaskiniHUD(); semakLangkah(); simpan();
}
function mulaMega(k) {
  const d = MEGA[k];
  if (S.megaProjek[k]) return;
  if (d.buka > fasa()) { toast(`Dibuka pada fasa ${d.buka}.`, true); return; }
  if (d.syaratNegara && S.hubungan[d.syaratNegara[0]] < d.syaratNegara[1]) { toast(`Perlukan hubungan ${NEGARA_K[d.syaratNegara[0]].n} sekurang-kurangnya ${d.syaratNegara[1]}.`, true); return; }
  if (pasukanLapang() <= 0) { toast('Semua pasukan projek sedang bertugas.', true); return; }
  if (S.rm < d.kos) { toast(`Perbendaharaan tidak cukup (${rm(d.kos)}). Pertimbangkan bon kerajaan.`, true); sfx('salah'); return; }
  S.rm -= d.kos; S.megaProjek[k] = { mula: kini(), until: kini() + d.tb * 1000, siap: false };
  sfx('gong'); toast(`Projek mega dilancarkan: ${d.n}`); tambahBerita(`Kerajaan melancarkan ${d.n}.`); perluRender = true; kemaskiniHUD(); simpan();
}
function terbitBon() {
  const n = 10;
  S.rm += n; S.hutang += n * 1.03; sfx('kutip'); toast(`Bon kerajaan RM10 bilion diterbitkan. Hutang kini ${fmt(hutangPct())}% KDNK.`); kemaskiniHUD(); renderModal();
}
function ubahDasar(k, i) {
  const d = DASAR[k], lama = S.dasar[k];
  if (lama === i) return;
  if (S.mp < d.mp) { toast(`Modal Politik tidak cukup (${d.mp}).`, true); sfx('salah'); return; }
  if (d.perlembagaan) {
    const sokong = S.kerusi.kami + (i === 1 ? S.kerusi.borneo : 0);
    if (sokong < 148) { S.mp -= Math.ceil(d.mp / 2); toast(`Pindaan gagal: hanya ${sokong} kerusi menyokong, perlu 148.`, true); sfx('kalah'); kemaskiniHUD(); renderModal(); return; }
  }
  const kontroversi = (k === 'sst' && i > lama) || (k === 'subsidi' && i > lama) || (k === 'bantuan' && i < lama) || (k === 'gaji' && i < lama);
  if (kontroversi && sokNasional() < 42 && acak() < .35) { S.mp -= Math.ceil(d.mp / 2); toast('Ahli parlimen kerajaan memberontak. Usul ditolak Dewan Rakyat.', true); sfx('kalah'); kemaskiniHUD(); renderModal(); return; }
  S.mp -= d.mp; S.dasar[k] = i; S.stat.dasar++;
  if (k === 'subsidi' && i > lama) { S.kejutan += .6 * (i - lama); ubahSokSemua(-3 * (i - lama)); }
  if (k === 'subsidi' && i < lama) ubahSokSemua(2 * (lama - i));
  if (k === 'sst' && i > lama) { S.kejutan += .3; ubahSokSemua(-2); }
  if (k === 'sawit' && i === 1) { ubahHub('EU', 8); for (const nk of ['SBH', 'SWK', 'PHG', 'JHR']) ubahSok(nk, -2); }
  if (k === 'sawit' && i === 0) ubahHub('EU', -6);
  if (k === 'ma63' && i === 1) { ubahSok('SBH', 6); ubahSok('SWK', 6); ubahSokSemua(-.5); }
  sfx('bina'); toast(`Dewan Rakyat meluluskan: ${d.n} · ${d.pilihan[i]}`); tambahBerita(`Dasar baharu: ${d.n} kini ${d.pilihan[i]}.`);
  kemaskiniHUD(); renderModal(); semakLangkah(); simpan();
}

/* ================= Diplomasi ================= */
function lawatanRasmi(k) {
  const n = NEGARA_K[k], lalu = S.lawatan[k] ?? -99;
  if (S.bulan - lalu < 4) { toast(`Lawatan ke ${n.n} boleh dibuat semula pada ${namaBulan(lalu + 4)}.`, true); return; }
  if (S.pg < 4) { toast('Pengaruh diplomatik tidak cukup (4).', true); sfx('salah'); return; }
  S.pg -= 4; S.lawatan[k] = S.bulan; S.stat.lawatan++; misi('lawatan');
  const naik = Math.round(5 + acak() * 4); ubahHub(k, naik);
  PETA.terbang(n.arah); sfx('gong');
  let nota = `Lawatan rasmi ke ${n.n}: hubungan +${naik}.`;
  if (acak() < .28) { S.tumbuhMod.push({ v: .001, baki: 12 }); S.rm += 1; nota += ' Syarikat mereka menjanjikan pelaburan baharu (+RM1 bil).'; }
  toast(nota); tambahBerita(`Perdana Menteri mengadakan lawatan rasmi ke ${n.n}.`);
  kemaskiniHUD(); renderModal(); semakLangkah(); simpan();
}
let runding = null;
function mulaRunding(k) {
  if (S.hubungan[k] < 40) { toast('Hubungan terlalu dingin untuk berunding (perlu 40).', true); return; }
  if (S.pg < 8) { toast('Pengaruh diplomatik tidak cukup (8).', true); sfx('salah'); return; }
  S.pg -= 8; runding = { k, pusingan: 0, percaya: Math.round(S.hubungan[k] * .35), dipilih: [0, 0, 0, 0], log: [] };
  bukaModal(`Meja Rundingan · ${NEGARA_K[k].n}`, null, renderRunding); kemaskiniHUD();
}
function renderRunding(_, isi) {
  const r = runding, n = NEGARA_K[r.k];
  if (!r) return;
  const meter = `<div class="ruang"><span>Kepercayaan ${n.n}</span><div class="meter emas"><i style="width:${r.percaya}%"></i></div><b class="nombor">${Math.round(r.percaya)}</b></div>`;
  const hint = S.hubungan[r.k] >= 60 ? n.petunjuk : 'Duta kita belum dapat membaca keutamaan mereka dengan jelas. Perhatikan reaksi mereka.';
  if (r.pusingan < 3) {
    isi.innerHTML = `${meter}<p><b>Duta Malaysia:</b> ${esc(hint)}</p><p class="kecil">Pusingan ${r.pusingan + 1} daripada 3. Pilih satu tawaran. Tawaran yang sama kurang berkesan jika diulang.</p>${r.log.map(l => `<div class="mesej sistem">${esc(l)}</div>`).join('')}<div class="kuiz-pilihan">${ISU_RUNDING.map((x, i) => `<button data-isu="${i}"><b>${esc(x.n)}</b><br><small>Kos domestik: ${esc(x.kos)}</small></button>`).join('')}</div>`;
    isi.querySelectorAll('[data-isu]').forEach(b => b.onclick = () => {
      const i = +b.dataset.isu, w = n.w[i], kali = r.dipilih[i]++;
      const naik = (w * 5 + (acak() * 4 - 2)) * Math.pow(.5, kali); r.percaya = clamp(r.percaya + naik, 0, 100);
      const x = ISU_RUNDING[i];
      if (x.sok && x.sok.agro) for (const nk of ['KDH', 'PLS', 'KTN', 'SBH', 'SWK', 'PHG']) ubahSok(nk, -1);
      if (x.sok && x.sok.bandar) for (const nk of ['KUL', 'SGR', 'PNG']) ubahSok(nk, -1);
      if (x.rm) S.rm = Math.max(0, S.rm + x.rm);
      if (x.tumbuh) S.tumbuhMod.push({ v: x.tumbuh, baki: 12 });
      const reaksi = naik >= 20 ? 'tersenyum lebar. Ini jelas keutamaan mereka.' : naik >= 14 ? 'kelihatan berminat dan mencatat sesuatu.' : naik >= 8 ? 'mengangguk perlahan.' : 'kelihatan kurang teruja.';
      r.log.push(`${x.n}: wakil ${n.n} ${reaksi}`); r.pusingan++; sfx('ketik'); kemaskiniHUD(); renderModal();
    });
  } else {
    isi.innerHTML = `${meter}${r.log.map(l => `<div class="mesej sistem">${esc(l)}</div>`).join('')}<h3>Apa yang kau minta sebagai balasan?</h3><div class="kuiz-pilihan">${HASIL_RUNDING.map((h, i) => { const ok = r.percaya >= h.perlu && !(h.k === 'fta' && S.perjanjian.some(p => p.k === r.k && p.jenis === 'fta')); return `<button data-hasil="${i}" ${ok ? '' : 'disabled class="mati"'}><b>${esc(h.n)}</b> <small>(perlu kepercayaan ${h.perlu})</small><br><small>${esc(h.d)}</small></button>`; }).join('')}<button data-hasil="-1"><b>Tamatkan tanpa perjanjian</b><br><small>Kekalkan muhibah: hubungan +2.</small></button></div>`;
    isi.querySelectorAll('[data-hasil]').forEach(b => b.onclick = () => {
      if (b.disabled) return;
      const i = +b.dataset.hasil;
      if (i < 0) { ubahHub(r.k, 2); runding = null; tutupModal(); toast('Rundingan ditangguhkan secara baik.'); return; }
      const h = HASIL_RUNDING[i];
      S.perjanjian.push({ k: r.k, jenis: h.k, bulan: S.bulan }); S.stat.perjanjian++; ubahHub(r.k, 6);
      tambahBerita(`Malaysia dan ${n.n} memeterai ${h.n.toLowerCase()}.`); sfx('menang');
      if (h.k === 'pelaburan') { const jenis = { CN: 'angkutan', JP: 'tenaga', US: 'teknologi', KR: 'teknologi', SG: 'pusatdata', SA: 'minyak', EU: 'tenaga', AU: 'sekolah', IN: 'teknologi', TH: 'agro', ID: 'agro', VN: 'pelabuhan', BN: 'pelancongan', PH: 'pelancongan' }[r.k]; pilihNegeriPelaburan(jenis, n.n); }
      else { if (h.k === 'teknologi') S.tumbuhMod.push({ v: .002, baki: 36 }); runding = null; tutupModal(); toast(`${h.n} dengan ${n.n} dimeterai!`); }
      semakLangkah(); kemaskiniHUD(); simpan();
    });
  }
}
function pilihNegeriPelaburan(j, dari) {
  const calon = NEGERI.filter(n => fitNilai(n.k, j) > 0).sort((a, b) => fitNilai(b.k, j) - fitNilai(a.k, j)).slice(0, 6).sort(() => acak() - .5);
  bukaModal(`Pelaburan ${dari}: pilih negeri`, null, (_, isi) => {
    isi.innerHTML = `<p>Pelabur dari ${esc(dari)} mahu membina <b>${esc(PROJEK[j].n)}</b>. Pilih negeri tuan rumah. Negeri yang paling sesuai memberi kesan paling besar.</p><div class="kuiz-pilihan">${calon.map(n => `<button data-n="${n.k}"><b>${esc(n.n)}</b><br><small>${esc(n.sektor)}</small></button>`).join('')}</div>`;
    isi.querySelectorAll('[data-n]').forEach(b => b.onclick = () => { const nota = terimaPelaburan(b.dataset.n, j); runding = null; tutupModal(); toast(nota); kemaskiniHUD(); simpan(); });
  });
}

/* ================= Politik: PRU ================= */
function jalankanPRU(awal) {
  if (S.tamat || modalCur && modalCur.tajuk.startsWith('Keputusan PRU')) return;
  const hasil = {}; let kami = 0, borneo = 0, lawan = 0;
  for (const n of NEGERI) {
    const a = S.negeri[n.k].sok, share = sigmoid((a - 50) / 6) * .92 + .04;
    const k = clamp(Math.round(n.kerusi * share + gauss() * n.kerusi * .07), 0, n.kerusi);
    const baki = n.kerusi - k, b = ['SBH', 'SWK'].includes(n.k) ? Math.round(baki * .8) : 0;
    hasil[n.k] = { kami: k, borneo: b, lawan: baki - b }; kami += k; borneo += b; lawan += baki - b;
  }
  S.sejarahPRU.push({ bulan: S.bulan, kami, borneo, lawan, awal });
  S.lensa = 'pru'; S.pruHasil = hasil; paparLensa();
  const menang = kami >= 112;
  sfx(menang ? 'menang' : 'kalah');
  bukaModal(`Keputusan PRU ke-${S.sejarahPRU.length}`, null, (_, isi) => {
    const bar = `<div class="dewan"><i style="width:${kami / 2.22}%;background:#2f6fd1"></i><i style="width:${borneo / 2.22}%;background:#f39c12"></i><i style="width:${lawan / 2.22}%;background:#9aa3ad"></i><span style="left:50.45%"></span><span style="left:66.67%"></span></div>`;
    const jadual = NEGERI.map(n => `<tr><td>${esc(n.n)}</td><td class="nombor">${hasil[n.k].kami}</td><td class="nombor">${hasil[n.k].borneo || '–'}</td><td class="nombor">${hasil[n.k].lawan}</td><td class="nombor">${fmt(S.negeri[n.k].sok, 0)}%</td></tr>`).join('');
    let aksi;
    if (menang) aksi = `<p><b>${kami >= 148 ? 'Kemenangan besar dengan majoriti dua pertiga!' : 'Kerajaan kekal dengan majoriti mudah.'}</b> Penggal baharu bermula.</p><button class="btn hijau" id="pruOk">Bentuk kerajaan</button>`;
    else if (kami + borneo >= 112) aksi = `<p>Tiada majoriti mudah. Blok Borneo (${borneo} kerusi) sanggup bergabung jika hak MA63 Sabah dan Sarawak didesentralisasikan.</p><button class="btn hijau" id="pruGabung" ${S.mp >= 12 ? '' : 'disabled'}>Bentuk kerajaan gabungan (12 Modal Politik)</button> <button class="btn merah" id="pruKalah">Terima kekalahan</button>`;
    else aksi = `<p><b>Kerajaan tumbang.</b> Rakyat telah memilih. Penggal kau tamat di sini.</p><button class="btn merah" id="pruKalah">Lihat legasi</button>`;
    isi.innerHTML = `<div class="keputusan"><div class="angka"><span style="color:#2f6fd1">Kerajaan ${kami}</span><span style="color:#d98a00">Blok Borneo ${borneo}</span><span style="color:#6b7480">Pembangkang ${lawan}</span></div>${bar}<p class="kecil">Garisan: 112 majoriti mudah, 148 dua pertiga.</p></div><div class="jadual-wrap"><table class="jadual"><thead><tr><th>Wilayah</th><th>Kerajaan</th><th>Borneo</th><th>Pembangkang</th><th>Sokongan</th></tr></thead><tbody>${jadual}</tbody></table></div>${aksi}`;
    const ok = $('#pruOk'); if (ok) ok.onclick = () => { S.kerusi = { kami, borneo, lawan }; S.stat.pru++; S.penggal++; S.bulanPenggal = 0; S.mp = clamp(S.mp + Math.round((kami - 112) / 6) + 5, 0, 99); tambahBerita(`Kerajaan menang PRU dengan ${kami} kerusi.`); S.lensa = 'sokongan'; paparLensa(); tutupModal(true); simpan(); };
    const gb = $('#pruGabung'); if (gb) gb.onclick = () => { if (S.mp < 12) return; S.mp -= 12; S.kerusi = { kami: kami + borneo, borneo: 0, lawan }; S.dasar.ma63 = 1; ubahSok('SBH', 6); ubahSok('SWK', 6); S.stat.pru++; S.penggal++; S.bulanPenggal = 0; tambahBerita('Kerajaan gabungan dibentuk bersama Blok Borneo. Hak MA63 didesentralisasikan.'); S.lensa = 'sokongan'; paparLensa(); tutupModal(true); simpan(); };
    const kl = $('#pruKalah'); if (kl) kl.onclick = () => tamatPermainan(kami);
  });
}
function skorLegasi() { return Math.round(perKapita() * 4 + sokNasional() * 3 + S.perpaduan * 2 + S.perjanjian.length * 25 + S.mega.length * 40 + S.stat.pru * 120 - Math.max(0, hutangPct() - 55) * 6 + indeksHijau() * 2); }
function tamatPermainan(kerusi) {
  const leg = { tarikh: namaBulan(S.bulan), penggal: S.penggal, skor: skorLegasi(), kerusi, kapita: perKapita() };
  bukaModal('Legasi Perdana Menteri', null, (_, isi) => {
    isi.innerHTML = `<div class="keputusan"><h3>${esc(S.nama)}</h3><p>Berkhidmat hingga ${leg.tarikh}, ${S.penggal} penggal.</p><div class="angka"><span>Skor legasi ${fmtN(leg.skor)}</span></div></div>
      <div class="baris"><div class="teks"><b>KDNK per kapita</b><small>RM${fmtN(leg.kapita * 1000)}</small></div></div>
      <div class="baris"><div class="teks"><b>Hutang</b><small>${fmt(hutangPct())}% KDNK</small></div></div>
      <div class="baris"><div class="teks"><b>Perjanjian antarabangsa</b><small>${S.perjanjian.length}</small></div></div>
      <div class="baris"><div class="teks"><b>Projek mega</b><small>${S.mega.map(k => MEGA[k].n).join(', ') || 'Tiada'}</small></div></div>
      <p>Pencapaian dan kad legasi disimpan. Penggal baharu bermula dengan Malaysia hari ini.</p><button class="btn hijau" id="mulaBaru">Mula penggal baharu</button>`;
    $('#mulaBaru').onclick = () => { const capai = S.capai, legasi = [...(S.legasi || []), leg], nama = S.nama; S = keadaanBaru(); S.capai = capai; S.legasi = legasi; S.nama = nama; tutupModal(true); pilihanN = null; fokusPreset('semenanjung'); paparLensa(); kemaskiniHUD(); simpan(); };
  });
}
function laporanTahunan() {
  const t = 2026 + Math.floor(S.bulan / 12) - 1, b = S.bajetLalu || { hasil: 0, belanja: 0 };
  bukaModal(`Belanjawan ${t + 1}`, null, (_, isi) => {
    isi.innerHTML = `<p>Laporan ekonomi tahun ${t}:</p>
      <div class="grid-stat">${statKad('KDNK', rm(kdnkJumlah()))}${statKad('Per kapita', 'RM' + fmtN(perKapita() * 1000))}${statKad('Inflasi', fmt(S.inflasi) + '%')}${statKad('Pengangguran', fmt(kerjaNasional()) + '%')}${statKad('Hutang', fmt(hutangPct()) + '% KDNK')}${statKad('Imbangan bulanan', (b.hasil - b.belanja >= 0 ? '+' : '') + rm(b.hasil - b.belanja))}</div>
      <h3>Fokus Belanjawan ${t + 1}</h3><p>Setiap fokus ada harga. Tiada jawapan yang betul untuk setiap keadaan.</p>
      <div class="kuiz-pilihan">
        <button data-f="pembangunan"><b>Pembangunan</b><br><small>Semua projek 20% lebih murah tahun ini. Hutang cenderung naik.</small></button>
        <button data-f="sosial"><b>Kebajikan rakyat</b><br><small>Sokongan rakyat naik; perbelanjaan bulanan bertambah.</small></button>
        <button data-f="disiplin"><b>Disiplin fiskal</b><br><small>Hutang dikurangkan RM15 bilion serta-merta; sokongan menurun sedikit.</small></button>
      </div>`;
    isi.querySelectorAll('[data-f]').forEach(x => x.onclick = () => {
      S.fokus = x.dataset.f;
      if (S.fokus === 'disiplin') S.hutang = Math.max(0, S.hutang - 15);
      tambahBerita(`Belanjawan ${t + 1} dibentangkan dengan fokus ${x.querySelector('b').textContent.toLowerCase()}.`);
      sfx('gong'); tutupModal(); simpan();
    });
  });
}

/* ================= Misi, pencapaian, langkah, wawasan ================= */
function semakMisi() {
  const h = hariIni(); if (S.misi && S.misi.hari === h) return;
  const r = rng(cincang(h)), jenis = MISI_JENIS.slice(), ambil = [];
  while (ambil.length < 3) ambil.push(jenis.splice(Math.floor(r() * jenis.length), 1)[0]);
  S.misi = { hari: h, senarai: ambil.map(m => ({ k: m.k, n: m.n(fasa()), p: 0, ambil: false })), bonus: false };
}
function misi(k, n = 1) { semakMisi(); for (const m of S.misi.senarai) if (m.k === k && !m.ambil) m.p = Math.min(m.n, m.p + n); }
const nilaiCapai = k => S.stat[k] || 0;
function bolehTuntut() {
  semakMisi(); let n = S.misi.senarai.filter(m => m.p >= m.n && !m.ambil).length + (!S.misi.bonus && S.misi.senarai.every(m => m.ambil) ? 1 : 0);
  for (const c of CAPAI) { const t = S.capai[c.k] || 0; if (t < 3 && nilaiCapai(c.k) >= c.t[t]) n++; }
  return n;
}
const LANGKAH = [
  { t: 'Ketik negeri Selangor pada peta untuk melihat datanya.', ok: () => S.stat.ketik > 0, g: ['rm', 2] },
  { t: 'Kutip hasil Pelabuhan Klang: ketik gelembung RM di atas Selangor.', ok: () => S.stat.kutip > 0, g: ['mp', 3] },
  { t: 'Kelantan paling kerap dilanda banjir monsun. Buka Projek dan bina Tebatan Banjir di Kelantan.', ok: () => !!projekDi('KTN', 'tebatan'), g: ['pg', 3] },
  { t: 'Buka Diplomasi dan buat lawatan rasmi ke sebuah negara ASEAN.', ok: () => S.stat.lawatan > 0, g: ['rm', 3] },
  { t: 'Buka Dasar dan ubah satu dasar. Fikirkan kesannya kepada belanjawan dan rakyat.', ok: () => S.stat.dasar > 0, g: ['mp', 4] },
  { t: 'Naik taraf Pusat Pentadbiran Putrajaya ke fasa Pemulihan Ekonomi.', ok: () => fasa() >= 2 || !!S.putrajaya.busy, g: ['rm', 5] },
];
function semakLangkah() {
  const l = LANGKAH[S.langkah]; if (!l || !l.ok()) return;
  S[l.g[0]] += l.g[1]; toast(`Tugasan selesai! +${l.g[1]} ${{ rm: 'RM bil', mp: 'Modal Politik', pg: 'Pengaruh' }[l.g[0]]}`); sfx('kutip');
  S.langkah++; nasihatSeterus = 0;
}
const WAWASAN = [
  { n: 'Negara berpendapatan tinggi', d: 'KDNK per kapita RM65,000', v: () => perKapita(), s: 65, f: v => 'RM' + fmtN(v * 1000) },
  { n: 'Fiskal mampan', d: 'Hutang 55% KDNK atau kurang', v: () => hutangPct(), s: 55, turun: true, f: v => fmt(v) + '%' },
  { n: 'Peluang pekerjaan', d: 'Pengangguran 3.0% atau kurang', v: () => kerjaNasional(), s: 3.0, turun: true, f: v => fmt(v) + '%' },
  { n: 'Negara bersatu', d: 'Indeks perpaduan 75', v: () => S.perpaduan, s: 75, f: v => fmt(v, 0) },
  { n: 'Tenaga hijau', d: 'Indeks tenaga hijau 40', v: () => indeksHijau(), s: 40, f: v => fmt(v, 0) },
  { n: 'Rakan dunia', d: '3 perjanjian antarabangsa', v: () => S.perjanjian.length, s: 3, f: v => v },
  { n: 'Kepercayaan rakyat', d: 'Sokongan nasional 60%', v: () => sokNasional(), s: 60, f: v => fmt(v, 0) + '%' },
];
const kemajuanW = w => { const v = w.v(); return w.turun ? clamp((w.s * 1.6 - v) / (w.s * .6), 0, 1) : clamp(v / w.s, 0, 1); };

/* ================= Audio ================= */
let AC = null, bunyiAkhir = {};
function bukaAudio() { if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { AC = null; } } if (AC && AC.state === 'suspended') AC.resume().catch(() => {}); }
function nada(f, d, j = 'sine', v = .1, f2 = 0, l = 0) { if (!AC) return; const t0 = AC.currentTime + l, o = AC.createOscillator(), g = AC.createGain(); o.type = j; o.frequency.setValueAtTime(f, t0); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + d); g.gain.setValueAtTime(v, t0); g.gain.exponentialRampToValueAtTime(.001, t0 + d); o.connect(g).connect(AC.destination); o.start(t0); o.stop(t0 + d + .02); }
function sfx(n) {
  if (!S || !S.bunyi || !AC) return; const t = performance.now(); if (bunyiAkhir[n] && t - bunyiAkhir[n] < 80) return; bunyiAkhir[n] = t;
  ({ kutip: () => { nada(988, .08, 'triangle', .1); nada(1319, .12, 'triangle', .09, 0, .06); }, bina: () => { nada(330, .08, 'square', .04); nada(440, .1, 'triangle', .06, 0, .06); },
    siap: () => [523, 659, 784, 1047].forEach((f, i) => nada(f, .18, 'triangle', .08, 0, i * .08)), salah: () => nada(200, .18, 'sawtooth', .05, 140), ketik: () => nada(660, .04, 'triangle', .05),
    gong: () => { nada(196, 1.2, 'sine', .14, 190); nada(392, .8, 'sine', .04); }, amaran: () => { nada(740, .12, 'square', .04); nada(554, .16, 'square', .04, 0, .14); },
    menang: () => [392, 494, 587, 784, 988].forEach((f, i) => nada(f, .3, 'triangle', .09, 0, i * .12)), kalah: () => [392, 330, 262].forEach((f, i) => nada(f, .35, 'triangle', .08, 0, i * .18)) }[n] || (() => {}))();
}

/* ================= Kanvas, kamera, input ================= */
const cv = $('#cv'); let ctx = cv.getContext('2d'), W = 0, H = 0, DPR = 1;
const ZMIN = .25, ZMAX = 7;
function ubahSaiz() { DPR = Math.min(2, window.devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR); PETA.saiz(W, H, DPR); }
function hadKamera() { cam.zum = clamp(cam.zum, ZMIN, ZMAX); cam.x = clamp(cam.x, -60, 60); cam.z = clamp(cam.z, -25, 28); }
function kunciTitik(sx, sy, gx, gz) { const [a, b] = PETA.skrinKeDunia(sx, sy); cam.x += gx - a; cam.z += gz - b; hadKamera(); }
const PRESET = { semenanjung: [99.6, 104.4, 1.2, 6.8], borneo: [109.6, 119.3, .9, 7.4], malaysia: [99.6, 119.3, .9, 7.4] };
let kameraSasar = null;
function fokusPreset(k, segera) { const f = PETA.fokus(...PRESET[k]); if (segera) Object.assign(cam, f); else kameraSasar = f; hadKamera(); }
function fokusNegeri(k) { const n = NEG[k], ll = n.poli.flat(), lo = ll.map(p => p[0]), la = ll.map(p => p[1]); const f = PETA.fokus(Math.min(...lo) - .3, Math.max(...lo) + .3, Math.min(...la) - .3, Math.max(...la) + .3); f.zum = clamp(Math.min(f.zum, 6), ZMIN, ZMAX); const [x, z] = PETA.xz(n.ibuLL[0], n.ibuLL[1]); kameraSasar = { x: f.x * .5 + x * .5, z: f.z * .5 + z * .5 + 1.2 / f.zum, zum: f.zum * .9 }; }
const jari = new Map(); let gerak = null;
cv.addEventListener('pointerdown', e => {
  bukaAudio(); try { cv.setPointerCapture(e.pointerId); } catch (er) { }
  jari.set(e.pointerId, { x: e.clientX, y: e.clientY }); kameraSasar = null;
  if (jari.size === 2) { const [a, b] = [...jari.values()], m = [(a.x + b.x) / 2, (a.y + b.y) / 2]; gerak = { jenis: 'cubit', d0: Math.hypot(a.x - b.x, a.y - b.y) || 1, z0: cam.zum, g0: PETA.skrinKeDunia(...m) }; return; }
  gerak = { jenis: 'tekan', x0: e.clientX, y0: e.clientY, g0: PETA.skrinKeDunia(e.clientX, e.clientY), gerak: false };
});
cv.addEventListener('pointermove', e => {
  const p = jari.get(e.pointerId); if (!p) return; p.x = e.clientX; p.y = e.clientY; if (!gerak) return;
  if (gerak.jenis === 'cubit' && jari.size >= 2) { const [a, b] = [...jari.values()]; cam.zum = clamp(gerak.z0 * Math.hypot(a.x - b.x, a.y - b.y) / gerak.d0, ZMIN, ZMAX); kunciTitik((a.x + b.x) / 2, (a.y + b.y) / 2, ...gerak.g0); }
  else if (gerak.jenis === 'tekan') { if (!gerak.gerak && Math.hypot(e.clientX - gerak.x0, e.clientY - gerak.y0) > 8) gerak.gerak = true; if (gerak.gerak) kunciTitik(e.clientX, e.clientY, ...gerak.g0); }
});
function lepasJari(e, batal) { const ada = jari.delete(e.pointerId); if (!ada) return; if (!batal && gerak && gerak.jenis === 'tekan' && !gerak.gerak) ketik(e.clientX, e.clientY); gerak = null; }
cv.addEventListener('pointerup', e => lepasJari(e, false));
cv.addEventListener('pointercancel', e => lepasJari(e, true));
cv.addEventListener('wheel', e => { e.preventDefault(); kameraSasar = null; const g = PETA.skrinKeDunia(e.clientX, e.clientY); cam.zum = clamp(cam.zum * Math.exp(-e.deltaY * .0015), ZMIN, ZMAX); kunciTitik(e.clientX, e.clientY, ...g); }, { passive: false });
cv.addEventListener('contextmenu', e => e.preventDefault());
function ketik(sx, sy) {
  for (const b of gelembung) if (Math.hypot(sx - b.x, sy - b.y) < 22) { kutip(b.k); pilihNegeri(b.k); return; }
  const k = PETA.pilihDi(sx, sy);
  pilihNegeri(k);
}
function pilihNegeri(k) {
  if (k && k !== pilihanN) sfx('ketik');
  pilihanN = k; if (k) { S.stat.ketik += k === 'SGR' ? 1 : 0; if (S.negeri[k].hasil >= .3) kutip(k); }
  paparPanel(); semakLangkah();
}
addEventListener('keydown', e => { if (e.key === 'Escape') { if (!$('#modal').hidden) tutupModal(); else pilihNegeri(null); } if (e.key === ' ' && $('#modal').hidden && document.activeElement.tagName !== 'INPUT') { e.preventDefault(); setLaju(S.laju ? 0 : 1); } });

/* ================= Lapisan atas: label, gelembung, teks ================= */
let gelembung = [], apungan = [];
function apung(k, txt, w) { apungan.push({ k, txt, w, t: 0 }); }
function warnaLensa(k) {
  const st = S.negeri[k], n = NEG[k];
  switch (S.lensa) {
    case 'sokongan': return skala3(st.sok, 30, 70, '#e4574a', '#f2c94c', '#3fae5a');
    case 'ekonomi': return skala3(Math.log(perKapita(k)), Math.log(15), Math.log(150), '#e3f0ff', '#6ea8e8', '#123f8c');
    case 'kerja': return skala3(st.kerja, 2.2, 6.5, '#3fae5a', '#f2c94c', '#e4574a');
    case 'penduduk': return skala3(Math.log(st.pop * 1e6 / n.luas), Math.log(15), Math.log(9000), '#f6efff', '#b28ce0', '#5a2a99');
    case 'etnik': { const [b, c, i] = n.etnik, m = Math.max(b, c, i); return m < 55 ? '#a98ad9' : b === m ? campur('#d8f0d0', '#1f8a5a', (b - 45) / 55) : c === m ? '#e0703a' : '#e8a93a'; }
    case 'banjir': return campur('#f4fbff', '#1f5fb8', n.banjir);
    case 'pru': { const h = S.pruHasil && S.pruHasil[k]; if (!h) return '#cccccc'; const tot = h.kami + h.borneo + h.lawan; return h.kami / tot >= .5 ? campur('#9cc2f2', '#1f4fb8', h.kami / tot) : h.borneo > h.lawan ? '#f3a73a' : '#9aa3ad'; }
    default: return ['#8fd16a', '#7fc95c', '#a5d86f', '#78c255', '#93cf63', '#86c95f'][NEGERI.indexOf(n) % 6];
  }
}
function paparLensa() {
  for (const n of NEGERI) PETA.warna(n.k, warnaLensa(n.k));
  document.querySelectorAll('#lensa [data-l]').forEach(b => b.classList.toggle('aktif', b.dataset.l === S.lensa));
  const leg = $('#legenda'), L = {
    sokongan: ['Sokongan rakyat', '30%', '70%', 'linear-gradient(90deg,#e4574a,#f2c94c,#3fae5a)'],
    ekonomi: ['KDNK per kapita', 'RM15k', 'RM150k', 'linear-gradient(90deg,#e3f0ff,#6ea8e8,#123f8c)'],
    kerja: ['Kadar pengangguran', '2%', '6.5%', 'linear-gradient(90deg,#3fae5a,#f2c94c,#e4574a)'],
    penduduk: ['Kepadatan penduduk', '15/km²', '9,000/km²', 'linear-gradient(90deg,#f6efff,#b28ce0,#5a2a99)'],
    banjir: ['Risiko banjir', 'rendah', 'tinggi', 'linear-gradient(90deg,#f4fbff,#1f5fb8)'],
    etnik: ['Majoriti etnik', '', '', ''],
    pru: ['Keputusan PRU', '', '', ''],
  }[S.lensa];
  if (!L) { leg.hidden = true; return; }
  leg.hidden = false;
  leg.innerHTML = S.lensa === 'etnik' ? `<b>Majoriti warganegara</b><span><i style="background:#1f8a5a"></i>Bumiputera</span><span><i style="background:#e0703a"></i>Cina</span><span><i style="background:#a98ad9"></i>Tiada majoriti 55%</span>` : S.lensa === 'pru' ? `<b>Keputusan PRU</b><span><i style="background:#1f4fb8"></i>Kerajaan</span><span><i style="background:#f3a73a"></i>Blok Borneo</span><span><i style="background:#9aa3ad"></i>Pembangkang</span>` : `<b>${L[0]}</b><div class="skala" style="background:${L[3]}"></div><div class="hujung"><span>${L[1]}</span><span>${L[2]}</span></div>`;
}
function nilaiLabel(k) {
  const st = S.negeri[k], n = NEG[k];
  switch (S.lensa) {
    case 'sokongan': return fmt(st.sok, 0) + '%';
    case 'ekonomi': return 'RM' + fmt(perKapita(k), 0) + 'k';
    case 'kerja': return fmt(st.kerja) + '%';
    case 'penduduk': return fmt(st.pop, st.pop < 1 ? 2 : 1) + 'j';
    case 'etnik': return n.etnik.slice(0, 3).join('/');
    case 'banjir': return n.banjir >= .8 ? 'Tinggi' : n.banjir >= .4 ? 'Sederhana' : 'Rendah';
    case 'pru': return S.pruHasil ? `${S.pruHasil[k].kami}/${n.kerusi}` : '';
    default: return '';
  }
}
function lukisAtas(dt) {
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.clearRect(0, 0, W, H);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  gelembung = [];
  const zumKecil = cam.zum < .6;
  for (const n of NEGERI) {
    const kecil = ['KUL', 'PJY', 'LBN'].includes(n.k);
    if (kecil && cam.zum < (n.k === 'KUL' ? 1.1 : 1.8)) continue;
    const [x, y, ok] = PETA.ke2D(n.label[0], n.label[1], .1 + (pilihanN === n.k ? .28 : 0)); if (!ok || x < -40 || x > W + 40 || y < -20 || y > H + 20) continue;
    const t = zumKecil && !['SWK', 'SBH', 'PHG', 'JHR', 'PRK'].includes(n.k) ? '' : n.n, v = nilaiLabel(n.k);
    ctx.font = `400 ${pilihanN === n.k ? 15 : 12.5}px "Lilita One", sans-serif`; ctx.lineWidth = 3.5; ctx.strokeStyle = 'rgba(8,20,45,.85)'; ctx.lineJoin = 'round';
    if (t) { ctx.strokeText(t, x, y); ctx.fillStyle = '#ffffff'; ctx.fillText(t, x, y); }
    if (v) { ctx.font = '700 11px Andika, sans-serif'; const w = ctx.measureText(v).width + 10, yy = y + (t ? 14 : 0); ctx.fillStyle = 'rgba(8,20,45,.82)'; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x - w / 2, yy - 8, w, 16, 8) : ctx.rect(x - w / 2, yy - 8, w, 16); ctx.fill(); ctx.fillStyle = '#ffe9a0'; ctx.fillText(v, x, yy + .5); }
  }
  // gelembung hasil
  const ts = performance.now() / 1000;
  for (const n of NEGERI) {
    const st = S.negeri[n.k]; if (st.hasil < Math.max(.3, capHasil(n.k) * .08)) continue;
    const [x, y0, ok] = PETA.ke2D(n.ibuLL[0], n.ibuLL[1], .9 + (pilihanN === n.k ? .28 : 0)); if (!ok) continue;
    const y = y0 + Math.sin(ts * 3 + n.k.charCodeAt(0)) * 3, penuh = st.hasil >= capHasil(n.k) * .99;
    ctx.fillStyle = penuh ? '#fff3b0' : '#ffffff'; ctx.strokeStyle = '#0b1a33'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x, y, 15, 0, 7); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x - 5, y + 13); ctx.lineTo(x, y + 20); ctx.lineTo(x + 5, y + 13); ctx.fill();
    ctx.fillStyle = '#3fb06a'; ctx.fillRect(x - 9, y - 6, 18, 12); ctx.strokeStyle = '#0e3b22'; ctx.lineWidth = 1.4; ctx.strokeRect(x - 9, y - 6, 18, 12);
    ctx.font = '700 7px Andika, sans-serif'; ctx.fillStyle = '#0e3b22'; ctx.fillText('RM', x, y + .5);
    ctx.font = '700 10px Andika, sans-serif'; ctx.lineWidth = 3; ctx.strokeStyle = '#0b1a33'; const lbl = fmt(st.hasil); ctx.strokeText(lbl, x, y - 22); ctx.fillStyle = '#bff5c8'; ctx.fillText(lbl, x, y - 22);
    gelembung.push({ k: n.k, x, y });
  }
  // pemasa projek pada negeri terpilih
  if (pilihanN) {
    const n = NEG[pilihanN], st = S.negeri[pilihanN], [x, y, ok] = PETA.ke2D(n.ibuLL[0], n.ibuLL[1], 1.3);
    const sibuk = st.projek.filter(p => p.busy);
    if (ok) sibuk.slice(0, 3).forEach((p, i) => { const f = clamp((kini() - p.busy.mula) / (p.busy.until - p.busy.mula), 0, 1), w = 70, yy = y - 26 - i * 17; ctx.fillStyle = 'rgba(8,20,45,.85)'; ctx.fillRect(x - w / 2 - 2, yy - 7, w + 4, 14); ctx.fillStyle = '#f39c12'; ctx.fillRect(x - w / 2, yy - 5, w * f, 10); ctx.font = '700 9.5px Andika, sans-serif'; ctx.fillStyle = '#fff'; ctx.fillText(masa((p.busy.until - kini()) / 1000), x, yy + .5); });
  }
  // teks terapung
  for (const a of apungan) {
    a.t += dt; const n = NEG[a.k], k = a.t / 1.4, [x, y] = PETA.ke2D(n.ibuLL[0], n.ibuLL[1], 1 + k * 2);
    ctx.globalAlpha = clamp(1 - k * k, 0, 1); ctx.font = '400 19px "Lilita One", sans-serif'; ctx.lineWidth = 4; ctx.strokeStyle = '#0b1a33'; ctx.strokeText(a.txt, x, y); ctx.fillStyle = a.w; ctx.fillText(a.txt, x, y); ctx.globalAlpha = 1;
  }
  apungan = apungan.filter(a => a.t < 1.4);
}

/* ================= HUD & panel ================= */
let perluRender = false, nasihatSeterus = 0, nasihatIdx = 0, nasihatSenyap = 0;
function binaHUD() {
  $('#sumber').innerHTML = [['rm', 'Perbendaharaan'], ['mp', 'Modal Politik'], ['pg', 'Pengaruh diplomatik'], ['sok', 'Sokongan nasional']].map(([k, n]) => `<div class="bar" id="bar-${k}" title="${n}">${IK[k]}<b class="nombor">0</b></div>`).join('');
  $('#pemimpin .muka-wrap').innerHTML = IK.pm;
  $('#laju').innerHTML = [[0, 'jeda', 'Jeda'], [1, 'main', 'Biasa'], [2, 'laju', 'Laju']].map(([v, ic, n]) => `<button data-laju="${v}" aria-label="${n}">${IK[ic]}</button>`).join('');
  $('#laju').querySelectorAll('[data-laju]').forEach(b => b.onclick = () => { bukaAudio(); setLaju(+b.dataset.laju); });
  $('#btnPeristiwa').innerHTML = IK.peristiwa + '<span>Peristiwa</span><span class="titik" hidden></span>';
  $('#btnPeristiwa').onclick = () => { bukaAudio(); bukaPeristiwa(); };
  const nav = [['navProjek', 'projek', 'Projek', bukaProjek], ['navDasar', 'dasar', 'Dasar', bukaDasar], ['navDiplomasi', 'diplomasi', 'Diplomasi', bukaDiplomasi], ['navParlimen', 'parlimen', 'Parlimen', bukaParlimen], ['navLaporan', 'laporan', 'Laporan', bukaLaporan]];
  for (const [id, ic, n, f] of nav) { $('#' + id).innerHTML = IK[ic] + `<span>${n}</span><span class="titik" hidden></span>`; $('#' + id).onclick = () => { bukaAudio(); f(); }; }
  $('#btnTetapan').innerHTML = IK.tetapan; $('#btnTetapan').onclick = () => { bukaAudio(); bukaTetapan(); };
  $('#lensa').innerHTML = [['peta', 'Peta'], ['sokongan', 'Sokongan'], ['ekonomi', 'Ekonomi'], ['kerja', 'Pekerjaan'], ['penduduk', 'Penduduk'], ['etnik', 'Etnik'], ['banjir', 'Banjir']].map(([k, n]) => `<button data-l="${k}">${n}</button>`).join('');
  $('#lensa').querySelectorAll('[data-l]').forEach(b => b.onclick = () => { S.lensa = b.dataset.l; sfx('ketik'); paparLensa(); simpan(); });
  $('#kamera').innerHTML = [['semenanjung', 'Semenanjung'], ['borneo', 'Borneo'], ['malaysia', 'Malaysia']].map(([k, n]) => `<button data-c="${k}">${n}</button>`).join('');
  $('#kamera').querySelectorAll('[data-c]').forEach(b => b.onclick = () => { fokusPreset(b.dataset.c); sfx('ketik'); });
  $('#modalTutup').onclick = () => tutupModal();
  $('#modal').addEventListener('pointerdown', e => { if (e.target.id === 'modal') tutupModal(); });
}
function setLaju(v) { S.laju = v; document.querySelectorAll('#laju [data-laju]').forEach(b => b.classList.toggle('aktif', +b.dataset.laju === v)); }
function lencana(id, n) { const t = $('#' + id + ' .titik'); if (!t) return; t.hidden = !n; t.textContent = n > 9 ? '9+' : n; }
function kemaskiniHUD() {
  if (!S) return;
  const set = (k, v, war) => { const b = $('#bar-' + k + ' b'); b.textContent = v; b.style.color = war || ''; };
  set('rm', rm(S.rm)); set('mp', fmtN(S.mp)); set('pg', fmtN(S.pg)); const sn = sokNasional(); set('sok', fmt(sn, 0) + '%', sn < 40 ? '#ff9a8a' : sn >= 60 ? '#a8f0b0' : '');
  $('#namaPM').textContent = 'PM ' + S.nama;
  $('#tarikh').textContent = namaBulan(S.bulan);
  $('#penggal').textContent = `Penggal ${S.penggal} · PRU dalam ${60 - S.bulanPenggal} bulan`;
  $('#bulanBar').style.width = (100 * (S.acc || 0)) + '%';
  $('#pasukan').innerHTML = `Pasukan projek <b>${pasukanLapang()}/${pasukanJumlah()}</b>`;
  lencana('btnPeristiwa', S.peristiwa.length + S.permintaan.length);
  lencana('navLaporan', bolehTuntut());
  if (pilihanN) { const st = $('#panelProjek'); if (st) st.innerHTML = senaraiProjekNegeri(pilihanN); const h = $('#panelHasil'); if (h) h.textContent = rm(S.negeri[pilihanN].hasil); }
  paparNasihat();
}
function paparTicker() { const el = $('#ticker'); if (!el || !S.berita.length) return; el.innerHTML = `<b>BERITA</b><span>${esc(S.berita[0].t)}</span>`; }
const statKad = (a, b) => `<div class="stat"><small>${a}</small><b class="nombor">${b}</b></div>`;
function senaraiProjekNegeri(k) {
  const st = S.negeri[k];
  if (!st.projek.length) return '<small class="kosong">Belum ada projek persekutuan di sini.</small>';
  return st.projek.map(p => `<span class="cip ${p.busy ? 'sibuk' : ''}">${esc(PROJEK[p.j].n)} <b>${p.busy ? (p.lv ? p.lv + '→' : '') + p.busy.toLv + ' · ' + masa((p.busy.until - kini()) / 1000) : 'T' + p.lv}</b></span>`).join('');
}
function paparPanel() {
  const el = $('#panel'), k = pilihanN;
  if (!k) { el.hidden = true; return; }
  const n = NEG[k], st = S.negeri[k], [b, c, i, l] = n.etnik, minta = S.permintaan.find(q => q.negeri === k);
  el.innerHTML = `<div class="jalur"></div><div class="kepala"><div><h3>${esc(n.n)}</h3><small>${esc(n.j)} · ${esc(n.g)} · ibu: ${esc(n.ibu)}</small></div><button class="btn kecil kelabu" id="panelTutup" aria-label="Tutup">✕</button></div>
    <div class="grid-stat">${statKad('Penduduk', fmt(st.pop, 2) + ' juta')}${statKad('Luas', fmtN(n.luas) + ' km²')}${statKad('Kerusi', n.kerusi)}${statKad('KDNK/kapita', 'RM' + fmtN(perKapita(k) * 1000))}${statKad('Pengangguran', fmt(st.kerja) + '%')}${statKad('Sokongan', fmt(st.sok, 0) + '%')}</div>
    <div class="etnik" title="Bumiputera ${b}%, Cina ${c}%, India ${i}%, Lain-lain ${l}%"><i style="width:${b}%;background:#1f8a5a"></i><i style="width:${c}%;background:#e0703a"></i><i style="width:${i}%;background:#e8a93a"></i><i style="width:${l}%;background:#8a94a6"></i></div>
    <small class="kecil-etnik">Bumiputera ${b}% · Cina ${c}% · India ${i}% · Lain ${l}% (anggaran warganegara)</small>
    <p class="sektor">${esc(n.sektor)}</p>
    ${minta ? `<div class="minta">Permohonan negeri: <b>${esc(PROJEK[minta.j].n)}${minta.lv > 1 ? ' tahap ' + minta.lv : ''}</b> sebelum ${namaBulan(minta.sampai)}</div>` : ''}
    <div class="projek-negeri" id="panelProjek">${senaraiProjekNegeri(k)}</div>
    <div class="tindakan"><button class="btn" id="pBina">Bina projek</button><button class="btn hijau" id="pKutip">Kutip <span id="panelHasil">${rm(st.hasil)}</span></button><button class="btn kelabu" id="pLawat">Lawatan kerja ${IK.mp}3</button>${k === 'PJY' ? '<button class="btn merah" id="pPutra">Pusat Pentadbiran</button>' : ''}<button class="btn kelabu" id="pZum">Zum</button></div>`;
  el.hidden = false;
  $('#panelTutup').onclick = () => pilihNegeri(null);
  $('#pBina').onclick = () => bukaProjek(k);
  $('#pKutip').onclick = () => { if (!kutip(k)) toast('Tiada hasil untuk dikutip. Bina pelabuhan, pelancongan atau industri.', true); };
  $('#pLawat').onclick = () => lawatanKerja(k);
  $('#pZum').onclick = () => fokusNegeri(k);
  const pp = $('#pPutra'); if (pp) pp.onclick = () => bukaProjek(null, 'putrajaya');
}
function paparNasihat() {
  const el = $('#nasihat'), t = kini();
  if (pilihanN || !$('#modal').hidden || t < nasihatSenyap) { el.hidden = true; return; }
  if (t < nasihatSeterus && !el.hidden) return;
  nasihatSeterus = t + 9000;
  const l = LANGKAH[S.langkah];
  let teks, siapa = PENASIHAT[nasihatIdx % 3];
  if (l) { teks = l.t; siapa = PENASIHAT[0]; }
  else {
    const tips = [];
    if (hutangPct() > 63) tips.push([0, `Hutang kini ${fmt(hutangPct())}% KDNK, hampir had 65%. Pertimbangkan disiplin fiskal atau kurangkan subsidi pukal.`]);
    if (S.inflasi > 3.5) tips.push([0, `Inflasi ${fmt(S.inflasi)}% menekan kos sara hidup. Rakyat bandar paling terasa.`]);
    const lemah = NEGERI.slice().sort((a, b) => S.negeri[a.k].sok - S.negeri[b.k].sok)[0];
    if (S.negeri[lemah.k].sok < 42) tips.push([2, `Sokongan di ${lemah.n} hanya ${fmt(S.negeri[lemah.k].sok, 0)}%. Ia ada ${lemah.kerusi} kerusi. Lawatan kerja atau projek boleh membantu.`]);
    if (S.perpaduan < 55) tips.push([1, `Indeks perpaduan ${fmt(S.perpaduan, 0)}. Pendidikan dan dialog antara kaum menguatkan semula.`]);
    if (pasukanLapang() > 0) tips.push([0, 'Ada pasukan projek yang lapang. Pilih negeri dengan kesesuaian tinggi untuk pulangan terbaik.']);
    if (S.peristiwa.length) tips.push([2, 'Ada peristiwa menunggu keputusan. Jika dibiarkan 3 bulan, rakyat akan menilai kerajaan lambat bertindak.']);
    if (S.permintaan.length) tips.push([1, `Kerajaan negeri ${NEG[S.permintaan[0].negeri].n} menunggu ${PROJEK[S.permintaan[0].j].n}. Menunaikannya menaikkan sokongan di sana.`]);
    if (Math.abs(S.hubungan.CN - S.hubungan.US) > 20) tips.push([2, 'Hubungan dengan China dan Amerika semakin tidak seimbang. Dasar berkecuali memerlukan keseimbangan.']);
    if (S.bulanPenggal > 42) tips.push([2, `PRU dalam ${60 - S.bulanPenggal} bulan. Kau juga boleh bubar Parlimen lebih awal jika sokongan sedang tinggi.`]);
    tips.push([1, 'Negeri pantai timur menerima hujan monsun pada November hingga Januari. Tebatan banjir mengurangkan kerosakan.']);
    const [i, tx] = tips[nasihatIdx++ % tips.length]; siapa = PENASIHAT[i]; teks = tx;
  }
  el.innerHTML = `<span class="muka">${siapa.svg}</span><div class="kata"><b>${esc(siapa.n)} · ${esc(siapa.b)}</b>${esc(teks)}</div>`;
  el.hidden = false; el.onclick = () => { el.hidden = true; nasihatSenyap = kini() + 30000; };
}
let toastAkhir = '';
function toast(msg, ralat) {
  const box = $('#toast'); if (msg === toastAkhir) return; toastAkhir = msg;
  const d = document.createElement('div'); d.textContent = msg; if (ralat) d.className = 'ralat'; box.appendChild(d); while (box.children.length > 3) box.firstChild.remove();
  setTimeout(() => { d.remove(); if (toastAkhir === msg) toastAkhir = ''; }, 3000);
}

/* ================= Modal ================= */
let modalCur = null;
function bukaModal(tajuk, tabs, render, tabAwal) { modalCur = { tajuk, tabs, render, tab: tabAwal || (tabs && tabs[0][0]) }; $('#modal').hidden = false; $('#modalTajuk').textContent = tajuk; renderModal(true); paparNasihat(); }
function renderModal(baru) {
  if (!modalCur) return;
  const { tabs, render } = modalCur, tab = $('#modalTab');
  tab.innerHTML = tabs ? tabs.map(([k, n, t]) => `<button data-tab="${k}" class="${k === modalCur.tab ? 'aktif' : ''}">${n}${t ? ` <span class="titik dalam">${t}</span>` : ''}</button>`).join('') : ''; tab.hidden = !tabs;
  tab.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { modalCur.tab = b.dataset.tab; sfx('ketik'); renderModal(true); });
  const isi = $('#modalIsi'), atas = isi.scrollTop; render(modalCur.tab, isi); isi.scrollTop = baru ? 0 : atas;
}
function tutupModal(paksa) {
  if (!paksa && modalCur && /^(Keputusan PRU|Legasi)/.test(modalCur.tajuk)) { toast('Buat keputusan dahulu.', true); return; }
  $('#modal').hidden = true; modalCur = null; if (runding) runding = null;
}
let tekanModal = false; $('#modal').addEventListener('pointerdown', () => { tekanModal = true; }); addEventListener('pointerup', () => { tekanModal = false; });

function bukaProjek(negeriAwal, tabAwal) {
  let k = negeriAwal || pilihanN || 'SGR';
  bukaModal('Projek Persekutuan', [['negeri', 'Projek negeri'], ['mega', 'Projek mega'], ['putrajaya', 'Pusat Pentadbiran']], (tab, isi) => {
    if (tab === 'negeri') {
      const pilihN = `<div class="pilih-negeri">${NEGERI.map(n => `<button data-n="${n.k}" class="${n.k === k ? 'aktif' : ''}">${esc(n.n)}</button>`).join('')}</div>`;
      const n = NEG[k];
      isi.innerHTML = `<div class="ruang"><span>Perbendaharaan <b>${rm(S.rm)}</b></span><span>Pasukan lapang <b>${pasukanLapang()}/${pasukanJumlah()}</b></span></div>${pilihN}<p class="kecil">${esc(n.n)}: ${esc(n.sektor)}. Bintang menunjukkan kesesuaian negeri ini untuk setiap projek.</p><div class="grid-kad">${Object.entries(PROJEK).map(([j, d]) => {
        const p = projekDi(k, j), lv = p ? p.lv + 1 : 1, halang = bolehBina(k, j), fit = fitNilai(k, j), bintang = fit <= 0 ? 0 : fit >= 1.5 ? 3 : fit >= 1.1 ? 2 : 1;
        const maks = lv > 5 || (p && lv > maxLvProjek()), sibuk = p && p.busy, kos = kosProjek(j, Math.min(5, lv));
        const status = halang ? halang : sibuk ? `Sedang dibina · ${masa((p.busy.until - kini()) / 1000)}` : lv > 5 ? 'Tahap maksimum' : maks ? `Tahap ${lv} perlu fasa Putrajaya lebih tinggi` : `${p ? 'Naik ke tahap ' + lv : 'Bina tahap 1'} · ${masa(masaProjek(j, lv))}`;
        return `<div class="kedai ${halang ? 'kunci' : ''}"><div class="kedai-atas"><h4>${esc(d.n)}</h4><span class="bintang">${[0, 1, 2].map(x => `<i class="${x < bintang ? 'on' : ''}">★</i>`).join('')}</span></div><small class="kat">${d.kat}${p && p.lv ? ' · tahap ' + p.lv : ''}${d.hasil ? ' · menjana hasil' : ''}</small><div class="kecil">${esc(d.d)}</div><div class="kecil"><b>${esc(status)}</b></div>${sibuk ? `<button class="btn hijau" data-cepat="${j}">Siapkan ${IK.mp}${Math.max(1, Math.ceil((p.busy.until - kini()) / 45000))}</button>` : `<button class="btn ${halang || maks || S.rm < kos ? 'mati' : ''}" data-bina="${j}">${IK.rm} ${rm(kos)}${S.diskaun[j] > S.bulan ? ' <small>(diskaun)</small>' : ''}</button>`}</div>`;
      }).join('')}</div>`;
      isi.querySelectorAll('[data-n]').forEach(b => b.onclick = () => { k = b.dataset.n; pilihanN = k; paparPanel(); sfx('ketik'); renderModal(); });
      const ak = isi.querySelector('.pilih-negeri .aktif'); if (ak) ak.parentElement.scrollLeft = ak.offsetLeft - ak.parentElement.offsetLeft - 40;
      isi.querySelectorAll('[data-bina]').forEach(b => b.onclick = () => { binaProjek(k, b.dataset.bina); renderModal(); });
      isi.querySelectorAll('[data-cepat]').forEach(b => b.onclick = () => { percepat(k, b.dataset.cepat); renderModal(); });
    } else if (tab === 'mega') {
      isi.innerHTML = `<p>Projek infrastruktur berskala negara. Setiap satu menggunakan satu pasukan projek hingga siap.</p>${Object.entries(MEGA).map(([mk, d]) => {
        const st = S.megaProjek[mk], kunci = d.buka > fasa(), syarat = d.syaratNegara ? `Hubungan ${NEGARA_K[d.syaratNegara[0]].n} ≥ ${d.syaratNegara[1]} (kini ${fmt(S.hubungan[d.syaratNegara[0]], 0)})` : '';
        return `<div class="baris"><div class="teks"><b>${esc(d.n)}</b><small>${esc(d.d)}</small><small>Negeri: ${d.negeri.map(x => NEG[x].n).join(', ')}${syarat ? ' · ' + syarat : ''}</small>${st && !st.siap ? `<div class="meter"><i style="width:${100 * clamp((kini() - st.mula) / (st.until - st.mula), 0, 1)}%"></i></div><small>Siap dalam ${masa((st.until - kini()) / 1000)}</small>` : ''}</div>${st ? (st.siap ? '<b class="ok">Beroperasi</b>' : '') : kunci ? `<small>Fasa ${d.buka}</small>` : `<button class="btn ${S.rm < d.kos ? 'mati' : ''}" data-mega="${mk}">${IK.rm} ${rm(d.kos)}</button>`}</div>`;
      }).join('')}`;
      isi.querySelectorAll('[data-mega]').forEach(b => b.onclick = () => { mulaMega(b.dataset.mega); renderModal(); });
    } else {
      const lv = fasa(), nx = FASA[lv], halang = nx && nx.syarat && nx.syarat(S);
      isi.innerHTML = `<h3>Pusat Pentadbiran Putrajaya · fasa ${lv}: ${esc(FASA[lv - 1].n)}</h3><p>Setiap fasa membuka jenis projek baharu, tahap projek lebih tinggi dan pasukan projek tambahan.</p>
        ${FASA.map((f, i) => `<div class="baris ${i + 1 === lv ? 'semasa' : ''}"><b class="no">${i + 1}</b><div class="teks"><b>${esc(f.n)}</b><small>${[...Object.values(PROJEK).filter(d => d.buka === i + 1).map(d => d.n), ...Object.values(MEGA).filter(d => d.buka === i + 1).map(d => d.n)].join(', ') || 'Tahap projek & pasukan tambahan'}</small></div>${i + 1 < lv ? '<b class="ok">✓</b>' : ''}</div>`).join('')}
        ${S.putrajaya.busy ? `<p><b>Peralihan fasa sedang berjalan:</b> siap dalam <span data-sampai="${S.putrajaya.busy.until}">${masa((S.putrajaya.busy.until - kini()) / 1000)}</span>.</p>` : nx ? `<p>${halang ? `<b>Syarat:</b> ${esc(halang)}` : `Fasa seterusnya: <b>${esc(nx.n)}</b> · ${masa(nx.tb)}`}</p><button class="btn merah ${halang || S.rm < nx.kos ? 'mati' : ''}" id="naikP">Naik ke fasa ${lv + 1} ${IK.rm} ${rm(nx.kos)}</button>` : '<p><b>Fasa tertinggi dicapai.</b></p>'}`;
      const b = $('#naikP'); if (b) b.onclick = () => { naikPutrajaya(); renderModal(); };
    }
  }, tabAwal);
}
function bukaDasar() {
  bukaModal('Dasar & Belanjawan', [['dasar', 'Dasar'], ['bajet', 'Belanjawan']], (tab, isi) => {
    if (tab === 'dasar') {
      isi.innerHTML = `<p>Setiap perubahan dasar memerlukan Modal Politik dan undian Dewan Rakyat. Kerajaan kini ada <b>${S.kerusi.kami}</b> kerusi.</p>${Object.entries(DASAR).map(([k, d]) => `<div class="dasar"><div class="teks"><b>${esc(d.n)}</b><small>${esc(d.d)}</small></div><div class="pilihan-dasar">${d.pilihan.map((p, i) => `<button data-d="${k}" data-i="${i}" class="${S.dasar[k] === i ? 'aktif' : ''}">${esc(p)}</button>`).join('')}</div><small class="kos-mp">${IK.mp} ${d.mp}${d.perlembagaan ? ' · perlu 148 kerusi' : ''}</small></div>`).join('')}`;
      isi.querySelectorAll('[data-d]').forEach(b => b.onclick = () => ubahDasar(b.dataset.d, +b.dataset.i));
    } else {
      const b = S.bajetLalu || { hasil: 0, belanja: 0, upkeep: 0 }, K = kdnkJumlah();
      isi.innerHTML = `<div class="grid-stat">${statKad('KDNK', rm(K))}${statKad('Pertumbuhan', fmt(NEGERI.reduce((a, n) => a + S.negeri[n.k].tumbuhSemasa * S.negeri[n.k].kdnk, 0) / K * 100) + '%')}${statKad('Inflasi', fmt(S.inflasi) + '%')}${statKad('Hutang', rm(S.hutang) + ' · ' + fmt(hutangPct()) + '%')}${statKad('Hasil bulanan', rm(b.hasil))}${statKad('Belanja bulanan', rm(b.belanja))}</div>
        <div class="meter-hutang"><i style="width:${Math.min(100, hutangPct() / .8)}%;background:${hutangPct() > 65 ? '#e4574a' : hutangPct() > 58 ? '#f2c94c' : '#3fae5a'}"></i><span style="left:${65 / .8}%">had 65%</span></div>
        <p>Penyelenggaraan projek: ${rm(b.upkeep)} sebulan. Faedah hutang: ${rm(S.hutang * .042 / 12)} sebulan.</p>
        <div class="baris"><div class="teks"><b>Terbitkan bon kerajaan</b><small>Dapat RM10 bilion sekarang. Hutang naik RM10.3 bilion dan faedah bulanan bertambah.</small></div><button class="btn" id="bon">Terbit bon</button></div>
        <p class="kecil">Fokus belanjawan tahun ini: <b>${{ pembangunan: 'Pembangunan', sosial: 'Kebajikan rakyat', disiplin: 'Disiplin fiskal' }[S.fokus] || 'Belum ditetapkan (dibentang setiap Januari)'}</b></p>`;
      $('#bon').onclick = terbitBon;
    }
  });
}
function bukaDiplomasi(kAwal) {
  let k = kAwal || null;
  bukaModal('Diplomasi', null, function r(_, isi) {
    if (!k) {
      isi.innerHTML = `<div class="ruang"><span>Pengaruh ${IK.pg} <b>${S.pg}</b></span><span>Perjanjian <b>${S.perjanjian.length}</b></span></div><p class="kecil">Malaysia mengamalkan dasar berkecuali. Jaga keseimbangan antara kuasa besar.</p>${NEGARA.map(n => `<button class="baris negara" data-k="${n.k}">${bendera(n.k)}<div class="teks"><b>${esc(n.n)}</b><small>${esc(n.blok)} · ${esc(n.isu)}</small><div class="meter"><i style="width:${S.hubungan[n.k]}%;background:${skala3(S.hubungan[n.k], 30, 80, '#e4574a', '#f2c94c', '#3fae5a')}"></i></div></div><b class="nombor">${fmt(S.hubungan[n.k], 0)}</b></button>`).join('')}`;
      isi.querySelectorAll('[data-k]').forEach(b => b.onclick = () => { k = b.dataset.k; sfx('ketik'); renderModal(true); });
    } else {
      const n = NEGARA_K[k], lalu = S.lawatan[k] ?? -99, boleh = S.bulan - lalu >= 4, pj = S.perjanjian.filter(p => p.k === k);
      isi.innerHTML = `<button class="btn kelabu kecil" id="balik">← Semua negara</button><div class="kepala-negara">${bendera(k)}<div><h3>${esc(n.n)}</h3><small>${esc(n.blok)} · isu: ${esc(n.isu)}</small></div></div>
        <div class="ruang"><span>Hubungan</span><div class="meter"><i style="width:${S.hubungan[k]}%;background:${skala3(S.hubungan[k], 30, 80, '#e4574a', '#f2c94c', '#3fae5a')}"></i></div><b class="nombor">${fmt(S.hubungan[k], 0)}</b></div>
        ${pj.length ? `<p>Perjanjian: ${pj.map(p => HASIL_RUNDING.find(h => h.k === p.jenis).n + ' (' + namaBulan(p.bulan) + ')').join(', ')}</p>` : ''}
        <div class="baris"><div class="teks"><b>Lawatan rasmi</b><small>Menaikkan hubungan. Kadangkala membawa pelaburan.${boleh ? '' : ' Boleh semula pada ' + namaBulan(lalu + 4) + '.'}</small></div><button class="btn ${boleh && S.pg >= 4 ? '' : 'mati'}" id="lawat">${IK.pg} 4</button></div>
        <div class="baris"><div class="teks"><b>Meja rundingan</b><small>Baca keutamaan mereka, beri tawaran yang tepat, minta balasan. Perlu hubungan 40.</small></div><button class="btn merah ${S.hubungan[k] >= 40 && S.pg >= 8 ? '' : 'mati'}" id="runding">${IK.pg} 8</button></div>`;
      $('#balik').onclick = () => { k = null; renderModal(true); };
      $('#lawat').onclick = () => lawatanRasmi(k);
      $('#runding').onclick = () => mulaRunding(k);
    }
  });
}
function bukaParlimen() {
  bukaModal('Dewan Rakyat', null, (_, isi) => {
    const { kami, borneo, lawan } = S.kerusi, bolehBubar = S.bulanPenggal >= 24;
    isi.innerHTML = `<div class="keputusan"><div class="angka"><span style="color:#2f6fd1">Kerajaan ${kami}</span><span style="color:#d98a00">Blok Borneo ${borneo}</span><span style="color:#6b7480">Pembangkang ${lawan}</span></div>
      <div class="dewan"><i style="width:${kami / 2.22}%;background:#2f6fd1"></i><i style="width:${borneo / 2.22}%;background:#f39c12"></i><i style="width:${lawan / 2.22}%;background:#9aa3ad"></i><span style="left:50.45%"></span><span style="left:66.67%"></span></div><p class="kecil">222 kerusi. 112 untuk majoriti mudah, 148 untuk pindaan perlembagaan.</p></div>
      <div class="grid-stat">${statKad('Sokongan nasional', fmt(sokNasional(), 0) + '%')}${statKad('Modal Politik', S.mp)}${statKad('Penggal', S.penggal)}${statKad('PRU wajib', 'dalam ' + (60 - S.bulanPenggal) + ' bulan')}</div>
      <h3>Unjuran kerusi jika PRU hari ini</h3><div class="jadual-wrap"><table class="jadual"><thead><tr><th>Wilayah</th><th>Kerusi</th><th>Sokongan</th><th>Unjuran kerajaan</th></tr></thead><tbody>${NEGERI.slice().sort((a, b) => b.kerusi - a.kerusi).map(n => { const a = S.negeri[n.k].sok, u = Math.round(n.kerusi * (sigmoid((a - 50) / 6) * .92 + .04)); return `<tr><td>${esc(n.n)}</td><td class="nombor">${n.kerusi}</td><td class="nombor">${fmt(a, 0)}%</td><td class="nombor">${u}</td></tr>`; }).join('')}</tbody></table></div>
      <div class="baris"><div class="teks"><b>Bubar Parlimen</b><small>${bolehBubar ? 'Adakan PRU lebih awal ketika sokongan tinggi. Strategi berisiko.' : 'Boleh selepas 24 bulan penggal.'}</small></div><button class="btn merah ${bolehBubar ? '' : 'mati'}" id="bubar">Bubar</button></div>`;
    $('#bubar').onclick = () => { if (!bolehBubar) return; tutupModal(); setTimeout(() => jalankanPRU(true), 200); };
  });
}
function bukaPeristiwa() {
  bukaModal('Peristiwa & Permohonan', null, (_, isi) => {
    if (!S.peristiwa.length && !S.permintaan.length) { isi.innerHTML = '<p>Tiada peristiwa menunggu. Negara aman buat masa ini. Peristiwa baharu muncul ketika kalendar bergerak.</p>'; return; }
    isi.innerHTML = S.peristiwa.map(p => {
      const ev = PERISTIWA.find(e => e.k === p.k), n = p.negeri ? NEG[p.negeri].n : '';
      return `<div class="peristiwa"><div class="kepala-p"><b>${esc(ev.t)}${n ? ' · ' + esc(n) : ''}</b><small>Tamat tempoh ${namaBulan(p.mula + 3)}</small></div><p>${esc(ev.teks(n))}</p>
        <div class="penasihat-baris">${PENASIHAT.map(a => `<span class="muka-kecil" title="${esc(a.n)} (${a.b})">${a.svg}</span>`).join('')}<small>Pandangan penasihat untuk setiap pilihan</small></div>
        ${ev.pilihan.map((c, i) => `<button class="pilihan" data-p="${p.id}" data-i="${i}"><span>${esc(c.t)}</span><span class="undi">${c.nasihat.map((v, j) => `<i class="${v > 0 ? 'ya' : v < 0 ? 'tidak' : 'neutral'}" title="${PENASIHAT[j].n}: ${v > 0 ? 'menyokong' : v < 0 ? 'membantah' : 'berkecuali'}">${PENASIHAT[j].b[0]}</i>`).join('')}</span></button>`).join('')}</div>`;
    }).join('') + (S.permintaan.length ? `<h3>Permohonan kerajaan negeri</h3>${S.permintaan.map(q => `<div class="baris"><div class="teks"><b>${esc(NEG[q.negeri].n)}: ${esc(PROJEK[q.j].n)}${q.lv > 1 ? ' tahap ' + q.lv : ''}</b><small>Sebelum ${namaBulan(q.sampai)}. Tunaikan untuk +sokongan negeri dan Modal Politik.</small></div><button class="btn" data-ke="${q.negeri}" data-j="${q.j}">Bina</button></div>`).join('')}` : '');
    isi.querySelectorAll('[data-p]').forEach(b => b.onclick = () => {
      const p = S.peristiwa.find(x => x.id === +b.dataset.p); if (!p) return;
      sfx('gong'); const nota = selesaiPeristiwa(p, +b.dataset.i, false);
      if (!S.peristiwa.length && !S.permintaan.length) { tutupModal(); if (nota) toast(nota); } else renderModal();
    });
    isi.querySelectorAll('[data-ke]').forEach(b => b.onclick = () => { const k = b.dataset.ke; pilihanN = k; paparPanel(); bukaProjek(k); });
  });
}
function bukaLaporan(tabAwal) {
  semakMisi();
  const tabs = () => [['wawasan', 'Wawasan'], ['misi', 'Misi', S.misi.senarai.filter(m => m.p >= m.n && !m.ambil).length], ['capai', 'Pencapaian', CAPAI.filter(c => (S.capai[c.k] || 0) < 3 && nilaiCapai(c.k) >= c.t[S.capai[c.k] || 0]).length], ['kuiz', 'Kuiz'], ['berita', 'Berita']];
  bukaModal('Laporan Negara', tabs(), (tab, isi) => {
    if (tab === 'wawasan') {
      isi.innerHTML = `<p>Sasaran jangka panjang Malaysia di bawah pimpinan kau.</p>${WAWASAN.map(w => { const f = kemajuanW(w), siap = w.turun ? w.v() <= w.s : w.v() >= w.s; return `<div class="baris"><div class="teks"><b>${esc(w.n)} ${siap ? '<span class="ok">✓</span>' : ''}</b><small>${esc(w.d)} · kini ${w.f(w.v())}</small><div class="meter"><i style="width:${(siap ? 1 : f) * 100}%"></i></div></div></div>`; }).join('')}
        <div class="grid-stat">${statKad('Penduduk', fmt(popJumlah()) + ' juta')}${statKad('KDNK', rm(kdnkJumlah()))}${statKad('Pengangguran', fmt(kerjaNasional()) + '%')}${statKad('Perpaduan', fmt(S.perpaduan, 0))}${statKad('Tenaga hijau', fmt(indeksHijau(), 0))}${statKad('Skor legasi', fmtN(skorLegasi()))}</div>`;
    } else if (tab === 'misi') {
      const m = S.misi, semua = m.senarai.every(x => x.ambil);
      isi.innerHTML = `<p>Tiga misi baharu setiap hari. Setiap misi memberi ${IK.mp} 3 Modal Politik dan ${IK.rm} RM2 bilion.</p>${m.senarai.map((x, i) => { const j = MISI_JENIS.find(y => y.k === x.k), siap = x.p >= x.n; return `<div class="baris"><div class="teks"><b>${esc(j.t(x.n))}</b><div class="meter"><i style="width:${100 * x.p / x.n}%"></i></div><small class="nombor">${fmt(x.p, x.k === 'kutip' ? 1 : 0)} / ${x.n}</small></div>${x.ambil ? '<small>Dituntut</small>' : `<button class="btn ${siap ? 'hijau' : 'mati'}" data-m="${i}">Tuntut</button>`}</div>`; }).join('')}<div class="baris"><div class="teks"><b>Bonus harian</b><small>Selesaikan ketiga-tiga misi: ${IK.pg} 6 Pengaruh</small></div>${m.bonus ? '<small>Dituntut</small>' : `<button class="btn ${semua ? 'hijau' : 'mati'}" id="bonusM">Tuntut</button>`}</div>`;
      isi.querySelectorAll('[data-m]').forEach(b => b.onclick = () => { const x = m.senarai[+b.dataset.m]; if (x.p < x.n || x.ambil) return; x.ambil = true; S.mp += 3; S.rm += 2; sfx('kutip'); modalCur.tabs = tabs(); kemaskiniHUD(); renderModal(); simpan(); });
      const bb = $('#bonusM'); if (bb) bb.onclick = () => { if (!semua || m.bonus) return; m.bonus = true; S.pg += 6; sfx('menang'); modalCur.tabs = tabs(); kemaskiniHUD(); renderModal(); simpan(); };
    } else if (tab === 'capai') {
      isi.innerHTML = CAPAI.map(c => { const t = S.capai[c.k] || 0, v = nilaiCapai(c.k), sasar = c.t[Math.min(2, t)], siap = t < 3 && v >= c.t[t]; return `<div class="baris"><span class="bintang-tiga">${[0, 1, 2].map(i => IK.bintang(i < t)).join('')}</span><div class="teks"><b>${esc(c.n)}</b><small>${esc(c.d)}: ${fmt(Math.min(v, sasar), c.k === 'kutip' ? 1 : 0)} / ${sasar}</small><div class="meter"><i style="width:${t >= 3 ? 100 : 100 * Math.min(1, v / sasar)}%"></i></div></div>${t >= 3 ? '<small>Lengkap</small>' : `<button class="btn ${siap ? 'hijau' : 'mati'}" data-c="${c.k}">${IK.mp} ${GANJARAN_CAPAI[t]}</button>`}</div>`; }).join('');
      isi.querySelectorAll('[data-c]').forEach(b => b.onclick = () => { const c = CAPAI.find(x => x.k === b.dataset.c), t = S.capai[c.k] || 0; if (t >= 3 || nilaiCapai(c.k) < c.t[t]) return; S.capai[c.k] = t + 1; S.mp = clamp(S.mp + GANJARAN_CAPAI[t], 0, 99); sfx('menang'); modalCur.tabs = tabs(); kemaskiniHUD(); renderModal(); simpan(); });
    } else if (tab === 'kuiz') renderKuiz(isi);
    else isi.innerHTML = S.berita.length ? S.berita.map(b => `<div class="baris berita"><small>${namaBulan(b.b)}</small><div class="teks">${esc(b.t)}</div></div>`).join('') : '<p>Belum ada berita.</p>';
  }, tabAwal);
}
let kuizSesi = null;
function renderKuiz(isi) {
  if (S.kuiz.hari !== hariIni()) S.kuiz = { hari: hariIni(), jawab: 0 };
  const baki = Math.max(0, 5 - S.kuiz.jawab);
  if (!kuizSesi) {
    isi.innerHTML = `<h3>Kuiz Malaysia Kita</h3><p>Geografi, demografi dan sistem pentadbiran Malaysia hari ini. ${baki ? `Masih ada <b>${baki}</b> soalan berganjaran hari ini: setiap jawapan betul memberi ${IK.mp} 2 Modal Politik.` : 'Ganjaran hari ini sudah habis; kau masih boleh berlatih.'}</p><button class="btn merah" id="mulaKuiz">Mula kuiz</button>`;
    $('#mulaKuiz').onclick = () => { const r = rng(cincang(hariIni()) + S.stat.kuiz * 7 + Math.floor(acak() * 999)); kuizSesi = { idx: KUIZ.map((_, i) => i).sort(() => r() - .5).slice(0, 5), i: 0, betul: 0, jawab: null }; renderKuiz(isi); };
    return;
  }
  const q = KUIZ[kuizSesi.idx[kuizSesi.i]];
  if (!q) { isi.innerHTML = `<h3>Tamat!</h3><p>${kuizSesi.betul} daripada 5 betul.</p><button class="btn merah" id="ulangK">Kuiz lagi</button>`; $('#ulangK').onclick = () => { kuizSesi = null; renderKuiz(isi); }; return; }
  isi.innerHTML = `<small class="label">Soalan ${kuizSesi.i + 1} / 5</small><h3>${esc(q.s)}</h3><div class="kuiz-pilihan">${q.p.map((p, i) => `<button data-j="${i}" class="${kuizSesi.jawab == null ? '' : i === q.j ? 'betul' : i === kuizSesi.jawab ? 'salah' : ''}">${esc(p)}</button>`).join('')}</div>${kuizSesi.jawab != null ? `<p>${kuizSesi.jawab === q.j ? 'Betul!' : `Jawapan betul: <b>${esc(q.p[q.j])}</b>.`}</p><button class="btn" id="seterusK">Seterusnya</button>` : ''}`;
  isi.querySelectorAll('[data-j]').forEach(b => b.onclick = () => {
    if (kuizSesi.jawab != null) return; kuizSesi.jawab = +b.dataset.j;
    if (kuizSesi.jawab === q.j) { kuizSesi.betul++; S.stat.kuiz++; misi('kuiz'); sfx('kutip'); if (S.kuiz.jawab < 5) { S.mp = clamp(S.mp + 2, 0, 99); toast('+2 Modal Politik'); } } else sfx('salah');
    S.kuiz.jawab++; kemaskiniHUD(); simpan(); renderKuiz(isi);
  });
  const sn = $('#seterusK'); if (sn) sn.onclick = () => { kuizSesi.i++; kuizSesi.jawab = null; renderKuiz(isi); };
}
function bukaTetapan() {
  bukaModal('Tetapan', null, (_, isi) => {
    isi.innerHTML = `<div class="medan"><label for="inputNama"><b>Nama Perdana Menteri</b></label><input id="inputNama" maxlength="20" value="${esc(S.nama)}"></div>
      <div class="baris"><div class="teks"><b>Bunyi</b></div><button class="btn kelabu" id="btnBunyi">${S.bunyi ? 'Hidup' : 'Mati'}</button></div>
      <h3>Tentang Malaysia Kita</h3><p>Permainan strategi pentadbiran berdasarkan geografi dan demografi Malaysia hari ini: 13 negeri dan 3 Wilayah Persekutuan, 222 kerusi Dewan Rakyat, dan rakan antarabangsa sebenar. Parti politik dan watak dalam permainan ini rekaan.</p>
      <p>Data permulaan ialah anggaran yang dibundarkan berpandukan statistik awam seperti Banci Penduduk 2020. Ia untuk pembelajaran, bukan sumber rasmi. Sempadan negeri dipermudahkan.</p>
      <p>Tiada pembelian sebenar. Projek dan hasil terus berjalan semasa kau tiada; kalendar hanya bergerak ketika kau bermain.</p>
      ${(S.legasi || []).length ? `<h3>Legasi lalu</h3>${S.legasi.map(l => `<div class="baris"><div class="teks"><b>Skor ${fmtN(l.skor)}</b><small>${l.penggal} penggal, hingga ${l.tarikh}</small></div></div>`).join('')}` : ''}
      <div class="baris bahaya"><div class="teks"><b>Mula semula</b><small>Padam semua kemajuan pada peranti ini.</small></div><button class="btn merah" id="btnReset">Mula semula</button></div>`;
    $('#inputNama').onchange = e => { S.nama = e.target.value.trim().slice(0, 20) || 'Anda'; kemaskiniHUD(); simpan(); };
    $('#btnBunyi').onclick = () => { S.bunyi = !S.bunyi; bukaAudio(); simpan(); renderModal(); };
    let sah = false;
    $('#btnReset').onclick = e => { if (!sah) { sah = true; e.target.textContent = 'Ketik sekali lagi'; return; } S = keadaanBaru(); pilihanN = null; tutupModal(); fokusPreset('semenanjung'); paparLensa(); setLaju(1); kemaskiniHUD(); simpan(); };
  });
}

/* ================= Gelung utama ================= */
const SAAT_SEBULAN = 40;
let lalu = performance.now(), detik = 0, detikSimpan = 0;
function gelung(t) {
  const dt = Math.min(.1, (t - lalu) / 1000); lalu = t;
  try {
    if (kameraSasar) { const k = Math.min(1, dt * 4); cam.x += (kameraSasar.x - cam.x) * k; cam.z += (kameraSasar.z - cam.z) * k; cam.zum += (kameraSasar.zum - cam.zum) * k; if (Math.abs(kameraSasar.zum - cam.zum) < .002 && Math.abs(kameraSasar.x - cam.x) < .02) kameraSasar = null; hadKamera(); }
    const jedaModal = modalCur && (modalCur.tajuk.startsWith('Keputusan PRU') || modalCur.tajuk.startsWith('Legasi') || modalCur.tajuk.startsWith('Meja Rundingan') || modalCur.tajuk.startsWith('Belanjawan'));
    if (S.laju && !jedaModal) { S.acc = (S.acc || 0) + dt * S.laju / SAAT_SEBULAN; if (S.acc >= 1) { S.acc -= 1; bulanan(); } }
    detik += dt; detikSimpan += dt;
    if (detik > .3) {
      detik = 0; kemaskiniMasa(kini()); semakPermintaan(); kemaskiniHUD();
      if (perluRender && modalCur && !tekanModal && ['Projek Persekutuan', 'Dasar & Belanjawan'].includes(modalCur.tajuk) && document.activeElement.tagName !== 'INPUT') { renderModal(); perluRender = false; }
      document.querySelectorAll('[data-sampai]').forEach(e => e.textContent = masa((+e.dataset.sampai - kini()) / 1000));
      if (S.lensa !== 'peta' && S.lensa !== 'pru') for (const n of NEGERI) PETA.warna(n.k, warnaLensa(n.k));
    }
    if (detikSimpan > 6) { detikSimpan = 0; simpan(); if (!sudahIngatRehat && kini() - mulaSesi > 45 * 60e3) { sudahIngatRehat = true; toast('Dah 45 minit mentadbir negara. Rehat sekejap; projek terus berjalan semasa kau tiada.'); } }
    PETA.render(t / 1000);
    lukisAtas(dt);
  } catch (e) { console.error(e); }
  requestAnimationFrame(gelung);
}

/* ================= Mula ================= */
function mula(data) {
  S = (data && data.S) || muat() || keadaanBaru();
  S.stat = { ...keadaanBaru().stat, ...S.stat };
  if (!PETA.sedia) { PETA.mula($('#gl')); PETA.sedia = true; }
  binaHUD(); ubahSaiz(); fokusPreset(innerWidth < innerHeight ? 'semenanjung' : 'malaysia', true);
  kemaskiniMasa(kini()); semakMisi(); paparLensa(); setLaju(S.laju ?? 1); kemaskiniHUD(); paparTicker();
  if (!S.berita.length) tambahBerita('Perdana Menteri baharu mengangkat sumpah. Rakyat menanti tindakan pertama kerajaan.');
  simpan();
  requestAnimationFrame(t => { lalu = t; requestAnimationFrame(gelung); });
}
addEventListener('resize', ubahSaiz);
document.addEventListener('visibilitychange', () => { if (document.hidden) simpan(); });
addEventListener('pagehide', simpan);
window.claude?.hot?.snapshot?.(() => ({ S }));
if (window.claude?.hot?.ready) window.claude.hot.ready(mula); else mula(window.claude?.hot?.data ?? {});
