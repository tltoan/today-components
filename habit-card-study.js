/* Gallery fixtures only. No network, photos, persistence or real streak credit. */
(() => {
  const reading={id:'reading',name:'Read before bed',artwork:'open-book',kind:'amount',target:10,unit:'pages',increment:5,cue:'Before bed',date:'2026-11-17',current:true,amount:null,feedback:'wash'};
  const water={...reading,id:'water',name:'Drink water',artwork:'water-droplet',target:2000,unit:'mL',increment:250,cue:'Throughout the day',amount:1750};
  function bind(card,initial,status){
    let generation=0;
    card.model=initial;
    card.addEventListener('logrequest',()=>{
      const h=card.model;if(h.pending)return;
      const token=generation;card.model={...h,pending:true};
      setTimeout(()=>{if(token!==generation)return;status.textContent=`${h.name}: ${((h.amount||0)+h.increment).toLocaleString('en-US')} ${h.unit} logged.`;card.model={...h,pending:false,amount:(h.amount||0)+h.increment};},240);
    });
    card.addEventListener('target-reached',()=>{status.textContent='Target met. The background settles; you can keep logging.';});
    return ()=>{generation++;card.model={...initial,current:false};card.model=initial;status.textContent='Example reset.';};
  }
  for(const root of document.querySelectorAll('[data-component="habit-cards"]')){
    root.innerHTML=`<div class="hc-heading"><div><h3>Cards, with room for a streak.</h3><p>One shared Today streak sits beside “Your day,” above either card layout.</p></div><a href="habit-cards.html">Open components ↗</a></div><div class="hc-grid">${[['hero','Illustrated card','One habit gets more room.'],['compact','Compact card','The same structure, ready for a list.']].map(([layout,title,note])=>`<article class="hc-example"><div class="hc-label"><h4>${title}</h4><a href="source.html#habit-card">Code ↗</a></div><div class="hc-placement"><div class="hc-day"><strong>Your day</strong><today-streak-badge days="6"></today-streak-badge></div><today-habit-card layout="${layout}"></today-habit-card></div><p>${note}</p><button type="button" data-card-reset>Reset example</button><p class="hc-status" role="status"></p></article>`).join('')}</div><p class="hc-footnote">Streak placement study · The flame belongs to Today, not to a single habit. These sample six days stay separate from each card’s target.</p><a class="hc-guide" href="HABIT-CARDS.md">Card, streak and completion APIs ↗</a>`;
    root.querySelectorAll('.hc-example').forEach((item,i)=>{
      const reset=bind(item.querySelector('today-habit-card'),i?{...water,amount:750}:reading,item.querySelector('.hc-status'));
      item.querySelector('[data-card-reset]').addEventListener('click',reset);
    });
  }
  for(const root of document.querySelectorAll('[data-component="target-feedback"]')){
    const variants=[['wash','Gradient rise','The color rises when you meet your target and gently retreats when an undo takes you below it.']];
    root.innerHTML=`<div class="hc-heading"><div><h3>A little response when you get there.</h3><p>Gradient Rise is selected. Add the last 250 mL to try the stronger fill.</p></div><a href="source.html#target-feedback">Code ↗</a></div><div class="tf-studies">${variants.map(([variant,title,note],i)=>`<article class="tf-study"><div class="hc-label"><h4>${title}</h4></div><today-habit-card layout="compact" data-variant="${variant}"></today-habit-card><p>${note}</p><div class="tf-tools"><button type="button" data-reset>Reset</button><button type="button" data-undo disabled>Undo last log</button><button type="button" data-replay disabled>Replay motion</button></div><p class="hc-status" role="status">1,750 of 2,000 mL · one more log</p></article>`).join('')}</div><p class="hc-footnote">Each plays once on a confirmed target crossing. More logs remain available. Reduced motion keeps the settled tint.</p>`;
    root.querySelectorAll('.tf-study').forEach(item=>{
      const card=item.querySelector('today-habit-card'), replay=item.querySelector('[data-replay]');
      const undo=item.querySelector('[data-undo]');
      card.addEventListener('logrequest',()=>{undo.disabled=false;});
      undo.addEventListener('click',()=>{const h=card.model;if(h.pending)return;card.model={...h,amount:Math.max(0,h.amount-h.increment)};undo.disabled=card.model.amount<=1750;replay.disabled=card.model.amount<2000;item.querySelector('.hc-status').textContent=card.model.amount>=2000?'Still at the target. The color stays.':'Below target. The color settles back down.';});
      const reset=bind(card,{...water,feedback:card.dataset.variant},item.querySelector('.hc-status'));
      card.addEventListener('target-reached',()=>{replay.disabled=false;});
      item.querySelector('[data-reset]').addEventListener('click',()=>{reset();replay.disabled=true;undo.disabled=true;});
      replay.addEventListener('click',()=>card.querySelector('today-target-feedback').celebrate());
    });
  }
})();
