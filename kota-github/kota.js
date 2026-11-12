/* Kota GitHub · profil GitHub sebagai kota 3D hidup di atas pulau terapung.
   Repo = bangunan (bintang menjadikannya tinggi), push sebenar = trak commit,
   isu terbuka = bumbung terbakar, PR terbuka = kren.
   Data ditarik terus dari API awam GitHub dalam pelayar pelawat; tiada pelayan, tiada token. */
(() => {
'use strict';

const PENGGUNA_ASAL = 'harithmhd12-coder';
const API = 'https://api.github.com';
const CACHE_MS = 15 * 60e3;
const $ = s => document.querySelector(s);
const kecil = matchMedia('(max-width:860px)');
const kurangGerak = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- warna bahasa (linguist) ---------- */
const BAHASA = {
  JavaScript:'#f1e05a', TypeScript:'#3178c6', Python:'#3572A5', HTML:'#e34c26', CSS:'#663399', SCSS:'#c6538c',
  Java:'#b07219', 'C++':'#f34b7d', C:'#555555', 'C#':'#178600', Go:'#00ADD8', Rust:'#dea584', PHP:'#4F5D95',
  Ruby:'#701516', Swift:'#F05138', Kotlin:'#A97BFF', Dart:'#00B4AB', Shell:'#89e051', Vue:'#41b883',
  'Jupyter Notebook':'#DA5B0B', Lua:'#000080', PLpgSQL:'#336790', Svelte:'#ff3e00', Astro:'#ff5a03',
  'Objective-C':'#438eff', R:'#198CE7', Scala:'#c22d40', Elixir:'#6e4a7e', Haskell:'#5e5086', Perl:'#0298c3',
  PowerShell:'#012456', Dockerfile:'#384d54', MDX:'#fcb32c', Markdown:'#083fa1', Zig:'#ec915c', Nix:'#7e7eff',
  'Vim Script':'#199f4b', TeX:'#3D6117', Solidity:'#AA6746', GDScript:'#355570', Assembly:'#6E4C13'
};
const warnaBahasa = l => BAHASA[l] || '#94a3b8';

/* ---------- util ---------- */
function cincang(str){ let h = 2166136261; for(let i = 0; i < str.length; i++){ h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function rawak(seed){ let s = (seed >>> 0) || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
const nf = new Intl.NumberFormat('ms-MY');
const ringkasNo = n => n >= 1e6 ? (n/1e6).toFixed(1).replace('.0','') + 'J' : n >= 1e4 ? Math.round(n/1e3) + 'K' : n >= 1e3 ? (n/1e3).toFixed(1).replace('.0','') + 'K' : String(n);
function esc(s){ return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function masaLalu(iso){
  const d = (Date.now() - new Date(iso)) / 1000;
  if(d < 60) return 'baru tadi';
  const m = d / 60; if(m < 60) return Math.floor(m) + ' min lalu';
  const h = m / 60; if(h < 24) return Math.floor(h) + ' jam lalu';
  const hr = h / 24; if(hr < 30) return Math.floor(hr) + ' hari lalu';
  const b = hr / 30.4; if(b < 12) return Math.floor(b) + ' bulan lalu';
  return Math.floor(b / 12) + ' tahun lalu';
}
const hariSejak = iso => iso ? (Date.now() - new Date(iso)) / 864e5 : 9999;
const barisPertama = s => String(s || '').split('\n')[0].trim();
const lerp = (a, b, t) => a + (b - a) * t;
function sudutLerp(a, b, t){ let d = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI; if(d < -Math.PI) d += Math.PI * 2; return a + d * t; }

/* ---------- data GitHub ---------- */
class HadKadar extends Error { constructor(reset){ super('had'); this.reset = reset; } }
async function gh(path){
  const r = await fetch(API + path, { headers: { Accept: 'application/vnd.github+json' } });
  if(r.status === 404){ const e = new Error('tiada'); e.kod = 404; throw e; }
  if((r.status === 403 || r.status === 429) && r.headers.get('x-ratelimit-remaining') === '0')
    throw new HadKadar(+r.headers.get('x-ratelimit-reset') * 1000 || Date.now() + 36e5);
  if(!r.ok){ const e = new Error('http ' + r.status); e.kod = r.status; throw e; }
  return r.json();
}
function bacaCache(u){ try{ const o = JSON.parse(localStorage.getItem('kota-github:' + u.toLowerCase())); return o && o.v === 2 ? o : null; }catch{ return null; } }
function simpanCache(u, data){ try{ localStorage.setItem('kota-github:' + u.toLowerCase(), JSON.stringify({ v: 2, t: Date.now(), data })); }catch{} }

const ringkasUser = u => ({ login: u.login, nama: u.name, bio: u.bio, avatar: u.avatar_url, url: u.html_url,
  pengikut: u.followers, mengikut: u.following, repoAwam: u.public_repos, jenis: u.type });
const ringkasRepo = r => ({ nama: r.name, penuh: r.full_name, ket: r.description, bahasa: r.language,
  bintang: r.stargazers_count, fork: r.forks_count, isu: r.open_issues_count, saiz: r.size,
  push: r.pushed_at, cabang: r.fork, arkib: r.archived, url: r.html_url, laman: r.homepage });
function ringkasEvent(e){
  const p = e.payload || {}, o = { id: e.id, jenis: e.type, repo: e.repo && e.repo.name, masa: e.created_at };
  switch(e.type){
    case 'PushEvent': {
      const c = p.commits || [];
      o.cawangan = String(p.ref || '').replace('refs/heads/', '');
      o.bil = p.size || p.distinct_size || c.length || 1;
      o.mesej = c.length ? barisPertama(c[c.length - 1].message) : '';
      o.sha = (c.length ? c[c.length - 1].sha : p.head) || '';
      break;
    }
    case 'PullRequestEvent': o.tindakan = p.pull_request && p.pull_request.merged ? 'digabung' : p.action; o.tajuk = p.pull_request && p.pull_request.title; o.no = p.number; break;
    case 'IssuesEvent': o.tindakan = p.action; o.tajuk = p.issue && p.issue.title; o.no = p.issue && p.issue.number; break;
    case 'IssueCommentEvent': o.tajuk = p.issue && p.issue.title; o.no = p.issue && p.issue.number; break;
    case 'CreateEvent': o.jenisRef = p.ref_type; o.ref = p.ref; break;
    case 'DeleteEvent': o.jenisRef = p.ref_type; o.ref = p.ref; break;
    case 'ReleaseEvent': o.tajuk = p.release && (p.release.name || p.release.tag_name); break;
    case 'PullRequestReviewEvent': o.tajuk = p.pull_request && p.pull_request.title; o.no = p.pull_request && p.pull_request.number; break;
  }
  return o;
}

async function muatData(u, langkah){
  const c = bacaCache(u);
  if(c && Date.now() - c.t < CACHE_MS) return { data: c.data, dariCache: true };
  try{
    langkah('Mencari profil @' + u + '…');
    const user = await gh(`/users/${encodeURIComponent(u)}`);
    langkah('Mengukur bangunan…');
    const repos = [];
    for(let hal = 1; hal <= 3; hal++){
      const b = await gh(`/users/${user.login}/repos?per_page=100&type=owner&sort=pushed&page=${hal}`);
      repos.push(...b); if(b.length < 100) break;
    }
    langkah('Memanggil trak commit…');
    let events = [];
    try{ events = await gh(`/users/${user.login}/events/public?per_page=100`); }catch(e){ if(e instanceof HadKadar) throw e; }
    langkah('Memasang kren…');
    let pr = null;
    try{
      const s = await gh(`/search/issues?q=${encodeURIComponent(`is:pr is:open archived:false user:${user.login}`)}&per_page=100`);
      pr = {};
      for(const it of s.items){ const n = it.repository_url.split('/').slice(-2).join('/'); pr[n] = (pr[n] || 0) + 1; }
    }catch{}
    // API acara kini mungkin tidak membawa senarai commit; ambil mesej commit untuk beberapa push terbaru.
    const perlu = events.filter(e => e.type === 'PushEvent' && !(e.payload.commits && e.payload.commits.length) && e.payload.head).slice(0, 8);
    await Promise.all(perlu.map(async e => {
      try{ const k = await gh(`/repos/${e.repo.name}/commits/${e.payload.head}`); e.payload.commits = [{ sha: k.sha, message: k.commit.message }]; }catch{}
    }));
    const data = { user: ringkasUser(user), repos: repos.map(ringkasRepo), events: events.map(ringkasEvent), pr, masa: Date.now() };
    simpanCache(user.login, data);
    if(u.toLowerCase() !== user.login.toLowerCase()) simpanCache(u, data);
    return { data };
  }catch(e){
    if(c) return { data: c.data, dariCache: true, ralat: e };
    throw e;
  }
}

/* ---------- Three.js asas ---------- */
const pentas = $('#pentas');
let renderer;
try{
  renderer = new THREE.WebGLRenderer({ antialias: devicePixelRatio < 2, powerPreference: 'high-performance' });
}catch(e){
  $('#muatTeks').textContent = '';
  tunjukRalat('WebGL tidak tersedia', 'Pelayar atau peranti ini tidak dapat melukis 3D. Cuba pelayar lain atau hidupkan pecutan perkakasan.');
  return;
}
const mudah = kecil.matches || matchMedia('(pointer:coarse)').matches;
renderer.setPixelRatio(Math.min(devicePixelRatio, mudah ? 1.75 : 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
pentas.appendChild(renderer.domElement);
renderer.domElement.tabIndex = 0;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, 1, 0.5, 3000);
const hemi = new THREE.HemisphereLight(0xe6f4ff, 0x8a7a5a, 0.62);
const matahari = new THREE.DirectionalLight(0xfff1d6, 0.82);
matahari.castShadow = true;
matahari.shadow.mapSize.set(mudah ? 1024 : 2048, mudah ? 1024 : 2048);
matahari.shadow.bias = -0.0006;
matahari.shadow.normalBias = 0.02;
const ambien = new THREE.AmbientLight(0xffffff, 0.06);
scene.add(hemi, matahari, matahari.target, ambien);

const langit = document.createElement('canvas'); langit.width = 4; langit.height = 256;
const langitTex = new THREE.CanvasTexture(langit);
scene.background = langitTex;
scene.fog = new THREE.Fog(0xcfe9ff, 200, 700);
function lukisLangit(malam){
  const g = langit.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 256);
  if(malam){ gr.addColorStop(0, '#050816'); gr.addColorStop(.55, '#111a3a'); gr.addColorStop(1, '#27305a'); }
  else { gr.addColorStop(0, '#7cc2ff'); gr.addColorStop(.55, '#bfe3ff'); gr.addColorStop(1, '#eef8ff'); }
  g.fillStyle = gr; g.fillRect(0, 0, 4, 256); langitTex.needsUpdate = true;
}
lukisLangit(false);

/* tekstur kongsi */
function kanvas(w, h, fn){ const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy()); return t; }
// 4 x 4 tingkap setiap ulangan: bingkai putih (diwarnakan oleh bahan), kaca gelap
const texTingkap = kanvas(256, 256, (g) => {
  g.fillStyle = '#ffffff'; g.fillRect(0, 0, 256, 256);
  for(let y = 0; y < 4; y++) for(let x = 0; x < 4; x++){
    const gr = g.createLinearGradient(0, y*64 + 12, 0, y*64 + 50);
    gr.addColorStop(0, '#9fb2c8'); gr.addColorStop(1, '#55667c');
    g.fillStyle = gr; g.fillRect(x*64 + 13, y*64 + 12, 38, 38);
    g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(x*64 + 13, y*64 + 12, 38, 4);
  }
});
texTingkap.wrapS = texTingkap.wrapT = THREE.RepeatWrapping;
const texNyala = [0, 1, 2].map(v => {
  const r = rawak(91 + v * 7);
  const t = kanvas(256, 256, g => {
    g.fillStyle = '#000'; g.fillRect(0, 0, 256, 256);
    for(let y = 0; y < 4; y++) for(let x = 0; x < 4; x++) if(r() < .55){
      g.fillStyle = r() < .8 ? '#ffd88a' : '#bfe6ff'; g.fillRect(x*64 + 13, y*64 + 12, 38, 38);
    }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
});
const texCommit = kanvas(256, 128, g => {
  g.fillStyle = '#ffffff'; g.fillRect(0, 0, 256, 128);
  g.fillStyle = '#e2e8f0'; g.fillRect(0, 112, 256, 16);
  g.fillStyle = '#0f172a'; g.font = '700 54px Figtree, Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('commit', 128, 60);
});
const texAir = kanvas(64, 256, g => {
  g.fillStyle = '#7dd3fc'; g.fillRect(0, 0, 64, 256);
  const r = rawak(5);
  for(let i = 0; i < 70; i++){ g.fillStyle = `rgba(255,255,255,${.25 + r() * .5})`; g.fillRect(r() * 64, r() * 256, 2 + r() * 3, 10 + r() * 30); }
});
texAir.wrapS = texAir.wrapT = THREE.RepeatWrapping;

/* geometri & bahan kongsi */
const GEO = {
  kotak: new THREE.BoxGeometry(1, 1, 1),
  daun: new THREE.IcosahedronGeometry(1, 0),
  kon: new THREE.ConeGeometry(1, 1, 7),
  batang: new THREE.CylinderGeometry(.12, .16, 1, 6),
  api: new THREE.ConeGeometry(.42, 1.4, 7, 1, true),
  asap: new THREE.IcosahedronGeometry(.6, 0),
  roda: new THREE.CylinderGeometry(.22, .22, .2, 10),
  awan: new THREE.IcosahedronGeometry(1, 1),
  bulat: new THREE.SphereGeometry(1, 10, 8)
};
GEO.roda.rotateZ(Math.PI / 2);
GEO.kon.translate(0, .5, 0);
GEO.api.translate(0, .7, 0);
const lam = (c, o = {}) => new THREE.MeshLambertMaterial(Object.assign({ color: c }, o));
const MAT = {
  rumput: lam(0x6cb85a), rumputGelap: lam(0x5fae57), tanah: lam(0x9b7651), jalan: lam(0x4a5260), garis: new THREE.MeshBasicMaterial({ color: 0xf8fafc }),
  pejalan: lam(0xe2e5ea), taman: lam(0x74c062), plaza: lam(0xefe6d5), batang: lam(0x8b5a2b),
  daun: [lam(0x4caf50, { flatShading: true }), lam(0x6cc35a, { flatShading: true }), lam(0x3f9d4b, { flatShading: true }), lam(0x9ccc65, { flatShading: true })],
  kren: lam(0xf5a524), krenGelap: lam(0x475569), awan: lam(0xffffff, { flatShading: true }),
  apiO: new THREE.MeshBasicMaterial({ color: 0xff6a00, transparent: true, opacity: .88, depthWrite: false, side: THREE.DoubleSide }),
  apiK: new THREE.MeshBasicMaterial({ color: 0xffc21a, transparent: true, opacity: .92, depthWrite: false, side: THREE.DoubleSide }),
  roda: lam(0x1f2937), cermin: lam(0x1e293b), putih: lam(0xffffff), kotakKargo: lam(0xc8923d),
  commitSisi: lam(0xffffff, { map: texCommit }),
  merah: new THREE.MeshBasicMaterial({ color: 0xff3b3b }),
  cincin: new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: .55, depthWrite: false }),
  air: new THREE.MeshLambertMaterial({ color: 0xffffff, map: texAir, transparent: true, opacity: .88, emissive: 0x0b4f7a, emissiveIntensity: .25 }),
  kolam: lam(0x4fb6ea, { emissive: 0x0b3f63, emissiveIntensity: .2 }),
  tiang: lam(0x334155), lampu: new THREE.MeshBasicMaterial({ color: 0xfff1c1 }),
  batu: lam(0xffffff, { vertexColors: true, flatShading: true }),
  bangku: lam(0xa16207)
};

/* ---------- kawalan kamera ---------- */
const kam = { theta: .75, phi: .98, r: 120, sasaran: new THREE.Vector3(), mahu: { theta: .75, phi: .98, r: 120, sasaran: new THREE.Vector3() } };
let rMin = 14, rMax = 400, terbiar = 0, ikut = null, kunciPusing = false;
function letakKamera(dt){
  const k = 1 - Math.pow(.0015, dt);
  kam.theta = lerp(kam.theta, kam.mahu.theta, k);
  kam.phi = lerp(kam.phi, kam.mahu.phi, k);
  kam.r = lerp(kam.r, kam.mahu.r, k);
  kam.sasaran.lerp(kam.mahu.sasaran, k);
  const sp = Math.sin(kam.phi);
  camera.position.set(kam.sasaran.x + kam.r * sp * Math.sin(kam.theta), kam.sasaran.y + kam.r * Math.cos(kam.phi), kam.sasaran.z + kam.r * sp * Math.cos(kam.theta));
  camera.lookAt(kam.sasaran);
}
function fokus(pos, r, theta){
  kam.mahu.sasaran.copy(pos); kam.mahu.r = Math.max(rMin, Math.min(rMax, r));
  if(theta !== undefined) kam.mahu.theta = theta;
}
const penuding = new Map();
let seretAwal = null, jarakCubit = 0, tengahLama = null;
function anjak(dx, dy){
  const s = kam.r * .0016;
  const kanan = new THREE.Vector3(Math.cos(kam.theta), 0, -Math.sin(kam.theta));
  const depan = new THREE.Vector3(-Math.sin(kam.theta), 0, -Math.cos(kam.theta));
  kam.mahu.sasaran.addScaledVector(kanan, -dx * s).addScaledVector(depan, dy * s);
  const had = pulau.R * 1.2, v = kam.mahu.sasaran;
  const d = Math.hypot(v.x, v.z); if(d > had){ v.x *= had / d; v.z *= had / d; }
}
renderer.domElement.addEventListener('pointerdown', e => {
  renderer.domElement.setPointerCapture(e.pointerId);
  penuding.set(e.pointerId, { x: e.clientX, y: e.clientY, butang: e.button, shift: e.shiftKey });
  if(penuding.size === 1) seretAwal = { x: e.clientX, y: e.clientY, t: performance.now() };
  if(penuding.size === 2){ const [a, b] = [...penuding.values()]; jarakCubit = Math.hypot(a.x - b.x, a.y - b.y); tengahLama = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }; seretAwal = null; }
  terbiar = 0;
});
renderer.domElement.addEventListener('pointermove', e => {
  const p = penuding.get(e.pointerId);
  if(!p){ tudingHover(e); return; }
  const dx = e.clientX - p.x, dy = e.clientY - p.y;
  p.x = e.clientX; p.y = e.clientY; terbiar = 0;
  if(penuding.size === 1){
    if(seretAwal && Math.hypot(e.clientX - seretAwal.x, e.clientY - seretAwal.y) > 6) henti(false);
    if(p.butang === 2 || p.shift){ anjak(dx, dy); }
    else { kam.mahu.theta -= dx * .006; kam.mahu.phi = Math.max(.22, Math.min(1.42, kam.mahu.phi - dy * .005)); }
  } else if(penuding.size === 2){
    const [a, b] = [...penuding.values()];
    const j = Math.hypot(a.x - b.x, a.y - b.y), t = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    if(jarakCubit > 0) kam.mahu.r = Math.max(rMin, Math.min(rMax, kam.mahu.r * jarakCubit / j));
    if(tengahLama) anjak(t.x - tengahLama.x, t.y - tengahLama.y);
    jarakCubit = j; tengahLama = t; henti(false);
  }
});
function lepas(e){
  const p = penuding.get(e.pointerId);
  if(p && penuding.size === 1 && seretAwal && Math.hypot(e.clientX - seretAwal.x, e.clientY - seretAwal.y) < 6 && performance.now() - seretAwal.t < 600) ketik(e);
  penuding.delete(e.pointerId);
  if(penuding.size < 2){ jarakCubit = 0; tengahLama = null; }
  if(penuding.size === 1) seretAwal = null;
}
renderer.domElement.addEventListener('pointerup', lepas);
renderer.domElement.addEventListener('pointercancel', lepas);
renderer.domElement.addEventListener('contextmenu', e => e.preventDefault());
renderer.domElement.addEventListener('wheel', e => {
  e.preventDefault(); terbiar = 0;
  kam.mahu.r = Math.max(rMin, Math.min(rMax, kam.mahu.r * Math.exp(e.deltaY * (e.ctrlKey ? .01 : .0012))));
}, { passive: false });
addEventListener('keydown', e => {
  if(e.target.closest && e.target.closest('input')) return;
  if(e.key === 'Escape'){ tutupRepo(); henti(true); }
  const l = { ArrowLeft: [.12, 0], ArrowRight: [-.12, 0], ArrowUp: [0, -.06], ArrowDown: [0, .06] }[e.key];
  if(l){ kam.mahu.theta += l[0]; kam.mahu.phi = Math.max(.22, Math.min(1.42, kam.mahu.phi + l[1])); terbiar = 0; }
  if(e.key === '+' || e.key === '=') kam.mahu.r = Math.max(rMin, kam.mahu.r * .85);
  if(e.key === '-') kam.mahu.r = Math.min(rMax, kam.mahu.r * 1.18);
});

/* ---------- binaan kota ---------- */
const LOT = 7.2, JALAN = 2.8, P = LOT + JALAN, LORONG = .68;
const kota = new THREE.Group(); scene.add(kota);
let pulau = { R: 40 }, grid = null, bangunan = [], kenderaan = [], animasi = [], api = [], kren = [], lampuMerah = [], cincin = [], awan = [], pulauKecil = [], tween = [];
let sampah = [], label = [], petaRepo = new Map(), monumen = null, airTerjun = null, bintangLangit = null, lampuJalan = null, malam = false;
let dataKini = null, barisanPush = [], indeksPush = 0, pushSegera = [], terpilih = null, sorot = null, skalaLabel = 1;
const simpan = o => (sampah.push(o), o);

function kosongkan(){
  scene.remove(kota);
  for(const o of sampah){ if(o.dispose) o.dispose(); }
  sampah = []; kota.clear();
  bangunan = []; kenderaan = []; animasi = []; api = []; kren = []; lampuMerah = []; cincin = []; awan = []; pulauKecil = []; tween = []; label = []; pushSegera = [];
  petaRepo = new Map(); monumen = null; airTerjun = null; terpilih = null; sorot = null; ikut = null;
  scene.add(kota);
}

function pastel(hex, k){ return new THREE.Color(hex).lerp(new THREE.Color(0xffffff), k); }
function geoKotakUV(w, h, d, tw, th){
  const g = new THREE.BoxGeometry(w, h, d), uv = g.attributes.uv;
  for(let f = 0; f < 6; f++) for(let k = 0; k < 4; k++){
    const i = f * 4 + k;
    if(f === 2 || f === 3){ uv.setXY(i, .02, .02); continue; }
    const span = f < 2 ? d : w;
    uv.setXY(i, uv.getX(i) * span / tw, uv.getY(i) * h / th);
  }
  g.translate(0, h / 2, 0);
  return simpan(g);
}
function geoSilinderUV(r, h, tw, th){
  const g = new THREE.CylinderGeometry(r, r, h, 18, 1), uv = g.attributes.uv, n = g.attributes.normal;
  for(let i = 0; i < uv.count; i++){
    if(Math.abs(n.getY(i)) > .9) uv.setXY(i, .02, .02);
    else uv.setXY(i, uv.getX(i) * Math.PI * 2 * r / tw, uv.getY(i) * h / th);
  }
  g.translate(0, h / 2, 0);
  return simpan(g);
}
function mesh(geo, mat, x = 0, y = 0, z = 0, sx = 1, sy = 1, sz = 1, induk = kota, bayang = true){
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z); m.scale.set(sx, sy, sz);
  m.castShadow = bayang; m.receiveShadow = true;
  induk.add(m); return m;
}
function buatLabel(teks, opsi = {}){
  const fs = 44, pad = 22, c = document.createElement('canvas'), g = c.getContext('2d');
  g.font = `700 ${fs}px Figtree, Arial, sans-serif`;
  const w = Math.min(900, Math.ceil(g.measureText(teks).width) + pad * 2 + (opsi.titik ? 30 : 0)), h = fs + pad * 1.4;
  c.width = w; c.height = h;
  g.font = `700 ${fs}px Figtree, Arial, sans-serif`;
  g.fillStyle = opsi.latar || 'rgba(255,255,255,.96)';
  const r = 18; g.beginPath(); g.moveTo(r, 0); g.arcTo(w, 0, w, h, r); g.arcTo(w, h, 0, h, r); g.arcTo(0, h, 0, 0, r); g.arcTo(0, 0, w, 0, r); g.fill();
  if(opsi.titik){ g.fillStyle = opsi.titik; g.beginPath(); g.arc(pad + 9, h / 2, 9, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = opsi.warna || '#1d4ed8'; g.textBaseline = 'middle';
  g.fillText(teks, pad + (opsi.titik ? 30 : 0), h / 2 + 2, w - pad * 2);
  const t = simpan(new THREE.CanvasTexture(c)); t.anisotropy = 4;
  const m = simpan(new THREE.SpriteMaterial({ map: t, depthWrite: false, transparent: true }));
  const s = new THREE.Sprite(m);
  const skala = opsi.skala || 1;
  s.userData.w = w / h * 1.15 * skala; s.userData.h = 1.15 * skala;
  s.scale.set(s.userData.w * skalaLabel, s.userData.h * skalaLabel, 1);
  s.renderOrder = 5;
  label.push(s);
  return s;
}
function pokok(x, z, s, r, induk = kota){
  const g = new THREE.Group(); g.position.set(x, 0, z); induk.add(g);
  const tinggi = 1.1 * s;
  mesh(GEO.batang, MAT.batang, 0, tinggi / 2, 0, s, tinggi, s, g);
  const jenis = r();
  if(jenis < .35){ mesh(GEO.kon, MAT.daun[2], 0, tinggi * .7, 0, s * 1.1, s * 2.6, s * 1.1, g); }
  else {
    const m = MAT.daun[Math.floor(r() * 4)];
    mesh(GEO.daun, m, 0, tinggi + s * .7, 0, s * 1.05, s * 1.0, s * 1.05, g);
    if(r() < .5) mesh(GEO.daun, m, s * .45, tinggi + s * .35, s * .2, s * .7, s * .7, s * .7, g);
  }
  g.rotation.y = r() * 6.28;
  return g;
}

function binaPulau(R, rnd){
  // rumput atas, lapisan tanah, dan batu terapung berjejal di bawah
  const atas = mesh(simpan(new THREE.CylinderGeometry(R, R * .985, 1.2, 72)), MAT.rumput, 0, -.6, 0, 1, 1, 1, kota, false);
  atas.receiveShadow = true;
  mesh(simpan(new THREE.CylinderGeometry(R * .985, R * .93, 2.4, 72)), MAT.tanah, 0, -2.4, 0, 1, 1, 1, kota, false);
  const dalam = R * 1.05;
  const kon = simpan(new THREE.ConeGeometry(R * .93, dalam, 30, 7));
  kon.rotateX(Math.PI); kon.translate(0, -3.6 - dalam / 2, 0);
  const pos = kon.attributes.position, warna = [];
  const cTanah = new THREE.Color(0x8d6a48), cBatu = new THREE.Color(0x77736f), cGelap = new THREE.Color(0x58534f);
  for(let i = 0; i < pos.count; i++){
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    const t = Math.min(1, (-3.6 - y) / dalam); // 0 atas, 1 hujung
    if(t > .02 && t < .98){
      const h = rawak(cincang(Math.round(x * 10) + ',' + Math.round(y * 10) + ',' + Math.round(z * 10)));
      const k = .82 + h() * .36;
      pos.setX(i, x * k); pos.setZ(i, z * k); pos.setY(i, y + (h() - .5) * 2.4);
    }
    const c = cTanah.clone().lerp(t > .45 ? cGelap : cBatu, Math.min(1, t * 1.6));
    warna.push(c.r, c.g, c.b);
  }
  kon.setAttribute('color', new THREE.Float32BufferAttribute(warna, 3));
  kon.computeVertexNormals();
  const bawah = mesh(kon, MAT.batu, 0, 0, 0, 1, 1, 1, kota, false);
  bawah.receiveShadow = false;
  // gugusan batu tergantung
  const matBatuGantung = simpan(lam(0x6f6a64, { flatShading: true }));
  for(let i = 0; i < 9; i++){
    const a = rnd() * 6.28, d = R * (.3 + rnd() * .55), s = 2 + rnd() * 4;
    mesh(GEO.daun, matBatuGantung, Math.cos(a) * d, -6 - rnd() * R * .45, Math.sin(a) * d, s, s * 1.6, s, kota, false);
  }
}

function binaAirTerjun(R, halfD, rnd){
  const z0 = halfD + JALAN / 2 + 1.2, panjang = R - z0 + .5;
  if(panjang < 3) return;
  const x0 = (rnd() - .5) * 8;
  // sungai kecil ke tebing
  const sungai = mesh(simpan(new THREE.PlaneGeometry(3, panjang)), MAT.kolam, x0, .03, z0 + panjang / 2, 1, 1, 1, kota, false);
  sungai.rotation.x = -Math.PI / 2;
  const kolam = mesh(simpan(new THREE.CircleGeometry(2.6, 20)), MAT.kolam, x0, .035, z0 + .6, 1, 1, 1, kota, false);
  kolam.rotation.x = -Math.PI / 2;
  // tirai air jatuh
  const tinggiJatuh = R * .75;
  const tirai = mesh(simpan(new THREE.PlaneGeometry(3, tinggiJatuh, 1, 6)), MAT.air, x0, -tinggiJatuh / 2, R * .99 + .3, 1, 1, 1, kota, false);
  tirai.castShadow = false;
  // kabus di kaki air terjun
  const kabus = new THREE.Group(); kabus.position.set(x0, -tinggiJatuh, R * .99 + .3); kota.add(kabus);
  const mk = simpan(new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .55, depthWrite: false }));
  for(let i = 0; i < 6; i++) mesh(GEO.awan, mk, (rnd() - .5) * 3, rnd() * 1.5, (rnd() - .5) * 2, 1 + rnd(), .8 + rnd() * .6, 1 + rnd(), kabus, false);
  airTerjun = { kabus };
}

function binaAwan(R, rnd){
  for(let i = 0; i < 14; i++){
    const g = new THREE.Group();
    const a = rnd() * 6.28, d = R * (1.25 + rnd() * 1.4), y = -R * .5 + rnd() * R * .75;
    g.position.set(Math.cos(a) * d, y, Math.sin(a) * d);
    const n = 3 + Math.floor(rnd() * 4), s = 2.5 + rnd() * 3.5;
    for(let k = 0; k < n; k++) mesh(GEO.awan, MAT.awan, (k - n / 2) * s * .9, (rnd() - .3) * s * .5, (rnd() - .5) * s, s * (.9 + rnd() * .6), s * (.7 + rnd() * .4), s * (.9 + rnd() * .5), g, false);
    kota.add(g);
    awan.push({ g, a, d, y, laju: (.004 + rnd() * .01) * (rnd() < .5 ? 1 : -1) });
  }
  // pulau kecil terapung
  for(let i = 0; i < 4; i++){
    const g = new THREE.Group(), a = i * 1.57 + rnd(), d = R * (1.25 + rnd() * .35), s = 2 + rnd() * 2.5;
    g.position.set(Math.cos(a) * d, -4 + rnd() * 10, Math.sin(a) * d); kota.add(g);
    mesh(simpan(new THREE.CylinderGeometry(s, s * .9, .6, 10)), MAT.rumput, 0, -.3, 0, 1, 1, 1, g, false);
    const b = mesh(GEO.kon, MAT.batu, 0, -.6, 0, s * .9, s * 2, s * .9, g, false); b.rotation.x = Math.PI;
    b.material = simpan(lam(0x7a6450, { flatShading: true }));
    pokok(0, 0, .8 + rnd() * .5, rnd, g);
    pulauKecil.push({ g, y: g.position.y, fasa: rnd() * 6.28 });
  }
}

function binaBintang(){
  const n = 700, p = new Float32Array(n * 3), r = rawak(3);
  for(let i = 0; i < n; i++){
    const u = r() * 2 - 1, a = r() * 6.28, s = Math.sqrt(1 - u * u), d = 1400;
    p[i*3] = Math.cos(a) * s * d; p[i*3 + 1] = Math.abs(u) * d * .9 + 60; p[i*3 + 2] = Math.sin(a) * s * d;
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3));
  bintangLangit = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffffff, size: 2.2, sizeAttenuation: false, fog: false, transparent: true, opacity: .9 }));
  bintangLangit.visible = false; scene.add(bintangLangit);
}
binaBintang();

