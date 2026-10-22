'use strict';
/* ================= Nivelham (layer 2): a vast cavern beneath Tanah Besar ================= */
// The mainland is a thick slab; under it lies a snowy cavern world, open to a cloud abyss through a
// giant rock arch on the south-east cliff, so the lower world is visible from outside.
const VIL = {x:300, z:48};                    // Perkampungan Gua Besar (Viking-style timber village)
const TREE_AT = {x:395, z:22};                // Pokok Purba
const NV = {
  arrive:{x:NIV_PAD.x, z:NIV_PAD.z},
  spring:{x:368, z:46},
  lib:{x:442, z:48}, ramp:{x0:401, x1:429, z:48, w:7, top:32},
  hall:{x:300, z:18},
};
const nivRegion = (x, z) => Math.hypot(x - VIL.x, z - VIL.z) < 62 ? 'gua' : (Math.hypot(x - TREE_AT.x, z - TREE_AT.z) < 50 || onRamp8(x, z) || Math.hypot(x - NV.lib.x, z - NV.lib.z) < 14) ? 'hikmah' : 'lembah';
const onRamp8 = (x, z) => { const R = NV.ramp; return Math.abs(z - R.z) < R.w / 2 && x >= R.x0 - 1 && x <= R.x1 + 1; };
const NPEAKS = [[330,-200,82,34],[262,-145,58,28],[420,-190,70,30],[232,-62,44,26],[300,-245,50,30]];
function nivH(x, z){
  const R = NV.ramp;
  if(Math.abs(z - R.z) < R.w / 2 && x >= R.x0 && x <= R.x1) return Math.max(0, (x - R.x0) / (R.x1 - R.x0) * R.top);
  if(Math.hypot(x - NV.lib.x, z - NV.lib.z) < 13.5) return R.top;
  const rr = Math.hypot(x - CAVE.x, z - CAVE.z);
  let h = noise2(x * 1.3, z * 1.3) * 2.2 + Math.sin(x * .03) * 1.5;
  for(const [px, pz, a, s] of NPEAKS) h += a * Math.exp(-((x - px) ** 2 + (z - pz) ** 2) / (2 * s * s));
  h = lerp(.4, h, smooth(40, 62, Math.hypot(x - VIL.x, z - VIL.z)));
  h = lerp(.3, h, smooth(34, 52, Math.hypot(x - TREE_AT.x, z - TREE_AT.z)));
  const dl = Math.hypot(x - 360, z - 110 + 220); if(dl < 24) h = lerp(-.4, h, smooth(18, 24, dl));
  const da = Math.hypot(x - NV.arrive.x, z - NV.arrive.z); if(da < 18) h = lerp(.5, h, smooth(9, 18, da));
  h = lerp(h, -90, smooth(198, 212, rr));
  return Math.min(h, 112);
}
function nivWalkable(x, z){ return Math.hypot(x - CAVE.x, z - CAVE.z) < 194 || onRamp8(x, z) || Math.hypot(x - NV.lib.x, z - NV.lib.z) < 13.5; }

/* --- shader helper: cut the abyss out of sea, mainland terrain and cavern ceiling --- */
function abyssCut(mat, lip = CAVE.lip, outer = 480){
  mat.onBeforeCompile = sh => {
    sh.vertexShader = 'varying vec3 vWorldA;\n' + sh.vertexShader.replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\n vWorldA = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    sh.fragmentShader = 'varying vec3 vWorldA;\n' + sh.fragmentShader.replace('void main() {', `void main() {
      vec2 dA = vWorldA.xz - vec2(${CAVE.x.toFixed(1)}, ${CAVE.z.toFixed(1)});
      float rA = length(dA); float aA = degrees(atan(dA.y, dA.x)); if(aA < 0.0) aA += 360.0;
      if(rA > ${lip.toFixed(1)} && rA < ${outer.toFixed(1)} && aA >= ${CAVE.open[0].toFixed(1)} && aA <= ${CAVE.open[1].toFixed(1)}) discard;`);
  };
  mat.customProgramCacheKey = () => 'abyss' + lip;
  return mat;
}
// the worldpos chunk only runs when shadows/envmaps need it, so force it on for these materials
abyssCut(seaMat); abyssCut(terrainMat);
seaMat.needsUpdate = terrainMat.needsUpdate = true;

