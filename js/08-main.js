'use strict';
/* ================= interactables & travel ================= */
const interactables = [
  ...ZONE_IDS.map(z => ({id:z, name:'Masuk ' + ZONES[z].name, layer:ZONES[z].layer, at:ZONES[z].at, r:ZONES[z].r, color:ZONES[z].color, act:() => openZone(z)})),
  {id:'records', name:'Masuk Eryth Records', layer:1, at:[BEAN.x, BEAN.z + 8], r:5, color:'#ff4f45', act:() => openRecords()},
  {id:'machine', name:'Guna Mesin Serba Guna', layer:0, at:[9, 9], r:4.2, color:'#ff4f45', act:() => openMachine()},
  {id:'up', name:'Naik ke Labophase', layer:0, at:[LIFT.x, LIFT.z], r:3.2, color:'#9fc8ff', act:() => goUp()},
  {id:'down', name:'Turun ke Fabriophase', layer:1, at:[LAB.x, LAB.z + 20], r:3.2, color:'#9fc8ff', act:() => goDown()},
  {id:'ac', name:'Buka Panel Island A.C.', layer:1, at:[LAB.x + 15, LAB.z + 9], r:5.5, color:'#8fd8ff', act:() => openAC()},
  {id:'clock', name:'Radio & waktu solat', layer:0, at:[CLOCK.x, CLOCK.z + 7.5], r:5, color:'#ffd27a', act:() => openRadio()},
  {id:'dewan', name:'Masuk Dewan Komuniti', layer:0, at:[DEWAN.x + 2, DEWAN.z - 10], r:5, color:'#ff4f45', act:() => openKomuniti()},
  {id:'niv', name:'Turun ke Nivelham', layer:0, at:[NIV_PAD.x, NIV_PAD.z], r:3.6, color:'#8fe0ff', act:() => goNiv()},
  {id:'nivup', name:'Naik ke Tanah Besar', layer:2, at:[NV.arrive.x, NV.arrive.z], r:3.6, color:'#8fe0ff', act:() => goSurfaceFromNiv()},
  {id:'obs', name:'Teropong Balai Cerap', layer:0, at:[OBS.x, OBS.z + 8], r:4, color:'#c9b8ff', act:() => { const m = moonPhase(); toast(`Balai Cerap: bulan malam ini ${m.name} (umur ${m.age.toFixed(1)} hari). ${nightLevel > .5 ? 'Langit cerah untuk merenung.' : 'Datang semula selepas Maghrib.'}`, 'ok', 6000); }},
];
let nearby = null;
function findNearby(){
  const rec = interactables.find(i => i.id === 'records'); const s = beanSize(); rec.at = [BEAN.x, BEAN.z + s.z * .95 + 2.6];
  let best = null, bd = 1e9;
  interactables.forEach(i => { if(i.layer !== player.layer) return; const d = Math.hypot(player.x - i.at[0], player.z - i.at[1]); if(d < i.r && d < bd){ bd = d; best = i; } });
  if(best !== nearby){ nearby = best; const a = $('#act'); a.hidden = !best || !$('#panel').hidden || !session; if(best){ a.querySelector('span').textContent = best.name; a.style.setProperty('--c', best.color); } }
}
$('#act').addEventListener('click', () => nearby && nearby.act());
function setLayer(l){ player.layer = l; updateLayerLine(); pushPresence(true); minimapBase = null; }
function denyAccess(why, where){
  domeU.uAlert.value = 1; flash('rgba(255,40,40,.75)'); bavar.fails++; sfx.deny();
  toast('FRONTIER DOME · AKSES DITOLAK. ' + why, 'bad'); updateChips(); guestReport('ditolak', where);
}
function goUp(){
  if(!canLab()){ denyAccess('Pas tetamu kau tidak termasuk Labophase.', 'Labophase'); player.z += 4; return; }
  flash('rgba(111,243,255,.7)'); sfx.whoosh(); setLayer(1); player.x = LAB.x; player.z = LAB.z + 16; player.ry = Math.PI; cam.yaw = 0;
  toast('Melepasi Frontier Dome · Selamat datang ke Labophase', 'ok');
}
function goDown(){ flash('rgba(111,243,255,.6)'); sfx.whoosh(); setLayer(0); player.x = LIFT.x; player.z = LIFT.z + 5; cam.yaw = 0; }
function goNiv(){
  if(!canNiv()){ denyAccess('Pas tetamu kau tidak termasuk Nivelham.', 'Nivelham'); player.x += 4; return; }
  flash('rgba(143,224,255,.8)'); sfx.whoosh(); setLayer(2); player.x = NV.arrive.x; player.z = NV.arrive.z + 6; player.y = nivH(player.x, player.z); player.ry = 0; cam.yaw = Math.PI;
  toast('Aci Nivelham · Lembah salji. Awas binatang buas gergasi.', 'ok', 5000);
}
function goSurfaceFromNiv(){ flash('rgba(143,224,255,.6)'); sfx.whoosh(); setLayer(0); player.x = NIV_PAD.x + 3; player.z = NIV_PAD.z + 6; cam.yaw = .7; }
function warp(x, z, name, yaw){ flash('rgba(0,0,0,.85)'); sfx.whoosh(); player.x = x; player.z = z; cam.yaw = yaw; player.y = nivH(x, z); toast(name, 'ok'); pushPresence(true); }
function updateLayerLine(){
  const l = player.layer;
  $('#layerLine').textContent = l === 5 ? 'Labirin Memori · dalam Markas Tentera Laut' : l === 4 ? 'Dewan Baitul Hikmah · dalam Perpustakaan Hikmah, Nivelham' : l === 3 ? 'Istana Pangaea · Lapis Puncak · ' + pangRoom(player.x, player.z) : l === 1 ? 'Labophase · Lapis Atas · di bawah Frontier Dome' : l === 2 ? 'Nivelham · Lapis Bawah Tanah · ' + ({lembah:'Lembah Salji', gua:'Perkampungan Gua Besar', hikmah:'Mata Air Hikmah'})[nivRegion(player.x, player.z)] : (Math.hypot(player.x, player.z) < 72 ? 'Fabriophase · Teras' : 'Fabriophase · Tanah Besar Awam');
}

