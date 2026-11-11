// Release plan and package for the master-design skill.
//
// The skill ships from GitHub, not npm, so a release is a `v<version>` tag, a GitHub release
// and a zip of the installed folder. The version lives in SKILL.md `metadata.version`; the notes
// are the matching dated section of CHANGELOG.md. A push to main releases when that version has
// no tag yet. See CONTRIBUTING.md, "Release a version".
//
//   node scripts/release.mjs check                 consistency only (run by `bun run check`)
//   node scripts/release.mjs plan [--github]       print the plan; --github writes step outputs
//   node scripts/release.mjs pack <directory>      write notes, zip and checksum for the plan
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,appendFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {parse} from 'yaml';

const root=fileURLToPath(new URL('../',import.meta.url));
const versionPattern=/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;

/** The `metadata.version` of a SKILL.md source. */
export function readSkillVersion(source){
 const front=source.match(/^---\n([\s\S]*?)\n---\n/);
 assert(front,'SKILL.md has no YAML frontmatter');
 const version=parse(front[1])?.metadata?.version;
 assert(typeof version==='string'&&versionPattern.test(version),`SKILL.md metadata.version must be a quoted x.y.z version, not ${JSON.stringify(version)}`);
 return version;
}

/** Dated sections of a changelog, newest first: `## x.y.z — YYYY-MM-DD` followed by its notes. */
export function readReleases(changelog){
 const releases=[];
 const headings=[...changelog.matchAll(/^## (.+)$/gm)];
 headings.forEach((heading,index)=>{
  const title=heading[1].trim();
  if(title==='Unreleased')return;
  const match=title.match(/^(\S+) — (\d{4}-\d{2}-\d{2})$/);
  assert(match&&versionPattern.test(match[1]),`CHANGELOG.md heading "## ${title}" must read "## x.y.z — YYYY-MM-DD" or "## Unreleased"`);
  const end=headings[index+1]?.index??changelog.length;
  const notes=changelog.slice(heading.index+heading[0].length,end).trim();
  assert(notes,`CHANGELOG.md ${match[1]} has no notes`);
  releases.push({version:match[1],date:match[2],notes});
 });
 assert(releases.length,'CHANGELOG.md has no dated release');
 releases.forEach((release,index)=>{
  const older=releases[index+1];
  if(older)assert(compareVersions(release.version,older.version)>0,`CHANGELOG.md lists ${release.version} above ${older.version}; keep newest first`);
 });
 const unreleased=headings.findIndex(h=>h[1].trim()==='Unreleased');
 if(unreleased>=0)assert.equal(unreleased,0,'"## Unreleased" must be the first section of CHANGELOG.md');
 return releases;
}

export function compareVersions(a,b){
 const x=a.split('.').map(Number),y=b.split('.').map(Number);
 for(let i=0;i<3;i++)if(x[i]!==y[i])return x[i]-y[i];
 return 0;
}

/**
 * Decides whether the current sources call for a release.
 * `tags` are the existing `v*` tag names. Returns the version, its notes and whether it is due.
 */
export function planRelease({skill,changelog,tags}){
 const version=readSkillVersion(skill);
 const [latest]=readReleases(changelog);
 assert.equal(latest.version,version,`SKILL.md is ${version} but the newest dated CHANGELOG.md section is ${latest.version}; bump both together`);
 const tag=`v${version}`;
 const released=tags.filter(t=>/^v\d+\.\d+\.\d+$/.test(t)).map(t=>t.slice(1)).sort(compareVersions);
 const newest=released.at(-1);
 const due=!released.includes(version);
 if(due&&newest)assert(compareVersions(version,newest)>0,`${version} is not newer than the released ${newest}`);
 return {version,tag,date:latest.date,notes:latest.notes,due,previous:due?newest:released.filter(v=>compareVersions(v,version)<0).at(-1)};
}

function read(path){return readFileSync(resolve(root,path),'utf8');}
function git(...args){return execFileSync('git',args,{cwd:root,encoding:'utf8'}).trim();}
function currentPlan(){
 return planRelease({skill:read('skills/master-design/SKILL.md'),changelog:read('CHANGELOG.md'),tags:git('tag','--list','v*').split('\n').filter(Boolean)});
}

function releaseNotes(plan){
 const install=[
  '## Install',
  '',
  '```sh',
  `npx skills add https://github.com/master-co/design/tree/${plan.tag} --skill master-design`,
  '```',
  '',
  `\`master-design-${plan.version}.zip\` holds the same \`master-design\` folder for agents that load skills from a directory.`
 ].join('\n');
 const compare=plan.previous?`\n\n**Full changes:** https://github.com/master-co/design/compare/v${plan.previous}...${plan.tag}`:'';
 return `${plan.notes}\n\n${install}${compare}\n`;
}

async function main([command='plan',...args]){
 if(command==='check'){
  const plan=planRelease({skill:read('skills/master-design/SKILL.md'),changelog:read('CHANGELOG.md'),tags:[]});
  console.log(`Verified release metadata: SKILL.md and CHANGELOG.md agree on ${plan.version}.`);
  return;
 }
 const plan=currentPlan();
 if(command==='plan'){
  if(args.includes('--github')){
   const output=process.env.GITHUB_OUTPUT;assert(output,'GITHUB_OUTPUT is not set');
   appendFileSync(output,`due=${plan.due}\nversion=${plan.version}\ntag=${plan.tag}\n`);
   const summary=process.env.GITHUB_STEP_SUMMARY;
   if(summary)appendFileSync(summary,plan.due?`### Releasing ${plan.tag}\n\n${releaseNotes(plan)}`:`### No release\n\n${plan.tag} is already released; bump SKILL.md and CHANGELOG.md to release again.\n`);
  }
  console.log(plan.due?`Release due: ${plan.tag}${plan.previous?` (after v${plan.previous})`:''}\n\n${releaseNotes(plan)}`:`No release: ${plan.tag} already exists.`);
  return;
 }
 if(command==='pack'){
  const directory=resolve(args[0]??resolve(root,'artifacts/release'));
  mkdirSync(directory,{recursive:true});
  // Only committed files: the archive is the tree at HEAD, never local edits or ignored output.
  const zip=resolve(directory,`master-design-${plan.version}.zip`);
  git('archive','--format=zip',`--prefix=master-design/`,'-o',zip,'HEAD:skills/master-design');
  const sum=createHash('sha256').update(readFileSync(zip)).digest('hex');
  writeFileSync(`${zip}.sha256`,`${sum}  master-design-${plan.version}.zip\n`);
  writeFileSync(resolve(directory,'notes.md'),releaseNotes(plan));
  console.log(JSON.stringify({version:plan.version,tag:plan.tag,due:plan.due,zip,sha256:sum},null,2));
  return;
 }
 throw new Error(`Unknown command ${command}. Use check, plan or pack.`);
}

if(process.argv[1]===fileURLToPath(import.meta.url))await main(process.argv.slice(2));
