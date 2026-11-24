# Next native slice · Explicit trial continuation

Prepared November 23, 2026 after reviewing native commit **7fcaf19**. Implement the approved continuation choices and next-plan confirmation, with durable private reflection and lifecycle state. The complete A/B recap narrative and final reflection composition remain unselected; this brief does not approve either of them.

## Starting point and authority

Work in `/Users/antony/Desktop/Projects/today`, on `codex/component-library-migration`. The audited HEAD is `7fcaf1946398a161a1fe044296ee37b027e73b43`, with a clean working tree. Recheck before editing and preserve newer work. Do not restart the app or reset personal data.

Read native `AGENTS.md`, `CHAT-HANDOFF.md`, `design-specs.md`, `Documentation/Today-PRD.md` §§8–9, and the latest recovery verification record. Read the current local library at `/Users/antony/Documents/ChatGPT/Apps/today-component-study`: `AGENTS.md`, `CHAT-HANDOFF.md`, `INTEGRATION.md`, `LAUNCH-SCOPE.md`, `RECAP.md`, `HABIT-DETAIL.md`, `LOG-NOTES.md`, `CONTROLS.md`, `PICKERS.md`, this brief and the relevant `components.json` entries. Current unpublished selected sources take precedence over the old published pin for these surfaces.

Inspect actual native `TrialReviewView.swift`, `TrialReview.swift`, `ReviewEvidence.swift`, `Models.swift`, `PlanRevision.swift`, the shared Library controls, reminder/recovery reconciliation, timer resolution and global-streak transaction boundaries. The current review still uses Keep/Adjust/Pause, AI adjustment and view-local drafts; `finishReview` only accepts Today/Tomorrow. These are implementation facts to migrate, not the desired UI contract.

## Approval boundary and connected flow

Implement this bounded path: existing factual summary/activity → private reflection → **Another trial / Make it a routine** → **Your next plan** → explicit saved confirmation.

- Use the selected full-width `today-continuation-choice` cards from `components/continuation-choice.js/css`, and selected **One plan card (A)** from `components/recap.js/css`. Inspect them live at `http://127.0.0.1:4320/recap.html#continuation-choices` and `#recap-plans`. Use an unused port if needed; do not stop someone else's server. Ignore the plan comparison's preselected fixture.
- Retain the existing factual summary/activity and existing reflection controls as temporary hosts. Reuse shared Library typography, surfaces, controls and layout where adapting them. Do not adopt either full A/B recap narrative, invent a third story, or call the interim host the approved finished recap. Record that open design decision in the handoff.
- Reflection comes before continuation. Reuse Too much / About right / Ready for more / Not sure yet, initially unselected. Require an explicit response to proceed; the written note stays optional and private. This follows the existing native response model and PRD's reflection gate; the final reflection presentation is still open. Do not open the keyboard until the person chooses to write.
- Remove the active review route's AI suggestion/question/loading step and its data-sharing copy. Reflection does not make a planning/review request. Preserve first-time habit planning, its privacy/clarification/fallback handling, and readable historical review records. Do not rewrite old AI explanations as new private reflections or unnecessarily remove server endpoints still covered by historical contracts.
- Neither continuation branch is preselected. Choosing a branch only changes a draft. Back, Close and “Leave ended for now” never activate a plan. Preserve existing deliberate Pause/Archive controls in habit detail instead of inventing a third continuation card. Audit the existing paused-habit Resume path so an expired trial cannot bypass reflection; preserve valid nonexpired pause/resume behavior.

## Selected next-plan behavior

Port the selected card into a shared native component using existing artwork, amount stepper, weekday controls, date fields and buttons. Preserve the actual “Schedule:” label and source geometry, colors, type, spacing, pressed/selected states and motion. Use the real habit and saved configuration, not the reading fixture.

- **Another trial:** new default 21 days, editable using the established native setup policy (currently 1–90 days). Retain the old trial's actual duration in history. Do not copy the prototype's 365-day validation or 999-page limit into production.
- **Routine:** retain the chosen weekdays and personal target, with no trial-length field or automatic trial review. Routine does not mean every day. Its schedule and ordinary reminders continue beyond the legacy `trialDays` field.
- Seed from the actual effective configuration at the reviewed period's end, including dated revisions. Preserve tracker, unit, rule, artwork, cue and confirmed reminders unless the person explicitly changes a supported field. Check-offs omit an amount target; upper-limit goals permit valid zero. Fractional timer entries and custom units remain valid.
- Let the person confirm target, scheduled days and a valid local start date today or later, as the selected date control allows. Show the resolved first scheduled session and, for a trial, the inclusive end date. Validate real dates and nonempty weekdays using the injected calendar; do not copy a November fixture or UTC date arithmetic. Revalidate if the clock/day changes while the draft is open. Never silently move a now-past start date.
- Preserve drafts while switching trial/routine and navigating Back; hide inapplicable fields without destroying the other branch's draft. Activating “Start this trial” or “Start this routine” is the only commit action. Announce success only after the repository save succeeds, then return to the correct existing habit/Home context.

