'use strict';
// Isolated headless browser checks; optional internal QA capture, no user-browser interaction.
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {spawn}=require('node:child_process');
const assert=require('node:assert/strict');
const {once}=require('node:events');
const {createServer}=require('./serve.cjs');
const root=path.resolve(__dirname,'..');
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));

async function main(){
  const binary=process.env.OXYNEST_BROWSER_PATH||[
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Google/Chrome/Application/chrome.exe'
  ].find(f=>fs.existsSync(f));
  if(!binary)throw Error('No supported browser found; set OXYNEST_BROWSER_PATH.');
  const profile=fs.mkdtempSync(path.join(os.tmpdir(),'oxynest-browser-'));
  const server=createServer(path.join(root,'dist'),{basePath:'/OxyNest/'});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const url=`http://127.0.0.1:${server.address().port}/OxyNest/`;
  const browser=spawn(binary,['--headless=new','--mute-audio','--disable-gpu','--no-first-run','--no-default-browser-check','--remote-debugging-port=0','--remote-debugging-address=127.0.0.1',`--user-data-dir=${profile}`,'about:blank'],{windowsHide:true,stdio:['ignore','ignore','pipe']});
  let socket;
  const report={basePath:'/OxyNest/',checks:[],errors:[],failedRequests:[],externalRequests:[]};
  try{
    const endpoint=await new Promise((resolve,reject)=>{
      let output='';const timer=setTimeout(()=>reject(Error('Browser startup timed out')),20000);
      browser.once('error',e=>{clearTimeout(timer);reject(e);});
      browser.once('exit',code=>{clearTimeout(timer);reject(Error(`Browser exited early: ${code}`));});
      browser.stderr.on('data',chunk=>{output+=chunk;const found=output.match(/DevTools listening on (ws:\/\/[^\s]+)/);if(found){clearTimeout(timer);resolve(found[1]);}});
    });
    socket=new WebSocket(endpoint);await once(socket,'open');
    let nextId=0,session;const pending=new Map();
    socket.addEventListener('message',e=>{
      const m=JSON.parse(String(e.data));
      if(m.id){const p=pending.get(m.id);if(p){clearTimeout(p.timer);pending.delete(m.id);m.error?p.reject(Error(m.error.message)):p.resolve(m.result);}}
      else if(!m.sessionId||m.sessionId===session){
        if(m.method==='Runtime.exceptionThrown') report.errors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text);
        if(m.method==='Runtime.consoleAPICalled'&&m.params.type==='error')report.errors.push(m.params.args.map(a=>a.value||a.description).join(' '));
        if(m.method==='Network.responseReceived'&&m.params.response.status>=400)report.failedRequests.push({url:m.params.response.url,status:m.params.response.status});
        if(m.method==='Network.loadingFailed'&&!m.params.canceled)report.failedRequests.push({error:m.params.errorText});
        if(m.method==='Network.requestWillBeSent'&&!m.params.request.url.startsWith('data:')&&new URL(m.params.request.url).origin!==new URL(url).origin)report.externalRequests.push(m.params.request.url);
      }
    });
    const send=(method,params={},target=session)=>new Promise((resolve,reject)=>{
      const id=++nextId;const timer=setTimeout(()=>{pending.delete(id);reject(Error(`CDP timeout: ${method}`));},15000);
      pending.set(id,{resolve,reject,timer});socket.send(JSON.stringify({id,method,params,...(target?{sessionId:target}:{})}));
    });
    const {targetId}=await send('Target.createTarget',{url:'about:blank'});
    ({sessionId:session}=await send('Target.attachToTarget',{targetId,flatten:true},null));
    await send('Page.enable');await send('Runtime.enable');await send('Network.enable');
    await send('Page.addScriptToEvaluateOnNewDocument',{source:"try { localStorage.setItem('oxynest.tutorial.done','1'); } catch {}"});
    const evaluate=async expression=>{
      const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
      if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);
      return r.result.value;
    };
    const wait=async expression=>{const end=Date.now()+15000;while(Date.now()<end){if(await evaluate(expression))return;await sleep(100);}throw Error(`Page condition timed out: ${expression}`);};
    const click=async selector=>{
      const point=await evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e||e.disabled||e.closest('[inert]'))throw Error('Unavailable control');for(let p=e.parentElement;p;p=p.parentElement)if(p.tagName==='DETAILS')p.open=true;e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();if(!r.width||!r.height)throw Error('Hidden control');return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);
      await send('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...point});
      await send('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...point});
    };
    await send('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
    await send('Page.navigate',{url});await wait('!!window.OX_DEBUG');
    assert.equal(await evaluate('document.querySelector("[data-play-style=settlement]").getAttribute("aria-pressed")'),'true');
    await click('[data-level="explorer"]');await wait('!!OX_DEBUG.state?.settlement');
    assert.equal(await evaluate('OX_DEBUG.state.rocks'),16);assert.equal(await evaluate('OX_DEBUG.hint.target'),null);
    report.checks.push('A fresh player starts autonomous settlement with materials, no forced arrow and ice access');
    await click('#slot0 .plus');await wait('OX_DEBUG.modal==="build"');
    for(const id of ['solar','battery','processor','oxygen'])assert.equal(await evaluate(`document.querySelector('[data-act="build"][data-val="${id}"]').disabled`),false);
    await click('[data-act="build"][data-val="processor"]');await wait('OX_DEBUG.mode==="base"');
    assert.equal(await evaluate('OX_DEBUG.modal'),null);assert.equal(await evaluate('OX_DEBUG.state.slots[0].type'),'processor');
    await click('#slot1 .plus');await wait('OX_DEBUG.modal==="build"');await click('[data-act="build"][data-val="solar"]');await wait('OX_DEBUG.mode==="base"');
    assert.equal(await evaluate('OX_DEBUG.state.rocks'),2);
    report.checks.push('Player chooses Processor before battery, then solar, without a quiz or imposed build order');
    if(process.env.OXYNEST_CAPTURE_QA==='1'){
      await sleep(350);const capture=await send('Page.captureScreenshot',{format:'png'});fs.mkdirSync(path.join(root,'runtime'),{recursive:true});fs.writeFileSync(path.join(root,'runtime/settlement-base-qa.png'),Buffer.from(capture.data,'base64'));
    }
    await click('#bw0');await wait('OX_DEBUG.modal==="industry"');await click('[data-act="colonyStart"][data-val="rockAir"]');
    assert.equal(await evaluate('OX_DEBUG.state.rocks'),0);assert.equal(await evaluate('OX_DEBUG.state.settlement.jobs.length'),1);
    await click('[data-act="close"]');await click('#homeBtn');await wait('OX_DEBUG.state===null');
    await send('Page.navigate',{url});await wait('!!window.OX_DEBUG');await click('[data-level="explorer"]');await wait('!!OX_DEBUG.state?.settlement');
    assert.equal(await evaluate('OX_DEBUG.state.rocks'),0);assert.equal(await evaluate('OX_DEBUG.state.settlement.jobs.length'),1);
    await wait('!!document.querySelector("[data-collect]:not(:disabled)")');await click('[data-collect]');
    assert.equal(await evaluate('OX_DEBUG.state.settlement.stock.air'),2);assert.equal(await evaluate('OX_DEBUG.state.settlement.jobs.length'),0);
    report.checks.push('Production pays once, survives exit/reload, and finished goods are collected once into stock');
    await click('#bw0');await wait('OX_DEBUG.modal==="industry"');await click('[data-act="colonyMove"]');await click('#slot4 .plus');
    assert.equal(await evaluate('OX_DEBUG.state.slots[4].type'),'processor');assert.equal(await evaluate('OX_DEBUG.state.slots[0]'),null);
    report.checks.push('Player moves a built Processor to a different plot and layout persists');
    await click('#bw1');await wait('OX_DEBUG.modal==="industry"');await click('[data-act="colonyStart"][data-val="charge"]');await click('[data-act="close"]');
    await click('#btnIce');await wait('OX_DEBUG.mode==="dig"');assert.equal(await evaluate('OX_DEBUG.modal'),null);
    await sleep(5500);assert.equal(await evaluate('OX_DEBUG.state.settlement.jobs[0].recipe'),'charge');
    await click('#btnBack');await wait('OX_DEBUG.mode==="base"');await click('[data-collect]');
    report.checks.push('A solar job finishes while the player visits the crater; no mining quiz blocks the visit');
    const before=JSON.parse(await evaluate('localStorage.getItem("oxynest-kids-v1")'));
    const fixture=before.colonies.explorer;
    fixture.rocks=60;fixture.ice=8;fixture.slots[2]={type:'greenhouse',lv:1};fixture.slots[3]={type:'water',lv:1};
    Object.assign(fixture.settlement,{level:1,credits:0,orders:0,produced:6,celebrated:false,jobs:[],stock:{air:12,water:12,food:12,usedWater:6}});
    await evaluate(`localStorage.setItem('oxynest-kids-v1',${JSON.stringify(JSON.stringify(before))})`);
    await send('Page.navigate',{url});await wait('!!window.OX_DEBUG');await click('[data-level="explorer"]');await wait('!!OX_DEBUG.state?.settlement');
    await click('#btnOrders');await wait('OX_DEBUG.modal==="orders"');
    if(process.env.OXYNEST_CAPTURE_QA==='1'){
      await sleep(350);const capture=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(root,'runtime/settlement-orders-qa.png'),Buffer.from(capture.data,'base64'));
    }
    await click('[data-act="colonyDeliver"][data-val="air:0"]');await click('[data-act="colonyDeliver"][data-val="water:1"]');
    assert.equal(await evaluate('OX_DEBUG.state.settlement.credits'),28);await click('[data-act="colonyExpand"]');assert.equal(await evaluate('OX_DEBUG.state.settlement.level'),2);
    await click('[data-act="colonyDeliver"][data-val="food:2"]');await click('[data-act="colonyDeliver"][data-val="mixed:3"]');await click('[data-act="colonyExpand"]');
    assert.equal(await evaluate('OX_DEBUG.state.settlement.level'),3);
    await click('[data-act="colonyDeliver"][data-val="ice:4"]');await click('[data-act="colonyDeliver"][data-val="rocks:5"]');await wait('OX_DEBUG.modal==="colonyWin"');
    assert.equal(await evaluate('OX_DEBUG.state.settlement.orders'),6);assert.equal(await evaluate('OX_DEBUG.state.settlement.celebrated'),true);
    await click('[data-act="close"]');assert.equal(await evaluate('OX_DEBUG.mode'),'base');
    report.checks.push('A seeded stocked base delivers six different chosen orders, funds two expansions and reaches the explicit outpost goal');
    await click('#homeBtn');await wait('OX_DEBUG.state===null');await click('[data-play-style="guided"]');await click('[data-level="explorer"]');await wait('!!OX_DEBUG.state');
    assert.equal(await evaluate('!!OX_DEBUG.state.settlement'),false);assert.equal(await evaluate('OX_DEBUG.state.rocks'),0);
    await click('#homeBtn');await click('[data-play-style="settlement"]');await click('[data-level="explorer"]');await wait('!!OX_DEBUG.state?.settlement');
    assert.equal(await evaluate('OX_DEBUG.state.settlement.level'),3);
    report.checks.push('Guided and autonomous saves are independent and switching modes does not overwrite either base');
    await click('[data-lang="zh"]');assert.equal(await evaluate('document.documentElement.lang'),'zh-Hans');await click('#btnOrders');await wait('OX_DEBUG.modal==="orders"');
    await evaluate('document.fonts.ready');assert.equal(await evaluate('document.fonts.check("14px OX Noto SC")'),true);
    assert.ok(await evaluate('document.documentElement.scrollWidth<=innerWidth+1'));
    report.checks.push('The settlement warehouse and order interface render in Chinese with local fonts and no page overflow');
    assert.deepEqual(report.errors,[]);assert.deepEqual(report.failedRequests,[]);assert.deepEqual(report.externalRequests,[]);report.status='passed';
    await send('Browser.close',{},null).catch(()=>{});

  }catch(e){report.status='failed';report.failure=e.message;throw e;}
  finally{
    socket?.close();browser.kill();server.closeAllConnections();await new Promise(resolve=>server.close(resolve));
    fs.mkdirSync(path.join(root,'runtime'),{recursive:true});
    fs.writeFileSync(path.join(root,'runtime/settlement-browser-report.json'),JSON.stringify(report,null,2)+'\n');
    console.log(JSON.stringify(report,null,2));
    // The isolated temporary profile is intentionally left for OS cleanup.
  }
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
