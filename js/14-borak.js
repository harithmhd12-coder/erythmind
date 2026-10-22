'use strict';
/* ================= Borak: typed chat and push-to-talk voice with everyone in the room =================
   Messages travel over room events only: nothing is stored, late joiners see nothing earlier.
   Voice is walkie-talkie style: hold to record (max 15 s), release to send in small chunks. */
const CHAT = {room:null, micOff:false, open:LS.get('erythmind.chatOpen', false), tts:LS.get('erythmind.tts', false), unread:0, lastSend:0, rec:null, parts:new Map(), bubbles:new Map()};
const MAX_VOICE_S = 15, CHUNK = 3000;
const chatEl = $('#chat'), logEl = $('#chatLog'), inEl = $('#chatIn');

function chatColor(r, g){ return r === 'owner' ? 'owner' : g === 'female' ? 'female' : 'male'; }
function chatLine({n, r, g, t, voice, me}){
  const row = document.createElement('div'); row.className = 'cl ' + chatColor(r, g) + (me ? ' me' : '');
  const who = document.createElement('b'); who.textContent = (n || 'Tetamu') + (r === 'owner' ? ' · pemilik' : ''); row.appendChild(who);
  if(voice){ const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'vplay'; btn.textContent = `▶ Suara ${voice.secs}s`; btn.addEventListener('click', () => playVoice(voice.url)); row.appendChild(btn); }
  else { const span = document.createElement('span'); span.textContent = t; row.appendChild(span); }
  logEl.appendChild(row); while(logEl.children.length > 60) logEl.firstChild.remove();
  logEl.scrollTop = logEl.scrollHeight;
  if(!CHAT.open && !me){ CHAT.unread++; renderChatBar(); }
}
function sysLine(t){ const row = document.createElement('div'); row.className = 'cl sys'; row.textContent = t; logEl.appendChild(row); logEl.scrollTop = logEl.scrollHeight; }
function renderChatBar(){
  chatEl.classList.toggle('open', CHAT.open); document.body.classList.toggle('chatOpen', CHAT.open && !chatEl.hidden);
  $('#chatCount').textContent = CHAT.unread && !CHAT.open ? String(CHAT.unread) : ''; $('#chatCount').hidden = !(CHAT.unread && !CHAT.open);
  $('#ttsBtn').classList.toggle('on', CHAT.tts); $('#ttsBtn').setAttribute('aria-pressed', String(CHAT.tts));
  const ok = !!CHAT.room && !!session; inEl.disabled = !ok; $('#chatSend').disabled = !ok; $('#pttBtn').disabled = !ok;
  inEl.placeholder = ok ? 'Taip mesej kepada semua dalam room… (Enter)' : 'Room tidak tersambung';
  if(!CHAT.rec){ $('#pttBtn').querySelector('span').textContent = CHAT.micOff ? 'Nota suara' : 'Tahan untuk bercakap'; $('#pttBtn').dataset.short = CHAT.micOff ? 'Nota suara' : 'Cakap'; $('#pttBtn').title = CHAT.micOff ? 'Mikrofon disekat dalam paparan ini: rakam dengan perakam peranti atau pilih fail audio (maks 15 s)' : 'Tahan untuk bercakap (maks 15 s)'; }
}
function setChatOpen(on){ CHAT.open = on; LS.set('erythmind.chatOpen', on); renderChatBar(); if(on){ CHAT.unread = 0; renderChatBar(); if(inEl.disabled) toast('Room belum tersambung. Borak aktif bila paparan disambungkan ke room.', 'bad'); else inEl.focus(); } }

// speech bubble above an avatar
function bubbleFor(key, getPos, text, cls){
  const old = CHAT.bubbles.get(key); if(old){ clearTimeout(old.timer); old.L.el.remove(); labels.splice(labels.indexOf(old.L), 1); }
  const L = addLabel('', 'bubble ' + cls, getPos, {max:90}); L.el.textContent = text.length > 80 ? text.slice(0, 78) + '…' : text;
  const timer = setTimeout(() => { L.el.remove(); const i = labels.indexOf(L); if(i >= 0) labels.splice(i, 1); CHAT.bubbles.delete(key); }, 7000);
  CHAT.bubbles.set(key, {L, timer});
}
const meBubblePos = () => me.g.position.clone().setY(me.g.position.y + 5.6);
const peerBubblePos = id => () => { const a = peers.get(id); return a ? a.p.g.position.clone().setY(a.p.g.position.y + 5.6) : null; };

