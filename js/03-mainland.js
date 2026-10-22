'use strict';
/* ================= Tanah Besar: terrain heights ================= */
const PEAKS = [[470,-160,72,40],[430,-215,58,36],[525,-95,50,34],[500,-205,44,30],[395,-205,30,26]];
const HILLS = [[230,80,16,22],[480,40,20,20],[255,-110,6,30],[400,60,5,30]];
const LAKE = {x:340, z:-40, r:34};
const RIVERS = [[[452,-112],[425,-84],[396,-62],[372,-50]], [[336,-6],[328,40],[318,90],[302,150],[288,200]]];
const FLATS = [[185,-40,72],[300,-188,92],[292,100,34],[230,80,14],[480,40,10],[418,-120,14]];
const NIV_GATE = {x:418, z:-120};
function noise2(x, z){ return Math.sin(x * .045) * Math.cos(z * .05) * .6 + Math.sin(x * .11 + z * .07) * .3 + Math.cos(x * .023 - z * .031) * .8; }
function segDist(px, pz, ax, az, bx, bz){ const vx = bx - ax, vz = bz - az; const t = clamp(((px - ax) * vx + (pz - az) * vz) / (vx * vx + vz * vz), 0, 1); return Math.hypot(px - ax - vx * t, pz - az - vz * t); }
function riverDist(x, z){ let d = 1e9; RIVERS.forEach(p => { for(let i = 0; i < p.length - 1; i++) d = Math.min(d, segDist(x, z, p[i][0], p[i][1], p[i + 1][0], p[i + 1][1])); }); return d; }
function mainH(x, z){
  const d = Math.hypot(x - MAIN.x, z - MAIN.z); if(d > 250) return -8;
  const r = d / MAIN.r;
  let h = .5 - smooth(.84, 1.0, r) * 6.5;
  let flat = 1; for(const [fx, fz, fr] of FLATS) flat = Math.min(flat, smooth(fr * .6, fr, Math.hypot(x - fx, z - fz)));
  h += noise2(x, z) * 1.2 * flat * (1 - smooth(.8, .9, r));
  for(const [px, pz, a, s] of PEAKS) h += a * Math.exp(-((x - px) ** 2 + (z - pz) ** 2) / (2 * s * s));
  for(const [px, pz, a, s] of HILLS) h += a * Math.exp(-((x - px) ** 2 + (z - pz) ** 2) / (2 * s * s));
  const dg = Math.hypot(x - NIV_GATE.x, z - NIV_GATE.z); if(dg < 22) h = lerp(mainHNoGate(x, z, 418, -120), h, smooth(10, 22, dg));
  const dl = Math.hypot(x - LAKE.x, z - LAKE.z); if(dl < LAKE.r + 10) h = Math.min(h, lerp(-3, h, smooth(LAKE.r - 6, LAKE.r + 10, dl)));
  const rd = riverDist(x, z); if(rd < 7) h = Math.min(h, lerp(-.35, h, smooth(3, 7, rd)));
  return h;
}
function mainHNoGate(x, z, gx, gz){ // flat terrace at the Nivelham gate
  let h = .5; for(const [px, pz, a, s] of PEAKS) h += a * Math.exp(-((gx - px) ** 2 + (gz - pz) ** 2) / (2 * s * s)); return h;
}
function coreH(x, z){ const d = Math.hypot(x, z); if(d < 56) return 0; if(d < 70) return -.2 - (d - 56) / 14 * .25; return -8; }
function onBridge(x, z){ return segDist(x, z, BRIDGE.ax, BRIDGE.az, BRIDGE.bx, BRIDGE.bz) < BRIDGE.w / 2; }
function surfaceH(x, z){ if(inAbyss(x, z)) return -300; let h = Math.max(coreH(x, z), mainH(x, z), baseIslandH(x, z)); if(onBridge(x, z)) h = Math.max(h, BRIDGE.h); return h; }

