// Gallery host: six-second READING example only. Never use this to plan a real habit.
import './components/habit-thinking.js';
const phones=[...document.querySelectorAll('today-habit-thinking')];
const timers=new Map(),versions=new Map();
const stateControl=document.querySelector('[data-thinking-state]');
const outcomeControl=document.querySelector('[data-thinking-outcome]');
const stop=phone=>{clearTimeout(timers.get(phone));timers.delete(phone);versions.set(phone,(versions.get(phone)||0)+1);};
const show=(phone,state,focus=false)=>{phone.configure({state,focus});stateControl.value=state;};
const change=(phone,state,focus=false)=>{stop(phone);show(phone,state,focus);};
const run=(phone,afterAnswer=false,focus=true)=>{
  stop(phone);show(phone,'pending',focus);
  const version=versions.get(phone),outcome=afterAnswer?'ready':outcomeControl.value;
  timers.set(phone,setTimeout(()=>{
    if(!phone.isConnected||versions.get(phone)!==version)return;
    timers.delete(phone);show(phone,outcome,phone.contains(document.activeElement));
  },6000));
};
phones.forEach(phone=>{
  show(phone,new URLSearchParams(location.search).has('embed')?'pending':'describe');
  phone.addEventListener('thinking-request',e=>{
    const {action}=e.detail;
    if(action==='edit')change(phone,'describe',true);
    else if(action==='close')change(phone,'cancelled',true);
    else if(action==='answer'&&phone.answer.trim())run(phone,true);
    else if(action==='submit'||action==='retry')run(phone);
  });
});
stateControl.addEventListener('change',()=>phones.forEach(phone=>change(phone,stateControl.value)));
document.querySelector('[data-run-thinking]').addEventListener('click',()=>phones.forEach(phone=>{
  change(phone,'describe');
  const version=versions.get(phone);
  // Review-only pause to see the source screen, then the real shared wash handoff.
  timers.set(phone,setTimeout(()=>{if(phone.isConnected&&versions.get(phone)===version)run(phone,false,false);},1100));
}));
addEventListener('pagehide',()=>phones.forEach(stop));