function kepentingan(r){
  return r.bintang * 6 + Math.log2(1 + r.saiz) + (r.cabang ? -6 : 0) + (r.arkib ? -4 : 0) + Math.max(0, 6 - hariSejak(r.push) / 20);
}

function binaKota(data){
  kosongkan();
  const rnd = rawak(cincang(data.user.login));
  const repos = data.repos.slice().sort((a, b) => kepentingan(b) - kepentingan(a)).slice(0, 120);
  const n = repos.length;
  const taman = Math.max(2, Math.round(n * .15));
  const lot = n + 1 + taman;
  const cols = Math.max(3, Math.ceil(Math.sqrt(lot * 1.15)));
  const rows = Math.max(3, Math.ceil(lot / cols));
  const halfW = cols * P / 2, halfD = rows * P / 2;
  const R = Math.hypot(halfW, halfD) + JALAN + 5;
  pulau = { R, cols, rows, halfW, halfD };
  grid = { cols, rows };
  rMin = 12; rMax = R * 5;

  binaPulau(R, rnd);

  // jalan
  for(let r = 0; r <= rows; r++){
    const z = (r - rows / 2) * P;
    const m = mesh(GEO.kotak, MAT.jalan, 0, .02, z, cols * P + JALAN, .04, JALAN, kota, false); m.castShadow = false;
  }
  for(let c = 0; c <= cols; c++){
    const x = (c - cols / 2) * P;
    const m = mesh(GEO.kotak, MAT.jalan, x, .021, 0, JALAN, .04, rows * P + JALAN, kota, false); m.castShadow = false;
  }
  // garisan putus-putus
  const bilGaris = (rows + 1) * cols * 3 + (cols + 1) * rows * 3;
  const garis = new THREE.InstancedMesh(GEO.kotak, MAT.garis, bilGaris);
  const tmp = new THREE.Object3D(); let gi = 0;
  for(let r = 0; r <= rows; r++) for(let c = 0; c < cols; c++) for(let k = 0; k < 3; k++){
    tmp.position.set((c - cols / 2) * P + JALAN / 2 + (k + .5) * LOT / 3, .05, (r - rows / 2) * P); tmp.scale.set(1.1, .01, .14); tmp.rotation.set(0, 0, 0); tmp.updateMatrix(); garis.setMatrixAt(gi++, tmp.matrix);
  }
  for(let c = 0; c <= cols; c++) for(let r = 0; r < rows; r++) for(let k = 0; k < 3; k++){
    tmp.position.set((c - cols / 2) * P, .05, (r - rows / 2) * P + JALAN / 2 + (k + .5) * LOT / 3); tmp.scale.set(.14, .01, 1.1); tmp.updateMatrix(); garis.setMatrixAt(gi++, tmp.matrix);
  }
  garis.receiveShadow = true; kota.add(garis);

  // lampu jalan di persimpangan
  const nodes = (cols + 1) * (rows + 1);
  const tiang = new THREE.InstancedMesh(GEO.batang, MAT.tiang, nodes), kepala = new THREE.InstancedMesh(GEO.bulat, MAT.lampu, nodes);
  let li = 0;
  for(let c = 0; c <= cols; c++) for(let r = 0; r <= rows; r++){
    const x = (c - cols / 2) * P + JALAN / 2 + .3, z = (r - rows / 2) * P + JALAN / 2 + .3;
    tmp.position.set(x, 1.4, z); tmp.scale.set(.6, 2.8, .6); tmp.updateMatrix(); tiang.setMatrixAt(li, tmp.matrix);
    tmp.position.set(x, 2.9, z); tmp.scale.set(.22, .22, .22); tmp.updateMatrix(); kepala.setMatrixAt(li, tmp.matrix); li++;
  }
  tiang.castShadow = true; kota.add(tiang, kepala); lampuJalan = kepala;

  // susun lot dari tengah ke luar
  const lots = [];
  for(let i = 0; i < cols; i++) for(let j = 0; j < rows; j++){
    const x = (i + .5 - cols / 2) * P, z = (j + .5 - rows / 2) * P;
    lots.push({ i, j, x, z, d: Math.hypot(x, z * 1.05) + (rnd() * .01) });
  }
  lots.sort((a, b) => a.d - b.d);
  binaPlaza(lots[0], data.user, rnd);
  repos.forEach((r, k) => binaBangunan(r, lots[k + 1], data, rnd, k));
  for(let k = n + 1; k < lots.length; k++) binaTaman(lots[k], rnd);

  // pokok di pinggir pulau
  const bilPokok = Math.round(R * 2.2);
  for(let k = 0; k < bilPokok; k++){
    const a = rnd() * 6.28, d = R * (.55 + rnd() * .42);
    const x = Math.cos(a) * d, z = Math.sin(a) * d;
    if(Math.abs(x) < halfW + JALAN && Math.abs(z) < halfD + JALAN) continue;
    if(z > halfD && Math.abs(x) < 6) continue;
    if(Math.hypot(x, z) > R - 1.4) continue;
    pokok(x, z, .8 + rnd() * .8, rnd);
  }
  binaAirTerjun(R, halfD, rnd);
  binaAwan(R, rnd);

  // cahaya & bayang ikut saiz pulau
  matahari.position.set(R * .9, R * 1.6, R * .55);
  const sc = matahari.shadow.camera; sc.left = -R; sc.right = R; sc.top = R; sc.bottom = -R; sc.near = 1; sc.far = R * 5; sc.updateProjectionMatrix();
  scene.fog.near = R * 2.4; scene.fog.far = R * 7;

  // kenderaan
  binaJalanGraf();
  const pushes = data.events.filter(e => e.jenis === 'PushEvent' && petaRepo.has(e.repo));
  barisanPush = pushes.slice(0, 40); indeksPush = 0;
  const bilTrak = Math.min(barisanPush.length, mudah ? 5 : 7);
  for(let k = 0; k < bilTrak; k++) kenderaan.push(new Trak(k * 2.2));
  const bilKereta = Math.min(10, 3 + Math.round(n / 4));
  for(let k = 0; k < bilKereta; k++) kenderaan.push(new Kereta(rnd));

  // kamera mula
  kam.mahu.r = kam.r = R * 2.5; kam.mahu.phi = kam.phi = .95; kam.mahu.theta = kam.theta = .7;
  kam.mahu.sasaran.set(0, 0, 0); kam.sasaran.set(0, 0, 0);
  kam.mahu.r = jarakAwal();
  setMalam(malam);
}

