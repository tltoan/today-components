# Private habit parties — components and state map

Design proposal from the November 21 discussion. Browser mockups are now available in [habit-parties.html](habit-parties.html), including Home and habit-detail contexts. This is not production sharing or an approved addition to the PRD. First version: four people total, including you, attached to one selected habit. Everyone follows the same scheduled days. Targets, recorded amounts and reminder preferences remain personal.

## Product state map (includes future coverage)

| Component | Placement and existing parts to reuse | States to compare |
| --- | --- | --- |
| Party entry row | Habit detail below the personal plan: up to four avatars, “Read together”, latest shared check-in, chevron. Reuse the navigation row and artwork. | Not shared / invite pending / two people / full at four / no shared check-ins / recent activity / muted. |
| Invite and join sheet | Habit name/artwork, up to three invitation slots, short sharing-scope summary, Join / Not now. Reuse buttons, disclosure and selected plan cards. | Sending / sent / retry / expired or revoked invite / party full / already joined / own-plan confirmation. |
| Your plan within a party | Reuse tracking, target controls and the shared schedule. Each person can track a different unit. | Existing habit linked / new personal plan / shared schedule changed / paused / trial ended. Personal target and reminder edits do not alter friends’ plans. |
| Shared check-in card | Name, timestamp, self-contained entry such as “Read 5 pages”, optional image and small reaction row. Keep the personal Target met gradient on the owner's private card. | Text only / photo / partial amount / target reached / explicit none / edited / removed / loading / retry. No rankings; the party summary separately shows how many members logged. |
| Post-log share/photo composer | After a saved group-habit log: the log is shared automatically. “Add a photo” attaches optional media to that shared log. | Shared log / photo draft / uploading / photo saved / failed upload / retry / remove photo. A photo failure cannot undo the log. |
| Reaction and nudge controls | Profiles with heart badges on a check-in; preset messages in a nudge sheet. Reuse buttons, pill selection and time controls. | Available / sending / sent / failed / muted / outside reminder window / daily limit reached. Do not show whether someone ignored a nudge. |
| Party settings | Members, sharing scope, nudge permission/window, leave party. Reuse switches and disclosure rows. | Enabled / muted / permission denied / member left / remove member / leave confirmation. Historical photo/log visibility after leaving needs a product decision. |

## Changes to current components

- **Home habit card:** optional avatar row or upper-right border placement linking to that habit's party. Keep logging primary. Do not add a feed, group score or friends’ statuses to every card. The overall logging streak remains private and outside this row. A separate shared scheduled-day streak appears only inside the party.
- **Habit detail:** add the party entry row and a compact preview of recent shared check-ins. Tapping opens the party's photos, logs and reactions. Preserve the owner's target, history and corrections.
- **Log success:** joining authorizes automatic sharing of new logs for that habit. State this before Join. Photos remain an optional attachment. A failed share stays pending for retry; it must not masquerade as a private-only choice.
- **Saved/logged states:** separate “Logged”, “Shared with your party” and “Photo upload failed”. They represent different operations.
- **Notifications:** add controls for party nudges separately from personal reminders. Proposed cap is one incoming nudge per habit per recipient per day across the party, not one per sender. The host must enforce this and use the recipient's window/timezone.
- **Privacy:** share new logs of the selected party habit automatically; attach photos only when chosen. Do not expose other habits, private notes, overall streak, or past logs automatically. No photo is required for a valid log.

## Motion

- Keep the approved 600 ms disclosure for expandable rows and sheets where applicable.
- A confirmed reaction can gently press and settle once. Do not animate friends’ avatars continuously.
- A shared check-in can enter with a short fade and small vertical settle after confirmation; failures keep the draft in place.
- Upload progress is separate from the saved-log state. Reduced motion uses instant state changes or a quiet opacity change.
- Shared streak changes settle once; no idle fireworks, countdown pressure or alerts announcing that someone is falling behind.

## Recommended first comparison

Mock up three connected situations before polishing every empty state:

1. Invite one friend from an existing reading habit, then let them join with minutes instead of pages.
2. Log a partial amount, optionally attach a photo, and receive one reaction. Include a failed photo upload while the log remains saved.
3. Send a gentle nudge; show what the sender sees when nudges are muted, outside the window or already used for that day.

Open product decisions: who can invite/remove members; invite expiry; previous-post visibility after leaving; delete/export behavior; whether outside-window nudges queue or stay unavailable (recommend unavailable with a clear next window, avoiding surprise delivery). These are proposals, not silently assumed rules.

## Implemented browser pieces

Load the ordered dependencies from `components.json`. The core invite, entry, check-in, composer and settings elements are in `components/habit-party.js`; nudges and the room are independent modules. They are controlled components: assign `.model` with confirmed state, listen for bubbling `party-request`, then update the model after the host accepts the operation. No component sends or saves anything itself.

