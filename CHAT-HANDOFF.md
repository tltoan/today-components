# Continue the Today component library

Updated November 24, 2026. This file carries the design direction across chats. It is not a transcript or a claim that every prototype is implemented in the native app.

## Library sharing snapshot · November 24

The user explicitly requested pushing the current library to GitHub to share it. This supersedes the earlier local-only hold for this snapshot. Destination: `tltoan/today-components` main, with the existing Pages site at **https://tltoan.github.io/today-components/**. Preserve the Components / Screens & flows / Workshop classifications and the distinction between browser fixtures, reusable SwiftUI source and actual native implementation. Native app/services and the separate launch-film project are outside this publication.

Pre-publication checks: all 30 changed/new JavaScript modules pass syntax checks; 3,672 local HTML/manifest references resolve; ThinkingOrbs matches 18 presets and 72 reference frames (70,115 numeric values); all eight party-progress checks pass; whitespace and candidate credential/file review pass. Local browser smoke checks cover all three spaces, account keyboard submission, the reduced-motion control and a measured 390 × 844 viewport without horizontal overflow. A previously recorded MutationObserver error appeared while navigating an existing preview tab; a fresh Workshop load has all six cards ready, no failed cards and no console errors. This publication pass does not establish fresh native or service verification.

## Next native prompts · Approved account journey, then shared photos · November 24

The user requested the next implementation prompts after approving the account flow. [IMPLEMENTATION-ACCOUNT-ACCESS.md](IMPLEMENTATION-ACCOUNT-ACCESS.md) is now first: reuse the selected Apple/phone UI after the first saved habit and from Welcome, Profile and invitations; preserve guest data and explicit backup choices; add real Apple authentication and update phone-only identity, service authorization and deletion assumptions. Apple users must not be required to add a phone. No decorative success checkmarks.

[IMPLEMENTATION-SHARED-PHOTOS.md](IMPLEMENTATION-SHARED-PHOTOS.md) follows review of that milestone. It now explicitly supports phone and Apple identities, preserves the approved party lifecycle/retention rules and calls out the existing long-history pagination gap. It connects the selected exact-entry photo action, carousel and avatar-heart reactions with authorized media, cleanup and shared-content handling. [NEXT-NATIVE-PROMPTS.md](NEXT-NATIVE-PROMPTS.md) separates these next steps from the already completed first three briefs. All approved launch features remain required.

This pass rechecked the clean native **c954a51** checkpoint and inspected current identity, account/party guards and creation routing. It prepared documentation only; no native source, hosted settings, deployment or publication changed. Local service results and future real Apple/SMS/device verification remain separate. Each brief requires current-source/motion comparisons, focused regressions, truthful setup gaps, an updated native handoff and a local commit before moving to the next milestone.

## Account access approved · No decorative success checkmarks · November 24

The user said “everything else looks good” and explicitly rejected the circled checkmark in the signed-in screen. Removed that ornament and its CSS; the existing confirmation copy stands on its own. **Your account · Apple & phone** is now selected in **Screens & flows → Account**, with the same context/state controls and motion. [ACCOUNT-ACCESS.md](ACCOUNT-ACCESS.md) is the selected contract. Approval covers this account UI/flow; native Apple/onboarding integration, provider configuration and service changes remain pending. No publishing requested.

**Design preference going forward:** stop adding decorative checkmarks/circled-tick badges to success and confirmation screens. Use clear copy and composition. Preserve functional checkbox/task-completion controls; this is not authorization for a blanket rewrite of unrelated approved components.

## Account access workshop · November 24

The user said “okay lets do it” to prototyping the account journey before shared photos. Added [account-access.html](account-access.html) / [ACCOUNT-ACCESS.md](ACCOUNT-ACCESS.md) and **Your account · Apple & phone** in Workshop. One reusable `today-account-access` composition covers the optional account choice after the first habit is saved, returning-user sign-in before habit creation, Profile, and a pending party invitation. This initially authorized the prototype. The newer approval above selects the UI, while native/backend rollout remains separate.

The study includes Apple / phone / contextual skip, number entry, one-field six-digit verification, resend/change number, incorrect/expired/offline/rate-limit responses, explicit local-data association, backup review/restore confirmation and context-aware completion. Apple uses a clearly labeled system-sheet simulation; no phone is requested after Apple success. Native will need the real Apple control/flow and revised identity/reauthentication guards. Personal habits stay available without an account; an authenticated user still separately consents to join a party. Backup remains an explicit snapshot, not automatic sync.

Reuses approved controls, artwork, typography, field surfaces and the persistent onboarding gradient (640 ms / 65 ms). Screen content uses a restrained 600 ms entrance; reduced motion settles immediately. State/context controls keep one live specimen. Approved onboarding/Profile pages are unchanged. The study does not save data, send SMS, authenticate, deploy Supabase or change native source. Keep local; no publication in this pass.

Browser verification: desktop composition and a measured 390 × 844 CSS viewport; no page or phone horizontal overflow, and the choice screen fits its frame. Verified keyboard phone submission, invalid-code recovery, successful association, Apple cancellation/success, returning-user backup confirmation, offline retry, expired-code resend, change-number preservation, and skipping account setup without altering the sample habit. Reduced motion settles the wash at 0 seconds. Changed JavaScript passes syntax checks; manifest dependencies, focused-page links, the source anchor and `git diff --check` pass. Workshop iframe registration and its context selector work. One previously seen gallery MutationObserver error appeared during reload; the account card itself loaded and remained interactive. No fresh native or service tests were run.

## Latest native review · First three service briefs implemented locally · November 24

Fresh read-only audit found clean native `codex/component-library-migration` at **c954a51**, with task retry fixes **baa921b**, accounts/private backup **1522033** and normal approved-party integration **636176c**. See [NATIVE-REVIEW-NOV24.md](NATIVE-REVIEW-NOV24.md). Both task retry paths are corrected in source. Profile/party entry has real phone/code/resend UI; owned backups/recovery, sign-out/deletion and party create/invite/join/shared logs/notes/lifecycle are connected against local Supabase. Backup is an explicit bounded snapshot, not automatic sync. Shared photos/carousel/hearts remain unimplemented.

The user approved the seven-point party policy set in the native chat. [PARTY-POLICY.md](PARTY-POLICY.md) is now the library record; it supersedes earlier open membership/timezone/creation statements. Do not ask for these choices again. Full Workshop compositions and nudges are not thereby approved.

Fresh source audit matched all 13 account and 23 party source hashes before these documentation edits. Saved xcresult objects corroborate 275 tests (273 native plus two UI) without failures, a later 28-test checkpoint and the final normal-flow/leave UI pass. Saved provider records report 56 local checks, and the Release log succeeds. This review inspected saved evidence and screenshots; it did not rerun the simulator or full suites. Exact browser/native visual and motion parity, fresh empty-stack migration replay and release/device/service checks remain open.

Fresh read-only hosted Supabase inspection found no app tables in `public`/`today_private`, no migrations and no Edge Functions. The earlier native audit found phone Auth disabled; this pass did not renew the Auth/SMS configuration check. No hosted changes, deployment or SMS occurred.

