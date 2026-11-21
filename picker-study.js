/* Gallery context and fixtures, separate from the reusable picker controls. */
(() => {
  const trialOptions=[['01','Day ruler','ruler','Selected for Today. Swipe to a day, or open custom entry for an exact length.'],['02','Week cards','cards','Kept as a reusable choice group. Preset lengths stay configurable.']];
  const timeOptions=[['01','Inline clock','inline','Tap either number to replace it. Move between Hour and Minute, then Done. Use this time confirms.'],['02','Soft wheels','wheel','Kept as a component. Scroll, drag or tap a column into place, then confirm.']];
  const study=(entry,type)=>{
    const [letter,name,variant,note]=entry;
    return '<article class="pk-study"><div class="pk-study-title"><span>'+letter+'</span><h3>'+name+'</h3></div><div class="pk-context"><div class="pk-context-header"><today-icon name="reading"></today-icon><span>Read before bed</span></div><today-step-progress variant="pill" current="'+(type==='trial'?4:6)+'" total="7" label="'+(type==='trial'?'Trial length':'Reminders')+'"></today-step-progress><div class="pk-context-heading"><h4>'+(type==='trial'?'How long will you try?':'A nudge, when it suits you.')+'</h4><p>'+(type==='trial'?'Give this plan some time. Then reflect.':'Only on your reading days.')+'</p></div>'+(type==='trial'?'<today-trial-picker variant="'+variant+'" value="21" min="1" max="90" haptics></today-trial-picker>':'<div class="pk-reminder-toggle"><span>Remind me</span><today-switch label="Remind me" checked></today-switch></div><div class="pk-reminder-panel"><div><today-time-picker variant="'+variant+'" value="21:30"></today-time-picker></div></div><div class="pk-reading-days" aria-label="Reading days: Sunday, Tuesday and Thursday">'+['S','M','T','W','T','F','S'].map((d,i)=>'<span '+([0,2,4].includes(i)?'data-scheduled':'')+' aria-hidden="true">'+d+'</span>').join('')+'</div><p class="pk-notification-note">You can allow notifications when you continue.</p>')+'<div class="pk-context-footer"><today-button variant="primary" label="Continue" block data-next></today-button><p class="pk-context-feedback" role="status">'+(type==='trial'?'Reading days · Sun, Tue, Thu':'Your time can be changed later.')+'</p></div></div><p class="pk-study-note">'+note+'</p></article>';
  };
  for(const root of document.querySelectorAll('[data-component="trial-pickers"]')){
    root.innerHTML='<div class="pk-collection-intro"><p>A trial sets when you pause and reflect. Your scheduled days stay separate.</p><span>Selected controls · 21 days prefilled</span></div><div class="pk-studies">'+trialOptions.map(v=>study(v,'trial')).join('')+'</div><p class="pk-study-scope">Preview choices: 14, 21 or 28 days, with a custom 1–90 day range. Day ruler + custom entry is the selected direction. The allowed range remains configurable.</p>';
    root.addEventListener('today-activate',e=>{if(!e.target.matches('[data-next]'))return;const card=e.target.closest('.pk-context'),days=card.querySelector('today-trial-picker').value;card.querySelector('.pk-context-feedback').textContent=days+'-day trial selected. Next: start date. Preview only.';});
  }
  for(const root of document.querySelectorAll('[data-component="time-pickers"]')){
    root.innerHTML='<div class="pk-collection-intro"><p>One optional reminder for this habit. Edit freely; only “Use this time” confirms the change.</p><span>Kept in the library · 9:30 PM sample</span></div><div class="pk-studies">'+timeOptions.map(v=>study(v,'time')).join('')+'</div><p class="pk-study-scope">Try changing a time, cancelling, then reopening. The previous value stays intact. Reminder permissions and delivery belong to the app.</p>';
    root.querySelectorAll('.pk-study').forEach(card=>{
      const picker=card.querySelector('today-time-picker'),toggle=card.querySelector('today-switch'),panel=card.querySelector('.pk-reminder-panel');
      const disclosure=new TodayUI.Disclosure(panel,{trigger:toggle.querySelector('button'),open:true});
      const next=card.querySelector('[data-next]');
      picker.addEventListener('picker-open',()=>next.setAttribute('disabled',''));
      const settled=()=>next.toggleAttribute('disabled',picker.editing);
      picker.addEventListener('picker-cancel',settled);picker.addEventListener('change',settled);
      picker.open();
      toggle.addEventListener('change',()=>{picker.toggleAttribute('disabled',!toggle.checked);disclosure.setOpen(toggle.checked);next.toggleAttribute('disabled',toggle.checked&&picker.editing);card.querySelector('.pk-notification-note').textContent=toggle.checked?'You can allow notifications when you continue.':'No notifications for this habit.';card.querySelector('.pk-context-feedback').textContent=toggle.checked?'Reminder on. Your last confirmed time is kept.':'No reminder for this habit.';});
      card.addEventListener('today-activate',e=>{if(!e.target.matches('[data-next]'))return;if(toggle.checked&&picker.editing){card.querySelector('.pk-context-feedback').textContent='Use this time or Cancel before continuing.';picker.querySelector('[data-confirm] button').focus();return;}card.querySelector('.pk-context-feedback').textContent=(toggle.checked?'Reminder at '+picker.value+'.':'No reminder.')+' Next: review your plan. Preview only.';});
    });
  }
  for(const root of document.querySelectorAll('[data-component="picker-pieces"]')){
    root.innerHTML='<div class="pk-pieces-grid">'+[
      ['Day ruler','day-ruler','<today-day-ruler value="21" min="1" max="90" haptics></today-day-ruler>','A live count at every tick. Taller marks every seven days.'],
      ['Custom trial length','trial-days-input','<today-trial-days-input value="21" min="1" max="90"></today-trial-days-input>','Exact days, with validation and a separate apply action.'],
      ['Week cards','week-cards','<today-week-cards value="21" days="14,21,28"></today-week-cards>','Three common lengths. Each option is a full tap target.'],
      ['AM / PM pill','period-pill','<today-period-pill value="PM"></today-period-pill>','A shared moving highlight. Tap either side or use arrow keys.'],
      ['Switch','switch','<div class="pk-reminder-toggle"><span>Remind me</span><today-switch label="Remind me" checked></today-switch></div>','Already part of Today’s controls. On, off and disabled states.']
    ].map(([name,id,markup,note])=>'<article class="pk-piece" id="piece-'+id+'"><div class="pk-piece-heading"><h3>'+name+'</h3><a href="source.html#'+(id==='switch'?'controls':id)+'">Code ↗</a></div><div class="pk-piece-stage">'+markup+'</div><p>'+note+'</p><output class="pk-piece-feedback" aria-live="polite"></output></article>').join('')+'</div>';
    root.addEventListener('change',e=>{const feedback=e.target.closest('.pk-piece')?.querySelector('.pk-piece-feedback');if(!feedback)return;feedback.textContent=e.target.localName==='today-switch'?(e.target.checked?'Reminder on.':'Reminder off.'):(e.detail.days?e.detail.days+' days selected.':e.detail.value+' selected.');});
  }
})();
