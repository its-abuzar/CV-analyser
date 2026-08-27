# Authoring a screen

This is the brief for anyone adding a page module to Calibre. Read it once, read
the nearest archetype in `src/pages/`, then write your screen. If a rule here
disagrees with something you remember about how frontends are usually built,
the rule here wins — the tooling enforces it and will fail your work otherwise.

## What this app is

Calibre reads a candidate (CV, LinkedIn, GitHub, portfolio) against a role (a
posting or job description) and reports what it finds. Fifty-one features across
eight modules. The user is a working professional applying for a specific job;
they are literate, in a hurry, and reasonably sceptical of a number that arrives
without a reason.

## The one rule about scope

**Every screen is design-complete and logic-free.** No analysis happens in the
frontend. Numbers, verdicts, rankings, rewrites and scores all arrive from the
backend (FastAPI, written separately) through the service layer. Your job is the
whole interface around them: layout, copy, states, interactions, keyboard,
mobile.

"Design-complete" means the person reading this project should find nothing left
to build. Specifically, that rules out:

- a "coming soon" panel, a `TODO`, or a placeholder heading
- a screen whose only content is its title and a table
- an empty state that says "No data" and stops
- an error path that logs to the console
- a feature described in the registry but not actually present on the screen

## The page contract

One file per feature: `src/pages/<feature.id>.js`, where `feature.id` is the `id`
in `src/registry.js`. The router lazy-loads it by that path. Nothing else needs
registering.

```js
/**
 * One paragraph on what this screen is for and the single design decision that
 * shaped it. Not a description of the code — the reason behind it.
 */

import { PageHead, Card, Route /* … */ } from '../ui/primitives.js';
import { Tile, Tiles, Note } from '../ui/bits.js';
import { Region, fill } from '../ui/loader.js';
import { api } from '../services/api.js';

/** Data fetched before first paint, keyed however you like. */
export const prefetch = { d: 'github.repos' };

/** Every other design this screen has, as query objects. */
export const variants = [{ view: 'table' }, { empty: '1' }];

/** Pure. String in, string out. No document, no window, no fetch. */
export function render(ctx) {
  return Route(`${PageHead({ title: '…', lede: '…' })} …`);
}

/** Optional. Runs after the HTML is in the document. */
export function mount(root, ctx) {}

/** Optional. Handles this screen's data-action clicks. */
export function onAction(action, el, event) {}

/** Optional. Cancel streams and clear module state. */
export function unmount() {}
```

### `render(ctx)`

Pure function, returns an HTML string. `ctx` is:

| key | what it is |
| --- | --- |
| `ctx.data` | the resolved `prefetch` map |
| `ctx.query` | parsed query string, all values strings |
| `ctx.path` | the current path |
| `ctx.feature` | this feature's registry entry (`name`, `job`, `icon`, `keywords`) |
| `ctx.store` | `get()` / `set()` for the active candidate and role |

Must return exactly one `Route(...)` wrapper containing exactly one `<h1>`,
which `PageHead` provides. `Route(body, true)` gives the full window width —
only for a board or a wide table.

`render` may not touch `document`, `window` or `localStorage`. That is what lets
`tools/prerender.mjs` produce your screen's exact HTML in plain Node, which is
the only review this code gets.

### `prefetch`

A map of key to endpoint. Resolved before `render`, so the first paint is
populated — no spinner on arrival.

```js
export const prefetch = {
  list: 'stories.list',                                   // no options
  cov:  ['stories.coverage', { query: { window: '90d' } }], // fixed options
  one:  ['stories.get', (ctx) => (ctx.query.id ? { params: { storyId: ctx.query.id } } : false)],
};
```

An options function returning `false` or `null` means "not needed on this
route" — the request is skipped and the key resolves to `null`. That is how a
master/detail screen avoids asking for a detail nobody selected.

### `variants`

The query states worth auditing separately. Each is a different design of the
same screen, and each gets the full check set from `prerender`.

