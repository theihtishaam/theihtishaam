import test from 'node:test';
import assert from 'node:assert/strict';
import {projectGrid,projectCard,latestRepositories,latestRepositoryList} from './project-grid.mjs';
const repo=name=>({name,html_url:`https://github.com/theihtishaam/${name}`,description:'Public project'});
test('the grid includes every public repository, highlights the chosen projects and never collapses',()=>{
 const repos=[...Array.from({length:65},(_,i)=>repo(`future-${i}`)),repo('theihtishaam'),repo('exactwork-skills'),repo('Procure-guard-ai'),repo('agents-brain')];
 const grid=projectGrid(repos,'2026-11-13');
 assert.equal((grid.match(/<img /g)||[]).length,69);
 assert.equal((grid.match(/<tr>/g)||[]).length,35);
 for(const r of repos)assert.ok(grid.includes(`assets/repos/${r.name}.svg`));
 assert.ok(grid.indexOf('agents-brain.svg')<grid.indexOf('Procure-guard-ai.svg'));
 assert.ok(grid.indexOf('Procure-guard-ai.svg')<grid.indexOf('exactwork-skills.svg'));
 assert.ok(grid.indexOf('exactwork-skills.svg')<grid.indexOf('future-0.svg'));
 assert.doesNotMatch(grid,/<details|<summary|show.more/i);
});
test('public metadata cannot inject markup or an unsafe repository link',()=>{
 const r={...repo('safe-repo'),description:'<script>alert("test")</script> & more'};
 assert.doesNotMatch(projectGrid([r],'2026-11-13'),/<script>/);
 assert.doesNotMatch(projectCard(r),/<script>/);
 assert.match(projectCard(r),/&lt;script&gt;/);
 assert.throws(()=>projectGrid([{...r,html_url:'javascript:alert(1)'}],'2026-11-13'));
 assert.throws(()=>projectGrid([{...r,name:'../outside'}],'2026-11-13'));
});
test('the latest list uses verified creation time independently of push date and featured rank',()=>{
 const older={...repo('agents-brain'),created_at:'2026-11-13T09:23:01Z',pushed_at:'2026-11-14T12:00:00Z'};
 const newer={...repo('new-repo'),created_at:'2026-11-13T11:03:18Z',pushed_at:'2026-11-13T11:03:18Z',description:'<script>test</script>'};
 const sameDay={...repo('third-repo'),createdAt:'2026-11-13T10:10:06Z'};
 const noDate={...repo('missing-date'),pushed_at:'2026-11-15T12:00:00Z'};
 const input=[older,noDate,newer,sameDay];
 assert.deepEqual(latestRepositories(input).map(r=>r.name),['new-repo','third-repo','agents-brain']);
 assert.deepEqual(latestRepositories(input,1),[newer]);
 assert.match(latestRepositoryList(input),/Created 2026-11-13/);
 assert.match(latestRepositoryList(input),/&lt;script&gt;/);
 assert.doesNotMatch(latestRepositoryList(input),/missing-date|★|<details/);
 assert.match(latestRepositoryList([noDate]),/dates are unavailable/);
});
test('repository cards display received stars only when positive',()=>{
 const grid=projectGrid([{...repo('zero-stars'),stargazers_count:0},{...repo('with-stars'),stargazers_count:3}],'2026-11-13');
 assert.doesNotMatch(grid,/★ 0/);
 assert.match(grid,/★ 3/);
});
