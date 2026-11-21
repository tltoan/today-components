(() => {
  const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
  // Solve the CSS cubic-bezier so arrow navigation and settling share a curve.
  function bezier(x,x1,y1,x2,y2){
    const value=(t,a,b)=>3*(1-t)*(1-t)*t*a+3*(1-t)*t*t*b+t*t*t;
    let lo=0,hi=1,t=x;
    for(let i=0;i<14;i++){if(value(t,x1,x2)<x)lo=t;else hi=t;t=(lo+hi)/2;}
    return value(t,y1,y2);
  }
  class TodaySnapScroller {
    constructor(viewport,{selector,onSelect=()=>{},onInteract=()=>{},reducedMotion=()=>false}={}){
      this.viewport=viewport;this.selector=selector;this.onSelect=onSelect;this.onInteract=onInteract;this.reducedMotion=reducedMotion;
      this.index=0;this.targetIndex=0;this.drag=null;this.frame=0;this.paintFrame=0;this.timer=0;this.wheelGesture=null;
      this.abort=new AbortController();const signal=this.abort.signal;
      viewport.addEventListener('scroll',()=>this._onScroll(),{passive:true,signal});
      viewport.addEventListener('wheel',event=>this._wheel(event),{passive:false,signal});
      viewport.addEventListener('pointerdown',event=>this._pointerDown(event),{signal});
      viewport.addEventListener('pointermove',event=>this._pointerMove(event),{signal});
      viewport.addEventListener('pointerup',event=>this._pointerEnd(event),{signal});
      viewport.addEventListener('pointercancel',()=>this.cancelDrag(),{signal});
      viewport.addEventListener('lostpointercapture',()=>{if(this.drag)this.cancelDrag();},{signal});
      viewport.addEventListener('keydown',event=>{
        const base=this.frame?this.targetIndex:this.index;
        const target={ArrowDown:base+1,ArrowUp:base-1,PageDown:base+1,PageUp:base-1,Home:0,End:this.rows.length-1}[event.key];
        if(target!==undefined){event.preventDefault();this.onInteract();this.goTo(target);}
        if(event.key==='Escape')this.cancelDrag();
      },{signal});
    }
    get rows(){return [...this.viewport.querySelectorAll(this.selector)];}
    offsets(){const rows=this.rows;return rows.map(row=>row.offsetTop-rows[0].offsetTop);}
    nearest(position=this.viewport.scrollTop){const offsets=this.offsets();return offsets.reduce((best,y,i)=>Math.abs(y-position)<Math.abs(offsets[best]-position)?i:best,0);}
    _cancelAnimation(){cancelAnimationFrame(this.frame);this.frame=0;clearTimeout(this.timer);this.viewport.removeAttribute('data-settling');}
    _paint(){
      const offsets=this.offsets(),top=this.viewport.scrollTop;
      this.rows.forEach((row,i)=>{
        const stride=offsets[i+1]-offsets[i]||offsets[i]-offsets[i-1]||126;
        const proximity=clamp(1-Math.abs(offsets[i]-top)/stride,0,1);
        row.style.opacity=String(.38+.62*proximity);
      });
      const index=this.nearest();
      if(index!==this.index){this.index=index;this.onSelect(index);}
    }
    _onScroll(){
      if(!this.paintFrame)this.paintFrame=requestAnimationFrame(()=>{this.paintFrame=0;this._paint();});
      if(!this.frame&&!this.drag)this._scheduleSettle();
    }
    _scheduleSettle(){clearTimeout(this.timer);this.timer=setTimeout(()=>{if(!this.drag&&!this.frame)this.goTo(this.nearest());},100);}
    _wheel(event){
      if(event.ctrlKey||Math.abs(event.deltaX)>Math.abs(event.deltaY)||!event.deltaY)return;
      event.preventDefault();this.onInteract();
      const now=performance.now(),direction=Math.sign(event.deltaY);
      const delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?this.viewport.clientHeight:1);
      // One wheel/trackpad burst advances one day. Its inertial tail must not
      // cancel the landing or skip several dates. Reversing remains responsive.
      let gesture=this.wheelGesture;
      if(!gesture||now-gesture.last>180||gesture.direction!==direction){
        gesture=this.wheelGesture={last:now,direction,total:0,stepped:false};
      }
      gesture.last=now;gesture.total+=Math.abs(delta);
      if(!gesture.stepped&&gesture.total>=24){
        gesture.stepped=true;
        this.goTo((this.frame?this.targetIndex:this.nearest())+direction);
      }
    }
    goTo(index,{immediate=false,velocity=0}={}){
      this._cancelAnimation();
      const offsets=this.offsets();if(!offsets.length)return;
      this.targetIndex=clamp(index,0,offsets.length-1);
      const from=this.viewport.scrollTop,to=offsets[this.targetIndex],distance=to-from;
      const finish=()=>{
        this.frame=0;this.viewport.scrollTop=to;this._paint();this.index=this.targetIndex;
        this.viewport.removeAttribute('data-settling');this.viewport.dataset.snapIndex=String(this.index);this.onSelect(this.index);
      };
      if(immediate||this.reducedMotion()||Math.abs(distance)<.75){finish();return;}
      const style=getComputedStyle(this.viewport);
      const duration=parseFloat(style.getPropertyValue('--today-agenda-settle'))||680;
      const controls=(style.getPropertyValue('--today-agenda-easing').match(/[\d.]+/g)||['.22','.68','.24','1']).map(Number);
      const start=performance.now();
      // A same-direction release preserves some hand velocity, ending at rest.
      const tangent=velocity*distance>0?clamp(velocity*duration/distance,0,3):0;
      this.viewport.dataset.settling='true';
      const tick=now=>{
        const t=clamp((now-start)/duration,0,1);
        const eased=tangent>0?(-2*t*t*t+3*t*t)+(t*t*t-2*t*t+t)*tangent:bezier(t,...controls);
        this.viewport.scrollTop=from+distance*eased;this._paint();
        if(t<1)this.frame=requestAnimationFrame(tick);else finish();
      };
      this.frame=requestAnimationFrame(tick);
    }
    refresh(index=this.index){
      const rows=this.rows;if(!rows.length)return;
      rows[0].parentElement.style.paddingBottom=Math.max(0,this.viewport.clientHeight-rows.at(-1).offsetHeight)+'px';
      this.goTo(index,{immediate:true});
    }
    _pointerDown(event){
      if(!event.isPrimary||event.button!==0)return;
      this.onInteract();this._cancelAnimation();this.wheelGesture=null;
      this.drag={pointer:event.pointerId,startY:event.clientY,startTop:this.viewport.scrollTop,index:this.nearest(),lastY:event.clientY,lastTime:performance.now(),velocity:0};
      this.viewport.classList.add('dragging');this.viewport.setPointerCapture(event.pointerId);
      this.viewport.focus({preventScroll:true});event.preventDefault();
    }
    _pointerMove(event){
      const drag=this.drag;if(!drag||drag.pointer!==event.pointerId)return;
      const now=performance.now(),dt=Math.max(1,now-drag.lastTime);
      drag.velocity=.65*drag.velocity+.35*(drag.lastY-event.clientY)/dt;
      drag.lastTime=now;drag.lastY=event.clientY;
      const offsets=this.offsets(),index=drag.index;
      this.viewport.scrollTop=clamp(drag.startTop+drag.startY-event.clientY,offsets[Math.max(0,index-1)],offsets[Math.min(offsets.length-1,index+1)]);this._paint();
    }
    _pointerEnd(event){
      if(!this.drag)return;
      const drag=this.drag;if(drag.pointer!==event.pointerId)return;
      const velocity=performance.now()-drag.lastTime<90?drag.velocity:0;
      const displacement=this.viewport.scrollTop-drag.startTop;
      const offsets=this.offsets(),stride=offsets[1]-offsets[0]||126;
      const commits=Math.abs(displacement)>=Math.min(28,stride*.22)||(Math.abs(velocity)>.35&&Math.abs(displacement)>8);
      const target=commits?drag.index+Math.sign(displacement):drag.index;
      this._releaseDrag();this.goTo(target,{velocity});
    }
    _releaseDrag(){
      const pointer=this.drag?.pointer;this.drag=null;this.viewport.classList.remove('dragging');
      if(pointer!==undefined&&this.viewport.hasPointerCapture(pointer))this.viewport.releasePointerCapture(pointer);
    }
    cancelDrag(){
      const index=this.drag?.index??this.nearest();this._releaseDrag();this.goTo(index);
    }
    settleImmediately(){this._releaseDrag();this.wheelGesture=null;this.goTo(this.nearest(),{immediate:true});}
    destroy(){this._cancelAnimation();cancelAnimationFrame(this.paintFrame);this.abort.abort();this._releaseDrag();}
  }
  window.TodayUI=Object.assign(window.TodayUI||{},{SnapScroller:TodaySnapScroller});
})();
