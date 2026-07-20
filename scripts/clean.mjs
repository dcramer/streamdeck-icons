import { rm } from "node:fs/promises";
import { paths } from "./lib.mjs";

await rm(paths.dist, { recursive: true, force: true });
console.log("removed dist");
