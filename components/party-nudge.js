/* Controlled nudge UI. The host checks eligibility and sends; this element never sends a notification. */
(() => {
  const reduced=()=>document.documentElement.hasAttribute('data-reduced')||(!document.documentElement.hasAttribute('data-motion-override')&&matchMedia('(prefers-reduced-motion: reduce)').matches);
  class PartyNudge extends HTMLElement {
    connectedCallback(){if(this._ready)return;this._ready=true;this._choice='reading';this.build();}
    disconnectedCallback(){this._ready=false;this._animations?.forEach(a=>a.cancel());}
    get model(){return structuredClone(this._model||{});}
    set model(v){
      const prev=this._model?.state;this._model=structuredClone(v||{});this._requested=false;
      if(this._ready){this.update();const state=this.model.state;
        if(prev!==state){
          this._animations?.forEach(a=>a.cancel());
          this.querySelector('today-target-feedback').setMet(state==='sent',{animate:prev==='sent'||prev==='sending'&&state==='sent'});
          if(prev==='sending'&&state==='sent')this.confirm();
        }
      }
    }
    build(){
      const variant=['card','pulse','compact'].includes(this.getAttribute('variant'))?this.getAttribute('variant'):'card';this.dataset.layout=variant;
      this.dataset.interaction=this.getAttribute('interaction')==='button'?'button':'slide';
      const action=this.dataset.interaction==='button'?`<button class="pn-send" type="button"><span class="pn-send-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span><span class="pn-label">Send nudge</span><span class="pn-check"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 12 4 4 8-9"/></svg></span></button>`:'<today-slide-log class="pn-slider" mode="send"></today-slide-log>';
      this.innerHTML=`<div class="pn-surface"><today-target-feedback variant="wash"></today-target-feedback><div class="pn-recipient"><span class="pn-avatar"><today-profile-avatar size="48" aria-hidden="true"></today-profile-avatar><i></i></span><div><strong class="pn-name"></strong><span class="pn-window"></span></div><span class="pn-kind">Nudge</span></div><div class="pn-messages" role="radiogroup" aria-label="Nudge message"><button type="button" role="radio" data-message="reading">Reading tonight?</button><button type="button" role="radio" data-message="encourage">You’ve got this.</button></div><p class="pn-message">Reading tonight?</p>${action}<p class="pn-status" role="status" aria-live="polite"></p></div>`;
      this.querySelectorAll('[data-message]').forEach(b=>b.addEventListener('click',()=>{if(!this.available)return;this._choice=b.dataset.message;this.update();}));
      this.querySelector('.pn-messages').addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)||!this.available)return;e.preventDefault();this._choice=this._choice==='reading'?'encourage':'reading';this.update();this.querySelector(`[data-message=${this._choice}]`).focus();});
      this.querySelector('.pn-slider')?.addEventListener('slide-request',e=>{e.stopPropagation();this.send();});
      this.querySelector('.pn-send')?.addEventListener('click',()=>this.send());
      this.update();this.querySelector('today-target-feedback').setMet(this.model.state==='sent');
    }
    send(){
      if(!this.available||this._requested)return;this._requested=true;
      // Both interactions latch before the request; only the host confirms success.
      this.model={...this.model,state:'sending'};
      this.dispatchEvent(new CustomEvent('party-request',{bubbles:true,detail:{action:'nudge-'+this._choice,id:this.model.id,message:this._choice==='reading'?'Reading tonight?':'You’ve got this.'}}));
    }
    get available(){return ['available','error'].includes(this.model.state||'available');}
    update(){
      const m=this.model,state=m.state||'available',name=m.name||'Maya',window=m.window||'8–9 PM';this.dataset.state=state;
      this.querySelector('today-profile-avatar').person=m.person||{id:m.id||name,name,initials:name.slice(0,1)};
      this.querySelector('.pn-name').textContent=name;this.querySelector('.pn-window').textContent='';
      const messages={available:'',muted:`${name} has nudges off.`,window:`Available ${window}.`,limit:`${name} already received a nudge today.`,sending:'',sent:'',error:'Couldn’t send. Try again.'};
      this.querySelector('.pn-status').textContent=messages[state]||'';
      const label='Send '+(this._choice==='reading'?'Reading tonight?':'You’ve got this.')+' to '+name,slider=this.querySelector('.pn-slider');
      if(slider){slider.setAttribute('action-label',label);slider.setAttribute('state',state==='sent'?'complete':state==='sending'?'pending':state==='error'?'error':this.available?'idle':'unavailable');}
      const send=this.querySelector('.pn-send');if(send){const text=state==='sent'?'Nudge sent':state==='sending'?'Sending…':state==='error'?'Try again':this.available?'Send nudge':'Unavailable';send.querySelector('.pn-label').textContent=text;send.setAttribute('aria-label',this.available?label:text);send.setAttribute('aria-disabled',String(!this.available));send.setAttribute('aria-busy',String(state==='sending'));}
      this.querySelectorAll('[data-message]').forEach(b=>{b.setAttribute('aria-checked',String(b.dataset.message===this._choice));b.tabIndex=b.dataset.message===this._choice?0:-1;b.disabled=!this.available;});
    }
    confirm(){
      this._animations=[];
      if(!reduced()){
        this._animations.push(this.querySelector('.tsl-handle svg,.pn-check svg').animate([{opacity:0,transform:'scale(.6)'},{opacity:1,transform:'scale(1.08)',offset:.65},{opacity:1,transform:'scale(1)'}],{duration:640,easing:'cubic-bezier(.24,.74,.26,1)'}));
        if(this.dataset.layout==='pulse')this._animations.push(this.querySelector('.pn-avatar i').animate([{opacity:.6,transform:'scale(.9)'},{opacity:0,transform:'scale(1.8)'}],{duration:800,easing:'cubic-bezier(.24,.74,.26,1)'}));
      }
      this.dispatchEvent(new CustomEvent('nudge-confirmed',{bubbles:true,detail:{id:this.model.id}}));
    }
  }
  customElements.define('today-party-nudge',PartyNudge);
})();
