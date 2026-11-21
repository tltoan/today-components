/* Controlled party UI. Requests do not send, upload or save anything.
   The host supplies confirmed models. See HABIT-PARTIES.md. */
(() => {
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const button = (action, label, variant='secondary', disabled=false) => `<today-button data-party-action="${action}" variant="${variant}" label="${esc(label)}" ${disabled?'disabled':''}></today-button>`;
  const avatars = members => `<today-avatar-stack members="${esc(JSON.stringify(members))}" aria-hidden="true"></today-avatar-stack>`;
  const sample = () => '<div class="hp-photo hp-sample-photo" role="img" aria-label="Illustrated sample attachment: an open book"><today-artwork name="open-book"></today-artwork><span>Sample attachment</span></div>';
  const photo = m => m.samplePhoto ? sample() : m.photoURL && /^(blob:|data:image\/)/.test(m.photoURL) ? `<img class="hp-photo" src="${esc(m.photoURL)}" alt="${esc(m.photoAlt || 'Photo attached to this check-in')}">` : '';
  class PartyPiece extends HTMLElement {
    connectedCallback(){
      if(this._connected)return;this._connected=true;
      this._abort=new AbortController();
      this.addEventListener('today-activate',e=>{const a=e.target.dataset.partyAction;if(a){e.stopPropagation();this.request(a);}}, {signal:this._abort.signal});
      this.addEventListener('click',e=>{const a=e.target.closest('button[data-party-action]');if(a)this.request(a.dataset.partyAction);}, {signal:this._abort.signal});
      this.render();
    }
    disconnectedCallback(){this._connected=false;this._abort?.abort();}
    set model(value){this._model=structuredClone(value);if(this._connected)this.render();}
    get model(){return structuredClone(this._model || {});}
    request(action,extra={}){this.dispatchEvent(new CustomEvent('party-request',{bubbles:true,detail:{action,id:this._model?.id,...extra}}));}
    paint(html){const action=this.contains(document.activeElement)?document.activeElement.closest('[data-party-action]')?.dataset.partyAction:null;this.innerHTML=html;if(action)this.querySelector(`[data-party-action="${action}"] button,button[data-party-action="${action}"]`)?.focus({preventScroll:true});}
  }
  class PartyEntry extends PartyPiece {
    render(){const m=this.model, members=m.members||[];
      const pin=['stack','capsule','lead'].includes(m.placement);
      this.paint(pin?`<button type="button" class="hp-avatar-pin hp-pin-${m.placement}" data-party-action="open" aria-label="Open reading party with ${esc(members.filter(x=>!x.self).map(x=>x.name).join(' and '))}">${m.placement==='lead'?`<today-lead-avatar members="${esc(JSON.stringify(members))}" aria-hidden="true"></today-lead-avatar>`:avatars(members)}${m.placement==='capsule'?'<span>Party <i aria-hidden="true">›</i></span>':''}</button>`:`<button type="button" class="hp-entry" data-party-action="open" aria-label="${esc(m.title || 'Read together')}. ${esc(m.summary || 'Open your private party')}">${avatars(members)}<span class="hp-entry-copy"><strong>${esc(m.title || 'Read together')}</strong><span>${esc(m.summary || `${members.length} people · private party`)}</span></span><span class="hp-chevron" aria-hidden="true">›</span></button>`);
    }
  }
  class PartyCheckin extends PartyPiece {
    render(){const m=this.model,{reacted,reactors,reactorIDs,viewer,...content}=m,key=JSON.stringify(content);
      if(this._contentKey!==key||!this.querySelector('today-party-reactions')){
        this._contentKey=key;
        this.paint(`<article class="hp-checkin"><div class="hp-person"><today-profile-avatar size="32" person="${esc(JSON.stringify({id:m.memberID||m.name||'Maya',name:m.name||'Maya',initials:m.initials||'M',photoURL:m.profilePhotoURL}))}" aria-hidden="true"></today-profile-avatar><div><strong>${esc(m.name||'Maya')}</strong><span>${esc(m.time||'Today, 8:12 PM')}</span></div><span class="hp-shared-label">Shared</span></div><h4>${esc(m.amount||'Read 5 pages')}</h4>${m.note?`<p>${esc(m.note)}</p>`:''}${photo(m)}<today-party-reactions></today-party-reactions></article>`);
      }
      this.querySelector('today-party-reactions').model={id:m.id,reacted:!!reacted,reactors:reactors||[],viewer};
    }
  }
  class PartyComposer extends PartyPiece {
    connectedCallback(){super.connectedCallback();this.addEventListener('change',e=>{if(e.target.matches('input[type=file]')){const file=e.target.files[0];if(file)this.request('photo',{file});}}, {signal:this._abort.signal});}
    render(){const m=this.model,busy=m.state==='uploading',failed=m.state==='photo-error',hasPhoto=!!(m.photoURL||m.samplePhoto),saved=m.state==='photo-saved',syncError=m.state==='sync-error';
      this.paint(`<div class="hp-composer"><div class="hp-composer-heading"><span class="hp-saved-mark" aria-hidden="true">✓</span><div><h4>${esc(m.amount||'5 pages logged')}</h4><span>${syncError?'Waiting to share':'Shared with '+esc((m.members||[]).filter(x=>!x.self).map(x=>x.name).join(' & ')||'your party')}</span></div></div>${hasPhoto?`<div class="hp-photo-preview">${photo(m)}${!busy?button('remove-photo','Remove','quiet'):''}</div>`:''}<label class="hp-file-button ${hasPhoto?'hp-file-replace':''}"><span class="hp-photo-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="4"/><circle cx="9" cy="9" r="1.5"/><path d="m4 17 5-5 3 3 3-4 5 6"/></svg></span><span><strong>${hasPhoto?'Choose a different photo':'Add a photo'}</strong>${hasPhoto?'':'<small>Choose from photos</small>'}</span><span class="hp-photo-plus" aria-hidden="true">+</span><input aria-label="${hasPhoto?'Choose a different photo':'Add a photo'}" type="file" accept="image/*" ${busy?'disabled':''}></label>${failed?'<p class="hp-error" role="alert">Photo upload failed. Your log is already shared.</p>':''}${syncError?'<p class="hp-error" role="alert">Your log is saved. Sharing will retry when connected.</p>':''}<div class="hp-stack">${syncError?button('retry-sync','Retry sharing','primary'):hasPhoto&&!saved?button('share',busy?'Adding photo…':failed?'Retry photo':'Add photo to check-in','primary',busy):''}</div>${m.message||saved?`<p class="hp-status" role="status">${esc(m.message||(saved?'Photo added.':''))}</p>`:''}</div>`);
    }
  }
  class PartyInvite extends PartyPiece {
    render(){const m=this.model,full=m.state==='full'||(m.members||[]).length>=4&&m.state!=='joined',joined=m.state==='joined',busy=m.state==='joining',chosen=m.plan||'pages',v=this.getAttribute('variant')||'b',count=(m.members||[]).length,places=Math.max(0,4-count);
      if(v==='b'){
        const people=(m.members||[]).filter(person=>!person.self);
        const names=people.map(person=>person.name).join(' & ');
        this.paint(`<div class="hp-invite hp-invite-b hp-invite-brief"><div class="hp-invite-cover"><span class="hp-invite-tag">READING PARTY</span><today-artwork name="open-book"></today-artwork><h4>A book.<br>Some company.</h4><span class="hp-brief-from">${esc(names||'Your friends')} invited you</span><div class="hp-cover-people">${avatars(people)}</div></div><dl class="hp-invite-facts"><div><dt>Schedule</dt><dd>${esc(m.schedule||'To be confirmed')}</dd></div><div><dt>Proposed dates</dt><dd>${esc(m.proposedDates||'To be confirmed')}</dd></div></dl><div class="hp-invite-targets"><span class="hp-field-label">Personal targets · per session</span>${people.map(person=>`<div><span>${esc(person.name)}</span><strong>${esc(person.target||'Not set yet')}</strong></div>`).join('')}</div>${!joined?`<label class="hp-field-label">Your target</label><today-segmented-control label="Your own reading plan" value="${chosen}"><option value="pages">10 pages</option><option value="minutes">15 minutes</option></today-segmented-control>`:''}<p class="hp-invite-scope-line">Only this habit’s logs are shared. Photos are optional.</p><div class="hp-stack">${button('join',full?'Party is full':busy?'Joining…':joined?'Joined':'Join reading party','primary',full||busy||joined)}${!joined?button('decline','Not now','quiet',busy):''}</div><p class="hp-invite-footnote">${full?'4 of 4 places filled':joined?'Your plan is ready':`${count}/4 joined · ${places} ${places===1?'place':'places'} open`}</p>${m.message?`<p class="hp-status" role="status">${esc(m.message)}</p>`:''}</div>`);
        this.querySelector('today-segmented-control')?.addEventListener('change',e=>{e.stopPropagation();this.request('plan',{value:e.detail.value});});
        return;
      }
      const seats=Array.from({length:4},(_,i)=>{const person=m.members?.[i];return person?`<div class="hp-circle-seat"><today-profile-avatar size="44" person="${esc(JSON.stringify(person))}" aria-hidden="true"></today-profile-avatar><span>${esc(person.name)}</span></div>`:`<div class="hp-circle-seat hp-seat-open"><span class="hp-seat-outline" aria-hidden="true">+</span><span>Open</span></div>`;}).join('');
      const hero=v==='d'?`<div class="hp-invite-layered"><span class="hp-invite-tag">READING PARTY</span><today-artwork name="open-book"></today-artwork><h4>Read with<br>Maya & Sam.</h4><div class="hp-layered-footer"><span>You’re invited</span>${avatars(m.members||[])}</div></div>`:v==='e'?`<div class="hp-invite-circle"><span class="hp-invite-tag">YOU’RE INVITED</span><div class="hp-circle-art"><today-artwork name="open-book"></today-artwork></div><h4>Join our<br>reading party.</h4><p>From Maya & Sam</p><div class="hp-circle-seats" aria-label="Party places">${seats}</div></div>`:v==='b'?`<div class="hp-invite-cover"><span class="hp-invite-tag">READING PARTY</span><today-artwork name="open-book"></today-artwork><h4>A book.<br>Some company.</h4><span>Maya & Sam invited you</span><div class="hp-cover-people">${avatars(m.members||[])}</div></div>`:v==='c'?`<div class="hp-invite-orbit"><div class="hp-orbit-line"></div><today-artwork name="open-book"></today-artwork><span class="hp-orbit-person one">MK<small>Maya</small></span><span class="hp-orbit-person two">SL<small>Sam</small></span><span class="hp-orbit-person you">You</span></div><h4>There’s a place<br>for you.</h4><p>Read with Maya & Sam.</p>`:`<div class="hp-invite-letter"><div class="hp-letter-from">${avatars(m.members||[])}<span>From Maya & Sam</span></div><div class="hp-invite-art"><today-artwork name="open-book"></today-artwork></div><h4>Want to read<br>with us?</h4><p>“I’m making time for a few pages.<br>Join me?” <span>— Maya</span></p></div>`;
      this.paint(`<div class="hp-invite hp-invite-${v}">${hero}<div class="hp-invite-capacity"><span>${full?'4 of 4 places filled':joined?(m.members||[]).map(x=>esc(x.name)).join(', '):`${count} ${count===1?'person':'people'} · ${places} ${places===1?'open place':'open places'}`}</span>${joined?'<strong>Joined</strong>':''}</div><div class="hp-scope"><strong>Shared days. Your own target.</strong><p>Everyone follows the party’s schedule. Choose your own target and reminder. Logs are shared; photos are optional. Other habits, notes and your Today streak stay private.</p></div>${!joined?`<span class="hp-field-label">Your reading plan</span><today-segmented-control label="Your own reading plan" value="${chosen}"><option value="pages">10 pages</option><option value="minutes">15 minutes</option></today-segmented-control><p class="hp-plan-days">Party schedule: Sun, Tue, Thu</p>`:''}<div class="hp-stack">${button('join',full?'Party is full':busy?'Joining…':joined?'Joined':'Join reading party','primary',full||busy||joined)}${!joined?button('decline','Not now','quiet',busy):''}</div>${m.message?`<p class="hp-status" role="status">${esc(m.message)}</p>`:''}</div>`);
      this.querySelector('today-segmented-control')?.addEventListener('change',e=>{e.stopPropagation();this.request('plan',{value:e.detail.value});});
    }
  }
  class PartySettings extends PartyPiece {
    render(){const m=this.model;
      this.paint(`<div class="hp-settings"><h4>Party settings</h4><p>Nudges from this party</p><div class="hp-setting-row"><span>Allow gentle nudges</span><today-switch label="Allow party nudges" ${m.allowed!==false?'checked':''}></today-switch></div><div class="hp-scope"><strong>${esc(m.window||'8–9 PM')}</strong><p>Within your reminder window. At most one incoming nudge per habit each day, across the party.</p></div><p>Your personal reminders stay separate.</p><div class="hp-stack">${button('leave','Leave this party','quiet')}</div><p class="hp-status" role="status">${esc(m.message||'Other habits and notes stay private.')}</p></div>`);
      this.querySelector('today-switch').addEventListener('change',e=>{e.stopPropagation();this.request('nudges',{allowed:e.target.checked});});
    }
  }
  for(const [name,ctor] of [['entry',PartyEntry],['checkin',PartyCheckin],['composer',PartyComposer],['invite',PartyInvite],['settings',PartySettings]])customElements.define('today-party-'+name,ctor);
})();
