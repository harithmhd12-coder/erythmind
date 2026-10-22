'use strict';
/* ================= characters ================= */
function makePerson(o = {}){
  const holo = !!o.holo; const base = o.coat ?? 0xf4f6fa;
  const mat = c => holo ? holoMat(0x9fc8ff, .35) : M(c, {flatShading:false, roughness:.7});
  const g = new THREE.Group();
  const legs = [-.24, .24].map(x => { const p = grp(x, 1.05, 0, g); mesh(new THREE.BoxGeometry(.32, 1.05, .36), mat(o.pants ?? 0x262a3a), 0, -.52, 0, p, !holo); mesh(new THREE.BoxGeometry(.36, .2, .5), mat(0x15171f), 0, -1, .06, p, !holo); return p; });
  const torso = mesh(new THREE.BoxGeometry(1.02, 1.35, .6), mat(base), 0, 1.62, 0, g, !holo);
  mesh(new THREE.BoxGeometry(.34, 1.0, .04), mat(o.shirt ?? 0xd2373a), 0, 1.75, .31, g, false);
  mesh(new THREE.SphereGeometry(.42, 18, 14), mat(o.skin ?? 0xd9a77f), 0, 2.62, 0, g, !holo);
  mesh(new THREE.SphereGeometry(.45, 18, 10, 0, 6.283, 0, Math.PI / 2.1), mat(o.hair ?? 0x18181f), 0, 2.68, -.03, g, !holo);
  if(o.goggles){ mesh(new THREE.BoxGeometry(.8, .14, .12), mat(0x1d212b), 0, 2.86, .32, g, false); [-.18, .18].forEach(x => { mesh(new THREE.CylinderGeometry(.11, .11, .1, 12), new THREE.MeshBasicMaterial({color:0x9fc8ff}), x, 2.86, .4, g, false).rotation.x = Math.PI / 2; }); }
  const hands = [];
  const arms = [-.66, .66].map(x => { const p = grp(x, 2.2, 0, g); mesh(new THREE.BoxGeometry(.27, 1.0, .32), mat(base), 0, -.48, 0, p, !holo); hands.push(mesh(new THREE.SphereGeometry(.17, 10, 8), holo ? holoMat(0x9fc8ff, .5) : new THREE.MeshStandardMaterial({color:o.skin ?? 0xd9a77f, emissive:0x000000}), 0, -1.05, 0, p, false)); return p; });
  return {g, legs, arms, hands, torso, phase:Math.random() * 6};
}
function makeMarker(kind){
  const g = new THREE.Group(); g.position.y = 3.75; g.userData.marker = true;
  if(kind === 'owner'){
    mesh(new THREE.OctahedronGeometry(.32, 0), new THREE.MeshBasicMaterial({color:0xff4f45}), 0, 0, 0, g, false);
    mesh(new THREE.TorusGeometry(.52, .04, 6, 30), new THREE.MeshBasicMaterial({color:0xffd27a}), 0, 0, 0, g, false).rotation.x = Math.PI / 2;
  } else {
    const c = kind === 'female' ? 0xff6fb5 : 0x3ddc84;
    mesh(new THREE.ConeGeometry(.38, .85, 4), new THREE.MeshBasicMaterial({color:c}), 0, 0, 0, g, false).rotation.x = Math.PI;
    mesh(new THREE.BoxGeometry(.24, .5, .24), new THREE.MeshBasicMaterial({color:c}), 0, .6, 0, g, false);
  }
  return g;
}
function animatePerson(p, moving, dt, speed){
  if(p.pose){ posePerson(p); return; }                       // sitting or lying (21-duduk.js)
  p.phase += dt * (moving ? speed * .9 : 2);
  const sw = moving ? Math.sin(p.phase) * .7 : 0;
  p.legs[0].rotation.x = lerp(p.legs[0].rotation.x, sw, .3); p.legs[1].rotation.x = lerp(p.legs[1].rotation.x, -sw, .3);
  p.arms[0].rotation.x = lerp(p.arms[0].rotation.x, -sw * .8, .3); p.arms[1].rotation.x = lerp(p.arms[1].rotation.x, sw * .8, .3);
  p.torso.position.y = 1.62 + (moving ? Math.abs(Math.sin(p.phase)) * .06 : Math.sin(p.phase * .5) * .015);
}

