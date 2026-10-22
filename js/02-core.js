'use strict';
/* ================= THREE: renderer, sky, groups ================= */
const host = $('#world');
const renderer = new THREE.WebGLRenderer({antialias:true, powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
host.appendChild(renderer.domElement);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(55, 1, 0.3, 9000);
scene.fog = new THREE.Fog(0xc4e7ff, 140, 460);
const S = new THREE.Group(); scene.add(S);          // surface + Labophase
const N = new THREE.Group(); N.position.y = NVY; scene.add(N);   // Nivelham

const hemi = new THREE.HemisphereLight(0xe4f4ff, 0x4d5d3a, .8); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff0d4, 1);
sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, {left:-90, right:90, top:90, bottom:-90, near:10, far:400});
scene.add(sun); scene.add(sun.target);

const skyU = {top:{value:new THREE.Color(0x3c7fd8)}, bot:{value:new THREE.Color(0xc4e7ff)}, sunDir:{value:new THREE.Vector3(0, 1, 0)}, sunCol:{value:new THREE.Color(0xfff2c0)}, glow:{value:1}};
const sky = new THREE.Mesh(new THREE.SphereGeometry(4000, 32, 16), new THREE.ShaderMaterial({
  uniforms:skyU, side:THREE.BackSide, depthWrite:false, fog:false,
  vertexShader:'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }',
  fragmentShader:'uniform vec3 top; uniform vec3 bot; uniform vec3 sunDir; uniform vec3 sunCol; uniform float glow; varying vec3 vP; void main(){ vec3 d = normalize(vP); float h = d.y; vec3 c = mix(bot, top, smoothstep(-0.05, 0.55, h)); float s = max(dot(d, normalize(sunDir)), 0.); c += sunCol * (pow(s, 600.)*2.5 + pow(s, 12.)*.35) * glow; gl_FragColor = vec4(c, 1.); }'
}));
sky.renderOrder = -10; scene.add(sky);
const moon = new THREE.Mesh(new THREE.SphereGeometry(60, 24, 16), new THREE.MeshBasicMaterial({color:0xf4f1e0, fog:false, transparent:true}));
scene.add(moon);

// Every M() surface gets a subtle world-space grain (stone, bark, cloth wear) so flat colours read as weathered material.
const WEATHER_GLSL = 'float wh3(vec3 p){ p = fract(p * .3183099 + .1); p *= 17.; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }\n' +
  'float wvn(vec3 x){ vec3 i = floor(x), f = fract(x); f = f * f * (3. - 2. * f); return mix(mix(mix(wh3(i), wh3(i + vec3(1,0,0)), f.x), mix(wh3(i + vec3(0,1,0)), wh3(i + vec3(1,1,0)), f.x), f.y), mix(mix(wh3(i + vec3(0,0,1)), wh3(i + vec3(1,0,1)), f.x), mix(wh3(i + vec3(0,1,1)), wh3(i + vec3(1,1,1)), f.x), f.y), f.z); }\n';
function weathered(sh){
  sh.vertexShader = 'varying vec3 vWP;\n' + sh.vertexShader.replace('#include <project_vertex>', '#include <project_vertex>\nvec4 wpw = vec4(transformed, 1.);\n#ifdef USE_INSTANCING\nwpw = instanceMatrix * wpw;\n#endif\nvWP = (modelMatrix * wpw).xyz;');
  sh.fragmentShader = 'varying vec3 vWP;\n' + WEATHER_GLSL + sh.fragmentShader.replace('#include <color_fragment>', '#include <color_fragment>\n{ vec3 q = mod(vWP, 2048.); float n = wvn(q * .32) * .5 + wvn(q * 1.7) * .32 + wvn(q * 7.) * .18; diffuseColor.rgb *= mix(.8, 1.08, n); }');
}
const M = (c, o = {}) => { const m = new THREE.MeshStandardMaterial(Object.assign({color:c, roughness:.86, metalness:.04, flatShading:false}, o)); m.onBeforeCompile = weathered; return m; };
function mesh(geo, mat, x = 0, y = 0, z = 0, parent = S, shadow = true){
  const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z);
  m.castShadow = shadow; m.receiveShadow = true; parent.add(m); return m;
}
const grp = (x = 0, y = 0, z = 0, parent = S) => { const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g); return g; };
const holoMat = (c = 0x9fc8ff, o = .38) => new THREE.MeshBasicMaterial({color:c, transparent:true, opacity:o, blending:THREE.AdditiveBlending, depthWrite:false, side:THREE.DoubleSide});
const holoWire = (c = 0x9fc8ff, o = .5) => new THREE.MeshBasicMaterial({color:c, wireframe:true, transparent:true, opacity:o, blending:THREE.AdditiveBlending, depthWrite:false});
const rng = mulberry(373);
const colliders = [];           // {x,z,r,layer}
const clickables = [];          // objects with userData.info
const anims = [];               // per-frame callbacks (t, dt)
const nightMats = [];           // emissive materials that brighten at night: [mat, dayI, nightI]
const collide = (x, z, r, layer = 0) => { const c = {x, z, r, layer}; colliders.push(c); return c; };
const info = (obj, name, desc, holo = false) => { obj.userData.info = {name, desc, holo}; clickables.push(obj); return obj; };
const lampMat = new THREE.MeshBasicMaterial({color:0xffe6a8}); nightMats.push([lampMat, 0, 1]);

