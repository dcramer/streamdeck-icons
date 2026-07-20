import { access, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export const paths = {
  root,
  config: resolve(root, "config/icons.json"),
  dist: resolve(root, "dist"),
};

export async function loadConfig() {
  const config = JSON.parse(await readFile(paths.config, "utf8"));
  validateConfig(config);
  return config;
}

export async function resolveSource(source) {
  if (!source.startsWith("elgato:")) {
    const sourcePath = resolve(paths.root, source);
    await access(sourcePath);
    return sourcePath;
  }

  const iconName = source.slice("elgato:".length);
  const entry = fileURLToPath(import.meta.resolve("@elgato/icons/l"));
  const packageRoot = resolve(dirname(entry), "../../..");
  const sourcePath = resolve(packageRoot, "svg/l", `${iconName}.svg`);
  await access(sourcePath);
  return sourcePath;
}

export async function renderSvg(icon, canvas) {
  const size = canvas.size;
  const background = icon.background === undefined ? canvas.background : icon.background;
  const layers = icon.layers ?? [
    {
      source: icon.source,
      size: icon.glyphSize ?? canvas.glyphSize,
    },
  ];
  const renderedLayers = await Promise.all(
    layers.map((layer) => renderLayer(layer, icon, canvas)),
  );
  const backgroundElement = background
    ? `  <rect width="${size}" height="${size}" fill="${background}"/>`
    : "";

  return [
    `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">`,
    backgroundElement,
    ...renderedLayers,
    "</svg>",
    "",
  ]
    .filter(Boolean)
    .join("\n");
}

async function renderLayer(layer, icon, canvas) {
  const sourcePath = await resolveSource(layer.source);
  const source = await readFile(sourcePath, "utf8");
  const match = source.match(/<svg\b([^>]*)>([\s\S]*)<\/svg>\s*$/i);

  if (!match) {
    throw new Error(`${layer.source} is not a readable SVG`);
  }

  const viewBoxMatch = match[1].match(/viewBox=["']([^"']+)["']/i);
  if (!viewBoxMatch) {
    throw new Error(`${layer.source} must define a viewBox`);
  }

  const glyphSize = layer.size ?? icon.glyphSize ?? canvas.glyphSize;
  const foreground = layer.foreground ?? icon.foreground ?? canvas.foreground;
  const x = layer.x ?? (canvas.size - glyphSize) / 2;
  const y = layer.y ?? (canvas.size - glyphSize) / 2;
  const inheritedFill = getPresentationAttribute(match[1], "fill", foreground) ?? foreground;
  const inheritedStroke = getPresentationAttribute(match[1], "stroke", foreground);
  const body = match[2].replaceAll("currentColor", foreground);
  const presentation = [
    `fill="${inheritedFill}"`,
    `color="${foreground}"`,
    inheritedStroke === undefined ? "" : `stroke="${inheritedStroke}"`,
  ]
    .filter(Boolean)
    .join(" ");

  return [
    `  <svg x="${x}" y="${y}" width="${glyphSize}" height="${glyphSize}" viewBox="${viewBoxMatch[1]}" ${presentation}>`,
    indent(body.trim(), 4),
    "  </svg>",
  ]
    .join("\n");
}

function getPresentationAttribute(attributes, name, foreground) {
  const match = attributes.match(new RegExp(`${name}=["']([^"']+)["']`, "i"));
  return match?.[1].replaceAll("currentColor", foreground);
}

function validateConfig(config) {
  if (!config?.canvas || !Array.isArray(config.icons)) {
    throw new Error("config/icons.json must contain canvas and icons entries");
  }

  const { size, glyphSize, background, foreground } = config.canvas;
  if (!Number.isInteger(size) || size < 1) {
    throw new Error("canvas.size must be a positive integer");
  }
  if (typeof glyphSize !== "number" || glyphSize <= 0 || glyphSize > size) {
    throw new Error("canvas.glyphSize must fit within canvas.size");
  }
  validateColor(background, "canvas.background", true);
  validateColor(foreground, "canvas.foreground");

  const names = new Set();
  for (const [index, icon] of config.icons.entries()) {
    const prefix = `icons[${index}]`;
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(icon.name ?? "")) {
      throw new Error(`${prefix}.name must be lowercase kebab-case`);
    }
    if (names.has(icon.name)) {
      throw new Error(`${prefix}.name duplicates ${icon.name}`);
    }
    names.add(icon.name);
    const hasSource = typeof icon.source === "string" && icon.source;
    const hasLayers = Array.isArray(icon.layers) && icon.layers.length;
    if (!hasSource && !hasLayers) {
      throw new Error(`${prefix} must define source or a non-empty layers list`);
    }
    if (hasSource && hasLayers) {
      throw new Error(`${prefix} cannot define both source and layers`);
    }
    if (hasSource) {
      validateSource(icon.source, `${prefix}.source`);
    }
    if (icon.glyphSize !== undefined && (icon.glyphSize <= 0 || icon.glyphSize > size)) {
      throw new Error(`${prefix}.glyphSize must fit within the canvas`);
    }
    if (icon.background !== undefined) {
      validateColor(icon.background, `${prefix}.background`, true);
    }
    if (icon.foreground !== undefined) {
      validateColor(icon.foreground, `${prefix}.foreground`);
    }
    for (const [layerIndex, layer] of (icon.layers ?? []).entries()) {
      validateLayer(layer, `${prefix}.layers[${layerIndex}]`, size);
    }
  }
}

function validateLayer(layer, prefix, canvasSize) {
  if (typeof layer.source !== "string" || !layer.source) {
    throw new Error(`${prefix}.source must be a source SVG path or elgato:<name>`);
  }
  if (layer.allowOutline !== undefined && typeof layer.allowOutline !== "boolean") {
    throw new Error(`${prefix}.allowOutline must be a boolean`);
  }
  validateSource(layer.source, `${prefix}.source`, layer.allowOutline);
  if (typeof layer.size !== "number" || layer.size <= 0 || layer.size > canvasSize) {
    throw new Error(`${prefix}.size must fit within the canvas`);
  }
  for (const axis of ["x", "y"]) {
    if (layer[axis] !== undefined && typeof layer[axis] !== "number") {
      throw new Error(`${prefix}.${axis} must be a number`);
    }
  }
  if ((layer.x ?? 0) + layer.size > canvasSize || (layer.y ?? 0) + layer.size > canvasSize) {
    throw new Error(`${prefix} must fit within the canvas`);
  }
  if (layer.foreground !== undefined) {
    validateColor(layer.foreground, `${prefix}.foreground`);
  }
}

function validateSource(source, label, allowOutline = false) {
  if (source.startsWith("elgato:") && !source.endsWith("--filled") && !allowOutline) {
    throw new Error(`${label} must use the --filled variant or explicitly allowOutline`);
  }
}

function validateColor(value, label, nullable = false) {
  if (nullable && value === null) return;
  if (!/^#[0-9A-Fa-f]{6}$/.test(value ?? "")) {
    throw new Error(`${label} must be a six-digit hex color${nullable ? " or null" : ""}`);
  }
}

function indent(value, spaces) {
  const padding = " ".repeat(spaces);
  return value
    .split("\n")
    .map((line) => `${padding}${line}`)
    .join("\n");
}
