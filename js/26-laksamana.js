'use strict';
/* ================= Laksamana Marineford: seven admirals and a fleet admiral guard the Pangkalan Laut =================
   1. The guard: seven admirals stand watch on the crescent in front of the headquarters and patrol it; the fleet
      admiral holds the centre. Magma, Ais, Cahaya, Graviti, Hutan, Gergasi Emas and Lengan Hitam, led by the
      Tinju Galaksi of the fleet admiral.
   2. Every week (Saturday 21:00 MYT) five great intruders cross the bay: the Blue Dragon warlord, the pirate queen
      with her sun and thunder clouds, the old quake captain, the darkness pirate and the surgeon of the blue Room.
      The admirals stop every one of them before the plaza. Missed invasions are logged as repelled.
   3. The owner may take any admiral's power (Tetapan · Kuasa Laksamana) as an extra slot or in place of one of the
      Haki slots; untouched, the owner's powers stay as they are. Every one of these powers can bring the Nivelham
      giant down.
   4. The entry trial (23-saringan.js): after Puma's paw lands a visitor in the Arkib Memori Terburuk, an admiral is
      waiting there; the visitor must beat him before giving memories to the dementors.
   Adjusted from the reference: no alcohol for the dragon warlord, the pirate queen's clouds are weather, not stolen
   souls, and the golden giant is simply a giant of light, with no religious form. */
const LKS = {chars:[], byId:{}, inv:{on:false}, history:LS.get('erythmind.serbuan', []), models:{}, loaded:false, duel:null};
const ADM_DEF = [
  {id:'magma', name:'Laksamana Akainu', power:'magma', kuasa:'Magma · Tinju Gunung Berapi', col:'#ff5a1a', h:6.4, proc:{coat:0xf4f2ec, pants:0x6a1418, shirt:0x8a1c20, skin:0xc99a78, hair:0x1a1410}},
  {id:'ais', name:'Laksamana Aokiji', power:'ais', kuasa:'Ais · Zaman Ais', col:'#9fe8ff', h:6.9, proc:{coat:0xf4f2ec, pants:0xf0f0ea, shirt:0x7fb2ff, skin:0xb8865e, hair:0x14100c}},
  {id:'cahaya', name:'Laksamana Kizaru', power:'cahaya', kuasa:'Cahaya · Hujan Peluru Cahaya', col:'#ffe46a', h:6.6, proc:{coat:0xf4f2ec, pants:0xe8c23a, shirt:0x6a3aa0, skin:0xd9a77f, hair:0x2a2018}},
  {id:'graviti', name:'Laksamana Fujitora', power:'graviti', kuasa:'Graviti · Meteor Graviti', col:'#b07aff', h:6.3, proc:{coat:0xf4f2ec, pants:0x3a2458, shirt:0x4a2a6a, skin:0xb8865e, hair:0x1a1410}},
  {id:'hutan', name:'Laksamana Ryokugyu', power:'hutan', kuasa:'Hutan · Akar Belit Rimba', col:'#5fd06a', h:6.5, proc:{coat:0xf4f2ec, pants:0x2a4a2a, shirt:0x3a5a2a, skin:0xc99a78, hair:0x3a6a2a}},
  {id:'emas', name:'Laksamana Sengoku', power:'emas', kuasa:'Gergasi Emas · Gelombang Tapak Emas', col:'#ffc23a', h:6.4, proc:{coat:0xf4f2ec, pants:0x1a1c24, shirt:0xd8b040, skin:0xc99a78, hair:0x3a3a3a}},
  {id:'lengan', name:'Laksamana Zephyr', power:'lengan', kuasa:'Lengan Hitam · Tumbukan Penghancur', col:'#8a8aa8', h:6.6, proc:{coat:0xf4f2ec, pants:0x1a1c24, shirt:0x22242c, skin:0xc99a78, hair:0x6a5a8a}},
];
const FLEET_DEF = {id:'garp', name:'Fleet Admiral Garp', power:'galaksi', kuasa:'Tinju Galaksi', col:'#ffffff', h:7.2, fleet:true, proc:{coat:0xf4f2ec, pants:0xf0f0ea, shirt:0x2a8a8a, skin:0xc99a78, hair:0x9a9a9a}};
const INV_DEF = [
  {id:'kaido', name:'Kaido', title:'Maharaja Naga Biru', power:'naga', kuasa:'Nafas Naga Biru · Gada Petir', col:'#6ab8ff', h:13, hp:170, vs:['magma', 'hutan'], proc:{coat:0x4a2a6a, pants:0x2a1a3a, shirt:0xe8e0d0, skin:0xc99a78, hair:0x14100c}},
  {id:'bigmom', name:'Big Mom', title:'Ratu Lanun · Awan Matahari & Petir', power:'matahari', kuasa:'Awan Matahari · Awan Petir', col:'#ff7ab0', h:12, hp:160, vs:['ais', 'emas'], proc:{coat:0xd02a2a, pants:0xd02a2a, shirt:0xf4f2ec, skin:0xe0b090, hair:0xff8ac0}},
  {id:'whitebeard', name:'Whitebeard', title:'Kapten Gempa', power:'gempa', kuasa:'Gempa · Gelembung Gegaran', col:'#f4f6fa', h:12, hp:180, vs:['garp'], proc:{coat:0xf4f2ec, pants:0x1a1c24, shirt:0x22242c, skin:0xc99a78, hair:0xf4f4f4}},
  {id:'blackbeard', name:'Blackbeard', title:'Lanun Kegelapan', power:'gelap', kuasa:'Kegelapan · Lubang Hitam', col:'#8a5aff', h:7, hp:150, vs:['graviti', 'lengan'], proc:{coat:0x1a1a22, pants:0x2a2a30, shirt:0xe8e0d0, skin:0x8a6a4a, hair:0x0a0a0a}},
  {id:'law', name:'Trafalgar Law', title:'Pakar Bedah · Bilik Biru', power:'bilik', kuasa:'Bilik Biru · Tukar Tempat', col:'#6fd8ff', h:6.5, hp:130, vs:['cahaya'], proc:{coat:0x14161c, pants:0x3a4a6a, shirt:0xe8e0d0, skin:0xd9a77f, hair:0x14100c}},
];
const POWER_INFO = Object.fromEntries([...ADM_DEF, FLEET_DEF].map(d => [d.power, {name:d.kuasa, by:d.name, col:d.col}]));

/* --- where they stand: the admirals' line on the crescent between Oris Plaza and the headquarters --- */
const LINE_R = 163.5, FRONT_R = 162.5, INV_R = 118;           // the quay edge, in front of the troops in Oris Plaza
const lineSpot = (i, n, r = LINE_R, gap = 13) => { const t = (i - (n - 1) / 2) * gap, a = BASE.back + t / r; return [bx(a, r), bz(a, r)]; };
const lksGround = (x, z) => Math.max(surfaceH(x, z), .4);

/* --- characters: a light procedural body until the Higgsfield model arrives --- */
function makeChar(def, side, i){
  const g = grp(0, -500, 0, scene); g.visible = false;
  const proc = makePerson(def.proc); proc.g.scale.setScalar(def.h / 3.1); g.add(proc.g);
  if(side === 'adm') mesh(new THREE.BoxGeometry(1.5, 1.3, .08), M(0xf4f2ec), 0, 1.55, -.34, proc.g, false);            // the white cape
  const c = Object.assign({}, def, {side, i, g, proc, x:0, z:0, ry:0, moving:false, model:null, mixer:null, act:null, wait:Math.random() * 4, tx:0, tz:0, cd:2 + Math.random() * 3, block:0, glow:null});
  c.label = addLabel(`${esc(def.name)}<small>${esc(def.title || def.kuasa)}</small>`, 'zone', () => g.visible && (side === 'inv' || near(c, 120)) ? g.position.clone().setY(g.position.y + def.h + 1.3) : null, {color:def.col, max:side === 'inv' ? 420 : 120});
  LKS.chars.push(c); LKS.byId[def.id] = c; return c;
}
const near = (c, d) => Math.hypot(camera.position.x - c.x, camera.position.z - c.z) < d;
ADM_DEF.forEach((d, i) => makeChar(d, 'adm', i)); makeChar(FLEET_DEF, 'adm', 7); INV_DEF.forEach((d, i) => makeChar(d, 'inv', i));
const ADMS = LKS.chars.filter(c => c.side === 'adm'), INVS = LKS.chars.filter(c => c.side === 'inv');
// home spots: the seven in a line, the fleet admiral a step ahead in the middle
ADMS.forEach(c => { const [x, z] = c.fleet ? lineSpot(0, 1) : lineSpot(c.i < 4 ? c.i : c.i + 1, 8); c.home = {x, z}; c.x = x; c.z = z; c.tx = x; c.tz = z; c.ry = faceRot(BASE.face) + Math.PI; });

