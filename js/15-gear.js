'use strict';
/* ================= Kuasa khas (granted per guest pass): Gear Putih + Tumbukan Gergasi Hitam =================
   Inspired by Luffy's final blow on Kaido. The deity framing ("Sun God Nika") and the Hindu-deity name of the
   punch are left out: here it is a white cloud transformation and a giant Haki-black fist. */
POWERS.push(
  {id:'gearputih', name:'Gear Putih', sub:'Transformasi awan putih · 30s', key:'5', cd:45},
  {id:'tumbuk', name:'Tumbukan Gergasi', sub:'Penumbuk hitam gergasi · perlu Gear Putih', key:'6', cd:14},
);
EXTRA_POWERS.push('gearputih', 'tumbuk'); GUEST_ONLY.push('gearputih', 'tumbuk');
Object.assign(HAKI.cd, {gearputih:0, tumbuk:0}); HAKI.gear = 0;
const GEAR = {fistModel:null, drumAt:0, camBack:null};

/* --- the white transformation on any person group (tinting lives in 10-haki.js: tintPerson) --- */
function gearFx(person){
  const g = new THREE.Group(); g.userData.gearFx = true; person.g.add(g);
  const cloud = new THREE.MeshStandardMaterial({color:0xffffff, emissive:0xffffff, emissiveIntensity:.35, roughness:1, flatShading:true});
  const ring = new THREE.Group(); ring.position.y = 2.25; g.add(ring);
  for(let i = 0; i < 12; i++){ const a = i / 12 * 6.283; const c = mesh(new THREE.IcosahedronGeometry(.24 + (i % 3) * .07, 0), cloud, Math.cos(a) * .82, (i % 2) * .08, Math.sin(a) * .82, ring, false); c.userData.ph = i; }
  const hair = []; for(let i = 0; i < 9; i++){ const a = i / 9 * 6.283; const f = mesh(new THREE.ConeGeometry(.16, .7, 6), cloud, Math.cos(a) * .3, 3.15, Math.sin(a) * .3 - .05, g, false); f.rotation.set(Math.sin(a) * .5, 0, -Math.cos(a) * .5); f.userData.ph = i; hair.push(f); }
  [-.16, .16].forEach(x => mesh(new THREE.SphereGeometry(.06, 8, 6), new THREE.MeshBasicMaterial({color:0xff2a2a}), x, 2.7, .41, g, false));
  return {g, ring, hair};
}
function gearTick(person, fx, t, moving){
  fx.ring.rotation.y = t * 1.6; fx.ring.children.forEach(c => c.scale.setScalar(1 + Math.sin(t * 5 + c.userData.ph) * .18));
  fx.hair.forEach(f => { f.scale.y = 1 + Math.sin(t * 9 + f.userData.ph * 1.7) * .35; });
  const s = moving ? Math.sin(t * 11) * .09 : Math.sin(t * 3) * .03; person.g.scale.set(1 - s * .5, 1 + s, 1 - s * .5);   // rubbery bounce
  if(Math.random() < .12){ const p = person.g.position.clone().add(new THREE.Vector3((Math.random() - .5) * 1.2, 1 + Math.random() * 2, (Math.random() - .5) * 1.2));
    const puff = new THREE.Mesh(new THREE.SphereGeometry(.22, 8, 6), new THREE.MeshBasicMaterial({color:0xffffff, transparent:true, opacity:.7, depthWrite:false})); puff.position.copy(p);
    addFx(puff, 1.4, (o, k, dt) => { o.position.y += dt * 1.6; o.scale.setScalar(1 + k * 2); o.material.opacity = .7 * (1 - k); }); }
}
// Gendang Pembebasan: the heartbeat drum rhythm while transformed
function gearDrums(t, vol){
  if(!AU.ctx || t < GEAR.drumAt) return; GEAR.drumAt = t + 1.38;
  [0, .23, .46, .92, 1.15].forEach(o => { tone(68, {t:o, a:.005, d:.22, v:.32 * vol, glide:44}); noiseHit({t:o, d:.12, v:.12 * vol, f:220, brown:true}); });
}
function startGear(person, isMe){
  if(isMe){ HAKI.gear = 30; if(!GEAR.me) GEAR.me = gearFx(me); GEAR.me.g.visible = true; refreshMeTint(); }
  flash('rgba(255,255,255,.95)'); const o = person.g.position.clone();
  for(let i = 0; i < 18; i++){ const a = i / 18 * 6.283, c = new THREE.Mesh(new THREE.IcosahedronGeometry(1.2, 1), new THREE.MeshStandardMaterial({color:0xffffff, emissive:0xffffff, emissiveIntensity:.3, transparent:true, opacity:.9, flatShading:true}));
    c.position.copy(o).add(new THREE.Vector3(0, 1.2, 0)); addFx(c, 1.6, (m, k) => { m.position.set(o.x + Math.cos(a) * k * 16, o.y + 1.2 + k * 3, o.z + Math.sin(a) * k * 16); m.scale.setScalar(1 + k * 2.5); m.material.opacity = .9 * (1 - k); }); }
  if(AU.ctx){ [523, 659, 784, 1047].forEach((f, i) => tone(f, {t:i * .09, a:.01, d:.8, v:.07})); GEAR.drumAt = 0; }
}
function endGear(){
  HAKI.gear = 0; refreshMeTint(); if(GEAR.me) GEAR.me.g.visible = false; me.g.scale.set(1, 1, 1);
  if(session) toast('Gear Putih tamat. Badan kembali seperti biasa.');
}

