(() => {
  const buttonRoot=document.querySelector('[data-component="plan-button"]');
  if(buttonRoot){
    buttonRoot.innerHTML=`<div class="component-specimen"><div class="component-stage"><span class="component-stage-label">ADAPTIVE ACTION</span><today-plan-button></today-plan-button><span class="component-stage-note">One steady shape. A changing invitation.</span></div><div class="component-controls"><h3>A little more, then ready.</h3><p>Letters roll upward in a soft wave, settling into the next prompt. Choose a state or replay the full sequence.</p><div class="component-states" role="group" aria-label="Button preview state"><button data-state="0" aria-pressed="true"><span>01</span>Needs detail</button><button data-state="1" aria-pressed="false"><span>02</span>Needs a rhythm</button><button data-state="2" aria-pressed="false"><span>03</span>Ready to build</button></div><div class="component-tools"><button class="button-replay" type="button">Replay sequence ↻</button></div><p class="component-feedback" role="status"></p></div></div>`;
    const component=buttonRoot.querySelector('today-plan-button'),states=[{label:'Say a little more',ready:false,hint:'Name the habit you want to track.'},{label:'How often?',ready:false,hint:'Add when or how often.'},{label:'Build my plan',ready:true,hint:''}];
    let timers=[];
    const stop=()=>{timers.forEach(clearTimeout);timers=[];};
    const set=(index,immediate=false)=>{component.setState(states[index],{immediate});buttonRoot.querySelectorAll('[data-state]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.state)===index)));buttonRoot.querySelector('.component-feedback').textContent='';};
    buttonRoot.querySelectorAll('[data-state]').forEach(button=>button.addEventListener('click',()=>{stop();set(Number(button.dataset.state));}));
    buttonRoot.querySelector('.button-replay').addEventListener('click',()=>{stop();set(0,true);timers=[setTimeout(()=>set(1),700),setTimeout(()=>set(2),2050)];});
    component.button.addEventListener('click',()=>{buttonRoot.querySelector('.component-feedback').textContent='Ready action pressed.';});
    document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
  }
  const counterRoot=document.querySelector('[data-component="page-counter"]');
  if(counterRoot){
    counterRoot.innerHTML=`<div class="component-specimen"><div class="component-stage counter-stage"><today-page-counter amount="10" maximum="40" mark-count="20"></today-page-counter></div><div class="component-controls"><h3>One mark, one page.</h3><p>Tap to count one page. Hold to keep counting. The marks fill in sequence and reverse from their current position.</p><div class="component-tools"><button data-counter-value="10">Reset to 10</button><button data-counter-value="25">Show overflow</button><button data-counter-value="0">Zero pages</button></div><p class="component-feedback">Preview range: 0–40 pages · 20 visible marks</p><a class="component-source" href="native/AnimatedPageCounter.swift" download>Download SwiftUI component ↗</a></div></div>`;
    const counter=counterRoot.querySelector('today-page-counter');counterRoot.querySelectorAll('[data-counter-value]').forEach(button=>button.addEventListener('click',()=>{counter.amount=Number(button.dataset.counterValue);}));
  }
  const chartRoot=document.querySelector('[data-component="bar-chart"]');
  if(chartRoot){
    chartRoot.innerHTML=`<div class="component-specimen"><div class="component-stage chart-stage"><div class="chart-summary"><strong>50</strong><span>pages logged</span></div><today-staggered-bar-chart></today-staggered-bar-chart><p class="chart-period">November 1–12, 2026 · Sample data</p></div><div class="component-controls"><h3>A rhythm, revealed.</h3><p>Bars rise from left to right. Lavender shows a recorded amount; blue marks the 10-page target being met. An empty log keeps its place.</p><div class="component-tools"><button class="chart-replay">Replay animation ↻</button><button class="chart-zero" aria-pressed="false">Show recorded zero</button><label><input class="chart-stagger" type="checkbox">One bar at a time</label></div><a class="component-source" href="native/StaggeredBarChart.swift" download>Download SwiftUI component ↗</a></div></div>`;
    const chart=chartRoot.querySelector('today-staggered-bar-chart');
    chartRoot.querySelector('.chart-replay').addEventListener('click',()=>chart.replay());
    chartRoot.querySelector('.chart-zero').addEventListener('click',event=>{const active=event.currentTarget.getAttribute('aria-pressed')!=='true';event.currentTarget.setAttribute('aria-pressed',String(active));event.currentTarget.textContent=active?'Restore sample':'Show recorded zero';chart.points=TodayUI.pageChartExample.map((point,index)=>({...point,value:active&&index===0?0:point.value}));chartRoot.querySelector('.chart-summary strong').textContent=chart.points.reduce((sum,point)=>sum+(point.value??0),0);});
    chartRoot.querySelector('.chart-stagger').addEventListener('change',event=>{chart.setAttribute('stagger',event.target.checked?'500':'140');chart.replay();});
  }
})();
