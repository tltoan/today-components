/* Direct port of the supplied CoilSphereMotion. No dependencies or DOM access.
 * The 4.84 s loop uses the original 28 poses, cubic tracks and quintic end caps.
 */
(() => {
  const keys = [
  [
    0.0,
    0.0,
    0.0,
    0.0,
    0.65938467,
    0.75180573
  ],
  [
    0.12,
    0.02760655,
    0.01119173,
    0.03642478,
    0.65964645,
    0.75060945
  ],
  [
    0.24,
    0.16015656,
    0.02857042,
    0.08158286,
    0.66505836,
    0.74177177
  ],
  [
    0.4,
    0.61419629,
    0.08607167,
    0.08858537,
    0.65067515,
    0.74924372
  ],
  [
    0.56,
    1.53925241,
    0.14382352,
    0.10208944,
    0.60096994,
    0.7795689
  ],
  [
    0.72,
    3.16842805,
    0.20033416,
    0.08056937,
    0.52095081,
    0.82582387
  ],
  [
    0.88,
    6.10380888,
    0.25075745,
    0.02389045,
    0.41544319,
    0.87404628
  ],
  [
    1.04,
    9.50971087,
    0.25787806,
    -0.04288646,
    0.29921377,
    0.91767684
  ],
  [
    1.2,
    11.76249884,
    0.21691069,
    -0.09670605,
    0.18888552,
    0.95284834
  ],
  [
    1.4,
    13.22288535,
    0.11662464,
    -0.0782857,
    0.07772329,
    0.98703046
  ],
  [
    1.6,
    13.85801208,
    -0.02322117,
    -0.06156833,
    -0.00937058,
    0.99778871
  ],
  [
    1.8,
    14.01890663,
    -0.18632914,
    0.01211328,
    -0.08189643,
    0.9789932
  ],
  [
    2.0,
    13.87117164,
    -0.35731859,
    0.0728537,
    -0.13628451,
    0.92110927
  ],
  [
    2.2,
    13.44636406,
    -0.51885609,
    0.17381938,
    -0.18815088,
    0.81558227
  ],
  [
    2.4,
    12.7868738,
    -0.67161343,
    0.19867187,
    -0.197335,
    0.68594737
  ],
  [
    2.6,
    11.87319855,
    -0.79627275,
    0.21043167,
    -0.2216488,
    0.52205367
  ],
  [
    2.8,
    10.73916777,
    -0.8927417,
    0.18672075,
    -0.21921042,
    0.34654641
  ],
  [
    3.0,
    9.41106045,
    -0.95504262,
    0.12101171,
    -0.20463188,
    0.17713145
  ],
  [
    3.2,
    7.92796254,
    -0.98204571,
    0.02991688,
    -0.18368354,
    0.03084738
  ],
  [
    3.4,
    6.38018772,
    -0.97472701,
    -0.08885855,
    -0.18705518,
    -0.08379605
  ],
  [
    3.6,
    4.87085664,
    -0.94494241,
    -0.22085521,
    -0.18100603,
    -0.15982379
  ],
  [
    3.8,
    3.49203879,
    -0.90058673,
    -0.35244265,
    -0.16571878,
    -0.19304145
  ],
  [
    4.0,
    2.29159921,
    -0.84927552,
    -0.47136596,
    -0.14533614,
    -0.18820902
  ],
  [
    4.2,
    1.3063518,
    -0.80007625,
    -0.56639289,
    -0.1255256,
    -0.15271023
  ],
  [
    4.4,
    0.57311047,
    -0.76424507,
    -0.63104181,
    -0.09103811,
    -0.09709668
  ],
  [
    4.6,
    0.12868913,
    -0.74433651,
    -0.66172247,
    -0.07933563,
    -0.04233661
  ],
  [
    4.72,
    0.025,
    -0.74453881,
    -0.66591503,
    -0.04241329,
    -0.02049996
  ],
  [
    4.84,
    0.0,
    -0.75180573,
    -0.65938467,
    0.0,
    0.0
  ]
];
  const duration = 4.84;
  class Track {
    constructor(component) {
      this.times=keys.map(k=>k[0]); this.values=keys.map(k=>k[component+1]);
      const t=this.times,v=this.values,n=t.length;
      const h=t.slice(1).map((x,i)=>x-t[i]),delta=h.map((x,i)=>(v[i+1]-v[i])/x);
      const lower=Array(n).fill(0),diagonal=[...lower],upper=[...lower],rhs=[...lower];
      diagonal[0]=2*h[0];upper[0]=h[0];rhs[0]=6*delta[0];
      for(let i=1;i<n-1;i++){lower[i]=h[i-1];diagonal[i]=2*(h[i-1]+h[i]);upper[i]=h[i];rhs[i]=6*(delta[i]-delta[i-1]);}
      lower[n-1]=h[n-2];diagonal[n-1]=2*h[n-2];rhs[n-1]=-6*delta[n-2];
      for(let i=1;i<n;i++){const f=lower[i]/diagonal[i-1];diagonal[i]-=f*upper[i-1];rhs[i]-=f*rhs[i-1];}
      const second=[...rhs];second[n-1]/=diagonal[n-1];
      for(let i=n-2;i>=0;i--)second[i]=(rhs[i]-upper[i]*second[i+1])/diagonal[i];
      this.second=second;
    }
    sample(time) {
      const t=this.times,v=this.values,s=this.second;
      let i=t.findIndex((_,j)=>j<t.length-1&&time<t[j+1]);if(i<0)i=t.length-2;
      const h=t[i+1]-t[i],u=time-t[i],b=(v[i+1]-v[i])/h-h*(2*s[i]+s[i+1])/6,c=s[i]/2,d=(s[i+1]-s[i])/(6*h);
      return {value:v[i]+u*(b+u*(c+u*d)),velocity:b+u*(2*c+3*u*d),acceleration:2*c+6*u*d};
    }
    cap(start,target,u,direction) {
      const change=target.value-start,velocity=target.velocity*.12*direction,acceleration=target.acceleration*.12*.12;
      const a=10*change-4*velocity+.5*acceleration,b=-15*change+7*velocity-acceleration,c=6*change-3*velocity+.5*acceleration;
      return start+u*u*u*(a+u*(b+u*c));
    }
    value(time) {
      if(time<=0)return this.values[0];if(time>=duration)return this.values.at(-1);
      if(time<.12)return this.cap(this.values[0],this.sample(.12),time/.12,1);
      if(time>duration-.12)return this.cap(this.values.at(-1),this.sample(duration-.12),(duration-time)/.12,-1);
      return this.sample(time).value;
    }
  }
  const tracks=Array.from({length:5},(_,i)=>new Track(i));
  const circle=Array.from({length:1201},(_,i)=>({x:Math.sin(i/1200*2*Math.PI),y:Math.cos(i/1200*2*Math.PI)}));
  function vertices(seconds) {
    const t=Number.isFinite(seconds)?Math.max(0,seconds)%duration:0;
    const winding=Math.max(0,tracks[0].value(t));
    let [x,y,z,w]=tracks.slice(1).map(track=>track.value(t));
    const length=Math.hypot(x,y,z,w);x/=length;y/=length;z/=length;w/=length;
    const m00=1-2*(y*y+z*z),m01=2*(x*y-z*w),m02=2*(x*z+y*w);
    const m10=2*(x*y+z*w),m11=1-2*(x*x+z*z),m12=2*(y*z-x*w);
    const m20=2*(x*z-y*w),m21=2*(y*z+x*w),m22=1-2*(x*x+y*y);
    return circle.map(p=>{
      const angle=winding*(p.y-4/3),a=p.x*Math.cos(angle),b=p.y,c=p.x*Math.sin(angle);
      const depth=m20*a+m21*b+m22*c,perspective=1/(1-.2*depth);
      return {x:(m00*a+m01*b+m02*c)*perspective,y:(m10*a+m11*b+m12*c)*perspective,z:depth};
    });
  }
  globalThis.TodayLoaderMotion={vertices,duration};
})();
