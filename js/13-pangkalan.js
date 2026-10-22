'use strict';
/* ================= Pangkalan Laut Erythmind: crescent naval island ~1 km south =================
   Bay trap, Japanese-castle headquarters, Oris Plaza with the Proclamation Tower and the Alarm Bell,
   cannon batteries, rising steel encircling walls, and the Gate of Justice on the Tarai current. */
const bx = (a, r) => BASE.x + Math.cos(a) * r, bz = (a, r) => BASE.z + Math.sin(a) * r;
const faceRot = a => Math.atan2(Math.cos(a), Math.sin(a));    // rotation.y that turns local +z toward world angle a
const steelMat = M(0x3a404c, {metalness:.7, roughness:.35}), navyMat = M(0x1f2f52), whiteWall = M(0xf3f1ea);
function brickTex(){
  const c = document.createElement('canvas'); c.width = 128; c.height = 128; const g = c.getContext('2d');
  g.fillStyle = '#5e4a40'; g.fillRect(0, 0, 128, 128);
  for(let y = 0; y < 128; y += 16) for(let x = -16; x < 128; x += 32){ const o = (y / 16) % 2 ? 16 : 0; g.fillStyle = ['#8a4e3a', '#9a5a42', '#7c4636'][(x + y) % 3 === 0 ? 0 : (x + y) % 3]; g.fillRect(x + o + 1, y + 1, 30, 14); }
  g.fillStyle = '#3a404c'; g.fillRect(0, 60, 128, 8);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1 / 8, 1 / 8); return t;
}
function stoneTex(){
  const c = document.createElement('canvas'); c.width = 128; c.height = 128; const g = c.getContext('2d');
  g.fillStyle = '#5a5c60'; g.fillRect(0, 0, 128, 128);
  for(let y = 0; y < 128; y += 21) for(let x = 0; x < 128; x += 26){ const v = 110 + ((x * 7 + y * 13) % 40); g.fillStyle = `rgb(${v},${v},${v + 4})`; g.fillRect(x + ((y / 21) % 2 ? 13 : 0) + 1, y + 1, 24, 19); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}

/* --- the crescent island: brick-and-steel sheer walls, concrete top, four small hills --- */
{
  const half = BASE.open / R2D_, rm = (BASE.rIn + BASE.rOut) / 2, cr = (BASE.rOut - BASE.rIn) / 2, pts = [];
  const P = (x, z) => pts.push(new THREE.Vector2(x - BASE.x, -(z - BASE.z)));
  const a0 = BASE.face + half, a1 = BASE.face + Math.PI * 2 - half;
  for(let i = 0; i <= 90; i++){ const a = lerp(a0, a1, i / 90); P(bx(a, BASE.rOut), bz(a, BASE.rOut)); }
  { const c = [bx(a1, rm), bz(a1, rm)], rad = [Math.cos(a1), Math.sin(a1)], t = [-Math.sin(a1), Math.cos(a1)];
    for(let i = 1; i < 16; i++){ const f = i / 16 * Math.PI; P(c[0] + cr * (Math.cos(f) * rad[0] + Math.sin(f) * t[0]), c[1] + cr * (Math.cos(f) * rad[1] + Math.sin(f) * t[1])); } }
  for(let i = 0; i <= 70; i++){ const a = lerp(a1, a0, i / 70); P(bx(a, BASE.rIn), bz(a, BASE.rIn)); }
  { const c = [bx(a0, rm), bz(a0, rm)], rad = [Math.cos(a0), Math.sin(a0)], t = [Math.sin(a0), -Math.cos(a0)];
    for(let i = 1; i < 16; i++){ const f = i / 16 * Math.PI; P(c[0] + cr * (-Math.cos(f) * rad[0] + Math.sin(f) * t[0]), c[1] + cr * (-Math.cos(f) * rad[1] + Math.sin(f) * t[1])); } }
  const geo = new THREE.ExtrudeGeometry(new THREE.Shape(pts), {depth:BASE.top + 30, bevelEnabled:false, curveSegments:1});
  geo.rotateX(-Math.PI / 2);
  const isl = new THREE.Mesh(geo, [M(0x9aa0a8, {flatShading:false}), new THREE.MeshStandardMaterial({map:brickTex(), roughness:.85})]);
  isl.position.set(BASE.x, -30, BASE.z); isl.receiveShadow = true; S.add(isl);
  // steel band on the rim and a quay kerb on the bay side
  BASE.hills.forEach(([x, z]) => { const h = mesh(new THREE.SphereGeometry(13, 20, 10, 0, 6.283, 0, Math.PI / 2), M(0x5f9a4a), x, BASE.top, z, S, false); h.scale.y = 7 / 13; });
  info(isl, 'Pangkalan Laut Erythmind', 'Pulau buatan berbentuk bulan sabit yang mengepung Teluk Pengepung. Diperkukuh bata tebal dan keluli kalis letupan untuk menahan serangan meriam berat.');
}
const atBack = (r, t = 0) => { const a = BASE.back + t / r; return [bx(a, r), bz(a, r)]; };

/* --- Markas: multi-storey Japanese castle keep (secular tenshu) on a sloped stone base --- */
const hqProc = grp(BASE.hq.x, BASE.top, BASE.hq.z); hqProc.rotation.y = faceRot(BASE.face);
const hqSign = grp(BASE.hq.x, BASE.top, BASE.hq.z); hqSign.rotation.y = faceRot(BASE.face);
{
  const st = new THREE.MeshStandardMaterial({map:stoneTex(), roughness:.95}); st.map.repeat.set(6, 3);
  const base = mesh(new THREE.CylinderGeometry(44 / Math.SQRT2, 54 / Math.SQRT2, 14, 4, 1), st, 0, 7, 0, hqProc); base.rotation.y = Math.PI / 4;
  const roofM = M(0x3a4a46, {roughness:.6}), gold = M(0xd8a93a, {metalness:.7, roughness:.3});
  const winC = document.createElement('canvas'); winC.width = 128; winC.height = 64; { const g = winC.getContext('2d'); g.fillStyle = '#f3f1ea'; g.fillRect(0, 0, 128, 64); g.fillStyle = '#2a2a30'; for(let i = 0; i < 4; i++) g.fillRect(10 + i * 30, 22, 14, 22); g.fillStyle = '#c9c4b6'; g.fillRect(0, 58, 128, 6); }
  const winT = new THREE.CanvasTexture(winC); winT.wrapS = THREE.RepeatWrapping;
  let y = 14;
  [40, 34, 28, 22, 16].forEach((w, i) => {
    const t = winT.clone(); t.needsUpdate = true; t.repeat.set(Math.round(w / 8), 1);
    mesh(new THREE.BoxGeometry(w, 7, w), new THREE.MeshStandardMaterial({map:t, roughness:.8}), 0, y + 3.5, 0, hqProc);
    const roof = mesh(new THREE.CylinderGeometry((w - 6) / Math.SQRT2, (w + 9) / Math.SQRT2, 3.6, 4, 1), roofM, 0, y + 8.6, 0, hqProc); roof.rotation.y = Math.PI / 4;
    [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([sx, sz]) => mesh(new THREE.SphereGeometry(.6, 8, 6), gold, sx * (w + 9) / 2, y + 7, sz * (w + 9) / 2, hqProc, false));
    if(i % 2 === 0){ const gab = mesh(new THREE.CylinderGeometry(w * .22, w * .22, 4, 3), roofM, 0, y + 9.2, w / 2 + 2, hqProc, false); gab.rotation.x = -Math.PI / 2; gab.scale.set(1, 1, .55);
      const tri = mesh(new THREE.CircleGeometry(w * .17, 3), whiteWall, 0, y + 8.9, w / 2 + 4.05, hqProc, false); tri.rotation.z = Math.PI / 2; tri.scale.set(.55, 1, 1); }
    y += 10.4;
  });
  [-1, 1].forEach(s => mesh(new THREE.ConeGeometry(.8, 3, 8), gold, s * 4, y - .4, 0, hqProc, false));
  // giant front sign: the Navy kanji, the anchor emblem and the Malay name
  const c = document.createElement('canvas'); c.width = 1024; c.height = 384; const g = c.getContext('2d');
  g.fillStyle = '#1b2a4a'; g.fillRect(0, 0, 1024, 384); g.strokeStyle = '#d8a93a'; g.lineWidth = 10; g.strokeRect(12, 12, 1000, 360);
  g.fillStyle = '#ffffff'; g.font = '700 210px "Noto Sans JP","Hiragino Sans","Yu Gothic","Microsoft YaHei",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('海', 200, 170); g.fillText('軍', 824, 170);
  g.strokeStyle = '#ffffff'; g.lineWidth = 16; g.beginPath(); g.arc(512, 92, 22, 0, 6.283); g.moveTo(512, 114); g.lineTo(512, 270); g.moveTo(452, 150); g.lineTo(572, 150); g.moveTo(432, 222); g.quadraticCurveTo(450, 280, 512, 280); g.quadraticCurveTo(574, 280, 592, 222); g.stroke();
  g.font = '700 46px EB Garamond, Georgia, serif'; g.fillStyle = '#d8a93a'; g.fillText('TENTERA LAUT ERYTHMIND', 512, 336);
  const sign = mesh(new THREE.PlaneGeometry(30, 11.25), new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c)}), 0, 6.4, 26.2, hqSign, false); sign.rotation.x = -Math.atan2(5, 14);
  const R = 27; for(let k = -R; k <= R; k += 1.6){ [[k, R], [k, -R], [R, k], [-R, k]].forEach(([lx, lz]) => { const a = hqProc.rotation.y, x = BASE.hq.x + lx * Math.cos(a) + lz * Math.sin(a), z = BASE.hq.z - lx * Math.sin(a) + lz * Math.cos(a); collide(x, z, 1.1); }); }
  info(hqProc, 'Markas Tentera Laut', 'Ibu pejabat Pangkalan Laut. Istana gaya Jepun berlapis lima di atas tapak batu condong, dengan papan gergasi 海軍 (Tentera Laut) dan lambang sauh Erythmind.');
}
// watchtowers on the four hills, flying the anchor flag
const flags = [];
{
  const fc = document.createElement('canvas'); fc.width = 128; fc.height = 80; const g = fc.getContext('2d');
  g.fillStyle = '#ffffff'; g.fillRect(0, 0, 128, 80); g.strokeStyle = '#1b2a4a'; g.lineWidth = 7; g.beginPath(); g.arc(64, 18, 6, 0, 6.283); g.moveTo(64, 24); g.lineTo(64, 64); g.moveTo(48, 34); g.lineTo(80, 34); g.moveTo(42, 50); g.quadraticCurveTo(46, 66, 64, 66); g.quadraticCurveTo(82, 66, 86, 50); g.stroke();
  const flagMat = new THREE.MeshStandardMaterial({map:new THREE.CanvasTexture(fc), side:THREE.DoubleSide});
  BASE.hills.forEach(([x, z]) => {
    const t = grp(x, BASE.top + 6.5, z); t.rotation.y = faceRot(BASE.face);
    mesh(new THREE.BoxGeometry(6, 6, 6), new THREE.MeshStandardMaterial({map:stoneTex(), roughness:.95}), 0, 3, 0, t);
    mesh(new THREE.BoxGeometry(5, 4, 5), whiteWall, 0, 8, 0, t); const r = mesh(new THREE.CylinderGeometry(1.5, 5.4, 2.6, 4), M(0x3a4a46), 0, 11.2, 0, t); r.rotation.y = Math.PI / 4;
    mesh(new THREE.CylinderGeometry(.12, .12, 9, 6), steelMat, 0, 16.5, 0, t, false);
    const f = mesh(new THREE.PlaneGeometry(4.2, 2.6), flagMat, 2.1, 19.6, 0, t, false); flags.push(f);
    collide(x, z, 3.6); info(t, 'Menara Pengawal Penjuru', 'Satu daripada empat menara di atas bukit kecil di penjuru Markas. Bendera sauh Erythmind berkibar di bumbungnya.');
  });
  anims.push(t => flags.forEach((f, i) => { f.rotation.y = Math.sin(t * 2.2 + i) * .25 + windNow * .3; }));
}

