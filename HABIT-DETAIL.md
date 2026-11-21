# Habit detail — Grouped cards selected

Preview: [habit-detail.html](habit-detail.html). B Grouped cards is selected. A Illustrated overview and C Activity journal remain behind Compare earlier layouts. These are interactive browser compositions, not native SwiftUI or production integration. All fixtures use November 2026.

## Composition and reuse

Each is a 390 × 844 reference frame with safe-area spacing and independent vertical scrolling. Frames wrap rather than squeezing three into a row; narrow browsers adapt the width. The shared onboarding wash, typography and illustration assets stay unchanged.

All three follow header → logging → optional party → progress → history → plan. A emphasizes the artwork and calendar. B groups the content into compact surfaces with a disclosed quantity chart. C emphasizes the current quantity, chart and entry timeline, with the calendar disclosed. Only the layout differs.

Reuses `today-habit-card` (including confirmed Gradient Rise and undo retreat), `today-habit-calendar`, `today-staggered-bar-chart`, `today-party-entry`, gradient avatars, party check-ins, nudges, stepper, buttons, weekday controls, dropdown, switch, the selected soft-wheel reminder picker and shared 600 ms disclosures. No per-habit fire streak: the overall reporting streak belongs on Home.

Reusable pieces in `components/habit-detail.js`, `components/habit-detail-pieces.js` and `components/habit-detail.css`:

- `today-habit-detail`: `variant="a|b|c"`, assign `.model` before or after mounting.
- `today-habit-entry`: assign `.model` `{id,date,time,amount,unit,photo?,corrected?}`. An inspectable dated entry with an optional illustrated attachment.
- `today-habit-plan-editor`: assign the habit `.model`. Reuses the selected single-plan-card composition, target stepper, Schedule: weekdays and an effective date. It emits a request; it does not save.

## Controlled model

```js
const detail = document.querySelector('today-habit-detail');
detail.model = {
  id: 'reading', name: 'Read before bed', artwork: 'open-book',
  kind: 'amount', unit: 'pages', target: 10, increment: 5,
  state: 'trial', days: [0, 2, 4],
  today: '2026-11-17', start: '2026-11-10', end: '2026-11-30', trialDays: 21,
  reminderEnabled: true, reminderTime: '21:30',
  entries: [{id:'e1', date:'2026-11-17', time:'8:36 PM', amount:5, unit:'pages', targetAtLog:10}],
  party: null, timer: {seconds:0,running:false}, pending:false, error:''
};
detail.addEventListener('habit-detail-request', ({detail: request}) => {
  // Persist/validate in your host, then supply confirmed data to the component.
});
```

`habit-detail-request.detail.action` includes `log`, `entry`, `save-entry`, `delete-entry`, `save-plan`, `save-method`, `save-name`, `save-reminder`, `pause`, `resume`, `archive`, `delete`, timer actions, `react` and `nudge-reading|nudge-encourage`. Corrections carry `entryID` and `amount`. Plan changes carry `target`, `days` and `effective`; method changes carry `unit` and `target`. Name/reminder actions carry their new values. Host validates all IDs and values, persists, assigns confirmed `.model`, and calls `resolveDialog()` or `resolveDialog(error)`.

`timerSeconds = n` updates the visible clock without rebuilding controls. The sample host uses elapsed wall time, pause/resume, stop→log/discard and one auto-log on reaching the countdown target. “Finish sample timer” is explicitly a gallery shortcut. Production timer recovery, durable exactly-once writes and native background behavior are not implemented.

## Behavior and states

