'use strict';
/* ================= Duduk & baring: sit on chairs, sofas and benches; lie on beds and loungers =================
   Each seat is an interactable (E). The avatar plays a rigged sit or sleep clip; the simple body poses itself.
   Any movement key (or E again) stands you up. Others in the room see you sitting or lying. */
const SEATS = [];
function addSeat(x, z, layer, y, ry, kind, name){ const s = {x, z, layer, y, ry, kind, name}; SEATS.push(s);
  interactables.push({id:'seat' + SEATS.length, name:(kind === 'lie' ? 'Baring · ' : 'Duduk · ') + name, layer, at:[x, z], r:1.7, color:kind === 'lie' ? '#c9b8ff' : '#e8c27a', act:() => player.seat === s ? standUp() : sitDown(s)}); return s; }
function sitDown(s){
  if(ride || HAKI.busy > 0) return; player.seat = s; player.moving = false; player.x = s.x; player.z = s.z; player.ry = s.ry;
  me.pose = s.kind === 'lie' ? 2 : 1; sfx.click(); pushPresence(true);
  toast(s.kind === 'lie' ? `Berbaring di ${s.name}. Tekan mana-mana kekunci gerak untuk bangun.` : `Duduk di ${s.name}. Tekan mana-mana kekunci gerak untuk bangun.`, 'ok', 3000);
}
function standUp(){ const s = player.seat; if(!s) return; player.seat = null; me.pose = 0; me.g.rotation.set(0, player.ry, 0); me.g.rotation.order = 'XYZ';
  player.x = s.x + Math.sin(s.ry) * 1.6; player.z = s.z + Math.cos(s.ry) * 1.6; if(!canStand(player.x, player.z, player.layer)){ player.x = s.x; player.z = s.z; } pushPresence(true); }
// called from updatePlayer; returns true while seated
function seatTick(dt){
  const s = player.seat; if(!s) return false;
  const want = session && $('#panel').hidden && (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].some(k => keys.has(k)) || Math.hypot(joy.x, joy.y) > .3);
  if(want || player.layer !== s.layer){ standUp(); return false; }
  me.g.visible = true; const o = seatOffset(me, s); me.g.position.set(s.x + Math.sin(s.ry) * o.f, layerBase(s.layer) + s.y + o.y, s.z + Math.cos(s.ry) * o.f);
  poseGroup(me, s.ry); animatePerson(me, false, dt, 0);
  if(meMarker){ meMarker.position.y = (me.pose === 2 && !me.av ? 1.2 : 3.75) + Math.sin(performance.now() / 300) * .12; }
  lastActive = performance.now(); return true;
}
// s.y is the seat or mattress surface; the root sits below it so the hips land on it. The sit clip leans the hips back
// and the sleep clip puts the head behind the root, so the avatar is nudged forward to sit, back to reach the pillow.
function seatOffset(p, s){ return s.kind === 'lie' ? (p.av ? {y:-.2, f:-.6} : {y:.15, f:0}) : (p.av ? {y:-.95, f:.5} : {y:-.95, f:0}); }
// lying needs the simple body tipped onto its back; the avatar's sleep clip lies down by itself
function poseGroup(p, ry){ if(p.pose === 2 && !p.av){ p.g.rotation.order = 'YXZ'; p.g.rotation.set(-Math.PI / 2, ry, 0); } else { p.g.rotation.order = 'XYZ'; p.g.rotation.set(0, ry, 0); } }
function posePerson(p){
  if(p.pose === 1){ p.legs.forEach(l => l.rotation.x = lerp(l.rotation.x, -1.5, .25)); p.arms.forEach(a => a.rotation.x = lerp(a.rotation.x, -.5, .2)); p.torso.position.y = 1.62; }
  else { p.legs.forEach(l => l.rotation.x = lerp(l.rotation.x, 0, .2)); p.arms.forEach(a => a.rotation.x = lerp(a.rotation.x, 0, .2)); p.torso.position.y = 1.62 + Math.sin(performance.now() / 900) * .02; }
}

