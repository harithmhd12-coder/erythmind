'use strict';
/* ================= Sinematik: the film look over the whole world =================
   Moonlit blue nights, warm candle-gold interiors, glowing light (bloom), a teal-and-gold colour grade,
   soft vignette and fine film grain. Three modes: penuh (bloom + grade), ringan (grade only), mati.
   Phones start on ringan; if the frame rate stays low, penuh steps down to ringan by itself. */
const GFX_MODES = {penuh:'Penuh · cahaya bersinar + gred filem', ringan:'Ringan · gred filem sahaja', mati:'Mati · paparan asal'};
const coarse = matchMedia('(pointer:coarse)').matches;
let gfxMode = LS.get('erythmind.gfx', coarse ? 'ringan' : 'penuh');
if(!GFX_MODES[gfxMode]) gfxMode = 'penuh';
const canPost = !!(THREE.EffectComposer && THREE.RenderPass && THREE.ShaderPass && THREE.UnrealBloomPass);

const GradeShader = {
  uniforms:{tDiffuse:{value:null}, night:{value:0}, warm:{value:0}, rts:{value:0}, edge:{value:0}, time:{value:0}, res:{value:new THREE.Vector2(1, 1)}},
  vertexShader:'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }',
  fragmentShader:`uniform sampler2D tDiffuse; uniform float night; uniform float warm; uniform float rts; uniform float edge; uniform float time; uniform vec2 res; varying vec2 vUv;
    float gh(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
    void main(){
      vec3 c = texture2D(tDiffuse, vUv).rgb, c0 = c;
      c = c / (1. + max(c - .82, 0.) * 1.6);                      // soft shoulder for blown highlights
      float l = dot(c, vec3(.2126, .7152, .0722));
      c = mix(vec3(l), c, mix(.84, .78, night));                   // a little less saturated, painterly
      vec3 shadowTint = mix(vec3(.86, .96, 1.12), vec3(.72, .86, 1.25), night);
      vec3 lightTint = mix(vec3(1.08, 1.0, .86), vec3(1.12, .98, .8), warm);
      c *= mix(shadowTint, lightTint, smoothstep(.12, .78, l));    // teal shadows, golden highlights
      c = mix(c, c * c * (3. - 2. * c), .32);                      // gentle film contrast
      c *= mix(1., .8, night);                                     // deeper moonlit nights
      c += vec3(.012, .016, .03);                                  // inky lifted blacks
      vec2 d = vUv - .5; d.x *= res.x / res.y;
      c *= mix(1., (1. - smoothstep(.32, 1.05, length(d))), .25);         // vignette
      c += (gh(vUv * res + fract(time) * 91.) - .5) * .008;        // grain
      if(rts > .01){                                               // Gaya RTS: crisp and saturated, warm light, cool shade, no grain
        vec3 r = c0 / (1. + max(c0 - .9, 0.) * 1.4); float lr = dot(r, vec3(.2126, .7152, .0722));
        r = mix(vec3(lr), r, 1.1);
        r *= mix(vec3(.94, .99, 1.07), vec3(1.06, 1.01, .93), smoothstep(.12, .8, lr));
        r = mix(r, r * r * (3. - 2. * r), .25);
        r *= mix(1., .8, night); r += vec3(.006, .008, .016);
        r *= mix(1., smoothstep(1.3, .45, length(d)), .28);
        if(edge > .01){                                            // ink edges: strong changes of light outline roofs, trees and walls
          vec2 px = 1.25 / res; vec3 W = vec3(.2126, .7152, .0722);
          float a = dot(texture2D(tDiffuse, vUv + px * vec2(-1., -1.)).rgb, W), b = dot(texture2D(tDiffuse, vUv + px * vec2(0., -1.)).rgb, W), e2 = dot(texture2D(tDiffuse, vUv + px * vec2(1., -1.)).rgb, W),
                f = dot(texture2D(tDiffuse, vUv + px * vec2(-1., 0.)).rgb, W), g = dot(texture2D(tDiffuse, vUv + px * vec2(1., 0.)).rgb, W),
                h = dot(texture2D(tDiffuse, vUv + px * vec2(-1., 1.)).rgb, W), i = dot(texture2D(tDiffuse, vUv + px * vec2(0., 1.)).rgb, W), j = dot(texture2D(tDiffuse, vUv + px * vec2(1., 1.)).rgb, W);
          float gx = (e2 + 2. * g + j) - (a + 2. * f + h), gy = (h + 2. * i + j) - (a + 2. * b + e2);
          r *= 1. - smoothstep(.22, .55, length(vec2(gx, gy))) * .42 * edge;
        }
        c = mix(c, r, rts);
      }
      gl_FragColor = vec4(c, 1.);
    }`,
};

