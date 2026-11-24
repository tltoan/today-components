# Next native slice · Missed-day check-in and Remind me later

Updated November 23, 2026 after the user approved the preview and the explanation of when it appears. **This replaces the previous no-snooze brief and the later exploration-only hold.** Implement the missed-day check-in on Home, with View habit, Remind me later, dismissal, confirmation and Undo. The library remains the UI source of truth. All explicitly approved library features remain required before launch; to-dos and their widgets are last in implementation order, not removed from the release.

## Checkout and source authority

Work in `/Users/antony/Desktop/Projects/today`, branch `codex/component-library-migration`. Read the app's `AGENTS.md`, `CHAT-HANDOFF.md`, `design-specs.md`, PRD §5 and `Documentation/PRD/Sources/2026-11-19-product-decisions.md`. Inspect status, recent commits and current code before editing. The latest read-only check found clean HEAD `fcbb872`; preserve any work added since then. Do not reset or restart the app.

Read the current local library at `/Users/antony/Documents/ChatGPT/Apps/today-component-study`:

- `AGENTS.md`, `CHAT-HANDOFF.md`, `INTEGRATION.md`, `LAUNCH-SCOPE.md` and this brief.
- `REMINDER-CHECKIN.md`, `reminder-checkin.html`, `reminder-checkin-study.js/css` and their manifest entry.
- `CONTROLS.md`, `PROFILE.md`, `PICKERS.md`, `HABIT-DETAIL.md`; actual controls, original OpenBook artwork, `foundations/disclosure.js` and `foundations/motion.css`.

