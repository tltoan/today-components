# Today widget proposals

These are reusable **browser components**, based on the Widgets canvas in the user's Today Figma file. They are not a WidgetKit extension and do not save native app data. The gallery supplies fictional November 17, 2026 data and a simulated asynchronous save.

## Coverage of the supplied Figma page

File: `Xf03CH47k7G0graqTZ4zis` · Canvas: `426:1987`.

| Figma family / node | Browser implementation |
| --- | --- |
| Numeric habit `426:2511` | `today-habit-widget`, variant `small`: water, reading, custom count, duration, upper limit |
| Check-off `426:2558` | `small` + `tracker: "checkoff"`: Log / Undo |
| Message `426:2585`, state specimens `426:3472–3556` | `message`: new, configure, empty, scheduled, paused, removed, failed, unavailable; also noDue and complete |
| Two habits `426:2609` | `medium`: two stable rows, each with its own action |
| Large daily list `441:2850` | `list`: five rows, overflow opens the full day |
| Large portraits `441:2932`, portrait `441:2939` | `portraits`: four habits; counts and units remain separate |
| My rhythm `441:2955` | `streak`: selected Warm Ember flame, confirmed count, seven dated marks |
| Rectangular accessory `426:2648` | `lock` + numeric habit: one quick action |
| Check-in accessory `441:3046` | `lock` + upper limit or check-off |
| Circular accessory `426:2660` | `circular`: water / reading, one content action |
| Streak accessory `441:3052` | `lock-streak`: monochrome Warm Ember treatment and confirmed days |
| Day summary `441:3061` | `summary`: habit count and build-target count |
| Calendar day `441:3841`, reading calendars `441:3863`, `441:4208` | `today-habit-calendar`, `activity`, minimum-goal entries and selectable dates |
| Break day `441:3852`, activity calendar `441:4553` | `activity`, upper-limit entries; recorded zero and actual amounts |
| Completion calendar `445:5152`, day `445:5147` | `completion`: only closed, eligible, within-limit dates are highlighted |
| Streak hero `441:4931` | `today-streak-hero` |
| Recent log `452:5148` | `today-recent-log` |
| Water states `426:2392 / 2411 / 2430 / 2449`, silhouette `430:2885`, overview art `430:2904` | Shared `TodayWidgets.art("water")` masked fill; empty through full, capped independently of the amount |
| Reading art `426:2468`, custom art `426:2478`, stretch/custom slots `441:2774 / 2789` | Exact bundled artwork through `TodayWidgets.art()` |
| Quick-log controls `426:2486 / 2496 / 2498`, actions `441:2827–2837`, lock action `441:3044` | Shared action / counter controls composed within the widget |
| Overview rows `426:2594 / 441:2797` | Shared keyed habit row; no row reordering after a save |
| Reading marks `426:2500`, lock bars `426:2645 / 434:2767`, gauges `435:2768 / 2773` | Reusable CSS marks, rail, and dynamic circle inside their consuming widget |
| Warm / monochrome flames `452:5143 / 5144` | Original source assets are retained; selected Warm Ember is used in the live components |

Apple phone contexts, wallpaper, app icons, layout annotations, and the full habit-detail phone chrome are presentation context, not additional widget components. No Apple Code Connect implementation exists in this vanilla JS repository, so its design shell is represented with the existing Today graphite surface.

## Deliberate clarity changes

- Future replaces the temporary SF Pro used in the Figma drafts, matching the existing browser library.
- Full habit names wrap and the browser cards can grow. A native fixed-size widget will need a separately verified truncation / accessibility policy.
- The check-off explicitly says No log yet or Logged and retains Log / Undo.
- Rectangle accessories use a 216 px browser specimen with a 64 px quick action and a 16 px gap; the plus and increment sit on separate lines. These are clarity studies, not verified fixed-size WidgetKit layouts.
- Circular gauges use a dynamic circle so progress can update smoothly. They have no miniature plus/minus buttons.
- Calendar selection exposes the date, actual amount, and meaning in text. Future days cannot be selected. The same fixture supplies the overview and calendar values.
- An upper-limit goal never gets a completion celebration while the day is open. `null` means no log; `0` is a real recorded amount.