- Pages, water, timer and check-off examples; active trial, routine, paused and ended trial. Overflow also demonstrates archived/deleted states in memory.
- Null means no entry. Recorded zero remains an entry. Partial activity counts as logged, independently of reaching a target. Quantity logging remains enabled above target.
- Corrections and deletions are individual-entry operations. A correction below the target reverses Gradient Rise; an amount still at/above target retains it. Delete entry and delete habit have separate confirmation dialogs.
- Calendar selection filters History; Back to recent restores the three-day summary. The duplicate target row and visible selection caption are removed from detail calendars; accessible selection descriptions remain. Calendar target marks use `targetAtLog` for logged historical days. Method changes retain old units; charts/amounts aggregate only the current unit. The chart line is explicitly the **current** target.
- Active trials open **Adjust this trial**. Effective-date edits keep past entries and the existing end date. Future changes are retained as a pending plan in the fixture, not applied to today. Names and reminders have direct editors. Reminder drafts use Soft Wheels; Cancel preserves the confirmed time, and saving is blocked during an unconfirmed wheel edit.
- Ended trials replace logging with **Reflect on your trial**, linking to the existing recap collection. Paused/archived views retain history. Production routing should open the relevant habit's recap, not this generic comparison page.
- Party appears only when supplied. It opens avatars, a shared illustrated check-in, like reaction and a button nudge with confirmed Gradient Rise. Fixtures do not send notifications or share data. Real photos/upload/retry remain owned by the existing party composer and host. No new actual photo upload is added here.
- The local preview stays on detail after a log to make comparison possible. PRD §7.5's return-to-Home behavior remains a host navigation decision; this prototype does not silently change native navigation.

## Boundaries

`habit-detail-study.js` owns sample dates, fixture operations, failures, timer and synchronized previews. It is not a storage layer. Real historical eligibility/targets, multiple months, timezone, unit conversion, confirmation persistence, permission checks, party authorization and native haptics remain host responsibilities. Calendar/chart dates in this gallery are one fixed sample month; adapt that presentation before production use.

Keyboard and reduced-motion behavior inherit from the reused controls. Native device accessibility, Dynamic Type, VoiceOver and WidgetKit are separate verification work. Source files and dependencies are listed in `components.json`; no native file was modified for these compositions.

## Selected refinements

- `today-habit-history` has `variant="days|journal|chart"`. Set `.model` with `today`, `unit`, `entries` and optional `selectedDate`. Starts with **today and the preceding two calendar days**, including explicit no-log days. Earlier days are behind a shared 600 ms disclosure. Day rows expand to original entries; the chart shows three daily amounts and opens entries on tap. Historical units remain separate in text; the chart includes the current unit only. The component does not turn missing values into recorded zero.
- `today-habit-reminder` is the independent reminder card. `.model = {enabled, time:'21:30'}`. The switch smoothly collapses the time area; turning off retains its confirmed time. Soft Wheels edits require Use this time; Cancel preserves the last confirmed time. Emits `habit-detail-request` action `save-reminder` with `{enabled,time}`. Host saves, then calls `.resolve(error?)`. Mounted inside detail's dialog and separately in the library.
- `today-habit-schedule` extracts the approved graphite weekly card styling and preset disclosure. `.value = [0,2,4]`; `change` and `schedule-selection` events. Days remain mounted for subtle staggered fill. At least one day stays selected. In Adjust this trial it always represents a recurring weekly schedule; the original gallery's one-off toggle is intentionally not a change to trial recurrence semantics.
- Tracking method uses large inline radio choices with selected surfaces, keyboard arrows and a separate confirmation. No menu can open outside the editor. Reading offers Pages, Minutes and Check it off; the water fixture additionally offers mL. Changing units starts a dated change without rewriting history.

Load `habit-detail-pieces.js` before `habit-detail.js`; load the shared controls, picker and disclosure dependencies first. All source files are included in `components.json`. Current selected composition is B; default `today-habit-detail` variant is now `b`.

## Verified in the browser · November 21

Desktop and 390 px detail / 375 px onboarding pages show no horizontal overflow. Tested keyboard tracking choices, three-day history expansion, immediate reduced-motion collapse, confirmed logging, correction below target, tracking changes, timer completion, schedule saves, reminder Cancel/Use behavior and a save failure retaining confirmed entries. Onboarding ruler selection carries forward and reminders require confirmation before review. Changed JavaScript passes `node --check`; no browser console errors were observed in the focused detail preview. Native integration is not part of this check.
