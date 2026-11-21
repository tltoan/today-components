/* Independent, local-state log action. The host owns saving and rollback. */
(() => {
  let nextId=0;
  class TodaySlideLog extends HTMLElement {
    static observedAttributes=['logged','disabled','label'];
    get logged(){return this.hasAttribute('logged');}
    set logged(value){this.toggleAttribute('logged',Boolean(value));}
    get label(){return this.getAttribute('label')||'habit';}
    connectedCallback(){
      this._abort?.abort();this._abort=new AbortController();const opts={signal:this._abort.signal},id='tsl-'+(++nextId);
      this.innerHTML='<div class="tsl-track"><div class="tsl-reveal" aria-hidden="true"></div><span class="tsl-label" aria-hidden="true">Slide to log</span><span class="tsl-success" aria-hidden="true">Logged for today</span><button type="button" class="tsl-handle" aria-describedby="'+id+'"><svg viewBox="0 0 24 24" aria-hidden="true"><path/></svg></button></div><p class="tsl-sr" id="'+id+'">Drag to the end and release, or press Enter or Space to log.</p><button type="button" class="tsl-alternative"></button><span class="tsl-sr" role="status"></span>';
      this.track=this.querySelector('.tsl-track');this.handle=this.querySelector('.tsl-handle');this.alternative=this.querySelector('.tsl-alternative');
      this.handle.addEventListener('pointerdown',e=>{if(e.button!==0||!e.isPrimary||this.logged||this.hasAttribute('disabled'))return;const travel=this.track.clientWidth-58,current=Math.max(0,Math.min(1,(this.handle.getBoundingClientRect().left-this.track.getBoundingClientRect().left-6)/travel));this._drag={id:e.pointerId,start:e.clientX-current*travel,travel};this.handle.setPointerCapture(e.pointerId);this.progress(current);this.track.classList.add('dragging');},opts);
      this.handle.addEventListener('pointermove',e=>{if(!this._drag||e.pointerId!==this._drag.id)return;if(this.outside(e)){this.cancelDrag();return;}this.progress((e.clientX-this._drag.start)/this._drag.travel);},opts);
      this.handle.addEventListener('pointerup',e=>{if(!this._drag||e.pointerId!==this._drag.id)return;if(this.outside(e)){this.cancelDrag();return;}const completed=(e.clientX-this._drag.start)/this._drag.travel>=1;this.cancelDrag(false);if(completed)this.change(true);else this.progress(0);},opts);
      this.handle.addEventListener('pointercancel',()=>this.cancelDrag(),opts);this.handle.addEventListener('lostpointercapture',()=>this.cancelDrag(),opts);
      this.handle.addEventListener('click',e=>{if(e.detail===0)this.change(true);},opts);
      this.alternative.addEventListener('click',()=>this.change(!this.logged),opts);
      this.addEventListener('keydown',e=>{if(e.key==='Escape')this.cancelDrag();},opts);
      window.addEventListener('blur',()=>this.cancelDrag(),opts);document.addEventListener('visibilitychange',()=>{if(document.hidden)this.cancelDrag();},opts);
      this._resize?.disconnect();this._resize=new ResizeObserver(()=>{this.cancelDrag();this.track.style.setProperty('--tsl-travel',(this.track.clientWidth-58)+'px');});this._resize.observe(this.track);this.render();
    }
    attributeChangedCallback(){if(this.track){this.cancelDrag(false);this.render();}}
    outside(e){const r=this.track.getBoundingClientRect();return e.clientY<r.top-44||e.clientY>r.bottom+44;}
    progress(value){this.track.style.setProperty('--tsl-progress',Math.max(0,Math.min(1,value)));}
    cancelDrag(reset=true){const drag=this._drag;if(!drag)return;this._drag=null;this.track.classList.remove('dragging');if(this.handle.hasPointerCapture(drag.id))this.handle.releasePointerCapture(drag.id);if(reset)this.progress(this.logged?1:0);}
    change(logged){if(this.hasAttribute('disabled')||this.logged===logged)return;const focused=document.activeElement===this.handle;this.logged=logged;if(focused&&logged)this.alternative.focus({preventScroll:true});this.querySelector('[role=status]').textContent=this.label+(logged?' logged.':' log undone.');this.dispatchEvent(new CustomEvent('change',{bubbles:true,detail:{logged}}));}
    render(){const disabled=this.hasAttribute('disabled');this.track.classList.toggle('logged',this.logged);this.handle.disabled=disabled||this.logged;this.handle.setAttribute('aria-label','Log '+this.label);this.handle.querySelector('path').setAttribute('d',this.logged?'m5 12 4.5 4.5L19 7':'m5 6 6 6-6 6m8-12 6 6-6 6');this.alternative.disabled=disabled;this.alternative.textContent=this.logged?'Undo log':'Or tap to log';this.alternative.setAttribute('aria-label',this.logged?'Undo '+this.label+' log':'Log '+this.label+' without sliding');this.progress(this.logged?1:0);}
    disconnectedCallback(){this.cancelDrag();this._abort?.abort();this._resize?.disconnect();}
  }
  customElements.define('today-slide-log',TodaySlideLog);
})();
