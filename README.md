# Stream Deck icons

A small, reproducible workspace for making a consistent set of Stream Deck key icons. It uses the official [`@elgato/icons`](https://github.com/elgatosf/icons) SVG library for stock glyphs and also accepts project-owned SVG artwork.

## Style

- 144 × 144 px square canvas, the current Elgato icon-pack recommendation
- 84 × 84 px centered glyphs, leaving enough breathing room on a physical key
- filled `#FFFFFF` foreground glyphs on `#000000` by default
- source artwork stays vector; builds produce both SVG and PNG

The [Elgato icon library page](https://docs.elgato.com/resources/icons/) does not define a color called “Elgato White.” The Stream Deck plugin guidelines do explicitly specify `#FFFFFF` for monochrome action-list icons, so this repo uses pure white for the similarly named app style. Change `canvas.foreground` in `config/icons.json` if a comparison on the device shows that the installed pack uses a warmer or dimmer white.

## Use it

```sh
pnpm install
pnpm browser:install
pnpm build
pnpm check
pnpm dev
```

The ready-to-use files are written to `dist/png/` and `dist/svg/`. For ordinary custom key imports, use the 144 px PNG files. Stream Deck will scale one square image for different devices. `pnpm dev` opens the preview at `http://127.0.0.1:4173` and emulates the requested 5 × 3 device.

`pnpm browser:install` installs the Chromium build used by the repo-local `agent-browser` dependency. Agents can use the project-local `icons-qa` skill to build the assets, launch the preview, and inspect the deck at desktop and narrow viewports.

The starter set contains volume down/up, microphone on/muted, audio on/muted, headphones/speaker output states, broadcast off/live, and light off/on. Active audio states are white, inactive states are gray, muted states use a shared red diagonal slash, and live broadcast uses a vivid lime glyph. The light pair shares one original bulb glyph from `src/icons/`: gray when off, white with rays when on.

## Build the icon library

`pnpm build` renders the SVG and PNG icons, generates the Stream Deck manifest and searchable icon metadata, and writes `dist/com.dcramer.streamdeckicons.streamDeckIconPack`. Double-click that file to install the pack in Stream Deck. Edit `config/pack.json` to change the pack name, version, author, URL, thumbnail icon, or license. Use `pnpm build:icons` only when you want the loose assets without repackaging the library.

### Update a sideloaded pack

Stream Deck does not reliably replace a sideloaded icon pack that has the same ID. To install a new local build:

1. Fully quit Stream Deck from the menu bar or system tray.
2. Remove only the `com.dcramer.streamdeckicons.sdIconPack` folder from the appropriate icon-pack directory:
   - macOS: `~/Library/Application Support/com.elgato.StreamDeck/IconPacks/`
   - Windows: `%AppData%\Elgato\StreamDeck\IconPacks\`
3. Reopen Stream Deck.
4. Double-click `dist/com.dcramer.streamdeckicons.streamDeckIconPack`.

The repository uses the conventional `LICENSE` filename. The generated pack includes the same text as `license.txt` because that is the filename expected by Elgato's documented icon-pack layout.

## Add an icon

Add an entry to `config/icons.json`. To use one of the glyph names from the [Elgato icon browser](https://docs.elgato.com/resources/icons/):

```json
{
  "name": "camera-off",
  "source": "elgato:camera-off--filled"
}
```

For original artwork, add a 24 × 24 SVG under `src/icons/`. Use `currentColor` for the parts that should receive the configured foreground color:

```json
{
  "name": "my-action",
  "source": "src/icons/my-action.svg"
}
```

Each icon can override `glyphSize`, `foreground`, or `background`. Set `background` to `null` for transparency.

```json
{
  "name": "recording",
  "source": "elgato:record--filled",
  "foreground": "#FF3B30"
}
```

Keep the 24 × 24 source simple and bold. Fine detail that looks good on a monitor often disappears on a 72 px physical key.

Composite icons use `layers`. Each layer has its own source, size, position, and optional color; see the muted and output-toggle icons in `config/icons.json`.

## Layout

```text
config/icons.json   icon list and shared visual tokens
config/pack.json    installable icon-library metadata
src/icons/          original project-owned SVG glyphs
scripts/            build and validation tools
dist/svg/           generated vector keys (ignored by Git)
dist/png/           generated 144 px keys (ignored by Git)
```

This project is licensed under the [Apache License 2.0](LICENSE). The upstream Elgato icon package is separately MIT licensed.
