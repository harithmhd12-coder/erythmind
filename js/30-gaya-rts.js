'use strict';
/* ================= Gaya RTS Klasik: the look of a classic real-time strategy map, over the same world =================
   Only the look changes (the places, buildings and powers stay what they are). Tetapan · Gaya grafik switches between
   this and the photographic look (25-realistik.js).
   1. Terrain: six hand-painted grounds (grass, dirt, sand, rocky ground, cliff rock, road; assets/tex/rts-*.jpg, made
      with Higgsfield) chosen from the painted colour as before, with noise-broken, painterly edges between them,
      dirt patches in the meadows, cliff rock on every steep slope, wet sand and a lapping line of foam at the shore,
      turquoise shallows seen through clearer water.
   2. Light and colour: a crisp, saturated grade with warm light and cool shade, no film grain, a lighter vignette.
   3. Pandangan RTS: a three-quarter strategy camera (V cycles Orang ketiga → Mata pertama → RTS) with a faint
      4 m tile grid on the ground, ready for placing things on later. */
const RTS = {on:LS.get('erythmind.gaya', 'rts') === 'rts', tex:{}, U:{uT:{value:0}, uGrid:{value:0}}};
function rtsTex(n){
  if(RTS.tex[n]) return RTS.tex[n];
  const t = texLoader.load('assets/tex/rts-' + n + '.jpg'); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  return RTS.tex[n] = t;
}

/* --- 1. terrain --- */
const RTS_PICK = REAL.phone ? 'texture2D(t, uv).rgb' : 'mix(texture2D(t, uv).rgb, texture2D(t, uv * .37 + .21).rgb, .22)';
const RTS_GLSL = `
  uniform sampler2D rGrass, rDirt, rSand, rRocky, rCliff, rSnow, rRoad; uniform float uT, uGrid, uShore;
  varying vec3 vTW; varying vec3 vBase; varying vec3 vWN;
  float rh(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float rn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f); return mix(mix(rh(i), rh(i + vec2(1., 0.)), f.x), mix(rh(i + vec2(0., 1.)), rh(i + vec2(1., 1.)), f.x), f.y); }
  float tw(vec3 c, vec3 r){ vec3 d = c - r; return exp(-dot(d, d) * 40.); }
  vec3 rt(sampler2D t, vec2 uv){ return ${RTS_PICK}; }
  vec3 grassC(vec3 c){ float l = dot(c, vec3(.3, .55, .15)); return mix(vec3(l), c, .72) * vec3(.98, .95, .78); }     // the painted grass, toned from lime to a field olive`;
