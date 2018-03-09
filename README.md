# experiment

An experimental re-working of Aurelia, oriented around compile-time reflection and code generation.

## Compiler

* [ ] View Precompilation:
  * [x] One Way Bindings
  * [x] Two Way Bindings
  * [x] From View Bindings
  * [x] Listener Bindings
  * [ ] Ref Bindings
  * [ ] Template Controllers
* [ ] AST
  * [x] Centralized AST Registry
  * [ ] Getter / Setter Methods
* [ ] Components
  * [x] Link view / view model
  * [ ] Single File Component
  * [ ] Lifecycle Optimization
  * [x] <import from="..." />

## Runtime

* [x] PAL
* [x] Logging
* [x] Task Queue
* [ ] Dependency Injection
* [x] One Way Bindings
* [x] Two Way Bindings
* [x] One Time Bindings
* [x] From View Bindings
* [x] Listener Bindings
* [x] Ref Bindings
* [x] Basic Components
* [x] Basic Attributes
* [x] Attach Lifecycle
* [ ] Bind Lifecycle (in-progress)
* [x] Basic Application Startup
* [x] Plain Views
* [ ] Content Projection
* [ ] Template Part Replacement
* [ ] CSS Modules
* [x] `if` Template Controller
* [x] `else` Template Controller
* [ ] `repeat` Template Controller
* [ ] `compose` Custom Element


## Building & Testing the Compiler

This project has a temporary dependency on `aurelia-path` and `aurelia-dependency-injection`. Those need to be manually `npm install`ed first.

* Build compiler

```shell
npm run build
```

* Test compiler

```shell
npm run test
```

* Build then test

```shell
npm run start
```

## Running the sample App

```shell
au run [--watch]
```

## Running the unit tests

* Single run

```shell
npm run karma
```

* Watch mode

```shell
npm run karma-watch
```

* Debug mode

```shell
npm run karma-debug
```

* Custom options (defaults are shown)

```shell
npm run karma -- --transpile-only=true --no-info=true --coverage=true --tsconfig=tsconfig-karma.json
```

For all standard karma options, see `karma start --help`

Installed browser plugins: `Chrome,ChromeHeadless,Firefox,InternetExplorer`

To see the generated test coverage, open `coverage/index.html` in a browser.
