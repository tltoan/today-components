(() => {
  let serial=0;
  const letters=['qwertyuiop','asdfghjkl','zxcvbnm'];
  const numbers=['1234567890','-/:;()$&@','.,?!\'"+'];
  class TodayHabitEditor extends HTMLElement {
    connectedCallback(){
      if(this.dialog)return;
      const id=`habit-editor-${++serial}`;
      this.innerHTML=`<dialog class="habit-editor-dialog" id="${id}" aria-labelledby="${id}-title"><div class="habit-editor-screen"><div class="habit-editor-status" aria-hidden="true"><span>9:41</span><span class="habit-editor-battery"></span></div><header class="habit-editor-heading"><h2 id="${id}-title">New habit</h2><button class="habit-editor-skip" type="button">Skip for now</button></header><div class="habit-editor-writing"><label class="sr-only" for="${id}-description">What a habit you’ve been wanting to achieve?</label><textarea id="${id}-description" class="habit-editor-input" placeholder="What a habit you’ve been wanting to achieve?" maxlength="2000" spellcheck="true" autocomplete="off"></textarea></div><div class="habit-editor-actions"><button class="habit-editor-close" aria-label="Close new habit" type="button">×</button><today-plan-button class="habit-editor-build"></today-plan-button></div><div class="habit-editor-keyboard" aria-hidden="true"><div class="keyboard-suggestions"><button data-word="I" tabindex="-1">I</button><button data-word="want" tabindex="-1">want</button><button data-word="to" tabindex="-1">to</button></div><div class="keyboard-row keyboard-row-one"></div><div class="keyboard-row keyboard-row-two"></div><div class="keyboard-row keyboard-row-three"></div><div class="keyboard-row keyboard-row-four"><button data-key="numbers" tabindex="-1">123</button><button data-key="space" tabindex="-1">space</button><button data-key="return" tabindex="-1">return</button></div><div class="habit-editor-home" aria-hidden="true"></div></div></div></dialog>`;
      this.dialog=this.querySelector('dialog');this.screen=this.querySelector('.habit-editor-screen');this.input=this.querySelector('textarea');this.planButton=this.querySelector('today-plan-button');this.build=this.planButton.button;
      this.assessDescription=TodayUI.PlanReadiness.assess;this.assessmentVersion=0;
      this.numeric=false;this.shift=false;this.renderKeys();
      this.querySelector('.habit-editor-close').addEventListener('click',()=>this.close());
      this.querySelector('.habit-editor-skip').addEventListener('click',()=>this.close());
      this.dialog.addEventListener('cancel',event=>{event.preventDefault();this.close();});
      this.dialog.addEventListener('click',event=>{if(event.target!==this.dialog)return;const r=this.dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)this.close();});
      this.input.addEventListener('input',()=>this.queueAssessment());
      this.input.addEventListener('compositionstart',()=>{this.composing=true;this.invalidateAssessment();});
      this.input.addEventListener('compositionend',()=>{this.composing=false;this.queueAssessment();});
      this.build.addEventListener('click',()=>{if(this.build.disabled||this.assessedDescription!==this.input.value||!this.assessment?.ready)return;this.dispatchEvent(new CustomEvent('planrequest',{bubbles:true,detail:{description:this.input.value.trim()}}));});
      const keyboard=this.querySelector('.habit-editor-keyboard');
      keyboard.addEventListener('pointerdown',event=>event.preventDefault());
      keyboard.addEventListener('click',event=>{
        const button=event.target.closest('button');if(!button)return;
        const key=button.dataset.key;
        if(key==='shift'){this.shift=!this.shift;this.renderKeys();return;}
        if(key==='numbers'){this.numeric=!this.numeric;this.shift=false;this.renderKeys();return;}
        let start=this.input.selectionStart,end=this.input.selectionEnd,text='';
        if(key==='backspace'){if(start===end&&start>0)start-=Array.from(this.input.value.slice(0,start)).at(-1).length;}
        else text=button.dataset.word?`${start&&this.input.value[start-1]!==' '?' ':''}${button.dataset.word} `:key==='space'?' ':key==='return'?'\n':key;
        if(this.input.value.length-(end-start)+text.length>this.input.maxLength)return;
        this.input.setRangeText(text,start,end,'end');this.input.dispatchEvent(new Event('input',{bubbles:true}));this.input.focus({preventScroll:true});
        if(this.shift&&!this.numeric){this.shift=false;this.renderKeys();}
      });
    }
    invalidateAssessment(){
      clearTimeout(this.assessmentTimer);this.assessmentVersion++;this.planButton.setPending();
    }
    queueAssessment(){
      this.invalidateAssessment();
      if(!this.composing)this.assessmentTimer=setTimeout(()=>this.updateAssessment(),320);
    }
    async updateAssessment(immediate=false){
      clearTimeout(this.assessmentTimer);
      const version=++this.assessmentVersion,description=this.input.value;
      this.planButton.setPending();
      try{
        const assessment=await this.assessDescription(description);
        if(version!==this.assessmentVersion||description!==this.input.value)return;
        this.assessment=assessment;this.assessedDescription=description;
        this.planButton.setState(assessment,{immediate});
      }catch{
        if(version!==this.assessmentVersion)return;
        this.assessment={ready:false,label:'Try a little more',hint:'Your description is still here. Edit it to check again.'};
        this.planButton.setState(this.assessment,{immediate});
      }
    }
    renderKeys(){
      const rows=this.numeric?numbers:letters;
      const key=value=>`<button tabindex="-1" data-key="${value==='"'?'&quot;':value==='&'?'&amp;':value}">${value==='&'?'&amp;':value}</button>`;
      ['one','two','three'].forEach((name,index)=>{
        this.querySelector(`.keyboard-row-${name}`).innerHTML=(index===2?`<button tabindex="-1" data-key="shift" class="keyboard-shift${this.shift?' selected':''}">⇧</button>`:'')+[...rows[index]].map(value=>key(this.shift?value.toUpperCase():value)).join('')+(index===2?'<button tabindex="-1" data-key="backspace">⌫</button>':'');
      });
      this.querySelector('[data-key="numbers"]').textContent=this.numeric?'ABC':'123';
    }
    reduced(){return document.documentElement.hasAttribute('data-reduced')||(!document.documentElement.hasAttribute('data-motion-override')&&matchMedia('(prefers-reduced-motion: reduce)').matches);}
    show(trigger){
      if(this.dialog.open)return;
      this.updateAssessment(true);this.returnFocus=trigger;this.motion?.cancel();this.dialog.showModal();document.body.classList.add('habit-editor-open');
      this.syncViewport=()=>{if(matchMedia('(pointer:coarse)').matches)this.dialog.style.setProperty('--editor-height',`${Math.min(innerHeight,visualViewport?.height||innerHeight)}px`);};
      this.syncViewport();visualViewport?.addEventListener('resize',this.syncViewport);
      this.input.focus({preventScroll:true});
      if(!this.reduced()){
        const r=this.dialog.getBoundingClientRect(),origin=trigger.getBoundingClientRect(),x=origin.left+origin.width/2-r.left,y=origin.top+origin.height/2-r.top;
        const radius=Math.max(Math.hypot(x,y),Math.hypot(r.width-x,y),Math.hypot(x,r.height-y),Math.hypot(r.width-x,r.height-y));
        this.motion=this.dialog.animate([{clipPath:`circle(27px at ${x}px ${y}px)`,opacity:.5},{clipPath:`circle(${radius}px at ${x}px ${y}px)`,opacity:1}],{duration:330,easing:'cubic-bezier(.22,.76,.28,1)'});
      }
    }
    close(){
      this.invalidateAssessment();this.planButton.settle();this.composing=false;this.motion?.cancel();this.dialog.close();document.body.classList.remove('habit-editor-open');visualViewport?.removeEventListener('resize',this.syncViewport);this.returnFocus?.focus({preventScroll:true});
    }
    disconnectedCallback(){this.invalidateAssessment();this.motion?.cancel();visualViewport?.removeEventListener('resize',this.syncViewport);if(this.dialog?.open){this.dialog.close();document.body.classList.remove('habit-editor-open');}}
  }
  customElements.define('today-habit-editor',TodayHabitEditor);
})();
