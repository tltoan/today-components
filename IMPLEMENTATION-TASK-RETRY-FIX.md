# Next native fix · Task retry ownership and draft completion

November 23, 2026. Review of clean native `46b8027`, implementation `fd67a06`, found both approved WidgetKit families and Home To-dos connected. Fix the two retry defects below before starting account/backup/party work. Preserve all approved launch features and the library's existing UI/motion; this is a behavioral correction, not a new layout.

## Continue from the actual checkout

Work in `/Users/antony/Desktop/Projects/today`, branch `codex/component-library-migration`. Read native `AGENTS.md`, `CHAT-HANDOFF.md`, `design-specs.md`, the current implementation and `Documentation/NativeMigration/HomeTodos-Nov23/README.md` / `Data.md`. Read the library's `CHAT-HANDOFF.md`, `INTEGRATION.md`, `HOME-TASKS.md`, `IMPLEMENTATION-HOME-TODOS.md` and this brief. Preserve any work newer than the reviewed checkpoint. Keep changes local; do not push or deploy.

The reviewed implementation has real shared SQLite storage, Complete/Undo/Next, App Intents, timelines/routing, export v5 and selected Home controls. Do not replace that implementation, migrate habit/media storage, remove the widgets or introduce unselected families.

## Finding 1 · Successful Add retry does not finish its draft

At the reviewed commit, `Today/TaskStore.swift:51–58` clears the composer, title/day and draft ID only through `add()`. `retry()` directly calls `command(failedCommand)` and skips that completion logic.

Reproduce with isolated QA data:

1. Open Add, enter “First task,” and inject a commit failure.
2. Cancel the composer, retaining the draft as designed.
3. Tap the still-visible Retry after storage recovers. The closed-composer branch calls `tasks.retry()`; the task saves.
4. Open Add, change the title to “Second task,” and submit.

The draft still carries the ID of the first saved task. The repository correctly rejects the different payload as stale, so the second task cannot be added normally. The same problem applies to editing the retained day.

Make successful Add finalization common to the initial attempt and every retry path. Retire the accepted operation/draft identity exactly once. Clear only the draft owned by that accepted Add; retain any independently edited/replaced draft. Never weaken repository idempotency or generate a new task ID on each retry to conceal this defect. Only confirmed persistence may consume a draft.

## Finding 2 · Retry chooses an operation from composer visibility

`Today/Library/Components/LibraryTaskList.swift:51` currently calls `submit()` whenever the composer is open, regardless of which operation failed.

With Add expanded and an unsaved title entered, fail a completion/Undo on an existing task, then tap Retry. The handler submits the unrelated title as a new task instead of retrying the failed completion. With a blank title it produces a title-validation error instead of recovering the original action. A load failure must likewise retry loading, not submit draft text.

Route Retry by the actual failed operation/context, never by whether Add happens to be visible. Keep the error tied to that operation and retain its identity for a safe retry. Stale commands must refresh confirmed state and require a new deliberate action where appropriate; they must not overwrite a later external update. Completion/Undo retries must leave an unrelated Add draft untouched. If a failed Add draft is edited, make the resulting submit/retry behavior explicit and prevent accidentally saving the old text or erasing the new text.

## Required verification

Add focused model and UI regression coverage that fails on the reviewed implementation:

- Failed Add → Cancel → successful Retry → new title/day → successful second Add; exactly two distinct tasks, no stale identity, no duplicate first task.
- Failed Add → retry while open; successful finalization once, failure retains input. Include changed/cancelled drafts and repeated Retry.
- Failed Complete and failed Undo with an unrelated Add draft open; Retry performs only the failed operation, saves no new task and preserves the draft.
- Read/unavailable error with Add open; Retry reloads without submitting. Verify stale external completion/Undo and a newer draft are preserved.

Use the existing `--test-store --task-fixture` isolation and fault injection; never reset personal data. Exercise real UI error buttons, not only direct calls to store methods. Keep shared SQLite concurrency, widget actions and export unchanged. Run the relevant task tests, connected regression checks, and app/extension build. Preserve the selected 600 ms disclosure, focus behavior and Reduce Motion; verify new behavior in the simulator without changing component geometry.

Update native handoff and the HomeTodos verification record with exact tests/results and local commit IDs. Keep known widget typography/strikethrough differences, maximum-text Home header overlap, physical-device provisioning/protection and spoken VoiceOver gaps explicit. Passing this fix does not close those separate checks or complete launch services.

## Review evidence and limits

The review checked actual source, clean Git state, all 25 selected-source hashes, saved comparison images, extension-process logs, and saved results: 219 model tests, 11 distinct UI methods, 11 backend contracts and a Release app/extension build passed across recorded runs. The existing retry test covers only retry while the Add composer stays open, missing the two sequences above.

Both defects were freshly reproduced with real task model/SQLite/store command logic in an isolated macOS harness under `/tmp/today-tasks-review-20261123`. Widget refresh/error-marker services were stubbed and Observation decoration omitted because the compiler macro host was unavailable in the review sandbox; store command bodies were unchanged. The second case exercised the exact composer-based branch from the view. This is fresh logic evidence, not a new installed iOS UI run. No native files were changed during review.