/* ================= input ================= */
const keys = new Set();
const cam = {yaw:0, pitch:.38, dist:13, tdist:13, tyaw:0};
const joy = {id:null, x:0, y:0, ox:0, oy:0};
const typing = () => { const a = document.activeElement; return a && /INPUT|TEXTAREA|SELECT/.test(a.tagName); };
addEventListener('keydown', e => {
  lastActive = performance.now(); if(session) audioStart();
  if(!$('#gate').hidden){ if(!typing()) gateKey(e); return; }   // keys typed into the login form belong to the form, not the PIN pad
  if(e.key === 'Escape'){ if(!$('#panel').hidden){ closePanel(); e.preventDefault(); } return; }
  if(typing()) return;
  if(!$('#panel').hidden) return;
  if(e.code === 'KeyE' && nearby){ nearby.act(); e.preventDefault(); return; }
  if(e.code === 'KeyG'){ setGloves(!gloves); return; }
  if(e.code === 'KeyL'){ lock('Dunia dikunci.'); return; }
  if(e.code === 'KeyM'){ toggleOverview(); return; }
  if(e.code === 'Equal' || e.code === 'NumpadAdd'){ cam.tdist = clamp(cam.tdist * .8, 2.5, 1800); return; }
  if(e.code === 'Minus' || e.code === 'NumpadSubtract'){ cam.tdist = clamp(cam.tdist * 1.25, 2.5, 1800); return; }
  keys.add(e.code); if(e.code.startsWith('Arrow') || e.code === 'Space') e.preventDefault();
});
addEventListener('keyup', e => keys.delete(e.code));
addEventListener('blur', () => keys.clear());
const cv = renderer.domElement; let drag = null; const touches = new Map(); let pinch = null;
cv.addEventListener('pointerdown', e => {
  lastActive = performance.now(); cv.setPointerCapture(e.pointerId); if(session) audioStart();
  if(e.pointerType === 'touch'){ touches.set(e.pointerId, {x:e.clientX, y:e.clientY}); if(touches.size === 2){ const [a, b] = [...touches.values()]; pinch = {d:Math.hypot(a.x - b.x, a.y - b.y), dist:cam.tdist}; drag = null; return; } }
  if(e.pointerType === 'touch' && e.clientX < innerWidth * .45 && joy.id == null && session && touches.size === 1){
    joy.id = e.pointerId; joy.ox = e.clientX; joy.oy = e.clientY; const j = $('#joy'); j.hidden = false; j.style.left = e.clientX + 'px'; j.style.top = e.clientY + 'px'; return;
  }
  drag = {id:e.pointerId, x:e.clientX, y:e.clientY, sx:e.clientX, sy:e.clientY, moved:false};
});
cv.addEventListener('pointermove', e => {
  if(touches.has(e.pointerId)) touches.set(e.pointerId, {x:e.clientX, y:e.clientY});
  if(pinch && touches.size === 2){ const [a, b] = [...touches.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y); cam.tdist = clamp(pinch.dist * pinch.d / Math.max(20, d), 2.5, 1800); return; }
  if(e.pointerId === joy.id){ let dx = e.clientX - joy.ox, dy = e.clientY - joy.oy; const m = Math.hypot(dx, dy), max = 50; if(m > max){ dx *= max / m; dy *= max / m; } joy.x = dx / max; joy.y = -dy / max; $('#joy i').style.transform = `translate(${dx}px,${dy}px)`; return; }
  if(drag && drag.id === e.pointerId){ const dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag.x = e.clientX; drag.y = e.clientY; if(Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) > 6) drag.moved = true; cam.yaw -= dx * .006; cam.pitch = clamp(cam.pitch + dy * .004, .05, 1.35); }
});
const endPtr = e => {
  touches.delete(e.pointerId); if(touches.size < 2) pinch = null;
  if(e.pointerId === joy.id){ joy.id = null; joy.x = joy.y = 0; $('#joy').hidden = true; $('#joy i').style.transform = ''; return; }
  if(drag && drag.id === e.pointerId){ if(!drag.moved && e.type === 'pointerup') pick(e.clientX, e.clientY); drag = null; }
};
cv.addEventListener('pointerup', endPtr); cv.addEventListener('pointercancel', endPtr);
cv.addEventListener('wheel', e => { cam.tdist = clamp(cam.tdist * Math.exp(e.deltaY * .0012), 2.5, 1800); e.preventDefault(); }, {passive:false});
function toggleOverview(){ cam.tdist = cam.tdist > 200 ? 13 : 1100; sfx.whoosh(); }
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
function pick(x, y){
  if(!session) return;
  ndc.set(x / innerWidth * 2 - 1, -y / innerHeight * 2 + 1); ray.setFromCamera(ndc, camera);
  if(player.layer === 4){ const slot = bookAtRay(ray); if(slot != null){ openBook(slot); return; } }
  if(player.layer === 5){ const slot = dementorAtRay(ray); if(slot != null){ openMemory(slot); return; } }
  const hits = ray.intersectObjects(clickables.filter(o => { for(let p = o; p && p !== scene; p = p.parent) if(!p.visible) return false; return true; }), true); if(!hits.length) return;
  let o = hits[0].object; while(o && !o.userData.info) o = o.parent; if(!o) return;
  const inf = o.userData.info;
  if(inf.holo){
    if(!gloves){ toast(`Tangan kau menembusi ${inf.name}. Pakai Light-Pressure Gloves (G) untuk menyentuh hologram.`); return; }
    o.userData.bounce = 1; flash('rgba(111,243,255,.25)'); tone(880, {d:.3, v:.05, glide:1320});
    toast(o === ery ? eryTip() : `${inf.name}: ${inf.desc}`, 'ok'); return;
  }
  if(o === machine){ if(Math.hypot(player.x - 9, player.z - 9) < 12 && player.layer === 0) openMachine(); else toast('Mesin Serba Guna: berjalan ke plaza Teras untuk menggunakannya.'); return; }
  if(o === obs){ interactables.find(i => i.id === 'obs').act(); return; }
  toast(`${inf.name}: ${inf.desc}`);
}
anims.push((t, dt) => holos.concat(satNPC.map(s => s.p.g)).forEach(h => { const b = h.userData.bounce || 0; if(b > 0){ h.userData.bounce = Math.max(0, b - dt * 1.6); h.scale.setScalar(1 + Math.sin(b * Math.PI) * .12); } }));
function eryTip(){
  const c = counts(), eq = equilibrium();
  if(eq.hungry && c[eq.hungry] === 0) return `ERY: ${ZONES[eq.hungry].name} masih kosong. Satelit ${ZONES[eq.hungry].keeper} sedang menunggu.`;
  if(eq.index != null) return `ERY: Indeks keseimbangan Erythmind ${eq.index}/100. Zon paling lapar: ${ZONES[eq.hungry].name}.`;
  return 'ERY: Seberangi Jambatan Cahaya ke timur untuk ke Tanah Besar. Tekan M untuk pandangan satelit.';
}
function setGloves(on){
  gloves = on; LS.set('erythmind.gloves', on); $('#bGloves').classList.toggle('on', on);
  $('#bGloves').firstChild.textContent = on ? 'Light-Pressure Gloves ' : 'Gloves ditanggalkan ';
  me.hands.forEach(h => { h.material.color.setHex(on ? 0x9fc8ff : 0xd9a77f); h.material.emissive.setHex(on ? 0x2fb8c8 : 0x000000); });
}

