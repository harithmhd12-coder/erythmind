'use strict';
/* Opening: real-time camera sequence over the actual map, or the supplied video.
   It never unlocks the vault or changes the player/session. */
(() => {
  const media=window.ERYTH_CINEMATIC_MEDIA||{};
  const shots=[
    {name:'Kepulauan Erythmind',label:'01 / Sebuah dunia di antara bintang',title:'Di sini, segalanya bermula.',desc:'Di antara lautan dan langit, sebuah dunia menyimpan ceritamu.',from:[510,240,470],to:[400,185,310],look:[170,32,-40]},
    {name:'Teras · Fabriophase',label:'02 / Nadi sebuah tamadun',title:'Memori menjadi dunia.',desc:'Kota cahaya. Hutan emosi. Pantai yang menyimpan kenangan.',from:[-130,75,115],to:[-72,44,90],look:[0,14,-8]},
    {name:'Labophase · Frontier Dome',label:'03 / Melangkaui ufuk',title:'Ilmu tiada sempadan.',desc:'Di atas awan, idea bertemu kemungkinan.',from:[84,96,70],to:[-55,85,50],look:[0,55,-14]},
    {name:'Istana Pangaea',label:'04 / Langit bukan pengakhiran',title:'Selamat datang ke Erythmind.',desc:'Satu dunia. Seribu kemungkinan. Perjalananmu menanti.',from:[330,355,235],to:[250,312,175],look:[130,282,-40]},
  ];
  const C=window.ERYTH_CINEMA={visible:true,state:'welcome',elapsed:0,duration:24,shot:0,muted:true,shots};
  const root=document.createElement('section');root.id='cinema';root.dataset.state='welcome';root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');root.setAttribute('aria-label','Pengenalan Erythmind');
  root.innerHTML=`<div class="cinema-letterbox"></div><div class="cinema-letterbox bottom"></div>
    <header class="cinema-top"><div class="cinema-brand"><span class="cinema-mark" aria-hidden="true"><i></i></span>ERYTHMIND</div><span class="cinema-edition">SEBUAH DUNIA SCI-FI FANTASY</span></header>
    <div class="cinema-copy"><p class="cinema-overline">Di antara memori &amp; imaginasi</p><h1 class="cinema-title">ERYTH<span>MIND</span></h1><p class="cinema-tagline">Duniamu. Melangkaui realiti.</p><p class="cinema-desc">Terokai kepulauan di bawah langit kosmik. Simpan kenangan, temui ilmu dan cipta ceritamu sendiri.</p><div class="cinema-actions"><button class="cinema-btn primary" id="cinemaPlay" type="button">Tonton intro <b aria-hidden="true">▷</b></button><button class="cinema-btn" id="cinemaEnter" type="button">Ke pintu dunia <b aria-hidden="true">→</b></button></div><p id="cinemaStatus" role="status"></p></div>
    <div class="cinema-caption"><small id="cinemaChapter"></small><h2 id="cinemaHeading"></h2><p id="cinemaStory"></p></div>
    <footer class="cinema-bottom"><div class="cinema-location"><small>Koordinat dunia / 01</small><strong id="cinemaPlace">Kepulauan Erythmind</strong></div><div class="cinema-controls"><span class="cinema-time" id="cinemaTime">00:00 / 00:18</span><button class="cinema-btn cinema-audio" id="cinemaAudio" type="button" aria-pressed="false" aria-label="Hidupkan audio intro">Bunyi: mati</button><button class="cinema-btn cinema-skip" id="cinemaSkip" type="button" hidden>Langkau <span aria-hidden="true">→</span></button></div></footer>
    <div class="cinema-progress" role="progressbar" aria-label="Kemajuan intro" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i></i></div>`;
  document.body.appendChild(root);
  const find=id=>root.querySelector('#'+id);
  const status=find('cinemaStatus'),progress=root.querySelector('.cinema-progress');
  let video=null,mapImage=null,audio=null,tones=[],last=0,raf=0,wasHidden=false,saved=null;
  const inertState=new Map();
  function isolate(on){
    document.body.classList.toggle('cinema-visible',on);
    if(on){for(const el of document.body.children){if(el!==root && !['SCRIPT','STYLE'].includes(el.tagName)){inertState.set(el,el.inert);el.inert=true;}}}
    else {inertState.forEach((value,el)=>el.inert=value);inertState.clear();}
  }
  function saveCamera(){saved={position:camera.position.clone(),rotation:camera.quaternion.clone(),fov:camera.fov};}
  function stopAudio(){tones.forEach(n=>{try{n.stop();}catch{}});tones=[];if(audio){audio.close().catch(()=>{});audio=null;}}
  function playAudio(){
    if(C.muted||audio) return;
    const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;
    try{audio=new Audio();const gain=audio.createGain();gain.gain.value=.025;gain.connect(audio.destination);
      [55,82.4069,110,164.8138].forEach((hz,i)=>{const o=audio.createOscillator();o.type='sine';o.frequency.value=hz;o.detune.value=i%2?3:-3;o.connect(gain);o.start();tones.push(o);});
      audio.resume().catch(()=>{});
    }catch{stopAudio();}
  }
  function setAudio(muted){C.muted=muted;const b=find('cinemaAudio');b.textContent=muted?'Bunyi: mati':'Bunyi: hidup';b.setAttribute('aria-pressed',String(!muted));b.setAttribute('aria-label',muted?'Hidupkan audio intro':'Matikan audio intro');if(video)video.muted=muted;if(muted)stopAudio();else if(C.state==='playing')playAudio();}
  function chapter(i){const s=shots[i];C.shot=i;find('cinemaChapter').textContent=s.label;find('cinemaHeading').textContent=s.title;find('cinemaStory').textContent=s.desc;find('cinemaPlace').textContent=s.name;root.querySelector('.cinema-location small').textContent='Koordinat dunia / 0'+(i+1);root.dataset.map=String(!!mapImage&&i===0);}
  function updateProgress(elapsed,duration){const n=Math.min(1,elapsed/Math.max(duration,.1));progress.firstElementChild.style.transform=`scaleX(${n})`;progress.setAttribute('aria-valuenow',String(Math.round(n*100)));const fmt=n=>`00:${String(Math.floor(n)).padStart(2,'0')}`;find('cinemaTime').textContent=fmt(elapsed)+' / '+fmt(duration);}
  function close(){
    if(!C.visible)return;
    C.visible=false;C.state='closed';root.hidden=true;isolate(false);cancelAnimationFrame(raf);stopAudio();
    if(video){video.pause();video.hidden=true;}
    if(saved){camera.position.copy(saved.position);camera.quaternion.copy(saved.rotation);camera.fov=saved.fov;camera.updateProjectionMatrix();}
    applyLayers();keys.clear();
    // Restore focus to the existing secure gate, without entering a session.
    const target=document.querySelector('#gcard button, #gcard input');
    if(target)target.focus();else{gateEl.tabIndex=-1;gateEl.focus();}
  }
  function tick(now){
    if(!C.visible)return;
    const delta=last?(now-last)/1000:0;last=now;
    if(C.state==='playing'&&!document.hidden){
      C.elapsed+=delta;const i=Math.min(3,Math.floor(C.elapsed/6));if(i!==C.shot)chapter(i);
      updateProgress(C.elapsed,C.duration);if(C.elapsed>=C.duration){close();return;}
    }
    raf=requestAnimationFrame(tick);
  }
  function startLive(){
    if(!C.visible)return;
    if(video){video.pause();video.hidden=true;}
    C.state='playing';C.elapsed=0;root.dataset.state='playing';root.dataset.map='false';find('cinemaSkip').hidden=false;chapter(0);playAudio();last=0;
  }
  async function play(){
    let playTimer;
    status.textContent='';find('cinemaSkip').hidden=false;
    if(video){
      C.state='video';root.dataset.state='video';root.dataset.map='false';video.hidden=false;video.currentTime=0;video.muted=C.muted;
      try{await Promise.race([video.play(),new Promise((_,reject)=>{playTimer=setTimeout(()=>reject(new Error('video timeout')),8000);})]);}catch{status.textContent='Video tidak dapat dimainkan. Intro 3D digunakan.';startLive();}finally{clearTimeout(playTimer);}
    }else startLive();
  }
  function reopen(){
    if(C.visible||session)return;
    saveCamera();C.visible=true;C.state='welcome';C.elapsed=0;root.hidden=false;root.dataset.state='welcome';root.dataset.map='false';find('cinemaSkip').hidden=true;updateProgress(0,video?.duration||C.duration);isolate(true);chapter(0);last=0;raf=requestAnimationFrame(tick);find('cinemaPlay').focus();
  }
  if(media.poster){const poster=document.createElement('img');poster.className='cinema-poster';poster.src=media.poster;poster.alt='Kepulauan terapung Erythmind, kota kosmik dan perpustakaan pokok purba';poster.addEventListener('error',()=>{poster.remove();root.classList.remove('has-poster');});const picture=document.createElement('picture');picture.className='cinema-picture';if(media.posterMobile){const source=document.createElement('source');source.media='(max-width: 700px)';source.srcset=media.posterMobile;picture.appendChild(source);}picture.appendChild(poster);root.prepend(picture);root.classList.add('has-poster');}
  if(media.logo){const img=document.createElement('img');img.src=media.logo;img.alt='Erythmind';img.className='cinema-logo';img.addEventListener('error',()=>{img.remove();root.querySelector('.cinema-title').hidden=false;});root.querySelector('.cinema-title').hidden=true;root.querySelector('.cinema-copy').prepend(img);}
  if(media.map){mapImage=document.createElement('img');mapImage.src=media.map;mapImage.alt='Pelan dunia Erythmind';mapImage.className='cinema-map';mapImage.addEventListener('error',()=>{mapImage.remove();mapImage=null;root.dataset.map='false';});root.prepend(mapImage);}
  if(media.video){
    video=document.createElement('video');video.className='cinema-video';video.src=media.video;video.preload='metadata';video.poster=media.poster||'';video.setAttribute('aria-label','Video pengenalan Erythmind');video.playsInline=true;video.muted=true;video.hidden=true;root.prepend(video);
    video.addEventListener('loadedmetadata',()=>{if(C.state==='welcome')updateProgress(0,video.duration);});video.addEventListener('ended',close);video.addEventListener('error',()=>{if(C.state==='video')startLive();});video.addEventListener('timeupdate',()=>{if(C.state==='video')updateProgress(video.currentTime,video.duration||C.duration);});
  }
  find('cinemaPlay').addEventListener('click',play);find('cinemaEnter').addEventListener('click',close);find('cinemaSkip').addEventListener('click',close);find('cinemaAudio').addEventListener('click',()=>setAudio(!C.muted));
  document.addEventListener('visibilitychange',()=>{
    if(!C.visible)return;last=0;
    if(document.hidden){wasHidden=!!video&&!video.paused;video?.pause();audio?.suspend();}
    else{if(wasHidden&&C.state==='video')video.play().catch(()=>startLive());if(!C.muted)audio?.resume();wasHidden=false;}
  });
  // Capture keys before the game's document listeners: an intro can never type a PIN.
  window.addEventListener('keydown',e=>{
    if(!C.visible)return;
    if(e.key==='Escape'){e.preventDefault();close();e.stopImmediatePropagation();return;}
    if(e.key==='Tab'){
      const controls=[...root.querySelectorAll('button:not([hidden])')].filter(b=>b.offsetParent!==null);
      const first=controls[0],lastControl=controls[controls.length-1];
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();lastControl.focus();}else if(!e.shiftKey&&document.activeElement===lastControl){e.preventDefault();first.focus();}
    }else if(!['Enter',' '].includes(e.key)){e.preventDefault();}
    e.stopImmediatePropagation();
  },true);
  // Replay is attached outside renderGate so owner-login extensions remain untouched.
  const replay=document.createElement('button');replay.type='button';replay.className='cinema-replay';replay.textContent='▷ Tonton semula intro';replay.addEventListener('click',reopen);
  const observer=new MutationObserver(()=>{const card=document.getElementById('gcard');if(card&&!card.contains(replay)){card.appendChild(replay);if(media.logo){const heading=card.querySelector('h1');if(heading){const img=document.createElement('img');img.className='gate-brand-logo';img.src=media.logo;img.alt='Erythmind';heading.replaceChildren(img);}}}});observer.observe(gateEl,{childList:true,subtree:true});
  const originalCamera=updateCamera;
  const from=new THREE.Vector3(),to=new THREE.Vector3(),look=new THREE.Vector3();
  updateCamera=function(dt,t){
    if(!C.visible||C.state==='video')return originalCamera(dt,t);
    let s,u;
    if(C.state==='playing'){s=shots[C.shot];u=(C.elapsed-C.shot*6)/6;u=u*u*(3-2*u);}
    else{s=shots[0];u=reduced?.45:.45+Math.sin(t*.055)*.12;}
    if(reduced)u=.5;
    from.fromArray(s.from);to.fromArray(s.to);camera.position.lerpVectors(from,to,u);look.fromArray(s.look);camera.lookAt(look);camTarget.copy(look);
    camera.fov=48;camera.updateProjectionMatrix();
    // Pangaea is needed for the last establishing shot even at a lower quality tier.
    if(C.shot===3&&C.state==='playing')LC[3].visible=true;
    camera.far=Math.max(camera.far,1600);camera.updateProjectionMatrix();
  };
  // Golden hour is confined to the introduction. Live world time is never changed.
  const environment=updateEnvironment;
  updateEnvironment=function(dt,t){
    environment(dt,t);
    if(!C.visible||C.state==='video')return;
    skyU.top.value.setHex(0x1a344d);skyU.bot.value.setHex(0x73929a);scene.fog.color.setHex(0x486b77);scene.fog.near=280;scene.fog.far=1350;
    skyU.sunDir.value.set(-.65,.22,-.3).normalize();skyU.sunCol.value.setHex(0xffd29a);skyU.glow.value=.8;
    fantasySky.uniforms.fNight.value=.35;hemi.color.setHex(0x9bc4d0);hemi.groundColor.setHex(0x37423c);hemi.intensity=.65;sun.color.setHex(0xffdab1);sun.intensity=1.15;
    sun.position.copy(camTarget).add(from.set(-100,160,90));sun.target.position.copy(camTarget);
    if(gradePass){gradePass.uniforms.night.value=.12;gradePass.uniforms.rts.value=0;}
  };
  // Re-render a paused gate only while its opening is visible; never run a hidden video scene.
  const render=renderWorld;let lastRender=-Infinity;
  renderWorld=function(dt){
    if(C.visible&&(C.state==='video'||(C.state==='welcome'&&root.classList.contains('has-poster'))))return;
    // Software GPUs get a still backdrop while loading; hardware keeps the live fly-through.
    if(C.visible&&Q.soft){if(!HF.allDone)return;const now=performance.now();if(now-lastRender<1800)return;lastRender=now;}
    render(dt);
  };
  C.play=play;C.close=close;C.reopen=reopen;
  saveCamera();isolate(true);chapter(0);raf=requestAnimationFrame(tick);find('cinemaPlay').focus();
  if(reduced)status.textContent='Gerakan dikurangkan mengikut tetapan peranti. Intro dimainkan hanya apabila dipilih.';
})();
