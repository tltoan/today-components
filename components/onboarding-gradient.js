/* Motion extracted from the supplied OnboardingGradientTransition.
 * Paint stays the library's existing purple wash; no SwiftUI colors/assets copied. */
(() => {
  class TodayOnboardingGradient extends HTMLElement {
    connectedCallback() {
      if (this.firstElementChild) return;
      this.setAttribute('aria-hidden','true');
      this.innerHTML='<div class="og-paint"></div>';
    }
    get position() { return this.getAttribute('position') === 'bottom' ? 'bottom' : 'top'; }
    set position(value) { this.setAttribute('position', value === 'bottom' ? 'bottom' : 'top'); }
  }
  customElements.define('today-onboarding-gradient', TodayOnboardingGradient);
})();
