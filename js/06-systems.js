'use strict';
/* ================= time & prayer (JAKIM-style calculation) ================= */
let zoneCode = LS.get('erythmind.zone', 'WLY01');
const timeCtl = {mode:'live', minutes:12 * 60};
const D2R = Math.PI / 180, R2D = 180 / Math.PI;
const fixA = a => ((a % 360) + 360) % 360, fixH = h => ((h % 24) + 24) % 24;
function zoneInfo(){ return JAKIM.find(z => z[0] === zoneCode) || JAKIM[0]; }
function myNow(){ // Malaysia time (UTC+8) as {date parts, minutes}
  const d = new Date(Date.now() + 8 * 3600e3);
  let mins = d.getUTCHours() * 60 + d.getUTCMinutes() + d.getUTCSeconds() / 60;
  if(timeCtl.mode === 'manual') mins = timeCtl.minutes;
  return {y:d.getUTCFullYear(), m:d.getUTCMonth() + 1, d:d.getUTCDate(), mins, key:`${d.getUTCFullYear()}-${d.getUTCMonth() + 1}-${d.getUTCDate()}`};
}
function julian(y, m, d){ if(m <= 2){ y -= 1; m += 12; } const A = Math.floor(y / 100), B = 2 - A + Math.floor(A / 4); return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5; }
function sunPos(jd){
  const D = jd - 2451545, g = fixA(357.529 + .98560028 * D), q = fixA(280.459 + .98564736 * D);
  const L = fixA(q + 1.915 * Math.sin(g * D2R) + .02 * Math.sin(2 * g * D2R)), e = 23.439 - .00000036 * D;
  const RA = fixH(Math.atan2(Math.cos(e * D2R) * Math.sin(L * D2R), Math.cos(L * D2R)) * R2D / 15);
  return {decl:Math.asin(Math.sin(e * D2R) * Math.sin(L * D2R)) * R2D, eqt:q / 15 - RA};
}
const prayerCache = {};
function prayerTimes(y, m, d){
  const key = `${zoneCode}-${y}-${m}-${d}`; if(prayerCache[key]) return prayerCache[key];
  const [, , lat, lng] = zoneInfo(); const tz = 8; const jd = julian(y, m, d) - lng / (15 * 24);
  const at = (t, angle, ccw) => { const {decl, eqt} = sunPos(jd + t); const noon = fixH(12 - eqt);
    const c = (-Math.sin(angle * D2R) - Math.sin(decl * D2R) * Math.sin(lat * D2R)) / (Math.cos(decl * D2R) * Math.cos(lat * D2R));
    const T = Math.acos(clamp(c, -1, 1)) * R2D / 15; return noon + (ccw ? -T : T); };
  const asrAt = t => { const {decl} = sunPos(jd + t); const ang = -Math.atan(1 / (1 + Math.tan(Math.abs(lat - decl) * D2R))) * R2D; return at(t, ang, false); };
  const toMin = h => (h + tz - lng / 15) * 60;
  const noon = fixH(12 - sunPos(jd + .5).eqt);
  const r = {
    subuh:Math.ceil(toMin(at(5 / 24, 20, true)) + 2), syuruk:Math.floor(toMin(at(6 / 24, .833, true)) - 2), zohor:Math.ceil(toMin(noon) + 2),
    asar:Math.ceil(toMin(asrAt(13 / 24)) + 2), maghrib:Math.ceil(toMin(at(18 / 24, .833, false)) + 2), isyak:Math.ceil(toMin(at(18 / 24, 18, false)) + 2),
  };
  prayerCache[key] = r; return r;
}
const PRAYERS = [['subuh','Subuh'],['zohor','Zohor'],['asar','Asar'],['maghrib','Maghrib'],['isyak','Isyak']];
function dayPhase(now = myNow()){
  const p = prayerTimes(now.y, now.m, now.d), m = now.mins;
  if(m < p.subuh || m >= p.isyak) return 'malam'; if(m < p.syuruk) return 'subuh'; if(m < p.asar) return 'siang'; if(m < p.maghrib) return 'petang'; return 'senja';
}
function nextPrayer(now = myNow()){
  const p = prayerTimes(now.y, now.m, now.d);
  for(const [k, n] of PRAYERS) if(p[k] > now.mins) return {k, n, at:p[k], inMin:p[k] - now.mins};
  return {k:'subuh', n:'Subuh', at:p.subuh, inMin:p.subuh + 1440 - now.mins};
}
function sunVector(now = myNow()){
  const [, , lat, lng] = zoneInfo(); const jd = julian(now.y, now.m, now.d) + (now.mins / 60 - 8) / 24;
  const {decl, eqt} = sunPos(jd); const solar = now.mins / 60 - 8 + lng / 15 + eqt; const H = (solar - 12) * 15 * D2R;
  const la = lat * D2R, de = decl * D2R;
  const east = -Math.cos(de) * Math.sin(H), north = Math.sin(de) * Math.cos(la) - Math.cos(de) * Math.sin(la) * Math.cos(H), up = Math.sin(la) * Math.sin(de) + Math.cos(la) * Math.cos(de) * Math.cos(H);
  return new THREE.Vector3(east, up, -north).normalize();
}
function moonPhase(){ const days = (Date.now() / 864e5 - 10957.5 - 6.4) % 29.530588; const p = (days + 29.53) % 29.53;
  const names = [[1.8,'Anak bulan'],[5.5,'Sabit muda'],[9.2,'Separuh awal'],[12.9,'Hampir purnama'],[16.6,'Purnama'],[20.3,'Hampir separuh'],[24,'Separuh akhir'],[27.7,'Sabit tua'],[30,'Anak bulan']];
  return {age:p, name:names.find(n => p < n[0])[1]}; }

