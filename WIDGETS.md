# Today widget proposals

These are reusable **browser components**, based on the Widgets canvas in the user's Today Figma file. They are not a WidgetKit extension and do not save native app data. The gallery supplies fictional November 17, 2026 data and a simulated asynchronous save.

## Coverage of the supplied Figma page

File: `Xf03CH47k7G0graqTZ4zis` · Canvas: `426:1987`.

| Figma family / node | Browser implementation |
| --- | --- |
| Numeric habit `426:2511` | `today-habit-widget`, variant `small`: water, reading, custom count, duration, upper limit |
| Check-off `426:2558` | `small` + `tracker: "checkoff"`: Log / Undo inside a fixed square |
| Message `426:2585`, state specimens `426:3472–3556` | `message`: new, configure, empty, scheduled, paused, removed, failed, unavailable; also noDue and complete |
| Two habits `426:2609` | `medium`: two stable rows, each with its own action |
| Large daily list `441:2850` | `list`: four rows, overflow opens the full day |
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
| Lock bars `426:2645 / 434:2767`, gauges `435:2768 / 2773` | Reusable rail and dynamic circle inside their consuming widget. Reading marks `426:2500` were removed from the small widget at user request; the amount and target communicate progress. |
| Warm / monochrome flames `452:5143 / 5144` | Original source assets are retained; selected Warm Ember is used in the live components |

Apple phone contexts, wallpaper, app icons, layout annotations, and the full habit-detail phone chrome are presentation context, not additional widget components. No Apple Code Connect implementation exists in this vanilla JS repository, so its design shell is represented with the existing Today graphite surface.

## Deliberate clarity changes

- Future is retained for prominent amounts; compact labels and controls use the system font for legibility.
- Widgets have fixed family dimensions. Long names use a one-line ellipsis; the content action retains the full accessible name and opens details. The browser title tooltip also exposes the full habit name.
- The check-off explicitly says No log yet or Logged today and retains Log / Undo, with artwork and status in separate rows.
- Small numeric widgets have one full-width quick-add action. Tap the content to open details/corrections; plus/minus stepper assets remain in the repository as historical source.
- Rectangular accessories use the selected Apple profile (160 × 72 pt by default), a 44-point action and an 8-point content/action gap. The amount’s unit remains in the content; the compact action displays +250. Its accessible label includes the unit.
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

Without a `save` handler the mutation controls are disabled. The component never silently pretends to persist. Numeric taps are queued in order; check-offs cannot duplicate while pending. Failure preserves confirmed data and replaces the widget face within its fixed footprint. Small/Home Screen widgets offer Retry / Open; compact Lock Screen accessories offer Retry. Focus moves to Retry only if it was already inside the widget and returns to the triggering action after retry. Hidden face controls become inert. Replacing `model` invalidates pending UI results; the host must still coordinate any real in-flight writes. Input limits and trusted data validation belong to the host.

`widget-change` contains the confirmed habit, action and date. `widget-error` reports a failed save. `widget-open` reports a route, optional habit and displayed date. UI focus stays on controls when amounts update.

Calendar: assign `model` with `year, month, today, selected, entries, target, unit, rule, mode`. Each entry is `{day, amount, eligible, paused?, target?, rule?}`. Supply saved per-date target/rule and eligibility when history differs; the top-level target/rule are a fallback for a known constant-history dataset. The component does **not** calculate streaks or reconstruct historical schedules. Listen for `date-select`. Arrow keys move focus between available dates.

Streak hero: `model = {count, label, through}`. Use “scheduled-day streak” for a non-daily schedule. Recent log: `model = {label, amount, unit, mark, date}`; listen for `log-open`.

## Motion

- Press: 130 ms, no layout shift.
- Amount: 320 ms shallow fade/rise after confirmation.
- Water: one damped spring raises the level and gently settles a surface wave. A new value redirects the current level and velocity; there is no idle loop. Rail/ring: 540 ms.
- Selection dropdowns retain the approved 600 ms disclosure system.
- No idle widget loops. Reduced motion preserves the same final state without spatial transitions.
- The selected Warm Ember streak flame uses a 1.6 second lift and glow, settles to the exported still, and supports an explicit Still action.

