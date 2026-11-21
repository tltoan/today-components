/* Reusable seven-face artwork. Palette is optional; no palette preserves the source's light disk.
   Use passive + still for identity avatars. Expression motion is feedback, never a persisted identity state. */
(() => {
  class MinimalFace extends HTMLElement {
    static observedAttributes=['face','palette','still','paused','passive','cropped','features-only'];
    constructor(){super();this._elapsed=0;this._started=null;this._visible=false;this._reaction=null;}
    get face(){return TodayFaceMotion.styles.includes(this.getAttribute('face'))?this.getAttribute('face'):'tilt';}
    get time(){return this._elapsed+(this._started===null?0:(performance.now()-this._started)/1000);}
    get reduced(){return document.documentElement.hasAttribute('data-reduced')||(!document.documentElement.hasAttribute('data-motion-override')&&this._media?.matches);}
    connectedCallback(){
      this._abort=new AbortController();const signal=this._abort.signal;
      this._media=matchMedia('(prefers-reduced-motion: reduce)');this._sync=()=>this.sync();
      this._media.addEventListener('change',this._sync,{signal});document.addEventListener('visibilitychange',this._sync,{signal});
      this._observer=new MutationObserver(this._sync);this._observer.observe(document.documentElement,{attributes:true,attributeFilter:['data-reduced','data-motion-override']});
      this._intersection=new IntersectionObserver(entries=>{this._visible=entries[0].isIntersecting;this.sync();});this._intersection.observe(this);
      this._resize=new ResizeObserver(()=>this.resize());this._resize.observe(this);this.render();
    }
    attributeChangedCallback(name){if(this.isConnected&&this._media){if(name==='passive')this.render();else {if(name==='face')this._reaction=null;this.sync();}}}
    render(){
      const passive=this.hasAttribute('passive');
      this.innerHTML=passive?'<canvas aria-hidden="true"></canvas>':'<button type="button" class="mf-button"><canvas aria-hidden="true"></canvas></button>';
      this.setAttribute('role',passive?'img':'group');this.setAttribute('aria-label',`${TodayFaceMotion.label(this.face)} face`);
      const b=this.querySelector('button');if(b){b.setAttribute('aria-label',`${TodayFaceMotion.label(this.face)} face, tap to react`);b.addEventListener('click',()=>this.wink());}
      this._canvas=this.querySelector('canvas');this.resize();this.sync();
    }
    capture(){this._elapsed=this.time;this._started=null;cancelAnimationFrame(this._frame);this._frame=0;}
    sync(){
      this.setAttribute('aria-label',`${TodayFaceMotion.label(this.face)} face`);this.querySelector('button')?.setAttribute('aria-label',`${TodayFaceMotion.label(this.face)} face, tap to react`);
      this.capture();const still=this.hasAttribute('still')||this.reduced,running=!still&&!this.hasAttribute('paused')&&this._visible&&!document.hidden;
      this.dataset.state=still?'still':running?'playing':this.hasAttribute('paused')?'paused':'suspended';
      this.draw();if(running){this._started=performance.now();const tick=()=>{this.draw();this._frame=requestAnimationFrame(tick);};this._frame=requestAnimationFrame(tick);}
    }
    resize(){if(!this._canvas)return;const side=Math.max(1,Math.round(this.clientWidth*Math.min(devicePixelRatio||1,2)));this._canvas.width=side;this._canvas.height=side;this.draw();}
    draw(){
      if(!this._canvas)return;const still=this.hasAttribute('still')||this.reduced,palette=Number(this.getAttribute('palette')),hasPalette=this.hasAttribute('palette')&&Number.isInteger(palette)&&palette>=0&&palette<(window.TodayFacePalettes?.colors||TodayPartyAvatars.palettes).length;
      TodayFaceMotion.draw(this._canvas,{face:this.face,time:still?0:this.time,reactionAge:still||this._reaction===null?null:this.time-this._reaction,ink:hasPalette?'#fff9f4':'#16131c',colors:hasPalette?(window.TodayFacePalettes?.colors||TodayPartyAvatars.palettes)[palette]:['#eeeaf3'],cropped:this.hasAttribute('cropped'),featuresOnly:this.hasAttribute('features-only')});
    }
    wink(){if(!this.reduced&&!this.hasAttribute('still')&&(this._reaction===null||this.time-this._reaction>=TodayFaceMotion.duration)){this._reaction=this.time;this.draw();}this.dispatchEvent(new CustomEvent('face-tap',{bubbles:true,detail:{face:this.face}}));}
    disconnectedCallback(){this.capture();this._abort?.abort();this._observer?.disconnect();this._intersection?.disconnect();this._resize?.disconnect();}
  }
  customElements.define('today-minimal-face',MinimalFace);
})();
