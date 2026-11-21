/* Call play() only for a new confirmed streak or an explicit replay.
 * The illustration always settles; it never runs an idle loop.
 */
(() => {
  let serial=0;
  class TodayStreakFlame extends HTMLElement{
    static observedAttributes=['palette'];
    connectedCallback(){this.render();this._media=matchMedia('(prefers-reduced-motion: reduce)');this._motionChange=()=>{if(this.reduced())this.still();};this._media.addEventListener('change',this._motionChange);this._observer=new MutationObserver(this._motionChange);this._observer.observe(document.documentElement,{attributes:true,attributeFilter:['data-reduced','data-motion-override']});}
    attributeChangedCallback(){if(this.isConnected)this.render();}
    reduced(){return document.documentElement.hasAttribute('data-reduced')||(!document.documentElement.hasAttribute('data-motion-override')&&matchMedia('(prefers-reduced-motion: reduce)').matches);}
    render(){this.still();this.innerHTML=window.TodayFlameArt.svg(this.getAttribute('palette')||'ember',false,'today-flame-'+(++serial));this.setAttribute('role','img');this.setAttribute('aria-label','Streak flame');}
    still(){this._animations?.forEach(a=>a.cancel());this._animations=[];this.dataset.state='still';}
    async play(){
      this.still();if(this.reduced())return;
      this.dataset.state='playing';
      const body=this.querySelector('.flame-body'),core=this.querySelector('.flame-core'),glow=this.querySelector('.flame-glow');
      if(!body)return;
      const easing='cubic-bezier(.22,.76,.28,1)';
      this._animations=[
        body.animate([{transform:'translateY(5px) scale(.92,.86)',opacity:.55},{transform:'translateY(-3px) scale(.97,1.045)',opacity:1,offset:.36},{transform:'translateY(1px) scale(1.02,.98)',offset:.64},{transform:'translateY(0) scale(1)',opacity:1}],{duration:1600,easing}),
        core.animate([{transform:'scale(.8)',opacity:.5},{transform:'scale(1.07)',opacity:1,offset:.4},{transform:'scale(1)',opacity:1}],{duration:1400,delay:100,easing}),
        glow.animate([{opacity:.34},{opacity:.8,offset:.4},{opacity:.34}],{duration:1600,easing:'ease'})
      ];
      const run=this._animations;
      try{await Promise.all(run.map(a=>a.finished));if(run===this._animations)this.still();}catch{}
    }
    disconnectedCallback(){this.still();this._media?.removeEventListener('change',this._motionChange);this._observer?.disconnect();}
  }
  customElements.define('today-streak-flame',TodayStreakFlame);
})();
