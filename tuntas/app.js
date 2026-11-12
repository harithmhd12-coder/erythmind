/* Tuntas · enjin disiplin.
   Peraturan teras:
   1. Ikrar pagi: pilih paling banyak 3 tugasan (paling banyak 1 Berat), setiap satu dengan takrif siap. Selepas ikrar, pelan dikunci.
   2. Satu tugasan pada satu masa, ikut susunan: hutang dahulu, kemudian yang berat dahulu.
   3. Mod fokus mengunci app. Keluar dari app semasa blok = gangguan dicatat. Lebih 2 gangguan = blok tidak sah.
   4. Siap perlu bukti. Lepaskan perlu sebab dan menggagalkan hari.
   5. Hari ditutup dengan muhasabah. Tugasan belum siap menjadi hutang esok.
   Hari logik bermula 4:00 pagi supaya kerja lewat malam dan tahajjud kekal dalam hari yang sama. */
'use strict';

const KUNCI = 'tuntas.v1';
const SEMPADAN_JAM = 4;
const HAD_GANGGU = 2;
const HAD_TANGGUH = 2;
const JEDA_PENDEK = 3 * 60000;
const JEDA_SOLAT = 20 * 60000;
const MASA_DORONGAN = 90;

const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const pad = n => String(n).padStart(2, '0');

/* ---------- Masa & hari logik ---------- */
function kunciHari(ts = Date.now()) {
  const d = new Date(ts - SEMPADAN_JAM * 3600000);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function tarikhDari(k) { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d, 12); }
