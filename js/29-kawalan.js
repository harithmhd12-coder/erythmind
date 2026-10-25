'use strict';
/* ================= Kawalan GTA: the mouse steers the camera (pointer lock), on a computer =================
   Click the world once and the cursor is captured: moving the mouse turns the camera freely, W A S D walk where the
   camera looks (Shift runs), the body turns toward the way it walks, and the camera sits over the right shoulder.
   Hold the right button to aim: the camera closes in, the body faces the crosshair while it strafes, and every power
   goes where the crosshair points. The left button acts on what the crosshair is on (or punches in the arena).
   Esc lets go of the mouse; a panel, the gate or typing lets go of it too. Phones keep the joystick and the drag.
   Tetapan holds the switch and the mouse speed. */
const PL = {on:LS.get('erythmind.plock', true), sens:+LS.get('erythmind.plockSens', 1), locked:false, aim:false, fail:false, off:new THREE.Vector3(), fov:55, hintT:0, zoom:false};
const canLock = () => matchMedia('(pointer: fine)').matches && 'requestPointerLock' in Element.prototype;
const plFree = () => !!session && $('#panel').hidden && $('#gate').hidden && !typing() && !ride && REAL.view !== 'rts';     // the strategy view keeps its cursor

/* --- screen: crosshair and the hint --- */
const plStyle = document.createElement('style');
plStyle.textContent = `#plCross{position:fixed;left:50%;top:50%;z-index:7;width:6px;height:6px;margin:-3px 0 0 -3px;border-radius:50%;background:#fff;box-shadow:0 0 0 1.5px rgba(0,0,0,.55);pointer-events:none;transition:all .15s}
  #plCross.aim{width:26px;height:26px;margin:-13px 0 0 -13px;background:transparent;border:2px solid rgba(255,255,255,.9);box-shadow:0 0 0 1px rgba(0,0,0,.5),inset 0 0 0 1px rgba(0,0,0,.5)}
  #plCross.aim::after{content:'';position:absolute;left:50%;top:50%;width:4px;height:4px;margin:-2px 0 0 -2px;border-radius:50%;background:#ff4f45}
  #plHint{position:fixed;left:50%;bottom:86px;z-index:7;transform:translateX(-50%);padding:6px 12px;border-radius:999px;background:rgba(7,10,18,.72);border:1px solid var(--glass-line);color:#e9edf6;font:500 12.5px/1.3 var(--f-mono);pointer-events:none;white-space:nowrap}`;
document.head.appendChild(plStyle);
const plCross = document.createElement('div'); plCross.id = 'plCross'; plCross.hidden = true; document.body.appendChild(plCross);
const plHint = document.createElement('div'); plHint.id = 'plHint'; plHint.hidden = true; document.body.appendChild(plHint);

/* --- capture and release --- */
function plLock(){
  if(PL.locked || PL.fail) return;
  try{ const r = cv.requestPointerLock(); if(r && r.catch) r.catch(() => {}); }catch(e){ plFailed(); }
}
function plFailed(){ if(PL.fail) return; PL.fail = true; toast('Tetikus tidak boleh dikunci dalam paparan ini. Seret untuk memusing kamera, atau buka App untuk kawalan GTA.', 'bad', 6000); }
document.addEventListener('pointerlockchange', () => {
  PL.locked = document.pointerLockElement === cv; plCross.hidden = !PL.locked;
  if(!PL.locked){ plAim(false); keys.clear(); PL.hintT = 4; }
  else { plHint.hidden = true; PL.hintT = 0; PL.fail = false; }
});
// refused (a page inside a frame that does not allow it): give up on it once the browser has really said no
document.addEventListener('pointerlockerror', () => setTimeout(() => { if(!PL.locked) plFailed(); }, 400));

// the canvas click that starts a capture; while captured the world's own drag and click handlers stay out of it
addEventListener('pointerdown', e => {
  if(e.pointerType !== 'mouse' || e.target !== cv || !PL.on || !canLock() || PL.fail || !plFree()) return;
  lastActive = performance.now(); if(session) audioStart();
  if(PL.locked){ e.stopPropagation(); return; }
  if(e.button === 0){ plLock(); e.stopPropagation(); }
}, true);
// buttons while captured (mouse events: a second button pressed with the first held still arrives here)
addEventListener('mousedown', e => {
  if(!PL.locked || !plFree()) return;
  if(e.button === 2){ plAim(true); return; }
  if(e.button !== 0) return;
  if(typeof FIGHT !== 'undefined' && FIGHT.on){ fightPunch(); return; }
  pick(innerWidth / 2, innerHeight / 2);                    // what the crosshair is on
}, true);
addEventListener('mouseup', e => { if(e.button === 2 && PL.aim) plAim(false); }, true);
addEventListener('contextmenu', e => { if(PL.locked) e.preventDefault(); });
addEventListener('mousemove', e => {
  if(!PL.locked || !plFree()) return;
  const k = .0024 * PL.sens * (PL.aim ? .55 : 1), dx = clamp(e.movementX, -300, 300), dy = clamp(e.movementY, -300, 300);
  cam.yaw -= dx * k; cam.pitch = clamp(cam.pitch + dy * k * .85, -.18, 1.35);
});