Inspect the live preview at `http://127.0.0.1:4320/reminder-checkin.html` (start an unused local port if unavailable; do not stop another agent's server). Current local files include unpublished selections and supersede an older published pin. Record source hashes. Port the composition into shared native UI using existing native library controls, artwork, typography, graphite surfaces and spacing. Preserve the exact 600 ms disclosure curve, entering/outgoing fades, surrounding layout movement, interruption and Reduce Motion. The outer specimen frame, documentation, fixed 10 AM clock and gallery controls are not app UI.

## 1. When the check-in becomes eligible

Use a pure evaluator with injected clock/calendar over confirmed plans, effective per-date schedules and actual entries.

- After **three consecutive scheduled days without any recorded outcome**, a habit becomes eligible. Only closed habit-local dates count. Today stays open until it ends; days off neither count nor break the consecutive scheduled-day sequence.
- Partial logs, explicit zero and None today all count as reports. Missing logs are not evidence that the person did not perform the habit. Three ignored notification banners are not the trigger.
- Example: missing Sunday, Tuesday and Thursday makes the check-in eligible on Friday, at the next safe Home opening.
- Exclude paused, archived, deleted, future and expired-unreflected habits. Use existing lifecycle and dated schedule evidence; do not fabricate eligibility through missing historical coverage. An ended trial retains its reflection route.
- Preserve the existing per-habit recovery/reminder opt-in policy. OS notification permission gates notification scheduling, not an already opted-in in-app check-in. Never ask for OS permission merely because Home appears.

Persist a stable recovery episode identity for each continuous missing-report run. A fourth/fifth miss, relaunch, repeated reconciliation or clock rollback must not create another automatic episode. Model in-app presentation/acknowledgement, booking acceptance and consumption separately; none proves that iOS displayed a banner.

A new saved report ends the current run and cancels pending recovery/postponed requests for that episode. Later genuinely new missing scheduled days can form a new episode. Backfills/corrections that invalidate eligibility cancel it without erasing consumed identities or rearming the same contacted run. Specify and test schedule revisions, pause/resume, new trials/routines, archive restoration, timezone changes and deletions. Do not alter global streak history.

## 2. Approved Home placement and interaction

Place the compact card **on Home, above the habit cards**, within the Habits content. It is nonblocking: preserve the selected date/tab, scroll context, logging controls and unfinished creation/edit/share flows. If Home is not safely visible, wait; do not force a tab change or present a modal over another task. Do not implement the deferred to-do space to place this card.

Use the approved card structure:

- The actual habit name, its artwork and current target/schedule; adapt to check-off and other trackers, not only reading.
- “Would a smaller plan fit your week better?” and “You can pick up where you left off, or adjust what you planned.” Keep the neutral tone; no failure language or streak penalty.
- **View habit** opens the existing detail for that habit, where logging and date-effective editing already work. Acknowledge the check-in and cancel its still-pending automatic recovery alert. Do not create a log or change a plan from this action.
- **Remind me later** expands the choices in the same card using the approved disclosure. Cancel, Escape where available, or tapping the trigger again closes choices without scheduling or changing anything.
- **×** dismisses this episode's check-in. Persist dismissal and cancel its pending recovery/postponed requests; preserve ordinary reminders, notification permission, quiet hours, plan and logs. The compact dismissed confirmation offers Undo.
- After successful scheduling, replace the question with the actual chosen time and **Undo**, matching the preview. Keep this feedback accessible. Restore the card only after Undo has successfully cancelled the specific postponed request. Never remove unrelated reminders or resurrect an expired/invalid episode.

One episode gets at most one automatic notification and one initial Home presentation; they are the same check-in, not two independent campaigns. Persist actual presentation/acknowledgement so it is not shown afresh on every launch. Merely evaluating eligibility or rendering an offscreen view is not a presentation. Explicit postponement is the only path to a later repeat of that episode. If several habits qualify, use one compact section and existing list/row/disclosure patterns to access the others; avoid a tall stack of competing cards or modal interruptions. Record that multi-habit extension as an implementation choice, not a separately selected mockup.

## 3. Postponement behavior

Use the preview's choices as initial implementation defaults: **In 15 minutes**, **In 1 hour**, **This evening · 7 PM**. The user accepted the interaction; these values originated in the preview and are not a newly specified global default. There is no preselected delay or automatic snooze. Store the concrete selected future instant with the episode; do not recalculate relative delays on every reconciliation.

Keep these conservative edge-case defaults explicit in the native handoff:

- Compute relative delays from the actual tap time; evening means 7 PM in the habit's effective local timezone on that same date. Hide the evening choice once it has passed. Never silently reinterpret it as tomorrow or replay an expired request.
- Respect quiet hours and existing lifecycle/eligibility checks. A choice falling inside quiet hours is unavailable with a short explanation; do not move it to another hour or modify quiet hours. Revalidate at confirmation, not only when rendering choices.
- If notifications are unavailable, use existing permission/status UI and the explicit permission/settings route. Keep the check-in available; do not show a scheduling-success confirmation. Cancellation or denial preserves the existing settings and episode.
- Permit at most one pending postponed request for a habit/episode. Repeated taps and duplicate notification responses must be idempotent. A successful explicit choice replaces that episode's existing recovery booking without changing the ordinary recurring schedule. Avoid duplicate ordinary/recovery alerts at the same habit/time.
- Schedule before showing success, with the existing durable ledger and OS readback. Failures retain confirmed state and offer retry. Undo and replacement must also handle failed cancellation/persistence honestly.
- While postponed, do not re-present the full question early on each launch. At the chosen time, the pending request may alert; on a later eligible Home opening the explicitly requested check-in can return. Do not automatically schedule another follow-up if it is ignored.
- Any newly confirmed outcome before the chosen time cancels the postponed check-in. Turning off reminders, relevant plan changes, pause/archive/delete or expiry also cancels invalid work. New ordinary reminder times remain separate from a one-off postponement.

For recovery notifications, keep default tap routing to the affected habit. If exposing a system **Remind me later** action, it should foreground/route safely to this existing time-choice UI, after any protected in-progress flow, rather than silently choosing a delay or inventing a second custom picker. Limit this action to recovery notifications for this slice; ordinary-reminder snooze is not an extra feature to introduce implicitly. A platform-owned notification uses system styling, not the in-app card artwork. Document and test supported platform behavior against current Apple primary documentation.

## 4. Extend the existing reminder owners

Inspect and extend `Today/HabitReminders.swift`, `Today/ReminderVerification.swift`, `Today/Library/Components/LibraryReminderStatus.swift`, notification hooks in `Today/TodayApp.swift`, confirmed-save hooks in `Today/Models.swift`, and `Documentation/NativeMigration/Reminders-Nov22/README.md`.

Reuse the pure planner, serialized scheduler, OS adapter, atomic booking ledger and validated routing. Do not add a competing scheduler. Migrate ledger fields backward-compatibly without discarding prior bookings or personal data. Preserve the finite queue budget across all Today request kinds and keep unrelated requests. Reconcile obsolete in-flight additions so they cannot reappear after cancellation; complete OS handlers exactly once.

For the initial automatic recovery notification, use the next permitted future saved reminder time, substituting for an ordinary reminder at that habit/time. Quiet hours suppress rather than shift it. Dismissal or acknowledgement cancels the remaining automatic booking for that episode.

Do not pre-book recovery based on speculative future missing logs. Local notifications do not guarantee fresh app execution at their trigger time. Evaluate on legitimate execution opportunities and on next opening; be explicit that exact unattended three-day detection is not guaranteed by the local implementation. Do not add a backend or claim background polling. Preserve the in-app return path when an alert cannot be queued.

## 5. Verification and delivery

Use isolated test stores, clocks and reminder fixtures. Do not reset personal data or send personal notifications during tests.

Verify:

- One/two/three/four missed scheduled dates, days off, open today, partial/zero/None reports, dated revisions, lifecycle boundaries, backfills and new episodes.
- Cold relaunch and one-per-run behavior; no recurring nag after dismissal; Home placement without interrupted logging/creation/edit/share; several eligible habits.
- Each delay from a real injected time, evening already passed, midnight/DST/timezone changes, quiet hours, permission denial, disabled reminders, queue capacity, persisted postponed instant and no replay after expiry.
- Repeat taps, duplicate responses, log-before-fire cancellation, obsolete async work, failed OS add/readback, failed ledger writes, replacement and Undo. No lost ordinary reminders or unrelated requests.
- Simulator default notification tap and any implemented recovery action across foreground/background/cold launch. Separate OS booking acceptance from actual delivered banners and report physical-device/Focus/Scheduled Summary/reboot limits.
- Source/native visual and motion comparisons at 390 × 844, opening/closing and interruption, accessible labels/focus/VoiceOver, larger text and actual Reduce Motion. Record what was exercised and any gaps; do not claim parity from a still image alone.
- Focused regressions for ordinary reminders, logging/timer completion, global streaks, and Home + → Breathing → setup. Run applicable tests and a Release simulator build.

Update the native handoff, design spec, PRD status and migration evidence with this latest approval, exact episode/quiet-hour/default policies, source hashes, real verification and remaining limitations. Remove active contradictory no-snooze instructions; retain historical decisions only as clearly superseded records. Commit the finished native slice locally; do not push or deploy. Finish with what changed, tests/build actually run, commit IDs and remaining gaps.

## Launch scope remains intact

This slice does not implement recap layouts, log photos, widget families, accounts/cloud, parties/invitations/shared media, or to-dos/task widgets. **They remain in their existing prelaunch milestones where approved; this boundary is sequencing, not removal from launch.** Keep `LAUNCH-SCOPE.md` as the complete checklist. To-dos and their selected small/medium widgets remain last, before launch. Unselected Workshop variants do not become approved merely because all approved features are required.
