/* Ekspedisi Buku · Watak, pergerakan & pencarian laluan */
(function () {
  const EB = (window.EB = window.EB || {});
  const T = THREE;

  /* ---------- Model watak chibi (boleh dianimasi) ---------- */
  EB.binaWatak = function (o = {}) {
    const mat = EB.mat, tpl = EB.tpl();
    const kulit = o.kulit || '#f2c9a0', baju = o.baju || '#e85d4a', seluar = o.seluar || '#3b4a6b', rambut = o.rambut || '#3a2a20', topi = o.topi;
    const akar = new T.Group();
    const badan = new T.Group(); akar.add(badan);
    const m = (g, hex, sx, sy, sz, x, y, z, ibu) => { const j = new T.Mesh(g, mat(hex)); j.scale.set(sx, sy, sz); j.position.set(x, y, z); j.castShadow = true; (ibu || badan).add(j); return j; };
    // kaki (pangsi di pinggul)
    const kaki = [-1, 1].map((s) => { const p = new T.Group(); p.position.set(s * 0.1, 0.36, 0); badan.add(p); m(tpl.kotak, seluar, 0.13, 0.3, 0.14, 0, -0.3, 0, p); m(tpl.kotak, '#4a3326', 0.15, 0.08, 0.2, 0, -0.36, 0.03, p); return p; });
    const torso = m(tpl.kotak, baju, 0.36, 0.34, 0.24, 0, 0.36, 0);
    m(tpl.kotak, o.tali || '#6b4429', 0.37, 0.05, 0.25, 0, 0.38, 0);
    const tangan = [-1, 1].map((s) => { const p = new T.Group(); p.position.set(s * 0.23, 0.66, 0); badan.add(p); m(tpl.kotak, baju, 0.1, 0.24, 0.11, 0, -0.24, 0, p); m(tpl.bola, kulit, 0.06, 0.06, 0.06, 0, -0.27, 0, p); return p; });
    const kepala = new T.Group(); kepala.position.y = 0.72; badan.add(kepala);
    m(tpl.bola, kulit, 0.22, 0.21, 0.21, 0, 0.18, 0, kepala);
    m(tpl.bola, rambut, 0.235, 0.16, 0.225, 0, 0.27, -0.02, kepala);
    m(tpl.bola0, '#1d1d24', 0.025, 0.035, 0.02, -0.075, 0.18, 0.19, kepala); m(tpl.bola0, '#1d1d24', 0.025, 0.035, 0.02, 0.075, 0.18, 0.19, kepala);
    m(tpl.bola0, '#f59a8a', 0.03, 0.02, 0.01, -0.12, 0.12, 0.18, kepala); m(tpl.bola0, '#f59a8a', 0.03, 0.02, 0.01, 0.12, 0.12, 0.18, kepala);
    if (topi === 'pengembara') { m(tpl.silinder, '#8a5a3b', 0.32, 0.03, 0.32, 0, 0.33, 0, kepala); m(tpl.silinder, '#8a5a3b', 0.19, 0.16, 0.19, 0, 0.34, 0, kepala); m(tpl.silinder, '#d9533b', 0.195, 0.04, 0.195, 0, 0.36, 0, kepala); }
    else if (topi === 'serban') { m(tpl.bola, '#f5f1e6', 0.24, 0.13, 0.24, 0, 0.36, -0.01, kepala); }
    else if (topi === 'tudung') { m(tpl.bola, o.warnaTudung || '#6c8ebf', 0.25, 0.25, 0.24, 0, 0.2, -0.02, kepala); m(tpl.kotak, kulit, 0.24, 0.18, 0.05, 0, 0.1, 0.18, kepala); m(tpl.bola0, '#1d1d24', 0.025, 0.035, 0.02, -0.075, 0.18, 0.21, kepala); m(tpl.bola0, '#1d1d24', 0.025, 0.035, 0.02, 0.075, 0.18, 0.21, kepala); }
    else if (topi === 'mahkota') { m(tpl.silinder6, '#ffcf3f', 0.17, 0.12, 0.17, 0, 0.36, 0, kepala); }
    if (o.beg) { m(tpl.kotak, '#a8693d', 0.26, 0.28, 0.12, 0, 0.42, -0.17); m(tpl.kotak, '#7a4f33', 0.27, 0.06, 0.13, 0, 0.6, -0.17); }
    if (o.jubah) m(tpl.kotak, o.jubah, 0.38, 0.5, 0.2, 0, 0.14, -0.06);
    // bayang bulat lembut
    const bayang = new T.Mesh(new T.CircleGeometry(0.3, 16).rotateX(-Math.PI / 2), new T.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.18, depthWrite: false }));
    bayang.position.y = 0.01; akar.add(bayang);
    akar.userData = { badan, kaki, tangan, kepala, torso, fasa: Math.random() * 6 };
    return akar;
  };

  // animasi berjalan/berlari prosedural
  EB.animasiWatak = function (w, laju, dt, t, condong) {
    const u = w.userData;
    const n = Math.min(1, laju / 5.2);
    u.fasa += dt * (4 + laju * 2.1);
    const ay = Math.sin(u.fasa) * (0.25 + n * 0.75) * Math.min(1, laju * 1.5);
    u.kaki[0].rotation.x = ay; u.kaki[1].rotation.x = -ay;
    u.tangan[0].rotation.x = -ay * 0.9; u.tangan[1].rotation.x = ay * 0.9;
    u.tangan[0].rotation.z = -0.08 - n * 0.1; u.tangan[1].rotation.z = 0.08 + n * 0.1;
    u.badan.position.y = laju > 0.1 ? Math.abs(Math.cos(u.fasa)) * (0.03 + n * 0.05) : Math.sin(t * 2) * 0.006;
    u.badan.rotation.x += ((n * 0.22) - u.badan.rotation.x) * Math.min(1, dt * 8); // condong ke hadapan bila lari
    u.badan.rotation.z += ((condong || 0) - u.badan.rotation.z) * Math.min(1, dt * 6);
    u.kepala.rotation.x = -u.badan.rotation.x * 0.5;
    if (laju < 0.1) { u.torso.scale.y = -0.34 * 0 + 0.34 + Math.sin(t * 2.2) * 0.006; }
  };

  /* ---------- A* di atas grid (8 arah) ---------- */
  EB.cariLaluan = function (boleh, sx, sz, tx, tz, had = 8000) {
    sx |= 0; sz |= 0; tx |= 0; tz |= 0;
    if (!boleh(tx, tz)) {
      // cari sel boleh lalu terdekat dengan sasaran
      let terbaik = null, dmin = 1e9;
      for (let r = 1; r <= 3 && !terbaik; r++) for (let dz = -r; dz <= r; dz++) for (let dx = -r; dx <= r; dx++) {
        if (boleh(tx + dx, tz + dz)) { const d = Math.hypot(dx, dz); if (d < dmin) { dmin = d; terbaik = [tx + dx, tz + dz]; } }
      }
      if (!terbaik) return null; [tx, tz] = terbaik;
    }
    const kunci = (x, z) => z * 4096 + x;
    const buka = [[sx, sz, 0, Math.hypot(tx - sx, tz - sz)]];
    const dari = new Map(), g = new Map([[kunci(sx, sz), 0]]);
    const tutup = new Set();
    let n = 0;
    while (buka.length && n++ < had) {
      let bi = 0; for (let i = 1; i < buka.length; i++) if (buka[i][3] < buka[bi][3]) bi = i;
      const [x, z, gc] = buka[bi]; buka[bi] = buka[buka.length - 1]; buka.pop();
      const k = kunci(x, z);
      if (tutup.has(k)) continue; tutup.add(k);
      if (x === tx && z === tz) {
        const jalan = [[x + 0.5, z + 0.5]]; let c = k;
        while (dari.has(c)) { c = dari.get(c); jalan.push([(c % 4096) + 0.5, Math.floor(c / 4096) + 0.5]); }
        jalan.reverse(); return jalan;
      }
      for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dz) continue;
        const nx = x + dx, nz = z + dz;
        if (!boleh(nx, nz)) continue;
        if (dx && dz && (!boleh(x + dx, z) || !boleh(x, z + dz))) continue; // jangan potong bucu
        const nk = kunci(nx, nz); if (tutup.has(nk)) continue;
        const ng = gc + (dx && dz ? 1.414 : 1);
        if (ng < (g.has(nk) ? g.get(nk) : 1e9)) { g.set(nk, ng); dari.set(nk, k); buka.push([nx, nz, ng, ng + Math.hypot(tx - nx, tz - nz)]); }
      }
    }
    return null;
  };
  // licinkan laluan (tarik tali) dengan semakan garis pandang
  EB.licinkan = function (boleh, jalan) {
    if (!jalan || jalan.length < 3) return jalan;
    const nampak = (a, b) => { const d = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.ceil(d * 3); for (let i = 1; i < n; i++) { const t = i / n, x = a[0] + (b[0] - a[0]) * t, z = a[1] + (b[1] - a[1]) * t; for (const [ox, oz] of [[-0.25, -0.25], [0.25, 0.25], [-0.25, 0.25], [0.25, -0.25]]) if (!boleh(Math.floor(x + ox), Math.floor(z + oz))) return false; } return true; };
    const hasil = [jalan[0]]; let i = 0;
    while (i < jalan.length - 1) { let j = jalan.length - 1; while (j > i + 1 && !nampak(jalan[i], jalan[j])) j--; hasil.push(jalan[j]); i = j; }
    return hasil;
  };

  /* ---------- Pengawal pemain: momentum ala GTA, klik-gerak ala Dota ---------- */
  class Pemain {
    constructor(dunia) {
      this.dunia = dunia;
      this.model = EB.binaWatak({ baju: '#2e86c1', seluar: '#3b3f5c', topi: 'pengembara', beg: true, rambut: '#2b1d14' });
      dunia.scene.add(this.model);
      this.pos = new T.Vector2(); this.vel = new T.Vector2(); this.yaw = 0; this.condong = 0;
      this.laluan = null; this.input = new T.Vector2(); this.lari = false; this.had = Infinity;
      this.debu = [];
      const mt = new T.MeshBasicMaterial({ color: 0xe8dcc4, transparent: true, opacity: 0.6, depthWrite: false });
      for (let i = 0; i < 10; i++) { const d = new T.Mesh(EB.tpl().bola0, mt.clone()); d.visible = false; dunia.scene.add(d); this.debu.push({ m: d, h: 0 }); }
      this.tDebu = 0;
      this.penanda = new T.Mesh(new T.RingGeometry(0.25, 0.4, 24).rotateX(-Math.PI / 2), new T.MeshBasicMaterial({ color: 0x7dffb0, transparent: true, opacity: 0, depthWrite: false }));
      this.penanda.position.y = 0.03; dunia.scene.add(this.penanda);
    }
    letak(x, z) { this.pos.set(x, z); this.vel.set(0, 0); this.laluan = null; this.model.position.set(x, 0, z); }
    pergiKe(x, z) {
      const d = this.dunia, boleh = (a, b) => d.boleh(a, b, this.had);
      const j = EB.cariLaluan(boleh, this.pos.x, this.pos.y, x, z);
      if (!j) return false;
      this.laluan = EB.licinkan(boleh, j); this.laluan.shift();
      const akhir = this.laluan[this.laluan.length - 1] || [x, z];
      this.penanda.position.set(akhir[0], 0.03, akhir[1]); this.penanda.material.opacity = 0.9; this.penanda.scale.setScalar(1.4);
      this.lariLaluan = Math.hypot(x - this.pos.x, z - this.pos.y) > 6;
      return true;
    }
    berhenti() { this.laluan = null; }
    kemaskini(dt, t) {
      const d = this.dunia;
      const LARI = 5.4, JALAN = 2.7;
      let sasar = new T.Vector2();
      if (this.input.lengthSq() > 0.01) {
        this.laluan = null;
        const { f, k } = d.paksi();
        const mag = Math.min(1, this.input.length());
        const vx = k.x * this.input.x + f.x * this.input.y, vz = k.z * this.input.x + f.z * this.input.y;
        const l = Math.hypot(vx, vz) || 1;
        const laju = this.lari || mag > 0.75 ? LARI : JALAN * Math.max(0.4, mag / 0.75);
        sasar.set((vx / l) * laju, (vz / l) * laju);
      } else if (this.laluan && this.laluan.length) {
        const [wx, wz] = this.laluan[0];
        const dx = wx - this.pos.x, dz = wz - this.pos.y, dd = Math.hypot(dx, dz);
        const akhir = this.laluan.length === 1;
        if (dd < (akhir ? 0.15 : 0.45)) { this.laluan.shift(); if (!this.laluan.length) this.laluan = null; }
        else { const laju = this.lariLaluan ? LARI : JALAN * 1.2; const perlahan = akhir ? Math.min(1, dd / 0.9) : 1; sasar.set((dx / dd) * laju * Math.max(0.35, perlahan), (dz / dd) * laju * Math.max(0.35, perlahan)); }
      }
      this.niat = sasar;
      // pecutan & geseran (momentum)
      const pecut = sasar.lengthSq() > this.vel.lengthSq() ? 9 : 11;
      this.vel.x += (sasar.x - this.vel.x) * Math.min(1, dt * pecut);
      this.vel.y += (sasar.y - this.vel.y) * Math.min(1, dt * pecut);
      // pergerakan dengan perlanggaran (gelongsor di dinding)
      const rad = 0.28;
      const ok = (x, z) => [[-rad, -rad], [rad, -rad], [-rad, rad], [rad, rad]].every(([ox, oz]) => d.boleh(Math.floor(x + ox), Math.floor(z + oz), this.had));
      const nx = this.pos.x + this.vel.x * dt, nz = this.pos.y + this.vel.y * dt;
      if (ok(nx, this.pos.y)) this.pos.x = nx; else this.vel.x *= 0.2;
      if (ok(this.pos.x, nz)) this.pos.y = nz; else this.vel.y *= 0.2;
      if (!ok(this.pos.x, this.pos.y)) { // tersekat (contoh: pintu baru tertutup) → tolak ke sel selamat
        const c = EB.cariLaluan((a, b) => d.boleh(a, b, this.had), this.pos.x, this.pos.y, this.pos.x, this.pos.y);
        if (c) this.pos.set(c[0][0], c[0][1]);
      }
      const laju = this.vel.length();
      if (laju > 0.15) {
        const yawSasar = Math.atan2(this.vel.x, this.vel.y);
        let beza = yawSasar - this.yaw; while (beza > Math.PI) beza -= Math.PI * 2; while (beza < -Math.PI) beza += Math.PI * 2;
        const putar = Math.sign(beza) * Math.min(Math.abs(beza), dt * 11);
        this.yaw += putar;
        this.condong = Math.max(-0.25, Math.min(0.25, (-putar / Math.max(dt, 1e-3)) * 0.02 * (laju / LARI)));
      } else this.condong = 0;
      this.model.position.set(this.pos.x, 0, this.pos.y);
      this.model.rotation.y = this.yaw;
      EB.animasiWatak(this.model, laju, dt, t, this.condong);
      this.laju = laju;
      // debu kaki ketika berlari
      this.tDebu -= dt;
      if (laju > 4 && this.tDebu <= 0) {
        this.tDebu = 0.09;
        const p = this.debu.find((q) => q.h <= 0);
        if (p) { p.h = 0.6; p.m.visible = true; p.m.position.set(this.pos.x - this.vel.x * 0.05, 0.08, this.pos.y - this.vel.y * 0.05); p.m.scale.setScalar(0.08); }
      }
      for (const p of this.debu) if (p.h > 0) { p.h -= dt; p.m.position.y += dt * 0.3; p.m.scale.setScalar(0.08 + (0.6 - p.h) * 0.35); p.m.material.opacity = Math.max(0, p.h); if (p.h <= 0) p.m.visible = false; }
      if (this.penanda.material.opacity > 0) { this.penanda.material.opacity -= dt * (this.laluan ? 0.3 : 2.5); this.penanda.scale.multiplyScalar(1 - dt * 0.8); this.penanda.scale.x = Math.max(this.penanda.scale.x, 0.6); this.penanda.scale.z = this.penanda.scale.x; }
    }
  }
  EB.Pemain = Pemain;

  /* ---------- Penduduk (NPC berjalan-jalan) ---------- */
  const WARNA_BAJU = ['#e85d4a', '#f4a261', '#2a9d8f', '#8e44ad', '#e9c46a', '#3a86ff', '#ff70a6', '#6a994e'];
  class Penduduk {
    constructor(dunia, x, z, rnd, opsi = {}) {
      this.dunia = dunia; this.rnd = rnd;
      const topi = opsi.topi || [undefined, 'tudung', 'serban', undefined, 'tudung'][(rnd() * 5) | 0];
      this.model = EB.binaWatak({ baju: opsi.baju || WARNA_BAJU[(rnd() * WARNA_BAJU.length) | 0], seluar: ['#3b4a6b', '#5a4636', '#2f3e46'][(rnd() * 3) | 0], topi, warnaTudung: WARNA_BAJU[(rnd() * 8) | 0], rambut: ['#3a2a20', '#1d1d24', '#6b4429'][(rnd() * 3) | 0], jubah: opsi.jubah });
      if (opsi.skala) this.model.scale.setScalar(opsi.skala);
      dunia.scene.add(this.model);
      this.pos = new T.Vector2(x, z); this.asal = new T.Vector2(x, z); this.sasar = null; this.rehat = rnd() * 3; this.yaw = rnd() * 6; this.laju = 0;
      this.statik = !!opsi.statik; this.model.position.set(x, 0, z); this.model.rotation.y = this.yaw;
      if (opsi.hadap !== undefined) { this.yaw = opsi.hadap; this.model.rotation.y = this.yaw; }
    }
    kemaskini(dt, t, pemain) {
      const d = this.dunia;
      if (pemain && this.statik) {
        const dx = pemain.pos.x - this.pos.x, dz = pemain.pos.y - this.pos.y;
        if (dx * dx + dz * dz < 9) { let b = Math.atan2(dx, dz) - this.yaw; while (b > Math.PI) b -= Math.PI * 2; while (b < -Math.PI) b += Math.PI * 2; this.yaw += b * Math.min(1, dt * 5); this.model.rotation.y = this.yaw; }
      }
      if (!this.statik) {
        this.rehat -= dt;
        if (!this.sasar && this.rehat <= 0) {
          for (let i = 0; i < 6; i++) {
            const x = this.asal.x + (this.rnd() - 0.5) * 12, z = this.asal.y + (this.rnd() - 0.5) * 8;
            if (d.boleh(Math.floor(x), Math.floor(z))) { const j = EB.cariLaluan((a, b) => d.boleh(a, b), this.pos.x, this.pos.y, x, z, 600); if (j) { this.sasar = EB.licinkan((a, b) => d.boleh(a, b), j); break; } }
          }
          this.rehat = 2 + this.rnd() * 5;
        }
        let v = 0;
        if (this.sasar && this.sasar.length) {
          const [wx, wz] = this.sasar[0], dx = wx - this.pos.x, dz = wz - this.pos.y, dd = Math.hypot(dx, dz);
          if (dd < 0.2) { this.sasar.shift(); if (!this.sasar.length) this.sasar = null; }
          else {
            v = 1.1; this.pos.x += (dx / dd) * v * dt; this.pos.y += (dz / dd) * v * dt;
            let b = Math.atan2(dx, dz) - this.yaw; while (b > Math.PI) b -= Math.PI * 2; while (b < -Math.PI) b += Math.PI * 2; this.yaw += b * Math.min(1, dt * 6);
          }
        }
        this.laju += (v - this.laju) * Math.min(1, dt * 6);
        this.model.position.set(this.pos.x, 0, this.pos.y); this.model.rotation.y = this.yaw;
      }
      EB.animasiWatak(this.model, this.laju, dt, t, 0);
    }
    buang() { this.dunia.scene.remove(this.model); }
  }
  EB.Penduduk = Penduduk;
})();