const player = {x:0, z:16, y:0, ry:Math.PI, layer:0, moving:false, speed:0, stepPhase:0};
const me = makePerson({goggles:true}); scene.add(me.g);
let meMarker = null;
function setSelfLook(){
  if(meMarker) me.g.remove(meMarker);
  meMarker = makeMarker(session ? (session.role === 'owner' ? 'owner' : session.gender) : 'owner'); me.g.add(meMarker);
  const coat = session?.role === 'guest' ? 0x6a7896 : 0xf4f6fa;
  me.torso.material.color.setHex(coat); me.arms.forEach(a => a.children[0].material.color.setHex(coat));
  setGloves(gloves);
}
const satNPC = SATS.map(s => {
  const p = makePerson({holo:true}); p.g.position.set(s.at[0], s.layer ? LAB.y : 0, s.at[1]);
  p.g.rotation.y = Math.atan2(-s.at[0] + (s.layer ? LAB.x : 0), -s.at[1] + (s.layer ? LAB.z : 0)); S.add(p.g);
  info(p.g, 'Satelit ' + s.id, s.role + '. Klon Eryth Sayf yang menyambung otaknya ke Eryth Records setiap hari.', true);
  return {s, p};
});
anims.push((t, dt) => satNPC.forEach(({p}, i) => { animatePerson(p, false, dt, 0); p.g.position.y = (SATS[i].layer ? LAB.y : 0) + .2 + Math.sin(t * 1.4 + i) * .15; }));

