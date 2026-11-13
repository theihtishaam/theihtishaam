/* First-party searchable project terminal. No frameworks, cookies or telemetry. */
(()=>{'use strict';
const LOGIN='theihtishaam',OWNER=LOGIN.toLowerCase();
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const list=$('#repo-list');if(!list)return;
const ARCHIVE_FALLBACK=[
 {name:'agent-shadow-brain',url:'https://github.com/theihtishaam/agents-brain',sourceOwner:'theihtishaam',description:'Local memory, context packs and a visual coding-agent workspace.',language:'TypeScript',pushedAt:'2026-11-11T19:12:18Z'},
 {name:'Civic-Twins',url:'https://github.com/theihtishaam/CiviTwin',sourceOwner:'theihtishaam',description:'Source-aware regulatory scenarios, rule changes and proof receipts.',language:'TypeScript',pushedAt:'2026-08-06T04:23:07Z'},
 {name:'procureguard-ai-band-agents',url:'https://github.com/theihtishaam/Procure-guard-ai',sourceOwner:'theihtishaam',description:'Eight AI roles reviewing vendor risks, with a red-team challenge and human signoff.',language:'Python',pushedAt:'2026-08-31T14:55:05Z'}
];
let projects=[],filter='all',source='OFFLINE FALLBACK',pageSize=12,visible=pageSize;
const matchGithubURL=s=>typeof s==='string'&&/^https:\/\/github\.com\/[\w-]+\/[\w.-]+\/?$/.test(s);
function normalize(r){
 if(!r||!r.name||r.private===true)return null;
 const name=String(r.name),owner=String(r.owner?.login||r.sourceOwner||LOGIN).toLowerCase(),href=r.html_url||r.url;
 if(!matchGithubURL(href)||name.toLowerCase()===OWNER)return null;
 return {name,owner,href,description:String(r.description||'A public software project'),language:String(r.language||'Software'),pushed:String(r.pushed_at||r.pushedAt||r.updated_at||''),fork:!!r.fork,archived:!!r.archived};
}
function merge(official,featured){
 const out=[],names=new Set();
 for(const r of [...official,...featured]){
  const p=normalize(r);if(!p)continue;
  const id=p.name.toLowerCase();if(names.has(id))continue;
  names.add(id);out.push(p);
 }
 return out;
}
function elem(tag,className,textContent){
 const e=document.createElement(tag);if(className)e.className=className;
 if(textContent!==undefined)e.textContent=textContent;return e;
}
function card(r){
 const a=elem('a','repo-item'+(r.owner!==OWNER?' repo-featured':''));
 a.href=r.href;a.target='_blank';a.rel='noopener noreferrer';
 a.append(
   elem('span','repo-tag',r.owner===OWNER?'OFFICIAL / '+LOGIN.toUpperCase():'FEATURED / '+r.owner.toUpperCase()),
   elem('span','repo-name',r.name),
   elem('span','repo-desc',r.description)
 );
 const meta=elem('span','repo-meta');
 meta.append(elem('span','repo-lang',r.language));
 if(r.pushed)meta.append(elem('span','repo-date','UPDATED '+r.pushed.slice(0,10)));
 if(r.fork)meta.append(elem('span','repo-fork','FORK'));
 if(r.archived)meta.append(elem('span','repo-archived','ARCHIVED'));
 a.append(meta,elem('span','repo-external','↗'));
 return a;
}
function render(reset=false){
 if(reset)visible=pageSize;
 const query=String($('#repo-search')?.value||'').trim().toLocaleLowerCase();
 const sort=$('#repo-sort')?.value||'updated';
 let subset=projects.filter(r=>
   (filter==='all'||(filter==='official'&&r.owner===OWNER)||(filter==='featured'&&r.owner!==OWNER))&&
   (!query||[r.name,r.description,r.language,r.owner].some(s=>s.toLocaleLowerCase().includes(query))));
 subset.sort(sort==='name'?(a,b)=>a.name.localeCompare(b.name):(a,b)=>b.pushed.localeCompare(a.pushed)||a.name.localeCompare(b.name));
 const slice=subset.slice(0,visible);
 if(slice.length)list.replaceChildren(...slice.map(card));
 else list.replaceChildren(elem('div','repo-empty',projects.length?'No matches. Try clearing the search or switching the filter.':'No public projects are available to display yet.'));
 const msg=$('#repo-result-summary');
 if(msg)msg.textContent='SHOWING '+slice.length+' / '+subset.length+' MATCHES · '+projects.length+' PUBLIC PROJECTS DISCOVERED · '+source+' · PRIVATE REPOS EXCLUDED';
 const more=$('#repo-show-more');if(more){more.hidden=visible>=subset.length;more.textContent='SHOW '+Math.min(pageSize,subset.length-visible)+' MORE PUBLIC PROJECTS ↓';}
}
function show(official,featured,label){
 projects=merge(official,featured);source=label;render(true);
}
$$('.repo-filter').forEach(button=>button.addEventListener('click',()=>{
 filter=button.dataset.filter;
 $$('.repo-filter').forEach(b=>{const on=b===button;b.classList.toggle('is-active',on);b.setAttribute('aria-pressed',String(on));});
 render(true);
}));
$('#repo-search')?.addEventListener('input',()=>render(true));
$('#repo-sort')?.addEventListener('change',()=>render(true));
$('#repo-show-more')?.addEventListener('click',()=>{visible+=pageSize;render();});
document.addEventListener('keydown',e=>{
 const element=e.target,typing=element?.matches?.('input,textarea,select,[contenteditable]');
 if(e.key==='/'&&!typing&&!e.ctrlKey&&!e.metaKey&&!e.altKey){e.preventDefault();$('#repo-search')?.focus();}
});
async function getJSON(path){
 const res=await fetch(path,{signal:AbortSignal.timeout(12000),cache:'no-cache',headers:{Accept:'application/json'}});
 if(!res.ok)throw Error('HTTP '+res.status);return res.json();
}
async function github(path){
 const res=await fetch('https://api.github.com'+path,{signal:AbortSignal.timeout(14000),headers:{Accept:'application/vnd.github+json'}});
 if(!res.ok)throw Error('GitHub API '+res.status);return res.json();
}
function updateStats(stats,status){
 const vals=[['#stat-repos',stats.publicRepositories],['#stat-stars',stats.starsOnNonForkRepositories],['#stat-followers',stats.followers]];
 for(const [id,value] of vals)if(Number.isSafeInteger(value)&&$(id))$(id).textContent=value.toLocaleString('en-US');
 if($('#stat-status'))$('#stat-status').textContent=status;
}
async function init(){
 let featured=ARCHIVE_FALLBACK;
 show([],featured,'FALLBACK');
 try{
  const [snapshot,stats]=await Promise.all([getJSON('./public-projects.json'),getJSON('./github-stats.json')]);
  const repos=Array.isArray(snapshot.repositories)?snapshot.repositories:[];
  const official=repos.filter(r=>String(r.sourceOwner||r.owner?.login||LOGIN).toLowerCase()===OWNER);
  const fromOld=repos.filter(r=>String(r.sourceOwner||r.owner?.login||LOGIN).toLowerCase()!==OWNER);
  featured=fromOld.length?fromOld:ARCHIVE_FALLBACK;
  show(official,featured,'CACHED DAILY SYNC');
  updateStats(stats,'CACHED');
 }catch(error){console.warn('Using bundled project snapshot:',error.message);}
 try{
  const [user,first]=await Promise.all([github('/users/'+LOGIN),github('/users/'+LOGIN+'/repos?per_page=100&type=owner&sort=pushed')]);
  let official=[...first];
  if(first.length===100)for(let page=2;page<=20;page++){
   const batch=await github('/users/'+LOGIN+'/repos?per_page=100&type=owner&sort=pushed&page='+page);
   official.push(...batch);if(batch.length<100)break;
  }
  official=official.filter(r=>r.owner?.login===LOGIN&&r.private===false);
  const stars=official.filter(r=>!r.fork).reduce((sum,r)=>sum+(r.stargazers_count||0),0);
  updateStats({publicRepositories:user.public_repos,followers:user.followers,starsOnNonForkRepositories:stars},'LIVE');
  show(official,featured,'LIVE GITHUB API');
 }catch(error){console.warn('GitHub API unavailable; keeping verified cached project list:',error.message);}
}
init();
})();