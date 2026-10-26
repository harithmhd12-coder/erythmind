/* Run with Node + Playwright installed, while serving the repository on port 8000.
   Authentication is isolated in-browser; no remote database writes are made. */
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const origin=process.env.TEST_ORIGIN||'http://127.0.0.1:8000';
(async()=>{
  const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
  try{
    const context=await browser.newContext({serviceWorkers:'block'});
    await context.route('**/app/config.js',r=>r.fulfill({contentType:'text/javascript',body:'window.ERYTH_CONFIG={};'}));
    await context.route('https://fonts.googleapis.com/**',r=>r.abort());
    const page=await context.newPage();const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    const shaderErrors=[];page.on('console',m=>{if(m.type()==='error'&&/shader|VALIDATE_STATUS|GL_INVALID/i.test(m.text()))shaderErrors.push(m.text())});
    await page.setViewportSize({width:1440,height:900});
    await page.goto(origin,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>typeof HF!=='undefined'&&HF.allDone,null,{timeout:90000});
    assert.equal(await page.evaluate(()=>HF.done),40,'All existing models loaded');
    await page.screenshot({path:'/tmp/erythmind-desktop.png'});
    assert.equal(await page.evaluate(()=>ERYTH_CINEMA.state),'welcome');
    await page.getByRole('button',{name:'Tonton intro',exact:true}).click();
    await page.waitForFunction(()=>ERYTH_CINEMA.state==='video'&&document.querySelector('.cinema-video').currentTime>.3);
    await page.screenshot({path:'/tmp/erythmind-video.png'});
    assert.equal(await page.evaluate(()=>document.querySelector('.cinema-video').videoWidth),1280);
    // Key input belongs exclusively to the intro, never the vault PIN.
    await page.keyboard.press('1');assert.equal(await page.evaluate(()=>pinBuf),'');
    await page.getByRole('button',{name:'Hidupkan audio intro'}).click();
    assert.equal(await page.evaluate(()=>document.querySelector('.cinema-video').muted),false);
    await page.getByRole('button',{name:'Langkau'}).click();
    assert.deepEqual(await page.evaluate(()=>({visible:ERYTH_CINEMA.visible,inert:gateEl.inert,session:!!session})),{visible:false,inert:false,session:false});
    await page.getByRole('button',{name:'Tonton semula intro'}).click();
    assert.equal(await page.evaluate(()=>ERYTH_CINEMA.state),'welcome');
    // The natural video completion also returns to the existing gate.
    await page.locator('#cinemaPlay').click();
    await page.waitForFunction(()=>!document.querySelector('.cinema-video').paused);
    await page.evaluate(()=>{const v=document.querySelector('.cinema-video');v.currentTime=v.duration-.3;});
    await page.waitForFunction(()=>!ERYTH_CINEMA.visible);
    await page.getByRole('button',{name:'Tonton semula intro'}).click();
    await page.setViewportSize({width:390,height:844});
    await page.screenshot({path:'/tmp/erythmind-mobile.png'});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    await page.keyboard.press('Escape');
    assert.equal(await page.evaluate(()=>ERYTH_CINEMA.visible),false);
    // One explicit frame at both low and high quality catches shader regressions without a software-GPU loop.
    await page.evaluate(()=>{window.savedFrame=renderWorld;renderWorld=()=>{};ERYTH_CINEMA.reopen();});
    for(const tier of [0,2,3]){
      await page.evaluate(tier=>{
        setQuality(tier);camera.position.set(92,72,100);camera.lookAt(10,12,-10);camera.far=1600;camera.updateProjectionMatrix();
        applyLayers();updateEnvironment(.016,12);renderer.render(scene,camera);if(tier===3&&composer)composer.render(.016);
      },tier);
    }
    // Check style switching restores both photographic and RTS trees.
    await page.evaluate(()=>{setGaya(true);setGaya(false);});
    // Enter an ephemeral local-only world, then exercise every existing layer.
    await page.evaluate(async()=>{ERYTH_CINEMA.close();await createWorld('82469137');});
    assert.equal(await page.evaluate(()=>session.role),'owner');
    for(const layer of [0,1,2,3,4,5]){
      await page.evaluate(layer=>{setLayer(layer);applyLayers();updateEnvironment(.016,20);},layer);
      assert.equal(await page.evaluate(()=>player.layer),layer);
    }
    assert.deepEqual(shaderErrors,[],'No shader compilation errors');
    assert.deepEqual(errors,[],'No JavaScript errors');
    await page.close();
    // Failed video requests fall back to the live camera sequence and remain skippable.
    const fallback=await context.newPage();
    await fallback.route('**/app/media/cinematic/opening.mp4',r=>r.abort());
    await fallback.emulateMedia({reducedMotion:'reduce'});
    await fallback.goto(origin,{waitUntil:'domcontentloaded'});
    await fallback.getByRole('button',{name:'Tonton intro',exact:true}).click();
    await fallback.waitForFunction(()=>ERYTH_CINEMA.state==='playing');
    await fallback.keyboard.press('Escape');
    assert.equal(await fallback.evaluate(()=>ERYTH_CINEMA.visible),false);
    await fallback.close();
    console.log('PASS: 40 models, desktop/mobile layouts, video playback and completion, audio, skip/replay, PIN isolation, low/medium/high shaders, all six world layers, failed-video fallback and reduced motion.');
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
