# Habits tab — three layout proposals

[Compare A/B/C](habits-layouts.html) · [Browser source](components/habits-layout.js) · [Styles](components/habits-layout.css)

The user requested layout variations, not a change to the approved flow or product lifecycle. These browser mockups use the same six fictional habits and the existing Today artwork, segmented pill, 600 ms disclosure and Center cradle navigation. No native app code or saved habits are changed.

## Three layouts

| Direction | Structure | Useful when |
| --- | --- | --- |
| A · Illustrated list | Generous illustrated rows grouped into Ready to reflect, In your rhythm and Paused | Recommended starting point: preserves the PRD’s illustrated direction while making states clear |
| B · Habit gallery | Two-column artwork cards; Active, Review and Paused filters; review reminder within Active | Artwork-led browsing and a smaller collection |
| C · Quiet index | Compact rows with small artwork and clear state groups | More habits need to remain easy to scan |

Archived habits stay available from a separate entry in every layout. Tap a habit to see its detail-entry state. This is a lightweight layout demonstration, not a complete habit-detail implementation.

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

Load the `habits-layouts` dependency entry in `components.json`, then mount `<today-habits-layout variant="a"></today-habits-layout>` (or `b` / `c`). These are fixed-fixture design proposals. To use them in production, replace fixtures with the app’s authoritative lifecycle model and route the entry actions to history/detail. `habits-study.js` and `habits-study.css` are the comparison gallery only.

Each composition uses a scrolling body above fixed cradle navigation. Filters, rows, archive and Back work by keyboard. Disclosure follows the shared reduced-motion preference.