/* --- Oris Plaza: concrete parade ground, troops in formation, Menara Isytihar, Loceng Amaran --- */
{
  const pc = document.createElement('canvas'); pc.width = 256; pc.height = 128; const g = pc.getContext('2d');
  g.fillStyle = '#c9ccd2'; g.fillRect(0, 0, 256, 128); g.strokeStyle = '#aeb2ba'; g.lineWidth = 2; for(let x = 0; x <= 256; x += 32){ g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 128); g.stroke(); } for(let y = 0; y <= 128; y += 32){ g.beginPath(); g.moveTo(0, y); g.lineTo(256, y); g.stroke(); }
  const pt = new THREE.CanvasTexture(pc); pt.repeat.set(3, 1.5); pt.wrapS = pt.wrapT = THREE.RepeatWrapping;
  const pg2 = grp(BASE.plaza.x, BASE.top + .05, BASE.plaza.z); pg2.rotation.y = faceRot(BASE.face);
  mesh(new THREE.PlaneGeometry(110, 36), new THREE.MeshStandardMaterial({map:pt, roughness:.9}), 0, 0, 0, pg2, false).rotation.x = -Math.PI / 2;
  // troops in formation, facing the headquarters
  const rows = 12, cols = 40, n = rows * cols;
  const body = new THREE.InstancedMesh(new THREE.BoxGeometry(.6, 1.5, .4), M(0xf4f6fa), n), cap = new THREE.InstancedMesh(new THREE.CylinderGeometry(.24, .26, .34, 8), navyMat, n);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), faceRot(BASE.back)), s1 = new THREE.Vector3(1, 1, 1), p = new THREE.Vector3();
  let i = 0; for(let r = 0; r < rows; r++) for(let c2 = 0; c2 < cols; c2++){ const t = (c2 - (cols - 1) / 2) * 2.2 + (c2 >= cols / 2 ? 6 : -6), rr = 166 + r * 2.2; const a = BASE.back + t / rr;
    m4.compose(p.set(bx(a, rr), BASE.top + .8, bz(a, rr)), q, s1); body.setMatrixAt(i, m4); m4.compose(p.set(bx(a, rr), BASE.top + 1.75, bz(a, rr)), q, s1); cap.setMatrixAt(i, m4); i++; }
  [body, cap].forEach(m => { m.castShadow = true; S.add(m); });
  info(body, 'Barisan Tentera Elit', 'Ratusan tentera elit berbaris di Oris Plaza. Bila Loceng Amaran dibunyikan, mereka siap siaga dan Tembok Pengepung naik dari dasar laut.');
  // Menara Isytihar: a tall timber tower for raising the flag and making proclamations
  const tw = grp(BASE.plaza.x, BASE.top, BASE.plaza.z); tw.rotation.y = faceRot(BASE.face); const wood = M(0x7a5a3a);
  [[-3, -3], [3, -3], [-3, 3], [3, 3]].forEach(([x, z]) => mesh(new THREE.BoxGeometry(.7, 26, .7), wood, x, 13, z, tw));
  for(let k = 0; k < 4; k++){ const yy = 4 + k * 6; [0, 1].forEach(o => { const b = mesh(new THREE.BoxGeometry(8.5, .35, .35), wood, 0, yy, o ? 3 : -3, tw, false); b.rotation.z = k % 2 ? .6 : -.6; }); }
  mesh(new THREE.BoxGeometry(9, .6, 9), wood, 0, 26, 0, tw); [[0, 4.3, 9, .3], [0, -4.3, 9, .3], [4.3, 0, .3, 9], [-4.3, 0, .3, 9]].forEach(([x, z, w, d]) => mesh(new THREE.BoxGeometry(w, 1.2, d), wood, x, 27, z, tw, false));
  mesh(new THREE.BoxGeometry(2.2, 22, 2.2), wood, 0, 11, 6, tw); for(let k = 0; k < 11; k++) mesh(new THREE.BoxGeometry(2.4, .2, .5), wood, 0, 1 + k * 2, 7.2, tw, false);
  mesh(new THREE.CylinderGeometry(.14, .14, 14, 6), steelMat, 0, 33, 0, tw, false); const big = mesh(new THREE.PlaneGeometry(8, 5), flags[0].material, 4, 37.5, 0, tw, false); flags.push(big);
  collide(BASE.plaza.x, BASE.plaza.z, 6);
  info(tw, 'Menara Isytihar', 'Menara kayu tinggi di tengah Oris Plaza. Di sinilah bendera dinaikkan dan pengisytiharan dibuat kepada seluruh armada. (Diadaptasi daripada pentas hukuman Marineford.)');
  // Loceng Amaran: alarm bell (not a sacred bell)
  const [lx, lz] = atBack(176, 34); const bell = grp(lx, BASE.top, lz); bell.rotation.y = faceRot(BASE.face);
  [-2.4, 2.4].forEach(x => mesh(new THREE.BoxGeometry(.8, 8, .8), wood, x, 4, 0, bell)); mesh(new THREE.BoxGeometry(6.4, .8, 1.2), wood, 0, 8.2, 0, bell);
  const prof = []; for(let k = 0; k <= 10; k++){ const t = k / 10; prof.push(new THREE.Vector2(.9 + Math.pow(t, 2.2) * 1.4, 3.4 - t * 3.4)); }
  const bellM = mesh(new THREE.LatheGeometry(prof, 24), M(0x9a7a3a, {metalness:.8, roughness:.3}), 0, 4.2, 0, bell); BASE.bellMesh = bellM; BASE.bellAt = [lx, lz];
  collide(lx, lz, 3);
  info(bell, 'Loceng Amaran', 'Loceng amaran pangkalan. Bunyikan untuk mengaktifkan pertahanan: Tembok Pengepung naik dan bateri meriam bersiap.');
}