/* ================= power effects (shared by the admirals, the intruders, the owner and the trial) ================= */
const lksBall = () => new THREE.SphereGeometry(1, 14, 10);
const addMat = (c, o = 1) => new THREE.MeshBasicMaterial({color:c, transparent:true, opacity:o, blending:THREE.AdditiveBlending, depthWrite:false});
const solidMat = (c, o = 1) => new THREE.MeshBasicMaterial({color:c, transparent:o < 1, opacity:o, depthWrite:o >= 1});
const later = (s, fn) => setTimeout(fn, s * 1000);
const _lv = new THREE.Vector3();
function lksSound(kind){
  if(!AU.ctx) return;
  if(kind === 'boom'){ tone(55, {d:1.2, v:.25, glide:30}); noiseHit({d:.8, v:.3, f:300, brown:true}); }
  else if(kind === 'zap'){ tone(1600, {d:.25, v:.05, glide:400, type:'sawtooth', filt:3500}); }
  else if(kind === 'ice'){ noiseHit({d:.5, v:.12, f:5000, type:'highpass'}); tone(1200, {d:.4, v:.04, glide:2400}); }
  else if(kind === 'quake'){ tone(30, {d:2, v:.5, glide:20}); noiseHit({d:1.6, v:.45, f:140, brown:true}); }
  else if(kind === 'whoosh'){ noiseHit({d:.5, v:.15, f:900, type:'bandpass'}); }
}
// impact on the ground or the sea at `to`, scaled
function impactAt(to, col, s){ boom(to.x, to.y + 1, to.z, col, 1.4 * s); shockwave(to, 14 * s); lksSound('boom'); }
const POWER_FX = {
  // Magma: a rain of molten fists from the sky
  magma(from, to, s, hit){
    for(let k = 0; k < 6; k++) later(k * .16, () => {
      const p = to.clone().add(_lv.set((Math.random() - .5) * 10 * s, 0, (Math.random() - .5) * 10 * s)), top = p.clone().add(new THREE.Vector3(-8, 70, -8));
      const g = new THREE.Group(); const core = new THREE.Mesh(lksBall(), solidMat(0xff7a20)), glow = new THREE.Mesh(lksBall(), addMat(0xff3a00, .6)); glow.scale.setScalar(1.8); g.add(core, glow); g.scale.setScalar(1.6 * s);
      addFx(g, .7, (o, k2) => { o.position.lerpVectors(top, p, k2 * k2); if(k2 >= 1) boom(p.x, p.y + 1, p.z, 0xff5a10, 1.1 * s); });
    });
    later(.9, () => { impactAt(to, 0xff5a10, s); const lava = new THREE.Mesh(new THREE.CircleGeometry(1, 24), addMat(0xff4a00, .8)); lava.rotation.x = -Math.PI / 2; lava.position.copy(to).setY(to.y + .3);
      addFx(lava, 3, (o, k) => { o.scale.setScalar(9 * s * Math.min(1, k * 5)); o.material.opacity = .8 * (1 - k); }); hit && hit(); });
    lksSound('whoosh');
  },
  // Ais: a road of ice spikes running to the target, frost at the end
  ais(from, to, s, hit){
    const d = _lv.subVectors(to, from).setY(0), len = d.length(); d.normalize(); const dir = d.clone();
    for(let k = 1; k <= 9; k++) later(k * .07, () => {
      const p = from.clone().addScaledVector(dir, len * k / 9); p.y = to.y + (from.y - to.y) * (1 - k / 9) * .2;
      const sp = new THREE.Mesh(new THREE.ConeGeometry(1, 1, 6), new THREE.MeshStandardMaterial({color:0xcff4ff, emissive:0x3a8ab8, emissiveIntensity:.6, roughness:.1, metalness:.1, transparent:true, opacity:.9}));
      sp.position.copy(p); sp.rotation.set((Math.random() - .5) * .5, Math.random() * 3, (Math.random() - .5) * .5); const h = (3 + k * .6) * s;
      addFx(sp, 3, (o, k2) => { const g2 = Math.min(1, k2 * 10); o.scale.set(1.1 * s * (k2 > .8 ? (1 - k2) * 5 : 1), h * g2, 1.1 * s); o.position.y = p.y + h * g2 / 2; });
    });
    later(.7, () => { const fr = new THREE.Mesh(new THREE.CircleGeometry(1, 28), addMat(0xbff0ff, .7)); fr.rotation.x = -Math.PI / 2; fr.position.copy(to).setY(to.y + .25);
      addFx(fr, 3.5, (o, k) => { o.scale.setScalar(12 * s * Math.min(1, k * 4)); o.material.opacity = .7 * (1 - k); }); boom(to.x, to.y + 1, to.z, 0xbff0ff, 1.2 * s); hit && hit(); });
    lksSound('ice');
  },
  // Cahaya: a storm of light bullets
  cahaya(from, to, s, hit){
    for(let k = 0; k < 14; k++) later(k * .05, () => {
      const a = from.clone().add(_lv.set((Math.random() - .5) * 3, (Math.random() - .5) * 2, (Math.random() - .5) * 3)), b = to.clone().add(new THREE.Vector3((Math.random() - .5) * 8 * s, Math.random() * 2, (Math.random() - .5) * 8 * s));
      const m = new THREE.Mesh(lksBall(), addMat(0xfff3a0)); m.scale.setScalar(.45 * s);
      addFx(m, .22, (o, k2) => { o.position.lerpVectors(a, b, k2); if(k2 >= 1) boom(b.x, b.y, b.z, 0xffe46a, .5 * s); });
      if(k % 3 === 0) bolt(a, b, 0xffe46a, 0, .12, 2);
    });
    later(.75, () => { flash('rgba(255,240,170,.35)'); hit && hit(); });
    lksSound('zap');
  },
  // Graviti: a meteor pulled out of the sky, the ground pressed flat around it
  graviti(from, to, s, hit){
    const top = to.clone().add(new THREE.Vector3(30, 120, -20)), g = new THREE.Group();
    const rock = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), new THREE.MeshStandardMaterial({color:0x3a3036, roughness:.9, emissive:0x2a0a40, emissiveIntensity:.6})), aura = new THREE.Mesh(lksBall(), addMat(0x9a5aff, .45)); aura.scale.setScalar(1.35); g.add(rock, aura); g.scale.setScalar(5 * s);
    addFx(g, 1.6, (o, k) => { o.position.lerpVectors(top, to, k * k); o.rotation.x += .05; o.rotation.z += .03; });
    for(let k = 0; k < 3; k++) later(k * .45, () => { const r = new THREE.Mesh(new THREE.TorusGeometry(1, .2, 6, 40), addMat(0xb07aff, .8)); r.rotation.x = Math.PI / 2; r.position.copy(to).setY(to.y + 12);
      addFx(r, .8, (o, k2) => { o.scale.setScalar((16 - k2 * 10) * s); o.position.y = to.y + 12 - k2 * 11; o.material.opacity = .8 * (1 - k2); }); });
    later(1.6, () => { impactAt(to, 0x9a5aff, 1.5 * s); shake = Math.max(shake, .9); hit && hit(); });
    lksSound('whoosh');
  },
  // Hutan: vines burst out of the ground and bind the target
  hutan(from, to, s, hit){
    for(let k = 0; k < 7; k++){
      const a = k / 7 * 6.283, p = to.clone().add(new THREE.Vector3(Math.cos(a) * 3 * s, 0, Math.sin(a) * 3 * s));
      const v = new THREE.Mesh(new THREE.CylinderGeometry(.25, .55, 1, 6), new THREE.MeshStandardMaterial({color:0x3a7a2a, roughness:.8, emissive:0x0a2a0a}));
      const h = (8 + Math.random() * 5) * s;
      addFx(v, 3.2, (o, k2) => { const g2 = Math.min(1, k2 * 4) * (k2 > .85 ? (1 - k2) / .15 : 1); o.scale.set(s, h * g2 + .01, s); o.position.set(p.x + Math.sin(k2 * 6 + k) * .6, p.y + h * g2 / 2, p.z + Math.cos(k2 * 6 + k) * .6);
        o.rotation.set(Math.cos(a) * -.35, 0, Math.sin(a) * .35); });
    }
    later(.2, () => { for(let k = 0; k < 16; k++){ const l = new THREE.Mesh(new THREE.PlaneGeometry(.6, .4), new THREE.MeshBasicMaterial({color:0x6ad04a, side:THREE.DoubleSide, transparent:true}));
      const p = to.clone().add(new THREE.Vector3((Math.random() - .5) * 8 * s, 2 + Math.random() * 8 * s, (Math.random() - .5) * 8 * s)); l.position.copy(p);
      addFx(l, 2.4, (o, k2) => { o.rotation.y += .1; o.rotation.x += .07; o.position.y = p.y - k2 * 4; o.material.opacity = 1 - k2; }); } });
    later(.8, () => { boom(to.x, to.y + 2, to.z, 0x5fd06a, 1 * s); hit && hit(); });
    if(AU.ctx){ noiseHit({d:.9, v:.15, f:400, brown:true}); tone(90, {d:.8, v:.08, glide:60}); }
  },
  // Gergasi Emas: the caster grows into a giant of golden light and pushes a palm of light outward
  emas(from, to, s, hit, caster){
    const gi = makePerson({holo:true}); gi.g.traverse(o => { if(o.isMesh) o.material = addMat(0xffc23a, .32); });
    const base = from.clone().setY(from.y - 2.5), H = 26 * s; gi.g.position.copy(base); gi.g.rotation.y = Math.atan2(to.x - from.x, to.z - from.z);
    addFx(gi.g, 2.6, (o, k) => { const g2 = Math.min(1, k * 3); o.scale.setScalar(H / 3.1 * g2 + .01); o.traverse(m => { if(m.isMesh) m.material.opacity = .32 * (k > .75 ? (1 - k) * 4 : 1); }); });
    later(.9, () => {
      const dir = _lv.subVectors(to, from).setY(0).normalize().clone(), palm = new THREE.Mesh(new THREE.CircleGeometry(1, 32), addMat(0xffd24a, .75)); palm.material.side = THREE.DoubleSide;
      const a = from.clone().setY(from.y + 8 * s); palm.lookAt(dir);
      addFx(palm, .6, (o, k) => { o.position.lerpVectors(a, to.clone().setY(to.y + 4), k); o.scale.setScalar(6 * s + k * 8 * s); o.lookAt(o.position.clone().add(dir)); o.material.opacity = .75 * (1 - k * .5); });
      later(.6, () => { impactAt(to, 0xffc23a, 1.6 * s); flash('rgba(255,214,90,.4)'); hit && hit(); });
    });
    if(AU.ctx){ tone(220, {d:1.4, v:.08, glide:440}); tone(330, {t:.1, d:1.2, v:.06}); }
  },
  // Lengan Hitam: a black armoured fist fired like a shell
  lengan(from, to, s, hit){
    const g = new THREE.Group(), f = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.4, 2), new THREE.MeshStandardMaterial({color:0x14141a, metalness:.9, roughness:.25, emissive:0x2a0a3a, emissiveIntensity:.5})), aura = new THREE.Mesh(lksBall(), addMat(0x6a2aff, .35));
    aura.scale.setScalar(1.6); g.add(f, aura); g.scale.setScalar(1.8 * s); const a = from.clone().setY(from.y + 2);
    addFx(g, .55, (o, k) => { o.position.lerpVectors(a, to, k); o.lookAt(to); if(Math.random() < .8) bolt(o.position.clone(), o.position.clone().add(new THREE.Vector3((Math.random() - .5) * 4, (Math.random() - .5) * 4, (Math.random() - .5) * 4)), Math.random() < .5 ? 0x6a2aff : 0x14141a, .6, .08); });
    later(.55, () => { impactAt(to, 0x6a2aff, 1.3 * s); hit && hit(); });
    lksSound('whoosh');
  },
  // Tinju Galaksi: the fleet admiral's fist, a shock that throws a galaxy of sparks
  galaksi(from, to, s, hit){
    const g = new THREE.Group(), f = new THREE.Mesh(lksBall(), new THREE.MeshStandardMaterial({color:0x101014, metalness:.8, roughness:.3, emissive:0x1a0a3a, emissiveIntensity:.6})); f.scale.set(1.3, 1.1, 1.5); g.add(f); g.scale.setScalar(2.4 * s);
    const a = from.clone().setY(from.y + 3);
    addFx(g, .5, (o, k) => { o.position.lerpVectors(a, to, k); if(Math.random() < .9) bolt(o.position.clone(), o.position.clone().add(new THREE.Vector3((Math.random() - .5) * 6, (Math.random() - .5) * 6, (Math.random() - .5) * 6)), Math.random() < .5 ? 0x9a5aff : 0x14141a, 1, .08); });
    later(.5, () => {
      const dark = new THREE.Mesh(lksBall(), new THREE.MeshBasicMaterial({color:0x0a0618, transparent:true, opacity:.8, depthWrite:false})); dark.position.copy(to);
      addFx(dark, 1.4, (o, k) => { o.scale.setScalar(2 + k * 30 * s); o.material.opacity = .8 * (1 - k); });
      for(let k = 0; k < 40; k++){ const st = new THREE.Mesh(lksBall(), addMat(k % 3 ? 0x9fb8ff : 0xff9ae0)); const a2 = Math.random() * 6.283, r = 6 + Math.random() * 30 * s, sp = (Math.random() - .5) * 2;
        addFx(st, 2, (o, k2) => { const ang = a2 + k2 * 3 * sp; o.position.set(to.x + Math.cos(ang) * r * Math.min(1, k2 * 3), to.y + 2 + Math.sin(k2 * 3 + k) * 4, to.z + Math.sin(ang) * r * Math.min(1, k2 * 3)); o.scale.setScalar(.35 * (1 - k2) + .02); }); }
      impactAt(to, 0x9a5aff, 2.2 * s); shake = Math.max(shake, 1.4); flash('rgba(140,100,255,.4)'); lksSound('quake'); hit && hit();
    });
  },
  // the intruders
  naga(from, to, s, hit){                                     // blue dragon breath, then a club of lightning
    const a = from.clone().setY(from.y + 4 * s);
    for(let k = 0; k < 16; k++) later(k * .05, () => { const m = new THREE.Mesh(lksBall(), addMat(k % 2 ? 0x4a9aff : 0xbfe8ff, .85)); const b = to.clone().add(new THREE.Vector3((Math.random() - .5) * 6, Math.random() * 3, (Math.random() - .5) * 6));
      addFx(m, .45, (o, k2) => { o.position.lerpVectors(a, b, k2); o.scale.setScalar((1 + k2 * 3) * s); o.material.opacity = .85 * (1 - k2 * .6); }); });
    later(.9, () => { for(let k = 0; k < 6; k++){ const t2 = to.clone().add(new THREE.Vector3((Math.random() - .5) * 10, 0, (Math.random() - .5) * 10)); bolt(t2.clone().setY(t2.y + 60), t2, 0xbfe8ff, 6, .3, 2); } boom(to.x, to.y + 1, to.z, 0x4a9aff, 1.4 * s); lksSound('zap'); hit && hit(); });
    if(AU.ctx) noiseHit({d:1, v:.2, f:700, type:'bandpass'});
  },
  matahari(from, to, s, hit){                                 // a small sun hurled from above, a thundercloud over the target
    const a = from.clone().setY(from.y + 9 * s), sun = new THREE.Mesh(lksBall(), addMat(0xffa020)); const halo = new THREE.Mesh(lksBall(), addMat(0xff6a00, .4)); halo.scale.setScalar(1.6); sun.add(halo);
    addFx(sun, .9, (o, k) => { o.position.lerpVectors(a, to, k).setY(lerp(a.y, to.y, k) + Math.sin(k * Math.PI) * 10); o.scale.setScalar(3 * s); });
    const cloud = new THREE.Mesh(lksBall(), new THREE.MeshBasicMaterial({color:0x2a2a36, transparent:true, opacity:.85, depthWrite:false})); cloud.position.copy(to).setY(to.y + 22); cloud.scale.set(9 * s, 3 * s, 9 * s);
    addFx(cloud, 2.2, (o, k) => { o.material.opacity = .85 * (k > .8 ? (1 - k) * 5 : Math.min(1, k * 5)); if(k > .35 && Math.random() < .3) bolt(o.position.clone(), to.clone().add(new THREE.Vector3((Math.random() - .5) * 8, 0, (Math.random() - .5) * 8)), 0xfff2a0, 4, .15, 2); });
    later(.9, () => { boom(to.x, to.y + 1, to.z, 0xff8a20, 1.6 * s); lksSound('boom'); hit && hit(); });
  },
  gempa(from, to, s, hit){                                    // a quake bubble on the fist; the air itself cracks
    const a = from.clone().setY(from.y + 4 * s), bub = new THREE.Mesh(lksBall(), new THREE.MeshBasicMaterial({color:0xffffff, transparent:true, opacity:.5, depthWrite:false, side:THREE.DoubleSide})); bub.position.copy(a);
    addFx(bub, .6, (o, k) => { o.scale.setScalar(2 * s + k * 3 * s); o.material.opacity = .5 * (1 - k * .4); });
    later(.5, () => {
      const dir = _lv.subVectors(to, a).normalize().clone(), len = a.distanceTo(to);
      for(let k = 0; k < 8; k++){ const p = a.clone().addScaledVector(dir, len * k / 8); const r = new THREE.Mesh(new THREE.TorusGeometry(1, .12, 6, 40), addMat(0xffffff, .8)); r.position.copy(p); r.lookAt(p.clone().add(dir));
        addFx(r, .7, (o, k2) => { o.scale.setScalar((2 + k2 * 10) * s); o.material.opacity = .8 * (1 - k2); }); }
      for(let k = 0; k < 6; k++){ const b2 = to.clone().add(new THREE.Vector3((Math.random() - .5) * 14, Math.random() * 10, (Math.random() - .5) * 14)); bolt(to.clone().setY(to.y + 5), b2, 0xffffff, 3, .4, 1.5); }
      const wave = new THREE.Mesh(new THREE.TorusGeometry(1, .5, 6, 50), addMat(0xe8f4ff, .7)); wave.rotation.x = Math.PI / 2; wave.position.copy(to).setY(to.y + .5);
      addFx(wave, 1.6, (o, k2) => { o.scale.set(4 + k2 * 40 * s, 4 + k2 * 40 * s, 1 + k2 * 4); o.material.opacity = .7 * (1 - k2); });
      shake = Math.max(shake, 1.2); lksSound('quake'); hit && hit();
    });
  },
  gelap(from, to, s, hit){                                    // a black hole that pulls everything in, then bursts
    const hole = new THREE.Mesh(lksBall(), new THREE.MeshBasicMaterial({color:0x000000})), rim = new THREE.Mesh(new THREE.TorusGeometry(1, .08, 6, 48), addMat(0x9a5aff, .9));
    hole.position.copy(to).setY(to.y + 4); rim.position.copy(hole.position); rim.rotation.x = Math.PI / 2;
    addFx(hole, 2, (o, k) => o.scale.setScalar((k < .8 ? k / .8 : (1 - k) * 5) * 6 * s + .01));
    addFx(rim, 2, (o, k) => { o.scale.setScalar((k < .8 ? k / .8 : (1 - k) * 5) * 9 * s + .01); o.rotation.z += .2; });
    for(let k = 0; k < 18; k++) later(Math.random() * 1.4, () => { const p = to.clone().add(new THREE.Vector3((Math.random() - .5) * 30, Math.random() * 14, (Math.random() - .5) * 30)), m = new THREE.Mesh(lksBall(), addMat(0x6a3aff, .8)); m.scale.setScalar(.3);
      addFx(m, .5, (o, k2) => o.position.lerpVectors(p, hole.position, k2)); });
    later(1.9, () => { boom(to.x, to.y + 3, to.z, 0x6a3aff, 1.6 * s); shockwave(to, 16 * s); lksSound('quake'); hit && hit(); });
    if(AU.ctx) tone(40, {d:2, v:.15, glide:90, type:'sawtooth', filt:300});
  },
  bilik(from, to, s, hit){                                    // the blue Room, then three clean cuts inside it
    const dome = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16, 0, 6.283, 0, Math.PI / 2), new THREE.MeshBasicMaterial({color:0x6fd8ff, transparent:true, opacity:.22, depthWrite:false, side:THREE.DoubleSide}));
    dome.position.copy(to);
    addFx(dome, 2.4, (o, k) => { o.scale.setScalar(22 * s * Math.min(1, k * 4)); o.material.opacity = .22 * (k > .8 ? (1 - k) * 5 : 1); });
    for(let k = 0; k < 3; k++) later(.7 + k * .25, () => { const c = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), addMat(0xffffff, .95)); c.material.side = THREE.DoubleSide; c.position.copy(to).setY(to.y + 4); c.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
      addFx(c, .3, (o, k2) => { o.scale.set(30 * s, .3, 1); o.material.opacity = .95 * (1 - k2); }); if(AU.ctx) noiseHit({d:.12, v:.2, f:6000, type:'highpass'}); });
    later(1.5, () => { flash('rgba(120,220,255,.3)'); boom(to.x, to.y + 2, to.z, 0x6fd8ff, 1 * s); hit && hit(); });
  },
};
// a defender takes an intruder's blow on a shield of Haki
function blockFx(c){
  const r = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 12), new THREE.MeshBasicMaterial({color:0x2a0a3a, transparent:true, opacity:.4, depthWrite:false, side:THREE.DoubleSide}));
  r.position.set(c.x, c.g.position.y + c.h * .55, c.z); addFx(r, .6, (o, k) => { o.scale.setScalar(c.h * (.6 + k * .4)); o.material.opacity = .4 * (1 - k); });
  c.block = .5;
}
const charChest = c => new THREE.Vector3(c.x, c.g.position.y + c.h * .6, c.z);
const charFeet = c => new THREE.Vector3(c.x, c.g.position.y, c.z);

