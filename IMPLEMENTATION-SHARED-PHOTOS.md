# Native milestone · Shared photos, check-in carousel and hearts

Updated November 24, 2026. Execute after [the approved account journey and Apple milestone](IMPLEMENTATION-ACCOUNT-ACCESS.md) has been reviewed, preserving the existing membership/invitation/shared-entry implementation. Use the existing Supabase **today** project (`atfkyrncfszjqmnohhqn`), its Auth identities, Postgres shared-entry/membership contract and approved [PARTY-POLICY.md](PARTY-POLICY.md). Do not add an alternate social data store or mock members to make the UI appear connected.

The last audited native checkpoint before the account-UI milestone is clean **c954a51**, with local accounts **1522033** and normal party flows **636176c**. Recheck the actual newer checkout and account milestone evidence; do not reset to these hashes or implement those foundations again. Local Supabase verification and hosted availability remain separate. If a preceding authorization/deletion change is incomplete, identify that dependency before building media on it; carry unrelated release configuration gaps forward explicitly.

## Start from current implementation and selected sources

Continue in `/Users/antony/Desktop/Projects/today` on `codex/component-library-migration`. Read native `AGENTS.md`, `CHAT-HANDOFF.md`, `design-specs.md`, architecture/data contracts and the latest verification records. Read the local library's `AGENTS.md`, `CHAT-HANDOFF.md`, `INTEGRATION.md`, `LAUNCH-SCOPE.md`, `PARTY-POLICY.md`, `PARTY-PHOTOS.md`, `PARTY-ROOM.md`, `PARTY-AVATARS.md`, `LOG-NOTES.md`, `ACCOUNT-ACCESS.md`, `IMPLEMENTATION-ENTRY-PHOTOS.md` and this brief.

Inspect live `party-photos.html`, the consolidated Party view and actual carousel/reaction/snap/photo-action source. Reuse `components/party-photo-carousel.*`, `party-reactions.js`, `party-avatars.*`, `snap-scroller.js`, shared disclosure and existing native entry-photo pipeline. Preserve original supplied assets and motion; record hashes of the working sources, not only the older published migration pin.

Use stable authenticated user UUIDs throughout; both verified phone and Apple-only users must have the same authorized media/reaction access. Never add a phone prerequisite or expose provider contact details to the party. Preserve the selected account entry/return routes and guest-data boundaries. The approved lifecycle policies are settled; do not reopen them or infer approval of full Workshop party compositions or nudges. Keep success feedback free of decorative checkmarks/circled-tick badges.

## Enable the existing exact-entry photo workflow

Replace the DEBUG-only eligibility fixture with real authenticated party membership and a confirmed original entry owned by the viewer. Keep the selected **44 pt circular photo icon on the same row as logging**, its 8 pt gap, existing press feedback and 600 ms disclosure/reversal behavior. The icon appears only for an eligible saved party-habit entry; no automatic picker and no return to pill/full-row photo controls.

Preserve one optional photo per exact entry, normalization, metadata removal, bounded still-image validation, immutable local files, revision/operation tickets, cancel handling and atomic metadata publication. Amount, note, timestamp and unit remain the original entry's values. Notes stay in individual habit history, away from quick logging; party notes are shared by default and can coexist with photos. A media-only update cannot award activity/streak credit or create a new habit log.

Connect local attachment commit to a durable account/entry-scoped upload queue. Distinguish local photo saved, upload pending, server-confirmed available and failed/retry. Photo failure must never undo the log or discard its note. Replacement keeps the old confirmed image until the new upload/reference is accepted. Remove, entry deletion, leave/revocation, sign-out and account deletion must invalidate stale uploads and callbacks. Background upload completion may never attach a removed/replaced photo or publish into the wrong account.

## Authorized media service

Use private Supabase Storage buckets and the existing server identity/membership policies. Validate ownership, entry association, file type/size/dimensions and current authorization server-side. Do not trust filename, MIME type, a claimed party ID or client role. Do not expose public bucket URLs or privileged provider credentials. Use authenticated fetches or appropriately short-lived authorized URLs with a documented revocation/cache policy; stable media IDs survive URL expiry. Storage policies and Postgres entry/reaction policies must agree on current authorization. Keep privileged validation/cleanup in authenticated server functions; never ship the service-role key to Swift or WidgetKit. Test with ordinary user sessions and denied nonmembers. Keep schema/storage/function changes versioned and locally tested; do not deploy them as part of this local implementation brief.

