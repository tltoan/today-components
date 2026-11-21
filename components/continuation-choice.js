/* Explicit choice; empty value remains unselected. No activation or persistence. */
(() => {
  const options=[{id:'trial',title:'Another trial',mark:'21',copy:'Choose a length. Review at the end.'},{id:'routine',title:'Make it a routine',mark:'∞',copy:'Keep your schedule, without trial reviews.'}];
  class ContinuationChoice extends HTMLElement {
    static observedAttributes=['value','variant'];
    connectedCallback(){if(this._connected)return;this._connected=true;this._abort=new AbortController();this.render();this.addEventListener('click',e=>{const b=e.target.closest('[data-route-choice]');if(b)this.choose(b.dataset.routeChoice);},{signal:this._abort.signal});this.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(e.key))return;e.preventDefault();const index=options.findIndex(o=>o.id===(e.target.closest('[data-route-choice]')?.dataset.routeChoice||this.value));this.choose(options[e.key==='Home'?0:e.key==='End'?1:index===0?1:0].id);this.querySelector('[aria-checked=true]')?.focus();},{signal:this._abort.signal});}
    disconnectedCallback(){this._connected=false;this._abort?.abort();}
    attributeChangedCallback(){if(this._connected)this.update();}
    get value(){return this.getAttribute('value')||'';}
    set value(v){this.setAttribute('value',options.some(o=>o.id===v)?v:'');}
    choose(v){if(v===this.value)return;this.value=v;this.dispatchEvent(new CustomEvent('change',{bubbles:true,detail:{value:v}}));}
    render(){const v=this.getAttribute('variant')||'cards';this.innerHTML=`<div class="cc-options cc-${v}" role="radiogroup" aria-label="What happens after this trial">${options.map(o=>`<button type="button" role="radio" data-route-choice="${o.id}"><span class="cc-mark" aria-hidden="true">${o.mark}</span><span class="cc-copy"><strong>${o.title}</strong><span>${o.copy}</span></span><span class="cc-radio" aria-hidden="true"></span></button>`).join('')}<i class="cc-moving-pill" aria-hidden="true"></i></div><p class="cc-description"></p>`;this.update();}
    update(){if(!this.querySelector('.cc-options'))return;const v=this.getAttribute('variant')||'cards';this.querySelector('.cc-options').className='cc-options cc-'+v;this.querySelectorAll('button').forEach((b,i)=>{const selected=b.dataset.routeChoice===this.value;b.setAttribute('aria-checked',String(selected));b.tabIndex=selected||(!this.value&&i===0)?0:-1;});this.querySelector('.cc-options').dataset.value=this.value;const desc=this.querySelector('.cc-description');desc.textContent=v==='rail'?(options.find(o=>o.id===this.value)?.copy||''):'';}
  }
  customElements.define('today-continuation-choice',ContinuationChoice);
})();
