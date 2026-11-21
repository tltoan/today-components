/* Date-first party activity. Reuses the agenda's single snap controller.
   Each date holds compact member summaries; original entry IDs own reactions/photos. */
(() => {
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const date=(d,options)=>new Date(d+'T12:00:00Z').toLocaleDateString('en-US',{...options,timeZone:'UTC'});
  const quantity=(n,u)=>u==='check'?(n?'Logged':'Recorded zero'):`${n.toLocaleString('en-US')} ${u}`;
  const safePhoto=e=>e.photoURL&&/^(blob:|data:image\/|assets\/party-samples\/[a-z-]+\.jpg$)/.test(e.photoURL);
  const reduced=()=>document.documentElement.hasAttribute('data-reduced')||(!document.documentElement.hasAttribute('data-motion-override')&&matchMedia('(prefers-reduced-motion:reduce)').matches);
  class PartyActivity extends HTMLElement {
    set model(v){this._model=structuredClone(v||{});if(this.isConnected)this.update();}
    connectedCallback(){this.build();this.update();}
    disconnectedCallback(){this._snap?.destroy();this._resize?.disconnect();this._panel?.destroy?.();this._ready=false;this._signature=null;}
    build(){
      if(this._ready)return;this._ready=true;
      this.innerHTML=`<div class="pa-agenda-head"><span class="pa-month"></span><div><button type="button" class="pa-newer" aria-label="Newer day">↑</button><button type="button" class="pa-older" aria-label="Older day">↓</button></div></div><div class="pa-date-viewport" tabindex="0" role="region" aria-label="Shared check-ins by date. Swipe or use up and down arrow keys."><div class="pa-date-list"></div></div><p class="pa-position" aria-live="polite"></p><div class="pa-detail"><div><div class="pa-detail-head"><strong></strong><button type="button" aria-label="Close entries">×</button></div><div class="pa-detail-entries"></div></div></div>`;
      this._panel=new TodayUI.Disclosure(this.querySelector('.pa-detail'));
      this.querySelector('.pa-detail-head button').onclick=()=>this.closeEntries();
      this.querySelector('.pa-newer').onclick=()=>this._snap.goTo((this._snap.frame?this._snap.targetIndex:this._snap.index)-1);
      this.querySelector('.pa-older').onclick=()=>this._snap.goTo((this._snap.frame?this._snap.targetIndex:this._snap.index)+1);
      this._snap=new TodayUI.SnapScroller(this.querySelector('.pa-date-viewport'),{selector:'.pa-date',interactiveDrag:true,reducedMotion:reduced,onSelect:i=>this.selectDate(i)});
      this._resize=new ResizeObserver(()=>this._snap.refresh(this._snap.index));this._resize.observe(this.querySelector('.pa-date-viewport'));
    }
    selectDate(i){
      const d=this._dates?.[i];if(!d)return;
      if(this._date!==d){this._date=d;this.closeEntries(false);}
      this.querySelector('.pa-month').textContent=date(d,{month:'long',year:'numeric'});
      this.querySelector('.pa-position').textContent=`${d===this._model.today?'Today':date(d,{month:'short',day:'numeric'})} · ${i+1} of ${this._dates.length} days`;
      this.querySelector('.pa-newer').disabled=i===0;this.querySelector('.pa-older').disabled=i===this._dates.length-1;
      this.querySelectorAll('.pa-date').forEach((row,n)=>{row.inert=n!==i;row.setAttribute('aria-hidden',String(n!==i));});
    }
    closeEntries(focus=true){const old=this._open;this._open=null;this._panel?.setOpen(false);this.querySelectorAll('.pa-person-row').forEach(b=>b.setAttribute('aria-expanded','false'));if(focus&&old)this.querySelector(`[data-group="${CSS.escape(old)}"]`)?.focus({preventScroll:true});}
    revealEntry(id){const e=this._model?.entries?.find(e=>e.id===id);if(!e)return;const i=this._dates.indexOf(e.date);if(i<0)return;this._snap.goTo(i,{immediate:true});this.openEntries(e.date+':'+e.memberID);}
    openEntries(key){
      this._open=key;this.paintEntries();this._panel.setOpen(true);
      this.querySelectorAll('.pa-person-row').forEach(b=>b.setAttribute('aria-expanded',String(b.dataset.group===key)));
    }
    paintEntries(){
      const m=this._model,entries=this._groups.get(this._open);if(!entries)return;
      const p=m.members.find(p=>p.id===entries[0].memberID);if(!p)return;
      this.querySelector('.pa-detail-head strong').textContent=`${p.name} · ${date(entries[0].date,{month:'short',day:'numeric'})}`;
      const holder=this.querySelector('.pa-detail-entries'),existing=new Map([...holder.children].map(c=>[c.dataset.entry,c]));
      entries.forEach((e,i)=>{let c=existing.get(e.id);if(!c){c=document.createElement('today-party-checkin');c.setAttribute('compact','');c.dataset.entry=e.id;holder.append(c);}existing.delete(e.id);c.model={...e,name:p.name,initials:p.initials,profilePhotoURL:p.photoURL,amount:quantity(e.amount,e.unit),time:e.time||date(e.date,{month:'short',day:'numeric'}),viewer:m.members.find(p=>p.id===m.viewerID),reactors:m.members.filter(p=>(e.reactorIDs||[]).includes(p.id)),reacted:(e.reactorIDs||[]).includes(m.viewerID)};if(holder.children[i]!==c)holder.insertBefore(c,holder.children[i]||null);});existing.forEach(c=>c.remove());
    }
    update(){
      const m=this._model;if(!m?.members||!m.today)return;this.build();
      const groups=this._groups=new Map(),entries=(m.entries||[]).filter(e=>e.date<=m.today&&Number.isFinite(e.amount)&&e.saved!==false&&(!m.memberID||m.memberID===e.memberID)).sort((a,b)=>b.date.localeCompare(a.date)||(b.order||0)-(a.order||0));
      for(const e of entries){const k=e.date+':'+e.memberID;if(!groups.has(k))groups.set(k,[]);groups.get(k).push(e);}
      const dates=[...new Set([m.today,...entries.map(e=>e.date)])].sort((a,b)=>b.localeCompare(a));
      const signature=JSON.stringify([m.today,m.memberID,m.members,entries.map(({reactorIDs,...e})=>e)]);
      if(signature!==this._signature){
        this._signature=signature;this._dates=dates;const previous=this._date;
        this.querySelector('.pa-date-list').innerHTML=dates.map(d=>{
          const people=m.members.filter(p=>(!m.memberID||p.id===m.memberID)&&(d===m.today||groups.has(d+':'+p.id)));
          return `<article class="pa-date"><div class="pa-date-label"><strong>${Number(d.slice(-2))}</strong><span>${date(d,{weekday:'short'})}</span></div><div class="pa-date-card">${people.map(p=>{
            const key=d+':'+p.id,es=groups.get(key)||[],units=[...new Set(es.map(e=>e.unit))],total=units.map(u=>quantity(es.filter(e=>e.unit===u).reduce((n,e)=>n+e.amount,0),u)).join(' + '),photo=es.find(safePhoto);
            return `<button type="button" class="pa-person-row" data-group="${esc(key)}" aria-expanded="false" ${es.length?'':'disabled'}><today-profile-avatar still size="28" person="${esc(JSON.stringify(p))}" aria-hidden="true"></today-profile-avatar><span class="pa-person-copy"><strong>${esc(p.name)}</strong><small>${es.length?(es.length>1?es.length+' entries':esc(es[0].time||'Logged')):'No log yet'}</small></span><span class="pa-person-amount">${esc(total)}</span>${photo?`<img class="pa-thumb" src="${esc(photo.photoURL)}" alt="${esc(photo.photoAlt||'Shared photo')}" loading="lazy">`:'<span class="pa-row-arrow" aria-hidden="true">›</span>'}</button>`;
          }).join('')}</div></article>`;
        }).join('');
        this.querySelectorAll('[data-group]').forEach(b=>b.onclick=()=>this._open===b.dataset.group?this.closeEntries(false):this.openEntries(b.dataset.group));
        const index=Math.max(0,dates.indexOf(previous));this._snap.refresh(index);
      }
      if(this._open&&groups.has(this._open)){this.paintEntries();this.querySelector(`[data-group="${CSS.escape(this._open)}"]`)?.setAttribute('aria-expanded','true');}
      else if(this._open)this.closeEntries(false);
    }
  }
  customElements.define('today-party-activity',PartyActivity);
})();
