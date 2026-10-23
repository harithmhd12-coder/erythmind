'use strict';
/* ================= Realistik: semi-realistic surfaces, light and trees; third- or first-person view =================
   Surfaces: photographic tiling textures (grass, rock, sand, asphalt, paving stone, snow) laid in world space, so
     they keep the same real-world size on every slope and road; the terrain picks its texture per spot from the
     colour it was painted with, and keeps the season's tint on top.
   Water: a normal-mapped, glossy sea that reflects the sky.
   Light: the sky itself lights the world (image-based light), refreshed as the day turns. Sederhana and Tinggi.
   Trees: photo-modelled shade trees on the island and snowy pines in Nivelham replace the cone trees. Sederhana and Tinggi.
   View: V (or the Kamera button) switches between third person and first person. In first person you look through
     your own eyes, the body is hidden and your sword is in hand. Drag to look around, as before. */
const REAL = {tex:{}, env:null, envT:0, envOn:false, trees:{}, view:LS.get('erythmind.view', 'tps')};
const texLoader = new THREE.TextureLoader();
function realTex(name){
  if(REAL.tex[name]) return REAL.tex[name];
  const t = texLoader.load('assets/tex/' + name + '.jpg'); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  return REAL.tex[name] = t;
}

/* --- world-space textures on flat-coloured surfaces (roads, the plaza, the core island) --- */
function worldTexture(mat, name, scale, keep){
  mat.userData.wt = {wTex:{value:realTex(name)}, wScale:{value:scale}, wKeep:{value:keep}};
  mat.onBeforeCompile = sh => {
    weathered(sh); Object.assign(sh.uniforms, mat.userData.wt);
    sh.fragmentShader = 'uniform sampler2D wTex; uniform float wScale; uniform float wKeep;\n' + sh.fragmentShader.replace('#include <color_fragment>',
      '#include <color_fragment>\n{ vec3 tc = mix(texture2D(wTex, vWP.xz * wScale).rgb, texture2D(wTex, vWP.xz * wScale * .23 + .37).rgb, .3); diffuseColor.rgb = mix(tc, diffuseColor.rgb, wKeep); }');
  };
  mat.customProgramCacheKey = () => 'wtex'; mat.needsUpdate = true;
}

/* --- terrain: six photographic grounds, chosen by the painted colour, season tint kept --- */
const TERRAIN_GLSL = `
  uniform sampler2D tGrass, tRock, tSand, tSnow, tPave; varying vec3 vTW; varying vec3 vBase;
  vec3 tpick(sampler2D t, vec2 uv){ return mix(texture2D(t, uv).rgb, texture2D(t, uv * .21 + .43).rgb, .3); }
  float tw(vec3 c, vec3 r){ vec3 d = c - r; return exp(-dot(d, d) * 40.); }`;
