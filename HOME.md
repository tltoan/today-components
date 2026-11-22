# Home with multiple habits

[Interactive preview](home.html) · [Component](components/home-overview.js) · [Styles](components/home-overview.css)

This is a proposed extension of the selected illustrated Home, not a replacement for the approved first-session onboarding screen. One habit gets the larger artwork treatment. Multiple habits use a vertical stack with smaller artwork, a target, a confirmed amount or “No log yet”, and one logging action. Six habits exercise the scrollable list; the header, selected day and Center Cradle navigation remain outside that scrolling region. Cards stay in place after a log rather than jumping between sections.

The November 19 PRD distinguishes reporting from target attainment. Accordingly, “1/3 logged” includes a partial saved amount. Reaching or exceeding a target does not disable quantitative logging. A null amount means unknown, while zero is an explicit report. The list is supplied by the host: exclude paused, archived, future-start and trial-ended habits from that day's eligibility. Home ordering remains a proposal; this component preserves host order.

## Reuse

Load the ordered scripts/styles in `components.json` under `home-overview`. The composition uses `today-habit-card`, `today-streak-badge`, the Center Cradle navigation and existing water-fill spring. Do not load `home-study.js` in the product; it is only the gallery fixture/controller.

```html
<today-home-overview></today-home-overview>
```

```js
const home = document.querySelector('today-home-overview');
home.model = {
  selectedDate: '2026-11-17',
  days: [ // Typically a seven-day strip. Host owns date/timezone calculations.
    {date:'2026-11-17', weekday:'Tue', number:17,
     label:'Tue, Nov 17', today:true, future:false}
  ],
  habits: [
    {id:'reading', name:'Read before bed', artwork:'open-book',
     kind:'amount', target:10, unit:'pages', increment:5,
     cue:'Before bed', amount:null, pending:false, error:''}
  ],
  announcement: ''
};
home.addEventListener('daychange', e => loadDay(e.detail.date));
home.addEventListener('logrequest', e => openOrSaveLog(e.detail.id, e.detail.date));
```

- Assign a fresh `.model` after the host confirms a save. Setting `pending:true` disables that habit's action; an `error` preserves the prior amount and displays inline feedback. No request changes the confirmed amount by itself.
- `kind` is `amount`, `check`, or `limit`. Amount/limit actions request an increment. Check actions request a log or undo of the displayed check. The host resolves the actual event/correction and permission rules.
- `daychange {date}` requests a date. `logrequest {id,date}` requests logging. `destination {tab}` reflects Home/Habits selection. The original nav `add` event bubbles; the + remains disconnected from habit creation in the library.
- Future days show planned targets without logging actions. Past-date correction is available to the host. Day off displays a dedicated empty state, not a false zero-report achievement.
- The list is focusable for keyboard scrolling. Labels, logged counts and feedback remain textual. Reduced motion removes amount/day movement; the shared navigation and water fill honor the same setting.

## Fixture boundaries

The one/three/six/day-off presets, November 17 sample date, eligibility and schedules are gallery data. The simulated 360 ms save is not a network request. Sample increments are retained as separate in-memory events, then summed for display; reset/reload discards them. It does not award actual streak credit, run timers, implement the evening None today action, show trial-review cards, open detail pages, or persist anything. These belong to host integration. Long names and a failed save can be exercised without changing real app data. Native implementation, Dynamic Type and VoiceOver remain separate verification work.

## Motion and layout

The card result settles over 320 ms after a confirmed amount change. Date changes use a 420 ms, 6 px settle. There is no repeated celebration or automatic reordering. Water uses `TodayWidgets.setWaterFill`; its one spring redirects from its current state. The phone preview is 844 px high, with a bounded list and navigation below it, so the last card can be scrolled fully above the nav.

## Completion and streak placement

Home accepts `feedback:"wash"` (selected default), `"bloom"` or `"halo"` and optional `streak:{days:6}`. The global logging-streak badge sits beside Your day; it does not belong to any individual habit. This is a placement proposal. `target-reached` bubbles from the card only on a confirmed current-day crossing; see [HABIT-CARDS.md](HABIT-CARDS.md). Stronger Gradient Rise plays once, then leaves a settled tint. The static six-day gallery fixture does not calculate or grant streak credit.


November 21 refinement: only selected Gradient Rise remains in the live gallery. The external **Undo last log** review control restores the previous confirmed log list, with a retreat only if the resulting amount falls below target. Failed saves do not enter undo history. Party composition is demonstrated separately in habit-parties.html via the card’s optional party model; the base Home fixture remains personal.


`today-week-bar` is the shared Home/onboarding date strip. Assign `.model={days:[{date,weekday,number,label,today}],selectedDate}`. Listen for `daychange {date}` and confirm the selected model. Today is independent from selected date. Arrow/Home/End keys move focus; Enter/Space activates. Load components/week-bar.js and components/week-bar.css.


## Current logging update

Home retains quick `logrequest` saves. Notes are edited within habit history. Cards still update only after confirmation. Per-entry storage belongs to the host. Party cards may receive `photoEntry` for the selected circular action beside logging. See [LOG-NOTES.md](LOG-NOTES.md).


## Latest placement decision

Latest correction: Home quick logging again emits the original `logrequest` with id/date and saves immediately in its host. The interim `home-log-save` / `resolveLog` integration was removed. Notes are added from individual habit history, not Home’s logging action.
