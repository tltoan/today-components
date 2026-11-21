/* Shared artwork and log marks. URLs resolve from this script, not the host page. */
(() => {
  const base = new URL('../assets/', document.currentScript.src);
  const escape = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const asset = name => new URL(name, base).href;
  const reduced = () => document.documentElement.hasAttribute('data-reduced') || (!document.documentElement.hasAttribute('data-motion-override') && matchMedia('(prefers-reduced-motion: reduce)').matches);
  const format = value => value == null ? '—' : Number(value).toLocaleString('en-US');
  const image = (name, cls='') => '<img class="' + cls + '" src="' + asset(name) + '" alt="" draggable="false">';
  const art = (kind='custom') => {
    if(!['water','reading','stretch','custom','flame','mono'].includes(kind))kind='custom';
    if (kind === 'water') return '<span class="tw-water"><span class="tw-water-fill"></span></span>';
    const files = {reading:'widgets/OpenBook.svg',stretch:'StretchMat.svg',custom:'widgets/Custom.svg',flame:'widgets/Flame.svg',mono:'widgets/FlameMono.svg'};
    return image(files[kind] || files.custom, 'tw-art-image tw-art-' + kind);
  };
  const mark = (state='none') => '<span class="tw-mark" data-mark="' + escape(state) + '" aria-hidden="true">' + image('widgets/DayOff.svg') + '<span>' + image('widgets/PlannedDay.svg') + '</span></span>';
  const animateText = el => {
    el.getAnimations().forEach(a=>a.cancel());
    if (!reduced()) el.animate([{opacity:.4,transform:'translateY(3px)'},{opacity:1,transform:'translateY(0)'}],{duration:320,easing:'cubic-bezier(.22,.76,.28,1)'});
  };
  window.TodayWidgets = {escape,asset,format,art,mark,reduced,animateText};
})();
