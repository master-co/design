import {filterProjects,projects} from './model.mjs';

const html=document.documentElement;
const search=document.querySelector<HTMLInputElement>('#project-search')!;
const filters=[...document.querySelectorAll<HTMLButtonElement>('[data-filter]')];
const rows=[...document.querySelectorAll<HTMLTableRowElement>('[data-project]')];
const checks=[...document.querySelectorAll<HTMLInputElement>('[data-select]')];
const toolbar=document.querySelector<HTMLElement>('.article-dash-floating-actions')!;
const clear=document.querySelector<HTMLButtonElement>('[data-clear]')!;
const nav=document.querySelector<HTMLElement>('#workspace-navigation')!;
const menu=document.querySelector<HTMLButtonElement>('[data-nav-toggle]')!;
const status=document.querySelector<HTMLElement>('[data-status]')!;
const theme=document.querySelector<HTMLButtonElement>('[data-theme-toggle]')!;
let filter='all';
let selected=new Set<string>(projects.filter(p=>p.selected).map(p=>p.code));
let visible=new Set<string>(projects.map(p=>p.code));
const announce=(text:string)=>{status.textContent=text;};

function selection(){
 checks.forEach(c=>{c.checked=selected.has(c.dataset.select!);c.closest('tr')!.classList.toggle('article-dash-row-selected',c.checked);});
 document.querySelector('[data-selection-count]')!.textContent=String(selected.size);
 toolbar.hidden=selected.size===0;
}
function render(){
 visible=new Set(filterProjects(search.value,filter).map(p=>p.code));
 rows.forEach(row=>row.hidden=!visible.has(row.dataset.project!));
 filters.forEach(b=>{const on=b.dataset.filter===filter;b.setAttribute('aria-pressed',String(on));b.classList.toggle('article-selected',on);});
 document.querySelector('[data-visible-count]')!.textContent=String(visible.size);
 document.querySelector('[data-results]')!.textContent=`Showing ${visible.size} of ${projects.length} projects`;
 document.querySelector<HTMLElement>('[data-empty]')!.hidden=visible.size!==0;
 document.querySelector<HTMLTableElement>('table')!.hidden=visible.size===0;
 selection();
}
function syncLocation(){
 const fragment=location.hash==='#review-items'?'#reviews':location.hash||'#overview';
 nav.querySelectorAll<HTMLAnchorElement>('nav a').forEach(a=>{const on=a.hash===fragment;a.classList.toggle('article-dash-nav-current',on);if(on)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});
}
window.addEventListener('hashchange',syncLocation);
function closeNavigation(focus=false){html.dataset.navOpen='false';menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Show navigation');if(focus)menu.focus();}
search.addEventListener('input',()=>{selected.clear();render();announce(`${visible.size} projects match. Selection cleared.`);});
filters.forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.filter!;selected.clear();render();announce(`${visible.size} projects shown. Selection cleared.`);}));
checks.forEach(c=>c.addEventListener('change',()=>{const id=c.dataset.select!;if(!visible.has(id))return;c.checked?selected.add(id):selected.delete(id);selection();announce(`${selected.size} projects selected.`);}));
clear.addEventListener('click',()=>{selected.clear();selection();checks.find(c=>visible.has(c.dataset.select!))?.focus({preventScroll:true});announce('Selection cleared.');});
menu.addEventListener('click',()=>{const open=html.dataset.navOpen!=='true';html.dataset.navOpen=String(open);menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Hide navigation':'Show navigation');});
nav.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{
 e.preventDefault();history.replaceState(null,'',a.hash);syncLocation();
 if(a.classList.contains('article-dash-nav-item')){nav.querySelectorAll('.article-dash-nav-item').forEach(n=>{const on=n===a;n.classList.toggle('article-dash-nav-current',on);if(on)n.setAttribute('aria-current','location');else n.removeAttribute('aria-current');});}
 closeNavigation();
 const target=document.querySelector<HTMLElement>(a.hash);if(target){const heading=target.matches('h2,h3')?target:target.querySelector<HTMLElement>('h2,h3');heading?.focus({preventScroll:true});target.scrollIntoView({block:'start'});}
}));
document.addEventListener('keydown',e=>{
 if(e.key==='Escape'&&html.dataset.navOpen==='true')closeNavigation(true);
 if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();if(matchMedia('(max-width: 900px)').matches){html.dataset.navOpen='true';menu.setAttribute('aria-expanded','true');menu.setAttribute('aria-label','Hide navigation');}search.focus();}
});
function setTheme(value:string){html.dataset.theme=value;theme.textContent=value==='dark'?'Light theme':'Dark theme';}
theme.addEventListener('click',()=>setTheme(html.dataset.theme==='dark'?'light':'dark'));
document.querySelector<HTMLButtonElement>('[data-reset]')!.addEventListener('click',()=>{filter='all';search.value='';selected=new Set(projects.filter(p=>p.selected).map(p=>p.code));closeNavigation();render();announce('Study reset.');});
html.dataset.enhanced='true';
setTheme(new URL(location.href).searchParams.get('theme')||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light'));
if(new URL(location.href).searchParams.has('capture'))html.dataset.capture='true';
document.querySelectorAll<HTMLButtonElement|HTMLInputElement>('button:disabled,input:disabled').forEach(e=>e.disabled=false);
menu.hidden=false;
syncLocation();
render();
