# Next native slice · Global logging streak

November 22, 2026. The user requested native global streaks using this library's fire animation and design system. This is an implementation handoff, not a claim that streaks are implemented.

Source check: native branch `codex/component-library-migration`, last committed HEAD `9a18c35` (durable timers). The centered preparation screen and related source-preservation cleanup are present as uncommitted work. Preserve and finish that work before beginning this slice; recheck the actual state because the native session may have advanced. The Warm Ember browser preview and readable component sources were inspected. No native files were modified or native tests run for this handoff.

Paste the following into the native-app Codex session:

```text
Continue in /Users/antony/Desktop/Projects/today on codex/component-library-migration.

Implement the Today-wide logging streak with durable, date-specific credit and the library's selected Warm Ember fire animation. Build on the existing local app. Preserve onboarding, centered habit preparation, plan revisions, timers, reminders, Profile, notes/history, data migration and the corrected shared headers/backgrounds.

First inspect git status, recent commits and the current handoff. The last audit saw HEAD 9a18c35 plus uncommitted preparation-screen work. Finish its outstanding verification/documentation and commit that slice separately if still needed; do not discard, overwrite or bundle unrelated edits into the streak commit. Do not reset personal data.

Read app AGENTS.md, CHAT-HANDOFF.md, design-specs.md, Documentation/Today-PRD.md §6–7 and Documentation/PRD/Sources/2026-11-19-product-decisions.md. Inspect the actual store, entry mutation paths, dated plan revisions/lifecycle, local-day handling, timer reconciliation and current Home composition before implementing.

The UI source of truth is the local library:
/Users/antony/Documents/ChatGPT/Apps/today-component-study
Read CHAT-HANDOFF.md, AGENTS.md, INTEGRATION.md, HABIT-CARDS.md, HOME.md and the streak-flame/streak-badge manifest entries in components.json. Inspect these exact sources and their live previews:
- components/streak-flame-art.js
- components/streak-flame.js and components/streak-flame.css
- components/streak-badge.js and components/streak-badge.css
- assets/streaks/ember.svg
- http://127.0.0.1:4320/streak-flame.html
- http://127.0.0.1:4320/habit-cards.html
Use the current local sources; record hashes and the base commit without claiming unpublished files came from the older published pin. Reuse an existing reference server or start an available port without replacing another task's server.

1. Implement the confirmed metric

This is ONE private, app-wide logging streak. It counts reporting for EVERY habit scheduled on that date, regardless of target attainment. It is not a per-habit target streak or a habit-party streak.

- Resolve eligibility for the actual date: scheduled weekdays, effective revisions, start/end, routine/trial status and lifecycle. Exclude paused, archived, deleted, future-start and trial-ended habits as applicable on that date. Never apply today's roster/settings retroactively.
- A saved partial amount, check-off or explicit valid zero/None today can report a habit. Missing data is unknown, not zero. Preserve the existing local 5 p.m. availability rule for the current-day None today shortcut. Later positive activity remains loggable.
- Notes alone, photos, opening a screen, notifications, reaching a target, and starting/running/pausing a timer do not grant credit. A timer contributes only through a successfully persisted log. Positive sub-minute duration is activity; preserve precise seconds.
- When all eligible habits have a saved outcome, today can contribute ONE day immediately. Additional entries never add another streak day or disable logging. No Finish logging today action.
- An unfinished current day stays open and does not break the carried streak early. A closed eligible day with any missing report breaks the run. A day with zero eligible habits preserves the run without increasing it; do not use an empty-set allSatisfy result to award a day.

2. Persist participation independently of editable history

Implement a tested streak engine/store contract, not a view calculation over the current entries array. Persist dated participation/eligibility evidence, finalized outcomes and an explicit coverage start. Completed past-day outcomes are immutable under later edits, backfills, note changes, habit deletion or schedule changes. Keep enough date-effective lifecycle evidence to reconcile days when the app was not opened; today's pausedOn/archivedOn flags alone cannot recover every past roster.

Keep today's provisional result accurate after successful log edits/deletions and same-day eligibility changes. In particular, deleting the only current-day report must not leave a false claim that all due habits are logged. Once a day closes, later history corrections must neither add nor remove its credit. Separate a provisional UI count from finalized history where necessary. Deduplicate the celebration for a day even if today becomes incomplete and qualifies again.

Reconcile date rollover, skipped dates, launch/foreground and significant time/time-zone changes idempotently. Evaluate all covered intervening dates: unopened off days preserve a streak; unopened due days with no report break it. Inject clock/calendar/time-zone dependencies for deterministic tests. Never calculate days as fixed 86,400-second intervals. Do not reopen finalized dates or double-award a repeated civil date after clock rollback/travel.

The PRD leaves some time-zone/current-day edge policies to engineering. Document the chosen deterministic policy and examples before implementing it, clearly labeled as an implementation choice. It must preserve frozen historical credit, avoid duplicate days and remain consistent with the app's dated entries and revisions. Do not claim a purely local app can prevent deliberate clock manipulation.

Pay special attention to timers reconciled after midnight or relaunch: they retain their captured activity day and may have a recorded completion timestamp earlier than their actual save. Do not infer timely participation from that timestamp alone, assign a prior-day session to today, or silently reopen frozen streak history. Define and test the ordering of timer reconciliation, streak finalization and failed-save recovery. Distinguish a new late save from a report that was already durably saved before closure.

Persist the originating successful mutation and its streak effects atomically. A failed save leaves both confirmed entries and credit unchanged and produces no celebration; Retry must not duplicate either. Serialize/idempotently handle repeated reconciliation and duplicate timer completion. Preserve immutable participation evidence when a habit/entry is later deleted; it must not require the deleted entity to remain in the active model.

Migrate existing v1/v2 data safely using the current backup/validation/atomic-write conventions. There is no trustworthy historical streak ledger in older files: do not fabricate a six-day streak or reconstruct years of credit from mutable logs. Start explicit coverage at feature initialization; existing current-day saved outcomes may contribute where supported by real data, without inventing timestamps or prior credit. Preserve all existing plans, entries, notes, revisions and timer records. Include the new durable data in the existing local export contract, updating its version/compatibility documentation if required.

3. Port and reuse the selected Warm Ember fire faithfully

The manifest currently lists no supplied Swift implementation for streak-flame. Create a shared SwiftUI flame component from the actual vector paths/gradients/layers and a separate reusable streak badge bound to confirmed host data. Do not use an emoji, SF Symbol, generic Lottie flame or a newly drawn approximation.

The live component JS/CSS is the animation authority. The downloadable animated SVG omits the JS component's separate core motion, and the small Home streak-badge source is static; neither alone reproduces the full selected animation.

Preserve the 160 × 184 vector coordinate system, Warm Ember palette, layered body/core/glow/shadow, gradient positions, transform origins and proportions. Match components/streak-flame.js precisely:
- Body: 1,600 ms, cubic-bezier(.22,.76,.28,1), keyframe offsets 0/.36/.64/1, with the source translation, anisotropic scale and opacity values.
- Core: 1,400 ms after a 100 ms delay, the same easing, offsets 0/.4/1 and the source scale/opacity values.
- Glow: 1,600 ms with CSS ease, opacity .34 → .8 → .34 at offsets 0/.4/1.
- Body origin (88,159); core origin (94,145), in the source coordinate space. Preserve parent/child transform composition when scaling to the badge.
Use the actual source for all values and timing semantics, including interpolation between keyframes. A generic spring or repeatForever is not equivalent.

Play once on a newly confirmed qualifying-day event, then settle to the source still. Never run an idle loop, replay on ordinary rerenders/tab switches/relaunch, celebrate a failed save, or tie the flame to target-reached. Give credit events stable identity and handle offscreen/inactive presentation deliberately without accumulating replay animations. Interruption/disappearance cancels safely; Reduce Motion shows the settled art immediately and must also stop an already-running animation.

4. Integrate with the existing Home design

Use the library's compact global placement beside Your day, outside individual habit cards. Treat this request as authorization to connect that streak component, not to replace the whole Home screen with the Workshop composition. Preserve current Home header/profile, background, cards, date bar and cradle. Reuse typography, colors, spacing and shared controls. Base compact sizing on streak-badge.css; the oversized gallery specimen is not a mandate to enlarge production Home.

Show the actual current global count with accessible wording such as “Overall logging streak: 3 days.” Keep target attainment and “x/y logged” separate. Make zero/no-due/unfinished-today states truthful, without invented congratulatory copy or a punitive broken-streak screen. Selecting a past/future date must not mutate or celebrate the live streak, or misleadingly relabel the selected day's count as today's. Keep the badge's global/current meaning clear.

Check long counts, narrow widths and Dynamic Type; use a natural secondary row if needed instead of clipping, overlap or shrinking the existing type. The whole badge should have one useful VoiceOver description; decorative flame layers stay hidden. Do not add a tap destination, settings page, new modal, per-habit streak or party feature just for this slice.

5. Verify behavior and visual/motion parity

Use deterministic engine tests plus the existing isolated test stores. Cover:
- Multiple due habits; partial/over-target amounts; check-off; explicit none; unknown; positive sub-minute timer logs; repeated logs; no-due days; new users.
- Today incomplete/complete, same-day undo/delete/requalification, day rollover, missed due days, several unopened days and first-use migration.
- Future starts, exact trial expiry, routines, dated revisions, pause/resume, archive/restore/delete and current-day eligibility changes.
- Historical edit/delete/backfill after finalization leaves past credit unchanged, including when deleting the whole habit.
- Atomic save failure/retry/relaunch, duplicate commands and timer completion before/after midnight, delayed reconciliation and failure recovery.
- DST transitions, forward/backward time-zone changes and clock rollback under the documented policy.

Exercise real connected simulator flows: complete reporting for multiple habits without meeting all targets; earn exactly one increase; keep logging; undo the last current-day report; restore qualification; relaunch; view/backfill history; cross a deterministic day boundary. Assert failed saves never animate and regular Home navigation never replays. Preserve timer/reminder/creation behavior with focused regressions and run the appropriate existing model/backend checks. No live AI requests or personal data resets are required.

Compare browser/native artwork and animation at matching sizes, including the 390 × 844 Home viewport. Record intermediate frames and full playback, not just screenshots of the endpoints. Verify actual Reduce Motion, interrupted playback, inactive/resumed behavior, VoiceOver and larger text. Report any remaining source/native differences honestly; do not mark unrun checks as passed.

Update app CHAT-HANDOFF.md, design-specs.md, library-sources.json and a focused verification/data-policy record. Record what is implemented, chosen boundary policies, tests actually run, evidence and remaining limits. Commit this slice locally when verified; do not push or deploy.

Scope excludes reminder snooze/recovery, widgets/Live Activities, cloud/accounts, parties and new recap layouts. Finish the real global streak and its selected library animation end to end rather than adding a mock count.
```
