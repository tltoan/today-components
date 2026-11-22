/* Three proposed post-save placements. Sample saves and attachments stay in this page. */
(() => {
  const variants=[['icon','B','Photo button · Selected','A circular photo action beside the logging button.']];
  for(const root of document.querySelectorAll('[data-component="photo-actions"]')){
    root.innerHTML=`<p class="pa-intro">After a party log is saved, a photo is one tap away.</p><div class="pa-grid">${variants.map(([variant,letter,title,copy])=>`<article data-photo-variant="${variant}"><header><span>${letter}</span><div><h3>${title}</h3><p>${copy}</p></div></header><div class="pa-card-stage"><today-habit-card layout="compact"></today-habit-card></div><div class="pa-preview" hidden><img alt="Photo attached to the saved sample log"></div><div class="pa-tools"><button type="button" data-replay>Replay saved log</button><button type="button" data-photo-sample>Use sample photo</button></div><p class="pa-status" role="status"></p></article>`).join('')}</div><p class="pa-footnote">Selected circular action, on the logging row. Each action appears only for a confirmed party log, including a partial amount or None today. Photos attach to that entry; cancelling leaves the log saved.</p>`;
    root.querySelectorAll('[data-photo-variant]').forEach(article=>{
      const card=article.querySelector('today-habit-card'),status=article.querySelector('.pa-status'),variant=article.dataset.photoVariant;
      let entry={id:'photo-'+variant,amount:5,note:''},amount=10,pending=false;
      const paint=()=>{card.model={id:'reading-'+variant,name:'Read before bed',artwork:'open-book',kind:'amount',unit:'pages',target:10,increment:5,amount,date:'2026-11-17',current:true,pending,party:{placement:'stack',members:[{id:'antony',name:'You',self:true},{id:'maya',name:'Maya',initials:'MK'},{id:'sam',name:'Sam',initials:'SL'}]},photoEntry:entry,photoVariant:variant};const preview=article.querySelector('.pa-preview');preview.hidden=!entry?.photoURL;if(entry?.photoURL)preview.querySelector('img').src=entry.photoURL;};
      const save=(d={amount:5,note:''})=>{if(pending)return;pending=true;paint();setTimeout(()=>{amount=(amount||0)+d.amount;entry={id:crypto.randomUUID(),amount:d.amount,note:d.note};pending=false;paint();status.textContent='Log saved.';},450);};
      card.addEventListener('logrequest',()=>save());
      article.querySelector('[data-replay]').onclick=()=>{if(pending)return;entry=null;amount=5;status.textContent='';paint();save();};
      const attach=url=>{if(!entry||pending)return;entry.photoURL=url;paint();status.textContent='Photo added to this log.';};
      article.querySelector('[data-photo-sample]').onclick=()=>attach('assets/party-samples/reading-in-bed.jpg');
      card.addEventListener('log-photo-request',e=>{attach(URL.createObjectURL(e.detail.file));e.target.resolve(e.detail.entryID);});
      paint();
    });
  }
})();
