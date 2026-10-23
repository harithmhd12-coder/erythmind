'use strict';
/* ================= Serangan Dementor: raids from Marineford on the upper world =================
   Every day 200-300 dementors leave the Marine headquarters and try to reach the archipelago; once a week
   (Sunday 21:00 MYT) 1000 come and every guard goes to Ultimate Guard. The schedule is computed from the
   date, so everyone in the room sees the same raid. Security (cannons, missiles, Bavar-373, tanks, Bayang
   bots) destroys them; Haki Raja Agung dissolves every one in the sky at once. */
const RAID = {on:false, list:[], max:1000, history:LS.get('erythmind.raids', []), lastCheck:0};
const RAID_SRC = {meriam:'Meriam Pangkalan', rudal:'Rudal hipersonik', bavar:'Perisai Bavar-373', tank:'Tank Karrar & Zulfiqar', bot:'Bot Bayang', haki:'Haki Raja Agung'};
const raidMesh = new THREE.InstancedMesh(dementorGeo(), dementorMat(0x101218), RAID.max); raidMesh.frustumCulled = false; raidMesh.count = 0; scene.add(raidMesh);
const ambientWraiths = new THREE.InstancedMesh(dementorGeo(), dementorMat(0x14161c), 14); ambientWraiths.frustumCulled = false; scene.add(ambientWraiths);

/* --- schedule (Malaysia time) --- */
const MYT = 8 * 3600e3;
function raidOn(dayMs){                                     // dayMs: UTC ms of MYT midnight
  const d = new Date(dayMs + MYT), key = d.toISOString().slice(0, 10), dow = d.getUTCDay();
  let h = 0; for(const ch of key) h = (h * 131 + ch.charCodeAt(0)) >>> 0;
  if(dow === 0) return {key, at:dayMs + 21 * 3600e3, n:1000, mega:true};
  return {key, at:dayMs + (10 + h % 12) * 3600e3 + (h >> 4) % 60 * 60e3, n:200 + (h >> 8) % 101, mega:false};
}
const mytMidnight = ms => { const d = new Date(ms + MYT); return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - MYT; };
const raidDone = key => RAID.history.some(h => h.key === key);
function logRaid(rec){ RAID.history = [rec, ...RAID.history.filter(h => h.key !== rec.key)].slice(0, 20); LS.set('erythmind.raids', RAID.history); }
function checkSchedule(){
  if(!session || RAID.on) return; const now = Date.now(), today = mytMidnight(now), missed = [];
  for(let k = 6; k >= 0; k--){
    const R = raidOn(today - k * 86400e3); if(raidDone(R.key) || now < R.at) continue;
    if(now < R.at + 8 * 60e3 && k === 0){ startRaid(R.n, R.mega, R.key); return; }
    const by = {meriam:Math.round(R.n * .22), rudal:Math.round(R.n * .38), tank:Math.round(R.n * .08), bot:Math.round(R.n * .07)}; by.bavar = R.n - by.meriam - by.rudal - by.tank - by.bot;
    logRaid({key:R.key, at:R.at, n:R.n, mega:R.mega, killed:R.n, by, live:false}); missed.push(R);
  }
  if(missed.length && isOwner()){
    const t = missed.map(R => `${R.mega ? 'Mingguan' : 'Harian'} ${fmtDate(R.key)} ${fmtHM((R.at - mytMidnight(R.at)) / 60e3)}: ${R.n}`).join(' · ');
    toast(`Bavar-373 · semasa kau tiada, ${missed.length} serangan dementor dipatahkan (${t}). Tiada yang menembusi.`, 'ok', 9000);
  }
}

