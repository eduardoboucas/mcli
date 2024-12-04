import type { CommandMetadata } from "@eduardoboucas/mcli";

export const handler = (str: string) => {
  console.log(
    str
      .split("")
      .map(() => "💩")
      .join("")
  );
};

export const metadata: CommandMetadata = {
  commandName: "emojify",
  description: "Replace every character in a string with a poop emoji",
  arguments: [
    {
      name: "string",
      description: "string to split"
    }
  ],
  options: []
};
