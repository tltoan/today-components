const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const reduce = $('#reduce-motion');
const media = matchMedia('(prefers-reduced-motion: reduce)');
const repeat = $('#repeat');
const fields = $('#repeat-fields');
const trigger = $('#schedule-trigger');
const menu = $('#schedule-options');
const track = $('#slide-track');
const handle = $('#slide-handle');
const alternative = $('#log-alternative');
const play = $('#play-demo');
const logo = $('#today-logo');
const agendaViewport = $('.agenda-viewport');
const repeatDisclosure=new TodayUI.Disclosure(fields,{open:true});
const onceDisclosure=new TodayUI.Disclosure($('#one-time'));
const presetDisclosure=new TodayUI.Disclosure($('#preset-expansion'),{trigger});
let agendaScroller;
const habitNames = {plants:'Water plants',stretch:'Evening stretch',meditate:'Meditate'};
const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
let selected = new Set([0,2,4]);
let custom = new Set(selected);
let repeating = true;
let menuOpen = false;
let preset = 'custom';
let agendaIndex = 0;
let logged = {plants:true,stretch:false,meditate:false};
let demoTimers = [];
let demoActive = false;
let drag = null;
let slideProgress = 0;

function animate(element, frames, duration = 230) {
  if (reduce.checked) return null;
  return element.animate(frames,{duration,easing:'cubic-bezier(.22,.76,.28,1)'});
}

function stopDemo() {
  demoTimers.forEach(clearTimeout);
  demoTimers = [];
  demoActive = false;
  play.querySelector('span').textContent = 'Replay motion';
  play.setAttribute('aria-label','Replay component motion demo');
  if (!logged.stretch && !drag) setSlide(0);
}

function setReduced(value) {
  reduce.checked = value;
  document.documentElement.toggleAttribute('data-reduced',value);
  logo.setAttribute('reduced-motion',String(value));
  updateLogoControls();
  if(value) {
    stopDemo();
    document.getAnimations().forEach(animation => animation.cancel());
    cancelDrag();
    finishAgendaDrag(true);
    agendaScroller?.settleImmediately();
  }
}

function setMenu(open) {
  menuOpen = open;
  menu.inert = !open;
  menu.setAttribute('aria-hidden',String(!open));
  presetDisclosure.setOpen(open);
  $('#preset-expansion').classList.toggle('open',open);
  trigger.setAttribute('aria-expanded',String(open));
  $('.schedule-tile').classList.toggle('menu-open',open);
  $('.weekdays').inert = open;
  $('.weekdays').setAttribute('aria-hidden',String(open));
}

function updateSchedule() {
  repeat.setAttribute('aria-checked',String(repeating));
  fields.classList.toggle('collapsed',!repeating);
  repeatDisclosure.setOpen(repeating);
  $('#one-time').classList.toggle('collapsed',repeating);
  onceDisclosure.setOpen(!repeating);
  $$('.weekdays button').forEach(button => button.setAttribute('aria-pressed',String(selected.has(Number(button.dataset.day)))));
  $$('.preset-menu button').forEach(button => button.setAttribute('aria-pressed',String(button.dataset.preset===preset)));
  $('.preset-highlight').style.setProperty('--selection-y',['daily','weekdays','custom'].indexOf(preset)*40+'px');
  $('#preset-value').textContent = {daily:'Every day',weekdays:'Weekdays',custom:'Custom'}[preset];
  const names = [...selected].sort().map(day => days[day]);
  const summary = selected.size===7?'Every day':selected.size===5&&[1,2,3,4,5].every(day=>selected.has(day))?'Weekdays':names.join(', ');
  $('#schedule-summary').textContent = repeating?summary+' · Before bed':'Friday, Nov 20 · Before bed';
  if(!repeating) setMenu(false);
}

