(() => {
  /** Shared disclosure state. CSS owns interruptible motion; state is immediate. */
  class TodayDisclosure {
    constructor(panel, {trigger=null, open=false}={}) {
      this.panel=panel;
      this.trigger=trigger;
      panel.classList.add('today-disclosure');
      panel.firstElementChild?.classList.add('today-disclosure__content');
      this.setOpen(open);
    }
    get open(){return this.panel.dataset.open==='true';}
    setOpen(open){
      if(!open&&this.panel.contains(document.activeElement)&&this.trigger){
        this.trigger.focus({preventScroll:true});
      }
      this.panel.dataset.open=String(Boolean(open));
      this.panel.inert=!open;
      this.panel.setAttribute('aria-hidden',String(!open));
      this.trigger?.setAttribute('aria-expanded',String(Boolean(open)));
    }
    toggle(){this.setOpen(!this.open);}
  }
  window.TodayUI=Object.assign(window.TodayUI||{},{Disclosure:TodayDisclosure});
})();
