(() => {
  const activity=/\b(?:read(?:ing)?|walk(?:ing)?|run(?:ning)?|jog(?:ging)?|meditat(?:e|ing|ion)|stretch(?:ing)?|journal(?:ing)?|writ(?:e|ing)|floss(?:ing)?|brush(?:ing)?|exercis(?:e|ing)|work\s*out|workout|yoga|cycl(?:e|ing)|bik(?:e|ing)|swim(?:ming)?|practi[cs](?:e|ing)|stud(?:y|ying)|learn(?:ing)?|drink(?:ing)?|eat(?:ing)?|cook(?:ing)?|sleep(?:ing)?|bed|wake|smok(?:e|ing)|vape|vaping|alcohol|cigarettes?|scroll(?:ing)?|screen\s*time|social\s*media|tidy|clean(?:ing)?|sav(?:e|ing)|gratitude)\b/i;
  const rhythm=/\b(?:daily|nightly|weekly|weekdays?|weekends?|every\s+(?:(?:other|\d+)\s+)?(?:day|night|morning|evening|week|monday|tuesday|wednesday|thursday|friday|saturday|sunday)|(?:each|per|a)\s+(?:day|night|morning|evening|week)|(?:on\s+)?(?:mondays|tuesdays|wednesdays|thursdays|fridays|saturdays|sundays)|(?:on\s+)(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)|(?:before|after)\s+(?:bed|breakfast|lunch|dinner|work|school|waking|my\s+coffee|brushing)|at\s+(?:bedtime|\d{1,2}(?::\d{2})?\s*(?:am|pm))|(?:in\s+the\s+)(?:morning|evening))\b/i;
  const assess=description=>{
    const text=description.trim().replace(/\s+/g,' ');
    if(!activity.test(text))return{ready:false,label:'Say a little more',hint:'Name a specific habit, such as reading or walking.'};
    if(!rhythm.test(text))return{ready:false,label:'How often?',hint:'Add when or how often you want to do it.'};
    return{ready:true,label:'Build my plan',hint:''};
  };
  window.TodayUI=window.TodayUI||{};
  TodayUI.PlanReadiness={assess};
})();
