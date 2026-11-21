(() => {
  const duration=4;
  const art=TodayUI.WordmarkArt;
  const progress=(time,start,length)=>art.smooth((time-start)/length);
  const mix=(a,b,t)=>a+(b-a)*t;
  let serial=0;
  class TodayWelcomeIntro extends HTMLElement {
    static observedAttributes=['playing','speed','replay-token','reduced-motion'];
    constructor(){
      super();this.time=0;this.last=null;this.rate=1;this.visible=false;this.frame=0;
      this.tick=now=>{
        this.frame=0;if(!this.canPlay()){this.last=null;return;}
        if(this.last!==null)this.time=Math.min(duration,this.time+(now-this.last)/1000*this.rate);
        this.last=now;this.render();
        if(this.time>=duration){this.last=null;this.dispatchEvent(new Event('complete'));this.notify();}
        else this.frame=requestAnimationFrame(this.tick);
      };
    }
    connectedCallback(){
      if(!this.scene){
        const id=`welcome-${++serial}`;
        this.innerHTML=`<svg class="welcome-background" viewBox="0 0 390 844" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="${id}-hue" gradientUnits="userSpaceOnUse" x1="12.5" y1="643.5" x2="390" y2="655"><stop stop-color="#5e91f6" stop-opacity=".25"/><stop offset=".51" stop-color="#a781f0" stop-opacity=".25"/><stop offset="1" stop-color="#ffb276" stop-opacity=".25"/></linearGradient><linearGradient id="${id}-shade" gradientUnits="userSpaceOnUse" x1="195" y1="16.5" x2="195" y2="844"><stop stop-color="#000" stop-opacity=".14"/><stop offset=".0817967" stop-color="#000" stop-opacity=".36"/><stop offset=".544617" stop-color="#000" stop-opacity=".86"/><stop offset=".744265" stop-color="#000"/><stop offset="1" stop-color="#000"/></linearGradient></defs><g class="welcome-wash" opacity="0"><path d="M0 -64H390V1536H0Z" fill="#0e0d11"/><path d="M0 -64H390V1536H0Z" fill="url(#${id}-hue)"/><path d="M0 -64H390V1536H0Z" fill="url(#${id}-shade)"/></g></svg><div class="welcome-scene"><svg class="welcome-art" viewBox="0 0 390 844" aria-hidden="true"><defs><linearGradient id="${id}-ink" class="welcome-ink" gradientUnits="userSpaceOnUse" x1="98.9926" y1="291.54" x2="273.291" y2="341.08"><stop stop-color="rgb(83.96183848%,83.96183848%,83.96183848%)"/><stop offset="1" stop-color="rgb(51.91368461%,51.91368461%,51.91368461%)"/></linearGradient>${art.glyphs.slice(0,5).map((path,index)=>`<clipPath id="${id}-glyph-${index}"><path d="${path}" clip-rule="evenodd"/></clipPath>`).join('')}</defs><g class="welcome-wordmark">${art.glyphs.slice(0,5).map((path,index)=>`<g class="welcome-letter"><g clip-path="url(#${id}-glyph-${index})"><g class="welcome-traces">${art.strokes[index].map(stroke=>`<path d="${stroke.path}" fill="none" stroke="url(#${id}-ink)" stroke-width="${stroke.width}" stroke-linecap="butt" stroke-linejoin="round" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1"/>`).join('')}</g><path class="welcome-letter-finish" d="${path}" fill="url(#${id}-ink)" fill-rule="evenodd"/></g></g>`).join('')}<g class="welcome-period"><path d="${art.glyphs[5]}" fill="url(#${id}-ink)"/></g></g></svg><p class="welcome-tagline" aria-label="Today. What will you do?" aria-hidden="true">what will you do?</p></div>`;
        this.scene=this.querySelector('.welcome-scene');this.wash=this.querySelector('.welcome-wash');this.wordmark=this.querySelector('.welcome-wordmark');this.ink=this.querySelector('.welcome-ink');this.period=this.querySelector('.welcome-period');this.tagline=this.querySelector('.welcome-tagline');
        this.letters=[...this.querySelectorAll('.welcome-letter')].map(group=>({group,traces:group.querySelector('.welcome-traces'),paths:[...group.querySelectorAll('.welcome-traces path')],finish:group.querySelector('.welcome-letter-finish')}));
        this.preference=matchMedia('(prefers-reduced-motion: reduce)');this.clockChanged=()=>this.syncClock();this.motionObserver=new MutationObserver(this.clockChanged);
      }
      this.rate=this.speed;
      this.preference.addEventListener('change',this.clockChanged);document.addEventListener('visibilitychange',this.clockChanged);
      this.motionObserver.observe(document.documentElement,{attributes:true,attributeFilter:['data-reduced','data-motion-override']});
      this.intersection=new IntersectionObserver(entries=>{this.visible=entries[0].isIntersecting;this.syncClock();},{threshold:.05});this.intersection.observe(this);
      this.resize=new ResizeObserver(()=>{const bounds=this.getBoundingClientRect();this.scene.style.setProperty('--welcome-fit',Math.min(bounds.width/390,bounds.height/844));});this.resize.observe(this);
      this.syncClock();
    }
    get isPlaying(){return this.getAttribute('playing')!=='false';}
    set isPlaying(value){this.setAttribute('playing',String(Boolean(value)));}
    get speed(){const value=Number(this.getAttribute('speed')??1);return Number.isFinite(value)?Math.max(.1,Math.min(2,value)):1;}
    set speed(value){this.setAttribute('speed',String(value));}
    get reducedMotion(){return this.hasAttribute('reduced-motion')?this.getAttribute('reduced-motion')!=='false':document.documentElement.hasAttribute('data-reduced')||(!document.documentElement.hasAttribute('data-motion-override')&&this.preference?.matches);}
    get currentTime(){return this.time;}
    get finished(){return this.time>=duration||this.reducedMotion;}
    attributeChangedCallback(name,oldValue,newValue){
      if(oldValue===newValue)return;
      if(name==='speed'){if(this.last!==null)this.time=Math.min(duration,this.time+(performance.now()-this.last)/1000*this.rate);this.last=null;this.rate=this.speed;}
      if(name==='replay-token'){this.time=0;this.last=null;}
      if(this.scene)this.syncClock();
    }
    replay(){this.time=0;this.last=null;this.isPlaying=true;this.syncClock();}
    canPlay(){return this.isConnected&&this.visible&&!document.hidden&&this.isPlaying&&!this.reducedMotion&&this.time<duration;}
    notify(){this.dispatchEvent(new Event('playbackchange'));}
    syncClock(){
      cancelAnimationFrame(this.frame);this.frame=0;
      if(this.last!==null)this.time=Math.min(duration,this.time+(performance.now()-this.last)/1000*this.rate);
      this.last=null;this.render();if(this.canPlay())this.frame=requestAnimationFrame(this.tick);this.notify();
    }
    render(){
      if(!this.letters)return;
      const seconds=this.reducedMotion?duration:Math.max(0,Math.min(duration,this.time)),time=seconds+.33;
      const dropY=art.periodY(time),reveal=art.smooth((time-art.periodStart)/.05),settled=time>=art.periodStart+1.08;
      this.wash.setAttribute('opacity',reveal);this.wash.setAttribute('transform',`translate(0 ${dropY*560/72})`);
      const handoff=progress(seconds,2.06,.52),tagline=progress(seconds,2.30,.46),finalScale=35/55,scale=mix(1,finalScale,handoff);
      this.wordmark.setAttribute('transform',`translate(${(127-88*finalScale)*handoff} ${(299-326*finalScale)*handoff}) scale(${scale})`);
      this.ink.setAttribute('x1',mix(98.9926,99,handoff));this.ink.setAttribute('y1',mix(291.54,299.2857142857,handoff));this.ink.setAttribute('x2',mix(273.291,278.9285714286,handoff));this.ink.setAttribute('y2',mix(341.08,338.5714285714,handoff));
      this.letters.forEach((letter,index)=>{
        const amount=art.entrances[index](time);letter.group.setAttribute('visibility',amount>0?'visible':'hidden');letter.group.setAttribute('transform',`translate(0 ${art.lift(time-.533333-index*.1)})`);
        letter.traces.setAttribute('visibility',amount>=.99999?'hidden':'visible');letter.paths.forEach((path,j)=>{const stroke=art.strokes[index][j];path.setAttribute('stroke-dashoffset',1-art.clamp((amount-stroke.start)/(stroke.end-stroke.start)));});
        letter.finish.setAttribute('opacity',amount>=.99999?1:amount>.94?art.smooth((amount-.94)/.06):0);
      });
      this.period.setAttribute('visibility',reveal>0?'visible':'hidden');this.period.setAttribute('transform',settled?'':`translate(291.754 ${320.115+dropY*.465}) scale(${reveal} ${Math.max(.0001,art.periodHeight(time)/22.8)}) translate(-291.754 -320.115)`);
      this.tagline.style.opacity=tagline;this.tagline.style.transform=`translateY(${7*(1-tagline)}px)`;this.tagline.setAttribute('aria-hidden',String(tagline<.5));
      this.dataset.time=seconds.toFixed(3);this.dataset.playback=this.reducedMotion?'reduced':this.time>=duration?'complete':this.isPlaying?'playing':'paused';
    }
    disconnectedCallback(){cancelAnimationFrame(this.frame);this.frame=0;this.last=null;this.intersection?.disconnect();this.resize?.disconnect();this.motionObserver?.disconnect();this.preference?.removeEventListener('change',this.clockChanged);document.removeEventListener('visibilitychange',this.clockChanged);}
  }
  customElements.define('today-welcome-intro',TodayWelcomeIntro);
})();
