import {orbDesigns} from './components/thinking-orb.js';
const descriptions=['Particles on tilted orbits.','A scan passes over a dotted globe.','Turning bands settle back into place.','A wave travels through the rings.','Points connect into a constellation.','Three strands move around a sphere.','A ribbon made of moving dots.','A gently changing ring.','A circle, triangle and square in motion.'];
const host=document.querySelector('.orb-grid');
host.innerHTML=orbDesigns.map((design,i)=>`<article class="orb-card" id="orb-${design}"><header><h3>${design[0].toUpperCase()+design.slice(1)}</h3><a href="source.html#thinking-orbs">Swift ↗</a></header><div class="orb-specimen"><div><today-thinking-orb design="${design}" label="${design} loader"></today-thinking-orb><small>64 pt</small></div><div><today-thinking-orb design="${design}" size="small" label="${design} loader, small"></today-thinking-orb><small>20 pt</small></div></div><p class="orb-caption">${descriptions[i]}</p></article>`).join('');
document.querySelector('[data-orb-pause]').addEventListener('click',e=>{
  const paused=e.currentTarget.getAttribute('aria-pressed')!=='true';e.currentTarget.setAttribute('aria-pressed',String(paused));e.currentTarget.textContent=paused?'Resume motion':'Pause motion';
  document.querySelectorAll('today-thinking-orb').forEach(orb=>orb.toggleAttribute('paused',paused));
});
