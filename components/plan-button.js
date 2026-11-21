(() => {
  let serial=0;
  class TodayPlanButton extends HTMLElement {
    connectedCallback(){
      if(!this.button){
        const id=`plan-button-${++serial}`;
        this.innerHTML=`<button class="today-plan-button" type="button" disabled aria-describedby="${id}-status"><span class="plan-button-labels" aria-hidden="true"></span></button><span class="plan-button-status" id="${id}-status" role="status" aria-live="polite" aria-atomic="true"></span>`;
        this.button=this.querySelector('button');this.labels=this.querySelector('.plan-button-labels');this.status=this.querySelector('[role="status"]');
        this.animations=[];
        this.preference=matchMedia('(prefers-reduced-motion: reduce)');
        this.motionChanged=()=>{if(this.reduced())this.settle();};
        this.observer=new MutationObserver(this.motionChanged);
        this.setState({label:'Say a little more',ready:false,hint:'Describe the habit you want to track.'},{immediate:true,announce:false});
      }
      this.preference.addEventListener('change',this.motionChanged);
      this.observer.observe(document.documentElement,{attributes:true,attributeFilter:['data-reduced','data-motion-override']});
    }
    reduced(){return document.documentElement.hasAttribute('data-reduced')||(!document.documentElement.hasAttribute('data-motion-override')&&this.preference.matches);}
    setPending(){this.button.disabled=true;}
    settle(){
      this.animations.forEach(animation=>animation.cancel());this.animations=[];
      if(this.current)this.labels.replaceChildren(this.current);
      this.removeAttribute('data-transitioning');
    }
    makeLabel(text){
      const line=document.createElement('span');line.className='plan-button-label';
      const segments=typeof Intl.Segmenter==='function'?[...new Intl.Segmenter(undefined,{granularity:'grapheme'}).segment(text)].map(part=>part.segment):Array.from(text);
      segments.forEach(letter=>{const span=document.createElement('span');span.className='plan-button-letter';span.textContent=letter===' '?'\u00a0':letter;line.append(span);});
      line.dataset.label=text;
      return line;
    }
    setState({label,ready,hint=''},{immediate=false,announce=true}={}){
      this.button.disabled=!ready;this.button.setAttribute('aria-label',label);this.dataset.ready=String(ready);
      const changed=this.current?.dataset.label!==label;
      if(announce&&(changed||this.hint!==hint))this.status.textContent=ready?'Ready to build your plan.':hint;
      this.hint=hint;
      if(!changed){if(immediate||this.reduced())this.settle();return;}
      const outgoing=this.current;
      const snapshots=outgoing?[...outgoing.children].map(letter=>{const style=getComputedStyle(letter);return{opacity:style.opacity,transform:style.transform,filter:style.filter};}):[];
      this.settle();
      const incoming=this.makeLabel(label);this.current=incoming;this.labels.append(incoming);
      if(!outgoing||immediate||this.reduced()){this.settle();return;}
      this.dataset.transitioning='true';
      const easing='cubic-bezier(.22,.8,.24,1)';
      [...outgoing.children].forEach((letter,index)=>{
        this.animations.push(letter.animate([snapshots[index],{opacity:0,transform:'translateY(-10px) scale(.96)',filter:'blur(2px)'}],{duration:260,delay:index*5,easing,fill:'both'}));
      });
      [...incoming.children].forEach((letter,index)=>{
        this.animations.push(letter.animate([{opacity:0,transform:'translateY(12px) scale(.96)',filter:'blur(2px)'},{opacity:1,transform:'translateY(0) scale(1)',filter:'blur(0px)'}],{duration:520,delay:100+index*9,easing,fill:'both'}));
      });
      Promise.all(this.animations.map(animation=>animation.finished)).then(()=>{if(this.current===incoming)this.settle();}).catch(()=>{});
    }
    disconnectedCallback(){this.settle();this.observer?.disconnect();this.preference?.removeEventListener('change',this.motionChanged);}
  }
  customElements.define('today-plan-button',TodayPlanButton);
})();
