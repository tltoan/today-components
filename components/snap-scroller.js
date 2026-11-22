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
    constructor(viewport,{selector,onSelect=()=>{},onInteract=()=>{},reducedMotion=()=>false,interactiveDrag=false,axis='y',fade=true}={}){
      this.viewport=viewport;this.selector=selector;this.onSelect=onSelect;this.onInteract=onInteract;this.reducedMotion=reducedMotion;this.interactiveDrag=interactiveDrag;
      this.horizontal=axis==='x';this.fade=fade;
      this.index=0;this.targetIndex=0;this.drag=null;this.frame=0;this.paintFrame=0;this.timer=0;this.wheelGesture=null;
      this.abort=new AbortController();const signal=this.abort.signal;
      viewport.addEventListener('scroll',()=>this._onScroll(),{passive:true,signal});
      viewport.addEventListener('wheel',event=>this._wheel(event),{passive:false,signal});
      viewport.addEventListener('click',event=>{if(performance.now()<(this.suppressClickUntil||0)){event.preventDefault();event.stopImmediatePropagation();}},{capture:true,signal});
      viewport.addEventListener('pointerdown',event=>this._pointerDown(event),{signal});
      viewport.addEventListener('pointermove',event=>this._pointerMove(event),{signal});
      viewport.addEventListener('pointerup',event=>this._pointerEnd(event),{signal});
      viewport.addEventListener('pointercancel',()=>this.cancelDrag(),{signal});
      viewport.addEventListener('lostpointercapture',()=>{if(this.drag)this.cancelDrag();},{signal});
      viewport.addEventListener('keydown',event=>{
        if(event.target.closest('button,a,input,select,textarea'))return;
        const base=this.frame?this.targetIndex:this.index;
        const arrows=this.horizontal?{ArrowRight:base+1,ArrowLeft:base-1}:{ArrowDown:base+1,ArrowUp:base-1};
        const target={...arrows,PageDown:base+1,PageUp:base-1,Home:0,End:this.rows.length-1}[event.key];
        if(target!==undefined){event.preventDefault();this.onInteract();this.goTo(target);}
        if(event.key==='Escape')this.cancelDrag();
      },{signal});
    }
    get position(){return this.horizontal?this.viewport.scrollLeft:this.viewport.scrollTop;}
    set position(value){if(this.horizontal)this.viewport.scrollLeft=value;else this.viewport.scrollTop=value;}
    get extent(){return this.horizontal?this.viewport.clientWidth:this.viewport.clientHeight;}
    coordinate(event){return this.horizontal?event.clientX:event.clientY;}
    get rows(){return [...this.viewport.querySelectorAll(this.selector)];}
    offsets(){const rows=this.rows,key=this.horizontal?'offsetLeft':'offsetTop';return rows.map(row=>row[key]-rows[0][key]);}
    nearest(position=this.position){const offsets=this.offsets();return offsets.reduce((best,y,i)=>Math.abs(y-position)<Math.abs(offsets[best]-position)?i:best,0);}
    _cancelAnimation(){cancelAnimationFrame(this.frame);this.frame=0;clearTimeout(this.timer);this.viewport.removeAttribute('data-settling');}
    _paint(){
      const offsets=this.offsets(),top=this.position;
      this.rows.forEach((row,i)=>{
        const stride=offsets[i+1]-offsets[i]||offsets[i]-offsets[i-1]||126;
        const proximity=clamp(1-Math.abs(offsets[i]-top)/stride,0,1);
        if(this.fade)row.style.opacity=String(.38+.62*proximity);
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
      const primary=this.horizontal?event.deltaX:event.deltaY,cross=this.horizontal?event.deltaY:event.deltaX;
      if(event.ctrlKey||Math.abs(cross)>Math.abs(primary)||!primary)return;
      event.preventDefault();this.onInteract();
      const now=performance.now(),direction=Math.sign(primary);
      const delta=primary*(event.deltaMode===1?16:event.deltaMode===2?this.extent:1);
      // One wheel/trackpad burst advances one item. Its inertial tail must not
      // cancel the landing or skip several items. Reversing remains responsive.
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
      const from=this.position,to=offsets[this.targetIndex],distance=to-from;
      const finish=()=>{
        this.frame=0;this.position=to;this._paint();this.index=this.targetIndex;
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
        this.position=from+distance*eased;this._paint();
        if(t<1)this.frame=requestAnimationFrame(tick);else finish();
      };
      this.frame=requestAnimationFrame(tick);
    }
    refresh(index=this.index){
      this._cancelAnimation();
      const rows=this.rows;if(!rows.length){this.index=this.targetIndex=0;this.position=0;return;}
      rows[0].parentElement.style[this.horizontal?'paddingRight':'paddingBottom']=Math.max(0,this.extent-rows.at(-1)[this.horizontal?'offsetWidth':'offsetHeight'])+'px';
      this.goTo(index,{immediate:true});
    }
    _pointerDown(event){
      if(!event.isPrimary||event.button!==0)return;
      const interactive=event.target.closest('button,a,input,select,textarea');
      if(interactive&&!this.interactiveDrag)return;
      this.onInteract();this._cancelAnimation();this.wheelGesture=null;
      this.drag={pending:this.horizontal||!!interactive,pointer:event.pointerId,startY:this.coordinate(event),startCross:event.clientY,startTop:this.position,index:this.nearest(),lastY:this.coordinate(event),lastTime:performance.now(),velocity:0};
      // Horizontal galleries wait for direction intent, leaving vertical page scrolling free.
      if(this.drag.pending)return;
      this.viewport.classList.add('dragging');this.viewport.setPointerCapture(event.pointerId);
      this.viewport.focus({preventScroll:true});event.preventDefault();
    }
    _pointerMove(event){
      const drag=this.drag;if(!drag||drag.pointer!==event.pointerId)return;
      const coordinate=this.coordinate(event);
      if(drag.pending){
        if(this.horizontal&&Math.abs(event.clientY-drag.startCross)>Math.max(7,Math.abs(coordinate-drag.startY))){this._releaseDrag();return;}
        if(Math.abs(coordinate-drag.startY)<7)return;drag.pending=false;this.viewport.classList.add('dragging');this.viewport.setPointerCapture(event.pointerId);this.viewport.focus({preventScroll:true});
      }
      const now=performance.now(),dt=Math.max(1,now-drag.lastTime);
      drag.velocity=.65*drag.velocity+.35*(drag.lastY-coordinate)/dt;
      drag.lastTime=now;drag.lastY=coordinate;
      const offsets=this.offsets(),index=drag.index;
      this.position=clamp(drag.startTop+drag.startY-coordinate,offsets[Math.max(0,index-1)],offsets[Math.min(offsets.length-1,index+1)]);this._paint();
    }
    _pointerEnd(event){
      if(!this.drag)return;
      const drag=this.drag;if(drag.pointer!==event.pointerId)return;
      if(drag.pending){this._releaseDrag();return;}
      this.suppressClickUntil=performance.now()+350;
      const velocity=performance.now()-drag.lastTime<90?drag.velocity:0;
      const displacement=this.position-drag.startTop;
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