/* --- live raid --- */
function startRaid(n, mega, key, drill){
  RAID.on = true; Object.assign(RAID, {n, mega, key, drill:!!drill, spawned:0, killed:0, by:{}, t0:performance.now() / 1000, dur:mega ? 120 : 55, list:[], fireT:{}});
  Object.keys(RAID_SRC).forEach(k => RAID.by[k] = 0);
  const ban = $('#raid'); ban.hidden = false; ban.classList.toggle('mega', mega);
  toast(mega ? 'ULTIMATE GUARD · 1000 dementor keluar dari Marineford. Semua sistem keselamatan bertempur. Haki Raja Agung kau boleh menyapu mereka sekaligus.' : `AMARAN · ${n} dementor keluar dari Marineford menuju dunia atas. Keselamatan bertindak.`, 'bad', 7000);
  if(AU.ctx) for(let k = 0; k < (mega ? 6 : 3); k++) tone(420, {t:k * 1.1, a:.3, d:.8, v:.08, glide:720, type:'sawtooth', filt:1400});
}
function spawnRaider(){
  const a = Math.random() * 6.283, r = Math.random() * 40;
  const tx = OVERVIEW[0].x + (Math.random() - .5) * 420, tz = OVERVIEW[0].z + (Math.random() - .5) * 420;
  RAID.list.push({x:BASE.hq.x + Math.cos(a) * r, z:BASE.hq.z + Math.sin(a) * r, y:BASE.top + 20 + Math.random() * 20, tx, tz, alt:40 + Math.random() * 50, sp:24 + Math.random() * 9, ph:Math.random() * 6.283, alive:true, die:0});
  RAID.spawned++;
}
function kill(r, by, color){
  if(!r.alive) return; r.alive = false; r.die = 1; r.dieCol = color; RAID.killed++; RAID.by[by]++;
  if(raidVisible()) boom(r.x, r.y, r.z, color, by === 'bavar' ? .6 : 1);
}
const raidVisible = () => player.layer === 0 || player.layer === 1 || player.layer === 3;
const boomPool = []; for(let i = 0; i < 24; i++){ const m = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), new THREE.MeshBasicMaterial({color:0xff9a3a, transparent:true, opacity:0, blending:THREE.AdditiveBlending, depthWrite:false})); m.visible = false; scene.add(m); boomPool.push({m, t:9}); }
let boomI = 0, boomSnd = 0;
function boom(x, y, z, color = 0xff9a3a, s = 1){
  const b = boomPool[boomI++ % boomPool.length]; b.m.position.set(x, y, z); b.m.material.color.setHex(color); b.m.visible = true; b.t = 0; b.s = s;
  const near = Math.hypot(x - camera.position.x, z - camera.position.z); if(AU.ctx && near < 700 && performance.now() - boomSnd > 120){ boomSnd = performance.now(); noiseHit({d:.8, v:.25 * (1 - near / 700), f:220, brown:true}); }
}
function trail(a, b, color, life = .25){ bolt(a, b, color, 0, life); }
const nearestRaider = (x, z, maxD) => { let best = null, bd = maxD; for(const r of RAID.list){ if(!r.alive) continue; const d = Math.hypot(r.x - x, r.z - z); if(d < bd){ bd = d; best = r; } } return best; };
const every = (key, period) => { const t = performance.now() / 1000; if((RAID.fireT[key] || 0) > t) return false; RAID.fireT[key] = t + period * (.7 + Math.random() * .6); return true; };
function engage(dt){
  const k = RAID.mega ? 2 : 1, O = OVERVIEW[0], vis = raidVisible();
  for(const r of RAID.list){ if(!r.alive) continue;
    if(Math.hypot(r.x - BASE.x, r.z - BASE.z) < 430 && Math.random() < dt * .12 * k){ if(vis && Math.random() < .3) fireCannon(); kill(r, 'meriam', 0xffb060); continue; }
    if(Math.hypot(r.x - O.x, r.z - O.z) < 420){ if(vis) trail(new THREE.Vector3(r.x, r.y + 30, r.z), new THREE.Vector3(r.x, r.y, r.z), 0x9fc8ff, .2); kill(r, 'bavar', 0x9fc8ff); }
  }
  missiles.forEach((m, i) => { if(!every('m' + i, 1 / k)) return; const r = nearestRaider(m.position.x, m.position.z, 700); if(!r) return;
    if(vis) trail(m.position.clone(), new THREE.Vector3(r.x, r.y, r.z), 0xffd2a0, .35);
    RAID.list.forEach(o => { if(o.alive && Math.hypot(o.x - r.x, o.y - r.y, o.z - r.z) < 20) kill(o, 'rudal', 0xff7a2a); }); });
  tanks.forEach((tk, i) => { if(!every('t' + i, 1 / k)) return; const r = nearestRaider(tk.position.x, tk.position.z, 320); if(!r) return;
    if(vis) trail(tk.position.clone().add(new THREE.Vector3(0, 2, 0)), new THREE.Vector3(r.x, r.y, r.z), 0xffe08a, .15); kill(r, 'tank', 0xffd060); });
  bots.forEach((b, i) => { if(!every('b' + i, 1.2 / k)) return; const r = nearestRaider(b.x, b.z, 170); if(!r) return;
    if(vis) trail(b.g.position.clone(), new THREE.Vector3(r.x, r.y, r.z), 0xff3030, .12); kill(r, 'bot', 0xff4f45); });
}
AGUNG_HOOKS.push(() => { if(!RAID.on) return; let n = 0; RAID.list.forEach(r => { if(r.alive){ r.alive = false; r.die = 1.6; r.dieCol = 0x9a3aff; RAID.killed++; RAID.by.haki++; n++; } }); RAID.agung = true;
  if(n) toast(`HAKI RAJA AGUNG · ${n} dementor di udara tunduk dan lebur serta-merta.`, 'ok', 4000); });
