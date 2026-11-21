/* Gallery identity adapter. Local to this browser/origin, never an account save.
 * Product hosts should replace this adapter with their confirmed account model.
 * Only stable current-user IDs are resolved; friends keep their own portraits. */
(() => {
  const key='today.library.profile.v1';
  const fallback={id:'antony',name:'Antony',initials:'AT',faceStyle:'tilt',gradientIndex:0,photoURL:''};
  const normalize=value=>({...fallback,name:String(value?.name||'Antony').slice(0,40),initials:String(value?.initials||'AT').slice(0,2),faceStyle:TodayFaceMotion.styles.includes(value?.faceStyle)?value.faceStyle:'tilt',gradientIndex:Math.min(11,Math.max(0,Math.round(Number(value?.gradientIndex)||0))),photoURL:/^data:image\/(png|jpeg|webp);base64,/i.test(value?.photoURL||'')?value.photoURL:''});
  const read=()=>{try{return normalize(JSON.parse(localStorage.getItem(key)||'null'));}catch{return {...fallback};}};
  let current=read();
  const isSelf=person=>person?.self===true||person?.id==='antony'||person?.id==='You';
  const announce=()=>{TodayPartyAvatars.refresh();window.dispatchEvent(new CustomEvent('today-profile-saved',{detail:{...current}}));};
  TodayPartyAvatars.setIdentityResolver(person=>isSelf(person)?{...person,...current,id:person.id,name:person.name==='You'?'You':current.name}:person);
  async function photoData(file){
    // Store a small portrait, not a temporary blob URL or the full camera image.
    const bitmap=await createImageBitmap(file);
    try{const canvas=document.createElement('canvas'),side=Math.min(512,bitmap.width,bitmap.height);canvas.width=canvas.height=side;
      const context=canvas.getContext('2d'),crop=Math.min(bitmap.width,bitmap.height);
      context.drawImage(bitmap,(bitmap.width-crop)/2,(bitmap.height-crop)/2,crop,crop,0,0,side,side);
      return canvas.toDataURL('image/png');
    }finally{bitmap.close();}
  }
  window.TodayPreviewIdentity=Object.freeze({
    get person(){return {...current};},
    get selection(){return {kind:current.photoURL?'photo':'avatar',faceStyle:current.faceStyle,gradientIndex:current.gradientIndex,...(current.photoURL?{photoURL:current.photoURL}:{})};},
    async save(selection,{name=current.name}={}){
      const cleanName=String(name).trim();if(!cleanName)throw new Error('Enter a display name.');
      const photoURL=selection.kind==='photo'?(selection.file?await photoData(selection.file):selection.photoURL):'';
      const next=normalize({...selection,photoURL,name:cleanName,initials:cleanName.split(/\s+/).slice(0,2).map(s=>[...s][0]).join('').toUpperCase()});
      // Commit only after persistence succeeds. Failed saves leave every avatar intact.
      try{localStorage.setItem(key,JSON.stringify(next));}catch{throw new Error('Couldn’t save this profile in this browser. Free some storage and try again.');}
      current=next;announce();return {...next};
    }
  });
  window.addEventListener('storage',event=>{if(event.key===key||event.key===null){current=read();announce();}});
})();
