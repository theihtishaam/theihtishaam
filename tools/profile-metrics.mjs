const DAY=86400000;
export const NPM_MAINTAINER='theihtisham';
export const PRIMARY_PACKAGE='@theihtisham/agent-shadow-brain';
export const DOWNLOAD_THRESHOLD=1000;
export const xml=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
export function milestone(count){
 if(!Number.isSafeInteger(count)||count<0)throw Error('Invalid download count');
 for(const [unit,suffix] of [[1e9,'B'],[1e6,'M'],[1e3,'K']])if(count>=unit)return Math.floor(count/unit)+suffix+'+';
 return String(count);
}
export function starsSummary(repositories,login){
 const rows=repositories.filter(r=>r.owner?.login?.toLowerCase()===login.toLowerCase()&&r.private!==true);
 if(rows.some(r=>!Number.isSafeInteger(r.stargazers_count)||r.stargazers_count<0))throw Error('Missing or invalid GitHub star count; retain last verified snapshot');
 return {total:rows.reduce((n,r)=>n+r.stargazers_count,0),repositories:rows.map(r=>({name:r.name,url:r.html_url,stars:r.stargazers_count})).sort((a,b)=>b.stars-a.stars||a.name.localeCompare(b.name))};
}
export function starsMarkdown(summary){
 if(!summary.total)return '';
 return `### Stars received\n\n**${summary.total.toLocaleString('en-US')} total stars** across public repositories owned by [@theihtishaam](https://github.com/theihtishaam).\n\n| Project | Stars |\n|:--|--:|\n`+summary.repositories.filter(r=>r.stars>0).map(r=>`| [${xml(r.name)}](${r.url}) | ${r.stars.toLocaleString('en-US')} |`).join('\n')+'\n';
}
export function periods(start,end){
 const valid=s=>/^\d{4}-\d{2}-\d{2}$/.test(s)&&Number.isFinite(Date.parse(s))&&new Date(s).toISOString().slice(0,10)===s;
 if(!valid(start)||!valid(end)||start>end)throw Error('Invalid npm coverage dates');
 let cursor=Date.parse(start),finish=Date.parse(end),ranges=[];
 while(cursor<=finish){const last=Math.min(finish,cursor+364*DAY);ranges.push({start:new Date(cursor).toISOString().slice(0,10),end:new Date(last).toISOString().slice(0,10)});cursor=last+DAY;}
 return ranges;
}
const validName=name=>typeof name==='string'&&/^(?:@[a-z0-9][a-z0-9._-]*\/)?[a-z0-9][a-z0-9._-]*$/.test(name);
const countValid=n=>Number.isSafeInteger(n)&&n>=0;
function validateCount(row,name,start,end){if(row.package!==name||!countValid(row.downloads)||row.start!==start||row.end!==end)throw Error('Incomplete or mismatched npm download receipt for '+name);}
/** Discover maintained packages and retain each last-good receipt when npm has not reported data yet. */
export async function collectNpmPackages(get,previous={packages:[]}){
 const names=new Set([PRIMARY_PACKAGE]);let complete=false;
 for(let from=0;from<5000;from+=250){
  const page=await get('https://registry.npmjs.org/-/v1/search?text='+encodeURIComponent('maintainer:'+NPM_MAINTAINER)+'&size=250&from='+from);
  if(!Array.isArray(page.objects)||!countValid(page.total))throw Error('Invalid npm package discovery response');
  for(const result of page.objects){if(!validName(result.package?.name))throw Error('Invalid discovered package name');names.add(result.package.name);}
  if(from+page.objects.length>=page.total){complete=true;break;}
  if(!page.objects.length)throw Error('Incomplete npm package discovery');
 }
 if(!complete)throw Error('Npm discovery exceeds supported page count; preserve previous snapshot');
 const packages=[],errors=[];
 for(const name of names){
  try{
   const metadata=await get('https://registry.npmjs.org/'+encodeURIComponent(name));
   if(metadata.name!==name||!metadata.maintainers?.some(m=>m.name===NPM_MAINTAINER))continue;
   const created=new Date(metadata.time?.created).toISOString().slice(0,10);
   if(created<'2015-01-10')throw Error('Full lifetime npm data unavailable for '+name);
   const endpoint='https://api.npmjs.org/downloads/point/';
   const latestDay=await get(endpoint+'last-day/'+encodeURIComponent(name));
   if(latestDay.package!==name||latestDay.start!==latestDay.end||!countValid(latestDay.downloads))throw Error('Invalid latest npm day');
   const ranges=periods(created,latestDay.end),receipts=[];
   for(const range of ranges){const receipt=await get(endpoint+range.start+':'+range.end+'/'+encodeURIComponent(name));validateCount(receipt,name,range.start,range.end);receipts.push(receipt);}
   const downloads=receipts.reduce((n,r)=>n+r.downloads,0);
   if(!countValid(downloads))throw Error('Download total exceeds supported range');
   const recent=await get(endpoint+'last-month/'+encodeURIComponent(name));
   if(recent.package!==name||!countValid(recent.downloads)||(Date.parse(recent.end)-Date.parse(recent.start))/DAY!==29)throw Error('Invalid 30-day download receipt');
   const version=metadata['dist-tags']?.latest;
   packages.push({name,description:metadata.description||'',version:version||null,deprecated:metadata.versions?.[version]?.deprecated||null,url:'https://www.npmjs.com/package/'+name,repository:metadata.repository?.url||null,downloads,last30Days:recent.downloads,coverageStart:created,coverageEnd:latestDay.end,completeSinceCreation:true,refreshedAt:new Date().toISOString(),status:'verified',receipts});
  }catch(error){
   errors.push({package:name,message:error.message});
   const old=previous.packages?.find(p=>p.name===name&&p.completeSinceCreation===true&&countValid(p.downloads));
   if(old)packages.push({...old,status:'last-known'});
  }
 }
 return {schemaVersion:1,maintainer:NPM_MAINTAINER,threshold:DOWNLOAD_THRESHOLD,refreshedAt:new Date().toISOString(),discoveryComplete:true,packages:packages.sort((a,b)=>(a.name===PRIMARY_PACKAGE?-1:b.name===PRIMARY_PACKAGE?1:b.downloads-a.downloads)),errors};
}
export const packageAsset=name=>'assets/npm-packages/'+Buffer.from(name).toString('base64url')+'.svg';
export function qualifiedPackages(snapshot){return snapshot.packages.filter(p=>p.name!==PRIMARY_PACKAGE&&p.downloads>=DOWNLOAD_THRESHOLD&&p.completeSinceCreation===true);}
export function npmCard(p){
 const description=String(p.name==='omni-skills-forge'?'Agent skills catalogue with a local dashboard, installation commands, diagnostics, and export tools.':p.description||'Public npm package maintained by '+NPM_MAINTAINER).replace(/\s+/g,' ').slice(0,155);
 const words=description.split(' '),lines=[];let line='';for(const word of words){if((line+' '+word).length>91){lines.push(line);line='';}line+=(line?' ':'')+word;}if(line)lines.push(line);
 let svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="310" viewBox="0 0 1200 310" role="img" aria-label="${xml(p.name)}: ${p.downloads} npm downloads through ${p.coverageEnd}"><rect x="1" y="1" width="1198" height="308" rx="16" fill="#0b1223" stroke="#344967"/><path d="M38 34H110" stroke="#7dd3fc" stroke-width="4"/><g font-family="Segoe UI,Arial,sans-serif"><text x="38" y="70" fill="#7dd3fc" font-size="16" font-weight="600">NPM PACKAGE · ${p.deprecated?'DEPRECATED':milestone(p.downloads)+' DOWNLOADS'}</text><text x="38" y="119" fill="#f0f5ff" font-size="30" font-weight="650">${xml(p.name)}</text><text x="910" y="98" fill="#fcd34d" font-size="46" font-weight="700">${p.downloads.toLocaleString('en-US')}</text><text x="910" y="129" fill="#b8c8df" font-size="17">total downloads</text>`;
 lines.slice(0,2).forEach((v,i)=>{svg+=`<text x="38" y="${178+i*27}" fill="#c1cfe2" font-size="19">${xml(v)}</text>`;});
 svg+=`<path d="M38 231H1162" stroke="#26354b"/><text x="38" y="267" fill="#a8bcd8" font-size="16">${xml(p.version?'v'+p.version+' · ':'')}Through ${p.coverageEnd} · ${p.status==='last-known'?'Last verified snapshot':'Public npm data'}</text><text x="932" y="267" fill="#7dd3fc" font-size="17">VIEW PACKAGE ↗</text></g></svg>`;
 return svg;
}
export function npmHighlights(snapshot){
 const selected=qualifiedPackages(snapshot);
 return selected.map(p=>`\n<a href="${p.url}"><img src="./${packageAsset(p.name)}" width="100%" alt="${xml(p.name)}: ${p.downloads.toLocaleString('en-US')} total npm downloads through ${p.coverageEnd}"></a>\n\n[**${xml(p.name)} →**](${p.url}) · **${p.downloads.toLocaleString('en-US')} downloads** · ${p.last30Days.toLocaleString('en-US')} in the last 30 days${p.name==='omni-skills-forge'?' · [GitHub repository](https://github.com/theihtishaam/omni-skills-forge)':''}${p.deprecated?' · Deprecated':''}\n`).join('\n');
}
