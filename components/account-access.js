/* State-driven account presentation. The host owns authentication, data and routing. */
(() => {
  const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const button=(label,action,variant='primary',extra='')=>`<today-button block label="${escape(label)}" variant="${variant}" data-account-action="${action}" ${extra}></today-button>`;
  const contexts={
    saved:{eyebrow:'YOUR FIRST HABIT IS SAVED',title:'Keep your day\nwith you.',copy:'Create an account to back up your habits and join a habit party.',skip:'Not now',exit:'Continue to Home'},
    returning:{eyebrow:'WELCOME BACK',title:'A familiar\nplace to start.',copy:'Sign in to your account. You can choose a saved backup before restoring it.',skip:'Back to welcome',exit:'Continue to Home'},
    profile:{eyebrow:'YOUR ACCOUNT',title:'Keep your day\nwith you.',copy:'Back up your habits when you choose, and make room for a little company.',skip:'Not now',exit:'Back to Profile'},
    invitation:{eyebrow:'AN INVITATION FROM MAYA & SAM',title:'A little\ncompany.',copy:'Sign in to respond to your reading party invitation. You’ll review the details before joining.',skip:'Back to invitation',exit:'Review invitation'}
  };
  let serial=0;
  class TodayAccountAccess extends HTMLElement {
    constructor(){super();this.uid=++serial;this.model={context:'saved',step:'choice',phone:'',code:'',dial:'+1',error:'',busy:false,seconds:0,method:'phone',backup:false,linked:false};}
    connectedCallback(){
      if(!this._content){this.innerHTML='<today-onboarding-gradient position="top"></today-onboarding-gradient><div class="aa-content"></div>';this._content=this.lastElementChild;}
      this._abort?.abort();this._abort=new AbortController();const signal=this._abort.signal;
      this.addEventListener('today-activate',e=>{const action=e.target.closest('[data-account-action]')?.dataset.accountAction;if(action){e.stopPropagation();this.request(action);}},{signal});
      this.addEventListener('click',e=>{const el=e.target.closest('button[data-account-action]');if(el)this.request(el.dataset.accountAction);},{signal});
      this.addEventListener('input',e=>{
        if(!e.target.matches('[data-account-field]'))return;
        const field=e.target.dataset.accountField;
        if(field==='code')e.target.value=e.target.value.replace(/\D/g,'').slice(0,6);
        this.model[field]=e.target.value;this.updateActions();
        this.dispatchEvent(new CustomEvent('account-input',{bubbles:true,detail:{field,value:e.target.value}}));
      },{signal});
      this.addEventListener('change',e=>{if(e.target.matches('[data-account-dial]'))this.model.dial=e.target.value;},{signal});
      this.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.matches('input')){e.preventDefault();const action=this.model.step==='phone'?'send':'verify';if(this.valid&&!this.model.busy)this.request(action);}},{signal});
      this._media=matchMedia('(prefers-reduced-motion: reduce)');
      const cancel=()=>{if(this.reduced)this._animation?.cancel();};
      this._media.addEventListener('change',cancel,{signal});
      this._observer=new MutationObserver(cancel);this._observer.observe(document.documentElement,{attributes:true,attributeFilter:['data-reduced','data-motion-override']});
      this.render();
    }
    disconnectedCallback(){this._abort?.abort();this._observer?.disconnect();this._animation?.cancel();}
    get reduced(){return document.documentElement.hasAttribute('data-reduced')||(!document.documentElement.hasAttribute('data-motion-override')&&this._media?.matches);}
    get valid(){return this.model.step==='phone'?/^[0-9]{7,15}$/.test(this.model.phone.replace(/\D/g,'')):/^\d{6}$/.test(this.model.code);}
    request(action){if(this.model.busy&&action!=='back')return;this.dispatchEvent(new CustomEvent('account-request',{bubbles:true,detail:{action,...this.model}}));}
    configure(patch={},focus=false){const old=this.model.step;Object.assign(this.model,patch);if(this._content)this.render(focus,old!==this.model.step);}
    setCountdown(seconds){this.model.seconds=seconds;const target=this.querySelector('[data-account-action=resend]');if(target){target.setAttribute('label',seconds>0?`Resend in ${seconds}s`:'Resend code');target.toggleAttribute('disabled',seconds>0||this.model.busy);}}
    updateActions(){const target=this.querySelector('[data-account-action=send],[data-account-action=verify]');target?.toggleAttribute('disabled',!this.valid||this.model.busy);}
    summary(title,detail,art='open-book'){return `<div class="aa-summary"><today-artwork name="${art}" aria-hidden="true"></today-artwork><div><strong>${escape(title)}</strong><span>${escape(detail)}</span></div></div>`;}
    render(focus=false,animate=false){
      const m=this.model,c=contexts[m.context]||contexts.saved,step=m.step,fieldID=`aa-field-${this.uid}`,errorID=`aa-error-${this.uid}`;
      this.dataset.step=step;this.querySelector('today-onboarding-gradient').position=['data','restore','success'].includes(step)?'bottom':'top';
      const header=`<header class="aa-header">${button('Back','back','quiet','accessible-label="Back"')}<span>${step==='choice'?'Your account':step==='success'?'All set':'Your account'}</span><span class="aa-header-space"></span></header>`;
      const title=(eyebrow,heading,copy)=>`<div class="aa-heading"><p class="aa-eyebrow">${eyebrow}</p><h2 tabindex="-1">${heading.replace(/\n/g,'<br>')}</h2><p class="aa-copy">${copy}</p></div>`;
      const notice=`<p id="${errorID}" class="aa-notice${m.error?' aa-error':''}" role="status">${escape(m.error||(m.busy?'One moment…':''))}</p>`;
      let content='',actions='';
      if(step==='choice'){
        content=`<div class="aa-choice-art" aria-hidden="true"><today-artwork name="${m.context==='invitation'?'open-book':'privacy-lock'}"></today-artwork></div>${title(c.eyebrow,c.title,c.copy)}`;
        actions=`<button type="button" class="aa-apple" data-account-action="apple" ${m.busy?'disabled':''}><span class="aa-apple-mark" aria-hidden="true"></span>Continue with Apple</button>${button('Continue with phone','phone','primary',m.busy?'disabled':'')}${notice}${button(c.skip,'skip','quiet')}<nav class="aa-legal" aria-label="Account information"><a href="today-site-b.html?page=privacy" target="_blank" rel="noopener">Privacy</a><span aria-hidden="true">·</span><a href="today-site-b.html?page=terms" target="_blank" rel="noopener">Terms</a></nav>`;
      }else if(step==='phone'){
        content=title('CONTINUE WITH PHONE','Your number.\nYour way in.','We’ll text you a verification code. No password to remember.')+`<div class="aa-fields"><label class="aa-field-label" for="${fieldID}">Phone number</label><div class="aa-phone-field"><today-dropdown label="Country calling code" data-account-dial value="${escape(m.dial)}"><option value="+1">US / CA +1</option><option value="+44">UK +44</option><option value="+61">AU +61</option></today-dropdown><input id="${fieldID}" data-account-field="phone" type="tel" inputmode="tel" autocomplete="tel-national" placeholder="555 010 0200" value="${escape(m.phone)}" aria-describedby="${errorID}" aria-invalid="${!!m.error}" ${m.busy?'disabled':''}></div><p class="aa-field-help">Only used to sign in. Your number isn’t shown to your party.</p>${notice}</div>`;
        actions=button(m.busy?'Sending code…':'Send code','send','primary')+button('Use Apple instead','apple','quiet',m.busy?'disabled':'');
      }else if(step==='code'){
        const digits=m.phone.replace(/\D/g,''),number=`${m.dial} ••• ••• ${digits.slice(-4)||'0200'}`;
        content=title('CHECK YOUR MESSAGES','A little check.\nThen you’re in.',`Enter the 6-digit code sent to<br><strong>${escape(number)}</strong>.`)+`<div class="aa-fields"><label class="aa-field-label" for="${fieldID}">Verification code</label><input class="aa-code" id="${fieldID}" data-account-field="code" type="text" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6}" maxlength="6" placeholder="000000" value="${escape(m.code)}" aria-describedby="${errorID}" aria-invalid="${!!m.error}" ${m.busy?'disabled':''}>${notice}<div class="aa-code-options">${button(m.seconds?`Resend in ${m.seconds}s`:'Resend code','resend','quiet',m.seconds||m.busy?'disabled':'')}${button('Change number','change','quiet',m.busy?'disabled':'')}</div></div>`;
        actions=button(m.busy?'Checking code…':'Verify & continue','verify','primary');
      }else if(step==='data'){
        content=title('SIGNED IN','Your habits.\nYour choice.',m.context==='returning'?'Choose what you’d like to use on this iPhone.':'Keep the habits on this iPhone with this account?')+this.summary('On this iPhone','Read before bed · 1 habit')+(m.backup?this.summary('Saved backup','3 habits · November 23, 9:41 PM','privacy-lock'):'')+`<p class="aa-field-help">${m.backup?'Nothing changes until you choose. Restoring a backup replaces the habits on this iPhone.':'Connecting keeps your current habits on this iPhone. You can save a backup from Profile.'}</p>${notice}`;
        actions=button(m.busy?'Connecting…':'Keep these habits','associate','primary',m.busy?'disabled':'')+(m.backup?button('Review saved backup','review-restore','secondary',m.busy?'disabled':''):'')+button('Decide later','defer','quiet',m.busy?'disabled':'');
      }else if(step==='restore'){
        content=title('RESTORE A BACKUP','Pick up where\nyou left off.','This will replace the habits on this iPhone with your saved backup.')+this.summary('November 23, 9:41 PM','3 habits · 24 entries','privacy-lock')+`<p class="aa-field-help">Your current “Read before bed” habit won’t be merged into the backup. Go back to keep it instead.</p>${notice}`;
        actions=button(m.busy?'Restoring…':'Restore this backup','restore','primary',m.busy?'disabled':'')+button('Go back','data','quiet',m.busy?'disabled':'');
      }else if(step==='success'){
        content=title(m.method==='apple'?'SIGNED IN WITH APPLE':'PHONE VERIFIED',m.restored?'Welcome\nback.':'Right here.\nReady for you.',m.restored?'Your saved habits are ready on this iPhone.':m.linked?'Your habits are connected to your account. Save a backup whenever you choose in Profile.':'You’re signed in. Your local habits haven’t changed. Connect them whenever you’re ready in Profile.')+(m.context==='invitation'?this.summary('Reading party','Maya & Sam · Invitation waiting'):'');
        actions=button(c.exit,'finish');
      }
      this._content.innerHTML=`${header}<div class="aa-main">${content}</div><footer class="aa-actions">${actions}</footer>`;
      this.updateActions();
      this._animation?.cancel();
      if(animate&&!this.reduced)this._animation=this._content.animate([{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}],{duration:600,easing:'cubic-bezier(.37,0,.18,1)'});
      if(focus){const field=['phone','code'].includes(step)&&!m.busy?this.querySelector('input'):this.querySelector('h2');field?.focus({preventScroll:true});}
    }
  }
  customElements.define('today-account-access',TodayAccountAccess);
})();
