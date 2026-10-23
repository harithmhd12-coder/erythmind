'use strict';
/* ================= Gelanggang Marineford: the entry trial's battle with all eight =================
   Puma's paw throws the visitor into Marineford. A wide round arena rises out of the bay (for them only) and the seven
   admirals with Fleet Admiral Garp surround them and attack at once. Every opponent carries a life bar to empty:
   the admirals are moderate (Sederhana), the fleet admiral difficult (Sukar).
   The visitor fights with combat moves (Q tumbuk, a three-hit combo · R tendang pusing · Space elak), the white
   transformation (5 · Gear Putih: stronger, faster blows) and the giant fist (6 · Tumbukan Gergasi, in Gear Putih).
   Observation Haki (3) slows every attack's warning, Armament Haki (4) halves the damage taken.
   Each attack is marked by a red ring on the floor before the power lands; step out of it. Falling is not the end:
   the visitor gets up again, and the opponents still standing recover a little. When all eight are down, Garp sends
   them into the headquarters' Arkib Memori Terburuk (23-saringan.js continues from there). */
const ARENA = {x:BASE.x, z:BASE.z, r:96, y:3, on:false, rise:0};
const LVL = {
  sederhana:{name:'SEDERHANA', hp:140, dmg:11, every:[4.6, 6.8], tele:1.3, r:4.6, speed:5, dist:[18, 30], col:'#ffd23a'},
  sukar:{name:'SUKAR', hp:380, dmg:22, every:[3.0, 4.2], tele:1.0, r:6.8, speed:7, dist:[11, 18], col:'#ff4f45'},
};
const IMPACT = {magma:.9, ais:.7, cahaya:.75, graviti:1.6, hutan:.8, emas:1.5, lengan:.55, galaksi:.5};
const FIGHT = {on:false, foes:[], hp:100, max:100, t:0, warns:[], fist:0, kick:0, dodge:0, inv:0, combo:0, comboT:0, lastHit:0, won:false, falls:0, dash:null};

