'use strict';
/* ================= Ujian Saringan: the entry trial for every new visitor =================
   1. Siren at the Frontier Dome. Eleven giant guards, PX-1 to PX-11, hunt the visitor with mouth lasers: survive 45 s.
   2. Their chief, Puma (always holding a hot coffee), swings his paw: the visitor is thrown into the
      Arkib Memori Terburuk (Labirin Memori). (Taman Falsafah is no longer a destination.)
   3. In the archive an admiral of Marineford is waiting (26-laksamana.js): beat him first, then give a worst
      memory to 3 empty dementors, encrypted on the visitor's device for the owner only.
   4. A hypersonic capsule throws them into Lembah Nivelham; the giant wakes. A borrowed Tumbukan Gergasi knocks
      him down for 10 s: do it twice.
   5. Siren everywhere. Only the owner's Haki Raja Agung ends it (Bavar-373 plays a recording if the owner is away);
      then the visitor is invited up to Labophase.
   Each stage opens with an instruction card; a compact bar keeps the goal on screen. The owner can rehearse it from
   the Bavar-373 panel. Designs are original guards in the spirit of the reference, not copies. */
const SAR = {on:false, stage:0, paused:true, t:0, hp:5, inv:0, preview:false, dest:null, picks:[], ilmu:null, knock:0, hitsTaken:0,
  beams:[], fly:null, cap:null, fistCd:0, waitT:0, start:0, ownerWait:new Map(), results:[]};
const SAR_KEY = gid => 'erythmind.saringan.' + gid;
const PX_N = 11, PX_H = 9, PUMA_H = 10.5;
const SARM = {px:null, pxWalk:null, puma:null, pumaDrink:null, pumaSwing:null};

/* --- screen: instruction card, goal bar, siren glow, punch button --- */
const sarHud = document.createElement('div'); sarHud.id = 'sarHud'; sarHud.hidden = true; document.body.appendChild(sarHud);
const sarCard = document.createElement('div'); sarCard.id = 'sarCard'; sarCard.hidden = true; document.body.appendChild(sarCard);
const sarSiren = document.createElement('div'); sarSiren.id = 'sarSiren'; document.body.appendChild(sarSiren);
const sarFist = document.createElement('button'); sarFist.id = 'sarFist'; sarFist.type = 'button'; sarFist.hidden = true; sarFist.innerHTML = '<b>Q</b>TUMBUK'; document.body.appendChild(sarFist);
sarFist.addEventListener('click', () => sarPunch());

const STAGE_TXT = {
  1:{t:'Elak Laser PX', s:'Bertahan 45 saat · elak laser dari mulut PX',
     p:['Siren Frontier Dome berbunyi. Sebelas pengawal gergasi, PX-1 hingga PX-11, sedang memburu pelawat baharu.',
        'Bila mulut PX bercahaya dan <b>garis merah</b> muncul ke arah kau, laser akan ditembak ke situ dalam sesaat.',
        'Bergerak ke tepi untuk mengelak: <b>W A S D</b> atau joystick, <b>Shift</b> untuk lari.',
        'Bertahan <b>45 saat</b>. Kau ada <b>5 nyawa</b>; kalau habis, peringkat ini bermula semula.']},
  2:{t:'Hayunan Puma', s:'Berdiri. Biarkan Puma menghayun tapak tangannya',
     p:['Ketua PX, <b>Puma</b>, datang dengan secawan kopi panas.',
        '<b>Jangan lari.</b> Berdiri dan biarkan Puma menghayun tapak tangannya kepada kau.',
        'Sekali hayun, kau akan dicampak ke <b>Arkib Memori Terburuk</b>.']},
  laksamana:{t:'Duel Laksamana', s:'Tumbuk laksamana 3 kali · elak bulatan merah',
     p:['Kau tercampak ke tengah Arkib Memori Terburuk. Seorang <b>laksamana Marineford</b> menjaga pintunya.',
        'Bila <b>bulatan merah</b> muncul di bawah kaki kau, kuasanya akan jatuh di situ dalam sesaat: <b>keluar dari bulatan</b> (W A S D / joystick, Shift untuk lari).',
        'Dekati dia dan tekan <b>Q</b> atau butang TUMBUK. Kena <b>3 kali</b> dan dia membenarkan kau masuk ke Arkib.',
        'Kau ada <b>5 nyawa</b>; kalau habis, duel bermula semula.']},
  buruk:{t:'Arkib Memori Terburuk', s:'Pilih 3 dementor kelabu · serahkan memori terburuk',
     p:['Kau dihantar ke Labirin Memori, tempat dementor menjaga memori terburuk.',
        'Pilih <b>3 dementor kelabu</b> (kosong). Klik atau tekan dementor itu, kemudian tulis satu memori terburuk kau untuknya.',
        'Tulis setakat yang kau selesa. Ia <b>disulitkan dalam peranti kau</b> dan hanya Eryth Sayf boleh membacanya.',
        'Selepas 3 dementor, peringkat ini selesai.']},
  falsafah:{t:'Taman Falsafah', s:'Simpan satu ilmu atau inspirasi kejayaan kau',
     p:['Kau dihantar ke Taman Falsafah.',
        'Simpan <b>satu ilmu atau inspirasi</b> yang membawa kau berjaya dalam hidup.',
        'Ia <b>disulitkan dalam peranti kau</b> dan hanya Eryth Sayf boleh membacanya.',
        'Borang dibuka sebaik kau tekan Mula.']},
  4:{t:'Kapsul Hipersonik & Penjaga Gergasi', s:'Buat gergasi terduduk 2 kali dengan Tumbukan Gergasi',
     p:['Kapsul Hipersonik tiba di sebelah kau. Dekati dan tekan <b>E</b> (atau butang di bawah) untuk naik.',
        'Kapsul akan mencampak kau di Lembah Nivelham, dan Penjaga Gergasi akan bangun mengamok.',
        'Kau dipinjamkan <b>Tumbukan Gergasi</b>: tekan <b>Q</b> atau butang TUMBUK. Tumbukan yang kena membuat gergasi lemah dan <b>terduduk 10 saat</b>.',
        'Buat dia terduduk <b>2 kali</b>. Elak hentakan Tukul Petirnya.']},
  5:{t:'Siren Keselamatan', s:'Bertahan · tunggu Haki Raja Agung Eryth Sayf',
     p:['Siren keselamatan berbunyi kuat di seluruh dunia. Huru-hara di Lembah Nivelham mesti dihentikan.',
        'Hanya <b>Haki Raja Agung Eryth Sayf</b> boleh menghentikannya. Pemilik telah dimaklumkan.',
        'Bertahan dan tunggu. Bila Haki Raja Agung tiba, kau akan dijemput ke <b>Labophase</b>.']},
};
const stageKey = () => SAR.stage === 3 ? (SAR.sub === 'laksamana' ? 'laksamana' : SAR.dest) : SAR.stage;
function showCard(key, onGo, extra){
  const T = STAGE_TXT[key], n = SAR.stage;
  sarCard.innerHTML = `<div class="sc-eye">Ujian Saringan · Peringkat ${n} / 5</div><h2>${T.t}</h2>${extra ? `<div class="sc-note">${extra}</div>` : ''}<ol>${T.p.map(x => `<li>${x}</li>`).join('')}</ol><button class="btn pri" type="button" id="sarGo">Faham · Mula</button>`;
  sarCard.hidden = false; SAR.paused = true; closePanel();
  const go = () => { sarCard.hidden = true; SAR.paused = false; removeEventListener('keydown', key2, true); onGo && onGo(); };
  const key2 = e => { if(e.key === 'Enter' && !sarCard.hidden && !typing()){ e.preventDefault(); e.stopPropagation(); go(); } };
  addEventListener('keydown', key2, true); $('#sarGo').addEventListener('click', go); setTimeout(() => $('#sarGo')?.focus(), 50);
}
function hud(status){
  if(!SAR.on){ sarHud.hidden = true; return; }
  const T = STAGE_TXT[stageKey()] || {t:'', s:''};
  sarHud.hidden = false;
  sarHud.innerHTML = `<b>UJIAN SARINGAN · ${SAR.stage}/5 · ${T.t.toUpperCase()}</b><span>${T.s}</span>${status ? `<em>${status}</em>` : ''}`;
}

