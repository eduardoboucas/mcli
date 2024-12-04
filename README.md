# mcli

A proof-of-concept of a [commander](https://www.npmjs.com/package/commander)-based CLI that supports lazy-loaded commands, which are downloaded only if and when the comand is used.

This pattern lets you have a small shell that is then augmented on-demand with the functionality needed by each consumer.

## Development

This is a monorepo with the CLI core and the different commands published as separate packages.

To get started, run `npm install` and `npm run build -ws` to install the dependencies and build the different packages.

To use the CLI, run `./packages/core/bin.mjs <command>`. There are a couple of environment variables you can use to control the behaviour of the remote commands:

- `CLEAR_REMOTE_COMMANDS_CACHE`: Deletes any remote commands cached locally, forcing the CLI to pull them over the network.
- `IGNORE_LOCAL_MODULES`: By default, the CLI will first try to resolve modules locally before fetching them from the network or the module cache. This is useful for local development. Setting this flag will bypass this mechanism and actually get the remote modules from production.
