/* In-memory fixtures only. Never calls Apple, Supabase, SMS, storage or real routing. */
(() => {
  const phone=document.querySelector('today-account-access'),context=document.querySelector('#account-context'),step=document.querySelector('#account-step'),response=document.querySelector('#account-response'),status=document.querySelector('[data-study-status]'),dialog=document.querySelector('.as-apple-dialog'),exitDialog=document.querySelector('.as-exit-dialog');
  let requestTimer,countdownTimer,version=0;
  const stop=()=>{version++;clearTimeout(requestTimer);clearInterval(countdownTimer);};
  const announce=text=>status.textContent=text;
  const show=(patch,focus=false)=>{phone.configure(patch,focus);step.value=phone.model.step;};
  const copy={saved:['First the habit.<br>Then the account.','Your first habit is already saved. Choose Apple or phone, or go straight to Home and decide later.','First habit saved','Home','Optional'],returning:['Already here?<br>Welcome back.','A sign-in entry on the welcome screen brings returning users here, before creating another first habit.','Welcome · Sign in','Home','Returning'],profile:['Whenever<br>you’re ready.','The same journey opens from Profile. Existing habits stay on this iPhone while you decide what to connect.','Profile · Account','Profile','Optional'],invitation:['Keep your place<br>in the invitation.','Sign in once, then return to the Book cover invitation to review its schedule and sharing before joining.','Reading party invitation','Review invitation','Before joining']};
  function reset(){
    stop();if(dialog.open)dialog.close('reset');if(exitDialog.open)exitDialog.close();
    const c=copy[context.value];document.querySelector('[data-context-title]').innerHTML=c[0];document.querySelector('[data-context-copy]').textContent=c[1];document.querySelector('[data-route-before]').textContent=c[2];document.querySelector('[data-route-after]').textContent=c[3];document.querySelector('.as-route-current span').textContent=c[4];
    show({context:context.value,step:'choice',phone:'',code:'',dial:'+1',error:'',busy:false,seconds:0,method:'phone',backup:context.value==='returning'||response.value==='backup',linked:false,restored:false,skipped:false});announce('Start with Apple, or choose phone to try the code flow.');
  }
  function countdown(){clearInterval(countdownTimer);phone.setCountdown(60);const deadline=Date.now()+60000;countdownTimer=setInterval(()=>{const seconds=Math.max(0,Math.ceil((deadline-Date.now())/1000));phone.setCountdown(seconds);if(!seconds)clearInterval(countdownTimer);},1000);}
  function delay(work){stop();const token=version;show({busy:true,error:''});requestTimer=setTimeout(()=>{if(version!==token)return;work();},800);}
  function failure(){return response.value==='offline'?'You’re offline. Try again when you have a connection.':response.value==='limited'?'Too many attempts. Wait a little before trying again.':'';}
  phone.addEventListener('account-request',e=>{
    const {action}=e.detail,m=phone.model;
    if(action==='apple'){stop();dialog.returnValue='';dialog.showModal();return;}
    if(action==='phone'){stop();show({step:'phone',method:'phone',error:'',busy:false},true);return;}
    if(action==='skip'||action==='finish'||action==='back'&&m.step==='choice'){
      stop();const skipped=action!=='finish',destination=skipped&&context.value==='returning'?'Welcome':copy[context.value][3];
      document.querySelector('#exit-preview-title').textContent=`Next: ${destination}`;
      document.querySelector('[data-exit-copy]').textContent=context.value==='invitation'?'The app returns to the Book cover invitation. Signing in doesn’t join the party. No membership changed in this preview.':skipped?'The app returns here without creating an account. Your habit stays on this iPhone. This prototype hasn’t saved or changed any data.':'The app returns here with the account state you chose. This is the end of the browser prototype; no device data or account changed.';
      exitDialog.showModal();announce(`Preview complete. Next: ${destination}.`);return;
    }
    if(action==='back'||action==='change'){
      stop();const destination=m.step==='code'?'phone':['restore','success'].includes(m.step)?'data':'choice';show({step:destination,busy:false,error:''},true);return;
    }
    if(action==='send'||action==='resend'){
      if(action==='send'&&!phone.valid||action==='resend'&&m.seconds>0)return;
      delay(()=>{const error=failure();if(error){show({busy:false,error},true);return;}show({step:'code',code:'',busy:false,error:'',seconds:60},true);countdown();announce('Example code: 123456. No text was sent.');});return;
    }
    if(action==='verify'){
      if(!phone.valid)return;
      delay(()=>{let error=failure();if(!error&&(response.value==='invalid'||m.code!=='123456'))error='That code doesn’t match. Check your message and try again.';if(!error&&response.value==='expired')error='This code has expired. Request a new one to continue.';
        if(error){show({busy:false,error,seconds:0},true);announce('Recovery shown. Choose Successful in Example response to retry.');return;}
        show({step:'data',busy:false,error:'',method:'phone',backup:context.value==='returning'||response.value==='backup'},true);announce('Phone verification simulated. Local habits are unchanged.');
      });return;
    }
    if(action==='review-restore'||action==='data'){stop();show({step:action==='data'?'data':'restore',error:'',busy:false},true);return;}
    if(action==='associate'||action==='restore'){delay(()=>{const error=failure();if(error){show({busy:false,error},true);return;}show({step:'success',error:'',busy:false,linked:true,restored:action==='restore'},true);announce(action==='restore'?'Sample backup restored in the preview only. No device data changed.':'Association simulated. A cloud backup has not been made.');});return;}
    if(action==='defer'){stop();show({step:'success',error:'',busy:false,linked:false,restored:false},true);announce('Signed-in preview, with local data association deferred.');}
  });
  dialog.addEventListener('close',()=>{
    if(dialog.returnValue==='reset')return;
    if(dialog.returnValue==='success'){show({step:'data',method:'apple',error:'',busy:false,backup:context.value==='returning'||response.value==='backup'},true);announce('Apple success simulated. No phone number requested.');}
    else if(dialog.returnValue==='error'){show({error:'Apple sign-in couldn’t finish. Try again, or continue with phone.',busy:false},true);announce('Apple failure simulated. Local habits preserved.');}
    else announce('Apple sign-in cancelled. Nothing changed.');
  });
  context.addEventListener('change',reset);
  step.addEventListener('change',()=>{stop();show({step:step.value,busy:false,error:'',seconds:0,phone:phone.model.phone||'555 010 0200',code:'',backup:step.value==='restore'||context.value==='returning'||response.value==='backup',linked:step.value==='success'});announce('Jumped to a review state. No real authentication took place.');});
  response.addEventListener('change',()=>{stop();show({busy:false,error:'',seconds:0,backup:context.value==='returning'||response.value==='backup'});announce(`Example response: ${response.value}. Try the next action.`);});
  document.querySelector('[data-account-reset]').addEventListener('click',reset);
  document.querySelector('[data-fill-phone]').addEventListener('click',()=>{stop();show({step:'phone',phone:'555 010 0200',error:'',busy:false},true);});
  document.querySelector('[data-fill-code]').addEventListener('click',()=>{stop();show({step:'code',phone:phone.model.phone||'555 010 0200',code:'123456',error:'',busy:false,seconds:0},true);});
  document.querySelector('[data-resend-ready]').addEventListener('click',()=>{clearInterval(countdownTimer);phone.setCountdown(0);announce('Resend cooldown ended for this preview.');});
  addEventListener('pagehide',stop);
  reset();
})();
