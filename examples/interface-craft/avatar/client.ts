import {participants} from './model.mjs';
import {renderStack,renderParticipantList} from './render.mjs';
const form=document.querySelector<HTMLFormElement>('.md-avatar-controls')!;
const stage=document.querySelector<HTMLElement>('.md-avatar-stage')!;
const trigger=document.querySelector<HTMLButtonElement>('[data-avatar-trigger]')!;
const dialog=document.querySelector<HTMLDialogElement>('#avatar-participants')!;
const list=document.querySelector<HTMLElement>('[data-participant-list]')!;
const control=(name:string)=>form.elements.namedItem(name) as HTMLInputElement|HTMLSelectElement;
let current=participants.slice(0,3);
function settleImages(root:ParentNode){root.querySelectorAll<HTMLImageElement>('img').forEach(img=>{img.addEventListener('error',()=>{img.hidden=true;},{once:true});if(img.complete&&!img.naturalWidth)img.hidden=true;});}
function render(){
 const count=Number(control('count').value),content=control('content').value,theme=control('theme').value;
 current=participants.slice(0,count).map((person,index)=>({...person,photo:content==='initials'||(content==='mixed'&&index%2===1)?undefined:person.photo}));
 if((control('failed') as HTMLInputElement).checked&&current[0]?.photo)current[0].photo='./avatar/portraits/intentionally-unavailable.webp';
 stage.dataset.surface=control('surface').value;stage.dataset.selected=String((control('selected') as HTMLInputElement).checked);stage.dataset.avatarTheme=theme;stage.dir=control('direction').value;
 document.documentElement.dataset.avatarPageTheme=theme;dialog.dataset.avatarTheme=theme;dialog.dir=stage.dir;
 const pattern=stage.dataset.surface==='pattern';
 if(pattern){control('arrangement').value='spaced';(control('separator') as HTMLInputElement).checked=false;}
 control('arrangement').disabled=pattern;control('separator').disabled=pattern;
 const spaced=control('arrangement').value==='spaced',separator=(control('separator') as HTMLInputElement).checked?2:0;
 trigger.innerHTML=renderStack(current,{decorative:true,overlap:spaced?-6:8,separator});trigger.setAttribute('aria-label',`View ${current.length} participants`);trigger.hidden=current.length===0;
 document.querySelector<HTMLElement>('[data-avatar-zero]')!.hidden=current.length!==0;
 document.querySelector('[data-mode-note]')!.textContent=pattern?'Spaced portraits preserve a patterned background.':`32 px portraits · ${spaced?'6 px gap':'8 px overlap'} · ${separator} px separator`;
 const group=trigger.querySelector<HTMLElement>('.md-avatar-stack');
 document.querySelector('[data-avatar-metrics]')!.textContent=group?`${group.getBoundingClientRect().width} px layout / ${group.getBoundingClientRect().width+(pattern||current.length===1?0:separator*2)} px outside paint`:'No portrait slots';
 settleImages(stage);
}
form.addEventListener('submit',e=>e.preventDefault());form.addEventListener('change',render);
trigger.addEventListener('click',()=>{list.innerHTML=renderParticipantList(current);settleImages(list);document.querySelector('#avatar-dialog-title')!.textContent=`Participants (${current.length})`;trigger.setAttribute('aria-expanded','true');dialog.showModal();});
document.querySelector<HTMLButtonElement>('[data-avatar-close]')!.addEventListener('click',()=>dialog.close());
dialog.addEventListener('close',()=>{trigger.setAttribute('aria-expanded','false');trigger.focus();});
document.querySelector<HTMLElement>('[data-static-stack]')!.remove();document.querySelector<HTMLElement>('.md-avatar-fallback-list')!.remove();
form.querySelectorAll<HTMLInputElement|HTMLSelectElement>('input,select').forEach(input=>input.disabled=false);trigger.disabled=false;render();