/* --- the arena: stone floor, rings, a glowing rim and pylons; it rises from the bay and sinks again --- */
const arenaG = grp(ARENA.x, -24, ARENA.z, scene); arenaG.visible = false;
{
  const R = ARENA.r, floorTex = texLoader.load('assets/tex/paving.jpg'); floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping; floorTex.repeat.set(26, 26); floorTex.anisotropy = 4;
  const floor = mesh(new THREE.CylinderGeometry(R, R * 1.03, 2, 96), new THREE.MeshStandardMaterial({color:0xb8bcc6, map:floorTex, roughness:.85, metalness:.05}), 0, ARENA.y - 1, 0, arenaG, false);
  floor.receiveShadow = true;
  mesh(new THREE.CylinderGeometry(R * 1.03, R * .8, 30, 64, 1, true), M(0x2a2e38, {metalness:.6, roughness:.4}), 0, ARENA.y - 17, 0, arenaG, false);
  const lineM = new THREE.MeshBasicMaterial({color:0xe9edf6, transparent:true, opacity:.55, side:THREE.DoubleSide});
  [.32, .66, .97].forEach(k => { const l = mesh(new THREE.RingGeometry(R * k - .6, R * k, 96), lineM, 0, ARENA.y + .03, 0, arenaG, false); l.rotation.x = -Math.PI / 2; });
  const emb = mesh(new THREE.CircleGeometry(R * .14, 6), new THREE.MeshBasicMaterial({color:0x1f3f7a, transparent:true, opacity:.75}), 0, ARENA.y + .04, 0, arenaG, false); emb.rotation.x = -Math.PI / 2;
  ARENA.rim = mesh(new THREE.TorusGeometry(R * 1.01, .5, 8, 120), new THREE.MeshBasicMaterial({color:0x6ab8ff, transparent:true, opacity:.8, blending:THREE.AdditiveBlending, depthWrite:false}), 0, ARENA.y + .6, 0, arenaG, false);
  ARENA.rim.rotation.x = Math.PI / 2;
  for(let i = 0; i < 8; i++){ const a = i / 8 * 6.283, x = Math.cos(a) * R * .99, z = Math.sin(a) * R * .99;
    mesh(new THREE.CylinderGeometry(1.1, 1.4, 16, 10), M(0xe9edf6, {metalness:.3, roughness:.5}), x, ARENA.y + 8, z, arenaG);
    mesh(new THREE.SphereGeometry(1.4, 12, 10), new THREE.MeshBasicMaterial({color:i % 2 ? 0x6ab8ff : 0xffd23a}), x, ARENA.y + 16.8, z, arenaG, false);
    const fl = mesh(new THREE.PlaneGeometry(4, 2.4), M(0x1f3f7a, {side:THREE.DoubleSide}), x + Math.cos(a) * -.1, ARENA.y + 13.5, z, arenaG, false); fl.rotation.y = -a; }
}
const _surfaceH_G = surfaceH;
surfaceH = function(x, z){ const h = _surfaceH_G(x, z); if(ARENA.on && ARENA.rise > .98 && Math.hypot(x - ARENA.x, z - ARENA.z) < ARENA.r) return Math.max(h, ARENA.y); return h; };
function arenaUp(on){
  ARENA.on = on; arenaG.visible = true;
  fleet.filter(f => f.moor).forEach(f => f.g.visible = !on);          // the anchored ships make way
  ARENA.anim = {up:on, t0:performance.now(), dur:on ? 2400 : 2000};       // wall-clock time: the same on a slow phone
  if(on){ ARENA.rise = 1; shake = 1; if(AU.ctx){ tone(40, {d:2.4, v:.4, glide:60}); noiseHit({d:2.2, v:.35, f:180, brown:true}); } }
  else ARENA.rise = 0;
}
anims.push(() => {
  const A = ARENA.anim; if(!A) return; const k = Math.min(1, (performance.now() - A.t0) / A.dur);
  arenaG.position.y = A.up ? lerp(-24, 0, 1 - Math.pow(1 - k, 3)) : lerp(0, -24, k);
  if(k >= 1){ if(!A.up) arenaG.visible = false; ARENA.anim = null; }
});
// the trial's arena is a training ground: nothing on the base is wrecked by blows that land there
const _craterG = worldDamage.crater; worldDamage.crater = function(at, layer){ if(FIGHT.on) return; return _craterG.call(this, at, layer); };

/* --- screen: life bar labels, three move buttons --- */
const kickBtn = document.createElement('button'); kickBtn.id = 'sarKick'; kickBtn.className = 'sarBtn'; kickBtn.type = 'button'; kickBtn.hidden = true; kickBtn.innerHTML = '<b>R</b>TENDANG'; document.body.appendChild(kickBtn);
const dodgeBtn = document.createElement('button'); dodgeBtn.id = 'sarDodge'; dodgeBtn.className = 'sarBtn'; dodgeBtn.type = 'button'; dodgeBtn.hidden = true; dodgeBtn.innerHTML = '<b>␣</b>ELAK'; document.body.appendChild(dodgeBtn);
kickBtn.addEventListener('click', () => fightKick()); dodgeBtn.addEventListener('click', () => fightDodge());
function hpLabel(f){
  if(!f.label) f.label = addLabel('', 'zone', () => FIGHT.on && f.c.g.visible ? f.c.g.position.clone().setY(f.c.g.position.y + f.c.h + 1.8) : null, {color:f.lvl.col, max:420});
  const pct = Math.max(0, f.hp / f.max * 100);
  f.label.el.innerHTML = `${esc(f.c.name)}<small>${f.down ? 'TUMBANG' : `${f.lvl.name} · ${Math.ceil(f.hp)} / ${f.max}`}</small><i class="hpb${f.down ? ' down' : ''}"><s style="width:${pct.toFixed(1)}%"></s></i>`;
}
function fightHud(){
  const down = FIGHT.foes.filter(f => f.down).length, pct = FIGHT.hp / FIGHT.max * 100;
  hud(`<i class="hpb me"><s style="width:${pct.toFixed(1)}%"></s></i> Nyawa kau ${Math.ceil(FIGHT.hp)} / ${FIGHT.max} · Tumbang ${down} / ${FIGHT.foes.length}${HAKI.gear > 0 ? ` · Gear Putih ${HAKI.gear.toFixed(0)} s` : ''}`);
}