/* --- siren: rising-falling wail and red/blue light at the screen edges --- */
let sirenT = 0;
function sirenTick(dt, level){
  sarSiren.className = level ? 'on' + (level > 1 ? ' loud' : '') : '';
  if(!level || !AU.ctx) return; sirenT -= dt; if(sirenT > 0) return; sirenT = 1.5;
  const v = level > 1 ? .09 : .045;
  tone(560, {type:'sawtooth', a:.05, d:.72, v, glide:980, filt:2400}); tone(980, {t:.75, type:'sawtooth', a:.05, d:.72, v, glide:560, filt:2400});
}

/* --- PX guards --- */
const PX = [];
const pxMat = {orb:new THREE.MeshBasicMaterial({color:0xffc23a, transparent:true, opacity:.95, blending:THREE.AdditiveBlending, depthWrite:false}),
  aim:new THREE.MeshBasicMaterial({color:0xff3030, transparent:true, opacity:.35, blending:THREE.AdditiveBlending, depthWrite:false}),
  core:new THREE.MeshBasicMaterial({color:0xfff4c0, transparent:true, opacity:1, blending:THREE.AdditiveBlending, depthWrite:false}),
  glow:new THREE.MeshBasicMaterial({color:0xffa020, transparent:true, opacity:.55, blending:THREE.AdditiveBlending, depthWrite:false})};
const unitCyl = new THREE.CylinderGeometry(1, 1, 1, 10, 1, true), unitBall = new THREE.SphereGeometry(1, 12, 10);
const _sa = new THREE.Vector3(), _sb = new THREE.Vector3(), _sy = new THREE.Vector3(0, 1, 0);
function stretch(m, a, b, r){ _sa.subVectors(b, a); const len = _sa.length(); m.position.copy(a).addScaledVector(_sa, .5); m.quaternion.setFromUnitVectors(_sy, _sa.normalize()); m.scale.set(r, len, r); }
for(let i = 0; i < PX_N; i++){
  const g = grp(0, -500, 0, scene); g.visible = false;
  const proc = makePerson({coat:0x18181c, pants:0x121216, shirt:0x9a9ca4, skin:0x5a5e68, hair:0x18181c}); proc.g.scale.setScalar(PX_H / 3.1); g.add(proc.g);
  mesh(new THREE.BoxGeometry(.5, .14, .1), new THREE.MeshBasicMaterial({color:0xffb020}), 0, 2.86, .4, proc.g, false);      // visor
  const p = {i, name:'PX-' + (i + 1), g, proc, x:0, z:0, ry:0, a:i / PX_N * 6.283, r:30 + (i % 4) * 5, cd:2 + i * .55, model:null, mixer:null, head:null, moving:false};
  p.label = addLabel(p.name, 'name', () => g.visible && SAR.on ? g.position.clone().setY(g.position.y + PX_H + 1.2) : null, {max:220});
  p.label.el.style.color = '#ffc23a';
  PX.push(p);
}
function pxMouth(p, out){
  if(p.head){ p.head.getWorldPosition(out); out.addScaledVector(_sb.set(Math.sin(p.ry), 0, Math.cos(p.ry)), PX_H * .05); return out; }
  return out.set(p.x + Math.sin(p.ry) * .9, p.g.position.y + PX_H * .86, p.z + Math.cos(p.ry) * .9);
}
function placePX(on){
  const c = SAR.c; PX.forEach(p => { p.g.visible = on; if(!on) return; p.x = c.x + Math.cos(p.a) * (60 + p.i * 2); p.z = c.z + Math.sin(p.a) * (60 + p.i * 2); p.cd = 2.5 + p.i * .6; });
}
function setupPXModels(){
  if(!SARM.px || (typeof Q !== 'undefined' && Q.tier <= 0)) return;     // Sangat rendah: the light box bodies only
  PX.forEach(p => { if(p.model) return;
    const root = THREE.SkeletonUtils ? THREE.SkeletonUtils.clone(SARM.px) : SARM.px.clone(); p.g.add(root); p.model = root; p.proc.g.visible = false;
    root.traverse(o => { if(o.isMesh) o.castShadow = false; });
    root.traverse(o => { if(o.isBone && !p.head && /head$/i.test(o.name)) p.head = o; });
    if(SARM.pxWalk){ p.mixer = new THREE.AnimationMixer(root); p.act = p.mixer.clipAction(SARM.pxWalk); p.act.play(); } });
}

/* --- Puma --- */
const PUMA = {g:grp(0, -500, 0, scene), x:0, z:0, ry:0, state:'off', t:0, model:null, mixer:null, acts:{}, hand:null, cupHand:null};
PUMA.g.visible = false;
PUMA.proc = makePerson({coat:0x1c2a4a, pants:0x161c2a, shirt:0x2a2a30, skin:0xc99a78, hair:0x2a2018}); PUMA.proc.g.scale.setScalar(PUMA_H / 3.1); PUMA.g.add(PUMA.proc.g);
{ const cup = grp(0, -1.0, .25, PUMA.proc.arms[0]); mesh(new THREE.CylinderGeometry(.16, .13, .3, 12), M(0xf4f1ea, {flatShading:false}), 0, 0, 0, cup, false); mesh(new THREE.TorusGeometry(.08, .025, 6, 12), M(0xf4f1ea), .18, 0, 0, cup, false); PUMA.procCup = cup; }
PUMA.label = addLabel('Puma<small>Ketua PX</small>', 'zone', () => PUMA.g.visible && SAR.on ? PUMA.g.position.clone().setY(PUMA.g.position.y + PUMA_H + 1.4) : null, {color:'#ff8ad8', max:240});
function setupPumaModel(){
  if(!SARM.puma || PUMA.model) return;
  const root = SARM.puma; PUMA.g.add(root); PUMA.model = root; PUMA.proc.g.visible = false; PUMA.mixer = new THREE.AnimationMixer(root);
  root.traverse(o => { if(!o.isBone) return; if(!PUMA.hand && /righthand$/i.test(o.name)) PUMA.hand = o; if(!PUMA.cupHand && /lefthand$/i.test(o.name)) PUMA.cupHand = o; });
  const clips = {drink:SARM.pumaDrink, swing:SARM.pumaSwing, walk:SARM.pxWalk && clipFits(SARM.pxWalk, root) > .5 ? SARM.pxWalk : null};
  Object.entries(clips).forEach(([k, c]) => { if(c) PUMA.acts[k] = PUMA.mixer.clipAction(c); });
  pumaPlay('drink');
}
function pumaPlay(name, once){
  const a = PUMA.acts[name]; if(!a) return 0; a.reset(); a.setLoop(once ? THREE.LoopOnce : THREE.LoopRepeat, Infinity); a.clampWhenFinished = !!once;
  if(PUMA.cur && PUMA.cur !== a) PUMA.cur.crossFadeTo(a, .3, false); a.play(); PUMA.cur = a; return a.getClip().duration;
}
// steam from the coffee, always
const steamGeo = new THREE.SphereGeometry(.18, 6, 5);
function steamPuff(){
  const at = PUMA.cupHand ? PUMA.cupHand.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, PUMA_H * .06, 0)) : PUMA.procCup.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, .5, 0));
  const s = new THREE.Mesh(steamGeo, new THREE.MeshBasicMaterial({color:0xffffff, transparent:true, opacity:.45, depthWrite:false}));
  s.position.copy(at); addFx(s, 1.8, (o, k) => { o.position.y = at.y + k * 2.2; o.position.x = at.x + Math.sin(k * 6) * .25; o.scale.setScalar(1 + k * 2.5); o.material.opacity = .45 * (1 - k); });
}
function pawWave(from, dir){
  flash('rgba(255,140,220,.8)'); shake = 1.2; screenFx('gear', 900);
  const paw = new THREE.Group(), pm = new THREE.MeshBasicMaterial({color:0xff8ad8, transparent:true, opacity:.9, blending:THREE.AdditiveBlending, depthWrite:false, side:THREE.DoubleSide});
  const pad = new THREE.Mesh(new THREE.CircleGeometry(1, 24), pm); pad.scale.set(1.2, 1, 1); paw.add(pad);
  [[-1, 1.3], [-.4, 1.75], [.4, 1.75], [1, 1.3]].forEach(([x, y]) => { const t = new THREE.Mesh(new THREE.CircleGeometry(.4, 16), pm); t.position.set(x, y, 0); paw.add(t); });
  paw.position.copy(from); paw.lookAt(from.clone().add(dir));
  addFx(paw, 1, (o, k) => { o.position.copy(from).addScaledVector(dir, k * 40); o.scale.setScalar(1.5 + k * 5); pm.opacity = .9 * (1 - k); });
  shockwave(from, 20);
  if(AU.ctx){ tone(220, {d:.5, v:.12, glide:1400}); noiseHit({d:.4, v:.3, f:2500, type:'bandpass'}); tone(90, {t:.05, d:.8, v:.25, glide:40}); }
}