```js
export const variants = [{ type: 'gaps' }, { run: '1' }, { empty: '1' }];
```

Declare every design a reviewer would otherwise never see: a filter applied, a
run in progress, a selection made, a live session, no data at all. A variant
that renders byte-identical to the default is not a variant — if the difference
only appears in `mount()` (a drawer, for instance), say so in a comment instead.

### `mount(root, ctx)`

Where the DOM is allowed. Three jobs, in this order of frequency:

1. **Cache the data your handlers need.** `render` is pure, so `onAction` cannot
   see `ctx`. Store it in a module-level `let` and clear it in `unmount()`.
2. **Fill deferred regions** with `fill()`.
3. **Wire anything a delegated click cannot do**: focus, keydown, drag, observers.

```js
let items = [];

export function mount(root, ctx) {
  items = (ctx.data.list && ctx.data.list.items) || [];
  fill('cov', () => api('stories.coverage'), covView, {
    errorTitle: 'Could not read your story coverage',
  });
}

export function unmount() {
  items = [];
}
```

Never put page state on `window`. Module-level `let`, cleared in `unmount()`.

### `onAction(action, el, event)`

One delegated click listener lives in `main.js`. Any element carrying
`data-action="x"` (which every primitive emits when you pass `action:`) routes
here with `action = 'x'` and `el` as the element. `data-arg` is on
`el.dataset.arg`.

These actions are handled globally — do not reimplement them: `open-palette`,
`close-palette`, `palette-go`, `palette-run`, `toggle-rail`, `toggle-density`,
`open-drawer`, `close-drawer`, `open-notifications`, `close-overlay`,
`overlay-close`, `switch-candidate`, `switch-role`, `set-candidate`, `set-role`,
`run-analysis`, `go`, `retry-region`, `reload-route`, `print`, `reload`, `copy`,
`noop`, `segment`, `tab`, `retry`.

Prefer `href="#/path"` over an action for plain navigation. Use `navigate()`
from `../router.js` when a handler needs to move after doing something. To read
the query inside a handler, re-parse `window.location.hash` — do not close over
`ctx`.

## The four states every screen designs

A screen is not finished until all four exist and have been rendered.

**1. Populated.** The normal case, from `prefetch`. Real fixture data, not three
rows of Lorem.

**2. Deferred.** Anything slow, secondary, or fetched after a click goes in a
`Region` with a `Skeleton` shaped like what is coming, filled by `fill()`. `fill`
gives you busy, loaded, empty and failed-with-a-working-retry for free — never
hand-roll those.

```js
// render
body: Region('stats', Skeleton({ lines: 5 }))

// mount
fill('stats', () => api('tracker.stats'), statsView, {
  errorTitle: 'Could not read your pipeline statistics',
});
```

**3. Genuinely empty.** No CV loaded, no applications logged, no stories written.
This is a first-run screen and usually the most important thing you will write,
because it is what a new user sees. `EmptyState` plus a reason to act, plus — if
the feature is not self-evident — two or three cards explaining what the screen
will be for once it has data. An empty state under about ninety words is thin;
`prerender` will say so.

