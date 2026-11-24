# Native milestone · Real parties, invitations and shared entry data

Prepared November 23, 2026. Execute after the retry corrections and real account/backup foundation in `IMPLEMENTATION-ACCOUNTS-BACKUP.md` are verified. Inspect the latest native handoff and architecture record first. Do not recreate authentication or proceed with hardcoded member identities.

**November 24 status:** this brief is implemented locally in native 636176c / checkpoint c954a51. The user approved [PARTY-POLICY.md](PARTY-POLICY.md); the earlier decision-gathering section below is historical and must not trigger another request for the same approvals. Preserve the actual implementation and use [NATIVE-REVIEW-NOV24.md](NATIVE-REVIEW-NOV24.md) for remaining hosted/parity/launch work.

## Sources and approval boundaries

Work in `/Users/antony/Desktop/Projects/today` on its current `codex/component-library-migration` branch. Read native `AGENTS.md`, `CHAT-HANDOFF.md`, `design-specs.md` and account/data contracts. Read the current local library's `AGENTS.md`, `CHAT-HANDOFF.md`, `INTEGRATION.md`, `LAUNCH-SCOPE.md`, `HABIT-PARTIES.md`, `PARTY-ROOM.md`, `PARTY-AVATARS.md`, `PARTY-PHOTOS.md` and this brief. Latest selections override historical paragraphs describing a separate party dialog or obsolete shared check-in card.

Inspect the live library/source for `components/habit-party.*`, `party-avatars.*`, `party-room.*`, `party-progress.js`, `party-setup.js`, the selected Book cover invitation and consolidated individual habit. Preserve supplied SwiftUI avatars, face identity, artwork, typography, selected rim overlap and motion. Demo people, sample dates, successful joins and schedule windows are fixtures, not backend facts.

Confirmed constraints:

- At most four members including the creator; one shared schedule, personal targets/units and reminders.
- Joining clearly authorizes automatic sharing of new logs and their entry notes for this habit. Photos are optional. No per-log private switch and no automatic historical backfill.
- Other habits, phone numbers, private trial reflection and the overall Home streak remain private.
- Individual habit has one logging area and **Your activity / Party** views using the existing slider. Avatar taps select Party. Do not restore the redundant party entry row/dialog or a second habit page.
- Invitations open the selected Book cover component in place from Habits/deep links, show actual shared days/proposed dates and member targets, allow personal target choice and explicit Join.
- Party streak uses closed scheduled party-local dates and dated eligible membership; partial or explicit zero counts, days off preserve it, today's incomplete date remains open. Keep the proportional SVG-style ring and true logged/eligible count. Do not derive it from personal target attainment.

## Resolve the genuinely open party rules

`PARTY-ROOM.md` explicitly leaves membership changes, pauses, late joins, schedule authority, party timezone and retrospective corrections unresolved; the creation-at-plan-review and personal-trial lifecycle are proposals. `HABIT-PARTIES.md` also leaves invite authority/expiry, member removal and post-leave visibility open. Before hardcoding those policies or inserting the Workshop setup into approved onboarding, prepare one concrete recommendation for each, with its consequence and a compact flow preview using existing components. Reuse any decision already made in the session or architecture record; otherwise request the missing product choices as one focused decision set. Do not present the recommendation as an approved design.

Continue independent work meanwhile: port selected invitation/avatar/detail primitives, implement authenticated service boundaries and test explicit policy inputs. Do not silently declare policy-dependent joining/lifecycle complete or enable it in normal use before those rules are settled. Once settled, record the authoritative table and implement it. No new social feed, rankings or unrelated onboarding redesign.

## Membership, invitations and personal plan association

Use the existing Supabase **today** project (`atfkyrncfszjqmnohhqn`) and the preceding milestone's Auth user UUIDs, client/session handling and versioned migrations. Store party identity, dated schedule/timezone policy, membership intervals/roles and a member's association with their personal habit/plan separately in Postgres. Only authenticated authorized operations can create, invite, join, leave, edit schedule or remove members. Enforce capacity with a server transaction/RPC that serializes competing joins; a client avatar count is not enforcement. Concurrent acceptance of the last seat must admit at most one new member. Repeated acceptance by the same user is idempotent.

