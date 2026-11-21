(() => {
  const reduced=()=>document.documentElement.hasAttribute('data-reduced')||(!document.documentElement.hasAttribute('data-motion-override')&&matchMedia('(prefers-reduced-motion: reduce)').matches);
  const make=(tag,cls,text)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(text!=null)el.textContent=text;return el;};
  class TodayButton extends HTMLElement {
    static observedAttributes=['label','variant','icon','symbol','disabled','busy','selected','accessible-label','trailing-icon','rotation'];
    connectedCallback(){
      if(!this.button){
        this.button=make('button','tc-button');this.button.type='button';
        this.button.addEventListener('click',event=>{
          if(this.hasAttribute('disabled')||this.hasAttribute('busy')){event.preventDefault();event.stopImmediatePropagation();return;}
          if(['choice','day'].includes(this.getAttribute('variant'))){this.toggleAttribute('selected');this.dispatchEvent(new CustomEvent('change',{bubbles:true,detail:{selected:this.hasAttribute('selected')}}));}
          this.dispatchEvent(new CustomEvent('today-activate',{bubbles:true,detail:{value:this.getAttribute('value')||this.getAttribute('label')||this.getAttribute('accessible-label')}}));
        });
        this.replaceChildren(this.button);
      }
      this.render();
    }
    attributeChangedCallback(){if(this.button)this.render();}
    render(){
      const b=this.button,variant=this.getAttribute('variant')||'primary',busy=this.hasAttribute('busy');
      b.dataset.variant=variant;b.disabled=this.hasAttribute('disabled');b.setAttribute('aria-busy',String(busy));
      if(busy)b.setAttribute('aria-disabled','true');else b.removeAttribute('aria-disabled');
      if(['choice','day'].includes(variant))b.setAttribute('aria-pressed',String(this.hasAttribute('selected')));else b.removeAttribute('aria-pressed');
      const label=this.getAttribute('label')||'',accessible=this.getAttribute('accessible-label')||label||'Action';
      b.setAttribute('aria-label',busy?'Saving, '+accessible:accessible);
      const face=make('span','tc-button__face');
      if(this.hasAttribute('icon')){
        const icon=TodayIcons.create(this.getAttribute('icon'));
        const rotation=Number(this.getAttribute('rotation'))||0;icon.style.transform='rotate('+rotation+'deg)';face.append(icon);
      }
      if(this.hasAttribute('symbol')){const symbol=make('span','tc-symbol',this.getAttribute('symbol'));symbol.setAttribute('aria-hidden','true');face.append(symbol);}
      if(label)face.append(make('span','tc-button__label',busy?'Saving…':label));
      if(busy&&!label)face.append(make('span','tc-button__status','…'));
      if(this.hasAttribute('trailing-icon')){const icon=TodayIcons.create(this.getAttribute('trailing-icon'));icon.className='tc-button__trailing';face.append(icon);}
      b.replaceChildren(face);
    }
  }
  class TodaySwitch extends HTMLElement {
    static observedAttributes=['checked','disabled','label'];
    connectedCallback(){
      if(!this.button){this.button=make('button','tc-switch');this.button.type='button';this.button.setAttribute('role','switch');this.button.append(make('span'));this.replaceChildren(this.button);
        this.button.addEventListener('click',()=>{this.checked=!this.checked;this.dispatchEvent(new Event('change',{bubbles:true}));});}
      this.update();
    }
    get checked(){return this.hasAttribute('checked');}set checked(value){this.toggleAttribute('checked',Boolean(value));}
    attributeChangedCallback(){if(this.button)this.update();}
    update(){this.button.setAttribute('aria-label',this.getAttribute('label')||'Toggle');this.button.setAttribute('aria-checked',String(this.checked));this.button.disabled=this.hasAttribute('disabled');}
  }
  class TodayStepper extends HTMLElement {
    static observedAttributes=['value','min','max','step','unit','label','disabled'];
    connectedCallback(){
      if(!this.output){
        const row=make('div','tc-stepper');row.setAttribute('role','group');
        this.minus=make('button');this.plus=make('button');this.minus.type=this.plus.type='button';
        this.minus.append(TodayIcons.create('decrease'));this.plus.append(TodayIcons.create('increase'));
        const metric=make('div','tc-stepper-value');this.output=make('output');this.output.setAttribute('aria-live','off');this.unit=make('span','tc-stepper-unit');metric.append(this.output,this.unit);row.append(this.minus,metric,this.plus);
        this.status=make('span','tc-sr-only');this.status.setAttribute('role','status');this.status.setAttribute('aria-atomic','true');this.replaceChildren(row,this.status);this.row=row;
        [[this.minus,-1],[this.plus,1]].forEach(([b,d])=>this.bind(b,d));
        this._stop=()=>{this._cancelled=true;this._suppress=true;this.stop();};this._hidden=()=>{if(document.hidden)this._stop();};
      }
      window.addEventListener('blur',this._stop);document.addEventListener('visibilitychange',this._hidden);this.update();
    }
    disconnectedCallback(){this.stop();window.removeEventListener('blur',this._stop);document.removeEventListener('visibilitychange',this._hidden);this._animation?.cancel();}
    attributeChangedCallback(){if(this.output)this.update();}
    number(name,fallback){const raw=this.getAttribute(name);const n=raw===null?NaN:Number(raw);return Number.isFinite(n)?n:fallback;}
    get min(){return this.number('min',0);}get max(){return Math.max(this.min,this.number('max',1000000));}
    get value(){return Math.min(this.max,Math.max(this.min,this.number('value',this.min)));}set value(n){this.setAttribute('value',String(n));}
    change(direction){
      const next=Math.max(this.min,Math.min(this.max,this.value+direction*Math.max(1,this.number('step',1))));
      if(this.hasAttribute('disabled')||next===this.value)return false;
      this.value=next;
      this.dispatchEvent(new CustomEvent('change',{bubbles:true,detail:{value:next}}));
      this.status.textContent=next+' '+(this.getAttribute('unit')||'');return true;
    }
    update(){
      const next=this.value.toLocaleString(),old=this.output.textContent;
      this.output.style.setProperty('--tc-amount-size',next.length>6?'24px':next.length>4?'30px':'38px');
      this.output.textContent=next;this.unit.textContent=this.getAttribute('unit')||'';this.status.textContent=this.value+' '+this.unit.textContent;
      this.row.setAttribute('aria-label',this.getAttribute('label')||'Amount');
      const label=this.getAttribute('label')||'amount';this.minus.setAttribute('aria-label','Decrease '+label);this.plus.setAttribute('aria-label','Increase '+label);
      this.minus.disabled=this.hasAttribute('disabled')||this.value<=this.min;this.plus.disabled=this.hasAttribute('disabled')||this.value>=this.max;
      if(this._active?.disabled)this.stop();
      if(old&&old!==next){this._animation?.cancel();if(!reduced())this._animation=this.output.animate([{opacity:.65,transform:'translateY(3px)'},{opacity:1,transform:'translateY(0)'}],{duration:180,easing:'cubic-bezier(.22,.76,.28,1)'});}
    }
    bind(button,direction){
      button.addEventListener('pointerdown',event=>{
        if(event.button!==0||button.disabled)return;this.stop();this._active=button;this._repeated=false;this._cancelled=false;button.dataset.pressed='';
        const repeat=()=>{if(this._active!==button)return;this._repeated=true;if(this.change(direction)&&this._active===button)this._timer=setTimeout(repeat,105);};
        this._timer=setTimeout(repeat,350);
      });
      button.addEventListener('pointerup',()=>{this._suppress=this._repeated||this._cancelled;this.stop();});
      const cancel=()=>{if(this._active===button){this._cancelled=true;this._suppress=true;this.stop();}};
      button.addEventListener('pointercancel',cancel);button.addEventListener('pointerleave',cancel);button.addEventListener('blur',cancel);
      button.addEventListener('click',event=>{if(event.detail!==0&&this._suppress){this._suppress=false;return;}this._suppress=false;this.change(direction);});
      button.addEventListener('keydown',event=>{if(event.key==='Escape'){this._suppress=true;this.stop();}});
    }
    stop(){clearTimeout(this._timer);if(this._active)delete this._active.dataset.pressed;this._active=null;}
  }
  class TodaySegmentedControl extends HTMLElement {
    static observedAttributes=['value','disabled','label'];
    connectedCallback(){
      if(!this._options){
        this._options=[...this.querySelectorAll('option')].map(o=>({value:o.value,label:o.textContent}));
        this.group=make('div','tc-segments');this.group.setAttribute('role','group');
        const highlight=make('span','tc-segments__highlight');highlight.setAttribute('aria-hidden','true');this.group.append(highlight);
        this._options.forEach(option=>{const b=make('button','',option.label);b.type='button';b.dataset.value=option.value;b.addEventListener('click',()=>this.select(option.value));this.group.append(b);});
        this.group.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key)||this.hasAttribute('disabled')||!this._options.length)return;e.preventDefault();let i=this._options.findIndex(o=>o.value===this.value);i=e.key==='Home'?0:e.key==='End'?this._options.length-1:(i+(e.key==='ArrowLeft'?-1:1)+this._options.length)%this._options.length;this.select(this._options[i].value);this.group.querySelectorAll('button')[i]?.focus();});
        this.replaceChildren(this.group);
      }
      this.update();
    }
    get value(){return this.getAttribute('value')||'';}set value(value){this.setAttribute('value',value);}
    select(value){if(this.hasAttribute('disabled')||value===this.value||!this._options.some(o=>o.value===value))return;this.value=value;this.dispatchEvent(new CustomEvent('change',{bubbles:true,detail:{value}}));}
    attributeChangedCallback(){if(this.group)this.update();}
    update(){const index=this._options.findIndex(o=>o.value===this.value);this.group.setAttribute('aria-label',this.getAttribute('label')||'Choose an option');this.group.style.setProperty('--tc-segment-count',Math.max(1,this._options.length));this.group.style.setProperty('--tc-segment-index',Math.max(0,index));this.group.toggleAttribute('data-empty',index<0);this.group.querySelectorAll('button').forEach((b,i)=>{b.disabled=this.hasAttribute('disabled');b.setAttribute('aria-pressed',String(i===index));});}
  }
  for(const [name,component] of [['today-button',TodayButton],['today-switch',TodaySwitch],['today-stepper',TodayStepper],['today-segmented-control',TodaySegmentedControl]])if(!customElements.get(name))customElements.define(name,component);
})();
