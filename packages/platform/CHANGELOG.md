# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

<a name="2.0.0-alpha.25"></a>
# 2.0.0-alpha.25 (2022-03-08)

**Note:** Version bump only for package @aurelia/platform

<a name="2.0.0-alpha.24"></a>
# 2.0.0-alpha.24 (2022-01-18)

**Note:** Version bump only for package @aurelia/platform

<a name="2.0.0-alpha.23"></a>
# 2.0.0-alpha.23 (2021-11-22)

**Note:** Version bump only for package @aurelia/platform

<a name="2.0.0-alpha.22"></a>
# 2.0.0-alpha.22 (2021-10-24)

**Note:** Version bump only for package @aurelia/platform

<a name="2.0.0-alpha.21"></a>
# 2.0.0-alpha.21 (2021-09-12)

**Note:** Version bump only for package @aurelia/platform

<a name="2.0.0-alpha.20"></a>
# 2.0.0-alpha.20 (2021-09-04)

**Note:** Version bump only for package @aurelia/platform

<a name="2.0.0-alpha.19"></a>
# 2.0.0-alpha.19 (2021-08-29)

**Note:** Version bump only for package @aurelia/platform

<a name="2.0.0-alpha.18"></a>
# 2.0.0-alpha.18 (2021-08-22)

**Note:** Version bump only for package @aurelia/platform

<a name="2.0.0-alpha.17"></a>
# 2.0.0-alpha.17 (2021-08-16)

### Refactorings:

* **platform:** smaller props setup ([079e820](https://github.com/aurelia/aurelia/commit/079e820))
* **task-queue:** mark private with _, remove tracer on nno-dev ([1dfaa13](https://github.com/aurelia/aurelia/commit/1dfaa13))

<a name="2.0.0-alpha.16"></a>
# 2.0.0-alpha.16 (2021-08-07)

### Refactorings:

* **all:** use a terser name cache for predictable prop mangling ([7649ced](https://github.com/aurelia/aurelia/commit/7649ced))

<a name="2.0.0-alpha.15"></a>
# 2.0.0-alpha.15 (2021-08-01)

**Note:** Version bump only for package @aurelia/platform

<a name="2.0.0-alpha.14"></a>
# 2.0.0-alpha.14 (2021-07-25)

**Note:** Version bump only for package @aurelia/platform

<a name="2.0.0-alpha.13"></a>
# 2.0.0-alpha.13 (2021-07-19)

**Note:** Version bump only for package @aurelia/platform

<a name="2.0.0-alpha.12"></a>
# 2.0.0-alpha.12 (2021-07-11)

**Note:** Version bump only for package @aurelia/platform

<a name="2.0.0-alpha.11"></a>
# 2.0.0-alpha.11 (2021-07-11)

### Bug Fixes:

* **call-binding:** assign args to event property, fixes #1231 ([fa4c0d4](https://github.com/aurelia/aurelia/commit/fa4c0d4))

<a name="2.0.0-alpha.10"></a>
# 2.0.0-alpha.10 (2021-07-04)

**Note:** Version bump only for package @aurelia/platform

<a name="2.0.0-alpha.9"></a>
# 2.0.0-alpha.9 (2021-06-25)

**Note:** Version bump only for package @aurelia/platform

<a name="2.0.0-alpha.8"></a>
# 2.0.0-alpha.8 (2021-06-22)

**Note:** Version bump only for package @aurelia/platform

<a name="2.0.0-alpha.7"></a>
# 2.0.0-alpha.7 (2021-06-20)

**Note:** Version bump only for package @aurelia/platform

<a name="2.0.0-alpha.6"></a>
# 2.0.0-alpha.6 (2021-06-11)

**Note:** Version bump only for package @aurelia/platform

<a name="2.0.0-alpha.5"></a>
# 2.0.0-alpha.5 (2021-05-31)

**Note:** Version bump only for package @aurelia/platform

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