/* ================= the weekly invasion ================= */
const serbuanEl = document.createElement('div'); serbuanEl.id = 'serbuan'; serbuanEl.hidden = true; document.body.appendChild(serbuanEl);
// Saturday 21:00 MYT, every week; the key is that Saturday's date
function invOn(dayMs){ const d = new Date(dayMs + MYT); if(d.getUTCDay() !== 6) return null; return {key:d.toISOString().slice(0, 10), at:dayMs + 21 * 3600e3}; }
const invDone = key => LKS.history.some(h => h.key === key);
function logInv(rec){ LKS.history = [rec, ...LKS.history.filter(h => h.key !== rec.key)].slice(0, 12); LS.set('erythmind.serbuan', LKS.history); }
function nextInv(){ const today = mytMidnight(Date.now()); for(let k = 0; k < 8; k++){ const R = invOn(today + k * 86400e3); if(R && R.at > Date.now()) return R; } return null; }
function checkInv(){
  if(!session || LKS.inv.on) return; const now = Date.now(), today = mytMidnight(now);
  for(let k = 7; k >= 0; k--){ const R = invOn(today - k * 86400e3); if(!R || invDone(R.key) || now < R.at) continue;
    if(now < R.at + 10 * 60e3){ startInvasion(R.key, false); return; }
    logInv({key:R.key, at:R.at, live:false, by:INVS.map(c => ({id:c.id, by:c.vs}))});
    if(isOwner()) toast(`Laksamana Marineford · semasa kau tiada, serbuan mingguan ${fmtDate(R.key)} (Kaido, Big Mom, Whitebeard, Blackbeard, Law) dipatahkan. Tiada yang menembusi.`, 'ok', 9000);
  }
}
function startInvasion(key, drill){
  if(LKS.inv.on) return;
  LKS.inv = {on:true, key, drill:!!drill, t:0, out:[], log:[]};
  INVS.forEach((c, i) => { const a = BASE.face + (i - 2) * .12, r = BASE.rOut + 80; c.x = BASE.x + Math.cos(a) * r; c.z = BASE.z + Math.sin(a) * r; c.hp = c.max = INV_DEF[i].hp; c.state = 'datang'; c.cd = 4 + i; c.out = 0;
    const [fx, fz] = lineSpot(i, 5, INV_R, 26); c.tx = fx; c.tz = fz; c.g.visible = true; });
  ADMS.forEach(c => { const tgt = INVS.find(v => v.vs.includes(c.id)); c.target = tgt; if(tgt){ const j = tgt.vs.indexOf(c.id), [x, z] = lineSpot(tgt.i * 2 + (tgt.vs.length > 1 ? j : .5), 10, FRONT_R, 12); c.tx = x; c.tz = z; } c.cd = 2 + Math.random() * 3; });
  sirenFlash(); toast(drill ? 'LATIHAN · Serbuan mingguan: lima penceroboh menghampiri Marineford.' : 'SERBUAN MINGGUAN · Kaido, Big Mom, Whitebeard, Blackbeard dan Law menyeberangi teluk Marineford! Para laksamana bergerak.', 'bad', 7000);
  if(isOwner() && !drill) setTimeout(() => toast('Pergi ke Pangkalan Laut (P · Peta Ekspedisi) untuk menonton, atau ikut bertempur dengan Kuasa Laksamana kau.', 'ok', 6000), 2500);
}
function sirenFlash(){ flash('rgba(80,140,255,.35)'); if(AU.ctx) [0, .5, 1].forEach(t => tone(620, {t, type:'square', d:.35, v:.05, glide:900, filt:2000})); }
function endInvasion(){
  const I = LKS.inv; if(!I.on) return; I.on = false;
  if(!I.drill) logInv({key:I.key, at:Date.now(), live:true, by:INVS.map(c => ({id:c.id, by:c.vs}))});
  ADMS.forEach(c => { c.target = null; c.tx = c.home.x; c.tz = c.home.z; });
  serbuanEl.hidden = true; toast(`${I.drill ? 'Latihan tamat · ' : ''}Semua lima penceroboh dihalang oleh para laksamana Marineford. 0 menembusi.`, 'ok', 6000);
}
function invDamage(c, dmg, by){
  if(c.state !== 'tempur' && c.state !== 'datang') return; c.hp = Math.max(0, c.hp - dmg);
  if(c.hp <= 0){ c.state = 'undur'; c.out = 0; c.flyDir = new THREE.Vector3(Math.cos(BASE.face), 0, Math.sin(BASE.face));
    toast(`${c.name} diusir oleh ${by}!`, 'ok', 3500); LKS.inv.log.push(`${c.name} · ${by}`); }
}
function tickInvasion(dt){
  const I = LKS.inv; if(!I.on) return; I.t += dt;
  INVS.forEach(c => {
    if(c.state === 'datang' || c.state === 'tempur'){
      const dx = c.tx - c.x, dz = c.tz - c.z, d = Math.hypot(dx, dz);
      if(d > 1.5){ const sp = Math.min(d, 14 * dt); c.x += dx / d * sp; c.z += dz / d * sp; c.moving = true; c.ry = Math.atan2(dx, dz); } else { c.moving = false; c.state = 'tempur'; }
      const foe = ADMS.filter(a => c.vs.includes(a.id))[(I.t / 7 | 0) % c.vs.length] || ADMS[7];
      if(c.state === 'tempur'){ c.ry = Math.atan2(foe.x - c.x, foe.z - c.z); c.cd -= dt;
        if(c.cd <= 0){ c.cd = 4.5 + Math.random() * 2.5; castFx(c.power, charChest(c), charFeet(foe), c.h / 9, () => blockFx(foe)); } }
    } else if(c.state === 'undur'){
      c.out += dt; c.x += c.flyDir.x * dt * 60; c.z += c.flyDir.z * dt * 60; c.lift = Math.sin(Math.min(1, c.out / 3) * Math.PI) * 40;
      if(c.out > 3.5){ c.state = 'pergi'; c.g.visible = false; boom(c.x, 2, c.z, 0xffffff, 2); }
    }
  });
  ADMS.forEach(c => {
    const tgt = c.target && c.target.state === 'tempur' ? c.target : INVS.find(v => v.state === 'tempur');
    if(!tgt) return; c.ry = Math.atan2(tgt.x - c.x, tgt.z - c.z); c.cd -= dt;
    if(c.cd <= 0 && Math.hypot(c.tx - c.x, c.tz - c.z) < 3){ c.cd = (c.fleet ? 5 : 3.8) + Math.random() * 2.2; const dmg = c.fleet ? 34 : 14 + Math.random() * 6;
      castFx(c.power, charChest(c), charFeet(tgt), 1, () => invDamage(tgt, dmg, c.name)); }
  });
  const left = INVS.filter(c => c.state === 'datang' || c.state === 'tempur').length;
  if((I.t * 2 | 0) !== I.hudT){ I.hudT = I.t * 2 | 0;
    const at = player.layer === 0 && Math.hypot(player.x - BASE.plaza.x, player.z - BASE.plaza.z) < 420;
    serbuanEl.hidden = false; serbuanEl.className = I.drill ? 'drill' : '';
    serbuanEl.innerHTML = `<b>${I.drill ? 'LATIHAN · ' : ''}SERBUAN MINGGUAN · MARINEFORD</b><span>${5 - left}/5 penceroboh diusir · ${left} masih bertempur · 0 menembusi</span><small>${INVS.map(c => `${esc(c.name)} ${c.state === 'tempur' || c.state === 'datang' ? Math.ceil(c.hp / c.max * 100) + '%' : '✓'}`).join(' · ')}${at ? '' : ' · tonton di Pangkalan Laut (P)'}</small><i style="width:${((5 - left) / 5 * 100).toFixed(0)}%"></i>`; }
  if(!left && INVS.every(c => c.state === 'pergi')) endInvasion();
  if(I.t > 240) INVS.forEach(c => { if(c.state === 'datang' || c.state === 'tempur') invDamage(c, 999, 'para laksamana'); });
}
// effects are only drawn when someone can see them; the result is the same either way
function castFx(power, from, to, s, hit, caster){
  const seen = player.layer === 0 && Math.hypot(camera.position.x - to.x, camera.position.z - to.z) < 650;
  if(seen || caster === 'me') POWER_FX[power](from, to, s, hit, caster); else later(.8, () => hit && hit());
}

