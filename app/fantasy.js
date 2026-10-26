'use strict';
/* Erythmind art direction: physically shaded surfaces, a living ocean and a celestial sky.
   Decorations have no colliders and inherit the existing world-layer visibility. */
const FANTASY = {enabled:!RTS.on, time:{value:0}, strength:{value:1}};
// Match the world's authored palette and its custom terrain/post-processing shaders.
// A global sRGB/ACES switch double-encodes custom texture samples and shifts existing colours.
renderer.outputEncoding = THREE.LinearEncoding;
renderer.toneMapping = THREE.NoToneMapping;
renderer.toneMappingExposure = 1;

// Layered atmospheric scattering, slow cloud banks and an aurora at night.
const fantasySky = sky.material;
fantasySky.uniforms.fTime = FANTASY.time;
fantasySky.uniforms.fNight = {value:0};
fantasySky.uniforms.fFantasy = FANTASY.strength;
fantasySky.fragmentShader = `
uniform vec3 top, bot, sunDir, sunCol;
uniform float glow, fTime, fNight, fFantasy;
varying vec3 vP;
float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
float noise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y); }
float fbm(vec2 p){ return noise(p)*.55+noise(p*2.03)*.27+noise(p*4.07)*.13+noise(p*8.13)*.05; }
void main(){
  vec3 d=normalize(vP); float h=d.y, s=max(dot(d,normalize(sunDir)),0.);
  vec3 c=mix(bot,top,smoothstep(-.07,.65,h));
  c+=sunCol*(pow(s,900.)*3.5+pow(s,24.)*.18)*glow;
  float horizon=exp(-abs(h)*12.);
  c+=mix(vec3(.12,.15,.17),vec3(.055,.09,.13),fNight)*horizon*fFantasy;
  if(h>.015){
    vec2 uv=d.xz/max(.12,h)*.48+vec2(fTime*.004,0.);
    float cloud=smoothstep(.49,.76,fbm(uv))*smoothstep(.015,.14,h);
    vec3 cc=mix(vec3(.88,.91,.93),vec3(.075,.11,.20),fNight);
    cc+=sunCol*pow(s,8.)*.16*glow;
    c=mix(c,cc,cloud*.65*fFantasy);
    float wave=sin(d.x*7.+sin(d.z*5.+fTime*.045)*1.7+fTime*.025);
    float ribbon=exp(-abs(h-.28-wave*.035)*36.);
    float veil=fbm(d.xz*5.+vec2(fTime*.008,0.));
    c+=mix(vec3(.025,.35,.30),vec3(.25,.07,.40),noise(d.xz*4.))*ribbon*veil*fNight*fFantasy*.65;
  }
  gl_FragColor=vec4(c,1.);
  #include <tonemapping_fragment>
  #include <encodings_fragment>
}`;
fantasySky.needsUpdate = true;

// Soft relief on roads, stone and soil. Reuse the existing weather-aware world projection.
const _worldTextureFantasy = worldTexture;
worldTexture = function(mat,name,scale,keep){
  _worldTextureFantasy(mat,name,scale,keep);
  const compile=mat.onBeforeCompile;
  mat.onBeforeCompile=sh=>{
    compile(sh);
    sh.fragmentShader=sh.fragmentShader.replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor = clamp(roughnessFactor + (texture2D(wTex, vWP.xz*wScale).r-.5)*.18, .28, 1.);');
  };
  mat.customProgramCacheKey=()=> 'fantasy-world-v1';
};
worldTexture(roadMat,'asphalt',.22,.12);
worldTexture(grassMat,'grass',.12,.18);
worldTexture(sandMat,'sand',.12,.16);

