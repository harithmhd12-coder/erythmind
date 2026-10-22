'use strict';
/* ================= labels ================= */
const labelRoot = $('#labels'); const labels = [];
function addLabel(html, cls, getPos, opts = {}){
  const el = document.createElement('div'); el.className = 'lbl ' + cls; el.innerHTML = html; if(opts.color) el.style.setProperty('--c', opts.color);
  labelRoot.appendChild(el); const L = {el, getPos, max:opts.max ?? 70, layer:opts.layer, tier:opts.tier || 'near'}; labels.push(L); return L;
}
ZONE_IDS.forEach(z => { const Z = ZONES[z]; const x = Z.at[0], zz = Z.at[1];
  const y = Z.layer === 1 ? LAB.y + 7 : Z.layer === 2 ? NVY + nivH(x, zz) + 9 : Z.layer === 3 ? PANG.y + 9 : Z.layer === 4 ? LIBH.y + 6 : Z.layer === 5 ? MAZE.y + 8 : surfaceH(x, zz) + 8; const v = new THREE.Vector3(x, y, zz);
  Z.label = addLabel(`${esc(Z.name)}<small>Satelit ${Z.keeper}</small>`, 'zone', () => v, {color:Z.color, max:110, layer:Z.layer}); });
const fixedLabel = (html, x, y, z, color, max = 80, layer = 0, tier = 'near') => { const v = new THREE.Vector3(x, y, z); return addLabel(html, tier === 'far' ? 'district' : 'zone', () => v, {color, max, layer, tier}); };
fixedLabel('Eryth Records<small>Bank data otak</small>', BEAN.x, LAB.y + 14, BEAN.z, '#ff4f45', 140, 1);
fixedLabel('Mesin Serba Guna<small>Masak · Main · Imbas</small>', 9, 5.6, 9, '#ff4f45', 50);
fixedLabel('Lif Awan<small>Ke Labophase</small>', LIFT.x, 5, LIFT.z, '#9fc8ff', 60);
fixedLabel('Panel Island A.C.<small>Kawalan iklim</small>', LAB.x + 15, LAB.y + 12, LAB.z + 9, '#8fd8ff', 60, 1);
fixedLabel('Lif Awan<small>Ke Fabriophase</small>', LAB.x, LAB.y + 4, LAB.z + 20, '#9fc8ff', 40, 1);
fixedLabel('Menara Jam Besar<small>Berbunyi ikut waktu solat</small>', CLOCK.x, 60, CLOCK.z, '#ffd27a', 160);
fixedLabel('Dewan Komuniti<small>Papan kenyataan · Buku pelawat</small>', DEWAN.x, 12, DEWAN.z - 12, '#ff4f45', 90);
fixedLabel('Gerbang Nivelham<small>Lif ke lapisan bawah</small>', NIV_GATE.x, gateH + 21, NIV_GATE.z, '#8fe0ff', 120);
fixedLabel('Aci Nivelham<small>Naik ke Gerbang Nivelham</small>', NV.arrive.x, NVY + nivH(NV.arrive.x, NV.arrive.z) + 16, NV.arrive.z, '#8fe0ff', 90, 2);
fixedLabel('Laluan Dahan 8<small>Naik ke Perpustakaan Hikmah</small>', NV.ramp.x0, NVY + 6, NV.ramp.z, '#e8c27a', 80, 2);
DISTRICTS.forEach(d => { const h = d.layer === 2 ? NVY + nivH(d.at[0], d.at[1]) : d.layer === 3 ? PANG.y + 40 : surfaceH(d.at[0], d.at[1]); fixedLabel(`${esc(d.name)}<small>${esc(d.sub)}</small>`, d.at[0], h + 30, d.at[1], '#e9edf6', 9000, d.layer, 'far'); });
satNPC.forEach(({s, p}) => addLabel('Satelit · ' + s.id, 'sat', () => p.g.position.clone().setY(p.g.position.y + 3.6), {max:26, layer:s.layer}));
let meLabel = addLabel('Eryth Sayf', 'name owner', () => me.g.position.clone().setY(me.g.position.y + 4.5), {max:9999});
const _p = new THREE.Vector3();
const labelGroup = l => l === 2 || l === 4 || l === 5 ? l : 0;   // surface, Labophase and the castle share a sky; Nivelham and the hall are closed
function updateLabels(){
  const W = innerWidth, H = innerHeight; const gateOn = !$('#gate').hidden; const far = cam.dist > 140;
  labels.forEach(L => {
    const pos = L.getPos();
    const wrongLayer = L.layer != null && labelGroup(L.layer) !== labelGroup(player.layer);
    if(!pos || gateOn || wrongLayer || (far ? L.tier !== 'far' && L !== meLabel : L.tier === 'far' && cam.dist < 60)){ L.el.style.display = 'none'; return; }
    const d = camera.position.distanceTo(pos);
    _p.copy(pos).project(camera);
    if(_p.z > 1 || d > L.max || Math.abs(_p.x) > 1.1 || Math.abs(_p.y) > 1.1){ L.el.style.display = 'none'; return; }
    L.el.style.display = ''; L.el.style.transform = `translate(${(_p.x * .5 + .5) * W}px, ${(-_p.y * .5 + .5) * H}px) translate(-50%,-100%)`;
    L.el.style.opacity = L.tier === 'far' ? 1 : clamp(1.4 - d / L.max, .25, 1);
  });
}

/* ================= risikan: informer bot reports ================= */
const RESTRICTED = [
  {name:'Lif Awan (Labophase)', layer:0, x:LIFT.x, z:LIFT.z, r:10},
  {name:'Gerbang Nivelham', layer:0, x:NIV_GATE.x, z:NIV_GATE.z, r:16},
  {name:'Eryth Records', layer:1, x:BEAN.x, z:BEAN.z + 6, r:12},
  {name:'Dewan Panjang Rahsia', layer:2, x:0, z:-975, r:14},
];
const intelSeen = new Set();
let intelUnread = LS.get('erythmind.intelUnread', 0);
function intelNote(ev){
  ev.t = ev.t || Date.now(); ev.by = ev.by || botAlarm(ev.x ?? player.x, ev.z ?? player.z);
  const key = ev.kind + ev.who + Math.floor(ev.t / 60000); if(intelSeen.has(key)) return; intelSeen.add(key);
  if(!ev.quiet){ toast(`${ev.by}: ${intelText(ev)}`, 'bad', 6000); sfx.beep(); intelUnread++; LS.set('erythmind.intelUnread', intelUnread); updateIntelChip(); }
  if(isOwner()){ const list = [...pub.risikan, {t:ev.t, kind:ev.kind, who:ev.who, where:ev.where, by:ev.by}].slice(-80); pub.risikan = list; store?.setRisikan(list).catch(() => {}); }
  if(ui.view === 'intel') openIntel();
}
const INTEL_KIND = {masuk:'masuk ke dunia', berlegar:'berlegar lama berhampiran kawasan larangan', ceroboh:'berada di lapisan yang tidak dibenarkan', laju:'bergerak terlalu laju (kemungkinan percubaan godam)', menyamar:'mendakwa sebagai pemilik', ditolak:'cuba masuk kawasan tanpa kebenaran', pin:'gagal memasukkan PIN'};
const intelText = ev => `${ev.who} ${INTEL_KIND[ev.kind] || ev.kind}${ev.where ? ' · ' + ev.where : ''}`;
function inspectPeer(a){
  const now = performance.now();
  const dt = (now - a.lastT) / 1000; if(dt > .25){ const v = Math.hypot(a.tx - a.lastX, a.tz - a.lastZ) / dt; if(v > 90 && a.tl === a.l && dt < 3) intelNote({kind:'laju', who:a.name, where:Math.round(v) + ' m/s', x:a.tx, z:a.tz}); a.lastX = a.tx; a.lastZ = a.tz; a.lastT = now; }
  if(a.kind === 'owner' && isOwner()) intelNote({kind:'menyamar', who:a.name, where:'pemilik sebenar sedang berada dalam dunia', x:a.tx, z:a.tz});
  if(a.kind !== 'owner'){
    const pass = Object.values(core?.guests || {}).find(g => g.name === a.name);
    if(a.tl === 1 && pass && !pass.lab) intelNote({kind:'ceroboh', who:a.name, where:'Labophase', x:0, z:0});
    if(a.tl === 2 && pass && !pass.niv) intelNote({kind:'ceroboh', who:a.name, where:'Nivelham', x:NIV_GATE.x, z:NIV_GATE.z});
    if(a.tl === 3 && pass && !pass.istana) intelNote({kind:'ceroboh', who:a.name, where:'Istana Pangaea', x:PANG.x, z:PANG.z});
    RESTRICTED.forEach(r => { const inside = a.tl === r.layer && Math.hypot(a.tx - r.x, a.tz - r.z) < r.r;
      if(inside){ a.linger[r.name] = a.linger[r.name] || now; if(now - a.linger[r.name] > 60000){ intelNote({kind:'berlegar', who:a.name, where:r.name, x:r.x, z:r.z}); a.linger[r.name] = now + 240000; } }
      else delete a.linger[r.name]; });
  }
}
let reportBuf = null;
async function guestReport(kind, where){
  if(session?.role !== 'guest' || !store?.report) return;
  if(!myUid){ const u = await use('user'); myUid = u ? await u.id() : null; } if(!myUid) return;
  reportBuf = reportBuf || {name:session.name, events:[]};
  reportBuf.name = session.name; reportBuf.events = [...reportBuf.events, {t:Date.now(), kind, where}].slice(-30);
  store.report(myUid, reportBuf).catch(() => {});
}
function onReports(list){
  const evs = [];
  list.forEach(r => (r.events || []).forEach(e => evs.push({...e, who:r.name || 'Tetamu', by:'BAYANG', src:'tetamu'})));
  const fresh = evs.filter(e => e.t > (LS.get('erythmind.intelSeenT', 0)));
  if(isOwner() && fresh.length && pub.reports.length){ fresh.slice(-2).forEach(e => toast(`Laporan bot: ${intelText(e)}`, 'bad', 6000)); intelUnread += fresh.length; updateIntelChip(); }
  pub.reports = evs;
  if(ui.view === 'intel') openIntel();
}
function updateIntelChip(){ const c = $('#chipIntel'); c.hidden = !isOwner(); c.querySelector('span').textContent = intelUnread ? `Risikan · ${intelUnread} baharu` : 'Risikan · senyap'; c.className = 'chip' + (intelUnread ? ' bad' : ''); }

