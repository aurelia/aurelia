# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

<a name="0.4.0"></a>
# 0.4.0 (2019-10-26)

### Bug Fixes:

* **svg-analyzer:** fix runtime reference ([6e60798](https://github.com/aurelia/aurelia/commit/6e60798))


### Performance Improvements:

* **all): add sideEffect:** false for better tree shaking ([59b5e55](https://github.com/aurelia/aurelia/commit/59b5e55))
* **all:** pre-declare variables used in loops ([16b9c18](https://github.com/aurelia/aurelia/commit/16b9c18))


### Refactorings:

* ***:** linting fixes ([a9e26ad](https://github.com/aurelia/aurelia/commit/a9e26ad))
* **svg-analyzer:** use document instead of DOM for html browser specific code ([52427aa](https://github.com/aurelia/aurelia/commit/52427aa))
* **plugin-svg:** strictNullChecks fixes ([63b8a15](https://github.com/aurelia/aurelia/commit/63b8a15))
* ***:** standardise on "as" type casts ([d0933b8](https://github.com/aurelia/aurelia/commit/d0933b8))

<a name="0.3.0"></a>
# 0.3.0 (2018-10-12)

**Note:** Version bump only for package @aurelia/plugin-svg

<a name="0.2.0"></a>
# 0.2.0 (2018-09-18)

### Features:

* **observers:** auto-enable collection observers and make the toggles idempotent ([d6a10b5](https://github.com/aurelia/aurelia/commit/d6a10b5))


### Bug Fixes:

* **examples:** correct versions ([1b7c764](https://github.com/aurelia/aurelia/commit/1b7c764))
* **tsconfig:** correct extends path ([797674f](https://github.com/aurelia/aurelia/commit/797674f))
* **jit-parcel:** remove else for now, fix instructions ([d6a10b5](https://github.com/aurelia/aurelia/commit/d6a10b5))
* **template-compiler:** wrap the nodes in a fragment ([d6a10b5](https://github.com/aurelia/aurelia/commit/d6a10b5))
* **jit-parcel:** remove path mappings from tsconfig ([d6a10b5](https://github.com/aurelia/aurelia/commit/d6a10b5))
* **template-compiler:** use firstElementChild instead of wrapper ([d6a10b5](https://github.com/aurelia/aurelia/commit/d6a10b5))
* **template-compiler:** various small tweaks and fixes, make example work ([d6a10b5](https://github.com/aurelia/aurelia/commit/d6a10b5))
* **jit-parcel:** make the example work with something simple ([d6a10b5](https://github.com/aurelia/aurelia/commit/d6a10b5))
* **aurelia:** set isStarted=true after tasks have finished ([d6a10b5](https://github.com/aurelia/aurelia/commit/d6a10b5))
* **e2e:** move publish into e2e job ([d6a10b5](https://github.com/aurelia/aurelia/commit/d6a10b5))
* **ci:** fix typo ([d6a10b5](https://github.com/aurelia/aurelia/commit/d6a10b5))
* **ci:** set the correct path before each cmd ([d6a10b5](https://github.com/aurelia/aurelia/commit/d6a10b5))
* **ci:** try a different approach for the workspaces ([d6a10b5](https://github.com/aurelia/aurelia/commit/d6a10b5))
* **kernel:** scripts working ([9302580](https://github.com/aurelia/aurelia/commit/9302580))
* **all:** lots of path fixes and a few typing fixes, make sure everything builds correctly ([9302580](https://github.com/aurelia/aurelia/commit/9302580))
* **test:** make all the tests run via lerna ([9302580](https://github.com/aurelia/aurelia/commit/9302580))
