/* Ekspedisi Buku · Logik permainan, misi, cabaran dan antara muka */
(function () {
  const EB = (window.EB = window.EB || {});
  const T = THREE;
  const $ = (s) => document.querySelector(s);
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ---------- Data buku ---------- */
  EB.BUKU = EB.BUKU || [];
  EB.daftar = (b) => EB.BUKU.push(b);
  // B(tajuk, cerita, [3 titik], soalan, [betul, salah, salah], penerangan) — setiap teks "BM|EN"
  EB.B = (t, cerita, titik, soalan, pilihan, terang) => ({ t, cerita, titik, soalan, pilihan, terang });

  /* ---------- Simpanan ---------- */
  const KUNCI_LAMA = 'ekspedisi-buku.v1', KUNCI_PROFIL = 'ekspedisi-buku.profil', KUNCI_G = 'ekspedisi-buku.tetapan';
  const kunciData = (id) => 'ekspedisi-buku.data.' + id;
  let S, G, P; // S = data pemain aktif, G = tetapan peranti, P = senarai profil
  const bacaJSON = (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } };
  const tulisJSON = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } };
  const lalaiS = () => ({ xp: 0, nyawa: 5, tNyawa: Date.now(), siri: { hari: '', n: 0 }, buku: {}, ulang: {}, terakhir: null, stat: {}, kebun: {} });
  const idBaru = () => 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const WARNA_PEMAIN = ['#2e86c1', '#e85d4a', '#2a9d8f', '#8e44ad', '#f4a261', '#ff70a6', '#6a994e', '#264653'];
  function muatS() {
    G = Object.assign({ bahasa: 'bm', kualiti: null, bunyi: true }, bacaJSON(KUNCI_G) || {});
    P = bacaJSON(KUNCI_PROFIL) || { aktif: null, senarai: [] };
    const lama = bacaJSON(KUNCI_LAMA);
    if (lama && !P.senarai.length) { // pindahkan simpanan versi lama ke profil pertama
      ['bahasa', 'kualiti', 'bunyi'].forEach((k) => { if (lama[k] !== undefined) G[k] = lama[k]; });
      const id = idBaru(); P.senarai.push({ id, nama: 'Pengembara', warna: WARNA_PEMAIN[0], dibuat: Date.now(), akhir: Date.now() }); P.aktif = id;
      tulisJSON(kunciData(id), lama); tulisJSON(KUNCI_PROFIL, P); tulisJSON(KUNCI_G, G);
      try { localStorage.removeItem(KUNCI_LAMA); } catch (e) { /* abaikan */ }
    }
    if (P.aktif && !P.senarai.some((x) => x.id === P.aktif)) P.aktif = null;
    S = Object.assign(lalaiS(), (P.aktif && bacaJSON(kunciData(P.aktif))) || {});
  }
  const profilAktif = () => P.senarai.find((x) => x.id === P.aktif) || null;
  function simpan() {
    if (!P.aktif) return;
    tulisJSON(kunciData(P.aktif), S);
    const pr = profilAktif(); if (pr) { pr.akhir = Date.now(); pr.xp = S.xp; pr.terakhir = S.terakhir; }
    tulisJSON(KUNCI_PROFIL, P);
  }
  const simpanG = () => tulisJSON(KUNCI_G, G);
  function kemajuan(id) { if (!S.buku[id]) S.buku[id] = { depan: 0, bintang: {}, pos: null }; return S.buku[id]; }

  /* ---------- Bahasa ---------- */
  const L = (s) => { if (s == null) return ''; const i = String(s).indexOf('|'); if (i < 0) return s; return G.bahasa === 'en' ? String(s).slice(i + 1) : String(s).slice(0, i); };
  EB.L = L;
  const TXT = {
    tajuk: 'Ekspedisi Buku|Book Expedition',
    sub: 'Faham buku tanpa membelek satu halaman pun. Teroka, selesaikan misi, kumpul Kad Ilmu.|Understand a book without turning a single page. Explore, finish missions, collect Knowledge Cards.',
    pilihBuku: 'Pilih ekspedisi|Choose an expedition',
    mula: 'Mula|Start', sambung: 'Sambung|Continue', bab: 'Bab|Chapter', bahagian: 'Daerah|District',
    nyawa: 'Nyawa|Hearts', tahap: 'Tahap|Level', siri: 'hari berturut|day streak',
    bercakap: 'Bercakap|Talk', terima: 'Terima misi|Accept mission', nanti: 'Nanti dulu|Not now', tutup: 'Tutup|Close', seterusnya: 'Seterusnya|Next', cubaLagi: 'Cuba lagi|Try again',
    misiCari: 'Cari 3 Serpihan Ilmu yang bertaburan di sekitar tempat ini.|Find 3 Knowledge Shards scattered around this place.',
    misiTanya: 'Tanya 3 penduduk bertanda “?” yang tahu rahsia bab ini.|Ask the 3 villagers marked “?” who know this chapter’s secrets.',
    misiKejar: 'Pantas! Kutip 3 serpihan dalam 70 saat sebelum ia pudar.|Hurry! Collect 3 shards within 70 seconds before they fade.',
    kembali: 'Kembali kepada pencerita untuk cabaran.|Return to the storyteller for the challenge.',
    serpihan: 'Serpihan|Shard', penduduk: 'Penduduk|Villager',
    cabaran: 'Cabaran|Challenge', mulaCabaran: 'Mula cabaran|Start challenge', ulangKaji: 'Ulang kaji|Review',
    betul: 'Tepat!|Correct!', salah: 'Belum tepat|Not quite', masaTamat: 'Masa tamat|Time’s up',
    soalanSerpihan: 'Idea mana yang kau kutip dalam bab ini?|Which idea did you collect in this chapter?',
    babSelesai: 'Bab selesai!|Chapter complete!', kadBaru: 'Kad Ilmu baharu ditambah ke album.|New Knowledge Card added to your album.',
    pengsan: 'Kau kehabisan nyawa|You ran out of hearts',
    pengsanTeks: 'Jawab soalan ulang kaji dengan betul untuk memulihkan nyawa, atau tunggu nyawa pulih sendiri (1 setiap 4 minit).|Answer a review question correctly to restore hearts, or wait for them to refill (1 every 4 minutes).',
    pulih: 'Pulihkan dengan ulang kaji|Restore by reviewing',
    bantuan: 'Pencerita membantu kau bangun semula. +3 nyawa.|The storyteller helps you up. +3 hearts.',
    terkunci: 'Terkunci. Selesaikan bab sebelumnya dahulu.|Locked. Finish the previous chapter first.',
    album: 'Album Kad Ilmu|Knowledge Card Album', peta: 'Peta Ekspedisi|Expedition Map', tetapan: 'Tetapan|Settings',
    bahasa: 'Bahasa|Language', kualiti: 'Kualiti grafik|Graphics quality', bunyi: 'Bunyi|Sound', padam: 'Padam kemajuan buku ini|Reset this book’s progress',
    pastiPadam: 'Padam semua kemajuan buku ini?|Erase all progress for this book?',
    keluar: 'Tukar buku|Change book', pengajaran: 'Pengajaran|Lesson',
    penjaga: 'Penjaga Daerah|District Guardian',
    penjagaTeks: 'Pertarungan Kad! Penjaga melancarkan 5 serangan berbentuk situasi dan idea. Tangkis setiap satu dengan Kad Ilmu yang betul dari album kau dalam 25 saat. Lulus jika tersilap tidak lebih daripada sekali.|Card Battle! The Guardian launches 5 attacks as situations and ideas. Block each with the right Knowledge Card from your album within 25 seconds. Pass with at most one mistake.',
    lulus: 'Daerah ditakluk!|District conquered!', gagal: 'Belum lulus. Ulang kaji kad daerah ini dan cuba lagi.|Not yet. Review this district’s cards and try again.',
    tamatBuku: 'Ekspedisi tamat!|Expedition complete!',
    tamatBukuTeks: 'Kau telah menamatkan seluruh buku ini. Album kau kini ialah ringkasan lengkap buku.|You have finished the whole book. Your album is now a complete summary of the book.',
    kawalan: 'WASD / anak panah: gerak · Shift: lari · Klik tanah: jalan ke situ · F / Space: bercakap · Q/E: pusing kamera · Roda: zum · M: peta · K: album|WASD / arrows: move · Shift: run · Click ground: walk there · F / Space: talk · Q/E: rotate camera · Wheel: zoom · M: map · K: album',
    kawalanSentuh: 'Seret di kiri: joystick (tolak jauh untuk lari) · Ketik tanah: jalan ke situ · Seret di kanan: pusing kamera · Cubit: zum|Drag on the left: joystick (push far to run) · Tap ground: walk there · Drag on the right: rotate camera · Pinch: zoom',
    tinggi: 'Tinggi|High', sederhana: 'Sederhana|Medium', rendah: 'Rendah|Low',
    teleport: 'Ketik nod yang sudah dibuka untuk pergi ke situ.|Tap an unlocked node to travel there.',
    kadTerkunci: 'Belum ditemui|Not discovered yet',
    ulasan: 'Ulasan|Explanation', nyawaPenuh: 'Nyawa penuh|Hearts full',
    pencerita: 'Pencerita|Storyteller',
    masa: 'Masa|Time', gagalKejar: 'Serpihan pudar! Cuba lagi. −1 nyawa|The shards faded! Try again. −1 heart',
  };
  const t = (k) => L(TXT[k] || k);

  /* ---------- Bunyi sintesis ringkas ---------- */
  let ac = null;
  function bunyi(jenis) {
    if (!G.bunyi) return;
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      const nada = { ambil: [880, 1320], betul: [660, 990, 1320], salah: [220, 160], buka: [523, 659, 784, 1046], klik: [700], tamat: [523, 659, 784, 1046, 1318] }[jenis] || [600];
      nada.forEach((f, i) => {
        const o = ac.createOscillator(), g = ac.createGain();
        o.type = jenis === 'salah' ? 'square' : 'triangle'; o.frequency.value = f;
        const t0 = ac.currentTime + i * 0.08;
        g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.12, t0 + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.22);
        o.connect(g).connect(ac.destination); o.start(t0); o.stop(t0 + 0.25);
      });
    } catch (e) { /* audio tidak tersedia */ }
  }

  /* ---------- Keadaan permainan ---------- */
  let dunia, pemain, buku, peta, prog;
  let misi = null; // { nod, jenis, fasa, item:[], masa }
  let modalTerbuka = false, layarMula = true, labelNama = null;
  const label = [];
  const hariIni = () => new Date().toISOString().slice(0, 10);

  function semakNyawa() {
    const sela = 4 * 60 * 1000;
    if (S.nyawa >= 5) { S.tNyawa = Date.now(); return; }
    const n = Math.floor((Date.now() - S.tNyawa) / sela);
    if (n > 0) { S.nyawa = Math.min(5, S.nyawa + n); S.tNyawa += n * sela; simpan(); }
  }
  const tahap = () => Math.floor(Math.sqrt(S.xp / 40)) + 1;
  function tambahXP(n) { const lama = tahap(); S.xp += n; if (tahap() > lama) toast('⬆ ' + t('tahap') + ' ' + tahap()); kemasHUD(); }

  /* ---------- Teks nod ---------- */
  function namaNod(n) {
    if (n.jenis === 'penjaga') return t('penjaga') + ': ' + L(buku.bahagian[n.bi].n);
    return L(n.bab.t);
  }
  function nomborBab(n) { let c = 0; for (const m of peta.nod) { if (m.jenis === 'bab') c++; if (m === n) return c; } return c; }

  /* ---------- HUD ---------- */
  function kemasHUD() {
    if (!buku) return;
    semakNyawa();
    const jum = peta.nod.length, siap = Math.min(prog.depan, jum);
    $('#hud-buku').textContent = buku.tajuk;
    $('#hud-bar i').style.width = (siap / jum) * 100 + '%';
    $('#hud-kemajuan').textContent = siap + ' / ' + jum;
    $('#hud-nyawa').innerHTML = '❤'.repeat(S.nyawa) + '<span class="kosong">' + '❤'.repeat(5 - S.nyawa) + '</span>';
    const tp = tahap(), xpA = 40 * (tp - 1) * (tp - 1), xpB = 40 * tp * tp;
    $('#hud-tahap').textContent = t('tahap') + ' ' + tp;
    $('#hud-xp i').style.width = ((S.xp - xpA) / (xpB - xpA)) * 100 + '%';
    $('#hud-siri').textContent = '🔥 ' + (S.siri.n || 0);
    $('#hud-siri').title = (S.siri.n || 0) + ' ' + t('siri');
    kemasTracker();
  }
  function kemasTracker() {
    const tr = $('#tracker');
    if (!misi) {
      const n = peta && peta.nod[prog.depan];
      if (!n) { tr.hidden = true; return; }
      tr.hidden = false;
      tr.innerHTML = `<b>${n.jenis === 'penjaga' ? '⚔' : '📖'} ${esc(namaNod(n))}</b><span>${esc(L('Pergi ke penanda “!” untuk bercakap dengan pencerita.|Head to the “!” marker to talk to the storyteller.'))}</span>`;
      return;
    }
    tr.hidden = false;
    const n = peta.nod[misi.nod], h = EB.MISI[misi.jenis];
    let isi = `<b>${esc(L(NAMA_MISI[misi.jenis] || ''))} · ${esc(namaNod(n))}</b>`;
    if (misi.fasa === 'cari') isi += `<span>${esc(objektifMisi(misi.jenis))}</span><span class="kiraan">${h.kemajuan ? h.kemajuan(ctx, misi) : ''}</span>`;
    else isi += `<span>${esc(t('kembali'))}</span>`;
    tr.innerHTML = isi;
  }
  let toastT = 0;
  function toast(teks) { const e = $('#toast'); e.textContent = teks; e.classList.add('papar'); clearTimeout(toastT); toastT = setTimeout(() => e.classList.remove('papar'), 2600); }

  /* ---------- Modal ---------- */
  function bukaModal(html, kelas) {
    const m = $('#modal'); m.className = 'modal ' + (kelas || ''); m.innerHTML = `<div class="panel">${html}</div>`; m.hidden = false; modalTerbuka = true;
    pemain && (pemain.input.set(0, 0), pemain.berhenti());
    return m.firstChild;
  }
  function tutupModal() { const m = $('#modal'); m.hidden = true; m.innerHTML = ''; modalTerbuka = false; }

  /* ---------- Labels terapung (projek 3D → skrin) ---------- */
  function tambahLabel(pos, kelas, html, data) { const e = el('div', 'label ' + kelas, html); $('#label').appendChild(e); const o = { e, pos, data }; label.push(o); return o; }
  function buangLabel(o) { const i = label.indexOf(o); if (i >= 0) label.splice(i, 1); o.e.remove(); }
  const _p = new T.Vector3();
  function kemasLabel() {
    const w = window.innerWidth, h = window.innerHeight;
    for (const o of label) {
      _p.copy(o.pos).project(dunia.kamera);
      if (_p.z > 1 || _p.x < -1.2 || _p.x > 1.2 || _p.y < -1.2 || _p.y > 1.2) { o.e.style.display = 'none'; continue; }
      o.e.style.display = '';
      o.e.style.transform = `translate(${((_p.x + 1) / 2) * w}px, ${((1 - _p.y) / 2) * h}px) translate(-50%, -100%)`;
    }
  }

  /* ---------- Penanda nod ---------- */
  function keadaanNod(n) { if (n.idx < prog.depan) return 'siap'; if (n.idx === prog.depan) return 'aktif'; return 'kunci'; }
  function htmlLabelNod(n) {
    const k = keadaanNod(n), bt = prog.bintang[n.idx] || 0;
    const no = n.jenis === 'penjaga' ? '⚔' : nomborBab(n);
    let atas = '';
    if (k === 'aktif') atas = `<i class="seru">${misi && misi.nod === n.idx && misi.fasa === 'kembali' ? '?' : '!'}</i>`;
    if (k === 'siap') atas = `<i class="bintang">${'★'.repeat(bt)}${'☆'.repeat(3 - bt)}</i>`;
    if (k === 'kunci') atas = '<i class="kunci">🔒</i>';
    return `${atas}<span><em>${no}</em>${esc(namaNod(n))}</span>`;
  }
  function kemasLabelNod() { for (const o of label) if (o.data && o.data.nod !== undefined) { const n = peta.nod[o.data.nod]; o.e.className = 'label nod ' + keadaanNod(n) + (n.jenis === 'penjaga' ? ' penjaga' : ''); o.e.innerHTML = htmlLabelNod(n); } }

  /* ---------- Bina baris: NPC & penduduk ---------- */
  function selepasBina(r, b) {
    b.npc = []; b.label = [];
    const rnd = EB.rng(dunia.seed + r * 977);
    for (const n of peta.nod.filter((m) => m.r === r)) {

      const pen = n.jenis === 'penjaga'
        ? new EB.Penduduk(dunia, n.npcPos.x, n.npcPos.z, rnd, { statik: true, baju: '#5b3f99', jubah: '#3d2a6b', topi: 'mahkota', skala: 1.25, hadap: n.utara ? 0 : Math.PI })
        : new EB.Penduduk(dunia, n.npcPos.x, n.npcPos.z, rnd, { statik: true, baju: buku.warna || '#d9533b', jubah: '#f3e6cc', topi: 'serban', hadap: n.utara ? 0 : Math.PI });
      b.kumpulan.add(pen.model); pen.nod = n.idx; b.npc.push(pen);
      b.label.push(tambahLabel(new T.Vector3(n.npcPos.x, n.jenis === 'penjaga' ? 2.2 : 1.8, n.npcPos.z), 'nod', '', { nod: n.idx }));
    }
    // penduduk berjalan-jalan di kawasan yang sudah dibuka
    const had = peta.nod[prog.depan] ? peta.nod[prog.depan].potong : Infinity;
    for (let i = 0; i < 7; i++) {
      for (let c = 0; c < 10; c++) {
        const x = 2 + rnd() * (EB.SUSUN.W - 4), z = r * EB.SUSUN.D + 9 + rnd() * 3;
        if (dunia.boleh(Math.floor(x), Math.floor(z), had)) { const p = new EB.Penduduk(dunia, x, z, rnd); b.kumpulan.add(p.model); b.npc.push(p); break; }
      }
    }
    kemasLabelNod();
    pasangKunci();
  }
  function selepasBuang(b) { (b.label || []).forEach(buangLabel); }

  /* ---------- Kabus & pintu kunci di sempadan ---------- */
  function pasangKunci() {
    const g = dunia.lapisanKunci;
    while (g.children.length) g.remove(g.children[0]);
    const n = peta.nod[prog.depan];
    if (!n || !isFinite(n.potong)) return;
    const r = Math.floor(n.potong / 1000), along = n.potong - r * 1000, dir = r % 2 === 0 ? 1 : -1;
    const x = dir > 0 ? along : EB.SUSUN.W - along, z0 = r * EB.SUSUN.D, D = EB.SUSUN.D;
    const rnd = EB.rng(77 + prog.depan);
    const putih = new T.MeshStandardMaterial({ color: 0xffffff, roughness: 1, transparent: true, opacity: 0.94, emissive: 0xdde8ff, emissiveIntensity: 0.25 });
    for (let z = z0 + 0.3; z < z0 + D; z += 0.9) for (let k = 0; k < 2; k++) {
      const m = new T.Mesh(EB.tpl().bola, putih); const s = 0.6 + rnd() * 0.7;
      m.scale.set(s, s * 0.8, s); m.position.set(x + dir * (k * 0.9 + rnd() * 0.4), 0.2 + rnd() * 1.4 + k * 0.4, z + rnd() * 0.4); g.add(m);
    }
    // kabus menutup kawasan terkunci
    const kabusM = new T.MeshBasicMaterial({ color: 0xf2f7ff, transparent: true, opacity: 0.45, depthWrite: false });
    const lebar = dir > 0 ? EB.SUSUN.W - x : x;
    const k1 = new T.Mesh(new T.BoxGeometry(lebar + 0.5, 3.2, D), kabusM); k1.position.set(dir > 0 ? x + lebar / 2 : x - lebar / 2, 1.0, z0 + D / 2); g.add(k1);
    if (r + 1 < peta.baris.length) { const k2 = new T.Mesh(new T.BoxGeometry(EB.SUSUN.W + 1, 3.2, D * 3), kabusM); k2.position.set(EB.SUSUN.W / 2, 1.0, z0 + D + D * 1.5); g.add(k2); }
    // pintu gerbang di jalan
    const kayu = EB.mat('#8a5a3b'), emas = EB.mat('#ffcf3f', 0.4);
    const pg = new T.Group(); pg.position.set(x, 0, z0 + 10.5);
    for (const s of [-1, 1]) { const tg = new T.Mesh(EB.tpl().kotak, kayu); tg.scale.set(0.3, 2.4, 0.3); tg.position.z = s * 1.7; tg.castShadow = true; pg.add(tg); }
    const atas = new T.Mesh(EB.tpl().kotak, kayu); atas.scale.set(0.4, 0.35, 4); atas.position.y = 2.3; pg.add(atas);
    const mangga = new T.Mesh(EB.tpl().kotak, emas); mangga.scale.set(0.15, 0.4, 0.4); mangga.position.y = 1.0; pg.add(mangga);
    for (const y of [0.6, 1.4]) { const r2 = new T.Mesh(EB.tpl().kotak, EB.mat('#6b4429')); r2.scale.set(0.12, 0.15, 3.4); r2.position.y = y; pg.add(r2); }
    g.add(pg);
  }

  /* ---------- Misi (pengendali dalam misi.js) ---------- */
  function jenisMisi(n) {
    const sg = EB.SIGNATURE && EB.SIGNATURE[buku.id], kunci = n.bi + '-' + n.i;
    if (n.jenis === 'bab' && sg && sg[kunci] && EB.MISI[sg[kunci]]) return sg[kunci];
    if (urutanBab(n)) return 'susun';
    const g = EB.GILIRAN_MISI;
    return g[n.idx % g.length];
  }
  function urutanBab(n) { const u = EB.URUTAN && EB.URUTAN[buku.id]; return (u && n.jenis === 'bab' && u[n.bi + '-' + n.i]) || null; }
  function objektifMisi(jenis) { return L((EB.MISI[jenis] || EB.MISI.tanya).objektif); }
  const ctx = {
    get dunia() { return dunia; }, get pemain() { return pemain; }, get peta() { return peta; }, get buku() { return buku; },
    get modalTerbuka() { return modalTerbuka; }, get S() { return S; }, get misiAktif() { return misi; },
    simpan: () => simpan(), kemasTracker: () => kemasTracker(),
    stat(k, n) { S.stat = S.stat || {}; S.stat[k] = (S.stat[k] || 0) + (n || 1); },
    L, t, esc, bunyi, toast, tambahXP, bukaModal, tutupModal, tambahLabel, buangLabel, kemasHUD,
    kocak: (a, r) => kocak(a, r),
    nod: (m) => peta.nod[m.nod],
    had: (m) => peta.nod[m.nod].potong,
    rnd: (m, k) => EB.rng(dunia.seed + m.nod * 31 + k + (m.ulangan || 0) * 997),
    urutan: urutanBab,
    // sel boleh dilalui & boleh dicapai di sekitar titik `dari`
    calon(m, n, bil, dMin, dMax, jarakAntara, dari, elak) {
      const rnd = ctx.rnd(m, 3 + bil * 7 + Math.round(dMin * 13)), had = n.potong, hasil = [];
      const boleh = (a, b) => dunia.boleh(a, b, had);
      dari = dari || n.npcPos; elak = elak || [];
      for (let i = 0; i < 500 && hasil.length < bil; i++) {
        const a = rnd() * Math.PI * 2, d = dMin + rnd() * (dMax - dMin);
        const x = Math.floor(dari.x + Math.cos(a) * d) + 0.5, z = Math.floor(dari.z + Math.sin(a) * d) + 0.5;
        if (!boleh(Math.floor(x), Math.floor(z)) || x < 1.5 || x > EB.SUSUN.W - 1.5) continue;
        if (hasil.some((c) => Math.hypot(c.x - x, c.z - z) < jarakAntara)) continue;
        if (elak.some((c) => Math.hypot(c.x - x, c.z - z) < 2.5)) continue;
        if (Math.hypot(n.npcPos.x - x, n.npcPos.z - z) < 1.6) continue;
        if (!EB.cariLaluan(boleh, n.npcPos.x, n.npcPos.z, x, z, 3000)) continue;
        hasil.push({ x, z });
      }
      return hasil;
    },
    titikLain(n, bil, rnd) {
      const lain = kocak(peta.nod.filter((m) => m.jenis === 'bab' && m.idx !== n.idx), rnd);
      return lain.slice(0, bil).map((m, i) => m.bab.titik[(i + n.idx) % m.bab.titik.length]);
    },
    kristal(x, z, warna, emis, m) {
      const g = new T.Group();
      const kristal = new T.Mesh(new T.OctahedronGeometry(0.28, 0), new T.MeshStandardMaterial({ color: warna, emissive: emis, emissiveIntensity: 0.9, roughness: 0.3, flatShading: true }));
      kristal.scale.y = 1.5; kristal.position.y = 0.8; kristal.castShadow = true; g.add(kristal);
      const sinar = new T.Mesh(new T.CylinderGeometry(0.12, 0.3, 6, 10, 1, true), new T.MeshBasicMaterial({ color: warna, transparent: true, opacity: 0.22, depthWrite: false, side: T.DoubleSide, blending: T.AdditiveBlending }));
      sinar.position.y = 3; g.add(sinar);
      g.position.set(x, 0, z); dunia.scene.add(g); if (m) m.obj.push(g);
      return { obj: g, kristal };
    },
    awan(x, z, m) {
      const g = new T.Group(); const mt = new T.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 });
      for (let i = 0; i < 6; i++) { const b = new T.Mesh(EB.tpl().bola, mt); b.scale.setScalar(0.3 + Math.random() * 0.25); b.position.set((Math.random() - 0.5) * 0.9, 0.3 + Math.random() * 0.6, (Math.random() - 0.5) * 0.9); g.add(b); }
      g.position.set(x, 0, z); dunia.scene.add(g); if (m) m.obj.push(g);
      const t0 = performance.now();
      const f = () => { const k = (performance.now() - t0) / 900; if (k >= 1 || !g.parent) { dunia.scene.remove(g); return; } g.scale.setScalar(1 + k); mt.opacity = 0.9 * (1 - k); requestAnimationFrame(f); };
      requestAnimationFrame(f);
    },
    serpihan(teks, ikon, label, cb) {
      const n = misi ? peta.nod[misi.nod] : null;
      const p = bukaModal(`
        <div class="kad-serpihan"><div class="ikon">${ikon || '💎'}</div>
        <small>${esc(label || '')}${n ? ' · ' + esc(L(n.bab.t)) : ''}</small>
        <p>${esc(L(teks))}</p></div>
        <button class="btn utama" data-a="ok">${esc(t('seterusnya'))}</button>`, 'kecil');
      p.querySelector('[data-a=ok]').onclick = () => { tutupModal(); cb && cb(); kemasHUD(); };
    },
    siap() { if (!misi) return; misi.fasa = 'kembali'; toast(t('kembali')); kemasLabelNod(); kemasHUD(); },
    gagal(mesej) {
      if (!misi) return;
      const n = peta.nod[misi.nod], ul = (misi.ulangan || 0) + 1;
      buangMisi(); S.nyawa = Math.max(0, S.nyawa - 1); simpan(); bunyi('salah'); toast(mesej); kemasHUD();
      if (S.nyawa <= 0) dialogPengsan(); else mulaMisi(n, ul);
    },
  };
  function mulaMisi(n, ulangan) {
    const cuba = [jenisMisi(n), 'jejak', 'siasat', 'tanya'];
    for (const jenis of cuba) {
      misi = { nod: n.idx, jenis, fasa: 'cari', obj: [], npc: [], label: [], penalti: 0, ulangan: ulangan || 0 };
      const h = EB.MISI[jenis];
      let ok = false;
      try { ok = h.mula(ctx, misi, n) !== false; } catch (e) { console.error(e); ok = false; }
      if (ok) break;
      buangMisi();
    }
    kemasLabelNod(); kemasHUD();
  }
  function buangMisi() {
    if (!misi) return;
    const h = EB.MISI[misi.jenis];
    if (h && h.buang) h.buang(ctx, misi);
    for (const o of misi.obj) dunia.scene.remove(o);
    for (const p of misi.npc) p.buang();
    for (const l of misi.label) buangLabel(l);
    dunia.halangan = null;
    misi = null;
  }
  /* ---------- Dialog pencerita ---------- */
  function bercakapNod(n) {
    const k = keadaanNod(n);
    if (k === 'kunci') { toast(t('terkunci')); return; }
    bunyi('klik');
    if (n.jenis === 'penjaga') return dialogPenjaga(n);
    const no = nomborBab(n);
    if (k === 'siap') {
      const p = bukaModal(`${kepalaBab(n, no)}<p class="cerita">${esc(L(n.bab.cerita))}</p>
        <div class="butang"><button class="btn" data-a="kad">🃏 ${esc(t('album'))}</button><button class="btn utama" data-a="ulang">↻ ${esc(t('cubaLagi'))}</button><button class="btn" data-a="x">${esc(t('tutup'))}</button></div>`);
      p.querySelector('[data-a=x]').onclick = tutupModal;
      p.querySelector('[data-a=kad]').onclick = () => paparKad(n);
      p.querySelector('[data-a=ulang]').onclick = () => { tutupModal(); mulaCabaran(n, true); };
      return;
    }
    if (misi && misi.nod === n.idx) {
      if (misi.fasa === 'kembali') { mulaCabaran(n); return; }
      const p = bukaModal(`${kepalaBab(n, no)}<p>${esc(objektifMisi(misi.jenis))}</p><div class="butang"><button class="btn utama" data-a="x">${esc(t('tutup'))}</button></div>`, 'kecil');
      p.querySelector('[data-a=x]').onclick = tutupModal; return;
    }
    const jenis = jenisMisi(n);
    const p = bukaModal(`${kepalaBab(n, no)}
      <p class="cerita">“${esc(L(n.bab.cerita))}”</p>
      <div class="objektif"><b>${esc(L(NAMA_MISI[jenis] || 'Misi|Mission'))}</b> ${esc(objektifMisi(jenis))}</div>
      <div class="butang"><button class="btn" data-a="x">${esc(t('nanti'))}</button><button class="btn utama" data-a="ok">${esc(t('terima'))}</button></div>`);
    p.querySelector('[data-a=x]').onclick = tutupModal;
    p.querySelector('[data-a=ok]').onclick = () => { tutupModal(); ctx.stat('terima'); mulaMisi(n); bunyi('buka'); };
  }
  const NAMA_MISI = Object.assign({}, EB.NAMA_SIGNATURE || {}, { jejak: '🧭 Ikut Jejak|🧭 Follow the Trail', siasat: '🔍 Siasat|🔍 Investigate', pencuri: '💰 Kejar Pencuri|💰 Chase the Thief', hantar: '📦 Hantar Barang|📦 Delivery', susun: '🧱 Susun Timbal|🧱 Stack in Order', tanya: '🗣 Tanya Penduduk|🗣 Ask the Villagers', kejar: '⏱ Lawan Masa|⏱ Beat the Clock' });
  function kepalaBab(n, no) {
    return `<div class="kepala"><div class="lencana">${no}</div><div><small>${esc(t('bab'))} ${no} · ${esc(L(buku.bahagian[n.bi].n))}</small><h2>${esc(L(n.bab.t))}</h2></div></div>`;
  }
  function dialogPenjaga(n) {
    const k = keadaanNod(n);
    const p = bukaModal(`<div class="kepala"><div class="lencana ungu">⚔</div><div><small>${esc(t('penjaga'))}</small><h2>${esc(L(buku.bahagian[n.bi].n))}</h2></div></div>
      <p class="cerita">${esc(t('penjagaTeks'))}</p>
      <div class="butang"><button class="btn" data-a="x">${esc(t('nanti'))}</button><button class="btn utama" data-a="ok">${esc(k === 'siap' ? t('cubaLagi') : t('mulaCabaran'))}</button></div>`);
    p.querySelector('[data-a=x]').onclick = tutupModal;
    p.querySelector('[data-a=ok]').onclick = () => { tutupModal(); mulaCabaran(n, k === 'siap'); };
  }

  /* ---------- Penjana soalan ---------- */
  const kocak = (a, rnd = Math.random) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = (rnd() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  function soalanSenario(n, label) {
    const b = n.bab;
    return { label: label || t('cabaran'), soalan: b.soalan, betul: b.pilihan[0], pilihan: b.pilihan, terang: b.terang, nod: n.idx };
  }
  function soalanSerpihan(n) {
    const lain = peta.nod.filter((m) => m.jenis === 'bab' && m.idx !== n.idx);
    const d = kocak(lain).slice(0, 2).map((m) => m.bab.titik[(Math.random() * m.bab.titik.length) | 0]);
    const betul = n.bab.titik[(Math.random() * n.bab.titik.length) | 0];
    return { label: t('cabaran'), soalan: TXT.soalanSerpihan, betul, pilihan: [betul, ...d], terang: n.bab.titik.join('\n') , nod: n.idx, serpihan: true };
  }
  function itemUlangDue() {
    const kini = Date.now();
    const sedia = Object.entries(S.ulang).filter(([k, v]) => k.startsWith(buku.id + ':') && v.due <= kini).map(([k]) => +k.split(':')[1]).filter((i) => peta.nod[i] && peta.nod[i].jenis === 'bab');
    if (sedia.length) return peta.nod[sedia[(Math.random() * sedia.length) | 0]];
    return null;
  }
  function itemUlangRawak(kecuali) {
    const siap = peta.nod.filter((m) => m.jenis === 'bab' && m.idx < prog.depan && m.idx !== kecuali);
    return siap.length ? siap[(Math.random() * siap.length) | 0] : null;
  }
  function kemasUlang(idx, betul) {
    const k = buku.id + ':' + idx, sela = [1, 3, 7, 16, 35];
    const v = S.ulang[k] || { kotak: 0, due: 0 };
    v.kotak = betul ? Math.min(sela.length - 1, v.kotak + 1) : 0;
    v.due = Date.now() + sela[v.kotak] * 864e5;
    S.ulang[k] = v;
  }

  /* ---------- Cabaran (kuiz) ---------- */
  function mulaCabaran(n, mainSemula) {
    semakNyawa();
    if (S.nyawa <= 0) return dialogPengsan();
    if (n.jenis === 'penjaga') return pertarunganKad(n);
    const soalan = [];
    const u = !mainSemula && (itemUlangDue() || (Math.random() < 0.5 ? itemUlangRawak(n.idx) : null));
    if (u) soalan.push(soalanSenario(u, '↻ ' + t('ulangKaji')));
    const m = misi && misi.nod === n.idx ? misi : null, h = m && EB.MISI[m.jenis];
    if (h && h.soalanTambahan) soalan.push(...h.soalanTambahan(ctx, m, n));
    soalan.push(soalanSenario(n), soalanSerpihan(n));
    const st = { n, soalan, i: 0, salah: m ? m.penalti : 0, penalti: m ? m.penalti : 0, penjaga: false, betulN: 0, ulangan: new Set() };
    if (st.penalti) toast(L('Kesilapan misi: |Mission mistakes: ') + st.penalti + ' (−' + Math.min(2, st.penalti) + ' ★)');
    tanya(st);
  }

  /* ---------- Pertarungan Kad (Penjaga Daerah) ---------- */
  function pertarunganKad(n) {
    const bab = peta.nod.filter((m) => m.jenis === 'bab' && m.bi === n.bi);
    const urut = kocak(bab), serangan = [];
    for (let i = 0; i < 5; i++) {
      const c = urut[i % urut.length], jenisT = i >= 3 || (i >= urut.length && i % 2) ? 'titik' : 'senario';
      serangan.push({ c, jenis: jenisT, teks: jenisT === 'senario' ? c.bab.soalan : c.bab.titik[i % 3], idxTitik: i % 3 });
    }
    const tanpa = n.bi >= Math.ceil(buku.bahagian.length / 2);
    const st = { n, penjaga: true, soalan: serangan, i: 0, salah: 0, betulN: 0, hp: serangan.length, tanpa };
    serangKad(st);
  }
  function serangKad(st) {
    clearInterval(pemasa);
    if (st.i >= st.soalan.length) return tamatCabaran(st);
    const a = st.soalan[st.i];
    const sedia = peta.nod.filter((m) => m.jenis === 'bab' && m.idx < prog.depan && m !== a.c);
    const daerah = kocak(sedia.filter((m) => m.bi === st.n.bi)), luar = kocak(sedia.filter((m) => m.bi !== st.n.bi));
    const tangan = kocak([a.c, ...daerah.concat(luar).slice(0, 3)]);
    const tajukKad = (m) => st.tanpa ? `<em>${esc(t('bab'))} ${nomborBab(m)}</em><span class="tanpa">???</span>` : `<em>${esc(t('bab'))} ${nomborBab(m)}</em><span>${esc(L(m.bab.t))}</span>`;
    const p = bukaModal(`
      <div class="arena"><div class="penjaga-ikon">👑</div><div class="hp"><small>${esc(t('penjaga'))}</small><div class="hp-bar"><i style="width:${(st.hp / st.soalan.length) * 100}%"></i></div></div><span class="nyawa-kecil">${'❤'.repeat(S.nyawa)}</span></div>
      <div class="pemasa"><i></i></div>
      <div class="serangan"><small>⚔ ${esc(L('Serangan|Attack'))} ${st.i + 1} / ${st.soalan.length} · ${esc(a.jenis === 'senario' ? L('Situasi|Situation') : L('Idea siapa ini?|Whose idea is this?'))}</small><h3>${esc(a.jenis === 'titik' ? '“' + L(a.teks) + '”' : L(a.teks))}</h3></div>
      <p class="kecil">${esc(L('Tangkis dengan Kad Ilmu yang betul dari album kau.|Block it with the right Knowledge Card from your album.'))}${st.tanpa ? ' ' + esc(L('Daerah lewat: tajuk kad disembunyikan, ingat ikut nombor bab.|Late district: card titles hidden, remember by chapter number.')) : ''}</p>
      <div class="tangan">${tangan.map((m, i) => `<button class="kad-tempur" data-i="${i}">${tajukKad(m)}</button>`).join('')}</div>
      <div class="maklum" hidden></div>`, 'kuiz tempur');
    let dijawab = false;
    const jawab = (i) => {
      if (dijawab) return; dijawab = true; clearInterval(pemasa);
      const ok = i >= 0 && tangan[i] === a.c;
      p.querySelectorAll('.kad-tempur').forEach((b, k) => { b.disabled = true; if (tangan[k] === a.c) b.classList.add('betul'); else if (k === i) b.classList.add('salah'); });
      if (a.jenis === 'senario') kemasUlang(a.c.idx, ok);
      if (ok) { st.betulN++; st.hp--; bunyi('betul'); tambahXP(20); p.querySelector('.penjaga-ikon').classList.add('kena'); p.querySelector('.hp-bar i').style.width = (st.hp / st.soalan.length) * 100 + '%'; }
      else { st.salah++; ctx.stat('salah'); bunyi('salah'); S.nyawa = Math.max(0, S.nyawa - 1); if (S.nyawa === 4) S.tNyawa = Date.now(); p.querySelector('.panel').classList.add('gegar'); kemasHUD(); }
      simpan();
      const mk = p.querySelector('.maklum'); mk.hidden = false;
      const terang = a.jenis === 'senario' ? L(a.c.bab.pilihan[0]) + '\n\n' + L(a.c.bab.terang) : L(a.c.bab.titik[a.idxTitik]);
      mk.innerHTML = `<b class="${ok ? 'ok' : 'x'}">${esc(i === -1 ? t('masaTamat') : ok ? L('Kad menangkis!|Card blocks it!') : L('Kad salah, kau terkena!|Wrong card, you’re hit!'))}</b>
        <p><b>${esc(t('bab'))} ${nomborBab(a.c)}: ${esc(L(a.c.bab.t))}</b>\n${esc(terang)}</p><button class="btn utama" data-a="n">${esc(t('seterusnya'))}</button>`;
      mk.querySelector('[data-a=n]').onclick = () => { if (S.nyawa <= 0 && !ok) { tutupModal(); return dialogPengsan(); } st.i++; serangKad(st); };
    };
    p.querySelectorAll('.kad-tempur').forEach((b) => (b.onclick = () => jawab(+b.dataset.i)));
    const mula = Date.now(), had = 25000, bar = p.querySelector('.pemasa i');
    pemasa = setInterval(() => { const f = 1 - (Date.now() - mula) / had; bar.style.width = Math.max(0, f) * 100 + '%'; if (f <= 0) jawab(-1); }, 100);
  }
  let pemasa = 0;
  function tanya(st) {
    clearInterval(pemasa);
    if (st.i >= st.soalan.length) return tamatCabaran(st);
    const q = st.soalan[st.i];
    const pilihan = kocak(q.pilihan);
    if (q.pelbagai) return tanyaPelbagai(st, q, pilihan);
    const p = bukaModal(`
      <div class="kuiz-kepala"><span>${esc(q.label)}</span><span>${st.i + 1} / ${st.soalan.length}</span><span class="nyawa-kecil">${'❤'.repeat(S.nyawa)}</span></div>
      ${st.penjaga ? '<div class="pemasa"><i></i></div>' : ''}
      <h3>${esc(L(q.soalan))}</h3>
      <div class="pilihan">${pilihan.map((o, i) => `<button class="opsyen" data-i="${i}"><b>${'ABC'[i]}</b><span>${esc(L(o))}</span></button>`).join('')}</div>
      <div class="maklum" hidden></div>`, 'kuiz');
    let dijawab = false;
    const jawab = (i) => {
      if (dijawab) return; dijawab = true; clearInterval(pemasa);
      const betul = i >= 0 && pilihan[i] === q.betul;
      p.querySelectorAll('.opsyen').forEach((b, k) => { b.disabled = true; if (pilihan[k] === q.betul) b.classList.add('betul'); else if (k === i) b.classList.add('salah'); });
      if (q.nod !== undefined && !q.serpihan) kemasUlang(q.nod, betul);
      if (betul) { st.betulN++; bunyi('betul'); tambahXP(st.penjaga ? 20 : 15); }
      else {
        st.salah++; ctx.stat('salah'); bunyi('salah'); S.nyawa = Math.max(0, S.nyawa - 1); if (S.nyawa < 5 && S.nyawa === 4) S.tNyawa = Date.now();
        if (!st.penjaga && !st.ulangan.has(st.i)) { st.ulangan.add(st.soalan.length); st.soalan.push(Object.assign({}, q, { label: q.label + ' · ' + t('cubaLagi') })); }
        kemasHUD();
      }
      simpan();
      const mk = p.querySelector('.maklum'); mk.hidden = false;
      const terang = q.serpihan ? L(q.betul) : L(q.terang);
      mk.innerHTML = `<b class="${betul ? 'ok' : 'x'}">${esc(t(i === -1 ? 'masaTamat' : betul ? 'betul' : 'salah'))}</b><p>${esc(terang)}</p>
        <button class="btn utama" data-a="n">${esc(t('seterusnya'))}</button>`;
      mk.querySelector('[data-a=n]').onclick = () => {
        if (S.nyawa <= 0 && !betul) { tutupModal(); return dialogPengsan(); }
        st.i++; tanya(st);
      };
      mk.querySelector('[data-a=n]').focus();
    };
    p.querySelectorAll('.opsyen').forEach((b) => (b.onclick = () => jawab(+b.dataset.i)));
    if (st.penjaga) {
      const mula = Date.now(), had = 25000, bar = p.querySelector('.pemasa i');
      pemasa = setInterval(() => { const f = 1 - (Date.now() - mula) / had; bar.style.width = Math.max(0, f) * 100 + '%'; if (f <= 0) jawab(-1); }, 100);
    }
  }
  function tanyaPelbagai(st, q, pilihan) {
    const pilih = new Set();
    const p = bukaModal(`
      <div class="kuiz-kepala"><span>${esc(q.label)}</span><span>${st.i + 1} / ${st.soalan.length}</span><span class="nyawa-kecil">${'❤'.repeat(S.nyawa)}</span></div>
      <h3>${esc(L(q.soalan))}</h3>
      <div class="pilihan">${pilihan.map((o, i) => `<button class="opsyen pilih" data-i="${i}"><b>☐</b><span>${esc(L(o))}</span></button>`).join('')}</div>
      <button class="btn utama lebar" data-a="hantar" disabled>${esc(L('Sahkan pilihan|Confirm choice'))} (0/${q.pelbagai})</button>
      <div class="maklum" hidden></div>`, 'kuiz');
    const sah = p.querySelector('[data-a=hantar]');
    p.querySelectorAll('.opsyen').forEach((b) => (b.onclick = () => {
      const i = +b.dataset.i;
      if (pilih.has(i)) pilih.delete(i); else if (pilih.size < q.pelbagai) pilih.add(i);
      p.querySelectorAll('.opsyen').forEach((x, k) => { x.classList.toggle('dipilih', pilih.has(k)); x.querySelector('b').textContent = pilih.has(k) ? '☑' : '☐'; });
      sah.disabled = pilih.size !== q.pelbagai; sah.textContent = `${L('Sahkan pilihan|Confirm choice')} (${pilih.size}/${q.pelbagai})`;
    }));
    sah.onclick = () => {
      sah.hidden = true;
      const salahN = [...pilih].filter((i) => !q.betulSet.includes(pilihan[i])).length;
      p.querySelectorAll('.opsyen').forEach((b, k) => { b.disabled = true; if (q.betulSet.includes(pilihan[k])) b.classList.add('betul'); else if (pilih.has(k)) b.classList.add('salah'); });
      const ok = salahN === 0;
      if (ok) { st.betulN++; bunyi('betul'); tambahXP(20); } else { st.salah++; ctx.stat('salah'); bunyi('salah'); S.nyawa = Math.max(0, S.nyawa - 1); if (S.nyawa === 4) S.tNyawa = Date.now(); kemasHUD(); }
      simpan();
      const mk = p.querySelector('.maklum'); mk.hidden = false;
      mk.innerHTML = `<b class="${ok ? 'ok' : 'x'}">${esc(ok ? t('betul') : L('Ada petunjuk palsu yang terpilih|You picked a false clue'))}</b><p>${esc(q.betulSet.map((x) => '• ' + L(x)).join('\n'))}</p><button class="btn utama" data-a="n">${esc(t('seterusnya'))}</button>`;
      mk.querySelector('[data-a=n]').onclick = () => { if (S.nyawa <= 0 && !ok) { tutupModal(); return dialogPengsan(); } st.i++; tanya(st); };
    };
  }
  function tamatCabaran(st) {
    const n = st.n;
    if (st.penjaga && st.salah > 1) {
      bunyi('salah');
      const p = bukaModal(`<h2>⚔ ${esc(t('penjaga'))}</h2><p>${esc(t('gagal'))}</p><p class="skor">${st.betulN} / ${st.soalan.length}</p><div class="butang"><button class="btn" data-a="kad">🃏 ${esc(t('album'))}</button><button class="btn utama" data-a="x">${esc(t('tutup'))}</button></div>`, 'kecil');
      p.querySelector('[data-a=x]').onclick = tutupModal; p.querySelector('[data-a=kad]').onclick = () => paparAlbum(n.bi);
      return;
    }
    const bintang = st.penjaga ? (st.salah === 0 ? 3 : 2) : Math.max(1, 3 - st.salah);
    const pertama = n.idx >= prog.depan;
    prog.bintang[n.idx] = Math.max(prog.bintang[n.idx] || 0, bintang);
    if (pertama) {
      prog.depan = n.idx + 1;
      if (n.jenis === 'bab') ctx.stat('siap');
      if (n.jenis === 'bab') kemasUlang(n.idx, true);
      tambahXP(st.penjaga ? 100 : 40 + bintang * 10);
      const h = hariIni();
      if (S.siri.hari !== h) { const semalam = new Date(Date.now() - 864e5).toISOString().slice(0, 10); S.siri.n = S.siri.hari === semalam ? S.siri.n + 1 : 1; S.siri.hari = h; }
    }
    if (misi && misi.nod === n.idx) buangMisi();
    simpan();
    bunyi(pertama ? 'tamat' : 'betul');
    const tamat = prog.depan >= peta.nod.length && pertama;
    const p = bukaModal(`
      <div class="tahniah"><div class="bintang-besar">${'★'.repeat(bintang)}<span>${'★'.repeat(3 - bintang)}</span></div>
      <h2>${esc(st.penjaga ? t('lulus') : t('babSelesai'))}</h2>
      <p>${esc(namaNod(n))}</p>${pertama && !st.penjaga ? `<p class="kecil">${esc(t('kadBaru'))}</p>` : ''}</div>
      ${!st.penjaga ? kadHTML(n) : ''}
      <div class="butang"><button class="btn utama" data-a="x">${esc(t('seterusnya'))}</button></div>`, 'tahniah-modal');
    p.querySelector('[data-a=x]').onclick = () => {
      tutupModal();
      kemaskiniHad(); kemasLabelNod(); kemasHUD();
      if (pertama) confetti();
      if (tamat) paparTamatBuku();
      else if (pertama) toast('🔓 ' + namaNod(peta.nod[prog.depan]));
    };
  }
  function dialogPengsan() {
    bunyi('salah');
    const p = bukaModal(`<h2>💫 ${esc(t('pengsan'))}</h2><p>${esc(t('pengsanTeks'))}</p><div class="butang"><button class="btn" data-a="x">${esc(t('tutup'))}</button><button class="btn utama" data-a="ok">${esc(t('pulih'))}</button></div>`, 'kecil');
    p.querySelector('[data-a=x]').onclick = tutupModal;
    p.querySelector('[data-a=ok]').onclick = () => {
      const u = itemUlangRawak(-1);
      if (!u) { S.nyawa = Math.min(5, S.nyawa + 3); simpan(); tutupModal(); toast(t('bantuan')); kemasHUD(); return; }
      const q = soalanSenario(u, '↻ ' + t('ulangKaji'));
      const pil = kocak(q.pilihan);
      const pp = bukaModal(`<div class="kuiz-kepala"><span>${esc(q.label)}</span><span>${esc(L(u.bab.t))}</span></div><h3>${esc(L(q.soalan))}</h3>
        <div class="pilihan">${pil.map((o, i) => `<button class="opsyen" data-i="${i}"><b>${'ABC'[i]}</b><span>${esc(L(o))}</span></button>`).join('')}</div><div class="maklum" hidden></div>`, 'kuiz');
      pp.querySelectorAll('.opsyen').forEach((b) => (b.onclick = () => {
        const i = +b.dataset.i, ok = pil[i] === q.betul;
        pp.querySelectorAll('.opsyen').forEach((x, k) => { x.disabled = true; if (pil[k] === q.betul) x.classList.add('betul'); else if (k === i) x.classList.add('salah'); });
        kemasUlang(u.idx, ok);
        if (ok) { S.nyawa = Math.min(5, S.nyawa + 2); bunyi('betul'); } else bunyi('salah');
        simpan(); kemasHUD();
        const mk = pp.querySelector('.maklum'); mk.hidden = false;
        mk.innerHTML = `<b class="${ok ? 'ok' : 'x'}">${esc(ok ? t('betul') + ' +2 ❤' : t('salah'))}</b><p>${esc(L(q.terang))}</p><button class="btn utama" data-a="n">${esc(ok ? t('tutup') : t('cubaLagi'))}</button>`;
        mk.querySelector('[data-a=n]').onclick = () => { tutupModal(); if (!ok) dialogPengsan(); };
      }));
    };
  }

  /* ---------- Kad Ilmu & Album ---------- */
  function kadHTML(n) {
    const b = n.bab;
    return `<div class="kad-ilmu"><small>${esc(t('bab'))} ${nomborBab(n)}</small><h3>${esc(L(b.t))}</h3><ul>${b.titik.map((x) => `<li>${esc(L(x))}</li>`).join('')}</ul><p class="pengajaran"><b>${esc(t('pengajaran'))}:</b> ${esc(L(b.terang))}</p></div>`;
  }
  function paparKad(n) {
    const p = bukaModal(`${kadHTML(n)}<div class="butang"><button class="btn utama" data-a="x">${esc(t('tutup'))}</button></div>`, 'kecil');
    p.querySelector('[data-a=x]').onclick = tutupModal;
  }
  function paparAlbum(fokusBi) {
    let html = `<div class="kepala-modal"><h2>🃏 ${esc(t('album'))}</h2><button class="btn ikon" data-a="x">✕</button></div><p class="kecil">${esc(buku.tajuk)} · ${esc(buku.pengarang)}</p>`;
    buku.bahagian.forEach((bh, bi) => {
      html += `<h4 id="alb-${bi}">${esc(t('bahagian'))} ${bi + 1}: ${esc(L(bh.n))}</h4><div class="grid-kad">`;
      for (const n of peta.nod.filter((m) => m.bi === bi && m.jenis === 'bab')) {
        const buka = n.idx < prog.depan;
        html += buka ? `<button class="kad-mini" data-n="${n.idx}"><em>${nomborBab(n)}</em><span>${esc(L(n.bab.t))}</span><i>${'★'.repeat(prog.bintang[n.idx] || 0)}</i></button>`
          : `<div class="kad-mini kunci"><em>${nomborBab(n)}</em><span>${esc(t('kadTerkunci'))}</span></div>`;
      }
      html += '</div>';
    });
    const p = bukaModal(html, 'besar');
    p.querySelector('[data-a=x]').onclick = tutupModal;
    p.querySelectorAll('[data-n]').forEach((b) => (b.onclick = () => { const n = peta.nod[+b.dataset.n]; const pp = bukaModal(`${kadHTML(n)}<div class="butang"><button class="btn" data-a="b">← ${esc(t('album'))}</button><button class="btn utama" data-a="x">${esc(t('tutup'))}</button></div>`, 'kecil'); pp.querySelector('[data-a=x]').onclick = tutupModal; pp.querySelector('[data-a=b]').onclick = () => paparAlbum(n.bi); }));
    if (fokusBi !== undefined) { const h = p.querySelector('#alb-' + fokusBi); h && h.scrollIntoView(); }
  }
  function paparTamatBuku() {
    const jumB = Object.values(prog.bintang).reduce((a, b) => a + b, 0);
    const p = bukaModal(`<div class="tahniah"><div class="bintang-besar">🏆</div><h2>${esc(t('tamatBuku'))}</h2><p>${esc(buku.tajuk)}</p><p>${esc(t('tamatBukuTeks'))}</p><p class="skor">★ ${jumB} / ${peta.nod.length * 3}</p></div>
      <div class="butang"><button class="btn" data-a="kad">🃏 ${esc(t('album'))}</button><button class="btn utama" data-a="x">${esc(t('keluar'))}</button></div>`, 'kecil');
    p.querySelector('[data-a=kad]').onclick = () => paparAlbum();
    p.querySelector('[data-a=x]').onclick = () => { tutupModal(); paparLayarMula(); };
  }

  /* ---------- Peta ringkas ---------- */
  function paparPeta() {
    const p = bukaModal(`<div class="kepala-modal"><h2>🗺 ${esc(t('peta'))}</h2><button class="btn ikon" data-a="x">✕</button></div><p class="kecil">${esc(t('teleport'))}</p><div class="peta-bekas"><canvas id="peta-kanvas"></canvas></div>`, 'besar');
    p.querySelector('[data-a=x]').onclick = tutupModal;
    const cv = p.querySelector('#peta-kanvas');
    const W = EB.SUSUN.W, H = peta.H;
    const lebar = Math.min(560, p.clientWidth - 8), sk = lebar / W;
    cv.width = lebar * 2; cv.height = H * sk * 2; cv.style.width = lebar + 'px'; cv.style.height = H * sk + 'px';
    const c = cv.getContext('2d'); c.scale(2 * sk, 2 * sk);
    for (let z = 0; z < H; z++) for (let x = 0; x < W; x++) {
      const s = dunia.grid.dapat(x, z);
      c.fillStyle = s === EB.SEL.AIR || s === EB.SEL.JAMBATAN ? (s === EB.SEL.JAMBATAN ? '#cfc7b6' : '#5fb8d8') : s === EB.SEL.JALAN ? '#e8d2a6' : s === EB.SEL.LANTAI ? '#efe6d6' : s === EB.SEL.PEJAL ? '#5f9e4a' : '#8fcf65';
      c.fillRect(x, z, 1.02, 1.02);
    }
    const had = peta.nod[prog.depan] ? peta.nod[prog.depan].potong : Infinity;
    c.fillStyle = 'rgba(240,244,255,0.72)';
    for (let z = 0; z < H; z++) for (let x = 0; x < W; x++) if (dunia.pKemajuan(x + 0.5, z + 0.5) > had) c.fillRect(x, z, 1.02, 1.02);
    for (const n of peta.nod) {
      const k = keadaanNod(n);
      c.beginPath(); c.arc(n.x, n.npcPos ? n.npcPos.z : n.zNpc, 1.6, 0, Math.PI * 2);
      c.fillStyle = k === 'siap' ? '#ffcf3f' : k === 'aktif' ? '#ff5d5d' : '#9aa3b5'; c.fill();
      c.lineWidth = 0.35; c.strokeStyle = '#fff'; c.stroke();
    }
    c.beginPath(); c.arc(pemain.pos.x, pemain.pos.y, 1.2, 0, Math.PI * 2); c.fillStyle = '#2e86c1'; c.fill(); c.stroke();
    setTimeout(() => { const bk = p.querySelector('.peta-bekas'); bk.scrollTop = pemain.pos.y * sk - bk.clientHeight / 2; }, 0);
    cv.onclick = (e) => {
      const r = cv.getBoundingClientRect(), x = (e.clientX - r.left) / sk, z = (e.clientY - r.top) / sk;
      let best = null, dm = 4;
      for (const n of peta.nod) { const d = Math.hypot(n.x - x, (n.npcPos ? n.npcPos.z : n.zNpc) - z); if (d < dm && n.idx <= prog.depan) { dm = d; best = n; } }
      if (best) { tutupModal(); teleport(best); }
    };
  }
  function teleport(n) {
    const z = n.utara ? n.r * EB.SUSUN.D + 9.5 : n.r * EB.SUSUN.D + 10.5;
    pemain.letak(n.x, z); dunia.fokus.set(n.x, 0, z);
  }

  /* ---------- Tetapan ---------- */
  function paparTetapan() {
    const q = G.kualiti || 'tinggi', pr = profilAktif();
    const p = bukaModal(`<div class="kepala-modal"><h2>⚙ ${esc(t('tetapan'))}</h2><button class="btn ikon" data-a="x">✕</button></div>
      <label class="baris-tetapan"><span>${esc(t('bahasa'))}</span><span class="tog"><button data-lang="bm" class="${G.bahasa === 'bm' ? 'on' : ''}">BM</button><button data-lang="en" class="${G.bahasa === 'en' ? 'on' : ''}">EN</button></span></label>
      <label class="baris-tetapan"><span>${esc(t('kualiti'))}</span><span class="tog">${['tinggi', 'sederhana', 'rendah'].map((k) => `<button data-q="${k}" class="${q === k ? 'on' : ''}">${esc(t(k))}</button>`).join('')}</span></label>
      <label class="baris-tetapan"><span>${esc(t('bunyi'))}</span><span class="tog"><button data-b="1" class="${G.bunyi ? 'on' : ''}">On</button><button data-b="0" class="${!G.bunyi ? 'on' : ''}">Off</button></span></label>
      <div class="baris-tetapan"><span>👤 ${esc(pr ? pr.nama : '')}</span><span class="tog"><button data-a="nama">✎ ${esc(L('Tukar nama|Rename'))}</button><button data-a="profil">⇄ ${esc(L('Tukar pemain|Switch player'))}</button></span></div>
      <div class="baris-tetapan"><span>💾 ${esc(L('Simpanan|Save data'))}</span><span class="tog"><button data-a="eksport">⤴ ${esc(L('Kod simpanan|Save code'))}</button><button data-a="import">⤵ ${esc(L('Sambung dari kod|Load a code'))}</button></span></div>
      <p class="kecil">${esc(L('Kemajuan disimpan secara automatik dalam peranti ini. Guna Kod simpanan untuk sambung di peranti lain atau selepas membersihkan browser.|Progress saves automatically on this device. Use the Save code to continue on another device or after clearing the browser.'))}</p>
      <p class="kecil">${esc(t(sentuh ? 'kawalanSentuh' : 'kawalan'))}</p>
      <div class="butang"><button class="btn bahaya" data-a="padam">${esc(t('padam'))}</button><button class="btn" data-a="keluar">${esc(t('keluar'))}</button></div>`, 'kecil');
    p.querySelector('[data-a=x]').onclick = tutupModal;
    p.querySelectorAll('[data-lang]').forEach((b) => (b.onclick = () => { G.bahasa = b.dataset.lang; simpanG(); terjemah(); paparTetapan(); }));
    p.querySelectorAll('[data-q]').forEach((b) => (b.onclick = () => { G.kualiti = b.dataset.q; simpanG(); dunia.kualiti(G.kualiti); paparTetapan(); }));
    p.querySelectorAll('[data-b]').forEach((b) => (b.onclick = () => { G.bunyi = b.dataset.b === '1'; simpanG(); paparTetapan(); }));
    p.querySelector('[data-a=nama]').onclick = () => dialogProfil({ ubah: true });
    p.querySelector('[data-a=profil]').onclick = () => dialogProfil({});
    p.querySelector('[data-a=eksport]').onclick = dialogEksport;
    p.querySelector('[data-a=import]').onclick = dialogImport;
    p.querySelector('[data-a=keluar]').onclick = () => { tutupModal(); paparLayarMula(); };
    p.querySelector('[data-a=padam]').onclick = () => { if (confirm(t('pastiPadam'))) { delete S.buku[buku.id]; Object.keys(S.ulang).forEach((k) => k.startsWith(buku.id + ':') && delete S.ulang[k]); simpan(); tutupModal(); mulaBuku(buku.id); } };
  }
  function terjemah() {
    document.documentElement.lang = G.bahasa === 'en' ? 'en' : 'ms';
    document.querySelectorAll('[data-t]').forEach((e) => (e.textContent = t(e.dataset.t)));
    document.querySelectorAll('[data-tt]').forEach((e) => (e.title = t(e.dataset.tt)));
    if (buku) { kemasLabelNod(); kemasHUD(); }
    if (layarMula) binaKadBuku();
  }

  /* ---------- Layar mula ---------- */
  function binaKadBuku() {
    const bekas = $('#senarai-buku'); bekas.innerHTML = '';
    for (const b of EB.BUKU) {
      const pg = S.buku[b.id], jum = b.bahagian.reduce((a, bh) => a + bh.bab.length + 1, 0), siap = pg ? Math.min(pg.depan, jum) : 0;
      const nb = b.bahagian.reduce((a, bh) => a + bh.bab.length, 0);
      const k = el('button', 'kad-buku');
      k.style.setProperty('--warna', b.warna);
      k.innerHTML = `<div class="kulit"><span>${b.ikon || '📘'}</span></div><div class="isi"><h3>${esc(b.tajuk)}</h3><small>${esc(b.pengarang)} · ${nb} ${esc(t('bab'))}</small><p>${esc(L(b.ringkas))}</p><div class="bar"><i style="width:${(siap / jum) * 100}%"></i></div><b>${siap ? t('sambung') : t('mula')} →</b></div>`;
      k.onclick = () => { bunyi('klik'); if (!profilAktif()) return dialogProfil({ wajib: true, lepas: b.id }); mulaBuku(b.id); };
      k.onmouseenter = k.onfocus = () => { if (dunia.buku !== b) pratonton(b.id); };
      bekas.appendChild(k);
    }
  }
  function binaKadPemain() {
    const k = $('#kad-pemain'), pr = profilAktif();
    if (!pr) { k.innerHTML = `<button class="btn utama" data-a="profil">👤 ${esc(L('Masukkan nama kau untuk mula|Enter your name to start'))}</button>`; k.querySelector('button').onclick = () => dialogProfil({ wajib: true }); return; }
    const bk = S.terakhir && EB.BUKU.find((b) => b.id === S.terakhir), pg = bk && S.buku[bk.id];
    k.innerHTML = `<div class="pemain-chip"><i style="background:${pr.warna}">${esc(pr.nama.slice(0, 1).toUpperCase())}</i><div><b>${esc(L('Hai|Hi'))}, ${esc(pr.nama)}!</b><small>${esc(t('tahap'))} ${tahap()} · ${S.xp} XP · 🔥 ${S.siri.n || 0}</small></div><button class="btn kecil" data-a="profil">⇄ ${esc(L('Tukar|Switch'))}</button></div>
      ${bk && pg && pg.depan > 0 ? `<button class="btn utama sambung" data-a="sambung">▶ ${esc(t('sambung'))}: ${esc(bk.tajuk)} · ${esc(t('bab'))} ${Math.min(pg.depan + 1, bk.bahagian.reduce((a, bh) => a + bh.bab.length + 1, 0))}</button>` : ''}`;
    k.querySelector('[data-a=profil]').onclick = () => dialogProfil({});
    const sb = k.querySelector('[data-a=sambung]'); if (sb) sb.onclick = () => { bunyi('klik'); mulaBuku(bk.id); };
  }
  function warnakanPemain(w) {
    const u = pemain.model.userData, m = EB.mat(w);
    u.torso.material = m; u.tangan.forEach((g) => (g.children[0].material = m));
  }
  function tukarProfil(id) {
    if (P.aktif) simpan();
    P.aktif = id; tulisJSON(KUNCI_PROFIL, P);
    S = Object.assign(lalaiS(), bacaJSON(kunciData(id)) || {});
    const pr = profilAktif(); if (pr) warnakanPemain(pr.warna);
    tutupModal(); paparLayarMula();
  }
  function dialogProfil(o) {
    const pr = profilAktif();
    const senarai = o.ubah ? [] : P.senarai.slice().sort((a, b) => (b.akhir || 0) - (a.akhir || 0));
    let warna = (o.ubah && pr && pr.warna) || WARNA_PEMAIN[P.senarai.length % WARNA_PEMAIN.length];
    const p = bukaModal(`<div class="kepala-modal"><h2>👤 ${esc(o.ubah ? L('Tukar nama|Rename') : L('Siapa yang bermain?|Who’s playing?'))}</h2>${o.wajib && !P.senarai.length ? '' : '<button class="btn ikon" data-a="x">✕</button>'}</div>
      ${senarai.length ? `<div class="senarai-profil">${senarai.map((x) => `<div class="profil-baris ${x.id === P.aktif ? 'aktif' : ''}"><button class="profil" data-id="${x.id}"><i style="background:${x.warna}">${esc(x.nama.slice(0, 1).toUpperCase())}</i><span><b>${esc(x.nama)}</b><small>${x.xp || 0} XP${x.terakhir ? ' · ' + esc((EB.BUKU.find((b) => b.id === x.terakhir) || {}).tajuk || '') : ''}</small></span></button><button class="btn ikon kecil" data-padam="${x.id}" title="${esc(L('Padam|Delete'))}">🗑</button></div>`).join('')}</div><h4>${esc(L('Atau pemain baharu|Or a new player'))}</h4>` : ''}
      <label class="input-nama"><span>${esc(L('Nama pengembara|Explorer name'))}</span><input maxlength="20" placeholder="${esc(L('cth. Aisyah|e.g. Aisha'))}" value="${o.ubah && pr ? esc(pr.nama) : ''}"></label>
      <div class="pilih-warna">${WARNA_PEMAIN.map((w) => `<button data-w="${w}" style="background:${w}" class="${w === warna ? 'on' : ''}" aria-label="${w}"></button>`).join('')}</div>
      <div class="butang"><button class="btn" data-a="import">⤵ ${esc(L('Sambung dari kod|Load a code'))}</button><button class="btn utama" data-a="ok">${esc(o.ubah ? L('Simpan|Save') : L('Mula ekspedisi|Start expedition'))}</button></div>`, 'kecil');
    const inp = p.querySelector('input');
    setTimeout(() => inp.focus(), 50);
    const x = p.querySelector('[data-a=x]'); if (x) x.onclick = tutupModal;
    p.querySelectorAll('[data-w]').forEach((b) => (b.onclick = () => { warna = b.dataset.w; p.querySelectorAll('[data-w]').forEach((q) => q.classList.toggle('on', q === b)); }));
    p.querySelectorAll('[data-id]').forEach((b) => (b.onclick = () => tukarProfil(b.dataset.id)));
    p.querySelectorAll('[data-padam]').forEach((b) => (b.onclick = () => {
      const id = b.dataset.padam, sasar = P.senarai.find((q) => q.id === id);
      if (!confirm(L('Padam pemain “|Delete player “') + sasar.nama + L('” dan semua kemajuannya?|” and all their progress?'))) return;
      P.senarai = P.senarai.filter((q) => q.id !== id); try { localStorage.removeItem(kunciData(id)); } catch (e) { /* abaikan */ }
      if (P.aktif === id) { P.aktif = null; S = lalaiS(); }
      tulisJSON(KUNCI_PROFIL, P); dialogProfil(o); binaKadPemain();
    }));
    p.querySelector('[data-a=import]').onclick = dialogImport;
    const sah = () => {
      const nama = inp.value.trim().replace(/\s+/g, ' ').slice(0, 20);
      if (!nama) { inp.classList.add('ralat'); inp.focus(); return; }
      if (o.ubah && pr) { pr.nama = nama; pr.warna = warna; warnakanPemain(warna); simpan(); tutupModal(); binaKadPemain(); toast('✎ ' + nama); return; }
      const id = idBaru(); P.senarai.push({ id, nama, warna, dibuat: Date.now(), akhir: Date.now() });
      if (P.aktif) simpan();
      P.aktif = id; S = lalaiS(); simpan(); warnakanPemain(warna);
      tutupModal(); paparLayarMula(); toast('👋 ' + L('Selamat datang|Welcome') + ', ' + nama + '!');
    };
    p.querySelector('[data-a=ok]').onclick = sah;
    inp.onkeydown = (e) => { if (e.key === 'Enter') sah(); };
  }
  const kodDari = (obj) => 'EB1.' + btoa(unescape(encodeURIComponent(JSON.stringify(obj))));
  function bacaKod(teks) {
    teks = String(teks || '').trim();
    try {
      const o = teks.startsWith('EB1.') ? JSON.parse(decodeURIComponent(escape(atob(teks.slice(4).replace(/\s+/g, ''))))) : JSON.parse(teks);
      if (!o || o.format !== 'ekspedisi-buku' || !o.data || typeof o.data !== 'object') return null;
      return o;
    } catch (e) { return null; }
  }
  function dialogEksport() {
    const pr = profilAktif(); if (!pr) return;
    simpan();
    const obj = { format: 'ekspedisi-buku', v: 1, nama: pr.nama, warna: pr.warna, masa: Date.now(), data: S };
    const kod = kodDari(obj);
    const p = bukaModal(`<div class="kepala-modal"><h2>⤴ ${esc(L('Kod simpanan|Save code'))}</h2><button class="btn ikon" data-a="x">✕</button></div>
      <p class="kecil">${esc(L('Salin kod ini atau muat turun failnya. Di peranti lain, buka Tetapan → Sambung dari kod untuk meneruskan ekspedisi.|Copy this code or download the file. On another device, open Settings → Load a code to continue the expedition.'))}</p>
      <textarea class="kod" readonly>${esc(kod)}</textarea>
      <div class="butang"><button class="btn" data-a="fail">⬇ ${esc(L('Muat turun fail|Download file'))}</button><button class="btn utama" data-a="salin">📋 ${esc(L('Salin kod|Copy code'))}</button></div>`, 'kecil');
    p.querySelector('[data-a=x]').onclick = tutupModal;
    const ta = p.querySelector('textarea'); ta.onclick = () => ta.select();
    p.querySelector('[data-a=salin]').onclick = async () => {
      try { await navigator.clipboard.writeText(kod); } catch (e) { ta.select(); document.execCommand && document.execCommand('copy'); }
      toast('📋 ' + L('Kod disalin|Code copied'));
    };
    p.querySelector('[data-a=fail]').onclick = () => {
      const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(obj)], { type: 'application/json' }));
      a.download = 'ekspedisi-buku-' + pr.nama.replace(/[^\w-]+/g, '_') + '.json'; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    };
  }
  function dialogImport() {
    const p = bukaModal(`<div class="kepala-modal"><h2>⤵ ${esc(L('Sambung dari kod|Load a code'))}</h2><button class="btn ikon" data-a="x">✕</button></div>
      <p class="kecil">${esc(L('Tampal kod simpanan (bermula dengan EB1.) atau pilih fail simpanan .json.|Paste a save code (starting with EB1.) or choose a .json save file.'))}</p>
      <textarea class="kod" placeholder="EB1.…"></textarea><input type="file" accept=".json,application/json">
      <div class="butang"><button class="btn utama" data-a="ok">${esc(L('Muatkan|Load'))}</button></div>`, 'kecil');
    p.querySelector('[data-a=x]').onclick = tutupModal;
    const ta = p.querySelector('textarea');
    p.querySelector('input[type=file]').onchange = (e) => { const f = e.target.files[0]; if (!f) return; f.text().then((x) => (ta.value = x)); };
    p.querySelector('[data-a=ok]').onclick = () => {
      const o = bacaKod(ta.value);
      if (!o) { toast('⚠ ' + L('Kod tidak sah|Invalid code')); return; }
      const ada = P.senarai.find((x) => x.nama === o.nama);
      const id = ada ? ada.id : idBaru();
      if (!ada) P.senarai.push({ id, nama: String(o.nama || 'Pengembara').slice(0, 20), warna: o.warna || WARNA_PEMAIN[0], dibuat: Date.now(), akhir: Date.now() });
      tulisJSON(kunciData(id), Object.assign(lalaiS(), o.data));
      tulisJSON(KUNCI_PROFIL, P);
      tukarProfil(id);
      toast('✓ ' + L('Ekspedisi dimuatkan. Selamat kembali|Expedition loaded. Welcome back') + ', ' + o.nama + '!');
    };
  }
  function paparLayarMula() {
    layarMula = true; buangMisi();
    $('#layar-mula').hidden = false; $('#hud').hidden = true; document.body.classList.add('di-mula');
    binaKadBuku(); binaKadPemain();
    pratonton(S.terakhir || EB.BUKU[0].id);
  }
  function pratonton(id) {
    const b = EB.BUKU.find((x) => x.id === id) || EB.BUKU[0];
    muatDunia(b);
    const n = peta.nod[Math.min(prog.depan, peta.nod.length - 1)];
    teleport(n);
  }
  function muatDunia(b) {
    buangMisi();
    if (EB.kebun && buku) EB.kebun.buang(ctx);
    label.slice().forEach(buangLabel); labelNama = null;
    buku = b; prog = kemajuan(b.id);
    dunia.muat(b); peta = dunia.peta;
    dunia.selepasBina = selepasBina;
    kemaskiniHad();
  }
  function kemaskiniHad() {
    const n = peta.nod[prog.depan];
    pemain.had = n ? n.potong : Infinity;
    pasangKunci();
  }
  function mulaBuku(id) {
    const b = EB.BUKU.find((x) => x.id === id);
    layarMula = false; S.terakhir = id; simpan();
    if (dunia.buku !== b) muatDunia(b); else { buangMisi(); kemaskiniHad(); }
    $('#layar-mula').hidden = true; $('#hud').hidden = false; document.body.classList.remove('di-mula');
    const n = peta.nod[Math.min(prog.depan, peta.nod.length - 1)];
    if (prog.pos && prog.depan > 0) { pemain.letak(prog.pos[0], prog.pos[1]); if (!dunia.boleh(Math.floor(prog.pos[0]), Math.floor(prog.pos[1]), pemain.had)) teleport(n); }
    else if (prog.depan === 0) pemain.letak(dunia.mula.x, dunia.mula.z);
    else teleport(n);
    dunia.fokus.set(pemain.pos.x, 0, pemain.pos.y);
    const pr = profilAktif();
    if (labelNama) buangLabel(labelNama);
    labelNama = pr ? tambahLabel(new T.Vector3(pemain.pos.x, 1.55, pemain.pos.y), 'nama-pemain', `<span>${esc(pr.nama)}</span>`) : null;
    kemasHUD();
    if (prog.depan === 0 && !prog.dilihat) {
      prog.dilihat = true; simpan();
      const p = bukaModal(`<div class="kepala"><div class="lencana" style="background:${b.warna}">${b.ikon}</div><div><small>${esc(b.pengarang)}</small><h2>${esc(b.tajuk)}</h2></div></div>
        <p class="cerita">${esc(L(b.ringkas))}</p>${b.nota ? `<p class="nota">${esc(L(b.nota))}</p>` : ''}
        <p class="kecil">${esc(t(sentuh ? 'kawalanSentuh' : 'kawalan'))}</p><div class="butang"><button class="btn utama" data-a="x">${esc(t('mula'))} →</button></div>`);
      p.querySelector('[data-a=x]').onclick = tutupModal;
    }
  }

  /* ---------- Konfeti ---------- */
  function confetti() {
    const c = $('#konfeti'); c.innerHTML = '';
    for (let i = 0; i < 60; i++) { const s = el('i'); s.style.left = Math.random() * 100 + '%'; s.style.background = ['#ffcf3f', '#ff6b4a', '#5ee6ff', '#7cc94e', '#b28dff'][i % 5]; s.style.animationDelay = Math.random() * 0.5 + 's'; s.style.animationDuration = 1.6 + Math.random() * 1.4 + 's'; c.appendChild(s); }
    setTimeout(() => (c.innerHTML = ''), 3500);
  }

  /* ---------- Input ---------- */
  const kekunci = new Set();
  let sentuh = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  let sasaranInteraksi = null;
  function kemasInputPapan() {
    let x = 0, y = 0;
    if (kekunci.has('KeyA') || kekunci.has('ArrowLeft')) x -= 1;
    if (kekunci.has('KeyD') || kekunci.has('ArrowRight')) x += 1;
    if (kekunci.has('KeyW') || kekunci.has('ArrowUp')) y += 1;
    if (kekunci.has('KeyS') || kekunci.has('ArrowDown')) y -= 1;
    if (!joy.aktif) pemain.input.set(x, y);
    pemain.lari = kekunci.has('ShiftLeft') || kekunci.has('ShiftRight');
  }
  function tanahDariSkrin(cx, cy) {
    const r = dunia.kanvas.getBoundingClientRect();
    const v = new T.Vector3(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1, 0.5).unproject(dunia.kamera);
    const o = dunia.kamera.position, d = v.sub(o).normalize();
    if (Math.abs(d.y) < 1e-4) return null;
    const tt = -o.y / d.y; if (tt < 0) return null;
    return { x: o.x + d.x * tt, z: o.z + d.z * tt };
  }
  function senaraiInteraksi() {
    const s = [];
    for (const [, b] of dunia.baris) for (const p of b.npc || []) if (p.nod !== undefined) s.push({ x: p.pos.x, z: p.pos.y, jenis: 'nod', nod: peta.nod[p.nod] });
    if (EB.kebun && !layarMula) for (const it of EB.kebun.interaksi(ctx)) s.push({ x: it.x, z: it.z, jenis: 'misi', f: it.f, label: it.label });
    if (misi && misi.fasa === 'cari') { const h = EB.MISI[misi.jenis]; if (h.interaksi) for (const it of h.interaksi(ctx, misi)) s.push({ x: it.x, z: it.z, jenis: 'misi', f: it.f, label: it.label }); }
    return s;
  }
  function klikTanah(cx, cy) {
    if (modalTerbuka || layarMula) return;
    const g = tanahDariSkrin(cx, cy); if (!g) return;
    let sasar = null;
    for (const s of senaraiInteraksi()) if (Math.hypot(s.x - g.x, s.z - g.z) < 1.3) sasar = s;
    sasaranInteraksi = sasar;
    if (sasar) {
      const dx = pemain.pos.x - sasar.x, dz = pemain.pos.y - sasar.z, d = Math.hypot(dx, dz) || 1;
      if (d < 1.8) { interaksi(sasar); sasaranInteraksi = null; return; }
      pemain.pergiKe(sasar.x + (dx / d) * 1.0, sasar.z + (dz / d) * 1.0);
    } else pemain.pergiKe(g.x, g.z);
  }
  function interaksi(s) {
    if (s.jenis === 'nod') bercakapNod(s.nod);
    else if (s.jenis === 'misi') s.f();
  }
  function terdekat() {
    let best = null, dm = 1.9;
    for (const s of senaraiInteraksi()) { const d = Math.hypot(s.x - pemain.pos.x, s.z - pemain.pos.y); if (d < dm) { dm = d; best = s; } }
    return best;
  }
  const joy = { aktif: false, id: null, ox: 0, oy: 0 };
  function pasangInput() {
    const kv = dunia.kanvas;
    addEventListener('keydown', (e) => {
      if (layarMula) return;
      if (e.code === 'Escape' && modalTerbuka) { clearInterval(pemasa); tutupModal(); return; }
      if (modalTerbuka) return;
      kekunci.add(e.code); kemasInputPapan();
      if (e.code === 'KeyF' || e.code === 'Space' || e.code === 'Enter') { const s = terdekat(); if (s) { e.preventDefault(); interaksi(s); } }
      if (e.code === 'KeyQ') dunia.pusingKamera(-Math.PI / 4);
      if (e.code === 'KeyE') dunia.pusingKamera(Math.PI / 4);
      if (e.code === 'KeyM') paparPeta();
      if (e.code === 'KeyR' && misi && EB.MISI[misi.jenis].reset) EB.MISI[misi.jenis].reset(ctx, misi);
      if (e.code === 'KeyK') paparAlbum();
      if (e.code === 'Equal' || e.code === 'NumpadAdd') dunia.zum(0.85);
      if (e.code === 'Minus' || e.code === 'NumpadSubtract') dunia.zum(1.18);
      if (e.code.startsWith('Arrow') || e.code === 'Space') e.preventDefault();
    });
    addEventListener('keyup', (e) => { kekunci.delete(e.code); kemasInputPapan(); });
    addEventListener('blur', () => { kekunci.clear(); kemasInputPapan(); });
    kv.addEventListener('wheel', (e) => { e.preventDefault(); dunia.zum(e.deltaY > 0 ? 1.1 : 0.9); }, { passive: false });
    kv.addEventListener('contextmenu', (e) => e.preventDefault());
    // tetikus: klik kiri/kanan = jalan; seret kanan/tengah = pusing kamera
    let seret = null;
    kv.addEventListener('mousedown', (e) => { seret = { x: e.clientX, y: e.clientY, b: e.button, gerak: 0 }; });
    addEventListener('mousemove', (e) => { if (!seret) return; const dx = e.clientX - seret.x; seret.gerak += Math.abs(dx) + Math.abs(e.clientY - seret.y); if (seret.b !== 0 || seret.gerak > 12) { if (seret.b !== 0) dunia.pusingKamera(-dx * 0.006); } seret.x = e.clientX; seret.y = e.clientY; });
    addEventListener('mouseup', (e) => { if (seret && seret.gerak < 8 && !sentuh) klikTanah(e.clientX, e.clientY); seret = null; });
    // sentuhan
    const touches = new Map(); let pinch = null;
    const knob = $('#joy-knob'), joyEl = $('#joy');
    kv.addEventListener('touchstart', (e) => {
      e.preventDefault();
      for (const tc of e.changedTouches) touches.set(tc.identifier, { x0: tc.clientX, y0: tc.clientY, x: tc.clientX, y: tc.clientY, t0: performance.now(), kiri: tc.clientX < innerWidth * 0.45 });
      if (touches.size === 2) { const [a, b] = [...touches.values()]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y) }; if (joy.aktif) lepasJoy(); }
    }, { passive: false });
    kv.addEventListener('touchmove', (e) => {
      e.preventDefault();
      for (const tc of e.changedTouches) {
        const s = touches.get(tc.identifier); if (!s) continue;
        const dx = tc.clientX - s.x; s.x = tc.clientX; s.y = tc.clientY;
        if (pinch && touches.size >= 2) { const [a, b] = [...touches.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y); dunia.zum(pinch.d / d); pinch.d = d; continue; }
        const jauh = Math.hypot(s.x - s.x0, s.y - s.y0);
        if (s.kiri && !modalTerbuka && !layarMula) {
          if (!joy.aktif && jauh > 10) { joy.aktif = true; joy.id = tc.identifier; joy.ox = s.x0; joy.oy = s.y0; joyEl.style.left = s.x0 + 'px'; joyEl.style.top = s.y0 + 'px'; joyEl.classList.add('aktif'); pemain.berhenti(); }
          if (joy.aktif && joy.id === tc.identifier) { let jx = (s.x - joy.ox) / 55, jy = (s.y - joy.oy) / 55; const m = Math.hypot(jx, jy); if (m > 1.2) { jx *= 1.2 / m; jy *= 1.2 / m; } knob.style.transform = `translate(${jx * 40}px, ${jy * 40}px)`; pemain.input.set(jx, -jy); }
        } else if (!s.kiri && jauh > 10) dunia.pusingKamera(-dx * 0.008);
      }
    }, { passive: false });
    const lepasJoy = () => { joy.aktif = false; joy.id = null; pemain.input.set(0, 0); knob.style.transform = ''; joyEl.classList.remove('aktif'); };
    const tamat = (e) => {
      for (const tc of e.changedTouches) {
        const s = touches.get(tc.identifier); touches.delete(tc.identifier);
        if (joy.aktif && joy.id === tc.identifier) lepasJoy();
        else if (s && !pinch && Math.hypot(s.x - s.x0, s.y - s.y0) < 10 && performance.now() - s.t0 < 400) klikTanah(tc.clientX, tc.clientY);
      }
      if (touches.size < 2) pinch = null;
    };
    kv.addEventListener('touchend', tamat); kv.addEventListener('touchcancel', tamat);
    $('#tracker').addEventListener('click', (e) => { if (e.target.closest('[data-a=reset]') && misi && EB.MISI[misi.jenis].reset) EB.MISI[misi.jenis].reset(ctx, misi); });
    $('#btn-tindakan').onclick = () => { const s = terdekat(); if (s) interaksi(s); };
    $('#btn-peta').onclick = paparPeta; $('#btn-album').onclick = () => paparAlbum(); $('#btn-tetapan').onclick = paparTetapan;
    $('#btn-kiri').onclick = () => dunia.pusingKamera(-Math.PI / 4); $('#btn-kanan').onclick = () => dunia.pusingKamera(Math.PI / 4);
    $('#btn-bahasa').onclick = () => { G.bahasa = G.bahasa === 'bm' ? 'en' : 'bm'; simpanG(); terjemah(); };
    $('#modal').addEventListener('click', (e) => { if (e.target.id === 'modal' && !e.target.classList.contains('kuiz') && !e.target.classList.contains('tahniah-modal')) tutupModal(); });
    addEventListener('resize', () => dunia.saizSemula());
  }

  /* ---------- Gelung utama ---------- */
  let tLepas = performance.now(), tSimpan = 0, tHUD = 0;
  const arah = { el: null };
  function gelung(now) {
    requestAnimationFrame(gelung);
    const dt = Math.min(0.05, (now - tLepas) / 1000); tLepas = now;
    const tm = now / 1000;
    if (layarMula) {
      dunia.pusingKamera(dt * 0.08);
      dunia.pastikanBaris(Math.floor(pemain.pos.y / EB.SUSUN.D), Math.floor((isFinite(pemain.had) ? pemain.had : 1e6) / 1000));
      pemain.kemaskini(dt, tm);
      dunia.kemaskini(dt, { x: pemain.pos.x, z: pemain.pos.y });
      for (const [, b] of dunia.baris) for (const p of b.npc || []) p.kemaskini(dt, tm, pemain);
      kemasLabel();
      return;
    }
    pemain.kemaskini(dt, tm);
    const nd = peta.nod[prog.depan], rP = Math.floor(pemain.pos.y / EB.SUSUN.D), rMaks = nd && isFinite(nd.potong) ? Math.floor(nd.potong / 1000) : peta.baris.length;
    dunia.pastikanBaris(rP, rMaks);
    for (const [, b] of dunia.baris) for (const p of b.npc || []) p.kemaskini(dt, tm, pemain);
    // misi
    if (misi) {
      const m = misi, h = EB.MISI[m.jenis];
      for (const p of m.npc) if (!p.urusSendiri && m.pencuri !== p) p.kemaskini(dt, tm, pemain);
      if (h.kemas) h.kemas(ctx, m, dt, tm);
    }
    // interaksi automatik selepas klik pada NPC
    if (sasaranInteraksi && !pemain.laluan && !modalTerbuka) { const s = sasaranInteraksi; sasaranInteraksi = null; if (Math.hypot(s.x - pemain.pos.x, s.z - pemain.pos.y) < 2.2) interaksi(s); }
    const dekat = !modalTerbuka && terdekat();
    const bt = $('#btn-tindakan'); bt.hidden = !dekat;
    if (dekat) bt.querySelector('span').textContent = dekat.jenis === 'nod' ? (keadaanNod(dekat.nod) === 'kunci' ? '🔒' : t('bercakap')) : (dekat.label || t('bercakap'));
    dunia.kemaskini(dt, { x: pemain.pos.x, z: pemain.pos.y }, pemain.vel ? { x: pemain.vel.x, z: pemain.vel.y } : null);
    if (labelNama) labelNama.pos.set(pemain.pos.x, 1.55, pemain.pos.y);
    kemasLabel();
    kemasArah();
    tHUD += dt; if (tHUD > 1) {
      tHUD = 0; kemasTracker(); if (S.nyawa < 5) kemasHUD();
      if (EB.kebun) { const k = EB.kebun.rekod(ctx); if (k && dunia.baris.has(Math.floor(k.z / EB.SUSUN.D))) EB.kebun.bina(ctx); else if (EB.kebun.g) EB.kebun.buang(ctx); }
    }
    tSimpan += dt; if (tSimpan > 5) { tSimpan = 0; prog.pos = [+pemain.pos.x.toFixed(2), +pemain.pos.y.toFixed(2)]; simpan(); }
  }
  // anak panah penunjuk arah objektif di tepi skrin
  function kemasArah() {
    const a = $('#arah');
    let sx, sz;
    if (misi && misi.fasa === 'cari') { const h = EB.MISI[misi.jenis], q = h.sasaran && h.sasaran(ctx, misi); if (q) { sx = q.x; sz = q.z; } }
    else if (!misi && EB.kebun && EB.kebun.sasaran(ctx)) { const q = EB.kebun.sasaran(ctx); sx = q.x; sz = q.z; }
    else { const n = peta.nod[misi ? misi.nod : prog.depan]; if (n && n.npcPos) { sx = n.npcPos.x; sz = n.npcPos.z; } else if (n) { sx = n.x; sz = n.zNpc; } }
    if (sx === undefined) { a.hidden = true; return; }
    _p.set(sx, 1, sz).project(dunia.kamera);
    const dalam = _p.z < 1 && Math.abs(_p.x) < 0.9 && Math.abs(_p.y) < 0.85;
    if (dalam) { a.hidden = true; return; }
    a.hidden = false;
    let x = _p.x, y = _p.y; if (_p.z > 1) { x = -x; y = -y; }
    const ang = Math.atan2(-y, x), w = innerWidth, h = innerHeight;
    const m = Math.min((w / 2 - 40) / Math.abs(Math.cos(ang) || 1e-3), (h / 2 - 60) / Math.abs(Math.sin(ang) || 1e-3));
    a.style.transform = `translate(${w / 2 + Math.cos(ang) * m}px, ${h / 2 + Math.sin(ang) * m}px) rotate(${ang}rad)`;
    a.querySelector('b').textContent = Math.round(Math.hypot(sx - pemain.pos.x, sz - pemain.pos.y)) + 'm';
    a.querySelector('b').style.transform = `rotate(${-ang}rad)`;
  }

  /* ---------- Mula ---------- */
  EB.mula = function () {
    muatS();
    if (!EB.BUKU.length) return;
    dunia = new EB.Dunia($('#kanvas'));
    const kecil = Math.min(innerWidth, innerHeight) < 700 && sentuh;
    dunia.kualiti(G.kualiti || (kecil ? 'sederhana' : 'tinggi'));
    const buangAsal = dunia.buang.bind(dunia);
    dunia.buang = (b) => { selepasBuang(b); buangAsal(b); };
    pemain = new EB.Pemain(dunia);
    if (profilAktif()) warnakanPemain(profilAktif().warna);
    document.body.classList.toggle('sentuh', sentuh);
    const simpanSekarang = () => { if (prog && !layarMula && pemain) prog.pos = [+pemain.pos.x.toFixed(2), +pemain.pos.y.toFixed(2)]; simpan(); };
    addEventListener('pagehide', simpanSekarang);
    document.addEventListener('visibilitychange', () => { if (document.hidden) simpanSekarang(); });
    pasangInput();
    terjemah();
    paparLayarMula();
    if (!profilAktif()) setTimeout(() => dialogProfil({ wajib: true }), 300);
    // panaskan baris pertama sebelum gelung
    for (let i = 0; i < 3; i++) dunia.pastikanBaris(Math.floor(pemain.pos.y / EB.SUSUN.D), 1e3);
    $('#memuat').remove();
    requestAnimationFrame(gelung);
    EB._uji = { get S() { return S; }, get P() { return P; }, dialogProfil, dialogEksport, dialogImport, bacaKod, tukarProfil, get misi() { return misi; }, get peta() { return peta; }, get prog() { return prog; }, pemain, dunia, ctx, mulaBuku, bercakapNod, mulaMisi, teleport, mulaCabaran, paparAlbum, paparPeta, tutupModal };
  };
})();
