# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

<a name="2.0.0-beta.16"></a>
# 2.0.0-beta.16 (2024-05-03)

### Refactorings:

* ***:** extract template compiler into own package (#1954) ([ad7ae1e](https://github.com/aurelia/aurelia/commit/ad7ae1e))
* ***:** cleanup deco code (#1947) ([ca22bc8](https://github.com/aurelia/aurelia/commit/ca22bc8))
* **observers:** use static blocks, group related code ([ca22bc8](https://github.com/aurelia/aurelia/commit/ca22bc8))
* ***:** move scope to runtime html (#1945) ([bca0290](https://github.com/aurelia/aurelia/commit/bca0290))

<a name="2.0.0-beta.15"></a>
# 2.0.0-beta.15 (2024-04-17)

### Features:

* **resources:** support static `$au` property for definition (#1939) ([877a385](https://github.com/aurelia/aurelia/commit/877a385))


### Refactorings:

* **bindings:** move binding infra to runtime html (#1944) ([1c7608a](https://github.com/aurelia/aurelia/commit/1c7608a))
* **expression-parser:** move exp parser to its own package (#1943) ([6e7dcad](https://github.com/aurelia/aurelia/commit/6e7dcad))
* ***:** migration to TC39 decorators + metadata simplification (#1932) ([22f90ad](https://github.com/aurelia/aurelia/commit/22f90ad))

<a name="2.0.0-beta.14"></a>
# 2.0.0-beta.14 (2024-04-03)

### Features:

* **i18n:** support multiple versions of i18next (#1927) ([0789ee5](https://github.com/aurelia/aurelia/commit/0789ee5))


### Bug Fixes:

* **form:** prevent actionless submission (#1931) ([1fc74d4](https://github.com/aurelia/aurelia/commit/1fc74d4))

<a name="2.0.0-beta.13"></a>
# 2.0.0-beta.13 (2024-03-15)

### Bug Fixes:

* **router-lite:** dont register config ([f71e9e7](https://github.com/aurelia/aurelia/commit/f71e9e7))


### Refactorings:

* **event:** no longer call prevent default by default (#1926) ([f71e9e7](https://github.com/aurelia/aurelia/commit/f71e9e7))

<a name="2.0.0-beta.12"></a>
# 2.0.0-beta.12 (2024-03-02)

**Note:** Version bump only for package @aurelia/compat-v1

<a name="2.0.0-beta.11"></a>
# 2.0.0-beta.11 (2024-02-13)

### Features:

* **state:** support redux devtools for the state plugin (#1888) ([bd07160](https://github.com/aurelia/aurelia/commit/bd07160))


### Bug Fixes:

* ***:** upgrade rollup, tweak build scripts ([bd07160](https://github.com/aurelia/aurelia/commit/bd07160))

<a name="2.0.0-beta.10"></a>
# 2.0.0-beta.10 (2024-01-26)

### Refactorings:

* **enums:** string literal types in favour of const enums (#1870) ([e21e0c9](https://github.com/aurelia/aurelia/commit/e21e0c9))

<a name="2.0.0-beta.9"></a>
# 2.0.0-beta.9 (2023-12-12)

**Note:** Version bump only for package @aurelia/compat-v1

<a name="2.0.0-beta.8"></a>
# 2.0.0-beta.8 (2023-07-24)

### Refactorings:

* **ref:** deprecate view-model.ref and introduce component.ref (#1803) ([97e8dad](https://github.com/aurelia/aurelia/commit/97e8dad))
* ***:** bindable property -> name (#1783) ([ca0eda7](https://github.com/aurelia/aurelia/commit/ca0eda7))

<a name="2.0.0-beta.7"></a>
# 2.0.0-beta.7 (2023-06-16)

### Features:

* **build:** add a development entry point (#1770) ([69ff445](https://github.com/aurelia/aurelia/commit/69ff445))

<a name="2.0.0-beta.6"></a>
# 2.0.0-beta.6 (2023-05-21)

**Note:** Version bump only for package @aurelia/compat-v1

<a name="2.0.0-beta.5"></a>
# 2.0.0-beta.5 (2023-04-27)

### Bug Fixes:

* **compat:** dont use both writable and getter/setter ([b58f967](https://github.com/aurelia/aurelia/commit/b58f967))


### Refactorings:

* **build:** preserve pure annotation for better tree shaking (#1745) ([0bc5cd6](https://github.com/aurelia/aurelia/commit/0bc5cd6))

<a name="2.0.0-beta.4"></a>
# 2.0.0-beta.4 (2023-04-13)

**Note:** Version bump only for package @aurelia/compat-v1

<a name="2.0.0-beta.3"></a>
# 2.0.0-beta.3 (2023-03-24)

### Refactorings:

* **compose:** rename props and add compat layer (#1699) ([2e7ce43](https://github.com/aurelia/aurelia/commit/2e7ce43))
* **build:** use turbo to boost build speed (#1692) ([d99b136](https://github.com/aurelia/aurelia/commit/d99b136))

<a name="2.0.0-beta.2"></a>
# 2.0.0-beta.2 (2023-02-26)

### Features:

* **compat:** add binding engine (#1679) ([a6dd0de](https://github.com/aurelia/aurelia/commit/a6dd0de))


### Bug Fixes:

* ***:** linting errors ([e6010d0](https://github.com/aurelia/aurelia/commit/e6010d0))

<a name="2.0.0-beta.1"></a>
# 2.0.0-beta.1 (2023-01-12)

### Features:

* ***:** add binding property to compat package ([b58be1e](https://github.com/aurelia/aurelia/commit/b58be1e))
* **compat:** add ast methods to compat package ([8b99581](https://github.com/aurelia/aurelia/commit/8b99581))
* ***:** add a compat-v1 package for migration ([6cec5a2](https://github.com/aurelia/aurelia/commit/6cec5a2))


### Refactorings:

* ***:** add platform & obs locator to renderers ([6763eed](https://github.com/aurelia/aurelia/commit/6763eed))
* ***:** prefix private props on bindings ([d9cfc83](https://github.com/aurelia/aurelia/commit/d9cfc83))
* ***:** remove call command, move to compat package ([d302d72](https://github.com/aurelia/aurelia/commit/d302d72))
* ***:** remove event delegator, move completely to compat ([cca1ce8](https://github.com/aurelia/aurelia/commit/cca1ce8))
* **event:** remove .delegate, add .delegate to compat package ([d1539a2](https://github.com/aurelia/aurelia/commit/d1539a2))

