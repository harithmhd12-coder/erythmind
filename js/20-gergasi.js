'use strict';
/* ================= Penjaga Gergasi Nivelham: a chained giant with a thunder hammer =================
   Inspired by the giant prince of Elbaph swinging his hammer; renamed (the source name is a Norse god).
   He sleeps chained between two stone pillars in the valley. Come too close, or strike him with a power,
   and he breaks his chains and rampages: thunder-hammer smashes, quakes, lightning. Only the owner's
   Haki Raja Agung makes him kneel; then he walks back, sits, and the chains close again. */
const GIANT = {lair:{x:292, z:-128}, face:Math.PI / 2 * .6, H:52, state:'tidur', t:0, near:0, swing:0, roam:null, away:0, x:292, z:-128, ry:Math.PI / 2 * .6,
  model:null, mixer:null, clips:{}, act:null, hand:null, impact:.55, chainsOn:true};
const GG = grp(GIANT.lair.x, 0, GIANT.lair.z, N);
const giantY = (x, z) => nivH(x, z);

/* --- the lair: two rock pillars with iron rings --- */
const PILLARS = [-1, 1].map(s => { const a = GIANT.face + s * Math.PI / 2, x = GIANT.lair.x + Math.sin(a) * 22, z = GIANT.lair.z + Math.cos(a) * 22, y = giantY(x, z);
  const p = grp(x, y, z, N); mesh(new THREE.CylinderGeometry(4, 6.5, 46, 7), M(0x5a5e66, {roughness:1}), 0, 23, 0, p); mesh(new THREE.TorusGeometry(4.6, .9, 8, 20), M(0x3a3e46, {metalness:.7}), 0, 34, 0, p, false).rotation.x = Math.PI / 2;
  collide(x, z, 6.5, 2); return {x, y, z, top:new THREE.Vector3(x, NVY + y + 34, z)}; });
{ const seat = mesh(new THREE.DodecahedronGeometry(1, 0), M(0x5a5e66, {roughness:1}), GIANT.lair.x - Math.sin(GIANT.face) * 4, giantY(GIANT.lair.x, GIANT.lair.z) + 5, GIANT.lair.z - Math.cos(GIANT.face) * 4, N); seat.scale.set(16, 9.5, 12); collide(GIANT.lair.x, GIANT.lair.z, 10, 2); }
info(GG, 'Penjaga Gergasi Nivelham', 'Gergasi purba yang tidur berantai di Lembah Nivelham, menggenggam Tukul Petir. Jangan dekati atau serang dia. Hanya Haki Raja Agung Eryth Sayf dapat menundukkannya.');

/* --- procedural body (until the Higgsfield giant loads) --- */
const GS = GIANT.H / 3.4;
const gProc = makePerson({coat:0x4a3a2a, pants:0x3a3028, shirt:0xc89a78, skin:0xd9a77f, hair:0xd8b040});
gProc.g.scale.setScalar(GS); GG.add(gProc.g);
const procHammer = grp(0, -1.05, .2, gProc.arms[1]); mesh(new THREE.CylinderGeometry(.06, .06, 1.6, 6), M(0x5a3a22), 0, -.2, .4, procHammer, false).rotation.x = 1.2; const hh = mesh(new THREE.BoxGeometry(.7, .55, .55), M(0x3a3e46, {metalness:.6}), 0, -.55, 1.1, procHammer); hh.userData.head = true;

