'use strict';
/* ================= Haki: Eryth Sayf's powers (inspired by Shanks' Divine Departure) ================= */
const HAKI = {obs:0, arm:0, supreme:0, vision:0, busy:0, cd:{kamusari:0, raja:0, obs:0, arm:0}, clips:{}, swordShow:0};
const POWERS = [
  {id:'kamusari', name:'Kamusari', sub:'Tebasan Dewa', key:'1', cd:6},
  {id:'raja', name:'Haki Raja Agung', sub:'Seluruh dunia · badan bersalut Haki 10s', key:'2', cd:20},
  {id:'obs', name:'Haki Pemerhatian', sub:'Lihat masa depan · 12s', key:'3', cd:20},
  {id:'arm', name:'Haki Persenjataan', sub:'Salutan besi · 15s', key:'4', cd:25},
];
const SPECIAL_POWERS = {};
const GUEST_ONLY = [];                                     // powers meant for a particular guest (the owner does not carry them)                                 // extra powers registered by later files: {check?, use, remote?}
const BASIC_POWERS = ['obs', 'arm'];                      // every visitor gets Observation and Armament Haki
const EXTRA_POWERS = ['kamusari', 'raja'];                 // granted per guest pass by the owner
function allowedPowers(){
  if(!session) return [];
  if(session.role === 'owner') return POWERS.map(p => p.id).filter(id => !GUEST_ONLY.includes(id));
  const extra = (session.powers || []).filter(id => EXTRA_POWERS.includes(id));
  return POWERS.map(p => p.id).filter(id => BASIC_POWERS.includes(id) || extra.includes(id));
}
const RED = 0xff2a2a, DARKRED = 0x5a0008, PURPLE = 0x8a2aff, GOLD = 0xffd23a;

/* --- body tints: white transformation or the Haki coat; the Haki coat wins while both run --- */
const TINTS = {white:{color:0xf6f6f2, emissive:0xffffff, ei:[.45, .18]}, haki:{color:0x150a1e, emissive:0x4a1070, ei:[.6, .55], metal:.7, rough:.16}};
function tintPerson(root, kind){
  root.traverse(o => {
    if(!o.isMesh) return; let p = o; while(p){ if(p.userData.marker || p === sword || p.userData.gearFx || p.userData.noTint) return; p = p.parent; }
    if(!kind){ if(o.userData.tintOrig){ o.material = o.userData.tintOrig; delete o.userData.tintOrig; delete o.userData.tintKind; } return; }
    if(o.userData.tintKind === kind) return;
    const base = o.userData.tintOrig || o.material, T = TINTS[kind]; o.userData.tintOrig = base; o.userData.tintKind = kind;
    const m = (Array.isArray(base) ? base[0] : base).clone(); if(m.color) m.color.setHex(T.color);
    if('emissive' in m){ m.emissive = new THREE.Color(T.emissive); m.emissiveIntensity = m.map ? T.ei[0] : T.ei[1]; }
    if('metalness' in m && T.metal != null){ m.metalness = T.metal; m.roughness = T.rough; }
    o.material = m;
  });
}
const tintOf = s => s.supreme > 0 ? 'haki' : s.gear > 0 ? 'white' : null;
function refreshMeTint(){ tintPerson(me.g, tintOf(HAKI)); }
// Haki Raja Agung: the whole world turns dark purple and gold for a while, for everyone in the room
const WORLD_FX = {k:0, until:0};
const AGUNG_HOOKS = [];                                    // other systems react to Haki Raja Agung: fn(origin, isMine, byOwner)
const POWER_HOOKS = [];                                    // any power used nearby: fn(id, origin, isMine, byOwner, layer)
function worldHaki(secs){ WORLD_FX.until = performance.now() + secs * 1000; }
function agungBurst(o){
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1, .5, 8, 120), new THREE.MeshBasicMaterial({color:PURPLE, transparent:true, opacity:.9, blending:THREE.AdditiveBlending, depthWrite:false}));
  ring.rotation.x = Math.PI / 2; ring.position.copy(o).add(new THREE.Vector3(0, 1, 0)); addFx(ring, 2.2, (m, k) => { const s = 1 + k * 520; m.scale.set(s, s, 1 + k * 10); m.material.opacity = .9 * (1 - k); });
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(1, .3, 8, 120), new THREE.MeshBasicMaterial({color:GOLD, transparent:true, opacity:.8, blending:THREE.AdditiveBlending, depthWrite:false}));
  ring2.rotation.x = Math.PI / 2; ring2.position.copy(o).add(new THREE.Vector3(0, 3, 0)); addFx(ring2, 1.6, (m, k) => { const s = 1 + k * 300; m.scale.set(s, s, 1); m.material.opacity = .8 * (1 - k); });
  const dome = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16), new THREE.MeshBasicMaterial({color:0x2a0a40, transparent:true, opacity:.4, side:THREE.DoubleSide, depthWrite:false}));
  dome.position.copy(o); addFx(dome, 1.8, (m, k) => { m.scale.setScalar(1 + k * 380); m.material.opacity = .4 * (1 - k); });
  for(let i = 0; i < 40; i++){ const a = o.clone().add(new THREE.Vector3(0, 2, 0)), d = new THREE.Vector3(Math.random() - .5, Math.random() * .9 - .1, Math.random() - .5).normalize(); bolt(a, a.clone().addScaledVector(d, 30 + Math.random() * 60), Math.random() < .55 ? PURPLE : GOLD, 9, .18 + Math.random() * .2); }
}

