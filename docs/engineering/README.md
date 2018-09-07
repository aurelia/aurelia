# Engineering Documentation

These docs cover more detailed aspects of Aurelia which are useful for those implementing framework features and fixing bugs.

- [Building and Testing](#building-and-testing)
- [Development setup (TDD)](#development-setup-tdd)
- [Cross-package development workflow (TDD)](#cross-package-development-workflow-tdd)
- [Development setup (manual browser testing)](#development-setup-manual-browser-testing)
- [Cross-package development workflow (manual browser testing)](#cross-package-development-workflow-manual-browser-testing)
- [Setup + workflow (TDD + manual browser testing)](#setup-workflow-tdd-manual-browser-testing)
- [Speeding up the TDD workflow](#speeding-up-the-tdd-workflow)

## Building and testing

In order to build Aurelia, ensure that you have [Git](https://git-scm.com/downloads), the latest LTS version of [Node.js](https://nodejs.org/) and `npm@6.0.0` or higher installed.

Clone a copy of the repo:

```bash
git clone https://github.com/aurelia/aurelia.git
```

Change to the aurelia directory:

```bash
cd aurelia
```

Install dev dependencies:

```bash
npm ci
```

Install/symlink package dependencies:

```bash
npm run bootstrap # just like npm ci, this command only needs to be run once
```


From inside the top-level folder, use one of the following to build and test:

> These commands are also available from inside a specific package folder.

```
npm run build         # Build all packages for the amd/commonjs module systems into their respective dist/umd folders
npm run dev           # Same as npm run build, but in "--watch" mode (useful for refreshing cross-package typings while developing)
npm run build-all     # Same as npm run build, but for multiple module systems (only needed when publishing)
npm run test          # Runs unit tests for all packages (you do not need to build first)
npm run test:watch    # Same as npm run test, but in "--watch" mode
npm run lint          # Runs tslint for all packages
npm run publish:local # Runs npm pack for all packages
```

When running these commands from inside the top-level folder, they will call lerna to run the respective command for all packages. When running them from inside a specific package folder, the command will run for just that package.

You can also run a command for only a specific page from the top-level folder by using --scope, e.g. `npm run test:watch -- --scope=@aurelia/runtime`

A few commands are only available from inside a specific package folder:

```
npm run test:debugger # Runs unit tests in "--watch" mode and opens a chrome browser window for debugging
npm run build:es2015  # Builds the package output for the es2015 module system into dist/es2015
npm run build:esnext  # Builds the package output for the esnext module system into dist/esnext
npm run build:system  # Builds the package output for the systemjs module system into dist/system
npm run build:umd     # Builds the package output for the amd/commonjs module systems into dist/umd
```



## Development setup (TDD)

- Clone this repo
- Run `npm ci && npm run bootstrap && npm run build`

> You can now open the folder in VS Code without seeing red squiggles everywhere.

## Cross-package development workflow (TDD)

Open 3 shell prompts.

### In prompt #1:

```bash
npm run dev
```
> This is primarily to keep refreshing the typings, so changes in runtime would be reflected in jit (after a few seconds)

### In prompt #2:

```bash
npm run test:watch
```

> This runs *all* tests. Keep it somewhere in the background for the occasional check that downstream packages are still working

### In prompt #3:

Go to the package folder you want to develop, e.g.:

```bash
cd packages && cd runtime
```

Followed by:

```bash
npm run test:debugger -- --bail
```

> This runs just the tests for the runtime in --watch mode. It also opens a browser window for debugging and stops further execution when one test fails. Note that a failing test in --bail mode will not report an error to the local console, but you can see the error (and stack trace) in the browser console.

In the browser window press the "DEBUG" button in the upper-right corner.

Then in VS Code, go to "Debug" and run the launch task "Attach Karma Chrome". Attach it to the browser window named "Karma DEBUG RUNNER".

In VS Code / Debug, under "BREAKPOINTS", check "All Exceptions".

Testing framework scripts are already blackboxed via the launch file. You will now be able te easily debug uncaught exceptions automatically, or failed assertions by setting a breakpoint in the unit test.

## Development setup (manual browser testing)

Ensure that you have the latest LTS version of [Node.js](https://nodejs.org/) and `npm@6.0.0` or higher installed.

- Clone this repo
- Run `npm ci && npm run bootstrap && npm run build`
- Run `cd packages && cd examples && cd jit-browserify && npm ci`

## Cross-package development workflow (manual browser testing)

Open 2 shell prompts.

### In prompt #1:

```bash
npm run dev
```
> Apart from refreshing the typings, this also triggers the example you'll run (in watch mode) to rebuild with your changes

### In prompt #2:

```bash
cd packages && cd examples && cd jit-browserify && npm run serve
```

> This will open a browser window with the built example. Any changes you make in any of the packages should automatically trigger a rebuild, but may not necessarily trigger a reload (do a manual refresh just in case)

## Setup + workflow (TDD + manual browser testing)

Some stuff is easier to develop/debug with unit tests (especially well-isolated low level APIs), but other things are easier with manual browser testing (such as complex interactions that don't have good unit test coverage yet).

You can also combine the two. In general everything runs fine in parallel.

Open 4 shell prompts, follow steps 1-3 from the TDD workflow and add step 2 from the manual browser testing workflow to the 4th prompt.

## Speeding up the TDD workflow

There are a lot of tests and they take a while to run. When developing a new feature from scratch this can be quite unproductive. A few tips to improve this:

- Run `npm run test:debugger -- --bail` -> the first error will cause further processing to stop. The error won't be reported to the system console but it will be logged in the browser console.
- Tests are run in alphabetical order, from top-level to lower level. So if you want your test to run first, put the file directly under `test/unit` and name the file `aa.ts` for example. When you're done, rename and move it to the appropriate place.
- Add a failing test at the end of your file so your local `npm run test:debugger -- --bail` mode won't run the other thousands of tests that come after it, but the top-level `npm run test:watch` will still run all tests from all packages, giving you the option to verify them on occasion.

As an alternative to the above (if you just want to run one specific test or suite at all), simply change `describe(` to `describe.only(`. This works at any level and also works for `it(`
