# Party nudge UI and motion

Three reusable browser directions in `nudges.html` and the main component library:

- **Message card** (`variant="card"`, default): recipient, two message choices, explicit Send nudge.
- **Avatar pulse** (`variant="pulse"`): one visible “Reading tonight?” message, one confirmation ring from the recipient.
- **Compact action** (`variant="compact"`): compact recipient and message with a small send capsule for party/detail placement.

These are proposals, not a newly selected direction. The existing party detail and standalone nudge specimen now use the default card.

## Reuse

Load `components/party-avatars.css`, `components/party-nudge.css`, then `components/party-avatars.js`, `components/party-nudge.js`.

```html
<today-party-nudge variant="card"></today-party-nudge>
```

Assign `.model = {id, name, person, window, state}`. `person` uses the shared avatar model. Default window is a sample “8–9 PM”, not computed eligibility. States: `available`, `sending`, `sent`, `muted`, `window`, `limit`, `error`.

The component emits `party-request` with `{action:'nudge-reading'|'nudge-encourage', id, message}`. It latches a request until the host supplies a model, keeps sending/sent actions unavailable, and supports retry after host-confirmed failure. It sends nothing itself. The host must check recipient permission/window, app-wide quiet hours and at most one incoming nudge per habit per day across the entire party; enforce these atomically and idempotently on the server. No scheduling is implied outside the window. A sent state is not a read receipt.

When the host changes `sending` to `sent`, a 640 ms check settles and an 800 ms confirmation accent plays once. Pulse uses a single outward ring; card/compact use a restrained surface press/release. The `nudge-confirmed` event is available for one native success haptic, respecting the user's haptic setting. Browser previews do not provide verified iPhone haptics. No repeated idle motion; reduced motion displays the final check directly. Native buttons retain focus and explicit disabled/busy semantics. Card choices support arrow keys.

`nudge-study.js` is the local demo host, with a 650 ms simulated response, failure/retry, availability fixtures, and revision guards against outdated completions after reset. It never sends a notification. `habit-party-study.js` remains a separate fixture host for the larger party context.

The new component replaces the former `PartyNudge` class inside `habit-party.js`. Load the new file when adopting updated party specimens. All other party components remain unchanged.