/* --- sword --- */
const sword = new THREE.Group(); sword.visible = false;
const swordProc = new THREE.Group(); sword.add(swordProc);
const bladeMat = new THREE.MeshStandardMaterial({color:0xdfe6ee, metalness:.9, roughness:.18, emissive:0x000000});
for(let i = 0; i < 5; i++){ const b = mesh(new THREE.BoxGeometry(.06, .34, .012 + .002), bladeMat, 0, .3 + i * .3, Math.pow(i / 4, 2) * .06, swordProc, false); b.rotation.x = -i * .03; }
mesh(new THREE.BoxGeometry(.26, .05, .08), gold, 0, .12, 0, swordProc, false);
mesh(new THREE.CylinderGeometry(.025, .025, .26, 6), M(0x15171f), 0, -.03, 0, swordProc, false);
const swordGlow = mesh(new THREE.BoxGeometry(.12, 1.55, .05), holoMat(RED, 0), 0, .9, .02, sword, false);
let swordAttached = null;
function attachSword(){
  let parent = null;
  if(me.av){ me.av.holder.traverse(o => { if(!parent && o.isBone && /right.?hand$/i.test(o.name)) parent = o; }); }
  if(!parent) parent = me.arms[1].children[1] || me.arms[1];
  if(swordAttached === parent) return;
  parent.add(sword); swordAttached = parent;
  parent.updateMatrixWorld(true); const ws = new THREE.Vector3(); parent.getWorldScale(ws);
  const k = 1 / Math.max(ws.y, 1e-4);              // one sword unit = one world unit, whatever the bone's scale
  sword.scale.setScalar(k); sword.position.set(0, me.av ? .04 * k : 0, 0);
  sword.rotation.set(0, 0, me.av ? 0 : Math.PI);
}
function swordStyle(armament){
  bladeMat.color.setHex(armament ? 0x0b0b10 : 0xdfe6ee); bladeMat.emissive.setHex(armament ? 0x3a0006 : 0x000000);
  sword.traverse(o => { if(o.isMesh && o.userData.base){ o.material.color.copy(o.userData.base).multiplyScalar(armament ? .12 : 1); o.material.emissive?.setHex(armament ? 0x2a0004 : 0x000000); } });
}
function setSwordModel(gltf){
  // find the guard (widest slice along the long axis); the handle is the short side of it, the blade the long side
  const canon = canonical(gltf.scene, 1, {alignLong:true});
  const box = new THREE.Box3(); canon.geos.forEach(({g}) => box.union(g.boundingBox));
  const zmin = box.min.z, zmax = box.max.z, cy = (box.min.y + box.max.y) / 2, BINS = 48, width = new Array(BINS).fill(0);
  canon.geos.forEach(({g}) => { const p = g.attributes.position; for(let i = 0; i < p.count; i++){ const z = p.getZ(i), k = Math.min(BINS - 1, Math.floor((z - zmin) / (zmax - zmin) * BINS)); width[k] = Math.max(width[k], Math.abs(p.getX(i)), Math.abs(p.getY(i) - cy)); } });
  const inner = width.map((w, k) => (k < 3 || k > BINS - 4) ? 0 : w);          // ignore the very ends (tassel/tip)
  const kg = inner.indexOf(Math.max(...inner)), zg = zmin + (kg + .5) / BINS * (zmax - zmin);
  const pommel = (zg - zmin) < (zmax - zg) ? zmin : zmax, bladeSign = pommel === zmin ? 1 : -1;
  const zGrip = zg + (pommel - zg) * .35;
  const model = buildFrom(canon, m => { const c = m.clone(); c.metalness = .7; c.roughness = .25; return c; });
  model.traverse(o => { if(o.isMesh) o.userData.base = o.material.color.clone(); });
  model.position.set(0, -cy, -zGrip);
  const pivot = new THREE.Group(); pivot.add(model);
  pivot.rotation.x = bladeSign > 0 ? -Math.PI / 2 : Math.PI / 2;               // blade (away from the guard) points along the hand's +Y
  pivot.scale.setScalar(1.75 / (zmax - zmin));
  swordProc.visible = false; sword.add(pivot);
}

