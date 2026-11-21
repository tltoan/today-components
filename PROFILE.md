# Profile proposals

The selected profile combines **C Expandable groups + B Section cards’ identity panel**. It is the default (`variant="c"`) and the main library preview. Preferences starts open; other groups use the shared 600 ms disclosure. Haptics was removed from Preferences and the profile model on November 21.

Earlier A Compact groups and B Section cards remain behind “Compare previous profile layouts.” They also omit the removed setting.

The default avatar reuses the party identity primitive and its deterministic ID-based gradient. Phone number appears only inside Account details. No charts, streak or history is duplicated here. Reference frame 390 × 844; previews wrap and each screen scrolls internally.

## Reuse

Load `foundations/motion.css`, `components/controls.css`, `components/party-avatars.css`, `components/profile.css`; then `foundations/disclosure.js`, `components/icons.js`, `components/controls.js`, `components/party-avatars.js`, `components/profile.js`.

```html
<today-profile variant="c"></today-profile>
<today-settings-row action="notifications" label="Notifications" value="Allowed" icon="bell"></today-settings-row>
```

`today-settings-row` has `label`, `value`, `action`, optional `icon`, and `destructive`. `action` makes it a native button; otherwise it is a value row. Set attributes before mounting. It emits `settings-open` with `{action}`. The profile consumes that event to open the detail page.

`today-profile.model` is a copied object: `id`, `name`, `initials`, `photoURL`, `notifications` (`allowed|denied|unasked`), `quiet`, `quietStart`, `quietEnd` (HH:mm), `backup` (`unavailable|success`), `phone`, `version`. `go(page)` opens a preview screen. `complete(message)` displays host confirmation. Display names are plain text, limited to 40 characters. Photo preview accepts local JPG/PNG/WebP up to 8 MB. No upload occurs.

`profile-request` bubbles `{action, value?}`. Actions: `save-profile`, `save-notifications` (proposed full model), `permission`, `system-settings`, `backup`, `export`, `feedback`, `change-phone`, `widget-guide`, `terms`, `confirm-signout`, `confirm-delete`. The element does not call a server, change OS settings, send feedback or delete anything. Production hosts must supply authorization, persistence, success/error state, actual permission requests and platform routing.

`profile-study.js` is explicitly a local sample host. Saved identity is reflected across the three previews. It contains no real account. Do not import its mock responses into production.

## States and motion

- Notification allowed, denied, not requested; setting route is a mock action.
- Quiet hours are app-wide; per-habit reminder time stays in that habit. Edits are a draft until Save preferences. Start/end must differ when enabled; overnight periods are permitted.
- Backup is **unavailable by default**. The successful timestamp is an explicitly requested future fixture from gallery controls, never a real last backup.
- Export and feedback are request/confirmation previews; there is no real export or message.
- Account deletion has a separate confirmation; cancellation returns to the profile. The confirmation demo never destroys data.
- Page content enters over 420 ms with an 8 px settle. Groups and quiet hours use the approved 600 ms disclosure. Reduced motion removes movement. Buttons retain their existing press feedback.

## Product copy boundaries

The privacy text and deletion consequences are **proposed product copy**, based on the user's brief, not verified backend behavior or legal terms. Before implementation confirm storage location, precise data sent to AI and processor/retention details, backup/recovery scope, export format, deletion scope/timing, and treatment of historical shared-party logs/photos. The no-sale promise comes from the approved proposal. Do not infer guarantees from these mockups. Terms, app version, notification authorization and phone number are fixtures. Original app code is unchanged.