/* ================= movement ================= */
function groundAt(x, z, layer){ return layer === 1 ? 0 : layer === 2 ? nivH(x, z) : layer === 3 ? pangH(x, z) : layer === 4 ? libH(x, z) : layer === 5 ? 0 : surfaceH(x, z); }
function canStand(x, z, layer){
  if(layer === 1) return Math.hypot(x - LAB.x, z - LAB.z) <= LAB.r;
  if(layer === 2) return nivWalkable(x, z);
  if(layer === 3) return pangWalkable(x, z);
  if(layer === 4) return libWalkable(x, z);
  if(layer === 5) return mazeWalkable(x, z);
  return surfaceH(x, z) > -.6;
}
function surfaceAt(){
  const x = player.x, z = player.z;
  if(player.layer === 1) return 'logam';
  if(player.layer === 3) return pangSurface(x, z);
  if(player.layer === 4) return 'kayu';
  if(player.layer === 5) return 'batu';
  if(player.layer === 2){ const r = nivRegion(x, z); if(r === 'lembah') return 'salji'; if(r === 'gua') return 'batu'; return player.y > 1 ? 'kayu' : 'rumput'; }
  if(weatherNow().snow) return 'salji';
  if(onBridge(x, z)) return 'kayu';
  const d = Math.hypot(x, z);
  if(d < 72){ if(d > 56) return 'pasir'; if(d < 13.5 || Math.abs(d - 29.5) < 2) return 'batu'; return 'rumput'; }
  const h = surfaceH(x, z); if(h < -.2) return 'air'; if(h > 28) return 'salji';
  if(Math.hypot(x - COM.x, z - COM.z) < 48 || Math.hypot(x - CITY.x, z - CITY.z) < 75) return 'batu';
  return 'rumput';
}
function updatePlayer(dt){
  if(ride){ updateRide(dt); return; }
  if(seatTick(dt)) return;
  if(sarBlock(dt)) return;
  me.g.visible = true;
  let ix = 0, iy = 0;
  if(session && $('#panel').hidden && !(HAKI.busy > 0)){
    if(keys.has('KeyW') || keys.has('ArrowUp')) iy += 1; if(keys.has('KeyS') || keys.has('ArrowDown')) iy -= 1;
    if(keys.has('KeyA') || keys.has('ArrowLeft')) ix -= 1; if(keys.has('KeyD') || keys.has('ArrowRight')) ix += 1;
    ix += joy.x; iy += joy.y;
  }
  const len = Math.hypot(ix, iy); if(len > 1){ ix /= len; iy /= len; }
  const run = keys.has('ShiftLeft') || keys.has('ShiftRight') || Math.hypot(joy.x, joy.y) > .92;
  const sp = (run ? 18 : 9.5) * (cam.dist > 60 ? 2.5 : 1) * (HAKI.gear > 0 ? 1.6 : 1) * (player.chill > 0 ? .45 : 1);
  const fx = -Math.sin(cam.yaw), fz = -Math.cos(cam.yaw), rx = Math.cos(cam.yaw), rz = -Math.sin(cam.yaw);
  const mx = (fx * iy + rx * ix) * sp, mz = (fz * iy + rz * ix) * sp;
  player.moving = len > .05; player.speed = sp * Math.min(1, len);
  const L = player.layer;
  if(player.moving){
    const nx = player.x + mx * dt, nz = player.z + mz * dt;
    if(canStand(nx, nz, L)){ player.x = nx; player.z = nz; }
    else if(canStand(nx, player.z, L)) player.x = nx;
    else if(canStand(player.x, nz, L)) player.z = nz;
    const target = Math.atan2(mx, mz); let d = target - player.ry; d = Math.atan2(Math.sin(d), Math.cos(d)); player.ry += d * (1 - Math.exp(-dt * 12));
    lastActive = performance.now();
  }
  colliders.forEach(c => { if(c.layer !== L) return; const dx = player.x - c.x, dz = player.z - c.z; if(Math.abs(dx) > c.r + 1 || Math.abs(dz) > c.r + 1) return; const d = Math.hypot(dx, dz), r = c.r + .55; if(d < r && d > 1e-4){ player.x = c.x + dx / d * r; player.z = c.z + dz / d * r; } });
  if(L === 1){ const dx = player.x - LAB.x, dz = player.z - LAB.z, d = Math.hypot(dx, dz); if(d > LAB.r){ player.x = LAB.x + dx / d * LAB.r; player.z = LAB.z + dz / d * LAB.r; } }
  const gy = groundAt(player.x, player.z, L);
  player.y = Math.abs(gy - player.y) > 6 ? lerp(player.y, gy, 1 - Math.exp(-dt * 9)) : lerp(player.y, gy, 1 - Math.exp(-dt * 20));
  const baseY = layerBase(L);
  me.g.position.set(player.x, baseY + player.y, player.z); me.g.rotation.y = player.ry;
  animatePerson(me, player.moving, dt, player.speed);
  if(meMarker){ meMarker.position.y = 3.75 + Math.sin(performance.now() / 300) * .12; meMarker.rotation.y += dt * 2; }
  if(player.moving && AU.ctx){ const before = Math.floor(player.stepPhase / Math.PI); player.stepPhase = me.phase; if(Math.floor(me.phase / Math.PI) !== before){ const s = surfaceAt(); sfx.step(s); } }
  if(L === 0 && (Math.floor(player.x / 40) !== player.lx || Math.floor(player.z / 40) !== player.lz)){ player.lx = Math.floor(player.x / 40); player.lz = Math.floor(player.z / 40); updateLayerLine(); }
  if(L === 2){ const r = nivRegion(player.x, player.z); if(r !== player.reg){ player.reg = r; updateLayerLine(); } }
  if(L === 3){ const r = pangRoom(player.x, player.z); if(r !== player.reg){ player.reg = r; updateLayerLine(); } }
}
let camFocus = null;
const camTarget = new THREE.Vector3(), camPos = new THREE.Vector3(), _ov = new THREE.Vector3();
function updateCamera(dt, t){
  cam.dist = lerp(cam.dist, cam.tdist, 1 - Math.exp(-dt * 4));
  if(!session){
    cam.tyaw = (cam.tyaw || 0) + dt * (reduced ? .01 : .04);
    camTarget.set(150, 10, -50); const d = 420, pitch = .5;
    camPos.set(150 + Math.sin(cam.tyaw) * Math.cos(pitch) * d, Math.sin(pitch) * d + 20, -50 + Math.cos(cam.tyaw) * Math.cos(pitch) * d);
    camera.position.lerp(camPos, 1 - Math.exp(-dt * 2)); camera.lookAt(camTarget); return;
  }
  if(ride){ rideCamera(dt); return; }
  const L = player.layer, baseY = layerBase(L);
  if(L === 4 && cam.tdist > 34) cam.tdist = 34;
  if(L === 5 && cam.tdist > 40) cam.tdist = 40;
  const ov = smooth(220, 900, cam.dist); const O = OVERVIEW[L];
  _ov.set(lerp(player.x, O.x, ov), baseY + lerp(player.y + 2.4, L === 1 ? 0 : 10, ov), lerp(player.z, O.z, ov));
  camTarget.copy(_ov);
  if(camFocus) camTarget.lerp(camFocus.p, camFocus.k);   // a power can pull the view toward its action
  const pitch = L === 5 ? Math.max(cam.pitch, .78) : L === 2 ? lerp(cam.pitch, .1, ov) : lerp(cam.pitch, 1.42, smooth(80, 700, cam.dist));
  if(L === 2 && ov > 0) cam.yaw = lerp(cam.yaw, (90 - (CAVE.open[0] + CAVE.open[1]) / 2) / R2D_, ov * .1);
  camPos.set(camTarget.x + Math.sin(cam.yaw) * Math.cos(pitch) * cam.dist, camTarget.y + Math.sin(pitch) * cam.dist, camTarget.z + Math.cos(cam.yaw) * Math.cos(pitch) * cam.dist);
  const floor = baseY + groundAt(camPos.x, camPos.z, L === 1 ? 0 : L) + 1.2;
  if(L !== 1 && camPos.y < floor) camPos.y = floor;
  if(L === 2 && ov < .5){ const rr = Math.hypot(camPos.x - CAVE.x, camPos.z - CAVE.z); if(!inOpening(camPos.x, camPos.z) || rr < CAVE.lip){ camPos.y = Math.min(camPos.y, NVY + CAVE.ceil - 6); if(rr > CAVE.r - 6 && !inOpening(camPos.x, camPos.z)){ camPos.x = CAVE.x + (camPos.x - CAVE.x) * (CAVE.r - 6) / rr; camPos.z = CAVE.z + (camPos.z - CAVE.z) * (CAVE.r - 6) / rr; } } }
  if(L === 4){ camPos.x = clamp(camPos.x, LIBH.x - LIBH.hw + 1.5, LIBH.x + LIBH.hw - 1.5); camPos.z = clamp(camPos.z, LIBH.z - LIBH.hl + 1.5, LIBH.z + LIBH.hl - 1.5); camPos.y = Math.min(camPos.y, LIBH.y + LIBH.h - 2); }
  if(shake > 0){ shake = Math.max(0, shake - dt); camPos.x += (Math.random() - .5) * shake * 2; camPos.y += (Math.random() - .5) * shake * 2; }
  camera.position.lerp(camPos, 1 - Math.exp(-dt * 8)); camera.lookAt(camTarget);
  sun.shadow.camera.left = sun.shadow.camera.bottom = -90 - Math.min(cam.dist, 300); sun.shadow.camera.right = sun.shadow.camera.top = 90 + Math.min(cam.dist, 300); sun.shadow.camera.updateProjectionMatrix();
}

