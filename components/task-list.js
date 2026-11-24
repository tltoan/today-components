/* Selected task views. Controlled by their host; no persistence, habit logs or streak credit.
 * Reuses the library checklist marks and shared disclosure controller. See HOME-TASKS.md. */
(() => {
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const check = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="m5 12 4.5 4.5L19 7"/></svg>';
  let serial = 0;
  const eligible = m => (m.tasks || []).filter(t => t.createdDate <= m.date && (!t.date || t.date <= m.date || t.done && t.completedDate <= m.date));
  const visible = m => eligible(m).filter(t => !t.done || t.id === m.recentId);
  const focusTask = m => visible(m).find(t => t.id === m.recentId) || visible(m)[0];
  function rows(container, tasks, date) {
    const existing = new Map([...container.children].map(row => [row.dataset.task, row]));
    for (const task of tasks) {
      let row = existing.get(task.id);
      if (!row) {
        row = document.createElement('button');
        row.type = 'button'; row.className = 'activity-row td-row'; row.dataset.task = task.id;
        row.innerHTML = `<span class="activity-mark">${check}</span><span class="td-row-copy"><span class="td-title"></span><small></small></span><span class="td-row-tail" aria-hidden="true"></span>`;
      }
      row.setAttribute('aria-pressed', String(task.done));
      row.setAttribute('aria-label', `${task.done ? 'Undo completion of' : 'Complete'} ${task.title}`);
      row.querySelector('.td-title').textContent = task.title;
      const previous = new Date(`${date}T12:00:00Z`); previous.setUTCDate(previous.getUTCDate()-1);
      const caption = task.done ? 'Done' : task.date && task.date < date ? task.date === previous.toISOString().slice(0,10) ? 'From yesterday' : `From ${new Date(`${task.date}T12:00:00Z`).toLocaleDateString('en-US',{month:'short',day:'numeric',timeZone:'UTC'})}` : '';
      row.querySelector('small').textContent = caption;
      row.querySelector('small').hidden = !caption;
      row.querySelector('.td-row-tail').textContent = task.done ? 'Undo' : '';
      // Keep live buttons in place so keyboard focus survives a confirmed toggle.
      const at = container.children[[...tasks].indexOf(task)];
      if (at !== row) container.insertBefore(row, at || null);
      existing.delete(task.id);
    }
    existing.forEach(row => row.remove());
  }
  class TodayTaskList extends HTMLElement {
    connectedCallback() {
      if (this._mounted) return;
      this._mounted = true;
      const id = `task-list-${++serial}`;
      this.innerHTML = `<div class="td-heading"><div><h4>To-dos</h4><p class="td-count"></p></div><button class="td-add td-quiet" type="button" aria-controls="${id}-form" aria-expanded="false"><span aria-hidden="true">＋</span> Add</button></div>
        <div class="td-editor" id="${id}-form"><div><form novalidate><label for="${id}-title">What do you need to do?</label><input id="${id}-title" name="title" placeholder="e.g. Pick up a book" maxlength="160" autocomplete="off" required><label class="td-date-label" for="${id}-date">Day <span>Optional</span></label><input id="${id}-date" name="date" type="date"><p class="td-error" role="alert"></p><div class="td-form-actions"><button type="button" class="td-quiet" data-cancel>Cancel</button><today-button label="Add task" variant="primary"></today-button></div></form></div></div>
        <div class="td-primary"></div>
        <p class="td-empty">Nothing on your list.<br><span>A little room for whatever comes up.</span></p>
        <div class="td-later-wrap"><button type="button" class="td-disclosure td-quiet" aria-controls="${id}-later" aria-expanded="false"><span>Later</span><span class="td-chevron" aria-hidden="true">⌄</span></button><div class="td-later" id="${id}-later"><div><div class="td-later-rows"></div></div></div></div>
        <div class="td-completed-wrap"><button type="button" class="td-disclosure td-quiet" aria-controls="${id}-completed" aria-expanded="false"><span>Completed</span><span class="td-chevron" aria-hidden="true">⌄</span></button><div class="td-completed" id="${id}-completed"><div><div class="td-completed-rows"></div></div></div></div>`;
      this._form = this.querySelector('form');
      this._editor = new TodayUI.Disclosure(this.querySelector('.td-editor'), {trigger:this.querySelector('.td-add')});
      this._completed = new TodayUI.Disclosure(this.querySelector('.td-completed'), {trigger:this.querySelector('.td-completed-wrap > button')});
      this._later = new TodayUI.Disclosure(this.querySelector('.td-later'), {trigger:this.querySelector('.td-later-wrap > button')});
      this.querySelector('.td-add').addEventListener('click', () => { this._editor.toggle(); if (this._editor.open) this._form.elements.title.focus({preventScroll:true}); });
      this.querySelector('[data-cancel]').addEventListener('click', () => { this._editor.setOpen(false); this.querySelector('.td-add').focus({preventScroll:true}); });
      this.querySelector('.td-completed-wrap > button').addEventListener('click', () => this._completed.toggle());
      this.querySelector('.td-later-wrap > button').addEventListener('click', () => this._later.toggle());
      this._form.addEventListener('keydown', event => {
        if (event.key === 'Escape') { event.preventDefault(); this._editor.setOpen(false); }
        if (event.key === 'Enter' && event.target === this._form.elements.title) { event.preventDefault(); this._form.requestSubmit(); }
      });
      this.querySelector('today-button').addEventListener('today-activate', () => this._form.requestSubmit());
      this._form.addEventListener('submit', event => {
        event.preventDefault();
        const title = this._form.elements.title.value.trim(), date = this._form.elements.date.value;
        if (!title) { this.querySelector('.td-error').textContent = 'Give your task a name.'; this._form.elements.title.focus(); return; }
        if (!this._form.elements.date.validity.valid) { this.querySelector('.td-error').textContent = 'Choose a valid day, or leave it empty.'; this._form.elements.date.focus(); return; }
        this.querySelector('.td-error').textContent = '';
        this.emit('task-add', {title, date:date || null});
      });
      this.addEventListener('click', event => { const row = event.target.closest('[data-task]'); if (row) this.emit('task-toggle', {id:row.dataset.task}); });
      this.render();
    }
    emit(type, detail) { this.dispatchEvent(new CustomEvent(type, {bubbles:true,detail})); }
    set model(value) { this._model = structuredClone(value); if (this._mounted) this.render(); }
    get model() { return structuredClone(this._model); }
    finishAdd() { this._form.reset(); this._editor.setOpen(false); this.querySelector('.td-add').focus({preventScroll:true}); }
    resetDraft() { this._form.reset(); this.querySelector('.td-error').textContent = ''; [this._editor,this._completed,this._later].forEach(d => d.setOpen(false)); }
    openComposer() { this._editor.setOpen(true); this._form.elements.title.focus({preventScroll:true}); }
    render() {
      if (!this._model) return;
      const m = this._model, all = eligible(m), list = visible(m);
      const active = all.filter(t => !t.done), completed = all.filter(t => t.done && t.id !== m.recentId);
      const later = m.tasks.filter(t => t.createdDate <= m.date && t.date > m.date && !t.done);
      this.querySelector('.td-count').textContent = active.length ? `${active.length} left` : all.length ? 'All done for today' : 'Make a little space';
      rows(this.querySelector('.td-primary'), list, m.date);
      rows(this.querySelector('.td-completed-rows'), completed, m.date);
      rows(this.querySelector('.td-later-rows'), later, m.date);
      this.querySelectorAll('.td-later-rows .td-row').forEach(row => { const task = later.find(t => t.id === row.dataset.task), caption = row.querySelector('small'); caption.hidden = false; caption.textContent = new Date(`${task.date}T12:00:00Z`).toLocaleDateString('en-US',{month:'short',day:'numeric',timeZone:'UTC'}); });
      this.querySelector('.td-later-wrap').hidden = !later.length;
      this.querySelector('.td-later-wrap > button > span').textContent = `Later · ${later.length}`;
      this.querySelector('.td-empty').hidden = list.length > 0;
      this.querySelector('.td-empty').firstChild.textContent = all.length ? 'You’re all caught up.' : 'Nothing on your list.';
      this.querySelector('.td-completed-wrap').hidden = !completed.length;
      this.querySelector('.td-completed-wrap > button > span').textContent = `Completed · ${completed.length}`;
    }
  }
  class TodayTaskWidget extends HTMLElement {
    connectedCallback() {
      if (this._mounted) return;
      this._mounted = true;
      this.innerHTML = `<div class="tdw-top"><button type="button" class="tdw-open" aria-label="Open to-dos on Home">To-dos <span aria-hidden="true">↗</span></button><span class="tdw-count"></span></div><div class="tdw-rows"></div><div class="tdw-empty"><strong>Room to breathe.</strong><span>Your list is clear.</span></div><div class="tdw-bottom"><button type="button" class="tdw-next">Next <span aria-hidden="true">→</span></button></div>`;
      this.querySelector('.tdw-open').addEventListener('click', () => this.emit('task-open', {}));
      this.querySelector('.tdw-next').addEventListener('click', () => this.emit('task-next', {}));
      this.addEventListener('click', event => { const row = event.target.closest('[data-task]'); if (row) this.emit('task-toggle', {id:row.dataset.task}); });
      this.render();
    }
    emit(type, detail) { this.dispatchEvent(new CustomEvent(type, {bubbles:true,detail})); }
    set model(value) { this._model = structuredClone(value); if (this._mounted) this.render(); }
    render() {
      if (!this._model) return;
      const m = this._model, family = this.getAttribute('family') === 'small' ? 'small' : 'medium', capacity = family === 'small' ? 1 : 2;
      const dimensions = TodayWidgets.sizes.standard[family];
      this.style.setProperty('--task-widget-width', `${dimensions[0]}px`);
      this.style.setProperty('--task-widget-height', `${dimensions[1]}px`);
      const next = focusTask(m), list = family === 'small' ? next ? [next] : [] : visible(m).slice(0,capacity);
      const active = eligible(m).filter(t => !t.done);
      this.querySelector('.tdw-count').textContent = active.length ? `${active.length} left` : 'All clear';
      rows(this.querySelector('.tdw-rows'), list, m.date);
      this.querySelector('.tdw-empty').hidden = list.length > 0;
      this.querySelector('.tdw-bottom').hidden = family === 'medium' || (family === 'small' && !next?.done);
      this.querySelector('.tdw-next').hidden = !m.recentId;
      this.setAttribute('aria-label', `${family} to-do widget, ${active.length} tasks left`);
    }
  }
  customElements.define('today-task-list', TodayTaskList);
  customElements.define('today-task-widget', TodayTaskWidget);
  window.TodayTasks = Object.freeze({escape:esc, eligible});
})();