/* ================= patrol and drawing ================= */
const _lq = new THREE.Vector3();
function tickChars(t, dt){
  const showBase = (player.layer === 0 || player.layer === 1) && Math.hypot(camera.position.x - BASE.x, camera.position.z - BASE.z) < 900;
  ADMS.forEach(c => {
    if(c.duel) return;                                        // away in the Arkib for an entry trial
    if(!LKS.inv.on){                                          // a slow patrol round their own post
      c.wait -= dt;
      if(c.wait <= 0 && Math.hypot(c.tx - c.x, c.tz - c.z) < 1){                     // a few steps along the quay and back
        c.wait = 5 + Math.random() * 8; const a = Math.atan2(c.home.z - BASE.z, c.home.x - BASE.x) + (Math.random() - .5) * 8 / LINE_R;
        c.tx = BASE.x + Math.cos(a) * LINE_R; c.tz = BASE.z + Math.sin(a) * LINE_R; if(baseIslandH(c.tx, c.tz) < BASE.top - .5){ c.tx = c.home.x; c.tz = c.home.z; } }
    }
    const dx = c.tx - c.x, dz = c.tz - c.z, d = Math.hypot(dx, dz);
    if(d > .6){ const sp = Math.min(d, (LKS.inv.on ? 8 : 2.2) * dt); c.x += dx / d * sp; c.z += dz / d * sp; c.moving = true; if(!LKS.inv.on || !c.target) c.ry = Math.atan2(dx, dz); }
    else { c.moving = false; if(!LKS.inv.on) c.ry = lerp(c.ry, faceRot(BASE.face) + Math.PI, .02); }
    c.g.visible = showBase;
  });
  INVS.forEach(c => c.g.visible = LKS.inv.on && c.state !== 'pergi' && showBase);
  LKS.chars.forEach(c => {
    if(c.duel && player.layer !== 5) c.g.visible = false;
    if(!c.g.visible) return;
    const y = c.duel ? MAZE.y : c.side === 'inv' ? (c.state === 'undur' ? 2 + (c.lift || 0) : Math.max(.5, lksGround(c.x, c.z)) + Math.sin(t * 1.4 + c.i) * .3) : lksGround(c.x, c.z);
    c.g.position.set(c.x, y, c.z); c.g.rotation.y = c.ry; if(c.state === 'undur') c.g.rotation.x += dt * 4; else c.g.rotation.x = 0;
    if(c.block > 0){ c.block -= dt; c.g.position.addScaledVector(_lq.set(-Math.sin(c.ry), 0, -Math.cos(c.ry)), c.block * 1.5); }
    if(near(c, 500)){ if(c.mixer){ c.act.timeScale = c.moving ? .9 : 0; c.mixer.update(dt); } else if(!c.model) animatePerson(c.proc, c.moving, dt, 5);
      else { c.model.rotation.z = c.moving ? Math.sin(t * 6 + c.i) * .05 : 0; c.model.position.y = c.moving ? Math.abs(Math.sin(t * 6 + c.i)) * .15 : 0; } }     // a model without a skeleton sways as it walks
  });
}