function chooseDay(day) {
  if(selected.has(day)&&selected.size===1) {
    $('#schedule-summary').textContent = 'Keep at least one day selected.';
    return;
  }
  if(selected.has(day)) selected.delete(day); else selected.add(day);
  custom = new Set(selected);
  preset = selected.size===7?'daily':selected.size===5&&[1,2,3,4,5].every(d=>selected.has(d))?'weekdays':'custom';
  updateSchedule();
}

repeat.addEventListener('click',()=>{repeating=!repeating;updateSchedule();});
trigger.addEventListener('click',()=>setMenu(!menuOpen));
$$('.weekdays button').forEach(button=>button.addEventListener('click',()=>chooseDay(Number(button.dataset.day))));
$$('.preset-menu button').forEach(button=>button.addEventListener('click',()=>{
  preset = button.dataset.preset;
  selected = new Set(preset==='daily'?[0,1,2,3,4,5,6]:preset==='weekdays'?[1,2,3,4,5]:custom);
  updateSchedule();
}));
document.addEventListener('keydown',event=>{
  if(event.key==='Escape') {
    if(menuOpen){setMenu(false);trigger.focus();}
    cancelDrag();finishAgendaDrag(true);stopDemo();
  }
});
document.addEventListener('click',event=>{
  if(menuOpen&&!$('.schedule-card').contains(event.target))setMenu(false);
});

function setSlide(progress) {
  slideProgress = Math.min(1,Math.max(0,progress));
  track.style.setProperty('--progress',slideProgress);
}

function renderLogs(changed) {
  const count = Object.values(logged).filter(Boolean).length;
  const amount = $('#reported-count');
  const oldCount = amount.textContent;
  amount.textContent = count;
  if(String(count)!==oldCount)animate(amount,[{opacity:.3,transform:'translateY(7px)'},{opacity:1,transform:'translateY(0)'}],180);
  $('#day-progress').setAttribute('aria-valuenow',count);
  $('#day-progress').setAttribute('aria-valuetext',`${count} of 3 habits have a log today`);
  $('#day-progress span').style.width = count/3*100+'%';
  $$('.activity-row').forEach(row=>{
    const name = row.dataset.habit;
    row.setAttribute('aria-pressed',String(logged[name]));
    row.setAttribute('aria-label',habitNames[name]+(logged[name]?', logged. Undo log':', no log. Log activity'));
    row.querySelector('.activity-status').textContent = logged[name]?'Logged':'Log';
  });
  $('#progress-note').textContent = count===3?'You made a little time for all three.':count===0?'Start with one small thing.':'A little more room for you.';
  track.classList.toggle('logged',logged.stretch);
  handle.disabled = logged.stretch;
  handle.querySelector('use').setAttribute('href',logged.stretch?'#check':'#arrows');
  alternative.textContent = logged.stretch?'Undo log':'Or tap to log';
  alternative.setAttribute('aria-label',logged.stretch?'Undo evening stretch log':'Log evening stretch without sliding');
  $('#logging-caption').textContent = logged.stretch?'A moment for you, recorded.':'Make a little room for yourself.';
  if(!drag) setSlide(logged.stretch?1:0);
  if(changed) $('#log-status').textContent = habitNames[changed]+(logged[changed]?' logged.':' log undone.');
}

function toggleLog(habit, value) {
  logged[habit] = value===undefined?!logged[habit]:value;
  if(habit==='stretch')cancelDrag(false);
  renderLogs(habit);
}

function cancelDrag(reset=true) {
  if(!drag)return;
  const pointer = drag.pointer;
  drag=null;
  track.classList.remove('dragging');
  if(handle.hasPointerCapture(pointer))handle.releasePointerCapture(pointer);
  if(reset)setSlide(logged.stretch?1:0);
}

