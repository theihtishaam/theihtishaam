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

(async function(){
  const count=document.getElementById('case-npm-total');
  if(!count)return;
  try{
    const r=await fetch('../npm-metrics.json',{signal:AbortSignal.timeout(10000),cache:'no-cache'});
    if(!r.ok)throw Error('Download snapshot missing');
    const d=await r.json();
    if(d.package!=='@theihtisham/agent-shadow-brain'||!Number.isFinite(d.downloads))throw Error('Invalid package data');
    count.textContent=Math.floor(d.downloads).toLocaleString('en-US');
    const asof=document.getElementById('case-npm-asof');
    if(asof&&/^\d{4}-\d{2}-\d{2}$/.test(d.coverageEnd||''))asof.textContent='Snapshot through '+d.coverageEnd+' · installs are not unique developers';
  }catch(e){console.warn('Showing last verified package milestone',e.message);}
})();