/* ================= the owner's admiral power ================= */
const KUASA = {pick:LS.get('erythmind.kuasa', 'asal'), slot:String(LS.get('erythmind.kuasaSlot', '5'))};
if(!POWER_INFO[KUASA.pick]) KUASA.pick = 'asal';
POWERS.push({id:'laksamana', name:'Kuasa Laksamana', sub:'', key:KUASA.slot, cd:7}); HAKI.cd.laksamana = 0;
function syncKuasaPower(){
  const P = POWERS.find(p => p.id === 'laksamana'), I = POWER_INFO[KUASA.pick];
  P.key = KUASA.slot; P.name = I ? I.name.split(' · ')[0] : 'Kuasa Laksamana'; P.sub = I ? `${I.name} · daripada ${I.by}` : '';
  const box = $('#haki'); if(box) box.dataset.key = '';
}
const _allowedPowersL = allowedPowers;
allowedPowers = function(){
  let a = _allowedPowersL().filter(id => id !== 'laksamana');
  if(!isOwner() || !POWER_INFO[KUASA.pick]) return a;
  if(KUASA.slot !== '5'){ const P = POWERS.find(p => p.key === KUASA.slot && p.id !== 'laksamana' && a.includes(p.id)); if(P) a = a.filter(id => id !== P.id); }
  return a.concat('laksamana');
};
const _renderHakiButtonsL = renderHakiButtons;
renderHakiButtons = function(allowed){ _renderHakiButtonsL([...allowed].sort((x, y) => (POWERS.find(p => p.id === x)?.key || '9').localeCompare(POWERS.find(p => p.id === y)?.key || '9'))); };
// the number key for the chosen slot goes to the admiral power (the Haki file looks keys up by the first match)
addEventListener('keydown', e => {
  if(!session || !isOwner() || !POWER_INFO[KUASA.pick] || e.key !== KUASA.slot || !$('#gate').hidden || !$('#panel').hidden || !$('#map').hidden || typing()) return;
  e.preventDefault(); e.stopImmediatePropagation(); usePower('laksamana');
}, true);
SPECIAL_POWERS.laksamana = {
  use(){
    const p = KUASA.pick, I = POWER_INFO[p]; if(!I) return;
    const o = worldOfPlayer(), from = o.clone().setY(o.y + 2.2), fw = forward();
    // aim: an intruder in reach, else the giant, else straight ahead
    let to = null, foe = null;
    if(LKS.inv.on && player.layer === 0){ foe = INVS.filter(c => c.state === 'tempur' || c.state === 'datang').sort((a, b) => Math.hypot(a.x - o.x, a.z - o.z) - Math.hypot(b.x - o.x, b.z - o.z))[0]; if(foe && Math.hypot(foe.x - o.x, foe.z - o.z) < 160) to = charFeet(foe); else foe = null; }
    const gd = player.layer === 2 ? Math.hypot(GIANT.x - player.x, GIANT.z - player.z) : 1e9;
    if(!to && gd < 170 && GIANT.state !== 'tidur' && GIANT.state !== 'pulang'){ to = new THREE.Vector3(GIANT.x, NVY + giantY(GIANT.x, GIANT.z), GIANT.z); player.ry = Math.atan2(GIANT.x - player.x, GIANT.z - player.z); }
    if(!to){ to = o.clone().addScaledVector(fw, 40); to.y = layerBase(player.layer) + groundAt(to.x, to.z, player.layer); }
    HAKI.busy = .6; playClip('shout'); screenFx('vision', 900);
    POWER_FX[p](from, to, 1.2, () => kuasaImpact(to, p, foe), 'me');
    net.room?.emit('haki', {k:'laksamanaFx', p, x:+o.x.toFixed(1), z:+o.z.toFixed(1), tx:+to.x.toFixed(1), ty:+to.y.toFixed(1), tz:+to.z.toFixed(1), l:player.layer}).catch(() => {});
    toast(`${I.name.toUpperCase()} · kuasa ${I.by}.`, 'ok', 2200);
  },
};
SPECIAL_POWERS.laksamanaFx = {remote(o, dir, a, d){ if(!POWER_FX[d.p] || d.l !== player.layer) return; POWER_FX[d.p](new THREE.Vector3(d.x, o.y + 2.2, d.z), new THREE.Vector3(d.tx, d.ty, d.tz), 1.2, null); }};
// what an admiral power does where it lands: intruders, beasts, animals, and the giant
function kuasaImpact(to, p, foe){
  if(foe) invDamage(foe, 40, 'Eryth Sayf');
  if(player.layer === 2){
    beasts.forEach(b => { if(b.ko > 0) return; const dx = b.x - to.x, dz = b.z - to.z, d = Math.hypot(dx, dz); if(d < 26) defeat(b, new THREE.Vector3(dx, 0, dz).normalize(), 1); });
    if(Math.hypot(GIANT.x - to.x, GIANT.z - to.z) < 45) giantHit(p);
  }
  if(player.layer === 0) animals.forEach(a => { if(Math.hypot(a.x - to.x, a.z - to.z) < 24) a.faint = 6; });
}
// two blows leave the giant weak and seated for 10 s each; the third brings him to his knees for good
function giantHit(p){
  if(GIANT.state === 'tidur'){ wake('kuasa laksamana menghentamnya'); return; }
  if(GIANT.state === 'tunduk' || GIANT.state === 'pulang') return;
  GIANT.lksHits = (GIANT.lksHits || 0) + 1; shake = 1.6; flash('rgba(255,255,255,.7)');
  if(GIANT.lksHits >= 3){ GIANT.lksHits = 0; if(GIANT.state === 'lemah'){ GIANT.state = 'amok'; if(GIANT.act) GIANT.act.timeScale = 1; } subdue(); toast(`${POWER_INFO[p].name.split(' · ')[0]} · Penjaga Gergasi tumbang dan melutut!`, 'ok', 4000); return; }
  if(GIANT.state !== 'lemah'){ GIANT.state = 'lemah'; GIANT.t = 0; GIANT.swingAnim = 0; const d = play('kneel', {loop:false, fade:.35}); GIANT.lemahHold = d ? d * .42 : 0; }
  else GIANT.t = 0;
  toast(`KENA! Penjaga Gergasi lemah dan terduduk 10 saat (${GIANT.lksHits}/3 · tiga kali dan dia tumbang).`, 'ok', 3500);
}

