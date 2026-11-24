# Missed-day check-in · Selected

November 23, 2026: after reviewing the UI and the explanation of when it appears, the user approved this direction and requested the updated native implementation prompt. **The compact card and its Home placement are selected.** This supersedes the earlier no-snooze decision and exploration-only hold. Native integration is still pending; every approved launch feature remains in scope.

The check-in becomes eligible after three consecutive closed scheduled days without a report, then appears on the next safe Home opening **above the habit cards**. Days off do not count; today stays open; partial/zero/None today are reports. Show once per missing-report run. An explicit Remind me later choice permits a postponed check-in; a new saved report before then cancels it. Do not interrupt logging, creation or editing.

Preview: `reminder-checkin.html`, listed in Components. Source: `reminder-checkin-study.js` / `.css`. This is a gallery composition of the existing buttons, original OpenBook artwork, Future typography and shared disclosure controller; it is not a new notification service or native component.

## Selected interaction

- A compact, nonblocking missed-day check-in identifies the habit and offers **View habit** and **Remind me later**. No streak penalty or missed-day counter in the message.
- View habit navigates to the existing habit-detail browser preview. In the app it would route to that specific habit, where logging and plan editing already live.
- Remind me later expands choices in place, using `TodayUI.Disclosure` and the unchanged 600 ms motion contract. The trigger stays visible; tapping it again, Cancel or Escape collapses the choices. Cancelling changes nothing.
- Initial implementation choices follow the accepted preview: **In 15 minutes**, **In 1 hour**, **This evening · 7 PM**. These values originated in the proposal, not a separately specified global default. The browser uses a 10 AM fixture; native must calculate from the real clock. No delay is preselected. Picking one collapses the question into a time confirmation with Undo.
- Close dismisses this check-in only. Undo restores it. Neither dismissal nor postponement changes the ordinary reminder schedule, notification permission, quiet hours, habit plan, logs or streaks.
- The in-app card is the design focus. System notification action presentation and delivery are not simulated or claimed here.

## Boundaries before native implementation

The browser sends no notifications and writes no storage. Its confirmation is sample UI; the native version must show success only after the scheduler confirms the request. An error must preserve the check-in and allow retry without duplicate bookings. Undo must cancel the specific postponed request, not unrelated reminders.

[IMPLEMENTATION-REMINDER-RECOVERY.md](IMPLEMENTATION-REMINDER-RECOVERY.md) is the current native brief. It specifies durable episode identity, cancellation, scheduling confirmation, Undo, existing permissions/quiet hours, no automatic repeated nag, finite queue budgeting and honest platform limits. Initial edge-case defaults: hide an evening time that has passed; make quiet-hour choices unavailable rather than silently shifting them; do not claim success when permission or OS booking is unavailable. Record these as implementation defaults in the native handoff.

The accepted source card is now a selected component. Its library page remains a browser fixture, with no Home mounting, notification delivery or persistence. Native Home placement is specified above and must be verified during implementation. System notification actions use platform styling and the existing route rather than a second custom picker.

## Verification

November 23 browser checks: desktop and 390 × 844 CSS viewport; disclosure expansion, chosen-time confirmation, Undo, Cancel, Escape, dismissal, Enter activation and focus restoration. Measured shared motion is 600 ms layout / 380 ms entering opacity, and 0 ms under the Less motion override. Phone scroll width equals its 390 px viewport. JavaScript syntax and source dependency paths checked. Native notification delivery and simulator behavior are outside this browser study.
