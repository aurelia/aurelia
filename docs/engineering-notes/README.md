# Engineering Documentation

For initial instructions on setting up this repo, building, and running tests, see [building and testing Aurelia](../user-docs/6.%20community-contributions/4.%20building-and-testing-aurelia.md). Additional information can be found below but remember that these docs are a work in progress, so any information below is overridden by the most up to date documentation in the user documentation linked above.

----

These docs cover more detailed aspects of Aurelia which are useful for those implementing framework features and fixing bugs.

- [Building and Testing](#building-and-testing)

## Building and testing

In order to build Aurelia, ensure that you have [Git](https://git-scm.com/downloads), [Node.js](https://nodejs.org/) `v15.4.0` or higher, and `npm@7.0.0` or higher installed.

Run the following commands to clone, install and build:

```bash
git clone https://github.com/aurelia/aurelia.git && cd aurelia
npm ci
npm run build
```

### packages

Go to the tests folder:
```bash
cd packages/__tests__
```

To simply run all packages tests once, run one of the following commands:
```bash
npm run test-chrome # run all tests in chrome (headless), also reports code coverage
npm run test-firefox # run all tests in firefox (headless)
npm run test-node # run all tests in node
```

Please inspect the package.json to see the other commands.

This documentation will be expanded upon in the future.


### packages-tooling

To develop/test any of the tooling packages, we need to work around a limitation in NodeJS with regards to how it handles imports across esm/cjs packages.

Run this command to swap the local working directly completely to "commonjs" mode. This will change the `tsconfig.json` and `package.json` files for all packages, and these changes should not be checked in. They can be reverted again as soon as you're done working in commonjs mode.

```bash
npm run change-tsconfigs:cjs
npm run change-package-refs:release -- commonjs
```

Build once more to ensure all outputs are available in cjs:
```bash
npm run build
```

Go to the tests folder:
```bash
cd packages-tooling/__tests__
```

Run any of the test suites (please inspect the package.json to see the other commands):
```bash
npm run test-node # runs all cjs tests
```