/* --- start and end --- */
function startFight(){
  if(FIGHT.on) return;
  Object.assign(FIGHT, {on:true, hp:100, max:100, t:0, warns:[], fist:0, kick:0, dodge:0, inv:2, combo:0, comboT:0, lastHit:0, won:false, falls:0, dash:null});
  const all = [...ADMS.filter(c => !c.fleet), ADMS.find(c => c.fleet)];
  FIGHT.foes = all.map((c, i) => { const lvl = c.fleet ? LVL.sukar : LVL.sederhana, a = i / all.length * 6.283;
    c.fight = true; c.moving = false; c.g.visible = true; c.x = player.x + Math.cos(a) * 34; c.z = player.z + Math.sin(a) * 34; c.ry = Math.atan2(player.x - c.x, player.z - c.z);
    const f = {c, lvl, hp:lvl.hp, max:lvl.hp, cd:2 + i * .7 + Math.random(), down:false, side:i % 2 ? 1 : -1, kb:null}; hpLabel(f); return f; });
  sarFist.hidden = false; kickBtn.hidden = false; dodgeBtn.hidden = false; updateHakiHud();
  const g = FIGHT.foes.find(f => f.lvl === LVL.sukar).c;
  bubbleFor('lksfight', () => g.g.position.clone().setY(g.g.position.y + g.h + 3.2), 'Hahaha! Pelawat baharu? Kami semua akan menguji kau sekaligus!', 'owner');
  SAR.admiral = 'tujuh laksamana dan Fleet Admiral Garp';
  toast('Ketujuh-tujuh laksamana dan Fleet Admiral Garp mengepung kau! Keluar dari bulatan merah.', 'bad', 4500); fightHud();
}
function endFight(won){
  if(!FIGHT.on) return; FIGHT.on = false;
  FIGHT.warns.forEach(w => scene.remove(w.ring)); FIGHT.warns = [];
  FIGHT.foes.forEach(f => { const c = f.c; c.fight = false; c.x = c.home.x; c.z = c.home.z; c.tx = c.x; c.tz = c.z; });
  sarFist.hidden = true; kickBtn.hidden = true; dodgeBtn.hidden = true; arenaUp(false); updateHakiHud();
  if(won) stage3Memori();
}