Use membership-aware RLS and least-privilege grants for shared tables. Do not trust client-supplied roles or editable user metadata; member access must follow the actual dated membership rules. Audit callable functions and views for policy bypass, and verify with distinct user sessions and a nonmember. Supabase Realtime may refresh authorized data, but a subscription filter is not authorization and a live stream does not replace durable reconciliation or complete history queries. Keep migrations/functions reviewable and test locally before any separately authorized hosted deployment; do not create a second Supabase project or backend.

Use unpredictable, scoped, revocable invitation capabilities and server-validated lifecycle. Bind acceptance to the authenticated user and agreed invitation semantics. Invalid, expired, revoked, already-joined and full states must be real. An invitation URL is not permission to read arbitrary personal data. Preserve the pending invitation across authentication safely; cold/warm opening must not discard another creation/editing/photo flow. Use real HTTPS universal links only with an owned/configured domain and association files; never assume ownership of today.com or claim a local URL is a production link.

Create an invitation record before opening the system share sheet. Distinguish link created, share-sheet completion and recipient acceptance; do not claim actual delivery just because the sheet opened. Do not send SMS/email or upload contacts automatically. Use synthetic accounts and development links for verification.

Join must record membership and the chosen personal habit/target exactly once, with retry/relaunch reconciliation between server acceptance and local plan installation. Failed local persistence must not leave the UI claiming a usable joined habit or create duplicates on retry. Preserve the invitee's other habits and history. Do not convert existing units or retroactively expose their old entries. Schedule changes and membership boundaries need dated records, not overwriting the past. Personal target/reminder edits must not change another person's plan.

## Shared logs and notes, independent of media

Connect every applicable logging route to a durable shared-entry projection/outbox: quick log, check-off/explicit zero, timers, history correction and removal. Preserve original entry ID, author, amount/unit/time, note and membership context. Only new eligible post-join entries are automatically shared, with server validation of association and authorization. Decide how eligible backdated entries map to dated membership in the policy table; delayed offline events must not bypass revocation.

Keep local confirmed logging responsive and truthful while remote work is pending. Distinguish Logged, sharing pending/failed and server-confirmed shared state. Retries must not add duplicate entries; an older outbox operation must not resurrect a removed entry or overwrite a later correction. Use monotonic revisions/tombstones and owner-scoped idempotent operations with explicit conflict handling. A remote projection refresh must not re-log another user's entry into personal history or award duplicate global-streak credit.

Render no-photo shared entries with their notes using the selected disclosure component, stable identity and actual member names. Photo upload/reactions are implemented in the following milestone; do not fake their success or show fixture media. Photos must not be a prerequisite for sharing a valid entry.

Use a complete, dated server/query contract for party participation and streaks. Missing coverage must not be treated as a day off or a complete all-time history. Apply the approved correction/late-join/pause policy and timezone/DST boundaries consistently. Personal global streak history must remain untouched.

## Verification and completion

Test separate authenticated accounts and a nonmember: create → share/open invitation → accept with a different personal target/unit → log → see the original shared amount/note on the other account → correct/remove. Test the last-seat race, duplicate accept, expiry/revocation, logout during join, interrupted local installation, offline outbox/relaunch, stale edits, deleted entries, schedule changes, member leave/removal and unauthorized reads/writes. Check membership authorization on every query and mutation, not merely initial navigation.

Compare selected invitation, avatar/detail placement, segmented transition, disclosures and ring geometry with the live library at reference size; test source timing, interruption, Reduce Motion, focus and larger text. Keep full-party composition departures explicit. Verify public/private data separation and absence of phone/private-reflection/overall-streak leakage. Maintain account deletion/sign-out cleanup and member lifecycle consequences from the chosen account policy.

Add provider integration/authorization tests and real two-user native evidence, with transport/emulator/device limits stated. Record exact commits, migrations, policy decisions and source hashes in native handoff/architecture/verification files; commit locally, no push/deployment. Do not mark the social launch feature complete until the subsequent shared-media/reactions and required safety work are connected. Nudges remain unselected proposals unless the user separately chooses them.