/* --- the giant black fist --- */
function procFist(){
  const g = new THREE.Group(), m = new THREE.MeshStandardMaterial({color:0x0b0b0e, metalness:.55, roughness:.22, emissive:0x2a0006, emissiveIntensity:.6});
  mesh(new THREE.SphereGeometry(.55, 18, 14), m, 0, 0, 0, g, false).scale.set(1, .85, .9);
  for(let i = 0; i < 4; i++){ const k = mesh(new THREE.CylinderGeometry(.15, .15, .5, 12), m, -.34 + i * .23, .14, .42, g, false); k.rotation.x = Math.PI / 2; mesh(new THREE.SphereGeometry(.16, 10, 8), m, -.34 + i * .23, .14, .66, g, false); }
  const th = mesh(new THREE.CylinderGeometry(.13, .15, .55, 10), m, .1, -.22, .48, g, false); th.rotation.z = Math.PI / 2;
  mesh(new THREE.CylinderGeometry(.38, .42, .6, 16), m, 0, 0, -.55, g, false).rotation.x = Math.PI / 2;
  return g;
}
const armMat = new THREE.MeshStandardMaterial({color:0x0b0b0e, metalness:.5, roughness:.25, emissive:0x2a0006, emissiveIntensity:.5});
function giantFist(origin, dir, layer, local){
  const fist = new THREE.Group(); fist.add(GEAR.fistModel ? GEAR.fistModel.clone() : procFist());
  const armGeo = new THREE.CylinderGeometry(1, 1, 1, 14, 1, true); armGeo.translate(0, .5, 0); const arm = new THREE.Mesh(armGeo, armMat);
  const shoulder = origin.clone().add(new THREE.Vector3(0, 2.2, 0)), side = new THREE.Vector3(dir.z, 0, -dir.x);
  const apex = shoulder.clone().addScaledVector(dir, 6).addScaledVector(side, 18).add(new THREE.Vector3(0, 72, 0));
  const tx = origin.x + dir.x * 70, tz = origin.z + dir.z * 70; let gy = groundAt(tx, tz, layer); if(!(gy > -900)) gy = origin.y - layerBase(layer);
  const target = new THREE.Vector3(tx, layerBase(layer) + gy, tz), S = 30, T = 3.6, HIT = 1.95;
  const grp_ = new THREE.Group(); grp_.add(fist, arm); let hit = false, prev = shoulder.clone();
  const focus = {p:new THREE.Vector3().copy(shoulder), k:.5};
  if(local){ camFocus = focus; GEAR.camBack = [cam.tdist, cam.pitch]; cam.tdist = Math.max(cam.tdist, 130); cam.pitch = Math.max(cam.pitch, .42); }
  if(AU.ctx){ tone(60, {type:'sawtooth', a:1.2, d:.6, v:.14, filt:500, glide:140}); for(let i = 0; i < 14; i++) noiseHit({t:i * .09, d:.05, v:.08, f:3000, type:'highpass'}); }
  addFx(grp_, T, (g, k, dt) => {
    const t = k * T; let p, s;
    if(t < 1.35){ const e = 1 - Math.pow(1 - t / 1.35, 3); p = shoulder.clone().lerp(apex, e); s = lerp(1, S, e); }
    else if(t < HIT){ const e = Math.pow((t - 1.35) / (HIT - 1.35), 2); p = apex.clone().lerp(target.clone().add(new THREE.Vector3(0, S * .45, 0)), e); s = S; }
    else if(t < HIT + .45){ p = target.clone().add(new THREE.Vector3(0, S * .45, 0)); s = S; }
    else { const e = (t - HIT - .45) / (T - HIT - .45); p = target.clone().add(new THREE.Vector3(0, S * .45, 0)).lerp(shoulder, e * e); s = lerp(S, .5, e); }
    fist.position.copy(p); fist.scale.setScalar(s); focus.p.lerp(p, .15);
    const aim = t < HIT ? (t < 1.35 ? target : p.clone().add(p.clone().sub(prev))) : target.clone().add(new THREE.Vector3(0, -50, 0)); if(p.distanceTo(aim) > .1) fist.lookAt(aim); prev.copy(p);
    const back = fist.position.clone().addScaledVector(fist.getWorldDirection(_v1), -s * .75), len = shoulder.distanceTo(back);
    arm.position.copy(shoulder); arm.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), back.clone().sub(shoulder).normalize()); arm.scale.set(Math.max(.3, s * .17), len, Math.max(.3, s * .17));
    if(Math.random() < .8){ const q = p.clone().add(new THREE.Vector3((Math.random() - .5) * s * 1.2, (Math.random() - .5) * s, (Math.random() - .5) * s * 1.2)); bolt(q, q.clone().add(new THREE.Vector3((Math.random() - .5) * s * .8, (Math.random() - .5) * s * .8, (Math.random() - .5) * s * .8)), Math.random() < .6 ? RED : 0x1a0004, s * .15, .1); }
    if(!hit && t >= HIT){ hit = true; fistImpact(target, layer, local); }
    if(k >= 1 && local && GEAR.camBack){ [cam.tdist, cam.pitch] = GEAR.camBack; GEAR.camBack = null; if(camFocus === focus) camFocus = null; }
  });
}
function fistImpact(at, layer, local){
  shockwave(at, 140); boltBurst(at.clone().add(new THREE.Vector3(0, 6, 0)), 70, 46); flash('rgba(255,255,255,.95)'); setTimeout(() => flash('rgba(20,0,0,.7)'), 140);
  shake = local ? 1.8 : 1; screenFx('raja', 1600);
  const crater = new THREE.Mesh(new THREE.RingGeometry(4, 34, 48), new THREE.MeshBasicMaterial({color:0x120406, transparent:true, opacity:.85, depthWrite:false, side:THREE.DoubleSide}));
  crater.rotation.x = -Math.PI / 2; crater.position.copy(at).add(new THREE.Vector3(0, .25, 0)); addFx(crater, 7, (o, k) => { o.material.opacity = .85 * (1 - k); });
  for(let i = 0; i < 26; i++){ const a = Math.random() * 6.283, d = new THREE.Mesh(new THREE.IcosahedronGeometry(3 + Math.random() * 3, 0), new THREE.MeshStandardMaterial({color:0xcfc8bc, transparent:true, opacity:.8, flatShading:true, depthWrite:false}));
    d.position.copy(at); addFx(d, 2.4, (o, k) => { o.position.set(at.x + Math.cos(a) * k * 60, at.y + 3 + Math.sin(k * 3.1) * 18, at.z + Math.sin(a) * k * 60); o.scale.setScalar(1 + k * 2); o.material.opacity = .8 * (1 - k); }); }
  if(AU.ctx){ tone(30, {d:3, v:.75, glide:20}); noiseHit({d:2.8, v:.6, f:140, brown:true}); noiseHit({d:.3, v:.4, f:5000, type:'highpass'}); for(let i = 0; i < 20; i++) noiseHit({t:.05 + i * .05, d:.03, v:.14, f:3500, type:'highpass'}); }
  worldDamage.crater(at, layer);
  if(!local) return;
  let ko = 0, fled = 0;
  beasts.forEach(b => { if(layer !== 2 || b.ko > 0) return; if(Math.hypot(b.x - at.x, b.z - at.z) > 95) return; if(b.kind === 'mamot' && Math.random() < .4){ b.flee = 8; fled++; } else { b.ko = 25 + Math.random() * 6; ko++; } });
  animals.forEach(a => { if(layer === 0 && Math.hypot(a.x - at.x, a.z - at.z) < 95) a.faint = 10; });
  toast(layer === 2 ? `TUMBUKAN GERGASI · ${ko} binatang buas tumbang${fled ? `, ${fled} mamot lari` : ''}.` : 'TUMBUKAN GERGASI HITAM · bumi bergegar.', 'ok', 3000);
}

