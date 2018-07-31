# Aurelia vNext

[![CircleCI](https://circleci.com/gh/aurelia/aurelia.svg?style=svg)](https://circleci.com/gh/aurelia/aurelia) [![codecov](https://codecov.io/gh/aurelia/aurelia/branch/master/graph/badge.svg)](https://codecov.io/gh/aurelia/aurelia)

Early work on Aurelia vNext...

## Progress

### Kernel

* [x] PAL
* [x] Reporting
* [x] Dependency Injection

### Runtime

#### Core

* [x] Task Queue
* [x] Resources
* [x] DOM

#### Application Model

* [x] Plugin Registration
* [x] SPA Startup

#### Binding

* [x] One Way
* [x] Two Way 
* [x] One Time
* [x] From View
* [x] Trigger
* [x] Delegate
* [x] Capture
* [x] Call
* [x] Ref
* [x] Style
* [x] Text
* [x] Value Converters
* [x] Binding Behaviors
* [x] Computed

#### Custom Elements

* [x] Properties
* [x] Binding
* [x] Bind Lifecycle
* [x] Attach Lifecycle
* [x] Fixed Views
* [x] Per-instance Views
* [x] No View
* [x] Containerless
* [x] Emulated ShadowDOM
* [x] Native ShadowDOM
* [x] HTML-Only Custom Elements
* [x] Template Part Replacement
* [x] `$children` and `$childrenChanged`
* [ ] Basic CSS 
* [ ] CSS Modules

#### Custom Attributes

* [x] Binding
* [x] Bind Lifecycle
* [x] Attach Lifecycle

#### Template Controllers

* [x] Binding
* [x] Bind Lifecycle
* [x] Attach Lifecycle
* [x] View Factories
* [x] View Slots
* [x] Plain Views
* [x] Linking
  * e.g. if/else and switch/case scenarios

#### Resources

* Value Converters
  * [x] `sanitize`
* Binding Behaviors
  * [x] `attr`
  * [x] `oneTime`
  * [x] `oneWay`
  * [x] `twoWay`
  * [x] `debounce`
  * [x] `throttle`
  * [x] `updateTrigger`
  * [x] `signal`
  * [x] `self`
* Template Controllers
  * [x] `if`
  * [x] `else`
  * [x] `replaceable`
  * [x] `with`
  * [x] `repeat`
* Custom Elements
  * [x] `compose`

### JIT

#### Binding

* [x] Expression Parser

#### Rendering

* [ ] Template Compiler

#### Application Model

* [ ] Progressive Enhancement

### AOT

#### Core

* Conventions
  * [ ] AOT
* Resource Descriptions
  * [x] JIT
  * [ ] AOT
* Single File Components
  * [ ] Parser

#### Compiler Plugins

* [ ] TypeScript
* [ ] Babel

#### Loader Plugins

* Require.js
  * [x] JIT
  * [ ] AOT
* [ ] System.js
  * [ ] JIT
  * [ ] AOT
* [ ] Parcel
* [ ] Webpack

### Debug

#### Core

* [x] Error Messages

#### Binding

* [x] Expression Unparsing

#### Task Queue

* [x] Long Stack Traces

### Plugins

#### SVG

* [x] Binding to SVG Elements

## Build and Test

-----------------------------------

### Note (2018-07-31): The instructions below ("Running the Default Demo" and further) are out of date at the moment and will be updated as soon as all workflows are adjusted to the new monorepo.

To get everything ready:
- `npm ci` (npm 6+ is required for this)
- `npm run bootstrap`
- `npm run build`

To run all the tests:
- `npm run test`

To run individual tests:
- `cd packages/runtime`
- `npm run test`

-----------------------------------

### Running the Default Demo

To test the sample application:

* Install the `aurelia-cli` globally with `npm install -g aurelia-cli`
* Install the project dependencies with `npm install`
* Run the application with `au run --watch`

### Running the Unit Tests

* Single run

```shell
npm run karma
```

* Watch mode

```shell
npm run karma-watch
```

#### Debugging the Unit Tests from VS Code:

```shell
npm run karma-debug
```

- When karma is running, press the `DEBUG` button in the browser (will open a new tab);
- In VS Code start the debugger `Attach Karma Chrome`
- When prompted to select which tab, select `DEBUG`
- In VS Code, set a breakpoint in a `.ts` source file (src or test)
- `ctrl+s` / save to trigger a recompile (works even if there are no changes)
- Refresh the chrome `DEBUG` tab
- Your breakpoint should now be hit

By default no coverage is generated in debug mode.


#### Custom Options (defaults are shown)

```shell
npm run karma -- --transpile-only=true --no-info=true --coverage=true --tsconfig=tsconfig-karma.json
```

For all standard karma options, see `karma start --help`

Installed browser plugins: `Chrome,ChromeHeadless,Firefox,InternetExplorer`

To see the generated test coverage, open `coverage/index.html` in a browser.
