/* One summary per person per day; expand for the original individual entries.
   Reactions stay on their entry IDs. Totals never combine incompatible units. */
(() => {
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const label=d=>new Date(d+'T12:00:00Z').toLocaleDateString('en-US',{month:'short',day:'numeric',timeZone:'UTC'});
  const quantity=(n,u)=>u==='check'?(n?'Logged':'Recorded zero'):`${n.toLocaleString('en-US')} ${u}`;
  class PartyActivity extends HTMLElement {
    set model(v){this._model=structuredClone(v||{});if(this.isConnected)this.update();}
    connectedCallback(){this._rows ||= new Map();this.update();}
    update(){
      const m=this._model;if(!m?.members)return;this._rows ||= new Map();
      const groups=new Map();
      for(const e of (m.entries||[]).filter(e=>e.date<=m.today&&Number.isFinite(e.amount)&&e.saved!==false&&(!m.memberID||m.memberID===e.memberID)).sort((a,b)=>b.date.localeCompare(a.date)||(b.order||0)-(a.order||0))){
        const key=e.date+':'+e.memberID;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(e);
      }
      const visible=[...groups].slice(0,this._expanded?Infinity:3),keep=new Set(visible.map(([k])=>k));
      this.querySelectorAll('.pa-more,.pa-empty').forEach(n=>n.remove());
      this._rows.forEach((r,k)=>{if(!keep.has(k)){r.panel.destroy?.();r.el.remove();this._rows.delete(k);}});
      for(const [key,entries] of visible){
        const p=m.members.find(p=>p.id===entries[0].memberID);if(!p)continue;
        let row=this._rows.get(key);
        if(!row){const el=document.createElement('article');el.className='pa-day';el.innerHTML=`<button type="button" class="pa-summary" aria-expanded="false"><today-profile-avatar size="34" aria-hidden="true"></today-profile-avatar><span class="pa-who"><strong></strong><small></small></span><span class="pa-total"></span><span class="pa-chevron" aria-hidden="true">⌄</span></button><div class="pa-entries"><div></div></div>`;this.append(el);const b=el.querySelector('button'),panel=new TodayUI.Disclosure(el.querySelector('.pa-entries'),{trigger:b});b.onclick=()=>panel.toggle();row={el,panel};this._rows.set(key,row);}
        const el=row.el;el.querySelector('today-profile-avatar').setAttribute('person',JSON.stringify(p));
        el.querySelector('.pa-who strong').textContent=p.name;
        el.querySelector('.pa-who small').textContent=`${entries[0].date===m.today?'Today':label(entries[0].date)} · ${entries.length} ${entries.length===1?'entry':'entries'}${entries.some(e=>e.photoURL||e.samplePhoto)?' · Photo':''}`;
        const units=[...new Set(entries.map(e=>e.unit))];el.querySelector('.pa-total').textContent=units.map(u=>quantity(entries.filter(e=>e.unit===u).reduce((n,e)=>n+e.amount,0),u)).join(' + ');
        const holder=el.querySelector('.pa-entries>div'),existing=new Map([...holder.children].map(c=>[c.dataset.entry,c]));
        entries.forEach((e,i)=>{let c=existing.get(e.id);if(!c){c=document.createElement('today-party-checkin');c.setAttribute('compact','');c.dataset.entry=e.id;holder.append(c);}existing.delete(e.id);c.model={...e,name:p.name,initials:p.initials,profilePhotoURL:p.photoURL,amount:quantity(e.amount,e.unit),time:e.time||label(e.date),viewer:m.members.find(p=>p.id===m.viewerID),reactors:m.members.filter(p=>(e.reactorIDs||[]).includes(p.id)),reacted:(e.reactorIDs||[]).includes(m.viewerID)};if(holder.children[i]!==c)holder.insertBefore(c,holder.children[i]||null);});existing.forEach(c=>c.remove());
      }
      visible.forEach(([key],i)=>{const el=this._rows.get(key)?.el;if(el&&this.children[i]!==el)this.insertBefore(el,this.children[i]||null);});
      if(!visible.length){const p=document.createElement('p');p.className='pa-empty';p.textContent='No shared check-ins yet.';this.append(p);}
      if(groups.size>3){const b=document.createElement('button');b.type='button';b.className='pa-more';b.textContent=this._expanded?'Show recent activity':'Earlier activity';b.onclick=()=>{this._expanded=!this._expanded;this.update();};this.append(b);}
    }
  }
  customElements.define('today-party-activity',PartyActivity);
})();
