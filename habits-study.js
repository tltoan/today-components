(() => {
  for(const root of document.querySelectorAll('[data-component="habits-layouts"]')){
    root.innerHTML=`<p class="hl-study-intro">Weekly view · Selected for Today.</p><p class="hl-size-note">390 × 844 reference frames · safe areas included. Previews wrap instead of squeezing into a row.</p><div class="hl-comparisons">${[['a','Plan cards','Full-width cards, larger artwork and one clear status per habit.'],['b','Habit shelf','One illustrated habit in focus, with other plans just below.'],['c','Weekly view · Selected','See each plan’s schedule directly in the list. The cradle floats over the scrolling cards.']].map(([id,title,copy])=>`<article${id==='c'?' id="weekly-view" class="hl-selected"':''}><div class="hl-direction"><span>${id.toUpperCase()}</span><h3>${title}</h3></div><today-habits-layout variant="${id}"></today-habits-layout><p>${copy}</p></article>`).join('')}</div><p class="hl-study-caption">Weekly view is selected. A and B remain for comparison · sample plans. Active, ended, paused and archived states follow the PRD. Tap a habit for a separate detail entry; Back restores the collection.</p><a class="hc-guide" href="HABITS-LAYOUTS.md">PRD mapping & layout notes ↗</a>`;
    // Local invitation host. The reusable invite never sends or joins a real party.
    for(const phone of root.querySelectorAll('today-habits-layout')){
      let invite={id:'reading-invite',state:'invited',plan:'pages',schedule:'Sun, Tue, Thu',proposedDates:'Nov 22–Dec 12',members:[{id:'maya',name:'Maya',initials:'MK',target:'15 minutes'},{id:'sam',name:'Sam',initials:'SL',target:'10 pages'}]};
      phone.invitation=invite;
      phone.addEventListener('party-request',e=>{
        if(!e.target.closest('today-party-invite'))return;
        e.stopPropagation();const d=e.detail;
        if(d.action==='plan'){invite.plan=d.value;phone.invitation=invite;}
        if(d.action==='decline'){phone.closeInvitation();}
        if(d.action==='join'&&invite.state==='invited'){
          invite.state='joining';phone.invitation=invite;
          setTimeout(()=>{invite.state='joined';invite.members.push({id:'antony',name:'You',initials:'AT',self:true});invite.message='Joined in this preview. Nothing was sent or saved.';phone.invitation=invite;},450);
        }
      });
    }
    const grid=root.querySelector('.hl-comparisons'),previous=[...grid.children].filter(a=>!a.id);
    const compare=document.createElement('button');compare.className='study-compare-toggle';compare.textContent='Compare previous Habits layouts';compare.type='button';
    const panel=document.createElement('div');panel.innerHTML='<div><div class="hl-comparisons"></div></div>';previous.forEach(a=>panel.querySelector('.hl-comparisons').append(a));grid.after(compare,panel);
    const disclosure=new TodayUI.Disclosure(panel,{trigger:compare});compare.onclick=()=>disclosure.toggle();

  }
})();
