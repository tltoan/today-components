# Implementation brief · All approved widgets and Home to-dos

**Status, November 23:** implemented in native `fd67a06`, checkpoint `46b8027`. Review found two task retry defects. Use [IMPLEMENTATION-TASK-RETRY-FIX.md](IMPLEMENTATION-TASK-RETRY-FIX.md) next; the requirements below remain the feature contract.

November 23, 2026. **Latest user instruction: implement all widgets already approved.** This supersedes the immediately preceding infrastructure-only prompt. The approved widget set is the **small next-task** and **medium short-list** task widgets. Implement both as real installed WidgetKit families, with their selected Home To-dos space and durable shared task data. These dependencies move into this milestone; the earlier instruction to leave to-dos last no longer blocks this work. Do not stop at infrastructure, a diagnostic face or app-rendered previews.

**Launch requirement:** all other approved features remain required before the first release, including accounts/backup and real parties/invitations/shared media. Read [LAUNCH-SCOPE.md](LAUNCH-SCOPE.md) and preserve all earlier integrations when executing this brief.

The selected **A separate space** Home composition uses the Habits / To-dos slider. Approval is recorded in `HOME-TASKS.md` and catalog entries `home-tasks`, `task-widget-small` and `task-widget-medium`. The habit/Lock Screen layout collection in `widgets.html` remains Workshop; Warm Ember's approval selects its artwork/motion, not every widget family that displays it. The removed large task widget is not selected. Do not promote those proposals or add Live Activities in this slice.

## Start from the current app

Continue in `/Users/antony/Desktop/Projects/today` on `codex/component-library-migration`. Inspect status, recent commits and handoff first. Latest read-only check found clean `f4c83f8`, recording entry-photo implementation `7b6efb2`; work from the actual current checkout without resetting or reverting later work. Implement this slice, verify it, update the native handoff/source map and commit locally. Do not push or deploy.

Read app `AGENTS.md`, `CHAT-HANDOFF.md` and `design-specs.md`. Preserve all connected behavior: creation and durable drafts, Breathing/continuous wash and request ownership, logging/history/notes, plan revisions, Profile/export, ordinary reminders, missed-day recovery/postponement, durable timers, global streaks and Warm Ember, explicit trial/routine continuation and exact-entry photos. Keep the November 22 native header and shared-background corrections. Real party membership is still absent; retain the existing production photo-eligibility boundary rather than enabling the party shortcut for personal habits.

Useful existing entry points:

- `Today/Library/LibraryMainScreens.swift`: `LibraryHomeView` currently displays habits only.
- `Today/TodayApp.swift`: existing shell, routing and app lifecycle.
- `Today/Models.swift`: `TodayData`, `TodayStore` and the existing repository. Its commit path reconciles the habit streak; task mutations must not go through that path.
- `Today/Library/LibraryProfileScreen.swift`: Widgets currently says unavailable; export uses `ProfileExportFile`.
- `Today/ProfileData.swift`: explicit local export schema, currently version 4 with portable entry media and v1–3 decoding.
- `scripts/generate-project.py`: currently generates app/unit/UI-test targets, with iOS 17 minimum. Add the widget extension to the generator as well as its generated project.

The existing habit file, backups, historical entry snapshots, timer sessions, continuation drafts/receipts, recovery state, streak ledger and immutable photo files must remain intact. No personal-data reset, secret inspection, live AI request or account service is needed.

## UI authority and source inspection

Use the **current local library working files**, including unpublished changes:

`/Users/antony/Documents/ChatGPT/Apps/today-component-study`

Read `AGENTS.md`, `CHAT-HANDOFF.md`, `INTEGRATION.md`, `LAUNCH-SCOPE.md`, `HOME-TASKS.md`, `HOME.md`, `WIDGETS.md` and the relevant `components.json` entries. The latest scope in this brief supersedes the old infrastructure-only instructions. Inspect:

