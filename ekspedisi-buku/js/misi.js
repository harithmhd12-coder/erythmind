/* Ekspedisi Buku · Jenis-jenis misi.
   Setiap pengendali menerima ctx (alat daripada permainan.js) dan objek misi m.
   Antara muka: objektif, mula(c,m,n) → false jika tidak boleh dipasang, kemas(c,m,dt,tm), interaksi(c,m) → [{x,z,f}],
   sasaran(c,m) → {x,z}|null, kemajuan(c,m) → teks, soalanTambahan(c,m,n) → [soalan], reset(c,m).
   Objek 3D masuk m.obj, NPC masuk m.npc, label masuk m.label: semuanya dibuang secara automatik. */
(function () {
  const EB = (window.EB = window.EB || {});
  const T = THREE;
  const M = (EB.MISI = {});
  const jarak = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

  /* ---------- Alat visual ---------- */
  const geoTapak = new T.CircleGeometry(0.11, 10).rotateX(-Math.PI / 2);
  function jejakKaki(c, m, dari, ke, warna) {
    const boleh = (a, b) => c.dunia.boleh(a, b, c.had(m));
    const j = EB.cariLaluan(boleh, dari.x, dari.z, ke.x, ke.z, 4000);
    if (!j) return [];
    const mat = new T.MeshBasicMaterial({ color: warna || 0xffe066, transparent: true, opacity: 0.85, depthWrite: false });
    const tapak = [];
    let baki = 0.4, sisi = 1;
    for (let i = 1; i < j.length; i++) {
      const [ax, az] = j[i - 1], [bx, bz] = j[i], d = Math.hypot(bx - ax, bz - az);
      const ux = (bx - ax) / d, uz = (bz - az) / d;
      for (let s = baki; s < d; s += 0.75) {
        const t = new T.Mesh(geoTapak, mat);
        t.position.set(ax + ux * s - uz * 0.13 * sisi, 0.02, az + uz * s + ux * 0.13 * sisi);
        t.scale.set(1, 1, 1.6); t.rotation.y = Math.atan2(ux, uz);
        c.dunia.scene.add(t); m.obj.push(t); tapak.push(t); sisi = -sisi;
      }
      baki = 0.75 - ((d - baki) % 0.75);
    }
    tapak.forEach((t, i) => (t.userData.i = i));
    m.tapak = (m.tapak || []).concat(tapak);
    return tapak;
  }
  function bendera(c, m, x, z, hex) {
    const g = new T.Group();
    const tiang = new T.Mesh(EB.tpl().kotak, EB.mat('#6b4429')); tiang.scale.set(0.07, 1.6, 0.07); tiang.castShadow = true; g.add(tiang);
    const kain = new T.Mesh(EB.tpl().kotak, EB.mat(hex, 0.35)); kain.scale.set(0.05, 0.45, 0.7); kain.position.set(0, 1.1, 0.35); g.add(kain);
    const cincin = new T.Mesh(new T.RingGeometry(0.4, 0.55, 24).rotateX(-Math.PI / 2), new T.MeshBasicMaterial({ color: hex, transparent: true, opacity: 0.7, depthWrite: false }));
    cincin.position.y = 0.03; g.add(cincin);
    g.position.set(x, 0, z); c.dunia.scene.add(g); m.obj.push(g);
    return g;
  }
  function papanTanda(c, m, x, z) {
    const g = new T.Group();
    const tiang = new T.Mesh(EB.tpl().kotak, EB.mat('#7a4f33')); tiang.scale.set(0.1, 1.5, 0.1); tiang.castShadow = true; g.add(tiang);
    [['#3a86ff', 0.5], ['#ff8c42', -0.5]].forEach(([h, s], i) => {
      const p = new T.Mesh(EB.tpl().kotak, EB.mat(h, 0.2)); p.scale.set(0.7, 0.22, 0.06); p.position.set(s * 0.32, 1.05 - i * 0.3, 0); p.castShadow = true; g.add(p);
    });
    g.position.set(x, 0, z); c.dunia.scene.add(g); m.obj.push(g);
    return g;
  }
  function objekSiasat(c, m, x, z, jenis) {
    const g = new T.Group();
    const tambah = (nama, hex, sx, sy, sz, px, py, pz, ry) => { const o = new T.Mesh(EB.tpl()[nama], EB.mat(hex)); o.scale.set(sx, sy, sz); o.position.set(px || 0, py || 0, pz || 0); o.rotation.y = ry || 0; o.castShadow = true; g.add(o); };
    if (jenis === 0) { tambah('kotak', '#b98552', 0.6, 0.55, 0.6); tambah('kotak', '#8a5a3b', 0.64, 0.06, 0.64, 0, 0.3); }
    else if (jenis === 1) { tambah('silinder', '#9a6a40', 0.3, 0.7, 0.3); tambah('silinder', '#5b3a24', 0.32, 0.05, 0.32, 0, 0.2); tambah('silinder', '#5b3a24', 0.32, 0.05, 0.32, 0, 0.5); }
    else if (jenis === 2) { tambah('silinder6', '#bdb5a7', 0.25, 0.7, 0.25); tambah('silinder', '#f3e6cc', 0.09, 0.45, 0.09, 0, 0.75, 0, 0); g.children[1].rotation.z = Math.PI / 2; }
    else { tambah('kotak', '#8a5a3b', 0.7, 0.5, 0.4); tambah('kotak', '#fff7e0', 0.5, 0.04, 0.3, 0, 0.5); }
    g.position.set(x, 0, z); c.dunia.scene.add(g); m.obj.push(g);
    return g;
  }
  function kotakBawa(c, m) {
    const k = new T.Mesh(EB.tpl().kotak, EB.mat('#c48c56', 0.15)); k.scale.set(0.32, 0.28, 0.3); k.position.set(0, 0.55, -0.24); k.castShadow = true;
    c.pemain.model.userData.badan.add(k); m.kotak = k;
  }
  function buangKotak(m) { if (m.kotak && m.kotak.parent) m.kotak.parent.remove(m.kotak); m.kotak = null; }

  /* ---------- 1. Ikut Jejak ---------- */
  M.jejak = {
    objektif: 'Ikut jejak kaki bercahaya. Di setiap persimpangan, pilih jalan yang selari dengan idea bab. Salah pilih = jalan mati.|Follow the glowing footprints. At each crossroads, take the path that matches the chapter’s idea. Wrong choice = dead end.',
    mula(c, m, n) {
      const rnd = c.rnd(m, 11), lain = c.titikLain(n, 3, rnd);
      m.simpang = []; let dari = n.npcPos;
      for (let k = 0; k < 3; k++) {
        const J = c.calon(m, n, 1, 4.5, 7.5, 3, dari, [n.npcPos, ...m.simpang.map((s) => s.J)])[0];
        if (!J) return false;
        const cab = c.calon(m, n, 2, 3.5, 5.5, 4, J, [dari, n.npcPos, ...m.simpang.map((s) => s.J)]);
        if (cab.length < 2) return false;
        const betulA = rnd() < 0.5;
        m.simpang.push({ J, A: cab[0], B: cab[1], betul: betulA ? 'A' : 'B', teksBetul: n.bab.titik[k], teksSalah: lain[k], mati: {} });
        dari = betulA ? cab[0] : cab[1];
      }
      m.k = 0; m.fasa2 = 'tuju';
      jejakKaki(c, m, n.npcPos, m.simpang[0].J);
      this.pasangSimpang(c, m);
      return true;
    },
    pasangSimpang(c, m) {
      const s = m.simpang[m.k];
      s.papan = papanTanda(c, m, s.J.x, s.J.z);
      s.lbl = c.tambahLabel(new T.Vector3(s.J.x, 1.9, s.J.z), 'misi', `<i>🪧</i><span>${c.esc(c.L('Persimpangan|Crossroads'))} ${m.k + 1}/3</span>`);
      m.label.push(s.lbl);
    },
    bukaPapan(c, m) {
      const s = m.simpang[m.k];
      const baris = (h, w, teks, mati) => `<div class="papan-pilih ${w}${mati ? ' mati' : ''}"><b>${h}</b><span>${c.esc(c.L(teks))}</span>${mati ? `<em>${c.esc(c.L('Jalan mati|Dead end'))}</em>` : ''}</div>`;
      const tA = s.betul === 'A' ? s.teksBetul : s.teksSalah, tB = s.betul === 'B' ? s.teksBetul : s.teksSalah;
      const p = c.bukaModal(`<h2>🪧 ${c.esc(c.L('Persimpangan|Crossroads'))} ${m.k + 1} / 3</h2>
        <p class="kecil">${c.esc(c.L('Dua jalan di hadapan. Hanya satu selari dengan idea bab ini. Berjalan ke bendera pilihan kau.|Two paths ahead. Only one matches this chapter’s idea. Walk to the flag you choose.'))}</p>
        ${baris('🔵 ' + c.L('Bendera BIRU|BLUE flag'), 'biru', tA, s.mati.A)}${baris('🟠 ' + c.L('Bendera JINGGA|ORANGE flag'), 'jingga', tB, s.mati.B)}
        <div class="butang"><button class="btn utama" data-a="x">${c.esc(c.L('Pilih dengan kaki|Choose with your feet'))} →</button></div>`, 'kecil');
      p.querySelector('[data-a=x]').onclick = c.tutupModal;
      if (m.fasa2 === 'tuju') {
        m.fasa2 = 'pilih';
        s.bA = bendera(c, m, s.A.x, s.A.z, '#3a86ff'); s.bB = bendera(c, m, s.B.x, s.B.z, '#ff8c42');
        s.lA = c.tambahLabel(new T.Vector3(s.A.x, 2.1, s.A.z), 'misi', '<i>🔵</i>'); s.lB = c.tambahLabel(new T.Vector3(s.B.x, 2.1, s.B.z), 'misi', '<i>🟠</i>'); m.label.push(s.lA, s.lB);
        jejakKaki(c, m, s.J, s.A, 0x9cc4ff); jejakKaki(c, m, s.J, s.B, 0xffc49a);
      }
    },
    kemas(c, m, dt, tm) {
      if (m.tapak) m.tapak.forEach((t) => { t.material.opacity = 0.35 + 0.5 * Math.max(0, Math.sin(tm * 4 - t.userData.i * 0.35)); });
      if (c.modalTerbuka || m.fasa !== 'cari') return;
      const s = m.simpang[m.k], p = { x: c.pemain.pos.x, z: c.pemain.pos.y };
      if (m.fasa2 === 'tuju' && jarak(p, s.J) < 1.3) { this.bukaPapan(c, m); return; }
      if (m.fasa2 !== 'pilih') return;
      for (const sisi of ['A', 'B']) {
        if (s.mati[sisi] || jarak(p, s[sisi]) > 1.3) continue;
        c.pemain.berhenti(); this.pilihSisi(c, m, sisi); return;
      }
    },
    pilihSisi(c, m, sisi) {
      const s = m.simpang[m.k];
      if (m.fasa2 !== 'pilih' || s.mati[sisi]) return;
      if (sisi === s.betul) {
        m.fasa2 = 'betul';
        c.bunyi('ambil');
        c.dunia.scene.remove(sisi === 'A' ? s.bB : s.bA);
        [s.lA, s.lB].forEach((l) => { if (l) { l.e.style.display = 'none'; l.pos.y = -99; } });
        if (s.lbl) s.lbl.e.innerHTML = '<i class="siap">✓</i>';
        c.serpihan(s.teksBetul, '🧭', c.L('Jalan betul|Right path') + ` ${m.k + 1} / 3`, () => {
          m.k++;
          if (m.k >= 3) return c.siap();
          m.fasa2 = 'tuju';
          jejakKaki(c, m, s[s.betul], m.simpang[m.k].J);
          this.pasangSimpang(c, m);
        });
      } else {
        s.mati[sisi] = true; m.penalti++;
        c.bunyi('salah'); c.toast(c.L('Jalan mati! Masa terbuang. Kembali ke persimpangan.|Dead end! Time wasted. Go back to the crossroads.'));
        const b = sisi === 'A' ? s.bA : s.bB; b.children[1].material = EB.mat('#7d7d7d'); b.children[2].visible = false;
        const l = sisi === 'A' ? s.lA : s.lB; if (l) l.e.innerHTML = '<i>✖</i>';
        c.awan(s[sisi].x, s[sisi].z, m);
      }
    },
    interaksi(c, m) {
      const s = m.simpang[m.k]; if (!s) return [];
      const r = [{ x: s.J.x, z: s.J.z, label: c.L('Baca papan|Read the sign'), f: () => this.bukaPapan(c, m) }];
      if (m.fasa2 === 'pilih') for (const [sisi, nama] of [['A', 'Pilih BIRU|Pick BLUE'], ['B', 'Pilih JINGGA|Pick ORANGE']]) if (!s.mati[sisi]) r.push({ x: s[sisi].x, z: s[sisi].z, label: (sisi === 'A' ? '🔵 ' : '🟠 ') + c.L(nama), f: () => this.pilihSisi(c, m, sisi) });
      return r;
    },
    sasaran(c, m) { const s = m.simpang[m.k]; return s && m.fasa2 === 'tuju' ? s.J : null; },
    kemajuan(c, m) { return `${c.L('Persimpangan|Crossroads')} ${Math.min(m.k + (m.fasa2 === 'tuju' ? 0 : 1), 3)} / 3${m.fasa2 === 'pilih' ? ' · ' + c.L('jalan ke bendera 🔵/🟠 atau tekan butang|walk to a flag 🔵/🟠 or press the button') : ''}`; },
  };

  /* ---------- 2. Siasat ---------- */
  M.siasat = {
    objektif: 'Periksa 5 objek bertanda 🔍 dan kumpul petunjuk. Hati-hati: 2 daripadanya petunjuk palsu yang bukan dari bab ini.|Inspect the 5 objects marked 🔍 and gather clues. Careful: 2 are false clues not from this chapter.',
    mula(c, m, n) {
      const rnd = c.rnd(m, 21);
      const sel = c.calon(m, n, 5, 3.5, 9, 2.6, n.npcPos);
      if (sel.length < 5) return false;
      const palsu = c.titikLain(n, 2, rnd);
      const petunjuk = c.kocak([...n.bab.titik.map((t) => ({ t, benar: true })), ...palsu.map((t) => ({ t, benar: false }))], rnd);
      m.petunjuk = petunjuk.map((p, i) => {
        const pos = sel[i];
        const o = { ...p, ...pos, diperiksa: false };
        if (i === 4) { const w = new EB.Penduduk(c.dunia, pos.x, pos.z, rnd, { statik: true, baju: '#6d597a' }); c.dunia.scene.add(w.model); m.npc.push(w); o.saksi = true; }
        else objekSiasat(c, m, pos.x, pos.z, i % 4);
        o.lbl = c.tambahLabel(new T.Vector3(pos.x, o.saksi ? 1.7 : 1.2, pos.z), 'tanya', '<i>🔍</i>'); m.label.push(o.lbl);
        return o;
      });
      return true;
    },
    periksa(c, m, o) {
      if (o.diperiksa) { c.serpihan(o.t, o.saksi ? '🗣' : '🔍', c.L('Petunjuk (sudah diperiksa)|Clue (already inspected)'), () => {}); return; }
      o.diperiksa = true; c.bunyi('ambil'); c.tambahXP(8);
      o.lbl.e.innerHTML = '<i class="siap">✓</i>';
      const n = m.petunjuk.filter((x) => x.diperiksa).length;
      c.serpihan(o.t, o.saksi ? '🗣' : '🔍', c.L('Petunjuk|Clue') + ` ${n} / 5`, () => { if (n >= 5) c.siap(); });
    },
    interaksi(c, m) { return m.petunjuk.map((o) => ({ x: o.x, z: o.z, label: c.L(o.diperiksa ? 'Baca semula|Reread' : 'Periksa|Inspect'), f: () => this.periksa(c, m, o) })); },
    kemas(c, m) { // periksa automatik apabila watak memijak atau sampai di sebelah objek
      if (m.fasa !== 'cari' || c.modalTerbuka) return;
      for (const o of m.petunjuk) if (!o.diperiksa && jarak(o, { x: c.pemain.pos.x, z: c.pemain.pos.y }) < 1.1) { this.periksa(c, m, o); return; }
    },
    sasaran(c, m) { let best = null, dm = 1e9; for (const o of m.petunjuk) if (!o.diperiksa) { const d = jarak(o, { x: c.pemain.pos.x, z: c.pemain.pos.y }); if (d < dm) { dm = d; best = o; } } return best; },
    kemajuan(c, m) { return `🔍 ${m.petunjuk.filter((x) => x.diperiksa).length} / 5`; },
    soalanTambahan(c, m, n) {
      return [{ pelbagai: 3, label: c.L('Siasatan|Investigation'), soalan: 'Pilih 3 petunjuk yang benar-benar berasal daripada bab ini. 2 lagi ialah petunjuk palsu.|Pick the 3 clues that truly come from this chapter. The other 2 are false clues.', pilihan: m.petunjuk.map((o) => o.t), betulSet: m.petunjuk.filter((o) => o.benar).map((o) => o.t), terang: n.bab.titik.join('\n'), nod: n.idx, serpihan: true }];
    },
  };

  /* ---------- 3. Kejar Pencuri ---------- */
  M.pencuri = {
    objektif: 'Seorang pencuri melarikan 3 Serpihan Ilmu! Kejar dan tangkap dia 3 kali. Lari (Shift / tolak joystick jauh) dan potong jalan.|A thief ran off with 3 Knowledge Shards! Chase and catch him 3 times. Run (Shift / push the joystick far) and cut corners.',
    mula(c, m, n) {
      const sel = c.calon(m, n, 1, 3, 5, 0, n.npcPos);
      if (!sel.length) return false;
      const rnd = c.rnd(m, 31);
      const p = new EB.Penduduk(c.dunia, sel[0].x, sel[0].z, rnd, { statik: true, baju: '#2d2a32', seluar: '#1f1d24', topi: 'tudung', warnaTudung: '#2d2a32' });
      const karung = new T.Mesh(EB.tpl().bola, EB.mat('#a8814f')); karung.scale.set(0.2, 0.22, 0.18); karung.position.set(0, 0.5, -0.22); p.model.userData.badan.add(karung);
      c.dunia.scene.add(p.model); m.npc.push(p);
      m.pencuri = p; m.tangkap = 0; m.laluan = null; m.tFikir = 0; m.pengsan = 0; m.rnd = rnd;
      m.lbl = c.tambahLabel(new T.Vector3(p.pos.x, 1.6, p.pos.y), 'misi', '<i>💰</i>'); m.label.push(m.lbl);
      return true;
    },
    kemas(c, m, dt, tm) {
      if (m.fasa !== 'cari') return;
      const p = m.pencuri, d = c.dunia, had = c.had(m), n = c.nod(m);
      const pem = { x: c.pemain.pos.x, z: c.pemain.pos.y }, me = { x: p.pos.x, z: p.pos.y };
      const jp = jarak(pem, me);
      m.lbl.pos.set(p.pos.x, 1.6, p.pos.y);
      if (c.modalTerbuka) { p.laju = 0; EB.animasiWatak(p.model, 0, dt, tm, 0); return; }
      if (m.pengsan > 0) { m.pengsan -= dt; p.model.rotation.y += dt * 8; EB.animasiWatak(p.model, 0, dt, tm, 0); return; }
      if (jp < 0.85) {
        m.tangkap++; c.bunyi('ambil'); c.tambahXP(12);
        const t = n.bab.titik[m.tangkap - 1];
        c.serpihan(t, '💰', c.L('Pencuri ditangkap!|Thief caught!') + ` ${m.tangkap} / 3`, () => {
          if (m.tangkap >= 3) return c.siap();
          const jauh = c.calon(m, n, 1, 7, 11, 0, me, [pem]);
          if (jauh[0]) { c.awan(p.pos.x, p.pos.y, m); p.pos.set(jauh[0].x, jauh[0].z); }
          m.pengsan = 0.6; m.laluan = null;
        });
        return;
      }
      const lari = jp < 7;
      m.tFikir -= dt;
      if (lari && (m.tFikir <= 0 || !m.laluan || !m.laluan.length)) {
        m.tFikir = 0.45;
        let best = null, skor = -1e9;
        for (let i = 0; i < 14; i++) {
          const a = (i / 14) * Math.PI * 2, r = 3 + m.rnd() * 2;
          const q = { x: me.x + Math.cos(a) * r, z: me.z + Math.sin(a) * r };
          if (!d.boleh(Math.floor(q.x), Math.floor(q.z), had) || jarak(q, n.npcPos) > 13) continue;
          const s = jarak(q, pem) - jp * 0.2 + m.rnd() * 0.8 - (jarak(q, n.npcPos) > 10 ? 2 : 0);
          if (s > skor) { skor = s; best = q; }
        }
        if (best) { const j = EB.cariLaluan((a, b) => d.boleh(a, b, had), me.x, me.z, best.x, best.z, 500); m.laluan = j ? EB.licinkan((a, b) => d.boleh(a, b, had), j) : null; }
      }
      let v = 0;
      if (m.laluan && m.laluan.length) {
        const [wx, wz] = m.laluan[0], dx = wx - p.pos.x, dz = wz - p.pos.y, dd = Math.hypot(dx, dz);
        if (dd < 0.25) m.laluan.shift();
        else {
          v = lari ? 4.35 : 1.2;
          p.pos.x += (dx / dd) * v * dt; p.pos.y += (dz / dd) * v * dt;
          let b = Math.atan2(dx, dz) - p.yaw; while (b > Math.PI) b -= Math.PI * 2; while (b < -Math.PI) b += Math.PI * 2; p.yaw += b * Math.min(1, dt * 10);
        }
      }
      p.laju += (v - p.laju) * Math.min(1, dt * 8);
      p.model.position.set(p.pos.x, 0, p.pos.y); p.model.rotation.y = p.yaw;
      EB.animasiWatak(p.model, p.laju, dt, tm, 0);
    },
    kemasNpc: false,
    sasaran(c, m) { return m.pencuri ? { x: m.pencuri.pos.x, z: m.pencuri.pos.y } : null; },
    kemajuan(c, m) { return `💰 ${m.tangkap} / 3`; },
  };

  /* ---------- 4. Hantar Barang (dengan penggoda) ---------- */
  const GODAAN = [
    'Psst! Beri bungkusan itu kepada aku, aku bagi 50 XP sekarang juga. Siapa nak tahu?|Psst! Give me that package and I’ll give you 50 XP right now. Who’d know?',
    'Penat, kan? Letak sahaja di sini dan rehat. Nanti aku hantarkan untuk kau.|Tired, right? Just drop it here and rest. I’ll deliver it for you later.',
    'Semua orang ambil jalan pintas. Tukar bungkusan itu dengan hadiah berkilat ini!|Everyone takes shortcuts. Swap that package for this shiny prize!',
  ];
  M.hantar = {
    objektif: 'Hantar bungkusan ilmu kepada 3 penerima 📦 berturut-turut. Di tengah jalan ada penggoda 😈 dengan tawaran segera. Jangan tewas.|Deliver the knowledge package to 3 recipients 📦 in turn. Tempters 😈 with instant offers wait on the way. Don’t give in.',
    mula(c, m, n) {
      const rnd = c.rnd(m, 41);
      m.kaki = []; let dari = n.npcPos;
      for (let k = 0; k < 3; k++) {
        const ke = c.calon(m, n, 1, 6.5, 10, 0, dari, [n.npcPos, ...m.kaki.map((x) => x.ke)])[0];
        if (!ke) return false;
        const j = EB.cariLaluan((a, b) => c.dunia.boleh(a, b, c.had(m)), dari.x, dari.z, ke.x, ke.z, 4000);
        if (!j || j.length < 4) return false;
        const [gx, gz] = j[Math.floor(j.length / 2)];
        m.kaki.push({ dari, ke, goda: { x: gx, z: gz } });
        dari = ke;
      }
      m.kaki.forEach((k, i) => {
        const r = new EB.Penduduk(c.dunia, k.ke.x, k.ke.z, rnd, { statik: true }); c.dunia.scene.add(r.model); m.npc.push(r); k.penerima = r;
        k.lbl = c.tambahLabel(new T.Vector3(k.ke.x, 1.7, k.ke.z), 'misi', `<i>📦</i><span>${i + 1}</span>`); m.label.push(k.lbl); k.lbl.e.style.opacity = i ? 0.35 : 1;
      });
      m.k = 0; m.rnd = rnd;
      kotakBawa(c, m);
      this.pasangPenggoda(c, m);
      return true;
    },
    pasangPenggoda(c, m) {
      const k = m.kaki[m.k];
      const g = new EB.Penduduk(c.dunia, k.goda.x, k.goda.z, m.rnd, { statik: true, baju: '#7b2cbf', jubah: '#3c096c', topi: 'mahkota' });
      c.dunia.scene.add(g.model); m.npc.push(g); k.penggoda = g; k.aktif = true;
      k.lblG = c.tambahLabel(new T.Vector3(k.goda.x, 1.7, k.goda.z), 'misi goda', '<i>😈</i>'); m.label.push(k.lblG);
    },
    goda(c, m, k) {
      k.aktif = false; c.pemain.berhenti();
      const senarai = this.godaanTeks || GODAAN, teks = senarai[m.k % senarai.length];
      const p = c.bukaModal(`<div class="kad-serpihan"><div class="ikon">😈</div><small>${c.esc(c.L('Penggoda|Tempter'))}</small><p>${c.esc(c.L(teks))}</p></div>
        <div class="butang"><button class="btn" data-a="ya">${c.esc(c.L(this.teksYa || 'Terima tawaran|Accept the offer'))}</button><button class="btn utama" data-a="tidak">${c.esc(c.L(this.teksTidak || 'Tolak dan teruskan|Refuse and carry on'))}</button></div>`, 'kecil');
      p.querySelector('[data-a=tidak]').onclick = () => {
        c.tutupModal(); c.bunyi('betul'); c.tambahXP(10); c.toast('💪 ' + c.L('Kawalan diri! +10 XP|Self-control! +10 XP'));
        c.awan(k.goda.x, k.goda.z, m); k.penggoda.model.visible = false; k.lblG.e.style.display = 'none'; k.lblG.pos.y = -99;
      };
      p.querySelector('[data-a=ya]').onclick = () => { c.tutupModal(); buangKotak(m); c.stat('goda'); c.gagal(c.L(this.teksGagal || 'Kau tewas kepada godaan segera. Bungkusan hilang. −1 nyawa.|You gave in to instant temptation. The package is lost. −1 heart.')); };
    },
    serah(c, m) {
      const k = m.kaki[m.k];
      if (k.aktif) { k.aktif = false; c.toast('🛡 ' + c.L('Kau berjaya mengelak penggoda!|You avoided the tempter!')); k.penggoda.model.visible = false; k.lblG.e.style.display = 'none'; k.lblG.pos.y = -99; }
      c.bunyi('ambil'); c.tambahXP(10);
      k.lbl.e.innerHTML = '<i class="siap">✓</i>';
      c.serpihan(c.nod(m).bab.titik[m.k], '📦', c.L('Bungkusan diterima|Package delivered') + ` ${m.k + 1} / 3`, () => {
        m.k++;
        if (m.k >= 3) { buangKotak(m); return c.siap(); }
        m.kaki[m.k].lbl.e.style.opacity = 1;
        this.pasangPenggoda(c, m);
      });
    },
    kemas(c, m) {
      if (m.fasa !== 'cari' || c.modalTerbuka) return;
      const k = m.kaki[m.k]; if (!k) return;
      const p = { x: c.pemain.pos.x, z: c.pemain.pos.y };
      if (k.aktif && jarak(p, k.goda) < 2.2) this.goda(c, m, k);
    },
    interaksi(c, m) { const k = m.kaki[m.k]; return k ? [{ x: k.ke.x, z: k.ke.z, f: () => this.serah(c, m) }] : []; },
    sasaran(c, m) { const k = m.kaki[m.k]; return k ? k.ke : null; },
    kemajuan(c, m) { return `📦 ${m.k} / 3`; },
    buang(c, m) { buangKotak(m); },
  };

  /* ---------- 5. Susun Timbal (Sokoban) ---------- */
  M.susun = {
    objektif: 'Tolak blok konsep ke atas tapak bernombor mengikut urutan yang betul. Tolak dengan berjalan ke arah blok (WASD / joystick) atau tekan Bercakap di sebelahnya. R = susun semula.|Push the concept blocks onto the numbered pads in the right order. Push by walking into a block (WASD / joystick) or press Talk beside it. R = reset.',
    mula(c, m, n) {
      const urutan = c.urutan(n); if (!urutan) return false;
      const d = c.dunia, W = EB.SUSUN.W, D = EB.SUSUN.D, nb = urutan.length;
      const zc = n.r * D + 10, had = c.had(m), dir = n.r % 2 === 0 ? 1 : -1;
      const okLorong = (x) => [zc - 1, zc, zc + 1].every((z) => d.grid.dapat(x, z) === EB.SEL.JALAN && d.pKemajuan(x + 0.5, z + 0.5) <= had - 0.6);
      let xs = null, dmin = 1e9;
      for (let x0 = 1; x0 + nb + 3 < W - 1; x0++) {
        let ok = true; for (let x = x0; x < x0 + nb + 4; x++) if (!okLorong(x)) { ok = false; break; }
        if (!ok) continue;
        const dd = Math.abs(x0 + (nb + 4) / 2 - n.x); if (dd < dmin) { dmin = dd; xs = x0; }
      }
      if (xs === null) return false;
      m.urutan = urutan; m.zc = zc;
      m.tapakS = []; m.blok = [];
      for (let k = 0; k < nb; k++) {
        const x = dir > 0 ? xs + 2 + k : xs + nb + 1 - k; // tapak 1 di hujung awal arah perjalanan
        const pad = new T.Mesh(new T.PlaneGeometry(0.92, 0.92).rotateX(-Math.PI / 2), new T.MeshBasicMaterial({ color: 0xffd23f, transparent: true, opacity: 0.55, depthWrite: false }));
        pad.position.set(x + 0.5, 0.025, zc + 1.5); d.scene.add(pad); m.obj.push(pad);
        const l = c.tambahLabel(new T.Vector3(x + 0.5, 0.2, zc + 1.5), 'pad', `<b>${k + 1}</b>`); m.label.push(l);
        m.tapakS.push({ x, z: zc + 1, k, mesh: pad });
      }
      const rnd = c.rnd(m, 51);
      let susunan; do { susunan = c.kocak([...Array(nb).keys()], rnd); } while (nb > 1 && susunan.every((v, i) => v === i));
      m.mula = [];
      susunan.forEach((u, i) => {
        const x = dir > 0 ? xs + 2 + i : xs + nb + 1 - i;
        const g = new T.Group();
        const kt = new T.Mesh(EB.tpl().kotak, EB.mat('#b9b3a8')); kt.scale.set(0.86, 0.8, 0.86); kt.castShadow = true; kt.receiveShadow = true; g.add(kt);
        const at = new T.Mesh(EB.tpl().kotak, EB.mat(['#5ee6ff', '#7cc94e', '#ffb347', '#b28dff', '#ff7eb6', '#ffd23f'][u % 6], 0.3)); at.scale.set(0.6, 0.06, 0.6); at.position.y = 0.8; g.add(at);
        g.position.set(x + 0.5, 0, zc + 0.5); d.scene.add(g); m.obj.push(g);
        const l = c.tambahLabel(new T.Vector3(x + 0.5, 1.15, zc + 0.5), 'blok', `<span>${c.esc(c.L(urutan[u]))}</span>`); m.label.push(l);
        const b = { u, x, z: zc, g, l, vx: x + 0.5, vz: zc + 0.5, ly: u % 2 ? 1.85 : 1.15 };
        m.blok.push(b); m.mula.push({ x, z: zc });
      });
      m.tolak = 0; m.cubaan = 0; m.berubah = true;
      this.halang(c, m);
      return true;
    },
    halang(c, m) { c.dunia.halangan = new Set(m.blok.map((b) => b.x + ',' + b.z)); },
    bolehBlok(c, m, x, z, kecuali) {
      const d = c.dunia;
      if (d.grid.dapat(x, z) !== EB.SEL.JALAN || d.pKemajuan(x + 0.5, z + 0.5) > c.had(m) - 0.6) return false;
      if (Math.abs(z - m.zc) > 1) return false;
      if (m.blok.some((b) => b !== kecuali && b.x === x && b.z === z)) return false;
      const px = Math.floor(c.pemain.pos.x), pz = Math.floor(c.pemain.pos.y);
      return !(px === x && pz === z);
    },
    tolakBlok(c, m, b, dx, dz) {
      const nx = b.x + dx, nz = b.z + dz;
      if (!this.bolehBlok(c, m, nx, nz, b)) { c.bunyi('klik'); return false; }
      b.x = nx; b.z = nz; m.berubah = true; this.halang(c, m); c.bunyi('batu');
      return true;
    },
    reset(c, m) {
      m.blok.forEach((b, i) => { b.x = m.mula[i].x; b.z = m.mula[i].z; });
      m.berubah = true; this.halang(c, m);
      // jangan biar blok jatuh di atas watak, atau mengurung watak
      const px = Math.floor(c.pemain.pos.x), pz = Math.floor(c.pemain.pos.y);
      if (m.blok.some((b) => b.x === px && b.z === pz) || this.terperangkap(c, m)) this.selamatkan(c, m);
      c.toast(c.L('Blok disusun semula.|Blocks reset.'));
    },
    // watak tidak boleh lagi sampai ke pencerita kerana dikelilingi blok?
    terperangkap(c, m) {
      const n = c.nod(m), d = c.dunia, had = c.had(m), px = c.pemain.pos.x, pz = c.pemain.pos.y;
      const xs = m.tapakS.map((t) => t.x);
      if (Math.abs(pz - (m.zc + 0.5)) > 3 || px < Math.min(...xs) - 4 || px > Math.max(...xs) + 5) return false; // hanya di sekitar lorong blok
      return !EB.cariLaluan((a, b) => d.boleh(a, b, had), px, pz, n.npcPos.x, n.npcPos.z, 6000);
    },
    // pindahkan watak ke sel terdekat di luar lorong blok yang boleh sampai ke pencerita
    selamatkan(c, m, mesej) {
      const n = c.nod(m), d = c.dunia, had = c.had(m), boleh = (a, b) => d.boleh(a, b, had);
      const px = Math.floor(c.pemain.pos.x), pz = Math.floor(c.pemain.pos.y);
      let best = null;
      for (let r = 1; r <= 8 && !best; r++) for (let dz = -r; dz <= r && !best; dz++) for (let dx = -r; dx <= r && !best; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dz)) !== r) continue;
        const x = px + dx, z = pz + dz;
        if (Math.abs(z - m.zc) <= 1 || !boleh(x, z)) continue; // keluar dari tiga lorong blok
        if (EB.cariLaluan(boleh, x + 0.5, z + 0.5, n.npcPos.x, n.npcPos.z, 3000)) best = { x: x + 0.5, z: z + 0.5 };
      }
      if (!best) best = { x: n.npcPos.x, z: n.npcPos.z + (n.utara ? -0.6 : 0.6) };
      c.pemain.berhenti(); c.pemain.letak(best.x, best.z); c.dunia.fokus.set(best.x, 0, best.z);
      c.awan(best.x, best.z, m);
      if (mesej) c.toast(mesej);
    },
    kemas(c, m, dt) {
      for (const b of m.blok) {
        b.vx += (b.x + 0.5 - b.vx) * Math.min(1, dt * 12); b.vz += (b.z + 0.5 - b.vz) * Math.min(1, dt * 12);
        b.g.position.set(b.vx, 0, b.vz); b.l.pos.set(b.vx, b.ly, b.vz);
      }
      for (const t of m.tapakS) t.mesh.material.opacity = m.blok.some((b) => b.x === t.x && b.z === t.z) ? 0.9 : 0.45 + Math.sin(performance.now() / 300 + t.k) * 0.1;
      if (m.fasa !== 'cari' || c.modalTerbuka) return;
      // pengesan terperangkap: semak setiap 0.6 s
      const kini = performance.now();
      if (kini - (m.tSemak || 0) > 600) { m.tSemak = kini; if (this.terperangkap(c, m)) { this.selamatkan(c, m, '🧱 ' + c.L('Kau terkurung oleh blok. Dipindahkan keluar; teruskan menyusun.|You got boxed in by the blocks. Moved you out; keep arranging.')); return; } }
      // tolak dengan berjalan ke arah blok
      const ni = c.pemain.niat;
      if (ni && ni.lengthSq() > 1) {
        const ax = Math.abs(ni.x) > Math.abs(ni.y);
        const dx = ax ? Math.sign(ni.x) : 0, dz = ax ? 0 : Math.sign(ni.y);
        const px = c.pemain.pos.x, pz = c.pemain.pos.y;
        const tx = Math.floor(px + dx * 0.6), tz = Math.floor(pz + dz * 0.6);
        const b = m.blok.find((q) => q.x === tx && q.z === tz);
        if (b) { m.tolak += dt; if (m.tolak > 0.14) { m.tolak = -0.12; this.tolakBlok(c, m, b, dx, dz); } }
        else m.tolak = 0;
      } else m.tolak = 0;
      // semak penyelesaian
      if (m.berubah) {
        m.berubah = false;
        const atas = m.tapakS.map((t) => m.blok.find((b) => b.x === t.x && b.z === t.z));
        if (atas.every(Boolean)) {
          if (atas.every((b, k) => b.u === k)) {
            c.bunyi('buka'); c.tambahXP(20);
            c.serpihan(m.urutan.map((u, i) => `${i + 1}. ${c.L(u)}`).join('\n'), '🧱', c.L('Urutan betul!|Correct order!'), () => {
              const n = c.nod(m);
              c.serpihan(n.bab.titik.map((x) => '• ' + c.L(x)).join('\n'), '💎', c.L('Serpihan Ilmu bab ini|This chapter’s Knowledge Shards'), () => { c.dunia.halangan = null; c.siap(); });
            });
          } else { m.penalti++; c.bunyi('salah'); c.toast(c.L('Urutan belum betul. Susun semula blok (R untuk mula semula).|Not the right order yet. Rearrange the blocks (R to reset).')); }
        }
      }
    },
    interaksi(c, m) {
      const px = c.pemain.pos.x, pz = c.pemain.pos.y;
      return m.blok.filter((b) => Math.abs(b.x + 0.5 - px) + Math.abs(b.z + 0.5 - pz) < 1.6).map((b) => ({ x: b.x + 0.5, z: b.z + 0.5, label: c.L('Tolak|Push'), f: () => {
        const dx = b.x + 0.5 - px, dz = b.z + 0.5 - pz;
        if (Math.abs(dx) > Math.abs(dz)) this.tolakBlok(c, m, b, Math.sign(dx), 0); else this.tolakBlok(c, m, b, 0, Math.sign(dz));
      } }));
    },
    sasaran(c, m) { const t = m.tapakS[0], p = { x: c.pemain.pos.x, z: c.pemain.pos.y }, q = { x: t.x + 0.5, z: t.z + 0.5 }; return jarak(p, q) > 7 ? q : null; },
    kemajuan(c, m) { const n = m.tapakS.filter((t) => m.blok.some((b) => b.x === t.x && b.z === t.z)).length; return `🧱 ${n} / ${m.tapakS.length} <button class="btn kecil" data-a="reset">↺ ${c.esc(c.L('Susun semula|Reset'))}</button>`; },
    buang(c) { c.dunia.halangan = null; },
  };

  /* ---------- 6. Tanya penduduk ---------- */
  M.tanya = {
    objektif: 'Tanya 3 penduduk bertanda “?” yang tahu rahsia bab ini.|Ask the 3 villagers marked “?” who know this chapter’s secrets.',
    mula(c, m, n) {
      const sel = c.calon(m, n, 3, 4, 11, 3, n.npcPos); if (sel.length < 3) return false;
      const rnd = c.rnd(m, 61);
      m.item = sel.map((p, i) => {
        const w = new EB.Penduduk(c.dunia, p.x, p.z, rnd, { statik: true }); c.dunia.scene.add(w.model); m.npc.push(w);
        const l = c.tambahLabel(new T.Vector3(p.x, 1.6, p.z), 'tanya', '<i>?</i>'); m.label.push(l);
        return { ...p, titik: n.bab.titik[i], l, siap: false };
      });
      return true;
    },
    tanya(c, m, it) {
      if (it.siap) return; it.siap = true; c.bunyi('ambil'); c.tambahXP(10); it.l.e.innerHTML = '<i class="siap">✓</i>';
      const k = m.item.filter((x) => x.siap).length;
      c.serpihan(it.titik, '🗣', c.L('Penduduk|Villager') + ` ${k} / 3`, () => { if (k >= 3) c.siap(); });
    },
    interaksi(c, m) { return m.item.filter((x) => !x.siap).map((it) => ({ x: it.x, z: it.z, label: c.L('Tanya|Ask'), f: () => this.tanya(c, m, it) })); },
    kemas(c, m) { if (m.fasa !== 'cari' || c.modalTerbuka) return; for (const it of m.item) if (!it.siap && jarak(it, { x: c.pemain.pos.x, z: c.pemain.pos.y }) < 1.1) { this.tanya(c, m, it); return; } },
    sasaran(c, m) { const p = { x: c.pemain.pos.x, z: c.pemain.pos.y }; return m.item.filter((x) => !x.siap).sort((a, b) => jarak(a, p) - jarak(b, p))[0] || null; },
    kemajuan(c, m) { return `🗣 ${m.item.filter((x) => x.siap).length} / 3`; },
  };

  /* ---------- 7. Kejar masa (serpihan pudar) ---------- */
  M.kejar = {
    objektif: 'Pantas! Kutip 3 serpihan dalam 70 saat sebelum ia pudar.|Hurry! Collect 3 shards within 70 seconds before they fade.',
    mula(c, m, n) {
      const sel = c.calon(m, n, 3, 5, 13, 3.5, n.npcPos); if (sel.length < 3) return false;
      m.masa = 70;
      m.item = sel.map((p, i) => { const k = c.kristal(p.x, p.z, 0xff9f43, 0xff7a00, m); return { ...p, k, titik: n.bab.titik[i], siap: false }; });
      return true;
    },
    kemas(c, m, dt, tm) {
      for (const it of m.item) if (!it.siap) { it.k.kristal.rotation.y = tm * 2; it.k.kristal.position.y = 0.8 + Math.sin(tm * 3 + it.x) * 0.12; }
      if (m.fasa !== 'cari' || c.modalTerbuka) return;
      m.masa -= dt;
      if (m.masa <= 0) return c.gagal(c.L('Serpihan pudar! Cuba lagi. −1 nyawa|The shards faded! Try again. −1 heart'));
      const p = { x: c.pemain.pos.x, z: c.pemain.pos.y };
      for (const it of m.item) if (!it.siap && jarak(it, p) < 0.9) {
        it.siap = true; c.dunia.scene.remove(it.k.obj); c.bunyi('ambil'); c.tambahXP(10);
        const k = m.item.filter((x) => x.siap).length;
        c.serpihan(it.titik, '💎', c.L('Serpihan|Shard') + ` ${k} / 3`, () => { if (k >= 3) c.siap(); });
        return;
      }
    },
    sasaran(c, m) { const p = { x: c.pemain.pos.x, z: c.pemain.pos.y }; return m.item.filter((x) => !x.siap).sort((a, b) => jarak(a, p) - jarak(b, p))[0] || null; },
    kemajuan(c, m) { return `💎 ${m.item.filter((x) => x.siap).length} / 3 <span class="masa">⏱ ${Math.max(0, Math.ceil(m.masa))}s</span>`; },
  };

  // Giliran misi untuk bab tanpa urutan khas. Siasat dan Jejak menggantikan "cari" biasa.
  EB.GILIRAN_MISI = ['jejak', 'siasat', 'pencuri', 'tanya', 'hantar', 'kejar', 'siasat', 'jejak'];
})();