/* --- cannon batteries along the outer arc --- */
const cannons = [];
{
  const half = BASE.open / R2D_ + .06; let a = BASE.face + half;
  while(a < BASE.face + Math.PI * 2 - half){ if(Math.abs(Math.atan2(Math.sin(a - BASE.back), Math.cos(a - BASE.back))) > .22) cannons.push(a); a += 2.6 / R2D_; }
  const carr = new THREE.InstancedMesh(new THREE.BoxGeometry(2.2, 1.2, 2.6), steelMat, cannons.length), bar = new THREE.InstancedMesh(new THREE.CylinderGeometry(.42, .55, 5, 10), M(0x23262e, {metalness:.8, roughness:.3}), cannons.length);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), s1 = new THREE.Vector3(1, 1, 1), p = new THREE.Vector3();
  cannons.forEach((a, i) => { const r = BASE.rOut - 4; q.setFromEuler(e.set(0, faceRot(a), 0)); m4.compose(p.set(bx(a, r), BASE.top + .6, bz(a, r)), q, s1); carr.setMatrixAt(i, m4);
    q.setFromEuler(e.set(Math.PI / 2 - .18, faceRot(a), 0, 'YXZ')); m4.compose(p.set(bx(a, r + 1.6), BASE.top + 1.7, bz(a, r + 1.6)), q, s1); bar.setMatrixAt(i, m4); });
  [carr, bar].forEach(m => { m.castShadow = true; S.add(m); });
  info(bar, 'Bateri Meriam Luar', `${cannons.length} meriam artileri berat di sepanjang tebing bulan sabit, menghala ke laut terbuka.`);
}

