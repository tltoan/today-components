(() => {
  const example=[{id:'2026-11-01',dateLabel:'Nov 1',value:5},{id:'2026-11-03',dateLabel:'Nov 3',value:10},{id:'2026-11-05',dateLabel:'Nov 5',value:12},{id:'2026-11-08',dateLabel:'Nov 8',value:null},{id:'2026-11-10',dateLabel:'Nov 10',value:8},{id:'2026-11-12',dateLabel:'Nov 12',value:15}];
  class TodayStaggeredBarChart extends HTMLElement {
    get points(){return this.data??example;}
    set points(value){this.data=value.map(point=>({...point}));if(this.initialized)this.render();}
    get target(){return Math.max(0,Number(this.getAttribute('target')??10));}
    get stagger(){return Math.max(0,Number(this.getAttribute('stagger')??140));}
    connectedCallback(){
      if(!this.initialized){
        this.initialized=true;this.animations=[];this.preference=matchMedia('(prefers-reduced-motion: reduce)');
        this.motionChanged=()=>{if(this.reduced())this.settle();};this.motionObserver=new MutationObserver(this.motionChanged);
      }
      this.preference.addEventListener('change',this.motionChanged);this.motionObserver.observe(document.documentElement,{attributes:true,attributeFilter:['data-reduced','data-motion-override']});
      this.intersection=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)&&!this.entered){this.entered=true;this.replay();}},{threshold:.35});
      this.render();this.intersection.observe(this);
    }
    reduced(){return document.documentElement.hasAttribute('data-reduced')||(!document.documentElement.hasAttribute('data-motion-override')&&this.preference?.matches);}
    settle(){this.animations.forEach(animation=>animation.cancel());this.animations=[];this.removeAttribute('data-animating');if(this.reduced())this.removeAttribute('data-pending');}
    render(){
      this.settle();
      const points=this.points,maximum=Math.max(...points.map(p=>p.value??0),this.target*1.5,1),usableHeight=120,targetHeight=this.target/maximum*usableHeight,unit=this.getAttribute('unit')||'pages';
      this.innerHTML='<div class="staggered-plot"><div class="staggered-target"><span></span></div><div class="staggered-columns" role="list"></div></div><div class="staggered-dates" aria-hidden="true"></div>';
      this.setAttribute('role','group');this.setAttribute('aria-label',`Recorded ${unit} by date`);
      const target=this.querySelector('.staggered-target');target.style.bottom=`${targetHeight}px`;target.querySelector('span').textContent=this.getAttribute('target-label')||`${this.target}-${unit==='pages'?'page':unit} target`;
      const columns=this.querySelector('.staggered-columns'),dates=this.querySelector('.staggered-dates');
      columns.style.gridTemplateColumns=dates.style.gridTemplateColumns=`repeat(${Math.max(1,points.length)},minmax(0,1fr))`;
      points.forEach((point,index)=>{
        const column=document.createElement('div');column.className='staggered-column';column.setAttribute('role','listitem');column.dataset.index=index;
        column.setAttribute('aria-label',point.value==null?`${point.dateLabel}. No log.`:`${point.dateLabel}. ${point.value} ${unit}. ${point.value>=this.target?'Target met.':'Below target.'}`);
        const label=document.createElement('span');label.className='staggered-value';label.setAttribute('aria-hidden','true');
        if(point.value==null){label.textContent='No log';label.classList.add('staggered-missing');label.style.bottom='7px';}
        else{
          const height=Math.max(0,point.value)/maximum*usableHeight,bar=document.createElement('div');bar.className=`staggered-bar${point.value>=this.target?' target-met':''}`;bar.style.height=`${point.value===0?1:height}px`;bar.setAttribute('aria-hidden','true');column.append(bar);
          label.textContent=point.value;label.style.bottom=`${point.value===0?7:height>=28?height-22:height+6}px`;
          if(height>=28)label.classList.add('staggered-inside');
          if(point.value>0){bar.dataset.animate='true';label.dataset.animate='true';}
        }
        column.append(label);columns.append(column);
        const date=document.createElement('span');date.textContent=point.dateLabel;dates.append(date);
      });
      if(!points.length){columns.textContent='No logs yet.';columns.classList.add('staggered-empty');}
      this.toggleAttribute('data-pending',!this.entered&&!this.reduced());
      if(this.entered)this.replay();
    }
    replay(){
      this.settle();this.entered=true;this.removeAttribute('data-pending');if(this.reduced())return;
      this.dataset.animating='true';
      this.querySelectorAll('.staggered-column').forEach(column=>{
        const bar=column.querySelector('.staggered-bar[data-animate]'),label=column.querySelector('.staggered-value[data-animate]');if(!bar)return;
        const options={duration:500,delay:Number(column.dataset.index)*this.stagger,easing:'cubic-bezier(.22,.8,.28,1)',fill:'both'};
        this.animations.push(bar.animate([{height:'0px'},{height:bar.style.height}],options));
        this.animations.push(label.animate([{opacity:0,transform:`translateY(${parseFloat(label.style.bottom)}px)`},{opacity:1,transform:'translateY(0)'}],options));
      });
      const run=this.animations;
      Promise.all(run.map(animation=>animation.finished)).then(()=>{if(this.animations===run)this.settle();}).catch(()=>{});
    }
    disconnectedCallback(){this.settle();this.intersection?.disconnect();this.motionObserver?.disconnect();this.preference?.removeEventListener('change',this.motionChanged);}
  }
  window.TodayUI=window.TodayUI||{};TodayUI.pageChartExample=example;
  customElements.define('today-staggered-bar-chart',TodayStaggeredBarChart);
})();
