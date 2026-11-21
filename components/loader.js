/* Transparent gradient loader. Requires loader-motion.js.
 * Mount only while work is pending; the host owns the loading state.
 */
(() => {
  const rate=value=>Number.isFinite(Number(value))?Math.min(4,Math.max(.1,Number(value))):1;
  class TodayLoader extends HTMLElement {
    static observedAttributes=['paused','speed','label'];
    constructor(){super();this._elapsed=0;this._started=null;this._rate=1;this._frame=0;this._visible=false;}
    get speed(){return this.hasAttribute('speed')?rate(this.getAttribute('speed')):1;}
    set speed(value){this.setAttribute('speed',value);}
    get paused(){return this.hasAttribute('paused');}
    get currentTime(){return this._elapsed+(this._started===null?0:(performance.now()-this._started)/1000*this._rate);}
    reduced(){return document.documentElement.hasAttribute('data-reduced')||(!document.documentElement.hasAttribute('data-motion-override')&&this._media?.matches);}
    connectedCallback(){
      this.innerHTML='<canvas aria-hidden="true"></canvas>';
      this.setAttribute('role','status');this.setAttribute('aria-live','polite');
      this._canvas=this.querySelector('canvas');this._context=this._canvas.getContext('2d');
      this._media=matchMedia('(prefers-reduced-motion: reduce)');
      this._sync=()=>this.sync();this._media.addEventListener('change',this._sync);
      document.addEventListener('visibilitychange',this._sync);
      this._motionObserver=new MutationObserver(this._sync);
      this._motionObserver.observe(document.documentElement,{attributes:true,attributeFilter:['data-reduced','data-motion-override']});
      this._intersection=new IntersectionObserver(entries=>{this._visible=entries[0].isIntersecting;this.sync();});this._intersection.observe(this);
      this._resize=new ResizeObserver(()=>this.resize());this._resize.observe(this);
      this.sync();this.resize();
    }
    attributeChangedCallback(){if(this.isConnected&&this._context)this.sync();}
    capture(){if(this._started!==null){this._elapsed=this.currentTime;this._started=null;}cancelAnimationFrame(this._frame);this._frame=0;}
    sync(){
      this.capture();this._rate=this.speed;
      this.setAttribute('aria-label',this.getAttribute('label')||'Loading');
      const running=!this.paused&&!this.reduced()&&this._visible&&!document.hidden;
      this.dataset.state=this.reduced()?'still':this.paused?'paused':running?'playing':'suspended';
      this.draw(this.reduced()?2:this._elapsed);
      if(running){this._started=performance.now();const tick=()=>{this.draw(this.currentTime);this._frame=requestAnimationFrame(tick);};this._frame=requestAnimationFrame(tick);}
    }
    resize(){
      const size=Math.min(this.clientWidth,this.clientHeight);if(!size)return;
      const dpr=Math.min(3,window.devicePixelRatio||1);
      this._canvas.width=Math.round(size*dpr);this._canvas.height=Math.round(size*dpr);
      this._size=size;this._dpr=dpr;this.draw(this.reduced()?2:this.currentTime);
    }
    draw(time){
      if(!this._size||!this._context)return;
      const ctx=this._context,size=this._size,dpr=this._dpr,radius=size*.435,width=2.3*size/240;
      const points=window.TodayLoaderMotion.vertices(time);
      ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,size,size);ctx.translate(size/2,size/2);
      const gradient=ctx.createLinearGradient(-radius,radius,radius,-radius);
      gradient.addColorStop(0,'#5e91f6');gradient.addColorStop(.5,'#a781f0');gradient.addColorStop(1,'#ffb276');
      ctx.strokeStyle=gradient;ctx.lineCap='round';ctx.lineJoin='round';
      const path=(start,end,close=false)=>{ctx.beginPath();ctx.moveTo(points[start].x*radius,points[start].y*radius);for(let i=start+1;i<=end;i++)ctx.lineTo(points[i].x*radius,points[i].y*radius);if(close)ctx.closePath();};
      path(0,points.length-1,true);ctx.globalAlpha=.18;ctx.lineWidth=width*1.5;ctx.filter='blur('+width*.5+'px)';ctx.stroke();
      ctx.filter='none';ctx.globalAlpha=.35;ctx.lineWidth=width;ctx.stroke();
      for(let start=0;start<points.length-1;start+=6){
        const end=Math.min(start+6,points.length-1),depth=points[Math.floor((start+end)/2)].z,front=Math.min(1,Math.max(0,(depth+1)/2));
        path(start,end);ctx.globalAlpha=.35+.65*front;ctx.lineWidth=width/(1-.2*depth);ctx.stroke();
      }
      ctx.globalAlpha=1;this.dataset.time=(time%window.TodayLoaderMotion.duration).toFixed(3);
    }
    play(){this.removeAttribute('paused');}
    pause(){this.setAttribute('paused','');}
    replay(){this.capture();this._elapsed=0;this.removeAttribute('paused');this.sync();}
    disconnectedCallback(){this.capture();this._resize?.disconnect();this._intersection?.disconnect();this._motionObserver?.disconnect();this._media?.removeEventListener('change',this._sync);document.removeEventListener('visibilitychange',this._sync);}
  }
  if(!customElements.get('today-loader'))customElements.define('today-loader',TodayLoader);
})();
