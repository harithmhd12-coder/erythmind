'use strict';
/* ================= Erythmind app: full owner control =================
   - owner account (email + password) on the gate; the server only lets that account change the world
   - lock the world: every guest is shut out at once (server rules + the guest's own app)
   - kick someone out of the room, or block their device for good (server rules refuse them)
   - entry log: who opened the world, as what, how many times, last seen */
(() => {
  const E = window.ERY || {};
  const st = document.createElement('style');
  st.textContent = `.oacc{display:grid;gap:8px;width:100%;margin-top:4px;padding-top:12px;border-top:1px solid var(--line)}
    .oacc .row{justify-content:center} .oacc input{width:100%;box-sizing:border-box;padding:9px 11px;border-radius:9px;border:1px solid var(--line);background:rgba(7,10,18,.6);font-size:14.5px}
    .oacc small{color:var(--mute);font-size:12px} .gbanner{padding:10px 12px;border-radius:10px;border:1px solid var(--bad);color:#ffd1d1;font-size:13.5px}
    .klog{display:grid;grid-template-columns:1fr auto;gap:2px 10px;font-size:13px} .klog span{color:var(--mute);font:500 11.5px/1.4 var(--f-mono)}`;
  document.head.appendChild(st);
  if(!E.configured){ setTimeout(() => toast('Mod tempatan: app/config.js belum diisi dengan projek Supabase kau.', 'bad', 6000), 2500); return; }
  const sb = E.sb;
  let admin = {locked:false, banned:{}}, entries = [];
  const amOwner = () => E.owner;
  const blocked = () => !amOwner() && (admin.locked || !!admin.banned?.[E.uid]);
  const why = () => admin.banned?.[E.uid] ? 'Akses peranti ini telah disekat oleh pemilik.' : 'Pemilik telah mengunci dunia buat sementara. Cuba lagi kemudian.';

  /* --- gate: owner account + lock/ban notice --- */
  const baseGate = renderGate;
  renderGate = function(state){
    // keep what was typed in the login form if the gate redraws itself
    const keep = document.getElementById('oForm') && !document.getElementById('oForm').hidden ? {e:$('#oEmail').value, p:$('#oPass').value, f:document.activeElement?.id} : null;
    baseGate(state);
    if(keep) setTimeout(() => { const sh = $('#oShow'); if(!sh) return; sh.closest('.row').hidden = true; $('#oForm').hidden = false; $('#oEmail').value = keep.e; $('#oPass').value = keep.p; if(keep.f) document.getElementById(keep.f)?.focus(); });
    const card = document.getElementById('gcard'); if(!card || !HF.allDone) return;   // login appears once the world has loaded
    if(blocked()){ card.querySelector('.pad')?.remove(); card.querySelector('.dots')?.remove(); card.insertAdjacentHTML('beforeend', `<div class="gbanner">${esc(why())}</div>`); }
    const box = document.createElement('div'); box.className = 'oacc';
    if(E.email) box.innerHTML = `<small>${amOwner() ? 'Log masuk sebagai pemilik' : 'Akaun ini bukan akaun pemilik'}: ${esc(E.email)}</small><div class="row"><button class="btn ghost" type="button" id="oOut">Log keluar akaun</button></div>`;
    else box.innerHTML = `<div class="row"><button class="btn ghost" type="button" id="oShow">Pemilik? Log masuk akaun</button></div>
      <form id="oForm" hidden autocomplete="on"><div class="field"><input id="oEmail" type="email" placeholder="Emel pemilik" autocomplete="username" required></div>
      <div class="field" style="margin-top:6px"><input id="oPass" type="password" placeholder="Kata laluan akaun (bukan PIN dunia)" autocomplete="current-password" minlength="8" required></div>
      <div class="row" style="margin-top:8px"><button class="btn pri" type="submit">Log masuk</button><button class="btn" type="button" id="oReg">Daftar kali pertama</button></div>
      <div class="gmsg" id="oMsg" style="margin-top:8px" hidden></div>
      <div class="row" style="margin-top:4px"><button class="btn ghost" type="button" id="oResend" style="font-size:12px;padding:5px 9px">Hantar semula emel pengesahan</button><button class="btn ghost" type="button" id="oForgot" style="font-size:12px;padding:5px 9px">Lupa kata laluan</button></div>
      <small>Akaun ini membuktikan kau pemilik kepada pelayan. PIN dunia tetap rahsia kau dan tidak pernah dihantar.</small></form>`;
    card.appendChild(box);
    box.querySelector('#oOut')?.addEventListener('click', async () => { await sb.auth.signOut(); location.reload(); });
    box.querySelector('#oShow')?.addEventListener('click', e => { e.target.closest('.row').hidden = true; box.querySelector('#oForm').hidden = false; box.querySelector('#oEmail').focus(); });
    const cred = () => ({email:box.querySelector('#oEmail').value.trim().toLowerCase(), password:box.querySelector('#oPass').value});
    // messages stay on the card (toasts disappear too quickly to read while filling in a form)
    const say = (t, bad) => { const m = box.querySelector('#oMsg'); if(!m) return; m.hidden = false; m.className = 'gmsg' + (bad ? ' bad' : ''); m.textContent = t; };
    const back = location.origin + location.pathname;
    box.querySelector('#oForm')?.addEventListener('submit', async e => { e.preventDefault();
      const sub = e.submitter || box.querySelector('#oForm button[type=submit]'); sub.disabled = true; sub.textContent = 'Menyemak…'; say('Menyemak dengan pelayan…');
      const r = await sb.auth.signInWithPassword(cred());
      if(r.error){ sub.disabled = false; sub.textContent = 'Log masuk'; return say(authError(r.error), true); }
      say('Berjaya.'); await signedIn(r.data.session); });
    box.querySelector('#oReg')?.addEventListener('click', async () => { const c = cred();
      if(!/^\S+@\S+\.\S+$/.test(c.email) || c.password.length < 8) return say('Isi emel yang betul dan kata laluan sekurang-kurangnya 8 aksara.', true);
      say('Mendaftar…');
      const r = await sb.auth.signUp({...c, options:{emailRedirectTo:back}}); if(r.error) return say(authError(r.error), true);
      if(r.data.session) return signedIn(r.data.session);
      if(r.data.user && Array.isArray(r.data.user.identities) && !r.data.user.identities.length) return say('Emel ini sudah didaftar. Tekan Log masuk. Kalau lupa kata laluan, tekan "Lupa kata laluan".', true);
      say(`Emel pengesahan dihantar ke ${c.email}. Buka emel itu (semak juga folder Spam), tekan pautan pengesahan, kemudian kembali ke sini dan tekan Log masuk.`); });
    box.querySelector('#oResend')?.addEventListener('click', async () => { const c = cred(); if(!c.email) return say('Isi emel dahulu.', true);
      const r = await sb.auth.resend({type:'signup', email:c.email, options:{emailRedirectTo:back}}); say(r.error ? authError(r.error) : `Emel pengesahan dihantar semula ke ${c.email}. Semak juga folder Spam.`, !!r.error); });
    box.querySelector('#oForgot')?.addEventListener('click', async () => { const c = cred(); if(!c.email) return say('Isi emel dahulu.', true);
      const r = await sb.auth.resetPasswordForEmail(c.email, {redirectTo:back}); say(r.error ? authError(r.error) : `Pautan tukar kata laluan dihantar ke ${c.email}. Buka emel itu dan tekan pautannya; app akan minta kata laluan baharu.`, !!r.error); });
  };
  function authError(e){
    const c = e.code || '', m = e.message || '';
    if(c === 'invalid_credentials' || /Invalid login credentials/i.test(m)) return 'Emel atau kata laluan salah. Kalau belum pernah daftar, tekan "Daftar kali pertama" dahulu.';
    if(c === 'email_not_confirmed' || /not confirmed/i.test(m)) return 'Emel belum disahkan. Buka emel dari Supabase (semak folder Spam) dan tekan pautan pengesahan, atau tekan "Hantar semula emel pengesahan".';
    if(/rate limit/i.test(c + m)) return 'Pelayan sudah menghantar terlalu banyak emel buat masa ini. Tunggu kira-kira sejam, kemudian cuba lagi.';
    if(c === 'user_already_exists' || /already registered/i.test(m)) return 'Emel ini sudah didaftar. Tekan Log masuk.';
    if(c === 'weak_password' || /password/i.test(m) && /least|weak|short/i.test(m)) return 'Kata laluan terlalu lemah. Guna sekurang-kurangnya 8 aksara dengan huruf dan nombor.';
    if(/signups? not allowed|disabled/i.test(m)) return 'Pendaftaran emel ditutup dalam Supabase (Authentication → Sign In / Providers → Email).';
    if(/fetch|network/i.test(m)) return 'Tiada sambungan ke pelayan. Semak internet kau.';
    return 'Gagal: ' + m;
  }
  // a password-reset link signs the owner in with a recovery session: ask for the new password right away
  sb.auth.onAuthStateChange(async (ev, sess) => {
    if(ev !== 'PASSWORD_RECOVERY') return;
    setTimeout(async () => { const pw = prompt('Kata laluan akaun baharu (sekurang-kurangnya 8 aksara, bukan PIN dunia):');
      if(!pw || pw.length < 8) return toast('Kata laluan tidak ditukar.', 'bad');
      const r = await sb.auth.updateUser({password:pw}); if(r.error) return toast(authError(r.error), 'bad', 8000);
      toast('Kata laluan akaun ditukar.', 'ok'); await signedIn(sess); }, 800);
  });
  // after signing in there is no page reload (that would load every 3D model again): switch identity in place
  async function signedIn(sess){
    E.uid = sess.user.id; E.email = sess.user.email || null; sb.realtime.setAuth(sess.access_token);
    const o = await sb.rpc('is_owner'); E.owner = !o.error && o.data === true; artifactOwner = E.owner;
    await E.dbReload();
    toast(E.owner ? 'Log masuk sebagai pemilik. Sekarang masukkan PIN dunia.' : 'Log masuk berjaya, tetapi emel ini bukan emel pemilik dalam setup.sql.', E.owner ? 'ok' : 'bad', 7000);
    if(!session) renderGate(core ? 'unlock' : E.owner ? 'setup1' : 'inactive');
  }
  // the gate pad must refuse while locked or blocked
  const basePad = padKey;
  padKey = function(k){ if(blocked()){ toast(why(), 'bad'); return; } return basePad(k); };

  /* --- control doc --- */
  const adminRef = E.db.doc('admin/kawalan');
  adminRef.onSnapshot(s => {
    admin = Object.assign({locked:false, banned:{}}, s.exists ? s.data() : {});
    if(blocked()){ if(session) lock(why()); E.room?.channel?.unsubscribe(); }
    if(!session && typeof gateState !== 'undefined' && gateState !== 'loading') renderGate();
    if(ui.view === 'kawalan') openKawalan();
  });
  E.events.addEventListener('kick', e => { const d = e.detail || {}; if(d.target !== E.uid || amOwner()) return; if(session) lock('Kau telah dikeluarkan dari room oleh pemilik.'); });
  const saveAdmin = async n => { try{ await adminRef.set(n); admin = n; return true; }catch(err){ toast('Gagal (' + (err.code || err.message) + '). Pastikan kau log masuk sebagai pemilik.', 'bad'); return false; } };

  /* --- entry log --- */
  const baseStart = startSession;
  startSession = function(s){
    baseStart(s);
    (async () => { try{ const ref = E.db.doc('masuk/' + E.uid), prev = (await ref.get()).data() || {};
      await ref.set({name:s.name, role:s.role, first:prev.first || Date.now(), last:Date.now(), n:(prev.n || 0) + 1, dev:(navigator.userAgentData?.platform || navigator.platform || '').slice(0, 40)}); }catch(e){} })();
    if(s.role === 'owner' && !E.owner) setTimeout(() => toast('PIN pemilik betul, tetapi akaun pemilik belum log masuk di peranti ini. Perubahan dunia akan ditolak pelayan: log masuk akaun di skrin pintu dahulu.', 'bad', 9000), 1500);
    if(s.role === 'owner' && E.owner) E.db.collection('masuk').limit(500).onSnapshot(q => { entries = q.docs.map(d => ({uid:d.id, ...d.data()})).sort((a, b) => b.last - a.last); if(ui.view === 'kawalan') openKawalan(); });
  };

  /* --- the control panel --- */
  const btn = document.createElement('button'); btn.className = 'tbtn'; btn.id = 'bKawalan'; btn.type = 'button'; btn.hidden = true; btn.textContent = 'Kawalan Penuh';
  document.getElementById('bSettings').before(btn); btn.addEventListener('click', () => openKawalan());
  setInterval(() => { btn.hidden = !(session?.role === 'owner'); }, 1000);
  const nameOf = uid => entries.find(x => x.uid === uid)?.name || 'Peranti ' + uid.slice(0, 6);
  const ago = t => { const s = (Date.now() - t) / 1000; return s < 90 ? 'baru tadi' : s < 5400 ? Math.round(s / 60) + ' min lalu' : s < 129600 ? Math.round(s / 3600) + ' jam lalu' : fmtDate(t); };
  function openKawalan(){
    if(session?.role !== 'owner') return; ui.view = 'kawalan';
    const here = [...peers.values()].filter(a => a.by && a.by !== E.uid);
    const banned = Object.keys(admin.banned || {});
    const url = location.origin + location.pathname;
    openPanel(`${head('Pemilik sahaja', 'Kawalan Penuh', 'Kawal siapa boleh masuk dunia kau. Peraturan ini dikuatkuasakan oleh pelayan, bukan sekadar oleh app.')}
    <div class="pb">
      ${E.owner ? '' : '<div class="note warn">Akaun pemilik belum log masuk di peranti ini, jadi pelayan akan menolak semua perubahan. Kunci dunia, kemudian log masuk akaun di skrin pintu.</div>'}
      <h3>Pintu dunia</h3>
      <div class="ro"><div class="row" style="justify-content:space-between"><div><strong>${admin.locked ? 'Dikunci' : 'Terbuka kepada pemegang pas'}</strong><div class="note">${admin.locked ? 'Semua tetamu disekat serta-merta, termasuk yang sedang berada di dalam.' : 'Tetamu dengan pas yang sah boleh masuk.'}</div></div>
      <button class="btn ${admin.locked ? 'pri' : 'danger'}" id="kLock" type="button">${admin.locked ? 'Buka semula dunia' : 'Kunci dunia sekarang'}</button></div></div>
      <h3>Dalam room sekarang · ${here.length}</h3>
      <div class="list">${here.length ? here.map(a => `<div class="guest"><span class="arrow ${a.kind === 'female' ? 'female' : ''}"></span><div><strong>${esc(a.name || 'Pelawat')}</strong><span>Peranti ${esc(String(a.by).slice(0, 6))} · lapisan ${esc(layerName(a.l))}</span></div><button class="btn" type="button" data-kick="${esc(a.by)}">Keluarkan</button><button class="btn danger" type="button" data-ban="${esc(a.by)}" data-n="${esc(a.name || '')}">Sekat peranti</button></div>`).join('') : '<div class="empty">Tiada sesiapa lagi dalam room.</div>'}</div>
      <h3>Peranti disekat · ${banned.length}</h3>
      <div class="list">${banned.length ? banned.map(u => `<div class="guest"><div><strong>${esc(nameOf(u))}</strong><span>Disekat ${esc(ago(admin.banned[u]))}</span></div><button class="btn" type="button" data-unban="${esc(u)}">Nyahsekat</button></div>`).join('') : '<div class="note">Tiada peranti disekat.</div>'}</div>
      <h3>Log masuk dunia</h3>
      <div class="ro klog">${entries.length ? entries.slice(0, 60).map(x => `<div><strong>${esc(x.name || '?')}</strong> ${x.role === 'owner' ? '· pemilik' : ''}${admin.banned?.[x.uid] ? ' · disekat' : ''}<br><span>${esc(x.dev || '')} · peranti ${esc(x.uid.slice(0, 6))}</span></div><span>${x.n || 1}× · ${esc(ago(x.last))}${x.role !== 'owner' && !admin.banned?.[x.uid] ? `<br><button class="btn ghost" type="button" data-ban="${esc(x.uid)}" style="padding:3px 8px;font-size:11.5px">Sekat</button>` : ''}</span>`).join('') : '<div class="note">Belum ada rekod.</div>'}</div>
      <h3>Kongsi dunia</h3>
      <div class="ro"><div class="note">Pautan app kau. Sesiapa boleh membukanya, tetapi tanpa PIN pas mereka hanya nampak pintu Frontier Dome. Beritahu PIN tetamu secara bersemuka, bukan dalam mesej yang sama.</div>
      <div class="row"><code style="overflow-wrap:anywhere">${esc(url)}</code><button class="btn" type="button" id="kCopy">Salin pautan</button></div></div>
    </div>`, '#ff4f45');
    $('#kLock').addEventListener('click', async () => { const n = {...admin, locked:!admin.locked}; if(await saveAdmin(n)){ toast(n.locked ? 'Dunia dikunci. Semua tetamu disekat.' : 'Dunia dibuka semula.', 'ok'); if(n.locked) here.forEach(a => E.room?.kick(a.by)); openKawalan(); } });
    document.querySelectorAll('[data-kick]').forEach(b => b.addEventListener('click', () => { E.room?.kick(b.dataset.kick); toast('Dikeluarkan. Dia boleh masuk semula dengan PIN; guna "Sekat peranti" untuk menghalang terus.', 'ok', 6000); }));
    document.querySelectorAll('[data-ban]').forEach(b => b.addEventListener('click', async () => {
      if(b.dataset.armed !== '1'){ b.dataset.armed = '1'; b.textContent = 'Sahkan sekat'; return; }
      const n = {...admin, banned:{...(admin.banned || {}), [b.dataset.ban]:Date.now()}}; if(await saveAdmin(n)){ E.room?.kick(b.dataset.ban); toast('Peranti disekat. Pelayan kini menolak peranti itu.', 'ok'); openKawalan(); } }));
    document.querySelectorAll('[data-unban]').forEach(b => b.addEventListener('click', async () => { const bn = {...(admin.banned || {})}; delete bn[b.dataset.unban]; if(await saveAdmin({...admin, banned:bn})){ toast('Sekatan ditarik balik.', 'ok'); openKawalan(); } }));
    $('#kCopy').addEventListener('click', () => navigator.clipboard.writeText(url).then(() => toast('Pautan disalin.', 'ok'), () => toast('Papan klip ditolak.', 'bad')));
  }
  window.openKawalan = openKawalan;
})();
