'use strict';
/* ================= Istana Pangaea (layer 3): secret meeting castle above the clouds =================
   Chambord-inspired keep with Victorian limestone, two moats, curtain walls with watchtowers.
   Inside: Dewan Syura (an empty seat on a three-tier dais: sovereignty belongs to Allah, people lead by
   consultation), Bilik Bunga (a reflection garden) and Bilik Pembeku (a frozen cellar for a relic). */
const PK = {x0:-34, x1:34, z0:-30, z1:22};                // keep footprint, local to PANG
const PMOAT = [[92, 102, 4.5], [58, 66, 4]];               // [inner r, outer r, bridge half-width]
const pl = (x, z) => [x - PANG.x, z - PANG.z];
function inKeep(lx, lz, m = 0){ return lx > PK.x0 - m && lx < PK.x1 + m && lz > PK.z0 - m && lz < PK.z1 + m; }
function pangH(x, z){
  const [lx, lz] = pl(x, z), d = Math.hypot(lx, lz);
  if(d > PANG.r) return -999;
  for(const [a, b, w] of PMOAT) if(d > a && d < b) return Math.abs(lx) < w && lz > 0 ? .6 : -2;
  if(inKeep(lx, lz)){
    if(lx < -20){ if(lz >= 17) return .4; if(lz >= 5) return lerp(-6, .4, (lz - 5) / 12); return -6; }
    if(Math.abs(lx) < 4 && lz > -29 && lz < -23) return 2.8;
    if(Math.abs(lx) < 8 && lz > -29 && lz < -19) return 2;
    if(Math.abs(lx) < 12 && lz > -29 && lz < -15) return 1.2;
    return .4;
  }
  return 0;
}
function pangWalkable(x, z){ const [lx, lz] = pl(x, z); return Math.hypot(lx, lz) < PANG.r - 1 && pangH(x, z) > -1.5 || inKeep(lx, lz) && lx < -20; }
function pangRoom(x, z){
  const [lx, lz] = pl(x, z), d = Math.hypot(lx, lz);
  if(inKeep(lx, lz)){ if(lx < -20) return 'Bilik Pembeku'; if(lx > 20) return 'Bilik Bunga'; return lz > 8 ? 'Galeri Masuk' : 'Dewan Syura'; }
  return d < 58 ? 'Halaman Dalam' : d < 92 ? 'Halaman Luar' : 'Pelantar Awan';
}
function pangSurface(x, z){ const r = pangRoom(x, z); if(r === 'Bilik Pembeku') return 'salji'; if(r === 'Bilik Bunga' || r.startsWith('Halaman')) return 'rumput'; const [lx, lz] = pl(x, z); return Math.abs(lx) < 5 && lz > 56 ? 'kayu' : 'batu'; }
function pangMapColor(x, z){
  const [lx, lz] = pl(x, z), d = Math.hypot(lx, lz), h = pangH(x, z);
  if(h < -900) return [207, 227, 245];
  if(h < -1.5 && !inKeep(lx, lz)) return [52, 120, 184];
  if(inKeep(lx, lz)) return lx < -20 ? [190, 226, 246] : lx > 20 ? [120, 176, 96] : [232, 226, 214];
  if(Math.abs(d - 88) < 1.6 || Math.abs(d - 54) < 1.4) return [150, 146, 140];
  return Math.abs(lx) < 4 && lz > 0 ? [214, 206, 188] : [104, 166, 86];
}