## Reuse

Load `components/widget-primitives.js` before `components/habit-widget.js`. Load `components/habit-widget.css` and keep `assets/widgets/`, `assets/StretchMat.svg`, `assets/streaks/ember.svg`, and the Future font files. Asset URLs in JavaScript resolve relative to the script, and CSS uses relative URLs.

```html
<today-habit-widget id="water"></today-habit-widget>
<script>
  const widget = document.querySelector('#water');
  widget.model = {
    variant: 'small',
    date: '2026-11-17',
    habits: [{
      id: 'water', title: 'Drink water', amount: 750,
      target: 2000, unit: 'mL', step: 250,
      rule: 'atLeast', tracker: 'numeric', artwork: 'water'
    }]
  };
  widget.save = async request => {
    // The host must validate date, target, eligibility and measurement;
    // perform one coordinated save; then return the confirmed amount.
    return await yourStore.commitHabit(request);
  };
  widget.addEventListener('widget-open', event => {
    // Route using event.detail.route, habit and date.
  });
</script>
```

Without a `save` handler the mutation controls are disabled. The component never silently pretends to persist. Numeric taps are queued in order; check-offs cannot duplicate while pending. Failure preserves confirmed data and offers Retry / Open Today. Replacing `model` invalidates pending UI results; the host must still coordinate any real in-flight writes. Input limits and trusted data validation belong to the host.

`widget-change` contains the confirmed habit, action and date. `widget-error` reports a failed save. `widget-open` reports a route, optional habit and displayed date. UI focus stays on controls when amounts update.

Calendar: assign `model` with `year, month, today, selected, entries, target, unit, rule, mode`. Each entry is `{day, amount, eligible, paused?, target?, rule?}`. Supply saved per-date target/rule and eligibility when history differs; the top-level target/rule are a fallback for a known constant-history dataset. The component does **not** calculate streaks or reconstruct historical schedules. Listen for `date-select`. Arrow keys move focus between available dates.

Streak hero: `model = {count, label, through}`. Use “scheduled-day streak” for a non-daily schedule. Recent log: `model = {label, amount, unit, mark, date}`; listen for `log-open`.

## Motion

- Press: 130 ms, no layout shift.
- Amount: 320 ms shallow fade/rise after confirmation.
- Water: one damped spring raises the level and gently settles a surface wave. A new value redirects the current level and velocity; there is no idle loop. Rail/ring: 540 ms.
- Page marks: 380 ms.
- Selection dropdowns retain the approved 600 ms disclosure system.
- No idle widget loops. Reduced motion preserves the same final state without spatial transitions.
- The selected Warm Ember streak flame uses a 1.6 second lift and glow, settles to the exported still, and supports an explicit Still action.

## Native status

No SwiftUI or WidgetKit port was added in this change. Native persistence, App Intents, shared-store coordination, authentication, timeline refresh, midnight validation and actual OS rendering remain host-app integration work. The supplied SwiftUI files already in this library remain unchanged.


## Selected refinements · November 20, 2026

Warm Ember is the selected streak artwork, applied to the widget, insight hero and monochrome accessory. Active Pill is the selected step-progress pattern. The live galleries show the selected direction; alternatives remain available in source history.

Small browser cards are now 184 px wide (responsive to their gallery cell) with aligned title, amount/artwork, context and control rows. The source symbol geometry remains unchanged: optical transforms center the original minus and plus ink in their 44 px hit areas. The book is enlarged with a wrapper transform. The four-habit overview grows vertically to give each habit its own metric row, explicit context and full-width action. Streak dates align to the left of their count group. Calendar cells center their content with equal vertical padding.

These spacing revisions intentionally allow browser specimen heights to grow; they have not been fitted or verified in native WidgetKit size families.
