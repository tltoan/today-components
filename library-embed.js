/* Focus existing previews without moving their DOM or detaching their event hosts. */
(() => {
  const id=new URLSearchParams(location.search).get('embed');
  if(!id||parent===window)return;
  document.documentElement.classList.add('library-embedded');
  document.documentElement.dataset.embedId=id;
  addEventListener('DOMContentLoaded',()=>{
    const record=TodayLibrary.find(item=>item.id===id);if(!record)return;
    let current=0,queued=false,lastHeight=0;
    const report=()=>{queued=false;const height=Math.ceil(document.body.getBoundingClientRect().height);if(height!==lastHeight){lastHeight=height;parent.postMessage({type:'today-preview-size',id,height},location.origin);}};
    const resize=()=>{if(!queued){queued=true;requestAnimationFrame(report);}};
    const show=(index,activate=false)=>{
      current=Math.max(0,Math.min(record.states?.length-1||0,index));
      const state=record.states?.[current],selector=state?.target||record.target;
      document.querySelectorAll('.library-embed-hidden,.library-embed-path,.library-embed-target').forEach(el=>el.classList.remove('library-embed-hidden','library-embed-path','library-embed-target'));
      const target=document.querySelector(selector),extras=record.keep?[...document.querySelectorAll(record.keep)]:[];
      if(!target){parent.postMessage({type:'today-preview-error',id,message:'Preview unavailable'},location.origin);return;}
      const targets=[target,...extras],paths=new Set();
      targets.forEach(el=>{for(let node=el;node&&node!==document.body;node=node.parentElement)paths.add(node);});
      const prune=el=>{for(const child of el.children){if(['SCRIPT','STYLE','LINK','DIALOG','TODAY-LOG-DIALOG'].includes(child.tagName)||child.matches('svg.symbols'))continue;if(!paths.has(child))child.classList.add('library-embed-hidden');else if(targets.includes(child))child.classList.add('library-embed-target');else{child.classList.add('library-embed-path');prune(child);}}};
      prune(document.body);
      // The approved onboarding uses the selected flow, never the comparison switch.
      if(record.id==='onboarding')document.querySelector('.ob-view-mode')?.classList.add('library-embed-hidden');
      if(activate&&state?.click)document.querySelector(state.click)?.click();
      document.querySelectorAll('a[href]').forEach(link=>{if(!link.getAttribute('href').startsWith('#')&&!link.hasAttribute('download')){link.target='_blank';link.rel='noopener';}});
      resize();parent.postMessage({type:'today-preview-ready',id},location.origin);
    };
    addEventListener('message',event=>{if(event.origin!==location.origin||event.source!==parent||event.data?.id!==id)return;
      if(event.data.type==='today-preview-state')show(Number(event.data.index)||0,true);
      if(event.data.type==='today-preview-replay'){const selector=record.states?.[current]?.replay||record.replay;if(selector)document.querySelector(selector)?.click();}
    });
    show(record.initialState||0,record.initialState!==undefined);
    if(record.flow){
      const tabs=document.querySelector('.ob-page-tabs');
      const syncStep=()=>{
        const screen=tabs?.querySelector('[aria-pressed="true"]')?.dataset.screen;
        const index=record.states.findIndex(state=>state.screen===screen);
        if(index>=0)parent.postMessage({type:'today-preview-state-change',id,index},location.origin);
      };
      if(tabs)new MutationObserver(syncStep).observe(tabs,{subtree:true,attributes:true,attributeFilter:['aria-pressed']});
      syncStep();
    }
    if(record.previewOnce){
      const target=document.querySelector(record.target);
      const once=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){document.querySelector(record.previewOnce)?.click();once.disconnect();}},{threshold:.25});
      if(target)once.observe(target);
    }
    new ResizeObserver(resize).observe(document.body);
    document.fonts.ready.then(resize);
    // Dialogs stay within their frame and remain visible even when the editor is opened from history.
    new MutationObserver(()=>{
      const modal=[...document.querySelectorAll('dialog[open]')].some(el=>!el.closest('.library-embed-hidden'));
      document.documentElement.classList.toggle('library-embed-modal',modal);resize();
    }).observe(document.body,{subtree:true,attributes:true,attributeFilter:['open']});
  });
})();
