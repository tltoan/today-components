/* Shared artwork and log marks. URLs resolve from this script, not the host page. */
(() => {
  const base = new URL('../assets/', document.currentScript.src);
  const escape = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const asset = name => new URL(name, base).href;
  const reduced = () => document.documentElement.hasAttribute('data-reduced') || (!document.documentElement.hasAttribute('data-motion-override') && matchMedia('(prefers-reduced-motion: reduce)').matches);
  const format = value => value == null ? '—' : Number(value).toLocaleString('en-US');
  const image = (name, cls='') => '<img class="' + cls + '" src="' + asset(name) + '" alt="" draggable="false">';
  let waterSerial=0;
  const waterStates=new WeakMap();
  const drawWater=state=>{
    const y=(1-state.level)*56.4055;
    const amplitude=state.amplitude*Math.max(0,Math.min(1,state.level*16,(1-state.level)*16));
    const points=Array.from({length:21},(_,i)=>{
      const x=i*2;
      return x.toFixed(1)+','+(y+Math.sin(x/40*Math.PI*2+state.phase)*amplitude).toFixed(3);
    });
    state.el.querySelector('.tw-water-surface').setAttribute('d','M'+points.join(' L')+' L40,57 L0,57 Z');
    state.el.dataset.level=state.level.toFixed(4);
  };
  const setWaterFill=(el,value)=>{
    if(!el)return;
    const target=Math.max(0,Math.min(1,value));
    let state=waterStates.get(el);
    if(!state){state={el,level:target,target,velocity:0,phase:0,amplitude:0,frame:0,started:0};waterStates.set(el,state);drawWater(state);el.dataset.motion='still';el.dataset.target=String(target);return;}
    if(state.target===target&&!reduced())return;
    state.target=target;
    state.started=performance.now();
    el.dataset.target=String(target);
    if(reduced()){cancelAnimationFrame(state.frame);state.frame=0;state.level=target;state.velocity=0;state.amplitude=0;drawWater(state);el.dataset.motion='still';return;}
    if(state.frame)return; // A new target redirects the same spring from its current velocity.
    let previous=performance.now();
    el.dataset.motion='filling';
    const tick=now=>{
      state.frame=0;
      if(!el.isConnected)return;
      const dt=Math.min(.032,(now-previous)/1000);previous=now;
      state.velocity+=(state.target-state.level)*110*dt;
      state.velocity*=Math.exp(-18*dt);
      state.level=Math.max(0,Math.min(1,state.level+state.velocity*dt));
      const desired=Math.min(2.6,Math.abs(state.velocity)*8);
      state.amplitude+=(desired-state.amplitude)*(1-Math.exp(-12*dt));
      state.phase+=dt*7;
      if(reduced()||(Math.abs(state.target-state.level)<.0005&&Math.abs(state.velocity)<.004&&state.amplitude<.035)||now-state.started>2200){
        state.level=state.target;state.velocity=0;state.amplitude=0;el.dataset.motion='still';drawWater(state);return;
      }
      drawWater(state);state.frame=requestAnimationFrame(tick);
    };
    state.frame=requestAnimationFrame(tick);
  };
  const settleWater=root=>root.querySelectorAll('.tw-water').forEach(el=>{
    const s=waterStates.get(el);if(!s)return;cancelAnimationFrame(s.frame);s.frame=0;s.level=s.target;s.velocity=0;s.amplitude=0;drawWater(s);el.dataset.motion='still';
  });
  const art = (kind='custom') => {
    if(!['water','reading','stretch','custom','flame','mono'].includes(kind))kind='custom';
    if (kind === 'water') {
      const id='tw-water-gradient-'+(++waterSerial);
      return '<span class="tw-water" aria-hidden="true"><svg class="tw-water-liquid" viewBox="0 0 40 56.4055"><defs><linearGradient id="'+id+'" x1="0" y1="1" x2="0" y2="0"><stop offset=".077" stop-color="#5e91f6"/><stop offset=".54" stop-color="#a781f0"/><stop offset=".986" stop-color="#ffb276"/></linearGradient></defs><path class="tw-water-surface" fill="url(#'+id+')" d="M0,57H40V57H0Z"/></svg></span>';
    }
    const files = {reading:'widgets/OpenBook.svg',stretch:'StretchMat.svg',custom:'widgets/Custom.svg',flame:'streaks/ember.svg',mono:'streaks/ember.svg'};
    return image(files[kind] || files.custom, 'tw-art-image tw-art-' + kind);
  };
  const mark = (state='none') => '<span class="tw-mark" data-mark="' + escape(state) + '" aria-hidden="true">' + image('widgets/DayOff.svg') + '<span>' + image('widgets/PlannedDay.svg') + '</span></span>';
  const animateText = el => {
    el.getAnimations().forEach(a=>a.cancel());
    if (!reduced()) el.animate([{opacity:.4,transform:'translateY(3px)'},{opacity:1,transform:'translateY(0)'}],{duration:320,easing:'cubic-bezier(.22,.76,.28,1)'});
  };
  // Apple HIG iOS dimensions, checked November 20, 2026. Points, represented 1:1 in CSS.
  const sizes={
    compact:{label:'Compact · 375 × 667',small:[148,148],medium:[321,148],large:[321,324],rectangular:[153,68],circular:[68,68]},
    standard:{label:'Standard · 390 × 844',small:[158,158],medium:[338,158],large:[338,354],rectangular:[160,72],circular:[72,72]},
    large:{label:'Large · 430 × 932',small:[170,170],medium:[364,170],large:[364,382],rectangular:[172,76],circular:[76,76]}
  };
  const family=variant=>['medium','streak'].includes(variant)?'medium':['list','portraits'].includes(variant)?'large':['lock','lock-streak','summary'].includes(variant)?'rectangular':variant==='circular'?'circular':'small';
  const dimensions=(variant,size='standard')=>(sizes[size]||sizes.standard)[family(variant)];
  window.TodayWidgets = {escape,asset,format,art,mark,reduced,animateText,setWaterFill,settleWater,sizes,family,dimensions};
})();