function rtsTerrain(mat, mesh_, baseArr){
  const g = mesh_.geometry; if(!g.attributes.baseCol) g.setAttribute('baseCol', new THREE.BufferAttribute(Float32Array.from(baseArr || g.attributes.color.array), 3));
  mat.flatShading = false; g.computeVertexNormals();
  mat.onBeforeCompile = sh => {
    Object.entries({rGrass:'grass', rDirt:'dirt', rSand:'sand', rRocky:'rocky', rCliff:'cliff', rRoad:'road'}).forEach(([k, n]) => sh.uniforms[k] = {value:rtsTex(n)});
    sh.uniforms.rSnow = {value:realTex('snow')}; sh.uniforms.uShore = {value:mesh_ === terrain ? 1 : 0}; sh.uniforms.uT = RTS.U.uT; sh.uniforms.uGrid = RTS.U.uGrid;
    sh.vertexShader = 'attribute vec3 baseCol; varying vec3 vTW; varying vec3 vBase; varying vec3 vWN;\n' + sh.vertexShader.replace('#include <project_vertex>',
      '#include <project_vertex>\nvTW = (modelMatrix * vec4(transformed, 1.)).xyz; vBase = baseCol; vWN = normalize(mat3(modelMatrix) * objectNormal);');
    sh.fragmentShader = RTS_GLSL + '\n' + sh.fragmentShader.replace('#include <color_fragment>', `
      vec2 uv = vTW.xz * .085; vec3 b = vBase;
      float n = rn(vTW.xz * .06) * .55 + rn(vTW.xz * .21) * .3 + rn(vTW.xz * .9) * .15;
      float wSand = tw(b, vec3(.914, .812, .596)), wMud = tw(b, vec3(.541, .478, .353)), wGrass = max(tw(b, vec3(.424, .710, .341)), tw(b, vec3(.310, .604, .290))),
            wRock = tw(b, vec3(.541, .514, .471)), wSnow = tw(b, vec3(.957, .969, .984)), wPave = tw(b, vec3(.718, .737, .776));
      // painted edges: noise pushes each ground in or out, then the blend is sharpened into an irregular brush line
      // (the colours come from the mesh corners, so a hard cut would follow its triangles: the noise, not the mesh, draws the line)
      float m = rn(vTW.xz * .33) * .6 + rn(vTW.xz * 1.1) * .4;
      wGrass *= .25 + n * .9 + m * .6; wSand *= 1.5 - n * .7 - m * .5; wMud *= 1.3 - n * .5 - m * .3; wRock *= .55 + n * .5 + m * .4;
      // on the mainland the shore line is drawn from the height itself (smooth everywhere), not from the corner colours
      float y = vTW.y;
      if(uShore > .5){ float L = wSand + wMud + wGrass, sk = 1. - smoothstep(-.2, .35, y + (n - .5) * 1.3 + (m - .5) * .6), mk = clamp(-y / 3., 0., 1.);
        wGrass = L * (1. - sk); wSand = L * sk * (1. - mk); wMud = L * sk * mk;
        wRock *= smoothstep(.3, .9, wRock / (L + 1e-4)); wPave *= smoothstep(.3, .9, wPave / (L + 1e-4)); }     // the half-way colour at an old sand/grass corner is no rock or paving
      wSand = pow(wSand, 1.8); wMud = pow(wMud, 1.8); wGrass = pow(wGrass, 1.8); wRock = pow(wRock, 1.8); wSnow = pow(wSnow, 1.8); wPave = pow(wPave, 1.8) + 1e-6;
      float sum = wSand + wMud + wGrass + wRock + wSnow + wPave;
      vec3 tex = (rt(rSand, uv) * wSand + rt(rDirt, uv) * wMud + grassC(rt(rGrass, uv)) * wGrass + rt(rRocky, uv * .8) * wRock + texture2D(rSnow, uv * .6).rgb * wSnow + rt(rRoad, uv * 1.4) * wPave) / sum;
      float dirtP = smoothstep(.7, .76, rn(vTW.xz * .045 + 7.) * .65 + n * .2 + m * .15) * wGrass / sum;             // worn dirt patches in the meadows
      tex = mix(tex, rt(rDirt, uv * 1.1), dirtP * .85);
      // cliff rock on steep ground, projected from the side it faces
      float cl = smoothstep(.3, .44, 1. - clamp(vWN.y, 0., 1.) + (n - .5) * .1) * (1. - wSnow / sum);
      vec2 cuv = abs(vWN.x) > abs(vWN.z) ? vTW.zy : vTW.xy;
      tex = mix(tex, texture2D(rCliff, cuv * vec2(.07, .1)).rgb * 1.05, cl);
      // the shore: wet sand, a line of foam lapping with the waves, turquoise shallows under the water
      tex *= 1. - smoothstep(.6, -1.2, y) * .25;
      float fl = abs(y + 1.45 + sin(uT * 1.1 + vTW.x * .12 + vTW.z * .07) * .22);
      float foam = (1. - smoothstep(0., .28, fl)) * (.55 + .45 * rn(vTW.xz * 1.3 + uT * .3));
      tex = mix(tex, vec3(.96, .98, 1.), foam * .9);
      tex = mix(tex, vec3(.2, .66, .72), smoothstep(-1.7, -3.2, y) * .65);
      // the tile grid of the strategy view
      if(uGrid > .01){ vec2 gq = abs(fract(vTW.xz / 4. + .5) - .5) * 4.; float gl = 1. - smoothstep(.04, .1, min(gq.x, gq.y)); tex = mix(tex, tex * .8, gl * uGrid * (1. - foam)); }
      vec3 tint = clamp(vColor / max(b, vec3(.05)), .2, 2.5);
      diffuseColor.rgb = tex * tint;`);
  };
  mat.customProgramCacheKey = () => 'terrain-rts'; mat.needsUpdate = true;
}
// the flat-coloured grounds (roads, the plaza, the core island) keep their shader and only change texture
const RTS_WT = [[() => roadMat, 'road', 'asphalt'], [() => grassMat, 'grass', 'grass'], [() => sandMat, 'sand', 'sand']];
function rtsWorldMats(on){
  RTS_WT.forEach(([m, r, p]) => { const u = m().userData.wt; if(u) u.wTex.value = on ? rtsTex(r) : realTex(p); });
  S.traverse(o => { const u = o.isMesh && o.material?.userData?.wt; if(u && u.wTex.value === (on ? realTex('paving') : rtsTex('road'))) u.wTex.value = on ? rtsTex('road') : realTex('paving'); });
}
const SEA_REAL = {color:0x17607c, opacity:1}, LAKE_REAL = {color:waterMat.color.getHex(), opacity:waterMat.opacity};
function rtsSea(on){
  seaReal.color.setHex(on ? 0x1d93b4 : SEA_REAL.color); seaReal.transparent = on; seaReal.opacity = on ? .8 : 1; seaReal.needsUpdate = true;
  waterMat.color.setHex(on ? 0x2a9fbe : LAKE_REAL.color); waterMat.opacity = on ? .8 : LAKE_REAL.opacity;          // the lake and rivers match the sea
}
// kept in step with the realism switch (which itself follows the quality step)
function syncGaya(){
  if(!REAL.on) return;
  const want = RTS.on;
  [[terrainMat, terrain, tColBase], [nTerrain?.material, nTerrain, null]].forEach(([m, me_, base]) => {
    if(!m || !me_) return; const isR = m.customProgramCacheKey?.() === 'terrain-rts';
    if(want && !isR) rtsTerrain(m, me_, base); else if(!want && isR) terrainTexture(m, me_, base);
  });
  const roadOn = roadMat.userData.wt?.wTex.value === RTS.tex.road;
  if(want !== !!roadOn) rtsWorldMats(want);
  if(want !== seaReal.transparent) rtsSea(want);
}
const _applyRealismG = applyRealism;
applyRealism = function(){ _applyRealismG(); syncGaya(); syncProps(); };

