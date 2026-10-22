'use strict';
/* ================= Labirin Memori (layer 5): a maze inside the Marine headquarters =================
   500 dementors drift through the corridors. Each holds one bad memory (encrypted zone 'buruk', keyed by slot).
   Empty ones wander; filled ones hunt you; "Sudah berdamai" ones turn into light. Haki Raja Agung makes all bow. */
const MZ = {grid:null, start:null, bowUntil:0, n:500, d:[], hover:-1};
// grid of blocks: true = wall. Recursive backtracker, then knock out extra walls so there are several routes.
{
  const G = MAZE.G, g = Array.from({length:G}, () => new Array(G).fill(true)), r = mulberry(5005);
  const stack = [[1, 1]]; g[1][1] = false;
  while(stack.length){ const [cx, cz] = stack[stack.length - 1]; const nb = [[2, 0], [-2, 0], [0, 2], [0, -2]].map(([dx, dz]) => [cx + dx, cz + dz, dx, dz]).filter(([x, z]) => x > 0 && z > 0 && x < G - 1 && z < G - 1 && g[x][z]);
    if(!nb.length){ stack.pop(); continue; } const [nx, nz, dx, dz] = nb[Math.floor(r() * nb.length)]; g[cx + dx / 2][cz + dz / 2] = false; g[nx][nz] = false; stack.push([nx, nz]); }
  for(let i = 0; i < G * 3; i++){ const x = 1 + Math.floor(r() * (G - 2)), z = 1 + Math.floor(r() * (G - 2)); if((x % 2) !== (z % 2)) g[x][z] = false; }
  const c = (G - 1) / 2; for(let x = c - 3; x <= c + 3; x++) for(let z = c - 3; z <= c + 3; z++) g[x][z] = false;   // the central chamber
  g[1][G - 1] = false;                                                                                                 // the way in (south-west)
  MZ.grid = g; MZ.start = {bx:1, bz:G - 2};
}
const mzBlock = (x, z) => [Math.floor((x - MAZE.x + MAZE.half) / MAZE.b), Math.floor((z - MAZE.z + MAZE.half) / MAZE.b)];
const mzWorld = (bx, bz) => [MAZE.x - MAZE.half + (bx + .5) * MAZE.b, MAZE.z - MAZE.half + (bz + .5) * MAZE.b];
function mazeWalkable(x, z){ const [bx, bz] = mzBlock(x, z); if(bx < 0 || bz < 0 || bx >= MAZE.G || bz >= MAZE.G) return false;
  const pad = .9, ok = (px, pz) => { const [a, b] = mzBlock(px, pz); return a >= 0 && b >= 0 && a < MAZE.G && b < MAZE.G && !MZ.grid[a][b]; };
  return ok(x - pad, z - pad) && ok(x + pad, z - pad) && ok(x - pad, z + pad) && ok(x + pad, z + pad); }
function mazeMapColor(x, z){ const [bx, bz] = mzBlock(x, z); if(bx < 0 || bz < 0 || bx >= MAZE.G || bz >= MAZE.G) return [5, 7, 12];
  const c = (MAZE.G - 1) / 2; if(Math.abs(bx - c) <= 3 && Math.abs(bz - c) <= 3) return [120, 140, 190]; return MZ.grid[bx][bz] ? [34, 40, 56] : [12, 16, 26]; }

