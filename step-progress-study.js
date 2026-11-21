/* Gallery controls only. Production pages import components/step-progress.*. */
(() => {
  const variations=[
    ['pill','Selected','Active pill','The current step gently expands, then hands off to the next.']
  ];
  document.querySelectorAll('[data-component="step-progress"]').forEach(root=>{
    root.innerHTML='<div class="study-controls"><div class="study-step-buttons"><button type="button" data-prev>← Previous</button><span data-step-state role="status">Step 4 of 7</span><button type="button" data-next>Next →</button></div><label class="study-select-label">Steps <today-dropdown label="Number of steps" value="7"><option value="3">3 steps</option><option value="5">5 steps</option><option value="7">7 steps</option></today-dropdown></label></div><div class="sp-studies">'+variations.map(([variant,letter,title,copy])=>'<article class="sp-study"><div class="sp-study-heading"><span>'+letter+'</span><h3>'+title+'</h3></div><div class="sp-study-stage"><today-step-progress variant="'+variant+'" total="7" current="4"></today-step-progress></div><p>'+copy+'</p></article>').join('')+'</div>';
    let current=4,total=7;
    const update=()=>{root.querySelectorAll('today-step-progress').forEach(el=>{el.setAttribute('total',total);el.current=current;});root.querySelector('[data-prev]').disabled=current===1;root.querySelector('[data-next]').disabled=current===total;root.querySelector('[data-step-state]').textContent='Step '+current+' of '+total;};
    root.querySelector('[data-prev]').onclick=()=>{current=Math.max(1,current-1);update();};
    root.querySelector('[data-next]').onclick=()=>{current=Math.min(total,current+1);update();};
    root.querySelector('today-dropdown').addEventListener('change',event=>{total=Number(event.detail?.value||event.target.value);current=Math.min(current,total);update();});
    update();
  });
})();
