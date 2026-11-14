import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {dirname} from 'node:path';
import {latestRepositories,latestRepositoryList,projectCard,projectGrid,projectOrder} from './project-grid.mjs';
import {starsSummary,starsMarkdown,collectNpmPackages,qualifiedPackages,npmHighlights,PRIMARY_PACKAGE} from './profile-metrics.mjs';
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
function statistics(u,all,date){const own=all.filter(r=>!r.fork),stars=starsSummary(all,login).total;const langs=new Map();own.forEach(r=>{if(r.language)langs.set(r.language,(langs.get(r.language)||0)+1);});const fields=[['REPOSITORIES',u.public_repos],...(stars>0?[['STARS RECEIVED',stars]]:[]),['FOLLOWERS',u.followers],['LANGUAGES',langs.size]];
let v=start(1200,246,'GitHub activity updated '+date)+text(30,46,'// PUBLIC GITHUB TELEMETRY',19,'#72f7e3',750);
fields.forEach(([label,value],i)=>{const step=1140/fields.length;let x=30+i*step;v+='<rect x="'+x+'" y="67" width="'+(step-20)+'" height="119" rx="12" fill="#152440" stroke="#526492"/>'+text(x+18,105,label,15,'#a8c5dc',650)+text(x+18,164,value,43,'#ffffff',800)+'<path d="M'+(x+18)+' 177h168" stroke="url(#a)" stroke-width="3"/>';});
v+=text(32,224,'Top languages: '+short([...langs].sort((a,b)=>b[1]-a[1]).slice(0,5).map(x=>x[0]).join(' · ')||'Projects updating',72),15,'#bfd0ec');v+=text(965,224,'REFRESHED '+date.slice(0,10),14,'#7df4e8',700);return v+'</svg>';}
function projectsSvg(all,date){const six=latestRepositories(all,6),h=100+Math.max(1,Math.ceil(six.length/3))*187;let v=start(1200,h,'Latest public repositories as of '+date)+text(30,45,'// RECENT PUBLIC PROJECTS',19,'#71f0e3',750)+text(968,45,'2-DAY SYNC',15,'#baadff',700);
six.forEach((r,i)=>{const x=30+(i%3)*394,y=70+Math.floor(i/3)*187;v+='<rect x="'+x+'" y="'+y+'" width="374" height="164" rx="13" fill="#182440" stroke="'+['#69e9ed','#a88eff','#ff91c9'][i%3]+'"/>'+text(x+17,y+35,short(r.name,25),23,'#fff',770)+text(x+17,y+70,short(r.description||'Public project',41),15,'#b4c4e1')+text(x+17,y+113,short(r.language||(r.fork?'Fork':'Project'),25),15,'#71f0e3',700)+text(x+17,y+146,'OWNER: '+String(r.owner?.login||login).toUpperCase(),13,'#b4c4e1');});if(!six.length)v+=text(30,132,'No public projects available yet',23);return v+'</svg>';}
function markdown(all,date){
 let s='# Public repositories and featured work\n\nRefreshed '+date+'. Public project repositories under the official account are listed separately from featured public work in the previous account.\n\n';
 const official=all.filter(r=>(r.owner?.login||login)===login);
 const featured=all.filter(r=>(r.owner?.login||login)!==login);
 s+='## Official public repositories: @'+login+'\n\n';
 if(!official.length)s+='There are no additional public project repositories beyond this profile repository yet.\n\n';
 for(const r of official){s+='- **['+clean(r.name)+']('+r.html_url+')** — '+clean(short(r.description||r.language||'Public project',180))+'\n';}
 if(featured.length)s+='\n## Featured public AI projects: @ihtishaam-dev\n\n';
 for(const r of featured){s+='- **['+clean(r.name)+']('+r.html_url+')** — '+clean(short(r.description||'Featured AI engineering project',180))+'\n';}
 return s+'\nThe copied CivicTwin and ProcureGuard repositories retain their source commit history. Private repositories are not displayed.\n';
}
async function avatar(u){if(!/^https:\/\/avatars\.githubusercontent\.com\/u\/\d+(\?v=\d+)?$/.test(u.avatar_url))throw Error('Unexpected avatar URL');const r=await fetch(u.avatar_url,{headers:{'User-Agent':'github-profile-refresh'},signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error('Avatar HTTP '+r.status);const type=(r.headers.get('content-type')||'').split(';')[0];if(!['image/png','image/jpeg','image/webp'].includes(type))throw Error('Unsupported avatar type');const b=Buffer.from(await r.arrayBuffer());if(b.length<100||b.length>3000000)throw Error('Bad avatar size');return 'data:'+type+';base64,'+b.toString('base64');}
async function selectedPublicProjects(){
 const names=[];
 return (await Promise.all(names.map(async name=>{
   try{const data=await api('/repos/ihtishaam-dev/'+encodeURIComponent(name));return data.private?null:data;}
   catch(err){console.warn('Using known public link for '+name,err.message);return {name,html_url:'https://github.com/ihtishaam-dev/'+name,description:'Featured AI engineering project',language:null,owner:{login:'ihtishaam-dev'}};}
 }))).filter(Boolean);
}
/** Refresh all packages from this public npm maintainer; API failures preserve the last good data. */
async function refreshNpm(){
 try{
  let previous={packages:[]};
  try{previous=JSON.parse(await readFile('data/npm-packages.json','utf8'));}catch{}
  const get=async url=>{const r=await fetch(url,{headers:{Accept:'application/json','User-Agent':'theihtishaam-profile-refresh'},signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error('Public npm API HTTP '+r.status);return r.json();};
  const catalog=await collectNpmPackages(get,previous);
  const primary=catalog.packages.find(p=>p.name===PRIMARY_PACKAGE);
  if(!primary)throw Error('No verified primary npm package; retaining previous assets');
  const snapshot={schemaVersion:2,package:primary.name,sourceRepo:'theihtishaam/agents-brain',refreshedAt:primary.refreshedAt,coverageStart:primary.coverageStart,coverageEnd:primary.coverageEnd,downloads:primary.downloads,last30Days:primary.last30Days,source:'https://api.npmjs.org/downloads/point/',status:primary.status,note:'Package downloads are not unique users; each snapshot retains its reporting date.'};
  for(const folder of ['data','docs']){
   await put(folder+'/npm-metrics.json',JSON.stringify(snapshot,null,2)+'\n');
   await put(folder+'/npm-packages.json',JSON.stringify(catalog,null,2)+'\n');
  }
  await replaceReadmeRegion('AUTO_NPM_PACKAGES',npmHighlights(catalog));
  try {
   const stats=await get('https://raw.githubusercontent.com/theihtishaam/omni-skills-forge/main/docs/catalog-stats.json');
   if(!Number.isSafeInteger(stats.skillFiles)||stats.skillFiles<0||!Number.isSafeInteger(stats.categoryPaths)||stats.categoryPaths<0)throw Error('Invalid catalog counts');
   await replaceReadmeRegion('AUTO_OMNI_CATALOG',`**${stats.skillFiles.toLocaleString('en-US')} skill files · ${stats.categoryPaths} categories.** [Catalog counts](https://github.com/theihtishaam/omni-skills-forge/blob/main/docs/catalog-stats.json).`);
  } catch(error) {console.warn('Retaining last verified catalog counts:',error.message);}

  console.log('Npm packages verified: '+catalog.packages.length+'; additional 1,000+ highlights: '+qualifiedPackages(catalog).length);
  for(const error of catalog.errors)console.warn(error.package+': '+error.message);
 }catch(e){console.warn('Npm refresh skipped; preserving last verified snapshot:',e.message);}
}
async function replaceReadmeRegion(name,body){
 const before='<!-- '+name+'_START -->',after='<!-- '+name+'_END -->';
 const current=await readFile('README.md','utf8'),start=current.indexOf(before),end=current.indexOf(after);
 if(start<0||end<=start)throw Error('Missing README region '+name);
 await put('README.md',current.slice(0,start)+before+'\n'+body.trim()+'\n'+after+current.slice(end+after.length));
}

/**
 * Keep a compact, source-attributed list of public repositories visible
 * directly in the GitHub profile README. Full details always remain in docs.
 */
async function publishReadmeProjects(official,featured,date){
 const before='<!-- AUTO_PUBLIC_PROJECTS_START -->',after='<!-- AUTO_PUBLIC_PROJECTS_END -->';
 const current=await readFile('README.md','utf8');
 const start=current.indexOf(before),end=current.indexOf(after);
 if(start<0||end<=start){console.warn('Auto project README markers missing; preserving README');return;}
 const repositories=[...official,...featured];
 const grid=projectGrid(repositories,date);
 for(const repo of repositories)await put('assets/repos/'+repo.name+'.svg',projectCard(repo));
 const region=before+'\n'+grid+after;
 const next=current.slice(0,start)+region+current.slice(end+after.length);
 await put('README.md',next);
}
async function main(){
 await refreshNpm();
 const [u,raw,featured]=await Promise.all([api('/users/'+login),repos(),selectedPublicProjects()]);
 if(u.login!==login)throw Error('Unexpected account');
 const all=raw.filter(r=>r.owner?.login===login&&!r.private);
 const official=[...all].sort(projectOrder);
 const display=[...official,...featured.filter(r=>!official.some(p=>p.name.toLowerCase()===r.name.toLowerCase()))];
 const date=new Date().toISOString();
 const receivedStars=starsSummary(all,login);
 const summary={schemaVersion:2,login,refreshedAt:date,publicRepositories:u.public_repos,officialProjectCount:official.length,featuredFromPreviousAccount:display.length-official.length,followers:u.followers,starsOnNonForkRepositories:all.filter(r=>!r.fork).reduce((n,r)=>n+r.stargazers_count,0),starsReceivedOnPublicRepositories:receivedStars.total,starBreakdown:receivedStars.repositories,starScope:'Public repositories owned by '+login+' including forks',source:'https://api.github.com/users/'+login};
 const data={schemaVersion:2,login,refreshedAt:date,officialRepositoryCount:official.length,featuredExternalProjects:display.length-official.length,repositoryCount:display.length,repositories:display.map(r=>({name:r.name,url:r.html_url,description:r.description,language:r.language,stars:r.stargazers_count,sourceOwner:r.owner?.login||login,createdAt:r.created_at,pushedAt:r.pushed_at,fork:r.fork||false,archived:r.archived||false}))};
 await put('data/github-stats.json',JSON.stringify(summary,null,2)+'\n');
 await put('docs/github-stats.json',JSON.stringify(summary,null,2)+'\n');
 await put('data/public-projects.json',JSON.stringify(data,null,2)+'\n');
 await put('docs/public-projects.json',JSON.stringify(data,null,2)+'\n');
 await put('assets/statistics.svg',statistics(u,all,date));
 await replaceReadmeRegion('AUTO_RECEIVED_STARS',starsMarkdown(receivedStars));
 await put('assets/recent-projects.svg',projectsSvg(official,date));
 await put('docs/PUBLIC_PROJECTS.md',markdown(display,date));
 try{
  let t=await readFile('assets/face-scan.template.svg','utf8');
  if(!t.includes('{{AVATAR_DATA_URI}}'))throw Error('Avatar placeholder missing');
  await put('assets/face-scan.svg',t.replaceAll('{{AVATAR_DATA_URI}}',await avatar(u)));
 }catch(e){console.warn('Avatar refresh failed; retaining last graphic:',e.message);}
 await publishReadmeProjects(official,display.filter(r=>!official.some(p=>p.name.toLowerCase()===r.name.toLowerCase())),date);
 await replaceReadmeRegion('AUTO_LATEST_REPOSITORIES',latestRepositoryList(official));
 console.log('Refreshed '+official.length+' official public projects and '+(display.length-official.length)+' featured projects.');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
