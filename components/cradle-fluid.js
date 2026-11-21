(() => {
  const outline='M32 1 H101 C125 1 130 1 145 21 C154 37 159 43 176 43 C193 43 198 37 207 21 C222 1 227 1 251 1 H320 Q351 1 351 32 V39 Q351 70 320 70 H32 Q1 70 1 39 V32 Q1 1 32 1Z';
  const shoulders=[
    [[101,1],[125,1],[130,1],[145,21]],
    [[145,21],[154,37],[159,43],[176,43]],
    [[176,43],[193,43],[198,37],[207,21]],
    [[207,21],[222,1],[227,1],[251,1]]
  ];
  const lerp=(a,b,t)=>a+(b-a)*t;
  const cubic=(a,b,c,d,t)=>a*(1-t)**3+3*b*(1-t)**2*t+3*c*(1-t)*t*t+d*t**3;
  function boundary(x){
    if(x<32)return 32-Math.sqrt(Math.max(0,31**2-(x-32)**2));
    if(x>320)return 32-Math.sqrt(Math.max(0,31**2-(x-320)**2));
    const curve=shoulders.find(points=>x>=points[0][0]&&x<=points[3][0]);
    if(!curve)return 1;
    let low=0,high=1;
    for(let i=0;i<15;i++){const t=(low+high)/2;if(cubic(...curve.map(p=>p[0]),t)<x)low=t;else high=t;}
    return cubic(...curve.map(p=>p[1]),(low+high)/2);
  }
  function geometry(progress,home,habits){
    const t=Math.max(0,Math.min(1,progress));
    const center=lerp(home.x+home.width/2,habits.x+habits.width/2,t);
    // Material spreads sideways as the available height narrows beneath the
    // scoop. The boundary deforms the whole contour, including its intact rim.
    const width=lerp(home.width,habits.width,t)+68*Math.sin(Math.PI*t)**2;
    const inset=6,top=1+inset,bottom=70-inset,radius=(bottom-top)/2,cy=(top+bottom)/2;
    const left=center-width/2,right=center+width/2;
    const points=[];
    const point=(x,y)=>{
      // The same inset governs the flat top, the divot and the bottom edge.
      const ceiling=boundary(x)+inset;
      points.push([x,ceiling+(y-top)*(bottom-ceiling)/(bottom-top)]);
    };
    const arc=(cx,from,to,count)=>{for(let i=0;i<count;i++){const a=lerp(from,to,i/count);point(cx+radius*Math.cos(a),cy+radius*Math.sin(a));}};
    arc(left+radius,Math.PI,Math.PI*1.5,10);
    for(let i=0;i<24;i++)point(lerp(left+radius,right-radius,i/24),top);
    arc(right-radius,Math.PI*1.5,Math.PI*2.5,20);
    for(let i=0;i<24;i++)point(lerp(right-radius,left+radius,i/24),bottom);
    arc(left+radius,Math.PI*.5,Math.PI,10);
    const f=n=>Number(n.toFixed(3));
    let d=`M${f(points[0][0])} ${f(points[0][1])}`;
    const curves=[];
    for(let i=0;i<points.length;i++){
      const p0=points[(i+points.length-1)%points.length],p1=points[i],p2=points[(i+1)%points.length],p3=points[(i+2)%points.length];
      const c1=[p1[0]+(p2[0]-p0[0])/6,p1[1]+(p2[1]-p0[1])/6];
      const c2=[p2[0]-(p3[0]-p1[0])/6,p2[1]-(p3[1]-p1[1])/6];
      curves.push([p1,c1,c2,p2]);
      d+=`C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`;
    }
    return {d:d+'Z',curves,width};
  }
  function ease(x){
    let low=0,high=1;
    for(let i=0;i<14;i++){const t=(low+high)/2;if(cubic(0,.37,.18,1,t)<x)low=t;else high=t;}
    return cubic(0,0,1,1,(low+high)/2);
  }
  window.TodayUI=Object.assign(window.TodayUI||{},{CradleFluid:{outline,boundary,geometry,ease}});
})();
