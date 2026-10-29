import test from 'node:test';
import assert from 'node:assert/strict';
import {filterProjects,workspaceSummary,projects} from '../examples/interface-craft/model.mjs';
import {curveFor} from '../examples/interface-craft/original/chart.mjs';
import {current,previous} from '../examples/interface-craft/original/data.mjs';
test('search and status compose without altering workspace totals',()=>{assert.equal(filterProjects('BILLING','progress').length,1);assert.equal(filterProjects('  onboarding  ').length,1);assert.equal(filterProjects('absent').length,0);assert.equal(filterProjects('','archived').length,0);assert.equal(filterProjects('','progress').length,2);assert.equal(projects.length,4);assert.deepEqual(workspaceSummary(),{projects:4,openTasks:18,reviews:3,completed:84,previous:70,changePercent:20});});
test('chart segments stay inside each input interval',()=>{for(const values of [current,previous])for(const s of curveFor(values).segments){const low=Math.min(s.start.y,s.end.y),high=Math.max(s.start.y,s.end.y);assert(s.c1.y>=low&&s.c1.y<=high);assert(s.c2.y>=low&&s.c2.y<=high);}});
