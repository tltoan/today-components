# Trial recap — A/B design drafts

[Compare the drafts](recap.html) · [Component source](components/recap.js) · [Styles](components/recap.css)

These are interactive browser proposals, not native app integration or production lifecycle logic. They use the existing Today artwork, buttons, Active Pill progress, bar chart and onboarding gradient motion. Both retain the current Today palette. **There is no amber/newest-recap color treatment.**

## Context and flow

Source reviewed: Figma `Xf03CH47k7G0graqTZ4zis`, node `298:2078`, “Today review · Two-week recap.” Its seven-screen sequence contains totals, an activity timeline, reflection, an AI suggestion and a next-plan screen. The user explicitly called it outdated and authorized a redesign. Today PRD Draft 0.4 (November 19, 2026), §9, governs the new proposals: 21-day default, visual evidence followed by reflection, no AI advice, and explicit continuation.

- **A — A little story:** opening total → activity and dated outcomes → reflection → next step → plan confirmation. No-log trials go directly to reflection.
- **B — The whole picture:** summary and calendar together → reflection → next step → confirmation. Detailed activity is optional. Reflection uses a compact two-column choice surface; continuation choices share a grouped surface.
- Recommendation: B for repeated reviews. A offers more room for the first trial’s close.

Ended trials remain ended, with history intact, until the user reflects, chooses a new trial or routine, and confirms its plan. Closing retains the unfinished draft in this preview. Other habits continue normally. Neither reflection nor continuation is preselected. “Not sure yet” is a valid reflection. Notes are optional and private, including for party habits.

A new trial starts at 21 days but allows another length. A routine preserves chosen weekdays and has no automatic trial review. Both let the user confirm target, days and start date. The prior trial remains unchanged. This prototype uses a fixed sample date; a production host must provide the actual date/timezone, policy limits, dated plan history, permission checks and persistence.

## Honest sample data

November 1–21, 2026; reading scheduled Sun/Tue/Thu, nine eligible evenings, target 10 pages.

- Mixed: `[5,10,null,8,0,15,null,10,12]`: **60 pages**, **7/9 logged**, **4 targets met**. Explicit zero counts as a recorded outcome.
- A little logged: two outcomes, one of them explicit zero.
- No logs: nine unknown outcomes, **0 logs recorded**; no invented activity total or average. The copy does not infer whether the person read.

Off-days are distinct from missing logs. Tapping a calendar day explains its outcome. These fixtures do not cover tracking-method changes within a trial; production charts must separate units and preserve dated changes from the PRD rather than adding pages to minutes.

## Browser API and boundaries

Load the ordered dependencies in `components.json` under `recap`. Mount `<today-recap variant="a"></today-recap>` or `variant="b"`. This is a draft flow component with fixed sample data, not a generic production data renderer.

- `reset('mixed'|'light'|'empty')` restarts a sample.
- `go(0..4)` is a review-only stage navigation helper.
- `recap-confirm` bubbles `{route, plan, reflection, preview:true}` after valid explicit confirmation. It performs no save, scheduling, billing or notification operation.
- Gallery stage shortcuts help compare screens. The Plan shortcut deliberately seeds an example trial choice and labels that shortcut outside the composition; normal traversal requires explicit choices.
- Body content scrolls within the phone; the next action stays visible. Keyboard buttons and inputs use native semantics. Reduced motion skips entry movement and uses the existing gradient’s still behavior.

The gallery controller is `recap-study.js`; its layout styles are `recap-study.css`. These are not required when consuming the draft component itself.
