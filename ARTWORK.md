# Today artwork

[Gallery](artwork.html) · [Registry and component](components/artwork.js) · [Asset manifest](assets/artwork/manifest.json)

Twenty original assets from the Today app bundle, covering Figma sections [321:646](https://www.figma.com/design/Xf03CH47k7G0graqTZ4zis/today.?node-id=321-646) and [321:564](https://www.figma.com/design/Xf03CH47k7G0graqTZ4zis/today.?node-id=321-564). Nineteen exported artwork assets match the original files byte for byte. Water Droplet is included from the app bundle; its current Figma specimen contains a label only. The manifest records that distinction, source paths, dimensions and SHA-256 hashes.

Original geometry, colors, gradients and file bytes are preserved. The component scales the native canvas uniformly; it does not rewrite SVGs or substitute emoji.

```html
<link rel="stylesheet" href="components/artwork.css">
<script src="components/artwork.js" defer></script>
<today-artwork name="open-book"></today-artwork>
<today-artwork name="privacy-lock" label="Lock and key" style="width:160px"></today-artwork>
```

Omit `label` for decorative artwork next to text. Supply a meaningful label when the image conveys information by itself. `name` is a key from `TodayArtwork.entries`: open-book, privacy-lock, first-habit-steps, stretch-mat, floss-case, workout, walking, make-bed, water-plants, vitamins, meditation, water-droplet, feature-plan, feature-schedule, feature-log, feature-history, feature-custom, feature-fitness, feature-tracking, feature-review.

The registry contains intrinsic dimensions. The component defaults to that width, with `max-width:100%`; set a smaller width at the placement. ResizeObserver maintains proportional scaling. No animation or click action is implied by the artwork itself. Every gallery card links to the downloadable original.

Fishing was removed from the active library at the user’s request on November 21. Its unchanged original remains under `assets/artwork/reference/Fishing.png`; it is not a reusable catalog entry.
