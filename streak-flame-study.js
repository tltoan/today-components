(() => {
  document.querySelectorAll('[data-component="streak-flame"]').forEach(root=>{
    const variants=[
      ['ember','Habit detail','Warm Ember · Selected for Today.','<div class="flame-hero"><today-streak-flame palette="ember"></today-streak-flame><strong>6 day streak</strong><p>Through Nov 16</p></div>'],
      ['ember','Compact badge','The same flame, in a smaller space.','<div class="flame-badge"><today-streak-flame palette="ember"></today-streak-flame><strong>6</strong><span>day streak</span></div>'],
      ['ember','Widget','Warm Ember on a graphite surface.','<div class="flame-widget"><span>Read before bed</span><div class="flame-widget-metric"><div><strong>6</strong><small>day streak</small></div><today-streak-flame palette="ember"></today-streak-flame></div><small>Through Nov 16</small></div>']
    ];
    root.innerHTML='<div class="flame-studies">'+variants.map(([palette,title,note,markup])=>'<article class="flame-study"><div class="flame-stage">'+markup+'</div><h3>'+title+'</h3><p>'+note+'</p><div class="flame-controls"><button type="button" data-play>Play animation</button><button type="button" data-still>Still</button></div><div class="flame-downloads"><a href="assets/streaks/'+palette+'.svg" download>Still SVG ↗</a><a href="assets/streaks/'+palette+'-animated.svg" download>Animated SVG ↗</a></div></article>').join('')+'</div><p class="flame-note">Warm Ember is the selected streak artwork. A brief lift and glow celebrates a confirmed increase, then settles into a still. Reduced motion shows the still immediately.</p>';
    root.querySelectorAll('.flame-study').forEach(card=>{const flame=card.querySelector('today-streak-flame');card.querySelector('[data-play]').onclick=()=>flame.play();card.querySelector('[data-still]').onclick=()=>flame.still();});
  });
})();
