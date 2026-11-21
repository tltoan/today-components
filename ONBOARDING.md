# Onboarding comparisons

[Compare the screens](onboarding.html) · [Browser compositions](components/onboarding.js) · [Styles](components/onboarding.css) · [Gallery](onboarding-study.js)

Two browser layout proposals for nine screens, using the existing Today components. A is an open canvas with prominent artwork. B groups choices and summaries into smaller surfaces. The user selected B for Privacy, Introduction, Tracking, Schedule, Review, Saved and Home. Describe combines A’s background with B’s input panel; Target combines A’s layout with a panel background. The existing landing animation is reused unchanged. The Features composition retains its approved content, tilted two-row carousel, original artwork, and Continue action; there is no second Features design.

## Approved source and sequence

The source is [Figma section 322:484](https://www.figma.com/design/Xf03CH47k7G0graqTZ4zis/today.?node-id=322-484), read November 21, 2026. The local app's `OnboardingViews.swift` and `FeatureCarousel.swift` supplied corroborating layout and motion context; they were not modified.

| Screen | Source node | Comparison |
| --- | --- | --- |
| Landing | 121:11927 | Existing `today-welcome-intro`; logo, question, gradient |
| Features | 121:11953 | Shared approved composition |
| Describe | 121:12443 | A + B |
| Privacy | 121:12612 | A + B |
| Introduction | 121:12622 | A + B |
| Tracking method | 369:1651 | A + B, step 1 of 4 |
| Target | 369:1700 | A + B, step 2 of 4 |
| Schedule | 369:1802 | A + B, step 3 of 4 |
| Review | 369:2087 | A + B, step 4 of 4 |
| Saved | 369:2340 | A + B |
| Home | 169:2471 | A + B |

Flow: Landing → Features → Describe → Privacy → Introduction → Tracking → Target → Schedule → Review → Saved → Home. Check-off skips Target. Skip for now opens empty Home. Back and Review plan preserve the local draft. At least one scheduled day remains selected. The Home + stays disconnected from the habit editor, as requested earlier.

**This approved sequence says two weeks.** Preserve that content in these comparisons. The newer picker library's 21-day default and seven-step creation examples are separate references. This study does not insert trial-length or reminder steps into the approved four-step setup. Resolve that product-version difference explicitly before app integration.

## Reuse and events

```html
<today-onboarding-screen screen="review" variant="a"></today-onboarding-screen>
```

Load the ordered dependencies in `components.json` under `onboarding`. This composition reuses `today-button`, `today-plan-button`, `today-step-progress`, `today-page-counter`, `today-stepper`, `today-segmented-control`, `today-icon`, `today-artwork`, `today-bottom-nav`, and `today-welcome-intro`. No external runtime is needed.

`screen` accepts the IDs in `TodayOnboarding.pages`. `variant` accepts `a` or `b`. Assign `.model` with a local draft, or read a copied draft back:

```js
screen.model = {
  description: 'I want to read before bed.',
  method: 'pages', // pages | minutes | check
  amount: 10,
  days: [0, 2, 4], // Sun = 0
  start: 0, // fixture Today = Nov 15, 2026; Tomorrow = 1
  empty: false
};
screen.addEventListener('navigate', e => route(e.detail.screen, e.detail.draft));
screen.addEventListener('draftchange', e => retainDraft(e.detail));
screen.addEventListener('preview-action', e => showPreviewNote(e.detail.message));
```

Selected flow is the default gallery mode and carries one draft across the chosen per-screen layouts. Compare A / B retains both alternatives with independent drafts and changes the displayed page together. Direct screen buttons allow inspecting any page without traversing the sequence. `Reset examples` restores the selected draft and both comparison drafts. `Use reading example` fills both description fields.

## Prototype boundaries

- The approved reading plan and November dates are fixtures. Typing exercises the existing **sample** readiness rules, not an AI parser. Build my plan opens that reading fixture; it does not generate a plan from arbitrary text.
- Start plan advances to the Saved preview. No network request, persistence, account, subscription, permission, or real habit is created.
- Home Log reports its destination in the preview status. It does not save a log. Home/Habits animate the navigation selection; full destination pages are outside this layout study.
- The native empty-Home copy is preserved. Its + remains independent in this browser study.
- Browser source is available to agents. These compositions have not been ported into the SwiftUI app.

## Motion

Screen entry uses a 600 ms, 10 px settle. Editing a weekday or start date does not replay the full screen entrance. The adaptive button, counter, active pill, buttons and cradle keep their existing component motion. Features uses the app's 28 pt/s track, 174 pt column pitch and −17.7° tilt; drag pauses the track, release resumes after three seconds. Keyboard arrows adjust by one column and pause continuous movement. Offscreen/background and reduced-motion states stop the track. Reduced motion also removes screen entrances.

The landing is shown as the approved animation-only composition; use the external screen tabs to move from it in the gallery. No new Begin or legal controls were added.

## November 21 selections and refinements

- Describe: A background, B input panel. Skip for now uses a roomy quiet action.
- Privacy: B panel/background with centered lock artwork.
- Introduction: B retained from the review.
- Tracking: B option layout; Review plan is a full 48 px quiet target.
- Target: A artwork/count proportions within a subtle panel. The page counter's optional `hide-caption` removes “Each mark is one page” in this composition while retaining accessible mark meaning and the default caption in the standalone counter.
- Schedule: B panel, centered count, aligned weekday row and reusable three-option segmented preset bar. Custom weekdays clear the preset selection. Changing a preset updates count and marks without rebuilding the control, preserving the moving highlight.
- Review, Saved, Home: B. Secondary actions use readable labels, padding and explicit hit areas.
