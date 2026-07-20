---
name: icons-qa
description: Runs visual and structural QA for this repository's Stream Deck icons. Use after icon or build changes, or when asked to inspect, review, dogfood, or visually validate icon assets, paired states, the 5 x 3 preview, browser rendering, responsive behavior, or icon accessibility.
---

# Icons QA

Validate generated assets first, then inspect the rendered deck with the repo-local `agent-browser`. Treat `AGENTS.md` and `config/icons.json` as the expected-result contract. Report issues; do not edit icons unless the user also asks for fixes.

## Preconditions

1. Run from the repository root.
2. Run `pnpm install` when dependencies are missing.
3. Run `pnpm browser:install` when the browser is missing or `pnpm exec agent-browser doctor --offline --quick` reports a browser problem.
4. Load the installed CLI guidance before driving the browser:

   ```sh
   pnpm exec agent-browser skills get core
   pnpm exec agent-browser skills get dogfood
   ```

Use `pnpm exec agent-browser` for every browser command. Do not use `npx` or assume a global installation.

## Workflow

1. Read `AGENTS.md` and `config/icons.json`. Note the configured icon names, state pairs, palette, layer order, sizes, and offsets.
2. Run `pnpm build` and `pnpm check`. Fix build or validation failures only when fixes are in scope; otherwise report them and stop visual QA if the preview assets are unavailable or stale.
3. Start `pnpm dev` in a persistent shell and wait for `Stream Deck preview: http://127.0.0.1:4173`. Keep that process alive. If the port belongs to an unrelated process, do not terminate it; start this server on a free port and use that URL consistently.
4. Open the preview in an isolated session and capture the desktop state:

   ```sh
   pnpm exec agent-browser --session icons-qa open http://127.0.0.1:4173
   pnpm exec agent-browser --session icons-qa wait --load networkidle
   pnpm exec agent-browser --session icons-qa set viewport 1200 900
   pnpm exec agent-browser --session icons-qa reload
   pnpm exec agent-browser --session icons-qa wait --load networkidle
   pnpm exec agent-browser --session icons-qa snapshot
   pnpm exec agent-browser --session icons-qa screenshot --full /tmp/icons-qa-desktop.png
   pnpm exec agent-browser --session icons-qa errors
   pnpm exec agent-browser --session icons-qa console
   ```

5. Verify structure and image loading:

   ```sh
   pnpm exec agent-browser --session icons-qa get count ".key"
   pnpm exec agent-browser --session icons-qa get count ".key img"
   pnpm exec agent-browser --session icons-qa eval "Array.from(document.images).map(({alt,complete,naturalWidth,naturalHeight}) => ({alt,complete,naturalWidth,naturalHeight}))"
   ```

   Compare results with `config/icons.json` and `preview/index.html`. Every configured preview icon must load with nonzero natural dimensions, the deck must contain 15 keys in a 5 x 3 grid, and unused positions must render as empty keys.

6. Use the available local-image viewer to inspect `/tmp/icons-qa-desktop.png`. Do not infer visual quality from the accessibility snapshot alone.
7. Repeat at a narrow viewport:

   ```sh
   pnpm exec agent-browser --session icons-qa set viewport 390 844
   pnpm exec agent-browser --session icons-qa reload
   pnpm exec agent-browser --session icons-qa wait --load networkidle
   pnpm exec agent-browser --session icons-qa screenshot --full /tmp/icons-qa-narrow.png
   pnpm exec agent-browser --session icons-qa errors
   ```

8. If a key is questionable, open `/dist/svg/<icon-name>.svg` in the same session and capture it separately at 144 x 144. Reopen the deck and re-snapshot before using element refs again.
9. Close the browser session and stop only the preview server started for this run, including on failure.

## Visual Checklist

Check the deck at its rendered key size, not only enlarged assets.

- **Completeness:** Every intended icon appears once, no image is broken, labels and alt text match the represented action/state, and five unused keys remain visibly empty for the current ten-icon set.
- **Optical alignment:** Filled glyphs have consistent apparent scale and breathing room. They look centered by visible bounds; volume glyph offsets compensate for sound-wave whitespace. Nothing clips or crowds the key edge.
- **Pair consistency:** `microphone`/`microphone-muted` and `audio`/`audio-muted` retain the same base glyph size and position. Muted variants use a dim gray base plus the same red diagonal slash.
- **State semantics:** Active audio glyphs are filled white. Inactive glyphs use `#666666`. Broadcast off is dim; broadcast live is lime. White or accent color is not used accidentally for inactive states.
- **Output devices:** The active filled device is large at top-left; the inactive filled device is smaller, gray, behind it at bottom-right. The two states swap prominence without changing the composition.
- **Shape and legibility:** Sources look filled unless an explicit `allowOutline` exception exists. Silhouettes remain distinguishable at physical-key scale; fine detail does not disappear.
- **Deck layout:** The preview remains a 5 x 3 grid with square keys, even gaps, intact rounded corners, and no overlap or overflow at desktop and narrow widths. Labels stay readable and do not obscure glyphs.
- **Rendering and accessibility:** Backgrounds are black, expected colors have sufficient contrast, no browser errors appear, and the full snapshot exposes meaningful image alt text plus labels for empty keys and the deck region.

## Findings Contract

Lead with `PASS`, `PASS WITH ISSUES`, or `FAIL`, then include:

- build and check results;
- desktop and narrow viewport results;
- each issue's severity, affected icon or state pair, expected result, observed result, reproduction command or URL, and screenshot path;
- console or loading errors;
- any limitation, especially that browser preview QA cannot prove appearance on a physical Stream Deck.

Retry a suspected issue once before reporting it. One clean screenshot is enough for a static visual issue; do not record video for this non-interactive preview.
