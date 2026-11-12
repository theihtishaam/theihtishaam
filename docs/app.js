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
const LOGIN='theihtishaam';
const FEATURED=['agent-shadow-brain','Civic-Twins','procureguard-ai-band-agents'];
const API='https://api.github.com';
async function request(path){const res=await fetch(API+path,{headers:{Accept:'application/vnd.github+json'},signal:AbortSignal.timeout(15000)});if(!res.ok)throw Error('API '+res.status);return res.json();}
function makeRepo(r){
  const a=document.createElement('a');a.className='repo-item';a.href=r.html_url||r.url;a.target='_blank';a.rel='noopener noreferrer';
  const title=document.createElement('span');title.className='repo-name';title.textContent=r.name+' ↗';
  const desc=document.createElement('span');desc.className='repo-desc';desc.textContent=r.description||'Public GitHub repository';
  const meta=document.createElement('span');meta.className='repo-meta';
  const lang=document.createElement('span');lang.textContent=r.language||'Project';meta.append(lang);
  const date=document.createElement('span');date.textContent='Updated '+String(r.pushed_at||r.pushedAt||r.updated_at||'').slice(0,10);meta.append(date);
  if(r.fork){const fork=document.createElement('span');fork.textContent='Fork';meta.append(fork);}
  const owner=r.owner?.login||r.sourceOwner||LOGIN;if(owner!==LOGIN){const original=document.createElement('span');original.textContent='FEATURED · '+owner;meta.append(original);}
  a.append(title,desc,meta);return a;
}
function displayProjects(items){const box=$('#repo-list');box.replaceChildren(...items.filter(r=>r.name!==LOGIN).slice(0,24).map(makeRepo));if(!box.children.length){const a=document.createElement('a');a.className='repo-item';a.href='https://github.com/'+LOGIN+'?tab=repositories';a.textContent='Explore public repositories on GitHub ↗';box.append(a);}}
async function load(){
 try{
  const [user,first]=await Promise.all([request('/users/'+LOGIN),request('/users/'+LOGIN+'/repos?per_page=100&type=owner&sort=pushed')]);
  let repos=first;
  if(first.length===100)for(let page=2;page<=5;page++){const extra=await request('/users/'+LOGIN+'/repos?per_page=100&type=owner&page='+page);repos=repos.concat(extra);if(extra.length<100)break;}
  repos=repos.filter(r=>r.owner?.login===LOGIN&&!r.private);
  const stars=repos.filter(r=>!r.fork).reduce((n,r)=>n+(r.stargazers_count||0),0);
  $('#stat-repos').textContent=user.public_repos.toLocaleString();
  $('#stat-stars').textContent=stars.toLocaleString();
  $('#stat-followers').textContent=user.followers.toLocaleString();
  $('#stat-status').textContent='LIVE';
  repos.sort((a,b)=>String(b.pushed_at||'').localeCompare(String(a.pushed_at||'')));
  const featured=await Promise.all(FEATURED.map(async name=>{
    try{return await request('/repos/ihtishaam-dev/'+encodeURIComponent(name));}
    catch{return {name,html_url:'https://github.com/ihtishaam-dev/'+name,description:'Featured public AI engineering project',owner:{login:'ihtishaam-dev'},language:'AI engineering'};}
  }));
  displayProjects(repos.concat(featured.filter(r=>!repos.some(p=>p.name.toLowerCase()===r.name.toLowerCase()))));
 }catch(error){
  console.warn('Using repository snapshot instead of live GitHub API',error.message);
  $('#stat-status').textContent='CACHED';
  try{
   const res=await fetch('https://raw.githubusercontent.com/'+LOGIN+'/'+LOGIN+'/main/data/public-projects.json',{signal:AbortSignal.timeout(10000)});
   if(!res.ok)throw Error('Snapshot unavailable');
   const d=await res.json();displayProjects(d.repositories||[]);
   $('#stat-repos').textContent=String((d.repositories||[]).length+1);
  }catch{displayProjects([]);$('#stat-status').textContent='OFFLINE';}
 }
}
/* Interactive workflow selector */
const tabs=$('.caseflow-tab');
const flowData={
 shadow:{image:'../assets/flow-agent-shadow-brain.svg',link:'./projects/agent-shadow-brain.html',alt:'Agent Shadow Brain example workflow for coding-agent memory and scoped context',description:'Curate memory, build context packs and inspect coding agent activity.'},
 civic:{image:'../assets/flow-civic-twin.svg',link:'./projects/civic-twin.html',alt:'CivicTwin six-stage regulatory analysis pipeline',description:'Capture facts, evaluate typed rules, compare scenarios and show the proof boundary.'},
 procure:{image:'../assets/flow-procureguard-ai.svg',link:'./projects/procureguard-ai.html',alt:'ProcureGuard AI vendor approval process from intake through human signoff',description:'Connect specialist reviews, evidence collation, red-team challenges and human signoff.'}
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
load();
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