/* --- encircling steel walls hidden under the bay --- */
const DEF = {on:false, k:0, until:0, next:0};
const encWalls = [];
{
  const n = 64, r = BASE.rIn - 6, w = 6.283 * r / n + .6, mat = steelMat, stripe = new THREE.MeshBasicMaterial({color:0xc8262c});
  for(let i = 0; i < n; i++){ const a = i / n * 6.283; const g = grp(bx(a, r), -40, bz(a, r)); g.rotation.y = faceRot(a) ; mesh(new THREE.BoxGeometry(w, 34, 3), mat, 0, 0, 0, g, false); mesh(new THREE.BoxGeometry(w + .05, 1.4, 3.1), stripe, 0, 14, 0, g, false); g.userData.d = (i % 8) * .12; encWalls.push(g); }
}
// muzzle flashes and splashes for the batteries
const fxPool = [];
for(let i = 0; i < 10; i++){ const fl = mesh(new THREE.SphereGeometry(1.6, 10, 8), holoMat(0xffb060, .9), 0, -50, 0, S, false), sp = mesh(new THREE.CylinderGeometry(1.4, 3, 1, 10, 1, true), new THREE.MeshBasicMaterial({color:0xffffff, transparent:true, opacity:.8, depthWrite:false}), 0, -50, 0, S, false); fxPool.push({fl, sp, t:9}); }
let fxI = 0;
function fireCannon(){
  const a = cannons[Math.floor(Math.random() * cannons.length)], r = BASE.rOut - 4 + 4.5, f = fxPool[fxI++ % fxPool.length], far = r + 90 + Math.random() * 140;
  f.fl.position.set(bx(a, r), BASE.top + 2.3, bz(a, r)); f.sp.position.set(bx(a, far), -1.6, bz(a, far)); f.t = 0;
  const near = player.layer === 0 && Math.hypot(player.x - BASE.x, player.z - BASE.z) < 900;
  if(near && AU.ctx){ noiseHit({d:.9, v:.35, f:180, brown:true}); setTimeout(() => noiseHit({d:.6, v:.18, type:'bandpass', f:900, q:.6}), 900); }
}
function setDefense(on){
  DEF.on = on; DEF.until = performance.now() + 45000;
  if(on){ toast('LOCENG AMARAN · Tembok Pengepung naik dari dasar laut. Bateri meriam siap siaga.', 'bad', 5000); shake = .4;
    if(AU.ctx) for(let k = 0; k < 6; k++){ tone(520, {t:k * .9, a:.05, d:.8, v:.12, glide:780, type:'sawtooth', filt:1800}); noiseHit({t:k * .9, d:1.2, v:.1, f:700, brown:true}); } }
  else toast('Pertahanan diturunkan. Teluk dibuka semula.', 'ok');
  pushPresence(true);
}
anims.push((t, dt) => {
  if(DEF.on && performance.now() > DEF.until) setDefense(false);
  DEF.k = lerp(DEF.k, DEF.on ? 1 : 0, 1 - Math.exp(-dt * .35));
  encWalls.forEach(g => { const k = clamp(DEF.k * 1.4 - g.userData.d, 0, 1); g.position.y = lerp(-40, -1, k); });
  if(DEF.on && DEF.k > .5 && t > DEF.next){ fireCannon(); DEF.next = t + .35 + Math.random() * .5; }
  fxPool.forEach(f => { if(f.t > 3) return; f.t += dt; f.fl.scale.setScalar(1 + f.t * 6); f.fl.material.opacity = Math.max(0, .9 - f.t * 4);
    const st = Math.max(0, f.t - .9); f.sp.scale.set(1 + st, Math.min(st * 40, 22) + .01, 1 + st); f.sp.position.y = -1.6 + f.sp.scale.y / 2; f.sp.material.opacity = Math.max(0, .85 - st * .5);
    if(f.t > 3){ f.fl.position.y = f.sp.position.y = -50; } });
  if(BASE.bellMesh) BASE.bellMesh.rotation.z = DEF.on ? Math.sin(t * 9) * .35 * (1 - DEF.k * .6) : 0;
});