/* --- the opponents --- */
const _fv = new THREE.Vector3();
function warnRing(f){
  const L = f.lvl, r = L.r, tele = L.tele + (HAKI.obs > 0 ? .6 : 0);
  const ring = new THREE.Mesh(new THREE.RingGeometry(r - .9, r, 48), new THREE.MeshBasicMaterial({color:f.c.fleet ? 0xff7a20 : 0xff3030, transparent:true, opacity:.6, side:THREE.DoubleSide, depthWrite:false}));
  ring.rotation.x = -Math.PI / 2; ring.position.set(player.x, ARENA.y + .08, player.z); scene.add(ring);
  const fill = new THREE.Mesh(new THREE.CircleGeometry(r - .9, 48), new THREE.MeshBasicMaterial({color:f.c.fleet ? 0xff7a20 : 0xff3030, transparent:true, opacity:.12, side:THREE.DoubleSide, depthWrite:false}));
  fill.rotation.x = -Math.PI / 2; fill.position.copy(ring.position).setY(ARENA.y + .07); scene.add(fill);
  FIGHT.warns.push({f, x:player.x, z:player.z, r, t:tele, ring, fill, cast:false});
  charAttack(f.c); if(AU.ctx) tone(f.c.fleet ? 380 : 520, {d:.4, v:.04, glide:900, type:'square', filt:1500});
}
function tickFoes(dt){
  const alive = FIGHT.foes.filter(f => !f.down);
  alive.forEach(f => {
    const c = f.c, L = f.lvl, dx = player.x - c.x, dz = player.z - c.z, d = Math.hypot(dx, dz) || 1;
    // keep their fighting distance, circling; spread out from each other; stay on the arena
    const want = (L.dist[0] + L.dist[1]) / 2 + Math.sin(FIGHT.t * .4 + c.i) * (L.dist[1] - L.dist[0]) / 2;
    let mx = (d - want) * dx / d * .5 + dz / d * f.side * 2.2, mz = (d - want) * dz / d * .5 - dx / d * f.side * 2.2;
    alive.forEach(o => { if(o === f) return; const ox = c.x - o.c.x, oz = c.z - o.c.z, od = Math.hypot(ox, oz); if(od < 9 && od > .01){ mx += ox / od * (9 - od) * .8; mz += oz / od * (9 - od) * .8; } });
    if(f.kb){ f.kb.t -= dt; c.x += f.kb.x * dt; c.z += f.kb.z * dt; if(f.kb.t <= 0) f.kb = null; }
    const ml = Math.hypot(mx, mz);
    if(ml > .4){ const sp = Math.min(ml, L.speed * dt); c.x += mx / ml * sp; c.z += mz / ml * sp; c.moving = true; } else c.moving = false;
    const ar = Math.hypot(c.x - ARENA.x, c.z - ARENA.z); if(ar > ARENA.r - 5){ c.x = ARENA.x + (c.x - ARENA.x) / ar * (ARENA.r - 5); c.z = ARENA.z + (c.z - ARENA.z) / ar * (ARENA.r - 5); }
    c.ry = Math.atan2(dx, dz);
    // attack: at most three admirals' warnings at a time; the fleet admiral does not wait his turn
    f.cd -= dt * (HAKI.obs > 0 ? .75 : 1);
    const busy = FIGHT.warns.filter(w => !w.f.c.fleet).length;
    if(f.cd <= 0 && (c.fleet || busy < 3)){ f.cd = L.every[0] + Math.random() * (L.every[1] - L.every[0]); warnRing(f); }
  });
  FIGHT.warns = FIGHT.warns.filter(w => {
    w.t -= dt; const k = Math.abs(Math.sin(FIGHT.t * 12)); w.ring.material.opacity = .35 + .4 * k; w.fill.material.opacity = .08 + .1 * k;
    if(!w.cast && w.t <= 0){ w.cast = true; w.left = IMPACT[w.f.c.power] || .7;
      POWER_FX[w.f.c.power](charChest(w.f.c), new THREE.Vector3(w.x, ARENA.y, w.z), w.f.c.fleet ? .95 : .6, null, 'me'); }
    if(w.cast){ w.left -= dt;
      if(w.left <= 0){ scene.remove(w.ring, w.fill);
        if(FIGHT.on && !FIGHT.won && FIGHT.inv <= 0 && Math.hypot(player.x - w.x, player.z - w.z) < w.r) hurt(w.f);
        return false; } }
    return true;
  });
}
function hurt(f){
  const dmg = f.lvl.dmg * (HAKI.arm > 0 ? .5 : 1) * (HAKI.gear > 0 ? .8 : 1);
  FIGHT.hp = Math.max(0, FIGHT.hp - dmg); FIGHT.lastHit = FIGHT.t; FIGHT.inv = .6; SAR.hitsTaken++;
  flash(f.c.fleet ? 'rgba(255,120,30,.7)' : 'rgba(255,60,60,.55)'); shake = Math.max(shake, f.c.fleet ? 1.2 : .7);
  const ax = player.x - f.c.x, az = player.z - f.c.z, al = Math.hypot(ax, az) || 1; const nx = player.x + ax / al * 4, nz = player.z + az / al * 4; if(canStand(nx, nz, 0)){ player.x = nx; player.z = nz; }
  toast(`Terkena ${f.c.kuasa.split(' · ')[0]} (${f.c.name})! −${Math.round(dmg)}`, 'bad', 1400);
  if(FIGHT.hp <= 0) fall();
  fightHud();
}
function fall(){
  FIGHT.falls++; FIGHT.hp = FIGHT.max; FIGHT.inv = 3; FIGHT.warns.forEach(w => scene.remove(w.ring, w.fill)); FIGHT.warns = [];
  FIGHT.foes.forEach(f => { if(f.down) return; f.hp = Math.min(f.max, f.hp + (f.max - f.hp) * .3); f.cd = 3 + Math.random() * 3; hpLabel(f); });
  player.x = ARENA.x + Math.cos(BASE.back) * 20; player.z = ARENA.z + Math.sin(BASE.back) * 20; flash('rgba(255,255,255,.8)');
  toast('Kau tumbang… dan bangkit semula. Mereka yang masih berdiri pulih sedikit. Teruskan!', 'bad', 4000);
}
function damageFoe(f, dmg, push){
  if(f.down || FIGHT.won) return; f.hp = Math.max(0, f.hp - dmg); blockFx(f.c);
  if(push){ const dx = f.c.x - player.x, dz = f.c.z - player.z, d = Math.hypot(dx, dz) || 1; f.kb = {x:dx / d * push * 4, z:dz / d * push * 4, t:.25}; }
  if(f.hp <= 0){ f.down = true; f.c.moving = false; boom(f.c.x, ARENA.y + 2, f.c.z, 0xffffff, 1.4); shake = Math.max(shake, .8);
    bubbleFor('lksdown' + f.c.id, () => f.c.g.position.clone().setY(f.c.g.position.y + f.c.h + 3), f.c.fleet ? 'Hahaha! Tumbukan yang bagus, budak!' : 'Hm… kau kuat.', 'owner');
    toast(`${f.c.name} TUMBANG! (${FIGHT.foes.filter(x => x.down).length} / ${FIGHT.foes.length})`, 'ok', 2600);
    // the defeated step back to the rim and watch
    const a = Math.atan2(f.c.z - ARENA.z, f.c.x - ARENA.x); f.c.tx = ARENA.x + Math.cos(a) * (ARENA.r - 4); f.c.tz = ARENA.z + Math.sin(a) * (ARENA.r - 4); }
  hpLabel(f);
  if(FIGHT.foes.every(x => x.down) && !FIGHT.won){ FIGHT.won = true; FIGHT.warns.forEach(w => scene.remove(w.ring, w.fill)); FIGHT.warns = [];
    const g = FIGHT.foes.find(x => x.c.fleet).c; bubbleFor('lksfight', () => g.g.position.clone().setY(g.g.position.y + g.h + 3.2), 'Kau layak. Masuklah ke Markas — Arkib Memori menunggu.', 'owner');
    toast('Semua laksamana dan Fleet Admiral Garp tumbang! Kau dibawa masuk ke Arkib Memori Terburuk.', 'ok', 5000); fightHud();
    setTimeout(() => FIGHT.on && endFight(true), 3500); }
}