const mazeG = grp(0, MAZE.y, 0);
{
  const G = MAZE.G, B = MAZE.b, H = 7;
  const fl = mesh(new THREE.PlaneGeometry(G * B, G * B), M(0x3a4252, {flatShading:false, roughness:.35, metalness:.2}), MAZE.x, 0, MAZE.z, mazeG, false); fl.rotation.x = -Math.PI / 2;
  let n = 0; MZ.grid.forEach(col => col.forEach(w => { if(w) n++; }));
  const walls = new THREE.InstancedMesh(new THREE.BoxGeometry(B, H, B), M(0x4a5468, {roughness:.6, metalness:.15, emissive:0x101a30, emissiveIntensity:.5}), n);
  const m4 = new THREE.Matrix4(); let i = 0;
  for(let x = 0; x < G; x++) for(let z = 0; z < G; z++) if(MZ.grid[x][z]){ const [wx, wz] = mzWorld(x, z); m4.makeTranslation(wx, H / 2, wz); walls.setMatrixAt(i++, m4); }
  walls.receiveShadow = true; mazeG.add(walls);
  // pale blue torches here and there, and the Light of Recovery in the central chamber
  const tm = new THREE.MeshBasicMaterial({color:0x9fc8ff}), r = mulberry(17);
  for(let k = 0; k < 120; k++){ const x = 1 + Math.floor(r() * (G - 2)), z = 1 + Math.floor(r() * (G - 2)); if(!MZ.grid[x][z]) continue; const [wx, wz] = mzWorld(x, z); mesh(new THREE.SphereGeometry(.28, 8, 6), tm, wx, H + .4, wz, mazeG, false); }
  const pill = mesh(new THREE.CylinderGeometry(3, 3, 60, 24, 1, true), holoMat(0xfff2c8, .18), MAZE.x, 30, MAZE.z, mazeG, false);
  mesh(new THREE.CylinderGeometry(4, 4.4, .6, 24), M(0xd8d0bc), MAZE.x, .3, MAZE.z, mazeG);
  anims.push(t => { pill.material.opacity = .14 + Math.sin(t * 1.3) * .05; });
  info(pill, 'Cahaya Pemulihan', 'Pusat Labirin Memori. Di sini terletak Arkib Memori Terburuk. Setiap memori yang kau damaikan bertukar menjadi cahaya.');
  const lamp = new THREE.PointLight(0xfff0c8, 0, 60, 1.2); lamp.position.set(MAZE.x, 10, MAZE.z); mazeG.add(lamp);
  anims.push(() => { lamp.intensity = player.layer === 5 ? 1.6 : 0; });
  const [sx, sz] = mzWorld(1, G - 1); mesh(new THREE.BoxGeometry(B, 6, .4), M(0x3a2414), sx, 3, sz + B / 2 - .2, mazeG, false);
}

