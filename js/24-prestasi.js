'use strict';
/* ================= Prestasi: draw only what can be seen, and pick a quality the device can carry =================
   1. Layers: everything used to be drawn at once (the castle, the library hall, the maze with 500 dementors and all
      of Nivelham while standing on the island, and the whole island while underground). Each top-level piece of the
      surface group is filed into a per-layer container once, by where it sits; only the containers that can be seen
      from the current layer are drawn.
   2. Distance: the camera's far plane follows the fog, so whatever the fog has already hidden is not drawn either.
   3. Quality: Tinggi / Sederhana / Rendah / Sangat rendah, or Auto (default). Auto starts low on phones, high on
      computers, and moves one step at a time from the measured frame rate. Lower steps reduce resolution, turn off
      shadows and the film pass, and refresh labels and the minimap less often. */
const Q_NAMES = {auto:'Auto · ikut kelajuan peranti', 3:'Tinggi', 2:'Sederhana', 1:'Rendah', 0:'Sangat rendah'};
const Q = {pick:LS.get('erythmind.q', 'auto'), tier:matchMedia('(pointer:coarse)').matches ? 1 : 2, frames:0, acc:0, slow:0, fast:0, lab:0};
if(Q.pick !== 'auto') Q.tier = +Q.pick;

/* --- per-layer containers inside the surface group --- */
const LC = {0:grp(0, 0, 0, S), 2:grp(0, 0, 0, S), 3:grp(0, 0, 0, S), 4:grp(0, 0, 0, S), 5:grp(0, 0, 0, S)};
const LC_SET = new Set(Object.values(LC));
const _lb = new THREE.Box3();
function layerOfObject(o){
  _lb.setFromObject(o); if(_lb.isEmpty()) return null;
  const cx = (_lb.min.x + _lb.max.x) / 2, cy = (_lb.min.y + _lb.max.y) / 2;
  if(cy < -300) return cx > 0 ? 5 : 4;                  // Labirin Memori (+x) and Dewan Baitul Hikmah (-x), both deep below
  if(cy < -60) return 2;                                // Nivelham
  if(cy > 200) return 3;                                // Istana Pangaea
  return 0;                                             // the island, the sea and Labophase above it
}
function fileLayers(){
  [...S.children].forEach(c => { if(LC_SET.has(c) || c.userData.lcDone) return; c.userData.lcDone = true;
    const l = layerOfObject(c); if(l == null){ c.userData.lcDone = false; return; } LC[l].add(c); });
}
// what can be seen from each layer
function applyLayers(){
  const l = player.layer, low = Q.tier <= 2;
  LC[0].visible = l === 0 || l === 1 || l === 3;
  LC[3].visible = l === 3 || ((l === 0 || l === 1) && !low);     // the floating castle in the sky only on Tinggi
  LC[2].visible = l === 2; N.visible = l === 2;
  LC[4].visible = l === 4; LC[5].visible = l === 5;
}

/* --- far plane follows the fog; sky, stars and moon scale inside it --- */
const SKY_R = 4000;
function applyFar(){
  const inside = indoorLayer(player.layer);
  let far = inside ? 700 : Math.max(420, scene.fog.far * 1.08);
  if(Q.tier <= 1 && !inside) far = Math.min(far, 520);
  if(cam.dist > 140) far = Math.max(far, scene.fog.far * 1.1);            // satellite view
  if(Math.abs(camera.far - far) > 8){ camera.far = far; camera.updateProjectionMatrix(); }
  const k = Math.min(1, far * .9 / SKY_R); sky.scale.setScalar(k); stars.scale.setScalar(k);
}

/* --- the sea: waves in the vertex shader instead of 22,500 vertices on the CPU every other frame --- */
{
  const U = {uT:{value:0}};
  seaMat.onBeforeCompile = sh => { sh.uniforms.uT = U.uT;
    sh.vertexShader = 'uniform float uT;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\ntransformed.y += sin(position.x * .045 + uT * .9) * .55 + cos(position.z * .06 + uT * 1.2) * .45;'); };
  seaMat.needsUpdate = true;
  const i = anims.findIndex(f => /seaGeo\.attributes\.position/.test(String(f))); if(i >= 0) anims[i] = t => { U.uT.value = t; };
}

