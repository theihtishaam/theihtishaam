import test from 'node:test';
import assert from 'node:assert/strict';
import {milestone,starsSummary,starsMarkdown,periods,collectNpmPackages,qualifiedPackages,npmHighlights,npmCard,PRIMARY_PACKAGE} from './profile-metrics.mjs';
test('download milestones advance at each threshold without rounding up',()=>{
 for(const [value,label] of [[0,'0'],[999,'999'],[1000,'1K+'],[6030,'6K+'],[9999,'9K+'],[140122,'140K+'],[999999,'999K+'],[1000000,'1M+']])assert.equal(milestone(value),label);
 assert.throws(()=>milestone(-1));assert.throws(()=>milestone(NaN));
});
test('stars stay hidden at zero and appear with a complete per-project breakdown',()=>{
 const repo=(name,stars,extra={})=>({name,stargazers_count:stars,owner:{login:'theihtishaam'},html_url:'https://github.com/theihtishaam/'+name,...extra});
 assert.equal(starsMarkdown(starsSummary([repo('one',0)],'theihtishaam')),'');
 const summary=starsSummary([repo('one',3),repo('two',1,{fork:true}),repo('private',9,{private:true}),repo('other',7,{owner:{login:'another'}})],'theihtishaam');
 assert.equal(summary.total,4);assert.equal(summary.repositories.length,2);
 const markdown=starsMarkdown(summary);assert.match(markdown,/4 total stars/);assert.match(markdown,/one.*3/);assert.match(markdown,/two.*1/);
 assert.throws(()=>starsSummary([repo('missing',undefined)],'theihtishaam'));
});
test('lifetime download windows cover every date exactly once',()=>{
 const windows=periods('2024-01-01','2026-11-12');
 assert.equal(windows[0].start,'2024-01-01');assert.equal(windows.at(-1).end,'2026-11-12');
 for(let i=0;i<windows.length;i++){
  const w=windows[i];assert.ok((Date.parse(w.end)-Date.parse(w.start))/86400000<365);
  if(i)assert.equal(Date.parse(w.start)-Date.parse(windows[i-1].end),86400000);
 }
 assert.throws(()=>periods('2026-02-30','2026-03-01'));
});
test('1,000-download highlights exclude the primary card and packages below the threshold',()=>{
 const p=(name,downloads)=>({name,downloads,completeSinceCreation:true,coverageEnd:'2026-11-12',last30Days:20,url:'https://www.npmjs.com/package/'+name,status:'verified'});
 const snapshot={packages:[p(PRIMARY_PACKAGE,6030),p('small',999),p('qualified',1000),{...p('incomplete',5000),completeSinceCreation:false}]};
 assert.deepEqual(qualifiedPackages(snapshot).map(p=>p.name),['qualified']);
 assert.match(npmHighlights(snapshot),/\*\*1,000\*\*/);assert.doesNotMatch(npmHighlights(snapshot),/<img|!\[/);assert.doesNotMatch(npmHighlights(snapshot),/small|incomplete/);
 assert.doesNotMatch(npmCard({...p('safe',1000),description:'<script>alert(1)</script>'}),/<script>/);
});
test('discovery verifies ownership and retains dated data on download API failure',async()=>{
 const names=[PRIMARY_PACKAGE,'future-package','unrelated'];
 const get=async url=>{
  if(url.includes('/-/v1/search'))return {total:3,objects:names.map(name=>({package:{name}}))};
  if(url.startsWith('https://registry.npmjs.org/')){const name=decodeURIComponent(url.split('/').at(-1));return {name,maintainers:[{name:name==='unrelated'?'someone-else':'theihtisham'}],time:{created:'2026-01-01'},'dist-tags':{latest:'1.0.0'}};}
  const name=decodeURIComponent(url.split('/').at(-1));
  if(name==='future-package')throw Error('Statistics not ready');
  if(url.includes('last-day'))return {package:name,start:'2026-11-12',end:'2026-11-12',downloads:20};
  if(url.includes('last-month'))return {package:name,start:'2026-10-14',end:'2026-11-12',downloads:100};
  return {package:name,start:'2026-01-01',end:'2026-11-12',downloads:6030};
 };
 const result=await collectNpmPackages(get,{packages:[{name:'future-package',downloads:1500,completeSinceCreation:true,coverageEnd:'2026-11-10',refreshedAt:'2026-11-11T00:00:00Z'}]});
 assert.equal(result.packages.length,2);assert.equal(result.packages[0].downloads,6030);
 const retained=result.packages.find(p=>p.name==='future-package');assert.equal(retained.status,'last-known');assert.equal(retained.coverageEnd,'2026-11-10');
 assert.equal(result.errors.length,1);assert.ok(!result.packages.some(p=>p.name==='unrelated'));
});