function terrainTexture(mat, mesh_, baseArr){
  const g = mesh_.geometry; if(!g.attributes.baseCol) g.setAttribute('baseCol', new THREE.BufferAttribute(Float32Array.from(baseArr || g.attributes.color.array), 3));
  mat.flatShading = false; g.computeVertexNormals();
  mat.onBeforeCompile = sh => {
    ['Grass', 'Rock', 'Sand', 'Snow', 'Pave'].forEach(k => sh.uniforms['t' + k] = {value:realTex({Grass:'grass', Rock:'rock', Sand:'sand', Snow:'snow', Pave:'paving'}[k])});
    sh.vertexShader = 'attribute vec3 baseCol; varying vec3 vTW; varying vec3 vBase;\n' + sh.vertexShader.replace('#include <project_vertex>', '#include <project_vertex>\nvTW = (modelMatrix * vec4(transformed, 1.)).xyz; vBase = baseCol;');
    sh.fragmentShader = TERRAIN_GLSL + '\n' + sh.fragmentShader.replace('#include <color_fragment>', `
      vec2 uv = vTW.xz * .12; vec3 b = vBase;
      float wSand = tw(b, vec3(.914, .812, .596)), wMud = tw(b, vec3(.541, .478, .353)), wGrass = max(tw(b, vec3(.424, .710, .341)), tw(b, vec3(.310, .604, .290))),
            wRock = tw(b, vec3(.541, .514, .471)), wSnow = tw(b, vec3(.957, .969, .984)), wPave = tw(b, vec3(.718, .737, .776)) + 1e-4;
      vec3 tex = (tpick(tSand, uv) * wSand + tpick(tSand, uv) * .55 * wMud + tpick(tGrass, uv) * wGrass + tpick(tRock, uv * .7) * wRock + tpick(tSnow, uv * .6) * wSnow + tpick(tPave, uv * 1.6) * wPave)
                / (wSand + wMud + wGrass + wRock + wSnow + wPave);
      vec3 tint = clamp(vColor / max(b, vec3(.05)), .2, 2.5);          // seasons repaint the vertex colours; keep that change on the photo
      diffuseColor.rgb = mix(tex * tint, vColor, .12);`);
  };
  mat.customProgramCacheKey = () => 'terrain-real'; mat.needsUpdate = true;
}

/* --- the sea: glossy, normal-mapped, reflecting the sky, with the GPU waves from 24-prestasi.js --- */
const seaReal = new THREE.MeshStandardMaterial({color:0x17607c, roughness:.14, metalness:.25, normalMap:realTex('waternormal'), normalScale:new THREE.Vector2(.55, .55)});
realTex('waternormal').repeat.set(110, 110);
{ const U = {uT:{value:0}};
  seaReal.onBeforeCompile = sh => { sh.uniforms.uT = U.uT;
    sh.vertexShader = 'uniform float uT;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\ntransformed.y += sin(position.x * .045 + uT * .9) * .55 + cos(position.z * .06 + uT * 1.2) * .45;'); };
  anims.push(t => { U.uT.value = t; const n = realTex('waternormal'); n.offset.set(t * .004, t * .0025); }); }

/* --- sky light (image-based lighting): the sky dome rendered into a soft environment map --- */
// sky light adds to the lamps already there, so every surface takes it at a modest strength
function envIntensity(){ scene.traverse(o => { if(!o.isMesh) return; [].concat(o.material).forEach(m => { if(m && m.isMeshStandardMaterial && m.userData.envI == null){ m.userData.envI = 1; m.envMapIntensity = m.metalness > .5 ? .8 : .35; } }); }); }
// painted from the live sky colours onto a small panorama (no shader render, so it behaves the same on every GPU)
const pmrem = new THREE.PMREMGenerator(renderer);
const envCv = document.createElement('canvas'); envCv.width = 128; envCv.height = 64; const envTexC = new THREE.CanvasTexture(envCv); envTexC.mapping = THREE.EquirectangularReflectionMapping;
function refreshEnv(){
  const g = envCv.getContext('2d'), top = '#' + env.top.getHexString(), bot = '#' + env.bot.getHexString(), grd = g.createLinearGradient(0, 0, 0, 64);
  grd.addColorStop(0, top); grd.addColorStop(.48, bot); grd.addColorStop(.52, '#' + new THREE.Color(0x3a4a3a).lerp(env.bot, .35).getHexString()); grd.addColorStop(1, '#2a2e26');
  g.fillStyle = grd; g.fillRect(0, 0, 128, 64);
  const sv = skyU.sunDir.value, sx = (Math.atan2(sv.x, -sv.z) / 6.283 + .5) * 128, sy = (.5 - Math.asin(clamp(sv.y, -1, 1)) / Math.PI) * 64;
  if(sv.y > -.05){ const r = g.createRadialGradient(sx, sy, 0, sx, sy, 14); r.addColorStop(0, 'rgba(255,240,210,.9)'); r.addColorStop(1, 'rgba(255,240,210,0)'); g.fillStyle = r; g.fillRect(0, 0, 128, 64); }
  envTexC.needsUpdate = true;
  const rt = pmrem.fromEquirectangular(envTexC); if(REAL.env) REAL.env.dispose(); REAL.env = rt; scene.environment = rt.texture;
}
const _updateEnvironment = updateEnvironment;
updateEnvironment = function(dt, t){
  _updateEnvironment(dt, t);
  const want = REAL.on && Q.tier >= 2 && !indoorLayer(player.layer);
  if(want){ REAL.envT -= dt; if(!REAL.envOn || REAL.envT <= 0){ REAL.envT = 6; refreshEnv(); REAL.envOn = true; envIntensity(); } hemi.intensity *= .45; sun.intensity *= .9; }
  else if(REAL.envOn){ scene.environment = null; REAL.envOn = false; }
};

