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
      this.paint(`<button type="button" class="hp-entry" data-party-action="open" aria-label="${esc(m.title || 'Read together')}. ${esc(m.summary || 'Open your private party')}">${avatars(members)}<span class="hp-entry-copy"><strong>${esc(m.title || 'Read together')}</strong><span>${esc(m.summary || `${members.length} people · private party`)}</span></span><span class="hp-chevron" aria-hidden="true">›</span></button>`);
    }
  }
  class PartyCheckin extends PartyPiece {
    render(){const m=this.model;
      this.paint(`<article class="hp-checkin"><div class="hp-person"><span class="hp-avatar hp-person-1" aria-hidden="true">${esc(m.initials||'M')}</span><div><strong>${esc(m.name||'Maya')}</strong><span>${esc(m.time||'Today, 8:12 PM')}</span></div><span class="hp-shared-label">Shared</span></div><h4>${esc(m.amount||'Read 5 pages')}</h4><p>${esc(m.note||'A little time with my book.')}</p>${photo(m)}<div class="hp-reactions"><button type="button" data-party-action="react" aria-pressed="${!!m.reacted}" aria-label="${m.reacted?'Remove encouragement':'Send encouragement'}"><span aria-hidden="true">♡</span> ${m.reacted?'You + '+(m.reactions||1):'Cheer on'}${m.reacted?'':' · '+(m.reactions||1)}</button><span>Every little bit counts.</span></div></article>`);
    }
  }
  class PartyComposer extends PartyPiece {
    connectedCallback(){super.connectedCallback();this.addEventListener('change',e=>{if(e.target.matches('input[type=file]')){const file=e.target.files[0];if(file)this.request('photo',{file});}}, {signal:this._abort.signal});}
    render(){const m=this.model,busy=m.state==='sharing',done=m.state==='shared',failed=m.state==='error';
      this.paint(`<div class="hp-composer"><span class="hp-kicker">${done?'Shared with your party':'Your log is saved'}</span><h4>${esc(m.amount||'5 pages logged.')}</h4><p>${done?'A little moment, together.':'Share a moment, if you’d like.'}</p><div class="hp-recipient">${avatars(m.members||[])}<span>Only ${esc((m.members||[]).filter(x=>!x.self).map(x=>x.name).join(' and ')||'your party')} can see this.</span></div>${photo(m)}${!done?`<div class="hp-photo-actions"><label class="hp-file-button">${m.photoURL||m.samplePhoto?'Change photo':'Add a photo'}<input type="file" accept="image/*" ${busy?'disabled':''}></label>${m.photoURL||m.samplePhoto?button('remove-photo','Remove photo','quiet',busy):''}</div>`:''}<p class="hp-error" role="alert" ${failed?'':'hidden'}>Couldn’t share${m.photoURL||m.samplePhoto?' the photo':''}. Your private log is safe.</p><div class="hp-stack">${done?button('new-log','New example','quiet'):button('share',busy?'Sharing…':failed?'Try sharing again':'Share check-in','primary',busy)+button('private','Keep it private','quiet',busy)}</div><p class="hp-status" role="status">${esc(m.message || (done?'Check-in shared.':busy?'Sharing your check-in…':'Photos are optional. Your log already counts.'))}</p></div>`);
    }
  }
  class PartyNudge extends PartyPiece {
    render(){const m=this.model,state=m.state||'available',blocked=state!=='available'&&state!=='error',messages={muted:`${m.name||'Maya'} has nudges off.`,window:`Available during ${m.window||'8–9 PM'}.`,limit:`${m.name||'Maya'} already received a nudge today.`,sending:'Sending…',sent:'A little encouragement, sent.',error:'Couldn’t send. Try again.'};
      this.paint(`<div class="hp-nudge"><span class="hp-kicker">A gentle nudge</span><h4>For ${esc(m.name||'Maya')}</h4><p>${esc(m.window||'8–9 PM')} · their reminder window</p><div class="hp-stack">${button('nudge-reading','Reading tonight?','secondary',blocked)}${button('nudge-encourage','You’ve got this.','secondary',blocked)}</div><p class="hp-status" role="status">${esc(messages[state]||'One incoming nudge per habit, per day.')}</p></div>`);
    }
  }
  class PartyInvite extends PartyPiece {
    render(){const m=this.model,full=m.state==='full',joined=m.state==='joined',busy=m.state==='joining',chosen=m.plan||'pages';
      this.paint(`<div class="hp-invite"><div class="hp-invite-art"><today-artwork name="open-book"></today-artwork></div><span class="hp-kicker">${joined?'You’re in':'Maya invited you'}</span><h4>Read together.<br>At your own pace.</h4><p>A private party for three, including you.</p><div class="hp-recipient">${avatars(m.members||[])}<span>${full?'3 of 3 places filled':joined?'You, Maya and Sam':'Maya + Sam · one place for you'}</span></div><div class="hp-scope"><strong>Only this habit is shared.</strong><p>Share the check-ins and photos you choose. Your other habits, private notes and Today streak stay private.</p></div>${!joined?`<span class="hp-field-label">Your reading plan</span><today-segmented-control label="Your own reading plan" value="${chosen}"><option value="pages">10 pages</option><option value="minutes">15 minutes</option></today-segmented-control><p class="hp-plan-days">Sun, Tue, Thu · you can change this later</p>`:''}<div class="hp-stack">${button('join',full?'Party is full':busy?'Joining…':joined?'Joined':'Join with my plan','primary',full||busy||joined)}${!joined?button('decline','Not now','quiet',busy):''}</div><p class="hp-status" role="status">${esc(m.message||'')}</p></div>`);
      this.querySelector('today-segmented-control')?.addEventListener('change',e=>{e.stopPropagation();this.request('plan',{value:e.detail.value});});
    }
  }
  class PartySettings extends PartyPiece {
    render(){const m=this.model;
      this.paint(`<div class="hp-settings"><h4>A little space, when you need it.</h4><p>Nudges from this party</p><div class="hp-setting-row"><span>Allow gentle nudges</span><today-switch label="Allow party nudges" ${m.allowed!==false?'checked':''}></today-switch></div><div class="hp-scope"><strong>${esc(m.window||'8–9 PM')}</strong><p>Within your reminder window. At most one incoming nudge per habit each day, across both friends.</p></div><p>Your personal reminders stay separate.</p><div class="hp-stack">${button('leave','Leave this party','quiet')}</div><p class="hp-status" role="status">${esc(m.message||'Your private habit and logs stay yours.')}</p></div>`);
      this.querySelector('today-switch').addEventListener('change',e=>{e.stopPropagation();this.request('nudges',{allowed:e.target.checked});});
    }
  }
  for(const [name,ctor] of [['entry',PartyEntry],['checkin',PartyCheckin],['composer',PartyComposer],['nudge',PartyNudge],['invite',PartyInvite],['settings',PartySettings]])customElements.define('today-party-'+name,ctor);
})();
