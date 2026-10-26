import {EXPENSE_DATA,getExpenseTotals} from '../dist/expense-scene.js';
import {readFileSync} from 'node:fs';
import {shareScenario,timeScenario,FINANCIAL_LENSES} from '../dist/enrichment.js';
import test from 'node:test';import assert from 'node:assert/strict';
import {comparison,comparisonLeader,ANNUAL_REVENUE,HALF_YEAR,QUARTERLY_REVENUE,RACE,raceRows,yearsBetween,rulerAt,safePreferences,CHAPTERS,SOURCES} from '../dist/data.js';

test('same-stage comparisons align full calendar years, not six-month revenue',()=>{
 for(const age of [3,4,5])for(const c of comparison(age)){assert.equal(c.year-c.founded+1,age);assert.equal(c.age,age);}
 assert.deepEqual(comparison(5).map(c=>[c.id,c.year,c.revenue]),[['anthropic',2025,4585],['amazon',1998,609.819],['google',2002,439.508],['facebook',2008,272],['salesforce',2003,96.023]]);
 assert.equal(comparison(3)[0].revenue,41);assert.equal(comparison(4)[0].revenue,386);
});
test('a missing primary figure stays missing instead of being estimated',()=>{
 const fb=comparison(3).find(c=>c.id==='facebook');assert.equal(fb.revenue,null);assert.ok(fb.missing);
 const sf=comparison(3).find(c=>c.id==='salesforce');assert.match(sf.period,/AF2002/);
});
test('the comparison insight names who led each year, including when Anthropic did not',()=>{
 assert.equal(comparisonLeader(3).top.id,'salesforce');assert.ok(comparisonLeader(3).ratio>1.8&&comparisonLeader(3).ratio<1.9);
 assert.equal(comparisonLeader(4).top.id,'facebook');
 const five=comparisonLeader(5);assert.equal(five.top.id,'amazon');assert.equal(five.ratio.toFixed(1),'7.5');
});
test('quarters add up to the reported halves and the full year',()=>{
 const sum=(y,n)=>QUARTERLY_REVENUE.filter(q=>q.year===y).slice(0,n).reduce((s,q)=>s+q.value,0);
 assert.equal(sum(2025,2),HALF_YEAR[2025]);assert.equal(sum(2026,2),HALF_YEAR[2026]);assert.equal(sum(2025,4),ANNUAL_REVENUE[2025]);
});
test('semester growth stays separate from annual series',()=>{assert.ok(Math.abs(HALF_YEAR[2026]/HALF_YEAR[2025]-14)<.01);assert.equal(ANNUAL_REVENUE[2026],undefined);assert.equal(Object.keys(ANNUAL_REVENUE).length,3);});
test('the race to the first trillion keeps public and private measures apart',()=>{
 const rows=raceRows();assert.deepEqual(rows.map(r=>r.name),['Meta','Tesla','Alphabet','Amazon','Nvidia','Apple','Microsoft']);
 assert.deepEqual(rows.map(r=>Math.round(r.years)),[17,18,21,24,30,42,44]);
 const a=yearsBetween(RACE.anthropic.founded,RACE.anthropic.date);assert.ok(a>5.3&&a<5.5);assert.ok(RACE.anthropic.value<1000);
});
test('invalid or old browser preferences cannot inject a nonexistent year or stage',()=>{for(const v of [null,'bad',[],{age:99,year:2026,motion:'true',sound:'true'}])assert.deepEqual(safePreferences(v),{year:2025,age:5,motion:true,sound:false});assert.equal(comparison(99)[0].year,2025);});
test('chapters run in chronological order on the ruler and match the page',()=>{
 assert.equal(CHAPTERS.length,18);assert.equal(new Set(CHAPTERS.map(s=>s.id)).size,18);
 for(let i=1;i<CHAPTERS.length;i++)assert.ok(CHAPTERS[i].when>=CHAPTERS[i-1].when,`${CHAPTERS[i].id} goes back in time`);
 assert.equal(CHAPTERS.filter(c=>c.kind==='giro').length,4);
 assert.ok(rulerAt(2026,12)<=92&&rulerAt(2021,0)===0);
 CHAPTERS.forEach(c=>assert.ok(SOURCES.some(s=>s.chapters.includes(c.id)),`${c.id} has no source`));
 const html=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
 const sections=[...html.matchAll(/<section class="story-section[^>]*id="([^"]+)"[^>]*>/g)].map(m=>m[1]);
 assert.deepEqual(sections,CHAPTERS.map(c=>c.id));
 const scenes=[...html.matchAll(/<section class="story-section[^>]*data-scene="(\d+)"/g)].map(m=>Number(m[1]));
 assert.deepEqual(scenes,CHAPTERS.map((_,i)=>i));
 assert.equal(CHAPTERS.at(-1).world,8);
 assert.ok(!html.includes('valuation-reference.png'),'the shared PNG is gone from the page');
 SOURCES.filter(s=>s.url.startsWith('http')).forEach(s=>assert.equal(new URL(s.url).protocol,'https:'));
});
test('every turning-point figure on the page has a figure file',()=>{
 const html=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
 const names=[...html.matchAll(/data-figure="([a-z-]+)"/g)].map(m=>m[1]);assert.deepEqual(names,['cajon','estante','vitrina']);
 for(const n of names){const src=readFileSync(new URL(`../dist/hairline/${n}.js`,import.meta.url),'utf8');assert.match(src,new RegExp(`name: "${n}"`));assert.ok(html.includes(`./hairline/${n}.js`));}
});

test('issuance raises cash without treating all market value as proceeds',()=>{const s=shareScenario(25,2);assert.equal(s.postValueMillions,300);assert.equal(s.raisedMillions,50);assert.equal(s.postValueMillions-s.preValueMillions,s.raisedMillions);assert.equal(s.previousOnePercent,10/12);const zero=shareScenario(100,0);assert.equal(zero.raisedMillions,0);assert.equal(zero.previousOnePercent,1);assert.equal(shareScenario(5,10).previousOnePercent,.5);assert.throws(()=>shareScenario(-1,2));});
test('review cost can eliminate or reverse gross time savings',()=>{assert.equal(timeScenario(20,40,5,10).netSaved,30);assert.equal(timeScenario(20,0,5,10).netSaved,-50);assert.equal(timeScenario(20,50,10,10).netSaved,0);assert.ok(Math.abs(timeScenario(20,80,0,10).assisted-40)<1e-9);});
test('quarterly operation and net result remain distinct',()=>{assert.equal(FINANCIAL_LENSES.operations.value,974);assert.equal(FINANCIAL_LENSES.net.value,-66309);assert.equal(FINANCIAL_LENSES.cash.value,112400);assert.equal(11555-10581,974);});
test('per-dollar chart reconciles all operating costs without adding the deficit twice',()=>{const t=getExpenseTotals();assert.equal(t.revenue,16286);assert.equal(t.expenses,16979);assert.equal(t.deficit,693);assert.equal(EXPENSE_DATA.categories.length,4);assert.equal(EXPENSE_DATA.bartz,0);assert.ok(Math.abs(t.expenseCents-100-t.deficitCents)<1e-12);assert.equal(t.expenseCents.toFixed(1),'104.3');assert.equal(t.deficitCents.toFixed(1),'4.3');});
