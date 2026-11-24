import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolvePreset,MODE_FRAMES} from '../vendor/thinking-orbs/browser/engine/index.mjs';
const golden=JSON.parse(readFileSync(new URL('../native/vendor/ThinkingOrbs/Tests/ThinkingOrbsTests/Resources/orbs-golden.json',import.meta.url)));
for(const [key,want] of Object.entries(golden.resolved)){
  const [design,size]=key.split('-');assert.deepEqual(resolvePreset(design,Number(size)),want,key);
}
let marks=0;
for(const c of golden.cases){
  const preset=resolvePreset(c.state,c.size),frame=MODE_FRAMES[preset.mode](c.size,c.t,preset.opts);
  assert.equal(frame.dots.length,c.dotCount,c.key);assert.equal(frame.lines.length,c.lineCount,c.key);
  const dots=frame.dots.flatMap(d=>[d.x,d.y,d.z,d.r,d.white,d.a??1]);
  const lines=frame.lines.flatMap(l=>[l.x1,l.y1,l.x2,l.y2,l.white,l.a??1,l.w]);
  for(const [got,want] of [[dots,c.dots],[lines,c.lines]]){
    assert.equal(got.length,want.length);
    got.forEach((v,i)=>assert.ok(Number.isFinite(v)&&Math.abs(v-want[i])<=golden.tolerance,`${c.key} value ${i}: ${v} != ${want[i]}`));
    marks+=got.length;
  }
}
console.log(`18 presets and ${golden.cases.length} reference frames match (${marks} numeric values).`);
