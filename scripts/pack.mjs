import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { strToU8, zipSync } from "fflate";
import sharp from "sharp";
import { loadConfig, paths } from "./lib.mjs";

const iconConfig = await loadConfig();
const packConfig = JSON.parse(
  await readFile(resolve(paths.root, "config/pack.json"), "utf8"),
);
const license = await readFile(resolve(paths.root, "LICENSE"), "utf8");
validatePackConfig(packConfig, iconConfig.icons);

const root = `${packConfig.id}.sdIconPack`;
const archiveOptions = {
  level: 0,
  mtime: new Date(1980, 0, 1, 0, 0, 0),
};
const archive = {
  [`${root}/`]: [new Uint8Array(), archiveOptions],
  [`${root}/icons/`]: [new Uint8Array(), archiveOptions],
  [`${root}/previews/`]: [new Uint8Array(), archiveOptions],
};

const manifest = {
  Name: packConfig.name,
  Version: packConfig.version,
  Description: packConfig.description,
  Author: packConfig.author,
  ...(packConfig.url ? { URL: packConfig.url } : {}),
  Icon: "icon.png",
  License: "license.txt",
};
const metadata = iconConfig.icons.map((icon) => ({
  path: `${icon.name}.png`,
  name: titleCase(icon.name),
  tags: icon.tags ?? icon.name.split("-"),
}));

archive[`${root}/manifest.json`] = [json(manifest), archiveOptions];
archive[`${root}/icons.json`] = [json(metadata), archiveOptions];
archive[`${root}/license.txt`] = [strToU8(license), archiveOptions];

for (const icon of iconConfig.icons) {
  const data = new Uint8Array(
    await readFile(resolve(paths.dist, "png", `${icon.name}.png`)),
  );
  archive[`${root}/icons/${icon.name}.png`] = [data, archiveOptions];
  if (icon.name === packConfig.icon) {
    const thumbnail = await sharp(data).resize(56, 56).png().toBuffer();
    archive[`${root}/icon.png`] = [thumbnail, archiveOptions];
  }
}

const outputPath = resolve(
  paths.dist,
  `${packConfig.id}.streamDeckIconPack`,
);
await writeFile(outputPath, zipSync(archive, { level: 0 }));
console.log(`packed ${iconConfig.icons.length} icons`);
console.log(outputPath);

function json(value) {
  return strToU8(JSON.stringify(value, null, 4));
}

function titleCase(value) {
  return value
    .split("-")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

function validatePackConfig(config, icons) {
  if (!/^[a-z0-9]+(?:\.[a-z0-9]+)+$/.test(config.id ?? "")) {
    throw new Error("pack.id must use lowercase reverse-DNS format");
  }
  for (const field of ["name", "version", "description", "author", "icon", "license"]) {
    if (typeof config[field] !== "string" || !config[field]) {
      throw new Error(`pack.${field} must be a non-empty string`);
    }
  }
  if (!/^\d+\.\d+\.\d+$/.test(config.version)) {
    throw new Error("pack.version must use semantic versioning, such as 1.0.0");
  }
  if (!icons.some((icon) => icon.name === config.icon)) {
    throw new Error(`pack.icon does not match a configured icon: ${config.icon}`);
  }
  if (config.url !== undefined) {
    new URL(config.url);
  }
}
