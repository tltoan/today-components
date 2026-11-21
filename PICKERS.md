# Trial length and reminder time — proposals

[Interactive comparison](https://tltoan.github.io/today-components/pickers.html) · [Browser source](components/pickers.js) · [Styles](components/pickers.css)

Three trial selectors and three time selectors are interactive browser proposals. No direction has been selected yet. These components do not modify the native app, request notification permission, save a plan, or schedule notifications.

## Context and design evidence

Reviewed in the Today Figma file `Xf03CH47k7G0graqTZ4zis`:

- The supplied trial link `299:6535` is an empty frame. Its adjacent original screen `299:6537` shows a week slider; the newer trial screen `541:12708` uses a 21-day stepper, step 4 of 7.
- Reminder screen `529:5326` is step 6 of 7 for Read before bed. Reminders are optional and apply to existing reading days. Its editing sheet `529:5200` and cancellation notes `529:5411` keep a draft separate from the confirmed time.
- The current product draft specifies a **21-day default**, followed by reflection. It does not establish all alternative lengths. The gallery's 14/21/28-day choices and 1–90 custom range are comparison fixtures, not settled requirements.

A trial is a calendar-day period; it is not a count of scheduled logs. These controls do not change the weekly schedule or imply that a habit forms in 21 days. Start date comes later, so the preview does not invent an end date or a number of scheduled sessions.

The time picker edits one optional per-habit reminder. “Use this time” confirms the draft; Cancel or Escape restores the previous time. Turning reminders off discards an open edit and retains the last confirmed time for re-enabling. Continue belongs to the surrounding flow, not the picker. The gallery disables Continue while editing and uses it only to report a simulated next step.

## Variations

| Trial variant | Purpose |
| --- | --- |
| `cards` — Week cards | Compare common lengths in one glance, with custom entry available. |
| `ruler` — Day ruler | Snap to individual days by scrolling, dragging, tapping or keyboard. |
| `compact` — Quiet default | Emphasize the suggested length; expand choices only when needed. |

| Time variant | Purpose |
| --- | --- |
| `inline` — Inline clock | Type exact hour/minute values with explicit AM/PM. |
| `wheel` — Soft wheels | Align hour, minute and period through one selection band. |
| `dial` — Clock dial | Choose hour/minute around a face; fine adjustment uses +/− or keyboard. |

## Dependencies

Preserve relative paths. Load scripts once, in this order:

```html
<link rel="stylesheet" href="components/controls.css">
<link rel="stylesheet" href="components/pickers.css">
<link rel="stylesheet" href="foundations/motion.css">
<script src="foundations/disclosure.js" defer></script>
<script src="components/icons.js" defer></script>
<script src="components/controls.js" defer></script>
<script src="components/pickers.js" defer></script>
```

`controls.css` supplies the Today control tokens and Future font faces. Copy `assets/TestTheFuture-Regular.otf`, `assets/TestTheFuture-Medium.otf` and `assets/icons/Pencil.svg`. The context gallery additionally uses the original `ReadingIcon.svg` and the approved Active Pill step indicator. `picker-study.*`, `step-progress.*` and the surrounding page CSS are not core picker dependencies.

## Trial API

```html
<today-trial-picker variant="cards" value="21" min="1" max="90"></today-trial-picker>
```

- `.value` gets/sets whole days, clamped to bounds; fallback is 21.
- Configure `variant`, `min` and `max` before connecting the element. Updating `value` after connection updates the UI.
- A user selection emits a bubbling `change` with `event.detail.days`. Programmatic value changes do not emit it.
- Custom input rejects empty, fractional and out-of-range values. Enter applies; Escape collapses the editor.
- The ruler is a listbox: Left/Right selects an adjacent day, Home/End selects a bound. Tap and exact-number input provide alternatives to dragging.

```js
const trial = document.querySelector('today-trial-picker');
trial.addEventListener('change', event => {
  draft.trialDays = event.detail.days; // Host-owned draft.
});
```

## Time API

```html
<today-time-picker variant="inline" value="21:30"></today-time-picker>
```

- `.value` reads/writes a valid 24-hour `HH:mm` string. Invalid assignments are ignored; absent/invalid initial attributes fall back to `21:30`.
- Display is English 12-hour time with explicit AM/PM. All 60 minute values are available. Midnight/noon conversion is handled.
- `.open(focus = false)` starts an edit from the confirmed value. `.cancel()` restores it; `.confirm()` validates and commits. `.editing` reports the current state.
- `disabled` cancels an open draft and disables the edit trigger.
- `change` emits `{value: "HH:mm"}` only on confirmation. Internal native input changes and wheel changes do not escape as component change events.
- `picker-open` and `picker-cancel` expose editing boundaries; cancellation includes `{value}`.
- Wheel columns support Up/Down, Home/End, native touch scrolling, mouse dragging and tapping.
- The dial is a keyboard slider. Arrow keys and +/− change the selected unit by one; Home/End select its bounds. Unit buttons switch hours/minutes. Pointer dragging follows directly, while discrete selection settles smoothly.

```js
const time = document.querySelector('today-time-picker');
time.addEventListener('change', event => {
  draft.reminderTime = event.detail.value;
});
// Host persists the whole plan only when its own confirmation succeeds.
```

These are local wall-clock values without a date or timezone. The app must own timezone, daylight-saving behavior, localization, permission state, persistence and delivery. Native SwiftUI/WidgetKit integration is not included.

## Motion and accessibility

- Expansions and summary/editor transitions use the approved `TodayUI.Disclosure` 600 ms contract, including inert closed content and focus return.
- Selected readouts settle over 420 ms; the AM/PM highlight moves over 440 ms. Button press feedback comes from the shared controls.
- Wheels use browser scrolling and CSS snap, without a competing animation controller. Pointer-dragged dial movement follows the pointer directly.
- Reduced motion uses immediate disclosures, no readout travel, no highlight/dial transition and immediate programmatic scrolling.
- Inputs have labels, bounds and inline validation. Selection is exposed with pressed/selected states. Interactive targets are at least 44 CSS px; informational weekday marks are not controls.

## Verification — November 21, 2026

Browser checks performed at desktop, 390 × 844 and 375 × 667: layout without horizontal overflow; trial preset/custom validation and ruler bounds; mouse ruler drag; keyboard wheel/dial selection; dial tap/drag; midnight conversion; invalid-field recovery; confirmation, cancellation, reopening and reminder off/on retaining confirmed time; reduced-motion disclosure states; no browser console warnings/errors during the focused checks. Original reading icon dimensions remain approximately 26.43 × 23.22 CSS px.

These checks do not establish real-device touch physics, VoiceOver behavior, Dynamic Type, localization or native notification behavior. Those require verification when the selected design is implemented in the app.