/* --- sea --- */
const seaGeo = new THREE.PlaneGeometry(3600, 3600, 150, 150); seaGeo.rotateX(-Math.PI / 2);
const seaBase = seaGeo.attributes.position.array.slice();
const seaMat = new THREE.MeshPhongMaterial({color:0x2aa0d8, shininess:80, flatShading:true});
const sea = new THREE.Mesh(seaGeo, seaMat); sea.position.set(100, -1.6, 300); sea.receiveShadow = true; S.add(sea);
let seaTick = 0;
anims.push(t => {
  if(!S.visible || (seaTick++ & 1)) return;
  const p = seaGeo.attributes.position.array;
  for(let i = 0; i < p.length; i += 3){ const x = seaBase[i], z = seaBase[i + 2]; p[i + 1] = Math.sin(x * .045 + t * .9) * .55 + Math.cos(z * .06 + t * 1.2) * .45; }
  seaGeo.attributes.position.needsUpdate = true; seaGeo.computeVertexNormals();
});

/* ================= Teras: the core island (Fabriophase) ================= */
const grassMat = M(0x6cbf58), sandMat = M(0xf1d8a0);
mesh(new THREE.CylinderGeometry(70, 76, 3, 80), sandMat, 0, -1.7, 0, S, false);
mesh(new THREE.CylinderGeometry(56, 58, 1.2, 80), grassMat, 0, -.6, 0, S, false);
const roadMat = M(0x2f3446, {roughness:.95});
mesh(new THREE.RingGeometry(27.5, 31.5, 80), roadMat, 0, .03, 0, S, false).rotation.x = -Math.PI / 2;
mesh(new THREE.RingGeometry(29.4, 29.6, 80), new THREE.MeshBasicMaterial({color:0xffd37a}), 0, .05, 0, S, false).rotation.x = -Math.PI / 2;
[0, Math.PI, Math.PI / 2, -Math.PI / 2, -Math.PI / 4, -1.37].forEach(a => { const p = mesh(new THREE.BoxGeometry(3, .06, 18), roadMat, Math.sin(a) * 20, .04, Math.cos(a) * 20, S, false); p.rotation.y = a; });
mesh(new THREE.BoxGeometry(3, .06, 22), roadMat, 52, .04, -10.4, S, false).rotation.y = -1.37;
mesh(new THREE.CylinderGeometry(13, 13, .2, 64), M(0xa9b1c4, {roughness:.6}), 0, .05, 0, S, false);
mesh(new THREE.TorusGeometry(13, .18, 6, 80), new THREE.MeshBasicMaterial({color:0x9fc8ff}), 0, .2, 0, S, false).rotation.x = Math.PI / 2;

/* --- forest of emotions --- */
const FOREST = {x:-38, z:6};
const swayGroups = [];   // tree groups that bend in the wind (pivot at ground)
const windInst = [];     // instanced tree meshes: {mesh, items:[{x,y,z,k,oy,sy}]}
const trunkMat = M(0x6b4a33), leafMats = [M(0x3f8f45), M(0x4fa452), M(0x2f7a3e)];
for(let i = 0; i < 46; i++){
  const a = rng() * Math.PI * 2, d = 6 + rng() * 13;
  const x = FOREST.x + Math.cos(a) * d, z = FOREST.z + Math.sin(a) * d;
  if(Math.hypot(x, z) > 53) continue;
  const s = .8 + rng() * .8, g = grp(x, 0, z); swayGroups.push(g);
  mesh(new THREE.CylinderGeometry(.25 * s, .35 * s, 2.2 * s, 6), trunkMat, 0, 1.1 * s, 0, g);
  mesh(new THREE.ConeGeometry(1.7 * s, 3.2 * s, 7), leafMats[i % 3], 0, 3.4 * s, 0, g);
  mesh(new THREE.ConeGeometry(1.25 * s, 2.5 * s, 7), leafMats[(i + 1) % 3], 0, 4.8 * s, 0, g);
  collide(x, z, .7 * s);
}
const rasaTree = grp(FOREST.x, 0, FOREST.z); swayGroups.push(rasaTree);
mesh(new THREE.CylinderGeometry(.8, 1.3, 7, 8), trunkMat, 0, 3.5, 0, rasaTree);
const rasaLeafMat = M(0x9be37a, {emissive:0x9be37a, emissiveIntensity:.45});
mesh(new THREE.IcosahedronGeometry(4.6, 1), rasaLeafMat, 0, 9.5, 0, rasaTree);
mesh(new THREE.IcosahedronGeometry(3, 1), rasaLeafMat, 2.6, 7.6, 1.2, rasaTree);
mesh(new THREE.IcosahedronGeometry(2.6, 1), rasaLeafMat, -2.4, 8, -1, rasaTree);
collide(FOREST.x, FOREST.z, 1.8);
const fireN = 90, fireGeo = new THREE.BufferGeometry(), fireBase = new Float32Array(fireN * 3);
for(let i = 0; i < fireN; i++){ const a = rng() * 6.283, d = 2 + rng() * 15; fireBase[i * 3] = FOREST.x + Math.cos(a) * d; fireBase[i * 3 + 1] = 1 + rng() * 6; fireBase[i * 3 + 2] = FOREST.z + Math.sin(a) * d; }
fireGeo.setAttribute('position', new THREE.BufferAttribute(fireBase.slice(), 3));
const fireMat = new THREE.PointsMaterial({color:0xd4ff8a, size:.35, transparent:true, opacity:.9, blending:THREE.AdditiveBlending, depthWrite:false});
S.add(new THREE.Points(fireGeo, fireMat));
anims.push(t => { const p = fireGeo.attributes.position.array; for(let i = 0; i < fireN; i++){ p[i * 3] = fireBase[i * 3] + Math.sin(t * .7 + i) * .8; p[i * 3 + 1] = fireBase[i * 3 + 1] + Math.sin(t * 1.3 + i * 2.1) * .6; p[i * 3 + 2] = fireBase[i * 3 + 2] + Math.cos(t * .6 + i * 1.7) * .8; } fireGeo.attributes.position.needsUpdate = true; });