handle.addEventListener('pointerdown',event=>{
  if(event.button!==0||!event.isPrimary||logged.stretch)return;
  stopDemo();
  const travel = track.clientWidth-58;
  drag = {pointer:event.pointerId,start:event.clientX-slideProgress*travel,travel};
  handle.setPointerCapture(event.pointerId);
  track.classList.add('dragging');
});
handle.addEventListener('pointermove',event=>{
  if(!drag||event.pointerId!==drag.pointer)return;
  const rect = track.getBoundingClientRect();
  if(event.clientY<rect.top-44||event.clientY>rect.bottom+44){cancelDrag();return;}
  setSlide((event.clientX-drag.start)/drag.travel);
});
handle.addEventListener('pointerup',event=>{
  if(!drag||event.pointerId!==drag.pointer)return;
  const rect=track.getBoundingClientRect();
  if(event.clientY<rect.top-44||event.clientY>rect.bottom+44){cancelDrag();return;}
  setSlide((event.clientX-drag.start)/drag.travel);
  const complete = slideProgress>=1;
  cancelDrag(false);
  if(complete)toggleLog('stretch',true); else setSlide(0);
});
handle.addEventListener('pointercancel',()=>cancelDrag());
handle.addEventListener('lostpointercapture',()=>cancelDrag());
// Keyboard and assistive activation is the non-drag action on the handle.
handle.addEventListener('click',event=>{if(event.detail===0&&!logged.stretch)toggleLog('stretch',true);});
alternative.addEventListener('click',()=>toggleLog('stretch'));
$$('.activity-row').forEach(row=>row.addEventListener('click',()=>toggleLog(row.dataset.habit)));

const agendaDays = [
  {date:'20',day:'Fri',title:'Evening stretch',cue:'After work',amount:'Check it off',tag:'21-day trial',art:'StretchMat'},
  {date:'21',day:'Sat',title:'Meditate',cue:'After your morning coffee',amount:'Check it off',tag:'21-day trial',art:'Meditation'},
  {date:'22',day:'Sun',title:'Water plants',cue:'After breakfast',amount:'Check it off',tag:'Routine',art:'WaterPlants'},
  {date:'23',day:'Mon',title:'Evening stretch',cue:'After work',amount:'Check it off',tag:'21-day trial',art:'StretchMat'}
];
function agendaRows() { return $$('#agenda-content .agenda-entry'); }
function syncAgendaSelection(index) {
  agendaIndex=index;
  $('#previous-day').disabled=agendaIndex===0;
  $('#next-day').disabled=agendaIndex===agendaDays.length-1;
  $$('[data-agenda]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.agenda)===agendaIndex)));
  agendaRows().forEach((row,index)=>row.setAttribute('aria-current',String(index===agendaIndex)));
  const day=agendaDays[agendaIndex];
  const announcement=`${day.day}, November ${day.date}: ${day.title}`;
  if($('#agenda-status').textContent!==announcement)$('#agenda-status').textContent=announcement;
}
function chooseAgenda(index, immediate=false) {
  agendaScroller.goTo(index,{immediate});
}
function renderAgenda() {
  $('#agenda-content').innerHTML=agendaDays.map(day=>`<article class="agenda-entry"><div class="date-stamp"><strong>${day.date}</strong><span>${day.day}</span></div><div class="agenda-card"><img class="agenda-art" src="assets/${day.art}.svg" alt="" draggable="false"><h3>${day.title}</h3><p>${day.cue}</p><div class="agenda-tags"><span class="agenda-tag">${day.amount}</span><span class="agenda-tag accent">${day.tag}</span></div></div></article>`).join('');
  fitAgenda();
}
function fitAgenda() {
  agendaScroller?.refresh(agendaIndex);
}
function finishAgendaDrag(){agendaScroller?.cancelDrag();}
agendaScroller=new TodayUI.SnapScroller(agendaViewport,{
  selector:'.agenda-entry',onSelect:syncAgendaSelection,onInteract:stopDemo,reducedMotion:()=>reduce.checked
});
const agendaNavigationIndex=()=>agendaScroller.frame?agendaScroller.targetIndex:agendaIndex;
$('#previous-day').addEventListener('click',()=>chooseAgenda(agendaNavigationIndex()-1));
$('#next-day').addEventListener('click',()=>chooseAgenda(agendaNavigationIndex()+1));
$$('[data-agenda]').forEach(button=>button.addEventListener('click',()=>chooseAgenda(Number(button.dataset.agenda))));

function resetStudy() {
  cancelDrag();
  finishAgendaDrag(true);
  setMenu(false);
  repeating=true;selected=new Set([0,2,4]);custom=new Set(selected);preset='custom';
  logged={plants:true,stretch:false,meditate:false};agendaIndex=0;
  updateSchedule();renderLogs();renderAgenda();
}
function replayDemo() {
  if(demoActive){stopDemo();return;}
  stopDemo();resetStudy();
  replayLogo();
  if(reduce.checked) {
    $('#log-status').textContent='Demo reset. Motion is reduced; try the controls directly.';
    return;
  }
  demoActive=true;
  play.querySelector('span').textContent='Stop motion';
  play.setAttribute('aria-label','Stop component motion demo');
  const later=(ms,action)=>demoTimers.push(setTimeout(()=>{if(demoActive)action();},ms));
  later(500,()=>{repeating=false;updateSchedule();});
  later(1400,()=>{repeating=true;updateSchedule();});
  later(2150,()=>chooseDay(5));
  later(2650,()=>chooseDay(5));
  later(2900,()=>setSlide(.48));
  later(3550,()=>setSlide(1));
  later(3940,()=>toggleLog('stretch',true));
  later(4300,()=>chooseAgenda(1));
  later(5100,()=>chooseAgenda(2));
  later(5800,()=>toggleLog('meditate',true));
  later(6500,()=>stopDemo());
}

// Any direct interaction takes over immediately from the demonstration.
document.addEventListener('pointerdown',event=>{
  if(!play.contains(event.target))stopDemo();
},true);
document.addEventListener('keydown',event=>{
  if(['Tab','Enter',' ','ArrowLeft','ArrowRight','Escape'].includes(event.key)&&!play.contains(event.target))stopDemo();
},true);
play.addEventListener('click',replayDemo);
reduce.addEventListener('change',()=>{document.documentElement.setAttribute('data-motion-override','');setReduced(reduce.checked);});
media.addEventListener('change',event=>{document.documentElement.removeAttribute('data-motion-override');setReduced(event.matches);});
window.addEventListener('blur',()=>{cancelDrag();finishAgendaDrag(true);stopDemo();});
window.addEventListener('resize',()=>{cancelDrag();finishAgendaDrag(true);fitAgenda();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelDrag();finishAgendaDrag(true);stopDemo();}});

