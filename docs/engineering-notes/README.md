# Engineering Documentation

For initial instructions on setting up this repo, building, and running tests, see [building and testing Aurelia](../user-docs/community-contribution/building-and-testing-aurelia.md). Additional information can be found below but remember that these docs are a work in progress, so any information below is overridden by the most up to date documentation in the user documentation linked above.

----

These docs cover more detailed aspects of Aurelia which are useful for those implementing framework features and fixing bugs.

- [Building and Testing](#building-and-testing)

## Building and testing

In order to build Aurelia, ensure that you have [Git](https://git-scm.com/downloads), [Node.js](https://nodejs.org/) `v15.4.0` or higher, and `npm@7.0.0` or higher installed.

The tests for core packages are setup to run in 3 environments: browser (Chrome) / browser (Firefox) / Jsdom (Node). To target any of those environment specifically, do the following respectively from the `packages/__tests__` folder:

```
npm run test-chrome
npm run test-firefox
npm run test-node
```

This documentation will be expanded upon in the future.
