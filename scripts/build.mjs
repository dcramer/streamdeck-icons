import { mkdir, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import sharp from "sharp";
import { loadConfig, paths, renderSvg } from "./lib.mjs";

const config = await loadConfig();
const svgDir = resolve(paths.dist, "svg");
const pngDir = resolve(paths.dist, "png");
await Promise.all([
  rm(svgDir, { recursive: true, force: true }),
  rm(pngDir, { recursive: true, force: true }),
]);
await Promise.all([
  mkdir(svgDir, { recursive: true }),
  mkdir(pngDir, { recursive: true }),
]);

for (const icon of config.icons) {
  const svg = await renderSvg(icon, config.canvas);
  await Promise.all([
    writeFile(resolve(svgDir, `${icon.name}.svg`), svg),
    sharp(Buffer.from(svg))
      .png({ compressionLevel: 9 })
      .toFile(resolve(pngDir, `${icon.name}.png`)),
  ]);
  console.log(`built ${icon.name}`);
}

console.log(`\n${config.icons.length} icons written to dist/svg and dist/png`);