/* --- hypersonic capsule --- */
const CAP = grp(0, -500, 0, scene); CAP.visible = false;
{ const hull = M(0xe8ecf2, {metalness:.6, roughness:.25}), dark = M(0x1a1e28, {metalness:.5, roughness:.3});
  const body = mesh(new THREE.CylinderGeometry(1.6, 1.6, 6, 24), hull, 0, 0, 0, CAP); body.rotation.x = Math.PI / 2;
  mesh(new THREE.SphereGeometry(1.6, 24, 16), hull, 0, 0, 3, CAP).scale.set(1, 1, 1.6);
  mesh(new THREE.SphereGeometry(1.6, 24, 16), dark, 0, 0, -3, CAP).scale.set(1, 1, .6);
  mesh(new THREE.SphereGeometry(1.25, 20, 14, 0, 6.283, 0, Math.PI / 2), new THREE.MeshStandardMaterial({color:0x6ff3ff, transparent:true, opacity:.55, metalness:.2, roughness:.05}), 0, .9, .8, CAP, false).scale.set(1, .8, 1.6);
  [[1, 0], [-1, 0], [0, 1]].forEach(([x, y]) => { const f = mesh(new THREE.BoxGeometry(.12, 1.6, 2), dark, x * 1.9, y * 1.9, -2.2, CAP, false); f.rotation.z = Math.atan2(y, x) + Math.PI / 2; });
  CAP.engine = mesh(new THREE.TorusGeometry(1.3, .22, 8, 24), new THREE.MeshBasicMaterial({color:0x9fc8ff}), 0, 0, -3.6, CAP, false);
  CAP.flame = mesh(new THREE.ConeGeometry(1.1, 5, 16, 1, true), new THREE.MeshBasicMaterial({color:0x9fd8ff, transparent:true, opacity:.6, blending:THREE.AdditiveBlending, depthWrite:false}), 0, 0, -6, CAP, false); CAP.flame.rotation.x = -Math.PI / 2; }
const capLabel = addLabel('Kapsul Hipersonik<small>Tekan E untuk naik</small>', 'zone', () => CAP.visible && SAR.stage === 4 && !SAR.cap ? CAP.position.clone().setY(CAP.position.y + 4) : null, {color:'#9fc8ff', max:120});
const capInteract = {id:'sarkapsul', name:'Naik Kapsul Hipersonik', layer:-9, at:[0, 0], r:6, color:'#9fc8ff', act:() => boardCapsule()};
interactables.push(capInteract);

/* ================= flow ================= */
function startSaringan(preview){
  if(SAR.on || !session) return;
  if(ride) endRide();
  Object.assign(SAR, {on:true, preview:!!preview, stage:0, picks:[], ilmu:null, knock:0, hitsTaken:0, dest:null, sub:null, admiral:null, fly:null, cap:null, beams:[], start:Date.now()});
  if(player.layer !== 0){ setLayer(0); player.x = 0; player.z = 16; player.y = surfaceH(0, 16); }
  stage1();
}
function stage1(retry){
  SAR.stage = 1; SAR.t = 0; SAR.hp = 5; SAR.inv = 0; clearBeams();
  SAR.c = {x:player.x, z:player.z}; placePX(true); setupPXModels(); PUMA.g.visible = false;
  hud(''); announce(1);
  showCard(1, () => { toast('PX-1 hingga PX-11 bergerak. Elak garis merah!', 'bad', 3500); }, retry ? 'Kau tumpas. Cuba sekali lagi: perhatikan garis merah dan bergerak ke tepi sebelum laser ditembak.' : '');
}
function stage2(){
  SAR.stage = 2; clearBeams(); hud('');
  const a = Math.random() * 6.283; PUMA.x = player.x + Math.cos(a) * 45; PUMA.z = player.z + Math.sin(a) * 45; PUMA.state = 'walk'; PUMA.t = 0; PUMA.g.visible = true; setupPumaModel(); pumaPlay('walk') || pumaPlay('drink');
  announce(2); showCard(2, () => toast('Puma menghampiri. Jangan lari.', 'ok', 3000));
}
function stage3(){
  SAR.stage = 3; PX.forEach(p => p.g.visible = false); PUMA.g.visible = false; PUMA.state = 'off';
  if(SAR.dest === 'buruk'){
    // thrown into the archive's central chamber, where an admiral waits
    const x = MAZE.x - 6, z = MAZE.z + 6; setLayer(5); player.x = x; player.z = z; player.y = 0; player.ry = Math.PI * .75; cam.yaw = Math.PI * .75; cam.tdist = 24; cam.dist = 24; cam.pitch = .8; camera.position.set(x, MAZE.y + 20, z + 12);
    SAR.sub = 'laksamana'; hud(''); announce(3);
    showCard('laksamana', () => startDuel());
  } else {
    const Z = ZONES.falsafah, x = Z.at[0], z = Z.at[1] + 12; setLayer(0); player.x = x; player.z = z; player.y = surfaceH(x, z); player.ry = Math.PI; cam.yaw = 0; camera.position.set(x, player.y + 10, z + 14);
    hud('Ilmu disimpan: 0 / 1'); announce(3);
    showCard('falsafah', () => openIlmuForm());
  }
}
function stage3Memori(){
  SAR.sub = 'memori'; hud('Dementor dipilih: 0 / 3');
  showCard('buruk', () => toast('Klik dementor kelabu untuk menyerahkan memori.', 'ok', 4000), SAR.admiral ? `Kau menewaskan ${esc(SAR.admiral)}.` : '');
}
function stage4(){
  SAR.stage = 4; hud('Naik kapsul'); announce(4);
  const side = new THREE.Vector3(Math.cos(player.ry), 0, -Math.sin(player.ry));
  const cx = player.x + side.x * 7, cz = player.z + side.z * 7, gy = layerBase(player.layer) + groundAt(cx, cz, player.layer);
  CAP.visible = true; CAP.position.set(cx, gy + 40, cz); CAP.rotation.set(0, player.ry, 0); CAP.land = gy + 2;
  addFx(new THREE.Object3D(), 1.3, (o, k) => { CAP.position.y = lerp(CAP.land + 40, CAP.land, 1 - Math.pow(1 - k, 3)); });
  flash('rgba(160,200,255,.6)'); if(AU.ctx) tone(300, {d:1.2, v:.08, glide:60, type:'sawtooth', filt:900});
  capInteract.layer = player.layer; capInteract.at = [cx, cz];
  showCard(4, () => toast('Dekati kapsul dan tekan E.', 'ok', 3500));
}
function stage5(){
  SAR.stage = 5; SAR.waitT = 0; hud('Menunggu Haki Raja Agung'); announce(5);
  const ownerHere = [...peers.values()].some(a => a.kind === 'owner');
  SAR.waitMax = SAR.preview ? 1e9 : ownerHere ? 90 : 25;
  showCard(5, null, SAR.preview ? 'Pratonton pemilik: tekan <b>2 · Haki Raja Agung</b> sendiri untuk menamatkan ujian.' : ownerHere ? 'Eryth Sayf ada dalam dunia sekarang dan telah dimaklumkan.' : 'Eryth Sayf tiada dalam talian. Bavar-373 akan memainkan rakaman Haki Raja Agung pemilik sebentar lagi.');
}
// progress rides the 'haki' room topic (k:'saringan'), which every visitor may already send on
function announce(s){ if(!SAR.preview && session) net.room?.emit('haki', {k:'saringan', s, n:session.name, d:SAR.dest || ''}).catch(() => {}); }
function clearBeams(){ SAR.beams.forEach(b => b.objs.forEach(o => scene.remove(o))); SAR.beams = []; }

