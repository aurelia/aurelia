# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

<a name="2.0.0-beta.18"></a>
# 2.0.0-beta.18 (2024-05-23)

### Refactorings:

* **dom-queue:** merge dom read and write queues (#1970) ([3a63cde](https://github.com/aurelia/aurelia/commit/3a63cde))

<a name="2.0.0-beta.17"></a>
# 2.0.0-beta.17 (2024-05-11)

### Features:

* **template:** support spread syntax with spread command and ... (#1965) ([ccae63b](https://github.com/aurelia/aurelia/commit/ccae63b))


### Bug Fixes:

* **compiler:** fix order when spreading custom attribute into element bindable, improve doc, add tests ([ccae63b](https://github.com/aurelia/aurelia/commit/ccae63b))
* **(state:** auto infer binding expression when empty ([ccae63b](https://github.com/aurelia/aurelia/commit/ccae63b))

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


### Refactorings:

* **attr:** treat empty string as no binding (#1930) ([8fc5275](https://github.com/aurelia/aurelia/commit/8fc5275))

<a name="2.0.0-beta.13"></a>
# 2.0.0-beta.13 (2024-03-15)

### Bug Fixes:

* ***:** element get own metadata call ([dc22fb7](https://github.com/aurelia/aurelia/commit/dc22fb7))
* **di:** cache factory on singleton resolution ([dc22fb7](https://github.com/aurelia/aurelia/commit/dc22fb7))


### Refactorings:

* **resource:** cleanup registration, APIs (#1918) ([dc22fb7](https://github.com/aurelia/aurelia/commit/dc22fb7))
* ***:** cleanup util fn ([dc22fb7](https://github.com/aurelia/aurelia/commit/dc22fb7))
* **resources:** move find to corresponding resource kind ([dc22fb7](https://github.com/aurelia/aurelia/commit/dc22fb7))
* **di:** add registrable, remove unecessary infra for attr pattern ([dc22fb7](https://github.com/aurelia/aurelia/commit/dc22fb7))
* **resources:** use registrable ([dc22fb7](https://github.com/aurelia/aurelia/commit/dc22fb7))
* **di:** dont search for resources when register ([dc22fb7](https://github.com/aurelia/aurelia/commit/dc22fb7))
* **resource:** remove resource protocol, simplify resource metadata ([dc22fb7](https://github.com/aurelia/aurelia/commit/dc22fb7))
* **resources:** add get for vc & bb resource kinds ([dc22fb7](https://github.com/aurelia/aurelia/commit/dc22fb7))
* **resource:** binding command resolution ([dc22fb7](https://github.com/aurelia/aurelia/commit/dc22fb7))

<a name="2.0.0-beta.12"></a>
# 2.0.0-beta.12 (2024-03-02)

### Bug Fixes:

* **di:** dont jit register resources [skip ci] ([8ffde34](https://github.com/aurelia/aurelia/commit/8ffde34))


### Refactorings:

* ***:** cleanup (#1912) ([8ffde34](https://github.com/aurelia/aurelia/commit/8ffde34))

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

**Note:** Version bump only for package @aurelia/state

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

**Note:** Version bump only for package @aurelia/state

<a name="2.0.0-beta.5"></a>
# 2.0.0-beta.5 (2023-04-27)

### Refactorings:

* **build:** preserve pure annotation for better tree shaking (#1745) ([0bc5cd6](https://github.com/aurelia/aurelia/commit/0bc5cd6))

<a name="2.0.0-beta.4"></a>
# 2.0.0-beta.4 (2023-04-13)

### Features:

* **debounce-throttle:** flush via signals (#1739) ([af238a9](https://github.com/aurelia/aurelia/commit/af238a9))

<a name="2.0.0-beta.3"></a>
# 2.0.0-beta.3 (2023-03-24)

### Refactorings:

* **state:** action to be comes a single value (#1709) ([6b598d6](https://github.com/aurelia/aurelia/commit/6b598d6))
* **build:** use turbo to boost build speed (#1692) ([d99b136](https://github.com/aurelia/aurelia/commit/d99b136))

<a name="2.0.0-beta.2"></a>
# 2.0.0-beta.2 (2023-02-26)

**Note:** Version bump only for package @aurelia/state

<a name="2.0.0-beta.1"></a>
# 2.0.0-beta.1 (2023-01-12)

### Refactorings:

* ***:** add platform & obs locator to renderers ([6763eed](https://github.com/aurelia/aurelia/commit/6763eed))
* ***:** prefix private props on bindings ([d9cfc83](https://github.com/aurelia/aurelia/commit/d9cfc83))
* **runtime:** cleanup & size opt, rename binding methods (#1582) ([2000e3b](https://github.com/aurelia/aurelia/commit/2000e3b))
* **runtime:** remove interceptor prop from interface ([3074f54](https://github.com/aurelia/aurelia/commit/3074f54))
* **binding-behavior:** remove binding interceptor ([767eee7](https://github.com/aurelia/aurelia/commit/767eee7))
* **state:** cleanup bindings ([76cbb04](https://github.com/aurelia/aurelia/commit/76cbb04))
* **bindings:** create override fn instead of binding interceptor ([5c2ed80](https://github.com/aurelia/aurelia/commit/5c2ed80))
* **ast:** extract evaluate into a seprate fn ([6691f7f](https://github.com/aurelia/aurelia/commit/6691f7f))

<a name="2.0.0-alpha.41"></a>
# 2.0.0-alpha.41 (2022-09-22)

### Bug Fixes:

* ***:** call listener with correct scope, move flush queue to binding ([70d1329](https://github.com/aurelia/aurelia/commit/70d1329))


### Refactorings:

* **binding-command:** make expr parser & attr mapper parameters of command build ([0ff9756](https://github.com/aurelia/aurelia/commit/0ff9756))
* **bindings:** remove flags from bind/unbind (#1560) ([eaaf4bb](https://github.com/aurelia/aurelia/commit/eaaf4bb))
* ***:** remove flags from observers (#1557) ([9f9a8fe](https://github.com/aurelia/aurelia/commit/9f9a8fe))
* **binding:** move BindingMode to runtime-html (#1555) ([c75618b](https://github.com/aurelia/aurelia/commit/c75618b))
* **ast:** remove flags from evaluate (#1553) ([dda997b](https://github.com/aurelia/aurelia/commit/dda997b))

<a name="2.0.0-alpha.40"></a>
# 2.0.0-alpha.40 (2022-09-07)

**Note:** Version bump only for package @aurelia/state

<a name="2.0.0-alpha.39"></a>
# 2.0.0-alpha.39 (2022-09-01)

### Bug Fixes:

* **e2e:** better e2e test scripts ([855a03f](https://github.com/aurelia/aurelia/commit/855a03f))
* **build:** remove reference directive, use files in tsconfig instead ([855a03f](https://github.com/aurelia/aurelia/commit/855a03f))
* **typings:** make ListenerOptions public ([855a03f](https://github.com/aurelia/aurelia/commit/855a03f))

<a name="2.0.0-alpha.38"></a>
# 2.0.0-alpha.38 (2022-08-17)

**Note:** Version bump only for package @aurelia/state

<a name="2.0.0-alpha.37"></a>
# 2.0.0-alpha.37 (2022-08-03)

**Note:** Version bump only for package @aurelia/state

<a name="2.0.0-alpha.36"></a>
# 2.0.0-alpha.36 (2022-07-25)

**Note:** Version bump only for package @aurelia/state

<a name="2.0.0-alpha.35"></a>
# 2.0.0-alpha.35 (2022-06-08)

### Features:

* **ts-jest,babel-jest:** upgrade to jest v28 (#1449) ([b1ec85c](https://github.com/aurelia/aurelia/commit/b1ec85c))
* **state:** fromState deco works on attribute (#1447) ([548b4fd](https://github.com/aurelia/aurelia/commit/548b4fd))

<a name="2.0.0-alpha.34"></a>
# 2.0.0-alpha.34 (2022-06-03)

**Note:** Version bump only for package @aurelia/state

<a name="2.0.0-alpha.33"></a>
# 2.0.0-alpha.33 (2022-05-26)

### Features:

* **state:** add fromState decorator ([38ab008](https://github.com/aurelia/aurelia/commit/38ab008))


### Bug Fixes:

* **state:** binding behavior observe (#1437) ([b6e1b28](https://github.com/aurelia/aurelia/commit/b6e1b28))

<a name="2.0.0-alpha.32"></a>
# 2.0.0-alpha.32 (2022-05-22)

### Features:

* **state:** add state binding behavior ([b05a0fb](https://github.com/aurelia/aurelia/commit/b05a0fb))
* **state:** observe view model properties in state bindings ([b05a0fb](https://github.com/aurelia/aurelia/commit/b05a0fb))
* ***:** prevent store dispatch on unreged action ([b05a0fb](https://github.com/aurelia/aurelia/commit/b05a0fb))


### Bug Fixes:

* ***:** avoid conflict in binding props ([b05a0fb](https://github.com/aurelia/aurelia/commit/b05a0fb))
* ***:** settable properties in binding interceptor ([b05a0fb](https://github.com/aurelia/aurelia/commit/b05a0fb))
* ***:** binding behavior base ([b05a0fb](https://github.com/aurelia/aurelia/commit/b05a0fb))
* ***:** state export names ([b05a0fb](https://github.com/aurelia/aurelia/commit/b05a0fb))


### Refactorings:

* ***:** disable scope traversal in state binding, group interfaces ([b05a0fb](https://github.com/aurelia/aurelia/commit/b05a0fb))
* **state:** rename default configuration export ([b05a0fb](https://github.com/aurelia/aurelia/commit/b05a0fb))
* **state:** enforce .dispatch return shape ([b05a0fb](https://github.com/aurelia/aurelia/commit/b05a0fb))
* **state:** allow reducers to handle more than 1 action type ([b05a0fb](https://github.com/aurelia/aurelia/commit/b05a0fb))
* **state:** distinction of action / reducer ([b05a0fb](https://github.com/aurelia/aurelia/commit/b05a0fb))

<a name="2.0.0-alpha.31"></a>
# 2.0.0-alpha.31 (2022-05-15)

### Features:

* **plugin:** aurelia store (v2) plugin (#1412) ([6989de0](https://github.com/aurelia/aurelia/commit/6989de0))

