(() => {
  document.querySelectorAll('[data-component="streak-flame"]').forEach(root=>{
    const variants=[
      ['ember','A · Warm ember','A warm focal point for habit details.','<div class="flame-hero"><today-streak-flame palette="ember"></today-streak-flame><strong>6 day streak</strong><p>Through Nov 16</p></div>'],
      ['lilac','B · Today lilac','A quieter badge beside a habit name.','<div class="flame-badge"><today-streak-flame palette="lilac"></today-streak-flame><strong>6</strong><span>day streak</span></div>'],
      ['silver','C · Soft silver','A restrained accent on a graphite widget.','<div class="flame-widget"><span>Read before bed</span><strong>6</strong><small>day streak · Through Nov 16</small><today-streak-flame palette="silver"></today-streak-flame></div>']
    ];
    root.innerHTML='<div class="flame-studies">'+variants.map(([palette,title,note,markup])=>'<article class="flame-study"><div class="flame-stage">'+markup+'</div><h3>'+title+'</h3><p>'+note+'</p><div class="flame-controls"><button type="button" data-play>Play animation</button><button type="button" data-still>Still</button></div><div class="flame-downloads"><a href="assets/streaks/'+palette+'.svg" download>Still SVG ↗</a><a href="assets/streaks/'+palette+'-animated.svg" download>Animated SVG ↗</a></div></article>').join('')+'</div><p class="flame-note">A brief lift and glow, then a still. Play it when a confirmed streak increases—not on every visit. Reduced motion shows the still immediately. These are new directions inspired by your reference; the original Figma flame remains in the widget collection.</p>';
    root.querySelectorAll('.flame-study').forEach(card=>{const flame=card.querySelector('today-streak-flame');card.querySelector('[data-play]').onclick=()=>flame.play();card.querySelector('[data-still]').onclick=()=>flame.still();});
  });
})();