/* ================= animals ================= */
const animals = [];
const furs = {rusa:0xa0703f, kuda:0x5a3a28, arnab:0xe8e2d8, kucing:0xd88a3a, singa:0xc8963e, harimau:0xe07a28};
function makeQuad(kind){
  const g = new THREE.Group(); const c = furs[kind]; const fm = M(c, {flatShading:true});
  const S_ = {rusa:1, kuda:1.35, arnab:.35, kucing:.4, singa:1.15, harimau:1.2}[kind];
  const body = mesh(new THREE.BoxGeometry(.9, .8, 1.8), fm, 0, 1.4, 0, g);
  const neck = mesh(new THREE.BoxGeometry(.38, .9, .4), fm, 0, 2.0, .85, g); neck.rotation.x = .5;
  const head = mesh(new THREE.BoxGeometry(.42, .42, .7), fm, 0, 2.45, 1.25, g);
  const legs = [[-.3, .65], [.3, .65], [-.3, -.65], [.3, -.65]].map(([x, z]) => { const p = grp(x, 1.05, z, g); mesh(new THREE.BoxGeometry(.18, 1.05, .18), fm, 0, -.52, 0, p); return p; });
  if(kind === 'rusa'){ [-1, 1].forEach(s => { const a = mesh(new THREE.CylinderGeometry(.03, .04, .8, 4), M(0xe0d0b0), s * .18, 2.95, 1.1, g, false); a.rotation.z = s * .5; mesh(new THREE.CylinderGeometry(.03, .03, .4, 4), M(0xe0d0b0), s * .32, 3.15, 1.25, g, false).rotation.x = .6; }); mesh(new THREE.BoxGeometry(.12, .2, .12), M(0xffffff), 0, 1.6, -.95, g, false); }
  if(kind === 'kuda'){ mesh(new THREE.BoxGeometry(.12, .7, .5), M(0x2a1a10), 0, 2.4, .7, g, false).rotation.x = .5; mesh(new THREE.BoxGeometry(.14, .9, .14), M(0x2a1a10), 0, 1.3, -1, g, false).rotation.x = .5; }
  if(kind === 'arnab'){ [-1, 1].forEach(s => mesh(new THREE.BoxGeometry(.12, .6, .08), fm, s * .12, 2.95, 1.2, g, false)); body.scale.set(1.2, 1.2, .8); }
  if(kind === 'kucing'){ [-1, 1].forEach(s => mesh(new THREE.ConeGeometry(.1, .25, 4), fm, s * .14, 2.75, 1.25, g, false)); const tail = mesh(new THREE.BoxGeometry(.1, .1, 1.1), fm, 0, 1.8, -1.3, g, false); tail.rotation.x = -.7; }
  if(kind === 'singa' || kind === 'harimau'){ neck.rotation.x = .9; neck.position.set(0, 1.75, .95); head.position.set(0, 2.05, 1.35); head.scale.set(1.3, 1.25, 1);
    [-1, 1].forEach(s => mesh(new THREE.ConeGeometry(.09, .18, 4), fm, s * .2, 2.36, 1.3, g, false));
    const tail = mesh(new THREE.BoxGeometry(.1, .1, 1.3), fm, 0, 1.45, -1.45, g, false); tail.rotation.x = .5;
    if(kind === 'singa'){ const mane = M(0x6a3a18, {flatShading:true}); mesh(new THREE.IcosahedronGeometry(.62, 0), mane, 0, 2.0, 1.15, g, false).scale.set(1.05, 1.1, .8); mesh(new THREE.SphereGeometry(.12, 6, 4), mane, 0, 1.2, -2.05, g, false); }
    else { const st = M(0x1a1410); for(let i = 0; i < 6; i++){ [-1, 1].forEach(s => mesh(new THREE.BoxGeometry(.04, .55, .1), st, s * .46, 1.5, -.7 + i * .28, g, false)); mesh(new THREE.BoxGeometry(.7, .04, .1), st, 0, 1.81, -.7 + i * .28, g, false); } mesh(new THREE.BoxGeometry(.46, .1, .5), M(0xf4ece0), 0, 1.92, 1.42, g, false); } }
  g.scale.setScalar(S_);
  return {g, legs, phase:Math.random() * 6};
}
function spawnAnimals(kind, n, cx, cz, rad, opts = {}){
  for(let i = 0; i < n; i++){
    const a = makeQuad(kind); S.add(a.g);
    const ang = rng() * 6.283, d = rng() * rad;
    Object.assign(a, {kind, x:cx + Math.cos(ang) * d, z:cz + Math.sin(ang) * d, cx, cz, rad, tx:0, tz:0, wait:rng() * 4, speed:opts.speed || 2.4, flee:opts.flee ?? 9, hop:kind === 'arnab', pred:!!opts.pred, prey:null, hunt:0, rest:rng() * 20});
    a.tx = a.x; a.tz = a.z; animals.push(a);
    info(a.g, {rusa:'Rusa', kuda:'Kuda', arnab:'Arnab', kucing:'Kucing Kota', singa:'Singa', harimau:'Harimau Belang'}[kind], {rusa:'Berkeliaran di padang sekitar Tasik Tenang. Larikan diri bila didekati.', kuda:'Kawanan kuda liar Tanah Besar.', arnab:'Arnab padang. Melompat-lompat.', kucing:'Kucing jalanan Kota Awam. Tidak takut manusia.', singa:'Raja padang rumput. Memburu rusa dan kuda sekali-sekala, kemudian berehat lama.', harimau:'Harimau belang penghendap. Menyerang dari semak, rusa dan kuda lari bertempiaran.'}[kind]);
  }
}
spawnAnimals('rusa', 9, 380, -10, 30);
spawnAnimals('rusa', 6, 250, 40, 22);
spawnAnimals('kuda', 6, 410, 50, 26, {speed:3.2});
spawnAnimals('arnab', 10, 300, 20, 30, {speed:3, flee:7});
spawnAnimals('kucing', 7, CITY.x, CITY.z, 55, {speed:1.6, flee:0});
spawnAnimals('kucing', 4, COM.x, COM.z, 30, {speed:1.4, flee:0});
spawnAnimals('rusa', 3, -32, 20, 12, {flee:7});
spawnAnimals('singa', 3, 392, 18, 34, {speed:1.6, flee:0, pred:true});
spawnAnimals('harimau', 2, 368, 22, 34, {speed:1.5, flee:0, pred:true});
// predators: long rests, then a short chase after the nearest deer or horse; prey bolt away
function nearestPred(a){ for(const p of animals) if(p.pred && !(p.faint > 0) && Math.abs(p.x - a.x) < 18 && Math.abs(p.z - a.z) < 18 && Math.hypot(p.x - a.x, p.z - a.z) < (p.hunt > 0 ? 18 : 9)) return p; return null; }
function huntStep(a, dt){
  if(a.faint > 0) return false;
  if(a.hunt > 0){
    a.hunt -= dt; const q = a.prey; if(!q || a.hunt <= 0){ a.hunt = 0; a.prey = null; a.rest = 25 + rng() * 35; a.wait = 4; a.tx = a.x; a.tz = a.z; return true; }
    a.tx = q.x; a.tz = q.z;
    if(Math.hypot(q.x - a.x, q.z - a.z) < 2.2){ a.hunt = 0; a.prey = null; a.rest = 40 + rng() * 40; a.wait = 6; a.tx = a.x; a.tz = a.z;
      if(player.layer === 0 && Math.hypot(player.x - a.x, player.z - a.z) < 60) sfx.roar('serigala'); }
    return true;
  }
  a.rest -= dt; if(a.rest > 0) return false;
  let best = null, bd = 45; animals.forEach(q => { if(q.kind !== 'rusa' && q.kind !== 'kuda') return; const d = Math.hypot(q.x - a.x, q.z - a.z); if(d < bd){ bd = d; best = q; } });
  if(!best){ a.rest = 10; return false; }
  a.prey = best; a.hunt = 6 + rng() * 3; a.wait = 0;
  if(player.layer === 0 && Math.hypot(player.x - a.x, player.z - a.z) < 70) sfx.roar(a.kind === 'singa' ? 'mamot' : 'beruang');
  return true;
}
function updateAnimals(dt, t){
  if(!S.visible) return;
  animals.forEach(a => {
    const dp = player.layer === 0 ? Math.hypot(player.x - a.x, player.z - a.z) : 999;
    let sp = 0;
    if(a.pred && huntStep(a, dt)) sp = a.hunt > 0 ? a.speed * 4.2 : 0;
    else if(!a.pred && a.flee && (a.scare = nearestPred(a))){ const p = a.scare; const dx = a.x - p.x, dz = a.z - p.z, k = 1 / (Math.hypot(dx, dz) || 1); a.tx = a.x + dx * k * 14; a.tz = a.z + dz * k * 14; sp = a.speed * 3; a.wait = 0; }
    else if(a.flee && dp < a.flee){ const k = 1 / (dp || 1); a.tx = a.x + (a.x - player.x) * k * 12; a.tz = a.z + (a.z - player.z) * k * 12; sp = a.speed * 2.6; a.wait = 0; }
    else if(a.wait > 0){ a.wait -= dt; }
    else { const d = Math.hypot(a.tx - a.x, a.tz - a.z); if(d < .5){ a.wait = 2 + rng() * 6; const ang = rng() * 6.283, r = rng() * a.rad; a.tx = a.cx + Math.cos(ang) * r; a.tz = a.cz + Math.sin(ang) * r; } else sp = a.speed; }
    if(sp > 0){ const dx = a.tx - a.x, dz = a.tz - a.z, d = Math.hypot(dx, dz) || 1; const nx = a.x + dx / d * sp * dt, nz = a.z + dz / d * sp * dt;
      if(surfaceH(nx, nz) > -.4 && Math.hypot(nx - a.cx, nz - a.cz) < a.rad * 1.6){ a.x = nx; a.z = nz; } else { a.tx = a.cx; a.tz = a.cz; }
      a.g.rotation.y = Math.atan2(dx, dz); }
    a.phase += dt * sp * 3;
    const sw = sp > 0 ? Math.sin(a.phase) * .6 : 0;
    a.legs.forEach((l, i) => l.rotation.x = (i === 0 || i === 3) ? sw : -sw);
    a.g.position.set(a.x, Math.max(surfaceH(a.x, a.z), -.3) + (a.hop && sp > 0 ? Math.abs(Math.sin(a.phase)) * .4 : 0), a.z);
  });
}
// bird flocks
const flocks = [];
function makeFlock(cx, cz, h, n, rad){
  const f = {g:grp(), birds:[], cx, cz, h, rad, a:rng() * 6};
  for(let i = 0; i < n; i++){ const b = grp(0, 0, 0, f.g); const wm = new THREE.MeshBasicMaterial({color:0x2a2a30, side:THREE.DoubleSide});
    const l = mesh(new THREE.PlaneGeometry(.55, .18), wm, -.28, 0, 0, b, false), r = mesh(new THREE.PlaneGeometry(.55, .18), wm, .28, 0, 0, b, false);
    l.geometry.translate(-.0, 0, 0); b.userData = {l, r, o:new THREE.Vector3((rng() - .5) * 8, (rng() - .5) * 3, (rng() - .5) * 8), ph:rng() * 6}; f.birds.push(b); }
  flocks.push(f);
}
makeFlock(330, -40, 30, 14, 60); makeFlock(0, 0, 26, 10, 45); makeFlock(290, 100, 22, 8, 30); makeFlock(300, -188, 70, 12, 70);
function updateFlocks(dt, t){
  if(!S.visible) return;
  flocks.forEach(f => { f.a += dt * .12; const x = f.cx + Math.cos(f.a) * f.rad, z = f.cz + Math.sin(f.a * 1.3) * f.rad * .7;
    f.g.position.set(x, f.h + Math.sin(t * .4) * 3, z); f.g.rotation.y = -f.a;
    f.birds.forEach(b => { const u = b.userData; b.position.copy(u.o).add(new THREE.Vector3(Math.sin(t + u.ph) * 1.2, Math.sin(t * 1.7 + u.ph) * .6, 0)); const w = Math.sin(t * 10 + u.ph) * .9; u.l.rotation.z = w; u.r.rotation.z = -w; });
    f.g.visible = nightLevel < .7; });
}

