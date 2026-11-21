/* Shared streak: every eligible member logs on each scheduled party-local day.
   Explicit days off preserve a streak; missing calendar coverage breaks it.
   The host supplies saved entries, dated membership/schedule and local today. */
(() => {
  const previous=date=>{const d=new Date(date+'T12:00:00Z');d.setUTCDate(d.getUTCDate()-1);return d.toISOString().slice(0,10);};
  function progress(model){
    const entries=model.entries||[],today=model.today,days=new Map((model.days||[]).filter(d=>d.date<=today).map(d=>{
      const ids=[...new Set(d.memberIDs||[])],scheduled=d.scheduled!==false;
      const logged=ids.filter(id=>entries.some(e=>e.date===d.date&&e.memberID===id&&Number.isFinite(e.amount)&&e.saved!==false));
      return [d.date,{date:d.date,scheduled,total:ids.length,logged:logged.length,loggedIDs:logged,complete:scheduled&&ids.length>0&&ids.length===logged.length}];
    }));
    const current=days.get(today)||{date:today,scheduled:true,total:0,logged:0,loggedIDs:[],complete:false};
    let date=current.complete?today:previous(today),streak=0,through=null;
    while(days.has(date)){const d=days.get(date);if(d.scheduled){if(!d.complete)break;streak++;through ||= date;}date=previous(date);}
    return {streak,current,through,days:[...days.values()].sort((a,b)=>a.date.localeCompare(b.date))};
  }
  globalThis.TodayPartyProgress={progress};
})();