/* --- effects --- */
const fxList = [];
function addFx(obj, life, update){ scene.add(obj); fxList.push({obj, life, t:0, update}); return obj; }
function bolt(a, b, color = RED, jag = 1.2, life = .12, width = 1){
  const n = 10, pts = [];
  for(let i = 0; i <= n; i++){ const k = i / n, p = a.clone().lerp(b, k); if(i && i < n){ p.x += (Math.random() - .5) * jag; p.y += (Math.random() - .5) * jag; p.z += (Math.random() - .5) * jag; } pts.push(p); }
  const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({color, transparent:true, opacity:1, blending:color === 0x000000 ? THREE.NormalBlending : THREE.AdditiveBlending}));
  addFx(line, life, (o, k) => { o.material.opacity = 1 - k; });
}
function boltBurst(center, radius, count, colorMix = .7){
  for(let i = 0; i < count; i++){
    const a = center.clone(), dir = new THREE.Vector3(Math.random() - .5, Math.random() * .8 - .2, Math.random() - .5).normalize();
    bolt(a, a.clone().addScaledVector(dir, radius * (.4 + Math.random() * .6)), Math.random() < colorMix ? RED : 0x1a0004, radius * .12, .1 + Math.random() * .12);
  }
}
const _v1 = new THREE.Vector3(), _v2 = new THREE.Vector3();
function worldOfPlayer(){ return new THREE.Vector3(player.x, layerBase(player.layer) + player.y, player.z); }
function forward(){ return new THREE.Vector3(Math.sin(player.ry), 0, Math.cos(player.ry)); }
function crescent(){
  const sh = new THREE.Shape(); sh.absarc(0, 0, 1, Math.PI * .1, Math.PI * .9, false); sh.absarc(0, -.35, .82, Math.PI * .86, Math.PI * .14, true);
  return new THREE.ShapeGeometry(sh, 24);
}
function kamusariWave(origin, dir, power = 1){
  const g = new THREE.Group(); g.position.copy(origin).add(new THREE.Vector3(0, 2, 0)); g.lookAt(origin.clone().add(dir).add(new THREE.Vector3(0, 2, 0)));
  const geo = crescent();
  const outer = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({color:RED, transparent:true, opacity:.9, side:THREE.DoubleSide, blending:THREE.AdditiveBlending, depthWrite:false}));
  const inner = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({color:0x050002, transparent:true, opacity:.85, side:THREE.DoubleSide, depthWrite:false}));
  inner.scale.setScalar(.82); inner.position.z = .05; outer.scale.set(3, 3, 1); inner.scale.set(2.5, 2.5, 1);
  [outer, inner].forEach(m => { m.rotation.z = Math.PI; g.add(m); });
  const speed = 170 * power;
  addFx(g, 1.1, (o, k, dt) => {
    o.position.addScaledVector(dir, speed * dt); const s = 1 + k * 4.5; o.scale.set(s, s, 1);
    outer.material.opacity = .9 * (1 - k); inner.material.opacity = .85 * (1 - k * k);
    if(Math.random() < .9){ _v1.copy(o.position).add(new THREE.Vector3((Math.random() - .5) * 6 * s, (Math.random() - .2) * 3 * s, 0)); bolt(_v1, _v1.clone().add(new THREE.Vector3((Math.random() - .5) * 10, (Math.random() - .5) * 8, (Math.random() - .5) * 10)), Math.random() < .7 ? RED : 0x200005, 2.5, .1); }
  });
  // ground scar
  const len = 150 * power, scar = new THREE.Mesh(new THREE.PlaneGeometry(1.6, len), new THREE.MeshBasicMaterial({color:RED, transparent:true, opacity:.9, blending:THREE.AdditiveBlending, depthWrite:false}));
  scar.rotation.x = -Math.PI / 2; scar.rotation.z = -Math.atan2(dir.x, dir.z);
  scar.position.copy(origin).addScaledVector(dir, len / 2); scar.position.y = origin.y + .15;
  addFx(scar, 6, (o, k) => { o.material.opacity = .9 * (1 - k); });
}
function shockwave(origin, radius){
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1, .35, 8, 80), new THREE.MeshBasicMaterial({color:RED, transparent:true, opacity:.9, blending:THREE.AdditiveBlending, depthWrite:false}));
  ring.rotation.x = Math.PI / 2; ring.position.copy(origin).add(new THREE.Vector3(0, 1, 0));
  addFx(ring, 1.2, (o, k) => { const s = 1 + k * radius; o.scale.set(s, s, 1 + k * 6); o.material.opacity = .9 * (1 - k); });
  const shell = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16), new THREE.MeshBasicMaterial({color:DARKRED, transparent:true, opacity:.35, side:THREE.DoubleSide, depthWrite:false}));
  shell.position.copy(origin);
  addFx(shell, 1, (o, k) => { o.scale.setScalar(1 + k * radius * .8); o.material.opacity = .35 * (1 - k); });
}
function screenFx(kind, ms){
  const f = $('#hakiFx'); f.className = kind; f.style.opacity = 1;
  clearTimeout(screenFx.t); screenFx.t = setTimeout(() => { f.style.opacity = 0; }, ms);
}
anims.push((t, dt) => {
  for(let i = fxList.length - 1; i >= 0; i--){ const f = fxList[i]; f.t += dt; const k = Math.min(1, f.t / f.life); f.update && f.update(f.obj, k, dt); if(k >= 1){ scene.remove(f.obj); f.obj.traverse?.(o => { o.geometry?.dispose(); }); fxList.splice(i, 1); } }
});

