import type { Command } from "commander";

import { getRemoteModule } from "./download.js";

export interface CommandArgument {
  name: string;
  description: string;
}

export interface CommandOptions {
  flags: string;
  description: string;
  defaultValue?: string | boolean | string[];
}

export interface CommandMetadata {
  commandName: string;
  description: string;
  arguments: CommandArgument[];
  options: CommandOptions[];
}

export interface CommandDefinition {
  handler: (...args: any[]) => Promise<void>;
  metadata: CommandMetadata;
}

interface RegisterCommandOptions {
  app: Command;
  metadata: CommandMetadata;
  moduleName: string;
  moduleVersion: string;
  handler?: CommandDefinition["handler"];
}

export const registerCommand = async ({
  app,
  metadata,
  moduleName,
  moduleVersion,
  handler
}: RegisterCommandOptions) => {
  let command = app
    .command(metadata.commandName)
    .description(metadata.description);

  for (const { name, description } of metadata.arguments) {
    command = command.argument(name, description);
  }

  for (const { flags, description, defaultValue } of metadata.options) {
    command = command.option(flags, description, defaultValue);
  }

  if (handler) {
    command = command.action(handler);
  } else {
    command = command.action(async (...args) => {
      const mod = await getRemoteModule(moduleName, moduleVersion);

      return mod.handler(...args);
    });
  }

  return command;
};
