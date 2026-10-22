'use strict';
/* ================= Dewan Baitul Hikmah (layer 4): the great hall inside the Owl Library =================
   A long hall of dark timber shelves, floating candles and tall pointed-arch windows. 1000 books sit on ten
   double-sided bookcases; each one opens a record in the encrypted 'buku' zone (keyed by its slot). */
const BK = {units:10, faces:2, rows:5, cols:10, unitLen:8, unitH:7.2, unitD:1.5, rowH:1.3};
const BK_Z = [-40, -22, -4, 14, 32];                        // bookcase centres along the hall, five per side
const hallXZ = (x, z) => [x - LIBH.x, z - LIBH.z];
function libH(){ return 0; }
function unitAt(u){ const side = u < 5 ? -1 : 1; return {x:side * (LIBH.hw - 1 - BK.unitLen / 2), z:BK_Z[u % 5]}; }
function libWalkable(x, z){ const [lx, lz] = hallXZ(x, z); return Math.abs(lx) < LIBH.hw - 1 && Math.abs(lz) < LIBH.hl - 1; }
function libMapColor(x, z){
  const [lx, lz] = hallXZ(x, z); if(Math.abs(lx) > LIBH.hw || Math.abs(lz) > LIBH.hl) return [20, 13, 8];
  for(let u = 0; u < BK.units; u++){ const c = unitAt(u); if(Math.abs(lx - c.x) < BK.unitLen / 2 && Math.abs(lz - c.z) < BK.unitD / 2 + .3) return [70, 42, 22]; }
  if(Math.abs(lx) < 2.4) return [120, 30, 34];
  return [150, 104, 64];
}
function bookPlace(slot){
  const u = Math.floor(slot / 100), f = Math.floor(slot % 100 / 50), r = Math.floor(slot % 50 / 10), c = slot % 10;
  return `Buku #${slot + 1} · Rak ${u + 1}${f ? 'B' : 'A'} · baris ${BK.rows - r} dari atas · no. ${c + 1}`;
}

