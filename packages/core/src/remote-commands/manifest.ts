import fs from "node:fs/promises";

import { CommandMetadata } from "./index.js";

type RemoteCommandsManifest = Record<string, CommandMetadata>;

export const getRemoteCommandsManifest = async (manifestPath: string) => {
  try {
    const file = await fs.readFile(manifestPath, "utf8");

    return JSON.parse(file) as RemoteCommandsManifest;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }

  return {};
};