/* --- the visitor's moves --- */
const mult = () => (HAKI.gear > 0 ? 1.8 : 1) * (HAKI.arm > 0 ? 1.3 : 1);
function strikeAnim(speed){
  const a = me.av; if(!a || !AV.atk) return;
  if(!a.atk){ a.atk = a.mixer.clipAction(AV.atk); a.atk.setLoop(THREE.LoopOnce, 1); a.atk.clampWhenFinished = true; }
  a.atk.reset(); a.atk.timeScale = speed; a.atk.weight = 1; a.atk.play(); a.strikeT = AV.atk.duration / speed;
}
function inFront(f, range, arc){
  const dx = f.c.x - player.x, dz = f.c.z - player.z, d = Math.hypot(dx, dz); if(d > range + 1.5) return false;
  const fw = forward(), dot = (dx * fw.x + dz * fw.z) / (d || 1); return d < 3 || dot > Math.cos(arc);
}
function nearestFoe(){ let best = null, bd = 1e9; FIGHT.foes.forEach(f => { if(f.down) return; const d = Math.hypot(f.c.x - player.x, f.c.z - player.z); if(d < bd){ bd = d; best = f; } }); return best; }
function fightPunch(){
  if(!FIGHT.on || SAR.paused || FIGHT.fist > 0) return;
  const gear = HAKI.gear > 0, range = gear ? 11 : 8, n = nearestFoe();
  if(n && Math.hypot(n.c.x - player.x, n.c.z - player.z) < range + 6) player.ry = Math.atan2(n.c.x - player.x, n.c.z - player.z);     // turn into the nearest one
  FIGHT.combo = FIGHT.t - FIGHT.comboT < 1 ? (FIGHT.combo + 1) % 3 : 0; FIGHT.comboT = FIGHT.t;
  const heavy = FIGHT.combo === 2, dmg = (heavy ? 13 : 7) * mult();
  FIGHT.fist = gear ? .3 : .45; strikeAnim(heavy ? 1.6 : 2.4);
  const o = worldOfPlayer().add(new THREE.Vector3(0, 1.6, 0)), fw = forward(), m = new THREE.Mesh(new THREE.SphereGeometry(gear ? .8 : .55, 12, 10), new THREE.MeshStandardMaterial({color:gear ? 0xffffff : 0x14141a, metalness:.6, roughness:.3, emissive:gear ? 0xffffff : 0x3a0a2a, emissiveIntensity:.5}));
  addFx(m, .16, (q, k) => q.position.copy(o).addScaledVector(fw, k * range));
  let hit = 0; FIGHT.foes.forEach(f => { if(!f.down && inFront(f, range, .7)){ damageFoe(f, dmg, heavy ? 1.5 : .5); hit++; } });
  if(AU.ctx){ if(hit) noiseHit({d:.18, v:.3, f:heavy ? 400 : 700, brown:true}); else noiseHit({d:.1, v:.08, f:1200, type:'bandpass'}); }
  if(heavy && hit) shake = Math.max(shake, .5);
}
function fightKick(){
  if(!FIGHT.on || SAR.paused) return; if(FIGHT.kick > 0) return toast(`Tendangan sedang dicas (${FIGHT.kick.toFixed(1)} s).`, 'bad', 1000);
  const gear = HAKI.gear > 0, rad = gear ? 14 : 10; FIGHT.kick = gear ? 1.8 : 2.6; strikeAnim(1.8);
  const o = worldOfPlayer().add(new THREE.Vector3(0, 1.2, 0)), ring = new THREE.Mesh(new THREE.TorusGeometry(1, .25, 6, 48), new THREE.MeshBasicMaterial({color:gear ? 0xffffff : 0xcfd8ff, transparent:true, opacity:.85, blending:THREE.AdditiveBlending, depthWrite:false}));
  ring.rotation.x = Math.PI / 2; ring.position.copy(o); addFx(ring, .35, (q, k) => { q.scale.setScalar(1 + k * rad); q.material.opacity = .85 * (1 - k); });
  addFx(new THREE.Object3D(), .35, (q, k) => { me.g.rotation.y = player.ry + k * Math.PI * 2; });
  FIGHT.foes.forEach(f => { if(!f.down && Math.hypot(f.c.x - player.x, f.c.z - player.z) < rad + 1.5) damageFoe(f, 12 * mult(), 2); });
  if(AU.ctx) noiseHit({d:.3, v:.25, f:600, type:'bandpass'});
}
function fightDodge(){
  if(!FIGHT.on || SAR.paused || FIGHT.dodge > 0) return;
  FIGHT.dodge = 1.1; FIGHT.inv = Math.max(FIGHT.inv, .45);
  let dir = forward(); if(!player.moving){ const n = nearestFoe(); if(n){ dir = new THREE.Vector3(player.x - n.c.x, 0, player.z - n.c.z).normalize(); } }
  FIGHT.dash = {dx:dir.x, dz:dir.z, t:.22};
  for(let i = 0; i < 3; i++) later(i * .06, () => { const gh = new THREE.Mesh(new THREE.SphereGeometry(.9, 10, 8), new THREE.MeshBasicMaterial({color:0xbfe8ff, transparent:true, opacity:.4, depthWrite:false}));
    gh.position.copy(worldOfPlayer()).add(new THREE.Vector3(0, 1.4, 0)); gh.scale.set(.7, 1.6, .7); addFx(gh, .4, (q, k) => q.material.opacity = .4 * (1 - k)); });
  if(AU.ctx) noiseHit({d:.2, v:.12, f:2000, type:'highpass'});
}
// the giant fist (6) lands about 70 steps ahead: everything near its path or its landing takes it
POWER_HOOKS.push((id, o, isMine) => {
  if(!FIGHT.on || !isMine || id !== 'tumbuk') return;
  const fw = forward(), ox = o.x, oz = o.z, tx = ox + fw.x * 70, tz = oz + fw.z * 70;
  setTimeout(() => { if(!FIGHT.on) return;
    FIGHT.foes.forEach(f => { const ax = f.c.x - ox, az = f.c.z - oz, along = clamp(ax * fw.x + az * fw.z, 0, 70), miss = Math.hypot(f.c.x - (ox + fw.x * along), f.c.z - (oz + fw.z * along));
      if(miss < 22 || Math.hypot(f.c.x - tx, f.c.z - tz) < 40) damageFoe(f, 55 * (HAKI.arm > 0 ? 1.3 : 1), 4); }); }, 1950);
});

