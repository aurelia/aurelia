# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

<a name="0.3.0"></a>
# 0.3.0 (2018-10-12)

**Note:** Version bump only for package @aurelia/plugin-requirejs

<a name="0.2.0"></a>
# 0.2.0 (2018-09-18)

### Features:

* **observers:** auto-enable collection observers and make the toggles idempotent ([d6a10b5](https://github.com/aurelia/aurelia/commit/d6a10b5))
* **jit:** implement interpolation & iterator (with destructuring) parsing ([8ab2173](https://github.com/aurelia/aurelia/commit/8ab2173))
* **ast:** initial implementation of ForOfStatement for iterating different collection types ([8ab2173](https://github.com/aurelia/aurelia/commit/8ab2173))
* **ast:** add metadata to the AST for ExpressionKind ([8ab2173](https://github.com/aurelia/aurelia/commit/8ab2173))
* **jit:** initial skeleton for customizeable binding commands ([8ab2173](https://github.com/aurelia/aurelia/commit/8ab2173))
* **jit:** simple first implementation for template-compiler ([8ab2173](https://github.com/aurelia/aurelia/commit/8ab2173))


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
* **all:** correct types/properties and fix unit tests ([8ab2173](https://github.com/aurelia/aurelia/commit/8ab2173))
* **template-compiler:** small fixes, setup first simple integration tests ([8ab2173](https://github.com/aurelia/aurelia/commit/8ab2173))
* **kernel:** scripts working ([9302580](https://github.com/aurelia/aurelia/commit/9302580))
* **all:** lots of path fixes and a few typing fixes, make sure everything builds correctly ([9302580](https://github.com/aurelia/aurelia/commit/9302580))
* **test:** make all the tests run via lerna ([9302580](https://github.com/aurelia/aurelia/commit/9302580))


### Refactorings:

* **jit:** merge attribute name/value parsers into template-compiler ([8ab2173](https://github.com/aurelia/aurelia/commit/8ab2173))
* **jit:** use IResourceDescriptions for looking up resources ([8ab2173](https://github.com/aurelia/aurelia/commit/8ab2173))
