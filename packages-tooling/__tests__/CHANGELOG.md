# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

<a name="2.0.0-beta.15"></a>
# 2.0.0-beta.15 (2024-04-17)

### Bug Fixes:

* ***:** residual decorator work (#1942) ([7e8c12f](https://github.com/aurelia/aurelia/commit/7e8c12f))


### Refactorings:

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


### Refactorings:

* **runtime:** move ctor reg into controller ([7a15551](https://github.com/aurelia/aurelia/commit/7a15551))

<a name="2.0.0-beta.12"></a>
# 2.0.0-beta.12 (2024-03-02)

**Note:** Version bump only for package @aurelia/__tests__

<a name="2.0.0-beta.11"></a>
# 2.0.0-beta.11 (2024-02-13)

### Bug Fixes:

* **convention:** no longer process shadowdom + <slot> (#1889) ([e29bbef](https://github.com/aurelia/aurelia/commit/e29bbef))

<a name="2.0.0-beta.10"></a>
# 2.0.0-beta.10 (2024-01-26)

**Note:** Version bump only for package @aurelia/__tests__

<a name="2.0.0-beta.9"></a>
# 2.0.0-beta.9 (2023-12-12)

### Bug Fixes:

* **dialog:** use startingZIndex (#1809) ([de79aea](https://github.com/aurelia/aurelia/commit/de79aea))


### Refactorings:

* **templating:** remove strict binding option from CE (#1807) ([7b4455f](https://github.com/aurelia/aurelia/commit/7b4455f))
* **tests:** move all under src folder ([7b4455f](https://github.com/aurelia/aurelia/commit/7b4455f))

<a name="2.0.0-beta.8"></a>
# 2.0.0-beta.8 (2023-07-24)

### Refactorings:

* **ref:** deprecate view-model.ref and introduce component.ref (#1803) ([97e8dad](https://github.com/aurelia/aurelia/commit/97e8dad))

<a name="2.0.0-beta.7"></a>
# 2.0.0-beta.7 (2023-06-16)

### Bug Fixes:

* **plugin-conventions:** fill up explicit .js/.ts dep filename in html module (#1752) ([17af0c8](https://github.com/aurelia/aurelia/commit/17af0c8))

<a name="2.0.0-beta.6"></a>
# 2.0.0-beta.6 (2023-05-21)

**Note:** Version bump only for package @aurelia/__tests__

<a name="2.0.0-beta.5"></a>
# 2.0.0-beta.5 (2023-04-27)

### Bug Fixes:

* **plugin-conventions:** ensure esm cjs compat (#1751) ([f808503](https://github.com/aurelia/aurelia/commit/f808503))

<a name="2.0.0-beta.4"></a>
# 2.0.0-beta.4 (2023-04-13)

### Features:

* **vite-plugin:** add plugin for vite (#1726) ([564e533](https://github.com/aurelia/aurelia/commit/564e533))


### Bug Fixes:

* **ci:** fix vite build in ci, upgrade chromedriver ([564e533](https://github.com/aurelia/aurelia/commit/564e533))


### Refactorings:

* **all:** upgrade rollup config files ([564e533](https://github.com/aurelia/aurelia/commit/564e533))
* ***:** remove unnecessary properties on PLATFORM (#1722) ([7cd77ad](https://github.com/aurelia/aurelia/commit/7cd77ad))

<a name="2.0.0-beta.3"></a>
# 2.0.0-beta.3 (2023-03-24)

**Note:** Version bump only for package @aurelia/__tests__

<a name="2.0.0-beta.2"></a>
# 2.0.0-beta.2 (2023-02-26)

**Note:** Version bump only for package @aurelia/__tests__

<a name="2.0.0-beta.1"></a>
# 2.0.0-beta.1 (2023-01-12)

**Note:** Version bump only for package @aurelia/__tests__

<a name="2.0.0-alpha.41"></a>
# 2.0.0-alpha.41 (2022-09-22)

### Refactorings:

* **binding:** move BindingMode to runtime-html (#1555) ([c75618b](https://github.com/aurelia/aurelia/commit/c75618b))

<a name="2.0.0-alpha.40"></a>
# 2.0.0-alpha.40 (2022-09-07)

**Note:** Version bump only for package @aurelia/__tests__

<a name="2.0.0-alpha.39"></a>
# 2.0.0-alpha.39 (2022-09-01)

**Note:** Version bump only for package @aurelia/__tests__

<a name="2.0.0-alpha.38"></a>
# 2.0.0-alpha.38 (2022-08-17)

**Note:** Version bump only for package @aurelia/__tests__

<a name="2.0.0-alpha.37"></a>
# 2.0.0-alpha.37 (2022-08-03)

**Note:** Version bump only for package @aurelia/__tests__

<a name="2.0.0-alpha.36"></a>
# 2.0.0-alpha.36 (2022-07-25)

### Features:

* **capture:** convention & deco shortcut (#1469) ([e89d3ad](https://github.com/aurelia/aurelia/commit/e89d3ad))
* **loader:** strip <capture> ([e89d3ad](https://github.com/aurelia/aurelia/commit/e89d3ad))
* **element:** capture decorator and <capture/> ([e89d3ad](https://github.com/aurelia/aurelia/commit/e89d3ad))


### Bug Fixes:

* **plugin-conventions:** skip ShadowDOM tag name check, leave it to runtime (#1464) ([20fccbf](https://github.com/aurelia/aurelia/commit/20fccbf))

<a name="2.0.0-alpha.35"></a>
# 2.0.0-alpha.35 (2022-06-08)

### Features:

* **ts-jest,babel-jest:** upgrade to jest v28 (#1449) ([b1ec85c](https://github.com/aurelia/aurelia/commit/b1ec85c))

<a name="2.0.0-alpha.34"></a>
# 2.0.0-alpha.34 (2022-06-03)

**Note:** Version bump only for package @aurelia/__tests__

<a name="2.0.0-alpha.33"></a>
# 2.0.0-alpha.33 (2022-05-26)

**Note:** Version bump only for package @aurelia/__tests__

<a name="2.0.0-alpha.32"></a>
# 2.0.0-alpha.32 (2022-05-22)

**Note:** Version bump only for package @aurelia/__tests__

<a name="2.0.0-alpha.31"></a>
# 2.0.0-alpha.31 (2022-05-15)

**Note:** Version bump only for package @aurelia/__tests__

<a name="2.0.0-alpha.30"></a>
# 2.0.0-alpha.30 (2022-05-07)

### Features:

* **events:** expr as listener handler (#1411) ([ff6ebb8](https://github.com/aurelia/aurelia/commit/ff6ebb8))
* **testing:** automatically hook fixture create promise / tear down ([ff6ebb8](https://github.com/aurelia/aurelia/commit/ff6ebb8))
* **testing:** enhance createFixture helper props ([ff6ebb8](https://github.com/aurelia/aurelia/commit/ff6ebb8))
* **hmr:** add in hmr capabilities (#1400) ([6d932a7](https://github.com/aurelia/aurelia/commit/6d932a7))

<a name="2.0.0-alpha.29"></a>
# 2.0.0-alpha.29 (2022-04-27)

**Note:** Version bump only for package @aurelia/__tests__

<a name="2.0.0-alpha.28"></a>
# 2.0.0-alpha.28 (2022-04-16)

**Note:** Version bump only for package @aurelia/__tests__

<a name="2.0.0-alpha.27"></a>
# 2.0.0-alpha.27 (2022-04-08)

### Features:

* **plugin-conventions:** support foo-bar/index.js Nodejs convention (#1383) ([54a8a29](https://github.com/aurelia/aurelia/commit/54a8a29))
* ***:** parcel2 integration (#1376) ([ba95a5d](https://github.com/aurelia/aurelia/commit/ba95a5d))

<a name="2.0.0-alpha.26"></a>
# 2.0.0-alpha.26 (2022-03-13)

**Note:** Version bump only for package @aurelia/__tests__

<a name="2.0.0-alpha.25"></a>
# 2.0.0-alpha.25 (2022-03-08)

**Note:** Version bump only for package @aurelia/__tests__

<a name="2.0.0-alpha.24"></a>
# 2.0.0-alpha.24 (2022-01-18)

**Note:** Version bump only for package @aurelia/__tests__

<a name="2.0.0-alpha.23"></a>
# 2.0.0-alpha.23 (2021-11-22)

**Note:** Version bump only for package @aurelia/__tests__

<a name="2.0.0-alpha.22"></a>
# 2.0.0-alpha.22 (2021-10-24)

**Note:** Version bump only for package @aurelia/__tests__

<a name="2.0.0-alpha.21"></a>
# 2.0.0-alpha.21 (2021-09-12)

**Note:** Version bump only for package @aurelia/__tests__

<a name="2.0.0-alpha.20"></a>
# 2.0.0-alpha.20 (2021-09-04)

**Note:** Version bump only for package @aurelia/__tests__

<a name="2.0.0-alpha.19"></a>
# 2.0.0-alpha.19 (2021-08-29)

**Note:** Version bump only for package @aurelia/__tests__

<a name="2.0.0-alpha.18"></a>
# 2.0.0-alpha.18 (2021-08-22)

**Note:** Version bump only for package @aurelia/__tests__

<a name="2.0.0-alpha.17"></a>
# 2.0.0-alpha.17 (2021-08-16)

**Note:** Version bump only for package @aurelia/__tests__

<a name="2.0.0-alpha.16"></a>
# 2.0.0-alpha.16 (2021-08-07)

**Note:** Version bump only for package @aurelia/__tests__

<a name="2.0.0-alpha.15"></a>
# 2.0.0-alpha.15 (2021-08-01)

### Bug Fixes:

* **plugin-conventions:** fix compatibility with webpack css extraction ([c1ab6cc](https://github.com/aurelia/aurelia/commit/c1ab6cc))

<a name="2.0.0-alpha.14"></a>
# 2.0.0-alpha.14 (2021-07-25)

**Note:** Version bump only for package @aurelia/__tests__

<a name="2.0.0-alpha.13"></a>
# 2.0.0-alpha.13 (2021-07-19)

**Note:** Version bump only for package @aurelia/__tests__

<a name="2.0.0-alpha.12"></a>
# 2.0.0-alpha.12 (2021-07-11)

**Note:** Version bump only for package @aurelia/__tests__

<a name="2.0.0-alpha.11"></a>
# 2.0.0-alpha.11 (2021-07-11)

**Note:** Version bump only for package @aurelia/__tests__

<a name="2.0.0-alpha.10"></a>
# 2.0.0-alpha.10 (2021-07-04)

**Note:** Version bump only for package @aurelia/__tests__

<a name="2.0.0-alpha.9"></a>
# 2.0.0-alpha.9 (2021-06-25)

**Note:** Version bump only for package @aurelia/__tests__

<a name="2.0.0-alpha.8"></a>
# 2.0.0-alpha.8 (2021-06-22)

### Bug Fixes:

* **jest:** fix jest v27 exports ([520ab8e](https://github.com/aurelia/aurelia/commit/520ab8e))

<a name="2.0.0-alpha.7"></a>
# 2.0.0-alpha.7 (2021-06-20)

### Features:

* **babel-jest,ts-jest:** support jest v27 ([2145bbe](https://github.com/aurelia/aurelia/commit/2145bbe))

<a name="2.0.0-alpha.6"></a>
# 2.0.0-alpha.6 (2021-06-11)

**Note:** Version bump only for package @aurelia/__tests__

<a name="2.0.0-alpha.5"></a>
# 2.0.0-alpha.5 (2021-05-31)

**Note:** Version bump only for package @aurelia/__tests__

<a name="2.0.0-alpha.4"></a>
# 2.0.0-alpha.4 (2021-05-25)

**Note:** Version bump only for package @aurelia/__tests__

<a name="2.0.0-alpha.3"></a>
# 2.0.0-alpha.3 (2021-05-19)

### Bug Fixes:

* **plugin-conventions:** accept class FooBarCustomElement convention ([1dfac6f](https://github.com/aurelia/aurelia/commit/1dfac6f))

<a name="2.0.0-alpha.2"></a>
# 2.0.0-alpha.2 (2021-03-07)

**Note:** Version bump only for package @aurelia/__tests__

<a name="2.0.0-alpha.1"></a>
# 2.0.0-alpha.1 (2021-03-03)

**Note:** Version bump only for package @aurelia/__tests__

<a name="2.0.0-alpha.0"></a>
# 2.0.0-alpha.0 (2021-03-02)

**Note:** Version bump only for package @aurelia/__tests__

<a name="0.9.0"></a>
# 0.9.0 (2021-01-31)

### Bug Fixes:

* **conventions:** skip local template, leave it to runtime ([0501dfc](https://github.com/aurelia/aurelia/commit/0501dfc))


### Refactorings:

* **logging:** replace $console config option with ConsoleSink ([4ea5d22](https://github.com/aurelia/aurelia/commit/4ea5d22))

