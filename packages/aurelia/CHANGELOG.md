# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

<a name="2.0.0-beta.25"></a>
# 2.0.0-beta.25 (2025-07-10)

**Note:** Version bump only for package aurelia

<a name="2.0.0-beta.24"></a>
# 2.0.0-beta.24 (2025-04-27)

### Features:

* **dom:** ability to toggle $au and $aurelia (#2130) ([7e1057b](https://github.com/aurelia/aurelia/commit/7e1057b))

<a name="2.0.0-beta.23"></a>
# 2.0.0-beta.23 (2025-01-26)

### Features:

* **tooling:** type-checking for templates - Phase1 (#2066) ([ebc1d0c](https://github.com/aurelia/aurelia/commit/ebc1d0c))

<a name="2.0.0-beta.22"></a>
# 2.0.0-beta.22 (2024-09-30)

### Features:

* **observation:** ability to watch an expression (#2059) ([6cd6b8d](https://github.com/aurelia/aurelia/commit/6cd6b8d))


### Refactorings:

* **ast:** separate & allow binding behavior and value converter evaluation to be optional (#2058) ([7d7e21b](https://github.com/aurelia/aurelia/commit/7d7e21b))

<a name="2.0.0-beta.21"></a>
# 2.0.0-beta.21 (2024-08-08)

### Bug Fixes:

* **binding:** handle glitch (#2020) ([0f3dbee](https://github.com/aurelia/aurelia/commit/0f3dbee))

<a name="2.0.0-beta.20"></a>
# 2.0.0-beta.20 (2024-07-07)

**Note:** Version bump only for package aurelia

<a name="2.0.0-beta.19"></a>
# 2.0.0-beta.19 (2024-06-12)

**Note:** Version bump only for package aurelia

<a name="2.0.0-beta.18"></a>
# 2.0.0-beta.18 (2024-05-23)

### Bug Fixes:

* **dev:** turbo package input + ts dev script ([253e92a](https://github.com/aurelia/aurelia/commit/253e92a))


### Refactorings:

* **collection:** define map & set overrides on the instance instead of prototype (#1975) ([253e92a](https://github.com/aurelia/aurelia/commit/253e92a))
* **runtime:** reoganise utils import ([253e92a](https://github.com/aurelia/aurelia/commit/253e92a))

<a name="2.0.0-beta.17"></a>
# 2.0.0-beta.17 (2024-05-11)

### Features:

* **repeat:** allow custom repeatable value (#1962) ([c47df91](https://github.com/aurelia/aurelia/commit/c47df91))

<a name="2.0.0-beta.16"></a>
# 2.0.0-beta.16 (2024-05-03)

### Refactorings:

* ***:** extract template compiler into own package (#1954) ([ad7ae1e](https://github.com/aurelia/aurelia/commit/ad7ae1e))
* ***:** cleanup deco code (#1947) ([ca22bc8](https://github.com/aurelia/aurelia/commit/ca22bc8))
* **observers:** use static blocks, group related code ([ca22bc8](https://github.com/aurelia/aurelia/commit/ca22bc8))

<a name="2.0.0-beta.15"></a>
# 2.0.0-beta.15 (2024-04-17)

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


### Refactorings:

* **attr:** treat empty string as no binding (#1930) ([8fc5275](https://github.com/aurelia/aurelia/commit/8fc5275))

<a name="2.0.0-beta.13"></a>
# 2.0.0-beta.13 (2024-03-15)

### Features:

* **template-controller:** ability to have a container per factory (#1924) ([6727b56](https://github.com/aurelia/aurelia/commit/6727b56))
* **convention:** add import as support (#1920) ([7a15551](https://github.com/aurelia/aurelia/commit/7a15551))
* **di:** api to register resources with alias key ([7a15551](https://github.com/aurelia/aurelia/commit/7a15551))


### Bug Fixes:

* **router-lite:** dont register config ([f71e9e7](https://github.com/aurelia/aurelia/commit/f71e9e7))
* ***:** element get own metadata call ([dc22fb7](https://github.com/aurelia/aurelia/commit/dc22fb7))
* **di:** cache factory on singleton resolution ([dc22fb7](https://github.com/aurelia/aurelia/commit/dc22fb7))


### Refactorings:

* **event:** no longer call prevent default by default (#1926) ([f71e9e7](https://github.com/aurelia/aurelia/commit/f71e9e7))
* **runtime:** move ctor reg into controller ([7a15551](https://github.com/aurelia/aurelia/commit/7a15551))
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

### Features:

* **enhance:** call app tasks with `.enhance` API (#1916) ([4d522b2](https://github.com/aurelia/aurelia/commit/4d522b2))

<a name="2.0.0-beta.11"></a>
# 2.0.0-beta.11 (2024-02-13)

### Features:

* **event:** ability to add modifier (#1891) ([67a3c22](https://github.com/aurelia/aurelia/commit/67a3c22))
* **state:** support redux devtools for the state plugin (#1888) ([bd07160](https://github.com/aurelia/aurelia/commit/bd07160))


### Bug Fixes:

* ***:** upgrade rollup, tweak build scripts ([bd07160](https://github.com/aurelia/aurelia/commit/bd07160))


### Refactorings:

* **fetch-client:** cleanup, add tests, tweak doc & prepare cache interceptor (#1756) ([a931dac](https://github.com/aurelia/aurelia/commit/a931dac))

<a name="2.0.0-beta.10"></a>
# 2.0.0-beta.10 (2024-01-26)

### Refactorings:

* **enums:** string literal types in favour of const enums (#1870) ([e21e0c9](https://github.com/aurelia/aurelia/commit/e21e0c9))

<a name="2.0.0-beta.9"></a>
# 2.0.0-beta.9 (2023-12-12)

### Bug Fixes:

* **repeater:** duplicate primitive handling, batched mutation fix (#1840) ([703d275](https://github.com/aurelia/aurelia/commit/703d275))
* **repeat:** fix sort+splice batched operation bug ([703d275](https://github.com/aurelia/aurelia/commit/703d275))


### Refactorings:

* **templating:** remove strict binding option from CE (#1807) ([7b4455f](https://github.com/aurelia/aurelia/commit/7b4455f))
* **tests:** move all under src folder ([7b4455f](https://github.com/aurelia/aurelia/commit/7b4455f))

<a name="2.0.0-beta.8"></a>
# 2.0.0-beta.8 (2023-07-24)

### Refactorings:

* **ref:** deprecate view-model.ref and introduce component.ref (#1803) ([97e8dad](https://github.com/aurelia/aurelia/commit/97e8dad))

<a name="2.0.0-beta.7"></a>
# 2.0.0-beta.7 (2023-06-16)

### Features:

* **build:** add a development entry point (#1770) ([69ff445](https://github.com/aurelia/aurelia/commit/69ff445))

<a name="2.0.0-beta.6"></a>
# 2.0.0-beta.6 (2023-05-21)

### Features:

* **bindable:** support getter/setter (#1753) ([4279851](https://github.com/aurelia/aurelia/commit/4279851))

<a name="2.0.0-beta.5"></a>
# 2.0.0-beta.5 (2023-04-27)

### Features:

* **di:** property injection with `resolve` (#1748) ([a22826a](https://github.com/aurelia/aurelia/commit/a22826a))
* **aurelia:** ability to inject with `Aurelia` export beside `IAurelia` ([a22826a](https://github.com/aurelia/aurelia/commit/a22826a))

<a name="2.0.0-beta.4"></a>
# 2.0.0-beta.4 (2023-04-13)

### Features:

* **slotted:** add slotted decorator, slotchange bindable for au-slot (#1735) ([8cf87af](https://github.com/aurelia/aurelia/commit/8cf87af))


### Refactorings:

* **children:** make children observation a binding (#1732) ([5bde983](https://github.com/aurelia/aurelia/commit/5bde983))
* **children:** make children deco as a hook ([5bde983](https://github.com/aurelia/aurelia/commit/5bde983))
* **children:** remove children observers from custom element def ([5bde983](https://github.com/aurelia/aurelia/commit/5bde983))
* **children:** cleanup children observer related code, rename to binding ([5bde983](https://github.com/aurelia/aurelia/commit/5bde983))
* **observers:** remove intermediate vars ([5bde983](https://github.com/aurelia/aurelia/commit/5bde983))
* ***:** ignore dev message coverage ([5bde983](https://github.com/aurelia/aurelia/commit/5bde983))

<a name="2.0.0-beta.3"></a>
# 2.0.0-beta.3 (2023-03-24)

### Refactorings:

* **controller:** remove lifecycle flags (#1707) ([a31cd75](https://github.com/aurelia/aurelia/commit/a31cd75))
* **ci:** remove e2e safari from pipeline ([a31cd75](https://github.com/aurelia/aurelia/commit/a31cd75))
* **tests:** disable hook tests ([a31cd75](https://github.com/aurelia/aurelia/commit/a31cd75))
* **build:** use turbo to boost build speed (#1692) ([d99b136](https://github.com/aurelia/aurelia/commit/d99b136))

<a name="2.0.0-beta.2"></a>
# 2.0.0-beta.2 (2023-02-26)

**Note:** Version bump only for package aurelia

<a name="2.0.0-beta.1"></a>
# 2.0.0-beta.1 (2023-01-12)

### Performance Improvements:

* ***:** move render location creation to compiler (#1605) ([66846b1](https://github.com/aurelia/aurelia/commit/66846b1))


### Refactorings:

* ***:** move webcomponents plugin into separate package ([065a949](https://github.com/aurelia/aurelia/commit/065a949))
* ***:** remove create element API ([de5faf4](https://github.com/aurelia/aurelia/commit/de5faf4))
* ***:** remove dialog export from aurelia pkg ([73e3078](https://github.com/aurelia/aurelia/commit/73e3078))
* ***:** remove event delegator, move completely to compat ([cca1ce8](https://github.com/aurelia/aurelia/commit/cca1ce8))
* **event:** remove .delegate, add .delegate to compat package ([d1539a2](https://github.com/aurelia/aurelia/commit/d1539a2))
* **runtime:** cleanup & size opt, rename binding methods (#1582) ([2000e3b](https://github.com/aurelia/aurelia/commit/2000e3b))

<a name="2.0.0-alpha.41"></a>
# 2.0.0-alpha.41 (2022-09-22)

### Features:

* **collection-observation:** add ability to batch mutation into a single indexmap ([39b3f82](https://github.com/aurelia/aurelia/commit/39b3f82))


### Bug Fixes:

* ***:** call listener with correct scope, move flush queue to binding ([70d1329](https://github.com/aurelia/aurelia/commit/70d1329))


### Refactorings:

* ***:** remove work tracker ([96f90c6](https://github.com/aurelia/aurelia/commit/96f90c6))
* ***:** cleanup unnecessary exports in kernel ([045d80d](https://github.com/aurelia/aurelia/commit/045d80d))
* **runtime:** simplify expressionkind enum ([0f480e1](https://github.com/aurelia/aurelia/commit/0f480e1))
* ***:** always handle event handler as fn (#1563) ([6037495](https://github.com/aurelia/aurelia/commit/6037495))
* ***:** remove flags from observers (#1557) ([9f9a8fe](https://github.com/aurelia/aurelia/commit/9f9a8fe))
* **binding:** move BindingMode to runtime-html (#1555) ([c75618b](https://github.com/aurelia/aurelia/commit/c75618b))
* **ast:** remove flags from evaluate (#1553) ([dda997b](https://github.com/aurelia/aurelia/commit/dda997b))

<a name="2.0.0-alpha.40"></a>
# 2.0.0-alpha.40 (2022-09-07)

**Note:** Version bump only for package aurelia

<a name="2.0.0-alpha.39"></a>
# 2.0.0-alpha.39 (2022-09-01)

**Note:** Version bump only for package aurelia

<a name="2.0.0-alpha.38"></a>
# 2.0.0-alpha.38 (2022-08-17)

**Note:** Version bump only for package aurelia

<a name="2.0.0-alpha.37"></a>
# 2.0.0-alpha.37 (2022-08-03)

**Note:** Version bump only for package aurelia

<a name="2.0.0-alpha.36"></a>
# 2.0.0-alpha.36 (2022-07-25)

### Features:

* **capture:** convention & deco shortcut (#1469) ([e89d3ad](https://github.com/aurelia/aurelia/commit/e89d3ad))
* **loader:** strip <capture> ([e89d3ad](https://github.com/aurelia/aurelia/commit/e89d3ad))
* **element:** capture decorator and <capture/> ([e89d3ad](https://github.com/aurelia/aurelia/commit/e89d3ad))

<a name="2.0.0-alpha.35"></a>
# 2.0.0-alpha.35 (2022-06-08)

### Features:

* **ts-jest,babel-jest:** upgrade to jest v28 (#1449) ([b1ec85c](https://github.com/aurelia/aurelia/commit/b1ec85c))

<a name="2.0.0-alpha.34"></a>
# 2.0.0-alpha.34 (2022-06-03)

**Note:** Version bump only for package aurelia

<a name="2.0.0-alpha.33"></a>
# 2.0.0-alpha.33 (2022-05-26)

**Note:** Version bump only for package aurelia

<a name="2.0.0-alpha.32"></a>
# 2.0.0-alpha.32 (2022-05-22)

**Note:** Version bump only for package aurelia

<a name="2.0.0-alpha.31"></a>
# 2.0.0-alpha.31 (2022-05-15)

### Refactorings:

* ***:** cleanup unused flags ([c4ce901](https://github.com/aurelia/aurelia/commit/c4ce901))

<a name="2.0.0-alpha.30"></a>
# 2.0.0-alpha.30 (2022-05-07)

### Refactorings:

* **runtime-html:** remove .js from im/export, add type to barrel ([973ae46](https://github.com/aurelia/aurelia/commit/973ae46))
* **runtime:** remove .js from im/export, add type to barrel ([973ae46](https://github.com/aurelia/aurelia/commit/973ae46))
* **kernel:** remove .js from im/ex, add type to barrel ([973ae46](https://github.com/aurelia/aurelia/commit/973ae46))
* **testing:** remove .js from im/ex, add type to barrel ([973ae46](https://github.com/aurelia/aurelia/commit/973ae46))
* **store-v1:** remove .js from im/ex, add type to barrel ([973ae46](https://github.com/aurelia/aurelia/commit/973ae46))
* **validation:** remove .js from im/ex, add type to barrel ([973ae46](https://github.com/aurelia/aurelia/commit/973ae46))
* **validation-html:** remove .js from im/ex, add type to barrel ([973ae46](https://github.com/aurelia/aurelia/commit/973ae46))
* **validation-i18n:** remove .js from im/ex, add type to barrel ([973ae46](https://github.com/aurelia/aurelia/commit/973ae46))
* **router-lite:** remove .js from im/ex, add type to barrel ([973ae46](https://github.com/aurelia/aurelia/commit/973ae46))
* **router:** remove .js from im/ex, add type to barrel ([973ae46](https://github.com/aurelia/aurelia/commit/973ae46))
* **i18n:** remove .js from im/ex, add type to barrel ([973ae46](https://github.com/aurelia/aurelia/commit/973ae46))
* **fetch-client:** remove .js from im/ex, add type to barrel ([973ae46](https://github.com/aurelia/aurelia/commit/973ae46))
* **tests:** correct import origins ([973ae46](https://github.com/aurelia/aurelia/commit/973ae46))
* **all:** remove imports from re-barrel ([973ae46](https://github.com/aurelia/aurelia/commit/973ae46))
* **all:** remove imports of re-barrel ([973ae46](https://github.com/aurelia/aurelia/commit/973ae46))
* **all:** remove imports of re-barrel ([973ae46](https://github.com/aurelia/aurelia/commit/973ae46))
* **all:** remove imports of re-barrel ([973ae46](https://github.com/aurelia/aurelia/commit/973ae46))

<a name="2.0.0-alpha.29"></a>
# 2.0.0-alpha.29 (2022-04-27)

**Note:** Version bump only for package aurelia

<a name="2.0.0-alpha.28"></a>
# 2.0.0-alpha.28 (2022-04-16)

### Refactorings:

* **router:** restore aurelia packages ([334864d](https://github.com/aurelia/aurelia/commit/334864d))
* **router:** fix rebase issues ([7e9d6c3](https://github.com/aurelia/aurelia/commit/7e9d6c3))
* **router:** implement RouterOptions ([78ac2c0](https://github.com/aurelia/aurelia/commit/78ac2c0))
* **router:** replace ViewportInstruction with RoutingInstruction ([4e15dbc](https://github.com/aurelia/aurelia/commit/4e15dbc))

<a name="2.0.0-alpha.27"></a>
# 2.0.0-alpha.27 (2022-04-08)

### Bug Fixes:

* **build:** ensure correct __DEV__ build value replacement (#1377) ([40ce0e3](https://github.com/aurelia/aurelia/commit/40ce0e3))

<a name="2.0.0-alpha.26"></a>
# 2.0.0-alpha.26 (2022-03-13)

**Note:** Version bump only for package aurelia

<a name="2.0.0-alpha.25"></a>
# 2.0.0-alpha.25 (2022-03-08)

**Note:** Version bump only for package aurelia

<a name="2.0.0-alpha.24"></a>
# 2.0.0-alpha.24 (2022-01-18)

**Note:** Version bump only for package aurelia

<a name="2.0.0-alpha.23"></a>
# 2.0.0-alpha.23 (2021-11-22)

### Refactorings:

* **runtime-html:** coercing configuration options ([cba53c7](https://github.com/aurelia/aurelia/commit/cba53c7))

<a name="2.0.0-alpha.22"></a>
# 2.0.0-alpha.22 (2021-10-24)

**Note:** Version bump only for package aurelia

<a name="2.0.0-alpha.21"></a>
# 2.0.0-alpha.21 (2021-09-12)

**Note:** Version bump only for package aurelia

<a name="2.0.0-alpha.20"></a>
# 2.0.0-alpha.20 (2021-09-04)

**Note:** Version bump only for package aurelia

<a name="2.0.0-alpha.19"></a>
# 2.0.0-alpha.19 (2021-08-29)

### Bug Fixes:

* **template-compiler:** capture ignore attr command on bindable like props ([0a52fbf](https://github.com/aurelia/aurelia/commit/0a52fbf))
* ***:** export ITemplateCompiler from aurelia package ([0a52fbf](https://github.com/aurelia/aurelia/commit/0a52fbf))

<a name="2.0.0-alpha.18"></a>
# 2.0.0-alpha.18 (2021-08-22)

**Note:** Version bump only for package aurelia

<a name="2.0.0-alpha.17"></a>
# 2.0.0-alpha.17 (2021-08-16)

### Refactorings:

* **all:** rename BindingType -> ExpressionType ([8cf4061](https://github.com/aurelia/aurelia/commit/8cf4061))

<a name="2.0.0-alpha.16"></a>
# 2.0.0-alpha.16 (2021-08-07)

### Features:

* **wc:** add web-component plugin ([74589bc](https://github.com/aurelia/aurelia/commit/74589bc))


### Refactorings:

* **all:** use a terser name cache for predictable prop mangling ([7649ced](https://github.com/aurelia/aurelia/commit/7649ced))

<a name="2.0.0-alpha.15"></a>
# 2.0.0-alpha.15 (2021-08-01)

**Note:** Version bump only for package aurelia

<a name="2.0.0-alpha.14"></a>
# 2.0.0-alpha.14 (2021-07-25)

### Refactorings:

* **runtime:** mark more private properties ([8ecf70b](https://github.com/aurelia/aurelia/commit/8ecf70b))

<a name="2.0.0-alpha.13"></a>
# 2.0.0-alpha.13 (2021-07-19)

### Refactorings:

* **enhance:** incorporate reviews, enhance returns raw controller ([5504ad9](https://github.com/aurelia/aurelia/commit/5504ad9))

<a name="2.0.0-alpha.12"></a>
# 2.0.0-alpha.12 (2021-07-11)

**Note:** Version bump only for package aurelia

<a name="2.0.0-alpha.11"></a>
# 2.0.0-alpha.11 (2021-07-11)

### Bug Fixes:

* **call-binding:** assign args to event property, fixes #1231 ([fa4c0d4](https://github.com/aurelia/aurelia/commit/fa4c0d4))

<a name="2.0.0-alpha.10"></a>
# 2.0.0-alpha.10 (2021-07-04)

### Features:

* **template-compiler:** add hooks decorator support, more integration tests ([dd3698d](https://github.com/aurelia/aurelia/commit/dd3698d))


### Refactorings:

* **templating:** remove blur CA, tweak doc/tests ([1286b3b](https://github.com/aurelia/aurelia/commit/1286b3b))

<a name="2.0.0-alpha.9"></a>
# 2.0.0-alpha.9 (2021-06-25)

### Refactorings:

* **attr-syntax-transformer:** rename IAttrSyntaxTransformer ([71f5ceb](https://github.com/aurelia/aurelia/commit/71f5ceb))
* **all:** separate value from typing imports ([71f5ceb](https://github.com/aurelia/aurelia/commit/71f5ceb))

<a name="2.0.0-alpha.8"></a>
# 2.0.0-alpha.8 (2021-06-22)

### Refactorings:

* **template-compiler:** remove BindingCommand.prototype.compile ([63dee52](https://github.com/aurelia/aurelia/commit/63dee52))

<a name="2.0.0-alpha.7"></a>
# 2.0.0-alpha.7 (2021-06-20)

**Note:** Version bump only for package aurelia

<a name="2.0.0-alpha.6"></a>
# 2.0.0-alpha.6 (2021-06-11)

**Note:** Version bump only for package aurelia

<a name="2.0.0-alpha.5"></a>
# 2.0.0-alpha.5 (2021-05-31)

**Note:** Version bump only for package aurelia

<a name="2.0.0-alpha.4"></a>
# 2.0.0-alpha.4 (2021-05-25)

**Note:** Version bump only for package aurelia

<a name="2.0.0-alpha.3"></a>
# 2.0.0-alpha.3 (2021-05-19)

**Note:** Version bump only for package aurelia

<a name="2.0.0-alpha.2"></a>
# 2.0.0-alpha.2 (2021-03-07)

**Note:** Version bump only for package aurelia

<a name="2.0.0-alpha.1"></a>
# 2.0.0-alpha.1 (2021-03-03)

**Note:** Version bump only for package aurelia

<a name="2.0.0-alpha.0"></a>
# 2.0.0-alpha.0 (2021-03-02)

### Bug Fixes:

* **missing:** resource.d.ts exposing incorrect ([2d71ce5](https://github.com/aurelia/aurelia/commit/2d71ce5))
* **missing:** resource.d.ts exposing incorrect ([142b31f](https://github.com/aurelia/aurelia/commit/142b31f))

<a name="0.9.0"></a>
# 0.9.0 (2021-01-31)

### Features:

* **runtime-html:** add @lifecycleHooks wiring ([4076293](https://github.com/aurelia/aurelia/commit/4076293))
* **fetch-client:** add IHttpClient interface ([b1a7a6d](https://github.com/aurelia/aurelia/commit/b1a7a6d))
* **fetch-client:** add IHttpClient interface ([867887d](https://github.com/aurelia/aurelia/commit/867887d))
* **work-tracker:** initial implementation for an app-wide 'wait-for-idle' api ([c677a4d](https://github.com/aurelia/aurelia/commit/c677a4d))


### Bug Fixes:

* **aurelia:** export IRouterEvents ([09e5785](https://github.com/aurelia/aurelia/commit/09e5785))
* **export:** export new interfaces ([5febd83](https://github.com/aurelia/aurelia/commit/5febd83))


### Refactorings:

* **logging:** replace $console config option with ConsoleSink ([4ea5d22](https://github.com/aurelia/aurelia/commit/4ea5d22))
* **all:** remove ILifecycle ([d141d8e](https://github.com/aurelia/aurelia/commit/d141d8e))
* **obs:** remove IPropertyObserver ([d29bc28](https://github.com/aurelia/aurelia/commit/d29bc28))
* **all:** remove IBindingTargetAccessor & IBindingTargetObserver interfaces ([d9c27c6](https://github.com/aurelia/aurelia/commit/d9c27c6))
* **runtime:** reexport watch on aurelia package ([e7a46e4](https://github.com/aurelia/aurelia/commit/e7a46e4))
* **runtime:** reexport watch on aurelia package ([af29a73](https://github.com/aurelia/aurelia/commit/af29a73))
* **router:** port of PR #845 ([a67d0a2](https://github.com/aurelia/aurelia/commit/a67d0a2))

<a name="0.8.0"></a>
# 0.8.0 (2020-11-30)

### Features:

* **runtime-html:** add IEventTarget interface to specify event delegate target ([90b804c](https://github.com/aurelia/aurelia/commit/90b804c))
* **aurelia:** export PLATFORM global ([7f666c8](https://github.com/aurelia/aurelia/commit/7f666c8))


### Bug Fixes:

* **aurelia:** use PLATFORM.getOrCreate(globalThis) instead of new with window ([56c65e5](https://github.com/aurelia/aurelia/commit/56c65e5))


### Refactorings:

* **aurelia:** re-export AppTask and IAttrSyntaxTransformer ([433a8bc](https://github.com/aurelia/aurelia/commit/433a8bc))
* **controller:** remove projector abstraction & rework attaching ([d69d03d](https://github.com/aurelia/aurelia/commit/d69d03d))
* **instructions:** merge listener instructions into one class ([5ef5e2e](https://github.com/aurelia/aurelia/commit/5ef5e2e))
* **all:** remove strategy configuration ([0ae57c0](https://github.com/aurelia/aurelia/commit/0ae57c0))
* **instructions:** merge to-view, two-way, from-view and one-time ([4a12c1d](https://github.com/aurelia/aurelia/commit/4a12c1d))
* ***:** remove references to proxy strategy & proxy observer ([b1dfe93](https://github.com/aurelia/aurelia/commit/b1dfe93))
* **templating:** remove hooks from CE definition ([dcd2762](https://github.com/aurelia/aurelia/commit/dcd2762))
* **templating:** remove ResourceModel ([e4f2042](https://github.com/aurelia/aurelia/commit/e4f2042))
* **runtime-html:** rename InstructionComposer to Renderer and remove Composer abstraction ([6499d31](https://github.com/aurelia/aurelia/commit/6499d31))
* **all:** rename CompositionContext back to RenderContext again ([1d7673b](https://github.com/aurelia/aurelia/commit/1d7673b))
* **all:** rename RuntimeHtmlConfiguration to StandardConfiguration ([665f3ba](https://github.com/aurelia/aurelia/commit/665f3ba))
* **all:** move scheduler implementation to platform ([e22285a](https://github.com/aurelia/aurelia/commit/e22285a))
* **scheduler:** remove ITaskQueue interface ([5b7b276](https://github.com/aurelia/aurelia/commit/5b7b276))
* **all:** remove IDOM, HTMLDOM and DOM; replace DOM with PLATFORM ([6447468](https://github.com/aurelia/aurelia/commit/6447468))
* **all:** move html-specific stuff from runtime to runtime-html and remove Node generics ([c745963](https://github.com/aurelia/aurelia/commit/c745963))
* **all:** remove debug package ([a1bdb60](https://github.com/aurelia/aurelia/commit/a1bdb60))
* **all:** remove PLATFORM global ([fdef656](https://github.com/aurelia/aurelia/commit/fdef656))
* **event-manager:** rename EventManager to EventDelegator ([9150bb4](https://github.com/aurelia/aurelia/commit/9150bb4))
* **all:** simplify DOM initialization, remove DOMInitializer ([ff13185](https://github.com/aurelia/aurelia/commit/ff13185))
* **runtime:** rename CompositionRoot to AppRoot ([3141a2c](https://github.com/aurelia/aurelia/commit/3141a2c))
* **runtime:** move Aurelia from runtime to runtime-html ([d56c4ca](https://github.com/aurelia/aurelia/commit/d56c4ca))
* **all:** shorten TargetedInstruction to Instruction ([a7e61c6](https://github.com/aurelia/aurelia/commit/a7e61c6))
* **all:** shorten TargetedInstructionType to InstructionType ([7fe8d04](https://github.com/aurelia/aurelia/commit/7fe8d04))
* **all:** finish renaming render to compose ([ede127b](https://github.com/aurelia/aurelia/commit/ede127b))
* **runtime:** move rendering, binding commands, attr patterns and instructions to runtime-html ([bc010f5](https://github.com/aurelia/aurelia/commit/bc010f5))
* **all:** rename renderer to composer ([c1a0f3c](https://github.com/aurelia/aurelia/commit/c1a0f3c))
* **runtime:** add ICompositionRoot and IAurelia interfaces and pass container+root into controllers ([23477a3](https://github.com/aurelia/aurelia/commit/23477a3))
* **all:** simplify Aurelia#start/stop & AppTask#run, returning promise instead of task ([6c7608d](https://github.com/aurelia/aurelia/commit/6c7608d))
* **scope:** remove IScope interface and use import type where possible for Scope ([6b8eb5f](https://github.com/aurelia/aurelia/commit/6b8eb5f))
* **all:** remove reporter ([425fe96](https://github.com/aurelia/aurelia/commit/425fe96))
* **all:** remove AST interfaces ([7e04d83](https://github.com/aurelia/aurelia/commit/7e04d83))
* **all:** merge jit-html into runtime-html and remove jit-html-* packages ([f530bcf](https://github.com/aurelia/aurelia/commit/f530bcf))
* **all:** merge jit into runtime and remove jit package + references ([d7b626b](https://github.com/aurelia/aurelia/commit/d7b626b))
* **router:** add more lifecycle behaviors ([e46f77c](https://github.com/aurelia/aurelia/commit/e46f77c))
* **runtime:** merge controller api bind+attach into activate, detach+unbind into deactivate, and remove ILifecycleTask usage from controller ([15f3885](https://github.com/aurelia/aurelia/commit/15f3885))
* **event-aggregator:** fix types ([6b89325](https://github.com/aurelia/aurelia/commit/6b89325))

<a name="0.7.0"></a>
# 0.7.0 (2020-05-08)

### Bug Fixes:

* ***:** remove deleted export ([6a562ff](https://github.com/aurelia/aurelia/commit/6a562ff))


### Refactorings:

* ***:** rename isNumeric to isArrayIndex ([2fab646](https://github.com/aurelia/aurelia/commit/2fab646))
* **router:** clean up ([a3a4d5b](https://github.com/aurelia/aurelia/commit/a3a4d5b))

<a name="0.6.0"></a>
# 0.6.0 (2019-12-18)

### Features:

* **controller:** add create/beforeCompile/afterCompile/afterCompileChildren hooks ([3a8c215](https://github.com/aurelia/aurelia/commit/3a8c215))


### Refactorings:

* **bindable-observer:** rename self-observer -> bindable-observer ([bc0647c](https://github.com/aurelia/aurelia/commit/bc0647c))

<a name="0.5.0"></a>
# 0.5.0 (2019-11-15)

**Note:** Version bump only for package aurelia

<a name="0.4.0"></a>
# 0.4.0 (2019-10-26)

### Features:

* **aurelia:** re-export all in a single "aurelia" package, and a wrapper to start app ([31c9ccf](https://github.com/aurelia/aurelia/commit/31c9ccf))


### Refactorings:

* **all:** update definition refs ([676e86a](https://github.com/aurelia/aurelia/commit/676e86a))
* **resources): prepend with a:**  ([dd7c238](https://github.com/aurelia/aurelia/commit/dd7c238))
* **aurelia:** extend Aurelia to create static methods for quick start ([11f8a87](https://github.com/aurelia/aurelia/commit/11f8a87))
* **all:** rename BasicConfiguration in various packages ([7e330d8](https://github.com/aurelia/aurelia/commit/7e330d8))

