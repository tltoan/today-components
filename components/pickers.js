/* Trial and reminder picker proposals. No persistence, notification permission or routes. */
(() => {
  let nextId=0;
  const reduced=()=>document.documentElement.hasAttribute('data-reduced')||(!document.documentElement.hasAttribute('data-motion-override')&&matchMedia('(prefers-reduced-motion:reduce)').matches);
  const clamp=(n,min,max)=>Math.min(max,Math.max(min,n));
  const pad=n=>String(n).padStart(2,'0');
  const event=(el,name,detail)=>el.dispatchEvent(new CustomEvent(name,{bubbles:true,detail}));
  const press=(label,attrs='')=>'<today-button '+attrs+' label="'+label+'"></today-button>';
  const settle=el=>{el._settle?.cancel();if(!reduced())el._settle=el.animate([{opacity:.5,transform:'translateY(5px)'},{opacity:1,transform:'translateY(0)'}],{duration:420,easing:'cubic-bezier(.22,.76,.28,1)'});};

  class PickerWheel extends HTMLElement {
    configure({values,value,label,axis='y'}){
      this.values=values;this.axis=axis;this._value=String(value);this._label=label;
      if(this.isConnected)this.mount();
    }
    connectedCallback(){if(this.values)this.mount();}
    mount(){
      this._abort?.abort();this._abort=new AbortController();const options={signal:this._abort.signal};
      this.dataset.axis=this.axis;const id='pk-wheel-'+(++nextId);
      this.innerHTML='<div class="pk-wheel-scroll" role="listbox" tabindex="0"></div>';
      this.scroller=this.firstElementChild;this.scroller.setAttribute('aria-label',this._label);this.scroller.setAttribute('aria-orientation',this.axis==='x'?'horizontal':'vertical');
      this.values.forEach((v,i)=>{const option=document.createElement('div');option.className='pk-wheel-option';option.id=id+'-'+i;option.setAttribute('role','option');option.dataset.index=i;option.textContent=v;this.scroller.append(option);});
      this.scroller.addEventListener('scroll',()=>{clearTimeout(this._timer);this._timer=setTimeout(()=>this.settle(),120);},options);
      this.scroller.addEventListener('wheel',()=>{this._programmatic=false;},options);
      this.scroller.addEventListener('pointerdown',e=>{this._programmatic=false;this._ignoreClick=false;if(e.pointerType!=='mouse'||e.button!==0)return;this._drag={id:e.pointerId,start:this.axis==='x'?e.clientX:e.clientY,scroll:this.axis==='x'?this.scroller.scrollLeft:this.scroller.scrollTop,moved:false};},options);
      this.scroller.addEventListener('pointermove',e=>{const d=this._drag;if(!d||d.id!==e.pointerId)return;const delta=(this.axis==='x'?e.clientX:e.clientY)-d.start;if(!d.moved&&Math.abs(delta)<4)return;d.moved=true;e.preventDefault();this.scroller.setPointerCapture(e.pointerId);this.scroller.classList.add('pk-wheel-dragging');this.scroller[this.axis==='x'?'scrollLeft':'scrollTop']=d.scroll-delta;},options);
      const release=()=>{const d=this._drag;this._drag=null;this.scroller.classList.remove('pk-wheel-dragging');if(d?.moved){this._ignoreClick=true;const position=this.axis==='x'?this.scroller.scrollLeft:this.scroller.scrollTop;this.choose(clamp(Math.round(position/44),0,this.values.length-1));}};
      this.scroller.addEventListener('pointerup',release,options);this.scroller.addEventListener('pointercancel',release,options);this.scroller.addEventListener('lostpointercapture',release,options);
      this.scroller.addEventListener('click',e=>{if(this._ignoreClick){this._ignoreClick=false;return;}const item=e.target.closest('[data-index]');if(item)this.choose(Number(item.dataset.index));},options);
      this.scroller.addEventListener('keydown',e=>{const keys=this.axis==='x'?['ArrowLeft','ArrowRight']:['ArrowUp','ArrowDown'];let i=this.values.indexOf(this._value);if(e.key===keys[0])i--;else if(e.key===keys[1])i++;else if(e.key==='Home')i=0;else if(e.key==='End')i=this.values.length-1;else return;e.preventDefault();this.choose(clamp(i,0,this.values.length-1));},options);
      this._resize?.disconnect();this._resize=new ResizeObserver(()=>this.position(false));this._resize.observe(this);
      this.mark();this.position(false);
    }
    get value(){return this._value;}
    set value(value){this._programmatic=false;this._value=String(value);if(this.scroller){this.mark();this.position(false);}}
    mark(){const i=this.values.indexOf(this._value);this.scroller.querySelectorAll('[role=option]').forEach((el,n)=>el.setAttribute('aria-selected',n===i));this.scroller.setAttribute('aria-activedescendant',this.scroller.children[i]?.id||'');}
    position(smooth){const i=this.values.indexOf(this._value);if(i<0)return;this.scroller.scrollTo({[this.axis==='x'?'left':'top']:i*44,behavior:smooth&&!reduced()?'smooth':'instant'});}
    choose(index){this._programmatic=true;this._value=this.values[index];this.mark();this.position(true);event(this,'change',{value:this._value});}
    commit(){if(!this._programmatic)this.settle();}
    settle(){if(!this.isConnected||this._drag)return;this._programmatic=false;const index=clamp(Math.round((this.axis==='x'?this.scroller.scrollLeft:this.scroller.scrollTop)/44),0,this.values.length-1);const value=this.values[index];if(value!==this._value){this._value=value;this.mark();event(this,'change',{value});}}
    disconnectedCallback(){clearTimeout(this._timer);this._abort?.abort();this._resize?.disconnect();}
  }
  customElements.define('today-picker-wheel',PickerWheel);

  class TrialPicker extends HTMLElement {
    static observedAttributes=['value'];
    get value(){const raw=this.getAttribute('value'),n=Number(raw);return clamp(raw===null||raw.trim()===''||!Number.isFinite(n)?21:Math.trunc(n),this.min,this.max);}
    set value(value){this.setAttribute('value',value);}
    get min(){return Math.max(1,Math.trunc(Number(this.getAttribute('min')))||1);}
    get max(){return Math.max(this.min,Math.trunc(Number(this.getAttribute('max')))||90);}
    connectedCallback(){if(this._mounted)return;this._mounted=true;this.build();}
    attributeChangedCallback(){if(this._mounted)this.update();}
    build(){
      const variant=['cards','ruler','compact'].includes(this.getAttribute('variant'))?this.getAttribute('variant'):'cards';this.dataset.variant=variant;
      const presets=[14,21,28].filter(v=>v>=this.min&&v<=this.max);
      const cards='<div class="pk-week-cards" role="group" aria-label="Trial length">'+presets.map(v=>'<button type="button" data-days="'+v+'" aria-pressed="false"><span class="pk-card-kicker">'+(v===21?'Default':'&nbsp;')+'</span><strong>'+v/7+'</strong><span>weeks</span><small>'+v+' days</small><i aria-hidden="true"></i></button>').join('')+'</div>';
      const hero='<div class="pk-trial-value"><output></output><span>days</span></div><p class="pk-duration-equivalent"></p>';
      const custom='<div class="pk-custom"><label>Trial length in days<input type="number" inputmode="numeric" min="'+this.min+'" max="'+this.max+'" step="1" aria-describedby="pk-trial-error-'+(++nextId)+'"></label>'+press('Use length','variant="secondary" data-apply')+'<p class="pk-error" id="pk-trial-error-'+nextId+'" role="status"></p></div>';
      this.innerHTML=variant==='compact'?'<div class="pk-default-label">Suggested starting point</div>'+hero+'<p class="pk-soft-copy">A little time to find your rhythm.</p>'+press('Change length','variant="quiet" data-expand')+'<div class="pk-length-panel"><div><div class="pk-expanded-inner">'+cards+custom+'</div></div></div>':hero+(variant==='cards'?cards:'<div class="pk-ruler-wrap"><span class="pk-ruler-caret" aria-hidden="true"></span><today-picker-wheel></today-picker-wheel></div><p class="pk-wheel-hint">Swipe through days, or tap a number.</p>')+press('Choose another length','variant="quiet" data-expand')+'<div class="pk-length-panel"><div>'+custom+'</div></div>';
      this.innerHTML+='<div class="pk-trial-summary"><span class="pk-summary-mark" aria-hidden="true"></span><p><strong>Then pause and reflect.</strong><span>Your chosen days stay the same.</span></p></div>';
      this._disclosure=new TodayUI.Disclosure(this.querySelector('.pk-length-panel'),{trigger:this.querySelector('[data-expand] button')});
      this.addEventListener('click',this._onClick=e=>{const b=e.target.closest('[data-days]');if(b)this.select(Number(b.dataset.days));});
      this.addEventListener('today-activate',this._activate=e=>{if(e.target.matches('[data-expand]')){this._disclosure.toggle();if(this._disclosure.open)this.querySelector('input').value=this.value;}if(e.target.matches('[data-apply]'))this.apply();});
      this.querySelector('input').addEventListener('input',()=>this.validate());
      this.querySelector('input').addEventListener('change',e=>e.stopPropagation());
      this.querySelector('input').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();this.apply();}if(e.key==='Escape')this._disclosure.setOpen(false);});
      this.querySelector('today-picker-wheel')?.configure({axis:'x',values:Array.from({length:this.max-this.min+1},(_,i)=>String(i+this.min)),value:this.value,label:'Trial length in days'});
      this.querySelector('today-picker-wheel')?.addEventListener('change',e=>{e.stopPropagation();this.select(Number(e.detail.value),true);});
      this.update();
    }
    validate(){const input=this.querySelector('input');const n=Number(input.value),valid=input.value.trim()!==''&&Number.isInteger(n)&&n>=this.min&&n<=this.max;input.setAttribute('aria-invalid',String(!valid));this.querySelector('.pk-error').textContent=valid?'':'Choose '+this.min+'–'+this.max+' whole days.';this.querySelector('[data-apply]').toggleAttribute('disabled',!valid);return valid;}
    apply(){if(this.validate()){this.select(Number(this.querySelector('input').value));this._disclosure.setOpen(false);}}
    select(value,fromWheel=false){if(this.value===value)return;this._fromWheel=fromWheel;this.value=value;this._fromWheel=false;settle(this.querySelector('output'));event(this,'change',{days:this.value});}
    update(){if(!this.querySelector('output'))return;this.querySelector('output').textContent=this.value;this.querySelector('.pk-duration-equivalent').textContent=this.value%7===0?this.value/7+' '+(this.value===7?'week':'weeks'):'Choose when to check in';this.querySelectorAll('[data-days]').forEach(b=>b.setAttribute('aria-pressed',Number(b.dataset.days)===this.value));this.querySelector('input').value=this.value;this.validate();if(!this._fromWheel&&this.querySelector('today-picker-wheel'))this.querySelector('today-picker-wheel').value=this.value;}
    disconnectedCallback(){this.querySelector('output')?._settle?.cancel();}
  }
  customElements.define('today-trial-picker',TrialPicker);

  const validTime=value=>/^([01]\d|2[0-3]):[0-5]\d$/.test(value||'');
  const timeParts=value=>{const [h,m]=value.split(':').map(Number);return{hour:h%12||12,minute:m,period:h<12?'AM':'PM'};};
  const serialize=p=>pad(p.hour%12+(p.period==='PM'?12:0))+':'+pad(p.minute);
  const timeLabel=value=>{const p=timeParts(value);return p.hour+':'+pad(p.minute)+' '+p.period;};
  class TimePicker extends HTMLElement {
    static observedAttributes=['value','disabled'];
    get value(){return validTime(this.getAttribute('value'))?this.getAttribute('value'):'21:30';}
    set value(value){if(validTime(value))this.setAttribute('value',value);}
    get editing(){return Boolean(this._editing);}
    connectedCallback(){if(this._mounted)return;this._mounted=true;this.build();}
    attributeChangedCallback(name){if(this._mounted){if(name==='disabled'){if(this.hasAttribute('disabled'))this.cancel(false);this.querySelector('[data-edit-time]').toggleAttribute('disabled',this.hasAttribute('disabled'));}else{this._draft=timeParts(this.value);this.update();this.sync();}}}
    build(){
      const variant=['inline','wheel','dial'].includes(this.getAttribute('variant'))?this.getAttribute('variant'):'inline';this.dataset.variant=variant;this._draft=timeParts(this.value);this._unit='hour';
      const period='<div class="pk-period" role="group" aria-label="AM or PM"><span aria-hidden="true"></span><button type="button" data-period="AM" aria-pressed="false">AM</button><button type="button" data-period="PM" aria-pressed="false">PM</button></div>';
      const fields='<div class="pk-clock-fields"><label><span>Hour</span><input aria-label="Hour" inputmode="numeric" type="number" min="1" max="12" step="1" data-unit="hour"></label><b aria-hidden="true">:</b><label><span>Minute</span><input aria-label="Minute" inputmode="numeric" type="number" min="0" max="59" step="1" data-unit="minute"></label></div>';
      let control=fields+period;
      if(variant==='wheel')control='<div class="pk-time-wheels"><span class="pk-wheel-band" aria-hidden="true"></span><div><span class="pk-wheel-title">Hour</span><today-picker-wheel data-wheel="hour"></today-picker-wheel></div><div><span class="pk-wheel-title">Minute</span><today-picker-wheel data-wheel="minute"></today-picker-wheel></div><div><span class="pk-wheel-title">Period</span><today-picker-wheel data-wheel="period"></today-picker-wheel></div></div>';
      if(variant==='dial')control='<div class="pk-dial-tabs" role="group" aria-label="Adjust hours or minutes"><button type="button" data-dial-unit="hour" aria-pressed="true"></button><b>:</b><button type="button" data-dial-unit="minute" aria-pressed="false"></button></div><div class="pk-dial" role="slider" tabindex="0" aria-label="Hour" aria-valuemin="1" aria-valuemax="12"><div class="pk-dial-hand" aria-hidden="true"><span></span></div><div class="pk-dial-numbers" aria-hidden="true"></div><span class="pk-dial-center" aria-hidden="true"></span></div>'+period+'<div class="pk-dial-nudge">'+press('','variant="quiet" symbol="−" accessible-label="Decrease selected time unit" data-nudge="-1"')+'<span>Tap the dial or adjust by one.</span>'+press('','variant="quiet" symbol="+" accessible-label="Increase selected time unit" data-nudge="1"')+'</div>';
      this.innerHTML='<div class="pk-current-panel"><div><button type="button" class="pk-saved-time" data-edit-time><span>Reminder time</span><strong></strong><span class="pk-edit-label">Edit <today-icon name="pencil"></today-icon></span></button></div></div><div class="pk-time-panel"><div><div class="pk-time-editor"><div class="pk-edit-heading"><span>Choose a time</span>'+press('Cancel','variant="quiet" data-cancel')+'</div>'+control+'<p class="pk-error" role="status"></p>'+press('Use this time','variant="primary" block data-confirm')+'</div></div></div><p class="pk-time-feedback" role="status"></p>';
      this._summaryDisclosure=new TodayUI.Disclosure(this.querySelector('.pk-current-panel'),{open:true});
      this._disclosure=new TodayUI.Disclosure(this.querySelector('.pk-time-panel'),{trigger:this.querySelector('[data-edit-time]')});
      this.querySelector('[data-edit-time]').onclick=()=>this._editing?this.cancel():this.open(true);
      this.addEventListener('today-activate',e=>{if(e.target.matches('[data-cancel]'))this.cancel();if(e.target.matches('[data-confirm]'))this.confirm();if(e.target.hasAttribute('data-nudge'))this.nudge(Number(e.target.dataset.nudge));});
      this.addEventListener('keydown',e=>{if(e.key==='Escape'&&this._editing){e.preventDefault();this.cancel();}});
      this.querySelectorAll('[data-period]').forEach(b=>b.onclick=()=>{this._draft.period=b.dataset.period;this.querySelectorAll('[data-period]').forEach(p=>p.setAttribute('aria-pressed',p===b));this.querySelector('.pk-period').style.setProperty('--pk-period',b.dataset.period==='PM'?1:0);});
      const errorId='pk-time-error-'+(++nextId);this.querySelector('.pk-error').id=errorId;
      this.querySelectorAll('input[data-unit]').forEach(input=>{input.setAttribute('aria-describedby',errorId);input.addEventListener('change',e=>e.stopPropagation());input.addEventListener('input',()=>{if(this.validateFields())this._draft[input.dataset.unit]=Number(input.value);});input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();this.confirm();}});});
      if(variant==='wheel'){
        const values={hour:Array.from({length:12},(_,i)=>String(i+1)),minute:Array.from({length:60},(_,i)=>pad(i)),period:['AM','PM']};
        this.querySelectorAll('[data-wheel]').forEach(w=>{const unit=w.dataset.wheel;w.configure({values:values[unit],value:unit==='minute'?pad(this._draft[unit]):String(this._draft[unit]),label:unit==='period'?'AM or PM':unit==='hour'?'Hour':'Minute'});w.addEventListener('change',e=>{e.stopPropagation();this._draft[unit]=unit==='period'?e.detail.value:Number(e.detail.value);});});
      }
      if(variant==='dial')this.bindDial();
      this.update();this.sync();this.querySelector('[data-edit-time]').disabled=this.hasAttribute('disabled');
    }
    validateFields(){let valid=true;this.querySelectorAll('input[data-unit]').forEach(input=>{const n=Number(input.value),okay=input.value!==''&&Number.isInteger(n)&&n>=Number(input.min)&&n<=Number(input.max);input.setAttribute('aria-invalid',String(!okay));if(!okay)valid=false;});this.querySelector('.pk-error').textContent=valid?'':'Use an hour from 1–12 and a minute from 00–59.';this.querySelector('[data-confirm]').toggleAttribute('disabled',!valid);return valid;}
    open(focus=false){if(this.hasAttribute('disabled'))return;this._draft=timeParts(this.value);this._editing=true;this.sync();this.querySelector('.pk-error').textContent='';this.querySelector('[data-confirm]').removeAttribute('disabled');this._summaryDisclosure.setOpen(false);this._disclosure.setOpen(true);if(focus)this.querySelector('input,.pk-wheel-scroll,[data-dial-unit]')?.focus({preventScroll:true});this.querySelector('.pk-time-feedback').textContent='';event(this,'picker-open',{});}
    cancel(announce=true){if(!this._editing)return;this._editing=false;this._draft=timeParts(this.value);this._summaryDisclosure.setOpen(true);this._disclosure.setOpen(false);this.sync();if(announce)this.querySelector('.pk-time-feedback').textContent='Kept '+timeLabel(this.value)+'.';event(this,'picker-cancel',{value:this.value});}
    confirm(){if(!this._editing||!this.validateFields())return;this.querySelectorAll('input[data-unit]').forEach(input=>this._draft[input.dataset.unit]=Number(input.value));this.querySelectorAll('[data-wheel]').forEach(w=>w.commit());const value=serialize(this._draft);this.value=value;this._editing=false;this._summaryDisclosure.setOpen(true);this._disclosure.setOpen(false);this.querySelector('.pk-time-feedback').textContent=timeLabel(value)+' selected.';settle(this.querySelector('.pk-saved-time strong'));event(this,'change',{value});}
    update(){if(this.querySelector('.pk-saved-time strong'))this.querySelector('.pk-saved-time strong').textContent=timeLabel(this.value);}
    sync(){
      if(!this._draft)return;
      this.querySelectorAll('input[data-unit]').forEach(input=>{input.value=input.dataset.unit==='minute'?pad(this._draft.minute):this._draft.hour;input.removeAttribute('aria-invalid');});
      this.querySelectorAll('[data-period]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.period===this._draft.period));this.querySelector('.pk-period')?.style.setProperty('--pk-period',this._draft.period==='PM'?1:0);
      this.querySelectorAll('[data-wheel]').forEach(w=>w.value=w.dataset.wheel==='minute'?pad(this._draft.minute):String(this._draft[w.dataset.wheel]));
      if(this.dataset.variant==='dial')this.drawDial();
    }
    bindDial(){
      this.querySelectorAll('[data-dial-unit]').forEach(b=>b.onclick=()=>{this._unit=b.dataset.dialUnit;this.drawDial();});
      const dial=this.querySelector('.pk-dial');
      const point=e=>{const r=dial.getBoundingClientRect(),x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2;if(Math.hypot(x,y)<25)return;const angle=(Math.atan2(y,x)*180/Math.PI+450)%360;this._draft[this._unit]=this._unit==='hour'?(Math.round(angle/30)%12||12):Math.round(angle/6)%60;this.drawDial();};
      dial.addEventListener('pointerdown',e=>{if(e.button!==0)return;e.preventDefault();dial.focus({preventScroll:true});dial.setPointerCapture(e.pointerId);this._dragging=e.pointerId;point(e);});
      dial.addEventListener('pointermove',e=>{if(this._dragging===e.pointerId){dial.dataset.dragging='';point(e);}});
      const release=()=>{this._dragging=null;delete dial.dataset.dragging;};dial.addEventListener('pointerup',release);dial.addEventListener('pointercancel',release);dial.addEventListener('lostpointercapture',release);
      dial.addEventListener('keydown',e=>{if(['ArrowRight','ArrowUp','ArrowLeft','ArrowDown'].includes(e.key)){e.preventDefault();this.nudge(e.key==='ArrowRight'||e.key==='ArrowUp'?1:-1);}else if(e.key==='Home'||e.key==='End'){e.preventDefault();this._draft[this._unit]=this._unit==='hour'?(e.key==='Home'?1:12):(e.key==='Home'?0:59);this.drawDial();}});
    }
    nudge(delta){this._draft[this._unit]=this._unit==='hour'?((this._draft.hour-1+delta+12)%12)+1:(this._draft.minute+delta+60)%60;this.drawDial();}
    drawDial(){
      const unit=this._unit,value=this._draft[unit],dial=this.querySelector('.pk-dial');if(!dial)return;
      this.querySelectorAll('[data-dial-unit]').forEach(b=>{b.textContent=b.dataset.dialUnit==='minute'?pad(this._draft.minute):this._draft.hour;b.setAttribute('aria-pressed',b.dataset.dialUnit===unit);b.setAttribute('aria-label',b.dataset.dialUnit==='minute'?'Adjust minutes, '+pad(this._draft.minute):'Adjust hours, '+this._draft.hour);});
      dial.setAttribute('aria-label',unit==='hour'?'Hour':'Minute');dial.setAttribute('aria-valuemin',unit==='hour'?1:0);dial.setAttribute('aria-valuemax',unit==='hour'?12:59);dial.setAttribute('aria-valuenow',value);
      if(this._drawnUnit!==unit){this.querySelector('.pk-dial-numbers').innerHTML=Array.from({length:12},(_,i)=>'<span style="--pk-index:'+i+'">'+(unit==='hour'?(i||12):pad(i*5))+'</span>').join('');this._drawnUnit=unit;}
      const angle=unit==='hour'?value%12*30:value*6;let previous=this._angle??angle;this._angle=previous+(((angle-previous)%360+540)%360)-180;this.querySelector('.pk-dial-hand').style.transform='rotate('+this._angle+'deg)';
    }
    disconnectedCallback(){this.querySelector('.pk-saved-time strong')?._settle?.cancel();}
  }
  customElements.define('today-time-picker',TimePicker);
})();
