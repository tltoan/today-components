/* Run from any working directory: node scripts/export-streak-assets.js */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const scope = {window:{}};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../components/streak-flame-art.js'),'utf8'),scope);
const output=path.join(__dirname,'../assets/streaks');
fs.mkdirSync(output,{recursive:true});
for(const palette of Object.keys(scope.window.TodayFlameArt.palettes)){
  for(const animated of [false,true]){
    fs.writeFileSync(path.join(output,palette+(animated?'-animated':'')+'.svg'),scope.window.TodayFlameArt.svg(palette,animated,'flame-'+palette));
  }
}
