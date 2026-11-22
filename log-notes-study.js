/* Local fixtures only. One session, individual entries; no account or network saves. */
(() => {
  const habits={reading:{name:'Read before bed',unit:'pages',amount:5,note:'Finished chapter three. Pick up at page 42.'},water:{name:'Drink water',unit:'mL',amount:250,note:'Took my bottle on the walk.'},stretch:{name:'Evening stretch',unit:'check',amount:1,note:'The shorter session fit before work.'},coffee:{name:'Reduce coffee',unit:'cups',amount:1,note:'Wanted a second cup after lunch; had tea instead.'}};
  const members=[{id:'antony',name:'You',self:true},{id:'maya',name:'Maya',initials:'MK'},{id:'sam',name:'Sam',initials:'SL'}];
  for(const root of document.querySelectorAll('[data-component="log-notes"]')){
    root.innerHTML=`<div class="ln-tools"><today-segmented-control label="Note example" value="reading"><option value="reading">Reading</option><option value="water">Water</option><option value="stretch">Stretching</option><option value="coffee">Less coffee</option></today-segmented-control><label><today-switch label="Share logs with a party" checked></today-switch>Habit party</label><button type="button" data-note-failure aria-pressed="false">Try a save failure</button><button type="button" data-note-reset>Reset example</button></div><div class="ln-grid"><article><span class="ln-step">01 · Inside habit detail</span><div class="ln-surface"><today-log-editor></today-log-editor><p class="ln-confirmation" role="status"></p></div></article><article><span class="ln-step">02 · Revisit</span><div class="ln-surface"><h3>History</h3><div class="ln-entries"></div></div><div class="ln-recap"><span class="ln-step">03 · Reflect</span><today-log-memories></today-log-memories></div></article><article class="ln-party"><span class="ln-step">With your party</span><div class="ln-surface"><h3>Shared check-ins</h3><today-party-photo-carousel variant="overlay"></today-party-photo-carousel></div></article></div><today-log-dialog></today-log-dialog><p class="ln-footnote">Local examples. Open a saved entry inside its habit to add or edit a note. Quick logging stays one tap. Notes and photos can share the same entry. Nothing is sent or saved to an account.</p><div class="ln-links"><a href="habit-detail.html">Try it in habit detail ↗</a><a href="home.html">Try it on Home ↗</a><a href="recap.html">Trial recap ↗</a></div>`;
    const editor=root.querySelector('today-log-editor'),dialog=root.querySelector('today-log-dialog'),history=root.querySelector('.ln-entries'),carousel=root.querySelector('today-party-photo-carousel'),memories=root.querySelector('today-log-memories'),status=root.querySelector('.ln-confirmation');
    let kind='reading',party=true,entries=[],fail=false,busy=false;
    const model=()=>({...habits[kind],...entries.find(e=>e.id==='sample-second'),entryID:'sample-second',dateLabel:'Nov 17 · 8:12 PM',party});
    const paint=()=>{
      history.replaceChildren();entries.slice().reverse().forEach(e=>{const row=document.createElement('today-habit-entry');row.model=e;history.append(row);});
      memories.entries=entries.filter(e=>e.note?.trim()).slice(-3).reverse();
      root.querySelector('.ln-party').hidden=!party;
      carousel.model={today:'2026-11-17',viewerID:'antony',members,entries:entries.map((e,i)=>({...e,memberID:'antony',order:i,reactorIDs:e.reactorIDs||[]}))};
    };
    const reset=()=>{if(busy)return;const h=habits[kind];entries=[{id:'sample-first',date:'2026-11-17',time:'7:36 PM',amount:h.amount,unit:h.unit,note:h.note,...(kind==='reading'?{photoURL:'assets/party-samples/reading-in-bed.jpg',photoAlt:'Reading an open book in bed',reactorIDs:['maya','sam']}:{} )},{id:'sample-second',date:'2026-11-17',time:'8:12 PM',amount:h.amount,unit:h.unit,note:''}];editor.model=model();status.textContent='';fail=false;root.querySelector('[data-note-failure]').setAttribute('aria-pressed','false');paint();};
    root.querySelector('today-segmented-control').addEventListener('change',e=>{kind=e.detail.value;reset();});
    root.querySelector('today-switch').addEventListener('change',e=>{party=e.target.checked;editor.model=model();paint();});
    root.querySelector('[data-note-reset]').onclick=reset;
    root.querySelector('[data-note-failure]').onclick=e=>{fail=!fail;e.currentTarget.setAttribute('aria-pressed',String(fail));};
    root.addEventListener('habit-detail-request',e=>{if(e.detail.action==='entry'){const entry=entries.find(x=>x.id===e.detail.entryID);dialog.open({...entry,entryID:entry.id,name:habits[kind].name,party,dateLabel:`Nov 17 · ${entry.time}`});}});
    root.addEventListener('log-save',e=>{
      e.stopPropagation();if(busy)return;busy=true;const d=e.detail,source=e.target,failed=fail;fail=false;
      root.querySelectorAll('.ln-tools button,.ln-tools today-segmented-control,.ln-tools today-switch').forEach(el=>el.setAttribute('disabled',''));
      setTimeout(()=>{
        busy=false;root.querySelectorAll('.ln-tools [disabled]').forEach(el=>el.removeAttribute('disabled'));root.querySelector('[data-note-failure]').setAttribute('aria-pressed','false');
        if(failed){source.resolve('Couldn’t save. Your amount and note are still here.');return;}
        const existing=entries.find(x=>x.id===d.entryID);
        if(existing)Object.assign(existing,{amount:d.amount,note:d.note,corrected:true});
        else entries.push({id:crypto.randomUUID(),date:'2026-11-17',time:'Just now',amount:d.amount,unit:d.unit,note:d.note});
        source.resolve();if(source.closest('today-log-dialog'))dialog.resolve();else{editor.model=model();editor.querySelector('[data-log-save] button').focus({preventScroll:true});}
        status.textContent=d.entryID?'Log updated.':'Log saved.';paint();
      },450);
    });
    carousel.addEventListener('party-request',e=>{if(e.detail.action!=='react')return;const entry=entries.find(x=>x.id===e.detail.id);if(!entry)return;entry.reactorIDs||=[];entry.reactorIDs=entry.reactorIDs.includes('antony')?entry.reactorIDs.filter(id=>id!=='antony'):[...entry.reactorIDs,'antony'];paint();});
    reset();
  }
})();