/* --- sounds --- */
const hakiSfx = {
  charge(){ tone(80, {type:'sawtooth', a:.6, d:.4, v:.12, filt:600, glide:220}); for(let i = 0; i < 8; i++) noiseHit({t:i * .07, d:.04, v:.12, f:4000, type:'highpass'}); },
  strike(){ tone(42, {d:1.8, v:.6, glide:26}); noiseHit({d:1.6, v:.5, f:240, brown:true}); noiseHit({d:.25, v:.35, f:6000, type:'highpass'}); for(let i = 0; i < 12; i++) noiseHit({t:.05 + i * .05, d:.03, v:.15, f:3500, type:'highpass'}); },
  agung(){ tone(41, {type:'sawtooth', a:.05, d:3.2, v:.36, filt:260, glide:28}); tone(82, {type:'square', t:.1, d:2.4, v:.08, filt:500, glide:60}); noiseHit({d:3, v:.5, f:130, brown:true}); [880, 1175, 1568].forEach((f, i) => tone(f, {t:.2 + i * .12, d:1.6, v:.04})); for(let i = 0; i < 26; i++) noiseHit({t:i * .07, d:.03, v:.13, f:3200, type:'highpass'}); },
  raja(){ tone(55, {type:'sawtooth', a:.05, d:2.2, v:.3, filt:300, glide:38}); noiseHit({d:2, v:.4, f:160, brown:true}); for(let i = 0; i < 16; i++) noiseHit({t:i * .06, d:.03, v:.12, f:3000, type:'highpass'}); },
  obs(){ [880, 1320, 1760].forEach((f, i) => tone(f, {t:i * .08, a:.02, d:1.2, v:.04, dest:'sfx'})); },
  arm(){ tone(220, {type:'square', d:.25, v:.08, filt:1800}); tone(660, {t:.05, d:.5, v:.05}); noiseHit({d:.2, v:.15, f:2500, type:'bandpass'}); },
};

