const { test } = require('node:test');
const assert = require('node:assert/strict');
require('../components/party-progress.js');
const progress = globalThis.TodayPartyProgress.progress;
function fixture() {
  return {today:'2026-11-17',days:[
    {date:'2026-11-15',scheduled:true,memberIDs:['a','b']},
    {date:'2026-11-16',scheduled:false,memberIDs:['a','b']},
    {date:'2026-11-17',scheduled:true,memberIDs:['a','b']}
  ],entries:[{id:'1',date:'2026-11-15',memberID:'a',amount:1},
    {id:'2',date:'2026-11-15',memberID:'b',amount:0},
    {id:'3',date:'2026-11-17',memberID:'a',amount:5}]};
}
test('partial and explicit zero count; an open current day preserves prior scheduled streak',()=>{const p=progress(fixture());assert.equal(p.streak,1);assert.equal(p.current.logged,1);assert.equal(p.current.complete,false);});
test('everyone logging advances once; duplicate logs and member IDs do not add credit',()=>{const m=fixture();m.days[2].memberIDs.push('b');m.entries.push({date:m.today,memberID:'b',amount:0},{date:m.today,memberID:'b',amount:20});const p=progress(m);assert.equal(p.streak,2);assert.equal(p.current.logged,2);assert.equal(p.current.total,2);});
test('days off preserve the streak without requiring any logs',()=>{const m=fixture();m.today='2026-11-16';const p=progress(m);assert.equal(p.streak,1);assert.equal(p.current.scheduled,false);});
test('a missed scheduled day breaks the streak after its day closes',()=>{const m=fixture();m.days[1].scheduled=true;assert.equal(progress(m).streak,0);});
test('undo of the only saved log restores the open-day state',()=>{const m=fixture();m.entries.push({id:'last',date:m.today,memberID:'b',amount:1});assert.equal(progress(m).streak,2);m.entries=m.entries.filter(e=>e.id!=='last');assert.equal(progress(m).streak,1);});
test('unsaved, missing and non-finite amounts do not count',()=>{for(const entry of [{amount:null},{amount:NaN},{amount:Infinity},{amount:1,saved:false}]){const m=fixture();m.entries.push({date:m.today,memberID:'b',...entry});assert.equal(progress(m).current.logged,1);}});
test('dated membership does not penalize history when a person joins today',()=>{const m=fixture();m.days[2].memberIDs.push('c');const p=progress(m);assert.equal(p.streak,1);assert.equal(p.current.total,3);});
test('missing calendar coverage stops the count instead of inventing a day off',()=>{const m=fixture();m.days=m.days.filter(d=>d.date!=='2026-11-16');assert.equal(progress(m).streak,0);});
