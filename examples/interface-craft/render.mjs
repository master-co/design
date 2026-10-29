import {renderStack} from './avatar/render.mjs';
import {people} from './original/data.mjs';
import {parseHTML} from 'linkedom';
import {renderDashboard} from './original/dashboard.mjs';
import {fineIcon as icon} from './original/finishing.mjs';
import {projects,fixture} from './model.mjs';

export function renderWorkspace(){
 const {document}=parseHTML(renderDashboard());
 document.head.innerHTML=`<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Interface craft — interactive workspace</title><link rel="icon" href="data:,"><link rel="stylesheet" href="./fonts.css"><link rel="stylesheet" href="./original/styles.css"><link rel="stylesheet" href="./tokens.css"><link rel="stylesheet" href="./prototype.css"><link rel="stylesheet" href="./avatar/avatar.css">`;
 document.body.className='md-live';
 const q=s=>document.querySelector(s);
 const element=(tag,attrs={},html='')=>{const e=document.createElement(tag);for(const [k,v]of Object.entries(attrs))e.setAttribute(k,String(v));e.innerHTML=html;return e;};
 const retag=(old,tag,attrs={})=>{const e=element(tag,Object.fromEntries([...old.attributes].map(a=>[a.name,a.value])),old.innerHTML);for(const[k,v]of Object.entries(attrs))e.setAttribute(k,String(v));old.replaceWith(e);return e;};
 q('.article-dash-plate-heading>span').textContent='35';
 q('.article-dash-sidebar').id='workspace-navigation';
 q('.article-dash-spaces-label>.article-dash-icon')?.remove();
 q('.article-dash-brand>.article-dash-icon')?.remove();q('.article-dash-account>.article-dash-icon')?.remove();
 const search=q('.article-dash-search');retag(search,'label',{'for':'project-search'}).innerHTML=`${icon('search',16)}<span class="md-sr-only">Search projects</span><input id="project-search" type="search" placeholder="Search projects" autocomplete="off" disabled><kbd aria-hidden="true">⌘ K</kbd>`;
 const nav=q('.article-dash-nav-group');retag(nav,'nav',{'aria-label':'Workspace sections'});
 for(const [i,old]of [...document.querySelectorAll('.article-dash-nav-group:first-of-type .article-dash-nav-item')].entries())retag(old,'a',{href:'#'+['overview','projects','reviews','activity'][i]});
 // Query the actual group after retagging; class-based lookup also works when
 // the browser's first-of-type semantics differ after the tag replacement.
 for(const [i,old]of [...document.querySelectorAll('nav .article-dash-nav-item')].entries())if(old.tagName!=='A')retag(old,'a',{href:'#'+['overview','projects','reviews','activity'][i]});
 q('.article-dash-nav-current').setAttribute('aria-current','location');
 const settings=q('.article-dash-sidebar-bottom .article-dash-nav-item');retag(settings,'a',{href:'#study-info'}).innerHTML=icon('settings',16)+'Study details';
 const topbar=q('.article-dash-topbar');topbar.prepend(element('button',{class:'article-dash-icon-button md-nav-toggle',type:'button','data-nav-toggle':'','aria-expanded':'false','aria-controls':'workspace-navigation','aria-label':'Show navigation',hidden:''},icon('grid',16)));
 q('.article-dash-saved').innerHTML=`<i></i>Snapshot at ${fixture.lastSynced}`;
 retag(q('.article-dash-top-actions .article-dash-icon-button'),'a',{href:'#reviews','aria-label':'Review queue'});
 const heading=q('.article-dash-title-row h2');heading.id='overview';heading.tabIndex=-1;
 const plot=q('.article-dash-line-chart');const scroller=element('div',{class:'md-chart-viewport',tabindex:'0',role:'region','aria-label':'Delivery cadence chart. Scroll horizontally on narrow screens.'});plot.replaceWith(scroller);scroller.append(plot);
 q('.article-dash-stats').setAttribute('aria-label','Workspace totals');
 q('.article-dash-title-actions').innerHTML=`<div class="md-date" role="group" aria-label="Reporting period">${icon('calendar',14)}<span><time datetime="2026-10-15">Oct 15</time>–<time datetime="2026-10-28">28, 2026</time></span><span class="md-date-duration" aria-label="${fixture.current.length}-day period">${fixture.current.length}d</span></div><a href="#projects" class="article-dash-button article-dash-button-primary">${icon('arrow',14)}View projects</a>`;
 q('.article-dash-chart-shell').id='activity';q('.article-dash-next').id='reviews';q('.article-dash-projects-shell').id='projects';
 for(const e of document.querySelectorAll('.article-dash-chart-heading h3,.article-dash-review-heading h3,.article-dash-projects-heading h3'))e.tabIndex=-1;
 retag(q('.article-dash-next-footer'),'a',{href:'#review-items'});q('.article-dash-review-items').id='review-items';
 const filters=q('.article-dash-segments');filters.setAttribute('role','group');filters.setAttribute('aria-label','Project status');
 for(const [i,old]of [...filters.children].entries())retag(old,'button',{type:'button','data-filter':['all','progress','archived'][i],'aria-pressed':String(i===0),disabled:''});
 q('.article-dash-filter').remove();q('.article-dash-projects-heading>.article-dash-icon-button').remove();
 const visible=q('.article-dash-projects-heading h3 span');visible.setAttribute('data-visible-count','');
 const table=q('table');table.setAttribute('aria-label','Projects');
 const cols=table.querySelectorAll('col');cols[6].setAttribute('style','width:15%');cols[7].remove();
 const heads=table.querySelectorAll('th');heads[7].remove();heads[0].innerHTML='<span class="md-sr-only">Select project</span>';for(const h of table.querySelectorAll('th'))h.setAttribute('scope','col');
 for(const [i,row] of [...table.querySelectorAll('tbody tr')].entries()){
  const p=projects[i];row.setAttribute('data-project',p.code);row.lastElementChild.remove();
  row.firstElementChild.innerHTML=`<label class="md-check-target"><input type="checkbox" class="md-check" data-select="${p.code}" aria-label="Select ${p.name}" ${p.selected?'checked':''} disabled><span class="md-check-mark" aria-hidden="true">${icon('check',9)}</span></label>`;
  for(const [j,cell]of [...row.children].entries())cell.setAttribute('data-label',['Select','Project','Status','Progress','Open tasks','Team','Due'][j]);
  const ownerCell=row.querySelector('.article-dash-owner-stack');ownerCell.outerHTML=renderStack(p.owners.map(id=>({id,name:people[id].name,initials:id,tone:people[id].tone})),{size:22,overlap:5,separator:1.5,fontSize:8,className:'article-dash-owner-stack'});
  const progress=row.querySelector('.article-finish-progress');if(progress){progress.setAttribute('role','progressbar');progress.setAttribute('aria-label',p.name+' completion');progress.setAttribute('aria-valuenow',String(p.progress));progress.setAttribute('aria-valuemin','0');progress.setAttribute('aria-valuemax','100');}
 }
 q('.article-dash-projects-panel').insertBefore(element('p',{class:'md-empty','data-empty':'',hidden:''},'No projects match. Try a different name or status.'),q('.article-dash-projects-footer'));
 q('.article-dash-projects-footer>span').setAttribute('data-results','');q('[data-results]').textContent='Showing 4 of 4 projects';
 q('.article-dash-projects-footer>span:last-child').textContent='Workspace snapshot';
 const toolbar=q('.article-dash-floating-actions');toolbar.setAttribute('role','group');toolbar.setAttribute('aria-label','Selected projects');toolbar.innerHTML='<span class="article-dash-selection-count"><i data-selection-count>2</i>selected</span><span class="article-dash-action-divider"></span><button class="article-dash-floating-action" data-clear type="button" disabled>Clear selection</button>';
 document.body.prepend(element('div',{class:'md-study-controls'},'<span>Master Design · Interface craft</span><a href="./studies.html">Detail studies</a><a href="./avatars.html">Avatar study</a><button type="button" data-theme-toggle disabled>Dark theme</button><button type="button" data-reset disabled>Reset study</button>'));
 document.body.append(element('footer',{id:'study-info',class:'md-study-info'},'An illustrative local workspace. Search, status filters, selection and navigation are interactive. Workspace totals stay global.'));
 document.body.append(element('span',{class:'md-sr-only','data-status':'',role:'status','aria-live':'polite','aria-atomic':'true'}));
 document.body.append(element('script',{type:'module',src:'./dist/app.js'}));
 return document.toString();
}
