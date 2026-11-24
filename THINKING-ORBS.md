# Thinking orbs

[All nine previews](thinking-orbs.html) · [Swift source](native/TodayThinkingOrb.swift) · [Selected creation wait](habit-thinking.html)

The user requested all nine ThinkingOrbs loaders in the component library on November 22, 2026. The referenced repository is already a native SwiftUI implementation. We reuse its exact source, not a new approximation. These components remain available. The latest creation selection is centered with Breathing and a subtle moving Today background. This supersedes the earlier Liquid orbit choice for that flow; Liquid orbit and circle/globe remain approved components.

## Native integration

Add `native/vendor/ThinkingOrbs` as a local Swift package and link its `ThinkingOrbs` product. Copy `native/TodayThinkingOrb.swift` into the host target. The package includes its complete Sources and Tests trees, license and original package manifest. It requires Swift 6 / Xcode 16 or newer, iOS 17+ / macOS 14+.

```swift
import ThinkingOrbs

TodayThinkingOrb(.working, isAnimating: requestIsPending)
TodayThinkingOrb(.weaving, size: .small, label: "Preparing your plan")
TodayThinkingOrb(.shaping, diameter: 80)
```

Designs: `working`, `searching`, `solving`, `listening`, `connecting`, `weaving`, `composing`, `breathing`, `shaping`. Regular is 64 pt; small is a separately tuned 20 pt design, not a scaled regular. `diameter` scales the selected tuning. Default monochrome depth, dot counts, speeds, geometry, z ordering and opacity are unchanged. `TodayThinkingOrbGallery` is a standalone SwiftUI specimen.

The wrapper pins dark ink and pauses when its host is inactive or `isAnimating` is false. The original handles offscreen suspension and a representative still frame under Reduce Motion. The upstream clock is shared: resuming rejoins its current phase. Mount only for real pending work. An orb name is an art choice, not evidence of retrieval, voice recording, tool calls or a processing stage. The host supplies meaningful accessible status; hide the decorative orb when accompanying text already announces that status.

## Browser integration

```html
<link rel="stylesheet" href="components/thinking-orb.css">
<script type="module" src="components/thinking-orb.js"></script>
<today-thinking-orb design="weaving" label="Preparing your plan"></today-thinking-orb>
```

Attributes: `design`, `size="regular|small"`, optional `diameter` in CSS px, `paused`, `label`. `play()` / `pause()` control playback. `time` pins elapsed seconds for deterministic inspection; it is not a completion value. `data-state` reports playing/paused/suspended/still. All orbs in one document share phase. Animation frames stop offscreen, while hidden, on disconnect and under Reduce Motion. A `time` override still yields the upstream geometry-time 0.6 still when Reduce Motion is active.

Browser geometry is the original TypeScript engine, shipped as readable modules in `vendor/thinking-orbs/browser/`. There is no React runtime, npm install or build step to view the library. `node scripts/prepare-thinking-orbs.mjs` verifies every vendored blob and reproduces those modules by stripping types and adding explicit `.mjs` imports. Raw source remains beside them.

## Attribution and pins

- [ThinkingOrbs by Haplo LLC](https://github.com/haplollc/ThinkingOrbs), commit `7b09b5fec09b8471ee591793ca5fb71cf7bf364d`. [Unchanged MIT license](native/vendor/ThinkingOrbs/LICENSE).
- Original designs and web engine: [thinking-orbs by Jakub Antalik](https://github.com/Jakubantalik/thinking-orbs), commit `de85557ca220332586d070d8788c0e1d6e877a0d`, the exact web revision pinned by the Swift port’s differential test script. [Unchanged MIT license](vendor/thinking-orbs/LICENSE).
- [Provenance and Git blob hashes](vendor/thinking-orbs/provenance.json) cover all 31 vendored files. Preserve both notices in redistributed app source/licenses. Original files are unchanged.

## Verification · November 22

The vendored Swift package builds and its 13 default test methods pass on macOS, including parameterized geometry for all nine designs × both sizes, golden comparisons, public API, accessibility fixtures and SwiftUI rendering. Optional media/sweep tests remain skipped unless explicitly enabled. A native Canvas contact sheet was additionally rendered. The entire upstream module and the Today wrapper compile against the iOS 17 simulator target with the installed iOS 26.5 SDK. These checks are not a Today app integration or physical-device performance claim.

Browser and flow validation is recorded in [HABIT-THINKING.md](HABIT-THINKING.md). Numerical frame parity is separate from rasterizer antialiasing: no claim of pixel-identical native/browser rendering or completed device accessibility testing.
