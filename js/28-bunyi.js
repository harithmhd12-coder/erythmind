'use strict';
/* ================= Bunyi: sound that actually starts on phones, and a recorded sound for every power =================
   1. Unlocking: the music and sounds are made live by the browser's audio engine, which a phone only lets start
      during a real tap. The engine used to be started after a sign-in finished (no tap any more), and iPhones do not
      count the touch that starts a drag. Now the first tap, click or key anywhere starts it, and every later one
      wakes it if the phone paused it. On iPhone the "playback" audio session is asked for too, so the silent switch
      does not mute the world.
   2. Recorded power sounds: a file in assets/sfx/ named in assets/sfx/manifest.json ({"kamusari":"assets/sfx/…"})
      replaces the made-up sound of that power, for whoever uses it and for everyone who sees it (quieter with
      distance). Powers without a file keep the made-up sound. */
const SFX = {buf:{}, files:{}, last:{}, muteUntil:0, ready:false};
const SFX_NAMES = {
  kamusari:'Kamusari', raja:'Haki Raja Agung', obs:'Haki Pemerhatian', arm:'Haki Persenjataan', gearputih:'Gear Putih', tumbuk:'Tumbukan Gergasi',
  magma:'Magma (Akainu)', ais:'Ais (Aokiji)', cahaya:'Cahaya (Kizaru)', graviti:'Graviti (Fujitora)', hutan:'Hutan (Ryokugyu)', emas:'Gergasi Emas (Sengoku)', tebasan:'Pedang Hitam (Mihawk)', galaksi:'Tinju Galaksi (Garp)',
  naga:'Naga Biru (Kaido)', matahari:'Matahari & Petir (Big Mom)', gempa:'Gempa (Whitebeard)', gelap:'Kegelapan (Blackbeard)', bilik:'Bilik Biru (Law)',
};

/* --- 1. unlock on any real gesture --- */
let silentEl = null;
function unlockAudio(){
  if(!AU.on) return;
  try{ if(navigator.audioSession && navigator.audioSession.type !== 'playback') navigator.audioSession.type = 'playback'; }catch(e){}
  audioStart(); if(!AU.ctx) return;
  if(AU.ctx.state !== 'running') AU.ctx.resume().catch(() => {});
  // older iPhones: a looping silent <audio> moves the page into the playback session, past the silent switch
  if(!silentEl && /iPhone|iPad|iPod/.test(navigator.userAgent)){
    const n = 4000, b = new Uint8Array(44 + n), v = new DataView(b.buffer), w = (o, s) => [...s].forEach((c, i) => b[o + i] = c.charCodeAt(0));
    w(0, 'RIFF'); v.setUint32(4, 36 + n, true); w(8, 'WAVEfmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, 8000, true); v.setUint32(28, 8000, true); v.setUint16(32, 1, true); v.setUint16(34, 8, true); w(36, 'data'); v.setUint32(40, n, true); b.fill(128, 44);
    silentEl = new Audio(URL.createObjectURL(new Blob([b], {type:'audio/wav'}))); silentEl.loop = true; silentEl.setAttribute('playsinline', ''); silentEl.volume = .01;
  }
  if(silentEl && silentEl.paused) silentEl.play().catch(() => {});
  if(!SFX.ready) loadSfx();
}
['touchend', 'click', 'keydown'].forEach(ev => addEventListener(ev, unlockAudio, {capture:true, passive:true}));
document.addEventListener('visibilitychange', () => { if(!document.hidden && AU.ctx && AU.ctx.state !== 'running') AU.ctx.resume().catch(() => {}); });

/* --- 2. recorded power sounds --- */
async function loadSfx(){
  if(SFX.ready || !AU.ctx) return; SFX.ready = true;
  let man = {}; try{ const r = await fetch('assets/sfx/manifest.json'); if(r.ok) man = await r.json(); }catch(e){}
  SFX.files = man;
  await Promise.all(Object.entries(man).map(async ([key, file]) => {                // all at once: ready within a moment of the first tap
    try{ const ab = await (await fetch(file)).arrayBuffer(); SFX.buf[key] = await AU.ctx.decodeAudioData(ab); }catch(e){ console.warn('sfx', key, e); }
  }));
}
// plays the file for `key`; at a world position it fades with distance from the camera. True when a file played.
function playSfx(key, at, vol = 1){
  const buf = SFX.buf[key]; if(!buf || !AU.ctx || AU.ctx.state !== 'running') return false;
  const now = performance.now(); if(now < (SFX.last[key] || 0)) return true;      // the same sound is not stacked while it is still going (eight admirals at once)
  SFX.last[key] = now + buf.duration * 700;
  let v = vol; if(at){ const d = camera.position.distanceTo(at); if(d > 600) return true; v *= Math.max(.08, 1 - d / 600); }
  const s = AU.ctx.createBufferSource(), g = AU.ctx.createGain(); s.buffer = buf; g.gain.value = v; s.connect(g); g.connect(AU.sfxG); s.start();
  SFX.muteUntil = performance.now() + Math.min(buf.duration, 3) * 1000;      // the made-up sound of the same moment stays quiet
  return true;
}
// while a recorded sound plays, the made-up effect sounds (not music, not ambience) hold back
const _toneB = tone, _noiseB = noiseHit;
tone = function(f, o = {}){ if((o.dest || 'sfx') === 'sfx' && performance.now() < SFX.muteUntil) return; return _toneB(f, o); };
noiseHit = function(o = {}){ if((o.dest || 'sfx') === 'sfx' && performance.now() < SFX.muteUntil) return; return _noiseB(o); };

// the owner's and visitors' powers (their own and everyone else's in the room); admiral powers are heard below
POWER_HOOKS.push((id, o, isMine) => { if(SFX_NAMES[id]) playSfx(id, isMine ? null : o, isMine ? 1 : .8); });
// every admiral and intruder power effect, wherever it is cast (also the owner's borrowed admiral power)
Object.keys(POWER_FX).forEach(k => { const fx = POWER_FX[k]; POWER_FX[k] = function(from, to){ playSfx(k, to, .9); return fx.apply(this, arguments); }; });

/* --- settings: which powers have a recorded sound, and a button to hear each --- */
const _gfxSettingsHtmlB = gfxSettingsHtml;
gfxSettingsHtml = function(){
  const base = _gfxSettingsHtmlB(); if(!isOwner()) return base;
  const st = AU.ctx ? AU.ctx.state : 'belum dimulakan';
  return base + `<h3>Bunyi kuasa</h3><div class="note">Enjin bunyi: <b>${esc(st === 'running' ? 'berjalan' : st)}</b>${st !== 'running' ? ' · sentuh mana-mana butang untuk menghidupkannya' : ''}. Kuasa bertanda ✓ guna fail bunyi yang dirakam; yang lain guna bunyi ciptaan.</div>
    <ul class="facts">${Object.entries(SFX_NAMES).map(([k, n]) => `<li>${SFX.files[k] ? '✓' : '·'} ${esc(n)}${SFX.buf[k] ? ` <button class="btn" type="button" data-sfxtest="${k}">Dengar</button>` : ''}</li>`).join('')}</ul>`;
};
document.addEventListener('click', e => { const k = e.target?.dataset?.sfxtest; if(k){ unlockAudio(); playSfx(k); } });
