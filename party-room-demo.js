/* Demo host ONLY. Local fixtures and simulated responses; no network or notifications. */
(() => {
  const canonical=[{id:'antony',name:'You',initials:'AT',self:true},{id:'maya',name:'Maya',initials:'MK'},{id:'sam',name:'Sam',initials:'SL'}];
  function create(people=canonical){
    let state,fail=false,generation=0;const views=new Set();
    const hydrate=(p,i)=>({...p,plan:i===1?'15 minutes':'10 pages',schedule:'Sun, Tue, Thu',window:i===2?'7–9 PM':'8–9 PM',nudgeState:'available'});
    function reset(){generation++;fail=false;const members=people.map(hydrate),self=members.find(p=>p.self)||members[0];
      state={id:'reading-party',name:'Reading party',today:'2026-11-17',timezoneLabel:'New York',schedule:'Sun, Tue, Thu',viewerID:self.id,members,days:[],entries:[]};
      for(let d=1;d<=17;d++){const date=`2026-11-${String(d).padStart(2,'0')}`;const scheduled=[0,2,4].includes(new Date(date+'T12:00:00Z').getUTCDay());state.days.push({date,scheduled,memberIDs:members.map(p=>p.id)});if(!scheduled)continue;members.forEach((p,i)=>{if((d===5||d===17)&&i===2)return;state.entries.push({id:`${p.id}-${d}`,memberID:p.id,date,amount:i===1?15:d===17?5:10,unit:i===1?'min':'pages',time:i===1?'8:12 PM':'7:36 PM',order:i===1?2:1,samplePhoto:d===17&&i===1,reactorIDs:d===17&&i===1?[members[2].id,self.id]:[]});});}
      const photos=[['maya-17','reading-on-the-go','An open book on a reader’s lap'],['maya-15','afternoon-reading','A Little Life held over a reader’s face in afternoon light'],['sam-15','book-and-coffee','An open book and coffee on a wooden floor'],[self.id+'-15','reading-in-bed','Reading an open book in bed']];
      for(const [id,file,alt] of photos){const entry=state.entries.find(e=>e.id===id);if(entry)Object.assign(entry,{samplePhoto:false,photoURL:`assets/party-samples/${file}.jpg`,photoAlt:alt});}
      render();
    }
    function render(){for(const room of views){if(room.isConnected)room.model=state;else views.delete(room);}}
    function bind(room){views.add(room);room.model=state;room.addEventListener('party-request',e=>{const d=e.detail;e.stopPropagation();if(d.action==='react'){const entry=state.entries.find(x=>x.id===d.id);if(!entry)return;const ids=new Set(entry.reactorIDs||[]);ids.has(state.viewerID)?ids.delete(state.viewerID):ids.add(state.viewerID);entry.reactorIDs=[...ids];render();}
      if(d.action.startsWith('nudge-')){const person=state.members.find(p=>p.id===d.id);if(!person||person.id===state.viewerID||!['available','error'].includes(person.nudgeState))return;const epoch=generation,failed=fail;fail=false;person.nudgeState='sending';render();setTimeout(()=>{if(epoch!==generation)return;person.nudgeState=failed?'error':'sent';render();},650);}
    });return room;}
    function syncSelf(entries,habit){const id=state.viewerID,oldEntries=state.entries;state.entries=state.entries.filter(e=>e.memberID!==id||e.date!==state.today);state.entries.push(...entries.filter(e=>e.date===state.today).map(e=>({...e,id:'own-'+e.id,memberID:id,reactorIDs:oldEntries.find(x=>x.id==='own-'+e.id)?.reactorIDs||[]})));if(habit){const p=state.members.find(p=>p.id===id);p.plan=habit.kind==='check'?'Check it off':`${habit.target} ${habit.unit}`;p.schedule=state.schedule;}render();}
    function samLog(){const sam=state.members[2];if(!state.entries.some(e=>e.date===state.today&&e.memberID===sam.id))state.entries.push({id:'sam-today',memberID:sam.id,date:state.today,amount:5,unit:'pages',time:'8:45 PM',order:3,reactorIDs:[]});render();}
    function extraLog(){state.entries.push({id:'extra-'+state.entries.length,memberID:state.viewerID,date:state.today,amount:5,unit:'pages',time:'Just now',order:4,reactorIDs:[]});render();}
    function undoSam(){state.entries=state.entries.filter(e=>e.date!==state.today||e.memberID!==state.members[2].id);render();}
    function fourth(){if(state.members.length>=4)return;const p=hydrate({id:'jordan',name:'Jordan',initials:'JR'},3);p.nudgeState='window';p.window='9–10 PM';state.members.push(p);state.days.find(d=>d.date===state.today).memberIDs.push(p.id);render();}
    reset();return {bind,reset,syncSelf,samLog,undoSam,extraLog,fourth,failNext(){fail=true;},get model(){return structuredClone(state);}};
  }
  globalThis.TodayPartyDemo={create};
})();
