/* Decorative completion paint. The host decides when a confirmed target is reached. */
(() => {
  class TodayTargetFeedback extends HTMLElement {
    static observedAttributes = ['met', 'variant'];
    connectedCallback() {
      if (!this.firstElementChild) this.innerHTML = '<span class="tf-paint"></span><span class="tf-rim"></span>';
      this.setAttribute('aria-hidden', 'true');
      this._media = matchMedia('(prefers-reduced-motion: reduce)');
      this._motionChanged = () => { if (this.reduced()) this.stop(); };
      this._media.addEventListener('change', this._motionChanged);
      this._observer = new MutationObserver(this._motionChanged);
      this._observer.observe(document.documentElement, {attributes:true, attributeFilter:['data-reduced','data-motion-override']});
    }
    attributeChangedCallback() { this.stop(); }
    disconnectedCallback() { this.stop(); this._observer?.disconnect(); this._media?.removeEventListener('change', this._motionChanged); }
    reduced() { return document.documentElement.hasAttribute('data-reduced') || (!document.documentElement.hasAttribute('data-motion-override') && matchMedia('(prefers-reduced-motion: reduce)').matches); }
    stop() { this._animations?.forEach(a => a.cancel()); this._animations = []; this.dataset.state = 'still'; }
    // Capture the painted frame before cancelling, so undo/re-log can reverse mid-flight.
    async setMet(value, {animate=false}={}) {
      const paint=this.querySelector('.tf-paint'),rim=this.querySelector('.tf-rim');
      const moving=this.dataset.state==='playing';
      const from=paint?{opacity:getComputedStyle(paint).opacity,transform:getComputedStyle(paint).transform}:null;
      const rimFrom=rim?getComputedStyle(rim).opacity:0;
      this.toggleAttribute('met',value);
      if(!animate||this.reduced()||!paint){this.stop();return;}
      if(value&&!moving){this.celebrate();return;}
      this.stop();this.dataset.state='playing';this.dataset.direction=value?'rise':'retreat';
      const options={duration:value?900:640,easing:'cubic-bezier(.24,.74,.26,1)'};
      this._animations=[paint.animate([from,{opacity:value ? .72 : 0,transform:value?'translateY(0)':'translateY(80%)'}],options),rim.animate([{opacity:rimFrom},{opacity:value ? .32 : 0}],options)];
      const run=this._animations;
      try{await Promise.all(run.map(a=>a.finished));if(run===this._animations)this.stop();}catch{}
    }
    async celebrate() {
      this.stop();
      if (!this.hasAttribute('met') || this.reduced() || !this.isConnected) return;
      const variant = this.getAttribute('variant') || 'wash';
      const paint = this.querySelector('.tf-paint'), rim = this.querySelector('.tf-rim');
      const frames = variant === 'wash'
        ? [{transform:'translateY(80%)',opacity:0},{transform:'translateY(-3%)',opacity:1,offset:.65},{transform:'translateY(0)',opacity:.72}]
        : variant === 'halo'
          ? [{opacity:0},{opacity:.75,offset:.4},{opacity:.3}]
          : [{transform:'scale(.65)',opacity:0},{transform:'scale(1.08)',opacity:.85,offset:.48},{transform:'scale(1)',opacity:.45}];
      const options = {duration:900,easing:'cubic-bezier(.22,.76,.26,1)'};
      this.dataset.state = 'playing';this.dataset.direction='rise';
      this._animations = [paint.animate(frames,options),rim.animate([{opacity:0},{opacity:.8,offset:.45},{opacity:.32}],options)];
      const run = this._animations;
      try { await Promise.all(run.map(a=>a.finished)); if (run === this._animations) this.stop(); } catch {}
    }
  }
  customElements.define('today-target-feedback', TodayTargetFeedback);
})();