/* --- cavern floor terrain --- */
const nTerrainGeo = new THREE.PlaneGeometry(440, 440, 150, 150); nTerrainGeo.rotateX(-Math.PI / 2);
{
  const p = nTerrainGeo.attributes.position, cols = []; const c = new THREE.Color(), snow = new THREE.Color(0xeef4fb), blue = new THREE.Color(0xc4d6ea), rock = new THREE.Color(0x5d6670), ice = new THREE.Color(0x9fd0ee), moss = new THREE.Color(0x5f8a4a), dirt = new THREE.Color(0x7a6650);
  for(let i = 0; i < p.count; i++){ const x = p.getX(i) + CAVE.x, z = p.getZ(i) + CAVE.z, h = nivH(x, z); p.setY(i, h);
    c.copy(snow).lerp(blue, (noise2(x * 3, z * 3) + 1.7) / 3.4 * .6); if(h > 45) c.lerp(rock, smooth(45, 90, h) * .6);
    const dv = Math.hypot(x - VIL.x, z - VIL.z), dt = Math.hypot(x - TREE_AT.x, z - TREE_AT.z);
    if(dv < 58) c.lerp(dirt, 1 - smooth(40, 58, dv)); if(dt < 52) c.lerp(moss, 1 - smooth(36, 52, dt));
    if(Math.hypot(x - 360, z + 110) < 22) c.copy(ice); if(h < -5) c.copy(rock);
    cols.push(c.r, c.g, c.b); }
  nTerrainGeo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3)); nTerrainGeo.computeVertexNormals();
}
mesh(nTerrainGeo, new THREE.MeshStandardMaterial({vertexColors:true, roughness:.95, flatShading:true}), CAVE.x, 0, CAVE.z, N, false).receiveShadow = true;
mesh(new THREE.CircleGeometry(22, 40), new THREE.MeshPhongMaterial({color:0xbfe6ff, shininess:120, transparent:true, opacity:.85}), 360, -.2, -110, N, false).rotation.x = -Math.PI / 2;

