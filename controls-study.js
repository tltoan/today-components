(() => {
  for(const root of document.querySelectorAll('[data-component="controls"]')){
    const iconNames=['home','habits','activity','reading','chevron','close','double-chevron','pencil','planned-day','day-off'];
    const title=(heading,note)=>`<div class="cs-section-heading"><h3>${heading}</h3><p>${note}</p></div>`;
    const action=(label,variant='primary',extra='')=>`<today-button label="${label}" variant="${variant}" ${extra}></today-button>`;
    const card=(heading,note,preview,caption='')=>`<article class="cs-card"><h4>${heading}</h4><p>${note}</p><div class="cs-stage">${preview}</div><div class="cs-caption">${caption}</div></article>`;
    const round=(label,attrs,variant='round')=>`<div class="cs-round"><today-button variant="${variant}" accessible-label="${label}" ${attrs}></today-button><span>${label}</span></div>`;
    root.innerHTML=`<div class="cs-intro"><p>The small pieces that make Today feel like Today. Original icons, shared button styles, and controls you can try.</p><a href="CONTROLS.md">Usage & source guide ↗</a></div>
      <section class="cs-section" aria-label="App icons">${title('App icons','Ten original SVGs from your Figma section, at their native size.')}<div class="cs-icons">${iconNames.map(name=>{const icon=TodayIcons.icons[name];return `<article class="cs-icon"><div class="cs-icon-stage"><today-icon name="${name}" label="${icon.displayName}"></today-icon></div><h4>${icon.displayName}</h4><a href="${icon.asset}" download aria-label="Download ${icon.displayName} SVG">SVG ↗</a></article>`;}).join('')}</div></section>
      <section class="cs-section" aria-label="Action buttons">${title('Action buttons','A clear hierarchy, with the same quiet press and release.')}<div class="cs-grid">
        ${card('Primary','The main action on a screen.',action('Save log','primary','block data-demo="save"'),'56 pt · Neutral gradient')}
        ${card('Prominent','A single, important starting point.',action('Begin','prominent','block'),'65 pt · Welcome action')}
        ${card('Compact','The same action in a smaller space.',action('Continue','compact','block'),'50 pt · Graphite capsule')}
        ${card('Secondary','An alternate or supporting action.',action('Try again','secondary'),'44 pt · Quiet surface')}
        ${card('Text action','A low-emphasis way forward.',action('Skip for now','quiet'),'44 pt hit area · No fill')}
        ${card('Quick action','A label with a useful increment.',action('250 mL','quick','symbol="+" accessible-label="Add 250 milliliters"'),'44 pt · Symbol and label')}
      </div><div class="cs-state-grid"><div class="cs-state"><small>Ready</small>${action('Save log','compact','block data-demo="save"')}</div><div class="cs-state"><small>Disabled</small>${action('Continue','compact','block disabled')}</div><div class="cs-state"><small>Saving</small>${action('Save log','compact','block busy')}</div><div class="cs-state"><small>After saving</small>${action('Saved','compact','block data-demo="save"')}</div></div><p class="cs-feedback" role="status" data-button-feedback></p></section>
      <section class="cs-section" aria-label="Icon buttons">${title('One action, one icon','Add, remove, close, edit, and move through a flow.')}<div class="cs-rounds">
        ${round('Add habit','symbol="+"')}${round('Remove','symbol="−"')}${round('Close','icon="close"')}${round('Edit','icon="pencil"')}${round('Back','icon="chevron" rotation="180"')}${round('Next','icon="chevron"')}
        ${round('Home','icon="home"')}${round('Habits','icon="habits"')}${round('Activity','icon="activity"')}${round('Continue','icon="double-chevron"')}${round('Profile','label="AT"','profile')}${round('Unavailable','icon="close" disabled')}
      </div><p class="cs-feedback" role="status" data-icon-feedback></p></section>
      <section class="cs-section" aria-label="Amount controls">${title('Plus, minus, and a count','Tap once or hold. Release without an extra step.')}<div class="cs-pair">
        <article class="cs-card"><h4>Standalone symbols</h4><p>The original counter artwork, each with its own hit area.</p><div class="cs-stage">${action('','icon','icon="decrease" accessible-label="Decrease standalone count" data-symbol="-1"')}<output data-symbol-value aria-live="polite">10</output>${action('','icon','icon="increase" accessible-label="Increase standalone count" data-symbol="1"')}</div><div class="cs-caption">48 × 48 pt · Original SVGs</div></article>
        <article class="cs-card"><h4>Amount stepper</h4><p>One controlled value, with clear minimum and maximum states.</p><div class="cs-stepper-stage"><today-stepper label="pages" value="10" min="0" max="30" step="1" unit="pages"></today-stepper></div><div class="cs-stepper-tools">${action('Zero','quiet','data-stepper-value="0"')}${action('Reset','quiet','data-stepper-value="10"')}${action('Maximum','quiet','data-stepper-value="30"')}</div></article>
      </div></section>
      <section class="cs-section" aria-label="Selection controls">${title('Choose a rhythm','Switches, weekdays, and a familiar dropdown.')}<div class="cs-pair">
        <article class="cs-card"><h4>Switches</h4><div class="cs-switch-row"><span>Repeat weekly</span><today-switch label="Repeat weekly" checked></today-switch></div><div class="cs-switch-row"><span>Reminder unavailable</span><today-switch label="Reminder unavailable" disabled></today-switch></div><div class="cs-caption">On and off, with a clear disabled state.</div></article>
        <article class="cs-card"><h4>Weekdays & dropdown</h4><div class="cs-week">${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((day,i)=>action(day[0],'day',`accessible-label="${['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][i]}" ${[1,3,5].includes(i)?'selected':''}`)).join('')}</div><div class="cs-stepper-tools"><span>Schedule</span><today-dropdown label="Schedule preset" value="custom"><option value="daily">Every day</option><option value="weekdays">Weekdays</option><option value="custom">Custom</option></today-dropdown></div><div class="cs-caption">44 pt day targets · Approved 600 ms dropdown motion</div></article>
        <article class="cs-card"><h4>Navigation row</h4><p>A full row is the target.</p><div class="cs-stage">${action('Habit details','row','block icon="reading" trailing-icon="chevron"')}</div><div class="cs-caption">64 pt · Leading art and trailing direction</div></article>
        <article class="cs-card"><h4>Day marks</h4><p>Small status pieces, always paired with meaning.</p><div class="cs-mark-row"><span><today-icon name="planned-day"></today-icon>Planned day</span><span><today-icon name="day-off"></today-icon>Day off</span></div><div class="cs-choice-row">${action('Logged','choice','icon="planned-day" selected data-log-toggle')}</div><div class="cs-caption">Original 15 pt marks · Toggle the logged example</div></article>
      </div><p class="cs-feedback" role="status" data-selection-feedback></p></section>
      <section class="cs-section" aria-label="Specialized controls">${title('Controls with their own behavior','These keep their dedicated components and motion.')}<div class="cs-existing"><a href="plan-button.html">Adaptive plan button ↗<span>Clarification prompts become Build my plan.</span></a><a href="index.html#logging-heading">Slide to log ↗<span>Drag to confirm, or activate with the keyboard.</span></a><a href="navigation.html">Center cradle navigation ↗<span>Fluid selection and the independent + action.</span></a><a href="page-counter.html">Page counter ↗<span>Rolling numbers and one mark per page.</span></a><a href="widgets.html">Widget quick actions ↗<span>Log, undo, and retry in fixed widget frames.</span></a><a href="index.html#schedule-heading">Schedule disclosure ↗<span>The approved smooth dropdown and toggle.</span></a></div></section>`;
    root.addEventListener('today-activate',event=>{
      const control=event.target.closest('today-button');if(!control)return;
      if(control.hasAttribute('data-symbol')){const output=root.querySelector('[data-symbol-value]');output.value=String(Math.max(0,Number(output.value||output.textContent)+Number(control.dataset.symbol)));root.querySelector('[data-symbol="-1"]').toggleAttribute('disabled',Number(output.value)===0);return;}
      if(control.hasAttribute('data-stepper-value')){root.querySelector('today-stepper').value=Number(control.dataset.stepperValue);return;}
      if(control.hasAttribute('data-log-toggle')){const selected=control.hasAttribute('selected');control.setAttribute('label',selected?'Logged':'Log today');control.setAttribute('icon',selected?'planned-day':'day-off');}
      if(control.dataset.demo==='save'){
        control.setAttribute('busy','');root.querySelector('[data-button-feedback]').textContent='Saving this example…';
        setTimeout(()=>{if(!control.isConnected)return;control.removeAttribute('busy');control.setAttribute('label','Saved');root.querySelector('[data-button-feedback]').textContent='Example saved. Tap again to replay.';},900);return;
      }
      const section=control.closest('section'),feedback=section.querySelector('.cs-feedback');
      if(feedback)feedback.textContent=(control.getAttribute('accessible-label')||control.getAttribute('label'))+(control.hasAttribute('selected')?' selected.':' activated in this preview.');
    });
    root.querySelector('today-switch').addEventListener('change',event=>root.querySelector('[data-selection-feedback]').textContent='Repeat weekly '+(event.target.checked?'on.':'off.'));
    const days=[...root.querySelectorAll('.cs-week today-button')],preset=root.querySelector('today-dropdown');
    preset.addEventListener('change',()=>{if(preset.value!=='custom')days.forEach((day,i)=>day.toggleAttribute('selected',preset.value==='daily'||i>0&&i<6));root.querySelector('[data-selection-feedback]').textContent='Schedule: '+preset.value+'.';});
    days.forEach(day=>day.addEventListener('change',()=>{preset.value='custom';}));
  }
})();
