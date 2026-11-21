(() => {
// Browser counterpart of the supplied SwiftUI component. The vector geometry,
// Hermite curves, stroke masks, timing, lift, gradient, and period match its source.
// Exact vector geometry from the supplied TodayLogoAnimation.swift.
const glyphs = [
  "M88.44 306.31 L88.44 297.51 L93.06 297.51 L93.06 288.71 L103.29 288.71 L103.29 297.51 L108.955 297.51 L108.955 306.31 L103.29 306.31 L103.29 326 L93.06 326 L93.06 306.31 L88.44 306.31 Z",
  "M118.238 311.755 C118.238 303.01 125.498 296.85 133.858 296.85 C142.218 296.85 149.478 303.01 149.478 311.755 C149.478 320.5 142.218 326.66 133.858 326.66 C125.498 326.66 118.238 320.5 118.238 311.755 Z M127.698 311.755 C127.698 315.275 130.283 318.025 133.858 318.025 C137.433 318.025 140.018 315.275 140.018 311.755 C140.018 308.235 137.433 305.485 133.858 305.485 C130.283 305.485 127.698 308.235 127.698 311.755 Z",
  "M182.279 281.67 L192.509 281.67 L192.509 326 L182.279 326 L182.279 323.25 C180.739 324.9 177.934 326.66 173.974 326.66 C166.384 326.66 160.004 320.335 160.004 311.755 C160.004 303.175 166.384 296.85 173.974 296.85 C177.934 296.85 180.739 298.61 182.279 300.26 L182.279 281.67 Z M170.179 311.755 C170.179 315.275 172.764 318.025 176.339 318.025 C179.914 318.025 182.499 315.275 182.499 311.755 C182.499 308.235 179.914 305.485 176.339 305.485 C172.764 305.485 170.179 308.235 170.179 311.755 Z",
  "M226.462 297.51 L236.692 297.51 L236.692 326 L226.462 326 L226.462 323.25 C224.922 324.9 222.117 326.66 218.157 326.66 C210.567 326.66 204.187 320.335 204.187 311.755 C204.187 303.175 210.567 296.85 218.157 296.85 C222.117 296.85 224.922 298.61 226.462 300.26 L226.462 297.51 Z M214.362 311.755 C214.362 315.275 216.947 318.025 220.522 318.025 C224.097 318.025 226.682 315.275 226.682 311.755 C226.682 308.235 224.097 305.485 220.522 305.485 C216.947 305.485 214.362 308.235 214.362 311.755 Z",
  "M247.489 339.75 L258.324 320.06 L246.499 297.51 L257.554 297.51 L263.769 309.83 L269.929 297.51 L280.819 297.51 L258.104 339.75 L247.489 339.75 Z",
  "M285.319 320.115 C285.319 316.485 288.179 313.735 291.754 313.735 C295.329 313.735 298.189 316.485 298.189 320.115 C298.189 323.745 295.329 326.495 291.754 326.495 C288.179 326.495 285.319 323.745 285.319 320.115 Z"
];


const duration=2.10;
const smooth=value=>{const x=Math.min(1,Math.max(0,value));return x*x*x*(x*(x*6-15)+10);};
const clamp=value=>Math.max(0,Math.min(1,value));
function curve(keys) {
  const h=keys.slice(1).map((key,i)=>key[0]-keys[i][0]);
  const d=h.map((gap,i)=>(keys[i+1][1]-keys[i][1])/gap);
  const slopes=keys.map(()=>0);
  for(let i=1;i<keys.length-1;i++)if(d[i-1]*d[i]>0){
    const a=2*h[i]+h[i-1],b=h[i]+2*h[i-1];
    slopes[i]=(a+b)/(a/d[i-1]+b/d[i]);
  }
  return time=>{
    if(time<=keys[0][0])return keys[0][1];
    if(time>=keys.at(-1)[0])return keys.at(-1)[1];
    const i=keys.findIndex((key,index)=>index<keys.length-1&&time<keys[index+1][0]);
    const u=(time-keys[i][0])/h[i],u2=u*u,u3=u2*u;
    return (2*u3-3*u2+1)*keys[i][1]+(u3-2*u2+u)*h[i]*slopes[i]+(-2*u3+3*u2)*keys[i+1][1]+(u3-u2)*h[i]*slopes[i+1];
  };
}
const entrances=[
  [[.53,0],[.60,.03],[.667,.145],[.733,.428],[.80,.645],[.90,.815],[1,.908],[1.10,.967],[1.20,.99],[1.35,1]],
  [[.62,0],[.70,.073],[.767,.23],[.833,.545],[.90,.74],[.967,.85],[1.067,.93],[1.20,.98],[1.35,1]],
  [[.70,0],[.80,.038],[.90,.09],[1,.16],[1.10,.25],[1.167,.42],[1.233,.61],[1.30,.74],[1.40,.86],[1.50,.96],[1.60,1]],
  [[.80,0],[.90,.09],[1,.23],[1.10,.407],[1.20,.583],[1.30,.76],[1.40,.90],[1.50,.985],[1.567,1]],
  [[.85,0],[.933,.125],[1,.27],[1.067,.50],[1.133,.683],[1.20,.79],[1.30,.883],[1.40,.94],[1.50,.98],[1.633,1]]
].map(curve);
const periodStart=1.267;
const periodY=curve([[periodStart,-72],[periodStart+.12,-68],[periodStart+.32,-51],[periodStart+.58,-23],[periodStart+.78,-5],[periodStart+.90,0],[periodStart+.97,1],[periodStart+1.08,0]]);
const periodHeight=curve([[periodStart,0],[periodStart+.06,22.8],[periodStart+.35,25.5],[periodStart+.58,31],[periodStart+.78,27],[periodStart+.90,22.8],[periodStart+.97,21.5],[periodStart+1.08,22.8]]);
function lift(time){
  if(time<.20)return (-22+39*Math.pow(Math.max(0,1-time/.20),3))*.465;
  if(time<.52)return (-22+31*smooth((time-.20)/.32))*.465;
  return 9*(1-smooth((time-.52)/.30))*.465;
}
const line=(x1,y1,x2,y2)=>`M${x1} ${y1} L${x2} ${y2}`;
function oval(cx,cy,rx,ry,fromTop){
  const start=fromTop?-Math.PI/2:0,k=.55228475;
  const point=theta=>[cx+rx*Math.cos(theta),cy+ry*Math.sin(theta)];
  let path='M'+point(start).join(' ');
  for(let i=0;i<4;i++){
    const a=start+i*Math.PI/2,b=a+Math.PI/2,p1=point(a),p2=point(b);
    path+=` C${p1[0]-k*rx*Math.sin(a)} ${p1[1]+k*ry*Math.cos(a)} ${p2[0]+k*rx*Math.sin(b)} ${p2[1]-k*ry*Math.cos(b)} ${p2.join(' ')}`;
  }
  return path;
}
const stroke=(path,width,start=0,end=1)=>({path,width,start,end});
const strokes=[
  [stroke(line(98.175,288,98.175,327),10.4,0,.78),stroke(line(88,301.91,110,301.91),8.9,.22)],
  [stroke(oval(133.858,311.755,10.89,10.61,true),10.6)],
  [stroke(line(187.394,281,187.394,327),10.4,0,.38),stroke(oval(176.339,311.755,11.25,10.61,false),10.8,.22)],
  [stroke(oval(220.522,311.755,11.25,10.61,true),10.8,0,.88),stroke(line(231.577,297,231.577,327),10.4,.58)],
  [stroke(line(251.8,296.5,263.77,319.6),10.4,0,.40),stroke(line(275.4,296.5,252.3,341),10.1,.23)]
];

class TodayLogoAnimation extends HTMLElement {
  static observedAttributes=['playing','speed','loop','replay-token','reduced-motion'];
  constructor(){
    super();
    this.attachShadow({mode:'open'});
    this._time=0;this._frame=0;this._last=null;this._rate=1;this._visible=false;this._ended=false;
    this._preference=matchMedia('(prefers-reduced-motion: reduce)');
    this._clockChanged=()=>this._syncClock();
    this._tick=now=>{
      this._frame=0;
      if(!this._canPlay()){this._last=null;return;}
      if(this._last!==null)this._time+=(now-this._last)/1000*this._rate;
      this._last=now;
      if(!this.loops&&this._time>=duration){
        this._time=duration;this._render();this._last=null;
        if(!this._ended){this._ended=true;this.dispatchEvent(new Event('complete'));}
        return;
      }
      this._render();this._frame=requestAnimationFrame(this._tick);
    };
  }
  connectedCallback(){
    this.setAttribute('role','img');this.setAttribute('aria-label','Today');
    if(!this.shadowRoot.children.length)this._build();
    this._rate=this.speed;
    document.addEventListener('visibilitychange',this._clockChanged);
    this._preference.addEventListener('change',this._clockChanged);
    this._observer=new IntersectionObserver(entries=>{
      this._visible=entries[0].isIntersecting;this._syncClock();
    });
    this._observer.observe(this);
    this._render();this._syncClock();
  }
  disconnectedCallback(){
    cancelAnimationFrame(this._frame);this._frame=0;this._last=null;
    this._observer?.disconnect();
    document.removeEventListener('visibilitychange',this._clockChanged);
    this._preference.removeEventListener('change',this._clockChanged);
  }
  attributeChangedCallback(name,oldValue,newValue){
    if(oldValue===newValue)return;
    if(name==='speed'){
      if(this._last!==null){this._time+=(performance.now()-this._last)/1000*this._rate;this._last=performance.now();}
      this._rate=this.speed;
    }
    if(name==='replay-token'){this._time=0;this._last=null;this._ended=false;}
    if(this.shadowRoot?.children.length)this._syncClock();
  }
  get isPlaying(){return this.getAttribute('playing')!=='false';}
  set isPlaying(value){this.setAttribute('playing',String(Boolean(value)));}
  get speed(){const value=Number(this.getAttribute('speed')??1);return Number.isFinite(value)?Math.min(2,Math.max(.1,value)):1;}
  set speed(value){this.setAttribute('speed',String(value));}
  get loops(){return this.hasAttribute('loop');}
  set loops(value){this.toggleAttribute('loop',Boolean(value));}
  get replayToken(){return Number(this.getAttribute('replay-token')??0);}
  set replayToken(value){this.setAttribute('replay-token',String(value));}
  get reducedMotion(){return this.hasAttribute('reduced-motion')?this.getAttribute('reduced-motion')!=='false':this._preference.matches;}
  get currentTime(){return this._time;}
  get finished(){return !this.loops&&this._time>=duration;}
  replay(){this.replayToken++;}
  _canPlay(){return this.isConnected&&this._visible&&!document.hidden&&this.isPlaying&&!this.reducedMotion&&!this.finished;}
  _syncClock(){
    cancelAnimationFrame(this._frame);this._frame=0;
    if(this._last!==null)this._time+=(performance.now()-this._last)/1000*this._rate;
    this._last=null;this._render();
    if(this._canPlay())this._frame=requestAnimationFrame(this._tick);
  }
  _build(){
    this.shadowRoot.innerHTML=`<style>:host{display:block;width:240px;aspect-ratio:2.4}svg{display:block;width:100%;height:100%;overflow:hidden}</style><svg xmlns="http://www.w3.org/2000/svg" viewBox="73.3145 260.71 240 100" aria-hidden="true"><defs><linearGradient id="ink" gradientUnits="userSpaceOnUse" x1="98.9926" y1="291.54" x2="273.291" y2="341.08"><stop offset="0" stop-color="rgb(83.96183848%,83.96183848%,83.96183848%)"/><stop offset="1" stop-color="rgb(51.91368461%,51.91368461%,51.91368461%)"/></linearGradient>${glyphs.slice(0,5).map((path,i)=>`<clipPath id="glyph-${i}"><path d="${path}" clip-rule="evenodd"/></clipPath>`).join('')}</defs>${glyphs.slice(0,5).map((path,i)=>`<g class="letter"><g clip-path="url(#glyph-${i})"><g class="traces">${strokes[i].map(s=>`<path d="${s.path}" fill="none" stroke="url(#ink)" stroke-width="${s.width}" stroke-linecap="butt" stroke-linejoin="round" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1"/>`).join('')}</g><path class="finish" d="${path}" fill="url(#ink)" fill-rule="evenodd"/></g></g>`).join('')}<g class="period"><path d="${glyphs[5]}" fill="url(#ink)"/></g></svg>`;
    this._letters=[...this.shadowRoot.querySelectorAll('.letter')].map(group=>({group,traces:group.querySelector('.traces'),paths:[...group.querySelectorAll('.traces path')],finish:group.querySelector('.finish')}));
    this._period=this.shadowRoot.querySelector('.period');
  }
  _render(){
    if(!this._letters)return;
    const seconds=this.reducedMotion?duration:this.loops?Math.max(0,this._time)%duration:Math.min(duration,Math.max(0,this._time));
    const time=seconds+.33;
    this._letters.forEach((letter,index)=>{
      const progress=entrances[index](time);
      letter.group.setAttribute('visibility',progress>0?'visible':'hidden');
      letter.group.setAttribute('transform',`translate(0 ${lift(time-.533333-index*.1)})`);
      letter.traces.setAttribute('visibility',progress>=.99999?'hidden':'visible');
      letter.paths.forEach((path,j)=>{
        const s=strokes[index][j],p=clamp((progress-s.start)/(s.end-s.start));
        path.setAttribute('stroke-dashoffset',String(1-p));
      });
      letter.finish.setAttribute('opacity',String(progress>=.99999?1:progress>.94?smooth((progress-.94)/.06):0));
    });
    const reveal=smooth((time-periodStart)/.05),settled=time>=periodStart+1.08;
    this._period.setAttribute('visibility',reveal>0?'visible':'hidden');
    this._period.setAttribute('transform',settled?'':`translate(291.754 ${320.115+periodY(time)*.465}) scale(${reveal} ${Math.max(.0001,periodHeight(time)/22.8)}) translate(-291.754 -320.115)`);
  }
}
window.TodayUI=window.TodayUI||{};
TodayUI.WordmarkArt={glyphs,strokes,entrances,periodStart,periodY,periodHeight,lift,smooth,clamp};
if(!customElements.get('today-logo-animation'))customElements.define('today-logo-animation',TodayLogoAnimation);

})();
