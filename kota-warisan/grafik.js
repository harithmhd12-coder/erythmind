/* Kota Warisan · grafik 3D.
   Dunia miniatur bergaya mainan atas three.js r128: model low-poly bersudut bulat dicantum menjadi satu mesh
   bagi setiap bangunan atau tentera, cahaya matahari hangat, bayang lembut, dan bayang sentuh sebagai AO.
   Modul ini hanya membaca keadaan permainan (S, BT, mode, pilihan) dan tidak mengubahnya. */
'use strict';
const G3 = (() => {
  const T = THREE;
  const FOV = 30, EL = 50 * Math.PI / 180, AZ = Math.PI / 4, D0 = 64;
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
      const k = g.attributes.position.count;
      pos.set(g.attributes.position.array, o * 3); nor.set(g.attributes.normal.array, o * 3);
      for (let i = 0; i < k; i++) { wr[(o + i) * 3] = c.r; wr[(o + i) * 3 + 1] = c.g; wr[(o + i) * 3 + 2] = c.b; }
      o += k; g.dispose();
    }
    const out = new T.BufferGeometry();
    out.setAttribute('position', new T.BufferAttribute(pos, 3)); out.setAttribute('normal', new T.BufferAttribute(nor, 3)); out.setAttribute('color', new T.BufferAttribute(wr, 3));
    out.computeBoundingBox(); out.computeBoundingSphere();
    return out;
  }

  /* ---------- palet ---------- */
  const K = {
    kayu: '#b97a44', kayuG: '#6e4425', kayuM: '#a0522d', tiang: '#5b3920', attap: '#d1a256', attapG: '#a8742f', merah: '#c8452f', merahD: '#a3222b',
    emas: '#ffc83a', emasG: '#d69b1c', putih: '#f6efe0', krim: '#f1dcb0', batu: '#cfc6b6', batuG: '#9b958c', tanah: '#b8895a', tanahG: '#8a6238',
    hijau: '#5fc040', hijauG: '#3f8f2e', biru: '#4aa9d6', kelabu: '#7d8790', hitam: '#2a2a2e', kulit: '#e2a67a', gangsa: '#d29a44', timah: '#b9c9d8',
  };

  /* ---------- model bangunan ---------- */
  function modelBangunan(t, lv) {
    return ingat(`B${t}:${lv}`, () => {
      const m = new Bina(), s = B[t].s;
      switch (t) {
        case 'istana': {
          const batu = lv >= 6 ? '#f1e9d8' : '#e0a768', kayu = lv >= 4 ? '#a9562e' : K.kayu, atap = lv >= 4 ? '#8e2f24' : K.attap, emas = K.emas;
          m.kotak(3.55, .32, 3.55, batu, 0, 0, 0, { r: .1 });
          m.kotak(1.2, .16, .55, gelap(batu, -.08), 0, 0, 1.92, { r: .05 });
          for (const px of [-1.05, 0, 1.05]) for (const pz of [-.75, .75]) m.sil(.075, .085, .5, K.tiang, px, .3, pz, { seg: 6 });
          m.kotak(2.55, .95, 1.85, kayu, 0, .78, 0, { r: .08 });
          for (const px of [-.85, 0, .85]) { m.kotak(.34, .44, .07, '#3b2414', px, 1.0, .93, { r: .03 }); if (lv >= 3) m.kotak(.42, .06, .09, emas, px, 1.46, .93, { r: .02 }); }
          for (const pz of [-.45, .45]) m.kotak(.07, .44, .34, '#3b2414', 1.28, 1.0, pz, { r: .03 });
          if (lv >= 2) { m.kotak(1.25, .62, .7, gelap(kayu, .1), 0, .32, 1.2, { r: .06 }); m.piramid(1.5, .95, .45, gelap(atap, .08), 0, .94, 1.22); }
          m.pelana(3.15, 2.45, 1.15, atap, 0, 1.72, 0);
          if (lv >= 3) for (const sz of [-1, 1]) m.kotak(3.15, .06, .06, emas, 0, 1.74, sz * 1.24, { r: .02 });
          if (lv >= 2) for (const sx of [-1, 1]) m.kon(.07, .55, emas, sx * 1.55, 2.78, 0, { rz: -sx * .55, seg: 6 });
          if (lv >= 3) { m.kotak(1.45, .56, 1.0, gelap(kayu, -.05), 0, 2.2, 0, { r: .05 }); m.pelana(1.85, 1.45, .75, gelap(atap, .06), 0, 2.76, 0); for (const sx of [-1, 1]) m.kon(.05, .4, emas, sx * .95, 3.4, 0, { rz: -sx * .55, seg: 6 }); }
          if (lv >= 5) { m.kotak(.62, .36, .55, kayu, 0, 3.2, 0, { r: .04 }); m.piramid(.95, .95, .6, gelap(atap, .12), 0, 3.56, 0); m.bola(.08, emas, 0, 4.2, 0); }
          if (lv >= 6) for (const [px, pz] of [[-1.62, 1.62], [1.62, 1.62], [1.62, -1.62]]) { m.sil(.09, .1, .5, batu, px, .32, pz); m.bola(.11, emas, px, .9, pz); }
          m.sil(.035, .035, 3.2, '#5a4030', -1.6, .3, -1.6, { seg: 6 });
          break;
        }
        case 'lombong_emas': {
          m.kotak(2.7, .14, 2.7, K.tanah, 0, 0, 0, { r: .1 });
          m.sil(.95, .85, .06, '#3b2413', 0, .1, 0, { seg: 10 });
          for (const sx of [-1, 1]) m.sil(.06, .07, 1.25, K.kayuG, sx * .9, .1, 0, { seg: 6 });
          m.kotak(1.95, .1, .12, K.kayu, 0, 1.3, 0, { r: .03 });
          m.sil(.015, .015, .6, '#3a2a1a', 0, .72, 0, { seg: 4 });
          m.sil(.12, .1, .16, K.kayuG, 0, .58, 0, { seg: 8 });
          m.kotak(.7, .28, .45, K.kayuG, .7, .14, .85, { r: .05 }); m.kotak(.58, .12, .34, K.emas, .7, .38, .85, { r: .05 });
          for (const sz of [-1, 1]) m.t(torusG(.1, .03, Math.PI * 2), '#3a2a1a', .5 + sz * .0, .12, .85 + sz * .24, {});
          if (lv >= 3) { m.kotak(.6, .26, .42, K.kayuG, -.85, .14, .85, { r: .05 }); m.kotak(.5, .1, .32, K.emas, -.85, .36, .85, { r: .05 }); }
          if (lv >= 5) { m.tiang(1.9, 1.9, .14, 1.4, K.kayuG, .05); m.piramid(2.3, 2.3, .55, K.attapG, 0, 1.52, 0); }
          break;
        }
        case 'sawah': {
          m.kotak(2.85, .16, 2.85, '#9a7445', 0, 0, 0, { r: .1 });
          m.kotak(2.55, .1, 2.55, '#6cb7d4', 0, .08, 0, { r: .06 });
          m.kotak(.12, .2, 2.6, '#9a7445', 0, .02, 0, { r: .05 });
          m.tiang(.6, .6, .14, .45, K.tiang, .04, -1.05, -1.05);
          m.kotak(.65, .16, .65, K.kayu, -1.05, .58, -1.05, { r: .04 }); m.piramid(.95, .95, .45, K.attap, -1.05, .74, -1.05);
          if (lv >= 3) { m.sil(.02, .02, .55, K.kayuG, 1.05, .1, 1.05, { seg: 4 }); m.kotak(.4, .04, .04, K.kayuG, 1.05, .48, 1.05); m.bola(.08, '#efe2c0', 1.05, .7, 1.05); m.kon(.12, .1, '#d8b56a', 1.05, .74, 1.05); }
          break;
        }
        case 'lombong_timah': {
          m.kotak(2.75, .12, 2.75, '#a89a85', 0, 0, 0, { r: .1 });
          m.kotak(1.6, .08, 1.2, '#7fc3dd', .3, .1, .6, { r: .1 });
          for (const [x, h] of [[-1.05, 1.15], [.95, .45]]) m.sil(.05, .06, h, K.kayuG, x, .1, -.55, { seg: 6 });
          m.kotak(2.2, .07, .32, K.kayu, -.05, .82, -.55, { rz: -.33, r: .02 });
          m.kotak(.5, .5, .5, K.kayuG, -1.0, .1, .9, { r: .06 });
          break;
        }
        case 'peti_emas': {
          m.kotak(2.5, .26, 2.5, K.batu, 0, 0, 0, { r: .08 });
          m.kotak(1.75, 1.0, 1.75, K.krim, 0, .26, 0, { r: .07 });
          for (const [x, z] of [[-.85, -.85], [.85, -.85], [-.85, .85], [.85, .85]]) m.kotak(.14, 1.02, .14, K.kayuG, x, .26, z, { r: .03 });
          m.kotak(.5, .62, .08, K.emas, 0, .28, .88, { r: .04 }); m.bola(.04, K.emasG, .12, .58, .93);
          m.piramid(2.3, 2.3, .95, K.merah, 0, 1.25, 0); m.bola(.09, K.emas, 0, 2.2, 0);
          break;
        }
        case 'jelapang': {
          m.tiang(1.5, 1.5, 0, .82, K.tiang, .08);
          for (const [x, z] of [[-.75, -.75], [.75, -.75], [-.75, .75], [.75, .75]]) m.sil(.13, .13, .05, '#d8cdb5', x, .55, z, { seg: 8 });
          m.kotak(1.75, .85, 1.75, '#dcb56c', 0, .82, 0, { r: .06 });
          for (let i = 1; i < 4; i++) m.kotak(1.78, .03, 1.78, '#b68b45', 0, .82 + i * .21, 0, { r: .01 });
          m.pelana(2.15, 2.25, 1.0, K.attapG, 0, 1.66, 0, { ry: Math.PI / 2 });
          m.kotak(.5, .06, .9, K.kayuG, .35, .55, 1.35, { rx: .6, r: .02 });
          break;
        }
        case 'gudang_timah': {
          m.kotak(2.4, 1.1, 2.4, '#9eabb8', 0, 0, 0, { r: .1 });
          m.kotak(2.55, .16, 2.55, '#6e7a86', 0, 1.1, 0, { r: .06 });
          m.kotak(.7, .7, .08, '#4b5560', 0, .02, 1.2, { r: .04 });
          m.kotak(.08, .7, .7, '#4b5560', 1.2, .02, 0, { r: .04 });
          break;
        }
        case 'bangsal_tukang': {
          m.tiang(1.1, 1.1, 0, .3, K.tiang, .05);
          m.kotak(1.25, .62, 1.25, K.kayu, 0, .3, 0, { r: .06 });
          m.kotak(.32, .42, .06, '#3b2414', .15, .32, .63, { r: .03 });
          m.pelana(1.55, 1.6, .7, K.attap, 0, .92, 0);
          m.kotak(.7, .05, .18, '#d6a96a', -.2, .08, .88, { r: .02 }); m.kotak(.7, .05, .18, '#d6a96a', -.2, .13, .88, { r: .02, ry: .15 });
          break;
        }
        case 'balai_tentera': {
          m.kotak(2.7, .18, 2.0, K.batu, 0, 0, 0, { r: .07 });
          m.tiang(2.2, 1.4, .18, .3, K.tiang, .06);
          m.kotak(2.35, .82, 1.5, K.kayuM, 0, .46, 0, { r: .07 });
          m.kotak(.42, .55, .07, '#3b2414', 0, .5, .77, { r: .03 });
          m.pelana(2.75, 2.0, .95, '#7a3a1c', 0, 1.27, 0);
          if (lv >= 4) for (const sx of [-1, 1]) m.kon(.06, .45, K.emas, sx * 1.38, 2.15, 0, { rz: -sx * .55, seg: 6 });
          for (let i = 0; i < 3; i++) { m.sil(.015, .015, 1.15, K.kayuG, -.7 + i * .22, .18, 1.1, { seg: 4, rz: .08 }); m.kon(.035, .13, '#e8e8e8', -.7 + i * .22 + .09, 1.32, 1.1); }
          m.sil(.13, .13, .03, K.merah, .7, .5, 1.05, { rx: Math.PI / 2, seg: 10 }); m.bola(.04, K.emas, .7, .5, 1.08);
          m.sil(.03, .03, 2.4, '#5a4030', 1.2, .18, -.85, { seg: 6 });
          break;
        }
        case 'kem': {
          m.sil(1.45, 1.5, .08, '#c9a06a', 0, 0, 0, { seg: 16 });
          const k = Math.min(4, 1 + Math.floor(lv / 2)), sudut = [[-.85, -.85], [.85, -.85], [-.85, .85], [.85, .85]];
          for (let i = 0; i < k; i++) { const [x, z] = sudut[i]; m.piramid(.82, .82, .72, i % 2 ? '#f0e2c2' : '#e6cf9d', x, .06, z); m.kotak(.2, .32, .02, '#6b4a2a', x + .2, .06, z + .42, { r: .005 }); }
          for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2; m.bola(.07, '#8c857a', Math.cos(a) * .25, .1, Math.sin(a) * .25, { d: 0, rata: true }); }
          m.sil(.04, .04, .45, K.kayuG, 0, .14, 0, { rz: Math.PI / 2.4, seg: 5 }); m.sil(.04, .04, .45, K.kayuG, 0, .14, 0, { rx: Math.PI / 2.4, seg: 5 });
          break;
        }
        case 'balai_ilmu': {
          m.tiang(1.8, 1.3, 0, .55, K.tiang, .07);
          m.kotak(2.05, .8, 1.5, '#9a5b2e', 0, .55, 0, { r: .07 });
          m.kotak(2.08, .06, 1.53, K.emas, 0, .95, 0, { r: .02 });
          m.kotak(.32, .42, .06, '#3b2414', -.45, .7, .76, { r: .03 }); m.kotak(.32, .42, .06, '#3b2414', .45, .7, .76, { r: .03 });
          m.pelana(2.3, 1.9, .95, '#3a2c24', 0, 1.35, 0);
          for (const sx of [-1, 1]) { m.kon(.17, .95, '#3a2c24', sx * 1.18, 1.75, 0, { rz: -sx * .75, seg: 6 }); m.bola(.05, K.emas, sx * 1.62, 2.38, 0); }
          break;
        }
        case 'balai_muafakat': {
          m.kotak(2.4, .32, 2.4, K.batu, 0, 0, 0, { r: .09 });
          m.kotak(.8, .14, .45, gelap(K.batu, -.08), 0, 0, 1.38, { r: .04 });
          m.tiang(1.75, 1.75, .32, .95, K.tiang, .08);
          m.kotak(1.6, .12, .05, K.kayuG, 0, .62, .88, { r: .02 });
          m.piramid(2.55, 2.55, 1.05, '#8a3b1e', 0, 1.25, 0);
          m.sil(.03, .03, 1.0, '#5a4030', 0, 2.25, 0, { seg: 6 });
          break;
        }
        case 'meriam_lela': {
          m.kotak(1.7, .3, 1.7, K.kayu, 0, 0, 0, { r: .1 });
          for (let i = -1; i <= 1; i++) m.kotak(1.72, .03, .04, K.kayuG, 0, .3, i * .5, { r: .01 });
          m.sil(.5, .55, .1, K.kayuG, 0, .3, 0, { seg: 12 });
          break;
        }
        case 'menara_sumpit': {
          const h = 1.95 + lv * .05;
          m.kotak(1.5, .14, 1.5, K.batu, 0, 0, 0, { r: .06 });
          m.tiang(1.1, 1.1, .14, h - .14, K.tiang, .07);
          for (const sz of [-1, 1]) m.kotak(1.1, .05, .05, K.kayuG, 0, h * .45, sz * .55, { rz: .5, r: .015 });
          for (const sx of [-1, 1]) m.kotak(.05, .05, 1.1, K.kayuG, sx * .55, h * .45, 0, { rx: .5, r: .015 });
          m.kotak(1.5, .15, 1.5, K.kayu, 0, h, 0, { r: .05 });
          for (const [x, z, w, d] of [[0, .72, 1.5, .06], [.72, 0, .06, 1.5], [0, -.72, 1.5, .06], [-.72, 0, .06, 1.5]]) m.kotak(w, .28, d, K.kayuG, x, h + .15, z, { r: .02 });
          m.tiang(1.3, 1.3, h + .15, .82, K.tiang, .04);
          m.piramid(1.75, 1.75, .6, K.attap, 0, h + .95, 0);
          break;
        }
        case 'meriam_besar': {
          m.sil(1.2, 1.3, .62, K.batu, 0, 0, 0, { seg: 10 });
          for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; m.kotak(.26, .22, .22, K.batu, Math.cos(a) * 1.08, .6, Math.sin(a) * 1.08, { ry: -a, r: .04 }); }
          m.sil(.55, .6, .12, K.batuG, 0, .6, 0, { seg: 12 });
          break;
        }
        case 'ranjau': {
          m.sil(.38, .4, .03, '#9a7445', 0, 0, 0, { seg: 8 });
          for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; m.kon(.035, .32, '#cdb46a', Math.cos(a) * .2, .02, Math.sin(a) * .2, { rx: Math.sin(a) * .3, rz: -Math.cos(a) * .3, seg: 5 }); }
          break;
        }
        case 'anjung_laksamana': case 'anjung_srikandi': {
          const tuah = t === 'anjung_laksamana';
          m.kotak(2.5, .34, 2.5, '#e3d2ad', 0, 0, 0, { r: .1 });
          m.kotak(.9, .16, .45, '#cbb88f', 0, 0, 1.42, { r: .04 });
          m.tiang(1.8, 1.8, .34, 1.2, K.tiang, .07);
          m.piramid(2.55, 2.55, .95, tuah ? '#e0a526' : '#a3283b', 0, 1.54, 0);
          m.bola(.1, K.emas, 0, 2.52, 0);
          break;
        }
      }
      void s;
      return m.geo();
    });
  }
  function modelKota(lv, mask) {
    return ingat(`W${lv}:${mask}`, () => {
      const m = new Bina(), batu = lv >= 4, w = lv >= 6 ? '#f3ecdc' : lv >= 4 ? '#c9c1b2' : lv >= 2 ? '#a66a36' : '#94612f';
      if (!batu) {
        m.sil(.11, .13, .72, w, 0, 0, 0, { seg: 7 }); m.kon(.11, .18, gelap(w, -.12), 0, .72, 0, { seg: 7 });
        if (mask & 1) { m.sil(.05, .05, 1, w, .5, .25, 0, { rz: Math.PI / 2, seg: 6 }); m.sil(.05, .05, 1, w, .5, .52, 0, { rz: Math.PI / 2, seg: 6 }); m.sil(.08, .09, .6, gelap(w, .06), .5, 0, 0, { seg: 6 }); m.kon(.08, .14, gelap(w, -.1), .5, .6, 0, { seg: 6 }); }
        if (mask & 2) { m.sil(.05, .05, 1, w, 0, .25, .5, { rx: Math.PI / 2, seg: 6 }); m.sil(.05, .05, 1, w, 0, .52, .5, { rx: Math.PI / 2, seg: 6 }); m.sil(.08, .09, .6, gelap(w, .06), 0, 0, .5, { seg: 6 }); m.kon(.08, .14, gelap(w, -.1), 0, .6, .5, { seg: 6 }); }
        if (lv >= 2) m.sil(.135, .135, .05, '#d8b35e', 0, .42, 0, { seg: 7 });
      } else {
        m.kotak(.44, .82, .44, gelap(w, .05), 0, 0, 0, { r: .09 });
        if (mask & 1) m.kotak(.78, .62, .32, w, .5, 0, 0, { r: .07 });
        if (mask & 2) m.kotak(.32, .62, .78, w, 0, 0, .5, { r: .07 });
        if (lv >= 6) m.bola(.08, K.emas, 0, .88, 0);
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
    const m = new Bina(), g = lv >= 4 ? '#e2ae4f' : K.gangsa;
    m.kotak(.5, .2, .42, K.kayuG, 0, 0, 0, { r: .05 });
    for (const sz of [-1, 1]) m.t(torusG(.13, .035, Math.PI * 2), '#3a2a1a', -.05, .13, sz * .24, {});
    m.sil(.1, .13, .95, g, .05, .32, 0, { rz: -Math.PI / 2 + .12, seg: 10 }); m.t(torusG(.1, .025, Math.PI * 2), gelap(g, -.15), .98, .44, 0, { ry: Math.PI / 2 });
    m.bola(.12, g, -.2, .3, 0);
    return m.geo();
  });
  const modelMortar = () => ingat('M', () => new Bina().sil(.34, .42, .38, '#55585e', 0, 0, 0, { seg: 10 }).sil(.24, .28, .75, K.hitam, .05, .2, 0, { rz: -.75, seg: 10 }).t(torusG(.25, .05, Math.PI * 2), '#3a3a40', .55, .68, 0, { ry: Math.PI / 2, rx: .8 }).geo());
  const modelIsi = t => ingat(`I${t}`, () => {
    const m = new Bina(), r = rng(t.length * 13);
    if (t === 'lombong_emas') for (let i = 0; i < 11; i++) m.bola(.07 + r() * .07, i % 3 ? K.emas : '#ffe58a', (r() - .5) * 1.2, 0, (r() - .5) * 1.2, { d: 0, rata: true });
    if (t === 'peti_emas') for (let i = 0; i < 7; i++) m.sil(.11, .11, .04, K.emas, -.6 + (i % 4) * .3, i < 4 ? 0 : .045, .1 + (i > 3 ? .05 : 0), { seg: 10 });
    if (t === 'jelapang') for (let i = 0; i < 5; i++) m.kotak(.32, .26, .3, '#f3ead5', -.7 + i * .36, 0, 0, { r: .1 });
    if (t === 'gudang_timah' || t === 'lombong_timah') for (let i = 0; i < 6; i++) m.kotak(.34, .11, .17, K.timah, -.45 + (i % 3) * .36, Math.floor(i / 3) * .12, 0, { r: .03 });
    return m.geo();
  });
  const modelTanaman = () => ingat('padi', () => {
    const m = new Bina();
    for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) if (!(i === 0 && j === 0) && !(i === 1 && j === 0) && !(i === 0 && j === 1)) m.kon(.12, .3 + ((i * 7 + j * 3) % 4) * .03, '#ffffff', -1.0 + i * .4 + (j % 2) * .06, 0, -1.0 + j * .4, { seg: 5 });
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
  function modelUnit(t) {
    return ingat('U' + t, () => {
      const m = new Bina(), kulit = K.kulit;
      const kaki = (w = '#3a2a22') => { m.sil(.038, .032, .15, w, 0, 0, -.05, { seg: 6 }); m.sil(.038, .032, .15, w, 0, 0, .05, { seg: 6 }); };
      const kepala = (y = .43, r = .115) => m.bola(r, kulit, 0, y, 0);
      switch (t) {
        case 'pendekar':
          kaki('#26262e'); m.sil(.085, .105, .2, '#26262e', 0, .13, 0); m.sil(.112, .112, .065, '#cf3b2c', 0, .13, 0); m.sil(.113, .113, .016, K.emas, 0, .195, 0);
          kepala(); m.kon(.11, .13, '#cf3b2c', -.01, .49, 0, { rz: -.35, seg: 6 }); m.sil(.105, .105, .025, K.emas, 0, .49, 0);
          m.kotak(.035, .035, .2, '#e6e6e6', .1, .18, .1, { rx: .5, r: .01 }); m.bola(.025, K.emasG, .1, .16, .03);
          break;
        case 'pemanah':
          kaki('#3a2a22'); m.sil(.085, .1, .2, '#2f9150', 0, .13, 0); m.sil(.1, .1, .04, '#7a5230', 0, .14, 0);
          kepala(); m.sil(.118, .118, .035, K.emas, 0, .47, 0);
          m.sil(.012, .012, .72, '#8a6338', .06, .34, .05, { rz: -Math.PI / 2 + .1, seg: 5 });
          break;
        case 'tukang':
          kaki('#3a2a22'); m.sil(.085, .1, .2, '#3f74b8', 0, .13, 0); kepala(); m.kon(.2, .08, '#ecd197', 0, .5, 0, { seg: 10 });
          m.sil(.012, .012, .22, '#7a5230', .1, .18, .08, { rz: -1.1, seg: 4 }); m.kotak(.06, .05, .1, '#9aa3ab', .2, .26, .08, { r: .01 });
          break;
        case 'gajah': {
          for (const [x, z] of [[-.17, -.13], [-.17, .13], [.17, -.13], [.17, .13]]) m.sil(.075, .07, .32, '#77808a', x, 0, z, { seg: 8 });
          m.bola(.3, '#8a939d', 0, .44, 0, { sx: 1.25, sy: .9, sz: .85 });
          m.bola(.19, '#8f98a2', .36, .54, 0);
          for (const sz of [-1, 1]) m.bola(.14, '#7d8691', .28, .55, sz * .15, { sx: .35 });
          m.sil(.06, .04, .3, '#8a939d', .5, .22, 0, { rz: .25, seg: 7 }); m.sil(.04, .035, .14, '#8a939d', .54, .1, 0, { rz: -.35, seg: 6 });
          for (const sz of [-1, 1]) m.kon(.025, .18, '#fbf4e2', .48, .4, sz * .07, { rz: -Math.PI / 2 - .4, seg: 5 });
          m.kotak(.5, .04, .52, K.emas, -.03, .68, 0, { r: .015 });
          m.kotak(.34, .18, .32, '#b3262c', -.05, .7, 0, { r: .04 }); m.piramid(.42, .4, .2, K.emas, -.05, .88, 0);
          m.bola(.07, kulit, .05, .95, 0);
          break;
        }
        case 'pemecah':
          kaki('#3a2a22'); m.sil(.085, .1, .2, '#7a4d2a', 0, .13, 0); kepala(); m.sil(.12, .12, .03, '#26262e', 0, .48, 0);
          m.sil(.11, .11, .26, '#8a5a2e', 0, .6, 0, { rx: Math.PI / 2, seg: 10 }); m.sil(.115, .115, .025, '#3a2a1a', 0, .6, .07, { rx: Math.PI / 2, seg: 10 }); m.sil(.115, .115, .025, '#3a2a1a', 0, .6, -.07, { rx: Math.PI / 2, seg: 10 });
          m.bola(.035, '#ffb020', .06, .74, 0, { d: 0 });
          break;
        case 'hulubalang':
          m.sil(.05, .04, .16, '#2a1a10', 0, 0, -.06, { seg: 6 }); m.sil(.05, .04, .16, '#2a1a10', 0, 0, .06, { seg: 6 });
          m.kotak(.06, .24, .24, '#a3222b', -.08, .12, 0, { r: .03 }); m.sil(.11, .13, .26, '#e1a92e', 0, .14, 0);
          kepala(.5, .125); m.bola(.13, '#e1a92e', 0, .53, 0, { sy: .6 }); m.kon(.03, .1, '#e1a92e', 0, .6, 0, { seg: 5 });
          m.sil(.014, .014, 1.0, '#7a5230', .12, 0, .13, { seg: 5 }); m.kon(.035, .12, '#e8e8e8', .12, 1.0, .13, { seg: 5 });
          m.sil(.14, .14, .03, '#8a5a2e', .05, .28, -.15, { rx: Math.PI / 2, seg: 12 }); m.bola(.035, K.emas, .05, .28, -.17);
          break;
        case 'tuah':
          kaki('#2a2a2e'); m.sil(.09, .11, .22, '#f4efe3', 0, .14, 0); m.sil(.115, .115, .07, '#8f1d2a', 0, .14, 0); m.sil(.116, .116, .018, K.emas, 0, .21, 0);
          kepala(.45, .12); m.kon(.12, .14, '#8f1d2a', -.01, .51, 0, { rz: -.35, seg: 6 }); m.sil(.11, .11, .03, K.emas, 0, .51, 0);
          m.kotak(.04, .04, .26, '#ffe27a', .11, .2, .11, { rx: .5, r: .012 }); m.bola(.03, K.emas, .11, .18, .02);
          break;
        case 'fatimah':
          m.kon(.15, .36, '#9e2433', 0, .02, 0, { seg: 10 }); m.sil(.08, .095, .16, '#9e2433', 0, .24, 0);
          m.sil(.152, .152, .03, K.emas, 0, .06, 0, { seg: 10 }); kepala(.47, .11); m.bola(.12, '#e8b53a', -.01, .49, 0, { sy: .9, sx: .9 }); m.bola(.11, kulit, .025, .46, 0);
          m.t(torusG(.17, .012, Math.PI), '#7a5230', .1, .3, .12, { rz: -Math.PI / 2 });
          break;
      }
      const g = m.geo();
      const sk = { tuah: 1.25, fatimah: 1.2, hulubalang: 1.15, gajah: 1 }[t] || 1;
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
    const N = 80, SZ = 150, g0 = new T.PlaneGeometry(SZ, SZ, N, N); g0.rotateX(-Math.PI / 2); g0.translate(G / 2, 0, G / 2 + 12);
    const p = g0.attributes.position, wr = new Float32Array(p.count * 3), c = new T.Color();
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i), h = tinggiTanah(x, z), n = bunyi(x * 1.7, z * 1.7);
      p.setY(i, h);
      let w;
      if (z > G + 1.7) w = h > -.15 ? (n > .5 ? '#f2dca3' : '#ead19a') : '#d9c690';
      else if (x > -1 && x < G + 1 && z > -1 && z < G + 1) w = n > .5 ? '#5fb833' : '#58ae2f';
      else w = h > .9 ? (n > .5 ? '#3f8a26' : '#377f22') : (n > .5 ? '#52a92e' : '#4a9e2a');
      c.set(w).convertSRGBToLinear(); wr[i * 3] = c.r; wr[i * 3 + 1] = c.g; wr[i * 3 + 2] = c.b;
    }
    g0.setAttribute('color', new T.BufferAttribute(wr, 3));
    const g = g0.toNonIndexed(); g.computeVertexNormals();
    const tanah = new T.Mesh(g, new T.MeshStandardMaterial({ vertexColors: true, roughness: .95 })); tanah.receiveShadow = true; adegan.add(tanah);
    // medan kota bertekstur petak halus
    const txMedan = kanvasTx(G * 8, G * 8, (x, w) => {
      for (let i = 0; i < G; i++) for (let j = 0; j < G; j++) { x.fillStyle = (i + j) % 2 ? '#68c23a' : '#61b935'; x.fillRect(i * 8, j * 8, 8, 8); }
      const r = rng(5); for (let k = 0; k < 900; k++) { x.fillStyle = r() < .5 ? 'rgba(255,255,200,.10)' : 'rgba(30,80,10,.10)'; x.fillRect(r() * w, r() * w, 2, 2); }
    });
    txMedan.magFilter = T.LinearFilter; txMedan.anisotropy = 4;
    const medan = new T.Mesh(geoDatar, new T.MeshStandardMaterial({ map: txMedan, roughness: .95 }));
    medan.scale.set(G, 1, G); medan.position.set(G / 2, .012, G / 2); medan.receiveShadow = true; adegan.add(medan);
    const bm = new Bina(), tebal = .28;
    bm.kotak(G + tebal * 2, .06, tebal, '#c49a5c', G / 2, 0, -tebal / 2, { r: .03 }); bm.kotak(G + tebal * 2, .06, tebal, '#c49a5c', G / 2, 0, G + tebal / 2, { r: .03 });
    bm.kotak(tebal, .06, G, '#c49a5c', -tebal / 2, 0, G / 2, { r: .03 }); bm.kotak(tebal, .06, G, '#c49a5c', G + tebal / 2, 0, G / 2, { r: .03 });
    const sempadan = new T.Mesh(bm.geo(), MAT); sempadan.receiveShadow = true; adegan.add(sempadan);
    // laut
    const gl = new T.PlaneGeometry(240, 80, 60, 20); gl.rotateX(-Math.PI / 2); gl.translate(G / 2, -.32, G + 3.4 + 40);
    laut = new T.Mesh(gl.toNonIndexed(), new T.MeshStandardMaterial({ color: new T.Color('#1fa6d2').convertSRGBToLinear(), roughness: .22, metalness: .05, transparent: true, opacity: .86, flatShading: true }));
    lautAsal = Float32Array.from(laut.geometry.attributes.position.array); laut.receiveShadow = true; adegan.add(laut);
    buih = new T.Mesh(geoDatar, new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .45, depthWrite: false }));
    buih.scale.set(240, 1, .35); buih.position.set(G / 2, -.25, G + 4.5); adegan.add(buih);
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
    pm.kotak(2.2, .3, .55, '#7a4a26', 0, 0, 0, { r: .12 }); pm.kon(.27, .5, '#7a4a26', 1.2, .02, 0, { rz: -Math.PI / 2, seg: 6, sy: 1 }); pm.kon(.27, .5, '#7a4a26', -1.2, .02, 0, { rz: Math.PI / 2, seg: 6 });
    pm.kotak(2.0, .05, .45, '#c89a5c', 0, .28, 0, { r: .02 }); pm.sil(.035, .035, 1.9, '#5a3a20', 0, .3, 0, { seg: 6 });
    pm.kotak(.06, 1.25, 1.0, '#f3e7cc', .12, .7, 0, { ry: Math.PI / 2 + .2, r: .02 }); pm.kotak(.05, .5, .6, '#cf3b2c', -.75, .45, 0, { ry: Math.PI / 2, r: .02 });
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
    const st = new T.Mesh(mati ? modelRuntuh(s) : modelBangunan(b.t, Math.max(1, b.lv)), MAT);
    st.castShadow = true; st.receiveShadow = true; st.userData.b = b; g.add(st); d.st = st;
    if (!mati) {
      const lv = Math.max(1, b.lv);
      if (b.t === 'meriam_lela') { d.laras = new T.Mesh(modelLaras(lv), MAT); d.laras.position.y = .4; d.laras.castShadow = true; g.add(d.laras); }
      if (b.t === 'meriam_besar') { d.laras = new T.Mesh(modelMortar(), MAT); d.laras.position.y = .72; d.laras.castShadow = true; g.add(d.laras); }
      if (['lombong_emas', 'peti_emas', 'jelapang', 'gudang_timah', 'lombong_timah'].includes(b.t)) {
        d.isi = new T.Mesh(modelIsi(b.t), MAT); d.isi.castShadow = true;
        const pos = { lombong_emas: [0, .12, 0], peti_emas: [0, .27, 1.05], jelapang: [-.05, 0, 1.45], gudang_timah: [0, 1.26, 0], lombong_timah: [-.5, .12, -1.0] }[b.t];
        d.isi.position.set(...pos); g.add(d.isi);
      }
      if (b.t === 'sawah') { const mt = MAT.clone(); d.tanaman = new T.Mesh(modelTanaman(), mt); d.tanaman.userData.matSendiri = true; d.tanaman.position.y = .14; d.tanaman.castShadow = true; g.add(d.tanaman); }
      if (b.t === 'kem') { d.api = new T.Mesh(modelApi(), new T.MeshStandardMaterial({ vertexColors: true, emissive: 0xff7a20, emissiveIntensity: .9 })); d.api.userData.matSendiri = true; d.api.position.y = .12; g.add(d.api); }
      const bnd = { istana: [-1.6, 3.5, -1.6, lv >= 7 ? 'jalur' : lv >= 4 ? '#f4c20d' : '#b8322f'], balai_tentera: [1.2, 2.58, -.85, '#c0392b'], balai_muafakat: [0, 3.25, 0, '#2f9a3a'] }[b.t];
      if (bnd) { d.bendera = new T.Mesh(geoBendera, teksturBendera(bnd[3])); d.bendera.position.set(bnd[0], bnd[1], bnd[2]); d.bendera.castShadow = true; g.add(d.bendera); }
      if (b.t === 'menara_sumpit') { d.figur = new T.Mesh(modelUnit('pemanah'), MAT); d.figur.position.y = 2.1 + lv * .05; d.figur.castShadow = true; g.add(d.figur); }
      if (B[b.t].hero) { d.figur = new T.Mesh(modelUnit(B[b.t].hero), MAT); d.figur.position.set(.1, .34, .2); d.figur.castShadow = true; g.add(d.figur); }
    }
    g.position.set(b.x + s / 2, 0, b.y + s / 2);
    g.userData = { d, kunci: kunciB(b, mati) };
    return g;
  }
  const kunciB = (b, mati) => `${b.t}:${Math.max(1, b.lv)}:${mati ? 1 : 0}`;
  const mtT = new T.Matrix4();
  function kemaskiniTembok(senarai, perang) {
    const kira = new Map(), peta = new Set();
    for (const b of senarai) if (b.t === 'kota' && !(perang && b.mati)) peta.add(b.x + ',' + b.y);
    for (const b of senarai) {
      if (b.t !== 'kota') continue;
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
    const perang = mode === 'perang' && BT, senarai = perang ? BT.blds : S.bld;
    if (senarai !== sumberLalu) { for (const g of objB.values()) buang(g); objB.clear(); sumberLalu = senarai; }
    const ada = new Set();
    for (const b of senarai) {
      if (b.t === 'kota') continue;
      if (b.t === 'ranjau' && perang) continue;
      const mati = perang && b.mati;
      let g = objB.get(b.id);
      if (g && g.userData.kunci !== kunciB(b, mati)) { buang(g); g = null; }
      if (!g) { g = binaKumpulan(b, mati); objB.set(b.id, g); adegan.add(g); }
      ada.add(b.id);
      const s = B[b.t].s, pindah = S.letak && !S.letak.baru && S.letak.b === b;
      g.visible = !pindah;
      g.position.set(b.x + s / 2 + (perang && b.kena > 0 ? (Math.random() - .5) * .08 : 0), 0, b.y + s / 2);
      const d = g.userData.d;
      if (d.laras) d.laras.rotation.y = -(b.sudut ?? Math.PI / 4) + (b.t === 'meriam_lela' ? 0 : 0);
      if (d.laras && b.kilat > 0) d.laras.position.x = -Math.cos(b.sudut) * .06; else if (d.laras) d.laras.position.x = 0;
      let isi = 0;
      if (B[b.t].hasil) isi = perang ? (b.lootBaki ? .7 : 0) : b.store / capPengumpul(b);
      else if (B[b.t].simpan) isi = perang ? (b.lootBaki ? (b.lootBaki.emas + b.lootBaki.beras + b.lootBaki.timah) / Math.max(1, b.lootJum) : 0) : S.res[B[b.t].simpan] / Math.max(1, capSumber(B[b.t].simpan));
      if (d.isi) { const f = clamp(isi, 0, 1); d.isi.visible = f > .04; d.isi.scale.set(.5 + f * .5, .35 + f * .65, .5 + f * .5); }
      if (d.tanaman) { const f = clamp(isi * 1.1, 0, 1); d.tanaman.material.color.set(campur('#59b43c', '#f0c94a', Math.round(f * 16) / 16)).convertSRGBToLinear(); d.tanaman.scale.y = .6 + f * .5; }
      if (d.api) { const f = 1 + Math.sin(ts * 13 + b.id) * .12 + Math.sin(ts * 21) * .06; d.api.scale.set(f, f * 1.1, f); }
      if (d.bendera) { d.bendera.rotation.y = Math.sin(ts * 2.4 + b.id) * .35 - .4; d.bendera.scale.x = .85 + Math.sin(ts * 4.1 + b.id) * .12; }
      if (d.figur) {
        d.figur.visible = !(B[b.t].hero && (perang || b.busy || b.lv < 1));
        if (b.t === 'menara_sumpit') d.figur.rotation.y = -(b.sudut ?? Math.PI / 4);
        else d.figur.rotation.y = -Math.PI / 4 + Math.sin(ts * .7 + b.id) * .4;
      }
      // perancah
      const sibuk = !perang && (b.busy || b.lv === 0);
      if (sibuk && !d.perancah) { d.perancah = new T.Mesh(modelPerancah(s), MAT); d.perancah.castShadow = true; g.add(d.perancah); }
      if (!sibuk && d.perancah) { g.remove(d.perancah); d.perancah = null; }
    }
    for (const [id, g] of objB) if (!ada.has(id)) { buang(g); objB.delete(id); }
    kemaskiniTembok(senarai, perang);
  }
  function arahKe(mesh, dx, dz) { if (Math.abs(dx) + Math.abs(dz) > 1e-4) mesh.rotation.y = Math.atan2(-dz, dx); }
  function meshUnit(t) { const m = new T.Mesh(modelUnit(t), MAT); m.castShadow = true; const a = meshAO(t === 'gajah' ? 1.1 : .55); a.position.y = .025; m.add(a); m.userData.t = t; return m; }
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
      const bob = u.bergerak ? Math.abs(Math.sin(u.langkah)) * .06 : 0, terkam = u.serang > 0 ? Math.sin(u.serang * 12) * .08 : 0;
      m.position.set(u.x + Math.cos(-m.rotation.y) * terkam, bob, u.y + Math.sin(-m.rotation.y) * terkam);
      const k = u.kena > 0 ? 1.12 : 1, au = u.aura ? 1.15 : 1; m.scale.setScalar(k * au);
    }
    for (const [u, m] of unitObj) if (!hidup.has(u)) { adegan.remove(m); unitObj.delete(u); }
    // kampung: tentera di Medan Kawad dan tukang
    const mahu = [];
    if (!perang) {
      for (const u of tenteraKem()) mahu.push({ t: u.t, x: u.x, y: u.y, menghadap: [u.kx - u.x, u.ky - u.y], bob: Math.abs(Math.sin(ts * 2 + u.x * 3)) * .02 });
      let lapang = tukangLapang();
      for (const b of S.bld) {
        const s = B[b.t].s;
        if (b.busy || b.lv === 0) mahu.push({ t: 'tukang', x: b.x + s + .15, y: b.y + s / 2 + .2, menghadap: [-1, 0], tukul: true, id: b.id });
        else if (b.t === 'bangsal_tukang' && lapang-- > 0) mahu.push({ t: 'tukang', x: b.x + s + .05, y: b.y + s - .1, menghadap: [1, 1], bob: 0 });
      }
    }
    while (unitKem.length < mahu.length) { const m = meshUnit('tukang'); unitKem.push(m); adegan.add(m); }
    unitKem.forEach((m, i) => {
      const w = mahu[i]; m.visible = !!w; if (!w) return;
      if (m.userData.t !== w.t) { m.geometry = modelUnit(w.t); m.userData.t = w.t; m.children[0].scale.setScalar(w.t === 'gajah' ? 1.1 : .55); }
      arahKe(m, w.menghadap[0], w.menghadap[1]);
      m.position.set(w.x, w.bob || 0, w.y);
      m.rotation.z = w.tukul ? Math.max(0, Math.sin(ts * 9 + w.id)) * -.35 : 0;
    });
  }
  const MAT_PELURU = new T.MeshStandardMaterial({ color: 0x1d1d22, roughness: .4, metalness: .3 });
  const MAT_DAMAK = new T.MeshStandardMaterial({ color: new T.Color('#efe2b8').convertSRGBToLinear(), roughness: .7 });
  const MAT_PANAH = new T.MeshStandardMaterial({ color: new T.Color('#ffd23a').convertSRGBToLinear(), roughness: .5, emissive: 0x553300 });
  const geoPeluru = new T.IcosahedronGeometry(.09, 1), geoBom = new T.IcosahedronGeometry(.17, 1);
  const geoDamak = (() => { const g = new T.CylinderGeometry(.012, .012, .42, 4); g.rotateZ(Math.PI / 2); return g; })();
  function segerakPerang(ts) {
    bingkai++;
    const perang = mode === 'perang' && BT;
    if (perang) for (const p of BT.proj) {
      let m = projObj.get(p);
      if (!m) { m = new T.Mesh(p.j === 'bom' ? geoBom : p.j === 'peluru' ? geoPeluru : geoDamak, p.j === 'bom' || p.j === 'peluru' ? MAT_PELURU : p.j === 'panah' ? MAT_PANAH : MAT_DAMAK); m.castShadow = true; projObj.set(p, m); adegan.add(m); }
      const f = Math.min(1, p.t / p.dur), x = p.dari[0] + (p.ke[0] - p.dari[0]) * f, z = p.dari[1] + (p.ke[1] - p.dari[1]) * f;
      let y = (p.dari[2] + (p.ke[2] - p.dari[2]) * f) * .8; if (p.j === 'bom') y += 4 * 3 * f * (1 - f);
      m.position.set(x, y, z);
      if (m.geometry === geoDamak) arahKe(m, p.ke[0] - p.dari[0], p.ke[1] - p.dari[1]);
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
        const w = z.jenis === 'ubat' ? '#7dff8a' : '#ff8ad8';
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
    else if (f.j === 'ranjau') for (let i = 0; i < 6; i++) { const a = i / 6 * 6.28; tambah(konG(.04, .4, 5), mat('#d8c27a'), Math.cos(a) * .22, 0, Math.sin(a) * .22); }
    else if (f.j === 'cincin') { const t = new T.Mesh(new T.TorusGeometry(1, .06, 6, 40), mat('#ffd65a', 1, '#ffb000')); t.rotation.x = -Math.PI / 2; t.userData.matSendiri = true; t.userData.geoSendiri = true; o.add(t); }
    o.position.set(f.x, 0, f.y);
    return o;
  }
  function kemaskiniKesan(o, f) {
    const k = clamp(f.t / f.dur, 0, 1);
    if (f.j === 'letup') { const r = (f.r || 1); o.children.forEach((c, i) => { if (i < 2) { c.scale.setScalar(r * (.4 + 1.4 * k)); c.material.opacity = 1 - k; } else { c.scale.setScalar(r * (.6 + 1.2 * k)); c.position.y = .5 + k * 1.4; c.material.opacity = .7 * (1 - k); } }); }
    else if (f.j === 'asap' || f.j === 'debu') { const c = o.children[0]; c.scale.setScalar(.6 + k * 1.6); c.position.y = .2 + k * .6; c.material.opacity = .75 * (1 - k); }
    else if (f.j === 'percik') o.children.forEach((c, i) => { const a = i * 1.26; c.position.set(Math.cos(a) * k * .45, .3 + Math.sin(k * 3) * .2, Math.sin(a) * k * .45); c.material.opacity = 1 - k; });
    else if (f.j === 'ranjau') o.children.forEach(c => { c.scale.y = Math.min(1, k * 5); c.material.opacity = 1 - k * k; });
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
      const model = new T.Mesh(L.t === 'kota' ? modelKota(lv, 0) : modelBangunan(L.t, lv), MAT_HANTU);
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
    const d = D0 / cam.z, tx = cam.x, tz = cam.y;
    kamera.position.set(tx + d * Math.cos(EL) * Math.sin(AZ), d * Math.sin(EL), tz + d * Math.cos(EL) * Math.cos(AZ));
    kamera.lookAt(tx, 0, tz); kamera.updateMatrixWorld();
  }

  /* ---------- API ---------- */
  function mula(kanvas) {
    R = new T.WebGLRenderer({ canvas: kanvas, antialias: true, powerPreference: 'high-performance' });
    R.outputEncoding = T.sRGBEncoding; R.toneMapping = T.NoToneMapping;
    R.shadowMap.enabled = true; R.shadowMap.type = T.PCFSoftShadowMap;
    adegan = new T.Scene();
    const langit = new T.Color('#a8dcec').convertSRGBToLinear();
    adegan.background = langit; adegan.fog = new T.Fog(langit, 95, 190);
    kamera = new T.PerspectiveCamera(FOV, 1, .5, 420);
    adegan.add(new T.HemisphereLight(new T.Color('#e4f3ff').convertSRGBToLinear(), new T.Color('#4f7a28').convertSRGBToLinear(), .58));
    adegan.add(new T.AmbientLight(new T.Color('#ffe9c8').convertSRGBToLinear(), .1));
    mentari = new T.DirectionalLight(new T.Color('#ffe6b8').convertSRGBToLinear(), 1.05);
    mentari.position.set(G / 2 - 13, 26, G / 2 + 7); mentari.target.position.set(G / 2, 0, G / 2);
    mentari.castShadow = true; mentari.shadow.mapSize.set(2048, 2048);
    const c = mentari.shadow.camera; c.left = -24; c.right = 24; c.top = 24; c.bottom = -24; c.near = 1; c.far = 80;
    mentari.shadow.bias = -.0006; mentari.shadow.normalBias = .02; mentari.shadow.radius = 3;
    adegan.add(mentari, mentari.target);
    binaDunia();
  }
  function saiz(w, h, dpr) { W = w; H = h; R.setPixelRatio(Math.min(dpr, 2)); R.setSize(w, h, false); kamera.aspect = w / h; kamera.updateProjectionMatrix(); }
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
    for (let i = S.bld.length - 1; i >= 0; i--) { const b = S.bld[i], s = B[b.t].s; if (gx >= b.x && gx < b.x + s && gy >= b.y && gy < b.y + s) return b; }
    return null;
  }
  const tinggi = (t, lv) => t === 'kota' ? .9 : modelBangunan(t, Math.max(1, lv)).boundingBox.max.y;
  const tinggiUnit = t => modelUnit(t).boundingBox.max.y;
  // gambar pratonton untuk kad dan kedai
  const foto = new Map();
  let adeganFoto = null, kameraFoto = null, rtFoto = null;
  function ambilFoto(jenis, t) {
    const k = jenis + t; if (foto.has(k)) return foto.get(k);
    const w = 320, h = 256;
    if (!adeganFoto) {
      adeganFoto = new T.Scene();
      adeganFoto.add(new T.HemisphereLight(new T.Color('#e8f6ff').convertSRGBToLinear(), new T.Color('#6b8f3a').convertSRGBToLinear(), .8));
      const dl = new T.DirectionalLight(new T.Color('#fff0d2').convertSRGBToLinear(), 1.5); dl.position.set(-4, 8, 5); adeganFoto.add(dl);
      kameraFoto = new T.PerspectiveCamera(24, w / h, .1, 100);
      rtFoto = new T.WebGLRenderTarget(w, h); rtFoto.texture.encoding = T.sRGBEncoding;
    }
    const geo = jenis === 'u' ? modelUnit(t) : t === 'kota' ? modelKota(1, 1) : modelBangunan(t, 1);
    const me = new T.Mesh(geo, MAT); adeganFoto.add(me);
    if (jenis === 'b' && B[t] && B[t].hero) { const f = new T.Mesh(modelUnit(B[t].hero), MAT); f.position.set(.1, .34, .2); f.rotation.y = -Math.PI / 4; me.add(f); }
    if (jenis === 'b' && B[t]) {
      if (['lombong_emas', 'peti_emas', 'jelapang', 'gudang_timah', 'lombong_timah'].includes(t)) { const f = new T.Mesh(modelIsi(t), MAT); f.position.set(...{ lombong_emas: [0, .12, 0], peti_emas: [0, .27, 1.05], jelapang: [-.05, 0, 1.45], gudang_timah: [0, 1.26, 0], lombong_timah: [-.5, .12, -1.0] }[t]); f.scale.set(.85, .8, .85); me.add(f); }
      if (t === 'sawah') { const mp = MAT.clone(); mp.color.set('#59b43c').convertSRGBToLinear(); const f = new T.Mesh(modelTanaman(), mp); f.position.y = .14; f.scale.y = .9; me.add(f); }
      if (t === 'meriam_lela') { const f = new T.Mesh(modelLaras(1), MAT); f.position.y = .4; f.rotation.y = -Math.PI / 4; me.add(f); }
      if (t === 'meriam_besar') { const f = new T.Mesh(modelMortar(), MAT); f.position.y = .72; f.rotation.y = -Math.PI / 4; me.add(f); }
      if (t === 'menara_sumpit') { const f = new T.Mesh(modelUnit('pemanah'), MAT); f.position.y = 2.15; f.rotation.y = -Math.PI / 4; me.add(f); }
    }
    if (jenis === 'u') me.rotation.y = -Math.PI / 4 + .35;
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
  return { mula, saiz, render, skrinKeDunia, ke2D, pilihDi, tinggi, tinggiUnit, foto: ambilFoto, tinggiTanah };
})();