// Analytic waves and Fresnel reflections; no screen-space capture or extra render pass.
seaReal.color.setHex(0x125269); seaReal.roughness=.22; seaReal.metalness=.32;
seaReal.normalScale.set(.38,.38);
seaReal.onBeforeCompile=sh=>{
  sh.uniforms.fTime=FANTASY.time;
  sh.vertexShader='uniform float fTime; varying vec3 oceanP;\n'+sh.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
    transformed.y += sin(position.x*.045+fTime*.9)*.55+cos(position.z*.06+fTime*1.2)*.45;
    oceanP=(modelMatrix*vec4(transformed,1.)).xyz;`);
  sh.fragmentShader='uniform float fTime; varying vec3 oceanP;\n'+sh.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
    float ripples=sin(oceanP.x*.21+fTime*.45)*sin(oceanP.z*.18-fTime*.31);
    diffuseColor.rgb*=.91+ripples*.09;`).replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
    float fres=pow(1.-max(dot(normal,normalize(vViewPosition)),0.),4.);
    totalEmissiveRadiance+=vec3(.025,.07,.095)*fres;`);
};
seaReal.customProgramCacheKey=()=> 'fantasy-ocean-v1'; seaReal.needsUpdate=true;

// Fine surface relief in view space, with no extra texture downloads.
const fantasyRelief = `
  vec3 dpdx=dFdx(-vViewPosition), dpdy=dFdy(-vViewPosition);
  vec3 rx=cross(dpdy,normal), ry=cross(normal,dpdx);
  float determinant=dot(dpdx,rx);
  vec3 reliefGradient=dFdx(reliefHeight)*rx+dFdy(reliefHeight)*ry;
  normal=normalize(abs(determinant)*normal-sign(determinant)*reliefGradient);
