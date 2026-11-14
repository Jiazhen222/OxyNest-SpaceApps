'use strict';
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.woff2':'font/woff2','.txt':'text/plain; charset=utf-8'};

function createServer(root, {basePath='/'}={}) {
  const directory=fs.realpathSync(root);
  return http.createServer((req,res)=>{
    try {
      if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
      let urlPath=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
      if(!urlPath.startsWith(basePath)){res.writeHead(404);res.end();return;}
      urlPath=urlPath.slice(basePath.length);
      if(urlPath.endsWith('/')||!urlPath) urlPath+='index.html';
      const file=path.resolve(directory,urlPath);
      if(!file.startsWith(directory+path.sep)||urlPath.split(/[\\/]/).some(part=>part.startsWith('.'))) {res.writeHead(403);res.end();return;}
      if(!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
      const real=fs.realpathSync(file);
      if(!real.startsWith(directory+path.sep)){res.writeHead(403);res.end();return;}
      res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
      if(req.method==='HEAD')res.end();else fs.createReadStream(file).pipe(res);
    }catch{res.writeHead(400);res.end();}
  });
}
function listenAvailable(server,start=8000){
  return new Promise((resolve,reject)=>{
    let port=start,attempts=0;
    const attempt=()=>{
      const onError=error=>{server.removeListener('listening',onReady);if(error.code==='EADDRINUSE'&&attempts++<10&&port<65535){port++;attempt();}else reject(error);};
      const onReady=()=>{server.removeListener('error',onError);resolve(port);};
      server.once('error',onError);server.once('listening',onReady);server.listen(port,'127.0.0.1');
    };
    attempt();
  });
}
if(require.main===module){
  const root=path.resolve(__dirname,'../dist');
  if(!fs.existsSync(path.join(root,'index.html'))){console.error('Build the game first: npm run build');process.exitCode=1;}
  else {
    const server=createServer(root);
    listenAvailable(server).then(port=>{
      const url=`http://localhost:${port}`;console.log(`OxyNest: ${url} (Ctrl+C to stop)`);
      if(port!==8000)console.log('Another server is using port 8000. This address serves the current build; browser saves remain at their original address.');
      if(process.argv.includes('--open')&&process.platform==='win32'){
        const {spawn}=require('node:child_process');
        spawn('powershell.exe',['-NoProfile','-WindowStyle','Hidden','-Command',`Start-Process '${url}'`],{windowsHide:true,stdio:'ignore'}).on('error',()=>console.log(`Open ${url} in your browser.`));
      }
    }).catch(e=>{console.error(`Could not start local server: ${e.message}`);process.exitCode=1;});
  }
}
module.exports={createServer,listenAvailable};