const hall = grp(LIBH.x, LIBH.y, LIBH.z);
function plankTex(){
  const c = document.createElement('canvas'); c.width = 256; c.height = 256; const g = c.getContext('2d');
  for(let i = 0; i < 8; i++){ const v = 52 + (i * 37 % 22); g.fillStyle = `rgb(${v + 30},${v + 10},${v - 14})`; g.fillRect(0, i * 32, 256, 31); g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, i * 32 + 31, 256, 1); g.fillRect((i * 97) % 256, i * 32, 2, 32); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
function stoneWallTex(){
  const c = document.createElement('canvas'); c.width = 256; c.height = 256; const g = c.getContext('2d');
  g.fillStyle = '#3e3328'; g.fillRect(0, 0, 256, 256);
  for(let y = 0; y < 256; y += 32) for(let x = 0; x < 256; x += 64){ const v = 88 + ((x * 3 + y * 7) % 26); g.fillStyle = `rgb(${v},${v - 12},${v - 26})`; g.fillRect(x + ((y / 32) % 2 ? 32 : 0) + 2, y + 2, 60, 28); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
const darkWood = M(0x3a2414, {roughness:.65, flatShading:false}), midWood = M(0x5a3820, {roughness:.6, flatShading:false}), brass = M(0xc8a24a, {metalness:.75, roughness:.3});

/* --- shell: floor, carpet, walls with pointed-arch windows, ceiling beams --- */
{
  const W = LIBH.hw * 2, L = LIBH.hl * 2, H = LIBH.h;
  const ft = plankTex(); ft.repeat.set(6, 14);
  mesh(new THREE.PlaneGeometry(W, L), new THREE.MeshStandardMaterial({map:ft, roughness:.55}), 0, 0, 0, hall, false).rotation.x = -Math.PI / 2;
  mesh(new THREE.PlaneGeometry(4.6, L - 8), M(0x6a1820, {flatShading:false, roughness:.9}), 0, .02, 0, hall, false).rotation.x = -Math.PI / 2;
  [-2.4, 2.4].forEach(x => mesh(new THREE.PlaneGeometry(.18, L - 8), brass, x, .025, 0, hall, false).rotation.x = -Math.PI / 2);
  const wt = stoneWallTex(); wt.repeat.set(12, 4); const wallM = new THREE.MeshStandardMaterial({map:wt, roughness:.9, side:THREE.DoubleSide});
  [[-1, 0], [1, 0]].forEach(([s]) => { const w = mesh(new THREE.PlaneGeometry(L, H), wallM, s * LIBH.hw, H / 2, 0, hall, false); w.rotation.y = -s * Math.PI / 2; });
  [[-1], [1]].forEach(([s]) => { const w = mesh(new THREE.PlaneGeometry(W, H), wallM, 0, H / 2, s * LIBH.hl, hall, false); w.rotation.y = s > 0 ? Math.PI : 0; });
  const ceil = mesh(new THREE.PlaneGeometry(W, L), M(0x1e140c, {flatShading:false}), 0, H, 0, hall, false); ceil.rotation.x = Math.PI / 2;
  for(let z = -LIBH.hl + 4; z < LIBH.hl; z += 8){ mesh(new THREE.BoxGeometry(W, 1.1, .9), darkWood, 0, H - .6, z, hall, false); }
  [-1, 1].forEach(s => mesh(new THREE.BoxGeometry(.9, 1.1, L), darkWood, s * 8, H - 1.2, 0, hall, false));
  // pointed (Abbasid-style) arch windows full of moonlight, with soft beams falling into the hall
  const arch = new THREE.Shape(); arch.moveTo(-2.6, 0); arch.lineTo(-2.6, 9); arch.quadraticCurveTo(-2.6, 12.6, 0, 14.4); arch.quadraticCurveTo(2.6, 12.6, 2.6, 9); arch.lineTo(2.6, 0); arch.lineTo(-2.6, 0);
  const archGeo = new THREE.ShapeGeometry(arch, 12), glass = new THREE.MeshBasicMaterial({color:0x9ab8e8, transparent:true, opacity:.85}), beamM = new THREE.MeshBasicMaterial({color:0xbcd4ff, transparent:true, opacity:.05, blending:THREE.AdditiveBlending, depthWrite:false, side:THREE.DoubleSide});
  for(const s of [-1, 1]) for(let z = -49; z <= 49; z += 18){
    const w = mesh(archGeo, glass, s * (LIBH.hw - .05), 9, z, hall, false); w.rotation.y = -s * Math.PI / 2;
    const fr = mesh(new THREE.BoxGeometry(.25, 14.4, .3), darkWood, s * (LIBH.hw - .12), 16.2, z, hall, false); mesh(new THREE.BoxGeometry(.3, .25, 5.4), darkWood, s * (LIBH.hw - .12), 18, z, hall, false);
    const beam = mesh(new THREE.PlaneGeometry(5, 26), beamM, s * (LIBH.hw - 9), 11, z, hall, false); beam.rotation.set(0, Math.PI / 2, s * .62);
  }
  // end window behind the librarian's desk and the entrance arch
  const big = mesh(new THREE.ShapeGeometry(arch, 12), glass, 0, 6, -LIBH.hl + .05, hall, false); big.scale.set(1.6, 1.4, 1);
  const door = mesh(new THREE.ShapeGeometry(arch, 12), M(0x2a1a0e), 0, 0, LIBH.hl - .05, hall, false); door.scale.set(1.3, .7, 1); door.rotation.y = Math.PI;
  mesh(new THREE.TorusGeometry(3.4, .35, 6, 24, Math.PI), brass, 0, 6.6, LIBH.hl - .3, hall, false);
  for(let z = -LIBH.hl + 9; z < LIBH.hl; z += 18) [-1, 1].forEach(s => mesh(new THREE.CylinderGeometry(.9, 1.1, LIBH.h, 10), M(0x6a5a46), s * (LIBH.hw - .9), LIBH.h / 2, z, hall, false));
}

/* --- ten double-sided bookcases holding 1000 books --- */
const BOOKS = {mesh:null, band:null, slots:new Map(), hover:-1, base:[]};
{
  const N = BK.units * 100;
  const books = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({roughness:.7}), N);
  const band = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({color:0xd8a93a, metalness:.8, roughness:.3, emissive:0x3a2600, emissiveIntensity:.6}), N);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3(), r = mulberry(1001), col = new THREE.Color();
  const dull = [0x4a2e22, 0x2e3a2e, 0x3a2e42, 0x23324a, 0x4e4430, 0x4a2222, 0x34302c, 0x2a3e3c];
  for(let u = 0; u < BK.units; u++){
    const c = unitAt(u), g = grp(c.x, 0, c.z, hall);
    mesh(new THREE.BoxGeometry(BK.unitLen + .5, BK.unitH + .6, .25), darkWood, 0, (BK.unitH + .6) / 2, 0, g);
    [-1, 1].forEach(sx => mesh(new THREE.BoxGeometry(.3, BK.unitH + .9, BK.unitD + .2), darkWood, sx * (BK.unitLen / 2 + .15), (BK.unitH + .9) / 2, 0, g));
    for(let rr = 0; rr <= BK.rows; rr++) mesh(new THREE.BoxGeometry(BK.unitLen, .14, BK.unitD), midWood, 0, .35 + rr * BK.rowH, 0, g, false);
    mesh(new THREE.BoxGeometry(BK.unitLen + 1, .7, BK.unitD + .5), darkWood, 0, BK.unitH + .95, 0, g, false);
    [-1, 1].forEach(sx => mesh(new THREE.SphereGeometry(.28, 10, 8), brass, sx * (BK.unitLen / 2 + .15), BK.unitH + 1.5, 0, g, false));
    for(let k = -BK.unitLen / 2; k <= BK.unitLen / 2; k += 1.1) collide(LIBH.x + c.x + k, LIBH.z + c.z, 1.05, 4);
    if(u % 3 === 1){ const lad = grp(BK.unitLen / 2 - 1.2, 0, BK.unitD / 2 + .9, g); lad.rotation.x = -.16; [-.45, .45].forEach(x => mesh(new THREE.BoxGeometry(.1, 7.6, .12), midWood, x, 3.8, 0, lad, false)); for(let k = 0; k < 12; k++) mesh(new THREE.BoxGeometry(.9, .07, .1), midWood, 0, .4 + k * .62, 0, lad, false); }
    for(let f = 0; f < 2; f++) for(let row = 0; row < BK.rows; row++){
      let x = -BK.unitLen / 2 + .2;
      for(let k = 0; k < BK.cols; k++){
        const i = u * 100 + f * 50 + row * 10 + k, th = .5 + r() * .2, h = .82 + r() * .3, d = .55 + r() * .12, tilt = r() < .08 ? (r() - .5) * .25 : 0;
        const zf = (f ? -1 : 1) * (.08 + d / 2);
        p.set(c.x + x + th / 2, .42 + row * BK.rowH + h / 2, c.z + zf); q.setFromAxisAngle(new THREE.Vector3(0, 0, 1), tilt); s.set(th, h, d);
        m4.compose(p, q, s); books.setMatrixAt(i, m4);
        BOOKS.base[i] = {p:p.clone(), q:q.clone(), s:s.clone(), f};
        books.setColorAt(i, col.setHex(dull[(i * 7 + row) % dull.length]));
        band.setMatrixAt(i, m4.compose(p, q, s.set(0, 0, 0)));
        x += th + .03;
      }
    }
  }
  books.instanceColor.needsUpdate = true; books.castShadow = true; books.receiveShadow = true;
  hall.add(books); hall.add(band); BOOKS.mesh = books; BOOKS.band = band;
}
const BOOK_COL = {'Selesai dibaca':[0x9a2a2a, 0x2a5a9a, 0x2a7a4a, 0x6a2a8a, 0x9a6a1a, 0x1a6a6a], 'Sedang dibaca':[0xe0902a], 'Mahu dibaca':[0x3a8aa0]};
function refreshBooks(){
  if(!BOOKS.mesh) return; BOOKS.slots.clear();
  plain.forEach(e => { if(e.z === 'buku' && !e.bad && e.data && Number.isInteger(+e.data.slot)) BOOKS.slots.set(+e.data.slot, e); });
  const col = new THREE.Color(), m4 = new THREE.Matrix4(), s = new THREE.Vector3(), dull = [0x4a2e22, 0x2e3a2e, 0x3a2e42, 0x23324a, 0x4e4430, 0x4a2222, 0x34302c, 0x2a3e3c];
  for(let i = 0; i < BOOKS.base.length; i++){
    const e = BOOKS.slots.get(i), b = BOOKS.base[i], row = Math.floor(i % 50 / 10);
    if(e){ const pal = BOOK_COL[e.data.status] || BOOK_COL['Selesai dibaca'], hsh = [...String(e.data.title || '')].reduce((a, ch) => a * 31 + ch.charCodeAt(0) | 0, 7); col.setHex(pal[Math.abs(hsh) % pal.length]); }
    else col.setHex(dull[(i * 7 + row) % dull.length]);
    BOOKS.mesh.setColorAt(i, col);
    s.set(e ? b.s.x * 1.04 : 0, e ? .08 : 0, e ? b.s.z * 1.04 : 0);
    const p = b.p.clone(); p.y += b.s.y * .28; BOOKS.band.setMatrixAt(i, m4.compose(p, b.q, s));
  }
  BOOKS.mesh.instanceColor.needsUpdate = true; BOOKS.band.instanceMatrix.needsUpdate = true;
  const n = BOOKS.slots.size; if(hallCount) hallCount.el.innerHTML = `Katalog Bacaan<small>${n} / 1000 buku dicatat</small>`;
}
function bookAtRay(r){ if(!BOOKS.mesh || !hall.visible) return null; const hit = r.intersectObject(BOOKS.mesh)[0]; return hit && hit.distance < 70 ? hit.instanceId : null; }
function openBook(slot){
  if(!canZone('buku')){ denyAccess('Pas kau tidak termasuk Katalog Bacaan.', 'Dewan Baitul Hikmah'); return; }
  const e = [...plain.values()].find(x => x.z === 'buku' && +x.data?.slot === slot);
  openZone('buku'); sfx.click(); tone(520, {d:.2, v:.03}); noiseHit({d:.25, v:.05, f:3000, type:'bandpass'});
  if(e) ui.sel = e.id; else { ui.sel = null; ui.newExtra = {slot}; if(!isOwner()){ toast('Buku ini masih kosong.'); } }
  renderZoneList(); renderZoneForm();
}

/* --- reading tables, the librarian's desk, a small owl, floating candles, dust in the moonlight --- */
{
  [-36, -16, 4, 24, 42].forEach((z, i) => {
    const t = grp(0, 0, z, hall); mesh(new THREE.BoxGeometry(3.4, .18, 12), midWood, 0, 1.55, 0, t); [[-1.4, -5.4], [1.4, -5.4], [-1.4, 5.4], [1.4, 5.4]].forEach(([x, zz]) => mesh(new THREE.BoxGeometry(.2, 1.5, .2), darkWood, x, .75, zz, t, false));
    [-1, 1].forEach(sx => mesh(new THREE.BoxGeometry(.9, .14, 11), darkWood, sx * 2.6, .95, 0, t, false));
    [-3, 3].forEach(zz => { mesh(new THREE.CylinderGeometry(.06, .12, .7, 8), brass, 0, 1.95, zz, t, false); mesh(new THREE.SphereGeometry(.42, 12, 8, 0, 6.283, 0, Math.PI / 2), new THREE.MeshStandardMaterial({color:0x1f6a3a, emissive:0x2a8a4a, emissiveIntensity:.8, side:THREE.DoubleSide}), 0, 2.2, zz, t, false).rotation.x = Math.PI; });
    if(i % 2 === 0){ const ob = grp(.4, 1.66, -1, t); [-1, 1].forEach(sx => { const pg = mesh(new THREE.BoxGeometry(.7, .04, .95), M(0xf0e6cc), sx * .36, 0, 0, ob, false); pg.rotation.z = sx * -.12; }); }
    for(let k = -5; k <= 5; k += 1.2) collide(LIBH.x, LIBH.z + z + k, 1.9, 4);
  });
  const desk = grp(0, 0, -52, hall);
  mesh(new THREE.BoxGeometry(10, 2.2, 3), darkWood, 0, 1.1, 0, desk); mesh(new THREE.BoxGeometry(10.4, .2, 3.4), midWood, 0, 2.3, 0, desk, false);
  for(let k = 0; k < 6; k++) mesh(new THREE.BoxGeometry(.5 + Math.random() * .3, .3, .7), M([0x9a2a2a, 0x2a5a9a, 0x6a2a8a][k % 3]), -3.5 + k * .25, 2.55 + k * .3, .3, desk, false);
  const owl = grp(3.2, 2.4, 0, desk), fea = M(0x7a5a3a); mesh(new THREE.SphereGeometry(.55, 12, 10), fea, 0, .6, 0, owl).scale.y = 1.25; mesh(new THREE.SphereGeometry(.45, 12, 10), fea, 0, 1.45, 0, owl);
  [-.18, .18].forEach(x => mesh(new THREE.SphereGeometry(.13, 10, 8), new THREE.MeshBasicMaterial({color:0xffb030}), x, 1.5, .38, owl, false)); [-.22, .22].forEach(x => mesh(new THREE.ConeGeometry(.1, .3, 4), fea, x, 1.9, 0, owl, false));
  anims.push(t => { owl.rotation.y = Math.sin(t * .5) * .8; });
  for(let k = -4.5; k <= 4.5; k += 1.5) collide(LIBH.x + k, LIBH.z - 52, 1.6, 4);
  info(owl, 'Bubo Kecil', 'Pembantu pustakawan. Tekan mana-mana buku di rak untuk mencatat bacaan kau; buku yang telah dicatat bertukar warna dan berjalur emas.');
  // floating candles
  const n = 170, cand = new THREE.InstancedMesh(new THREE.CylinderGeometry(.09, .1, .8, 8), M(0xf2ead6, {flatShading:false}), n), flame = new THREE.InstancedMesh(new THREE.SphereGeometry(.13, 8, 6), new THREE.MeshBasicMaterial({color:0xffc260}), n);
  const r = mulberry(77), pos = []; for(let i = 0; i < n; i++) pos.push([(r() - .5) * 30, 15 + r() * 9, (r() - .5) * 112, r() * 6.283]);
  hall.add(cand); hall.add(flame); const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s1 = new THREE.Vector3(1, 1, 1), sf = new THREE.Vector3(1, 1.6, 1), p = new THREE.Vector3();
  anims.push(t => { if(player.layer !== 4) return; pos.forEach(([x, y, z, ph], i) => { const yy = y + Math.sin(t * .7 + ph) * .35; m4.compose(p.set(x, yy, z), q, s1); cand.setMatrixAt(i, m4); sf.y = 1.5 + Math.sin(t * 9 + ph * 3) * .3; m4.compose(p.set(x, yy + .5, z), q, sf); flame.setMatrixAt(i, m4); }); cand.instanceMatrix.needsUpdate = true; flame.instanceMatrix.needsUpdate = true; });
  const glow = new THREE.PointLight(0xffc888, 0, 160, 1); glow.position.set(0, 20, 0); hall.add(glow);
  const dustGeo = new THREE.BufferGeometry(), dp = new Float32Array(500 * 3); for(let i = 0; i < 500; i++){ dp[i * 3] = (r() - .5) * 46; dp[i * 3 + 1] = r() * 26; dp[i * 3 + 2] = (r() - .5) * 118; }
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dp, 3)); hall.add(new THREE.Points(dustGeo, new THREE.PointsMaterial({color:0xffe8c0, size:.07, transparent:true, opacity:.55, depthWrite:false})));
  anims.push((t, dt) => { glow.intensity = player.layer === 4 ? (composer ? 1.35 : 2.2) : 0; if(player.layer !== 4) return; const a = dustGeo.attributes.position.array; for(let i = 0; i < 500; i++){ a[i * 3 + 1] += Math.sin(t * .3 + i) * dt * .08; a[i * 3] += Math.cos(t * .2 + i) * dt * .05; } dustGeo.attributes.position.needsUpdate = true; });
  // Bilik Manuskrip Purba: a gated alcove of old manuscripts
  const gate = grp(LIBH.hw - 6, 0, -58, hall); for(let k = -3; k <= 3; k += .6) mesh(new THREE.CylinderGeometry(.05, .05, 6, 6), M(0x2a2a30, {metalness:.8}), k, 3, 0, gate, false);
  mesh(new THREE.BoxGeometry(6.6, .2, .2), M(0x2a2a30, {metalness:.8}), 0, 6, 0, gate, false); info(gate, 'Bilik Manuskrip Purba', 'Manuskrip lama sains, falak dan perubatan di sebalik pagar besi. Sambungan semangat Baitul Hikmah Baghdad: menterjemah, menyalin dan mengembangkan ilmu.');
}

