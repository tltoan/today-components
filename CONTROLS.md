# Today icons and controls

Reusable browser components, added from the Today app and Figma section `321:484`. The gallery is `controls.html` and the main library section is `index.html#controls`. These additions do not change the native app.

## Load

```html
<link rel="stylesheet" href="components/controls.css">
<script src="components/icons.js" defer></script>
<script src="components/controls.js" defer></script>
```

Copy the SVGs listed in `assets/icons/manifest.json` and the two bundled Future fonts, keeping their paths relative to these scripts/styles. The icon registry resolves assets relative to its own script, including under a GitHub Pages project prefix. `controls-study.js` and `controls-study.css` are gallery-only; they are not component dependencies. The dropdown example separately reuses `foundations/disclosure.js`, `foundations/motion.css`, and `components/dropdown.*`.

## Icons

```html
<today-icon name="home" label="Home"></today-icon>
<!-- Decorative next to equivalent text: -->
<today-icon name="planned-day"></today-icon><span>Planned day</span>
```

Names: `home`, `habits`, `activity`, `reading`, `chevron`, `close`, `double-chevron`, `pencil`, `planned-day`, `day-off`, `increase`, `decrease`.

The first ten are exact original SVGs matching the SHA-256 hashes in the Figma component descriptions. The last two are the app's 48 × 48 counter artwork. Original colors, width, height and aspect ratio are preserved. `assets/icons/manifest.json` supplies paths, dimensions, Figma node IDs, hashes and original app-relative paths. `TodayIcons.create(name, label = '')` returns the same local image element for composition; `TodayIcons.icons` exposes immutable metadata. The asset is decorative without a label; an interactive parent must supply its action name.

## Buttons

```html
<today-button label="Save log" variant="primary" block></today-button>
<today-button variant="round" symbol="+" accessible-label="Add habit"></today-button>
<today-button variant="round" icon="close" accessible-label="Close"></today-button>
<today-button variant="icon" icon="increase" accessible-label="Increase target"></today-button>
<today-button variant="choice" label="Logged" icon="planned-day" selected></today-button>
```

| Variant | Intended use | Minimum height |
| --- | --- | --- |
| `primary` | Main action / Save log | 56 |
| `prominent` | Begin / welcome action | 65 |
| `compact` | Continue in a compact layout | 50 |
| `secondary` | Supporting action | 44 |
| `quiet` | Text action / Skip | 44 |
| `quick` | Short increment with `symbol="+"` | 44 |
| `round` | Add, remove, close, edit, direction | 50 |
| `icon` | Original standalone counter artwork | 48 |
| `profile` | Initials | 44 |
| `choice` | Selectable chip | 48 |
| `day` | Weekday | 44 |
| `row` | Whole-row navigation | 64 |

Attributes: `label`, `variant`, optional `icon`, `symbol`, `trailing-icon`, numeric `rotation` (leading icon degrees), `accessible-label`, `value`, boolean `block`, `disabled`, `busy`, `selected`. Boolean attributes use presence, not strings such as `disabled="false"`.

Listen for `today-activate`; `event.detail.value` is the `value`, label, or accessible label. A native inner button handles Enter and Space. `disabled` blocks activation. `busy` keeps keyboard focus, announces saving and blocks repeated activation; the host clears it when its real operation finishes. Choice/day controls toggle `selected` and also emit `change` with `{selected}`. The host controls mutually exclusive sets. Do not attach a second host `click` handler instead of `today-activate`.

```js
const save = document.querySelector('today-button');
save.addEventListener('today-activate', async () => {
  save.setAttribute('busy', '');
  try {
    await saveActualLog();
    save.setAttribute('label', 'Saved');
  } catch (error) {
    showSaveError(error); // Keep confirmed data and offer retry in the host.
  } finally {
    save.removeAttribute('busy');
  }
});
```

No persistence, route, or implied readiness is built into the primitive. The gallery's saving delay and feedback are synthetic. Specialized behavior stays in the existing adaptive plan button, Center Cradle nav, dropdown, slide-to-log and widget components; those are linked in the collection rather than reimplemented.

Habit intent (building or breaking) is parsed from the user’s description. Do not use selectable chips to ask the user to choose Build or Break; the library has no such creation step.

## Switch

```html
<today-switch label="Repeat weekly" checked></today-switch>
```

Read/write `.checked`, or set/remove `checked`. Supports `disabled` and a required meaningful `label`. Emits bubbling `change`. Its inner native button uses `role="switch"` and `aria-checked`. The thumb moves for 380 ms; reduced motion preserves the final checked position immediately.

## Amount stepper

```html
<today-stepper label="pages" value="10" min="0" max="30" step="1" unit="pages"></today-stepper>
```

Read/write `.value`. Attributes: `value`, `min` (default 0), `max` (default 1,000,000), `step` (minimum 1), `unit`, `label`, `disabled`. Emits `change` with `{value}` for user changes; assigning `.value` updates without emitting. Values clamp to bounds, and each direction disables at its limit. The host persists actual data.

Tap releases one change. Hold starts after 350 ms and repeats every 105 ms, matching `StepperPress` in the app. A repeated press never adds a release tap. Leaving the target, pointer cancellation, focus loss, backgrounding or removing the component cancels its timer. Native keyboard activation still works. Numbers settle over 180 ms, with the current animation canceled when a newer value arrives.

## Motion and sizing

Press feedback mirrors `TodayPressStyle`: 130 ms at cubic-bezier(.22,.76,.28,1), scaling the rendered content to .96 for actions, .90 for round controls and .98 for rows. Day controls fade instead. Hit areas stay fixed. Reduced motion uses opacity instead of movement. The controls honor the operating system and the library's `data-reduced` / `data-motion-override` contract. The stepper uses .91 press scale as in the app's counter.

Default button surfaces reuse the app's neutral Save log gradient, graphite and lavender selection. Override `--today-control-*` custom properties at a container to apply a deliberate theme. Interactive targets remain at least 44 × 44; original icon artwork stays at its original dimensions inside those targets.

## Source map

- Figma section `321:484`: HomeIcon, HabitsIcon, ActivityIcon, ReadingIcon, Chevron, Close, DoubleChevron, Pencil, PlannedDay, DayOff.
- App `Today/Theme.swift`: PrimaryButton, RoundButton, SmallAction, ProfileButton, TodayPressStyle, PlanDot.
- App `Today/HomeMotion.swift`: standalone AddHabitButton.
- App `Today/LoggerInteractions.swift`: bounded amount and hold/cancellation behavior.
- Existing library: approved dropdown, plan-button, nav, counter and widget behaviors.

This is a self-contained browser implementation of these controls. Native originals remain in the app project and are not advertised as an independently importable SwiftUI package here.

## Segmented selection

The approved AM/PM pattern is now a generic two-or-more-option component, also used for the three schedule presets. `today-period-pill` composes this same implementation.

```html
<today-segmented-control label="Schedule presets" value="weekdays">
  <option value="daily">Every day</option>
  <option value="weekdays">Weekdays</option>
  <option value="weekends">Weekends</option>
</today-segmented-control>
```

Read/write `.value` or the `value` attribute. User selection emits `change` with `{value}`; programmatic changes do not. Options are configured before mounting. `disabled` disables all targets. Empty/unknown value shows no selected option, useful when individual weekdays form a custom schedule. Arrow keys, Home and End move selection and focus. The shared inset highlight moves over 440 ms; reduced motion settles immediately. Buttons remain at least 44 px high. Fit labels within the available width rather than shrinking touch targets; this schedule bar and its weekday row share the same width.
