# Habit cards, streak placement and target feedback

[Individual cards](habit-cards.html) · [Home](home.html) · [Streak section](index.html#streak-cards)

`today-habit-card` is the actual reusable card used by Home, not a copied gallery composition. `layout="hero"` gives one habit a large centered illustration; `layout="compact"` fits a list. Neither is a WidgetKit widget or has fixed widget dimensions.

## Card API

Load the ordered files listed under `habit-card` in components.json. Gallery files are not required.

```html
<today-habit-card layout="compact"></today-habit-card>
```

```js
const card = document.querySelector('today-habit-card');
card.model = {
  id: 'water', name: 'Drink water', artwork: 'water-droplet',
  kind: 'amount', target: 2000, unit: 'mL', increment: 250,
  amount: 1750, cue: 'Throughout the day',
  date: '2026-11-17', current: true, future: false,
  pending: false, error: '', feedback: 'wash'
};
card.addEventListener('logrequest', ({detail}) => saveLog(detail.id, detail.date));
card.addEventListener('target-reached', ({detail}) => nativeHaptics.success());
```

The callbacks are integration examples, not included backends. `logrequest` never changes the amount; the host sets pending and supplies a new confirmed model or an error with the unchanged confirmed amount. `kind` supports amount, check and limit. Null means no log; zero remains explicit. Check-off requests Log/Undo. Future dates have no logging action. More quantitative logs remain available after reaching the target.

A target crossing requires the same habit/date, unchanged kind/target, `current:true`, no pending/error, and a confirmed amount going from below target to at/above. Initial rendering, changing dates, changing a target, failed saves, upper-limit goals and further logs above target do not celebrate. Undo removes the completed paint. A subsequent genuine crossing can celebrate again. Water retains the existing spring fill.

`target-reached` bubbles once per crossing with `{id,date,variant,haptic:'success'}`. The native host can map it to one success haptic after its save acknowledgement. The browser provides visual feedback; this is not verified iPhone haptics or a native integration. Do not award streak credit from this event.

## Selected completion direction

The user selected **Gradient Rise** (`wash`) on November 21 and requested a stronger fill. It is the default for cards and Home: blue, lavender and peach rise over 900 ms and settle at 72% of the paint layer's own opacity. Colors already contain alpha. Soft Bloom and Quiet Halo remain comparison alternatives.

`today-target-feedback` can be reused as the first child of any positioned, isolated card. It is decorative, does not intercept touches, and inherits the card radius. Content belongs above it at z-index 1.

```html
<today-target-feedback variant="wash" met></today-target-feedback>
```

Set/remove `met` for the persistent state. Call `celebrate()` only after a confirmed transition; it is never called merely by setting an attribute. It cancels prior playback before starting. Reduced motion shows the settled paint immediately and changing the preference cancels in-flight movement. Text still says Target met; color is not the only signal.

## Overall streak

```html
<today-streak-badge days="6"></today-streak-badge>
```

This is a host-supplied Today-wide logging streak using the selected Warm Ember artwork. It does not calculate credit. The PRD defines a global logging streak, superseding earlier per-habit target streaks; partial saved activity can count independently of targets. In the Home proposal it sits beside Your day, outside the card/list, for both one and many habits. Home accepts optional `streak:{days:6}`; omit it to hide the badge. Gallery six-day values are static fixtures, not earned credit. Historical per-habit artwork studies do not override the current streak policy.

## Gallery and implementation status

Both layouts are available independently in habit-cards.html and in the library's Streak section. The three background studies are also below Home. All save interactions are local fixtures. No native app files, backend, streak engine, media sharing or notifications were changed.
