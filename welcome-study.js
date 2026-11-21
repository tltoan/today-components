(() => {
  const root=document.querySelector('[data-component="landing"]');
  if(root){
    root.innerHTML=`<div class="component-specimen welcome-specimen"><div class="component-stage welcome-stage"><today-welcome-intro></today-welcome-intro></div><div class="component-controls welcome-controls"><h3>From a signature to a start.</h3><p>The wordmark draws onto black. The period and gradient descend together, then the logo settles into place as the question and Begin button appear.</p><div class="component-tools"><button class="welcome-replay" type="button">Replay landing ↻</button><button class="welcome-pause" type="button">Pause</button><button class="welcome-speed" type="button" aria-pressed="false">Half speed</button></div><p class="component-feedback welcome-playback" role="status">Plays once · 4 seconds</p><p>Begin replays this preview, matching the supplied SwiftUI demo.</p><div class="welcome-downloads"><a class="component-source" href="native/TodayWelcomeIntro.zip" download>Download SwiftUI component + dependency ↗</a><a class="component-source" href="landing.html">Open full-screen preview ↗</a></div></div></div>`;
  }
  const scope=root||document,view=scope.querySelector('today-welcome-intro');if(!view)return;
  const replay=scope.querySelector('.welcome-replay'),pause=scope.querySelector('.welcome-pause'),speed=scope.querySelector('.welcome-speed'),status=scope.querySelector('.welcome-playback');
  const update=()=>{
    pause.disabled=view.finished;pause.textContent=view.isPlaying?'Pause':'Play';pause.setAttribute('aria-label',view.isPlaying?'Pause landing animation':'Play landing animation');
    speed.setAttribute('aria-pressed',String(view.speed===.5));
    if(status)status.textContent=view.reducedMotion?'Reduced motion · Completed screen':view.finished?'Complete · Replay anytime':!view.isPlaying?'Paused':`Playing at ${view.speed===.5?'half':'normal'} speed`;
  };
  replay.addEventListener('click',()=>view.replay());pause.addEventListener('click',()=>{view.isPlaying=!view.isPlaying;});speed.addEventListener('click',()=>{view.speed=view.speed===.5?1:.5;});
  view.addEventListener('begin',()=>view.replay());view.addEventListener('playbackchange',update);view.addEventListener('complete',update);update();
})();
