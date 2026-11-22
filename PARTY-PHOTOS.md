# Shared check-ins: selected photo carousel

[Open the component](party-photos.html). **B / On the photo is selected** for the Shared check-ins surface and now used by browser party rooms. The amount sits at the image’s bottom-right, opposite the person and time. The visible photo count is removed; assistive technology retains position announcements. Earlier Photo journal and Filmstrip variants have been removed. The superseded date-first feed has also been removed. Native app integration and backend capabilities remain separate.

The selected carousel reuses Today avatars, confirmed identity, avatar-heart reactions and shared disclosures. The shared controller now accepts `axis:'x'` and `fade:false`; its existing vertical defaults remain the same. Swipes, horizontal trackpad gestures, buttons and keyboard navigate the photo entries with the existing 680 ms settling curve. Vertical gestures remain available for scrolling the containing page. There is no autoplay or additional CSS snap controller. Reversal starts from the current scroll position, and reduced motion settles immediately.

## Model and integration

Load the ordered scripts and styles in the `party-photo-carousel` entry of `components.json`. Assign the same controlled party model described in [PARTY-ROOM.md](PARTY-ROOM.md):

```html
<today-party-photo-carousel variant="overlay"></today-party-photo-carousel>
```

```js
carousel.model = {
  today: '2026-11-17', viewerID: 'self',
  members: [{id:'self', name:'You'}, {id:'maya', name:'Maya'}],
  entries: [{id:'entry-1', memberID:'maya', date:'2026-11-17',
    amount:15, unit:'min', time:'8:12 PM', order:1, saved:true,
    photoURL:'https://your-host.example/check-in.jpg',
    photoAlt:'An open book on a reader’s lap', reactorIDs:[]}]
};
```

`memberID` optionally filters the feed to one member. One slide is one original log: never substitute a daily aggregate or somebody's personal target. Stable entry IDs retain the current photo across host updates. Photos sort newest date first, then descending `order`, matching the activity feed. Date, amount, unit and author remain attached to that entry. Saved zero is shown as zero; null, non-finite, negative, future and explicitly unsaved amounts are omitted. Repeated entry IDs are deduplicated.

Entries without a photo remain available under **Check-ins without photos**, using the shared disclosure. An empty photo collection shows an empty state without hiding those logs. Failed images preserve the same footprint, author, date and confirmed quantity. The host supplies durable photo URLs; accepted sources are HTTP(S), blob URLs, image data URLs and the repository's `assets/` paths. Object URL lifetime and actual image loading/persistence belong to the host.

Photo likes use `today-party-reactions variant="stack"`, which reuses `today-avatar-stack badges="heart"`. Each confirmed reacting person appears in the overlapping stack with a heart badge; the separate Like/Liked button toggles the viewer. No unconfirmed person appears in the stack. The same 540 ms confirmation feedback is retained and does not replay merely when changing photos.

Reactions emit the existing bubbling `party-request {action:'react', id:entryID}`. They change only after the host supplies updated `reactorIDs`. Reactions never change the carousel position or aggregate logs. Offscreen slides are inert and hidden from assistive technology. Left/Right, Home/End and Page Up/Down work when the carousel viewport is focused; all arrows are at least 44 px targets. No photo click opens an additional modal.

## Fixture boundary

`party-photo-study.js` and `party-room-demo.js` are gallery-only. The four supplied images in `assets/party-samples/` are reused without editing. Assignment to You, Maya and Sam is fictional and does not identify the people pictured. Everyone/individual filters, no-photo/broken-photo/zero examples and reactions are local preview state. The host owns production writes, photo access, timezone policy, eligibility and persistence.

Browser verification is recorded in README.md after this revision's checks. Native app integration remains separate.


## Current logging update

Latest: only the selected overlay remains; earlier carousel variants and the old standalone check-in card have been removed. A saved entry may include `note`, shown verbatim below its selected image (or in the no-photo entry). Party notes are shared by default. The photo action selected afterward is the circular icon on the same row as logging; see [LOG-NOTES.md](LOG-NOTES.md).