/* --- beach of memories --- */
const umbrellaMats = [M(0xff4f45), M(0x9fc8ff), M(0xffb86b)];
[[-14, 60], [12, 61], [24, 57]].forEach(([x, z], i) => {
  mesh(new THREE.CylinderGeometry(.1, .1, 3.4, 6), M(0xe9e4da), x, 1.4, z);
  mesh(new THREE.ConeGeometry(2.6, 1.1, 10), umbrellaMats[i], x, 3.3, z);
  mesh(new THREE.BoxGeometry(1.1, .3, 2.6), M(0xffffff), x + 1.6, .1, z + .4);
});
const bottles = grp();
const bottleGlass = new THREE.MeshStandardMaterial({color:0xffe2b8, emissive:0xffb86b, emissiveIntensity:.8, transparent:true, opacity:.85, roughness:.2});
function layoutBottles(n){
  while(bottles.children.length) bottles.remove(bottles.children[0]);
  const r = mulberry(11);
  for(let i = 0; i < Math.min(n, 48); i++){
    const a = Math.PI / 2 + (r() - .5) * 1.5, d = 58.5 + r() * 8;
    const b = grp(Math.cos(a) * d, -.1, Math.sin(a) * d, bottles); b.rotation.z = (r() - .5) * 1.4; b.rotation.y = r() * 6;
    mesh(new THREE.CylinderGeometry(.28, .28, .9, 8), bottleGlass, 0, .45, 0, b, false);
    mesh(new THREE.CylinderGeometry(.1, .14, .35, 6), bottleGlass, 0, 1.05, 0, b, false);
  }
}

/* --- Akademi Ilmu --- */
const marble = M(0xe9e4da, {roughness:.55});
const aka = grp(38, 0, 0);
mesh(new THREE.BoxGeometry(15, 1, 13), marble, 0, .5, 0, aka);
mesh(new THREE.BoxGeometry(10, 8, 10), M(0xd8d2c6), 1, 5, 0, aka);
for(let i = 0; i < 6; i++) mesh(new THREE.CylinderGeometry(.45, .5, 8, 10), marble, -5.6, 5, -5 + i * 2, aka);
mesh(new THREE.BoxGeometry(2.4, .7, 12.5), marble, -5.4, 9.3, 0, aka);
mesh(new THREE.ConeGeometry(8.6, 4, 4), M(0x3d4a7a), 0, 11.6, 0, aka).rotation.y = Math.PI / 4;
mesh(new THREE.BoxGeometry(.2, 4.2, 3), new THREE.MeshBasicMaterial({color:0x8fb8ff}), -4, 3, 0, aka);
const books = grp(0, 16, 0, aka);
const bookMat = holoMat(0x8fb8ff, .55);
for(let i = 0; i < 14; i++){ const a = i / 14 * 6.283; mesh(new THREE.BoxGeometry(1.1, 1.5, .3), bookMat, Math.cos(a) * 6, Math.sin(i) * .6, Math.sin(a) * 6, books, false).rotation.y = -a; }
anims.push((t, dt) => { books.rotation.y += dt * .25; });
collide(38.5, 0, 7.6);

