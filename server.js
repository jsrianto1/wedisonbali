import http from 'node:http';
import {readFile, stat, realpath} from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = await realpath(path.join(path.dirname(fileURLToPath(import.meta.url)), 'public'));
const mime = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.ttf':'font/ttf','.woff2':'font/woff2','.xml':'application/xml; charset=utf-8','.txt':'text/plain; charset=utf-8'};
const inside = p => p === root || p.startsWith(root + path.sep);
mime['.mp4'] = 'video/mp4';
const server = http.createServer(async (req,res) => {
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('X-Frame-Options','SAMEORIGIN');
  res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy','camera=(), microphone=(), geolocation=()');
  if (!['GET','HEAD'].includes(req.method)) {
    res.writeHead(405,{'Allow':'GET, HEAD'}); res.end(); return;
  }
  try {
    const uri = new URL(req.url,'http://localhost');
    const decoded = decodeURIComponent(uri.pathname);
    if (decoded.includes('\\') || decoded.includes('\0') || decoded.split('/').some(x=>x.startsWith('.'))) {
      res.writeHead(404);res.end();return;
    }
    let target = path.resolve(root,'.' + decoded);
    if (!inside(target)) {res.writeHead(404);res.end();return;}
    let info = await stat(target);
    if (info.isDirectory()) {
      if (!uri.pathname.endsWith('/')) {
        res.writeHead(308,{'Location':uri.pathname + '/' + uri.search});res.end();return;
      }
      target = path.join(target,'index.html');
    }
    target = await realpath(target);
    if (!inside(target)) {res.writeHead(404);res.end();return;}
    const ext=path.extname(target);
    if (ext === '.mp4') {
      const size=(await stat(target)).size;
      const headers={'Content-Type':'video/mp4','Accept-Ranges':'bytes','Cache-Control':'public, max-age=3600'};
      let start=0,end=size-1,status=200;
      if (req.headers.range) {
        const match=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
        if (!match || (!match[1] && !match[2])) {res.writeHead(416,{...headers,'Content-Range':`bytes */${size}`});res.end();return;}
        if (!match[1]) start=Math.max(0,size-Number(match[2]));
        else {start=Number(match[1]);if(match[2]) end=Math.min(end,Number(match[2]));}
        if (!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start>end||start>=size) {res.writeHead(416,{...headers,'Content-Range':`bytes */${size}`});res.end();return;}
        status=206;headers['Content-Range']=`bytes ${start}-${end}/${size}`;
      }
      res.writeHead(status,{...headers,'Content-Length':end-start+1});
      if(req.method==='HEAD'){res.end();return;}
      const stream=createReadStream(target,{start,end});
      stream.on('error',()=>res.destroy());
      res.on('close',()=>stream.destroy());
      stream.pipe(res);return;
    }
    const data = await readFile(target);
    res.writeHead(200,{'Content-Type':mime[ext] || 'application/octet-stream','Content-Length':data.length,'Cache-Control':ext==='.html'?'no-cache':ext==='.json'?'no-cache':'public, max-age=3600'});
    res.end(req.method==='HEAD'?undefined:data);
  } catch {
    const data=await readFile(path.join(root,'404.html'));
    res.writeHead(404,{'Content-Type':'text/html; charset=utf-8'});
    res.end(req.method==='HEAD'?undefined:data);
  }
});
server.listen(Number(process.env.PORT || 4173),process.env.HOST || '0.0.0.0',()=>console.log('Wedison Bali server ready on port '+(process.env.PORT || 4173)));