/* --- quality --- */
function applyTier(){
  const t = Q.tier, dpr = devicePixelRatio || 1;
  const pr = t >= 3 ? Math.min(dpr, 2) : t === 2 ? Math.min(dpr, 1.5) : t === 1 ? 1 : .75;
  if(Math.abs(renderer.getPixelRatio() - pr) > .01){ renderer.setPixelRatio(pr); resize(); if(composer) setGfx(gfxMode); }
  const shadows = t >= 2;
  if(sun.castShadow !== shadows){ sun.castShadow = shadows; }
  const ms = t >= 3 ? 2048 : 1024;
  if(sun.shadow.mapSize.x !== ms){ sun.shadow.mapSize.set(ms, ms); if(sun.shadow.map){ sun.shadow.map.dispose(); sun.shadow.map = null; } }
  Q.noPost = t <= 1;
  if(composer) composer.setPixelRatio(Math.min(pr, gfxMode === 'penuh' ? 1.5 : 1.25));
  applyLayers();
}
function setQuality(pick){
  Q.pick = pick; LS.set('erythmind.q', pick);
  if(pick !== 'auto') Q.tier = +pick; Q.slow = Q.fast = 0; applyTier();
  toast(`Kualiti grafik: ${Q_NAMES[pick]}${pick === 'auto' ? ` (sekarang ${Q_NAMES[Q.tier]})` : ''}.`, 'ok', 2500);
}
// Auto: measure real frames; step down after 3 s below 40 fps, step up after 8 s above 57 fps
function autoTune(dt){
  if(Q.pick !== 'auto' || !session || document.hidden) return;
  Q.frames++; Q.acc += dt; if(Q.acc < 1) return;
  const fps = Q.frames / Q.acc; Q.frames = 0; Q.acc = 0; Q.fps = fps;
  const top = matchMedia('(pointer:coarse)').matches ? 2 : 3;
  if(fps < 40){ Q.slow++; Q.fast = 0; if(Q.slow >= 3 && Q.tier > 0){ Q.tier--; Q.slow = 0; applyTier(); } }
  else if(fps > 57){ Q.fast++; Q.slow = 0; if(Q.fast >= 8 && Q.tier < top){ Q.tier++; Q.fast = 0; applyTier(); } }
  else { Q.slow = 0; Q.fast = 0; }
}

/* --- lighter label and minimap refresh on the low steps --- */
const _updateLabels = updateLabels;
updateLabels = function(){ if(Q.tier <= 1 && (Q.lab++ & 1)) return; _updateLabels(); };
const _drawMinimap = drawMinimap;
drawMinimap = function(){ if(Q.tier <= 1 && (Q.lab & 2)) return; _drawMinimap(); };

/* --- settings: quality next to the film look --- */
const _gfxSettingsHtml = gfxSettingsHtml;
gfxSettingsHtml = function(){
  return _gfxSettingsHtml() + `<div class="field"><label for="qSel">Kualiti grafik</label><select id="qSel">${Object.entries(Q_NAMES).map(([k, n]) => `<option value="${k}" ${String(Q.pick) === k ? 'selected' : ''}>${n}${k === 'auto' && Q.pick === 'auto' ? ` (sekarang ${Q_NAMES[Q.tier]})` : ''}</option>`).join('')}</select></div>
    <div class="note">Auto menurunkan kualiti sendiri bila peranti perlahan${Q.fps ? ` · kini ${Q.fps.toFixed(0)} fps` : ''}.</div>`;
};
document.addEventListener('change', e => { if(e.target.id === 'qSel') setQuality(e.target.value === 'auto' ? 'auto' : +e.target.value); });

// the film pass is rebuilt fresh for every entry: a composer made while the gate was up can come back washed out
const _startSessionQ = startSession;
startSession = function(s){ _startSessionQ(s); if(composer) setGfx(gfxMode); applyTier(); };

/* --- per frame --- */
let lcT = 0;
anims.push((t, dt) => {
  lcT -= dt; if(lcT <= 0){ lcT = 4; fileLayers(); }            // new pieces (models that finish loading) get filed too
  applyLayers(); applyFar(); autoTune(dt);
});
fileLayers(); applyTier();
