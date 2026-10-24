/* Malaysia Kita · peta 3D.
   Diorama Malaysia bergaya mainan atas three.js r128. Setiap negeri ialah satu kumpulan (tanah diekstrud,
   pokok, gunung, bandar, projek) yang boleh diangkat dan diwarnakan mengikut lensa data.
   Modul ini hanya membaca keadaan permainan (S, pilihanN, lensa) dan tidak mengubahnya. */
'use strict';
const PETA = (() => {
  const T = THREE, FOV = 30, EL = 55 * Math.PI / 180, D0 = 110, ATAS = .55;
  let R, adegan, kamera, mentari, W = 1, H = 1, kabus;
  const ray = new T.Raycaster(), v2 = new T.Vector2(), v3 = new T.Vector3(), lantai = new T.Plane(new T.Vector3(0, 1, 0), -ATAS);
  const xz = (lon, lat) => [(lon - LON0) * DEG, (LAT0 - lat) * DEG];
  const lin = h => new T.Color(h).convertSRGBToLinear();

  /* ---------- geometri asas & pembina model (dicantum, berwarna bucu) ---------- */
  const MAT = new T.MeshStandardMaterial({ vertexColors: true, roughness: .8 });
  const simpanG = new Map(), ingat = (k, f) => { let g = simpanG.get(k); if (!g) { g = f(); simpanG.set(k, g); } return g; }, f3 = n => (+n).toFixed(3);
  function haluskan(g, darjah) {
    g = g.index ? g.toNonIndexed() : g; g.computeVertexNormals();
    const p = g.attributes.position.array, n = g.attributes.normal.array, kira = p.length / 3, peta = new Map(), had = Math.cos(darjah * Math.PI / 180);
    for (let i = 0; i < kira; i++) { const k = Math.round(p[i * 3] * 1e3) + ',' + Math.round(p[i * 3 + 1] * 1e3) + ',' + Math.round(p[i * 3 + 2] * 1e3); let a = peta.get(k); if (!a) peta.set(k, a = []); a.push(i); }
    const out = new Float32Array(n.length);
    for (const a of peta.values()) for (const i of a) {
      let x = 0, y = 0, z = 0;
      for (const j of a) if (n[i * 3] * n[j * 3] + n[i * 3 + 1] * n[j * 3 + 1] + n[i * 3 + 2] * n[j * 3 + 2] >= had) { x += n[j * 3]; y += n[j * 3 + 1]; z += n[j * 3 + 2]; }
      const l = Math.hypot(x, y, z) || 1; out[i * 3] = x / l; out[i * 3 + 1] = y / l; out[i * 3 + 2] = z / l;
    }
    g.setAttribute('normal', new T.BufferAttribute(out, 3)); return g;
  }
  function kotakG(w, h, d, r) {
    r = Math.max(0, Math.min(r, w / 2 - .003, d / 2 - .003, h / 2 - .003));
    return ingat(`k${f3(w)},${f3(h)},${f3(d)},${f3(r)}`, () => {
      if (r < .004) { const g = new T.BoxGeometry(w, h, d); g.translate(0, h / 2, 0); return g; }
      const b = r * .6, rc = Math.max(.002, r * .5), sw = w - 2 * b, sd = d - 2 * b, x = -sw / 2, y = -sd / 2, s = new T.Shape();
      s.moveTo(x + rc, y); s.lineTo(x + sw - rc, y); s.quadraticCurveTo(x + sw, y, x + sw, y + rc); s.lineTo(x + sw, y + sd - rc);
      s.quadraticCurveTo(x + sw, y + sd, x + sw - rc, y + sd); s.lineTo(x + rc, y + sd); s.quadraticCurveTo(x, y + sd, x, y + sd - rc); s.lineTo(x, y + rc); s.quadraticCurveTo(x, y, x + rc, y);
      const g = new T.ExtrudeGeometry(s, { depth: Math.max(.001, h - 2 * b), bevelEnabled: true, bevelThickness: b, bevelSize: b, bevelSegments: 2, curveSegments: 2 });
      g.rotateX(-Math.PI / 2); g.translate(0, b, 0); return haluskan(g, 50);
    });
  }
  const pelanaG = (w, d, h) => ingat(`p${f3(w)},${f3(d)},${f3(h)}`, () => { const s = new T.Shape(); s.moveTo(-d / 2, 0); s.lineTo(d / 2, 0); s.lineTo(0, h); s.lineTo(-d / 2, 0); const g = new T.ExtrudeGeometry(s, { depth: w, bevelEnabled: false }); g.translate(0, 0, -w / 2); g.rotateY(Math.PI / 2); return haluskan(g, 30); });
  const piramidG = () => ingat('pir', () => { const g = new T.ConeGeometry(Math.SQRT1_2, 1, 4, 1); g.rotateY(Math.PI / 4); g.translate(0, .5, 0); return haluskan(g, 30); });
  const silG = (rt, rb, h, seg) => ingat(`s${f3(rt)},${f3(rb)},${f3(h)},${seg}`, () => { const g = new T.CylinderGeometry(rt, rb, h, seg, 1); g.translate(0, h / 2, 0); return g; });
  const konG = (r, h, seg) => ingat(`c${f3(r)},${f3(h)},${seg}`, () => { const g = new T.ConeGeometry(r, h, seg, 1); g.translate(0, h / 2, 0); return g; });
  const bolaG = (r, d) => ingat(`b${f3(r)},${d}`, () => new T.IcosahedronGeometry(r, d));
  const torusG = (r, t, a) => ingat(`t${f3(r)},${f3(t)},${f3(a)}`, () => new T.TorusGeometry(r, t, 6, 18, a));
  class Bina {
    constructor() { this.p = []; }
    t(g, w, x = 0, y = 0, z = 0, o = {}) { const m = new T.Matrix4().compose(new T.Vector3(x, y, z), new T.Quaternion().setFromEuler(new T.Euler(o.rx || 0, o.ry || 0, o.rz || 0, 'YXZ')), new T.Vector3(o.sx ?? 1, o.sy ?? 1, o.sz ?? 1)); this.p.push({ g, w, m, rata: o.rata }); return this; }
    kotak(w, h, d, c, x, y, z, o = {}) { return this.t(kotakG(w, h, d, o.r ?? Math.min(w, h, d) * .2), c, x, y, z, o); }
    sil(rt, rb, h, c, x, y, z, o = {}) { return this.t(silG(rt, rb, h, o.seg || 8), c, x, y, z, o); }
    kon(r, h, c, x, y, z, o = {}) { return this.t(konG(r, h, o.seg || 8), c, x, y, z, o); }
    bola(r, c, x, y, z, o = {}) { return this.t(bolaG(r, o.d ?? 1), c, x, y, z, o); }
    pelana(w, d, h, c, x, y, z, o = {}) { return this.t(pelanaG(w, d, h), c, x, y, z, o); }
    piramid(w, d, h, c, x, y, z, o = {}) { return this.t(piramidG(), c, x, y, z, { ...o, sx: w, sy: h, sz: d }); }
    geo() { return gabung(this.p); }
  }
  function gabung(bah) {
    let n = 0; const sen = [];
    for (const b of bah) { let g = b.g.index ? b.g.toNonIndexed() : b.g.clone(); if (!g.attributes.normal) g.computeVertexNormals(); g.applyMatrix4(b.m); if (b.rata) g.computeVertexNormals(); sen.push([g, lin(b.w)]); n += g.attributes.position.count; }
    const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), wr = new Float32Array(n * 3); let o = 0;
    for (const [g, c] of sen) { const k = g.attributes.position.count; pos.set(g.attributes.position.array, o * 3); nor.set(g.attributes.normal.array, o * 3); for (let i = 0; i < k; i++) { wr[(o + i) * 3] = c.r; wr[(o + i) * 3 + 1] = c.g; wr[(o + i) * 3 + 2] = c.b; } o += k; g.dispose(); }
    const out = new T.BufferGeometry(); out.setAttribute('position', new T.BufferAttribute(pos, 3)); out.setAttribute('normal', new T.BufferAttribute(nor, 3)); out.setAttribute('color', new T.BufferAttribute(wr, 3));
    out.computeBoundingBox(); out.computeBoundingSphere(); return out;
  }
  function rngP(seed) { let s = (seed >>> 0) || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }

  /* ---------- geometri poligon ---------- */
  function dalamPoli(lon, lat, poli) { let d = false; for (let i = 0, j = poli.length - 1; i < poli.length; j = i++) { const [xi, yi] = poli[i], [xj, yj] = poli[j]; if ((yi > lat) !== (yj > lat) && lon < (xj - xi) * (lat - yi) / (yj - yi) + xi) d = !d; } return d; }
  const dalamNegeri = (n, lon, lat) => n.poli.some(p => dalamPoli(lon, lat, p)) && !(n.lubang || []).some(p => dalamPoli(lon, lat, p));
  function bentuk(poli, lubang = []) {
    const s = new T.Shape(poli.map(([lo, la]) => new T.Vector2((lo - LON0) * DEG, (la - LAT0) * DEG)));
    for (const h of lubang) s.holes.push(new T.Path(h.map(([lo, la]) => new T.Vector2((lo - LON0) * DEG, (la - LAT0) * DEG))));
    return s;
  }
  function ekstrud(n, tinggi, bev) {
    const lubangUtk = p => (n.lubang || []).filter(h => dalamPoli(h[0][0], h[0][1], p));
    const g = new T.ExtrudeGeometry(n.poli.map(p => bentuk(p, lubangUtk(p))), { depth: tinggi, bevelEnabled: true, bevelThickness: bev, bevelSize: bev, bevelOffset: -bev, bevelSegments: 2, curveSegments: 1 });
    g.rotateX(-Math.PI / 2); g.translate(0, bev, 0);
    return haluskan(g, 40);
  }

  /* ---------- model projek & hiasan ---------- */
  const K = { kayu: '#b97a44', atap: '#d1453a', krim: '#f3e6c8', putih: '#f7f4ec', kaca: '#7fd4f0', biru: '#2f6fd1', emas: '#ffc83a', kelabu: '#8d96a0', gelap: '#3b4048', hijau: '#4caf3c', sawit: '#3f9c34' };
  function modelProjek(j, lv, k) {
    return ingat(`J${j}:${lv}:${k === 'SWK' && j === 'tenaga' ? 'h' : ''}`, () => {
      const m = new Bina(), L = Math.min(5, lv);
      switch (j) {
        case 'sekolah': m.kotak(.5, .2, .3, K.krim, 0, 0, 0); m.pelana(.54, .36, .14, '#c0392b', 0, .2, 0); m.sil(.008, .008, .4, '#666', .3, 0, .15, { seg: 4 }); m.kotak(.12, .07, .005, '#cc0001', .36, .33, .15, { r: 0 }); if (L >= 3) m.kotak(.3, .14, .22, K.krim, -.05, 0, -.3); if (L >= 4) m.kotak(.18, .08, .1, K.emas, .25, 0, .3, { r: .02 }); break;
        case 'hospital': m.kotak(.46, .26 + L * .04, .36, K.putih, 0, 0, 0); m.kotak(.48, .05, .38, '#5fb0e0', 0, .12, 0, { r: .01 }); m.kotak(.16, .04, .05, '#e03030', 0, .3 + L * .04, 0, { r: .01 }); m.kotak(.05, .04, .16, '#e03030', 0, .3 + L * .04, 0, { r: .01 }); if (L >= 3) m.kotak(.24, .4 + L * .04, .24, K.putih, -.25, 0, -.12); break;
        case 'rumah': { const w = ['#f7b267', '#7ec4cf', '#f4845f', '#b8e0a0', '#c9a7eb']; for (let i = 0; i < Math.min(5, 1 + L); i++) m.kotak(.15, .3 + (i % 3) * .1 + L * .04, .15, w[i], -.3 + (i % 3) * .2, 0, (i > 2 ? .2 : -.05)); break; }
        case 'tebatan': m.kotak(.6, .1, .1, '#8b98a6', 0, 0, -.12); m.kotak(.6, .03, .18, '#4aa6d6', 0, 0, .05, { r: .01 }); m.kotak(.1, .16 + L * .02, .14, '#a7b1bc', -.25, 0, -.12); m.kotak(.1, .16 + L * .02, .14, '#a7b1bc', .25, 0, -.12); break;
        case 'padi': for (let i = 0; i < 2 + L; i++) m.kotak(.2, .03, .2, i % 2 ? '#9ccc3c' : '#c8d84a', -.3 + (i % 3) * .22, 0, -.15 + Math.floor(i / 3) * .22, { r: .01 }); m.piramid(.1, .1, .08, '#c9a25b', .3, .06, .2); m.kotak(.06, .06, .06, K.kayu, .3, 0, .2, { r: .01 }); break;
        case 'pelancongan': m.kotak(.2, .12, .2, K.krim, -.1, 0, 0); m.piramid(.28, .28, .16, '#d1a256', -.1, .12, 0); m.sil(.02, .03, .35, '#9a7448', .2, 0, .1, { seg: 5 }); m.bola(.12, K.sawit, .2, .38, .1, { d: 0, rata: true }); if (L >= 3) { m.t(torusG(.18, .015, Math.PI * 2), '#ff6f91', .1, .32, -.2, {}); m.sil(.01, .01, .14, '#666', .1, 0, -.2, { seg: 4 }); } break;
        case 'pelabuhan': { const w = ['#e74c3c', '#2e86de', '#f1c40f', '#27ae60', '#e67e22']; for (let i = 0; i < 2 + L; i++) m.kotak(.14, .07, .08, w[i % 5], -.25 + (i % 4) * .15, Math.floor(i / 4) * .07, -.1); m.kotak(.04, .5, .04, '#f39c12', .3, 0, -.1, { r: .005 }); m.kotak(.4, .04, .04, '#f39c12', .18, .48, -.1, { r: .005 }); m.kotak(.5, .08, .14, '#34495e', 0, 0, .2, { r: .03 }); break; }
        case 'agro': for (let i = 0; i < 3 + L; i++) { const x = -.3 + (i % 4) * .2, z = -.2 + Math.floor(i / 4) * .22; m.sil(.015, .02, .16, '#7a5a34', x, 0, z, { seg: 5 }); for (let f = 0; f < 5; f++) { const a = f / 5 * 6.28; m.kotak(.14, .01, .04, K.sawit, x + Math.cos(a) * .06, .16, z + Math.sin(a) * .06, { ry: -a, rz: -.4, r: .003 }); } } break;
        case 'minyak': m.sil(.1, .1, .14, '#dfe3e8', -.2, 0, -.1, { seg: 10 }); m.sil(.1, .1, .14, '#dfe3e8', .05, 0, -.15, { seg: 10 }); m.kotak(.06, .45 + L * .05, .06, '#c0392b', .25, 0, .1, { r: .01 }); m.kon(.03, .1, '#ff8c1a', .25, .45 + L * .05, .1, { seg: 5 }); if (L >= 3) m.sil(.09, .09, .1, '#dfe3e8', -.15, 0, .18, { seg: 10 }); break;
        case 'tenaga': if (k === 'SWK') { m.kotak(.6, .3, .1, '#a7b1bc', 0, 0, 0, { r: .03 }); m.kotak(.6, .02, .3, '#3fa9d6', 0, .25, -.2, { r: .01 }); } else for (let i = 0; i < 2 + L; i++) { m.kotak(.18, .015, .12, '#1f3c88', -.25 + (i % 3) * .21, .08, -.12 + Math.floor(i / 3) * .2, { rx: -.5, r: .004 }); m.sil(.006, .006, .08, '#888', -.25 + (i % 3) * .21, 0, -.12 + Math.floor(i / 3) * .2, { seg: 3 }); } break;
        case 'teknologi': m.kotak(.42, .22 + L * .05, .3, K.kaca, 0, 0, 0, { r: .04 }); m.kotak(.16, .03, .16, '#22262c', 0, .22 + L * .05, 0, { r: .01 }); for (let i = -1; i <= 1; i++) m.kotak(.02, .02, .2, K.emas, i * .05, .225 + L * .05, 0, { r: 0 }); if (L >= 3) m.kotak(.2, .3 + L * .06, .2, '#9fe2f5', -.28, 0, .15, { r: .03 }); break;
        case 'pusatdata': for (let i = 0; i < 1 + Math.ceil(L / 2); i++) { m.kotak(.5, .14, .14, '#3a4250', 0, 0, -.15 + i * .18, { r: .02 }); m.kotak(.5, .02, .145, '#38b6ff', 0, .09, -.15 + i * .18, { r: 0 }); } break;
        case 'angkutan': m.kotak(.7, .03, .08, '#9aa3ab', 0, .2, 0, { r: .01 }); for (const x of [-.3, 0, .3]) m.sil(.02, .02, .2, '#9aa3ab', x, 0, 0, { seg: 5 }); m.kotak(.3, .08, .07, K.putih, -.1 + L * .03, .23, 0, { r: .03 }); m.kotak(.3, .02, .072, '#d1202f', -.1 + L * .03, .26, 0, { r: 0 }); break;
      }
      const g = m.geo(), s = .9 + L * .07; g.scale(s, s, s); g.computeBoundingBox(); g.computeBoundingSphere(); return g;
    });
  }
  const modelBinaan = () => ingat('binaan', () => { const m = new Bina(); for (const [x, z] of [[-.22, -.15], [.22, -.15], [-.22, .15], [.22, .15]]) m.sil(.012, .012, .3, '#f1c40f', x, 0, z, { seg: 4 }); m.kotak(.48, .015, .34, '#f39c12', 0, .3, 0, { r: 0 }); m.kotak(.03, .6, .03, '#f39c12', .3, 0, .2, { r: 0 }); m.kotak(.35, .03, .03, '#f39c12', .2, .58, .2, { r: 0 }); m.kotak(.4, .06, .28, '#bfa98a', 0, 0, 0, { r: .01 }); return m.geo(); });
  function modelBandar(k, L) {
    return ingat(`C${k}:${L}`, () => {
      const m = new Bina(), r = rngP(k.charCodeAt(0) * 31 + k.charCodeAt(2) * 7 + L), kecil = ['KUL', 'PJY', 'LBN', 'PLS', 'MLK', 'PNG'].includes(k), rad = kecil ? .28 : .55;
      const w = ['#f2e8d5', '#e8d7b9', '#cfe3ef', '#f6d6b8', '#e0e6ec', '#f3c9a8'];
      const n = (kecil ? 3 : 4) + L * (kecil ? 2 : 3);
      for (let i = 0; i < n; i++) { const a = r() * 6.28, d = Math.sqrt(r()) * rad, h = .08 + r() * (.1 + L * .06) * (1 - d / rad * .6); const s = .07 + r() * .06; m.kotak(s, h, s, w[i % 6], Math.cos(a) * d, 0, Math.sin(a) * d, { r: .015 }); if (h > .3) m.kotak(s * .7, .02, s * .7, '#9fd8ff', Math.cos(a) * d, h, Math.sin(a) * d, { r: 0 }); }
      if (k === 'KUL') { for (const x of [-.06, .06]) { m.sil(.035, .045, .9, '#d9dee5', x, 0, 0, { seg: 8 }); m.sil(.025, .035, .25, '#e8ecf2', x, .9, 0, { seg: 8 }); m.kon(.012, .25, '#e8ecf2', x, 1.15, 0, { seg: 5 }); } m.kotak(.08, .02, .03, '#c9d0d8', 0, .5, 0, { r: 0 }); m.sil(.02, .03, .7, '#d8dde3', .25, 0, .18, { seg: 6 }); m.bola(.05, '#f0f3f7', .25, .72, .18); m.kon(.008, .2, '#ccc', .25, .76, .18, { seg: 4 }); m.sil(.05, .07, .75, '#cfd8e3', -.2, 0, .15, { seg: 6 }); m.kon(.04, .2, '#dde5ee', -.2, .75, .15, { seg: 6 }); }
      if (k === 'PJY') { m.kotak(.22, .1, .14, '#f1e7d0', 0, 0, 0, { r: .02 }); m.bola(.07, '#3c8f4a', 0, .14, 0, { sy: .9 }); m.kon(.01, .06, K.emas, 0, .2, 0, { seg: 4 }); }
      return m.geo();
    });
  }
  const modelPokok = () => ingat('pokok', () => new Bina().sil(.015, .02, .08, '#6b4a2c', 0, 0, 0, { seg: 4 }).bola(.09, '#2f8a2e', 0, .12, 0, { d: 0, rata: true }).bola(.065, '#3fa53a', .04, .17, .02, { d: 0, rata: true }).geo());
  const modelSawit = () => ingat('sawit', () => { const m = new Bina(); m.sil(.012, .016, .13, '#7a5a34', 0, 0, 0, { seg: 4 }); for (let f = 0; f < 6; f++) { const a = f / 6 * 6.28; m.kotak(.11, .008, .03, f % 2 ? '#3f9c34' : '#4caf3c', Math.cos(a) * .05, .13, Math.sin(a) * .05, { ry: -a, rz: -.35, r: 0 }); } return m.geo(); });
  const modelPadi = () => ingat('petakpadi', () => new Bina().kotak(.16, .012, .16, '#b7d84a', 0, 0, 0, { r: 0 }).kotak(.16, .014, .02, '#8aa83a', 0, 0, 0, { r: 0 }).geo());
  const modelGunung = () => ingat('gunung', () => { const g = new T.ConeGeometry(.4, .7, 6, 2); const p = g.attributes.position, wr = new Float32Array(p.count * 3), c1 = lin('#3f8a2e'), c2 = lin('#8a9a6a'), r = rngP(9); for (let i = 0; i < p.count; i++) { const y = p.getY(i); if (y > -.3 && y < .3) { p.setX(i, p.getX(i) * (1 + (r() - .5) * .25)); p.setZ(i, p.getZ(i) * (1 + (r() - .5) * .25)); } const c = y > .1 ? c2 : c1; wr[i * 3] = c.r; wr[i * 3 + 1] = c.g; wr[i * 3 + 2] = c.b; } g.translate(0, .35, 0); g.setAttribute('color', new T.BufferAttribute(wr, 3)); const n = g.toNonIndexed(); n.computeVertexNormals(); return n; });
  const modelKinabalu = () => ingat('kinabalu', () => { const m = new Bina(); m.kon(.9, .9, '#3f8a2e', 0, 0, 0, { seg: 7, rata: true }); m.kon(.55, .7, '#7f8a80', .05, .55, 0, { seg: 6, rata: true }); for (const [x, z, h] of [[-.1, .05, .35], [.12, -.05, .45], [.02, .1, .3]]) m.kon(.12, h, '#9aa39a', x, 1.1, z, { seg: 4, rata: true }); return m.geo(); });
  const modelPelantar = () => ingat('pelantar', () => { const m = new Bina(); for (const [x, z] of [[-.12, -.12], [.12, -.12], [-.12, .12], [.12, .12]]) m.sil(.02, .02, .35, '#c9ccd1', x, -.2, z, { seg: 5 }); m.kotak(.38, .06, .38, '#e8b23a', 0, .15, 0, { r: .01 }); m.kotak(.04, .4, .04, '#d1d4d9', .08, .21, -.05, { r: 0 }); m.kotak(.16, .1, .14, '#f3f3f3', -.08, .21, .06, { r: .02 }); m.kotak(.2, .02, .02, '#999', .2, .5, -.05, { r: 0 }); return m.geo(); });
  const modelKapal = () => ingat('kapal', () => { const m = new Bina(), w = ['#e74c3c', '#2e86de', '#f1c40f', '#27ae60']; m.kotak(.9, .1, .22, '#2c3e50', 0, -.04, 0, { r: .05 }); m.kotak(.92, .03, .23, '#c0392b', 0, -.04, 0, { r: .01 }); for (let i = 0; i < 6; i++) m.kotak(.12, .08, .16, w[i % 4], -.25 + i * .1, .06, 0, { r: .01 }); m.kotak(.12, .16, .18, '#f3f3f3', .36, .06, 0, { r: .02 }); return m.geo(); });
  const modelAwan = () => ingat('awan', () => new Bina().bola(.9, '#ffffff', 0, 0, 0, { sy: .55 }).bola(.7, '#ffffff', .8, -.05, .1, { sy: .55 }).bola(.65, '#fbfbff', -.8, -.08, -.1, { sy: .5 }).bola(.55, '#ffffff', .2, .25, -.2, { sy: .6 }).geo());
  const modelPesawat = () => ingat('pesawat', () => new Bina().sil(.06, .05, .7, '#f4f6f8', -.35, 0, 0, { rz: -Math.PI / 2, seg: 8 }).kotak(.22, .02, .9, '#e8ecf0', -.05, 0, 0, { r: .01 }).kotak(.12, .16, .02, '#d1202f', -.33, .02, 0, { r: .01 }).kotak(.1, .02, .3, '#e8ecf0', -.32, .02, 0, { r: .01 }).geo());

  /* ---------- keadaan adegan ---------- */
  const kumpulan = {};        // kod negeri -> { g, mesh, mat, projek: Map, bandar, slot, angkat }
  let laut, lautAsal, kapal = [], awan = [], pesawat = [], megaObj = {}, keretapi = [];
  const LALUAN_KAPAL = [[[97.8, 6.6], [99.5, 5.0], [100.6, 3.6], [101.6, 2.4], [102.8, 1.6], [103.6, 1.12], [104.5, 1.22], [105.5, 2.4], [107.5, 4.2], [110.0, 5.6], [113.0, 6.8], [116.0, 8.6]]];
  const PELANTAR = [[104.6, 5.6], [105.0, 5.0], [104.3, 6.1], [113.4, 4.75], [114.1, 5.25], [112.6, 4.2], [115.6, 6.3], [115.3, 5.9]];
  const GUNUNG = [];
  (() => { const r = rngP(4); for (let i = 0; i < 26; i++) { const t = i / 25; GUNUNG.push([101.25 + t * .7 + (r() - .5) * .18, 5.7 - t * 2.6 + (r() - .5) * .15, .7 + r() * .5]); }
    for (let i = 0; i < 6; i++) GUNUNG.push([102.1 + r() * .3, 4.5 + r() * .3, .8 + r() * .4]);
    for (let i = 0; i < 12; i++) GUNUNG.push([115.9 + r() * .55, 4.9 + r() * 1.4, .6 + r() * .5]);
    for (let i = 0; i < 16; i++) GUNUNG.push([113.6 + r() * 2, 2.6 + r() * 1.5, .6 + r() * .6]);
    for (let i = 0; i < 8; i++) GUNUNG.push([116.6 + r() * 1.5, 4.5 + r() * .6, .5 + r() * .4]); })();

  function binaDunia() {
    // laut
    const gl = new T.PlaneGeometry(320, 180, 90, 50); gl.rotateX(-Math.PI / 2); gl.translate(0, -.05, 2);
    laut = new T.Mesh(gl.toNonIndexed(), new T.MeshStandardMaterial({ color: lin('#2a9fd0'), roughness: .3, metalness: .05, flatShading: true }));
    lautAsal = Float32Array.from(laut.geometry.attributes.position.array); laut.receiveShadow = true; adegan.add(laut);
    // perairan cetek di sekeliling daratan
    const N = 1024, M = 512, c = document.createElement('canvas'); c.width = N; c.height = M; const x = c.getContext('2d');
    const keKanvas = ([lo, la]) => [(lo - 79.5) / 60 * N, (LAT0 + 15 - la) / 30 * M];   // satah 300 × 150 unit berpusat di (LON0, LAT0)
    const semua = [...NEGERI.flatMap(n => n.poli), ...JIRAN.flatMap(j => j.poli)];
    x.lineJoin = 'round';
    for (const [lw, a] of [[44, .08], [30, .12], [18, .2], [9, .3], [3, .4]]) { x.strokeStyle = `rgba(255,255,255,${a})`; x.lineWidth = lw; for (const p of semua) { x.beginPath(); p.forEach((q, i) => { const [a2, b2] = keKanvas(q); if (i) x.lineTo(a2, b2); else x.moveTo(a2, b2); }); x.closePath(); x.stroke(); } }
    const tx = new T.CanvasTexture(c);
    const cetek = new T.Mesh(new T.PlaneGeometry(300, 150), new T.MeshBasicMaterial({ map: tx, color: lin('#8ff0e8'), transparent: true, depthWrite: false }));
    cetek.rotation.x = -Math.PI / 2; cetek.position.set(0, .02, 0); cetek.renderOrder = 1; adegan.add(cetek);
    // negara jiran
    const MJ = new T.MeshStandardMaterial({ color: lin('#cdd2ad'), roughness: .95 });
    for (const j of JIRAN) { const g = ekstrud({ poli: j.poli }, .12, .06); const me = new T.Mesh(g, MJ); me.receiveShadow = true; adegan.add(me); }
    // negeri
    const warnaAsal = ['#8fd16a', '#7fc95c', '#a5d86f', '#78c255', '#93cf63', '#86c95f'];
    NEGERI.forEach((n, i) => {
      const g = new T.Group(), bev = ['KUL', 'PJY', 'LBN'].includes(n.k) ? .035 : .1;
      const mat = new T.MeshStandardMaterial({ color: lin(warnaAsal[i % warnaAsal.length]), roughness: .85, emissive: 0x000000 });
      const mesh = new T.Mesh(ekstrud(n, ATAS - bev, bev), mat); mesh.castShadow = true; mesh.receiveShadow = true; mesh.userData.k = n.k; g.add(mesh);
      const o = { g, mesh, mat, projek: new Map(), bandar: null, bandarL: 0, angkat: 0, warna: new T.Color().copy(mat.color), sasaranWarna: new T.Color().copy(mat.color) };
      // hiasan
      const r = rngP(i * 97 + 13), [lo0, la0, lo1, la1] = n.poli.flat().reduce((a, [lo, la]) => [Math.min(a[0], lo), Math.min(a[1], la), Math.max(a[2], lo), Math.max(a[3], la)], [999, 999, -999, -999]);
      const ambil = (bil, jauhBandar) => { const out = []; for (let t = 0; t < bil * 8 && out.length < bil; t++) { const lo = lo0 + r() * (lo1 - lo0), la = la0 + r() * (la1 - la0); if (!dalamNegeri(n, lo, la)) continue; if (Math.hypot(lo - n.ibuLL[0], la - n.ibuLL[1]) < jauhBandar) continue; out.push([lo, la]); } return out; };
      const luasUnit = Math.min(160, Math.round(Math.sqrt(n.luas) * n.hutan * 1.6));
      const sawitN = ['JHR', 'SBH', 'PHG', 'NSN', 'PRK', 'SWK'].includes(n.k) ? .35 : 0;
      const tempat = ambil(luasUnit, .25);
      const kira = { pokok: [], sawit: [] }; tempat.forEach(p => kira[r() < sawitN ? 'sawit' : 'pokok'].push(p));
      if (['KDH', 'PLS', 'KTN'].includes(n.k)) kira.padi = ambil(Math.round(Math.sqrt(n.luas) * .9), .15);
      kira.gunung = GUNUNG.filter(([lo, la]) => dalamNegeri(n, lo, la));
      for (const [jenis, arr] of Object.entries(kira)) {
        if (!arr.length) continue;
        const geo = jenis === 'pokok' ? modelPokok() : jenis === 'sawit' ? modelSawit() : jenis === 'padi' ? modelPadi() : modelGunung();
        const im = new T.InstancedMesh(geo, MAT, arr.length), mt = new T.Matrix4(), q = new T.Quaternion(), e = new T.Euler();
        arr.forEach(([lo, la, s], idx) => { const [px, pz] = xz(lo, la), sk = jenis === 'gunung' ? s : jenis === 'padi' ? 1 + r() * .6 : .8 + r() * .6; mt.compose(new T.Vector3(px, ATAS - .01, pz), q.setFromEuler(e.set(0, r() * 6.3, 0)), new T.Vector3(sk, jenis === 'padi' ? 1 : sk, sk)); im.setMatrixAt(idx, mt); });
        im.castShadow = jenis !== 'padi'; im.receiveShadow = true; g.add(im);
      }
      if (n.k === 'SBH') { const kb = new T.Mesh(modelKinabalu(), MAT); const [px, pz] = xz(116.56, 6.08); kb.position.set(px, ATAS - .02, pz); kb.castShadow = true; g.add(kb); }
      // slot projek di sekitar ibu negeri
      const kecil = ['KUL', 'PJY', 'LBN', 'PLS', 'MLK', 'PNG'].includes(n.k), jarak = kecil ? .055 : .11, rad = kecil ? .25 : Math.min(1.2, .35 + Math.sqrt(n.luas) / 220);
      const slot = [];
      for (let t = 0; t < 4000 && slot.length < 14; t++) {
        const a = r() * 6.28, d = (kecil ? .02 : .1) + r() * rad, lo = n.ibuLL[0] + Math.cos(a) * d, la = n.ibuLL[1] + Math.sin(a) * d;
        if (!dalamNegeri(n, lo, la)) continue;
        if (Math.hypot(lo - n.ibuLL[0], la - n.ibuLL[1]) < (kecil ? .03 : .1)) continue;
        if (slot.some(([a2, b2]) => Math.hypot(a2 - lo, b2 - la) < jarak)) continue;
        slot.push([lo, la]);
      }
      while (slot.length < 14) { const a = slot.length * 2.4; slot.push([n.ibuLL[0] + Math.cos(a) * .07, n.ibuLL[1] + Math.sin(a) * .07]); }
      slot.sort((a, b) => Math.hypot(a[0] - n.ibuLL[0], a[1] - n.ibuLL[1]) - Math.hypot(b[0] - n.ibuLL[0], b[1] - n.ibuLL[1]));
      o.slot = slot;
      adegan.add(g); kumpulan[n.k] = o;
    });
    // jambatan Pulau Pinang
    const jb = new Bina(); jb.kotak(.27, .03, .05, '#e8e8e8', 0, 0, 0, { r: .01 }); jb.kotak(.02, .12, .02, '#e8e8e8', 0, 0, 0, { r: 0 });
    const jm = new T.Mesh(jb.geo(), MAT); const [ja, jz] = xz(100.35, 5.355); jm.position.set(ja, ATAS - .04, jz); jm.rotation.y = .1; adegan.add(jm);
    // pelantar minyak
    for (const p of PELANTAR) { const m = new T.Mesh(modelPelantar(), MAT); const [px, pz] = xz(...p); m.position.set(px, .1, pz); m.rotation.y = p[0]; m.castShadow = true; adegan.add(m); }
    // kapal
    for (let i = 0; i < 7; i++) { const m = new T.Mesh(modelKapal(), MAT); m.castShadow = true; m.userData.t = i / 7; m.userData.v = .006 + (i % 3) * .002; adegan.add(m); kapal.push(m); }
    // awan
    const ra = rngP(21);
    for (let i = 0; i < 9; i++) { const m = new T.Mesh(modelAwan(), new T.MeshStandardMaterial({ vertexColors: true, roughness: 1, transparent: true, opacity: .92 })); m.position.set(-60 + ra() * 120, 9 + ra() * 3, -16 + ra() * 34); m.scale.setScalar(1.2 + ra() * 1.4); m.userData.v = .25 + ra() * .3; adegan.add(m); awan.push(m); }
  }

  /* ---------- penyegerakan ---------- */
  const sasaranDari = (lo, la) => xz(lo, la);
  function segerakNegeri(ts, dt) {
    for (const n of NEGERI) {
      const o = kumpulan[n.k], st = S.negeri[n.k];
      // angkat bila dipilih
      const mahu = pilihanN === n.k ? .28 : 0; o.angkat += (mahu - o.angkat) * Math.min(1, dt * 8); o.g.position.y = o.angkat;
      // warna lensa
      o.warna.lerp(o.sasaranWarna, Math.min(1, dt * 5)); o.mat.color.copy(o.warna);
      const amaran = S.peristiwa.some(p => p.negeri === n.k);
      o.mat.emissive.setRGB(amaran ? .25 + .2 * Math.sin(ts * 5) : pilihanN === n.k ? .06 : 0, amaran ? .02 : pilihanN === n.k ? .06 : 0, amaran ? 0 : pilihanN === n.k ? .02 : 0);
      // bandar ikut tahap pembangunan
      const L = tahapNegeri(n.k);
      if (o.bandarL !== L) { if (o.bandar) o.g.remove(o.bandar); o.bandar = new T.Mesh(modelBandar(n.k, L), MAT); o.bandar.castShadow = true; o.bandar.receiveShadow = true; const [px, pz] = xz(...n.ibuLL); o.bandar.position.set(px, ATAS - .01, pz); o.g.add(o.bandar); o.bandarL = L; }
      // projek
      const ada = new Set();
      st.projek.forEach((p, i) => {
        const kunci = p.j + ':' + p.lv + ':' + (p.busy ? 1 : 0); ada.add(p.j);
        let m = o.projek.get(p.j);
        if (m && m.userData.kunci !== kunci) { o.g.remove(m); m = null; }
        if (!m) {
          m = new T.Group(); m.userData.kunci = kunci;
          const sl = o.slot[i % o.slot.length], [px, pz] = xz(...sl);
          if (p.lv >= 1) { const a = new T.Mesh(modelProjek(p.j, p.lv, n.k), MAT); a.castShadow = true; m.add(a); }
          if (p.busy) { const b = new T.Mesh(modelBinaan(), MAT); b.castShadow = true; if (p.lv >= 1) b.position.set(.3, 0, .25); m.add(b); }
          const sk = ['KUL', 'PJY', 'LBN'].includes(n.k) ? .45 : ['PLS', 'MLK', 'PNG'].includes(n.k) ? .6 : .85;
          m.scale.setScalar(sk); m.position.set(px, ATAS - .01, pz); m.rotation.y = -.3 + (i % 3) * .3;
          o.projek.set(p.j, m); o.g.add(m);
        }
      });
      for (const [j, m] of o.projek) if (!ada.has(j)) { o.g.remove(m); o.projek.delete(j); }
    }
  }
  function segerakMega(ts) {
    for (const [k, d] of Object.entries(MEGA)) {
      const st = S.megaProjek[k];
      if (!st) { if (megaObj[k]) { adegan.remove(megaObj[k]); delete megaObj[k]; } continue; }
      const kunci = st.siap ? 's' : 'b';
      if (!megaObj[k] || megaObj[k].userData.kunci !== kunci) {
        if (megaObj[k]) adegan.remove(megaObj[k]);
        const g = new T.Group(); g.userData.kunci = kunci;
        const pts = d.bulatan ? Array.from({ length: 25 }, (_, i) => [d.bulatan[0] + Math.cos(i / 24 * 6.28) * d.bulatan[2], d.bulatan[1] + Math.sin(i / 24 * 6.28) * d.bulatan[2] * .9]) : d.laluan;
        const v = pts.map(p => { const [x, z] = xz(...p); return new T.Vector3(x, ATAS + .06, z); });
        const kurva = new T.CatmullRomCurve3(v, !!d.bulatan); g.userData.kurva = kurva;
        const tiub = new T.Mesh(new T.TubeGeometry(kurva, Math.max(20, pts.length * 12), d.bulatan ? .035 : .07, 6, !!d.bulatan), new T.MeshStandardMaterial({ color: lin(st.siap ? (k === 'panborneo' ? '#5a5f66' : '#e9eef3') : '#f39c12'), roughness: .6, transparent: !st.siap, opacity: st.siap ? 1 : .75 }));
        tiub.castShadow = true; g.add(tiub);
        if (st.siap) { const tr = new Bina().kotak(.36, .1, .1, k === 'panborneo' ? '#f1c40f' : '#ffffff', 0, -.02, 0, { r: .04 }).kotak(.37, .025, .105, '#d1202f', 0, .04, 0, { r: 0 }).geo(); const kt = new T.Mesh(tr, MAT); kt.castShadow = true; g.add(kt); g.userData.kt = kt; }
        megaObj[k] = g; adegan.add(g);
      }
      const g = megaObj[k];
      if (g.userData.kt) { const t = (ts * .03 + k.length * .1) % 1, p = g.userData.kurva.getPointAt(t), q = g.userData.kurva.getPointAt((t + .002) % 1); g.userData.kt.position.copy(p); g.userData.kt.lookAt(q); g.userData.kt.rotateY(Math.PI / 2); }
    }
  }
  function animasi(ts, dt) {
    const p = laut.geometry.attributes.position, a = lautAsal;
    for (let i = 0; i < p.count; i++) { const x = a[i * 3], z = a[i * 3 + 2]; p.array[i * 3 + 1] = a[i * 3 + 1] + Math.sin(x * .35 + ts * 1.1) * .05 + Math.cos(z * .5 + ts * .8 + x * .1) * .04; }
    p.needsUpdate = true; laut.geometry.computeVertexNormals();
    for (const k of kapal) {
      k.userData.t = (k.userData.t + dt * k.userData.v * .15) % 1;
      const L = LALUAN_KAPAL[0], f = k.userData.t * (L.length - 1), i = Math.floor(f), u = f - i, A = L[i], Bp = L[Math.min(L.length - 1, i + 1)];
      const lo = A[0] + (Bp[0] - A[0]) * u, la = A[1] + (Bp[1] - A[1]) * u, [x, z] = xz(lo, la), [x2, z2] = xz(...Bp);
      k.position.set(x + (k.userData.v - .008) * 60, .04 + Math.sin(ts * 2 + k.userData.t * 40) * .02, z + (k.userData.v - .008) * 40); k.rotation.y = Math.atan2(-(z2 - z), x2 - x);
    }
    for (const c of awan) { c.position.x += c.userData.v * dt; if (c.position.x > 70) c.position.x = -70; }
    for (let i = pesawat.length - 1; i >= 0; i--) {
      const f = pesawat[i]; f.userData.t += dt / f.userData.dur;
      if (f.userData.t >= 1) { adegan.remove(f); pesawat.splice(i, 1); continue; }
      const t = f.userData.t, A = f.userData.a, Bp = f.userData.b, x = A.x + (Bp.x - A.x) * t, z = A.z + (Bp.z - A.z) * t, y = ATAS + .4 + Math.sin(t * Math.PI) * 5;
      f.lookAt(x, y, z); f.position.set(x, y, z); f.rotateY(Math.PI / 2);
    }
  }

  /* ---------- kamera ---------- */
  function kemaskiniKamera() {
    const d = D0 / cam.zum;
    kamera.position.set(cam.x, ATAS + d * Math.sin(EL), cam.z + d * Math.cos(EL)); kamera.lookAt(cam.x, ATAS, cam.z); kamera.updateMatrixWorld();
    if (kabus) { kabus.near = d * 1.05; kabus.far = d * 2.6 + 40; }
  }

  /* ---------- API ---------- */
  function mula(kanvas) {
    R = new T.WebGLRenderer({ canvas: kanvas, antialias: true, powerPreference: 'high-performance' });
    R.outputEncoding = T.sRGBEncoding; R.toneMapping = T.NoToneMapping; R.shadowMap.enabled = true; R.shadowMap.type = T.PCFSoftShadowMap;
    adegan = new T.Scene();
    const langit = lin('#9ed6ef'); adegan.background = langit; kabus = adegan.fog = new T.Fog(langit, 120, 300);
    kamera = new T.PerspectiveCamera(FOV, 1, .5, 1500);
    adegan.add(new T.HemisphereLight(lin('#e4f3ff'), lin('#4f7a28'), .6));
    adegan.add(new T.AmbientLight(lin('#ffe9c8'), .12));
    mentari = new T.DirectionalLight(lin('#ffe6b8'), 1.05);
    mentari.position.set(-25, 45, 18); mentari.target.position.set(0, 0, 0);
    mentari.castShadow = true; mentari.shadow.mapSize.set(4096, 2048);
    const c = mentari.shadow.camera; c.left = -62; c.right = 62; c.top = 32; c.bottom = -32; c.near = 1; c.far = 140;
    mentari.shadow.bias = -.0004; mentari.shadow.normalBias = .02; adegan.add(mentari, mentari.target);
    binaDunia();
  }
  function saiz(w, h, dpr) { W = w; H = h; R.setPixelRatio(Math.min(dpr, 2)); R.setSize(w, h, false); kamera.aspect = w / h; kamera.updateProjectionMatrix(); }
  let tsLalu = 0;
  function render(ts) {
    const dt = Math.min(.1, ts - tsLalu || .016); tsLalu = ts;
    kemaskiniKamera(); animasi(ts, dt); segerakNegeri(ts, dt); segerakMega(ts);
    R.render(adegan, kamera);
  }
  function sinarDari(sx, sy) { kemaskiniKamera(); v2.set(sx / W * 2 - 1, -(sy / H) * 2 + 1); ray.setFromCamera(v2, kamera); return ray; }
  function skrinKeDunia(sx, sy) { const r = sinarDari(sx, sy); return r.ray.intersectPlane(lantai, v3) ? [v3.x, v3.z] : [cam.x, cam.z]; }
  function pilihDi(sx, sy) { const r = sinarDari(sx, sy), k = r.intersectObjects(NEGERI.map(n => kumpulan[n.k].mesh), false)[0]; return k ? k.object.userData.k : null; }
  function ke2D(lon, lat, h = 0) { const [x, z] = xz(lon, lat); v3.set(x, ATAS + h, z).project(kamera); return [(v3.x + 1) / 2 * W, (1 - v3.y) / 2 * H, v3.z < 1]; }
  function warna(k, hex) { kumpulan[k].sasaranWarna.copy(lin(hex)); }
  function fokus(lo0, lo1, la0, la1) {
    const asp = W / Math.max(1, H), tv = Math.tan(FOV / 2 * Math.PI / 180), hw = (lo1 - lo0) * DEG / 2 * 1.06, hh = (la1 - la0) * DEG / 2 * 1.08;
    const d = Math.max(hw / (tv * asp), hh * Math.sin(EL) / tv * 1.1), [x, z] = xz((lo0 + lo1) / 2, (la0 + la1) / 2);
    return { x, z: z + d * .04, zum: D0 / d };
  }
  function terbang(ke) {
    const [ax, az] = xz(101.7, 3.0); let [bx, bz] = xz(ke[0], ke[1]);
    const dx = bx - ax, dz = bz - az, L = Math.hypot(dx, dz); if (L > 70) { bx = ax + dx / L * 70; bz = az + dz / L * 70; }
    const f = new T.Mesh(modelPesawat(), MAT); f.castShadow = true; f.userData = { a: new T.Vector3(ax, 0, az), b: new T.Vector3(bx, 0, bz), t: 0, dur: 4 };
    adegan.add(f); pesawat.push(f);
  }
  function jerebu(aktif) { const c = lin(aktif ? '#c8b99a' : '#9ed6ef'); adegan.background = c; kabus.color = c; }
  const xzLL = xz;
  return { mula, saiz, render, skrinKeDunia, pilihDi, ke2D, warna, fokus, terbang, jerebu, xz: xzLL, D0, sedia: false };
})();
