/* Controlled party composition. All writes are requests; the host owns roster,
   dated logs, reactions and per-recipient nudge eligibility. */
(() => {
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const dateLabel=d=>new Date(d+'T12:00:00Z').toLocaleDateString('en-US',{month:'short',day:'numeric',timeZone:'UTC'});
  const amount=e=>e.unit==='check'?'Logged':`${e.amount.toLocaleString('en-US')} ${e.unit}`;
  class PartyRoom extends HTMLElement {
    connectedCallback(){if(this._ready)return;this._ready=true;this._selected='all';this.build();this.update();}
    disconnectedCallback(){this._ready=false;}
    set model(v){this._model=structuredClone(v||{});if(this._ready)this.update();}
    get model(){return structuredClone(this._model||{});}
    build(){
      this.innerHTML=`<div class="p-room"><header class="p-room-head"><span class="p-eyebrow">PRIVATE PARTY</span><h3></h3><p></p></header><section class="p-streak" aria-label="Shared party streak"><div class="p-streak-top"><img src="assets/streaks/ember.svg" alt=""><div><strong></strong><span></span></div></div><div class="p-current"><i aria-hidden="true"></i><div><strong></strong><span></span></div></div></section><section class="p-members"><div class="p-section-title"><h4>People</h4></div><div class="p-member-tabs" role="group" aria-label="Choose a party member"></div></section><div class="p-person-panel"></div><section class="p-feed"><div class="p-section-title"><h4>Shared check-ins</h4><button class="p-all" type="button">Everyone</button></div><today-party-activity></today-party-activity></section></div>`;
      this.querySelector('.p-all').onclick=()=>this.select('all');
    }
    select(id){this._selected=id;this.update();this.dispatchEvent(new CustomEvent('party-member-change',{bubbles:true,detail:{id}}));}
    update(){
      const m=this.model;if(!m.today||!m.members)return;
      if(this._selected!=='all'&&!m.members.some(p=>p.id===this._selected))this._selected='all';
      const stats=TodayPartyProgress.progress(m),focusID=this.querySelector('.p-member-tabs')?.contains(document.activeElement)?document.activeElement.dataset.member:null;
      this.querySelector('.p-room-head h3').textContent=m.name||'Reading party';
      this.querySelector('.p-room-head p').textContent=`${m.members.length} people · Schedule: ${m.schedule||'Not set'}`;
      const streak=this.querySelector('.p-streak-top strong'),previous=this._streak;streak.textContent=`${stats.streak} day${stats.streak===1?'':'s'}`;this._streak=stats.streak;
      this.querySelector('.p-streak-top span').textContent='Party streak';
      if(previous!==undefined&&stats.streak!==previous&&!document.documentElement.hasAttribute('data-reduced')&&(!matchMedia('(prefers-reduced-motion:reduce)').matches||document.documentElement.hasAttribute('data-motion-override')))streak.animate([{opacity:.4,transform:'translateY(5px)'},{opacity:1,transform:'translateY(0)'}],{duration:500,easing:'cubic-bezier(.24,.74,.26,1)'});
      const current=this.querySelector('.p-current'),day=stats.current;
      current.querySelector('strong').textContent=dateLabel(m.today);
      current.querySelector('span').textContent=day.scheduled===false?'Day off':`${day.logged}/${day.total} logged`;
      current.querySelector('i').style.setProperty('--portion',`${day.total?day.logged/day.total*100:0}%`);
      current.classList.toggle('is-off',day.scheduled===false);
      current.setAttribute('aria-label',`${dateLabel(m.today)}: ${day.scheduled===false?'Day off, streak unchanged':day.logged+' of '+day.total+' members logged'}`);
      this.querySelector('.p-member-tabs').innerHTML=m.members.map(p=>`<button type="button" data-member="${esc(p.id)}" aria-pressed="${this._selected===p.id}" aria-label="${esc(p.name)}, ${stats.current.loggedIDs.includes(p.id)?'logged today':'no log today'}. View plan and activity"><today-profile-avatar size="42" person="${esc(JSON.stringify(p))}" aria-hidden="true"></today-profile-avatar><strong>${esc(p.name)}</strong><small>${stats.current.loggedIDs.includes(p.id)?'Logged':'No log yet'}</small></button>`).join('');
      this.querySelectorAll('[data-member]').forEach(b=>b.onclick=()=>this.select(b.dataset.member));
      if(focusID)this.querySelector(`[data-member="${CSS.escape(focusID)}"]`)?.focus({preventScroll:true});
      this.updatePerson(m);
      const all=this._selected==='all',person=m.members.find(p=>p.id===this._selected);
      this.querySelector('.p-feed h4').textContent=all?'Shared check-ins':`${person.name==='You'?'Your':person.name+'’s'} check-ins`;
      this.querySelector('.p-all').hidden=all;
      this.querySelector('today-party-activity').model={...m,memberID:all?null:this._selected};

    }
    updatePerson(m){
      const panel=this.querySelector('.p-person-panel'),p=m.members.find(p=>p.id===this._selected);
      if(!p){panel.replaceChildren();this._personID=null;return;}
      const entries=(m.entries||[]).filter(e=>e.memberID===p.id&&e.date===m.today&&Number.isFinite(e.amount)&&e.saved!==false),units=[...new Set(entries.map(e=>e.unit))],summary=units.map(u=>amount({amount:entries.filter(e=>e.unit===u).reduce((n,e)=>n+e.amount,0),unit:u})).join(' + ')||'No log yet';
      if(this._personID!==p.id){this._personID=p.id;panel.innerHTML=`<section class="p-plan"><div class="p-section-title"><h4></h4><span>Your own plan</span></div><strong class="p-plan-target"></strong><p class="p-plan-schedule"></p><div class="p-plan-today"><span>Today</span><strong></strong></div></section>${p.id===m.viewerID?'':'<today-party-nudge variant="compact" interaction="button"></today-party-nudge>'}`;}
      panel.querySelector('h4').textContent=p.id===m.viewerID?'Your plan':p.name+'’s plan';panel.querySelector('.p-section-title>span').hidden=true;
      panel.querySelector('.p-plan-target').textContent=p.plan||'Plan not shared';panel.querySelector('.p-plan-schedule').textContent='Schedule: '+(m.schedule||'Not set');panel.querySelector('.p-plan-today strong').textContent=summary;
      const n=panel.querySelector('today-party-nudge');if(n)n.model={id:p.id,person:p,name:p.name,window:p.window||'8–9 PM',state:p.nudgeState||'available'};
    }
  }
  customElements.define('today-party-room',PartyRoom);
})();
