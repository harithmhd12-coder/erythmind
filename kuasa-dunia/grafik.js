/* Kuasa Dunia · grafik 3D.
   Diorama pangkalan tentera miniatur bergaya mainan atas three.js r128: kamera ortografik isometrik 40°,
   tapak konkrit bagi setiap bangunan, AO "baked" dalam warna bucu: model low-poly bersudut bulat dicantum menjadi satu mesh
   bagi setiap bangunan atau tentera, cahaya matahari hangat, bayang lembut, dan bayang sentuh sebagai AO.
   Modul ini hanya membaca keadaan permainan (S, BT, mode, pilihan) dan tidak mengubahnya. */
'use strict';
const G3 = (() => {
  const T = THREE;
  // kamera ortografik: VH0 = tinggi pandangan (unit dunia) pada zoom 1; JARAK = jarak kamera dari sasaran
  const EL = 40 * Math.PI / 180, AZ = Math.PI / 4, VH0 = 40, JARAK = 90;
  let R, adegan, kamera, mentari, W = 1, H = 1;
  const ray = new T.Raycaster(), v2 = new T.Vector2(), v3 = new T.Vector3(), lantai = new T.Plane(new T.Vector3(0, 1, 0), 0);

  /* ---------- warna & bahan ---------- */
  const hexKe = h => { const n = parseInt(h.slice(1), 16); return [n >> 16, n >> 8 & 255, n & 255]; };
  const keHex = (r, g, b) => '#' + ((1 << 24) | (clampB(r) << 16) | (clampB(g) << 8) | clampB(b)).toString(16).slice(1);
  const clampB = v => Math.max(0, Math.min(255, Math.round(v)));
  const gelap = (h, f) => { const [r, g, b] = hexKe(h); return f < 0 ? keHex(r * (1 + f), g * (1 + f), b * (1 + f)) : keHex(r + (255 - r) * f, g + (255 - g) * f, b + (255 - b) * f); };
  const MAT = new T.MeshStandardMaterial({ vertexColors: true, roughness: .8, metalness: 0 });
  const MAT_HANTU = new T.MeshStandardMaterial({ vertexColors: true, roughness: .8, transparent: true, opacity: .72, depthWrite: false });

  /* ---------- geometri asas (disimpan) ---------- */
  const simpanG = new Map();
  const ingat = (k, f) => { let g = simpanG.get(k); if (!g) { g = f(); simpanG.set(k, g); } return g; };
  const f3 = n => (+n).toFixed(3);
  function haluskan(g, darjah) {
    g = g.index ? g.toNonIndexed() : g;
    g.computeVertexNormals();
    const p = g.attributes.position.array, n = g.attributes.normal.array, kira = p.length / 3, peta = new Map(), had = Math.cos(darjah * Math.PI / 180);
    for (let i = 0; i < kira; i++) { const k = Math.round(p[i * 3] * 1e4) + ',' + Math.round(p[i * 3 + 1] * 1e4) + ',' + Math.round(p[i * 3 + 2] * 1e4); let a = peta.get(k); if (!a) peta.set(k, a = []); a.push(i); }
    const out = new Float32Array(n.length);
    for (const a of peta.values()) for (const i of a) {
      let x = 0, y = 0, z = 0;
      for (const j of a) if (n[i * 3] * n[j * 3] + n[i * 3 + 1] * n[j * 3 + 1] + n[i * 3 + 2] * n[j * 3 + 2] >= had) { x += n[j * 3]; y += n[j * 3 + 1]; z += n[j * 3 + 2]; }
      const l = Math.hypot(x, y, z) || 1; out[i * 3] = x / l; out[i * 3 + 1] = y / l; out[i * 3 + 2] = z / l;
    }
    g.setAttribute('normal', new T.BufferAttribute(out, 3));
    return g;
  }
  function kotakG(w, h, d, r) {
    r = Math.max(0, Math.min(r, w / 2 - .004, d / 2 - .004, h / 2 - .004));
    return ingat(`k${f3(w)},${f3(h)},${f3(d)},${f3(r)}`, () => {
      if (r < .006) { const g = new T.BoxGeometry(w, h, d); g.translate(0, h / 2, 0); return g; }
      const b = r * .6, rc = Math.max(.002, r * .5), sw = w - 2 * b, sd = d - 2 * b, x = -sw / 2, y = -sd / 2;
      const s = new T.Shape();
      s.moveTo(x + rc, y); s.lineTo(x + sw - rc, y); s.quadraticCurveTo(x + sw, y, x + sw, y + rc); s.lineTo(x + sw, y + sd - rc);
      s.quadraticCurveTo(x + sw, y + sd, x + sw - rc, y + sd); s.lineTo(x + rc, y + sd); s.quadraticCurveTo(x, y + sd, x, y + sd - rc);
      s.lineTo(x, y + rc); s.quadraticCurveTo(x, y, x + rc, y);
      const g = new T.ExtrudeGeometry(s, { depth: Math.max(.001, h - 2 * b), bevelEnabled: true, bevelThickness: b, bevelSize: b, bevelSegments: 2, curveSegments: 2 });
      g.rotateX(-Math.PI / 2); g.translate(0, b, 0);
      return haluskan(g, 50);
    });
  }
  function pelanaG(w, d, h) { // bumbung pelana, rabung sepanjang X
    return ingat(`p${f3(w)},${f3(d)},${f3(h)}`, () => {
      const s = new T.Shape(); s.moveTo(-d / 2, 0); s.lineTo(d / 2, 0); s.lineTo(0, h); s.lineTo(-d / 2, 0);
      const b = .045, g = new T.ExtrudeGeometry(s, { depth: Math.max(.01, w - 2 * b), bevelEnabled: true, bevelThickness: b, bevelSize: b, bevelSegments: 2, curveSegments: 1 });
      g.translate(0, b, -(w - 2 * b) / 2); g.rotateY(Math.PI / 2);
      return haluskan(g, 40);
    });
  }
  const piramidG = () => ingat('piramid', () => { const g = new T.ConeGeometry(Math.SQRT1_2, 1, 4, 1); g.rotateY(Math.PI / 4); g.translate(0, .5, 0); return haluskan(g, 30); });
  const silG = (rt, rb, h, seg) => ingat(`s${f3(rt)},${f3(rb)},${f3(h)},${seg}`, () => { const g = new T.CylinderGeometry(rt, rb, h, seg, 1); g.translate(0, h / 2, 0); return g; });
  const konG = (r, h, seg) => ingat(`c${f3(r)},${f3(h)},${seg}`, () => { const g = new T.ConeGeometry(r, h, seg, 1); g.translate(0, h / 2, 0); return g; });
  const bolaG = (r, d) => ingat(`b${f3(r)},${d}`, () => new T.IcosahedronGeometry(r, d));
  const torusG = (r, t, arka) => ingat(`t${f3(r)},${f3(t)},${f3(arka)}`, () => new T.TorusGeometry(r, t, 6, 14, arka));

  /* ---------- pembina model: semua bahagian dicantum menjadi satu geometri berwarna ---------- */
  class Bina {
    constructor() { this.p = []; }
    t(g, w, x = 0, y = 0, z = 0, o = {}) {
      const m = new T.Matrix4().compose(new T.Vector3(x, y, z), new T.Quaternion().setFromEuler(new T.Euler(o.rx || 0, o.ry || 0, o.rz || 0, 'YXZ')), new T.Vector3(o.sx ?? 1, o.sy ?? 1, o.sz ?? 1));
      this.p.push({ g, w, m, rata: o.rata }); return this;
    }
    kotak(w, h, d, warna, x, y, z, o = {}) { return this.t(kotakG(w, h, d, o.r ?? Math.min(w, h, d) * .22), warna, x, y, z, o); }
    sil(rt, rb, h, warna, x, y, z, o = {}) { return this.t(silG(rt, rb, h, o.seg || 8), warna, x, y, z, o); }
    kon(r, h, warna, x, y, z, o = {}) { return this.t(konG(r, h, o.seg || 8), warna, x, y, z, o); }
    bola(r, warna, x, y, z, o = {}) { return this.t(bolaG(r, o.d ?? 1), warna, x, y, z, o); }
    pelana(w, d, h, warna, x, y, z, o = {}) { return this.t(pelanaG(w, d, h), warna, x, y, z, o); }
    piramid(w, d, h, warna, x, y, z, o = {}) { return this.t(piramidG(), warna, x, y, z, { ...o, sx: w, sy: h, sz: d }); }
    tiang(w, d, y0, h, warna, r = .06, x = 0, z = 0) { for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) this.sil(r, r * 1.1, h, warna, x + a * w / 2, y0, z + b * d / 2, { seg: 6 }); return this; }
    geo() { return gabung(this.p); }
  }
  function gabung(bah) {
    let n = 0; const sen = [];
    for (const b of bah) {
      let g = b.g.index ? b.g.toNonIndexed() : b.g.clone();
      if (!g.attributes.normal) g.computeVertexNormals();
      g.applyMatrix4(b.m);
      if (b.rata) g.computeVertexNormals();
      sen.push([g, new T.Color(b.w).convertSRGBToLinear()]); n += g.attributes.position.count;
    }
    const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), wr = new Float32Array(n * 3); let o = 0;
    for (const [g, c] of sen) {
      const k = g.attributes.position.count, ps = g.attributes.position.array, ns = g.attributes.normal.array;
      pos.set(ps, o * 3); nor.set(ns, o * 3);
      for (let i = 0; i < k; i++) {
        // AO "baked": bucu dekat tanah dan permukaan menghadap bawah lebih gelap, permukaan atas sedikit cerah
        const y = ps[i * 3 + 1], ny = ns[i * 3 + 1], h = Math.min(1, Math.max(0, y / .55));
        const f = (.74 + .26 * h * h * (3 - 2 * h)) * (ny < -.3 ? .8 : ny > .6 ? 1.06 : 1);
        wr[(o + i) * 3] = c.r * f; wr[(o + i) * 3 + 1] = c.g * f; wr[(o + i) * 3 + 2] = c.b * f;
      }
      o += k; g.dispose();
    }
    const out = new T.BufferGeometry();
    out.setAttribute('position', new T.BufferAttribute(pos, 3)); out.setAttribute('normal', new T.BufferAttribute(nor, 3)); out.setAttribute('color', new T.BufferAttribute(wr, 3));
    out.computeBoundingBox(); out.computeBoundingSphere();
    return out;
  }

  /* ---------- palet ---------- */
  const K = {
    kayu: '#b97a44', kayuG: '#6e4425', tiang: '#5a636b', merah: '#c8452f', dana: '#ffc83a', emasG: '#d69b1c', putih: '#f4f3ee',
    konkrit: '#cfcbc1', konkritG: '#a19d94', olive: '#6b7a3a', oliveG: '#4d5a2a', oliveC: '#8a9a52', khaki: '#c9b07a', besi: '#8a939d', besiG: '#5a636b',
    kaca: '#5fb8e0', bumbung: '#e0843a', gelapK: '#2c3e50', hitam: '#25272b', kulit: '#e2a67a', nadir: '#7fd6c2', minyak: '#33363d', kuning: '#f4c20d', oren: '#ff8a1a',
  };

  /* ---------- model bangunan ---------- */
  function modelBangunan(t, lv) {
    return ingat(`B${t}:${lv}`, () => {
      const m = new Bina();
      switch (t) {
        case 'markas': {
          const dinding = lv >= 6 ? '#f1f0ea' : lv >= 4 ? '#dcd8cc' : '#cdbb8e', atap = lv >= 4 ? '#5f6b78' : K.oliveG, trim = lv >= 6 ? K.dana : K.oliveG;
          m.kotak(3.6, .28, 3.6, K.konkrit, 0, 0, 0, { r: .1 });
          m.kotak(1.1, .14, .5, K.konkritG, 0, 0, 1.95, { r: .04 });
          m.kotak(2.8, 1.05, 2.2, dinding, 0, .28, -.2, { r: .1 });
          for (const px of [-.95, .95]) m.kotak(.55, .26, .06, K.gelapK, px, .76, .9, { r: .03 });
          m.kotak(.56, .62, .07, '#3a3f46', 0, .28, .91, { r: .03 });
          m.kotak(1.3, .07, .45, trim, 0, .92, 1.1, { r: .03 });
          for (const sx of [-1, 1]) m.sil(.035, .035, .64, K.besiG, sx * .55, .28, 1.28, { seg: 6 });
          m.kotak(2.95, .14, 2.35, atap, 0, 1.33, -.2, { r: .05 });
          if (lv >= 2) {
            m.kotak(1.7, .7, 1.4, gelap(dinding, -.05), -.35, 1.47, -.45, { r: .08 });
            for (const px of [-.8, .1]) m.kotak(.4, .2, .06, K.gelapK, px, 1.78, .27, { r: .03 });
            m.kotak(1.85, .12, 1.55, lv >= 4 ? atap : K.bumbung, -.35, 2.17, -.45, { r: .04 });
          }
          if (lv >= 3) { m.sil(.03, .03, 1.3, K.besi, .3, 2.29, -.85, { seg: 5 }); m.sil(.02, .02, .8, K.besi, .5, 2.29, -.6, { seg: 5 }); m.bola(.05, '#ff4a3a', .3, 3.6, -.85); }
          if (lv >= 4) { m.sil(.38, .42, .1, K.besiG, 1.05, 1.47, .55, { seg: 12 }); m.bola(.3, '#f2f2ee', 1.05, 1.62, .55, { sy: .85 }); }
          if (lv >= 5) { m.kotak(.9, .55, .9, gelap(dinding, -.1), -.35, 2.29, -.45, { r: .06 }); m.kotak(1.0, .08, 1.0, atap, -.35, 2.84, -.45, { r: .03 }); }
          if (lv >= 6) for (const [px, pz] of [[-1.62, 1.62], [1.62, 1.62]]) { m.sil(.1, .12, .5, K.konkrit, px, .28, pz); m.bola(.11, K.dana, px, .86, pz); }
          if (lv >= 7) { m.sil(.03, .03, .9, K.dana, -.35, 2.92, -.45, { seg: 5 }); m.bola(.07, K.dana, -.35, 3.85, -.45); }
          m.sil(.035, .035, 3.2, K.besi, -1.6, .28, -1.6, { seg: 6 });
          break;
        }
        case 'zon_industri': {
          m.kotak(2.8, .12, 2.8, K.konkrit, 0, 0, 0, { r: .08 });
          m.kotak(2.0, .85, 1.4, '#d9ccad', -.25, .12, -.5, { r: .06 });
          for (let i = 0; i < 3; i++) m.pelana(1.42, .66, .3, i % 2 ? K.bumbung : gelap(K.bumbung, -.1), -.25 - .66 + i * .66, .97, -.5, { ry: Math.PI / 2 });
          m.kotak(.5, .5, .06, K.besiG, -.25, .12, .21, { r: .03 });
          for (const px of [-.85, .35]) m.kotak(.32, .2, .05, K.kaca, px, .55, .21, { r: .03 });
          m.sil(.15, .19, 1.7, '#a0522d', .95, .12, -.95, { seg: 10 }); m.sil(.165, .165, .12, '#efefef', .95, 1.55, -.95, { seg: 10 });
          if (lv >= 3) { m.kotak(.8, .55, .7, '#cbbd9c', -.85, .12, .75, { r: .05 }); m.kotak(.86, .08, .76, K.besiG, -.85, .67, .75, { r: .03 }); }
          if (lv >= 5) { m.sil(.12, .15, 1.3, '#a0522d', .55, .12, -.95, { seg: 10 }); for (let i = 0; i < 3; i++) m.kotak(.38, .04, .24, '#2f4f7f', -.85 + i * .4, 1.12, -.75, { rx: -.35, r: .01 }); }
          break;
        }
        case 'telaga_minyak': {
          m.kotak(2.8, .12, 2.8, '#b8a27a', 0, 0, 0, { r: .08 });
          m.kotak(1.8, .08, .55, K.minyak, -.3, .12, .1, { r: .03 });
          for (const sz of [-1, 1]) { m.sil(.045, .055, 1.1, K.kuning, -.3, .2, .1 + sz * .17, { rx: sz * .14, seg: 6 }); }
          m.kotak(.35, .3, .4, K.besiG, -1.05, .2, .1, { r: .05 });
          m.sil(.05, .05, .5, K.besiG, .55, .2, .1, { seg: 6 });
          m.sil(.5, .5, .9, '#eceae3', .85, .12, -.8, { seg: 14 }); m.sil(.51, .51, .07, '#c0392b', .85, .7, -.8, { seg: 14 });
          m.sil(.035, .035, 1.1, K.besi, .3, .3, -.8, { rz: Math.PI / 2, seg: 6 });
          if (lv >= 3) { m.sil(.4, .4, .75, '#eceae3', -.75, .12, -.85, { seg: 14 }); m.sil(.41, .41, .06, '#c0392b', -.75, .6, -.85, { seg: 14 }); }
          if (lv >= 5) { m.sil(.03, .03, 1.4, K.besi, 1.15, .12, .9, { seg: 5 }); m.kon(.06, .18, '#ff9a2a', 1.15, 1.52, .9, { seg: 6 }); }
          break;
        }
        case 'lombong_nadir': {
          m.kotak(2.75, .12, 2.75, '#a89a85', 0, 0, 0, { r: .1 });
          m.sil(.95, .7, .1, '#6e6254', .35, .08, .35, { seg: 10 });
          for (let i = 0; i < 6; i++) { const a = i / 6 * 6.28; m.kon(.08, .3 + (i % 3) * .08, K.nadir, .35 + Math.cos(a) * .4, .12, .35 + Math.sin(a) * .4, { rx: Math.sin(a) * .25, rz: -Math.cos(a) * .25, seg: 5 }); }
          for (const [x, h] of [[-1.05, 1.1], [.9, .45]]) m.sil(.05, .06, h, K.besiG, x, .1, -.6, { seg: 6 });
          m.kotak(2.2, .07, .3, K.minyak, -.08, .82, -.6, { rz: -.33, r: .02 });
          m.kotak(.6, .5, .55, K.kuning, -1.0, .1, .9, { r: .06 }); m.kotak(.64, .06, .6, K.besiG, -1.0, .6, .9, { r: .02 });
          break;
        }
        case 'bank': {
          m.kotak(2.6, .22, 2.6, K.konkrit, 0, 0, 0, { r: .08 });
          m.kotak(2.2, .14, 2.2, '#e6e1d3', 0, .22, 0, { r: .05 });
          m.kotak(1.9, 1.0, 1.5, '#f1ece0', 0, .36, -.2, { r: .05 });
          for (let i = -2; i <= 2; i++) m.sil(.07, .08, .95, '#ffffff', i * .4, .36, .78, { seg: 8 });
          m.kotak(2.0, .14, .5, '#e6e1d3', 0, 1.31, .75, { r: .03 });
          m.pelana(2.0, .5, .28, '#e6e1d3', 0, 1.45, .75);
          m.kotak(2.0, .12, 1.6, '#d8d2c2', 0, 1.36, -.2, { r: .04 });
          m.sil(.42, .46, .2, '#d8d2c2', 0, 1.48, -.25, { seg: 12 }); m.bola(.42, K.dana, 0, 1.68, -.25, { sy: .7 });
          break;
        }
        case 'depot_minyak': {
          m.kotak(2.8, .12, 2.8, K.konkrit, 0, 0, 0, { r: .08 });
          for (const [x, z, w, d] of [[0, -1.3, 2.6, .1], [0, 1.3, 2.6, .1], [-1.3, 0, .1, 2.6], [1.3, 0, .1, 2.6]]) m.kotak(w, .22, d, K.konkritG, x, .12, z, { r: .03 });
          m.sil(.62, .62, 1.0, '#eceae3', -.5, .12, -.4, { seg: 16 }); m.sil(.6, .64, .08, '#d0cdc4', -.5, 1.12, -.4, { seg: 16 }); m.sil(.63, .63, .07, K.minyak, -.5, .7, -.4, { seg: 16 });
          m.sil(.48, .48, .8, '#eceae3', .62, .12, -.45, { seg: 16 }); m.sil(.47, .5, .07, '#d0cdc4', .62, .92, -.45, { seg: 16 });
          m.sil(.035, .035, 1.2, K.besi, .05, .3, .3, { rz: Math.PI / 2, seg: 6 });
          if (lv >= 4) { m.sil(.4, .4, .7, '#eceae3', -.6, .12, .75, { seg: 14 }); m.sil(.41, .41, .06, K.minyak, -.6, .45, .75, { seg: 14 }); }
          break;
        }
        case 'gudang_nadir': {
          m.kotak(2.6, .12, 2.6, K.konkrit, 0, 0, 0, { r: .08 });
          m.kotak(2.3, 1.0, 2.2, '#9eabb8', 0, .12, -.05, { r: .28 });
          m.kotak(.9, .7, .1, '#4b5560', 0, .12, 1.03, { r: .04 }); m.kotak(.92, .08, .12, K.kuning, 0, .82, 1.03, { r: .02 });
          m.kotak(2.4, .12, 2.3, '#6e7a86', 0, 1.1, -.05, { r: .06 });
          break;
        }
        case 'pusat_risikan': {
          m.kotak(1.9, .12, 1.9, K.konkrit, 0, 0, 0, { r: .06 });
          m.kotak(1.3, .75, 1.05, '#3d4a5c', -.2, .12, .2, { r: .07 });
          m.kotak(1.34, .08, 1.09, '#2a3340', -.2, .87, .2, { r: .03 });
          m.kotak(.85, .14, .05, '#7fd0ff', -.2, .55, .73, { r: .02 });
          m.sil(.035, .045, .4, K.besi, .5, .12, -.5, { seg: 6 });
          m.kon(.36, .16, '#eef2f5', .5, .62, -.5, { rx: Math.PI * .78, seg: 14 });
          m.sil(.015, .015, 1.1, K.besi, -.6, .95, .45, { seg: 4 }); m.bola(.04, '#ff4a3a', -.6, 2.05, .45);
          if (lv >= 3) m.sil(.012, .012, .7, K.besi, .1, .95, .45, { seg: 4 });
          break;
        }
        case 'pejabat_jurutera': {
          m.kotak(1.8, .1, 1.8, K.konkrit, 0, 0, 0, { r: .05 });
          m.kotak(1.4, .6, .9, K.kuning, 0, .1, -.25, { r: .06 }); m.kotak(1.44, .06, .94, K.bumbung, 0, .7, -.25, { r: .02 });
          m.kotak(.42, .2, .05, K.gelapK, -.3, .4, .21, { r: .02 }); m.kotak(.26, .45, .05, '#5a4632', .38, .1, .21, { r: .02 });
          for (const [x, z] of [[.6, .6], [-.6, .65]]) { m.kon(.07, .2, K.oren, x, .1, z, { seg: 8 }); m.sil(.05, .06, .04, '#ffffff', x, .17, z, { seg: 8 }); }
          m.kotak(.8, .06, .12, K.besi, -.1, .1, .62, { r: .01 }); m.kotak(.8, .06, .12, K.besi, -.1, .16, .64, { r: .01, ry: .1 });
          break;
        }
        case 'berek': {
          m.kotak(2.7, .16, 2.0, K.konkrit, 0, 0, 0, { r: .07 });
          m.kotak(2.4, .75, 1.4, '#7b8a4a', 0, .16, 0, { r: .07 });
          for (const px of [-.85, -.4, .4, .85]) m.kotak(.26, .2, .05, K.gelapK, px, .55, .71, { r: .02 });
          m.kotak(.4, .5, .06, '#3a3f46', 0, .16, .72, { r: .03 });
          m.pelana(2.6, 1.65, .55, K.bumbung, 0, .91, 0);
          for (const sx of [-1, 1]) for (let i = 0; i < 2; i++) m.bola(.12, K.khaki, sx * .42, .22 + i * .1, .92, { sx: 1.3, sy: .45, d: 1 });
          if (lv >= 4) for (const sx of [-1, 1]) m.kotak(.12, .12, .05, K.dana, sx * .7, .78, .72, { r: .02 });
          m.sil(.03, .03, 2.4, K.besi, 1.2, .16, -.85, { seg: 6 });
          break;
        }
        case 'kem': {
          m.sil(1.45, 1.5, .08, '#b9a57a', 0, 0, 0, { seg: 16 });
          const k = Math.min(4, 1 + Math.floor(lv / 2)), sudut = [[-.85, -.85], [.85, -.85], [-.85, .85], [.85, .85]];
          for (let i = 0; i < k; i++) { const [x, z] = sudut[i]; m.kotak(.7, .32, .62, i % 2 ? K.oliveC : K.olive, x, .06, z, { r: .05 }); m.pelana(.74, .66, .3, i % 2 ? K.olive : K.oliveG, x, .38, z); }
          for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2; m.bola(.1, K.khaki, Math.cos(a) * .3, .1, Math.sin(a) * .3, { sx: 1.3, sy: .5, d: 0, rata: true }); }
          break;
        }
        case 'makmal': {
          m.kotak(2.7, .14, 2.2, K.konkrit, 0, 0, 0, { r: .07 });
          m.kotak(2.2, .8, 1.6, '#eef0f2', 0, .14, 0, { r: .08 });
          m.kotak(2.22, .2, 1.62, K.kaca, 0, .55, 0, { r: .04 });
          m.kotak(2.3, .1, 1.7, K.besi, 0, .94, 0, { r: .03 });
          m.bola(.55, '#f6f6f4', .45, 1.0, -.1, { sy: .85 }); m.kotak(.14, .45, .5, K.gelapK, .45, 1.15, .2, { rx: -.5, r: .03 });
          m.sil(.04, .04, .7, K.besi, -.75, 1.04, -.4, { seg: 5 }); m.bola(.05, '#ff4a3a', -.75, 1.76, -.4);
          break;
        }
        case 'pusat_pakatan': {
          m.kotak(2.6, .26, 2.6, K.konkrit, 0, 0, 0, { r: .09 });
          m.kotak(1.9, .9, 1.4, '#f1ece0', 0, .26, -.3, { r: .07 });
          m.kotak(1.95, .1, 1.45, '#cfd6dc', 0, 1.16, -.3, { r: .03 });
          m.bola(.5, '#4a86c8', 0, 1.2, -.3, { sy: .7 });
          m.kotak(.5, .55, .06, '#3a3f46', 0, .26, .41, { r: .03 });
          for (const [x, w] of [[-.9, '#c0392b'], [-.45, '#f4c20d'], [.45, '#2f9a3a'], [.9, '#2f6fba']]) { m.sil(.02, .02, 1.0, K.besi, x, .26, 1.0, { seg: 4 }); m.kotak(.04, .18, .28, w, x, 1.04, 1.14, { r: .005 }); }
          break;
        }
        case 'artileri': {
          m.kotak(1.7, .12, 1.7, '#b8a27a', 0, 0, 0, { r: .1 });
          for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; m.bola(.17, K.khaki, Math.cos(a) * .7, .14, Math.sin(a) * .7, { sx: 1.35, sy: .55, sz: .9, ry: -a, d: 1 }); }
          if (lv >= 3) for (let i = 0; i < 10; i++) { const a = (i + .5) / 10 * Math.PI * 2; m.bola(.16, gelap(K.khaki, -.06), Math.cos(a) * .7, .3, Math.sin(a) * .7, { sx: 1.3, sy: .5, sz: .85, ry: -a, d: 1 }); }
          m.sil(.42, .46, .1, K.besiG, 0, .12, 0, { seg: 12 });
          break;
        }
        case 'menara_mesingan': {
          const h = 1.9 + lv * .05;
          m.kotak(1.5, .12, 1.5, K.konkrit, 0, 0, 0, { r: .06 });
          m.tiang(1.0, 1.0, .12, h - .12, K.besiG, .06);
          for (const sz of [-1, 1]) m.kotak(1.0, .04, .04, K.besi, 0, h * .45, sz * .5, { rz: .55, r: .01 });
          for (const sx of [-1, 1]) m.kotak(.04, .04, 1.0, K.besi, sx * .5, h * .45, 0, { rx: .55, r: .01 });
          m.kotak(1.45, .14, 1.45, K.oliveG, 0, h, 0, { r: .05 });
          for (const [x, z, w, d] of [[0, .68, 1.45, .1], [.68, 0, .1, 1.45], [0, -.68, 1.45, .1], [-.68, 0, .1, 1.45]]) m.kotak(w, .3, d, K.khaki, x, h + .14, z, { r: .04 });
          m.tiang(1.25, 1.25, h + .14, .72, K.besiG, .035);
          m.kotak(1.6, .08, 1.6, '#7d8790', 0, h + .86, 0, { r: .02, rx: .06 });
          break;
        }
        case 'pelancar_roket': {
          m.sil(1.2, 1.3, .3, K.konkrit, 0, 0, 0, { seg: 12 });
          for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; m.bola(.18, K.khaki, Math.cos(a) * 1.12, .38, Math.sin(a) * 1.12, { sx: 1.4, sy: .55, sz: .9, ry: -a, d: 1 }); }
          m.sil(.55, .6, .14, K.besiG, 0, .3, 0, { seg: 12 });
          m.kotak(.5, .4, .4, K.olive, -.85, .3, .75, { r: .05 });
          break;
        }
        case 'pertahanan_udara': {
          m.sil(1.25, 1.35, .2, K.konkrit, 0, 0, 0, { seg: 14 });
          m.t(torusG(1.18, .1, Math.PI * 2), K.khaki, 0, .22, 0, { rx: Math.PI / 2 });
          m.kotak(.55, .45, .45, K.olive, -.8, .2, .8, { r: .06 }); m.sil(.02, .02, .7, K.besi, -.8, .65, .8, { seg: 4 });
          m.sil(.45, .5, .12, K.besiG, 0, .2, 0, { seg: 12 });
          break;
        }
        case 'radar': {
          m.kotak(1.6, .12, 1.6, K.konkrit, 0, 0, 0, { r: .06 });
          m.kotak(.8, .5, .8, K.olive, 0, .12, 0, { r: .06 });
          m.kotak(.4, .2, .05, K.gelapK, 0, .32, .41, { r: .02 });
          m.sil(.1, .14, .62, K.besi, 0, .62, 0, { seg: 8 });
          break;
        }
        case 'periuk_api': {
          m.sil(.3, .32, .06, K.oliveG, 0, 0, 0, { seg: 10 });
          m.sil(.11, .12, .06, K.hitam, 0, .06, 0, { seg: 8 });
          for (let i = 0; i < 4; i++) { const a = i / 4 * Math.PI * 2; m.kon(.02, .1, K.besi, Math.cos(a) * .07, .1, Math.sin(a) * .07, { seg: 4 }); }
          break;
        }
        case 'pos_komando': case 'pos_elit': {
          const komander = t === 'pos_komando', kanopi = komander ? K.olive : '#3d4a5c';
          m.kotak(2.5, .2, 2.5, K.konkrit, 0, 0, 0, { r: .1 });
          m.sil(.7, .7, .02, K.kuning, .5, .2, .5, { seg: 16 }); m.sil(.6, .6, .03, K.konkritG, .5, .2, .5, { seg: 16 });
          m.tiang(1.8, 1.8, .2, 1.2, K.besiG, .05);
          m.piramid(2.4, 2.4, .6, kanopi, 0, 1.4, 0);
          for (const [x, z] of [[-.85, .8], [-.55, .85]]) m.kotak(.28, .22, .3, K.oliveG, x, .2, z, { r: .04 });
          m.bola(.1, K.dana, 0, 2.02, 0);
          break;
        }
      }
      return m.geo();
    });
  }
  /* tembok: beg pasir (tahap 1-3), konkrit (4-5), konkrit berjalur (6-7) */
  function modelKota(lv, mask) {
    return ingat(`W${lv}:${mask}`, () => {
      const m = new Bina();
      if (lv < 4) {
        const p = lv >= 2 ? '#cbb27c' : '#bfa36c', n = lv >= 3 ? 3 : 2;
        for (let i = 0; i < n; i++) m.bola(.2, gelap(p, i % 2 ? -.06 : 0), 0, .1 + i * .18, 0, { sx: 1.15, sy: .5, sz: 1.15, d: 1 });
        if (mask & 1) for (let i = 0; i < n; i++) m.bola(.2, gelap(p, i % 2 ? .04 : -.04), .5, .1 + i * .18, 0, { sx: 1.5, sy: .5, sz: .95, d: 1 });
        if (mask & 2) for (let i = 0; i < n; i++) m.bola(.2, gelap(p, i % 2 ? .04 : -.04), 0, .1 + i * .18, .5, { sx: .95, sy: .5, sz: 1.5, d: 1 });
      } else {
        const w = lv >= 6 ? '#e4e2da' : '#c9c5ba';
        m.kotak(.44, .8, .44, gelap(w, .05), 0, 0, 0, { r: .08 });
        if (mask & 1) m.kotak(.78, .62, .3, w, .5, 0, 0, { r: .06 });
        if (mask & 2) m.kotak(.3, .62, .78, w, 0, 0, .5, { r: .06 });
        if (lv >= 6) { m.kotak(.46, .08, .46, K.kuning, 0, .58, 0, { r: .02 }); m.bola(.07, K.dana, 0, .86, 0); }
      }
      return m.geo();
    });
  }
  function modelRuntuh(s) {
    return ingat(`X${s}`, () => {
      const m = new Bina(), r = rng(s * 101 + 7);
      m.sil(s * .45, s * .5, .04, '#5a4634', 0, 0, 0, { seg: 9 });
      for (let i = 0; i < 4 + s * 3; i++) { const a = r() * 6.28, d = r() * s * .35, w = .18 + r() * .25; m.kotak(w, .1 + r() * .2, w * (.6 + r() * .6), r() < .5 ? '#8a7e70' : '#7a5232', Math.cos(a) * d, .02, Math.sin(a) * d, { ry: r() * 3, rz: (r() - .5) * .4, r: .04 }); }
      return m.geo();
    });
  }
  const modelRuntuhKota = () => ingat('XW', () => new Bina().kotak(.32, .14, .3, '#8a7e70', -.05, 0, .02, { ry: .4, r: .04 }).kotak(.22, .1, .22, '#7a6d60', .12, 0, -.08, { r: .03 }).geo());
  const modelPerancah = s => ingat(`P${s}`, () => {
    const m = new Bina(), h = Math.min(2.1, s * .6 + .5), a = s / 2 - .05;
    for (const [x, z] of [[-a, a], [a, a], [a, -a], [0, a], [a, 0]]) m.sil(.025, .025, h, '#e0bd62', x, 0, z, { seg: 5 });
    for (const y of [h * .35, h * .7]) { m.kotak(s - .1, .04, .05, '#c99d4c', 0, y, a, { r: .01 }); m.kotak(.05, .04, s - .1, '#c99d4c', a, y, 0, { r: .01 }); }
    return m.geo();
  });

  /* ---------- bahagian bergerak ---------- */
  const modelLaras = lv => ingat(`L${lv}`, () => {
    const m = new Bina(), g = lv >= 4 ? K.oliveG : K.olive;
    m.kotak(.55, .22, .45, g, 0, 0, 0, { r: .05 });
    for (const sz of [-1, 1]) m.t(torusG(.12, .04, Math.PI * 2), K.hitam, -.05, .12, sz * .25, {});
    m.kotak(.06, .32, .5, gelap(g, -.1), .22, .14, 0, { r: .02 });
    m.sil(.055, .075, 1.0, g, .05, .3, 0, { rz: -Math.PI / 2 + .12, seg: 10 }); m.kotak(.14, .12, .14, K.hitam, 1.0, .37, 0, { r: .03 });
    return m.geo();
  });
  const modelMortar = () => ingat('M', () => {
    const m = new Bina();
    m.kotak(.8, .22, .7, K.oliveG, 0, 0, 0, { r: .06 });
    m.kotak(.75, .42, .62, K.olive, -.05, .18, 0, { rz: .55, r: .06 });
    for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) m.sil(.07, .07, .05, K.hitam, .14 + j * .12, .46 + j * .16 + i * 0, -.2 + i * .2, { rz: -Math.PI / 2 + .55, seg: 8 });
    return m.geo();
  });
  const modelSAM = () => ingat('SAM', () => {
    const m = new Bina();
    m.sil(.32, .38, .22, K.besiG, 0, 0, 0, { seg: 10 });
    m.kotak(.4, .3, .7, K.olive, 0, .22, 0, { r: .05 });
    for (const z of [-.24, .24]) for (const y of [0, .16]) { m.sil(.055, .055, .9, '#f2f2ee', -.2, .42 + y, z, { rz: -Math.PI / 2 + .75, seg: 8 }); }
    return m.geo();
  });
  const modelPiring = () => ingat('piring', () => new Bina().kotak(1.25, .55, .08, '#eef2f5', 0, -.27, 0, { rx: -.35, r: .03 }).kotak(1.1, .04, .1, K.besiG, 0, -.06, .06, { r: .01 }).sil(.04, .04, .3, K.besi, 0, -.3, .1, { seg: 5 }).geo());
  const modelPam = () => ingat('pam', () => new Bina().kotak(1.5, .12, .12, K.kuning, -.1, -.06, 0, { r: .03 }).kotak(.2, .45, .16, K.minyak, .7, -.38, 0, { r: .05 }).kotak(.32, .3, .22, K.besiG, -.75, -.3, 0, { r: .05 }).geo());
  const modelRotor = () => ingat('rotor', () => new Bina().kotak(1.5, .02, .07, K.hitam, 0, 0, 0, { r: .01 }).kotak(.07, .02, 1.5, K.hitam, 0, 0, 0, { r: .01 }).sil(.05, .05, .05, K.besiG, 0, -.02, 0, { seg: 8 }).geo());
  const modelIsi = t => ingat(`I${t}`, () => {
    const m = new Bina(), r = rng(t.length * 13);
    if (t === 'zon_industri') for (let i = 0; i < 9; i++) m.sil(.1, .1, .04, i % 3 ? K.dana : '#ffe58a', (r() - .5) * .8, Math.floor(i / 3) * .045, (r() - .5) * .6, { seg: 10 });
    if (t === 'bank') for (let i = 0; i < 6; i++) m.kotak(.28, .09, .13, K.dana, -.3 + (i % 3) * .3, i < 3 ? 0 : .09, i < 3 ? 0 : .03, { r: .02 });
    if (t === 'depot_minyak' || t === 'telaga_minyak') for (let i = 0; i < 5; i++) { const x = -.3 + (i % 3) * .24, z = i < 3 ? 0 : .22; m.sil(.1, .1, .3, K.minyak, x, 0, z, { seg: 10 }); m.sil(.102, .102, .04, '#c0392b', x, .2, z, { seg: 10 }); }
    if (t === 'gudang_nadir' || t === 'lombong_nadir') for (let i = 0; i < 6; i++) m.kon(.08, .25 + r() * .15, K.nadir, -.36 + (i % 3) * .34, Math.floor(i / 3) * .02, (i < 3 ? 0 : .26), { seg: 5 });
    return m.geo();
  });
  const modelApi = () => ingat('api', () => new Bina().kon(.14, .34, '#ff9a2a', 0, 0, 0, { seg: 6 }).kon(.08, .24, '#ffe066', 0, .04, 0, { seg: 6 }).geo());
  const BENDERA = {};
  function teksturBendera(jenis) {
    if (BENDERA[jenis]) return BENDERA[jenis];
    const c = document.createElement('canvas'); c.width = 112; c.height = 56; const x = c.getContext('2d');
    if (jenis === 'jalur') {
      for (let i = 0; i < 14; i++) { x.fillStyle = i % 2 ? '#ffffff' : '#cc0001'; x.fillRect(0, i * 4, 112, 4); }
      x.fillStyle = '#010066'; x.fillRect(0, 0, 56, 32);
      x.fillStyle = '#ffcc00'; x.beginPath(); x.arc(22, 16, 11, 0, 7); x.fill(); x.fillStyle = '#010066'; x.beginPath(); x.arc(26, 16, 9, 0, 7); x.fill();
      x.fillStyle = '#ffcc00'; x.beginPath(); for (let i = 0; i < 28; i++) { const a = i / 28 * Math.PI * 2 - Math.PI / 2, r = i % 2 ? 4 : 9; x.lineTo(42 + Math.cos(a) * r, 16 + Math.sin(a) * r); } x.fill();
    } else { x.fillStyle = jenis; x.fillRect(0, 0, 112, 56); x.fillStyle = 'rgba(255,255,255,.25)'; x.fillRect(0, 0, 112, 6); }
    const tx = new T.CanvasTexture(c); tx.encoding = T.sRGBEncoding;
    return (BENDERA[jenis] = new T.MeshStandardMaterial({ map: tx, side: T.DoubleSide, roughness: .9 }));
  }
  const geoBendera = (() => { const g = new T.PlaneGeometry(.62, .34, 6, 1); g.translate(.31, -.17, 0); return g; })();

  /* ---------- model tentera (menghadap +X) ---------- */
  const SKALA_UNIT = 1.25; // unit lebih besar supaya mudah dibaca pada skrin kecil
  const TERBANG = { dron: 1.4, helikopter: 1.9, jet: 2.6 };
  // warna dan bentuk ikut aset negara pemain (ASET dalam data.js)
  const kulitAset = t => { const a = typeof asetSlot === 'function' ? asetSlot(t) : null; return a ? (a.warna || '') + (a.mod && a.mod.kamikaze ? ':delta' : '') : ''; };
  function modelUnit(t) {
    const ka = kulitAset(t), warna = ka.split(':')[0] || null, delta = ka.endsWith(':delta');
    return ingat('U' + t + ka, () => {
      const m = new Bina(), kulit = K.kulit;
      const kaki = (w = '#2a2a22') => { m.sil(.038, .032, .15, w, 0, 0, -.05, { seg: 6 }); m.sil(.038, .032, .15, w, 0, 0, .05, { seg: 6 }); };
      const kepala = (y = .43, r = .115) => m.bola(r, kulit, 0, y, 0);
      const askar = (baju = K.olive, topi = K.oliveG, but = '#2a2a22') => {
        kaki(but); m.sil(.085, .105, .2, baju, 0, .13, 0); m.sil(.107, .107, .04, '#3a3a2a', 0, .14, 0);
        kepala(); m.bola(.128, topi, 0, .47, 0, { sy: .72 }); m.sil(.135, .135, .02, topi, 0, .445, 0, { seg: 10 });
      };
      switch (t) {
        case 'infantri':
          askar(); m.kotak(.11, .15, .15, K.oliveG, -.1, .17, 0, { r: .03 });
          m.kotak(.34, .04, .04, K.hitam, .12, .22, .1, { r: .01 }); m.kotak(.04, .07, .03, K.hitam, .08, .17, .1, { r: .01 });
          break;
        case 'penembak':
          askar('#7a7440', '#5d6b35'); m.bola(.13, '#6b7a3a', -.02, .3, 0, { sx: .9, sy: .6, d: 0, rata: true });
          m.kotak(.55, .03, .03, K.hitam, .17, .24, .08, { r: .008 }); m.sil(.02, .02, .14, K.hitam, .16, .27, .08, { rz: Math.PI / 2, seg: 6 });
          break;
        case 'tukang':
          kaki('#3a2a22'); m.sil(.085, .1, .2, '#3f74b8', 0, .13, 0); m.sil(.088, .103, .1, K.oren, 0, .2, 0); kepala();
          m.bola(.13, K.kuning, 0, .48, 0, { sy: .62 }); m.sil(.15, .15, .015, K.kuning, 0, .46, 0, { seg: 10 });
          m.sil(.012, .012, .22, K.besiG, .1, .18, .08, { rz: -1.1, seg: 4 }); m.kotak(.06, .05, .1, K.besi, .2, .26, .08, { r: .01 });
          break;
        case 'kereta_kebal': {
          const w = warna || K.olive;
          for (const z of [-.22, .22]) { m.kotak(.86, .17, .15, '#33372f', 0, 0, z, { r: .07 }); for (let i = 0; i < 4; i++) m.sil(.055, .055, .02, '#5a5f55', -.3 + i * .2, .085, z + Math.sign(z) * .08, { rx: Math.PI / 2, seg: 8 }); }
          m.kotak(.78, .18, .4, w, 0, .1, 0, { r: .06 }); m.kotak(.18, .1, .38, gelap(w, -.15), .36, .12, 0, { rz: -.55, r: .03 });
          m.kotak(.4, .16, .32, gelap(w, .12), -.05, .28, 0, { r: .07 });
          m.sil(.033, .036, .58, gelap(w, -.15), .12, .36, 0, { rz: -Math.PI / 2, seg: 8 }); m.sil(.045, .045, .08, K.hitam, .66, .36, 0, { rz: -Math.PI / 2, seg: 8 });
          m.sil(.07, .07, .04, K.oliveG, -.12, .44, .06, { seg: 8 }); m.kotak(.08, .06, .08, K.kuning, -.2, .3, .165, { r: .01 });
          break;
        }
        case 'jurutera_tempur':
          askar(K.olive, K.oliveG); m.kotak(.15, .2, .2, '#8a5a2e', -.11, .17, 0, { r: .03 });
          m.sil(.045, .045, .24, '#c0392b', .1, .24, .1, { rz: Math.PI / 2, seg: 8 }); m.sil(.045, .045, .24, '#c0392b', .1, .3, .1, { rz: Math.PI / 2, seg: 8 });
          m.bola(.035, '#ffb020', .24, .3, .1, { d: 0 });
          break;
        case 'dron':
          if (delta) {
            const w = warna || '#d8d2bf';
            m.kon(.42, .75, w, -.35, .02, 0, { rz: -Math.PI / 2, seg: 3, sx: .14 });
            for (const z of [-.3, .3]) m.kotak(.06, .14, .03, gelap(w, -.15), -.3, .02, z, { r: .01 });
            m.sil(.05, .05, .1, '#3a3f46', -.45, .02, 0, { rz: Math.PI / 2, seg: 8 }); m.kotak(.02, .22, .03, K.hitam, -.48, -.08, 0, { r: .005 });
            break;
          }
          m.kotak(.26, .08, .26, '#3d4a5c', 0, 0, 0, { r: .04 });
          m.kotak(.62, .03, .05, K.hitam, 0, .04, 0, { ry: Math.PI / 4, r: .01 }); m.kotak(.62, .03, .05, K.hitam, 0, .04, 0, { ry: -Math.PI / 4, r: .01 });
          for (const [x, z] of [[.22, .22], [.22, -.22], [-.22, .22], [-.22, -.22]]) { m.sil(.03, .03, .05, K.hitam, x, .04, z, { seg: 6 }); m.sil(.13, .13, .01, '#cfd6dc', x, .09, z, { seg: 12 }); }
          m.bola(.045, K.hitam, .12, -.03, 0); m.bola(.02, '#ff4a3a', -.14, .06, 0, { d: 0 });
          break;
        case 'komando':
          askar('#2e3236', '#1d1f22', '#141414'); m.kotak(.17, .16, .2, '#3d4a2a', 0, .16, 0, { r: .04 });
          m.kotak(.26, .05, .05, K.hitam, .12, .22, .11, { r: .01 }); m.kotak(.04, .1, .03, K.hitam, .1, .16, .11, { r: .01 });
          m.kotak(.06, .03, .2, '#3a3f3a', .1, .45, 0, { r: .01 });
          break;
        case 'helikopter': {
          m.bola(.32, K.olive, 0, .26, 0, { sx: 1.45, sy: .8, sz: .85 });
          m.bola(.17, '#7fd0ff', .3, .3, 0, { sx: 1.1, sy: .8, sz: .9 });
          m.sil(.05, .08, .85, K.oliveG, -.25, .3, 0, { rz: Math.PI / 2, seg: 8 });
          m.kotak(.1, .28, .03, K.oliveG, -1.08, .3, 0, { r: .01 }); m.kotak(.05, .02, .3, K.hitam, -1.08, .5, 0, { r: .005 });
          m.kotak(.08, .04, .7, K.oliveG, 0, .2, 0, { r: .02 });
          for (const z of [-.34, .34]) m.sil(.05, .05, .28, '#3a3f3a', -.05, .18, z, { rz: -Math.PI / 2, seg: 8 });
          for (const z of [-.17, .17]) { m.kotak(.75, .03, .03, K.hitam, 0, 0, z, { r: .01 }); m.sil(.012, .012, .1, K.hitam, .15, 0, z, { seg: 4 }); m.sil(.012, .012, .1, K.hitam, -.2, 0, z, { seg: 4 }); }
          m.sil(.025, .025, .12, K.besiG, 0, .48, 0, { seg: 6 });
          break;
        }
        case 'apc': {
          const w = warna || K.olive;
          for (const z of [-.24, .18]) for (let i = 0; i < 4; i++) m.sil(.075, .075, .06, '#2a2d28', -.3 + i * .2, .075, z, { rx: Math.PI / 2, seg: 10 });
          m.kotak(.86, .22, .38, w, 0, .1, 0, { r: .06 }); m.kotak(.2, .12, .36, gelap(w, -.12), .38, .14, 0, { rz: -.5, r: .03 });
          m.kotak(.26, .1, .22, gelap(w, .1), -.05, .32, 0, { r: .04 }); m.sil(.02, .02, .34, K.hitam, .05, .37, 0, { rz: -Math.PI / 2, seg: 6 });
          m.kotak(.16, .03, .26, gelap(w, -.2), -.32, .32, 0, { r: .01 });
          break;
        }
        case 'roket': {
          const w = warna || K.olive;
          for (const x of [-.32, -.1, .3]) for (const z of [-.26, .19]) m.sil(.08, .08, .07, '#2a2d28', x, .08, z, { rx: Math.PI / 2, seg: 10 });
          m.kotak(.86, .08, .34, '#3a3f3a', 0, .1, 0, { r: .02 }); m.kotak(.24, .24, .34, w, .3, .16, 0, { r: .05 });
          m.kotak(.04, .1, .28, '#7fd0ff', .42, .26, 0, { r: .01 });
          m.kotak(.5, .22, .32, gelap(w, -.08), -.18, .2, 0, { rz: .4, r: .04 }); m.kotak(.04, .18, .26, K.hitam, .06, .3, 0, { rz: .4, r: .01 });
          break;
        }
        case 'jet': {
          const w = warna || '#8a939d';
          m.sil(.09, .11, 1.1, w, -.45, .2, 0, { rz: -Math.PI / 2, seg: 8 }); m.kon(.09, .3, gelap(w, -.12), .65, .2, 0, { rz: -Math.PI / 2, seg: 8 });
          m.bola(.08, '#7fd0ff', .35, .29, 0, { sx: 2, sy: .8, sz: .9 });
          for (const sz of [-1, 1]) { m.kotak(.55, .03, .5, w, -.12, .17, sz * .32, { ry: -sz * .5, r: .01 }); m.kotak(.22, .03, .22, w, -.42, .2, sz * .17, { ry: -sz * .4, r: .01 }); m.kotak(.24, .22, .03, gelap(w, -.08), -.38, .24, sz * .09, { rx: sz * .3, r: .01 }); }
          m.sil(.08, .08, .05, '#3a3f46', -.5, .2, 0, { rz: Math.PI / 2, seg: 8 });
          break;
        }
        case 'komander':
          askar(K.olive, '#8f1d2a'); m.kotak(.06, .03, .1, K.dana, 0, .3, .1, { r: .01 }); m.kotak(.06, .03, .1, K.dana, 0, .3, -.1, { r: .01 });
          m.kotak(.16, .04, .04, K.hitam, .12, .2, .11, { r: .01 }); m.kotak(.04, .03, .03, K.dana, .02, .2, .11, { r: .01 });
          break;
        case 'elit':
          askar('#5d6b35', '#4d5a2a'); m.bola(.16, K.oliveC, -.02, .33, 0, { sx: 1, sy: .7, d: 0, rata: true });
          m.kotak(.7, .035, .035, K.hitam, .22, .26, .1, { r: .01 }); m.sil(.025, .025, .16, K.hitam, .2, .3, .1, { rz: Math.PI / 2, seg: 6 }); m.kotak(.05, .08, .04, K.dana, .02, .2, .1, { r: .01 });
          break;
      }
      const g = m.geo();
      const sk = { komander: 1.25, elit: 1.2, komando: 1.15, kereta_kebal: 1.1, dron: 1.25, helikopter: 1.1, apc: 1.05, roket: 1.1, jet: 1.4 }[t] || 1;
      if (sk !== 1) { g.scale(sk, sk, sk); g.computeBoundingBox(); g.computeBoundingSphere(); }
      return g;
    });
  }

  /* ---------- tekstur bantu ---------- */
  function kanvasTx(w, h, f, linear) { const c = document.createElement('canvas'); c.width = w; c.height = h; f(c.getContext('2d'), w, h); const t = new T.CanvasTexture(c); if (!linear) t.encoding = T.sRGBEncoding; return t; }
  const txAO = kanvasTx(64, 64, (x) => { const g = x.createRadialGradient(32, 32, 4, 32, 32, 32); g.addColorStop(0, 'rgba(0,0,0,.55)'); g.addColorStop(.6, 'rgba(0,0,0,.28)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); });
  const MAT_AO = new T.MeshBasicMaterial({ map: txAO, transparent: true, depthWrite: false, opacity: 1 });
  const geoDatar = (() => { const g = new T.PlaneGeometry(1, 1); g.rotateX(-Math.PI / 2); return g; })();
  const txGaris = kanvasTx(64, 64, (x) => { x.strokeStyle = '#fff'; x.lineWidth = 6; x.beginPath(); x.roundRect ? x.roundRect(4, 4, 56, 56, 10) : x.rect(4, 4, 56, 56); x.stroke(); });

  /* ---------- dunia: tanah, laut, pokok ---------- */
  function bunyi(x, z) { return (Math.sin(x * .21 + z * .07) * .5 + Math.sin(z * .19 - x * .11 + 1.3) * .35 + Math.sin(x * .53 + z * .47 + 2.1) * .15) * .5 + .5; }
  function tinggiTanah(x, z) {
    if (z > G + 1.6) { const t = z - (G + 2.2); return t < 1.8 ? -.03 * Math.max(0, t) : Math.max(-2.4, -.06 - (t - 1.8) * .5); }
    const dx = Math.max(0, -1.4 - x, x - (G + 1.4)), dz = Math.max(0, -1.4 - z), d = Math.hypot(dx, dz);
    if (d <= 0) return 0;
    const tepi = Math.min(1, Math.max(0, (G + 1.6 - z) / 3));
    return Math.min(1, d / 6) * (.4 + bunyi(x, z) * 1.8) * tepi;
  }
  let laut, lautAsal, buih, perahu, pokokSemua = [];
  function binaDunia() {
    const N = 110, SZ = 260, g0 = new T.PlaneGeometry(SZ, SZ, N, N); g0.rotateX(-Math.PI / 2); g0.translate(G / 2, 0, G / 2 + 12);
    const p = g0.attributes.position, wr = new Float32Array(p.count * 3), c = new T.Color();
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i), h = tinggiTanah(x, z), n = bunyi(x * 1.7, z * 1.7);
      p.setY(i, h);
      let w;
      if (z > G + 1.7) w = h > -.15 ? (n > .5 ? '#f2dca3' : '#ead19a') : '#d9c690';
      else if (x > -1 && x < G + 1 && z > -1 && z < G + 1) w = n > .5 ? '#7ccb3e' : '#74c33a';
      else w = h > .9 ? (n > .5 ? '#4f9e2e' : '#47942a') : (n > .5 ? '#62b836' : '#5aae32');
      c.set(w).convertSRGBToLinear(); wr[i * 3] = c.r; wr[i * 3 + 1] = c.g; wr[i * 3 + 2] = c.b;
    }
    g0.setAttribute('color', new T.BufferAttribute(wr, 3));
    const g = g0.toNonIndexed(); g.computeVertexNormals();
    const tanah = new T.Mesh(g, new T.MeshStandardMaterial({ vertexColors: true, roughness: .95 })); tanah.receiveShadow = true; adegan.add(tanah);
    // medan kota bertekstur petak halus
    const txMedan = kanvasTx(G * 8, G * 8, (x, w) => {
      for (let i = 0; i < G; i++) for (let j = 0; j < G; j++) { x.fillStyle = (i + j) % 2 ? '#86d443' : '#7dcc3c'; x.fillRect(i * 8, j * 8, 8, 8); }
      const r = rng(5); for (let k = 0; k < 900; k++) { x.fillStyle = r() < .5 ? 'rgba(255,255,200,.10)' : 'rgba(30,80,10,.10)'; x.fillRect(r() * w, r() * w, 2, 2); }
    });
    txMedan.magFilter = T.LinearFilter; txMedan.anisotropy = 4;
    const medan = new T.Mesh(geoDatar, new T.MeshStandardMaterial({ map: txMedan, roughness: .95 }));
    medan.scale.set(G, 1, G); medan.position.set(G / 2, .012, G / 2); medan.receiveShadow = true; adegan.add(medan);
    const bm = new Bina(), tebal = .28, sp = '#bdb8ac';
    bm.kotak(G + tebal * 2, .06, tebal, sp, G / 2, 0, -tebal / 2, { r: .03 }); bm.kotak(G + tebal * 2, .06, tebal, sp, G / 2, 0, G + tebal / 2, { r: .03 });
    bm.kotak(tebal, .06, G, sp, -tebal / 2, 0, G / 2, { r: .03 }); bm.kotak(tebal, .06, G, sp, G + tebal / 2, 0, G / 2, { r: .03 });
    for (let i = 0; i <= G; i += 2) for (const [x, z] of [[i, -tebal], [-tebal, i], [G + tebal, i]]) bm.sil(.03, .03, .55, '#8a939d', x, 0, z, { seg: 4 });
    const sempadan = new T.Mesh(bm.geo(), MAT); sempadan.receiveShadow = true; adegan.add(sempadan);
    // laut
    const gl = new T.PlaneGeometry(400, 160, 80, 32); gl.rotateX(-Math.PI / 2); gl.translate(G / 2, -.32, G + 3.4 + 80);
    laut = new T.Mesh(gl.toNonIndexed(), new T.MeshStandardMaterial({ color: new T.Color('#1fa6d2').convertSRGBToLinear(), roughness: .22, metalness: .05, transparent: true, opacity: .86, flatShading: true }));
    lautAsal = Float32Array.from(laut.geometry.attributes.position.array); laut.receiveShadow = true; adegan.add(laut);
    buih = new T.Mesh(geoDatar, new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .45, depthWrite: false }));
    buih.scale.set(400, 1, .35); buih.position.set(G / 2, -.25, G + 4.5); adegan.add(buih);
    // pokok, kelapa, semak, batu
    const r = rng(7), jenis = { pokok: [], pokok2: [], kelapa: [], semak: [], batu: [], rumput: [], bunga: [] };
    for (let i = 0; i < 230; i++) {
      const x = -16 + r() * (G + 32), z = -16 + r() * (G + 18.5);
      if (x > -2.2 && x < G + 2.2 && z > -2.2 && z < G + 2.2) continue;
      const k = r(); jenis[k < .45 ? 'pokok' : k < .8 ? 'pokok2' : k < .93 ? 'semak' : 'batu'].push([x, z, .75 + r() * .6, r() * 6.3]);
    }
    for (let i = 0; i < 34; i++) jenis.kelapa.push([-10 + r() * (G + 20), G + 2.5 + r() * 1.4, .8 + r() * .35, r() * 6.3]);
    for (let i = 0; i < 18; i++) { const sisi = r() < .5; jenis.semak.push([sisi ? -1.7 - r() * .6 : G + 1.7 + r() * .6, r() * G, .5 + r() * .3, r() * 6]); }
    const model = {
      pokok: () => new Bina().sil(.09, .13, .7, '#7a5232', 0, 0, 0, { seg: 6 }).bola(.55, '#3f9c34', 0, 1.05, 0, { rata: true }).bola(.42, '#4fb03c', .25, 1.35, .1, { rata: true }).bola(.36, '#5cbd44', -.2, 1.45, -.12, { rata: true }).geo(),
      pokok2: () => new Bina().sil(.08, .11, .5, '#6e4a2c', 0, 0, 0, { seg: 6 }).kon(.62, .9, '#2f8a3a', 0, .45, 0, { seg: 7, rata: true }).kon(.48, .75, '#3a9c42', 0, .95, 0, { seg: 7, rata: true }).kon(.32, .55, '#47ad49', 0, 1.4, 0, { seg: 7, rata: true }).geo(),
      semak: () => new Bina().bola(.32, '#4aa83a', 0, .15, 0, { rata: true }).bola(.24, '#5cbd44', .25, .12, .1, { rata: true }).bola(.2, '#3f9c34', -.2, .1, -.05, { rata: true }).geo(),
      batu: () => new Bina().t(new T.DodecahedronGeometry(.35, 0), '#a7a29a', 0, .1, 0, { sy: .65, rata: true }).t(new T.DodecahedronGeometry(.2, 0), '#bdb8af', .3, .05, .15, { sy: .7, rata: true }).geo(),
      kelapa: () => {
        const m = new Bina(); let x = 0, y = 0;
        for (let i = 0; i < 5; i++) { m.sil(.07 - i * .006, .08 - i * .006, .42, '#9a7448', x, y, 0, { rz: -.1 - i * .07, seg: 6 }); x += Math.sin(.1 + i * .07) * .42; y += Math.cos(.1 + i * .07) * .42; }
        for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2; m.kotak(.9, .03, .2, i % 2 ? '#3f9c34' : '#4fb03c', x + Math.cos(a) * .42, y - .12, Math.sin(a) * .42, { ry: -a, rz: -.45, r: .01 }); }
        m.bola(.07, '#6b4a1f', x + .06, y - .1, .05).bola(.07, '#6b4a1f', x - .05, y - .1, -.04);
        return m.geo();
      },
    };
    for (let i = 0; i < 520; i++) {
      const x = -10 + r() * (G + 20), z = -10 + r() * (G + 12);
      const dalam = x > -.3 && x < G + .3 && z > -.3 && z < G + .3;
      if (dalam || z > G + 1.8) continue;
      jenis[r() < .72 ? 'rumput' : 'bunga'].push([x, z, .7 + r() * .6, r() * 6.3]);
    }
    for (let i = 0; i < 40; i++) { const t = r() * G, sisi = Math.floor(r() * 3); const [x, z] = sisi === 0 ? [t, -.55 - r() * .4] : sisi === 1 ? [-.55 - r() * .4, t] : [G + .55 + r() * .4, t]; jenis.rumput.push([x, z, .6 + r() * .4, r() * 6]); }
    model.rumput = () => { const m = new Bina(); for (let i = 0; i < 5; i++) { const a = i / 5 * 6.28; m.kon(.035, .22 + (i % 2) * .08, i % 2 ? '#4fae2c' : '#62c23a', Math.cos(a) * .06, 0, Math.sin(a) * .06, { rx: Math.sin(a) * .35, rz: -Math.cos(a) * .35, seg: 3 }); } return m.geo(); };
    model.bunga = () => { const m = new Bina(); for (const [x, z, w] of [[0, 0, '#ff6f91'], [.12, .08, '#ffd23a'], [-.1, .1, '#ffffff'], [.05, -.12, '#ff9a3c']]) { m.sil(.008, .008, .16, '#3f8f2e', x, 0, z, { seg: 3 }); m.bola(.04, w, x, .17, z, { d: 0, rata: true }); } return m.geo(); };
    for (const [k, arr] of Object.entries(jenis)) {
      if (!arr.length) continue;
      const im = new T.InstancedMesh(model[k](), MAT, arr.length), mt = new T.Matrix4(), q = new T.Quaternion(), e = new T.Euler();
      arr.forEach(([x, z, s, a], i) => { mt.compose(new T.Vector3(x, tinggiTanah(x, z) - .02, z), q.setFromEuler(e.set(0, a, 0)), new T.Vector3(s, s, s)); im.setMatrixAt(i, mt); });
      im.castShadow = true; im.receiveShadow = true; adegan.add(im); pokokSemua.push(im);
    }
    // perahu
    const pm = new Bina();
    pm.kotak(2.6, .34, .7, '#7d8790', 0, 0, 0, { r: .14 }); pm.kon(.34, .6, '#7d8790', 1.5, .03, 0, { rz: -Math.PI / 2, seg: 6 });
    pm.kotak(2.5, .05, .62, '#5a636b', 0, .32, 0, { r: .02 }); pm.kotak(.9, .45, .5, '#9aa3ab', -.3, .36, 0, { r: .08 });
    pm.kotak(.5, .12, .52, '#2c3e50', -.1, .62, 0, { r: .03 }); pm.sil(.03, .03, .7, '#5a636b', -.4, .8, 0, { seg: 5 });
    pm.sil(.07, .08, .2, '#5a636b', .75, .36, 0, { seg: 8 }); pm.sil(.025, .025, .45, '#3a3f46', .8, .5, 0, { rz: -Math.PI / 2, seg: 6 });
    perahu = new T.Mesh(pm.geo(), MAT); perahu.castShadow = true; adegan.add(perahu);
  }

  /* ---------- penyegerakan dengan keadaan permainan ---------- */
  const objB = new Map();           // id bangunan -> kumpulan
  let sumberLalu = null, sumberBT = null;
  const tembok = new Map();         // kunci geometri -> InstancedMesh
  const unitObj = new Map(), unitKem = [];
  const projObj = new Map(), fxObj = new Map(), zonObj = new Map();
  let zonLepas = null, garisPilih = null, hantu = null, bingkai = 0;
  function buang(o) { adegan.remove(o); o.traverse(c => { if (c.userData.matSendiri && c.material) c.material.dispose(); if (c.userData.geoSendiri && c.geometry) c.geometry.dispose(); }); }
  function meshAO(s) { const a = new T.Mesh(geoDatar, MAT_AO); a.scale.set(s, 1, s); a.position.y = .02; a.renderOrder = 1; return a; }
  function binaKumpulan(b, mati) {
    const s = B[b.t].s, g = new T.Group(), d = {};
    g.add(meshAO(mati ? s * .9 : s * 1.18));
    if (b.t !== 'periuk_api') { const tp = new T.Mesh(modelTapak(s), MAT); tp.receiveShadow = true; g.add(tp); }
    const st = new T.Mesh(mati ? modelRuntuh(s) : modelBangunan(b.t, Math.max(1, b.lv)), MAT);
    st.position.y = b.t === 'periuk_api' ? 0 : TAPAK_H; st.castShadow = true; st.receiveShadow = true; st.userData.b = b; g.add(st); d.st = st;
    if (!mati) {
      const lv = Math.max(1, b.lv);
      if (b.t === 'artileri') { d.laras = new T.Mesh(modelLaras(lv), MAT); d.laras.position.y = TAPAK_H + .4; d.laras.castShadow = true; g.add(d.laras); }
      if (b.t === 'pelancar_roket') { d.laras = new T.Mesh(modelMortar(), MAT); d.laras.position.y = TAPAK_H + .44; d.laras.castShadow = true; g.add(d.laras); }
      if (b.t === 'pertahanan_udara') { d.laras = new T.Mesh(modelSAM(), MAT); d.laras.position.y = TAPAK_H + .32; d.laras.castShadow = true; g.add(d.laras); }
      if (b.t === 'radar') { d.piring = new T.Mesh(modelPiring(), MAT); d.piring.position.y = TAPAK_H + 1.55; d.piring.castShadow = true; g.add(d.piring); }
      if (b.t === 'telaga_minyak') { d.pam = new T.Mesh(modelPam(), MAT); d.pam.position.set(-.3, 1.32 + TAPAK_H, .1); d.pam.castShadow = true; g.add(d.pam); }
      if (POS_ISI[b.t]) { d.isi = new T.Mesh(modelIsi(b.t), MAT); d.isi.castShadow = true; d.isi.position.set(POS_ISI[b.t][0], POS_ISI[b.t][1] + TAPAK_H, POS_ISI[b.t][2]); g.add(d.isi); }
      if (b.t === 'kem') { d.api = new T.Mesh(modelApi(), new T.MeshStandardMaterial({ vertexColors: true, emissive: 0xff7a20, emissiveIntensity: .9 })); d.api.userData.matSendiri = true; d.api.position.y = .12 + TAPAK_H; g.add(d.api); }
      const benderaMarkas = perangKah() ? '#8a1d1d' : (negaraPapar() === 'MY' ? 'jalur' : '#2b4a7a');
      const bnd = { markas: [-1.6, 3.45, -1.6, benderaMarkas], berek: [1.2, 2.58, -.85, '#4d5a2a'], pusat_pakatan: [0, 2.0, -.3, '#2f6fba'] }[b.t];
      if (bnd) { d.bendera = new T.Mesh(geoBendera, teksturBendera(bnd[3])); d.bendera.position.set(bnd[0], bnd[1] + TAPAK_H, bnd[2]); d.bendera.castShadow = true; g.add(d.bendera); }
      if (b.t === 'menara_mesingan') { d.figur = new T.Mesh(modelUnit('infantri'), MAT); d.figur.position.y = 2.04 + lv * .05 + TAPAK_H; d.figur.castShadow = true; g.add(d.figur); }
      if (B[b.t].hero) { d.figur = new T.Mesh(modelUnit(B[b.t].hero), MAT); d.figur.position.set(.1, .34 + TAPAK_H, .2); d.figur.castShadow = true; g.add(d.figur); }
    }
    g.position.set(b.x + s / 2, 0, b.y + s / 2);
    g.userData = { d, kunci: kunciB(b, mati) };
    return g;
  }
  // tapak konkrit individu di bawah setiap bangunan (gaya diorama)
  const TAPAK_H = .07;
  const modelTapak = s => ingat(`T${s}`, () => new Bina().kotak(s - .04, TAPAK_H + .02, s - .04, '#dcd7ca', 0, -.02, 0, { r: .05 }).kotak(s - .3, .012, s - .3, '#e6e2d6', 0, TAPAK_H - .004, 0, { r: .004 }).geo());
  const kunciB = (b, mati) => `${b.t}:${Math.max(1, b.lv)}:${mati ? 1 : 0}${b.t === 'markas' ? ':' + (perangKah() ? 'L' : negaraPapar()) : ''}`;
  const perangKah = () => mode === 'perang' && !!BT;
  const lawatKah = () => mode === 'lawat' && !!LAWAT;
  const negaraPapar = () => lawatKah() ? LAWAT.negara : S.negara;
  const sumberB = () => perangKah() ? BT.blds : lawatKah() ? LAWAT.blds : S.bld;
  const POS_ISI = { zon_industri: [.75, .12, .85], bank: [0, .36, 1.15], depot_minyak: [.75, .12, .8], telaga_minyak: [-.85, .12, .95], gudang_nadir: [0, 1.22, -.05], lombong_nadir: [-.5, .12, -1.05] };
  const mtT = new T.Matrix4();
  function kemaskiniTembok(senarai, perang) {
    const kira = new Map(), peta = new Set();
    for (const b of senarai) if (b.t === 'tembok' && !(perang && b.mati)) peta.add(b.x + ',' + b.y);
    for (const b of senarai) {
      if (b.t !== 'tembok') continue;
      if (S.letak && !S.letak.baru && S.letak.b === b) continue;
      const mati = perang && b.mati, mask = mati ? 0 : (peta.has((b.x + 1) + ',' + b.y) ? 1 : 0) | (peta.has(b.x + ',' + (b.y + 1)) ? 2 : 0);
      const k = mati ? 'mati' : `${b.lv}:${mask}`;
      let im = tembok.get(k);
      if (!im) { im = new T.InstancedMesh(mati ? modelRuntuhKota() : modelKota(b.lv, mask), MAT, 400); im.castShadow = true; im.receiveShadow = true; im.count = 0; tembok.set(k, im); adegan.add(im); }
      let n = kira.get(k) || 0;
      if (n >= 400) continue;
      const goyang = perang && b.kena > 0 ? (Math.random() - .5) * .06 : 0;
      im.setMatrixAt(n, mtT.makeTranslation(b.x + .5 + goyang, 0, b.y + .5)); kira.set(k, n + 1);
    }
    for (const [k, im] of tembok) { im.count = kira.get(k) || 0; im.instanceMatrix.needsUpdate = true; }
  }
  function segerakBangunan(ts) {
    const perang = mode === 'perang' && BT, lawat = lawatKah(), senarai = sumberB();
    if (senarai !== sumberLalu) { for (const g of objB.values()) buang(g); objB.clear(); sumberLalu = senarai; }
    const ada = new Set();
    for (const b of senarai) {
      if (b.t === 'tembok') continue;
      if (b.t === 'periuk_api' && perang && !(BT.risik && !b.mati)) continue;
      const mati = perang && b.mati;
      let g = objB.get(b.id);
      if (g && g.userData.kunci !== kunciB(b, mati)) { buang(g); g = null; }
      if (!g) { g = binaKumpulan(b, mati); objB.set(b.id, g); adegan.add(g); }
      ada.add(b.id);
      const s = B[b.t].s, pindah = S.letak && !S.letak.baru && S.letak.b === b;
      g.visible = !pindah;
      g.position.set(b.x + s / 2 + (perang && b.kena > 0 ? (Math.random() - .5) * .08 : 0), 0, b.y + s / 2);
      const d = g.userData.d;
      if (d.laras) d.laras.rotation.y = -(b.sudut ?? Math.PI / 4) + (b.t === 'artileri' ? 0 : 0);
      if (d.laras && b.kilat > 0) d.laras.position.x = -Math.cos(b.sudut) * .06; else if (d.laras) d.laras.position.x = 0;
      let isi = 0;
      if (lawat) isi = .65;
      else if (B[b.t].hasil) isi = perang ? (b.lootBaki ? .7 : 0) : b.store / capPengumpul(b);
      else if (B[b.t].simpan) isi = perang ? (b.lootBaki ? (b.lootBaki.dana + b.lootBaki.minyak + b.lootBaki.nadir) / Math.max(1, b.lootJum) : 0) : S.res[B[b.t].simpan] / Math.max(1, capSumber(B[b.t].simpan));
      if (d.isi) { const f = clamp(isi, 0, 1); d.isi.visible = f > .04; d.isi.scale.set(.5 + f * .5, .35 + f * .65, .5 + f * .5); }
      if (d.pam) d.pam.rotation.z = Math.sin(ts * 2.2 + b.id) * .28;
      if (d.piring) d.piring.rotation.y = (perang && b.mati) ? 0 : ts * 1.6 + b.id;
      if (d.api) { const f = 1 + Math.sin(ts * 13 + b.id) * .12 + Math.sin(ts * 21) * .06; d.api.scale.set(f, f * 1.1, f); }
      if (d.bendera) { d.bendera.rotation.y = Math.sin(ts * 2.4 + b.id) * .35 - .4; d.bendera.scale.x = .85 + Math.sin(ts * 4.1 + b.id) * .12; }
      if (d.figur) {
        d.figur.visible = !(B[b.t].hero && (perang || b.busy || b.lv < 1));
        if (b.t === 'menara_mesingan') d.figur.rotation.y = -(b.sudut ?? Math.PI / 4);
        else d.figur.rotation.y = -Math.PI / 4 + Math.sin(ts * .7 + b.id) * .4;
      }
      // perancah
      const sibuk = !perang && !lawat && (b.busy || b.lv === 0);
      if (sibuk && !d.perancah) { d.perancah = new T.Mesh(modelPerancah(s), MAT); d.perancah.castShadow = true; g.add(d.perancah); }
      if (!sibuk && d.perancah) { g.remove(d.perancah); d.perancah = null; }
    }
    for (const [id, g] of objB) if (!ada.has(id)) { buang(g); objB.delete(id); }
    kemaskiniTembok(senarai, perang);
  }
  function arahKe(mesh, dx, dz) { if (Math.abs(dx) + Math.abs(dz) > 1e-4) mesh.rotation.y = Math.atan2(-dz, dx); }
  function meshUnit(t) {
    const m = new T.Mesh(modelUnit(t), MAT); m.castShadow = true;
    const a = meshAO(t === 'kereta_kebal' || t === 'helikopter' ? 1.1 : .55); a.position.y = .025; m.add(a); m.userData.t = t;
    if (t === 'helikopter') { const r = new T.Mesh(modelRotor(), MAT); r.position.y = .62; m.add(r); m.userData.rotor = r; }
    return m;
  }
  function segerakUnit(ts) {
    const perang = mode === 'perang' && BT;
    // tentera perang
    const hidup = new Set();
    if (perang) for (const u of BT.units) {
      if (u.hp <= 0) continue; hidup.add(u);
      let m = unitObj.get(u); if (!m) { m = meshUnit(u.t); unitObj.set(u, m); adegan.add(m); m.userData.lx = u.x; m.userData.ly = u.y; }
      const ud = m.userData, dx = u.x - ud.lx, dz = u.y - ud.ly;
      if (u.sasaran && !u.bergerak) { const s = B[u.sasaran.t].s; arahKe(m, u.sasaran.x + s / 2 - u.x, u.sasaran.y + s / 2 - u.y); } else arahKe(m, dx, dz);
      ud.lx = u.x; ud.ly = u.y;
      const alt = TERBANG[u.t] || 0, bob = alt ? Math.sin(ts * 3 + u.id * 9) * .06 : u.bergerak ? Math.abs(Math.sin(u.langkah)) * .06 : 0, terkam = u.serang > 0 ? Math.sin(u.serang * 12) * .08 : 0;
      m.position.set(u.x + Math.cos(-m.rotation.y) * terkam, alt + bob, u.y + Math.sin(-m.rotation.y) * terkam);
      m.children[0].position.y = .025 - alt - bob; m.children[0].material.opacity = alt ? .55 : 1;
      if (ud.rotor) ud.rotor.rotation.y = ts * 22;
      const k = u.kena > 0 ? 1.12 : 1, au = u.aura ? 1.15 : 1; m.scale.setScalar(k * au * SKALA_UNIT);
    }
    for (const [u, m] of unitObj) if (!hidup.has(u)) { adegan.remove(m); unitObj.delete(u); }
    // kampung: tentera di Medan Kawad dan tukang
    const mahu = [];
    if (!perang) {
      const lw = lawatKah();
      for (const u of lw ? tenteraKem(LAWAT.blds, LAWAT.army) : tenteraKem()) mahu.push({ t: u.t, x: u.x, y: u.y, menghadap: [u.kx - u.x, u.ky - u.y], bob: Math.abs(Math.sin(ts * 2 + u.x * 3)) * .02 });
      let lapang = lw ? 0 : tukangLapang();
      for (const b of lw ? [] : S.bld) {
        const s = B[b.t].s;
        if (b.busy || b.lv === 0) mahu.push({ t: 'tukang', x: b.x + s + .15, y: b.y + s / 2 + .2, menghadap: [-1, 0], tukul: true, id: b.id });
        else if (b.t === 'pejabat_jurutera' && lapang-- > 0) mahu.push({ t: 'tukang', x: b.x + s + .05, y: b.y + s - .1, menghadap: [1, 1], bob: 0 });
      }
    }
    while (unitKem.length < mahu.length) { const m = meshUnit('tukang'); unitKem.push(m); adegan.add(m); }
    unitKem.forEach((m, i) => {
      const w = mahu[i]; m.visible = !!w; if (!w) return;
      const gU = modelUnit(w.t);
      if (m.geometry !== gU) { m.geometry = gU; m.userData.t = w.t; m.children[0].scale.setScalar(w.t === 'kereta_kebal' || w.t === 'helikopter' ? 1.1 : .55); }
      arahKe(m, w.menghadap[0], w.menghadap[1]);
      m.position.set(w.x, w.bob || 0, w.y); m.scale.setScalar(SKALA_UNIT);
      m.rotation.z = w.tukul ? Math.max(0, Math.sin(ts * 9 + w.id)) * -.35 : 0;
    });
  }
  const MAT_PELURU = new T.MeshStandardMaterial({ color: 0x1d1d22, roughness: .4, metalness: .3 });
  const MAT_DAMAK = new T.MeshStandardMaterial({ color: new T.Color('#ffe9a0').convertSRGBToLinear(), roughness: .7, emissive: 0x664400 });
  const MAT_PANAH = new T.MeshStandardMaterial({ color: new T.Color('#ffd23a').convertSRGBToLinear(), roughness: .5, emissive: 0x553300 });
  const MAT_MISIL = new T.MeshStandardMaterial({ color: new T.Color('#f4f4f0').convertSRGBToLinear(), roughness: .5, emissive: 0x442200 });
  const geoMisil = (() => { const g = new T.CylinderGeometry(.04, .04, .6, 6); g.rotateZ(Math.PI / 2); return g; })();
  const geoPeluru = new T.IcosahedronGeometry(.09, 1), geoBom = new T.IcosahedronGeometry(.17, 1);
  const geoDamak = (() => { const g = new T.CylinderGeometry(.012, .012, .42, 4); g.rotateZ(Math.PI / 2); return g; })();
  function segerakPerang(ts) {
    bingkai++;
    const perang = mode === 'perang' && BT;
    if (perang) for (const p of BT.proj) {
      let m = projObj.get(p);
      if (!m) {
        const misil = ['misil', 'misilL', 'roketU', 'balistik'].includes(p.j);
        const geo = p.j === 'bom' || p.j === 'bomU' ? geoBom : p.j === 'peluru' ? geoPeluru : misil ? geoMisil : geoDamak;
        const mat = p.j === 'bom' || p.j === 'bomU' || p.j === 'peluru' ? MAT_PELURU : p.j === 'panah' ? MAT_PANAH : misil ? MAT_MISIL : MAT_DAMAK;
        m = new T.Mesh(geo, mat); m.castShadow = true; if (p.j === 'balistik') m.scale.set(3, 3, 3); projObj.set(p, m); adegan.add(m);
      }
      const f = clamp(p.t / p.dur, 0, 1), x = p.dari[0] + (p.ke[0] - p.dari[0]) * f, z = p.dari[1] + (p.ke[1] - p.dari[1]) * f;
      let y = (p.dari[2] + (p.ke[2] - p.dari[2]) * f) * .8; if (p.j === 'bom' || p.j === 'roketU') y += 4 * 3 * f * (1 - f);
      m.visible = p.t >= 0;
      m.position.set(x, y, z);
      if (m.geometry === geoDamak || m.geometry === geoMisil) arahKe(m, p.ke[0] - p.dari[0], p.ke[1] - p.dari[1]);
      m.userData.f = bingkai;
    }
    for (const [p, m] of projObj) if (m.userData.f !== bingkai) { adegan.remove(m); projObj.delete(p); }
    // kesan
    if (perang) for (const f of BT.fx) {
      if (f.j === 'teks') continue;
      let o = fxObj.get(f);
      if (!o) { o = binaKesan(f); fxObj.set(f, o); adegan.add(o); }
      kemaskiniKesan(o, f); o.userData.f = bingkai;
    }
    for (const [f, o] of fxObj) if (o.userData.f !== bingkai) { buang(o); fxObj.delete(f); }
    // zon taktik
    if (perang) for (const z of BT.zon) {
      let o = zonObj.get(z);
      if (!o) {
        const w = { bekalan: '#7dff8a', ew: '#7fd0ff', udara: '#ff5a3a', semangat: '#ffd65a', laut: '#3ab0ff', balistik: '#ff2a2a' }[z.jenis] || '#ffffff';
        o = new T.Group();
        const cakera = new T.Mesh(new T.CircleGeometry(z.r, 40), new T.MeshBasicMaterial({ color: new T.Color(w).convertSRGBToLinear(), transparent: true, opacity: .22, depthWrite: false }));
        cakera.rotation.x = -Math.PI / 2; cakera.userData.matSendiri = true;
        const cincin = new T.Mesh(new T.TorusGeometry(z.r, .05, 6, 48), new T.MeshBasicMaterial({ color: new T.Color(w).convertSRGBToLinear(), transparent: true, opacity: .8 }));
        cincin.rotation.x = -Math.PI / 2; cincin.userData.matSendiri = true;
        o.add(cakera, cincin); o.position.y = .05; zonObj.set(z, o); adegan.add(o);
      }
      o.position.x = z.x; o.position.z = z.y; const k = 1 - z.t / z.dur;
      o.children[0].material.opacity = .1 + .18 * k * (.7 + .3 * Math.sin(ts * 8)); o.children[1].material.opacity = .4 + .5 * k; o.userData.f = bingkai;
    }
    for (const [z, o] of zonObj) if (o.userData.f !== bingkai) { buang(o); o.traverse(c => c.geometry && c.geometry.dispose()); zonObj.delete(z); }
    // kawasan larangan lepas tentera
    if (perang && sumberBT !== BT) {
      sumberBT = BT;
      if (zonLepas) { buang(zonLepas); zonLepas.material.map.dispose(); }
      const n = G + 8;
      const tx = kanvasTx(n * 4, n * 4, (x) => { x.fillStyle = 'rgba(240,70,50,1)'; for (const k of BT.sekat) { const [i, j] = k.split(',').map(Number); x.fillRect((i + 4) * 4, (j + 4) * 4, 4, 4); } });
      tx.magFilter = T.NearestFilter; tx.minFilter = T.NearestFilter;
      zonLepas = new T.Mesh(geoDatar, new T.MeshBasicMaterial({ map: tx, transparent: true, opacity: .3, depthWrite: false }));
      zonLepas.userData.matSendiri = true; zonLepas.scale.set(n, 1, n); zonLepas.position.set(G / 2, .03, G / 2); zonLepas.renderOrder = 2; adegan.add(zonLepas);
    }
    if (zonLepas) {
      zonLepas.visible = !!perang && (BT.kilat > 0 || !BT.mula);
      if (perang) zonLepas.material.opacity = BT.kilat > 0 ? .25 + .3 * Math.min(1, BT.kilat) : .18 + .06 * Math.sin(ts * 3);
    }
    if (!perang) sumberBT = null;
  }
  function binaKesan(f) {
    const o = new T.Group(), mat = (w, op = 1, em) => { const m = new T.MeshStandardMaterial({ color: new T.Color(w).convertSRGBToLinear(), transparent: true, opacity: op, roughness: .9, emissive: em ? new T.Color(em) : 0x000000, emissiveIntensity: em ? 1 : 0, depthWrite: false }); return m; };
    const tambah = (geo, m, x = 0, y = 0, z = 0) => { const me = new T.Mesh(geo, m); me.position.set(x, y, z); me.userData.matSendiri = true; o.add(me); return me; };
    if (f.j === 'letup') { tambah(bolaG(.5, 1), mat('#ffb03a', 1, '#ff7a10'), 0, .3); tambah(bolaG(.35, 1), mat('#ffe680', 1, '#ffcc33'), 0, .4); for (let i = 0; i < 4; i++) tambah(bolaG(.32, 1), mat('#8d8d8d', .8), (Math.random() - .5) * .6, .5, (Math.random() - .5) * .6); }
    else if (f.j === 'asap' || f.j === 'debu') tambah(bolaG(.22, 1), mat(f.j === 'debu' ? '#c9ab80' : '#e6e6e6', .8), 0, .2);
    else if (f.j === 'percik') for (let i = 0; i < 5; i++) tambah(bolaG(.04, 0), mat('#fff0a0', 1, '#ffcc33'), 0, .3);
    else if (f.j === 'periuk_api') for (let i = 0; i < 6; i++) { const a = i / 6 * 6.28; tambah(konG(.04, .4, 5), mat('#d8c27a'), Math.cos(a) * .22, 0, Math.sin(a) * .22); }
    else if (f.j === 'cincin') { const t = new T.Mesh(new T.TorusGeometry(1, .06, 6, 40), mat('#ffd65a', 1, '#ffb000')); t.rotation.x = -Math.PI / 2; t.userData.matSendiri = true; t.userData.geoSendiri = true; o.add(t); }
    o.position.set(f.x, 0, f.y);
    return o;
  }
  function kemaskiniKesan(o, f) {
    const k = clamp(f.t / f.dur, 0, 1);
    if (f.j === 'letup') { const r = (f.r || 1); o.children.forEach((c, i) => { if (i < 2) { c.scale.setScalar(r * (.4 + 1.4 * k)); c.material.opacity = 1 - k; } else { c.scale.setScalar(r * (.6 + 1.2 * k)); c.position.y = .5 + k * 1.4; c.material.opacity = .7 * (1 - k); } }); }
    else if (f.j === 'asap' || f.j === 'debu') { const c = o.children[0]; c.scale.setScalar(.6 + k * 1.6); c.position.y = .2 + k * .6; c.material.opacity = .75 * (1 - k); }
    else if (f.j === 'percik') o.children.forEach((c, i) => { const a = i * 1.26; c.position.set(Math.cos(a) * k * .45, .3 + Math.sin(k * 3) * .2, Math.sin(a) * k * .45); c.material.opacity = 1 - k; });
    else if (f.j === 'periuk_api') o.children.forEach(c => { c.scale.y = Math.min(1, k * 5); c.material.opacity = 1 - k * k; });
    else if (f.j === 'cincin') { const c = o.children[0]; c.scale.setScalar(.4 + k * 3); c.position.y = .1; c.material.opacity = 1 - k; }
  }
  function segerakPilih(ts) {
    const b = mode === 'kampung' && !S.letak ? pilihan : null;
    if (!garisPilih) { garisPilih = new T.Mesh(geoDatar, new T.MeshBasicMaterial({ map: txGaris, transparent: true, depthWrite: false })); garisPilih.renderOrder = 3; adegan.add(garisPilih); }
    garisPilih.visible = !!b;
    if (b) { const s = B[b.t].s; garisPilih.scale.set(s + .35, 1, s + .35); garisPilih.position.set(b.x + s / 2, .045, b.y + s / 2); garisPilih.material.opacity = .55 + .4 * Math.sin(ts * 5); }
    // hantu letak
    const L = mode === 'kampung' ? S.letak : null;
    if (!L) { if (hantu) hantu.visible = false; return; }
    const lv = L.b ? Math.max(1, L.b.lv) : 1, k = `${L.t}:${lv}`;
    if (!hantu || hantu.userData.k !== k) {
      if (hantu) adegan.remove(hantu);
      hantu = new T.Group(); hantu.userData.k = k;
      const tapak = new T.Mesh(geoDatar, new T.MeshBasicMaterial({ color: 0x5ae65a, transparent: true, opacity: .5, depthWrite: false })); tapak.position.y = .04; tapak.renderOrder = 3;
      const model = new T.Mesh(L.t === 'tembok' ? modelKota(lv, 0) : modelBangunan(L.t, lv), MAT_HANTU);
      hantu.add(tapak, model); hantu.userData.tapak = tapak; adegan.add(hantu);
    }
    const s = B[L.t].s, ok = bolehLetak(L.t, L.x, L.y, L.b);
    hantu.visible = true; hantu.position.set(L.x + s / 2, Math.sin(ts * 6) * .03 + .05, L.y + s / 2);
    hantu.userData.tapak.scale.set(s, 1, s); hantu.userData.tapak.material.color.set(ok ? 0x5ae65a : 0xf04632);
  }
  function animasiDunia(ts) {
    const p = laut.geometry.attributes.position, a = lautAsal;
    for (let i = 0; i < p.count; i++) { const x = a[i * 3], z = a[i * 3 + 2]; p.array[i * 3 + 1] = a[i * 3 + 1] + Math.sin(x * .55 + ts * 1.2) * .07 + Math.cos(z * .8 + ts * .9 + x * .2) * .06; }
    p.needsUpdate = true; laut.geometry.computeVertexNormals();
    buih.material.opacity = .32 + Math.sin(ts * 1.6) * .14; buih.scale.z = .3 + Math.sin(ts * 1.6) * .08;
    const px = ((ts * .45) % (G + 60)) - 30;
    perahu.position.set(px, -.28 + Math.sin(ts * 1.7) * .05, G + 10.5); perahu.rotation.z = Math.sin(ts * 1.3) * .05; perahu.rotation.x = Math.sin(ts * 1.1) * .04;
  }

  /* ---------- kamera ---------- */
  function kemaskiniKamera() {
    const d = JARAK, tx = cam.x, tz = cam.y, vh = VH0 / cam.z / 2, vw = vh * W / Math.max(1, H);
    if (kamera.top !== vh || kamera.right !== vw) { kamera.top = vh; kamera.bottom = -vh; kamera.left = -vw; kamera.right = vw; kamera.updateProjectionMatrix(); }
    kamera.position.set(tx + d * Math.cos(EL) * Math.sin(AZ), d * Math.sin(EL), tz + d * Math.cos(EL) * Math.cos(AZ));
    kamera.lookAt(tx, 0, tz); kamera.updateMatrixWorld();
  }

  /* ---------- API ---------- */
  function mula(kanvas) {
    R = new T.WebGLRenderer({ canvas: kanvas, antialias: true, powerPreference: 'high-performance' });
    R.outputEncoding = T.sRGBEncoding; R.toneMapping = T.NoToneMapping;
    R.shadowMap.enabled = true; R.shadowMap.type = T.PCFSoftShadowMap;
    adegan = new T.Scene();
    const latar = new T.Color('#4f9f2e').convertSRGBToLinear();
    adegan.background = latar; adegan.fog = new T.Fog(latar, 150, 300);
    kamera = new T.OrthographicCamera(-1, 1, 1, -1, 1, 400);
    adegan.add(new T.HemisphereLight(new T.Color('#eaf6ff').convertSRGBToLinear(), new T.Color('#6a9a3a').convertSRGBToLinear(), .72));
    adegan.add(new T.AmbientLight(new T.Color('#fff1da').convertSRGBToLinear(), .14));
    mentari = new T.DirectionalLight(new T.Color('#fff0cf').convertSRGBToLinear(), .95);
    mentari.position.set(G / 2 - 13, 26, G / 2 + 7); mentari.target.position.set(G / 2, 0, G / 2);
    mentari.castShadow = true; mentari.shadow.mapSize.set(2048, 2048);
    const c = mentari.shadow.camera; c.left = -24; c.right = 24; c.top = 24; c.bottom = -24; c.near = 1; c.far = 80;
    mentari.shadow.bias = -.0006; mentari.shadow.normalBias = .02; mentari.shadow.radius = 5;
    adegan.add(mentari, mentari.target);
    binaDunia();
  }
  function saiz(w, h, dpr) { W = w; H = h; R.setPixelRatio(Math.min(dpr, 2)); R.setSize(w, h, false); kamera.top = 0; kemaskiniKamera(); }
  function render(ts) {
    kemaskiniKamera();
    animasiDunia(ts);
    segerakBangunan(ts); segerakUnit(ts); segerakPerang(ts); segerakPilih(ts);
    R.render(adegan, kamera);
  }
  function skrinKeDunia(sx, sy) {
    kemaskiniKamera();
    v2.set(sx / W * 2 - 1, -(sy / H) * 2 + 1); ray.setFromCamera(v2, kamera);
    return ray.ray.intersectPlane(lantai, v3) ? [v3.x, v3.z] : [cam.x, cam.y];
  }
  function ke2D(x, y, h) { v3.set(x, h, y).project(kamera); return [(v3.x + 1) / 2 * W, (1 - v3.y) / 2 * H, v3.z < 1]; }
  function pilihDi(sx, sy) {
    kemaskiniKamera();
    v2.set(sx / W * 2 - 1, -(sy / H) * 2 + 1); ray.setFromCamera(v2, kamera);
    const sasar = [];
    for (const g of objB.values()) if (g.visible) sasar.push(g.userData.d.st);
    const kena = ray.intersectObjects(sasar, false)[0];
    if (kena) return kena.object.userData.b;
    const [gx, gy] = skrinKeDunia(sx, sy);
    const sen = sumberB();
    for (let i = sen.length - 1; i >= 0; i--) { const b = sen[i], s = B[b.t].s; if (gx >= b.x && gx < b.x + s && gy >= b.y && gy < b.y + s) return b; }
    return null;
  }
  const tinggi = (t, lv) => t === 'tembok' ? .9 : modelBangunan(t, Math.max(1, lv)).boundingBox.max.y + TAPAK_H;
  const tinggiUnit = t => modelUnit(t).boundingBox.max.y * SKALA_UNIT;
  // gambar pratonton untuk kad dan kedai
  const foto = new Map();
  let adeganFoto = null, kameraFoto = null, rtFoto = null;
  function ambilFoto(jenis, t) {
    const k = jenis + t + (jenis === 'u' ? kulitAset(t) : ''); if (foto.has(k)) return foto.get(k);
    const w = 320, h = 256;
    if (!adeganFoto) {
      adeganFoto = new T.Scene();
      adeganFoto.add(new T.HemisphereLight(new T.Color('#e8f6ff').convertSRGBToLinear(), new T.Color('#6b8f3a').convertSRGBToLinear(), .8));
      const dl = new T.DirectionalLight(new T.Color('#fff0d2').convertSRGBToLinear(), 1.5); dl.position.set(-4, 8, 5); adeganFoto.add(dl);
      kameraFoto = new T.PerspectiveCamera(24, w / h, .1, 100);
      rtFoto = new T.WebGLRenderTarget(w, h); rtFoto.texture.encoding = T.sRGBEncoding;
    }
    const geo = jenis === 'u' ? modelUnit(t) : t === 'tembok' ? modelKota(1, 1) : modelBangunan(t, 1);
    const me = new T.Mesh(geo, MAT); adeganFoto.add(me);
    if (jenis === 'b' && B[t] && B[t].hero) { const f = new T.Mesh(modelUnit(B[t].hero), MAT); f.position.set(.1, .34, .2); f.rotation.y = -Math.PI / 4; me.add(f); }
    if (jenis === 'b' && B[t]) {
      if (POS_ISI[t]) { const f = new T.Mesh(modelIsi(t), MAT); f.position.set(...POS_ISI[t]); f.scale.set(.85, .8, .85); me.add(f); }
      if (t === 'telaga_minyak') { const f = new T.Mesh(modelPam(), MAT); f.position.set(-.3, 1.32, .1); me.add(f); }
      if (t === 'radar') { const f = new T.Mesh(modelPiring(), MAT); f.position.y = 1.55; f.rotation.y = -Math.PI / 4; me.add(f); }
      if (t === 'artileri') { const f = new T.Mesh(modelLaras(1), MAT); f.position.y = .4; f.rotation.y = -Math.PI / 4; me.add(f); }
      if (t === 'pelancar_roket') { const f = new T.Mesh(modelMortar(), MAT); f.position.y = .44; f.rotation.y = -Math.PI / 4; me.add(f); }
      if (t === 'pertahanan_udara') { const f = new T.Mesh(modelSAM(), MAT); f.position.y = .32; f.rotation.y = -Math.PI / 4; me.add(f); }
      if (t === 'menara_mesingan') { const f = new T.Mesh(modelUnit('infantri'), MAT); f.position.y = 2.09; f.rotation.y = -Math.PI / 4; me.add(f); }
    }
    if (jenis === 'u') { me.rotation.y = -Math.PI / 4 + .35; if (t === 'helikopter') { const f = new T.Mesh(modelRotor(), MAT); f.position.y = .62 * 1.1; f.rotation.y = .4; me.add(f); } }
    const bs = geo.boundingSphere, c = bs.center.clone(), d = bs.radius / Math.sin(12 * Math.PI / 180) * .95;
    kameraFoto.position.set(c.x + d * Math.cos(EL * .75) * Math.sin(AZ), c.y + d * Math.sin(EL * .75), c.z + d * Math.cos(EL * .75) * Math.cos(AZ)); kameraFoto.lookAt(c);
    const kabus = adegan.fog;
    R.setRenderTarget(rtFoto); R.setClearColor(0x000000, 0); R.clear(); R.render(adeganFoto, kameraFoto);
    const buf = new Uint8Array(w * h * 4); R.readRenderTargetPixels(rtFoto, 0, 0, w, h, buf); R.setRenderTarget(null); R.setClearColor(0x000000, 1);
    adeganFoto.remove(me); void kabus;
    const kv = document.createElement('canvas'); kv.width = w; kv.height = h; const x = kv.getContext('2d'), img = x.createImageData(w, h);
    for (let y = 0; y < h; y++) img.data.set(buf.subarray((h - 1 - y) * w * 4, (h - y) * w * 4), y * w * 4);
    x.putImageData(img, 0, 0);
    foto.set(k, kv); return kv;
  }
  return { mula, saiz, render, skrinKeDunia, ke2D, pilihDi, tinggi, tinggiUnit, terbang: t => TERBANG[t] || 0, foto: ambilFoto, tinggiTanah };
})();
