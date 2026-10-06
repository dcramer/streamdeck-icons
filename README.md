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

The ready-to-use files are written to `dist/png/` and `dist/svg/`. For ordinary custom key imports, use the 144 px PNG files. Stream Deck will scale one square image for different devices. `pnpm dev` opens the preview at `http://127.0.0.1:4173` and emulates the requested 5 × 3 device as two pages: audio and broadcast, then lights.

`pnpm browser:install` installs the Chromium build used by the repo-local `agent-browser` dependency. Agents can use the project-local `icons-qa` skill to build the assets, launch the preview, and inspect the deck at desktop and narrow viewports.

The starter set contains volume down/up, microphone on/muted, audio on/muted, headphones/speaker output states, broadcast off/live, light off/on, panel light off/on, and ceiling light off/on. Active audio states are white, inactive states are gray, muted states use a shared red diagonal slash, and live broadcast uses a vivid lime glyph. The light, panel-light, and ceiling-light pairs each share one original glyph from `src/icons/` (a bulb, a rectangular LED panel with a softbox grid, and a recessed can downlight): gray when off, white with rays when on.

## Build the icon library

`pnpm build` renders the SVG and PNG icons, generates the Stream Deck manifest and searchable icon metadata, and writes `dist/com.dcramer.streamdeckicons.streamDeckIconPack`. Double-click that file to install the pack in Stream Deck. Edit `config/pack.json` to change the pack name, version, author, URL, thumbnail icon, or license. Use `pnpm build:icons` only when you want the loose assets without repackaging the library.

### Update the installed pack

```sh
pnpm pack:install
```

This rebuilds and validates the icons, quits Stream Deck, replaces the `com.dcramer.streamdeckicons.sdIconPack` folder in the Stream Deck icon-pack directory with the new build, and reopens Stream Deck if it was running. It works on macOS, on Windows, and from WSL against the Windows install. Only this pack's folder is touched.

Keys that already use one of these icons keep the image they were assigned; pick the icon again from the library to pick up a changed design.

Stream Deck does not reliably replace a sideloaded icon pack that has the same ID, which is why the script swaps the folder while the app is closed. To do the same by hand:

1. Fully quit Stream Deck from the menu bar or system tray.
2. Remove only the `com.dcramer.streamdeckicons.sdIconPack` folder from the appropriate icon-pack directory:
   - macOS: `~/Library/Application Support/com.elgato.StreamDeck/IconPacks/`
   - Windows: `%AppData%\Elgato\StreamDeck\IconPacks\`
3. Reopen Stream Deck.
4. Double-click `dist/com.dcramer.streamdeckicons.streamDeckIconPack`.

## Put icons on keys

Icons are designed to be used without a title: the glyph alone carries the meaning, so turn the key's title off in Stream Deck (the **T** menu next to the title field, "Show Title"). The preview shows keys without labels for the same reason.

Assigning an icon in the Stream Deck app is the normal route. The steps below do the same thing by editing the profile on disk, which is how an agent can update the deck.

### Where things live

All paths are under the Stream Deck data directory: `%AppData%\Elgato\StreamDeck\` on Windows (from WSL, `/mnt/c/Users/<user>/AppData/Roaming/Elgato/StreamDeck/`), or `~/Library/Application Support/com.elgato.StreamDeck/` on macOS.

| Path | Contents |
|---|---|
| `IconPacks/com.dcramer.streamdeckicons.sdIconPack/` | The installed pack, replaced by `pnpm pack:install` |
| `ProfilesV3/<id>.sdProfile/Profiles/<page-id>/manifest.json` | One page of keys, as compact single-line JSON |
| `ProfilesV3/<id>.sdProfile/Profiles/<page-id>/Images/` | That page's key images |
| `Plugins/<plugin-id>.sdPlugin/` | Installed plugins and the images they draw themselves |

In a page manifest, `Controllers[0].Actions` is keyed by `"column,row"` from the top-left, so `"2,0"` is the third key of the top row. Each action has a `States` list; a state's `Image` is a path such as `Images/<name>.png`, and `ShowTitle: false` hides its title. Find a key by its plugin `UUID` and `Settings` (an entity ID, a device ID) rather than by position.

### Change a key's icon

1. Quit Stream Deck. It rewrites profiles from memory when it exits, so edits made while it runs are lost. On Windows it ignores a polite close and has to be force-quit: note the path of the running `StreamDeck.exe`, then `taskkill.exe /F /IM StreamDeck.exe`.
2. Copy the page's `manifest.json` somewhere safe.
3. Copy the icon from `dist/png/` into the page's `Images/` folder under a new name: 26 random characters from `A-Z0-9` followed by `Z`, plus `.png`. Stream Deck copies an icon into the profile when it is assigned, so keys never point at the pack.
4. Set each state's `Image` to the new file and `ShowTitle` to `false`. For a two-state key, state 0 is off or inactive and state 1 is on or active; open the key's current images to confirm before replacing them. Write the manifest back as compact JSON (`separators=(",", ":")`, no ASCII escaping).
5. Start `StreamDeck.exe` again and read the manifest back to confirm the change survived the launch.

From WSL, run `taskkill.exe`, `tasklist.exe`, and `powershell.exe` from a Windows directory such as `/mnt/c`; they reject a WSL working directory.

### Keys whose plugin draws its own image

Check how many entries a key's action has under `States` in the plugin's `manifest.json`. A two-state action takes an off and an on icon as above. A single-state action that still shows state is drawing the image itself, and a custom icon on that key would freeze it. Search the plugin's code for `setImage` to see which of its own files it uses, and replace those files instead, keeping the originals beside them as `*.orig.png`. A plugin update restores the stock images, so repeat the swap after updating.

The amaran Controller's On/Off key works this way. Its images are in `Plugins/com.amarancreators.controller.sdPlugin/imgs/plugin/`:

| Plugin file | Replace with |
|---|---|
| `power.png` (72 px), `power@2x.png` (144 px) | `panel-light-on` |
| `power-off.png` (72 px), `power-off@2x.png` (144 px) | `panel-light-off` |

### Current key assignments

| Key | Plugin action | Icons |
|---|---|---|
| Amaran Pano 120c on/off | amaran Controller On/Off (`com.amarancreators.controller.switch`) | `panel-light-off` / `panel-light-on`, through the plugin image swap |
| Office recessed can lights | Home Assistant dual-state entity, `light.office_office_recessed` | `ceiling-light-off` / `ceiling-light-on` |

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
