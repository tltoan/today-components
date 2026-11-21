(() => {
  const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
  const number=(value,fallback)=>Number.isFinite(Number(value))?Math.trunc(Number(value)):fallback;
  const curve=t=>{
    const bezier=(u,a,b)=>3*(1-u)*(1-u)*u*a+3*(1-u)*u*u*b+u*u*u;
    let low=0,high=1;
    for(let i=0;i<12;i++){const mid=(low+high)/2;if(bezier(mid,.2,.2)<t)low=mid;else high=mid;}
    return bezier((low+high)/2,.8,1);
  };
  class TodayPageCounter extends HTMLElement {
    static observedAttributes=['amount','maximum','mark-count'];
    get maximum(){return Math.max(0,number(this.getAttribute('maximum')??20,20));}
    get capacity(){return Math.max(1,number(this.getAttribute('mark-count')??20,20));}
    get amount(){return clamp(number(this.getAttribute('amount')??10,10),0,this.maximum);}
    set amount(value){this.setAttribute('amount',String(clamp(number(value,0),0,this.maximum)));}
    connectedCallback(){
      if(!this.digits){
        this.innerHTML='<div class="page-counter-row"><button class="page-counter-minus" type="button" aria-label="Decrease pages">−</button><div class="page-counter-digits" role="img"></div><button class="page-counter-plus" type="button" aria-label="Increase pages">+</button></div><div class="page-counter-unit">pages</div><div class="page-counter-marks" role="img"><svg preserveAspectRatio="none" aria-hidden="true"></svg></div><p class="page-counter-overflow" hidden></p><p class="page-counter-caption">Each mark is one page.</p><span class="page-counter-status" role="status" aria-live="polite"></span>';
        this.digits=this.querySelector('.page-counter-digits');this.svg=this.querySelector('svg');this.buttons=[...this.querySelectorAll('button')];this.animations=[];
        this.buttons.forEach((button,index)=>{
          const direction=index===0?-1:1;
          button.addEventListener('pointerdown',event=>{if(event.button!==0||button.disabled)return;event.preventDefault();button.setPointerCapture(event.pointerId);this.startHold(button,direction,'pointer');});
          button.addEventListener('pointermove',event=>{if(this.hold?.button!==button)return;const r=button.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)this.stopHold();});
          button.addEventListener('pointerup',()=>this.finishHold());
          button.addEventListener('pointercancel',()=>this.stopHold());button.addEventListener('lostpointercapture',()=>this.stopHold());button.addEventListener('blur',()=>this.stopHold());
          button.addEventListener('keydown',event=>{if(event.key==='Escape'){this.stopHold();return;}if(!['Enter',' '].includes(event.key))return;event.preventDefault();if(!event.repeat)this.startHold(button,direction,'keyboard');});
          button.addEventListener('keyup',event=>{if(['Enter',' '].includes(event.key)){event.preventDefault();this.finishHold();}});
          button.addEventListener('click',event=>{if(event.detail===0&&!this.hold&&!button.disabled)this.step(direction);});
        });
        this.preference=matchMedia('(prefers-reduced-motion: reduce)');
        this.motionChange=()=>{if(this.reduced())this.update(true);};this.motionObserver=new MutationObserver(this.motionChange);
        this.deactivate=()=>this.stopHold();
      }
      this.motionObserver.observe(document.documentElement,{attributes:true,attributeFilter:['data-reduced','data-motion-override']});
      this.preference.addEventListener('change',this.motionChange);window.addEventListener('blur',this.deactivate);document.addEventListener('visibilitychange',this.deactivate);
      this.resizeObserver=new ResizeObserver(()=>this.drawMarks(this.fillLevel??Math.min(this.amount,this.capacity)));this.resizeObserver.observe(this.svg);
      this.update(true);
    }
    reduced(){return document.documentElement.hasAttribute('data-reduced')||(!document.documentElement.hasAttribute('data-motion-override')&&this.preference?.matches);}
    attributeChangedCallback(){if(this.digits)this.update();}
    startHold(button,direction,kind){
      this.stopHold();if(button.disabled)return;
      this.hold={button,direction,kind,repeated:false};button.dataset.pressed='true';
      const tick=()=>{if(!this.hold)return;this.hold.repeated=true;if(this.step(direction)&&this.hold)this.holdTimer=setTimeout(tick,75);else this.stopHold();};
      this.holdTimer=setTimeout(tick,280);
    }
    finishHold(){const hold=this.hold;if(!hold)return;const tap=!hold.repeated&&!hold.button.disabled;this.stopHold();if(tap)this.step(hold.direction);}
    stopHold(){clearTimeout(this.holdTimer);if(this.hold){delete this.hold.button.dataset.pressed;this.hold=null;this.querySelector('.page-counter-status').textContent=`${this.amount} pages`;}}
    step(direction){const previous=this.amount;this.amount=previous+direction;if(this.amount!==previous){this.dispatchEvent(new CustomEvent('change',{bubbles:true,detail:{amount:this.amount}}));if(!this.hold)this.querySelector('.page-counter-status').textContent=`${this.amount} pages`;}return direction>0?this.amount<this.maximum:this.amount>0;}
    update(immediate=false){
      const value=this.amount,previous=this.previousAmount;
      this.buttons[0].disabled=value===0;this.buttons[1].disabled=value===this.maximum;
      if(this.hold?.button.disabled)this.stopHold();
      this.digits.setAttribute('aria-label',`${value} pages`);
      if(!this.hold)this.querySelector('.page-counter-status').textContent=`${value} pages`;
      this.querySelector('.page-counter-marks').setAttribute('aria-label',`${value} pages. Each mark is one page.`);
      const overflow=this.querySelector('.page-counter-overflow');overflow.hidden=value<=this.capacity;overflow.textContent=`${this.capacity} shown · ${value-this.capacity} more pages`;
      if(previous!==value||immediate)this.rollDigits(value,previous,immediate);
      this.previousAmount=value;
      cancelAnimationFrame(this.fillFrame);
      const target=Math.min(value,this.capacity),from=this.fillLevel??target;
      if(immediate||this.reduced()||from===target){this.drawMarks(target);return;}
      const start=performance.now();
      const tick=now=>{const t=Math.min(1,(now-start)/180);this.drawMarks(from+(target-from)*curve(t));if(t<1)this.fillFrame=requestAnimationFrame(tick);};
      this.fillFrame=requestAnimationFrame(tick);
    }
    rollDigits(value,previous,immediate){
      const outgoing=this.currentDigits,style=outgoing?getComputedStyle(outgoing):null,from=style?{transform:style.transform,opacity:style.opacity}:null;
      this.animations.forEach(animation=>animation.cancel());this.animations=[];
      if(outgoing)this.digits.replaceChildren(outgoing);
      const incoming=document.createElement('span');incoming.textContent=value;incoming.className='page-counter-number';incoming.setAttribute('aria-hidden','true');this.currentDigits=incoming;this.digits.append(incoming);
      if(!outgoing||immediate||this.reduced()){this.digits.replaceChildren(incoming);return;}
      const offset=value>previous?10:-10,options={duration:180,easing:'cubic-bezier(.2,.8,.2,1)',fill:'both'};
      this.animations=[outgoing.animate([from,{transform:`translateY(${-offset}px)`,opacity:0}],options),incoming.animate([{transform:`translateY(${offset}px)`,opacity:0},{transform:'translateY(0)',opacity:1}],options)];
      Promise.all(this.animations.map(a=>a.finished)).then(()=>{if(this.currentDigits===incoming){this.digits.replaceChildren(incoming);this.animations.forEach(a=>a.cancel());this.animations=[];}}).catch(()=>{});
    }
    drawMarks(level){
      this.fillLevel=level;
      const count=this.capacity,width=this.svg.getBoundingClientRect().width||300,height=48,gap=Math.min(5,width/(count*2)),markWidth=Math.max(0,(width-(count-1)*gap)/count);
      this.svg.setAttribute('viewBox',`0 0 ${width} ${height}`);
      if(this.svg.children.length!==count*2){this.svg.replaceChildren();for(let i=0;i<count*2;i++){const rect=document.createElementNS('http://www.w3.org/2000/svg','rect');rect.setAttribute('fill',i<count?'#1f1c24':'#bdadd9');this.svg.append(rect);}}
      [...this.svg.children].forEach((rect,i)=>{const index=i%count,fill=i<count?1:clamp(level-index,0,1),filledHeight=height*fill;rect.setAttribute('x',index*(markWidth+gap));rect.setAttribute('y',height-filledHeight);rect.setAttribute('width',markWidth);rect.setAttribute('height',filledHeight);rect.setAttribute('rx',Math.min(3.5,markWidth/2,filledHeight/2));});
    }
    disconnectedCallback(){this.stopHold();cancelAnimationFrame(this.fillFrame);this.animations?.forEach(a=>a.cancel());this.resizeObserver?.disconnect();this.motionObserver?.disconnect();this.preference?.removeEventListener('change',this.motionChange);window.removeEventListener('blur',this.deactivate);document.removeEventListener('visibilitychange',this.deactivate);}
  }
  customElements.define('today-page-counter',TodayPageCounter);
})();
