/* Home composition. The host supplies eligible habits, dates and confirmed amounts.
 * Requests never imply a save. See HOME.md for the model and event contract. */
(() => {
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const reduced = () => document.documentElement.hasAttribute('data-reduced') || (!document.documentElement.hasAttribute('data-motion-override') && matchMedia('(prefers-reduced-motion: reduce)').matches);
  class TodayHomeOverview extends HTMLElement {
    connectedCallback() {
      if (this._connected) return;
      this._connected = true;
      this._abort = new AbortController();
      const signal = this._abort.signal;
      this.addEventListener('click', e => {
        const day = e.target.closest('[data-home-day]');
        if (day) this.emit('daychange', {date:day.dataset.homeDay});
      }, {signal});
      this.addEventListener('today-activate', e => {
        const action = e.target.closest('[data-home-log]');
        if (action) this.emit('logrequest', {id:action.dataset.homeLog, date:this._model.selectedDate});
      }, {signal});
      this.addEventListener('tabchange', e => this.emit('destination', {tab:e.detail.active}), {signal});
      this.innerHTML = `<div class="ho-header"><div><strong>today.</strong><p>what will you do?</p></div><span class="ho-avatar" aria-label="Profile AT">AT</span></div><div class="ho-week" role="group" aria-label="Choose a day"></div><div class="ho-body"><div class="ho-day-heading"><h3></h3><p class="ho-report-count"></p></div><div class="ho-list" tabindex="0" role="region" aria-label="Habits for the selected day"></div></div><div class="ho-nav"><today-bottom-nav variant="cradle" active="home"></today-bottom-nav></div><p class="ho-announcement" role="status"></p>`;
      this.render();
    }
    disconnectedCallback() { this._connected = false; this._abort?.abort(); }
    set model(value) {
      this._model = structuredClone(value);
      if (this._connected) this.render();
    }
    get model() { return structuredClone(this._model); }
    emit(type, detail) { this.dispatchEvent(new CustomEvent(type, {bubbles:true, detail})); }
    render() {
      const m = this._model;
      if (!m) return;
      const day = m.days.find(d => d.date === m.selectedDate);
      if (!day) return;
      const list = this.querySelector('.ho-list');
      const changedDay = this._date !== m.selectedDate;
      this._date = m.selectedDate;
      const week = this.querySelector('.ho-week');
      if (week.dataset.dates !== m.days.map(d => d.date).join(',')) {
        week.dataset.dates = m.days.map(d => d.date).join(',');
        week.innerHTML = m.days.map(d => `<button type="button" data-home-day="${esc(d.date)}" aria-label="${esc(d.label)}"><span>${esc(d.weekday)}</span><b>${esc(d.number)}</b><i aria-hidden="true"></i></button>`).join('');
      }
      week.querySelectorAll('button').forEach(b => {
        const d = m.days.find(v => v.date === b.dataset.homeDay);
        b.setAttribute('aria-pressed', String(d.date === m.selectedDate));
        if (d.today) b.setAttribute('aria-current','date'); else b.removeAttribute('aria-current');
      });
      this.querySelector('.ho-day-heading h3').textContent = day.today ? 'Your day' : day.label;
      const reported = m.habits.filter(h => h.amount !== null).length;
      this.querySelector('.ho-report-count').textContent = !m.habits.length ? 'Nothing scheduled' : day.future ? `${m.habits.length} scheduled` : `${reported} of ${m.habits.length} reported`;
      this.toggleAttribute('single', m.habits.length === 1);
      const focused = document.activeElement?.closest('[data-home-log]')?.dataset.homeLog;
      if(focused)this._focusAfterSave=focused;
      else if(document.activeElement!==document.body)this._focusAfterSave=null;
      const scroll = changedDay ? 0 : list.scrollTop;
      if (changedDay) list.replaceChildren();
      for (const card of [...list.querySelectorAll('[data-habit]')]) if (!m.habits.some(h => h.id === card.dataset.habit)) card.remove();
      list.querySelector('.ho-empty')?.remove();
      if (!m.habits.length) list.innerHTML = `<div class="ho-empty"><today-artwork name="meditation"></today-artwork><h4>A little room to breathe.</h4><p>No habits are due on this day.<br>Your other days are still here.</p></div>`;
      for (const h of m.habits) {
        let card = [...list.children].find(c => c.dataset.habit === h.id);
        const fingerprint = JSON.stringify(h) + day.future;
        if (card?.dataset.value === fingerprint) continue;
        const updated = Boolean(card);
        if (!card) { card = document.createElement('article'); card.className = 'ho-habit'; card.dataset.habit = h.id; list.append(card); }
        const oldAmount = card.dataset.amount;
        const water = card.querySelector('.tw-water');
        card.dataset.value = fingerprint; card.dataset.amount = String(h.amount);
        const hasReport = h.amount !== null;
        const met = hasReport && (h.kind === 'check' ? h.amount > 0 : h.kind !== 'limit' && h.amount >= h.target);
        const amount = hasReport ? h.kind === 'check' ? h.amount > 0 ? 'Logged' : 'None today' : `${Number(h.amount).toLocaleString('en-US')} ${h.unit}` : 'No log yet';
        const target = h.kind === 'check' ? 'Check it off' : `${h.kind === 'limit' ? 'Limit' : 'Target'} · ${Number(h.target).toLocaleString('en-US')} ${h.unit}`;
        const label = h.kind === 'check' ? h.amount > 0 ? 'Undo' : 'Log' : `+ ${h.increment} ${h.unit}`;
        card.innerHTML = `<div class="ho-habit-top"><div><h4>${esc(h.name)}</h4><p>${esc(target)}</p></div>${h.artwork==='water-droplet'?`<span class="ho-water-art">${TodayWidgets.art('water')}</span>`:`<today-artwork name="${esc(h.artwork)}"></today-artwork>`}</div><div class="ho-habit-bottom"><div class="ho-habit-result"><strong>${esc(day.future ? 'Planned' : amount)}</strong><span>${day.future ? esc(h.cue || 'On your schedule') : met ? 'Target met' : hasReport ? h.kind === 'limit' ? 'Reported · keep logging' : 'Reported' : esc(h.cue || 'Whenever it fits')}</span></div>${day.future ? '' : `<today-button variant="secondary" label="${esc(h.pending ? 'Saving…' : label)}" accessible-label="${esc(h.pending ? `Saving ${h.name}` : h.kind === 'check' ? `${label} ${h.name}` : `Add ${h.increment} ${h.unit} to ${h.name}`)}" data-home-log="${esc(h.id)}" ${h.pending?'disabled':''}></today-button>`}</div>${h.error ? `<p class="ho-error" role="alert">${esc(h.error)}</p>` : ''}`;
        if(h.artwork==='water-droplet'){if(water)card.querySelector('.ho-water-art').replaceChildren(water);TodayWidgets.setWaterFill(card.querySelector('.tw-water'),(h.amount||0)/h.target);}
        if (updated && oldAmount !== String(h.amount) && !reduced()) {
          card.querySelector('.ho-habit-result').animate([{opacity:.35,transform:'translateY(5px)'},{opacity:1,transform:'translateY(0)'}],{duration:320,easing:'cubic-bezier(.22,.8,.24,1)'});
        }
      }
      list.scrollTop = scroll;
      if (this._focusAfterSave && !changedDay) {
        const button=[...list.querySelectorAll('[data-home-log]')].find(b => b.dataset.homeLog === this._focusAfterSave)?.querySelector('button');
        if(button&&!button.disabled){button.focus({preventScroll:true});this._focusAfterSave=null;}
      } else if(changedDay)this._focusAfterSave=null;
      if (changedDay && !reduced()) list.animate([{opacity:.3,transform:'translateY(6px)'},{opacity:1,transform:'translateY(0)'}],{duration:420,easing:'cubic-bezier(.22,.8,.24,1)'});
      this.querySelector('.ho-announcement').textContent = m.announcement || '';
    }
  }
  customElements.define('today-home-overview', TodayHomeOverview);
})();
