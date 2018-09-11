# Examples

This folder contains examples that showcase different ways to set up an Aurelia app. In most cases they also contain automated e2e (selenium) tests which are run by our CI as part of our test suites to help guarantee that everything works, and keeps working.

## Basic setup

Instead of npm packages, the examples directly reference the latest code in this repository, so the Aurelia framework code must be built before you can install or run them.

From the root of this project, simply run `npm run init`. This is a convenience wrapper for the following, in sequence:
```bash
npm ci
npm run bootstrap
npm run build
npm run publish:local # note: this is only needed for parcel/webpack bundlers due to dependency duplication issues
```

## Examples that currently work


- [dbmonster-a](dbmonster-a/README.md)
- [jit-aurelia-cli](jit-aurelia-cli/README.md)
- [jit-browserify](jit-browserify/README.md)