/* --- hover a book to see what it is --- */
const bookTip = document.createElement('div'); bookTip.className = 'lbl zone booktip'; bookTip.style.display = 'none'; labelRoot.appendChild(bookTip);
let tipT = 0;
renderer.domElement.addEventListener('pointermove', e => {
  if(player.layer !== 4 || !session || performance.now() - tipT < 90){ return; } tipT = performance.now();
  const r = new THREE.Raycaster(); r.setFromCamera(new THREE.Vector2(e.clientX / innerWidth * 2 - 1, -e.clientY / innerHeight * 2 + 1), camera);
  const slot = bookAtRay(r);
  if(slot == null){ bookTip.style.display = 'none'; return; }
  const en = BOOKS.slots.get(slot);
  bookTip.innerHTML = en ? `${esc(en.data.title || 'Tanpa tajuk')}<small>${esc([en.data.author, en.data.status].filter(Boolean).join(' · '))}</small>` : `Buku kosong<small>${esc(bookPlace(slot))} · tekan untuk mencatat</small>`;
  bookTip.style.display = ''; bookTip.style.transform = `translate(${e.clientX + 14}px, ${e.clientY - 10}px)`;
});

/* --- entering and leaving --- */
function goHall(){
  if(!canNiv()){ denyAccess('Pas kau tidak termasuk Nivelham.', 'Dewan Baitul Hikmah'); return; }
  flash('rgba(255,210,150,.7)'); sfx.whoosh(); setLayer(4); player.x = LIBH.x; player.z = LIBH.z + LIBH.hl - 8; player.y = 0; player.ry = Math.PI; cam.yaw = 0; cam.pitch = .32; cam.tdist = 16; cam.dist = 16; camera.position.set(player.x, LIBH.y + 8, player.z + 6);
  toast('Dewan Baitul Hikmah · 1000 buku menanti. Tekan mana-mana buku untuk mencatat bacaan kau.', 'ok', 5000);
}
function leaveHall(){ flash('rgba(255,210,150,.5)'); sfx.whoosh(); setLayer(2); player.x = NV.lib.x; player.z = NV.lib.z + 17; player.y = nivH(player.x, player.z); cam.yaw = 0; camera.position.set(player.x, NVY + player.y + 6, player.z + 13); }
interactables.push(
  {id:'dewanmasuk', name:'Masuk Dewan Baitul Hikmah', layer:2, at:[NV.lib.x, NV.lib.z + 13], r:5, color:'#d8a93a', act:() => goHall()},
  {id:'dewankeluar', name:'Keluar ke Perpustakaan Hikmah', layer:4, at:[LIBH.x, LIBH.z + LIBH.hl - 3], r:4, color:'#d8a93a', act:() => leaveHall()},
);
const hallCount = fixedLabel('Katalog Bacaan<small>0 / 1000 buku dicatat</small>', LIBH.x, LIBH.y + 6.5, LIBH.z - 52, '#d8a93a', 60, 4);
for(let u = 0; u < BK.units; u++){ const c = unitAt(u); fixedLabel(`Rak ${u + 1}<small>buku #${u * 100 + 1}–${u * 100 + 100}</small>`, LIBH.x + c.x, LIBH.y + BK.unitH + 2.6, LIBH.z + c.z, '#e8c27a', 30, 4); }
fixedLabel('Pintu keluar<small>Ke Perpustakaan Hikmah</small>', LIBH.x, LIBH.y + 5, LIBH.z + LIBH.hl - 3, '#d8a93a', 40, 4);
EXPED.push({id:'baitulhikmah', name:'Dewan Baitul Hikmah', sub:'1000 buku · Katalog Bacaan · Arkib Pemikir', x:58, y:83, layer:4, to:[LIBH.x, LIBH.z + LIBH.hl - 8]});
