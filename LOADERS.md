# Today loaders

The circle → globe loader is selected. Liquid orbit is also approved as a component, added from the user's supplied SwiftUI. Both loaders remain available in Components.

## Liquid orbit

[Preview](liquid-orbit-loader.html) · [Source index](source.html#liquid-orbit-loader)

Eight liquid beads follow the supplied Fourier profiles. Each bead takes its neighbor's pose every second, preserving the loop. The browser sums the same soft elliptical fields and takes the same contour; WebGL provides antialiased rendering, with a lower-resolution Canvas fallback when unavailable. The blue/lavender/peach gradient is decoration, not progress. `palette="soft"` uses the lighter, less saturated #A9B5D3 / #BFB2D2 / #DDC7BD stops selected for habit preparation; omitting the attribute keeps the original palette. Only paint changes; the motion and elapsed phase are shared.

```html
<link rel="stylesheet" href="components/liquid-orbit-loader.css">
<script src="components/liquid-orbit-motion.js" defer></script>
<script src="components/liquid-orbit-loader.js" defer></script>
<today-liquid-orbit-loader label="Loading"></today-liquid-orbit-loader>
```

`play()`, `pause()`, `replay()`; `speed` 0.1–4 (default1), `paused`, and `label`. Pausing and changing speed preserve continuity. Offscreen/document-hidden work suspends. Reduced motion shows time0. Mount only during pending work; remove when complete. The component is transparent and retains its 740:700 aspect ratio. Gallery controls and compact/still examples are in `liquid-orbit-study.js`, not component dependencies.

Native: include unchanged `native/reference/LiquidOrbitLoader.swift` and `native/TodayLiquidOrbitLoader.swift` together:

```swift
TodayLiquidOrbitLoader(isAnimating: loading, speed: 1, replayToken: 0, palette: .soft)
    .frame(width: 180, height: 170)
```

The native wrapper masks Today’s gradient with the supplied motion. Native reduced motion, paused clock, scene lifecycle and replay are handled by the original. This is standalone source, not app integration or native runtime verification.

## Thinking orbs · November 22 addition

[All nine](thinking-orbs.html) now appear in Components, with original SwiftUI and matching browser geometry. See THINKING-ORBS.md. Working, Searching, Solving, Listening, Connecting, Weaving, Composing, Breathing and Shaping each have separately tuned 64 pt and 20 pt variants. The user’s latest correction selects Breathing for the [centered preparation screen](habit-thinking.html), keeping its subtle background and adding the transition from Describe. The earlier soft Liquid orbit remains available as a standalone component. All nine orbs remain reusable Components.
