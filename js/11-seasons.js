/* ================= seasons & weather extras: wind sway, leaf colour, lightning, rainbow, aurora ================= */
const SEASON_LEAF = {
  bunga:[0xf2a7c8, 0xf9c9dc, 0x5aab55],
  luruh:[0xd9692a, 0xe8a23a, 0xb8452a],
  kemarau:[0x9c9a4a, 0xaaa456, 0x7f8a40],
  salji:[0xe4ecf0, 0xd8e4ea, 0x5f7f6a],
};
const LEAF_BASE = leafMats.map(m => m.color.getHex()), OLIVE_BASE = oliveMat.color.getHex();
const _lc = new THREE.Color(), _sq = new THREE.Quaternion(), _sax = new THREE.Vector3(), _sp = new THREE.Vector3(), _ss = new THREE.Vector3(), _sm = new THREE.Matrix4(), _sq0 = new THREE.Quaternion();

// wind: every tree bends about its base, leaning downwind with gusts
let swayOn = false;
function treeLean(x, z, t){
  const w = windNow;
  return w * (.05 + .1 * w) + w * (.05 + .12 * w) * (Math.sin(t * (1.3 + w * 1.2) + x * .07 + z * .05) * .7 + Math.sin(t * 3.4 + x * .19 - z * .13) * .3);
}
function applySway(t, calm){
  const dir = .25 + Math.sin(t * .05) * .3; _sax.set(Math.sin(dir), 0, -Math.cos(dir));
  swayGroups.forEach(g => { const u = g.userData; if(!u.q0) u.q0 = g.quaternion.clone();
    if(calm) g.quaternion.copy(u.q0); else { _sq.setFromAxisAngle(_sax, treeLean(g.position.x, g.position.z, t)); g.quaternion.copy(_sq).multiply(u.q0); } });
  windInst.forEach(({mesh:m, items}) => {
    items.forEach((it, i) => {
      if(calm) _sq.copy(_sq0); else _sq.setFromAxisAngle(_sax, treeLean(it.x, it.z, t));
      const gr = it.hidden ? 0 : (it.grow ?? 1);                  // felled trees are hidden; replanted ones grow back
      _sp.set(0, it.oy * gr, 0).applyQuaternion(_sq).add(_ss.set(it.x, it.y, it.z));
      _sm.compose(_sp, _sq, _ss.set(it.k * gr, it.k * it.sy * gr, it.k * gr)); m.setMatrixAt(i, _sm);
    });
    m.instanceMatrix.needsUpdate = true;
  });
}
function updateSway(t){
  if(windNow < .015){ if(swayOn){ applySway(t, true); swayOn = false; } return; }
  swayOn = true; applySway(t, false);
}

// seasonal leaf colour
function updateLeaves(dt){
  const w = weatherNow(), tgt = SEASON_LEAF[w.snow ? 'salji' : w.leaves], k = 1 - Math.exp(-dt * 1.2);
  leafMats.forEach((m, i) => m.color.lerp(_lc.setHex(tgt ? tgt[i] : LEAF_BASE[i]), k));
  oliveMat.color.lerp(_lc.setHex(tgt ? tgt[1] : OLIVE_BASE), k);
}

