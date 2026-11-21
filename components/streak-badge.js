/* A display of host-supplied streak credit, never a streak calculator. */
(() => {
  const art = new URL('../assets/streaks/ember.svg', document.currentScript.src).href;
  class TodayStreakBadge extends HTMLElement {
    static observedAttributes = ['days'];
    connectedCallback() { this.render(); }
    attributeChangedCallback() { if(this.isConnected) this.render(); }
    render() {
      const days = Math.max(0, Math.floor(Number(this.getAttribute('days')) || 0));
      if(!this.firstElementChild) {
        const img = document.createElement('img'); img.src=art; img.alt=''; img.width=22; img.height=28;
        this.append(img, document.createElement('span'));
      }
      this.querySelector('span').textContent = `${days} day streak`;
      this.setAttribute('role','img');
      this.setAttribute('aria-label',`Overall logging streak: ${days} ${days===1?'day':'days'}`);
    }
  }
  customElements.define('today-streak-badge',TodayStreakBadge);
})();