Stage bytes, verify integrity, then atomically publish the authoritative media reference with the correct entry revision. Record durable cleanup for abandoned/replaced/deleted objects; shared cleanup must not delete files still referenced by private backups or another valid entry. Document the separation between local attachment, private backup object and shared-party object. Follow the approved retention/visibility rules: leave/removal ends access and further sharing immediately while previously shared posts remain for remaining members; account deletion removes that author's shared content. Resolve stale unpublished uploads consistently with those rules. Include local caches and older signed links; do not claim instant revocation of bytes already downloaded to another device.

Keep uploads/responses idempotent across retries/relaunch, including old completion after a newer removal. Device/network failure must not lose a newer photo or resurrect deleted media. Keep private trial reflections, unrelated logs and phone data out of the shared media/feed payload.

## Selected check-in carousel and reactions

Implement **B / On the photo** inside the existing individual habit's Party view. Person/time stays bottom-left; exact amount/unit stays bottom-right. No visible photo-position count, no obsolete standalone shared card and no extra photo modal. Show entry notes verbatim beneath the selected image. Entries without photos remain accessible in **Check-ins without photos**, even when the photo collection is empty.

Each slide is one original shared log. Keep stable IDs, newest-date/order sorting, exact recorded zero and original units. Do not substitute totals, targets or another member's values. Retain the current entry while neighboring data updates; if it is removed, choose a deterministic adjacent item. The Nov 24 native review left long-history pagination open: implement and verify the feed's required pagination without treating missing pages as absence or jumping the viewer backward. Expired/failed images keep the same footprint, author/time and confirmed quantity, with an honest recovery path.

Match the existing horizontal 680 ms settling choreography, interruption from the current position and no autoplay. Preserve vertical parent scrolling; do not stack competing snap/scroll animations. Offscreen slides must not capture focus or accessibility. Maintain accessible position announcements even though the visual count is removed.

Likes use the selected overlapping avatar stack with a heart on each confirmed reactor and a separate Like/Liked action. Persist one reaction per authenticated user per entry. Requests are explicit desired states with safe retry; enforce authorization/uniqueness on the server. Do not fabricate identities from a numeric count or add someone before confirmation. Preserve the 540 ms confirmed reaction feedback without replaying it on every slide/sync refresh. Reactions do not move the carousel, change the log or affect either streak.

## Shared-content release behavior

Implement the shared-content safety requirements within existing Today controls: report content, block abusive users, relevant filtering and an actual support/moderation destination. Define the effect of blocking on the small party and membership permissions consistently with the recorded policies. If that product consequence is still unsettled, prepare a concrete choice before enabling it; do not silently invent it or leave a fake Report confirmation. A submitted report must reach durable authorized service storage with an operational review path. Consult [Apple's user-generated-content requirements](https://developer.apple.com/app-store/review/guidelines/#user-generated-content) and keep documented owner/operator setup distinct from code completion. Do not publish unfinished shared-content services.

## Verification and handoff

With isolated accounts on separate installations, verify invite/join → partial/zero log with a note → attach photo → remote carousel → Like/Unlike → edit note → replace/remove photo → remove entry. Include both phone and Apple-only identities, retaining honest provider-verification labels. Check unauthorized/nonmember access, membership revocation, expired URLs, offline retries, queued stale uploads, duplicate responses, sign-out/account switch, user deletion and object cleanup. Verify logged amounts and personal streak remain correct throughout.

Test local media and private backup/export survival separately from shared object cleanup. Test report/block persistence and its agreed access consequences. No sample reading photos or fake reactors may stand in for successful server behavior.

Compare native and live library recordings at 390 × 844, including drag/reversal, feed refresh, notes/no-photo disclosures, confirmed heart feedback, upload failure and actual Reduce Motion. Test keyboard/accessibility focus, longer names/notes, larger text and photo-error geometry. Build app/extension Release and run focused media/service authorization, shared-entry and existing local photo/timer/continuation/widget regressions. Distinguish real service/two-user results from emulators or stubs; state physical-device gaps.

Update native handoff, source hashes, backend contracts and dated verification evidence; commit locally, no push/deployment. Keep remaining final recap/party composition decisions, service operations and integrated launch checks visible. Complete means authorized shared media and reactions actually work between users with the selected UI; local photo storage or a carousel preview alone is insufficient.
