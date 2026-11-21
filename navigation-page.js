(() => {
  const media=matchMedia('(prefers-reduced-motion: reduce)'),control=document.querySelector('#reduce-motion');
  const update=value=>{control.checked=value;document.documentElement.toggleAttribute('data-reduced',value);};
  update(media.matches);
  control.addEventListener('change',()=>{document.documentElement.setAttribute('data-motion-override','');update(control.checked);});
  media.addEventListener('change',event=>{document.documentElement.removeAttribute('data-motion-override');update(event.matches);});
})();
