# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

<a name="2.0.0-beta.20"></a>
# 2.0.0-beta.20 (2024-07-07)

### Refactorings:

* **validation:** state rule ([9df93e0](https://github.com/aurelia/aurelia/commit/9df93e0))

<a name="2.0.0-beta.19"></a>
# 2.0.0-beta.19 (2024-06-12)

### Features:

* **validation:** state rule (#1985) ([8f2df94](https://github.com/aurelia/aurelia/commit/8f2df94))

<a name="2.0.0-beta.18"></a>
# 2.0.0-beta.18 (2024-05-23)

### Refactorings:

* ***:** extract error codes and cleanup (#1974) ([63ffdc9](https://github.com/aurelia/aurelia/commit/63ffdc9))
* **i18n-validation:** replace errors with error codes (#1972) ([f91f31c](https://github.com/aurelia/aurelia/commit/f91f31c))

<a name="2.0.0-beta.17"></a>
# 2.0.0-beta.17 (2024-05-11)

### Refactorings:

* **kernel:** mark side effect free (#1964) ([22c8f71](https://github.com/aurelia/aurelia/commit/22c8f71))

<a name="2.0.0-beta.16"></a>
# 2.0.0-beta.16 (2024-05-03)

### Refactorings:

* ***:** move scope to runtime html (#1945) ([bca0290](https://github.com/aurelia/aurelia/commit/bca0290))

<a name="2.0.0-beta.15"></a>
# 2.0.0-beta.15 (2024-04-17)

### Bug Fixes:

* ***:** residual decorator work (#1942) ([7e8c12f](https://github.com/aurelia/aurelia/commit/7e8c12f))


### Refactorings:

* **bindings:** move binding infra to runtime html (#1944) ([1c7608a](https://github.com/aurelia/aurelia/commit/1c7608a))
* **expression-parser:** move exp parser to its own package (#1943) ([6e7dcad](https://github.com/aurelia/aurelia/commit/6e7dcad))
* ***:** migration to TC39 decorators + metadata simplification (#1932) ([22f90ad](https://github.com/aurelia/aurelia/commit/22f90ad))

<a name="2.0.0-beta.14"></a>
# 2.0.0-beta.14 (2024-04-03)

### Features:

* **i18n:** support multiple versions of i18next (#1927) ([0789ee5](https://github.com/aurelia/aurelia/commit/0789ee5))

<a name="2.0.0-beta.13"></a>
# 2.0.0-beta.13 (2024-03-15)

### Bug Fixes:

* **router:** dont swallow instantiation error details ([deee8e6](https://github.com/aurelia/aurelia/commit/deee8e6))
* ***:** cleanup di & router tests, add timeout ([deee8e6](https://github.com/aurelia/aurelia/commit/deee8e6))
* ***:** router errors stringify ([deee8e6](https://github.com/aurelia/aurelia/commit/deee8e6))
* ***:** deepscan issues ([deee8e6](https://github.com/aurelia/aurelia/commit/deee8e6))


### Refactorings:

* ***:** smaller di files, assert text options, more au slot tests ([deee8e6](https://github.com/aurelia/aurelia/commit/deee8e6))

<a name="2.0.0-beta.12"></a>
# 2.0.0-beta.12 (2024-03-02)

**Note:** Version bump only for package @aurelia/validation

<a name="2.0.0-beta.11"></a>
# 2.0.0-beta.11 (2024-02-13)

### Features:

* **runtime:** impl 'this' / AccessBoundary (#1892) ([6d3d250](https://github.com/aurelia/aurelia/commit/6d3d250))
* **state:** support redux devtools for the state plugin (#1888) ([bd07160](https://github.com/aurelia/aurelia/commit/bd07160))


### Bug Fixes:

* ***:** upgrade rollup, tweak build scripts ([bd07160](https://github.com/aurelia/aurelia/commit/bd07160))

<a name="2.0.0-beta.10"></a>
# 2.0.0-beta.10 (2024-01-26)

### Bug Fixes:

* **validation:** property parsing with lambda and istanbul (#1877) ([71f82cf](https://github.com/aurelia/aurelia/commit/71f82cf))
* **validation:** property parsing with lambda and istanbul ([71f82cf](https://github.com/aurelia/aurelia/commit/71f82cf))


### Refactorings:

* **enums:** string literal types in favour of const enums (#1870) ([e21e0c9](https://github.com/aurelia/aurelia/commit/e21e0c9))

<a name="2.0.0-beta.9"></a>
# 2.0.0-beta.9 (2023-12-12)

### Bug Fixes:

* **validation:** property accessor ignore instrumenter (#1839) ([342847f](https://github.com/aurelia/aurelia/commit/342847f))
* **validation:** property accessor ignore instrumenter ([342847f](https://github.com/aurelia/aurelia/commit/342847f))
* **validation:** allowed rules.off on object w/o rules ([342847f](https://github.com/aurelia/aurelia/commit/342847f))

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

**Note:** Version bump only for package @aurelia/validation

<a name="2.0.0-beta.5"></a>
# 2.0.0-beta.5 (2023-04-27)

### Refactorings:

* **build:** preserve pure annotation for better tree shaking (#1745) ([0bc5cd6](https://github.com/aurelia/aurelia/commit/0bc5cd6))

<a name="2.0.0-beta.4"></a>
# 2.0.0-beta.4 (2023-04-13)

**Note:** Version bump only for package @aurelia/validation

<a name="2.0.0-beta.3"></a>
# 2.0.0-beta.3 (2023-03-24)

### Refactorings:

* **controller:** remove lifecycle flags (#1707) ([a31cd75](https://github.com/aurelia/aurelia/commit/a31cd75))
* **ci:** remove e2e safari from pipeline ([a31cd75](https://github.com/aurelia/aurelia/commit/a31cd75))
* **tests:** disable hook tests ([a31cd75](https://github.com/aurelia/aurelia/commit/a31cd75))

<a name="2.0.0-beta.2"></a>
# 2.0.0-beta.2 (2023-02-26)

**Note:** Version bump only for package @aurelia/validation

<a name="2.0.0-beta.1"></a>
# 2.0.0-beta.1 (2023-01-12)

### Features:

* **repeat:** add keyed mode (#1583) ([d0c5706](https://github.com/aurelia/aurelia/commit/d0c5706))
* **compat:** add ast methods to compat package ([8b99581](https://github.com/aurelia/aurelia/commit/8b99581))


### Refactorings:

* **runtime:** cleanup & size opt, rename binding methods (#1582) ([2000e3b](https://github.com/aurelia/aurelia/commit/2000e3b))
* **bindings:** create override fn instead of binding interceptor ([5c2ed80](https://github.com/aurelia/aurelia/commit/5c2ed80))
* **ast:** extract evaluate into a seprate fn ([6691f7f](https://github.com/aurelia/aurelia/commit/6691f7f))
* **ast:** extract visit APIs into a fn ([a9d2abb](https://github.com/aurelia/aurelia/commit/a9d2abb))

<a name="2.0.0-alpha.41"></a>
# 2.0.0-alpha.41 (2022-09-22)

### Refactorings:

* **runtime:** simplify expressionkind enum ([0f480e1](https://github.com/aurelia/aurelia/commit/0f480e1))
* **runtime:** move LifecycleFlags to runtime-html ([ef35bc7](https://github.com/aurelia/aurelia/commit/ef35bc7))
* **ast:** remove flags from evaluate (#1553) ([dda997b](https://github.com/aurelia/aurelia/commit/dda997b))

<a name="2.0.0-alpha.40"></a>
# 2.0.0-alpha.40 (2022-09-07)

### Features:

* **template:** support arrow function syntax (#1541) ([499ace7](https://github.com/aurelia/aurelia/commit/499ace7))

<a name="2.0.0-alpha.39"></a>
# 2.0.0-alpha.39 (2022-09-01)

**Note:** Version bump only for package @aurelia/validation

<a name="2.0.0-alpha.38"></a>
# 2.0.0-alpha.38 (2022-08-17)

**Note:** Version bump only for package @aurelia/validation

<a name="2.0.0-alpha.37"></a>
# 2.0.0-alpha.37 (2022-08-03)

**Note:** Version bump only for package @aurelia/validation

<a name="2.0.0-alpha.36"></a>
# 2.0.0-alpha.36 (2022-07-25)

**Note:** Version bump only for package @aurelia/validation

<a name="2.0.0-alpha.35"></a>
# 2.0.0-alpha.35 (2022-06-08)

### Features:

* **ts-jest,babel-jest:** upgrade to jest v28 (#1449) ([b1ec85c](https://github.com/aurelia/aurelia/commit/b1ec85c))

<a name="2.0.0-alpha.34"></a>
# 2.0.0-alpha.34 (2022-06-03)

**Note:** Version bump only for package @aurelia/validation

<a name="2.0.0-alpha.33"></a>
# 2.0.0-alpha.33 (2022-05-26)

**Note:** Version bump only for package @aurelia/validation

<a name="2.0.0-alpha.32"></a>
# 2.0.0-alpha.32 (2022-05-22)

**Note:** Version bump only for package @aurelia/validation

<a name="2.0.0-alpha.31"></a>
# 2.0.0-alpha.31 (2022-05-15)

**Note:** Version bump only for package @aurelia/validation

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

**Note:** Version bump only for package @aurelia/validation

<a name="2.0.0-alpha.28"></a>
# 2.0.0-alpha.28 (2022-04-16)

**Note:** Version bump only for package @aurelia/validation

<a name="2.0.0-alpha.27"></a>
# 2.0.0-alpha.27 (2022-04-08)

### Bug Fixes:

* **build:** ensure correct __DEV__ build value replacement (#1377) ([40ce0e3](https://github.com/aurelia/aurelia/commit/40ce0e3))

<a name="2.0.0-alpha.26"></a>
# 2.0.0-alpha.26 (2022-03-13)

**Note:** Version bump only for package @aurelia/validation

<a name="2.0.0-alpha.25"></a>
# 2.0.0-alpha.25 (2022-03-08)

**Note:** Version bump only for package @aurelia/validation

<a name="2.0.0-alpha.24"></a>
# 2.0.0-alpha.24 (2022-01-18)

**Note:** Version bump only for package @aurelia/validation

<a name="2.0.0-alpha.23"></a>
# 2.0.0-alpha.23 (2021-11-22)

**Note:** Version bump only for package @aurelia/validation

<a name="2.0.0-alpha.22"></a>
# 2.0.0-alpha.22 (2021-10-24)

### Bug Fixes:

* ***:** broken test ([257326c](https://github.com/aurelia/aurelia/commit/257326c))
* ***:** broken build ([3ececf2](https://github.com/aurelia/aurelia/commit/3ececf2))

<a name="2.0.0-alpha.21"></a>
# 2.0.0-alpha.21 (2021-09-12)

**Note:** Version bump only for package @aurelia/validation

<a name="2.0.0-alpha.20"></a>
# 2.0.0-alpha.20 (2021-09-04)

**Note:** Version bump only for package @aurelia/validation

<a name="2.0.0-alpha.19"></a>
# 2.0.0-alpha.19 (2021-08-29)

**Note:** Version bump only for package @aurelia/validation

<a name="2.0.0-alpha.18"></a>
# 2.0.0-alpha.18 (2021-08-22)

**Note:** Version bump only for package @aurelia/validation

<a name="2.0.0-alpha.17"></a>
# 2.0.0-alpha.17 (2021-08-16)

### Refactorings:

* **all:** rename BindingType -> ExpressionType ([8cf4061](https://github.com/aurelia/aurelia/commit/8cf4061))
* **command:** simplify binding type enum ([6651678](https://github.com/aurelia/aurelia/commit/6651678))

<a name="2.0.0-alpha.16"></a>
# 2.0.0-alpha.16 (2021-08-07)

### Refactorings:

* **all:** use a terser name cache for predictable prop mangling ([7649ced](https://github.com/aurelia/aurelia/commit/7649ced))

<a name="2.0.0-alpha.15"></a>
# 2.0.0-alpha.15 (2021-08-01)

**Note:** Version bump only for package @aurelia/validation

<a name="2.0.0-alpha.14"></a>
# 2.0.0-alpha.14 (2021-07-25)

**Note:** Version bump only for package @aurelia/validation

<a name="2.0.0-alpha.13"></a>
# 2.0.0-alpha.13 (2021-07-19)

### Refactorings:

* **scope:** remove host scope ([0349810](https://github.com/aurelia/aurelia/commit/0349810))

<a name="2.0.0-alpha.12"></a>
# 2.0.0-alpha.12 (2021-07-11)

**Note:** Version bump only for package @aurelia/validation

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

**Note:** Version bump only for package @aurelia/validation

<a name="2.0.0-alpha.8"></a>
# 2.0.0-alpha.8 (2021-06-22)

**Note:** Version bump only for package @aurelia/validation

<a name="2.0.0-alpha.7"></a>
# 2.0.0-alpha.7 (2021-06-20)

**Note:** Version bump only for package @aurelia/validation

<a name="2.0.0-alpha.6"></a>
# 2.0.0-alpha.6 (2021-06-11)

**Note:** Version bump only for package @aurelia/validation

<a name="2.0.0-alpha.5"></a>
# 2.0.0-alpha.5 (2021-05-31)

**Note:** Version bump only for package @aurelia/validation

<a name="2.0.0-alpha.4"></a>
# 2.0.0-alpha.4 (2021-05-25)

**Note:** Version bump only for package @aurelia/validation

<a name="2.0.0-alpha.3"></a>
# 2.0.0-alpha.3 (2021-05-19)

**Note:** Version bump only for package @aurelia/validation

<a name="2.0.0-alpha.2"></a>
# 2.0.0-alpha.2 (2021-03-07)

**Note:** Version bump only for package @aurelia/validation

<a name="2.0.0-alpha.1"></a>
# 2.0.0-alpha.1 (2021-03-03)

**Note:** Version bump only for package @aurelia/validation

<a name="2.0.0-alpha.0"></a>
# 2.0.0-alpha.0 (2021-03-02)

**Note:** Version bump only for package @aurelia/validation

<a name="0.9.0"></a>
# 0.9.0 (2021-01-31)

### Features:

* **di:** remove DI.createInterface builder ([8146dcc](https://github.com/aurelia/aurelia/commit/8146dcc))

<a name="0.8.0"></a>
# 0.8.0 (2020-11-30)

### Bug Fixes:

* ***:** 2 deepscan issues ([1e74059](https://github.com/aurelia/aurelia/commit/1e74059))


### Refactorings:

* **validation:** adapt runtime refactoring ([85e4b8e](https://github.com/aurelia/aurelia/commit/85e4b8e))
* **all:** add .js extensions for native esm compat ([0308e2e](https://github.com/aurelia/aurelia/commit/0308e2e))
* **runtime-html:** rename InstructionComposer to Renderer and remove Composer abstraction ([6499d31](https://github.com/aurelia/aurelia/commit/6499d31))
* **all:** move scheduler implementation to platform ([e22285a](https://github.com/aurelia/aurelia/commit/e22285a))
* **all:** remove PLATFORM global ([fdef656](https://github.com/aurelia/aurelia/commit/fdef656))
* **all:** rename Hydrator to ExpressionHydrator ([71e2e6f](https://github.com/aurelia/aurelia/commit/71e2e6f))
* **validation:** update based on updated ast ([ef13c54](https://github.com/aurelia/aurelia/commit/ef13c54))
* **i18n:** ensure .evaluate() is called with null ([c19fb30](https://github.com/aurelia/aurelia/commit/c19fb30))
* **all:** remove AST interfaces ([7e04d83](https://github.com/aurelia/aurelia/commit/7e04d83))
* ***:** host scope & AST ([9067a2c](https://github.com/aurelia/aurelia/commit/9067a2c))

<a name="0.7.0"></a>
# 0.7.0 (2020-05-08)

### Features:

* **validation:** condtionals support in hydration ([1be45de](https://github.com/aurelia/aurelia/commit/1be45de))
* **validation:** adding model based validation ([994cbee](https://github.com/aurelia/aurelia/commit/994cbee))
* **validation:** draft#1 of ModelBased validation ([0c5c130](https://github.com/aurelia/aurelia/commit/0c5c130))
* **validation:** fallback to rules for class ([36053b1](https://github.com/aurelia/aurelia/commit/36053b1))
* **validation:** fallback to rules for class ([38f1189](https://github.com/aurelia/aurelia/commit/38f1189))
* **validation:** rule-property deserialization ([4bf1ff7](https://github.com/aurelia/aurelia/commit/4bf1ff7))
* **validation:** started deserialization support ([4296f9d](https://github.com/aurelia/aurelia/commit/4296f9d))
* **validation:** serialization support ([a14fb0a](https://github.com/aurelia/aurelia/commit/a14fb0a))
* **validation-i18n:** default ns, prefix ([78ba301](https://github.com/aurelia/aurelia/commit/78ba301))
* **validation-i18n:** i18n support for validation ([767855e](https://github.com/aurelia/aurelia/commit/767855e))
* **validation:** presenter subscriber service ([9d8d897](https://github.com/aurelia/aurelia/commit/9d8d897))
* **validation:** validated CE ([ef0427e](https://github.com/aurelia/aurelia/commit/ef0427e))
* **validation:** tagged rules and objects ([5326488](https://github.com/aurelia/aurelia/commit/5326488))
* **validation:** integration with binding behavior ([bd42bc3](https://github.com/aurelia/aurelia/commit/bd42bc3))
* **validation:** change handling of the BB args ([e11f1b5](https://github.com/aurelia/aurelia/commit/e11f1b5))
* **runtime:** binding mediator ([3f37cb8](https://github.com/aurelia/aurelia/commit/3f37cb8))
* **validation:** overwritting default messages ([d084946](https://github.com/aurelia/aurelia/commit/d084946))
* **validation:** @validationRule deco ([f8caa30](https://github.com/aurelia/aurelia/commit/f8caa30))
* **validation:** metadata annotation for rules + type defn fix ([7e6569b](https://github.com/aurelia/aurelia/commit/7e6569b))
* **validation:** used new BindingInterceptor ([bb8dff2](https://github.com/aurelia/aurelia/commit/bb8dff2))
* **runtime+html:** binding middleware ([3dc8143](https://github.com/aurelia/aurelia/commit/3dc8143))
* **validation:** started porting ([00249b4](https://github.com/aurelia/aurelia/commit/00249b4))


### Bug Fixes:

* **validation:** prop parsing with istanbul instr ([d5123df](https://github.com/aurelia/aurelia/commit/d5123df))
* ***:** validation controller factory fix ([e2e5da4](https://github.com/aurelia/aurelia/commit/e2e5da4))
* ***:** misc issues + cleanup ([c318d91](https://github.com/aurelia/aurelia/commit/c318d91))
* **validation:** lint correction ([401b976](https://github.com/aurelia/aurelia/commit/401b976))
* **binding:** fromView update source initial value ([5e23f6c](https://github.com/aurelia/aurelia/commit/5e23f6c))
* **validation:** correction for Node.js ([656cdb0](https://github.com/aurelia/aurelia/commit/656cdb0))
* **validation:** deepscan issues ([0f72686](https://github.com/aurelia/aurelia/commit/0f72686))
* **validation:** fixed the property parsing ([f6af7f2](https://github.com/aurelia/aurelia/commit/f6af7f2))
* **validation:** validationRules#on 1+ objects ([bb65039](https://github.com/aurelia/aurelia/commit/bb65039))
* **validation:** collection property accessor parsing ([7d2cd1d](https://github.com/aurelia/aurelia/commit/7d2cd1d))
* **validation:** accessing nested property value ([22698f0](https://github.com/aurelia/aurelia/commit/22698f0))


### Refactorings:

* **validation:** removed usage of BaseValidationRule in favor of IValidationRule ([72d4536](https://github.com/aurelia/aurelia/commit/72d4536))
* **validation:** validation-html bifurcation ([e2ca34f](https://github.com/aurelia/aurelia/commit/e2ca34f))
* ***:** moved value evaluation to PropertyRule ([072526f](https://github.com/aurelia/aurelia/commit/072526f))
* **validation:** message provider usage ([a9e4b3e](https://github.com/aurelia/aurelia/commit/a9e4b3e))
* **validation:** integrated validation message provider for property displayname ([9b870f6](https://github.com/aurelia/aurelia/commit/9b870f6))
* **validation:** flags in ValidateInstruction ([e0d142b](https://github.com/aurelia/aurelia/commit/e0d142b))
* **validation:** enhanced custom message key ([30f6b3f](https://github.com/aurelia/aurelia/commit/30f6b3f))
* **validation:** cleanup ([c53bf72](https://github.com/aurelia/aurelia/commit/c53bf72))
* **validation:** clean up ValidateInstruction ([666a5ac](https://github.com/aurelia/aurelia/commit/666a5ac))
* **validation:** normalized binding host ([732234b](https://github.com/aurelia/aurelia/commit/732234b))
* **validation:** removed errors in favor of results ([124d54f](https://github.com/aurelia/aurelia/commit/124d54f))
* **validation:** handled rules change in BB ([7669c19](https://github.com/aurelia/aurelia/commit/7669c19))
* **validation:** support for arg value change handling ([e7acfbe](https://github.com/aurelia/aurelia/commit/e7acfbe))
* **validation:** removed trigger from controller ([d1dccdc](https://github.com/aurelia/aurelia/commit/d1dccdc))
* **validation:** scheduler in validation-controller ([c118e90](https://github.com/aurelia/aurelia/commit/c118e90))
* **validation:** fixed validation result ([de3f4cf](https://github.com/aurelia/aurelia/commit/de3f4cf))
* **validation:** restructuring + binding behavior wip ([e8cb986](https://github.com/aurelia/aurelia/commit/e8cb986))
* **validation:** fixed property name parsing ([e56613b](https://github.com/aurelia/aurelia/commit/e56613b))
* **validation:** minor return type change ([250e3d5](https://github.com/aurelia/aurelia/commit/250e3d5))
* **validation:** rule execution and validator ([2e019a0](https://github.com/aurelia/aurelia/commit/2e019a0))
* **validation:** cleaned up validation rules ([74b312e](https://github.com/aurelia/aurelia/commit/74b312e))
* **validation:** unified fluent API ([5dfccc1](https://github.com/aurelia/aurelia/commit/5dfccc1))
* **validation:** fixed misc build issues ([b947b7f](https://github.com/aurelia/aurelia/commit/b947b7f))

<a name="0.6.0"></a>
# 0.6.0 (2019-12-18)

**Note:** Version bump only for package @aurelia/validation

<a name="0.5.0"></a>
# 0.5.0 (2019-11-15)

**Note:** Version bump only for package @aurelia/validation

<a name="0.4.0"></a>
# 0.4.0 (2019-10-26)

### Performance Improvements:

* **all): add sideEffect:** false for better tree shaking ([59b5e55](https://github.com/aurelia/aurelia/commit/59b5e55))

<a name="0.3.0"></a>
# 0.3.0 (2018-10-12)

**Note:** Version bump only for package @aurelia/validation

