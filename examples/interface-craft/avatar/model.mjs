export const participants=[
 {id:'am',name:'Aki Mori',initials:'AM',photo:'./avatar/portraits/portrait-a.webp',tone:'slate',role:'Product design'},
 {id:'ar',name:'Alex Rivera',initials:'AR',photo:'./avatar/portraits/portrait-b.webp',tone:'sage',role:'Interface engineering'},
 {id:'sk',name:'Sam Kim',initials:'SK',photo:'./avatar/portraits/portrait-c.webp',tone:'clay',role:'Design systems'},
 {id:'mn',name:'Mina Noor',initials:'MN',tone:'sage',role:'Content design'},
 {id:'jp',name:'Jun Park',initials:'JP',tone:'slate',role:'Research'},
 {id:'tm',name:'Taylor Alexandra Montgomery',initials:'TM',tone:'clay',role:'Accessibility review'},
 {id:'unknown',name:'Unnamed participant',initials:'',tone:'slate',role:'Identity not provided'},
];
export function visibleSlots(people,capacity=4){
 if(!Number.isInteger(capacity)||capacity<2)throw new Error('Choose at least two available slots.');
 const visible=people.length>capacity?people.slice(0,capacity-1):people;
 return{visible,hidden:people.length-visible.length};
}
export const escapeHtml=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