/* --- 1b. props: a hand-painted tree and boulder cluster (Higgsfield: rts-tree.gltf.json, rts-rock.gltf.json) in place of the
   cone, ball and twelve-sided placeholders; the photographic forest gives way to the painted tree too --- */
function rtsRockGeometry(gltf, size){
  const parts = []; let mat = null; gltf.scene.updateMatrixWorld(true);
  gltf.scene.traverse(o => { if(!o.isMesh) return; const g = (o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone()); g.applyMatrix4(o.matrixWorld); parts.push(g); mat = mat || o.material; });
  if(!parts.length) return null;
  const geo = parts.length === 1 ? parts[0] : THREE.BufferGeometryUtils?.mergeBufferGeometries?.(parts) || parts[0];
  geo.computeBoundingBox(); const bb = geo.boundingBox, k = size / Math.max(bb.max.x - bb.min.x, bb.max.z - bb.min.z);
  geo.translate(-(bb.min.x + bb.max.x) / 2, -bb.min.y, -(bb.min.z + bb.max.z) / 2); geo.scale(k, k, k); geo.translate(0, -.55, 0); geo.computeBoundingSphere();
  const m = mat.clone(); if('metalness' in m){ m.metalness = 0; m.roughness = .92; } return {geo, mat:m};
}
const _applyModelG = applyModel;
applyModel = function(key, gltf){
  if(key === 'rtsPokok'){ RTS.tree = treeGeometry(gltf, 8.5, 1.05); syncProps(); return; }
  if(key === 'rtsBatu'){ RTS.rock = rtsRockGeometry(gltf, 3.4); syncProps(); return; }
  return _applyModelG(key, gltf);
};
// the instanced mainland forest: the painted tree where the photographic one would stand (computers), in RTS
const _forestSwapG = forestSwap;
forestSwap = function(list, model, height){
  if(RTS.on && model && model === REAL.trees.broad && RTS.tree) model = RTS.tree;
  const trunk = list[0];
  if(trunk && trunk.userData.real && model && trunk.userData.model !== model){          // changing from one model to the other: put the original back first
    trunk.geometry.dispose(); const o = trunk.userData.orig; trunk.geometry = o.geo; trunk.material = o.mat; list.slice(1).forEach((c, i) => c.count = o.counts[i]); trunk.userData.real = false; }
  _forestSwapG(list, model, height);
  if(trunk && trunk.userData.real) trunk.userData.model = model;
};
// the small tree groups (the core island's pines, the plaza and garden trees) and the scattered rocks
let rtsRocks = null;
function syncProps(){
  const on = RTS.on && REAL.on;
  if(RTS.tree) swayGroups.forEach(g => {
    const kids = g.children.filter(c => c !== g.userData.rtsTree && c !== g.userData.fantasyTree);
    if(kids.length < 2 || kids.length > 3 || !kids.every(c => c.isMesh) || kids[0].geometry.type !== 'CylinderGeometry' || !kids.slice(1).every(c => /Cone|Icosahedron/.test(c.geometry.type))) return;
    if(on && !g.userData.rtsTree){ const bb = new THREE.Box3(); kids.forEach(c => bb.expandByObject(c)); const h = (bb.max.y - bb.min.y) * 1.05;
      const t = new THREE.Mesh(RTS.tree.geo, RTS.tree.mat); t.scale.setScalar(h / 8.5); t.position.y = bb.min.y - g.getWorldPosition(_rv).y; t.rotation.y = (g.position.x * 7.3 + g.position.z * 3.1) % 6.283; t.castShadow = true; t.receiveShadow = true; g.add(t); g.userData.rtsTree = t; }
    if(g.userData.rtsTree){ g.userData.rtsTree.visible = on; kids.forEach(c => c.visible = !on); }
  });
  if(!rtsRocks) S.traverse(c => { if(!rtsRocks && c.isInstancedMesh && c.geometry.type === 'DodecahedronGeometry' && c.geometry.parameters.radius === 1.6) rtsRocks = c; });
  if(rtsRocks && RTS.rock){ if(!rtsRocks.userData.orig) rtsRocks.userData.orig = {geo:rtsRocks.geometry, mat:rtsRocks.material};
    const want = on ? RTS.rock : rtsRocks.userData.orig; if(rtsRocks.geometry !== want.geo){ rtsRocks.geometry = want.geo; rtsRocks.material = want.mat; rockPose(on); } }
}
const _rv = new THREE.Vector3();
// the old rocks lie tumbled at any angle; the cluster stands upright on the ground, turned only about its height
function rockPose(upright){
  const im = rtsRocks.instanceMatrix, U = rtsRocks.userData; if(!U.mats) U.mats = Float32Array.from(im.array);
  if(!upright){ im.array.set(U.mats); im.needsUpdate = true; return; }
  const m4 = new THREE.Matrix4(), p = new THREE.Vector3(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), e = new THREE.Euler();
  for(let i = 0; i < rtsRocks.count; i++){ m4.fromArray(U.mats, i * 16).decompose(p, q, sc); const k = sc.y;
    m4.compose(p.setY(p.y - .4), q.setFromEuler(e.set(0, k * 9.7, 0)), sc.set(k, k * (.8 + (k * 13 % 1) * .4), k)); m4.toArray(im.array, i * 16); }
  im.needsUpdate = true;
}

