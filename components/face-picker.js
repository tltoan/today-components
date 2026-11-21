/* Reusable portrait choice. Host owns draft restoration and persistence.
   A photo selection contains a File, not an upload or a durable URL. */
(() => {
  const {names,colors}=TodayFacePalettes, last=names.length-1;
  const clean=v=>Math.min(last,Math.max(0,Math.round(Number(v)||0)));
  const reduced=()=>document.documentElement.hasAttribute('data-reduced')||(!document.documentElement.hasAttribute('data-motion-override')&&matchMedia('(prefers-reduced-motion: reduce)').matches);
  const face=(i,extra='',style='tilt')=>`<today-minimal-face face="${style}" palette="${i}" ${extra}></today-minimal-face>`;
  class FacePicker extends HTMLElement {
    static observedAttributes=['variant','value','face-style','display-name'];
    get variant(){return ['portrait','grid','carousel'].includes(this.getAttribute('variant'))?this.getAttribute('variant'):'portrait';}
    get value(){return clean(this.getAttribute('value'));}
    set value(v){this.setAttribute('value',clean(v));}
    get faceStyle(){return TodayFaceMotion.styles.includes(this.getAttribute('face-style'))?this.getAttribute('face-style'):'tilt';}
    set faceStyle(v){this.setAttribute('face-style',TodayFaceMotion.styles.includes(v)?v:'tilt');}
    get selection(){return {kind:this.hasPhoto?'photo':'avatar',faceStyle:this.faceStyle,gradientIndex:this.value,...(this._photoFile?{file:this._photoFile}:this._savedPhotoURL?{photoURL:this._savedPhotoURL}:{})};}
    get hasPhoto(){return !!(this._photoFile||this._savedPhotoURL);}
    set selection(value){this.clearPhoto();this.faceStyle=value?.faceStyle;this.value=value?.gradientIndex;if(value?.kind==='photo'){if(value.file){this._photoFile=value.file;this._photoURL=URL.createObjectURL(value.file);}else if(/^(https?:\/\/|data:image\/)/i.test(value.photoURL||''))this._savedPhotoURL=value.photoURL;}if(this.isConnected)this.sync();}
    connectedCallback(){if(this._photoFile&&!this._photoURL)this._photoURL=URL.createObjectURL(this._photoFile);this.render();}
    disconnectedCallback(){this._portraitAnimations?.forEach(a=>a.cancel());this._resize?.disconnect();clearTimeout(this._scrollTimer);cancelAnimationFrame(this._scrollFrame);this._photoRequest=(this._photoRequest||0)+1;if(this._photoURL)URL.revokeObjectURL(this._photoURL);this._photoURL=null;}
    attributeChangedCallback(name){if(this.isConnected){if(name==='variant'||name==='display-name')this.render();else{this.sync();if(!this._choosing)this.center(false);}}}
    render(){
      this._resize?.disconnect();clearTimeout(this._scrollTimer);
      const v=this.variant;
      this.innerHTML=`${v==='portrait'?`<div class="fp-portrait"><div class="fp-portrait-stage"><button type="button" class="fp-portrait-arrow" data-prev aria-label="Previous face">‹</button><div class="fp-portrait-image"><span class="fp-disc" aria-hidden="true"></span>${face(this.value,'class="fp-hero" cropped features-only',this.faceStyle)}<img class="fp-photo-preview" alt="Your selected profile photo" hidden></div><button type="button" class="fp-portrait-arrow" data-next aria-label="Next face">›</button></div></div>`:''}${v==='grid'?`<div class="fp-identity">${face(this.value,'class="fp-identity-face" passive cropped')}<div><strong></strong><span class="fp-color-name"></span></div></div>`:''}<div class="fp-options fp-${v}-options" role="radiogroup" aria-label="Profile picture color">${names.map((name,i)=>`<button type="button" class="fp-option" role="radio" data-value="${i}" aria-label="${name} gradient">${v==='portrait'?`<span class="fp-swatch" style="background:linear-gradient(145deg,${colors[i].join(',')})"></span>`:`${face(i,'passive still cropped')}<span class="fp-option-name">${name}</span>`}</button>`).join('')}</div>${v==='carousel'?'<div class="fp-carousel-controls"><button type="button" data-prev aria-label="Previous profile picture">‹</button><span class="fp-color-name" aria-live="polite"></span><button type="button" data-next aria-label="Next profile picture">›</button></div>':''}${v==='portrait'?'<div class="fp-photo-actions"><button type="button" data-photo><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="6" width="18" height="14" rx="4"/><path d="m8 6 1.5-3h5L16 6"/><circle cx="12" cy="13" r="3.5"/></svg><span>Upload a photo</span></button><button type="button" data-use-avatar hidden>Use avatar</button><input type="file" accept="image/*" data-photo-file hidden><p class="fp-photo-error" role="status" hidden></p></div>':''}`;
      const name=this.querySelector('.fp-identity strong');if(name)name.textContent=this.getAttribute('display-name')||'You';
      this._options=[...this.querySelectorAll('.fp-option')];this._rail=this.querySelector('.fp-options');
      this._options.forEach(b=>b.addEventListener('click',()=>this.choose(Number(b.dataset.value),'tap')));
      this._rail.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(e.key))return;e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?last:(this.value+(['ArrowLeft','ArrowUp'].includes(e.key)?last:1))%names.length;this.choose(next,'keyboard');this._options[next].focus({preventScroll:true});});
      if(v==='portrait'){
        this.querySelector('[data-prev]').onclick=()=>this.chooseFace(-1,'face-button');this.querySelector('[data-next]').onclick=()=>this.chooseFace(1,'face-button');
      }
      if(v==='carousel'){
        this.querySelector('[data-prev]').onclick=()=>this.choose(this.value-1,'button');this.querySelector('[data-next]').onclick=()=>this.choose(this.value+1,'button');
        }
      if(v==='carousel'){
        this._rail.addEventListener('scroll',()=>{cancelAnimationFrame(this._scrollFrame);this._scrollFrame=requestAnimationFrame(()=>this.measure());clearTimeout(this._scrollTimer);this._scrollTimer=setTimeout(()=>this.choose(this.nearest(),'scroll'),120);},{passive:true});
        this._resize=new ResizeObserver(()=>{this.center(false);this.measure();});this._resize.observe(this._rail);
      }
      if(v==='portrait'){
        const stage=this.querySelector('.fp-portrait-stage');
        stage.addEventListener('pointerdown',e=>{this._swipe={x:e.clientX,y:e.clientY};});
        stage.addEventListener('pointerup',e=>{if(!this._swipe)return;const dx=e.clientX-this._swipe.x,dy=e.clientY-this._swipe.y;this._swipe=null;if(Math.abs(dx)>32&&Math.abs(dx)>Math.abs(dy)){this.chooseFace(dx<0?1:-1,'face-swipe');}});
        stage.addEventListener('pointercancel',()=>this._swipe=null);
        const input=this.querySelector('[data-photo-file]');this.querySelector('[data-photo]').onclick=()=>input.click();
        input.onchange=()=>{if(input.files[0])this.loadPhoto(input.files[0]);input.value='';};
        this.querySelector('[data-use-avatar]').onclick=()=>{this.clearPhoto();this.sync();this.emit('remove-photo');};
      }
      this.sync();this.center(false);
    }
    async loadPhoto(file){
      const request=this._photoRequest=(this._photoRequest||0)+1;
      const error=this.querySelector('.fp-photo-error');error.hidden=true;
      if(!file.type.startsWith('image/')||file.size>10*1024*1024){error.textContent='Choose an image smaller than 10 MB.';error.hidden=false;return;}
      const url=URL.createObjectURL(file),image=new Image();image.src=url;
      try { await image.decode();if(!this.isConnected||request!==this._photoRequest){URL.revokeObjectURL(url);return;}
        if(this._photoURL)URL.revokeObjectURL(this._photoURL);this._photoURL=url;this._photoFile=file;this.sync();this.emit('photo');
      } catch {URL.revokeObjectURL(url);if(request!==this._photoRequest||!this.isConnected)return;error.textContent='This image could not be opened. Try a JPG or PNG.';error.hidden=false;}
    }
    clearPhoto(){this._photoRequest=(this._photoRequest||0)+1;if(this._photoURL)URL.revokeObjectURL(this._photoURL);this._photoURL=null;this._photoFile=null;this._savedPhotoURL=null;const error=this.querySelector('.fp-photo-error');if(error)error.hidden=true;}
    emit(source){this.dispatchEvent(new CustomEvent('change',{bubbles:true,detail:{...this.selection,source}}));}
    choose(index,source){const value=clean(index),changed=value!==this.value||this.hasPhoto;this.clearPhoto();this._choosing=true;this.value=value;this._choosing=false;this.sync();if(source!=='scroll')this.center(true);if(changed)this.emit(source);}
    chooseFace(direction,source){
      if(this.hasPhoto)return;
      const outgoing=this.snapshotPortrait();
      const styles=TodayFaceMotion.styles;
      this.faceStyle=styles[(styles.indexOf(this.faceStyle)+direction+styles.length)%styles.length];
      this.slidePortrait(outgoing,direction);this.emit(source);
    }
    snapshotPortrait(){
      if(this.variant!=='portrait'||reduced())return null;
      this._portraitAnimations?.forEach(a=>a.cancel());this.querySelector('.fp-outgoing')?.remove();
      const source=this.hasPhoto?this.querySelector('.fp-photo-preview'):this.querySelector('.fp-hero');
      // Clone canvas pixels; custom-element clones would register extra animation clocks.
      if(!this.hasPhoto){const canvas=source.querySelector('canvas'),flat=document.createElement('canvas');flat.width=canvas.width;flat.height=canvas.height;flat.getContext('2d').drawImage(canvas,0,0);flat.style.opacity='.74';return flat;}
      return source.cloneNode(true);
    }
    slidePortrait(outgoing,direction){
      if(!outgoing)return;const holder=this.querySelector('.fp-portrait-image'),incoming=this.querySelector('.fp-hero');
      outgoing.className='fp-outgoing';outgoing.setAttribute('aria-hidden','true');outgoing.removeAttribute('hidden');holder.append(outgoing);
      const timing={duration:480,easing:'cubic-bezier(.22,.8,.24,1)'};
      const old=outgoing.animate([{transform:'translateX(0)',opacity:.74},{transform:`translateX(${-direction*36}px)`,opacity:0}],timing);
      const next=incoming.animate([{transform:`translateX(${direction*36}px)`,opacity:0},{transform:'translateX(0)',opacity:1}],timing);
      this._portraitAnimations=[old,next];old.onfinish=()=>outgoing.remove();
    }
    sync(){
      if(!this._options)return;const photo=this.hasPhoto;
      this._options.forEach((b,i)=>{b.setAttribute('aria-checked',String(!photo&&i===this.value));b.tabIndex=i===this.value?0:-1;if(this.variant==='carousel')b.querySelector('today-minimal-face').toggleAttribute('still',i!==this.value);});
      this.querySelectorAll('.fp-color-name').forEach(s=>s.textContent=photo?'Your photo':`${TodayFaceMotion.label(this.faceStyle)} · ${names[this.value]}`);
      const disc=this.querySelector('.fp-disc');if(disc){
        // One painted disk. Native color transitions retarget from the current
        // interpolated colors, so quick taps never restart from an old palette.
        ['--fp-color-start','--fp-color-middle','--fp-color-end'].forEach((property,i)=>disc.style.setProperty(property,colors[this.value][i]));
        if(!disc.classList.contains('is-ready')){void disc.offsetWidth;disc.classList.add('is-ready');}
      }
      const hero=this.querySelector('.fp-hero,.fp-identity-face');if(hero){hero.setAttribute('palette',this.value);hero.setAttribute('face',this.faceStyle);hero.hidden=photo;hero.style.display=photo?'none':'';}
      const image=this.querySelector('.fp-photo-preview');if(image){image.hidden=!photo;if(photo)image.src=this._photoURL||this._savedPhotoURL;else image.removeAttribute('src');this.querySelector('[data-photo] span').textContent=photo?'Change photo':'Upload a photo';this.querySelector('[data-use-avatar]').hidden=!photo;}
      this.querySelectorAll('.fp-option today-minimal-face').forEach(f=>f.setAttribute('face',this.faceStyle));
      if(this.variant==='portrait'){this.querySelector('[data-prev]').disabled=photo;this.querySelector('[data-next]').disabled=photo;}
      if(this.variant==='carousel'){this.querySelector('[data-prev]').disabled=this.value===0;this.querySelector('[data-next]').disabled=this.value===last;}
    }
    nearest(){const center=this._rail.getBoundingClientRect().left+this._rail.clientWidth/2;let nearest=0,distance=Infinity;this._options.forEach((b,i)=>{const r=b.getBoundingClientRect(),d=Math.abs(r.left+r.width/2-center);if(d<distance){distance=d;nearest=i;}});return nearest;}
    center(animate){if(this.variant!=='carousel'||!this._rail)return;const b=this._options[this.value],r=b.getBoundingClientRect(),rail=this._rail.getBoundingClientRect(),left=this._rail.scrollLeft+r.left-rail.left+(r.width-this._rail.clientWidth)/2;this._rail.scrollTo({left,behavior:animate&&!reduced()?'smooth':'instant'});}
    measure(){if(this.variant!=='carousel')return;const rail=this._rail.getBoundingClientRect(),center=rail.left+rail.width/2;this._options.forEach(b=>{const r=b.getBoundingClientRect(),distance=Math.min(1,Math.abs(r.left+r.width/2-center)/r.width);b.style.setProperty('--fp-scale',reduced()?1:1-distance*.18);b.style.setProperty('--fp-opacity',1-distance*.6);});}
  }
  window.TodayFacePicker=Object.freeze({names,styles:TodayFaceMotion.styles});customElements.define('today-face-picker',FacePicker);
})();