/* --- terrain mesh --- */
const terrainMat = new THREE.MeshStandardMaterial({vertexColors:true, roughness:.9, flatShading:true});
const snowCapMix = {v:0};
const terrainGeo = new THREE.PlaneGeometry(520, 520, 190, 190); terrainGeo.rotateX(-Math.PI / 2);
const tCol = [];
{
  const p = terrainGeo.attributes.position; const c = new THREE.Color();
  const cs = {sand:new THREE.Color(0xe9cf98), grass:new THREE.Color(0x6cb557), grass2:new THREE.Color(0x4f9a4a), rock:new THREE.Color(0x8a8378), snow:new THREE.Color(0xf4f7fb), pave:new THREE.Color(0xb7bcc6), mud:new THREE.Color(0x8a7a5a)};
  for(let i = 0; i < p.count; i++){
    const x = p.getX(i) + MAIN.x, z = p.getZ(i) + MAIN.z, h = mainH(x, z);
    p.setY(i, h);
    if(h < .05) c.copy(cs.sand).lerp(cs.mud, clamp(-h / 3, 0, 1));
    else if(h > 34) c.copy(cs.snow);
    else if(h > 16) c.copy(cs.rock).lerp(cs.snow, smooth(24, 34, h));
    else { c.copy(cs.grass).lerp(cs.grass2, (noise2(x * 2.3, z * 2.3) + 1.7) / 3.4); c.lerp(cs.rock, smooth(9, 16, h)); }
    let paved = 0; [[185,-40,48],[300,-188,72]].forEach(([fx, fz, fr]) => { paved = Math.max(paved, 1 - smooth(fr * .85, fr, Math.hypot(x - fx, z - fz))); });
    if(paved > 0 && h > 0) c.lerp(cs.pave, paved);
    tCol.push(c.r, c.g, c.b);
  }
  terrainGeo.setAttribute('color', new THREE.Float32BufferAttribute(tCol, 3));
  terrainGeo.computeVertexNormals();
}
const tColBase = Float32Array.from(tCol);
const terrain = mesh(terrainGeo, terrainMat, MAIN.x, 0, MAIN.z, S, false); terrain.receiveShadow = true;
function setTerrainSnow(k, tint, tk = .4){ // Island A.C. off: everything turns white; dry seasons tint the ground
  const key = k + ':' + (tint || 0); if(snowCapMix.key === key) return; snowCapMix.key = key; snowCapMix.v = k;
  const a = terrainGeo.attributes.color.array, tc = new THREE.Color(tint || 0xffffff), tkk = tint ? tk : 0;
  for(let i = 0; i < a.length; i += 3){ let r = lerp(tColBase[i], tc.r, tkk), g = lerp(tColBase[i + 1], tc.g, tkk), b = lerp(tColBase[i + 2], tc.b, tkk);
    a[i] = lerp(r, .95, k); a[i + 1] = lerp(g, .97, k); a[i + 2] = lerp(b, 1, k); }
  terrainGeo.attributes.color.needsUpdate = true;
}
const waterMat = new THREE.MeshPhongMaterial({color:0x2f8fc0, shininess:90, transparent:true, opacity:.88});
mesh(new THREE.CircleGeometry(LAKE.r + 6, 48), waterMat, LAKE.x, -.75, LAKE.z, S, false).rotation.x = -Math.PI / 2;
RIVERS.forEach(path => {
  const pts = []; path.forEach(([x, z]) => pts.push(new THREE.Vector3(x, 0, z)));
  const curve = new THREE.CatmullRomCurve3(pts); const N = 60; const pos = [], idx = [];
  for(let i = 0; i <= N; i++){ const t = i / N, p = curve.getPoint(t), tg = curve.getTangent(t); const nx = -tg.z, nz = tg.x, l = Math.hypot(nx, nz) || 1;
    pos.push(p.x + nx / l * 3.4, -.22, p.z + nz / l * 3.4, p.x - nx / l * 3.4, -.22, p.z - nz / l * 3.4);
    if(i < N){ const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
  const m = new THREE.Mesh(g, new THREE.MeshPhongMaterial({color:0x48a8d8, shininess:90, transparent:true, opacity:.85, side:THREE.DoubleSide})); S.add(m);
});

/* --- Jambatan Cahaya --- */
{
  const ang = Math.atan2(BRIDGE.bx - BRIDGE.ax, BRIDGE.bz - BRIDGE.az), len = Math.hypot(BRIDGE.bx - BRIDGE.ax, BRIDGE.bz - BRIDGE.az);
  const b = grp((BRIDGE.ax + BRIDGE.bx) / 2, 0, (BRIDGE.az + BRIDGE.bz) / 2); b.rotation.y = ang;
  mesh(new THREE.BoxGeometry(BRIDGE.w, .5, len), M(0xd9dde6, {metalness:.3}), 0, BRIDGE.h - .25, 0, b);
  [-1, 1].forEach(s => { mesh(new THREE.BoxGeometry(.3, 1, len), M(0xeef1f6), s * BRIDGE.w / 2, BRIDGE.h + .5, 0, b); mesh(new THREE.BoxGeometry(.12, .12, len), padMat, s * (BRIDGE.w / 2 - .2), BRIDGE.h + 1.05, 0, b, false); });
  for(let i = -2; i <= 2; i++){ mesh(new THREE.CylinderGeometry(.8, 1, 6, 10), M(0xb9c2d2), 0, -3, i * len / 5, b); }
  const arch = mesh(new THREE.TorusGeometry(len / 2, .45, 8, 60, Math.PI), M(0xff4f45, {metalness:.3}), 0, BRIDGE.h, 0, b); arch.rotation.y = Math.PI / 2; arch.scale.y = .32;
  for(let i = -6; i <= 6; i++){ const z = i * len / 13; const y = Math.sqrt(Math.max(0, 1 - (2 * z / len) ** 2)) * len / 2 * .32; if(y > 1) mesh(new THREE.CylinderGeometry(.05, .05, y, 4), M(0xeef1f6), 0, BRIDGE.h + y / 2, z, b, false); }
}

/* ================= Pusat Komuniti Awam ================= */
const COM = {x:185, z:-40};
const stone = M(0xeee9df, {roughness:.6}), stoneDark = M(0xcfc7b8, {roughness:.7}), gold = M(0xd6b25e, {metalness:.6, roughness:.35});
// Menara Jam Besar
const CLOCK = {x:185, z:-40};
const clockCanvas = document.createElement('canvas'); clockCanvas.width = clockCanvas.height = 256;
const clockTex = new THREE.CanvasTexture(clockCanvas);
function drawClockFace(now){
  const g = clockCanvas.getContext('2d'), c = 128;
  g.fillStyle = '#f7f2e6'; g.beginPath(); g.arc(c, c, 124, 0, 6.283); g.fill();
  g.strokeStyle = '#8a6a2a'; g.lineWidth = 8; g.stroke();
  g.save(); g.translate(c, c);
  for(let i = 0; i < 12; i++){ g.save(); g.rotate(i * Math.PI / 6); g.fillStyle = '#3a3226'; g.fillRect(-3, -112, 6, i % 3 ? 14 : 24); g.restore(); }
  for(let k = 0; k < 8; k++){ g.save(); g.rotate(k * Math.PI / 4); g.strokeStyle = 'rgba(138,106,42,.35)'; g.lineWidth = 2; g.strokeRect(-26, -26, 52, 52); g.restore(); }
  const h = now.getHours() % 12, m = now.getMinutes(), s = now.getSeconds();
  const hand = (ang, len, w, col) => { g.save(); g.rotate(ang); g.fillStyle = col; g.fillRect(-w / 2, -len, w, len + 12); g.restore(); };
  hand((h + m / 60) * Math.PI / 6, 64, 9, '#2b2419'); hand((m + s / 60) * Math.PI / 30, 96, 6, '#2b2419');
  g.fillStyle = '#c9a24a'; g.beginPath(); g.arc(0, 0, 9, 0, 6.283); g.fill(); g.restore();
  clockTex.needsUpdate = true;
}
drawClockFace(new Date());
const clockFaceMat = new THREE.MeshBasicMaterial({map:clockTex});
const clockTower = grp(CLOCK.x, 0, CLOCK.z);
const ctProc = grp(0, 0, 0, clockTower);
mesh(new THREE.BoxGeometry(12, 2, 12), stoneDark, 0, 1, 0, ctProc);
mesh(new THREE.BoxGeometry(8, 30, 8), stone, 0, 17, 0, ctProc);
const ctFaces = grp(0, 0, 0, clockTower);
for(let i = 0; i < 4; i++){ const a = i * Math.PI / 2; const p = grp(0, 0, 0, ctProc); p.rotation.y = a;
  for(let k = 0; k < 5; k++) mesh(new THREE.BoxGeometry(1.2, 2.6, .3), M(0x6a8fb8, {emissive:0x6a8fb8, emissiveIntensity:.2}), 0, 6 + k * 5, 4.05, p, false);
  const f = grp(0, 36, 4.62, grp(0, 0, 0, ctFaces)); f.parent.rotation.y = a;
  mesh(new THREE.CircleGeometry(3.2, 40), clockFaceMat, 0, 0, 0, f, false);
  mesh(new THREE.TorusGeometry(3.3, .25, 8, 40), gold, 0, 0, -.02, f, false); }
mesh(new THREE.BoxGeometry(9.2, 9, 9.2), stone, 0, 36, 0, ctProc);
mesh(new THREE.BoxGeometry(10, 1, 10), gold, 0, 41, 0, ctProc);
for(let i = 0; i < 4; i++){ const a = i * Math.PI / 2 + Math.PI / 4; mesh(new THREE.CylinderGeometry(.5, .5, 5, 8), stone, Math.cos(a) * 4.2, 44, Math.sin(a) * 4.2, ctProc); }
mesh(new THREE.CylinderGeometry(3.8, 3.8, 1, 16), stone, 0, 46.8, 0, ctProc);
const ctDome = mesh(new THREE.SphereGeometry(3.6, 24, 12, 0, 6.283, 0, Math.PI / 2), gold, 0, 47.2, 0, ctProc); ctDome.scale.y = 1.35;
mesh(new THREE.CylinderGeometry(.12, .12, 3, 6), gold, 0, 53.2, 0, ctProc);
mesh(new THREE.TorusGeometry(.8, .16, 6, 20, Math.PI * 1.4), gold, 0, 55.3, 0, ctProc).rotation.z = -.9;
const bellLight = new THREE.PointLight(0xffd27a, 0, 60); bellLight.position.set(0, 44, 0); clockTower.add(bellLight);
info(clockTower, 'Menara Jam Besar', 'Menunjukkan masa sebenar dan berbunyi pada setiap waktu solat zon yang kau pilih.');
collide(CLOCK.x, CLOCK.z, 6.5);
// Masjid
const MASJID = {x:214, z:-84};
const masjid = grp(MASJID.x, 0, MASJID.z); masjid.rotation.y = -.35;
const msProc = grp(0, 0, 0, masjid);
mesh(new THREE.BoxGeometry(30, 1.2, 26), stoneDark, 0, .6, 0, msProc);
mesh(new THREE.BoxGeometry(24, 10, 20), stone, 0, 6.2, 0, msProc);
for(let i = 0; i < 7; i++){ const x = -9 + i * 3; mesh(new THREE.BoxGeometry(1.6, 5, .3), M(0x5a8f9a, {emissive:0x5a8f9a, emissiveIntensity:.3}), x, 5, 10.05, msProc, false); mesh(new THREE.CylinderGeometry(.8, .8, .3, 16, 1, false, 0, Math.PI), M(0x5a8f9a), x, 7.5, 10.1, msProc, false).rotation.x = Math.PI / 2; }
mesh(new THREE.CylinderGeometry(7, 7.5, 3, 24), stone, 0, 12.6, 0, msProc);
const mdome = mesh(new THREE.SphereGeometry(7, 32, 16, 0, 6.283, 0, Math.PI / 2), M(0x3f8f8a, {metalness:.4, roughness:.35}), 0, 14, 0, msProc); mdome.scale.y = 1.15;
mesh(new THREE.CylinderGeometry(.15, .15, 3, 6), gold, 0, 23, 0, msProc);
mesh(new THREE.TorusGeometry(.9, .18, 6, 20, Math.PI * 1.4), gold, 0, 25, 0, msProc).rotation.z = -.9;
[[-10, 8], [10, 8], [-10, -8], [10, -8]].forEach(([x, z]) => { mesh(new THREE.CylinderGeometry(2, 2, 1, 16), stone, x, 11.7, z, msProc); mesh(new THREE.SphereGeometry(2, 16, 8, 0, 6.283, 0, Math.PI / 2), M(0x3f8f8a, {metalness:.4}), x, 12.2, z, msProc); });
const minaret = grp(15, 0, 11, msProc);
mesh(new THREE.CylinderGeometry(1.6, 2, 32, 12), stone, 0, 16, 0, minaret);
[12, 24].forEach(y => mesh(new THREE.CylinderGeometry(2.6, 2.2, 1, 12), stone, 0, y, 0, minaret));
mesh(new THREE.CylinderGeometry(1.4, 1.4, 3, 12), M(0xfff2c0, {emissive:0xffe6a8, emissiveIntensity:.2}), 0, 33.5, 0, minaret);
mesh(new THREE.ConeGeometry(1.8, 5, 12), M(0x3f8f8a, {metalness:.4}), 0, 37.5, 0, minaret);
mesh(new THREE.TorusGeometry(.55, .12, 6, 16, Math.PI * 1.4), gold, 0, 41, 0, minaret).rotation.z = -.9;
info(masjid, 'Masjid Pusat Komuniti', 'Rumah ibadah di tengah komuniti awam Erythmind. Menara Jam di dataran berbunyi mengikut waktu solat.');
collide(MASJID.x, MASJID.z, 14); collide(MASJID.x + 15 * Math.cos(.35) + 11 * Math.sin(.35), MASJID.z + 11 * Math.cos(.35) - 15 * Math.sin(.35), 3);
// Dewan Komuniti + public board
const DEWAN = {x:170, z:4};
const dewan = grp(DEWAN.x, 0, DEWAN.z); dewan.rotation.y = Math.PI;
mesh(new THREE.BoxGeometry(26, 9, 14), M(0xf2f4f8, {roughness:.5}), 0, 4.5, 0, dewan);
mesh(new THREE.BoxGeometry(24, 7, .3), M(0x9fd8ff, {transparent:true, opacity:.55, metalness:.6, roughness:.1}), 0, 4, -7.1, dewan, false);
mesh(new THREE.BoxGeometry(28, .8, 16), M(0xff4f45, {metalness:.3}), 0, 9.4, 0, dewan);
mesh(new THREE.BoxGeometry(18, .4, 10), M(0x6cbf58), 0, 10, 0, dewan);
const boardCanvas = document.createElement('canvas'); boardCanvas.width = 512; boardCanvas.height = 256;
const boardTex = new THREE.CanvasTexture(boardCanvas);
function drawBoard(posts){
  const g = boardCanvas.getContext('2d');
  g.fillStyle = 'rgba(8,16,30,.92)'; g.fillRect(0, 0, 512, 256); g.strokeStyle = '#9fc8ff'; g.lineWidth = 4; g.strokeRect(4, 4, 504, 248);
  g.fillStyle = '#9fc8ff'; g.font = '600 22px Cinzel, Georgia, serif'; g.fillText('PAPAN KENYATAAN AWAM', 22, 42);
  g.fillStyle = '#e9edf6'; g.font = '500 24px EB Garamond, Georgia, serif';
  const p = posts[posts.length - 1]; const text = p ? p.text : 'Belum ada kenyataan. Pemilik boleh menampal di Dewan Komuniti.';
  const words = String(text).split(/\s+/); let line = '', y = 92;
  for(const w of words){ const t = line ? line + ' ' + w : w; if(g.measureText(t).width > 460){ g.fillText(line, 22, y); line = w; y += 32; if(y > 220) break; } else line = t; }
  if(y <= 220) g.fillText(line, 22, y);
  boardTex.needsUpdate = true;
}
drawBoard([]);
const board = grp(DEWAN.x + 2, 0, DEWAN.z - 12);
mesh(new THREE.BoxGeometry(.4, 5, .4), M(0x3a4258), -4.2, 2.5, 0, board); mesh(new THREE.BoxGeometry(.4, 5, .4), M(0x3a4258), 4.2, 2.5, 0, board);
mesh(new THREE.PlaneGeometry(8, 4), new THREE.MeshBasicMaterial({map:boardTex, transparent:true, side:THREE.DoubleSide}), 0, 4.4, 0, board, false);
collide(DEWAN.x, DEWAN.z, 12);
// amphitheatre
const amph = grp(222, 0, -8);
for(let i = 0; i < 5; i++) mesh(new THREE.CylinderGeometry(9 + i * 2.2, 9 + i * 2.2, .6 + i * .6, 32, 1, false, Math.PI * .1, Math.PI * .8), stoneDark, 0, (.6 + i * .6) / 2, 0, amph);
mesh(new THREE.CylinderGeometry(6, 6, .4, 32), stone, 0, .2, 0, amph);
collide(222, -8, 3);
// pasar stalls
const awnings = [0xff4f45, 0xffb86b, 0x9fc8ff, 0x9be37a, 0xc9b8ff];
for(let i = 0; i < 10; i++){ const a = 2.6 + i * .16, d = 34; const x = COM.x + Math.cos(a) * d, z = COM.z + Math.sin(a) * d; const s = grp(x, 0, z); s.rotation.y = -a + Math.PI / 2;
  mesh(new THREE.BoxGeometry(3, 1.1, 1.6), wood, 0, .55, 0, s); mesh(new THREE.BoxGeometry(3.4, .15, 2.2), M(awnings[i % 5]), 0, 2.6, .2, s).rotation.x = -.2;
  [-1.5, 1.5].forEach(px => mesh(new THREE.CylinderGeometry(.06, .06, 2.6, 4), wood, px, 1.3, -.6, s, false)); collide(x, z, 1.6); }
// plaza trees, fountains, benches, lamps
const plazaTrees = [];
for(let i = 0; i < 14; i++){ const a = i / 14 * 6.283, d = 24; plazaTrees.push([COM.x + Math.cos(a) * d, COM.z + Math.sin(a) * d]); }
[[COM.x - 12, COM.z + 12], [COM.x + 12, COM.z - 12]].forEach(([x, z]) => { mesh(new THREE.CylinderGeometry(3, 3.4, .8, 24), stone, x, .4, z); mesh(new THREE.CylinderGeometry(2.6, 2.6, .2, 24), waterMat, x, .75, z, S, false); mesh(new THREE.CylinderGeometry(.3, .5, 2.4, 8), stone, x, 1.6, z); collide(x, z, 3.2); });

/* ================= Kota Awam (futuristic semi-urban) ================= */
const CITY = {x:300, z:-188};
const glassTex = [windowTex(21, '#bfe8ff', '#1c2a44'), windowTex(33, '#ffe2a8', '#2a2438'), windowTex(47, '#d9fff2', '#16323a')];
const cityMats = glassTex.map(t => { const m = new THREE.MeshStandardMaterial({color:0xffffff, map:t, emissive:0xffffff, emissiveMap:t, emissiveIntensity:.2, roughness:.35, metalness:.4}); nightMats.push([m, .12, 1.15]); return m; });
const cr = mulberry(77);
const STRUCTS = [];   // buildings that can be cracked by powers and repaired by contractors: {x,z,w,d,h,layer}
function tower(x, z, w, d, h, kind){
  const g = new THREE.BoxGeometry(w, h, d); const uv = g.attributes.uv;
  for(let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w / 7, uv.getY(i) * h / 10);
  const m = mesh(g, cityMats[kind % 3], x, h / 2, z);
  if(cr() > .55) mesh(new THREE.BoxGeometry(w * .9, .6, d * .9), M(0x5fae5a), x, h + .3, z);
  else if(cr() > .5){ mesh(new THREE.CylinderGeometry(w * .3, w * .45, h * .18, 8), M(0xdfe6f2, {metalness:.5}), x, h + h * .09, z); mesh(new THREE.SphereGeometry(.5, 8, 6), new THREE.MeshBasicMaterial({color:0xff4f45}), x, h + h * .18 + .5, z, S, false); }
  collide(x, z, Math.max(w, d) * .62); STRUCTS.push({x, z, w, d, h, y:0, layer:0, name:'Menara Kota Awam'});
  return m;
}
const cityBlocks = [];
for(let i = 0; i < 5; i++) for(let j = 0; j < 4; j++){
  const bx = 248 + i * 26, bz = -226 + j * 26; if(Math.hypot(bx - CITY.x, bz - CITY.z) < 14) continue;
  cityBlocks.push([bx, bz]);
  const n = 1 + Math.floor(cr() * 3);
  for(let k = 0; k < n; k++){ const ox = (k - (n - 1) / 2) * 7, w = 5 + cr() * 3, h = 14 + cr() * (Math.hypot(bx - CITY.x, bz - CITY.z) < 50 ? 52 : 26); tower(bx + ox, bz + (cr() - .5) * 6, w, 6 + cr() * 4, h, Math.floor(cr() * 3)); }
}
// central city plaza: holo spire
const spire = grp(CITY.x, 0, CITY.z);
mesh(new THREE.CylinderGeometry(9, 9, .3, 32), M(0xd0d6e2), 0, .15, 0, spire, false);
mesh(new THREE.CylinderGeometry(.6, 1.6, 34, 6), M(0xeef1f6, {metalness:.6, roughness:.25}), 0, 17, 0, spire);
const spireRings = [0, 1, 2, 3].map(i => mesh(new THREE.TorusGeometry(3 + i * .8, .12, 6, 40), holoMat(i % 2 ? 0xff4f45 : 0x9fc8ff, .7), 0, 10 + i * 6, 0, spire, false));
anims.push((t, dt) => spireRings.forEach((r, i) => { r.rotation.x = Math.PI / 2 + Math.sin(t * .5 + i) * .3; r.rotation.z += dt * (i % 2 ? .5 : -.4); }));
info(spire, 'Menara Isyarat Kota Awam', 'Hab rangkaian bot risikan. Setiap laporan bot melalui menara ini sebelum sampai kepada pemilik.');
collide(CITY.x, CITY.z, 2.4);
// streets
for(let i = 0; i < 6; i++){ mesh(new THREE.BoxGeometry(4, .05, 110), roadMat, 235 + i * 26, .06, -187, S, false); }
for(let j = 0; j < 5; j++){ mesh(new THREE.BoxGeometry(135, .05, 4), roadMat, 300, .07, -239 + j * 26, S, false); }
mesh(new THREE.BoxGeometry(4, .05, 140), roadMat, 236, .06, -95, S, false).rotation.y = -.4;
// holo billboards
const bbHues = [0xff4f45, 0x9fc8ff, 0xffb86b, 0xc9b8ff];
const billboards = [];
for(let i = 0; i < 7; i++){ const [bx, bz] = cityBlocks[(i * 3) % cityBlocks.length]; const b = mesh(new THREE.PlaneGeometry(6, 3.4), holoMat(bbHues[i % 4], .55), bx + 4, 12 + (i % 3) * 5, bz + 5.5, S, false); b.rotation.y = (i % 2) * Math.PI / 2; billboards.push(b); }
anims.push(t => billboards.forEach((b, i) => { b.material.opacity = .35 + Math.sin(t * 2 + i) * .15 + nightLevel * .2; }));
// monorail loop
const railCurve = new THREE.CatmullRomCurve3(Array.from({length:16}, (_, i) => { const a = i / 16 * 6.283; return new THREE.Vector3(CITY.x + Math.cos(a) * 84, 18, CITY.z + Math.sin(a) * 48); }), true);
mesh(new THREE.TubeGeometry(railCurve, 160, .6, 6, true), M(0xdfe6f2, {metalness:.5, roughness:.3}), 0, 0, 0, S);
for(let i = 0; i < 16; i++){ const p = railCurve.getPoint(i / 16); mesh(new THREE.CylinderGeometry(.5, .7, 18, 8), M(0xb9c2d2), p.x, 9, p.z); collide(p.x, p.z, .9); }
const train = grp();
for(let i = 0; i < 4; i++){ const car = mesh(new THREE.BoxGeometry(2.6, 2.4, 6), M(i ? 0xf4f6fa : 0xff4f45, {metalness:.5, roughness:.25}), 0, 0, 0, train); car.userData.k = i; mesh(new THREE.BoxGeometry(2.62, .7, 5), lampMat, 0, .4, 0, car, false); }
anims.push((t, dt) => { train.children.forEach((car, i) => { const u = ((t * .018) - i * .012 + 10) % 1; const p = railCurve.getPoint(u), q = railCurve.getPoint((u + .002) % 1); car.position.set(p.x, p.y + 1.8, p.z); car.lookAt(q.x, q.y + 1.8, q.z); }); });
info(train, 'Monorel Kota Awam', 'Gelung monorel mengelilingi pusat Kota Awam setiap 55 saat.');
// street lamps
const lampPositions = [];
for(let i = 0; i < 6; i++) for(let j = 0; j < 5; j++) lampPositions.push([237 + i * 26, -237 + j * 26]);
for(let i = 0; i < 14; i++){ const a = i / 14 * 6.283 + .22; lampPositions.push([COM.x + Math.cos(a) * 44, COM.z + Math.sin(a) * 44]); }
for(let i = 0; i < 10; i++){ const t = (i + .5) / 10; lampPositions.push([lerp(BRIDGE.ax, BRIDGE.bx, t), lerp(BRIDGE.az, BRIDGE.bz, t)]); }
{
  const pole = new THREE.InstancedMesh(new THREE.CylinderGeometry(.08, .1, 5, 5), M(0x3a4258), lampPositions.length);
  const bulb = new THREE.InstancedMesh(new THREE.SphereGeometry(.32, 8, 6), lampMat, lampPositions.length);
  const m4 = new THREE.Matrix4();
  lampPositions.forEach(([x, z], i) => { const h = surfaceH(x, z); m4.makeTranslation(x, h + 2.5, z); pole.setMatrixAt(i, m4); m4.makeTranslation(x, h + 5.1, z); bulb.setMatrixAt(i, m4); });
  S.add(pole); S.add(bulb);
}

/* ================= Taman Falsafah ================= */
const FAL = {x:292, z:100};
const fal = grp(FAL.x, 0, FAL.z);
mesh(new THREE.BoxGeometry(34, .3, 18), M(0xe8e1d2), 0, .15, 0, fal, false);
mesh(new THREE.BoxGeometry(26, .2, 7), waterMat, 0, .35, 2, fal, false);
for(let i = 0; i < 12; i++){ mesh(new THREE.CylinderGeometry(.45, .5, 6, 12), marble, -16.5 + i * 3, 3, -7.5, fal); }
mesh(new THREE.BoxGeometry(36, .9, 3.2), marble, 0, 6.4, -7.5, fal);
mesh(new THREE.BoxGeometry(36, .3, 6), M(0xb06a4a), 0, 7, -9, fal).rotation.x = .25;
mesh(new THREE.BoxGeometry(36, .3, 2.5), stoneDark, 0, .15, -7.5, fal, false);
[-10, 0, 10].forEach(x => mesh(new THREE.BoxGeometry(3.6, .6, 1.1), marble, x, .5, 7.5, fal));
const mono = mesh(new THREE.BoxGeometry(2.4, 7, 1), M(0x2b2f3a, {metalness:.3, roughness:.3}), 13, 3.5, 4, fal);
const monoText = mesh(new THREE.PlaneGeometry(1.8, 5.4), holoMat(0xc9b8ff, .5), 13, 3.6, 4.52, fal, false);
anims.push(t => { monoText.material.opacity = .3 + Math.sin(t * .8) * .2; });
info(mono, 'Batu Renungan', '"Fikir sebelum yakin; ragu sebelum menghukum." Monolit tempat menulis soalan besar.');
const oliveMat = M(0x7a9a5a);
for(let i = 0; i < 9; i++){ const a = i / 9 * 6.283, d = 22 + (i % 2) * 5; const x = FAL.x + Math.cos(a) * d, z = FAL.z + Math.sin(a) * d * .8; const g = grp(x, surfaceH(x, z), z); swayGroups.push(g);
  mesh(new THREE.CylinderGeometry(.3, .5, 2.6, 6), trunkMat, 0, 1.3, 0, g); mesh(new THREE.IcosahedronGeometry(2.2, 0), oliveMat, 0, 3.6, 0, g).scale.y = .7; collide(x, z, .8); }
collide(FAL.x + 13, FAL.z + 4, 1.6);
for(let i = 0; i < 12; i++) collide(FAL.x - 16.5 + i * 3, FAL.z - 7.5, .7);
// butterflies
const butterflies = [];
for(let i = 0; i < 10; i++){ const b = grp(); const wm = new THREE.MeshBasicMaterial({color:[0xfff2a8, 0xc9b8ff, 0xffb86b][i % 3], side:THREE.DoubleSide});
  const wl = mesh(new THREE.PlaneGeometry(.5, .4), wm, -.25, 0, 0, b, false), wr = mesh(new THREE.PlaneGeometry(.5, .4), wm, .25, 0, 0, b, false); b.userData = {wl, wr, a:rng() * 6, r:6 + rng() * 10}; butterflies.push(b); }
anims.push((t, dt) => butterflies.forEach((b, i) => { const u = b.userData; u.a += dt * .3; b.position.set(FAL.x + Math.cos(u.a + i) * u.r, 1.5 + Math.sin(t * 2 + i) * .6, FAL.z + Math.sin(u.a * 1.3 + i) * u.r * .6); const f = Math.sin(t * 18 + i) * 1.1; u.wl.rotation.y = f; u.wr.rotation.y = -f; b.rotation.y = u.a; }));

/* ================= Menara Strategi ================= */
const STR = {x:230, z:80};
const strH = surfaceH(STR.x, STR.z);
const strat = grp(STR.x, strH, STR.z);
for(let i = 0; i < 6; i++){ const r = 6 - i * .6; mesh(new THREE.CylinderGeometry(r, r + .3, 7, 8), M(i % 2 ? 0x2b3146 : 0x394160, {metalness:.4, roughness:.4}), 0, 3.5 + i * 7, 0, strat); mesh(new THREE.CylinderGeometry(r + .5, r + .5, .5, 8), new THREE.MeshBasicMaterial({color:0xffd27a}), 0, 7 + i * 7, 0, strat, false); }
const mapTable = grp(0, 44, 0, strat);
mesh(new THREE.CylinderGeometry(4.5, 4.5, .4, 32), holoMat(0xffd27a, .45), 0, 0, 0, mapTable, false);
mesh(new THREE.CylinderGeometry(4.5, 4.5, .4, 16), holoWire(0xffd27a, .6), 0, 0, 0, mapTable, false);
[[1, 1], [-1.6, .4], [.4, -2], [-1, -1.2], [2, -.6]].forEach(([x, z], i) => mesh(new THREE.ConeGeometry(.35, 1.4, 6), holoMat(i % 2 ? 0xff4f45 : 0x9fc8ff, .9), x, 1, z, mapTable, false));
anims.push((t, dt) => { mapTable.rotation.y += dt * .2; });
const kn = grp(-9, 0, 7, strat); // giant hologram chess pieces
mesh(new THREE.CylinderGeometry(1.6, 2, 1, 16), holoMat(0xffd27a, .4), 0, .5, 0, kn, false); mesh(new THREE.CylinderGeometry(.9, 1.3, 4, 16), holoMat(0xffd27a, .35), 0, 3, 0, kn, false);
mesh(new THREE.BoxGeometry(1.2, 2.6, 2.4), holoMat(0xffd27a, .45), 0, 6, .4, kn, false).rotation.x = -.4;
const kg = grp(9, 0, 7, strat);
mesh(new THREE.CylinderGeometry(1.6, 2, 1, 16), holoMat(0x9fc8ff, .4), 0, .5, 0, kg, false); mesh(new THREE.CylinderGeometry(.9, 1.4, 6, 16), holoMat(0x9fc8ff, .35), 0, 4, 0, kg, false);
mesh(new THREE.BoxGeometry(.4, 2, .4), holoMat(0x9fc8ff, .7), 0, 8, 0, kg, false); mesh(new THREE.BoxGeometry(1.4, .4, .4), holoMat(0x9fc8ff, .7), 0, 8.3, 0, kg, false);
info(strat, 'Menara Strategi', 'Bilik gerakan. Meja peta hologram di puncak memaparkan strategi yang sedang berjalan.');
collide(STR.x, STR.z, 6.6);

/* ================= Balai Cerap ================= */
const OBS = {x:480, z:40};
const obs = grp(OBS.x, surfaceH(OBS.x, OBS.z), OBS.z);
mesh(new THREE.CylinderGeometry(6, 6.4, 6, 24), stone, 0, 3, 0, obs);
const obsDome = mesh(new THREE.SphereGeometry(6.2, 32, 16, 0, 6.283, 0, Math.PI / 2), M(0xeef1f6, {metalness:.5, roughness:.3}), 0, 6, 0, obs);
const slitMat = new THREE.MeshBasicMaterial({color:0x1a2340}); nightMats.push([slitMat, 0, 0]);
mesh(new THREE.BoxGeometry(1.6, 6, 6.4), slitMat, 0, 9, 0, obs, false).rotation.x = .5;
const scope = mesh(new THREE.CylinderGeometry(.6, .9, 9, 12), M(0x3a4258, {metalness:.6}), 0, 10, 2, obs); scope.rotation.x = -.6;
anims.push((t, dt) => { obsDome.rotation.y += dt * .02; });
info(obs, 'Balai Cerap', 'Tempat pemikir merenung langit. Klik untuk fasa bulan malam ini.');
collide(OBS.x, OBS.z, 6.8);

/* ================= Gerbang Nivelham ================= */
const gateH = surfaceH(NIV_GATE.x, NIV_GATE.z);
const nGate = grp(NIV_GATE.x, gateH, NIV_GATE.z); nGate.rotation.y = .7;
const rune = M(0x5a6a7a, {roughness:.8});
mesh(new THREE.BoxGeometry(3, 16, 3), rune, -7, 8, 0, nGate); mesh(new THREE.BoxGeometry(3, 16, 3), rune, 7, 8, 0, nGate);
mesh(new THREE.BoxGeometry(18, 3, 3.4), rune, 0, 17, 0, nGate);
mesh(new THREE.PlaneGeometry(11, 15), new THREE.MeshBasicMaterial({color:0x061018}), 0, 7.5, -.6, nGate, false);
const iceGlow = mesh(new THREE.PlaneGeometry(11, 15), holoMat(0x8fe0ff, .25), 0, 7.5, -.4, nGate, false);
for(let i = 0; i < 7; i++) mesh(new THREE.BoxGeometry(.5, .5, .2), new THREE.MeshBasicMaterial({color:0x8fe0ff}), -6 + i * 2, 17, 1.75, nGate, false);
liftPad(0, 0, 4, nGate, 0x8fe0ff);
anims.push(t => { iceGlow.material.opacity = .15 + Math.sin(t * 1.5) * .1; });
info(nGate, 'Gerbang Nivelham', 'Lif aci menuju lapisan bawah tanah: lembah salji, Gua Besar dan Perpustakaan Hikmah.');
[-7, 7].forEach(x => collide(NIV_GATE.x + x * Math.cos(.7), NIV_GATE.z - x * Math.sin(.7), 2.2));
const NIV_PAD = {x:NIV_GATE.x + 4 * Math.sin(.7), z:NIV_GATE.z + 4 * Math.cos(.7)};

/* ================= vegetation (instanced) ================= */
function scatterTrees(n, seed, fn){
  const r = mulberry(seed), pts = [];
  for(let tries = 0; pts.length < n && tries < n * 30; tries++){
    const x = MAIN.x + (r() - .5) * 440, z = MAIN.z + (r() - .5) * 440; const h = mainH(x, z); if(inAbyss(x, z)) continue;
    if(h < .3 || h > 26) continue; if(fn && !fn(x, z, h, r)) continue;
    if(FLATS.some(([fx, fz, fr]) => Math.hypot(x - fx, z - fz) < fr * .95)) continue;
    if(riverDist(x, z) < 8 || Math.hypot(x - LAKE.x, z - LAKE.z) < LAKE.r + 9 || onBridge(x, z)) continue;
    pts.push([x, z, h, .8 + r() * .9]);
  }
  return pts;
}
const treePts = scatterTrees(420, 9, (x, z, h, r) => h > 3 || r() > .55);
{
  const trunk = new THREE.InstancedMesh(new THREE.CylinderGeometry(.3, .45, 3, 6), trunkMat, treePts.length);
  const leafA = new THREE.InstancedMesh(new THREE.ConeGeometry(2.2, 4.4, 7), leafMats[0], treePts.length);
  const leafB = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(2.4, 0), leafMats[1], treePts.length);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3();
  let ia = 0, ib = 0; const wt = {mesh: trunk, items: []}, wa = {mesh: leafA, items: []}, wb = {mesh: leafB, items: []};
  treePts.forEach(([x, z, h, k], i) => {
    m4.compose(p.set(x, h + 1.5 * k, z), q, s.set(k, k, k)); trunk.setMatrixAt(i, m4); wt.items.push({x, y: h, z, k, oy: 1.5 * k, sy: 1});
    if(h > 8 || i % 2){ m4.compose(p.set(x, h + 4.6 * k, z), q, s.set(k, k, k)); leafA.setMatrixAt(ia++, m4); wa.items.push({x, y: h, z, k, oy: 4.6 * k, sy: 1}); }
    else { m4.compose(p.set(x, h + 4.2 * k, z), q, s.set(k, k * .85, k)); leafB.setMatrixAt(ib++, m4); wb.items.push({x, y: h, z, k, oy: 4.2 * k, sy: .85}); }
    if(i % 3 === 0) collide(x, z, .6 * k);
  });
  leafA.count = ia; leafB.count = ib; windInst.push(wt, wa, wb);
  [trunk, leafA, leafB].forEach(m => { m.castShadow = true; m.receiveShadow = true; S.add(m); });
  plazaTrees.forEach(([x, z]) => { const g = grp(x, 0, z); swayGroups.push(g); mesh(new THREE.CylinderGeometry(.3, .4, 3, 6), trunkMat, 0, 1.5, 0, g); mesh(new THREE.IcosahedronGeometry(2.2, 0), leafMats[1], 0, 4.2, 0, g); collide(x, z, .7); });
}
// rocks
{
  const rocks = scatterTrees(90, 41, (x, z, h) => h > 6);
  const rk = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1.6, 0), M(0x8a8378), rocks.length);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3(), e = new THREE.Euler();
  rocks.forEach(([x, z, h, k], i) => { q.setFromEuler(e.set(k, k * 3, 0)); m4.compose(p.set(x, h + .4, z), q, s.set(k * 1.4, k, k * 1.2)); rk.setMatrixAt(i, m4); });
  rk.castShadow = true; S.add(rk);
}
