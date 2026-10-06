import { execFileSync, spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, resolve } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import { unzipSync } from "fflate";
import { paths } from "./lib.mjs";

const packConfig = JSON.parse(
  await readFile(resolve(paths.root, "config/pack.json"), "utf8"),
);
const packPath = resolve(paths.dist, `${packConfig.id}.streamDeckIconPack`);
const folderName = `${packConfig.id}.sdIconPack`;

if (!existsSync(packPath)) {
  throw new Error(`${packPath} is missing. Run pnpm build first.`);
}

const platform = detectPlatform();
const iconPacks = iconPacksDirectory(platform);
if (!existsSync(iconPacks)) {
  throw new Error(`Stream Deck icon-pack directory not found: ${iconPacks}`);
}

// Stream Deck only reads icon packs at launch and does not reliably replace a
// sideloaded pack with the same ID, so quit it, swap the folder, and relaunch.
const app = await quitStreamDeck(platform);

const target = resolve(iconPacks, folderName);
await rm(target, { recursive: true, force: true });
const entries = unzipSync(new Uint8Array(await readFile(packPath)));
let fileCount = 0;
for (const [name, data] of Object.entries(entries)) {
  if (!name.startsWith(`${folderName}/`)) {
    throw new Error(`unexpected archive entry: ${name}`);
  }
  const destination = resolve(iconPacks, name);
  if (name.endsWith("/")) {
    await mkdir(destination, { recursive: true });
    continue;
  }
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, data);
  fileCount += 1;
}
console.log(`installed ${fileCount} files to ${target}`);

if (app.wasRunning) {
  startStreamDeck(platform, app.path);
  console.log("restarted Stream Deck");
} else {
  console.log("Stream Deck was not running; open it to load the pack");
}

function detectPlatform() {
  if (process.platform === "darwin" || process.platform === "win32") {
    return process.platform;
  }
  if (
    process.platform === "linux" &&
    /microsoft/i.test(readFileSync("/proc/version", "utf8"))
  ) {
    return "wsl";
  }
  throw new Error("Stream Deck runs on macOS and Windows (including via WSL) only");
}

function iconPacksDirectory(platform) {
  if (platform === "darwin") {
    return resolve(
      homedir(),
      "Library/Application Support/com.elgato.StreamDeck/IconPacks",
    );
  }
  if (platform === "win32") {
    return resolve(process.env.APPDATA, "Elgato/StreamDeck/IconPacks");
  }
  const appData = windows("cmd.exe", ["/c", "echo %APPDATA%"]);
  return resolve(
    run("wslpath", ["-u", appData]),
    "Elgato/StreamDeck/IconPacks",
  );
}

async function quitStreamDeck(platform) {
  if (platform === "darwin") {
    const wasRunning = isRunning(platform);
    if (wasRunning) {
      run("osascript", ["-e", 'quit app "Elgato Stream Deck"']);
      await waitForExit(platform);
    }
    return { wasRunning };
  }

  const path = windows("powershell.exe", [
    "-NoProfile",
    "-Command",
    "Get-Process StreamDeck -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty Path",
  ]);
  if (!path) return { wasRunning: false };

  // Ask politely first; the tray app sometimes only hides its window.
  tryWindows("taskkill.exe", ["/IM", "StreamDeck.exe"]);
  if (!(await waitForExit(platform, 5))) {
    tryWindows("taskkill.exe", ["/F", "/IM", "StreamDeck.exe"]);
    if (!(await waitForExit(platform))) {
      throw new Error("Stream Deck did not quit; close it and run again");
    }
  }
  return { wasRunning: true, path };
}

function startStreamDeck(platform, path) {
  if (platform === "darwin") {
    run("open", ["-a", "Elgato Stream Deck"]);
    return;
  }
  if (platform === "win32") {
    spawn(path, { detached: true, stdio: "ignore" }).unref();
    return;
  }
  windows("powershell.exe", [
    "-NoProfile",
    "-Command",
    `Start-Process -FilePath '${path.replaceAll("'", "''")}'`,
  ]);
}

function isRunning(platform) {
  if (platform === "darwin") {
    try {
      run("pgrep", ["-x", "Stream Deck"]);
      return true;
    } catch {
      return false;
    }
  }
  return /StreamDeck\.exe/i.test(
    windows("tasklist.exe", ["/FI", "IMAGENAME eq StreamDeck.exe"]),
  );
}

async function waitForExit(platform, seconds = 15) {
  for (let elapsed = 0; elapsed < seconds * 2; elapsed += 1) {
    if (!isRunning(platform)) return true;
    await sleep(500);
  }
  return false;
}

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
    ...options,
  }).trim();
}

// Windows tools reject WSL working directories, so run them from a Windows path.
function windows(command, args) {
  const cwd = process.platform === "win32" ? undefined : "/mnt/c";
  return run(command, args, { cwd });
}

function tryWindows(command, args) {
  try {
    windows(command, args);
  } catch {
    // The caller checks whether the process is still running.
  }
}
