/* Local, disposable fixtures for the selected Home and two widgets. No native/task-store integration. */
(() => {
  const today = '2026-11-17';
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((weekday,i) => ({date:`2026-11-${15+i}`,weekday,number:15+i,label:`${weekday}, Nov ${15+i}`,today:i===2,future:i>2}));
  const initial = () => [
    {id:'parcel',title:'Pick up the parcel',createdDate:'2026-11-16',date:'2026-11-16',done:false},
    {id:'book',title:'Return library books',createdDate:today,date:null,done:false},
    {id:'maya',title:'Call Maya',createdDate:today,date:today,done:false},
    {id:'tickets',title:'Book the train tickets',createdDate:today,date:today,done:true}
  ];
  const definitions = [
    {id:'water',name:'Drink water',artwork:'water-droplet',kind:'amount',target:2000,unit:'mL',increment:250,cue:'Throughout the day'},
    {id:'reading',name:'Read before bed',artwork:'open-book',kind:'amount',target:10,unit:'pages',increment:5,cue:'Before bed'}
  ];
  const examples = [];
  for (const root of document.querySelectorAll('[data-task-study]')) {
    const home = root.querySelector('today-home-overview'), widgets = [...root.querySelectorAll('today-task-widget')];
    let tasks = initial(), selectedDate = today, recentId = null, sequence = 0, reports = {}, generation = 0;
    const pending = new Set();
    const view = document.createElement('today-task-list');
    const heading = home.querySelector('.ho-day-heading'), list = home.querySelector('.ho-list'), body = home.querySelector('.ho-body');
    const scroll = document.createElement('div'); scroll.className = 'ht-scroll'; scroll.tabIndex = 0;
    scroll.setAttribute('role','region'); scroll.setAttribute('aria-label','Home content');
    const habits = document.createElement('section'); habits.className = 'ht-habits';
    habits.setAttribute('aria-label','Your habits'); habits.append(heading,list);
    list.removeAttribute('tabindex'); list.removeAttribute('role'); list.removeAttribute('aria-label');
    const taskSection = document.createElement('section'); taskSection.className = 'ht-tasks'; taskSection.setAttribute('aria-label','Your to-dos'); taskSection.append(view);
    const selector = document.createElement('today-segmented-control'); selector.setAttribute('label','Home view'); selector.setAttribute('value','tasks');
    selector.innerHTML = '<option value="habits">Habits</option><option value="tasks">To-dos</option>';
    selector.className = 'ht-view-selector'; body.append(selector);
    selector.addEventListener('change', () => { habits.hidden = selector.value !== 'habits'; taskSection.hidden = selector.value !== 'tasks'; scroll.scrollTop = 0; });
    habits.hidden = true;
    scroll.append(habits,taskSection);
    body.append(scroll);
    const status = root.querySelector('.ht-pair-status');
    const renderTasks = () => {
      view.model = {tasks,date:selectedDate,recentId};
      widgets.forEach(widget => widget.model = {tasks,date:today,recentId});
    };
    const renderHome = (announcement = '') => {
      home.model = {selectedDate,days,announcement,streak:{days:6},habits:definitions.map(h => ({...h,amount:reports[`${selectedDate}:${h.id}`] ?? null,pending:pending.has(`${selectedDate}:${h.id}`)}))};
    };
    const announce = text => { status.textContent = text; };
    const openTasks = () => {
      if (home.closest('.library-embed-hidden')) { window.open('home-tasks.html#tasks-c','_blank','noopener'); return; }
      selectedDate = today; renderHome(); renderTasks();
      selector.value = 'tasks'; habits.hidden = true; taskSection.hidden = false;
      scroll.scrollTop = taskSection.offsetTop - scroll.offsetTop;
      view.querySelector('.td-add').focus({preventScroll:true});
      home.scrollIntoView({block:'nearest',behavior:'auto'});
      announce('Today’s to-dos opened on Home.');
    };
    root.addEventListener('task-toggle', event => {
      const task = tasks.find(t => t.id === event.detail.id); if (!task) return;
      const source = event.target.closest('today-task-list,today-task-widget'), hadFocus = source?.contains(document.activeElement);
      task.done = !task.done; task.completedDate = task.done ? today : null; recentId = task.done ? task.id : null;
      renderTasks();
      if (hadFocus) source.querySelector(`[data-task="${task.id}"]`)?.focus({preventScroll:true});
      announce(`${task.title}${task.done ? ' completed. Tap its checked circle to undo.' : ' restored to your list.'}`);
    });
    root.addEventListener('task-next', event => {
      recentId = null; renderTasks();
      const source = event.target.closest('today-task-list,today-task-widget');
      (source?.querySelector('[data-task]') || source?.querySelector('button'))?.focus({preventScroll:true});
      announce('Showing the next task. Completed tasks are still in Home.');
    });
    root.addEventListener('task-add', event => {
      const {title,date} = event.detail;
      tasks.push({id:`new-${++sequence}`,title,date,createdDate:today,done:false});
      // Adding from a past-day preview returns to today; a future task appears on its chosen day.
      selectedDate = date && date > today ? date : today;
      if (!days.some(d => d.date === selectedDate)) selectedDate = today;
      renderHome(); renderTasks(); view.finishAdd();
      announce(date && date > today ? `${title} added for ${date}. Today’s widgets are unchanged.` : `${title} added. Home and both widgets are updated.`);
    });
    root.addEventListener('task-open', openTasks);
    home.addEventListener('daychange', event => { selectedDate = event.detail.date; recentId = null; renderHome(); renderTasks(); });
    home.addEventListener('logrequest', event => {
      const {id,date} = event.detail, h = definitions.find(v => v.id === id), key = `${date}:${id}`;
      if (!h || pending.has(key) || date > today) return;
      pending.add(key); renderHome(); const token = generation;
      setTimeout(() => {
        if (token !== generation) return;
        reports[key] = (reports[key] || 0) + h.increment; pending.delete(key);
        renderHome(`${h.increment} ${h.unit} logged in this example.`);
        announce(`${h.name} updated in this example. To-dos are unchanged.`);
      },360);
    });
    home.addEventListener('destination', event => announce(`${event.detail.tab === 'home' ? 'Home' : 'Habits'} selected. This preview stays on Home.`));
    home.addEventListener('add', () => announce('The cradle + stays independent. Use Add in To-dos to try a task.'));
    function reset(scenario = 'few') {
      generation++; pending.clear(); recentId = null; selectedDate = today;
      reports = {[`${today}:water`]:750,[`${today}:reading`]:null};
      tasks = scenario === 'empty' ? [] : initial();
      if (scenario === 'done') tasks.forEach(t => t.done = true);
      if (scenario === 'long') tasks[0].title = 'Pick up the parcel from the collection point on the way home';
      selector.value = 'tasks'; habits.hidden = true; taskSection.hidden = false;
      view.resetDraft();
      renderHome(); renderTasks(); scroll.scrollTop = 0;
      announce('Home and both widgets share this local example.');
    }
    examples.push({reset}); reset();
  }
  document.querySelector('#task-scenario').addEventListener('change', event => examples.forEach(example => example.reset(event.detail.value)));
  document.querySelector('[data-tasks-reset]').addEventListener('click', () => examples.forEach(example => example.reset(document.querySelector('#task-scenario').value)));
})();