/* --- settings: which admiral power, and which slot --- */
const SLOT_NAMES = {5:'Tambah sebagai kuasa 5 (semua kuasa asal kekal)', 1:'Ganti 1 · Kamusari', 3:'Ganti 3 · Haki Pemerhatian', 4:'Ganti 4 · Haki Persenjataan'};
const _gfxSettingsHtmlL = gfxSettingsHtml;
gfxSettingsHtml = function(){
  const base = _gfxSettingsHtmlL(); if(!isOwner()) return base;
  return base + `<h3>Kuasa Laksamana</h3><div class="field"><label for="kuasaSel">Kuasa</label><select id="kuasaSel"><option value="asal" ${KUASA.pick === 'asal' ? 'selected' : ''}>Tiada · kuasa aku kekal seperti asal</option>${Object.entries(POWER_INFO).map(([k, I]) => `<option value="${k}" ${KUASA.pick === k ? 'selected' : ''}>${esc(I.name)} (${esc(I.by)})</option>`).join('')}</select></div>
    <div class="field"><label for="kuasaSlot">Letak di</label><select id="kuasaSlot" ${KUASA.pick === 'asal' ? 'disabled' : ''}>${Object.entries(SLOT_NAMES).map(([k, n]) => `<option value="${k}" ${KUASA.slot === k ? 'selected' : ''}>${n}</option>`).join('')}</select></div>
    <div class="note">Haki Raja Agung (2) tidak boleh diganti: ia menundukkan gergasi dan menamatkan Ujian Saringan. Setiap kuasa laksamana boleh menjatuhkan Penjaga Gergasi: dua hentaman membuatnya terduduk 10 saat, hentaman ketiga membuatnya tumbang.</div>`;
};
document.addEventListener('change', e => {
  if(e.target.id === 'kuasaSel'){ KUASA.pick = e.target.value; LS.set('erythmind.kuasa', KUASA.pick); syncKuasaPower(); const s = $('#kuasaSlot'); if(s) s.disabled = KUASA.pick === 'asal';
    toast(POWER_INFO[KUASA.pick] ? `Kuasa Laksamana: ${POWER_INFO[KUASA.pick].name} (${POWER_INFO[KUASA.pick].by}) · tekan ${KUASA.slot}.` : 'Kuasa kau kekal seperti asal.', 'ok', 3500); }
  if(e.target.id === 'kuasaSlot'){ KUASA.slot = e.target.value; LS.set('erythmind.kuasaSlot', KUASA.slot); syncKuasaPower(); toast(`Kuasa Laksamana di kekunci ${KUASA.slot}.`, 'ok', 2500); }
});
syncKuasaPower();