const pg = grp(PANG.x, PANG.y, PANG.z);
const pcol = (lx, lz, r) => collide(PANG.x + lx, PANG.z + lz, r, 3);
function pcolLine(x0, z0, x1, z1, gaps = []){
  const n = Math.ceil(Math.hypot(x1 - x0, z1 - z0) / 1.1);
  for(let i = 0; i <= n; i++){ const x = lerp(x0, x1, i / n), z = lerp(z0, z1, i / n); if(gaps.some(([a, b]) => (x0 === x1 ? z : x) > a && (x0 === x1 ? z : x) < b)) continue; pcol(x, z, .75); }
}
function facadeTex(){
  const c = document.createElement('canvas'); c.width = 256; c.height = 256; const g = c.getContext('2d');
  g.fillStyle = '#f1ece2'; g.fillRect(0, 0, 256, 256);
  g.fillStyle = '#e2dccf'; for(let y = 0; y < 256; y += 16) g.fillRect(0, y, 256, 1.5);
  for(let k = 0; k < 2; k++) for(let i = 0; i < 4; i++){ const x = 14 + i * 62, y = 18 + k * 128;
    g.fillStyle = '#d8d0bf'; g.fillRect(x - 5, y - 6, 44, 98); g.fillStyle = '#3a4a62'; g.fillRect(x, y, 34, 86);
    g.fillStyle = '#f1ece2'; g.fillRect(x + 15, y, 4, 86); g.fillRect(x, y + 30, 34, 3); g.fillStyle = '#c9bfa8'; g.fillRect(x - 7, y + 90, 48, 6); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
const limeMat = M(0xf1ece2, {roughness:.7}), slateMat = M(0x4a5a78, {roughness:.55, metalness:.2}), goldMat = M(0xd8a93a, {metalness:.7, roughness:.3});
const facadeMat = new THREE.MeshStandardMaterial({map:facadeTex(), roughness:.7});
// candlelit windows after dark: same window grid as the facade, most panes warm, a few dark
{ const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d'), r = mulberry(911); g.fillStyle = '#000'; g.fillRect(0, 0, 256, 256);
  for(let k = 0; k < 2; k++) for(let i = 0; i < 4; i++){ if(r() < .22) continue; const x = 14 + i * 62, y = 18 + k * 128, gr = g.createLinearGradient(0, y, 0, y + 86);
    gr.addColorStop(0, '#ffcf7a'); gr.addColorStop(1, '#c46a22'); g.fillStyle = gr; g.fillRect(x, y, 15, 86); g.fillRect(x + 19, y, 15, 86); g.fillStyle = '#000'; g.fillRect(x, y + 30, 34, 3); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(4, 1);
  Object.assign(facadeMat, {emissiveMap:t, emissive:new THREE.Color(0xffffff), emissiveIntensity:0}); nightMats.push([facadeMat, 0, 1.25]); }

/* --- the island --- */
{
  const sh = new THREE.Shape(); sh.absarc(0, 0, PANG.r, 0, Math.PI * 2, false);
  const hole = new THREE.Path(); hole.moveTo(PK.x0, -PK.z0); hole.lineTo(-20, -PK.z0); hole.lineTo(-20, -17); hole.lineTo(PK.x0, -17); hole.lineTo(PK.x0, -PK.z0); sh.holes.push(hole);
  const top = new THREE.ShapeGeometry(sh, 64); top.rotateX(-Math.PI / 2);
  mesh(top, M(0x6fae5a, {flatShading:false}), 0, 0, 0, pg, false);
  const g = new THREE.ConeGeometry(PANG.r + 2, 70, 48, 6, true); g.rotateX(Math.PI);
  const p = g.attributes.position, v = new THREE.Vector3();
  for(let i = 0; i < p.count; i++){ v.fromBufferAttribute(p, i); const k = 1 + noise2(v.x * .05 + v.y * .03, v.z * .05) * .12; p.setXYZ(i, v.x * k, v.y + noise2(v.x * .1, v.z * .1) * 4, v.z * k); }
  g.computeVertexNormals(); mesh(g, M(0x7a6a58, {roughness:1}), 0, -35.5, 0, pg, false);
  mesh(new THREE.TorusGeometry(PANG.r + .6, 1.4, 6, 96), M(0x5a8a42), 0, -.8, 0, pg, false).rotation.x = Math.PI / 2;
  for(let i = 0; i < 30; i++){ const a = rng() * 6.283, d = PANG.r * (.4 + rng() * .7); mesh(new THREE.IcosahedronGeometry(8 + rng() * 9, 1), cloudMat, Math.cos(a) * d, -14 - rng() * 22, Math.sin(a) * d, pg, false).scale.y = .5; }
  for(let i = 0; i < 8; i++){ const a = i / 8 * 6.283 + .3; const fall = mesh(new THREE.PlaneGeometry(4, 60), holoMat(0xdff6ff, .2), Math.cos(a) * (PANG.r + 1), -30, Math.sin(a) * (PANG.r + 1), pg, false); fall.rotation.y = -a + Math.PI / 2; }
  // moats with stone kerbs, and bridges on the south axis
  const water = new THREE.MeshPhongMaterial({color:0x2a86c8, shininess:90, flatShading:true});
  PMOAT.forEach(([a, b, w]) => {
    mesh(new THREE.RingGeometry(a, b, 96), water, 0, .06, 0, pg, false).rotation.x = -Math.PI / 2;
    [a, b].forEach(r => mesh(new THREE.TorusGeometry(r, .45, 5, 120), M(0xb8b2a6), 0, .3, 0, pg, false).rotation.x = Math.PI / 2);
    mesh(new THREE.BoxGeometry(w * 2, .7, b - a + 3), M(0xd6ccb8), 0, .3, (a + b) / 2, pg);
    [-1, 1].forEach(s => { mesh(new THREE.BoxGeometry(.4, 1.1, b - a + 3), limeMat, s * (w - .2), 1.2, (a + b) / 2, pg, false); for(let k = 0; k < 4; k++) mesh(new THREE.SphereGeometry(.35, 8, 6), goldMat, s * (w - .2), 1.9, a - 1 + k * (b - a + 2) / 3, pg, false); });
  });
  // gravel avenue from the cloud pad to the keep
  mesh(new THREE.PlaneGeometry(8, 88), M(0xdcd2bd, {flatShading:false}), 0, .03, 66, pg, false).rotation.x = -Math.PI / 2;
  mesh(new THREE.PlaneGeometry(6, 34), M(0xdcd2bd, {flatShading:false}), 0, .03, 38, pg, false).rotation.x = -Math.PI / 2;
}

/* --- curtain walls with watchtowers --- */
function ringWall(r, h, gateHalf, towerEvery, towerR){
  const gap = gateHalf / r, segs = Math.ceil(6.283 * r / 6), wallM = facadeMat;
  for(let i = 0; i < segs; i++){
    const a = (i + .5) / segs * 6.283; if(Math.abs(Math.atan2(Math.sin(a - Math.PI / 2), Math.cos(a - Math.PI / 2))) < gap) continue;
    const seg = mesh(new THREE.BoxGeometry(6.3, h, 2.4), limeMat, Math.cos(a) * r, h / 2, Math.sin(a) * r, pg); seg.rotation.y = -a + Math.PI / 2;
    for(let k = 0; k < 3; k++){ const m = mesh(new THREE.BoxGeometry(1, 1, 2.5), limeMat, 0, h / 2 + .5, -2.1 + k * 2.1, seg, false); m.position.set(-2.1 + k * 2.1, h / 2 + .5, 0); }
  }
  for(let a = 0; a < 6.283; a += 1.1 / r){ if(Math.abs(Math.atan2(Math.sin(a - Math.PI / 2), Math.cos(a - Math.PI / 2))) < gap) continue; pcol(Math.cos(a) * r, Math.sin(a) * r, 1.4); }
  const tower = (a, big) => { const x = Math.cos(a) * r, z = Math.sin(a) * r, R = towerR * (big ? 1.25 : 1), H = h + 8 + (big ? 4 : 0);
    const t = grp(x, 0, z, pg); mesh(new THREE.CylinderGeometry(R, R * 1.08, H, 16), facadeMat, 0, H / 2, 0, t);
    mesh(new THREE.ConeGeometry(R * 1.2, R * 2.2, 16), slateMat, 0, H + R * 1.1, 0, t); mesh(new THREE.SphereGeometry(.4, 8, 6), goldMat, 0, H + R * 2.3, 0, t, false);
    for(let k = 0; k < 8; k++){ const b = k / 8 * 6.283; mesh(new THREE.BoxGeometry(.9, 1, .9), limeMat, Math.cos(b) * R, H + .4, Math.sin(b) * R, t, false); }
    pcol(x, z, R + .3); info(t, 'Menara Kawalan', 'Menara kawalan Istana Pangaea. Bot Bayang bertugas di sini memantau sebarang cubaan menceroboh lapisan puncak.'); };
  for(let a = Math.PI / 2 + towerEvery; a < Math.PI / 2 + 6.283 - towerEvery / 2; a += towerEvery) tower(a, false);
  [-1, 1].forEach(s => tower(Math.PI / 2 + s * (gap + 4.5 / r), true));
  const arch = grp(0, 0, r, pg); mesh(new THREE.BoxGeometry(gateHalf * 2 + 4, 3, 3), limeMat, 0, h + 1.5, 0, arch); mesh(new THREE.BoxGeometry(gateHalf * 2 - 1, .4, .3), goldMat, 0, h - .4, 1.6, arch, false);
}
ringWall(88, 10, 6, 6.283 / 12, 3.6);
ringWall(54, 8, 5, 6.283 / 8, 3);
// gardens: French parterres in the inner ward, cypress lawns in the outer ward
{
  const hedge = M(0x2f6a34), flower = [M(0xe86a8a), M(0xf2d36b), M(0xffffff)];
  [[-1, 1], [1, 1]].forEach(([s]) => { for(let k = 0; k < 3; k++){ const x = s * (14 + k * 8), z = 34;
    mesh(new THREE.BoxGeometry(6, .9, 12), hedge, x, .45, z, pg); mesh(new THREE.BoxGeometry(4.6, .5, 10.6), flower[k], x, .75, z, pg, false); } });
  [[-40, 0], [40, 0], [-40, -30], [40, -30], [0, -44]].forEach(([x, z]) => { mesh(new THREE.CylinderGeometry(2.6, 3, .8, 16), limeMat, x, .4, z, pg); mesh(new THREE.CylinderGeometry(2.2, 2.2, .1, 16), holoMat(0x8fd8ff, .6), x, .82, z, pg, false); pcol(x, z, 3); });
  for(let i = 0; i < 40; i++){ const a = i / 40 * 6.283; if(Math.abs(Math.atan2(Math.sin(a - Math.PI / 2), Math.cos(a - Math.PI / 2))) < .16) continue; const r = 76 + (i % 2) * 6;
    const c = mesh(new THREE.ConeGeometry(1.4, 7, 7), hedge, Math.cos(a) * r, 3.5, Math.sin(a) * r, pg); pcol(Math.cos(a) * r, Math.sin(a) * r, 1); swayGroups.push(c); }
}

/* --- the keep: lower walls always, upper body + roofscape hidden while you are inside --- */
const keepLow = grp(0, 0, 0, pg), keepTop = grp(0, 0, 0, pg);
{
  const W = PK.x1 - PK.x0, D = PK.z1 - PK.z0, cx = (PK.x0 + PK.x1) / 2, cz = (PK.z0 + PK.z1) / 2, LOW = 3.2, H = 20;
  // lower walls (door gap in the south facade)
  mesh(new THREE.BoxGeometry(W, LOW, 1.2), limeMat, cx, LOW / 2, PK.z0, keepLow);
  mesh(new THREE.BoxGeometry(1.2, LOW, D), limeMat, PK.x0, LOW / 2, cz, keepLow); mesh(new THREE.BoxGeometry(1.2, LOW, D), limeMat, PK.x1, LOW / 2, cz, keepLow);
  [-1, 1].forEach(s => mesh(new THREE.BoxGeometry(30, LOW, 1.2), limeMat, s * 19, LOW / 2, PK.z1, keepLow));
  pcolLine(PK.x0, PK.z0, PK.x1, PK.z0); pcolLine(PK.x0, PK.z0, PK.x0, PK.z1); pcolLine(PK.x1, PK.z0, PK.x1, PK.z1); pcolLine(PK.x0, PK.z1, PK.x1, PK.z1, [[-4, 4]]);
  // upper body with window facade
  const upper = (w, d, x, z) => { const m = mesh(new THREE.BoxGeometry(w, H - LOW, d), facadeMat, x, LOW + (H - LOW) / 2, z, keepTop); return m; };
  upper(W, 1.2, cx, PK.z0); upper(W, 1.2, cx, PK.z1); upper(1.2, D, PK.x0, cz); upper(1.2, D, PK.x1, cz);
  facadeMat.map.repeat.set(4, 1);
  mesh(new THREE.BoxGeometry(W + 2, 1, D + 2), limeMat, cx, H + .5, cz, keepTop);
  const roof = mesh(new THREE.CylinderGeometry(0, 1, 1, 4), slateMat, cx, H + 1 + 5, cz, keepTop); roof.scale.set(W * .72, 10, D * .72); roof.rotation.y = Math.PI / 4;
  // corner bastions with conical roofs
  [[PK.x0, PK.z0], [PK.x1, PK.z0], [PK.x0, PK.z1], [PK.x1, PK.z1]].forEach(([x, z]) => {
    mesh(new THREE.CylinderGeometry(8, 8.4, LOW, 24), limeMat, x, LOW / 2, z, keepLow); pcol(x, z, 8.2);
    mesh(new THREE.CylinderGeometry(8, 8, H + 2 - LOW, 24), facadeMat, x, LOW + (H + 2 - LOW) / 2, z, keepTop);
    mesh(new THREE.ConeGeometry(9.2, 16, 24), slateMat, x, H + 2 + 8, z, keepTop);
    const lt = grp(x, H + 2 + 16, z, keepTop); mesh(new THREE.CylinderGeometry(1.2, 1.2, 3, 8), limeMat, 0, 1.5, 0, lt); mesh(new THREE.ConeGeometry(1.5, 3.5, 8), slateMat, 0, 4.7, 0, lt); mesh(new THREE.SphereGeometry(.35, 8, 6), goldMat, 0, 6.6, 0, lt, false);
  });
  // central lantern tower (Chambord's double-staircase crown) and the roofscape of pinnacles and chimneys
  const lan = grp(cx, H + 6, cz, keepTop);
  mesh(new THREE.CylinderGeometry(5, 5.5, 14, 16), facadeMat, 0, 7, 0, lan); mesh(new THREE.SphereGeometry(5.6, 16, 10, 0, 6.283, 0, Math.PI / 2), slateMat, 0, 14, 0, lan);
  mesh(new THREE.CylinderGeometry(1.6, 1.6, 4, 8), limeMat, 0, 21, 0, lan); mesh(new THREE.ConeGeometry(2, 5, 8), slateMat, 0, 25.5, 0, lan); mesh(new THREE.SphereGeometry(.7, 10, 8), goldMat, 0, 28.6, 0, lan, false);
  for(let i = 0; i < 26; i++){ const x = PK.x0 + 6 + rng() * (W - 12), z = PK.z0 + 5 + rng() * (D - 10); if(Math.hypot(x - cx, z - cz) < 8) continue;
    const ht = 4 + rng() * 7, kind = i % 3;
    if(kind === 0){ mesh(new THREE.BoxGeometry(1.4, ht, 1.4), limeMat, x, H + 2 + ht / 2, z, keepTop); mesh(new THREE.ConeGeometry(1.1, 3, 4), slateMat, x, H + 3.5 + ht, z, keepTop, false); }
    else if(kind === 1){ mesh(new THREE.ConeGeometry(.8, ht + 3, 6), slateMat, x, H + 2 + (ht + 3) / 2, z, keepTop, false); mesh(new THREE.SphereGeometry(.25, 6, 4), goldMat, x, H + 5 + ht, z, keepTop, false); }
    else { mesh(new THREE.BoxGeometry(2.2, 2.4, 1.6), limeMat, x, H + 3, z, keepTop, false); mesh(new THREE.CylinderGeometry(0, 1.6, 1.8, 4), slateMat, x, H + 5.1, z, keepTop, false).rotation.y = Math.PI / 4; }
  }
  // grand south door
  const door = grp(0, 0, PK.z1 + .7, keepTop); mesh(new THREE.BoxGeometry(9, 9, .6), limeMat, 0, LOW + 4.5, 0, door, false); mesh(new THREE.CircleGeometry(3.4, 20, 0, Math.PI), goldMat, 0, LOW + 2, .32, door, false);
  info(keepTop, 'Istana Pangaea', 'Istana di lapisan puncak, diilhamkan Château de Chambord dan seni bina Victorian. Tempat mesyuarat rahsia kau bersama rakan kongsi terpilih. Masuk melalui pintu selatan.');
}
const keepInner = grp(0, 0, 0, pg);
/* --- interior partitions (low, dollhouse-style so the camera sees in) --- */
{
  const wall = M(0xe9e0cc), H = 3.2;
  const part = (x0, z0, x1, z1, gaps) => {
    const along = x0 === x1 ? 'z' : 'x', a0 = along === 'z' ? z0 : x0, a1 = along === 'z' ? z1 : x1; let cur = a0;
    [...gaps, [a1, a1]].forEach(([g0, g1]) => { if(g0 > cur){ const len = g0 - cur, mid = (cur + g0) / 2; along === 'z' ? mesh(new THREE.BoxGeometry(.8, H, len), wall, x0, H / 2, mid, keepInner) : mesh(new THREE.BoxGeometry(len, H, .8), wall, mid, H / 2, z0, keepInner); } cur = g1; });
    pcolLine(x0, z0, x1, z1, gaps);
  };
  part(-20, 8, 20, 8, [[-5, 5]]); part(-20, PK.z0, -20, PK.z1, [[17, 21]]); part(20, PK.z0, 20, PK.z1, [[12, 18]]);
  mesh(new THREE.PlaneGeometry(40, 52), M(0xe8dcc4, {flatShading:false, roughness:.35}), 0, .41, -4, keepInner, false).rotation.x = -Math.PI / 2;
  mesh(new THREE.PlaneGeometry(4, 36), M(0x9a1f2a, {flatShading:false}), 0, .43, 4, keepInner, false).rotation.x = -Math.PI / 2;
}

/* --- Dewan Syura: three-tier dais, the empty seat, the round council table, 19 heritage swords --- */
{
  const red = M(0x9a1f2a, {roughness:.5}), gold = goldMat;
  [[24, 14, 1.2, -22], [16, 10, 2, -24], [8, 6, 2.8, -26]].forEach(([w, d, h, z]) => { mesh(new THREE.BoxGeometry(w, h, d), red, 0, h / 2, z, keepInner); mesh(new THREE.BoxGeometry(w + .1, .14, d + .1), gold, 0, h, z, keepInner, false); });
  const seat = grp(0, 2.8, -27.3, keepInner);
  mesh(new THREE.BoxGeometry(3, 1, 2.4), red, 0, .5, 0, seat); mesh(new THREE.BoxGeometry(3.4, 7, .5), red, 0, 3.5, -1, seat); [-1, 1].forEach(s => mesh(new THREE.BoxGeometry(.4, 1.6, 2.4), gold, s * 1.6, 1, 0, seat));
  mesh(new THREE.BoxGeometry(3.6, .3, .6), gold, 0, 7, -1, seat, false);
  // eight-point star (geometric, no figures) in place of an emblem
  const star = new THREE.Shape(); for(let i = 0; i < 16; i++){ const a = i / 16 * 6.283 + Math.PI / 2, r = i % 2 ? .62 : 1.25; i ? star.lineTo(Math.cos(a) * r, Math.sin(a) * r) : star.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
  mesh(new THREE.ShapeGeometry(star), gold, 0, 5, -.73, seat, false);
  info(seat, 'Kerusi Kosong', 'Kerusi di puncak pentas tiga aras sengaja dibiarkan kosong. Kedaulatan mutlak milik Allah; di Erythmind, keputusan dibuat melalui syura di meja bulat di bawahnya.');
  pcol(0, -24, 4);
  // round council table
  const tab = grp(0, .4, -10, keepInner);
  mesh(new THREE.CylinderGeometry(4.2, 4.2, .3, 40), M(0x3a2414, {roughness:.4}), 0, 1.1, 0, tab); mesh(new THREE.TorusGeometry(4.2, .1, 6, 60), gold, 0, 1.25, 0, tab, false).rotation.x = Math.PI / 2;
  mesh(new THREE.CylinderGeometry(.8, 1.4, 1, 16), M(0x2a1a10), 0, .5, 0, tab);
  const holoW = mesh(new THREE.IcosahedronGeometry(1.4, 2), holoWire(0xe8b04a, .7), 0, 3, 0, tab, false);
  mesh(new THREE.CylinderGeometry(1.6, .2, 1.6, 24, 1, true), holoMat(0xe8b04a, .2), 0, 2, 0, tab, false);
  for(let i = 0; i < 10; i++){ const a = i / 10 * 6.283; const ch = grp(Math.cos(a) * 5.6, 0, Math.sin(a) * 5.6, tab); ch.rotation.y = -a - Math.PI / 2;
    mesh(new THREE.BoxGeometry(1.2, .2, 1.2), red, 0, .8, 0, ch); mesh(new THREE.BoxGeometry(1.2, 1.6, .2), red, 0, 1.6, -.6, ch); mesh(new THREE.BoxGeometry(1.24, .1, .24), gold, 0, 2.4, -.6, ch, false); }
  pcol(0, -10, 4.4);
  anims.push(t => { if(pg.visible) holoW.rotation.y = t * .4; });
  // 19 heritage swords planted in the floor: no single ruler, decisions by consultation
  const blade = M(0xd8dde6, {metalness:.85, roughness:.2}), hilt = M(0x3a2414);
  for(let i = 0; i < 19; i++){ const left = i < 10, k = left ? i : i - 10, n = left ? 10 : 9;
    const a = (left ? lerp(195, 235, k / (n - 1)) : lerp(305, 345, k / (n - 1))) / R2D_, R = 15;
    const sw = grp(Math.cos(a) * R, .4, -22 - Math.sin(a) * R, keepInner);
    sw.rotation.set((rng() - .5) * .2, rng() * 6.283, (rng() - .5) * .2);
    mesh(new THREE.BoxGeometry(.28, 3.2, .06), blade, 0, 1.2, 0, sw, false); mesh(new THREE.BoxGeometry(1.1, .16, .2), gold, 0, 2.85, 0, sw, false);
    mesh(new THREE.CylinderGeometry(.07, .07, .9, 6), hilt, 0, 3.35, 0, sw, false); mesh(new THREE.SphereGeometry(.12, 8, 6), gold, 0, 3.85, 0, sw, false);
  }
  const swInfo = grp(-14, 0, -14, keepInner); info(swInfo, '19 Pedang Warisan', 'Sembilan belas pedang terpacak di lantai Dewan Syura: tiada pemerintah tunggal di Erythmind. Setiap keputusan besar dibawa ke meja syura.');
  // chandeliers + warm hall light
  [-14, 0].forEach(z => { mesh(new THREE.TorusGeometry(2.4, .1, 6, 40), gold, 0, 8, z, keepInner, false).rotation.x = Math.PI / 2; mesh(new THREE.TorusGeometry(2.4, .3, 6, 40), holoMat(0xffd27a, .5), 0, 7.9, z, keepInner, false).rotation.x = Math.PI / 2; });
  const hallLight = new THREE.PointLight(0xffd8a0, 0, 46, 1.6); hallLight.position.set(0, 9, -12); keepInner.add(hallLight); keepInner.userData.light = hallLight;
}

/* --- Bilik Bunga: a reflection garden with lilies, fountain and kupuKupu --- */
const kupuKupu = [];
{
  const BX = 27, grass = M(0x6fbf5a, {flatShading:false});
  mesh(new THREE.PlaneGeometry(14, 52), grass, BX, .42, -4, keepInner, false).rotation.x = -Math.PI / 2;
  mesh(new THREE.PlaneGeometry(1.6, 44), new THREE.MeshPhongMaterial({color:0x3aa0d8, shininess:90}), BX, .45, -4, keepInner, false).rotation.x = -Math.PI / 2;
  const f = grp(BX, .4, -4, keepInner); mesh(new THREE.CylinderGeometry(2.6, 2.8, .7, 8), limeMat, 0, .35, 0, f); mesh(new THREE.CylinderGeometry(2.2, 2.2, .1, 8), new THREE.MeshPhongMaterial({color:0x5ab8e8, shininess:90}), 0, .72, 0, f, false);
  mesh(new THREE.CylinderGeometry(.25, .35, 1.6, 8), limeMat, 0, 1.4, 0, f); const jet = mesh(new THREE.ConeGeometry(.5, 1.4, 10, 1, true), holoMat(0xcfeeff, .5), 0, 2.8, 0, f, false);
  pcol(BX, -4, 2.8); anims.push(t => { jet.scale.y = 1 + Math.sin(t * 6) * .12; });
  info(f, 'Bilik Bunga · Taman Tafakur', 'Taman dalaman gaya Andalusia: bunga lili, air pancut dan rama-rama. Tempat berehat dan merenung sebelum atau selepas syura.');
  const lilyW = M(0xfbfbf4), lilyY = M(0xf2c84a), leaf = M(0x3f8f45);
  for(let i = 0; i < 90; i++){ const x = BX + (rng() - .5) * 12, z = -4 + (rng() - .5) * 48; if(Math.abs(x - BX) < 1.4 || Math.hypot(x - BX, z + 4) < 3.4) continue;
    mesh(new THREE.CylinderGeometry(.04, .04, .9, 4), leaf, x, .85, z, keepInner, false);
    const fl = mesh(new THREE.ConeGeometry(.3, .45, 6, 1, true), i % 4 ? lilyW : M(0xf7b7cf), x, 1.4, z, keepInner, false); fl.rotation.x = Math.PI;
    mesh(new THREE.SphereGeometry(.07, 5, 4), lilyY, x, 1.3, z, keepInner, false); }
  [[23, -24], [31, -24], [23, 14], [31, 14], [31, -12]].forEach(([x, z]) => { const t = grp(x, .4, z, keepInner); mesh(new THREE.CylinderGeometry(.25, .35, 2.6, 6), trunkMat, 0, 1.3, 0, t); mesh(new THREE.IcosahedronGeometry(1.6, 1), M(0x4f9a46), 0, 3.4, 0, t); mesh(new THREE.SphereGeometry(.18, 6, 4), M(0xf29a3a), .9, 3, .6, t, false); pcol(x, z, .8); swayGroups.push(t); });
  const wingM = [0xffb03a, 0x9fc8ff, 0xff6fb5, 0xfff3a0].map(c => new THREE.MeshBasicMaterial({color:c, side:THREE.DoubleSide}));
  for(let i = 0; i < 22; i++){ const b = grp(BX, 2, -4, keepInner); const m = wingM[i % 4];
    const l = mesh(new THREE.PlaneGeometry(.35, .28), m, -.18, 0, 0, b, false), r = mesh(new THREE.PlaneGeometry(.35, .28), m, .18, 0, 0, b, false);
    kupuKupu.push({b, l, r, ph:rng() * 6.283, cx:BX + (rng() - .5) * 8, cz:-4 + (rng() - .5) * 40, rad:1 + rng() * 3, h:1.5 + rng() * 2.5}); }
  anims.push((t) => kupuKupu.forEach(u => { const a = t * .6 + u.ph; u.b.position.set(u.cx + Math.cos(a) * u.rad, u.h + Math.sin(t * 1.7 + u.ph) * .4, u.cz + Math.sin(a * 1.3) * u.rad); u.b.rotation.y = -a; const w = Math.sin(t * 14 + u.ph) * 1.1; u.l.rotation.y = w; u.r.rotation.y = -w; }));
}

/* --- Bilik Pembeku: the frozen cellar holding a giant straw hat --- */
{
  const ice = M(0xcfe8ff, {roughness:.25, metalness:.1, emissive:0x1a3a5a, emissiveIntensity:.35}), X0 = PK.x0, X1 = -20, Z0 = PK.z0, Z1 = 17;
  mesh(new THREE.PlaneGeometry(X1 - X0, 5 - Z0), M(0xdff2ff, {flatShading:false, roughness:.3}), (X0 + X1) / 2, -6, (Z0 + 5) / 2, keepInner, false).rotation.x = -Math.PI / 2;
  const ramp = mesh(new THREE.PlaneGeometry(X1 - X0, Math.hypot(12, 6.4)), M(0xbfd8ea, {flatShading:false}), (X0 + X1) / 2, -2.8, 11, keepInner, false); ramp.rotation.x = -Math.PI / 2 + Math.atan2(6.4, 12);
  mesh(new THREE.PlaneGeometry(X1 - X0, 5), limeMat, (X0 + X1) / 2, .41, 19.5, keepInner, false).rotation.x = -Math.PI / 2;
  // icy pit walls
  mesh(new THREE.BoxGeometry(X1 - X0, 6.4, .6), ice, (X0 + X1) / 2, -2.8, Z0 + .3, keepInner, false);
  mesh(new THREE.BoxGeometry(.6, 6.4, Z1 - Z0), ice, X0 + .3, -2.8, (Z0 + Z1) / 2, keepInner, false); mesh(new THREE.BoxGeometry(.6, 6.4, Z1 - Z0), ice, X1 - .3, -2.8, (Z0 + Z1) / 2, keepInner, false);
  for(let i = 0; i < 26; i++){ const x = X0 + 1 + rng() * (X1 - X0 - 2), z = Z0 + 1 + rng() * 24; if(Math.hypot(x + 27, z + 14) < 6) continue; const h = 1 + rng() * 3;
    mesh(new THREE.ConeGeometry(.3 + rng() * .4, h, 5), ice, x, -6 + h / 2, z, keepInner, false).rotation.z = (rng() - .5) * .4; }
  const ped = grp(-27, -6, -14, keepInner);
  mesh(new THREE.CylinderGeometry(3.6, 4.2, 1.6, 8), ice, 0, .8, 0, ped);
  const hat = grp(0, 2.4, 0, ped), straw = M(0xe8c66a, {roughness:.9}), band = M(0xc8262c);
  mesh(new THREE.CylinderGeometry(4.6, 4.8, .3, 32), straw, 0, 0, 0, hat); mesh(new THREE.CylinderGeometry(2.4, 2.7, 2.2, 32), straw, 0, 1.2, 0, hat); mesh(new THREE.CylinderGeometry(2.72, 2.72, .6, 32), band, 0, .45, 0, hat, false);
  mesh(new THREE.BoxGeometry(10, 4.6, 10), new THREE.MeshPhongMaterial({color:0xdff4ff, transparent:true, opacity:.28, shininess:120, depthWrite:false}), 0, 3.9, 0, ped, false);
  anims.push(t => { hat.rotation.y = t * .08; });
  pcol(-27, -14, 5.6);
  info(ped, 'Topi Jerami Gergasi', 'Khazanah paling rahsia Istana Pangaea, dibekukan dalam blok ais di bilik bawah tanah. Hanya rakan kongsi terpilih pernah melihatnya.');
  const frostGeo = new THREE.BufferGeometry(), fp = new Float32Array(240 * 3); for(let i = 0; i < 240; i++){ fp[i * 3] = X0 + rng() * (X1 - X0); fp[i * 3 + 1] = -6 + rng() * 6; fp[i * 3 + 2] = Z0 + rng() * 34; }
  frostGeo.setAttribute('position', new THREE.BufferAttribute(fp, 3));
  const frost = new THREE.Points(frostGeo, new THREE.PointsMaterial({color:0xffffff, size:.18, transparent:true, opacity:.8, depthWrite:false})); keepInner.add(frost);
  anims.push((t, dt) => { if(player.layer !== 3) return; const p = frostGeo.attributes.position.array; for(let i = 0; i < 240; i++){ p[i * 3 + 1] -= dt * .4; if(p[i * 3 + 1] < -6) p[i * 3 + 1] = 0; } frostGeo.attributes.position.needsUpdate = true; });
  const cold = new THREE.PointLight(0x9fd8ff, 0, 34, 1.6); cold.position.set(-27, -1, -10); keepInner.add(cold); keepInner.userData.cold = cold;
}

/* --- arrival: cloud pad on the castle island and the light bridge from Labophase --- */
const PANG_PAD = {x:PANG.x, z:PANG.z + 110}, LAB_PANG_PAD = {x:LAB.x - 14, z:LAB.z - 10};
liftPad(0, 0, 110, pg, 0xe8b04a);
liftPad(LAB_PANG_PAD.x - LAB.x, 0, LAB_PANG_PAD.z - LAB.z, lab, 0xe8b04a);
{
  const a = new THREE.Vector3(LAB_PANG_PAD.x, LAB.y, LAB_PANG_PAD.z), b = new THREE.Vector3(PANG_PAD.x, PANG.y, PANG_PAD.z), len = a.distanceTo(b);
  const beam = mesh(new THREE.CylinderGeometry(1.4, 1.4, len, 16, 1, true), holoMat(0xe8b04a, .1), 0, 0, 0, S, false);
  beam.position.copy(a).lerp(b, .5); beam.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
  anims.push(t => { beam.material.opacity = .07 + Math.sin(t * 1.6) * .03; });
}
function goPangaea(){
  if(!canIstana()){ denyAccess('Istana Pangaea hanya untuk rakan kongsi terpilih pemilik.', 'Istana Pangaea'); player.x += 3; return; }
  flash('rgba(232,176,74,.75)'); sfx.whoosh(); setLayer(3); player.x = PANG_PAD.x; player.z = PANG_PAD.z - 5; player.y = 0; player.ry = Math.PI; cam.yaw = 0;
  toast('Jambatan Cahaya · Selamat datang ke Istana Pangaea, lapisan puncak.', 'ok', 5000);
}
function leavePangaea(){ flash('rgba(232,176,74,.6)'); sfx.whoosh(); setLayer(1); player.x = LAB_PANG_PAD.x; player.z = LAB_PANG_PAD.z + 4; player.y = 0; cam.yaw = 0; }
interactables.push(
  {id:'pangup', name:'Naik ke Istana Pangaea', layer:1, at:[LAB_PANG_PAD.x, LAB_PANG_PAD.z], r:3.2, color:'#e8b04a', act:() => goPangaea()},
  {id:'pangdown', name:'Turun ke Labophase', layer:3, at:[PANG_PAD.x, PANG_PAD.z], r:3.2, color:'#e8b04a', act:() => leavePangaea()},
  // the south door: step through into the entrance gallery (the roof opens once you are inside)
  {id:'istanamasuk', name:'Masuk Istana', layer:3, at:[PANG.x, PANG.z + PK.z1 + 9], r:4.5, color:'#e8b04a', act:() => enterKeep(true)},
  {id:'istanakeluar', name:'Keluar Istana', layer:3, at:[PANG.x, PANG.z + PK.z1 - 3], r:3, color:'#e8b04a', act:() => enterKeep(false)},
);
function enterKeep(inside){ flash('rgba(232,176,74,.45)'); sfx.whoosh(); player.x = PANG.x; player.z = PANG.z + (inside ? 14 : PK.z1 + 12); player.y = pangH(player.x, player.z); player.ry = inside ? Math.PI : 0; cam.yaw = 0;
  if(inside) toast('Galeri Masuk. Dewan Syura di hadapan, Bilik Bunga di kanan, Bilik Pembeku di kiri (tangga menurun).', 'ok', 5000); }
liftPad(0, 0, PK.z1 + 9, pg, 0xe8b04a);
fixedLabel('Pintu Masuk Istana<small>Tekan E di pad emas</small>', PANG.x, PANG.y + 6, PANG.z + PK.z1 + 9, "#e8b04a", 120, 3);
fixedLabel('Jambatan Cahaya<small>Naik ke Istana Pangaea</small>', LAB_PANG_PAD.x, LAB.y + 5, LAB_PANG_PAD.z, '#e8b04a', 50, 1);
fixedLabel('Jambatan Cahaya<small>Turun ke Labophase</small>', PANG_PAD.x, PANG.y + 5, PANG_PAD.z, '#e8b04a', 60, 3);
fixedLabel('Dewan Syura<small>Kerusi kosong · 19 pedang warisan</small>', PANG.x, PANG.y + 10, PANG.z - 22, '#e8b04a', 60, 3);
fixedLabel('Bilik Bunga<small>Taman tafakur</small>', PANG.x + 27, PANG.y + 7, PANG.z - 4, '#9be37a', 50, 3);
fixedLabel('Bilik Pembeku<small>Bawah tanah · topi jerami gergasi</small>', PANG.x - 27, PANG.y + 6, PANG.z - 14, '#9fd8ff', 50, 3);
EXPED.push({id:'istana', name:'Istana Pangaea', sub:'Lapisan puncak · Majlis Syura rahsia', x:50, y:4, layer:3, to:[PANG.x, PANG.z + 40]});

// open the roof when you walk inside the keep; swap the Higgsfield castle in and out
const PANG_HF = {model:null};
anims.push(() => {
  const [lx, lz] = pl(player.x, player.z), inside = player.layer === 3 && inKeep(lx, lz, 1) && cam.dist < 70;
  keepTop.visible = !inside && !PANG_HF.model; keepLow.visible = inside || !PANG_HF.model;
  if(PANG_HF.model) PANG_HF.model.visible = !inside;
  keepInner.userData.light.intensity = inside ? 1.2 : 0; keepInner.userData.cold.intensity = inside ? 1.4 : 0;
});