`;
const _terrainTextureFantasy=terrainTexture;
terrainTexture=function(mat,object,base){
  _terrainTextureFantasy(mat,object,base);const compile=mat.onBeforeCompile;
  mat.extensions=Object.assign({},mat.extensions,{derivatives:true});
  mat.onBeforeCompile=sh=>{compile(sh);sh.fragmentShader=sh.fragmentShader.replace('#include <normal_fragment_maps>',
    '#include <normal_fragment_maps>\nfloat reliefHeight=dot(tex,vec3(.2126,.7152,.0722))*.085;\n'+fantasyRelief);};
  mat.customProgramCacheKey=()=> 'terrain-fantasy-relief-v1';mat.needsUpdate=true;
};
if(REAL.on&&!RTS.on){terrainTexture(terrainMat,terrain,tColBase);if(nTerrain)terrainTexture(nTerrain.material,nTerrain);}

// Low-cost emissive architecture: portal halos, floating fragments and energy paths.
const fantasyCore = new THREE.Group(); LC[0].add(fantasyCore);
const fantasyCastle = new THREE.Group(); LC[3].add(fantasyCastle);
const fantasyMetal = M(0x243a43,{metalness:.72,roughness:.3});
const fantasyGold = M(0xbca377,{metalness:.78,roughness:.29});
const fantasyLight = new THREE.MeshStandardMaterial({color:0x70d6db,emissive:0x53c9db,emissiveIntensity:1.8,roughness:.3,metalness:.25});
const fDecor=[];
function fantasyRing(parent,x,y,z,r,tilt){
  const pivot=new THREE.Group(); pivot.position.set(x,y,z); parent.add(pivot); pivot.rotation.x=tilt;
  const rim=new THREE.Mesh(new THREE.TorusGeometry(r,.18,8,96),fantasyGold); pivot.add(rim);
  const light=new THREE.Mesh(new THREE.TorusGeometry(r-.4,.045,5,96),fantasyLight); pivot.add(light);
  for(let i=0;i<12;i++){
    const a=i*Math.PI/6, mark=new THREE.Mesh(new THREE.BoxGeometry(.24,1.1,.25),fantasyMetal);
    mark.position.set(Math.cos(a)*r,Math.sin(a)*r,0); mark.rotation.z=a-Math.PI/2; pivot.add(mark);
  }
  fDecor.push(pivot); return pivot;
}
fantasyRing(fantasyCore,LAB.x,LAB.y-4,LAB.z,LAB.r+3,Math.PI/2);
fantasyRing(fantasyCastle,PANG.x,PANG.y-9,PANG.z,PANG.r*.72,Math.PI/2+.08);
// Only add accents to existing paths: the geography and playable spaces stay intact.
const pathwayGeo=new THREE.BoxGeometry(.12,.08,1.7);
const pathway=new THREE.InstancedMesh(pathwayGeo,fantasyLight,52);
const fMatrix=new THREE.Matrix4(),fQuat=new THREE.Quaternion(),fPos=new THREE.Vector3();
for(let i=0;i<52;i++){
  const a=i/52*Math.PI*2;
  fPos.set(Math.sin(a)*31.8,.12,Math.cos(a)*31.8);
  fQuat.setFromAxisAngle(new THREE.Vector3(0,1,0),a);
  fMatrix.compose(fPos,fQuat,new THREE.Vector3(1,1,1)); pathway.setMatrixAt(i,fMatrix);
}
fantasyCore.add(pathway);
const shardGeo=new THREE.OctahedronGeometry(.7,0),shards=new THREE.InstancedMesh(shardGeo,fantasyGold,18);
const shardData=Array.from({length:18},(_,i)=>({a:i/18*Math.PI*2,y:LAB.y-9-(i%4)*2,r:LAB.r+5+(i%3)*2}));
fantasyCore.add(shards);

// A distant ringed moon follows the camera and stays inside the current far plane.
const planetGroup=new THREE.Group(); scene.add(planetGroup);
const planetMat=new THREE.ShaderMaterial({uniforms:{opacity:{value:0}},transparent:true,depthWrite:false,fog:false,
  vertexShader:'varying vec3 pn; void main(){ pn=normal; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
  fragmentShader:`varying vec3 pn; uniform float opacity;
  void main(){ float bands=sin(pn.y*31.+sin(pn.x*12.)*.8)*.03;
  float lit=.16+.84*max(dot(normalize(pn),normalize(vec3(-.8,.5,.6))),0.);
  vec3 c=mix(vec3(.24,.35,.44),vec3(.69,.70,.63),pn.y*.5+.5)+bands;
  gl_FragColor=vec4(c*lit,opacity);
  #include <tonemapping_fragment>
  #include <encodings_fragment>
  }`});
planetGroup.add(new THREE.Mesh(new THREE.SphereGeometry(1,40,24),planetMat));
const ringMat=new THREE.MeshBasicMaterial({color:0xa4b9bd,side:THREE.DoubleSide,transparent:true,opacity:0,depthWrite:false,fog:false});
const planetRing=new THREE.Mesh(new THREE.RingGeometry(1.4,2.05,96),ringMat);planetRing.rotation.set(.65,.2,-.4);planetGroup.add(planetRing);

let fScan=0;
function fantasyTrees(){
  const model=REAL.trees.broad;if(!model)return;
  const on=!RTS.on&&Q.tier>=2;
  swayGroups.forEach(g=>{
    const kids=g.children.filter(c=>c!==g.userData.fantasyTree&&c!==g.userData.rtsTree);
    if(kids.length!==3||kids[0].geometry?.type!=='CylinderGeometry'||!kids.slice(1).every(c=>c.geometry?.type==='ConeGeometry'))return;
    if(on&&!g.userData.fantasyTree){
      const b=new THREE.Box3();kids.forEach(c=>b.expandByObject(c));
      const tree=new THREE.Mesh(model.geo,model.mat);tree.scale.setScalar((b.max.y-b.min.y)/9.5);
      tree.position.y=b.min.y-g.getWorldPosition(new THREE.Vector3()).y;
      tree.rotation.y=g.position.x*.7;tree.castShadow=true;tree.receiveShadow=true;g.add(tree);g.userData.fantasyTree=tree;
    }
    if(g.userData.fantasyTree){g.userData.fantasyTree.visible=on;if(!RTS.on)kids.forEach(c=>c.visible=!on);}
  });
}
const _applyModelFantasy=applyModel;
applyModel=function(key,gltf){const result=_applyModelFantasy(key,gltf);fantasyTrees();return result;};
const _applyRealismFantasy=applyRealism;
applyRealism=function(){_applyRealismFantasy();fantasyTrees();};
const _updateEnvironmentFantasy=updateEnvironment;
updateEnvironment=function(dt,t){
  _updateEnvironmentFantasy(dt,t);
  FANTASY.enabled=!RTS.on;
  const active=FANTASY.enabled&&!indoorLayer(player.layer);
  FANTASY.time.value=t; FANTASY.strength.value=FANTASY.enabled?1:0;
  fantasySky.uniforms.fNight.value=nightLevel;
  bavarShell.material.opacity=FANTASY.enabled ? .004 : .02;
  moon.visible=!indoorLayer(player.layer)&&nightLevel>.2; moon.material.opacity=nightLevel;
  fantasyCore.visible=FANTASY.enabled; fantasyCastle.visible=FANTASY.enabled;
  planetGroup.visible=active&&Q.tier>=1;
  if(active){
    // More neutral daylight; interiors retain their own warm lighting and weather remains live.
    hemi.groundColor.lerp(new THREE.Color(0x29434a),.3);
    hemi.intensity*=1.1;
    const distance=camera.far*.62;
    planetGroup.position.copy(camera.position).add(fPos.set(-.62,.34,-.7).normalize().multiplyScalar(distance));
    planetGroup.scale.setScalar(distance*.11);
    const opacity=(.2+nightLevel*.45)*(1-weatherNow().grey);
    planetMat.uniforms.opacity.value=opacity; ringMat.opacity=opacity*.45;
  }
  for(let i=0;i<shardData.length;i++){
    const d=shardData[i],a=d.a+t*.018;
    fPos.set(Math.cos(a)*d.r,d.y+Math.sin(t*.35+i)*.7,LAB.z+Math.sin(a)*d.r);
    fQuat.setFromEuler(new THREE.Euler(t*.12+i,a,t*.08));
    fMatrix.compose(fPos,fQuat,new THREE.Vector3(1,1.8,1)); shards.setMatrixAt(i,fMatrix);
  }
  shards.instanceMatrix.needsUpdate=true;
  fDecor.forEach((r,i)=>r.rotation.z=t*.012*(i?1:-1));
  fScan-=dt;if(fScan<=0){fScan=4;fantasyTrees();}
};

/* Distant floating islets and streaming waterfalls echo the opening's archipelago.
   Decorative only: they do not move the map's existing destinations or collision surfaces. */
const skyIslands=new THREE.Group();fantasyCore.add(skyIslands);
const islandStone=M(0x667584,{map:realTex('rock'),roughness:.95});
const islandMeadow=M(0x3c6851,{map:realTex('grass'),roughness:.94});
const waterfallMat=new THREE.ShaderMaterial({uniforms:{time:FANTASY.time},transparent:true,side:THREE.DoubleSide,depthWrite:false,
  vertexShader:'varying vec2 fUv; void main(){ fUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
  fragmentShader:`uniform float time;varying vec2 fUv;
    void main(){float streak=sin(fUv.x*85.+sin(fUv.y*8.+time*3.))* .5+.5;
    float flow=sin(fUv.y*45.+time*6.+fUv.x*9.)*.5+.5;
    float edge=smoothstep(0.,.12,fUv.x)*(1.-smoothstep(.88,1.,fUv.x));
    float alpha=edge*(.28+streak*.28+flow*.12)*smoothstep(0.,.1,fUv.y);
    gl_FragColor=vec4(mix(vec3(.31,.7,.82),vec3(.89,.97,1.),streak*.7+flow*.15),alpha);
    #include <tonemapping_fragment>
    #include <encodings_fragment>
    }`});
[[615,115,-310,18],[40,175,-290,13],[-160,120,-195,10],[560,225,-460,22]].forEach(([x,y,z,r],i)=>{
  const island=new THREE.Group();island.position.set(x,y,z);skyIslands.add(island);
  const rock=new THREE.Mesh(new THREE.ConeGeometry(r,r*2.1,11,3),islandStone);rock.rotation.z=Math.PI;rock.position.y=-r;island.add(rock);
  const top=new THREE.Mesh(new THREE.CylinderGeometry(r*.9,r,2,24),islandMeadow);island.add(top);
  const water=new THREE.Mesh(new THREE.PlaneGeometry(r*.22,r*3.7,1,12),waterfallMat);water.position.set(r*.4,-r*1.7,r*.84);water.rotation.y=.2;island.add(water);
  const spire=new THREE.Mesh(new THREE.ConeGeometry(r*.15,r*.8,5),fantasyGold);spire.position.set(-r*.3,r*.4,0);island.add(spire);
});
// Two falls spill from the floating laboratory. Light streams stay inside the surface layer.
[-1,1].forEach(side=>{
  const fall=new THREE.Mesh(new THREE.PlaneGeometry(2.4,44,1,12),waterfallMat);fall.position.set(side*23,25,-6);fall.rotation.y=side*.55;fantasyCore.add(fall);
});
