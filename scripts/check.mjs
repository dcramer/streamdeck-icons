import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import sharp from "sharp";
import { loadConfig, paths, renderSvg } from "./lib.mjs";

const config = await loadConfig();
const problems = [];

for (const icon of config.icons) {
  try {
    const expectedSvg = await renderSvg(icon, config.canvas);
    const svgPath = resolve(paths.dist, "svg", `${icon.name}.svg`);
    const pngPath = resolve(paths.dist, "png", `${icon.name}.png`);
    const actualSvg = await readFile(svgPath, "utf8");
    if (actualSvg !== expectedSvg) {
      problems.push(`${icon.name}: generated SVG is stale`);
    }

    const metadata = await sharp(pngPath).metadata();
    if (metadata.width !== config.canvas.size || metadata.height !== config.canvas.size) {
      problems.push(`${icon.name}: PNG must be ${config.canvas.size} x ${config.canvas.size}`);
    }
  } catch (error) {
    problems.push(`${icon.name}: ${error.message}`);
  }
}

if (problems.length) {
  console.error(problems.join("\n"));
  console.error("\nRun pnpm build, then check again.");
  process.exitCode = 1;
} else {
  console.log(`checked ${config.icons.length} icons`);
}
