# Slide to log

[Focused preview](slide-to-log.html) · [JavaScript](components/slide-to-log.js) · [CSS](components/slide-to-log.css)

Slide to log is now an independent browser custom element. The original library card also uses this exact component and connects its local state to the checklist.

```html
<link rel="stylesheet" href="components/slide-to-log.css">
<script src="components/slide-to-log.js" defer></script>
<today-slide-log label="evening stretch"></today-slide-log>
```

- `label`: accessible name for the habit; default `habit`.
- `logged`: boolean attribute / `.logged` property.
- `disabled`: boolean attribute; disables drag, keyboard and tap actions.
- User changes emit bubbling `change` with `{logged: true|false}`. Programmatic assignments do not emit.
- `.cancelDrag()` returns a partial gesture to its current confirmed local face.

Drag to the full end and release to log. A partial drag returns. Pointer cancellation, lost capture, leaving the vertical tolerance, Escape, blur, backgrounding and resizing cancel the gesture. A native button provides Enter/Space activation and a separate 44 px tap alternative. After logging, Undo remains available and keyboard focus moves to it if the handle held focus.

Motion retains a 340 ms return/reveal and 170 ms label transition; reduced motion settles immediately. The host owns real persistence and failures: listen for change, save, and restore `.logged` on failure. This demo stores nothing beyond the page. It is not a WidgetKit gesture implementation or a new SwiftUI port.
