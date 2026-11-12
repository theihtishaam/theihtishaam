import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const fake = (name='div')=>{
 const events={},attrs={},classes=new Set();
 return {
  nodeName:name,events,attrs,dataset:{},children:[],textContent:'',value:'',hidden:false,
  classList:{add:c=>classes.add(c),toggle:(c,active)=>{if(active)classes.add(c);else classes.delete(c)},contains:c=>classes.has(c)},
  style:{setProperty(){}},
  append(...items){this.children.push(...items)},
  replaceChildren(...items){this.children=items},
  setAttribute:(k,v)=>{attrs[k]=v},
  addEventListener:(type,fn)=>{events[type]=fn},
  focus(){this.focused=true},
  querySelector(){return null}
 };
};
const file=async name=>readFile(new URL('../docs/'+name,import.meta.url),'utf8');
const tick=()=>new Promise(done=>setTimeout(done,0));

test('architecture workflow tabs initialize, respond to click, and stay accessible',async()=>{
 const toggle=fake('button'),motion=fake('span');
 toggle.querySelector=()=>motion;
 const tabNames=['shadow','civic','procure'];
 const tabs=tabNames.map((name,i)=>{const e=fake('button');e.id='flow-tab-'+name;e.dataset.project=name;e.textContent=name;e.tabIndex=i===0?0:-1;return e});
 const panel=fake('div'),img=fake('img'),link=fake('a'),cta=fake('a'),desc=fake('p');
 const map={'#motion-toggle':toggle,'#particle-field':null,'#flow-panel':panel,'#flow-image':img,'#flow-link':link,'#flow-cta':cta,'#flow-description':desc};
 const document={
  body:{classList:{toggle(){},contains(){return false}}},
  documentElement:{scrollHeight:900,style:{setProperty(){}}},
  querySelector:s=>map[s]??null,
  querySelectorAll:s=>s==='.caseflow-tab'?tabs:[],
  addEventListener(){},
  getElementById:()=>null,
 };
 const context={document,window:{matchMedia:()=>({matches:true,addEventListener(){}})},innerWidth:1250,innerHeight:720,scrollY:0,addEventListener(){},requestAnimationFrame:()=>0,console};
 vm.runInNewContext(await file('app.js'),context,{timeout:3000});
 assert.ok(tabs.every(t=>typeof t.events.click==='function'),'all three tabs have live event handlers');
 tabs[1].events.click();
 assert.equal(panel.attrs['aria-labelledby'],'flow-tab-civic');
 assert.equal(img.src,'./assets/flow-civic-twin.svg');
 assert.equal(link.href,'./projects/civic-twin.html');
 assert.equal(desc.textContent.includes('Evaluate typed rules')||desc.textContent.includes('Capture facts'),true);
});

test('public project browser loads future repos, filters, searches and paginates',async()=>{
 const selectors={
  '#repo-list':fake('div'),'#repo-search':fake('input'),'#repo-sort':fake('select'),
  '#repo-show-more':fake('button'),'#repo-result-summary':fake('p'),
  '#stat-repos':fake('span'),'#stat-stars':fake('span'),
  '#stat-followers':fake('span'),'#stat-status':fake('span')
 };
 selectors['#repo-sort'].value='updated';
 const buttons=['all','official','featured'].map(v=>{const b=fake('button');b.dataset.filter=v;return b;});
 const document={
  querySelector:s=>selectors[s]||null,
  querySelectorAll:s=>s==='.repo-filter'?buttons:[],
  createElement:tag=>fake(tag),addEventListener(){}
 };
 const repos=Array.from({length:15},(_,i)=>({
  name:'future-project-'+(i+1),html_url:'https://github.com/theihtishaam/future-project-'+(i+1),
  owner:{login:'theihtishaam'},private:false,description:'Auto discovered public project '+(i+1),
  language:i%2===0?'Python':'TypeScript',pushed_at:'2026-11-12T10:00:00Z',stargazers_count:i
 }));
 const legacy=[
  {name:'agent-shadow-brain',url:'https://github.com/ihtishaam-dev/agent-shadow-brain',sourceOwner:'ihtishaam-dev',description:'Memory coding',language:'TypeScript'},
  {name:'Civic-Twins',url:'https://github.com/ihtishaam-dev/Civic-Twins',sourceOwner:'ihtishaam-dev',description:'Regulation',language:'TypeScript'},
  {name:'procureguard-ai-band-agents',url:'https://github.com/ihtishaam-dev/procureguard-ai-band-agents',sourceOwner:'ihtishaam-dev',description:'Agent approvals',language:'Python'}
 ];
 const data={
  './public-projects.json':{repositories:legacy},
  './github-stats.json':{publicRepositories:1,followers:0,starsOnNonForkRepositories:0},
  'https://api.github.com/users/theihtishaam':{public_repos:16,followers:4},
  'https://api.github.com/users/theihtishaam/repos?per_page=100&type=owner&sort=pushed':[
   {name:'theihtishaam',owner:{login:'theihtishaam'},private:false,html_url:'https://github.com/theihtishaam/theihtishaam'},...repos
  ]
 };
 const fetch=async url=>{
  if(!(url in data))throw new Error('Unexpected test URL '+url);
  return {ok:true,json:async()=>data[url]};
 };
 vm.runInNewContext(await file('catalogue.js'),{document,fetch,AbortSignal,console:{warn(){}},setTimeout},{timeout:3000});
 for(let i=0;i<6;i++)await tick();
 const list=selectors['#repo-list'];
 assert.equal(selectors['#stat-status'].textContent,'LIVE');
 assert.equal(selectors['#stat-repos'].textContent,'16');
 assert.equal(selectors['#stat-followers'].textContent,'4');
 assert.equal(list.children.length,12,'first page shows 12 cards');
 assert.equal(selectors['#repo-show-more'].hidden,false,'pagination available');
 selectors['#repo-show-more'].events.click();
 assert.equal(list.children.length,18,'all 15 future public projects plus 3 featured projects');
 buttons[1].events.click();
 assert.equal(list.children.length,12,'official category retains 15 public projects with paging');
 selectors['#repo-show-more'].events.click();
 assert.equal(list.children.length,15);
 buttons[2].events.click();
 assert.equal(list.children.length,3,'featured category isolates legacy AI projects');
 selectors['#repo-search'].value='Civic';
 selectors['#repo-search'].events.input();
 assert.equal(list.children.length,1,'instant search filters by project title');
 assert.equal(list.children[0].href,'https://github.com/ihtishaam-dev/Civic-Twins');
});
