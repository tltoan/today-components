/* Selected waiting composition; local preview models only. The host supplies request state; no parser, progress timer or persistence here. */
import './thinking-orb.js';
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const button=(label,action,variant='quiet')=>`<today-button label="${label}" data-thinking-action="${action}" variant="${variant}"></today-button>`;
class TodayHabitThinking extends HTMLElement {
  constructor(){super();this.description='I want to read before bed, a few evenings a week.';this.answer='';this.state='describe';}
  connectedCallback(){
    if(!this._content){
      this.innerHTML='<today-onboarding-gradient position="top"></today-onboarding-gradient><div class="ht-content"></div>';
      this._wash=this.firstElementChild;
      this._content=this.lastElementChild;
    }
    this._abort=new AbortController();const signal=this._abort.signal;
    this.addEventListener('today-activate',e=>{const action=e.target.closest('[data-thinking-action]')?.dataset.thinkingAction;if(action){e.stopPropagation();this.request(action);}},{signal});
    this.addEventListener('input',e=>{if(e.target.matches('.ht-answer')){this.answer=e.target.value;this.querySelector('[data-thinking-action=answer]')?.toggleAttribute('disabled',!this.answer.trim());}},{signal});
    this.addEventListener('navigate',e=>{
      e.stopPropagation();const wasDescribe=this.state==='describe';this.description=e.detail.draft.description;
      if(wasDescribe)this.request(e.detail.screen==='privacy'?'submit':'close');
      else {this._setupDraft=e.detail.draft;this._wash.position=['privacy','intro','features'].includes(e.detail.screen)?'bottom':'top';this.querySelector('today-onboarding-screen')?.configure(e.detail.screen,'b',e.detail.draft);}
    },{signal});
    this.addEventListener('draftchange',e=>{const description=e.detail.description??this.description;if(description!==this.description)this.answer='';this.description=description;},{signal});
    this._media=matchMedia('(prefers-reduced-motion: reduce)');
    this._cancelMotion=()=>{if(this.reduced)this._entrance?.cancel();};
    this._media.addEventListener('change',this._cancelMotion,{signal});
    this._motion=new MutationObserver(this._cancelMotion);this._motion.observe(document.documentElement,{attributes:true,attributeFilter:['data-reduced','data-motion-override']});
    this.render();
  }
  disconnectedCallback(){this._abort?.abort();this._motion?.disconnect();this._entrance?.cancel();}
  get reduced(){return document.documentElement.hasAttribute('data-reduced')||(!document.documentElement.hasAttribute('data-motion-override')&&this._media?.matches);}
  enter(){
    const current=this._entrance?.playState==='running'?getComputedStyle(this._content):null;
    const from=current?{opacity:current.opacity,transform:current.transform}:{opacity:0,transform:'translateY(10px)'};
    this._entrance?.cancel();
    if(!this.reduced)this._entrance=this._content.animate([from,{opacity:1,transform:'translateY(0)'}],{duration:600,easing:'cubic-bezier(.37,0,.18,1)'});
  }
  request(action){this.dispatchEvent(new CustomEvent('thinking-request',{bubbles:true,detail:{action,description:this.description,answer:this.answer}}));}
  configure({state=this.state,description=this.description,focus=false}={}){
    if(description!==this.description)this.answer='';
    this.state=state;this.description=description;
    if(this._content)this.render(focus);
  }
  mountLoader(){
    const slot=this.querySelector('.ht-orb');if(!slot)return;
    const orb=document.createElement('today-thinking-orb');
    orb.setAttribute('design','breathing');orb.setAttribute('diameter','80');orb.setAttribute('aria-hidden','true');slot.replaceChildren(orb);
  }
  render(focus=false){
    this.dataset.layout='centered';this.dataset.state=this.state;
    this.dataset.wash=['describe','ready'].includes(this.state)?'onboarding':'preparing';
    this._wash.position='top';
    if(['describe','ready'].includes(this.state)){
      this._entrance?.cancel();
      this._content.className='ht-content ht-existing';
      const screen=document.createElement('today-onboarding-screen');
      screen.configure(this.state==='describe'?'describe':'track','b',{description:this.description,method:'pages',amount:10,days:[0,2,4],trialDays:21});
      this._content.replaceChildren(screen);
      if(focus)requestAnimationFrame(()=>{const target=screen.querySelector('textarea,h3');if(target){target.tabIndex=-1;target.focus({preventScroll:true});}});
      return;
    }
    const pending=['pending','long'].includes(this.state),clarify=this.state==='clarify',cancelled=this.state==='cancelled';
    const title=pending?(this.state==='long'?'Still working on your plan':'Preparing your plan'):clarify?'One quick question':cancelled?'Your draft is still here':'We couldn’t prepare your plan';
    const detail=pending?(this.state==='long'?'This is taking a little longer. Your description is still here.':'We’re choosing a way to track your habit. You’ll review it next.'):clarify?'When would reading fit best?':cancelled?'No plan has been created. You can return to your description.':'Try again, or change your description.';
    this._content.className='ht-content';
    this._content.innerHTML=`<header class="ht-header">${button('←','edit')}<span>New habit</span></header>
      <div class="ht-layout">
        <section class="ht-context"><span>Your habit</span><p>${escape(this.description)}</p></section>
        <section class="ht-message" aria-busy="${pending}">
          ${pending?'<div class="ht-orb" aria-hidden="true"></div>':''}
          <div class="ht-copy"><h3 tabindex="-1">${title}</h3><p>${detail}</p></div>
          ${clarify?`<label class="ht-answer-label">Your answer<textarea class="ht-answer" placeholder="For example, just before going to sleep">${escape(this.answer)}</textarea></label>`:''}
        </section>
      </div>
      <div class="ht-announcement" role="status" aria-live="polite">${title}</div>
      <footer class="ht-footer">${pending?button('Edit description','edit'):clarify?button('Continue','answer','primary')+button('Edit description','edit'):cancelled?button('Edit description','edit','primary'):button('Try again','retry','primary')+button('Edit description','edit')}</footer>`;
    this.querySelector('.ht-header button')?.setAttribute('aria-label','Back to your description');
    this.querySelector('[data-thinking-action=answer]')?.toggleAttribute('disabled',!this.answer.trim());
    if(pending)this.mountLoader();
    this.enter();
    if(focus)this.querySelector('h3')?.focus({preventScroll:true});
  }
}
if(!customElements.get('today-habit-thinking'))customElements.define('today-habit-thinking',TodayHabitThinking);