| Element | Model fields | Requests / demonstrated states |
| --- | --- | --- |
| `today-party-entry` | `id`, `members:[{id,name,initials,self,photoURL,gradientIndex}]`, `title`, `summary`, `placement: inline|stack|capsule|lead`; optional `compact` attribute | `open`; recent check-in and empty copy |
| `today-party-checkin` | `memberID`, `name`, `initials`, optional `profilePhotoURL`, `time`, `amount`, `note`, `viewer`, `reactors:[{id,name,initials}]`, `reacted`, optional `photoURL`, `photoAlt` | `react`; text, sample attachment, avatar-heart on/off with a single 540 ms settle; optional `compact` presentation |
| `today-party-composer` | `members`, `amount`, `state`, `message`, optional photo | `photo` (includes File), `remove-photo`, `share` (photo only), `retry-sync`; shared, photo-draft, uploading, photo-saved, photo-error and sync-error |
| `today-party-nudge` | `name`, `window`, `state` | `nudge-reading`, `nudge-encourage`; available, muted, window, limit, sending, sent, error |
| `today-party-invite` | `members`, `plan:'pages'|'minutes'`, `state`, `message` | `plan` with `value`, `join`, `decline`; invite, joining, joined, full. `variant="b"` (default): selected Book cover; d Shared cover and e Reading circle are new alternatives; a/c retained historical sources |
| `today-party-settings` | `allowed`, `window`, `message` | `nudges` with `allowed`, `leave`; local switch and leave confirmation in gallery |

All requests include `{action,id}`. Models are copied when assigned. Names, text and image attributes are escaped. The sample photo renderer accepts only local blob/data-image previews; a production host needs an authenticated media URL policy. `samplePhoto:true` renders Today’s existing book illustration explicitly labeled **Sample attachment**; it is not presented as a real member’s photograph.

`today-habit-card` accepts optional `party:{id,members,title,summary,placement}`. Omit placement for the compact entry below the log action; use selected stack for an upper-right rim overlay. Historical capsule/lead placements are retained; new compact cards use the independent lead component inside their bounds. Load the party files before using that option. Only reading belongs to the party in the Home sample; water and stretch remain private. The overall Today streak stays outside cards and never enters the feed.

`habit-party-study.js` supplies fictional people, save/share acknowledgements and invite transitions. Group reading logs appear in the feed automatically after the simulated save. The photo composer starts from “Shared with Maya & Sam”; it never offers Keep it private. Undo removes that log from both the personal total and the shared feed, and removes its attached image from the rendered feed. This is a local proposal for correction propagation, not a claim of server delivery. Joining with 15 minutes keeps the other members’ plans unchanged.

The November 21 follow-up explicitly supersedes the earlier optional sharing proposal. Do not restore a per-log private choice for a party habit. Existing history is not retroactively shared by these mockups. Other habits, personal notes and Today’s overall streak remain private.
Photo selection is local only, limited to images below 8 MB by the demo controller; no upload occurs. The failure example retains the draft and confirmed shared log. The caller can retry. Photos remain optional. The gallery demonstrates local recipient availability and a one-nudge sent state; production must enforce the per-recipient cap across the party and timezone/window checks on the server.

The state map above includes unimplemented future states such as invite expiry, revoked access and post-removal policy. Do not infer those features from the specimens. Membership authorization, photo deletion/retention, moderation, invite management, delivery and persistence still require product decisions and implementation.


## Latest selections · November 21

Party maximum: **four people including you**. The main three-person fixture stays valid; the independent avatar pieces show all four. Invite open/full counts are computed for four. The host must enforce capacity atomically; these are local previews.

- Home/detail: selected overlapping stack on the upper-right rim, with stable varied gradients for absent/failed photos.
- Independent `today-avatar-stack` and `today-lead-avatar`, plus `today-profile-avatar`, live in `components/party-avatars.*`. Matching SwiftUI is `native/TodayPartyAvatars.swift`. Read [PARTY-AVATARS.md](PARTY-AVATARS.md). Keep stable member IDs consistent across check-ins and entries.
- The lead example is inside a 158 × 158 compact specimen. It does not claim native WidgetKit validation. Do not cross the outside edge in a widget.
- Book cover (b) remains selected. Two new live comparisons are Shared cover (d), with layered surfaces and overlapping book/profile elements, and Reading circle (e), showing all four party places. All three share the same plan choices, sharing scope, capacity and join/full states. Personal note / orbit sources are historical only.

Nudges now live in components/party-nudge.js and components/party-nudge.css; load them independently before the study. See NUDGES.md and nudges.html for three placement proposals, each comparing `interaction="button"` with `interaction="slide"` and the same confirmed Gradient Rise. No notifications are sent.

## Current compact party composition

See [PARTY-ROOM.md](PARTY-ROOM.md) for `today-party-room`, `today-party-activity`, `today-party-reactions` and the separate planning proposal `today-party-setup`. The room replaces the old single-Maya feed and nudge panel in both Home/detail contexts and the selected habit-detail dialog. Tap any member to inspect their target and activity or nudge that recipient. The feed shows one person/day total, expanded into original entries and their own avatar reactions.

The shared streak is now explicitly approved: shared scheduled days only, every eligible member has a saved log, days off unchanged. This supersedes the earlier no-shared-streak proposal. The overall Today streak remains private on Home. Trial reviews staying individual and party creation from plan review are mock proposals, not settled lifecycle policy.


### Compact invitation and proposed entry

Book cover (b) keeps its illustration in a shorter cover. The host supplies `schedule`, `proposedDates` (display text) and `members[].target`; omitted facts render as unconfirmed, never fabricated. The fixture is Sun/Tue/Thu, Nov 22–Dec 12, with Maya at 15 minutes and Sam at 10 pages. Dates are a proposed invitation window, not an approved shared trial lifecycle. The invitee chooses their personal target and confirms Join. Only this habit’s logs are shared, with optional photos.

Proposed location: an Invitations row above the Habits plan list. Notification/deep-link entry should open the same invite; Profile remains identity/settings. The library row links to the standalone invitation specimen; it does not represent a working invitation inbox.
