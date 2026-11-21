/* Planning proposal. Controlled confirmation, never a real invitation or save. */
(() => {
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  class PartySetup extends HTMLElement {
    set model(v){this._model=structuredClone(v||{});if(this.isConnected)this.render();}
    connectedCallback(){this.render();}
    get value(){return{party:!!this.querySelector('today-switch')?.checked};}
    render(){const m=this._model||{},created=m.state==='created';this.innerHTML=`<section class="ps-card"><span class="p-eyebrow">PLAN REVIEW</span><h3>${esc(m.name||'Read before bed')}</h3><div class="ps-plan"><today-artwork name="open-book"></today-artwork><strong>${esc(m.target||'10 pages')}</strong><span>Schedule: ${esc(m.schedule||'Sun, Tue, Thu')}</span><span>${esc(m.trial||'21-day trial')} · ${esc(m.reminder||'9:30 PM reminder')}</span></div><div class="ps-switch"><div><strong>Make this a habit party</strong><span>Up to four people, including you</span></div><today-switch label="Make this a habit party" ${m.party?'checked':''} ${created?'disabled':''}></today-switch></div><div class="ps-scope"><div><dl><div><dt>Shared</dt><dd>Scheduled days, logs and party streak</dd></div><div><dt>Personal</dt><dd>Target, reminder and trial review</dd></div></dl></div></div><today-button block variant="primary" label="${created?'Party created':m.party?'Start plan & create party':'Start plan'}" ${created?'disabled':''}></today-button><div class="ps-invite"><div><span class="p-eyebrow">INVITE FRIENDS</span><h4>Three places to fill.</h4><div class="ps-seats"><today-profile-avatar size="40" person='{"id":"antony","name":"You","initials":"AT"}'></today-profile-avatar><span>+</span><span>+</span><span>+</span></div><p>Friends join your schedule and choose their own target.</p><button type="button" class="ps-invite-preview">Preview the invitation ↗</button></div></div><p class="ps-preview-status" role="status"></p></section>`;
      const sw=this.querySelector('today-switch'),scope=new TodayUI.Disclosure(this.querySelector('.ps-scope'),{open:!!m.party}),invite=new TodayUI.Disclosure(this.querySelector('.ps-invite'),{open:created}),action=this.querySelector('today-button');
      sw.addEventListener('change',()=>{scope.setOpen(sw.checked);action.setAttribute('label',sw.checked?'Start plan & create party':'Start plan');this.dispatchEvent(new CustomEvent('party-setup-change',{bubbles:true,detail:this.value}));});
      action.addEventListener('today-activate',()=>{this.dispatchEvent(new CustomEvent('party-request',{bubbles:true,detail:{action:'create',...this.value}}));});
      this.querySelector('.ps-invite-preview').onclick=()=>this.dispatchEvent(new CustomEvent('party-request',{bubbles:true,detail:{action:'preview-invite'}}));
    }
  }
  customElements.define('today-party-setup',PartySetup);
})();
