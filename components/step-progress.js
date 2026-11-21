/* Presentational step progress. A current step is not a completed submission.
 * Set current / total / variant attributes; no navigation or persistence.
 */
(() => {
  class TodayStepProgress extends HTMLElement {
    static observedAttributes = ['current', 'total', 'variant', 'label'];
    get total() { return Math.min(12, Math.max(1, Math.trunc(Number(this.getAttribute('total')) || 7))); }
    get current() { return Math.min(this.total, Math.max(1, Math.trunc(Number(this.getAttribute('current')) || 1))); }
    set current(value) { this.setAttribute('current', value); }
    connectedCallback() {
      this.render();
      this._media=matchMedia('(prefers-reduced-motion: reduce)');
      this._motionChange=()=>{if(this._media.matches||document.documentElement.hasAttribute('data-reduced'))this._countMotion?.cancel();};
      this._media.addEventListener('change',this._motionChange);
      this._observer=new MutationObserver(this._motionChange);
      this._observer.observe(document.documentElement,{attributes:true,attributeFilter:['data-reduced','data-motion-override']});
    }
    attributeChangedCallback() { if (this.isConnected) this.render(); }
    render() {
      const variants = ['segments', 'pill', 'rail', 'numbers', 'ring'];
      const variant = variants.includes(this.getAttribute('variant')) ? this.getAttribute('variant') : 'pill';
      const key = variant + this.total;
      if (key !== this._key) {
        this.innerHTML = '<div class="step-top"><span class="step-caption"></span><span class="step-count"></span></div><div class="step-visual" aria-hidden="true"></div>';
        this.className = this.className.replace(/\bsp-\S+/g, '').trim();
        this.classList.add('sp-' + variant);
        const visual = this.querySelector('.step-visual');
        if (variant === 'ring') visual.innerHTML = '<svg viewBox="0 0 64 64"><circle class="step-ring-track" cx="32" cy="32" r="27"/><circle class="step-ring-fill" cx="32" cy="32" r="27" pathLength="100"/></svg><span class="step-ring-number"></span>';
        else if (variant === 'rail') visual.innerHTML = '<span class="step-rail-fill"></span>';
        else visual.innerHTML = Array.from({length:this.total}, (_,i) => '<span class="step-segment" data-step="' + (i+1) + '">' + (variant === 'numbers' ? (i+1) : '') + '</span>').join('');
        this._key = key;
      }
      this.setAttribute('role', 'progressbar');
      this.setAttribute('aria-label', this.getAttribute('label') || 'Setup progress');
      this.setAttribute('aria-valuemin', '1');
      this.setAttribute('aria-valuemax', this.total);
      this.setAttribute('aria-valuenow', this.current);
      this.setAttribute('aria-valuetext', 'Step ' + this.current + ' of ' + this.total);
      this.querySelector('.step-caption').textContent = this.getAttribute('label') || 'Create your habit';
      const count = this.querySelector('.step-count');
      const changed = count.textContent && count.textContent !== this.current + ' of ' + this.total;
      count.textContent = this.current + ' of ' + this.total;
      this.querySelectorAll('.step-segment').forEach((el,i) => {
        el.dataset.state = i+1 === this.current ? 'current' : i+1 < this.current ? 'past' : 'future';
      });
      this.style.setProperty('--step-fraction', this.current / this.total);
      const ring = this.querySelector('.step-ring-fill');
      if (ring) { ring.style.strokeDashoffset = 100 - this.current / this.total * 100; this.querySelector('.step-ring-number').textContent = this.current; }
      if (changed) {
        this._countMotion?.cancel();
        if (!matchMedia('(prefers-reduced-motion: reduce)').matches && !document.documentElement.hasAttribute('data-reduced')) {
          this._countMotion = count.animate([{opacity:.35, transform:'translateY(4px)'},{opacity:1, transform:'translateY(0)'}], {duration:320,easing:'cubic-bezier(.22,.76,.28,1)'});
        }
      }
    }
    disconnectedCallback() { this._countMotion?.cancel();this._observer?.disconnect();this._media?.removeEventListener('change',this._motionChange); }
  }
  if (!customElements.get('today-step-progress')) customElements.define('today-step-progress', TodayStepProgress);
})();
