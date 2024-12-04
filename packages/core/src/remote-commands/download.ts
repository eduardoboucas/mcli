import { createWriteStream } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";
import { Readable } from "node:stream";
import { finished } from "node:stream/promises";

import envPaths from "env-paths";
import * as tar from "tar";

import { CommandDefinition } from "./index.js";

export const modulesDirectory = path.resolve(
  envPaths("mcli").data,
  "remote-commands"
);

export const fetchModule = async (
  name: string,
  version: string,
  destPath: string
) => {
  const writer = createWriteStream(destPath, {
    flags: "wx"
  });
  const nameWithoutScope = name.split("/").pop();
  const tarballURL = `https://registry.npmjs.org/${name}/-/${nameWithoutScope}-${version}.tgz`;
  const res = await fetch(tarballURL);

  if (res.body === null || res.status < 200 || res.status > 299) {
    throw new Error(
      `Download from ${tarballURL} failed with status code ${res.status}`
    );
  }

  return finished(
    // @ts-expect-error
    Readable.fromWeb(res.body).pipe(writer)
  );
};

export const getPathToMainFile = async (moduleDirectory: string) => {
  const packagePath = path.join(moduleDirectory, "package");
  const packageJSONPath = path.join(packagePath, "package.json");

  try {
    const file = await fs.readFile(packageJSONPath, "utf8");
    const data = JSON.parse(file);

    if (typeof data.main !== "string" || !data.main) {
      throw new Error(`Invalid package.json file at ${packageJSONPath}`);
    }

    return path.resolve(packagePath, data.main);
  } catch (error) {
    throw new Error(`Could not read package.json file at ${packageJSONPath}`, {
      cause: error
    });
  }
};

export const hasRemoteModuleInCache = async (moduleDirectory: string) => {
  try {
    const stat = await fs.stat(moduleDirectory);

    if (stat.isDirectory()) {
      return true;
    }

    throw new Error(`Path ${moduleDirectory} exists and it's not a directory`);
  } catch {}

  return false;
};

export const downloadRemoteModule = async (
  name: string,
  version: string,
  moduleDirectory: string
) => {
  await fs.mkdir(moduleDirectory, { recursive: true });

  const tmpDir = await fs.mkdtemp(path.join(tmpdir(), "mcli-download"));
  const tarballPath = path.join(tmpDir, `${name}@${version}.tgz`);

  await fs.mkdir(path.dirname(tarballPath), { recursive: true });

  console.log(`Downloading command ${name}...`);

  await fetchModule(name, version, tarballPath);

  await tar.x({
    C: moduleDirectory,
    f: tarballPath
  });

  await fs.rm(tarballPath, { force: true });
};

export const getRemoteModule = async (name: string, version: string) => {
  const moduleDirectory = path.resolve(modulesDirectory, `${name}@${version}`);

  if (!(await hasRemoteModuleInCache(moduleDirectory))) {
    await downloadRemoteModule(name, version, moduleDirectory);
  }

  const mainFile = await getPathToMainFile(moduleDirectory);
  const command = (await import(mainFile)) as CommandDefinition;

  return command;
};
