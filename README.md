# plugin-gen-sobj-defs

[![NPM](https://img.shields.io/npm/v/@zenibako/plugin-gen-sobj-defs.svg?label=@zenibako/plugin-gen-sobj-defs)](https://www.npmjs.com/package/@zenibako/plugin-gen-sobj-defs) [![Downloads/week](https://img.shields.io/npm/dw/@zenibako/plugin-gen-sobj-defs.svg)](https://npmjs.org/package/@zenibako/plugin-gen-sobj-defs) [![License](https://img.shields.io/badge/License-Apache--2.0-blue.svg)](https://opensource.org/license/apache-2-0)

## About

A Salesforce CLI plugin that generates or refreshes local SObject definitions (faux Apex classes) for code completion in your IDE. These definitions provide IntelliSense and type checking when working with Salesforce objects in your code.

The plugin connects to your Salesforce org, fetches SObject metadata, and generates Apex class representations that include all fields with proper type mappings. The generated files are placed in `.sfdx/tools/sobjects/` directory of your Salesforce project.

## Install

```bash
sf plugins install @zenibako/plugin-gen-sobj-defs@x.y.z
```

## Issues

Please report any issues at https://github.com/zenibako/plugin-gen-sobj-defs/issues

## Contributing

1. Please read our [Code of Conduct](CODE_OF_CONDUCT.md)
2. Create a new issue before starting your project so that we can keep track of
   what you are trying to add/fix. That way, we can also offer suggestions or
   let you know if there is already an effort in progress.
3. Fork this repository.
4. [Build the plugin locally](#build)
5. Create a _topic_ branch in your fork. Note, this step is recommended but technically not required if contributing using a fork.
6. Edit the code in your fork.
7. Write appropriate tests for your changes. Try to achieve at least 95% code coverage on any new code. No pull request will be accepted without unit tests.
8. Send us a pull request when you are done. We'll review your code, suggest any needed changes, and merge it in.

### Build

To build the plugin locally, make sure to have yarn installed and run the following commands:

```bash
# Clone the repository
git clone git@github.com:zenibako/plugin-gen-sobj-defs

# Install the dependencies and compile
yarn && yarn build
```

To use your plugin, run using the local `./bin/dev` or `./bin/dev.cmd` file.

```bash
# Run using local run file.
./bin/dev sobject refresh definitions
```

There should be no differences when running via the Salesforce CLI or using the local run file. However, it can be useful to link the plugin to do some additional testing or run your commands from anywhere on your machine.

```bash
# Link your plugin to the sf cli
sf plugins link .
# To verify
sf plugins
```

## Commands

<!-- commands -->

- [`sf sobject refresh definitions`](#sf-sobject-refresh-definitions)

## `sf sobject refresh definitions`

Refresh SObject definitions for your org.

```
USAGE
  $ sf sobject refresh definitions -o <value> [--json] [--flags-dir <value>] [--sobject-category all|custom|standard]
    [--api-version <value>]

FLAGS
  -o, --target-org=<value>           (required) Username or alias of the target org
      --api-version=<value>          Override the API version used for the connection
      --sobject-category=<option>    [default: all] The category of SObjects to refresh
                                     <options: all|custom|standard>

GLOBAL FLAGS
  --flags-dir=<value>  Import flag values from a directory.
  --json               Format output as json.

DESCRIPTION
  Refresh SObject definitions for your org

  Generates or refreshes local SObject definitions (faux classes) for code completion in your IDE. These definitions
  help with IntelliSense and type checking when working with Salesforce objects in your code.

  You can choose to refresh all SObjects, only custom objects, or only standard objects. The command connects to your
  default org and fetches the latest SObject metadata.

EXAMPLES
  Refresh all SObject definitions:

    $ sf sobject refresh definitions

  Refresh only custom SObject definitions:

    $ sf sobject refresh definitions --sobject-category custom

  Refresh only standard SObject definitions:

    $ sf sobject refresh definitions --sobject-category standard
```

_See code: [src/commands/sobject/refresh/definitions.ts](https://github.com/zenibako/plugin-gen-sobj-defs/blob/1.1.73/src/commands/sobject/refresh/definitions.ts)_

<!-- commandsstop -->
