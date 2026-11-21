const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const media = matchMedia('(prefers-reduced-motion: reduce)');
let motionReduced = media.matches;
const repeat = $('#repeat');
const fields = $('#repeat-fields');
const trigger = $('#schedule-trigger');
const menu = $('#schedule-options');
const slide = $('#stretch-log');
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

function animate(element, frames, duration = 230) {
  if (motionReduced) return null;
  return element.animate(frames,{duration,easing:'cubic-bezier(.22,.76,.28,1)'});
}

function setReduced(value) {
  motionReduced = value;
  document.documentElement.toggleAttribute('data-reduced',value);
  logo.setAttribute('reduced-motion',String(value));
  updateLogoControls();
  if(value) {
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
    cancelDrag();finishAgendaDrag(true);
  }
});
document.addEventListener('click',event=>{
  if(menuOpen&&!$('.schedule-card').contains(event.target))setMenu(false);
});

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
  slide.logged=logged.stretch;
  $('#logging-caption').textContent = logged.stretch?'A moment for you, recorded.':'Make a little room for yourself.';
  if(changed) $('#log-status').textContent = habitNames[changed]+(logged[changed]?' logged.':' log undone.');
}

function toggleLog(habit, value) {
  logged[habit] = value===undefined?!logged[habit]:value;
  if(habit==='stretch')cancelDrag(false);
  renderLogs(habit);
}

function cancelDrag(){slide.cancelDrag();}
slide.addEventListener('change',event=>toggleLog('stretch',event.detail.logged));
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
  selector:'.agenda-entry',onSelect:syncAgendaSelection,reducedMotion:()=>motionReduced
});
const agendaNavigationIndex=()=>agendaScroller.frame?agendaScroller.targetIndex:agendaIndex;
$('#previous-day').addEventListener('click',()=>chooseAgenda(agendaNavigationIndex()-1));
$('#next-day').addEventListener('click',()=>chooseAgenda(agendaNavigationIndex()+1));
$$('[data-agenda]').forEach(button=>button.addEventListener('click',()=>chooseAgenda(Number(button.dataset.agenda))));

media.addEventListener('change',event=>{document.documentElement.removeAttribute('data-motion-override');setReduced(event.matches);});
window.addEventListener('blur',()=>{cancelDrag();finishAgendaDrag(true);});
window.addEventListener('resize',()=>{cancelDrag();finishAgendaDrag(true);fitAgenda();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelDrag();finishAgendaDrag(true);}});

setReduced(media.matches);
updateSchedule();renderLogs();renderAgenda();
document.fonts.ready.then(fitAgenda);
if(!motionReduced)$$('.tile .stage>div').forEach((element,index)=>{
  element.animate([{opacity:0,transform:'translateY(7px)'},{opacity:1,transform:'translateY(0)'}],{duration:360,delay:index*70,easing:'cubic-bezier(.22,.76,.28,1)',fill:'backwards'});
});

function updateLogoControls(){
  const reduced=motionReduced;
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