function tambahHari(k, n) { const d = tarikhDari(k); d.setDate(d.getDate() + n); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
function minitHari(ts = Date.now()) { const d = new Date(ts); let m = d.getHours() * 60 + d.getMinutes(); if (d.getHours() < SEMPADAN_JAM) m += 1440; return m; }
function minitDari(hhmm) { const [h, m] = String(hhmm || '00:00').split(':').map(Number); return h * 60 + m; }
function jamMinit(ms) { const s = Math.max(0, Math.round(ms / 1000)); return `${pad(Math.floor(s / 60))}:${pad(s % 60)}`; }
function labelTarikh(k) { const d = tarikhDari(k); return `${HARI[d.getDay()]}, ${d.getDate()} ${BULAN[d.getMonth()]}`; }
function jam(ts) { const d = new Date(ts); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; }
function fmtMinit(m) { m = Math.round(m); return m < 60 ? `${m}m` : `${Math.floor(m / 60)}j ${pad(m % 60)}m`; }

/* ---------- Storan ---------- */
function asal() {
  const kelas = {}; for (const k of SUSUNAN_KELAS) kelas[k] = { blok: KELAS[k].blok, rehat: KELAS[k].rehat };
  return {
    v: 1, dicipta: Date.now(),
    tetapan: { nama: '', ikrarSebelum: '09:00', muhasabahDari: '18:00', hariRehat: -1, kelas, kebiasaan: KEBIASAAN_ASAL.slice() },
    pustaka: TUGASAN_ASAL.map(([kelas, tajuk]) => ({ id: uid(), kelas, tajuk })),
    hari: {}, tunggu: [], keluar: [], fikiran: [], aktif: null, draf: null
  };
}
let storanOk = true;
function muat() {
  try { const t = localStorage.getItem(KUNCI); if (t) { const s = JSON.parse(t); if (s && s.v === 1) return Object.assign(asal(), s); } }
  catch (e) { storanOk = false; }
  return asal();
}
let S = muat();
function simpan() { try { localStorage.setItem(KUNCI, JSON.stringify(S)); storanOk = true; } catch (e) { storanOk = false; } }

function hariIni() { return kunciHari(); }
function dapatHari(k, cipta = false) {
  if (!S.hari[k] && cipta) S.hari[k] = { ikrar: null, tugas: [], kebiasaan: {}, dorongan: [], sesi: [], muhasabah: null, tangguh: 0, bonus: 0 };
  return S.hari[k];
}
const blokMin = kelas => (S.tetapan.kelas[kelas] || KELAS[kelas]).blok;
const rehatMin = kelas => (S.tetapan.kelas[kelas] || KELAS[kelas]).rehat;

/* ---------- Gulung hari: hari lalu ditutup, tugasan tertinggal menjadi hutang ---------- */
function gulung() {
  const kini = hariIni();
  if (S.aktif && S.aktif.hari < kini) {
    const d = dapatHari(S.aktif.hari);
    if (d && S.aktif.fasa === 'fokus') rekodSesi(d, 'terputus');
    S.aktif = null;
  }
  for (const [k, d] of Object.entries(S.hari)) {
    if (k >= kini || d.tutup) continue;
    for (const t of d.tugas) if (t.status === 'baru' || t.status === 'jalan') t.status = 'hutang';
    d.tutup = true;
  }
  if (S.draf && S.draf.hari !== kini) S.draf = null;
  simpan();
}
function hutangTertunggak() {
  const kini = hariIni(), out = [];
  for (const k of Object.keys(S.hari).sort()) {
    if (k >= kini) continue;
    for (const t of S.hari[k].tugas) if (t.status === 'hutang' && !t.dibawa) out.push({ dari: k, t });
  }
  return out;
}

/* ---------- Penilaian ---------- */
function hariRehat(k) { return S.tetapan.hariRehat >= 0 && tarikhDari(k).getDay() === Number(S.tetapan.hariRehat); }
function nisbahKebiasaan(d) { const n = S.tetapan.kebiasaan.length || 1; return Object.values(d.kebiasaan || {}).filter(Boolean).length / n; }
function keputusan(k) {
  const d = S.hari[k], kini = hariIni(), lalu = k < kini;
  if (k < kunciHari(S.dicipta)) return 'kosong';
  if (k > kini) return 'akan';
  if (hariRehat(k) && !(d && d.ikrar)) return lalu ? 'rehat' : 'rehat-kini';
  if (!d || !d.ikrar) return lalu ? 'gagal' : 'belum';
  const semua = d.tugas.length > 0 && d.tugas.every(t => t.status === 'siap');
  if (!lalu && !d.muhasabah) return semua ? 'menunggu' : 'berjalan';
  if (!semua || !d.muhasabah) return 'gagal';
  if (d.ikrar.lewat || nisbahKebiasaan(d) < 0.6) return 'separa';
  return 'lulus';
}
function skorHari(k) {
  const r = keputusan(k);
  if (!['lulus', 'separa', 'gagal'].includes(r)) return null;
  const d = S.hari[k];
  if (!d || !d.ikrar) return 0;
  const n = d.tugas.length || 1;
  const siap = d.tugas.filter(t => t.status === 'siap').length;
  const lepas = d.tugas.filter(t => t.status === 'lepas').length;
  const tidakSah = d.sesi.filter(s => !s.sah).length;
  let sk = siap / n * 60 + (d.muhasabah ? 20 : 0) + (!d.ikrar.lewat ? 10 : 0) + nisbahKebiasaan(d) * 10 - lepas * 15 - tidakSah * 5;
  if (r === 'gagal') sk = Math.min(sk, 40);
  return Math.max(0, Math.min(100, Math.round(sk)));
}
function indeks(hari = 14) {
  const kini = hariIni(), arr = [];
  for (let i = 0; i < hari; i++) { const s = skorHari(tambahHari(kini, -i)); if (s !== null) arr.push(s); }
  return arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : null;
}
function streak() {
  const kini = hariIni(); let n = 0;
  for (let i = 0; i < 800; i++) {
    const k = tambahHari(kini, -i), r = keputusan(k);
    if (i === 0 && ['berjalan', 'belum', 'menunggu', 'rehat-kini'].includes(r)) continue;
    if (r === 'lulus') n++;
    else if (r === 'rehat' || r === 'separa' || r === 'rehat-kini') continue;
    else break;
  }
  return n;
}
function streakTerbaik() {
  const ks = Object.keys(S.hari).sort(); if (!ks.length) return 0;
  let best = 0, n = 0;
  for (let k = ks[0]; k <= hariIni(); k = tambahHari(k, 1)) {
    const r = keputusan(k);
    if (r === 'lulus') { n++; best = Math.max(best, n); }
    else if (['rehat', 'separa', 'rehat-kini', 'berjalan', 'belum', 'menunggu'].includes(r)) continue;
    else n = 0;
  }
  return best;
}

/* ---------- Murabbi ---------- */
function pilihAyat(arr, benih) { let h = 0; for (const c of benih) h = (h * 31 + c.charCodeAt(0)) >>> 0; return arr[h % arr.length]; }
function keadaanMurabbi() {
  const k = hariIni(), d = S.hari[k], a = S.aktif;
  if (a && a.ganggu > 0) return 'tegas';
  if (hutangTertunggak().length) return 'kecewa';
  const r = keputusan(k);
  if (r === 'rehat-kini') return 'tenang';
  if (!d || !d.ikrar) {
    if (keputusan(tambahHari(k, -1)) === 'gagal' && S.hari[tambahHari(k, -1)]) return 'kecewa';
    return minitHari() > minitDari(S.tetapan.ikrarSebelum) ? 'tegas' : 'risau';
  }
  if (d.muhasabah) return (r === 'lulus' && streak() >= 3) ? 'bangga' : r === 'gagal' ? 'kecewa' : 'gembira';
  if (r === 'menunggu') return 'gembira';
  if (d.tugas.some(t => t.status === 'lepas')) return 'kecewa';
  if (d.ikrar.lewat) return 'tegas';
  if (minitHari() >= minitDari(S.tetapan.muhasabahDari)) return 'risau';
  return (streak() >= 5 && (indeks() || 0) >= 80) ? 'bangga' : 'tenang';
}
function kataMurabbi(st) {
  const d = S.hari[hariIni()];
  if (st === 'tegas' && S.aktif && S.aktif.ganggu > 0) return MURABBI.tegas[0];
  if (st === 'tegas' && d && d.ikrar && d.ikrar.lewat) return MURABBI.tegas[1];
  if (st === 'tegas') return 'Had ikrar sudah lepas. Setiap minit lewat dicatat.';
  if (st === 'risau' && (!d || !d.ikrar)) return `Ikrar sebelum ${S.tetapan.ikrarSebelum}. Jangan biar hari memilih untuk kau.`;
  if (st === 'risau') return MURABBI.risau[1];
  if (st === 'kecewa' && hutangTertunggak().length) return MURABBI.kecewa[0];
  if (st === 'kecewa' && d && d.tugas.some(t => t.status === 'lepas')) return 'Ada ikrar yang dilepaskan. Hari ini tidak lulus. Siapkan yang berbaki dengan jujur.';
  if (keputusan(hariIni()) === 'rehat-kini') return 'Hari rehat. Rehat juga amanah. Pulih, bukan lalai.';
  return pilihAyat(MURABBI[st], hariIni() + st);
}
const LABEL_RASA = { bangga: 'bangga', gembira: 'gembira', tenang: 'tenang', risau: 'risau', tegas: 'tegas', kecewa: 'kecewa' };
function svgMuka(st) {
  const kening = {
    bangga: 'M17 21 q5 -3 9 0 M32 21 q5 -3 9 0', gembira: 'M18 21 h8 M32 21 h8', tenang: 'M18 22 h8 M32 22 h8',
    risau: 'M18 22 l8 -3 M40 22 l-8 -3', tegas: 'M18 19 l8 3 M40 19 l-8 3', kecewa: 'M18 21 l8 -2 M40 21 l-8 -2'
  }[st];
  const mata = st === 'bangga' ? '<path class="muka" d="M19 28 q3 -3 6 0 M33 28 q3 -3 6 0"/>' : '<circle class="mata" cx="22" cy="28" r="2.2"/><circle class="mata" cx="36" cy="28" r="2.2"/>';
  const mulut = {
    bangga: 'M20 37 q9 9 18 0', gembira: 'M21 38 q8 6 16 0', tenang: 'M23 39 q6 2 12 0',
    risau: 'M22 40 q3.5 -3 7 0 q3.5 3 7 0', tegas: 'M22 39 h14', kecewa: 'M21 42 q8 -6 16 0'
  }[st];
  return `<svg viewBox="0 0 58 58" aria-hidden="true"><circle class="muka" cx="29" cy="29" r="26"/><path class="muka" d="${kening}"/>${mata}<path class="muka" d="${mulut}"/></svg>`;
}
function htmlMurabbi() {
  const st = keadaanMurabbi();
  return `<div class="kad murabbi ${st}">${svgMuka(st)}<div><div class="nama">Murabbi</div><div class="kata">${esc(kataMurabbi(st))}</div><div class="rasa">rasa: ${LABEL_RASA[st]}</div></div></div>`;
}

/* ---------- UI asas ---------- */
let tab = 'hari';
let toastT;
function toast(msg, merah = false) {
  const el = $('#toast'); el.textContent = msg; el.className = 'toast' + (merah ? ' merah' : ''); el.hidden = false;
  clearTimeout(toastT); toastT = setTimeout(() => el.hidden = true, 3800);
}
function bunyi(jenis = 'tamat') {
  try {
    const C = window.AudioContext || window.webkitAudioContext; if (!C) return;
    const c = bunyi.c || (bunyi.c = new C()); const t = c.currentTime;
    const nada = jenis === 'tamat' ? [660, 880, 660] : [520, 520];
    nada.forEach((f, i) => { const o = c.createOscillator(), g = c.createGain(); o.frequency.value = f; o.type = 'sine'; g.gain.setValueAtTime(0.0001, t + i * .22); g.gain.exponentialRampToValueAtTime(.25, t + i * .22 + .02); g.gain.exponentialRampToValueAtTime(.0001, t + i * .22 + .2); o.connect(g).connect(c.destination); o.start(t + i * .22); o.stop(t + i * .22 + .22); });
  } catch (e) {}
  try { navigator.vibrate && navigator.vibrate([200, 100, 200]); } catch (e) {}
}
async function maklum(tajuk, badan) {
  try {
    if (!('Notification' in window) || Notification.permission !== 'granted' || !document.hidden) return;
    const reg = navigator.serviceWorker && await navigator.serviceWorker.getRegistration();
    if (reg) reg.showNotification(tajuk, { body: badan, icon: 'icons/icon-192.png', tag: 'tuntas' }); else new Notification(tajuk, { body: badan });
  } catch (e) {}
}
function bukaDialog(html) { const d = $('#dlg'); d.firstElementChild.innerHTML = html; d.hidden = false; const f = d.querySelector('textarea,input,button'); f && f.focus(); }
function tutupDialog() { $('#dlg').hidden = true; $('#dlg').firstElementChild.innerHTML = ''; }

function renderKepala() {
  const k = hariIni();
  $('#tarikh').textContent = labelTarikh(k).toUpperCase();
  const st = streak(), ix = indeks(), hutang = hutangTertunggak().length;
  $('#cip').innerHTML = `<span class="cip" title="Hari lulus berturut-turut">streak <b>${st}</b></span><span class="cip${ix !== null && ix < 60 ? ' merah' : ''}" title="Indeks disiplin 14 hari">indeks <b>${ix ?? '—'}</b></span>${hutang ? `<span class="cip merah">hutang <b>${hutang}</b></span>` : ''}`;
}
function render() {
  gulung();
  renderKepala();
  document.querySelectorAll('#tab button').forEach(b => b.classList.toggle('on', b.dataset.tab === tab));
  const p = $('#paparan');
  p.innerHTML = ({ hari: vHari, minimalis: vMinimalis, rekod: vRekod, tetapan: vTetapan }[tab])();
  renderFokus();
  if (!storanOk) toast('Storan peranti tidak tersedia. Data tidak akan kekal.', true);
}

/* ---------- Paparan: Hari Ini ---------- */
function htmlKelas(kelas) { const K = KELAS[kelas]; return `<span class="kelas-tag ${kelas}"><i>${K.nama}</i>${K.model}</span>`; }
function htmlAyatHari() {
  const a = PERINGATAN[Math.floor(tarikhDari(hariIni()).getTime() / 864e5) % PERINGATAN.length];
  return `<div class="kad ayat">${a.ar ? `<div class="ar" lang="ar">${a.ar}</div>` : ''}<div class="ms">${esc(a.ms)}</div><div class="rj">${esc(a.rj)}</div></div>`;
}
function vHari() {
  const k = hariIni(), d = S.hari[k], r = keputusan(k);
  let h = htmlMurabbi();
  if (r === 'rehat-kini' && !(S.draf && S.draf.paksa)) {
    h += `<div class="kad"><h2>Hari rehat</h2><p style="margin-top:8px">Tiada ikrar diperlukan hari ini. Streak tidak terjejas. Rehat dengan niat: keluarga, ibadah, tubuh.</p><div class="butang-baris" style="margin-top:14px"><button class="btn garis" data-act="kerjaRehat">Aku tetap mahu bekerja hari ini</button></div></div>`;
    h += vKebiasaanRingkas(k);
    return h + htmlAyatHari();
  }
  if (!d || !d.ikrar) return h + vIkrar() + htmlAyatHari();
  h += vPelan(k, d);
  h += vMuhasabah(k, d);
  return h + htmlAyatHari();
}

/* Ikrar pagi */
function draf() {
  const k = hariIni();
  if (!S.draf || S.draf.hari !== k) S.draf = { hari: k, emosi: '', tenaga: 0, pilih: {}, luar: [], hutang: {}, paksa: S.draf && S.draf.paksa };
  return S.draf;
}
function vIkrar() {
  const D = draf(), hutang = hutangTertunggak();
  const lewat = minitHari() > minitDari(S.tetapan.ikrarSebelum);
  const dipilih = Object.keys(D.pilih).length + D.luar.length;
  const bakiSlot = Math.max(0, 3 - hutang.length - dipilih);
  const beratAda = hutang.some(x => x.t.kelas === 'berat') || Object.values(D.pilih).some(p => p.kelas === 'berat') || D.luar.some(p => p.kelas === 'berat');
  let h = `<div class="bah"><h2>Ikrar pagi</h2><small>${lewat ? `<span style="color:var(--tegas)">lewat · had ${esc(S.tetapan.ikrarSebelum)}</span>` : `sebelum ${esc(S.tetapan.ikrarSebelum)}`}</small></div>`;
  h += `<div class="kad"><h3 style="font-size:15px">1 · Apa rasa kau pagi ini?</h3><p class="redup kecil">Perasaan diakui. Kerja tetap jalan.</p><div class="emosi-grid" style="margin-top:12px">${htmlEmosiGrid(D.emosi, 'drafEmosi')}</div>
    <label class="l">Tenaga <small>1 sangat rendah · 5 penuh</small></label><div class="tenaga">${[1, 2, 3, 4, 5].map(n => `<button data-act="drafTenaga" data-n="${n}" class="${D.tenaga === n ? 'on' : ''}">${n}</button>`).join('')}</div></div>`;
  h += `<div class="kad"><div class="baris jarak"><h3 style="font-size:15px">2 · Pilih tugasan hari ini</h3><span class="m kecil redup">${hutang.length + dipilih}/3</span></div>
    <ul class="peraturan"><li>Paling banyak 3. Minimalis: lebih sedikit, lebih siap.</li><li>Paling banyak 1 tugasan Berat.</li><li>Takrif siap mesti boleh dicapai hari ini. Bukan "buat sikit", tetapi "siapkan bahagian 2".</li></ul>`;
  if (hutang.length) {
    h += `<div class="kumpulan"><div class="kelas-tag" style="color:var(--tegas)">Hutang kerja · wajib dibawa</div>`;
    for (const { dari, t } of hutang) {
      const v = D.hutang[t.id] ?? t.takrif;
      h += `<div class="pilih-tugas"><input type="checkbox" checked disabled aria-label="Wajib"><div class="isi">${htmlKelas(t.kelas)} <span class="lencana merah">dari ${esc(labelTarikh(dari))}</span><div class="tj" style="margin-top:4px">${esc(t.tajuk)}</div>
        <label class="l">Takrif siap hari ini</label><input type="text" autocomplete="off" autocapitalize="sentences" enterkeyhint="done" data-f="hutangTakrif" data-id="${t.id}" value="${esc(v)}" maxlength="140"></div></div>`;
    }
    h += `</div>`;
  }
  for (const kelas of SUSUNAN_KELAS) {
    const senarai = S.pustaka.filter(p => p.kelas === kelas); if (!senarai.length) continue;
    h += `<div class="kumpulan"><div class="kelas-tag ${kelas}"><span><i>${KELAS[kelas].nama}</i> ${KELAS[kelas].model}</span><span>${blokMin(kelas)} min / blok</span></div>`;
    for (const p of senarai) {
      const on = !!D.pilih[p.id];
      const mati = !on && (bakiSlot === 0 || (kelas === 'berat' && beratAda));
      h += `<div class="pilih-tugas${mati ? ' mati' : ''}"><input type="checkbox" id="p_${p.id}" data-act="drafPilih" data-id="${p.id}" ${on ? 'checked' : ''} ${mati ? 'disabled' : ''}><div class="isi"><label class="tj" for="p_${p.id}">${esc(p.tajuk)}</label>`;
      if (on) h += htmlInputTakrif('pilih', p.id, D.pilih[p.id]);
      h += `</div></div>`;
    }
    h += `</div>`;
  }
  D.luar.forEach((p, i) => {
    h += `<div class="pilih-tugas"><input type="checkbox" checked data-act="drafBuangLuar" data-i="${i}" aria-label="Buang"><div class="isi">${htmlKelas(p.kelas)}<div class="tj" style="margin-top:4px">${esc(p.tajuk)}</div>${htmlInputTakrif('luar', i, p)}</div></div>`;
  });
  if (bakiSlot > 0) h += `<details style="margin-top:14px"><summary class="kecil" style="cursor:pointer">+ Tugasan luar senarai (sekali sahaja)</summary>
    <div class="baris" style="margin-top:10px"><input type="text" autocomplete="off" autocapitalize="sentences" enterkeyhint="done" id="luarTajuk" placeholder="Tajuk tugasan" maxlength="90"><select id="luarKelas" style="width:auto">${SUSUNAN_KELAS.map(c => `<option value="${c}" ${c === 'berat' && beratAda ? 'disabled' : ''}>${KELAS[c].nama}</option>`).join('')}</select></div>
    <button class="btn garis" style="margin-top:8px" data-act="drafTambahLuar">Tambah</button></details>`;
  h += `</div>`;
  const sah = semakIkrar();
  h += `<div class="kad"><h3 style="font-size:15px">3 · Kunci ikrar</h3><ul class="peraturan"><li>Selepas ikrar, pelan dikunci. Tiada tambah, tiada buang.</li><li>Tugasan dibuat ikut susunan: hutang, kemudian Berat → Harian → Ringan → Automasi.</li><li>Melepaskan tugasan menggagalkan hari ini dan memadam streak.</li><li>Yang tidak siap sebelum hari ditutup menjadi hutang esok.</li></ul>
    ${sah.ok ? '' : `<p class="kecil" style="color:var(--tegas);margin-top:12px">${esc(sah.sebab)}</p>`}
    <button class="btn besar penuh tahan" style="margin-top:14px" data-tahan="2500" data-act="ikrar" ${sah.ok ? '' : 'disabled'}>Tahan untuk berikrar</button></div>`;
  return h;
}
function htmlInputTakrif(jenis, id, p) {
  const n = (p.takrif || '').trim().length;
  return `<label class="l">Siap bermaksud <small>(min 10 aksara)</small></label><input type="text" autocomplete="off" autocapitalize="sentences" enterkeyhint="done" data-f="takrif" data-j="${jenis}" data-id="${id}" value="${esc(p.takrif || '')}" placeholder="cth. Draf bahagian 2 lengkap dengan 5 rujukan" maxlength="140"><div class="kira${n >= 10 ? ' ok' : ''}" data-kira="${jenis}${id}">${n}/10</div>
    <label class="l">Niat <small>(pilihan)</small></label><input type="text" autocomplete="off" autocapitalize="sentences" enterkeyhint="done" data-f="niat" data-j="${jenis}" data-id="${id}" value="${esc(p.niat || '')}" placeholder="Untuk siapa kerja ini?" maxlength="120">`;
}
function htmlEmosiGrid(pilih, act) {
  return Object.entries(EMOSI).map(([k, e]) => `<button class="emo ${e.nada}${pilih === k ? ' on' : ''}" data-act="${act}" data-e="${k}"><span aria-hidden="true">${e.ikon}</span>${e.label}</button>`).join('');
}
function semakIkrar() {
  const D = draf(), hutang = hutangTertunggak();
  const semua = [...hutang.map(x => ({ kelas: x.t.kelas, takrif: D.hutang[x.t.id] ?? x.t.takrif })), ...Object.values(D.pilih), ...D.luar];
  if (!D.emosi) return { ok: false, sebab: 'Pilih emosi pagi.' };
  if (!D.tenaga) return { ok: false, sebab: 'Pilih tahap tenaga.' };
  if (!semua.length) return { ok: false, sebab: 'Pilih sekurang-kurangnya satu tugasan.' };
  if (semua.length > Math.max(3, hutang.length)) return { ok: false, sebab: 'Lebih daripada 3 tugasan.' };
  if (semua.some(p => (p.takrif || '').trim().length < 10)) return { ok: false, sebab: 'Setiap tugasan perlukan takrif siap sekurang-kurangnya 10 aksara.' };
  return { ok: true };
}
function buatIkrar() {
  if (!semakIkrar().ok) return;
  const k = hariIni(), D = draf(), d = dapatHari(k, true);
  const hutang = hutangTertunggak();
  const baru = [];
  for (const { dari, t } of hutang) {
    t.dibawa = k;
    baru.push({ id: uid(), tajuk: t.tajuk, kelas: t.kelas, takrif: (D.hutang[t.id] ?? t.takrif).trim(), niat: t.niat || '', status: 'baru', hutangDari: dari, minit: 0, blok: 0 });
  }
  const lain = [];
  for (const [pid, p] of Object.entries(D.pilih)) lain.push({ id: uid(), pid, tajuk: p.tajuk, kelas: p.kelas, takrif: p.takrif.trim(), niat: (p.niat || '').trim(), status: 'baru', minit: 0, blok: 0 });
  for (const p of D.luar) lain.push({ id: uid(), tajuk: p.tajuk, kelas: p.kelas, takrif: p.takrif.trim(), niat: (p.niat || '').trim(), status: 'baru', luar: true, minit: 0, blok: 0 });
  lain.sort((a, b) => SUSUNAN_KELAS.indexOf(a.kelas) - SUSUNAN_KELAS.indexOf(b.kelas));
  d.tugas = [...baru, ...lain];
  d.ikrar = { pada: Date.now(), lewat: minitHari() > minitDari(S.tetapan.ikrarSebelum), emosi: D.emosi, tenaga: D.tenaga };
  S.draf = null; simpan();
  toast(d.ikrar.lewat ? 'Ikrar dikunci. Lewat dicatat.' : 'Ikrar dikunci. Mula yang pertama.', d.ikrar.lewat);
  render(); window.scrollTo(0, 0);
}

/* Pelan selepas ikrar */
function tugasSemasa(d) { return d.tugas.find(t => t.status === 'baru' || t.status === 'jalan'); }
function vPelan(k, d) {
  const siap = d.tugas.filter(t => t.status === 'siap').length, n = d.tugas.length, semasa = tugasSemasa(d);
  const minit = d.sesi.filter(s => s.sah).reduce((a, s) => a + s.minit, 0);
  let h = `<div class="bah"><h2>Ikrar hari ini</h2><small>${siap}/${n} siap · ${fmtMinit(minit)} fokus sah</small></div>`;
  h += `<div class="progres" style="margin:-4px 0 14px"><i style="width:${n ? siap / n * 100 : 0}%"></i></div>`;
  d.tugas.forEach((t, i) => {
    const kini = semasa && t.id === semasa.id && !d.muhasabah;
    const kunci = (t.status === 'baru' || t.status === 'jalan') && !kini;
    const cls = kini ? 'semasa' : kunci ? 'kunci' : t.status;
    h += `<div class="tugas ${cls}"><span class="nombor">${i + 1}</span>${htmlKelas(t.kelas)}${t.hutangDari ? ' <span class="lencana merah">hutang</span>' : ''}${t.bonus ? ' <span class="lencana">bonus</span>' : ''}
      <h3>${esc(t.tajuk)}</h3><div class="takrif"><b>Siap bermaksud:</b> ${esc(t.takrif)}</div>${t.niat ? `<div class="takrif redup" style="margin-top:2px">Niat: ${esc(t.niat)}</div>` : ''}
      <div class="meta"><span>${t.blok} blok</span><span>${fmtMinit(t.minit)} sah</span>${t.status === 'siap' ? `<span>siap ${jam(t.siapPada)}</span>` : ''}${t.status === 'lepas' ? '<span style="color:var(--tegas)">dilepaskan</span>' : ''}${t.status === 'hutang' ? '<span style="color:var(--tegas)">jadi hutang</span>' : ''}</div>`;
    if (t.status === 'siap' && t.output) h += `<div class="takrif" style="margin-top:8px">✓ ${esc(t.output)}</div>`;
    if (t.status === 'lepas') h += `<div class="takrif" style="margin-top:8px;color:var(--tegas)">Sebab: ${esc(t.sebab)}</div>`;
    if (kini) h += `<div class="tindak"><button class="btn" data-act="mulaFokus" data-id="${t.id}">${t.status === 'jalan' ? 'Sambung fokus' : 'Mula fokus'} · ${blokMin(t.kelas)} min</button><button class="btn teks merah" data-act="lepas" data-id="${t.id}">Lepaskan</button></div>`;
    else if (kunci) h += `<div class="meta">Terkunci. Siapkan tugasan di atas dahulu.</div>`;
    h += `</div>`;
  });
  if (!semasa && !d.muhasabah) {
    const baki = 2 - (d.bonus || 0);
    h += `<div class="kad tipis"><p><b>Semua ikrar ditunaikan.</b> ${baki > 0 ? 'Kau boleh tambah satu tugasan bonus. Ia juga terikat: mesti siap.' : 'Had bonus dicapai. Cukup untuk hari ini.'}</p>${baki > 0 ? `<button class="btn garis" style="margin-top:10px" data-act="bonus">+ Tugasan bonus</button>` : ''}</div>`;
  }
  return h;
}

/* Muhasabah */
function vMuhasabah(k, d) {
  let h = `<div class="bah"><h2>Muhasabah</h2><small>${d.muhasabah ? 'hari ditutup' : `dibuka ${esc(S.tetapan.muhasabahDari)}`}</small></div>`;
  if (d.muhasabah) {
    const m = d.muhasabah, r = keputusan(k);
    const lbl = { lulus: 'LULUS', separa: 'SEPARA', gagal: 'GAGAL' }[r] || r.toUpperCase();
    h += `<div class="kad"><div class="baris jarak"><b>Keputusan</b><span class="lencana ${r === 'lulus' ? 'hijau' : r === 'gagal' ? 'merah' : ''}">${lbl}</span></div>
      <ul class="senarai" style="margin-top:10px"><li><span class="redup">Emosi:</span> ${m.emosi.map(e => EMOSI[e].label).join(', ')} · skor diri ${m.skor}/10</li><li><span class="redup">Menang:</span> ${esc(m.menang)}</li><li><span class="redup">Penghalang:</span> ${esc(m.halang)}</li><li><span class="redup">Syukur:</span> ${esc(m.syukur)}</li><li><span class="redup">Pengajaran:</span> ${esc(m.ajar)}</li><li><span class="redup">Langkah pertama esok:</span> ${esc(m.esok)}</li></ul>
      ${r === 'separa' ? `<p class="kecil redup" style="margin-top:8px">Separa: ${d.ikrar.lewat ? 'ikrar lewat' : ''}${d.ikrar.lewat && nisbahKebiasaan(d) < .6 ? ' dan ' : ''}${nisbahKebiasaan(d) < .6 ? 'kebiasaan minimalis kurang 60%' : ''}. Streak tidak bertambah.</p>` : ''}</div>`;
    return h;
  }
  const semua = d.tugas.every(t => t.status === 'siap' || t.status === 'lepas');
  const buka = semua || minitHari() >= minitDari(S.tetapan.muhasabahDari);
  if (!buka) return h + `<div class="kad tipis"><p class="redup">Muhasabah dibuka pada ${esc(S.tetapan.muhasabahDari)} atau selepas semua ikrar selesai. Tanpa muhasabah, hari dikira gagal.</p></div>`;
  const M = S.draf && S.draf.m ? S.draf.m : {};
  const fik = S.fikiran.filter(f => !f.selesai);
  const belum = d.tugas.filter(t => t.status === 'baru' || t.status === 'jalan').length;
  const medan = (id, label, min, ph) => `<label class="l" for="m_${id}">${label} <small>(min ${min})</small></label><textarea autocapitalize="sentences" id="m_${id}" data-f="m" data-id="${id}" data-min="${min}" placeholder="${ph}" rows="2">${esc(M[id] || '')}</textarea><div class="kira${(M[id] || '').trim().length >= min ? ' ok' : ''}" data-kira="m${id}">${(M[id] || '').trim().length}/${min}</div>`;
  h += `<div class="kad">${belum ? `<div class="kad tipis amaran" style="margin-bottom:12px"><p class="kecil"><b>${belum} tugasan belum siap.</b> Menutup hari sekarang menjadikannya hutang esok dan hari ini GAGAL.</p></div>` : ''}
    <label class="l">Emosi sepanjang hari <small>(pilih semua yang benar)</small></label><div class="emosi-grid">${Object.entries(EMOSI).map(([e, x]) => `<button class="emo ${x.nada}${(M.emosi || []).includes(e) ? ' on' : ''}" data-act="mEmosi" data-e="${e}"><span aria-hidden="true">${x.ikon}</span>${x.label}</button>`).join('')}</div>
    <label class="l" for="m_skor">Skor diri hari ini: <b class="m" id="skorTeks">${M.skor || 5}</b>/10</label><input id="m_skor" type="range" min="1" max="10" value="${M.skor || 5}" data-f="m" data-id="skor" style="width:100%;accent-color:var(--ink)">
    ${medan('menang', 'Apa yang menang hari ini?', 10, 'Siapkan bab 2 walaupun malas')}
    ${medan('halang', 'Apa yang menghalang?', 10, 'Telefon di atas meja')}
    ${medan('syukur', 'Satu syukur', 5, '')}
    ${medan('ajar', 'Satu pengajaran', 10, '')}
    ${medan('esok', 'Langkah pertama esok', 5, 'Buka draf kertas kerja BRI, semak bahagian 3')}
    ${fik.length ? `<label class="l">Peti fikiran <small>(tandakan yang sudah diurus)</small></label>${fik.map(f => `<label class="semak"><input type="checkbox" data-act="fikiranSelesai" data-id="${f.id}"><div><div class="tj">${esc(f.teks)}</div><div class="ds">${esc(labelTarikh(kunciHari(f.pada)))} ${jam(f.pada)}</div></div></label>`).join('')}` : ''}
    <button class="btn besar penuh tahan${belum ? ' merah' : ''}" style="margin-top:16px" data-tahan="2000" data-act="tutupHari">Tahan untuk tutup hari</button></div>`;
  return h;
}
function semakMuhasabah() {
  const M = (S.draf && S.draf.m) || {};
  if (!(M.emosi || []).length) return 'Pilih sekurang-kurangnya satu emosi.';
  for (const [id, min] of [['menang', 10], ['halang', 10], ['syukur', 5], ['ajar', 10], ['esok', 5]]) if ((M[id] || '').trim().length < min) return 'Lengkapkan semua ruangan muhasabah.';
  return '';
}
function tutupHari() {
  const salah = semakMuhasabah(); if (salah) return toast(salah, true);
  const k = hariIni(), d = S.hari[k], M = S.draf.m;
  for (const t of d.tugas) if (t.status === 'baru' || t.status === 'jalan') t.status = 'hutang';
  d.muhasabah = { pada: Date.now(), emosi: M.emosi, skor: Number(M.skor || 5), menang: M.menang.trim(), halang: M.halang.trim(), syukur: M.syukur.trim(), ajar: M.ajar.trim(), esok: M.esok.trim() };
  d.tutup = true; S.draf = null; simpan();
  const r = keputusan(k);
  toast(r === 'lulus' ? 'Hari LULUS. Alhamdulillah. Tidur awal.' : r === 'separa' ? 'Hari SEPARA. Siap, tetapi belum sempurna.' : 'Hari GAGAL. Esok bayar hutang dahulu.', r === 'gagal');
  render(); window.scrollTo(0, 0);
}

/* ---------- Mod fokus ---------- */
function cariTugas(id) { for (const [k, d] of Object.entries(S.hari)) { const t = d.tugas.find(x => x.id === id); if (t) return { k, d, t }; } return {}; }
function mulaFokus(id) {
  const k = hariIni(), d = S.hari[k], semasa = d && tugasSemasa(d);
  if (!semasa || semasa.id !== id) return toast('Ikut susunan. Siapkan tugasan semasa dahulu.', true);
  S.aktif = { hari: k, tid: id, fasa: 'emosi', blokKe: semasa.blok + 1, ganggu: 0, keluarMs: 0, jedaMs: 0, jedaPendek: false, solat: 0, denyut: Date.now() };
  simpan(); render(); mintaKunciSkrin();
}
let kunciSkrin = null;
async function mintaKunciSkrin() { try { if ('wakeLock' in navigator && !kunciSkrin) { kunciSkrin = await navigator.wakeLock.request('screen'); kunciSkrin.addEventListener('release', () => kunciSkrin = null); } } catch (e) {} }
function lepasKunciSkrin() { try { kunciSkrin && kunciSkrin.release(); } catch (e) {} kunciSkrin = null; }

function pilihEmosiSebelum(e) {
  const a = S.aktif; a.emosi = e;
  const iv = EMOSI[e].iv;
  if (iv) { a.fasa = 'iv'; a.iv = iv; a.ivBaki = INTERVENSI[iv].saat || 0; a.ivTeks = ''; }
  else mulaBlok();
  simpan(); renderFokus();
}
function mulaBlok() {
  const a = S.aktif, { t } = cariTugas(a.tid);
  a.fasa = 'fokus'; a.mula = Date.now(); a.jedaMs = 0; a.jeda = null; a.jedaPendek = false; a.ganggu = 0; a.keluarMs = 0; a.keluarPada = null; a.denyut = Date.now();
  a.panjang = blokMin(t.kelas) * 60000;
  t.status = 'jalan';
  simpan(); mintaKunciSkrin();
}
function msFokus(a, kini = Date.now()) {
  let jeda = a.jedaMs + (a.jeda ? kini - a.jeda.pada : 0);
  return Math.min(a.panjang, Math.max(0, kini - a.mula - jeda));
}
function rekodSesi(d, hasil) {
  const a = S.aktif; if (!a || a.fasa !== 'fokus' && a.fasa !== 'tamat' && a.fasa !== 'siap') return;
  if (a.direkod) return;
  const { t } = cariTugas(a.tid); if (!t) return;
  const minit = Math.round(msFokus(a, a.tamatPada || Date.now()) / 60000);
  const sah = a.ganggu <= HAD_GANGGU && minit >= 5;
  d.sesi.push({ tid: t.id, tajuk: t.tajuk, kelas: t.kelas, mula: a.mula, tamat: a.tamatPada || Date.now(), minit, sah, ganggu: a.ganggu, keluarMs: a.keluarMs, emosi: a.emosi, emosiSelepas: a.emosiSelepas || '', iv: a.iv || '', catatan: a.ivTeks || '', solat: a.solat, hasil });
  t.blok += 1; if (sah) t.minit += minit;
  a.direkod = true;
}
function tamatBlok() {
  const a = S.aktif; if (!a || a.fasa !== 'fokus') return;
  if (a.jeda) { a.jedaMs += Date.now() - a.jeda.pada; a.jeda = null; }
  if (a.keluarPada) { a.ganggu += 1; a.keluarMs += Date.now() - a.keluarPada; a.keluarPada = null; }
  a.fasa = 'tamat'; a.tamatPada = Date.now(); dorongan = null;
  simpan(); bunyi('tamat'); maklum('Blok tamat', 'Adakah tugasan siap ikut takrif?'); renderFokus();
}
function jawabTamat(siap) {
  const a = S.aktif;
  if (!a.emosiSelepas) return toast('Pilih rasa selepas blok dahulu.', true);
  const { d, t } = cariTugas(a.tid);
  if (siap) { a.fasa = 'siap'; simpan(); return renderFokus(); }
  rekodSesi(d, 'belum');
  S.aktif = { hari: a.hari, tid: a.tid, fasa: 'rehat', rehatTamat: Date.now() + rehatMin(t.kelas) * 60000, blokKe: t.blok + 1, ganggu: 0, keluarMs: 0, jedaMs: 0, solat: 0, denyut: Date.now() };
  simpan(); renderFokus();
}
function sahkanSiap() {
  const a = S.aktif, el = $('#bukti'), sah = $('#sahTakrif');
  const teks = (el && el.value || '').trim();
  if (teks.length < 15) return toast('Bukti siap terlalu pendek. Tulis apa yang benar-benar siap.', true);
  if (!sah || !sah.checked) return toast('Sahkan bahawa ia siap ikut takrif.', true);
  const { d, t } = cariTugas(a.tid);
  if (a.mula && !a.direkod) { if (!a.tamatPada) a.tamatPada = Date.now(); rekodSesi(d, 'siap'); }
  t.status = 'siap'; t.output = teks; t.siapPada = Date.now();
  S.aktif = null; simpan(); lepasKunciSkrin();
  const baki = d.tugas.filter(x => x.status === 'baru' || x.status === 'jalan').length;
  toast(baki ? `Siap. ${baki} lagi. Fa idhā faraghta fanṣab.` : 'Semua ikrar ditunaikan. Tutup hari dengan muhasabah.');
  render();
}
function siapAwal() {
  const a = S.aktif; if (a.fasa !== 'fokus') return;
  if (a.jeda) { a.jedaMs += Date.now() - a.jeda.pada; a.jeda = null; }
  a.tamatPada = Date.now(); a.fasa = 'siap'; simpan(); renderFokus();
}
function jeda(jenis) {
  const a = S.aktif; if (a.fasa !== 'fokus' || a.jeda) return;
  if (jenis === 'pendek') { if (a.jedaPendek) return toast('Jeda pendek sudah digunakan untuk blok ini.', true); a.jedaPendek = true; }
  else a.solat += 1;
  a.jeda = { jenis, pada: Date.now(), had: jenis === 'pendek' ? JEDA_PENDEK : JEDA_SOLAT };
  simpan(); renderFokus();
}
function sambungJeda() {
  const a = S.aktif; if (!a.jeda) return;
  a.jedaMs += Math.min(Date.now() - a.jeda.pada, a.jeda.had); a.jeda = null; simpan(); renderFokus();
}
function sambungRehat() { const a = S.aktif; a.fasa = 'emosi'; a.emosi = ''; a.emosiSelepas = ''; a.iv = null; simpan(); renderFokus(); }

function catatGanggu(ms, sebab) {
  const a = S.aktif; if (!a || a.fasa !== 'fokus' || a.jeda) return;
  a.ganggu += 1; a.keluarMs += ms; simpan();
  const lebih = a.ganggu > HAD_GANGGU;
  toast(`${sebab} ${jamMinit(ms)}. Gangguan ${a.ganggu}/${HAD_GANGGU}.${lebih ? ' Blok ini tidak sah.' : ''}`, true);
  renderFokus(); renderKepala();
}

/* Dorongan (urge surfing) */
let dorongan = null;
function bukaDorongan() {
  dorongan = { jenis: '', baki: MASA_DORONGAN };
  renderFokus();
}
function tamatDorongan(menang) {
  const a = S.aktif, d = S.hari[a.hari];
  d.dorongan.push({ pada: Date.now(), jenis: dorongan.jenis, menang });
  dorongan = null; simpan();
  if (!menang) { a.ganggu += 1; toast(`Dicatat sebagai gangguan ${a.ganggu}/${HAD_GANGGU}. Kembali sekarang.`, true); }
  else toast('Dorongan ditewaskan. Ia akan datang lagi, dan kau akan menang lagi.');
  simpan(); renderFokus();
}

function renderFokus() {
  const el = $('#fokus'), a = S.aktif;
  const terkunci = !!a;
  el.hidden = !terkunci; $('#tab').hidden = terkunci; $('#app').inert = terkunci;
  document.body.style.overflow = terkunci ? 'hidden' : '';
  if (!a) { el.innerHTML = ''; return; }
  const { t } = cariTugas(a.tid);
  if (!t) { S.aktif = null; simpan(); return renderFokus(); }
  const atas = `<div class="atas"><span class="kunci-ikon">● Mod fokus · app dikunci</span><span>blok ${a.blokKe}</span></div><div style="margin-top:14px">${htmlKelas(t.kelas)}</div><h1>${esc(t.tajuk)}</h1><div class="takrif kecil"><b>Siap bermaksud:</b> ${esc(t.takrif)}</div>`;
  let h = '';
  if (dorongan && a.fasa === 'fokus') {
    if (!dorongan.jenis) h = `<h2 style="margin-top:28px">Dorongan apa yang datang?</h2><div class="emosi-grid" style="margin-top:12px;grid-template-columns:repeat(2,1fr)">${DORONGAN.map(x => `<button class="emo" data-act="dorJenis" data-j="${esc(x)}">${esc(x)}</button>`).join('')}</div><button class="btn teks" style="margin-top:12px" data-act="dorBatal">Batal</button>`;
    else h = `<h2 style="margin-top:28px">Tunggang ombak · ${esc(dorongan.jenis)}</h2><div class="ombak" aria-hidden="true"></div><p style="text-align:center">Dorongan memuncak dan surut dalam kira-kira 90 saat. Perhati. Bernafas. Jangan ikut.</p><p class="m" style="text-align:center;font-size:28px;margin-top:10px" id="dorBaki">${dorongan.baki}s</p>
      <div class="butang-baris" style="margin-top:14px;justify-content:center"><button class="btn" id="dorMenang" data-act="dorMenang" ${dorongan.baki > 0 ? 'disabled' : ''}>Aku menang. Kembali kerja</button><button class="btn garis merah" style="color:var(--tegas)" data-act="dorKalah">Aku kalah</button></div>`;
    el.innerHTML = `<div class="fokus-dalam">${atas}${h}</div>`; return;
  }
  if (a.fasa === 'emosi') {
    h = `<h2 style="margin-top:28px">Sebelum mula: apa rasa kau sekarang?</h2><p class="redup kecil" style="margin-top:4px">Emosi negatif membuka satu langkah wajib. Ia tidak boleh dilangkau.</p><div class="emosi-grid" style="margin-top:12px">${htmlEmosiGrid('', 'emosiSebelum')}</div>
      <div style="margin-top:auto;padding-top:24px">${htmlKeluarFokus(t, false)}</div>`;
  } else if (a.fasa === 'iv') {
    const I = INTERVENSI[a.iv];
    h = `<h2 style="margin-top:28px">${esc(EMOSI[a.emosi].label)} · ${esc(I.tajuk)}</h2><p style="margin-top:8px">${esc(I.arahan)}</p>`;
    if (I.jenis === 'masa') h += `<div class="nafas" aria-hidden="true">${a.iv === 'nafas' ? 'nafas' : ''}</div><p class="m" style="text-align:center;font-size:30px" id="ivBaki">${a.ivBaki}s</p><p class="redup kecil" style="text-align:center">Kiraan berhenti jika kau keluar dari app.</p>`;
    else h += `<label class="l" for="ivTeks">${esc(I.soalan)}</label><textarea autocapitalize="sentences" id="ivTeks" data-f="ivTeks" placeholder="${esc(I.contoh)}">${esc(a.ivTeks || '')}</textarea>${t.niat && a.iv === 'makna' ? `<p class="kecil redup" style="margin-top:6px">Niat pagi tadi: ${esc(t.niat)}</p>` : ''}`;
    const boleh = I.jenis === 'masa' ? a.ivBaki <= 0 : (a.ivTeks || '').trim().length >= 8;
    h += `<button class="btn besar penuh" id="ivMula" style="margin-top:18px" data-act="ivMula" ${boleh ? '' : 'disabled'}>Mula blok ${blokMin(t.kelas)} minit</button>`;
  } else if (a.fasa === 'fokus') {
    const g = a.ganggu, lebih = g > HAD_GANGGU;
    h = `<div class="jam-wrap${a.jeda ? ' jeda' : ''}" id="jamWrap"><svg viewBox="0 0 100 100"><circle class="lat" cx="50" cy="50" r="46"/><circle class="maju" id="cincin" cx="50" cy="50" r="46" stroke-dasharray="289.03" stroke-dashoffset="289.03"/></svg><div class="jam-teks"><b id="jam">--:--</b><small id="jamSub">${a.jeda ? (a.jeda.jenis === 'solat' ? 'jeda solat' : 'jeda pendek') : 'fokus'}</small></div></div>
      <div class="ganggu"><span class="${g ? 'merah' : ''}">gangguan <b>${g}/${HAD_GANGGU}</b></span><span>${lebih ? '<b style="color:var(--tegas)">blok tidak sah</b>' : 'blok sah'}</span><span>emosi <b>${esc(EMOSI[a.emosi] ? EMOSI[a.emosi].label : '—')}</b></span></div>`;
    if (a.jeda) h += `<button class="btn besar penuh" data-act="sambungJeda">Sambung fokus</button>`;
    else h += `<div class="butang-baris" style="justify-content:center"><button class="btn garis" data-act="dorongan">Tergoda?</button><button class="btn garis" data-act="jedaPendek" ${a.jedaPendek ? 'disabled' : ''}>Jeda 3 min</button><button class="btn garis" data-act="jedaSolat">Jeda solat</button></div>
      <div class="fikiran"><input type="text" autocomplete="off" autocapitalize="sentences" enterkeyhint="done" id="fikiranTeks" placeholder="Fikiran mengganggu? Tulis, simpan, sambung." maxlength="140"><button class="btn garis" data-act="simpanFikiran">Simpan</button></div>
      <div style="margin-top:auto;padding-top:24px"><button class="btn penuh" data-act="siapAwal">Sudah siap ikut takrif</button>${htmlKeluarFokus(t, true)}</div>`;
  } else if (a.fasa === 'tamat') {
    h = `<h2 style="margin-top:28px">Blok tamat</h2><p style="margin-top:6px">Rasa selepas blok ini?</p><div class="emosi-grid" style="margin-top:12px">${htmlEmosiGrid(a.emosiSelepas, 'emosiSelepas')}</div>
      <div class="kad" style="margin-top:16px"><p><b>Adakah ia SIAP ikut takrif?</b></p><p class="kecil redup" style="margin-top:4px">${esc(t.takrif)}</p><div class="butang-baris" style="margin-top:12px"><button class="btn" data-act="tamatYa">Ya, siap</button><button class="btn garis" data-act="tamatBelum">Belum. Rehat ${rehatMin(t.kelas)} min, sambung</button></div></div>`;
  } else if (a.fasa === 'rehat') {
    h = `<div class="jam-wrap rehat" id="jamWrap"><svg viewBox="0 0 100 100"><circle class="lat" cx="50" cy="50" r="46"/><circle class="maju" id="cincin" cx="50" cy="50" r="46" stroke-dasharray="289.03" stroke-dashoffset="0"/></svg><div class="jam-teks"><b id="jam">--:--</b><small>rehat</small></div></div>
      <p style="text-align:center">Rehat sebenar: berdiri, minum, pandang jauh. Jangan buka kerja lain. Jangan buka media sosial.</p><p class="redup kecil" style="text-align:center;margin-top:6px">Tugasan ini belum siap. Fokus sampai siap.</p>
      <button class="btn besar penuh" style="margin-top:18px" data-act="sambungRehat" id="btnSambungRehat">Sambung blok seterusnya</button><div style="margin-top:12px">${htmlKeluarFokus(t, false)}</div>`;
  } else if (a.fasa === 'siap') {
    h = `<h2 style="margin-top:28px">Bukti siap</h2><p class="kecil redup" style="margin-top:4px">Siap tanpa bukti hanyalah perasaan. Tulis apa yang benar-benar siap: fail, bilangan, pautan.</p>
      <textarea autocapitalize="sentences" id="bukti" style="margin-top:12px" rows="3" placeholder="cth. Draf bab 2 (2,400 patah perkataan) disimpan di Drive, 6 rujukan Shamela"></textarea>
      <label class="semak" style="border:0"><input type="checkbox" id="sahTakrif"><div><div class="tj">Aku sahkan ia siap ikut takrif</div><div class="ds">${esc(t.takrif)}</div></div></label>
      <button class="btn besar penuh tahan" data-tahan="1500" data-act="sahkanSiap">Tahan untuk sahkan siap</button>
      <button class="btn teks" style="margin-top:10px" data-act="belumSiap">Sebenarnya belum siap</button>`;
  }
  el.innerHTML = `<div class="fokus-dalam">${atas}${h}</div>`;
  detikFokus();
}
function htmlKeluarFokus(t, dalamBlok) {
  const d = S.hari[S.aktif.hari], baki = HAD_TANGGUH - (d.tangguh || 0);
  return `<div class="butang-baris" style="justify-content:center;margin-top:10px"><button class="btn teks" data-act="tangguh" ${baki <= 0 ? 'disabled' : ''}>Tangguh (${baki} lagi hari ini)</button><button class="btn teks merah" data-act="lepas" data-id="${t.id}">Lepaskan tugasan</button></div>`;
}
function detikFokus() {
  const a = S.aktif; if (!a) return;
  const kini = Date.now();
  if (a.fasa === 'fokus') {
    if (a.jeda && kini - a.jeda.pada >= a.jeda.had) {
      a.jedaMs += a.jeda.had; a.jeda = null; simpan(); bunyi('rehat');
      if (document.hidden) a.keluarPada = kini;
      toast('Jeda tamat. Fokus semula.'); return renderFokus();
    }
    const f = msFokus(a, kini);
    if (f >= a.panjang) return tamatBlok();
    const jamEl = $('#jam'), c = $('#cincin');
    if (a.jeda) { jamEl && (jamEl.textContent = jamMinit(a.jeda.had - (kini - a.jeda.pada))); }
    else jamEl && (jamEl.textContent = jamMinit(a.panjang - f));
    c && c.setAttribute('stroke-dashoffset', String(289.03 * (1 - f / a.panjang)));
  } else if (a.fasa === 'rehat') {
    const baki = a.rehatTamat - kini, { t } = cariTugas(a.tid);
    const jamEl = $('#jam'), c = $('#cincin');
    jamEl && (jamEl.textContent = jamMinit(baki));
    c && c.setAttribute('stroke-dashoffset', String(289.03 * (1 - Math.max(0, baki) / (rehatMin(t.kelas) * 60000))));
    if (baki <= 0 && !a.rehatBunyi) { a.rehatBunyi = true; simpan(); bunyi('rehat'); maklum('Rehat tamat', 'Kembali ke blok seterusnya.'); }
  } else if (a.fasa === 'iv' && INTERVENSI[a.iv].jenis === 'masa' && !document.hidden) {
    if (a.ivBaki > 0) { a.ivBaki -= 1; simpan(); }
    const b = $('#ivBaki'); b && (b.textContent = a.ivBaki + 's');
    const m = $('#ivMula'); m && (m.disabled = a.ivBaki > 0);
  }
  if (dorongan && dorongan.jenis && dorongan.baki > 0 && !document.hidden) {
    dorongan.baki -= 1; const b = $('#dorBaki'); b && (b.textContent = dorongan.baki + 's');
    const m = $('#dorMenang'); m && (m.disabled = dorongan.baki > 0);
  }
}

/* Lepaskan & tangguh */
function dialogLepas(id) {
  const { t } = cariTugas(id); if (!t) return;
  bukaDialog(`<h2>Lepaskan tugasan?</h2><p class="kecil">${esc(t.tajuk)}</p>
    <div class="kad tipis amaran" style="margin-top:12px"><ul class="peraturan" style="margin:0"><li>Hari ini menjadi GAGAL.</li><li>Streak kembali kepada 0.</li><li>Tugasan masuk Kubur Tugasan bersama sebab kau, untuk dibaca semula.</li></ul></div>
    <label class="l" for="sebabLepas">Sebab sebenar <small>(min 30 aksara, jujur)</small></label><textarea autocapitalize="sentences" id="sebabLepas" data-f="sebabLepas" rows="3" placeholder="Bukan 'tiada masa'. Apa sebenarnya?"></textarea><div class="kira" data-kira="sebabLepas">0/30</div>
    <div class="butang-baris" style="margin-top:14px"><button class="btn garis" data-act="tutupDialog">Kembali kerja</button><button class="btn merah tahan" data-tahan="5000" data-act="sahLepas" data-id="${id}" id="btnLepas" disabled>Tahan 5 saat untuk lepaskan</button></div>`);
}
function sahLepas(id) {
  const sebab = ($('#sebabLepas').value || '').trim(); if (sebab.length < 30) return;
  const { d, t } = cariTugas(id);
  if (S.aktif && S.aktif.tid === id) { if (S.aktif.fasa === 'fokus') rekodSesi(d, 'lepas'); S.aktif = null; lepasKunciSkrin(); }
  t.status = 'lepas'; t.sebab = sebab; t.lepasPada = Date.now();
  simpan(); tutupDialog(); toast('Dilepaskan. Dicatat dalam Kubur Tugasan.', true); render();
}
function dialogTangguh() {
  bukaDialog(`<h2>Tangguh sesi?</h2><p class="kecil">App dibuka semula, tetapi tugasan ini kekal sebagai tugasan semasa. Tiada tugasan lain boleh dimulakan sebelum ia siap. Had ${HAD_TANGGUH} kali sehari.</p>
    <label class="l" for="sebabTangguh">Sebab</label><select id="sebabTangguh"><option>Urusan keluarga</option><option>Makan</option><option>Mesyuarat / kelas / kuliah</option><option>Perjalanan</option><option>Kecemasan</option></select>
    <div class="butang-baris" style="margin-top:14px"><button class="btn garis" data-act="tutupDialog">Kembali kerja</button><button class="btn tahan" data-tahan="1500" data-act="sahTangguh">Tahan untuk tangguh</button></div>`);
}
function sahTangguh() {
  const a = S.aktif, d = S.hari[a.hari], { t } = cariTugas(a.tid);
  if ((d.tangguh || 0) >= HAD_TANGGUH) return;
  if (a.fasa === 'fokus') { if (a.jeda) { a.jedaMs += Math.min(Date.now() - a.jeda.pada, a.jeda.had); a.jeda = null; } a.tamatPada = Date.now(); rekodSesi(d, 'tangguh'); }
  d.tangguh = (d.tangguh || 0) + 1;
  (d.log = d.log || []).push({ pada: Date.now(), jenis: 'tangguh', sebab: $('#sebabTangguh').value, tid: t.id });
  S.aktif = null; simpan(); lepasKunciSkrin(); tutupDialog(); toast('Ditangguh. Tugasan ini masih menunggu kau.'); render();
}

/* Bonus */
function dialogBonus() {
  bukaDialog(`<h2>Tugasan bonus</h2><p class="kecil redup">Selepas ditambah, ia terikat sama seperti ikrar: mesti siap, atau hari gagal.</p>
    <label class="l" for="bonusPilih">Tugasan</label><select id="bonusPilih">${SUSUNAN_KELAS.map(c => `<optgroup label="${KELAS[c].nama} · ${KELAS[c].model}">${S.pustaka.filter(p => p.kelas === c).map(p => `<option value="${p.id}">${esc(p.tajuk)}</option>`).join('')}</optgroup>`).join('')}</select>
    <label class="l" for="bonusTakrif">Siap bermaksud <small>(min 10)</small></label><input type="text" autocomplete="off" autocapitalize="sentences" enterkeyhint="done" id="bonusTakrif" maxlength="140">
    <div class="butang-baris" style="margin-top:14px"><button class="btn garis" data-act="tutupDialog">Batal</button><button class="btn tahan" data-tahan="1500" data-act="sahBonus">Tahan untuk ikrar bonus</button></div>`);
}
function sahBonus() {
  const p = S.pustaka.find(x => x.id === $('#bonusPilih').value), takrif = ($('#bonusTakrif').value || '').trim();
  if (!p || takrif.length < 10) return toast('Takrif siap minimum 10 aksara.', true);
  const d = S.hari[hariIni()];
  d.tugas.push({ id: uid(), pid: p.id, tajuk: p.tajuk, kelas: p.kelas, takrif, niat: '', status: 'baru', bonus: true, minit: 0, blok: 0 });
  d.bonus = (d.bonus || 0) + 1; simpan(); tutupDialog(); render();
}

/* ---------- Paparan: Minimalis ---------- */
function vKebiasaanRingkas(k) {
  const d = dapatHari(k, true), tutup = !!d.muhasabah;
  const kb = S.tetapan.kebiasaan;
  const n = Object.values(d.kebiasaan).filter(Boolean).length;
  return `<div class="bah"><h2>Kebiasaan minimalis</h2><small>${n}/${kb.length}${tutup ? ' · dikunci' : ''}</small></div><div class="kad tipis">${kb.map((x, i) => `<label class="semak${tutup ? ' mati' : ''}"><input type="checkbox" data-act="kebiasaan" data-i="${i}" ${d.kebiasaan[i] ? 'checked' : ''} ${tutup ? 'disabled' : ''}><div><div class="tj">${esc(x)}</div></div></label>`).join('')}</div>`;
}
function vMinimalis() {
  const k = hariIni();
  let h = vKebiasaanRingkas(k);
  h += `<p class="kecil redup" style="margin-top:-4px">Kurang 60% menjadikan hari SEPARA walaupun semua tugasan siap.</p>`;
  const bulan = k.slice(0, 7), keluarBulan = S.keluar.filter(x => kunciHari(x.pada).startsWith(bulan)).length;
  h += `<div class="bah"><h2>Barang keluar</h2><small>${keluarBulan} bulan ini · ${S.keluar.length} jumlah</small></div>
    <div class="kad"><div class="baris"><input type="text" autocomplete="off" autocapitalize="sentences" enterkeyhint="done" id="keluarNama" placeholder="Apa yang keluar hari ini?" maxlength="80"><select id="keluarCara" style="width:auto"><option>Sedekah</option><option>Buang</option><option>Jual</option><option>Kitar semula</option></select></div><button class="btn" style="margin-top:8px" data-act="tambahKeluar">Catat</button>
    ${S.keluar.length ? `<ul class="senarai" style="margin-top:12px">${S.keluar.slice(-6).reverse().map(x => `<li class="baris jarak"><span>${esc(x.nama)}</span><span class="redup m kecil">${esc(x.cara)} · ${esc(labelTarikh(kunciHari(x.pada)))}</span></li>`).join('')}</ul>` : ''}</div>`;
  const jimat = S.tunggu.filter(x => x.status === 'batal').reduce((a, x) => a + (Number(x.harga) || 0), 0);
  h += `<div class="bah"><h2>Senarai tunggu 30 hari</h2><small>jimat RM${jimat.toFixed(2)}</small></div>
    <div class="kad"><p class="kecil redup">Mahu beli sesuatu? Tulis di sini. Butang beli hanya terbuka selepas 30 hari. Kebanyakan keinginan mati sebelum itu.</p>
    <div class="baris" style="margin-top:10px"><input type="text" autocomplete="off" autocapitalize="sentences" enterkeyhint="done" id="tungguNama" placeholder="Barang" maxlength="80"><input type="number" id="tungguHarga" placeholder="RM" min="0" step="0.01" style="width:110px"></div><button class="btn" style="margin-top:8px" data-act="tambahTunggu">Masuk senarai</button>
    <ul class="senarai" style="margin-top:12px">${S.tunggu.filter(x => !x.status).map(x => {
      const hari = Math.floor((Date.now() - x.pada) / 864e5), boleh = hari >= 30;
      return `<li><div class="baris jarak"><b>${esc(x.nama)}</b><span class="m kecil">RM${(Number(x.harga) || 0).toFixed(2)}</span></div><div class="progres"><i style="width:${Math.min(100, hari / 30 * 100)}%"></i></div><div class="baris jarak" style="margin-top:6px"><span class="redup kecil m">hari ${Math.min(hari, 30)}/30</span><span class="butang-baris"><button class="btn teks" data-act="tungguBatal" data-id="${x.id}">Tak jadi</button><button class="btn teks" data-act="tungguBeli" data-id="${x.id}" ${boleh ? '' : 'disabled'}>Beli</button></span></div></li>`;
    }).join('') || '<li class="redup kecil">Kosong. Bagus.</li>'}</ul></div>`;
  h += `<div class="bah"><h2>Prinsip</h2></div><div class="kad tipis"><ul class="peraturan" style="margin:0"><li>Satu masuk, satu keluar.</li><li>Jika ragu, keluarkan.</li><li>Milik sedikit, urus dengan baik.</li><li>Satu tugasan pada satu masa. Satu skrin pada satu masa.</li><li>Senarai pendek yang siap lebih baik daripada senarai panjang yang dirancang.</li></ul></div>`;
  return h;
}

/* ---------- Paparan: Rekod ---------- */
function vRekod() {
  const kini = hariIni();
  const minit7 = [...Array(7)].reduce((a, _, i) => { const d = S.hari[tambahHari(kini, -i)]; return a + (d ? d.sesi.filter(s => s.sah).reduce((x, s) => x + s.minit, 0) : 0); }, 0);
  const dorSemua = Object.values(S.hari).flatMap(d => d.dorongan || []), dorMenang = dorSemua.filter(x => x.menang).length;
  let h = `<div class="stat-grid" style="margin-top:4px">
    <div class="stat"><b>${streak()}</b><small>Streak semasa</small></div>
    <div class="stat"><b>${streakTerbaik()}</b><small>Streak terbaik</small></div>
    <div class="stat"><b>${indeks() ?? '—'}</b><small>Indeks disiplin (14 hari)</small></div>
    <div class="stat"><b>${fmtMinit(minit7)}</b><small>Fokus sah, 7 hari</small></div>
    <div class="stat"><b>${dorMenang}/${dorSemua.length}</b><small>Dorongan ditewaskan</small></div>
    <div class="stat"><b>${S.keluar.length}</b><small>Barang keluar</small></div></div>`;
  // Kalendar 5 minggu
  const mula = tarikhDari(kini);
  while (mula.getDay() !== 1) mula.setDate(mula.getDate() - 1);
  mula.setDate(mula.getDate() - 28);
  h += `<div class="bah"><h2>Kalendar disiplin</h2><small>5 minggu</small></div><div class="kad"><div class="kalendar">${['Isn', 'Sel', 'Rab', 'Kha', 'Jum', 'Sab', 'Ahd'].map(x => `<div class="kh">${x}</div>`).join('')}`;
  const LBL = { lulus: 'Lulus', separa: 'Separa', gagal: 'Gagal', rehat: 'Rehat', 'rehat-kini': 'Rehat', berjalan: 'Sedang berjalan', belum: 'Belum ikrar', menunggu: 'Menunggu muhasabah', kosong: 'Sebelum Tuntas', akan: 'Akan datang' };
  const IKON = { lulus: '✓', separa: '½', gagal: '✕', rehat: '–', 'rehat-kini': '–' };
  for (let i = 0; i < 35; i++) {
    const dt = new Date(mula); dt.setDate(mula.getDate() + i);
    const k = `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`, r = keputusan(k);
    const cls = r === 'rehat-kini' ? 'rehat' : r;
    h += `<button class="sel ${cls}${k === kini ? ' kini' : ''}${r === 'kosong' || r === 'akan' ? ' luar' : ''}" data-act="lihatHari" data-k="${k}" title="${labelTarikh(k)}: ${LBL[r]}" aria-label="${labelTarikh(k)}: ${LBL[r]}">${IKON[r] || dt.getDate()}</button>`;
  }
  h += `</div><div class="petunjuk"><span><i style="background:var(--lulus-lembut);border-color:var(--lulus)"></i>✓ Lulus</span><span><i style="background:var(--separa-lembut);border-color:var(--separa)"></i>½ Separa</span><span><i style="background:var(--gagal-lembut);border-color:var(--gagal)"></i>✕ Gagal</span><span><i style="background:var(--rehat-lembut);border-color:var(--rehat)"></i>– Rehat</span></div></div>`;
  // Emosi 30 hari
  const kira = {}; let neg = [0, 0], pos = [0, 0];
  for (let i = 0; i < 30; i++) {
    const d = S.hari[tambahHari(kini, -i)]; if (!d) continue;
    if (d.ikrar) kira[d.ikrar.emosi] = (kira[d.ikrar.emosi] || 0) + 1;
    for (const s of d.sesi) { if (s.emosi) { kira[s.emosi] = (kira[s.emosi] || 0) + 1; const tgt = EMOSI[s.emosi].nada === 'negatif' ? neg : pos; tgt[0] += s.sah ? 1 : 0; tgt[1] += 1; } }
    if (d.muhasabah) for (const e of d.muhasabah.emosi) kira[e] = (kira[e] || 0) + 1;
  }
  const ent = Object.entries(kira).sort((a, b) => b[1] - a[1]), maks = ent.length ? ent[0][1] : 1;
  h += `<div class="bah"><h2>Peta emosi</h2><small>30 hari</small></div><div class="kad">`;
  if (!ent.length) h += `<p class="redup kecil">Belum ada data. Setiap ikrar, blok dan muhasabah merekod emosi.</p>`;
  else h += ent.map(([e, n]) => `<div class="palang ${EMOSI[e].nada}" title="${EMOSI[e].label}: ${n} kali"><span>${EMOSI[e].label}</span><div class="trek"><i style="width:${n / maks * 100}%"></i></div><span class="n">${n}</span></div>`).join('');
  if (neg[1]) {
    const pn = Math.round(neg[0] / neg[1] * 100), pp = pos[1] ? Math.round(pos[0] / pos[1] * 100) : null;
    h += `<div class="wawasan">Blok yang dimulakan dalam emosi negatif tetap sah <b>${pn}%</b> (${neg[0]}/${neg[1]})${pp !== null ? `, berbanding ${pp}% dalam emosi positif` : ''}. ${pn >= 70 ? 'Perasaan bukan penentu. Disiplin yang menentukan.' : 'Emosi negatif sedang memenangi blok kau. Ikut intervensi dengan sungguh-sungguh.'}</div>`;
  }
  h += `</div>`;
  // Tenaga pagi 14 hari
  const ten = [...Array(14)].map((_, i) => { const k = tambahHari(kini, i - 13), d = S.hari[k]; return { k, v: d && d.ikrar ? d.ikrar.tenaga : 0 }; });
  h += `<div class="bah"><h2>Tenaga pagi</h2><small>14 hari · skala 1–5</small></div><div class="kad"><div class="lajur">${ten.map(x => `<div class="${x.v ? '' : 'kosong'}" title="${labelTarikh(x.k)}: ${x.v ? 'tenaga ' + x.v : 'tiada ikrar'}"><i style="height:${x.v ? x.v / 5 * 100 : 2}%"></i></div>`).join('')}</div><div class="lajur-label">${ten.map(x => `<span>${tarikhDari(x.k).getDate()}</span>`).join('')}</div></div>`;
  // Minit ikut kelas
  const mk = {}; for (let i = 0; i < 30; i++) { const d = S.hari[tambahHari(kini, -i)]; if (d) for (const s of d.sesi) if (s.sah) mk[s.kelas] = (mk[s.kelas] || 0) + s.minit; }
  const mm = Math.max(1, ...Object.values(mk));
  h += `<div class="bah"><h2>Fokus sah ikut kelas</h2><small>30 hari</small></div><div class="kad">${SUSUNAN_KELAS.map(c => `<div class="palang" title="${KELAS[c].nama}: ${fmtMinit(mk[c] || 0)}"><span>${KELAS[c].nama}</span><div class="trek"><i style="width:${(mk[c] || 0) / mm * 100}%"></i></div><span class="n">${fmtMinit(mk[c] || 0)}</span></div>`).join('')}</div>`;
  // Kubur tugasan
  const kubur = Object.entries(S.hari).flatMap(([k, d]) => d.tugas.filter(t => t.status === 'lepas').map(t => ({ k, t }))).sort((a, b) => b.k.localeCompare(a.k));
  h += `<div class="bah"><h2>Kubur tugasan</h2><small>${kubur.length} dilepaskan</small></div><div class="kad tipis">${kubur.length ? `<ul class="senarai kubur">${kubur.map(({ k, t }) => `<li><div class="tj">${esc(t.tajuk)}</div><div class="redup">${esc(labelTarikh(k))} · ${esc(t.sebab)}</div></li>`).join('')}</ul>` : '<p class="redup kecil">Kosong. Kekalkan begitu.</p>'}</div>`;
  return h;
}
function dialogHari(k) {
  const d = S.hari[k], r = keputusan(k);
  if (!d || !d.ikrar) return toast(`${labelTarikh(k)}: ${r === 'rehat' ? 'hari rehat' : r === 'kosong' ? 'sebelum Tuntas' : r === 'akan' ? 'belum tiba' : 'tiada ikrar'}`);
  bukaDialog(`<h2>${esc(labelTarikh(k))}</h2><p class="kecil redup">Ikrar ${jam(d.ikrar.pada)}${d.ikrar.lewat ? ' (lewat)' : ''} · emosi ${EMOSI[d.ikrar.emosi].label} · tenaga ${d.ikrar.tenaga}/5 · skor ${skorHari(k) ?? '—'}</p>
    <ul class="senarai" style="margin-top:10px">${d.tugas.map(t => `<li><b>${esc(t.tajuk)}</b> <span class="lencana ${t.status === 'siap' ? 'hijau' : t.status === 'baru' || t.status === 'jalan' ? '' : 'merah'}">${t.status}</span><div class="redup">${t.output ? '✓ ' + esc(t.output) : esc(t.takrif)}</div></li>`).join('')}</ul>
    ${d.muhasabah ? `<p class="kecil" style="margin-top:10px"><b>Pengajaran:</b> ${esc(d.muhasabah.ajar)}</p>` : ''}
    <button class="btn garis penuh" style="margin-top:14px" data-act="tutupDialog">Tutup</button>`);
}

/* ---------- Paparan: Tetapan ---------- */
function vTetapan() {
  const T = S.tetapan;
  let h = `<div class="bah"><h2>Jadual</h2></div><div class="kad">
    <label class="l" for="t_ikrar">Had ikrar pagi</label><input type="time" id="t_ikrar" data-f="tetap" data-id="ikrarSebelum" value="${esc(T.ikrarSebelum)}">
    <label class="l" for="t_muh">Muhasabah dibuka</label><input type="time" id="t_muh" data-f="tetap" data-id="muhasabahDari" value="${esc(T.muhasabahDari)}">
    <label class="l" for="t_rehat">Hari rehat mingguan <small>(satu sahaja)</small></label><select id="t_rehat" data-f="tetap" data-id="hariRehat"><option value="-1">Tiada</option>${HARI.map((x, i) => `<option value="${i}" ${Number(T.hariRehat) === i ? 'selected' : ''}>${x}</option>`).join('')}</select>
    <p class="kecil redup" style="margin-top:10px">Hari bermula jam 4:00 pagi. Kerja selepas tengah malam kekal dalam hari yang sama.</p></div>`;
  h += `<div class="bah"><h2>Blok fokus</h2><small>minit</small></div><div class="kad">${SUSUNAN_KELAS.map(c => `<div class="baris" style="margin-top:8px"><div style="flex:1">${htmlKelas(c)}<div class="kecil redup">${KELAS[c].ringkas}</div></div><input type="number" min="10" max="120" style="width:80px" data-f="blok" data-id="${c}" value="${blokMin(c)}" aria-label="Blok ${KELAS[c].nama}"><input type="number" min="3" max="30" style="width:70px" data-f="rehat" data-id="${c}" value="${rehatMin(c)}" aria-label="Rehat ${KELAS[c].nama}"></div>`).join('')}<p class="kecil redup" style="margin-top:8px">Kiri: blok fokus. Kanan: rehat. Blok 10–120, rehat 3–30.</p></div>`;
  h += `<div class="bah"><h2>Pustaka tugasan</h2><small>${S.pustaka.length}/30</small></div><div class="kad">${SUSUNAN_KELAS.map(c => `<div class="kumpulan">${htmlKelas(c)}${S.pustaka.filter(p => p.kelas === c).map(p => `<div class="baris jarak" style="padding:8px 0;border-top:1px solid var(--garis)"><span class="kecil">${esc(p.tajuk)}</span><button class="btn teks merah" data-act="buangPustaka" data-id="${p.id}" aria-label="Buang ${esc(p.tajuk)}">Buang</button></div>`).join('')}</div>`).join('')}
    <div class="baris" style="margin-top:14px"><input type="text" autocomplete="off" autocapitalize="sentences" enterkeyhint="done" id="pustakaTajuk" placeholder="Tugasan baharu" maxlength="90"><select id="pustakaKelas" style="width:auto">${SUSUNAN_KELAS.map(c => `<option value="${c}">${KELAS[c].nama}</option>`).join('')}</select></div><button class="btn garis" style="margin-top:8px" data-act="tambahPustaka" ${S.pustaka.length >= 30 ? 'disabled' : ''}>Tambah</button></div>`;
  h += `<div class="bah"><h2>Kebiasaan minimalis</h2><small>had 5</small></div><div class="kad">${T.kebiasaan.map((x, i) => `<input type="text" autocomplete="off" autocapitalize="sentences" enterkeyhint="done" style="margin-top:${i ? 8 : 0}px" data-f="kebiasaan" data-i="${i}" value="${esc(x)}" maxlength="80" aria-label="Kebiasaan ${i + 1}">`).join('')}<p class="kecil redup" style="margin-top:8px">Kosongkan untuk buang. Perubahan berkuat kuasa serta-merta.</p></div>`;
  h += `<div class="bah"><h2>Peringatan & paparan</h2></div><div class="kad"><div class="butang-baris"><button class="btn garis" data-act="notifikasi">Benarkan notifikasi tamat blok</button><button class="btn garis" data-act="tema">Tema: ${document.documentElement.dataset.theme || 'ikut peranti'}</button></div></div>`;
  h += `<div class="bah"><h2>Sandaran</h2></div><div class="kad"><p class="kecil redup">Data disimpan dalam peranti ini sahaja. Muat turun sandaran setiap minggu.</p><div class="butang-baris" style="margin-top:10px"><button class="btn garis" data-act="eksport">Muat turun sandaran</button><label class="btn garis" for="importFail">Pulihkan<input type="file" id="importFail" accept="application/json" hidden></label></div></div>`;
  h += `<div class="bah"><h2>Padam semua</h2></div><div class="kad amaran"><label class="l" for="padamTeks">Taip PADAM untuk memadam semua data</label><input type="text" autocomplete="off" autocapitalize="sentences" enterkeyhint="done" id="padamTeks" autocomplete="off"><button class="btn merah tahan" style="margin-top:10px" data-tahan="3000" data-act="padam">Tahan untuk padam</button></div>`;
  return h;
}

/* ---------- Tindakan ---------- */
const ACT = {
  kerjaRehat() { draf().paksa = true; simpan(); render(); },
  drafEmosi(el) { draf().emosi = el.dataset.e; simpan(); render(); },
  drafTenaga(el) { draf().tenaga = Number(el.dataset.n); simpan(); render(); },
  drafPilih(el) {
    const D = draf(), p = S.pustaka.find(x => x.id === el.dataset.id); if (!p) return;
    if (D.pilih[p.id]) delete D.pilih[p.id]; else D.pilih[p.id] = { tajuk: p.tajuk, kelas: p.kelas, takrif: '', niat: '' };
    simpan(); render();
  },
  drafTambahLuar() {
    const tj = ($('#luarTajuk').value || '').trim(), kl = $('#luarKelas').value; if (tj.length < 3) return toast('Tajuk terlalu pendek.', true);
    draf().luar.push({ tajuk: tj, kelas: kl, takrif: '', niat: '' }); simpan(); render();
  },
  drafBuangLuar(el) { draf().luar.splice(Number(el.dataset.i), 1); simpan(); render(); },
  ikrar: buatIkrar,
  mulaFokus(el) { mulaFokus(el.dataset.id); },
  lepas(el) { dialogLepas(el.dataset.id); },
  sahLepas(el) { sahLepas(el.dataset.id); },
  tangguh: dialogTangguh, sahTangguh,
  bonus: dialogBonus, sahBonus,
  tutupDialog,
  emosiSebelum(el) { pilihEmosiSebelum(el.dataset.e); },
  ivMula() { const a = S.aktif, I = INTERVENSI[a.iv]; if (I.jenis === 'masa' ? a.ivBaki > 0 : (a.ivTeks || '').trim().length < 8) return; mulaBlok(); renderFokus(); },
  dorongan: bukaDorongan,
  dorJenis(el) { dorongan.jenis = el.dataset.j; renderFokus(); },
  dorBatal() { dorongan = null; renderFokus(); },
  dorMenang() { if (dorongan.baki <= 0) tamatDorongan(true); },
  dorKalah() { tamatDorongan(false); },
  jedaPendek() { jeda('pendek'); }, jedaSolat() { jeda('solat'); }, sambungJeda,
  simpanFikiran() { const i = $('#fikiranTeks'), v = (i.value || '').trim(); if (!v) return; S.fikiran.push({ id: uid(), teks: v, pada: Date.now() }); simpan(); i.value = ''; toast('Disimpan dalam peti fikiran. Sambung kerja.'); },
  siapAwal, sahkanSiap,
  belumSiap() { const a = S.aktif; a.fasa = a.mula && !a.direkod && a.tamatPada && msFokus(a, a.tamatPada) < a.panjang ? 'fokus' : 'tamat'; if (a.fasa === 'fokus') { a.jedaMs += Date.now() - a.tamatPada; a.tamatPada = null; } simpan(); renderFokus(); },
  emosiSelepas(el) { S.aktif.emosiSelepas = el.dataset.e; simpan(); renderFokus(); },
  tamatYa() { jawabTamat(true); }, tamatBelum() { jawabTamat(false); },
  sambungRehat,
  mEmosi(el) { const D = draf(); D.m = D.m || {}; const s = new Set(D.m.emosi || []); s.has(el.dataset.e) ? s.delete(el.dataset.e) : s.add(el.dataset.e); D.m.emosi = [...s]; simpan(); el.classList.toggle('on'); },
  fikiranSelesai(el) { const f = S.fikiran.find(x => x.id === el.dataset.id); if (f) f.selesai = el.checked ? Date.now() : 0; simpan(); },
  tutupHari,
  kebiasaan(el) { const d = dapatHari(hariIni(), true); if (d.muhasabah) return; d.kebiasaan[el.dataset.i] = el.checked; simpan(); renderKepala(); const p = el.closest('.kad').previousElementSibling; p && p.querySelector('small') && (p.querySelector('small').textContent = `${Object.values(d.kebiasaan).filter(Boolean).length}/${S.tetapan.kebiasaan.length}`); },
  tambahKeluar() {
    const n = ($('#keluarNama').value || '').trim(); if (n.length < 2) return toast('Namakan barang itu.', true);
    S.keluar.push({ id: uid(), nama: n, cara: $('#keluarCara').value, pada: Date.now() });
    const d = dapatHari(hariIni(), true); if (!d.muhasabah) d.kebiasaan[0] = true;
    simpan(); toast('Satu lagi keluar. Ruang bertambah.'); render();
  },
  tambahTunggu() {
    const n = ($('#tungguNama').value || '').trim(); if (n.length < 2) return toast('Namakan barang itu.', true);
    S.tunggu.push({ id: uid(), nama: n, harga: Number($('#tungguHarga').value) || 0, pada: Date.now() }); simpan(); render();
  },
  tungguBatal(el) { const x = S.tunggu.find(y => y.id === el.dataset.id); x.status = 'batal'; x.akhir = Date.now(); simpan(); toast(`Tak jadi beli. RM${(x.harga || 0).toFixed(2)} kekal dalam poket.`); render(); },
  tungguBeli(el) { const x = S.tunggu.find(y => y.id === el.dataset.id); if (Date.now() - x.pada < 30 * 864e5) return; x.status = 'beli'; x.akhir = Date.now(); simpan(); toast('Dibeli selepas 30 hari berfikir. Satu masuk, satu keluar.'); render(); },
  lihatHari(el) { dialogHari(el.dataset.k); },
  buangPustaka(el) { S.pustaka = S.pustaka.filter(p => p.id !== el.dataset.id); simpan(); render(); },
  tambahPustaka() { const t = ($('#pustakaTajuk').value || '').trim(); if (t.length < 3 || S.pustaka.length >= 30) return; S.pustaka.push({ id: uid(), tajuk: t, kelas: $('#pustakaKelas').value }); simpan(); render(); },
  async notifikasi() { try { const p = await Notification.requestPermission(); toast(p === 'granted' ? 'Notifikasi dibenarkan.' : 'Notifikasi tidak dibenarkan.'); } catch (e) { toast('Peranti ini tidak menyokong notifikasi.'); } },
  tema() {
    const r = document.documentElement, seterus = { undefined: 'light', light: 'dark', dark: undefined }[r.dataset.theme];
    if (seterus) r.dataset.theme = seterus; else delete r.dataset.theme;
    try { seterus ? localStorage.setItem('tuntas.tema', seterus) : localStorage.removeItem('tuntas.tema'); } catch (e) {}
    render();
  },
  eksport() {
    const b = new Blob([JSON.stringify(S, null, 1)], { type: 'application/json' }), a = document.createElement('a');
    a.href = URL.createObjectURL(b); a.download = `tuntas-${hariIni()}.json`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  },
  padam() { if ($('#padamTeks').value !== 'PADAM') return toast('Taip PADAM dahulu.', true); S = asal(); simpan(); tab = 'hari'; render(); toast('Semua data dipadam. Mula semula.'); }
};

/* Butang tahan: tindakan penting perlu ditahan, bukan ditekan. */
let tahanan = null;
function mulaTahan(el) {
  if (el.disabled) return;
  const ms = Number(el.dataset.tahan), t0 = performance.now();
  tahanan = { el, raf: 0 };
  const langkah = now => {
    if (!tahanan || tahanan.el !== el) return;
    const p = Math.min(1, (now - t0) / ms); el.style.setProperty('--p', p);
    if (p >= 1) { tahanan = null; el.style.setProperty('--p', 0); try { navigator.vibrate && navigator.vibrate(30); } catch (e) {} ACT[el.dataset.act] && ACT[el.dataset.act](el); return; }
    tahanan.raf = requestAnimationFrame(langkah);
  };
  tahanan.raf = requestAnimationFrame(langkah);
}
function hentiTahan() { if (!tahanan) return; cancelAnimationFrame(tahanan.raf); tahanan.el.style.setProperty('--p', 0); tahanan = null; }
document.addEventListener('pointerdown', e => { const el = e.target.closest('[data-tahan]'); if (el) { e.preventDefault(); mulaTahan(el); } });
['pointerup', 'pointercancel', 'pointerleave'].forEach(n => document.addEventListener(n, e => { if (n !== 'pointerleave' || (tahanan && e.target === tahanan.el)) hentiTahan(); }, true));
document.addEventListener('keydown', e => { const el = e.target.closest && e.target.closest('[data-tahan]'); if (el && (e.key === 'Enter' || e.key === ' ') && !e.repeat) { e.preventDefault(); mulaTahan(el); } });
document.addEventListener('keyup', e => { if (e.key === 'Enter' || e.key === ' ') hentiTahan(); });
document.addEventListener('contextmenu', e => { if (e.target.closest('[data-tahan]')) e.preventDefault(); });

document.addEventListener('click', e => {
  const tb = e.target.closest('#tab button');
  if (tb) { tab = tb.dataset.tab; render(); window.scrollTo(0, 0); return; }
  const el = e.target.closest('[data-act]'); if (!el || el.dataset.tahan) return;
  if (el.disabled) return;
  const f = ACT[el.dataset.act]; if (f) f(el, e);
});
$('#dlg').addEventListener('click', e => { if (e.target.id === 'dlg') tutupDialog(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#dlg').hidden) tutupDialog(); });

/* Menaip: sembunyikan bar tab, bawa ruangan ke tengah skrin selepas papan kekunci terbuka, dan jangan lukis semula paparan semasa menaip. */
const bolehTaip = el => el && (el.tagName === 'TEXTAREA' || (el.tagName === 'INPUT' && /^(text|number|search|time)$/.test(el.type)));
document.addEventListener('focusin', e => {
  if (!bolehTaip(e.target)) return;
  document.body.classList.add('menaip');
  const el = e.target; setTimeout(() => { if (document.activeElement === el) el.scrollIntoView({ block: 'center', behavior: 'smooth' }); }, 350);
});
document.addEventListener('focusout', () => setTimeout(() => { if (!bolehTaip(document.activeElement)) document.body.classList.remove('menaip'); }, 50));
function sedangMenaip() { return bolehTaip(document.activeElement); }
document.addEventListener('input', e => {
  const el = e.target, f = el.dataset && el.dataset.f; if (!f) return;
  const kemasKira = (key, n, min) => { const k = document.querySelector(`[data-kira="${key}"]`); if (k) { k.textContent = `${n}/${min}`; k.classList.toggle('ok', n >= min); } };
  if (f === 'takrif' || f === 'niat') {
    const D = draf(), obj = el.dataset.j === 'pilih' ? D.pilih[el.dataset.id] : D.luar[Number(el.dataset.id)]; if (!obj) return;
    obj[f] = el.value; simpan();
    if (f === 'takrif') kemasKira(el.dataset.j + el.dataset.id, el.value.trim().length, 10);
    kemasIkrarButang();
  } else if (f === 'hutangTakrif') { draf().hutang[el.dataset.id] = el.value; simpan(); kemasIkrarButang(); }
  else if (f === 'm') {
    const D = draf(); D.m = D.m || {}; D.m[el.dataset.id] = el.value; simpan();
    if (el.dataset.id === 'skor') $('#skorTeks').textContent = el.value;
    else kemasKira('m' + el.dataset.id, el.value.trim().length, Number(el.dataset.min));
  } else if (f === 'ivTeks') { S.aktif.ivTeks = el.value; simpan(); const b = $('#ivMula'); b && (b.disabled = el.value.trim().length < 8); }
  else if (f === 'sebabLepas') { const n = el.value.trim().length; kemasKira('sebabLepas', n, 30); $('#btnLepas').disabled = n < 30; }
});
document.addEventListener('change', e => {
  const el = e.target, f = el.dataset && el.dataset.f;
  if (el.id === 'importFail' && el.files[0]) {
    const r = new FileReader(); r.onload = () => { try { const s = JSON.parse(r.result); if (!s || s.v !== 1 || !s.hari) throw 0; S = Object.assign(asal(), s); S.aktif = null; simpan(); render(); toast('Sandaran dipulihkan.'); } catch (x) { toast('Fail sandaran tidak sah.', true); } };
    r.readAsText(el.files[0]); return;
  }
  if (!f) return;
  if (f === 'tetap') { S.tetapan[el.dataset.id] = el.dataset.id === 'hariRehat' ? Number(el.value) : el.value; simpan(); renderKepala(); toast('Disimpan.'); }
  else if (f === 'blok' || f === 'rehat') {
    const [mn, mx] = f === 'blok' ? [10, 120] : [3, 30], v = Math.max(mn, Math.min(mx, Math.round(Number(el.value) || 0)));
    el.value = v; S.tetapan.kelas[el.dataset.id][f] = v; simpan(); toast('Disimpan.');
  } else if (f === 'kebiasaan') {
    const kb = S.tetapan.kebiasaan.slice(); kb[Number(el.dataset.i)] = el.value.trim();
    S.tetapan.kebiasaan = kb.filter(Boolean).slice(0, 5); if (!S.tetapan.kebiasaan.length) S.tetapan.kebiasaan = KEBIASAAN_ASAL.slice(0, 1);
    simpan(); render();
  }
});
function kemasIkrarButang() {
  const b = document.querySelector('[data-act="ikrar"]'); if (!b) return;
  const s = semakIkrar(); b.disabled = !s.ok;
  const p = b.previousElementSibling;
  if (p && p.tagName === 'P') { p.textContent = s.ok ? '' : s.sebab; p.hidden = s.ok; }
  else if (!s.ok) b.insertAdjacentHTML('beforebegin', `<p class="kecil" style="color:var(--tegas);margin-top:12px">${esc(s.sebab)}</p>`);
}

/* Gangguan: keluar dari app semasa blok fokus dikira. */
document.addEventListener('visibilitychange', () => {
  const a = S.aktif;
  if (document.hidden) { if (a && a.fasa === 'fokus' && !a.jeda) { a.keluarPada = Date.now(); simpan(); } lepasKunciSkrin(); }
  else {
    if (a && a.fasa === 'fokus' && a.keluarPada) { const ms = Date.now() - a.keluarPada; a.keluarPada = null; if (ms > 2000) catatGanggu(ms, 'Kau keluar dari app'); else simpan(); }
    if (a) mintaKunciSkrin();
    if (kunciHari() !== render.hari && !sedangMenaip()) render();
  }
});

/* Detik setiap saat: jam, denyut (untuk mengesan app ditutup), dan gulung hari. */
setInterval(() => {
  const a = S.aktif;
  if (a && a.fasa === 'fokus' && !document.hidden) { a.denyut = Date.now(); if (Date.now() % 5000 < 1000) simpan(); }
  detikFokus();
  if (kunciHari() !== render.hari && !sedangMenaip()) { render.hari = kunciHari(); render(); }
}, 1000);

/* Mula */
(function mula() {
  try { const t = localStorage.getItem('tuntas.tema'); if (t) document.documentElement.dataset.theme = t; } catch (e) {}
  gulung();
  const a = S.aktif;
  if (a && a.fasa === 'fokus') {
    if (a.keluarPada) { const ms = Date.now() - a.keluarPada; a.keluarPada = null; if (!a.jeda) { a.ganggu += 1; a.keluarMs += ms; } }
    else if (!a.jeda && Date.now() - (a.denyut || Date.now()) > 20000) { a.ganggu += 1; a.keluarMs += Date.now() - a.denyut; }
    simpan();
  }
  render.hari = kunciHari();
  render();
  if (a && a.fasa === 'fokus' && a.ganggu) toast(`App ditutup semasa fokus. Gangguan ${a.ganggu}/${HAD_GANGGU}.`, true);
  if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(() => {});
})();
