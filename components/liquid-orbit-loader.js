/* Transparent gradient loader. Requires liquid-orbit-motion.js. Alternative proposal; one-second cycle.
 * Mount only while work is pending; the host owns the loading state.
 */
(() => {
  class OrbitRenderer {
    constructor(canvas){
      this.canvas=canvas;
      const gl=canvas.getContext('webgl',{alpha:true,premultipliedAlpha:false,antialias:true});
      this.gl=gl;
      if(!gl){this.ctx=canvas.getContext('2d');return;}
      const shader=(type,code)=>{const s=gl.createShader(type);gl.shaderSource(s,code);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;};
      const vs=shader(gl.VERTEX_SHADER,'attribute vec2 a; varying vec2 uv; void main(){uv=vec2((a.x+1.0)/2.0,(1.0-a.y)/2.0);gl_Position=vec4(a,0.,1.);}');
      const fs=shader(gl.FRAGMENT_SHADER,`precision highp float;
        varying vec2 uv; uniform vec4 beads[8]; uniform vec3 shapes[8]; uniform float aa;
        void main(){vec2 p=uv*vec2(740.,700.);float field=0.;
          for(int i=0;i<8;i++){vec2 d=p-beads[i].xy;vec2 axes=vec2(d.x*shapes[i].x+d.y*shapes[i].y,-d.x*shapes[i].y+d.y*shapes[i].x)/beads[i].zw;
            float q=dot(axes,axes);if(q*shapes[i].z<=12.)field+=exp(shapes[i].z*(1.-q));}
          float alpha=smoothstep(1.-aa,1.+aa,field);
          float t=clamp((uv.x+1.-uv.y)*.5,0.,1.);
          vec3 blue=vec3(94.,145.,246.)/255.,lavender=vec3(167.,129.,240.)/255.,peach=vec3(255.,178.,118.)/255.;
          vec3 color=t<.5?mix(blue,lavender,t*2.):mix(lavender,peach,(t-.5)*2.);
          gl_FragColor=vec4(color,alpha);}`);
      const p=gl.createProgram();gl.attachShader(p,vs);gl.attachShader(p,fs);gl.linkProgram(p);
      if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(p));
      this.program=p;this.shaders=[vs,fs];gl.useProgram(p);
      this.buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,this.buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
      const a=gl.getAttribLocation(p,'a');gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);
      this.locations=['beads[0]','shapes[0]','aa'].map(n=>gl.getUniformLocation(p,n));
    }
    resize(w,h){
      const scale=this.gl?Math.min(devicePixelRatio||1,2):Math.min(1,180/w);
      this.canvas.width=Math.max(1,Math.round(w*scale));this.canvas.height=Math.max(1,Math.round(h*scale));
      if(this.gl)this.gl.viewport(0,0,this.canvas.width,this.canvas.height);
    }
    draw(time){
      if(!this.canvas.width)return;
      const beads=TodayLiquidOrbitMotion.beads(time);
      if(this.gl){const gl=this.gl;gl.useProgram(this.program);
        gl.uniform4fv(this.locations[0],new Float32Array(beads.flatMap(b=>[b.x,b.y,b.rx,b.ry])));
        gl.uniform3fv(this.locations[1],new Float32Array(beads.flatMap(b=>[Math.cos(b.angle),Math.sin(b.angle),b.sharpness])));
        gl.uniform1f(this.locations[2],Math.min(.25,8/this.canvas.width));
        gl.drawArrays(gl.TRIANGLE_STRIP,0,4);return;
      }
      // CPU contour fallback when WebGL is unavailable. Same field and palette.
      const ctx=this.ctx;if(!ctx)return;const w=this.canvas.width,h=this.canvas.height,data=ctx.createImageData(w,h),aa=Math.min(.25,8/w);
      const bs=beads.map(b=>({...b,c:Math.cos(b.angle),s:Math.sin(b.angle)}));
      for(let y=0;y<h;y++)for(let x=0;x<w;x++){
        let field=0;for(const b of bs){const dx=(x+.5)/w*740-b.x,dy=(y+.5)/h*700-b.y,q=((dx*b.c+dy*b.s)/b.rx)**2+((-dx*b.s+dy*b.c)/b.ry)**2;if(q*b.sharpness<=12)field+=Math.exp(b.sharpness*(1-q));}
        const t=((x+.5)/w+1-(y+.5)/h)/2,a=t<.5?[94,145,246]:[167,129,240],b=t<.5?[167,129,240]:[255,178,118],u=t<.5?t*2:(t-.5)*2,i=(y*w+x)*4,z=Math.max(0,Math.min(1,(field-(1-aa))/(2*aa)));
        for(let c=0;c<3;c++)data.data[i+c]=a[c]+(b[c]-a[c])*u;data.data[i+3]=255*z*z*(3-2*z);
      }ctx.putImageData(data,0,0);
    }
    destroy(){if(!this.gl)return;const g=this.gl;g.deleteBuffer(this.buffer);g.deleteProgram(this.program);this.shaders.forEach(s=>g.deleteShader(s));}
  }
  const rate=value=>Number.isFinite(Number(value))?Math.min(4,Math.max(.1,Number(value))):1;
  class TodayLiquidOrbitLoader extends HTMLElement {
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
      this._canvas=this.querySelector('canvas');this._renderer=new OrbitRenderer(this._canvas);
      this._media=matchMedia('(prefers-reduced-motion: reduce)');
      this._sync=()=>this.sync();this._media.addEventListener('change',this._sync);
      document.addEventListener('visibilitychange',this._sync);
      this._motionObserver=new MutationObserver(this._sync);
      this._motionObserver.observe(document.documentElement,{attributes:true,attributeFilter:['data-reduced','data-motion-override']});
      this._intersection=new IntersectionObserver(entries=>{this._visible=entries[0].isIntersecting;this.sync();});this._intersection.observe(this);
      this._resize=new ResizeObserver(()=>this.resize());this._resize.observe(this);
      this.sync();this.resize();
    }
    attributeChangedCallback(){if(this.isConnected&&this._renderer)this.sync();}
    capture(){if(this._started!==null){this._elapsed=this.currentTime;this._started=null;}cancelAnimationFrame(this._frame);this._frame=0;}
    sync(){
      this.capture();this._rate=this.speed;
      this.setAttribute('aria-label',this.getAttribute('label')||'Loading');
      const running=!this.paused&&!this.reduced()&&this._visible&&!document.hidden;
      this.dataset.state=this.reduced()?'still':this.paused?'paused':running?'playing':'suspended';
      this.draw(this.reduced()?0:this._elapsed);
      if(running){this._started=performance.now();const tick=()=>{this.draw(this.currentTime);this._frame=requestAnimationFrame(tick);};this._frame=requestAnimationFrame(tick);}
    }
    resize(){
      const width=this.clientWidth,height=this.clientHeight;if(!width||!height)return;
      this._renderer.resize(width,height);this.draw(this.reduced()?0:this.currentTime);
    }
    draw(time){
      this._renderer?.draw(time);
      this.dataset.time=(time%1).toFixed(3);
    }
    play(){this.removeAttribute('paused');}
    pause(){this.setAttribute('paused','');}
    replay(){this.capture();this._elapsed=0;this.removeAttribute('paused');this.sync();}
    disconnectedCallback(){this.capture();this._renderer?.destroy();this._resize?.disconnect();this._intersection?.disconnect();this._motionObserver?.disconnect();this._media?.removeEventListener('change',this._sync);document.removeEventListener('visibilitychange',this._sync);}
  }
  if(!customElements.get('today-liquid-orbit-loader'))customElements.define('today-liquid-orbit-loader',TodayLiquidOrbitLoader);
})();