let composer = null, bloomPass = null, gradePass = null;
function buildComposer(){
  composer = null; bloomPass = null; gradePass = null;
  if(gfxMode === 'mati' || !canPost) return;
  const w = innerWidth, h = innerHeight, gl2 = renderer.capabilities.isWebGL2;
  // stencil on means a 24-bit depth buffer: three.js otherwise gives an off-screen target only 16 bits, and the ground layers
  // (grass over the island, roads over the grass) then fight for the same depth and show as stripes, worst on phones
  const opt = {format:THREE.RGBAFormat, type:gl2 ? THREE.HalfFloatType : THREE.UnsignedByteType, depthBuffer:true, stencilBuffer:true};
  const rt = gl2 && THREE.WebGLMultisampleRenderTarget ? Object.assign(new THREE.WebGLMultisampleRenderTarget(w, h, opt), {samples:coarse ? 2 : 4}) : new THREE.WebGLRenderTarget(w, h, opt);
  composer = new THREE.EffectComposer(renderer, rt);
  composer.setPixelRatio(Math.min(devicePixelRatio, gfxMode === 'penuh' ? 1.5 : 1.25)); composer.setSize(w, h);
  composer.addPass(new THREE.RenderPass(scene, camera));
  if(gfxMode === 'penuh'){ bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(w, h), .5, .65, .82); composer.addPass(bloomPass); }
  gradePass = new THREE.ShaderPass(GradeShader); composer.addPass(gradePass);
}
function setGfx(m){ if(!GFX_MODES[m]) return; gfxMode = m; LS.set('erythmind.gfx', m); if(composer) composer.renderTarget1.dispose(), composer.renderTarget2.dispose(); buildComposer(); gfxWatch.n = 0; gfxWatch.t = 0; }
function gfxSettingsHtml(){ return `<h3>Grafik</h3><div class="field"><label for="gfxSel">Mod grafik sinematik</label><select id="gfxSel">${Object.entries(GFX_MODES).map(([k, n]) => `<option value="${k}" ${gfxMode === k ? 'selected' : ''}>${n}</option>`).join('')}</select></div><div class="note">Penuh paling cantik tetapi paling berat. Telefon lama: pilih Ringan.</div>`; }
document.addEventListener('change', e => { if(e.target.id === 'gfxSel') setGfx(e.target.value); });
addEventListener('resize', () => { if(composer){ composer.setSize(innerWidth, innerHeight); } });

// low frame rate on penuh: step down once, quietly
const gfxWatch = {n:0, t:0, done:false};
function watchGfx(dt){
  if(gfxWatch.done || gfxMode !== 'penuh' || !session) return;
  gfxWatch.n++; gfxWatch.t += dt;
  if(gfxWatch.t > 8){ const fps = gfxWatch.n / gfxWatch.t; gfxWatch.done = true;
    if(fps < 26 && !LS.get('erythmind.gfx.pinned', false)){ setGfx('ringan'); toast('Grafik ditukar ke mod Ringan supaya lebih lancar. Tukar semula di Tetapan.', 'ok', 4500); } }
}

// moon halo: a soft glow ring round the moon that bloom picks up
const haloTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'), r = g.createRadialGradient(64, 64, 6, 64, 64, 64);
  r.addColorStop(0, 'rgba(235,240,255,.9)'); r.addColorStop(.25, 'rgba(190,210,255,.35)'); r.addColorStop(.6, 'rgba(120,150,230,.08)'); r.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = r; g.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c); })();
const moonHalo = new THREE.Sprite(new THREE.SpriteMaterial({map:haloTex, blending:THREE.AdditiveBlending, depthWrite:false, fog:false, transparent:true}));
moonHalo.scale.setScalar(900); moonHalo.renderOrder = -9; scene.add(moonHalo);
moon.material.color.setHex(0xfffbec);

const gateEl = document.getElementById('gate');
function renderWorld(dt){
  if(!session && !gateEl.hidden) return;             // the gate covers the whole screen: leave the device free for typing
  if(!composer || (typeof Q !== 'undefined' && Q.noPost)){ renderer.render(scene, camera); return; }
  const indoor = indoorLayer(player.layer), warm = player.layer === 4 || (player.layer === 2 && nivRegion(player.x, player.z) === 'gua') ? 1 : 0;
  gradePass.uniforms.night.value = indoor ? (player.layer === 5 ? .8 : .2) : nightLevel;
  gradePass.uniforms.warm.value = lerp(gradePass.uniforms.warm.value, warm, .05);
  gradePass.uniforms.time.value = performance.now() / 1000;
  gradePass.uniforms.res.value.set(innerWidth, innerHeight);
  if(bloomPass){ if(indoor){ bloomPass.threshold = .8; bloomPass.strength = .5; } else { bloomPass.threshold = lerp(typeof REAL !== 'undefined' && REAL.envOn ? .95 : .84, .6, nightLevel); bloomPass.strength = lerp(.42, .75, nightLevel); } bloomPass.radius = .65; }
  composer.render(dt);
  watchGfx(dt);
}
anims.push(() => { moonHalo.visible = moon.visible; moonHalo.position.copy(moon.position); moonHalo.scale.setScalar(900 * moon.scale.x); moonHalo.material.opacity = moon.material.opacity * .9; });
buildComposer();
