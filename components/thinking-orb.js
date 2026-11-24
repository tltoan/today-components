// Today lifecycle binding; geometry and tuned motion are the original MIT engine.
import {resolvePreset, MODE_FRAMES, paintFrame} from '../vendor/thinking-orbs/browser/engine/index.mjs';
export const orbDesigns = ['working','searching','solving','listening','connecting','weaving','composing','breathing','shaping'];
const origin = performance.now();
class TodayThinkingOrb extends HTMLElement {
  static observedAttributes = ['design','size','paused','label','diameter','time'];
  constructor(){super(); this._visible=false; this._frame=0; this._frozen=null;}
  get design(){const value=this.getAttribute('design'); return orbDesigns.includes(value)?value:'working';}
  get size(){return this.getAttribute('size')==='small'?20:64;}
  get reduced(){return document.documentElement.hasAttribute('data-reduced') || (!document.documentElement.hasAttribute('data-motion-override')&&this._media?.matches);}
  connectedCallback(){
    this.innerHTML='<canvas aria-hidden="true"></canvas>';
    this._canvas=this.firstElementChild; this._context=this._canvas.getContext('2d');
    this.setAttribute('role','img');
    this._media=matchMedia('(prefers-reduced-motion: reduce)');
    this._sync=()=>this.sync();
    this._media.addEventListener('change',this._sync);
    document.addEventListener('visibilitychange',this._sync);
    this._observer=new IntersectionObserver(entries=>{this._visible=entries[0].isIntersecting;this.sync();});this._observer.observe(this);
    this._resize=new ResizeObserver(()=>{this.resize();this.draw();});this._resize.observe(this);
    this._motion=new MutationObserver(this._sync);this._motion.observe(document.documentElement,{attributes:true,attributeFilter:['data-reduced','data-motion-override']});
    this.sync();
  }
  attributeChangedCallback(){if(this._context)this.sync();}
  clock(){return (performance.now()-origin)/1000;}
  sync(){
    cancelAnimationFrame(this._frame);this._frame=0;
    const diameter=Number(this.getAttribute('diameter'));
    this.style.setProperty('--orb-diameter',(diameter>0&&Number.isFinite(diameter)?Math.min(512,diameter):this.size)+'px');
    this.setAttribute('aria-label',this.getAttribute('label')||'Loading');
    this._preset=resolvePreset(this.design,this.size);
    if(this.hasAttribute('paused')){this._frozen??=this.clock();}else this._frozen=null;
    const running=!this.hasAttribute('paused')&&!this.hasAttribute('time')&&!this.reduced&&this._visible&&!document.hidden;
    this.dataset.state=this.reduced?'still':this.hasAttribute('paused')?'paused':running?'playing':'suspended';
    this.resize();this.draw();
    if(running){const tick=()=>{this.draw();this._frame=requestAnimationFrame(tick);};this._frame=requestAnimationFrame(tick);}
  }
  resize(){
    const side=this.clientWidth;if(!side)return;
    this._dpr=Math.min(3,devicePixelRatio||1);
    const pixels=Math.round(side*this._dpr);
    if(this._canvas.width!==pixels){this._canvas.width=pixels;this._canvas.height=pixels;}
  }
  draw(){
    if(!this._preset||!this._context||!this.clientWidth)return;
    let seconds=this.hasAttribute('time')?Number(this.getAttribute('time')):this._frozen??this.clock();
    if(!Number.isFinite(seconds))seconds=0;
    const t=this.reduced ? 0.6 : seconds*this._preset.speed;
    const ctx=this._context,scale=this._canvas.width/this.size;
    ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,this._canvas.width,this._canvas.height);ctx.scale(scale,scale);
    paintFrame(ctx,MODE_FRAMES[this._preset.mode](this.size,t,this._preset.opts),true);
    this.dataset.time=t.toFixed(3);
  }
  play(){this.removeAttribute('paused');}
  pause(){this.setAttribute('paused','');}
  disconnectedCallback(){
    cancelAnimationFrame(this._frame);this._frame=0;this._observer?.disconnect();this._resize?.disconnect();this._motion?.disconnect();
    this._media?.removeEventListener('change',this._sync);document.removeEventListener('visibilitychange',this._sync);
  }
}
if(!customElements.get('today-thinking-orb'))customElements.define('today-thinking-orb',TodayThinkingOrb);