/* ================= the entry trial: a duel with one admiral in the Arkib ================= */
const duelRing = new THREE.Mesh(new THREE.RingGeometry(3.2, 4.2, 40), new THREE.MeshBasicMaterial({color:0xff3030, transparent:true, opacity:.6, side:THREE.DoubleSide, depthWrite:false})); duelRing.rotation.x = -Math.PI / 2; duelRing.visible = false; scene.add(duelRing);
const DUEL_R = 4.2;
function startDuel(){
  const c = ADMS[Math.floor(Math.random() * 7)];
  LKS.duel = {c, hits:0, hp:5, cd:3, warn:null, inv:0, fist:0, t:0};
  c.duel = true; c.moving = false; c.g.visible = true; c.x = MAZE.x + 9; c.z = MAZE.z - 6; c.ry = Math.atan2(player.x - c.x, player.z - c.z);
  SAR.admiral = c.name; sarFist.hidden = false;
  bubbleFor('lksduel', () => c.g.position.clone().setY(c.g.position.y + c.h + .6), 'Arkib ini di bawah jagaan Marineford. Tunjukkan kau layak.', 'owner');
  toast(`${c.name} (${c.kuasa}) menghalang jalan kau!`, 'bad', 3500); duelHud();
}
function duelHud(){ const D = LKS.duel; if(!D) return; hud(`<i class="hp">${'♥'.repeat(D.hp)}${'♡'.repeat(5 - D.hp)}</i> · ${D.c.name} kena ${D.hits} / 3`); }
function endDuel(won){
  const D = LKS.duel; if(!D) return; LKS.duel = null; duelRing.visible = false; sarFist.hidden = true;
  const c = D.c; c.duel = false; c.x = c.home.x; c.z = c.home.z; c.tx = c.x; c.tz = c.z;
  if(won) stage3Memori();
}
function duelPunch(){
  const D = LKS.duel; if(!D || SAR.paused) return;
  if(D.fist > 0) return toast(`Tumbukan Haki sedang dicas (${D.fist.toFixed(1)} s).`, 'bad', 1200);
  const c = D.c, dx = c.x - player.x, dz = c.z - player.z, d = Math.hypot(dx, dz);
  D.fist = 2.2; player.ry = Math.atan2(dx, dz); playClip('shout');
  const o = worldOfPlayer().add(new THREE.Vector3(0, 1.6, 0)), tgt = charChest(c);
  const f = new THREE.Mesh(lksBall(), new THREE.MeshStandardMaterial({color:0x14141a, metalness:.8, roughness:.3, emissive:0x3a0a2a})); f.scale.setScalar(.9);
  addFx(f, .3, (m, k) => m.position.lerpVectors(o, d < 16 ? tgt : o.clone().add(new THREE.Vector3(dx, 0, dz).normalize().multiplyScalar(16)), k));
  later(.3, () => {
    if(!LKS.duel) return;
    if(d < 16){ D.hits++; blockFx(c); boom(tgt.x, tgt.y, tgt.z, 0xff4f45, .8); shake = .6; if(AU.ctx) noiseHit({d:.3, v:.3, f:500, brown:true});
      if(D.hits >= 3){ duelHud(); bubbleFor('lksduel', () => c.g.position.clone().setY(c.g.position.y + c.h + .6), 'Hm. Kau layak. Teruskan ke Arkib.', 'owner');
        toast(`Kau menewaskan ${c.name}! Dia membenarkan kau masuk ke Arkib Memori Terburuk.`, 'ok', 4500); D.won = true; setTimeout(() => endDuel(true), 2600); }
      else { toast(`Kena! ${c.name} terundur (${D.hits} / 3).`, 'ok', 1800); duelHud(); } }
    else toast('Terlalu jauh. Dekati laksamana (bawah 16 langkah) sebelum menumbuk.', 'bad', 1800);
  });
}
function tickDuel(dt){
  const D = LKS.duel; if(!D || SAR.paused || D.won) return; const c = D.c; D.t += dt; D.fist = Math.max(0, D.fist - dt); D.inv = Math.max(0, D.inv - dt);
  sarFist.classList.toggle('cool', D.fist > 0); sarFist.querySelector('b').textContent = D.fist > 0 ? D.fist.toFixed(1) : 'Q';
  if(player.layer !== 5){ setLayer(5); player.x = MAZE.x - 6; player.z = MAZE.z + 6; }
  // keep a fighting distance, circling
  const dx = player.x - c.x, dz = player.z - c.z, d = Math.hypot(dx, dz) || 1, want = 11;
  const side = Math.sin(D.t * .5) > 0 ? 1 : -1; let mx = (d - want) * dx / d * .6 + dz / d * side * 2.5, mz = (d - want) * dz / d * .6 - dx / d * side * 2.5;
  const ml = Math.hypot(mx, mz); if(ml > .3){ const sp = Math.min(ml, 4 * dt), nx = c.x + mx / ml * sp, nz = c.z + mz / ml * sp; if(mazeWalkable(nx, nz)){ c.x = nx; c.z = nz; } c.moving = true; } else c.moving = false;
  c.ry = Math.atan2(dx, dz);
  // the attack: a red ring where you stand, then the power lands there
  D.cd -= dt;
  if(!D.warn && D.cd <= 0){ D.warn = {x:player.x, z:player.z, t:1.25}; duelRing.visible = true; duelRing.position.set(player.x, MAZE.y + .08, player.z); if(AU.ctx) tone(500, {d:.4, v:.04, glide:900, type:'square', filt:1500}); }
  if(D.warn){ D.warn.t -= dt; duelRing.material.opacity = .35 + .35 * Math.abs(Math.sin(D.warn.t * 14)); duelRing.scale.setScalar(1 + (1.25 - D.warn.t) * .1);
    if(D.warn.t <= 0){ const w = D.warn; D.warn = null; duelRing.visible = false; D.cd = 2.6 + Math.random() * 1.2;
      const to = new THREE.Vector3(w.x, MAZE.y, w.z); POWER_FX[c.power](charChest(c), to, .55, null, 'me');
      later(c.power === 'graviti' ? 1.6 : c.power === 'magma' || c.power === 'emas' ? .9 : .6, () => {
        if(!LKS.duel || LKS.duel.won || D.inv > 0) return;
        if(Math.hypot(player.x - w.x, player.z - w.z) < DUEL_R){ D.hp--; D.inv = 1; flash('rgba(255,90,40,.6)'); shake = .8; SAR.hitsTaken++;
          if(D.hp <= 0){ toast(`${c.name} menewaskan kau. Cuba lagi: keluar dari bulatan merah sebelum kuasa jatuh.`, 'bad', 4000); D.hp = 5; D.hits = 0; D.cd = 3; }
          else toast(`Terkena ${c.kuasa.split(' · ')[0]}! Nyawa tinggal ${D.hp}.`, 'bad', 1800);
          duelHud(); } }); } }
}