/* --- aiming: closer, over the shoulder, the body faces the crosshair --- */
function plAim(on){
  if(PL.aim === on) return; PL.aim = on; plCross.classList.toggle('aim', on);
  if(on){ PL.back = cam.tdist; cam.tdist = Math.min(cam.tdist, 5.5); }
  else if(PL.back != null){ cam.tdist = PL.back; PL.back = null; }
}
const _updatePlayerPL = updatePlayer;
updatePlayer = function(dt){
  _updatePlayerPL(dt);
  if(PL.aim && !ride && !me.pose){ player.ry = cam.yaw + Math.PI; me.g.rotation.y = player.ry; }
};
// the shoulder: the camera slides to the right of the body (the body sits a little left of centre, as in GTA)
const _updateCameraPL = updateCamera;
updateCamera = function(dt, t){
  camera.position.sub(PL.off);                              // the follow camera eases from where it was, without the shift
  _updateCameraPL(dt, t);
  const want = PL.locked && plFree() && REAL.view !== 'fps' && !camFocus && cam.dist < 40 ? (PL.aim ? 1.1 : .75) * Math.min(1, 13 / Math.max(cam.dist, 4) * .9) : 0;
  PL.off.lerp(_lq.set(Math.cos(cam.yaw) * want, PL.aim ? .25 : 0, -Math.sin(cam.yaw) * want), 1 - Math.exp(-dt * 8));
  camera.position.add(PL.off);
  if(PL.aim && REAL.view !== 'fps') PL.zoom = true;         // aiming narrows the view; letting go widens it back
  if(PL.zoom){ const fov = PL.aim && REAL.view !== 'fps' ? 44 : 55; camera.fov = lerp(camera.fov, fov, Math.min(1, dt * 10));
    if(Math.abs(camera.fov - fov) < .2){ camera.fov = fov; if(fov === 55) PL.zoom = false; } camera.updateProjectionMatrix(); }
};

/* --- release when the world is not in front of you; the hint when it is --- */
anims.push((t, dt) => {
  if(PL.locked && !plFree()) document.exitPointerLock();
  const show = PL.on && !PL.locked && !PL.fail && canLock() && plFree() && !(typeof FIGHT !== 'undefined' && FIGHT.on && PL.hintT > 8);
  if(show){ PL.hintT += dt; plHint.textContent = 'Klik dunia untuk kawalan GTA · tetikus pusing kamera · Esc lepas'; }
  plHint.hidden = !show || PL.hintT > 12;
});

/* --- settings --- */
const _gfxSettingsHtmlPL = gfxSettingsHtml;
gfxSettingsHtml = function(){
  const base = _gfxSettingsHtmlPL(); if(!canLock()) return base;
  return base + `<h3>Kawalan GTA (komputer)</h3><div class="checks"><label for="plOn"><input type="checkbox" id="plOn" ${PL.on ? 'checked' : ''}> Klik dunia untuk mengunci tetikus: tetikus memusing kamera, klik kanan tahan untuk membidik, klik kiri bertindak pada sasaran tengah skrin. Esc melepaskan.</label></div>
    <div class="field"><label for="plSens">Kelajuan tetikus</label><select id="plSens">${[.5, .75, 1, 1.4, 2].map(v => `<option value="${v}" ${PL.sens === v ? 'selected' : ''}>${v === 1 ? 'Biasa' : v < 1 ? 'Perlahan ×' + v : 'Laju ×' + v}</option>`).join('')}</select></div>`;
};
document.addEventListener('change', e => {
  if(e.target.id === 'plOn'){ PL.on = e.target.checked; LS.set('erythmind.plock', PL.on); if(!PL.on && PL.locked) document.exitPointerLock(); }
  if(e.target.id === 'plSens'){ PL.sens = +e.target.value; LS.set('erythmind.plockSens', PL.sens); }
});