/* --- stage 1: lasers --- */
function fireCheck(b){
  const P = worldOfPlayer().add(new THREE.Vector3(0, 1.4, 0)), ab = _sa.subVectors(b.b, b.a), t = clamp(_sb.subVectors(P, b.a).dot(ab) / ab.lengthSq(), 0, 1);
  const d = P.distanceTo(b.a.clone().addScaledVector(ab, t));
  boom(b.b.x, b.b.y + .5, b.b.z, 0xffb030, .6); if(AU.ctx){ noiseHit({d:.35, v:.12, f:1800, type:'bandpass'}); tone(140, {d:.3, v:.08, glide:60}); }
  if(d < 1.9 && SAR.inv <= 0 && !SAR.paused){
    SAR.hp--; SAR.hitsTaken++; SAR.inv = 1.3; flash('rgba(255,120,30,.75)'); shake = .9; screenFx('strike', 700);
    const away = new THREE.Vector3(player.x - b.b.x, 0, player.z - b.b.z).normalize(); const nx = player.x + away.x * 5, nz = player.z + away.z * 5; if(canStand(nx, nz, 0)){ player.x = nx; player.z = nz; }
    toast(SAR.hp > 0 ? `Terkena laser ${b.p.name}! Nyawa tinggal ${SAR.hp}.` : `Terkena laser ${b.p.name}. Nyawa habis.`, 'bad', 2200);
    if(SAR.hp <= 0){ PX.forEach(p => p.g.visible = false); clearBeams(); setTimeout(() => SAR.on && SAR.stage === 1 && stage1(true), 900); }
  }
}
function tickStage1(dt, t){
  if(player.layer !== 0){ setLayer(0); player.x = SAR.c.x; player.z = SAR.c.z; toast('Ujian saringan berlangsung di Fabriophase.', 'bad'); }
  SAR.inv = Math.max(0, SAR.inv - dt);
  if(!SAR.paused){ SAR.t += dt; if(SAR.t >= 45){ PX.forEach(p => p.cd = 99); clearBeams(); toast('Kau bertahan 45 saat! PX berhenti menembak.', 'ok', 3500); stage2(); return; } }
  const hearts = '♥'.repeat(Math.max(0, SAR.hp)) + '♡'.repeat(5 - Math.max(0, SAR.hp));
  if((t * 4 | 0) !== SAR.hudT){ SAR.hudT = t * 4 | 0; hud(`<i class="hp">${hearts}</i> · ${Math.max(0, 45 - SAR.t).toFixed(0)} s lagi`); }
  const charging = SAR.beams.filter(b => b.t < 1.15).length;
  PX.forEach(p => {
    if(!p.g.visible) return;
    p.a += dt * .12 * (p.i % 2 ? 1 : -1);
    const tx = player.x + Math.cos(p.a) * p.r, tz = player.z + Math.sin(p.a) * p.r, dx = tx - p.x, dz = tz - p.z, d = Math.hypot(dx, dz);
    p.moving = d > 2; if(p.moving){ const sp = Math.min(d, (d > 30 ? 11 : 5.5) * dt); p.x += dx / d * sp; p.z += dz / d * sp; }
    p.ry = Math.atan2(player.x - p.x, player.z - p.z);
    p.cd -= dt;
    if(!SAR.paused && p.cd <= 0 && charging < 3 && Math.hypot(player.x - p.x, player.z - p.z) < 70){
      p.cd = 5 + Math.random() * 4;
      const tgt = worldOfPlayer().add(new THREE.Vector3((Math.random() - .5) * 1.2, .2, (Math.random() - .5) * 1.2));
      const orb = new THREE.Mesh(unitBall, pxMat.orb), aim = new THREE.Mesh(unitCyl, pxMat.aim); scene.add(orb, aim);
      SAR.beams.push({p, a:new THREE.Vector3(), b:tgt, t:0, objs:[orb, aim]});
      if(AU.ctx) tone(320, {d:1.1, v:.04, glide:1200, type:'square', filt:1600});
    }
  });
  SAR.beams = SAR.beams.filter(b => {
    b.t += dt; pxMouth(b.p, b.a);
    if(b.t < 1.15){ b.objs[0].position.copy(b.a); b.objs[0].scale.setScalar(.15 + b.t * .55); stretch(b.objs[1], b.a, b.b, .06 + b.t * .05); b.objs[1].material.opacity = .25 + .3 * Math.abs(Math.sin(b.t * 18)); return true; }
    if(!b.fired){ b.fired = true; scene.remove(b.objs[1]); const core = new THREE.Mesh(unitCyl, pxMat.core.clone()), glow = new THREE.Mesh(unitCyl, pxMat.glow.clone()); scene.add(core, glow); b.objs.push(core, glow);
      const far = b.a.clone().add(b.b.clone().sub(b.a).multiplyScalar(1.15)); b.b = far; stretch(core, b.a, far, .22); stretch(glow, b.a, far, .7); fireCheck(b);
      if(AU.ctx) tone(900, {d:.3, v:.07, glide:200, type:'sawtooth', filt:3000}); }
    const k = (b.t - 1.15) / .32; b.objs[2].material.opacity = 1 - k; b.objs[3].material.opacity = .55 * (1 - k); b.objs[0].scale.setScalar(.8 * (1 - k) + .01);
    if(k >= 1){ b.objs.forEach(o => scene.remove(o)); return false; } return true;
  });
}

