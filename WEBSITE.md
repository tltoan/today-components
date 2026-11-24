# Today website · Your day, in view

November 23, 2026. The user chose **Your day, in view**, removed the “A little more everyday.” top-left link and “Coming to iPhone” copy, and requested a **Get app** CTA, subsequently refined to the shared gray primary-button gradient. The page opens with just Today centered, then the period lands and the gradient descends, and the same logo moves to the top center before the page appears. The user explicitly approved this website design and motion after the header, gray CTA and copy refinements. Final legal/download details remain pending. Nothing has been deployed, and ownership of the requested today.com domain has not been verified.

`today-site-b.html` is the live entrypoint. A is removed from the gallery/comparison and `today-site-a.html` redirects to B, preserving query/hash links. The approved website card is in Screens & flows → Website. Product copy and interactive UI stay separate from the prototype toolbar. Privacy/Terms/Support align with the settled logo’s visual center on desktop; at phone widths they form a centered row immediately below the logo without overlap.

## Motion contract

- `components/welcome-intro.js` remains the sole four-second clock. Its original vector paths, letter drawing, period spring, wash drop and internal handoff are unchanged. `today-logo.js`, original artwork and native sources are untouched.
- `today-site-opening.js` reads the component’s rendered `data-time`; it does not start another timer or animation loop. It keeps the visible signature centered through the original scale/translation, using the canvas’s initial/final optical anchors.
- The period/wash have settled before docking starts. From **2.58–3.65 seconds**, the canvas moves/scales into the existing header position with `TodayUI.WordmarkArt.smooth`. The surrounding site enters from **3.10–4.00 seconds** on that same clock. The wash remains mounted behind the hero.
- Non-intro surfaces are inert and hidden during the opening. A keyboard-accessible Skip intro button and Escape settle immediately; keyboard replay restores focus to Replay intro. Reduced Motion bypasses the opening and shows the settled site immediately. Deep-linked Privacy/Terms/Support and gallery embeds also skip the full-screen opening.
- Replay reuses the mounted canvas. The source pauses in the background; resize recomputes the same progress at the new dimensions. Reload/replay starts at the top. Website navigation does not replay the intro.
- All inline expansions, including the temporary download response, use the approved 600 ms `TodayUI.Disclosure`. Existing section entrances and confirmed card Gradient Rise remain intact.

## CTA and page boundaries

The Get app button uses the existing shared primary control’s gray `--today-control-action` gradient and light text, retaining its geometry and press response. The later gray-gradient request supersedes the earlier colored CTA. The user confirmed **Keep it as a preview for now**. Activation discloses **“Preview only. The App Store download link hasn’t been connected yet.”** Replace this temporary behavior only when a real URL is provided. Do not invent a listing or imply the app is already available.

The reading example starts at 5 pages; adding five reaches ten and plays the selected target feedback. The shared week bar changes fixture dates, including future Planned states. The hero supporting paragraph, card instruction/reset row, small preview caption and development footer line were removed at the user’s request. Amounts remain in memory across website page changes and reset on reload. No account or data is submitted.

Privacy, Terms and Support use local URL states with browser history. Legal text is explicitly a **Draft preview** with coverage descriptions, not adopted policy or binding terms. Final text requires the operating entity, actual production services/data inventory and legal review. No retention periods, contact addresses, jurisdiction, pricing, testimonials or production privacy claims are invented. Support describes the selected product direction.

## Sources

`today-site-b.html`, `today-site.css`, `today-site.js`, `today-site-opening.js`; existing `today-logo.js`, `components/welcome-intro.*`, `components/habit-card.*`, `components/target-feedback.*`, `components/controls.*`, `components/artwork.*`, `components/log-photo-action.*`, `components/week-bar.*`, `foundations/disclosure.js`, `foundations/motion.css`. A is only a compatibility redirect.

## Verification

The prior two-direction pass covered desktop, 390 × 844, B at 800 × 900, real logging, future dates, routes/Back, keyboard and Reduced Motion. Those checks predate this opening refinement. Current results are appended after its browser pass.

### Current opening refinement

- Observed drawing → settled period/gradient → docking → page reveal at the actual 2155 × 1109 desktop viewport and 390 × 844 phone viewport. During the drawing phase, surrounding content is hidden; the phone signature's visible center is within two CSS pixels of the viewport center. Settled logo is in the top-center header.
- Fixed horizontal overflow from the scaled, mostly empty SVG canvas with horizontal clipping at the website shell; phone width remains 390 px on Home, expanded Get app and Privacy.
- Keyboard Replay + Escape settles and returns focus to Replay. Less motion + Replay stays immediately at the finished state. Deep-linked legal pages skip the full opening.
- Get app expands explicit preview feedback using the shared disclosure; Privacy navigation and the existing 5 → 10 page logging/target state still work. Website tabs recorded no warnings/errors.
- Syntax checks for `today-site-opening.js`, `today-site.js` and `library-catalog.js`, local HTML/source references, manifest dependency IDs and `git diff --check` passed. Shared Welcome/logo source remains unchanged. This verifies the browser composition, not native app integration or a download service.

### Header and copy refinement

- Verified desktop navigation aligns to the visible logo center within one CSS pixel. At 390 × 844, links form a centered row below the logo without overlap or horizontal overflow.
- Get app inherits the shared gray primary-button gradient and light label; Enter still opens its explicit preview response. Removed all four requested text areas, including the card reset control, and removed their unused event-handler dependencies.
- The real card preview still logs 5 → 10 pages and reaches Target met; Privacy navigation works. Reduced-motion Replay settles immediately. JavaScript syntax and whitespace checks passed.
