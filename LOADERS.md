# Today loaders

The circle → globe loader is selected. Liquid orbit is a second potential direction, added from the user's supplied SwiftUI; it does not replace the existing loader.

## Liquid orbit

[Preview](liquid-orbit-loader.html) · [Source index](source.html#liquid-orbit-loader)

Eight liquid beads follow the supplied Fourier profiles. Each bead takes its neighbor's pose every second, preserving the loop. The browser sums the same soft elliptical fields and takes the same contour; WebGL provides antialiased rendering, with a lower-resolution Canvas fallback when unavailable. The fixed blue/lavender/peach gradient is decoration, not progress.

```html
<link rel="stylesheet" href="components/liquid-orbit-loader.css">
<script src="components/liquid-orbit-motion.js" defer></script>
<script src="components/liquid-orbit-loader.js" defer></script>
<today-liquid-orbit-loader label="Loading"></today-liquid-orbit-loader>
```

`play()`, `pause()`, `replay()`; `speed` 0.1–4 (default1), `paused`, and `label`. Pausing and changing speed preserve continuity. Offscreen/document-hidden work suspends. Reduced motion shows time0. Mount only during pending work; remove when complete. The component is transparent and retains its 740:700 aspect ratio. Gallery controls and compact/still examples are in `liquid-orbit-study.js`, not component dependencies.

Native: include unchanged `native/reference/LiquidOrbitLoader.swift` and `native/TodayLiquidOrbitLoader.swift` together:

```swift
TodayLiquidOrbitLoader(isAnimating: loading, speed: 1, replayToken: 0)
    .frame(width: 180, height: 170)
```

The native wrapper masks Today’s gradient with the supplied motion. Native reduced motion, paused clock, scene lifecycle and replay are handled by the original. This is standalone source, not app integration or native runtime verification.
