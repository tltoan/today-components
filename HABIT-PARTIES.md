# Private habit parties — proposed component and state map

Design proposal from the November 21 discussion. This is not an implemented feature or an approved addition to the PRD. First version: three people total, including you, attached to one selected habit. People share the habit intention while keeping their own targets and schedules.

## First mockup set

| Component | Placement and existing parts to reuse | States to compare |
| --- | --- | --- |
| Party entry row | Habit detail below the personal plan: up to three avatars, “Read together”, latest shared check-in, chevron. Reuse the navigation row and artwork. | Not shared / invite pending / two people / full at three / no shared check-ins / recent activity / muted. |
| Invite and join sheet | Habit name/artwork, two invitation slots, short sharing-scope summary, Join / Not now. Reuse buttons, disclosure and selected plan cards. | Sending / sent / retry / expired or revoked invite / party full / already joined / own-plan confirmation. |
| Your plan within a party | Reuse tracking, target and schedule controls. “Same habit. Your own pace.” Each person can track a different unit. | Existing habit linked / new personal plan / schedule changed / paused / trial ended. Personal settings do not alter friends’ plans. |
| Shared check-in card | Name, timestamp, self-contained entry such as “Read 5 pages”, optional image and small reaction row. Keep the personal Target met gradient on the owner's private card. | Text only / photo / partial amount / target reached / explicit none shared by choice / edited / removed / loading / retry. No rankings or a group completion bar. |
| Post-log share/photo composer | After a successful private log: optional “Share a check-in” and “Add a photo”, with recipient avatars. The log is already saved. | Skip sharing / private only / preview / uploading / shared / failed upload / retry / remove photo. A photo failure cannot undo the log. |
| Reaction and nudge controls | A quiet reaction chip on a check-in; preset messages in a nudge sheet. Reuse buttons, pill selection and time controls. | Available / sending / sent / failed / muted / outside reminder window / daily limit reached. Do not show whether someone ignored a nudge. |
| Party settings | Members, sharing scope, nudge permission/window, leave party. Reuse switches and disclosure rows. | Enabled / muted / permission denied / member left / remove member / leave confirmation. Historical photo/log visibility after leaving needs a product decision. |

## Changes to current components

- **Home habit card:** optional compact avatar row linking to that habit's party. Keep logging primary. Do not add a feed, group score or friends’ statuses to every card. The overall logging streak remains private and outside this row.
- **Habit detail:** add the party entry row and a compact preview of recent shared check-ins. Tapping opens the party's photos, logs and reactions. Preserve the owner's target, history and corrections.
- **Log success:** save privately first; sharing is a separate, clearly addressed action. Partial activity deserves the same opportunity for encouragement. Show who will see the post before confirming.
- **Saved/logged states:** separate “Logged”, “Shared with your party” and “Photo upload failed”. They represent different operations.
- **Notifications:** add controls for party nudges separately from personal reminders. Proposed cap is one incoming nudge per habit per recipient per day across both friends, not one per sender. The host must enforce this and use the recipient's window/timezone.
- **Privacy:** share only the selected habit and explicitly shared entries/photos. Do not expose other habits, private notes, overall streak, or past logs automatically. No photo is required for a valid log.

## Motion

- Keep the approved 600 ms disclosure for expandable rows and sheets where applicable.
- A confirmed reaction can gently press and settle once. Do not animate friends’ avatars continuously.
- A shared check-in can enter with a short fade and small vertical settle after confirmation; failures keep the draft in place.
- Upload progress is separate from the saved-log state. Reduced motion uses instant state changes or a quiet opacity change.
- No shared-streak fireworks, countdown guilt, empty-avatar pressure or alerts announcing that someone is falling behind.

## Recommended first comparison

Mock up three connected situations before polishing every empty state:

1. Invite one friend from an existing reading habit, then let them join with minutes instead of pages.
2. Log a partial amount, optionally attach a photo, and receive one reaction. Include a failed photo upload while the log remains saved.
3. Send a gentle nudge; show what the sender sees when nudges are muted, outside the window or already used for that day.

Open product decisions: whether ordinary logs share automatically after joining or only by explicit action (recommend explicit sharing for the first version); who can invite/remove members; invite expiry; previous-post visibility after leaving; delete/export behavior; whether outside-window nudges queue or stay unavailable (recommend unavailable with a clear next window, avoiding surprise delivery). These are proposals, not silently assumed rules.
