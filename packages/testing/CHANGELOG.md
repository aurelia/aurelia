# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

<a name="2.0.0-beta.13"></a>
# 2.0.0-beta.13 (2024-03-15)

### Bug Fixes:

* **router-lite:** dont register config ([f71e9e7](https://github.com/aurelia/aurelia/commit/f71e9e7))
* **router:** dont swallow instantiation error details ([deee8e6](https://github.com/aurelia/aurelia/commit/deee8e6))
* ***:** cleanup di & router tests, add timeout ([deee8e6](https://github.com/aurelia/aurelia/commit/deee8e6))
* ***:** router errors stringify ([deee8e6](https://github.com/aurelia/aurelia/commit/deee8e6))
* ***:** deepscan issues ([deee8e6](https://github.com/aurelia/aurelia/commit/deee8e6))


### Refactorings:

* **event:** no longer call prevent default by default (#1926) ([f71e9e7](https://github.com/aurelia/aurelia/commit/f71e9e7))
* ***:** smaller di files, assert text options, more au slot tests ([deee8e6](https://github.com/aurelia/aurelia/commit/deee8e6))

<a name="2.0.0-beta.12"></a>
# 2.0.0-beta.12 (2024-03-02)

### Features:

* **au-compose:** ability to compose string as element name (#1913) ([06aa113](https://github.com/aurelia/aurelia/commit/06aa113))


### Bug Fixes:

* **di:** dont jit register resources [skip ci] ([8ffde34](https://github.com/aurelia/aurelia/commit/8ffde34))
* **di:** new instance resolver (#1909) ([efe208c](https://github.com/aurelia/aurelia/commit/efe208c))


### Refactorings:

* ***:** cleanup (#1912) ([8ffde34](https://github.com/aurelia/aurelia/commit/8ffde34))

<a name="2.0.0-beta.11"></a>
# 2.0.0-beta.11 (2024-02-13)

### Features:

* **event:** ability to add modifier (#1891) ([67a3c22](https://github.com/aurelia/aurelia/commit/67a3c22))
* **state:** support redux devtools for the state plugin (#1888) ([bd07160](https://github.com/aurelia/aurelia/commit/bd07160))


### Bug Fixes:

* ***:** upgrade rollup, tweak build scripts ([bd07160](https://github.com/aurelia/aurelia/commit/bd07160))

<a name="2.0.0-beta.10"></a>
# 2.0.0-beta.10 (2024-01-26)

### Refactorings:

* **enums:** string literal types in favour of const enums (#1870) ([e21e0c9](https://github.com/aurelia/aurelia/commit/e21e0c9))

<a name="2.0.0-beta.9"></a>
# 2.0.0-beta.9 (2023-12-12)

### Bug Fixes:

* **popover:** properly set attrs and add tests (#1851) ([f4b552b](https://github.com/aurelia/aurelia/commit/f4b552b))
* **au-slot:** ensure work with shadow dom (#1841) ([c750d4f](https://github.com/aurelia/aurelia/commit/c750d4f))
* **dialog:** use startingZIndex (#1809) ([de79aea](https://github.com/aurelia/aurelia/commit/de79aea))

<a name="2.0.0-beta.8"></a>
# 2.0.0-beta.8 (2023-07-24)

### Refactorings:

* **ref:** deprecate view-model.ref and introduce component.ref (#1803) ([97e8dad](https://github.com/aurelia/aurelia/commit/97e8dad))

<a name="2.0.0-beta.7"></a>
# 2.0.0-beta.7 (2023-06-16)

### Features:

* **build:** add a development entry point (#1770) ([69ff445](https://github.com/aurelia/aurelia/commit/69ff445))


### Refactorings:

* **runtime-html:** cleanup errors, remove unused code. (#1771) ([750210d](https://github.com/aurelia/aurelia/commit/750210d))

<a name="2.0.0-beta.6"></a>
# 2.0.0-beta.6 (2023-05-21)

### Features:

* **templating:** allow deactivate when activating (#1729) ([1c9c97c](https://github.com/aurelia/aurelia/commit/1c9c97c))


### Refactorings:

* **compiler:** avoid using au class to find targets (#1768) ([0d30998](https://github.com/aurelia/aurelia/commit/0d30998))

<a name="2.0.0-beta.5"></a>
# 2.0.0-beta.5 (2023-04-27)

**Note:** Version bump only for package @aurelia/testing

<a name="2.0.0-beta.4"></a>
# 2.0.0-beta.4 (2023-04-13)

### Refactorings:

* **children:** make children observation a binding (#1732) ([5bde983](https://github.com/aurelia/aurelia/commit/5bde983))
* **children:** make children deco as a hook ([5bde983](https://github.com/aurelia/aurelia/commit/5bde983))
* **children:** remove children observers from custom element def ([5bde983](https://github.com/aurelia/aurelia/commit/5bde983))
* **children:** cleanup children observer related code, rename to binding ([5bde983](https://github.com/aurelia/aurelia/commit/5bde983))
* **observers:** remove intermediate vars ([5bde983](https://github.com/aurelia/aurelia/commit/5bde983))
* ***:** ignore dev message coverage ([5bde983](https://github.com/aurelia/aurelia/commit/5bde983))
* ***:** remove unnecessary properties on PLATFORM (#1722) ([7cd77ad](https://github.com/aurelia/aurelia/commit/7cd77ad))

<a name="2.0.0-beta.3"></a>
# 2.0.0-beta.3 (2023-03-24)

### Bug Fixes:

* **css-modules:** class command css module (#1690) ([b6606d4](https://github.com/aurelia/aurelia/commit/b6606d4))


### Refactorings:

* **controller:** remove lifecycle flags (#1707) ([a31cd75](https://github.com/aurelia/aurelia/commit/a31cd75))
* **ci:** remove e2e safari from pipeline ([a31cd75](https://github.com/aurelia/aurelia/commit/a31cd75))
* **tests:** disable hook tests ([a31cd75](https://github.com/aurelia/aurelia/commit/a31cd75))
* **build:** use turbo to boost build speed (#1692) ([d99b136](https://github.com/aurelia/aurelia/commit/d99b136))

<a name="2.0.0-beta.2"></a>
# 2.0.0-beta.2 (2023-02-26)

**Note:** Version bump only for package @aurelia/testing

<a name="2.0.0-beta.1"></a>
# 2.0.0-beta.1 (2023-01-12)

### Features:

* ***:** key assignment notify changes (#1601) ([4163dd4](https://github.com/aurelia/aurelia/commit/4163dd4))


### Bug Fixes:

* **array-length-observer:** notify array subscribers ([9ea3d85](https://github.com/aurelia/aurelia/commit/9ea3d85))


### Performance Improvements:

* ***:** move render location creation to compiler (#1605) ([66846b1](https://github.com/aurelia/aurelia/commit/66846b1))


### Refactorings:

* ***:** remove call command, move to compat package ([d302d72](https://github.com/aurelia/aurelia/commit/d302d72))
* **runtime:** cleanup & size opt, rename binding methods (#1582) ([2000e3b](https://github.com/aurelia/aurelia/commit/2000e3b))
* **runtime:** remove interceptor prop from interface ([3074f54](https://github.com/aurelia/aurelia/commit/3074f54))
* **binding-behavior:** remove binding interceptor ([767eee7](https://github.com/aurelia/aurelia/commit/767eee7))
* **bindings:** create override fn instead of binding interceptor ([5c2ed80](https://github.com/aurelia/aurelia/commit/5c2ed80))
* **all:** error msg code & better bundle size ([d81ec6d](https://github.com/aurelia/aurelia/commit/d81ec6d))
* **ast:** extract evaluate into a seprate fn ([6691f7f](https://github.com/aurelia/aurelia/commit/6691f7f))

<a name="2.0.0-alpha.41"></a>
# 2.0.0-alpha.41 (2022-09-22)

### Features:

* **collection-observation:** add ability to batch mutation into a single indexmap ([39b3f82](https://github.com/aurelia/aurelia/commit/39b3f82))


### Bug Fixes:

* ***:** call listener with correct scope, move flush queue to binding ([70d1329](https://github.com/aurelia/aurelia/commit/70d1329))
* **html:** remove attrs on null/undefined (#1561) ([2de6f17](https://github.com/aurelia/aurelia/commit/2de6f17))


### Refactorings:

* ***:** cleanup unnecessary exports in kernel ([045d80d](https://github.com/aurelia/aurelia/commit/045d80d))
* **runtime:** make Char local to expr parser only ([3272fb7](https://github.com/aurelia/aurelia/commit/3272fb7))
* **observation:** also pass collection in change handler ([c382e8a](https://github.com/aurelia/aurelia/commit/c382e8a))
* ***:** cleanup context & scope ([e806937](https://github.com/aurelia/aurelia/commit/e806937))
* **bindings:** remove flags from bind/unbind (#1560) ([eaaf4bb](https://github.com/aurelia/aurelia/commit/eaaf4bb))
* ***:** remove flags from observers (#1557) ([9f9a8fe](https://github.com/aurelia/aurelia/commit/9f9a8fe))
* **ast:** remove flags from evaluate (#1553) ([dda997b](https://github.com/aurelia/aurelia/commit/dda997b))

<a name="2.0.0-alpha.40"></a>
# 2.0.0-alpha.40 (2022-09-07)

### Features:

* **template:** support arrow function syntax (#1541) ([499ace7](https://github.com/aurelia/aurelia/commit/499ace7))

<a name="2.0.0-alpha.39"></a>
# 2.0.0-alpha.39 (2022-09-01)

**Note:** Version bump only for package @aurelia/testing

<a name="2.0.0-alpha.38"></a>
# 2.0.0-alpha.38 (2022-08-17)

**Note:** Version bump only for package @aurelia/testing

<a name="2.0.0-alpha.37"></a>
# 2.0.0-alpha.37 (2022-08-03)

**Note:** Version bump only for package @aurelia/testing

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

### Refactorings:

* **compiler:** remove no-action mode for custom element content (#1438) ([f9c8170](https://github.com/aurelia/aurelia/commit/f9c8170))

<a name="2.0.0-alpha.33"></a>
# 2.0.0-alpha.33 (2022-05-26)

### Bug Fixes:

* **array-observer:** don't mutate incoming indexmap (#1429) ([a77a104](https://github.com/aurelia/aurelia/commit/a77a104))


### Refactorings:

* **lifecycle-hooks:** dont invoke lfc on CA ([395b26a](https://github.com/aurelia/aurelia/commit/395b26a))

<a name="2.0.0-alpha.32"></a>
# 2.0.0-alpha.32 (2022-05-22)

### Features:

* ***:** lifecyclehooks created (#1428) ([3a0e93d](https://github.com/aurelia/aurelia/commit/3a0e93d))
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

* **ui-virtualization:** prepare to port ui virtualization plugin (#1420) ([3e61198](https://github.com/aurelia/aurelia/commit/3e61198))
* **virtualization:** basic implementation ([3e61198](https://github.com/aurelia/aurelia/commit/3e61198))
* **testing:** add html assertion helpers for IFixture ([fbb85d0](https://github.com/aurelia/aurelia/commit/fbb85d0))
* **containerless:** ability to override `containerless` config from view (#1417) ([26968cc](https://github.com/aurelia/aurelia/commit/26968cc))
* **plugin:** aurelia store (v2) plugin (#1412) ([6989de0](https://github.com/aurelia/aurelia/commit/6989de0))


### Bug Fixes:

* **hmr:** works with components that has created lifecycle ([3e61198](https://github.com/aurelia/aurelia/commit/3e61198))


### Refactorings:

* ***:** cleanup unused flags ([c4ce901](https://github.com/aurelia/aurelia/commit/c4ce901))
* **testing:** enable builder pattern for fixture creation (#1414) ([af64b4c](https://github.com/aurelia/aurelia/commit/af64b4c))

<a name="2.0.0-alpha.30"></a>
# 2.0.0-alpha.30 (2022-05-07)

### Features:

* **events:** expr as listener handler (#1411) ([ff6ebb8](https://github.com/aurelia/aurelia/commit/ff6ebb8))
* **testing:** automatically hook fixture create promise / tear down ([ff6ebb8](https://github.com/aurelia/aurelia/commit/ff6ebb8))
* **testing:** enhance createFixture helper props ([ff6ebb8](https://github.com/aurelia/aurelia/commit/ff6ebb8))


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

**Note:** Version bump only for package @aurelia/testing

<a name="2.0.0-alpha.28"></a>
# 2.0.0-alpha.28 (2022-04-16)

**Note:** Version bump only for package @aurelia/testing

<a name="2.0.0-alpha.27"></a>
# 2.0.0-alpha.27 (2022-04-08)

### Bug Fixes:

* **build:** ensure correct __DEV__ build value replacement (#1377) ([40ce0e3](https://github.com/aurelia/aurelia/commit/40ce0e3))

<a name="2.0.0-alpha.26"></a>
# 2.0.0-alpha.26 (2022-03-13)

**Note:** Version bump only for package @aurelia/testing

<a name="2.0.0-alpha.25"></a>
# 2.0.0-alpha.25 (2022-03-08)

**Note:** Version bump only for package @aurelia/testing

<a name="2.0.0-alpha.24"></a>
# 2.0.0-alpha.24 (2022-01-18)

**Note:** Version bump only for package @aurelia/testing

<a name="2.0.0-alpha.23"></a>
# 2.0.0-alpha.23 (2021-11-22)

**Note:** Version bump only for package @aurelia/testing

<a name="2.0.0-alpha.22"></a>
# 2.0.0-alpha.22 (2021-10-24)

**Note:** Version bump only for package @aurelia/testing

<a name="2.0.0-alpha.21"></a>
# 2.0.0-alpha.21 (2021-09-12)

**Note:** Version bump only for package @aurelia/testing

<a name="2.0.0-alpha.20"></a>
# 2.0.0-alpha.20 (2021-09-04)

**Note:** Version bump only for package @aurelia/testing

<a name="2.0.0-alpha.19"></a>
# 2.0.0-alpha.19 (2021-08-29)

**Note:** Version bump only for package @aurelia/testing

<a name="2.0.0-alpha.18"></a>
# 2.0.0-alpha.18 (2021-08-22)

### Features:

* **attr-transfer:** implement attr capturing & spreading ([998b91c](https://github.com/aurelia/aurelia/commit/998b91c))

<a name="2.0.0-alpha.17"></a>
# 2.0.0-alpha.17 (2021-08-16)

**Note:** Version bump only for package @aurelia/testing

<a name="2.0.0-alpha.16"></a>
# 2.0.0-alpha.16 (2021-08-07)

**Note:** Version bump only for package @aurelia/testing

<a name="2.0.0-alpha.15"></a>
# 2.0.0-alpha.15 (2021-08-01)

**Note:** Version bump only for package @aurelia/testing

<a name="2.0.0-alpha.14"></a>
# 2.0.0-alpha.14 (2021-07-25)

### Refactorings:

* **runtime:** mark more private properties ([8ecf70b](https://github.com/aurelia/aurelia/commit/8ecf70b))

<a name="2.0.0-alpha.13"></a>
# 2.0.0-alpha.13 (2021-07-19)

### Refactorings:

* **bindings:** rename observeProperty -> observe, add doc ([fed517f](https://github.com/aurelia/aurelia/commit/fed517f))
* **ast:** simplify AST kind enum ([fed517f](https://github.com/aurelia/aurelia/commit/fed517f))
* **scope:** remove host scope ([0349810](https://github.com/aurelia/aurelia/commit/0349810))

<a name="2.0.0-alpha.12"></a>
# 2.0.0-alpha.12 (2021-07-11)

**Note:** Version bump only for package @aurelia/testing

<a name="2.0.0-alpha.11"></a>
# 2.0.0-alpha.11 (2021-07-11)

### Bug Fixes:

* **call-binding:** assign args to event property, fixes #1231 ([fa4c0d4](https://github.com/aurelia/aurelia/commit/fa4c0d4))

<a name="2.0.0-alpha.10"></a>
# 2.0.0-alpha.10 (2021-07-04)

**Note:** Version bump only for package @aurelia/testing

<a name="2.0.0-alpha.9"></a>
# 2.0.0-alpha.9 (2021-06-25)

**Note:** Version bump only for package @aurelia/testing

<a name="2.0.0-alpha.8"></a>
# 2.0.0-alpha.8 (2021-06-22)

**Note:** Version bump only for package @aurelia/testing

<a name="2.0.0-alpha.7"></a>
# 2.0.0-alpha.7 (2021-06-20)

### Refactorings:

* **scope:** rename isComponentBoundary -> isBoundary ([a3a4281](https://github.com/aurelia/aurelia/commit/a3a4281))

<a name="2.0.0-alpha.6"></a>
# 2.0.0-alpha.6 (2021-06-11)

**Note:** Version bump only for package @aurelia/testing

<a name="2.0.0-alpha.5"></a>
# 2.0.0-alpha.5 (2021-05-31)

**Note:** Version bump only for package @aurelia/testing

<a name="2.0.0-alpha.4"></a>
# 2.0.0-alpha.4 (2021-05-25)

**Note:** Version bump only for package @aurelia/testing

<a name="2.0.0-alpha.3"></a>
# 2.0.0-alpha.3 (2021-05-19)

**Note:** Version bump only for package @aurelia/testing

<a name="2.0.0-alpha.2"></a>
# 2.0.0-alpha.2 (2021-03-07)

**Note:** Version bump only for package @aurelia/testing

<a name="2.0.0-alpha.1"></a>
# 2.0.0-alpha.1 (2021-03-03)

**Note:** Version bump only for package @aurelia/testing

<a name="2.0.0-alpha.0"></a>
# 2.0.0-alpha.0 (2021-03-02)

### Bug Fixes:

* **testing:** instantiate app root with ctx container ([d43365d](https://github.com/aurelia/aurelia/commit/d43365d))


### Refactorings:

* ***:** remove left over unused ids ([97fc845](https://github.com/aurelia/aurelia/commit/97fc845))
* **connectable:** clearer interface for connectable to receive changes ([bec6ed0](https://github.com/aurelia/aurelia/commit/bec6ed0))

<a name="0.9.0"></a>
# 0.9.0 (2021-01-31)

### Refactorings:

* **all:** rename macroTaskQueue to taskQueue ([87c073d](https://github.com/aurelia/aurelia/commit/87c073d))
* **connectable:** merge observer record & collection observer record ([f2c1501](https://github.com/aurelia/aurelia/commit/f2c1501))
* **all:** remove ILifecycle ([d141d8e](https://github.com/aurelia/aurelia/commit/d141d8e))
* **connectable:** more cryptic, less generic name ([0f303cb](https://github.com/aurelia/aurelia/commit/0f303cb))
* **connectable:** make record/cRecord first class, remove other methods ([d0cb810](https://github.com/aurelia/aurelia/commit/d0cb810))

<a name="0.8.0"></a>
# 0.8.0 (2020-11-30)

### Features:

* **computed:** no type check proxy, reorg args order ([6f3d36f](https://github.com/aurelia/aurelia/commit/6f3d36f))
* **runtime:** implement/wireup dispose hook ([1e1819e](https://github.com/aurelia/aurelia/commit/1e1819e))
* **runtime:** add afterBind hook ([47ff91f](https://github.com/aurelia/aurelia/commit/47ff91f))
* **testing:** overload assert.isSchedulerEmpty with empty before throw ([b926ad1](https://github.com/aurelia/aurelia/commit/b926ad1))
* **testing:** add scheduler emptier ([81cec43](https://github.com/aurelia/aurelia/commit/81cec43))


### Bug Fixes:

* ***:** tests, remove unused vars ([dfe9e30](https://github.com/aurelia/aurelia/commit/dfe9e30))
* **test-builder:** remove leftover imports ([54fa103](https://github.com/aurelia/aurelia/commit/54fa103))
* ***:** build failure ([b8f9d2b](https://github.com/aurelia/aurelia/commit/b8f9d2b))
* ***:** broken tests ([3a73602](https://github.com/aurelia/aurelia/commit/3a73602))


### Refactorings:

* **binding:** fix mock binding build ([73aa6dd](https://github.com/aurelia/aurelia/commit/73aa6dd))
* **testing:** adapt runtime refactoring ([5d2b1f6](https://github.com/aurelia/aurelia/commit/5d2b1f6))
* **obs:** don't use Proxy on platform ([f7882e0](https://github.com/aurelia/aurelia/commit/f7882e0))
* **testing:** improve/simplify shadow-piercing text assert ([bdba8ba](https://github.com/aurelia/aurelia/commit/bdba8ba))
* **all:** add .js extensions for native esm compat ([0308e2e](https://github.com/aurelia/aurelia/commit/0308e2e))
* **controller:** remove projector abstraction & rework attaching ([d69d03d](https://github.com/aurelia/aurelia/commit/d69d03d))
* **projector-locator:** merge into controller ([2577af5](https://github.com/aurelia/aurelia/commit/2577af5))
* **runtime-html:** rename InstructionComposer to Renderer and remove Composer abstraction ([6499d31](https://github.com/aurelia/aurelia/commit/6499d31))
* **all:** remove afterUnbind and afterUnbindChildren, and make deactivate bottom-up ([a431fdc](https://github.com/aurelia/aurelia/commit/a431fdc))
* **all:** rename RuntimeHtmlConfiguration to StandardConfiguration ([665f3ba](https://github.com/aurelia/aurelia/commit/665f3ba))
* **all:** move scheduler implementation to platform ([e22285a](https://github.com/aurelia/aurelia/commit/e22285a))
* **scheduler:** use array instead of linkedlist ([41ef05c](https://github.com/aurelia/aurelia/commit/41ef05c))
* **scheduler:** remove microtask priority ([c95b7f6](https://github.com/aurelia/aurelia/commit/c95b7f6))
* **all:** remove IDOM, HTMLDOM and DOM; replace DOM with PLATFORM ([6447468](https://github.com/aurelia/aurelia/commit/6447468))
* **all:** move html-specific stuff from runtime to runtime-html and remove Node generics ([c745963](https://github.com/aurelia/aurelia/commit/c745963))
* **all:** remove debug package ([a1bdb60](https://github.com/aurelia/aurelia/commit/a1bdb60))
* **all:** remove PLATFORM global ([fdef656](https://github.com/aurelia/aurelia/commit/fdef656))
* **dom:** remove setAttribute ([5cd8905](https://github.com/aurelia/aurelia/commit/5cd8905))
* **dom:** remove removeEventListener ([1179737](https://github.com/aurelia/aurelia/commit/1179737))
* **dom:** remove addEventListener ([706a833](https://github.com/aurelia/aurelia/commit/706a833))
* ***:** wip fix for the scope traversal issue ([f93da3c](https://github.com/aurelia/aurelia/commit/f93da3c))
* **dom:** remove DOM.createNodeObserver ([2dc0282](https://github.com/aurelia/aurelia/commit/2dc0282))
* **all:** simplify DOM initialization, remove DOMInitializer ([ff13185](https://github.com/aurelia/aurelia/commit/ff13185))
* **runtime:** rename CompositionRoot to AppRoot ([3141a2c](https://github.com/aurelia/aurelia/commit/3141a2c))
* **runtime:** move Aurelia from runtime to runtime-html ([d56c4ca](https://github.com/aurelia/aurelia/commit/d56c4ca))
* **instructions:** rename hydrate to compose ([2ab10b3](https://github.com/aurelia/aurelia/commit/2ab10b3))
* **all:** shorten TargetedInstruction to Instruction ([a7e61c6](https://github.com/aurelia/aurelia/commit/a7e61c6))
* **all:** shorten TargetedInstructionType to InstructionType ([7fe8d04](https://github.com/aurelia/aurelia/commit/7fe8d04))
* **all:** finish renaming render to compose ([ede127b](https://github.com/aurelia/aurelia/commit/ede127b))
* **all:** rename render to compose ([2d11d9e](https://github.com/aurelia/aurelia/commit/2d11d9e))
* **runtime:** move rendering, binding commands, attr patterns and instructions to runtime-html ([bc010f5](https://github.com/aurelia/aurelia/commit/bc010f5))
* **all:** rename renderer to composer ([c1a0f3c](https://github.com/aurelia/aurelia/commit/c1a0f3c))
* **lifecycle:** use default registration ([77c88a2](https://github.com/aurelia/aurelia/commit/77c88a2))
* **observer-locator:** use default registration ([71ed8e5](https://github.com/aurelia/aurelia/commit/71ed8e5))
* **runtime:** add ICompositionRoot and IAurelia interfaces and pass container+root into controllers ([23477a3](https://github.com/aurelia/aurelia/commit/23477a3))
* **all:** simplify Aurelia#start/stop & AppTask#run, returning promise instead of task ([6c7608d](https://github.com/aurelia/aurelia/commit/6c7608d))
* **all:** rename StartTask to AppTask ([e76ae41](https://github.com/aurelia/aurelia/commit/e76ae41))
* **scheduler:** remove idleTaskQueue ([34da902](https://github.com/aurelia/aurelia/commit/34da902))
* **scope:** remove IScope interface and use import type where possible for Scope ([6b8eb5f](https://github.com/aurelia/aurelia/commit/6b8eb5f))
* ***:** removed linktype in favor of link cb ([5af8498](https://github.com/aurelia/aurelia/commit/5af8498))
* **testing:** truncate title stringification to avoid out of memory issues ([5bdb9bb](https://github.com/aurelia/aurelia/commit/5bdb9bb))
* **all:** merge jit-html into runtime-html and remove jit-html-* packages ([f530bcf](https://github.com/aurelia/aurelia/commit/f530bcf))
* **all:** merge jit into runtime and remove jit package + references ([d7b626b](https://github.com/aurelia/aurelia/commit/d7b626b))
* **jit:** move expression parser to runtime ([709a56a](https://github.com/aurelia/aurelia/commit/709a56a))
* ***:** template controller link type ([1bd39ef](https://github.com/aurelia/aurelia/commit/1bd39ef))
* **runtime:** merge controller api bind+attach into activate, detach+unbind into deactivate, and remove ILifecycleTask usage from controller ([15f3885](https://github.com/aurelia/aurelia/commit/15f3885))
* **runtime:** rename 'caching' to 'dispose' and hook cache/dispose logic up to unbind based on isReleased flag ([e346ed4](https://github.com/aurelia/aurelia/commit/e346ed4))
* **all:** remove State enum and use simple booleans instead ([762d3c7](https://github.com/aurelia/aurelia/commit/762d3c7))
* **all:** rename afterDetach to afterDetachChildren ([080a724](https://github.com/aurelia/aurelia/commit/080a724))
* **all:** rename afterUnbind to afterUnbindChildren ([09f1972](https://github.com/aurelia/aurelia/commit/09f1972))
* **all:** rename afterAttach to afterAttachChildren ([02b573e](https://github.com/aurelia/aurelia/commit/02b573e))
* **all:** rename afterBind to afterBindChildren ([bf0d79e](https://github.com/aurelia/aurelia/commit/bf0d79e))

<a name="0.7.0"></a>
# 0.7.0 (2020-05-08)

### Features:

* **di:** allow configuration of Container ([a3e5319](https://github.com/aurelia/aurelia/commit/a3e5319))


### Refactorings:

* **all:** fixup scheduler bootstrapping code, cleanup deprecated stuff ([acf66f2](https://github.com/aurelia/aurelia/commit/acf66f2))
* ***:** rename isNumeric to isArrayIndex ([2fab646](https://github.com/aurelia/aurelia/commit/2fab646))
* **testing:** rename setup to createFixture ([6af10d7](https://github.com/aurelia/aurelia/commit/6af10d7))

<a name="0.6.0"></a>
# 0.6.0 (2019-12-18)

### Features:

* **controller:** add create/beforeCompile/afterCompile/afterCompileChildren hooks ([3a8c215](https://github.com/aurelia/aurelia/commit/3a8c215))


### Refactorings:

* **all:** refine+document controller interfaces and fix types/tests ([0a77fbd](https://github.com/aurelia/aurelia/commit/0a77fbd))
* **testing:** fix types / api calls ([6279c49](https://github.com/aurelia/aurelia/commit/6279c49))
* **runtime:** rename 'detached' to 'afterDetach' ([d1e2b0c](https://github.com/aurelia/aurelia/commit/d1e2b0c))
* **runtime:** rename 'attached' to 'afterAttach' ([6ae7be1](https://github.com/aurelia/aurelia/commit/6ae7be1))
* **runtime:** rename 'unbound' to 'afterUnbind' ([35e203c](https://github.com/aurelia/aurelia/commit/35e203c))
* **runtime:** rename 'detaching' to 'beforeDetach' ([9f8b858](https://github.com/aurelia/aurelia/commit/9f8b858))
* **runtime:** rename 'unbinding' to 'beforeUnbind' ([79cd5fa](https://github.com/aurelia/aurelia/commit/79cd5fa))
* **runtime:** rename 'attaching' to 'beforeAttach' ([4685bb1](https://github.com/aurelia/aurelia/commit/4685bb1))
* **runtime:** rename 'bound' to 'afterBind' ([4060bbe](https://github.com/aurelia/aurelia/commit/4060bbe))
* **runtime:** rename 'binding' to 'beforeBind' ([45b2e91](https://github.com/aurelia/aurelia/commit/45b2e91))

<a name="0.5.0"></a>
# 0.5.0 (2019-11-15)

### Refactorings:

* **au-dom:** use new resource apis ([2d8d6f0](https://github.com/aurelia/aurelia/commit/2d8d6f0))

<a name="0.4.0"></a>
# 0.4.0 (2019-10-26)

### Features:

* **test:** add schedulerIsEmpty assert helper ([b20318e](https://github.com/aurelia/aurelia/commit/b20318e))
* **testing:** new tracing capabolities ([ffb65ba](https://github.com/aurelia/aurelia/commit/ffb65ba))
* **test:** new html assertions for text and value ([46cdfdd](https://github.com/aurelia/aurelia/commit/46cdfdd))
* **integration:** starting integration tests ([aaefd34](https://github.com/aurelia/aurelia/commit/aaefd34))
* **alias:** Add convention add tests fix conv log ([19399af](https://github.com/aurelia/aurelia/commit/19399af))
* **router:** configure to not use url fragment hash ([88b4ada](https://github.com/aurelia/aurelia/commit/88b4ada))
* **i18n:** core translation service and related auxiliary features ([c3d4a85](https://github.com/aurelia/aurelia/commit/c3d4a85))
* **i18n:** signalable t value-converter ([6d31d83](https://github.com/aurelia/aurelia/commit/6d31d83))
* **runtime:** initial implementation for startup tasks ([e4e1a14](https://github.com/aurelia/aurelia/commit/e4e1a14))
* **testing:** add match asserts ([f0e0201](https://github.com/aurelia/aurelia/commit/f0e0201))
* **testing:** add more assertions ([62e511b](https://github.com/aurelia/aurelia/commit/62e511b))
* **testing:** implement simple spy ([b8869b5](https://github.com/aurelia/aurelia/commit/b8869b5))
* **testing:** add instanceof assert ([01322f3](https://github.com/aurelia/aurelia/commit/01322f3))
* **testing:** port assert logic from nodejs ([1f7cdb9](https://github.com/aurelia/aurelia/commit/1f7cdb9))


### Bug Fixes:

* **test:** fix spy issue ([c2f43fd](https://github.com/aurelia/aurelia/commit/c2f43fd))
* **au-dom:** add template compiler dep ([31b3c94](https://github.com/aurelia/aurelia/commit/31b3c94))
* **tests:** linting issues ([3f85553](https://github.com/aurelia/aurelia/commit/3f85553))
* **let:** to-view-model -> to-binding-context ([a201a32](https://github.com/aurelia/aurelia/commit/a201a32))
* **:** Remove tearDown barrel ([212207d](https://github.com/aurelia/aurelia/commit/212207d))
* **testing:** import correct interfaces ([2b534f3](https://github.com/aurelia/aurelia/commit/2b534f3))
* **view-locator:** improve types and simplify tests ([2ecb8c4](https://github.com/aurelia/aurelia/commit/2ecb8c4))
* **styles:** ensure all styles infrastructure uses the dom abstraction ([2c397ec](https://github.com/aurelia/aurelia/commit/2c397ec))
* **inspect:** make inspect FF compatible ([509b771](https://github.com/aurelia/aurelia/commit/509b771))
* **debug:** add missing error codes and fix a few reporting issues ([25148d0](https://github.com/aurelia/aurelia/commit/25148d0))
* **au-dom:** sync with node-sequence changes ([41cd1c1](https://github.com/aurelia/aurelia/commit/41cd1c1))


### Performance Improvements:

* **all:** remove tracer/profiler from ts source ([cc9c1fc](https://github.com/aurelia/aurelia/commit/cc9c1fc))
* **all): add sideEffect:** false for better tree shaking ([59b5e55](https://github.com/aurelia/aurelia/commit/59b5e55))


### Refactorings:

* **testing:** convert from lifecycle to scheduler ([5f0a30a](https://github.com/aurelia/aurelia/commit/5f0a30a))
* **all:** update definition refs ([676e86a](https://github.com/aurelia/aurelia/commit/676e86a))
* **scheduler:** add global initialization and initial test setup ([2d15388](https://github.com/aurelia/aurelia/commit/2d15388))
* ***:** drop unused imports ([7755bbf](https://github.com/aurelia/aurelia/commit/7755bbf))
* **jit-html:** cleanup template-binder and improve semantic-model types ([156311d](https://github.com/aurelia/aurelia/commit/156311d))
* ***:** un-ignore some ts-ignore ([5e19c62](https://github.com/aurelia/aurelia/commit/5e19c62))
* **all:** rename BasicConfiguration in various packages ([7e330d8](https://github.com/aurelia/aurelia/commit/7e330d8))
* **debug:** rename Tracer to DebugTracer ([a6c28b3](https://github.com/aurelia/aurelia/commit/a6c28b3))
* **resources:** shorten resource names ([499634b](https://github.com/aurelia/aurelia/commit/499634b))
* **binding:** rename bindings ([35d4dff](https://github.com/aurelia/aurelia/commit/35d4dff))
* **ast:** add -Expression suffix to AST expression classes ([0870538](https://github.com/aurelia/aurelia/commit/0870538))
* **all): more cleaning up after TS breaking changes:** ( ([c4c3fc7](https://github.com/aurelia/aurelia/commit/c4c3fc7))
* **test:** consolidate / cleanup ([6c83b4e](https://github.com/aurelia/aurelia/commit/6c83b4e))
* **all:** rename ICustomAttribute to IViewModel ([8df17a8](https://github.com/aurelia/aurelia/commit/8df17a8))
* **all:** rename ICustomElement to IViewModel ([8092acf](https://github.com/aurelia/aurelia/commit/8092acf))
* **all:** rename $customElement to $controller ([aacf278](https://github.com/aurelia/aurelia/commit/aacf278))
* **all:** rename ILifecycleHooks to IViewModel ([a4e2dad](https://github.com/aurelia/aurelia/commit/a4e2dad))
* **runtime:** add activator class and make the runtime compile again ([b2a707a](https://github.com/aurelia/aurelia/commit/b2a707a))
* **runtime:** encapsulate lifecycle behavior in controller class ([4c12498](https://github.com/aurelia/aurelia/commit/4c12498))
* **all:** move all testing utilities to aurelia-testing package ([8f2fe34](https://github.com/aurelia/aurelia/commit/8f2fe34))

<a name="0.3.0"></a>
# 0.3.0 (2018-10-12)

**Note:** Version bump only for package @aurelia/testing