/* ================= informer bots (Bot Bayang) ================= */
const bots = [];
const BOT_HOMES = [[CITY.x, CITY.z, 70], [COM.x, COM.z, 50], [CITY.x - 40, CITY.z + 60, 40]];
for(let i = 0; i < 10; i++){
  const g = grp(); const home = BOT_HOMES[i % 3];
  const shell = M(0x1d2230, {metalness:.7, roughness:.3});
  mesh(new THREE.SphereGeometry(.7, 16, 12), shell, 0, 0, 0, g);
  const ring = mesh(new THREE.TorusGeometry(.95, .08, 6, 24), new THREE.MeshBasicMaterial({color:0x9fc8ff}), 0, 0, 0, g, false); ring.rotation.x = Math.PI / 2;
  const eye = mesh(new THREE.SphereGeometry(.25, 10, 8), new THREE.MeshBasicMaterial({color:0x9fc8ff}), 0, .05, .6, g, false);
  mesh(new THREE.CylinderGeometry(.03, .03, .8, 4), M(0x9aa3b8), 0, .9, 0, g, false);
  const tip = mesh(new THREE.SphereGeometry(.1, 6, 4), new THREE.MeshBasicMaterial({color:0xff4f45}), 0, 1.3, 0, g, false);
  const name = 'BAYANG-' + String(i + 1).padStart(2, '0');
  const b = {g, ring, eye, tip, name, home, x:home[0] + (rng() - .5) * 30, z:home[1] + (rng() - .5) * 30, tx:0, tz:0, wait:0, alert:0, tail:null};
  b.tx = b.x; b.tz = b.z; bots.push(b);
  info(g, name, 'Bot risikan halimunan separa urban. Memerhati pelawat dan melaporkan apa-apa yang mencurigakan kepada pemilik.');
}
function updateBots(dt, t){
  if(!S.visible) return;
  const guests = [...peers.values()].filter(a => a.kind !== 'owner' && a.l === 0);
  const targets = session?.role === 'guest' ? [{x:player.x, z:player.z, id:'me'}] : guests.map(a => ({x:a.x, z:a.z, id:a.id}));
  bots.forEach((b, i) => {
    const tg = targets.length ? targets[i % targets.length] : null;
    if(tg && i < Math.max(2, targets.length * 2) && Math.hypot(tg.x - b.home[0], tg.z - b.home[1]) < b.home[2] * 2.5){
      const ang = t * .3 + i * 2.1; b.tx = tg.x + Math.cos(ang) * 7; b.tz = tg.z + Math.sin(ang) * 7; b.tail = tg.id;
    } else {
      b.tail = null;
      if(Math.hypot(b.tx - b.x, b.tz - b.z) < 1){ b.wait -= dt; if(b.wait <= 0){ const a = rng() * 6.283, r = rng() * b.home[2]; b.tx = b.home[0] + Math.cos(a) * r; b.tz = b.home[1] + Math.sin(a) * r; b.wait = 1 + rng() * 4; } }
    }
    const dx = b.tx - b.x, dz = b.tz - b.z, d = Math.hypot(dx, dz) || 1, sp = b.tail ? 9 : 4;
    if(d > .5){ b.x += dx / d * Math.min(d, sp * dt); b.z += dz / d * Math.min(d, sp * dt); b.g.rotation.y = Math.atan2(dx, dz); }
    b.g.position.set(b.x, surfaceH(b.x, b.z) + 4.5 + Math.sin(t * 2 + i) * .4, b.z);
    b.alert = Math.max(0, b.alert - dt * .2);
    const col = b.alert > 0 ? 0xff3030 : b.tail ? 0xffc65c : 0x9fc8ff;
    b.ring.material.color.setHex(col); b.eye.material.color.setHex(col); b.ring.rotation.z += dt * (b.tail ? 4 : 1.2);
    b.tip.visible = b.alert > 0 ? Math.sin(t * 12) > 0 : Math.sin(t * 2 + i) > .6;
  });
}
function botAlarm(x, z){ let best = null, bd = 1e9; bots.forEach(b => { const d = Math.hypot(b.x - x, b.z - z); if(d < bd){ bd = d; best = b; } }); if(best){ best.alert = 1; best.tx = x + 4; best.tz = z + 4; } return best ? best.name : 'BAYANG'; }

