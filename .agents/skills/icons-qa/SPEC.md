# Icons QA Specification

## Intent

Provide a repeatable project-local workflow for validating generated Stream Deck icon assets and reviewing the browser preview against this repository's visual conventions.

## Scope

In scope:

- build and stale-asset validation;
- browser-visible layout, loading, responsive, accessibility, and console checks;
- visual review of icon alignment, palette, paired states, and legibility.

Out of scope:

- changing icons unless the user requests fixes;
- claiming physical-device color or legibility without checking a Stream Deck;
- broad web application dogfooding unrelated to this icon preview.

## Users And Trigger Context

- Primary users: agents reviewing icon or build changes in this repository.
- Common requests: QA the icons, inspect the preview, validate state pairs, check browser rendering, review a new icon.
- Should not trigger for: installing unrelated browser tooling, editing an icon without a QA request, or general website testing outside this repository.

## Runtime Contract

- Required first actions: read `AGENTS.md` and `config/icons.json`; load the repo-local agent-browser guidance.
- Required outputs: status, validation results, browser findings, evidence paths, and limitations.
- Non-negotiable constraints: use the local CLI through `pnpm exec`; test desktop and narrow viewports; visually inspect screenshots; clean up only processes started by the run.
- Expected bundled files loaded at runtime: `SKILL.md` only.

## Source And Evidence Model

Authoritative sources:

- `AGENTS.md`, `README.md`, `config/icons.json`, `preview/index.html`, and the build/check scripts;
- the guidance emitted by the pinned `agent-browser` package.

Useful improvement sources include reproducible QA misses, reviewer feedback, browser-version changes, and new icon conventions. Do not store secrets, private URLs, or unrelated user data.

## Reference Architecture

- `SKILL.md` contains the complete inline runtime workflow and checklist.
- `SPEC.md` contains this maintenance contract.
- `SOURCES.md` contains provenance, synthesis decisions, trigger examples, and known gaps.
- No runtime references, scripts, or assets are needed for the current single-path workflow.

## Validation

- Lightweight validation: run the Agent Skills structural validator and inspect trigger examples manually.
- Deeper validation: run `pnpm build`, `pnpm check`, and the documented browser workflow.
- Acceptance gates: valid skill structure, successful asset checks, launchable browser preview, inspectable desktop and narrow screenshots, and no unexplained browser errors.

## Known Limitations

- Browser screenshots cannot replace inspection on physical Stream Deck hardware.
- The checklist must be updated when the configured states or preview layout changes materially.

## Maintenance Notes

- Update `SKILL.md` when commands, visual conventions, or required evidence change.
- Update `SOURCES.md` when dependency versions, source authority, decisions, or gaps change.
