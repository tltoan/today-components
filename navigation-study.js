(() => {
  const root=document.querySelector('#nav-studies');
  root.classList.add('selected-navigation');
  root.innerHTML=`<article class="nav-study" id="nav-cradle" aria-label="Selected Center cradle navigation"><div class="nav-phone"><div class="nav-context" data-active="home"><div class="nav-scene" data-scene="home"><h3>Home</h3><p>A little space for your day.</p></div><div class="nav-scene" data-scene="habits" aria-hidden="true" inert><h3>Habits</h3><p>The things you come back to.</p></div></div><today-bottom-nav variant="cradle" active="home" label="Main navigation"></today-bottom-nav><div class="nav-home-indicator" aria-hidden="true"></div></div></article><div class="nav-chosen-details"><h3>Center cradle</h3><p>A quieter rim surrounds the evenly inset selection. It stretches and flows beneath the center scoop, then rounds back into the other tab. Tap Home or Habits to try it.</p><p>The + is an independent control with no page attached.</p><p class="nav-implementation-note">The adaptive action button has its own <a href="plan-button.html">component preview</a>.</p></div>`;
  const nav=root.querySelector('today-bottom-nav'),plus=nav.querySelector('.bottom-nav-add'),context=root.querySelector('.nav-context');
  plus.removeAttribute('aria-expanded');
  nav.addEventListener('tabchange',event=>{
    context.dataset.active=event.detail.active;
    context.querySelectorAll('[data-scene]').forEach(scene=>{const active=scene.dataset.scene===event.detail.active;scene.inert=!active;scene.setAttribute('aria-hidden',String(!active));});
  });
})();
