# Native review · November 24, 2026

Read-only review of `/Users/antony/Desktop/Projects/today`, clean `codex/component-library-migration` at **c954a51**, implementation **636176c**. The first three briefs now have native implementations and real local Supabase verification. They are not deployed hosted features. No native or hosted changes were made during this review.

## What is connected

| Milestone | Source inspected | Result |
| --- | --- | --- |
| Task retry fixes · baa921b | `Today/TaskStore.swift`, `LibraryTaskList.swift`, regression cases | Initial and retried Add share draft finalization; Retry dispatches the captured failed operation. Complete/Undo/load retries preserve unrelated Add drafts. |
| Accounts and recovery · 1522033 | `AccountService.swift`, `AccountCoordinator.swift`, `AccountHost.swift`, `LibraryAccountPanel.swift`, account migration/function | Real phone OTP, secure sessions, explicit guest association/recovery, owned data partitions, private backup, sign-out and deletion. Phone/code/resend/cancel UI lives in Profile and is reused by party access. |
| Parties and invitations · 636176c | `PartyCoordinator.swift`, `PartyService.swift`, `PartyLifecycle.swift`, `PartyHost.swift`, party flows/components, migrations/function | Existing-habit creation, consent, Book cover invitation, system sharing, safe development-link routing, target/unit choice, durable join/install recovery, one habit's Your activity / Party views, shared logs/notes and dated party lifecycle. |

The user approved the seven-point party policy set in the implementation chat. [PARTY-POLICY.md](PARTY-POLICY.md) records it here so older unresolved-policy notes do not cause another approval loop. Approval does not select a full Workshop composition or nudges.

Private backup is currently an explicit bounded snapshot: **24 MiB encoded, 16 MiB entry-photo allowance**. Later edits stay local until another backup. It is not automatic cloud sync. Account-owned files and task/widget commands have scope/generation guards; private backups are separate from shared party projections.

Party sync runs on confirmed changes and foreground reconciliation, with a 30-second foreground refresh. Invitation URLs currently use `today://party-invite`; production HTTPS/universal links are not configured. Existing local photos survive; shared uploads/carousel/reactions and the production quick-photo action are still pending.

## Evidence and limits

- Freshly inspected actual source and native Git history, the latest implementation chat's explicit policy approval, saved simulator captures and the native verification records.
- All **13 account source hashes and 23 party source hashes** matched the current library before this documentation update.
- Fresh read of the saved xcresult objects found **275 tests with no failure summaries** in `/tmp/TodayPartiesApprovedFinal.xcresult` (recorded as 273 native tests plus two UI methods), **28** in `/tmp/TodayPartyCheckpoint.xcresult` and **one** final normal-flow/leave UI test in `/tmp/TodayPartyLeaveFinalUI.xcresult`, also without failure summaries. Saved provider records report **28 authorization/capacity + 28 approved-lifecycle checks**. The final Release log contains `BUILD SUCCEEDED`.
- These are inspected saved runs, not a new simulator/test run. Earlier failed iterations and their corrected reruns remain in the native record. This is a focused implementation review, not a complete production security audit.
- Fresh read-only Supabase inspection found **no tables in public/today_private, no migrations and no Edge Functions** on hosted project `atfkyrncfszjqmnohhqn`. The earlier account audit found phone Auth disabled; this pass did not re-read Auth/SMS settings or Storage configuration. Local synthetic OTPs prove neither real SMS delivery nor production readiness.
- Exact final browser/native visual and intermediate-motion parity is still unverified in the implementation record. Also pending: fresh empty-stack migration replay, production input/abuse/load and retention work, physical-device checks and production links. Do not conceal these with the passing local test count.

Native evidence lives in `Documentation/NativeMigration/HomeTodos-Nov23/RetryFix`, `Accounts-Nov23` and `Parties-Nov24`. Their scope-specific records and architecture remain the detailed implementation sources.

## Account experience discussion before shared photos

The user asked whether phone verification should be part of onboarding and about Sign in with Apple. **No new onboarding placement or Apple implementation is approved by that question alone.** Current phone/code screens are necessary integration UI, not a selected library account flow. Current onboarding still ends with Saved → Home.

Recommendation to workshop next, preserving existing components and gradient/motion:

1. Finish the first habit plan, then offer an optional account step with a clear backup/party benefit, **Continue with Apple**, **Continue with phone**, and **Not now**. This skips only account creation, not the approved habit setup.
2. Phone branch: country code/number → verification code, AutoFill, change number, resend countdown, wrong/expired code, offline/cancel/retry. Keep one account flow reusable from Profile and invitations.
3. Returning users get a quiet sign-in route before creating a duplicate first habit. Party invite intent survives sign-in; account access is required to join/share or back up, while personal local tracking remains available.
4. Preserve explicit local-data association/restore and failure recovery. An account choice must not discard the newly created habit or silently overwrite another account's data.

This is a proposed direction, not a new published mockup or a change to the approved onboarding. [Apple's account UX guidance](https://developer.apple.com/design/human-interface-guidelines/managing-accounts) recommends letting people experience value before requiring sign-in. Phone-only first-party account login does not itself trigger the equivalent-login requirement in [App Review 4.8](https://developer.apple.com/app-store/review/guidelines/#login-services).

**Apple support requires service changes as well as UI.** `AccountService.swift` currently requires a phone; both Edge functions require `phone_confirmed_at`; account deletion requires a recent OTP/SMS authentication method. An Apple-only user would be rejected. Use the existing stable Supabase UUID across supported providers, make phone optional for Apple users, preserve explicit verified linking without merging accounts from a name/email guess, and support provider-appropriate reauthentication/deletion and Apple token revocation. [Supabase supports native Apple sign-in](https://supabase.com/docs/guides/auth/social-sign-in/auth-apple); Apple capability/provider setup and end-to-end verification are still needed. Existing phone, guest, backup, invitation and account-switch behavior must remain intact.

Recommendation: settle the account entry/verification/Apple experience before extending shared photos. All previously approved launch features remain required. This review did not start prompt four.
