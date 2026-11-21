# Selected trial and reminder components

The user selected the **day ruler** with **custom trial length in days** on November 21, 2026. Week cards, inline clock, soft wheels, AM/PM pill and the existing switch are also retained reusable components. Quiet default and clock dial remain historical source variants, outside the live gallery.

[Preview](pickers.html) · [JavaScript](components/pickers.js) · [Styles](components/pickers.css)

## Standalone pieces

| Tag | Value / behavior |
| --- | --- |
| `today-day-ruler` | `value=21`, `min=1`, `max=90`; `change {days}` during scrolling; `ruler-tick {days, major}` at each crossed value |
| `today-trial-days-input` | Same value/bounds; numeric keypad hint; Use length or Enter validates and emits `change {days}` |
| `today-week-cards` | `value=21`, `days="14,21,28"`; selected-state buttons; `change {days}` |
| `today-period-pill` | `value="AM"` or `"PM"`; `change {value}`; arrow keys, Home/End and tap |
| `today-switch` | Existing `components/controls.js`; `.checked` plus `change`; see CONTROLS.md |

All pieces support `disabled`. Configure min/max/preset choices before mounting. Setting `.value` changes presentation without a user change event. Load shared controls/icons and picker CSS/JS in the manifest order; composites also need the shared disclosure foundation.

The ruler's readout updates while sliding. Centered ticks lift gently, and every seventh day retains a taller mark. It has no “Choose when to check in” subtitle. Drag, swipe, tap, arrows, Home and End are supported. Respect reduced motion for count settling and tick scaling.

The `ruler-tick` event is the integration point for native selection haptics. Optional `haptics` requests a brief browser vibration where available; it is not a guarantee of iPhone feedback. Browser vibration has limited availability ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/vibrate)). A SwiftUI port should use selection feedback tied to actual day changes ([Apple](https://developer.apple.com/documentation/swiftui/view/sensoryfeedback(_:trigger:))). Native haptics have not been implemented or device-tested here.

## Phone time editing

Tap Hour or Minute to select its digits and request a numeric keypad. Hour → Minute navigation is explicit; Done validates, normalizes minutes and closes typing **without confirming**. Use this time commits the draft; Cancel/Escape restores the confirmed value. The soft wheels provide a swipe alternative. The AM/PM pill is the same standalone control in the inline editor.

`inputmode=numeric` and `enterkeyhint` are browser hints, not a custom keyboard ([MDN inputmode](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/inputmode)). A native port should use focused fields plus a keyboard toolbar. Browser viewport checks do not prove iOS keyboard or VoiceOver behavior.

## Composite APIs and context

`today-trial-picker variant="ruler|cards|compact" value="21" min="1" max="90"` defaults to ruler and includes custom-entry disclosure. `change` carries `{days}`. Duration does not alter scheduled weekdays. Presets/range are configurable proposal values, not a new product rule.

`today-time-picker variant="inline|wheel|dial" value="21:30"` uses 24-hour HH:mm at its boundary. Only confirmed edits emit `change {value}`. `picker-open` and `picker-cancel` let the host coordinate Continue. `.open()`, `.cancel()` and `.value` support composition. Turning reminders off retains the confirmed time. The host owns permission prompts, timezone, scheduling, persistence and routing. All disclosure motion uses the approved 600 ms foundation.

Source context: Figma trial 299:6535 / 299:6537 / 541:12708 and reminder 529:5326 / 529:5200 / 529:5411. The original creation examples use a 21-day default. The separate approved onboarding comparison deliberately preserves its two-week wording; see ONBOARDING.md. Browser components only; no native app integration is claimed.

The AM/PM wrapper now composes `today-segmented-control` from controls.js. The same control supports three schedule options in onboarding; see CONTROLS.md.

## Independent time editor · November 21

`<today-time-editor value="21:30"></today-time-editor>` is the extracted **Choose a time** soft-wheel panel, with its own [focused preview](time-editor.html) and Picker pieces specimen. It includes Hour, Minute, Period, Cancel and Use this time. It has no reminder switch, onboarding copy, weekday marks or outer disclosure. The wheel variant of `today-time-picker` now consumes this same component.

- `.value` / `value` is a confirmed 24-hour `HH:mm` string (default `21:30`). Wheel changes only edit a private draft. A host value assignment replaces the draft.
- Use this time emits `change {value}` after committing the wheel position. Cancel or Escape restores the confirmed value and emits `picker-cancel {value}`. The standalone editor stays mounted; the host chooses whether to dismiss it.
- `disabled` makes wheels inert and disables actions. Each wheel supports arrows, Home/End, tapping and scrolling. Reduced motion uses immediate settling. Notifications, timezone interpretation and persistence remain host responsibilities.
- Load `components/pickers.js`/`.css`, controls/icons, and the shared disclosure foundation in the manifest order. `time-editor-study.js` is only the standalone demo's confirmation output/reset.

The ruler's numeric readout is centered independently of its “days” suffix. Selected weekly marks (7, 14, 21…) keep their existing 28 px height without the extra 20% selection lift; ordinary marks retain their subtle lift. Weekly emphasis is preserved without crowding the selection capsule.

Soft-wheel labels now grow continuously to 130% at the center, using scroll position rather than waiting for selection to settle. Row spacing stays 44 px. The selection-band lines fade at both ends. The same treatment applies inside the reminder picker and the independent editor.

## Latest selection · November 21

Soft Wheels (`variant="wheel"`) is now the selected time picker, including first-time onboarding and habit detail. Day Ruler + custom entry remains the trial-length choice. Inline clock and week cards remain reusable alternatives. Onboarding duration starts at 21 days; reminders are optional. `today-picker-wheel.commit()` resolves an explicit live tap/key destination before continuing, while free scrolling commits the current position.
