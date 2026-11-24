# To-dos on Home and widgets

November 22, 2026: the user selected **A separate space** for Home (the Habits / To-dos slider), plus **both the medium short-list widget and the small next-task widget**. These selected designs have browser fixtures. Native Home To-dos and both WidgetKit families are now connected in `fd67a06` (checkpoint `46b8027`); two retry defects found in review remain to fix using [IMPLEMENTATION-TASK-RETRY-FIX.md](IMPLEMENTATION-TASK-RETRY-FIX.md). See `CHAT-HANDOFF.md` for evidence and platform/parity gaps.

Latest November 23 instruction: **implement all widgets already approved**, superseding the infrastructure-only choice. Both selected task widgets and their Home To-dos/data dependencies became the next native milestone and are now connected, with retry corrections pending. This advances the previously deferred task work; recovery, continuation and local entry photos are already connected. Use [the current implementation prompt](IMPLEMENTATION-HOME-TODOS.md).

These selected features and all other approved launch capabilities remain **required before the first release**. Habit/Lock Screen widget proposals and the removed large task widget have not been selected. See [LAUNCH-SCOPE.md](LAUNCH-SCOPE.md).

[Open the selected Home and widgets](home-tasks.html). Home is in [Screens & flows](screens.html#home-tasks); both widgets are in [Components](index.html#task-widget-medium).

| Selected surface | Behavior | Size |
| --- | --- | --- |
| Home · A separate space | Existing segmented slider switches Habits / To-dos within one Home screen. | 390 × 844 reference |
| Medium · The short list | First two task rows with a remaining count. | 338 × 158 |
| Small · One thing at a glance | One task, completion/Undo, then Next. | 158 × 158 |

The earlier stacked-checklist Home, focus-task Home and large task widget were removed from the live showcase. The user did not request retaining those alternatives. The base `home.html` remains a source specimen, while this composition is the selected Home direction.

One shared local task model drives Home and both widgets on the focused page. State controls cover a few tasks, empty, all done and long titles. Widgets show the sample **today (November 17)**; Home can browse the supplied November 15–21 week. Future tasks beyond that week remain accessible in Later.

## Reuse

- `today-home-overview` stays mounted, retaining its header, profile, week bar, habit cards, Warm Ember badge and Center cradle. `home-tasks-study.js` composes the task section around its existing habit list. Its CSS overrides are scoped to this study. The original Home source is unchanged.
- `today-task-list` reuses the existing checklist’s `.activity-row`, `.activity-mark`, check geometry and confirmed check transition from `style.css`.
- Add, Later and Completed expansions use `TodayUI.Disclosure` and `foundations/motion.css` (600 ms, existing opacity choreography). Date selection is a native date field styled with Today’s existing input treatment. Buttons and segmented choices reuse `components/controls.*`.
- `today-task-widget` uses `TodayWidgets.sizes.standard`, the existing graphite widget surface, 16 pt insets, and actions at least 44 pt high. Text wraps within fixed family dimensions. A long widget title truncates visually to two lines while retaining its full accessible label.
- Profile identity uses the same gallery adapter as Home; artwork, avatar motion and bottom navigation are unchanged. The cradle + remains independent.

## Browser behavior

Add opens an optional inline composer; the keyboard focuses the title only after Add. Title is required; a day is optional. Enter submits a title, Escape/Cancel closes the composer, and Cancel retains the draft until Reset or a successful add. Future tasks appear under Later. Unfinished earlier tasks carry forward quietly.

A completion updates Home and both widgets immediately in this in-memory demo. The most recently completed task stays in place with a checked circle and Undo, so it does not vanish under the pointer or keyboard. The small widget also offers Next. Older completed tasks collapse into Completed; they can be restored there. Reset clears the shared disposable state.

Tasks are separate from habits. They do not create habit log entries, change logged counts, contribute to the global streak, or enter a habit trial recap. Existing habit quick actions still work with local fixtures. No notes/photos are attached to tasks in this prototype.

## View contract and boundaries

Load shared Home dependencies, `style.css`, `foundations/disclosure.js`, `foundations/motion.css`, controls and `components/widget-primitives.js`, then `components/task-list.js` / `.css`.

```js
view.model = {
  date: '2026-11-17',
  recentId: null,
  tasks: [{id:'parcel', title:'Pick up the parcel', createdDate:'2026-11-16',
    date:'2026-11-16', done:false, completedDate:null}]
};
```

`today-task-list` emits `task-toggle {id}` and `task-add {title,date}`. `today-task-widget family="small|medium"` emits `task-toggle {id}`, `task-next {}` and `task-open {}`. In a widget-only gallery card, Open launches the focused Home preview; on the focused page it selects To-dos in the existing Home. The host supplies updated models; `finishAdd()` clears the confirmed draft, `resetDraft()` resets disclosures, and `openComposer()` opens/focuses capture.

`home-tasks-study.*` is a **demo host**, not a production task service. It uses disposable arrays, sample dates and local habit saves. Reload discards task changes. There is no App Group store, AppIntent, WidgetKit extension, real notification, sync, account storage, recurring task, priority, editing/deletion workflow, task history audit, or shipping native implementation. Widget presses demonstrate intended interactions only. Before native implementation, establish persistence, error/rollback, accessibility/Dynamic Type and native widget contracts while matching these selected designs.

## Verification

See the latest README and CHAT-HANDOFF entries for checks actually completed. Visual selection does not establish native integration.
