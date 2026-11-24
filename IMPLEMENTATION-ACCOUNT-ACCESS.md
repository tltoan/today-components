# Native milestone · Approved account journey and Sign in with Apple

Prepared November 24, 2026. Implement this milestone before shared photos. Continue in `/Users/antony/Desktop/Projects/today` on `codex/component-library-migration`. Recheck the actual checkout and preserve newer work; do not reset to the audited hash.

The last reviewed checkpoint is clean **c954a51**, with phone accounts/private backup in **1522033** and parties/invitations/shared logs in **636176c**. Those foundations work against local Supabase. Extend them; do not rebuild them or treat them as deployed. The user has now approved the account journey in the component library, except for the decorative success checkmark, which has been removed.

## Read and inspect first

Read native `AGENTS.md`, `CHAT-HANDOFF.md`, `design-specs.md`, account/data architecture, party contracts and the latest verification records. Inspect `Today/AccountService.swift`, `AccountCoordinator.swift`, `Library/LibraryAccountPanel.swift`, `Library/LibraryCreationFlow.swift`, root routing in `TodayApp.swift`, and both `supabase/functions/account-service/index.ts` and `party-service/index.ts` before editing.

Read these files in `/Users/antony/Documents/ChatGPT/Apps/today-component-study`: `AGENTS.md`, `CHAT-HANDOFF.md`, `INTEGRATION.md`, `ACCOUNT-ACCESS.md`, `NATIVE-REVIEW-NOV24.md`, `PARTY-POLICY.md`, `LAUNCH-SCOPE.md` and this brief. Inspect the live `account-access.html` preview and `components/account-access.js/css`, its dependencies in `components.json`, existing native controls and onboarding gradient. Record current local source hashes. The library is the UI and motion authority; an older published pin or legacy native account panel does not supersede this selected flow.

The selected source is **Screens & flows → Account → Your account · Apple & phone**. Preserve its composition, artwork, spacing, typography, field surfaces, gray primary buttons and text-only confirmation. Do not add decorative checkmarks or circled-tick success badges. Functional checkboxes remain unchanged. `account-access-study.js/css`, sample code 123456, sample cooldowns, outcome selectors, simulated Apple sheet and end-of-preview dialogs are review fixtures, not product code.

## One reusable journey, four real entry points

Use one shared native account presentation backed by the existing coordinator/services, with explicit initiating context and return destination:

| Entry | Required behavior |
| --- | --- |
| First habit saved | After the first habit is durably saved and its confirmation acknowledged, offer the optional account choice before Home. Not now preserves that exact habit and continues to Home. |
| Returning user | Offer Sign in on Welcome before unnecessary first-habit creation; cancellation returns there, successful completion proceeds to Home. Preserve the approved opening/logo motion. |
| Profile | Reuse the journey from the selected Account destination and return to Profile. Existing authenticated account management remains available. |
| Invitation | Keep the pending invitation through auth, cancellation, backgrounding and relaunch. Return to the same Book cover invitation for current validation, personal target/unit and explicit Join. Signing in never joins a party by itself. |

Preserve the existing atomic creation/finalization boundary. Do not save another habit when returning from authentication or leave a saved draft eligible for duplicate creation. Keep a recoverable route/acknowledgment state across relaunch, without storing OTPs or transient provider credentials in drafts. Additional-habit creation must not repeatedly present this first-habit account offer. Already authenticated users do not need to sign in again merely to continue onboarding.

Personal habits remain usable without an account. Back, Not now, provider cancellation, network failure and a rejected invitation must preserve local plans, entries, notes, photos, tasks and settings. Pending callbacks must be bound to the initiating operation, current account and route so stale success cannot navigate or mutate a different session. Revalidate invitations after authentication rather than trusting cached capacity or expiry.

## Reuse phone authentication; add native Apple authentication

Keep real phone OTP on the existing service path. Match the selected country-code/number screen and single six-digit verification field: proper telephone formatting and supported-region normalization, numeric keyboard, `.oneTimeCode` AutoFill, explicit Verify & continue, resend and change number. No six separate focus boxes or automatic submit on digit six. Choosing phone opens the keyboard; simply opening account choice does not. Preserve the number on Back/change and input on recoverable validation errors; clear the old code when requesting a new one. Use service rate limits and resend policy, not prototype timers. Handle invalid/expired code, offline, throttled, retry and cancellation without duplicate requests.