/* --- chains: catenaries of links from the pillar rings to the giant's wrists and ankles --- */
const LINKS = 26, chainMesh = new THREE.InstancedMesh(new THREE.TorusGeometry(.75, .22, 6, 12), M(0x4a4e58, {metalness:.8, roughness:.35}), LINKS * 4); chainMesh.frustumCulled = false; scene.add(chainMesh);
const _ga = new THREE.Vector3(), _gb = new THREE.Vector3(), _gp = new THREE.Vector3(), _gq = new THREE.Quaternion(), _gm = new THREE.Matrix4(), _g1 = new THREE.Vector3(1, 1, 1), _gz = new THREE.Vector3(0, 0, 0);
function limbPoints(){
  const pts = [];
  if(GIANT.model && GIANT.bones){ ['LeftHand', 'RightHand', 'LeftFoot', 'RightFoot'].forEach(n => { const b = GIANT.bones[n]; if(b) pts.push(b.getWorldPosition(new THREE.Vector3())); }); }
  if(pts.length < 4){ pts.length = 0; [gProc.hands[0], gProc.hands[1], gProc.legs[0], gProc.legs[1]].forEach(o => pts.push(o.getWorldPosition(new THREE.Vector3()))); }
  return pts;
}
function updateChains(t){
  if(!GIANT.chainsOn || player.layer !== 2){ chainMesh.visible = GIANT.chainsOn && player.layer === 2; if(!GIANT.chainsOn) chainMesh.visible = false; return; }
  chainMesh.visible = true; const ends = limbPoints();
  ends.forEach((B, c) => { const A = PILLARS[c % 2 === 0 ? 0 : 1].top;
    for(let i = 0; i < LINKS; i++){ const k = (i + .5) / LINKS; _gp.copy(A).lerp(B, k); _gp.y -= Math.sin(k * Math.PI) * 6 + Math.sin(t * .8 + c) * .3;
      _gb.copy(A).lerp(B, k + .01); _gb.y -= Math.sin((k + .01) * Math.PI) * 6; _gq.setFromUnitVectors(new THREE.Vector3(0, 0, 1), _gb.sub(_gp).normalize());
      if(i % 2) _gq.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2)); chainMesh.setMatrixAt(c * LINKS + i, _gm.compose(_gp, _gq, _g1)); } });
  chainMesh.instanceMatrix.needsUpdate = true;
}
function breakChains(){
  if(!GIANT.chainsOn) return; GIANT.chainsOn = false; chainMesh.visible = false;
  limbPoints().forEach(B => { for(let i = 0; i < 6; i++){ const l = new THREE.Mesh(new THREE.TorusGeometry(.75, .22, 6, 12), chainMesh.material); l.position.copy(B); const v = new THREE.Vector3((Math.random() - .5) * 40, 20 + Math.random() * 25, (Math.random() - .5) * 40);
    addFx(l, 2.5, (o, k, dt) => { v.y -= 40 * dt; o.position.addScaledVector(v, dt); o.rotation.x += dt * 8; }); } });
  flash('rgba(255,220,120,.6)'); shake = 1.2; if(AU.ctx){ noiseHit({d:.6, v:.4, f:3200, type:'bandpass'}); tone(1800, {d:.4, v:.06, glide:600}); }
}

/* --- animation: Higgsfield rig clips when loaded, simple procedural poses otherwise --- */
function play(name, {loop = true, speed = 1, fade = .4, hold} = {}){
  if(!GIANT.mixer) return 0; const clip = GIANT.clips[name]; if(!clip) return 0;
  const act = GIANT.mixer.clipAction(clip); act.reset(); act.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, Infinity); act.clampWhenFinished = !loop; act.timeScale = speed;
  if(GIANT.act && GIANT.act !== act) GIANT.act.crossFadeTo(act, fade, false); act.play(); GIANT.act = act; GIANT.hold = hold; return clip.duration / speed;
}
function procPose(dt, t, moving){
  const p = gProc; if(!p.g.visible) return;
  if(GIANT.state === 'tidur'){ p.legs.forEach(l => l.rotation.x = lerp(l.rotation.x, -1.45, .1)); p.g.position.y = lerp(p.g.position.y, -.78 * GS, .1); p.arms.forEach((a, i) => a.rotation.set(-.5, 0, (i ? -1 : 1) * .5)); p.torso.rotation.x = .3 + Math.sin(t * .6) * .03; return; }
  if(GIANT.state === 'tunduk'){ p.legs[0].rotation.x = lerp(p.legs[0].rotation.x, -1.5, .1); p.legs[1].rotation.x = lerp(p.legs[1].rotation.x, .2, .1); p.g.position.y = lerp(p.g.position.y, -.5 * GS, .1); p.torso.rotation.x = .5; return; }
  p.g.position.y = lerp(p.g.position.y, 0, .1); p.torso.rotation.x = 0;
  animatePerson(p, moving, dt, 6);
  if(GIANT.swingAnim > 0){ const k = 1 - GIANT.swingAnim / 1.6; p.arms[1].rotation.x = k < .55 ? lerp(0, -3, k / .55) : lerp(-3, .6, (k - .55) / .45); }
}

