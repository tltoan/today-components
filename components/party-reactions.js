/* Controlled identities, never inferred from a numeric reaction count. */
(() => {
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const heart='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.2S3 14.6 3 8.5C3 3.5 9 2.1 12 6.3C15 2.1 21 3.5 21 8.5C21 14.6 12 20.2 12 20.2Z"/></svg>';
  class Reactions extends HTMLElement {
    connectedCallback(){this.render();}
    set model(v){this._model=structuredClone(v||{});if(this.isConnected)this.render();}
    get model(){return structuredClone(this._model||{});}
    render(){
      const m=this.model,viewer=m.viewer,others=[...new Map((m.reactors||[]).filter(p=>p.id!==viewer?.id).map(p=>[p.id,p])).values()];
      const focused=this.contains(document.activeElement),old=this._checked;this._checked=!!m.reacted;
      this.innerHTML=`<div class="prx-row" role="group" aria-label="Hearts on this check-in">${others.map(p=>`<span class="prx-person" role="img" aria-label="${esc(p.name)} left a heart"><span class="prx-portrait"><today-profile-avatar size="34" person="${esc(JSON.stringify(p))}" aria-hidden="true"></today-profile-avatar><i class="prx-heart">${heart}</i></span><span>${esc(p.name)}</span></span>`).join('')}${viewer?`<button class="prx-own prx-person" type="button" aria-pressed="${!!m.reacted}" aria-label="${m.reacted?'Remove your heart':'Leave a heart on this check-in'}"><span class="prx-portrait"><today-profile-avatar size="34" person="${esc(JSON.stringify(viewer))}" aria-hidden="true"></today-profile-avatar><i class="prx-heart ${m.reacted?'':'prx-empty'}">${heart}</i></span><span>You</span></button>`:''}</div>`;
      this.querySelector('.prx-own')?.addEventListener('click',e=>{e.stopPropagation();this.dispatchEvent(new CustomEvent('party-request',{bubbles:true,detail:{action:'react',id:m.id}}));});
      if(focused)this.querySelector('button')?.focus({preventScroll:true});
      if(old!==undefined&&old!==!!m.reacted)this.play();
    }
    play(){if(document.documentElement.hasAttribute('data-reduced')||(matchMedia('(prefers-reduced-motion: reduce)').matches&&!document.documentElement.hasAttribute('data-motion-override')))return;this.querySelector('.prx-own .prx-heart')?.animate([{transform:'translateX(-50%) scale(.65)',opacity:.4},{transform:'translateX(-50%) scale(1.16)',opacity:1,offset:.65},{transform:'translateX(-50%) scale(1)',opacity:1}],{duration:540,easing:'cubic-bezier(.24,.74,.26,1)'});}
  }
  customElements.define('today-party-reactions',Reactions);
})();