/* ================= minimap ================= */
const mm = $('#minimap'), mx2 = mm.getContext('2d');
let minimapBase = null;
function buildMinimapBase(layer){
  const c = document.createElement('canvas');
  const B = layer === 2 ? {x0:CAVE.x - 220, z0:CAVE.z - 220, w:440, h:440, s:.5} : layer === 3 ? {x0:PANG.x - 124, z0:PANG.z - 124, w:248, h:248, s:1} : layer === 4 ? {x0:LIBH.x - 30, z0:LIBH.z - 66, w:60, h:132, s:2} : layer === 5 ? {x0:MAZE.x - MAZE.half - 4, z0:MAZE.z - MAZE.half - 4, w:MAZE.half * 2 + 8, h:MAZE.half * 2 + 8, s:1} : {x0:-440, z0:-340, w:1040, h:1580, s:.3};
  c.width = B.w * B.s; c.height = B.h * B.s; const g = c.getContext('2d'); const img = g.createImageData(c.width, c.height);
  for(let py = 0; py < c.height; py++) for(let px = 0; px < c.width; px++){
    const x = B.x0 + px / B.s, z = B.z0 + py / B.s; let r = 11, gg = 36, b = 64;
    if(layer >= 3){ const c = layer === 3 ? pangMapColor(x, z) : layer === 4 ? libMapColor(x, z) : mazeMapColor(x, z); r = c[0]; gg = c[1]; b = c[2]; }
    else if(layer === 2){ if(nivWalkable(x, z) && nivH(x, z) > -5){ const h = nivH(x, z); const reg = nivRegion(x, z); if(reg === 'lembah'){ const v = clamp(200 - h * .6, 120, 230); r = v; gg = v + 8; b = v + 18; } else if(reg === 'gua'){ r = 92; gg = 74; b = 56; } else { r = 74; gg = 118; b = 70; } } else { r = 14; gg = 16; b = 22; } }
    else { const h = surfaceH(x, z); if(h > -.6 && baseIslandH(x, z) > 0){ r = 150; gg = 154; b = 162; } else if(h > -.6){ if(h > 28){ r = 236; gg = 240; b = 246; } else if(h > 14){ r = 140; gg = 132; b = 120; } else if(h < .05){ r = 214; gg = 194; b = 148; } else { r = 74; gg = 140; b = 72; } if(onBridge(x, z)){ r = 220; gg = 224; b = 232; } } }
    const i = (py * c.width + px) * 4; img.data[i] = r; img.data[i + 1] = gg; img.data[i + 2] = b; img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  if(layer === 0){ g.fillStyle = '#5a6278'; [[CITY.x, CITY.z, 60, 40]].forEach(([x, z, w, h]) => g.fillRect((x - w - B.x0) * B.s, (z - h - B.z0) * B.s, w * 2 * B.s, h * 2 * B.s)); }
  return {c, B};
}
function drawMinimap(){
  const L = player.layer === 1 ? 0 : player.layer;
  if(!minimapBase || minimapBase.layer !== L){ minimapBase = {layer:L, ...buildMinimapBase(L)}; }
  const {c, B} = minimapBase; const W = mm.width, half = W / 2;
  const view = clamp(cam.dist * 1.6, 120, 900);          // world units across the minimap radius
  const k = half / view;
  const cx = session ? player.x : OVERVIEW[0].x, cz = session ? player.z : OVERVIEW[0].z;
  mx2.clearRect(0, 0, W, W); mx2.save(); mx2.beginPath(); mx2.arc(half, half, half - 2, 0, 6.283); mx2.clip();
  mx2.fillStyle = L === 2 ? '#0e1016' : L === 3 ? '#cfe3f5' : L === 4 ? '#140d08' : L === 5 ? '#05070c' : '#0b2440'; mx2.fillRect(0, 0, W, W);
  mx2.imageSmoothingEnabled = true;
  mx2.drawImage(c, half + (B.x0 - cx) * k, half + (B.z0 - cz) * k, B.w * k, B.h * k);
  const P = (x, z) => [half + (x - cx) * k, half + (z - cz) * k];
  if(L === 0){ mx2.strokeStyle = 'rgba(255,79,69,.8)'; mx2.lineWidth = 2; mx2.setLineDash([4, 3]); mx2.beginPath(); mx2.arc(...P(LAB.x, LAB.z), (LAB.r + 3) * k, 0, 6.283); mx2.stroke(); mx2.setLineDash([]); }
  ZONE_IDS.forEach(z => { const Z = ZONES[z]; if((Z.layer === 1 ? 0 : Z.layer) !== L) return; const [x, y] = P(Z.at[0], Z.at[1]); mx2.fillStyle = Z.color; mx2.beginPath(); mx2.arc(x, y, 6, 0, 6.283); mx2.fill(); });
  if(L === 0){ [[CLOCK.x, CLOCK.z, '#ffd27a'], [NIV_GATE.x, NIV_GATE.z, '#8fe0ff'], [LIFT.x, LIFT.z, '#9fc8ff']].forEach(([x, z, col]) => { const [px, py] = P(x, z); mx2.fillStyle = col; mx2.fillRect(px - 4, py - 4, 8, 8); });
    bots.forEach(b => { const [x, y] = P(b.x, b.z); mx2.fillStyle = b.alert > 0 ? '#ff3030' : '#9fc8ff'; mx2.fillRect(x - 1.5, y - 1.5, 3, 3); }); }
  peers.forEach(a => { if((a.l === 1 ? 0 : a.l) !== L) return; mx2.fillStyle = a.kind === 'owner' ? '#ff4f45' : a.kind === 'female' ? '#ff6fb5' : '#3ddc84'; const [x, y] = P(a.x, a.z); mx2.beginPath(); mx2.arc(x, y, 5, 0, 6.283); mx2.fill(); });
  if(session){ mx2.save(); mx2.translate(half, half); mx2.rotate(-player.ry + Math.PI); mx2.fillStyle = '#ffffff'; mx2.beginPath(); mx2.moveTo(0, -11); mx2.lineTo(7, 8); mx2.lineTo(0, 4); mx2.lineTo(-7, 8); mx2.closePath(); mx2.fill(); mx2.restore(); }
  mx2.restore();
}
mm.addEventListener('click', () => session && toggleOverview());

/* ================= world reacts to data (equilibrium) ================= */
function afterData(){
  if(typeof refreshBooks === 'function') refreshBooks();
  if(typeof refreshDementors === 'function') refreshDementors();
  const c = counts();
  layoutBottles(c.memori);
  beanTarget = 1 + Math.log1p(plain.size) * .09;
  const v = moodValence();
  const col = new THREE.Color(); if(v == null) col.setHex(0x9be37a); else if(v >= 0) col.setHex(0x5fe3c0).lerp(new THREE.Color(0xffd36b), v / 2); else col.setHex(0x5fe3c0).lerp(new THREE.Color(0x6f7cff), -v / 2);
  rasaLeafMat.color.copy(col); rasaLeafMat.emissive.copy(col); fireMat.color.copy(col).lerp(new THREE.Color(0xffffff), .3);
  const active = [...plain.values()].filter(e => e.z === 'rancang' && e.data?.status === 'Sedang dibina').length;
  factoryActivity = clamp(.3 + active * .2, .3, 2);
  thinkSpeed = .5 + Math.min(c.fikir, 30) * .08;
  books.children.forEach(b => b.material.opacity = .25 + Math.min(1, c.ilmu / 14) * .5);
  pods.forEach(p => p.light.material.color.setHex(syncedToday() ? 0x9fc8ff : 0x37405a));
  updateChips();
  if(!$('#panel').hidden && ui.view === 'zone') renderZoneList();
  if(!$('#panel').hidden && ui.view === 'records') openRecords();
}
function syncedToday(){ return core?.sync && new Date(core.sync).toDateString() === new Date().toDateString(); }

/* ================= vault ops ================= */
let decQ = Promise.resolve();
function onVault(entries){
  raw.clear(); entries.forEach(([id, r]) => { if(r && r.z && r.iv && r.ct) raw.set(id, r); });
  decQ = decQ.then(async () => { if(!session) return; await decryptAll(); afterData(); }).catch(() => {});
}
async function decryptAll(){
  for(const id of [...plain.keys()]) if(!raw.has(id)) plain.delete(id);
  for(const [id, r] of raw){
    const key = session?.keys[r.z]; if(!key){ plain.delete(id); continue; }
    const prev = plain.get(id); if(prev && prev.iv === r.iv) continue;
    try{ const data = JSON.parse(td.decode(await unseal(key, r, `entry:${id}:${r.z}`))); plain.set(id, {id, z:r.z, t:r.t, u:r.u, iv:r.iv, data}); }
    catch(e){ plain.set(id, {id, z:r.z, t:r.t, iv:r.iv, bad:true, data:{}}); bavar.tamper++; }
  }
}
async function saveEntry(z, id, data, quiet){
  if(!isOwner()) return toast('Mod tetamu: baca sahaja.', 'bad');
  const nid = id || rid(12);
  const prev = plain.get(nid); const now = Date.now();
  const box = await seal(session.keys[z], te.encode(JSON.stringify(data)), `entry:${nid}:${z}`);
  const rec = {z, iv:box.iv, ct:box.ct, t:prev?.t || now, u:now};
  plain.set(nid, {id:nid, z, t:rec.t, u:now, iv:box.iv, data});
  try{ await store.put(nid, rec); if(!quiet){ toast('Disulitkan & disimpan ke ' + ZONES[z].name, 'ok'); tone(1046, {d:.25, v:.05}); tone(1568, {t:.1, d:.35, v:.04}); } }
  catch(e){ plain.delete(nid); toast(e.code === 'quota_exceeded' ? 'Bilik kebal penuh. Padam beberapa rekod lama dahulu.' : 'Gagal menyimpan (' + (e.code || e.message) + '). Cuba lagi.', 'bad'); return null; }
  if(!quiet) afterData(); return nid;
}
async function deleteEntry(id){
  if(!isOwner()) return;
  try{ await store.del(id); plain.delete(id); toast('Rekod dipadam.', 'ok'); afterData(); }
  catch(e){ toast('Gagal memadam (' + (e.code || e.message) + ').', 'bad'); }
}

/* ================= session ================= */
async function createWorld(pin){
  if(store.peek && await store.peek()) throw new Error('Erythmind sudah wujud. Muat semula halaman dan masukkan PIN.');
  const mkRaw = rand(32), salt = b64(rand(16));
  const kek = await kekFrom(pin, salt, ITER);
  const MK = await aesKey(mkRaw);
  const c = {v:2, name:'Erythmind', ownerName:'Eryth Sayf', created:Date.now(), kdf:{salt, iter:ITER}, owner:await seal(kek, mkRaw, 'owner'), zones:{}, guests:{}};
  const keys = {};
  for(const z of ZONE_IDS){ const zk = rand(32); c.zones[z] = await seal(MK, zk, 'zone:' + z); keys[z] = await aesKey(zk); zk.fill(0); }
  mkRaw.fill(0);
  await store.setCore(c); core = clone(c);
  startSession({role:'owner', name:c.ownerName, gender:null, MK, keys, lab:true, niv:true, istana:true, laut:true});
}
async function tryUnlock(pin){
  const c = core; if(!c) return false;
  try{
    const kek = await kekFrom(pin, c.kdf.salt, c.kdf.iter);
    const mkRaw = await unseal(kek, c.owner, 'owner'); const MK = await aesKey(mkRaw); mkRaw.fill(0);
    const keys = {}; const missing = [];
    for(const z of ZONE_IDS){ if(!c.zones[z]){ missing.push(z); continue; } const zk = await unseal(MK, c.zones[z], 'zone:' + z); keys[z] = await aesKey(zk); zk.fill(0); }
    if(missing.length){ // new zones added in this version of Erythmind
      const n = clone(c);
      for(const z of missing){ const zk = rand(32); n.zones[z] = await seal(MK, zk, 'zone:' + z); keys[z] = await aesKey(zk); zk.fill(0); }
      n.v = 2; await store.setCore(n).catch(() => {}); core = n;
      setTimeout(() => toast(`Zon baharu diaktifkan: ${missing.map(z => ZONES[z].name).join(', ')}.`, 'ok', 6000), 1200);
    }
    startSession({role:'owner', name:c.ownerName || 'Eryth Sayf', gender:null, MK, keys, lab:true, niv:true, istana:true, laut:true}); return true;
  }catch(e){}
  for(const [gid, g] of Object.entries(c.guests || {})){
    try{
      const kek = await kekFrom(pin, g.salt, g.iter);
      await unseal(kek, g.check, 'guest:' + gid);
      if(g.exp && Date.now() > g.exp){ toast(`Pas ${g.name} telah tamat tempoh. Minta pemilik memanjangkannya.`, 'bad', 6000); return false; }
      const keys = {};
      for(const [z, box] of Object.entries(g.keys || {})){ const zk = await unseal(kek, box, `gz:${gid}:${z}`); keys[z] = await aesKey(zk); zk.fill(0); }
      startSession({role:'guest', gid, name:g.name, gender:g.gender, keys, lab:!!g.lab, niv:!!g.niv, istana:!!g.istana, laut:!!g.laut, powers:Array.isArray(g.powers) ? g.powers.filter(p => typeof p === 'string').slice(0, 8) : []}); return true;
    }catch(e){}
  }
  guestReport('pin', 'Pad Frontier Dome');
  return false;
}
function startSession(s){
  session = s; lastActive = performance.now();
  LS.set('erythmind.fails', {n:0, until:0});
  $('#gate').hidden = true; setSelfLook();
  meLabel.el.className = 'lbl name ' + (s.role === 'owner' ? 'owner' : s.gender);
  meLabel.el.textContent = s.role === 'owner' ? s.name + ' · pemilik' : s.name + ' · tetamu';
  $('#bGuests').hidden = s.role !== 'owner';
  setLayer(0); player.x = 0; player.z = 16; player.y = 0; cam.yaw = 0; cam.tdist = 13;
  decQ = decQ.then(async () => { await decryptAll(); afterData(); });
  if(s.role === 'owner' && store.watchIntel && !startSession.intel){ startSession.intel = true; store.watchIntel(onReports, ev => { pub.risikan = ev; if(ui.view === 'intel') openIntel(); }); }
  toast(s.role === 'owner' ? 'Selamat pulang, ' + s.name + '. Frontier Dome dibuka.' : 'Selamat datang, ' + s.name + '. Kau masuk sebagai tetamu. Bot Bayang sedang memerhati.', 'ok');
  audioStart(); updateRadioChip(); updateWho(); updateChips(); pushPresence(true);
}
function lock(msg){
  if(!session) return;
  if(ride) endRide(); closeMap();
  session = null; plain.clear(); closePanel(); gateMsg = ''; pinBuf = ''; layoutBottles(0); beanTarget = 1; setLayer(0);
  AU.ctx?.suspend();
  if(msg) toast(msg); pushPresence(true); renderGate('unlock'); updateWho(); updateIntelChip();
}
setInterval(() => { if(session && performance.now() - lastActive > AUTO_LOCK_MS) lock('Bavar-373: dunia dikunci automatik selepas 10 minit tanpa aktiviti.');
  else if(session?.role === 'guest' && core?.guests?.[session.gid]?.exp && Date.now() > core.guests[session.gid].exp) lock('Pas tetamu kau telah tamat tempoh.'); }, 10000);
['pointerdown','keydown','wheel','touchstart'].forEach(ev => addEventListener(ev, () => lastActive = performance.now(), {passive:true}));

$('#bGloves').addEventListener('click', () => setGloves(!gloves));
$('#bAC').addEventListener('click', () => session && openAC());
$('#bGuests').addEventListener('click', openGuests);
$('#bSettings').addEventListener('click', () => session && openSettings());
$('#bLock').addEventListener('click', () => lock('Dunia dikunci. Semua kunci dibuang dari memori.'));
$('#bRadio').addEventListener('click', () => { if(!session) return; audioStart(); openRadio(); });
$('#bView').addEventListener('click', () => session && toggleOverview());
$('#chipBavar').addEventListener('click', () => session && openBavar());
$('#bBavar').addEventListener('click', () => session && openBavar());
$('#chipDome').addEventListener('click', () => session && openDome());
$('#chipAC').addEventListener('click', () => session && openAC());
$('#chipIntel').addEventListener('click', () => openIntel());
$('#clock').addEventListener('click', () => session && openRadio());

/* ================= main loop ================= */
function resize(){ const w = innerWidth, h = innerHeight; renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); }
addEventListener('resize', resize); resize();
const clock = new THREE.Clock(); let mmTick = 0;
function frame(){
  const dt = Math.min(clock.getDelta(), .05), t = clock.elapsedTime;
  anims.forEach(f => f(t, dt));
  updatePlayer(dt); updatePeers(dt); updateAnimals(dt, t); updateFlocks(dt, t); updateBots(dt, t); updateBeasts(dt, t);
  updateCamera(dt, t); updateEnvironment(dt, t); updateSeasons(dt, t); updateAudio(dt, t); updateClock(dt);
  if(session){ findNearby(); pushPresence(false); }
  renderWorld(dt); updateLabels();
  if((mmTick++ % 3) === 0) drawMinimap();
  requestAnimationFrame(frame);
}
function start(){ setSelfLook(); updateChips(); updatePrayerChip(); renderGate('loading'); requestAnimationFrame(frame); boot(); }

