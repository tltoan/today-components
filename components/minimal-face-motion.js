/* Geometry and authored performance from native/PlayfulFaces.swift.
   The supplied source is preserved unchanged. Disk and features render separately. */
(() => {
  const channels=["turn", "pitch", "tilt", "lift", "stretch", "shear", "lookX", "lookY", "openL", "openR", "closeL", "closeR", "joy", "eyeTilt", "browL", "browR", "browTiltL", "browTiltR", "nose", "length", "smile", "curl"];
  const keys={"loop":[[0.0,{}],[0.22,{"turn":0.14,"pitch":0.18,"closeL":0.65,"closeR":0.65,"stretch":-0.06,"browL":-5.0,"length":-6.0}],[0.68,{"turn":-0.72,"pitch":-0.4,"tilt":-0.14,"lookX":-1.0,"lookY":-0.7,"openL":0.65,"openR":0.4,"browL":20.0,"browTiltL":-6.0,"nose":-24.0,"length":8.0,"curl":0.65,"stretch":0.07,"lift":-6.0,"smile":0.3}],[1.12,{"turn":-0.58,"pitch":-0.3,"tilt":-0.09,"lookX":-0.8,"lookY":-0.5,"openL":0.45,"openR":0.3,"browL":15.0,"nose":-12.0,"curl":0.85,"smile":0.45}],[1.72,{"turn":0.58,"tilt":0.15,"lookX":0.8,"openL":0.2,"openR":0.5,"browL":9.0,"browTiltL":7.0,"nose":27.0,"length":-3.0,"curl":-0.25,"shear":8.0,"smile":0.65}],[2.2,{"turn":0.16,"tilt":-0.07,"closeL":0.95,"closeR":0.95,"joy":1.0,"browL":10.0,"nose":-13.0,"length":-7.0,"curl":0.55,"smile":1.0,"lift":-4.0,"stretch":-0.03}],[2.7,{"turn":-0.08,"tilt":0.03,"browL":3.0,"smile":0.35,"nose":6.0,"curl":0.15}],[3.35,{}],[3.8,{}]],"tilt":[[0.0,{}],[0.2,{"turn":-0.16,"tilt":-0.05,"closeL":0.7,"closeR":0.7,"stretch":-0.05,"length":-6.0}],[0.65,{"turn":0.8,"pitch":-0.28,"tilt":0.23,"lookX":1.1,"lookY":-0.5,"closeL":0.25,"openR":0.8,"eyeTilt":0.1,"nose":26.0,"length":9.0,"curl":0.6,"shear":9.0,"smile":0.45}],[1.12,{"turn":0.65,"pitch":-0.2,"tilt":0.18,"lookX":0.85,"lookY":-0.3,"closeL":0.2,"openR":0.6,"nose":13.0,"curl":0.4,"smile":0.55}],[1.64,{"turn":-0.68,"pitch":0.08,"tilt":-0.19,"lookX":-1.0,"openL":0.6,"closeR":0.5,"eyeTilt":-0.1,"nose":-28.0,"length":-7.0,"curl":-0.4,"shear":-9.0,"smile":0.7}],[2.12,{"turn":-0.12,"tilt":0.12,"openL":0.3,"closeR":0.98,"joy":0.4,"nose":16.0,"length":-5.0,"curl":0.8,"smile":1.0,"lift":-3.0}],[2.62,{"turn":0.08,"tilt":-0.04,"nose":-7.0,"curl":-0.15,"smile":0.4}],[3.35,{}],[3.8,{}]],"mellow":[[0.0,{}],[0.22,{"turn":-0.16,"pitch":0.15,"closeL":0.65,"closeR":0.65,"stretch":-0.06,"length":-5.0}],[0.68,{"turn":0.78,"pitch":-0.5,"tilt":-0.12,"lookX":1.0,"lookY":-0.7,"openL":1.0,"openR":0.7,"nose":22.0,"length":10.0,"lift":-8.0,"stretch":0.1,"smile":0.4}],[1.15,{"turn":0.64,"pitch":-0.4,"tilt":-0.08,"lookX":0.85,"lookY":-0.5,"openL":0.8,"openR":0.55,"nose":14.0,"length":5.0,"smile":0.5}],[1.65,{"turn":0.2,"tilt":0.14,"closeL":0.96,"closeR":0.92,"joy":1.0,"smile":1.0,"nose":-18.0,"length":-8.0,"stretch":-0.04,"shear":-5.0}],[2.15,{"turn":-0.38,"tilt":-0.09,"closeL":0.8,"closeR":0.8,"joy":0.75,"smile":1.0,"nose":10.0,"lift":-3.0}],[2.7,{"turn":0.12,"tilt":0.035,"smile":0.3,"nose":-5.0}],[3.35,{}],[3.8,{}]],"dash":[[0.0,{}],[0.18,{"turn":-0.2,"closeL":0.85,"closeR":0.85,"stretch":-0.06}],[0.52,{"turn":0.95,"tilt":0.12,"lookX":1.2,"openL":0.85,"openR":0.55,"nose":28.0,"length":10.0,"shear":10.0,"stretch":0.08,"smile":0.2}],[0.85,{"turn":0.8,"tilt":0.08,"lookX":1.0,"openL":0.65,"openR":0.4,"nose":12.0,"smile":0.4}],[1.27,{"turn":-0.85,"tilt":-0.14,"lookX":-1.2,"lookY":-0.3,"openL":0.25,"openR":0.8,"nose":-30.0,"shear":-12.0,"smile":0.65}],[1.65,{"turn":-0.62,"tilt":-0.08,"lookX":-0.8,"openR":0.45,"nose":-12.0,"smile":0.6}],[2.08,{"turn":0.12,"tilt":0.09,"closeL":0.98,"openR":0.45,"joy":0.35,"smile":1.0,"nose":15.0,"length":-7.0,"eyeTilt":0.1}],[2.48,{"turn":-0.06,"tilt":-0.03,"smile":0.5,"nose":-7.0}],[3.2,{}],[3.8,{}]],"drift":[[0.0,{}],[0.35,{"pitch":0.25,"lift":7.0,"closeL":0.8,"closeR":0.65,"browL":-8.0,"browR":-5.0,"length":14.0,"stretch":-0.04}],[1.0,{"turn":-0.72,"pitch":-0.7,"tilt":-0.19,"lookX":-0.8,"lookY":-1.0,"openL":0.6,"openR":0.4,"browL":13.0,"browR":5.0,"nose":-28.0,"length":4.0,"lift":-4.0,"shear":-7.0}],[1.45,{"turn":-0.65,"pitch":-0.6,"tilt":-0.16,"lookX":-0.6,"lookY":-0.9,"openL":0.4,"openR":0.3,"browL":9.0,"browR":3.0,"nose":-18.0}],[2.15,{"turn":0.62,"pitch":-0.15,"tilt":0.16,"lookX":0.9,"lookY":-0.4,"closeL":0.3,"openR":0.65,"browL":-3.0,"browR":19.0,"browTiltR":-6.0,"nose":24.0,"length":-8.0,"shear":8.0}],[2.65,{"turn":0.3,"tilt":0.06,"closeL":0.95,"closeR":0.95,"browR":5.0,"nose":-7.0,"length":7.0}],[3.5,{}],[3.8,{}]],"skeptic":[[0.0,{}],[0.2,{"turn":-0.18,"closeL":0.65,"closeR":0.65,"browL":-4.0,"browR":-4.0,"length":-5.0}],[0.66,{"turn":0.8,"pitch":0.16,"tilt":0.13,"lookX":1.15,"closeL":0.5,"openR":0.7,"browL":-9.0,"browR":27.0,"browTiltL":8.0,"browTiltR":-9.0,"nose":23.0,"length":-7.0,"eyeTilt":0.13}],[1.2,{"turn":0.7,"pitch":0.12,"tilt":0.1,"lookX":1.0,"closeL":0.4,"openR":0.55,"browL":-7.0,"browR":22.0,"browTiltL":6.0,"browTiltR":-7.0,"nose":13.0,"eyeTilt":0.1}],[1.8,{"turn":-0.55,"pitch":-0.5,"tilt":-0.14,"lookX":-0.8,"lookY":-1.1,"openL":0.7,"closeR":0.3,"browL":22.0,"browR":-9.0,"browTiltL":8.0,"browTiltR":7.0,"nose":-24.0,"length":10.0}],[2.25,{"turn":-0.42,"tilt":-0.09,"lookX":-0.6,"openL":0.45,"closeR":0.25,"browL":13.0,"browR":-5.0,"nose":-12.0}],[2.65,{"turn":0.1,"closeL":0.98,"closeR":0.98,"nose":8.0,"length":-5.0}],[3.35,{}],[3.8,{}]],"lift":[[0.0,{}],[0.2,{"pitch":0.22,"closeL":0.85,"closeR":0.85,"browL":-9.0,"browR":-9.0,"lift":9.0,"stretch":-0.09,"length":-7.0}],[0.58,{"pitch":-0.35,"tilt":-0.08,"openL":0.8,"openR":0.85,"browL":21.0,"browR":24.0,"lift":-14.0,"stretch":0.12,"nose":-9.0,"length":9.0,"lookY":-0.6}],[1.06,{"turn":-0.35,"tilt":-0.14,"closeL":0.96,"closeR":0.96,"joy":1.0,"browL":11.0,"browR":15.0,"lift":-6.0,"nose":-21.0,"length":-5.0,"stretch":-0.03}],[1.6,{"turn":0.45,"tilt":0.16,"closeL":0.9,"closeR":0.9,"joy":1.0,"browL":18.0,"browR":10.0,"lift":-11.0,"nose":22.0,"stretch":0.06}],[2.15,{"turn":0.1,"tilt":-0.06,"closeL":0.95,"openR":0.3,"joy":0.35,"browL":1.0,"browR":13.0,"nose":-10.0,"lift":2.0}],[2.65,{"turn":-0.05,"tilt":0.02,"browR":3.0,"nose":4.0}],[3.35,{}],[3.8,{}]]};
  const styles=Object.freeze(Object.keys(keys));
  const label=style=>style[0].toUpperCase()+style.slice(1);
  const smooth=value=>{const u=Math.min(1,Math.max(0,value));return u*u*u*(10+u*(-15+6*u));};
  const empty=()=>Object.fromEntries(channels.map(c=>[c,0]));
  const mix=(a,b,w)=>Object.fromEntries(channels.map(c=>[c,(a[c]||0)+((b[c]||0)-(a[c]||0))*w]));
  function sample(frames,t){
    if(t<=frames[0][0])return {...empty(),...frames[0][1]};
    const i=frames.findIndex((a,i)=>frames[i+1]&&t<frames[i+1][0]);
    if(i<0)return {...empty(),...frames.at(-1)[1]};
    const a=frames[i],b=frames[i+1];return mix(a[1],b[1],smooth((t-a[0])/(b[0]-a[0])));
  }
  function perform(frames,t){
    if(t<0||t>3.8)return empty();
    const result=sample(frames,t),eyes=sample(frames,t+.055),head=sample(frames,t-.045),nose=sample(frames,t-.105);
    for(const c of ['lookX','lookY','openL','openR'])result[c]=eyes[c];
    for(const c of ['turn','pitch','tilt','shear'])result[c]=head[c];
    for(const c of ['nose','length','curl'])result[c]=nose[c];
    return result;
  }
  const pulse=(time,start,duration)=>{const u=(time-start)/duration;return u>0&&u<1?Math.sin(Math.PI*u)**2:0;};
  function pose(style='tilt',time=0,reactionAge=null){
    if(!styles.includes(style))style='tilt';
    const t=Number.isFinite(time)?Math.max(0,time):0,phase=t%10,sign=['dash','skeptic','tilt'].includes(style)?-1:1;
    let result=perform(keys[style],phase-.6);
    const glance=[[0,{}],[.6,{turn:sign*.48,lookX:sign*.9,tilt:sign*.05,nose:sign*10,openL:.15,browR:5}],
      [1.2,{turn:sign*.44,lookX:sign*.8,tilt:sign*.04,nose:sign*5,browR:3}],
      [1.7,{turn:sign*.22,pitch:.3,lookX:sign*.3,lookY:.65,length:6}],[2.35,{}],[3.8,{}]];
    if(phase>=6)result=perform(glance,phase-6);
    const blink=Math.max(pulse(phase,5,.22),pulse(phase,8.9,.2));
    result.closeL=Math.max(result.closeL,blink);result.closeR=Math.max(result.closeR,blink);
    if(Number.isFinite(reactionAge)&&reactionAge>=0&&reactionAge<=3.8){
      const w=smooth(reactionAge/.18)*(1-smooth((reactionAge-3.25)/.55));
      result=mix(result,perform(keys[style],reactionAge),w);
    }
    return result;
  }
  function draw(canvas,{face='tilt',time=0,reactionAge=null,ink='#16131c',colors=['#eeeaf3'],cropped=false,featuresOnly=false}={}){
    const c=canvas.getContext('2d');if(!c||!canvas.width||!canvas.height)return;
    if(!styles.includes(face))face='tilt';
    const side=Math.min(canvas.width,canvas.height),scale=side/(cropped?396:512),p=pose(face,time,reactionAge);
    c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,canvas.width,canvas.height);c.save();
    c.translate((canvas.width-side)/2,(canvas.height-side)/2);c.scale(scale,scale);if(cropped)c.translate(-58,-58);
    // Paint the circle before applying any feature transforms. Its geometry never moves.
    if(!featuresOnly){
      const disk=()=>{c.beginPath();c.arc(256,256,198,0,Math.PI*2);};
      c.save();if(!cropped){c.shadowColor='rgba(0,0,0,.075)';c.shadowBlur=18*scale;c.shadowOffsetY=13*scale;}
      const fill=c.createLinearGradient(90,65,390,450);colors.forEach((color,i)=>fill.addColorStop(colors.length===1?0:i/(colors.length-1),color));c.fillStyle=fill;disk();c.fill();c.restore();
      const shade=c.createLinearGradient(180,160,315,450);shade.addColorStop(0,'#00000000');shade.addColorStop(1,'rgba(0,0,0,.018)');c.fillStyle=shade;disk();c.fill();
    }
    c.translate(256,256+p.lift);c.rotate(p.tilt);c.scale(1-p.stretch*.35,1+p.stretch);c.translate(-256,-256);
    const point=(x,y,depth=52)=>[256+(x-256)*Math.cos(p.turn*.60)+depth*Math.sin(p.turn*.60)+p.shear*(y-232)/100,
      256+(y-256)*Math.cos(p.pitch*.35)+depth*Math.sin(p.pitch*.35)];
    const nosePoint=(x,y,depth=85)=>{const u=Math.min(1,Math.max(0,(y-220)/105));return point(x+p.nose*Math.sin(u*Math.PI/2),y+p.length*u,depth);};
    const move=(...a)=>c.moveTo(...point(...a));
    const curve=(a,b,end)=>c.bezierCurveTo(...point(...a),...point(...b),...point(...end));
    const nm=(...a)=>c.moveTo(...nosePoint(...a));
    const nc=(a,b,end)=>c.bezierCurveTo(...nosePoint(...a),...nosePoint(...b),...nosePoint(...end));
    const nq=(control,end)=>c.quadraticCurveTo(...nosePoint(...control),...nosePoint(...end));
    const stroke=(width=17)=>{c.strokeStyle=ink;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.stroke();};
    function brow(x1,y1,cx,cy,x2,y2,right=false,width=13){
      const rise=p[right?'browR':'browL'],tilt=p[right?'browTiltR':'browTiltL'];c.beginPath();move(x1,y1-rise-tilt,44);
      c.quadraticCurveTo(...point(cx,cy-rise-Math.abs(rise)*.2,44),...point(x2,y2-rise+tilt,44));stroke(width);
    }
    function eye(x,y,width,height,angle=0,lid=false,right=false){
      const opening=p[right?'openR':'openL'],closing=Math.min(1,Math.max(0,p[right?'closeR':'closeL']));
      const w=width*(1-opening*.12+closing*.1),h=Math.max(7,(height+opening*30)*(1-closing*.94));
      const center=point(x,y-opening*4,64),bend=-20*p.joy;c.save();
      c.translate(center[0]+p.lookX*11,center[1]+p.lookY*8);c.rotate(angle+p.eyeTilt*(right?-1:1));c.beginPath();
      if(lid){
        c.moveTo(-w/2,-h*.2);c.bezierCurveTo(-w/2,-h*.2-opening*h*.5+bend,w/2,-h*.2-opening*h*.5+bend,w/2,-h*.2);
        c.bezierCurveTo(w/2,h*.82+bend,-w/2,h*.82+bend,-w/2,-h*.2);
      }else{
        c.moveTo(-w/2,0);c.bezierCurveTo(-w/2,-h*.7+bend,w/2,-h*.7+bend,w/2,0);
        c.bezierCurveTo(w/2,h*.7+bend,-w/2,h*.7+bend,-w/2,0);
      }
      c.closePath();c.fillStyle=ink;c.fill();c.restore();
    }
    const s=p.smile,curl=p.curl;
    switch(face){
      case 'loop':
        c.beginPath();move(176,186-p.browL-p.browTiltL,45);
        curve([189,177-p.browL-Math.abs(p.browL)*.2,45],[204,177-p.browL-Math.abs(p.browL)*.2,45],[215,184-p.browL+p.browTiltL,45]);stroke(14);
        eye(195,231,28,39,-.05);eye(316,225,28,39,.05,false,true);
        c.beginPath();nm(260,209,72);nc([263,235,78],[246,250,86],[246,270,90]);
        nc([243-12*curl,290+14*curl,92],[266+16*curl,297+6*curl,92],[278-18*curl,280-14*curl,90]);stroke();
        c.beginPath();move(226-s*7,332-s*8,60);curve([244,350+s*9,64],[273,350+s*9,64],[290+s*5,328-s*7,60]);stroke(14);break;
      case 'tilt':
        eye(191,211,34,47,-.14);eye(319,239,37,34,.06,false,true);
        c.beginPath();nm(266,209,72);nc([257,233,79],[248,257,86],[239,281,92]);nq([235,292,94],[246,293,92]);
        nc([256,293+7*curl,91],[267,293+3*curl,89],[277+8*curl,293-12*curl,88]);stroke(18);
        c.beginPath();move(273-s*12,339,60);curve([288,342+s*11,62],[306+s*3,333+s*4,62],[311+s*4,316-s*9,60]);stroke(15);break;
      case 'mellow':
        eye(192,219,43,34,-.09,true);eye(319,227,39,29,.08,true,true);
        c.beginPath();nm(258,232,75);nc([280,255,86],[282,278,94],[259,283,91]);stroke();
        c.beginPath();move(228-s*7,331-s*6,60);curve([244,341+s*8,63],[266,341+s*8,63],[280+s*7,329-s*7,60]);stroke(13);break;
      case 'dash':
        eye(195,223,45,21,-.12);eye(321,212,40,20,.14,false,true);
        c.beginPath();nm(270,239,74);nc([265,254,80],[260,270,87],[255,285,91]);stroke();
        c.beginPath();move(237-s*4,333,60);curve([257,341+s*11,63],[282,334+s*5,63],[294+s*4,321-s*8,60]);stroke(14);break;
      case 'drift':
        brow(166,196,192,198,217,196,false,12);brow(294,200,319,202,344,201,true,12);
        eye(191,233,45,21,.04,true);eye(319,239,44,20,-.03,true,true);
        c.beginPath();nm(258,225,72);nc([257,258,80],[244,289,91],[249,312,93]);nq([251,323,94],[269,318,91]);stroke();break;
      case 'skeptic':
        brow(164,207,191,215,218,211);brow(293,184,320,167,346,183,true);
        eye(191,243,40,23,.14,true);eye(320,231,35,31,-.10,true,true);
        c.beginPath();nm(267,224,74);nc([260,243,80],[252,263,86],[245,282,92]);nq([260,291,94],[274,283,91]);stroke();break;
      case 'lift':
        brow(163,191,190,164,218,187);brow(294,187,321,162,347,186,true);
        eye(191,232,33,39);eye(321,229,34,39,0,false,true);
        c.beginPath();nm(255,241,75);nq([277,271,90],[270,285,91]);nq([264,294,94],[250,289,91]);stroke(16);break;
    }
    c.restore();
  }
  window.TodayFaceMotion=Object.freeze({styles,label,pose,draw,duration:3.8,loopDuration:10});
})();
