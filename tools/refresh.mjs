import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {dirname} from 'node:path';
const login='theihtishaam';
const headers={'Accept':'application/vnd.github+json','User-Agent':'github-profile-refresh','X-GitHub-Api-Version':'2022-11-28'};
if(process.env.GITHUB_TOKEN)headers.Authorization='Bearer '+process.env.GITHUB_TOKEN;
async function api(path){let r=await fetch('https://api.github.com'+path,{headers,signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error('GitHub API '+r.status+' '+path);return r.json();}
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const clean=v=>String(v??'').replace(/[\r\n]/g,' ').replace(/[[\]()*_<>|]/g,'');
const short=(s,n)=>{s=String(s??'');return Array.from(s).length>n?Array.from(s).slice(0,n-1).join('')+'…':s;};
async function put(path,s){await mkdir(dirname(path),{recursive:true});await writeFile(path,s,'utf8');}
async function repos(){let all=[];for(let page=1;page<=20;page++){let r=await api('/users/'+login+'/repos?per_page=100&type=owner&page='+page);if(!Array.isArray(r))throw Error('Bad public repository data');all.push(...r);if(r.length<100)return all;}throw Error('Too many repositories');}
function start(w,h,title){return '<svg xmlns="http://www.w3.org/2000/svg" width="'+w+'" height="'+h+'" viewBox="0 0 '+w+' '+h+'" role="img" aria-label="'+esc(title)+'"><defs><linearGradient id="b" x2="1" y2="1"><stop stop-color="#071020"/><stop offset=".55" stop-color="#11162e"/><stop offset="1" stop-color="#071e29"/></linearGradient><linearGradient id="a"><stop stop-color="#50deed"/><stop offset=".5" stop-color="#a98df8"/><stop offset="1" stop-color="#ff7bb9"/></linearGradient><pattern id="p" width="35" height="35" patternUnits="userSpaceOnUse"><path d="M35 0H0V35" stroke="#82c7f3" stroke-opacity=".10" fill="none"/></pattern></defs><rect width="'+w+'" height="'+h+'" rx="18" fill="url(#b)"/><rect width="'+w+'" height="'+h+'" rx="18" fill="url(#p)"/>';}
function text(x,y,s,size=18,color='#eff7ff',weight=500){return '<text x="'+x+'" y="'+y+'" font-family="Arial,Segoe UI,sans-serif" font-size="'+size+'" fill="'+color+'" font-weight="'+weight+'">'+esc(s)+'</text>';}
function statistics(u,all,date){const own=all.filter(r=>!r.fork),stars=own.reduce((sum,r)=>sum+(r.stargazers_count||0),0);const langs=new Map();own.forEach(r=>{if(r.language)langs.set(r.language,(langs.get(r.language)||0)+1);});const fields=[['REPOSITORIES',u.public_repos],['STARS',stars],['FOLLOWERS',u.followers],['LANGUAGES',langs.size]];
let v=start(1200,246,'GitHub activity updated '+date)+text(30,46,'// PUBLIC GITHUB TELEMETRY',19,'#72f7e3',750);
fields.forEach(([label,value],i)=>{let x=30+i*294;v+='<rect x="'+x+'" y="67" width="274" height="119" rx="12" fill="#152440" stroke="#526492"/>'+text(x+18,105,label,15,'#a8c5dc',650)+text(x+18,164,value,43,'#ffffff',800)+'<path d="M'+(x+18)+' 177h168" stroke="url(#a)" stroke-width="3"/>';});
v+=text(32,224,'Top languages: '+short([...langs].sort((a,b)=>b[1]-a[1]).slice(0,5).map(x=>x[0]).join(' · ')||'Projects updating',72),15,'#bfd0ec');v+=text(965,224,'REFRESHED '+date.slice(0,10),14,'#7df4e8',700);return v+'</svg>';}
function projectsSvg(all,date){const six=all.slice(0,6),h=100+Math.max(1,Math.ceil(six.length/3))*187;let v=start(1200,h,'Latest public repositories as of '+date)+text(30,45,'// RECENT PUBLIC PROJECTS',19,'#71f0e3',750)+text(968,45,'LIVE FEED',15,'#baadff',700);
six.forEach((r,i)=>{const x=30+(i%3)*394,y=70+Math.floor(i/3)*187;v+='<rect x="'+x+'" y="'+y+'" width="374" height="164" rx="13" fill="#182440" stroke="'+['#69e9ed','#a88eff','#ff91c9'][i%3]+'"/>'+text(x+17,y+35,short(r.name,25),23,'#fff',770)+text(x+17,y+70,short(r.description||'Public project',41),15,'#b4c4e1')+text(x+17,y+113,short(r.language||(r.fork?'Fork':'Project'),25),15,'#71f0e3',700)+text(x+17,y+146,'OWNER: '+String(r.owner?.login||login).toUpperCase(),13,'#b4c4e1');});if(!six.length)v+=text(30,132,'No public projects available yet',23);return v+'</svg>';}
function markdown(all,date){
 let s='# Public repositories and featured work\n\nRefreshed '+date+'. Public project repositories under the official account are listed separately from featured public work in the previous account.\n\n';
 const official=all.filter(r=>(r.owner?.login||login)===login);
 const featured=all.filter(r=>(r.owner?.login||login)!==login);
 s+='## Official public repositories: @'+login+'\n\n';
 if(!official.length)s+='There are no additional public project repositories beyond this profile repository yet.\n\n';
 for(const r of official){s+='- **['+clean(r.name)+']('+r.html_url+')** — '+clean(short(r.description||r.language||'Public project',180))+'\n';}
 s+='\n## Featured public AI projects: @ihtishaam-dev\n\n';
 for(const r of featured){s+='- **['+clean(r.name)+']('+r.html_url+')** — '+clean(short(r.description||'Featured AI engineering project',180))+'\n';}
 return s+'\nOriginal source repositories remain under @ihtishaam-dev until an ownership transfer is completed. Private repositories are not displayed.\n';
}
async function avatar(u){if(!/^https:\/\/avatars\.githubusercontent\.com\/u\/\d+(\?v=\d+)?$/.test(u.avatar_url))throw Error('Unexpected avatar URL');const r=await fetch(u.avatar_url,{headers:{'User-Agent':'github-profile-refresh'},signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error('Avatar HTTP '+r.status);const type=(r.headers.get('content-type')||'').split(';')[0];if(!['image/png','image/jpeg','image/webp'].includes(type))throw Error('Unsupported avatar type');const b=Buffer.from(await r.arrayBuffer());if(b.length<100||b.length>3000000)throw Error('Bad avatar size');return 'data:'+type+';base64,'+b.toString('base64');}
async function selectedPublicProjects(){
 const names=['agent-shadow-brain','Civic-Twins','procureguard-ai-band-agents'];
 return (await Promise.all(names.map(async name=>{
   try{const data=await api('/repos/ihtishaam-dev/'+encodeURIComponent(name));return data.private?null:data;}
   catch(err){console.warn('Using known public link for '+name,err.message);return {name,html_url:'https://github.com/ihtishaam-dev/'+name,description:'Featured AI engineering project',language:null,owner:{login:'ihtishaam-dev'}};}
 }))).filter(Boolean);
}
/** Verify the upstream project's publicly reported npm totals, without third-party packages. */
async function refreshNpm(){
 try{
  const u='https://raw.githubusercontent.com/ihtishaam-dev/agent-shadow-brain/main/docs/npm-metrics.json';
  const res=await fetch(u,{headers:{'User-Agent':'theihtishaam-profile-refresh'},signal:AbortSignal.timeout(15000)});
  if(!res.ok)throw Error('Upstream stats HTTP '+res.status);
  const m=await res.json();
  if(m.package!=='@theihtisham/agent-shadow-brain')throw Error('Unexpected npm package');
  if(m.coverage?.completeSinceCreation!==true)throw Error('Incomplete lifetime coverage');
  if(!Number.isSafeInteger(m.npm?.total)||m.npm.total<0)throw Error('Invalid download total');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(m.coverage?.end||''))throw Error('Invalid coverage date');
  const count=m.npm.total,date=m.coverage.end;
  const snapshot={
    schemaVersion:2,
    package:m.package,sourceRepo:'ihtishaam-dev/agent-shadow-brain',
    refreshedAt:m.refreshedAt||null,coverageStart:m.coverage.start,coverageEnd:date,
    downloads:count,last30Days:m.npm.lastMonth?.downloads??null,
    source:'https://github.com/ihtishaam-dev/agent-shadow-brain/blob/main/docs/STATS.md',
    note:'Package downloads are not unique users; the date refers to the latest complete reporting day.'
  };
  const svgTemplate=await readFile('assets/npm-milestone.template.svg','utf8');
  if(!['{{TOTAL}}','{{COVERAGE_END}}','{{MILESTONE}}'].every(v=>svgTemplate.includes(v)))throw Error('Missing milestone SVG placeholder');
  const svg=svgTemplate.replaceAll('{{TOTAL}}',count.toLocaleString('en-US'))
   .replaceAll('{{COVERAGE_END}}',date).replaceAll('{{MILESTONE}}',count>=5000?'5K+':'TOTAL');
  await put('assets/npm-milestone.svg',svg);
  await put('docs/assets/npm-milestone.svg',svg);
  const json=JSON.stringify(snapshot,null,2)+'\n';
  await put('data/npm-metrics.json',json);
  await put('docs/npm-metrics.json',json);
  console.log('Verified npm lifetime downloads: '+count+' through '+date);
 }catch(e){
  // Existing verified data and image remain intact if the upstream endpoint fails.
  console.warn('Npm download refresh skipped; preserving last verified snapshot:',e.message);
 }
}

async function main(){
 await refreshNpm();
 const [u,raw,featured]=await Promise.all([api('/users/'+login),repos(),selectedPublicProjects()]);
 if(u.login!==login)throw Error('Unexpected account');
 const all=raw.filter(r=>r.owner?.login===login&&!r.private);
 const official=all.filter(r=>r.name!==login).sort((a,b)=>(b.pushed_at||b.updated_at||'').localeCompare(a.pushed_at||a.updated_at||'')||a.name.localeCompare(b.name));
 const display=[...official,...featured.filter(r=>!official.some(p=>p.name.toLowerCase()===r.name.toLowerCase()))];
 const date=new Date().toISOString();
 const summary={schemaVersion:2,login,refreshedAt:date,publicRepositories:u.public_repos,officialProjectCount:official.length,featuredFromPreviousAccount:display.length-official.length,followers:u.followers,starsOnNonForkRepositories:all.filter(r=>!r.fork).reduce((n,r)=>n+(r.stargazers_count||0),0),source:'https://api.github.com/users/'+login};
 const data={schemaVersion:2,login,refreshedAt:date,officialRepositoryCount:official.length,featuredExternalProjects:display.length-official.length,repositoryCount:display.length,repositories:display.map(r=>({name:r.name,url:r.html_url,description:r.description,language:r.language,sourceOwner:r.owner?.login||login,pushedAt:r.pushed_at,fork:r.fork||false,archived:r.archived||false}))};
 await put('data/github-stats.json',JSON.stringify(summary,null,2)+'\n');
 await put('data/public-projects.json',JSON.stringify(data,null,2)+'\n');
 await put('assets/statistics.svg',statistics(u,all,date));
 await put('assets/recent-projects.svg',projectsSvg(display,date));
 await put('docs/PUBLIC_PROJECTS.md',markdown(display,date));
 try{
  let t=await readFile('assets/face-scan.template.svg','utf8');
  if(!t.includes('{{AVATAR_DATA_URI}}'))throw Error('Avatar placeholder missing');
  await put('assets/face-scan.svg',t.replaceAll('{{AVATAR_DATA_URI}}',await avatar(u)));
 }catch(e){console.warn('Avatar refresh failed; retaining last graphic:',e.message);}
 console.log('Refreshed '+official.length+' official public projects and '+(display.length-official.length)+' featured projects.');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
