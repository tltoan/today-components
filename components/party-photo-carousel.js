/* Controlled, per-entry photo check-ins. No uploads, storage or optimistic saves.
   Shares Today's SnapScroller, profile avatars, reactions and disclosure motion. */
(() => {
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const reduced=()=>document.documentElement.hasAttribute('data-reduced')||(!document.documentElement.hasAttribute('data-motion-override')&&matchMedia('(prefers-reduced-motion:reduce)').matches);
  const photoURL=value=>typeof value==='string'&&/^(https?:\/\/|blob:|data:image\/|(?:\.\/)?assets\/)/i.test(value)?value:'';
  const dateLabel=date=>new Date(date+'T12:00:00Z').toLocaleDateString('en-US',{month:'short',day:'numeric',timeZone:'UTC'});
  const quantity=e=>e.unit==='check'?(e.amount===0?'Recorded zero':'Logged'):`${e.amount.toLocaleString('en-US')} ${e.unit||''}`.trim();
  class PartyPhotoCarousel extends HTMLElement {
    static observedAttributes=['variant'];
    get variant(){return ['caption','overlay','filmstrip'].includes(this.getAttribute('variant'))?this.getAttribute('variant'):'overlay';}
    set model(value){this._model=structuredClone(value||{});if(this.isConnected)this.update();}
    get model(){return structuredClone(this._model||{});}
    connectedCallback(){if(!this.hasAttribute('variant'))this.setAttribute('variant','overlay');this.build();this.update();}
    disconnectedCallback(){this._snap?.destroy();this._resize?.disconnect();this._observer?.disconnect();this._media?.removeEventListener('change',this._motionChanged);this._ready=false;}
    attributeChangedCallback(){if(this.isConnected&&this._ready)this.update();}
    build(){
      if(this._ready)return;this._ready=true;
      this._signature=this._thumbnailSignature=this._reactionSignature=this._logSignature=null;
      this.innerHTML=`<div class="pp-toolbar"><span class="pp-date"></span><div class="pp-arrows"><button type="button" data-previous aria-label="Previous photo">←</button><button type="button" data-next aria-label="Next photo">→</button></div></div><div class="pp-viewport" tabindex="0" role="region" aria-roledescription="carousel" aria-label="Photo check-ins. Swipe or use left and right arrow keys."><div class="pp-track"></div></div><div class="pp-empty" hidden><span>No photos shared yet.</span><small>Check-ins still count without a photo.</small></div><div class="pp-thumbnails" role="group" aria-label="Choose a check-in photo"></div><div class="pp-bottom"><today-party-reactions variant="stack"></today-party-reactions><span class="pp-position" role="status" aria-live="polite" aria-atomic="true"></span></div><button class="pp-logs-toggle" type="button" aria-expanded="false"><span></span><span class="today-disclosure__chevron" aria-hidden="true">⌄</span></button><div class="pp-logs"><div><div class="pp-log-list"></div></div></div>`;
      this._viewport=this.querySelector('.pp-viewport');this._track=this.querySelector('.pp-track');
      this._disclosure=new TodayUI.Disclosure(this.querySelector('.pp-logs'),{trigger:this.querySelector('.pp-logs-toggle')});
      this.querySelector('.pp-logs-toggle').onclick=()=>this._disclosure.toggle();
      this._snap=new TodayUI.SnapScroller(this._viewport,{selector:'.pp-slide',axis:'x',fade:false,interactiveDrag:true,reducedMotion:reduced,onSelect:i=>this.select(i)});
      this.querySelector('[data-previous]').onclick=()=>this._snap.goTo((this._snap.frame?this._snap.targetIndex:this._snap.index)-1);
      this.querySelector('[data-next]').onclick=()=>this._snap.goTo((this._snap.frame?this._snap.targetIndex:this._snap.index)+1);
      let width=0;
      this._resize=new ResizeObserver(()=>{const next=this._viewport.clientWidth;if(next&&next!==width){width=next;this._snap.refresh(this._snap.index);}});this._resize.observe(this._viewport);
      this._motionChanged=()=>{if(reduced())this._snap.settleImmediately();};
      this._media=matchMedia('(prefers-reduced-motion:reduce)');this._media.addEventListener('change',this._motionChanged);
      this._observer=new MutationObserver(this._motionChanged);this._observer.observe(document.documentElement,{attributes:true,attributeFilter:['data-reduced','data-motion-override']});
    }
    person(entry){return this._model.members.find(p=>p.id===entry.memberID);}
    stamp(entry){return [dateLabel(entry.date),entry.time].filter(Boolean).join(' · ');}
    makeSlide(entry){
      const slide=document.createElement('article');slide.className='pp-slide';slide.dataset.entry=entry.id;slide.setAttribute('role','group');slide.setAttribute('aria-roledescription','slide');
      slide.innerHTML='<div class="pp-picture"><img class="pp-photo" draggable="false" decoding="async"><span class="pp-image-fallback" hidden>Photo unavailable</span></div><div class="pp-caption"><today-profile-avatar size="36" still aria-hidden="true"></today-profile-avatar><div class="pp-person"><strong></strong><span></span></div><strong class="pp-amount"></strong></div>';
      const image=slide.querySelector('.pp-photo'),fallback=slide.querySelector('.pp-image-fallback');
      image.onload=()=>{image.hidden=false;fallback.hidden=true;slide.classList.remove('pp-unavailable');};
      image.onerror=()=>{image.hidden=true;fallback.hidden=false;slide.classList.add('pp-unavailable');};
      return slide;
    }
    paintSlide(slide,entry,index){
      const person=this.person(entry),avatar=slide.querySelector('today-profile-avatar'),serialized=JSON.stringify(person);
      if(avatar.dataset.person!==serialized){avatar.dataset.person=serialized;avatar.person=person;}
      slide.querySelector('.pp-person strong').textContent=person.name;
      slide.querySelector('.pp-person span').textContent=entry.time||dateLabel(entry.date);
      slide.querySelector('.pp-amount').textContent=quantity(entry);
      slide.setAttribute('aria-label',`${index+1} of ${this._photos.length}: ${person.name}, ${quantity(entry)}, ${this.stamp(entry)}`);
      const image=slide.querySelector('.pp-photo'),src=photoURL(entry.photoURL);
      image.alt=entry.photoAlt||'Photo attached to this check-in';
      if(image.getAttribute('src')!==src){image.hidden=false;slide.querySelector('.pp-image-fallback').hidden=true;slide.classList.remove('pp-unavailable');image.src=src;}
    }
    update(){
      this.build();const m=this._model;if(!m?.today||!Array.isArray(m.members))return;
      const seen=new Set();
      this._entries=(m.entries||[]).filter(e=>{
        const valid=e.id&&!seen.has(e.id)&&/^\d{4}-\d{2}-\d{2}$/.test(e.date)&&e.date<=m.today&&Number.isFinite(e.amount)&&e.amount>=0&&e.saved!==false&&m.members.some(p=>p.id===e.memberID)&&(!m.memberID||m.memberID===e.memberID);
        if(valid)seen.add(e.id);return valid;
      }).sort((a,b)=>b.date.localeCompare(a.date)||(b.order||0)-(a.order||0));
      this._photos=this._entries.filter(e=>photoURL(e.photoURL));
      const signature=JSON.stringify(this._photos.map(e=>e.id)),changed=signature!==this._signature;this._signature=signature;
      const existing=new Map([...this._track.children].map(slide=>[slide.dataset.entry,slide]));
      this._photos.forEach((entry,i)=>{
        const slide=existing.get(entry.id)||this.makeSlide(entry);existing.delete(entry.id);this.paintSlide(slide,entry,i);
        if(this._track.children[i]!==slide)this._track.insertBefore(slide,this._track.children[i]||null);
      });
      existing.forEach(slide=>{if(slide.contains(document.activeElement))this._viewport.focus({preventScroll:true});slide.remove();});
      const index=Math.max(0,this._photos.findIndex(e=>e.id===this._activeID));
      this._viewport.hidden=!this._photos.length;this.querySelector('.pp-empty').hidden=!!this._photos.length;
      this.querySelector('.pp-arrows').hidden=this._photos.length<2;
      this.querySelector('.pp-bottom').hidden=!this._photos.length;
      const thumbs=this.querySelector('.pp-thumbnails');thumbs.hidden=this.variant!=='filmstrip'||this._photos.length<2;
      const thumbnailSignature=JSON.stringify(this._photos.map(e=>[e.id,e.photoURL,this.person(e).name,quantity(e),e.date]));
      if(thumbnailSignature!==this._thumbnailSignature){
        this._thumbnailSignature=thumbnailSignature;
        const focused=thumbs.contains(document.activeElement)?document.activeElement.dataset.entry:null;
        thumbs.innerHTML=this._photos.map((e,i)=>`<button type="button" data-entry="${esc(e.id)}" aria-label="${esc(`Show ${this.person(e).name}, ${quantity(e)}, ${dateLabel(e.date)}`)}"><img src="${esc(photoURL(e.photoURL))}" alt="" draggable="false"><span>${i+1}</span></button>`).join('');
        thumbs.querySelectorAll('button').forEach((b,i)=>b.onclick=()=>this._snap.goTo(i));
        thumbs.querySelectorAll('img').forEach(img=>img.onerror=()=>img.hidden=true);
        if(focused)thumbs.querySelector(`[data-entry="${CSS.escape(focused)}"]`)?.focus({preventScroll:true});
      }
      this.paintLogs();
      if(changed)this._snap.refresh(index);else this.select(this._snap.index);
      if(!this._photos.length)this.select(0);
    }
    select(index){
      const entry=this._photos?.[index];this._activeID=entry?.id||null;
      this.querySelector('.pp-date').textContent=entry?(entry.date===this._model.today?'Today':dateLabel(entry.date)):'Shared check-ins';
      this.querySelector('[data-previous]').disabled=index===0;
      this.querySelector('[data-next]').disabled=!entry||index===this._photos.length-1;
      this.querySelector('.pp-position').textContent=entry?`${index+1} / ${this._photos.length}`:'';
      [...this._track.children].forEach((slide,i)=>{slide.inert=i!==index;slide.setAttribute('aria-hidden',String(i!==index));});
      this.querySelectorAll('.pp-thumbnails button').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));
      if(!entry)return;
      const m=this._model,reactions=this.querySelector('today-party-reactions');
      const value={id:entry.id,viewer:m.members.find(p=>p.id===m.viewerID),reactors:m.members.filter(p=>(entry.reactorIDs||[]).includes(p.id)),reacted:(entry.reactorIDs||[]).includes(m.viewerID)},signature=JSON.stringify(value);
      if(signature!==this._reactionSignature){this._reactionSignature=signature;reactions.model=value;}
    }
    paintLogs(){
      const entries=this._entries.filter(e=>!photoURL(e.photoURL)),toggle=this.querySelector('.pp-logs-toggle');
      toggle.hidden=!entries.length;toggle.querySelector('span').textContent=`Check-ins without photos · ${entries.length}`;
      if(!entries.length)this._disclosure.setOpen(false);
      const signature=JSON.stringify(entries.map(e=>[e.id,e.amount,e.unit,e.date,e.time,this.person(e)]));
      if(signature===this._logSignature)return;this._logSignature=signature;
      this.querySelector('.pp-log-list').innerHTML=entries.map(e=>`<article class="pp-log"><today-profile-avatar size="28" still person="${esc(JSON.stringify(this.person(e)))}" aria-hidden="true"></today-profile-avatar><div><strong>${esc(this.person(e).name)}</strong><span>${esc(this.stamp(e))}</span></div><strong>${esc(quantity(e))}</strong></article>`).join('');
    }
  }
  customElements.define('today-party-photo-carousel',PartyPhotoCarousel);
})();
