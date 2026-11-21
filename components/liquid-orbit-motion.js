/* Exact Fourier profiles from native/reference/LiquidOrbitLoader.swift.
   Eight identical beads advance one neighbor per second. No bridge paths. */
(() => {
  const profiles = {
  "orbitX": [
    383.3125,
    -59.7709304784,
    -225.060866439,
    5.5545051348,
    -6.6779212152,
    -1.7263490689,
    3.4559275566,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0
  ],
  "orbitY": [
    364.775,
    -156.0112968862,
    161.7418246178,
    -0.2758305468,
    0.9919234271,
    7.6909011393,
    2.0845426119,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0
  ],
  "tangentRadius": [
    4.2643261155,
    0.0394692854,
    -0.0046005836,
    0.1657249805,
    0.0798650006,
    -0.0117867885,
    0.0199325748,
    -0.0266501115,
    0.0545557843,
    0.0005428582,
    0.0340653565,
    0.0056299026,
    0.0211998451
  ],
  "normalRadius": [
    4.141526411,
    -0.0552365479,
    0.2099438557,
    0.1835505403,
    0.114705334,
    0.098890903,
    0.0158245645,
    -0.0238415266,
    0.0247273605,
    -0.0076828711,
    0.0035540835,
    0.0305938742,
    0.027148254
  ],
  "tilt": [
    0.3845377411,
    0.1658815198,
    0.4150606999,
    0.2062102106,
    -0.8092036111,
    0.1902159178,
    -0.2407438842,
    -0.1316217644,
    0.0833317326,
    0.0086752046,
    -0.1439234898,
    0.0208064108,
    -0.0713018738
  ],
  "sharpness": [
    0.006260185,
    -0.2667198306,
    0.1370302818,
    -0.2588094036,
    0.1209872049,
    -0.0693886145,
    0.0464174222,
    0.3192780488,
    -0.5342568104,
    -0.2371642296,
    0.1578001188,
    0.2344876898,
    0.2365120258
  ],
  "correctionX": [
    1.1575751319,
    0.9389006941,
    -3.917157383,
    -1.1744308884,
    -2.5462185873,
    0.386102142,
    0.7324845442,
    0.8916131924,
    2.4089328087,
    1.630875258,
    -1.5603599428,
    -0.9324790655,
    -1.4583650492
  ],
  "correctionY": [
    1.5616303621,
    -1.1488806131,
    -0.0402415973,
    -2.0706111229,
    0.5597335948,
    -1.3429775027,
    1.3152170562,
    -1.3908970635,
    -0.0832819828,
    -0.2633539435,
    0.236286219,
    0.7261797595,
    0.2295573639
  ]
};
  const dot=(a,b)=>a.reduce((sum,v,i)=>sum+v*b[i],0);
  function beads(time=0){
    const phase=(Number.isFinite(time)?Math.max(0,time):0)%1;
    return Array.from({length:8},(_,i)=>{
      const angle=(i+phase)*Math.PI/4,basis=[1],derivative=[0];
      for(let n=1;n<=6;n++){basis.push(Math.cos(n*angle),Math.sin(n*angle));derivative.push(-n*Math.sin(n*angle),n*Math.cos(n*angle));}
      const sample=name=>dot(basis,profiles[name]);
      return {x:sample('orbitX')+sample('correctionX'),y:sample('orbitY')+sample('correctionY'),rx:Math.exp(sample('tangentRadius')),ry:Math.exp(sample('normalRadius')),angle:Math.atan2(dot(derivative,profiles.orbitY),dot(derivative,profiles.orbitX))+sample('tilt'),sharpness:Math.exp(sample('sharpness'))};
    });
  }
  window.TodayLiquidOrbitMotion=Object.freeze({duration:1,width:740,height:700,beads});
})();