/* --- photo-modelled trees, swapped into the instanced forests --- */
function treeGeometry(gltf, height, boost = 1.25){
  const parts = []; gltf.scene.updateMatrixWorld(true); let mat = null;
  gltf.scene.traverse(o => { if(!o.isMesh) return; const g = (o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone()); g.applyMatrix4(o.matrixWorld); parts.push(g); mat = mat || o.material; });
  if(!parts.length) return null;
  let n = 0; parts.forEach(g => n += g.attributes.position.count);
  const P = new Float32Array(n * 3), Nn = new Float32Array(n * 3), UV = new Float32Array(n * 2); let k = 0;
  parts.forEach(g => { P.set(g.attributes.position.array, k * 3); if(g.attributes.normal) Nn.set(g.attributes.normal.array, k * 3); if(g.attributes.uv) UV.set(g.attributes.uv.array, k * 2); k += g.attributes.position.count; });
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(P, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(Nn, 3)); geo.setAttribute('uv', new THREE.BufferAttribute(UV, 2));
  geo.computeBoundingBox(); const bb = geo.boundingBox, s = height / (bb.max.y - bb.min.y);
  geo.translate(-(bb.min.x + bb.max.x) / 2, -bb.min.y, -(bb.min.z + bb.max.z) / 2); geo.scale(s, s, s); geo.computeBoundingSphere();
  // the generated mesh's own normals disagree with its faces on about a quarter of the leaves, which shade black;
  // foliage is lit as one soft round crown instead (normals point out from the crown's centre), the trunk keeps its face normals
  geo.computeVertexNormals();
  const cy = height * .62, NA = geo.attributes.normal.array, v = new THREE.Vector3(), fn = new THREE.Vector3();
  for(let i = 0; i < P.length; i += 3){ const y = P[i + 1], w = THREE.MathUtils.smoothstep(y, height * .28, height * .45); if(w <= 0) continue;
    v.set(P[i], (y - cy) * .8, P[i + 2]).normalize(); fn.fromArray(NA, i).lerp(v, w).normalize(); fn.toArray(NA, i); }
  const m = mat.clone(); if('metalness' in m){ m.metalness = 0; m.roughness = .9; m.metalnessMap = null; m.roughnessMap = null; }
  // the merged leaves have no tangents of their own and the baked normal map turns most of the canopy away from the sun: drop it, and let the leaf colour carry a little light of its own
  m.normalMap = null; m.side = THREE.FrontSide; m.shadowSide = THREE.FrontSide;
  if(m.map){ m.emissiveMap = m.map; m.emissive = new THREE.Color(0xffffff); m.emissiveIntensity = .12; } m.color.setRGB(boost, boost * 1.05, boost * .9); m.envMapIntensity = .5; m.needsUpdate = true;   // the generated leaf texture is painted dark
  return {geo, mat:m};
}
// each forest: the trunk mesh takes the photo tree (its origin sits mid-trunk, 1.5 units up), the crown meshes rest
function forestSwap(list, model, height){
  if(!model || list.some(x => !x)) return;
  const [trunk, ...crowns] = list;
  if(!trunk.userData.orig) trunk.userData.orig = {geo:trunk.geometry, mat:trunk.material, counts:crowns.map(c => c.count)};
  const want = Q.tier >= 2;
  if(want && !trunk.userData.real){ const geo = model.geo.clone(); geo.translate(0, -1.5, 0); trunk.geometry = geo; trunk.material = model.mat; crowns.forEach(c => c.count = 0); trunk.userData.real = true; }
  else if(!want && trunk.userData.real){ trunk.geometry.dispose(); const o = trunk.userData.orig; trunk.geometry = o.geo; trunk.material = o.mat; crowns.forEach((c, i) => c.count = o.counts[i]); trunk.userData.real = false; }
}
function islandForest(){ return windInst.length >= 3 ? windInst.slice(0, 3).map(w => w && w.mesh) : [null]; }
function nivForest(){
  const inst = N.children.filter(c => c.isInstancedMesh);
  const tr = inst.find(c => c.geometry.type === 'CylinderGeometry' && c.geometry.parameters.radiusBottom === .5);
  const l1 = inst.find(c => c.geometry.type === 'ConeGeometry' && c.geometry.parameters.radius === 2.6), l2 = inst.find(c => c.geometry.type === 'ConeGeometry' && c.geometry.parameters.radius === 2.2);
  return [tr, l1, l2];
}
const _applyModelR = applyModel;
applyModel = function(key, gltf){
  if(key === 'pokokRendang'){ REAL.trees.broad = treeGeometry(gltf, 9.5, 2.6); return; }
  if(key === 'pokokPain'){ REAL.trees.pine = treeGeometry(gltf, 11, 1.5); return; }
  return _applyModelR(key, gltf);
};