**4. Error.** Per-region, via `fill`'s `errorTitle`. Say what failed in the
user's terms ("Could not read your repositories"), not the system's ("Request
failed"). The retry must actually work; `fill` wires it.

A missing record is not one of your states. `api()` throws a 404 with a
`userMessage` and the router owns that screen.

## What you may use

Two modules, and nothing else, provide your vocabulary:

- **`../ui/primitives.js`** — the design system. Buttons, cards, tables, fields,
  gauges, meters, findings, empty states.
- **`../ui/bits.js`** — page composites built from primitives, one per CSS block
  in `styles/pages.css`. Job cards, chat turns, score chips, rings, heatmaps,
  rewrite blocks, sheets.

Plus `../ui/loader.js`, `../ui/overlays.js`, `../ui/icons.js`,
`../services/api.js`, `../registry.js`, `../router.js`, `../store.js`.

**Before hand-rolling any markup, check whether a composite already exists.** If
you find yourself writing a wrapper div with three spans inside it, the thing you
want is probably in `bits.js`. Search it. Adding forty-four bespoke variations on
a card is how a design system dies.

**You may not add CSS, colours, or sizes.** Not in a `style=` attribute, not in a
new file. Everything is in `styles/` already and lint will fail you. If you truly
need a new layout class, that is a change to the design system — say so in your
report rather than inventing one locally. A class with no rule behind it does
nothing, silently, and looks like a decision.

### Layout classes

Composition happens with these, not with new CSS:

```
stack stack-2 stack-3 stack-4 stack-5 stack-6 stack-8   vertical rhythm
row row--between row--wrap row--top spacer              horizontal
grid grid--2 grid--3 grid--4                            equal columns
grid--auto grid--auto-sm grid--auto-lg                  responsive columns
split split--tight split--wide-aside split--aside-first body + aside
sticky-aside scroll-x                                   behaviour
prose lede label label--brass section-title card-title   text
muted mono numeral tnum text-2 display                  text
sr-only hide-sm only-sm                                 visibility
dot dot--pass dot--caution dot--fault dot--brass         inline markers
```

`split` is 1fr + 340px and collapses at 1100px. `grid--3` and `grid--4` collapse
on small screens. Anything wider than the viewport needs `scroll-x` or it will
break mobile.

### Component signatures

Generated from source by `node tools/signatures.mjs`. Re-run it if anything below
looks stale; run `node tools/signatures.mjs Segmented` to see one component's
source. **Passing an option name that does not exist fails silently** — it is
ignored, and you get an empty div that looks like a layout bug. This list is
the defence against that, so check against it rather than guessing.

Positional arguments are shown positionally; `{ … }` is a single options object.

<!-- BEGIN SIGNATURES (generated — node tools/signatures.mjs --md) -->

**primitives**

- `esc(value)`
- `cls(...parts)`
- `attrs(map = {})`
- `map(items, fn)`
- `plural(n, singular, pluralForm)`
- `band(value)`
- `Button({ action, arg, ariaLabel, block, class, disabled, href, icon, iconAfter, label, pressed, size, title, type, variant })`
- `ButtonGroup(buttons = [])`
- `Segmented({ action, current, items, label })`
- `PageHead({ actions, breadcrumb, extra, lede, title })`
- `SectionHead({ actions, desc, eyebrow, plain, title })`
- `Card({ accent, actions, body, class, desc, eyebrow, flushBody, foot, id, key, tightBody, title })`
- `Panel({ body, class, id, tight })`
- `Well(body, quiet = false)`
- `Chip({ action, arg, count, icon, label, pressed, title, tone })`
- `ChipSet(chips = [])`
- `Verdict(label, tone = 'neutral', withDot = true)`
- `Provenance(source, locator)`
- `Gauge({ animate, class, compact, height, label, onInk, showValue, target, value, width })`
- `Reading({ max, size, suffix, value })`
- `Spectrograph({ height, items, label })`
- `SpectrographLegend()`
- `Meter({ name, note, onInk, target, tone, value, valueLabel })`
- `Readout({ delta, label, note, onInk, unit, value })`
- `Bars({ items, max })`
- `Sparkline({ height, points, showLast, width })`
- `Finding({ action, arg, aside, chips, detail, expanded, rank, severity, severityLabel, sources, title })`
- `Findings(items = [])`
- `Evidence({ cite, text, tone })`
- `Mark(text, kind = 'keyword', title)`
- `Callout({ actions, body, icon, title, tone })`
- `Field({ control, error, hint, id, label, optional })`
- `Input({ action, autocomplete, class, describedBy, disabled, error, hint, id, inputmode, max, min, name, placeholder, readonly, step, type, value })`
- `Textarea({ action, class, code, describedBy, disabled, hint, id, name, placeholder, rows, value })`
- `Select({ action, class, describedBy, disabled, hint, id, name, options, value })`
- `InputGroup({ button, input, prefix })`
- `Check({ action, arg, card, checked, disabled, hint, id, label, name, type, value })`
- `Switch({ action, arg, checked, disabled, hint, id, label, name })`
- `Range({ action, id, label, max, min, name, step, value })`
- `Dropzone({ action, extra, hint, icon, title })`
- `FilterBar(controls = [])`
- `Table({ caption, columns, fixed, rowAction, rows })`
- `Tabs({ action, current, items, label })`
- `ListRow({ action, arg, href, lead, selected, sub, title, trail })`
- `ListRows(rows = [])`
- `KV({ inline, rows })`
- `EmptyState({ actions, body, compact, icon, title })`
- `Skeleton({ block, height, lines })`
- `LoadingCard(label = 'Loading')`
- `ErrorState({ action, body, title })`
- `Track(value, max = 100, label = 'Progress')`
- `Stepper(steps = [])`
- `Timeline(items = [])`
- `Diff({ after, afterLabel, before, beforeLabel, foot })`
- `Board(columns = [])`
- `BoardCard({ action, arg, chips, sub, title, trail })`
- `FeatureCard(feature, moduleName)`
- `Divider(label)`
- `Avatar({ brass, initials, name, size })`
- `CountPill(n)`
- `Kbd(keys)`
- `Tip(content, text)`
- `clamp(v, lo, hi)`
- `Route(body, wide = false)`

**bits**

- `when(iso, { time, year })`
- `ago(iso)`
- `until(iso)`
- `pct(n, digits = 0)`
- `num(n)`
- `money(n, currency = '€')`
- `trim(text, chars = 120)`
- `initials(name)`
- `Pane({ actions, body, class, flush, id, tall, title })`
- `ActionBar({ actions, left, note })`
- `Acc({ body, id, label, meta, open })`
- `Note(body, quiet = false)`
- `Stat({ label, value })`
- `StatRow(stats = [])`
- `Sheet({ class, contact, id, name, sections })`
- `SheetRole({ lines, title, when })`
- `SheetLine({ action, arg, body, selected })`
- `EditorSplit(left, right)`
- `RailGroup({ body, label, sub })`
- `Tile({ action, arg, class, href, icon, label, sub, tone, unit, value, viz })`
- `Tiles(tiles = [])`
- `ScoreChip(value, { max, title, tone })`
- `Ring({ label, size, stroke, text, tone, value })`
- `Heat({ caption, columns, corner, rows })`
- `VsCol({ body, flag, lead, sub, title })`
- `Vs(cols = [])`
- `ReqRow({ action, arg, expanded, html, meta, state, text, weight })`
- `RangeViz({ format, high, label, low, max, min, value, valueLabel })`
- `Kw({ action, arg, label, n, pressed, state, title })`
- `KwCloud(items = [])`
- `Cov({ cells, label })`
- `HeroRead({ dial, extra, eyebrow, meta, scale, text, value, verdict })`
- `TypeCard({ action, arg, current, desc, href, icon, name, score, weight })`
- `TypeStrip(cards = [])`
- `Rewrite({ accepted, actions, after, before, beforeLabel, delta, head, id, tag, where, why })`
- `ChatTurn({ aside, body, id, name, side, trail, typing, when })`
- `Chat(turns = [])`
- `Composer({ controls, field })`
- `JobCard({ actions, chips, company, fit, href, id, meta, saved, title, why })`
- `PathCard({ foot, hops, href, name, sub, trail })`
- `Paths(cards = [])`
- `Connect({ actions, icon, name, state, stateHtml })`
- `VerdictLine(label, tone, text)`
- `PickSomething({ body, icon, title })`
- `ResultCount(shown, total, noun = 'result')`
- `ExportActions({ arg, share, size })`

**loader**

- `Region(id, initial = '')`
- `fill(id, loader, view, { empty, errorTitle, isEmpty })`
- `setRegion(id, html)`
- `retryRegion(id)`
- `clearRegions()`

**overlays**

- `toast(message, { duration, tone, undo })`
- `openModal({ body, foot, onMount, size, title })`
- `openDrawer({ body, eyebrow, foot, onMount, title })`
- `closeOverlays()`
- `hasOverlay()`
- `confirmAction({ body, confirmLabel, title, tone })`
- `copyText(text, label = 'Copied')`

**api**

- `api(name, { body, params, query, signal, timeout })`
- `apiStream(name, { onDone, onError, onMessage, params, query, text })`
- `apiAll(calls)`
- `apiDownload(name, { filename, params, query })`

<!-- END SIGNATURES -->

A few worth calling out because the natural guess is wrong:

- `Gauge` is in **primitives**, not bits.
- `Segmented`/`Tabs` take `items: [{ value, label, icon }]` and `current` — not
  `options`, not `selected`.
- `Table` takes `columns: [{ key, label, num, strong, width }]` and `rows` keyed
  by those column keys, values already HTML. Give it a `caption`.
- `Field` has no `inline` option. `ListRow` has no `meta` — use `sub` and `trail`.
- `Well(body, quiet)`, `Track(value, max, label)`, `VerdictLine(label, tone, text)`
  and `Verdict(label, tone)` are positional.
- `ScoreChip(value, { max, title, tone })` — value first, then options.
- `fill(id, loader, view, opts)` and `setRegion(id, html)` take a region id, not
  the page root.

Tones are always `pass` / `caution` / `fault` / `brass` / `info` / `neutral`.
`band(value)` maps a 0–100 number onto the first three. Never pass a colour.

## Copy

The interface talks like a knowledgeable colleague who respects your time. It
states things, including uncomfortable ones. It does not sell, apologise, or
congratulate.

- **Say what a number means, not just what it is.** "Below the bar for this
  level" beats "62/100".
- **Take a position where the data supports one.** "A 74 with one missing skill
  usually beats an 84 with three hundred applicants" is worth more than "Consider
  your options."
- **Sentence case everywhere.** Buttons are verbs: "Log an application", not
  "Submit". The verb survives into the confirmation: "Publish" → "Published".
- **Empty states point at the next action.** Errors say what happened and what to
  do. Neither is apologetic; neither is chirpy.
- **No em-dash pileups, no exclamation marks, no emoji.** No "Oops!", no
  "Let's get started!", no "Awesome".
- **Numbers in `mono` or `tnum`** so columns of them line up.

Write the prose for a real person mid-job-hunt who is slightly anxious and
short of time. Say the true thing plainly.

## Endpoints

152 named routes in `src/services/endpoints.js`, all mocked. Call them by name:

```js
api('stories.list')
api('stories.save', { params: { storyId: id }, body: { text } })
apiStream('bullets.rewriteStream', { params: { bulletId }, onMessage, onDone, onError })
apiDownload('reports.download', { params: { reportId }, filename: 'report.pdf' })
```

`node tools/shape.mjs stories.list` prints the mock payload shape — keys, counts,
sample values. Do this before writing markup against a payload; guessing the
shape is how `undefined` reaches the screen. `node tools/shape.mjs --all` lists
every endpoint name. If your screen needs an endpoint that does not exist, add it
to `endpoints.js` **and** give it a mock in `mocks.js` with fixtures in
`src/data/fixtures.js`, in the same register as the ones already there: specific,
plausible, internally consistent, never `foo`/`bar`.

Mocks honour their path parameters and throw a real 404 for an unknown id, the
same as FastAPI will. Do not defeat that.

## Verify before you report

Both of these must be clean. They are not advisory; they are the review.

```
node tools/prerender.mjs <feature-id>     your screen and every variant
node tools/lint.mjs                        all pages, ten rules
```

`prerender` renders each variant and checks: the module imports; `render`
returns a `Route` with one `<h1>`; tags balance; no `undefined`, `NaN`,
`[object Object]` or stray `null` leaked in; every `data-action` has a handler;
every internal `href` hits a real route; no collection container rendered empty;
tables have captions; meaningful SVGs have names; and the screen has real content
rather than a title and a stub.

`lint` checks: no raw colours; no raw pixel sizes; imports confined to the
allowed modules; no `fetch` outside `services/client.js`; no unused imports; a
pure `render()`; every icon name real; every class styled; every endpoint name
real; every region both declared and filled.

`node tools/prerender.mjs <id> --write` writes the HTML to `out/<id>.html` if you
want to read it in full.

A warning (`△ thin: 61 words`) is not a pass. Expand the screen.

## The archetypes

Read the one closest to what you are building before you start. Each is a
complete worked example, and copying its structure is expected.

| archetype | file | what to take from it |
| --- | --- | --- |
| Dashboard | `overview.js` | tiles, a deferred trend region, routing onward |
| Deep reading | `analysis.js` | ten sub-designs behind one screen, run states |
| Input / upload | `intake.js` | dropzones, paste, parse progress, connect states |
| Master–detail editor | `bullets.js` | `EditorSplit`, selection by query, streaming |
| Board | `tracker.js` | `Board`, drag and drop, a table view, a real empty state |
| Faceted list | `discover.js` | filters in the query, in-place mutation with undo |
| Conversation | `mock.js` | `Chat`, per-turn scoring, a live session, a composer |

## Registry paths

Every `href` must point at one of these or `prerender` fails.

```
/                            overview          /interview/questions          questions
/intake                      intake            /interview/mock               mock
/profile                     profile           /interview/coach              coach
/versions                    versions          /interview/technical          technical
/sources/github              github            /interview/behavioural        behavioural
/sources/linkedin            linkedin          /interview/weak-spots         weak-spots
/sources/job-description     job-description   /interview/reverse-questions  reverse-questions
/sources/portfolio           portfolio         /interview/research           research
/analysis                    analysis          /interview/stories            stories
/analysis/compare            compare           /apply/discover               discover
/analysis/evidence           evidence          /apply/alerts                 alerts
/analysis/benchmark          benchmark         /apply/ideal-role             ideal-role
/analysis/matrix             matrix            /apply/tracker                tracker
/improve/bullets             bullets           /apply/outreach               outreach
/improve/tailor              tailor            /apply/cover-letter           cover-letter
/improve/templates           templates         /apply/watchlist              watchlist
/improve/summary             summary           /apply/salary                 salary
/improve/keywords            keywords          /grow/roadmap                 roadmap
/improve/achievements        achievements      /grow/certifications          certifications
/improve/claims              claims            /grow/career-paths            career-paths
/search                      search            /grow/market                  market
/reports                     reports           /grow/projects                projects
/privacy                     privacy           /grow/progress                progress
/integrations                integrations      /review                       review
/recruiter                   recruiter         /activity                     activity
/settings                    settings
```

## Cross-linking

Screens are not islands. A finding on one screen almost always has a fix on
another: a skill gap points at `/grow/roadmap`, a weak bullet at
`/improve/bullets`, an unmet requirement at `/improve/tailor`, an interview
tomorrow at `/interview/research`. Two or three of these per screen, placed
where the reader would want them, is what makes fifty-one features feel like one
product rather than a menu. Put them in a `Card` foot, a `Note`, or a chip row —
not in a wall of buttons at the bottom.

## Checklist

- [ ] `src/pages/<id>.js` exists, exports `render`, and imports only allowed modules
- [ ] `prefetch` populates the first paint; `variants` names every other design
- [ ] populated, deferred, empty and error states all render
- [ ] no invented CSS, colours, sizes, or hand-rolled versions of existing composites
- [ ] copy is specific, positional where the data allows, sentence case, no filler
- [ ] two or three links to the screens that act on what this one reports
- [ ] `node tools/prerender.mjs <id>` clean, including variants — no `△`
- [ ] `node tools/lint.mjs` clean