/* --- beasts under Haki --- */
function defeat(b, dir, power = 1){
  b.ko = 22 + Math.random() * 8; b.roared = false;
  b.fly = {vx:dir.x * 26 * power, vz:dir.z * 26 * power, vy:(b.kind === 'mamot' ? 14 : 26) * power, y:nivH(b.x, b.z)};
  sfx.roar(b.kind);
}
function hakiBeast(b, dt){
  if(b.fly){
    const f = b.fly; f.vy -= 60 * dt; b.x += f.vx * dt; b.z += f.vz * dt; f.y += f.vy * dt;
    if(Math.hypot(b.x - CAVE.x, b.z - CAVE.z) > 185){ const k = 184 / Math.hypot(b.x - CAVE.x, b.z - CAVE.z); b.x = CAVE.x + (b.x - CAVE.x) * k; b.z = CAVE.z + (b.z - CAVE.z) * k; f.vx = f.vz = 0; }
    const gy = nivH(b.x, b.z); b.g.rotation.x += dt * 5;
    if(f.y <= gy && f.vy < 0){ f.y = gy; b.fly = null; b.g.rotation.x = 0; sfx.thud(); }
    b.g.position.set(b.x, f.y, b.z); return true;
  }
  if(b.ko > 0){
    b.ko -= dt; b.g.rotation.z = lerp(b.g.rotation.z, Math.PI / 2, .1); b.g.position.set(b.x, nivH(b.x, b.z) + (b.kind === 'mamot' ? 3 : 1), b.z);
    if(b.ko <= 0){ b.g.rotation.z = 0; b.cool = 3; b.tx = b.cx; b.tz = b.cz; }
    return true;
  }
  return false;
}
function hakiContact(b){
  const dir = new THREE.Vector3(b.x - player.x, 0, b.z - player.z).normalize();
  if(HAKI.arm > 0){ defeat(b, dir, .8); flash('rgba(20,0,0,.6)'); shake = .4; hakiSfx.arm(); toast('Haki Persenjataan menangkis serbuan!', 'ok', 2200); return true; }
  if(HAKI.obs > 0){ const side = new THREE.Vector3(-dir.z, 0, dir.x).multiplyScalar(Math.random() < .5 ? 9 : -9);
    const nx = player.x + side.x, nz = player.z + side.z; if(nivWalkable(nx, nz)){ player.x = nx; player.z = nz; } b.cool = 2.5; hakiSfx.obs(); toast('Haki Pemerhatian: nampak masa depan, serbuan dielak.', 'ok', 2200); return true; }
  return false;
}