## Native status

**Latest November 23 next-step decision:** implement **all widgets already approved**, superseding infrastructure-only. The approved families are the small next-task and medium short-list task widgets in [HOME-TASKS.md](HOME-TASKS.md); implement both with their selected Home To-dos space and shared task storage using [IMPLEMENTATION-HOME-TODOS.md](IMPLEMENTATION-HOME-TODOS.md). The habit/Lock Screen layouts documented here remain Workshop proposals. Warm Ember selects the streak artwork/motion, not every containing widget layout. Native task-widget implementation `fd67a06`, checkpoint `46b8027`, now includes both selected families and Home To-dos. Review found two task retry defects; [IMPLEMENTATION-TASK-RETRY-FIX.md](IMPLEMENTATION-TASK-RETRY-FIX.md) is next. Saved installed-widget verification and remaining platform/parity gaps are summarized in `CHAT-HANDOFF.md`. This does not implement the habit-widget proposals documented here.

No SwiftUI or WidgetKit port was added in this change. Native persistence, App Intents, shared-store coordination, authentication, timeline refresh, midnight validation and actual OS rendering remain host-app integration work. The supplied SwiftUI files already in this library remain unchanged.


## Selected refinements · November 20, 2026

Warm Ember is the selected streak artwork, applied to the widget, insight hero and monochrome accessory. Active Pill is the selected step-progress pattern. The live galleries show the selected direction; alternatives remain available in source history.

The earlier growing 184 px cards and 216 px accessories are superseded by the fixed layouts below. Spacing is resolved through hierarchy and fewer actions, not a larger container.

## Apple size contract

The gallery's iPhone size selector is a browser layout reference for Apple's published point dimensions. One CSS pixel represents one point; browser zoom and display density still affect physical onscreen size. These presets describe three iPhone screen classes, not every Apple device.

| Preset / portrait screen (pt) | Small | Medium | Large | Rectangular accessory | Circular accessory |
| --- | --- | --- | --- | --- | --- |
| Compact · 375 × 667 | 148 × 148 | 321 × 148 | 321 × 324 | 153 × 68 | 68 × 68 |
| Standard · 390 × 844 | 158 × 158 | 338 × 158 | 338 × 354 | 160 × 72 | 72 × 72 |
| Large · 430 × 932 | 170 × 170 | 364 × 170 | 364 × 382 | 172 × 76 | 76 × 76 |

Source: [Apple Human Interface Guidelines — widget specifications](https://developer.apple.com/design/human-interface-guidelines/widgets#Specifications), consulted November 20, 2026.

Set `<today-habit-widget size="compact"></today-habit-widget>` or use `standard` (default) / `large`. Changing size preserves confirmed data and current motion. `TodayWidgets.sizes`, `family(variant)` and `dimensions(variant, size)` are the shared source of dimensions. Model variants map to families: small/message → small; medium/streak → medium; list/portraits → large; lock/lock-streak/summary → rectangular; circular → circular. Widgets never grow or shrink to fit the gallery. At very narrow browser widths the larger preview stage can scroll horizontally, without changing its frame.

Home Screen families use 16-point insets and 44-point actions. Medium displays two habits without a redundant header. The large list displays four rows plus a full-day link; the large grid keeps four habits and full-width actions. Rectangular accessories have their own 4-point inset composition and readable amount/action. Circular accessories prioritize amount and unit. All ten message states fit inside the smallest preset. Calendar and habit-detail components are explicitly separated as in-app insights.

This verifies browser layout constraints only. WidgetKit must still provide the real device family, system content margins, container background and native App Intents. Native previews/simulator tests, Dynamic Type, rendering modes, Home Screen tinting and iPad/Mac layouts remain separate integration work. Browser requestAnimationFrame water motion is a visual reference, not a directly reusable WidgetKit animation.

The Streak flames gallery’s separate animated widget placement now also uses the fixed standard medium footprint, 338 × 158 pt-equivalent, with 16 pt insets. Its former 230 px custom card was removed. This is a browser sizing specimen, not WidgetKit runtime verification.
