/* Today onboarding compositions. Local draft only; the host owns parsing, saves and routing.
 * Approved content: Figma 322:484. Landing + features are shared baselines.
 */
(() => {
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const reduced=()=>document.documentElement.hasAttribute('data-reduced')||(!document.documentElement.hasAttribute('data-motion-override')&&matchMedia('(prefers-reduced-motion: reduce)').matches);
  const days=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const pages=['welcome','features','describe','privacy','intro','track','target','rhythm','trial','start-date','reminders','review','saved','home'];
  const makeDraft=()=>({description:'',method:'pages',amount:10,days:[0,2,4],start:0,trialDays:21,reminderEnabled:false,reminderTime:'21:30',empty:false});
  const button=(label,action,variant='primary',extra='')=>`<today-button label="${esc(label)}" variant="${variant}" data-action="${action}" ${extra}></today-button>`;
  const art=(name,cls='')=>`<today-artwork class="${cls}" name="${name}"></today-artwork>`;
  const unit=d=>d.method==='check'?'Check it off':d.method;
  const date=offset=>new Date(Date.UTC(2026,10,15+offset));
  const format=offset=>new Intl.DateTimeFormat('en-US',{weekday:'short',month:'short',day:'numeric',timeZone:'UTC'}).format(date(offset));
  class TodayOnboardingScreen extends HTMLElement {
    static observedAttributes=['screen','variant'];
    connectedCallback(){
      if(this._connected)return;this._connected=true;this.draft=this.draft||makeDraft();
      this._abort=new AbortController();const signal=this._abort.signal;
      this.addEventListener('today-activate',e=>this.activate(e),{signal});
      this.addEventListener('change',e=>this.change(e),{signal});
      this.addEventListener('input',e=>{if(e.target.matches('textarea')){this.draft.description=e.target.value;this.assess();this.emitDraft();}},{signal});
      this.addEventListener('click',e=>{if(e.target.closest('today-plan-button')&&!e.target.closest('button')?.disabled){this.draft.empty=false;this.navigate('privacy');}},{signal});
      this.addEventListener('tabchange',e=>{this.notify(`Navigation preview: ${e.detail.active}.`);},{signal});
      this.addEventListener('add',()=>this.notify('The + remains an independent control; no editor is connected.'),{signal});
      this._media=matchMedia('(prefers-reduced-motion: reduce)');
      this._media.addEventListener('change',()=>this.syncFeatureMotion(),{signal});
      document.addEventListener('visibilitychange',()=>this.syncFeatureMotion(),{signal});
      this._motionObserver=new MutationObserver(()=>this.syncFeatureMotion());this._motionObserver.observe(document.documentElement,{attributes:true,attributeFilter:['data-reduced','data-motion-override']});
      this._intersection=new IntersectionObserver(entries=>{this._visible=entries[0].isIntersecting;this.syncFeatureMotion();});this._intersection.observe(this);
      this.render();
    }
    disconnectedCallback(){this._connected=false;this._abort?.abort();this._motionObserver?.disconnect();this._intersection?.disconnect();this.stopFeatureMotion();this._entrance?.cancel();this._countMotion?.cancel();}
    attributeChangedCallback(){if(this._connected&&!this._configuring)this.render();}
    configure(screen,variant,model){this._configuring=true;this.setAttribute('screen',screen);this.setAttribute('variant',variant);this.draft={...makeDraft(),...model,days:[...model.days]};this._configuring=false;if(this._connected)this.render();}
    get screen(){return pages.includes(this.getAttribute('screen'))?this.getAttribute('screen'):'describe';}
    set screen(value){this.setAttribute('screen',value);}
    set model(value){this.draft={...makeDraft(),...value,days:[...(value.days||[0,2,4])]};if(this._connected)this.render();}
    get model(){return {...this.draft,days:[...this.draft.days]};}
    emitDraft(){this.dispatchEvent(new CustomEvent('draftchange',{bubbles:true,detail:this.model}));}
    navigate(screen){this.dispatchEvent(new CustomEvent('navigate',{bubbles:true,detail:{screen,draft:this.model}}));}
    notify(message){this.dispatchEvent(new CustomEvent('preview-action',{bubbles:true,detail:{message}}));}
    header(step){return `<div class="ob-setup-head"><div class="ob-habit-heading">${button('', 'back','icon','icon="chevron" rotation="180" accessible-label="Back"')}<span>Read before bed</span>${art('open-book')}</div><today-step-progress variant="pill" current="${step}" total="7" label="Read before bed"></today-step-progress></div>`;}
    title(title,subtitle){return `<div class="ob-title"><h3 tabindex="-1">${title}</h3>${subtitle?`<p>${subtitle}</p>`:''}</div>`;}
    footer(label='Continue',action='continue',review=false){return `<div class="ob-footer">${button(label,action)}${review?'':''}</div>`;}
    weekGrid(numbers=false){return `<div class="ob-week-grid" aria-label="Two-week reading schedule">${days.map(d=>`<span class="ob-day-label">${d.slice(0,2)}</span>`).join('')}${Array.from({length:14},(_,i)=>`<span class="ob-calendar-day ${this.draft.days.includes(i%7)?'is-planned':''}" aria-label="${format(i)}${this.draft.days.includes(i%7)?', planned reading night':', day off'}">${numbers?i+15:`<today-icon name="${this.draft.days.includes(i%7)?'planned-day':'day-off'}"></today-icon>`}</span>`).join('')}</div>`;}
    metric(){return `<div class="ob-metric">${this.draft.method==='check'?'<strong>Check it off</strong>':`<strong>${this.draft.amount}<small>${unit(this.draft)}</small></strong>`}<span>per reading session</span></div>`;}
    presetValue(){const key=this.draft.days.join(',');return key==='0,1,2,3,4,5,6'?'daily':key==='1,2,3,4,5'?'weekdays':key==='0,6'?'weekends':'';}
    refreshSchedule(source='weekday'){
      const count=this.querySelector('.ob-frequency strong'),old=count.textContent;
      count.textContent=this.draft.days.length;
      this.querySelector('.ob-frequency span').textContent=this.draft.days.length===1?'time':'times';
      this.querySelectorAll('.ob-day-choices today-button').forEach((b,i)=>{
        b.style.setProperty('--today-selection-delay',source==='preset'?`${45+i*16}ms`:'0ms');
        b.toggleAttribute('selected',this.draft.days.includes(Number(b.getAttribute('value'))));
      });
      // Keep calendar marks mounted so their fill can interpolate and reverse.
      this.querySelectorAll('.ob-calendar-day').forEach((cell,i)=>{
        const planned=this.draft.days.includes(i%7);
        cell.style.setProperty('--ob-mark-delay',source==='preset'?`${75+(i%7)*16+Math.floor(i/7)*28}ms`:'25ms');
        cell.classList.toggle('is-planned',planned);
        cell.setAttribute('aria-label',`${format(i)}${planned?', planned reading night':', day off'}`);
      });
      this.querySelector('[data-schedule-presets]').value=this.presetValue();
      this._countMotion?.cancel();
      if(old!==String(this.draft.days.length)&&!reduced())this._countMotion=count.animate([{opacity:.55,transform:'translateY(3px)'},{opacity:1,transform:'translateY(0)'}],{duration:280,easing:'cubic-bezier(.22,.8,.24,1)'});
      this.dispatchEvent(new CustomEvent('schedule-selection',{bubbles:true,detail:{days:[...this.draft.days],preset:this.presetValue()||null,source}}));
      // Optional browser feedback; iPhone haptics belong to the native event adapter.
      if(!reduced()&&typeof navigator.vibrate==='function')navigator.vibrate(6);
    }
    firstSession(){let n=this.draft.start;while(!this.draft.days.includes(n%7)&&n<this.draft.start+7)n++;return format(n);}
    render(animate=true){
      this.stopFeatureMotion();const s=this.screen,d=this.draft;
      this.classList.add('ob-phone');this.dataset.page=s;this.setAttribute('aria-label',`${s} screen, ${this.getAttribute('variant')==='b'?'grouped layout':'open layout'}`);
      let content='';
      if(s==='welcome')content='<today-welcome-intro aria-label="Today. What will you do?"></today-welcome-intro>';
      if(s==='features')content=`<div class="ob-features-head"><h3>You’re making the first STEP<br>in reaching your goals</h3><p>here, we will give you the tools you need to achieve and lead the life you want</p></div><div class="ob-features-window" tabindex="0" role="group" aria-label="Today features. Drag or use left and right arrows to explore."><div class="ob-features-tilt" aria-hidden="true"><div class="ob-feature-belt">${Array.from({length:3},()=>[['plan','Personalized plans','schedule','Flexible schedules'],['log','Quick logging','history','Progress history'],['custom','Custom habits','fitness','Fitness sync'],['tracking','Track your way','review','Plan reviews']].map(col=>`<div class="ob-feature-column">${[0,2].map(i=>`<div class="ob-feature-tile">${art('feature-'+col[i])}<span>${col[i+1]}</span></div>`).join('')}</div>`).join('')).join('')}</div></div></div><p class="ob-sr">Personalized plans, Quick logging, Flexible schedules, Progress history, Custom habits, Fitness sync, Track your way, Plan reviews</p>${this.footer()}`;
      if(s==='describe')content=`<div class="ob-entry-head"><span>New habit</span></div><div class="ob-description"><label for="ob-description-${this.getAttribute('variant')||'a'}" class="ob-sr">Describe your habit</label><textarea id="ob-description-${this.getAttribute('variant')||'a'}" aria-label="Describe your habit" placeholder="What a habit you’ve been wanting to achieve?" spellcheck="true">${esc(d.description)}</textarea></div><div class="ob-entry-footer">${button('','close','icon','icon="close" accessible-label="Close"')}<today-plan-button></today-plan-button></div>`;
      if(s==='privacy')content=`<div class="ob-privacy-art">${art('privacy-lock')}</div><div class="ob-story"><span class="ob-eyebrow">before we continue</span>${this.title('Your data is <u>yours.</u>')}<div class="ob-prose"><p>Your habits are personal. You choose what to track, what to share, and which apps to connect. We will never sell data.</p><p>Our subscription model keeps us thriving and building without compromise, creating a today better for you.</p></div></div>${this.footer()}`;
      if(s==='intro')content=`${this.title('We do things a little differently.','We break your goal into a manageable plan. Choose how long to try it.')}<p class="ob-example-intro">For example: if your goal was to read before bed</p><div class="ob-example"><span class="ob-eyebrow">READ BEFORE BED</span><h4>10 pages, 3 nights a week</h4><div class="ob-trial-weeks">${[1,2].map(w=>`<div><span>Week ${w}</span>${days.map((_,i)=>`<today-icon name="${[0,2,4].includes(i)?'planned-day':'day-off'}"></today-icon>`).join('')}</div>`).join('')}</div><p class="ob-legend"><today-icon name="planned-day"></today-icon>Planned reading night</p></div><p class="ob-after-trial">At the end of your trial, see what you managed and decide what to keep or adjust.</p>${this.footer()}`;
      if(s==='track')content=`${this.header(1)}${this.title('Choose a way to track','You can change how you track anytime.')}<div class="ob-book">${art('open-book')}</div><div class="ob-methods" role="group" aria-label="Tracking method">${[['pages','Pages'],['minutes','Minutes'],['check','Check it off']].map(([value,label])=>`<div class="ob-method">${button(label,'method','choice',`value="${value}" ${d.method===value?'selected':''}`)}${value==='pages'?'<span>Recommended</span>':''}</div>`).join('')}</div>${this.footer('Continue','continue',true)}`;
      if(s==='target')content=`${this.header(2)}${this.title('What’s your target?','Choose a target that feels doable.')}<div class="ob-target-panel"><div class="ob-book">${art('open-book')}</div>${d.method==='pages'?`<today-page-counter amount="${d.amount}" maximum="100" mark-count="20" hide-caption></today-page-counter>`:`<today-stepper value="${d.amount}" min="1" max="120" unit="minutes" label="target minutes"></today-stepper>`}</div>${this.footer('Continue','continue',true)}`;
      if(s==='rhythm')content=`${this.header(3)}${this.title('Make room for it','Pick the days that work for you.')}<div class="ob-frequency"><strong>${d.days.length}</strong><span>${d.days.length===1?'time':'times'}</span></div><div class="ob-day-choices" role="group" aria-label="Reading days">${days.map((label,i)=>button(label.slice(0,2),'weekday','day',`value="${i}" accessible-label="${label}" ${d.days.includes(i)?'selected':''}`)).join('')}</div><today-segmented-control class="ob-presets" label="Schedule presets" data-schedule-presets value="${this.presetValue()}"><option value="daily">Every day</option><option value="weekdays">Weekdays</option><option value="weekends">Weekends</option></today-segmented-control><div class="ob-schedule-panel"><span class="ob-eyebrow">YOUR FIRST TWO WEEKS</span>${this.weekGrid(true)}</div><p class="ob-schedule-note">You can change your schedule anytime.</p>${this.footer('Continue','continue',true)}`;
      if(s==='trial')content=`${this.header(4)}${this.title('How long will you try?','Choose when to pause and reflect.')}<today-trial-picker variant="ruler" value="${d.trialDays}" min="1" max="90" haptics></today-trial-picker>${this.footer()}`;
      if(s==='start-date')content=`${this.header(5)}${this.title('When will you begin?','Your schedule starts from this day.')}<div class="ob-start-options" role="group" aria-label="Plan start">${['Today','Tomorrow'].map((label,i)=>button(label,'start','choice',`value="${i}" ${d.start===i?'selected':''}`)).join('')}</div><div class="ob-plan-summary"><dl class="ob-dates"><div><dt>First session</dt><dd>${this.firstSession()}</dd></div><div><dt>Trial length</dt><dd>${d.trialDays} days</dd></div><div><dt>Check-in</dt><dd>${format(d.start+d.trialDays)}</dd></div></dl></div>${this.footer()}`;
      if(s==='reminders')content=`${this.header(6)}${this.title('A nudge, when it suits you.','Only on your scheduled days.')}<div class="ob-reminder-toggle"><span>Remind me</span><today-switch label="Remind me" ${d.reminderEnabled?'checked':''}></today-switch></div><div class="ob-reminder-panel"><div><today-time-picker variant="wheel" value="${d.reminderTime}"></today-time-picker></div></div><p class="ob-reminder-note">${d.reminderEnabled?'Allow notifications when you continue in the app.':'No reminder for this habit.'}</p>${this.footer()}`;
      if(s==='review')content=`${this.header(7)}${this.title('Your goal plan',`Try it for ${d.trialDays} days. Then check in.`)}<div class="ob-plan-summary">${this.metric()}${this.weekGrid()}</div><dl class="ob-dates"><div><dt>First session</dt><dd>${this.firstSession()}</dd></div><div><dt>Check-in</dt><dd>${format(d.start+d.trialDays)}</dd></div><div><dt>Reminder</dt><dd>${d.reminderEnabled?`${Number(d.reminderTime.slice(0,2))%12||12}:${d.reminderTime.slice(3)} ${Number(d.reminderTime.slice(0,2))<12?"AM":"PM"}`:"Off"}</dd></div></dl>${button("Edit trial length","trial","quiet")}${button("Edit reminder","reminders","quiet")}${button('Change how you track','track','quiet')}${this.footer('Start plan','save')}`;
      if(s==='saved')content=`<div class="ob-saved-habit">Read before bed</div>${this.title('Let’s get to it!','Make the habit yours.')}<div class="ob-saved-art">${art('first-habit-steps')}</div><div class="ob-saved-summary">${this.metric()}${this.weekGrid()}<dl class="ob-dates"><div><dt>First session</dt><dd>${this.firstSession()}</dd></div></dl></div>${this.footer('Go to Home','home')}`;
      if(s==='home')content=`<div class="ob-home-head"><div><strong>today.</strong><span>what will you do?</span></div><span class="ob-avatar" aria-label="Profile AT">AT</span></div><div class="ob-home-week">${days.map((label,i)=>`<div ${i===0?'aria-current="date"':''}><span>${label}</span><b>${15+i}</b></div>`).join('')}</div>${d.empty?`<div class="ob-empty">${art('first-habit-steps')}<h3>Start with one habit</h3><p>Use the “+” icon to make your first habit</p></div>`:`<h3 class="ob-session-heading">Your first session</h3><div class="ob-session"><div class="ob-session-art">${art('open-book')}</div><div class="ob-session-copy"><h4>Read before bed</h4><p>${d.method==='check'?'Check it off':`${d.amount} ${unit(d)} per reading session`}</p><span>${this.firstSession()}</span></div>${button('Log','log','secondary')}</div>`}<div class="ob-home-nav"><today-bottom-nav variant="cradle" active="home"></today-bottom-nav></div>`;
      // Preserve one wash across screen changes, outside the content entrance.
      if(!this._wash){this._wash=document.createElement('today-onboarding-gradient');this._content=document.createElement('div');this._content.className='ob-screen-content';this.replaceChildren(this._wash,this._content);}
      this._wash.position=['privacy','intro','features'].includes(s)?'bottom':'top';
      this._wash.hidden=['welcome','features'].includes(s);
      this._content.innerHTML=content;
      if(s==='describe')this.assess(true);
      if(s==='features')this.bindFeatures();
      if(s==='reminders'){
        const toggle=this.querySelector('today-switch'),picker=this.querySelector('today-time-picker'),next=this.querySelector('[data-action="continue"]');
        const disclosure=new TodayUI.Disclosure(this.querySelector('.ob-reminder-panel'),{trigger:toggle.querySelector('button'),open:d.reminderEnabled});
        const sync=()=>next.toggleAttribute('disabled',toggle.checked&&picker.editing);
        picker.toggleAttribute('disabled',!d.reminderEnabled);
        picker.addEventListener('picker-open',sync);picker.addEventListener('picker-cancel',sync);picker.addEventListener('change',sync);
        toggle.addEventListener('change',()=>{d.reminderEnabled=toggle.checked;picker.toggleAttribute('disabled',!toggle.checked);disclosure.setOpen(toggle.checked);if(toggle.checked)picker.open();sync();this.querySelector('.ob-reminder-note').textContent=toggle.checked?'Allow notifications when you continue in the app.':'No reminder for this habit.';this.emitDraft();});
      }
      this._entrance?.cancel();if(animate&&!reduced())this._entrance=this.querySelector('.ob-screen-content').animate([{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}],{duration:600,easing:'cubic-bezier(.22,.8,.24,1)'});
    }
    assess(immediate=false){const b=this.querySelector('today-plan-button');if(b)b.setState(TodayUI.PlanReadiness.assess(this.draft.description),{immediate});}
    refreshKeepingFocus(value){this.render(false);const selector=`today-button[data-action="${value.action}"]${value.value!=null?`[value="${value.value}"]`:''}`;this.querySelector(selector+' button')?.focus({preventScroll:true});}
    change(e){
      if(e.target.matches('today-trial-picker')){this.draft.trialDays=e.detail.days;this.emitDraft();}
      if(e.target.matches('today-time-picker')){this.draft.reminderTime=e.detail.value;this.emitDraft();}
      if(e.target.matches('[data-schedule-presets]')){this.draft.days=e.detail.value==='weekdays'?[1,2,3,4,5]:e.detail.value==='weekends'?[0,6]:[0,1,2,3,4,5,6];this.refreshSchedule('preset');this.emitDraft();}
      if(e.target.matches('today-page-counter')){this.draft.amount=Math.max(1,e.detail.amount);if(e.detail.amount===0)e.target.amount=1;this.emitDraft();}
      if(e.target.matches('today-stepper')){this.draft.amount=e.detail.value;this.emitDraft();}
    }
    activate(e){
      const b=e.target.closest('today-button[data-action]');if(!b)return;const action=b.dataset.action,value=b.getAttribute('value'),s=this.screen,d=this.draft;
      if(action==='method'){d.method=value;this.querySelectorAll('.ob-method today-button').forEach(el=>el.toggleAttribute('selected',el===b));this.emitDraft();return;}
      if(action==='weekday'){const n=Number(value);if(d.days.includes(n)&&d.days.length===1){b.setAttribute('selected','');this.notify('Keep at least one reading day.');return;}d.days=d.days.includes(n)?d.days.filter(x=>x!==n):[...d.days,n].sort();this.emitDraft();this.refreshSchedule();return;}
      if(action==='start'){d.start=Number(value);this.emitDraft();this.refreshKeepingFocus({action,value});return;}
      if(action==='close'){this.navigate('features');return;}
      if(action==='save'){d.empty=false;this.emitDraft();this.navigate('saved');return;}
      if(action==='log'){this.notify('Log opens the habit logger in the app. No log has been saved in this layout preview.');return;}
      if(['track','review','home','trial','reminders'].includes(action)){this.navigate(action);return;}
      if(action==='back'){this.navigate(s==='track'?'intro':s==='target'?'track':s==='rhythm'?(d.method==='check'?'track':'target'):pages[pages.indexOf(s)-1]);return;}
      if(action==='continue'){if(s==='trial')this.querySelector('today-day-ruler today-picker-wheel')?.commit();if(s==='reminders'&&d.reminderEnabled&&this.querySelector('today-time-picker').editing)return;const next=pages[pages.indexOf(s)+1];this.navigate(s==='track'&&d.method==='check'?'rhythm':next);}
    }
    bindFeatures(){
      const el=this.querySelector('.ob-features-window');this._phase=0;this._featurePause=0;
      const draw=()=>this.querySelector('.ob-feature-belt')?.style.setProperty('transform',`translateX(${this._phase-696}px)`);draw();
      el.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight',' '].includes(e.key))return;e.preventDefault();this._featurePause=Infinity;this.stopFeatureMotion();if(e.key!==' ')this._phase=(this._phase+(e.key==='ArrowLeft'?174:-174))%696;draw();});
      el.addEventListener('pointerdown',e=>{this._drag={x:e.clientX,phase:this._phase};el.setPointerCapture(e.pointerId);this.stopFeatureMotion();});
      el.addEventListener('pointermove',e=>{if(!this._drag)return;this._phase=(this._drag.phase+(e.clientX-this._drag.x)/Math.cos(17.7*Math.PI/180))%696;draw();});
      const end=()=>{this._drag=null;this._featurePause=performance.now()+3000;this.syncFeatureMotion();};
      el.addEventListener('pointerup',end);el.addEventListener('pointercancel',end);this.syncFeatureMotion();
    }
    stopFeatureMotion(){cancelAnimationFrame(this._featureFrame);this._featureFrame=null;this._lastFrame=null;}
    syncFeatureMotion(){
      this.stopFeatureMotion();if(this.screen!=='features'||!this._visible||this._drag||document.hidden||reduced()||this._featurePause===Infinity)return;
      const tick=now=>{if(this._lastFrame&&now>=this._featurePause)this._phase=(this._phase-28*Math.min(50,now-this._lastFrame)/1000)%696;this._lastFrame=now;this.querySelector('.ob-feature-belt')?.style.setProperty('transform',`translateX(${this._phase-696}px)`);this._featureFrame=requestAnimationFrame(tick);};this._featureFrame=requestAnimationFrame(tick);
    }
  }
  window.TodayOnboarding={pages,makeDraft};customElements.define('today-onboarding-screen',TodayOnboardingScreen);
})();
