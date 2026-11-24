# Today website deployment

Updated November 24, 2026. Status: **live and verified**. The user authorized connecting the approved website to `whatwillyoudotoday.xyz` and completed Vercel identity verification.

## Destination and deployment

- Public site: **https://whatwillyoudotoday.xyz/**.
- Vercel team: `tltoans-projects` / `team_MkrClWlD46zT38KEGMkhfcwP`.
- Project: `today-website`; dashboard: https://vercel.com/tltoans-projects/today-website.
- Production alias: `https://today-website-chi.vercel.app/`.
- Deployment hostname: `today-website-mot9owrmg-tltoans-projects.vercel.app`.
- Domain is owned/verified, with Vercel nameservers. Dashboard shows **Valid Configuration / Production**. Existing managed TLS covers the apex and wildcard. Public HTTPS was verified without disabling certificate validation.
- The apex is connected directly to Production. No www domain or canonical redirect was added; unrelated DNS records were not edited.
- Browser **Drop to Deploy** published the exact **57-file / 199,110-byte** static export. This is a manual upload, not a Git-connected project.
- MCP creation returned 403 and later could not inspect the new deployment; local CLI was unauthenticated. Browser setup succeeded after the user completed Vercel's account identity verification. Remote status is evidenced by the dashboard and real unauthenticated website responses, not by a successful MCP mutation.

## Reproducible source

Website changes are committed to `tltoan/today-components`, branch `codex/today-website`, commit `effd965`. An isolated worktree is at `/Users/antony/Documents/ChatGPT/Apps/today-website-deploy`. The original working checkout also contains the website changes plus unrelated pending native-audit docs; never publish those accidentally.

Main remains `8793692`. Automatic approval review rejected pushing directly to main as beyond the domain setup request; no main push succeeded. The isolated branch and exported site are the deployment sources. Future integration into main requires specific authorization. Vercel is not Git-connected; branch pushes alone do not update production.

Run `node scripts/build-website.mjs` from the repository. Output is `dist/website`; that directory and `.vercel` are ignored. The exporter derives HTML from approved `today-site-b.html`, removes the gallery toolbar/annotation/imports, updates website links to `/`, and copies an allowlisted dependency closure. It excludes Markdown, native code, dotfiles, unrelated examples and accounts/backend configuration. No package install is needed.

`vercel.json` supplies the build command and `dist/website` output for a future Git-connected deployment. The current Drop to Deploy deployment uses the already-built files; it does not use the repository-level build config or establish automatic Git deploys.

## Preserved boundaries

- Existing `today-logo.js`, `components/welcome-intro.*`, `today-site-opening.js`, `today-site.css`, fonts and artwork are copied unchanged. No new logo/background choreography.
- The shared website controller now supports optional gallery controls and a root URL; existing focused library preview behavior remains.
- Get app keeps the user-requested preview disclosure. No App Store destination is invented.
- Privacy/Terms remain **Draft preview** coverage text; Support remains a preview. No finalized policies/contact information are implied.
- Retain `noindex` and `robots.txt` disallow until the site content/download launch boundary is explicitly updated.
- Public interactive reading activity is an in-memory example, not native or hosted habit logging.
- Component gallery remains at `https://tltoan.github.io/today-components/`.

## Verification performed on the export

Syntax and whitespace checks pass. All five logo/Welcome/opening/CSS sources match both the original `8793692` bytes and the exported copies. Export has no docs, dotfiles or library adapters. Local preview: `http://127.0.0.1:4322/`.

Desktop and measured **390 × 844 CSS-pixel** layouts were inspected. Mobile content width remains 390; navigation sits below the centered wordmark. Get app opens by keyboard; Privacy and Support routes work; FAQ expands; Escape skips the opening and focuses the headline; the example logs 5 → 10 and shows Target met. No warnings/errors in the inspected in-app browser log. OS reduced-motion behavior was preserved in source but not freshly toggled in this pass. These checks are local; repeat the relevant smoke checks on the live domain after deployment.

## Live verification · November 24

- `https://whatwillyoudotoday.xyz/` returns HTTP 200 with valid HTTPS and Vercel HSTS.
- All **57** public files return 200 and match the local export byte-for-byte. `/?page=privacy`, `/?page=terms` and `/?page=support` also return 200.
- `/CHAT-HANDOFF.md` returns 404: the library and internal documentation are not exposed by this deployment.
- The live site shows the approved Today opening and settled composition. Get app discloses the preview message; the card logs 5 → 10 and shows Target met; Privacy and return-to-home navigation work.
- Measured live mobile viewport **390 × 844**, content width **390**. No horizontal overflow. No errors/warnings in the inspected browser log. Temporary browser viewport overrides were reset.
- Final legal text, contact details and a real App Store link remain pending. This deployment does not complete native app or backend launch readiness.

## Updating this site

1. Make changes in the library sources while preserving approved design/motion and unrelated work. Rebuild with `node scripts/build-website.mjs`.
2. Inspect `dist/website` locally and verify the affected controls/routes, desktop/390 × 844 and motion behavior. Keep credentials, native data and documentation out of the export.
3. Upload the contents as a static archive through Vercel Drop to Deploy, selecting the **existing today-website project**, not a second project. Confirm the intended team and Production target.
4. Verify the new deployment and public domain, then update this record. A failed deploy must not replace a known-good live version.
5. Git automation can be configured later using `vercel.json`; it is not currently enabled. Do not assume pushing main or the website branch automatically updates this domain.
