# Today component library

[Live component library](https://tltoan.github.io/today-components/) · [Source repository](https://github.com/tltoan/today-components) · [Agent guide](AGENTS.md) · [Integration guide](INTEGRATION.md) · [Component manifest](components.json)

## For agents and developers

All implementation code is committed here as readable HTML, CSS, JavaScript, and SwiftUI. There is no compiled bundle, package install, backend, or secret required to inspect or run the components. Start with [AGENTS.md](AGENTS.md), use [components.json](components.json) for each component's source/dependencies/preview, and [llms.txt](llms.txt) for a compact entry point. Native SwiftUI files are under `native/`; browser source is under `components/`, `foundations/`, and the root. The repository can be cloned without authentication.

```sh
git clone https://github.com/tltoan/today-components.git
cd today-components
python3 -m http.server 4318
```

GitHub Pages publishes this repository's default branch from its root. `.nojekyll` preserves source paths and raw Markdown files. Relative asset paths work both locally and under `/today-components/`. Changes pushed to the publishing branch update the site after the Pages build.


An interactive component showcase adapting the four-panel motion composition in [Monotree — features sections by Oleksandr Plyuto](https://www.cosmos.so/e/1503723395) to Today, with the supplied Today logo animation, the selected Center cradle navigation, an independent adaptive action button, and the supplied page counter, staggered bar chart, and full welcome landing screen.

Open `index.html` directly, or serve this directory with a local HTTP server. No build, package install, or network dependency is needed.

This is the working Today component library. This README and AGENTS.md contain the component contracts needed to work in this repository. The separate native app specification is not required to run these previews; native app integration is not implied.

## Component inventory

| Component | Reusable source | Status |
| --- | --- | --- |
| Dropdown/disclosure motion | `foundations/motion.css`, `foundations/disclosure.js`, `native/TodayMotion.swift` | User-approved standard, November 20, 2026. Applied to all current library dropdowns/expansions. Native tokens available; app-wide integration pending. |
| Selection dropdown | `components/dropdown.js`, `components/dropdown.css` | Reusable browser component; used by logo speed. Keyboard, focus return, outside dismissal, and reduced motion supported. |
| Reading schedule | `index.html`, `app.js`, `style.css` | Browser specimen consuming shared disclosure motion. Its layout/fixture is separate from the approved motion rule. |
| Vertical agenda | `components/snap-scroller.js` | Reusable browser controller. One day per scroll/swipe, with smooth snapping as requested November 20. Native implementation pending. |
| Slide to log | `components/slide-to-log.js`, `components/slide-to-log.css`, `SLIDE-TO-LOG.md` | Independent browser component and focused preview; drag, tap, keyboard, Undo, disabled and cancellation. Original library card uses the same element. |
| Daily checklist | `app.js`, `style.css` | Browser specimen; shares sample state with slide-to-log. |
| Today logo | `today-logo.js`, `native/TodayLogoAnimation.swift` | Reusable browser component plus unchanged user-supplied SwiftUI source. |
| Welcome landing | `components/welcome-intro.js`, `components/welcome-intro.css`, `native/TodayWelcomeIntro.swift`, `native/TodayIntro.swift` | Motion-only opening on `index.html`, with the library immediately below; `landing.html` redirects there. A library specimen provides replay controls. Original wrapper and matching local dependency preserved unchanged; native app integration pending. |
| Bottom navigation | `components/bottom-nav.js`, `components/bottom-nav.css`, `components/cradle-fluid.js` | Center cradle (B) selected November 20. Animated Home/Habits highlight and central +. Browser implemented; Figma/native migration pending. |
| Adaptive plan button | `components/plan-button.js`, `components/plan-button.css`, `components/plan-readiness.js` | Standalone browser component with a dedicated `plan-button.html` preview and manual state/replay controls. Staggered letter roll; no editor or parser required. |
| Page counter | `components/page-counter.js`, `components/page-counter.css`, `native/AnimatedPageCounter.swift` | Supplied SwiftUI source preserved unchanged. Browser custom element and `page-counter.html` preview; tap/hold, limits, rolling digits, sequential fill and labeled overflow. Native app integration pending. |
| Staggered bar chart | `components/staggered-bar-chart.js`, `components/staggered-bar-chart.css`, `native/StaggeredBarChart.swift` | Supplied SwiftUI source preserved unchanged. Browser custom element and `bar-chart.html` preview; replay, stagger pacing, recorded zero and missing-log examples. Native app integration pending. |
| App icons | `components/icons.js`, `assets/icons/manifest.json` | Ten Figma icons plus two original counter SVGs, exact source hashes and native dimensions. Browser reusable. |
| Buttons & small controls | `components/controls.js`, `components/controls.css`, `CONTROLS.md` | Twelve button variants, switches, segmented selections, isolated +/− and bounded hold stepper. Interactive browser collection and documented APIs. |
| Trial length picker | `components/pickers.js`, `components/pickers.css`, `PICKERS.md` | Day ruler selected; standalone ruler, custom input and week cards. Live count, seventh-day marks, native haptic event. 21-day fixture default. |
| Reminder time picker | `components/pickers.js`, `components/pickers.css`, `PICKERS.md` | Inline clock and soft wheels retained; standalone AM/PM pill. Phone field navigation, draft/confirm/cancel and retained time when off. No native integration. |
| New habit entry (retained source) | `components/habit-editor.js`, `components/habit-editor.css` | Earlier Figma `121:12444` entry implementation retained. Latest user request disconnects it from +; no longer mounted in the library. Generation/setup integration pending. |

| Choose a time | `components/pickers.*`, `time-editor.html` | Independent soft-wheel editor; draft/confirm/cancel, reused inside reminder picker. Browser only. |
| Home with multiple habits | `components/home-overview.*`, `HOME.md` | Proposed one/three/six/day-off composition; fixed nav, scrolling list, local logging/failure states. Browser only. |
| Onboarding gradient | `components/onboarding-gradient.*` | Persistent dark wash; supplied 65 ms delay/640 ms travel; reduced-motion immediate. |
| Onboarding | `components/onboarding.js`, `components/onboarding.css`, `ONBOARDING.md` | Nine screens × two comparisons, plus the selected hybrid flow; existing landing and approved Features shared unchanged. Reuses component primitives, local drafts and approved four-step/two-week flow. Browser only. |
| Artwork | `components/artwork.js`, `components/artwork.css`, `assets/artwork/manifest.json` | 21 original assets, intrinsic geometry and source hashes; standalone renderer and downloads. |
| Picker pieces | `components/pickers.js`, `components/pickers.css`, `PICKERS.md` | Reusable day ruler, custom day input, week cards and AM/PM pill. Existing switch remains in controls. |

## Shared dropdown contract

The user explicitly approved the slower schedule motion and asked to standardize it across all dropdowns. New dropdowns reuse these tokens, not separate local durations:

| Part | Standard |
| --- | --- |
| Expansion/collapse | 600 ms, cubic-bezier `(0.37, 0, 0.18, 1)` |
| Incoming content | 380 ms fade after 120 ms |
| Outgoing content | 230 ms fade, no delay |
| Chevron | 440 ms using the expansion curve |
| Input/state | Applied immediately; reversing mid-transition remains possible |
| Reduced motion | Immediate layout and state; no travel or stagger |

Keep the trigger/heading anchored where possible. Animate height with clipped content; do not show/hide whole sections instantly. Closed panels are inert and hidden from accessibility. Preserve selections and return focus to the trigger when closing a focused panel. The standard applies to custom Today dropdowns and inline disclosures; operating-system menus keep platform behavior.

Load `foundations/motion.css` after local component styles and `foundations/disclosure.js` before component scripts. Then construct `new TodayUI.Disclosure(panel, {trigger, open: false})` and call `setOpen(boolean)`. The panel needs one inner wrapper; the controller adds the shared classes and state attributes.

For selection menus load `components/dropdown.css` and `components/dropdown.js`, then use:

```html
<today-dropdown label="Tracking method" value="pages">
  <option value="pages">Pages</option>
  <option value="minutes">Minutes</option>
  <option value="checkoff">Check it off</option>
</today-dropdown>
```

Read/write `.value` and listen for the bubbling `change` event. `placement="top"` opens above the trigger. Enter/Space opens or selects; arrows/Home/End navigate; Escape and outside focus/pointer dismiss.

## Design source and scope

- Source context: Today app design specification, version 2, November 20, 2026. Relevant component decisions and implementation status are recorded here and in AGENTS.md.
- Reused roles: Test The Future Regular/Medium, graphite surfaces, neutral selection gradient, 20 px plan-field radius, 12 px weekday selection radius, the 265 × 58 slider with a 46 px handle, native slider color stops, and supplied StretchMat, WaterPlants, and Meditation artwork.
- The slider derives from the author’s existing native `SlideToLog` and motion study. Its independent browser implementation is in `components/slide-to-log.js` and `components/slide-to-log.css`; the original gallery connects its state in `app.js`.
- Fixture: synthetic November 20–23, 2026 plans and activity. Reading defaults to Sun/Tue/Thu, 10 pages, a 21-day trial. The three Friday check-off habits start with Water plants logged. Agenda cards are independent sample plans. No production/user data is loaded.
- Proposed departures: this presentation board, compact schedule repeat switch, agenda carousel, and interactive daily checklist. Checkmarks are action control states, not replacements for the established activity-calendar marks. The count describes habits with a reported log, not target attainment, a streak, or a finalization of the day. Dropdown motion is now explicitly approved; these other layouts remain browser studies, and the native app has not been changed.
- The existing local preview has Regular/Medium font files. The showcase wordmark uses Medium; this is not the native Bold main-tab header.

## Interactions

- Repeat expands/collapses the day controls. The preset menu offers Every day, Weekdays, and remembered Custom days. At least one day stays selected.
- Schedule unfolding now takes 600 ms, with a smooth acceleration/deceleration curve, staged content fades, and an anchored heading. Repeat-off copy and preset choices animate their height instead of appearing/disappearing instantly. Reversing a transition is supported; Less motion makes it immediate.
- Drag the slider handle all the way and release to log. Early release, Escape, pointer cancellation, leaving the vertical track region, window blur, and resize cancel the drag. Enter/Space on the handle and “Or tap to log” provide non-drag alternatives.
- The slider and Evening stretch checklist row share state. Either can undo the sample log.
- The agenda is a real vertically scrolling list of four sample dates. Touch/trackpad/wheel scrolling and mouse dragging snap to day cards. Arrows and dots navigate the same list; Up/Down, Page Up/Down, Home, and End work when it is focused. The faded next card is reachable.
- Agenda movement uses one controller and a 680 ms landing. A wheel/trackpad burst advances exactly one day and ignores its inertial tail; reversing direction can reverse the landing. Mouse/touch drags follow the pointer over at most one adjacent day, then commit at 22% of a card (capped at 28 px) or a short intentional flick. Smaller releases return to the same day. The component owns touch gestures within its bounds; it no longer uses free native momentum there. Card opacity changes continuously. Reduced motion settles immediately. Browser CSS snapping remains disabled so two mechanisms cannot compete.
- The progress bar is derived from the three logged states. Every action is reversible.
- Replay motion runs one 6.5-second demonstration. Direct interaction interrupts it. It never loops automatically. Less motion follows the OS preference and can be changed locally; reduced motion retains all controls and uses a static reset for replay.
- State lasts for this page session only. Refresh or Replay resets the example. No backend or native integration is included.

## Verification

Verified in the browser on November 20, 2026:

- Desktop at 1600 CSS px wide and mobile at an observed 390 × 844 CSS px viewport; no horizontal overflow, fonts and artwork loaded.
- Expanded schedule menu fits without overlap; Weekdays selects Monday–Friday; repeat-off collapses controls and repeat-on preserves selection.
- Enter on the slider logs the habit; undo clears it; an actual partial drag does not log; a full drag logs once and updates the progress count.
- Checklist completion reaches 3/3, and the slider and checklist remain in sync.
- Agenda navigation changes its date/content and updates boundary controls.
- The 6.5-second replay completes at Sunday, November 22 and 3/3 logged, then stops.
- Less motion gives the slider a computed transition duration of 0 seconds; logging still works and replay resets statically.
- No browser warnings or errors were reported. `node --check app.js` passes.

Captures: `desktop-preview.jpg` and `mobile-preview.jpg`. This pass did not run native simulator tests because no native files changed, nor a screen-reader audit or an OS-level Reduce Motion toggle; the browser's local reduced-motion control was exercised.

### Direct agenda scrolling correction

The original preview only wired arrows/dots. Replaced the swapped card with a native scroll container and real entries, with mouse drag support and scroll snapping. Verified direct wheel scrolling, dragging in both directions, first/last keyboard navigation, the visible next-day arrow, synchronized selected dots, and reduced-motion end navigation. No console warnings/errors were reported. Touch uses browser-native vertical scrolling; it was not exercised on a physical touch device. Updated capture: `agenda-scroll-preview.jpg`. This remains HTML/CSS/JavaScript, not a SwiftUI implementation.

### Shared motion foundation and agenda refinement

Verified this revision at desktop and an observed 390 × 844 CSS px viewport, with no horizontal overflow. Schedule disclosures and the logo speed menu use the same computed 600 ms layout transition. Keyboard speed selection updates the logo, closes the menu, and returns focus to its trigger; Escape dismisses the menu. Agenda navigation and dragging settle on aligned dates, with continuous intermediate card opacity and no competing CSS snap. The local Less motion control gives disclosures a computed zero duration and settles agenda navigation immediately. No browser warnings/errors were reported.

`node --check` passes for the app, disclosure, dropdown, and snap-scroller scripts. Both native source files pass Swift type-checking together. Physical touch momentum and native runtime integration have not been tested. Updated capture: `shared-motion-library-preview.jpg`.

### Explicit day snapping and navigation shapes

This revision replaces the earlier agenda's free native momentum with discrete day paging. Verified two separate wheel gestures advance Friday → Saturday → Sunday, and a mouse drag returns to Saturday. A short drag returns to the same day. Settled positions align to card offsets within browser subpixel rounding (126.25 px scroll position against a 126 px measured row offset). End reaches Monday and disables Next; reduced-motion Home returns to Friday immediately. Physical touch hardware was not tested.

All six navigation variants switch the selected destination and sample context. Checked keyboard arrows, + expansion, Escape/close, and reduced motion. At an observed 390 × 844 CSS px viewport, there is no horizontal overflow and every nav target is at least 44 × 44 px. The creation preview stays within its phone frame. No browser warnings/errors were reported. JavaScript syntax checks pass for the snap controller, navigation component, gallery, and focused-page controls. These are browser checks; no native runtime was changed or tested.

## Selected Center cradle navigation

Open `navigation.html` for the selected component, or scroll to Bottom navigation on `index.html`. The user chose **B — Center cradle** and requested an animated Home ↔ Habits switch. The options below record the earlier exploration; the live preview now uses only Center cradle.

| Option | Shape | Difference |
| --- | --- | --- |
| A | Floating pill | Existing capsule direction with a separate + above the right end. |
| B | Center cradle | Smooth concave center accommodates a raised circular +. |
| C | Three islands | Separate Home, +, and Habits surfaces. |
| D | Sidecar | Two-tab capsule with the + alongside at the same level. |
| E | Soft dock | Rounded rectangular bar with an inline rounded-square +. |
| F | Raised center | Continuous convex center lifts the + above the tab baseline. |

**Center cradle is approved; A/C/D/E/F remain historical studies.** The approved two destinations remain Home and Habits. Reused the project's exact HomeIcon and HabitsIcon assets and graphite finish; labels use the existing local Future font. The selected cradle has a 352 × 71 body and 54 px central +, superseding the earlier capsule / separate upper-right button for the next navigation implementation. The phone crops illustrate bottom placement and a reserved home-indicator area; they are not native device shells.

Load `components/bottom-nav.css`, then `components/cradle-fluid.js` followed by `components/bottom-nav.js`, and insert `<today-bottom-nav variant="cradle" active="home" label="Main navigation"></today-bottom-nav>`. Supported variants are `floating`, `cradle`, `islands`, `sidecar`, `compact`, and `saddle`. Set the shape at construction; `.active` can be changed between `home` and `habits`. Listen to bubbling `tabchange` (`event.detail.active`) and `add` events to connect real routes and creation. The component uses `aria-current="page"`; Left/Right/Home/End switch destinations. Position it inside the app's safe-area shell, with room for raised controls.

The selected nav uses one deforming SVG contour with a 1.4 px, 8%-white border and equal 6 px top/bottom insets. The outline treatment matches the outer container, with lower selection-border opacity per the latest refinement. It stretches sideways and compresses vertically beneath the actual cradle boundary, then rounds back into the destination tab. The border stays continuous; clipping is only a safeguard, not the deformation mechanism. A complete switch takes 600 ms using `(0.37, 0, 0.18, 1)`; reversing starts from the current shape and takes proportionally less time. Labels stay in place; the sample page content fades over 380 ms and travels 14 px. These are current browser motion values for review, not a change to every existing app selector. Reduced motion applies the final state immediately. The earlier six-shape capture remains `navigation-shapes-preview.jpg`.

### Fluid selection refinement

The user requested a matching border and fluid deformation beneath the divot. `components/cradle-fluid.js` owns the shared cradle outline, its boundary function, and the highlight contour; the nav has a single animation controller. Reduced motion and resize settle to a valid endpoint, and disconnect cancels the animation.

Verified the matching computed border color/width, a visible deformed intermediate frame, reversal from the middle without resetting to an endpoint, and reduced motion canceling an in-flight morph. Desktop and observed 390 × 844 layouts have no horizontal overflow. A geometry sweep over 202 positions at desktop/mobile widths sampled the actual cubic contour, with no boundary violations: minimum top clearance 4.78 SVG units; bottom remains inside y=64.03 against the outer y=70 edge. JavaScript syntax checks passed; no browser warnings/errors were reported. Native UI was not changed. Capture: `fluid-cradle-preview.jpg`.

Latest spacing refinement: selection-border opacity is now 8% (previously 15%). One shared 6 px inset governs the top, bottom, and divot clearance. Browser measurements at rest give equal 5.974 px top/bottom gaps after curve interpolation.

### Full-screen New habit entry — retained, disconnected

**Latest user correction:** + has no page attached. The live showcase no longer loads or mounts the editor, and the adaptive action is reviewed separately. The implementation notes below describe the earlier retained source.

The + previously opened the user-confirmed [Figma screen 121:12444](https://www.figma.com/design/Xf03CH47k7G0graqTZ4zis/today.?node-id=121-12444), replacing the small popup. It was implemented from high-fidelity design context and checked against the returned screenshot; no screenshot is used as a runtime asset. The design has no image/SVG assets to download.

At 390 × 844, the heading/input/actions/keyboard use the source layout (input y=114, actions y=466, keyboard y=529). The placeholder wording is preserved verbatim. The background paint is taken from the source. Future Medium is the local product face; browser system fonts stand in for the Figma Inter/SF keyboard and chrome. Desktop shows an interactive keyboard facsimile; coarse-pointer devices use their own keyboard with viewport-aware action placement. No physical touch device or iOS keyboard was tested.

Load `components/plan-button.css` and `components/habit-editor.css`, then load `components/plan-readiness.js`, `components/plan-button.js`, and `components/habit-editor.js` in that order. Add `<today-habit-editor></today-habit-editor>`. Call `.show(trigger)` or `.close()`; `planrequest` bubbles with `{description}`. The semantic modal traps focus, closes with Escape/Close/Skip, and restores focus to +. It retains the in-session draft and returns to the selected tab. The adaptive action stays disabled until the current description passes the preview readiness check; empty/whitespace and incomplete descriptions cannot emit a plan request. The earlier showcase captured the emitted description outside the phone specimen; it does not generate a plan, navigate through further setup, save, or claim persistence. Entry reveals from the actual + position over 330 ms; reduced motion opens immediately.

Verification for this revision: JavaScript syntax checks passed. Browser checks covered the 600 ms moving highlight, rapid reversal, selected scene accessibility, Close/Skip/Escape return, in-session draft retention, whitespace validation, keyboard character/backspace input, and the emitted description. Reduced motion gives the highlight a zero-duration transition. At the observed 390 × 844 viewport, the editor has no horizontal overflow and its control offsets match the source within subpixel rounding. No browser warnings/errors were reported. Native app and Figma components were not edited. Captures: `center-cradle-preview.jpg` and `new-habit-editor-preview.jpg`.

### Adaptive plan button

User direction, November 20: keep the pill filled, with muted text while the description needs more detail. Change the prompt inside the button, then enable **Build my plan** when there is enough information to parse the habit. The current copy and exact readiness threshold are review proposals.

Open `plan-button.html`, or the Adaptive button section in `index.html`. The button is a standalone component with three manual state controls and a one-shot replay. It has no dependency on the editor or sample parser. **Say a little more → How often? → Build my plan** keeps a steady 158 × 48 graphite pill. The refined text motion rolls individual graphemes upward in a soft wave: outgoing letters lift 10 px over 260 ms with a 5 ms stagger; incoming letters settle from 12 px over 520 ms after a 100 ms lead-in, staggered 9 ms. A subtle 2 px blur resolves to sharp text; easing is `(0.22, 0.8, 0.24, 1)`. Text brightens from 48% to 100% as it becomes ready. Reversals sample current letter positions and never accumulate more than two labels. Reduced motion swaps immediately. Exact motion is the current review implementation.

`<today-plan-button>` renders a semantic button. Call `.setState({label, ready, hint})` to display an assessment; `.button` exposes the native control. The editor waits 320 ms after typing before assessing; editing immediately disables submission, composition waits until committed, late assessments are ignored, and closing cancels pending work. The accessibility name updates with the visible label and a polite status provides the missing detail. Repeated identical assessments do not replay the animation.

The retained, currently unloaded `TodayUI.PlanReadiness.assess(description)` is a deliberately bounded, English-only demonstration. It recognizes common activity words plus a repeat schedule/cue. “Read” asks “How often?”; “Read before bed” is ready. Vague text such as “I want to feel better every day” remains incomplete. These are **sample rules, not semantic parsing or an approved production readiness requirement**. They may miss valid custom habits or accept misleading wording. Assign `editor.assessDescription = yourAssessor` (sync or async, returning `{label, ready, hint}`) to use actual parser results without changing the motion. No input is sent to an external service, and no plan is generated or saved.

Checks in this revision: JavaScript syntax; 11 readiness fixtures; live desktop empty/partial/ready states; a captured in-flight fade/lift; rapid reversal with a single settled label; immediate disabling on edit; whitespace; keyboard activation and focus return; reduced motion without travel. At an observed 390 × 844 viewport, both prompt/ready states keep the same 158 × 48 button at the source action position with no horizontal overflow. This is browser verification, not iOS keyboard or native integration testing.

## Supplied page counter and staggered bar chart

Both user-supplied SwiftUI files are preserved byte for byte in `native/`. Browser counterparts make them reviewable in this library; native app integration is separate. Both files pass `xcrun swiftc -typecheck` together against the installed iOS simulator SDK with an iOS 17 target. This is compilation verification, not simulator interaction testing.

### Page counter

Open `page-counter.html` or use `<today-page-counter amount="10" maximum="20" mark-count="20"></today-page-counter>` after loading `components/page-counter.css` and `.js`. Read/write `.amount`, and listen for bubbling `change` with `{amount}`. The standalone preview sets maximum to 40 solely to demonstrate overflow beyond its 20 visible marks.

Reproduces the supplied 82 px gradient digits, 48 px controls, 48 px page marks, 5 px gaps and transparent component background. Tap/keyboard activation steps once. Holding begins at 280 ms, repeats every 75 ms, and stops on release, cancellation, pointer exit, focus loss, inactive document, disconnect or a limit. A release after repeating adds no extra step. Digits and one continuous mark-fill value retarget over 180 ms using `(0.2, 0.8, 0.2, 1)`. At most two digit layers exist. One mark always represents one page; excess pages are explicitly labeled and never rescale the marks. Reduced motion applies browser endpoints immediately.

### Staggered bar chart

Open `bar-chart.html` or load `components/staggered-bar-chart.css` and `.js` and insert `<today-staggered-bar-chart></today-staggered-bar-chart>`. Set `.points` to `{id, dateLabel, value}` entries (`null` means no log), set `target`, `target-label`, `unit`, and `stagger` (milliseconds) before render, and call `.replay()`. The preview offers default 140 ms staggering and optional 500 ms one-at-a-time pacing.

Preserves the supplied November 1–12, 2026 sample (5, 10, 12, no log, 8, 15; total 50), 10-page target, 144 px plot, 40 px maximum bars, 8 px top corners and square baseline. Bars grow by height over 500 ms rather than scaling rounded corners; labels rise with their amount. The first visible entry animates once, and replay is explicit. A recorded zero is a 1 px baseline marker with “0”; a missing value has “No log” and no bar. The zero demonstration changes the first sample to zero and recalculates total to 45. Data is synthetic. Reduced motion shows final bars immediately.

### Current browser verification

Verified the nav + no longer opens or mounts an editor and carries no dialog ARIA relationship. Button checks covered individual letter transforms, rapid reversals settling to one label, keyboard state controls, fixed size and immediate reduced-motion state. Counter checks covered one-step keyboard activation, a real 650 ms pointer hold (11 → 16), no extra release increment, upper bound 40, zero/lower bound, 25-page overflow and reduced-motion single-mark fill. Chart checks covered progressive staggered heights, restored 50-page total, zero vs no log, and reduced motion without entrance animation. At an observed 390 × 844 browser viewport the three components fit without horizontal overflow and chart date labels remain unclipped. Updated JavaScript syntax checks pass. No native UI was modified.

## Full welcome landing screen

The user supplied `TodayWelcomeIntro.swift` and asked for the full landing screen on the component page. It is now the **Welcome landing** section (`index.html#landing`), with a 390 × 844 composition, replay/pause/half-speed controls, and a full-viewport preview at `landing.html`. The preview-only control bar on that page is separate from the supplied screen. The nav + remains disconnected.

The supplied welcome source and its required `TodayIntro.swift` dependency came from the author’s matching animation study. Both are copied unchanged to `native/` and included in `native/TodayWelcomeIntro.zip` with installation notes. Use the existing registered TestTheFuture-Medium font; the wordmark itself is embedded vector geometry. Both files pass iOS 17 simulator SDK type-checking together. No Today native screens or Figma files were edited.

The browser reuses the exact wordmark outlines, stroke masks and sampled curves through `TodayUI.WordmarkArt` exported by the existing logo script. This export leaves the standalone logo's behavior unchanged. One sampled drop drives both period motion and background translation, including their rebound. Paint, placement and supporting copy follow the supplied SwiftUI and the locally saved welcome still. Browser font rasterization is not claimed to be pixel-identical to SwiftUI.

| Time | Sequence |
| --- | --- |
| 0–2.017 seconds | Black opening, letters draw, period and gradient descend and settle together. |
| 2.06–2.58 seconds | Wordmark moves/scales from its 55 pt hero role into the 35 pt landing role. |
| 2.30–2.76 seconds | “what will you do?” fades in and rises 7 pt. |
| 2.62–3.10 seconds | Begin and privacy/terms copy enter together, rising 10 pt. |
| 3.10–4 seconds | Resting hold; playback then stops. |

Load `today-logo.js`, then `components/welcome-intro.js`, plus `components/welcome-intro.css`; insert `<today-welcome-intro></today-welcome-intro>` into a sized container. `isPlaying`, `speed` (0.1–2), `replay()`, `replay-token`, `currentTime`, `finished` and `reduced-motion` support review. Listen for `begin`, `complete` and `playbackchange`. The component emits `begin`; only the supplied-style demo handler replays the entrance. It does not start onboarding, accept terms, save anything, or reconnect navigation. Playback pauses offscreen/inactive; reduced motion immediately shows the completed composition. Hidden content is removed from accessibility/focus until its entrance.

Current verification: original/dependency byte comparisons; ZIP contents; JavaScript syntax; both native files type-checked together. Browser checks covered a paused black opening at 0.006 seconds with Begin hidden/inert, half-speed without resetting the paused time, resumed playback, completion at 4 seconds, reduced motion exposing the final screen, and keyboard Begin resetting the preview to time zero. Desktop library placement was visually checked against the supplied composition. At an observed 390 × 844 viewport there is no horizontal overflow; Begin is approximately 265 × 65 at y=694 and the footer ends at y=810, within subpixel rounding of source geometry. Native runtime, OS Reduce Motion, and physical-device behavior were not tested in this pass.

## Today logo component

- `native/TodayLogoAnimation.swift` is the user's supplied SwiftUI source, preserved byte for byte. It is a reusable native view; the other four showcase components remain browser implementations. The Today app project has not been modified.
- `today-logo.js` is its dependency-free browser counterpart, registered as `<today-logo-animation>`. It copies the six vector outlines, stroke construction, gradient, monotone Hermite curves, letter offsets, and period choreography from the source. It does not use a font or raster image.
- The showcase provides replay, pause/resume, 0.5×–2× speed, and looping. The component also supports `isPlaying`, `speed` (clamped to 0.1–2), `loops`, `replayToken`, and `replay()` properties/methods. Matching attributes are `playing`, `speed`, `loop`, and `replay-token`.
- Default playback runs once for 2.1 seconds. It pauses offscreen or in a hidden document, and holds the completed mark. `reduced-motion` can override the operating system preference; reduced motion displays the finished mark and does not loop.
- Browser usage: load `today-logo.js`, then insert `<today-logo-animation></today-logo-animation>`. Size its width with CSS; the aspect ratio is 2.4:1 and its background is transparent.
- Native usage: add the Swift file to the target and use `TodayLogoAnimation().frame(width: 240, height: 100)`. The supplied source specifies iOS 17+ / macOS 14+.

Verification for this addition: the unchanged Swift source passes `xcrun swiftc -typecheck` on this Mac; both JavaScript files pass `node --check`. Visually checked the browser logo at desktop and 390 × 844, its completed outlines and transparent counters, pause/resume, speed selection, looping, and the completed reduced-motion state. The schedule menu remains within its tile at both sizes, and rapid keyboard toggles preserve the selected state. No native runtime/simulator comparison was performed.


### Library opening and public source — November 20, 2026

The published library starts with the Today drawing animation, “what will you do?”, and the gradient. The floating preview toolbar, Begin button, and legal copy have been removed from the browser welcome component. Scroll directly into the component library below; its individual playback controls remain with each specimen. The keyboard-only skip link goes straight to the library. The opening plays once when visible, honors reduced motion, and does not automatically scroll or move keyboard focus. `landing.html` redirects to this combined page. This supersedes the earlier full-screen browser preview behavior recorded above. The supplied SwiftUI files remain unchanged.

The public repository and GitHub Pages host all browser and SwiftUI source. `source.html` lists direct file links, `components.json` maps each component to its code, and `llms.txt` gives agents a compact starting point. No sign-in is required to read or clone the public code.

Verified this opening revision at desktop (1600 × 900) and mobile (390 × 844): the hero fills one viewport, the library follows immediately, no horizontal overflow occurs, the keyboard skip link reaches the library, reduced motion produces the settled opening, and the old landing URL redirects correctly. The source index lists 13 components and fits mobile width. All local HTML/manifest paths resolve, all 17 JavaScript files pass syntax checks, and the browser reported no warnings or errors. No native source was changed.


### Compact opening refinement — November 20, 2026

The user requested less space between the opening and library, with matching backgrounds. The opening now uses 244 px on desktop and 200 px on mobile instead of filling the viewport. Its wordmark keeps a readable scale while the unused phone canvas is cropped. The gradient settles into the same black background used beneath the library, and the library has no extra top padding. This supersedes the previous full-viewport opening measurements.

Verified the compact opening at 1600 × 900 and 390 × 844: the library begins at 244 px and 200 px respectively, body and hero use the same black background, and neither viewport has horizontal overflow. The keyboard skip link and reduced-motion control remain usable, the opening reaches its completed state, and the browser reported no warnings or errors. The updated JavaScript passes `node --check`; the native sources are unchanged.


### Header removal — November 20, 2026

Removed the repeated Today / Component library header, New components link, and global Less motion / Replay motion controls. The cards now follow the compact opening directly. A visually hidden page heading and keyboard skip link preserve navigation. The library follows the operating-system reduced-motion preference, including changes during the session; per-component replay controls remain within their specimens. The unused global demonstration sequence was removed from `app.js`. This supersedes the earlier global replay and manual motion-toggle descriptions.

Verified after header removal: schedule preset selection, keyboard logging, and next-day navigation still work with no browser errors. At 390 × 844, the cards begin at 200 px with no horizontal overflow. A temporary local fixture simulated the device reduced-motion media query: the opening settled immediately, disclosures had 0 s transitions, and agenda navigation completed without animated settling. The fixture was removed; no device settings were changed. `node --check app.js` passes.

Removed the redundant “View opening” shortcuts from the Welcome specimen; it retains its own playback controls and SwiftUI download.


### Counter ink bounds and source access — November 20, 2026

The browser page counter now has inline padding and a full font line box around gradient-filled digits. Future's numeral outlines can extend beyond their advance width; negative tracking made those edges fall outside the gradient paint area. The padding preserves the original font size and rolling motion while keeping the full glyph visible. The supplied SwiftUI source is unchanged.

Each visible component now has a Code link to its source-index row. `INTEGRATION.md` includes an agent prompt, retrieval instructions, and a minimal page-counter example. The manifest's `browserIntegration` records reusable files, load order, markup, assets, and demo-only files; shared gallery specimens are identified explicitly.

Verified this revision at desktop (1600 × 900) and mobile (390 × 844): complete numeral 2, keyboard increments to 7 with reduced motion, no overflow, and a working Code link to the counter's source row. All ten font numeral ink bounds fit the padded paint box. The integration guide's exact HTML example was loaded separately with only counter CSS/JS and fonts; keyboard increment changed 10 to 11 without gallery dependencies. All manifest integration paths and 13 source-row anchors resolve, and the browser reported no warnings/errors. The temporary example page was removed after verification.


## November 20 additions: widgets, step progress and layered flames

| Component | Source / preview | Status and supported states |
| --- | --- | --- |
| Step progress indicator | components/step-progress.* · step-progress.html | Active Pill selected. Other variants retained in source. Configurable current/total; shared 3/5/7-step preview; reverse transitions; boundary states. |
| Habit widgets | components/habit-widget.* + widget-primitives.js · widgets.html | Small numeric/check-off, medium overview/streak, large list/portraits, lock rectangular/circular/check-in/streak/summary, ten message states. Asynchronous save adapter; queue, undo, retained failure data, retry. |
| Calendar, streak hero, recent log | components/habit-insights.* · widgets.html | Build activity, break activity/completion, date selection, explicit zero/no-log/future states. Caller-supplied saved history and confirmed streak. |
| Layered streak flame | components/streak-flame* · streak-flame.html | Selected Warm Ember artwork in hero/badge/widget placements; other palettes retained in source, 1.6-second animation then still, immediate Still control, static/animated SVG downloads. Original Figma flame remains intact. |

WIDGETS.md maps every widget family and reusable part on the linked Figma canvas. The Apple phone contexts and full detail-screen chrome are not widget components. No native application UI, WidgetKit extension, persistence, authentication, or shared store was added.

The focused preview headers now align their wordmark, descriptor and controls. Pressing today. returns to index.html#library. The main library still has no header bar.


Verification for this addition: checked changed JavaScript syntax, all local HTML/manifest source paths, and exported SVG XML. Browser checks at desktop and 390 × 844 covered three consecutive numeric taps (750 → 1,500), failure retaining 1,500, retry to 1,750, check-off Log/Undo including Enter, minimum-goal decrement to no log, upper-limit decrement to recorded zero, long names without artwork overlap, date selection and arrow-key focus, closed-day vs open-day zero, 3/7-step clamping and both navigation boundaries, and reduced-motion states. Flame playback reached still, canceled via Still, and stayed still with Less motion. The corrected Today link returned to the main library; the main page mounted all new collections with no console errors or horizontal page overflow. Native/device integration was not tested because it was not changed.


## Selected directions and widget refinement · November 20, 2026

The user selected **Active Pill** for step progress and **Warm Ember** for streak artwork. These are now the defaults and the live library direction; earlier alternatives remain in the readable source. Warm Ember also appears in habit widgets and insight heroes.

Refined all small widget alignment, enlarged reading art, optically centered the existing plus/minus SVGs, separated quick-action signs and labels, enlarged lock actions, reworked the four-habit overview into spacious metric rows with full-width actions, aligned streak dates beneath the count, and centered calendar selection content. Water now rises with a small settling wave; repeated updates redirect one animation and reduced motion settles immediately. Browser specimen sizes can grow for clarity; no native WidgetKit implementation changed.


Verification for this refinement: at desktop and 390 × 844, checked the revised small-card alignment, enlarged artwork, centered original control symbols, long titles, full-width portrait actions, 64 px lock actions with 16 px separation, and no page/card overflow. Selected calendar content has equal 7 px top/bottom insets. Confirmed rapid water updates redirect the running fill, reversing settles correctly, reduced motion snaps to the saved level, and a failed save preserves that level until Retry succeeds. Active Pill passed keyboard navigation, first/last boundaries, total reduction to three steps and reduced motion. All three Warm Ember placements use ember; playback settles, Still cancels, and Less motion stays still. Browser logs showed no warnings/errors.


## Today gradient loader · November 20, 2026

Selected loader using the supplied circle → twisting globe → circle motion. `components/loader-motion.js` ports the original 28 poses, 1,201 curve samples, quaternion projection, cubic tracks and quintic end caps. The 4.84-second loop is unchanged. `components/loader.js` draws transparent vector strands with a blue (`#5e91f6`) → lavender (`#a781f0`) → peach (`#ffb276`) gradient and depth shading. `components/loader.css` supplies sizing. `loader.html` and the main library offer large and inline previews, pause/resume, replay, half speed and reduced motion. Only the demo controls live in `loader-study.js`.

`native/TodayLoader.swift` provides the matching gradient SwiftUI component; `native/reference/CoilSphereLoader.swift` preserves the supplied original byte for byte. The loader runs only while mounted for pending work, preserves elapsed time when paused, and suspends in the background (browser also offscreen). Reduced motion holds the globe at 2 seconds. No production operation, onboarding flow, or native app integration is attached to the preview.

Verification: the browser math matches all 1,201 vertices in ten sampled frames from the supplied Swift implementation, including the quintic end caps (maximum coordinate difference 3.6e-15). The adapted SwiftUI type-checks for macOS 14 and iOS 17 simulator targets. Browser checks at desktop and 390 × 844 confirmed visible gradients, no horizontal overflow, keyboard replay and pause/resume from the same time, half-speed controls, reduced-motion still at 2 seconds, and suspension after scrolling offscreen. Source paths resolve and browser logs showed no warnings/errors. The supplied reference is byte-identical. Native runtime/app integration was not performed.


Check-off spacing refinement: small check-off widgets now reserve 16 px between the artwork and the status line, using 8 px of internal padding in the existing status row. The control baseline and card size stay stable. Verified No log yet / Logged today, keyboard Log / Undo, and reduced motion at desktop and 390 × 844 without horizontal overflow.


## Apple widget size refit · November 20, 2026

Replaced growing widget cards with fixed Apple iPhone family dimensions. The default 390 × 844 screen preset uses small 158 × 158, medium 338 × 158, large 338 × 354, rectangular accessory 160 × 72 and circular 72 × 72. Compact (375 × 667) and large (430 × 932) presets use the corresponding Apple HIG table values. A gallery selector and per-widget size captions make the constraints reviewable. WIDGETS.md contains the full size/source contract. This supersedes the earlier 184 px growing cards and 216 px accessories.

Small widgets use one 44-point quick-log button, readable amount/target and contained artwork; tapping content opens corrections/details. Medium has two stable rows. The large list uses four rows plus a full-day link, and the four-habit grid fits its complete family frame. Lock Screen compositions use compact independent layouts. Long names truncate visually while preserving their full accessible name. Save failures replace the face inside its fixed size, preserve the confirmed amount, and keep keyboard focus on the retry flow. The ten message states also use the small family. In-app calendars and habit details are labeled separately. All browser code remains directly reusable; no native WidgetKit extension was added.

Verification for this refit: checked all 20 widget specimens against compact, standard and large family dimensions, including at 375 × 667 and 390 × 844 browser viewports. No widget or page overflow was found. The smallest preset passed long-name truncation with complete accessible names, all ten message states, numeric and accessory failure/Retry preserving confirmed values, and focus recovery. Standard controls measured at least 44 × 44 CSS pixels (within fractional layout rounding). Keyboard Log/Undo and reduced motion were checked; three rapid numeric saves reached 1,500 with the fill settled at 75% and a stable 158 × 158 frame. JavaScript syntax, local source references and whitespace checks pass. Native runtime, Dynamic Type, tinting and other Apple platforms are not claimed as tested.

### Reading widget simplification · November 20, 2026

Removed the small reading widget’s progress marks at user request. The page count and target carry progress, with an 8-point gap before the quick action. Other small-card content retains its positioning and fixed Apple-sized frame. Updated the gallery caption and reuse guidance. Verified desktop and 390 × 844 layouts, keyboard quick-add, reduced motion, no overflow, JavaScript syntax and whitespace.

### Icons & controls · November 21, 2026

Added the ten icons from Figma section 321:484, plus the app’s original CounterIncrease and CounterDecrease SVGs. Every supplied app icon matches the SHA-256 in its Figma component description. Original SVG colors, geometry and intrinsic dimensions are preserved in `assets/icons/manifest.json`; each has a direct SVG download in `controls.html`.

Reusable `today-icon`, `today-button`, `today-switch` and `today-stepper` live in `components/icons.js`, `components/controls.js`, and `components/controls.css`. The new main-library collection covers primary, prominent, compact, secondary, quiet, quick, round, icon, profile, choice, weekday and row buttons, plus ready/disabled/busy/saved states, isolated +/− controls, switches and status marks. Existing specialized controls link to their dedicated previews. The stepper has the app’s 350 ms hold / 105 ms repeat and bounded values. The gallery’s save and navigation feedback is explicitly sample behavior. CONTROLS.md contains API, events, source provenance and dependency instructions; components.json, source.html, llms.txt and INTEGRATION.md include the new entries. No native app source was changed.

Verified original SVG files and rendered native-size geometry, desktop/390-point responsive composition, 375-point portrait and 844-point landscape without horizontal overflow, all new button targets at least 44 points (fractional rounding), keyboard activation, save feedback, standalone counting, held stepping without a release increment, minimum/maximum disabled directions, switch state under reduced motion, choice exclusivity and preset/weekday synchronization. JavaScript syntax and HTML/manifest local paths pass. Native Dynamic Type and SwiftUI integration are not part of this browser change.

Standalone reuse check: loaded only controls.css, icons.js and controls.js in a temporary minimal page. At 375 points, the 1,000,000 maximum and a long button label fit without overflow; the increase action disabled correctly. The temporary fixture was removed after verification.

## Selected pickers and onboarding comparisons

Day ruler + custom entry is selected; week cards, inline clock, soft wheels, AM/PM pill and switch remain reusable pieces. See [PICKERS.md](PICKERS.md). Historical quiet-default and dial sources remain available but are not live alternatives.

[Onboarding comparisons](onboarding.html) contains two layouts for nine approved screens, plus the existing landing and unchanged Features composition. Both directions use the same approved content and components. Selected flow follows the user’s per-screen choices; Compare A/B keeps the alternatives available. The four-step/two-week flow is deliberately separate from the newer seven-step/21-day picker fixture. See [ONBOARDING.md](ONBOARDING.md) for source nodes, events and prototype boundaries.

[Artwork](artwork.html) provides 21 original assets and download links. [Slide to log](slide-to-log.html) now has a focused standalone preview and an independent component.

## November 21 validation

The selected onboarding flow and A/B comparisons were exercised in the browser at desktop and inside a 390 × 844 viewport. Checked: tracking choice, check-off skipping Target, B-to-A draft continuity, target edits, schedule presets/custom weekdays, first-session/check-in dates, Saved → Home, Skip → empty Home, keyboard selection and reduced-motion presentation. All selected layouts have no horizontal overflow. Native keyboard, VoiceOver and haptics remain device integration checks.

Standalone checks covered ruler endpoints and live value changes, invalid/custom day input, inline time draft versus confirmation, cancellation, the shared AM/PM pill, slide keyboard/tap/Undo/disabled states, main-card/checklist synchronization, and all 21 artwork images loading within their stages. JavaScript syntax, local source/asset paths, manifest dependencies, source anchors and original artwork hashes were checked. No native app files were changed.

### Home and onboarding follow-up

[Home with more habits](home.html) extends the selected illustrated Home into an interactive, scrollable daily list. [HOME.md](HOME.md) records the PRD distinctions, model and event API. The onboarding gallery now uses one normalized darker background, centered Tracking artwork, and a persistent gradient transition. Landing and Features stay unchanged. Skip for now and its Home bypass were removed at the user's request. See [ONBOARDING.md](ONBOARDING.md) for current behavior; older verification notes above describe earlier revisions.

November 21 follow-up checks: changed JavaScript parsed with `node --check`; manifest dependencies and local HTML/source links validated. Desktop and 390 × 844 browser checks covered Home list scrolling, keyboard logging/focus, partial/target-met states, failed saves, future/day-off states, centered Tracking artwork, equal onboarding paint, reduced gradient motion, schedule preset/custom selection, ruler centering and time editor confirm/cancel/12 AM conversion. The streak widget measured 338 × 158 without internal overflow. Native haptics, VoiceOver and device keyboard behavior remain unverified.
