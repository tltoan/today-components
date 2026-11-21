/* Controlled nudge UI. The host checks eligibility and sends; this element never sends a notification. */
(() => {
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const reduced=()=>document.documentElement.hasAttribute('data-reduced')||(!document.documentElement.hasAttribute('data-motion-override')&&matchMedia('(prefers-reduced-motion: reduce)').matches);
  const arrow='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  const check='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 12 4 4 8-9"/></svg>';
  class PartyNudge extends HTMLElement {
    connectedCallback(){if(this._ready)return;this._ready=true;this._choice='reading';this.build();}
    disconnectedCallback(){this._ready=false;this._animations?.forEach(a=>a.cancel());}
    get model(){return structuredClone(this._model||{});}
    set model(v){const prev=this._model?.state;this._model=structuredClone(v||{});this._requested=false;if(this._ready){this.update();if(prev==='sending'&&this._model.state==='sent')this.confirm();}}
    build(){
      const variant=['card','pulse','compact'].includes(this.getAttribute('variant'))?this.getAttribute('variant'):'card';this.dataset.layout=variant;
      this.innerHTML=`<div class="pn-surface"><div class="pn-recipient"><span class="pn-avatar"><today-profile-avatar size="48" aria-hidden="true"></today-profile-avatar><i></i></span><div><strong class="pn-name"></strong><span class="pn-window"></span></div><span class="pn-kind">Nudge</span></div><div class="pn-messages" role="radiogroup" aria-label="Nudge message"><button type="button" role="radio" data-message="reading">Reading tonight?</button><button type="button" role="radio" data-message="encourage">You’ve got this.</button></div><p class="pn-message">Reading tonight?</p><button type="button" class="pn-send"><span class="pn-send-icon">${arrow}</span><span class="pn-label">Send nudge</span><span class="pn-check">${check}</span></button><p class="pn-status" role="status" aria-live="polite"></p></div>`;
      this.querySelectorAll('[data-message]').forEach(b=>b.addEventListener('click',()=>{if(!this.available)return;this._choice=b.dataset.message;this.update();}));
      this.querySelector('.pn-messages').addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)||!this.available)return;e.preventDefault();this._choice=this._choice==='reading'?'encourage':'reading';this.update();this.querySelector(`[data-message=${this._choice}]`).focus();});
      this.querySelector('.pn-send').addEventListener('click',()=>{if(!this.available||this._requested)return;this._requested=true;this.dispatchEvent(new CustomEvent('party-request',{bubbles:true,detail:{action:'nudge-'+this._choice,id:this.model.id,message:this._choice==='reading'?'Reading tonight?':'You’ve got this.'}}));});this.update();
    }
    get available(){return ['available','error'].includes(this.model.state||'available');}
    update(){
      const m=this.model,state=m.state||'available',name=m.name||'Maya',window=m.window||'8–9 PM';this.dataset.state=state;
      this.querySelector('today-profile-avatar').person=m.person||{id:m.id||name,name,initials:name.slice(0,1)};
      this.querySelector('.pn-name').textContent=name;this.querySelector('.pn-window').textContent=window+' · reminder window';
      const messages={available:'',muted:`${name} has nudges off.`,window:`Available ${window}.`,limit:`${name} already received a nudge today.`,sending:'Sending…',sent:'Sent to '+name+'.',error:'Couldn’t send. Try again.'};
      this.querySelector('.pn-status').textContent=messages[state]||'';
      this.querySelector('.pn-label').textContent=state==='sent'?'Nudge sent':state==='sending'?'Sending…':state==='error'?'Try again':!this.available?'Unavailable':'Send nudge';
      const send=this.querySelector('.pn-send');send.setAttribute('aria-disabled',String(!this.available));send.setAttribute('aria-busy',String(state==='sending'));send.setAttribute('aria-label',this.available?'Send '+(this._choice==='reading'?'Reading tonight?':'You’ve got this.')+' to '+name:this.querySelector('.pn-label').textContent);
      this.querySelectorAll('[data-message]').forEach(b=>{b.setAttribute('aria-checked',String(b.dataset.message===this._choice));b.tabIndex=b.dataset.message===this._choice?0:-1;b.disabled=!this.available;});
    }
    confirm(){
      this._animations?.forEach(a=>a.cancel());this._animations=[];
      if(!reduced()){
        const opts={duration:640,easing:'cubic-bezier(.24,.74,.26,1)'};
        this._animations.push(this.querySelector('.pn-check').animate([{opacity:0,transform:'scale(.6)'},{opacity:1,transform:'scale(1.08)',offset:.65},{opacity:1,transform:'scale(1)'}],opts));
        const target=this.dataset.layout==='pulse'?'.pn-avatar i':'.pn-surface';
        const frames=this.dataset.layout==='pulse'?[{opacity:.6,transform:'scale(.9)'},{opacity:0,transform:'scale(1.8)'}]:[{boxShadow:'inset 0 0 0 1px #c3aedb66',transform:'scale(.992)'},{boxShadow:'inset 0 0 0 1px #c3aedb00',transform:'scale(1)'}];
        this._animations.push(this.querySelector(target).animate(frames,{duration:800,easing:'cubic-bezier(.24,.74,.26,1)'}));
      }
      this.dispatchEvent(new CustomEvent('nudge-confirmed',{bubbles:true,detail:{id:this.model.id}}));
    }
  }
  customElements.define('today-party-nudge',PartyNudge);
})();
