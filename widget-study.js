/* Gallery mounts and simulated save delay. No backend or native widget routing. */
(() => {
  const F=window.TodayWidgetFixtures,W=window.TodayWidgets;
  const titles={new:'First habit',configure:'Choose a habit',empty:'Nothing logged',scheduled:'Not scheduled',paused:'Paused',removed:'Habit removed',failed:'Save failed',unavailable:'Data unavailable',noDue:'No habits due',complete:'Build targets met'};
  document.querySelectorAll('[data-component="widgets"]').forEach(root=>{
    root.innerHTML='<div class="wg-intro"><p>Small habits. A clear next action.</p><span>Apple point dimensions · Browser layout preview</span></div><div class="wg-size-controls"><label>iPhone size <today-dropdown label="Preview device" value="standard">'+Object.entries(W.sizes).map(([value,p])=>'<option value="'+value+'">'+p.label+'</option>').join('')+'</today-dropdown></label><p>Fixed frames at 1 CSS pixel per point. <a href="https://developer.apple.com/design/human-interface-guidelines/widgets#Specifications" target="_blank" rel="noopener">Apple specifications ↗</a></p></div><div class="study-controls"><div class="study-step-buttons"><button type="button" data-widget-reset>Reset examples</button><button type="button" data-widget-fail aria-pressed="false">Try a save failure</button><button type="button" data-widget-long aria-pressed="false">Long names</button></div><span class="wg-feedback" role="status">Tap a quick action to try it.</span></div><h3 class="wg-section-title">One habit</h3><p class="wg-section-note">Quick-log here. Tap the content for details or corrections.</p><div class="wg-small-grid" data-small></div><h3 class="wg-section-title">Your day at a glance</h3><div class="wg-grid" data-overviews></div><h3 class="wg-section-title">Lock Screen</h3><p class="wg-section-note">Monochrome, one clear action. Circular widgets open the logger.</p><div class="wg-lock-grid" data-lock></div><h3 class="wg-section-title">When plans change</h3><div class="wg-state-layout"><div class="wg-stage" data-message></div><div class="wg-state-copy"><h4>Say what happened. Offer a way forward.</h4><p>Missing data, a rest day, and a paused habit are different states.</p><today-dropdown label="Widget message state" value="paused">'+Object.entries(titles).map(([value,label])=>'<option value="'+value+'">'+label+'</option>').join('')+'</today-dropdown><p class="wg-subtle">For a working failure + retry, choose “Try a save failure” and tap a numeric action above.</p></div></div><h3 class="wg-section-title">In-app habit insights</h3><p class="wg-section-note">App components, outside the widget families. Select a date to see its actual amount. Today stays open for upper-limit goals.</p><div class="wg-grid" data-insights></div>';
    let failNext=false,longNames=false;
    const widgets=[];
    const habit=(index,changes={})=>({...F.habits[index],...changes});
    const feedback=root.querySelector('.wg-feedback');
    const mount=(selector,label,note,model)=>{
      const article=document.createElement('article');article.className='wg-item';
      article.innerHTML='<div class="wg-stage"></div><div class="wg-caption"><h4>'+label+'</h4><span>'+note+'</span><small class="wg-size"></small></div>';
      const widget=document.createElement('today-habit-widget');widget.model={date:F.date,...model};
      widget.save=async request=>{
        await new Promise(resolve=>setTimeout(resolve,380));
        if(failNext){failNext=false;root.querySelector('[data-widget-fail]').setAttribute('aria-pressed','false');throw new Error('Simulated save failure');}
        return request.proposed;
      };
      article.querySelector('.wg-stage').append(widget);root.querySelector(selector).append(article);widgets.push({widget,initial:widget.model});return widget;
    };
    mount('[data-small]','Water','Amount + a continuous fill',{variant:'small',habits:[habit(0)]});
    mount('[data-small]','Reading','Page count + one quick action',{variant:'small',habits:[habit(1)]});
    mount('[data-small]','Check-off','Log once. Undo when needed.',{variant:'small',habits:[habit(2,{amount:null})]});
    mount('[data-small]','Custom count','Your unit and increment',{variant:'small',habits:[habit(6)]});
    mount('[data-small]','Minimum met','Actual amount stays visible',{variant:'small',habits:[habit(0,{amount:2250})]});
    mount('[data-small]','Upper limit','A limit, without a victory state',{variant:'small',habits:[habit(5)]});
    mount('[data-small]','Recorded zero','An explicit 0 is a saved entry',{variant:'small',habits:[habit(4)]});
    mount('[data-small]','No log','Missing is never shown as zero',{variant:'small',habits:[habit(4,{amount:null})]});
    mount('[data-overviews]','Today · two habits','Stable rows after each log',{variant:'medium',total:4,habits:[habit(0),habit(1)]});
    mount('[data-overviews]','My rhythm','Confirmed streak through yesterday',{variant:'streak',count:6,habits:[habit(1)]});
    mount('[data-overviews]','All today · list','Four quick actions, then the full day',{variant:'list',total:7,habits:F.habits.slice(0,5)});
    mount('[data-overviews]','All today · portraits','Four habits with room for artwork',{variant:'portraits',total:7,habits:[habit(0,{title:'Water'}),habit(1,{title:'Reading'}),habit(2),habit(4,{title:'Scrolling'})]});
    mount('[data-lock]','Quick amount','A single +250 mL action',{variant:'lock',habits:[habit(0)]});
    mount('[data-lock]','Check-in','Open an upper-limit log',{variant:'lock',habits:[habit(4)]});
    mount('[data-lock]','Check-off','Log and Undo',{variant:'lock',habits:[habit(2)]});
    mount('[data-lock]','Streak','Six confirmed days',{variant:'lock-streak',habits:[habit(1)],count:6});
    mount('[data-lock]','Daily summary','Counts stay separate',{variant:'summary',total:5,met:2});
    const circular=document.createElement('article');circular.className='wg-item';circular.innerHTML='<div class="wg-stage wg-circle-pair"></div><div class="wg-caption"><h4>Circular gauges</h4><span>Water + reading · Tap to open</span></div>';root.querySelector('[data-lock]').append(circular);
    [0,1].forEach(i=>{const el=document.createElement('today-habit-widget');el.model={variant:'circular',shortName:i?'Read':'Water',habits:[habit(i)],date:F.date};circular.firstElementChild.append(el);widgets.push({widget:el,initial:el.model});});
    const message=document.createElement('today-habit-widget');message.model={variant:'message',state:'paused',title:'Drink water',habits:[habit(0)]};root.querySelector('[data-message]').append(message);
    root.querySelector('.wg-state-copy today-dropdown').addEventListener('change',e=>{message.model={variant:'message',state:e.detail?.value||e.target.value,title:'Drink water',habits:[habit(0)]};});
    const entries=key=>F[key].map((amount,i)=>({day:'2026-11-'+String(i+1).padStart(2,'0'),amount,eligible:true}));
    const insight=(title,note,content)=>{const a=document.createElement('article');a.className='wg-item';a.innerHTML='<div class="wg-stage wg-insight-stage"></div><div class="wg-caption"><h4>'+title+'</h4><span>'+note+'</span></div>';a.firstElementChild.append(content);root.querySelector('[data-insights]').append(a);};
    [['Reading calendar','Full, partial, and no log','reading','activity'],['Break goal · completion','Closed days within the saved limit','scrolling','completion'],['Break goal · activity','Recorded amounts, regardless of target','scrolling','activity']].forEach(([title,note,key,mode])=>{
      const el=document.createElement('today-habit-calendar');el.model={year:2026,month:11,today:F.date,selected:key==='reading'?'2026-11-10':F.date,entries:entries(key),target:key==='reading'?10:15,unit:key==='reading'?'pages':'min',rule:key==='reading'?'atLeast':'atMost',mode};insight(title,note,el);
    });
    const parts=document.createElement('div');parts.className='wg-insight-parts';parts.innerHTML='<today-streak-hero></today-streak-hero><today-recent-log></today-recent-log><div class="wg-mark-key">'+W.mark('full')+'<span>Logged</span>'+W.mark('partial')+'<span>Partial</span>'+W.mark('none')+'<span>No log</span></div>';insight('Streak + recent log','Reusable pieces from the habit-detail board',parts);
    const familyLabels={small:'Small',medium:'Medium',large:'Large',rectangular:'Rectangular',circular:'Circular'};
    const setSize=size=>{
      root.dataset.size=size;
      root.querySelectorAll('today-habit-widget').forEach(widget=>{
        widget.setAttribute('size',size);
        const family=W.family(widget.model.variant),[w,h]=W.dimensions(widget.model.variant,size);
        const caption=widget.closest('.wg-item')?.querySelector('.wg-size');
        if(caption)caption.textContent=familyLabels[family]+' · '+w+' × '+h+' pt';
      });
      const circleSize=W.dimensions('circular',size)[0];
      circular.querySelector('.wg-caption>span').textContent='Each '+circleSize+' × '+circleSize+' pt · Tap to open';
    };
    root.querySelector('.wg-size-controls today-dropdown').addEventListener('change',e=>setSize(e.detail?.value||e.target.value));
    setSize('standard');
    root.querySelector('[data-widget-reset]').onclick=()=>{widgets.forEach(({widget,initial})=>widget.model=structuredClone(initial));failNext=false;longNames=false;root.querySelectorAll('[aria-pressed]').forEach(b=>{if(b.matches('[data-widget-fail],[data-widget-long]'))b.setAttribute('aria-pressed','false');});feedback.textContent='Examples reset.';};
    root.querySelector('[data-widget-fail]').onclick=e=>{failNext=!failNext;e.currentTarget.setAttribute('aria-pressed',String(failNext));feedback.textContent=failNext?'The next numeric or check-off save will fail. Tap a quick action.':'Save failure canceled.';};
    root.querySelector('[data-widget-long]').onclick=e=>{longNames=!longNames;e.currentTarget.setAttribute('aria-pressed',String(longNames));widgets.forEach(({widget,initial})=>{const m=widget.model;m.habits=m.habits.map((h,i)=>({...h,title:longNames?'Read a little before going to sleep':initial.habits[i].title}));widget.model=m;});};
    root.addEventListener('widget-change',e=>feedback.textContent=e.detail.habit.title+': '+W.format(e.detail.habit.amount)+' saved in this preview.');
    root.addEventListener('widget-error',()=>feedback.textContent='Save failed. The confirmed amount stays visible. Retry is available on the widget.');
    const routeNotice=document.createElement('div');routeNotice.className='wg-route-notice';routeNotice.hidden=true;routeNotice.innerHTML='<span role="status"></span><button type="button" aria-label="Dismiss preview message">×</button>';root.append(routeNotice);
    routeNotice.querySelector('button').onclick=()=>routeNotice.hidden=true;
    const showRoute=text=>{routeNotice.querySelector('span').textContent=text;routeNotice.hidden=false;};
    root.addEventListener('widget-open',e=>{const d=e.detail;showRoute(d.habit?'Preview: opens '+d.habit.title+' for '+(d.date||F.date)+'.':'Preview: opens '+(d.route==='today'?'Today’s full list':d.route)+'.');});
    root.addEventListener('log-open',()=>showRoute('Preview: opens the saved reading log for Nov 12, 2026.'));
  });
})();