// skrin potret (telefon) perlu kamera lebih jauh supaya seluruh pulau muat
const jarakAwal = () => pulau.R * 2.05 * Math.max(1, .85 / camera.aspect);
function binaPlaza(lot, user, rnd){
  mesh(GEO.kotak, MAT.plaza, lot.x, .14, lot.z, LOT, .28, LOT, kota, false);
  const g = new THREE.Group(); g.position.set(lot.x, .28, lot.z); kota.add(g);
  // air pancut
  mesh(simpan(new THREE.CylinderGeometry(2.8, 2.9, .5, 28)), MAT.pejalan, 0, .25, 0, 1, 1, 1, g);
  const air = mesh(simpan(new THREE.CylinderGeometry(2.45, 2.45, .1, 28)), MAT.kolam, 0, .48, 0, 1, 1, 1, g, false);
  air.receiveShadow = false;
  mesh(GEO.kotak, MAT.pejalan, 0, 1.5, 0, 1, 2.4, 1, g);
  // panel avatar berputar
  const papan = new THREE.Group(); papan.position.y = 4.4; g.add(papan);
  const matAv = simpan(lam(0xffffff));
  const bingkai = simpan(lam(0x1e293b));
  const geoP = simpan(new THREE.BoxGeometry(3.4, 3.4, .3));
  const panel = new THREE.Mesh(geoP, [bingkai, bingkai, bingkai, bingkai, matAv, matAv]); panel.castShadow = true; papan.add(panel);
  const pemuat = new THREE.TextureLoader(); pemuat.setCrossOrigin('anonymous');
  if(user.avatar){
    pemuat.load(user.avatar + (user.avatar.includes('?') ? '&' : '?') + 's=256', t => { simpan(t); matAv.map = t; matAv.needsUpdate = true; },
      undefined, () => avatarHuruf(matAv, user.login));
  } else avatarHuruf(matAv, user.login);
  const l = buatLabel('@' + user.login, { warna: '#ffffff', latar: 'rgba(124,58,237,.95)', skala: 1.2 });
  l.position.set(0, 7.2, 0); g.add(l);
  monumen = { papan, g };
  for(const [dx, dz] of [[-2.9, -2.9], [2.9, -2.9], [-2.9, 2.9], [2.9, 2.9]]) pokok(dx, dz, .7, rnd, g);
}
function avatarHuruf(mat, login){
  const t = kanvas(256, 256, g => { g.fillStyle = '#7c3aed'; g.fillRect(0, 0, 256, 256); g.fillStyle = '#fff'; g.font = '800 140px Figtree, Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText((login[0] || '?').toUpperCase(), 128, 140); });
  simpan(t); mat.map = t; mat.needsUpdate = true;
}

function binaTaman(lot, rnd){
  mesh(GEO.kotak, MAT.taman, lot.x, .12, lot.z, LOT, .24, LOT, kota, false);
  const g = new THREE.Group(); g.position.set(lot.x, .24, lot.z); kota.add(g);
  const bil = 3 + Math.floor(rnd() * 4);
  for(let k = 0; k < bil; k++) pokok((rnd() - .5) * (LOT - 1.6), (rnd() - .5) * (LOT - 1.6), .6 + rnd() * .7, rnd, g);
  if(rnd() < .5){
    const k = mesh(simpan(new THREE.CircleGeometry(1.3 + rnd(), 16)), MAT.kolam, (rnd() - .5) * 2, .02, (rnd() - .5) * 2, 1, 1, 1, g, false);
    k.rotation.x = -Math.PI / 2;
  } else {
    mesh(GEO.kotak, MAT.bangku, 0, .3, 0, 1.6, .15, .5, g);
  }
}

function binaBangunan(r, lot, data, rnd, kedudukan){
  const h0 = cincang(r.nama), hr = rawak(h0);
  const pr = data.pr ? (data.pr[r.penuh] || 0) : 0;
  const isu = Math.max(0, r.isu - pr);
  const tinggi = Math.min(46, 2.6 + 3.4 * Math.log2(1 + r.bintang) + .6 * Math.log2(1 + r.saiz / 250) + (r.cabang ? -1 : 0));
  const lebar = Math.min(LOT - 1.4, 3 + Math.min(2.2, Math.log10(1 + r.saiz) / 2.2));
  const dalam = Math.min(LOT - 1.4, lebar * (.75 + hr() * .35));
  const aktif = hariSejak(r.push) <= 14 && !r.arkib;

  mesh(GEO.kotak, MAT.pejalan, lot.x, .13, lot.z, LOT, .26, LOT, kota, false);
  const g = new THREE.Group(); g.position.set(lot.x, .26, lot.z); g.rotation.y = Math.floor(hr() * 4) * Math.PI / 2 * (r.cabang ? 1 : 0); kota.add(g);
  const asas = r.arkib ? new THREE.Color(0xb6bcc6) : pastel(warnaBahasa(r.bahasa), r.cabang ? .55 : .42);
  const mat = simpan(lam(asas, { map: texTingkap, emissive: 0xffd27a, emissiveMap: texNyala[h0 % 3], emissiveIntensity: 0 }));
  const matBumbung = simpan(lam(asas.clone().multiplyScalar(.72)));
  const badan = [];
  let atas = tinggi, atap = tinggi;
  const TW = 1.35 * 4, TH = 1.75 * 4;

  if(r.cabang){
    // rumah fork dengan bumbung pelana
    const ht = Math.max(2.4, tinggi * .7);
    badan.push(mesh(geoKotakUV(lebar, ht, dalam, TW, TH), mat, 0, 0, 0, 1, 1, 1, g));
    const bumbung = mesh(GEO.kon, simpan(lam(0xb45309, { flatShading: true })), 0, ht, 0, lebar * .78, 1.8, dalam * .78, g);
    bumbung.geometry = simpan(new THREE.ConeGeometry(1, 1, 4)); bumbung.geometry.translate(0, .5, 0); bumbung.rotation.y = Math.PI / 4;
    atas = ht + 1.8; atap = ht + .7;
  } else {
    const gaya = tinggi > 9 ? h0 % 3 : (h0 % 2 ? 0 : 1);
    if(gaya === 2){
      const rad = lebar / 2;
      badan.push(mesh(geoSilinderUV(rad, tinggi, TW, TH), mat, 0, 0, 0, 1, 1, 1, g));
      mesh(simpan(new THREE.CylinderGeometry(rad * 1.08, rad * 1.08, .4, 18)), matBumbung, 0, tinggi + .2, 0, 1, 1, 1, g);
      atas = tinggi + .4;
    } else if(gaya === 1 && tinggi > 5){
      const h1 = tinggi * .58, h2 = tinggi - h1;
      badan.push(mesh(geoKotakUV(lebar, h1, dalam, TW, TH), mat, 0, 0, 0, 1, 1, 1, g));
      mesh(GEO.kotak, matBumbung, 0, h1 + .12, 0, lebar + .2, .24, dalam + .2, g);
      badan.push(mesh(geoKotakUV(lebar * .66, h2, dalam * .66, TW, TH), mat, 0, h1 + .24, 0, 1, 1, 1, g));
      mesh(GEO.kotak, matBumbung, 0, tinggi + .36, 0, lebar * .66 + .2, .24, dalam * .66 + .2, g);
      atas = tinggi + .48;
    } else {
      badan.push(mesh(geoKotakUV(lebar, tinggi, dalam, TW, TH), mat, 0, 0, 0, 1, 1, 1, g));
      mesh(GEO.kotak, matBumbung, 0, tinggi + .15, 0, lebar + .25, .3, dalam + .25, g);
      atas = tinggi + .3;
    }
    atap = atas;
    // tangki air / antena
    if(hr() < .45 && !isu) mesh(simpan(new THREE.CylinderGeometry(.45, .45, .9, 10)), MAT.krenGelap, lebar * .2, atas + .45, -dalam * .2, 1, 1, 1, g);
    if(r.bintang >= 3 || tinggi > 16){
      mesh(GEO.batang, MAT.tiang, 0, atas + 1.2, 0, .5, 2.4, .5, g);
      const lm = mesh(GEO.bulat, MAT.merah.clone(), 0, atas + 2.5, 0, .16, .16, .16, g, false);
      simpan(lm.material); lampuMerah.push({ m: lm, fasa: hr() * 6 });
      atas += 2.6;
    }
  }

  // api di bumbung untuk isu terbuka
  let tinggiLabel = atas;
  if(isu > 0){
    const ga = new THREE.Group(); ga.position.y = atap; g.add(ga);
    const bil = Math.min(4 + isu * 2, 14), sebar = Math.min(lebar, dalam) * .36;
    const lid = [];
    for(let k = 0; k < bil; k++){
      const a = hr() * 6.28, d = Math.sqrt(hr()) * sebar;
      const f = mesh(GEO.api, k % 3 ? MAT.apiO : MAT.apiK, Math.cos(a) * d, 0, Math.sin(a) * d, 1, 1, 1, ga, false);
      f.receiveShadow = false; lid.push({ m: f, fasa: hr() * 6.28, s: .7 + hr() * .7 + Math.min(1, isu * .08) });
    }
    const asap = [];
    for(let k = 0; k < 4; k++){
      const m = simpan(new THREE.MeshLambertMaterial({ color: 0x6b7280, transparent: true, opacity: .5, depthWrite: false }));
      const s = mesh(GEO.asap, m, (hr() - .5) * sebar, 0, (hr() - .5) * sebar, 1, 1, 1, ga, false); asap.push({ m: s, fasa: k / 4 });
    }
    let cahaya = null;
    if(api.length < 6){ cahaya = new THREE.PointLight(0xff7a1a, 0, 12, 2); cahaya.position.y = 1.2; ga.add(cahaya); }
    api.push({ lidah: lid, asap, cahaya, kuat: Math.min(1.6, .6 + isu * .15) });
    tinggiLabel = Math.max(tinggiLabel, atap + 2.2);
  }

  // kren untuk PR terbuka
  const bilKren = Math.min(pr, 3);
  for(let k = 0; k < bilKren; k++){
    const sudut = [[1, 1], [-1, -1], [1, -1]][k];
    const tinggiTiang = 3.5 + Math.min(6, atas * .18);
    const ki = binaKren(tinggiTiang, Math.max(4.5, lebar * 1.2));
    const asasKren = r.cabang ? atap - .7 : atap;
    ki.g.position.set(sudut[0] * lebar * .32, asasKren, sudut[1] * dalam * .32);
    ki.jib.rotation.y = hr() * 6.28;
    g.add(ki.g);
    kren.push({ jib: ki.jib, laju: (.15 + hr() * .2) * (hr() < .5 ? 1 : -1), cangkuk: ki.cangkuk, fasa: hr() * 6 });
    tinggiLabel = Math.max(tinggiLabel, asasKren + tinggiTiang + 1.2);
  }

  // cincin aktif
  let cc = null;
  if(aktif){
    cc = mesh(simpan(new THREE.RingGeometry(LOT * .47, LOT * .53, 40)), MAT.cincin, lot.x, .3, lot.z, 1, 1, 1, kota, false);
    cc.rotation.x = -Math.PI / 2; cc.receiveShadow = false;
    cincin.push({ m: cc, fasa: hr() * 6 });
  }

  // papan tanda
  const papan = buatLabel(r.nama, { titik: r.arkib ? '#94a3b8' : warnaBahasa(r.bahasa), skala: kedudukan < 3 ? 1.15 : 1 });
  papan.position.set(lot.x, .26 + tinggiLabel + 1.4, lot.z);
  papan.visible = kedudukan < (mudah ? 18 : 32);
  kota.add(papan);

  const b = { repo: r, g, mat, badan, lot, atas: atas + .26, atap: atap + .26, tinggi, isu, pr, aktif, papan, labelAsal: papan.visible, kedudukan, lantun: 0 };
  for(const m of badan) m.userData.b = b;
  bangunan.push(b); petaRepo.set(r.penuh, b);
}

function binaKren(tinggi, panjang){
  const g = new THREE.Group();
  mesh(GEO.kotak, MAT.kren, 0, tinggi / 2, 0, .32, tinggi, .32, g);
  for(let y = .6; y < tinggi; y += .9) mesh(GEO.kotak, MAT.krenGelap, 0, y, 0, .4, .06, .4, g, false);
  const jib = new THREE.Group(); jib.position.y = tinggi; g.add(jib);
  mesh(GEO.kotak, MAT.krenGelap, 0, .3, 0, .6, .55, .6, jib);
  mesh(GEO.kotak, MAT.kren, panjang * .42, .7, 0, panjang, .24, .24, jib);
  mesh(GEO.kotak, MAT.kren, -1.1, .7, 0, 2.2, .24, .24, jib);
  mesh(GEO.kotak, MAT.krenGelap, -1.9, .4, 0, .7, .6, .55, jib);
  mesh(GEO.kotak, MAT.kren, 0, 1.4, 0, .16, 1.3, .16, jib);
  const tali = mesh(GEO.kotak, MAT.krenGelap, panjang * .78, -.6, 0, .04, 2.6, .04, jib, false);
  const cangkuk = mesh(GEO.kotak, MAT.kren, panjang * .78, -1.95, 0, .32, .28, .32, jib);
  return { g, jib, cangkuk, tali };
}

/* ---------- jalan sebagai graf ---------- */
let nod = null;
function binaJalanGraf(){
  const { cols, rows } = grid;
  nod = { cols, rows, pos: (c, r) => new THREE.Vector3((c - cols / 2) * P, 0, (r - rows / 2) * P) };
}
function jiran(c, r){ const o = []; if(c > 0) o.push([c - 1, r]); if(c < nod.cols) o.push([c + 1, r]); if(r > 0) o.push([c, r - 1]); if(r < nod.rows) o.push([c, r + 1]); return o; }
function laluan(dari, ke){
  const kunci = (c, r) => c + ',' + r, asal = new Map([[kunci(...dari), null]]), q = [dari];
  while(q.length){
    const cur = q.shift(); if(cur[0] === ke[0] && cur[1] === ke[1]) break;
    const jj = jiran(...cur);
    for(let i = jj.length - 1; i > 0; i--){ const k = Math.floor(Math.random() * (i + 1)); [jj[i], jj[k]] = [jj[k], jj[i]]; }
    for(const nb of jj){ const k = kunci(...nb); if(!asal.has(k)){ asal.set(k, cur); q.push(nb); } }
  }
  const out = []; let cur = ke;
  while(cur){ out.unshift(cur); cur = asal.get(kunci(...cur)); }
  return out;
}
const nodTepi = () => { const c = Math.random() < .5 ? (Math.random() < .5 ? 0 : nod.cols) : Math.floor(Math.random() * (nod.cols + 1)); const r = (c === 0 || c === nod.cols) ? Math.floor(Math.random() * (nod.rows + 1)) : (Math.random() < .5 ? 0 : nod.rows); return [c, r]; };
const nodRawak = () => [Math.floor(Math.random() * (nod.cols + 1)), Math.floor(Math.random() * (nod.rows + 1))];
// titik laluan dengan ofset lorong kiri (pandu sebelah kiri, macam di Malaysia)
function titikLorong(pts){
  const out = [];
  const kiri = d => new THREE.Vector3(d.z, 0, -d.x);
  for(let i = 0; i < pts.length; i++){
    const masuk = i > 0 ? pts[i].clone().sub(pts[i - 1]).normalize() : null;
    const keluar = i < pts.length - 1 ? pts[i + 1].clone().sub(pts[i]).normalize() : null;
    const p = pts[i].clone();
    if(masuk && keluar && masuk.dot(keluar) < .5 && masuk.dot(keluar) > -.5) p.add(kiri(masuk).multiplyScalar(LORONG)).add(kiri(keluar).multiplyScalar(LORONG));
    else p.add(kiri(masuk || keluar || new THREE.Vector3(0, 0, 1)).multiplyScalar(LORONG));
    out.push(p);
  }
  return out;
}

class Kenderaan {
  constructor(laju){ this.g = new THREE.Group(); kota.add(this.g); this.laju = laju; this.pts = []; this.i = 0; this.s = 0; this.tunggu = 0; this.arah = 0; }
  jalan(pts, lepasTiba){
    if(this.g.visible && this.pts.length) pts[0] = this.g.position.clone().setY(0);
    this.pts = pts; this.i = 0; this.s = 0; this.lepasTiba = lepasTiba;
    if(pts.length > 1){ const d = pts[1].clone().sub(pts[0]); if(d.lengthSq() > .01 && !this.g.visible) this.arah = Math.atan2(d.x, d.z); }
  }
  kemas(dt){
    if(this.tunggu > 0){ this.tunggu -= dt; if(this.tunggu <= 0 && this.selepasTunggu) { const f = this.selepasTunggu; this.selepasTunggu = null; f(); } return; }
    if(this.i >= this.pts.length - 1){ if(this.lepasTiba){ const f = this.lepasTiba; this.lepasTiba = null; f(); } return; }
    const a = this.pts[this.i], b = this.pts[this.i + 1], L = a.distanceTo(b);
    this.s += this.laju * dt;
    while(this.s >= L && this.i < this.pts.length - 1){ this.s -= L; this.i++; if(this.i >= this.pts.length - 1) break; }
    const A = this.pts[this.i], B = this.pts[Math.min(this.i + 1, this.pts.length - 1)], LL = Math.max(.0001, A.distanceTo(B));
    const t = this.i >= this.pts.length - 1 ? 1 : Math.min(1, this.s / LL);
    this.g.position.lerpVectors(A, B, t);
    if(LL > .01){ const want = Math.atan2(B.x - A.x, B.z - A.z); this.arah = sudutLerp(this.arah, want, Math.min(1, dt * 8)); }
    this.g.rotation.y = this.arah;
  }
}

function binaBadanKereta(g, warna){
  const m = simpan(lam(warna));
  mesh(GEO.kotak, m, 0, .45, 0, .95, .5, 1.8, g);
  mesh(GEO.kotak, m, 0, .85, -.1, .85, .4, 1.0, g);
  mesh(GEO.kotak, MAT.cermin, 0, .86, .42, .8, .3, .05, g, false);
  for(const [x, z] of [[-.48, .55], [.48, .55], [-.48, -.55], [.48, -.55]]) mesh(GEO.roda, MAT.roda, x, .22, z, 1, 1, 1, g, false);
}
class Kereta extends Kenderaan {
  constructor(rnd){
    super(5.5 + Math.random() * 2);
    binaBadanKereta(this.g, [0xef4444, 0x22c55e, 0xf59e0b, 0x06b6d4, 0xe2e8f0, 0x8b5cf6, 0xf472b6][Math.floor(rnd() * 7)]);
    this.g.scale.setScalar(.85);
    this.dari = nodRawak(); this.g.position.copy(nod.pos(...this.dari));
    this.seterusnya();
  }
  seterusnya(){
    let ke = nodRawak(); if(ke[0] === this.dari[0] && ke[1] === this.dari[1]) ke = [(ke[0] + 1) % (nod.cols + 1), ke[1]];
    const p = laluan(this.dari, ke).map(n => nod.pos(...n)); this.dari = ke;
    this.jalan(titikLorong(p), () => { this.tunggu = Math.random() * 1.5; this.selepasTunggu = () => this.seterusnya(); });
  }
}
class Trak extends Kenderaan {
  constructor(lengah){
    super(4.6);
    const g = this.g;
    const warna = [0x2563eb, 0x1d4ed8, 0x7c3aed, 0x0f766e][Math.floor(Math.random() * 4)];
    const m = simpan(lam(warna));
    mesh(GEO.kotak, MAT.krenGelap, 0, .32, -.1, .9, .2, 2.9, g);
    mesh(GEO.kotak, m, 0, .8, .95, 1.0, .95, .85, g);
    mesh(GEO.kotak, MAT.cermin, 0, .98, 1.38, .86, .42, .04, g, false);
    const sisi = MAT.commitSisi, p = MAT.putih;
    const kargo = new THREE.Mesh(GEO.kotak, [sisi, sisi, p, p, p, p]); kargo.position.set(0, 1.0, -.45); kargo.scale.set(1.1, 1.25, 2.0); kargo.castShadow = true; g.add(kargo);
    for(const [x, z] of [[-.5, .95], [.5, .95], [-.5, -.2], [.5, -.2], [-.5, -1.0], [.5, -1.0]]) mesh(GEO.roda, MAT.roda, x, .22, z, 1, 1, 1, g, false);
    g.scale.setScalar(.9);
    g.visible = false;
    this.tunggu = lengah + .3; this.selepasTunggu = () => this.mula();
  }
  mula(){
    if(!barisanPush.length && !pushSegera.length) return;
    this.push = pushSegera.length ? pushSegera.shift() : barisanPush[indeksPush++ % barisanPush.length];
    const b = petaRepo.get(this.push.repo); if(!b){ this.tunggu = 1; this.selepasTunggu = () => this.mula(); return; }
    this.b = b;
    const dari = nodTepi(); this.g.visible = false; this.pts = [];
    const ke = [b.lot.i, b.lot.j + 1], seb = [b.lot.i + 1, b.lot.j + 1];
    const ns = laluan(dari, ke).map(n => nod.pos(...n));
    const akhir = nod.pos(...ke).lerp(nod.pos(...seb), .5);
    ns.push(akhir);
    const pts = titikLorong(ns);
    this.g.position.copy(pts[0]);
    this.jalan(pts, () => this.hantar());
    this.g.visible = true;
  }
  hantar(){
    const b = this.b;
    // kotak kargo melayang ke bumbung, bangunan melantun
    const kotak = mesh(GEO.kotak, MAT.kotakKargo, 0, 0, 0, .7, .7, .7);
    const dari = this.g.position.clone().setY(1.6), ke = new THREE.Vector3(b.lot.x, b.atap + .5, b.lot.z);
    tween.push({ t: 0, dur: 1.1, kemas: t => { kotak.position.lerpVectors(dari, ke, t); kotak.position.y += Math.sin(t * Math.PI) * 4; kotak.rotation.y = t * 4; kotak.scale.setScalar(.7 * (1 - t * .6)); },
      habis: () => { kota.remove(kotak); b.lantun = 1; } });
    hebahPush(this.push, b);
    this.tunggu = 1.6;
    this.selepasTunggu = () => {
      const mula = [b.lot.i + 1, b.lot.j + 1], keluar = nodTepi();
      const ns = laluan(mula, keluar).map(n => nod.pos(...n));
      const pts = titikLorong(ns);
      this.jalan(pts, () => { this.g.visible = false; this.pts = []; if(ikut === this) ikutTrakLain(); this.tunggu = 2 + Math.random() * 4; this.selepasTunggu = () => this.mula(); });
    };
  }
}

/* ---------- interaksi ---------- */
const sinar = new THREE.Raycaster(), tetikus = new THREE.Vector2();
function cari(e){
  const r = renderer.domElement.getBoundingClientRect();
  tetikus.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  sinar.setFromCamera(tetikus, camera);
  const hit = sinar.intersectObjects(bangunan.flatMap(b => b.badan), false)[0];
  return hit ? hit.object.userData.b : null;
}
let hoverB = null, hoverMasa = 0;
function tudingHover(e){
  const t = performance.now(); if(t - hoverMasa < 60) return; hoverMasa = t;
  const b = cari(e);
  if(b === hoverB) return;
  if(hoverB && hoverB !== terpilih) hoverB.papan.visible = hoverB.labelAsal;
  hoverB = b; pentas.classList.toggle('tuding', !!b);
  if(b) b.papan.visible = true;
}
function ketik(e){
  const b = cari(e);
  if(b) pilih(b, true); else tutupRepo();
}
function pilih(b, gerak){
  if(terpilih && terpilih !== b) terpilih.papan.visible = terpilih.labelAsal;
  terpilih = b; b.papan.visible = true; b.lantun = Math.max(b.lantun, .6);
  if(!sorot){
    sorot = mesh(simpan(new THREE.RingGeometry(LOT * .56, LOT * .64, 4, 1)), simpan(new THREE.MeshBasicMaterial({ color: 0x7c3aed, transparent: true, opacity: .9, depthWrite: false })), 0, .33, 0, 1, 1, 1, kota, false);
    sorot.rotation.set(-Math.PI / 2, 0, Math.PI / 4); sorot.receiveShadow = false;
  }
  sorot.position.set(b.lot.x, .33, b.lot.z); sorot.visible = true;
  if(gerak){ henti(false); fokus(new THREE.Vector3(b.lot.x, b.tinggi * .45, b.lot.z), Math.max(26, b.tinggi * 2.4)); }
  tunjukRepo(b);
}
function tutupRepo(){
  if(terpilih) terpilih.papan.visible = terpilih.labelAsal;
  terpilih = null; if(sorot) sorot.visible = false;
  $('#repoKad').hidden = true; document.body.classList.remove('ada-repo');
}
function tunjukRepo(b){
  const r = b.repo, el = $('#repoKad');
  const tarikh = r.push ? new Date(r.push).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
  el.innerHTML = `
    <div class="kepala-kad"><h2>${r.arkib ? 'Diarkib' : r.cabang ? 'Rumah fork' : 'Bangunan repo'}</h2><button type="button" class="tutup" aria-label="Tutup">×</button></div>
    <div class="badan">
      <h3>${esc(r.nama)}</h3>
      ${r.ket ? `<p>${esc(r.ket)}</p>` : ''}
      <div class="lencana">
        <span><i style="width:9px;height:9px;border-radius:50%;background:${warnaBahasa(r.bahasa)};display:inline-block"></i>${esc(r.bahasa || 'Tiada bahasa')}</span>
        <span>★ ${nf.format(r.bintang)} bintang</span>
        <span>⑂ ${nf.format(r.fork)} fork</span>
        ${b.isu ? `<span class="panas">🔥 ${nf.format(b.isu)} isu terbuka</span>` : '<span>Tiada isu terbuka</span>'}
        ${b.pr ? `<span class="bina">🏗️ ${nf.format(b.pr)} PR terbuka</span>` : ''}
        <span>Push terakhir ${tarikh}${b.aktif ? ' · aktif' : ''}</span>
      </div>
      <div class="butang">
        <a class="utama" href="${esc(r.url)}" target="_blank" rel="noopener">Buka di GitHub</a>
        ${r.laman ? `<a href="${esc(/^https?:\/\//.test(r.laman) ? r.laman : 'https://' + r.laman)}" target="_blank" rel="noopener">Laman</a>` : ''}
      </div>
    </div>`;
  el.querySelector('.tutup').onclick = tutupRepo;
  el.hidden = false; document.body.classList.add('ada-repo');
  if(kecil.matches) sembunyiSuapan();
}

/* ---------- tur, ikut trak, kapsyen ---------- */
let tur = null, kapsyenMasa = 0;
function kapsyen(teks, no, kekal){
  $('#kapsyenTeks').textContent = teks; $('#kapsyenNo').textContent = no || '';
  const k = $('#kapsyen'); k.classList.remove('denyut'); void k.offsetWidth; if(!kurangGerak) k.classList.add('denyut');
  kapsyenMasa = kekal ? Infinity : performance.now() + 6000;
}
function kapsyenAsal(){
  if(!dataKini) return;
  const t = barisanPush.length ? `${barisanPush.length} push sebenar sedang dihantar ke kota @${dataKini.user.login}` : `Kota @${dataKini.user.login}: seret untuk pusing, ketik bangunan untuk butiran`;
  kapsyen(t, '', true);
}
function henti(semua){
  if(tur){ clearTimeout(tur.masa); tur = null; $('#btnTur').setAttribute('aria-pressed', 'false'); $('#btnTur').textContent = 'Tur'; kapsyenAsal(); }
  if(semua !== false || ikut){ if(ikut){ ikut = null; $('#btnTrak').setAttribute('aria-pressed', 'false'); kapsyenAsal(); } }
}
function trakAktif(){ return kenderaan.filter(k => k instanceof Trak && k.g.visible); }
function ikutTrakLain(){
  const t = trakAktif().filter(k => k !== ikut);
  if(!t.length){ ikut = null; $('#btnTrak').setAttribute('aria-pressed', 'false'); return false; }
  ikut = t[Math.floor(Math.random() * t.length)];
  $('#btnTrak').setAttribute('aria-pressed', 'true');
  kam.mahu.r = camera.aspect < 1 ? 40 : 32; kam.mahu.phi = .62; // pandangan tinggi supaya bangunan tidak menghalang trak
  if(ikut.push) kapsyen(`Trak commit ke ${ikut.b.repo.nama}: “${ikut.push.mesej || 'push ke ' + (ikut.push.cawangan || 'cawangan utama')}”`, '', true);
  return true;
}
function mulaTur(){
  henti(true);
  const L = [];
  const tertinggi = bangunan.slice().sort((a, b) => b.repo.bintang - a.repo.bintang || b.tinggi - a.tinggi)[0];
  const terbakar = bangunan.filter(b => b.isu).sort((a, b) => b.isu - a.isu)[0];
  const berkren = bangunan.filter(b => b.pr).sort((a, b) => b.pr - a.pr)[0];
  L.push({ teks: `Profil @${dataKini.user.login} tumbuh jadi kota di atas pulau terapung`, buat: () => { ikut = null; fokus(new THREE.Vector3(), jarakAwal()); kam.mahu.phi = .95; } });
  if(tertinggi) L.push({ teks: `Repo jadi bangunan, bintang menjadikannya tinggi: ${tertinggi.repo.nama} ada ★ ${tertinggi.repo.bintang}`, buat: () => { ikut = null; pilih(tertinggi, false); fokus(new THREE.Vector3(tertinggi.lot.x, tertinggi.tinggi * .45, tertinggi.lot.z), Math.max(28, tertinggi.tinggi * 2.6), kam.theta + .6); } });
  if(barisanPush.length) L.push({ teks: 'Trak commit membawa push sebenar kau', buat: () => { tutupRepo(); ikutTrakLain(); if(ikut && ikut.push) kapsyen(`Trak commit membawa push sebenar: “${ikut.push.mesej || ikut.b.repo.nama}”`, String(L.indexOf(langkahKini) + 1), true); } });
  if(terbakar) L.push({ teks: `Isu terbuka membakar bumbung: ${terbakar.repo.nama} ada ${terbakar.isu} isu`, buat: () => { ikut = null; pilih(terbakar, false); fokus(new THREE.Vector3(terbakar.lot.x, terbakar.atas * .7, terbakar.lot.z), Math.max(24, terbakar.atas * 2.2), kam.theta + .6); } });
  else L.push({ teks: 'Tiada isu terbuka: semua bumbung selamat daripada api', buat: () => { ikut = null; tutupRepo(); fokus(new THREE.Vector3(), pulau.R * 1.4); kam.mahu.phi = .7; } });
  if(berkren) L.push({ teks: `PR terbuka jadi kren: ${berkren.repo.nama} ada ${berkren.pr} PR`, buat: () => { ikut = null; pilih(berkren, false); fokus(new THREE.Vector3(berkren.lot.x, berkren.atas * .8, berkren.lot.z), Math.max(24, berkren.atas * 2.2), kam.theta + .6); } });
  L.push({ teks: 'Cincin biru: repo yang di-push dalam 14 hari lepas', buat: () => { ikut = null; tutupRepo(); fokus(new THREE.Vector3(), pulau.R * 1.3); kam.mahu.phi = .55; } });
  let langkahKini = null;
  let i = 0;
  tur = { L };
  $('#btnTur').setAttribute('aria-pressed', 'true'); $('#btnTur').textContent = 'Henti tur';
  const langkah = () => {
    if(!tur) return;
    if(i >= L.length){ henti(true); tutupRepo(); fokus(new THREE.Vector3(), jarakAwal()); return; }
    langkahKini = L[i]; kapsyen(L[i].teks, String(i + 1), true); L[i].buat(); i++;
    tur.masa = setTimeout(langkah, 6500);
  };
  langkah();
}
function hebahPush(p, b){
  const li = document.querySelector(`#senaraiSuapan li[data-id="${CSS.escape(p.id)}"]`);
  if(li){ li.classList.add('kilat'); setTimeout(() => li.classList.remove('kilat'), 1600); }
  if(ikut && ikut.b === b && ikut.push === p) kapsyen(`Dihantar ke ${b.repo.nama} ✓ ${p.mesej ? '“' + p.mesej + '”' : ''}`, String(p.bil || 1), true);
  else if(!tur && !ikut) kapsyen(`Commit dihantar ke ${b.repo.nama}${p.mesej ? ': “' + p.mesej + '”' : ''}`, String(p.bil || 1));
}

/* ---------- UI data ---------- */
function isiProfil(d, nota){
  const u = d.user, bintang = d.repos.reduce((s, r) => s + r.bintang, 0);
  const pr = d.pr ? Object.values(d.pr).reduce((s, n) => s + n, 0) : 0;
  const isu = bangunan.reduce((s, b) => s + b.isu, 0);
  const push = d.events.filter(e => e.jenis === 'PushEvent').length;
  $('#profil').innerHTML = `
    <div class="orang">
      <img src="${esc(u.avatar)}${u.avatar && u.avatar.includes('?') ? '&' : '?'}s=104" alt="" width="52" height="52" onerror="this.style.visibility='hidden'">
      <div><div class="nama">${esc(u.nama || u.login)}</div><a class="log" href="${esc(u.url)}" target="_blank" rel="noopener">@${esc(u.login)}</a></div>
    </div>
    ${u.bio ? `<p class="bio">${esc(u.bio)}</p>` : ''}
    <div class="statistik">
      <div><b>${ringkasNo(d.repos.length)}</b><span>bangunan</span></div>
      <div><b>${ringkasNo(bintang)}</b><span>bintang</span></div>
      <div><b>${ringkasNo(u.pengikut || 0)}</b><span>pengikut</span></div>
      <div><b>${ringkasNo(push)}</b><span>trak push</span></div>
      <div><b>${ringkasNo(isu)}</b><span>bumbung api</span></div>
      <div><b>${d.pr ? ringkasNo(pr) : '–'}</b><span>kren PR</span></div>
    </div>
    ${nota ? `<p class="nota">${nota}</p>` : ''}`;
}
const IKON = { PushEvent: '🚚', PullRequestEvent: '🏗️', IssuesEvent: '🔥', IssueCommentEvent: '💬', CreateEvent: '🧱', DeleteEvent: '🧹', WatchEvent: '⭐', ForkEvent: '⑂', ReleaseEvent: '🎉', PublicEvent: '🔓', PullRequestReviewEvent: '🔍', MemberEvent: '👥', GollumEvent: '📖' };
function teksAcara(e){
  const repo = `<b>${esc((e.repo || '').split('/').pop())}</b>`;
  const T = { opened: 'dibuka', closed: 'ditutup', reopened: 'dibuka semula', digabung: 'digabung', created: 'dicipta' };
  switch(e.jenis){
    case 'PushEvent': return { t: `Push ${e.bil} commit ke ${repo}`, m: e.mesej || (e.cawangan ? 'cawangan ' + e.cawangan : '') };
    case 'PullRequestEvent': return { t: `PR #${e.no} ${T[e.tindakan] || e.tindakan} di ${repo}`, m: e.tajuk };
    case 'IssuesEvent': return { t: `Isu #${e.no} ${T[e.tindakan] || e.tindakan} di ${repo}`, m: e.tajuk };
    case 'IssueCommentEvent': return { t: `Komen pada #${e.no} di ${repo}`, m: e.tajuk };
    case 'CreateEvent': return { t: e.jenisRef === 'repository' ? `Bina bangunan baharu ${repo}` : `Cipta ${e.jenisRef === 'branch' ? 'cawangan' : e.jenisRef} di ${repo}`, m: e.ref };
    case 'DeleteEvent': return { t: `Padam ${e.jenisRef === 'branch' ? 'cawangan' : e.jenisRef} di ${repo}`, m: e.ref };
    case 'WatchEvent': return { t: `Beri bintang kepada ${repo}`, m: e.repo };
    case 'ForkEvent': return { t: `Fork ${repo}`, m: e.repo };
    case 'ReleaseEvent': return { t: `Keluaran baharu di ${repo}`, m: e.tajuk };
    case 'PullRequestReviewEvent': return { t: `Semak PR #${e.no} di ${repo}`, m: e.tajuk };
    case 'PublicEvent': return { t: `Buka ${repo} kepada umum`, m: '' };
    default: return { t: `${esc(e.jenis.replace('Event', ''))} di ${repo}`, m: '' };
  }
}
function isiSuapan(d){
  const ol = $('#senaraiSuapan');
  const ev = d.events.slice(0, 40);
  if(!ev.length){ ol.innerHTML = '<li class="kosong">Tiada aktiviti awam dalam 90 hari lepas. Trak commit akan muncul sebaik push seterusnya.</li>'; return; }
  ol.innerHTML = ev.map(e => {
    const x = teksAcara(e);
    return `<li data-id="${esc(e.id)}"><span class="ikon" aria-hidden="true">${IKON[e.jenis] || '•'}</span><div class="isi"><div class="tajuk">${x.t}</div>${x.m ? `<div class="msg" title="${esc(x.m)}">${esc(x.m)}</div>` : ''}<time datetime="${esc(e.masa)}">${masaLalu(e.masa)}</time></div></li>`;
  }).join('');
  ol.querySelectorAll('li[data-id]').forEach(li => li.addEventListener('click', () => {
    const e = ev.find(x => x.id === li.dataset.id), b = e && petaRepo.get(e.repo);
    if(b){ henti(true); pilih(b, true); }
  }));
}
function isiBahasa(d){
  const kira = {};
  for(const r of d.repos) if(!r.cabang){ const l = r.bahasa || 'Lain-lain'; kira[l] = (kira[l] || 0) + 1; }
  const top = Object.entries(kira).sort((a, b) => b[1] - a[1]).slice(0, 8);
  $('#bahasa').innerHTML = top.map(([l, n]) => `<span><i style="background:${l === 'Lain-lain' ? '#94a3b8' : warnaBahasa(l)}"></i>${esc(l)} ${n}</span>`).join('');
}

function setMalam(m){
  malam = m;
  document.body.classList.toggle('malam', m);
  $('#btnMalam').setAttribute('aria-pressed', String(m));
  $('#btnMalam').textContent = m ? 'Siang' : 'Malam';
  lukisLangit(m);
  scene.fog.color.set(m ? 0x161e3d : 0xcfe9ff);
  hemi.intensity = m ? .32 : .62; hemi.color.set(m ? 0x8aa4ff : 0xe6f4ff);
  matahari.intensity = m ? .28 : .82; matahari.color.set(m ? 0x9db4ff : 0xfff1d6);
  ambien.intensity = m ? .1 : .06;
  for(const b of bangunan) b.mat.emissiveIntensity = m && !b.repo.arkib ? (b.aktif ? 1.0 : .55) : 0;
  if(bintangLangit) bintangLangit.visible = m;
  MAT.lampu.color.set(m ? 0xffe7a0 : 0xd7dce3);
  MAT.air.emissiveIntensity = m ? .5 : .25;
  document.querySelector('meta[name="theme-color"]').content = m ? '#0b1020' : '#bfe3ff';
}

/* ---------- gelung animasi ---------- */
const jam = new THREE.Clock();
let masa = 0;
function gelung(){
  requestAnimationFrame(gelung);
  const dt = Math.min(.05, jam.getDelta()); masa += dt;
  const gerak = kurangGerak ? .25 : 1;
  terbiar += dt;
  if(!tur && !ikut && terbiar > 6 && !penuding.size && !terpilih) kam.mahu.theta += dt * .045 * gerak;
  if(ikut && ikut.g.visible){ kam.mahu.sasaran.copy(ikut.g.position).setY(1.5); kam.mahu.theta = sudutLerp(kam.mahu.theta, ikut.arah + Math.PI, dt * 1.2); }
  letakKamera(dt);
  for(const k of kenderaan) k.kemas(dt * gerak);
  for(const f of api){
    for(const l of f.lidah){ const s = l.s * (.75 + .3 * Math.sin(masa * 9 + l.fasa) + .15 * Math.sin(masa * 23 + l.fasa * 2)); l.m.scale.set(l.s * .9, s, l.s * .9); l.m.rotation.y += dt * 2; }
    for(const a of f.asap){ const t = (masa * .35 + a.fasa) % 1; a.m.position.y = 1 + t * 5; a.m.scale.setScalar(.5 + t * 1.8); a.m.material.opacity = .45 * (1 - t); }
    if(f.cahaya) f.cahaya.intensity =(malam ? 2.2 : .9) * f.kuat * (.8 + .2 * Math.sin(masa * 13));
  }
  for(const c of kren){ c.jib.rotation.y += dt * c.laju * gerak; }
  for(const l of lampuMerah){ l.m.visible = Math.sin(masa * 3 + l.fasa) > 0; }
  for(const c of cincin){ c.m.material.opacity = .25 + .3 * (.5 + .5 * Math.sin(masa * 2.4 + c.fasa)); }
  for(const a of awan){ a.a += a.laju * dt * gerak; a.g.position.set(Math.cos(a.a) * a.d, a.y + Math.sin(masa * .3 + a.d) * .6, Math.sin(a.a) * a.d); }
  for(const p of pulauKecil){ p.g.position.y = p.y + Math.sin(masa * .6 + p.fasa) * .8; p.g.rotation.y += dt * .05; }
  if(monumen) monumen.papan.rotation.y += dt * .5 * gerak;
  // papan tanda kekal boleh dibaca ketika zum keluar
  const sl = Math.max(1, Math.min(2.6, kam.r / 55));
  if(Math.abs(sl - skalaLabel) > .01){ skalaLabel = sl; for(const l of label){ l.scale.set(l.userData.w * sl, l.userData.h * sl, 1); } }
  if(airTerjun){ texAir.offset.y -= dt * 1.4 * gerak; airTerjun.kabus.children.forEach((c, i) => c.position.y = .6 + Math.sin(masa * 1.5 + i) * .4); }
  for(const b of bangunan){ if(b.lantun > 0){ b.lantun = Math.max(0, b.lantun - dt * 1.6); const s = 1 + Math.sin(b.lantun * Math.PI * 3) * .05 * b.lantun; b.g.scale.set(1 / Math.sqrt(s), s, 1 / Math.sqrt(s)); } }
  for(let i = tween.length - 1; i >= 0; i--){ const w = tween[i]; w.t += dt / w.dur; w.kemas(Math.min(1, w.t)); if(w.t >= 1){ tween.splice(i, 1); w.habis && w.habis(); } }
  if(kapsyenMasa !== Infinity && kapsyenMasa && performance.now() > kapsyenMasa){ kapsyenMasa = 0; kapsyenAsal(); }
  renderer.render(scene, camera);
}
function saiz(){
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false); camera.aspect = w / h;
  camera.fov = w < h ? 55 : 40; camera.updateProjectionMatrix();
}
addEventListener('resize', saiz); saiz();

/* ---------- aliran muat ---------- */
function tunjukRalat(tajuk, teks, butang){
  const el = $('#muatRalat'); el.hidden = false;
  el.innerHTML = `<b>${esc(tajuk)}</b>${esc(teks)}${butang ? '<br><button type="button" id="cubaLagi">' + esc(butang) + '</button>' : ''}`;
  $('#muat').classList.remove('hilang');
  return el;
}
const sahNama = u => /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i.test(u);
let sedangMuat = false;
async function muat(u){
  u = (u || '').trim().replace(/^@/, '').replace(/^https?:\/\/github\.com\//i, '').split('/')[0];
  if(!sahNama(u)){ kapsyen('Nama pengguna GitHub tidak sah'); return; }
  if(sedangMuat) return; sedangMuat = true;
  henti(true); tutupRepo();
  $('#nama').value = u;
  $('#muatRalat').hidden = true; $('#muat').classList.remove('hilang');
  try{
    const { data, dariCache, ralat } = await muatData(u, t => $('#muatTeks').textContent = t);
    $('#muatTeks').textContent = 'Menyusun bangunan…';
    await Promise.race([document.fonts ? document.fonts.ready : null, new Promise(r => setTimeout(r, 1200))]);
    dataKini = data;
    binaKota(data);
    let nota = '';
    if(ralat instanceof HadKadar) nota = `Had API GitHub dicapai. Data dari ${masaLalu(data.masa)}; cuba lagi selepas ${new Date(ralat.reset).toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' })}.`;
    else if(dariCache) nota = `Dikemas kini ${masaLalu(data.masa)}.`;
    if(!data.pr) nota += (nota ? ' ' : '') + 'Kiraan PR tidak dapat dimuat; isu mungkin termasuk PR.';
    isiProfil(data, nota); isiSuapan(data); isiBahasa(data);
    document.title = `Kota GitHub · @${data.user.login}`;
    const url = new URL(location.href); url.searchParams.set('u', data.user.login); history.replaceState(null, '', url);
    $('#muat').classList.add('hilang');
    kapsyenAsal();
    pantau(data.user.login);
    if(!data.repos.length) kapsyen(`@${data.user.login} belum ada repo awam. Pulau ini menunggu bangunan pertama.`, '', true);
  }catch(e){
    if(e.kod !== 404) console.error(e);
    if(e.kod === 404) tunjukRalat('Pengguna tidak dijumpai', `Tiada akaun GitHub bernama “${u}”.`, dataKini ? 'Kembali ke kota' : 'Bina kota asal');
    else if(e instanceof HadKadar) tunjukRalat('Had API GitHub dicapai', `GitHub menghadkan 60 permintaan sejam bagi setiap alamat IP. Cuba lagi selepas ${new Date(e.reset).toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' })}.`, dataKini ? 'Kembali ke kota' : null);
    else tunjukRalat('Tidak dapat menghubungi GitHub', 'Semak sambungan internet dan cuba lagi.', 'Cuba lagi');
    const b = $('#cubaLagi');
    if(b) b.onclick = () => {
      if(dataKini){ $('#muat').classList.add('hilang'); $('#nama').value = dataKini.user.login; }
      else muat(e.kod === 404 ? PENGGUNA_ASAL : u);
    };
  }finally{ sedangMuat = false; }
}

/* ---------- kota hidup: semak push baharu setiap 90 saat ----------
   Permintaan bersyarat (ETag) yang menjawab 304 tidak dikira dalam had API GitHub. */
let etag = null, pantauMasa = 0, pantauLogin = '';
function pantau(login){
  clearTimeout(pantauMasa);
  if(login !== pantauLogin){ pantauLogin = login; etag = null; }
  pantauMasa = setTimeout(async () => {
    if(!dataKini || dataKini.user.login !== login) return;
    if(!document.hidden) try{
      const h = { Accept: 'application/vnd.github+json' }; if(etag) h['If-None-Match'] = etag;
      const r = await fetch(`${API}/users/${login}/events/public?per_page=30`, { headers: h });
      if(r.status === 200){
        etag = r.headers.get('ETag');
        const mentah = await r.json(), lama = new Set(dataKini.events.map(e => e.id));
        const baharuMentah = mentah.filter(e => !lama.has(e.id));
        await Promise.all(baharuMentah.filter(e => e.type === 'PushEvent' && !(e.payload.commits && e.payload.commits.length) && e.payload.head).slice(0, 3).map(async e => {
          try{ const k = await gh(`/repos/${e.repo.name}/commits/${e.payload.head}`); e.payload.commits = [{ sha: k.sha, message: k.commit.message }]; }catch{}
        }));
        const baharu = baharuMentah.map(ringkasEvent);
        if(baharu.length && dataKini.user.login === login){
          dataKini.events = baharu.concat(dataKini.events).slice(0, 100);
          simpanCache(login, dataKini);
          isiSuapan(dataKini); isiProfil(dataKini, 'Langsung: kota dikemas kini ' + masaLalu(new Date().toISOString()) + '.');
          const p = baharu.filter(e => e.jenis === 'PushEvent' && petaRepo.has(e.repo));
          if(p.length){
            pushSegera.push(...p.reverse());
            barisanPush = p.concat(barisanPush).slice(0, 40);
            const t = kenderaan.filter(k => k instanceof Trak);
            if(t.length < (mudah ? 5 : 7)) kenderaan.push(new Trak(.2));
            if(!tur && !ikut) kapsyen(`Push baharu! Trak commit menuju ${p[0].repo.split('/').pop()}`, String(p.length));
          }
        }
      }
    }catch{}
    pantau(login);
  }, 90e3);
}

/* ---------- butang ---------- */
$('#cari').addEventListener('submit', e => { e.preventDefault(); $('#nama').blur(); muat($('#nama').value); });
$('#btnTur').onclick = () => tur ? henti(true) : (dataKini && mulaTur());
$('#btnTrak').onclick = () => {
  if(ikut){ henti(true); return; }
  henti(true); tutupRepo();
  if(!ikutTrakLain()) kapsyen(barisanPush.length ? 'Trak sedang bertolak, cuba sebentar lagi' : 'Tiada push awam dalam 90 hari lepas, jadi tiada trak commit');
};
$('#btnMalam').onclick = () => setMalam(!malam);
$('#btnKongsi').onclick = async () => {
  const url = location.href;
  try{
    if(navigator.share && mudah) await navigator.share({ title: document.title, url });
    else { await navigator.clipboard.writeText(url); kapsyen('Pautan disalin'); }
  }catch{ kapsyen(url); }
};
function sembunyiSuapan(){ $('#suapan').hidden = true; $('#tunjukSuapan').hidden = false; document.body.classList.add('ada-tunjuk'); }
function tunjukSuapan(){ $('#suapan').hidden = false; $('#tunjukSuapan').hidden = true; document.body.classList.remove('ada-tunjuk'); if(kecil.matches){ tutupRepo(); $('#legenda').hidden = true; } }
$('#tutupSuapan').onclick = () => { sembunyiSuapan(); if(kecil.matches) $('#legenda').hidden = false; };
$('#tunjukSuapan').onclick = tunjukSuapan;
function susunMudah(){
  if(kecil.matches){ sembunyiSuapan(); $('#legendaButir').open = false; $('#legenda').hidden = false; }
  else { tunjukSuapan(); $('#legenda').hidden = false; }
}
kecil.addEventListener ? kecil.addEventListener('change', susunMudah) : kecil.addListener(susunMudah);
susunMudah();

const awal = new URLSearchParams(location.search).get('u') || PENGGUNA_ASAL;
$('#nama').value = awal;
if(new Date().getHours() >= 19 || new Date().getHours() < 7) setMalam(true);
gelung();
muat(awal);

// untuk ujian automatik
window.KOTA = { get bangunan(){ return bangunan; }, get kenderaan(){ return kenderaan; }, get data(){ return dataKini; }, muat, setMalam, pilih, mulaTur, henti, kam };
})();
