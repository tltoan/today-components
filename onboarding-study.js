(() => {
  const screens=[['welcome','Landing'],['features','Features'],['describe','Describe'],['privacy','Privacy'],['intro','Introduction'],['track','Tracking'],['target','Target'],['rhythm','Schedule'],['review','Review'],['saved','Saved'],['home','Home']];
  const selected={describe:'b',privacy:'b',intro:'b',track:'b',target:'a',rhythm:'b',review:'b',saved:'b',home:'b'};
  const notes={describe:'Selected input panel',privacy:'B · Centered artwork',intro:'B · Selected direction',track:'B · Selected direction',target:'A layout + a quiet panel',rhythm:'B · Centered count + preset pill',review:'B · Selected direction',saved:'B · Selected direction',home:'B · Selected direction'};
  for(const root of document.querySelectorAll('[data-component="onboarding"]')){
    root.innerHTML=`<div class="ob-gallery-intro"><p>Your chosen direction, with the original comparisons close by. Landing and Features stay as approved.</p><a href="ONBOARDING.md">Flow & source notes ↗</a></div><today-segmented-control class="ob-view-mode" label="Onboarding preview mode" value="selected"><option value="selected">Selected flow</option><option value="compare">Compare A / B</option></today-segmented-control><div class="ob-page-tabs" role="group" aria-label="Choose onboarding screen">${screens.map(([id,label])=>`<button data-screen="${id}" type="button">${label}</button>`).join('')}</div><div class="ob-gallery-tools"><span class="ob-current-note"></span><button type="button" class="ob-reset">Reset examples</button></div><div class="ob-comparisons"></div><a class="ob-home-more" href="home.html" hidden>Explore Home with multiple habits ↗</a><div class="ob-gallery-bottom"><button type="button" class="ob-example-button">Use reading example</button><p class="ob-gallery-status" role="status">Preview only. No plan is saved.</p></div>`;
    const drafts={a:TodayOnboarding.makeDraft(),b:TodayOnboarding.makeDraft()};let chosenDraft=TodayOnboarding.makeDraft(),current='describe',mode='selected';
    const show=(screen,focus=false)=>{
      current=screen;root.querySelectorAll('[data-screen]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.screen===screen)));
      const shared=['welcome','features'].includes(screen),grid=root.querySelector('.ob-comparisons'),single=shared||mode==='selected';grid.classList.toggle('ob-shared',single);
      const variants=shared?['a']:single?[selected[screen]]:['a','b'];
      // Retain each phone (and its wash) when the displayed page changes.
      if(grid.children.length!==variants.length)grid.innerHTML=variants.map(()=>'<article class="ob-comparison"><div class="ob-comparison-label"></div><today-onboarding-screen></today-onboarding-screen></article>').join('');
      [...grid.children].forEach((article,i)=>{
        const variant=variants[i];
        article.querySelector('.ob-comparison-label').innerHTML=`<span>${shared?'—':variant.toUpperCase()}</span><h3>${shared?'Approved · Unchanged':single?notes[screen].replace(/^B · /,''):variant==='a'?'Open canvas':'Grouped surfaces'}</h3>${!single&&variant===selected[screen]?'<small>Selected</small>':''}`;
        article.querySelector('today-onboarding-screen').configure(screen,variant,mode==='selected'?chosenDraft:drafts[variant]);
      });
      root.querySelector('.ob-home-more').hidden=screen!=='home';
      root.querySelector('.ob-current-note').textContent=shared?'Shared baseline':mode==='selected'?`${screens.findIndex(([id])=>id===screen)-1} / 9 · Selected direction`:`${screens.findIndex(([id])=>id===screen)-1} / 9 · Compare both layouts`;
      root.querySelector('.ob-example-button').hidden=screen!=='describe';
      root.querySelector('.ob-gallery-status').textContent=screen==='describe'?'Readiness is a sample rule; this preview uses the reading plan fixture.':screen==='home'?'Home and Habits animate locally. The + is kept independent.':'Preview only. No plan is saved.';
      if(focus){const v=single?variants[0]:focus;grid.querySelector(`today-onboarding-screen[variant="${v}"] h3[tabindex],today-onboarding-screen[variant="${v}"] textarea,today-onboarding-screen[variant="${v}"] button`)?.focus({preventScroll:true});}
    };
    root.querySelector('.ob-view-mode').addEventListener('change',e=>{mode=e.detail.value;show(current);});
    root.querySelectorAll('[data-screen]').forEach(b=>b.addEventListener('click',()=>show(b.dataset.screen)));
    root.querySelector('.ob-reset').addEventListener('click',()=>{drafts.a=TodayOnboarding.makeDraft();drafts.b=TodayOnboarding.makeDraft();chosenDraft=TodayOnboarding.makeDraft();show(current);});
    root.querySelector('.ob-example-button').addEventListener('click',()=>{for(const d of [chosenDraft,...Object.values(drafts)])d.description='I want to read before bed.';show('describe');});
    root.addEventListener('draftchange',e=>{if(mode==='selected')chosenDraft=e.detail;else drafts[e.target.getAttribute('variant')]=e.detail;});
    root.addEventListener('navigate',e=>{const variant=e.target.getAttribute('variant');if(mode==='selected')chosenDraft=e.detail.draft;else drafts[variant]=e.detail.draft;show(e.detail.screen,variant);});
    root.addEventListener('preview-action',e=>{root.querySelector('.ob-gallery-status').textContent=e.detail.message;});
    show(current);
  }
})();