/* ================= models (Higgsfield), loaded after entry so the gate does not wait for them ================= */
function applyLaksamanaModel(key, gltf){
  const c = LKS.byId[key]; if(!c || c.model) return;
  const root = gltf.scene; root.traverse(o => { if(o.isMesh){ o.castShadow = true; o.frustumCulled = false; [].concat(o.material).forEach(m => { if('metalness' in m) m.metalness = Math.min(m.metalness ?? 0, .2); if(m.map && 'emissive' in m){ m.emissiveMap = m.map; m.emissive = new THREE.Color(0xffffff); m.emissiveIntensity = .22; } }); } });
  fitAvatar(root, c.h); c.g.add(root); c.model = root; c.proc.g.visible = false;
  if(gltf.animations?.[0]){ c.mixer = new THREE.AnimationMixer(root); c.act = c.mixer.clipAction(prepareWalkClip(gltf.animations[0])); c.act.play(); c.act.timeScale = 0; }
}
async function loadLaksamana(){
  if(LKS.loaded || !THREE.GLTFLoader) return; LKS.loaded = true;
  let man; try{ const r = await fetch('assets/manifest-laut.json'); if(!r.ok) return; man = await r.json(); }catch(e){ return; }
  const loader = new THREE.GLTFLoader(); if(window.MeshoptDecoder) loader.setMeshoptDecoder(MeshoptDecoder);
  for(const [key, file] of Object.entries(man)){
    const g = await new Promise(res => loader.load(file, res, undefined, () => res(null))); if(!g) continue;
    try{ applyLaksamanaModel(key, g); }catch(e){ console.warn('laksamana', key, e); }
    await new Promise(r => setTimeout(r, 120));               // one at a time, so play never stalls
  }
}

/* --- per frame, schedule, panel, room --- */
let invCheckT = 0;
anims.push((t, dt) => {
  invCheckT -= dt; if(invCheckT <= 0){ invCheckT = 20; checkInv(); }
  tickInvasion(dt); tickChars(t, dt); tickDuel(dt);
});
const _startSessionL = startSession;
startSession = function(s){ _startSessionL(s); setTimeout(loadLaksamana, 6000); setTimeout(checkInv, 4000); syncKuasaPower(); };
const _lockL = lock;
lock = function(msg){ if(LKS.duel) endDuel(false); return _lockL(msg); };
const _raidPanelHtmlL = raidPanelHtml;
raidPanelHtml = function(){
  const rows = LKS.history.slice(0, 6).map(h => `<li><b>${esc(fmtDate(h.key))}</b> 5/5 penceroboh dihalang${h.live ? '' : ' (semasa kau tiada)'} · 0 menembusi</li>`).join(''), nx = nextInv();
  return _raidPanelHtmlL() + `<h3>Laksamana Marineford</h3><div class="note">Tujuh laksamana dan Fleet Admiral Garp menjaga Pangkalan Laut. Setiap Sabtu 21:00 (MYT) lima penceroboh (Kaido, Big Mom, Whitebeard, Blackbeard, Law) cuba menembusi Marineford.${nx ? ` Seterusnya: ${esc(fmtDate(nx.key))} 21:00.` : ''}</div>
    ${rows ? `<ul class="facts">${rows}</ul>` : ''}${isOwner() ? '<div class="row"><button class="btn" id="drillInv" type="button">Latihan · serbuan mingguan</button></div>' : ''}`;
};
const _wireRaidPanelL = wireRaidPanel;
wireRaidPanel = function(){ _wireRaidPanelL(); $('#drillInv')?.addEventListener('click', () => { if(LKS.inv.on) return toast('Serbuan sedang berlangsung.', 'bad'); closePanel(); startInvasion('latihan', true); net.room?.emit('serbuan', {d:1}).catch(() => {}); }); };
(async () => { const r = await use('room'); if(r) r.on('serbuan', m => { if(m.isMe || LKS.inv.on) return; startInvasion('latihan', true); }, () => {}); })();
info(ADMS[7].g, 'Laksamana Marineford', 'Tujuh laksamana dan Fleet Admiral Garp menjaga Pangkalan Laut. Setiap minggu mereka menghalang lima penceroboh hebat.');
EXPED.push({id:'laksamana', name:'Barisan Laksamana', sub:'Marineford · tujuh laksamana & Fleet Admiral', x:92, y:44, layer:0, to:[bx(BASE.back, 150), bz(BASE.back, 150)]});
// Q / TUMBUK during the duel punches the admiral
const _sarPunchL = sarPunch;
sarPunch = function(){ if(SAR.on && SAR.stage === 3 && SAR.sub === 'laksamana') return duelPunch(); return _sarPunchL(); };
