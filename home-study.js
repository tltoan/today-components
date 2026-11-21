/* Deliberately local fixtures; no real habits, events, streak credit or saves. */
(() => {
  const definitions = [
    {id:'water',name:'Drink water',artwork:'water-droplet',kind:'amount',target:2000,unit:'mL',increment:250,cue:'Throughout the day'},
    {id:'reading',name:'Read before bed',artwork:'open-book',kind:'amount',target:10,unit:'pages',increment:5,cue:'Before bed'},
    {id:'stretch',name:'Evening stretch',artwork:'stretch-mat',kind:'check',cue:'After work'},
    {id:'walk',name:'Take a walk',artwork:'walking',kind:'amount',target:20,unit:'min',increment:5,cue:'After lunch'},
    {id:'plants',name:'Water the plants',artwork:'water-plants',kind:'check',cue:'When you get home'},
    {id:'vitamins',name:'Take vitamins',artwork:'vitamins',kind:'check',cue:'With breakfast'}
  ];
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((weekday,i)=>({date:`2026-11-${15+i}`,weekday,number:15+i,label:`${weekday}, Nov ${15+i}`,today:i===2,future:i>2}));
  for (const root of document.querySelectorAll('[data-component="home-overview"]')) {
    root.innerHTML = `<div class="ho-study-tools"><today-segmented-control label="Home example" value="three"><option value="one">One habit</option><option value="three">Three habits</option><option value="six">Six habits</option><option value="off">Day off</option></today-segmented-control><button type="button" class="ho-reset">Reset example</button></div><div class="ho-study-layout"><today-home-overview></today-home-overview><div class="ho-study-notes"><span class="ho-study-eyebrow">HOME, AS YOUR DAY GROWS</span><h3>More habits.<br>The same breathing room.</h3><p>The large illustrated card becomes a stack of smaller cards. Each keeps its artwork, target and one clear logging action.</p><ul><li><strong>See the whole day.</strong> Three habits stay easy to scan. A longer list scrolls above the fixed navigation.</li><li><strong>Keep your place.</strong> Logging updates a card in place. It doesn’t disappear or jump to another section.</li><li><strong>Small amounts count, too.</strong> Log a little now and add more later, even after reaching your target.</li></ul><div class="ho-study-checks"><button type="button" data-home-failure>Try a save failure</button><button type="button" data-home-names>Long names</button></div><p class="ho-study-status" role="status">Interactive sample · Tue, Nov 17. Logs stay in this preview.</p><div class="ho-feedback-choice"><span>Target-met background</span><today-segmented-control label="Completion style" value="wash"><option value="bloom">Bloom</option><option value="wash">Rise</option><option value="halo">Halo</option></today-segmented-control></div><div class="ho-study-links"><a href="habit-cards.html">Individual cards & streak ↗</a><a href="HOME.md">Behavior & API ↗</a><a href="HABIT-PARTIES.md">Habit parties · proposal ↗</a></div></div></div><div data-component="target-feedback" id="target-feedback"></div>`;
    const screen = root.querySelector('today-home-overview');
    let scenario='three', selectedDate=days[2].date, reports={}, pending=new Set(), errors={}, failNext=false, longNames=false, generation=0,feedback='wash';
    const counts={one:1,three:3,six:6,off:0};
    const currentDefinitions=()=>scenario==='one'?[definitions[1]]:definitions.slice(0,counts[scenario]);
    const render=(announcement='')=>{
      const day=days.find(d=>d.date===selectedDate);
      screen.model={selectedDate,days,announcement,feedback,streak:{days:6},habits:currentDefinitions().map(h=>({...h,name:longNames&&h.id==='reading'?'Read a few pages of my book before going to sleep':h.name,amount:day.future?null:reports[`${selectedDate}:${h.id}`]?.reduce((sum,e)=>sum+e.amount,0)??null,pending:pending.has(`${selectedDate}:${h.id}`),error:errors[`${selectedDate}:${h.id}`]||''}))};
    };
    root.querySelector('.ho-feedback-choice today-segmented-control').addEventListener('change',e=>{feedback=e.detail.value;render();});
    screen.addEventListener('target-reached',e=>{root.querySelector('.ho-study-status').textContent='Target met · '+e.detail.variant+' response. Native integration can use the success haptic event.';});
    const reset=()=>{generation++;reports={};pending.clear();errors={};failNext=false;selectedDate=days[2].date;if(scenario!=='one')reports[`${selectedDate}:water`]=[{amount:750}];root.querySelector('[data-home-failure]').setAttribute('aria-pressed','false');render();};
    root.querySelector('today-segmented-control').addEventListener('change',e=>{scenario=e.detail.value;reset();});
    root.querySelector('.ho-reset').addEventListener('click',reset);
    root.querySelector('[data-home-failure]').addEventListener('click',e=>{failNext=!failNext;e.currentTarget.setAttribute('aria-pressed',String(failNext));root.querySelector('.ho-study-status').textContent=failNext?'The next logging action will fail. Confirmed amounts will stay unchanged.':'Save failure cancelled.';});
    root.querySelector('[data-home-names]').addEventListener('click',e=>{longNames=!longNames;e.currentTarget.setAttribute('aria-pressed',String(longNames));render();});
    screen.addEventListener('daychange',e=>{selectedDate=e.detail.date;errors={};render();});
    screen.addEventListener('logrequest',e=>{
      const {id,date}=e.detail,h=currentDefinitions().find(v=>v.id===id);
      const key=`${date}:${id}`;
      if(!h||pending.has(key)||days.find(d=>d.date===date)?.future)return;
      const token=generation,fail=failNext;failNext=false;pending.add(key);delete errors[key];render();
      root.querySelector('[data-home-failure]').setAttribute('aria-pressed','false');
      setTimeout(()=>{
        if(token!==generation)return;
        pending.delete(key);
        if(fail)errors[key]='Couldn’t save. Your previous log is safe. Try again.';
        else if(h.kind==='check'&&reports[key]?.length)delete reports[key];
        else (reports[key]||=[]).push({amount:h.kind==='check'?1:h.increment});
        const message=fail?`${h.name}: sample save failed.`:`${h.name}: preview updated.`;
        render(message);root.querySelector('.ho-study-status').textContent=message+' No real data is saved.';
      },360);
    });
    screen.addEventListener('destination',e=>{root.querySelector('.ho-study-status').textContent=`${e.detail.tab==='home'?'Home':'Habits'} navigation selected. This study keeps the Home composition visible.`;});
    screen.addEventListener('add',()=>{root.querySelector('.ho-study-status').textContent='The + remains independent; no habit editor is connected.';});
    reset();
  }
})();
