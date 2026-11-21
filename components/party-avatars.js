/* Shared browser/SwiftUI avatar contract. Stable FNV-1a over UTF-8 member ID.
   A party contains at most four people. Host owns membership and button actions. */
(() => {
  const palettes=[['#5468a6','#765b91','#b57771'],['#8d617d','#635b93','#435e89'],['#426d78','#52658f','#8072a5'],['#966b57','#8c607e','#565e96'],['#686098','#426e89','#618879'],['#8a657f','#6574a8','#446774']];
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function paletteIndex(id){let hash=2166136261;for(const byte of new TextEncoder().encode(String(id))){hash=Math.imul(hash^byte,16777619)>>>0;}return hash%palettes.length;}
  const mounted=new Set();let resolveIdentity=m=>m;
  function normalized(m={}){m=resolveIdentity(m);return {...m,id:String(m.id||m.name||'member'),name:m.name||'Member',initials:m.initials||String(m.name||'?').trim().split(/\s+/).map(x=>[...x][0]).slice(0,2).join('')};}
  function portrait(raw,size=36,animated=false){const m=normalized(raw),all=window.TodayFacePalettes?.colors||palettes,i=Number.isInteger(m.gradientIndex)?Math.min(all.length-1,Math.max(0,m.gradientIndex)):paletteIndex(m.id),colors=all[i],photo=typeof m.photoURL==='string'&&/^(https?:\/\/|blob:|data:image\/)/i.test(m.photoURL)?m.photoURL:null,face=window.TodayFaceMotion?.styles.includes(m.faceStyle)?m.faceStyle:null;
    return `<span class="pa-portrait ${face?'pa-face-portrait':''}" data-gradient="${i}" ${face?`data-face="${face}"`:''} style="--pa-size:${size}px;--pa-a:${colors[0]};--pa-b:${colors[1]};--pa-c:${colors[2]}">${face?`<today-minimal-face face="${face}" palette="${i}" passive ${animated?'':'still'} cropped aria-hidden="true"></today-minimal-face>`:`<span class="pa-initials">${esc(m.initials)}</span>`}${photo?`<img alt="" src="${esc(photo)}" decoding="async">`:''}</span>`;
  }
  class AvatarBase extends HTMLElement{
    static observedAttributes=['members','person','size','lead-id','still'];
    connectedCallback(){mounted.add(this);this.render();}
    disconnectedCallback(){mounted.delete(this);}
    attributeChangedCallback(){if(this.isConnected)this.render();}
    set members(value){this._members=Array.isArray(value)?structuredClone(value).slice(0,4):[];if(this.isConnected)this.render();}
    get members(){if(this._members)return structuredClone(this._members);try{return JSON.parse(this.getAttribute('members')||'[]').slice(0,4);}catch{return [];}}
    set person(value){this._person=structuredClone(value);if(this.isConnected)this.render();}
    get person(){if(this._person)return structuredClone(this._person);try{return JSON.parse(this.getAttribute('person')||'{}');}catch{return {};}}
    get size(){return Math.min(96,Math.max(24,Number(this.getAttribute('size'))||36));}
    paint(html,label){this.innerHTML=html;this.setAttribute('role','img');this.setAttribute('aria-label',label);this.querySelectorAll('img').forEach(img=>{const face=img.parentElement.querySelector('today-minimal-face'),wasStill=face?.hasAttribute('still');const show=()=>{const ready=img.complete&&img.naturalWidth>0;img.classList.toggle('pa-photo-ready',ready);if(face)face.toggleAttribute('still',ready||wasStill);};img.addEventListener('load',show);img.addEventListener('error',()=>{img.remove();if(face)face.toggleAttribute('still',wasStill);});show();});}
  }
  class Profile extends AvatarBase{render(){this.paint(portrait(this.person,this.size,!this.hasAttribute('still')),normalized(this.person).name);}}
  class Stack extends AvatarBase{render(){const ms=this.members;this.paint(`<span class="pa-stack">${ms.map(m=>portrait(m,this.size)).join('')}</span>`,ms.length?ms.map(m=>normalized(m).name).join(', '):'No members');}}
  class Lead extends AvatarBase{render(){const ms=this.members,m=ms.find(x=>x.id===this.getAttribute('lead-id'))||ms.find(x=>!x.self)||ms[0];this.paint(m?`<span class="pa-lead" style="--pa-size:${this.size}px">${portrait(m,this.size)}${ms.length>1?`<span class="pa-count">+${ms.length-1}</span>`:''}</span>`:'',ms.length?ms.map(m=>normalized(m).name).join(', '):'No members');}}
  window.TodayPartyAvatars=Object.freeze({maxMembers:4,paletteIndex,palettes, setIdentityResolver(fn){resolveIdentity=typeof fn==='function'?fn:m=>m;mounted.forEach(a=>a.render());}, refresh(){mounted.forEach(a=>a.render());}});
  for(const [tag,cls] of [['profile-avatar',Profile],['avatar-stack',Stack],['lead-avatar',Lead]])if(!customElements.get('today-'+tag))customElements.define('today-'+tag,cls);
})();