/* ================= Nivelham beasts ================= */
const beasts = [];
function makeBeast(kind){
  const g = new THREE.Group(); const fur = M(kind === 'mamot' ? 0x6a4a32 : kind === 'beruang' ? 0xeef2f6 : 0xc8d2dc, {flatShading:true});
  let s = 1;
  if(kind === 'mamot'){
    mesh(new THREE.SphereGeometry(5, 14, 10), fur, 0, 9, 0, g).scale.set(1, .9, 1.4);
    const head = mesh(new THREE.SphereGeometry(3, 12, 10), fur, 0, 11, 6.5, g);
    const trunk = mesh(new THREE.CylinderGeometry(.6, 1.1, 7, 8), fur, 0, 6.5, 9, g); trunk.rotation.x = .25;
    [-1, 1].forEach(k => { const tusk = mesh(new THREE.TorusGeometry(3, .35, 6, 12, Math.PI * .7), M(0xf2ead8), k * 1.6, 7, 8.5, g, false); tusk.rotation.y = Math.PI / 2; tusk.rotation.z = Math.PI * .9; });
  } else if(kind === 'beruang'){
    mesh(new THREE.SphereGeometry(4, 12, 10), fur, 0, 6, 0, g).scale.set(1, .9, 1.4);
    mesh(new THREE.SphereGeometry(2.2, 12, 10), fur, 0, 7.5, 5.2, g);
    [-1, 1].forEach(k => mesh(new THREE.SphereGeometry(.6, 8, 6), fur, k * 1.4, 9.4, 5, g));
    mesh(new THREE.SphereGeometry(.7, 8, 6), M(0x1a1a1a), 0, 7.2, 7.3, g, false);
  } else {
    mesh(new THREE.BoxGeometry(2.4, 2.4, 6), fur, 0, 4.4, 0, g);
    const h = mesh(new THREE.BoxGeometry(1.8, 1.8, 2.6), fur, 0, 5.4, 3.8, g);
    [-1, 1].forEach(k => mesh(new THREE.ConeGeometry(.45, 1.2, 4), fur, k * .6, 6.8, 3.4, g));
    mesh(new THREE.BoxGeometry(.6, .6, 3.4), fur, 0, 4.8, -4.2, g, false).rotation.x = -.5;
    [-1, 1].forEach(k => mesh(new THREE.SphereGeometry(.2, 6, 4), new THREE.MeshBasicMaterial({color:0x8fe0ff}), k * .5, 5.8, 5.1, g, false));
  }
  const L = kind === 'mamot' ? [2.6, 6, 3.2, 1.3] : kind === 'beruang' ? [2, 4, 2.4, 1] : [.9, 3.2, 2.2, .5];
  const legs = [[-1, 1], [1, 1], [-1, -1], [1, -1]].map(([sx, sz]) => { const p = grp(sx * L[0], L[1], sz * L[2], g); mesh(new THREE.CylinderGeometry(L[3], L[3] * .9, L[1], 8), fur, 0, -L[1] / 2, 0, p); return p; });
  return {g, legs};
}
[['mamot', 2, 330, -150], ['mamot', 1, 262, -95], ['beruang', 1, 405, -150], ['serigala', 4, 300, -60], ['serigala', 3, 375, -70]].forEach(([kind, n, cx, cz]) => {
  for(let i = 0; i < n; i++){ const b = makeBeast(kind); N.add(b.g);
    Object.assign(b, {kind, x:cx + (rng() - .5) * 30, z:cz + (rng() - .5) * 30, cx, cz, tx:cx, tz:cz, wait:0, phase:rng() * 6, r:kind === 'mamot' ? 8 : kind === 'beruang' ? 6 : 3.5, speed:kind === 'serigala' ? 7 : 4, chase:kind === 'serigala' ? 45 : 30, cool:0});
    beasts.push(b);
    info(b.g, {mamot:'Mamot Gergasi', beruang:'Beruang Salji Gergasi', serigala:'Serigala Ais Gergasi'}[kind], 'Binatang liar ganas Nivelham. Jangan dekat: ia akan menyerbu dan menolak kau jauh.');
  }
});
function updateBeasts(dt, t){
  if(!N.visible) return;
  const inValley = player.layer === 2 && nivRegion(player.x, player.z) === 'lembah';
  beasts.forEach(b => {
    b.cool = Math.max(0, b.cool - dt);
    if(hakiBeast(b, dt)) return;
    const dp = inValley ? Math.hypot(player.x - b.x, player.z - b.z) : 999;
    const safe = Math.hypot(player.x - NV.arrive.x, player.z - NV.arrive.z) < 26 || nivRegion(player.x, player.z) !== 'lembah';
    let sp = 0;
    if(dp < b.chase && !safe && b.cool <= 0 && session){ b.tx = player.x; b.tz = player.z; sp = b.speed * 1.7; if(!b.roared){ b.roared = true; sfx.roar(b.kind); } }
    else { b.roared = false; if(Math.hypot(b.tx - b.x, b.tz - b.z) < 1){ b.wait -= dt; if(b.wait <= 0){ const a = rng() * 6.283, r = rng() * 40; b.tx = b.cx + Math.cos(a) * r; b.tz = b.cz + Math.sin(a) * r; b.wait = 3 + rng() * 6; } } else sp = b.speed * .5; }
    sp *= HAKI.obs > 0 ? .35 : 1; if(b.flee){ b.tx = b.x + (b.x - player.x); b.tz = b.z + (b.z - player.z); sp = b.speed * 1.4; b.flee -= dt; if(b.flee < 0) b.flee = 0; }
    if(sp > 0){ const dx = b.tx - b.x, dz = b.tz - b.z, d = Math.hypot(dx, dz) || 1; const nx = b.x + dx / d * sp * dt, nz = b.z + dz / d * sp * dt;
      if(Math.hypot(nx - CAVE.x, nz - CAVE.z) < 185 && Math.hypot(nx - NV.arrive.x, nz - NV.arrive.z) > 24 && nivRegion(nx, nz) === 'lembah'){ b.x = nx; b.z = nz; } else { b.tx = b.cx; b.tz = b.cz; }
      b.g.rotation.y = Math.atan2(dx, dz); }
    b.phase += dt * sp * (b.kind === 'serigala' ? 1.6 : .7);
    const sw = sp > 0 ? Math.sin(b.phase) * .5 : 0; b.legs.forEach((l, i) => l.rotation.x = (i === 0 || i === 3) ? sw : -sw);
    b.g.position.set(b.x, nivH(b.x, b.z), b.z);
    if(dp < b.r + 1.5 && b.cool <= 0 && session){
      if(hakiContact(b)) return;
      b.cool = 6; const dx = player.x - b.x, dz = player.z - b.z, d = Math.hypot(dx, dz) || 1;
      let nx = player.x + dx / d * 22, nz = player.z + dz / d * 22; if(!nivWalkable(nx, nz)){ nx = NV.arrive.x; nz = NV.arrive.z - 6; }
      player.x = nx; player.z = nz; flash('rgba(255,40,40,.7)'); shake = .6; sfx.roar(b.kind); sfx.thud();
      toast(`${b.kind === 'mamot' ? 'Mamot Gergasi' : b.kind === 'beruang' ? 'Beruang Salji Gergasi' : 'Serigala Ais'} menyerbu! Kau terpelanting jauh.`, 'bad');
    }
  });
}
let shake = 0;