/* --- stage 2: Puma --- */
function tickStage2(dt, t){
  if(player.layer !== 0){ setLayer(0); player.x = SAR.c.x; player.z = SAR.c.z; }
  if(Math.random() < dt * 3) steamPuff();
  PX.forEach(p => { if(!p.g.visible) return; p.moving = false; p.ry = Math.atan2(PUMA.x - p.x, PUMA.z - p.z); });
  if(SAR.paused) return;
  const dx = player.x - PUMA.x, dz = player.z - PUMA.z, d = Math.hypot(dx, dz); PUMA.t += dt;
  if(PUMA.state === 'walk'){
    PUMA.ry = Math.atan2(dx, dz);
    if(d > 34 && PUMA.t > 3){           // the chief does not chase: one blink and he is in front of you
      PUMA.x = player.x - dx / d * 7; PUMA.z = player.z - dz / d * 7; flash('rgba(255,140,220,.45)'); if(AU.ctx) tone(1400, {d:.15, v:.05, glide:300}); toast('Puma lenyap… dan muncul betul-betul di depan kau.', 'ok', 2500); PUMA.t = 0;
    } else if(d > 6.5){ const sp = Math.min(d - 6, 5.2 * dt); PUMA.x += dx / d * sp; PUMA.z += dz / d * sp; }
    else { PUMA.state = 'swing'; PUMA.t = 0; bubbleFor('puma', () => PUMA.g.position.clone().setY(PUMA.g.position.y + PUMA_H + .5), 'Kopi aku masih panas. Pergilah dahulu.', 'owner');
      const D = pumaPlay('swing', true); PUMA.hitAt = D ? D * .45 : .9; PUMA.swingEnd = D || 1.6; if(!D) PUMA.proc.arms[1].rotation.x = -2.6; }
    if(d < 22 && !PUMA.said){ PUMA.said = true; bubbleFor('puma', () => PUMA.g.position.clone().setY(PUMA.g.position.y + PUMA_H + .5), 'Pelawat baharu? Tenang. Ini cuma satu hayunan.', 'owner'); }
  } else if(PUMA.state === 'swing'){
    PUMA.ry = Math.atan2(dx, dz);
    if(!PUMA.model) PUMA.proc.arms[1].rotation.x = lerp(-2.6, .8, clamp(PUMA.t / PUMA.hitAt, 0, 1));
    if(PUMA.t >= PUMA.hitAt && !SAR.fly){
      const dir = new THREE.Vector3(dx, 0, dz).normalize(), from = PUMA.hand ? PUMA.hand.getWorldPosition(new THREE.Vector3()) : worldOfPlayer().add(new THREE.Vector3(0, 2, 0));
      pawWave(from, dir); SAR.dest = 'buruk';
      SAR.fly = {t:0, dur:2.2, from:worldOfPlayer(), dir};
      toast('Hayunan Puma! Kau dicampak ke Arkib Memori Terburuk…', 'ok', 3500);
    }
    if(PUMA.t > PUMA.swingEnd + .4){ PUMA.state = 'drink'; pumaPlay('drink'); }
  }
}

/* --- player takeover: flying after the paw, riding the capsule --- */
const _sf = {p:new THREE.Vector3(), k:.85};
function sarBlock(dt){
  if(!SAR.on) return false;
  if(SAR.fly){
    const f = SAR.fly; f.t += dt; const k = Math.min(1, f.t / f.dur);
    me.g.visible = true; me.g.position.copy(f.from).addScaledVector(f.dir, k * 70).add(new THREE.Vector3(0, Math.sin(k * Math.PI) * 45 + k * 30, 0));
    me.g.rotation.set(k * 12, player.ry, k * 5); _sf.p.copy(me.g.position); camFocus = _sf;
    if(k >= 1){ SAR.fly = null; camFocus = null; me.g.rotation.set(0, player.ry, 0); flash('rgba(255,255,255,.95)'); sfx.whoosh(); stage3(); }
    return true;
  }
  if(SAR.cap){
    const c = SAR.cap; c.t += dt; me.g.visible = false; _sf.p.copy(CAP.position); camFocus = _sf; CAP.flame.scale.set(1, 1 + Math.random() * .4, 1);
    if(c.phase === 'rise'){ CAP.position.y = c.y0 + Math.pow(c.t / 1.6, 2) * 70; CAP.rotation.x = -Math.min(1, c.t / 1.6) * 1.2; $('#speedfx').hidden = false; $('#speedfx').style.opacity = String(c.t / 1.6 * .8);
      if(c.t >= 1.6){ c.phase = 'warp'; c.t = 0; flash('rgba(255,255,255,1)'); if(AU.ctx){ noiseHit({d:1.6, v:.35, f:600, brown:true}); tone(80, {d:1.5, v:.2, glide:900, type:'sawtooth', filt:1200}); }
        const a = GIANT.face, tx = GIANT.lair.x + Math.sin(a) * 95, tz = GIANT.lair.z + Math.cos(a) * 95; setLayer(2); player.x = tx; player.z = tz; player.y = nivH(tx, tz);
        c.land = NVY + nivH(tx, tz) + 2; CAP.position.set(tx - 120, c.land + 90, tz - 60); CAP.lookAt(tx, c.land, tz); c.from = CAP.position.clone(); c.to = new THREE.Vector3(tx, c.land, tz); } }
    else if(c.phase === 'warp'){ const k = Math.min(1, c.t / 2.2); CAP.position.lerpVectors(c.from, c.to, 1 - Math.pow(1 - k, 3)); shake = Math.max(shake, .5 * (1 - k)); $('#speedfx').style.opacity = String(.8 * (1 - k));
      if(k >= 1){ c.phase = 'eject'; c.t = 0; $('#speedfx').hidden = true; boom(c.to.x, c.to.y, c.to.z, 0x9fc8ff, 1.4); shockwave(c.to, 25); shake = 1;
        const side = new THREE.Vector3(1, 0, .3).normalize(); player.x = c.to.x + side.x * 7; player.z = c.to.z + side.z * 7; player.y = nivH(player.x, player.z);
        me.g.visible = true; camFocus = null; toast('Kapsul mencampak kau di Lembah Nivelham!', 'ok', 3000); } return true; }
    else if(c.phase === 'eject'){ CAP.position.y += dt * (20 + c.t * 40); CAP.rotation.x = -1.2; if(c.t > 3){ CAP.visible = false; SAR.cap = null; startGiantFight(); } return false; }
    return true;
  }
  return false;
}
function boardCapsule(){
  if(SAR.stage !== 4 || SAR.cap || !CAP.visible) return;
  capInteract.layer = -9; SAR.cap = {phase:'rise', t:0, y0:CAP.position.y}; nearby = null; $('#act').hidden = true;
  sfx.whoosh(); if(AU.ctx) tone(180, {d:1.6, v:.12, glide:900, type:'sawtooth', filt:1400});
  toast('Kapsul Hipersonik berlepas!', 'ok', 2000);
}

