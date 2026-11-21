# Today signatures

The approved opening and original logo remain unchanged. The curved signature is an additional variation from the user-supplied November 21 SwiftUI file.

| Piece | Browser | SwiftUI |
| --- | --- | --- |
| Original | `today-logo.js`, `<today-logo-animation>` | `native/TodayLogoAnimation.swift` |
| Curved variation | `components/logo-curved.js`, `<today-logo-curved>` | `native/TodayLogoCurvedAnimation.swift` |

Preview the additional variation at `logo-variations.html` or `index.html#logo-curved`. Its rounded t is solid; the y can be curved or diagonal. The o, d, a, drawing/lift timing and falling-period choreography are retained. The browser paths come from the supplied SwiftUI Path geometry, including its union/subtraction shapes.

## Reuse

Load `today-logo.js`, then `components/logo-curved.js`. The logo includes its own shadow styles and transparent background; the gallery stylesheet and controls are optional.

```html
<today-logo-curved y-style="curved" style="width:240px"></today-logo-curved>
```

`y-style="original"` selects the diagonal y while retaining the rounded t. The `yStyle` property is equivalent. It supports the original `isPlaying`, `speed` (0.1–2), `loops`, `replay()`, `replay-token`, `currentTime`, `finished`, `reduced-motion` and `complete` event. Playback lasts 2.10 seconds, plays once by default, suspends offscreen/background, and shows the completed mark under reduced motion.

For SwiftUI, include `native/TodayLogoCurvedAnimation.swift` and use:

```swift
TodayLogoCurvedAnimation(yStyle: .curved)
    .frame(width: 240, height: 100)
```

It is standalone, iOS 17+ / macOS 14+. Types are namespaced so it can coexist with `TodayLogoAnimation.swift`. `native/reference/TodayLogoCurvedVariation.swift` is the exact supplied file with original type names; do not compile that reference alongside the original logo because those names collide. Only type names differ between the reference and reusable variant. Native source inclusion does not mean it has been integrated into the Today app.
