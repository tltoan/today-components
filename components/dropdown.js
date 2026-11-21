(() => {
  let nextID=0;
  class TodayDropdown extends HTMLElement {
    static observedAttributes=['value'];
    connectedCallback(){
      if(this._disclosure){
        document.addEventListener('pointerdown',this._outside);
        document.addEventListener('focusin',this._outside);
        return;
      }
      const choices=[...this.querySelectorAll('option')].map(option=>({value:option.value,label:option.textContent}));
      this._choices=choices;
      if(!this.hasAttribute('value'))this.setAttribute('value',choices[0]?.value||'');
      const id=`today-dropdown-${++nextID}`;
      const trigger=document.createElement('button');
      trigger.className='today-dropdown__trigger';trigger.type='button';
      trigger.setAttribute('aria-label',this.getAttribute('label')||'Choose an option');
      trigger.setAttribute('aria-haspopup','listbox');trigger.setAttribute('aria-controls',id);
      trigger.innerHTML='<span></span><svg class="today-disclosure__chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg>';
      const panel=document.createElement('div');panel.className='today-dropdown__panel';
      const clip=document.createElement('div');clip.className='today-disclosure__content';
      const list=document.createElement('div');list.id=id;list.className='today-dropdown__list';
      list.setAttribute('role','listbox');list.setAttribute('aria-label',this.getAttribute('label')||'Options');
      this._options=choices.map(choice=>{
        const button=document.createElement('button');button.type='button';button.className='today-dropdown__option';
        button.setAttribute('role','option');button.dataset.value=choice.value;button.textContent=choice.label;
        button.addEventListener('click',()=>{this.value=choice.value;this._disclosure.setOpen(false);trigger.focus({preventScroll:true});this.dispatchEvent(new Event('change',{bubbles:true}));});
        list.append(button);return button;
      });
      clip.append(list);panel.append(clip);this.replaceChildren(trigger,panel);
      this._trigger=trigger;this._disclosure=new TodayUI.Disclosure(panel,{trigger});
      const open=()=>{this._disclosure.setOpen(true);this._options.find(option=>option.dataset.value===this.value)?.focus({preventScroll:true});};
      trigger.addEventListener('click',()=>this._disclosure.open?this._disclosure.setOpen(false):open());
      trigger.addEventListener('keydown',event=>{if(['ArrowDown','ArrowUp'].includes(event.key)){event.preventDefault();open();}});
      this.addEventListener('keydown',event=>{
        if(event.key==='Escape'&&this._disclosure.open){event.preventDefault();this._disclosure.setOpen(false);trigger.focus({preventScroll:true});}
        const index=this._options.indexOf(document.activeElement);
        if(index<0)return;
        const target={ArrowDown:(index+1)%choices.length,ArrowUp:(index-1+choices.length)%choices.length,Home:0,End:choices.length-1}[event.key];
        if(target!==undefined){event.preventDefault();this._options[target].focus({preventScroll:true});}
      });
      this._outside=event=>{if(!this.contains(event.target))this._disclosure.setOpen(false);};
      document.addEventListener('pointerdown',this._outside);
      document.addEventListener('focusin',this._outside);
      this._render();
    }
    disconnectedCallback(){document.removeEventListener('pointerdown',this._outside);document.removeEventListener('focusin',this._outside);}
    attributeChangedCallback(){this._render();}
    get value(){return this.getAttribute('value')||'';}
    set value(value){this.setAttribute('value',String(value));}
    _render(){
      if(!this._options)return;
      const selected=this._choices.find(choice=>choice.value===this.value)||this._choices[0];
      this._trigger.querySelector('span').textContent=selected?.label||'';
      this._trigger.setAttribute('aria-label',(this.getAttribute('label')||'Choose an option')+': '+(selected?.label||''));
      this._options.forEach(option=>{const active=option.dataset.value===this.value;option.setAttribute('aria-selected',String(active));option.tabIndex=active?0:-1;});
    }
  }
  customElements.define('today-dropdown',TodayDropdown);
})();