/* --- 2. light and colour --- */
const _updateEnvironmentG = updateEnvironment;
updateEnvironment = function(dt, t){
  _updateEnvironmentG(dt, t); RTS.U.uT.value = t;
  if(RTS.on && !indoorLayer(player.layer)){ sun.intensity *= 1.15; hemi.intensity *= 1.06; }
};
anims.push(() => { if(gradePass){ gradePass.uniforms.rts.value = RTS.on ? 1 : 0; gradePass.uniforms.edge.value = RTS.on && !REAL.phone ? 1 : 0; } });     // ink edges: computers only

/* --- 3. Pandangan RTS: the three-quarter strategy camera, with the tile grid on the ground --- */
const RTSV = {lens:false};
const _updateCameraG = updateCamera;
updateCamera = function(dt, t){
  const on = REAL.view === 'rts' && session && !ride && !camFocus && !SAR.fly && !SAR.cap && cam.tdist < 300;
  if(on){ cam.pitch = lerp(cam.pitch, .96, 1 - Math.exp(-dt * 6)); cam.tdist = clamp(cam.tdist, 40, 240); }
  if(on) RTSV.lens = true;                                  // a long lens: almost isometric; leaving the view widens it back once
  if(RTSV.lens){ const fov = on ? 30 : 55; camera.fov = lerp(camera.fov, fov, Math.min(1, dt * 6));
    if(Math.abs(camera.fov - fov) < .2){ camera.fov = fov; if(!on) RTSV.lens = false; } camera.updateProjectionMatrix(); }
  _updateCameraG(dt, t);
  RTS.U.uGrid.value = lerp(RTS.U.uGrid.value, on && RTS.on ? 1 : 0, Math.min(1, dt * 4));
};

/* --- settings --- */
function setGaya(on){ RTS.on = on; LS.set('erythmind.gaya', on ? 'rts' : 'real'); applyRealism(); }
const _gfxSettingsHtmlG = gfxSettingsHtml;
gfxSettingsHtml = function(){
  return _gfxSettingsHtmlG() + `<div class="field"><label for="gayaSel">Gaya grafik</label><select id="gayaSel"><option value="rts" ${RTS.on ? 'selected' : ''}>RTS Klasik · lukisan tangan, warna tajam</option><option value="real" ${RTS.on ? '' : 'selected'}>Sci-fi Fantasy · realistik & atmosfera</option></select></div>`;
};
document.addEventListener('change', e => { if(e.target.id === 'gayaSel') setGaya(e.target.value === 'rts'); });
syncGaya();
