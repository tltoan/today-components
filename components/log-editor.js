/* One draft per entry. Hosts confirm amount + note together; this never persists data. */
(() => {
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const photoURL=value=>typeof value==='string'&&/^(https?:\/\/|blob:|data:image\/|(?:\.\/)?assets\/)/i.test(value)?value:'';
  const hasNote = entry => typeof entry.note === 'string' && !!entry.note.trim();
  const quantity = entry => entry.unit === 'check' ? (entry.amount ? 'Logged' : 'None today') : `${entry.amount.toLocaleString()} ${entry.unit}`;
  const validEntry = e => Number.isFinite(e.amount) && e.amount >= 0 && (e.unit !== 'check' || e.amount === 0 || e.amount === 1) && e.saved !== false;
  window.TodayUI = Object.assign(window.TodayUI || {}, {LogNotes: {hasNote, quantity, validEntry}});

  class LogEditor extends HTMLElement {
    set model(value) { this._model = structuredClone(value); if (this.isConnected) this.render(); }
    get pending() { return !!this._pending; }
    connectedCallback() { if (this._model) this.render(); }
    render() {
      const m = this._model, check = m.unit === 'check'; this._pending = false;
      this.innerHTML = `<div class="le-heading"><h4>${esc(m.name)}</h4>${m.dateLabel ? `<p>${esc(m.dateLabel)}</p>` : ''}</div>
        <div class="le-amount-surface">${check ? `<span class="le-field-label">This entry</span><today-segmented-control label="Recorded outcome" value="${m.amount === 0 ? 'none' : 'logged'}"><option value="logged">Logged</option><option value="none">None today</option></today-segmented-control>` : `<label class="le-field-label">Amount<div class="le-amount"><input aria-label="Recorded amount" type="number" inputmode="decimal" min="0" max="1000000" step="any" value="${Number.isFinite(m.amount) ? m.amount : ''}"><span>${esc(m.unit)}</span></div></label><today-button data-log-none variant="quiet" label="None today"></today-button>`}</div>
        ${m.party ? '<p class="le-sharing">Shared with your habit party, including your note.</p>' : ''}
        <button class="le-note-toggle" type="button"><span>${hasNote(m) ? 'Your note' : 'Add a note'}</span><span class="today-disclosure__chevron" aria-hidden="true">⌄</span></button>
        <div class="le-note-panel"><div><label class="le-note-label">Anything you’d like to remember?<textarea rows="4" placeholder="Anything you’d like to remember?">${esc(m.note || '')}</textarea></label><button class="le-remove-note" type="button">Remove note</button></div></div>
        ${photoURL(m.photoURL)?`<img class="le-photo" src="${esc(photoURL(m.photoURL))}" alt="${esc(m.photoAlt||'Photo attached to this log')}">`:''}
        <p class="le-error" role="alert"></p><today-button data-log-save variant="primary" block label="${m.entryID ? 'Save changes' : 'Save log'}"></today-button>`;
      const trigger = this.querySelector('.le-note-toggle'), textarea = this.querySelector('textarea');
      this._notePanel = new TodayUI.Disclosure(this.querySelector('.le-note-panel'), {trigger, open: hasNote(m)});
      trigger.onclick = () => { if (this._pending) return; this._notePanel.toggle(); if (this._notePanel.open) textarea.focus({preventScroll:true}); };
      this.querySelector('.le-remove-note').onclick = () => { textarea.value = ''; this._notePanel.setOpen(false); trigger.querySelector('span').textContent = 'Add a note'; };
      this.querySelector('[data-log-none]')?.addEventListener('today-activate', () => { if (!this._pending) this.querySelector('input').value = '0'; });
      this.querySelector('[data-log-save]').addEventListener('today-activate', () => this.submit());
    }
    openNote(){this._notePanel.setOpen(true);this.querySelector('textarea').focus({preventScroll:true});}
    submit() {
      if (this._pending) return;
      const m = this._model, input = this.querySelector('input');
      const amount = m.unit === 'check' ? (this.querySelector('today-segmented-control').value === 'none' ? 0 : 1) : input.value === '' ? NaN : Number(input.value);
      if (!validEntry({amount, unit:m.unit}) || input && !input.checkValidity()) {
        this.querySelector('.le-error').textContent = 'Record an amount, or choose None today.';
        input?.focus(); return;
      }
      const raw = this.querySelector('textarea').value;
      this.setPending(true); this.querySelector('.le-error').textContent = '';
      this.dispatchEvent(new CustomEvent('log-save', {bubbles:true, detail:{entryID:m.entryID || null, amount, unit:m.unit, note:raw.trim() ? raw : ''}}));
    }
    setPending(value) {
      this._pending = value; this.toggleAttribute('aria-busy', value);
      this.querySelectorAll('input,textarea,button,today-segmented-control').forEach(el => el.toggleAttribute('disabled', value));
      this.querySelector('[data-log-none]')?.toggleAttribute('disabled', value);
      this.querySelector('[data-log-save]').toggleAttribute('busy', value);
    }
    resolve(error = '') { if(!this._model)return;this.setPending(false); this.querySelector('.le-error').textContent = error; }
  }
  customElements.define('today-log-editor', LogEditor);

  /* Shared modal shell for Home and focused component previews. No automatic text focus. */
  class LogDialog extends HTMLElement {
    connectedCallback() {
      if (this._ready) return; this._ready = true;
      this.innerHTML = '<dialog class="le-dialog" aria-label="Log entry"><div class="le-dialog-head"><h3>Log entry</h3><button type="button" aria-label="Close log">×</button></div><today-log-editor></today-log-editor></dialog>';
      this.dialog = this.querySelector('dialog');
      this.querySelector('.le-dialog-head button').onclick = () => this.close();
      this.dialog.addEventListener('cancel', e => { if (this.querySelector('today-log-editor').pending) e.preventDefault(); });
      this.dialog.addEventListener('close', () => this._opener?.isConnected && this._opener.focus({preventScroll:true}));
    }
    open(model) { this._opener = document.activeElement; this.querySelector('today-log-editor').model = model; this.dialog.showModal(); this.querySelector('.le-dialog-head button').focus(); }
    close() { if (!this.querySelector('today-log-editor').pending) this.dialog.close(); }
    resolve(error = '') { this.querySelector('today-log-editor').resolve(error); if (!error) this.close(); }
  }
  customElements.define('today-log-dialog', LogDialog);

  /* Verbatim, host-selected entry notes for trial reflection. No inferred activity. */
  class LogMemories extends HTMLElement {
    set entries(value) { this._entries = structuredClone(value || []); if (this.isConnected) this.render(); }
    connectedCallback() { this.render(); }
    render() {
      const entries = (this._entries || []).filter(e => validEntry(e) && hasNote(e));
      this.hidden = !entries.length;
      this.innerHTML = entries.length ? `<div class="le-memories"><h4>In your own words</h4>${entries.map(e => `<figure data-note-entry="${esc(e.id)}"><figcaption>${esc(e.date)} · ${esc(quantity(e))}</figcaption><blockquote>${esc(e.note)}</blockquote></figure>`).join('')}</div>` : '';
    }
  }
  customElements.define('today-log-memories', LogMemories);
})();