// lightning (Ribut Petir)
const LIT = {next:2, flash:0, life:0, mesh:null};
LIT.mat = new THREE.MeshBasicMaterial({color:0xf2f6ff, transparent:true, opacity:0, fog:false, depthWrite:false, blending:THREE.AdditiveBlending});
function strike(){
  const a = cam.yaw + Math.PI + (Math.random() - .5) * 1.6, d = 140 + Math.random() * 220;
  const gx = camTarget.x + Math.sin(a) * d, gz = camTarget.z + Math.cos(a) * d, gy = Math.max(0, surfaceH(gx, gz));
  const pts = []; let x = gx + (Math.random() - .5) * 40, z = gz + (Math.random() - .5) * 40;
  for(let i = 0; i <= 12; i++){ const k = i / 12; pts.push(new THREE.Vector3(lerp(x, gx, k) + (i && i < 12 ? (Math.random() - .5) * 18 : 0), lerp(240, gy, k), lerp(z, gz, k) + (i && i < 12 ? (Math.random() - .5) * 18 : 0))); }
  if(LIT.mesh){ scene.remove(LIT.mesh); LIT.mesh.geometry.dispose(); }
  LIT.mesh = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false, 'catmullrom', .1), 48, 1.8, 5, false), LIT.mat);
  const b = pts[4 + Math.floor(Math.random() * 4)], bp = [b.clone()]; for(let i = 1; i <= 4; i++) bp.push(b.clone().add(new THREE.Vector3((Math.random() - .3) * 14 * i, -18 * i, (Math.random() - .5) * 14 * i)));
  LIT.mesh.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(bp), 16, .5, 4, false), LIT.mat));
  scene.add(LIT.mesh); LIT.life = .32; LIT.flash = 1;
  const delay = Math.min(3.5, Math.hypot(gx - camera.position.x, gz - camera.position.z) / 340);
  setTimeout(() => sfx.thunder(), delay * 1000);
}
function updateLightning(dt){
  const w = weatherNow(), on = player.layer === 0 && w.lightning;
  if(on){ LIT.next -= dt; if(LIT.next <= 0){ strike(); LIT.next = 4 + Math.random() * 9; } }
  if(LIT.life > 0){ LIT.life -= dt; LIT.mat.opacity = LIT.life > 0 ? (Math.sin(LIT.life * 60) > -.3 ? 1 : .2) : 0; if(LIT.life <= 0 && LIT.mesh) LIT.mesh.visible = false; else if(LIT.mesh) LIT.mesh.visible = true; }
  if(LIT.flash > 0){
    const f = LIT.flash * (.6 + .4 * Math.sin(LIT.flash * 40)); LIT.flash = Math.max(0, LIT.flash - dt * 3.2);
    hemi.intensity += f * 1.3; _lc.setHex(0xd6defa);
    skyU.top.value.lerp(_lc, f * .55); skyU.bot.value.lerp(_lc, f * .55); scene.fog.color.lerp(_lc, f * .35);
  }
}

