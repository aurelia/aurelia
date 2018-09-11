# Packages

Each package gets its own folder and we use Lerna 3.0 to manage, build, test, and publish across all packages.

### Core Packages

| Package | Version | Dependencies |
|--------|-------|------------|
| [`@aurelia/kernel`](/packages/kernel) | [![npm](https://img.shields.io/npm/v/@aurelia/kernel.svg?maxAge=3600)](https://www.npmjs.com/package/@aurelia/kernel) | [![Dependency Status](https://david-dm.org/aurelia/aurelia.svg?path=packages/kernel)](https://david-dm.org/aurelia/aurelia?path=packages/kernel) |
| [`@aurelia/runtime`](/packages/runtime) | [![npm](https://img.shields.io/npm/v/@aurelia/runtime.svg?maxAge=3600)](https://www.npmjs.com/package/@aurelia/runtime) | [![Dependency Status](https://david-dm.org/aurelia/aurelia.svg?path=packages/runtime)](https://david-dm.org/aurelia/aurelia?path=packages/runtime) |
| [`@aurelia/jit`](/packages/jit) | [![npm](https://img.shields.io/npm/v/@aurelia/jit.svg?maxAge=3600)](https://www.npmjs.com/package/@aurelia/jit) | [![Dependency Status](https://david-dm.org/aurelia/aurelia.svg?path=packages/jit)](https://david-dm.org/aurelia/aurelia?path=packages/jit) |
| [`@aurelia/aot`](/packages/aot) | [![npm](https://img.shields.io/npm/v/@aurelia/aot.svg?maxAge=3600)](https://www.npmjs.com/package/@aurelia/aot) | [![Dependency Status](https://david-dm.org/aurelia/aurelia.svg?path=packages/aot)](https://david-dm.org/aurelia/aurelia?path=packages/aot) |

The Aurelia core framework can be broken down into 4 parts:

- [`@aurelia/kernel`](/packages/kernel) is the lowest level part of Aurelia and contains core interfaces and types, the basic platform abstractions, and the dependency injection system.
- [`@aurelia/runtime`](/packages/runtime) builds directly on top of the Kernel and provides the bare-metal runtime needed to execute an Aurelia application. This includes the binding engine, templating engine, component model, and application lifecycle management.
- [`@aurelia/jit`](/packages/jit) is capable of parsing binding expressions and compiling view templates. You only need to deploy it if you don't use the AOT module.
- [`@aurelia/aot`](/packages/aot) leverages the parsers and compilers inside the JIT module to pre-build all templates and bindings, doing work as part of your build process rather than at runtime in the browser.



### Other
| Package | Version | Dependencies |
|--------|-------|------------|
| [`@aurelia/debug`](/packages/debug) | [![npm](https://img.shields.io/npm/v/@aurelia/debug.svg?maxAge=3600)](https://www.npmjs.com/package/@aurelia/debug) | [![Dependency Status](https://david-dm.org/aurelia/aurelia.svg?path=packages/debug)](https://david-dm.org/aurelia/aurelia?path=packages/debug) |
| [`@aurelia/router`](/packages/router) | [![npm](https://img.shields.io/npm/v/@aurelia/router.svg?maxAge=3600)](https://www.npmjs.com/package/@aurelia/router) | [![Dependency Status](https://david-dm.org/aurelia/aurelia.svg?path=packages/router)](https://david-dm.org/aurelia/aurelia?path=packages/router) |

[`@aurelia/debug`](/packages/debug) enables detailed error messages, richer stack trace information, and other debug-time instrumentation and tooling.

### Plugins

| Package | Version | Dependencies |
|--------|-------|------------|
| [`@aurelia/plugin-requirejs`](/packages/plugin-requirejs) | [![npm](https://img.shields.io/npm/v/@aurelia/plugin-requirejs.svg?maxAge=3600)](https://www.npmjs.com/package/@aurelia/plugin-requirejs) | [![Dependency Status](https://david-dm.org/aurelia/aurelia.svg?path=packages/plugin-requirejs)](https://david-dm.org/aurelia/aurelia?path=packages/plugin-requirejs) |
| [`@aurelia/plugin-svg`](/packages/plugin-svg) | [![npm](https://img.shields.io/npm/v/@aurelia/plugin-svg.svg?maxAge=3600)](https://www.npmjs.com/package/@aurelia/plugin-svg) | [![Dependency Status](https://david-dm.org/aurelia/aurelia.svg?path=packages/plugin-svg)](https://david-dm.org/aurelia/aurelia?path=packages/plugin-svg) |