/* --- Kilang Rancangan + Fabriophase towers --- */
function windowTex(seed = 5, lit = '#ffd88a', wall = '#202638'){
  const c = document.createElement('canvas'); c.width = 64; c.height = 128; const g = c.getContext('2d');
  g.fillStyle = wall; g.fillRect(0, 0, 64, 128);
  const r = mulberry(seed);
  for(let y = 4; y < 128; y += 9) for(let x = 4; x < 64; x += 10){ g.fillStyle = r() > .45 ? lit : '#33405e'; g.fillRect(x, y, 6, 5); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
const wtex = windowTex();
const towerMat = new THREE.MeshStandardMaterial({color:0xffffff, map:wtex, emissive:0xffffff, emissiveMap:wtex, emissiveIntensity:.25, roughness:.6});
nightMats.push([towerMat, .15, 1.1]);
[[44, -18, 4, 22], [40, -40, 5, 28], [22, -43, 4, 17], [48, -30, 3.5, 15], [33, -48, 3.5, 12]].forEach(([x, z, w, h]) => {
  mesh(new THREE.BoxGeometry(w * 2, h, w * 2), towerMat, x, h / 2, z);
  const beacon = mesh(new THREE.SphereGeometry(.35, 8, 6), new THREE.MeshBasicMaterial({color:0xff4f45}), x, h + 4.1, z, S, false);
  mesh(new THREE.CylinderGeometry(.08, .08, 4, 4), M(0x9aa3b8), x, h + 2, z);
  anims.push(t => { beacon.visible = Math.sin(t * 3 + x) > 0; });
  collide(x, z, w * 1.45);
});
const fac = grp(30, 0, -30); fac.rotation.y = -Math.PI / 4;
mesh(new THREE.BoxGeometry(12, 6, 9), M(0x3a4258), 0, 3, 0, fac);
for(let i = 0; i < 4; i++) mesh(new THREE.BoxGeometry(3, 2.2, 9.2), M(0x4b556f), -4.5 + i * 3, 6.6, 0, fac).rotation.z = .5;
mesh(new THREE.BoxGeometry(.2, 2.6, 4), new THREE.MeshBasicMaterial({color:0xff8a5c}), -6.1, 1.6, 0, fac);
[[3.5, -2.5], [3.5, 2.5]].forEach(([x, z]) => { mesh(new THREE.CylinderGeometry(.7, .9, 11, 10), M(0xb7bcc9), x, 5.5, z, fac); mesh(new THREE.CylinderGeometry(.92, .92, .6, 10), M(0xff4f45), x, 9.2, z, fac); });
collide(30, -30, 7);
const steam = [];
const steamMat = new THREE.MeshBasicMaterial({color:0xffffff, transparent:true, opacity:.5, depthWrite:false});
for(let i = 0; i < 14; i++){ const s = mesh(new THREE.SphereGeometry(1, 8, 6), steamMat.clone(), 0, 0, 0, S, false); s.userData.k = i / 14; steam.push(s); }
let factoryActivity = .4;
fac.updateMatrixWorld(true);
const chimneyWorld = [new THREE.Vector3(3.5, 11, -2.5), new THREE.Vector3(3.5, 11, 2.5)].map(v => fac.localToWorld(v.clone()));
anims.push((t, dt) => steam.forEach((s, i) => {
  s.userData.k = (s.userData.k + dt * (.08 + factoryActivity * .25)) % 1; const k = s.userData.k, c = chimneyWorld[i % 2];
  s.position.set(c.x + Math.sin(k * 6 + i) * 1.2 + k * 3, c.y + k * 12, c.z + k * 2); s.scale.setScalar(.6 + k * 2.4); s.material.opacity = (1 - k) * .45;
}));
const robots = [];
const robotMat = M(0xe9edf6, {metalness:.4, roughness:.35}), eyeMat = new THREE.MeshBasicMaterial({color:0x9fc8ff});
for(let i = 0; i < 9; i++){
  const r = grp();
  mesh(new THREE.BoxGeometry(.9, 1.1, .7), robotMat, 0, 1.0, 0, r);
  mesh(new THREE.SphereGeometry(.42, 10, 8), robotMat, 0, 1.9, 0, r);
  mesh(new THREE.BoxGeometry(.5, .12, .1), eyeMat, 0, 1.95, .4, r, false);
  mesh(new THREE.CylinderGeometry(.35, .45, .5, 8), M(0x3a4258), 0, .25, 0, r);
  Object.assign(r.userData, {a:i / 9 * 6.283, rad:10 + (i % 3) * 1.6, sp:.18 + (i % 4) * .05});
  info(r, 'Robot Pekerja ' + String(i + 1).padStart(2, '0'), 'Pekerja Fabriophase. Bergerak lebih laju bila banyak rancangan sedang dibina.');
  robots.push(r);
}
anims.push((t, dt) => robots.forEach(r => { const u = r.userData; u.a += dt * u.sp * (.5 + factoryActivity * 1.4); r.position.set(30 + Math.cos(u.a) * u.rad, Math.abs(Math.sin(t * 6 + u.a * 9)) * .12, -30 + Math.sin(u.a) * u.rad); r.rotation.y = -u.a; }));

/* --- Pelabuhan + lighthouse --- */
const wood = M(0x8a6a4a);
const pier = grp(46, 0, 42); pier.rotation.y = Math.PI / 4;
mesh(new THREE.BoxGeometry(4, .4, 22), wood, 0, -.2, 10, pier);
for(let i = 0; i < 6; i++){ mesh(new THREE.CylinderGeometry(.22, .22, 3, 6), wood, -1.8, -1.3, i * 4, pier); mesh(new THREE.CylinderGeometry(.22, .22, 3, 6), wood, 1.8, -1.3, i * 4, pier); }
const boat = grp(4.5, -1, 16, pier);
mesh(new THREE.BoxGeometry(2.6, 1.2, 7), M(0xffffff), 0, 0, 0, boat); mesh(new THREE.BoxGeometry(2, 1.2, 2.6), M(0xff4f45), 0, 1.1, -.6, boat);
anims.push(t => { boat.position.y = -1 + Math.sin(t * 1.4) * .25; boat.rotation.z = Math.sin(t * 1.1) * .05; });
const lh = grp(-46, 0, -40);
for(let i = 0; i < 5; i++) mesh(new THREE.CylinderGeometry(1.6 - i * .15, 1.75 - i * .15, 2.4, 12), M(i % 2 ? 0xff4f45 : 0xffffff), 0, 1.2 + i * 2.4, 0, lh);
mesh(new THREE.CylinderGeometry(1.1, 1.1, 1.4, 12), lampMat, 0, 13, 0, lh);
const beamPivot = grp(0, 13, 0, lh);
const lhBeam = mesh(new THREE.ConeGeometry(4, 40, 16, 1, true), holoMat(0xfff2b0, .12), 0, 0, 20, beamPivot, false); lhBeam.rotation.x = -Math.PI / 2;
anims.push((t, dt) => { beamPivot.rotation.y += dt * .6; lhBeam.material.opacity = .03 + nightLevel * .08; });
collide(-46, -40, 2.4);

/* --- plaza holograms --- */
const parfait = grp(-8, 0, -4);
const cupPts = []; for(let i = 0; i <= 10; i++) cupPts.push(new THREE.Vector2(.6 + Math.pow(i / 10, 1.6) * 2.4, i * .7));
mesh(new THREE.LatheGeometry(cupPts, 24), holoMat(0x9fc8ff, .22), 0, .3, 0, parfait, false);
mesh(new THREE.LatheGeometry(cupPts, 12), holoWire(0x9fc8ff, .35), 0, .3, 0, parfait, false);
[[0xff7ab6, 2.2, 1.6], [0xfff1c4, 3.6, 2.2], [0x8a5a3c, 5, 2.6]].forEach(([c, y, r]) => mesh(new THREE.CylinderGeometry(r, r * .9, 1.2, 20), holoMat(c, .4), 0, y, 0, parfait, false));
[[0, 7.6, 0, 1.5], [1.3, 7.2, .6, 1.1], [-1.2, 7.1, -.5, 1.1]].forEach(([x, y, z, r]) => mesh(new THREE.SphereGeometry(r, 16, 12), holoMat(0xfff7e6, .45), x, y, z, parfait, false));
mesh(new THREE.SphereGeometry(.45, 12, 10), holoMat(0xff4f45, .7), 0, 9.3, 0, parfait, false);
info(parfait, 'Parfait Gergasi', 'Hologram cahaya 3D. Dengan Light-Pressure Gloves, kau boleh rasa teksturnya.', true);
const dataCloud = grp(0, 22, 0);
const dcN = 900, dcGeo = new THREE.BufferGeometry(), dcP = new Float32Array(dcN * 3);
for(let i = 0; i < dcN; i++){ const u = rng() * 2 - 1, th = rng() * 6.283, r = 5 + rng() * 2.5, s = Math.sqrt(1 - u * u); dcP[i * 3] = Math.cos(th) * s * r * 1.5; dcP[i * 3 + 1] = u * r * .8; dcP[i * 3 + 2] = Math.sin(th) * s * r; }
dcGeo.setAttribute('position', new THREE.BufferAttribute(dcP, 3));
dataCloud.add(new THREE.Points(dcGeo, new THREE.PointsMaterial({color:0x9fc8ff, size:.25, transparent:true, opacity:.85, blending:THREE.AdditiveBlending, depthWrite:false})));
mesh(new THREE.IcosahedronGeometry(6.5, 1), holoWire(0x9fc8ff, .18), 0, 0, 0, dataCloud, false).scale.set(1.5, .8, 1);
info(dataCloud, 'Awan Data Gergasi', 'Pantulan aliran data ke Eryth Records. Setiap titik adalah serpihan maklumat yang sedang disegerakkan.', true);
anims.push((t, dt) => { dataCloud.rotation.y += dt * .12; dataCloud.position.y = 22 + Math.sin(t * .6) * .8; });
const holoBot = grp(8, 0, -4);
const hb = holoMat(0xff8a5c, .32), hw = holoWire(0xff8a5c, .4);
[[0, 1.6, 0, 1.4, 3.2, 1], [0, 4.4, 0, 2.6, 2.4, 1.6], [0, 6.4, 0, 1.6, 1.4, 1.4], [-1.9, 4.2, 0, .6, 2.6, .6], [1.9, 4.2, 0, .6, 2.6, .6]].forEach(([x, y, z, w, h, d]) => { mesh(new THREE.BoxGeometry(w, h, d), hb, x, y, z, holoBot, false); mesh(new THREE.BoxGeometry(w, h, d), hw, x, y, z, holoBot, false); });
mesh(new THREE.BoxGeometry(1.1, .2, .1), new THREE.MeshBasicMaterial({color:0xffffff}), 0, 6.5, .72, holoBot, false);
info(holoBot, 'Robot Hologram', 'Unjuran robot penyambut tetamu. Ia tidak wujud secara fizikal.', true);
anims.push(t => { holoBot.rotation.y = Math.sin(t * .4) * .6; });
const ery = grp(-4, 3.2, 7);
mesh(new THREE.SphereGeometry(1, 20, 16), holoMat(0xff4f45, .4), 0, 0, 0, ery, false);
const eryRing = mesh(new THREE.TorusGeometry(1.6, .06, 6, 40), holoMat(0x9fc8ff, .8), 0, 0, 0, ery, false);
info(ery, 'ERY · AI Assistant', 'Pembantu hologram Erythmind. Sentuh dengan sarung tangan untuk dapatkan petua.', true);
anims.push(t => { ery.position.y = 3.2 + Math.sin(t * 1.6) * .3; eryRing.rotation.x = t * 1.2; eryRing.rotation.y = t * .7; });
const holos = [parfait, dataCloud, holoBot, ery];

/* --- Mesin Serba Guna --- */
const machine = grp(9, 0, 9); machine.rotation.y = Math.atan2(-9, -9);
mesh(new THREE.BoxGeometry(2.4, 3.4, 1.7), M(0xd2373a, {roughness:.4, metalness:.3}), 0, 1.7, 0, machine);
mesh(new THREE.PlaneGeometry(1.8, 1.3), new THREE.MeshBasicMaterial({color:0x9fc8ff}), 0, 2.3, .86, machine, false);
mesh(new THREE.SphereGeometry(1.2, 16, 8, 0, 6.283, 0, Math.PI / 2), M(0xe9edf6, {metalness:.5, roughness:.3}), 0, 3.4, 0, machine);
mesh(new THREE.BoxGeometry(1.6, .3, .5), M(0x1a1f2e), 0, .9, .9, machine);
info(machine, 'Mesin Serba Guna', 'Masak, main dan imbas memori dengan satu butang.');
collide(9, 9, 1.7);

/* --- lift to Labophase --- */
const LIFT = {x:0, z:-24};
const padMat = new THREE.MeshBasicMaterial({color:0x9fc8ff});
function liftPad(x, y, z, parent = S, color = 0x9fc8ff){
  mesh(new THREE.TorusGeometry(2.6, .16, 6, 40), color === 0x9fc8ff ? padMat : new THREE.MeshBasicMaterial({color}), x, y + .2, z, parent, false).rotation.x = Math.PI / 2;
  mesh(new THREE.CylinderGeometry(2.6, 2.6, .1, 32), holoMat(color, .25), x, y + .12, z, parent, false);
}
liftPad(LIFT.x, 0, LIFT.z);
const liftBeam = mesh(new THREE.CylinderGeometry(1.8, 1.8, LAB.y - 3, 24, 1, true), holoMat(0x9fc8ff, .1), LIFT.x, (LAB.y - 3) / 2, LIFT.z, S, false);
anims.push(t => { liftBeam.material.opacity = .08 + Math.sin(t * 2) * .03; });

/* --- tanks Karrar & Zulfiqar --- */
const tanks = TANKS.map((name, i) => {
  const g = grp(); const hull = M(0x3b4250, {metalness:.35, roughness:.55});
  mesh(new THREE.BoxGeometry(2.4, 1, 4), hull, 0, .9, 0, g);
  mesh(new THREE.BoxGeometry(.7, .9, 4.4), M(0x1d212b), -1.35, .5, 0, g); mesh(new THREE.BoxGeometry(.7, .9, 4.4), M(0x1d212b), 1.35, .5, 0, g);
  mesh(new THREE.BoxGeometry(1.7, .75, 1.9), hull, 0, 1.8, -.2, g);
  mesh(new THREE.CylinderGeometry(.13, .16, 3, 8), hull, 0, 1.85, 1.8, g).rotation.x = Math.PI / 2;
  mesh(new THREE.BoxGeometry(2.42, .12, 4.02), new THREE.MeshBasicMaterial({color:0xff4f45}), 0, 1.2, 0, g, false);
  g.userData.a = i * Math.PI;
  info(g, 'Tank ' + name, 'Pengawal berkenderaan kebal. Meronda jalan lingkar Teras dan menghalau penceroboh yang tidak diundang.');
  return g;
});
anims.push((t, dt) => tanks.forEach((g, i) => { g.userData.a += dt * .05 * (i ? -1 : 1); const a = g.userData.a; g.position.set(Math.cos(a) * 29.5, 0, Math.sin(a) * 29.5); g.rotation.y = -a + (i ? Math.PI : 0); }));

/* --- hypersonic missile patrol around the whole archipelago --- */
const missiles = MISSILES.map((name, i) => {
  const g = grp(); const body = M(0xdfe3ea, {metalness:.5, roughness:.3});
  mesh(new THREE.CylinderGeometry(.6, .6, 7, 10), body, 0, 0, 0, g).rotation.x = Math.PI / 2;
  mesh(new THREE.ConeGeometry(.6, 2.2, 10), M(0xff4f45, {metalness:.4}), 0, 0, 4.6, g).rotation.x = Math.PI / 2;
  for(let k = 0; k < 4; k++){ const f = mesh(new THREE.BoxGeometry(.08, 1.4, 1.2), body, Math.cos(k * Math.PI / 2) * .6, Math.sin(k * Math.PI / 2) * .6, -2.8, g); f.rotation.z = k * Math.PI / 2 + Math.PI / 2; }
  mesh(new THREE.SphereGeometry(.75, 10, 8), holoMat(0xffa64d, .7), 0, 0, -3.9, g, false);
  mesh(new THREE.ConeGeometry(.6, 9, 10, 1, true), holoMat(0xffd2a0, .25), 0, 0, -8.3, g, false).rotation.x = -Math.PI / 2;
  const r = 330 + i * 16;
  Object.assign(g.userData, {r, h:14 + (i % 4) * 6, sp:(.03 + (i % 3) * .008) * (i % 2 ? 1 : -1), a:i / 7 * 6.283});
  info(g, name, 'Rudal hipersonik peronda. Orbit ' + r + ' m mengelilingi seluruh kepulauan Erythmind, memusnahkan penceroboh asing yang tidak diundang.');
  return g;
});
const _mv = new THREE.Vector3();
anims.push((t, dt) => missiles.forEach(g => { const u = g.userData; u.a += dt * u.sp; const y = u.h + Math.sin(t * .8 + u.r) * 2; g.position.set(OVERVIEW[0].x + Math.cos(u.a) * u.r, y, OVERVIEW[0].z + Math.sin(u.a) * u.r); const a2 = u.a + Math.sign(u.sp) * .02; _mv.set(OVERVIEW[0].x + Math.cos(a2) * u.r, y, OVERVIEW[0].z + Math.sin(a2) * u.r); g.lookAt(_mv); }));

/* --- Bavar-373: invisible guardian --- */
const bavarShell = mesh(new THREE.IcosahedronGeometry(420, 2), holoWire(0x9fc8ff, .02), OVERVIEW[0].x, 20, OVERVIEW[0].z, S, false);
const scanRing = mesh(new THREE.TorusGeometry(1, .8, 6, 120), holoMat(0x9fc8ff, .5), OVERVIEW[0].x, 1, OVERVIEW[0].z, S, false); scanRing.rotation.x = Math.PI / 2;
anims.push(t => { const k = (t % 12) / 12; scanRing.scale.set(1 + k * 420, 1 + k * 420, 1); scanRing.material.opacity = (1 - k) * .3; bavarShell.rotation.y = t * .01; });

/* ================= Labophase (layer 1) ================= */
const lab = grp(LAB.x, LAB.y, LAB.z);
mesh(new THREE.CylinderGeometry(LAB.r + 1, LAB.r - 5, 3, 72), M(0xb9c2d2, {metalness:.35, roughness:.5}), 0, -1.5, 0, lab);
mesh(new THREE.TorusGeometry(LAB.r + 1, .2, 6, 90), new THREE.MeshBasicMaterial({color:0xff4f45}), 0, 0, 0, lab, false).rotation.x = Math.PI / 2;
[9, 16].forEach(r => { mesh(new THREE.RingGeometry(r, r + .12, 80), new THREE.MeshBasicMaterial({color:0x9fc8ff, transparent:true, opacity:.5}), 0, .03, 0, lab, false).rotation.x = -Math.PI / 2; });
const cloudMat = new THREE.MeshStandardMaterial({color:0xffffff, roughness:1, flatShading:true, transparent:true, opacity:.95});
const islandCloud = grp(0, 0, 0, lab);
for(let i = 0; i < 26; i++){ const a = rng() * 6.283, d = rng() * (LAB.r - 2); mesh(new THREE.IcosahedronGeometry(4 + rng() * 5, 1), cloudMat, Math.cos(a) * d, -5 - rng() * 4, Math.sin(a) * d, islandCloud, false).scale.y = .55; }
const seaCloud = grp();
for(let i = 0; i < 22; i++){ const a = i / 22 * 6.283 + rng() * .2, d = 48 + rng() * 26; const cl = grp(Math.cos(a) * d, LAB.y - 10 + rng() * 6, LAB.z + Math.sin(a) * d * .9, seaCloud);
  for(let k = 0; k < 4; k++) mesh(new THREE.IcosahedronGeometry(3 + rng() * 4, 1), cloudMat, (rng() - .5) * 10, (rng() - .5) * 2, (rng() - .5) * 6, cl, false).scale.y = .5; }
anims.push((t, dt) => { seaCloud.rotation.y += dt * .004; });

// Eryth Records: the cracked coffee bean holding the brain
const BEAN = {x:LAB.x, z:LAB.z - 4};
const bean = grp(0, 4.6, -4, lab);
const beanMat = M(0x5a2c1a, {roughness:.5, side:THREE.DoubleSide, flatShading:false});
const halfA = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 28, 0, Math.PI), beanMat), halfB = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 28, 0, Math.PI), beanMat);
halfB.rotation.y = Math.PI; [halfA, halfB].forEach(h => { h.castShadow = true; bean.add(h); });
halfA.position.z = .1; halfA.rotation.x = .24; halfB.position.z = -.1; halfB.rotation.x = -.24; bean.rotation.x = .5;
const brainGeo = new THREE.IcosahedronGeometry(.7, 3);
{ const p = brainGeo.attributes.position; const v = new THREE.Vector3(); for(let i = 0; i < p.count; i++){ v.fromBufferAttribute(p, i); v.multiplyScalar(1 + Math.sin(v.x * 18) * Math.cos(v.y * 15) * .06 + Math.sin(v.z * 22) * .04); p.setXYZ(i, v.x, v.y, v.z); } brainGeo.computeVertexNormals(); }
const brainMat = new THREE.MeshStandardMaterial({color:0xff8fa3, emissive:0xff4f6a, emissiveIntensity:.6, roughness:.5});
const brain = new THREE.Mesh(brainGeo, brainMat); brain.scale.set(1.1, .9, .8); brain.position.y = .12; bean.add(brain);
mesh(new THREE.PlaneGeometry(1.9, .5), holoMat(0xff5a6a, .55), 0, .72, 0, bean, false).rotation.x = -Math.PI / 2;
const brainLight = new THREE.PointLight(0xff4f6a, 1.2, 30); brainLight.position.set(0, 5, -4); lab.add(brainLight);
let beanGrowth = 1, beanTarget = 1;
const beanSize = () => ({x:7.5 * beanGrowth, y:4.8 * beanGrowth, z:5.5 * beanGrowth});
const beanCol = collide(BEAN.x, BEAN.z, 6.6, 1);
anims.push((t, dt) => {
  beanGrowth = lerp(beanGrowth, beanTarget, 1 - Math.exp(-dt * 1.5)); const s = beanSize();
  bean.scale.set(s.x, s.y, s.z); bean.position.y = s.y * .95; beanCol.r = Math.max(s.x, s.z) * .9;
  brainMat.emissiveIntensity = .5 + Math.sin(t * 2.2) * .25; brainLight.intensity = 1 + Math.sin(t * 2.2) * .4;
});
// Makmal Cara Fikir
const mk = grp(-15, 0, 9, lab);
mesh(new THREE.CylinderGeometry(5, 5.4, 1.2, 32), M(0xd5dbe6, {metalness:.3}), 0, .6, 0, mk);
mesh(new THREE.SphereGeometry(4.8, 32, 16, 0, 6.283, 0, Math.PI / 2), new THREE.MeshStandardMaterial({color:0xbff8ff, transparent:true, opacity:.22, roughness:.05, metalness:.2, depthWrite:false}), 0, 1.2, 0, mk, false);
const atom = grp(0, 3.6, 0, mk);
mesh(new THREE.SphereGeometry(.6, 16, 12), new THREE.MeshBasicMaterial({color:0x9fc8ff}), 0, 0, 0, atom, false);
[0, 1, 2].forEach(i => { mesh(new THREE.TorusGeometry(2, .05, 6, 60), holoMat(0x9fc8ff, .8), 0, 0, 0, atom, false).rotation.set(i * 1.05, i * .6, 0); });
let thinkSpeed = .6;
anims.push((t, dt) => { atom.rotation.y += dt * thinkSpeed; atom.rotation.x += dt * thinkSpeed * .6; });
collide(LAB.x - 15, LAB.z + 9, 5.2, 1);
// Island A.C. control tower
const ac = grp(15, 0, 9, lab);
mesh(new THREE.CylinderGeometry(1.4, 2, 7, 12), M(0xeef1f6, {metalness:.4}), 0, 3.5, 0, ac);
const acRings = [0, 1, 2].map(i => { const r = mesh(new THREE.TorusGeometry(2.6 + i * .7, .12, 6, 50), holoMat(0x8fd8ff, .7), 0, 4 + i * 1.6, 0, ac, false); r.rotation.x = Math.PI / 2; return r; });
const acCore = mesh(new THREE.OctahedronGeometry(1, 0), new THREE.MeshBasicMaterial({color:0xffd27a}), 0, 9, 0, ac, false);
anims.push((t, dt) => { acRings.forEach((r, i) => { r.rotation.z += dt * (.4 + i * .3) * (i % 2 ? -1 : 1); }); acCore.rotation.y += dt; });
collide(LAB.x + 15, LAB.z + 9, 2.6, 1);
// satellite sync pods
const pods = SATS.map((s, i) => {
  const a = Math.PI + .35 + i / 6 * (Math.PI - .7);
  const x = Math.cos(a) * 12.5, z = -4 + Math.sin(a) * 9;
  const g = grp(x, 0, z, lab);
  mesh(new THREE.CylinderGeometry(.8, 1, 1, 12), M(0xd5dbe6, {metalness:.4}), 0, .5, 0, g);
  const light = mesh(new THREE.SphereGeometry(.4, 12, 10), new THREE.MeshBasicMaterial({color:0x37405a}), 0, 1.4, 0, g, false);
  collide(LAB.x + x, LAB.z + z, 1, 1);
  return {g, light, world:new THREE.Vector3(LAB.x + x, LAB.y + 1.4, LAB.z + z)};
});
liftPad(0, -.1, 20, lab);
// Frontier Dome
const domeU = {uTime:{value:0}, uAlert:{value:0}, uColor:{value:new THREE.Color(0xff4f45)}, uAlertColor:{value:new THREE.Color(0xff1a1a)}};
const dome = new THREE.Mesh(new THREE.SphereGeometry(LAB.r + 3, 64, 32, 0, 6.283, 0, Math.PI / 2), new THREE.ShaderMaterial({
  uniforms:domeU, transparent:true, depthWrite:false, side:THREE.DoubleSide, blending:THREE.AdditiveBlending,
  vertexShader:'varying vec3 vN; varying vec3 vV; varying vec3 vW; void main(){ vec4 w = modelMatrix*vec4(position,1.); vW = w.xyz; vec4 mv = viewMatrix*w; vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }',
  fragmentShader:'uniform float uTime; uniform float uAlert; uniform vec3 uColor; uniform vec3 uAlertColor; varying vec3 vN; varying vec3 vV; varying vec3 vW; void main(){ float f = pow(1. - abs(dot(vN, vV)), 2.2); float scan = smoothstep(.96, 1., sin(vW.y*1.6 - uTime*2.4)*.5+.5); float grid = smoothstep(.97,1.,abs(sin(vW.x*.9))) + smoothstep(.97,1.,abs(sin(vW.z*.9))); vec3 c = mix(uColor, uAlertColor, uAlert); float a = f*.5 + scan*.18 + grid*.04 + uAlert*.35; gl_FragColor = vec4(c*(1.+uAlert), a); }'
}));
dome.position.set(LAB.x, LAB.y, LAB.z); S.add(dome);
anims.push((t, dt) => { domeU.uTime.value = t; domeU.uAlert.value = Math.max(0, domeU.uAlert.value - dt * .9); });

