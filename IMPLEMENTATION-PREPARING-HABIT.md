# Native update · Breathing and the continuous preparation gradient

November 22, 2026. Latest user selection: **Breathing**, centered, keeping the existing subtle blue/lavender/peach screen wash and animating into it from the preceding screen. This supersedes the earlier Liquid orbit selection specifically for habit preparation. Other approved loaders remain library components.

Current source check: native `/Users/antony/Desktop/Projects/today`, branch `codex/component-library-migration`, clean HEAD `d1f8fb6` (global streaks), following `77b6055` (centered preparation). `LibraryHabitPreparation` still mounts `TodayLiquidOrbitLoader(palette: .soft)` and paints its own `LibraryPreparationWash`, while `LibraryCreationFlow` independently owns `LibraryCreationWash`. This update should adapt those existing views and preserve their working request lifecycle. The source check did not rerun native tests or independently validate the new streak implementation.

Paste the following into the existing native-app Codex session:

```text
Continue in /Users/antony/Desktop/Projects/today on codex/component-library-migration.

Update the existing habit preparation screen to the latest approved library design: the Breathing loader and a continuous transition from the preceding screen's gradient into the preparation background. This supersedes Liquid Orbit for this flow. Implement the update, verify it and commit locally; do not push or deploy.

First inspect git status and the current handoff. Last observed clean HEAD: d1f8fb6, after preparation commit 77b6055. Preserve global streaks/Warm Ember, durable timers, reminders, Profile, plan revisions, logging/history/notes, creation drafts and all prior design corrections. Work from the current checkout without resetting or reverting anything.

Read app AGENTS.md, CHAT-HANDOFF.md and design-specs.md. Then read the latest LOCAL library, including unpublished changes:
/Users/antony/Documents/ChatGPT/Apps/today-component-study

Required references:
- CHAT-HANDOFF.md, INTEGRATION.md, HABIT-THINKING.md and THINKING-ORBS.md.
- components/habit-thinking.js and components/habit-thinking.css.
- components/onboarding-gradient.js/css and components/thinking-orb.js/css.
- native/TodayThinkingOrb.swift and native/vendor/ThinkingOrbs.
- Live preview: http://127.0.0.1:4320/habit-thinking.html. Use Replay transition, Build my plan and Edit description. The source is the current local library, not just the older published pin. Record the relevant source hashes.

1. Replace the preparation loader with the actual Breathing component.

The existing LibraryHabitPreparation currently uses TodayLiquidOrbitLoader(palette: .soft). Use the supplied TodayThinkingOrb wrapper with .breathing, regular tuning and diameter: 80. Add the unchanged pinned ThinkingOrbs package to the native project if needed; keep it self-contained in the native repository rather than linking to an absolute external checkout. Preserve upstream source and MIT attribution. Update the project's generation/dependency configuration as well as the generated Xcode project where applicable.

Use the original monochrome depth, geometry, breathing motion and speed. The blue/lavender/peach gradient belongs to the screen, not a new tint on the orb. Do not approximate Breathing with a generic scale pulse or redraw it. Preserve the wrapper's inactive/background behavior and the package's representative Reduce Motion still. Mount/animate only during the current real pending request. Keep the existing 80 × 80 slot, centered composition, typography, original wording and Edit description action. Keep the orb decorative when the accompanying status is already accessible.

2. Make the background continuous across screen changes.

Currently LibraryCreationFlow owns LibraryCreationWash, but LibraryHabitPreparation paints a separate opaque LibraryPreparationWash. Consolidate this into one stable background owner outside the changing content. Retain both paint layers through transitions rather than replacing the background when pending appears. Preserve the existing approved preparation wash colors and settled geometry; remove the child backdrop that covers the shared transition.

Match the actual source CSS:
- Duration 640 ms, delay 65 ms, cubic-bezier(.24,.74,.26,1).
- Source: the existing onboarding wash, fading out while moving down by 16% of its two-screen-height paint plane. For the top/Describe source, that displacement is 0.32 of the viewport height; do not misread it as 16% of the phone height.
- Destination: the retained blue/lavender/peach preparation paint, fading from 0 to 1 while translating from −16% of its two-screen-height plane to its settled position.
- Base transitions from #000 to #0A0A11. Copy exact radial geometry, stops, alpha and compositing order from the current CSS rather than inventing new colors.
- Keep the background fixed to the full viewport, independent of keyboard, content height and scrolling. Preserve the correct safe-area coordinate mapping.

Use one controllable transition that retargets from presented position/opacity, including reversal during its 65 ms delay or mid-flight. Do not restart a competing fade/spring on each render. A ready response can interrupt immediately; there is no minimum wait or obligation to finish the transition. Reduce Motion immediately settles both paint and content, including when enabled during playback.

Returning Home +: Describe → pending moves into the preparation wash; Edit → Describe and ready → Tracking return to their correct onboarding paint. Pending → question/error keeps the preparation background. Retry should not flash black or unnecessarily restart the wash.

First run: keep Privacy and Introduction before the request. Transition from the actual presented Introduction background (its bottom position), not an inserted Describe frame or a forced top-background reset. Preserve the earlier onboarding top/bottom behavior on unrelated screens. Compare this path explicitly; the browser replay demonstrates the returning-user Describe path.

3. Preserve the working planning flow.

Keep HabitPreparationRequest ownership, cancellation/supersession, stale-result guards, validated responses, actual clarification questions, fallback notice/Retry, exact wording and answers, durable draft restoration and idempotent final plan save. This is a UI/motion update, not a rewrite of the planning service.

The library's 1.1-second replay staging and six-second reading result are demo-only: never add them to native product behavior. Dismiss the keyboard on explicit submission. A real validated result enters Tracking immediately. Edit, Back, Close and dismissal retain their current cancellation behavior. Relaunch restores the draft without silently resending a request. Do not create a habit before final confirmation.

4. Verify the change against the live library.

Compare source/native captures and recordings at 390 × 844, including the source screen, intermediate gradient frames and settled preparation. Check exact Breathing geometry/timing and sample the wash during entry and reversal, including around 100/250/450/750 ms. Match the existing 600 ms content entrance separately; do not replace it with the background timing.

Use the existing isolated HTTP fixtures/test stores to exercise Home + and first-run paths: delayed pending → ready; result during entrance; Edit mid-transition and resubmit; Close; clarification; failure/fallback/Retry; background/resume; draft relaunch. Verify no duplicate submission/save, no stale completion navigation, no keyboard appearing while waiting, and no flash when state changes rapidly.

Verify actual Reduce Motion, VoiceOver focus/status, long descriptions and larger text. Run the relevant existing preparation/onboarding tests and an appropriate focused regression check for the current branch. No personal-data reset or live AI request is needed. Avoid unrelated model changes or broad test rewrites. Record exact checks, skipped cases and remaining visual/motion differences; static endpoint screenshots alone do not establish animation parity.

Update app CHAT-HANDOFF.md, design-specs.md, Documentation/NativeMigration/library-sources.json and the preparation verification record with the latest selection and source provenance. Distinguish the new Breathing integration from historical Liquid Orbit captures. Commit locally with a focused description. Do not push or deploy, change streak policy, or expand into widgets/accounts/parties/recap work.
```
