(() => {
  const editor=document.querySelector('today-time-editor'),output=document.querySelector('#time-editor-confirmed');
  const label=value=>{const [h,m]=value.split(':').map(Number);return `${h%12||12}:${String(m).padStart(2,'0')} ${h<12?'AM':'PM'}`;};
  editor.addEventListener('change',e=>output.textContent='Confirmed · '+label(e.detail.value));
  editor.addEventListener('picker-cancel',e=>output.textContent='Kept · '+label(e.detail.value));
  document.querySelector('[data-time-reset]').addEventListener('today-activate',()=>{editor.value='21:30';output.textContent='Confirmed · 9:30 PM';});
})();
