# Use Today components in another page

The live gallery is a preview. The public repository contains the actual readable code. There is no npm package or authenticated API to install.

## Give an agent this instruction

> Use the Today component library at https://github.com/tltoan/today-components. Read AGENTS.md, INTEGRATION.md, and components.json. Reuse the [component name] source and its dependencies when building this page. Preserve its appearance, motion, keyboard support, and reduced-motion behavior. Use the browser implementation for a web page, or the supplied SwiftUI implementation when available for a native screen.

Replace `[component name]` with “Page counter,” “Center cradle navigation,” or another entry in the manifest. The gallery's **Code** links go directly to the relevant row in `source.html`.

## Fetch and select the code

```sh
git clone https://github.com/tltoan/today-components.git
```

Agents without a shell can read https://tltoan.github.io/today-components/llms.txt, then follow the direct source URLs. Files are also available at `https://raw.githubusercontent.com/tltoan/today-components/main/<path>` without sign-in.

1. Read the component's entry in `components.json`. `browserIntegration` identifies reusable styles, scripts in load order, required assets, markup, and demo-only files. `sourcePage` links to the human-readable file list.
2. Copy the implementation and dependencies into the target project. Keep their relative paths consistent, or update references to fonts and assets. Load each script once; it registers a browser custom element or controller.
3. Use the target page's real data and event handlers. Keep sample data separate. Do not load `app.js`, `component-studies.js`, `welcome-study.js`, or `navigation-study.js` as generic component dependencies: they wire the gallery demonstrations to its markup.
4. Verify the result at the target sizes, with keyboard input and reduced motion. Record the library commit used so later changes can be compared deliberately.

The reading schedule, slide-to-log, and checklist currently share gallery code in `app.js` and `style.css`. They require extracting the relevant markup and state; they are not isolated imports. The agenda provides a reusable scrolling controller plus a gallery fixture. The manifest states this explicitly.

## Example: web page counter

Copy these four files, preserving the directories shown:

```text
components/page-counter.css
components/page-counter.js
assets/TestTheFuture-Regular.otf
assets/TestTheFuture-Medium.otf
```

This is a minimal complete page; the component does not require the gallery's JavaScript or its whole stylesheet:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Reading pages</title>
  <style>
    @font-face {
      font-family: Future;
      src: url("assets/TestTheFuture-Regular.otf");
      font-weight: 400;
      font-display: swap;
    }
    @font-face {
      font-family: Future;
      src: url("assets/TestTheFuture-Medium.otf");
      font-weight: 500 900;
      font-display: swap;
    }
    body { margin: 0; padding: 32px 0; background: #08080a; }
    today-page-counter { margin-inline: auto; }
  </style>
  <link rel="stylesheet" href="components/page-counter.css">
  <script src="components/page-counter.js" defer></script>
</head>
<body>
  <today-page-counter amount="10" maximum="40" mark-count="20">
  </today-page-counter>
</body>
</html>
```

Read or set `counter.amount`. Listen for the bubbling `change` event; `event.detail.amount` is the selected number. The host application decides when and where to save it. The component itself has no backend or persistence.

Other browser components use the same `Future` font-family definitions. The logo uses embedded vector geometry instead of font glyphs. Navigation also references `assets/HomeIcon.svg` and `assets/HabitsIcon.svg` relative to the page; adapt those URLs when integrating into nested routes or a bundled app.

## SwiftUI availability

`swiftSource` in the manifest lists native source when it exists: logo, welcome landing, page counter, staggered bar chart, and shared motion tokens. The supplied files are preserved unchanged. `TodayWelcomeIntro.swift` needs `TodayIntro.swift`; both are included in `native/TodayWelcomeIntro.zip`. Register the required font in the target app as described by the source.

An empty `swiftSource` means that this library does not yet supply a native version of that component. Do not describe a browser custom element as SwiftUI or claim app integration from the presence of a source file. Ask for or perform an explicit port when a native implementation is required.


## Widgets, progress and streaks

- Step progress: import only components/step-progress.css and .js. Active Pill is the selected default; current/total remain the control attributes. step-progress-study.js is only the gallery comparison controller.
- Widgets: read WIDGETS.md for the complete Figma coverage and data contract. Load widget-primitives.js before habit-widget.js or habit-insights.js. Assign a real asynchronous save handler; never import the gallery's simulated handler or fictional history into a product.
- Layered flame: load streak-flame-art.js, then streak-flame.js and .css. Use palette ember, the selected Warm Ember direction. Other palettes remain historical options. play() celebrates a confirmed change once; still() settles immediately. Static and animated SVGs are downloadable in assets/streaks/, and scripts/export-streak-assets.js regenerates them from the source geometry.
- These new collections have no SwiftUI source yet. Browser accessibility and motion checks do not establish WidgetKit, VoiceOver or real-device behavior.


## Today loader

Load `components/loader.css`, then `components/loader-motion.js` and `components/loader.js`. Use `<today-loader label="Loading"></today-loader>` only while an operation is pending, and remove it once complete. Call `pause()`, `play()` or `replay()`; set `speed` (0.1–4) or the `paused` attribute when needed. Width controls size; the canvas remains transparent. The loop suspends when offscreen or the document is hidden, preserving time. Reduced motion shows the same still globe at 2 seconds. The host owns actual work, failure and completion.

SwiftUI: copy `native/TodayLoader.swift` and use `TodayLoader().frame(width: 240, height: 240)`. It requires iOS 17+ or macOS 14+, no assets or packages. `isAnimating`, `speed`, `replayToken`, `colors` and `lineWidth` are configurable. The supplied orange/olive version remains unchanged under `native/reference/CoilSphereLoader.swift`; it is reference source, not a dependency.


## Fixed widget families

Habit widgets now use Apple iPhone family dimensions, not growing app cards. Use `size="compact"`, `size="standard"` (default), or `size="large"`. The geometry table and variant-to-family mappings are in `WIDGETS.md`; `TodayWidgets.sizes` is the code source. Changing the attribute resizes the reference frame without resetting data. Small cards use one quick-add action and open details for corrections. Errors replace the face rather than increase its height.

Preserve the 16-point Home Screen insets and 44-point actions when translating the design. The browser layout is not a WidgetKit extension: native sizing, system margins, Dynamic Type, rendering modes and App Intent behavior still need validation in the host app.

## Icons, buttons and small controls

Read CONTROLS.md, then load components/controls.css, components/icons.js and components/controls.js. Use today-icon, today-button, today-switch or today-stepper directly. The asset manifest records every SVG path and source hash, and controls.html demonstrates their states. No gallery script is needed for reuse. The host handles today-activate/change events and owns navigation and persistence.
