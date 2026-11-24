# Preparing a habit · Selected centered layout

[Live preview](habit-thinking.html) · [Component](components/habit-thinking.js) · [Styles](components/habit-thinking.css) · [Next native implementation prompt](IMPLEMENTATION-PREPARING-HABIT.md)

Latest selection November 22, 2026: **centered composition with the existing Breathing orb, retaining the subtle blue/lavender/peach background.** This supersedes the earlier Liquid orbit choice for this flow. Liquid orbit remains an approved standalone component. Inline/panel alternatives remain removed; the selected screen is in Screens & flows. The browser uses a local reading fixture. Native parity with this latest correction is not yet verified.

Use `<today-thinking-orb design="breathing" diameter="80">`, preserving the original ThinkingOrbs monochrome depth, geometry and timing. Native integration uses the unchanged vendored ThinkingOrbs package plus `TodayThinkingOrb(.breathing, diameter: 80, label: "Preparing your plan")`; see THINKING-ORBS.md for the exact wrapper signature, ownership and Reduce Motion behavior. The requested slight gradient belongs to the screen, not a new tint on the loader.

The 390 × 844 reference keeps the orb and explanation centered, the exact description near the bottom and Edit description below it. The loader slot is 80 × 80. Heading is 30 pt Future Medium, supporting copy 14 pt.

## Connected background transition

The standalone preview now starts on the existing Describe screen. Use **Build my plan** to see the handoff, or **Replay transition** to show Describe for 1.1 seconds, then run the six-second reading fixture. Those delays are demonstration controls only; they do not belong in a real request. The Screens & flows embedded card starts on Waiting, with the same replay and state controls.

One `today-onboarding-gradient` stays mounted across Describe → preparation → Tracking and Edit → Describe. Nested `today-onboarding-screen` content reuses that parent's background instead of covering it with a separate black surface. Other onboarding consumers are unchanged.

The source is the existing top onboarding wash. Over **640 ms, after 65 ms, cubic-bezier(.24,.74,.26,1)**, it fades while translating down 16% of its two-screen-height paint plane. The destination plane fades from 0 to 1 while moving from −16% to its resting position. The base changes from #000 to #0A0A11. The destination retains exactly the previously selected radial blue/lavender/peach paint in `components/habit-thinking.css`. This is a moving crossfade between persistent paint layers, not a replacement background or a new gradient on every content render.

Edit and Tracking reverse to the onboarding background from the currently presented position/opacity. Pending → long wait/question/error retains the preparation wash. Existing setup navigation continues to supply top/bottom positioning. First-run native preparation must come after Privacy/Introduction and transition from that actual preceding screen; this returning-user Describe example does not bypass first-run acknowledgement.

## Behavior contract

1. A confirmed submit retains the person’s exact description and dismisses editing. Show an indeterminate loader and “Preparing your plan.” No percentage, countdown or fabricated stage checklist. The message describes the task: choosing how to track the habit; the person reviews it next.
2. A longer wait keeps the same layout and description, with “Still working on your plan.” It is a state supplied by the host; this component sets no timeout policy or prediction of remaining time.
3. Edit description cancels/supersedes the request and returns to the existing filled input. A late response must not overwrite newer input or navigate the person forward. Existing clarification answers remain for retry; changing the description clears an answer tied to the previous wording. Closing Describe emits `close`, never submits. The gallery shows a cancelled state with the retained draft; an app host should return to the originating screen and cancel its request.
4. A clarification response stops loading and asks one focused question. Keyboard focus opens the field only on explicit activation. Submit keeps the original words and answer together for the next request.
5. Failure stops loading and offers Try again / Edit description. Keep the draft. This first layout study does not invent another manual-setup flow; the native planner’s existing fallback must remain available when this is integrated.
6. A valid response moves into the approved Tracking choices. Do not hold a ready response just to finish a loop or meet a minimum spinner duration. Preserve the existing setup positions, optional target skip, privacy and introduction. In first-run onboarding, never send text ahead of the existing privacy/consent step; this workshop studies the pending request surface, not a change to that ordering. Returning users can reach it from the existing Home + creation flow.

The request owner controls cancellation, request identity, network errors, validation, drafts and readiness. No timer in the reusable component generates a result. Hide the orb when no request is pending. Names such as Searching or Listening do not enable or imply search/microphone features.

## API and motion

`<today-habit-thinking>` exposes `configure({state, description, focus})`. States: `describe`, `pending`, `long`, `clarify`, `error`, `ready`, `cancelled`. It emits `thinking-request` with `{action, description, answer}`; actions: `submit`, `edit`, `retry`, `answer`, `close`. Layout and loader are now fixed to the selection. Native integration must supply actual questions and validated plan models, never the gallery’s reading response.

Keep the background mounted. Pending/error/question content uses the existing 600 ms / 10 px entry and retargets from presented opacity/translation if interrupted. Selected setup screens keep their own entrance. Dropdowns reuse the shared 600 ms disclosure. Reduce Motion removes entrances and background transitions immediately; Breathing holds the upstream representative geometry-time 0.6 still. Status changes are announced politely, never every animation frame. No keyboard opens during loading.

`habit-thinking-study.js` is only the local demo host. Its explicit six-second example and selected outcome sit outside the product composition. Per-request versions invalidate stale completions after Edit or a new state. It never calls AI or persists a plan. The reading result does not imply arbitrary text was understood. On app relaunch, restore the existing durable draft; do not pretend an interrupted network request is still running or silently resubmit it.

## Verification

See README.md for this pass’s browser dimensions, state checks and source verification. The unchanged ThinkingOrbs package and wrapper were compiled in the preceding source pass; this browser-only correction does not claim a new native build or app integration.