/* --- powers --- */
// impact moments measured from the clips' arm angular speed (end of the fastest swing)
const CLIP_TIMING = {judgment:{hit:1.3, end:2.0}, shout:{hit:1.3, end:2.1}};
function playClip(name){
  HAKI.playing = null;
  const a = me.av, clip = HAKI.clips[name]; if(!a || !clip) return 0;
  const end = Math.min(clip.duration, CLIP_TIMING[name].end);
  const act = a.mixer.clipAction(clip); act.reset(); act.setLoop(THREE.LoopOnce, 1); act.clampWhenFinished = true; act.timeScale = 1; act.play();
  if(a.action) a.action.weight = 0;
  HAKI.playing = {act, end, a};
  return end;
}
function canUse(id){
  if(!session || ride) return false;
  if(!allowedPowers().includes(id)){ toast('Kuasa ini belum dianugerahkan oleh pemilik Erythmind.', 'bad'); return false; }
  if(HAKI.cd[id] > 0){ toast(`${POWERS.find(p => p.id === id).name} sedang dicas semula (${HAKI.cd[id].toFixed(1)}s).`); return false; }
  if(HAKI.busy > 0) return false;
  if(SPECIAL_POWERS[id]?.check && !SPECIAL_POWERS[id].check()) return false;
  return true;
}
function usePower(id){
  if(!canUse(id)) return; audioStart();
  const P = POWERS.find(p => p.id === id); HAKI.cd[id] = P.cd;
  const origin = worldOfPlayer(), dir = forward();
  POWER_HOOKS.forEach(f => f(id, origin, true, isOwner(), player.layer));
  if(net.room) net.room.emit('haki', {k:id, x:+player.x.toFixed(1), z:+player.z.toFixed(1), ry:+player.ry.toFixed(2), l:player.layer}).catch(() => {});
  if(SPECIAL_POWERS[id]){ SPECIAL_POWERS[id].use(); updateHakiHud(); return; }
  if(id === 'kamusari'){
    attachSword(); HAKI.swordShow = 4; HAKI.vision = .9; screenFx('vision', 900); hakiSfx.charge();
    const dur = playClip('judgment') || 1.2; HAKI.busy = dur;
    const strikeAt = HAKI.clips.judgment && me.av ? CLIP_TIMING.judgment.hit : .45;
    onHit(strikeAt, () => {
      const o = worldOfPlayer(), d = forward();
      kamusariWave(o, d, 1); hakiSfx.strike(); flash('rgba(255,255,255,.9)'); setTimeout(() => flash('rgba(255,20,20,.6)'), 120); shake = 1.2; screenFx('strike', 700);
      let hits = 0;
      beasts.forEach(b => { if(player.layer !== 2 || b.ko > 0) return; const dx = b.x - player.x, dz = b.z - player.z, dist = Math.hypot(dx, dz); if(dist > 160) return;
        const ang = Math.acos(clamp((dx * d.x + dz * d.z) / (dist || 1), -1, 1)); if(ang < .42 || dist < b.r + 4){ defeat(b, new THREE.Vector3(dx, 0, dz).normalize(), 1.3); hits++; } });
      animals.forEach(a => { if(player.layer !== 0) return; const dx = a.x - player.x, dz = a.z - player.z, dist = Math.hypot(dx, dz); if(dist < 60){ const ang = Math.acos(clamp((dx * d.x + dz * d.z) / (dist || 1), -1, 1)); if(ang < .5){ a.faint = 6; } } });
      toast(hits ? `KAMUSARI · ${hits} binatang buas tumbang.` : 'KAMUSARI · Tebasan Dewa membelah udara.', 'ok', 2500);
      worldDamage.slash(o, d, player.layer);
    });
  }
  if(id === 'raja'){
    const dur = playClip('shout') || 1; HAKI.busy = dur;
    const burstAt = HAKI.clips.shout && me.av ? CLIP_TIMING.shout.hit : .3;
    hakiSfx.charge();
    onHit(burstAt, () => {
      const o = worldOfPlayer(); agungBurst(o); hakiSfx.agung(); shake = 1.4; screenFx('agung', 10000); flash('rgba(60,0,90,.75)'); setTimeout(() => flash('rgba(255,210,58,.45)'), 160);
      HAKI.supreme = 10; refreshMeTint(); worldHaki(10); worldDamage.ring(o, player.layer); AGUNG_HOOKS.forEach(f => f(o, true, isOwner()));
      let ko = 0, fled = 0;
      beasts.forEach(b => { if(player.layer !== 2 || b.ko > 0) return;            // the whole layer feels it, not just a radius
        if(b.kind === 'mamot'){ b.flee = 8; fled++; sfx.roar('mamot'); } else { b.ko = 24 + Math.random() * 8; ko++; } });
      animals.forEach(a => { if(player.layer === 0) a.faint = 10; });
      toast(player.layer === 2 ? `HAKI RAJA AGUNG · seluruh Nivelham tunduk: ${ko} pengsan${fled ? `, ${fled} mamot lari` : ''}.` : 'HAKI RAJA AGUNG · seluruh dunia bergegar. Badan kau bersalut Haki selama 10 saat.', 'ok', 3200);
    });
  }
  if(id === 'obs'){ HAKI.obs = 12; hakiSfx.obs(); screenFx('vision', 12000); toast('HAKI PEMERHATIAN · 12 saat. Binatang buas perlahan, serbuan akan dielak.', 'ok', 3000); }
  if(id === 'arm'){ HAKI.arm = 15; attachSword(); HAKI.swordShow = 15; swordStyle(true); hakiSfx.arm(); toast('HAKI PERSENJATAAN · 15 saat. Serbuan akan dipantulkan.', 'ok', 3000); }
  updateHakiHud();
}
// remote effects from someone else's Haki (visual only)
function remoteHaki(d, peerId){
  if(d.k === 'gergasi') return;                              // the giant's own messages (20-gergasi.js)
  const a = peers.get(peerId); if(a){ if(d.k === 'arm') a.hakiArm = 15; if(d.k === 'obs') a.hakiObs = 12; }
  const o = new THREE.Vector3(d.x, layerBase(d.l) + groundAt(d.x, d.z, d.l), d.z), dir = new THREE.Vector3(Math.sin(d.ry), 0, Math.cos(d.ry));
  POWER_HOOKS.forEach(f => f(d.k, o, false, a?.kind === 'owner', d.l));
  if(SPECIAL_POWERS[d.k]?.remote) SPECIAL_POWERS[d.k].remote(o, dir, a, d);
  if(d.k === 'kamusari') setTimeout(() => { kamusariWave(o, dir, 1); hakiSfx.strike(); shake = .6; worldDamage.slash(o, dir, d.l); }, CLIP_TIMING.judgment.hit * 1000);
  if(d.k === 'raja') setTimeout(() => { agungBurst(o); hakiSfx.agung(); shake = .9; screenFx('agung', 9000); worldHaki(10); worldDamage.ring(o, d.l); AGUNG_HOOKS.forEach(f => f(o, false, a?.kind === 'owner')); if(a){ a.supreme = 10; tintPerson(a.p.g, tintOf(a)); } }, CLIP_TIMING.shout.hit * 1000);
}
(async () => { const r = await use('room'); if(r) r.on('haki', m => { if(!m.isMe && m.data && typeof m.data === 'object') remoteHaki(m.data, m.peer); }, () => {}); })();

