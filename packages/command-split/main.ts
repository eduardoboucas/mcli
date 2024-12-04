import type { CommandMetadata } from "@eduardoboucas/mcli";

export const handler = (str: string, options: Record<string, any>) => {
  const limit = options.first ? 1 : undefined;
  console.log(str.split(options.separator, limit));
};

export const metadata: CommandMetadata = {
  commandName: "split",
  description: "Split a string into substrings and display as an array",
  arguments: [
    {
      name: "string",
      description: "string to split"
    }
  ],
  options: [
    {
      flags: "-s, --separator <char>",
      description: "separator character",
      defaultValue: ","
    }
  ]
};
