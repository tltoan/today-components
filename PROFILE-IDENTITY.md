# One confirmed profile identity

The selected Portrait & color picker now follows Features in onboarding and is reused by Edit profile. Landing/Features content remains unchanged. Save profile confirms the choice before advancing; color/face changes and Cancel only affect a draft.

## Browser contract

Persist `{id, name, faceStyle, gradientIndex, photoURL}`. `faceStyle` is one of `loop`, `tilt`, `mellow`, `dash`, `drift`, `skeptic`, `lift`; `gradientIndex` is an explicit 0–11 choice, never rehashed. Photo overrides the face; preserve the last face/color so Use avatar can restore it. `today-face-picker.selection` accepts or returns `{kind, faceStyle, gradientIndex, file? , photoURL?}`. File/object URLs are temporary; persist a durable image through the host.

`profile-identity-demo.js` is **gallery-only**. It stores the confirmed identity under `today.library.profile.v1` on the current browser origin. Uploaded images are decoded, center-cropped to a maximum 512 px square and stored locally as a PNG data URL. Nothing is uploaded. Localhost and GitHub Pages have separate storage. Failed storage leaves confirmed identity unchanged. A storage event refreshes other open tabs.

`TodayPartyAvatars.setIdentityResolver(fn)` lets the host resolve members from confirmed identities. The demo resolves stable self IDs (`antony`, legacy `You`, or `self:true`), never display-name matching. Friends retain their own portraits. All mounted avatar/stack/lead elements refresh after a successful save.

Onboarding emits `portrait-save-request {selection, resolve, reject}`. Await persistence, then resolve with the confirmed selection; reject with a readable error. Profile emits `profile-request {action:'save-profile',value:{name,selection}}`; save before leaving the editor. The reusable elements do not import the gallery storage adapter.

## SwiftUI reuse

Copy **all four** files: `native/PlayfulFaces.swift`, `native/TodayFacePicker.swift`, `native/TodayPartyAvatars.swift`, `native/TodayProfileIdentity.swift`. The original seven-face file is unchanged.

`TodayProfileIdentity` is Codable and contains the stable ID, display name, `TodayFaceSelection` and optional photo data. Create one `TodayProfileIdentityStore` above onboarding, Profile and party views. Inject the host’s async persistence closure; restore the saved identity when constructing the store. The store publishes a new confirmed value only after persistence succeeds.

```swift
@StateObject private var identity: TodayProfileIdentityStore

// In the host initializer, load a previously persisted identity.
_identity = StateObject(wrappedValue: TodayProfileIdentityStore(
    confirmed: restoredIdentity,
    persist: { value in try await accountRepository.saveIdentity(value) }
))

// After Features. Navigation happens only on successful confirmation.
TodayProfilePortraitStep(onSaved: { route = .describe })
    .environmentObject(identity)

// Use the same confirmed source in Profile and every party roster.
TodayProfileAvatar(member: identity.confirmed.member(), size: 56)
TodayAvatarStack(members: identity.members(partyMembers), size: 36)
```

`accountRepository`, `route`, and `restoredIdentity` above are host placeholders, not provided services. The store does not create an account, write to a server or change party membership itself. Profile editing should bind to a local draft and call `identity.save(...)` on Save profile. Friends are replaced only by matching stable identity IDs.

SwiftUI source/type-checking and browser integration do not install this flow into the native Today app.