/* ================= HUD helpers ================= */
function updateWho(){
  const n = peers.size;
  $('#who').textContent = session ? (session.role === 'owner' ? 'Pemilik' : 'Tetamu: ' + session.name) + (n ? ` · ${n} lagi dalam dunia` : '') : 'Terkunci';
}
function updateChips(){
  const tb = $('#chipBavar'); const threats = bavar.tamper + bavar.fails;
  tb.querySelector('span').textContent = threats ? `Bavar-373 · ${threats} amaran` : 'Bavar-373 · aktif';
  tb.className = 'chip' + (bavar.tamper ? ' bad' : threats ? ' warn' : '');
  $('#chipAC').querySelector('span').textContent = 'Island A.C. · ' + (weatherKey === 'auto' ? 'auto' : WEATHER[weatherKey].label.toLowerCase());
  $('#chipAC').className = 'chip' + (weatherKey === 'salji' ? ' warn' : '');
  updateIntelChip();
}
function updatePrayerChip(now = myNow()){
  const np = nextPrayer(now); const h = Math.floor(np.inMin / 60), m = Math.round(np.inMin % 60);
  $('#clockTime').textContent = fmtHM(now.mins) + (timeCtl.mode === 'manual' ? ' (simulasi)' : '');
  $('#clockNext').textContent = `${np.n} ${fmtHM(np.at)} · ${h ? h + 'j ' : ''}${m}m lagi`;
}
function updateRadioChip(){ const b = $('#bRadio'); b.classList.toggle('on', AU.on); b.firstChild.textContent = AU.on ? (MOOD_LABEL[AU.mood] || 'Bunyi aktif') + ' ' : 'Bunyi dimatikan '; }
function showAzanCard(k, n, at){
  const links = [YT.azan]; if(k === 'maghrib') links.push(YT.quran); if(k === 'isyak') links.push(YT.malam);
  const c = $('#azan'); c.hidden = false;
  c.innerHTML = `<div class="eyebrow">Menara Jam · ${esc(zoneInfo()[1])}</div><strong>Telah masuk waktu ${n} · ${fmtHM(at)}</strong>
    <div class="row">${links.map(l => `<a class="btn pri" href="${l.url}" target="_blank" rel="noopener">${esc(l.label)} ↗</a>`).join('')}<button class="btn ghost" type="button" id="azanX">Tutup</button></div>
    <div class="note">Muzik latar diperlahankan selama 6 minit.</div>`;
  $('#azanX').addEventListener('click', () => c.hidden = true);
  setTimeout(() => { c.hidden = true; }, 10 * 60e3);
}

/* ================= panels ================= */
const ui = {view:null, zone:null, sel:null, q:'', confirmDel:false, tab:'dapur', mag:LS.get('erythmind.mag', 1.5), peek:new Set()};
function openPanel(html, color){
  const p = $('#panel'); p.innerHTML = html; p.hidden = false; p.style.setProperty('--c', color || 'var(--holo)'); $('#act').hidden = true;
  p.querySelector('.x')?.addEventListener('click', closePanel); sfx.click();
}
function closePanel(){ const p = $('#panel'); p.hidden = true; p.innerHTML = ''; ui.view = null; stopArcade(); nearby = null; }
const head = (eyebrow, title, desc) => `<header class="ph"><div class="eyebrow">${eyebrow}</div><h2>${title}</h2>${desc ? `<p>${desc}</p>` : ''}<button class="x" type="button" aria-label="Tutup">×</button></header>`;
const layerName = l => ['Fabriophase', 'Labophase', 'Nivelham', 'Istana Pangaea', 'Dewan Baitul Hikmah', 'Labirin Memori'][l];

