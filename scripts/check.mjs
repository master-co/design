import assert from 'node:assert/strict';
import {readFile,readdir,access} from 'node:fs/promises';
import {resolve,dirname,relative,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {parse} from 'yaml';
import {execFileSync} from 'node:child_process';
const root=fileURLToPath(new URL('../',import.meta.url)),skill=resolve(root,'skills/master-design');
const source=await readFile(resolve(skill,'SKILL.md'),'utf8'),front=source.match(/^---\n([\s\S]*?)\n---\n/);assert(front,'Missing YAML frontmatter');
const data=parse(front[1]);assert.equal(data.name,'master-design');assert(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.name));assert(data.name.length<=64);assert(typeof data.description==='string'&&data.description.length>0&&data.description.length<=1024);
async function files(directory){const list=[];for(const e of await readdir(directory,{withFileTypes:true})){if(['node_modules','.git','dist','artifacts'].includes(e.name))continue;const p=resolve(directory,e.name);if(e.isDirectory())list.push(...await files(p));else list.push(p);}return list;}
const all=await files(root);for(const file of all.filter(f=>/\.(?:mjs|js)$/.test(f)))execFileSync(process.execPath,['--check',file],{stdio:'pipe'});const entries=all.filter(f=>f.endsWith(`${sep}SKILL.md`));assert.deepEqual(entries,[resolve(skill,'SKILL.md')]);
for(const file of all.filter(p=>p.endsWith('.md'))){const text=await readFile(file,'utf8');assert(!/\[TODO:/.test(text),'Unfinished scaffold '+file);for(const m of text.matchAll(/\]\(([^)]+)\)/g)){const link=m[1];if(/^(?:https?:|#|mailto:)/.test(link))continue;const target=resolve(dirname(file),decodeURIComponent(link.split('#')[0]));await access(target);if(file.startsWith(skill+sep))assert(target.startsWith(skill+sep),'Installed reference escapes skill: '+relative(root,file));}}
const cases=JSON.parse(await readFile(resolve(root,'examples/interface-craft/cases.json'),'utf8'));assert.equal(cases.figures.length,35);assert.equal(new Set(cases.figures.map(f=>f.id)).size,35);assert.equal(cases.interactions.length,2);assert.equal(cases.supplementalFigures.length,4);for(const p of [...cases.figures,...cases.supplementalFigures,...cases.interactions])await access(resolve(skill,'references',p.topic+'.md'));
const ui=parse(await readFile(resolve(skill,'agents/openai.yaml'),'utf8'));assert(ui.interface.default_prompt.includes('$master-design'));
console.log('Verified one self-contained skill, YAML metadata, local links and 35 original + 4 avatar figures and 2 interaction mappings.');