The user requested an account-access workshop for onboarding phone verification and Apple sign-in **before moving to shared photos**; see the newer selected account entry above. Existing phone UI is integration UI, not a selected account-onboarding composition. Recommendation recorded in the review: optional Apple/phone account choice after the first plan, a returning-user sign-in route, and reuse from Profile/invites; retain personal tracking without an account. The account composition has since been approved above; Apple support is still not implemented. Current Swift identity and both server functions require a verified phone, so Apple needs identity/reauthentication/deletion changes as well as a button. Do not launch the photo milestone or change onboarding merely because the recommendation is documented.

## Approved website design · November 23

The user chose **Your day, in view** and requested the centered opening: only the original today. signature first; its period lands and the gradient descends; then the same logo moves into the top center before the website appears. Removed the top-left “A little more everyday.” label and “Coming to iPhone”, and replaced the text link with a **Get app** CTA. The latest refinement selects the existing **gray primary-button gradient** instead of the colored CTA.

Latest header/copy refinement: Privacy, Terms and Support align with the settled Today wordmark on desktop; narrow screens center the links directly beneath it. Removed the hero supporting paragraph, habit-preview instructions/reset row and “Today is in development.” footer line. The habit card remains interactive, and Get app retains the explicitly requested preview behavior. The original opening and background motion are unchanged.

`today-site-b.html` is the current website. The alternative is removed from the live comparison; `today-site-a.html` redirects to the selected page to preserve old links. The user explicitly approved the finished website composition: “perfect, this is what we will use.” Its card now belongs in Screens & flows → Website. Preserve the centered opening, logo/nav alignment, gray CTA and simplified copy. Approval is for the design and motion; the download destination and final legal text remain pending, and the site is not published.

`today-site-opening.js` positions the existing Welcome canvas using its own four-second clock. Original letters, period, wash and source files remain unchanged. Period/wash settle before the 2.58–3.65 s move; surrounding UI enters from 3.10–4.00 s. The same gradient remains behind the hero. Reduced Motion and Escape/keyboard skip settle immediately. Replay restarts the same mounted canvas.

The user confirmed **Keep it as a preview for now** for Get app. It discloses an explicit preview message; no App Store destination is connected. Do not invent a listing or imply download availability. Privacy/Terms/Support remain local routes with draft legal text. See [WEBSITE.md](WEBSITE.md) for current behavior and verification. No native code, hosting or domain changes; no publishing. Current browser pass checked the staged motion at 2155 × 1109 and 390 × 844, fixed mobile canvas overflow, verified Get app feedback, legal navigation, logging, keyboard skip/replay and reduced motion.

## Next exploration · Launch animation videos

The user selected **an expressive brand teaser first**, with a **product story second**, and intends to post on **X and Instagram**. Reuse Today’s original logo, gradient, typography, artwork and approved component motion. See [LAUNCH-VIDEOS.md](LAUNCH-VIDEOS.md).