function endRaid(){
  RAID.on = false; $('#raid').hidden = true; bavarShell.material.opacity = .02;
  const by = {...RAID.by}, top = Object.entries(by).sort((a, b) => b[1] - a[1]).filter(([, v]) => v).map(([k, v]) => `${RAID_SRC[k]} ${v}`).join(', ');
  if(!RAID.drill) logRaid({key:RAID.key, at:Date.now(), n:RAID.n, mega:RAID.mega, killed:RAID.killed, by, live:true});
  toast(`${RAID.drill ? 'Latihan tamat' : 'Serangan dipatahkan'} · ${RAID.killed}/${RAID.n} dementor dihapuskan, 0 menembusi. ${top}.`, 'ok', 8000);
  raidMesh.count = 0;
}
const _rm = new THREE.Matrix4(), _rq = new THREE.Quaternion(), _re = new THREE.Euler(), _rp = new THREE.Vector3(), _rs = new THREE.Vector3(1, 1, 1);
anims.push((t, dt) => {
  // a few wraiths always hover round the headquarters
  for(let i = 0; i < 14; i++){ const a = t * .05 + i / 14 * 6.283, r = 50 + (i % 3) * 18; _re.set(.15, a + Math.PI, 0); _rq.setFromEuler(_re); ambientWraiths.setMatrixAt(i, _rm.compose(_rp.set(BASE.hq.x + Math.cos(a) * r, BASE.top + 60 + Math.sin(t * .7 + i) * 6, BASE.hq.z + Math.sin(a) * r), _rq, _rs)); }
  ambientWraiths.instanceMatrix.needsUpdate = true; ambientWraiths.visible = player.layer === 0;
  if(performance.now() - RAID.lastCheck > 5000){ RAID.lastCheck = performance.now(); checkSchedule(); }
  boomPool.forEach(b => { if(b.t > 1) return; b.t += dt * 1.6; b.m.scale.setScalar((2 + b.t * 14) * b.s); b.m.material.opacity = Math.max(0, .9 * (1 - b.t)); if(b.t > 1) b.m.visible = false; });
  if(!RAID.on) return;
  const el = t - RAID.t0, want = Math.min(RAID.n, Math.floor(el / RAID.dur * RAID.n) + 1);
  while(RAID.spawned < want && RAID.list.length < RAID.max) spawnRaider();
  RAID.list.forEach(r => {
    if(!r.alive){ r.die -= dt * 1.4; return; }
    const dx = r.tx - r.x, dz = r.tz - r.z, d = Math.hypot(dx, dz) || 1, s = r.sp * dt;
    r.x += dx / d * s + Math.cos(t * 1.3 + r.ph) * 4 * dt; r.z += dz / d * s + Math.sin(t * 1.1 + r.ph) * 4 * dt; r.y = lerp(r.y, r.alt + Math.sin(t + r.ph) * 6, 1 - Math.exp(-dt * .8)); r.ry = Math.atan2(dx, dz);
  });
  engage(dt);
  RAID.list = RAID.list.filter(r => r.alive || r.die > 0);
  const vis = raidVisible(); let c = 0;
  if(vis) RAID.list.forEach(r => { const sc = r.alive ? 1 : Math.max(.01, r.die); _re.set(r.alive ? .25 : 1.2 - r.die * .6, r.ry, 0); _rq.setFromEuler(_re); _rs.setScalar(sc * 2.6); raidMesh.setMatrixAt(c++, _rm.compose(_rp.set(r.x, r.y, r.z), _rq, _rs)); });
  _rs.setScalar(1); raidMesh.count = c; raidMesh.instanceMatrix.needsUpdate = true;
  if(RAID.mega){ domeU.uAlert.value = Math.max(domeU.uAlert.value, .5 + Math.sin(t * 4) * .3); bavarShell.material.opacity = .12 + Math.sin(t * 3) * .05; } else bavarShell.material.opacity = .06;
  const left = RAID.n - RAID.killed, pct = RAID.killed / RAID.n * 100;
  if((t * 4 | 0) !== RAID.hud){ RAID.hud = t * 4 | 0;
    $('#raid').innerHTML = `<b>${RAID.mega ? 'ULTIMATE GUARD · SERANGAN MINGGUAN' : RAID.drill ? 'LATIHAN · SERANGAN DEMENTOR' : 'SERANGAN DEMENTOR · HARIAN'}</b><span>${RAID.spawned}/${RAID.n} keluar dari Marineford · ${RAID.killed} dihapuskan · ${left} lagi · 0 menembusi</span><small>${Object.entries(RAID.by).filter(([, v]) => v).map(([k, v]) => `${RAID_SRC[k]} ${v}`).join(' · ') || 'Menunggu dalam jarak tembakan…'}</small><i style="width:${pct.toFixed(1)}%"></i>`; }
  if(RAID.spawned >= RAID.n && !RAID.list.some(r => r.alive) && RAID.list.length === 0) endRaid();
  if(!RAID.mega && !vis) bavarShell.material.opacity = .02;
});
// drills from the Bavar-373 panel (owner); everyone in the room sees them
function raidPanelHtml(){
  const rows = RAID.history.slice(0, 7).map(h => `<li><b>${h.mega ? 'Mingguan' : 'Harian'} · ${esc(fmtDate(h.key))}</b> ${h.killed}/${h.n} dihapuskan${h.live ? '' : ' (semasa kau tiada)'} · 0 menembusi</li>`).join('');
  const next = [0, 1, 2].map(k => raidOn(mytMidnight(Date.now()) + k * 86400e3)).find(R => R.at > Date.now() && !raidDone(R.key));
  return `<h3>Serangan Dementor</h3><div class="note">Setiap hari 200–300 dementor cuba keluar dari Marineford. Setiap Ahad 21:00 (MYT), 1000 datang serentak dan semua keselamatan masuk Ultimate Guard.${next ? ` Seterusnya: ${next.mega ? 'mingguan' : 'harian'} ${esc(fmtDate(next.key))} ${fmtHM((next.at - mytMidnight(next.at)) / 60e3)}, ${next.n} dementor.` : ''}</div>
    ${rows ? `<ul class="facts">${rows}</ul>` : ''}${isOwner() ? '<div class="row"><button class="btn" id="drill1" type="button">Latihan harian (250)</button><button class="btn danger" id="drill2" type="button">Latihan Ultimate Guard (1000)</button></div>' : ''}`;
}
function wireRaidPanel(){
  const go = (n, mega) => { if(RAID.on) return toast('Serangan sedang berlangsung.', 'bad'); closePanel(); startRaid(n, mega, 'latihan', true); net.room?.emit('haki', {k:'serangan', n, mega}).catch(() => {}); };
  $('#drill1')?.addEventListener('click', () => go(250, false)); $('#drill2')?.addEventListener('click', () => go(1000, true));
}
(async () => { const r = await use('room'); if(r) r.on('haki', m => { if(m.isMe || !m.data || m.data.k !== 'serangan' || RAID.on) return; const n = clamp(+m.data.n || 0, 1, 1000); startRaid(n, !!m.data.mega, 'latihan', true); }, () => {}); })();
