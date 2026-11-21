/* Reusable detail pieces. Hosts own saving and dates; all time values are local HH:mm. */
(() => {
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const label=d=>new Date(d+'T12:00:00Z').toLocaleDateString('en-US',{month:'short',day:'numeric',timeZone:'UTC'});
  const offset=(d,n)=>{const date=new Date(d+'T12:00:00Z');date.setUTCDate(date.getUTCDate()+n);return date.toISOString().slice(0,10);};
  const names=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const emit=(el,action,data)=>el.dispatchEvent(new CustomEvent('habit-detail-request',{bubbles:true,detail:{action,...data}}));
  class HabitSchedule extends HTMLElement {
    get value(){return [...(this._days||[0,2,4])];}
    set value(v){this._days=[...v].sort();this._custom=[...this._days];if(this._ready)this.paint();}
    connectedCallback(){if(this._ready)return;this._ready=true;this._days ||= [0,2,4];this._custom=[...this._days];
      this.innerHTML=`<div class="hs-surface"><div class="hs-heading"><strong>Schedule:</strong><span>Repeat weekly</span></div><button type="button" class="hs-trigger" aria-expanded="false"><span>On these days</span><span data-preset-label>Custom</span><span aria-hidden="true">⌄</span></button><div class="hs-presets"><div><div class="hs-preset-list" role="group" aria-label="Schedule presets">${['Every day','Weekdays','Weekends','Custom'].map((n,i)=>`<button type="button" data-preset="${i}" aria-pressed="false">${n}</button>`).join('')}</div></div></div><div class="hs-days" role="group" aria-label="Scheduled weekdays">${names.map((n,i)=>`<button type="button" data-day="${i}" aria-label="${n}" aria-pressed="false" style="--day-order:${i}">${n.slice(0,2)}</button>`).join('')}</div><span class="sr-only" role="status"></span></div>`;
      this._panel=new TodayUI.Disclosure(this.querySelector('.hs-presets'),{trigger:this.querySelector('.hs-trigger')});this.querySelector('.hs-trigger').onclick=()=>this._panel.toggle();
      this.querySelectorAll('[data-day]').forEach(b=>b.onclick=()=>{const d=+b.dataset.day;if(this._days.includes(d)&&this._days.length===1){this.querySelector('[role=status]').textContent='Keep at least one day selected.';return;}this._days=this._days.includes(d)?this._days.filter(n=>n!==d):[...this._days,d].sort();this._custom=[...this._days];this.changed();});
      this.querySelectorAll('[data-preset]').forEach(b=>b.onclick=()=>{this._days=[[0,1,2,3,4,5,6],[1,2,3,4,5],[0,6],this._custom][+b.dataset.preset].slice();this.changed();this._panel.setOpen(false);});
      this.addEventListener('keydown',e=>{if(e.key==='Escape'&&this._panel.open){e.stopPropagation();this._panel.setOpen(false);this.querySelector('.hs-trigger').focus();}});this.paint();
    }
    changed(){this.paint();this.dispatchEvent(new Event('change',{bubbles:true}));this.dispatchEvent(new CustomEvent('schedule-selection',{bubbles:true,detail:{days:this.value}}));}
    paint(){const list=this._days.join(),preset=list==='0,1,2,3,4,5,6'?0:list==='1,2,3,4,5'?1:list==='0,6'?2:3;this.querySelector('[data-preset-label]').textContent=['Every day','Weekdays','Weekends','Custom'][preset];this.querySelectorAll('[data-day]').forEach(b=>b.setAttribute('aria-pressed',String(this._days.includes(+b.dataset.day))));this.querySelectorAll('[data-preset]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.preset===preset)));}
  }
  customElements.define('today-habit-schedule',HabitSchedule);
  class HabitReminder extends HTMLElement {
    set model(m){this._model={enabled:false,time:'21:30',...m};if(this.isConnected)this.render();}
    get value(){return{enabled:this.querySelector('today-switch').checked,time:this.querySelector('today-time-picker').value};}
    connectedCallback(){this._model ||= {enabled:true,time:'21:30'};this.render();}
    render(){const m=this._model;this.innerHTML=`<div class="hr-card"><div class="hd-switch-row"><span>Remind me</span><today-switch label="Remind me" ${m.enabled?'checked':''}></today-switch></div><div class="hr-time"><div><today-time-picker variant="wheel" value="${m.time}"></today-time-picker></div></div><p class="hd-explanation">On scheduled days.</p><p class="hd-form-error" role="alert"></p><today-button label="Save reminder" variant="primary" block data-reminder-save></today-button></div>`;
      const sw=this.querySelector('today-switch'),pk=this.querySelector('today-time-picker'),save=this.querySelector('[data-reminder-save]');this._panel=new TodayUI.Disclosure(this.querySelector('.hr-time'),{open:m.enabled});
      const sync=()=>save.toggleAttribute('disabled',sw.checked&&pk.editing);sw.addEventListener('change',()=>{pk.toggleAttribute('disabled',!sw.checked);this._panel.setOpen(sw.checked);sync();});pk.addEventListener('picker-open',sync);pk.addEventListener('picker-cancel',sync);pk.addEventListener('change',sync);pk.toggleAttribute('disabled',!sw.checked);
      save.addEventListener('today-activate',e=>{e.stopPropagation();if(sw.checked&&pk.editing)return;save.setAttribute('busy','');emit(this,'save-reminder',this.value);});
    }
    resolve(error=''){this.querySelector('[data-reminder-save]').removeAttribute('busy');this.querySelector('.hd-form-error').textContent=error;if(!error)this._model=this.value;}
  }
  customElements.define('today-habit-reminder',HabitReminder);
  class HabitHistory extends HTMLElement {
    set model(m){const key=JSON.stringify([m.entries,m.today,m.unit,m.selectedDate]);this._model=m;if(this.isConnected&&key!==this._key){this._key=key;this.render();}}
    connectedCallback(){if(this._model)this.render();}
    set selectedDate(date){this._date=date;this.render();}
    dayTotal(date){const es=this._model.entries.filter(e=>e.date===date);const groups={};for(const e of es)groups[e.unit]=(groups[e.unit]||0)+e.amount;return Object.entries(groups).map(([u,n])=>u==='check'?(n?'Logged':'Recorded zero'):`${n.toLocaleString()} ${u}`).join(' · ')||'No log';}
    render(){const m=this._model;if(!m)return;const variant=this.getAttribute('variant')||'days',recent=[offset(m.today,-2),offset(m.today,-1),m.today];this._date=m.selectedDate||this._date;const older=[...new Set(m.entries.map(e=>e.date).filter(d=>d<recent[0]))].sort().reverse();
      this.innerHTML=`<div class="hh-root hh-${variant}"><div class="hh-heading"><h3>History</h3><span>Past 3 days</span></div><div class="hh-recent"></div><button type="button" class="hh-expand" aria-expanded="false">${this._expanded?'Show less':'View earlier history'}</button><div class="hh-earlier"><div></div></div></div>`;
      const holder=this.querySelector('.hh-recent');
      if(this._date){holder.innerHTML=`<div class="hh-filter"><strong>${label(this._date)}</strong><button type="button">Back to recent</button></div>`;holder.querySelector('button').onclick=()=>{this._date=null;this._model={...m,selectedDate:null};this.dispatchEvent(new CustomEvent('history-clear',{bubbles:true}));this.render();};this.rows(holder,this._date);}
      else if(variant==='chart'){
        const totals=recent.map(d=>m.entries.filter(e=>e.date===d&&e.unit===m.unit).reduce((n,e)=>n+e.amount,0)),max=Math.max(1,...totals);holder.innerHTML=`<div class="hh-chart" role="group" aria-label="Logged amounts over the past three days">${recent.map((d,i)=>`<button type="button" data-history-date="${d}" aria-label="${label(d)}: ${this.dayTotal(d)}"><span class="hh-chart-value">${this.dayTotal(d)}</span><span class="hh-chart-track"><i style="height:${Math.max(3,totals[i]/max*100)}%"></i></span><span>${label(d)}</span></button>`).join('')}</div><p class="hh-chart-hint">Tap a day for its entries.</p>`;holder.querySelectorAll('button').forEach(b=>b.onclick=()=>{this._date=b.dataset.historyDate;this.render();});
      }else for(const date of [...recent].reverse())this.day(holder,date,variant);
      const previous=this.querySelector('.hh-earlier>div');for(const date of older)this.day(previous,date,variant==='chart'?'days':variant);const trigger=this.querySelector('.hh-expand');trigger.hidden=!older.length||!!this._date;this._panel=new TodayUI.Disclosure(this.querySelector('.hh-earlier'),{trigger,open:!!this._expanded&&!this._date});trigger.onclick=()=>{this._expanded=!this._panel.open;this._panel.setOpen(this._expanded);trigger.textContent=this._expanded?'Show less':'View earlier history';};
    }
    day(holder,date,variant){const es=this._model.entries.filter(e=>e.date===date),wrap=document.createElement('div');wrap.className='hh-day';wrap.innerHTML=`<button type="button" class="hh-day-head" aria-expanded="false" ${!es.length?'disabled':''}><span><strong>${date===this._model.today?'Today':label(date)}</strong>${variant==='journal'?`<small>${es.length?es.length+' '+(es.length===1?'entry':'entries'):'No entries'}</small>`:''}</span><span class="hh-day-amount">${this.dayTotal(date)}</span>${es.length?'<span aria-hidden="true">⌄</span>':''}</button><div class="hh-day-panel"><div></div></div>`;holder.append(wrap);this.rows(wrap.querySelector('.hh-day-panel>div'),date);const b=wrap.querySelector('button'),panel=new TodayUI.Disclosure(wrap.querySelector('.hh-day-panel'),{trigger:b});b.onclick=()=>panel.toggle();}
    rows(holder,date){const es=this._model.entries.filter(e=>e.date===date).slice().reverse();if(!es.length){const p=document.createElement('p');p.className='hd-empty';p.textContent='No entries for this day.';holder.append(p);}for(const e of es){const row=document.createElement('today-habit-entry');row.model=e;holder.append(row);}}
  }
  customElements.define('today-habit-history',HabitHistory);
})();