**The user rejected the first read. → move. → breathe. teaser in both formats** and supplied [this Cosmos motion reference](https://www.cosmos.so/e/1394832943). The reference was opened and visually scrubbed in the browser: short opening typography, a New Project control revealing a form, tilted/depth-treated UI, a flowing blue/purple ribbon and a rounded closing mark. Those are observed reference qualities, not approval of a replacement storyboard. Audio was not assessed. Do not continue polishing the rejected word-and-illustration sequence as the selected direction.

**Latest direction: return to the original `Today-Teaser-Reel` as the base.** The user likes its glowing ribbon and asked for a cleaner flowing ribbon with the components following it. Preserve the original 28.5-second A at `Today-Teaser-Feed` / `Today-Teaser-Reel` in `/Users/antony/Documents/ChatGPT/Apps/today-launch-film` (Studio port 4330). Its eight source hashes remain unchanged. The earlier stop-and-go station-route B was rejected; the subsequent mostly anchored Flow proposal is not the chosen base.

**Latest feedback rejects the previous Flow ending:** movement broke after the goal plan, the card floated in the center, and the expanding ribbon/oval around Today obscured the perceived logo animation. Do not treat that 28.5-second revision as approved. Its source is retained at `today-launch-film/review/rejected-orbit-ending/`.

**New revision: `Today-Flow-Feed` / `Today-Flow-Reel`, 30.5 seconds.** The shared route now continues through plan → Your day → both logs. The heading travels with the whole readable card. The latest continuity request supersedes freezing the camera during logging specifically in Flow. After the fill/hold, the camera moves ahead through the same world; one continuous open ribbon bends around the closing space. The separate inflation wipe and small oval are removed. Today’s original animation starts at 24.6 s from its own frame zero, after the card clears, with the original period-linked wash behind the ribbon. The ribbon continues through the final question. New online reference review used [Ordinary Folk’s Webflow Ecommerce](https://www.ordinaryfolk.co/project/webflow-ecommerce); no reference assets were copied.

This new revision awaits creative review. A remains unchanged and available. ESLint/TypeScript, bundle, both aspect-ratio checks and the eight retained A / 28 source-asset hashes pass. No export, publication or native changes. See [LAUNCH-VIDEOS.md](LAUNCH-VIDEOS.md) for links, timing and source boundaries.

Original source assets/CSS and the pinned Breathing engine are copied with provenance hashes; signature curves and loader geometry are sampled from the video frame. Film framing and scene choreography remain proposals. The library UI is the source of truth, but the film uses sample data and compressed transitions, not live app services. The study is separate from the static library and native app. No source UI/assets or native code changed, no export/publication, and no launch-date/download claims.

## Next implementation prompts prepared · November 23

The user requested the next prompts after reviewing remaining native work. [NEXT-NATIVE-PROMPTS.md](NEXT-NATIVE-PROMPTS.md) now sequences: (1) the two task retry fixes, (2) accounts/private backup/recovery, (3) real parties/invitations/shared logs, (4) authorized photos, selected carousel and avatar-heart reactions. The full briefs are `IMPLEMENTATION-TASK-RETRY-FIX.md`, `IMPLEMENTATION-ACCOUNTS-BACKUP.md`, `IMPLEMENTATION-PARTIES-INVITATIONS.md` and `IMPLEMENTATION-SHARED-PHOTOS.md`.

A fresh read-only status check still found clean native `46b8027`; no newer retry fix or service implementation was found. Reviewed native PRD/account/Profile contracts, library party rules, selected invitation/photo components and existing backend deployment boundaries.

**Backend decision: Supabase, using the user's existing project.** The user confirmed “i want to use supabase i have a project created.” Connected read-only inventory verified **today**, project reference **`atfkyrncfszjqmnohhqn`**, region **`us-east-2`**, status **`ACTIVE_HEALTHY`** on November 23. The account/party/media briefs now share Supabase Auth identities, Postgres authorization and private Storage. Do not reopen provider selection or create a replacement project. This pass verified project inventory only: schema, Auth/SMS configuration, Storage policies and native connectivity are not yet verified. Phone OTP still requires its actual provider configuration. No secrets were retrieved or backend changes made.

Party lifecycle/creation decisions marked open in `PARTY-ROOM.md` remain open; the prompts require concrete choices without silently approving Workshop compositions. Supabase selection does not settle those product policies.

These are prepared instructions only. They preserve the library as UI/motion authority and retain all approved launch features, using isolated real-service verification rather than fixture success. No native code, backend resource, deployment or publication changed. Run milestones sequentially and verify each dependency before the next.

## Latest native review · Home To-dos and widgets connected; retry fixes next · November 23

Read-only review found clean native `codex/component-library-migration` at **46b8027**, implementation **fd67a06**. Inspected actual shared task models/SQLite transactions, app store and list, WidgetKit/App Intents, routing, export v5, generator integration and the implementation chat's completion report. Selected **A separate space** Home and both **small next-task / medium short-list widgets** are connected. The task repository is separate from habit/media storage; task mutations do not award habit/global-streak credit. Both installed families and extension-process execution are evidenced in `Documentation/NativeMigration/HomeTodos-Nov23`.

Freshly checked all **25 selected-source hashes** (matched before this documentation update), the saved comparison images, extension-process logs, and actual saved model/UI/Release/backend output. The record supports **219 model tests, 11 distinct focused UI methods, 11 backend contracts and a Release app/extension build** passing across the recorded runs. Earlier failed iterations were corrected and rerun. These are saved implementation runs; this review did not rerun the iOS simulator or full suites.

**Two retry defects remain; use [IMPLEMENTATION-TASK-RETRY-FIX.md](IMPLEMENTATION-TASK-RETRY-FIX.md) next.** (1) Failed Add → Cancel → successful Retry leaves the accepted draft ID active, so changing the next title/day causes a stale conflict. (2) Retry chooses Add whenever the composer is open, so retrying a failed completion can save an unrelated draft instead. Both were freshly reproduced in an isolated macOS logic harness with the actual model/SQLite/store command bodies; Observation decoration and widget side effects were omitted/stubbed. The second probe followed the view's exact retry branch. This is logic evidence, not a new iOS UI pass. Native files remain untouched.

The small-widget typography/strikethrough differences, existing maximum-text header/week-bar overlap, actual-device provisioning/protection and spoken VoiceOver remain documented limits. Fix retry behavior before advancing to account/backup and real party/invitation/shared-media services; all approved launch requirements remain. Habit/Lock Screen widget proposals remain unselected. No push or deployment.

## Previous native review and widget brief · Entry photos complete · November 23

Fresh read-only review found clean native `codex/component-library-migration` at **f4c83f8**, recording implementation **7b6efb2**. Inspected actual entry photo normalization/storage, exact-entry tickets and revision guards, model commits/reconciliation, shared inline photo action, history management and export v4. Local add/change/remove/relaunch, stale callback rejection, failure/retry and portable media export are implemented. Existing amounts, notes, original units/times, timer precision and reporting credit remain separate. Production new-photo eligibility is still unavailable until real party membership; only isolated DEBUG QA enables it. This is not production shared photos.

The saved verification record reports **207 model tests, 13 distinct focused UI methods, 11 backend contracts and a Release simulator build**. Fresh audit independently read the final xcresult's 208-test metrics (207 model + corrected motion UI), confirmed all 13 focused UI passes in their saved logs and the successful Release build, inspected the action comparison image, and checked current component/brief source hashes. An earlier motion test failure has a passing final rerun. These are saved implementation runs; this review did not rebuild or rerun the simulator. Physical-device/iCloud picker, spoken VoiceOver and existing extreme-text Home header gaps remain explicit.

**Latest user instruction: “do all the widgets we already approved.”** This supersedes the immediately preceding infrastructure-only choice. Use [IMPLEMENTATION-HOME-TODOS.md](IMPLEMENTATION-HOME-TODOS.md) to implement the selected **small next-task** and **medium short-list** widgets with the selected **A separate space** Home composition and durable tasks. Their required Home/data dependencies move into this milestone; the earlier to-dos-last ordering no longer blocks this slice. Build real installed WidgetKit families, shared task persistence, safe Complete/Undo/Next commands, timelines, routing and truthful Profile guidance. Keep existing habit/media storage intact. The old infrastructure-only brief now redirects here.

Approval was checked against `HOME-TASKS.md` and catalog IDs `home-tasks`, `task-widget-small`, `task-widget-medium`. Habit/Lock Screen widget layouts remain Workshop proposals; the removed large task widget is not selected. Warm Ember approval covers its artwork/motion, not every containing widget family. Accounts/backup, parties/invitations/shared media and all other approved launch capabilities remain required. A fresh status check still found clean native `f4c83f8`; no new native build or tests were run for this prompt revision.

Updated local library status/prompt only. Native checkout was not edited; nothing pushed or deployed.

## Previous native review · Continuation completion · November 23

**Historical reviews below retain the decisions and baselines from their original passes. Any earlier next-step or to-dos-last instruction is superseded by the latest approved-widget milestone above; use `LAUNCH-SCOPE.md` for the current order.**

Fresh read-only review found clean native `codex/component-library-migration` at **7e1c5a1 — Implement explicit durable trial continuation**. Inspected actual `TrialContinuation.swift`, `TrialReviewView.swift`, entry/model/export boundaries, continuation tests, saved test summaries and the library/native comparison image. The connected route is factual summary/activity → required private reflection → initially unselected Another trial / Make it a routine → selected One plan card → explicit confirmation → Saved. The active old AI review path is replaced; creation planning and readable historical records remain.

Draft stages/choices survive closing and relaunch. Confirmation atomically records the reviewed period and private reflection, installs the next plan under the same habit identity, and retains an idempotent receipt. Future gaps, prior units/revisions, notes/timer precision, reminder eligibility and frozen global streak history are preserved. An expired paused trial cannot bypass reflection by resuming. The complete recap narrative and final reflection/saved composition are still temporary hosts, **not approved final recap parity**.

The native record reports **193 model tests, 11 backend contracts, 15 distinct focused UI methods and a Release simulator build** passing. Freshly read `final-models.json` confirms 193 passed, zero failed/skipped. These are the native implementation session's saved runs; this audit did not rerun simulator/tests. The comparison shows the selected choice/plan components; native date chrome, screen-level temporary hosts, larger-text reflow, physical-device/spoken VoiceOver checks and ordinary OS delivery after a newly continued plan remain documented limits.

**Next prompt: [IMPLEMENTATION-ENTRY-PHOTOS.md](IMPLEMENTATION-ENTRY-PHOTOS.md).** Build durable exact-entry attachments, add/change/remove/relaunch handling and the selected circular photo action. The source's shortcut is party-only: native membership does not exist yet, so preserve explicit eligibility and exercise that context only in isolated QA fixtures until real parties connect. Do not broaden it to all personal habits or fake shared success. Existing-entry history must display real stored attachments. Profile photos are already separate; entry media storage, export handling and the future sharing contract need implementation.

All approved launch features remain required. Entry-photo foundation comes next; habit-widget work, accounts/backup and real parties/invitations/shared media still follow, with Home to-dos/task widgets last before launch. Updated local handoff/scope/prompt only; native checkout unchanged, nothing pushed or deployed.

## Previous native review · Recovery completion · November 23

Fresh read-only review found clean native `codex/component-library-migration` at **7fcaf19 — Implement durable missed-day check-ins and explicit postponement**. Inspected the actual recovery evaluator/transactions, Home integration, review implementation, test sources, saved result summaries and library/native comparison image, plus the native chat's completion report. Recovery now connects the three-closed-scheduled-days policy, durable once-per-run episodes, safe Home presentation, explicit postponement/Undo, scheduling readback and cancellation after reporting. This supersedes the earlier pending/in-progress recovery status below.

The native record reports **172 model tests, 11 backend contracts, 16 distinct focused simulator methods and a Release simulator build** passing across scoped runs. Freshly parsed summaries include 175 passing tests (172 model + 3 UI), final controls 3/3, final accessibility 3/3 and motion 1/1. These are that implementation session's saved runs, not tests rerun in this library pass. Recovery component/brief hashes still match; only handoff, launch-scope and manifest metadata advanced. Recorded typography differences, existing Home crowding at extreme text sizes, physical-device and spoken VoiceOver checks remain open. OS queue acceptance does not guarantee delivery or unattended detection.

**Next prompt: [IMPLEMENTATION-TRIAL-CONTINUATION.md](IMPLEMENTATION-TRIAL-CONTINUATION.md).** Native `TrialReviewView` still has Keep/Adjust/Pause and AI suggestions, and `finishReview` restricts the next start to Today/Tomorrow. Connect the already selected full-width Another trial / Make it a routine controls and One plan card, with durable private reflection/drafts, explicit atomic confirmation and preserved historical periods. No AI advice during review. Keep the current factual summary/reflection controls as temporary hosts; the full recap A/B narrative and final reflection composition remain unselected and must be resolved before claiming completed recap parity. This scopes the approved part of the existing next milestone rather than promoting a Workshop direction.

All approved launch features and the existing order remain: finish trial continuation/recap, entry photos, habit-widget selections/integration, account/backup and party services, then Home to-dos/task widgets last before launch. This review and prompt update changed library documentation only; the native checkout was not modified, and nothing was pushed or deployed.

## Earlier release-readiness check · November 23

The user asked how much remains before App Store launch. A fresh read-only check found native HEAD still `fcbb872`, now with uncommitted recovery/check-in/snooze implementation and tests. Count that as **in progress**, not complete; preserve the other agent's work. The earlier clean-tree observations below describe their original checks. No native build/test run was performed here.

The full release still needs the remaining approved feature milestones and integrated release verification. The planner README explicitly states that its service is local and undeployed; production AI hosting/auth/access limits must be included alongside account/backup and social services. App Store signing/account state has not been verified. See the updated [launch scope and App Store readiness check](LAUNCH-SCOPE.md) for pending feature work, physical-device/TestFlight checks, store materials and current Apple requirements relevant to shared content, account deletion and AI-data permission. No feature was dropped, no new UI selected, and nothing was pushed or submitted.

## Reminder approval and implementation brief · November 23 (historical baseline)

The user approved the preview and the explanation of when it appears: **“okay yea, this is fine. give me the updated prompt.”** The missed-day card and **Remind me later** interaction are now selected. This replaces the earlier no-snooze decision and exploration-only hold. The card is classified in Components; native integration remains pending.

Approved timing and placement: after **three consecutive closed scheduled days without a reported outcome**, show a nonblocking check-in on the next safe Home opening **above the habit cards**. Days off do not count, today stays open, and partial/zero/None today count as reports. Show once per missing-report run. View habit opens that habit's existing detail; × dismisses the episode; Remind me later explicitly postpones it. Logging before the chosen time cancels it. Preserve ongoing logging/creation/edit/share flows, regular reminders, quiet hours and permissions.

Use [IMPLEMENTATION-REMINDER-RECOVERY.md](IMPLEMENTATION-REMINDER-RECOVERY.md) as the replacement native prompt, and [REMINDER-CHECKIN.md](REMINDER-CHECKIN.md) / [the preview](reminder-checkin.html) as the UI reference. The preview's 15-minute / 1-hour / 7 PM choices are initial implementation defaults, with no preselected delay; they were not separately specified as a global snooze preference. The brief records conservative quiet-hour/passed-time rules and native failure/Undo requirements. Keep platform-owned notification presentation distinct from the in-app card.

A fresh read-only native check still found clean `codex/component-library-migration` at **fcbb872** with ordinary reminders, no recovery/snooze implementation. This pass updates the prompt and approval records, not native code. All approved features remain required before launch; to-dos/widgets still go last. No push or deployment.

Prior browser verification for the selected specimen: desktop and 390 × 844 CSS viewport, Enter/Escape, Cancel, Undo and dismissal, focus restoration, no phone overflow, and reduced-motion override (0 ms instead of the shared 600 ms layout transition). These are the prior browser study's checks, not new native/runtime verification.

## Launch scope confirmed · November 23

**The user wants to launch with all features explicitly approved in this library.** Parties, real invitations, photos on logs/shared check-ins, account/backup support and the selected Home to-do space plus small/medium widgets belong in the first release. “To-dos last” means last in implementation order **before launch**, not deferred to a later release. The missed-day check-in with Remind me later is selected; see the latest entry above.

Read [LAUNCH-SCOPE.md](LAUNCH-SCOPE.md) before planning the next native milestone. It maps selected designs to actual native status and remaining work, distinguishes unresolved Workshop studies from approved features, and records the existing implementation order. Native `fcbb872` remains a local foundation, not a launch-complete app. In particular, the older Keep/Adjust/Pause review is not yet the selected continuation flow; party/invitation/media services, cloud/account destinations and task widgets are absent. Completing the remaining design decisions and service dependencies is part of finishing launch scope, not an implicit reason to drop an approved feature.

This direction does not choose every Workshop variant, require a separate app screen for every reusable primitive/loader, or authorize publishing the current build. Keep new source selections and native runtime evidence distinct. The next prompt is missed-day recovery with Remind me later; all later implementation prompts must preserve this release-wide scope.

## Previous native audit and recovery prompt · November 23 (historical baseline)

Inspected `/Users/antony/Desktop/Projects/today`, branch `codex/component-library-migration`, clean HEAD **`fcbb872` — Use Breathing preparation with continuous gradient transitions**. This follows implemented global streaks (`d1f8fb6`), preparation request ownership (`77b6055`), timers (`9a18c35`), reminders (`e0a8b52`), Profile (`590a924`) and plan revisions (`069f24d`). The latest source mounts the supplied Breathing orb at 80 pt and retains a shared background owner through Describe/Introduction → preparation → Tracking, including reversal, immediate results and Reduce Motion. Existing planning/persistence models were not replaced by that update.

This audit read the actual diff, transition tests and saved verification evidence, reviewed the browser/native comparison image, and freshly compared the supplied wrapper plus 17 package files: all 18 match the current local library byte-for-byte. The saved final test log records **147 unit/model tests passing**, with simulator preparation/regression runs and Release build documented in native `Documentation/NativeMigration/PreparingBreathing-Nov22/README.md`. These are the native session's recorded runs, not a new full simulator test run here. That record retains an unexplained initial UI timeout that passed on rerun, and outstanding spoken VoiceOver/physical-device/extreme-text checks; do not erase those qualifications.

**Next implementation prompt: [IMPLEMENTATION-REMINDER-RECOVERY.md](IMPLEMENTATION-REMINDER-RECOVERY.md).** The user corrected the ordering: finish the previously planned habit-app work first; to-dos and their widgets go last. The next contained slice is the one-time check-in after three consecutive missed scheduled days. Preserve the existing planner/scheduler, booking ledger, notification routing, quiet hours and per-habit opt-in. The latest entry above selects the check-in composition and Home placement; reuse that source.

**Historical November 23 decision (fully superseded by the approval above): no snooze.** The user explicitly rejected reminder snooze; remove it from the implementation scope. There is no delay preference to resolve and the provisional 15-minute suggestion is withdrawn. This supersedes older PRD/design references that require snooze. Per-habit reminder on/off, OS notification permission and quiet hours remain separate controls. Dismissing a check-in does not postpone it or turn notifications off. The native agent must reconcile its older documents with this decision. A fresh source check still shows clean `fcbb872` with no snooze implementation; no native code or notification setting was changed in this library pass.

Implementation sequence restored: (1) missed-day recovery; (2) settle the remaining trial-recap layout and connect reflection/continuation; (3) photos on individual logs; (4) the existing habit-widget work, subject to its remaining design selections; (5) accounts/backup and habit-party services; (6) Home to-dos and their small/medium widgets. This is the earlier proposed queue with the user's explicit to-do deferral and latest Remind me later approval applied, not approval of unresolved UI or services.

[IMPLEMENTATION-HOME-TODOS.md](IMPLEMENTATION-HOME-TODOS.md) is retained as a **deferred-in-order, required-before-launch** brief. Native Home still displays habits only; there is no task store or widget extension, and Profile's Widgets page remains unavailable. The selected to-do designs remain selected, but selection does not make them the next implementation task. No to-do implementation is authorized ahead of the earlier habit-app queue.

The selected Home/widget browser page was inspected again for this handoff. Its unpublished local files are the visual authority; the older published pin and the native handoff's blanket Home-Workshop statement are stale for this specific selection. Other Workshop layouts remain proposals. This pass changes library documentation only; native code is untouched, no implementation is claimed for to-dos/widgets, and no push was requested.

## App UI source of truth · November 22

**The user explicitly designated this library as the source of truth for the Today app UI and design system, including existing native screens.** App implementation is a migration to these components and selected compositions, not merely inspiration from them.

- Use the actual component source, assets, live previews and documented behavior to reproduce typography, colors, gradients, surfaces, borders, spacing, geometry, states and motion. Preserve interrupted-transition behavior and Reduce Motion.
- Reuse supplied SwiftUI components where available. Port approved browser-only components faithfully into shared SwiftUI components; reuse those throughout the app. Keep original supplied source files intact. Gallery navigation, iframe infrastructure and fictional data are not product UI or dependencies.
- The existing native app supplies working behavior, services and persistence to preserve and extend. Its legacy visual implementation does not override the library. Reuse native UI only where it matches the current library direction; reconcile older Figma/app design-spec references with the latest explicit decisions and selected library designs.
- Approval remains specific: selected components and Screens & flows are implementation references. Workshop compositions remain proposals unless explicitly approved. A selected component inside a proposal can be reused without approving the entire screen.
- Start with the shared native design-system/component layer, then migrate Home/Habits navigation, habit cards and individual detail/history, followed by selected onboarding/setup. Adapt models where those screens require it, preserving existing data. Compare each simulator screen with its library preview at matching reference dimensions and resolve visual and motion differences before declaring parity.
- The user supplied a VS Code source audit reporting an already connected native prototype with generation, logging, editing and local JSON persistence. Build on that work; do not restart the app. This handoff update does not independently verify its native runtime behavior.

Read [IMPLEMENTATION-START.md](IMPLEMENTATION-START.md) for the updated VS Code Codex instruction. This latest direction supersedes the earlier emphasis on implementing a functional core slice before establishing UI parity. The user authorized pushing this documentation update to GitHub; native app changes remain local until separately requested.

## Motion standard reaffirmed — November 22

The user explicitly made the corrected trial-length dropdown the standard and requires exact motion/animation fidelity whenever library UI is implemented. Reuse the common disclosure foundation for all Today-owned dropdowns and inline expansions; preserve other components’ own source-specific choreography. [INTEGRATION.md](INTEGRATION.md#required-motion-fidelity--november-22) defines the acceptance process: inspect live source, compare recordings/intermediate frames, verify interrupted transitions and Reduce Motion, and report unresolved differences rather than declaring parity. This is a guidance update, not a new native runtime verification or approval of Workshop compositions.

## Start here

- Local repository: `/Users/antony/Documents/ChatGPT/Apps/today-component-study`
- Source repository: https://github.com/tltoan/today-components
- Published library: https://tltoan.github.io/today-components/
- Read `AGENTS.md` first, then `INTEGRATION.md` and the relevant component contract. `components.json` maps previews, readable browser code, native files and dependencies; `source.html` and `llms.txt` are public source entry points.
- Inspect `git status`, recent commits and the actual implementation before changing anything. Uncommitted work may belong to an active task.
- Native app and design documents: `/Users/antony/Desktop/Projects/today/`. Consult its current PRD/design files when product context is needed. Do not modify the app as a side effect of a library request.
- Figma file: `Xf03CH47k7G0graqTZ4zis` (today.). Treat old screens as context; the explicit selections below and AGENTS.md supersede rejected alternatives.

## Design and collaboration direction

Today is a calm, dark habit app: black shared backgrounds with restrained blue/lavender/peach wash, graphite surfaces, soft borders, roomy touch targets, original purple illustrations and the existing typography. Reuse the current implementation and tokens rather than starting a new style.

The user values polished motion and precise alignment. Make each interaction feel continuous and responsive: preserve mounted elements, animate from current state, handle rapid reversal, and settle. Avoid abrupt fills, clipping, crowded pills, mismatched margins, redundant labels and motivational filler. Use short functional copy. Keep implementation notes in documentation or demo controls, outside product compositions.

Act on specific feedback without repeatedly asking permission. When exploring, build interactive comparisons in the library. When a direction is selected, remove the superseded live UI and unused component variants. Keep alternatives only when the user explicitly asks to retain them. Explain actual changes and verification briefly; never claim native/backend behavior from a browser mockup.

## Selected components and layouts

- Opening: existing animated today. + “what will you do?” + gradient. Compact intro directly above library. Landing and Features remain approved; no extra library header or landing CTA/legal text.
- Navigation: Center cradle, Home/Habits and independent +. Fluid selection deforms beneath the divot, subtle rim, equal vertical insets. + is not connected to creation in the preview.
- Disclosure/dropdowns: shared 600 ms motion. Agenda: single snap controller, one day per movement. Step progress: Active pill.
- Target attained: stronger Gradient Rise, confirmed crossing only; reverse smoothly on undo below target. Additional quantitative logging stays available. Logged and target met are different states.
- Overall streak: Warm Ember on Home, outside individual habit cards. Counts reporting, not target attainment.
- Trial duration: live Day Ruler plus custom days. Reminder: Soft Wheels, draft/confirm/cancel. Schedule card and moving segmented pill are approved.
- Onboarding: approved landing/features; Portrait & color after Features; Describe uses A background + B input; B privacy/introduction/tracking/schedule/review/saved/home; target uses A with a panel. Seven habit setup positions include trial length, start date and optional reminders. No skip or Build/Break choice. Intent comes from text. Review has no redundant Edit trial length/Edit reminder shortcuts.
- Habits: Weekly view. Floating cradle has a transparent wrapper. Habit detail: Grouped cards. History: Entry journal, last three calendar days, expandable older entries. Existing weekly schedule editor for adjustments and separate reminder card.
- Recap: A/B narrative drafts retained; One plan card is the selected plan editor. No amber/newest-recap recoloring, no automatic continuation. Plan labels use “Schedule:”.
- Profile: C expandable groups with B identity card. No “Your profile” filler or Haptics option. Phone number inside Account. Destructive action has separate confirmation.
- Identity: seven supplied faces (Loop, Tilt, Mellow, Dash, Drift, Skeptic, Lift), twelve gradients, optional uploaded photo. Tilt default. Face arrows change features only inside a stationary disk. Swatches blend gradient stops smoothly, including rapid retargeting. No face/color caption. CTA Save profile. One confirmed identity carries across onboarding, Home, Profile and current-user party avatars; friends stay independent. Read PROFILE-IDENTITY.md and FACES.md.
- Loaders: circle/globe and liquid orbit remain approved components. The latest preparation-screen correction selects **Breathing**, retaining the soft screen wash and adding a continuous transition from the preceding screen. The curved signature is approved too, alongside the original opening. See LOGOS.md and HABIT-THINKING.md.

## Habit party rules and direction

- Maximum four people including you; private party shares one scheduled-day pattern.
- Targets, recorded amounts and reminder preferences are personal. Logs for that habit are automatically shared; photos optional. Entry notes are shared with the habit party by default and may accompany photos. Other habits, trial reflections and overall Home streak remain private.
- Shared party streak grows when every eligible member has a saved log on a scheduled party-local day. Partial and zero logs count. Days off preserve it. Current incomplete day stays open. Use dated roster and calendar coverage, not today's roster retroactively.
- Overlapping avatar stack on the upper-right habit-card rim is selected. Lead avatar is a separate compact alternative. Missing photos use deterministic varied gradients; saved face/gradient identity is preserved.
- Selected invitation: compact Book cover with illustration/overlap, shared days, proposed dates, members' personal targets, own target and Join CTA. Other live invitation variants removed. Proposed invitation entry belongs in Habits, not Profile.
- Party activity now selects the On the photo (B) carousel: person/time bottom-left, exact amount bottom-right, no visible photo count. Confirmed likes use overlapping avatars with heart badges and a separate Like/Liked action. Superseded date-first activity has been removed. Streak card keeps only streak, current date and progress dot with logged count.
- Reactions show the reacting person's avatar with a heart badge. Nudges have button and slider comparisons with confirmed Gradient Rise, per-recipient states and blocked reasons. Keep compact nudge surfaces free of repeated message/success/window copy.
- Per-person trial review and party creation at plan review are proposals. Shared schedule editing, lifecycle eligibility and timezone policies still need product decisions; do not silently invent them.

## Source and quality boundaries

- Static HTML/CSS/JS custom elements; no build step. Serve repository root on port 4318.
- Preserve supplied SwiftUI/artwork/reference files byte for byte; use separate namespaced versions for adaptations. Explicitly list native dependencies so another agent can compile them.
- Browser gallery data is fictional/local. Profile identity uses a localStorage demo adapter; native identity has a host persistence closure. No real account, plan, party invite, notification, upload service, backup or deletion occurs.
- Verify changed JavaScript syntax, source/asset links and components.json. Review desktop and 390 × 844, keyboard/focus, reduced motion, reversal/interruption and pertinent failure states. Swift type-checking is not native runtime verification.
- Latest publishing instruction: the user explicitly authorized pushing this accumulated library snapshot to GitHub on November 21, 2026, superseding the earlier local-only hold for this release. Include photo commit 5338828 and the subsequent library refinements. Keep source/docs in sync; this does not authorize unrelated future releases.

## Latest work

The prior addition is the supplied rounded-t / optional curved-y logo. Its files are `components/logo-curved.js`, `logo-variations.html`, `native/TodayLogoCurvedAnimation.swift` and byte-identical `native/reference/TodayLogoCurvedVariation.swift`. Companion work carries confirmed animated portraits into Home/Profile and simplifies party activity/streak/nudge copy. Check git status and the final validation note in README.md for what has actually been verified/published.

## Latest decision · Shared check-in photos

The user requested three variations of the Shared check-ins UI component, then selected **B / On the photo**. `party-photos.html` now leads with that choice; The earlier Photo journal and Filmstrip comparisons have since been removed per the user’s UI-retention rule. The amount moved to the image’s bottom-right, opposite the person/time; the visible photo count was removed. Photo likes now reuse the overlapping avatar stack with heart badges for each confirmed reactor, plus a separate Like/Liked action. The selected carousel is used by `today-party-room`, including habit detail’s Party view. Reuse `components/party-photo-carousel.*`, `today-party-reactions variant="stack"`, `today-avatar-stack badges="heart"`, shared 600 ms disclosure and SnapScroller’s optional horizontal axis. Photos retain their original entry IDs and amounts; no-photo logs stay accessible. Read PARTY-PHOTOS.md and the current README verification note. This is browser-library integration; native app and backend unchanged.

## Latest decisions · Log notes, photo actions and recap choice

- Optional notes belong to individual log entries. `today-log-editor` saves amount + note in one request/confirmation; no note-only activity. Add a note uses the shared 600 ms disclosure and focuses text only on explicit activation. Save failures preserve both fields. Recorded zero / None today stays separate from missing activity.
- History shows a single muted preview line; entry details edit the full note and amount together. `today-log-memories` displays host-selected, verbatim entry notes in recap. Trial reflections remain distinct and private.
- Party entry notes are shared by default, alongside optional pictures. This supersedes the old private-notes rule for party logs. The selected photo carousel shows the current entry's note below the photo, preserving the bottom-left person / bottom-right amount and stacked heart avatars.
- User selected the circular photo icon on the **same row beside the logging button**. `components/log-photo-action.*` appears only for a confirmed party entry; pill/full-width row alternatives removed. `photo-actions.html` matches the referenced Home card width inside a 390 px frame.
- User selected **A / Full-width choices** for trial vs routine continuation. Used in both recap narratives; B Two cards and C Sliding pill removed.
- New retention rule: do not keep superseded UI just because it was explored. Retain an alternative only when explicitly requested. The outdated standalone shared check-in card and earlier carousel comparisons have been removed; unrelated areas are not silently redesigned.
- All current work is browser-library implementation with local fixtures. No native app, account persistence, uploads or production sharing was added. The earlier local-only hold is superseded for this release by the latest publishing instruction above.


## Latest placement decision

Latest notes correction: quick logging remains one tap on Home and habit cards, including inside detail. Notes are entered only from an individual habit’s history: Add a note → choose an existing entry → edit its note. An entry still owns the note; no note-only activity. This supersedes the interim editor attached to quick-log buttons. Timer logging is quick again. Selected photo action remains circular and beside the logging button.


## Latest decision · Three library spaces

The user wants **multiple pages with many previews visible together**, explicitly rejecting a one-selected-item browser. `index.html#library` is the Components masonry board, `screens.html` is Approved screens & flows, and `workshop.html` is unapproved/current work. Search and category filters narrow a board; state menus change only the corresponding card. Reuse existing focused pages and components, keeping their motion and phone dimensions. `library-catalog.js` is the categorization map; see LIBRARY.md. Selected primitives inside Home/party/recap proposals do not approve those complete screens. The notes editor remains in Workshop for visual review; placement in individual habit history is decided. Publication of this snapshot is now authorized.


## Latest library refinements

- Page navigation reuses `today-segmented-control` and its sliding highlight. The original animated logo + gradient appears above **all three pages** and stays mounted while switching spaces. The separate small wordmark is removed. URLs and browser Back/Forward still work; each visited space retains its examples and filter state.
- Masonry remains for Components and Workshop. Approved screens & flows uses a wide **Onboarding** section with ordered steps and a live preview, followed by an aligned screen gallery. The flow was previously titled “Create your first habit”; use Onboarding. Both direct step selection and in-preview navigation keep the outline current.
- **Liquid orbit and Curved signature are explicitly approved** and moved from Workshop into Components. Both remain available alongside the existing circle/globe and original logo; this is not an instruction to replace the opening artwork.
- Gallery corrections: target-feedback demo buttons have 24 px separation; Center cradle preview clears its inherited phone offset; step-demo Previous / Step / Next controls are centered over the full preview.
- Avatar stacks now animate saved face portraits using the existing renderer, with `still` as an opt-out. Photos retain precedence; reduced motion and offscreen suspension remain. This supersedes the earlier still-stack rule for browser components. Lead avatar is unchanged.
- Logging streak’s library card now uses the existing animated Warm Ember flame at a larger scale, with large/compact states and Replay. The gallery plays it once on first view, then it settles; no idle flame loop or change to production Home’s badge size.

## Latest refinement · One habit and its party

- User asked to consolidate the individual habit and the extra “Your habit party” destination. The individual habit now keeps one header and logging area with the reused sliding selector: **Your activity / Party**. Progress, history and plan editors stay in Your activity; the existing shared room is embedded in Party. The extra entry row and habit-detail party dialog are removed. Tapping the approved avatar stack selects Party. Non-party habits have no selector. This is a requested browser refinement; the overall party composition remains under review in Workshop.
- Invitations previously linked out to the component study. The Habits row now opens the selected Book cover invite inside the same phone; Back / Not now returns focus to the row. Dates, shared schedule, individual targets, target choice and sharing scope appear before Join. The gallery simulates joining only; no real membership change.
- User flagged the party summary circle’s fill. Replaced the pie wedge with a 28 px SVG progress ring, a consistent 3 px stroke, starting at twelve o’clock. Fill is logged / eligible people; 0 is empty, all is a complete ring, and a day off has no progress fill. Shared-streak rules and source data are unchanged.
- Publication of this snapshot is now authorized; native app and backend remain unchanged.

Validation for this refinement: desktop library + 390 × 844 preview, keyboard view switching/return focus, reduced-motion selector, local invitation join, retained party member, personal note chooser, confirmed quick log, non-party fallback, and every 0–3/3 ring boundary plus day off checked. Five changed JS files pass syntax checks; 1,889 HTML links / 68 manifest entries resolve; eight existing party-progress assertions pass. An isolated MutationObserver error appeared while navigating the temporary mobile fixture; it did not recur across five subsequent fixture navigations, and the live screens/invitation tabs reported no console errors. Native sources untouched.

## Implementation handoff

The user considers the component foundation sufficient to begin app implementation and requested a prompt for their existing VS Code Codex session. Use `IMPLEMENTATION-START.md` and the November 22 UI source-of-truth direction at the top of this file. Establish the shared native components from the library, then migrate connected screens while preserving and extending the existing app's working services and persistence. Verify the connected creation → Home → log → habit history loop as the migration progresses. Public-release account/backend work and unfinished design selections remain separate. Publishing this library does not mark Workshop compositions approved.

## Latest work · Thinking orbs and creation waiting layouts · November 22

The user requested all nine loaders from haplollc/ThinkingOrbs in Swift and in this library, plus a Workshop for the wait after describing a habit. That repository already supplies SwiftUI. Its original MIT source is vendored unchanged at `native/vendor/ThinkingOrbs`, pinned to `7b09b5f`; `native/TodayThinkingOrb.swift` supplies Today’s host binding and native specimen. The matching web engine is pinned to the Swift port’s reference revision, with original source, licenses and reproducible readable modules. See THINKING-ORBS.md. All nine appear in Components. The later selection below chooses Liquid orbit for habit preparation; circle/globe remains approved.

The initial waiting study had centered, inline and compact-panel proposals. The user subsequently selected **centered + Liquid orbit**, asking for a less strong gradient that is not too dark. `habit-thinking.html` now retains only centered, with Liquid orbit’s `palette="soft"` and a subtle visible Today wash. It moved to Screens & flows. Earlier inline/panel variants are removed; state controls remain. Reuse the existing Describe/Tracking, preserve wording and request ownership, and keep the existing first-run Privacy/Introduction before a real request. This remains a browser reading fixture until integrated into the native planner. See HABIT-THINKING.md.

New preview is served on port 4320 because 4318 is currently owned by the native project’s reference server. These changes remain local; no new publish instruction was given.

Verified this pass: 31 upstream source hashes, 18 presets / 72 browser reference frames, Swift package’s 13 default tests plus a native Canvas contact sheet, and iOS 17 simulator-target compilation. Desktop + actual 390 × 844 browser checks cover pause/reduced motion, keyboard loader selection, question/answer → existing Tracking, retry/edit/stale-result cancellation, Close retaining the draft without submission, and per-card layout switching. All 70 manifest entries and local HTML links resolve. Full scope and limitations are in README.md; native Today runtime integration remains pending.

## Native handoff after timers · November 22

Inspected `/Users/antony/Desktop/Projects/today`, branch `codex/component-library-migration`, clean HEAD `9a18c35`. Timers have durable session IDs/clock snapshots, atomic consumed-session logging, precise durations, recovery and existing reminder integration. Fresh focused audit: 18 timer model tests and 11 backend contract tests passed. Existing simulator captures were reviewed; a complete new UI sweep was not run. One source-preservation correction remains: duration support edited `Library/Supplied/StaggeredBarChart.swift` in place and should move to a named adapter with the original restored.

Next native slice is the selected centered preparation screen wired to the existing real planning service. Read IMPLEMENTATION-PREPARING-HABIT.md. Use this local library revision (new selection is not published). Preserve timers and all prior migrations; strengthen current-request identity, cancellation, draft restoration, first-run privacy ordering and fallback handling. This library pass does not modify the native app.

## Next native handoff · Global logging streak · November 22

The user requested the next native implementation prompt for the global streak using the library's fire animation and design system. Read [IMPLEMENTATION-GLOBAL-STREAKS.md](IMPLEMENTATION-GLOBAL-STREAKS.md). It covers date-specific eligibility, frozen historical participation, current-day corrections, safe migration, atomic saves, timer/day-boundary reconciliation and the selected Warm Ember motion. Integrate the compact global badge on Home outside habit cards; this does not select the entire Workshop Home composition or a per-habit/party streak.

Current source check: native HEAD remains `9a18c35`, with centered preparation and chart-source cleanup present as uncommitted work. The prompt instructs the native session to finish/checkpoint that slice first and preserve all prior migrations. The live Warm Ember preview and source were inspected; no native files were edited or tests run in this handoff pass. The flame currently has browser/SVG source, so the prompt requires a faithful shared SwiftUI port, including the separate core motion that the downloadable animated SVG omits. This documentation does not mark native streaks implemented. Changes remain local; no push requested.

## Latest correction · Breathing and the gradient handoff · November 22

The user corrected the preparation loader to **Breathing** and approved the existing subtle screen background. They want to see the preceding screen's gradient animate into that background. This supersedes the Liquid orbit choice specifically for habit preparation; it does not remove Liquid orbit from Components.

`habit-thinking.html` now starts at the reused Describe screen. Build my plan transitions into centered Breathing; Replay transition stages Describe for 1.1 seconds before the local six-second example. The library's Screens & flows embed still opens on Waiting. One mounted `today-onboarding-gradient` owns the source and destination paint planes: the original onboarding wash moves/fades into the unchanged blue/lavender/peach preparation wash using 640 ms, a 65 ms delay and cubic-bezier(.24,.74,.26,1). Edit reverses from the presented state. Nested setup screens no longer cover this shared wash with their own background; other onboarding consumers are unchanged. First-run Privacy/Introduction and real request ownership remain required in native integration.

Reuse `today-thinking-orb` with `design="breathing"`, `diameter="80"`, and its unchanged upstream geometry and lifecycle. Native counterpart: `TodayThinkingOrb(.breathing, diameter: 80)`. The screen background carries the color; the orb retains its original monochrome depth. Updated HABIT-THINKING.md, dependency/source references and IMPLEMENTATION-PREPARING-HABIT.md record this correction for the native agent. No native app code or upstream loader source changed; no push.

Verified desktop and 390 × 844: same wash node throughout, sampled forward motion and reversal at 250 ms, no horizontal overflow, preview Reduce Motion still at 0.600, keyboard state selection, replay through Tracking, and Edit preserving the description after the cancelled six-second example would have completed. No browser errors observed. Three changed JS files pass syntax checks; 70 manifest entries/dependencies and affected local links resolve. This was browser preview verification, not native runtime testing.

## Native update prompt · Breathing · November 22

The user requested the app update prompt for the new Breathing selection and continuous gradient transition. IMPLEMENTATION-PREPARING-HABIT.md is now a focused update to the existing native implementation. Fresh source check found clean native HEAD `d1f8fb6` (global streaks) after `77b6055` (preparation). The app still uses Liquid orbit and a separate preparation background; the prompt replaces the loader and moves both paints under a stable flow-level owner, preserving working request behavior and the newly committed streaks. This is a source/status check only, not a fresh streak audit or native runtime verification. No native files changed, no push.

## Initial Workshop · To-dos on Home + widgets · November 22 (superseded by selection below)

The user requested three interactive variations using the existing library. `home-tasks.html` now compares **A Below your habits**, **B One thing next**, and **C A separate space (Habits / To-dos slider)**. Each has a matching medium, small or large widget. All three appear as separate cards in Workshop under Current work; no direction is approved. See `HOME-TASKS.md`.

The live Home component, habit cards, week bar, profile, Warm Ember badge and cradle stay mounted. New controlled task views reuse the checklist mark/check motion, shared 600 ms disclosures, Today buttons/segmented controls and fixed widget families. Each pair supports local add (optional day), completion/Undo, older completed items, future items under Later, and widget-to-Home opening. The focus direction adds Next and an expandable remainder. Four state controls cover a few tasks, empty, all done and long titles. Tasks never create habit log entries or change the fire streak.

These are disposable browser examples, not native task storage or WidgetKit/AppIntent functionality. No native app files were changed. No push was requested for this pass; the comparison is local at `http://127.0.0.1:4320/home-tasks.html`. The separate native Codex work remains independent.

Verified this pass: desktop three-up view and an actual 390 × 844 CSS viewport (no horizontal overflow); all three fixed widget sizes and long-title containment; widget completion reflected on its paired Home, keyboard Space Undo, independent pair state, Enter to add, required-title validation, Escape/focus return, future-date Later access, completed restoration, keyboard Habits / To-dos selection and widget return. Habit quick logging still changes only its habit; task actions leave the three sample streaks at six. Shared disclosure reports 600 ms normally and zero under Less motion. Workshop has ten studies including the three new entries; its embedded state selector updates only the selected pair. JS syntax, diff whitespace, all 71 manifest entries/dependencies and affected HTML links pass. No errors/warnings in the focused preview. Native UI, Dynamic Type, persistence/sync and real widget delivery were not implemented or tested.

## Latest selection · Home to-dos and widgets · November 22

The user selected **C · A separate space** for Home, **A’s medium short-list widget**, and **B’s small next-task widget**. Treat these three surfaces as selected UI. This does not approve the original Home A/B compositions or the large task widget.

`home-tasks.html` now presents the selected Home with both selected widgets, all driven by one local task model. Home moved to Screens & flows (`home-tasks`); medium/small widgets moved to Components (`task-widget-medium`, `task-widget-small`). The three comparison cards and older standalone Home Workshop entry are removed. Previous gallery hashes route to the selected Home. Superseded layout branches and the large task widget were removed from the task component; the shared underlying Home source is preserved. See HOME-TASKS.md.

Preserve the existing sliding highlight, checklist check feedback, 600 ms disclosures, typography, widget sizes and all habit card/cradle motion. Quick task completion stays separate from habit logs and global streaks. This selection is browser UI only; native persistence, sync, WidgetKit/AppIntents and app integration remain separate work. No native files changed and no push requested.

Selection-pass verification: one Home plus two widgets at desktop and an actual 390 × 844 viewport, no horizontal or widget overflow (including long titles); medium completion updates Home/small, keyboard Undo restores all three, Enter capture updates all counts, widget Open selects To-dos, and reduced-motion disclosure settles at zero duration. Approved Home embed and both selected component embeds load; widget state menus work. Workshop now has six remaining studies. Four changed JavaScript entry points pass syntax checks, diff whitespace passes, and all 72 manifest entries/dependencies plus affected HTML links resolve. No focused-preview console errors were observed. The gallery emitted the previously seen transient MutationObserver errors while rapidly switching mounted iframe collections; the selected Home/widget cards remained functional. Native integration was not tested.