/* ================= peers (live presence) ================= */
const net = {room:null, last:0, key:'', talk:0};
const peers = new Map();
function removePeer(id){ const a = peers.get(id); if(!a) return; (a.l === 2 ? N : S).remove(a.p.g); scene.remove(a.p.g); a.label.el.remove(); labels.splice(labels.indexOf(a.label), 1); peers.delete(id); }
function syncPeers(list){
  const seen = new Set();
  list.forEach(p => {
    if(p.isMe || p.sameTab) return; const pr = p.presence || {}; if(pr.u !== 1) return;
    seen.add(p.peer); let a = peers.get(p.peer);
    const kind = pr.r === 'owner' ? 'owner' : (pr.g === 'female' ? 'female' : 'male');
    if(!a || a.kind !== kind){
      if(a) removePeer(p.peer);
      const per = makePerson({coat:kind === 'owner' ? 0xf4f6fa : 0x6a7896, goggles:kind === 'owner'}); per.g.add(makeMarker(kind)); scene.add(per.g);
      a = {id:p.peer, by:p.by, p:per, kind, x:+pr.x || 0, z:+pr.z || 0, l:+pr.l || 0, ry:+pr.ry || 0, m:0, seen:performance.now(), lastX:+pr.x || 0, lastZ:+pr.z || 0, lastT:performance.now(), linger:{}};
      a.label = addLabel('', 'name ' + kind, () => a.p.g.position.clone().setY(a.p.g.position.y + 4.5), {max:160});
      peers.set(p.peer, a);
      if(isOwner() && kind !== 'owner') intelNote({kind:'masuk', who:pr.n || 'Tetamu', where:'Erythmind', by:'PERISAI', quiet:true});
    }
    a.tx = +pr.x || 0; a.tz = +pr.z || 0; a.tl = +pr.l || 0; a.try = +pr.ry || 0; a.m = pr.m ? 1 : 0; a.vk = pr.vk || ''; a.vy = +pr.vy || 0; a.name = String(pr.n || (kind === 'owner' ? 'Pemilik' : 'Tetamu')).slice(0, 28);
    a.talk = pr.k ? 1 : 0; a.st = +pr.st || 0; a.sy = +pr.sy || 0; a.label.el.textContent = a.name + (a.talk ? ' · 🎙' : '');
    if(isOwner()) inspectPeer(a);
  });
  [...peers.keys()].forEach(id => { if(!seen.has(id)) removePeer(id); });
  updateWho();
}
function updatePeers(dt){
  peers.forEach(a => {
    if(a.tl !== a.l){ a.l = a.tl; a.x = a.tx; a.z = a.tz; }
    const k = 1 - Math.exp(-dt * 8); a.x = lerp(a.x, a.tx, k); a.z = lerp(a.z, a.tz, k); a.ry = a.try;
    const y = layerBase(a.l) + (a.vk === 'jet' || a.vk === 'drone' ? a.vy : a.vk === 'kapal' ? -.9 : groundAt(a.x, a.z, a.l));
    if(a.st){ const o = seatOffset(a.p, {kind:a.st === 2 ? 'lie' : 'sit'}); a.p.g.position.set(a.x + Math.sin(a.ry) * o.f, layerBase(a.l) + a.sy + o.y, a.z + Math.cos(a.ry) * o.f); } else a.p.g.position.set(a.x, y, a.z); a.p.g.rotation.y = a.ry; animatePerson(a.p, a.m, dt, 9);
  });
}
function pushPresence(force){
  if(!net.room) return; const now = performance.now(); if(!force && now - net.last < 120) return;
  const p = session ? {u:1, x:+player.x.toFixed(2), z:+player.z.toFixed(2), ry:+player.ry.toFixed(2), l:player.layer, m:player.moving ? 1 : 0, vk:ride ? ride.kind : '', vy:ride ? +ride.y.toFixed(1) : 0, r:session.role, g:session.gender || '', n:session.name, k:net.talk || 0, st:player.seat ? (player.seat.kind === 'lie' ? 2 : 1) : 0, sy:player.seat ? +player.seat.y.toFixed(2) : 0} : {u:0, k:0, st:0, sy:0, x:null, z:null, ry:null, l:null, m:null, vk:null, vy:null, r:null, g:null, n:null};
  const key = JSON.stringify(p); if(key === net.key) return; net.key = key; net.last = now; net.room.presence(p).catch(() => {});
}
async function startRoom(){ const room = await use('room'); if(!room) return; net.room = room; room.onPeers(ch => syncPeers(ch.peers), () => {}); }

