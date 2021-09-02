# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

<a name="2.0.0-alpha.19"></a>
# 2.0.0-alpha.19 (2021-08-29)

**Note:** Version bump only for package @aurelia/validation-html

<a name="2.0.0-alpha.18"></a>
# 2.0.0-alpha.18 (2021-08-22)

**Note:** Version bump only for package @aurelia/validation-html

<a name="2.0.0-alpha.17"></a>
# 2.0.0-alpha.17 (2021-08-16)

### Refactorings:

* **validation:** controller-factories ([3ebc6d1](https://github.com/aurelia/aurelia/commit/3ebc6d1))

<a name="2.0.0-alpha.16"></a>
# 2.0.0-alpha.16 (2021-08-07)

### Refactorings:

* **all:** use a terser name cache for predictable prop mangling ([7649ced](https://github.com/aurelia/aurelia/commit/7649ced))

<a name="2.0.0-alpha.15"></a>
# 2.0.0-alpha.15 (2021-08-01)

**Note:** Version bump only for package @aurelia/validation-html

<a name="2.0.0-alpha.14"></a>
# 2.0.0-alpha.14 (2021-07-25)

### Refactorings:

* **runtime:** mark more private properties ([8ecf70b](https://github.com/aurelia/aurelia/commit/8ecf70b))

<a name="2.0.0-alpha.13"></a>
# 2.0.0-alpha.13 (2021-07-19)

### Refactorings:

* **scope:** remove host scope ([0349810](https://github.com/aurelia/aurelia/commit/0349810))

<a name="2.0.0-alpha.12"></a>
# 2.0.0-alpha.12 (2021-07-11)

**Note:** Version bump only for package @aurelia/validation-html

<a name="2.0.0-alpha.11"></a>
# 2.0.0-alpha.11 (2021-07-11)

### Bug Fixes:

* **call-binding:** assign args to event property, fixes #1231 ([fa4c0d4](https://github.com/aurelia/aurelia/commit/fa4c0d4))

<a name="2.0.0-alpha.10"></a>
# 2.0.0-alpha.10 (2021-07-04)

### Refactorings:

* **templating:** remove projections param from getRenderContext ([cf34e40](https://github.com/aurelia/aurelia/commit/cf34e40))

<a name="2.0.0-alpha.9"></a>
# 2.0.0-alpha.9 (2021-06-25)

**Note:** Version bump only for package @aurelia/validation-html

<a name="2.0.0-alpha.8"></a>
# 2.0.0-alpha.8 (2021-06-22)

**Note:** Version bump only for package @aurelia/validation-html

<a name="2.0.0-alpha.7"></a>
# 2.0.0-alpha.7 (2021-06-20)

**Note:** Version bump only for package @aurelia/validation-html

<a name="2.0.0-alpha.6"></a>
# 2.0.0-alpha.6 (2021-06-11)

**Note:** Version bump only for package @aurelia/validation-html

<a name="2.0.0-alpha.5"></a>
# 2.0.0-alpha.5 (2021-05-31)

**Note:** Version bump only for package @aurelia/validation-html

<a name="2.0.0-alpha.4"></a>
# 2.0.0-alpha.4 (2021-05-25)

**Note:** Version bump only for package @aurelia/validation-html

<a name="2.0.0-alpha.3"></a>
# 2.0.0-alpha.3 (2021-05-19)

**Note:** Version bump only for package @aurelia/validation-html

<a name="2.0.0-alpha.2"></a>
# 2.0.0-alpha.2 (2021-03-07)

**Note:** Version bump only for package @aurelia/validation-html

<a name="2.0.0-alpha.1"></a>
# 2.0.0-alpha.1 (2021-03-03)

**Note:** Version bump only for package @aurelia/validation-html

<a name="2.0.0-alpha.0"></a>
# 2.0.0-alpha.0 (2021-03-02)

**Note:** Version bump only for package @aurelia/validation-html

<a name="0.9.0"></a>
# 0.9.0 (2021-01-31)

### Features:

* **di:** remove DI.createInterface builder ([8146dcc](https://github.com/aurelia/aurelia/commit/8146dcc))


### Bug Fixes:

* ***:** broken validation tests ([a051257](https://github.com/aurelia/aurelia/commit/a051257))
* **runtime:** prevent early taskQueue yield ([a72c8b2](https://github.com/aurelia/aurelia/commit/a72c8b2))

<a name="0.8.0"></a>
# 0.8.0 (2020-11-30)

### Bug Fixes:

* **validation-binding-behavior:** cancel pending task on unbind ([6288382](https://github.com/aurelia/aurelia/commit/6288382))
* **validation:** au-slot integration tests ([12c80ae](https://github.com/aurelia/aurelia/commit/12c80ae))
* ***:** broken tests ([3a73602](https://github.com/aurelia/aurelia/commit/3a73602))
* **di:** registerFactory #822 ([4ac6543](https://github.com/aurelia/aurelia/commit/4ac6543))


### Refactorings:

* **dom:** give INode, IEventTarget and IRenderLocation overrideable generic types ([e2ac8b2](https://github.com/aurelia/aurelia/commit/e2ac8b2))
* **all:** add .js extensions for native esm compat ([0308e2e](https://github.com/aurelia/aurelia/commit/0308e2e))
* **validation:** merge evaluate & connect, more efficient handling of classes ([7803dc6](https://github.com/aurelia/aurelia/commit/7803dc6))
* **controller:** remove projector abstraction & rework attaching ([d69d03d](https://github.com/aurelia/aurelia/commit/d69d03d))
* **all:** rename beforeUnbind to unbinding ([17a82ed](https://github.com/aurelia/aurelia/commit/17a82ed))
* **all:** rename beforeBind to binding ([67b1c5d](https://github.com/aurelia/aurelia/commit/67b1c5d))
* **all:** move scheduler implementation to platform ([e22285a](https://github.com/aurelia/aurelia/commit/e22285a))
* **all:** remove IDOM, HTMLDOM and DOM; replace DOM with PLATFORM ([6447468](https://github.com/aurelia/aurelia/commit/6447468))
* **all:** move html-specific stuff from runtime to runtime-html and remove Node generics ([c745963](https://github.com/aurelia/aurelia/commit/c745963))
* **all:** remove PLATFORM global ([fdef656](https://github.com/aurelia/aurelia/commit/fdef656))
* **scope:** remove IScope interface and use import type where possible for Scope ([6b8eb5f](https://github.com/aurelia/aurelia/commit/6b8eb5f))
* **validation-html:** ensure .evaluate() is called with null ([340bc1a](https://github.com/aurelia/aurelia/commit/340bc1a))
* **all:** remove AST interfaces ([7e04d83](https://github.com/aurelia/aurelia/commit/7e04d83))
* **all:** remove State enum and use simple booleans instead ([762d3c7](https://github.com/aurelia/aurelia/commit/762d3c7))
* ***:** host scope & AST ([9067a2c](https://github.com/aurelia/aurelia/commit/9067a2c))

<a name="0.7.0"></a>
# 0.7.0 (2020-05-08)

### Features:

* **validation:** new changeOrEvent behavior ([d7e33dc](https://github.com/aurelia/aurelia/commit/d7e33dc))
* **validation:** customizable container template ([16a9e2a](https://github.com/aurelia/aurelia/commit/16a9e2a))


### Bug Fixes:

* **validation:** optional IValidationController ([5a5114b](https://github.com/aurelia/aurelia/commit/5a5114b))
* **validation:** addError-revalidateError bug ([61c6f44](https://github.com/aurelia/aurelia/commit/61c6f44))
* **validation-html:** deepscan issue ([c53c78b](https://github.com/aurelia/aurelia/commit/c53c78b))
* **validation:** subscription to validate event ([f4bb10d](https://github.com/aurelia/aurelia/commit/f4bb10d))
* **validation-html:** controller injection ([800516e](https://github.com/aurelia/aurelia/commit/800516e))


### Refactorings:

* **validation:** tests correction ([7138530](https://github.com/aurelia/aurelia/commit/7138530))
* **validation:** optional scoped controller ([1484ed3](https://github.com/aurelia/aurelia/commit/1484ed3))
* **validation:** removed usage of BaseValidationRule in favor of IValidationRule ([72d4536](https://github.com/aurelia/aurelia/commit/72d4536))
* **validation:** validation-html bifurcation ([e2ca34f](https://github.com/aurelia/aurelia/commit/e2ca34f))

