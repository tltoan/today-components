# Browsing the Today library

The library has three separate pages. Components and Workshop display multiple live previews in responsive masonry boards. Approved screens & flows uses a wide ordered flow section and an aligned screen gallery. Each space has category filters and search. A state menu changes that card’s preview without selecting a single item for the whole page.

- `index.html#library` — **Components**: reusable pieces, including the approved Liquid orbit and Curved signature, plus existing primitives. A check marks an explicitly selected design.
- `screens.html` — **Approved screens & flows**: selected onboarding layouts, Weekly view, Grouped cards habit detail, Profile, One plan card, and Welcome. “Approved” describes design selection, not production/native implementation.
- `workshop.html` — **Workshop**: current notes editor, multiple-habit Home, party room/planning, recap narrative alternatives, nudges and widget layouts. A selected component inside a proposal does not approve that entire screen.

## Maintaining the boards

`library-catalog.js` owns the page, category, title, source link, preview target and state selectors for each card. Keep approval decisions grounded in `CHAT-HANDOFF.md`; new proposals belong in Workshop until the user explicitly selects them. The user rejected a one-item-at-a-time library and asked for a Pinterest/Cosmos-like collection instead.

`library-board.*` renders the page navigation, search, category filters, flow outline and live preview cards. Page navigation uses the existing `today-segmented-control` sliding highlight and the History API, retaining the header/logo and previously visited views. Direct page URLs and Back/Forward remain available. State menus reuse `today-dropdown`, `TodayUI.Disclosure` and the approved 600 ms motion. The grid becomes one column at phone widths. Phone compositions retain their 390 px maximum width and existing scrolling behavior. Filtering preserves each mounted preview’s local state.

Each preview loads its existing focused HTML page in a lazy iframe. `library-embed.*` activates only for `?embed=<catalog ID>` inside a frame. It reveals the chosen existing DOM subtree and relevant demo controls in place; it does not copy component markup or move nodes away from their event hosts. Same-origin/source checks guard size, state and replay messages. ResizeObserver fits card heights as disclosures expand. This adapter is gallery infrastructure, not a component dependency for an app.

Component titles open the full focused preview; Code opens its source row. Existing hash links redirect to the appropriate board where a catalog entry exists. The original schedule, agenda, checklist and signature compositions now have a focused page at `activity.html`; the Welcome screen has `welcome.html`. The original compact Welcome motion appears above all three spaces and stays mounted across page switches. Page navigation does not repeat its wordmark.

## Retention and implementation boundaries

Selected directions replace superseded UI unless the user explicitly asks to keep an alternative. Current alternatives share a card’s state control instead of taking over the board. The new categorization does not redesign approved components or declare unfinished flows approved.

These remain browser previews with local fixtures. Native source, production persistence, sharing, notifications and uploads are separate implementation concerns. The user has authorized publishing the current snapshot. This does not imply native integration or approval of Workshop compositions.


The Onboarding outline sends preview-state messages to existing gallery controls. Its frame reports the active screen when navigation occurs inside the flow, keeping the numbered outline synchronized. `previewOnce` in the catalog is gallery-only playback: the large Warm Ember preview plays once when it enters view, then settles; Replay invokes the existing animation. `library-embed.css` contains gallery spacing and placement corrections, not new app layout rules.