/* --- furniture and seats --- */
const velvet = M(0x6a1820, {roughness:.8, flatShading:false}), goldTrim = M(0xd8a93a, {metalness:.7, roughness:.3}), oak = M(0x5a3820, {flatShading:false}), fur = M(0xb8a088, {roughness:1});
function sofa(parent, x, z, ry){ const g = grp(x, 0, z, parent); g.rotation.y = ry;
  mesh(new THREE.BoxGeometry(5.2, .6, 1.8), velvet, 0, .75, 0, g); mesh(new THREE.BoxGeometry(5.2, 1.4, .4), velvet, 0, 1.5, -.75, g); [-1, 1].forEach(s => mesh(new THREE.BoxGeometry(.4, 1, 1.8), velvet, s * 2.6, 1.05, 0, g));
  [[-2.4, -.7], [2.4, -.7], [-2.4, .7], [2.4, .7]].forEach(([a, b]) => mesh(new THREE.CylinderGeometry(.08, .06, .45, 6), goldTrim, a, .22, b, g, false)); return g; }
function bench(parent, x, z, ry, len = 3){ const g = grp(x, 0, z, parent); g.rotation.y = ry;
  mesh(new THREE.BoxGeometry(len, .15, .8), oak, 0, .85, 0, g); mesh(new THREE.BoxGeometry(len, .7, .12), oak, 0, 1.35, -.38, g); [-1, 1].forEach(s => mesh(new THREE.BoxGeometry(.12, .85, .7), M(0x2a2a30, {metalness:.6}), s * (len / 2 - .2), .42, 0, g, false)); return g; }
function bed(parent, x, z, ry, canopy){ const g = grp(x, 0, z, parent); g.rotation.y = ry;
  mesh(new THREE.BoxGeometry(2.6, .6, 4.6), oak, 0, .3, 0, g); mesh(new THREE.BoxGeometry(2.4, .35, 4.3), M(0xf1ece2, {flatShading:false}), 0, .78, 0, g); mesh(new THREE.BoxGeometry(2.3, .2, 2.2), velvet, 0, .98, .9, g, false);
  mesh(new THREE.BoxGeometry(1.8, .25, .7), M(0xffffff), 0, 1.02, -1.75, g, false); mesh(new THREE.BoxGeometry(2.7, 1.6, .2), oak, 0, 1.1, -2.3, g);
  if(canopy){ [[-1.25, -2.2], [1.25, -2.2], [-1.25, 2.2], [1.25, 2.2]].forEach(([a, b]) => mesh(new THREE.CylinderGeometry(.08, .08, 4.2, 6), goldTrim, a, 2.1, b, g, false)); mesh(new THREE.BoxGeometry(2.7, .1, 4.6), velvet, 0, 4.2, 0, g, false); } return g; }