## Durable drafts and atomic continuation

Use the existing atomic local repository, not a second store. Persist a review draft keyed to the habit and reviewed period, with stage, response, optional private note, chosen branch, edited plan and stable operation identity. Earlier data without these fields must decode. Closing/relaunching resumes the draft; it does not silently submit it. Keep drafts separate from confirmed plans and reminder eligibility. Failed draft saves need honest retry behavior.

On confirmation, revalidate the current habit, reviewed period, lifecycle, allowed fields, date and any unfinished timer. Reject a stale draft safely; do not overwrite another edit or apply the same continuation to a different period. Use the existing timer-resolution UI before a lifecycle transition; do not consume/discard elapsed work implicitly.

Atomically record the completed period and private review, install the next trial/routine, consume the stable operation identity and clear/complete its draft. Repeated taps, a retry, or relaunch after success must not create a second period/review or start again. A failed write publishes none of these changes and retains the retryable draft. Preserve existing v1/v2 migration and backup guarantees; keep export encoding/decoding compatible with historical records and do not export unfinished drafts inadvertently.

Keep the same habit identity and original entries. Preserve the prior period's dates, targets, schedules, revisions, measurement snapshots, notes and timer precision. A future start may leave a real gap with no scheduled activity; do not extend the old period across that gap. Historical corrections remain possible through the current history route.

Use the current store transaction and scheduler hooks. While ended and unconfirmed, this habit has no new active sessions, ordinary reminders or recovery booking. Confirmation establishes the new schedule, invalidates the old recovery episode and refreshes eligible ordinary requests without changing reminder opt-in/quiet hours. Never rewrite frozen global-streak credit or award reporting credit for reflection/continuation. Other habits, routes and notification bookings remain intact.

## Evidence, privacy and source fidelity

Continue deriving review evidence from actual entries and dated settings. Distinguish distinct logged days from entry count and target attainment, including several measurements on one date. Never sum pages and minutes, invent unknown activity amounts, or treat recorded zero as missing. Preserve per-entry history access and verbatim user notes; no AI summaries or new automatic note-selection scheme. Trial reflection remains separate from shared party-entry notes.

Record current source hashes and component mappings. Keep supplied source files unchanged and reuse existing shared native implementations. Match source-specific selection and screen motion; inline expansions use the corrected shared 600 ms `LibraryDisclosure`, including interruption/reversal and Reduce Motion. The recap gallery's controls, fixed dates and preview confirmation are not product UI. This prompt does not authorize adopting its unselected overall narrative choreography.

## Verification and completion

Use isolated test data. Run focused model and simulator checks for:

- Ended trial with ordinary logs, only explicit zero, and no logs; no automatic continuation and unaffected unrelated habits.
- Required explicit reflection/choice, optional text, no AI calls, Back/Close and relaunch at each draft stage.
- Another trial (21-day default and a valid custom length), routine preserving weekdays, and a future start with a gap. Routine remains active beyond the old end date.
- Multiple entries, mixed measurements/date-effective changes, upper limits, check-offs and precise timers; prior data/history remains unchanged.
- Failed save/retry, duplicate confirmation, crash/relaunch around the commit, stale editor, deleted/archived habit and unfinished timer resolution.
- Ordinary reminders/recovery cancellation and rearming only for the new eligible schedule; private global streak unaffected by continuation.
- Legacy decoding/export and existing paused-habit resume behavior.

Compare the selected continuation and plan components live against the simulator at 390 × 844, including recordings/intermediate frames, rapid repeated input, keyboard/focus, actual Reduce Motion, larger text and VoiceOver. Recheck shared disclosure and relevant existing creation, plan editing, reminder/recovery and history consumers if changed. Run appropriate model/backend regressions and a Release simulator build; report exact executed checks, failures/reruns and remaining gaps. Do not claim the entire historical UI suite or physical-device checks passed unless run.

Update native handoff, canonical design spec, source mapping and verification record. Explain what became connected and keep the full recap/reflection composition explicitly pending. Commit this completed native slice locally; do not push, deploy, reset personal data or edit the library as a side effect.

All approved launch capabilities remain required under `LAUNCH-SCOPE.md`: photos, accounts/backup, parties/invitations/shared media, selected widgets and final Home to-dos/task widgets. This is a continuation milestone, not release completion or permission to drop an approved feature. To-dos remain last before launch.