/* --- cavern shell: walls, ceiling (underside of Tanah Besar), arch lip, pillars, roots, waterfalls --- */
const caveRockMat = new THREE.MeshStandardMaterial({color:0x4a4038, roughness:1, flatShading:true, side:THREE.BackSide});
{
  const g = new THREE.CylinderGeometry(CAVE.r + 2, CAVE.r + 2, 220, 64, 8, true, (90 - CAVE.open[0]) * Math.PI / 180, (360 - (CAVE.open[1] - CAVE.open[0])) * Math.PI / 180);
  const p = g.attributes.position; for(let i = 0; i < p.count; i++){ const k = 1 + noise2(p.getX(i) * .4 + p.getY(i) * .2, p.getZ(i) * .4) * .035; p.setXYZ(i, p.getX(i) * k, p.getY(i), p.getZ(i) * k); } g.computeVertexNormals();
  mesh(g, caveRockMat, CAVE.x, 20, CAVE.z, N, false);
}
const ceilMat = abyssCut(new THREE.MeshStandardMaterial({color:0x5a4c40, roughness:1, flatShading:true, side:THREE.DoubleSide}));
{
  const g = new THREE.CircleGeometry(CAVE.r + 8, 72, 0, Math.PI * 2); const p = g.attributes.position;
  for(let i = 0; i < p.count; i++) p.setZ(i, noise2(p.getX(i) * 1.6, p.getY(i) * 1.6) * 3.5);
  g.computeVertexNormals();
  const ceil = mesh(g, ceilMat, CAVE.x, CAVE.ceil, CAVE.z, N, false); ceil.rotation.x = Math.PI / 2;
}
// overhang lip (the arch's top edge) seen from the abyss
mesh(new THREE.CylinderGeometry(CAVE.lip, CAVE.lip, 16, 40, 2, true, (90 - CAVE.open[1]) * Math.PI / 180, (CAVE.open[1] - CAVE.open[0]) * Math.PI / 180), new THREE.MeshStandardMaterial({color:0x6a5a4a, roughness:1, flatShading:true, side:THREE.DoubleSide}), CAVE.x, CAVE.ceil + 5, CAVE.z, N, false);
const pillarMat = M(0x5d5048, {roughness:1});
[CAVE.open[0] - 3, CAVE.open[1] + 3].forEach(a => {
  const x = CAVE.x + Math.cos(a / R2D_) * (CAVE.r - 6), z = CAVE.z + Math.sin(a / R2D_) * (CAVE.r - 6);
  const g = new THREE.CylinderGeometry(16, 22, 240, 12, 10); const p = g.attributes.position;
  for(let i = 0; i < p.count; i++){ const k = 1 + noise2(p.getX(i) * .5 + p.getY(i) * .1, p.getZ(i) * .5) * .18; p.setXYZ(i, p.getX(i) * k, p.getY(i), p.getZ(i) * k); } g.computeVertexNormals();
  mesh(g, pillarMat, x, 20, z, N, false);
});
const rootMat = M(0x3f4a2a);
for(let i = 0; i < 40; i++){ const a = (CAVE.open[0] + rng() * (CAVE.open[1] - CAVE.open[0])) / R2D_, r = CAVE.lip - 2 - rng() * 30, len = 5 + rng() * 14;
  mesh(new THREE.CylinderGeometry(.15 + rng() * .3, .05, len, 4), rootMat, CAVE.x + Math.cos(a) * r, CAVE.ceil - len / 2, CAVE.z + Math.sin(a) * r, N, false); }
const fallMat = new THREE.MeshBasicMaterial({color:0xe8f6ff, transparent:true, opacity:.35, side:THREE.DoubleSide, depthWrite:false});
const falls = [];
[55, 68, 84].forEach(a => { const x = CAVE.x + Math.cos(a / R2D_) * (CAVE.lip + 1), z = CAVE.z + Math.sin(a / R2D_) * (CAVE.lip + 1);
  const f = mesh(new THREE.PlaneGeometry(3 + rng() * 3, 200, 1, 20), fallMat.clone(), x, CAVE.ceil - 100, z, N, false); f.rotation.y = -a / R2D_ + Math.PI / 2; falls.push(f); });