/* --- hooks into the Haki system --- */
SPECIAL_POWERS.gearputih = {
  use(){ startGear(me, true); const dur = playClip('shout'); if(dur) HAKI.busy = Math.min(dur, 1.4);
    toast('GEAR PUTIH · transformasi awan putih selama 30 saat. Tumbukan Gergasi (6) kini boleh digunakan.', 'ok', 4000); screenFx('gear', 1400); },
  remote(o, dir, a){ if(a){ a.gear = 30; tintPerson(a.p.g, tintOf(a)); if(!a.gearFx) a.gearFx = gearFx(a.p); a.gearFx.g.visible = true; startGear(a.p, false); } },
};
SPECIAL_POWERS.tumbuk = {
  check(){ if(!(HAKI.gear > 0)){ toast('Tumbukan Gergasi hanya boleh dalam Gear Putih. Tekan 5 dahulu.', 'bad'); return false; } return true; },
  use(){ HAKI.busy = 2.1; playClip('shout'); giantFist(worldOfPlayer(), forward(), player.layer, true); },
  remote(o, dir, a, d){ giantFist(o, dir, d.l, false); },
};
anims.push((t, dt) => {
  if(HAKI.gear > 0){ HAKI.gear -= dt; if(!session || HAKI.gear <= 0) endGear(); else { gearTick(me, GEAR.me, t, player.moving); if(!ride) gearDrums(t, 1); } }
  peers.forEach(a => { if(!(a.gear > 0)) return; a.gear -= dt;
    if(a.gear <= 0){ tintPerson(a.p.g, tintOf(a)); if(a.gearFx) a.gearFx.g.visible = false; a.p.g.scale.set(1, 1, 1); return; }
    gearTick(a.p, a.gearFx, t, a.m); const d = Math.hypot(a.x - player.x, a.z - player.z); if(d < 120 && !(HAKI.gear > 0)) gearDrums(t, .5 * (1 - d / 120)); });
});
