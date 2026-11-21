/* Controlled seven-day date bar shared by Home and onboarding.
   Host supplies dates and applies daychange; today and selection are separate. */
(() => {
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  class WeekBar extends HTMLElement {
    set model(v){this._model=structuredClone(v||{});if(this.isConnected)this.render();}
    connectedCallback(){this.render();}
    render(){const m=this._model;if(!m)return;const key=(m.days||[]).map(d=>d.date).join(',');
      if(key!==this._key){this._key=key;this.innerHTML=`<div class="twb-week" role="group" aria-label="Choose a day">${m.days.map(d=>`<button type="button" data-date="${esc(d.date)}"><span></span><b></b><i aria-hidden="true"></i></button>`).join('')}</div>`;this.querySelectorAll('button').forEach((b,i)=>{b.onclick=()=>this.dispatchEvent(new CustomEvent('daychange',{bubbles:true,detail:{date:b.dataset.date}}));b.onkeydown=e=>{let j=i;if(e.key==='ArrowRight')j=Math.min(m.days.length-1,i+1);else if(e.key==='ArrowLeft')j=Math.max(0,i-1);else if(e.key==='Home')j=0;else if(e.key==='End')j=m.days.length-1;else return;e.preventDefault();this.querySelectorAll('button')[j].focus();};});}
      this.querySelectorAll('button').forEach((b,i)=>{const d=m.days[i];b.querySelector('span').textContent=d.weekday;b.querySelector('b').textContent=d.number;b.setAttribute('aria-label',d.label);b.setAttribute('aria-pressed',String(d.date===m.selectedDate));if(d.today)b.setAttribute('aria-current','date');else b.removeAttribute('aria-current');});
    }
  }
  customElements.define('today-week-bar',WeekBar);
})();
