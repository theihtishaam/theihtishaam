const xml = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const highlights = {
  'agents-brain': {title:'Agent Shadow Brain',label:'FEATURED · SHARED AGENT MEMORY',color:'#7dd3fc',description:'Shared local knowledge, scoped context, PDF imports, and a visual workspace for coding agents.',language:'TypeScript · Node.js · MCP',rank:0},
  'Procure-guard-ai': {title:'ProcureGuard AI',label:'FEATURED · HACKATHON CATEGORY WINNER',color:'#fcd34d',description:'Eight specialist agents, evidence, adversarial review, and human approval for vendor decisions.',language:'Python · Band · Agent frameworks',rank:1},
  'exactwork-skills': {title:'ExactWork Skills',label:'FEATURED · PROJECT-LOCAL SKILLS',color:'#9ecbfa',description:'Six portable Agent Skills for focused work, research, review, handoff, context, and learning.',language:'Markdown skills · Python helpers',rank:2},
  'CiviTwin': {title:'CivicTwin Δ',label:'ENTERPRISE TAX & REGULATORY SCENARIOS',color:'#c7bcf0',description:'Compare tax and regulatory scenarios with typed rules, recorded evidence, and explicit assumptions.',language:'TypeScript',rank:3},
  'omni-skills-forge': {title:'Omni Skills Forge',label:'MARKDOWN SKILL CATALOG',color:'#f5c77e',description:'Search, inspect, and copy Markdown coding-agent skills by category, tag, and difficulty.',language:'JavaScript · npm CLI',rank:4},
  'theihtishaam': {title:'GitHub Profile',label:'PROFILE · PUBLIC PROJECT DIRECTORY',color:'#b8c8df',description:'My public projects, languages, websites, and links. Repository cards and avatar refresh automatically.',language:'Profile · Visual portfolio',rank:999},
};
export const projectOrder = (a,b) => (highlights[a.name]?.rank ?? 100) - (highlights[b.name]?.rank ?? 100) || (b.pushed_at || b.pushedAt || '').localeCompare(a.pushed_at || a.pushedAt || '') || a.name.localeCompare(b.name);
const createdTime = repo => Date.parse(repo.created_at ?? repo.createdAt);
function publicRepoUrl(repo) {
  const url=repo.html_url || repo.url;
  if(!/^[\w.-]+$/.test(repo.name) || !/^https:\/\/github\.com\/[\w-]+\/[\w.-]+\/?$/.test(url || ''))throw Error('Unexpected public repository name or URL');
  return url;
}
export function latestRepositories(repositories, limit=3) {
  return [...repositories].filter(repo=>Number.isFinite(createdTime(repo)))
    .sort((a,b)=>createdTime(b)-createdTime(a)||a.name.localeCompare(b.name)).slice(0,limit);
}
export function latestRepositoryList(repositories) {
  const latest=latestRepositories(repositories);
  if(!latest.length)return 'Repository creation dates are unavailable.';
  return latest.map(repo=>{
    const date=new Date(createdTime(repo)).toISOString().slice(0,10);
    const title=highlights[repo.name]?.title || repo.name;
    const description=highlights[repo.name]?.description || repo.description;
    return `- <a href="${xml(publicRepoUrl(repo))}"><b>${xml(title)}</b></a> · Created ${date}${description?' — '+xml(wrap(description,135,1)[0]):''}`;
  }).join('\n');
}
function wrap(value, limit, lines) {
  const words=String(value || '').replace(/\s+/g,' ').trim().split(' '),result=[];
  let line='';
  for (const word of words) {
    for (let chunk of word.match(new RegExp('.{1,'+limit+'}','gu')) || []) {
      if (line && line.length+chunk.length+1>limit) {result.push(line);line='';}
      line+=(line?' ':'')+chunk;
    }
  }
  if(line)result.push(line);
  if(result.length>lines)result[lines-1]=result[lines-1].slice(0,limit-1)+'…';
  return result.slice(0,lines);
}
function text(x,y,s,size,color,weight=400) {return `<text x="${x}" y="${y}" fill="${color}" font-size="${size}" font-weight="${weight}" font-family="Segoe UI,Arial,sans-serif">${xml(s)}</text>`;}
const procureTrophy = "<defs><radialGradient id=\"pg-halo\"><stop offset=\"0\" stop-color=\"#FFCD4D\" stop-opacity=\".23\"/><stop offset=\".65\" stop-color=\"#FFBA30\" stop-opacity=\".08\"/><stop offset=\"1\" stop-color=\"#FFBA30\" stop-opacity=\"0\"/></radialGradient><linearGradient id=\"pg-gold\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\".7\"><stop offset=\"0\" stop-color=\"#A56514\"/><stop offset=\".2\" stop-color=\"#FDE68A\"/><stop offset=\".45\" stop-color=\"#FFEEA3\"/><stop offset=\".67\" stop-color=\"#D89922\"/><stop offset=\"1\" stop-color=\"#8B5013\"/></linearGradient><linearGradient id=\"pg-trim\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\"><stop offset=\"0\" stop-color=\"#FFF7BB\"/><stop offset=\".45\" stop-color=\"#FBBF24\"/><stop offset=\"1\" stop-color=\"#B77916\"/></linearGradient><radialGradient id=\"pg-stand\"><stop stop-color=\"#FFCE51\" stop-opacity=\".4\"/><stop offset=\"1\" stop-color=\"#FFCE51\" stop-opacity=\"0\"/></radialGradient></defs><g id=\"pg-trophy\" aria-label=\"Gold championship trophy\"><circle cx=\"541\" cy=\"150\" r=\"93\" fill=\"url(#pg-halo)\"/><circle cx=\"541\" cy=\"150\" r=\"80\" fill=\"none\" stroke=\"#E6AE32\" stroke-width=\"1\" opacity=\".26\"/><ellipse cx=\"541\" cy=\"222\" rx=\"65\" ry=\"16\" fill=\"url(#pg-stand)\"/><g stroke=\"#F9D567\" stroke-linejoin=\"round\"><path d=\"M502 91C463 82 470 137 493 148C503 154 514 146 515 137L507 132C501 147 487 136 486 115C485 100 498 102 508 106Z\" fill=\"url(#pg-gold)\" stroke-width=\"2\"/><path d=\"M580 91C619 82 612 137 589 148C579 154 568 146 567 137L575 132C581 147 595 136 596 115C597 100 584 102 574 106Z\" fill=\"url(#pg-gold)\" stroke-width=\"2\"/><path d=\"M501 89Q541 84 581 89L575 125Q569 152 549 166L544 175H538L533 166Q513 152 507 125Z\" fill=\"url(#pg-gold)\" stroke-width=\"2.7\"/><ellipse cx=\"541\" cy=\"89\" rx=\"40\" ry=\"6.2\" fill=\"#FFEA8A\" stroke=\"url(#pg-trim)\" stroke-width=\"3\"/><path d=\"M537 171H545L547 192H535Z\" fill=\"url(#pg-gold)\" stroke-width=\"2\"/><rect x=\"517\" y=\"192\" width=\"48\" height=\"8\" rx=\"2\" fill=\"url(#pg-trim)\" stroke-width=\"1.6\"/><path d=\"M507 200H575L582 215H500Z\" fill=\"#5B391B\" stroke=\"url(#pg-trim)\" stroke-width=\"2\"/><rect x=\"499\" y=\"213\" width=\"84\" height=\"9\" rx=\"3\" fill=\"url(#pg-gold)\" stroke-width=\"2\"/></g><path d=\"M529 121C521 124 521 134 529 139M553 121C561 124 561 134 553 139M531 144Q541 151 551 144\" stroke=\"#FFF1A8\" stroke-width=\"2\" fill=\"none\" stroke-linecap=\"round\"/><path d=\"M529 135L523 132M553 135L559 132M529 130L524 127M553 130L558 127\" stroke=\"#FFF1A8\" stroke-width=\"1.8\" stroke-linecap=\"round\"/><path d=\"M590 75l2 8 8 2-8 2-2 8-2-8-8-2 8-2ZM477 155l1.4 5.5 5.5 1.4-5.5 1.4-1.4 5.5-1.4-5.5-5.5-1.4 5.5-1.4Z\" fill=\"#FFF0AA\"/><text x=\"541\" y=\"209\" text-anchor=\"middle\" font-size=\"6.5\" font-family=\"Segoe UI,Arial,sans-serif\" font-weight=\"bold\" letter-spacing=\"1\" fill=\"#FFE49B\">WINNER</text></g>";
export function projectCard(repo) {
  const pick=highlights[repo.name],color=pick?.color || '#7dd3fc';
  const title=pick?.title || repo.name,description=pick?.description || repo.description || 'Explore the source code and documentation in this public repository.';
  let svg=`<svg xmlns="http://www.w3.org/2000/svg" width="640" height="324" viewBox="0 0 640 324" role="img" aria-label="${xml(title+': '+description)}"><title>${xml(title)}</title><rect x="1" y="1" width="638" height="322" rx="14" fill="#0b1223" stroke="#26354b"/><path d="M26 29H76" stroke="${color}" stroke-width="4"/>`;
  svg+=text(26,57,pick?.label || (repo.archived?'ARCHIVED PUBLIC REPOSITORY':repo.fork?'PUBLIC REPOSITORY · FORK':'PUBLIC REPOSITORY'),13,color,600);
  wrap(title,32,2).forEach((line,i)=>{svg+=text(26,103+i*36,line,29,'#f0f5ec',600);});
  wrap(description,55,3).forEach((line,i)=>{svg+=text(26,177+i*25,line,18,'#b8c8df');});
  if(repo.name==='Procure-guard-ai')svg+=procureTrophy;
  svg+='<path d="M26 253H614" stroke="#26354b"/>';
  svg+=text(26,286,pick?.language || repo.language || 'Source & documentation',15,color,600)+text(551,286,'VIEW ↗',13,'#f0f5ec',600);
  return svg+'</svg>';
}
/** GitHub-safe table grid: no CSS, scripts, collapsed rows, or repository limit. */
export function projectGrid(repositories, date) {
  const sorted=[...repositories].sort(projectOrder);
  const cards=sorted.map(repo=>{
    const url=publicRepoUrl(repo);
    const label=highlights[repo.name]?.title || repo.name;
    const stars=repo.stargazers_count??repo.stars;
    const count=Number.isSafeInteger(stars)&&stars>0?` · ★ ${stars.toLocaleString('en-US')}`:'';
    return `<td width="50%" valign="top"><a href="${xml(url)}"><img src="./assets/repos/${encodeURIComponent(repo.name)}.svg" width="100%" alt="${xml(label+': '+(highlights[repo.name]?.description || repo.description || 'Public repository'))}"></a><br><a href="${xml(url)}"><b>${xml(repo.name)}</b> ↗</a>${count}</td>`;
  });
  const rows=[];
  for(let i=0;i<cards.length;i+=2)rows.push('<tr>\n'+cards.slice(i,i+2).join('\n')+(i+1===cards.length?'\n<td width="50%"></td>':'')+'\n</tr>');
  return `**${cards.length} public repositories · refreshed ${date.slice(0,10)}**\n\n`+(cards.length?'<table>\n'+rows.join('\n')+'\n</table>':'New public repositories will appear here after the next successful refresh.')+'\n\n[Browse on GitHub](https://github.com/theihtishaam?tab=repositories) · [Project directory](./docs/PUBLIC_PROJECTS.md)\n';
}