// Istana Pangaea (layer 3): council chairs, gallery sofas, garden benches and a daybed
{
  const cx = PANG.x, cz = PANG.z;
  for(let i = 0; i < 10; i++){ const a = i / 10 * 6.283; addSeat(cx + Math.cos(a) * 5.6, cz - 10 + Math.sin(a) * 5.6, 3, 1.3, Math.atan2(-Math.cos(a), -Math.sin(a)), 'sit', 'Kerusi Majlis Syura'); }
  sofa(keepInner, -13, 15, Math.PI / 2); sofa(keepInner, 13, 15, -Math.PI / 2);
  [-1, 1].forEach(sd => [-1.3, 1.3].forEach(o => addSeat(cx + sd * 12.6, cz + 15 + o, 3, 1.05, -sd * Math.PI / 2, 'sit', 'Sofa Galeri')));
  bench(keepInner, 23.4, -4, Math.PI / 2); bench(keepInner, 30.6, -4, -Math.PI / 2);
  addSeat(cx + 23.6, cz - 4, 3, .93, Math.PI / 2, 'sit', 'Bangku Taman Tafakur'); addSeat(cx + 30.4, cz - 4, 3, .93, -Math.PI / 2, 'sit', 'Bangku Taman Tafakur');
  bed(keepInner, 27, 8, Math.PI, true); addSeat(cx + 27, cz + 8, 3, 1.05, Math.PI, 'lie', 'Katil Kelambu Bilik Bunga');
  [[-13, 15], [13, 15], [27, 8]].forEach(([x, z]) => collide(cx + x, cz + z, 1.6, 3));
}
// Dewan Baitul Hikmah (layer 4): the benches along the five reading tables
[-36, -16, 4, 24, 42].forEach(tz => [-1, 1].forEach(sd => [-4, -1.4, 1.4, 4].forEach(o => addSeat(LIBH.x + sd * 2.6, LIBH.z + tz + o, 4, 1.02, -sd * Math.PI / 2, 'sit', 'Bangku Meja Bacaan'))));
// Perkampungan Gua Besar (layer 2): log seats and fur beds round the bonfire
{
  const logM = M(0x5a3a22);
  for(let i = 0; i < 4; i++){ const a = i / 4 * 6.283 + .4, x = VIL.x + Math.cos(a) * 7, z = VIL.z + Math.sin(a) * 7, y = nivH(x, z);
    const l = mesh(new THREE.CylinderGeometry(.5, .55, 3, 8), logM, x, NVY + y + .5, z, scene); l.rotation.set(0, -a, Math.PI / 2); addSeat(x, z, 2, y + 1, Math.atan2(VIL.x - x, VIL.z - z), 'sit', 'Batang Kayu Unggun'); }
  for(let i = 0; i < 3; i++){ const a = i / 3 * 6.283 + 1.1, x = VIL.x + Math.cos(a) * 12, z = VIL.z + Math.sin(a) * 12, y = nivH(x, z);
    const b = mesh(new THREE.BoxGeometry(2.4, .45, 4.2), fur, x, NVY + y + .22, z, scene); b.rotation.y = Math.atan2(VIL.x - x, VIL.z - z); addSeat(x, z, 2, y + .45, Math.atan2(x - VIL.x, z - VIL.z), 'lie', 'Katil Bulu Gua'); }
}
// Pantai Memori (layer 0): sun loungers facing the sea
for(let i = 0; i < 4; i++){ const a = (72 + i * 12) / R2D_, x = Math.cos(a) * 62, z = Math.sin(a) * 62, y = surfaceH(x, z);
  const g = grp(x, y, z); g.rotation.y = Math.atan2(x, z); mesh(new THREE.BoxGeometry(1.4, .2, 3.6), M(0xf2f2ea), 0, .5, 0, g); const back = mesh(new THREE.BoxGeometry(1.4, .2, 1.4), M(0xf2f2ea), 0, .95, -1.6, g); back.rotation.x = -.6;
  [-1, 1].forEach(s => mesh(new THREE.BoxGeometry(.08, .5, 3.4), M(0x8a8f99, {metalness:.6}), s * .66, .25, 0, g, false)); mesh(new THREE.CylinderGeometry(.04, .04, 3, 6), M(0x8a8f99), 1.2, 1.5, -.6, g, false); mesh(new THREE.ConeGeometry(1.6, .6, 10, 1, true), M([0xff4f45, 0xffd27a, 0x9fc8ff, 0x9be37a][i]), 1.2, 3, -.6, g, false);
  addSeat(x, z, 0, y + .6, Math.atan2(x, z), 'lie', 'Kerusi Rehat Pantai'); }

/* --- other people's poses --- */
anims.push(() => peers.forEach(a => { a.p.pose = a.st || 0; if(a.st) poseGroup(a.p, a.ry); else if(a.p.g.rotation.order !== 'XYZ'){ a.p.g.rotation.order = 'XYZ'; a.p.g.rotation.set(0, a.ry, 0); } }));
