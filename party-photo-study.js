/* Gallery-only comparison host. All people, logs and reactions are local fixtures. */
(() => {
  for(const root of document.querySelectorAll('[data-component="party-photos"]')){
    root.innerHTML=`<div class="pps-selected"><article class="pps-variation"><div class="pps-composition"><h4>Shared check-ins</h4><today-party-photo-carousel variant="overlay"></today-party-photo-carousel></div></article></div><div class="pps-tools"><div><span class="pps-tools-label">Preview person</span><today-segmented-control label="Preview person" value="all"><option value="all">Everyone</option><option value="antony">You</option><option value="maya">Maya</option><option value="sam">Sam</option></today-segmented-control></div><div class="pps-states"><span class="pps-tools-label">Preview states</span><div><button data-example="photos">Photos</button><button data-example="none">No photos</button><button data-example="broken">Photo unavailable</button><button data-example="zero">Recorded zero</button></div></div><p class="pps-note" role="status">Local examples. Photos remain attached to their original logs.</p></div>`;
    const base=TodayPartyDemo.create().model,carousels=[...root.querySelectorAll('today-party-photo-carousel')];
    let model=structuredClone(base),scenario='photos',memberID=null;
    function render(){
      for(const carousel of carousels)carousel.model={...model,memberID};
      root.querySelectorAll('[data-example]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.example===scenario)));
    }
    root.querySelector('today-segmented-control').addEventListener('change',event=>{memberID=event.detail.value==='all'?null:event.detail.value;render();});
    root.querySelectorAll('[data-example]').forEach(button=>button.onclick=()=>{
      scenario=button.dataset.example;model=structuredClone(base);
      if(scenario==='none')model.entries.forEach(entry=>delete entry.photoURL);
      if(scenario==='broken')model.entries.filter(entry=>entry.photoURL).forEach(entry=>entry.photoURL='data:image/png;base64,broken');
      if(scenario==='zero')model.entries.filter(entry=>entry.photoURL).forEach(entry=>entry.amount=0);
      root.querySelector('.pps-note').textContent={photos:'Local examples. Photos and notes stay with their original logs.',none:'No-photo logs stay available. Nothing is inferred from a missing attachment.',broken:'The photo fallback preserves the person, date and confirmed amount.',zero:'Recorded zero is a saved log. It stays distinct from no log.'}[scenario];render();
    });
    root.addEventListener('party-request',event=>{
      if(event.detail.action!=='react')return;event.stopPropagation();
      const entry=model.entries.find(entry=>entry.id===event.detail.id);if(!entry)return;
      const reactors=new Set(entry.reactorIDs||[]);reactors.has(model.viewerID)?reactors.delete(model.viewerID):reactors.add(model.viewerID);entry.reactorIDs=[...reactors];render();
    });
    render();
  }
})();
