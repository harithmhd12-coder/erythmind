/* Ekspedisi Buku · Dunia diorama isometrik.
   Semua model dibina daripada bentuk asas (tiada fail 3D), digabung ikut baris supaya ringan di telefon.
   Grid: 1 sel = 1 unit. Setiap baris peta = jalur D sel: sungai (0-2), plot utara (3-8), jalan (9-11), plot selatan (12-17), tepi (18-19). */
(function () {
  const EB = (window.EB = window.EB || {});
  const T = THREE;

  EB.rng = function (seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  EB.hash = function (s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  };

  const R = 6, S = 9, M = 8, D = 20, W = M * 2 + R * S; // 70 sel lebar
  EB.SUSUN = { R, S, M, D, W };
  // Jenis sel
  const RUMPUT = 0, JALAN = 1, PEJAL = 2, AIR = 3, LANTAI = 4, JAMBATAN = 5;
  EB.SEL = { RUMPUT, JALAN, PEJAL, AIR, LANTAI, JAMBATAN };

  /* ---------- Tema daerah ---------- */
  const TEMA = {
    kampung: { rumput: ['#7cc456', '#8fd060', '#6fb84c'], jalan: '#e3c48f', lantai: '#d9cdb8', bumbung: ['#d9533b', '#c8442f', '#e7b341', '#5d9c4a', '#3f78b5'], dinding: ['#f3e6cc', '#efdcb6', '#f6efe0'], pokok: 0.55, bandar: false },
    ladang: { rumput: ['#9ccf5a', '#a9d867', '#8bc34f'], jalan: '#d8b27a', lantai: '#d6c7a5', bumbung: ['#c8442f', '#e0a43c', '#8e5b3a'], dinding: ['#f2e2c4', '#e8d3ab'], pokok: 0.35, bandar: false },
    hutan: { rumput: ['#5ea84a', '#4f9a42', '#6db352'], jalan: '#c9a874', lantai: '#c4b89c', bumbung: ['#7a4f33', '#5d9c4a', '#a8442f'], dinding: ['#c9a27a', '#b88e66'], pokok: 0.95, bandar: false },
    tasik: { rumput: ['#86cc5e', '#78c255', '#94d469'], jalan: '#e6cf9f', lantai: '#dfd4bf', bumbung: ['#3f78b5', '#d9533b', '#f0f0f0'], dinding: ['#f7f1e3', '#e9f0f2'], pokok: 0.45, bandar: false },
    bandar: { rumput: ['#86c75a', '#7aba52'], jalan: '#5d6370', lantai: '#cfd3d8', bumbung: ['#8a8f99', '#6f7480'], dinding: ['#f4e3c8', '#f2d0c2', '#dfe8ee', '#f6f1e6', '#e8e1f3'], pokok: 0.3, bandar: true },
  };
  EB.TEMA = TEMA;

  /* ---------- Warna (sRGB → linear supaya serasi dengan outputEncoding sRGB) ---------- */
  const cacheWarna = new Map();
  function warna(hex) {
    let c = cacheWarna.get(hex);
    if (!c) { c = new T.Color(hex).convertSRGBToLinear(); cacheWarna.set(hex, c); }
    return c;
  }
  EB.warna = warna;

  /* ---------- Templat geometri ---------- */
  const TPL = {};
  function tpl() {
    if (TPL.kotak) return TPL;
    const ni = (g) => (g.index ? g.toNonIndexed() : g);
    TPL.kotak = ni(new T.BoxGeometry(1, 1, 1).translate(0, 0.5, 0));
    TPL.silinder = ni(new T.CylinderGeometry(1, 1, 1, 10).translate(0, 0.5, 0));
    TPL.silinder6 = ni(new T.CylinderGeometry(1, 1, 1, 6).translate(0, 0.5, 0));
    TPL.batang = ni(new T.CylinderGeometry(0.7, 1, 1, 6).translate(0, 0.5, 0));
    TPL.kon = ni(new T.ConeGeometry(1, 1, 7).translate(0, 0.5, 0));
    TPL.kon6 = ni(new T.ConeGeometry(1, 1, 6).translate(0, 0.5, 0));
    TPL.piramid = ni(new T.ConeGeometry(0.7072, 1, 4).rotateY(Math.PI / 4).translate(0, 0.5, 0));
    TPL.bola = ni(new T.IcosahedronGeometry(1, 1));
    TPL.bola0 = ni(new T.IcosahedronGeometry(1, 0));
    TPL.batu = ni(new T.DodecahedronGeometry(1, 0));
    const tri = new T.Shape(); tri.moveTo(-0.5, 0); tri.lineTo(0.5, 0); tri.lineTo(0, 1); tri.lineTo(-0.5, 0);
    TPL.bumbung = ni(new T.ExtrudeGeometry(tri, { depth: 1, bevelEnabled: false }).translate(0, 0, -0.5));
    TPL.satah = ni(new T.PlaneGeometry(1, 1).rotateX(-Math.PI / 2));
    const arch = new T.Shape();
    arch.moveTo(-0.5, 0); arch.lineTo(-0.5, 1); arch.lineTo(0.5, 1); arch.lineTo(0.5, 0); arch.lineTo(0.32, 0);
    arch.absarc(0, 0.12, 0.32, 0, Math.PI, false); arch.lineTo(-0.5, 0);
    TPL.lengkung = ni(new T.ExtrudeGeometry(arch, { depth: 1, bevelEnabled: false, curveSegments: 6 }).translate(0, 0, -0.5));
    return TPL;
  }

  /* ---------- Pembina: kumpul banyak bentuk ke satu BufferGeometry berwarna ---------- */
  const _m = new T.Matrix4(), _q = new T.Quaternion(), _e = new T.Euler(), _v = new T.Vector3(), _s = new T.Vector3(), _n3 = new T.Matrix3();
  class Pembina {
    constructor() { this.p = []; this.n = []; this.c = []; }
    tambah(geo, mat, hex) {
      const p = geo.attributes.position.array, n = geo.attributes.normal.array;
      const c = typeof hex === 'string' ? warna(hex) : hex;
      _n3.getNormalMatrix(mat);
      const e = mat.elements, ne = _n3.elements;
      for (let i = 0; i < p.length; i += 3) {
        const x = p[i], y = p[i + 1], z = p[i + 2];
        this.p.push(e[0] * x + e[4] * y + e[8] * z + e[12], e[1] * x + e[5] * y + e[9] * z + e[13], e[2] * x + e[6] * y + e[10] * z + e[14]);
        const nx = n[i], ny = n[i + 1], nz = n[i + 2];
        let ax = ne[0] * nx + ne[3] * ny + ne[6] * nz, ay = ne[1] * nx + ne[4] * ny + ne[7] * nz, az = ne[2] * nx + ne[5] * ny + ne[8] * nz;
        const l = Math.hypot(ax, ay, az) || 1;
        this.n.push(ax / l, ay / l, az / l);
        this.c.push(c.r, c.g, c.b);
      }
    }
    // bentuk(nama, x, y, z, sx, sy, sz, warna, rotY, rotX, rotZ) — y = dasar bentuk
    b(nama, x, y, z, sx, sy, sz, hex, ry = 0, rx = 0, rz = 0) {
      _e.set(rx, ry, rz, 'YXZ'); _q.setFromEuler(_e);
      _m.compose(_v.set(x, y, z), _q, _s.set(sx, sy, sz));
      this.tambah(tpl()[nama], _m, hex);
    }
    kotak(x, y, z, sx, sy, sz, hex, ry = 0) { this.b('kotak', x, y, z, sx, sy, sz, hex, ry); }
    quad(ax, ay, az, bx, by, bz, cx, cy, cz, dx, dy, dz, hex) {
      const c = typeof hex === 'string' ? warna(hex) : hex;
      const ux = bx - ax, uy = by - ay, uz = bz - az, vx = dx - ax, vy = dy - ay, vz = dz - az;
      let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
      const l = Math.hypot(nx, ny, nz) || 1; nx /= l; ny /= l; nz /= l;
      this.p.push(ax, ay, az, bx, by, bz, cx, cy, cz, ax, ay, az, cx, cy, cz, dx, dy, dz);
      for (let i = 0; i < 6; i++) { this.n.push(nx, ny, nz); this.c.push(c.r, c.g, c.b); }
    }
    geometri() {
      const g = new T.BufferGeometry();
      g.setAttribute('position', new T.Float32BufferAttribute(this.p, 3));
      g.setAttribute('normal', new T.Float32BufferAttribute(this.n, 3));
      g.setAttribute('color', new T.Float32BufferAttribute(this.c, 3));
      g.computeBoundingSphere();
      return g;
    }
    get kosong() { return this.p.length === 0; }
  }
  EB.Pembina = Pembina;

  /* ---------- Susun atur peta (deterministik) ---------- */
  EB.susunPeta = function (buku) {
    const nod = [], baris = [];
    let r0 = 0;
    buku.bahagian.forEach((bh, bi) => {
      const senarai = bh.bab.map((bab, i) => ({ jenis: 'bab', bab, bi, i }));
      senarai.push({ jenis: 'penjaga', bi });
      const nb = Math.ceil(senarai.length / R);
      for (let k = 0; k < nb; k++) baris.push({ tema: bh.tema || 'kampung', bi });
      senarai.forEach((n, k) => {
        const r = r0 + Math.floor(k / R), slot = k % R;
        const dir = r % 2 === 0 ? 1 : -1;
        const along = M + S * (slot + 0.5);
        const x = dir > 0 ? along : W - along;
        const utara = (slot + r) % 2 === 0;
        n.r = r; n.slot = slot; n.along = along; n.x = x; n.utara = utara;
        n.zPlot = r * D + (utara ? 5.5 : 14.5);
        n.zNpc = r * D + (utara ? 8.4 : 11.6);
        n.p = r * 1000 + along;
        n.idx = nod.length;
        nod.push(n);
      });
      r0 += nb;
    });
    const H = baris.length * D;
    // Sempadan kunci: antara nod i dan i+1
    nod.forEach((n, i) => {
      const nx = nod[i + 1];
      if (!nx) { n.potong = Infinity; return; }
      if (nx.r === n.r) n.potong = n.r * 1000 + (n.along + nx.along) / 2;
      else n.potong = n.r * 1000 + (n.along + (W - 4)) / 2;
    });
    return { nod, baris, H, W };
  };

  /* ---------- Grid & penempatan hiasan ---------- */
  class Grid {
    constructor(w, h) { this.w = w; this.h = h; this.sel = new Uint8Array(w * h); this.ambil = new Uint8Array(w * h); }
    dapat(x, z) { x |= 0; z |= 0; if (x < 0 || z < 0 || x >= this.w || z >= this.h) return PEJAL; return this.sel[z * this.w + x]; }
    set(x, z, v) { if (x < 0 || z < 0 || x >= this.w || z >= this.h) return; this.sel[z * this.w + x] = v; }
    bebas(x, z) { x |= 0; z |= 0; if (x < 0 || z < 0 || x >= this.w || z >= this.h) return false; return !this.ambil[z * this.w + x] && this.sel[z * this.w + x] === RUMPUT; }
    tanda(x0, z0, x1, z1, jenis) {
      for (let z = Math.floor(z0); z <= Math.floor(z1); z++) for (let x = Math.floor(x0); x <= Math.floor(x1); x++) {
        if (x < 0 || z < 0 || x >= this.w || z >= this.h) continue;
        this.ambil[z * this.w + x] = 1;
        if (jenis !== undefined) this.sel[z * this.w + x] = jenis;
      }
    }
    kawasanBebas(x0, z0, x1, z1) {
      for (let z = Math.floor(z0); z <= Math.floor(z1); z++) for (let x = Math.floor(x0); x <= Math.floor(x1); x++) if (!this.bebas(x, z)) return false;
      return true;
    }
  }
  EB.Grid = Grid;

  // Isi grid dan senarai item untuk satu baris
  function susunBaris(peta, grid, r, seed) {
    const rnd = EB.rng(seed + r * 7919);
    const br = peta.baris[r], tema = TEMA[br.tema] || TEMA.kampung;
    const z0 = r * D, dir = r % 2 === 0 ? 1 : -1;
    const akhir = r === peta.baris.length - 1;
    const xDariAlong = (a) => (dir > 0 ? a : W - a);
    const item = [];
    // sungai
    for (let z = z0; z < z0 + 3; z++) for (let x = 0; x < W; x++) grid.set(x, z, AIR);
    if (r > 0) {
      const xc = (r - 1) % 2 === 0 ? W - 4 : 4; // penyambung dari baris sebelumnya
      for (let z = z0; z < z0 + 3; z++) for (let x = xc - 1; x <= xc + 1; x++) grid.set(x, z, JAMBATAN);
      for (let z = z0 + 3; z < z0 + 9; z++) for (let x = xc - 1; x <= xc + 1; x++) grid.set(x, z, JALAN);
      item.push({ t: 'jambatan', x: xc, z: z0 + 1.5 });
    }
    // jalan utama
    const nodBaris = peta.nod.filter((n) => n.r === r);
    const aMula = r === 0 ? 1.5 : 2.5;
    const aAkhir = akhir ? Math.min(W - 2, nodBaris[nodBaris.length - 1].along + 5) : W - 2.5;
    for (let a = Math.floor(aMula); a <= Math.ceil(aAkhir); a++) {
      const x = Math.round(xDariAlong(a) - (dir > 0 ? 0 : 1));
      for (let z = z0 + 9; z <= z0 + 11; z++) grid.set(x, z, JALAN);
    }
    if (!akhir) {
      const xc = dir > 0 ? W - 4 : 4;
      for (let z = z0 + 9; z < z0 + D; z++) for (let x = xc - 1; x <= xc + 1; x++) grid.set(x, z, JALAN);
    }
    if (r === 0) { // dataran permulaan
      const xs = 3;
      for (let z = z0 + 7; z <= z0 + 13; z++) for (let x = 1; x <= 6; x++) if (grid.dapat(x, z) === RUMPUT) grid.set(x, z, LANTAI);
      item.push({ t: 'airpancut', x: xs + 0.5, z: z0 + 14.5 });
      grid.tanda(xs - 1, z0 + 13.5, xs + 2, z0 + 15.5, PEJAL);
    }
    // tandakan jalan supaya tiada hiasan
    for (let z = z0; z < z0 + D; z++) for (let x = 0; x < W; x++) { const s = grid.dapat(x, z); if (s !== RUMPUT) grid.ambil[z * W + x] = 1; }

    // plot
    for (let slot = 0; slot < R; slot++) {
      const along = M + S * (slot + 0.5), cx = xDariAlong(along);
      const nod = nodBaris.find((n) => n.slot === slot);
      for (const utara of [true, false]) {
        const pz0 = z0 + (utara ? 3 : 12), pz1 = z0 + (utara ? 8 : 17);
        const hadap = utara ? 0 : Math.PI; // hadap jalan (+z untuk utara)
        if (nod && nod.utara === utara) {
          // tapak mercu tanda
          for (let z = pz0; z <= pz1; z++) for (let x = Math.floor(cx - 3); x <= Math.floor(cx + 2); x++) grid.set(x, z, LANTAI);
          const bz = utara ? z0 + 4.5 : z0 + 15.5;
          item.push({ t: nod.jenis === 'penjaga' ? 'istana' : 'mercu', x: cx, z: bz, ry: hadap, nod: nod.idx, tema: br.tema });
          grid.tanda(cx - 2.5, bz - 1.5, cx + 1.5, bz + 0.5 + (utara ? 0 : 0), PEJAL);
          grid.tanda(cx - 2.5, bz - 1.5, cx + 1.5, bz + 1.5, PEJAL);
          const tz = utara ? z0 + 7 : z0 + 13;
          item.push({ t: 'tugu', x: cx - 2.2, z: tz, nod: nod.idx });
          grid.tanda(cx - 2.6, tz - 0.4, cx - 1.8, tz + 0.4, PEJAL);
          for (let z = pz0; z <= pz1; z++) for (let x = Math.floor(cx - 3); x <= Math.floor(cx + 2); x++) grid.ambil[z * W + x] = 1;
        } else if (!(akhir && slot > (nodBaris[nodBaris.length - 1] || { slot: 0 }).slot + 1)) {
          hiasPlot(item, grid, rnd, tema, br.tema, cx, pz0, pz1, utara, hadap);
        }
      }
    }
    // isi ruang kosong: pokok, semak, bunga, batu, lampu
    for (let z = z0 + 3; z < z0 + D; z++) for (let x = 0; x < W; x++) {
      if (!grid.bebas(x, z)) continue;
      const tepiJalan = [grid.dapat(x, z - 1), grid.dapat(x, z + 1), grid.dapat(x - 1, z), grid.dapat(x + 1, z)].some((s) => s === JALAN || s === LANTAI);
      const u = rnd();
      if (tepiJalan) {
        if (u < 0.07) { item.push({ t: tema.bandar ? 'lampuBandar' : 'lampu', x: x + 0.5, z: z + 0.5 }); grid.tanda(x, z, x, z, PEJAL); }
        else if (u < 0.11) { item.push({ t: 'bangku', x: x + 0.5, z: z + 0.5, ry: grid.dapat(x, z - 1) === JALAN ? Math.PI : grid.dapat(x, z + 1) === JALAN ? 0 : Math.PI / 2 }); grid.tanda(x, z, x, z, PEJAL); }
        else if (u < 0.3) item.push({ t: 'bunga', x: x + 0.5, z: z + 0.5, v: (rnd() * 5) | 0 }), (grid.ambil[z * W + x] = 1);
        continue;
      }
      const kp = tema.pokok;
      if (u < 0.24 * kp + 0.04) { item.push({ t: rnd() < (br.tema === 'hutan' ? 0.7 : 0.4) ? 'pain' : 'pokok', x: x + 0.5 + (rnd() - 0.5) * 0.4, z: z + 0.5 + (rnd() - 0.5) * 0.4, s: 0.8 + rnd() * 0.6, v: (rnd() * 3) | 0 }); grid.tanda(x, z, x, z, PEJAL); }
      else if (u < 0.3 * kp + 0.08) { item.push({ t: 'semak', x: x + 0.5, z: z + 0.5, s: 0.6 + rnd() * 0.6 }); grid.tanda(x, z, x, z, PEJAL); }
      else if (u < 0.3 * kp + 0.1) { item.push({ t: 'batu', x: x + 0.5, z: z + 0.5, s: 0.4 + rnd() * 0.5 }); grid.tanda(x, z, x, z, PEJAL); }
      else if (u < 0.3 * kp + 0.22) { item.push({ t: 'bunga', x: x + 0.5, z: z + 0.5, v: (rnd() * 5) | 0 }); grid.ambil[z * W + x] = 1; }
      else if (u < 0.3 * kp + 0.34) { item.push({ t: 'rumputan', x: x + 0.5, z: z + 0.5 }); }
    }
    // tebing sungai: batu & teratai & itik
    for (let x = 0; x < W; x++) {
      const s = grid.dapat(x, z0 + 1);
      if (s !== AIR) continue;
      if (rnd() < 0.18) item.push({ t: 'batu', x: x + 0.5, z: z0 + (rnd() < 0.5 ? 0.3 : 2.7), s: 0.35 + rnd() * 0.35, air: true });
      if (rnd() < 0.08) item.push({ t: 'teratai', x: x + 0.5, z: z0 + 1 + rnd() });
      if (rnd() < 0.025) item.push({ t: 'itik', x: x + 0.5, z: z0 + 1.5 });
      if (br.tema === 'tasik' && rnd() < 0.02) item.push({ t: 'perahu', x: x + 0.5, z: z0 + 1.5 });
    }
    return item;
  }

  function hiasPlot(item, grid, rnd, tema, namaTema, cx, pz0, pz1, utara, hadap) {
    const bz = utara ? pz0 + 1.5 : pz1 - 1.5;
    const pilih = rnd();
    const pick = (a) => a[(rnd() * a.length) | 0];
    if (namaTema === 'bandar') {
      const w = 4 + ((rnd() * 2) | 0);
      item.push({ t: 'kedai', x: cx - 0.5, z: bz, ry: hadap, w, tinggi: 2 + ((rnd() * 2) | 0), dinding: pick(tema.dinding), awning: pick(['#e74c3c', '#f1c40f', '#8e44ad', '#2e86c1', '#27ae60', '#e67e22']) });
      grid.tanda(cx - 0.5 - w / 2, bz - 1.5, cx - 0.5 + w / 2 - 1, bz + 1.5, PEJAL);
      if (rnd() < 0.6) { const kz = utara ? pz1 - 0.2 : pz0 + 0.2; item.push({ t: 'kereta', x: cx + 2, z: kz, ry: Math.PI / 2, v: pick(['#f4c430', '#3a86ff', '#e63946', '#ffffff', '#ff8c42']) }); grid.tanda(cx + 1, kz - 0.5, cx + 2.8, kz + 0.5, PEJAL); }
      return;
    }
    if (namaTema === 'ladang' && pilih < 0.45) {
      const x0 = cx - 2.5, x1 = cx + 1.5;
      item.push({ t: 'kebun', x0, x1, z0: pz0 + 0.5, z1: pz1 - 0.5, v: (rnd() * 3) | 0 });
      grid.tanda(x0, pz0 + 0.5, x1, pz1 - 0.5, PEJAL);
      return;
    }
    if (namaTema === 'ladang' && pilih < 0.6) {
      item.push({ t: 'kincir', x: cx - 0.5, z: bz });
      grid.tanda(cx - 1.5, bz - 1, cx + 0.5, bz + 1, PEJAL);
      for (let i = 0; i < 2; i++) item.push({ t: 'jerami', x: cx + 1.5, z: bz + (i - 0.5) * 2 });
      grid.tanda(cx + 1, bz - 1.5, cx + 2, bz + 1.5, PEJAL);
      return;
    }
    if (namaTema === 'ladang' && pilih < 0.78) {
      item.push({ t: 'kandang', x0: cx - 2.5, x1: cx + 2, z0: pz0 + 0.5, z1: pz1 - 0.5, n: 2 + ((rnd() * 3) | 0) });
      grid.tanda(cx - 2.5, pz0 + 0.5, cx + 2, pz1 - 0.5, PEJAL);
      return;
    }
    if (namaTema === 'tasik' && pilih < 0.45) {
      item.push({ t: 'kolam', x0: cx - 2.5, x1: cx + 2, z0: pz0 + 0.5, z1: pz1 - 0.5 });
      grid.tanda(cx - 2.5, pz0 + 0.5, cx + 2, pz1 - 0.5, PEJAL);
      return;
    }
    if (namaTema === 'kampung' && pilih < 0.3) {
      for (let i = 0; i < 2; i++) {
        const gx = cx - 1.5 + i * 2.6, gz = utara ? pz1 - 1 : pz0 + 1;
        item.push({ t: 'gerai', x: gx, z: gz, ry: hadap, v: pick(['#e74c3c', '#2e86c1', '#27ae60', '#f39c12']) });
        grid.tanda(gx - 1, gz - 0.8, gx + 0.8, gz + 0.8, PEJAL);
      }
      item.push({ t: 'perigi', x: cx, z: utara ? pz0 + 1.2 : pz1 - 1.2 });
      grid.tanda(cx - 1, (utara ? pz0 + 1.2 : pz1 - 1.2) - 0.7, cx + 0.5, (utara ? pz0 + 1.2 : pz1 - 1.2) + 0.7, PEJAL);
      return;
    }
    // rumah kecil
    const w = 3 + ((rnd() * 2) | 0), d = 2.6 + rnd() * 0.8;
    item.push({ t: namaTema === 'hutan' && rnd() < 0.6 ? 'pondok' : 'rumah', x: cx - 0.5, z: bz, ry: hadap, w, d, dinding: pick(tema.dinding), bumbung: pick(tema.bumbung), tingkat: rnd() < 0.3 ? 2 : 1, kincirAir: namaTema === 'kampung' && rnd() < 0.15 });
    grid.tanda(cx - 0.5 - w / 2, bz - d / 2, cx - 0.5 + w / 2 - 0.01, bz + d / 2, PEJAL);
    if (rnd() < 0.5) {
      const fz = utara ? pz1 : pz0;
      for (let x = Math.floor(cx - 3); x <= Math.floor(cx + 2); x++) if (grid.bebas(x, fz) && rnd() < 0.8) { item.push({ t: 'pagar', x: x + 0.5, z: fz + 0.5 }); grid.tanda(x, fz, x, fz, PEJAL); }
    }
  }

  /* ---------- Bina mesh untuk item ---------- */
  function binaItem(b, it, anim, peta) {
    const { x, z } = it;
    const ry = it.ry || 0;
    const cs = Math.cos(ry), sn = Math.sin(ry);
    const L = (lx, lz) => [x + lx * cs + lz * sn, z - lx * sn + lz * cs]; // tempatan → dunia (lz +ve = hadapan)
    const kotakL = (lx, ly, lz, sx, sy, sz, hex) => { const [wx, wz] = L(lx, lz); b.b('kotak', wx, ly, wz, sx, sy, sz, hex, ry); };
    switch (it.t) {
      case 'pokok': {
        const s = it.s, daun = ['#5cb343', '#7cc94e', '#4aa63c'][it.v];
        b.b('batang', x, 0, z, 0.12 * s, 0.7 * s, 0.12 * s, '#8a5a3b');
        b.b('bola', x, 1.05 * s, z, 0.62 * s, 0.55 * s, 0.62 * s, daun);
        b.b('bola0', x + 0.28 * s, 0.85 * s, z + 0.1 * s, 0.46 * s, 0.4 * s, 0.46 * s, daun);
        b.b('bola0', x - 0.22 * s, 1.35 * s, z - 0.12 * s, 0.42 * s, 0.36 * s, 0.42 * s, '#8fd65e');
        break;
      }
      case 'pain': {
        const s = it.s, daun = ['#2f7d4a', '#3a8c52', '#276b3f'][it.v];
        b.b('batang', x, 0, z, 0.1 * s, 0.5 * s, 0.1 * s, '#7a4f33');
        b.b('kon', x, 0.35 * s, z, 0.62 * s, 0.9 * s, 0.62 * s, daun);
        b.b('kon', x, 0.85 * s, z, 0.48 * s, 0.8 * s, 0.48 * s, daun);
        b.b('kon', x, 1.3 * s, z, 0.32 * s, 0.7 * s, 0.32 * s, '#46a060');
        break;
      }
      case 'semak': b.b('bola', x, 0.18 * it.s, z, 0.42 * it.s, 0.34 * it.s, 0.42 * it.s, '#5fae45'); b.b('bola0', x + 0.2, 0.12, z + 0.15, 0.27 * it.s, 0.23 * it.s, 0.27 * it.s, '#74c24f'); break;
      case 'batu': b.b('batu', x, it.air ? -0.25 : 0.05, z, 0.5 * it.s, 0.38 * it.s, 0.45 * it.s, it.air ? '#9aa3a8' : '#a9b0b3', x * 3.1); break;
      case 'rumputan': for (let i = 0; i < 3; i++) b.b('piramid', x + (i - 1) * 0.12, 0, z + ((i * 7) % 3 - 1) * 0.1, 0.06, 0.22, 0.06, '#4f9d3a'); break;
      case 'bunga': {
        const wb = ['#ff7eb6', '#ffd23f', '#ffffff', '#b28dff', '#ff6b4a'][it.v];
        for (let i = 0; i < 3; i++) { const ox = ((i * 37) % 7) / 7 - 0.4, oz = ((i * 53) % 7) / 7 - 0.4; b.kotak(x + ox * 0.7, 0, z + oz * 0.7, 0.03, 0.18, 0.03, '#3f8f35'); b.kotak(x + ox * 0.7, 0.17, z + oz * 0.7, 0.1, 0.08, 0.1, wb, i); }
        break;
      }
      case 'lampu': b.kotak(x, 0, z, 0.08, 1.3, 0.08, '#3b3b44'); b.kotak(x, 1.3, z, 0.22, 0.25, 0.22, '#ffe7a3'); b.b('piramid', x, 1.55, z, 0.3, 0.15, 0.3, '#3b3b44'); break;
      case 'lampuBandar': b.kotak(x, 0, z, 0.08, 1.6, 0.08, '#2d3038'); b.kotak(x, 1.6, z, 0.14, 0.14, 0.14, '#fff1c1'); b.kotak(x, 1.74, z, 0.2, 0.05, 0.2, '#2d3038'); break;
      case 'bangku': kotakL(0, 0.22, 0, 0.8, 0.06, 0.3, '#a0683e'); kotakL(0, 0.28, -0.14, 0.8, 0.25, 0.05, '#a0683e'); kotakL(-0.33, 0, 0, 0.06, 0.22, 0.28, '#444'); kotakL(0.33, 0, 0, 0.06, 0.22, 0.28, '#444'); break;
      case 'pagar': b.kotak(x - 0.45, 0, z, 0.08, 0.45, 0.08, '#b07a4a'); b.kotak(x, 0.18, z, 1, 0.06, 0.05, '#c48c56'); b.kotak(x, 0.34, z, 1, 0.06, 0.05, '#c48c56'); break;
      case 'teratai': b.b('silinder', x, -0.17, z, 0.18, 0.02, 0.18, '#5fb04a'); if ((x * 7) % 3 < 1) b.b('bola0', x + 0.05, -0.14, z, 0.06, 0.05, 0.06, '#ff9ccd'); break;
      case 'rumah': binaRumah(b, it, kotakL, L, anim); break;
      case 'pondok': {
        const { w, d } = it;
        kotakL(0, 0, 0, w, 0.2, d, '#8d8d8d');
        for (let i = 0; i < 4; i++) kotakL(0, 0.2 + i * 0.32, 0, w - 0.1, 0.3, d - 0.1, i % 2 ? '#9b6b43' : '#a8784d');
        const [wx, wz] = L(0, 0); b.b('bumbung', wx, 1.48, wz, w + 0.4, 1.1, d + 0.5, it.bumbung, ry + Math.PI / 2);
        kotakL(0, 0.2, d / 2, 0.55, 0.85, 0.06, '#5b3a24');
        kotakL(w / 2 - 0.4, 1.4, -0.4, 0.3, 1.2, 0.3, '#8a8a8a');
        anim.push(asap(L(w / 2 - 0.4, -0.4), 2.7));
        break;
      }
      case 'kedai': binaKedai(b, it, kotakL, L); break;
      case 'gerai': {
        kotakL(0, 0, 0, 1.6, 0.5, 0.9, '#b98552');
        [[-0.75, -0.4], [0.75, -0.4], [-0.75, 0.4], [0.75, 0.4]].forEach(([a, c]) => kotakL(a, 0, c, 0.07, 1.2, 0.07, '#7a4f33'));
        for (let i = 0; i < 5; i++) { const [wx, wz] = L(-0.68 + i * 0.34, 0.1); b.b('kotak', wx, 1.2, wz, 0.34, 0.05, 1.15, i % 2 ? '#ffffff' : it.v, ry, -0.25); }
        for (let i = 0; i < 4; i++) { const [wx, wz] = L(-0.55 + i * 0.36, 0.2); b.b('bola0', wx, 0.56, wz, 0.12, 0.1, 0.12, ['#ff6b4a', '#ffd23f', '#7cc94e', '#ff9f1c'][i]); }
        break;
      }
      case 'perigi': b.b('silinder', x, 0, z, 0.55, 0.5, 0.55, '#a7a9ad'); b.b('silinder', x, 0.45, z, 0.42, 0.06, 0.42, '#3d8fc4'); b.kotak(x - 0.45, 0.5, z, 0.08, 0.8, 0.08, '#7a4f33'); b.kotak(x + 0.45, 0.5, z, 0.08, 0.8, 0.08, '#7a4f33'); b.b('bumbung', x, 1.25, z, 1.2, 0.45, 0.9, '#c8442f', Math.PI / 2); break;
      case 'airpancut': {
        b.b('silinder', x, 0, z, 1.25, 0.35, 1.25, '#bfc4c9'); b.b('silinder', x, 0.3, z, 1.05, 0.06, 1.05, '#55b8e0');
        b.b('silinder', x, 0, z, 0.22, 1.1, 0.22, '#d5d8dc'); b.b('silinder', x, 1.05, z, 0.55, 0.12, 0.55, '#bfc4c9'); b.b('silinder', x, 1.15, z, 0.45, 0.04, 0.45, '#7fd0ee');
        anim.push(pancut(x, z));
        break;
      }
      case 'jambatan': {
        const sx = 3.2;
        b.b('lengkung', x, -0.6, z, sx, 0.75, 3.2, '#b9b3a8', Math.PI / 2);
        b.kotak(x, 0.0, z, sx, 0.15, 3.4, '#cfc7b6');
        for (const s of [-1, 1]) { b.kotak(x + s * (sx / 2 - 0.1), 0.15, z, 0.18, 0.35, 3.4, '#a59d90'); for (let i = -1; i <= 1; i++) b.kotak(x + s * (sx / 2 - 0.1), 0.15, z + i * 1.5, 0.26, 0.5, 0.26, '#958d81'); }
        break;
      }
      case 'kebun': {
        const wn = ['#e0b84a', '#6fbf4a', '#c9d65a'][it.v];
        b.kotak((it.x0 + it.x1 + 1) / 2, 0, (it.z0 + it.z1 + 1) / 2, it.x1 - it.x0 + 1, 0.08, it.z1 - it.z0 + 1, '#8a5f3d');
        for (let zz = it.z0 + 0.5; zz <= it.z1 + 0.5; zz += 0.7) for (let xx = it.x0 + 0.4; xx <= it.x1 + 0.7; xx += 0.5) b.b('bola0', xx, 0.12, zz, 0.18, 0.2 + (it.v === 0 ? 0.15 : 0), 0.18, wn);
        break;
      }
      case 'jerami': b.b('silinder', x, 0, z, 0.45, 0.7, 0.45, '#e3c15a', 0, 0, Math.PI / 2 * 0); break;
      case 'kincir': {
        b.b('batang', x, 0, z, 0.9, 2.8, 0.9, '#efe4cf'); b.b('kon', x, 2.8, z, 1.0, 0.9, 1.0, '#b5482f');
        b.kotak(x, 0, z + 0.85, 0.5, 0.8, 0.1, '#6b4429');
        anim.push(bilahKincir(x, 2.6, z + 0.95));
        break;
      }
      case 'kandang': {
        const { x0, x1, z0, z1 } = it;
        for (let xx = x0; xx <= x1 + 1; xx += 1) { b.kotak(xx, 0, z0, 0.08, 0.45, 0.08, '#b07a4a'); b.kotak(xx, 0, z1 + 1, 0.08, 0.45, 0.08, '#b07a4a'); }
        for (let zz = z0; zz <= z1 + 1; zz += 1) { b.kotak(x0, 0, zz, 0.08, 0.45, 0.08, '#b07a4a'); b.kotak(x1 + 1, 0, zz, 0.08, 0.45, 0.08, '#b07a4a'); }
        const mx = (x0 + x1 + 1) / 2, mz = (z0 + z1 + 1) / 2, lw = x1 - x0 + 1, ld = z1 - z0 + 1;
        b.kotak(mx, 0.3, z0, lw, 0.06, 0.05, '#c48c56'); b.kotak(mx, 0.3, z1 + 1, lw, 0.06, 0.05, '#c48c56');
        b.kotak(x0, 0.3, mz, 0.05, 0.06, ld, '#c48c56'); b.kotak(x1 + 1, 0.3, mz, 0.05, 0.06, ld, '#c48c56');
        for (let i = 0; i < it.n; i++) anim.push(biri(x0 + 1 + ((i * 1.7) % (lw - 1.5)), z0 + 1 + ((i * 2.3) % (ld - 1.5)), i, x0 + 0.6, x1 + 0.4, z0 + 0.6, z1 + 0.4));
        break;
      }
      case 'kolam': {
        const { x0, x1, z0, z1 } = it;
        const mx = (x0 + x1 + 1) / 2, mz = (z0 + z1 + 1) / 2;
        b.b('silinder', mx, -0.05, mz, (x1 - x0 + 1) / 2, 0.12, (z1 - z0 + 1) / 2, '#b0a89a');
        anim.push({ air: [mx, mz, (x1 - x0) / 2, (z1 - z0) / 2] });
        b.kotak(mx + 1.2, 0, mz, 1.6, 0.18, 0.7, '#a36b3c');
        for (let i = 0; i < 3; i++) b.kotak(mx + 0.6 + i * 0.6, -0.2, mz + 0.3, 0.1, 0.4, 0.1, '#7a4f33');
        anim.push(perahu(mx - 0.8, mz, 0.6));
        break;
      }
      case 'kereta': {
        kotakL(0, 0.12, 0, 0.6, 0.28, 1.2, it.v); kotakL(0, 0.4, -0.05, 0.56, 0.24, 0.65, it.v); kotakL(0, 0.42, -0.05, 0.58, 0.18, 0.62, '#9fd3ff');
        for (const [a, c] of [[-0.3, -0.38], [0.3, -0.38], [-0.3, 0.38], [0.3, 0.38]]) { const [wx, wz] = L(a, c); b.b('silinder', wx, 0.14, wz - 0.0, 0.14, 0.1, 0.14, '#222', ry, 0, Math.PI / 2); }
        break;
      }
      case 'itik': anim.push(itik(x, z)); break;
      case 'perahu': anim.push(perahu(x, z, 1)); break;
      case 'mercu': binaMercu(b, it, kotakL, L, anim); break;
      case 'istana': binaIstana(b, it, kotakL, L, anim); break;
      case 'tugu': {
        b.b('silinder6', x, 0, z, 0.42, 0.2, 0.42, '#b9b3a8'); b.b('silinder6', x, 0.2, z, 0.28, 0.6, 0.28, '#d8d2c6'); b.b('silinder6', x, 0.8, z, 0.38, 0.1, 0.38, '#b9b3a8');
        anim.push(bukuTerapung(x, 1.35, z, it.nod));
        break;
      }
    }
  }

  function binaRumah(b, it, kotakL, L, anim) {
    const { w, d, ry } = it; const t = it.tingkat, h = 1.2 * t;
    kotakL(0, 0, 0, w + 0.2, 0.25, d + 0.2, '#a49b8d');
    kotakL(0, 0.25, 0, w, h, d, it.dinding);
    // rasuk kayu
    for (const s of [-1, 1]) { kotakL(s * (w / 2), 0.25, d / 2, 0.12, h, 0.12, '#6b4429'); kotakL(s * (w / 2), 0.25, -d / 2, 0.12, h, 0.12, '#6b4429'); }
    kotakL(0, 0.25 + h - 0.08, d / 2 + 0.01, w, 0.1, 0.06, '#6b4429');
    if (t > 1) kotakL(0, 0.25 + 1.15, d / 2 + 0.01, w, 0.08, 0.06, '#6b4429');
    // pintu & tingkap
    kotakL(-w * 0.15, 0.25, d / 2 + 0.02, 0.5, 0.8, 0.06, '#7a4a2a');
    kotakL(w * 0.25, 0.65, d / 2 + 0.02, 0.45, 0.4, 0.06, '#9fd0ea');
    kotakL(w * 0.25, 0.6, d / 2 + 0.06, 0.55, 0.08, 0.14, '#ff8fb1');
    if (t > 1) { kotakL(-w * 0.2, 1.75, d / 2 + 0.02, 0.45, 0.4, 0.06, '#9fd0ea'); kotakL(w * 0.25, 1.75, d / 2 + 0.02, 0.45, 0.4, 0.06, '#9fd0ea'); }
    const [wx, wz] = L(0, 0);
    b.b('bumbung', wx, 0.25 + h - 0.05, wz, d + 0.5, 1.15, w + 0.45, it.bumbung, it.ry + Math.PI / 2);
    kotakL(w * 0.3, 0.25 + h + 0.2, -d * 0.2, 0.32, 1.0, 0.32, '#9a5f45');
    anim.push(asap(L(w * 0.3, -d * 0.2), 0.25 + h + 1.25));
    if (it.kincirAir) anim.push(kincirAir(L(-w / 2 - 0.25, 0), it.ry));
  }

  function binaKedai(b, it, kotakL, L) {
    const { w, tinggi } = it; const d = 2.8, h = tinggi * 1.1;
    kotakL(0, 0, 0, w, h, d, it.dinding);
    kotakL(0, h, 0, w + 0.12, 0.15, d + 0.12, '#c9c2b6');
    kotakL(w * 0.25, h + 0.15, -0.3, 0.6, 0.4, 0.6, '#d7dbe0');
    kotakL(0, 0, d / 2 + 0.02, w * 0.85, 0.95, 0.05, '#bfe3f5');
    kotakL(0, 0, d / 2 + 0.04, 0.55, 0.85, 0.05, '#6b4a3a');
    for (let i = 0; i < 6; i++) { const [wx, wz] = L(-w / 2 + (i + 0.5) * (w / 6), d / 2 + 0.4); b.b('kotak', wx, 1.05, wz, w / 6, 0.05, 0.9, i % 2 ? '#ffffff' : it.awning, it.ry, 0.35); }
    for (let f = 1; f < tinggi; f++) for (let i = 0; i < 3; i++) kotakL(-w / 2 + (i + 0.5) * (w / 3), f * 1.1 + 0.3, d / 2 + 0.02, 0.5, 0.5, 0.05, '#a9d7ee');
    for (let i = 0; i < 2; i++) kotakL(-w / 2 + 0.5 + i * (w - 1), 0, d / 2 + 0.5, 0.35, 0.3, 0.35, '#c0703a');
  }

  function binaMercu(b, it, kotakL, L, anim) {
    const tema = it.tema; const ry = it.ry;
    // dewan ilmu: bangunan dua tingkat dengan menara kecil
    const dinding = { kampung: '#f6e9cf', ladang: '#f1dfbf', hutan: '#d8b48a', tasik: '#f4f6f8', bandar: '#f1e4d4' }[tema] || '#f6e9cf';
    const bumbung = { kampung: '#d9533b', ladang: '#c27b2c', hutan: '#5d8f3e', tasik: '#3f78b5', bandar: '#7d5ba6' }[tema] || '#d9533b';
    kotakL(-0.5, 0, 0, 4.2, 0.3, 3.2, '#b3aa9b');
    kotakL(-0.5, 0.3, 0, 3.8, 2.4, 2.8, dinding);
    for (const s of [-1, 1]) kotakL(-0.5 + s * 1.9, 0.3, 1.4, 0.16, 2.4, 0.16, '#6b4429');
    kotakL(-0.5, 0.3 + 1.2, 1.42, 3.8, 0.1, 0.06, '#6b4429');
    kotakL(-0.5, 0.3, 1.42, 0.8, 1.1, 0.06, '#7a4a2a');
    kotakL(-0.5, 1.4, 1.43, 0.9, 0.12, 0.08, '#e7b341');
    for (const s of [-1, 1]) { kotakL(-0.5 + s * 1.1, 0.75, 1.42, 0.5, 0.5, 0.06, '#9fd0ea'); kotakL(-0.5 + s * 1.1, 1.85, 1.42, 0.5, 0.5, 0.06, '#9fd0ea'); }
    const [wx, wz] = L(-0.5, 0);
    b.b('bumbung', wx, 2.65, wz, 3.4, 1.4, 4.3, bumbung, ry + Math.PI / 2);
    // menara
    const [tx, tz] = L(1.3, -0.6);
    b.b('silinder6', tx, 0, tz, 0.75, 3.8, 0.75, dinding);
    b.b('kon6', tx, 3.8, tz, 0.95, 1.5, 0.95, bumbung);
    b.kotak(tx, 5.3, tz, 0.04, 0.7, 0.04, '#555');
    anim.push(bendera(tx, 5.75, tz, bumbung));
    kotakL(1.3, 2.4, -0.6 + 0.72, 0.35, 0.5, 0.06, '#9fd0ea');
  }

  function binaIstana(b, it, kotakL, L, anim) {
    const batu = '#c9c3b8', gelap = '#a79f93', bumbung = '#6c4fb3';
    kotakL(-0.5, 0, 0, 4.4, 0.3, 3.2, '#9f988c');
    kotakL(-0.5, 0.3, -0.2, 3.4, 2.6, 2.4, batu);
    for (let i = 0; i < 5; i++) kotakL(-2 + i * 0.75, 2.9, 1.0, 0.4, 0.35, 0.3, batu);
    kotakL(-0.5, 0.3, 1.02, 1.0, 1.5, 0.08, '#5b3a24');
    kotakL(-0.5, 1.8, 1.03, 1.1, 0.12, 0.1, '#e7b341');
    for (const s of [-1, 1]) {
      const [tx, tz] = L(-0.5 + s * 2.0, 0.6);
      b.b('silinder', tx, 0, tz, 0.7, 3.8, 0.7, gelap);
      b.b('silinder', tx, 3.8, tz, 0.8, 0.25, 0.8, batu);
      b.b('kon', tx, 4.05, tz, 0.85, 1.6, 0.85, bumbung);
      anim.push(bendera(tx, 5.65, tz, '#ffd23f'));
    }
    const [cx, cz] = L(-0.5, -0.6);
    b.b('silinder6', cx, 2.9, cz, 0.6, 1.6, 0.6, batu); b.b('kon6', cx, 4.5, cz, 0.75, 1.4, 0.75, bumbung);
    anim.push(bendera(cx, 5.9, cz, '#ff6b4a'));
  }

  /* ---------- Objek beranimasi ---------- */
  const matBiasa = {};
  function mat(hex, emis) {
    const k = hex + (emis || '');
    if (!matBiasa[k]) matBiasa[k] = new T.MeshStandardMaterial({ color: hex, roughness: 0.75, flatShading: true, emissive: emis ? new T.Color(hex) : 0x000000, emissiveIntensity: emis || 0 });
    return matBiasa[k];
  }
  EB.mat = mat;
  function jejaring(geo, m) { const o = new T.Mesh(geo, m); o.castShadow = true; o.receiveShadow = true; return o; }

  function asap([x, z], y) {
    const g = new T.Group(); const bola = [];
    for (let i = 0; i < 4; i++) { const m = new T.Mesh(tpl().bola, new T.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.8, roughness: 1 })); m.scale.setScalar(0.18); g.add(m); bola.push(m); }
    g.position.set(x, y, z);
    return { obj: g, kemas(t) { bola.forEach((m, i) => { const f = (t * 0.35 + i / 4) % 1; m.position.set(Math.sin(f * 4 + i) * 0.15 + f * 0.3, f * 1.6, 0); m.scale.setScalar(0.12 + f * 0.3); m.material.opacity = 0.75 * (1 - f); }); } };
  }
  function pancut(x, z) {
    const g = new T.Group(); const tit = [];
    for (let i = 0; i < 6; i++) { const m = new T.Mesh(tpl().bola0, mat('#bfeeff', 0.3)); m.scale.setScalar(0.07); g.add(m); tit.push(m); }
    g.position.set(x, 1.2, z);
    return { obj: g, kemas(t) { tit.forEach((m, i) => { const a = (i / 6) * Math.PI * 2, f = (t * 0.9 + i * 0.17) % 1; m.position.set(Math.cos(a) * f * 0.5, Math.sin(f * Math.PI) * 0.45 - f * 0.2, Math.sin(a) * f * 0.5); }); } };
  }
  function bilahKincir(x, y, z) {
    const g = new T.Group();
    for (let i = 0; i < 4; i++) { const p = jejaring(tpl().kotak, mat('#f3ead7')); p.scale.set(0.35, 1.5, 0.05); p.rotation.z = (i * Math.PI) / 2; p.position.set(Math.sin(-p.rotation.z) * 0, 0, 0); const h = new T.Group(); h.rotation.z = (i * Math.PI) / 2; p.rotation.z = 0; p.position.y = 0.05; h.add(p); g.add(h); }
    const hub = jejaring(tpl().bola0, mat('#6b4429')); hub.scale.setScalar(0.16); g.add(hub);
    g.position.set(x, y, z);
    return { obj: g, kemas(t) { g.rotation.z = t * 0.8; } };
  }
  function kincirAir([x, z], ry) {
    const g = new T.Group();
    for (let i = 0; i < 6; i++) { const p = jejaring(tpl().kotak, mat('#8a5a3b')); p.scale.set(0.08, 1.4, 0.35); p.position.y = -0.7; const h = new T.Group(); h.rotation.x = (i * Math.PI) / 3; h.add(p); g.add(h); }
    const r = jejaring(tpl().silinder, mat('#6b4429')); r.scale.set(0.7, 0.1, 0.7); r.rotation.z = Math.PI / 2; r.position.x = -0.05; g.add(r);
    g.position.set(x, 0.75, z); g.rotation.y = ry;
    return { obj: g, kemas(t) { g.children.forEach((h, i) => { if (i < 6) h.rotation.x = (i * Math.PI) / 3 + t * 0.9; }); } };
  }
  function bendera(x, y, z, hex) {
    const geo = new T.PlaneGeometry(0.7, 0.4, 6, 1).translate(0.35, 0, 0);
    const m = new T.Mesh(geo, new T.MeshStandardMaterial({ color: hex, side: T.DoubleSide, roughness: 0.8 }));
    m.position.set(x, y, z); m.castShadow = true;
    const asal = geo.attributes.position.array.slice();
    return { obj: m, kemas(t) { const p = geo.attributes.position.array; for (let i = 0; i < p.length; i += 3) p[i + 2] = Math.sin(asal[i] * 6 - t * 5) * 0.08 * asal[i]; geo.attributes.position.needsUpdate = true; } };
  }
  function itik(x, z) {
    const g = new T.Group();
    const bd = jejaring(tpl().bola, mat('#ffffff')); bd.scale.set(0.18, 0.13, 0.24); g.add(bd);
    const kp = jejaring(tpl().bola, mat('#ffffff')); kp.scale.setScalar(0.1); kp.position.set(0, 0.15, 0.15); g.add(kp);
    const pt = jejaring(tpl().kon, mat('#ffa531')); pt.scale.set(0.04, 0.1, 0.04); pt.rotation.x = Math.PI / 2; pt.position.set(0, 0.14, 0.26); g.add(pt);
    g.position.set(x, -0.12, z);
    const f = Math.random() * 6;
    return { obj: g, kemas(t) { g.position.x = x + Math.sin(t * 0.25 + f) * 2.5; g.rotation.y = Math.cos(t * 0.25 + f) > 0 ? Math.PI / 2 : -Math.PI / 2; g.position.y = -0.12 + Math.sin(t * 2 + f) * 0.02; } };
  }
  function perahu(x, z, s) {
    const g = new T.Group();
    const bd = jejaring(tpl().kotak, mat('#a8693d')); bd.scale.set(0.5 * s, 0.22 * s, 1.3 * s); g.add(bd);
    const tg = jejaring(tpl().kotak, mat('#7a4f33')); tg.scale.set(0.05, 1.3 * s, 0.05); g.add(tg);
    const ly = new T.Mesh(new T.BufferGeometry().setFromPoints([new T.Vector3(0, 0.25 * s, 0), new T.Vector3(0, 1.35 * s, 0), new T.Vector3(0, 0.25 * s, 0.7 * s)]), new T.MeshStandardMaterial({ color: 0xfff6e6, side: T.DoubleSide }));
    ly.geometry.computeVertexNormals(); ly.castShadow = true; g.add(ly);
    g.position.set(x, -0.25, z); g.rotation.y = Math.PI / 2;
    const f = Math.random() * 6;
    return { obj: g, kemas(t) { g.position.y = -0.25 + Math.sin(t * 1.3 + f) * 0.03; g.rotation.z = Math.sin(t * 1.1 + f) * 0.05; } };
  }
  function biri(x, z, i, x0, x1, z0, z1) {
    const g = new T.Group();
    const bd = jejaring(tpl().bola, mat('#f7f4ee')); bd.scale.set(0.28, 0.22, 0.36); bd.position.y = 0.32; g.add(bd);
    const kp = jejaring(tpl().bola, mat('#3b3540')); kp.scale.set(0.12, 0.13, 0.14); kp.position.set(0, 0.38, 0.34); g.add(kp);
    for (const [a, c] of [[-0.12, -0.15], [0.12, -0.15], [-0.12, 0.15], [0.12, 0.15]]) { const k = jejaring(tpl().kotak, mat('#3b3540')); k.scale.set(0.05, 0.16, 0.05); k.position.set(a, 0, c); g.add(k); }
    g.position.set(x, 0, z);
    let tx = x, tz = z, rehat = 0;
    return { obj: g, kemas(t, dt) {
      rehat -= dt;
      if (rehat <= 0) { tx = x0 + Math.random() * (x1 - x0); tz = z0 + Math.random() * (z1 - z0); rehat = 3 + Math.random() * 4; }
      const dx = tx - g.position.x, dz = tz - g.position.z, d = Math.hypot(dx, dz);
      if (d > 0.1) { g.position.x += (dx / d) * dt * 0.4; g.position.z += (dz / d) * dt * 0.4; g.rotation.y = Math.atan2(dx, dz); bd.position.y = 0.32 + Math.abs(Math.sin(t * 8)) * 0.03; }
      else kp.position.y = 0.3 + Math.sin(t * 2 + i) * 0.04;
    } };
  }
  // Buku terapung di atas tugu: penanda bab
  const bukuMat = {};
  function bukuTerapung(x, y, z, idx) {
    const g = new T.Group();
    const kulit = new T.Mesh(tpl().kotak, new T.MeshStandardMaterial({ color: 0x8a3b2f, roughness: 0.6, flatShading: true }));
    kulit.scale.set(0.62, 0.05, 0.44); kulit.position.y = -0.02; g.add(kulit);
    for (const s of [-1, 1]) {
      const hl = new T.Mesh(tpl().kotak, new T.MeshStandardMaterial({ color: 0xfff7e0, emissive: 0xffe9a8, emissiveIntensity: 0.35, flatShading: true }));
      hl.scale.set(0.28, 0.06, 0.4); hl.position.set(s * 0.15, 0.02, 0); hl.rotation.z = -s * 0.18; g.add(hl);
    }
    const cincin = new T.Mesh(new T.TorusGeometry(0.55, 0.025, 6, 32), new T.MeshBasicMaterial({ color: 0xffe28a, transparent: true, opacity: 0.8 }));
    cincin.rotation.x = Math.PI / 2; cincin.position.y = -0.35; g.add(cincin);
    g.position.set(x, y, z); g.castShadow = true;
    const o = { obj: g, nod: idx, cincin, kulit, kemas(t) { g.position.y = y + Math.sin(t * 1.6 + idx) * 0.08; g.rotation.y = t * 0.6 + idx; cincin.scale.setScalar(1 + Math.sin(t * 2.4) * 0.06); } };
    return o;
  }

  /* ---------- Bahan air (shader ringkas dengan kabus) ---------- */
  function bahanAir(jatuh) {
    return new T.ShaderMaterial({
      transparent: true, fog: true,
      uniforms: T.UniformsUtils.merge([T.UniformsLib.fog, { uMasa: { value: 0 }, uJatuh: { value: jatuh ? 1 : 0 } }]),
      vertexShader: `
        varying vec3 vPos; varying vec2 vUv;
        #include <fog_pars_vertex>
        uniform float uMasa; uniform float uJatuh;
        void main(){ vUv = uv; vec3 p = position; vec4 w = modelMatrix * vec4(p,1.0);
          if(uJatuh < 0.5) w.y += sin(w.x*1.3 + uMasa*1.6)*0.025 + cos(w.z*1.7 + uMasa*1.2)*0.02;
          vPos = w.xyz; vec4 mvPosition = viewMatrix * w; gl_Position = projectionMatrix * mvPosition;
          #include <fog_vertex>
        }`,
      fragmentShader: `
        varying vec3 vPos; varying vec2 vUv; uniform float uMasa; uniform float uJatuh;
        #include <fog_pars_fragment>
        void main(){
          vec3 dalam = vec3(0.04,0.33,0.55), cetek = vec3(0.22,0.70,0.85);
          float g;
          if(uJatuh > 0.5){ g = sin(vUv.x*40.0 + sin(vUv.y*3.0)*2.0)*0.5+0.5; float s = fract(vUv.y*3.0 + uMasa*1.4); vec3 c = mix(cetek, vec3(0.92,0.98,1.0), smoothstep(0.55,1.0,g)*0.6 + s*0.15); c = mix(c, vec3(1.0), smoothstep(0.85,1.0,1.0-vUv.y)*0.0 + smoothstep(0.0,0.15,1.0-vUv.y)*0.0); gl_FragColor = vec4(c, 0.88); }
          else {
            g = sin(vPos.x*2.1 + uMasa*1.3 + sin(vPos.z*1.7))*0.5 + sin(vPos.z*2.7 - uMasa*1.1 + cos(vPos.x*1.3))*0.5;
            vec3 c = mix(dalam, cetek, 0.55 + g*0.25);
            float k = smoothstep(0.82, 0.98, sin(vPos.x*5.0 + vPos.z*3.0 + uMasa*2.0)*sin(vPos.z*4.0 - uMasa*1.5));
            c += k*0.35;
            gl_FragColor = vec4(c, 0.86);
          }
          gl_FragColor.rgb = pow(gl_FragColor.rgb, vec3(1.0/2.2)) ;
          gl_FragColor.rgb = pow(gl_FragColor.rgb, vec3(2.2));
          #include <fog_fragment>
          #include <encodings_fragment>
        }`,
    });
  }

  /* ---------- Bina satu baris (chunk) ---------- */
  function binaBaris(dunia, r) {
    const { peta, grid } = dunia;
    const br = peta.baris[r], tema = TEMA[br.tema] || TEMA.kampung;
    const z0 = r * D, z1 = z0 + D;
    const b = new Pembina();
    const anim = [];
    const rnd = EB.rng(dunia.seed + r * 131);
    const rumput = tema.rumput.map(warna);
    const tmp = new T.Color();
    // tanah
    for (let z = z0; z < z1; z++) for (let x = 0; x < W; x++) {
      const s = grid.dapat(x, z);
      let hex, y = 0;
      if (s === AIR || s === JAMBATAN) { y = -0.6; hex = '#3d7f8f'; }
      else if (s === JALAN) hex = tema.jalan;
      else if (s === LANTAI) hex = (x + z) % 2 ? tema.lantai : '#e6dccb';
      if (hex) { tmp.copy(warna(hex)); if (s === JALAN && !tema.bandar) tmp.offsetHSL(0, 0, (rnd() - 0.5) * 0.03); }
      else { tmp.copy(rumput[(rnd() * rumput.length) | 0]).offsetHSL(0, 0, (rnd() - 0.5) * 0.03); }
      b.quad(x, y, z + 1, x + 1, y, z + 1, x + 1, y, z, x, y, z, tmp.clone());
    }
    // jalan bandar: garisan lorong & lintasan
    if (tema.bandar) {
      for (let x = 0; x < W; x += 2) if (grid.dapat(x, z0 + 10) === JALAN) b.kotak(x + 0.5, 0.005, z0 + 10.5, 0.8, 0.01, 0.08, '#f4f1e1');
      for (let x = 0; x < W; x++) for (const zz of [z0 + 8, z0 + 12]) if (grid.dapat(x, zz) !== JALAN && grid.dapat(x, zz) !== AIR && grid.dapat(x, z0 + 10) === JALAN) b.kotak(x + 0.5, 0, zz + 0.5, 1, 0.08, 1, '#d3d6db');
    }
    // dinding tebing sungai
    for (let x = 0; x < W; x++) {
      if (grid.dapat(x, z0 + 3) !== AIR && grid.dapat(x, z0 + 2) !== RUMPUT) b.quad(x, -0.6, z0 + 3, x + 1, -0.6, z0 + 3, x + 1, 0, z0 + 3, x, 0, z0 + 3, '#8f7a5c');
      if (r > 0 && grid.dapat(x, z0 - 1) !== AIR) b.quad(x + 1, -0.6, z0, x, -0.6, z0, x, 0, z0, x + 1, 0, z0, '#8f7a5c');
    }
    // sisi diorama (lapisan tanah)
    const lapis = [[0, -0.22, '#6fb84c'], [-0.22, -1.1, '#8b5e3c'], [-1.1, -1.9, '#a8774b'], [-1.9, -3.2, '#7c6a5a']];
    const sisi = (ax, az, bx, bz, atas) => { for (const [y0, y1, h] of lapis) { const ya = Math.min(y0, atas), yb = y1; if (ya <= yb) continue; b.quad(ax, yb, az, bx, yb, bz, bx, ya, bz, ax, ya, az, y0 === 0 ? '#6fb84c' : h); } };
    for (let z = z0; z < z1; z++) {
      const sk = grid.dapat(0, z), sn = grid.dapat(W - 1, z);
      sisi(0, z, 0, z + 1, sk === AIR ? -0.6 : 0);
      sisi(W, z + 1, W, z, sn === AIR ? -0.6 : 0);
    }
    if (r === 0) for (let x = 0; x < W; x++) sisi(x + 1, 0, x, 0, -0.6);
    if (r === peta.baris.length - 1) for (let x = 0; x < W; x++) sisi(x, z1, x + 1, z1, 0);
    // item
    const item = dunia.itemBaris[r];
    for (const it of item) binaItem(b, it, anim, peta);

    const g = new T.Group();
    const statik = new T.Mesh(b.geometri(), dunia.bahanStatik);
    statik.castShadow = true; statik.receiveShadow = true;
    g.add(statik);
    // air sungai + air terjun di kedua-dua hujung
    const ga = new T.PlaneGeometry(W, 3).rotateX(-Math.PI / 2).translate(W / 2, -0.2, z0 + 1.5);
    const air = new T.Mesh(ga, dunia.bahanAir); g.add(air);
    for (const [xx, rot] of [[0, -Math.PI / 2], [W, Math.PI / 2]]) {
      const gj = new T.PlaneGeometry(3, 3.0); const j = new T.Mesh(gj, dunia.bahanJatuh);
      j.rotation.y = rot; j.position.set(xx + (xx === 0 ? -0.02 : 0.02), -1.7, z0 + 1.5); g.add(j);
      for (let i = 0; i < 4; i++) { const bu = new T.Mesh(tpl().bola, mat('#ffffff')); bu.scale.setScalar(0.25 + i * 0.05); bu.position.set(xx + (xx === 0 ? -0.3 : 0.3), -3.1, z0 + 0.5 + i * 0.7); g.add(bu); }
    }
    for (const a of anim) {
      if (a.air) { const [mx, mz, rx, rz] = a.air; const k = new T.Mesh(new T.CircleGeometry(1, 24).rotateX(-Math.PI / 2), dunia.bahanAir); k.scale.set(rx + 0.2, 1, rz + 0.2); k.position.set(mx, 0.04, mz); g.add(k); continue; }
      g.add(a.obj);
    }
    return { kumpulan: g, anim: anim.filter((a) => a.kemas), buku: anim.filter((a) => a.nod !== undefined) };
  }

  /* ---------- Kesan tilt-shift + gred warna ---------- */
  const ShaderKabur = (arah) => ({
    uniforms: { tDiffuse: { value: null }, uArah: { value: arah }, uFokus: { value: 0.5 }, uLebar: { value: 0.18 }, uKuat: { value: 1.6 }, uRes: { value: new T.Vector2(1, 1) } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
    fragmentShader: `
      uniform sampler2D tDiffuse; uniform vec2 uArah; uniform float uFokus, uLebar, uKuat; uniform vec2 uRes; varying vec2 vUv;
      void main(){
        float d = abs(vUv.y - uFokus); float a = smoothstep(uLebar, uLebar + 0.32, d) * uKuat;
        vec2 st = uArah / uRes * a;
        vec4 c = texture2D(tDiffuse, vUv) * 0.227;
        c += texture2D(tDiffuse, vUv + st*1.38) * 0.316; c += texture2D(tDiffuse, vUv - st*1.38) * 0.316;
        c += texture2D(tDiffuse, vUv + st*3.23) * 0.07; c += texture2D(tDiffuse, vUv - st*3.23) * 0.07;
        gl_FragColor = c;
      }`,
  });
  const ShaderGred = {
    uniforms: { tDiffuse: { value: null } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
    fragmentShader: `
      uniform sampler2D tDiffuse; varying vec2 vUv;
      void main(){
        vec4 c = texture2D(tDiffuse, vUv);
        float l = dot(c.rgb, vec3(0.299,0.587,0.114));
        c.rgb = mix(vec3(l), c.rgb, 1.04);
        c.rgb *= vec3(1.03, 1.0, 0.96);
        float v = smoothstep(0.95, 0.35, length(vUv - 0.5));
        c.rgb *= mix(0.9, 1.0, v);
        gl_FragColor = c;
      }`,
  };

  /* ---------- Dunia ---------- */
  class Dunia {
    constructor(kanvas) {
      this.kanvas = kanvas;
      const r = (this.renderer = new T.WebGLRenderer({ canvas: kanvas, antialias: true, powerPreference: 'high-performance' }));
      r.outputEncoding = T.sRGBEncoding;
      r.toneMapping = T.NoToneMapping;
      r.shadowMap.enabled = true; r.shadowMap.type = T.PCFSoftShadowMap;
      const sc = (this.scene = new T.Scene());
      const langit = new T.Color('#cfeaf1');
      sc.fog = new T.Fog(langit, 45, 95);
      // kubah langit ditone-map sama seperti kabus supaya ufuk sebati
      const kubah = new T.Mesh(new T.SphereGeometry(250, 16, 8), new T.MeshBasicMaterial({ color: langit, side: T.BackSide, fog: false }));
      sc.add(kubah); this.kubah = kubah;
      this.kamera = new T.PerspectiveCamera(30, 1, 0.5, 300);
      this.hemi = new T.HemisphereLight(0xdff3ff, 0x8a6a4a, 0.62); sc.add(this.hemi);
      const m = (this.matahari = new T.DirectionalLight(0xfff0d6, 1.05));
      m.castShadow = true; m.shadow.mapSize.set(2048, 2048);
      const c = m.shadow.camera; c.left = -26; c.right = 26; c.top = 26; c.bottom = -26; c.near = 1; c.far = 90;
      m.shadow.bias = -0.0006; m.shadow.normalBias = 0.02;
      sc.add(m); sc.add(m.target);
      sc.add(new T.AmbientLight(0xffffff, 0.12));
      // lautan awan di bawah diorama
      const awan = new T.Mesh(new T.PlaneGeometry(800, 800).rotateX(-Math.PI / 2), new T.MeshBasicMaterial({ color: '#cfeaf1' }));
      awan.position.y = -3.6; sc.add(awan); this.dasar = awan;
      this.bahanStatik = new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.85, metalness: 0, flatShading: true });
      this.bahanAir = bahanAir(false); this.bahanJatuh = bahanAir(true);
      this.baris = new Map();
      this.masa = 0;
      this.yaw = Math.PI * 0.25; this.yawSasar = this.yaw; this.jarak = 31; this.jarakSasar = 31; this.pitch = 0.9;
      this.fokus = new T.Vector3(); this.fokusSasar = new T.Vector3();
      this.kualiti('tinggi');
      this.lapisanKunci = new T.Group(); sc.add(this.lapisanKunci);
    }
    kualiti(q) {
      this.q = q;
      const r = this.renderer;
      const dpr = window.devicePixelRatio || 1;
      r.setPixelRatio(q === 'rendah' ? 1 : Math.min(dpr, q === 'tinggi' ? 2 : 1.5));
      r.shadowMap.enabled = q !== 'rendah';
      this.matahari.castShadow = q !== 'rendah';
      if (this.matahari.shadow.map) { this.matahari.shadow.map.dispose(); this.matahari.shadow.map = null; }
      this.matahari.shadow.mapSize.set(q === 'tinggi' ? 2048 : 1024, q === 'tinggi' ? 2048 : 1024);
      this.scene.traverse((o) => { if (o.material) { const ms = Array.isArray(o.material) ? o.material : [o.material]; ms.forEach((m) => (m.needsUpdate = true)); } });
      this.bahanStatik.needsUpdate = true;
      this.pasca = q !== 'rendah' && T.EffectComposer;
      if (this.pasca && !this.komposer) {
        const k = (this.komposer = new T.EffectComposer(r));
        k.addPass(new T.RenderPass(this.scene, this.kamera));
        this.kaburH = new T.ShaderPass(ShaderKabur(new T.Vector2(1, 0)));
        this.kaburV = new T.ShaderPass(ShaderKabur(new T.Vector2(0, 1)));
        k.addPass(this.kaburH); k.addPass(this.kaburV);
        k.addPass(new T.ShaderPass(ShaderGred));
      }
      this.saizSemula();
    }
    saizSemula() {
      const w = this.kanvas.clientWidth || window.innerWidth, h = this.kanvas.clientHeight || window.innerHeight;
      this.renderer.setSize(w, h, false);
      this.kamera.aspect = w / h;
      this.kamera.fov = w / h < 0.8 ? 38 : 30;
      this.kamera.updateProjectionMatrix();
      if (this.komposer) {
        this.komposer.setPixelRatio ? this.komposer.setPixelRatio(this.renderer.getPixelRatio()) : null;
        this.komposer.setSize(w, h);
        const pr = this.renderer.getPixelRatio();
        for (const p of [this.kaburH, this.kaburV]) p.uniforms.uRes.value.set(w * pr, h * pr);
      }
    }
    muat(buku) {
      for (const [, b] of this.baris) this.buang(b);
      this.baris.clear();
      this.buku = buku;
      this.seed = EB.hash(buku.id);
      this.peta = EB.susunPeta(buku);
      this.grid = new Grid(W, this.peta.H);
      this.itemBaris = this.peta.baris.map((_, r) => susunBaris(this.peta, this.grid, r, this.seed));
      this.mula = { x: 3.5, z: 10.5 };
    }
    buang(b) {
      this.scene.remove(b.kumpulan);
      b.kumpulan.traverse((o) => { if (o.geometry && !Object.values(TPL).includes(o.geometry)) o.geometry.dispose(); });
    }
    pastikanBaris(rPemain, rMaks) {
      const lo = Math.max(0, rPemain - 1), hi = Math.min(this.peta.baris.length - 1, Math.min(rMaks + 1, rPemain + 1));
      for (const [r, b] of this.baris) if (r < lo - 1 || r > hi + 1) { this.buang(b); this.baris.delete(r); }
      for (let r = lo; r <= hi; r++) if (!this.baris.has(r)) {
        const b = binaBaris(this, r); this.baris.set(r, b); this.scene.add(b.kumpulan);
        if (this.selepasBina) this.selepasBina(r, b);
        return true; // satu baris setiap bingkai supaya tidak tersentak
      }
      return false;
    }
    // kedudukan dunia → koordinat kemajuan
    pKemajuan(x, z) {
      const r = Math.floor(z / D);
      if (r < 0) return -1;
      const dir = r % 2 === 0 ? 1 : -1;
      return r * 1000 + (dir > 0 ? x : W - x);
    }
    boleh(x, z, had) {
      const s = this.grid.dapat(x, z);
      if (!(s === RUMPUT || s === JALAN || s === LANTAI || s === JAMBATAN)) return false;
      if (had !== undefined && this.pKemajuan(x, z) > had) return false;
      if (this.halangan && this.halangan.has((x | 0) + ',' + (z | 0))) return false;
      return true;
    }
    pusingKamera(d) { this.yawSasar += d; }
    zum(f) { this.jarakSasar = Math.max(11, Math.min(46, this.jarakSasar * f)); }
    kemaskini(dt, sasaran, laju) {
      this.masa += dt;
      this.bahanAir.uniforms.uMasa.value = this.masa; this.bahanJatuh.uniforms.uMasa.value = this.masa;
      for (const [, b] of this.baris) for (const a of b.anim) a.kemas(this.masa, dt);
      // kamera: ikut dengan lag + pandang ke hadapan arah gerakan
      this.fokusSasar.set(sasaran.x + (laju ? laju.x * 0.35 : 0), 0, sasaran.z + (laju ? laju.z * 0.35 : 0));
      const k = 1 - Math.pow(0.002, dt);
      this.fokus.lerp(this.fokusSasar, k);
      this.yaw += (this.yawSasar - this.yaw) * (1 - Math.pow(0.001, dt));
      this.jarak += (this.jarakSasar - this.jarak) * (1 - Math.pow(0.001, dt));
      const cp = Math.cos(this.pitch), spt = Math.sin(this.pitch);
      this.kamera.position.set(this.fokus.x + Math.sin(this.yaw) * cp * this.jarak, this.fokus.y + spt * this.jarak, this.fokus.z + Math.cos(this.yaw) * cp * this.jarak);
      this.kamera.lookAt(this.fokus.x, 0.6, this.fokus.z);
      const mh = this.matahari;
      mh.position.set(this.fokus.x - 14, 28, this.fokus.z + 10); mh.target.position.set(this.fokus.x, 0, this.fokus.z);
      this.dasar.position.x = this.fokus.x; this.dasar.position.z = this.fokus.z; this.kubah.position.copy(this.fokus);
      this.scene.fog.near = this.jarak * 1.3; this.scene.fog.far = this.jarak * 3.4;
      if (this.pasca) { const f = Math.max(0.1, Math.min(0.24, 0.32 - this.jarak / 140)); this.kaburH.uniforms.uLebar.value = f; this.kaburV.uniforms.uLebar.value = f; this.komposer.render(dt); }
      else this.renderer.render(this.scene, this.kamera);
    }
    // vektor hadapan/kanan kamera di satah tanah
    paksi() {
      const f = { x: -Math.sin(this.yaw), z: -Math.cos(this.yaw) };
      return { f, k: { x: -f.z, z: f.x } };
    }
  }
  EB.Dunia = Dunia;
  EB.tpl = tpl;
})();