// rainbow (Selepas Hujan)
const rainbowU = {uOp:{value:0}};
const rainbow = new THREE.Mesh(new THREE.TorusGeometry(900, 40, 10, 128, Math.PI), new THREE.ShaderMaterial({
  uniforms:rainbowU, transparent:true, depthWrite:false, side:THREE.DoubleSide, blending:THREE.AdditiveBlending,
  vertexShader:`varying float vR; void main(){ vR = (length(position.xy) - 860.0) / 80.0; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader:`uniform float uOp; varying float vR;
    vec3 hsv(float h){ vec3 k = clamp(abs(mod(h * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0); return k; }
    void main(){ float r = clamp(vR, 0.0, 1.0); vec3 c = hsv(mix(0.76, 0.0, r)); float a = pow(sin(r * 3.14159), 1.5) * uOp; gl_FragColor = vec4(c * a * .55, 1.0); }`,
}));
rainbow.frustumCulled = false; rainbow.visible = false; scene.add(rainbow);
function updateRainbow(dt){
  const w = weatherNow(), want = player.layer === 0 && w.rainbow && env.alt > 2 ? 1 : 0;
  rainbowU.uOp.value = lerp(rainbowU.uOp.value, want, 1 - Math.exp(-dt)); rainbow.visible = rainbowU.uOp.value > .01;
  if(!rainbow.visible) return;
  const ax = -_sunV.x, az = -_sunV.z, l = Math.hypot(ax, az) || 1;
  rainbow.position.set(camera.position.x + ax / l * 1800, camera.position.y - 300, camera.position.z + az / l * 1800);
  rainbow.rotation.set(0, Math.atan2(ax, az), 0);
}

// aurora (Langit Aurora)
const auroraU = {uT:{value:0}, uOp:{value:0}};
const auroraMat = new THREE.ShaderMaterial({
  uniforms:auroraU, transparent:true, depthWrite:false, side:THREE.DoubleSide, blending:THREE.AdditiveBlending, fog:false,
  vertexShader:`varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader:`uniform float uT, uOp; varying vec2 vUv;
    void main(){ float x = vUv.x * 18.0, y = vUv.y;
      float band = .55 + .45 * sin(x * 1.3 + uT * .35 + sin(x * .37 - uT * .2) * 2.2);
      float rays = .55 + .45 * sin(x * 9.0 + sin(x * 2.1 + uT * .6) * 3.0);
      float a = smoothstep(0.0, .14, y) * pow(1.0 - y, 1.5) * band * rays;
      vec3 c = mix(vec3(.12, 1.0, .5), vec3(.7, .3, 1.0), smoothstep(.3, .95, y));
      gl_FragColor = vec4(c * a * uOp * .9, 1.0); }`,
});
const aurora = new THREE.Group();
[[0, 1], [2.4, .8], [4.3, .6]].forEach(([a, s]) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(1500 * s, 1500 * s, 520 * s, 80, 1, true, a, 2.2), auroraMat); m.position.y = 260 * s; aurora.add(m); });
aurora.visible = false; aurora.children.forEach(m => m.frustumCulled = false); scene.add(aurora);
function updateAurora(dt, t){
  const w = weatherNow(), want = player.layer === 0 && w.aurora ? 1 : 0;
  auroraU.uOp.value = lerp(auroraU.uOp.value, want, 1 - Math.exp(-dt * .8)); auroraU.uT.value = t;
  aurora.visible = auroraU.uOp.value > .01; if(aurora.visible){ aurora.position.set(camera.position.x, camera.position.y, camera.position.z); aurora.rotation.y = t * .004; }
  if(want) stMat.opacity = Math.max(stMat.opacity, .85);
}

// Haki Raja Agung: sky, fog and light turn dark purple with a gold horizon; purple and gold lightning in the sky
const _wa = new THREE.Color(0x14051f), _wb = new THREE.Color(0x9a7414), _wf = new THREE.Color(0x2a1238), _wh = new THREE.Color(0x9a6aff), _wg = new THREE.Color(0x3a2a08), _ws = new THREE.Color(0xffd23a);
function updateWorldHaki(dt){
  WORLD_FX.k = lerp(WORLD_FX.k, performance.now() < WORLD_FX.until ? 1 : 0, 1 - Math.exp(-dt * (performance.now() < WORLD_FX.until ? 3 : .8)));
  const k = WORLD_FX.k; if(k < .003) return;
  skyU.top.value.lerp(_wa, k * .92); skyU.bot.value.lerp(_wb, k * .8); scene.fog.color.lerp(_wf, k * .85);
  hemi.color.lerp(_wh, k * .7); hemi.groundColor.lerp(_wg, k * .7); sun.color.lerp(_ws, k * .8);
  stMat.opacity = Math.max(stMat.opacity, k * .7);
  if(Math.random() < k * .35){ const a = Math.random() * 6.283, d = 120 + Math.random() * 260, top = camera.position.clone().add(new THREE.Vector3(Math.cos(a) * d, 90 + Math.random() * 80, Math.sin(a) * d));
    bolt(top, top.clone().add(new THREE.Vector3((Math.random() - .5) * 80, -60 - Math.random() * 80, (Math.random() - .5) * 80)), Math.random() < .55 ? PURPLE : GOLD, 14, .22); }
}

// called once per frame, after updateEnvironment
function updateSeasons(dt, t){
  const w = weatherNow();
  windNow = lerp(windNow, indoorLayer(player.layer) ? 0 : (w.wind || 0), 1 - Math.exp(-dt));
  updateSway(t); updateLeaves(dt); updateLightning(dt); updateRainbow(dt); updateAurora(dt, t); updateWorldHaki(dt);
}