/* --- states --- */
const bossEl = document.createElement('div'); bossEl.id = 'boss'; bossEl.hidden = true; document.body.appendChild(bossEl);
function setBoss(title, sub, cls){ bossEl.hidden = !title; if(title){ bossEl.className = cls || ''; bossEl.innerHTML = `<b>${title}</b><span>${sub}</span>`; } }
function wake(why, from){
  if(GIANT.state !== 'tidur') return; GIANT.state = 'bangun'; GIANT.t = 0; GIANT.away = 0; GIANT.awayMax = from ? 180 : 45; GIANT.by = from || '';
  if(!from) net.room?.emit('haki', {k:'gergasi', s:'bangun', n:session?.name || 'Seseorang', x:+GIANT.x.toFixed(1), z:+GIANT.z.toFixed(1), ry:0, l:2}).catch(() => {});
  if(isOwner()) owlSense(from);
  play('roar', {loop:false, fade:.6}) || play('walk');
  toast(`PENJAGA GERGASI NIVELHAM BANGUN DAN MENGAMOK! (${why}) Hanya Haki Raja Agung pemilik dapat menundukkannya.`, 'bad', 7000);
  if(AU.ctx){ tone(36, {type:'sawtooth', a:.4, d:3, v:.4, filt:220, glide:28}); noiseHit({d:3, v:.45, f:140, brown:true}); }
  setTimeout(breakChains, 1200);
}
function subdue(){
  if(GIANT.state !== 'amok' && GIANT.state !== 'bangun') return; GIANT.state = 'tunduk'; GIANT.t = 0;
  const d = play('kneel', {loop:false, fade:.5}); GIANT.kneelHold = d ? d * .42 : 0;
  toast('Penjaga Gergasi Nivelham melutut dan tunduk kepada Haki Raja Agung Eryth Sayf.', 'ok', 5000);
  for(let i = 0; i < 24; i++){ const a = new THREE.Vector3(GIANT.x, NVY + giantY(GIANT.x, GIANT.z) + GIANT.H * .6, GIANT.z); bolt(a, a.clone().add(new THREE.Vector3((Math.random() - .5) * 60, (Math.random() - .5) * 50, (Math.random() - .5) * 60)), Math.random() < .55 ? PURPLE : GOLD, 6, .3); }
}
function hammerImpact(){
  const a = GIANT.ry, at = new THREE.Vector3(GIANT.x + Math.sin(a) * GIANT.H * .55, 0, GIANT.z + Math.cos(a) * GIANT.H * .55); at.y = NVY + giantY(at.x, at.z);
  for(let i = 0; i < 10; i++){ const top = at.clone().add(new THREE.Vector3((Math.random() - .5) * 30, 120, (Math.random() - .5) * 30)); bolt(top, at.clone().add(new THREE.Vector3((Math.random() - .5) * 12, 0, (Math.random() - .5) * 12)), Math.random() < .5 ? 0xfff2a0 : 0x9fd8ff, 10, .35); }
  shockwave(at, 70); boom(at.x, at.y + 4, at.z, 0xffd27a, 3); flash('rgba(255,240,190,.85)'); setTimeout(() => flash('rgba(120,170,255,.5)'), 120);
  if(AU.ctx){ tone(28, {d:3.2, v:.8, glide:18}); noiseHit({d:3, v:.6, f:120, brown:true}); noiseHit({d:.25, v:.5, f:6000, type:'highpass'}); }
  worldDamage.crater(at, 2);
  beasts.forEach(b => { if(b.ko > 0) return; if(Math.hypot(b.x - at.x, b.z - at.z) < 60){ b.ko = 14; } });
  if(player.layer === 2 && session && !ride){ const dx = player.x - at.x, dz = player.z - at.z, d = Math.hypot(dx, dz);
    if(d < 45){ const k = 38 / (d || 1); let nx = player.x + dx * k * .9, nz = player.z + dz * k * .9; if(!nivWalkable(nx, nz)){ nx = NV.arrive.x; nz = NV.arrive.z + 6; } player.x = nx; player.z = nz; player.chill = 2; shake = 1.8;
      toast('TUKUL PETIR! Kau terpelanting jauh. Gunakan Haki Raja Agung (2) untuk menundukkannya.', 'bad', 3500); }
    else if(d < 140) shake = Math.max(shake, 1.1 * (1 - d / 140)); }
}
AGUNG_HOOKS.push((o, isMine, byOwner) => {
  if(GIANT.state !== 'amok' && GIANT.state !== 'bangun') return;
  if(byOwner){ if(isMine && player.layer !== 2) toast('Haki Raja Agung kau sampai ke Lembah Nivelham. Penjaga Gergasi melutut.', 'ok', 4000); subdue(); } else if(isMine) toast('Penjaga Gergasi tidak tunduk kepada sesiapa selain Eryth Sayf. Dia makin mengamok!', 'bad', 4000);
});
POWER_HOOKS.push((id, o, isMine, byOwner, layer) => {
  if(layer !== 2 || GIANT.state !== 'tidur' || (id === 'raja' && byOwner) || id === 'obs') return;
  if(Math.hypot(o.x - GIANT.x, o.z - GIANT.z) < 170) setTimeout(() => wake('dia terkejut oleh kuasa yang digunakan'), 1500);
});