/* --- the dementor body: one merged geometry with a cloth-flutter shader, shared with the raids --- */
function mergeGeos(parts){
  const pos = [], nor = []; parts.forEach(([g, m]) => { const n = g.toNonIndexed(); n.applyMatrix4(m); n.computeVertexNormals(); pos.push(...n.attributes.position.array); nor.push(...n.attributes.normal.array); });
  const out = new THREE.BufferGeometry(); out.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); out.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); return out;
}
function dementorGeo(){
  const r = mulberry(13), T = (x, y, z, rx = 0, ry = 0, rz = 0, s = 1) => new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)), new THREE.Vector3(s, s, s));
  const cloak = new THREE.ConeGeometry(1.15, 3.8, 14, 5, true); const p = cloak.attributes.position;
  for(let i = 0; i < p.count; i++){ if(p.getY(i) < -1.6){ p.setY(i, p.getY(i) - r() * 1.4); p.setX(i, p.getX(i) * (1 + r() * .25)); } }   // torn hem
  const hood = new THREE.SphereGeometry(.52, 12, 8, 0, 6.283, 0, Math.PI * .62);
  const arm = new THREE.CylinderGeometry(.09, .13, 1.5, 6), hand = new THREE.BoxGeometry(.22, .1, .42);
  const strips = []; for(let k = 0; k < 6; k++){ const a = k / 6 * 6.283; strips.push([new THREE.PlaneGeometry(.35, 1.6), T(Math.cos(a) * .8, -2.4, Math.sin(a) * .8, 0, -a, 0)]); }
  return mergeGeos([[cloak, T(0, 0, 0)], [hood, T(0, 2.05, -.05, -.25)], [arm, T(-.55, .9, .55, 1.1, 0, .2)], [arm, T(.55, .9, .55, 1.1, 0, -.2)], [hand, T(-.6, .55, 1.2, .3)], [hand, T(.6, .55, 1.2, .3)], ...strips]);
}
const DEM_U = {uT:{value:0}};
function dementorMat(color = 0x16181e){
  const m = new THREE.MeshStandardMaterial({color, roughness:.95, metalness:0, side:THREE.DoubleSide});
  m.onBeforeCompile = sh => { sh.uniforms.uT = DEM_U.uT; sh.vertexShader = 'uniform float uT;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
    #ifdef USE_INSTANCING
      float ph = instanceMatrix[3].x * .13 + instanceMatrix[3].z * .17;
    #else
      float ph = 0.0;
    #endif
    float low = clamp((1.2 - position.y) / 3.6, 0.0, 1.0);
    transformed.x += sin(uT * 3.1 + ph + position.y * 2.2) * .28 * low;
    transformed.z += cos(uT * 2.7 + ph + position.y * 1.8) * .28 * low;`); };
  m.customProgramCacheKey = () => 'dementor'; return m;
}
anims.push(t => { DEM_U.uT.value = t; });

/* --- the 500 guardians --- */
const demMesh = new THREE.InstancedMesh(dementorGeo(), dementorMat(), MZ.n); demMesh.frustumCulled = false; mazeG.add(demMesh);
const orbMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(.7, 12, 8), new THREE.MeshBasicMaterial({color:0xffe6a8}), MZ.n); orbMesh.frustumCulled = false; mazeG.add(orbMesh);
{
  const r = mulberry(909), G = MAZE.G;
  for(let i = 0; i < MZ.n; i++){ let bx, bz; do{ bx = 1 + Math.floor(r() * (G - 2)); bz = 1 + Math.floor(r() * (G - 2)); } while(MZ.grid[bx][bz] || (bx < 5 && bz > G - 6));
    const [x, z] = mzWorld(bx, bz); MZ.d.push({x, z, y:3 + r() * 3, tx:x, tz:z, ry:r() * 6.283, ph:r() * 6.283, state:'empty', cool:0, tilt:0}); }
  demMesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(MZ.n * 3), 3);
}
const DEM_COL = {empty:new THREE.Color(0x4a4e5a), haunt:new THREE.Color(0x0c0e14), healing:new THREE.Color(0x2a3a5a)};
function refreshDementors(){
  const bySlot = new Map(); plain.forEach(e => { if(e.z === 'buruk' && !e.bad && e.data && Number.isInteger(+e.data.slot)) bySlot.set(+e.data.slot, e); });
  MZ.d.forEach((d, i) => { const e = bySlot.get(i); d.entry = e || null; d.state = !e ? 'empty' : e.data.status === 'Sudah berdamai' ? 'free' : e.data.status === 'Sedang dipulihkan' ? 'healing' : 'haunt';
    demMesh.setColorAt(i, DEM_COL[d.state === 'free' ? 'empty' : d.state]); });
  demMesh.instanceColor.needsUpdate = true;
  if(mzCount) mzCount.el.innerHTML = `Arkib Memori Terburuk<small>${bySlot.size} / 500 memori · ${[...MZ.d].filter(d => d.state === 'free').length} sudah berdamai</small>`;
}
function dementorAtRay(r){
  let best = null, bd = 2.2;
  MZ.d.forEach((d, i) => { if(d.state === 'free') return; _dv.set(d.x, MAZE.y + d.y, d.z); const dist = r.ray.distanceToPoint(_dv); const along = _dv.clone().sub(r.ray.origin).dot(r.ray.direction); if(along > 0 && along < 90 && dist < bd){ bd = dist; best = i; } });
  return best;
}
function openMemory(slot){
  if(!canZone('buruk')){ denyAccess('Pas kau tidak termasuk Arkib Memori Terburuk.', 'Labirin Memori'); return; }
  const e = MZ.d[slot].entry; openZone('buruk'); sfx.click(); tone(180, {d:.6, v:.05, glide:120});
  if(e) ui.sel = e.id; else { ui.sel = null; ui.newExtra = {slot}; }
  renderZoneList(); renderZoneForm();
}
// Haki Raja Agung: every dementor sinks down and bows, still, for 45 seconds
AGUNG_HOOKS.push(() => { if(player.layer === 5){ MZ.bowUntil = performance.now() + 45000; toast('Semua dementor tunduk dan patuh kepada Haki Raja Agung.', 'ok', 3500); } });

const _dq = new THREE.Quaternion(), _de = new THREE.Euler(), _dm = new THREE.Matrix4(), _ds = new THREE.Vector3(1, 1, 1), _dp = new THREE.Vector3(), _hid = new THREE.Vector3(0, 0, 0);
anims.push((t, dt) => {
  if(player.chill > 0) player.chill -= dt;
  if(player.layer !== 5) return;
  const bow = performance.now() < MZ.bowUntil, G = MAZE.half;
  MZ.d.forEach((d, i) => {
    const dx = player.x - d.x, dz = player.z - d.z, dp = Math.hypot(dx, dz);
    if(d.state === 'free'){ demMesh.setMatrixAt(i, _dm.compose(_dp.set(0, -50, 0), _dq, _hid));
      orbMesh.setMatrixAt(i, _dm.compose(_dp.set(d.x + Math.cos(t * .3 + d.ph) * 3, 11 + Math.sin(t * .8 + d.ph) * 1.2, d.z + Math.sin(t * .3 + d.ph) * 3), _dq, _ds)); return; }
    orbMesh.setMatrixAt(i, _dm.compose(_dp.set(0, -50, 0), _dq, _hid));
    let sp = 0, ty = 3.2 + Math.sin(t * 1.3 + d.ph) * .6;
    if(bow){ ty = 1.3; d.tilt = lerp(d.tilt, .7, .05); if(dp < 60) d.ry = Math.atan2(dx, dz); }
    else {
      d.tilt = lerp(d.tilt, 0, .05); d.cool = Math.max(0, d.cool - dt);
      if(d.state === 'haunt' && dp < 50 && d.cool <= 0){ d.tx = player.x; d.tz = player.z; sp = 5.5; }
      else { if(Math.hypot(d.tx - d.x, d.tz - d.z) < 1){ d.tx = clamp(d.x + (Math.random() - .5) * 40, MAZE.x - G + 4, MAZE.x + G - 4); d.tz = clamp(d.z + (Math.random() - .5) * 40, MAZE.z - G + 4, MAZE.z + G - 4); } sp = d.state === 'healing' ? 1.4 : 2.4; }
      const mx = d.tx - d.x, mz = d.tz - d.z, md = Math.hypot(mx, mz) || 1; d.x += mx / md * Math.min(md, sp * dt); d.z += mz / md * Math.min(md, sp * dt); if(md > .2) d.ry = Math.atan2(mx, mz);
      if(d.state === 'haunt' && dp < 2.4 && d.cool <= 0 && session && !ride){ d.cool = 4; player.chill = 3; screenFx('frost', 2600); flash('rgba(160,200,255,.35)'); shake = .3;
        noiseHit({d:1.6, v:.2, f:900, type:'bandpass', q:.4}); tone(110, {d:1.4, v:.06, glide:70});
        const nx = player.x + dx / (dp || 1) * 4, nz = player.z + dz / (dp || 1) * 4; if(canStand(nx, nz, 5)){ player.x = nx; player.z = nz; }
        toast(`Dementor menyedut kehangatan kau: "${d.entry?.data.title || 'memori buruk'}". Lari, atau guna Haki Raja Agung.`, 'bad', 3000); }
    }
    d.y = lerp(d.y, ty, .06);
    _de.set(d.tilt, d.ry, 0); _dq.setFromEuler(_de); demMesh.setMatrixAt(i, _dm.compose(_dp.set(d.x, d.y, d.z), _dq, _ds));
    if(d.state === 'haunt' && Math.random() < .004){ const s = new THREE.Mesh(new THREE.SphereGeometry(.6, 6, 4), new THREE.MeshBasicMaterial({color:0x0a0c12, transparent:true, opacity:.5, depthWrite:false})); s.position.set(d.x, MAZE.y + d.y - 1.5, d.z); addFx(s, 2, (o, k) => { o.scale.setScalar(1 + k * 2); o.material.opacity = .5 * (1 - k); }); }
  });
  demMesh.instanceMatrix.needsUpdate = true; orbMesh.instanceMatrix.needsUpdate = true;
});

/* --- hover a dementor to read which memory it guards --- */
renderer.domElement.addEventListener('pointermove', e => {
  if(player.layer !== 5 || !session || performance.now() - (MZ.tipT || 0) < 90) return; MZ.tipT = performance.now();
  const r = new THREE.Raycaster(); r.setFromCamera(new THREE.Vector2(e.clientX / innerWidth * 2 - 1, -e.clientY / innerHeight * 2 + 1), camera);
  const s = dementorAtRay(r); if(s == null){ bookTip.style.display = 'none'; return; }
  const d = MZ.d[s];
  bookTip.innerHTML = d.entry ? `${esc(d.entry.data.title || 'Memori')}<small>Dementor #${s + 1} · ${esc(d.entry.data.status || 'Masih menghantui')}</small>` : `Dementor #${s + 1} · kosong<small>tekan untuk mengisi memori buruk</small>`;
  bookTip.style.display = ''; bookTip.style.transform = `translate(${e.clientX + 14}px, ${e.clientY - 10}px)`;
});

