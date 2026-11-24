# Next native slice · Durable entry photos

Prepared November 23, 2026 after a read-only audit of native **7e1c5a1 — Implement explicit durable trial continuation**. Build the local attachment foundation and selected reusable photo action. Keep party eligibility explicit: this milestone does not implement membership, upload, synchronization or shared-photo delivery.

## Starting point and source of truth

Work in `/Users/antony/Desktop/Projects/today` on `codex/component-library-migration`. Recheck HEAD/status and preserve newer work. The audited working tree was clean. Preserve personal data and the implemented habit loop, reminders/recovery, timers, streak, plan revisions, Profile and durable trial continuation.

Read native `AGENTS.md`, `CHAT-HANDOFF.md`, `design-specs.md`, the relevant PRD/data contracts and `Documentation/NativeMigration/Continuation-Nov23/README.md`. Read the current local library at `/Users/antony/Documents/ChatGPT/Apps/today-component-study`: `AGENTS.md`, `CHAT-HANDOFF.md`, `INTEGRATION.md`, `LAUNCH-SCOPE.md`, `LOG-NOTES.md`, `PARTY-PHOTOS.md`, `HABIT-DETAIL.md`, relevant `components.json` entries and this brief. Current selected local sources are authoritative, including unpublished corrections; do not use the older published pin alone.

Inspect actual `HabitEntry`, `TodayStore`/repository commit semantics, entry deletion/undo, `EntryStore.swift`, `LibraryHabitCard`, Home/detail/history, entry editor, timer completion, `ProfileData.swift`, image normalization and export code before editing. Entry photos are currently absent; Profile photos are a different capability. Existing legacy IDs and timestamped event IDs must retain their meanings.

## Approved UI and eligibility

Inspect the live library at `http://127.0.0.1:4320/photo-actions.html`, `log-notes.html` and `party-photos.html`, and actual source:

- `components/log-photo-action.js/css`, `components/habit-card.js/css`.
- `components/log-editor.js/css`, `components/habit-detail.js/css`.
- `foundations/disclosure.js`, `foundations/motion.css`, existing native shared disclosure.

Use the **44-point circular image icon on the same row as + / Log**, with the original icon, paint, spacing, pending/error/attached labels and motion. No Add photo pill, new lower row, camera decoration or new card design. Quick logging stays one tap; notes remain in individual-habit history. Do not open a note editor or keyboard after logging.

The current source deliberately shows this shortcut only for a confirmed entry on a **party habit**. Do not silently expand it to every personal habit or invent a local `isParty` toggle, members or successful sharing. The app does not yet have real party membership. Implement the shared action/attachment controller with an explicit eligibility input owned by the future party host; exercise it against real saved local entries in the existing isolated QA fixtures. Keep that fixture strictly out of ordinary app data. Production eligibility remains unavailable until membership is connected. Clearly report this boundary rather than declaring the entire photo feature shipped.

Where a saved entry already has an attachment, its existing history/details route must render the real image and allow correction/removal using existing entry-detail controls. Keep the amount, original unit/time and note together. An attachment may coexist with a note. Unselected management layout additions must be identified as minimal integration UI, not a newly approved design. Do not import the whole party room or carousel as a personal-history replacement.

The entry is the attachment owner, never a daily total, target, current array index or whichever habit happens to be visible when selection finishes. Freeze the exact entry ID at picker opening. A valid partial/check-off/explicit-zero log can own a photo; an unsaved or absent log cannot. Returning from the picker must not move a photo to a newer entry. Deletion or changed eligibility while selection is in flight must fail safely.

## Real local media and persistence

Implement one optional still-image attachment per saved entry, matching the selected action's Add/Change photo contract. Use the OS photo picker and limited selection access; do not request full-library or camera access for choosing a photo. Cancellation preserves the saved amount/note and any existing image. Do not automatically launch the picker after a log.

Reuse the existing image-processing infrastructure where appropriate, but **do not reuse Profile's square crop** for log photos. Preserve image aspect ratio and orientation. Validate real decodable image content and source size, bound decoding/output dimensions, normalize into a supported still-image format, and remove unnecessary metadata such as location. The library's current file validation is 8 MiB; document any native decoding/output limits as engineering bounds, with clear retryable errors. Reject unsupported media honestly; no temporary asset URL masquerading as durable storage.

