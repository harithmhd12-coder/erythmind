'use strict';
/* ================= Labophase rock underside (floating island look) ================= */
{
  const g = new THREE.ConeGeometry(LAB.r + 2, 30, 28, 6, true); g.rotateX(Math.PI);
  const p = g.attributes.position, v = new THREE.Vector3();
  for(let i = 0; i < p.count; i++){ v.fromBufferAttribute(p, i); const k = 1 + noise2(v.x * 1.7 + v.y, v.z * 1.7 - v.y) * .09; p.setXYZ(i, v.x * k, v.y + noise2(v.x * 3, v.z * 3) * 1.2, v.z * k); }
  g.computeVertexNormals();
  mesh(g, M(0x6a5a4a, {roughness:1}), 0, -16.5, 0, lab, false);
  mesh(new THREE.TorusGeometry(LAB.r + 1.6, 1.2, 6, 60), M(0x5a7a3a), 0, -2.6, 0, lab, false).rotation.x = Math.PI / 2;
  for(let i = 0; i < 6; i++){ const a = i / 6 * 6.283 + .4; const fall = mesh(new THREE.PlaneGeometry(2, 26), holoMat(0xdff6ff, .22), Math.cos(a) * (LAB.r + 1.2), -15, Math.sin(a) * (LAB.r + 1.2), lab, false); fall.rotation.y = -a + Math.PI / 2; }
}