/* --- Gerbang Keadilan on the Tarai current --- */
const JG = {open:0};
{
  const lane = Math.atan2(BASE.z - BASE.gate.z, BASE.x - BASE.gate.x);      // direction of travel into the base
  JG.ux = Math.cos(lane); JG.uz = Math.sin(lane); JG.px = -JG.uz; JG.pz = JG.ux;
  const g = grp(BASE.gate.x, 0, BASE.gate.z); g.rotation.y = faceRot(lane); const iron = M(0x2a2e36, {metalness:.75, roughness:.35}), gold = M(0xd8a93a, {metalness:.7, roughness:.3});
  [-1, 1].forEach(s => { mesh(new THREE.CylinderGeometry(14, 18, 10, 10), M(0x5a5450, {roughness:1}), s * 42, -3, 0, g);
    mesh(new THREE.BoxGeometry(14, 86, 14), iron, s * 42, 43, 0, g); [20, 50, 80].forEach(y => mesh(new THREE.BoxGeometry(14.4, 1.4, 14.4), gold, s * 42, y, 0, g, false));
    mesh(new THREE.ConeGeometry(10.5, 12, 4), iron, s * 42, 92, 0, g).rotation.y = Math.PI / 4; });
  mesh(new THREE.BoxGeometry(98, 8, 10), iron, 0, 82, 0, g);
  const c = document.createElement('canvas'); c.width = 1024; c.height = 128; const x2 = c.getContext('2d'); x2.fillStyle = '#1b1f27'; x2.fillRect(0, 0, 1024, 128); x2.fillStyle = '#d8a93a'; x2.font = '700 72px Unbounded, EB Garamond, Georgia, serif'; x2.textAlign = 'center'; x2.textBaseline = 'middle'; x2.fillText('GERBANG KEADILAN', 512, 66);
  [-1, 1].forEach(s => { const sg = mesh(new THREE.PlaneGeometry(64, 8), new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c)}), 0, 82, s * 5.05, g, false); if(s < 0) sg.rotation.y = Math.PI; });
  JG.leaves = [-1, 1].map(s => { const h = grp(s * 35, 0, 0, g); const leaf = mesh(new THREE.BoxGeometry(35, 74, 2.4), iron, -s * 17.5, 36, 0, h);
    for(let k = 0; k < 5; k++) mesh(new THREE.BoxGeometry(35.2, .8, 2.6), gold, -s * 17.5, 8 + k * 15, 0, h, false); h.userData.s = s; return h; });
  info(g, 'Gerbang Keadilan', 'Pintu gerbang besi gergasi di atas Arus Tarai, laluan masuk utama ke Pangkalan Laut. Terbuka hanya untuk kapal yang membawa pas Pangkalan Laut.');
}
function justiceGateBlocks(x, z){
  const dx = x - BASE.gate.x, dz = z - BASE.gate.z, along = dx * JG.ux + dz * JG.uz, across = dx * JG.px + dz * JG.pz;
  if(Math.abs(along) < 10 && Math.abs(across) > 33 && Math.abs(across) < 52) return true;
  if(JG.open < .8 && Math.abs(along) < 3 && Math.abs(across) < 35) return true;
  if(DEF.k > .5){ const r = Math.hypot(x - BASE.x, z - BASE.z); if(Math.abs(r - (BASE.rIn - 6)) < 3) return true; }
  return false;
}
anims.push((t, dt) => {
  const shipNear = ride && ride.kind === 'kapal' && canLaut() && Math.hypot(ride.x - BASE.gate.x, ride.z - BASE.gate.z) < 260;
  const peerNear = [...peers.values()].some(a => a.vk === 'kapal' && Math.hypot(a.x - BASE.gate.x, a.z - BASE.gate.z) < 260);
  const want = (shipNear || peerNear) && !DEF.on ? 1 : 0, was = JG.open;
  JG.open = lerp(JG.open, want, 1 - Math.exp(-dt * .9));
  if(was < .05 && want && AU.ctx && shipNear) { noiseHit({d:3, v:.3, f:120, brown:true}); toast('Gerbang Keadilan mengenali pas kau dan mula terbuka.', 'ok'); }
  JG.leaves.forEach(h => { h.rotation.y = h.userData.s * JG.open * 1.4; });
});

