(() => {
  let serial=0;
  const shapes={
    // Symmetric cubic shoulders keep the cradle tangent to the flat top.
    cradle:TodayUI.CradleFluid.outline,
    saddle:'M32 25 H104 C126 25 137 25 146 13 C160 -3 192 -3 206 13 C215 25 226 25 248 25 H320 Q351 25 351 56 V65 Q351 96 320 96 H32 Q1 96 1 65 V56 Q1 25 32 25Z'
  };
  class TodayBottomNav extends HTMLElement {
    static observedAttributes=['active'];
    connectedCallback(){
      if(this.initialized){this.observeMotion();this.positionSelection(true);return;}
      this.initialized=true;
      const id=`today-nav-${++serial}`,variant=this.getAttribute('variant')||'cradle';
      if(!this.hasAttribute('variant'))this.setAttribute('variant',variant);
      const button=(key,label,asset)=>`<button class="bottom-nav-tab" data-tab="${key}" aria-label="${label}"><img src="assets/${asset}.svg" alt="" draggable="false"><span>${label}</span></button>`;
      const silhouette=shapes[variant]?`<svg class="bottom-nav-silhouette" viewBox="0 0 352 ${variant==='saddle'?97:71}" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="${id}-fill" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#333136"/><stop offset="1" stop-color="#121214"/></linearGradient><clipPath id="${id}-clip"><path d="${shapes[variant]}"/></clipPath></defs><path class="bottom-nav-outline" d="${shapes[variant]}" fill="url(#${id}-fill)" stroke="#ffffff26" stroke-width="1.4" vector-effect="non-scaling-stroke"/>${variant==='cradle'?`<g clip-path="url(#${id}-clip)"><path class="cradle-selection" fill="#111113" stroke="rgba(255,255,255,0.08)" stroke-width="1.4" vector-effect="non-scaling-stroke"/></g>`:''}</svg>`:'';
      this.innerHTML=`<nav class="bottom-nav-shell" aria-label="${this.getAttribute('label')||'Main navigation'}">${silhouette}<div class="bottom-nav-rail"><span class="bottom-nav-selection" aria-hidden="true"></span>${button('home','Home','HomeIcon')}${button('habits','Habits','HabitsIcon')}</div><button class="bottom-nav-add" aria-label="Add a habit" aria-expanded="false"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></button></nav>`;
      this.addEventListener('click',event=>{
        const tab=event.target.closest('[data-tab]');
        if(tab){this.active=tab.dataset.tab;this.dispatchEvent(new CustomEvent('tabchange',{bubbles:true,detail:{active:this.active}}));}
        if(event.target.closest('.bottom-nav-add'))this.dispatchEvent(new CustomEvent('add',{bubbles:true}));
      });
      this.addEventListener('keydown',event=>{
        if(!event.target.matches('[data-tab]'))return;
        if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
        event.preventDefault();this.active=event.key==='Home'?'home':event.key==='End'?'habits':event.target.dataset.tab==='home'?'habits':'home';
        this.querySelector(`[data-tab="${this.active}"]`).focus({preventScroll:true});
        this.dispatchEvent(new CustomEvent('tabchange',{bubbles:true,detail:{active:this.active}}));
      });
      this.observer=new ResizeObserver(()=>this.positionSelection(true));
      this.motionPreference=matchMedia('(prefers-reduced-motion: reduce)');
      this.motionChange=()=>{if(this.isReduced())this.positionSelection(true);};
      this.motionObserver=new MutationObserver(this.motionChange);
      this.observeMotion();
      this.update();
    }
    observeMotion(){this.observer?.observe(this);this.motionObserver?.observe(document.documentElement,{attributes:true,attributeFilter:['data-reduced','data-motion-override']});this.motionPreference?.addEventListener('change',this.motionChange);}
    disconnectedCallback(){this.observer?.disconnect();this.motionObserver?.disconnect();this.motionPreference?.removeEventListener('change',this.motionChange);cancelAnimationFrame(this.selectionFrame);}
    isReduced(){return document.documentElement.hasAttribute('data-reduced')||(!document.documentElement.hasAttribute('data-motion-override')&&this.motionPreference?.matches);}
    get active(){return this.getAttribute('active')==='habits'?'habits':'home';}
    set active(value){this.setAttribute('active',value==='habits'?'habits':'home');}
    attributeChangedCallback(){this.update();}
    update(){
      this.querySelectorAll('[data-tab]').forEach(button=>{
        const selected=button.dataset.tab===this.active;
        if(selected)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');
      });
      this.positionSelection();
    }
    positionSelection(immediate=false){
      const highlight=this.querySelector('.cradle-selection'),svg=this.querySelector('.bottom-nav-silhouette');
      if(!highlight||!svg)return;
      const frame=svg.getBoundingClientRect();if(!frame.width)return;
      const scale=352/frame.width;
      const bounds=['home','habits'].map(key=>{const r=this.querySelector(`[data-tab="${key}"]`).getBoundingClientRect();return{x:(r.left-frame.left)*scale,width:r.width*scale};});
      const target=this.active==='habits'?1:0;
      const draw=progress=>{
        this.selectionProgress=progress;
        highlight.setAttribute('d',TodayUI.CradleFluid.geometry(progress,...bounds).d);
        this.dataset.selectionProgress=progress.toFixed(4);
      };
      if(!immediate&&this.selectionFrame&&this.selectionTarget===target&&!this.isReduced())return;
      cancelAnimationFrame(this.selectionFrame);this.selectionFrame=0;this.selectionTarget=target;
      if(immediate||this.selectionProgress===undefined||this.isReduced()||Math.abs(target-this.selectionProgress)<.001){draw(target);this.removeAttribute('data-morphing');return;}
      const from=this.selectionProgress,start=performance.now(),duration=600*Math.max(.3,Math.abs(target-from));
      this.dataset.morphing='true';
      const tick=now=>{
        const t=Math.min(1,(now-start)/duration);
        draw(from+(target-from)*TodayUI.CradleFluid.ease(t));
        if(t<1)this.selectionFrame=requestAnimationFrame(tick);
        else{draw(target);this.selectionFrame=0;this.removeAttribute('data-morphing');}
      };
      this.selectionFrame=requestAnimationFrame(tick);
    }
  }
  customElements.define('today-bottom-nav',TodayBottomNav);
})();