/* --- realism on and off with the quality step --- */
let terrainDone = false, nTerrain = null;
function applyRealism(){
  const on = Q.tier >= 1;
  if(on && !REAL.on){
    REAL.on = true;
    if(!terrainDone){ terrainDone = true; terrainTexture(terrainMat, terrain, tColBase);
      nTerrain = N.children.find(c => c.isMesh && c.geometry === nTerrainGeo); if(nTerrain) terrainTexture(nTerrain.material, nTerrain); }
    worldTexture(roadMat, 'asphalt', .22, .12); worldTexture(grassMat, 'grass', .12, .2); worldTexture(sandMat, 'sand', .12, .2);
    S.traverse(o => { if(o.isMesh && o.geometry.type === 'CylinderGeometry' && o.geometry.parameters.radiusTop === 13 && o.material.color?.getHex() === 0xa9b1c4) worldTexture(o.material, 'paving', .25, .15); });
    REAL.seaOld = sea.material; sea.material = seaReal;
  } else if(!on && REAL.on){
    REAL.on = false; sea.material = REAL.seaOld || sea.material;
    [roadMat, grassMat, sandMat].forEach(m => { m.onBeforeCompile = weathered; m.customProgramCacheKey = () => weathered.toString(); m.needsUpdate = true; });
  }
  forestSwap(islandForest(), REAL.trees.broad); forestSwap(nivForest(), REAL.trees.pine);
}

