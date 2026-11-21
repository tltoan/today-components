/* Three layout proposals using the same PRD lifecycle fixtures. No lifecycle writes. */
(() => {
  const habits=[
    {id:'reading',name:'Read before bed',art:'open-book',state:'ended',plan:'10 pages · Sun, Tue, Thu',detail:'Trial ended · reflection needed'},
    {id:'water',name:'Drink water',art:'water-droplet',state:'trial',plan:'2,000 mL · every day',detail:'Trial · 8 days left'},
    {id:'stretch',name:'Evening stretch',art:'stretch-mat',state:'routine',plan:'Check it off · Mon, Wed, Fri',detail:'Routine'},
    {id:'vitamins',name:'Take vitamins',art:'vitamins',state:'routine',plan:'Check it off · every day',detail:'Routine'},
    {id:'walk',name:'Take a walk',art:'walking',state:'paused',plan:'20 min · Tue, Thu',detail:'Paused · no reminders'},
    {id:'meditation',name:'Meditate',art:'meditation',state:'archived',plan:'5 min · history kept',detail:'Archived'}
  ];
  const tile=h=>`<button class="hl-habit" data-habit-open="${h.id}" type="button"><span class="hl-art"><today-artwork name="${h.art}"></today-artwork></span><span class="hl-habit-copy"><span class="hl-state">${h.detail}</span><strong>${h.name}</strong><span class="hl-plan">${h.plan}</span></span><span class="hl-row-chevron" aria-hidden="true">›</span></button>`;
  class TodayHabitsLayout extends HTMLElement {
    connectedCallback(){
      if(this._connected)return;this._connected=true;this._abort=new AbortController();
      const layout=this.getAttribute('variant')||'a';this.dataset.layout=layout;
      this.innerHTML=`<div class="hl-screen"><header class="hl-header"><div><span>today.</span><h3>Habits</h3></div><span class="ho-avatar" aria-label="Profile AT">AT</span></header><div class="hl-scroll"><p class="hl-intro">A place for every chapter.</p>${layout==='b'?'<today-segmented-control label="Habit collection" value="active"><option value="active">Active · 3</option><option value="ended">Review · 1</option><option value="paused">Paused · 1</option></today-segmented-control>':''}<div class="hl-content"></div><button type="button" class="hl-archive" data-archive>Archived habits <span>1 ↗</span></button><div class="hl-history-panel"><div><div class="hl-history" tabindex="-1"></div></div></div><p class="hl-status" role="status"></p></div><div class="hl-nav"><today-bottom-nav variant="cradle" active="habits"></today-bottom-nav></div></div>`;
      this.filter='active';this.render();
      this.disclosure=new TodayUI.Disclosure(this.querySelector('.hl-history-panel'));
      this.addEventListener('click',e=>{const b=e.target.closest('[data-habit-open]');if(b){this.openHistory(habits.find(h=>h.id===b.dataset.habitOpen),b);return;}if(e.target.closest('[data-archive]'))this.openHistory(habits[5],e.target.closest('[data-archive]'));if(e.target.closest('[data-close-history]')){this.disclosure.setOpen(false);this._trigger?.focus();}},{signal:this._abort.signal});
      this.addEventListener('change',e=>{if(e.target.matches('today-segmented-control')){this.filter=e.detail.value;this.render();}},{signal:this._abort.signal});
      this.addEventListener('add',()=>{this.querySelector('.hl-status').textContent='The + is independent in this layout study.';},{signal:this._abort.signal});
      this.addEventListener('tabchange',e=>{this.querySelector('.hl-status').textContent=e.detail.active==='home'?'Home navigation preview. This study keeps the Habits layout visible.':'Habits selected.';},{signal:this._abort.signal});
    }
    disconnectedCallback(){this._connected=false;this._abort?.abort();}
    render(){const grid=this.querySelector('.hl-content'),layout=this.dataset.layout;
      if(layout==='b'){
        const filtered=habits.filter(h=>this.filter==='active'?['trial','routine'].includes(h.state):h.state===this.filter);
        grid.innerHTML=`${this.filter==='active'?'<p class="hl-collection-note">Your current trials and routines.</p>':`<p class="hl-collection-note">${this.filter==='ended'?'History stays. Reflect before starting a new plan.':'A temporary break. These habits aren’t due.'}</p>`}<div class="hl-tile-grid">${filtered.map(tile).join('')}</div>${this.filter==='active'?`<div class="hl-review-shortcut"><span>One trial is ready for reflection.</span>${tile(habits[0])}</div>`:''}`;
      }else grid.innerHTML=`<section class="hl-group"><div class="hl-group-title"><h4>Ready to reflect</h4><span>1</span></div>${tile(habits[0])}<p class="hl-ended-note">This trial has ended. It won’t continue automatically.</p></section><section class="hl-group"><div class="hl-group-title"><h4>${layout==='c'?'Current plans':'In your rhythm'}</h4><span>3</span></div>${habits.filter(h=>['trial','routine'].includes(h.state)).map(tile).join('')}</section><section class="hl-group"><div class="hl-group-title"><h4>Paused</h4><span>1</span></div>${tile(habits[4])}</section>`;
    }
    openHistory(h,trigger){this._trigger=trigger;this.disclosure.trigger=trigger;this.querySelector('.hl-history').innerHTML=`<span class="hl-state">${h.detail}</span><h4>${h.name}</h4><p>${h.plan}</p><p>${h.state==='ended'?'Reflection needed. Your history is available; no new sessions are scheduled.':h.state==='archived'?'Active tracking has ended. Your earlier records are kept.':h.state==='paused'?'This is a temporary break. It is excluded from reminders and habits due today.':'This opens the history-first habit detail screen. Plan changes live in Edit.'}</p>${h.state==='ended'?'<a href="recap.html">Compare recap drafts ↗</a>':''}<button data-close-history type="button">Back to Habits</button>`;this.disclosure.setOpen(true);this.querySelector('.hl-history').focus({preventScroll:true});this.querySelector('.hl-history-panel').scrollIntoView({block:'nearest',behavior:'instant'});}
  }
  customElements.define('today-habits-layout',TodayHabitsLayout);
})();
