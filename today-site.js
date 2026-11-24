/* Website proposals only. No account, submission, persistence, analytics or production policies. */
(() => {
  const body = document.body;
  const direction = body.dataset.direction;
  const file = `today-site-${direction}.html`;
  const reduced = () => document.documentElement.hasAttribute('data-reduced') || matchMedia('(prefers-reduced-motion: reduce)').matches;
  const home = document.querySelector('[data-home]');
  const documentView = document.querySelector('[data-document]');
  const card = document.querySelector('[data-demo-card]');
  let opening = null;
  let disclosures = [];
  let amount = 5;
  let selectedDate = '2026-11-17';
  const dayAmounts = {'2026-11-15':10,'2026-11-16':null,'2026-11-17':5};
  const week = document.querySelector('today-week-bar');
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((weekday,index)=>({date:`2026-11-${15+index}`,weekday,number:15+index,today:index===2,label:`${weekday}, November ${15+index}`}));
  const updateCard = () => {
    card.model = {id:'site-reading',name:'Read before bed',kind:'count',unit:'pages',target:10,amount,increment:5,artwork:'open-book',date:selectedDate,current:selectedDate==='2026-11-17',future:selectedDate>'2026-11-17',cue:'Before bed',feedback:'wash'};
    if (week) {
      week.model = {days,selectedDate};
      document.querySelector('.site-day-title>span').textContent = days.find(day=>day.date===selectedDate).label;
    }
  };
  updateCard();
  week?.addEventListener('daychange', event => {
    selectedDate = event.detail.date; amount = dayAmounts[selectedDate] ?? null; updateCard();
  });
  card.addEventListener('logrequest', () => {
    amount += 5; dayAmounts[selectedDate]=amount; updateCard();
  });
  document.querySelector('[data-replay]').addEventListener('click', () => opening ? opening.replay() : document.querySelector('today-welcome-intro').replay());
  const reduceInput = document.querySelector('[data-reduce]');
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  reduceInput.checked = media.matches;
  const applyMotion = () => {
    document.documentElement.toggleAttribute('data-reduced', reduceInput.checked || media.matches);
    if (reduced()) opening?.settle();
    if (reduced()) document.getAnimations().forEach(animation => animation.finish());
  };
  reduceInput.addEventListener('change', applyMotion);
  media.addEventListener('change', () => {reduceInput.checked = media.matches; applyMotion();});
  applyMotion();
  const getApp = document.querySelector('.site-get-app');
  if (getApp) {
    const panel = new TodayUI.Disclosure(document.querySelector('.site-download-note'),{trigger:getApp.querySelector('button'),open:false});
    getApp.querySelector('button').setAttribute('aria-controls','site-download-note');
    getApp.addEventListener('today-activate',()=>panel.toggle());
  }

  const pages = {
    privacy: {title:'Your privacy.',intro:'A clear place to understand how Today handles your information.',sections:[
      ['What you share','The final policy will describe the information used for your account, habit plans and activity, including any notes and photos you choose to add.'],
      ['Planning with AI','This section will identify the planning providers, what is sent to them, and the choices presented before any personal information is shared.'],
      ['Habits with other people','This section will explain who can see party logs, notes and photos, and what happens when someone leaves a party or removes shared content.'],
      ['Your choices','The published policy will explain access, export, deletion, retention, notification settings and how to make a privacy request.'],
      ['Who to contact','The operating entity and verified privacy contact will be added before launch.']
    ]},
    terms: {title:'A few shared terms.',intro:'The place for the details of using Today.',sections:[
      ['Using Today','The final terms will describe eligibility, accounts, acceptable use and the responsibilities of people using the app.'],
      ['Your plans and content','This section will cover ownership of your content, the permissions needed to provide the service, and the scope of generated habit suggestions.'],
      ['Sharing with a party','This section will describe the rules for invitations, shared notes and photos, reporting content and blocking other users.'],
      ['Availability and changes','The final terms will explain service availability, account closure and changes to these terms. Any payment terms will reflect the actual launch offer.'],
      ['The legal details','The operating entity, applicable law, effective date and verified contact details require confirmation before publication.']
    ]}
  };
  const faq = [
    ['Can I log less than my target?','Yes. Small amounts count. If your plan is 10 pages and you read five, record five. You can add another entry later.'],
    ['Where do I add a note?','Open the individual habit and its history. A note belongs to a specific log, so you can remember the context of that entry.'],
    ['Do I have to turn on reminders?','Reminders are optional. Choose a time that fits your day, change it later, or turn them off in your habit’s reminder settings.'],
    ['What happens when a trial ends?','You look back and choose what comes next: another trial with a plan you can adjust, or an ongoing routine.']
  ];
  const endLinks = () => `<nav class="site-document-end" aria-label="More information"><a href="${file}" data-page="home">← Back to Today</a><a href="${file}?page=privacy" data-page="privacy">Privacy</a><a href="${file}?page=terms" data-page="terms">Terms</a><a href="${file}?page=support" data-page="support">Support</a></nav>`;
  const renderDocument = page => {
    disclosures.forEach(item => item.destroy?.()); disclosures = [];
    if (page === 'support') {
      documentView.innerHTML = `<span class="site-draft-label">Support · Preview</span><h1>A little help.</h1><p class="site-lede">A few things you might be wondering.</p><p class="site-draft-note">Preview of the planned support page. Today is still in development; these answers describe the selected product direction.</p><div class="site-faqs">${faq.map(([question,answer],index)=>`<section class="site-faq"><button aria-expanded="false" aria-controls="answer-${index}">${question}<span aria-hidden="true">+</span></button><div class="site-answer" id="answer-${index}"><div><p>${answer}</p></div></div></section>`).join('')}</div><div class="site-contact-note"><h2>Still need a hand?</h2><p>The support contact and a way to report shared content will be added before launch.</p></div>${endLinks()}`;
      documentView.querySelectorAll('.site-faq').forEach(section => {
        const button = section.querySelector('button');
        const disclosure = new TodayUI.Disclosure(section.querySelector('.site-answer'), {trigger:button,open:false});
        disclosures.push(disclosure);
        button.addEventListener('click',()=>{disclosure.toggle();button.querySelector('span').textContent = button.getAttribute('aria-expanded')==='true' ? '−' : '+';});
      });
    } else {
      const content = pages[page];
      documentView.innerHTML = `<span class="site-draft-label">${page==='privacy'?'Privacy':'Terms'} · Draft preview</span><h1>${content.title}</h1><p class="site-lede">${content.intro}</p><p class="site-draft-note">This is a content and layout preview, not a published ${page==='privacy'?'privacy policy':'agreement'}. The final text will reflect Today’s launch services and confirmed legal details.</p><nav class="site-document-nav" aria-label="On this page">${content.sections.map(([title],index)=>`<a href="#section-${index}">${title}</a>`).join('')}</nav>${content.sections.map(([title,copy],index)=>`<section id="section-${index}" class="site-document-section"><h2>${title}</h2><p>${copy}</p></section>`).join('')}${endLinks()}`;
    }
  };
  const showPage = (page, focus = false) => {
    opening?.settle();
    if (!['home','privacy','terms','support'].includes(page)) page = 'home';
    body.dataset.view = page;
    home.hidden = page !== 'home'; documentView.hidden = page === 'home';
    if (page !== 'home') renderDocument(page);
    document.querySelectorAll('[data-page]').forEach(link => {
      if (link.dataset.page===page) link.setAttribute('aria-current','page');
      else link.removeAttribute('aria-current');
    });
    document.title = `Today — ${page==='home'?(direction==='a'?'A quiet opening':'Your day, in view'):page[0].toUpperCase()+page.slice(1)} · Website ${direction.toUpperCase()}`;
    if (focus) {
      const heading = (page==='home'?home:documentView).querySelector('h1');
      heading.tabIndex = -1; heading.focus({preventScroll:true});
      window.scrollTo({top:0,behavior:'instant'});
    }
  };
  document.addEventListener('click', event => {
    const link = event.target.closest('a[data-page]');
    if (!link || event.defaultPrevented || event.button!==0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target==='_blank') return;
    event.preventDefault();
    history.pushState({},'',link.getAttribute('href'));
    showPage(link.dataset.page,true);
  });
  addEventListener('popstate',()=>showPage(new URLSearchParams(location.search).get('page')||'home',true));
  showPage(new URLSearchParams(location.search).get('page')||'home');
  if (direction==='b') opening = new TodayUI.WebsiteOpening({reduced});
  const observer = new IntersectionObserver(entries => entries.forEach(entry=>{
    if (!entry.isIntersecting) return;
    if (!reduced()) entry.target.animate([{opacity:.25,transform:'translateY(16px)'},{opacity:1,transform:'translateY(0)'}],{duration:650,easing:'cubic-bezier(.22,.8,.24,1)'});
    observer.unobserve(entry.target);
  }),{threshold:.12});
  document.querySelectorAll('[data-reveal]').forEach(element=>observer.observe(element));
})();
