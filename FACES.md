# Profile picture picker: seven faces

[Open the selected layout](faces.html). **Portrait & color (A)** is selected. Tilt is the initial face. The picker now follows Features in onboarding and is reused by Edit profile. Saving confirms one identity for Profile, Home and your party avatars. Landing and Features retain their approved compositions. See [PROFILE-IDENTITY.md](PROFILE-IDENTITY.md).

## Independent choices

- Left/right arrows cycle **Loop, Tilt, Mellow, Dash, Drift, Skeptic and Lift**, preserving the selected gradient. They sit midway in the gaps beside the portrait. Swipe across the portrait also switches faces.
- Twelve color swatches change only the gradient. The first six retain the existing avatar palette indices; six additional colors extend the picker palette.
- Gradient portraits and swatches render at 74% opacity. Uploaded photos keep their original appearance.
- Upload a photo opens a local file selection. Choosing a gradient or Use avatar restores the last face choice. Face arrows are disabled while a photo is shown.
- Earlier Avatar gallery and Swipe & choose color-layout studies remain behind Compare earlier layouts. They are historical alternatives, not the selected face carousel.

## Browser reuse

Load `components/party-avatars.js`, `components/face-palettes.js`, `components/minimal-face-motion.js`, `components/minimal-face.js`, then `components/face-picker.js`. Load `components/face-picker.css` and the host's Today font/tokens. Gallery files are not product dependencies.

```html
<today-face-picker variant="portrait" face-style="tilt" value="0"></today-face-picker>
<today-minimal-face face="loop" palette="2" passive still cropped
                    style="width:40px"></today-minimal-face>
```

The picker accepts `variant="portrait|grid|carousel"`, `face-style="loop|tilt|mellow|dash|drift|skeptic|lift"` (default Tilt), clamped `value="0...11"` and `display-name`. `value`/`faceStyle` properties mirror those attributes. Setting attributes/properties is silent. Its `selection` getter/setter restores a draft silently and returns either:

```js
{ kind: 'avatar', faceStyle: 'loop', gradientIndex: 3 }
{ kind: 'photo', faceStyle: 'loop', gradientIndex: 3, file: File }
// A restored confirmed photo uses photoURL instead of file.
```

A bubbling `change` event includes the selection and `source` (`tap`, `keyboard`, `button`, `scroll`, `face-button`, `face-swipe`, `photo`, or `remove-photo`). Swatches provide radio semantics, roving focus and arrow/Home/End keys. Portrait arrows and photo controls have 44 px targets. The host owns confirmation, persistence and upload.

Photos are decoded before replacing the preview, limited to 10 MB, and kept as a local File/object URL. Invalid files leave the current selection intact. Object URLs are revoked on replacement/disconnect; they are not durable profile URLs. Nothing is uploaded by this component.

The standalone face accepts `face="loop|tilt|mellow|dash|drift|skeptic|lift"`, optional `palette="0...11"`, `still`, `paused`, `passive`, `cropped` and `features-only`. No palette preserves the original light disk and dark features. `passive` removes the internal button; `still` freezes the time-zero pose; `cropped` fits the disk to avatar bounds. `features-only` omits the disk for layering over a fixed background. `wink()` (retained API name) triggers the selected face’s 3.8-second expression; `face-tap` is presentation feedback, not a profile save. `TodayFaceMotion.styles` exposes the seven lowercase keys.

## SwiftUI source

Copy these three files into the host target:

- `native/PlayfulFaces.swift`: supplied seven-face original, preserved byte for byte.
- `native/TodayPartyAvatars.swift`: shared identity avatars and the existing six fallback palettes.
- `native/TodayFacePicker.swift`: twelve palettes, `TodayFaceSelection`, `TodayFacePortrait`, and `TodayFacePicker` including PhotosPicker.

```swift
@State private var picture = TodayFaceSelection(faceStyle: "tilt", gradientIndex: 0)
@State private var photoData: Data?

TodayFacePicker(selection: $picture, photoData: $photoData,
                layout: .portrait, displayName: "Antony")

// A still identity avatar. If photoData is nonnil, the host displays that photo instead.
TodayFacePortrait(selection: picture, animated: false)
    .frame(width: 40, height: 40)
```

The host confirms and persists the explicit lowercase `faceStyle` (`loop`, `tilt`, `mellow`, `dash`, `drift`, `skeptic`, or `lift`) and `gradientIndex` (`0...11`), or the selected photo data. Do not rehash a user-chosen color. SwiftUI arrows update only `faceStyle`; swatches update only `gradientIndex`. Photo selection uses PhotosPicker and local decoding, not an account upload. The host owns storage, navigation and applying the result elsewhere.

## Motion

Only the facial features slide 36 px with a soft crossfade over 480 ms using cubic-bezier(.22,.8,.24,1). The gradient circle stays mounted and stationary. Both arrows cycle all seven faces; direction controls the feature slide. There is no face/color caption below the portrait. Color changes blend all three stops in place over 560 ms with the same easing, retargeting from the currently painted colors during rapid taps. They never move the disk or trigger a wink. Browser registered color properties and native animatable RGB stops preserve this behavior. The gallery confirmation is labeled “Save profile”; the host still owns actual persistence. The supplied ten-second idle cycle and each face’s distinct 3.8-second expression are preserved, including the 55 ms eye lead, 45 ms head delay and 105 ms nose delay. A tap cannot restart an expression before it finishes. Small identity examples stay still. Browser animation suspends offscreen and in background tabs. Reduced motion freezes the face and switches immediately. Native selection feedback does not imply browser iPhone haptics.

For confirmed identity integration, also copy `native/TodayProfileIdentity.swift`. It provides an injected persistence store, an onboarding portrait step, and the same member model for Profile and parties. Native app installation remains separate.

The earlier two-face `native/MinimalFace.swift` is retained unchanged as a historical source; it is not a dependency of the current picker.

Native source availability and type-checking are separate from app integration. All gallery confirmations are local previews.
