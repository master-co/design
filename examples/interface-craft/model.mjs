import {projects,fixture} from './original/data.mjs';
export {projects,fixture};
export function filterProjects(query='',status='all') {
 const q=query.trim().toLocaleLowerCase('en');
 return projects.filter(p=>(status==='all'||(status==='progress'&&p.status==='In progress'))&&`${p.name} ${p.detail}`.toLocaleLowerCase('en').includes(q));
}
export function workspaceSummary(){return{projects:projects.length,openTasks:fixture.openTasks,reviews:fixture.inReview,completed:fixture.completed,previous:fixture.previousCompleted,changePercent:fixture.changePercent};}
