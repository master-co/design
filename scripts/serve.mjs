import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,sep,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
const base=fileURLToPath(new URL('../examples/interface-craft/',import.meta.url));
export async function startServer({root=base,port=0}={}){
 const server=createServer(async(req,res)=>{try{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=resolve(root,pathname==='/'?'index.html':pathname.slice(1));
  if(!file.startsWith(resolve(root)+sep))throw new Error('Path outside example');
  const body=await readFile(file);res.writeHead(200,{'Content-Type':({'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.mjs':'text/javascript','.svg':'image/svg+xml','.woff2':'font/woff2','.png':'image/png','.webp':'image/webp'})[extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(body);
 }catch{res.writeHead(404);res.end('Not found');}});
 await new Promise((done,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',done);});
 return{server,origin:`http://127.0.0.1:${server.address().port}`};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){const {origin}=await startServer({port:Number(process.env.PORT||0)});console.log('Master Design example: '+origin);}