- `home-tasks.html`, `home-tasks-study.js`, `home-tasks-study.css` for the selected composition and example behavior.
- `components/task-list.js`, `components/task-list.css` for list/widget geometry and interactions.
- `components/home-overview.js/css`, `components/controls.js/css`, `components/week-bar.js/css`.
- `style.css` for the reused checklist mark and check feedback.
- `foundations/disclosure.js`, `foundations/motion.css` for the shared disclosure contract.
- `components/widget-primitives.js`, `components/habit-widget.css` for widget sizing/surface conventions.

Inspect the live selected preview at `http://127.0.0.1:4320/home-tasks.html`, including Habits/To-dos switching, Add/Cancel, completion/Undo, Next, Later, Completed, empty/all-done and long-title states. The current native reference server may already own port 4318; do not kill it. If 4320 is unavailable, serve this same checkout on a free local port.

Record relevant source-file hashes. The published pin `7b040722b19c21a174e1e286a135eb64f8b36628` does not contain this new selection. Do not replace the local reference with that older snapshot. Keep the native app self-contained; copy/port only needed sources, without absolute build dependencies on the library checkout. Preserve supplied native source unchanged and put any adaptations in named shared wrappers.

## 1. One Home with two spaces

Add the selected **Habits / To-dos** segmented slider below the existing week bar. Reuse `LibrarySegmented`, header/profile, week bar, fixed shared background and Center cradle. Keep their geometry and motion. The selected composition has a stable header/date/selector area with scrolling content above the fixed navigation; do not put the whole phone in an extra nested scroll view.

Ordinary entry to Home starts on Habits. Switching spaces retains the selected date and any task draft. A widget link explicitly opens today's To-dos. Preserve the native `today.` / `what will you do?` header, lowercase `habits` tab header and existing supporting typography; the newer native corrections outrank older browser header differences.

The Habits space retains all existing due/upcoming/review/empty states and real logging, detail navigation, timers and target feedback. The cradle + continues opening the working habit-creation flow even from To-dos. Task capture uses the inline Add button; do not repurpose + or introduce a third bottom tab.

Keep the global streak beside Your day in Habits. Task completion changes neither habit entries nor x/y logged nor the streak. When Habits is hidden, treat its celebration presentation as inactive; switching back must not replay an earned flame or target animation. Hiding a space must not cancel an actual running timer or lose a draft.

## 2. Simple, durable to-dos

Port the selected task list into reusable native views, controlled by a task repository rather than sample arrays. Implement only the selected behavior:

- Add expands the inline composer with a required title and optional calendar day. Open the keyboard only after an explicit Add action. Trim empty input; preserve the user's wording. Use the existing Today field/button styles and native date selection within that treatment.
- Submit creates one stable-ID task. Prevent duplicate submission while saving and make retry safe. Only clear the draft after confirmed persistence. Cancel closes and retains the in-session draft, including across space switches. A failed save leaves confirmed data untouched and offers an actionable retry while retaining entered text.
- Undated/due tasks are available; unfinished earlier tasks carry forward quietly. Future tasks are under Later and remain reachable beyond the visible week. Keep deterministic row ordering shared by Home and widgets, including when dates/titles tie.
- Complete/Undo is reversible and updates the remaining count. Retain the most recently completed item in place with its checked circle/Undo; older completions appear in the shared Completed disclosure. The small widget's Next dismisses that retained completed item so the next pending item appears. Next never completes or deletes another task. Keep completed items recoverable from Completed.
- Include empty and all-done states. Long titles wrap on Home and use the selected two-line truncation inside widgets; accessibility retains the full title and action.

Use real dates and the existing injected clock/calendar conventions. A chosen task day is a local calendar date, not midnight UTC. Store actual creation/completion instants and enough local-date context for stable labels. Browsing another day filters the task list; it is not an assertion of a historical task-state snapshot. Completion happens now, not on the browsed day. Do not invent past completions or carry over fixed November fixture dates. Document the chosen date/carry-forward/ordering rules and cover time-zone and midnight changes.