/* --- third person / first person --- */
const fpsHand = new THREE.Group(); camera.add(fpsHand); if(!camera.parent) scene.add(camera);
fpsHand.position.set(.5, -.48, -1.05); fpsHand.rotation.set(-1.05, -.3, -.25); fpsHand.visible = false;
let fpsSword = null, fpsBob = 0;
const camBtn = document.createElement('button'); camBtn.className = 'tbtn'; camBtn.id = 'bCam'; camBtn.type = 'button';
document.getElementById('bView').after(camBtn); camBtn.addEventListener('click', () => setView(REAL.view === 'fps' ? 'tps' : 'fps'));
function renderCamBtn(){ camBtn.innerHTML = `Kamera: ${REAL.view === 'fps' ? 'Mata pertama' : 'Orang ketiga'} <b>V</b>`; camBtn.classList.toggle('on', REAL.view === 'fps'); }
function setView(v){
  REAL.view = v; LS.set('erythmind.view', v); renderCamBtn();
  if(v === 'fps'){ cam.pitch = .45; toast('Mata pertama (FPS): seret untuk memandang, W A S D untuk bergerak. Tekan V untuk kembali.', 'ok', 4000); }
  else { me.g.visible = true; fpsHand.visible = false; camera.fov = 55; camera.updateProjectionMatrix(); if(meLabel.maxOld != null){ meLabel.max = meLabel.maxOld; meLabel.maxOld = null; } }
}
renderCamBtn();
addEventListener('keydown', e => { if(e.code === 'KeyV' && session && !ride && !typing() && $('#panel').hidden && !e.repeat){ setView(REAL.view === 'fps' ? 'tps' : 'fps'); e.preventDefault(); } });
const _eye = new THREE.Vector3(), _look = new THREE.Vector3();
const _updateCameraR = updateCamera;
updateCamera = function(dt, t){
  const fps = REAL.view === 'fps' && session && !ride && !camFocus && !SAR.fly && !SAR.cap && cam.tdist < 120;
  if(!fps){ if(fpsHand.visible){ fpsHand.visible = false; me.g.visible = true; camera.fov = 55; camera.updateProjectionMatrix(); } return _updateCameraR(dt, t); }
  const yaw = cam.yaw, look = (cam.pitch - .45) * 1.35, eyeH = me.pose === 2 ? .9 : me.pose === 1 ? 2.0 : 2.75;
  fpsBob += player.moving ? dt * (player.speed || 7) * 1.4 : 0;
  _eye.set(player.x, me.g.position.y + eyeH + (player.moving ? Math.sin(fpsBob) * .06 : 0), player.z);
  if(shake > 0){ shake = Math.max(0, shake - dt); _eye.x += (Math.random() - .5) * shake; _eye.y += (Math.random() - .5) * shake; }
  camera.position.copy(_eye);
  _look.set(_eye.x - Math.sin(yaw) * Math.cos(look), _eye.y - Math.sin(look), _eye.z - Math.cos(yaw) * Math.cos(look)); camera.lookAt(_look);
  if(camera.fov !== 72){ camera.fov = 72; camera.updateProjectionMatrix(); }
  if(!me.pose) player.ry = yaw + Math.PI;                 // the body (and every power) faces where you look
  me.g.visible = false; if(meLabel.maxOld == null){ meLabel.maxOld = meLabel.max; meLabel.max = 0; }
  // the sword in hand, swaying with each step
  if(!fpsSword && typeof sword !== 'undefined'){ fpsSword = sword.clone(true); fpsSword.visible = true; fpsSword.traverse(o => { if(o.isMesh){ o.castShadow = false; o.renderOrder = 10; } }); fpsSword.scale.setScalar(.42); fpsHand.add(fpsSword); }
  fpsHand.visible = !me.pose; fpsHand.position.y = -.48 + (player.moving ? Math.abs(Math.sin(fpsBob)) * .04 : Math.sin(t * 1.6) * .008);
  sun.shadow.camera.left = sun.shadow.camera.bottom = -90; sun.shadow.camera.right = sun.shadow.camera.top = 90; sun.shadow.camera.updateProjectionMatrix();
};

/* --- keep it in step with the quality setting --- */
const _applyTierR = applyTier;
applyTier = function(){ _applyTierR(); applyRealism(); };
let realT = 0;
anims.push((t, dt) => { realT -= dt; if(realT <= 0){ realT = 2; applyRealism(); } });
// the leaves' own light fades with the daylight, so the forest does not glow at night
anims.push(() => { const k = .12 * (1 - nightLevel * .85); Object.values(REAL.trees).forEach(t => { if(t && t.mat) t.mat.emissiveIntensity = k; }); });
applyRealism();
