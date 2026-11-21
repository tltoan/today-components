# Habits tab — Weekly view selected

[Compare A/B/C](habits-layouts.html) · [Browser source](components/habits-layout.js) · [Styles](components/habits-layout.css)

The user requested layout variations, not a change to the approved flow or product lifecycle. These browser mockups use the same six fictional habits and the existing Today artwork, segmented pill and Center cradle navigation. No native app code or saved habits are changed.

The selected direction is **C · Weekly view**. A and B remain available for comparison. Mounting the component without `variant` now defaults to C.

## Three layouts

| Direction | Structure | Useful when |
| --- | --- | --- |
| A · Plan cards | Full-width illustrated cards with larger type, one status line and artwork at the trailing edge | Scan active plans without a dense two-column grid |
| B · Habit shelf | One large featured habit, a small habit selector, then remaining plans | Give the artwork and one plan more room |
| C · Weekly view | One card per habit with its seven-day schedule shown directly | Compare the rhythm of multiple plans |

Archived habits stay available from a separate entry in every layout. Tap a habit to replace the list with its detail-entry state; Back returns to the collection. The former inline detail block is removed. This is a lightweight layout demonstration, not a complete habit-detail implementation.

## PRD mapping

Today PRD Draft 0.4 (November 19, 2026), §8–9, is the source for these states:

- Habits is the collection and history entry point; Today remains the place for daily logging. There are no new quick-log actions in these layouts.
- Active trials and routines have distinct status text. An ended trial shows **Reflection needed**, keeps history and does not silently continue scheduling or reminders.
- Pause is temporary and removes the habit from current due work. Archive stops active tracking while retaining history. Delete remains a separate action; there is no new “sunset” state.
- Lifecycle changes belong in Edit. The cards do not add destructive or ambiguous one-tap lifecycle controls.
- Personal plan changes remain dated. Changing target, tracking method, weekdays or duration is not implemented by these layout mockups.
- The central + remains independent, as previously requested.

The sample collection is reading (ended), water (active trial), stretch and vitamins (routines), walking (paused) and meditation (archived). Layouts change presentation only. No friends’ states, shared streaks, invented performance scores or new recap colors are introduced.

## Reuse

Load the `habits-layouts` dependency entry in `components.json`, then mount `<today-habits-layout variant="c"></today-habits-layout>` (or `a` / `b`). These are fixed-fixture design proposals. To use them in production, replace fixtures with the app’s authoritative lifecycle model and route the entry actions to history/detail. `habits-study.js` and `habits-study.css` are the comparison gallery only.

Each composition uses a scrolling body behind floating cradle navigation. The navigation wrapper is transparent, with no black footer or scrim. Bottom scroll padding lets the final card and archive entry clear the cradle, and keyboard focus scrolls controls above it. Filters, rows, archive and Back work by keyboard. Transitions follow the shared reduced-motion preference.

## November 21 sizing correction

The first three proposals were rejected and replaced with the directions above. Each design uses a 390 × 844 CSS-pixel reference frame (logical-point composition), including a 47 px top safe-area illustration and bottom home-indicator clearance. This is one reference size, not a universal iPhone specification or native validation. The library uses auto-fit columns with a 390 px minimum when available, so a 1020 px section wraps to two previews rather than squeezing three to about 324 px. Narrow browsers adapt the frame to available width and keep inner content scrollable behind the transparent navigation wrapper. Native safe areas, Dynamic Type and actual device classes still need native verification.

November 21 follow-up: Weekly view is the main example; Plan cards and Habit shelf remain behind “Compare previous Habits layouts”.
