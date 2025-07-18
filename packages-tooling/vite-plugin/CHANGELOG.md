# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

<a name="2.0.0-beta.25"></a>
# 2.0.0-beta.25 (2025-07-10)

### Bug Fixes:

* **vite:** detect production build mode better (#2194) ([e483a92](https://github.com/aurelia/aurelia/commit/e483a92))

<a name="2.0.0-beta.24"></a>
# 2.0.0-beta.24 (2025-04-27)

### Refactorings:

* **vite-plugin:** update vite package to latest v6 (#2147) ([5834d05](https://github.com/aurelia/aurelia/commit/5834d05))
* ***:** remove controller host (#2128) ([402c746](https://github.com/aurelia/aurelia/commit/402c746))

<a name="2.0.0-beta.23"></a>
# 2.0.0-beta.23 (2025-01-26)

### Features:

* **tooling:** type-checking for templates - Phase1 (#2066) ([ebc1d0c](https://github.com/aurelia/aurelia/commit/ebc1d0c))


### Bug Fixes:

* **hmr:** disposed controllers to avoid memory leak issues (#2090) ([2eac93f](https://github.com/aurelia/aurelia/commit/2eac93f))
* **hmr:** disposed controllers to avoid memory leak issues ([2eac93f](https://github.com/aurelia/aurelia/commit/2eac93f))
* **vite/hmr:** controller memory leak ([2eac93f](https://github.com/aurelia/aurelia/commit/2eac93f))

<a name="2.0.0-beta.22"></a>
# 2.0.0-beta.22 (2024-09-30)

**Note:** Version bump only for package @aurelia/vite-plugin

<a name="2.0.0-beta.21"></a>
# 2.0.0-beta.21 (2024-08-08)

### Bug Fixes:

* **vite-plugin:** fix vitest Windows issue with html file (#2006) ([27ec4dd](https://github.com/aurelia/aurelia/commit/27ec4dd))

<a name="2.0.0-beta.20"></a>
# 2.0.0-beta.20 (2024-07-07)

**Note:** Version bump only for package @aurelia/vite-plugin

<a name="2.0.0-beta.19"></a>
# 2.0.0-beta.19 (2024-06-12)

**Note:** Version bump only for package @aurelia/vite-plugin

<a name="2.0.0-beta.18"></a>
# 2.0.0-beta.18 (2024-05-23)

**Note:** Version bump only for package @aurelia/vite-plugin

<a name="2.0.0-beta.17"></a>
# 2.0.0-beta.17 (2024-05-11)

**Note:** Version bump only for package @aurelia/vite-plugin

<a name="2.0.0-beta.16"></a>
# 2.0.0-beta.16 (2024-05-03)

### Refactorings:

* ***:** extract template compiler into own package (#1954) ([ad7ae1e](https://github.com/aurelia/aurelia/commit/ad7ae1e))

<a name="2.0.0-beta.15"></a>
# 2.0.0-beta.15 (2024-04-17)

### Bug Fixes:

* ***:** residual decorator work (#1942) ([7e8c12f](https://github.com/aurelia/aurelia/commit/7e8c12f))
* **vite-plugin:** missed some default options in "load" preprocess (#1936) ([794f3c6](https://github.com/aurelia/aurelia/commit/794f3c6))
* **vite-plugin:** when using ShadowDOM, need to load css as string (#1934) ([32e8cc1](https://github.com/aurelia/aurelia/commit/32e8cc1))


### Refactorings:

* **expression-parser:** move exp parser to its own package (#1943) ([6e7dcad](https://github.com/aurelia/aurelia/commit/6e7dcad))
* ***:** migration to TC39 decorators + metadata simplification (#1932) ([22f90ad](https://github.com/aurelia/aurelia/commit/22f90ad))

<a name="2.0.0-beta.14"></a>
# 2.0.0-beta.14 (2024-04-03)

### Features:

* **i18n:** support multiple versions of i18next (#1927) ([0789ee5](https://github.com/aurelia/aurelia/commit/0789ee5))

<a name="2.0.0-beta.13"></a>
# 2.0.0-beta.13 (2024-03-15)

### Features:

* **convention:** add import as support (#1920) ([7a15551](https://github.com/aurelia/aurelia/commit/7a15551))
* **di:** api to register resources with alias key ([7a15551](https://github.com/aurelia/aurelia/commit/7a15551))
* **dev:** better DI error messages for instantiation (#1917) ([2fca6ea](https://github.com/aurelia/aurelia/commit/2fca6ea))


### Refactorings:

* **runtime:** move ctor reg into controller ([7a15551](https://github.com/aurelia/aurelia/commit/7a15551))

<a name="2.0.0-beta.12"></a>
# 2.0.0-beta.12 (2024-03-02)

**Note:** Version bump only for package @aurelia/vite-plugin

<a name="2.0.0-beta.11"></a>
# 2.0.0-beta.11 (2024-02-13)

**Note:** Version bump only for package @aurelia/vite-plugin

<a name="2.0.0-beta.10"></a>
# 2.0.0-beta.10 (2024-01-26)

### Refactorings:

* **enums:** string literal types in favour of const enums (#1870) ([e21e0c9](https://github.com/aurelia/aurelia/commit/e21e0c9))

<a name="2.0.0-beta.9"></a>
# 2.0.0-beta.9 (2023-12-12)

### Features:

* **vite:** allow all the options to be passed for the plugin (#1830) ([3d87341](https://github.com/aurelia/aurelia/commit/3d87341))

<a name="2.0.0-beta.8"></a>
# 2.0.0-beta.8 (2023-07-24)

### Refactorings:

* **ref:** deprecate view-model.ref and introduce component.ref (#1803) ([97e8dad](https://github.com/aurelia/aurelia/commit/97e8dad))

<a name="2.0.0-beta.7"></a>
# 2.0.0-beta.7 (2023-06-16)

**Note:** Version bump only for package @aurelia/vite-plugin

<a name="2.0.0-beta.6"></a>
# 2.0.0-beta.6 (2023-05-21)

**Note:** Version bump only for package @aurelia/vite-plugin

<a name="2.0.0-beta.5"></a>
# 2.0.0-beta.5 (2023-04-27)

### Bug Fixes:

* **plugin-conventions:** ensure esm cjs compat (#1751) ([f808503](https://github.com/aurelia/aurelia/commit/f808503))

<a name="2.0.0-beta.4"></a>
# 2.0.0-beta.4 (2023-04-13)

### Features:

* **vite-plugin:** add plugin for vite (#1726) ([564e533](https://github.com/aurelia/aurelia/commit/564e533))


### Bug Fixes:

* **vite-plugin:** optionally resolve alias, add preliminary doc (#1731) ([3f37f8d](https://github.com/aurelia/aurelia/commit/3f37f8d))
* **ci:** fix vite build in ci, upgrade chromedriver ([564e533](https://github.com/aurelia/aurelia/commit/564e533))


### Refactorings:

* **all:** upgrade rollup config files ([564e533](https://github.com/aurelia/aurelia/commit/564e533))

<a name="2.0.0-beta.3"></a>
# 2.0.0-beta.3 (2023-03-24)
