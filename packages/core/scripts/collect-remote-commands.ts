import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import type { CommandDefinition } from "../src/remote-commands/index.js";

interface PackageJSON {
  devDependencies: Record<string, string>;
}

const COMMAND_MODULE_PREFIX = "@eduardoboucas/mcli-command-";

const srcPath = process.argv[2];
const destPath = process.argv[3];

if (!srcPath) {
  throw new Error("Expected path to package.json as first argument");
}

if (!destPath) {
  throw new Error("Expected path to output manifest file as second argument");
}

const file = await fs.readFile(path.resolve(srcPath), "utf8");
const data = JSON.parse(file) as PackageJSON;
const modules: Record<string, CommandDefinition> = {};

for (const moduleName in data.devDependencies) {
  if (!moduleName.startsWith(COMMAND_MODULE_PREFIX)) {
    continue;
  }

  try {
    const { metadata } = await import(moduleName);

    modules[`${moduleName}@${data.devDependencies[moduleName]}`] = metadata;
  } catch (error) {
    throw new Error(`Could not load module ${moduleName}`, { cause: error });
  }
}

const absoluteDestPath = path.resolve(destPath);

await fs.mkdir(path.dirname(absoluteDestPath), { recursive: true });
await fs.writeFile(
  path.resolve(absoluteDestPath),
  JSON.stringify(modules, null, 4)
);