/* --- shared weather particles + stars --- */
const fxN = 2600, fxGeo = new THREE.BufferGeometry(), fxP = new Float32Array(fxN * 3);
for(let i = 0; i < fxN; i++){ fxP[i * 3] = (rng() - .5) * 140; fxP[i * 3 + 1] = rng() * 60; fxP[i * 3 + 2] = (rng() - .5) * 140; }
fxGeo.setAttribute('position', new THREE.BufferAttribute(fxP, 3));
const fxMat = new THREE.PointsMaterial({color:0xffffff, size:.45, transparent:true, opacity:0, depthWrite:false});
const fx = new THREE.Points(fxGeo, fxMat); fx.frustumCulled = false; scene.add(fx);
const stN = 1500, stGeo = new THREE.BufferGeometry(), stP = new Float32Array(stN * 3);
for(let i = 0; i < stN; i++){ const u = rng() * .9 + .1, th = rng() * 6.283, s = Math.sqrt(1 - u * u); stP[i * 3] = Math.cos(th) * s * 3500; stP[i * 3 + 1] = u * 3500; stP[i * 3 + 2] = Math.sin(th) * s * 3500; }
stGeo.setAttribute('position', new THREE.BufferAttribute(stP, 3));
const stMat = new THREE.PointsMaterial({color:0xffffff, size:2, sizeAttenuation:false, transparent:true, opacity:0, fog:false, depthWrite:false});
const stars = new THREE.Points(stGeo, stMat); stars.frustumCulled = false; scene.add(stars);
let nightLevel = 0;   // 0 day .. 1 night (set by the time system)