/* --- stage 3: memories and knowledge --- */
const _openMemory = openMemory;
openMemory = function(slot){
  if(!(SAR.on && SAR.stage === 3 && SAR.dest === 'buruk')) return _openMemory(slot);
  if(SAR.sub === 'laksamana') return toast('Tewaskan laksamana dahulu sebelum menyerahkan memori.', 'bad');
  if(SAR.picks.some(p => p.slot === slot)) return toast('Dementor ini sudah memegang memori kau. Pilih dementor kelabu yang lain.', 'bad');
  if(MZ.d[slot].entry) return toast('Dementor ini sudah memegang memori lain. Pilih dementor kelabu.', 'bad');
  const k = SAR.picks.length + 1;
  openPanel(`${head('Ujian Saringan · Arkib Memori Terburuk', `Dementor #${slot + 1} · memori ke-${k} daripada 3`, 'Tulis setakat yang kau selesa. Disulitkan dalam peranti kau sebelum dihantar; hanya Eryth Sayf boleh membacanya.')}
    <form class="pb" id="sarMemF" autocomplete="off"><div class="field"><label for="sarMT">Tajuk memori</label><input id="sarMT" maxlength="80" required></div>
    <div class="field"><label for="sarMS">Apa yang berlaku, dan apa yang ia ajar kau</label><textarea id="sarMS" maxlength="1200" required></textarea></div>
    <div class="row"><button class="btn pri" type="submit">Serahkan kepada dementor</button></div></form>`, '#8fa8d8');
  setTimeout(() => $('#sarMT')?.focus(), 50);
  $('#sarMemF').addEventListener('submit', e => { e.preventDefault();
    SAR.picks.push({slot, title:$('#sarMT').value.trim().slice(0, 80), story:$('#sarMS').value.trim().slice(0, 1200)}); closePanel(); markPicked();
    tone(220, {d:.8, v:.06, glide:110}); toast(`Dementor #${slot + 1} kini memegang memori kau (${SAR.picks.length} / 3).`, 'ok', 3000); hud(`Dementor dipilih: ${SAR.picks.length} / 3`);
    if(SAR.picks.length >= 3) sealAndSend().then(() => setTimeout(stage4, 1200)); });
};
const PICK_COL = new THREE.Color(0x3a7aff);
function markPicked(){ if(!SAR.picks.length) return; SAR.picks.forEach(p => demMesh.setColorAt(p.slot, PICK_COL)); demMesh.instanceColor.needsUpdate = true; }
function openIlmuForm(){
  openPanel(`${head('Ujian Saringan · Taman Falsafah', 'Satu ilmu atau inspirasi kejayaan', 'Disulitkan dalam peranti kau sebelum dihantar; hanya Eryth Sayf boleh membacanya.')}
    <form class="pb" id="sarIlF" autocomplete="off"><div class="field"><label for="sarIT">Ilmu atau inspirasi</label><input id="sarIT" maxlength="100" required placeholder="Contoh: Istiqamah sedikit demi sedikit"></div>
    <div class="field"><label for="sarIS">Bagaimana ia membawa kau berjaya</label><textarea id="sarIS" maxlength="1200" required></textarea></div>
    <div class="field"><label for="sarIF">Daripada siapa atau sumbernya (pilihan)</label><input id="sarIF" maxlength="100"></div>
    <div class="row"><button class="btn pri" type="submit">Simpan di Taman Falsafah</button></div></form>`, '#c9b8ff');
  setTimeout(() => $('#sarIT')?.focus(), 50);
  $('#sarIlF').addEventListener('submit', e => { e.preventDefault();
    SAR.ilmu = {title:$('#sarIT').value.trim().slice(0, 100), story:$('#sarIS').value.trim().slice(0, 1200), from:$('#sarIF').value.trim().slice(0, 100)}; closePanel();
    tone(784, {d:.5, v:.05}); tone(1046, {t:.12, d:.6, v:.05}); toast('Ilmu kau tersimpan di Taman Falsafah.', 'ok', 3000); hud('Ilmu disimpan: 1 / 1');
    sealAndSend().then(() => setTimeout(stage4, 1200)); });
}
// stage 3 must not be skipped by closing the form
const _closePanel = closePanel;
closePanel = function(){ _closePanel(); if(SAR.on && SAR.stage === 3 && SAR.dest === 'falsafah' && !SAR.ilmu && sarCard.hidden) setTimeout(() => { if(SAR.on && !SAR.ilmu && $('#panel').hidden) openIlmuForm(); }, 400); };

/* --- owner-only inbox: visitors encrypt with the owner's public key; only the owner's PIN opens it --- */
async function ensureInbox(){
  if(!isOwner() || !session?.MK || core?.inbox?.pub) return;
  const kp = await crypto.subtle.generateKey({name:'ECDH', namedCurve:'P-256'}, true, ['deriveKey']);
  const pub = await crypto.subtle.exportKey('jwk', kp.publicKey), priv = new Uint8Array(await crypto.subtle.exportKey('pkcs8', kp.privateKey));
  const n = clone(core); n.inbox = {pub, priv:await seal(session.MK, priv, 'inbox')}; priv.fill(0);
  try{ await store.setCore(n); core = n; }catch(e){}
}
async function sealForOwner(obj){
  const pub = await crypto.subtle.importKey('jwk', core.inbox.pub, {name:'ECDH', namedCurve:'P-256'}, false, []);
  const eph = await crypto.subtle.generateKey({name:'ECDH', namedCurve:'P-256'}, true, ['deriveKey']);
  const key = await crypto.subtle.deriveKey({name:'ECDH', public:pub}, eph.privateKey, {name:'AES-GCM', length:256}, false, ['encrypt']);
  const iv = rand(12), ct = await crypto.subtle.encrypt({name:'AES-GCM', iv, additionalData:te.encode('saringan')}, key, te.encode(JSON.stringify(obj)));
  return {epk:await crypto.subtle.exportKey('jwk', eph.publicKey), iv:b64(iv), ct:b64(new Uint8Array(ct))};
}
async function openForOwner(box){
  const raw = await unseal(session.MK, core.inbox.priv, 'inbox');
  const priv = await crypto.subtle.importKey('pkcs8', raw, {name:'ECDH', namedCurve:'P-256'}, false, ['deriveKey']); raw.fill(0);
  const epk = await crypto.subtle.importKey('jwk', box.epk, {name:'ECDH', namedCurve:'P-256'}, false, []);
  const key = await crypto.subtle.deriveKey({name:'ECDH', public:epk}, priv, {name:'AES-GCM', length:256}, false, ['decrypt']);
  return JSON.parse(td.decode(await crypto.subtle.decrypt({name:'AES-GCM', iv:unb64(box.iv), additionalData:te.encode('saringan')}, key, unb64(box.ct))));
}
async function sendResult(extra){
  if(SAR.preview || session?.role !== 'guest' || !store?.report) return;
  if(!myUid){ const u = await use('user'); myUid = u ? await u.id() : null; } if(!myUid) return;
  reportBuf = reportBuf || {name:session.name, events:[]}; reportBuf.name = session.name;
  reportBuf.saringan = Object.assign(reportBuf.saringan || {}, {t:Date.now(), dest:SAR.dest, hits:SAR.hitsTaken, adm:SAR.admiral || ''}, extra);
  await store.report(myUid, reportBuf).catch(() => {});
}
async function sealAndSend(){
  if(SAR.preview){ toast('Pratonton: tiada apa-apa dihantar.', 'ok', 2500); return; }
  if(!core?.inbox?.pub){ toast('Peti tersulit pemilik belum aktif, jadi catatan ini tidak dihantar ke mana-mana. Kau tetap lulus peringkat ini.', 'ok', 6000); return; }
  try{ const box = await sealForOwner({dest:SAR.dest, picks:SAR.picks, ilmu:SAR.ilmu, name:session.name, t:Date.now()}); await sendResult({box}); toast('Disulitkan dan dihantar kepada Eryth Sayf.', 'ok', 2500); }
  catch(e){ toast('Catatan tidak dapat disulitkan (' + (e.message || e) + ').', 'bad'); }
}

