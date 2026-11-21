/* Controlled habit detail compositions. Gallery persistence lives in habit-detail-study.js.
   Every change is a request: confirmed models alone update amounts and target feedback. */
(() => {
  const esc = s => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const days=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const btn=(label,action,variant='secondary',attrs='')=>`<today-button label="${esc(label)}" data-hd-action="${action}" variant="${variant}" ${attrs}></today-button>`;
  const timeLabel=t=>{const [h,m]=t.split(':').map(Number);return `${h%12||12}:${String(m).padStart(2,'0')} ${h<12?'AM':'PM'}`;};
  const fmt=day=>new Date(day+'T12:00:00Z').toLocaleDateString('en-US',{month:'short',day:'numeric',timeZone:'UTC'});
  const request=(el,action,data={})=>el.dispatchEvent(new CustomEvent('habit-detail-request',{bubbles:true,detail:{action,...data}}));
  const sum=(m,date)=>{const es=m.entries.filter(e=>e.date===date&&e.unit===m.unit);return es.length?es.reduce((n,e)=>n+e.amount,0):null;};
  class HabitEntry extends HTMLElement {
    set model(m){this._model=m;if(this.isConnected)this.render();}
    connectedCallback(){this.render();}
    render(){const e=this._model;if(!e)return;this.innerHTML=`<button type="button" class="hd-entry"><span class="hd-entry-mark" aria-hidden="true"></span><span><strong>${e.unit==='check'?(e.amount?'Logged':'None today'):`${esc(e.amount)} ${esc(e.unit)}`}</strong><small>${fmt(e.date)} · ${esc(e.time)}${e.corrected?' · Edited':''}</small></span>${e.photo?'<span class="hd-photo-thumb"><today-artwork name="open-book"></today-artwork></span>':''}<span aria-hidden="true">›</span></button>`;this.querySelector('button').onclick=()=>request(this,'entry',{entryID:e.id});}
  }
  customElements.define('today-habit-entry',HabitEntry);

  class HabitPlanEditor extends HTMLElement {
    set model(m){this._model=structuredClone(m);if(this.isConnected)this.render();}
    connectedCallback(){this.render();}
    render(){const m=this._model;if(!m)return;this._days=[...m.days];
      this.innerHTML=`<div class="hd-editor-card"><div class="hd-editor-habit"><span>${esc(m.name)}</span><today-artwork name="${m.artwork}"></today-artwork></div>${m.kind==='check'?'<p>Check it off</p>':`<today-stepper value="${m.target}" min="1" max="${m.unit==='mL'?10000:240}" step="${m.unit==='mL'?250:1}" unit="${m.unit}" label="Target"></today-stepper>`}<today-habit-schedule></today-habit-schedule></div>${m.state==='trial'?`<p class="hd-explanation">New targets and days apply from the date below. Earlier entries stay as recorded. Your trial still ends ${fmt(m.end)}.</p>`:''}<label class="hd-field-label">Effective from<input type="date" value="${m.today}" min="${m.today}" ${m.state==='trial'?`max="${m.end}"`:''}></label><p class="hd-form-error" role="alert"></p>${btn('Save changes','save-plan','primary','block')}`;
      const schedule=this.querySelector('today-habit-schedule');schedule.value=m.days;schedule.addEventListener('change',()=>{this._days=schedule.value;});
      this.addEventListener('today-activate',this._handle ||= e=>{const a=e.target.dataset.hdAction;if(a==='day'){const n=Number(e.target.getAttribute('value'));this._days=this._days.includes(n)?this._days.filter(d=>d!==n):[...this._days,n].sort();}if(a==='save-plan'){const input=this.querySelector('input'),error=this.querySelector('.hd-form-error');if(!this._days.length){error.textContent='Choose at least one day.';return;}if(!input.value||!input.checkValidity()){error.textContent='Choose a date within this plan.';input.reportValidity();return;}request(this,'save-plan',{target:this.querySelector('today-stepper')?.value||1,days:this._days,effective:input.value});}});
    }
  }
  customElements.define('today-habit-plan-editor',HabitPlanEditor);

  class HabitDetail extends HTMLElement {
    set model(m){this._model=structuredClone(m);if(this._mounted)this.update();}
    get model(){return structuredClone(this._model);}
    connectedCallback(){if(this._mounted)return;this._mounted=true;this.dataset.layout=this.getAttribute('variant')||'b';
      this.innerHTML=`<today-onboarding-gradient></today-onboarding-gradient><div class="hd-safe-top" aria-hidden="true"><span>9:41</span><span>▰</span></div><nav class="hd-nav" aria-label="Habit navigation"><a href="habits-layouts.html">‹ Habits</a>${btn('','menu','icon','symbol="⋯" accessible-label="Manage habit"')}</nav><div class="hd-menu"><div><div class="hd-menu-actions"></div></div></div><div class="hd-scroll"><header class="hd-hero"></header><section class="hd-log-section"><div class="hd-section-heading"><h3>Today</h3><span class="hd-today-date"></span></div><today-habit-card></today-habit-card><div class="hd-timer" hidden></div><div class="hd-lifecycle" hidden></div></section><section class="hd-party" hidden><today-party-entry></today-party-entry></section><section class="hd-progress"><div class="hd-section-heading"><h3>Progress</h3><span class="hd-progress-total"></span></div><div class="hd-chart-wrap"><p class="hd-chart-label"></p><today-staggered-bar-chart></today-staggered-bar-chart></div><button class="hd-calendar-toggle" type="button" aria-expanded="true">Activity calendar <span aria-hidden="true">⌄</span></button><div class="hd-calendar-panel"><div><today-habit-calendar></today-habit-calendar></div></div></section><section class="hd-history"><today-habit-history variant="journal"></today-habit-history><p class="hd-change-note"></p></section><section class="hd-plan"><div class="hd-section-heading"><h3>Plan & reminders</h3></div><div class="hd-plan-rows"></div></section><p class="hd-status" role="status"></p></div><div class="hd-safe-bottom" aria-hidden="true"><i></i></div><dialog class="hd-dialog" aria-label="Habit details"><div class="hd-dialog-head"><h3></h3><button type="button" data-dialog-close aria-label="Close dialog">×</button></div><div class="hd-dialog-body"></div></dialog>`;
      this._menu=new TodayUI.Disclosure(this.querySelector('.hd-menu'),{trigger:this.querySelector('[data-hd-action=menu] button')});
      const chart=this.querySelector('.hd-chart-wrap'),panel=document.createElement('div');panel.className='hd-chart-panel';panel.append(document.createElement('div'));chart.before(panel);panel.firstElementChild.append(chart);
      const chartToggle=document.createElement('button');chartToggle.type='button';chartToggle.className='hd-chart-toggle';chartToggle.textContent='View quantity chart';panel.before(chartToggle);chartToggle.hidden=this.dataset.layout!=='b';
      this._chart=new TodayUI.Disclosure(panel,{trigger:chartToggle,open:this.dataset.layout!=='b'});chartToggle.onclick=()=>this._chart.toggle();
      this._calendar=new TodayUI.Disclosure(this.querySelector('.hd-calendar-panel'),{trigger:this.querySelector('.hd-calendar-toggle'),open:this.dataset.layout!=='c'});
      this.querySelector('.hd-calendar-toggle').onclick=()=>this._calendar.toggle();

      this.addEventListener('history-clear',()=>{this._date=null;});
      this.addEventListener('date-select',e=>{this._date=e.detail.date;this.updateHistory();this.querySelector('.hd-history').scrollIntoView({block:'nearest',behavior:'auto'});});
      this.addEventListener('keydown',e=>{if(e.key==='Escape'&&this._menu.open)this._menu.setOpen(false);});
      this.addEventListener('today-activate',e=>this.activate(e));
      this.addEventListener('logrequest',e=>{e.stopPropagation();request(this,'log');});
      this.addEventListener('habit-detail-request',e=>{if(e.target===this)return;if(e.detail.action==='entry'){e.stopPropagation();this.entry(e.detail.entryID);}else if(['save-plan','save-reminder'].includes(e.detail.action)){e.stopPropagation();this.save(e.detail.action,e.detail);}});
      this.addEventListener('party-request',e=>{e.stopPropagation();if(e.detail.action==='open')this.party();else request(this,e.detail.action,e.detail);});
      this.querySelector('[data-dialog-close]').onclick=()=>this.closeDialog();
      this.querySelector('dialog').addEventListener('close',()=>{const target=this._opener?.isConnected?this._opener:this._returnAction?this.querySelector(`[data-hd-action="${this._returnAction}"] button`):this.querySelector('today-habit-history button');target?.focus({preventScroll:true});});
      if(this._model)this.update();
    }
    disconnectedCallback(){this.querySelector('dialog')?.close();}
    update(){const m=this._model;if(!m)return;const changed=this._id!==m.id;if(changed){this._date=null;this._id=m.id;this.querySelector('.hd-scroll').scrollTop=0;}const amount=sum(m,m.today),active=['trial','routine'].includes(m.state);
      const status=m.state==='trial'?`Day ${Math.floor((new Date(m.today)-new Date(m.start))/86400000)+1} of ${m.trialDays}`:({ended:'Trial ended',routine:'Routine',paused:'Paused',archived:'Archived',deleted:'Deleted'})[m.state];
      this.querySelector('.hd-hero').innerHTML=`<div class="hd-hero-art"><today-artwork name="${m.artwork}"></today-artwork></div><div class="hd-hero-copy"><span class="hd-plan-state">${status}</span><h2>${esc(m.name)}</h2><p>${m.kind==='check'?'Check it off':`${m.target.toLocaleString()} ${m.unit}`} · ${m.days.length===7?'Every day':m.days.map(d=>days[d]).join(', ')}</p></div>`;
      this.querySelector('.hd-today-date').textContent=fmt(m.today);
      const card=this.querySelector('today-habit-card');card.hidden=!active||m.kind==='timer';
      card.model={id:m.id,name:m.name,artwork:m.artwork,kind:m.kind==='timer'?'amount':m.kind,target:m.target,unit:m.unit,increment:m.increment,amount,cue:'No log yet',date:m.today,current:true,pending:m.pending,error:m.error,feedback:'wash'};
      const timer=this.querySelector('.hd-timer');timer.hidden=m.kind!=='timer'||!active;if(!timer.hidden)this.updateTimer();
      const life=this.querySelector('.hd-lifecycle');life.hidden=active;if(!active)life.innerHTML=m.state==='ended'?`<p>Your ${m.trialDays}-day trial has ended.</p><a class="hd-primary-link" href="recap.html">Reflect on your trial <span>↗</span></a>`:m.state==='deleted'?'<p>This habit was deleted in the preview.</p>':`<p>${m.state==='paused'?'Logging and reminders are paused.':'Your history is kept.'}</p>${btn(m.state==='paused'?'Resume habit':'Restore habit','resume','primary','block')}`;
      const party=this.querySelector('.hd-party');party.hidden=!m.party||m.state==='deleted';if(m.party)this.querySelector('today-party-entry').model={...m.party,placement:'inline',title:'Your habit party',summary:m.party.summary||'View people, shared logs and party streak'};
      const current=m.entries.filter(e=>e.unit===m.unit),total=current.reduce((s,e)=>s+e.amount,0),loggedDays=new Set(current.map(e=>e.date)).size;
      this.querySelector('.hd-progress-total').textContent=`${loggedDays} days logged`;
      this.querySelector('.hd-chart-label').textContent=`${total.toLocaleString()} ${m.unit==='check'?'check-ins':m.unit} logged · this trial`;
      const chart=this.querySelector('today-staggered-bar-chart');chart.setAttribute('target',m.target);chart.setAttribute('unit',m.unit);chart.setAttribute('target-label',m.kind==='check'?'One check-in':`Current target · ${m.target.toLocaleString()} ${m.unit}`);
      const points=[10,12,13,15,16,17].map(d=>{const date='2026-11-'+d;return{id:date,dateLabel:String(d),value:sum(m,date)};});const key=JSON.stringify([m.target,m.unit,points]);if(this._chartKey!==key){this._chartKey=key;chart.points=points;}
      this.querySelector('.hd-chart-panel').hidden=m.kind==='check';this.querySelector('.hd-chart-toggle').hidden=m.kind==='check'||this.dataset.layout!=='b';
      const entries=Array.from({length:30},(_,i)=>{const day=`2026-11-${String(i+1).padStart(2,'0')}`,recorded=sum(m,day);return{day,amount:recorded,target:m.entries.find(e=>e.date===day&&e.unit===m.unit)?.targetAtLog??m.target,eligible:recorded!==null||day>=m.start&&m.days.includes(new Date(day+'T12:00:00Z').getUTCDay())};});
      const calKey=JSON.stringify([m.id,m.unit,m.target,entries]);if(this._calKey!==calKey){this._calKey=calKey;this.querySelector('today-habit-calendar').model={today:m.today,target:m.target,unit:m.unit,selected:this._date||m.today,entries};}
      this.updateHistory();
      this.querySelector('.hd-plan-rows').innerHTML=`${btn(m.state==='trial'?'Adjust this trial':'Edit plan','plan','row')}${btn(`Tracking · ${m.kind==='check'?'Check-off':m.unit}`,'method','row')}${btn(`Reminder · ${m.reminderEnabled?timeLabel(m.reminderTime):'Off'}`,'reminder','row')}${btn('Edit habit name','name','row')}`;
      this.querySelector('.hd-plan').hidden=['ended','archived','deleted'].includes(m.state);
      this.querySelector('.hd-menu-actions').innerHTML=`${btn(m.state==='paused'?'Resume habit':'Pause habit',m.state==='paused'?'resume':'pause','quiet',!active&&m.state!=='paused'?'disabled':'')}${btn('Archive habit','archive','quiet',m.state==='archived'?'disabled':'')}${btn('Delete habit','delete','quiet')}`;
      this.querySelector('.hd-status').textContent=m.error||m.message||'';
      if(m.state==='deleted')this.querySelectorAll('.hd-progress,.hd-history').forEach(n=>n.hidden=true);else this.querySelectorAll('.hd-progress,.hd-history').forEach(n=>n.hidden=false);
    }
    updateTimer(){const m=this._model,t=this.querySelector('.hd-timer'),clock=m.timer||{seconds:0,running:false};t.innerHTML=`<div class="hd-timer-readout"><strong data-timer-clock>${String(Math.floor(clock.seconds/60)).padStart(2,'0')}:${String(Math.floor(clock.seconds%60)).padStart(2,'0')}</strong><span>of ${m.target} minutes</span></div><p>${sum(m,m.today)||0} min logged today</p><div class="hd-two-actions">${btn(clock.running?'Pause':clock.seconds?'Resume timer':'Start timer',clock.running?'timer-pause':'timer-start','primary',m.pending?'disabled':'')}${btn('Stop','timer-stop','secondary',!m.pending&&(clock.seconds||clock.running)?'':'disabled')}</div><p class="hd-form-error" role="alert">${esc(m.error||'')}</p>`;}
    set timerSeconds(seconds){const out=this.querySelector('[data-timer-clock]');if(out)out.textContent=`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(Math.floor(seconds%60)).padStart(2,'0')}`;}
    updateHistory(){const history=this.querySelector('today-habit-history');history.model={...this._model,selectedDate:this._date};this.querySelector('.hd-change-note').textContent=this._model.changeNote||'';}

    openDialog(title,html){const d=this.querySelector('dialog');if(!d.open){this._opener=document.activeElement;this._returnAction=this._opener.closest('[data-hd-action]')?.dataset.hdAction;}d.querySelector('h3').textContent=title;d.querySelector('.hd-dialog-body').innerHTML=html;if(!d.open)d.showModal();d.querySelector('[data-dialog-close]').focus();}
    closeDialog(){this.querySelector('dialog').close();}
    save(action,data){const button=this.querySelector('.hd-dialog-body [data-hd-action^=save]');button?.setAttribute('busy','');request(this,action,data);}
    resolveDialog(error=''){if(!error){this.closeDialog();return;}this.querySelector('.hd-dialog-body [busy]')?.removeAttribute('busy');let p=this.querySelector('.hd-dialog-body .hd-form-error');if(!p){p=document.createElement('p');p.className='hd-form-error';p.setAttribute('role','alert');this.querySelector('.hd-dialog-body').append(p);}p.textContent=error;}
    entry(id){const e=this._model.entries.find(e=>e.id===id);if(!e)return;this._entry=id;this.openDialog('Entry details',`<p>${fmt(e.date)} · ${esc(e.time)}</p>${e.photo?'<div class="hd-entry-photo"><today-artwork name="open-book"></today-artwork><span>Sample attachment</span></div>':''}<label class="hd-field-label">Recorded ${esc(e.unit)}<input data-entry-amount type="number" inputmode="decimal" min="0" max="${e.unit==='check'?1:100000}" step="${e.unit==='min'?'0.1':1}" value="${e.amount}"></label><p class="hd-form-error" role="alert"></p>${btn('Save correction','save-entry','primary','block')}${btn('Delete entry','delete-entry','quiet','block')}`);}
    party(){const m=this._model;if(!m.party)return;this.openDialog('Your habit party','<today-party-room></today-party-room>');const room=this.querySelector('today-party-room');room.model=m.party;this.dispatchEvent(new CustomEvent('habit-detail-request',{bubbles:true,detail:{action:'party-room',room}}));}
    activate(e){const a=e.target.dataset.hdAction,m=this._model;if(!a||e.target.closest('today-habit-plan-editor,today-habit-reminder'))return;
      if(a==='menu'){this._menu.toggle();return;}
      if(['pause','resume','archive'].includes(a)){this._menu.setOpen(false);request(this,a);return;}
      if(a==='delete'){this._menu.setOpen(false);this.openDialog('Delete this habit?',`<p>Delete ${esc(m.name)} and its entries? This cannot be undone.</p>${btn('Cancel','cancel','secondary','block')}${btn('Delete habit','confirm-delete','primary','block')}`);return;}
      if(a==='confirm-delete'){request(this,'delete');this.closeDialog();return;}
      if(a==='cancel'){this.closeDialog();return;}
      if(a==='plan'){this.openDialog(m.state==='trial'?'Adjust this trial':'Edit plan','<today-habit-plan-editor></today-habit-plan-editor>');this.querySelector('today-habit-plan-editor').model=m;return;}
      if(a==='method'){this._newUnit=m.unit;this.openDialog('How do you want to track?',`<div class="hd-method-intro"><today-artwork name="${m.artwork}"></today-artwork><p>${esc(m.name)}</p></div><div class="hd-method-options" role="radiogroup" aria-label="Tracking method">${[['pages','Pages','Count the pages you read','open-book'],['min','Minutes','Time a session','open-book'],['mL','Water','Add an amount in mL','water-droplet'],['check','Check it off','One tap for each session','stretch-mat']].filter(([unit])=>unit!=='mL'||m.artwork==='water-droplet').map(([unit,title,copy,art])=>`<button type="button" role="radio" aria-checked="${unit===m.unit}" data-method-choice="${unit}"><today-artwork name="${art}"></today-artwork><span><strong>${title}</strong><small>${copy}</small></span></button>`).join('')}</div><p class="hd-explanation">Earlier entries keep their original units.</p>${btn('Continue','method-next','primary','block disabled')}`);
        const choices=[...this.querySelectorAll('[data-method-choice]')],choose=b=>{this._newUnit=b.dataset.methodChoice;choices.forEach(c=>{c.setAttribute('aria-checked',String(c===b));c.tabIndex=c===b?0:-1;});this.querySelector('[data-hd-action=method-next]').toggleAttribute('disabled',this._newUnit===m.unit);};choices.forEach((b,i)=>{b.tabIndex=b.dataset.methodChoice===m.unit?0:-1;b.onclick=()=>choose(b);b.onkeydown=e=>{if(['ArrowDown','ArrowRight','ArrowUp','ArrowLeft'].includes(e.key)){e.preventDefault();const next=choices[(i+(['ArrowDown','ArrowRight'].includes(e.key)?1:choices.length-1))%choices.length];choose(next);next.focus();}};});return;}
      if(a==='method-next'){const unit=this._newUnit;this.openDialog('Your new tracking method',`<div class="hd-method-summary"><span>From today</span><strong>${{pages:'Pages',min:'Minutes',mL:'Water',check:'Check it off'}[unit]}</strong></div>${unit==='check'?'<p>Log each session with one tap.</p>':`<label class="hd-field-label">Target per session<input data-method-target type="number" min="1" max="100000" value="${unit==='mL'?2000:10}"></label>`}<p class="hd-explanation">Schedule and trial end date stay the same. Earlier entries keep their original units.</p><p class="hd-form-error" role="alert"></p>${btn('Save tracking change','save-method','primary','block')}`);return;}
      if(a==='save-method'){const i=this.querySelector('[data-method-target]');if(i&&(!i.checkValidity()||!i.value)){i.reportValidity();return;}this.save('save-method',{unit:this._newUnit,target:i?Number(i.value):1});return;}
      if(a==='reminder'){this.openDialog('Reminder','<today-habit-reminder></today-habit-reminder>');this.querySelector('today-habit-reminder').model={enabled:m.reminderEnabled,time:m.reminderTime};return;}
      if(a==='name'){this.openDialog('Edit habit name',`<label class="hd-field-label">Habit name<input data-habit-name maxlength="100" value="${esc(m.name)}"></label><p class="hd-form-error" role="alert"></p>${btn('Save name','save-name','primary','block')}`);return;}
      if(a==='save-name'){const name=this.querySelector('[data-habit-name]').value.trim();if(!name){this.querySelector('dialog .hd-form-error').textContent='Enter a habit name.';return;}this.save(a,{name});return;}
      if(a==='save-entry'){const i=this.querySelector('[data-entry-amount]');if(!i.value||!i.checkValidity()){i.reportValidity();return;}this.save(a,{entryID:this._entry,amount:Number(i.value)});return;}
      if(a==='delete-entry'){this.openDialog('Delete this entry?',`<p>This removes the recorded amount from this habit’s history.</p>${btn('Cancel','cancel','secondary','block')}${btn('Delete entry','confirm-delete-entry','primary','block')}`);return;}
      if(a==='confirm-delete-entry'){this.save('delete-entry',{entryID:this._entry});return;}
      if(a==='timer-stop'){request(this,'timer-pause');this.openDialog('Stop timer?',`<p>Log the elapsed time or discard this session.</p>${btn('Log elapsed time','timer-log','primary','block')}${btn('Discard session','timer-discard','quiet','block')}`);return;}
      if(a.startsWith('timer-')){request(this,a);if(['timer-log','timer-discard'].includes(a))this.closeDialog();}
    }
  }
  customElements.define('today-habit-detail',HabitDetail);
})();
