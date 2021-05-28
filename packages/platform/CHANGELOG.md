# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

<a name="2.0.0-alpha.4"></a>
# 2.0.0-alpha.4 (2021-05-25)

**Note:** Version bump only for package @aurelia/platform

<a name="2.0.0-alpha.3"></a>
# 2.0.0-alpha.3 (2021-05-19)

**Note:** Version bump only for package @aurelia/platform

<a name="2.0.0-alpha.2"></a>
# 2.0.0-alpha.2 (2021-03-07)

**Note:** Version bump only for package @aurelia/platform

<a name="2.0.0-alpha.1"></a>
# 2.0.0-alpha.1 (2021-03-03)

**Note:** Version bump only for package @aurelia/platform

<a name="2.0.0-alpha.0"></a>
# 2.0.0-alpha.0 (2021-03-02)

**Note:** Version bump only for package @aurelia/platform

<a name="0.9.0"></a>
# 0.9.0 (2021-01-31)

### Bug Fixes:

* **task-queue:** fix a yield bug ([7262479](https://github.com/aurelia/aurelia/commit/7262479))
* **platform:** let yield await async tasks ([576edba](https://github.com/aurelia/aurelia/commit/576edba))


### Refactorings:

* **all:** rename macroTaskQueue to taskQueue ([87c073d](https://github.com/aurelia/aurelia/commit/87c073d))

<a name="0.8.0"></a>
# 0.8.0 (2020-11-30)

### Features:

* **platform:** add performanceNow property ([3514e04](https://github.com/aurelia/aurelia/commit/3514e04))
* **platform:** add console property ([9c5cfd5](https://github.com/aurelia/aurelia/commit/9c5cfd5))
* **platform:** initial platform impl with WindowOrWorkerOrGlobalScope properties ([a978c3c](https://github.com/aurelia/aurelia/commit/a978c3c))


### Bug Fixes:

* **platform:** remove dom-specific type deps ([115666c](https://github.com/aurelia/aurelia/commit/115666c))
* **platform:** don't throw on initialization for missing functions ([5b00b79](https://github.com/aurelia/aurelia/commit/5b00b79))


### Refactorings:

* **obs:** don't use Proxy on platform ([f7882e0](https://github.com/aurelia/aurelia/commit/f7882e0))
* **all:** move scheduler implementation to platform ([e22285a](https://github.com/aurelia/aurelia/commit/e22285a))
* **all:** remove IDOM, HTMLDOM and DOM; replace DOM with PLATFORM ([6447468](https://github.com/aurelia/aurelia/commit/6447468))