This slice does not add recurring tasks, priorities, subtasks, task notes/photos, task reminders, AI task generation, cloud sync, task editing/deletion flows, or task credit in trial recaps. Preserve task state independently of habit deletion, reset/review or plan adjustments.

## 3. One task repository shared with widgets

Create a separate, versioned local task store in an App Group container, shared by the app and widget extension. Do not relocate the existing habit JSON or let an extension rewrite the app's in-memory habit snapshot. Use a small shared module/target membership containing extension-safe models, queries and repository operations; keep app navigation, planner, notification scheduler and habit-store side effects out of it.

The repository must coordinate **across processes**, not only through an in-process actor. Choose a suitable transactional database or coordinated file transaction, read the latest state inside each transaction, validate it and publish only after a successful commit. An atomic file replacement alone does not prevent two writers losing each other's changes. Corrupt/unsupported/unavailable data must remain untouched; distinguish unavailable from an empty list, and never silently fork into a private fallback store.

Widget commands carry stable task identity and an explicit desired state, not a blind toggle of an old timeline. Handle repeated delivery, double taps, simultaneous Home/widget actions and stale Complete/Undo/Next safely. Use revision/operation identity where needed so a delayed completion cannot overwrite a later Undo, or a stale Next clear a newer retained completion. Refresh from confirmed data after stale or failed commands.

Both widget families and Home use the same eligibility, count and ordering rules. Persist any shared retained-completion/Next presentation state separately from task meaning. Refresh Home after external writes/foregrounding and request appropriate widget timeline refreshes after committed changes. Handle day/time-zone rollover using real calendar boundaries; do not promise that an OS-controlled widget refresh occurs at an exact instant.

Use a distinct QA App Group/store namespace for `--test-store` and widget verification. The existing `--reset` fixture workflow must never erase the personal shared task store. Document the group identifier/configuration, entitlement setup and storage protection behavior, including unavailable/locked-container handling.

Extend Profile's explicit export to include confirmed tasks, with a versioned schema and existing v1–4 decoding intact. Preserve the v4 portable-photo validation, size limits and unavailable-media records. Exclude transient composer text, credentials and internal widget operation metadata. Capture consistent confirmed snapshots from both repositories; document the export capture boundary rather than claiming an atomic cross-store instant. If task data cannot be read, fail clearly rather than labelling a partial export complete. Keep restore/account sync unavailable; update local-data/privacy copy to accurately include tasks. Task titles must never enter planner/review requests.

## 4. Real small and medium widgets

Add a real WidgetKit extension with the selected task widget supporting only the approved small and medium families. Use the shared task repository and App Intents for Complete, Undo and Next. Use deep links for opening Home → To-dos; completion must not unnecessarily launch the app. Consult current Apple documentation and the installed SDK for extension, entitlement, interaction and refresh behavior:

- [WidgetKit strategy and shared group container](https://developer.apple.com/documentation/widgetkit/developing-a-widgetkit-strategy)
- [Interactive widgets](https://developer.apple.com/documentation/widgetkit/adding-interactivity-to-widgets-and-live-activities)
- [Widget navigation](https://developer.apple.com/documentation/widgetkit/linking-to-specific-app-scenes-from-your-widget-or-live-activity)
- [Timeline updates](https://developer.apple.com/documentation/widgetkit/keeping-a-widget-up-to-date)

Document and verify the actual intent execution process. App target membership alone does not establish that an intent runs in the app; widget interactions must work with the app terminated. Await durable commit before returning from the intent. Define snapshot/revision and command identity so repeated delivery is harmless without preventing a deliberate Complete → Undo → Complete sequence. Generating a timeline never changes task state. A failed/stale command refreshes from confirmed storage and offers an honest recovery path within the fixed widget bounds.

Match the selected components: medium shows two rows plus the remaining count; small shows one task, the large completion target and Next after completion. Reference frames are 338 × 158 and 158 × 158 at the standard reference phone. Adapt to the actual system family size without scaling down typography or clipping actions. Preserve the graphite gradient, 16 pt content insets, source font roles, circular checks, borders and spacing; avoid double-applying system and component margins. Bundle the required Today fonts in the extension. The surrounding browser showcase panels are not part of the widgets.

Provide truthful empty/all-done/unavailable states and full accessible task/action names. Use platform-supported widget update feedback; record any system-controlled motion differences rather than pretending the browser animation transfers unchanged. No idle animation, live polling loop or artificial success state. Test the actual installed extension, not just SwiftUI previews.

Open-to-dos routing must work from cold/warm launch and return from background. Use the existing shell, select Home and To-dos with today's date, and avoid duplicating navigation or auto-opening the keyboard. If creation/editing is already presented, preserve its draft and safely defer navigation rather than discarding it. Invalid routes must not mutate data.

Update Profile → Widgets from its placeholder to accurate guidance for the now-available task widgets, reusing that screen's current components. Do not claim that a widget has been added or that unimplemented habit widgets are available. Add the target, embedding, shared sources, fonts, entitlements and build settings to the project generator and verify regeneration preserves them. Keep the existing deployment target unless a concrete SDK requirement establishes a change is necessary.

## 5. Motion, verification and completion

Reuse `LibraryDisclosure` / `TodayMotion.Disclosure` for Add, Later and Completed: the existing 600 ms measured-layout transition, anchored trigger, incoming/outgoing opacity choreography, clipping, interruption/reversal and immediate Reduce Motion settlement. Reuse the actual segmented-highlight and checklist feedback timings from source; do not substitute generic springs or animate the full list with an unrelated blanket animation.

Verify using isolated stores and synthetic tasks:

1. Add/validation/double-submit/retry; undated/today/future/carry-forward; Complete/Undo/Next; completed restoration; deterministic ordering; empty/all-done/long titles; relaunch durability and midnight/time-zone boundaries.
2. Two independent repository instances/processes and stale widget commands: no lost writes, duplicate task, resurrected completion or silent corruption. Inject write/read failures and test inaccessible/unsupported shared stores. Ensure test reset cannot touch production paths.
3. Actual small and medium widgets: completion/Undo while app is backgrounded, Home refresh, cross-widget consistency, timeline failure behavior and deep links from cold/warm launch. Distinguish durable saves from OS delivery timing. Verify task data in export and failure behavior.
4. Task actions leave habit entries, timers, reminder/recovery scheduling and global streak state unchanged. Preserve Home quick log → history/Undo, timer completion, stopped trials/explicit continuation, exact-entry photos/export, and Home + → Breathing → real fixture planning/setup. Use existing tests for these connected regressions rather than broad unrelated rewrites.
5. Compare live library/native Home at 390 × 844 and both widget families. Record/scrub selector movement, Add/Cancel, Later/Completed, check/Undo and rapid reversal; test actual Reduce Motion, VoiceOver, keyboard dismissal, larger text and safe-area/cradle containment. Identify any unverified parity or physical-device gap explicitly.

Run the appropriate model/UI suites, app + extension builds and project-regeneration checks, including Release app embedding of the actual selected widgets and exclusion of QA stores/fixtures. Exercise full-color and supported system rendering modes; record OS-controlled appearance/motion differences. If provisioning or simulator infrastructure blocks actual widget installation, complete the unaffected implementation/build checks and report the precise remaining blocker. Do not present an app-rendered widget mock as an installed widget, and do not stop at a plan or preview-only implementation.

Update native `CHAT-HANDOFF.md`, `design-specs.md`, `Documentation/NativeMigration/README.md` and `library-sources.json` with the selected-source hashes, data/interaction policy, evidence, exact tests run and outstanding gaps. Correct the stale blanket Home-Workshop statement. Keep the library reference unchanged. Finish with local commit IDs, what works, what was tested and what remains unverified.
