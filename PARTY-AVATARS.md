# Party avatars

[Independent specimens](habit-parties.html#party-avatar-components) · [SwiftUI](native/TodayPartyAvatars.swift)

A party supports **four people total, including you**. The selected app-card placement is the overlapping stack at the upper-right rim. Lead avatar + remaining count is an independent alternative for compact cards; keep its complete bounds inside widget margins.

## Shared data and stable gradients

```js
const members = [
  {id:'You',name:'You',initials:'AT',self:true},
  {id:'Maya',name:'Maya',initials:'MK',photoURL:null},
  {id:'Sam',name:'Sam',initials:'SL'},
  {id:'Jordan',name:'Jordan',initials:'JR'}
];
document.querySelector('today-avatar-stack').members = members;
document.querySelector('today-lead-avatar').members = members;
```

Use stable user IDs from the host, not names or array positions. Name fallback exists only for older gallery fixtures. FNV-1a32 over UTF-8 ID, modulo six palettes, is identical in JS and SwiftUI. Swift uses overflow multiplication `&*`, never `hashValue`. Optional `faceStyle` selects one of the seven faces and `gradientIndex` (0–11) preserves the chosen picker color. The six-color hash remains the fallback for identities without a chosen portrait. Reordering does not change colors. Different IDs can share one of six palettes; they never receive a new random palette on render.

A real photo covers the gradient once loaded. Missing/loading/failed photos show the saved still face, or initials when no face is selected, on the chosen gradient. No idle animation. Profiles are decorative inside an accessible, labelled host button, with at least 44-point hit area. Noninteractive standalone pieces expose member names.

## Browser

Load `components/party-avatars.css` and `components/face-picker.css`; scripts in order: `party-avatars.js`, `face-palettes.js`, `minimal-face-motion.js`, `minimal-face.js` from `components/`. Tags: `today-profile-avatar` (`.person`), `today-avatar-stack` and `today-lead-avatar` (`.members`). JSON `person` / `members` attributes also work. `size` defaults36 (24–96); `lead-id` optionally chooses the leading member, otherwise the first non-self member. Stack/lead cap display at4; this is not server membership enforcement. These primitives do not open a party themselves; the host owns action semantics.

## SwiftUI

Copy `native/TodayPartyAvatars.swift`, `native/TodayFacePicker.swift` and `native/PlayfulFaces.swift`. Member fields include optional `faceStyle`, `gradientIndex`, `photoData` and `photoURL`:

```swift
let people = [
    TodayPartyMember(id: "You", name: "You", initials: "AT", isYou: true),
    TodayPartyMember(id: "Maya", name: "Maya", initials: "MK")
]
TodayAvatarStack(members: people, size: 36)
TodayLeadAvatar(members: people, size: 36)
TodayProfileAvatar(member: people[0], size: 36)
```

For navigation, wrap in `Button` and provide the party label. These are standalone native pieces; app/WidgetKit integration and Dynamic Type runtime checks remain separate.

Profile cards use a softer 1 px lavender rim at 14% opacity: `--pa-rim:#dac8ee24; --pa-rim-width:1px`. Stacks retain the darker separating rim. Native counterpart: `TodayProfileAvatar(member: member, size: 56, rim: Color(red: 218/255, green: 200/255, blue: 238/255).opacity(0.14), rimWidth: 1)`.

Use one confirmed identity store for the current user. The gallery resolver replaces only canonical self IDs; a friend with the same display name is unaffected. [PROFILE-IDENTITY.md](PROFILE-IDENTITY.md) covers browser/native persistence and cancellation.

## Photo-like badges

The selected photo check-in carousel reuses `<today-avatar-stack badges="heart" size="34">`. Assign only confirmed reacting members to `.members`; the existing stable identity, palette, photo and overlap rules remain unchanged. Each portrait gets a small heart badge below it. `today-party-reactions variant="stack"` provides this stack plus the separate Like/Liked request button. Badges are a browser addition; native avatar source is unchanged.
