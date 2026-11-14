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
    report.browser=await send('Browser.getVersion',{},null);
    assert.equal(await evaluate('!!document.querySelector("#muteBtn")'),false);
    assert.equal(await evaluate('window.OX_SFX===undefined'),true);
    assert.equal(await evaluate('document.querySelectorAll(".level-card").length'),3);
    await click('[data-lang="zh"]');assert.equal(await evaluate('document.documentElement.lang'),'zh-Hans');
    await send('Page.navigate',{url});await wait('!!window.OX_DEBUG');
    assert.equal(await evaluate('document.documentElement.lang'),'zh-Hans');
    await click('[data-lang="en"]');
    await click('[data-play-style="guided"]');
    report.checks.push('Three age levels; sound off by default; language switches and persists');
    await evaluate(`document.querySelector('#nickInput').value='<Nova>';document.querySelector('#nickInput').dispatchEvent(new Event('input',{bubbles:true}))`);
    await click('[data-level="explorer"]');await wait('window.OX_DEBUG.state?.started');
    assert.equal(await evaluate('document.querySelector("#playerName").textContent'),'Nova');
    assert.equal(await evaluate('window.OX_DEBUG.hint.target'),'#btnGo');
    assert.equal(await evaluate('window.OX_DEBUG.countdown'),null);
    report.checks.push('Explorer starts with one mining target, nickname text and no countdown');
    if(process.env.OXYNEST_CAPTURE_QA==='1'){
      const capture=await send('Page.captureScreenshot',{format:'png'});
      fs.mkdirSync(path.join(root,'runtime'),{recursive:true});fs.writeFileSync(path.join(root,'runtime/kids-base-qa.png'),Buffer.from(capture.data,'base64'));
    }
    await click('[data-explain="power"]');await wait('!document.querySelector("#explainPanel").hidden');
    assert.match(await evaluate('document.querySelector("#explainPanel").textContent'),/Batteries/);await click('#explainClose');
    await click('#helpBtn');await wait('!document.querySelector("#explainPanel").hidden');await click('#explainClose');
    report.checks.push('Resource explanations and the question-mark help are visible before mining');
    let testedHelp=false;
    let testedWrong=false,testedInterruptedBuild=false,testedCardReload=false,seenChoices=new Set();
    async function progress(targetSession){
      const end=Date.now()+300000;
      while(Date.now()<end){
        const s=await evaluate('({modal:OX_DEBUG.modal,mode:OX_DEBUG.mode,hint:OX_DEBUG.hint,choice:OX_DEBUG.choice,state:OX_DEBUG.state,step:OX_DEBUG.step})');
        if(s.modal==='summary'){
          if(s.state.session>=targetSession)return s.state;
          await click('#sumNext');await sleep(160);continue;
        }
        assert.notEqual(s.modal,'fail','Guided correct choices should not fail');
        if(s.modal==='choice'&&s.choice){
          const {id,wrongOpt}=s.choice;
          if(!testedHelp){await click('#helpBtn');await wait('!document.querySelector("#explainPanel").hidden');await click('#explainClose');assert.equal(await evaluate('OX_DEBUG.modal'),"choice");testedHelp=true;report.checks.push('Help works over a live choice without dismissing the question');}
          seenChoices.add(id);
          if(wrongOpt){await click('#retryBtn');await sleep(150);continue;}
          const options=await evaluate(`window.OX_CONTENT.CHOICES[${JSON.stringify(id)}].roles`);
          if(!testedWrong&&id==='dust'){
            const before=s.state.m.survival;
            const wrong=Object.keys(options).find(k=>options[k]==='w');
            await click(`[data-act="pick"][data-val="${wrong}"]`);await wait('!!OX_DEBUG.choice?.wrongOpt');
            assert.equal(await evaluate('OX_DEBUG.state.m.survival'),before-8);
            assert.equal(await evaluate('OX_DEBUG.state.step'),s.state.step);
            testedWrong=true;report.checks.push('Wrong choice reduces survival and explains retry without advancing');
          }else{
            const correct=Object.keys(options).find(k=>options[k]==='c');
            await click(`[data-act="pick"][data-val="${correct}"]`);
          }
        }else if(s.modal==='card'){
          if(!testedCardReload){
            const before=JSON.stringify({rocks:s.state.rocks,stars:s.state.stars,book:s.state.book});
            await click('#homeBtn');await wait('OX_DEBUG.state===null');
            await click('[data-level="explorer"]');await wait('!!OX_DEBUG.state');
            assert.equal(await evaluate('JSON.stringify({rocks:OX_DEBUG.state.rocks,stars:OX_DEBUG.state.stars,book:OX_DEBUG.state.book})'),before);
            testedCardReload=true;report.checks.push('Leaving after a rewarded answer preserves its card and prevents duplicate rewards');
          }
          if(await evaluate('OX_DEBUG.modal==="card"'))await click('#cardOk');
        }else if(s.modal==='minemap'){await click('#zone-0');
        }else if(s.modal==='workshop'){await click('#playClose');
        }else if(s.modal==='build'){
          const target=s.hint?.target;
          if(target&&await evaluate(`!!document.querySelector(${JSON.stringify(target)})`)){
            const before=s.state.rocks;
            const isBattery=target==='#build-battery'||target.includes('battery');
            await click(target);
            if(!testedInterruptedBuild&&isBattery){
              await wait('OX_DEBUG.state.slots.some(x=>x?.type==="battery")');
              const paid=await evaluate('OX_DEBUG.state.rocks');assert.equal(paid,before-6);
              await click('#homeBtn');await wait('OX_DEBUG.state===null');
              await click('[data-level="explorer"]');await wait('!!OX_DEBUG.state');
              assert.equal(await evaluate('OX_DEBUG.state.rocks'),paid);
              assert.equal(await evaluate('OX_DEBUG.state.slots.filter(x=>x?.type==="battery").length'),1);
              testedInterruptedBuild=true;report.checks.push('Exit during construction keeps one paid building without losing materials twice');
            }
          }
        }else if(s.modal==='process'){
          const target=s.hint?.target;if(target)await click(target);
        }else if(s.mode==='dig'){
          const target=s.hint?.target;if(target)await click(target);
        }else if(s.mode==='base'&&!s.modal){
          const target=s.hint?.target;if(target)await click(target);
        }
        await sleep(140);
      }
      throw Error('Campaign timeout: '+await evaluate('JSON.stringify({mode:OX_DEBUG.mode,modal:OX_DEBUG.modal,hint:OX_DEBUG.hint,step:OX_DEBUG.step,state:OX_DEBUG.state})'));
    }
    const first=await progress(0);
    assert.ok(testedWrong);assert.ok(testedInterruptedBuild);assert.ok(testedCardReload);
    assert.ok(first.slots.some(x=>x?.type==='battery'));assert.ok(first.book.includes('night'));
    assert.equal(first.badges.length,1);
    report.checks.push('Explorer first mission reaches its learning summary through real mining, dust, battery and night choices');
    await click('#homeBtn');await wait('OX_DEBUG.state===null');await click('[data-level="explorer"]');await wait('OX_DEBUG.modal==="summary"');
    assert.equal(await evaluate('OX_DEBUG.state.badges.length'),1);
    report.checks.push('Reloading a completed summary does not grant a duplicate badge');
    const last=await progress(3);
    assert.equal(last.badges.length,4);
    for(const type of ['battery','processor','greenhouse','shelter','oxygen'])assert.ok(last.slots.some(x=>x?.type===type),type);
    assert.ok(last.book.includes('rocksAir'));assert.ok(last.book.includes('iceWater'));
    report.checks.push('All four Explorer missions complete, including processing, food, shelter, meteorites and the final building');
    report.choicesSeen=[...seenChoices];
    const saved=JSON.parse(await evaluate('localStorage.getItem("oxynest-kids-v1")'));
    await click('#sumNext');await wait('OX_DEBUG.state===null');
    assert.equal(await evaluate('JSON.parse(localStorage.getItem("oxynest-kids-v1")).saves.explorer.campaignComplete'),true);
    report.checks.push('The fourth mission has an explicit finish action that records campaign success and returns to the menu');
    saved.saves.explorer.m.survival=0;
    const retained=JSON.stringify({slots:saved.saves.explorer.slots,rocks:saved.saves.explorer.rocks,ice:saved.saves.explorer.ice,book:saved.saves.explorer.book});
    await evaluate(`localStorage.setItem('oxynest-kids-v1',${JSON.stringify(JSON.stringify(saved))})`);
    await send('Page.navigate',{url});await wait('!!window.OX_DEBUG');await click('[data-level="explorer"]');await wait('OX_DEBUG.modal==="fail"');
    assert.match(await evaluate('document.querySelector(".fbig").textContent'),/MISSION FAILED/);
    await click('[data-act="failQuit"]');await wait('OX_DEBUG.state===null');
    await click('[data-level="explorer"]');await wait('OX_DEBUG.modal==="fail"');
    await click('#failTry');await wait('OX_DEBUG.state.m.survival>0');
    assert.equal(await evaluate('JSON.stringify({slots:OX_DEBUG.state.slots,rocks:OX_DEBUG.state.rocks,ice:OX_DEBUG.state.ice,book:OX_DEBUG.state.book})'),retained);
    report.checks.push('Zero survival shows failure; Quit returns to menu; Try again preserves buildings, resources and learned cards');
    await click('#homeBtn');await wait('OX_DEBUG.state===null');
    await click('[data-level="engineer"]');await wait('!!OX_DEBUG.state');
    assert.equal(await evaluate('OX_CONTENT.LEVELS.engineer.countdown'),30);
    await click('#homeBtn');await wait('OX_DEBUG.state===null');await click('[data-level="commander"]');await wait('!!OX_DEBUG.state');
    assert.equal(await evaluate('OX_CONTENT.LEVELS.commander.chain'),true);
    report.checks.push('Engineer and Commander initialize with their own saved level and age settings');
    const toolFixture=JSON.parse(JSON.stringify(saved));
    Object.assign(toolFixture.saves.explorer,{session:4,step:0,rocks:40,summaryPending:false,campaignComplete:true});
    toolFixture.saves.explorer.m.survival=70;
    toolFixture.saves.explorer.expedition={total:30,zone:0,tools:{drill:0,tank:0,cargo:0},finds:[0]};
    await evaluate(`localStorage.setItem('oxynest-kids-v1',${JSON.stringify(JSON.stringify(toolFixture))})`);
    await send('Page.navigate',{url});await wait('!!window.OX_DEBUG');await click('[data-level="explorer"]');await wait('OX_DEBUG.mode==="base"');
    await click('#btnTools');await wait('OX_DEBUG.modal==="workshop"');await click('[data-act="tool"][data-val="drill"]');
    assert.equal(await evaluate('OX_DEBUG.state.rocks'),34);assert.equal(await evaluate('OX_DEBUG.state.expedition.tools.drill'),1);
    await click('#playClose');await click('#btnGo');await wait('OX_DEBUG.modal==="minemap"');await click('#zone-1');
    await wait('OX_DEBUG.mode==="dig"&&OX_DEBUG.hint.target==="#hitSpot"');
    assert.equal(await evaluate('document.querySelector("#stage").dataset.site'),'1');
    await click('#hitSpot');await sleep(200);await click('#hitSpot');await sleep(300);
    assert.match(await evaluate('document.querySelector("#mineProgress").textContent'),new RegExp("5 / 12"));
    await wait('OX_DEBUG.mode==="dig"');await click('#btnBack');await wait('OX_DEBUG.mode==="base"');
    assert.equal(await evaluate('OX_DEBUG.state.rocks'),39);
    report.checks.push('Seeded free-play fixture buys a drill, selects an unlocked ridge, breaks a tougher rock in two taps and banks its five-rock yield');
    for(const width of [1440,1280,1024]){
      await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});await sleep(150);
      assert.ok(await evaluate('document.documentElement.scrollWidth<=innerWidth+1'));
    }
    await click('[data-lang="zh"]');assert.equal(await evaluate('document.documentElement.lang'),'zh-Hans');
    await evaluate('document.fonts.ready');assert.equal(await evaluate('document.fonts.check("14px OX Noto SC")'),true);
    report.checks.push('Desktop viewport bounds and offline Chinese font loading pass');
    await evaluate(`localStorage.setItem('oxynest-kids-v1','{"saves":{"explorer":{"v":1}}}')`);
    await send('Page.navigate',{url});await wait('!!window.OX_DEBUG');await click('[data-level="explorer"]');await wait('!!OX_DEBUG.state');
    assert.equal(await evaluate('OX_DEBUG.state.rocks'),16);
    report.checks.push('Malformed saved mission safely falls back to a fresh game');
    await sleep(300);
    assert.deepEqual(report.errors,[]);assert.deepEqual(report.failedRequests,[]);assert.deepEqual(report.externalRequests,[]);
    report.status='passed';
    await send('Browser.close',{},null).catch(()=>{});

  }catch(e){report.status='failed';report.failure=e.message;throw e;}
  finally{
    socket?.close();browser.kill();server.closeAllConnections();await new Promise(resolve=>server.close(resolve));
    fs.mkdirSync(path.join(root,'runtime'),{recursive:true});
    fs.writeFileSync(path.join(root,'runtime/browser-smoke-report.json'),JSON.stringify(report,null,2)+'\n');
    console.log(JSON.stringify(report,null,2));
    // The isolated temporary profile is intentionally left for OS cleanup.
  }
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
