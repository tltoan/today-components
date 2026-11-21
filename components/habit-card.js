/* One reusable card for both Home and standalone specimens. Confirmed values only. */
(() => {
  const reduced = () => document.documentElement.hasAttribute('data-reduced') || (!document.documentElement.hasAttribute('data-motion-override') && matchMedia('(prefers-reduced-motion: reduce)').matches);
  const met = h => h.amount !== null && (h.kind === 'check' ? h.amount > 0 : h.kind !== 'limit' && h.amount >= h.target);
  class TodayHabitCard extends HTMLElement {
    connectedCallback() {
      if(this._connected)return;
      this._connected=true;
      this.setAttribute('role','article');
      this.classList.add('ho-habit');
      this.innerHTML='<today-target-feedback></today-target-feedback><div class="ho-habit-top"><div class="ho-habit-title"><h4></h4><p></p></div><span class="ho-card-art"></span></div><div class="ho-habit-bottom"><div class="ho-habit-result"><strong></strong><span></span></div><today-button variant="secondary"></today-button></div><p class="ho-error" role="alert" hidden></p>';
      this._abort=new AbortController();
      this.addEventListener('today-activate', e=>{
        if(!e.target.closest('today-button') || this._model?.pending || this._model?.future)return;
        this.dispatchEvent(new CustomEvent('logrequest',{bubbles:true,detail:{id:this._model.id,date:this._model.date}}));
      },{signal:this._abort.signal});
      this.render(null);
    }
    disconnectedCallback(){this._connected=false;this._abort?.abort();}
    set model(value){const old=this._model;if(JSON.stringify(old)===JSON.stringify(value))return;this._model=structuredClone(value);if(this._connected)this.render(old);}
    get model(){return structuredClone(this._model);}
    render(old){
      const h=this._model;if(!h)return;
      const hasLog=h.amount!==null, reached=met(h), same=old?.id===h.id&&old?.date===h.date;
      this.dataset.habit=h.id;this.dataset.amount=String(h.amount);
      this.setAttribute('aria-label',h.name);
      this.querySelector('h4').textContent=h.name;
      this.querySelector('.ho-habit-title>p').textContent=h.kind==='check'?'Check it off':`${h.kind==='limit'?'Limit':'Target'} · ${Number(h.target).toLocaleString('en-US')} ${h.unit}`;
      const art=this.querySelector('.ho-card-art');
      if(art.dataset.name!==h.artwork){
        art.dataset.name=h.artwork;art.replaceChildren();
        if(h.artwork==='water-droplet'){art.classList.add('ho-water-art');art.innerHTML=TodayWidgets.art('water');}
        else{art.classList.remove('ho-water-art');const node=document.createElement('today-artwork');node.setAttribute('name',h.artwork);art.append(node);}
      }
      if(h.artwork==='water-droplet')TodayWidgets.setWaterFill(art.querySelector('.tw-water'),(h.amount||0)/h.target);
      const amount=hasLog?(h.kind==='check'?(h.amount>0?'Logged':'None today'):`${Number(h.amount).toLocaleString('en-US')} ${h.unit}`):'No log yet';
      this.querySelector('.ho-habit-result strong').textContent=h.future?'Planned':amount;
      this.querySelector('.ho-habit-result span').textContent=h.future?(h.cue||'On your schedule'):reached?'Target met':hasLog?(h.kind==='limit'?'Logged · keep logging':'Logged'):(h.cue||'Whenever it fits');
      const label=h.kind==='check'?(h.amount>0?'Undo':'Log'):`+ ${h.increment} ${h.unit}`;
      const action=this.querySelector('today-button');
      if(h.pending&&action.contains(document.activeElement))this._restoreFocus=true;
      action.hidden=!!h.future;action.dataset.homeLog=h.id;
      action.setAttribute('label',h.pending?'Saving…':label);
      action.setAttribute('accessible-label',h.pending?`Saving ${h.name}`:h.kind==='check'?`${label} ${h.name}`:`Add ${h.increment} ${h.unit} to ${h.name}`);
      action.toggleAttribute('disabled',!!h.pending);
      if(!h.pending&&this._restoreFocus){if(!h.future&&(document.activeElement===document.body||action.contains(document.activeElement)))action.querySelector('button')?.focus({preventScroll:true});this._restoreFocus=false;}
      const error=this.querySelector('.ho-error');error.textContent=h.error||'';error.hidden=!h.error;
      const feedback=this.querySelector('today-target-feedback');
      const variant=['bloom','wash','halo'].includes(h.feedback)?h.feedback:'wash';
      if(feedback.getAttribute('variant')!==variant)feedback.setAttribute('variant',variant);
      if(feedback.hasAttribute('met')!==reached)feedback.toggleAttribute('met',reached);
      // Initial data, changing dates/targets, pending and failed saves never celebrate.
      const crossed=same&&h.current===true&&!h.pending&&!h.error&&old.target===h.target&&old.kind===h.kind&&!met(old)&&reached;
      if(crossed){
        feedback.celebrate();
        this.dispatchEvent(new CustomEvent('target-reached',{bubbles:true,detail:{id:h.id,date:h.date,variant,haptic:'success'}}));
      } else if(same&&old.amount!==h.amount&&!reduced()){
        this.querySelector('.ho-habit-result').animate([{opacity:.35,transform:'translateY(5px)'},{opacity:1,transform:'translateY(0)'}],{duration:320,easing:'cubic-bezier(.22,.8,.24,1)'});
      }
    }
  }
  customElements.define('today-habit-card',TodayHabitCard);
})();