// fire an effect when the playing clip reaches its impact frame (falls back to elapsed time without an avatar clip)
function onHit(at, fn){ HAKI.pendingHit = {at, fn, t:0, act:HAKI.playing?.act || null}; }
anims.push((t, dt) => {
  const h = HAKI.pendingHit; if(h){ h.t += dt; const clipT = h.act ? h.act.time : h.t; if(clipT >= h.at || (h.act && !h.act.isRunning() && h.t > h.at)){ HAKI.pendingHit = null; h.fn(); } }
  const p = HAKI.playing; if(p && p.act.time >= p.end - .01){ HAKI.playing = null; p.act.fadeOut(.25); setTimeout(() => p.act.stop(), 260); if(p.a.action) p.a.action.weight = 1; HAKI.busy = 0; }
});

/* --- per-frame --- */
const obsRings = beasts.map(b => { const r = mesh(new THREE.TorusGeometry(b.r * .7, .25, 6, 30), new THREE.MeshBasicMaterial({color:RED, transparent:true, opacity:.8, blending:THREE.AdditiveBlending, depthWrite:false}), 0, 0, 0, N, false); r.rotation.x = Math.PI / 2; r.visible = false; return r; });
anims.push((t, dt) => {
  for(const k in HAKI.cd) HAKI.cd[k] = Math.max(0, HAKI.cd[k] - dt);
  HAKI.busy = Math.max(0, HAKI.busy - dt); HAKI.vision = Math.max(0, HAKI.vision - dt);
  if(HAKI.obs > 0){ HAKI.obs -= dt; if(HAKI.obs <= 0){ toast('Haki Pemerhatian tamat.'); $('#hakiFx').style.opacity = 0; } }
  if(HAKI.supreme > 0){ HAKI.supreme -= dt; if(HAKI.supreme <= 0){ refreshMeTint(); toast('Salutan Haki Raja Agung pudar.'); }
    else if(Math.random() < .7){ me.g.getWorldPosition(_v2); _v2.y += 1.7; bolt(_v2, _v2.clone().add(new THREE.Vector3((Math.random() - .5) * 3, Math.random() * 2.6, (Math.random() - .5) * 3)), Math.random() < .55 ? PURPLE : GOLD, .7, .09); } }
  if(HAKI.arm > 0){ HAKI.arm -= dt; if(HAKI.arm <= 0){ swordStyle(false); toast('Haki Persenjataan tamat.'); } }
  HAKI.swordShow = Math.max(0, HAKI.swordShow - dt);
  sword.visible = HAKI.swordShow > 0 && !ride && !!session;
  if(sword.visible){ swordGlow.material.opacity = .25 + Math.sin(t * 20) * .15 + (HAKI.busy > 0 ? .35 : 0); if(Math.random() < (HAKI.busy > 0 ? .9 : .3)){ sword.getWorldPosition(_v1); bolt(_v1, _v1.clone().add(new THREE.Vector3((Math.random() - .5) * 3, Math.random() * 3, (Math.random() - .5) * 3)), Math.random() < .6 ? RED : 0x1a0004, .8, .08); } }
  if(HAKI.arm > 0 && Math.random() < .5){ me.g.getWorldPosition(_v2); _v2.y += 1.6; bolt(_v2, _v2.clone().add(new THREE.Vector3((Math.random() - .5) * 2.4, Math.random() * 2, (Math.random() - .5) * 2.4)), 0x22000a, .5, .08); }
  if(HAKI.busy > 0 && Math.random() < .6){ me.g.getWorldPosition(_v2); _v2.y += 1.5; boltBurst(_v2, 4, 1); }
  obsRings.forEach((r, i) => { const b = beasts[i]; r.visible = HAKI.obs > 0 && player.layer === 2; if(r.visible){ r.position.set(b.x, nivH(b.x, b.z) + .4, b.z); r.material.opacity = .5 + Math.sin(t * 6 + i) * .3; } });
  animals.forEach(a => { if(a.faint > 0){ a.faint -= dt; a.g.rotation.z = lerp(a.g.rotation.z, Math.PI / 2, .15); a.wait = 1; a.tx = a.x; a.tz = a.z; if(a.faint <= 0) a.g.rotation.z = 0; } });
  if(HAKI.busy > 0){ player.moving = false; }
  peers.forEach(a => {                                   // other visitors' Armament (dark lightning) and Observation (red ring)
    if(a.supreme > 0){ a.supreme -= dt; if(a.supreme <= 0) tintPerson(a.p.g, tintOf(a)); else if(Math.random() < .6){ a.p.g.getWorldPosition(_v2); _v2.y += 1.7; bolt(_v2, _v2.clone().add(new THREE.Vector3((Math.random() - .5) * 3, Math.random() * 2.6, (Math.random() - .5) * 3)), Math.random() < .55 ? PURPLE : GOLD, .7, .09); } }
    if(a.hakiArm > 0){ a.hakiArm -= dt; if(Math.random() < .5){ a.p.g.getWorldPosition(_v2); _v2.y += 1.6; bolt(_v2, _v2.clone().add(new THREE.Vector3((Math.random() - .5) * 2.4, Math.random() * 2, (Math.random() - .5) * 2.4)), Math.random() < .5 ? RED : 0x22000a, .5, .08); } }
    if(a.hakiObs > 0){ a.hakiObs -= dt; if(!a.obsRing){ a.obsRing = mesh(new THREE.TorusGeometry(1.6, .08, 6, 40), new THREE.MeshBasicMaterial({color:RED, transparent:true, blending:THREE.AdditiveBlending, depthWrite:false}), 0, .2, 0, a.p.g, false); a.obsRing.rotation.x = Math.PI / 2; }
      a.obsRing.visible = true; a.obsRing.material.opacity = .4 + Math.sin(t * 6) * .3; a.obsRing.scale.setScalar(1 + (t * .8 % 1) * .6); }
    else if(a.obsRing) a.obsRing.visible = false;
  });
  if((t * 4 | 0) !== (updateHakiHud.tick | 0)){ updateHakiHud.tick = t * 4 | 0; updateHakiHud(); }
});
function updateHakiHud(){
  const box = $('#haki'); if(!box) return; box.hidden = !session || !!ride;
  const allowed = allowedPowers(), key = allowed.join(); if(key !== box.dataset.key){ box.dataset.key = key; renderHakiButtons(allowed); }
  POWERS.forEach(P => { const b = box.querySelector(`[data-p="${P.id}"]`); if(!b) return; const cd = HAKI.cd[P.id];
    b.style.setProperty('--cd', (cd / P.cd * 360).toFixed(0) + 'deg'); b.classList.toggle('cool', cd > 0);
    b.classList.toggle('active', (P.id === 'obs' && HAKI.obs > 0) || (P.id === 'arm' && HAKI.arm > 0) || (P.id === 'gearputih' && HAKI.gear > 0)); });
}
function renderHakiButtons(allowed){
  $('#haki').innerHTML = POWERS.filter(P => allowed.includes(P.id)).map(P => `<button type="button" class="hk" data-p="${P.id}" title="${esc(P.name)} · ${esc(P.sub)} (${P.key})"><i></i><b>${P.key}</b><span>${esc(P.name)}</span></button>`).join('');
  $('#haki').querySelectorAll('.hk').forEach(b => b.addEventListener('click', () => usePower(b.dataset.p)));
}
addEventListener('keydown', e => {
  if(!session || !$('#gate').hidden || !$('#panel').hidden || !$('#map').hidden || typing()) return;
  const P = POWERS.find(p => p.key === e.key); if(P && allowedPowers().includes(P.id)){ usePower(P.id); e.preventDefault(); }
});
