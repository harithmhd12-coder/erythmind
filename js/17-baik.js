'use strict';
/* ================= Kerosakan & pembaikan: powers leave real damage, crews come to fix it =================
   Felled trees -> Petani replant them. Cracked buildings and ground -> Kontraktor repair them.
   Fires -> Bomba put them out first. Every site shows its crew, status and a countdown until done. */
const REPAIR = {sites:[], trees:null, last:0};
const CREWS = {
  kontraktor:{name:'Kontraktor', coat:0xff8a1a, pants:0x2a3a5a, shirt:0xf2d33a, hat:0xf2c21a, tool:0x8a8f99},
  petani:{name:'Petani', coat:0x5a8a3a, pants:0x5a4a32, shirt:0xe8d8a8, hat:'straw', tool:0x7a5a3a},
  bomba:{name:'Bomba', coat:0xb8262a, pants:0x2a2a30, shirt:0xffd23a, hat:0xeeeeee, tool:0xd8d8d8},
};
const _dv = new THREE.Vector3();

/* --- textures: cracks and scorched craters --- */
function crackTex(seed, crater){
  const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d'), r = mulberry(seed);
  if(crater){ const gr = g.createRadialGradient(128, 128, 10, 128, 128, 128); gr.addColorStop(0, 'rgba(20,12,8,.95)'); gr.addColorStop(.55, 'rgba(50,34,22,.75)'); gr.addColorStop(1, 'rgba(60,40,26,0)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); }
  g.strokeStyle = 'rgba(14,10,8,.95)'; g.lineCap = 'round';
  const branch = (x, y, a, len, w, depth) => { if(depth > 4 || w < .6) return; g.lineWidth = w; g.beginPath(); g.moveTo(x, y); let px = x, py = y;
    for(let i = 0; i < 6; i++){ a += (r() - .5) * .9; px += Math.cos(a) * len / 6; py += Math.sin(a) * len / 6; g.lineTo(px, py); } g.stroke();
    if(r() < .8) branch(px, py, a + (r() - .5) * 1.4, len * .6, w * .65, depth + 1); if(r() < .5) branch(px, py, a - (r() - .5) * 1.4, len * .5, w * .6, depth + 1); };
  for(let i = 0; i < 7; i++) branch(128, 128, i / 7 * 6.283 + r() * .5, 70 + r() * 50, 5, 0);
  const t = new THREE.CanvasTexture(c); return t;
}
const CRACK = [crackTex(11), crackTex(29), crackTex(47)], CRATER = crackTex(91, true);
const decalMat = tex => new THREE.MeshBasicMaterial({map:tex, transparent:true, depthWrite:false, polygonOffset:true, polygonOffsetFactor:-2});

/* --- workers --- */
function makeWorker(kind){
  const C = CREWS[kind], p = makePerson({coat:C.coat, pants:C.pants, shirt:C.shirt});
  if(C.hat === 'straw'){ mesh(new THREE.CylinderGeometry(.85, .85, .06, 16), M(0xe8c66a), 0, 3.02, 0, p.g, false); mesh(new THREE.ConeGeometry(.42, .45, 12), M(0xe8c66a), 0, 3.26, 0, p.g, false); }
  else { mesh(new THREE.SphereGeometry(.5, 14, 8, 0, 6.283, 0, Math.PI / 2), M(C.hat, {roughness:.4}), 0, 2.78, 0, p.g, false); mesh(new THREE.CylinderGeometry(.56, .56, .05, 16), M(C.hat), 0, 2.8, .05, p.g, false); }
  mesh(new THREE.BoxGeometry(1.06, .12, .64), new THREE.MeshBasicMaterial({color:0xe8ff6a}), 0, 1.35, 0, p.g, false);      // hi-vis stripe
  const tool = mesh(kind === 'bomba' ? new THREE.CylinderGeometry(.08, .08, 1.2, 6) : new THREE.BoxGeometry(.12, 1.1, .12), M(C.tool, {metalness:.4}), 0, -.9, .3, p.arms[1], false); tool.rotation.x = 1.2;
  if(kind === 'kontraktor') mesh(new THREE.BoxGeometry(.4, .25, .2), M(0x5a5f69, {metalness:.6}), 0, -.4, 0, tool, false);
  if(kind === 'petani') mesh(new THREE.BoxGeometry(.5, .06, .3), M(0x8a8f99, {metalness:.6}), 0, -.55, .1, tool, false);
  scene.add(p.g); p.kind = kind; return p;
}
function crewFor(site){ return site.kind === 'tree' ? 'petani' : 'kontraktor'; }

/* --- trees: index the instanced forest and the grouped trees --- */
function treeIndex(){
  if(REPAIR.trees) return REPAIR.trees;
  const list = [], [wt, wa, wb] = windInst, key = it => it.x.toFixed(2) + ',' + it.z.toFixed(2), leaves = new Map();
  [wa, wb].forEach(W => W && W.items.forEach((it, j) => leaves.set(key(it), {W, j, it})));
  if(wt) wt.items.forEach((it, j) => list.push({x:it.x, z:it.z, y:it.y, k:it.k, layer:0, trunk:{W:wt, j, it}, leaf:leaves.get(key(it))}));
  swayGroups.forEach(g => { g.getWorldPosition(_dv); const layer = _dv.y > PANG.y - 20 ? 3 : 0; list.push({x:_dv.x, z:_dv.z, y:_dv.y - layerBase(layer), k:1.2, layer, group:g}); });
  return REPAIR.trees = list;
}
function setTreeScale(t, g){
  if(t.group){ t.group.visible = g > .01; t.group.scale.setScalar(Math.max(.01, g)); return; }
  [t.trunk, t.leaf].forEach(e => { if(!e) return; const it = e.it; it.hidden = g <= .01; it.grow = g;
    const m4 = new THREE.Matrix4().compose(new THREE.Vector3(it.x, it.y + it.oy * g, it.z), new THREE.Quaternion(), new THREE.Vector3(it.k * g, it.k * it.sy * g, it.k * g));
    e.W.mesh.setMatrixAt(e.j, m4); e.W.mesh.instanceMatrix.needsUpdate = true; });
}
function fellTree(t, dir){
  t.down = true; setTreeScale(t, 0);
  const base = layerBase(t.layer) + t.y, g = new THREE.Group(); g.position.set(t.x, base, t.z); scene.add(g);
  const bark = M(0x6b4a33), leaf = M(t.group ? 0x4fa452 : 0x3f8f45), k = t.k || 1;
  mesh(new THREE.CylinderGeometry(.35 * k, .5 * k, .7 * k, 7), bark, 0, .35 * k, 0, g, false);
  const fall = new THREE.Group(); g.add(fall); fall.rotation.y = Math.atan2(dir.x, dir.z) + (Math.random() - .5) * .8;
  const log = mesh(new THREE.CylinderGeometry(.3 * k, .42 * k, 3.4 * k, 7), bark, 0, .38 * k, 2.2 * k, fall, false); log.rotation.x = Math.PI / 2 - .08;
  const crown = mesh(new THREE.IcosahedronGeometry(2 * k, 0), leaf, 0, 1 * k, 4.6 * k, fall, false); crown.scale.set(1, .55, 1.2);
  const split = mesh(new THREE.BoxGeometry(.06, .8 * k, .5 * k), M(0xe8d0a0), 0, .75 * k, 0, g, false);   // fresh split wood
  t.debris = g; return t;
}

/* --- fire --- */
function makeFire(x, y, z, size){
  const g = new THREE.Group(); g.position.set(x, y, z); scene.add(g);
  const fm = new THREE.MeshBasicMaterial({color:0xff7a1a, transparent:true, opacity:.85, blending:THREE.AdditiveBlending, depthWrite:false});
  const flames = []; for(let i = 0; i < 6; i++){ const f = mesh(new THREE.ConeGeometry(.6 * size, 2.2 * size, 6), fm, (Math.random() - .5) * 2 * size, size, (Math.random() - .5) * 2 * size, g, false); f.userData.ph = Math.random() * 6; flames.push(f); }
  const light = new THREE.PointLight(0xff7a1a, 0, 30 * size); light.position.y = 2 * size; g.add(light);
  return {g, flames, light, size, k:1};
}
function tickFire(F, t){
  F.flames.forEach(f => { f.scale.set(F.k, F.k * (1 + Math.sin(t * 12 + f.userData.ph) * .25), F.k); });
  F.light.intensity = (player.layer === 0 || player.layer === 3) ? F.k * (1.2 + Math.sin(t * 20) * .3) : 0;
  if(Math.random() < .3 * F.k){ const s = new THREE.Mesh(new THREE.SphereGeometry(.5 * F.size, 6, 4), new THREE.MeshBasicMaterial({color:0x3a3a3a, transparent:true, opacity:.5, depthWrite:false}));
    s.position.copy(F.g.position).add(new THREE.Vector3((Math.random() - .5) * 2, 2 * F.size, (Math.random() - .5) * 2)); addFx(s, 3, (o, k, dt) => { o.position.y += dt * 3; o.scale.setScalar(1 + k * 3); o.material.opacity = .5 * (1 - k); }); }
}

/* --- sites --- */
const fmtLeft = s => { s = Math.max(0, Math.ceil(s)); const m = Math.floor(s / 60); return m ? `${m}m ${String(s % 60).padStart(2, '0')}s` : `${s}s`; };
function addSite(site){
  // merge into a nearby site of the same kind instead of piling up crews
  const near = REPAIR.sites.find(s => s.kind === site.kind && s.layer === site.layer && s.phase !== 'done' && Math.hypot(s.x - site.x, s.z - site.z) < 30);
  if(near){ near.items.push(...site.items); near.decals.push(...site.decals); near.work += site.work * .5; if(site.fire) near.fires.push(...site.fires); return near; }
  if(REPAIR.sites.length > 30) return null;
  const now = performance.now() / 1000, gy = layerBase(site.layer) + groundAt(site.x, site.z, site.layer);
  Object.assign(site, {t0:now, phase:site.fires.length ? 'bomba' : 'jalan', workers:[], gy});
  site.label = addLabel('', 'repair', () => _dv.set(site.x, site.gy + 9, site.z).clone(), {max:260, layer:site.layer});
  site.fireT = site.fires.length ? 26 : 0; site.travel = 9;
  REPAIR.sites.push(site); spawnCrew(site, site.fires.length ? 'bomba' : crewFor(site));
  return site;
}
function spawnCrew(site, kind){
  site.workers.forEach(w => { w.leave = true; });
  const n = kind === 'bomba' ? 3 : site.kind === 'build' ? 4 : 3;
  // they come in from the direction of the town (or from the shaft in Nivelham)
  const from = site.layer === 2 ? {x:NV.arrive.x, z:NV.arrive.z} : site.layer === 3 ? {x:PANG_PAD.x, z:PANG_PAD.z} : {x:OVERVIEW[0].x, z:OVERVIEW[0].z};
  let dx = from.x - site.x, dz = from.z - site.z; const d = Math.hypot(dx, dz) || 1; dx /= d; dz /= d;
  for(let i = 0; i < n; i++){
    const p = makeWorker(kind), sx = site.x + dx * 60 + (Math.random() - .5) * 8, sz = site.z + dz * 60 + (Math.random() - .5) * 8, a = i / n * 6.283;
    Object.assign(p, {x:sx, z:sz, tx:site.x + Math.cos(a) * (site.kind === 'build' ? site.r + 2.5 : 4.5), tz:site.z + Math.sin(a) * (site.kind === 'build' ? site.r + 2.5 : 4.5), layer:site.layer, ph:Math.random() * 6, exitX:sx, exitZ:sz});
    site.workers.push(p);
  }
  site.crew = kind; site.arrive = performance.now() / 1000 + site.travel;
}
function moveWorker(p, dt, t){
  const tx = p.leave ? p.exitX : p.tx, tz = p.leave ? p.exitZ : p.tz, dx = tx - p.x, dz = tz - p.z, d = Math.hypot(dx, dz), sp = 7;
  const moving = d > .4; if(moving){ const s = Math.min(d, sp * dt); p.x += dx / d * s; p.z += dz / d * s; p.g.rotation.y = Math.atan2(dx, dz); }
  p.g.position.set(p.x, layerBase(p.layer) + groundAt(p.x, p.z, p.layer), p.z);
  animatePerson(p, moving, dt, sp);
  if(!moving && !p.leave){ p.g.rotation.y = Math.atan2(p.site.x - p.x, p.site.z - p.z); p.arms[1].rotation.x = -1.2 + Math.sin(t * 7 + p.ph) * .9; p.g.position.y += Math.abs(Math.sin(t * 7 + p.ph)) * .05; }
  return moving;
}
function tickSite(s, dt, t){
  const now = t, L = s.label;
  s.workers.forEach(p => { p.site = s; moveWorker(p, dt, t); });
  s.workers = s.workers.filter(p => { if(p.leave && Math.hypot(p.x - p.exitX, p.z - p.exitZ) < 1){ scene.remove(p.g); return false; } return true; });
  const here = s.workers.filter(p => !p.leave), arrived = here.length && here.every(p => Math.hypot(p.x - p.tx, p.z - p.tz) < .5);
  let status, pct = 0, left;
  if(s.phase === 'bomba'){
    if(!arrived){ status = 'Bomba dalam perjalanan'; left = s.fireT + s.work + s.travel; }
    else { s.fireT -= dt; const k = clamp(s.fireT / 26, 0, 1); s.fires.forEach(F => F.k = k);
      here.forEach(p => { if(Math.random() < .5){ p.g.getWorldPosition(_dv); _dv.y += 2; const tgt = new THREE.Vector3(s.x + (Math.random() - .5) * 4, s.gy + 1, s.z + (Math.random() - .5) * 4); bolt(_dv.clone(), tgt, 0x9fd8ff, .4, .12); } });
      status = 'Bomba memadam api'; pct = (1 - k) * 100; left = Math.max(0, s.fireT) + s.work + s.travel;
      if(s.fireT <= 0){ s.fires.forEach(F => scene.remove(F.g)); s.fires = []; s.phase = 'jalan'; spawnCrew(s, crewFor(s)); toast('Bomba berjaya memadam api. ' + CREWS[crewFor(s)].name + ' sedang menuju ke lokasi.', 'ok', 3000); } }
  }
  if(s.phase === 'jalan'){ status = `${CREWS[crewFor(s)].name} dalam perjalanan`; left = Math.max(0, s.arrive - now) + s.work; if(arrived){ s.phase = 'kerja'; s.ws = now; } }
  if(s.phase === 'kerja'){
    const p = clamp((now - s.ws) / s.work, 0, 1); pct = p * 100; left = s.work * (1 - p);
    status = s.kind === 'tree' ? (p < .4 ? 'Petani membersihkan pokok tumbang' : 'Petani menanam semula') : s.kind === 'build' ? 'Kontraktor membaiki bangunan' : 'Kontraktor menurap semula tanah';
    applyProgress(s, p);
    if(p >= 1){ s.phase = 'done'; s.workers.forEach(w => w.leave = true); finishSite(s); }
  }
  if(L){ if(s.phase === 'done'){ L.el.remove(); labels.splice(labels.indexOf(L), 1); s.label = null; }
    else if(now - (s.lt || 0) > .4){ s.lt = now; const what = s.kind === 'tree' ? `${s.items.length} pokok rosak` : s.kind === 'build' ? s.items.map(b => b.name).filter((v, i, a) => a.indexOf(v) === i).join(', ') + ' retak' : 'Tanah retak';
      L.el.innerHTML = `${esc(what)}<small>${esc(status)} · siap dalam ${fmtLeft(left)}</small><span class="bar"><i style="width:${pct.toFixed(0)}%"></i></span>`; L.el.className = 'lbl repair ' + (s.phase === 'bomba' ? 'fire' : crewFor(s)); } }
  s.fires.forEach(F => tickFire(F, t));
}
function applyProgress(s, p){
  if(s.kind === 'tree'){
    if(p < .4) s.items.forEach(tr => { if(tr.debris) tr.debris.scale.setScalar(Math.max(.01, 1 - p / .4)); });
    else { s.items.forEach(tr => { if(tr.debris){ scene.remove(tr.debris); tr.debris = null; } setTreeScale(tr, .15 + .85 * (p - .4) / .6); }); }
  }
  if(s.kind === 'build') s.items.forEach(b => { if(b.over) b.over.material.opacity = .9 * (1 - p); if(b.scaf) b.scaf.visible = true; if(b.rubble && p > .5){ scene.remove(b.rubble); b.rubble = null; } });
  s.decals.forEach(d => { if(d.isGroup){ if(p > .6) d.visible = false; } else d.material.opacity = Math.min(d.userData.op ?? 1, 1.1 * (1 - p)); });
}
function finishSite(s){
  s.items.forEach(it => { if(s.kind === 'tree'){ setTreeScale(it, 1); it.down = false; } if(s.kind === 'build'){ if(it.over) scene.remove(it.over); if(it.scaf) scene.remove(it.scaf); if(it.rubble) scene.remove(it.rubble); it.damaged = false; it.over = it.scaf = it.rubble = null; } });
  s.decals.forEach(d => scene.remove(d)); s.decals = [];
  toast(`${CREWS[crewFor(s)].name} siap: ${s.kind === 'tree' ? 'pokok ditanam semula' : s.kind === 'build' ? 'bangunan pulih seperti asal' : 'tanah diturap semula'}.`, 'ok', 2500);
}
anims.push((t, dt) => { REPAIR.sites.forEach(s => tickSite(s, dt, t)); REPAIR.sites = REPAIR.sites.filter(s => s.phase !== 'done' || s.workers.length); });

/* --- damage generators --- */
function crackDecal(x, z, layer, size, tex, rot){
  const y = layerBase(layer) + groundAt(x, z, layer) + .06; const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), decalMat(tex || CRACK[Math.floor(Math.random() * 3)]));
  m.rotation.set(-Math.PI / 2, 0, rot ?? Math.random() * 6.283); m.position.set(x, y, z); scene.add(m); m.userData.op = 1; return m;
}
function rubble(x, z, layer, n, spread, col = 0x8a8478){
  const g = new THREE.Group(), mat = M(col); g.position.set(x, layerBase(layer) + groundAt(x, z, layer), z); scene.add(g);
  for(let i = 0; i < n; i++){ const r = mesh(new THREE.DodecahedronGeometry(.3 + Math.random() * .7, 0), mat, (Math.random() - .5) * spread, .2, (Math.random() - .5) * spread, g); r.rotation.set(Math.random() * 3, Math.random() * 3, 0); }
  return g;
}
function damageBuilding(b, sev){
  if(b.damaged){ return b; } b.damaged = true;
  const crackT = CRACK[Math.floor(Math.random() * 3)].clone(); crackT.needsUpdate = true; crackT.wrapS = crackT.wrapT = THREE.RepeatWrapping; crackT.repeat.set(Math.max(1, b.w / 6), Math.max(1, b.h / 8));
  b.over = new THREE.Mesh(new THREE.BoxGeometry(b.w + .14, b.h * (sev > 2 ? 1 : .7), b.d + .14), new THREE.MeshBasicMaterial({map:crackT, transparent:true, opacity:.9, depthWrite:false}));
  b.over.position.set(b.x, b.y + b.h * (sev > 2 ? .5 : .35), b.z); scene.add(b.over);
  b.rubble = rubble(b.x, b.z, b.layer, 6 + sev * 4, Math.max(b.w, b.d) + 4);
  const sc = new THREE.Group(), pole = M(0xc8ccd4, {metalness:.6}), plank = M(0xa07a4a); sc.visible = false; scene.add(sc); sc.position.set(b.x, b.y, b.z);
  const hw = b.w / 2 + 1.2, hd = b.d / 2 + 1.2, H = Math.min(b.h, 40);
  [[-hw, -hd], [hw, -hd], [-hw, hd], [hw, hd], [0, -hd], [0, hd], [-hw, 0], [hw, 0]].forEach(([x, z]) => mesh(new THREE.CylinderGeometry(.08, .08, H, 5), pole, x, H / 2, z, sc, false));
  for(let y = 3; y < H; y += 4){ mesh(new THREE.BoxGeometry(hw * 2, .1, .5), plank, 0, y, -hd, sc, false); mesh(new THREE.BoxGeometry(hw * 2, .1, .5), plank, 0, y, hd, sc, false); mesh(new THREE.BoxGeometry(.5, .1, hd * 2), plank, -hw, y, 0, sc, false); mesh(new THREE.BoxGeometry(.5, .1, hd * 2), plank, hw, y, 0, sc, false); }
  b.scaf = sc; return b;
}
function dustCloud(x, y, z, n, r){
  for(let i = 0; i < n; i++){ const a = Math.random() * 6.283, s = new THREE.Mesh(new THREE.IcosahedronGeometry(1.5 + Math.random() * 2, 0), new THREE.MeshStandardMaterial({color:0xb8ae9c, transparent:true, opacity:.7, flatShading:true, depthWrite:false}));
    s.position.set(x, y + 1, z); addFx(s, 3.5, (o, k) => { o.position.set(x + Math.cos(a) * k * r, y + 1 + k * 6, z + Math.sin(a) * k * r); o.scale.setScalar(1 + k * 2.5); o.material.opacity = .7 * (1 - k); }); }
}
function hitTrees(test, dirFn, layer, max){
  const out = []; for(const t of treeIndex()){ if(out.length >= max) break; if(t.down || t.layer !== layer || !test(t)) continue; out.push(fellTree(t, dirFn(t))); }
  return out;
}
function makeSites(layer, trees, builds, decals, fireChance){
  // group felled trees into clusters so each crew handles a patch
  const clusters = [];
  trees.forEach(t => { let c = clusters.find(c => Math.hypot(c.x - t.x, c.z - t.z) < 30); if(!c){ c = {x:t.x, z:t.z, items:[]}; clusters.push(c); } c.items.push(t); });
  clusters.forEach(c => { const fires = Math.random() < fireChance ? [makeFire(c.x, layerBase(layer) + groundAt(c.x, c.z, layer), c.z, 1.2)] : [];
    addSite({kind:'tree', layer, x:c.x, z:c.z, items:c.items, decals:[], fires, work:Math.min(360, 60 + c.items.length * 18), r:4}); });
  builds.forEach(b => { const fires = Math.random() < fireChance ? [makeFire(b.x, b.y + 1, b.z + b.d / 2 + 1, 1.6)] : [];
    addSite({kind:'build', layer, x:b.x, z:b.z, items:[b], decals:[], fires, work:150 + b.h * 2.5, r:Math.max(b.w, b.d) / 2}); });
  if(decals.length){ const c = decals[0].position; addSite({kind:'ground', layer, x:c.x, z:c.z, items:[], decals, fires:[], work:60 + decals.length * 25, r:6}); }
}
const worldDamage = {
  slash(o, d, layer, len = 150){                                  // Kamusari: a clean cut through everything in its path
    const ax = o.x, az = o.z, inLine = (x, z, w) => { const px = x - ax, pz = z - az, along = px * d.x + pz * d.z; return along > 2 && along < len && Math.abs(px * d.z - pz * d.x) < w; };
    const side = t => { const s = Math.sign((t.x - ax) * d.z - (t.z - az) * d.x) || 1; return new THREE.Vector3(d.z * s, 0, -d.x * s); };
    const trees = hitTrees(t => inLine(t.x, t.z, 3.5), side, layer, 40);
    const builds = STRUCTS.filter(b => b.layer === layer && !b.damaged && inLine(b.x, b.z, Math.max(b.w, b.d) / 2 + 1)).slice(0, 6).map(b => damageBuilding(b, 2));
    const decals = []; for(let k = 10; k < len; k += 22){ const x = ax + d.x * k, z = az + d.z * k; if(groundAt(x, z, layer) > -1) decals.push(crackDecal(x, z, layer, 14, null, Math.atan2(d.x, d.z))); }
    builds.forEach(b => dustCloud(b.x, b.y, b.z, 8, 14));
    makeSites(layer, trees, builds, decals, .35);
  },
  ring(o, layer){                                                  // Haki Raja Agung: the ground splits around you, nearby buildings crack
    const decals = [crackDecal(o.x, o.z, layer, 40)]; for(let i = 0; i < 5; i++){ const a = i / 5 * 6.283 + Math.random(), r = 18 + Math.random() * 10; decals.push(crackDecal(o.x + Math.cos(a) * r, o.z + Math.sin(a) * r, layer, 16)); }
    const builds = STRUCTS.filter(b => b.layer === layer && !b.damaged && Math.hypot(b.x - o.x, b.z - o.z) < 45).slice(0, 5).map(b => damageBuilding(b, 1));
    const trees = hitTrees(t => Math.hypot(t.x - o.x, t.z - o.z) < 16, t => new THREE.Vector3(t.x - o.x, 0, t.z - o.z).normalize(), layer, 12);
    makeSites(layer, trees, builds, decals, 0);
  },
  crater(at, layer){                                               // the giant fist: a crater, flattened trees and battered buildings
    const decals = [crackDecal(at.x, at.z, layer, 70, CRATER), crackDecal(at.x, at.z, layer, 90)];
    decals.push(rubble(at.x, at.z, layer, 30, 50, 0x7a6a58));
    const trees = hitTrees(t => Math.hypot(t.x - at.x, t.z - at.z) < 45, t => new THREE.Vector3(t.x - at.x, 0, t.z - at.z).normalize(), layer, 40);
    const builds = STRUCTS.filter(b => b.layer === layer && !b.damaged && Math.hypot(b.x - at.x, b.z - at.z) < 60).slice(0, 8).map(b => damageBuilding(b, 3));
    builds.forEach(b => dustCloud(b.x, b.y, b.z, 10, 18));
    makeSites(layer, trees, builds, decals, .5);
  },
};