/* ================= Higgsfield models (assets/manifest.json) ================= */
// Each GLB is fitted to the footprint of the procedural landmark it replaces.
const UPGRADES = {
  menaraJam:{g:clockTower, hide:[ctProc], height:56, after:fitClockFaces},
  masjid:{g:masjid, hide:[msProc], span:34},
  pokokPurba:{g:tree, hide:'meshes', height:150, keep:[branch]},
  bubo:{g:bubo, hide:'all', height:8.5, base:-3, after:m => anims.push(t => { m.parent.rotation.y = Math.sin(t * .4) * .6; })},
  dewanPanjang:{g:dewanBesar, hide:'all', span:38, alignLong:'z'},
};
function fitClockFaces(m){
  // put the live clock faces on the generated tower, at the height where it is widest near the top
  const v = new THREE.Vector3(), H = new THREE.Box3().setFromObject(m).max.y; let best = {y:H * .78, r:4};
  const ys = [.68, .72, .76, .8, .84].map(k => k * H), rad = ys.map(() => 0);
  m.updateMatrixWorld(true); const inv = new THREE.Matrix4().copy(clockTower.matrixWorld).invert();
  m.traverse(o => { if(!o.isMesh) return; const p = o.geometry.attributes.position; for(let i = 0; i < p.count; i += 3){ v.fromBufferAttribute(p, i).applyMatrix4(o.matrixWorld).applyMatrix4(inv); ys.forEach((y, k) => { if(Math.abs(v.y - y) < H * .02) rad[k] = Math.max(rad[k], Math.max(Math.abs(v.x), Math.abs(v.z))); }); } });
  const k = rad.indexOf(Math.max(...rad)); if(rad[k] > 0) best = {y:ys[k], r:rad[k]};
  ctFaces.children.forEach(p => { const f = p.children[0]; f.position.set(0, best.y, best.r + .15); f.scale.setScalar(clamp(best.r * .8 / 3.3, .3, 1.4)); });
}
function fitModel(m, spec){
  m.updateMatrixWorld(true);
  let box = new THREE.Box3().setFromObject(m), size = box.getSize(new THREE.Vector3());
  if(spec.alignLong === 'z' && size.x > size.z){ m.rotation.y += Math.PI / 2; m.updateMatrixWorld(true); box = new THREE.Box3().setFromObject(m); size = box.getSize(new THREE.Vector3()); }
  const s = spec.height ? spec.height / size.y : spec.span / Math.max(size.x, size.z);
  m.scale.multiplyScalar(s); m.updateMatrixWorld(true);
  box = new THREE.Box3().setFromObject(m); const c = box.getCenter(new THREE.Vector3());
  m.position.x -= c.x; m.position.z -= c.z; m.position.y += (spec.base || 0) - box.min.y;
}