/* --- entering from the headquarters --- */
const MZ_DOOR = (() => { const a = BASE.back - 12 / 200, r = 200; return {x:BASE.x + Math.cos(a) * r, z:BASE.z + Math.sin(a) * r}; })();
function goMaze(){
  if(!canLaut()){ denyAccess('Pas kau tidak termasuk Pangkalan Laut.', 'Labirin Memori'); return; }
  const [x, z] = mzWorld(1, MAZE.G - 2); flash('rgba(120,150,220,.7)'); sfx.whoosh(); setLayer(5); player.x = x; player.z = z; player.y = 0; player.ry = Math.PI; cam.yaw = 0; cam.tdist = 22; cam.dist = 22; cam.pitch = .85;
  camera.position.set(x, MAZE.y + 20, z + 12);
  toast('Labirin Memori · 500 dementor berlegar. Yang sudah memegang memori akan mengejar kau. Pusat labirin: Cahaya Pemulihan.', 'ok', 6000);
}
function leaveMaze(){ flash('rgba(120,150,220,.5)'); sfx.whoosh(); setLayer(0); player.x = MZ_DOOR.x + Math.cos(BASE.face) * 6; player.z = MZ_DOOR.z + Math.sin(BASE.face) * 6; player.y = surfaceH(player.x, player.z); camera.position.set(player.x, player.y + 8, player.z + 12); }
interactables.push(
  {id:'mazemasuk', name:'Masuk Labirin Memori', layer:0, at:[MZ_DOOR.x, MZ_DOOR.z], r:5, color:'#8fa8d8', act:() => goMaze()},
  {id:'mazekeluar', name:'Keluar ke Pangkalan Laut', layer:5, at:mzWorld(1, MAZE.G - 2), r:4, color:'#8fa8d8', act:() => leaveMaze()},
);
const mzCount = fixedLabel('Arkib Memori Terburuk<small>0 / 500 memori</small>', MAZE.x, MAZE.y + 9, MAZE.z, '#8fa8d8', 120, 5);
fixedLabel('Labirin Memori<small>Pintu dalam Markas</small>', MZ_DOOR.x, BASE.top + 8, MZ_DOOR.z, '#8fa8d8', 80, 0);
EXPED.push({id:'labirin', name:'Labirin Memori', sub:'500 dementor · Arkib Memori Terburuk', x:90, y:40, layer:5, to:mzWorld(1, MAZE.G - 2)});