/* --- stage 4: the giant fight --- */
function startGiantFight(){
  if(GIANT.state === 'tidur') wake('dibangunkan oleh ujian saringan ' + (session?.name || ''));
  else if(GIANT.state !== 'amok' && GIANT.state !== 'bangun'){ GIANT.state = 'amok'; GIANT.t = 0; play('walk', {speed:.55}); }
  GIANT.awayMax = 600; SAR.fistCd = 0; sarFist.hidden = false; hud('Gergasi terduduk: 0 / 2');
  toast('Penjaga Gergasi bangun! Tekan Q atau TUMBUK bila dia dalam jarak.', 'bad', 4500);
}
function sarPunch(){
  if(!SAR.on || (SAR.stage !== 4 && SAR.stage !== 5) || SAR.cap || player.layer !== 2) return;
  if(SAR.fistCd > 0) return toast(`Tumbukan Gergasi sedang dicas (${SAR.fistCd.toFixed(0)} s).`, 'bad', 1500);
  const dx = GIANT.x - player.x, dz = GIANT.z - player.z, d = Math.hypot(dx, dz);
  if(d > 160) return toast('Gergasi terlalu jauh. Dekati dia (bawah 160 langkah).', 'bad', 2000);
  player.ry = Math.atan2(dx, dz); const dir = new THREE.Vector3(dx / d, 0, dz / d), o = worldOfPlayer();
  SAR.fistCd = 5; HAKI.busy = 2.1; playClip('shout'); giantFist(o, dir, 2, true);
  setTimeout(() => { if(!SAR.on) return; const tx = o.x + dir.x * 70, tz = o.z + dir.z * 70;
    const ax = GIANT.x - o.x, az = GIANT.z - o.z, along = clamp(ax * dir.x + az * dir.z, 0, 80), miss = Math.hypot(GIANT.x - (o.x + dir.x * along), GIANT.z - (o.z + dir.z * along));
    if((GIANT.state === 'amok' || GIANT.state === 'bangun') && (miss < 30 || Math.hypot(GIANT.x - tx, GIANT.z - tz) < 40)) knockDown(); else if(GIANT.state !== 'lemah') toast('Tumbukan tersasar. Tunggu dia dalam laluan tumbukan.', 'bad', 2000); }, 1950);
}
function knockDown(){
  GIANT.state = 'lemah'; GIANT.t = 0; GIANT.swingAnim = 0; const d = play('kneel', {loop:false, fade:.35}); GIANT.lemahHold = d ? d * .42 : 0; SAR.knock++;
  shake = 1.6; flash('rgba(255,255,255,.8)'); if(AU.ctx){ tone(40, {d:2, v:.5, glide:24}); noiseHit({d:1.6, v:.4, f:160, brown:true}); }
  toast(`KENA! Penjaga Gergasi lemah dan terduduk 10 saat (${SAR.knock} / 2).`, 'ok', 3500); hud(`Gergasi terduduk: ${SAR.knock} / 2`);
  if(SAR.knock >= 2 && SAR.stage === 4) setTimeout(() => SAR.on && SAR.stage === 4 && stage5(), 1500);
}

/* --- stage 5: siren and Haki Raja Agung --- */
function recordedAgung(){
  toast('Bavar-373: pemilik tiada dalam talian. Memainkan rakaman Haki Raja Agung Eryth Sayf.', 'ok', 5000);
  const o = worldOfPlayer(); agungBurst(o); hakiSfx.agung(); shake = .9; screenFx('agung', 9000); worldHaki(10);
  if(GIANT.state === 'lemah'){ GIANT.state = 'amok'; } subdue(); finishSaringan('rakaman');
}
AGUNG_HOOKS.push((o, isMine, byOwner) => {
  if(GIANT.state === 'lemah' && byOwner){ GIANT.state = 'amok'; subdue(); }
  if(SAR.on && SAR.stage === 5 && byOwner) finishSaringan('langsung');
  if(isMine && isOwner() && SAR.ownerWait.size){ toast(`Haki Raja Agung menghentikan huru-hara dan menjemput ${[...SAR.ownerWait.keys()].join(', ')} ke Labophase.`, 'ok', 6000); SAR.ownerWait.clear(); }
});
function finishSaringan(how){
  if(SAR.finishing) return; SAR.finishing = true; hud('Lulus! Menjemput ke Labophase…');
  setTimeout(async () => {
    sarFist.hidden = true; SAR.stage = 6;
    if(session?.role === 'guest' && !SAR.preview){ LS.set(SAR_KEY(session.gid), Date.now()); await sendResult({lulus:Date.now(), agung:how}); }
    if(!SAR.preview) net.room?.emit('haki', {k:'saringan', s:'lulus', n:session?.name || 'Tetamu', d:SAR.dest || ''}).catch(() => {});
    flash('rgba(111,243,255,.8)'); sfx.whoosh(); setLayer(1); player.x = LAB.x; player.z = LAB.z + 16; player.ry = Math.PI; cam.yaw = 0;
    SAR.on = false; SAR.finishing = false; hud(); sirenTick(0, 0);
    sarCard.innerHTML = `<div class="sc-eye">Ujian Saringan · Lulus</div><h2>Selamat datang ke Labophase</h2><ol><li>Kau mengelak laser PX-1 hingga PX-11${SAR.hitsTaken ? ` (terkena ${SAR.hitsTaken} kali)` : ' tanpa terkena sekali pun'}.</li><li>Hayunan Puma mencampak kau ke Arkib Memori Terburuk${SAR.admiral ? `, dan kau menewaskan ${esc(SAR.admiral)}` : ''}.</li><li>Kau membuat Penjaga Gergasi terduduk ${SAR.knock} kali.</li><li>${how === 'rakaman' ? 'Rakaman' : ''} Haki Raja Agung Eryth Sayf menamatkan huru-hara dan menjemput kau ke sini.</li></ol><button class="btn pri" type="button" id="sarGo">Masuk</button>`;
    sarCard.hidden = false; $('#sarGo').addEventListener('click', () => sarCard.hidden = true);
  }, 3500);
}

/* --- per-frame --- */
anims.push((t, dt) => {
  const vis = SAR.on && player.layer === 0 && (SAR.stage === 1 || SAR.stage === 2);
  PX.forEach(p => { if(!p.g.visible) return; p.g.position.set(p.x, surfaceH(p.x, p.z), p.z); p.g.rotation.y = p.ry;
    if(p.mixer){ p.act.timeScale = p.moving ? .85 : 0; if(vis) p.mixer.update(dt); } else animatePerson(p.proc, p.moving, dt, 6); });
  if(PUMA.g.visible){ PUMA.g.position.set(PUMA.x, surfaceH(PUMA.x, PUMA.z), PUMA.z); PUMA.g.rotation.y = PUMA.ry; if(PUMA.mixer && vis) PUMA.mixer.update(dt); else if(!PUMA.model) animatePerson(PUMA.proc, PUMA.state === 'walk', dt, 4); }
  if(CAP.visible){ CAP.engine.material.color.setHSL(.58, 1, .6 + Math.sin(t * 20) * .15); if(SAR.stage === 4 && !SAR.cap) CAP.position.y += Math.sin(t * 2) * .01; }
  sarHud.classList.toggle('low', !bossEl.hidden || !$('#raid').hidden);      // make room for the giant's or a raid's banner
  if(!SAR.on){ sirenTick(dt, 0); return; }
  sirenTick(dt, SAR.stage === 5 ? 2 : SAR.stage === 1 ? 1 : 0);
  if(SAR.stage === 1) tickStage1(dt, t);
  else if(SAR.stage === 2) tickStage2(dt, t);
  else if(SAR.stage === 3 && SAR.dest === 'buruk'){ if(player.layer === 5 && (t * 2 | 0) !== SAR.mk){ SAR.mk = t * 2 | 0; markPicked(); } }
  if(SAR.stage === 4 || SAR.stage === 5){ SAR.fistCd = Math.max(0, SAR.fistCd - dt); sarFist.classList.toggle('cool', SAR.fistCd > 0); sarFist.querySelector('b').textContent = SAR.fistCd > 0 ? SAR.fistCd.toFixed(0) : 'Q'; }
  if(GIANT.state === 'lemah'){
    if(GIANT.act && GIANT.lemahHold && GIANT.act.time >= GIANT.lemahHold) GIANT.act.timeScale = 0;
    if(player.layer === 2) setBoss('PENJAGA GERGASI · LEMAH & TERDUDUK', `Bangkit semula dalam ${Math.max(0, 10 - GIANT.t).toFixed(0)} saat.`, 'tunduk');
    if(GIANT.t >= 10){ GIANT.state = 'amok'; GIANT.t = 0; if(GIANT.act) GIANT.act.timeScale = 1; play('walk', {speed:.55}); toast('Penjaga Gergasi bangkit semula dan mengamok!', 'bad', 3000); }
  }
  if(SAR.stage === 5 && !SAR.paused && !SAR.finishing){ SAR.waitT += dt; if((t * 2 | 0) !== SAR.hudT){ SAR.hudT = t * 2 | 0; hud(SAR.preview ? 'Tekan 2 · Haki Raja Agung' : `Menunggu Haki Raja Agung · ${SAR.waitT.toFixed(0)} s`); } if(SAR.waitT > SAR.waitMax) recordedAgung(); }
  if(ride && SAR.stage <= 2) endRide('Kenderaan tidak dibenarkan semasa ujian saringan.');
});
addEventListener('keydown', e => { if(e.code === 'KeyQ' && SAR.on && !typing() && $('#panel').hidden && !e.repeat){ sarPunch(); e.preventDefault(); } });

