# Continue the Today component library

Updated November 21, 2026. This file carries the design direction across chats. It is not a transcript or a claim that every prototype is implemented in the native app.

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

Act on specific feedback without repeatedly asking permission. When exploring, build interactive comparisons in the library. When a direction is selected, make it primary and move historical alternatives behind a comparison disclosure unless the user requests removal. Explain actual changes and verification briefly; never claim native/backend behavior from a browser mockup.

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
- Loaders: circle/globe is selected; liquid orbit is an additional potential choice. New curved logo is another signature variation, not a replacement for the approved opening. See LOGOS.md.

## Habit party rules and direction

- Maximum four people including you; private party shares one scheduled-day pattern.
- Targets, recorded amounts and reminder preferences are personal. Logs for that habit are automatically shared; photos optional. Other habits, private notes and overall Home streak remain private.
- Shared party streak grows when every eligible member has a saved log on a scheduled party-local day. Partial and zero logs count. Days off preserve it. Current incomplete day stays open. Use dated roster and calendar coverage, not today's roster retroactively.
- Overlapping avatar stack on the upper-right habit-card rim is selected. Lead avatar is a separate compact alternative. Missing photos use deterministic varied gradients; saved face/gradient identity is preserved.
- Selected invitation: compact Book cover with illustration/overlap, shared days, proposed dates, members' personal targets, own target and Join CTA. Other live invitation variants removed. Proposed invitation entry belongs in Habits, not Profile.
- Party activity uses date-first snap cards inspired by “A space in your day,” compact rows and expandable original photos/reactions. Streak card keeps only streak, current date and progress dot with logged count.
- Reactions show the reacting person's avatar with a heart badge. Nudges have button and slider comparisons with confirmed Gradient Rise, per-recipient states and blocked reasons. Keep compact nudge surfaces free of repeated message/success/window copy.
- Per-person trial review and party creation at plan review are proposals. Shared schedule editing, lifecycle eligibility and timezone policies still need product decisions; do not silently invent them.

## Source and quality boundaries

- Static HTML/CSS/JS custom elements; no build step. Serve repository root on port 4318.
- Preserve supplied SwiftUI/artwork/reference files byte for byte; use separate namespaced versions for adaptations. Explicitly list native dependencies so another agent can compile them.
- Browser gallery data is fictional/local. Profile identity uses a localStorage demo adapter; native identity has a host persistence closure. No real account, plan, party invite, notification, upload service, backup or deletion occurs.
- Verify changed JavaScript syntax, source/asset links and components.json. Review desktop and 390 × 844, keyboard/focus, reduced motion, reversal/interruption and pertinent failure states. Swift type-checking is not native runtime verification.
- Publishing to this existing GitHub Pages repository has been authorized. Keep public source/docs in sync; never publish unrelated app data or credentials.

## Latest work

The latest requested addition is the supplied rounded-t / optional curved-y logo. Its files are `components/logo-curved.js`, `logo-variations.html`, `native/TodayLogoCurvedAnimation.swift` and byte-identical `native/reference/TodayLogoCurvedVariation.swift`. Companion work carries confirmed animated portraits into Home/Profile and simplifies party activity/streak/nudge copy. Check git status and the final validation note in README.md for what has actually been verified/published.