setReduced(media.matches);
updateSchedule();renderLogs();renderAgenda();
document.fonts.ready.then(fitAgenda);
if(!reduce.checked)$$('.tile .stage>div').forEach((element,index)=>{
  element.animate([{opacity:0,transform:'translateY(7px)'},{opacity:1,transform:'translateY(0)'}],{duration:360,delay:index*70,easing:'cubic-bezier(.22,.76,.28,1)',fill:'backwards'});
});

function updateLogoControls(){
  const reduced=reduce.checked;
  $('#logo-pause').disabled=reduced||logo.finished;
  $('#logo-pause').textContent=logo.isPlaying?'Pause':'Resume';
  $('#logo-status').textContent=reduced?'Less motion · Completed logo':logo.finished?'Complete · Replay anytime':!logo.isPlaying?'Paused':logo.loops?'2.1 seconds · Looping':'2.1 seconds · Plays once';
}
function replayLogo(){
  logo.replay();logo.isPlaying=true;updateLogoControls();
}
$('#logo-replay').addEventListener('click',replayLogo);
$('#logo-pause').addEventListener('click',()=>{logo.isPlaying=!logo.isPlaying;updateLogoControls();});
$('#logo-speed').addEventListener('change',event=>{logo.speed=Number(event.target.value);updateLogoControls();});
$('#logo-loop').addEventListener('change',event=>{logo.loops=event.target.checked;updateLogoControls();});
logo.addEventListener('complete',updateLogoControls);
