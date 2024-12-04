import fs from "node:fs/promises";
import path from "node:path";
import { env } from "node:process";
import { fileURLToPath } from "node:url";

import { Command } from "commander";

import { modulesDirectory } from "./remote-commands/download.js";
import {
  registerCommand,
  type CommandDefinition
} from "./remote-commands/index.js";
import { getRemoteCommandsManifest } from "./remote-commands/manifest.js";

export { CommandMetadata } from "./remote-commands/index.js";

export const start = async () => {
  const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
  const program = new Command();
  const manifest = await getRemoteCommandsManifest(
    path.resolve(currentDirectory, "remote-commands.json")
  );

  if (env.CLEAR_REMOTE_COMMANDS_CACHE) {
    await fs.rm(modulesDirectory, { force: true, recursive: true });
  }

  program
    .name("mcli")
    .description(
      "A proof-of-concept of a modular CLI that lazy-loads commands over the network"
    )
    .version("1.0.0");

  const queue = Object.entries(manifest).map(
    async ([moduleNameAndVersion, moduleDefinition]) => {
      const separator = moduleNameAndVersion.lastIndexOf("@");
      const name = moduleNameAndVersion.slice(0, separator);
      const version = moduleNameAndVersion.slice(separator + 1);

      if (!env.IGNORE_LOCAL_MODULES) {
        try {
          const mod = (await import(name)) as CommandDefinition;

          return registerCommand({
            app: program,
            metadata: mod.metadata,
            handler: mod.handler,
            moduleName: name,
            moduleVersion: version
          });
        } catch {}
      }

      return registerCommand({
        app: program,
        metadata: moduleDefinition,
        moduleName: name,
        moduleVersion: version
      });
    }
  );

  await Promise.all(queue);

  program.parse();
};