/* --- the Tarai current: a flowing lane of light on the sea --- */
{
  const pts = TARAI.map(([x, z]) => new THREE.Vector3(x, 0, z)), curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal'), N = 220, L = curve.getLength();
  const pos = [], uv = [], idx = [];
  for(let i = 0; i <= N; i++){ const t = i / N, p = curve.getPoint(t), d = curve.getTangent(t); const nx = -d.z, nz = d.x;
    pos.push(p.x + nx * 7, -1.05, p.z + nz * 7, p.x - nx * 7, -1.05, p.z - nz * 7); uv.push(0, t * L / 14, 1, t * L / 14);
    if(i < N){ const k = i * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); } }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geo.setIndex(idx);
  const u = {uT:{value:0}};
  const mat = new THREE.ShaderMaterial({uniforms:u, transparent:true, depthWrite:false, blending:THREE.AdditiveBlending, side:THREE.DoubleSide,
    vertexShader:'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader:`uniform float uT; varying vec2 vUv;
      void main(){ float edge = smoothstep(0.0, .25, vUv.x) * smoothstep(1.0, .75, vUv.x);
        float chev = fract(vUv.y - abs(vUv.x - .5) * .8 - uT * .9); float a = smoothstep(.0, .12, chev) * smoothstep(.45, .12, chev);
        gl_FragColor = vec4(vec3(.55, .9, 1.0) * (a * .55 + .12) * edge, 1.0); }`});
  const lane = new THREE.Mesh(geo, mat); lane.frustumCulled = false; S.add(lane);
  anims.push(t => { u.uT.value = t; });
  info(lane, 'Arus Tarai', 'Arus laut laju dari jeti Teras melalui Gerbang Keadilan terus ke Teluk Pengepung. Kapal menunggangnya dalam beberapa saat.');
}
// quay and steps at the naval dock
{
  const g = grp(BASE.dock.x, 0, BASE.dock.z); g.rotation.y = faceRot(BASE.back);
  mesh(new THREE.BoxGeometry(18, BASE.top + 3, 10), M(0x9aa0a8), 0, (BASE.top + 3) / 2 - 3, 7, g);
  for(let k = 0; k < 9; k++) mesh(new THREE.BoxGeometry(18, 1.2, 1.2), M(0xb6bac2), 0, BASE.top - .6 - k * 1.2, 1.4 - k * 1.1, g, false);
  [-8, 8].forEach(x => mesh(new THREE.CylinderGeometry(.5, .6, 2, 8), steelMat, x, BASE.top + .4, 3, g, false));
}

/* --- docks along the crescent arms: warehouses and quay cranes --- */
{
  const roofM = M(0x5a6a7a, {metalness:.4, roughness:.5}), wallM = M(0xc9c6bc), crane = M(0xd8a93a, {metalness:.5, roughness:.4});
  [-1, 1].forEach(side => { for(let k = 0; k < 5; k++){ const a = BASE.back + side * (.75 + k * .2), r = BASE.rIn + 22;
    const w = grp(bx(a, r), BASE.top, bz(a, r)); w.rotation.y = faceRot(a);
    mesh(new THREE.BoxGeometry(22, 8, 14), wallM, 0, 4, 0, w); const rf = mesh(new THREE.CylinderGeometry(7.4, 7.4, 22, 16, 1, false, 0, Math.PI), roofM, 0, 8, 0, w); rf.rotation.z = Math.PI / 2;
    mesh(new THREE.BoxGeometry(8, 6, .2), M(0x3a404c), 0, 3, -7.1, w, false);
    for(let q = -1; q <= 1; q += 2) collide(bx(a + q * 7 / r, r), bz(a + q * 7 / r, r), 7.5); STRUCTS.push({x:bx(a, r), z:bz(a, r), w:18, d:18, h:12, y:BASE.top, layer:0, name:'Gudang Pangkalan'});
    if(k % 2 === 0){ const c = grp(bx(a + .05, BASE.rIn + 5), BASE.top, bz(a + .05, BASE.rIn + 5)); c.rotation.y = faceRot(a);
      [[-3, -3], [3, -3], [-3, 3], [3, 3]].forEach(([x, z]) => mesh(new THREE.BoxGeometry(.8, 22, .8), crane, x, 11, z, c));
      mesh(new THREE.BoxGeometry(7.6, 2, 7.6), crane, 0, 22, 0, c); mesh(new THREE.BoxGeometry(2, 1.6, 34), crane, 0, 24, -10, c); mesh(new THREE.BoxGeometry(2.4, 2, 2.4), M(0x3a404c), 0, 22.4, -22, c, false);
      collide(bx(a + .05, BASE.rIn + 5), bz(a + .05, BASE.rIn + 5), 4.5); } } });
  // brick parapet round the outer rim
  const n = 220, half = BASE.open / R2D_; for(let i = 0; i < n; i++){ const a = BASE.face + half + (i + .5) / n * (Math.PI * 2 - 2 * half); if(i % 3 === 2) continue;
    const pp = mesh(new THREE.BoxGeometry(2.2, 1.6, 1), M(0x8a4e3a), bx(a, BASE.rOut - .6), BASE.top + .8, bz(a, BASE.rOut - .6), S, false); pp.rotation.y = faceRot(a); }
}

/* --- the fleet: ships at anchor in the bay and two on patrol --- */
const fleet = [];
function makeShip(){ const g = new THREE.Group(); g.add(procVehicle('kapal')); g.scale.setScalar(1.6); S.add(g); return g; }
[[BASE.back + .45, 110], [BASE.back - .45, 110], [BASE.back + .2, 70], [BASE.back - .25, 60]].forEach(([a, r], i) => { const g = makeShip(); g.position.set(bx(a, r), -1, bz(a, r)); g.rotation.y = faceRot(BASE.face) + (i % 2 ? .3 : -.3); fleet.push({g, moor:true, ph:i});
  info(g, 'Kapal Perang Armada', 'Kapal perang Armada Erythmind berlabuh di Teluk Pengepung, bersedia keluar melalui Gerbang Keadilan.'); });
[0, Math.PI].forEach((a0, i) => { const g = makeShip(); fleet.push({g, moor:false, a:a0, ph:i}); info(g, 'Kapal Peronda', 'Kapal peronda mengelilingi pulau bulan sabit siang dan malam.'); });
anims.push((t, dt) => fleet.forEach(f => {
  if(f.moor){ f.g.position.y = -1 + Math.sin(t * .9 + f.ph) * .3; f.g.rotation.z = Math.sin(t * .7 + f.ph) * .02; return; }
  f.a += dt * .018; const r = BASE.rOut + 130; f.g.position.set(bx(f.a, r), -1 + Math.sin(t + f.ph) * .3, bz(f.a, r)); f.g.rotation.y = faceRot(f.a + Math.PI / 2);
}));

/* --- interactables, labels, expedition pins --- */
interactables.push({id:'loceng', name:'Bunyikan Loceng Amaran', layer:0, at:[BASE.bellAt[0], BASE.bellAt[1]], r:5, color:'#ff4f45', act:() => { if(!canLaut()){ denyAccess('Pas kau tidak termasuk Pangkalan Laut.', 'Pangkalan Laut'); return; } setDefense(!DEF.on); }});
fixedLabel('Markas Tentera Laut<small>海軍 · ibu pejabat</small>', BASE.hq.x, BASE.top + 72, BASE.hq.z, '#7fb2ff', 260);
fixedLabel('Menara Isytihar<small>Oris Plaza</small>', BASE.plaza.x, BASE.top + 42, BASE.plaza.z, '#e9edf6', 160);
fixedLabel('Loceng Amaran<small>Aktifkan pertahanan</small>', BASE.bellAt[0], BASE.top + 11, BASE.bellAt[1], '#ff4f45', 70);
fixedLabel('Gerbang Keadilan<small>Arus Tarai</small>', BASE.gate.x, 104, BASE.gate.z, '#d8a93a', 420);
fixedLabel('Jeti Arus Tarai<small>Kapal ke Pangkalan Laut</small>', PIER_END.x, 5, PIER_END.z, '#7fb2ff', 70);
EXPED.push(
  {id:'pangkalan', name:'Pangkalan Laut Erythmind', sub:'Pulau bulan sabit · Oris Plaza · Gerbang Keadilan', x:94, y:46, layer:0, to:[bx(BASE.back, 172), bz(BASE.back, 172)]},
  {id:'pelabuhan', name:'Pelabuhan Teras', sub:'Jeti Arus Tarai', x:20, y:60, layer:0, to:[PIER_LAND.x, PIER_LAND.z]},
);
