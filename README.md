[![NPM version](https://img.shields.io/npm/v/basisjs-tools-config.svg)](https://www.npmjs.com/package/basisjs-tools-config)

Adds `basis.config` support for [basisjs-tools](https://github.com/basisjs/basisjs-tools) commands.

## Usage

Module provide single function that extends `clap` command with `basis.config` support.

```js
var clap = require('clap');
var configSupport = require('basisjs-tools-config');

var command = clap.create('example');

// extend command
configSupport(command);
// or
command.extend(configSupport);
```

It adds two options to command:

- `-n, --no-config` – to prevent config using
- `-c, --config-file <filename>` - to specify path to config file

Also it adds `getConfig(options)` method to command that search and fetch config content if needed and `globalConfig` property to get global config content.

`getConfig(options)` usualy uses in command's `init` method and could accepts command options to decide is config should be fetched or not.

```js
// this call will search and fetch config content
var config = command.getConfig();

// but this call doesn't
var config = command.getConfig({ config: false });

// specify config location
var config = command.getConfig({ config: 'path/to/my.config' });
```

If config file doesn't found or could be parsed error outputs in console and exit process.

### Searching for config file

Extended command tries to find and use `basis.config` file by default. It attempts to find `basis.config` at the current working directory. If it's not found, then it moves to the parent directory, and so on, until the file system root is reached.

Besides `basis.config` module also check for `package.json`. Config may be stored with `basisjsConfig` key. If no `basisjsConfig` found then `package.json` ignores and searching is continue.

`basis.config` has higher priority

### basis.config

If `basis.config` found, it's content parses as `json`. Usualy properties treats as corresponding command options, and could be overridden by options in command line.

Any command's option could be declared in config, as it's long name. All option names should be camelize, i.e. `--css-pack` becomes `cssPack`. If flag contains `-no-`, it should be omited, i.e. `--no-color` becomes `color`.

You can disable `basis.config` usage by `--no-config` option or specify your own file with `-c` or `--config-file` option.

Config file useful to set up command's defaults option values.

Example of `basis.config` at `/path/to/config`:

```json
{
  "build": {
    "file": "app.html",
    "output": "build"
  },
  "server": {
    "port": 8123
  }
}
```

Config also can be stored in `package.json`:

```json
{
  "basisjsConfig": {
    "build": {
      "file": "app.html",
      "output": "build"
    },
    "server": {
      "port": 8123
    }
  }
}
```

> `basis.config` has higher priority. Config in `package.json` ignores if `basis.config` file exists.

In both cases doesn't matter at what directory you run `basis build` command, for example. File `/path/to/config/app.html` will be used for built and result will be put at `/path/to/config/output` directory. But you still able to override settings in config but using option with command, for example, if you run `basis build -o temp` at `/path/to/config/foo/bar` than result will be put at `/path/to/config/foo/bar/temp`.

### Relative path resolving

Basis works with many various paths, and often it is relative paths. There are two general rules for relative path resolving.

- path defined in config file (`basis.config`) resolves to config file location
- path defined in command line resolves to current working directory
