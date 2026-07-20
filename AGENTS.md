# Agent Instructions

## Commands

| Task | Command |
|---|---|
| Install dependencies | `pnpm install` |
| Install the browser used for visual QA | `pnpm browser:install` |
| Build SVG, PNG, and installable icon pack | `pnpm build` |
| Build only SVG and PNG icons | `pnpm build:icons` |
| Validate sources and generated assets | `pnpm check` |
| Preview the 5 × 3 deck | `pnpm dev` |
| Run visual icon QA | Use the local `icons-qa` skill |

## Icon Conventions

- Define the icon set and visual tokens in `config/icons.json`.
- Use filled Elgato glyphs by default; an outline-only source requires an explicit `allowOutline` exception.
- Use plain white icons on black unless the design calls for a state accent.
- Render inactive states in `#666666`; reserve white or accent colors for active states.
- Show active audio states as plain white filled glyphs. Show muted states as the same glyph in gray with the shared red diagonal slash from `assets/mute-slash.svg`.
- Center icons by their visible glyph bounds; some Elgato volume SVGs reserve empty space for sound waves and need an explicit horizontal offset.
- Use the centered filled no-wave volume glyph for audio mute states so they remain distinct from volume controls.
- For output-device states, place the large active device at top-left and the small dimmed inactive device behind it at bottom-right; use filled device glyphs.
- Keep paired state names explicit, such as `microphone` and `microphone-muted`.
- Put original 24 × 24 SVG glyphs in `src/icons/` and use `currentColor` for themeable paths.
- Do not edit `dist/`; regenerate it with `pnpm build`.
- Run `pnpm build` and `pnpm check` after changing icons or build scripts.

## References

| Need | File |
|---|---|
| Setup, source format, and layout | `README.md` |
| Icon definitions and palette | `config/icons.json` |
| Icon-library metadata | `config/pack.json` |