/* --- zone vault --- */
function openZone(z){
  if(!session) return;
  if(!canZone(z)){ denyAccess(`Pas kau tidak dibenarkan masuk ${ZONES[z].name}.`, ZONES[z].name); return; }
  ui.view = 'zone'; ui.zone = z; ui.sel = null; ui.q = ''; ui.confirmDel = false; ui.newExtra = null; ui.tag = null; ui.sort = null;
  const Z = ZONES[z];
  openPanel(`${head(`${layerName(Z.layer)} · Zon simpanan · Satelit ${Z.keeper}`, esc(Z.name), esc(Z.blurb))}
    <div class="pb">${z === 'fikir' && isOwner() ? '<div id="mmlib"></div>' : ''}${z === 'pemikir' ? `<div class="row"><label class="field" for="mag" style="flex:1"><span style="font:600 10.5px/1.3 var(--f-mono);letter-spacing:.1em;text-transform:uppercase;color:var(--mute)">Medan Pembesar Bubo · ${ui.mag.toFixed(1)}×</span><input id="mag" type="range" min="1" max="2.6" step=".1" value="${ui.mag}"></label></div>` : ''}<div class="zgrid">
      <div class="list"><div class="row"><div class="field" style="flex:1"><label for="zq">Cari</label><input id="zq" type="search" placeholder="Taip untuk tapis…"></div>${isOwner() ? '<button class="btn pri" id="znew" type="button" style="align-self:end">Baru</button>' : ''}</div><div class="list" id="zlist"></div></div>
      <div id="zform"></div>
    </div></div>`, Z.color);
  $('#zq').addEventListener('input', e => { ui.q = e.target.value.toLowerCase(); renderZoneList(); });
  $('#znew')?.addEventListener('click', () => { ui.sel = null; ui.newExtra = null; ui.confirmDel = false; renderZoneList(); renderZoneForm(); });
  $('#mag')?.addEventListener('input', e => { ui.mag = +e.target.value; LS.set('erythmind.mag', ui.mag); e.target.previousElementSibling.textContent = `Medan Pembesar Bubo · ${ui.mag.toFixed(1)}×`; renderZoneForm(); });
  renderZoneList(); renderZoneForm(); if(z === 'fikir') renderLibraryBanner();
}
function entryTitle(z, e){ if(e.bad) return 'Rekod rosak'; const d = e.data; return d.title || d.codename || d.question || (z === 'emosi' ? d.feeling : '') || 'Tanpa tajuk'; }
function sealedUntil(e){ return e.z === 'rahsia' && e.data?.reveal && Date.parse(e.data.reveal) > Date.now() ? e.data.reveal : null; }
function entryMeta(z, e){
  if(e.bad) return 'Bavar-373: gagal pengesahan, mungkin diubah suai';
  const d = e.data; const bits = [];
  if(z === 'emosi' && d.feeling) bits.push(d.feeling + (d.intensity ? ' · ' + d.intensity + '/10' : ''));
  if(d.status) bits.push(d.status); if(d.kind) bits.push(d.kind);
  if(sealedUntil(e)) bits.push('Peti Bubo terkunci sehingga ' + fmtDate(d.reveal));
  bits.push(d.date ? fmtDate(d.date) : d.deadline ? 'Sasaran ' + fmtDate(d.deadline) : fmtDate(e.u || e.t));
  return bits.join(' · ');
}
// Records are kept tidy: each zone groups its records into folders (status, category, year…), sorts them
// and filters by tag, so anything can be found in a couple of taps.
const GROUP_BY = {
  memori:e => e.data.date ? 'Tahun ' + String(e.data.date).slice(0, 4) : 'Tanpa tarikh',
  ilmu:e => firstTag(e) || 'Umum', falsafah:e => firstTag(e) || 'Umum', emosi:e => e.data.feeling || 'Lain-lain',
  rancang:e => e.data.status || 'Idea', strategi:e => e.data.status || 'Dirangka', armada:e => e.data.status || 'Dirangka', syura:e => e.data.status || 'Dibincang',
  buku:e => e.data.status || 'Selesai dibaca', buruk:e => e.data.status || 'Masih menghantui', pemikir:e => e.data.kind || 'Esei',
  rahsia:e => sealedUntil(e) ? 'Berkunci (Peti Bubo)' : 'Terbuka',
};
const firstTag = e => String(e.data?.tags || '').split(',').map(t => t.trim()).filter(Boolean)[0] || '';
const tagsOf = e => String(e.data?.tags || '').split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
const SORTS = {baru:['Terbaru dikemas kini', (a, b) => (b.u || b.t) - (a.u || a.t)], tarikh:['Tarikh peristiwa', (a, b) => String(b.data?.date || '').localeCompare(String(a.data?.date || '')) || (b.u || b.t) - (a.u || a.t)], az:['Tajuk A–Z', (a, b) => entryTitle(a.z, a).localeCompare(entryTitle(b.z, b), 'ms')]};
function groupOrder(z, label){ const f = ZONES[z].fields.find(f => f.t === 'select' && f.opts.includes(label)); return f ? f.opts.indexOf(label) : label.startsWith('Tahun') ? -parseInt(label.slice(6)) : 999; }
function renderZoneList(){
  const el = $('#zlist'); if(!el) return; const z = ui.zone;
  const all = entriesOf(z);
  if(!all.length){ el.innerHTML = `<div class="empty"><b>Belum ada apa-apa di sini.</b><br>${isOwner() ? 'Isi borang di sebelah dan tekan <b>Sulitkan & simpan</b>. Satelit ' + ZONES[z].keeper + ' akan menjaganya.' : 'Pemilik belum menyimpan apa-apa dalam zon ini.'}</div>`; return; }
  // controls: count, sort and tag chips (built once per panel)
  let ctl = $('#zctl'); if(!ctl){ ctl = document.createElement('div'); ctl.id = 'zctl'; el.parentNode.insertBefore(ctl, el); }
  ui.sort = ui.sort || LS.get('erythmind.sort.' + z, 'baru');
  const tagCount = {}; all.forEach(e => tagsOf(e).forEach(t => tagCount[t] = (tagCount[t] || 0) + 1));
  const tags = Object.entries(tagCount).sort((a, b) => b[1] - a[1]).slice(0, 14);
  let list = all.filter(e => !ui.q || (!sealedUntil(e) && JSON.stringify(e.data).toLowerCase().includes(ui.q)));
  if(ui.tag) list = list.filter(e => tagsOf(e).includes(ui.tag));
  ctl.innerHTML = `<div class="zctl-row"><span class="zcount">${list.length}${list.length !== all.length ? ' / ' + all.length : ''} rekod</span>
    <label class="zsort">Susun <select id="zsort">${Object.entries(SORTS).map(([k, [n]]) => `<option value="${k}" ${ui.sort === k ? 'selected' : ''}>${n}</option>`).join('')}</select></label></div>
    ${tags.length ? `<div class="ztags">${tags.map(([t, n]) => `<button type="button" class="ztag ${ui.tag === t ? 'on' : ''}" data-tag="${esc(t)}">#${esc(t)} <i>${n}</i></button>`).join('')}</div>` : ''}`;
  $('#zsort').addEventListener('change', e => { ui.sort = e.target.value; LS.set('erythmind.sort.' + z, ui.sort); renderZoneList(); });
  ctl.querySelectorAll('.ztag').forEach(b => b.addEventListener('click', () => { ui.tag = ui.tag === b.dataset.tag ? null : b.dataset.tag; renderZoneList(); }));
  if(z === 'fikir') return renderGroupedList(el, list);
  list = list.slice().sort(SORTS[ui.sort]?.[1] || SORTS.baru[1]);
  const gb = GROUP_BY[z] || (e => { const d = new Date(e.u || e.t); return d.toLocaleDateString('ms-MY', {month:'long', year:'numeric'}); });
  const groups = new Map(); list.forEach(e => { const g = e.bad ? 'Rekod rosak' : gb(e); if(!groups.has(g)) groups.set(g, []); groups.get(g).push(e); });
  const order = [...groups.keys()].sort((a, b) => GROUP_BY[z] ? (groupOrder(z, a) - groupOrder(z, b)) || a.localeCompare(b, 'ms') : 0);
  ui.fold = ui.fold || {};
  const item = e => `<button type="button" class="item ${e.bad ? 'bad' : ''} ${ui.sel === e.id ? 'sel' : ''}" data-id="${esc(e.id)}"><strong>${esc(sealedUntil(e) && !ui.peek.has(e.id) ? '🔒 ' + (e.data.codename || 'Pelan berkunci') : entryTitle(z, e))}</strong><span>${esc(entryMeta(z, e))}</span></button>`;
  el.innerHTML = order.map(g => { const k = z + ':' + g, shut = ui.fold[k]; return `<button type="button" class="zfold ${shut ? 'shut' : ''}" data-fold="${esc(k)}"><span>${esc(g)}</span><i>${groups.get(g).length}</i></button>${shut ? '' : groups.get(g).map(item).join('')}`; }).join('') || '<div class="empty">Tiada padanan.</div>';
  el.querySelectorAll('.zfold').forEach(b => b.addEventListener('click', () => { ui.fold[b.dataset.fold] = !ui.fold[b.dataset.fold]; renderZoneList(); }));
  el.querySelectorAll('.item').forEach(b => b.addEventListener('click', () => { ui.sel = b.dataset.id; ui.confirmDel = false; renderZoneList(); renderZoneForm(); }));
}
const srcLink = e => e.data?.src ? `<div class="note">Sumber: <a href="${esc(e.data.src)}" target="_blank" rel="noopener">${esc(e.data.srcName || e.data.src)} ↗</a></div>` : '';
function renderGroupedList(el, list){
  const cats = ZONES.fikir.fields[0].opts, catOf = e => e.data?.cat || 'Peribadi';
  list = list.slice().sort((a, b) => (cats.indexOf(catOf(a)) - cats.indexOf(catOf(b))) || ((a.data?.ord || 0) - (b.data?.ord || 0)) || entryTitle('fikir', a).localeCompare(entryTitle('fikir', b)));
  let html = '', cur = null;
  list.forEach(e => { const c = catOf(e); if(c !== cur){ cur = c; const n = list.filter(x => catOf(x) === c).length; html += `<div class="eyebrow" style="margin-top:8px">${esc(c)} · ${n}</div>`; }
    html += `<button type="button" class="item ${e.bad ? 'bad' : ''} ${ui.sel === e.id ? 'sel' : ''}" data-id="${esc(e.id)}"><strong>${esc(entryTitle('fikir', e))}</strong><span>${esc(e.bad ? 'Bavar-373: gagal pengesahan' : (e.data.body || '').slice(0, 70) + '…')}</span></button>`; });
  el.innerHTML = html || '<div class="empty">Tiada padanan.</div>';
  el.querySelectorAll('.item').forEach(b => b.addEventListener('click', () => { ui.sel = b.dataset.id; ui.confirmDel = false; renderZoneList(); renderZoneForm(); }));
}
/* --- Pustaka Model Mental (Farnam Street list, Malay summaries) imported into the encrypted lab --- */
let MM_LIB = null;
async function mentalLibrary(){ if(MM_LIB) return MM_LIB; try{ const r = await fetch('assets/model-mental.json'); if(r.ok) MM_LIB = await r.json(); }catch(e){} return MM_LIB; }
async function renderLibraryBanner(){
  const box = $('#mmlib'); if(!box || !isOwner()) return;
  const lib = await mentalLibrary(); if(!lib || !$('#mmlib')){ return; }
  const have = new Set([...plain.values()].filter(e => e.z === 'fikir').map(e => e.id));
  const missing = lib.models.filter(m => !have.has(m.id));
  box.innerHTML = `<div class="ro" style="gap:6px"><div class="eyebrow">Pustaka Model Mental · ${lib.models.length} model · ${lib.categories.length} kategori</div>
    <div class="note">${esc(lib.sourceName)}. Ringkasan dan contoh dalam Bahasa Melayu, disusun ikut kategori.</div>
    <div class="row">${missing.length ? `<button class="btn pri" id="mmgo" type="button">Sulitkan & masukkan ${missing.length} model ke Makmal</button>` : '<span class="note">Semua model sudah ada dalam Makmal.</span>'}<a class="btn ghost" href="${esc(lib.source)}" target="_blank" rel="noopener">Sumber ↗</a></div></div>`;
  $('#mmgo')?.addEventListener('click', async ev => {
    const b = ev.target; b.disabled = true; let n = 0;
    for(const m of missing){
      const data = {cat:m.cat, title:`${m.ms} (${m.en})`, body:m.body, example:m.example, tags:`${m.cat} · fs.blog`, ord:m.ord, src:lib.source, srcName:lib.sourceName};
      const ok = await saveEntry('fikir', m.id, data, true); if(!ok){ b.textContent = 'Terhenti. Cuba lagi.'; b.disabled = false; afterData(); return; }
      n++; if(n % 5 === 0 || n === missing.length){ b.textContent = `Menyulitkan… ${n}/${missing.length}`; renderZoneList(); }
    }
    afterData(); toast(`${n} model mental disulitkan dan disusun dalam Makmal Cara Fikir.`, 'ok', 5000); renderLibraryBanner();
  });
}
function renderZoneForm(){
  const el = $('#zform'); if(!el) return; const z = ui.zone, Z = ZONES[z]; const e = ui.sel ? plain.get(ui.sel) : null;
  if(e?.bad){ el.innerHTML = `<div class="ro"><div class="note warn">Bavar-373 menolak rekod ini: tag pengesahan AES-GCM tidak sepadan. Ia mungkin diubah suai di luar Erythmind.</div>${isOwner() ? '<button class="btn danger" id="zdel" type="button">Padam rekod rosak</button>' : ''}</div>`; $('#zdel')?.addEventListener('click', async () => { await deleteEntry(e.id); ui.sel = null; renderZoneList(); renderZoneForm(); }); return; }
  if(e && sealedUntil(e) && !ui.peek.has(e.id)){
    el.innerHTML = `<div class="ro"><div class="eyebrow">Peti Bubo</div><strong>${esc(e.data.codename || 'Pelan berkunci')}</strong><div class="note">Pelan ini disembunyikan sehingga ${esc(fmtDate(e.data.reveal))}. Kandungannya tetap tersulit; Peti Bubo hanya menyembunyikannya dari paparan.</div>${isOwner() ? '<button class="btn" id="zpeek" type="button">Buka awal untuk sesi ini</button>' : ''}</div>`;
    $('#zpeek')?.addEventListener('click', () => { ui.peek.add(e.id); renderZoneList(); renderZoneForm(); }); return;
  }
  const big = z === 'pemikir' ? `style="font-size:${(14.5 * ui.mag).toFixed(1)}px;line-height:1.5"` : '';
  if(!isOwner()){
    if(!e){ el.innerHTML = '<div class="empty">Pilih satu rekod untuk dibaca. Mod tetamu: baca sahaja.</div>'; return; }
    el.innerHTML = `<dl class="ro" ${big}>${Z.fields.filter(f => e.data[f.k]).map(f => `<dt>${esc(f.l)}</dt><dd>${esc(f.t === 'date' ? fmtDate(e.data[f.k]) : e.data[f.k])}</dd>`).join('')}${srcLink(e)}</dl>`; return;
  }
  const d = e?.data || {};
  const input = f => {
    const id = 'f_' + f.k, v = d[f.k] ?? '';
    if(f.t === 'area') return `<div class="field"><label for="${id}">${f.l}</label><textarea id="${id}" ${big} placeholder="${esc(f.ph || '')}">${esc(v)}</textarea></div>`;
    if(f.t === 'select') return `<div class="field"><label for="${id}">${f.l}</label><select id="${id}">${f.opts.map(n => `<option ${v === n ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select></div>`;
    if(f.t === 'range') return `<div class="field"><label for="${id}">${f.l}: <span id="${id}_v">${v || 5}</span></label><input id="${id}" type="range" min="1" max="10" value="${esc(v || 5)}"></div>`;
    return `<div class="field"><label for="${id}">${f.l}</label><input id="${id}" type="${f.t === 'date' ? 'date' : 'text'}" value="${esc(v)}" ${big} ${f.t === 'date' && !e && !f.noToday ? `data-today="1"` : ''}></div>`;
  };
  el.innerHTML = `<form id="zf" class="list" autocomplete="off">
    <div class="eyebrow">${e ? 'Sunting rekod' : 'Rekod baharu'}${z === 'buku' && (e?.data.slot ?? ui.newExtra?.slot) != null ? ' · ' + esc(bookPlace(+(e?.data.slot ?? ui.newExtra.slot))) : ''}</div>
    ${Z.fields.map(input).join('')}
    <div class="row"><button class="btn pri" type="submit">Sulitkan &amp; simpan</button>${e ? `<button class="btn danger" id="zdel" type="button">${ui.confirmDel ? 'Sahkan padam' : 'Padam'}</button>` : ''}</div>
    <div class="note">Disulitkan dengan kunci zon ${esc(Z.name)} sebelum meninggalkan peranti ini.</div>${e ? srcLink(e) : ''}
  </form>`;
  el.querySelectorAll('[data-today]').forEach(i => { i.value = new Date().toISOString().slice(0, 10); });
  el.querySelectorAll('input[type=range]').forEach(r => r.addEventListener('input', () => { $('#' + r.id + '_v').textContent = r.value; }));
  $('#zf').addEventListener('submit', async ev => {
    ev.preventDefault(); const data = {};
    const prevData = (ui.sel && plain.get(ui.sel)?.data) || ui.newExtra || {}; Object.keys(prevData).forEach(k => { if(!Z.fields.some(f => f.k === k)) data[k] = prevData[k]; });
    Z.fields.forEach(f => { const v = $('#f_' + f.k).value.trim(); if(v) data[f.k] = v; });
    const textual = Z.fields.filter(f => f.t === 'text' || f.t === 'area').some(f => data[f.k]);
    if(!textual && z !== 'emosi'){ toast('Isi sekurang-kurangnya satu medan teks.', 'bad'); return; }
    const id = await saveEntry(z, ui.sel, data); if(id){ ui.sel = id; renderZoneList(); renderZoneForm(); }
  });
  $('#zdel')?.addEventListener('click', async () => { if(!ui.confirmDel){ ui.confirmDel = true; renderZoneForm(); return; } await deleteEntry(ui.sel); ui.sel = null; ui.confirmDel = false; renderZoneList(); renderZoneForm(); });
}

/* --- Eryth Records --- */
function openRecords(){
  if(!session) return;
  const keep = ui.view === 'records' ? $('#rq')?.value || '' : '';
  ui.view = 'records';
  const c = counts(), eq = equilibrium(), zs = ZONE_IDS.filter(canZone), max = Math.max(1, ...zs.map(z => c[z]));
  const total = zs.reduce((a, z) => a + c[z], 0); const v = moodValence();
  openPanel(`${head('Labophase · Biji kopi retak', 'Eryth Records', 'Otak Eryth Sayf membesar setiap kali data, kefahaman dan bacaan kritikal baharu masuk. Di sini semua zon bertemu.')}
  <div class="pb">
    <div class="stats">
      <div class="stat"><span>Jumlah rekod</span><b>${total}</b><i>yang boleh kau baca</i></div>
      <div class="stat"><span>Saiz otak</span><b>${(1 + Math.log1p(plain.size) * .09).toFixed(2)}×</b><i>membesar dengan data</i></div>
      <div class="stat"><span>Keseimbangan</span><b>${eq.index == null ? '—' : eq.index}</b><i>${eq.hungry ? 'Zon paling lapar: ' + esc(ZONES[eq.hungry].name) : 'Simpan dalam beberapa zon dahulu'}</i></div>
      <div class="stat"><span>Mood 14 hari</span><b>${v == null ? '—' : (v > 0 ? '+' : '') + v.toFixed(1)}</b><i>skala −2 hingga +2</i></div>
    </div>
    <div class="list">${zs.map(z => `<div class="row zrow" data-zopen="${z}" role="button" tabindex="0" title="Buka ${esc(ZONES[z].name)}" style="--c:${ZONES[z].color}"><span style="width:170px;font-size:13.5px">${esc(ZONES[z].name)}</span><div class="bar" style="flex:1;min-width:80px"><i style="width:${c[z] / max * 100}%"></i></div><span style="font:600 12px var(--f-mono);width:32px;text-align:right">${c[z]}</span></div>`).join('')}</div>
    <h3>Tujuh satelit</h3>
    <div class="sats">${SATS.map(s => `<div class="sat ${syncedToday() ? 'synced' : ''}"><strong>${s.id}</strong><span>${esc(s.role)}</span></div>`).join('')}</div>
    <div class="row">${isOwner() ? `<button class="btn pri" id="sync" type="button">${syncedToday() ? 'Segerak semula' : 'Segerakkan satelit hari ini'}</button>` : ''}<span class="note">${core?.sync ? 'Penyegerakan terakhir: ' + new Date(core.sync).toLocaleString('ms-MY') : 'Belum pernah disegerakkan.'}</span></div>
    <h3>Cari dalam seluruh Eryth Records</h3><div class="note">Tekan mana-mana zon di atas untuk membuka foldernya. Hasil carian disusun ikut zon.</div>
    <div class="field"><label for="rq">Kata kunci</label><input id="rq" type="search" placeholder="cth. ayah, disiplin, 2025" value="${esc(keep)}"></div>
    <div class="list" id="rres"></div>
  </div>`, '#ff4f45');
  const doSearch = () => {
    const q = $('#rq').value.trim().toLowerCase(); const out = $('#rres'); if(!q){ out.innerHTML = ''; return; }
    const hits = [...plain.values()].filter(e => !e.bad && !sealedUntil(e) && JSON.stringify(e.data).toLowerCase().includes(q)).sort((a, b) => ZONE_IDS.indexOf(a.z) - ZONE_IDS.indexOf(b.z) || (b.u || b.t) - (a.u || a.t)).slice(0, 80);
    out.innerHTML = hits.length ? hits.map((e, i) => (i === 0 || hits[i - 1].z !== e.z ? `<div class="zfold static"><span>${esc(ZONES[e.z].name)}</span><i>${hits.filter(h => h.z === e.z).length}</i></div>` : '') + `<button type="button" class="item" data-id="${esc(e.id)}" data-z="${e.z}" style="--c:${ZONES[e.z].color}"><strong>${esc(entryTitle(e.z, e))}</strong><span>${esc(ZONES[e.z].name)} · ${esc(entryMeta(e.z, e))}</span></button>`).join('') : '<div class="empty">Tiada rekod sepadan.</div>';
    out.querySelectorAll('.item').forEach(b => b.addEventListener('click', () => { openZone(b.dataset.z); ui.sel = b.dataset.id; renderZoneList(); renderZoneForm(); }));
  };
  $('#rq').addEventListener('input', doSearch); doSearch();
  document.querySelectorAll('[data-zopen]').forEach(r => { const go = () => openZone(r.dataset.zopen); r.addEventListener('click', go); r.addEventListener('keydown', e => { if(e.key === 'Enter') go(); }); });
  $('#sync')?.addEventListener('click', syncSatellites);
}
const syncBeams = [];
async function syncSatellites(){
  if(!isOwner()) return;
  syncBeams.forEach(b => S.remove(b)); syncBeams.length = 0;
  satNPC.forEach(({p}, i) => {
    const a = p.g.position.clone().setY(p.g.position.y + 2.6), b = pods[i].world, top = new THREE.Vector3(BEAN.x, LAB.y + beanSize().y * 1.7, BEAN.z);
    const curve = new THREE.QuadraticBezierCurve3(a, new THREE.Vector3((a.x + b.x) / 2, Math.max(a.y, b.y) + 18, (a.z + b.z) / 2), b);
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(40).concat([top])), new THREE.LineBasicMaterial({color:0x9fc8ff, transparent:true, opacity:1, blending:THREE.AdditiveBlending}));
    line.userData.life = 4; S.add(line); syncBeams.push(line);
  });
  flash('rgba(111,243,255,.35)'); sfx.whoosh();
  const n = clone(core); n.sync = Date.now();
  try{ await store.setCore(n); core = n; toast('7 satelit disegerakkan dengan Eryth Records.', 'ok'); }catch(e){ toast('Gagal menyegerak (' + (e.code || e.message) + ').', 'bad'); }
  afterData(); if(ui.view === 'records') openRecords();
}
anims.push((t, dt) => { for(let i = syncBeams.length - 1; i >= 0; i--){ const b = syncBeams[i]; b.userData.life -= dt; b.material.opacity = Math.max(0, b.userData.life / 4); if(b.userData.life <= 0){ S.remove(b); syncBeams.splice(i, 1); } } });

/* --- Mesin Serba Guna --- */
let arcade = null;
function openMachine(){
  if(!session) return; ui.view = 'machine';
  openPanel(`${head('Plaza Hologram · Fabriophase', 'Mesin Serba Guna', 'Tekan satu butang: hidangan mewah dalam beberapa saat, arked mini, atau imbas semula memori lama.')}
  <div class="pb"><div class="tabs">${[['dapur','Dapur Kilat'],['arked','Arked Data'],['imbas','Imbas Memori']].map(([k, l]) => `<button type="button" class="tab ${ui.tab === k ? 'on' : ''}" data-t="${k}">${l}</button>`).join('')}</div><div id="mbody" class="list"></div></div>`, '#ff4f45');
  document.querySelectorAll('.tab').forEach(b => b.addEventListener('click', () => { ui.tab = b.dataset.t; stopArcade(); openMachine(); }));
  const body = $('#mbody');
  if(ui.tab === 'dapur'){
    body.innerHTML = `<div class="seg">${DISHES.map((d, i) => `<button type="button" class="card" data-i="${i}"><strong>${d[1]} ${esc(d[0])}</strong><span>${esc(d[2])}</span></button>`).join('')}</div><div id="serve"></div>`;
    body.querySelectorAll('.card').forEach(b => b.addEventListener('click', () => {
      const d = DISHES[+b.dataset.i]; body.querySelectorAll('.card').forEach(c => c.classList.toggle('sel', c === b));
      $('#serve').innerHTML = `<div class="dish"><div class="gmsg">Memasak ${esc(d[0])}…</div><div class="cook"><i id="cookbar"></i></div></div>`;
      noiseHit({d:1.1, v:.06, f:5000, type:'highpass'});
      requestAnimationFrame(() => requestAnimationFrame(() => { const cb = $('#cookbar'); if(cb) cb.style.width = '100%'; }));
      setTimeout(() => { const s = $('#serve'); if(s){ s.innerHTML = `<div class="dish"><div class="plate">${d[1]}</div><strong>${esc(d[0])}</strong><span class="note">Dihidangkan dalam 1.2 saat. ${esc(d[2])}</span></div>`; tone(1568, {d:.6, v:.06}); } }, 1200);
    }));
  } else if(ui.tab === 'arked'){
    body.innerHTML = `<canvas id="arcade" width="640" height="400"></canvas><div class="row"><button class="btn pri" id="astart" type="button">Mula · 20 saat</button><span class="note" id="ascore">Tangkap serpihan data yang bercahaya sebelum ia hilang. Rekod: ${LS.get('erythmind.hi', 0)}</span></div>`;
    $('#astart').addEventListener('click', startArcade); drawArcade();
  } else {
    if(!canZone('memori')){ body.innerHTML = '<div class="empty">Pas kau tidak termasuk Pantai Memori.</div>'; return; }
    const mem = [...plain.values()].filter(e => e.z === 'memori' && !e.bad);
    if(!mem.length){ body.innerHTML = '<div class="empty"><b>Belum ada memori untuk diimbas.</b><br>Simpan kenangan pertama di Pantai Memori, kemudian kembali ke sini.</div>'; return; }
    const today = new Date(); const md = (today.getMonth() + 1) + '-' + today.getDate();
    const onThisDay = mem.filter(e => { if(!e.data.date) return false; const d = new Date(e.data.date); return (d.getMonth() + 1) + '-' + d.getDate() === md; });
    const pool = onThisDay.length ? onThisDay : mem; const pickOne = () => pool[Math.floor(Math.random() * pool.length)];
    const show = e => { $('#mem').innerHTML = `<div class="eyebrow">${onThisDay.includes(e) ? 'Pada hari ini' : 'Kenangan rawak'}</div><h2 style="margin:0;font:600 18px var(--f-display)">${esc(e.data.title || 'Tanpa tajuk')}</h2><span class="note">${esc([e.data.date && fmtDate(e.data.date), e.data.place, e.data.people && 'bersama ' + e.data.people].filter(Boolean).join(' · '))}</span><dd style="margin:0;white-space:pre-wrap">${esc(e.data.body || '')}</dd>`; };
    body.innerHTML = '<div class="ro" id="mem"></div><div class="row"><button class="btn pri" id="again" type="button">Imbas lagi</button></div>';
    show(pickOne()); $('#again').addEventListener('click', () => show(pickOne()));
  }
}
function drawArcade(){
  const c = $('#arcade'); if(!c) return; const g = c.getContext('2d');
  g.fillStyle = '#050811'; g.fillRect(0, 0, c.width, c.height);
  g.strokeStyle = 'rgba(111,243,255,.08)'; for(let x = 0; x < c.width; x += 32){ g.beginPath(); g.moveTo(x, 0); g.lineTo(x, c.height); g.stroke(); } for(let y = 0; y < c.height; y += 32){ g.beginPath(); g.moveTo(0, y); g.lineTo(c.width, y); g.stroke(); }
  if(arcade){
    arcade.orbs.forEach(o => { const a = 1 - o.age / o.life; g.fillStyle = `rgba(${o.gold ? '255,210,122' : '111,243,255'},${a})`; g.shadowColor = o.gold ? '#ffd27a' : '#9fc8ff'; g.shadowBlur = 20; g.beginPath(); g.arc(o.x, o.y, o.r, 0, 6.283); g.fill(); });
    g.shadowBlur = 0; g.fillStyle = '#e9edf6'; g.font = '600 20px Cinzel, Georgia, serif'; g.fillText(`SKOR ${arcade.score}`, 16, 32); g.fillText(`${Math.max(0, arcade.left).toFixed(1)}s`, c.width - 90, 32);
  } else { g.fillStyle = '#8f99b4'; g.font = '600 18px Cinzel, Georgia, serif'; g.textAlign = 'center'; g.fillText('ARKED DATA', c.width / 2, c.height / 2); g.textAlign = 'left'; }
}
function startArcade(){
  const c = $('#arcade'); if(!c) return;
  arcade = {score:0, left:20, orbs:[], spawn:0, last:performance.now()};
  c.onpointerdown = e => { const r = c.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width * c.width, y = (e.clientY - r.top) / r.height * c.height;
    for(let i = arcade.orbs.length - 1; i >= 0; i--){ const o = arcade.orbs[i]; if(Math.hypot(o.x - x, o.y - y) < o.r + 8){ arcade.score += o.gold ? 5 : 1; arcade.orbs.splice(i, 1); tone(o.gold ? 1760 : 1320, {d:.08, v:.05}); break; } } };
  const step = now => {
    if(!arcade || !$('#arcade')) return; const dt = (now - arcade.last) / 1000; arcade.last = now; arcade.left -= dt; arcade.spawn -= dt;
    if(arcade.spawn <= 0){ arcade.spawn = .35 + Math.random() * .3; arcade.orbs.push({x:40 + Math.random() * (c.width - 80), y:60 + Math.random() * (c.height - 100), r:14 + Math.random() * 14, age:0, life:1.1 + Math.random(), gold:Math.random() < .12}); }
    arcade.orbs.forEach(o => o.age += dt); arcade.orbs = arcade.orbs.filter(o => o.age < o.life);
    drawArcade();
    if(arcade.left <= 0){ const s = arcade.score, hi = Math.max(s, LS.get('erythmind.hi', 0)); LS.set('erythmind.hi', hi); $('#ascore').textContent = `Skor ${s}. Rekod: ${hi}. Satu pusingan lagi?`; arcade = null; drawArcade(); return; }
    arcade.raf = requestAnimationFrame(step);
  };
  arcade.raf = requestAnimationFrame(step);
}
function stopArcade(){ if(arcade?.raf) cancelAnimationFrame(arcade.raf); arcade = null; }

/* --- Island A.C. + time --- */
function openAC(){
  ui.view = 'ac'; const now = myNow();
  openPanel(`${head('Labophase · Kawalan iklim', 'Island A.C.', 'Erythmind asalnya pulau musim sejuk. Sistem ini mengawal suhu, kelembapan dan cuaca. Langit, cahaya dan bunyi mengikut kitaran 24 jam sebenar.')}
  <div class="pb"><div class="seg">${Object.entries(WEATHER).map(([k, w]) => `<button type="button" class="card ${weatherKey === k ? 'sel' : ''}" data-w="${k}"><strong>${esc(w.label)}</strong><span>${esc(w.note)}</span></button>`).join('')}
    <button type="button" class="card ${weatherKey === 'auto' ? 'sel' : ''}" data-w="auto"><strong>Auto-Equilibrium</strong><span>Hujan bila emosi 14 hari terakhir dari Hutan Emosi cenderung negatif, cerah bila sebaliknya.</span></button></div>
    <label class="row" for="sc"><input type="checkbox" id="sc" ${seaClouds ? 'checked' : ''}> Awan laut tiruan di sekitar Labophase</label>
    <h3>Masa</h3>
    <div class="row"><label class="row" for="tlive"><input type="checkbox" id="tlive" ${timeCtl.mode === 'live' ? 'checked' : ''}> Masa sebenar (${esc(zoneInfo()[1])})</label></div>
    <div class="field"><label for="tsim">Simulasi masa: <span id="tsimv">${fmtHM(timeCtl.mode === 'live' ? now.mins : timeCtl.minutes)}</span></label><input id="tsim" type="range" min="0" max="1439" value="${Math.round(timeCtl.mode === 'live' ? now.mins : timeCtl.minutes)}"></div>
    <div class="note">Simulasi hanya untuk melihat siang dan malam. Menara Jam hanya berbunyi dalam masa sebenar. Tetapan cuaca disimpan untuk pelayar ini sahaja.</div></div>`, '#8fd8ff');
  document.querySelectorAll('[data-w]').forEach(b => b.addEventListener('click', () => { weatherKey = b.dataset.w; LS.set('erythmind.weather2', weatherKey); updateChips(); openAC(); toast('Island A.C.: ' + (weatherKey === 'auto' ? 'Auto-Equilibrium' : WEATHER[weatherKey].label), 'ok'); }));
  $('#sc').addEventListener('change', e => { seaClouds = e.target.checked; LS.set('erythmind.seaclouds', seaClouds); });
  $('#tlive').addEventListener('change', e => { timeCtl.mode = e.target.checked ? 'live' : 'manual'; timeCtl.minutes = +$('#tsim').value; updatePrayerChip(); });
  $('#tsim').addEventListener('input', e => { timeCtl.mode = 'manual'; timeCtl.minutes = +e.target.value; $('#tlive').checked = false; $('#tsimv').textContent = fmtHM(timeCtl.minutes); updatePrayerChip(); });
}

/* --- Radio & bunyi --- */
function openRadio(){
  ui.view = 'radio'; const now = myNow(); const p = prayerTimes(now.y, now.m, now.d); const np = nextPrayer(now);
  const slot = {subuh:[YT.quran], siang:[YT.siang], petang:[YT.siang], senja:[YT.azan, YT.quran], malam:[YT.malam]}[dayPhase(now)] || [YT.siang];
  openPanel(`${head('Menara Jam · Bunyi Erythmind', 'Radio & Waktu Solat', 'Bunyi latar dijana terus dalam pelayar dan berubah ikut waktu, cuaca dan tempat. Pautan YouTube kau dibuka di tab baharu kerana artifak tidak boleh menanam video YouTube.')}
  <div class="pb">
    <div class="row"><button class="btn ${AU.on ? '' : 'pri'}" id="snd" type="button">${AU.on ? 'Matikan bunyi' : 'Hidupkan bunyi'}</button><span class="note">Sedang dimainkan: ${esc(MOOD_LABEL[AU.mood] || '—')}</span></div>
    <div class="grid2">${[['master','Keseluruhan'],['music','Muzik latar'],['amb','Ambien (angin, laut, hujan)'],['sfx','Kesan bunyi']].map(([k, l]) => `<div class="field"><label for="v_${k}">${l}</label><input id="v_${k}" type="range" min="0" max="1" step=".05" value="${AU.vol[k]}"></div>`).join('')}</div>
    <h3>Cadangan sekarang · ${esc(dayPhase(now))}</h3>
    <div class="row">${slot.map(l => `<a class="btn pri" href="${l.url}" target="_blank" rel="noopener">${esc(l.label)} ↗</a>`).join('')}</div>
    <div class="seg">${Object.values(YT).map(l => `<a class="card" href="${l.url}" target="_blank" rel="noopener"><strong>${esc(l.label)} ↗</strong><span>${esc(l.url.replace('https://', ''))}</span></a>`).join('')}</div>
    <h3>Waktu solat hari ini</h3>
    <div class="field"><label for="zone">Zon JAKIM</label><select id="zone">${JAKIM.map(z => `<option value="${z[0]}" ${z[0] === zoneCode ? 'selected' : ''}>${z[0]} · ${esc(z[1])}</option>`).join('')}</select></div>
    <div class="stats">${[['subuh','Subuh'],['syuruk','Syuruk'],['zohor','Zohor'],['asar','Asar'],['maghrib','Maghrib'],['isyak','Isyak']].map(([k, n]) => `<div class="stat ${np.k === k ? 'next' : ''}"><span>${n}</span><b>${fmtHM(p[k])}</b></div>`).join('')}</div>
    <div class="row"><button class="btn" id="testBell" type="button">Uji loceng Menara Jam</button><a class="btn ghost" href="https://www.e-solat.gov.my/" target="_blank" rel="noopener">Semak di e-solat.gov.my ↗</a></div>
    <div class="note">Waktu dikira secara astronomi dengan parameter JAKIM (Subuh 20°, Isyak 18°, Asar Syafie, ihtiyati 2 minit). Anggaran ±2 minit berbanding takwim rasmi. Sesi ini tidak dapat mencapai pelayan e-solat secara terus.</div>
  </div>`, '#ffd27a');
  $('#snd').addEventListener('click', () => { setSound(!AU.on); openRadio(); });
  ['master','music','amb','sfx'].forEach(k => $('#v_' + k).addEventListener('input', e => setVol(k, +e.target.value)));
  $('#zone').addEventListener('change', e => { zoneCode = e.target.value; LS.set('erythmind.zone', zoneCode); updatePrayerChip(); openRadio(); });
  $('#testBell').addEventListener('click', () => { audioStart(); if(AU.ctx){ AU.ctx.resume(); sfx.bell(1); } bellLight.intensity = 3; setTimeout(() => bellLight.intensity = 0, 9000); });
}

/* --- Bavar-373 + Frontier Dome --- */
function openBavar(){
  ui.view = 'bavar';
  openPanel(`${head('AI keselamatan halimunan', 'Bavar-373', 'Penjaga anti-rampasan Erythmind. Inilah perlindungan yang benar-benar berjalan dalam dunia ini.')}
  <div class="pb">
    <div class="stats"><div class="stat"><span>Cubaan PIN gagal</span><b>${bavar.fails}</b><i>sesi ini</i></div><div class="stat"><span>Rekod ditolak</span><b>${bavar.tamper}</b><i>gagal pengesahan</i></div><div class="stat"><span>Auto-kunci</span><b>10 min</b><i>tanpa aktiviti</i></div></div>
    <ul class="facts">
      <li><b>Penyulitan AES-256-GCM.</b> Setiap rekod disulitkan dalam peranti kau sebelum disimpan. Pelayan hanya pegang teks rawak.</li>
      <li><b>Kunci daripada PIN.</b> PIN ditukar menjadi kunci melalui PBKDF2-SHA256 sebanyak ${ITER.toLocaleString('ms-MY')} pusingan. PIN tidak pernah disimpan atau dihantar ke mana-mana.</li>
      <li><b>Kunci berasingan setiap zon.</b> Tetamu hanya menerima kunci zon yang kau benarkan.</li>
      <li><b>Anti tukar ganti.</b> Setiap rekod diikat pada ID dan zonnya. Rekod yang disalin atau diubah di luar Erythmind akan ditolak.</li>
      <li><b>Kunci hanya dalam memori.</b> Bila dunia dikunci, ditutup atau tidak aktif 10 minit, semua kunci dibuang.</li>
      <li><b>Frontier Dome.</b> Selepas 5 cubaan PIN salah, pad dikunci 30 saat dan masa itu berganda setiap kali gagal lagi.</li>
      <li><b>Bot Bayang.</b> 10 bot risikan di Kota Awam dan Pusat Komuniti mengekori tetamu dan melaporkan tingkah laku mencurigakan kepada pemilik.</li>
    </ul>
    <div class="note warn">Hadnya: sesiapa yang memegang salinan data tersulit boleh cuba meneka PIN di luar talian, jadi guna 10 hingga 12 digit. Bot Bayang membaca kedudukan yang dihantar oleh pelayar tetamu sendiri, jadi laporannya petunjuk, bukan bukti.</div>
    ${typeof raidPanelHtml === 'function' ? raidPanelHtml() : ''}
  </div>`, '#9fc8ff');
  if(typeof wireRaidPanel === 'function') wireRaidPanel();
}
function openDome(){
  ui.view = 'dome';
  openPanel(`${head('Pelindung Labophase & Nivelham', 'Frontier Dome', 'Kubah laser di sekeliling Labophase, dan gerbang ais di Banjaran Nivelham. Sesiapa tanpa kebenaran ditolak keluar dengan amaran merah.')}
  <div class="pb"><ul class="facts"><li><b>Pemilik</b> sentiasa boleh melepasi kubah dan gerbang.</li><li><b>Tetamu</b> hanya boleh naik Lif Awan atau turun Aci Nivelham jika pas mereka membenarkannya.</li><li><b>Tanpa PIN</b>, tiada siapa boleh masuk ke dunia langsung.</li></ul>
  <div class="note">Status kau: Labophase ${canLab() ? 'dibenarkan' : 'ditolak'} · Nivelham ${canNiv() ? 'dibenarkan' : 'ditolak'}.</div></div>`, '#ff4f45');
}

/* --- Risikan (owner) --- */
function openIntel(){
  if(!isOwner()) return; ui.view = 'intel'; intelUnread = 0; LS.set('erythmind.intelUnread', 0); LS.set('erythmind.intelSeenT', Date.now()); updateIntelChip();
  const all = [...pub.risikan.map(e => ({...e, src:'bot'})), ...pub.reports].sort((a, b) => b.t - a.t).slice(0, 80);
  openPanel(`${head('Bot Bayang · Menara Isyarat Kota Awam', 'Laporan Risikan', 'Apa yang dilihat oleh 10 bot risikan dan apa yang dilaporkan oleh pelayar tetamu sendiri bila mereka ditolak masuk.')}
  <div class="pb">
    <div class="stats"><div class="stat"><span>Tetamu dalam dunia</span><b>${[...peers.values()].filter(a => a.kind !== 'owner').length}</b></div><div class="stat"><span>Laporan</span><b>${all.length}</b></div><div class="stat"><span>Bot aktif</span><b>${bots.length}</b></div></div>
    <div class="list">${all.length ? all.map(e => `<div class="item"><strong>${esc(intelText(e))}</strong><span>${esc(new Date(e.t).toLocaleString('ms-MY'))} · ${esc(e.by || 'BAYANG')} · ${e.src === 'tetamu' ? 'dilaporkan dari pelayar tetamu' : 'diperhati bot'}</span></div>`).join('') : '<div class="empty"><b>Senyap.</b><br>Bot Bayang belum melihat apa-apa yang mencurigakan.</div>'}</div>
    ${all.length ? '<div class="row"><button class="btn danger" id="intelClear" type="button">Kosongkan log bot</button></div>' : ''}
    <div class="note">Laporan daripada pelayar tetamu disimpan dalam projek Supabase kau dan hanya pemilik boleh membacanya.</div>
  </div>`, '#ffc65c');
  $('#intelClear')?.addEventListener('click', async e => { if(e.target.dataset.armed !== '1'){ e.target.dataset.armed = '1'; e.target.textContent = 'Sahkan kosongkan'; return; } pub.risikan = []; await store.setRisikan([]).catch(() => {}); openIntel(); });
}

/* --- Dewan Komuniti (public) --- */
function openKomuniti(){
  ui.view = 'komuniti';
  const posts = pub.board.slice().reverse(); const book = pub.guestbook.slice().sort((a, b) => (b.t || 0) - (a.t || 0));
  openPanel(`${head('Pusat Komuniti Awam', 'Dewan Komuniti', 'Ruang awam Erythmind. Papan kenyataan dan buku pelawat di sini tidak disulitkan: sesiapa yang ada akses ke pautan boleh membacanya.')}
  <div class="pb">
    <h3>Papan kenyataan</h3>
    ${isOwner() ? '<form id="bf" class="list"><div class="field"><label for="btext">Kenyataan baharu</label><textarea id="btext" maxlength="400" style="min-height:70px"></textarea></div><div class="row"><button class="btn pri" type="submit">Tampal</button></div></form>' : ''}
    <div class="list">${posts.length ? posts.map((p, i) => `<div class="item"><strong style="white-space:normal">${esc(p.text)}</strong><span>${esc(fmtDate(p.t))}${isOwner() ? ` · <button class="btn ghost" type="button" data-rmp="${posts.length - 1 - i}" style="padding:2px 8px">Turunkan</button>` : ''}</span></div>`).join('') : '<div class="empty">Belum ada kenyataan.</div>'}</div>
    <h3>Buku pelawat</h3>
    ${session?.role === 'guest' ? '<form id="gbf" class="list"><div class="field"><label for="gbmsg">Tinggalkan pesanan</label><input id="gbmsg" maxlength="200"></div><div class="row"><button class="btn pri" type="submit">Tandatangan</button></div></form>' : ''}
    <div class="list">${book.length ? book.map(b => `<div class="item"><strong style="white-space:normal">${esc(b.msg)}</strong><span>${esc(b.name || 'Pelawat')} · ${esc(fmtDate(b.t))}</span></div>`).join('') : '<div class="empty">Belum ada pelawat menandatangani.</div>'}</div>
  </div>`, '#ff4f45');
  $('#bf')?.addEventListener('submit', async e => { e.preventDefault(); const text = $('#btext').value.trim(); if(!text) return; const posts2 = [...pub.board, {t:Date.now(), text}].slice(-30); try{ await store.setBoard(posts2); toast('Kenyataan ditampal di Dewan Komuniti.', 'ok'); }catch(err){ toast('Gagal menampal (' + (err.code || err.message) + ').', 'bad'); } });
  document.querySelectorAll('[data-rmp]').forEach(b => b.addEventListener('click', async () => { const posts2 = pub.board.filter((_, i) => i !== +b.dataset.rmp); await store.setBoard(posts2).catch(() => {}); }));
  $('#gbf')?.addEventListener('submit', async e => { e.preventDefault(); const msg = $('#gbmsg').value.trim(); if(!msg) return;
    if(!myUid){ const u = await use('user'); myUid = u ? await u.id() : 'local'; }
    try{ await store.sign(myUid || 'local', {name:session.name, msg, t:Date.now()}); toast('Terima kasih. Pesanan kau tercatat.', 'ok'); }catch(err){ toast('Buku pelawat ditolak: dunia dikunci atau peranti ini disekat (' + (err.code || err.message) + ').', 'bad'); } });
}

/* --- guest passes --- */
function openGuests(){
  if(!isOwner()) return; ui.view = 'guests';
  const gs = Object.entries(core.guests || {});
  openPanel(`${head('Kawalan akses', 'Pas Tetamu', 'Benarkan orang tertentu masuk dengan PIN mereka sendiri. Lelaki muncul dengan anak panah hijau di atas kepala, perempuan dengan anak panah merah jambu.')}
  <div class="pb">
    <div class="list">${gs.length ? gs.map(([id, g]) => `<div class="guest"><span class="arrow ${g.gender === 'female' ? 'female' : ''}"></span><div><strong>${esc(g.name)}</strong><span>${Object.keys(g.keys || {}).map(z => ZONES[z]?.name).filter(Boolean).join(', ') || 'Tiada zon'}${g.lab ? ' · Labophase' : ''}${g.niv ? ' · Nivelham' : ''}${g.istana ? ' · Istana Pangaea' : ''}${g.laut ? ' · Pangkalan Laut' : ''}${g.exp ? (g.exp < Date.now() ? ' · TAMAT TEMPOH' : ' · sah hingga ' + fmtDate(g.exp)) : ''}</span><span class="gpow">Haki: Pemerhatian, Persenjataan${EXTRA_POWERS.map(p => `<label><input type="checkbox" data-gp="${esc(id)}" value="${p}" ${(g.powers || []).includes(p) ? 'checked' : ''}> ${esc(POWERS.find(P => P.id === p).name)}</label>`).join('')}</span></div><button class="btn danger" type="button" data-rm="${esc(id)}">Batalkan pas</button></div>`).join('') : '<div class="empty"><b>Belum ada tetamu.</b><br>Cipta pas pertama di bawah. Kongsikan pautan app ini dengan mereka (Kawalan Penuh → Salin pautan) dan beritahu PIN mereka secara bersemuka.</div>'}</div>
    <form id="gf" class="list" autocomplete="off">
      <h3>Pas baharu</h3>
      <div class="grid2"><div class="field"><label for="gname">Nama tetamu</label><input id="gname" maxlength="28" required></div>
      <div class="field"><label for="ggender">Jantina</label><select id="ggender"><option value="male">Lelaki · anak panah hijau</option><option value="female">Perempuan · anak panah merah jambu</option></select></div></div>
      <div class="field"><label for="gexp">Tempoh pas</label><select id="gexp"><option value="0">Tiada had</option><option value="1">1 hari</option><option value="7">7 hari</option><option value="30">30 hari</option><option value="90">90 hari</option></select></div>
      <div class="field"><label for="gpin">PIN tetamu (6–12 digit, mesti lain daripada PIN kau)</label><input id="gpin" inputmode="numeric" pattern="[0-9]{6,12}" required></div>
      <div class="field"><label>Zon yang dibenarkan</label><div class="checks">${ZONE_IDS.map(z => `<label for="gz_${z}"><input type="checkbox" id="gz_${z}" value="${z}" ${z === 'ilmu' ? 'checked' : ''}> ${esc(ZONES[z].name)}</label>`).join('')}</div></div>
      <div class="field"><label>Lapisan</label><div class="checks"><label for="glab"><input type="checkbox" id="glab"> Boleh masuk Labophase</label><label for="gniv"><input type="checkbox" id="gniv"> Boleh turun ke Nivelham</label><label for="gist"><input type="checkbox" id="gist"> Boleh naik ke Istana Pangaea (rakan kongsi terpilih)</label><label for="glaut"><input type="checkbox" id="glaut"> Boleh masuk Pangkalan Laut</label></div></div>
      <div class="field"><label>Kuasa Haki</label><div class="note">Semua pelawat mendapat Haki Pemerhatian dan Haki Persenjataan. Tanda kuasa tambahan jika mahu.</div><div class="checks">${EXTRA_POWERS.map(p => `<label for="gp_${p}"><input type="checkbox" id="gp_${p}" value="${p}"> ${esc(POWERS.find(P => P.id === p).name)}</label>`).join('')}</div></div>
      <div class="row"><button class="btn pri" type="submit">Cipta pas</button></div>
      <div class="note">Mencipta pas mengambil beberapa saat kerana kunci dijana dengan selamat.</div>
    </form>
  </div>`, '#3ddc84');
  document.querySelectorAll('[data-gp]').forEach(c => c.addEventListener('change', async () => {
    const gid = c.dataset.gp, n = clone(core), g = n.guests?.[gid]; if(!g) return;
    g.powers = [...document.querySelectorAll(`[data-gp="${CSS.escape(gid)}"]`)].filter(x => x.checked).map(x => x.value);
    try{ await store.setCore(n); core = n; toast(`Kuasa ${g.name} dikemas kini. Berkuat kuasa bila dia masuk semula.`, 'ok'); }catch(e){ c.checked = !c.checked; toast('Gagal (' + (e.code || e.message) + ').', 'bad'); }
  }));
  document.querySelectorAll('[data-rm]').forEach(b => b.addEventListener('click', async () => {
    if(b.dataset.armed !== '1'){ b.dataset.armed = '1'; b.textContent = 'Sahkan batal'; return; }
    const n = clone(core); delete n.guests[b.dataset.rm];
    try{ await store.setCore(n); core = n; toast('Pas tetamu dibatalkan.', 'ok'); openGuests(); }catch(e){ toast('Gagal (' + (e.code || e.message) + ').', 'bad'); }
  }));
  $('#gf').addEventListener('submit', async ev => {
    ev.preventDefault();
    const name = $('#gname').value.trim(), gender = $('#ggender').value, pin = $('#gpin').value.trim();
    const zones = ZONE_IDS.filter(z => $('#gz_' + z).checked);
    if(!/^[0-9]{6,12}$/.test(pin)) return toast('PIN tetamu mesti 6 hingga 12 digit.', 'bad');
    if(!zones.length) return toast('Pilih sekurang-kurangnya satu zon.', 'bad');
    const sub = ev.submitter || $('#gf button[type=submit]'); sub.disabled = true; sub.textContent = 'Menjana kunci…';
    try{
      try{ const k = await kekFrom(pin, core.kdf.salt, core.kdf.iter); await unseal(k, core.owner, 'owner'); toast('PIN itu sama dengan PIN pemilik. Pilih PIN lain.', 'bad'); sub.disabled = false; sub.textContent = 'Cipta pas'; return; }catch(e){}
      const gid = 'g' + rid(9), salt = b64(rand(16));
      const kek = await kekFrom(pin, salt, ITER);
      const g = {name, gender, salt, iter:ITER, lab:$('#glab').checked, niv:$('#gniv').checked, istana:$('#gist').checked, laut:$('#glaut').checked, powers:EXTRA_POWERS.filter(p => $('#gp_' + p).checked), created:Date.now(), exp:+$('#gexp').value ? Date.now() + +$('#gexp').value * 864e5 : 0, check:await seal(kek, te.encode('erythmind'), 'guest:' + gid), keys:{}};
      for(const z of zones){ const zk = await unseal(session.MK, core.zones[z], 'zone:' + z); g.keys[z] = await seal(kek, zk, `gz:${gid}:${z}`); zk.fill(0); }
      const n = clone(core); n.guests = n.guests || {}; n.guests[gid] = g;
      await store.setCore(n); core = n; toast(`Pas untuk ${name} dicipta.`, 'ok'); openGuests();
    }catch(e){ toast('Gagal mencipta pas (' + (e.code || e.message) + ').', 'bad'); sub.disabled = false; sub.textContent = 'Cipta pas'; }
  });
}

/* --- settings & backup --- */
function openSettings(){
  ui.view = 'settings';
  openPanel(`${head('Pemilikan data', 'Tetapan & Sandaran', 'Erythmind kau pegang sendiri. Sandaran ialah fail tersulit sepenuhnya: tanpa PIN, ia hanya teks rawak.')}
  <div class="pb">
    <div class="ro"><div class="note">Storan: ${store?.kind === 'db' ? 'Eryth Records awan (tersulit hujung ke hujung). Hanya teks rawak sampai ke pelayan.' : 'Mod tempatan: hanya dalam pelayar ini. Buat sandaran selalu.'}</div>
    <div class="note">Rekod: ${raw.size} · Tetamu: ${Object.keys(core?.guests || {}).length} · Dibina: ${core?.created ? fmtDate(core.created) : '—'}</div></div>
    ${gfxSettingsHtml()}
    ${isOwner() ? `<h3>Sandaran</h3>
    <div class="row"><button class="btn pri" id="bexp" type="button">Muat turun sandaran tersulit</button><button class="btn" id="bcopy" type="button">Salin sandaran</button></div>
    <div class="field"><label for="bimp">Pulihkan daripada fail sandaran (.json)</label><input id="bimp" type="file" accept=".json,application/json"></div>
    <div id="impc"></div>
    <h3>Tukar PIN pemilik</h3>
    <form id="pf" class="grid2" autocomplete="off"><div class="field"><label for="pold">PIN semasa</label><input id="pold" type="password" inputmode="numeric" required></div><div class="field"><label for="pnew">PIN baharu (6–12 digit)</label><input id="pnew" type="password" inputmode="numeric" pattern="[0-9]{6,12}" required></div><div class="row"><button class="btn" type="submit">Tukar PIN</button></div></form>` : '<div class="empty">Hanya pemilik boleh membuat sandaran atau menukar PIN.</div>'}
  </div>`, '#ffb86b');
  if(!isOwner()) return;
  const backup = () => JSON.stringify({format:'erythmind-backup', v:2, exported:Date.now(), core, vault:Object.fromEntries(raw)});
  $('#bexp').addEventListener('click', async () => {
    const dl = await use('downloads'); if(!dl){ toast('Muat turun tidak tersedia di paparan ini. Guna "Salin sandaran".', 'bad'); return; }
    try{ await dl.save({filename:'erythmind-sandaran-' + new Date().toISOString().slice(0, 10) + '.json', data:backup()}); toast('Sandaran disimpan.', 'ok'); }
    catch(e){ if(e.code !== 'declined') toast('Sandaran tidak disimpan (' + e.code + ').', 'bad'); }
  });
  $('#bcopy').addEventListener('click', () => { navigator.clipboard.writeText(backup()).then(() => toast('Sandaran disalin ke papan klip.', 'ok'), () => toast('Papan klip ditolak oleh pelayar ini.', 'bad')); });
  $('#bimp').addEventListener('change', async e => {
    const f = e.target.files[0]; if(!f) return; let b;
    try{ b = JSON.parse(await f.text()); if(b.format !== 'erythmind-backup' || !b.core?.owner) throw 0; }catch(_){ $('#impc').innerHTML = '<div class="note warn">Fail ini bukan sandaran Erythmind.</div>'; return; }
    $('#impc').innerHTML = `<div class="ro"><div class="note warn">Ini akan menggantikan seluruh dunia sekarang (${raw.size} rekod) dengan sandaran (${Object.keys(b.vault || {}).length} rekod, ${fmtDate(b.exported)}). Selepas itu, buka semula dengan PIN sandaran tersebut.</div><div class="row"><button class="btn danger" id="impgo" type="button">Gantikan dunia dengan sandaran ini</button></div></div>`;
    $('#impgo').addEventListener('click', async () => {
      try{ for(const id of [...raw.keys()]) if(!(b.vault || {})[id]) await store.del(id); for(const [id, r] of Object.entries(b.vault || {})) await store.put(id, r); await store.setCore(b.core); core = clone(b.core); lock('Sandaran dipulihkan. Masukkan PIN sandaran itu.'); }
      catch(err){ toast('Pemulihan gagal (' + (err.code || err.message) + ').', 'bad'); }
    });
  });
  $('#pf').addEventListener('submit', async ev => {
    ev.preventDefault(); const oldp = $('#pold').value.trim(), newp = $('#pnew').value.trim();
    if(!/^[0-9]{6,12}$/.test(newp)) return toast('PIN baharu mesti 6 hingga 12 digit.', 'bad');
    try{
      const kek = await kekFrom(oldp, core.kdf.salt, core.kdf.iter); const mkRaw = await unseal(kek, core.owner, 'owner');
      const salt = b64(rand(16)), nk = await kekFrom(newp, salt, ITER);
      const n = clone(core); n.kdf = {salt, iter:ITER}; n.owner = await seal(nk, mkRaw, 'owner'); mkRaw.fill(0);
      await store.setCore(n); core = n; toast('PIN pemilik ditukar. Jangan lupa PIN baharu.', 'ok'); $('#pold').value = $('#pnew').value = '';
    }catch(e){ toast(e.name === 'OperationError' ? 'PIN semasa salah.' : 'Gagal menukar PIN (' + (e.code || e.message) + ').', 'bad'); }
  });
}

/* ================= Gate (Frontier Dome access) ================= */
let gateState = 'loading', pinBuf = '', setupFirst = '', gateMsg = '', gateBusy = false;
const lockout = () => LS.get('erythmind.fails', {n:0, until:0});
function renderGate(state){
  if(state) gateState = state; const g = $('#gate'); g.hidden = false; $('#act').hidden = true;
  const lo = lockout(), wait = Math.max(0, Math.ceil((lo.until - Date.now()) / 1000));
  let sub = 'Frontier Dome · Kawalan Akses', msg = '', pad = false;
  if(gateState === 'loading') msg = 'Menyambung ke Eryth Records…';
  else if(gateState === 'inactive') msg = 'Erythmind belum diaktifkan. Hanya pemiliknya boleh membina dunia ini.';
  else if(gateState === 'setup1'){ sub = 'Pembinaan Dunia · Langkah 1/2'; msg = 'Cipta PIN pemilik (6 hingga 12 digit). PIN ini menjana kunci penyulitan semua memori kau.'; pad = true; }
  else if(gateState === 'setup2'){ sub = 'Pembinaan Dunia · Langkah 2/2'; msg = 'Masukkan PIN sekali lagi untuk sahkan.'; pad = true; }
  else if(gateState === 'unlock'){ msg = wait ? `Terlalu banyak cubaan salah. Frontier Dome terkunci selama ${wait} saat lagi.` : 'Masukkan PIN untuk melepasi Frontier Dome. Pemilik dan tetamu guna pad yang sama.'; pad = !wait; }
  if(gateMsg) msg = gateMsg;
  g.innerHTML = `<div class="gcard" id="gcard"><h1>ERYTH<span>MIND</span></h1><div class="gsub">${sub}</div>
    <div class="gmsg ${gateMsg ? 'bad' : ''}">${esc(msg)}</div>
    ${gateBusy ? '<div class="scan"></div><div class="gmsg">Bavar-373 sedang mengesahkan kunci…</div>' : ''}
    ${pad && !gateBusy ? `<div class="dots">${Array.from({length:Math.max(6, pinBuf.length)}, (_, i) => `<i class="${i < pinBuf.length ? 'f' : ''}"></i>`).join('')}</div>
    <div class="pad">${[1,2,3,4,5,6,7,8,9].map(n => `<button type="button" data-k="${n}">${n}</button>`).join('')}<button type="button" class="del" data-k="del">PADAM</button><button type="button" data-k="0">0</button><button type="button" class="ok" data-k="ok">MASUK</button></div>` : ''}
    ${gateState.startsWith('setup') ? '<div class="note warn">Tiada sesiapa boleh memulihkan PIN ini: bukan Claude, bukan Anthropic, bukan pemilik pelayan. Lupa PIN bermakna dunia ini hilang. Guna sekurang-kurangnya 8 digit dan buat sandaran.</div>' : ''}
    ${gateState === 'unlock' && store?.kind === 'local' ? '<div class="note">Mod tempatan: dunia ini hanya wujud dalam pelayar ini.</div>' : ''}
  </div>`;
  g.querySelectorAll('[data-k]').forEach(b => b.addEventListener('click', () => padKey(b.dataset.k)));
  if(wait && gateState === 'unlock') setTimeout(() => { if(gateState === 'unlock' && !session) renderGate(); }, 1000);
}
function gateKey(e){
  if(/^[0-9]$/.test(e.key)) padKey(e.key); else if(e.key === 'Backspace') padKey('del'); else if(e.key === 'Enter') padKey('ok'); else return;
  e.preventDefault();
}
async function padKey(k){
  if(gateBusy || !['setup1','setup2','unlock'].includes(gateState)) return;
  if(gateState === 'unlock' && lockout().until > Date.now()) return;
  gateMsg = '';
  if(k === 'del'){ pinBuf = pinBuf.slice(0, -1); return renderGate(); }
  if(k !== 'ok'){ if(pinBuf.length < 12) pinBuf += k; return renderGate(); }
  if(pinBuf.length < 6){ gateMsg = 'PIN mesti sekurang-kurangnya 6 digit.'; return renderGate(); }
  if(gateState === 'setup1'){ setupFirst = pinBuf; pinBuf = ''; return renderGate('setup2'); }
  if(gateState === 'setup2'){
    if(pinBuf !== setupFirst){ pinBuf = ''; setupFirst = ''; gateMsg = 'PIN tidak sepadan. Mulakan semula.'; return renderGate('setup1'); }
    gateBusy = true; renderGate();
    try{ await createWorld(pinBuf); }catch(e){ gateMsg = 'Gagal membina dunia (' + (e.code || e.message) + ').'; gateBusy = false; pinBuf = ''; setupFirst = ''; return renderGate('setup1'); }
    gateBusy = false; pinBuf = ''; setupFirst = ''; return;
  }
  gateBusy = true; renderGate();
  const ok = await tryUnlock(pinBuf); gateBusy = false; pinBuf = '';
  if(ok) return;
  const f = lockout(); f.n++; if(f.n >= 5) f.until = Date.now() + 30000 * Math.pow(2, f.n - 5); LS.set('erythmind.fails', f);
  bavar.fails++; updateChips(); domeU.uAlert.value = 1; flash('rgba(255,30,30,.8)');
  gateMsg = `AKSES DITOLAK. PIN tidak dikenali (${f.n} cubaan gagal).`; renderGate();
  $('#gcard')?.classList.add('denied');
}
