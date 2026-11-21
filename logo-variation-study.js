/* Gallery controls; not required by the reusable logo. */
document.querySelectorAll('[data-component="logo-curved"]').forEach(root=>{
  root.innerHTML=`<div class="component-specimen"><div class="component-stage logo-variation-stage"><today-logo-curved></today-logo-curved></div><div class="component-controls"><h3>A softer signature.</h3><p>A curved t and y, with the same drawing, settling and falling period.</p><today-segmented-control label="Letter y shape" value="curved"><option value="curved">Curved y</option><option value="original">Diagonal y</option></today-segmented-control><div class="component-tools"><button type="button" data-replay>Replay ↻</button><button type="button" data-play>Pause</button><button type="button" data-speed aria-pressed="false">Half speed</button></div><label class="logo-loop"><input type="checkbox" data-loop>Loop</label><p class="component-feedback" role="status">2.1 seconds · Plays once</p><a class="component-source" href="native/TodayLogoCurvedAnimation.swift" download>Download SwiftUI component ↗</a><a class="component-source" href="native/reference/TodayLogoCurvedVariation.swift" download>Original supplied file ↗</a></div></div>`;
  const logo=root.querySelector('today-logo-curved'),play=root.querySelector('[data-play]'),slow=root.querySelector('[data-speed]'),status=root.querySelector('[role="status"]');
  const media=matchMedia('(prefers-reduced-motion: reduce)');
  const update=()=>{play.textContent=logo.isPlaying&&!logo.finished?'Pause':'Play';play.disabled=logo.reducedMotion;status.textContent=logo.reducedMotion?'Less motion · Completed signature':logo.finished?'Complete · Replay anytime':!logo.isPlaying?'Paused':logo.loops?'Looping':`${logo.speed===.5?'Half speed':'2.1 seconds'} · Plays once`;};
  root.querySelector('[data-replay]').onclick=()=>{logo.isPlaying=true;logo.replay();update();};
  play.onclick=()=>{if(logo.finished){logo.isPlaying=true;logo.replay();}else logo.isPlaying=!logo.isPlaying;update();};
  slow.onclick=()=>{logo.speed=logo.speed===1?.5:1;slow.setAttribute('aria-pressed',String(logo.speed===.5));update();};
  root.querySelector('[data-loop]').onchange=e=>{logo.loops=e.target.checked;if(logo.loops)logo.replay();update();};
  root.querySelector('today-segmented-control').addEventListener('change',e=>{logo.yStyle=e.detail.value;logo.isPlaying=true;logo.replay();update();});
  logo.addEventListener('complete',update);
  const motion=()=>{if(document.documentElement.hasAttribute('data-motion-override'))logo.setAttribute('reduced-motion',String(document.documentElement.hasAttribute('data-reduced')));else logo.removeAttribute('reduced-motion');update();};
  media.addEventListener('change',motion);new MutationObserver(motion).observe(document.documentElement,{attributes:true,attributeFilter:['data-reduced','data-motion-override']});motion();
});
