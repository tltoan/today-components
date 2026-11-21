/* Layout proposals. Shared PRD fixtures; no lifecycle writes or quick logging. */
(() => {
  const days=['Su','Mo','Tu','We','Th','Fr','Sa'];
  const habits=[
    {id:'reading',name:'Read before bed',art:'open-book',state:'ended',plan:'10 pages',schedule:'Sun, Tue, Thu',days:[0,2,4],detail:'Ready to reflect'},
    {id:'water',name:'Drink water',art:'water-droplet',state:'trial',plan:'2,000 mL',schedule:'Every day',days:[0,1,2,3,4,5,6],detail:'Trial · 8 days left'},
    {id:'stretch',name:'Evening stretch',art:'stretch-mat',state:'routine',plan:'Check it off',schedule:'Mon, Wed, Fri',days:[1,3,5],detail:'Routine'},
    {id:'vitamins',name:'Take vitamins',art:'vitamins',state:'routine',plan:'Check it off',schedule:'Every day',days:[0,1,2,3,4,5,6],detail:'Routine'},
    {id:'walk',name:'Take a walk',art:'walking',state:'paused',plan:'20 minutes',schedule:'Tue, Thu',days:[2,4],detail:'Paused'},
    {id:'meditation',name:'Meditate',art:'meditation',state:'archived',plan:'5 minutes',schedule:'Mon, Wed, Fri',days:[1,3,5],detail:'Archived'}
  ];
  const art=h=>h.id==='water'?'<span class="hl-water" aria-hidden="true"></span>':`<today-artwork name="${h.art}"></today-artwork>`;
  const week=h=>`<span class="hl-week" aria-hidden="true">${days.map((d,i)=>`<span class="${h.days.includes(i)?'planned':''}">${d}<i></i></span>`).join('')}</span>`;
  const row=(h,layout)=>`<button class="hl-habit" data-habit-open="${h.id}" type="button" aria-label="${h.name}, ${h.plan}, ${h.schedule}, ${h.detail}"><span class="hl-art">${art(h)}</span><span class="hl-habit-copy"><strong>${h.name}</strong><span class="hl-plan">${h.plan}${layout==='c'?'':' · '+h.schedule}</span><span class="hl-state">${h.detail}</span></span>${layout==='c'?week(h):'<span class="hl-row-chevron" aria-hidden="true">›</span>'}</button>`;
  class TodayHabitsLayout extends HTMLElement {
    connectedCallback(){
      if(this._connected)return;this._connected=true;this._abort=new AbortController();this.filter='active';this.featured='water';this.opened=null;
      this.dataset.layout=this.getAttribute('variant')||'c';
      this.innerHTML=`<div class="hl-screen"><div class="hl-safe-top" aria-hidden="true"><span>9:41</span><svg class="hl-system-icons" width="25" height="12" viewBox="0 0 25 12"><rect x="1" y="1" width="20" height="10" rx="3" fill="none" stroke="currentColor"/><rect x="3" y="3" width="15" height="6" rx="1" fill="currentColor"/><path d="M23 4v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></div><div class="hl-main"></div><div class="hl-nav"><today-bottom-nav variant="cradle" active="habits"></today-bottom-nav></div><div class="hl-home-indicator" aria-hidden="true"></div></div>`;
      this.render();
      this.addEventListener('click',e=>{const b=e.target.closest('[data-habit-open]');if(b){this._triggerId=b.dataset.habitOpen;this.opened=habits.find(h=>h.id===b.dataset.habitOpen);this.render();this.querySelector('[data-back]')?.focus();return;}const f=e.target.closest('[data-feature]');if(f){this.featured=f.dataset.feature;this.render();this.querySelector(`[data-feature="${this.featured}"]`)?.focus({preventScroll:true});}if(e.target.closest('[data-archive]')){this.filter='archived';this.render();this.querySelector('[data-back]')?.focus();}if(e.target.closest('[data-back]')){const wasDetail=!!this.opened;this.opened=null;if(!wasDetail)this.filter='active';this.render();this.querySelector(wasDetail?`[data-habit-open="${this._triggerId}"]`:'[data-archive]')?.focus({preventScroll:true});}},{signal:this._abort.signal});
      this.addEventListener('focusin',e=>{const scroller=e.target.closest('.hl-scroll');if(!scroller)return;const rect=e.target.getBoundingClientRect(),limit=this.querySelector('.hl-nav').getBoundingClientRect().top-12;if(rect.bottom>limit)scroller.scrollTop+=rect.bottom-limit;},{signal:this._abort.signal});
      this.addEventListener('change',e=>{if(e.target.matches('today-segmented-control')){this.filter=e.detail.value;this.renderList();}},{signal:this._abort.signal});
      this.addEventListener('add',()=>this.announce('The + remains independent in this preview.'),{signal:this._abort.signal});
      this.addEventListener('tabchange',()=>this.announce('Navigation preview.'),{signal:this._abort.signal});
    }
    disconnectedCallback(){this._connected=false;this._abort?.abort();}
    announce(text){this.querySelector('.hl-status').textContent=text;}
    render(){const main=this.querySelector('.hl-main');
      if(this.opened){const h=this.opened;main.innerHTML=`<header class="hl-detail-header"><button data-back type="button">‹ Habits</button><span>${h.detail}</span></header><div class="hl-scroll hl-detail"><div class="hl-detail-art">${art(h)}</div><h3>${h.name}</h3><p>${h.plan} · ${h.schedule}</p><div class="hl-history-summary"><span>History</span><h4>${h.state==='ended'?'21-day trial ended':h.state==='archived'?'Archived habit':h.state==='paused'?'Tracking paused':'Your current plan'}</h4><p>${h.state==='ended'?'Nov 1–21 · 7/9 sessions logged':h.state==='archived'?'Previous logs and plans are kept.':h.state==='paused'?'No sessions or reminders while paused.':'Past logs keep the plan used at the time.'}</p>${h.state==='ended'?'<a href="recap.html">Open trial recap ↗</a>':''}</div><p class="hl-status" role="status">Habit detail entry preview.</p></div>`;return;}
      const archive=this.filter==='archived';main.innerHTML=`<header class="hl-header">${archive?'<button data-back class="hl-back" type="button">‹ Habits</button>':'<div><h3>Habits</h3><p>3 active plans</p></div><a class="ho-profile-link" href="profile.html" aria-label="Open your profile"><today-profile-avatar size="40" person="{&quot;id&quot;:&quot;antony&quot;,&quot;self&quot;:true,&quot;name&quot;:&quot;Antony&quot;}"></today-profile-avatar></a>'}</header>${archive?'<h3 class="hl-archive-title">Archived</h3>':'<today-segmented-control label="Habit collection" value="'+this.filter+'"><option value="active">Active</option><option value="ended">Review · 1</option><option value="paused">Paused</option></today-segmented-control>'}<div class="hl-scroll"><div class="hl-content"></div><button type="button" class="hl-archive" data-archive>Archived habits <span>1 ›</span></button><p class="hl-status" role="status"></p></div>`;this.renderList();
    }
    renderList(){const grid=this.querySelector('.hl-content'),layout=this.dataset.layout;
      const filtered=habits.filter(h=>this.filter==='active'?['trial','routine'].includes(h.state):h.state===this.filter);
      const notice=this.filter==='active'?'<a class="hl-invitation" href="habit-parties.html#party-invite-b"><span><strong>Invitations · 1</strong><small>Reading party from Maya & Sam</small></span><span aria-hidden="true">›</span></a><button type="button" class="hl-review-banner" data-habit-open="reading"><span class="hl-review-dot"></span><span><strong>Read before bed</strong><small>Trial ended · review your plan</small></span><span aria-hidden="true">›</span></button>':'';
      if(layout==='b'&&this.filter==='active'){
        const h=habits.find(x=>x.id===this.featured);grid.innerHTML=`${notice}<div class="hl-feature-tabs" aria-label="Featured habit">${filtered.map(x=>`<button type="button" data-feature="${x.id}" aria-pressed="${x.id===this.featured}">${x.name==='Drink water'?'Water':x.name==='Evening stretch'?'Stretch':'Vitamins'}</button>`).join('')}</div><button type="button" class="hl-cover" data-habit-open="${h.id}"><span class="hl-cover-art">${art(h)}</span><span class="hl-state">${h.detail}</span><strong>${h.name}</strong><span>${h.plan} · ${h.schedule}</span><span class="hl-cover-link">View habit <i aria-hidden="true">↗</i></span></button><div class="hl-other-heading">Other active plans</div>${filtered.filter(x=>x.id!==h.id).map(x=>row(x,'b')).join('')}`;
      }else grid.innerHTML=`${notice}${this.filter==='active'?`<div class="hl-list-heading">${layout==='c'?'Your weekly schedule':'Your plans'}<span>${filtered.length}</span></div>`:''}<div class="hl-list">${filtered.map(h=>row(h,layout)).join('')}</div>`;
      this.querySelector('[data-archive]').hidden=this.filter==='archived';
    }
  }
  customElements.define('today-habits-layout',TodayHabitsLayout);
})();