/* ================= Higgsfield asset registry ================= */
const HF = {ready:{}, total:0, done:0, json:{}};
function hfChip(){ const c = $('#chipModels'); if(!c) return; c.hidden = HF.total === 0; c.querySelector('span').textContent = HF.done < HF.total ? `Model Higgsfield ${HF.done}/${HF.total}` : `Model Higgsfield · ${HF.total}`; c.className = 'chip' + (HF.done < HF.total ? ' warn' : ''); }
// bake every mesh of a loaded scene into one canonical frame: feet on y=0, centred, longest side along z, head (taller end) at +z
function canonical(scene, height, opts = {}){
  scene.updateMatrixWorld(true);
  const geos = [];
  scene.traverse(o => { if(o.isMesh){ const g = o.geometry.clone(); g.applyMatrix4(o.matrixWorld); geos.push({g, mat:o.material}); } });
  const box = new THREE.Box3(); geos.forEach(({g}) => { g.computeBoundingBox(); box.union(g.boundingBox); });
  const size = box.getSize(new THREE.Vector3()), c = box.getCenter(new THREE.Vector3());
  const m4 = new THREE.Matrix4().makeTranslation(-c.x, -box.min.y, -c.z);
  if(opts.alignLong && size.x > size.z) m4.premultiply(new THREE.Matrix4().makeRotationY(-Math.PI / 2));
  geos.forEach(({g}) => g.applyMatrix4(m4));
  if(opts.headForward){ // the half with more high vertices is the head
    let front = 0, back = 0; const hy = size.y * .62;
    geos.forEach(({g}) => { const p = g.attributes.position; for(let i = 0; i < p.count; i += 2){ if(p.getY(i) > hy){ if(p.getZ(i) > 0) front++; else back++; } } });
    if(back > front){ const r = new THREE.Matrix4().makeRotationY(Math.PI); geos.forEach(({g}) => g.applyMatrix4(r)); }
  }
  if(opts.rotY){ const r = new THREE.Matrix4().makeRotationY(opts.rotY); geos.forEach(({g}) => g.applyMatrix4(r)); }
  const s = height / size.y; const sm = new THREE.Matrix4().makeScale(s, s, s); geos.forEach(({g}) => { g.applyMatrix4(sm); g.computeBoundingBox(); g.computeVertexNormals(); });
  const len = Math.max(size.x, size.z) * s;
  return {geos, height, len};
}
function buildFrom(canon, matFn){
  const g = new THREE.Group();
  canon.geos.forEach(({g:geo, mat}) => { const m = new THREE.Mesh(geo, matFn ? matFn(mat) : mat); m.castShadow = true; m.receiveShadow = true; g.add(m); });
  return g;
}
// procedural gait on a static Higgsfield animal: legs swing about the hip line, body bobs
function gaitMaterial(base, u){
  const m = base.clone(); m.metalness = 0; m.roughness = .85;
  m.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, u);
    sh.vertexShader = 'uniform float uPhase; uniform float uAmp; uniform float uLegTop; uniform float uBob; uniform float uHop;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
      float legW = 1.0 - smoothstep(uLegTop * .55, uLegTop, position.y);
      float diag = sign(position.x) * sign(position.z);
      float ph = uPhase + (diag > 0.0 ? 0.0 : 3.14159);
      transformed.z += (uLegTop - position.y) * sin(ph) * uAmp * legW;
      transformed.y += max(0.0, -cos(ph)) * uAmp * .12 * uLegTop * legW;
      transformed.y += abs(sin(uPhase)) * uBob + abs(sin(uPhase * .5)) * uHop;`);
  };
  m.customProgramCacheKey = () => 'gait';
  return m;
}
const SPECIES = {rusa:{h:3.4, leg:.5}, kuda:{h:4, leg:.5}, singa:{h:2.9, leg:.48}, harimau:{h:2.7, leg:.48}, arnab:{h:.9, leg:.0, hop:true}, kucing:{h:1, leg:.42}, mamot:{h:17, leg:.38}, beruang:{h:9.5, leg:.42}, serigala:{h:6.5, leg:.46}};
function upgradeCreature(c, canon, kind){
  const sp = SPECIES[kind];
  c.gaitU = {uPhase:{value:0}, uAmp:{value:0}, uLegTop:{value:canon.height * sp.leg}, uBob:{value:0}, uHop:{value:0}};
  const model = buildFrom(canon, mat => gaitMaterial(mat, c.gaitU));
  c.g.children.forEach(ch => ch.visible = false);
  c.g.scale.setScalar(1); c.g.add(model); c.model = model; c.hop = !!sp.hop; c.lastPos = c.g.position.clone();
}
anims.push((t, dt) => {
  const upd = c => { if(!c.gaitU || !c.g.parent?.visible) return; const moved = c.g.position.distanceTo(c.lastPos) / Math.max(dt, 1e-3); c.lastPos.copy(c.g.position);
    const k = clamp(moved / 6, 0, 1); const u = c.gaitU; u.uPhase.value = c.phase * 1.1; u.uAmp.value = lerp(u.uAmp.value, c.hop ? 0 : .32 * k, .2); u.uBob.value = c.hop ? 0 : .05 * k * u.uLegTop.value; u.uHop.value = c.hop ? .9 * k : 0; };
  animals.forEach(upd); beasts.forEach(upd);
});

/* ================= avatar (rigged + walk animation) ================= */
const AV = {src:null, clip:null};
function prepareWalkClip(clip){
  clip = clip.clone();
  clip.tracks.forEach(tr => { if(tr.name.endsWith('.position') && /hips|root|pelvis/i.test(tr.name)){ const v = tr.values; for(let i = 0; i < v.length; i += 3){ v[i] = v[0]; v[i + 2] = v[2]; } } });
  return clip;
}
function attachAvatar(person, tint){
  const root = THREE.SkeletonUtils ? THREE.SkeletonUtils.clone(AV.src) : AV.src.clone();
  root.traverse(o => { if(o.isMesh){ o.castShadow = true; o.frustumCulled = false; if(tint){ o.material = o.material.clone(); o.material.color.multiply(new THREE.Color(tint)); } } });
  fitAvatar(root, 2.95);
  const holder = new THREE.Group(); holder.add(root);
  person.g.children.forEach(ch => { if(!ch.userData.marker) ch.visible = false; });
  person.g.add(holder);
  const mixer = new THREE.AnimationMixer(root); let action = null;
  if(AV.clip){ action = mixer.clipAction(AV.clip); action.play(); action.timeScale = 0; }
  person.av = {holder, mixer, action, t:0};
}
function fitAvatar(root, height){
  // skinned meshes report bind-pose bounds, so measure the skeleton instead
  root.updateMatrixWorld(true);
  const box = new THREE.Box3(), v = new THREE.Vector3(); let n = 0;
  root.traverse(o => { if(o.isBone){ box.expandByPoint(o.getWorldPosition(v)); n++; } });
  if(!n){ fitModel(root, {height}); return; }
  const h = box.max.y - box.min.y; const s = height / (h * 1.07);
  root.scale.multiplyScalar(s); root.updateMatrixWorld(true);
  box.makeEmpty(); root.traverse(o => { if(o.isBone) box.expandByPoint(o.getWorldPosition(v)); });
  const c = box.getCenter(new THREE.Vector3());
  root.position.x -= c.x; root.position.z -= c.z; root.position.y -= box.min.y - height * .015;
}
function driveAvatar(person, moving, speed, dt){
  const a = person.av; if(!a) return;
  const pose = person.pose || 0;
  if(pose !== (a.pose || 0)){                                // sit / lie clips (rigged on the same avatar) blend over the walk
    a.pose = pose; if(a.poseAct){ a.poseAct.fadeOut(.35); a.poseAct = null; }
    const clip = pose === 1 ? AV.sit : pose === 2 ? AV.lie : null;
    if(clip){ a.poseAct = a.mixer.clipAction(clip); a.poseAct.reset().fadeIn(.35).play(); }
    if(a.action) a.action.weight = clip ? 0 : 1;
  }
  if(pose || !a.action){ a.mixer.update(dt); return; }
  if(moving){ a.action.timeScale = clamp(speed / 7.5, .6, 2.4); }
  else { a.action.timeScale = 0; a.action.time = lerp(a.action.time, 0, .15); }
  a.mixer.update(dt);
}
anims.push((t, dt) => {
  if(!AV.src) return;
  if(!me.av) attachAvatar(me, null);
  if(me.av){ me.av.holder.visible = !ride; driveAvatar(me, player.moving, player.speed, dt); }
  peers.forEach(a => { if(!a.p.av) attachAvatar(a.p, a.kind === 'owner' ? null : 0xaabbdd); driveAvatar(a.p, a.m, 9, dt); });
});

/* ================= vehicles ================= */
const VEH = {
  jet:{name:'Jet Hypersonik', max:220, boost:520, acc:60, boostAcc:260, h:3.2, len:16},
  car:{name:'Veyron Hypersonik', max:95, boost:360, acc:45, boostAcc:180, h:1.5, len:5.4},
  drone:{name:'Dron Peninjau', max:24, boost:55, acc:16, boostAcc:30, h:.6, len:3.2},
  kapal:{name:'Kapal Arus Tarai', max:34, boost:70, acc:8, boostAcc:14, h:6, len:28},
};
const PIER_END = {x:62, z:58}, PIER_LAND = {x:47, z:43};
// Arus Tarai: the fast sea current from the core pier, through the Gate of Justice, into Marine Bay
const TARAI = [[PIER_END.x, PIER_END.z], [80, 130], [40, 330], [BASE.gate.x + Math.cos(BASE.face) * 60, BASE.gate.z + Math.sin(BASE.face) * 60], [BASE.gate.x, BASE.gate.z], [BASE.x + Math.cos(BASE.face) * 120, BASE.z + Math.sin(BASE.face) * 120], [BASE.x + Math.cos(BASE.back) * 70, BASE.z + Math.sin(BASE.back) * 70], [BASE.dock.x + Math.cos(BASE.face) * 14, BASE.dock.z + Math.sin(BASE.face) * 14]];
function procVehicle(kind){
  const g = new THREE.Group();
  if(kind === 'jet'){
    const body = M(0xf4f6fa, {metalness:.5, roughness:.3}), red = M(0xd2373a, {metalness:.4, roughness:.3});
    mesh(new THREE.CylinderGeometry(.9, .6, 12, 12), body, 0, 1.6, 0, g).rotation.x = Math.PI / 2;
    mesh(new THREE.ConeGeometry(.9, 4, 12), red, 0, 1.6, 8, g).rotation.x = Math.PI / 2;
    const w = mesh(new THREE.BoxGeometry(12, .2, 5), body, 0, 1.3, -1.5, g); w.scale.z = 1;
    [-1, 1].forEach(s => mesh(new THREE.BoxGeometry(.2, 2.6, 2.4), red, s * 1.4, 3, -4.6, g));
    mesh(new THREE.SphereGeometry(.8, 12, 8), new THREE.MeshStandardMaterial({color:0x9fc8ff, metalness:.8, roughness:.1}), 0, 2.3, 3, g).scale.z = 2;
  } else if(kind === 'kapal'){
    const hull = M(0xdfe3ea, {metalness:.4, roughness:.45}), grey = M(0x8a93a3, {metalness:.5, roughness:.4}), red = M(0x8a1f22), navy = M(0x1f2f52);
    mesh(new THREE.BoxGeometry(5.6, 3.2, 20), hull, 0, .4, -1, g); mesh(new THREE.BoxGeometry(5.62, .9, 20.02), red, 0, -.9, -1, g, false);
    const bow = mesh(new THREE.CylinderGeometry(0, 2.8, 7, 4, 1), hull, 0, .4, 12.4, g); bow.rotation.x = Math.PI / 2; bow.rotation.y = Math.PI / 4; bow.scale.set(1, 1, .57);
    mesh(new THREE.BoxGeometry(5.2, .2, 26), M(0x9c8a6a), 0, 2.05, 0, g, false);
    mesh(new THREE.BoxGeometry(4, 3.4, 6), hull, 0, 3.8, -2, g); mesh(new THREE.BoxGeometry(3.2, 2, 3.6), hull, 0, 6.4, -1.4, g); mesh(new THREE.BoxGeometry(3.3, .5, 3.7), navy, 0, 6.6, -.4, g, false);
    [[-1, -5.4], [1, -7.2]].forEach(([k, z]) => mesh(new THREE.CylinderGeometry(.9, 1.1, 4, 10), grey, 0, 4.4 + k * .3, z, g));
    mesh(new THREE.CylinderGeometry(.12, .12, 7, 6), grey, 0, 10, -1.6, g, false); mesh(new THREE.BoxGeometry(2.6, .15, .15), grey, 0, 12, -1.6, g, false);
    [[6.5, 1], [-9.5, -1]].forEach(([z, d]) => { const t = grp(0, 2.6, z, g); mesh(new THREE.CylinderGeometry(1.3, 1.5, 1.1, 10), grey, 0, 0, 0, t); [-.4, .4].forEach(x => mesh(new THREE.CylinderGeometry(.14, .16, 4, 8), grey, x, .2, d * 2.2, t, false).rotation.x = Math.PI / 2); });
  } else if(kind === 'drone'){
    const white = M(0xf2f4f8, {metalness:.3, roughness:.35}), red = M(0xc8262c, {metalness:.3, roughness:.35}), dark = M(0x23262e, {metalness:.5, roughness:.4});
    mesh(new THREE.SphereGeometry(.55, 16, 10), white, 0, .75, 0, g).scale.set(1, .55, 1.5);
    mesh(new THREE.BoxGeometry(.32, .12, 1.4), red, 0, 1.02, .05, g, false);
    g.userData.rotors = [];
    [[1, 1], [-1, 1], [1, -1], [-1, -1]].forEach(([x, z]) => {
      const arm = mesh(new THREE.BoxGeometry(.14, .1, 1.35), white, x * .55, .78, z * .55, g, false); arm.rotation.y = Math.atan2(x, z);
      mesh(new THREE.CylinderGeometry(.16, .18, .3, 12), red, x * 1.05, .85, z * 1.05, g, false);
      const rot = grp(x * 1.05, 1.03, z * 1.05, g); mesh(new THREE.BoxGeometry(1.1, .02, .1), dark, 0, 0, 0, rot, false); mesh(new THREE.BoxGeometry(.1, .02, 1.1), dark, 0, 0, 0, rot, false); g.userData.rotors.push(rot);
      mesh(new THREE.TorusGeometry(.62, .025, 6, 32), holoMat(0x9fc8ff, .85), x * 1.05, 1.03, z * 1.05, g, false).rotation.x = Math.PI / 2;
      const leg = mesh(new THREE.BoxGeometry(.06, .6, .06), white, x * .32, .32, z * .35, g, false); leg.rotation.z = -x * .25;
    });
    mesh(new THREE.SphereGeometry(.2, 12, 8), dark, 0, .42, .55, g, false); mesh(new THREE.CircleGeometry(.11, 12), new THREE.MeshBasicMaterial({color:0x9fc8ff}), 0, .42, .76, g, false);
    g.scale.setScalar(1.3);
  } else {
    const paint = M(0x8a1822, {metalness:.6, roughness:.25}), black = M(0x15171f, {metalness:.5, roughness:.3});
    mesh(new THREE.BoxGeometry(2.1, .7, 4.6), paint, 0, .7, 0, g); mesh(new THREE.BoxGeometry(1.7, .55, 2), black, 0, 1.25, -.2, g);
    [[-1, 1.5], [1, 1.5], [-1, -1.5], [1, -1.5]].forEach(([x, z]) => { mesh(new THREE.CylinderGeometry(.42, .42, .35, 16), black, x * 1.05, .42, z, g).rotation.z = Math.PI / 2; mesh(new THREE.TorusGeometry(.38, .05, 6, 20), padMat, x * 1.25, .42, z, g, false).rotation.y = Math.PI / 2; });
  }
  return g;
}
const vehicles = {};
['jet', 'car', 'drone', 'kapal'].forEach(k => { const g = grp(); g.visible = false; scene.add(g); const proc = procVehicle(k); g.add(proc);
  const flame = mesh(new THREE.ConeGeometry(k === 'jet' ? .8 : .3, k === 'jet' ? 6 : 2.2, 12, 1, true), holoMat(0x9fc8ff, .7), 0, k === 'jet' ? 1.6 : .7, k === 'jet' ? -9.5 : -3.4, g, false); flame.rotation.x = -Math.PI / 2;
  if(k === 'drone' || k === 'kapal') flame.visible = false;
  vehicles[k] = {g, proc, flame, kind:k}; });
anims.push((t, dt) => { if(vehicles.drone.g.visible) (vehicles.drone.rotors || vehicles.drone.proc.userData.rotors).forEach((r, i) => r.rotation.y += dt * (i % 2 ? -46 : 46)); });
let ride = null;          // {kind, x, y, z, yaw, pitch, v, layer, auto}
let speedLines = 0, lastBoom = 0;
function vehicleBase(layer){ return layerBase(layer); }
function summon(kind){
  if(!session) return;
  if(kind === 'car' && (player.layer === 1 || player.layer === 3)){ toast('Veyron hanya di darat. Guna Jet Hypersonik di lapisan atas.', 'bad'); return; }
  if(kind === 'kapal') return summonShip();
  if(player.layer >= 4){ toast('Kenderaan tidak boleh digunakan di dalam bangunan ini. Keluar dahulu.', 'bad'); return; }
  const yaw = player.ry, x = player.x + Math.sin(yaw) * (kind === 'drone' ? 3 : 0), z = player.z + Math.cos(yaw) * (kind === 'drone' ? 3 : 0);
  ride = {kind, x, z, y:groundAt(x, z, player.layer) + (kind === 'jet' ? 2 : kind === 'drone' ? 2.5 : .05), yaw, pitch:0, v:0, layer:player.layer, auto:null};
  if(kind !== 'car' && player.layer === 1){ ride.y = kind === 'drone' ? 2.5 : 2; }
  if(kind === 'drone') ride.home = {x:player.x, z:player.z, y:player.y, ry:player.ry};
  vehicles[kind].g.visible = true; sfx.whoosh(); closePanel();
  toast(kind === 'drone' ? 'Dron Peninjau berlepas dari tangan kau. W maju · S undur · A/D pusing · Space naik · C turun · Shift laju · V kamera gimbal · R Ronda Santai · F panggil pulang' : `${VEH[kind].name} sedia. ${kind === 'jet' ? 'W pecut · A/D belok · Space naik · C turun' : 'W pecut · S brek · A/D stereng'} · Shift hypersonik · F keluar`, 'ok', 7000);
  showRideHud(true); updateRideHud();
}
function summonShip(){
  // the ferry waits at whichever jetty is nearer: the core pier or the naval dock
  const atBase = player.layer === 0 && Math.hypot(player.x - BASE.x, player.z - BASE.z) < BASE.rOut + 80;
  const p = atBase ? TARAI[TARAI.length - 1] : TARAI[0], q = atBase ? TARAI[TARAI.length - 2] : TARAI[1];
  if(player.layer !== 0) setLayer(0);
  ride = {kind:'kapal', x:p[0], z:p[1], y:-.9, yaw:Math.atan2(q[0] - p[0], q[1] - p[1]), pitch:0, v:0, layer:0, auto:null};
  vehicles.kapal.g.visible = true; sfx.whoosh(); closePanel(); showRideHud(true); updateRideHud();
  toast('Kapal Arus Tarai sedia di jeti. W maju · S undur · A/D kemudi · F berlabuh di jeti.', 'ok', 6000);
}
function exitRide(force){
  if(!ride) return;
  if(ride.kind === 'kapal' && !force){
    const nearPier = Math.hypot(ride.x - PIER_END.x, ride.z - PIER_END.z) < 30, nearDock = Math.hypot(ride.x - TARAI[TARAI.length - 1][0], ride.z - TARAI[TARAI.length - 1][1]) < 35;
    if(!nearPier && !nearDock){ toast('Kapal hanya boleh berlabuh di jeti Teras atau jeti Pangkalan Laut.', 'bad'); return; }
    const L = nearPier ? PIER_LAND : {x:BASE.dock.x + Math.cos(BASE.back) * 14, z:BASE.dock.z + Math.sin(BASE.back) * 14};
    player.x = L.x; player.z = L.z; player.y = surfaceH(L.x, L.z); player.ry = ride.yaw; return endRide(nearPier ? 'Berlabuh di Pelabuhan Teras.' : 'Berlabuh di Pangkalan Laut Erythmind.');
  }
  if(ride.kind === 'drone') return endRide('Dron Peninjau kembali ke tangan kau.');
  const L = ride.layer, gy = groundAt(ride.x, ride.z, L === 1 ? 1 : L);
  if(ride.kind === 'jet' && !force){
    if(L === 0 && Math.hypot(ride.x - LAB.x, ride.z - LAB.z) < LAB.r && ride.y > LAB.y - 4 && ride.y < LAB.y + 14){
      if(!canLab()){ denyAccess('Pas tetamu kau tidak termasuk Labophase.', 'Labophase'); return; }
      setLayer(1); player.x = ride.x; player.z = ride.z; player.y = 0; return endRide('Mendarat di Labophase.');
    }
    if(ride.y - gy > 9 || ride.v > 70){ toast('Perlahankan dan turunkan jet dekat tanah untuk mendarat (atau ke atas pelantar Labophase).', 'bad'); return; }
    if(!canStand(ride.x, ride.z, L)){ toast('Tiada tempat mendarat di sini.', 'bad'); return; }
  }
  if(!canStand(ride.x, ride.z, L) && !force){ toast('Tiada tempat untuk keluar di sini.', 'bad'); return; }
  player.x = ride.x + Math.cos(ride.yaw) * 3; player.z = ride.z - Math.sin(ride.yaw) * 3; if(!canStand(player.x, player.z, L)){ player.x = ride.x; player.z = ride.z; }
  player.y = groundAt(player.x, player.z, L); player.ry = ride.yaw;
  endRide('Keluar dari ' + VEH[ride.kind].name + '.');
}
function endRide(msg){
  const k = ride.kind, home = ride.home; vehicles[k].g.visible = false; ride = null; me.g.visible = true;
  if(home){ Object.assign(player, {x:home.x, z:home.z, y:home.y, ry:home.ry}); me.g.rotation.y = home.ry; } camera.fov = 55; camera.updateProjectionMatrix();
  showRideHud(false); engineSound(0, 0); if(msg) toast(msg, 'ok'); pushPresence(true);
}
// manual control
function updateRide(dt){
  const r = ride, V = VEH[r.kind]; if(r.auto) return updateAuto(dt);
  const panelOpen = !$('#panel').hidden || !$('#map').hidden;
  const k = n => !panelOpen && (keys.has(n));
  const thr = (k('KeyW') || k('ArrowUp') ? 1 : 0) - (k('KeyS') || k('ArrowDown') ? 1 : 0) + joy.y + (rideBtn.thr || 0);
  const steer = (k('KeyD') || k('ArrowRight') ? 1 : 0) - (k('KeyA') || k('ArrowLeft') ? 1 : 0) + joy.x;
  const boost = k('ShiftLeft') || k('ShiftRight') || rideBtn.boost;
  const max = boost ? V.boost : V.max, acc = boost ? V.boostAcc : V.acc;
  if(thr > .1) r.v = Math.min(max, r.v + acc * thr * dt);
  else if(thr < -.1) r.v = Math.max(r.kind === 'car' ? -25 : r.kind === 'drone' || r.kind === 'kapal' ? -12 : 0, r.v + acc * 1.6 * thr * dt);
  else r.v *= Math.exp(-dt * (r.kind === 'car' ? .6 : r.kind === 'drone' ? 1.4 : r.kind === 'kapal' ? .25 : .15));
  if(r.v > max) r.v = lerp(r.v, max, 1 - Math.exp(-dt * 2));
  const turn = r.kind === 'kapal' ? .35 : r.kind === 'car' ? 1.6 * (1 - Math.min(Math.abs(r.v) / 520, .75)) * Math.sign(r.v || 1) : 1.1;
  r.yaw -= steer * turn * dt; r.roll = lerp(r.roll || 0, steer * (r.kind === 'jet' ? .6 : r.kind === 'drone' ? .2 : .05), .1);
  let nx = r.x + Math.sin(r.yaw) * r.v * dt, nz = r.z + Math.cos(r.yaw) * r.v * dt;
  if(r.kind === 'car'){
    if(!canStand(nx, nz, r.layer) || hitsCollider(nx, nz, r.layer, 1.4)){ if(Math.abs(r.v) > 40) { sfx.thud(); shake = .3; } r.v = -r.v * .25; nx = r.x; nz = r.z; }
    r.x = nx; r.z = nz; r.y = lerp(r.y, groundAt(r.x, r.z, r.layer) + .05, 1 - Math.exp(-dt * 18)); r.pitch = 0;
  } else if(r.kind === 'kapal'){
    if(surfaceH(nx, nz) > -1.4 || justiceGateBlocks(nx, nz)){ if(Math.abs(r.v) > 8){ sfx.thud(); shake = .2; } r.v = -r.v * .2; nx = r.x; nz = r.z; }
    if(!canLaut() && Math.hypot(nx - BASE.x, nz - BASE.z) < BASE.rOut + 40){ denyAccess('Pangkalan Laut: kapal tanpa pas ditolak Gerbang Keadilan.', 'Pangkalan Laut'); r.v = -12; nx = r.x; nz = r.z; }
    r.x = nx; r.z = nz; r.y = -.9; r.pitch = 0;
  } else if(r.kind === 'drone'){
    const vert = (k('Space') || rideBtn.up ? 1 : 0) - (k('KeyC') || k('ControlLeft') || rideBtn.down ? 1 : 0);
    const gy = groundAt(nx, nz, r.layer === 1 ? 1 : r.layer);
    if(r.y - gy < 16 && hitsCollider(nx, nz, r.layer, .8)){ r.v *= -.3; nx = r.x; nz = r.z; }
    r.x = nx; r.z = nz; r.y += vert * (boost ? 16 : 9) * dt;          // altitude hold: it stays where you leave it
    r.y = Math.max(r.y, groundAt(r.x, r.z, r.layer === 1 ? 1 : r.layer) + 1.2);
    r.pitch = lerp(r.pitch, -r.v / V.boost * .3, .08);
    droneRules(r);
  } else {
    const vert = (k('Space') || rideBtn.up ? 1 : 0) - (k('KeyC') || k('ControlLeft') || rideBtn.down ? 1 : 0);
    r.pitch = lerp(r.pitch, vert * .45, .08);
    r.x = nx; r.z = nz; r.y += (vert * 34 + Math.sin(r.pitch) * r.v * .4) * dt;
    const gy = groundAt(r.x, r.z, r.layer === 1 ? 1 : r.layer) + 1.6;
    if(r.y < gy){ r.y = gy; if(r.v > 120){ r.v *= .6; shake = .25; } }
    flightRules(r);
  }
  afterRideMove(dt);
}
let droneWarn = 0;
function droneRules(r){
  const warn = msg => { if(performance.now() - droneWarn > 3000){ droneWarn = performance.now(); toast(msg, 'bad', 2500); sfx.deny(); } };
  if(r.layer === 0){
    const dl = Math.hypot(r.x - LAB.x, r.z - LAB.z);
    if(dl < LAB.r + 6 && r.y > LAB.y - 10 && r.y < LAB.y + 36){ const a = Math.atan2(r.x - LAB.x, r.z - LAB.z); r.x = LAB.x + Math.sin(a) * (LAB.r + 6.5); r.z = LAB.z + Math.cos(a) * (LAB.r + 6.5); r.v *= .2; warn('Frontier Dome: ruang udara Labophase tertutup untuk dron.'); }
    if(Math.hypot(r.x - CAVE.x, r.z - CAVE.z) < CAVE.r && r.y < -10){ r.y = -10; warn('Isyarat dron tidak menembusi tirai ais Nivelham.'); }
    if(r.y > 200){ r.y = 200; warn('Siling altitud dron: 200 m.'); }
  } else if(r.layer === 3){
    const d = Math.hypot(r.x - PANG.x, r.z - PANG.z); if(d > PANG.r - 2){ const k = (PANG.r - 2.5) / d; r.x = PANG.x + (r.x - PANG.x) * k; r.z = PANG.z + (r.z - PANG.z) * k; r.v *= .3; } if(r.y > 80) r.y = 80;
  } else if(r.layer === 2){
    const rc = Math.hypot(r.x - CAVE.x, r.z - CAVE.z); if(rc > CAVE.r - 8){ const k = (CAVE.r - 8.5) / rc; r.x = CAVE.x + (r.x - CAVE.x) * k; r.z = CAVE.z + (r.z - CAVE.z) * k; r.v *= .3; warn('Dron kekal di dalam gua Nivelham.'); }
    if(r.y > CAVE.ceil - 10) r.y = CAVE.ceil - 10;
  } else if(r.layer === 1){
    const d = Math.hypot(r.x - LAB.x, r.z - LAB.z); if(d > LAB.r - 1.5){ const k = (LAB.r - 2) / d; r.x = LAB.x + (r.x - LAB.x) * k; r.z = LAB.z + (r.z - LAB.z) * k; r.v *= .3; } if(r.y > 24) r.y = 24;
  }
  const h = r.home, dh = Math.hypot(r.x - h.x, r.z - h.z);
  if(dh > 520){ const k = 519 / dh; r.x = h.x + (r.x - h.x) * k; r.z = h.z + (r.z - h.z) * k; r.v *= .3; warn('Isyarat lemah: had jarak dron 520 m dari kau.'); }
}
// Ronda Santai: slow autopilot loop over the city and the landmarks, high above the towers
const DRONE_TOUR = [['Kota Awam', 300, -150], ['Pusat Komuniti Awam', 185, -18], ['Menara Strategi', 230, 104], ['Taman Falsafah', 292, 120], ['Padang Singa & Rusa', 385, 12], ['Gerbang Nivelham', 418, -100], ['Lembah Abyss', 360, -150]];
function droneTour(){
  if(!ride || ride.kind !== 'drone') return;
  if(ride.auto){ ride.auto = null; toast('Ronda Santai dihentikan. Kawalan manual.', 'ok'); return; }
  if(ride.layer !== 0){ toast('Ronda Santai hanya di langit Fabriophase.', 'bad'); return; }
  const steps = DRONE_TOUR.map(([label, x, z]) => ({type:'fly', to:[x, z], land:Math.max(0, surfaceH(x, z)) + 85, cruise:85, short:true, speed:15, label}));
  steps.push({type:'loop'});
  let n = 0, bd = 1e9; DRONE_TOUR.forEach(([, x, z], i) => { const d = Math.hypot(x - ride.x, z - ride.z); if(d < bd){ bd = d; n = i; } });
  ride.auto = {steps, i:n, t:0, dest:null}; toast('Ronda Santai: dron meronda bandar dan mercu tanda secara perlahan. R / Keluar untuk ambil alih.', 'ok', 5000); beginStep();
}
function hitsCollider(x, z, layer, rad){ return colliders.some(c => c.layer === layer && Math.abs(x - c.x) < c.r + rad && Math.abs(z - c.z) < c.r + rad && Math.hypot(x - c.x, z - c.z) < c.r + rad); }
function flightRules(r){
  if(r.layer === 0){
    const dl = Math.hypot(r.x - LAB.x, r.z - LAB.z);
    if(!canLab() && dl < LAB.r + 5 && r.y > LAB.y - 8 && r.y < LAB.y + 34){ denyAccess('Jet ditolak Frontier Dome.', 'Labophase'); const a = Math.atan2(r.x - LAB.x, r.z - LAB.z); r.x = LAB.x + Math.sin(a) * (LAB.r + 12); r.z = LAB.z + Math.cos(a) * (LAB.r + 12); r.v *= .3; r.yaw = a; }
    const rc = Math.hypot(r.x - CAVE.x, r.z - CAVE.z);
    if(rc < CAVE.r && r.y < -14){
      if(!canNiv()){ denyAccess('Tirai ais Nivelham menolak jet ini.', 'Nivelham'); r.y = 10; r.v *= .3; const a = caveAng(r.x, r.z) / R2D_; r.x = CAVE.x + Math.cos(a) * (CAVE.lip + 30); r.z = CAVE.z + Math.sin(a) * (CAVE.lip + 30); return; }
      setLayer(2); r.layer = 2; r.y -= NVY; toast('Memasuki Nivelham melalui gerbang batu.', 'ok'); return;
    }
    const dp = Math.hypot(r.x - PANG.x, r.z - PANG.z);
    if(dp < PANG.r + 8 && r.y > PANG.y - 45 && r.y < PANG.y + 70){
      if(!canIstana()){ denyAccess('Perisai Istana Pangaea menolak jet ini.', 'Istana Pangaea'); const a = Math.atan2(r.x - PANG.x, r.z - PANG.z); r.x = PANG.x + Math.sin(a) * (PANG.r + 30); r.z = PANG.z + Math.cos(a) * (PANG.r + 30); r.v *= .3; r.yaw = a; return; }
      if(r.y > PANG.y - 4){ setLayer(3); r.layer = 3; r.y -= PANG.y; toast('Memasuki ruang udara Istana Pangaea.', 'ok'); return; }
      r.y = Math.min(r.y, PANG.y - 46);
    }
    if(!canLaut() && Math.hypot(r.x - BASE.x, r.z - BASE.z) < BASE.rOut + 60 && r.y < 200){ denyAccess('Ruang udara Pangkalan Laut: jet tanpa pas dihalau.', 'Pangkalan Laut'); const a = Math.atan2(r.x - BASE.x, r.z - BASE.z); r.x = BASE.x + Math.sin(a) * (BASE.rOut + 90); r.z = BASE.z + Math.cos(a) * (BASE.rOut + 90); r.v *= .3; r.yaw = a; }
    const d0 = Math.hypot(r.x - OVERVIEW[0].x, r.z - OVERVIEW[0].z); if(d0 > 1700){ r.yaw = Math.atan2(OVERVIEW[0].x - r.x, OVERVIEW[0].z - r.z); toast('Rudal peronda memandu jet kau kembali ke ruang udara Erythmind.'); }
    if(r.y > 900) r.y = 900;
  } else if(r.layer === 2){
    const rc = Math.hypot(r.x - CAVE.x, r.z - CAVE.z), open = inOpening(r.x, r.z);
    if(rc > CAVE.lip + 2 && open){ setLayer(0); r.layer = 0; r.y += NVY; toast('Keluar ke jurang Nivelham.', 'ok'); return; }
    if(rc > CAVE.r - 5 && !open){ const k = (CAVE.r - 6) / rc; r.x = CAVE.x + (r.x - CAVE.x) * k; r.z = CAVE.z + (r.z - CAVE.z) * k; r.v *= .6; r.yaw += Math.PI * .5; }
    if(r.y > CAVE.ceil - 8 && rc < CAVE.lip){ r.y = CAVE.ceil - 8; r.pitch = Math.min(r.pitch, 0); }
  } else if(r.layer === 3){
    if(Math.hypot(r.x - PANG.x, r.z - PANG.z) > PANG.r + 14 || r.y > 90 || r.y < -30){ setLayer(0); r.layer = 0; r.y += PANG.y; toast('Meninggalkan Istana Pangaea.', 'ok'); }
  } else if(r.layer === 1){
    if(Math.hypot(r.x - LAB.x, r.z - LAB.z) > LAB.r + 1 || r.y > 30){ setLayer(0); r.layer = 0; r.y += LAB.y; toast('Meninggalkan Labophase.', 'ok'); }
  }
}
function afterRideMove(dt){
  const r = ride, g = vehicles[r.kind].g, base = vehicleBase(r.layer);
  g.position.set(r.x, base + r.y, r.z); g.rotation.set(0, 0, 0); g.rotateY(r.yaw); g.rotateX(-r.pitch); g.rotateZ(r.roll || 0);
  player.x = r.x; player.z = r.z; player.y = r.y; player.ry = r.yaw; player.moving = false; player.layer = r.layer;
  me.g.position.set(r.x, base + r.y, r.z); me.g.visible = false;
  if(r.home){ const h = r.home; me.g.visible = true; me.g.position.set(h.x, base + h.y, h.z); me.g.rotation.y = Math.atan2(r.x - h.x, r.z - h.z); }
  const sp = Math.abs(r.v), hyper = sp > 300;
  vehicles[r.kind].flame.scale.set(1, .3 + sp / VEH[r.kind].boost * 1.7, 1); vehicles[r.kind].flame.material.opacity = .25 + sp / VEH[r.kind].boost * .6;
  vehicles[r.kind].flame.material.color.setHex(hyper ? 0xff6a3a : 0x9fc8ff);
  speedLines = lerp(speedLines, clamp((sp - 120) / 300, 0, 1), .1);
  camera.fov = lerp(camera.fov, 55 + speedLines * 22, .08); camera.updateProjectionMatrix();
  if(hyper && performance.now() - lastBoom > 8000 && AU.ctx){ lastBoom = performance.now(); sfx.thud(); noiseHit({d:1.4, v:.45, f:220, brown:true}); toast('BOOM SONIK · HIPERSONIK', 'ok', 1800); }
  engineSound(r.kind, sp); updateRideHud(); lastActive = performance.now();
  if(player.layer === 0 && (Math.floor(r.x / 40) !== player.lx || Math.floor(r.z / 40) !== player.lz)){ player.lx = Math.floor(r.x / 40); player.lz = Math.floor(r.z / 40); updateLayerLine(); }
}
const _cf = new THREE.Vector3();
function rideCamera(dt){
  const r = ride, base = vehicleBase(r.layer), V = VEH[r.kind];
  if(r.kind === 'drone' && r.gimbal){ // camera hangs under the drone looking down and ahead
    camTarget.set(r.x + Math.sin(r.yaw) * 26, base + r.y - 30, r.z + Math.cos(r.yaw) * 26); _cf.set(r.x, base + r.y - .6, r.z);
    camera.position.lerp(_cf, 1 - Math.exp(-dt * 10)); camera.lookAt(camTarget); cam.yaw = Math.PI + r.yaw; return; }
  const back = (r.kind === 'jet' ? 24 : r.kind === 'drone' ? 9 : r.kind === 'kapal' ? 30 : 11) * clamp(cam.tdist / 13, .5, 6) + Math.abs(r.v) * (r.kind === 'jet' ? .03 : .02);
  const up = r.kind === 'jet' ? 7 : r.kind === 'drone' ? 3 + back * .35 : r.kind === 'kapal' ? 10 : 3.6;
  const yaw = r.yaw + (cam.yaw || 0) * 0;
  camTarget.set(r.x + Math.sin(yaw) * 6, base + r.y + V.h, r.z + Math.cos(yaw) * 6);
  _cf.set(r.x - Math.sin(yaw) * back, base + r.y + up + back * .12, r.z - Math.cos(yaw) * back);
  const floor = base + groundAt(_cf.x, _cf.z, r.layer === 1 ? 1 : r.layer) + 1.5; if(_cf.y < floor) _cf.y = floor;
  if(shake > 0){ shake = Math.max(0, shake - dt); _cf.x += (Math.random() - .5) * shake * 3; _cf.y += (Math.random() - .5) * shake * 3; }
  camera.position.lerp(_cf, 1 - Math.exp(-dt * (r.auto ? 3 : 6))); camera.lookAt(camTarget);
  cam.yaw = Math.PI + r.yaw;
}
// engine audio
let eng = null;
function engineSound(kind, sp){
  if(!AU.ctx){ return; }
  if(!eng){ const ctx = AU.ctx; const o = ctx.createOscillator(); o.type = 'sawtooth'; const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 400; const g = ctx.createGain(); g.gain.value = 0;
    const n = ctx.createBufferSource(); n.buffer = AU.white; n.loop = true; const nf = ctx.createBiquadFilter(); nf.type = 'bandpass'; nf.frequency.value = 900; const ng = ctx.createGain(); ng.gain.value = 0;
    o.connect(f); f.connect(g); g.connect(AU.sfxG); n.connect(nf); nf.connect(ng); ng.connect(AU.sfxG); o.start(); n.start(); eng = {o, f, g, nf, ng}; }
  const t = AU.ctx.currentTime, on = kind ? 1 : 0;
  eng.o.frequency.setTargetAtTime(kind === 'kapal' ? 38 + sp * .6 : kind === 'jet' ? 60 + sp * .5 : kind === 'drone' ? 150 + sp * 3 : 45 + sp * 1.4, t, .2);
  eng.f.frequency.setTargetAtTime(300 + sp * 6, t, .2);
  eng.g.gain.setTargetAtTime(on * (.05 + Math.min(sp, 400) / 400 * .1), t, .2);
  eng.nf.frequency.setTargetAtTime(600 + sp * 4, t, .3);
  eng.ng.gain.setTargetAtTime(kind === 'drone' ? .03 : on * Math.min(sp, 520) / 520 * (kind === 'jet' ? .35 : .18), t, .3);
  if(kind === 'drone'){ eng.g.gain.setTargetAtTime(.035, t, .2); eng.nf.frequency.setTargetAtTime(2400, t, .3); }
}
// HUD + touch controls
const rideBtn = {thr:0, up:false, down:false, boost:false};
function showRideHud(on){ $('#ride').hidden = !on; $('#speedfx').hidden = !on; $('#tools').classList.toggle('dim', on); }
function updateRideHud(){
  if(!ride) return; const sp = Math.abs(ride.v), mach = sp / 60;
  const dr = ride.kind === 'drone';
  $('#rideName').textContent = VEH[ride.kind].name + (ride.auto ? (dr ? ' · Ronda Santai' : ' · autopilot') : '');
  const sh = ride.kind === 'kapal';
  $('#rideSpeed').textContent = dr ? `${Math.round(sp * 3.6)} km/j` : sh ? `${Math.round(sp * 1.94)} knot` : `MACH ${mach.toFixed(1)}`;
  $('#rideNote').textContent = sh ? (ride.auto ? 'Menunggang Arus Tarai' : 'Laut terbuka · F di jeti untuk berlabuh') : dr ? `Altitud ${Math.max(0, Math.round(ride.y - groundAt(ride.x, ride.z, ride.layer === 1 ? 1 : ride.layer)))} m · ${Math.round(Math.hypot(ride.x - ride.home.x, ride.z - ride.home.z))} m dari kau${ride.gimbal ? ' · gimbal' : ''}` : mach >= 5 ? 'HIPERSONIK' : mach >= 1 ? 'SUPERSONIK' : ride.kind === 'jet' ? `Altitud ${Math.max(0, Math.round(ride.y))} m` : 'Darat';
  $('#ride').classList.toggle('hyper', !dr && !sh && mach >= 5);
  $('#rideUp').hidden = $('#rideDown').hidden = ride.kind === 'car' || sh; $('#rideBoost').hidden = sh;
  const fx = $('#speedfx'); fx.style.opacity = speedLines.toFixed(2);
}
[['rideBoost', 'boost'], ['rideUp', 'up'], ['rideDown', 'down']].forEach(([id, k]) => { const b = $('#' + id);
  b.addEventListener('pointerdown', e => { rideBtn[k] = true; b.setPointerCapture(e.pointerId); }); ['pointerup', 'pointercancel'].forEach(ev => b.addEventListener(ev, () => rideBtn[k] = false)); });
$('#rideExit').addEventListener('click', () => { if(ride?.auto){ ride.auto = null; toast('Autopilot dibatalkan. Kawalan manual.', 'ok'); } else exitRide(); });

// other people's vehicles
const peerVeh = new Map();
anims.push(() => {
  peerVeh.forEach((v, id) => { const a = peers.get(id); if(!a || a.vk !== v.kind){ scene.remove(v.g); peerVeh.delete(id); } });
  peers.forEach((a, id) => {
    if(!a.vk) { a.p.g.visible = a.p.g.visible; return; }
    let v = peerVeh.get(id); if(!v){ v = {kind:a.vk, g:vehicles[a.vk].g.clone()}; v.g.visible = true; scene.add(v.g); peerVeh.set(id, v); }
    const y = layerBase(a.l) + (a.vk === 'car' ? groundAt(a.x, a.z, a.l) : a.vk === 'kapal' ? -.9 : a.vy);
    v.g.position.set(a.x, y, a.z); v.g.rotation.set(0, a.ry, 0); v.g.visible = (a.l === 2) === (player.layer === 2); a.p.g.visible = false;
  });
});

/* ================= autopilot expeditions ================= */
const EXPED = [
  {id:'records', name:'Eryth Records', sub:'Biji kopi retak · bank data otak', x:49, y:9, layer:1, to:[BEAN.x, BEAN.z + 13]},
  {id:'labo', name:'Labophase', sub:'Makmal Cara Fikir · Frontier Dome', x:31, y:16, layer:1, to:[LAB.x - 12, LAB.z + 16]},
  {id:'ac', name:'Panel Island A.C.', sub:'Kawalan iklim', x:64, y:11, layer:1, to:[LAB.x + 15, LAB.z + 15]},
  {id:'plaza', name:'Plaza Hologram · Teras', sub:'Parfait gergasi · Mesin Serba Guna', x:16, y:30, layer:0, to:[0, 15]},
  {id:'kota', name:'Kota Awam', sub:'Menara kaca · monorel · Bot Bayang', x:25, y:34, layer:0, to:[300, -150]},
  {id:'komuniti', name:'Pusat Komuniti Awam', sub:'Menara Jam · Masjid · Dewan', x:41, y:39, layer:0, to:[185, -18]},
  {id:'falsafah', name:'Taman Falsafah', sub:'Stoa & kolam renungan', x:56, y:50, layer:0, to:[292, 120]},
  {id:'strategi', name:'Menara Strategi', sub:'Bilik gerakan', x:67, y:38, layer:0, to:[230, 104]},
  {id:'tasik', name:'Tasik Tenang', sub:'Padang rusa & kuda', x:73, y:58, layer:0, to:[372, -6]},
  {id:'pantai', name:'Pantai Memori', sub:'Botol kenangan', x:84, y:55, layer:0, to:[6, 60]},
  {id:'hutan', name:'Hutan Emosi', sub:'Pokok Rasa', x:7, y:46, layer:0, to:[-28, 18]},
  {id:'gerbang', name:'Gerbang Nivelham', sub:'Banjaran salji · lif aci', x:84, y:37, layer:0, to:[NIV_PAD.x + 6, NIV_PAD.z + 8]},
  {id:'lembah', name:'Lembah Nivelham', sub:'Salji tebal · binatang buas gergasi', x:43, y:71, layer:2, to:[330, -110]},
  {id:'gua', name:'Perkampungan Gua Besar', sub:'Rumah kayu balak · Dewan Panjang Rahsia', x:31, y:87, layer:2, to:[300, 62]},
  {id:'hikmah', name:'Perpustakaan Hikmah', sub:'Pokok Purba · Laluan Dahan 8', x:64, y:76, layer:2, to:[386, 60]},
];
function openMap(){
  if(!session) return; closePanel(); audioStart();
  const m = $('#map'); m.hidden = false; $('#mapCard').hidden = true;
  $('#mapPins').innerHTML = EXPED.map(d => `<button type="button" class="pin ${d.layer === 1 ? 'l1' : d.layer === 2 ? 'l2' : ''}" data-id="${d.id}" style="left:${d.x}%;top:${d.y}%"><i></i><span>${esc(d.name)}</span></button>`).join('');
  $('#mapPins').querySelectorAll('.pin').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); mapCard(EXPED.find(d => d.id === b.dataset.id), b); }));
  sfx.click();
}
function closeMap(){ $('#map').hidden = true; }
function mapCard(d, pin){
  document.querySelectorAll('.pin').forEach(p => p.classList.toggle('sel', p === pin));
  const lock = d.layer === 1 && !canLab() ? 'Pas kau tidak termasuk Labophase.' : d.layer === 2 && !canNiv() ? 'Pas kau tidak termasuk Nivelham.' : d.layer === 4 && !canNiv() ? 'Pas kau tidak termasuk Nivelham.' : d.layer === 5 && !canLaut() ? 'Pas kau tidak termasuk Pangkalan Laut.' : d.layer === 3 && !canIstana() ? 'Istana Pangaea hanya untuk rakan kongsi terpilih.' : d.id === 'pangkalan' && !canLaut() ? 'Pas kau tidak termasuk Pangkalan Laut.' : '';
  const sea = d.id === 'pangkalan' || d.id === 'pelabuhan', carOk = d.layer === 0 && player.layer !== 1 && player.layer !== 3 && d.id !== 'pangkalan';
  const c = $('#mapCard'); c.hidden = false;
  c.innerHTML = `<div class="eyebrow">${['Fabriophase', 'Labophase', 'Nivelham', 'Istana Pangaea', 'Dewan Baitul Hikmah', 'Labirin Memori'][d.layer]}</div><strong>${esc(d.name)}</strong><span class="note">${esc(d.sub)}</span>
    ${lock ? `<div class="note warn">${lock}</div>` : d.layer >= 4 ? `<div class="row"><button class="btn pri" type="button" data-go="tp">Teleport ke dalam</button></div><div class="note">Dewan dalaman: kenderaan tidak boleh masuk.</div>` : `<div class="row"><button class="btn pri" type="button" data-go="jet">Terbang · Jet Hypersonik</button>${sea ? '<button class="btn" type="button" data-go="kapal">Belayar · Arus Tarai</button>' : ''}<button class="btn" type="button" data-go="car" ${carOk ? '' : 'disabled'}>Pandu · Veyron Hypersonik</button><button class="btn ghost" type="button" data-go="tp">Teleport</button></div>${carOk ? '' : '<div class="note">Veyron hanya untuk destinasi darat di Fabriophase.</div>'}`}`;
  c.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => { closeMap(); expedition(d, b.dataset.go); }));
}
function expedition(d, how){
  if(how === 'tp'){
    if(ride) endRide();
    flash('rgba(255,255,255,.8)'); sfx.whoosh(); setLayer(d.layer); player.x = d.to[0]; player.z = d.to[1]; player.y = groundAt(player.x, player.z, d.layer); cam.tdist = 13; toast('Tiba: ' + d.name, 'ok'); return;
  }
  if(ride && ride.kind !== how) endRide();
  if(how === 'kapal') return sail(d);
  if(!ride) summon(how);
  const r = ride; const steps = [];
  const startLayer = r.layer;
  if(startLayer === 3 && d.layer !== 3){ if(how !== 'jet'){ toast('Hanya jet boleh turun dari Istana Pangaea.', 'bad'); endRide(); return; } steps.push({type:'toLayer', layer:0}); }
  // leave Nivelham / Labophase first
  const mid = (CAVE.open[0] + CAVE.open[1]) / 2 / R2D_, outP = (rad) => [CAVE.x + Math.cos(mid) * rad, CAVE.z + Math.sin(mid) * rad];
  if(startLayer === 2 && d.layer !== 2){ if(how !== 'jet'){ toast('Veyron hanya di darat Fabriophase.', 'bad'); return; } steps.push({type:'fly', layer:2, to:outP(CAVE.lip + 25), land:70, cruise:70, short:true}); steps.push({type:'toLayer', layer:0}); }
  if(startLayer === 1 && d.layer !== 1){ steps.push({type:'warpTo', layer:0, x:r.x, z:r.z, y:LAB.y + 6}); }
  if(how === 'jet'){
    if(d.layer === 2){
      if(startLayer !== 2){ steps.push({type:'fly', to:outP(CAVE.lip + 70), land:-70, cruise:150}); steps.push({type:'niv'}); steps.push({type:'toLayer', layer:2}); }
      steps.push({type:'fly', layer:2, to:d.to, land:nivH(d.to[0], d.to[1]) + 2, cruise:75, short:true});
      steps.push({type:'arrive', layer:2, x:d.to[0], z:d.to[1]});
    } else if(d.layer === 3){
      if(startLayer !== 3){ steps.push({type:'fly', to:[PANG.x, PANG.z + PANG.r + 50], land:PANG.y + 6, cruise:PANG.y + 30}); steps.push({type:'istana'}); steps.push({type:'toLayer', layer:3}); }
      steps.push({type:'fly', layer:3, to:d.to, land:pangH(d.to[0], d.to[1]) + 2, cruise:24, short:true});
      steps.push({type:'arrive', layer:3, x:d.to[0], z:d.to[1]});
    } else if(d.layer === 1){
      steps.push({type:'fly', to:[LAB.x, LAB.z + 46], land:LAB.y + 12, cruise:LAB.y + 40});
      steps.push({type:'dome'});
      steps.push({type:'fly', to:d.to, land:LAB.y + 2, cruise:LAB.y + 14, short:true});
      steps.push({type:'arrive', layer:1, x:d.to[0], z:d.to[1]});
    } else { steps.push({type:'fly', to:d.to, land:surfaceH(d.to[0], d.to[1]) + 2, cruise:170}); steps.push({type:'arrive', layer:0, x:d.to[0], z:d.to[1]}); }
  } else {
    if(startLayer !== 0){ steps.length = 0; toast('Veyron hanya di darat Fabriophase.', 'bad'); return; }
    const pts = [[r.x, r.z]]; const inCore = (x, z) => Math.hypot(x, z) < 75;
    if(inCore(r.x, r.z) !== inCore(d.to[0], d.to[1])){ const a = [BRIDGE.ax - 4, BRIDGE.az + 1], b = [BRIDGE.bx + 4, BRIDGE.bz - 1]; if(inCore(r.x, r.z)) pts.push(a, b); else pts.push(b, a); }
    pts.push(d.to);
    steps.push({type:'drive', pts}); steps.push({type:'arrive', layer:0, x:d.to[0], z:d.to[1]});
  }
  r.auto = {steps, i:0, t:0, dest:d}; toast(`Autopilot: ${VEH[how].name} ke ${d.name}. Tekan Keluar untuk ambil alih.`, 'ok', 5000);
  beginStep();
}
function sail(d){
  if(d.id === 'pangkalan' && !canLaut()){ denyAccess('Pas kau tidak termasuk Pangkalan Laut.', 'Pangkalan Laut'); return; }
  if(!ride) summonShip(); const r = ride;
  const toBase = d.id === 'pangkalan', path = toBase ? TARAI : [...TARAI].reverse();
  let n = 0, bd = 1e9; path.forEach(([x, z], i) => { const q = Math.hypot(x - r.x, z - r.z); if(q < bd){ bd = q; n = i; } });
  const pts = [[r.x, r.z], ...path.slice(n + 1)]; if(pts.length < 2){ toast('Kapal sudah di jeti ' + d.name + '.', 'ok'); return; }
  const land = toBase ? {x:BASE.dock.x + Math.cos(BASE.back) * 14, z:BASE.dock.z + Math.sin(BASE.back) * 14} : PIER_LAND;
  r.auto = {steps:[{type:'drive', pts, sea:true}, {type:'arrive', layer:0, x:land.x, z:land.z}], i:0, t:0, dest:d};
  toast(`Kapal menunggang Arus Tarai ke ${d.name}.${toBase ? ' Gerbang Keadilan akan terbuka untuk kau.' : ''}`, 'ok', 5000); beginStep();
}
function beginStep(){
  const r = ride, a = r.auto, s = a.steps[a.i]; if(!s){ return finishAuto(); }
  a.t = 0;
  if(s.type === 'fly'){
    if(s.layer != null && r.layer !== s.layer) { a.i++; return beginStep(); }
    const sx = r.x, sz = r.z, sy = r.y, [tx, tz] = s.to; const dist = Math.hypot(tx - sx, tz - sz);
    const cr = s.short ? Math.max(sy, s.cruise) : Math.max(s.cruise, sy + 20, s.land + 20);
    const P = [new THREE.Vector3(sx, sy, sz), new THREE.Vector3(sx + Math.sin(r.yaw) * 20, sy + (cr - sy) * .5, sz + Math.cos(r.yaw) * 20), new THREE.Vector3(lerp(sx, tx, .5), cr, lerp(sz, tz, .5)), new THREE.Vector3(lerp(sx, tx, .85), lerp(cr, s.land, .5), lerp(sz, tz, .85)), new THREE.Vector3(tx, s.land, tz)];
    s.curve = new THREE.CatmullRomCurve3(P); s.dur = s.speed ? Math.max(5, s.curve.getLength() / s.speed) : clamp(dist / 140, s.short ? 2.5 : 4, 10);
    if(s.label) toast('Meninjau: ' + s.label, 'ok', 3000);
  } else if(s.type === 'drive'){
    const pts = []; for(let i = 0; i < s.pts.length - 1; i++){ const [ax, az] = s.pts[i], [bx, bz] = s.pts[i + 1]; const n = Math.max(2, Math.ceil(Math.hypot(bx - ax, bz - az) / 6)); for(let k = 0; k < n; k++){ const x = lerp(ax, bx, k / n), z = lerp(az, bz, k / n); pts.push(new THREE.Vector3(x, 0, z)); } }
    pts.push(new THREE.Vector3(s.pts[s.pts.length - 1][0], 0, s.pts[s.pts.length - 1][1]));
    s.curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal', .2); s.dur = s.sea ? s.curve.getLength() / 75 : clamp(s.curve.getLength() / 150, 3, 9);
  } else if(s.type === 'warpTo'){
    flash('rgba(143,224,255,.85)'); sfx.whoosh(); setLayer(s.layer); r.layer = s.layer; r.x = s.x; r.z = s.z; r.y = s.y; a.i++; return beginStep();
  } else if(s.type === 'toLayer'){
    r.y += layerBase(r.layer) - layerBase(s.layer); setLayer(s.layer); r.layer = s.layer; a.i++; return beginStep();
  } else if(s.type === 'istana'){
    if(!canIstana()){ denyAccess('Perisai Istana Pangaea menolak autopilot.', 'Istana Pangaea'); r.auto = null; return; }
    toast('Perisai Istana Pangaea mengenali kau. Jambatan awan dibuka.', 'ok'); a.i++; return beginStep();
  } else if(s.type === 'niv'){
    if(!canNiv()){ denyAccess('Tirai ais Nivelham menolak autopilot.', 'Nivelham'); r.auto = null; return; }
    toast('Gerbang batu Nivelham terbuka.', 'ok'); a.i++; return beginStep();
  } else if(s.type === 'dome'){
    if(!canLab()){ denyAccess('Autopilot ditolak Frontier Dome.', 'Labophase'); r.auto = null; return; }
    domeU.uAlert.value = .3; toast('Frontier Dome mengenali pemilik. Laluan dibuka.', 'ok'); a.i++; return beginStep();
  } else if(s.type === 'loop'){ a.i = 0; return beginStep();
  } else if(s.type === 'arrive'){ return finishAuto(s); }
}
const _tg = new THREE.Vector3();
function updateAuto(dt){
  const r = ride, a = r.auto, s = a.steps[a.i]; if(!s){ return finishAuto(); }
  a.t += dt; const k = clamp(a.t / s.dur, 0, 1), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
  const p = s.curve.getPoint(e), q = s.curve.getPoint(Math.min(1, e + .01));
  const prevX = r.x, prevZ = r.z, prevY = r.y;
  r.x = p.x; r.z = p.z;
  if(s.type === 'drive'){ r.y = s.sea ? -.9 : groundAt(r.x, r.z, 0) + .05; r.pitch = 0; } else { r.y = p.y; r.pitch = Math.atan2(q.y - p.y, Math.hypot(q.x - p.x, q.z - p.z) || 1e-3) * .6; }
  if(Math.hypot(q.x - p.x, q.z - p.z) > 1e-3) r.yaw = Math.atan2(q.x - p.x, q.z - p.z);
  r.v = Math.hypot(r.x - prevX, r.z - prevZ, r.y - prevY) / Math.max(dt, 1e-3);
  r.roll = 0; afterRideMove(dt);
  if(k >= 1){ a.i++; beginStep(); }
}
function finishAuto(s){
  const r = ride, d = r.auto?.dest; r.auto = null; r.v = 0;
  if(s){ if(s.layer !== player.layer) setLayer(s.layer); player.x = s.x; player.z = s.z; player.y = groundAt(s.x, s.z, s.layer); player.layer = s.layer; }
  endRide(null); if(d) toast('Tiba di ' + d.name + '.', 'ok');
}

/* ================= HUD wiring ================= */
$('#bMap').addEventListener('click', openMap);
$('#mapX').addEventListener('click', closeMap);
$('#map').addEventListener('click', e => { if(e.target.id === 'map' || e.target.id === 'mapImg') $('#mapCard').hidden = true; });
$('#bRide').addEventListener('click', () => { if(!session) return; if(ride) return exitRide(); openRideChooser(); });
function openRideChooser(){
  ui.view = 'ride';
  openPanel(`${head('Garaj Hipersonik', 'Kenderaan', 'Panggil kenderaan ke sisi kau. Jet boleh ke mana-mana lapisan yang pas kau benarkan; Veyron untuk darat.')}
  <div class="pb"><div class="seg">
    <button type="button" class="card" data-k="jet"><strong>Jet Hypersonik</strong><span>Terbang ke Labophase dan menyelam ke Nivelham melalui Gerbang. W pecut, A/D belok, Space naik, C turun, Shift hipersonik, F mendarat.</span></button>
    <button type="button" class="card" data-k="car" ${player.layer === 1 ? 'disabled' : ''}><strong>Veyron Hypersonik</strong><span>Hypercar darat. W pecut, S brek, A/D stereng, Shift hipersonik, F keluar.</span></button>
    <button type="button" class="card" data-k="kapal" ${player.layer !== 0 ? 'disabled' : ''}><strong>Kapal Arus Tarai</strong><span>Kapal perang peronda. Panggil di jeti Teras atau jeti Pangkalan Laut. Peta Ekspedisi (P) untuk belayar automatik melalui Gerbang Keadilan.</span></button>
    <button type="button" class="card" data-k="drone"><strong>Dron Peninjau</strong><span>Kau kekal di tanah dan terbang santai memantau bandar dari kamera dron. Altitud kekal bila dilepaskan. Space/C naik turun, V kamera gimbal, F panggil pulang.</span></button>
    <button type="button" class="card" data-k="tour" ${player.layer !== 0 ? 'disabled' : ''}><strong>Dron · Ronda Santai</strong><span>Autopilot perlahan 85 m di atas Kota Awam, Pusat Komuniti, Taman Falsafah, padang singa dan Gerbang Nivelham, berulang-ulang.</span></button>
  </div><div class="note">Untuk ekspedisi berpandu, buka Peta Ekspedisi (P) dan pilih destinasi.</div></div>`, '#ff4f45');
  document.querySelectorAll('[data-k]').forEach(b => b.addEventListener('click', () => { if(b.dataset.k === 'tour'){ if(!ride) summon('drone'); droneTour(); } else summon(b.dataset.k); }));
}
addEventListener('keydown', e => {
  if(!session || !$('#gate').hidden || typing()) return;
  if(e.code === 'KeyP'){ $('#map').hidden ? openMap() : closeMap(); e.preventDefault(); }
  if(e.code === 'KeyF' && $('#panel').hidden && $('#map').hidden){ if(ride) exitRide(); else openRideChooser(); e.preventDefault(); }
  if(e.key === 'Escape' && !$('#map').hidden) closeMap();
  if(e.code === 'KeyV' && ride?.kind === 'drone'){ ride.gimbal = !ride.gimbal; toast(ride.gimbal ? 'Kamera gimbal: pandang ke bawah.' : 'Kamera kejar.', 'ok', 1500); }
  if(e.code === 'KeyR' && ride?.kind === 'drone') droneTour();
  if(e.key === 'Escape' && ride?.auto){ ride.auto = null; toast('Autopilot dibatalkan.', 'ok'); }
});

/* ================= loading Higgsfield models ================= */
const DRONE_ROT = -Math.PI / 2;   // the Higgsfield drone faces +x; turn its camera to +z
async function loadHiggsfield(){
  let man; try{ const r = await fetch('assets/manifest.json'); if(!r.ok) return; man = await r.json(); }catch(e){ return; }
  if(!THREE.GLTFLoader) return; const loader = new THREE.GLTFLoader();
  const list = Object.entries(man || {}); HF.total = list.length; hfChip();
  const load = (key, file) => new Promise(res => loader.load(file, g => res(g), undefined, () => res(null)));
  // each model briefly blocks the page while it is parsed, so wait for a quiet moment: at the gate, until nobody
  // has typed or tapped for a second; in the world, at least a couple of frames between models
  const quiet = () => new Promise(res => { const go = () => (session || (performance.now() - lastActive > 1100 && !gateBusy)) ? res() : setTimeout(go, 200); setTimeout(go, session ? 60 : 150); });
  for(const [key, file] of list){
    await quiet();
    const gltf = await load(key, file); HF.done++; hfChip(); if(!gltf) continue;
    try{ applyModel(key, gltf); }catch(err){ console.warn('model', key, err); }
  }
}
function applyModel(key, gltf){
  if(UPGRADES[key]){ const spec = UPGRADES[key], m = gltf.scene, holder = new THREE.Group(); holder.add(m);
    m.traverse(o => { if(o.isMesh){ o.castShadow = true; o.receiveShadow = true; if(o.material) o.material.metalness = Math.min(o.material.metalness ?? 0, .2); } });
    fitModel(m, spec);
    if(spec.hide === 'all') spec.g.children.forEach(c => c.visible = false);
    else if(spec.hide === 'meshes') spec.g.children.forEach(c => { if(c.isMesh && !(spec.keep || []).includes(c)) c.visible = false; });
    else spec.hide.forEach(h => h.visible = false);
    spec.g.add(holder); if(spec.after){ spec.g.updateMatrixWorld(true); spec.after(m); } return; }
  if(key === 'animDuduk'){ AV.sit = prepareWalkClip(gltf.animations[0]); return; }
  if(key === 'animBaring'){ AV.lie = prepareWalkClip(gltf.animations[0]); return; }
  if(key === 'animJudgment'){ HAKI.clips.judgment = prepareWalkClip(gltf.animations[0]); return; }
  if(key === 'animShout'){ HAKI.clips.shout = prepareWalkClip(gltf.animations[0]); return; }
  if(key === 'pedang'){ setSwordModel(gltf); return; }
  if(key === 'avatar'){ AV.src = gltf.scene; AV.clip = gltf.animations?.length ? prepareWalkClip(gltf.animations[0]) : null; return; }
  if(key === 'erythRecords'){
    const canon = canonical(gltf.scene, 1); const model = buildFrom(canon);
    const holder = grp(0, 0, -4, lab); holder.add(model); [halfA, halfB, brain].forEach(m => m.visible = false); bean.children.forEach(c => { if(c.isMesh) c.visible = false; });
    anims.push(() => { const s = beanSize(); holder.scale.setScalar(s.y * 2.6); });
    return;
  }
  if(key === 'gergasi'){ setupGiantModel(gltf); return; }
  if(key === 'gergasiTidur'){ GIANT.clips.sit = gltf.animations?.[0]; if(GIANT.mixer && GIANT.state === 'tidur') play('sit'); return; }
  if(key === 'gergasiTunduk'){ GIANT.clips.kneel = gltf.animations?.[0]; return; }
  if(key === 'tukul'){
    const canon = canonical(gltf.scene, 1, {alignLong:true, headForward:true}); const m = buildFrom(canon); const s = GIANT.H * .4 / canon.len; m.position.z = canon.len * .42;
    const g = new THREE.Group(); g.add(m); g.scale.setScalar(s); g.rotation.x = Math.PI / 2; GIANT.hammerModel = g; if(GIANT.hand) attachGiantHammer(); return;
  }
  if(key === 'dementor'){   // the maze guardians take the Higgsfield body; the raid swarm keeps the light procedural one
    const canon = canonical(gltf.scene, 4.9); const parts = canon.geos.map(({g}) => g.index ? g.toNonIndexed() : g);
    const geo = parts.length === 1 ? parts[0] : null; if(!geo) return; geo.translate(0, -3.1, 0); geo.computeVertexNormals();
    const map = canon.geos[0].mat?.map; demMesh.geometry = geo; if(map){ demMesh.material.map = map; demMesh.material.color.setHex(0xffffff); demMesh.material.needsUpdate = true; } return;
  }
  if(key === 'tinju'){
    const canon = canonical(gltf.scene, 1, {rotY:-2.485}); const m = buildFrom(canon); m.position.y = -.5; m.traverse(o => { if(o.isMesh) o.castShadow = false; });
    const g = new THREE.Group(); g.add(m); g.scale.setScalar(1.35 / canon.len); GEAR.fistModel = g; return;
  }
  if(key === 'istana'){
    const canon = canonical(gltf.scene, 1, {rotY:Math.PI / 2}); const model = buildFrom(canon); model.scale.setScalar(70 / canon.len);   // keeps the south door clear of the model
    model.position.set((PK.x0 + PK.x1) / 2, 0, (PK.z0 + PK.z1) / 2); pg.add(model); PANG_HF.model = model; return;
  }
  if(key === 'markas'){
    const canon = canonical(gltf.scene, 1); const model = buildFrom(canon); model.scale.setScalar(56 / canon.len);
    hqProc.visible = false; hqSign.add(model); return;
  }
  if(key === 'kapal'){
    const canon = canonical(gltf.scene, 1);
    const fit = (g, len) => { const m = buildFrom(canon); m.scale.setScalar(len / canon.len); m.position.y = -1.8; g.add(m); };
    vehicles.kapal.proc.visible = false; fit(vehicles.kapal.g, 28);
    fleet.forEach(f => { f.g.children[0].visible = false; fit(f.g, 28 / 1.6); }); return;
  }
  if(key === 'drone'){
    const canon = canonical(gltf.scene, 1, {rotY:DRONE_ROT}); const model = buildFrom(canon); model.scale.setScalar(3.4 / canon.len); model.position.y = .2;
    const V = vehicles.drone; V.rotors = []; V.proc.visible = false; V.g.add(model); return;
  }
  if(key === 'jet' || key === 'car'){
    const canon = canonical(gltf.scene, key === 'jet' ? 3.6 : 1.55, {alignLong:true, headForward:true, rotY:Math.PI});
    const V = vehicles[key]; const model = buildFrom(canon); const s = (key === 'jet' ? 18 : 5.6) / canon.len; model.scale.setScalar(s);
    V.proc.visible = false; V.g.add(model); return;
  }
  if(SPECIES[key]){
    const canon = canonical(gltf.scene, SPECIES[key].h, {alignLong:true, headForward:true});
    animals.filter(a => a.kind === key).forEach(a => upgradeCreature(a, canon, key));
    beasts.filter(b => b.kind === key).forEach(b => upgradeCreature(b, canon, key));
  }
}
