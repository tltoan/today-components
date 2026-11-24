# Your account · Selected

Updated November 24, 2026. [Open the journey](account-access.html) or find **Your account · Apple & phone** in [Screens & flows](screens.html#account-access).

The user approved the account journey with “everything else looks good” and explicitly rejected the decorative success checkmark. Confirmation now uses the existing heading and supporting text on their own. This is approval of the design and motion, not native integration or a Supabase deployment. Existing onboarding/Profile routes remain unchanged until native implementation.

## Where it belongs

| Entry | Selected placement | Skip / next destination |
| --- | --- | --- |
| First habit saved | After the saved-habit confirmation, before Home | **Not now** goes to Home with the local habit intact. |
| Returning to Today | A sign-in entry on Welcome, before creating another first habit | Back to Welcome; successful sign-in continues to Home. |
| Profile | Account group, using the same journey | Return to Profile. |
| Party invitation | Preserve the pending invitation while signing in | Return to the Book cover invitation; joining still requires its own sharing consent. |

These entries are selectable contexts in this focused study. They do not insert new steps into `onboarding.html`, change the selected Profile screen, or wire native routes. The prototype ends in a clearly labeled review dialog naming the next destination.

## Screens and behavior

1. **Account choices:** existing PrivacyLock / OpenBook artwork, Today typography, a short benefit explanation, Continue with Apple, Continue with phone, and a contextual escape action. Privacy and Terms link to the existing draft website pages. Creating an account remains optional for personal tracking.
2. **Phone number:** labeled country calling-code dropdown and national number field. Choosing phone focuses the field; merely opening the account choice does not open a keyboard. Today’s existing gray primary control sends a code. The field uses telephone input / autocomplete semantics.
3. **Verification:** one accessible six-digit field with `autocomplete="one-time-code"` and numeric keyboard, masked number, explicit Verify & continue, change-number action and resend countdown. No six separate focus stops and no automatic submission on the last digit. Enter submits. An error preserves input and returns focus to the field. A new code request clears the code. Country/number remain available when going back.
4. **Your habits:** after either auth method, explicitly connect local habits to the account, review a saved backup if present, or decide later. Authentication alone does not upload a snapshot, merge device data, join a party or overwrite a habit. Copy reflects the current manual-backup capability.
5. **Restore backup:** shows snapshot date/counts and explicitly states replacement rather than merge. Separate confirmation; a failure remains on the same screen.
6. **Signed in:** identifies Apple versus verified phone, states the chosen data outcome, and returns to the initiating context. Apple never adds a phone requirement in this selected journey.

The signed-in account and guest data association are separate states. Deferring association does not sign the person out. Existing native account linking, migration and restore safeguards must be retained during any future implementation; this study does not supersede them.

## Shared UI and motion

Do not add decorative checkmarks or circled-tick badges above success/confirmation copy. Use the wording and layout to convey completion. This preference does not remove functional checkboxes or to-do completion controls.

- Reuses `today-button`, `today-dropdown` and its shared 600 ms disclosure, `today-artwork`, Test The Future, and existing field/surface styling.
- One persistent `today-onboarding-gradient` remains mounted throughout the journey. The existing 640 ms / 65 ms wash handoff shifts toward the bottom for data choice and completion, then reverses on Back.
- Screen content enters over 600 ms on the existing gentle rise curve. Rapid changes cancel the previous animation. OS Reduce Motion and the study override settle immediately; changing the preference cancels an in-flight entrance. Button presses retain the shared 130 ms response.
- Apple is a white capsule with its monochrome mark, using the platform font. It is at least as prominent as phone sign-in. The browser mark relies on the macOS system Apple glyph; native must use `SignInWithAppleButton` / `ASAuthorizationAppleIDButton`, not copy the text glyph. See [Apple’s button guidance](https://developer.apple.com/design/human-interface-guidelines/sign-in-with-apple).
- One specimen with entry/screen controls avoids repeating every state in the library. The Apple outcome panel and end-of-preview panels are review tools outside the app composition, not proposed native screens.

## Browser API

`components/account-access.js` defines `today-account-access`. Load the component dependencies in `components.json` in the listed order. The presentation owns no authentication client, persistence, timers or routing.

- `configure(patch, focus = false)` updates state. Context: `saved | returning | profile | invitation`. Step: `choice | phone | code | data | restore | success`.
- Model fields: `phone`, `dial`, `code`, `error`, `busy`, `seconds`, `method` (`phone | apple`), `backup`, `linked`, `restored`.
- `setCountdown(seconds)` updates the resend label without rerendering input or moving focus.
- `account-request` emits the current model and action: `apple`, `phone`, `send`, `verify`, `resend`, `change`, `back`, `skip`, `associate`, `review-restore`, `restore`, `data`, `defer`, `finish`.
- `account-input` emits `{field, value}` for phone/code edits. The current calling code is included with each request.
- Host error strings are escaped. Inputs are labeled and associated with an announced status. Six-digit completion enables verification; the prototype’s basic phone validation is not a production numbering library.

## Fixture boundaries

`account-access-study.js/css` are gallery-only. They keep sample state in memory, delay outcomes 800 ms, accept example code **123456**, and expose successful / incorrect / expired / offline / rate-limited / existing-backup scenarios. Resend uses a 60-second sample cooldown with an external review shortcut. The calling-code menu contains US/CA, UK and AU examples only. Production must use service timing and complete supported-region validation.

Apple opens a labeled Workshop simulation panel with success, failure and cancellation. It never loads Apple authentication, sends SMS, contacts Supabase, stores phone input, writes local storage or changes real device data. Reset and context/screen/response changes cancel pending fixture work. Reload resets the journey.

## Native work still required

The next native brief is [IMPLEMENTATION-ACCOUNT-ACCESS.md](IMPLEMENTATION-ACCOUNT-ACCESS.md), followed by shared photos after review. [NEXT-NATIVE-PROMPTS.md](NEXT-NATIVE-PROMPTS.md) records that order and the completed account/party foundations.

The Nov 24 audit at native `c954a51` found real phone authentication in Profile / party entry, local Supabase backup and party services, but no Apple integration or selected account-onboarding composition. `AccountIdentity.phone` and server account/party guards currently require verified phone. When implementing this selected flow, support a stable authenticated user ID with optional phone, native Apple token/nonce validation, explicit account linking, appropriate reauthentication and Apple credential revocation on deletion. Preserve guest data and pending invitations across cancellation/failure/relaunch. Hosted provider setup, Apple entitlement/provider configuration, SMS delivery, physical-device AutoFill and production verification remain separate. See [NATIVE-REVIEW-NOV24.md](NATIVE-REVIEW-NOV24.md).

## Verification

Browser checks on November 24 covered phone entry via Enter, invalid code then successful verification, explicit local association, Apple cancel/success without a phone step, returning-user backup review/confirmation, offline send/retry, expired code/resend, change number preserving the value, and optional skipping. A measured 390 × 844 CSS viewport has no horizontal page or phone-content overflow; the choice screen fits its 844 px frame. Less motion gives a 0-second gradient transition and settled content. Desktop composition, shared dropdown keyboard operation and Workshop embedding are checked separately from native UI. Syntax/dependency/link checks are recorded in the handoff. No native build, real account, SMS, or backend mutation is part of these checks.
