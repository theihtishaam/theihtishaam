(()=>{'use strict';
const prefers=matchMedia('(prefers-reduced-motion: reduce)');
if(prefers.matches)return;
let cursor=0;
document.addEventListener('pointermove',e=>{
 if(e.pointerType==='touch')return;
 if(cursor)return;
 const x=e.clientX,y=e.clientY;
 cursor=requestAnimationFrame(()=>{document.documentElement.style.setProperty('--case-x',x+'px');document.documentElement.style.setProperty('--case-y',y+'px');cursor=0;});
},{passive:true});
function progress(){const total=document.documentElement.scrollHeight-innerHeight;document.documentElement.style.setProperty('--scroll',total>0?(scrollY/total*100)+'%':'0%')}
addEventListener('scroll',progress,{passive:true});progress();
})();