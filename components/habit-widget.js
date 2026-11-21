/* Reusable browser proposals, not WidgetKit.
 * widget.model = {variant, habits:[{id,title,amount,target,unit,step,rule,artwork,tracker}], ...}
 * widget.save = async ({habit, action, proposed}) => confirmedAmount;
 * No save handler = read-only. Host owns persistence, dates, auth and routes.
 */
(() => {
  const W = window.TodayWidgets;
  const esc = W.escape;
  const defaults = {id:'habit',title:'My habit',amount:null,target:10,unit:'pages',step:1,rule:'atLeast',artwork:'custom',tracker:'numeric'};
  const messageStates = {
    new:['Your first habit','A little action starts here.','Create a habit'],
    configure:['Choose a habit','Pick what you want to see.','Choose habit'],
    empty:['No log yet','A fresh space for today.','Open habit'],
    scheduled:['Rest day','Next scheduled: tomorrow.','Open habit'],
    paused:['Paused','Your history is saved.','Open habit'],
    removed:['Habit unavailable','Choose another habit.','Choose habit'],
    failed:['Couldn’t save','750 mL is still recorded.','Open Today'],
    unavailable:['Open Today','Your data isn’t available.','Open Today'],
    noDue:['A little breathing room','Nothing scheduled today.','Open Today'],
    complete:['Today, recorded','Your build targets are met.','View today']
  };
  class TodayHabitWidget extends HTMLElement {
    constructor() { super(); this._model={variant:'small',habits:[{...defaults}]}; this._version=0; this._queues=new Map(); }
    connectedCallback() {
      if (!this._listening) { this.addEventListener('click', e=>this.handleClick(e)); this._listening=true; }
      this.render();
      this._media=matchMedia('(prefers-reduced-motion: reduce)');
      this._motionChanged=()=>{if(W.reduced())W.settleWater(this);};
      this._media.addEventListener('change',this._motionChanged);
      this._motionObserver=new MutationObserver(this._motionChanged);
      this._motionObserver.observe(document.documentElement,{attributes:true,attributeFilter:['data-reduced','data-motion-override']});
    }
    set model(value) {
      this._version++;
      this._queues.clear();
      this._model={...value,habits:(value.habits||[]).map((h,i)=>({...defaults,...h,id:String(h.id||'habit-'+i),amount:h.amount==null?null:Math.max(0,Number(h.amount)||0),target:Math.max(0,Number(h.target)||0),step:Math.max(1,Number(h.step)||1)}))};
      if(this.isConnected)this.render();
    }
    get model() { return {...this._model,habits:this._model.habits.map(h=>({...h}))}; }
    set save(handler) { this._save=handler; if(this.isConnected)this.update(); }
    get save() { return this._save; }
    open(habit,route='habit') { this.dispatchEvent(new CustomEvent('widget-open',{bubbles:true,detail:{route,habit:habit?{...habit}:null,date:this._model.date||null}})); }
    context(h) {
      if(h.tracker==='checkoff')return h.amount?'Logged today':'No log yet';
      if(h.rule==='atMost')return h.amount==null?'No log · limit '+W.format(h.target)+' '+h.unit: h.unit+' · limit '+W.format(h.target);
      return h.amount==null?'No log · target '+W.format(h.target)+' '+h.unit:'of '+W.format(h.target)+' '+h.unit;
    }
    summary(h) {
      if(h.tracker==='checkoff')return this.context(h);
      return h.amount==null?this.context(h):W.format(h.amount)+' '+this.context(h);
    }
    actionLabel(h) { return h.tracker==='checkoff'?(h.amount?'Undo':'Log'):h.rule==='atMost'?'Log':'+ '+W.format(h.step)+' '+h.unit; }
    setActionLabel(button,h,busy=false) {
      const text=busy&&h.tracker==='checkoff'?'Saving…':this.actionLabel(h);
      if(button.dataset.label===text)return;
      button.dataset.label=text;
      if(text.startsWith('+ '))button.innerHTML='<span class="tw-action-sign" aria-hidden="true">+</span><span class="tw-action-value">'+esc(W.format(h.step))+' <span>'+esc(h.unit)+'</span></span>';
      else button.textContent=text;
    }
    action(h) { return h.tracker==='checkoff'?'toggle':h.rule==='atMost'?'open':'increase'; }
    row(h,portrait=false) {
      if(portrait)return '<div class="tw-row tw-portrait" data-habit="'+esc(h.id)+'"><button type="button" class="tw-content" data-action="open"><span class="tw-name">'+esc(h.title)+'</span><span class="tw-portrait-metric"><span class="tw-row-amount"></span><span class="tw-art">'+W.art(h.artwork)+'</span></span><span class="tw-context"></span></button><button type="button" class="tw-action" data-action="'+this.action(h)+'"></button><span class="tw-pending" role="status"></span></div>';
      return '<div class="tw-row '+(portrait?'tw-portrait':'')+'" data-habit="'+esc(h.id)+'"><button type="button" class="tw-content" data-action="open"><span class="tw-art">'+W.art(h.artwork)+'</span><span class="tw-copy"><span class="tw-name">'+esc(h.title)+'</span><span class="tw-row-amount"></span><span class="tw-context"></span></span></button><button type="button" class="tw-action" data-action="'+this.action(h)+'"></button><span class="tw-pending" role="status"></span></div>';
    }
    render() {
      W.settleWater(this);
      const m=this._model, v=m.variant||'small', h=m.habits[0]||defaults;
      this.dataset.variant=v;
      this.setAttribute('role','group');
      this.setAttribute('aria-label',m.label|| (v==='message'?'Widget message':v==='small'||v.startsWith('lock')||v==='circular'?h.title+' widget':'Today habits widget'));
      let html='';
      if(v==='message') {
        const [title,detail,action]=messageStates[m.state]||messageStates.configure;
        html='<div class="tw-message"><span class="tw-name">'+esc(m.title||'today.')+'</span><h3>'+esc(m.headline||title)+'</h3><p>'+esc(m.detail||detail)+'</p><button type="button" class="tw-action" data-action="message">'+esc(action)+'</button></div>';
      } else if(v==='small') {
        // Controls are assembled separately so symbol artwork stays the supplied asset.
        const controls = h.tracker==='checkoff'?'<button type="button" class="tw-action" data-action="toggle"></button>':'<button type="button" class="tw-symbol" data-action="decrease"><img src="'+W.asset('widgets/Decrease.svg')+'" alt=""></button><span class="tw-increment">'+W.format(h.step)+'<br>'+esc(h.unit)+'</span><button type="button" class="tw-symbol" data-action="increase"><img src="'+W.asset('widgets/Increase.svg')+'" alt=""></button>';
        html='<div data-habit="'+esc(h.id)+'"><button type="button" class="tw-small-content tw-content" data-action="open"><span class="tw-name">'+esc(h.title)+'</span><span class="tw-small-metric"><span class="tw-amount"></span><span class="tw-art">'+W.art(h.artwork)+'</span></span><span class="tw-context"></span></button><div class="tw-page-marks" aria-hidden="true">'+'<i></i>'.repeat(10)+'</div><div class="tw-controls">'+controls+'</div><span class="tw-pending" role="status"></span></div>';
      } else if(['medium','list','portraits'].includes(v)) {
        const capacity=v==='medium'?2:v==='list'?5:4;
        const total=m.total||m.habits.length;
        html='<div class="tw-overview-header"><button type="button" data-action="today">today.</button><span>'+esc(v==='medium'?Math.max(0,total-2)+' more':v==='portraits'?Math.min(capacity,m.habits.length)+' of '+total+' habits':m.dateLabel||'Tue, Nov 17')+'</span></div><div class="tw-rows">'+m.habits.slice(0,capacity).map(item=>this.row(item,v==='portraits')).join('')+'</div>';
        if(v!=='medium')html+='<button type="button" class="tw-footer" data-action="today">'+(total>capacity?'View all '+total+' habits ↗':'All '+total+' habits')+'</button>';
      } else if(v==='lock') {
        html='<div data-habit="'+esc(h.id)+'"><button type="button" class="tw-lock-content tw-content" data-action="open"><span class="tw-name">'+esc(h.title)+'</span><span class="tw-amount"></span><span class="tw-context"></span><span class="tw-lock-track"><i></i></span></button><button type="button" class="tw-lock-action tw-action" data-action="'+this.action(h)+'"></button><span class="tw-pending" role="status"></span></div>';
      } else if(v==='circular') {
        html='<button type="button" class="tw-circle tw-content" data-action="open" data-habit="'+esc(h.id)+'"><svg viewBox="0 0 72 72" aria-hidden="true"><circle class="tw-circle-track" cx="36" cy="36" r="27"/><circle class="tw-circle-fill" cx="36" cy="36" r="27" pathLength="100"/></svg><span class="tw-circle-copy"><span class="tw-name">'+esc(m.shortName||h.title)+'</span><span class="tw-amount"></span><span class="tw-context"></span></span></button>';
      } else if(v==='streak'||v==='lock-streak') {
        html='<button type="button" class="tw-streak tw-content" data-action="open" data-habit="'+esc(h.id)+'"><span class="tw-name">'+esc(h.title)+'</span><span class="tw-streak-body"><span class="tw-streak-summary"><span class="tw-streak-count"><strong>'+W.format(m.count??6)+'</strong><span>'+esc(m.streakLabel||'day streak')+'</span></span><span class="tw-context">'+esc(m.through||'Through Nov 16')+'</span></span><span class="tw-flame">'+W.art(v==='streak'?'flame':'mono')+'</span></span><span class="tw-streak-days">'+(m.days||[10,11,12,13,14,15,16]).map((d,i)=>'<span>'+W.mark(i===0?'partial':'full')+'<small>'+esc(d)+'</small></span>').join('')+'</span></button>';
      } else if(v==='summary') {
        html='<button type="button" class="tw-summary tw-content" data-action="today"><span class="tw-name">today.</span><strong>'+W.format(m.total||5)+' habits</strong><span>'+W.format(m.met??2)+' build targets met · Open Today</span></button>';
      }
      this.innerHTML=html+'<div class="tw-error" hidden><span role="alert"></span><button type="button" data-action="retry">Retry</button><button type="button" data-action="today">Open Today</button></div><span class="tw-sr-status" role="status" aria-live="polite"></span>';
      this.update();
    }
    update() {
      for(const h of this._model.habits) {
        const item=[...this.querySelectorAll('[data-habit]')].find(el=>el.dataset.habit===h.id);
        if(!item)continue;
        const busy=this._queues.has(h.id);
        item.setAttribute('aria-busy',String(busy));
        const amount=item.querySelector('.tw-amount');
        if(amount) { const text=h.tracker==='checkoff'?'':W.format(h.amount); if(amount.textContent!==text) { const hadValue=Boolean(amount.textContent); amount.textContent=text; if(hadValue)W.animateText(amount); } }
        item.style.setProperty('--tw-number-size',W.format(h.amount).length>6?'22px':W.format(h.amount).length>4?'28px':'34px');
        const context=item.querySelector('.tw-context');
        if(context && !['streak','lock-streak'].includes(this._model.variant))context.textContent=this._model.variant==='circular'?h.unit:this.context(h);
        const rowAmount=item.querySelector('.tw-row-amount');
        if(rowAmount)rowAmount.textContent=this._model.variant==='portraits'?(h.tracker==='checkoff'?(h.amount?'Done':'—'):W.format(h.amount)):'';
        if(context&&this._model.variant!=='portraits'&&item.classList.contains('tw-row'))context.textContent=this.summary(h);
        const ratio=h.amount==null?0:h.target>0?Math.min(1,h.amount/h.target):0;
        if(item.matches('button[data-action="open"]'))item.setAttribute('aria-label',this._model.variant?.includes('streak')?'Open '+h.title+', '+W.format(this._model.count??6)+' '+(this._model.streakLabel||'day streak')+', '+(this._model.through||'Through Nov 16'):'Open '+h.title+', '+this.summary(h));
        item.style.setProperty('--tw-fill',h.rule==='atMost'?0:ratio);
        W.setWaterFill(item.querySelector('.tw-water'),h.rule==='atMost'?0:ratio);
        const circle=item.querySelector('.tw-circle-fill'); if(circle)circle.style.strokeDashoffset=100-ratio*100;
        item.querySelectorAll('.tw-page-marks i').forEach((mark,i)=>mark.dataset.filled=String(i<Math.floor(ratio*10)));
        item.querySelectorAll('[data-action]').forEach(button=>{
          const action=button.dataset.action;
          if(action==='open'){button.setAttribute('aria-label','Open '+h.title+', '+this.summary(h));if(button.classList.contains('tw-action'))this.setActionLabel(button,h);return;}
          if(action==='increase'||action==='decrease'){
            button.disabled=!this._save || (action==='decrease' && (!h.amount || h.amount<=0));
            button.setAttribute('aria-label',(action==='increase'?'Add ':'Subtract ')+h.step+' '+h.unit+(action==='increase'?' to ':' from ')+h.title);
          } else if(action==='toggle'){button.disabled=!this._save||busy;button.setAttribute('aria-pressed',String(Boolean(h.amount)));}
          if(button.classList.contains('tw-action'))this.setActionLabel(button,h,busy);
        });
        const pending=item.querySelector('.tw-pending');if(pending)pending.textContent=busy?'Saving…':'';
        item.dataset.tracker=h.tracker;
        item.dataset.artwork=h.artwork;
        item.dataset.rule=h.rule;
      }
    }
    handleClick(event) {
      const button=event.target.closest('button[data-action]');
      if(!button||!this.contains(button)||button.disabled)return;
      const action=button.dataset.action;
      const id=button.closest('[data-habit]')?.dataset.habit;
      const h=this._model.habits.find(item=>item.id===id)||this._model.habits[0];
      if(action==='today')return this.open(null,'today');
      if(action==='open')return this.open(h);
      if(action==='message'){
        const state=this._model.state;
        const route=state==='new'?'create':['configure','removed'].includes(state)?'configure':['failed','unavailable','noDue','complete'].includes(state)?'today':'habit';
        return this.open(route==='habit'?h:null,route);
      }
      if(action==='retry')return this._retry && this.enqueue(this._retry.id,this._retry.action);
      this.enqueue(h?.id,action);
    }
    async enqueue(id,action) {
      if(!this._save||!id)return;
      if(this._queues.has(id)){if(action!=='toggle')this._queues.get(id).push(action);return;}
      const queue=[action]; this._queues.set(id,queue); const version=this._version;
      this.querySelector('.tw-error').hidden=true;
      this.update();
      while(queue.length && version===this._version) {
        const currentAction=queue.shift();
        const h=this._model.habits.find(item=>item.id===id);
        let proposed=currentAction==='toggle'?(h.amount?null:1):Math.max(0,Math.min(1000000,(h.amount||0)+(currentAction==='decrease'?-h.step:h.step)));
        if(proposed===0 && h.rule!=='atMost')proposed=null;
        try {
          const confirmed=await this._save({habit:{...h},action:currentAction,proposed,date:this._model.date||null});
          if(version!==this._version)return;
          if(confirmed!==null&&(!Number.isFinite(confirmed)||confirmed<0))throw new Error('Invalid confirmed amount');
          h.amount=confirmed;
          this.update();
          this.querySelector('.tw-sr-status').textContent=h.title+': '+this.summary(h)+'. Saved.';
          this.dispatchEvent(new CustomEvent('widget-change',{bubbles:true,detail:{habit:{...h},action:currentAction,date:this._model.date||null}}));
        } catch(error) {
          if(version!==this._version)return;
          queue.length=0;
          this._retry={id,action:currentAction};
          const box=this.querySelector('.tw-error');box.hidden=false;
          box.querySelector('[role=alert]').textContent='Couldn’t save. '+this.summary(h)+' is unchanged.';
          this.dispatchEvent(new CustomEvent('widget-error',{bubbles:true,detail:{id,error}}));
        }
      }
      this._queues.delete(id);
      this.update();
    }
    disconnectedCallback(){this._version++;this._queues.clear();W.settleWater(this);this._motionObserver?.disconnect();this._media?.removeEventListener('change',this._motionChanged);this.getAnimations({subtree:true}).forEach(a=>a.cancel());}
  }
  window.TodayWidgets.messageStates=messageStates;
  if(!customElements.get('today-habit-widget'))customElements.define('today-habit-widget',TodayHabitWidget);
})();