anims.push(t => falls.forEach((f, i) => f.material.opacity = .25 + Math.sin(t * 3 + i) * .08));
// chasm walls under the sea edges, with the sea pouring over them
{
  const cliffMat = new THREE.MeshStandardMaterial({color:0x6a5c4e, roughness:1, flatShading:true, side:THREE.DoubleSide});
  const wall = (ax, az, bx, bz) => { const len = Math.hypot(bx - ax, bz - az), g = new THREE.PlaneGeometry(len, 230, 24, 10), p = g.attributes.position;
    for(let i = 0; i < p.count; i++) p.setZ(i, noise2(p.getX(i) * .7, p.getY(i) * .7) * 5); g.computeVertexNormals();
    const m = mesh(g, cliffMat, (ax + bx) / 2, -116, (az + bz) / 2, S, false); m.rotation.y = -Math.atan2(bz - az, bx - ax); return m; };
  CAVE.open.forEach(a => { const c = Math.cos(a / R2D_), s_ = Math.sin(a / R2D_); wall(CAVE.x + c * CAVE.lip, CAVE.z + s_ * CAVE.lip, CAVE.x + c * 480, CAVE.z + s_ * 480); });
  for(let k = 0; k < 8; k++){ const a0 = (CAVE.open[0] + (CAVE.open[1] - CAVE.open[0]) * k / 8) / R2D_, a1 = (CAVE.open[0] + (CAVE.open[1] - CAVE.open[0]) * (k + 1) / 8) / R2D_;
    wall(CAVE.x + Math.cos(a0) * 480, CAVE.z + Math.sin(a0) * 480, CAVE.x + Math.cos(a1) * 480, CAVE.z + Math.sin(a1) * 480); }
  const wm = new THREE.MeshBasicMaterial({color:0xeaf7ff, transparent:true, opacity:.4, side:THREE.DoubleSide, depthWrite:false});
  CAVE.open.forEach(a => { for(let r = CAVE.lip + 30; r < 470; r += 38 + rng() * 20){ const aa = a / R2D_, x = CAVE.x + Math.cos(aa) * r, z = CAVE.z + Math.sin(aa) * r;
    const f = mesh(new THREE.PlaneGeometry(6 + rng() * 8, 90 + rng() * 60), wm.clone(), x, -60, z, S, false); f.rotation.y = -aa; f.position.y = -1.6 - f.geometry.parameters.height / 2; falls.push(f); } });
}
// cloud sea at the bottom of the abyss
{
  const cm = new THREE.MeshStandardMaterial({color:0xffffff, roughness:1, flatShading:true, transparent:true, opacity:.92});
  for(let i = 0; i < 60; i++){ const a = (CAVE.open[0] - 5 + rng() * (CAVE.open[1] - CAVE.open[0] + 10)) / R2D_, r = CAVE.lip + 10 + rng() * 290;
    mesh(new THREE.IcosahedronGeometry(10 + rng() * 16, 1), cm, CAVE.x + Math.cos(a) * r, -205 + rng() * 25, CAVE.z + Math.sin(a) * r, S, false).scale.y = .4; }
}
// glowing crystals on the ceiling
const crystalMats = [new THREE.MeshBasicMaterial({color:0x7fe0ff}), new THREE.MeshBasicMaterial({color:0xffc27a})];
for(let i = 0; i < 90; i++){ const a = rng() * 6.283, r = rng() * (CAVE.r - 10); const len = 3 + rng() * 9;
  mesh(new THREE.ConeGeometry(.6 + rng() * 1.6, len, 5), i % 3 ? M(0x4a433c) : crystalMats[i % 2], CAVE.x + Math.cos(a) * r, CAVE.ceil - len / 2 - 1, CAVE.z + Math.sin(a) * r, N, false).rotation.x = Math.PI; }
const caveFill = new THREE.PointLight(0x9fc8ff, .9, 420); caveFill.position.set(CAVE.x, 100, CAVE.z - 60); N.add(caveFill);

/* --- snowy pines in the valley --- */
{
  const r = mulberry(91), pts = [];
  for(let tries = 0; pts.length < 230 && tries < 6000; tries++){ const a = r() * 6.283, d = 20 + r() * 170; const x = CAVE.x + Math.cos(a) * d, z = CAVE.z + Math.sin(a) * d; const h = nivH(x, z);
    if(h > 40 || h < 0 || nivRegion(x, z) !== 'lembah' || Math.hypot(x - 360, z + 110) < 26 || Math.hypot(x - 292, z + 128) < 50 ||   /* the giant's lair (20-gergasi.js) */ Math.hypot(x - NV.arrive.x, z - NV.arrive.z) < 20) continue; pts.push([x, z, h, .9 + r() * 1.3]); }
  const tr = new THREE.InstancedMesh(new THREE.CylinderGeometry(.3, .5, 3, 6), M(0x4a3a2a), pts.length);
  const l1 = new THREE.InstancedMesh(new THREE.ConeGeometry(2.6, 5, 7), M(0x2e5a4a), pts.length);
  const l2 = new THREE.InstancedMesh(new THREE.ConeGeometry(2.2, 2.4, 7), M(0xf2f6fb), pts.length);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3();
  pts.forEach(([x, z, h, k], i) => { m4.compose(p.set(x, h + 1.5 * k, z), q, s.set(k, k, k)); tr.setMatrixAt(i, m4); m4.compose(p.set(x, h + 5 * k, z), q, s.set(k, k, k)); l1.setMatrixAt(i, m4); m4.compose(p.set(x, h + 7 * k, z), q, s.set(k, k, k)); l2.setMatrixAt(i, m4); collide(x, z, .7 * k, 2); });
  [tr, l1, l2].forEach(m => { m.castShadow = true; N.add(m); });
}

