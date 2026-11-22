# Log notes

Implemented in the **browser component library**, with local gallery hosts. No native app, account storage or production sharing has been added. Keep this work local; do not publish.

## Selected behavior

- Notes live inside individual habit history. Quick-log buttons stay one tap. Add a note opens the existing 600 ms disclosure and focuses the textarea only after that explicit action. Opening a log or an existing entry does not open a text keyboard.
- Save changes on an existing entry emits one request with the amount, original unit and optional note. The host must persist them together and confirm once. Pending saves latch against duplicates; failure retains both draft fields. Closing before saving leaves the confirmed entry unchanged.
- Notes belong to individual entries, never a day total. A missing amount cannot be saved by adding a note. An explicit numeric zero or None today is a valid saved outcome.
- Empty/whitespace-only notes are omitted. Otherwise wording, whitespace and line breaks are preserved; note text is escaped, never interpreted as markup.
- History adds one muted preview line only when a note exists. Entry details edit amount and full note together, keeping the ID, date, original unit and photo. Removing a note does not remove the log.
- For party habits, entry notes are shared with the party by default and may coexist with photos. This supersedes the old rule that all notes were private. Other habits and the separate end-of-trial reflection remain private. Shared does not mean published to the internet.
- Recap uses host-selected entries with notes, verbatim. The component does not invent activity, summarize the person's words or select entries using AI.

## Reuse

Load `foundations/disclosure.js`, `components/icons.js`, `components/controls.js`, then `components/log-editor.js`; load controls/log-editor CSS and shared motion CSS. The script supplies:

```js
editor.model = {
  name: 'Read before bed', unit: 'pages', amount: 5, note: '',
  party: true,
  // entryID, dateLabel, photoURL and photoAlt when editing an existing entry
};
editor.addEventListener('log-save', async ({detail}) => {
  // {entryID: null | string, amount: number, unit: string, note: string}
  // Save both fields in one transaction; on failure preserve the draft.
  editor.resolve(''); // or editor.resolve('Couldn’t save. Try again.')
});
dialog.open(editorModel); // today-log-dialog wraps the same editor
dialog.resolve(); // closes only after success; resolve(error) leaves it open
memories.entries = selectedOriginalEntries; // today-log-memories
```

`TodayUI.LogNotes` exposes `hasNote`, `validEntry` and `quantity`. Hosts still validate permissions, date eligibility, unit-specific limits and persistence. The browser editor uses finite nonnegative quantities; check-off accepts 0 or 1. It does not enforce production schema limits.

Integrated browser hosts: habit detail (`save-entry` / `resolveDialog`), selected party carousel and recap. Home and detail retain quick `logrequest` saves, including timer completion; notes are added from history afterward. Existing confirmed target feedback is preserved.

`log-notes.html` exercises reading, water, check-off and reducing-coffee examples, failure, repeated entries, editing, removal, notes alongside pictures and recap excerpts. Its state is in memory and resets on reload. `log-notes-study.js` is not a production persistence adapter.

## Photo action selection

The user selected the **circular photo icon beside the logging button**. The earlier pill and full-width row proposals were removed. `components/log-photo-action.*` implements it; `photo-actions.html` shows it at the referenced Home card width inside a 390 px frame.

`today-habit-card` accepts `photoEntry: {id, photoURL?}` for a party habit. The action appears only with a confirmed entry ID, including partial and zero logs, using shared disclosure timing. The action remains on the same row as + / Log. It emits `log-photo-request {entryID, file}` and latches pending; resolve with `action.resolve(entryID, error?)`. The host attaches the photo to that ID, independently of the saved amount/note. Cancelling file selection keeps the saved log unchanged. Gallery files use local blob URLs; there is no upload service.

## UI retention

Once a direction is selected, remove its superseded live UI and unused variants unless the user explicitly requests retention. The older standalone shared check-in card, carousel comparisons and continuation split/pill alternatives have been removed. Full-width continuation cards (A) are selected in both recap narratives.


## Latest placement decision

Latest correction supersedes the initial capture flow: keep notes out of quick-log buttons. Home and detail retain one-tap logging; Add a note in habit history selects an existing entry. Entry details edit its amount and note atomically. Timer logging stays quick. The standalone notes preview demonstrates this entry-details editor with existing entries; it is not a new logging route.
