/* Calendar and streak display components. Callers supply historical eligibility
 * and confirmed streaks; these components never infer history from today's goal.
 */
(() => {
  const W=window.TodayWidgets, esc=W.escape;
  class TodayHabitCalendar extends HTMLElement {
    constructor(){super();this._model={year:2026,month:11,today:'2026-11-17',target:10,unit:'pages',rule:'atLeast',mode:'activity',entries:[],selected:'2026-11-17'};}
    set model(value){this._model={...this._model,...value};if(this.isConnected)this.render();}
    get model(){return {...this._model};}
    connectedCallback(){
      if(!this._ready){
        this.addEventListener('click',e=>{const b=e.target.closest('[data-date]');if(b&&!b.disabled)this.select(b.dataset.date);});
        this.addEventListener('keydown',e=>{
          const b=e.target.closest('[data-date]');if(!b)return;
          const delta={ArrowRight:1,ArrowLeft:-1,ArrowDown:7,ArrowUp:-7}[e.key];if(!delta)return;
          e.preventDefault();const buttons=[...this.querySelectorAll('[data-date]:not(:disabled)')];const index=buttons.indexOf(b);buttons[Math.max(0,Math.min(buttons.length-1,index+delta))]?.focus();
        });this._ready=true;
      }this.render();
    }
    description(day){
      const m=this._model, e=m.entries.find(x=>x.day===day), amount=e?.amount, target=e?.target??m.target, rule=e?.rule??m.rule;
      if(day>m.today)return 'Future day';
      if(e?.eligible===false)return e.paused?'Paused':'Not scheduled';
      if(amount==null)return 'No log';
      const actual=W.format(amount)+' '+m.unit;
      if(rule==='atMost')return actual+' · '+(day===m.today?'day still open':amount<=target?'within limit':'over limit');
      return actual+' · '+(amount>=target?'target met':'partial amount');
    }
    select(day){
      this._model.selected=day;
      this.querySelectorAll('[data-date]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.date===day)));
      const detail=this.querySelector('.tw-calendar-selection');
      const month=new Date(Date.UTC(this._model.year,this._model.month-1,1)).toLocaleString('en-US',{month:'short',timeZone:'UTC'});
      detail.textContent=month+' '+Number(day.slice(-2))+': '+this.description(day);
      W.animateText(detail);
      this.dispatchEvent(new CustomEvent('date-select',{bubbles:true,detail:{date:day,entry:this._model.entries.find(e=>e.day===day)||null}}));
    }
    render(){
      const m=this._model,date=new Date(Date.UTC(m.year,m.month-1,1));
      const count=new Date(Date.UTC(m.year,m.month,0)).getUTCDate();
      const month=date.toLocaleString('en-US',{month:'long',timeZone:'UTC'});
      this.setAttribute('role','group');this.setAttribute('aria-label',month+' '+m.year+' habit history');
      this.dataset.mode=m.mode;
      let cells='<span></span>'.repeat(date.getUTCDay());
      for(let d=1;d<=count;d++){
        const day=m.year+'-'+String(m.month).padStart(2,'0')+'-'+String(d).padStart(2,'0');
        const entry=m.entries.find(e=>e.day===day),amount=entry?.amount;
        const future=day>m.today,eligible=entry?.eligible!==false;
        const logged=amount!=null&&!future&&eligible;
        const target=entry?.target??m.target,rule=entry?.rule??m.rule;
        const met=logged&&(rule==='atMost'?amount<=target:amount>=target)&&day<m.today;
        const state=!logged?'none':rule==='atMost'||amount>=target?'full':'partial';
        cells+='<button type="button" data-date="'+day+'" data-complete="'+(m.mode==='completion'&&met)+'" aria-pressed="'+(day===m.selected)+'" aria-label="'+month+' '+d+': '+esc(this.description(day))+'"'+(future?' disabled':'')+'><span>'+d+'</span>'+(future?'':m.mode==='completion'?'<small>'+ (logged?W.format(amount):'—')+'</small>':W.mark(state)+(m.rule==='atMost'?'<small>'+ (logged?W.format(amount):'—')+'</small>':''))+'</button>';
      }
      this.innerHTML='<div class="tw-calendar-heading"><h3>'+month+' '+m.year+'</h3><p>'+(m.rule==='atMost'?(m.mode==='completion'?'Completed days · ':'Logged amounts · ')+'at most '+m.target+' '+esc(m.unit):'Target: '+m.target+' '+esc(m.unit))+'</p></div><div class="tw-calendar-week" aria-hidden="true">'+'SMTWTFS'.split('').map(d=>'<span>'+d+'</span>').join('')+'</div><div class="tw-calendar-days">'+cells+'</div><p class="tw-calendar-selection" role="status"></p>';
      this.querySelector('.tw-calendar-selection').textContent=month.slice(0,3)+' '+Number(m.selected.slice(-2))+': '+this.description(m.selected);
    }
  }
  class TodayStreakHero extends HTMLElement{
    set model(value){this._model=value;if(this.isConnected)this.render();}
    connectedCallback(){this.render();}
    render(){const m=this._model||{};this.innerHTML='<span class="tw-hero-flame">'+W.art('flame')+'</span><div><p><strong>'+W.format(m.count??6)+'</strong> '+esc(m.label||'day streak')+'</p><span>'+esc(m.through||'Through Nov 16')+'</span></div>';}
  }
  class TodayRecentLog extends HTMLElement{
    set model(value){this._model=value;if(this.isConnected)this.render();}
    connectedCallback(){this.render();if(!this._ready){this.addEventListener('click',()=>this.dispatchEvent(new CustomEvent('log-open',{bubbles:true,detail:{...this._model}})));this._ready=true;}}
    render(){const m=this._model||{};this.innerHTML='<button type="button" aria-label="Open log for '+esc(m.label||'Thu, Nov 12')+', '+esc(m.amount??10)+' '+esc(m.unit||'pages')+'">'+W.mark(m.mark||'full')+'<span>'+esc(m.label||'Thu, Nov 12')+'</span><strong>'+esc(m.amount??10)+' '+esc(m.unit||'pages')+'</strong><span aria-hidden="true">›</span></button>';}
  }
  customElements.define('today-habit-calendar',TodayHabitCalendar);
  customElements.define('today-streak-hero',TodayStreakHero);
  customElements.define('today-recent-log',TodayRecentLog);
})();
