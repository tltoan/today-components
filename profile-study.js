/* Local gallery profile is shared across pages. No account or system setting changes. */
(() => {
 for(const root of document.querySelectorAll('[data-component="profile"]')){
  root.innerHTML=`<div class="ps-intro"><p>Expandable groups, with the profile card.</p><span>390 × 844 reference frames · scroll each screen</span></div><div class="ps-jumps" aria-label="Preview a profile screen">${[['main','Profile'],['edit','Edit profile'],['notifications','Notifications'],['privacy','Privacy'],['delete','Delete confirmation']].map(([page,label])=>`<button data-page="${page}" aria-pressed="${page==='main'}">${label}</button>`).join('')}</div><div class="ps-comparisons" id="profile-comparisons">${[['a','Compact groups','Earlier layout: compact identity row and all four groups in one scrolling list.'],['b','Section cards','More space around each group, with small icons and a contained identity panel.'],['c','Expandable groups · Selected','Section cards’ profile panel, paired with the expandable groups.']].map(([v,title,copy])=>`<article><div class="ps-label"><span>${v.toUpperCase()}</span><h3>${title}</h3></div><today-profile variant="${v}"></today-profile><p>${copy}</p></article>`).join('')}</div><div class="ps-fixtures"><label>Notification example<today-dropdown data-notifications label="Notification example" value="allowed"><option value="allowed">Allowed</option><option value="denied">Not allowed</option><option value="unasked">Not requested</option></today-dropdown></label><button data-backup>Show future backup status</button><button data-reset>Reset examples</button></div><p class="ps-note" role="status">Interactive proposals · sample identity. No account changes, uploads, messages or system settings. Backup, export and privacy details need implementation confirmation.</p><a href="PROFILE.md">Source, states & integration notes ↗</a>`;
  const selected=root.querySelector('.ps-comparisons'),previous=document.createElement('div');previous.className='ps-comparisons';
  [...selected.children].filter(a=>a.querySelector('today-profile').getAttribute('variant')!=='c').forEach(a=>previous.append(a));
  const compare=document.createElement('button');compare.type='button';compare.className='study-compare-toggle';compare.textContent='Compare previous profile layouts';
  const panel=document.createElement('div'),content=document.createElement('div');content.append(previous);panel.append(content);selected.after(compare,panel);
  const disclosure=new TodayUI.Disclosure(panel,{trigger:compare});compare.onclick=()=>disclosure.toggle();
  const profiles=[...root.querySelectorAll('today-profile')];let base={...profiles[0].model,...TodayPreviewIdentity.person};profiles.forEach(p=>p.model=base);const original=structuredClone(base);
  window.addEventListener('today-profile-saved',()=>{base={...base,...TodayPreviewIdentity.person};profiles.filter(p=>p.page!=='edit').forEach(p=>p.model=base);});
  const notice=s=>root.querySelector('.ps-note').textContent=s;
  root.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>{profiles.forEach(p=>p.go(b.dataset.page));root.querySelectorAll('[data-page]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));});
  root.querySelector('[data-notifications]').addEventListener('change',e=>{base.notifications=e.detail?.value||e.target.value;profiles.forEach(p=>{p.model=base;p.go('notifications');});});
  root.querySelector('[data-backup]').onclick=()=>{base.backup='success';profiles.forEach(p=>{p.model=base;p.go('backup');});notice('Future backup fixture: the timestamp is sample data, not a real backup.');};
  root.querySelector('[data-reset]').onclick=()=>{base={...structuredClone(original),...TodayPreviewIdentity.person};profiles.forEach(p=>{p.model=base;p.go('main');});root.querySelector('[data-notifications]').value='allowed';notice('Examples reset. No real account is connected.');};
  profiles.forEach(p=>p.addEventListener('profile-request',async e=>{
   const {action,value}=e.detail;
   if(action==='save-profile'){
    const save=p.querySelector('[data-profile-action="save-profile"]');if(save.hasAttribute('disabled'))return;save.setAttribute('disabled','');save.setAttribute('label','Saving…');
    try{const identity=await TodayPreviewIdentity.save(e.detail.selection,{name:e.detail.name});base={...base,...identity};profiles.forEach(other=>{other.model=base;});p.go('main');p.complete('Profile saved.');notice('Saved on this browser. Your profile and party avatars use this same picture. No account is connected.');}
    catch(error){p.querySelector('.pr-notice').textContent=error.message;save.removeAttribute('disabled');save.setAttribute('label','Save profile');}return;
   }
   if(action==='save-notifications'){base=value;profiles.forEach(other=>{other.model=base;});p.go('main');p.complete('Saved in this preview.');notice('The sample profile is shared across all three layouts. Nothing is uploaded or saved to an account.');return;}
   const feedback={'system-settings':'On iPhone, this opens Today’s system settings.','permission':'The app would request notification permission here.','confirm-delete':'Delete confirmed in this preview. No account or data was deleted.','confirm-signout':'Sign out confirmed in this preview. You are still signed in.','export':'A data export was requested in this preview. No real data was exported.','feedback':'Feedback captured in this preview. Nothing was sent.','backup':'Sample backup complete. No real backup was made.','change-phone':'Phone verification would open here.','terms':'The published terms will open here.','widget-guide':'The widget setup guide will open here.'};
   p.complete(feedback[action]||'Preview only.');
  }));
 }
})();
