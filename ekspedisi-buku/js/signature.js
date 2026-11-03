/* Ekspedisi Buku · Misi signature setiap buku.
   Setiap misi diikat pada satu bab melalui EB.SIGNATURE (kunci "indeksBahagian-indeksBab").
   Antara muka sama seperti misi.js. NPC yang digerakkan sendiri ditanda urusSendiri. */
(function () {
  const EB = (window.EB = window.EB || {});
  const T = THREE;
  const M = EB.MISI;
  const D = () => EB.SUSUN.D;
  const jarak = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
  const pem = (c) => ({ x: c.pemain.pos.x, z: c.pemain.pos.y });

  EB.SIGNATURE = {
    'atomic-habits': { '0-1': 'kebun', '1-2': 'rumah', '4-1': 'rantaian' },
    'art-of-thinking-clearly': { '0-0': 'kubur', '2-8': 'rolet', '2-9': 'sauh', '8-7': 'gorila' },
    'clear-thinking': { '0-2': 'detik', '2-1': 'halt', '3-4': 'meriam' },
    'trust-me-im-lying': { '0-1': 'sumber', '1-5': 'beritaBilik', '3-0': 'pembetulan' },
    'analisis-kitab-nifaq': { '0-5': 'cermin', '2-4': 'lahn', '3-4': 'dhirar' },
  };
  EB.NAMA_SIGNATURE = {
    kebun: '🌱 Kebun 1%|🌱 The 1% Garden', rumah: '🏠 Rumah Persekitaran|🏠 Environment House', rantaian: '🪨 Rantaian Tabiat|🪨 Habit Chain',
    kubur: '🪦 Kubur Kegagalan|🪦 Graveyard of Failure', rolet: '🎡 Roda Rolet|🎡 Roulette Wheel', sauh: '⚓ Pasar Sauh|⚓ Anchor Market', gorila: '🦍 Gorila Tersembunyi|🦍 The Hidden Gorilla',
    detik: '⏸ Detik Biasa|⏸ Ordinary Moment', halt: '🍲 HALT|🍲 HALT', meriam: '💣 Peluru sebelum Meriam|💣 Bullets before Cannonballs',
    sumber: '🔗 Jejak Rantaian|🔗 Trace the Chain', beritaBilik: '📰 Bilik Berita|📰 Newsroom', pembetulan: '🔥 Pembetulan|🔥 The Correction',
    cermin: '🪞 Cermin Muhasabah|🪞 Mirror of Reflection', lahn: '🗣 Lahn al-Qaul|🗣 Lahn al-Qawl', dhirar: '🕌 Masjid Dhirar|🕌 Masjid al-Dirar',
  };

  /* ---------- Alat ---------- */
  function npc(c, m, x, z, opsi, rnd) {
    const p = new EB.Penduduk(c.dunia, x, z, rnd || Math.random, Object.assign({ statik: true }, opsi || {}));
    c.dunia.scene.add(p.model); m.npc.push(p); return p;
  }
  function lbl(c, m, x, y, z, html, kelas) { const l = c.tambahLabel(new T.Vector3(x, y, z), kelas || 'misi', html); m.label.push(l); return l; }
  function mesh(c, m, nama, hex, sx, sy, sz, x, y, z, emis) {
    const o = new T.Mesh(EB.tpl()[nama], EB.mat(hex, emis)); o.scale.set(sx, sy, sz); o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true;
    c.dunia.scene.add(o); m.obj.push(o); return o;
  }
  function kumpulan(c, m, x, z) { const g = new T.Group(); g.position.set(x, 0, z); c.dunia.scene.add(g); m.obj.push(g); return g; }
  function tambahKe(g, nama, hex, sx, sy, sz, x, y, z, emis) { const o = new T.Mesh(EB.tpl()[nama], EB.mat(hex, emis)); o.scale.set(sx, sy, sz); o.position.set(x, y, z); o.castShadow = true; g.add(o); return o; }
  function gerai(c, m, x, z, warna) {
    const g = kumpulan(c, m, x, z);
    tambahKe(g, 'kotak', '#b98552', 1.4, 0.5, 0.8, 0, 0, 0);
    for (const [a, b] of [[-0.65, -0.35], [0.65, -0.35], [-0.65, 0.35], [0.65, 0.35]]) tambahKe(g, 'kotak', '#7a4f33', 0.07, 1.25, 0.07, a, 0, b);
    for (let i = 0; i < 4; i++) tambahKe(g, 'kotak', i % 2 ? '#ffffff' : warna, 0.36, 0.05, 1.0, -0.54 + i * 0.36, 1.25, 0);
    return g;
  }
  // NPC bergerak sendiri mengikut laluan A*
  function arahKe(c, p, ke, laju) {
    const boleh = (a, b) => c.dunia.boleh(a, b);
    const j = EB.cariLaluan(boleh, p.pos.x, p.pos.y, ke.x, ke.z, 3000);
    p.laluanG = j ? EB.licinkan(boleh, j) : [[ke.x, ke.z]]; p.lajuG = laju || 1.6; p.urusSendiri = true;
  }
  function gerak(p, dt, tm) {
    let v = 0;
    if (p.laluanG && p.laluanG.length) {
      const [wx, wz] = p.laluanG[0], dx = wx - p.pos.x, dz = wz - p.pos.y, dd = Math.hypot(dx, dz);
      if (dd < 0.2) p.laluanG.shift();
      else {
        v = p.lajuG; p.pos.x += (dx / dd) * v * dt; p.pos.y += (dz / dd) * v * dt;
        let b = Math.atan2(dx, dz) - p.yaw; while (b > Math.PI) b -= Math.PI * 2; while (b < -Math.PI) b += Math.PI * 2; p.yaw += b * Math.min(1, dt * 8);
      }
    }
    p.laju += (v - p.laju) * Math.min(1, dt * 6);
    p.model.position.set(p.pos.x, 0, p.pos.y); p.model.rotation.y = p.yaw;
    EB.animasiWatak(p.model, p.laju, dt, tm, 0);
  }
  // titik tebing sungai terdekat (sel boleh lalu yang bersebelahan air)
  function tebing(c, m, n) {
    const d = c.dunia, had = c.had(m), z = n.r * D() + 3;
    let best = null, dm = 1e9;
    for (let x = 1; x < EB.SUSUN.W - 1; x++) {
      if (!d.boleh(x, z, had) || d.grid.dapat(x, z - 1) !== EB.SEL.AIR) continue;
      const dd = Math.abs(x + 0.5 - n.x);
      if (dd < dm && EB.cariLaluan((a, b) => d.boleh(a, b, had), n.npcPos.x, n.npcPos.z, x + 0.5, z + 0.5, 3000)) { dm = dd; best = { x: x + 0.5, z: z + 0.5 }; }
    }
    return best;
  }
  const modalPilih = (c, html, pilihan, cb, kelas) => {
    const p = c.bukaModal(html + `<div class="pilihan">${pilihan.map((o, i) => `<button class="opsyen" data-i="${i}"><b>${'ABCD'[i]}</b><span>${c.esc(c.L(o))}</span></button>`).join('')}</div><div class="maklum" hidden></div>`, kelas || 'kecil');
    p.querySelectorAll('.opsyen').forEach((b) => (b.onclick = () => { p.querySelectorAll('.opsyen').forEach((x) => (x.disabled = true)); cb(+b.dataset.i, p); }));
    return p;
  };
  const maklum = (c, p, ok, teks, butang, cb) => {
    const mk = p.querySelector('.maklum'); mk.hidden = false;
    mk.innerHTML = `<b class="${ok ? 'ok' : 'x'}">${c.esc(ok ? c.t('betul') : c.t('salah'))}</b><p>${c.esc(c.L(teks))}</p><button class="btn utama" data-a="n">${c.esc(butang || c.t('seterusnya'))}</button>`;
    mk.querySelector('[data-a=n]').onclick = () => { c.tutupModal(); cb && cb(); };
  };

  /* ================= ATOMIC HABITS ================= */

  // Kebun 1%: tanam, ceduk air, siram. Pokok kekal dan tumbuh setiap hari dunia nyata.
  const hariIni = () => new Date().toISOString().slice(0, 10);
  const beza = (a, b) => Math.round((new Date(b) - new Date(a)) / 864e5);
  function rantaiKebun(k) {
    if (!k || !k.hari.length) return 0;
    const h = k.hari.slice().sort(); let n = 1;
    for (let i = h.length - 1; i > 0; i--) { if (beza(h[i - 1], h[i]) <= 2) n++; else break; }
    if (beza(h[h.length - 1], hariIni()) > 2) return 0; // layu: terlepas dua hari
    return n;
  }
  EB.rantaiKebun = rantaiKebun;
  M.kebun = {
    objektif: 'Tanam benih di tapak 🌱, ceduk air di tebing sungai 🪣, kemudian siram. Pokok ini tumbuh setiap hari kau kembali menyiramnya (hari sebenar) dan berbuah selepas 7 hari. Terlepas dua hari berturut-turut, ia layu.|Plant the seed at the plot 🌱, scoop water at the riverbank 🪣, then water it. The tree grows each real day you come back to water it and fruits after 7 days. Miss two days in a row and it wilts.',
    mula(c, m, n) {
      const tp = c.calon(m, n, 1, 3, 5.5, 0, n.npcPos)[0], sg = tebing(c, m, n);
      if (!tp || !sg) return false;
      m.tp = tp; m.sg = sg; m.langkah = 0;
      m.tanah = mesh(c, m, 'silinder', '#7a5232', 0.55, 0.12, 0.55, tp.x, 0, tp.z);
      m.lTp = lbl(c, m, tp.x, 1.0, tp.z, '<i>🌱</i>'); m.lSg = lbl(c, m, sg.x, 1.0, sg.z, '<i>🪣</i>'); m.lSg.e.style.opacity = 0.35;
      return true;
    },
    langkah(c, m) {
      if (m.langkah === 0) {
        m.langkah = 1; c.bunyi('ambil'); m.lTp.e.style.opacity = 0.35; m.lSg.e.style.opacity = 1;
        mesh(c, m, 'bola0', '#5a3b22', 0.18, 0.1, 0.18, m.tp.x, 0.12, m.tp.z);
        c.serpihan(c.nod(m).bab.titik[0], '🌰', c.L('Benih ditanam|Seed planted'));
      } else if (m.langkah === 1) {
        m.langkah = 2; c.bunyi('percik'); m.lSg.e.style.opacity = 0.35; m.lTp.e.style.opacity = 1;
        m.baldi = new T.Mesh(EB.tpl().silinder, EB.mat('#7d8fa6')); m.baldi.scale.set(0.12, 0.18, 0.12); m.baldi.position.set(0.28, 0.3, 0.05); c.pemain.model.userData.badan.add(m.baldi);
        c.serpihan(c.nod(m).bab.titik[1], '🪣', c.L('Air diceduk|Water scooped'));
      } else if (m.langkah === 2) {
        if (m.baldi && m.baldi.parent) m.baldi.parent.remove(m.baldi);
        const k = (c.S.kebun = c.S.kebun || {})[c.buku.id] = { x: m.tp.x, z: m.tp.z, sx: m.sg.x, sz: m.sg.z, hari: [hariIni()], buah: false };
        c.simpan(); m.langkah = 3; c.bunyi('buka');
        c.serpihan(c.L('Hari 1 / 7. Tiada apa yang kelihatan di atas tanah, tetapi akarnya sedang tumbuh. Inilah Dataran Potensi Terpendam: kerja kau terkumpul sebelum hasil nampak. Kembali setiap hari untuk menyiramnya.|Day 1 / 7. Nothing shows above ground, but the roots are growing. This is the Plateau of Latent Potential: your work accumulates before results show. Come back every day to water it.') + '\n\n' + c.L(c.nod(m).bab.titik[2]), '💧', c.L('Disiram|Watered'), () => { EB.kebun.bina(c, true); c.siap(); });
      }
    },
    interaksi(c, m) {
      if (m.langkah === 0 || m.langkah === 2) return [{ x: m.tp.x, z: m.tp.z, label: c.L(m.langkah ? 'Siram|Water' : 'Tanam|Plant'), f: () => this.langkah(c, m) }];
      if (m.langkah === 1) return [{ x: m.sg.x, z: m.sg.z, label: c.L('Ceduk air|Scoop water'), f: () => this.langkah(c, m) }];
      return [];
    },
    sasaran(c, m) { return m.langkah === 1 ? m.sg : m.langkah < 3 ? m.tp : null; },
    kemajuan(c, m) { return ['🌰 ' + c.L('Tanam benih|Plant the seed'), '🪣 ' + c.L('Ceduk air|Scoop water'), '💧 ' + c.L('Siram pokok|Water the tree'), '✓'][m.langkah]; },
    buang(c, m) { if (m.baldi && m.baldi.parent) m.baldi.parent.remove(m.baldi); },
  };
  // Pokok kekal di dunia Atomic Habits (di luar misi)
  EB.kebun = {
    g: null, bawa: false,
    rekod(c) { return c.S.kebun && c.S.kebun[c.buku.id]; },
    bina(c, paksa) {
      const k = this.rekod(c); if (!k) return;
      if (this.g && !paksa) return;
      this.buang(c);
      const g = (this.g = new T.Group()); g.position.set(k.x, 0, k.z); c.dunia.scene.add(g);
      const tanah = new T.Mesh(EB.tpl().silinder, EB.mat('#7a5232')); tanah.scale.set(0.55, 0.12, 0.55); g.add(tanah);
      const n = rantaiKebun(k), s = n <= 3 ? 0.05 + n * 0.04 : 0.2 + (n - 3) * 0.2;
      const bt = new T.Mesh(EB.tpl().batang, EB.mat('#8a5a3b')); bt.scale.set(0.1 * s * 2 + 0.03, s * 1.6, 0.1 * s * 2 + 0.03); bt.position.y = 0.1; g.add(bt);
      const dn = new T.Mesh(EB.tpl().bola, EB.mat(n ? '#6fbf4a' : '#8a6a44')); dn.scale.setScalar(Math.max(0.08, s * 0.9)); dn.position.y = 0.1 + s * 1.6; g.add(dn);
      if (n >= 7) for (let i = 0; i < 5; i++) { const b = new T.Mesh(EB.tpl().bola0, EB.mat('#e63946', 0.2)); b.scale.setScalar(0.12); const a = i * 1.26; b.position.set(Math.cos(a) * s * 0.7, 0.1 + s * 1.5 + Math.sin(i) * 0.2, Math.sin(a) * s * 0.7); g.add(b); }
      [...g.children].forEach((o) => (o.castShadow = true));
      const sudah = k.hari.includes(hariIni());
      this.l = c.tambahLabel(new T.Vector3(k.x, 0.6 + s * 2.2, k.z), 'misi kebun', `<i>${n >= 7 ? '🍎' : '🌱'}</i><span>${c.L('Hari|Day')} ${Math.min(n, 7)}/7${sudah ? ' ✓' : ''}</span>`);
    },
    buang(c) { if (this.g) c.dunia.scene.remove(this.g); this.g = null; if (this.l) c.buangLabel(this.l); this.l = null; if (this.baldi && this.baldi.parent) this.baldi.parent.remove(this.baldi); this.bawa = false; },
    interaksi(c) {
      const k = this.rekod(c); if (!k || k.hari.includes(hariIni())) return [];
      if (c.misiAktif && c.misiAktif.jenis === 'kebun') return [];
      return this.bawa ? [{ x: k.x, z: k.z, label: c.L('Siram|Water'), f: () => this.siram(c) }] : [{ x: k.sx, z: k.sz, label: c.L('Ceduk air|Scoop water'), f: () => this.ceduk(c) }];
    },
    ceduk(c) { this.bawa = true; c.bunyi('percik'); this.baldi = new T.Mesh(EB.tpl().silinder, EB.mat('#7d8fa6')); this.baldi.scale.set(0.12, 0.18, 0.12); this.baldi.position.set(0.28, 0.3, 0.05); c.pemain.model.userData.badan.add(this.baldi); c.toast('🪣 ' + c.L('Bawa air ke pokok 1% kau.|Carry the water to your 1% tree.')); },
    siram(c) {
      const k = this.rekod(c), sebelum = rantaiKebun(k);
      if (sebelum === 0 && k.hari.length) k.hari = []; // layu → mula semula
      k.hari.push(hariIni()); this.bawa = false; if (this.baldi && this.baldi.parent) this.baldi.parent.remove(this.baldi);
      const n = rantaiKebun(k); c.bunyi(n >= 7 ? 'tamat' : 'betul'); c.tambahXP(10);
      if (n >= 7 && !k.buah) { k.buah = true; c.tambahXP(100); }
      c.simpan(); this.bina(c, true);
      c.toast(n >= 7 ? '🍎 ' + c.L('Pokok 1% kau berbuah! +100 XP. Kompaun yang lambat, akhirnya meletup.|Your 1% tree bears fruit! +100 XP. Slow compounding finally breaks through.')
        : sebelum === 0 && n === 1 && k.hari.length === 1 ? '🥀 ' + c.L('Pokok layu kerana terlepas dua hari. Mula semula: Hari 1/7.|The tree wilted after two missed days. Restart: Day 1/7.')
        : '💧 ' + c.L('Hari|Day') + ` ${n}/7`);
    },
    sasaran(c) { const k = this.rekod(c); if (!k || k.hari.includes(hariIni())) return null; return this.bawa ? { x: k.x, z: k.z } : null; },
  };

  // Rumah Persekitaran: susun barang supaya tabiat baik paling mudah dicapai
  const BARANG = [
    { i: '🎸', n: 'Gitar|Guitar', baik: true, buat: 'berlatih gitar 20 minit|practices guitar for 20 minutes' },
    { i: '📚', n: 'Buku|Book', baik: true, buat: 'membaca beberapa bab|reads a few chapters' },
    { i: '🍎', n: 'Buah|Fruit', baik: true, buat: 'makan buah sebagai snek|snacks on fruit' },
    { i: '👟', n: 'Kasut larian|Running shoes', baik: true, buat: 'keluar berjoging|goes for a jog' },
    { i: '📺', n: 'TV|TV', baik: false, buat: 'menonton TV berjam-jam|watches TV for hours' },
    { i: '🍩', n: 'Donat|Donuts', baik: false, buat: 'makan donat sekotak|eats a box of donuts' },
    { i: '📱', n: 'Telefon|Phone', baik: false, buat: 'membelek media sosial tanpa henti|scrolls social media endlessly' },
    { i: '🎮', n: 'Konsol permainan|Game console', baik: false, buat: 'bermain game sehingga lewat malam|games until late at night' },
  ];
  M.rumah = {
    objektif: 'Masuk ke rumah Mak Cik Sari 🏠 dan susun semula barangnya: letak yang membina tabiat baik di depan mata, sorok yang buruk dalam almari. Kemudian lihat dia “hidup sehari” mengikut susunan kau.|Enter Auntie Sari’s house 🏠 and rearrange her things: put good-habit items in plain sight and hide the bad ones in the cupboard. Then watch her “live a day” with your layout.',
    mula(c, m, n) {
      const p = c.calon(m, n, 1, 5, 9, 0, n.npcPos)[0]; if (!p) return false;
      m.p = p; m.sari = npc(c, m, p.x, p.z, { topi: 'tudung', warnaTudung: '#e76f51', baju: '#f4a261' });
      m.l = lbl(c, m, p.x, 1.7, p.z, `<i>🏠</i><span>${c.esc(c.L('Mak Cik Sari|Auntie Sari'))}</span>`);
      m.depan = new Set([4, 5, 6, 7]); // susunan asal: semua godaan di depan mata
      return true;
    },
    bilik(c, m) {
      const btn = (k) => `<button class="barang ${m.depan.has(k) ? 'depan' : 'sorok'}" data-k="${k}"><span>${BARANG[k].i}</span>${c.esc(c.L(BARANG[k].n))}</button>`;
      const semua = BARANG.map((_, k) => k);
      const p = c.bukaModal(`<h2>🏠 ${c.esc(c.L('Bilik Mak Cik Sari|Auntie Sari’s Room'))}</h2>
        <p class="kecil">${c.esc(c.L('Ketik barang untuk memindahkannya. Mak Cik Sari akan mencapai apa sahaja yang paling mudah dilihat.|Tap an item to move it. Auntie Sari will reach for whatever is easiest to see.'))}</p>
        <div class="zon"><h4>👀 ${c.esc(c.L('Di depan mata (tengah bilik, atas meja)|In plain sight (middle of room, on the table)'))}</h4><div class="rak">${semua.filter((k) => m.depan.has(k)).map(btn).join('')}</div></div>
        <div class="zon sorok"><h4>🚪 ${c.esc(c.L('Disorok dalam almari|Hidden in the cupboard'))}</h4><div class="rak">${semua.filter((k) => !m.depan.has(k)).map(btn).join('')}</div></div>
        <div class="butang"><button class="btn" data-a="x">${c.esc(c.t('tutup'))}</button><button class="btn utama" data-a="hidup">☀ ${c.esc(c.L('Biar dia hidup sehari|Let her live a day'))}</button></div>`, 'kecil');
      p.querySelectorAll('[data-k]').forEach((b) => (b.onclick = () => { const k = +b.dataset.k; if (m.depan.has(k)) m.depan.delete(k); else m.depan.add(k); this.bilik(c, m); }));
      p.querySelector('[data-a=x]').onclick = c.tutupModal;
      p.querySelector('[data-a=hidup]').onclick = () => this.hidup(c, m);
    },
    hidup(c, m) {
      const rnd = c.rnd(m, 71 + m.penalti * 13), slot = ['07:00', '10:00', '13:00', '16:00', '19:00', '22:00'];
      const depan = [...m.depan], sorok = BARANG.map((_, k) => k).filter((k) => !m.depan.has(k));
      let baik = 0;
      const log = slot.map((s) => {
        const dari = depan.length ? depan : sorok; // di luar pandangan, di luar fikiran
        const k = dari[(rnd() * dari.length) | 0], b = BARANG[k]; if (b.baik) baik++;
        return `<li class="${b.baik ? 'ok' : 'x'}"><b>${s}</b> ${b.i} ${c.esc(c.L('Dia|She'))} ${c.esc(c.L(b.buat))}</li>`;
      });
      const lulus = baik >= 5;
      const p = c.bukaModal(`<h2>☀ ${c.esc(c.L('Sehari Mak Cik Sari|Auntie Sari’s Day'))}</h2><ul class="log-hari">${log.join('')}</ul>
        <p class="skor">${baik} / 6 ${c.esc(c.L('tabiat baik|good habits'))}</p>
        <p>${c.esc(c.L(lulus ? 'Persekitaran yang direka dengan baik membuat pilihan baik menjadi automatik. Motivasi tidak diperlukan.|A well-designed environment makes good choices automatic. Motivation wasn’t needed.' : 'Godaan yang kelihatan terus menang. Sorok isyarat tabiat buruk dan tonjolkan isyarat tabiat baik, kemudian cuba lagi.|Visible temptations keep winning. Hide bad-habit cues, display good-habit cues, then try again.'))}</p>
        <div class="butang"><button class="btn utama" data-a="n">${c.esc(lulus ? c.t('seterusnya') : c.t('cubaLagi'))}</button></div>`, 'kecil');
      p.querySelector('[data-a=n]').onclick = () => {
        if (lulus) { c.bunyi('buka'); c.tutupModal(); c.serpihan(c.nod(m).bab.titik.map((x) => '• ' + c.L(x)).join('\n'), '🏠', c.L('Pengajaran rumah|Lessons from the house'), () => c.siap()); }
        else { m.penalti++; c.bunyi('salah'); this.bilik(c, m); }
      };
    },
    interaksi(c, m) { return [{ x: m.p.x, z: m.p.z, label: c.L('Masuk rumah|Enter house'), f: () => this.bilik(c, m) }]; },
    sasaran(c, m) { return m.p; },
    kemajuan(c) { return '🏠 ' + c.L('Susun bilik|Arrange the room'); },
  };

  // Rantaian Tabiat: satu batu satu hari; terlepas sekali boleh, terlepas dua kali jatuh
  M.rantaian = {
    objektif: 'Batu loncatan muncul satu demi satu, satu batu untuk satu hari. Pijak batu yang bercahaya sebelum hari berlalu. Terlepas sekali masih selamat; terlepas dua kali berturut-turut, kau jatuh dan rantai bermula semula.|Stepping stones light up one by one, one stone per day. Step on the glowing stone before the day passes. Miss once and you’re still safe; miss twice in a row and you fall and the chain restarts.',
    mula(c, m, n) {
      const akhir = c.calon(m, n, 1, 11, 15, 0, n.npcPos)[0]; if (!akhir) return false;
      const boleh = (a, b) => c.dunia.boleh(a, b, c.had(m));
      const j = EB.cariLaluan(boleh, n.npcPos.x, n.npcPos.z, akhir.x, akhir.z, 5000); if (!j) return false;
      const lc = EB.licinkan(boleh, j);
      // taburkan batu setiap ~1.6 unit sepanjang laluan
      const batu = []; let baki = 1.4;
      for (let i = 1; i < lc.length && batu.length < 10; i++) {
        const [ax, az] = lc[i - 1], [bx, bz] = lc[i], d = Math.hypot(bx - ax, bz - az);
        for (let s = baki; s < d && batu.length < 10; s += 1.6) batu.push({ x: ax + ((bx - ax) * s) / d, z: az + ((bz - az) * s) / d });
        baki = Math.max(0, 1.6 - ((d - baki) % 1.6));
      }
      if (batu.length < 8) return false;
      m.batu = batu.map((b, i) => {
        const air = new T.Mesh(new T.CircleGeometry(0.75, 18).rotateX(-Math.PI / 2), c.dunia.bahanAir); air.position.set(b.x, 0.015, b.z); c.dunia.scene.add(air); m.obj.push(air);
        const o = mesh(c, m, 'silinder6', '#a9a39a', 0.42, 0.14, 0.42, b.x, 0, b.z);
        const l = lbl(c, m, b.x, 0.5, b.z, `<b>${i + 1}</b>`, 'pad');
        return { ...b, o, l, siap: false };
      });
      m.k = -1; m.tBeat = 0; m.miss = 0; m.mula0 = m.batu[0];
      m.lMula = lbl(c, m, m.batu[0].x, 1.3, m.batu[0].z, `<i>▶</i><span>${c.esc(c.L('Mula|Start'))}</span>`);
      return true;
    },
    mulakan(c, m) {
      m.k = 0; m.tBeat = 0; m.miss = 0; m.lMula.e.style.display = 'none'; m.lMula.pos.y = -99;
      m.batu.forEach((b) => { b.siap = false; b.o.material = EB.mat('#a9a39a'); });
      c.toast('🪨 ' + c.L('Hari 1 bermula! Pijak batu yang bercahaya.|Day 1 begins! Step on the glowing stone.'));
    },
    kemas(c, m, dt, tm) {
      if (m.k < 0 || m.fasa !== 'cari' || c.modalTerbuka) return;
      const b = m.batu[m.k], BEAT = 1.7;
      b.o.material = EB.mat('#ffd23f', 0.6 + Math.sin(tm * 10) * 0.3);
      if (!b.siap && jarak(pem(c), b) < 0.75) { b.siap = true; m.miss = 0; c.bunyi('klik'); b.o.material = EB.mat('#7cc94e', 0.3); }
      m.tBeat += dt;
      if (m.tBeat < BEAT) return;
      m.tBeat = 0;
      if (!b.siap) {
        m.miss++; b.o.material = EB.mat('#6d6d6d');
        if (m.miss >= 2) {
          m.penalti++; c.bunyi('percik'); c.bunyi('salah'); c.awan(c.pemain.pos.x, c.pemain.pos.y, m);
          c.toast('💦 ' + c.L('Terlepas dua kali, kau jatuh! Kembali ke batu 1.|Missed twice, you fell! Back to stone 1.'));
          c.pemain.letak(m.batu[0].x, m.batu[0].z); m.k = -1; m.lMula.pos.y = 1.3; m.lMula.e.style.display = '';
          return;
        }
        c.toast('⚠ ' + c.L('Terlepas sekali. Tak apa, tapi jangan terlepas dua kali!|Missed once. Okay, but never miss twice!'));
      }
      m.k++;
      if (m.k >= m.batu.length) { m.k = -1; c.bunyi('buka'); c.serpihan(c.nod(m).bab.titik.map((x) => '• ' + c.L(x)).join('\n'), '🪨', c.L('Rantaian 10 hari!|10-day chain!'), () => c.siap()); }
    },
    interaksi(c, m) { return m.k < 0 && m.fasa === 'cari' ? [{ x: m.batu[0].x, z: m.batu[0].z, label: c.L('Mula rantaian|Start chain'), f: () => this.mulakan(c, m) }] : []; },
    sasaran(c, m) { return m.k < 0 ? m.batu[0] : m.batu[m.k]; },
    kemajuan(c, m) { return m.k < 0 ? '▶ ' + c.L('Berdiri di batu 1 dan mula|Stand on stone 1 and start') : `🪨 ${c.L('Hari|Day')} ${m.k + 1} / ${m.batu.length}${m.miss ? ' · ⚠' : ''}`; },
  };

  /* ================= THE ART OF THINKING CLEARLY ================= */

  const KUBUR = [
    'Di sini bersemadi 4,000 band garaj yang tidak pernah dikenali.|Here lie 4,000 garage bands no one ever heard of.',
    'Di sini bersemadi 900 penyanyi yang menghantar demo dan tidak pernah dibalas.|Here lie 900 singers who sent demos and never heard back.',
    'Di sini bersemadi 2,500 pemuzik jalanan yang berhenti selepas 10 tahun.|Here lie 2,500 street musicians who quit after 10 years.',
    'Di sini bersemadi 1,200 kumpulan yang menandatangani kontrak tetapi albumnya gagal.|Here lie 1,200 bands who signed a deal but whose albums flopped.',
    'Di sini bersemadi 3,000 pelajar muzik yang kini bekerja di bidang lain.|Here lie 3,000 music students now working in other fields.',
  ];
  M.kubur = {
    objektif: 'Pekan ini hanya memaparkan patung orang berjaya 🏆. Gali timbunan tanah ⛏ untuk mencari kubur kegagalan yang tersembunyi sebelum Rick dibenarkan “melabur” impiannya.|This town only displays statues of winners 🏆. Dig the dirt mounds ⛏ to find the hidden graves of failure before Rick is allowed to “invest” his dream.',
    mula(c, m, n) {
      const st = c.calon(m, n, 3, 2.5, 4.5, 2, n.npcPos), mo = c.calon(m, n, 5, 5, 11, 2.4, n.npcPos, st);
      if (st.length < 3 || mo.length < 5) return false;
      st.forEach((p) => {
        mesh(c, m, 'silinder6', '#d8d2c6', 0.45, 0.5, 0.45, p.x, 0, p.z);
        const w = EB.binaWatak({ baju: '#d4af37', seluar: '#b8902c', kulit: '#e6c35c', rambut: '#c9a227' }); w.position.set(p.x, 0.5, p.z); w.scale.setScalar(1.15); c.dunia.scene.add(w); m.obj.push(w);
        w.userData.tangan[1].rotation.x = -2.6;
        lbl(c, m, p.x, 2.2, p.z, '<i>🏆</i>');
      });
      m.busut = mo.map((p, i) => ({ ...p, teks: KUBUR[i], o: mesh(c, m, 'bola', '#8b5e3c', 0.5, 0.3, 0.5, p.x, -0.05, p.z), l: lbl(c, m, p.x, 0.9, p.z, '<i>⛏</i>'), gali: false }));
      return true;
    },
    gali(c, m, b) {
      b.gali = true; c.bunyi('gali'); c.tambahXP(8); b.o.visible = false; b.l.e.innerHTML = '<i class="siap">🪦</i>';
      mesh(c, m, 'kotak', '#9aa0a6', 0.5, 0.65, 0.12, b.x, 0, b.z); mesh(c, m, 'kotak', '#7a5232', 0.6, 0.05, 1.0, b.x, 0, b.z + 0.45);
      const k = m.busut.filter((x) => x.gali).length;
      c.serpihan(b.teks, '🪦', c.L('Kubur|Grave') + ` ${k} / 5`, () => { if (k >= 5) c.siap(); });
    },
    interaksi(c, m) { return m.busut.filter((b) => !b.gali).map((b) => ({ x: b.x, z: b.z, label: c.L('Gali|Dig'), f: () => this.gali(c, m, b) })); },
    sasaran(c, m) { return m.busut.filter((b) => !b.gali).sort((a, b) => jarak(a, pem(c)) - jarak(b, pem(c)))[0] || null; },
    kemajuan(c, m) { return `🪦 ${m.busut.filter((b) => b.gali).length} / 5`; },
    soalanTambahan(c, m, n) {
      return [{ label: c.L('Pelaburan Rick|Rick’s investment'), soalan: 'Rick mahu melaburkan semua simpanannya untuk menjadi bintang rock. Selepas melihat 3 patung DAN 5 kubur, apa nasihat kau?|Rick wants to invest all his savings in becoming a rock star. Having seen 3 statues AND 5 graves, what’s your advice?',
        pilihan: ['Peluang sebenar sangat kecil: untuk setiap patung ada ribuan yang gagal. Main muzik kerana minat, jangan pertaruhkan semua.|Real odds are tiny: for every statue there are thousands who failed. Play for love, don’t bet everything.', 'Teruskan! Tiga patung membuktikan muzik ialah jalan pasti kaya.|Go for it! Three statues prove music is a sure way to riches.', 'Peluangnya 50-50, jadi berbaloi dicuba dengan semua simpanan.|It’s 50-50, so it’s worth trying with all savings.'],
        betul: null, terang: n.bab.terang, nod: n.idx }].map((q) => Object.assign(q, { betul: q.pilihan[0] }));
    },
  };

  M.rolet = {
    objektif: 'Duduk di meja rolet 🎡. Si penjudi akan menjerit “dah tiba masanya!” selepas satu warna keluar berulang kali. Pemain yang faham peristiwa bebas tidak akan terpengaruh.|Sit at the roulette table 🎡. The gambler will shout “it’s due!” after one colour repeats. A player who understands independent events won’t be swayed.',
    mula(c, m, n) {
      const p = c.calon(m, n, 1, 3.5, 6, 0, n.npcPos)[0]; if (!p) return false;
      m.p = p; const g = kumpulan(c, m, p.x, p.z);
      tambahKe(g, 'silinder', '#1f6f43', 0.8, 0.7, 0.8, 0, 0, 0); tambahKe(g, 'silinder', '#c0392b', 0.4, 0.06, 0.4, 0, 0.7, 0);
      m.roda = tambahKe(g, 'silinder', '#222222', 0.3, 0.04, 0.3, 0, 0.76, 0);
      m.penjudi = npc(c, m, p.x + 1.1, p.z, { baju: '#c0392b', topi: 'pengembara' });
      lbl(c, m, p.x, 1.6, p.z, '<i>🎡</i>');
      m.sejarah = ['H', 'H', 'H', 'H', 'H']; m.pusingan = 0; m.ikut = 0; m.desak = 0; m.cip = 10;
      return true;
    },
    meja(c, m) {
      const sj = m.sejarah, last = sj[sj.length - 1]; let streak = 1; for (let i = sj.length - 2; i >= 0 && sj[i] === last; i--) streak++;
      const desak = streak >= 3, due = last === 'H' ? 'M' : 'H';
      const nama = (w) => c.L(w === 'H' ? 'HITAM|BLACK' : 'MERAH|RED');
      const p = c.bukaModal(`<h2>🎡 ${c.esc(c.L('Roda Rolet|Roulette Wheel'))} · ${m.pusingan + 1}/5</h2>
        <div class="roda"><div class="roda-putar"></div></div>
        <div class="sejarah">${sj.slice(-10).map((w) => `<i class="${w}">${w === 'H' ? '●' : '●'}</i>`).join('')}</div>
        <p class="kecil">🪙 ${m.cip} ${c.esc(c.L('cip · setiap taruhan 2 cip|chips · each bet 2 chips'))}</p>
        ${desak ? `<div class="desak">🗣 “${c.esc(nama(last))} ${c.esc(c.L('dah keluar|has come up'))} ${streak} ${c.esc(c.L('kali! Pasti|times! Surely'))} ${c.esc(nama(due))} ${c.esc(c.L('dah tiba masanya! Taruh semua!|is due now! Bet it all!'))}”</div>` : ''}
        <div class="pilihan"><button class="opsyen" data-w="${due}"><b>A</b><span>${c.esc(c.L('Taruh|Bet on'))} ${c.esc(nama(due))}${desak ? ' ' + c.esc(c.L('(ikut gesaan)|(follow the urging)')) : ''}</span></button>
        <button class="opsyen" data-w="${last}"><b>B</b><span>${c.esc(c.L('Taruh|Bet on'))} ${c.esc(nama(last))}</span></button>
        <button class="opsyen" data-w="-"><b>C</b><span>${c.esc(c.L('Tidak bertaruh pusingan ini|Sit this round out'))}</span></button></div><div class="maklum" hidden></div>`, 'kecil');
      p.querySelectorAll('[data-w]').forEach((b) => (b.onclick = () => {
        p.querySelectorAll('[data-w]').forEach((x) => (x.disabled = true));
        const w = b.dataset.w;
        if (desak) { m.desak++; if (w === due) m.ikut++; }
        const hasil = Math.random() < 0.5 ? 'M' : 'H';
        p.querySelector('.roda-putar').classList.add('putar');
        setTimeout(() => {
          sj.push(hasil); m.pusingan++;
          if (w !== '-') m.cip += w === hasil ? 2 : -2;
          c.bunyi(w === '-' ? 'klik' : w === hasil ? 'betul' : 'salah');
          const mk = p.querySelector('.maklum'); mk.hidden = false;
          mk.innerHTML = `<b>${c.esc(c.L('Keputusan|Result'))}: ${c.esc(nama(hasil))}</b><p>${c.esc(c.L('Roda tidak ingat putaran lepas. Peluang setiap warna tetap hampir 50% setiap kali.|The wheel has no memory. Each colour stays close to 50% every spin.'))}</p><button class="btn utama" data-a="n">${c.esc(c.t('seterusnya'))}</button>`;
          mk.querySelector('[data-a=n]').onclick = () => (m.pusingan >= 5 ? this.tamat(c, m) : this.meja(c, m));
        }, 1300);
      }));
    },
    tamat(c, m) {
      const lulus = m.ikut <= 1;
      const p = c.bukaModal(`<h2>🎡 ${c.esc(c.L('Tamat sesi|Session over'))}</h2><p class="skor">🪙 ${m.cip}</p>
        <p>${c.esc(c.L('Kau ikut gesaan “dah tiba masanya”|You followed the “it’s due” urging'))}: <b>${m.ikut} / ${m.desak}</b></p>
        <p>${c.esc(c.L(lulus ? 'Bagus. Kau tidak tertipu oleh kekeliruan penjudi. Siri hitam tidak membuat merah lebih mungkin.|Well done. You weren’t fooled by the gambler’s fallacy. A black streak doesn’t make red more likely.' : 'Kau terpengaruh oleh kekeliruan penjudi. Peristiwa bebas tidak “mengimbangi” diri sendiri. Ganjaran ditolak; cuba lagi.|You fell for the gambler’s fallacy. Independent events don’t “balance out”. Reward denied; try again.'))}</p>
        <div class="butang"><button class="btn utama" data-a="n">${c.esc(lulus ? c.t('seterusnya') : c.t('cubaLagi'))}</button></div>`, 'kecil');
      p.querySelector('[data-a=n]').onclick = () => {
        c.tutupModal();
        if (lulus) c.serpihan(c.nod(m).bab.titik.map((x) => '• ' + c.L(x)).join('\n'), '🎡', c.L('Pengajaran rolet|Roulette lessons'), () => c.siap());
        else { m.penalti++; m.pusingan = 0; m.ikut = 0; m.desak = 0; m.cip = 10; m.sejarah = ['H', 'H', 'H', 'H']; }
      };
    },
    interaksi(c, m) { return [{ x: m.p.x, z: m.p.z, label: c.L('Duduk di meja|Sit at the table'), f: () => this.meja(c, m) }]; },
    sasaran(c, m) { return m.p; },
    kemajuan(c, m) { return `🎡 ${m.pusingan} / 5`; },
  };

  M.sauh = {
    objektif: 'Beli sebuah teko tembaga ☕. Penjual utama membuka harga yang melampau. Teroka gerai lain 🏪 untuk tahu harga pasaran sebelum berunding.|Buy a copper teapot ☕. The main seller opens with an outrageous price. Explore the other stalls 🏪 to learn the market price before negotiating.',
    mula(c, m, n) {
      const ut = c.calon(m, n, 1, 3, 5, 0, n.npcPos)[0], lain = c.calon(m, n, 3, 6, 12, 3.5, n.npcPos, ut ? [ut] : []);
      if (!ut || lain.length < 3) return false;
      const rnd = c.rnd(m, 81); m.pasaran = 70 + Math.round(rnd() * 4) * 5; m.buka = 320;
      m.ut = ut; gerai(c, m, ut.x, ut.z - 0.9, '#c0392b'); npc(c, m, ut.x, ut.z, { baju: '#8e44ad', topi: 'serban' });
      lbl(c, m, ut.x, 2.0, ut.z, `<i>☕</i><span>RM${m.buka}?!</span>`);
      m.gerai = lain.map((p, i) => {
        gerai(c, m, p.x, p.z - 0.9, ['#2e86c1', '#27ae60', '#f39c12'][i]); npc(c, m, p.x, p.z, {});
        const harga = m.pasaran + [-5, 5, 10][i];
        return { ...p, harga, l: lbl(c, m, p.x, 2.0, p.z, '<i>🏪</i>'), lawat: false };
      });
      return true;
    },
    lawat(c, m, g) {
      g.lawat = true; c.bunyi('ambil'); g.l.e.innerHTML = `<i class="siap">✓</i><span>RM${g.harga}</span>`;
      c.serpihan(c.L('“Teko tembaga yang sama? Di gerai aku, RM|“The same copper teapot? At my stall, RM') + g.harga + '.”', '🏪', c.L('Harga pasaran|Market price'));
    },
    runding(c, m) {
      const tahu = m.gerai.filter((g) => g.lawat).map((g) => 'RM' + g.harga);
      const p = c.bukaModal(`<h2>⚓ ${c.esc(c.L('Berunding|Negotiate'))}</h2>
        <p class="cerita">“${c.esc(c.L('Teko ini antik dan istimewa! Harganya RM|This teapot is antique and special! The price is RM'))}${m.buka}. ${c.esc(c.L('Murah untuk kualiti begini.|A bargain for such quality.'))}”</p>
        <p class="kecil">${c.esc(c.L('Harga yang kau tahu dari gerai lain:|Prices you know from other stalls:'))} <b>${tahu.length ? tahu.join(', ') : c.esc(c.L('belum ada (kau belum teroka)|none yet (you haven’t explored)'))}</b></p>
        <label class="tawar"><span>${c.esc(c.L('Tawaran kau|Your offer'))}: <b>RM<output>280</output></b></span><input type="range" min="40" max="320" step="5" value="280"></label>
        <div class="butang"><button class="btn" data-a="x">${c.esc(c.t('nanti'))}</button><button class="btn utama" data-a="ok">${c.esc(c.L('Buat tawaran|Make offer'))}</button></div>`, 'kecil');
      const r = p.querySelector('input'), o = p.querySelector('output'); r.oninput = () => (o.textContent = r.value);
      p.querySelector('[data-a=x]').onclick = c.tutupModal;
      p.querySelector('[data-a=ok]').onclick = () => {
        const v = +r.value, P = m.pasaran;
        if (v < P * 0.75) { c.bunyi('salah'); c.toast(c.L('“Terlalu rendah! Aku tak jual.” Cuba tawaran yang adil.|“Too low! Not selling.” Try a fair offer.')); return; }
        c.tutupModal();
        if (v <= P * 1.15) { c.bunyi('buka'); c.tambahXP(15); c.serpihan(c.L('Teko dibeli dengan RM|Teapot bought for RM') + v + c.L('. Harga pasaran kira-kira RM|. The market price is about RM') + P + c.L('. Kau tidak tertambat pada sauh RM320.\n\n|. You weren’t tied to the RM320 anchor.\n\n') + c.nod(m).bab.titik.map((x) => '• ' + c.L(x)).join('\n'), '⚓', c.L('Rundingan berjaya|Negotiation won'), () => c.siap()); }
        else { m.penalti++; c.bunyi('salah'); c.serpihan(c.L('Kau bayar RM|You paid RM') + v + c.L(' untuk teko bernilai kira-kira RM|for a teapot worth about RM') + P + c.L('. Angka RM320 menarik tawaran kau ke atas. Penjual memulangkan wang; teroka pasaran dan cuba lagi.|. The RM320 number pulled your offer up. The seller refunds you; explore the market and try again.'), '⚓', c.L('Tertambat pada sauh!|Anchored!')); }
      };
    },
    interaksi(c, m) { return [{ x: m.ut.x, z: m.ut.z, label: c.L('Berunding|Negotiate'), f: () => this.runding(c, m) }, ...m.gerai.filter((g) => !g.lawat).map((g) => ({ x: g.x, z: g.z, label: c.L('Tanya harga|Ask the price'), f: () => this.lawat(c, m, g) }))]; },
    sasaran(c, m) { return m.gerai.find((g) => !g.lawat) || m.ut; },
    kemajuan(c, m) { return `🏪 ${m.gerai.filter((g) => g.lawat).length} / 3 · ⚓ RM${m.buka}`; },
  };

  M.gorila = {
    objektif: 'Bercakap dengan pengadil 🏀 untuk mula. Kira berapa kali pasukan BAJU PUTIH menghantar bola. Fokus!|Talk to the referee 🏀 to start. Count how many passes the WHITE SHIRT team makes. Focus!',
    mula(c, m, n) {
      const p = c.calon(m, n, 1, 4, 7, 0, n.npcPos)[0]; if (!p) return false;
      m.p = p; m.ref = npc(c, m, p.x + 2.8, p.z, { baju: '#222', topi: 'pengembara' }); lbl(c, m, p.x + 2.8, 1.7, p.z, '<i>🏀</i>');
      m.main = [];
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2, x = p.x + Math.cos(a) * 1.8, z = p.z + Math.sin(a) * 1.8;
        const w = npc(c, m, x, z, { baju: i % 2 ? '#1d1d24' : '#f7f7f7', seluar: i % 2 ? '#1d1d24' : '#cfcfcf' }); w.urusSendiri = true; w.yaw = Math.atan2(p.x - x, p.z - z); w.model.rotation.y = w.yaw;
        m.main.push(w);
      }
      m.bolaP = mesh(c, m, 'bola0', '#ff8c42', 0.14, 0.14, 0.14, p.x, -5, p.z); m.bolaH = mesh(c, m, 'bola0', '#ffd23f', 0.14, 0.14, 0.14, p.x, -5, p.z);
      m.go = EB.binaWatak({ baju: '#2b2b2b', seluar: '#2b2b2b', kulit: '#3d3d3d', rambut: '#1e1e1e' }); m.go.scale.setScalar(1.45); m.go.visible = false; c.dunia.scene.add(m.go); m.obj.push(m.go);
      m.t = -1; m.kira = 0;
      return true;
    },
    mulakan(c, m) { m.t = 0; m.kira = 0; m.hp = { dari: 0, ke: 2, k: 0 }; m.hh = { dari: 1, ke: 3, k: 0 }; c.toast('👀 ' + c.L('Kira hantaran pasukan PUTIH!|Count the WHITE team’s passes!')); },
    kemas(c, m, dt, tm) {
      for (const w of m.main) EB.animasiWatak(w.model, 0, dt, tm, 0);
      if (m.t < 0 || c.modalTerbuka) return;
      m.t += dt;
      const lompat = (b, h, pasukan, tempoh) => {
        h.k += dt / tempoh;
        if (h.k >= 1) { h.k = 0; h.dari = h.ke; const pil = pasukan.filter((i) => i !== h.dari); h.ke = pil[(Math.random() * pil.length) | 0]; if (pasukan[0] === 0) m.kira++; }
        const a = m.main[h.dari].pos, z = m.main[h.ke].pos;
        b.position.set(a.x + (z.x - a.x) * h.k, 0.9 + Math.sin(h.k * Math.PI) * 0.8, a.y + (z.y - a.y) * h.k);
      };
      lompat(m.bolaP, m.hp, [0, 2, 4], 1.15); lompat(m.bolaH, m.hh, [1, 3, 5], 0.95);
      // gorila melintas di antara saat 5 hingga 13
      const g = m.go, mula = { x: m.p.x - 4, z: m.p.z + 0.3 }, akhir = { x: m.p.x + 4, z: m.p.z - 0.3 };
      if (m.t > 5 && m.t < 13) {
        g.visible = true; const f = (m.t - 5) / 8, k = f < 0.4 ? f / 0.4 * 0.5 : f > 0.6 ? 0.5 + ((f - 0.6) / 0.4) * 0.5 : 0.5;
        g.position.set(mula.x + (akhir.x - mula.x) * k, 0, mula.z + (akhir.z - mula.z) * k); g.rotation.y = f > 0.4 && f < 0.6 ? Math.PI * 0.25 : Math.PI / 2;
        const tepuk = f > 0.4 && f < 0.6; g.userData.tangan[0].rotation.x = tepuk ? -1.4 + Math.sin(tm * 16) * 0.4 : 0; g.userData.tangan[1].rotation.x = tepuk ? -1.4 - Math.sin(tm * 16) * 0.4 : 0;
        EB.animasiWatak(g, tepuk ? 0 : 1.1, dt, tm, 0);
      } else g.visible = false;
      if (m.t >= 17) { m.t = -1; m.bolaP.position.y = -5; m.bolaH.position.y = -5; this.soal(c, m); }
    },
    soal(c, m) {
      const n = m.kira, pil = c.kocak([n, n + 2, Math.max(1, n - 3)]);
      const p = c.bukaModal(`<h2>🏀 ${c.esc(c.L('Berapa hantaran pasukan PUTIH?|How many passes did the WHITE team make?'))}</h2><div class="pilihan">${pil.map((v, i) => `<button class="opsyen" data-v="${v}"><b>${'ABC'[i]}</b><span>${v}</span></button>`).join('')}</div><div class="maklum" hidden></div>`, 'kecil');
      p.querySelectorAll('[data-v]').forEach((b) => (b.onclick = () => {
        p.querySelectorAll('[data-v]').forEach((x) => (x.disabled = true)); const ok = +b.dataset.v === n; if (!ok) m.penalti++;
        c.bunyi(ok ? 'betul' : 'salah');
        maklum(c, p, ok, (ok ? 'Tepat, ' : 'Jawapannya ') + n + '.|' + (ok ? 'Right, ' : 'The answer is ') + n + '.', null, () => {
          modalPilih(c, `<h2>👀 ${c.esc(c.L('Ada apa-apa lagi yang kau perasan?|Did you notice anything else?'))}</h2>`, ['Tiada apa-apa yang luar biasa.|Nothing unusual.', 'Seekor gorila berjalan melalui tengah dan menepuk dada.|A gorilla walked through the middle and beat its chest.', 'Seekor anjing berlari mengejar bola.|A dog ran after the ball.'], (i, pp) => {
            const nampak = i === 1;
            maklum(c, pp, nampak, nampak ? 'Hebat, kau perasan! Ramai orang terlepas pandang kerana fokus mengira.|Great, you noticed! Many people miss it because they’re focused on counting.' : 'Seekor gorila berjalan betul-betul di tengah! Inilah ilusi perhatian: fokus menyembunyikan perkara yang tidak dijangka.|A gorilla walked right through the middle! This is the illusion of attention: focus hides the unexpected.', null, () => c.serpihan(c.nod(m).bab.titik.map((x) => '• ' + c.L(x)).join('\n'), '🦍', c.L('Ilusi perhatian|Illusion of attention'), () => c.siap()));
          });
        });
      }));
    },
    interaksi(c, m) { return m.t < 0 && m.fasa === 'cari' ? [{ x: m.ref.pos.x, z: m.ref.pos.y, label: c.L('Mula|Start'), f: () => this.mulakan(c, m) }] : []; },
    sasaran(c, m) { return m.t < 0 ? { x: m.ref.pos.x, z: m.ref.pos.y } : null; },
    kemajuan(c, m) { return m.t < 0 ? '🏀 ' + c.L('Bercakap dengan pengadil|Talk to the referee') : '👀 ' + c.L('Kira hantaran PUTIH…|Count WHITE passes…'); },
  };

  /* ================= CLEAR THINKING ================= */

  const HINAAN = [
    { h: '“Hah, kau ni lambat betul. Budak darjah satu pun lebih pandai!”|“Wow, you’re so slow. A first-grader is smarter!”', r: ['Tarik nafas dan tanya: “Bahagian mana yang kau rasa aku boleh buat lebih baik?”|Breathe and ask: “Which part do you think I could do better?”', 'Balas: “Sekurang-kurangnya aku bukan badut macam kau!”|Fire back: “At least I’m not a clown like you!”', 'Diam, merajuk dan simpan dendam.|Go silent, sulk and hold a grudge.'] },
    { h: '“Idea kau tu bodoh. Siapa yang ajar kau berfikir?”|“Your idea is stupid. Who taught you to think?”', r: ['Jawab tenang: “Boleh kita bincang kelemahannya satu-satu?”|Calmly reply: “Can we go through its weaknesses one by one?”', 'Tengking: “Kau yang bodoh!”|Shout: “You’re the stupid one!”', 'Tinggalkan projek itu terus.|Abandon the project entirely.'] },
    { h: '“Semua orang tahu kau gagal minggu lepas. Memalukan!”|“Everyone knows you failed last week. Embarrassing!”', r: ['“Ya, aku gagal. Aku sedang belajar daripadanya.”|“Yes, I failed. I’m learning from it.”', '“Kau lebih teruk! Aku tahu rahsia kau…”|“You’re worse! I know your secrets…”', 'Menyebar cerita buruk tentang dia di belakang.|Spread bad stories about them behind their back.'] },
  ];
  M.detik = {
    objektif: 'Tiga orang Pencabar 😠 menunggu untuk memprovokasi kau. Apabila butang BALAS berkelip, TAHAN. Tunggu bar jeda penuh, kemudian pilih respons yang paling membantu matlamat kau.|Three Provokers 😠 are waiting to provoke you. When the RETALIATE button flashes, HOLD. Wait for the pause bar to fill, then choose the response that best serves your goals.',
    mula(c, m, n) {
      const s = c.calon(m, n, 3, 4, 10, 3.5, n.npcPos); if (s.length < 3) return false;
      m.p = s.map((p, i) => ({ ...p, w: npc(c, m, p.x, p.z, { baju: '#d62828' }), l: lbl(c, m, p.x, 1.7, p.z, '<i>😠</i>'), siap: false, h: HINAAN[i] }));
      return true;
    },
    provok(c, m, o) {
      const p = c.bukaModal(`<div class="kad-serpihan"><div class="ikon">😠</div><p>${c.esc(c.L(o.h.h))}</p></div>
        <button class="btn balas" data-a="balas">💢 ${c.esc(c.L('BALAS!|RETALIATE!'))}</button>
        <div class="jeda"><small>${c.esc(c.L('Ruang antara rangsangan dan tindak balas…|The space between stimulus and response…'))}</small><div class="bar"><i></i></div></div>
        <div class="respons" hidden></div>`, 'kecil');
      const bar = p.querySelector('.jeda i'), t0 = performance.now();
      const iv = setInterval(() => {
        const f = Math.min(1, (performance.now() - t0) / 4000); bar.style.width = f * 100 + '%';
        if (f >= 1) {
          clearInterval(iv); p.querySelector('[data-a=balas]').remove();
          const box = p.querySelector('.respons'); box.hidden = false;
          const pil = c.kocak([0, 1, 2]);
          box.innerHTML = `<p class="kecil">${c.esc(c.L('Bagus, kau menahan diri. Sekarang pilih dengan jelas:|Good, you held back. Now choose clearly:'))}</p><div class="pilihan">${pil.map((k, i) => `<button class="opsyen" data-k="${k}"><b>${'ABC'[i]}</b><span>${c.esc(c.L(o.h.r[k]))}</span></button>`).join('')}</div><div class="maklum" hidden></div>`;
          box.querySelectorAll('[data-k]').forEach((b) => (b.onclick = () => {
            box.querySelectorAll('[data-k]').forEach((x) => (x.disabled = true)); const ok = b.dataset.k === '0'; if (!ok) m.penalti++; c.bunyi(ok ? 'betul' : 'salah');
            maklum(c, box, ok, ok ? 'Respons yang dipilih dengan sedar melindungi hubungan dan matlamat kau.|A consciously chosen response protects your relationships and goals.' : 'Respons ini memuaskan emosi seketika tetapi merosakkan matlamat jangka panjang.|This response satisfies emotion briefly but harms long-term goals.', null, () => {
              o.siap = true; o.l.e.innerHTML = '<i class="siap">✓</i>';
              const k = m.p.filter((x) => x.siap).length;
              c.serpihan(c.nod(m).bab.titik[k - 1], '⏸', c.L('Detik biasa|Ordinary moment') + ` ${k} / 3`, () => { if (k >= 3) c.siap(); });
            });
          }));
        }
      }, 50);
      p.querySelector('[data-a=balas]').onclick = () => { clearInterval(iv); m.penalti++; c.bunyi('salah'); c.tutupModal(); c.toast('💢 ' + c.L('Kau bertindak balas tanpa berfikir! Pencabar ketawa. Cuba lagi, tahan diri.|You reacted without thinking! The provoker laughs. Try again, hold back.')); };
    },
    kemas(c, m, dt) { for (const o of m.p) if (o.tunda > 0) o.tunda -= dt; if (m.fasa !== 'cari' || c.modalTerbuka) return; for (const o of m.p) if (!o.siap && !(o.tunda > 0) && jarak(o, pem(c)) < 1.8) { c.pemain.berhenti(); o.tunda = 3; this.provok(c, m, o); return; } },
    sasaran(c, m) { return m.p.filter((x) => !x.siap).sort((a, b) => jarak(a, pem(c)) - jarak(b, pem(c)))[0] || null; },
    kemajuan(c, m) { return `😠 ${m.p.filter((x) => x.siap).length} / 3`; },
  };

  const KEPUTUSAN = [
    { s: 'Kawan ajak kau melabur RM5,000 dalam skim “untung pasti 30% sebulan”.|A friend invites you to invest RM5,000 in a “guaranteed 30% monthly” scheme.', b: 'Minta masa 24 jam dan semak lesen skim itu.|Ask for 24 hours and check the scheme’s licence.', x: 'Setuju sekarang sebelum terlepas peluang.|Agree now before missing out.' },
    { s: 'Bos minta kau ambil satu projek besar tambahan minggu ini.|Your boss asks you to take on an extra big project this week.', b: 'Semak jadual dahulu dan beri jawapan esok.|Check your schedule first and answer tomorrow.', x: 'Terus setuju supaya nampak rajin.|Agree immediately to look hardworking.' },
    { s: 'Kau bertengkar dengan adik melalui mesej.|You’re arguing with your sibling over text.', b: 'Berhenti, tenangkan diri, dan telefon dia esok.|Stop, calm down, and call them tomorrow.', x: 'Hantar mesej panjang yang tajam sekarang juga.|Send a long sharp message right now.' },
  ];
  M.halt = {
    objektif: 'Buat 3 keputusan di meja 📋. Bar LAPAR dan LETIH naik sepanjang masa (berlari menambah letih). Membuat keputusan ketika bar merah menghasilkan keputusan lebih teruk. Makan di gerai 🍲 dan rehat di bangku 🪑 dahulu.|Make 3 decisions at the desks 📋. HUNGER and TIREDNESS rise over time (running adds tiredness). Deciding while a bar is red gives worse results. Eat at the stall 🍲 and rest on the bench 🪑 first.',
    mula(c, m, n) {
      const s = c.calon(m, n, 5, 4, 12, 3.2, n.npcPos); if (s.length < 5) return false;
      m.meja = s.slice(0, 3).map((p, i) => { mesh(c, m, 'kotak', '#8a5a3b', 0.9, 0.55, 0.6, p.x, 0, p.z - 0.6); npc(c, m, p.x + 0.8, p.z - 0.6, { baju: '#264653' }); return { ...p, k: KEPUTUSAN[i], l: lbl(c, m, p.x, 1.3, p.z - 0.6, '<i>📋</i>'), siap: false }; });
      m.makan = s[3]; gerai(c, m, s[3].x, s[3].z - 0.9, '#e76f51'); lbl(c, m, s[3].x, 2.0, s[3].z, '<i>🍲</i>');
      m.bangku = s[4]; mesh(c, m, 'kotak', '#a0683e', 0.9, 0.3, 0.35, s[4].x, 0, s[4].z - 0.5); lbl(c, m, s[4].x, 1.0, s[4].z, '<i>🪑</i>');
      m.lapar = 55; m.letih = 50;
      return true;
    },
    kemas(c, m, dt) {
      if (m.fasa !== 'cari' || c.modalTerbuka) return;
      const v = c.pemain.laju || 0;
      m.lapar = Math.min(100, m.lapar + dt * 1.6);
      if (jarak(pem(c), m.bangku) < 1.2 && v < 0.3) m.letih = Math.max(0, m.letih - dt * 30);
      else m.letih = Math.min(100, m.letih + dt * (v > 4 ? 4 : v > 0.3 ? 1.2 : 0.4));
      m.tUI = (m.tUI || 0) + dt; if (m.tUI > 0.25) { m.tUI = 0; c.kemasTracker(); }
    },
    putus(c, m, d) {
      const merah = [m.lapar >= 75 && c.L('LAPAR|HUNGRY'), m.letih >= 75 && c.L('LETIH|TIRED')].filter(Boolean);
      modalPilih(c, `<h2>📋 ${c.esc(c.L('Keputusan|Decision'))}</h2><p class="cerita">${c.esc(c.L(d.k.s))}</p>${merah.length ? `<p class="nota">⚠ ${c.esc(c.L('Kau sedang|You are'))} ${merah.join(' + ')}</p>` : ''}`, c.kocak([d.k.b, d.k.x]), (i, p) => {
        const pilih = p.querySelectorAll('.opsyen')[i].querySelector('span').textContent, baik = pilih === c.L(d.k.b);
        const ok = baik && !merah.length; if (!ok) m.penalti++;
        c.bunyi(ok ? 'betul' : 'salah');
        maklum(c, p, ok, merah.length ? 'Keputusan dibuat ketika ' + merah.join(' + ') + '. Walaupun pilihannya kelihatan munasabah, kualitinya menurun: kau tergesa-gesa dan terlepas butiran. Gunakan HALT: jangan buat keputusan penting ketika Lapar, Marah, Sunyi atau Letih.|Decision made while ' + merah.join(' + ') + '. Even if the choice looks reasonable, its quality drops: you rushed and missed details. Use HALT: no big decisions when Hungry, Angry, Lonely or Tired.' : baik ? 'Keadaan badan baik dan pilihan teliti. Pelindung berfungsi.|Body in good shape and a careful choice. Safeguards working.' : 'Badan kau segar, tetapi pilihan ini tergesa-gesa. Pelindung seperti “tunggu 24 jam” mengelakkannya.|Your body is fresh, but this choice was rushed. Safeguards like “wait 24 hours” prevent it.', null, () => {
          d.siap = true; d.l.e.innerHTML = '<i class="siap">✓</i>';
          const k = m.meja.filter((x) => x.siap).length;
          c.serpihan(c.nod(m).bab.titik[k - 1], '📋', c.L('Keputusan|Decision') + ` ${k} / 3`, () => { if (k >= 3) c.siap(); });
        });
      });
    },
    interaksi(c, m) {
      const s = m.meja.filter((d) => !d.siap).map((d) => ({ x: d.x, z: d.z, label: c.L('Buat keputusan|Decide'), f: () => this.putus(c, m, d) }));
      s.push({ x: m.makan.x, z: m.makan.z, label: c.L('Makan|Eat'), f: () => { m.lapar = 0; c.bunyi('ambil'); c.toast('🍲 ' + c.L('Kenyang!|Full!')); } });
      return s;
    },
    sasaran(c, m) { if (m.lapar >= 75) return m.makan; if (m.letih >= 75) return m.bangku; return m.meja.find((d) => !d.siap) || null; },
    kemajuan(c, m) {
      const bar = (n, v, ik) => `<span class="halt ${v >= 75 ? 'merah' : ''}">${ik} ${c.esc(c.L(n))}<i style="width:${v}%"></i></span>`;
      return `📋 ${m.meja.filter((d) => d.siap).length} / 3 ${bar('Lapar|Hunger', m.lapar, '🍲')}${bar('Letih|Tired', m.letih, '🪑')}`;
    },
  };

  M.meriam = {
    objektif: 'Laksamana 🏴 memberi kau 12 syiling untuk menenggelamkan kapal musuh yang tersembunyi. Peluru (1 syiling) memberi petunjuk jarak; Meriam (5 syiling) menenggelamkan kapal jika tepat. Uji dahulu, kemudian tembak.|The Admiral 🏴 gives you 12 coins to sink a hidden enemy ship. A bullet (1 coin) gives a distance hint; a cannonball (5 coins) sinks the ship if it hits. Test first, then fire.',
    mula(c, m, n) {
      const p = c.calon(m, n, 1, 3, 6, 0, n.npcPos)[0]; if (!p) return false;
      m.p = p; npc(c, m, p.x, p.z, { baju: '#1d3557', topi: 'mahkota' }); lbl(c, m, p.x, 1.7, p.z, '<i>🏴</i>');
      this.baru(m); return true;
    },
    baru(m) { m.kapal = (Math.random() * 16) | 0; m.syiling = 12; m.tanda = {}; m.mod = 'peluru'; },
    laut(c, m) {
      const kx = m.kapal % 4, kz = (m.kapal / 4) | 0;
      const sel = [...Array(16).keys()].map((i) => `<button class="sel-laut ${m.tanda[i] || ''}" data-i="${i}">${{ panas: '🔥', suam: '♨', sejuk: '❄', terlepas: '💦', karam: '💥' }[m.tanda[i]] || '🌊'}</button>`).join('');
      const p = c.bukaModal(`<h2>💣 ${c.esc(c.L('Laut Musuh|Enemy Sea'))}</h2><p class="skor">🪙 ${m.syiling}</p>
        <div class="tog mod"><button data-mod="peluru" class="${m.mod === 'peluru' ? 'on' : ''}">🔫 ${c.esc(c.L('Peluru (1)|Bullet (1)'))}</button><button data-mod="meriam" class="${m.mod === 'meriam' ? 'on' : ''}">💣 ${c.esc(c.L('Meriam (5)|Cannon (5)'))}</button></div>
        <div class="laut">${sel}</div><p class="kecil">${c.esc(c.L('Peluru: 🔥 bersebelahan · ♨ 2 petak · ❄ jauh. Meriam hanya tenggelamkan kapal jika tepat pada petaknya.|Bullet: 🔥 adjacent · ♨ 2 cells · ❄ far. A cannon only sinks the ship on its exact cell.'))}</p>`, 'kecil');
      p.querySelectorAll('[data-mod]').forEach((b) => (b.onclick = () => { m.mod = b.dataset.mod; this.laut(c, m); }));
      p.querySelectorAll('[data-i]').forEach((b) => (b.onclick = () => {
        const i = +b.dataset.i, x = i % 4, z = (i / 4) | 0, d = Math.abs(x - kx) + Math.abs(z - kz);
        if (m.mod === 'peluru') { if (m.syiling < 1) return; m.syiling -= 1; m.tanda[i] = d === 0 ? 'panas' : d === 1 ? 'panas' : d === 2 ? 'suam' : 'sejuk'; c.bunyi('klik'); }
        else {
          if (m.syiling < 5) { c.toast(c.L('Syiling tidak cukup untuk meriam!|Not enough coins for a cannon!')); return; }
          m.syiling -= 5;
          if (d === 0) { m.tanda[i] = 'karam'; c.bunyi('buka'); c.tutupModal(); c.serpihan(c.L('Kapal karam dengan baki|Ship sunk with') + ` ${m.syiling} ` + c.L('syiling. Peluru murah membeli maklumat sebelum pertaruhan besar.\n\n|coins left. Cheap bullets bought information before the big bet.\n\n') + c.nod(m).bab.titik.map((t) => '• ' + c.L(t)).join('\n'), '💥', c.L('Tepat!|Direct hit!'), () => c.siap()); return; }
          m.tanda[i] = 'terlepas'; c.bunyi('salah');
        }
        if (m.syiling < 5) {
          { m.penalti++; c.tutupModal(); c.serpihan(c.L('Bajet habis sebelum kapal karam. Menembak meriam tanpa menguji dahulu membazir sumber. Laksamana memberi kau peluang lagi.|Budget ran out before the ship sank. Firing cannons without testing wastes resources. The Admiral gives you another chance.'), '💦', c.L('Gagal|Failed'), () => { this.baru(m); }); return; }
        }
        this.laut(c, m);
      }));
    },
    interaksi(c, m) { return [{ x: m.p.x, z: m.p.z, label: c.L('Ke laut|To sea'), f: () => this.laut(c, m) }]; },
    sasaran(c, m) { return m.p; },
    kemajuan(c, m) { return `🪙 ${m.syiling} / 12`; },
  };

  /* ================= TRUST ME, I'M LYING ================= */

  M.sumber = {
    objektif: 'Satu “berita viral” ditampal di papan pekan 📰. Ikut rantaian sumber dari stesen ke stesen sehingga ke asal-usulnya. Setiap stesen memetik dua “sumber”; hanya satu yang sebenar.|A “viral story” is posted on the town board 📰. Follow the chain of sources from station to station back to its origin. Each station cites two “sources”; only one is real.',
    mula(c, m, n) {
      const s = c.calon(m, n, 6, 4, 13, 3.2, n.npcPos); if (s.length < 6) return false;
      const N = ['Papan Berita Pekan|Town News Board', 'Portal BesarNews|BigNews Portal', 'Blog GosipKecil|TinyGossip Blog', 'Akaun Tanpa Nama @x|Anonymous Account @x', 'Ruangan Komen|Comments Section', 'Forum Bual|Chat Forum'];
      m.st = [
        { ...s[0], nama: N[0], teks: '“SELEBRITI ZARA DISAMAN RM10 JUTA!” Sumber: portal BesarNews.|“CELEBRITY ZARA SUED FOR RM10 MILLION!” Source: BigNews portal.', papan: true },
        { ...s[1], nama: N[1], teks: '“Kami cuma melaporkan apa yang sudah tersebar.” Artikel kami memetik…|“We only reported what was already out there.” Our article cites…' },
        { ...s[2], nama: N[2], teks: '“Aku dapat tip ni dari DM. Aku tak semak, tapi trafik naik!” Tip itu dihantar oleh…|“I got this tip from a DM. Didn’t check it, but traffic went up!” The tip was sent by…' },
        { ...s[3], nama: N[3], teks: '“Okey, okey… aku reka cerita tu. Klien aku nak publisiti untuk filem barunya.”|“Okay, okay… I made it up. My client wanted publicity for his new movie.”', asal: true },
        { ...s[4], nama: N[4], teks: '“Kami cuma berkongsi semula apa yang kami baca. Tiada sumber baharu di sini.”|“We just reshare what we read. No new source here.”', palsu: true },
        { ...s[5], nama: N[5], teks: '“Ramai yang bercakap, tapi tiada siapa tahu dari mana asalnya.”|“Lots of talk, but nobody knows where it came from.”', palsu: true },
      ];
      m.st.forEach((o, i) => {
        if (o.papan) { mesh(c, m, 'kotak', '#7a4f33', 1.2, 1.0, 0.1, o.x, 0.4, o.z); mesh(c, m, 'kotak', '#fff7e0', 1.0, 0.8, 0.12, o.x, 0.5, o.z); }
        else npc(c, m, o.x, o.z, { baju: o.asal ? '#1d1d24' : ['#3a86ff', '#ff70a6', '#6a994e', '#e9c46a'][i % 4] });
        o.l = lbl(c, m, o.x, o.papan ? 1.9 : 1.7, o.z, `<i>${o.papan ? '📰' : '❔'}</i><span>${c.esc(c.L(o.nama))}</span>`);
      });
      m.k = 0; m.sasar = 0; // stesen yang perlu dilawati seterusnya
      return true;
    },
    lawat(c, m, i) {
      const o = m.st[i];
      if (o.palsu) { m.penalti++; c.bunyi('salah'); o.l.e.querySelector('i').textContent = '✖'; c.serpihan(o.teks, '🚫', c.L('Jalan buntu|Dead end') + ' · ' + c.L(o.nama), () => this.pilih(c, m)); return; }
      if (i !== m.sasar) { c.toast(c.L('Stesen ini belum ada dalam rantaian kau. Ikut sumber yang dipetik.|This station isn’t on your chain yet. Follow the cited source.')); return; }
      c.bunyi('ambil'); o.l.e.querySelector('i').textContent = '✓';
      if (o.asal) { c.serpihan(o.teks + '\n\n' + c.nod(m).bab.titik.map((x) => '• ' + c.L(x)).join('\n'), '🕵', c.L('Asal-usul ditemui!|Origin found!'), () => c.siap()); return; }
      c.serpihan(o.teks, '🔗', c.L(o.nama), () => this.pilih(c, m));
    },
    pilih(c, m) {
      const k = m.sasar, betul = k + 1, palsu = 4 + (k % 2);
      if (betul > 3) return;
      const pil = c.kocak([betul, palsu]);
      const p = c.bukaModal(`<h2>🔗 ${c.esc(c.L('Sumber mana yang benar-benar dipetik?|Which source is actually cited?'))}</h2><p class="kecil">${c.esc(c.L('Pilih stesen untuk dilawati seterusnya.|Choose the station to visit next.'))}</p>
        <div class="pilihan">${pil.map((j, i) => `<button class="opsyen" data-j="${j}"><b>${'AB'[i]}</b><span>${c.esc(c.L(m.st[j].nama))} · ${c.esc(j === betul ? c.L('pautan dalam artikel|link inside the article') : c.L('disebut dalam komen|mentioned in comments'))}</span></button>`).join('')}</div>`, 'kecil');
      p.querySelectorAll('[data-j]').forEach((b) => (b.onclick = () => { c.tutupModal(); const j = +b.dataset.j; if (j === betul) { m.sasar = betul; m.st[betul].l.e.querySelector('i').textContent = '🎯'; } else { m.st[j].l.e.querySelector('i').textContent = '🎯'; m.cubaPalsu = j; } }));
    },
    interaksi(c, m) { return m.st.map((o, i) => ({ x: o.x, z: o.z, label: c.L('Siasat sumber|Check source'), f: () => { if (i === m.cubaPalsu) m.cubaPalsu = null; this.lawat(c, m, i); } })); },
    sasaran(c, m) { return m.cubaPalsu != null ? m.st[m.cubaPalsu] : m.st[m.sasar]; },
    kemajuan(c, m) { return `🔗 ${m.sasar} / 3`; },
  };

  const CERITA = [
    { s: 'Kajian: minum kopi dikaitkan dengan umur lebih panjang dalam satu kumpulan kecil.|Study: coffee drinking linked to longer life in a small group.', h: ['KOPI MEMBUAT ANDA HIDUP SELAMANYA!|COFFEE MAKES YOU LIVE FOREVER!', 'Kajian kecil kaitkan kopi dengan umur lebih panjang; lebih banyak kajian diperlukan|Small study links coffee to longer life; more research needed', 'Laporan kajian tentang minuman|Report on a beverage study'] },
    { s: 'Majlis bandar menangguhkan undian bajet taman.|City council postpones park budget vote.', h: ['SKANDAL! MAJLIS SEMBUNYIKAN WANG TAMAN?|SCANDAL! COUNCIL HIDING PARK MONEY?', 'Undian bajet taman ditangguh kepada minggu depan, kata majlis|Park budget vote delayed to next week, council says', 'Mesyuarat majlis diadakan|Council meeting held'] },
    { s: 'Sebuah syarikat teknologi memberhentikan 3% pekerja.|A tech company lays off 3% of staff.', h: ['SYARIKAT RUNTUH! PEKERJA DIBUANG BERAMAI-RAMAI!|COMPANY COLLAPSING! MASS FIRINGS!', 'Syarikat teknologi buang 3% pekerja selepas jualan perlahan|Tech firm cuts 3% of jobs after slower sales', 'Perubahan kakitangan di sebuah syarikat|Staffing changes at a company'] },
    { s: 'Seorang pelakon tidak hadir ke majlis anugerah.|An actor skipped an awards show.', h: ['ADAKAH DIA BERMUSUH DENGAN SEMUA ORANG?!|IS SHE FEUDING WITH EVERYONE?!', 'Pelakon tidak hadir anugerah; jurucakap sebut jadual penggambaran|Actor misses awards; spokesperson cites filming schedule', 'Majlis anugerah berlangsung|Awards show takes place'] },
    { s: 'Hujan lebat dijangka hujung minggu ini.|Heavy rain expected this weekend.', h: ['BENCANA BESAR AKAN MELANDA! BERSEDIALAH!|HUGE DISASTER INCOMING! PREPARE!', 'Hujan lebat dijangka; jabatan cuaca nasihatkan berhati-hati|Heavy rain expected; weather office urges caution', 'Ramalan cuaca dikeluarkan|Weather forecast issued'] },
  ];
  M.beritaBilik = {
    objektif: 'Masuk ke Bilik Berita 📰 dan jadi editor untuk 5 cerita. Tajuk sensasi menaikkan klik tetapi menjatuhkan Kepercayaan. Tamatkan hari dengan kedua-dua meter sekurang-kurangnya 50.|Enter the Newsroom 📰 and edit 5 stories. Sensational headlines raise clicks but drop Trust. End the day with both meters at 50 or more.',
    mula(c, m, n) {
      const p = c.calon(m, n, 1, 4, 7, 0, n.npcPos)[0]; if (!p) return false;
      m.p = p; mesh(c, m, 'kotak', '#e8e1f3', 2.2, 1.4, 1.6, p.x, 0, p.z - 1.6); mesh(c, m, 'kotak', '#7d5ba6', 2.4, 0.15, 1.8, p.x, 1.4, p.z - 1.6);
      npc(c, m, p.x, p.z, { baju: '#7d5ba6' }); lbl(c, m, p.x, 1.8, p.z, '<i>📰</i>');
      this.baru(m); return true;
    },
    baru(m) { m.i = 0; m.klik = 20; m.percaya = 60; },
    meja(c, m) {
      if (m.i >= CERITA.length) return this.tamat(c, m);
      const cr = CERITA[m.i], pil = c.kocak([0, 1, 2]);
      const meter = (n, v, w) => `<div class="meter"><small>${n}</small><div class="bar"><i style="width:${Math.max(0, Math.min(100, v))}%;background:${w}"></i></div><b>${v}</b></div>`;
      const p = c.bukaModal(`<h2>📰 ${c.esc(c.L('Bilik Berita|Newsroom'))} · ${m.i + 1}/5</h2>
        ${meter('📈 ' + c.esc(c.L('Klik|Clicks')), m.klik, '#ff8c42')}${meter('🤝 ' + c.esc(c.L('Kepercayaan|Trust')), m.percaya, '#2a9d8f')}
        <p class="cerita">${c.esc(c.L(cr.s))}</p><p class="kecil">${c.esc(c.L('Pilih tajuk:|Choose a headline:'))}</p>
        <div class="pilihan">${pil.map((k, i) => `<button class="opsyen" data-k="${k}"><b>${'ABC'[i]}</b><span>${c.esc(c.L(cr.h[k]))}</span></button>`).join('')}</div>`, 'kecil');
      p.querySelectorAll('[data-k]').forEach((b) => (b.onclick = () => {
        const k = +b.dataset.k; m.klik += [25, 15, 3][k]; m.percaya += [-20, 5, 3][k]; m.i++; c.bunyi(k === 1 ? 'betul' : 'klik'); this.meja(c, m);
      }));
    },
    tamat(c, m) {
      const lulus = m.klik >= 50 && m.percaya >= 50;
      const sebab = m.percaya < 50 ? 'Pembaca hilang kepercayaan. Trafik tinggi hari ini, tetapi reputasi laman musnah.|Readers lost trust. High traffic today, but the site’s reputation is ruined.' : m.klik < 50 ? 'Tajuk terlalu hambar; tiada siapa membaca dan laman hampir bankrap.|Headlines too dull; nobody read and the site nearly went broke.' : 'Tajuk yang jujur dan jelas mengimbangi klik dan kepercayaan.|Honest, clear headlines balanced clicks and trust.';
      const p = c.bukaModal(`<h2>📰 ${c.esc(c.L('Tamat hari|End of day'))}</h2><p class="skor">📈 ${m.klik} · 🤝 ${m.percaya}</p><p>${c.esc(c.L(sebab))}</p><div class="butang"><button class="btn utama" data-a="n">${c.esc(lulus ? c.t('seterusnya') : c.t('cubaLagi'))}</button></div>`, 'kecil');
      p.querySelector('[data-a=n]').onclick = () => { c.tutupModal(); if (lulus) c.serpihan(c.nod(m).bab.titik.map((x) => '• ' + c.L(x)).join('\n'), '📰', c.L('Pengajaran bilik berita|Newsroom lessons'), () => c.siap()); else { m.penalti++; this.baru(m); } };
    },
    interaksi(c, m) { return [{ x: m.p.x, z: m.p.z, label: c.L('Masuk bilik berita|Enter newsroom'), f: () => this.meja(c, m) }]; },
    sasaran(c, m) { return m.p; },
    kemajuan(c, m) { return `📰 ${m.i} / 5`; },
  };

  M.pembetulan = {
    objektif: 'Khabar palsu 🔥 sedang tersebar dari penduduk ke penduduk. Berlari dan sentuh setiap penduduk yang “terbakar” untuk memberi fakta 💧. Kau mesti lebih pantas daripada penyebaran!|A false rumour 🔥 is spreading from villager to villager. Run and touch each “burning” villager to give them the facts 💧. You must outpace the spread!',
    mula(c, m, n) {
      const s = c.calon(m, n, 8, 3, 11, 2.6, n.npcPos); if (s.length < 8) return false;
      m.org = s.map((p, i) => ({ ...p, w: npc(c, m, p.x, p.z, {}), l: lbl(c, m, p.x, 1.7, p.z, '<i>🙂</i>'), k: 'sihat' }));
      m.mula = false; m.t = 0;
      return true;
    },
    set(o, k) { o.k = k; o.l.e.innerHTML = `<i class="${k === 'fakta' ? 'siap' : ''}">${{ sihat: '🙂', api: '🔥', fakta: '✓' }[k]}</i>`; },
    kemas(c, m, dt) {
      if (m.fasa !== 'cari' || c.modalTerbuka) return;
      if (!m.mula) { if (jarak(pem(c), c.nod(m).npcPos) > 2.5) { m.mula = true; this.set(m.org[m.org.length - 1], 'api'); c.toast('🔥 ' + c.L('Khabar palsu mula tersebar!|The rumour starts spreading!')); } return; }
      for (const o of m.org) if (o.k === 'api' && jarak(o, pem(c)) < 1.0) { this.set(o, 'fakta'); c.bunyi('ambil'); c.tambahXP(4); }
      m.t += dt;
      if (m.t >= 5.5) {
        m.t = 0;
        for (const o of m.org.filter((x) => x.k === 'api')) {
          const sasar = m.org.filter((x) => x.k === 'sihat').sort((a, b) => jarak(a, o) - jarak(b, o))[0];
          if (sasar && jarak(sasar, o) < 7) this.set(sasar, 'api');
        }
      }
      const api = m.org.filter((x) => x.k === 'api').length, sihat = m.org.filter((x) => x.k === 'sihat').length;
      if (!api) { m.fasa = 'tunggu'; c.bunyi('buka'); c.serpihan(c.L('Semua api dipadam. Pembetulan berjaya kerana ia dibawa terus kepada setiap orang yang terkena, dengan pantas. Dalam dunia sebenar, pembetulan jarang sampai sejauh pembohongan asal.\n\n|Every fire is out. The correction worked because it reached each affected person directly, and fast. In the real world, corrections rarely travel as far as the original lie.\n\n') + c.nod(m).bab.titik.map((x) => '• ' + c.L(x)).join('\n'), '💧', c.L('Khabar palsu dipadam|Rumour extinguished'), () => c.siap()); }
      else if (api >= 6) {
        c.gagal(c.L('Khabar palsu menguasai pekan. Pembohongan berlari, pembetulan merangkak. −1 nyawa|The rumour took over the town. Lies run, corrections crawl. −1 heart'));
      }
    },
    sasaran(c, m) { return m.org.filter((x) => x.k === 'api').sort((a, b) => jarak(a, pem(c)) - jarak(b, pem(c)))[0] || null; },
    kemajuan(c, m) { return m.mula ? `🔥 ${m.org.filter((x) => x.k === 'api').length} · ✓ ${m.org.filter((x) => x.k === 'fakta').length} / ${m.org.length}` : '🏃 ' + c.L('Bergerak untuk mula|Move to start'); },
  };

  /* ================= ẒĀHIRAT AL-NIFĀQ ================= */

  M.cermin = {
    objektif: 'Lalui lorong 4 cermin 🪞. Setiap cermin menunjukkan rekod sebenar kau dalam ekspedisi ini. Jawab dengan jujur, seperti para sahabat yang takut nifaq dalam diri sendiri.|Walk the lane of 4 mirrors 🪞. Each mirror shows your real record in this expedition. Answer honestly, like the Companions who feared hypocrisy within themselves.',
    mula(c, m, n) {
      const akhir = c.calon(m, n, 1, 9, 13, 0, n.npcPos)[0]; if (!akhir) return false;
      const boleh = (a, b) => c.dunia.boleh(a, b, c.had(m)), j = EB.cariLaluan(boleh, n.npcPos.x, n.npcPos.z, akhir.x, akhir.z, 5000); if (!j || j.length < 9) return false;
      const st = c.S.stat || {};
      const soal = [
        `Kau telah menerima ${st.terima || 0} misi dan menyiapkan ${st.siap || 0}. Janji yang tidak ditunaikan ialah antara tanda nifaq kecil.|You have accepted ${st.terima || 0} missions and completed ${st.siap || 0}. Unkept promises are among the signs of minor hypocrisy.`,
        `Kau tersilap ${st.salah || 0} kali dalam cabaran. Adakah kau benar-benar membaca setiap serpihan, atau sekadar menekan “Seterusnya”?|You erred ${st.salah || 0} times in challenges. Did you truly read every shard, or just press “Next”?`,
        (st.goda || 0) ? `Kau pernah ${st.goda} kali menerima tawaran penggoda demi ganjaran segera.|You accepted a tempter’s offer ${st.goda} time(s) for an instant reward.` : 'Kau belum pernah menerima tawaran penggoda. Adakah kerana kuat, atau kerana belum benar-benar diuji?|You have never accepted a tempter’s offer. Is it strength, or have you not truly been tested?',
        'Dalam permainan ini, adakah kau berlagak tahu di hadapan orang lain sedangkan hati kau belum faham?|In this game, do you act knowledgeable before others while your heart hasn’t understood?',
      ];
      m.c = [2, 4, 6, 8].map((k, i) => {
        const [x, z] = j[Math.min(k, j.length - 1)];
        const g = kumpulan(c, m, x + 0.9, z);
        tambahKe(g, 'kotak', '#6b4429', 0.9, 1.9, 0.14, 0, 0, 0);
        const kaca = tambahKe(g, 'kotak', '#cfe8ff', 0.72, 1.65, 0.16, 0, 0.12, 0, 0.35); kaca.material = new T.MeshStandardMaterial({ color: 0xcfe8ff, metalness: 0.9, roughness: 0.08, emissive: 0x3a5a80, emissiveIntensity: 0.25 });
        g.rotation.y = Math.PI / 2;
        return { x, z, kaca, teks: soal[i], l: lbl(c, m, x + 0.9, 2.3, z, '<i>🪞</i>'), siap: false };
      });
      return true;
    },
    renung(c, m, o) {
      modalPilih(c, `<div class="kad-serpihan"><div class="ikon">🪞</div><p>${c.esc(c.L(o.teks))}</p></div>`, c.kocak(['Aku akui, dan aku berazam memperbaikinya.|I admit it, and I resolve to improve.', 'Itu bukan salah aku; keadaan yang memaksa.|It’s not my fault; circumstances forced me.', 'Aku pasti bebas daripada semua ini.|I’m surely free of all this.']), (i, p) => {
        const pilih = p.querySelectorAll('.opsyen')[i].querySelector('span').textContent, ok = pilih === c.L('Aku akui, dan aku berazam memperbaikinya.|I admit it, and I resolve to improve.');
        o.siap = true; o.l.e.innerHTML = `<i class="siap">${ok ? '✓' : '✖'}</i>`;
        if (!ok) { m.penalti++; o.kaca.material = EB.mat('#5a6270'); c.bunyi('salah'); } else c.bunyi('betul');
        maklum(c, p, ok, ok ? 'Seperti Kaʿb bin Malik, kejujuran terhadap diri sendiri ialah jalan keluar sebenar.|Like Kaʿb ibn Malik, honesty with oneself is the real way out.' : 'Al-Hasan berkata: tiada yang merasa aman daripada nifaq kecuali munafik. Cermin ini retak.|Al-Hasan said: none feels safe from hypocrisy but a hypocrite. This mirror cracks.', null, () => {
          const k = m.c.filter((x) => x.siap).length;
          if (k >= 4) c.serpihan(c.nod(m).bab.titik.map((x) => '• ' + c.L(x)).join('\n'), '🪞', c.L('Muhasabah selesai|Reflection complete'), () => c.siap());
        });
      });
    },
    kemas(c, m) { if (m.fasa !== 'cari' || c.modalTerbuka) return; for (const o of m.c) if (!o.siap && jarak(o, pem(c)) < 1.6) { c.pemain.berhenti(); this.renung(c, m, o); return; } },
    sasaran(c, m) { return m.c.find((o) => !o.siap) || null; },
    kemajuan(c, m) { return `🪞 ${m.c.filter((o) => o.siap).length} / 4`; },
  };

  const JANJI = [
    { n: 'Rafiq|Rafiq', j: '“Saudaraku! Apa sahaja kerja, aku orang pertama datang. Percayalah!”|“Brother! Whatever the job, I’ll be first to come. Trust me!”', ikhlas: false },
    { n: 'Hasan|Hasan', j: '“Insya-Allah aku cuba bantu.”|“God willing, I’ll try to help.”', ikhlas: true },
    { n: 'Labib|Labib', j: '“Kerja berat? Tiada masalah! Aku lebih kuat daripada sesiapa di kampung ini!”|“Heavy work? No problem! I’m stronger than anyone in this village!”', ikhlas: false },
    { n: 'Umar|Umar', j: '“Hmm. Jangan banyak cakap, bila masa sampai aku ada.”|“Hmm. Less talk, I’ll be there when it’s time.”', ikhlas: true },
  ];
  M.lahn = {
    objektif: 'Dengar janji 4 penduduk 🗣. Kemudian “kerja berat” akan tiba di tapak binaan 🪨. Perhatikan siapa yang benar-benar datang. Nilai berdasarkan perbuatan yang terbukti, bukan kata-kata manis atau kasar.|Hear the promises of 4 villagers 🗣. Then “heavy work” will arrive at the work site 🪨. Watch who actually comes. Judge by proven actions, not sweet or blunt words.',
    mula(c, m, n) {
      const s = c.calon(m, n, 6, 4, 12, 3.2, n.npcPos); if (s.length < 6) return false;
      m.tapak = s[4]; m.lari = s[5];
      mesh(c, m, 'batu', '#a9b0b3', 0.5, 0.4, 0.5, s[4].x - 0.6, 0, s[4].z); mesh(c, m, 'batu', '#9aa3a8', 0.4, 0.35, 0.4, s[4].x + 0.5, 0, s[4].z + 0.3); mesh(c, m, 'batu', '#b5b9bb', 0.35, 0.3, 0.35, s[4].x, 0, s[4].z - 0.6);
      m.lTapak = lbl(c, m, s[4].x, 1.3, s[4].z, '<i>🪨</i>'); m.lTapak.e.style.opacity = 0.35;
      m.org = JANJI.map((o, i) => ({ ...o, ...s[i], w: npc(c, m, s[i].x, s[i].z, { baju: ['#e9c46a', '#2a9d8f', '#f4a261', '#264653'][i] }), l: lbl(c, m, s[i].x, 1.7, s[i].z, `<i>🗣</i><span>${c.esc(c.L(o.n))}</span>`), dengar: false }));
      m.fasa2 = 'dengar';
      return true;
    },
    dengar(c, m, o) {
      o.dengar = true; c.bunyi('ambil'); o.l.e.querySelector('i').textContent = '✓';
      c.serpihan(o.j, '🗣', c.L(o.n), () => {
        if (m.org.every((x) => x.dengar)) { m.fasa2 = 'kerja'; m.lTapak.e.style.opacity = 1; c.toast('🪨 ' + c.L('Kerja berat tiba! Pergi ke tapak binaan.|Heavy work has arrived! Go to the work site.')); }
      });
    },
    kemas(c, m, dt, tm) {
      for (const o of m.org) if (o.w.urusSendiri) gerak(o.w, dt, tm);
      if (m.fasa !== 'cari' || c.modalTerbuka) return;
      if (m.fasa2 === 'kerja' && jarak(pem(c), m.tapak) < 3.2) {
        m.fasa2 = 'lihat'; m.tLihat = 0;
        m.org.forEach((o, i) => { arahKe(c, o.w, o.ikhlas ? { x: m.tapak.x + (i - 1.5) * 0.7, z: m.tapak.z + 0.9 } : { x: m.lari.x + i * 0.5, z: m.lari.z }, o.ikhlas ? 1.5 : 1.9); });
        c.toast('👀 ' + c.L('Perhatikan siapa yang datang membantu…|Watch who comes to help…'));
      }
      if (m.fasa2 === 'lihat') { m.tLihat += dt; if (m.tLihat > 7) { m.fasa2 = 'nilai'; m.lTapak.e.innerHTML = '<i>⚖</i>'; } }
    },
    nilai(c, m) {
      const pilih = new Set(), urut = m.org.map((_, i) => i);
      const p = c.bukaModal(`<h2>⚖ ${c.esc(c.L('Siapa kata-katanya tidak selari dengan perbuatan?|Whose words didn’t match their actions?'))}</h2><p class="kecil">${c.esc(c.L('Pilih 2 orang, berdasarkan apa yang kau lihat, bukan apa yang kau dengar.|Pick 2 people, based on what you saw, not what you heard.'))}</p>
        <div class="pilihan">${urut.map((i) => `<button class="opsyen pilih" data-i="${i}"><b>☐</b><span>${c.esc(c.L(m.org[i].n))}: ${c.esc(c.L(m.org[i].j))}</span></button>`).join('')}</div>
        <button class="btn utama lebar" data-a="ok" disabled>${c.esc(c.L('Sahkan|Confirm'))}</button><div class="maklum" hidden></div>`, 'kecil');
      const sah = p.querySelector('[data-a=ok]');
      p.querySelectorAll('[data-i]').forEach((b) => (b.onclick = () => { const i = +b.dataset.i; if (pilih.has(i)) pilih.delete(i); else if (pilih.size < 2) pilih.add(i); p.querySelectorAll('[data-i]').forEach((x, k) => { x.classList.toggle('dipilih', pilih.has(k)); x.querySelector('b').textContent = pilih.has(k) ? '☑' : '☐'; }); sah.disabled = pilih.size !== 2; }));
      sah.onclick = () => {
        sah.hidden = true;
        const ok = [...pilih].every((i) => !m.org[i].ikhlas);
        p.querySelectorAll('[data-i]').forEach((b, k) => { b.disabled = true; if (!m.org[k].ikhlas) b.classList.add('betul'); else if (pilih.has(k)) b.classList.add('salah'); });
        if (!ok) m.penalti++; c.bunyi(ok ? 'betul' : 'salah');
        maklum(c, p, ok, 'Rafiq dan Labib berjanji paling manis dan lantang, tetapi pergi apabila kerja berat tiba. Umar bercakap kasar dan Hasan merendah diri, tetapi kedua-duanya datang. Munafik dikenali melalui lahn al-qaul dan, lebih penting, melalui perbuatan yang terbukti.|Rafiq and Labib made the sweetest, loudest promises but left when the heavy work came. Umar spoke bluntly and Hasan humbly, yet both came. Hypocrites are known by lahn al-qawl and, more importantly, by proven actions.', null,
          () => c.serpihan(c.nod(m).bab.titik.map((x) => '• ' + c.L(x)).join('\n'), '⚖', c.L('Neraca perbuatan|The scale of deeds'), () => c.siap()));
      };
    },
    interaksi(c, m) {
      if (m.fasa2 === 'dengar') return m.org.filter((o) => !o.dengar).map((o) => ({ x: o.x, z: o.z, label: c.L('Dengar|Listen'), f: () => this.dengar(c, m, o) }));
      if (m.fasa2 === 'nilai') return [{ x: m.tapak.x, z: m.tapak.z, label: c.L('Nilai|Judge'), f: () => this.nilai(c, m) }];
      return [];
    },
    sasaran(c, m) { return m.fasa2 === 'dengar' ? m.org.find((o) => !o.dengar) : m.fasa2 === 'lihat' ? null : m.tapak; },
    kemajuan(c, m) { return { dengar: `🗣 ${m.org.filter((o) => o.dengar).length} / 4`, kerja: '🪨 ' + c.L('Ke tapak binaan|To the work site'), lihat: '👀 ' + c.L('Perhatikan…|Watch…'), nilai: '⚖ ' + c.L('Nilai di tapak|Judge at the site') }[m.fasa2]; },
  };

  const DHIRAR = [
    { t: 'Kubahnya berkilau dan seni binanya sangat indah.|Its dome gleams and its architecture is beautiful.', benar: false, j: 'kubah' },
    { t: 'Ramai orang datang setiap hari, bangunannya sentiasa penuh.|Many people come every day; it’s always full.', benar: false, j: 'ramai' },
    { t: 'Seorang yang terkenal memusuhi Rasul datang pada waktu malam dan dialu-alukan sebagai tetamu kehormat.|A man known for opposing the Messenger arrives at night and is welcomed as an honoured guest.', benar: true, j: 'tetamu' },
    { t: 'Di sudut bangunan, beberapa orang berbisik merancang supaya jemaah meninggalkan masjid lama.|In a corner, some whisper plans to draw worshippers away from the old mosque.', benar: true, j: 'bisik' },
    { t: 'Sejak bangunan ini dibuka, penduduk kampung berpecah dua dan saling curiga.|Since this building opened, the villagers have split in two and distrust each other.', benar: true, j: 'kesan' },
  ];
  M.dhirar = {
    objektif: 'Siasat bangunan baharu yang kelihatan mulia 🕌. Periksa 5 perkara: rupa, pengunjung, siapa yang masuk, apa yang berlaku, dan kesannya. Kemudian nilai tujuan sebenarnya.|Investigate the noble-looking new building 🕌. Inspect 5 things: appearance, visitors, who enters, what happens, and its effects. Then judge its real purpose.',
    mula(c, m, n) {
      const s = c.calon(m, n, 6, 3.5, 11, 2.6, n.npcPos); if (s.length < 6) return false;
      const b = kumpulan(c, m, s[0].x, s[0].z);
      tambahKe(b, 'kotak', '#f4efe4', 2.0, 1.4, 1.8, 0, 0, 0); tambahKe(b, 'bola', '#d4af37', 0.75, 0.6, 0.75, 0, 1.4, 0, 0.25);
      tambahKe(b, 'silinder6', '#f4efe4', 0.2, 2.6, 0.2, 1.2, 0, 0.7); tambahKe(b, 'kon6', '#d4af37', 0.25, 0.5, 0.25, 1.2, 2.6, 0.7);
      lbl(c, m, s[0].x, 2.9, s[0].z, '<i>🕌</i>');
      const tempat = [s[0], s[1], s[2], s[3], s[4]], rnd = c.rnd(m, 91);
      m.petunjuk = DHIRAR.map((d, i) => {
        const p = i === 0 ? { x: s[0].x + 1.4, z: s[0].z + 1.2 } : tempat[i];
        if (i > 0) npc(c, m, p.x, p.z, { baju: d.j === 'tetamu' ? '#1d1d24' : '#6d597a', jubah: d.j === 'tetamu' ? '#3c096c' : undefined }, rnd);
        return { t: d.t, benar: d.benar, ...p, diperiksa: false, lbl: lbl(c, m, p.x, 1.6, p.z, '<i>🔍</i>', 'tanya') };
      });
      return true;
    },
    periksa(c, m, o) { return M.siasat.periksa(c, m, o); },
    interaksi(c, m) { return m.petunjuk.map((o) => ({ x: o.x, z: o.z, label: c.L('Periksa|Inspect'), f: () => M.siasat.periksa(c, m, o) })); },
    sasaran(c, m) { return M.siasat.sasaran(c, m); },
    kemajuan(c, m) { return M.siasat.kemajuan(c, m); },
    soalanTambahan(c, m, n) {
      return [{ pelbagai: 3, label: c.L('Masjid Dhirar|Masjid al-Dirar'), soalan: 'Pilih 3 pemerhatian yang benar-benar menunjukkan tujuan sebenar bangunan ini. 2 lagi hanya rupa luaran.|Pick the 3 observations that truly reveal this building’s real purpose. The other 2 are mere appearance.', pilihan: m.petunjuk.map((o) => o.t), betulSet: m.petunjuk.filter((o) => o.benar).map((o) => o.t), terang: 'Nilai institusi pada tujuan dan kesannya, bukan rupa luaran.|Judge institutions by purpose and effect, not outward appearance.', nod: n.idx, serpihan: true }];
    },
  };
})();
