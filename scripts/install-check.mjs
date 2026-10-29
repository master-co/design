import {mkdtemp,cp,readFile,readdir,rm,mkdir,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
const root=resolve(import.meta.dirname,'..'),target=await mkdtemp(join(tmpdir(),'master-design-install-'));
try{
 const run=spawnSync('npx',['--yes','skills@1.4.9','add',root,'--skill','master-design','--agent','codex','--copy','--yes'],{cwd:target,encoding:'utf8',env:{...process.env,DISABLE_TELEMETRY:'1'}});
 if(run.status!==0)throw new Error(run.stdout+'\n'+run.stderr);
 const installed=join(target,'.agents/skills/master-design');
 const files=async(dir)=>{const out=[];for(const e of await readdir(dir,{withFileTypes:true})){const p=join(dir,e.name);out.push(...(e.isDirectory()?await files(p):[p]));}return out;};
 const all=await files(target);assert.equal(all.filter(p=>p.endsWith('/SKILL.md')).length,1);
 const source=join(root,'skills/master-design');
 for(const p of await files(source))assert.equal(await readFile(join(installed,p.slice(source.length+1)),'utf8'),await readFile(p,'utf8'));
 // The installed copy remains readable after moving it away from the checkout.
 const detached=join(target,'detached');await cp(installed,detached,{recursive:true});await rm(join(target,'.agents'),{recursive:true});
 assert.match(await readFile(join(detached,'references/surfaces.md'),'utf8'),/hairline/i);
 await mkdir(join(root,'artifacts'),{recursive:true});await writeFile(join(root,'artifacts/install.json'),JSON.stringify({result:'pass',installer:'skills@1.4.9',scope:'temporary project',skills:1,files:(await files(detached)).length,standalone:true},null,2));
 console.log(JSON.stringify({result:'pass',installer:'skills@1.4.9',scope:'temporary project',skills:1,files:(await files(detached)).length,standalone:true},null,2));
}finally{await rm(target,{recursive:true,force:true});}