Use the real system `SignInWithAppleButton` / AuthenticationServices with the selected white capsule styling and prominence. Generate a cryptographically random nonce per attempt, send its hash to Apple and provide the corresponding raw nonce to the supported Supabase ID-token exchange. Bind state/nonce and callbacks to the request, reject missing/invalid credentials, and treat cancellation as a return to choice. Do not log tokens, OTPs or full phone numbers. Preserve existing Keychain/session handling and avoid competing auth listeners. Verify the actual APIs in the pinned Swift SDK before use; do not copy JavaScript examples or upgrade unrelated dependencies. See [Supabase's native Apple guidance](https://supabase.com/docs/guides/auth/social-sign-in/auth-apple) and [Swift ID-token sign-in](https://supabase.com/docs/reference/swift/auth-signinwithidtoken).

Apple users must be able to use accounts, backup and parties **without supplying a phone number**. Model identity around the stable Supabase user UUID with optional verified phone and trusted provider information. Preserve the person's selected Today name/photo/color; use Apple-provided name only when actually present and appropriate for an unset profile. Never depend on Apple returning it on every login.

Audit identity linkage and account switching explicitly. Do not merge application records using a matching name, phone guess, email or private-relay address. Keep same-user linking distinct from signing into a different user; attaching another sign-in method requires deliberate user action and proof of that identity. Inspect Supabase's configured automatic-link behavior and supported manual-link APIs before implementing a link path. Handle an identity already owned by another account without moving that account's private data or memberships. Do not invent an additional account-management design or force a second provider merely to finish this approved journey. See [Supabase identity linking](https://supabase.com/docs/guides/auth/auth-identity-linking).

## Update authorization and deletion, not just the button

At c954a51, Swift `AccountIdentity.phone` is required, account-service rejects missing verified phone, party-service checks `phone_confirmed_at`, and deletion freshness accepts phone OTP/SMS only. Locate every such assumption and update it consistently, including Profile labels, backup ownership, party requests and account-scoped widget/outbox guards.

Authorize genuine verified phone **or Apple** identities using server-validated Auth evidence, preserving live-session checks, deleted-user rejection, stable ownership, current party membership and RLS. Do not simply remove phone checks and accept any token, anonymous identity or client-supplied provider flag. User-editable metadata must not grant privileges. Ordinary user sessions must pass permitted operations; wrong-owner, expired, revoked and unauthenticated sessions must fail. Apple authorization must not expose the user's phone/email through party payloads.

Retain the current recent-verification protection for destructive account deletion, with provider-appropriate fresh proof bound to the same account and operation. A refreshed old session is not proof of a new Apple authorization. Preserve idempotent deletion, party succession/content cleanup and retry recovery. Integrate Apple credential revocation securely on the server; keep keys and revocation credentials out of the app, widgets, logs and backups. Handle credential revocation notifications and session invalidation. If a revocation token is unavailable, account deletion must still have a supported recovery path; do not permanently trap the user behind another phone requirement. Follow [Apple TN3194](https://developer.apple.com/documentation/technotes/tn3194-handling-account-deletions-and-revoking-tokens-for-sign-in-with-apple). Document failures and retry/cleanup semantics truthfully.

## Preserve explicit local-data and backup choices

After either provider, present the selected data choice using actual account/backup state: connect existing local habits, review a saved backup if one exists, or decide later. Authentication alone does not upload a snapshot, merge data, overwrite local habits or consent to party sharing. Deferring association leaves authentication intact. Keep backup an explicit snapshot, not automatic sync.

Restore review must show real snapshot date/counts and require confirmation. Match the selected replacement wording while preserving native transactional restore, previous-local-version safety copies and validation. Never delete those safeguards to imitate a fixture. Failed association/restore stays recoverable on the same screen and must not claim completion. The final text reflects the provider and actual data outcome, then returns to its initiating context. Reuse current sign-out/account-switch protections for local data, queued shared operations and WidgetKit commands.

## Match motion and native accessibility

Reuse Test The Future and supplied artwork, existing shared native buttons/disclosures and one persistent onboarding gradient. Match the source's 640 ms wash transition with 65 ms delay and `cubic-bezier(.24,.74,.26,1)`, plus the 600 ms content entrance from 10 px on `cubic-bezier(.37,0,.18,1)`. The wash changes position for data/completion and reverses on Back without remounting or flashing. Dropdowns retain shared 600 ms disclosure; button feedback remains 130 ms. Retarget interrupted changes and settle immediately under Reduce Motion, including a preference change during motion.

Use native field/keyboard semantics, clear focus and status announcements, real safe areas and keyboard avoidance. Verify 390 × 844 and larger text. Compare recordings/frame progression of forward, Back, cancel and success against the live source; endpoint screenshots alone are insufficient. Use the system Apple sheet in native, never the prototype's simulation panel.

## Configuration and verification boundaries

Keep the existing Supabase **today** project, reference **atfkyrncfszjqmnohhqn**, region **us-east-2**. Do not create another backend. The Nov 24 read-only hosted audit found no app tables/migrations/functions; local Supabase evidence does not prove hosted availability. Prepare versioned local schema/functions/config and native capability/project changes. Do not deploy, change hosted providers, send real-user messages, publish or push in this milestone.

Identify the exact Apple Developer entitlement/bundle identifier, provider configuration, server revocation configuration and SMS settings needed. Read current official guidance and the repository's pinned tool versions. Complete authorized implementation and local verification first; list concrete missing operator steps without exposing or requesting secrets in chat. Missing live credentials must produce an honest unavailable/error path, never simulated success. Distinguish local contracts, stubbed provider tests and real Apple/SMS/device evidence.

Run meaningful regressions covering:

- First-habit saved → account/skip/cancel/failure/relaunch → Home, with one original habit; returning/Profile/invitation destinations and explicit Join preserved.
- Phone success/error/resend/change-number and Apple success/cancel/error; Apple-only identity accesses its backup and permitted party operations without a phone.
- Wrong owner, revoked/deleted session, anonymous/forged provider metadata, invalid nonce/token and stale callback rejection; account switching cannot claim another account's data or pending work.
- Explicit association, deferral, restore failure/success with retained safety copy, sign-out and provider-appropriate deletion/reauthentication/cleanup.
- Existing creation, private backup, party lifecycle/shared-entry outbox and account-scoped widget behavior. Check fresh local migrations and ordinary-session authorization, not only privileged test setup.

Run focused native/service/UI tests and app/widget Release checks appropriate to changed code. Capture selected UI/motion parity and Reduce Motion, recording genuine physical-device/AutoFill/provider gaps. Never call Apple end-to-end verified from a stub. All explicitly approved features remain in the launch plan; this milestone neither implements shared photos nor approves remaining Workshop compositions.

Update native handoff, design/source mappings, architecture/backend contracts and dated verification evidence. Make a local milestone commit without pushing. Finish with implemented behavior, exact checks and unresolved setup/parity gaps. Stop before shared photos so this dependency can be reviewed against [IMPLEMENTATION-SHARED-PHOTOS.md](IMPLEMENTATION-SHARED-PHOTOS.md).