// the owner's instinct: wherever you are, you feel the giant wake, and your Haki Raja Agung reaches him
function owlSense(from){
  screenFx('vision', 2600); flash('rgba(255,210,120,.35)');
  if(AU.ctx){ [0, .32, 1.1, 1.42].forEach(t => tone(52, {t, a:.01, d:.25, v:.3, glide:40})); tone(30, {t:.6, type:'sawtooth', a:.5, d:2, v:.12, filt:200}); }
  toast(`NALURI HAKI · Penjaga Gergasi Nivelham bangun dan mengamok${from ? ' (dibangunkan oleh ' + from + ')' : ''}. Tekan 2 · Haki Raja Agung untuk menundukkannya terus, dari mana-mana.`, 'bad', 9000);
}
(async () => { const r = await use('room'); if(r) r.on('haki', m => { const d = m.data; if(m.isMe || !d || d.k !== 'gergasi') return;
  if(d.s === 'bangun' && GIANT.state === 'tidur') wake('dibangunkan oleh ' + String(d.n || 'tetamu').slice(0, 28), String(d.n || 'tetamu').slice(0, 28)); }, () => {}); })();
const _gw = new THREE.Vector3();
anims.push((t, dt) => {
  GIANT.t += dt; const L2 = player.layer === 2 && !!session, dp = L2 ? Math.hypot(player.x - GIANT.x, player.z - GIANT.z) : 1e9;
  let moving = false;
  if(GIANT.state === 'tidur'){
    if(L2 && dp < 55){ GIANT.near += dt; if(GIANT.near > 4) wake('kau terlalu dekat'); else if(GIANT.near > 1.5 && !GIANT.warned){ GIANT.warned = true; toast('Penjaga Gergasi bergerak dalam tidurnya… Undur!', 'bad', 2500); } }
    else { GIANT.near = Math.max(0, GIANT.near - dt); GIANT.warned = false; }
    GIANT.ry = lerp(GIANT.ry, GIANT.face, .05);
    if(L2 && dp < 140 && Math.random() < dt * .4 && AU.ctx) noiseHit({d:1.8, v:.06 * (1 - dp / 140), f:180, brown:true});            // snoring
  }
  else if(GIANT.state === 'bangun'){ if(GIANT.t > 3.4){ GIANT.state = 'amok'; GIANT.t = 0; play('walk', {speed:.55}); } }
  else if(GIANT.state === 'amok'){
    const tgt = L2 && dp < 420 ? {x:player.x, z:player.z} : (GIANT.roam ||= {x:GIANT.lair.x + (Math.random() - .5) * 160, z:GIANT.lair.z + (Math.random() - .5) * 120});
    if(!L2 || dp >= 420){ GIANT.away += dt; if(Math.hypot(tgt.x - GIANT.x, tgt.z - GIANT.z) < 6) GIANT.roam = null; if(GIANT.away > (GIANT.awayMax || 45)){ GIANT.state = 'pulang'; play('walk', {speed:.55}); } } else GIANT.away = 0;
    const dx = tgt.x - GIANT.x, dz = tgt.z - GIANT.z, d = Math.hypot(dx, dz);
    GIANT.swing = Math.max(0, GIANT.swing - dt);
    if(GIANT.swingAnim > 0){ GIANT.swingAnim -= dt; if(!GIANT.hit && GIANT.swingAnim <= GIANT.swingLen * (1 - GIANT.impact)){ GIANT.hit = true; hammerImpact(); } if(GIANT.swingAnim <= 0) play('walk', {speed:.55}); }
    else if(d < 38 && GIANT.swing <= 0 && L2){ GIANT.swing = 7; GIANT.hit = false; GIANT.ry = Math.atan2(dx, dz); GIANT.swingLen = play('hammer', {loop:false, fade:.25}) || 1.6; GIANT.swingAnim = GIANT.swingLen; if(AU.ctx) tone(70, {type:'sawtooth', a:.6, d:.6, v:.12, filt:400, glide:160}); }
    else if(d > 22){ const sp = 9 * dt, nx = GIANT.x + dx / d * sp, nz = GIANT.z + dz / d * sp; if(Math.hypot(nx - CAVE.x, nz - CAVE.z) < CAVE.r - 20 && nivRegion(nx, nz) === 'lembah'){ GIANT.x = nx; GIANT.z = nz; } else GIANT.roam = null; moving = true;
      let a = Math.atan2(dx, dz) - GIANT.ry; a = Math.atan2(Math.sin(a), Math.cos(a)); GIANT.ry += a * (1 - Math.exp(-dt * 2));
      if((GIANT.t * .8 | 0) !== GIANT.step){ GIANT.step = GIANT.t * .8 | 0; if(dp < 160){ shake = Math.max(shake, .45 * (1 - dp / 160)); if(AU.ctx) tone(32, {d:.5, v:.35 * (1 - dp / 160), glide:24}); } } }
    if(Math.random() < dt * 1.5){ const hand = (GIANT.hand || procHammer).getWorldPosition(_gw); bolt(hand.clone(), hand.clone().add(new THREE.Vector3((Math.random() - .5) * 14, (Math.random() - .5) * 14, (Math.random() - .5) * 14)), Math.random() < .5 ? 0xfff2a0 : 0x9fd8ff, 3, .1); }
  }
  else if(GIANT.state === 'tunduk'){
    if(GIANT.act && GIANT.kneelHold && GIANT.act.time >= GIANT.kneelHold) GIANT.act.timeScale = 0;          // hold on one knee
    if(GIANT.t > 8){ GIANT.state = 'pulang'; GIANT.t = 0; if(GIANT.act) GIANT.act.timeScale = 1; play('walk', {speed:.5}); toast('Penjaga Gergasi pulang ke sarangnya. Rantai akan bersambung semula.', 'ok', 4000); }
  }
  else if(GIANT.state === 'pulang'){
    const dx = GIANT.lair.x - GIANT.x, dz = GIANT.lair.z - GIANT.z, d = Math.hypot(dx, dz);
    if(d > 2){ const sp = Math.min(d, 8 * dt); GIANT.x += dx / d * sp; GIANT.z += dz / d * sp; GIANT.ry = Math.atan2(dx, dz); moving = true; }
    else { GIANT.state = 'tidur'; GIANT.t = 0; GIANT.away = 0; GIANT.chainsOn = true; GIANT.near = 0; play('sit', {fade:.8});
      for(let i = 0; i < 16; i++){ const p = PILLARS[i % 2].top; bolt(p.clone(), new THREE.Vector3(GIANT.x, p.y - 20, GIANT.z), PURPLE, 4, .5); } }
  }
  GG.position.set(GIANT.x, giantY(GIANT.x, GIANT.z), GIANT.z); GG.rotation.y = GIANT.ry;
  if(GIANT.mixer && player.layer === 2) GIANT.mixer.update(dt);
  procPose(dt, t, moving); updateChains(t);
  const L2b = player.layer === 2 && dp < 600;
  if(GIANT.state === 'amok' || GIANT.state === 'bangun') setBoss(L2b || isOwner() ? (L2b ? 'PENJAGA GERGASI NIVELHAM · MENGAMOK' : 'NALURI · PENJAGA GERGASI MENGAMOK') : '', L2b ? 'Tukul Petir menghentam bumi. Hanya Haki Raja Agung (2) Eryth Sayf dapat menundukkannya.' : `Di Lembah Nivelham${GIANT.by ? ', dibangunkan oleh ' + esc(GIANT.by) : ''}. Tekan 2 · Haki Raja Agung untuk menundukkannya dari sini.`, 'amok');
  else if(GIANT.state === 'tunduk') setBoss(L2b ? 'PENJAGA GERGASI · TUNDUK' : '', 'Dia melutut kepada Eryth Sayf.', 'tunduk');
  else setBoss('');
});
fixedLabel('Penjaga Gergasi Nivelham<small>Tidur berantai · jangan dekati</small>', GIANT.lair.x, NVY + giantY(GIANT.lair.x, GIANT.lair.z) + 44, GIANT.lair.z, '#ffd27a', 260, 2);
EXPED.push({id:'gergasi', name:'Sarang Penjaga Gergasi', sub:'Lembah Nivelham · gergasi berantai', x:36, y:78, layer:2, to:[GIANT.lair.x + Math.sin(GIANT.face) * 75, GIANT.lair.z + Math.cos(GIANT.face) * 75]});

