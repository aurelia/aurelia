# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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