/* --- per frame --- */
anims.push((t, dt) => {
  // the defeated walk back to the rim
  FIGHT.foes.forEach(f => { if(!f.down || !FIGHT.on) return; const c = f.c, dx = c.tx - c.x, dz = c.tz - c.z, d = Math.hypot(dx, dz);
    if(d > .8){ const sp = Math.min(d, 4 * dt); c.x += dx / d * sp; c.z += dz / d * sp; c.moving = true; c.ry = Math.atan2(dx, dz); } else { c.moving = false; c.ry = Math.atan2(ARENA.x - c.x, ARENA.z - c.z); } });
  if(ARENA.on){ ARENA.rim.material.opacity = .55 + Math.sin(t * 3) * .25; }
  if(!FIGHT.on) return;
  FIGHT.fist = Math.max(0, FIGHT.fist - dt); FIGHT.kick = Math.max(0, FIGHT.kick - dt); FIGHT.dodge = Math.max(0, FIGHT.dodge - dt); FIGHT.inv = Math.max(0, FIGHT.inv - dt);
  sarFist.classList.toggle('cool', FIGHT.fist > 0); kickBtn.classList.toggle('cool', FIGHT.kick > 0); dodgeBtn.classList.toggle('cool', FIGHT.dodge > 0);
  kickBtn.querySelector('b').textContent = FIGHT.kick > 0 ? FIGHT.kick.toFixed(1) : 'R';
  if(FIGHT.dash){ const D = FIGHT.dash; D.t -= dt; const nx = player.x + D.dx * 50 * dt, nz = player.z + D.dz * 50 * dt; if(canStand(nx, nz, 0)){ player.x = nx; player.z = nz; } if(D.t <= 0) FIGHT.dash = null; }
  if(player.layer !== 0 || !canStand(player.x, player.z, 0)){ setLayer(0); player.x = ARENA.x; player.z = ARENA.z; }
  if(ride) endRide('Kenderaan tidak dibenarkan di gelanggang.');
  if(SAR.paused || FIGHT.won) return;
  FIGHT.t += dt;
  if(FIGHT.t - FIGHT.lastHit > 5) FIGHT.hp = Math.min(FIGHT.max, FIGHT.hp + dt * 1.5);          // a breather heals a little
  tickFoes(dt);
  if((t * 4 | 0) !== FIGHT.hudT){ FIGHT.hudT = t * 4 | 0; fightHud(); }
});
// keys: Q is the punch (through sarPunch), R kick, Space dodge
const _sarPunchG = sarPunch;
sarPunch = function(){ if(FIGHT.on) return fightPunch(); return _sarPunchG(); };
addEventListener('keydown', e => {
  if(!FIGHT.on || typing() || !$('#panel').hidden || e.repeat) return;
  if(e.code === 'KeyR'){ fightKick(); e.preventDefault(); }
  if(e.code === 'Space'){ fightDodge(); e.preventDefault(); }
});
// in the arena every visitor may use the white transformation and the giant fist
const _allowedPowersG = allowedPowers;
allowedPowers = function(){ const a = _allowedPowersG(); if(!FIGHT.on) return a; return [...new Set([...a, 'gearputih', 'tumbuk'])]; };
const _lockG = lock;
lock = function(msg){ if(FIGHT.on){ FIGHT.foes.forEach(f => f.c.fight = false); FIGHT.on = false; FIGHT.warns.forEach(w => scene.remove(w.ring, w.fill)); FIGHT.warns = []; kickBtn.hidden = dodgeBtn.hidden = true; arenaUp(false); } return _lockG(msg); };