// read messages aloud (text-to-speech), handy when your hands are on the controls
function speak(name, text){
  if(!CHAT.tts || !('speechSynthesis' in window)) return;
  try{ const u = new SpeechSynthesisUtterance(`${name}: ${text}`); const vs = speechSynthesis.getVoices();
    u.voice = vs.find(v => /^ms/i.test(v.lang)) || vs.find(v => /^id/i.test(v.lang)) || null; u.lang = u.voice?.lang || 'ms-MY'; u.rate = 1.05; speechSynthesis.speak(u); }catch(e){}
}

/* --- typed chat --- */
async function sendChat(text){
  text = String(text || '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, 300); if(!text || !CHAT.room || !session) return;
  if(performance.now() - CHAT.lastSend < 700){ toast('Perlahan sedikit: satu mesej setiap saat.', 'bad'); return; }
  CHAT.lastSend = performance.now();
  const data = {t:text, n:session.name, r:session.role, g:session.gender || ''};
  try{ await CHAT.room.emit('borak', data); }catch(e){ toast(e?.code === 'not_permitted' ? 'Room menolak mesej: dunia dikunci atau peranti ini disekat.' : 'Mesej tidak dihantar.', 'bad'); return; }
  chatLine({...data, me:true}); bubbleFor('me', meBubblePos, text, chatColor(data.r, data.g));
}
function onChat(m){
  if(m.isMe && m.sameTab) return; const d = m.data; if(!d || typeof d !== 'object' || typeof d.t !== 'string') return;
  const a = peers.get(m.peer), n = String(a?.name || d.n || 'Tetamu').slice(0, 28), r = a?.kind === 'owner' ? 'owner' : d.r === 'owner' ? 'owner' : 'guest', g = a ? (a.kind === 'female' ? 'female' : 'male') : d.g;
  const t = d.t.replace(/[\u0000-\u001f\u007f]/g, ' ').slice(0, 300);
  chatLine({n, r, g, t}); if(a) bubbleFor(m.peer, peerBubblePos(m.peer), t, chatColor(r, g)); speak(n, t); sfx.click();
}

/* --- push-to-talk voice --- */
function pickMime(){ const c = ['audio/webm;codecs=opus', 'audio/ogg;codecs=opus', 'audio/mp4', 'audio/webm']; return c.find(t => window.MediaRecorder && MediaRecorder.isTypeSupported(t)) || ''; }
// The artifact viewer may not allow the microphone inside its frame. Then the push-to-talk button turns into
// "Nota suara": the device's own recorder (or any audio file) supplies the clip, re-encoded small here.
function micBlocked(e){
  const blocked = !e || e.name === 'NotAllowedError' || e.name === 'SecurityError' || e.name === 'NotFoundError';
  if(!CHAT.micOff){ CHAT.micOff = true; renderChatBar();
    toast(blocked ? 'Mikrofon tidak dibenarkan dalam paparan ini. Butang suara kini "Nota suara": rakam dengan perakam peranti, kemudian ia dihantar ke room.' : 'Mikrofon tidak dapat dibuka. Guna "Nota suara".', 'bad', 7000);
    sysLine('Mikrofon disekat oleh paparan. Guna "Nota suara" (perakam peranti atau fail audio) atau chat taip.'); }
}
function pickVoiceFile(){ if(!CHAT.room || !session) return; $('#voiceFile').value = ''; $('#voiceFile').click(); }
async function sendVoiceFile(file){
  if(!file) return; if(!/^audio\//.test(file.type) && !/\.(m4a|mp3|wav|ogg|webm|aac|amr|3gp)$/i.test(file.name)){ toast('Pilih fail audio.', 'bad'); return; }
  toast('Menyediakan nota suara…', 'ok', 2500);
  try{
    const C = window.AudioContext || window.webkitAudioContext, ctx = AU.ctx || new C();
    if(ctx.state === 'suspended') await ctx.resume().catch(() => {});
    const buf = await ctx.decodeAudioData(await file.arrayBuffer()), secs = Math.min(buf.duration, MAX_VOICE_S);
    if(!window.MediaRecorder || !ctx.createMediaStreamDestination){ if(file.size < 90000) return sendVoice(file, secs); toast('Fail terlalu besar untuk pelayar ini (had ~90 KB).', 'bad'); return; }
    // squeeze it to 16 kbps mono by replaying it silently into a recorder (no microphone involved)
    const dest = ctx.createMediaStreamDestination(), src = ctx.createBufferSource(); src.buffer = buf; src.connect(dest);
    const mime = pickMime(), rec = new MediaRecorder(dest.stream, mime ? {mimeType:mime, audioBitsPerSecond:16000} : {audioBitsPerSecond:16000}), parts = [];
    rec.ondataavailable = e => { if(e.data.size) parts.push(e.data); };
    const done = new Promise(r => rec.onstop = r); rec.start(); src.start(0, 0, secs); setTalking(true, 'Menyediakan nota suara…');
    setTimeout(() => { try{ src.stop(); }catch(e){} if(rec.state !== 'inactive') rec.stop(); }, secs * 1000 + 150);
    await Promise.race([done, new Promise(r => setTimeout(r, secs * 1000 + 4000))]); setTalking(false);
    if(!parts.length){ if(file.size < 90000) return sendVoice(file, secs); toast('Nota suara gagal disediakan. Cuba rakaman yang lebih pendek.', 'bad'); return; } sendVoice(new Blob(parts, {type:rec.mimeType || mime}), secs);
    if(buf.duration > MAX_VOICE_S) toast(`Nota suara dipotong kepada ${MAX_VOICE_S} saat pertama.`);
  }catch(e){ setTalking(false); toast('Audio itu tidak dapat dibaca oleh pelayar ini.', 'bad'); }
}
async function startTalk(){
  if(CHAT.rec || !CHAT.room || !session) return;
  if(CHAT.micOff){ pickVoiceFile(); return; }
  if(!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder){ micBlocked(null); return; }
  CHAT.rec = {starting:true};
  let stream; try{ stream = await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true, noiseSuppression:true, channelCount:1}}); }
  catch(e){ CHAT.rec = null; micBlocked(e); return; }
  if(!CHAT.rec){ stream.getTracks().forEach(t => t.stop()); return; }      // released before the mic opened
  const mime = pickMime(), rec = new MediaRecorder(stream, mime ? {mimeType:mime, audioBitsPerSecond:16000} : {audioBitsPerSecond:16000}), chunks = [];
  CHAT.rec = {rec, stream, t0:performance.now(), mime:rec.mimeType || mime};
  rec.ondataavailable = e => { if(e.data.size) chunks.push(e.data); };
  rec.onstop = () => { stream.getTracks().forEach(t => t.stop()); const secs = (performance.now() - CHAT.rec.t0) / 1000, type = CHAT.rec.mime; CHAT.rec = null; setTalking(false);
    if(secs < .5){ toast('Tahan butang lebih lama untuk bercakap.'); return; } sendVoice(new Blob(chunks, {type}), Math.min(secs, MAX_VOICE_S)); };
  rec.start(); setTalking(true); sfx.beep();
  CHAT.rec.limit = setTimeout(() => stopTalk(), MAX_VOICE_S * 1000);
}
function stopTalk(){ const r = CHAT.rec; if(!r) return; if(r.starting){ CHAT.rec = null; return; } clearTimeout(r.limit); if(r.rec.state !== 'inactive') r.rec.stop(); }
function setTalking(on, label){ $('#pttBtn').classList.toggle('rec', on); $('#pttBtn').querySelector('span').textContent = on ? (label || 'Merakam… lepaskan untuk hantar') : CHAT.micOff ? 'Nota suara' : 'Tahan untuk bercakap'; net.talk = on ? 1 : 0; pushPresence(true); }
const toB64 = buf => { let s = ''; const u = new Uint8Array(buf); for(let i = 0; i < u.length; i += 8192) s += String.fromCharCode.apply(null, u.subarray(i, i + 8192)); return btoa(s); };
async function sendVoice(blob, secs){
  const data = toB64(await blob.arrayBuffer()), id = rid(6), n = Math.ceil(data.length / CHUNK);
  if(n > 60){ toast('Rakaman terlalu besar untuk dihantar.', 'bad'); return; }
  const url = URL.createObjectURL(blob); chatLine({n:session.name, r:session.role, g:session.gender, voice:{url, secs:secs.toFixed(0)}, me:true});
  for(let i = 0; i < n; i++){
    try{ await CHAT.room.emit('suara', {id, i, c:n, m:blob.type.slice(0, 40), s:+secs.toFixed(1), d:data.slice(i * CHUNK, (i + 1) * CHUNK)}); }
    catch(e){ toast(e?.code === 'not_permitted' ? 'Akaun kau tidak dibenarkan menghantar suara di sini.' : 'Suara tidak dihantar sepenuhnya.', 'bad'); return; }
    await new Promise(r => setTimeout(r, 160));
  }
}
function onVoice(m){
  if(m.isMe && m.sameTab) return; const d = m.data; if(!d || typeof d !== 'object' || typeof d.d !== 'string' || !(d.c > 0 && d.c <= 60) || !(d.i >= 0 && d.i < d.c)) return;
  const key = m.peer + ':' + String(d.id).slice(0, 12); let p = CHAT.parts.get(key);
  if(!p){ p = {got:0, c:d.c, arr:new Array(d.c), m:String(d.m || 'audio/webm'), s:+d.s || 0, t:performance.now()}; CHAT.parts.set(key, p);
    const a = peers.get(m.peer); if(a) bubbleFor(m.peer, peerBubblePos(m.peer), '🎙 bercakap…', a.kind); }
  if(p.arr[d.i] == null){ p.arr[d.i] = d.d; p.got++; }
  if(p.got === p.c){
    CHAT.parts.delete(key);
    try{ const bin = atob(p.arr.join('')), u = new Uint8Array(bin.length); for(let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
      if(!/^audio\//.test(p.m)) return; const url = URL.createObjectURL(new Blob([u], {type:p.m}));
      const a = peers.get(m.peer), n = String(a?.name || 'Tetamu').slice(0, 28), r = a?.kind === 'owner' ? 'owner' : 'guest', g = a?.kind === 'female' ? 'female' : 'male';
      chatLine({n, r, g, voice:{url, secs:Math.round(p.s)}}); playVoice(url);
    }catch(e){}
  }
  CHAT.parts.forEach((v, k) => { if(performance.now() - v.t > 30000) CHAT.parts.delete(k); });
}
function playVoice(url){ try{ const el = new Audio(url); el.volume = AU.vol ? clamp(AU.vol.master * 1.1, .2, 1) : 1; el.play().catch(() => toast('Tekan ▶ pada mesej suara untuk mendengar.')); }catch(e){} }

/* --- wiring --- */
$('#chatToggle').addEventListener('click', () => setChatOpen(!CHAT.open));
$('#chatForm').addEventListener('submit', e => { e.preventDefault(); const v = inEl.value; inEl.value = ''; sendChat(v); });
inEl.addEventListener('keydown', e => { if(e.key === 'Escape'){ inEl.blur(); setChatOpen(false); } e.stopPropagation(); });
$('#ttsBtn').addEventListener('click', () => { CHAT.tts = !CHAT.tts; LS.set('erythmind.tts', CHAT.tts); renderChatBar(); toast(CHAT.tts ? 'Mesej taip akan dibacakan dengan suara.' : 'Bacaan suara dimatikan.'); });
const ptt = $('#pttBtn');
ptt.addEventListener('pointerdown', e => { if(CHAT.micOff) return; e.preventDefault(); ptt.setPointerCapture(e.pointerId); startTalk(); });
ptt.addEventListener('click', () => { if(CHAT.micOff) pickVoiceFile(); });
$('#voiceFile').addEventListener('change', e => sendVoiceFile(e.target.files[0]));
['pointerup', 'pointercancel'].forEach(ev => ptt.addEventListener(ev, () => stopTalk()));
addEventListener('keydown', e => {
  if(!session || !$('#gate').hidden || typing() || e.repeat) return;
  if(e.code === 'KeyT' || (e.code === 'Enter' && $('#panel').hidden && $('#map').hidden)){ setChatOpen(true); e.preventDefault(); }
  if(e.code === 'KeyB' && $('#panel').hidden){ CHAT.micOff ? pickVoiceFile() : startTalk(); e.preventDefault(); }
});
addEventListener('keyup', e => { if(e.code === 'KeyB') stopTalk(); });
(async () => {
  const r = await use('room'); CHAT.room = r;
  if(r){ r.on('borak', onChat, () => {}); r.on('suara', onVoice, () => {}); }
  renderChatBar();
})();
anims.push(() => { const show = !!session && $('#gate').hidden; if(chatEl.hidden === show){ chatEl.hidden = !show; renderChatBar(); } });
renderChatBar();
