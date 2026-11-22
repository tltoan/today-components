# Start implementing Today

Use this instruction in the existing native-app Codex session. The user authorized publishing this library snapshot and beginning implementation; Workshop designs retain their individual approval status.

> Start implementing Today in the existing iPhone app using our current context and the latest published component-library snapshot from https://github.com/tltoan/today-components. Record the exact library commit you use.
>
> Read the app's AGENTS.md and design-specs.md, then the library's CHAT-HANDOFF.md, AGENTS.md, INTEGRATION.md, components.json and relevant component guides. Reconcile the PRD with our latest explicit decisions; those decisions supersede older conflicting references. Inspect the existing SwiftUI implementation and browser previews before changing screens.
>
> Reuse existing native components and supplied SwiftUI sources where available. Port the remaining approved browser components faithfully into SwiftUI, preserving artwork, typography, spacing, state behavior and motion. Keep original supplied source files intact. The library is the design/component reference; its gallery infrastructure and fictional demo data do not belong in the app.
>
> Work in a codex/ implementation branch and preserve unrelated changes. Begin with a connected, persistent vertical slice: create a habit using the approved setup flow → save → Home → quick log → individual habit → history and entry editing. Reuse the app's existing models, generation services and persistence where appropriate. Verify saved state after relaunch. Continue with subsequent approved slices rather than stopping at a plan or isolated mock screens.
>
> Preserve the latest decisions: quick logging stays one tap; notes belong to existing entries and are added/edited in individual habit history; the circular photo action sits beside logging after a confirmed party log. Individual habit has Your activity / Party views under one logging area, and avatar taps select Party. Habits invitations open the selected Book cover invite in place. Reuse the selected photo carousel, avatar-heart reactions and proportional party progress ring. Partial activity, explicit zero and no log remain distinct; save failures preserve confirmed data.
>
> Components and selected Screens & flows are the implementation references. Workshop compositions are not automatically approved. Build approved parts, preserve existing approved app behavior where a replacement is still unresolved, and flag only material missing decisions. Do not invent new visual directions or promote prototypes to production capabilities.
>
> Keep the core-loop implementation separate from later production services: real account/auth, recovery, deletion, notifications, background timer reconciliation, photo uploads, party synchronization and widgets must be implemented and verified explicitly. Never substitute a simulated success for a working service.
>
> Validate each completed slice in the iOS simulator at the reference size, including navigation/return state, keyboard, reduced motion, empty/error states and persistence. Run the relevant tests, update the app's design/implementation records and handoff, and report what works, what was tested and what remains. Begin the audit and implementation now; do not stop after proposing a plan.
