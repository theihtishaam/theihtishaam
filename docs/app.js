/* Interactive portfolio. Runs only on the companion GitHub Pages site. No tracking or cookies. */
(() => {
'use strict';
const $=(s,root=document)=>root.querySelector(s);
const $$=(s,root=document)=>[...root.querySelectorAll(s)];
const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
let motion=!reduce.matches;
let frame=0,mouseX=innerWidth/2,mouseY=innerHeight/2;
const toggle=$('#motion-toggle');
function updateToggle(){
  document.body.classList.toggle('motion-off',!motion);
  toggle.setAttribute('aria-pressed',String(!motion));
  toggle.setAttribute('aria-label',motion?'Turn off animations':'Turn on animations');
  $('.motion-text',toggle).textContent=motion?'MOTION ON':'MOTION OFF';
  if(!motion){$$('[data-tilt]').forEach(el=>{el.style.setProperty('--rx','0deg');el.style.setProperty('--ry','0deg');});}
}
toggle.addEventListener('click',()=>{motion=!motion;updateToggle();});
reduce.addEventListener?.('change',event=>{motion=!event.matches;updateToggle();});
updateToggle();
document.addEventListener('pointermove',event=>{
  if(!motion||event.pointerType==='touch')return;
  mouseX=event.clientX;mouseY=event.clientY;
  if(frame)return;
  frame=requestAnimationFrame(()=>{
    document.documentElement.style.setProperty('--mx',mouseX+'px');
    document.documentElement.style.setProperty('--my',mouseY+'px');
    frame=0;
  });
},{passive:true});
$$('[data-tilt]').forEach(card=>{
  const maximum=Number(card.dataset.tiltMax||4.5);
  card.addEventListener('pointermove',event=>{
    if(!motion||event.pointerType==='touch')return;
    const b=card.getBoundingClientRect(),x=(event.clientX-b.left)/b.width-.5,y=(event.clientY-b.top)/b.height-.5;
    card.style.setProperty('--rx',(-y*maximum*2).toFixed(2)+'deg');
    card.style.setProperty('--ry',(x*maximum*2).toFixed(2)+'deg');
  },{passive:true});
  card.addEventListener('pointerleave',()=>{card.style.setProperty('--rx','0deg');card.style.setProperty('--ry','0deg');});
});
const field=$('#particle-field');
if(field){for(let i=0;i<30;i++){
 const p=document.createElement('span');p.className='particle';
 const x=(i*83.729)%100,y=(i*41.31)%100;
 p.style.left=x+'%';p.style.top=y+'%';
 p.style.animationDuration=(6+(i%9)*1.3)+'s';
 p.style.animationDelay=(-i*.7)+'s';
 field.append(p);
}}
function scrollProgress(){const size=document.documentElement.scrollHeight-innerHeight;document.documentElement.style.setProperty('--scroll',size>0?(scrollY/size*100)+'%':'0%');}
addEventListener('scroll',scrollProgress,{passive:true});scrollProgress();
/* Interactive workflow selector */
const tabs=$$('.caseflow-tab');
const flowData={
 shadow:{image:'./assets/flow-agent-shadow-brain.svg',link:'./projects/agent-shadow-brain.html',alt:'Agent Shadow Brain example workflow for coding-agent memory and scoped context',description:'Curate memory, build context packs and inspect coding agent activity.'},
 civic:{image:'./assets/flow-civic-twin.svg',link:'./projects/civic-twin.html',alt:'CivicTwin six-stage regulatory analysis pipeline',description:'Capture facts, evaluate typed rules, compare scenarios and show the proof boundary.'},
 procure:{image:'./assets/flow-procureguard-ai.svg',link:'./projects/procureguard-ai.html',alt:'ProcureGuard AI vendor approval process from intake through human signoff',description:'Connect specialist reviews, evidence collation, red-team challenges and human signoff.'}
};
function activateFlow(tab,focus){
 const info=flowData[tab.dataset.project];if(!info)return;
 tabs.forEach(t=>{const active=t===tab;t.classList.toggle('active',active);t.setAttribute('aria-selected',String(active));t.tabIndex=active?0:-1;});
 $('#flow-panel').setAttribute('aria-labelledby',tab.id);
 const img=$('#flow-image');img.src=info.image;img.alt=info.alt;
 $('#flow-link').href=info.link;$('#flow-link').setAttribute('aria-label','Open '+tab.textContent.trim()+' case study');
 $('#flow-cta').href=info.link;
 $('#flow-description').textContent=info.description;
 if(focus)tab.focus();
}
tabs.forEach((tab,i)=>{
 tab.addEventListener('click',()=>activateFlow(tab,false));
 tab.addEventListener('keydown',event=>{
  if(!['ArrowRight','ArrowLeft','Home','End'].includes(event.key))return;
  event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(i+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;
  activateFlow(tabs[next],true);
 });
});
})();

/* Download milestone is served by this same GitHub Pages repository. */
(async()=>{
 const count=document.getElementById('npm-downloads-count');
 if(!count)return;
 try{
  const result=await fetch('./npm-metrics.json',{signal:AbortSignal.timeout(10000),cache:'no-cache'});
  if(!result.ok)throw new Error('Cached data unavailable');
  const stats=await result.json();
  if(stats.package!=='@theihtisham/agent-shadow-brain')throw new Error('Unexpected package');
  if(!Number.isFinite(stats.downloads)||stats.downloads<0)throw new Error('Invalid count');
  count.textContent=Math.floor(stats.downloads).toLocaleString('en-US');
  const date=document.getElementById('npm-downloads-date');
  if(date&&/^\d{4}-\d{2}-\d{2}$/.test(stats.coverageEnd||'')){
   date.textContent='Verified through '+stats.coverageEnd+' · not unique users';
  }
 }catch(error){console.warn('Using last verified npm download snapshot',error.message);}
})();
