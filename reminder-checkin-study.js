/* Selected design, browser fixture only. No notification, persistence or native app integration. */
(() => {
  const root=document.querySelector('.mr-preview');
  const later=root.querySelector('[data-later] button');
  const question=new TodayUI.Disclosure(root.querySelector('#mr-question'),{open:true});
  const choices=new TodayUI.Disclosure(root.querySelector('#mr-times'),{trigger:later});
  const confirmation=new TodayUI.Disclosure(root.querySelector('#mr-confirmation'));
  const status=root.querySelector('#mr-status');
  later.setAttribute('aria-controls','mr-times');
  const reset=(focus=false)=>{
    choices.setOpen(false);confirmation.setOpen(false);question.setOpen(true);
    status.textContent='';root.querySelector('[data-dismiss]').hidden=false;
    if(focus)later.focus({preventScroll:true});
  };
  const finish=message=>{
    choices.setOpen(false);question.setOpen(false);
    status.textContent=message;confirmation.setOpen(true);
    root.querySelector('[data-dismiss]').hidden=true;
    status.focus({preventScroll:true});
  };
  root.addEventListener('today-activate',event=>{
    const action=event.target;
    if(action.matches('[data-later]'))choices.toggle();
    else if(action.matches('[data-cancel]'))choices.setOpen(false);
    else if(action.matches('[data-undo]'))reset(true);
    else if(action.matches('[data-dismiss]'))finish('Check-in dismissed');
    else if(action.matches('[data-view]')){
      if(parent===window)location.href='habit-detail.html';
      else window.open('habit-detail.html','_blank','noopener');
    }
    else if(action.closest('.mr-time-list')){
      const time={'15':'10:15 AM','60':'11 AM',evening:'7 PM'}[event.detail.value];
      if(time)finish(`We’ll remind you at ${time}.`);
    }
  });
  root.addEventListener('keydown',event=>{if(event.key==='Escape'&&choices.open){event.preventDefault();choices.setOpen(false);later.focus({preventScroll:true});}});
  document.querySelector('[data-reset]').addEventListener('today-activate',()=>reset());
  document.querySelector('#mr-reduced').addEventListener('change',event=>document.documentElement.toggleAttribute('data-reduced',event.target.checked));
})();
