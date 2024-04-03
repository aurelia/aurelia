# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

<a name="2.0.0-beta.14"></a>
# 2.0.0-beta.14 (2024-04-03)

### Features:

* **i18n:** support multiple versions of i18next (#1927) ([0789ee5](https://github.com/aurelia/aurelia/commit/0789ee5))


### Refactorings:

* **attr:** treat empty string as no binding (#1930) ([8fc5275](https://github.com/aurelia/aurelia/commit/8fc5275))

<a name="2.0.0-beta.13"></a>
# 2.0.0-beta.13 (2024-03-15)

### Features:

* **convention:** add import as support (#1920) ([7a15551](https://github.com/aurelia/aurelia/commit/7a15551))
* **di:** api to register resources with alias key ([7a15551](https://github.com/aurelia/aurelia/commit/7a15551))


### Refactorings:

* **runtime:** move ctor reg into controller ([7a15551](https://github.com/aurelia/aurelia/commit/7a15551))

<a name="2.0.0-beta.12"></a>
# 2.0.0-beta.12 (2024-03-02)

**Note:** Version bump only for package @aurelia/plugin-conventions

<a name="2.0.0-beta.11"></a>
# 2.0.0-beta.11 (2024-02-13)

### Features:

* **state:** support redux devtools for the state plugin (#1888) ([bd07160](https://github.com/aurelia/aurelia/commit/bd07160))


### Bug Fixes:

* **convention:** no longer process shadowdom + <slot> (#1889) ([e29bbef](https://github.com/aurelia/aurelia/commit/e29bbef))
* ***:** upgrade rollup, tweak build scripts ([bd07160](https://github.com/aurelia/aurelia/commit/bd07160))

<a name="2.0.0-beta.10"></a>
# 2.0.0-beta.10 (2024-01-26)

### Refactorings:

* **enums:** string literal types in favour of const enums (#1870) ([e21e0c9](https://github.com/aurelia/aurelia/commit/e21e0c9))

<a name="2.0.0-beta.9"></a>
# 2.0.0-beta.9 (2023-12-12)

**Note:** Version bump only for package @aurelia/plugin-conventions

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

**Note:** Version bump only for package @aurelia/plugin-conventions

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

<a name="2.0.0-beta.3"></a>
# 2.0.0-beta.3 (2023-03-24)

### Refactorings:

* **build:** use turbo to boost build speed (#1692) ([d99b136](https://github.com/aurelia/aurelia/commit/d99b136))

<a name="2.0.0-beta.2"></a>
# 2.0.0-beta.2 (2023-02-26)

### Features:

* ***:** add vite plugin (#1651) ([5f3a88d](https://github.com/aurelia/aurelia/commit/5f3a88d))


### Bug Fixes:

* ***:** toolings tests ([bc7e8e0](https://github.com/aurelia/aurelia/commit/bc7e8e0))
* **hmr:** no invalidate on parcel (#1647) ([843ca70](https://github.com/aurelia/aurelia/commit/843ca70))

<a name="2.0.0-beta.1"></a>
# 2.0.0-beta.1 (2023-01-12)

### Refactorings:

* **runtime:** cleanup & size opt, rename binding methods (#1582) ([2000e3b](https://github.com/aurelia/aurelia/commit/2000e3b))
* **all:** error msg code & better bundle size ([d81ec6d](https://github.com/aurelia/aurelia/commit/d81ec6d))

<a name="2.0.0-alpha.41"></a>
# 2.0.0-alpha.41 (2022-09-22)

### Refactorings:

* **hmr:** retain bindable state closes #1550 ([e71026a](https://github.com/aurelia/aurelia/commit/e71026a))
* **binding:** move BindingMode to runtime-html (#1555) ([c75618b](https://github.com/aurelia/aurelia/commit/c75618b))
* **ast:** remove flags from evaluate (#1553) ([dda997b](https://github.com/aurelia/aurelia/commit/dda997b))

<a name="2.0.0-alpha.40"></a>
# 2.0.0-alpha.40 (2022-09-07)

**Note:** Version bump only for package @aurelia/plugin-conventions

<a name="2.0.0-alpha.39"></a>
# 2.0.0-alpha.39 (2022-09-01)

### Bug Fixes:

* **hmr:** add ts-ignore to fix in hmr in strict TS (#1515) ([f571004](https://github.com/aurelia/aurelia/commit/f571004))
* **for "TS700:** Parameter 'data' implicitly has an 'any' type. " on every compontent.ts file when using HMR with typescript in strict mode ([f571004](https://github.com/aurelia/aurelia/commit/f571004))

<a name="2.0.0-alpha.38"></a>
# 2.0.0-alpha.38 (2022-08-17)

### Bug Fixes:

* **plugin-conventions:** fix wrong options reference (#1493) ([abd3a3f](https://github.com/aurelia/aurelia/commit/abd3a3f))

<a name="2.0.0-alpha.37"></a>
# 2.0.0-alpha.37 (2022-08-03)

### Bug Fixes:

* **hmr:** add some more ignores for strict mode TS (#1483) ([6f7ca00](https://github.com/aurelia/aurelia/commit/6f7ca00))

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

### Bug Fixes:

* **hmr:** prevent compilation hot.invalidate issue (#1441) ([4e5ca74](https://github.com/aurelia/aurelia/commit/4e5ca74))
* **s the following error : "TS233:** Property 'invalidate' does not exist on type 'Hot'." ([4e5ca74](https://github.com/aurelia/aurelia/commit/4e5ca74))

<a name="2.0.0-alpha.33"></a>
# 2.0.0-alpha.33 (2022-05-26)

### Bug Fixes:

* **hmr:** call invoke on controller container ([fa92c3d](https://github.com/aurelia/aurelia/commit/fa92c3d))

<a name="2.0.0-alpha.32"></a>
# 2.0.0-alpha.32 (2022-05-22)

### Bug Fixes:

* **plugin-conventions:** upgrade source-map dep to fix nodejs v18 compat (#1424) ([572d101](https://github.com/aurelia/aurelia/commit/572d101))

<a name="2.0.0-alpha.31"></a>
# 2.0.0-alpha.31 (2022-05-15)

### Features:

* **ui-virtualization:** prepare to port ui virtualization plugin (#1420) ([3e61198](https://github.com/aurelia/aurelia/commit/3e61198))
* **virtualization:** basic implementation ([3e61198](https://github.com/aurelia/aurelia/commit/3e61198))


### Bug Fixes:

* **hmr:** invoke created with correct this ([d78d301](https://github.com/aurelia/aurelia/commit/d78d301))
* **hmr:** works with components that has created lifecycle ([3e61198](https://github.com/aurelia/aurelia/commit/3e61198))
* **hmr:** create view model with injection ([bda3e1f](https://github.com/aurelia/aurelia/commit/bda3e1f))

<a name="2.0.0-alpha.30"></a>
# 2.0.0-alpha.30 (2022-05-07)

### Features:

* **hmr:** add in hmr capabilities (#1400) ([6d932a7](https://github.com/aurelia/aurelia/commit/6d932a7))

<a name="2.0.0-alpha.29"></a>
# 2.0.0-alpha.29 (2022-04-27)

**Note:** Version bump only for package @aurelia/plugin-conventions

<a name="2.0.0-alpha.28"></a>
# 2.0.0-alpha.28 (2022-04-16)

**Note:** Version bump only for package @aurelia/plugin-conventions

<a name="2.0.0-alpha.27"></a>
# 2.0.0-alpha.27 (2022-04-08)

### Features:

* **plugin-conventions:** support foo-bar/index.js Nodejs convention (#1383) ([54a8a29](https://github.com/aurelia/aurelia/commit/54a8a29))

<a name="2.0.0-alpha.26"></a>
# 2.0.0-alpha.26 (2022-03-13)

**Note:** Version bump only for package @aurelia/plugin-conventions

<a name="2.0.0-alpha.25"></a>
# 2.0.0-alpha.25 (2022-03-08)

**Note:** Version bump only for package @aurelia/plugin-conventions

<a name="2.0.0-alpha.24"></a>
# 2.0.0-alpha.24 (2022-01-18)

**Note:** Version bump only for package @aurelia/plugin-conventions

<a name="2.0.0-alpha.23"></a>
# 2.0.0-alpha.23 (2021-11-22)

**Note:** Version bump only for package @aurelia/plugin-conventions

<a name="2.0.0-alpha.22"></a>
# 2.0.0-alpha.22 (2021-10-24)

**Note:** Version bump only for package @aurelia/plugin-conventions

<a name="2.0.0-alpha.21"></a>
# 2.0.0-alpha.21 (2021-09-12)

**Note:** Version bump only for package @aurelia/plugin-conventions

<a name="2.0.0-alpha.20"></a>
# 2.0.0-alpha.20 (2021-09-04)

**Note:** Version bump only for package @aurelia/plugin-conventions

<a name="2.0.0-alpha.19"></a>
# 2.0.0-alpha.19 (2021-08-29)

**Note:** Version bump only for package @aurelia/plugin-conventions

<a name="2.0.0-alpha.18"></a>
# 2.0.0-alpha.18 (2021-08-22)

**Note:** Version bump only for package @aurelia/plugin-conventions

<a name="2.0.0-alpha.17"></a>
# 2.0.0-alpha.17 (2021-08-16)

**Note:** Version bump only for package @aurelia/plugin-conventions

<a name="2.0.0-alpha.16"></a>
# 2.0.0-alpha.16 (2021-08-07)

**Note:** Version bump only for package @aurelia/plugin-conventions

<a name="2.0.0-alpha.15"></a>
# 2.0.0-alpha.15 (2021-08-01)

### Bug Fixes:

* **plugin-conventions:** fix compatibility with webpack css extraction ([c1ab6cc](https://github.com/aurelia/aurelia/commit/c1ab6cc))

<a name="2.0.0-alpha.14"></a>
# 2.0.0-alpha.14 (2021-07-25)

**Note:** Version bump only for package @aurelia/plugin-conventions

<a name="2.0.0-alpha.13"></a>
# 2.0.0-alpha.13 (2021-07-19)

**Note:** Version bump only for package @aurelia/plugin-conventions

<a name="2.0.0-alpha.12"></a>
# 2.0.0-alpha.12 (2021-07-11)

**Note:** Version bump only for package @aurelia/plugin-conventions

<a name="2.0.0-alpha.11"></a>
# 2.0.0-alpha.11 (2021-07-11)

**Note:** Version bump only for package @aurelia/plugin-conventions

<a name="2.0.0-alpha.10"></a>
# 2.0.0-alpha.10 (2021-07-04)

**Note:** Version bump only for package @aurelia/plugin-conventions

<a name="2.0.0-alpha.9"></a>
# 2.0.0-alpha.9 (2021-06-25)

**Note:** Version bump only for package @aurelia/plugin-conventions

<a name="2.0.0-alpha.8"></a>
# 2.0.0-alpha.8 (2021-06-22)

**Note:** Version bump only for package @aurelia/plugin-conventions

<a name="2.0.0-alpha.7"></a>
# 2.0.0-alpha.7 (2021-06-20)

**Note:** Version bump only for package @aurelia/plugin-conventions

<a name="2.0.0-alpha.6"></a>
# 2.0.0-alpha.6 (2021-06-11)

**Note:** Version bump only for package @aurelia/plugin-conventions

<a name="2.0.0-alpha.5"></a>
# 2.0.0-alpha.5 (2021-05-31)

**Note:** Version bump only for package @aurelia/plugin-conventions

<a name="2.0.0-alpha.4"></a>
# 2.0.0-alpha.4 (2021-05-25)

**Note:** Version bump only for package @aurelia/plugin-conventions

<a name="2.0.0-alpha.3"></a>
# 2.0.0-alpha.3 (2021-05-19)

### Bug Fixes:

* **plugin-conventions:** accept class FooBarCustomElement convention ([1dfac6f](https://github.com/aurelia/aurelia/commit/1dfac6f))

<a name="2.0.0-alpha.2"></a>
# 2.0.0-alpha.2 (2021-03-07)

**Note:** Version bump only for package @aurelia/plugin-conventions

<a name="2.0.0-alpha.1"></a>
# 2.0.0-alpha.1 (2021-03-03)

**Note:** Version bump only for package @aurelia/plugin-conventions

<a name="2.0.0-alpha.0"></a>
# 2.0.0-alpha.0 (2021-03-02)

**Note:** Version bump only for package @aurelia/plugin-conventions

<a name="0.9.0"></a>
# 0.9.0 (2021-01-31)

### Bug Fixes:

* **conventions:** skip local template, leave it to runtime ([0501dfc](https://github.com/aurelia/aurelia/commit/0501dfc))

<a name="0.8.0"></a>
# 0.8.0 (2020-11-30)

### Bug Fixes:

* **conventions:** update package imports ([8e91cc3](https://github.com/aurelia/aurelia/commit/8e91cc3))


### Refactorings:

* **all:** add .js extensions for native esm compat ([0308e2e](https://github.com/aurelia/aurelia/commit/0308e2e))
* **all:** move scheduler implementation to platform ([e22285a](https://github.com/aurelia/aurelia/commit/e22285a))
* **all:** finish renaming render to compose ([ede127b](https://github.com/aurelia/aurelia/commit/ede127b))
* **preprocess-resource:** move bindingCommand from jit to runtime ([f02aba8](https://github.com/aurelia/aurelia/commit/f02aba8))
* **all:** merge jit into runtime and remove jit package + references ([d7b626b](https://github.com/aurelia/aurelia/commit/d7b626b))

<a name="0.7.0"></a>
# 0.7.0 (2020-05-08)

### Features:

* **plugin-conventions:** support customized element name in customElement ([ed51357](https://github.com/aurelia/aurelia/commit/ed51357))


### Bug Fixes:

* ***:** update conventions to use latest shadowCSS and cssModules ([bcbbe77](https://github.com/aurelia/aurelia/commit/bcbbe77))

<a name="0.6.0"></a>
# 0.6.0 (2019-12-18)

**Note:** Version bump only for package @aurelia/plugin-conventions

<a name="0.5.0"></a>
# 0.5.0 (2019-11-15)

**Note:** Version bump only for package @aurelia/plugin-conventions

<a name="0.4.0"></a>
# 0.4.0 (2019-10-26)

### Features:

* **alias:** Added additional test cases ([4a45a5c](https://github.com/aurelia/aurelia/commit/4a45a5c))
* **alias:** Add convention add tests fix conv log ([19399af](https://github.com/aurelia/aurelia/commit/19399af))
* **plugin-conventions:** improve compatibility with uppercase resource name ([b67b839](https://github.com/aurelia/aurelia/commit/b67b839))
* **plugin-conventions:** support foo.js + foo-view.html convention ([625ec6a](https://github.com/aurelia/aurelia/commit/625ec6a))
* **plugin-conventions:** support conventional css pair, support alternative file extentions ([cfb9446](https://github.com/aurelia/aurelia/commit/cfb9446))
* **plugin-conventions:** support metadata containerless and bindable tag/attr ([b5395b4](https://github.com/aurelia/aurelia/commit/b5395b4))
* **plugin-conventions:** always wrap others resources in defer ([082b83b](https://github.com/aurelia/aurelia/commit/082b83b))
* **plugin-conventions:** enable ShadomDOM option in html-only-element ([e44eadd](https://github.com/aurelia/aurelia/commit/e44eadd))
* **plugin-conventions:** support defaultShadowOptions in conventions support ([dcf0bba](https://github.com/aurelia/aurelia/commit/dcf0bba))
* **webpack-loader:** webpack-loader on top of plugin-conventions ([0a4b131](https://github.com/aurelia/aurelia/commit/0a4b131))
* **plugin-conventions:** preprocess html template ([fd7134d](https://github.com/aurelia/aurelia/commit/fd7134d))
* **plugin-conventions:** preprocess js/ts resources, adding decorators ([0fa3cb2](https://github.com/aurelia/aurelia/commit/0fa3cb2))


### Bug Fixes:

* **plugin-conventions:** check import statement on new "aurelia" package, add test coverage ([fcff1de](https://github.com/aurelia/aurelia/commit/fcff1de))
* **plugin-conventions:** add missing support of templateController ([8ab115c](https://github.com/aurelia/aurelia/commit/8ab115c))
* **plugin-conventions:** upgrade modify-code to latest version to fix a preprocess bug ([6d018a2](https://github.com/aurelia/aurelia/commit/6d018a2))
* **plugin-conventions:** new decorator has to be injected before existing decorators ([437596c](https://github.com/aurelia/aurelia/commit/437596c))
* **webpack-loader:** need to use "!!" in "!!raw-loader!" to bypass all loaders in webpack config ([5c00dbd](https://github.com/aurelia/aurelia/commit/5c00dbd))
* **plugin-conventions:** proper support of HTML-only element in format other than .html ([73860ec](https://github.com/aurelia/aurelia/commit/73860ec))
* **plugin-conventions:** turn off ShadowDOM for element with one-word tag name ([d1f10ff](https://github.com/aurelia/aurelia/commit/d1f10ff))
* **plugin-gulp:** fix html pair checking in plugin-gulp ([be01413](https://github.com/aurelia/aurelia/commit/be01413))
* **plugin-conventions): fix plugin-conventions tsconfig:** ( ([acfb095](https://github.com/aurelia/aurelia/commit/acfb095))
* **plugin-conventions:** fix TS TS2449 error for custom element with in-file dep ([efdc2ae](https://github.com/aurelia/aurelia/commit/efdc2ae))


### Refactorings:

* **plugin-conventions:** simplify usage of html only element ([c52b8e4](https://github.com/aurelia/aurelia/commit/c52b8e4))
* **plugin-conventions:** push down common logic to base package ([cb96d99](https://github.com/aurelia/aurelia/commit/cb96d99))