/* --- arrival shaft from Gerbang Nivelham --- */
const shaft = grp(NV.arrive.x, nivH(NV.arrive.x, NV.arrive.z), NV.arrive.z, N);
mesh(new THREE.CylinderGeometry(3, 3, gateH - NVY, 16, 1, true), holoMat(0x8fe0ff, .12), 0, (gateH - NVY) / 2, 0, shaft, false);
[-4, 4].forEach(x => mesh(new THREE.BoxGeometry(1.4, 12, 1.4), rune, x, 6, -5, shaft));
mesh(new THREE.BoxGeometry(10, 1.6, 1.6), rune, 0, 12.4, -5, shaft);
liftPad(0, 0, 0, shaft, 0x8fe0ff);
info(shaft, 'Aci Nivelham', 'Lif terus ke Gerbang Nivelham di permukaan Tanah Besar.');

/* --- Perkampungan Gua Besar (Viking-style timber village) --- */
const village = grp(VIL.x, 0, VIL.z, N);
const fireLight = new THREE.PointLight(0xff9a4a, 2.2, 110); fireLight.position.set(0, 6, 0); village.add(fireLight);
const bonfire = grp(0, 0, 0, village);
for(let i = 0; i < 8; i++){ const a = i / 8 * 6.283; mesh(new THREE.CylinderGeometry(.35, .35, 4, 6), wood, Math.cos(a) * .9, .9, Math.sin(a) * .9, bonfire).rotation.set(Math.sin(a) * .9, 0, Math.cos(a) * .9); }
const flames = [0, 1, 2].map(i => mesh(new THREE.ConeGeometry(1.2 - i * .3, 3 + i, 8), holoMat([0xff6a2a, 0xffa64d, 0xffe08a][i], .7), 0, 2 + i * .4, 0, bonfire, false));
anims.push(t => { flames.forEach((f, i) => { f.scale.set(1 + Math.sin(t * 9 + i) * .15, 1 + Math.sin(t * 13 + i * 2) * .25, 1); }); fireLight.intensity = 2 + Math.sin(t * 11) * .3 + Math.sin(t * 7.3) * .2; });
collide(VIL.x, VIL.z, 2.2, 2);
const logMat = M(0x7a5232), logDark = M(0x5a3a22), roofMat = M(0x4a3a2a), carveMat = M(0xc89a5a, {metalness:.2});
function ornament(kind, parent, x, y, z, s = 1){
  const g = grp(x, y, z, parent); g.scale.setScalar(s);
  if(kind === 'pena'){ mesh(new THREE.ConeGeometry(.35, 3.2, 6), carveMat, 0, 1.6, 0, g); const f = mesh(new THREE.ConeGeometry(.9, 3, 3), M(0xf2ead8), 0, 3.6, 0, g); f.scale.z = .2; }
  else if(kind === 'kertas'){ mesh(new THREE.CylinderGeometry(.45, .45, 3, 10), M(0xf2ead8), 0, 1.5, 0, g).rotation.z = Math.PI / 2; mesh(new THREE.PlaneGeometry(2.6, 2.2), M(0xf2ead8, {side:THREE.DoubleSide}), 0, .3, .2, g); }
  else { mesh(new THREE.BoxGeometry(3, .7, 1), carveMat, 0, .6, 0, g); mesh(new THREE.ConeGeometry(.5, 1.2, 4), carveMat, 1.8, .9, 0, g).rotation.z = -Math.PI / 2; mesh(new THREE.CylinderGeometry(.06, .06, 2.6, 4), logDark, 0, 2.2, 0, g); mesh(new THREE.PlaneGeometry(1.6, 1.6), M(0xd9c7a2, {side:THREE.DoubleSide}), .1, 2.4, 0, g); }
  return g;
}
function longhouse(x, z, rot, L, W, label, big){
  const g = grp(x, nivH(x, z), z, N); g.rotation.y = rot;
  const H = big ? 7 : 4.5;
  for(let i = 0; i < 6; i++){ [-1, 1].forEach(s => mesh(new THREE.CylinderGeometry(.55, .55, L, 8), i % 2 ? logMat : logDark, s * W / 2, .55 + i * (H / 6), 0, g).rotation.x = Math.PI / 2); }
  [-1, 1].forEach(s => { mesh(new THREE.BoxGeometry(W, H, .6), logDark, 0, H / 2, s * L / 2, g); });
  const roofW = W * .78;
  [-1, 1].forEach(s => { const r = mesh(new THREE.BoxGeometry(roofW, .5, L + 2), roofMat, s * W / 4, H + roofW * .32, 0, g); r.rotation.z = -s * .72; });
  mesh(new THREE.CylinderGeometry(.4, .4, L + 3, 8), logDark, 0, H + roofW * .66, 0, g).rotation.x = Math.PI / 2;
  [-1, 1].forEach(s => { [-1, 1].forEach(k => { const b = mesh(new THREE.BoxGeometry(.4, roofW * 1.3, .4), carveMat, k * 1.1, H + roofW * .7, s * (L / 2 + 1.2), g); b.rotation.z = k * .55; }); });
  const kinds = ['pena', 'kertas', 'kapal'];
  [-1, 1].forEach((s, i) => ornament(kinds[(Math.abs(Math.round(x + z)) + i) % 3], g, 0, H + roofW * .95, s * (L / 2 + 1.4), big ? 1.5 : 1));
  for(let k = -1; k <= 1; k++){ const sh = mesh(new THREE.CylinderGeometry(1.1, 1.1, .2, 16), M([0xb04a3a, 0x3a5a8a, 0xc8a24a][(k + 2) % 3]), W / 2 + .7, 2.6, k * L / 4, g); sh.rotation.z = Math.PI / 2; }
  mesh(new THREE.BoxGeometry(2.4, 3.6, .3), M(0x2a1a10), 0, 1.8, L / 2 + .35, g);
  mesh(new THREE.PlaneGeometry(1.8, 2.6), lampMat, 0, 1.8, L / 2 + .52, g, false);
  for(let k = -L / 2 + W / 2; k <= L / 2 - W / 2 + .1; k += W * .8) collide(x + Math.sin(rot) * k, z + Math.cos(rot) * k, W / 2 + .4, 2);
  if(label) info(g, label, big ? 'Dewan kayu balak terbesar. Ukiran pena, kertas dan kapal di hujung bumbung. Pintu ke Pelan Rahsia.' : 'Rumah kayu balak Perkampungan Gua Besar.');
  return g;
}
[[VIL.x - 30, VIL.z - 14, Math.PI / 2], [VIL.x + 30, VIL.z - 14, -Math.PI / 2], [VIL.x - 32, VIL.z + 16, Math.PI / 2], [VIL.x + 32, VIL.z + 16, -Math.PI / 2], [VIL.x - 16, VIL.z + 40, 0], [VIL.x + 18, VIL.z + 40, 0]]
  .forEach(([x, z, r], i) => longhouse(x, z, r, 22, 9, 'Rumah Panjang ' + (i + 1), false));