/* ================= boot ================= */
async function boot(){
  const db = await use('db');
  const user = db ? await use('user') : null;
  if(user){ try{ artifactOwner = (await user.isOwner()) || (await user.canEdit()); }catch(e){} }
  store = db ? dbStore(db) : localStore();
  $('#chipLocal').hidden = store.kind !== 'local';
  let decided = false;
  const decide = () => { if(decided) return; decided = true; pinBuf = ''; renderGate(core ? 'unlock' : (store.kind === 'local' || artifactOwner ? 'setup1' : 'inactive')); };
  store.watch((c, fromCache) => {
    core = c ? clone(c) : null;
    if(!decided){ if(!c && fromCache) return; decide(); return; }
    if(!session && core && (gateState === 'inactive' || gateState === 'setup1') && !gateBusy) renderGate('unlock');
    if(session){
      if(!core) return lock('Dunia ini telah dikosongkan.');
      if(session.role === 'guest' && !core.guests?.[session.gid]) return lock('Pas tetamu kau telah dibatalkan oleh pemilik.');
      if(session.role === 'guest' && core.guests[session.gid].exp && Date.now() > core.guests[session.gid].exp) return lock('Pas tetamu kau telah tamat tempoh.');
      afterData();
    }
  }, onVault);
  store.watchPublic(posts => { pub.board = posts; drawBoard(posts); if(ui.view === 'komuniti') openKomuniti(); }, book => { pub.guestbook = book; if(ui.view === 'komuniti') openKomuniti(); });
  setTimeout(decide, 6000);
  startRoom(); loadHiggsfield();
}
if(document.readyState === 'loading') addEventListener('DOMContentLoaded', start); else start();

/* compact HUD (phones): the tool buttons live behind a Menu toggle */
$('#bMenu').addEventListener('click', () => { const t = $('#tools'), on = !t.classList.contains('open'); t.classList.toggle('open', on); $('#bMenu').setAttribute('aria-expanded', String(on)); $('#bMenu').textContent = on ? 'Tutup menu' : 'Menu'; });
$('#tools').addEventListener('click', e => { const b = e.target.closest('.tbtn'); if(b && b.id !== 'bMenu' && $('#tools').classList.contains('open')){ $('#tools').classList.remove('open'); $('#bMenu').textContent = 'Menu'; $('#bMenu').setAttribute('aria-expanded', 'false'); } });
