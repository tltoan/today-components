/* Library pages share one persistent opening and the existing sliding control. */
(() => {
  const pages = {
    components: {file:'index.html', title:'Components', description:'The pieces of Today. Browse, try them, and switch states within each card.', noun:'components'},
    screens: {file:'screens.html', title:'Approved screens & flows', description:'Selected flows in order, and screens together. Browser previews with example data.', noun:'screens & flows'},
    workshop: {file:'workshop.html', title:'Workshop', description:'Current studies and open directions. Nothing here is marked approved until you choose it.', noun:'studies'}
  };
  const aliases = {landing:'welcome','habit-parties':'party-room','minimal-faces':'face-pickers','streak-flame':'streak-badge','picker-pieces':'habit-schedule'};
  const escape = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const main = document.querySelector('.library-board');
  const switcher = document.querySelector('.library-space-switch');
  const announcement = document.querySelector('.library-announcement');
  const views = new Map();
  let currentPage = document.body.dataset.libraryPage || 'components';
  document.querySelector('.library-content').remove();

  const preview = item => `<div class="library-frame-wrap"><iframe src="${item.file}?embed=${item.id}" title="${escape(item.title)} preview" loading="lazy" style="height:${item.page==='screens'?880:260}px"></iframe><p class="library-loading" aria-hidden="true">Loading preview</p></div>`;
  const source = item => `<a href="source.html#${item.source||item.id}" aria-label="Source for ${escape(item.title)}">Code ↗</a>`;
  const approval = '<span class="library-approved" title="Approved design" aria-label="Approved design">✓</span>';
  function card(item) {
    if (item.flow) return `<article class="library-card library-flow" id="${item.id}" data-group="${escape(item.group)}">
      <div class="library-flow-outline"><header><span class="library-card-kind">Flow · ${item.states.length} screens</span><div class="library-flow-title"><h2>${escape(item.title)}</h2>${approval}</div><p>${escape(item.note)}</p></header>
      <ol class="library-flow-steps" aria-label="Onboarding steps">${item.states.map((state,i)=>`<li><button type="button" data-preview-state="${i}" ${i===0?'aria-current="step"':''}><span>${String(i+1).padStart(2,'0')}</span>${escape(state.label)}</button></li>`).join('')}</ol>
      <div class="library-flow-links"><a href="${item.file}" target="_blank" rel="noopener">Open full flow ↗</a><button type="button" data-replay>Reset example</button>${source(item)}</div></div>
      <div class="library-flow-preview"><p class="library-flow-position" aria-live="polite">01 / ${item.states.length} · ${escape(item.states[0].label)}</p>${preview(item)}</div></article>`;
    return `<article class="library-card" id="${item.id}" data-group="${escape(item.group)}"><header><div><span class="library-card-kind">${escape(item.group)}</span><h2><a href="${item.file}" target="_blank" rel="noopener">${escape(item.title)}</a></h2></div>${item.selected?approval:''}</header>${preview(item)}<div class="library-card-tools">${item.states?`<label>Preview<today-dropdown label="${escape(item.title)} state" value="0">${item.states.map((state,i)=>`<option value="${i}">${escape(state.label)}</option>`).join('')}</today-dropdown></label>`:'<span></span>'}${item.replay?'<button type="button" data-replay>Replay ↻</button>':''}${source(item)}</div>${item.note?`<p class="library-card-note">${escape(item.note)}</p>`:''}</article>`;
  }

  function createView(page) {
    const config=pages[page], items=TodayLibrary.filter(item=>item.page===page);
    const view=document.createElement('section');
    view.id='library-content-'+page;view.className='library-content';view.dataset.page=page;
    view.setAttribute('aria-label',config.title);
    const groups=[...new Set(items.map(item=>item.group))];
    const content=page==='screens'
      ? `<div class="library-flows">${items.filter(item=>item.flow).map(card).join('')}</div><section class="library-screen-collection"><div class="library-collection-heading"><h2>Screens</h2><p>Individual screens and selected plan layouts.</p></div><div class="library-screen-grid">${items.filter(item=>!item.flow).map(card).join('')}</div></section>`
      : `<div class="library-masonry">${items.map(card).join('')}</div>`;
    view.innerHTML=`<div class="library-intro"><div><h1>${config.title}</h1><p>${config.description}</p></div><label class="library-search"><span aria-hidden="true">⌕</span><input type="search" aria-label="Search ${config.title}" placeholder="Search this space"></label></div><div class="library-filter-row"><div class="library-filters" role="group" aria-label="Filter by category">${['All',...groups].map(group=>`<button type="button" data-group="${escape(group)}" aria-pressed="${group==='All'}">${escape(group)}</button>`).join('')}</div><p class="library-result-count" role="status"></p></div>${content}<p class="library-empty" hidden>No matches. Try another name or category.</p>`;
    main.insertBefore(view,announcement);views.set(page,view);
    let group='All';const search=view.querySelector('input[type=search]');
    const apply=()=>{
      const query=search.value.trim().toLowerCase();let count=0;
      items.forEach(item=>{
        const visible=(group==='All'||group===item.group)&&`${item.title} ${item.group} ${item.note||''}`.toLowerCase().includes(query);
        view.querySelector('#'+item.id).hidden=!visible;if(visible)count++;
      });
      view.querySelectorAll('.library-filters button').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.group===group)));
      view.querySelector('.library-result-count').textContent=`${count} ${count===1?({components:'component',screens:'screen or flow',workshop:'study'}[page]):config.noun}`;
      view.querySelector('.library-empty').hidden=count>0;
      const collection=view.querySelector('.library-screen-collection');
      if(collection)collection.hidden=!collection.querySelector('.library-card:not([hidden])');
    };
    view.querySelector('.library-filters').addEventListener('click',event=>{const button=event.target.closest('[data-group]');if(button){group=button.dataset.group;apply();}});
    search.addEventListener('input',apply);
    view.addEventListener('change',event=>{
      const element=event.target.closest('.library-card');
      if(element&&event.target.matches('today-dropdown'))setPreview(element,Number(event.target.value));
    });
    view.addEventListener('click',event=>{
      const button=event.target.closest('[data-preview-state],[data-replay]');if(!button)return;
      const element=button.closest('.library-card');
      if(button.hasAttribute('data-preview-state'))setPreview(element,Number(button.dataset.previewState));
      else element.querySelector('iframe').contentWindow.postMessage({type:'today-preview-replay',id:element.id},location.origin);
    });
    apply();return view;
  }

  function updateFlow(element,index) {
    const record=TodayLibrary.find(item=>item.id===element.id);
    if(!record?.flow||!record.states[index])return;
    element.querySelectorAll('[data-preview-state]').forEach(button=>{
      if(Number(button.dataset.previewState)===index)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');
    });
    element.querySelector('.library-flow-position').textContent=`${String(index+1).padStart(2,'0')} / ${record.states.length} · ${record.states[index].label}`;
  }
  function setPreview(element,index) {
    updateFlow(element,index);
    if(!element.classList.contains('library-card-ready')){element.dataset.pendingState=String(index);return;}
    element.querySelector('iframe').contentWindow.postMessage({type:'today-preview-state',id:element.id,index},location.origin);
  }
  function targetFromHash() {
    let hash='';try{hash=decodeURIComponent(location.hash.slice(1));}catch{}
    return TodayLibrary.find(item=>item.id===(aliases[hash]||hash));
  }
  function pageFromPath() {
    return Object.keys(pages).find(page=>location.pathname.endsWith('/'+pages[page].file))||'components';
  }
  function activate(page,{push=false,scroll=false}={}) {
    if(!pages[page])return;
    const view=views.get(page)||createView(page);
    views.forEach((element,name)=>{element.hidden=name!==page;});
    currentPage=page;document.body.dataset.libraryPage=page;
    document.title='Today — '+pages[page].title;switcher.value=page;
    if(push)history.pushState({libraryPage:page},'',pages[page].file);
    announcement.textContent=pages[page].title;
    if(scroll)window.scrollTo({top:0,behavior:'instant'});
    return view;
  }
  switcher.addEventListener('change',event=>activate(event.detail.value,{push:true,scroll:true}));
  const restore=()=>{
    const linked=targetFromHash(),page=linked?.page||pageFromPath();
    activate(page);
    if(linked)document.getElementById(linked.id)?.scrollIntoView({block:'start'});
  };
  addEventListener('popstate',restore);addEventListener('hashchange',restore);
  addEventListener('message',event=>{
    if(event.origin!==location.origin||!event.data?.id)return;
    const element=document.getElementById(event.data.id),frame=element?.querySelector('iframe');
    if(!frame||event.source!==frame.contentWindow)return;
    if(event.data.type==='today-preview-size')frame.style.height=Math.min(1500,Math.max(90,Number(event.data.height)||200))+'px';
    if(event.data.type==='today-preview-state-change')updateFlow(element,Number(event.data.index));
    if(event.data.type==='today-preview-ready'){
      element.classList.add('library-card-ready');element.classList.remove('library-card-error');
      if(element.dataset.pendingState!==undefined){const index=Number(element.dataset.pendingState);delete element.dataset.pendingState;setPreview(element,index);}
    }
    if(event.data.type==='today-preview-error'){element.querySelector('.library-loading').textContent='Open the focused preview ↗';element.classList.add('library-card-error');}
  });
  const linked=targetFromHash();
  if(linked&&linked.page!==currentPage)history.replaceState({libraryPage:linked.page},'',pages[linked.page].file+'#'+linked.id);
  activate(linked?.page||currentPage);
  if(linked)requestAnimationFrame(()=>document.getElementById(linked.id)?.scrollIntoView({block:'start'}));
})();