/* ================= sky, light & weather ================= */
const SKY_KEYS = [
  [-18, 0x030818, 0x0c1a3c, 0x0a1430, .12],
  [-10, 0x081634, 0x1e3262, 0x1a2c58, .22],
  [-4, 0x1c2c5e, 0x8a6a7a, 0x6a5a74, .34],
  [0, 0x2b3e7a, 0xff8a5c, 0xe39a7c, .55],
  [6, 0x3a64ae, 0xffc28c, 0xf0c8a8, .8],
  [15, 0x4a74b0, 0xd8dde0, 0xc8d2d8, 1],
  [90, 0x3f6ca8, 0xd2dce2, 0xc4d0d8, 1.05],
];
const env = {top:new THREE.Color(), bot:new THREE.Color(), fog:new THREE.Color(), light:1, near:140, far:520, alt:30};
const _c1 = new THREE.Color(), _c2 = new THREE.Color(), _grey = new THREE.Color(0x8e9aaa), _sunV = new THREE.Vector3(0, 1, 0);
let envInit = false, weatherFx = 0;
const FXCFG = {rain:{op:.55, size:.22, col:0xb9d6ff, fall:55, sway:0}, snow:{op:.95, size:.5, col:0xffffff, fall:4, sway:.6}, petal:{op:.95, size:.55, col:0xffb7d5, fall:3, sway:2.2}, leaf:{op:.95, size:.6, col:0x6aa04a, fall:6, sway:3}, dust:{op:.4, size:.3, col:0xd8c49a, fall:.5, sway:1.4}, none:{op:0, size:.3, col:0xffffff, fall:0, sway:0}};
let windNow = 0;
function weatherNow(){
  if(weatherKey !== 'auto') return WEATHER[weatherKey] || WEATHER.cerah;
  const v = moodValence(); if(v == null) return WEATHER.cerah; return v >= 1 ? WEATHER.bunga : v >= -.4 ? WEATHER.cerah : v >= -1.2 ? WEATHER.hujan : WEATHER.ribut;
}
function skyAt(alt){
  let i = 0; while(i < SKY_KEYS.length - 2 && alt > SKY_KEYS[i + 1][0]) i++;
  const a = SKY_KEYS[i], b = SKY_KEYS[i + 1], t = clamp((alt - a[0]) / (b[0] - a[0]), 0, 1);
  return {top:_c1.setHex(a[1]).lerp(new THREE.Color(b[1]), t).clone(), bot:_c1.setHex(a[2]).lerp(new THREE.Color(b[2]), t).clone(), fog:_c1.setHex(a[3]).lerp(new THREE.Color(b[3]), t).clone(), light:lerp(a[4], b[4], t)};
}
const NIV_ENV = {
  lembah:{top:0x07142a, bot:0x2f4a6a, fog:0x9fb6d0, near:30, far:340, light:.55, sunCol:0xcfe2ff, hs:0xbfd6ff, hg:0x3a4a5a, fx:'snow'},
  gua:{top:0x0c0806, bot:0x1a120c, fog:0x22160e, near:30, far:240, light:.38, sunCol:0xffb070, hs:0xff9a5a, hg:0x1a120c, fx:'none'},
  labirin:{top:0x0a0e18, bot:0x1c2638, fog:0x1a2232, near:26, far:150, light:.75, sunCol:0x8aa0c8, hs:0xa8b8d8, hg:0x0a0c12, fx:'none'},
  dewan:{top:0x120c08, bot:0x2a1c10, fog:0x3a2a1a, near:80, far:260, light:.95, sunCol:0xffd9a0, hs:0xffe6c0, hg:0x3a2410, fx:'none'},
  hikmah:{top:0x6a9fd0, bot:0xffe3b0, fog:0xe8d6b0, near:60, far:420, light:.9, sunCol:0xffe8b0, hs:0xfff2d0, hg:0x4a6a3a, fx:'none'},
};
function updateEnvironment(dt, t){
  const k = envInit ? 1 - Math.exp(-dt * 1.6) : 1; envInit = true;
  const w = weatherNow();
  let tgt, sunCol, hs, hg, fxKind, near, far;
  if(indoorLayer(player.layer)){
    const n = player.layer === 4 ? NIV_ENV.dewan : player.layer === 5 ? NIV_ENV.labirin : NIV_ENV[nivRegion(player.x, player.z)];
    tgt = {top:_c2.setHex(n.top).clone(), bot:new THREE.Color(n.bot), fog:new THREE.Color(n.fog), light:n.light}; sunCol = n.sunCol; hs = n.hs; hg = n.hg; fxKind = n.fx; near = n.near; far = n.far;
    _sunV.set(.4, .8, .3).normalize(); env.alt = 40; nightLevel = lerp(nightLevel, n.light < .3 ? 1 : .3, k);
  } else {
    _sunV.copy(sunVector()); env.alt = Math.asin(clamp(_sunV.y, -1, 1)) * R2D;
    tgt = skyAt(env.alt);
    ['top','bot','fog'].forEach(c => tgt[c].lerp(_grey.clone().multiplyScalar(.4 + tgt.light * .6), w.grey));
    if(w.tint) ['top','bot','fog'].forEach(c => tgt[c].lerp(new THREE.Color(w.tint), w.tintK));
    tgt.light *= 1 - w.grey * .35 - (w.dim || 0);
    sunCol = env.alt > 0 ? 0xffe2b0 : 0x9fb4ff; hs = 0xdfe8f4; hg = 0x3a4030; fxKind = w.fx;
    near = 110 * w.fog; far = 480 * w.fog;
    nightLevel = lerp(nightLevel, smooth(4, -8, env.alt), k);
  }
  env.top.lerp(tgt.top, k); env.bot.lerp(tgt.bot, k); env.fog.lerp(tgt.fog, k); env.light = lerp(env.light, tgt.light, k);
  env.near = lerp(env.near, near, k); env.far = lerp(env.far, far, k);
  const zoomOut = Math.max(0, cam.dist - 30);
  skyU.top.value.copy(env.top); skyU.bot.value.copy(env.bot); scene.fog.color.copy(env.fog);
  scene.fog.near = env.near + zoomOut * 1.1; scene.fog.far = env.far + zoomOut * 2.6;
  skyU.sunDir.value.copy(_sunV); skyU.glow.value = indoorLayer(player.layer) ? 0 : clamp(env.alt / 6 + .6, 0, 1) * (1 - weatherNow().grey);
  sky.position.copy(camera.position); stars.position.copy(camera.position);
  const moonDir = new THREE.Vector3(-_sunV.x, Math.max(.25, -_sunV.y), -_sunV.z).normalize();
  const moonD = Math.min(2600, camera.far * .6); moon.position.copy(camera.position).addScaledVector(moonDir, moonD); moon.scale.setScalar(moonD / 2600);   // stays inside the far plane (24-prestasi.js) moon.visible = !indoorLayer(player.layer) && nightLevel > .2; moon.material.opacity = nightLevel;
  hemi.color.setHex(hs).multiplyScalar(.6 + env.light * .4); hemi.groundColor.setHex(hg); hemi.intensity = .16 + env.light * .44;
  const night = !indoorLayer(player.layer) && env.alt < -3;
  sun.color.setHex(night ? 0x8fa8ff : sunCol); sun.intensity = night ? .34 : env.light * (indoorLayer(player.layer) ? .8 : .92);
  const ld = night ? moonDir : _sunV;
  sun.position.set(camTarget.x + ld.x * 160, camTarget.y + Math.max(ld.y, .15) * 160, camTarget.z + ld.z * 160); sun.target.position.copy(camTarget);
  stMat.opacity = indoorLayer(player.layer) ? 0 : nightLevel * (1 - weatherNow().grey);
  nightMats.forEach(([m, a, b]) => { if(m.emissiveIntensity != null && m.isMeshStandardMaterial) m.emissiveIntensity = lerp(a, b, nightLevel); });
  lampMat.color.setHex(0x8a7a5a).lerp(_c2.setHex(0xffe6a8), nightLevel);
  slitMat.color.setHex(0x1a2340).lerp(_c2.setHex(0xffd27a), nightLevel);
  seaCloud.visible = seaClouds;
  setTerrainSnow(w.snow ? 1 : 0, w.ground, .4);
  grassMat.color.setHex(w.snow ? 0xe9f1f6 : (w.grass || 0x6cbf58)); sandMat.color.setHex(w.snow ? 0xdfe7ee : 0xf1d8a0);
  // particles
  weatherFx = lerp(weatherFx, fxKind === 'none' ? 0 : 1, k);
  const p = fxGeo.attributes.position.array, cfg = FXCFG[fxKind] || FXCFG.rain, drift = (indoorLayer(player.layer) ? 0 : windNow) * 26;
  fxMat.opacity = weatherFx * (fxKind === 'rain' && w.rainOp ? w.rainOp : cfg.op); fxMat.size = cfg.size; fxMat.color.setHex(fxKind === 'leaf' ? (w.leafCol || cfg.col) : cfg.col);
  if(weatherFx > .02){ const fall = cfg.fall * (fxKind === 'rain' ? .7 + (w.rain || .45) : 1);
    for(let i = 0; i < fxN; i++){ p[i * 3 + 1] -= fall * dt; p[i * 3] += (drift + Math.sin(t * 1.3 + i) * cfg.sway) * dt; p[i * 3 + 2] += Math.cos(t * .9 + i * 1.7) * cfg.sway * .5 * dt;
      if(p[i * 3 + 1] < 0) p[i * 3 + 1] += 60; if(p[i * 3] > 70) p[i * 3] -= 140; if(p[i * 3] < -70) p[i * 3] += 140; }
    fxGeo.attributes.position.needsUpdate = true; }
  fx.position.set(player.x, player.y + layerBase(player.layer), player.z);
}

