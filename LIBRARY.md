# Browsing the Today library

The library has three separate pages. Components and Workshop display multiple live previews in responsive masonry boards. Approved screens & flows uses a wide ordered flow section and an aligned screen gallery. Each space has category filters and search. A state menu changes that card’s preview without selecting a single item for the whole page.

- `index.html#library` — **Components**: reusable pieces, including the approved Liquid orbit and Curved signature, plus existing primitives. A check marks an explicitly selected design.
- `screens.html` — **Approved screens & flows**: selected onboarding layouts, Breathing preparation, Weekly view, Grouped cards habit detail, Profile, One plan card, Welcome and Home Habits / To-dos. “Approved” describes design selection, not production/native implementation.
- `workshop.html` — **Workshop**: current notes editor, party room/planning, recap narrative alternatives, nudges and habit-widget layouts. A selected component inside a proposal does not approve that entire screen. The selected Home and small/medium task widgets have moved out of Workshop.

The November 23 launch instruction includes every explicitly approved feature in the first release. Read [LAUNCH-SCOPE.md](LAUNCH-SCOPE.md) for the native gaps and remaining design decisions. Both selected task-widget families and Home To-dos are now connected in native `fd67a06` / `46b8027`, following [IMPLEMENTATION-HOME-TODOS.md](IMPLEMENTATION-HOME-TODOS.md). The retry defects are corrected in `baa921b`; accounts and parties are locally connected at `c954a51`, with hosted and parity work still open. See [NATIVE-REVIEW-NOV24.md](NATIVE-REVIEW-NOV24.md). Workshop alternatives are not automatically promoted by this direction.

## Maintaining the boards

`library-catalog.js` owns the page, category, title, source link, preview target and state selectors for each card. Keep approval decisions grounded in `CHAT-HANDOFF.md`; new proposals belong in Workshop until the user explicitly selects them. The user rejected a one-item-at-a-time library and asked for a Pinterest/Cosmos-like collection instead.

`library-board.*` renders the page navigation, search, category filters, flow outline and live preview cards. Page navigation uses the existing `today-segmented-control` sliding highlight and the History API, retaining the header/logo and previously visited views. Direct page URLs and Back/Forward remain available. State menus reuse `today-dropdown`, `TodayUI.Disclosure` and the approved 600 ms motion. The grid becomes one column at phone widths. Phone compositions retain their 390 px maximum width and existing scrolling behavior. Filtering preserves each mounted preview’s local state.

Each preview loads its existing focused HTML page in a lazy iframe. `library-embed.*` activates only for `?embed=<catalog ID>` inside a frame. It reveals the chosen existing DOM subtree and relevant demo controls in place; it does not copy component markup or move nodes away from their event hosts. Same-origin/source checks guard size, state and replay messages. ResizeObserver fits card heights as disclosures expand. This adapter is gallery infrastructure, not a component dependency for an app.

Component titles open the full focused preview; Code opens its source row. Existing hash links redirect to the appropriate board where a catalog entry exists. The original schedule, agenda, checklist and signature compositions now have a focused page at `activity.html`; the Welcome screen has `welcome.html`. The original compact Welcome motion appears above all three spaces and stays mounted across page switches. Page navigation does not repeat its wordmark.

## Retention and implementation boundaries

Selected directions replace superseded UI unless the user explicitly asks to keep an alternative. Current alternatives share a card’s state control instead of taking over the board. The new categorization does not redesign approved components or declare unfinished flows approved.

These remain browser previews with local fixtures. Native source, production persistence, sharing, notifications and uploads are separate implementation concerns. The user has authorized publishing the current snapshot. This does not imply native integration or approval of Workshop compositions.


The Onboarding outline sends preview-state messages to existing gallery controls. Its frame reports the active screen when navigation occurs inside the flow, keeping the numbered outline synchronized. `previewOnce` in the catalog is gallery-only playback: the large Warm Ember preview plays once when it enters view, then settles; Replay invokes the existing animation. `library-embed.css` contains gallery spacing and placement corrections, not new app layout rules.

November 22: Thinking orbs adds nine individual component cards, each showing regular and small tuning. Preparing a habit began as a three-layout Workshop; the later centered + Liquid orbit selection below supersedes that study.

November 22 selection: Preparing a habit moved from Workshop to Screens & flows, with only the centered composition and soft Liquid orbit. State controls remain; superseded inline/panel layouts are removed. Liquid orbit’s Components card switches soft/original palettes without resetting motion.

### Selected Home and to-do widgets

`home-tasks` is now in Screens & flows. `task-widget-medium` and `task-widget-small` are selected Components. The prior three Workshop cards and the older Home showcase card were removed; their gallery hashes resolve to the selected Home. The focused `home-tasks.html` page shows one Home and both widgets sharing local state. Per-card state controls still cover a few tasks, empty, completed and long titles. See `HOME-TASKS.md` for the exact selection and native integration boundary.

November 23: the missed-day check-in with Remind me later is selected and now in Components. Home placement above habit cards and the three-closed-missed-scheduled-days trigger are approved; native integration remains pending. See REMINDER-CHECKIN.md and IMPLEMENTATION-REMINDER-RECOVERY.md.

## Approved website

Screens & flows → Website contains **Your day, in view**, explicitly approved after the centered opening, aligned header, gray Get app button and copy refinements. A is removed from the live comparison and redirects to B. The actual legal copy and App Store destination are pending; this browser mockup does not configure either. See `WEBSITE.md`.

The November 24 **Your account · Apple & phone** flow is approved in Screens & flows → Account. Its context and screen menus show the optional post-save account journey, returning-user entry, Profile and invitation entry in one reusable specimen. The decorative success checkmark is removed. Real provider/native integration remains separate; read [ACCOUNT-ACCESS.md](ACCOUNT-ACCESS.md).