Store images in app-owned durable storage with stable attachment identity and relative references. Thumbnail/cache data is derived; never depend on cache survival for the original. Do not persist picker temporary URLs, absolute sandbox paths or URLs to private Photos assets as the attachment. Keep metadata suitable for a future authorized media service without selecting a backend or claiming remote availability now.

Design the file/repository transaction before wiring UI. A successful log already exists and stays successful independently of an attachment. Only publish attachment success after durable bytes and metadata are committed. Failed selection/normalization/file/JSON writes preserve the prior attachment and saved log. Replacement must never delete the old file before the new reference commits. Handle interrupted writes and relaunch using safe staging/reconciliation, retaining files referenced by committed data; clean only genuinely orphaned app-owned files. Include fault-injection tests around file and metadata boundaries, not just happy-path in-memory mocks.

Use stable operation identity or generation guards to reject stale picker/completion callbacks and duplicate submissions. Handle replacement, removal, deletion of the entry/habit, and existing undo semantics consistently. Never restore a dangling reference through Undo or reuse a removed entry's image for another log. A missing/corrupt file must keep the entry readable with an honest image-unavailable state and correction path; it must not prevent loading the entire habit repository.

Older data without attachments must decode without changing amounts, notes, original measurements, timer precision, dates or IDs. Keep v1/v2 migration/backup guarantees. `dailyTotals` and other aggregates must not inherit one member entry's attachment and present it as the day's photo.

Preserve the current explicit JSON-export contract. Make media handling deliberate and versioned: no leaking absolute paths and no unusable references presented as a complete photo backup. Prefer self-contained bounded attachment records if compatible with the existing export design; otherwise accurately disclose the binary-media exclusion on the existing export screen and document the remaining portable-media work. Do not add an unrequested export workflow or silently claim cloud backup. Test old export decoding and the new media representation/exclusion. Future account/backup integration must retain attachment identity and data.

## Behavioral and visual fidelity

Reuse shared native Library typography, controls, surfaces, image icon and the corrected disclosure. The photo action's entrance uses the selected shared 600 ms expansion with its staged fades, shortened reversal and Reduce Motion; match actual inline geometry, including removal while focused. The icon press uses the source's own 130 ms / .96 feedback. Do not trigger target-fill, streak, reminders or reporting credit for adding/changing/removing a picture. Ordinary log/target feedback remains owned by confirmed activity saves.

Keep picked bytes and entry notes out of AI planning/review requests and logs. Local attachments do not make private entries public. Party notes and optional photos become shared only under the real authorized party contract when that later milestone is connected; private trial reflections and other habits never follow them.

Record current source hashes and shared component mappings. Compare source and native at matching sizes, including transition frames, an interrupted entrance/removal, normal/large text, actual Reduce Motion and accessibility labels. Do not claim parity from a final still alone. Use isolated QA data and real image bytes, never personal photos or a personal-store reset.

## Verification and completion

Implement through working persistence and UI consumers/QA integration, not just models or a standalone demonstration. Run meaningful model/repository tests for migration, exact ownership across multiple logs, cancel, partial/zero/timer entries, stale callbacks, repeated requests, add/replace/remove/relaunch, interrupted file/metadata writes, corrupt/missing media, entry/habit deletion and Undo, aggregate exclusion, export and unchanged streak/reminder eligibility.

Run focused simulator UI checks for the selected inline party-context action using isolated QA fixtures, OS picker selection/cancel, pending/failure/retry, history/details reopening, replacement/removal and existing quick-log/note routes. Test real image storage across relaunch. Verify the normal app does not acquire fake parties or a broadened photo shortcut. Include relevant existing logging, continuation and Profile regressions and a Release simulator build. Distinguish tests actually run from source inspection and physical-device gaps.

Update native `CHAT-HANDOFF.md`, source mappings and a dated migration record with implementation commit, schema/media choices, exact commands/results, comparison images/motion evidence and unresolved limitations. Commit locally if cleanly scoped; do not push/deploy. Do not edit the library's original sources while porting.

Keep all approved features in `LAUNCH-SCOPE.md`. Real party membership/invitations, authorized shared photos/notes/reactions, account/backup services and remaining widget work still follow; Home to-dos and selected task widgets remain last **before launch**. The full recap narrative/reflection presentation is still unselected. This local attachment milestone must not be reported as production social sharing or full launch completion.