/* ================= audio: procedural soundscape ================= */
const AU = {ctx:null, on:LS.get('erythmind.sound', true), vol:LS.get('erythmind.vol', {master:.8, music:.5, amb:.7, sfx:.8}), mood:null, nextChord:0, nextPluck:0, chordIx:0, duckUntil:0};
const MOODS = {
  siang:{chords:[[53,57,60,64],[52,55,59,62],[50,53,57,60],[48,52,55,59]], scale:[60,62,64,67,69,72,74,76], dur:8, filt:1400, pluck:.5},
  petang:{chords:[[53,57,60,64],[50,53,57,60],[52,55,59,62],[48,52,55,59]], scale:[60,62,64,67,69,72], dur:9, filt:1100, pluck:.4},
  subuh:{chords:[[50,57,62],[48,55,60],[45,52,57],[47,54,59]], scale:[62,64,66,69,71,74], dur:10, filt:900, pluck:.22},
  senja:{chords:[[45,52,55,60],[41,48,53,57],[48,52,55,59],[43,50,55,57]], scale:[57,60,62,64,67,69], dur:10, filt:900, pluck:.25},
  malam:{chords:[[50,54,57,61],[47,50,54,57],[43,47,50,54],[45,49,52,55]], scale:[74,76,78,81,83,86], dur:11, filt:700, pluck:.3, box:true},
  hujan:{chords:[[45,48,52,55],[41,45,48,52]], scale:[69,72,74,76], dur:12, filt:600, pluck:.15},
  salji:{chords:[[52,59,64,66],[48,55,62,64]], scale:[76,79,83,86,88], dur:12, filt:2200, pluck:.3, box:true},
  lembah:{chords:[[38,45,50],[36,43,48]], scale:[62,65,69], dur:14, filt:500, pluck:.08},
  gua:{chords:[[41,48,53],[43,50,55]], scale:[60,63,67], dur:12, filt:700, pluck:.18},
  hikmah:{chords:[[53,57,60,64,67],[50,55,59,62],[48,52,55,60]], scale:[65,67,69,72,74,77], dur:10, filt:1600, pluck:.4},
};
const MOOD_LABEL = {siang:'Siang · slow living', petang:'Petang · slow living', subuh:'Subuh · tenang', senja:'Senja · lembut', malam:'Malam · cozy', hujan:'Hujan · ambien', salji:'Salji · soothing', lembah:'Lembah Nivelham · angin', gua:'Gua Besar · unggun api', hikmah:'Mata Air Hikmah · damai'};
const midi = n => 440 * Math.pow(2, (n - 69) / 12);
function audioStart(){
  if(AU.ctx || !AU.on) { if(AU.ctx && AU.ctx.state === 'suspended') AU.ctx.resume(); return; }
  const C = window.AudioContext || window.webkitAudioContext; if(!C) return;
  const ctx = AU.ctx = new C();
  const g = v => { const n = ctx.createGain(); n.gain.value = v; return n; };
  AU.master = g(AU.vol.master); AU.master.connect(ctx.destination);
  AU.music = g(AU.vol.music); AU.amb = g(AU.vol.amb); AU.sfxG = g(AU.vol.sfx);
  [AU.music, AU.amb, AU.sfxG].forEach(n => n.connect(AU.master));
  const verb = ctx.createConvolver(); { const len = ctx.sampleRate * 2.6, b = ctx.createBuffer(2, len, ctx.sampleRate); for(let c = 0; c < 2; c++){ const d = b.getChannelData(c); for(let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); } verb.buffer = b; }
  AU.verb = g(.35); verb.connect(AU.verb); AU.verb.connect(AU.music); AU.verbIn = verb;
  const mk = (seconds, brown) => { const len = ctx.sampleRate * seconds, b = ctx.createBuffer(1, len, ctx.sampleRate), d = b.getChannelData(0); let last = 0; for(let i = 0; i < len; i++){ const w = Math.random() * 2 - 1; if(brown){ last = (last + .02 * w) / 1.02; d[i] = last * 3.5; } else d[i] = w; } return b; };
  AU.white = mk(4, false); AU.brown = mk(4, true);
  const bed = (buf, type, freq, q) => { const s = ctx.createBufferSource(); s.buffer = buf; s.loop = true; const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; if(q) f.Q.value = q; const gn = g(0); s.connect(f); f.connect(gn); gn.connect(AU.amb); s.start(); return {s, f, g:gn}; };
  AU.beds = {wind:bed(AU.brown, 'lowpass', 500), rain:bed(AU.white, 'bandpass', 1800, .6), sea:bed(AU.brown, 'lowpass', 900), city:bed(AU.brown, 'lowpass', 260), water:bed(AU.white, 'bandpass', 2600, 2), fire:bed(AU.brown, 'lowpass', 340)};
  const hum = ctx.createOscillator(); hum.type = 'sawtooth'; hum.frequency.value = 55; const hf = ctx.createBiquadFilter(); hf.type = 'lowpass'; hf.frequency.value = 160; hum.connect(hf); hf.connect(AU.beds.city.g); hum.start();
  const drone = ctx.createOscillator(), dg = g(0); drone.frequency.value = 55; drone.connect(dg); dg.connect(AU.amb); drone.start(); AU.drone = dg;
}
function setBed(name, v){ const b = AU.beds?.[name]; if(b) b.g.gain.setTargetAtTime(v, AU.ctx.currentTime, .6); }
function env_(node, t0, a, peak, d){ node.gain.setValueAtTime(0, t0); node.gain.linearRampToValueAtTime(peak, t0 + a); node.gain.exponentialRampToValueAtTime(.0001, t0 + a + d); }
function tone(freq, {type = 'sine', t = 0, a = .01, d = .4, v = .2, dest = 'sfx', filt = 0, glide = 0} = {}){
  if(!AU.ctx) return; const ctx = AU.ctx, t0 = ctx.currentTime + t; const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.setValueAtTime(freq, t0);
  if(glide) o.frequency.exponentialRampToValueAtTime(Math.max(20, glide), t0 + a + d);
  let n = o; if(filt){ const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = filt; o.connect(f); n = f; }
  n.connect(g); g.connect(dest === 'music' ? AU.music : AU.sfxG); if(dest === 'music') g.connect(AU.verbIn);
  env_(g, t0, a, v, d); o.start(t0); o.stop(t0 + a + d + .1);
}
function noiseHit({t = 0, d = .12, v = .2, type = 'lowpass', f = 1200, q = .7, brown = false, dest = 'sfx'} = {}){
  if(!AU.ctx) return; const ctx = AU.ctx, t0 = ctx.currentTime + t; const s = ctx.createBufferSource(); s.buffer = brown ? AU.brown : AU.white;
  const fl = ctx.createBiquadFilter(); fl.type = type; fl.frequency.value = f; fl.Q.value = q; const g = ctx.createGain();
  s.connect(fl); fl.connect(g); g.connect(dest === 'amb' ? AU.amb : AU.sfxG); env_(g, t0, .005, v, d); s.start(t0, Math.random() * 3); s.stop(t0 + d + .1);
}
const sfx = {
  step(surf){ const m = {rumput:[900, .05, .09], pasir:[1400, .06, .1], batu:[2600, .035, .12], kayu:[500, .06, .16], salji:[3200, .09, .1], air:[1800, .14, .16], logam:[3400, .03, .1]}[surf] || [1200, .05, .1];
    noiseHit({d:m[1], v:m[2], f:m[0], type:surf === 'air' ? 'bandpass' : 'lowpass'}); if(surf === 'kayu') tone(110, {d:.08, v:.08}); if(surf === 'logam') tone(1800, {d:.05, v:.02}); },
  bird(){ const f = 2400 + Math.random() * 1800, n = 2 + Math.floor(Math.random() * 4); for(let i = 0; i < n; i++) tone(f * (1 + Math.random() * .2), {t:i * .11, a:.01, d:.08, v:.05, glide:f * 1.4, dest:'sfx'}); },
  cricket(){ for(let i = 0; i < 6; i++) tone(4600, {t:i * .045, a:.003, d:.025, v:.018}); },
  owl(){ tone(380, {a:.05, d:.5, v:.06, glide:330}); tone(380, {t:.7, a:.05, d:.9, v:.06, glide:320}); },
  splash(){ noiseHit({d:.4, v:.18, type:'bandpass', f:1400, q:.5}); },
  thunder(){ noiseHit({d:3.5, v:.5, f:120, brown:true}); noiseHit({t:.1, d:1.2, v:.25, f:400, brown:true}); },
  whoosh(){ if(!AU.ctx) return; const ctx = AU.ctx, t0 = ctx.currentTime, s = ctx.createBufferSource(); s.buffer = AU.white; const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 1.2; f.frequency.setValueAtTime(300, t0); f.frequency.exponentialRampToValueAtTime(2600, t0 + .9); const g = ctx.createGain(); s.connect(f); f.connect(g); g.connect(AU.sfxG); env_(g, t0, .3, .25, .8); s.start(t0); s.stop(t0 + 1.3); },
  deny(){ tone(130, {type:'square', d:.35, v:.08, filt:900}); tone(98, {type:'square', t:.18, d:.4, v:.08, filt:900}); },
  beep(){ tone(1320, {d:.08, v:.06}); tone(1760, {t:.1, d:.1, v:.06}); },
  click(){ tone(900, {d:.03, v:.04}); },
  roar(kind){ const base = kind === 'serigala' ? 300 : kind === 'beruang' ? 140 : 90; tone(base, {type:'sawtooth', a:.15, d:1.4, v:.18, filt:700, glide:base * .5}); noiseHit({d:1.2, v:.2, f:500, brown:true}); if(kind === 'serigala') tone(520, {a:.4, d:1.6, v:.06, glide:700}); },
  thud(){ tone(60, {d:.4, v:.4, glide:35}); noiseHit({d:.25, v:.3, f:300, brown:true}); },
  bell(strikes = 1){ const seq = [[72, 0], [76, .9], [74, 1.8], [67, 2.7], [67, 4.2], [74, 5.1], [76, 6], [72, 6.9]];
    seq.forEach(([n, t]) => { const f = midi(n); [1, 2.76, 5.4].forEach((h, i) => tone(f * h, {t, a:.005, d:3.2 - i * .8, v:.11 / (i + 1), dest:'music'})); });
    for(let i = 0; i < strikes; i++) [1, 2.4].forEach((h, k) => tone(midi(55) * h, {t:8.6 + i * 2.2, a:.005, d:3.5, v:.16 / (k + 1), dest:'music'})); },
};
function moodNow(){
  if(player.layer === 4) return 'hikmah';
  if(player.layer === 5) return 'lembah';
  if(player.layer === 2) return nivRegion(player.x, player.z);
  const w = weatherNow(); if(w.fx === 'rain') return 'hujan'; if(w.fx === 'snow') return 'salji';
  return dayPhase();
}
function playChord(notes, dur, filt){
  const ctx = AU.ctx, t0 = ctx.currentTime;
  notes.forEach((n, i) => { [0, 7].forEach((det, k) => { const o = ctx.createOscillator(); o.type = k ? 'sine' : 'triangle'; o.frequency.value = midi(n); o.detune.value = det * (i % 2 ? 1 : -1);
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = filt; const g = ctx.createGain();
    o.connect(f); f.connect(g); g.connect(AU.music); g.connect(AU.verbIn);
    g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(.035 / (k + 1), t0 + 2.4); g.gain.setValueAtTime(.035 / (k + 1), t0 + dur - 1); g.gain.linearRampToValueAtTime(0, t0 + dur + 2.5);
    o.start(t0); o.stop(t0 + dur + 3); }); });
}
let ambTick = 0;
function updateAudio(dt, t){
  if(!AU.ctx || !session) return;
  const ctx = AU.ctx, now = ctx.currentTime;
  const mood = moodNow(); if(mood !== AU.mood){ AU.mood = mood; AU.nextChord = now; updateRadioChip(); }
  const M_ = MOODS[mood];
  const duck = performance.now() < AU.duckUntil ? .12 : 1;
  AU.music.gain.setTargetAtTime(AU.vol.music * duck, now, .8);
  if(now >= AU.nextChord){ const ch = M_.chords[AU.chordIx++ % M_.chords.length]; playChord(ch, M_.dur, M_.filt); AU.nextChord = now + M_.dur; }
  if(now >= AU.nextPluck){ AU.nextPluck = now + 1.2 + Math.random() * 3.5; if(Math.random() < M_.pluck){ const n = M_.scale[Math.floor(Math.random() * M_.scale.length)];
    tone(midi(n), {type:M_.box ? 'sine' : 'triangle', a:.005, d:M_.box ? 1.6 : 2.2, v:M_.box ? .05 : .06, dest:'music', filt:M_.filt * 2}); if(M_.box) tone(midi(n) * 3, {a:.003, d:.6, v:.012, dest:'music'}); } }
  if((ambTick += dt) < .25) return; ambTick = 0;
  const w = weatherNow(), L = player.layer;
  let wind = .04, rain = 0, seaV = 0, city = 0, water = 0, fire = 0, drone = 0;
  if(L === 2){ const reg = nivRegion(player.x, player.z); if(reg === 'lembah'){ wind = .5; drone = .03; } else if(reg === 'gua'){ fire = clamp(1 - Math.hypot(player.x - VIL.x, player.z - VIL.z) / 70, .05, .6); drone = .05; wind = .05; } else { water = clamp(1 - Math.hypot(player.x - NV.spring.x, player.z - NV.spring.z) / 40, 0, .35); wind = .08; } }
  else {
    if(L === 1) wind = .25;
    rain = w.fx === 'rain' ? (w.rain ?? .45) * .9 : 0; wind = Math.max(wind, windNow * .75); if(w.fx === 'snow') wind = Math.max(wind, .3);
    if(windNow > .4 && Math.random() < windNow * dt * 2.5) noiseHit({d:.6 + Math.random(), v:windNow * .06, f:5200, type:'highpass', dest:'amb'});
    const dCore = Math.abs(Math.hypot(player.x, player.z) - 64), dMain = Math.abs(Math.hypot(player.x - MAIN.x, player.z - MAIN.z) - 205);
    seaV = clamp(1 - Math.min(dCore, dMain) / 40, 0, 1) * .45 * (L === 0 ? 1 : .3);
    city = clamp(1 - Math.hypot(player.x - CITY.x, player.z - CITY.z) / 110, 0, 1) * .14;
    water = clamp(1 - riverDist(player.x, player.z) / 24, 0, 1) * .3 + clamp(1 - (Math.hypot(player.x - LAKE.x, player.z - LAKE.z) - LAKE.r) / 30, 0, 1) * .15;
    const phase = dayPhase();
    if(phase !== 'malam' && w.fx === 'none' && Math.random() < .12) sfx.bird();
    if(phase === 'malam' && Math.random() < .25) sfx.cricket();
    if(phase === 'malam' && Math.random() < .015) sfx.owl();
    if(w.fx === 'rain' && !w.lightning && Math.random() < .004 * (w.rain || .45)) sfx.thunder();
  }
  if(L === 2 && nivRegion(player.x, player.z) === 'hikmah' && Math.random() < .08) sfx.bird();
  setBed('wind', wind); setBed('rain', rain); setBed('sea', seaV); setBed('city', city); setBed('water', water); setBed('fire', fire);
  AU.beds.sea.f.frequency.setTargetAtTime(600 + Math.sin(t * .4) * 300, now, .5);
  AU.beds.wind.f.frequency.setTargetAtTime(380 + Math.sin(t * .23) * 160, now, .8);
  AU.drone.gain.setTargetAtTime(drone, now, 1);
  if(fire > .1 && Math.random() < .5) noiseHit({d:.03, v:fire * .2, f:3000, type:'highpass', dest:'amb'});
}
function setVol(k, v){ AU.vol[k] = v; LS.set('erythmind.vol', AU.vol); if(!AU.ctx) return; ({master:AU.master, music:AU.music, amb:AU.amb, sfx:AU.sfxG})[k].gain.setTargetAtTime(v, AU.ctx.currentTime, .1); }
function setSound(on){ AU.on = on; LS.set('erythmind.sound', on); if(on){ audioStart(); AU.ctx?.resume(); } else AU.ctx?.suspend(); updateRadioChip(); }

