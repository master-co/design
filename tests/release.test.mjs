import test from 'node:test';
import assert from 'node:assert/strict';
import {planRelease,readReleases,readSkillVersion} from '../scripts/release.mjs';

const skill=version=>`---\nname: master-design\ndescription: Test.\nmetadata:\n  version: "${version}"\n---\n\n# Master Design\n`;
const changelog=`# Changelog\n\n## Unreleased\n\n- Pending note.\n\n## 0.2.0 — 2026-11-12\n\n- Second.\n\n## 0.1.0 — 2026-10-30\n\n- First.\n`;

test('reads the skill version and the dated changelog sections, newest first',()=>{
 assert.equal(readSkillVersion(skill('0.2.0')),'0.2.0');
 assert.deepEqual(readReleases(changelog).map(r=>[r.version,r.date,r.notes]),[['0.2.0','2026-11-12','- Second.'],['0.1.0','2026-10-30','- First.']]);
});

test('a version without a tag is due, with the previous tag for comparison',()=>{
 const plan=planRelease({skill:skill('0.2.0'),changelog,tags:['v0.1.0']});
 assert.equal(plan.due,true);assert.equal(plan.tag,'v0.2.0');assert.equal(plan.previous,'0.1.0');assert.equal(plan.notes,'- Second.');
 assert.equal(planRelease({skill:skill('0.2.0'),changelog,tags:[]}).previous,undefined);
});

test('a tagged version is not released again',()=>{
 assert.equal(planRelease({skill:skill('0.2.0'),changelog,tags:['v0.1.0','v0.2.0']}).due,false);
});

test('rejects a skill version that disagrees with the changelog or goes backwards',()=>{
 assert.throws(()=>planRelease({skill:skill('0.3.0'),changelog,tags:[]}),/newest dated CHANGELOG\.md section is 0\.2\.0/);
 assert.throws(()=>planRelease({skill:skill('0.2.0'),changelog,tags:['v0.4.0']}),/not newer than the released 0\.4\.0/);
 assert.throws(()=>readSkillVersion(skill('0.2')),/x\.y\.z/);
});

test('rejects malformed, empty or misordered changelog sections',()=>{
 assert.throws(()=>readReleases('## 0.2.0 - 2026-11-12\n\n- Hyphen.\n'),/must read/);
 assert.throws(()=>readReleases('## 0.2.0 — 2026-11-12\n\n## 0.1.0 — 2026-10-30\n\n- First.\n'),/0\.2\.0 has no notes/);
 assert.throws(()=>readReleases('## 0.1.0 — 2026-10-30\n\n- A.\n\n## 0.2.0 — 2026-11-12\n\n- B.\n'),/newest first/);
 assert.throws(()=>readReleases('## 0.2.0 — 2026-11-12\n\n- B.\n\n## Unreleased\n\n- C.\n'),/first section/);
});
