import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
const root=resolve(import.meta.dirname,'public');
const types={'.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.html':'text/html; charset=utf-8','.mp4':'video/mp4','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.otf':'font/otf','.ttf':'font/ttf','.xml':'application/xml','.txt':'text/plain'};
createServer(async(req,res)=>{try{
const path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
if(path==='/health'){res.writeHead(200);res.end('ok');return;}
if(path==='/gpdevendas'){res.writeHead(301,{Location:'/'});res.end();return;}
const file=resolve(root,'.'+(path==='/'?'/index.html':path));
if(file.startsWith(root+sep)&&types[extname(file)]){const data=await readFile(file);
const headers={'Content-Type':types[extname(file)],'X-Content-Type-Options':'nosniff','Cache-Control':'no-cache','Accept-Ranges':'bytes'};
const range=req.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
if(range){const start=Number(range[1]);const end=Math.min(range[2]?Number(range[2]):data.length-1,data.length-1);if(start>end||start>=data.length){res.writeHead(416,{'Content-Range':`bytes */${data.length}`});res.end();return;}res.writeHead(206,{...headers,'Content-Range':`bytes ${start}-${end}/${data.length}`,'Content-Length':end-start+1});res.end(req.method==='HEAD'?undefined:data.subarray(start,end+1));return;}
res.writeHead(200,{...headers,'Content-Length':data.length});res.end(req.method==='HEAD'?undefined:data);return;}
}catch{}res.writeHead(404);res.end('Página não encontrada');}).listen(Number(process.env.PORT||3000),'0.0.0.0');
