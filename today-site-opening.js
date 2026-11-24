/* Website host choreography. The original Welcome component remains the only clock.
 * Its letters, period and wash are untouched; this controller only positions its canvas
 * and reveals the surrounding website. No independent timer or second animation loop. */
(() => {
  class WebsiteOpening {
    constructor({reduced}) {
      this.root = document.documentElement;
      this.intro = document.querySelector('.site-b today-welcome-intro');
      this.header = document.querySelector('.site-header');
      this.skip = document.querySelector('.site-intro-skip');
      this.reduced = reduced;
      this.surfaces = [...document.querySelectorAll('.site-study-bar,.site-topline,.site-content,.site-prototype-note,.site-logo-home')];
      this.running = false;
      this.returnFocus = null;
      this.observer = new MutationObserver(() => this.paint());
      this.observer.observe(this.intro,{attributes:true,attributeFilter:['data-time']});
      this.resize = new ResizeObserver(() => this.paint());
      this.resize.observe(this.header);
      addEventListener('resize',() => this.paint());
      this.skip.addEventListener('click',() => this.settle(true));
      addEventListener('keydown',event => {
        if (event.key === 'Escape' && this.running) {event.preventDefault(); this.settle(true);}
      });
      if (this.root.classList.contains('site-opening')) this.replay();
      else this.settle();
    }
    replay() {
      if (this.reduced() || document.documentElement.classList.contains('library-embedded')) {this.settle(); return;}
      this.returnFocus = document.activeElement?.matches('[data-replay]') ? document.activeElement : null;
      this.running = true;
      window.scrollTo({top:0,behavior:'instant'});
      this.root.classList.add('site-opening');
      this.root.dataset.introPhase = 'drawing';
      this.root.style.setProperty('--site-content-reveal','0');
      this.surfaces.forEach(element => {element.inert = true;});
      this.skip.hidden = false;
      if (this.returnFocus) this.skip.focus({preventScroll:true});
      this.intro.removeAttribute('reduced-motion');
      this.intro.replay();
      this.paint();
    }
    paint() {
      if (!this.running) return;
      if (this.reduced()) {this.settle(); return;}
      const time = Number(this.intro.dataset.time || 0);
      const smooth = TodayUI.WordmarkArt.smooth;
      const dock = smooth((time - 2.58) / 1.07);
      const reveal = smooth((time - 3.10) / .90);
      const mobile = innerWidth <= 760;
      const startScale = Math.min(2.6,(innerWidth - 48) / 220);
      const endScale = mobile ? 1.4 : 1.55;
      const scale = startScale + (endScale - startScale) * dock;
      const startY = innerHeight / 2 - this.header.getBoundingClientRect().top;
      const endY = this.header.clientHeight * (mobile ? .66 : .59) + (289.45 - 300) * endScale;
      // Compensate for Welcome's own scale/translation so its visible wordmark
      // stays centered through the period landing, before the website move.
      const sourceHandoff = smooth((time - 2.06) / .52);
      const anchor = 313.2 + (289.45 - 313.2) * sourceHandoff;
      const y = startY + (endY - startY) * dock - anchor * scale;
      this.intro.style.setProperty('--site-logo-scale',scale);
      this.intro.style.setProperty('--site-logo-top',`${y}px`);
      this.root.style.setProperty('--site-content-reveal',reveal);
      this.root.dataset.introPhase = time < 2.58 ? 'drawing' : time < 3.10 ? 'docking' : 'reveal';
      if (time >= 4) this.settle();
    }
    settle(moveFocus = false) {
      const wasRunning = this.running;
      this.running = false;
      this.intro.setAttribute('reduced-motion','true');
      this.intro.style.removeProperty('--site-logo-scale');
      this.intro.style.removeProperty('--site-logo-top');
      this.root.classList.remove('site-opening');
      this.root.dataset.introPhase = 'ready';
      this.root.style.removeProperty('--site-content-reveal');
      this.surfaces.forEach(element => {element.inert = false;});
      if (this.skip === document.activeElement || (moveFocus && wasRunning)) {
        const target = this.returnFocus || document.querySelector('[data-home]:not([hidden]) h1,[data-document]:not([hidden]) h1');
        if (target) {if (target.tagName==='H1') target.tabIndex=-1;target.focus({preventScroll:true});}
      }
      this.skip.hidden = true;
      if (wasRunning) window.scrollTo({top:0,behavior:'instant'});
      this.returnFocus = null;
    }
  }
  window.TodayUI = Object.assign(window.TodayUI || {},{WebsiteOpening});
})();
