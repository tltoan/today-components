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
- Loaders: circle/globe is selected; liquid orbit is also approved as a component. The curved signature is approved too, alongside the original opening. See LOGOS.md.

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

The user considers the component foundation sufficient to begin app implementation and requested a prompt for their existing VS Code Codex session. Use `IMPLEMENTATION-START.md` to begin in the existing native app, preserving approved components and distinguishing Workshop proposals. First complete a connected, persistent creation → Home → log → habit history slice; do not rebuild the library as a separate web app. Public-release account/backend work and unfinished design selections remain separate. Publishing this library does not mark Workshop compositions approved.