/* ================= Menara Jam: prayer-time chimes ================= */
const chimed = LS.get('erythmind.chimed', {});
let clockTick = 0;
function updateClock(){
  const nowMs = performance.now(); if(nowMs - clockTick < 1500) return; clockTick = nowMs;
  const now = myNow();
  drawClockFace(new Date(2000, 0, 1, Math.floor(now.mins / 60), Math.floor(now.mins % 60), Math.floor((now.mins * 60) % 60)));
  updatePrayerChip(now);
  if(timeCtl.mode !== 'live') return;
  const p = prayerTimes(now.y, now.m, now.d);
  for(const [k, n] of PRAYERS){
    const id = now.key + ':' + k;
    if(now.mins >= p[k] && now.mins < p[k] + 3 && !chimed[id]){ chimed[id] = 1; Object.keys(chimed).forEach(x => { if(!x.startsWith(now.key)) delete chimed[x]; }); LS.set('erythmind.chimed', chimed); prayerArrived(k, n, p[k]); }
  }
}
function prayerArrived(k, n, at){
  if(AU.ctx && AU.on){ if(!(typeof playAzan === 'function' && playAzan())) sfx.bell(k === 'maghrib' ? 3 : 1); AU.duckUntil = performance.now() + 6 * 60e3; }     // the recorded azan (28-bunyi.js), else the bell
  bellLight.intensity = 3; setTimeout(() => bellLight.intensity = 0, 12000);
  showAzanCard(k, n, at);
}
