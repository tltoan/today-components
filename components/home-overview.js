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
      this.addEventListener('tabchange', e => this.emit('destination', {tab:e.detail.active}), {signal});
      this.innerHTML = `<div class="ho-header"><div><strong>today.</strong><p>what will you do?</p></div><a class="ho-profile-link" href="profile.html" aria-label="Open your profile"><today-profile-avatar size="40" person='{"id":"antony","self":true,"name":"Antony"}'></today-profile-avatar></a></div><today-week-bar></today-week-bar><div class="ho-body"><div class="ho-day-heading"><div><h3></h3><p class="ho-report-count"></p></div><today-streak-badge hidden></today-streak-badge></div><div class="ho-list" tabindex="0" role="region" aria-label="Habits for the selected day"></div></div><div class="ho-nav"><today-bottom-nav variant="cradle" active="home"></today-bottom-nav></div><p class="ho-announcement" role="status"></p>`;
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
      this.querySelector('today-week-bar').model={days:m.days,selectedDate:m.selectedDate};
      this.querySelector('.ho-day-heading h3').textContent = day.today ? 'Your day' : day.label;
      const reported = m.habits.filter(h => h.amount !== null).length;
      this.querySelector('.ho-report-count').textContent = !m.habits.length ? 'Nothing scheduled' : day.future ? `${m.habits.length} scheduled` : `${reported}/${m.habits.length} logged`;
      this.toggleAttribute('single', m.habits.length === 1);
      const focused = document.activeElement?.closest('[data-home-log]')?.dataset.homeLog;
      if(focused)this._focusAfterSave=focused;
      else if(document.activeElement!==document.body)this._focusAfterSave=null;
      const scroll = changedDay ? 0 : list.scrollTop;
      if (changedDay) list.replaceChildren();
      for (const card of [...list.querySelectorAll('[data-habit]')]) if (!m.habits.some(h => h.id === card.dataset.habit)) card.remove();
      list.querySelector('.ho-empty')?.remove();
      if (!m.habits.length) list.innerHTML = `<div class="ho-empty"><today-artwork name="meditation"></today-artwork><h4>A little room to breathe.</h4><p>No habits are due on this day.<br>Your other days are still here.</p></div>`;
      const badge=this.querySelector('.ho-day-heading today-streak-badge');
      badge.hidden=!(m.streak?.days>0);badge.setAttribute('days',m.streak?.days||0);
      for (const h of m.habits) {
        let card = [...list.children].find(c => c.dataset.habit === h.id);
        if (!card) { card = document.createElement('today-habit-card'); card.dataset.habit = h.id; list.append(card); }
        card.setAttribute('layout',m.habits.length===1?'hero':'compact');
        card.model={...h,date:m.selectedDate,future:!!day.future,current:!!day.today,feedback:m.feedback||'wash'};
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
