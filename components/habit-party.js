/* Controlled party UI. Requests do not send, upload or save anything.
   The host supplies confirmed models. See HABIT-PARTIES.md. */
(() => {
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const button = (action, label, variant='secondary', disabled=false) => `<today-button data-party-action="${action}" variant="${variant}" label="${esc(label)}" ${disabled?'disabled':''}></today-button>`;
  const avatars = members => `<span class="hp-avatars" aria-hidden="true">${members.slice(0,3).map((m,i)=>`<span class="hp-avatar hp-person-${i}">${esc(m.initials || m.name.slice(0,1))}</span>`).join('')}</span>`;
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
      this.paint(pin?`<button type="button" class="hp-avatar-pin hp-pin-${m.placement}" data-party-action="open" aria-label="Open reading party with ${esc(members.filter(x=>!x.self).map(x=>x.name).join(' and '))}">${m.placement==='lead'?`<span class="hp-avatar hp-person-1">${esc(members.find(x=>!x.self)?.initials||'MK')}</span><span class="hp-member-count">+${Math.max(0,members.length-1)}</span>`:avatars(members)}${m.placement==='capsule'?'<span>Party <i aria-hidden="true">›</i></span>':''}</button>`:`<button type="button" class="hp-entry" data-party-action="open" aria-label="${esc(m.title || 'Read together')}. ${esc(m.summary || 'Open your private party')}">${avatars(members)}<span class="hp-entry-copy"><strong>${esc(m.title || 'Read together')}</strong><span>${esc(m.summary || `${members.length} people · private party`)}</span></span><span class="hp-chevron" aria-hidden="true">›</span></button>`);
    }
  }
  class PartyCheckin extends PartyPiece {
    render(){const m=this.model,changed=this._reacted!==undefined&&this._reacted!==!!m.reacted;
      const before=this.querySelector('.hp-heart')?getComputedStyle(this.querySelector('.hp-heart')).transform:'scale(1)';
      this._reacted=!!m.reacted;
      this.paint(`<article class="hp-checkin"><div class="hp-person"><span class="hp-avatar hp-person-1" aria-hidden="true">${esc(m.initials||'M')}</span><div><strong>${esc(m.name||'Maya')}</strong><span>${esc(m.time||'Today, 8:12 PM')}</span></div><span class="hp-shared-label">Shared</span></div><h4>${esc(m.amount||'Read 5 pages')}</h4>${m.note?`<p>${esc(m.note)}</p>`:''}${photo(m)}<div class="hp-reactions"><button type="button" data-party-action="react" aria-pressed="${!!m.reacted}" aria-label="${m.reacted?'Remove like':'Like this check-in'}"><span class="hp-heart-wrap" aria-hidden="true"><span class="hp-heart-ring"></span><svg class="hp-heart" viewBox="0 0 24 24"><path d="M12 20.2S3 14.6 3 8.5C3 3.5 9 2.1 12 6.3C15 2.1 21 3.5 21 8.5C21 14.6 12 20.2 12 20.2Z"/></svg></span><span>${m.reacted?'Liked':'Like'}</span><span class="hp-reaction-count">${(m.reactions||0)+(m.reacted?1:0)}</span></button></div></article>`);
      if(changed&&!document.documentElement.hasAttribute('data-reduced')&&!matchMedia('(prefers-reduced-motion:reduce)').matches){
        this.querySelector('.hp-heart').animate([{transform:before==='none'?'scale(1)':before},{transform:m.reacted?'scale(.82)':'scale(.92)',offset:.16},{transform:m.reacted?'scale(1.18)':'scale(1.04)',offset:.48},{transform:'scale(1)'}],{duration:m.reacted?620:360,easing:'cubic-bezier(.22,.8,.24,1)'});
        if(m.reacted)this.querySelector('.hp-heart-ring').animate([{transform:'scale(.7)',opacity:.5},{transform:'scale(1.8)',opacity:0}],{duration:600,easing:'cubic-bezier(.22,.8,.24,1)'});
        this.querySelector('.hp-reaction-count').animate([{opacity:.3,transform:`translateY(${m.reacted?5:-5}px)`},{opacity:1,transform:'translateY(0)'}],{duration:320,easing:'ease-out'});
      }
    }
  }
  class PartyComposer extends PartyPiece {
    connectedCallback(){super.connectedCallback();this.addEventListener('change',e=>{if(e.target.matches('input[type=file]')){const file=e.target.files[0];if(file)this.request('photo',{file});}}, {signal:this._abort.signal});}
    render(){const m=this.model,busy=m.state==='uploading',failed=m.state==='photo-error',hasPhoto=!!(m.photoURL||m.samplePhoto),saved=m.state==='photo-saved',syncError=m.state==='sync-error';
      this.paint(`<div class="hp-composer"><div class="hp-composer-heading"><span class="hp-saved-mark" aria-hidden="true">✓</span><div><h4>${esc(m.amount||'5 pages logged')}</h4><span>${syncError?'Waiting to share':'Shared with '+esc((m.members||[]).filter(x=>!x.self).map(x=>x.name).join(' & ')||'your party')}</span></div></div>${hasPhoto?`<div class="hp-photo-preview">${photo(m)}${!busy?button('remove-photo','Remove','quiet'):''}</div>`:''}<label class="hp-file-button ${hasPhoto?'hp-file-replace':''}"><span class="hp-photo-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="4"/><circle cx="9" cy="9" r="1.5"/><path d="m4 17 5-5 3 3 3-4 5 6"/></svg></span><span><strong>${hasPhoto?'Choose a different photo':'Add a photo'}</strong>${hasPhoto?'':'<small>Choose from photos</small>'}</span><span class="hp-photo-plus" aria-hidden="true">+</span><input aria-label="${hasPhoto?'Choose a different photo':'Add a photo'}" type="file" accept="image/*" ${busy?'disabled':''}></label>${failed?'<p class="hp-error" role="alert">Photo upload failed. Your log is already shared.</p>':''}${syncError?'<p class="hp-error" role="alert">Your log is saved. Sharing will retry when connected.</p>':''}<div class="hp-stack">${syncError?button('retry-sync','Retry sharing','primary'):hasPhoto&&!saved?button('share',busy?'Adding photo…':failed?'Retry photo':'Add photo to check-in','primary',busy):''}</div>${m.message||saved?`<p class="hp-status" role="status">${esc(m.message||(saved?'Photo added.':''))}</p>`:''}</div>`);
    }
  }
  class PartyNudge extends PartyPiece {
    render(){const m=this.model,state=m.state||'available',blocked=state!=='available'&&state!=='error',messages={muted:`${m.name||'Maya'} has nudges off.`,window:`Available during ${m.window||'8–9 PM'}.`,limit:`${m.name||'Maya'} already received a nudge today.`,sending:'Sending…',sent:'Nudge sent.',error:'Couldn’t send. Try again.'};
      this.paint(`<div class="hp-nudge"><span class="hp-kicker">A gentle nudge</span><h4>For ${esc(m.name||'Maya')}</h4><p>${esc(m.window||'8–9 PM')} · their reminder window</p><div class="hp-stack">${button('nudge-reading','Reading tonight?','secondary',blocked)}${button('nudge-encourage','You’ve got this.','secondary',blocked)}</div><p class="hp-status" role="status">${esc(messages[state]||'One incoming nudge per habit, per day.')}</p></div>`);
    }
  }
  class PartyInvite extends PartyPiece {
    render(){const m=this.model,full=m.state==='full',joined=m.state==='joined',busy=m.state==='joining',chosen=m.plan||'pages',v=this.getAttribute('variant')||'a';
      const hero=v==='b'?`<div class="hp-invite-cover"><span class="hp-invite-tag">READING PARTY</span><today-artwork name="open-book"></today-artwork><h4>A book.<br>Some company.</h4><span>Maya & Sam invited you</span></div>`:v==='c'?`<div class="hp-invite-orbit"><div class="hp-orbit-line"></div><today-artwork name="open-book"></today-artwork><span class="hp-orbit-person one">MK<small>Maya</small></span><span class="hp-orbit-person two">SL<small>Sam</small></span><span class="hp-orbit-person you">You</span></div><h4>There’s a place<br>for you.</h4><p>Read with Maya & Sam.</p>`:`<div class="hp-invite-letter"><div class="hp-letter-from">${avatars(m.members||[])}<span>From Maya & Sam</span></div><div class="hp-invite-art"><today-artwork name="open-book"></today-artwork></div><h4>Want to read<br>with us?</h4><p>“I’m making time for a few pages.<br>Join me?” <span>— Maya</span></p></div>`;
      this.paint(`<div class="hp-invite hp-invite-${v}">${hero}<div class="hp-invite-capacity"><span>${full?'3 of 3 places filled':joined?'You, Maya & Sam':'2 people · 1 open place'}</span>${joined?'<strong>Joined</strong>':''}</div><div class="hp-scope"><strong>Your plan. Shared logs.</strong><p>Reading logs are shared with the party. Add photos if you like. Other habits, notes and your Today streak stay private.</p></div>${!joined?`<span class="hp-field-label">Your reading plan</span><today-segmented-control label="Your own reading plan" value="${chosen}"><option value="pages">10 pages</option><option value="minutes">15 minutes</option></today-segmented-control><p class="hp-plan-days">Sun, Tue, Thu</p>`:''}<div class="hp-stack">${button('join',full?'Party is full':busy?'Joining…':joined?'Joined':'Join reading party','primary',full||busy||joined)}${!joined?button('decline','Not now','quiet',busy):''}</div>${m.message?`<p class="hp-status" role="status">${esc(m.message)}</p>`:''}</div>`);
      this.querySelector('today-segmented-control')?.addEventListener('change',e=>{e.stopPropagation();this.request('plan',{value:e.detail.value});});
    }
  }
  class PartySettings extends PartyPiece {
    render(){const m=this.model;
      this.paint(`<div class="hp-settings"><h4>Party settings</h4><p>Nudges from this party</p><div class="hp-setting-row"><span>Allow gentle nudges</span><today-switch label="Allow party nudges" ${m.allowed!==false?'checked':''}></today-switch></div><div class="hp-scope"><strong>${esc(m.window||'8–9 PM')}</strong><p>Within your reminder window. At most one incoming nudge per habit each day, across both friends.</p></div><p>Your personal reminders stay separate.</p><div class="hp-stack">${button('leave','Leave this party','quiet')}</div><p class="hp-status" role="status">${esc(m.message||'Other habits and notes stay private.')}</p></div>`);
      this.querySelector('today-switch').addEventListener('change',e=>{e.stopPropagation();this.request('nudges',{allowed:e.target.checked});});
    }
  }
  for(const [name,ctor] of [['entry',PartyEntry],['checkin',PartyCheckin],['composer',PartyComposer],['nudge',PartyNudge],['invite',PartyInvite],['settings',PartySettings]])customElements.define('today-party-'+name,ctor);
})();
