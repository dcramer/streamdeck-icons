# Icons QA Sources

## Source Inventory

| Source | Trust | Contribution | Constraints |
|---|---|---|---|
| `AGENTS.md` | Repository authority, high confidence | Commands and icon conventions | Keep runtime rules aligned |
| `README.md` | Repository authority, high confidence | Setup, preview URL, output layout | May lag implementation; cross-check scripts |
| `config/icons.json` | Runtime source, high confidence | Icon names, palette, layers, sizes, offsets | Read on every QA run |
| `preview/index.html` | Runtime source, high confidence | 5 x 3 structure, alt text, responsive layout | Current preview is intentionally static |
| `scripts/build.mjs`, `scripts/check.mjs`, `scripts/serve.mjs` | Runtime source, high confidence | Build, stale-asset validation, server behavior | Use commands rather than duplicating implementation |
| `agent-browser` 0.32.3 `core` guidance | Upstream primary source, high confidence | Local CLI, snapshot, screenshot, session, wait, cleanup workflow | Loaded from the pinned CLI to avoid stale copied reference material |
| `agent-browser` 0.32.3 `dogfood` guidance and issue taxonomy | Upstream primary source, high confidence | Repro-first visual, console, responsive, accessibility checks | Adapted to a static local preview; video and broad app exploration omitted |
| `skill-writer` workflow and validator | Authoring authority, high confidence | Inline layout, specification, provenance, triggers, validation | Maintenance-only; not required at skill runtime |

## Synthesis Decisions

| Decision | Status | Rationale |
|---|---|---|
| Classify as `workflow-process` | Adopted | The skill runs an ordered build, server, browser, inspection, and reporting procedure with cleanup and failure handling |
| Use `inline-guidance` | Adopted | One short path covers every invocation; optional reference loading would add indirection |
| Add a validation-loop mechanic | Adopted | Build/check failures and suspected visual issues must be fixed or retried before a pass is claimed |
| Use repo-local `pnpm exec agent-browser` | Adopted | Pins behavior for contributors and avoids dependence on a global install |
| Combine config inspection with browser observation | Adopted | Repository conventions provide the expected state for visual judgments |
| Create runtime references, scripts, or templates | Rejected | No branch, fragile transformation, or reusable artifact justifies them yet |
| Copy the generic dogfood report and video workflow | Rejected | The preview is static; concise findings and screenshots are proportionate evidence |
| Test physical hardware | Deferred | Requires a connected Stream Deck and human/device observation |

## Source Adaptation

- Source intent: make browser QA systematic, reproducible, and evidence-backed.
- Local target: validate a static 5 x 3 icon preview and its generated assets.
- Fidelity boundary: retain browser setup, waits, snapshots, screenshots, console checks, responsive review, retry-before-reporting, and cleanup.
- Local replacements: use `pnpm exec`, repo build/check gates, and icon-specific visual expectations from `AGENTS.md` and `config/icons.json`.
- Omitted material: authentication, forms, navigation exploration, destructive-flow checks, and repro videos because the preview does not expose those behaviors.
- Rights/attribution: no upstream prose or templates are bundled verbatim; commands and concepts are adapted into project-specific instructions.

## Coverage

| Dimension | Status |
|---|---|
| Preconditions and ordered workflow | Covered |
| Failure handling and safe cleanup | Covered |
| Asset freshness and dimensions | Covered by `pnpm check` |
| Browser loading, console, accessibility, and responsiveness | Covered |
| Project-specific palette, layout, state pairs, and legibility | Covered |
| Repro evidence and output contract | Covered |
| Version variance | Covered by pinned CLI and runtime-loaded guidance |
| Physical-device appearance | Gap; requires hardware |

Further retrieval is currently low-yield: repository sources and the matching installed CLI cover all browser-preview decisions, while the only material gap requires physical hardware rather than more documentation.

## Trigger Checks

Should trigger:

- "QA the new mute icons in the deck preview."
- "Use the browser to review all Stream Deck icon states."
- "Check whether the output-device pair is aligned and responsive."
- "Validate the generated icons after my config change."

Should not trigger:

- "Create a new camera icon."
- "Install Playwright for the marketing site."
- "Explain how the pack manifest works."
- "Test the checkout flow on another application."

The final description names this repository's icon assets, state pairs, preview, browser rendering, and visual-review language to improve recall while excluding general browser QA.
