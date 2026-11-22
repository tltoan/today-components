/* Optional photo action tied to a confirmed entry ID. Host owns attachment persistence. */
(() => {
  const picture='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="4"/><circle cx="9" cy="9" r="1.5"/><path d="m4 17 5-5 3 3 3-4 5 6"/></svg>';
  class LogPhotoAction extends HTMLElement {
    set model(value){const changed=this._model?.entryID!==value?.entryID;this._model={...value};if(changed)this._pending=false;if(this._ready)this.update();}
    connectedCallback(){if(this._ready)return;this._ready=true;
      this.innerHTML=`<div class="lpa-panel"><div><div class="lpa-content"><button type="button" class="lpa-button">${picture}<span>Add photo</span><i aria-hidden="true">+</i></button><input type="file" accept="image/*" tabindex="-1" aria-label="Choose a photo for this log" hidden><p class="lpa-error" role="alert"></p></div></div></div>`;
      this._panel=new TodayUI.Disclosure(this.querySelector('.lpa-panel'));
      this.querySelector('button').onclick=()=>this.querySelector('input').click();
      this.querySelector('input').onchange=e=>{const file=e.target.files?.[0];e.target.value='';if(!file||!this._model?.entryID||this._pending)return;
        if(!file.type.startsWith('image/')||file.size>8*1024*1024){this.querySelector('.lpa-error').textContent='Choose an image smaller than 8 MB.';return;}
        this._pending=true;this.update();this.dispatchEvent(new CustomEvent('log-photo-request',{bubbles:true,detail:{entryID:this._model.entryID,file}}));
      };this.update();
    }
    update(){const m=this._model||{},button=this.querySelector('button');if(!m.entryID&&this.contains(document.activeElement))this.closest('today-habit-card')?.querySelector('.ho-habit-actions>today-button button')?.focus({preventScroll:true});this.toggleAttribute('data-available',!!m.entryID);this._panel.setOpen(!!m.entryID);const label=this._pending?'Adding photo…':m.photoURL?'Change photo':'Add photo';button.querySelector('span').textContent=label;button.setAttribute('aria-label',`${label} to this log`);button.disabled=this._pending;button.querySelector('i').textContent=m.photoURL?'✓':'+';this.querySelector('.lpa-error').textContent=m.error||'';this.toggleAttribute('data-attached',!!m.photoURL);}
    resolve(entryID,error=''){if(entryID!==this._model?.entryID)return;this._pending=false;this._model.error=error;this.update();}
  }
  customElements.define('today-log-photo-action',LogPhotoAction);
})();
