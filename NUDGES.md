# Party nudge UI and motion

Three reusable browser layouts in `nudges.html` and the main component library, each shown with the **send button beside the slider**:

- **Message card** (`variant="card"`, default): recipient, two message choices, then send.
- **Avatar pulse** (`variant="pulse"`): one visible “Reading tonight?” message, one confirmation ring from the recipient.
- **Compact action** (`variant="compact"`): compact recipient and message with a full-width action for party/detail placement.

These are proposals, not a newly selected direction. The existing party detail and standalone nudge specimen now use the default card.

## Reuse

Load the CSS for `components/party-avatars`, `components/slide-to-log`, `components/target-feedback`, and `components/party-nudge`; then their JavaScript in that order. The source manifest lists the exact files.

```html
<today-party-nudge variant="pulse" interaction="button"></today-party-nudge>
<today-party-nudge variant="pulse" interaction="slide"></today-party-nudge>
```

Assign `.model = {id, name, person, window, state}`. `person` uses the shared avatar model. Default window is a sample “8–9 PM”, not computed eligibility. States: `available`, `sending`, `sent`, `muted`, `window`, `limit`, `error`.

The component emits `party-request` with `{action:'nudge-reading'|'nudge-encourage', id, message}`. It immediately latches `sending` before emitting the request, keeps sending/sent actions unavailable, and supports retry after host-confirmed failure. Hosts should accept the emitted request while the element is already `sending`, then assign `sent` or `error` after the operation settles. It sends nothing itself. The host must check recipient permission/window, app-wide quiet hours and at most one incoming nudge per habit per day across the entire party; enforce these atomically and idempotently on the server. No scheduling is implied outside the window. A sent state is not a read receipt.

`interaction="slide"` (default) reuses `today-slide-log mode="send"` in all three layouts. Drag fully to the end and release, press Enter/Space on the handle, or use “Or tap to send.” Partial drags, Escape, pointer cancellation, blur and leaving the vertical drag zone return to the start without requesting a send. Pending holds the handle at the end; failure returns it to the start with “Slide to retry.” Blocked states are unavailable. A confirmed send cannot be undone by this control.

`interaction="button"` restores the send button with its press response, arrow, and confirmed check. Tap or press Enter/Space. It uses the same sending, retry, unavailable and sent states as the slider, retaining focus while busy. Set the interaction before mounting; both controls share the same host API and once-only confirmation.

Only the host transition `sending` → `sent` plays the shared **Gradient Rise**: 900 ms, stronger blue/lavender/peach fill settling at 72% paint opacity. The check settles over 640 ms; Pulse also has one outward 800 ms ring. Reset/removal of confirmed state retreats over 640 ms from the current painted frame. Initial sent fixtures show the settled gradient without replay. Reduced motion shows the final state immediately. No idle loop or repeat celebration when a sent model is reapplied.

`nudge-confirmed` is available for one native success haptic, subject to platform/user accessibility preferences. There is no app-level Haptics setting in the selected profile. Browser previews do not provide verified iPhone haptics. Actions retain focus with disabled/busy semantics; card message choices support arrow keys.

`nudge-study.js` is the local demo host, with a 650 ms simulated response, failure/retry, availability fixtures, and revision guards against outdated completions after reset. It never sends a notification. `habit-party-study.js` remains a separate fixture host for the larger party context.

The new component replaces the former `PartyNudge` class inside `habit-party.js`. Load the new file when adopting updated party specimens. All other party components remain unchanged.
