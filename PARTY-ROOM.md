# Party room and compact activity

Browser components and local mockups. No invitations, photos, notifications or logs are sent or persisted. See `components.json` for complete ordered dependencies; `party-room-demo.js` is fixture code only. The existing SwiftUI gradient avatar implementation remains in `native/TodayPartyAvatars.swift`; these new compositions do not yet have native implementations.

## Confirmed product decisions

- Up to four people, including you; stable varied gradient fallback profiles.
- One shared schedule. Each person chooses their target/unit and reminder. New logs for the party habit are shared automatically; photos remain optional.
- A party streak counts consecutive **scheduled days** on which every eligible member has a saved log. Partial and explicit zero amounts count; target attainment is separate. Days off preserve the streak. The current day stays open until its boundary.
- Today’s overall logging streak remains private on Home. This party streak is scoped only to the shared habit.

## Controlled model

```js
room.model = {
  id: 'reading', name: 'Reading party', today: '2026-11-17',
  timezoneLabel: 'New York', schedule: 'Sun, Tue, Thu', viewerID: 'antony',
  members: [
    { id: 'antony', name: 'You', initials: 'AT', plan: '10 pages' },
    { id: 'maya', name: 'Maya', initials: 'MK', plan: '15 minutes',
      window: '8–9 PM', nudgeState: 'available' }
  ],
  // Include every calendar date in the evaluated range, including days off.
  days: [
    { date: '2026-11-15', scheduled: true, memberIDs: ['antony','maya'] },
    { date: '2026-11-16', scheduled: false, memberIDs: ['antony','maya'] },
    { date: '2026-11-17', scheduled: true, memberIDs: ['antony','maya'] }
  ],
  entries: [{ id: 'log-1', memberID: 'antony', date: '2026-11-17',
    amount: 5, unit: 'pages', time: 'Today, 7:36 PM', order: 1,
    saved: true, reactorIDs: ['maya'] }]
};
```

The host supplies the party-local date, schedule coverage, timezone boundaries and dated eligible roster. Missing calendar coverage breaks the calculated run; do not imply a complete all-time streak from a truncated query. A new member does not change earlier rosters. Membership changes, pauses, late joins and retrospective correction policy still need production rules. Never infer eligibility from a UI avatar list.

`TodayPartyProgress.progress(model)` is a pure helper returning `{streak,current,through,days}`. Duplicate logs/member IDs give no extra day credit; `null`, invalid and unsaved amounts do not count. Undo removing the last eligible log recomputes the visible streak. A saved zero counts.

## Reuse and events

| Element | Contract |
| --- | --- |
| `today-party-room` | Selected overlay photo carousel for check-ins. `.model` above. `party-member-change {id}` is local navigation. Member plans show the shared schedule; the selected recipient’s nudge uses that person’s ID/window/state. |
| `today-party-activity` | Same model, optional `memberID` filter. Shows one date card at a time using the shared agenda SnapScroller; compact member summaries expand original entries behind the shared 600 ms disclosure. Swiping, arrows and keyboard navigate dates. Sums compatible units only. |
| `today-party-reactions` | `.model={id,viewer,reactors,reacted}`. Profiles plus heart badges. Own profile toggles a bubbling `party-request {action:'react',id}`. No numeric reaction count is used to invent identities. |
| `today-party-setup` | `.model={name,target,schedule,trial,reminder,party,state}`. `party-setup-change {party}`, `party-request {action:'create',party}`, and `party-request {action:'preview-invite'}`. The host confirms `state:'created'` to show invitation slots. |

Nudge requests bubble from the existing component with recipient ID; see NUDGES.md. The host confirms sent/error independently per person. Do not optimistically claim a delivered nudge. Eligibility and the one-incoming-nudge-per-habit/day cap belong to the host/server.

Reactions animate once (540 ms) after a confirmed state change; streak amounts settle over 500 ms. Reduced motion removes these transforms. Expanded entries keep stable IDs, original amounts, photos and reactions, even as later logs update the daily total.

## Planning and trial proposal

The standalone Plan review mock introduces a **Make this a habit party** switch, followed by an invitation preview after creation. It does not insert a new step into the approved onboarding sequence yet. Friends adopt the party schedule and choose a personal target/reminder.

The proposed lifecycle keeps trial length/review personal: one member’s review would not stop everyone’s party. Shared schedule editing authority, what happens when someone pauses/ends a trial, timezone selection and eligibility changes remain open decisions. The mock does not implement these policies.

## Photo preview and simplified summary

The gallery includes four user-supplied reading photos (`assets/party-samples/`). Compact member rows show a thumbnail on that date; tapping a row expands original entries, full photos and avatar-heart reactions. The fixtures do not identify the people photographed. `revealEntry(id)` selects the entry's date and expands its member group.

The streak card displays the shared streak, current date, a proportional dot and logged/eligible count. The old weekly strip and timezone footer are removed. The host still supplies the party-local day and dated eligibility. People remain selectable; each recipient retains their independent nudge state. Compact nudges omit redundant message/window/success copy, while unavailable and error reasons remain visible.

## Selected photo carousel

**On the photo (B)** now supplies Shared check-ins in browser party rooms: the original image, person/time at bottom-left, amount at bottom-right, and no visible photo count. Likes use overlapping avatars with a heart on each confirmed reactor and a separate Like/Liked action. A/C are behind Compare earlier layouts on [the focused component page](party-photos.html). Read [PARTY-PHOTOS.md](PARTY-PHOTOS.md). The date-first activity remains reusable historical source; native app unchanged.