/* --- 3D models (Higgsfield): PX guard with a walk, Puma with a coffee sip and a paw swing --- */
const _applyModel = applyModel;
applyModel = function(key, gltf){
  const fix = root => root.traverse(o => { if(o.isMesh){ o.castShadow = true; o.frustumCulled = false; [].concat(o.material).forEach(m => { if('metalness' in m){ m.metalness = Math.min(m.metalness ?? 0, .2); } if(m.map && 'emissive' in m){ m.emissiveMap = m.map; m.emissive = new THREE.Color(0xffffff); m.emissiveIntensity = .28; m.needsUpdate = true; } }); } });
  if(key === 'px'){ fix(gltf.scene); fitAvatar(gltf.scene, PX_H); SARM.px = gltf.scene; if(gltf.animations?.[0]) SARM.pxWalk = prepareWalkClip(gltf.animations[0]); if(SAR.on) setupPXModels(); return; }
  if(key === 'puma'){ fix(gltf.scene); fitAvatar(gltf.scene, PUMA_H); SARM.puma = gltf.scene; if(gltf.animations?.[0]) SARM.pumaDrink = gltf.animations[0]; return; }
  if(key === 'animPumaSwing'){ SARM.pumaSwing = gltf.animations?.[0] || null; return; }
  return _applyModel(key, gltf);
};

/* --- who takes it: every new visitor on their first entry; the owner can rehearse it --- */
const _startSession = startSession;
startSession = function(s){
  _startSession(s);
  if(s.role === 'guest' && !LS.get(SAR_KEY(s.gid), 0)) setTimeout(() => { if(session === s) startSaringan(false); }, 2600);
  if(s.role === 'owner') setTimeout(() => ensureInbox(), 1500);
};
const _lock = lock;
lock = function(msg){ if(SAR.on){ SAR.on = false; SAR.fly = null; SAR.cap = null; camFocus = null; clearBeams(); PX.forEach(p => p.g.visible = false); PUMA.g.visible = false; CAP.visible = false; capInteract.layer = -9; sarFist.hidden = true; sarCard.hidden = true; hud(); $('#speedfx').hidden = true; } return _lock(msg); };

// owner side: progress from visitors, a strong alert at the last stage
(async () => { const r = await use('room'); if(!r) return; r.on('haki', m => {
  if(m.isMe || !isOwner() || !m.data || m.data.k !== 'saringan') return; const d = m.data, n = String(d.n || 'Tetamu').slice(0, 28);
  if(d.s === 5){ SAR.ownerWait.set(n, Date.now()); screenFx('vision', 2600); flash('rgba(255,60,60,.35)');
    if(AU.ctx) [0, .4, .8].forEach(t => tone(700, {t, type:'sawtooth', d:.3, v:.08, glide:400, filt:2000}));
    toast(`UJIAN SARINGAN · ${n} di peringkat terakhir. Tekan 2 · Haki Raja Agung untuk menghentikan huru-hara dan menjemputnya ke Labophase.`, 'bad', 12000); }
  else if(d.s === 'lulus'){ SAR.ownerWait.delete(n); toast(`${n} lulus Ujian Saringan dan kini di Labophase.`, 'ok', 5000); }
  else if(d.s === 1) toast(`${n} memulakan Ujian Saringan. Siren berbunyi di Frontier Dome.`, 'ok', 4000);
  else if(d.s === 3) toast(`${n} dicampak Puma ke Arkib Memori Terburuk dan kini berduel dengan seorang laksamana.`, 'ok', 3500);
}, () => {}); })();

/* --- Bavar-373 panel: rehearse the trial, read visitors' results --- */
const _onReports = onReports;
onReports = function(list){ SAR.results = list.filter(r => r.saringan).map(r => ({name:r.name || 'Tetamu', ...r.saringan})).sort((a, b) => b.t - a.t); _onReports(list); };
const _raidPanelHtml = raidPanelHtml;
raidPanelHtml = function(){
  const rows = SAR.results.slice(0, 20).map((r, i) => `<div class="item"><strong>${esc(r.name)} · ${r.lulus ? 'lulus' : 'belum tamat'}</strong><span>${esc(r.dest === 'buruk' ? 'Arkib Memori Terburuk' : r.dest === 'falsafah' ? 'Taman Falsafah' : '—')} ${r.adm ? ` · menewaskan ${esc(r.adm)}` : ''} · terkena ${r.hits || 0}× · ${esc(new Date(r.t).toLocaleString('ms-MY'))}</span>${r.box ? `<div class="row"><button class="btn" type="button" data-sarbox="${i}">Buka catatan tersulit</button></div><div id="sarOut${i}"></div>` : ''}</div>`).join('');
  return _raidPanelHtml() + (isOwner() ? `<h3>Ujian Saringan</h3><div class="note">Setiap pelawat baharu melalui 5 peringkat pada kali pertama masuk. Catatan mereka disulitkan untuk kau sahaja.</div>
    <div class="row"><button class="btn" id="sarPrev" type="button">Pratonton ujian saringan</button></div>${rows ? `<div class="list">${rows}</div>` : '<div class="note">Belum ada keputusan.</div>'}` : '');
};
const _wireRaidPanel = wireRaidPanel;
wireRaidPanel = function(){
  _wireRaidPanel();
  $('#sarPrev')?.addEventListener('click', () => { closePanel(); startSaringan(true); });
  document.querySelectorAll('[data-sarbox]').forEach(b => b.addEventListener('click', async () => {
    const r = SAR.results[+b.dataset.sarbox], out = $('#sarOut' + b.dataset.sarbox);
    try{ const v = await openForOwner(r.box);
      out.innerHTML = `<dl class="ro">${v.picks?.length ? v.picks.map((p, i) => `<dt>Memori terburuk ${i + 1} · dementor #${p.slot + 1}</dt><dd><b>${esc(p.title)}</b>\n${esc(p.story)}</dd>`).join('') : ''}${v.ilmu ? `<dt>Ilmu / inspirasi</dt><dd><b>${esc(v.ilmu.title)}</b>\n${esc(v.ilmu.story)}${v.ilmu.from ? '\n— ' + esc(v.ilmu.from) : ''}</dd>` : ''}</dl>`; b.remove(); }
    catch(e){ out.innerHTML = '<div class="note warn">Tidak dapat dibuka dengan kunci kau.</div>'; }
  }));
};