/* --- the Higgsfield giant: rig + clips (hammer swing, sit and doze, kneel); walk and roar reuse the avatar's clips --- */
function clipFits(clip, root){ const names = new Set(); root.traverse(o => names.add(o.name)); const tr = clip.tracks.map(t => t.name.split('.')[0]); return tr.filter(n => names.has(n)).length / Math.max(1, tr.length); }
// metalness off and a touch of self-light (emissive = his own texture) so he reads in the dim cavern
function setupGiantModel(gltf){
  const root = gltf.scene; root.traverse(o => { if(o.isMesh){ o.castShadow = true; o.frustumCulled = false; [].concat(o.material).forEach(m => { if('metalness' in m){ m.metalness = 0; m.roughness = .85; } if(m.map && 'emissive' in m){ m.emissiveMap = m.map; m.emissive = new THREE.Color(0xffffff); m.emissiveIntensity = .38; m.needsUpdate = true; } }); } });
  fitAvatar(root, GIANT.H); const holder = new THREE.Group(); holder.add(root); GG.add(holder); gProc.g.visible = false;
  GIANT.model = root; GIANT.mixer = new THREE.AnimationMixer(root); GIANT.bones = {};
  root.traverse(o => { if(o.isBone){ const k = ['LeftHand', 'RightHand', 'LeftFoot', 'RightFoot'].find(n => new RegExp(n + '$', 'i').test(o.name)); if(k && !GIANT.bones[k]) GIANT.bones[k] = o; } });
  if(gltf.animations?.[0]) GIANT.clips.hammer = gltf.animations[0];
  if(AV.clip && clipFits(AV.clip, root) > .5) GIANT.clips.walk = AV.clip;
  if(HAKI.clips.shout && clipFits(HAKI.clips.shout, root) > .5) GIANT.clips.roar = HAKI.clips.shout;
  GIANT.hand = GIANT.bones.RightHand || null; attachGiantHammer();
  if(GIANT.clips.hammer && GIANT.hand){            // find the smash frame: the hand's lowest point after it is raised highest
    const act = GIANT.mixer.clipAction(GIANT.clips.hammer); act.play(); const n = 40, D = GIANT.clips.hammer.duration, ys = [];
    for(let i = 0; i <= n; i++){ act.time = D * i / n; GIANT.mixer.update(0); root.updateMatrixWorld(true); ys.push(GIANT.hand.getWorldPosition(_gw).y); }
    const top = ys.indexOf(Math.max(...ys)); let low = top; for(let i = top; i <= n; i++) if(ys[i] < ys[low]) low = i; GIANT.impact = low / n > .85 || low / n < .3 ? .55 : low / n; act.stop(); }
  play(GIANT.state === 'tidur' ? 'sit' : 'walk', {speed:GIANT.state === 'tidur' ? 1 : .55});
}
function attachGiantHammer(){
  if(!GIANT.hand || !GIANT.hammerModel || GIANT.hammerOn) return; GIANT.hammerOn = true;
  const h = GIANT.hammerModel, ws = new THREE.Vector3(); GIANT.hand.getWorldScale(ws); h.scale.multiplyScalar(1 / ws.x); GIANT.hand.add(h);
}