const dewanBesar = longhouse(NV.hall.x, NV.hall.z, 0, 34, 13, 'Dewan Panjang Rahsia', true);
for(let i = 0; i < 6; i++){ [-1, 1].forEach(s => { const x = VIL.x + s * 7, z = NV.hall.z + 22 + i * 8; const l = grp(x, nivH(x, z), z, N); mesh(new THREE.CylinderGeometry(.12, .12, 3, 5), logDark, 0, 1.5, 0, l); mesh(new THREE.SphereGeometry(.35, 8, 6), lampMat, 0, 3.1, 0, l, false); }); }

/* --- Mata Air Hikmah: colossal tree + library on Branch Route 8 --- */
const spring = grp(NV.spring.x, 0, NV.spring.z, N);
mesh(new THREE.CircleGeometry(9, 32), new THREE.MeshPhongMaterial({color:0x5fd0e0, shininess:120, transparent:true, opacity:.85}), 0, .45, 0, spring, false).rotation.x = -Math.PI / 2;
for(let i = 0; i < 10; i++){ const a = i / 10 * 6.283; mesh(new THREE.DodecahedronGeometry(1.2 + rng(), 0), M(0x7a8a7a), Math.cos(a) * 9.5, .6, Math.sin(a) * 9.5, spring); }
const springPts = new THREE.BufferGeometry(); { const a = new Float32Array(80 * 3); for(let i = 0; i < 80; i++){ a[i * 3] = (rng() - .5) * 14; a[i * 3 + 1] = rng() * 6; a[i * 3 + 2] = (rng() - .5) * 14; } springPts.setAttribute('position', new THREE.BufferAttribute(a, 3)); }
spring.add(new THREE.Points(springPts, new THREE.PointsMaterial({color:0xfff2b0, size:.3, transparent:true, opacity:.8, blending:THREE.AdditiveBlending, depthWrite:false})));
info(spring, 'Mata Air Hikmah', 'Mata air jernih di kaki Pokok Purba. Tempat berhenti sebelum memanjat Laluan Dahan 8.');
collide(NV.spring.x, NV.spring.z, 9.5, 2);
const bark = M(0x6a4a32, {roughness:.95}), barkDark = M(0x4a3222);
const tree = grp(TREE_AT.x, 0, TREE_AT.z, N); tree.scale.setScalar(.72);
mesh(new THREE.CylinderGeometry(12, 18, 120, 14), bark, 0, 60, 0, tree);
for(let i = 0; i < 9; i++){ const a = i / 9 * 6.283; const r = mesh(new THREE.CylinderGeometry(2.2, 4, 26, 8), barkDark, Math.cos(a) * 16, 6, Math.sin(a) * 16, tree); r.rotation.set(Math.sin(a) * .9, 0, -Math.cos(a) * .9); }
const canopyMat = M(0x4f8a3a), canopyMat2 = M(0x6aa04a);
[[0, 128, 0, 38], [30, 116, 18, 26], [-30, 114, -10, 28], [10, 112, -34, 24], [-14, 118, 32, 24]].forEach(([x, y, z, r], i) => mesh(new THREE.IcosahedronGeometry(r, 1), i % 2 ? canopyMat2 : canopyMat, x, y, z, tree));
function beam(a, b, r0, r1, mat, parent){ const d = b.clone().sub(a); const m = mesh(new THREE.CylinderGeometry(r1, r0, d.length(), 10), mat, (a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2, parent); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); return m; }
const branch = beam(new THREE.Vector3(8, 40, 6), new THREE.Vector3((NV.lib.x - TREE_AT.x) / .72, (NV.ramp.top - 3) / .72, (NV.lib.z - TREE_AT.z) / .72), 6, 3.5, bark, tree);
info(tree, 'Pokok Purba', 'Pokok gergasi yang menampung Perpustakaan Hikmah di atas Laluan Dahan 8.');
collide(TREE_AT.x, TREE_AT.z, 13, 2);
const R8 = NV.ramp, rampLen = Math.hypot(R8.x1 - R8.x0, R8.top);
const rampG = grp((R8.x0 + R8.x1) / 2, R8.top / 2, R8.z, N); rampG.rotation.z = Math.atan2(R8.top, R8.x1 - R8.x0);
mesh(new THREE.BoxGeometry(rampLen, .6, R8.w), M(0x8a6a4a), 0, -.3, 0, rampG);
[-1, 1].forEach(s => mesh(new THREE.BoxGeometry(rampLen, .15, .15), M(0xd9c7a2), 0, 1.1, s * R8.w / 2, rampG, false));
for(let i = 0; i <= 10; i++) [-1, 1].forEach(s => mesh(new THREE.CylinderGeometry(.1, .1, 1.2, 4), wood, -rampLen / 2 + i * rampLen / 10, .5, s * R8.w / 2, rampG, false));
const libG = grp(NV.lib.x, R8.top, NV.lib.z, N);
mesh(new THREE.CylinderGeometry(14, 11, 3, 24), barkDark, 0, -1.5, 0, libG);
mesh(new THREE.CylinderGeometry(10.5, 11, 20, 20), M(0xd8c8a8, {roughness:.7}), 0, 10, 0, libG);
for(let i = 0; i < 10; i++){ const a = i / 10 * 6.283 + .3; const w = mesh(new THREE.PlaneGeometry(2.4, 8), lampMat, Math.cos(a) * 11.05, 11, Math.sin(a) * 11.05, libG, false); w.rotation.y = -a + Math.PI / 2; }
mesh(new THREE.ConeGeometry(13.5, 13, 20), M(0x3f5a3a), 0, 26.5, 0, libG);
mesh(new THREE.PlaneGeometry(6.5, 12), M(0x3a2414), 0, 6, 11.1, libG, false);
mesh(new THREE.TorusGeometry(3.3, .5, 8, 20, Math.PI), carveMat, 0, 12, 11.1, libG, false);
const hikLight = new THREE.PointLight(0xffe0a0, 1.3, 160); hikLight.position.set(0, 30, 0); libG.add(hikLight);
// Bubo, the owl-shaped AI head librarian
const bubo = grp(0, 33, 0, libG);
const owlMat = M(0x8a6a4a, {roughness:.8}), owlLight = M(0xd9c7a2);
mesh(new THREE.SphereGeometry(2.4, 16, 12), owlMat, 0, 0, 0, bubo).scale.set(1, 1.3, .9);
const owlHead = grp(0, 3.6, 0, bubo);
mesh(new THREE.SphereGeometry(2, 16, 12), owlMat, 0, 0, 0, owlHead);
mesh(new THREE.SphereGeometry(1.4, 16, 12), owlLight, 0, -.2, 1.1, owlHead).scale.z = .5;
[-.75, .75].forEach(x => { mesh(new THREE.SphereGeometry(.55, 12, 10), new THREE.MeshBasicMaterial({color:0xffc84a}), x, .2, 1.6, owlHead, false); mesh(new THREE.ConeGeometry(.4, 1.4, 4), owlMat, x * 1.4, 2, 0, owlHead).rotation.z = -x * .4; });
mesh(new THREE.ConeGeometry(.25, .7, 4), M(0x3a2a1a), 0, -.6, 1.8, owlHead).rotation.x = Math.PI / 2 + .3;
info(bubo, 'Bubo · Ketua Pustakawan', 'AI berbentuk burung hantu. Medan Pembesar Optiknya membesarkan setiap tulisan yang dibaca di perpustakaan ini.');
collide(NV.lib.x, NV.lib.z, 11, 2);
anims.push(t => { owlHead.rotation.y = Math.sin(t * .4) * .8; });
const pollenGeo = new THREE.BufferGeometry(); { const a = new Float32Array(300 * 3); for(let i = 0; i < 300; i++){ a[i * 3] = (rng() - .5) * 120; a[i * 3 + 1] = rng() * 60; a[i * 3 + 2] = (rng() - .5) * 120; } pollenGeo.setAttribute('position', new THREE.BufferAttribute(a, 3)); }
const pollen = new THREE.Points(pollenGeo, new THREE.PointsMaterial({color:0xfff2b0, size:.35, transparent:true, opacity:.7, blending:THREE.AdditiveBlending, depthWrite:false})); pollen.position.set(TREE_AT.x, 0, TREE_AT.z); N.add(pollen);
anims.push((t, dt) => { pollen.rotation.y += dt * .01; });
