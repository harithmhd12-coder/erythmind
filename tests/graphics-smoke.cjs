/* Run with Node + Playwright while serving this repository.
   Authentication is isolated in-browser; no remote database writes are made. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require('playwright');
const origin=process.env.TEST_ORIGIN||'http://127.0.0.1:8000';
function grade(rgb){
  let c=rgb.map(v=>v/255).map(v=>v/(1+Math.max(v-.82,0)*1.6));
  const l=c[0]*.2126+c[1]*.7152+c[2]*.0722;
  const u=Math.min(1,Math.max(0,(l-.12)/(.78-.12))),blend=u*u*(3-2*u);
  const shadow=[.86,.96,1.12],light=[1.08,1,.86],lift=[.012,.016,.03];
  return c.map((v,i)=>{v=(l+(v-l)*.84)*(shadow[i]+(light[i]-shadow[i])*blend);return Math.round((v*.68+v*v*(3-2*v)*.32+lift[i])*255);});
}
(async()=>{
  const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
  try{
    const context=await browser.newContext({serviceWorkers:'block'});
    await context.route('**/app/config.js',r=>r.fulfill({contentType:'text/javascript',body:'window.ERYTH_CONFIG={};'}));
    await context.route('https://fonts.googleapis.com/**',r=>r.abort());
    const page=await context.newPage();const errors=[],shaderErrors=[],requests=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('request',r=>requests.push(r.url()));
    page.on('console',m=>{if(m.type()==='error'&&/shader|VALIDATE_STATUS|GL_INVALID/i.test(m.text()))shaderErrors.push(m.text())});
    // Render explicit frames for colour assertions without a costly continuous software-GPU loop.
    await page.addInitScript(()=>window.addEventListener('DOMContentLoaded',()=>{renderWorld=()=>{};}));
    await page.setViewportSize({width:800,height:500});
    await page.goto(origin,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>typeof HF!=='undefined'&&HF.allDone,null,{timeout:90000});
    assert.equal(await page.evaluate(()=>HF.done),40);
    assert.equal(await page.locator('#gate').isVisible(),true,'Open directly at the access gate');
    assert.equal(await page.locator('#cinema,video,.cinema-replay').count(),0,'No intro, video or replay');
    assert.equal(requests.some(u=>/cinematic|opening\.(mp4|webp)/.test(u)),false,'No intro asset downloads');
    assert.equal(await page.locator('.gate-brand-logo').evaluate(img=>img.complete&&img.naturalWidth>0),true);
    assert.equal(await page.evaluate(()=>RTS.on),true,'Original default style retained');
    const colours=[[64,128,64],[160,104,48],[128,152,192]];
    const readings=await page.evaluate(colours=>{
      const probe=new THREE.Scene(),eye=new THREE.OrthographicCamera(-1,1,1,-1,.1,10);eye.position.z=2;
      const mat=new THREE.MeshBasicMaterial();probe.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),mat));
      const read=()=>{const gl=renderer.getContext(),p=new Uint8Array(4);gl.readPixels(32,32,1,1,gl.RGBA,gl.UNSIGNED_BYTE,p);return [...p].slice(0,3);};
      renderer.setPixelRatio(1);renderer.setSize(64,64);setGfx('ringan');composer.setPixelRatio(1);composer.setSize(64,64);
      const renderPass=composer.passes[0],previousScene=renderPass.scene,previousCamera=renderPass.camera;
      const out=[];
      for(const rgb of colours){
        mat.color.setRGB(...rgb.map(v=>v/255));renderer.render(probe,eye);const direct=read();
        renderPass.scene=probe;renderPass.camera=eye;
        gradePass.uniforms.night.value=0;gradePass.uniforms.warm.value=0;gradePass.uniforms.rts.value=0;gradePass.uniforms.edge.value=0;gradePass.uniforms.time.value=0;gradePass.uniforms.res.value.set(64,64);
        composer.render(.016);out.push({direct,graded:read()});
      }
      renderPass.scene=previousScene;renderPass.camera=previousCamera;mat.dispose();probe.children[0].geometry.dispose();resize();
      return out;
    },colours);
    for(let i=0;i<colours.length;i++)for(let channel=0;channel<3;channel++){
      assert.ok(Math.abs(readings[i].direct[channel]-colours[i][channel])<=1,`Direct colour ${i}: ${readings[i].direct}`);
      assert.ok(Math.abs(readings[i].graded[channel]-grade(colours[i])[channel])<=2,`Graded colour ${i}: ${readings[i].graded}, expected ${grade(colours[i])}`);
    }
    await page.evaluate(async()=>{await createWorld('82469137');timeCtl.mode='manual';timeCtl.minutes=12*60;});
    assert.equal(await page.evaluate(()=>session.role),'owner');
    // Frame updates and model loading must not progressively darken shared authored colours.
    const materialColours=await page.evaluate(()=>{
      const before=[roadMat.color.getHex(),wood.color.getHex(),robotMat.color.getHex()];
      for(let i=0;i<20;i++)updateEnvironment(.1,i);
      return {before,after:[roadMat.color.getHex(),wood.color.getHex(),robotMat.color.getHex()]};
    });
    assert.deepEqual(materialColours.after,materialColours.before);
    assert.deepEqual(materialColours.before,[0x2f3446,0x8a6a4a,0xe9edf6]);
    await page.setViewportSize({width:640,height:400});
    for(const style of [true,false]){
      for(const tier of [0,2,3]){
        await page.evaluate(({style,tier})=>{setGaya(style);setQuality(tier);}, {style,tier});
        await page.waitForFunction(()=>[...Object.values(REAL.tex),...Object.values(RTS.tex)].every(t=>t.image?.complete&&t.image.naturalWidth>0));
        const screenshot=await page.evaluate(({style,tier})=>{
          setLayer(0);applyLayers();
          camera.position.set(115,100,160);camera.lookAt(100,8,-30);camera.far=1400;camera.updateProjectionMatrix();updateEnvironment(.1,20);
          renderer.render(scene,camera);if(tier===3&&composer)composer.render(.016);
          return renderer.domElement.toDataURL('image/png').split(',')[1];
        },{style,tier});
        if(tier===2)fs.writeFileSync(`/tmp/erythmind-colours-${style?'rts':'fantasy'}.png`,Buffer.from(screenshot,'base64'));
      }
    }
    for(const layer of [0,1,2,3,4,5]){
      await page.evaluate(layer=>{setLayer(layer);applyLayers();updateEnvironment(.016,20);},layer);
      assert.equal(await page.evaluate(()=>player.layer),layer);
    }
    // Returning to a locked gate on phones still has no intro and keeps secure access controls.
    await page.evaluate(()=>lock());await page.setViewportSize({width:390,height:844});
    assert.equal(await page.locator('#gate').isVisible(),true);
    assert.equal(await page.locator('video,#cinema').count(),0);
    assert.deepEqual(shaderErrors,[],'No shader errors');assert.deepEqual(errors,[],'No JS errors');
    console.log('PASS: 40 models; direct gate/no intro downloads; logo; measured direct/graded colour swatches; stable authored colours; RTS/fantasy at three quality tiers; six layers; mobile gate.');
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
