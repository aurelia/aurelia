# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

<a name="2.0.0-beta.13"></a>
# 2.0.0-beta.13 (2024-03-15)

### Features:

* **process-content:** ability to add information to a data object (#1925) ([2a4c436](https://github.com/aurelia/aurelia/commit/2a4c436))
* **template-controller:** ability to have a container per factory (#1924) ([6727b56](https://github.com/aurelia/aurelia/commit/6727b56))
* **convention:** add import as support (#1920) ([7a15551](https://github.com/aurelia/aurelia/commit/7a15551))
* **di:** api to register resources with alias key ([7a15551](https://github.com/aurelia/aurelia/commit/7a15551))


### Bug Fixes:

* **router-lite:** dont register config ([f71e9e7](https://github.com/aurelia/aurelia/commit/f71e9e7))
* **router:** dont swallow instantiation error details ([deee8e6](https://github.com/aurelia/aurelia/commit/deee8e6))
* ***:** cleanup di & router tests, add timeout ([deee8e6](https://github.com/aurelia/aurelia/commit/deee8e6))
* ***:** router errors stringify ([deee8e6](https://github.com/aurelia/aurelia/commit/deee8e6))
* ***:** deepscan issues ([deee8e6](https://github.com/aurelia/aurelia/commit/deee8e6))
* ***:** element get own metadata call ([dc22fb7](https://github.com/aurelia/aurelia/commit/dc22fb7))
* **di:** cache factory on singleton resolution ([dc22fb7](https://github.com/aurelia/aurelia/commit/dc22fb7))


### Refactorings:

* **event:** no longer call prevent default by default (#1926) ([f71e9e7](https://github.com/aurelia/aurelia/commit/f71e9e7))
* **compiler:** remove special treatment for au slot ([2a4c436](https://github.com/aurelia/aurelia/commit/2a4c436))
* ***:** smaller di files, assert text options, more au slot tests ([deee8e6](https://github.com/aurelia/aurelia/commit/deee8e6))
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
* **au-compose:** ability to compose string as element name (#1913) ([06aa113](https://github.com/aurelia/aurelia/commit/06aa113))


### Bug Fixes:

* **di:** dont jit register resources [skip ci] ([8ffde34](https://github.com/aurelia/aurelia/commit/8ffde34))
* ***:** tweak typings of injectable token ([89f76eb](https://github.com/aurelia/aurelia/commit/89f76eb))
* ***:** use ?? instead of || ([89f76eb](https://github.com/aurelia/aurelia/commit/89f76eb))
* ***:** typings for injectable token ([89f76eb](https://github.com/aurelia/aurelia/commit/89f76eb))
* ***:** injectable token resolver ([89f76eb](https://github.com/aurelia/aurelia/commit/89f76eb))


### Refactorings:

* ***:** cleanup (#1912) ([8ffde34](https://github.com/aurelia/aurelia/commit/8ffde34))
* ***:** cleanup (#1908) ([89f76eb](https://github.com/aurelia/aurelia/commit/89f76eb))
* **router:** use resolve ([89f76eb](https://github.com/aurelia/aurelia/commit/89f76eb))
* ***:** better type inferrence for injectable token ([89f76eb](https://github.com/aurelia/aurelia/commit/89f76eb))
* ***:** simplify container has, cleanup router ([89f76eb](https://github.com/aurelia/aurelia/commit/89f76eb))
* **au-compose:** always create host for non custom element composition (#1906) ([8a28e0a](https://github.com/aurelia/aurelia/commit/8a28e0a))

<a name="2.0.0-beta.11"></a>
# 2.0.0-beta.11 (2024-02-13)

### Features:

* **event:** ability to add modifier (#1891) ([67a3c22](https://github.com/aurelia/aurelia/commit/67a3c22))
* **state:** support redux devtools for the state plugin (#1888) ([bd07160](https://github.com/aurelia/aurelia/commit/bd07160))


### Bug Fixes:

* **i18n:** ability to unsubscribe locale change ([ec2e270](https://github.com/aurelia/aurelia/commit/ec2e270))
* **templating:** custom element takes priority over custom attribute (#1897) ([e8b2c80](https://github.com/aurelia/aurelia/commit/e8b2c80))
* ***:** upgrade rollup, tweak build scripts ([bd07160](https://github.com/aurelia/aurelia/commit/bd07160))


### Refactorings:

* **controller:** remove define lifecycle hook (#1899) ([ec2e270](https://github.com/aurelia/aurelia/commit/ec2e270))

<a name="2.0.0-beta.10"></a>
# 2.0.0-beta.10 (2024-01-26)

### Bug Fixes:

* **au-slot:** properly handle nested projection registration (#1881) ([00e8dee](https://github.com/aurelia/aurelia/commit/00e8dee))
* **portal:** remove target marker when deactivated (#1883) ([3db4c17](https://github.com/aurelia/aurelia/commit/3db4c17))
* **runtime-html:** template wrapping  (#1875) ([bfdaa3b](https://github.com/aurelia/aurelia/commit/bfdaa3b))
* **runtime-html:** template wrapping ([bfdaa3b](https://github.com/aurelia/aurelia/commit/bfdaa3b))


### Refactorings:

* **enums:** string literal types in favour of const enums (#1870) ([e21e0c9](https://github.com/aurelia/aurelia/commit/e21e0c9))
* **runtime-html:** fix broken tests ([bfdaa3b](https://github.com/aurelia/aurelia/commit/bfdaa3b))

<a name="2.0.0-beta.9"></a>
# 2.0.0-beta.9 (2023-12-12)

### Features:

* **mapping:** add mapping for popover apis (#1842) ([6deadf4](https://github.com/aurelia/aurelia/commit/6deadf4))


### Bug Fixes:

* **popover:** properly set attrs and add tests (#1851) ([f4b552b](https://github.com/aurelia/aurelia/commit/f4b552b))
* **au-slot:** ensure work with shadow dom (#1841) ([c750d4f](https://github.com/aurelia/aurelia/commit/c750d4f))
* **repeater:** duplicate primitive handling, batched mutation fix (#1840) ([703d275](https://github.com/aurelia/aurelia/commit/703d275))
* **repeat:** fix sort+splice batched operation bug ([703d275](https://github.com/aurelia/aurelia/commit/703d275))


### Refactorings:

* **runtime-html:** if TC (#1833) ([7192e74](https://github.com/aurelia/aurelia/commit/7192e74))
* **runtime-html:** if ([7192e74](https://github.com/aurelia/aurelia/commit/7192e74))
* **templating:** remove strict binding option from CE (#1807) ([7b4455f](https://github.com/aurelia/aurelia/commit/7b4455f))
* **tests:** move all under src folder ([7b4455f](https://github.com/aurelia/aurelia/commit/7b4455f))

<a name="2.0.0-beta.8"></a>
# 2.0.0-beta.8 (2023-07-24)

### Features:

* **compose:** passthrough bindings + support containerless (#1792) ([e8e39a9](https://github.com/aurelia/aurelia/commit/e8e39a9))


### Bug Fixes:

* **au-slot:** correctly prepare resources for slotted view (#1802) ([bf1ca4c](https://github.com/aurelia/aurelia/commit/bf1ca4c))


### Refactorings:

* **ref:** deprecate view-model.ref and introduce component.ref (#1803) ([97e8dad](https://github.com/aurelia/aurelia/commit/97e8dad))
* **text-binding:** always evaluate expressions in strict mode (#1801) ([15acfee](https://github.com/aurelia/aurelia/commit/15acfee))
* ***:** bindable property -> name (#1783) ([ca0eda7](https://github.com/aurelia/aurelia/commit/ca0eda7))

<a name="2.0.0-beta.7"></a>
# 2.0.0-beta.7 (2023-06-16)

### Features:

* **build:** add a development entry point (#1770) ([69ff445](https://github.com/aurelia/aurelia/commit/69ff445))


### Bug Fixes:

* **resolver:** mark private as internal ([07689bf](https://github.com/aurelia/aurelia/commit/07689bf))


### Refactorings:

* **runtime:** cleanup, extract error to const enums (#1775) ([07689bf](https://github.com/aurelia/aurelia/commit/07689bf))
* **compiler:** use comment to mark target (#1774) ([e37802c](https://github.com/aurelia/aurelia/commit/e37802c))
* **runtime-html:** cleanup errors, remove unused code. (#1771) ([750210d](https://github.com/aurelia/aurelia/commit/750210d))

<a name="2.0.0-beta.6"></a>
# 2.0.0-beta.6 (2023-05-21)

### Features:

* **all:** allow injection of implementation (#1766) ([a60db13](https://github.com/aurelia/aurelia/commit/a60db13))
* **templating:** allow deactivate when activating (#1729) ([1c9c97c](https://github.com/aurelia/aurelia/commit/1c9c97c))
* **bindable:** support getter/setter (#1753) ([4279851](https://github.com/aurelia/aurelia/commit/4279851))


### Refactorings:

* **compiler:** avoid using au class to find targets (#1768) ([0d30998](https://github.com/aurelia/aurelia/commit/0d30998))
* ***:** rename resolveAll -> onResolveAll (#1764) ([fdf0747](https://github.com/aurelia/aurelia/commit/fdf0747))
* ***:** cleanup up unused code & decouple interface from default impl (#1761) ([7a71d43](https://github.com/aurelia/aurelia/commit/7a71d43))

<a name="2.0.0-beta.5"></a>
# 2.0.0-beta.5 (2023-04-27)

### Features:

* **di:** property injection with `resolve` (#1748) ([a22826a](https://github.com/aurelia/aurelia/commit/a22826a))
* **aurelia:** ability to inject with `Aurelia` export beside `IAurelia` ([a22826a](https://github.com/aurelia/aurelia/commit/a22826a))


### Refactorings:

* **build:** preserve pure annotation for better tree shaking (#1745) ([0bc5cd6](https://github.com/aurelia/aurelia/commit/0bc5cd6))

<a name="2.0.0-beta.4"></a>
# 2.0.0-beta.4 (2023-04-13)

### Features:

* **debounce-throttle:** flush via signals (#1739) ([af238a9](https://github.com/aurelia/aurelia/commit/af238a9))
* **slotted:** add slotted decorator, slotchange bindable for au-slot (#1735) ([8cf87af](https://github.com/aurelia/aurelia/commit/8cf87af))


### Bug Fixes:

* **repeat:** fix mismatchedLengthError on assigning an array with duplicate primitive values (#1737) ([cf60ac8](https://github.com/aurelia/aurelia/commit/cf60ac8))
* **select:** insensitive multiple.bind order (#1727) ([c8d912f](https://github.com/aurelia/aurelia/commit/c8d912f))


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

### Features:

* **style:** add warning messages when binding number to ambiguous properties (#1702) ([0937b63](https://github.com/aurelia/aurelia/commit/0937b63))


### Bug Fixes:

* **css-modules:** class command css module (#1690) ([b6606d4](https://github.com/aurelia/aurelia/commit/b6606d4))
* **au-slot:** register the right view model instance for injection (#1685) ([b42d52f](https://github.com/aurelia/aurelia/commit/b42d52f))


### Refactorings:

* **controller:** remove lifecycle flags (#1707) ([a31cd75](https://github.com/aurelia/aurelia/commit/a31cd75))
* **ci:** remove e2e safari from pipeline ([a31cd75](https://github.com/aurelia/aurelia/commit/a31cd75))
* **tests:** disable hook tests ([a31cd75](https://github.com/aurelia/aurelia/commit/a31cd75))
* **compose:** rename props and add compat layer (#1699) ([2e7ce43](https://github.com/aurelia/aurelia/commit/2e7ce43))
* **build:** use turbo to boost build speed (#1692) ([d99b136](https://github.com/aurelia/aurelia/commit/d99b136))

<a name="2.0.0-beta.2"></a>
# 2.0.0-beta.2 (2023-02-26)

### Features:

* **compat:** add binding engine (#1679) ([a6dd0de](https://github.com/aurelia/aurelia/commit/a6dd0de))


### Bug Fixes:

* **dom:** broken in safari16 (#1680) ([62321a7](https://github.com/aurelia/aurelia/commit/62321a7))
* **templating:** ensure fragment always have proper owner document ([62321a7](https://github.com/aurelia/aurelia/commit/62321a7))
* ***:** linting errors ([e6010d0](https://github.com/aurelia/aurelia/commit/e6010d0))
* **ast:** correctly resolves access keyed on primitve (#1662) ([0eae2ce](https://github.com/aurelia/aurelia/commit/0eae2ce))

<a name="2.0.0-beta.1"></a>
# 2.0.0-beta.1 (2023-01-12)

### Features:

* **portal:** ability to specify position ([6e78e4c](https://github.com/aurelia/aurelia/commit/6e78e4c))
* ***:** key assignment notify changes (#1601) ([4163dd4](https://github.com/aurelia/aurelia/commit/4163dd4))
* **repeat:** add keyed mode (#1583) ([d0c5706](https://github.com/aurelia/aurelia/commit/d0c5706))


### Bug Fixes:

* **runtime-html:** remove direct dependency on Reflect polyfill (#1610) ([5b37ff5](https://github.com/aurelia/aurelia/commit/5b37ff5))


### Performance Improvements:

* ***:** move render location creation to compiler (#1605) ([66846b1](https://github.com/aurelia/aurelia/commit/66846b1))


### Refactorings:

* ***:** move webcomponents plugin into separate package ([065a949](https://github.com/aurelia/aurelia/commit/065a949))
* ***:** add platform & obs locator to renderers ([6763eed](https://github.com/aurelia/aurelia/commit/6763eed))
* ***:** add expr parser to renderers via param ([06449b0](https://github.com/aurelia/aurelia/commit/06449b0))
* ***:** remove create element API ([de5faf4](https://github.com/aurelia/aurelia/commit/de5faf4))
* ***:** remove dialog export from aurelia pkg ([73e3078](https://github.com/aurelia/aurelia/commit/73e3078))
* ***:** remove au render + infra ([0a18ed1](https://github.com/aurelia/aurelia/commit/0a18ed1))
* ***:** prefix private props on bindings ([d9cfc83](https://github.com/aurelia/aurelia/commit/d9cfc83))
* ***:** remove call command, move to compat package ([d302d72](https://github.com/aurelia/aurelia/commit/d302d72))
* ***:** remove event delegator, move completely to compat ([cca1ce8](https://github.com/aurelia/aurelia/commit/cca1ce8))
* **event:** remove .delegate, add .delegate to compat package ([d1539a2](https://github.com/aurelia/aurelia/commit/d1539a2))
* **runtime:** cleanup & size opt, rename binding methods (#1582) ([2000e3b](https://github.com/aurelia/aurelia/commit/2000e3b))
* **runtime:** remove interceptor prop from interface ([3074f54](https://github.com/aurelia/aurelia/commit/3074f54))
* **binding-behavior:** remove binding interceptor ([767eee7](https://github.com/aurelia/aurelia/commit/767eee7))
* **bindings:** create override fn instead of binding interceptor ([5c2ed80](https://github.com/aurelia/aurelia/commit/5c2ed80))
* **all:** error msg code & better bundle size ([d81ec6d](https://github.com/aurelia/aurelia/commit/d81ec6d))
* **ast:** extract evaluate into a seprate fn ([6691f7f](https://github.com/aurelia/aurelia/commit/6691f7f))
* ***:** rename Scope.parentScope -> parent ([937d29e](https://github.com/aurelia/aurelia/commit/937d29e))
* **templating:** cleanup commands, renderers & compiler ([099e988](https://github.com/aurelia/aurelia/commit/099e988))

<a name="2.0.0-alpha.41"></a>
# 2.0.0-alpha.41 (2022-09-22)

### Features:

* **collection-observation:** add ability to batch mutation into a single indexmap ([39b3f82](https://github.com/aurelia/aurelia/commit/39b3f82))


### Bug Fixes:

* ***:** call listener with correct scope, move flush queue to binding ([70d1329](https://github.com/aurelia/aurelia/commit/70d1329))
* **html:** remove attrs on null/undefined (#1561) ([2de6f17](https://github.com/aurelia/aurelia/commit/2de6f17))


### Refactorings:

* ***:** some tests cleanup ([02c8af6](https://github.com/aurelia/aurelia/commit/02c8af6))
* ***:** use utils for smaller bundle ([d35e24a](https://github.com/aurelia/aurelia/commit/d35e24a))
* ***:** remove work tracker ([96f90c6](https://github.com/aurelia/aurelia/commit/96f90c6))
* ***:** cleanup unnecessary exports in kernel ([045d80d](https://github.com/aurelia/aurelia/commit/045d80d))
* ***:** cleanup di ([b299e7b](https://github.com/aurelia/aurelia/commit/b299e7b))
* **binding-command:** make expr parser & attr mapper parameters of command build ([0ff9756](https://github.com/aurelia/aurelia/commit/0ff9756))
* **runtime:** make Char local to expr parser only ([3272fb7](https://github.com/aurelia/aurelia/commit/3272fb7))
* **runtime:** move LifecycleFlags to runtime-html ([ef35bc7](https://github.com/aurelia/aurelia/commit/ef35bc7))
* **ast:** observe after eval fn call ([aca7b0f](https://github.com/aurelia/aurelia/commit/aca7b0f))
* **observation:** also pass collection in change handler ([c382e8a](https://github.com/aurelia/aurelia/commit/c382e8a))
* ***:** cleanup context & scope ([e806937](https://github.com/aurelia/aurelia/commit/e806937))
* ***:** move delegation strategy to runtime-html ([f387b2a](https://github.com/aurelia/aurelia/commit/f387b2a))
* ***:** always handle event handler as fn (#1563) ([6037495](https://github.com/aurelia/aurelia/commit/6037495))
* ***:** cleanup iterable AST, reorganise e2e tests (#1562) ([3853f2d](https://github.com/aurelia/aurelia/commit/3853f2d))
* **bindings:** remove flags from bind/unbind (#1560) ([eaaf4bb](https://github.com/aurelia/aurelia/commit/eaaf4bb))
* ***:** remove flags from observers (#1557) ([9f9a8fe](https://github.com/aurelia/aurelia/commit/9f9a8fe))
* **binding:** move BindingMode to runtime-html (#1555) ([c75618b](https://github.com/aurelia/aurelia/commit/c75618b))
* **ast:** remove flags from evaluate (#1553) ([dda997b](https://github.com/aurelia/aurelia/commit/dda997b))

<a name="2.0.0-alpha.40"></a>
# 2.0.0-alpha.40 (2022-09-07)

### Features:

* ***:** template expression auto observe array methods ([001fe4c](https://github.com/aurelia/aurelia/commit/001fe4c))


### Refactorings:

* **ast:** remove observe leaf only flag ([8b1c7e1](https://github.com/aurelia/aurelia/commit/8b1c7e1))
* **app-task:** consistent hook name style ing/ed (#1540) ([5a11ea0](https://github.com/aurelia/aurelia/commit/5a11ea0))

<a name="2.0.0-alpha.39"></a>
# 2.0.0-alpha.39 (2022-09-01)

### Bug Fixes:

* **containerless:** ensure host of dynamically created containerless comp is removed (#1518) ([358b2ed](https://github.com/aurelia/aurelia/commit/358b2ed))
* **repeater:** re attaching when using the same array with if (#1511) ([89248cc](https://github.com/aurelia/aurelia/commit/89248cc))
* **repeat:** unsubscribe collection on detaching ([89248cc](https://github.com/aurelia/aurelia/commit/89248cc))
* **e2e:** better e2e test scripts ([855a03f](https://github.com/aurelia/aurelia/commit/855a03f))
* **build:** remove reference directive, use files in tsconfig instead ([855a03f](https://github.com/aurelia/aurelia/commit/855a03f))
* **typings:** make ListenerOptions public ([855a03f](https://github.com/aurelia/aurelia/commit/855a03f))


### Refactorings:

* **repeat:** better collection observer refresh (#1512) ([261249a](https://github.com/aurelia/aurelia/commit/261249a))
* ***:** clean up instanceof code ([89248cc](https://github.com/aurelia/aurelia/commit/89248cc))

<a name="2.0.0-alpha.38"></a>
# 2.0.0-alpha.38 (2022-08-17)

**Note:** Version bump only for package @aurelia/runtime-html

<a name="2.0.0-alpha.37"></a>
# 2.0.0-alpha.37 (2022-08-03)

### Features:

* **capture:** ability to define attr filtering filter ([e9a22be](https://github.com/aurelia/aurelia/commit/e9a22be))


### Bug Fixes:

* **capture:** enable decorator to pass function filter (#1489) ([046b33c](https://github.com/aurelia/aurelia/commit/046b33c))
* ***:** deepscan ([809df0a](https://github.com/aurelia/aurelia/commit/809df0a))
* **capture:** dont capture slot attr ([5ef1a18](https://github.com/aurelia/aurelia/commit/5ef1a18))

<a name="2.0.0-alpha.36"></a>
# 2.0.0-alpha.36 (2022-07-25)

### Features:

* **capture:** convention & deco shortcut (#1469) ([e89d3ad](https://github.com/aurelia/aurelia/commit/e89d3ad))
* **loader:** strip <capture> ([e89d3ad](https://github.com/aurelia/aurelia/commit/e89d3ad))
* **element:** capture decorator and <capture/> ([e89d3ad](https://github.com/aurelia/aurelia/commit/e89d3ad))


### Bug Fixes:

* **runtime-html:** containerless #1474 (#1475) ([35e571f](https://github.com/aurelia/aurelia/commit/35e571f))
* **node-obs:** dont treat role differently (#1473) ([0cde114](https://github.com/aurelia/aurelia/commit/0cde114))

<a name="2.0.0-alpha.35"></a>
# 2.0.0-alpha.35 (2022-06-08)

### Features:

* **lifecycle-hooks:** bound ([668a0a8](https://github.com/aurelia/aurelia/commit/668a0a8))
* **lifecycle-hooks:** unbinding ([2d94910](https://github.com/aurelia/aurelia/commit/2d94910))
* **lifecycle-hooks:** binding ([ddb98ce](https://github.com/aurelia/aurelia/commit/ddb98ce))
* **lifecycle-hooks:** attached (#1456) ([4a9b3bb](https://github.com/aurelia/aurelia/commit/4a9b3bb))
* **lifecycle-hooks:** detaching (#1455) ([e4fc0de](https://github.com/aurelia/aurelia/commit/e4fc0de))
* **lifecycle-hooks:** add attaching (#1454) ([0aa386d](https://github.com/aurelia/aurelia/commit/0aa386d))
* **ts-jest,babel-jest:** upgrade to jest v28 (#1449) ([b1ec85c](https://github.com/aurelia/aurelia/commit/b1ec85c))
* **lifecycle-hooks:** invoke on custom attributes ([5a15abd](https://github.com/aurelia/aurelia/commit/5a15abd))


### Refactorings:

* **attr:** expose attr own container ([286977a](https://github.com/aurelia/aurelia/commit/286977a))

<a name="2.0.0-alpha.34"></a>
# 2.0.0-alpha.34 (2022-06-03)

### Bug Fixes:

* **convention:** re-export vc and bb from runtime, add tests ([64a1252](https://github.com/aurelia/aurelia/commit/64a1252))


### Refactorings:

* **compiler:** remove no-action mode for custom element content (#1438) ([f9c8170](https://github.com/aurelia/aurelia/commit/f9c8170))

<a name="2.0.0-alpha.33"></a>
# 2.0.0-alpha.33 (2022-05-26)

### Features:

* **lifecycle-hooks:** call hydrated lch ([75650c5](https://github.com/aurelia/aurelia/commit/75650c5))
* **lifecycle-hooks:** call hydrating lch ([737d9ed](https://github.com/aurelia/aurelia/commit/737d9ed))
* **lifecycle-hooks:** add attribute created lch ([524a5df](https://github.com/aurelia/aurelia/commit/524a5df))


### Bug Fixes:

* **array-observer:** don't mutate incoming indexmap (#1429) ([a77a104](https://github.com/aurelia/aurelia/commit/a77a104))


### Refactorings:

* **lifecycle-hooks:** dont invoke lfc on CA ([395b26a](https://github.com/aurelia/aurelia/commit/395b26a))

<a name="2.0.0-alpha.32"></a>
# 2.0.0-alpha.32 (2022-05-22)

### Features:

* ***:** lifecyclehooks created (#1428) ([3a0e93d](https://github.com/aurelia/aurelia/commit/3a0e93d))

<a name="2.0.0-alpha.31"></a>
# 2.0.0-alpha.31 (2022-05-15)

### Features:

* **containerless:** ability to override `containerless` config from view (#1417) ([26968cc](https://github.com/aurelia/aurelia/commit/26968cc))
* **plugin:** aurelia store (v2) plugin (#1412) ([6989de0](https://github.com/aurelia/aurelia/commit/6989de0))


### Refactorings:

* ***:** cleanup unused flags ([c4ce901](https://github.com/aurelia/aurelia/commit/c4ce901))
* ***:** add code to DEV err msg, unify error message quote ([b4909fb](https://github.com/aurelia/aurelia/commit/b4909fb))

<a name="2.0.0-alpha.30"></a>
# 2.0.0-alpha.30 (2022-05-07)

### Features:

* **events:** expr as listener handler (#1411) ([ff6ebb8](https://github.com/aurelia/aurelia/commit/ff6ebb8))
* **testing:** automatically hook fixture create promise / tear down ([ff6ebb8](https://github.com/aurelia/aurelia/commit/ff6ebb8))
* **testing:** enhance createFixture helper props ([ff6ebb8](https://github.com/aurelia/aurelia/commit/ff6ebb8))
* **hmr:** add in hmr capabilities (#1400) ([6d932a7](https://github.com/aurelia/aurelia/commit/6d932a7))


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

**Note:** Version bump only for package @aurelia/runtime-html

<a name="2.0.0-alpha.28"></a>
# 2.0.0-alpha.28 (2022-04-16)

### Bug Fixes:

* **css-module:** allow colon in class names (#1388) ([47860ab](https://github.com/aurelia/aurelia/commit/47860ab))

<a name="2.0.0-alpha.27"></a>
# 2.0.0-alpha.27 (2022-04-08)

### Bug Fixes:

* **build:** ensure correct __DEV__ build value replacement (#1377) ([40ce0e3](https://github.com/aurelia/aurelia/commit/40ce0e3))
* **runtime-html:** local dependencies for local element (#1375) ([0d48dbf](https://github.com/aurelia/aurelia/commit/0d48dbf))
* **switch+promise:** test build issues ([63cf5d0](https://github.com/aurelia/aurelia/commit/63cf5d0))


### Refactorings:

* **local-template:** register dependency while building definition & add tests ([0d48dbf](https://github.com/aurelia/aurelia/commit/0d48dbf))
* **switch+promise:** deferred view instantiation (#1372) ([63cf5d0](https://github.com/aurelia/aurelia/commit/63cf5d0))
* **all:** removing unnecessary assertions & lintings (#1371) ([05cec15](https://github.com/aurelia/aurelia/commit/05cec15))

<a name="2.0.0-alpha.26"></a>
# 2.0.0-alpha.26 (2022-03-13)

### Bug Fixes:

* **compiler:** allowing value modification from attr pattern on some cases for custom attribute (#1366) ([6a190b8](https://github.com/aurelia/aurelia/commit/6a190b8))
* **template-compiler:** custom attribute works with attr-pattern in all cases ([6a190b8](https://github.com/aurelia/aurelia/commit/6a190b8))

<a name="2.0.0-alpha.25"></a>
# 2.0.0-alpha.25 (2022-03-08)

**Note:** Version bump only for package @aurelia/runtime-html

<a name="2.0.0-alpha.24"></a>
# 2.0.0-alpha.24 (2022-01-18)

### Bug Fixes:

* **promise:** suppressed TaskAbortError on cancellation ([b917470](https://github.com/aurelia/aurelia/commit/b917470))


### Refactorings:

* **promise:** pre-settled task result rejection ([0e5d75d](https://github.com/aurelia/aurelia/commit/0e5d75d))

<a name="2.0.0-alpha.23"></a>
# 2.0.0-alpha.23 (2021-11-22)

### Refactorings:

* ***:** disabling type-coercion by default ([e5028c1](https://github.com/aurelia/aurelia/commit/e5028c1))
* ***:** injectable coercion configuration ([b901c4b](https://github.com/aurelia/aurelia/commit/b901c4b))
* ***:** post-review changes 1 ([cc279d4](https://github.com/aurelia/aurelia/commit/cc279d4))
* **runtime-html:** coercing configuration options ([cba53c7](https://github.com/aurelia/aurelia/commit/cba53c7))
* **runtime-html:** nullable coercing ([11bd0dd](https://github.com/aurelia/aurelia/commit/11bd0dd))
* **bindable:** auto discover coercer WIP ([d64d704](https://github.com/aurelia/aurelia/commit/d64d704))

<a name="2.0.0-alpha.22"></a>
# 2.0.0-alpha.22 (2021-10-24)

### Bug Fixes:

* ***:** build issues ([1a32a43](https://github.com/aurelia/aurelia/commit/1a32a43))


### Refactorings:

* **repeat:** destructuring support WIP ([a6257f0](https://github.com/aurelia/aurelia/commit/a6257f0))

<a name="2.0.0-alpha.21"></a>
# 2.0.0-alpha.21 (2021-09-12)

### Refactorings:

* **runtime:** use isType utilities for fn & string ([37a8fd9](https://github.com/aurelia/aurelia/commit/37a8fd9))
* **runtime:** use isType utility for string ([64b41b5](https://github.com/aurelia/aurelia/commit/64b41b5))
* **runtime:** use isType utility for function ([f621365](https://github.com/aurelia/aurelia/commit/f621365))

<a name="2.0.0-alpha.20"></a>
# 2.0.0-alpha.20 (2021-09-04)

### Features:

* **au-slot:** work with containerless ([9fa0a06](https://github.com/aurelia/aurelia/commit/9fa0a06))


### Refactorings:

* **au-compose:** move initiator out of change info, add tests for #1299 ([8f2bf0c](https://github.com/aurelia/aurelia/commit/8f2bf0c))

<a name="2.0.0-alpha.19"></a>
# 2.0.0-alpha.19 (2021-08-29)

### Bug Fixes:

* **template-compiler:** capture ignore attr command on bindable like props ([0a52fbf](https://github.com/aurelia/aurelia/commit/0a52fbf))
* ***:** export ITemplateCompiler from aurelia package ([0a52fbf](https://github.com/aurelia/aurelia/commit/0a52fbf))


### Refactorings:

* **all:** remove more internal typings ([1ffc38b](https://github.com/aurelia/aurelia/commit/1ffc38b))

<a name="2.0.0-alpha.18"></a>
# 2.0.0-alpha.18 (2021-08-22)

### Features:

* **au-compose:** works with au-slot ([4bfcc00](https://github.com/aurelia/aurelia/commit/4bfcc00))
* **attr-transfer:** implement attr capturing & spreading ([998b91c](https://github.com/aurelia/aurelia/commit/998b91c))


### Bug Fixes:

* **repeat:** ensure binding behavior works with .for binding ([30a27a0](https://github.com/aurelia/aurelia/commit/30a27a0))

<a name="2.0.0-alpha.17"></a>
# 2.0.0-alpha.17 (2021-08-16)

### Bug Fixes:

* **repeat:** #779 ([4c121b9](https://github.com/aurelia/aurelia/commit/4c121b9))


### Refactorings:

* **command:** extract CommandType out of ExpressionType ([e24fbed](https://github.com/aurelia/aurelia/commit/e24fbed))
* **all:** rename BindingType -> ExpressionType ([8cf4061](https://github.com/aurelia/aurelia/commit/8cf4061))
* **command:** simplify binding type enum ([6651678](https://github.com/aurelia/aurelia/commit/6651678))
* **di:** resolver disposal ([7c50556](https://github.com/aurelia/aurelia/commit/7c50556))

<a name="2.0.0-alpha.16"></a>
# 2.0.0-alpha.16 (2021-08-07)

### Features:

* **wc:** add web-component plugin ([74589bc](https://github.com/aurelia/aurelia/commit/74589bc))


### Bug Fixes:

* **href:** avoid interfering with native href ([de625d2](https://github.com/aurelia/aurelia/commit/de625d2))


### Performance Improvements:

* **bindings:** simpler observer tracking/clearing ([c867cd1](https://github.com/aurelia/aurelia/commit/c867cd1))


### Refactorings:

* **binding-command:** bindingType -> type ([e38e7f2](https://github.com/aurelia/aurelia/commit/e38e7f2))
* **all:** use a terser name cache for predictable prop mangling ([7649ced](https://github.com/aurelia/aurelia/commit/7649ced))

<a name="2.0.0-alpha.15"></a>
# 2.0.0-alpha.15 (2021-08-01)

### Features:

* **promise:** re-enable promise patterns .resolve/then/catch ([d0fa65c](https://github.com/aurelia/aurelia/commit/d0fa65c))


### Bug Fixes:

* **attr-parser:** avoid mutating non endpoint state ([9996ae4](https://github.com/aurelia/aurelia/commit/9996ae4))
* **attr-parser:** return null if theres no endpoint ([915bfb1](https://github.com/aurelia/aurelia/commit/915bfb1))


### Refactorings:

* **all:** remove lifecycle flags from various APIs ([b05db02](https://github.com/aurelia/aurelia/commit/b05db02))
* **template-compiler:** let binding command determine parsing work ([63aace4](https://github.com/aurelia/aurelia/commit/63aace4))

<a name="2.0.0-alpha.14"></a>
# 2.0.0-alpha.14 (2021-07-25)

### Refactorings:

* **runtime-html:** more error coded ([928d75e](https://github.com/aurelia/aurelia/commit/928d75e))
* **resources:** codify more error messages ([5be00b4](https://github.com/aurelia/aurelia/commit/5be00b4))
* **template-compiler:** codeify error messages, add doc ([8004b8c](https://github.com/aurelia/aurelia/commit/8004b8c))
* **instructions:** rename instructions to props for CE/CA/TC ([ce307f4](https://github.com/aurelia/aurelia/commit/ce307f4))
* **runtime:** mark more private properties ([8ecf70b](https://github.com/aurelia/aurelia/commit/8ecf70b))
* **controller:** rename semi public APIs ([c2ee6e9](https://github.com/aurelia/aurelia/commit/c2ee6e9))

<a name="2.0.0-alpha.13"></a>
# 2.0.0-alpha.13 (2021-07-19)

### Refactorings:

* **enhance:** incorporate reviews, enhance returns raw controller ([5504ad9](https://github.com/aurelia/aurelia/commit/5504ad9))
* **controller:** remove unneeded param from Controller.forCustomElement ([4abb1ee](https://github.com/aurelia/aurelia/commit/4abb1ee))
* ***:** remove root from IController ([c51ed16](https://github.com/aurelia/aurelia/commit/c51ed16))
* **enhance:** make enhance works in a disconnected way ([52c2c1c](https://github.com/aurelia/aurelia/commit/52c2c1c))
* **controller:** no longer needs to determine root ([9121240](https://github.com/aurelia/aurelia/commit/9121240))
* **bindings:** rename observeProperty -> observe, add doc ([fed517f](https://github.com/aurelia/aurelia/commit/fed517f))
* **ast:** simplify AST kind enum ([fed517f](https://github.com/aurelia/aurelia/commit/fed517f))
* ***:** avoid creating blocks ([27dcf0b](https://github.com/aurelia/aurelia/commit/27dcf0b))
* **controller:** remove ctx ctrl requirement from .forCustomElement ([7edcef2](https://github.com/aurelia/aurelia/commit/7edcef2))
* **render-context:** remove render context ([7d38f53](https://github.com/aurelia/aurelia/commit/7d38f53))
* **render-context:** remove all main render-context usages ([efc607a](https://github.com/aurelia/aurelia/commit/efc607a))
* **render-context:** prepare to remove .getViewFactory()/.compile() methods ([db9a9ab](https://github.com/aurelia/aurelia/commit/db9a9ab))
* **render-context:** prepare to remove .createNodes() method ([747d8cf](https://github.com/aurelia/aurelia/commit/747d8cf))
* **render-context:** prepare remove .render method ([5852299](https://github.com/aurelia/aurelia/commit/5852299))
* **render-context:** prepare render context removal ([b0a9515](https://github.com/aurelia/aurelia/commit/b0a9515))
* **binding-context:** add comment explaning difference in behavior ([f4bcc9f](https://github.com/aurelia/aurelia/commit/f4bcc9f))
* **scope:** remove host scope ([0349810](https://github.com/aurelia/aurelia/commit/0349810))
* **au-slot:** make host exposure a normal, explicit prop ([e2ce36c](https://github.com/aurelia/aurelia/commit/e2ce36c))

<a name="2.0.0-alpha.12"></a>
# 2.0.0-alpha.12 (2021-07-11)

### Refactorings:

* **template-compiler:** beforeCompile -> compiling ([d8d8cc5](https://github.com/aurelia/aurelia/commit/d8d8cc5))

<a name="2.0.0-alpha.11"></a>
# 2.0.0-alpha.11 (2021-07-11)

### Features:

* **au-render:** ability to compose element using string as name ([aa466b4](https://github.com/aurelia/aurelia/commit/aa466b4))
* **if-else:** add ability to disable cache ([600c33f](https://github.com/aurelia/aurelia/commit/600c33f))


### Bug Fixes:

* **if:** fix actvation/deactivation timing ([020de51](https://github.com/aurelia/aurelia/commit/020de51))
* **call-binding:** assign args to event property, fixes #1231 ([fa4c0d4](https://github.com/aurelia/aurelia/commit/fa4c0d4))
* **renderer:** pass render location to ce ([ce141b5](https://github.com/aurelia/aurelia/commit/ce141b5))


### Performance Improvements:

* **renderer:** don't always call applyBb ([5e2d624](https://github.com/aurelia/aurelia/commit/5e2d624))
* **rendering:** use definition for attrs & els ([3a26b46](https://github.com/aurelia/aurelia/commit/3a26b46))
* **templating:** avoid retrieving definition unnecessarily ([f0e597f](https://github.com/aurelia/aurelia/commit/f0e597f))
* **templating:** resolved Type for CE instruction ([0b52d11](https://github.com/aurelia/aurelia/commit/0b52d11))


### Refactorings:

* **all:** use container from controller instead of context ([0822330](https://github.com/aurelia/aurelia/commit/0822330))
* **render-context:** cache renderers and compiled definition ([6a3be10](https://github.com/aurelia/aurelia/commit/6a3be10))
* **renderer:** use container from rendering controller as cotnext ([edc5dd8](https://github.com/aurelia/aurelia/commit/edc5dd8))
* **context:** remove IContainer interface impls out of Render/Route context ([18524de](https://github.com/aurelia/aurelia/commit/18524de))
* **context:** distinguish between render context and its container ([f216e98](https://github.com/aurelia/aurelia/commit/f216e98))

<a name="2.0.0-alpha.10"></a>
# 2.0.0-alpha.10 (2021-07-04)

### Features:

* **template-compiler:** ability to toggle expressions removal ([93272a2](https://github.com/aurelia/aurelia/commit/93272a2))
* **template-compiler:** add hooks decorator support, more integration tests ([dd3698d](https://github.com/aurelia/aurelia/commit/dd3698d))
* **template-compiler:** add beforeCompile hooks ([5e42b76](https://github.com/aurelia/aurelia/commit/5e42b76))
* **au-compose:** add support for composition with containerless on au-compose ([dec8a5a](https://github.com/aurelia/aurelia/commit/dec8a5a))
* **t-compiler:** add ability to recognize containerless attr ([23ec6cd](https://github.com/aurelia/aurelia/commit/23ec6cd))
* **hydration:** add hydration context hierarchy ([9afb70c](https://github.com/aurelia/aurelia/commit/9afb70c))
* **di:** instance-provider now accepts predefined instance in 2nd param ([54edac9](https://github.com/aurelia/aurelia/commit/54edac9))


### Bug Fixes:

* **watch:** construct scope properly for custom attr + expression watch ([cb26b0c](https://github.com/aurelia/aurelia/commit/cb26b0c))
* **scope:** disable host scope on CE controller ([ac0ff15](https://github.com/aurelia/aurelia/commit/ac0ff15))


### Refactorings:

* **templating:** remove projections param from getRenderContext ([cf34e40](https://github.com/aurelia/aurelia/commit/cf34e40))
* **templating:** remove blur CA, tweak doc/tests ([1286b3b](https://github.com/aurelia/aurelia/commit/1286b3b))
* **au-slot:** remove unused exports ([58cc0b5](https://github.com/aurelia/aurelia/commit/58cc0b5))
* **au-slot:** lazily determine view factory at runtime ([5d3fa25](https://github.com/aurelia/aurelia/commit/5d3fa25))
* **controller:** remove unneccessary typings ([39ed707](https://github.com/aurelia/aurelia/commit/39ed707))

<a name="2.0.0-alpha.9"></a>
# 2.0.0-alpha.9 (2021-06-25)

### Features:

* **templating:** add a injectable hydration token ([52f11c4](https://github.com/aurelia/aurelia/commit/52f11c4))


### Bug Fixes:

* **with:** update bindings scope properly when value change ([906105d](https://github.com/aurelia/aurelia/commit/906105d))
* **let:** camel-case let target when using with interpolation/literal ([bee73cc](https://github.com/aurelia/aurelia/commit/bee73cc))


### Performance Improvements:

* **templating:** inline injectable preparation ([2f0ea95](https://github.com/aurelia/aurelia/commit/2f0ea95))
* **di:** do not create a new factory in .invoke() ([23c0405](https://github.com/aurelia/aurelia/commit/23c0405))
* **di:** minification friendlier di code ([23c0405](https://github.com/aurelia/aurelia/commit/23c0405))


### Refactorings:

* **au-slot:** use new hydration context token ([52f11c4](https://github.com/aurelia/aurelia/commit/52f11c4))
* **templating:** change timing of the container of a CE ([23c0405](https://github.com/aurelia/aurelia/commit/23c0405))
* **attr-syntax-transformer:** rename IAttrSyntaxTransformer ([71f5ceb](https://github.com/aurelia/aurelia/commit/71f5ceb))
* **all:** separate value from typing imports ([71f5ceb](https://github.com/aurelia/aurelia/commit/71f5ceb))

<a name="2.0.0-alpha.8"></a>
# 2.0.0-alpha.8 (2021-06-22)

### Features:

* **binding-command:** add a build method, and let binding command have access to more raw information. ([240692d](https://github.com/aurelia/aurelia/commit/240692d))
* **attr-syntax-transformer:** add isTwoWay & map methods. These are lower & purer primitives compared to existing ones, allowing better control in the compilation. ([240692d](https://github.com/aurelia/aurelia/commit/240692d))
* **au-slot:** ability to use au-slot on the same element with a template controller ([240692d](https://github.com/aurelia/aurelia/commit/240692d))


### Bug Fixes:

* **dialog:** correct dialog dom structure ([42ae808](https://github.com/aurelia/aurelia/commit/42ae808))
* **dialog default imp:** dialog child of wrapper ([3cce8ea](https://github.com/aurelia/aurelia/commit/3cce8ea))
* **dialog-default-imp:** display flex on overlay ([ce3c91e](https://github.com/aurelia/aurelia/commit/ce3c91e))


### Refactorings:

* **template-compiler:** fix linting issues, cleanup method names ([581c1e3](https://github.com/aurelia/aurelia/commit/581c1e3))
* **template-compiler:** remove BindingCommand.prototype.compile ([63dee52](https://github.com/aurelia/aurelia/commit/63dee52))
* **template-compiler:** remove existing TemplateCompiler, remove TemplateBinder ([0ab0cde](https://github.com/aurelia/aurelia/commit/0ab0cde))
* **template-compiler:** use class base impl for compilation context ([6cf1435](https://github.com/aurelia/aurelia/commit/6cf1435))
* **template-compiler:** merge binder & compiler ([240692d](https://github.com/aurelia/aurelia/commit/240692d))

<a name="2.0.0-alpha.7"></a>
# 2.0.0-alpha.7 (2021-06-20)

### Refactorings:

* **hydration-compilation:** use an object to carry more than projections information ([39c5497](https://github.com/aurelia/aurelia/commit/39c5497))
* **au-slot:** remove unused exports, fix tests ([aaf81de](https://github.com/aurelia/aurelia/commit/aaf81de))
* **au-slot:** do not associate scope with instruction/definition during compilation ([2fafe21](https://github.com/aurelia/aurelia/commit/2fafe21))
* **slot:** drop the use of projection provider in <au-slot/> ([560e3c5](https://github.com/aurelia/aurelia/commit/560e3c5))
* **scope:** rename isComponentBoundary -> isBoundary ([a3a4281](https://github.com/aurelia/aurelia/commit/a3a4281))

<a name="2.0.0-alpha.6"></a>
# 2.0.0-alpha.6 (2021-06-11)

### Features:

* **compose:** au-compose -> au-render, implement v1 compose ([7b1502c](https://github.com/aurelia/aurelia/commit/7b1502c))
* **compose-v1:** better composition queues ([7b1502c](https://github.com/aurelia/aurelia/commit/7b1502c))
* **compose-v1:** better basic impl, timing ([7b1502c](https://github.com/aurelia/aurelia/commit/7b1502c))
* **compose-v1:** cleanup typings & unnecessary props ([7b1502c](https://github.com/aurelia/aurelia/commit/7b1502c))
* **compose-v1:** basic working tests with deactivation ([7b1502c](https://github.com/aurelia/aurelia/commit/7b1502c))
* **compose-v1:** better race condition handling ([7b1502c](https://github.com/aurelia/aurelia/commit/7b1502c))
* **compose-v1:** correct value change handling during detach ([7b1502c](https://github.com/aurelia/aurelia/commit/7b1502c))
* **compose-v1:** add test for scoped view-only behavior ([7b1502c](https://github.com/aurelia/aurelia/commit/7b1502c))
* **compose-v1:** add test for custom element composition, tweak detaching ([7b1502c](https://github.com/aurelia/aurelia/commit/7b1502c))
* **compose-v1:** more view-model composition tests ([7b1502c](https://github.com/aurelia/aurelia/commit/7b1502c))
* **compose-v1:** only re-activate when model changes ([7b1502c](https://github.com/aurelia/aurelia/commit/7b1502c))
* **compose-v1:** add more tests for integration ([7b1502c](https://github.com/aurelia/aurelia/commit/7b1502c))


### Bug Fixes:

* **compose-v1:** ensure remove the old composition ([7b1502c](https://github.com/aurelia/aurelia/commit/7b1502c))
* **attr:** ensure attr binding command take precedence over custom attr ([5ecd6a7](https://github.com/aurelia/aurelia/commit/5ecd6a7))


### Refactorings:

* **children:** make children observer a controlled observer ([673c8ac](https://github.com/aurelia/aurelia/commit/673c8ac))

<a name="2.0.0-alpha.5"></a>
# 2.0.0-alpha.5 (2021-05-31)

### Bug Fixes:

* ***:** deepscan issue ([f7b9dcc](https://github.com/aurelia/aurelia/commit/f7b9dcc))
* ***:** broken tests ([17ccba5](https://github.com/aurelia/aurelia/commit/17ccba5))
* **content:** fix content array auto observation ([98f14ef](https://github.com/aurelia/aurelia/commit/98f14ef))


### Refactorings:

* ***:** dropped superfluous props view factory ([9ef9664](https://github.com/aurelia/aurelia/commit/9ef9664))

<a name="2.0.0-alpha.4"></a>
# 2.0.0-alpha.4 (2021-05-25)

**Note:** Version bump only for package @aurelia/runtime-html

<a name="2.0.0-alpha.3"></a>
# 2.0.0-alpha.3 (2021-05-19)

### Features:

* **app-task:** allow app task to be created without a key ([2786898](https://github.com/aurelia/aurelia/commit/2786898))
* **dialog:** add dialog prop, rename controller to dialog, add more doc ([8696093](https://github.com/aurelia/aurelia/commit/8696093))
* **dialog:** better error msg, encourage IDialogController ([fe82826](https://github.com/aurelia/aurelia/commit/fe82826))
* **dialog:** ensure inject IDialogController, add test for injection ([9455c7f](https://github.com/aurelia/aurelia/commit/9455c7f))
* **dialog:** naming consistency, more doc, clear prop names ([64a32fa](https://github.com/aurelia/aurelia/commit/64a32fa))
* **dialog:** ensure naming consistency ([b49cc6f](https://github.com/aurelia/aurelia/commit/b49cc6f))
* **dialog:** more tests, ensure lifecycle invocation ([66e8b10](https://github.com/aurelia/aurelia/commit/66e8b10))
* **dialog:** keyboard handling impl, more tests, tweak doc ([f7099ba](https://github.com/aurelia/aurelia/commit/f7099ba))
* **dialog:** better interfaces/names + tweak tests ([a4c801a](https://github.com/aurelia/aurelia/commit/a4c801a))
* **dialog:** fix linting & deepscan issues ([55d47b1](https://github.com/aurelia/aurelia/commit/55d47b1))
* **dialog:** better interface names ([499e926](https://github.com/aurelia/aurelia/commit/499e926))
* **dialog:** better messages, reorganise tests ([7425ba1](https://github.com/aurelia/aurelia/commit/7425ba1))
* **dialog:** move close promise handling to dialog activation, simplify dialog service ([2b817d9](https://github.com/aurelia/aurelia/commit/2b817d9))
* **dialog:** update dom impl ([b50d4e8](https://github.com/aurelia/aurelia/commit/b50d4e8))
* **dialog:** add tests ([7ca0502](https://github.com/aurelia/aurelia/commit/7ca0502))
* **dialog:** better implementation ([c8c7a1b](https://github.com/aurelia/aurelia/commit/c8c7a1b))
* **dialog:** add default IDIalogService ([eb92a73](https://github.com/aurelia/aurelia/commit/eb92a73))
* **composer:** better definition creation ([10e2d05](https://github.com/aurelia/aurelia/commit/10e2d05))
* **dialog:** add entry module for dialog exports ([3ada28b](https://github.com/aurelia/aurelia/commit/3ada28b))
* **composer:** tweak the view model invokcation & INode registration ([8f33a80](https://github.com/aurelia/aurelia/commit/8f33a80))
* **dialog:** add configuration ([8e396d4](https://github.com/aurelia/aurelia/commit/8e396d4))
* **dialog:** rearrange timing in dialog controller, adjust based objects ([e433054](https://github.com/aurelia/aurelia/commit/e433054))
* **dialog:** move all default implementations together ([7287b29](https://github.com/aurelia/aurelia/commit/7287b29))
* **dialog:** refactor interfaces organisation ([1f93ded](https://github.com/aurelia/aurelia/commit/1f93ded))
* **dialog:** refactor dialog controller ([7d53df3](https://github.com/aurelia/aurelia/commit/7d53df3))
* **dialog:** refactor interfaces, introduce new ext points ([1e0bfc6](https://github.com/aurelia/aurelia/commit/1e0bfc6))
* **dialog:** add basic dialog service to runtime-html ([347f00e](https://github.com/aurelia/aurelia/commit/347f00e))
* **compose:** basic friendly composer API implementation ([3022d76](https://github.com/aurelia/aurelia/commit/3022d76))
* **promise-tc:** initial implementation ([228085b](https://github.com/aurelia/aurelia/commit/228085b))


### Bug Fixes:

* ***:** deepscan issues ([48b1843](https://github.com/aurelia/aurelia/commit/48b1843))
* ***:** broken i18n tests ([2da8e72](https://github.com/aurelia/aurelia/commit/2da8e72))
* **debounce:** respect default delay ([420829c](https://github.com/aurelia/aurelia/commit/420829c))
* **select-observer:** ensure value is fresh when flush ([99e0172](https://github.com/aurelia/aurelia/commit/99e0172))
* **lifecycle-hooks:** properly maintain resources semantic ([6bfefcb](https://github.com/aurelia/aurelia/commit/6bfefcb))
* ***:** revert changes in attr-observer, remove unused code in dirty checker ([192a26f](https://github.com/aurelia/aurelia/commit/192a26f))
* **observers:** ensure oldValue is correctly updated in flush,with optz ([07bc335](https://github.com/aurelia/aurelia/commit/07bc335))
* **promise-tc:** activation and deactivation ([54ad4ea](https://github.com/aurelia/aurelia/commit/54ad4ea))


### Refactorings:

* ***:** binding context resolution with bindingmode participation" ([b84813c](https://github.com/aurelia/aurelia/commit/b84813c))
* **app-task:** simplify usage, align with .createInterface ([2786898](https://github.com/aurelia/aurelia/commit/2786898))
* **dialog:** stricter interface, tweak tests, fix deepscan ([53f95a4](https://github.com/aurelia/aurelia/commit/53f95a4))
* **dialog:** simplify interfaces, renmove default animator ([49e3c70](https://github.com/aurelia/aurelia/commit/49e3c70))
* **dialog:** remove IDialogAnimator ([9e1a354](https://github.com/aurelia/aurelia/commit/9e1a354))
* ***:** binding context resolution with bindingmode participation ([3abe3f6](https://github.com/aurelia/aurelia/commit/3abe3f6))
* **all:** rename currentValue -> value ([6dc943e](https://github.com/aurelia/aurelia/commit/6dc943e))
* ***:** separate scope for promise ([1d0de63](https://github.com/aurelia/aurelia/commit/1d0de63))
* **observable:** queue value attr observer ([920bd59](https://github.com/aurelia/aurelia/commit/920bd59))
* **observation:** don't propagate changes with depth first resolution ([235f227](https://github.com/aurelia/aurelia/commit/235f227))
* **promise-tc:** then, catch redirections ([7723332](https://github.com/aurelia/aurelia/commit/7723332))
* **promise-tc:** promise.resolve redirection ([1ba35df](https://github.com/aurelia/aurelia/commit/1ba35df))
* **promise-tc:** task queuing + timing tests ([7b2224f](https://github.com/aurelia/aurelia/commit/7b2224f))
* **promise-tc:** task queue ([7abe877](https://github.com/aurelia/aurelia/commit/7abe877))
* **promise-tc:** and test ([1aaf36a](https://github.com/aurelia/aurelia/commit/1aaf36a))

<a name="2.0.0-alpha.2"></a>
# 2.0.0-alpha.2 (2021-03-07)

### Features:

* **di:** add invoke to route context ([3c51a30](https://github.com/aurelia/aurelia/commit/3c51a30))
* **di:** add invoke to render context too ([ead0522](https://github.com/aurelia/aurelia/commit/ead0522))


### Bug Fixes:

* **runtime:** fix duplicate lifecycleHooks resolution at root ([3b245ec](https://github.com/aurelia/aurelia/commit/3b245ec))

<a name="2.0.0-alpha.1"></a>
# 2.0.0-alpha.1 (2021-03-03)

**Note:** Version bump only for package @aurelia/runtime-html

<a name="2.0.0-alpha.0"></a>
# 2.0.0-alpha.0 (2021-03-02)

### Features:

* ***:** input[type=number/date] value as number binding ([d7bc69d](https://github.com/aurelia/aurelia/commit/d7bc69d))
* ***:** ability to teach attr-prop mapping ([55c8ca7](https://github.com/aurelia/aurelia/commit/55c8ca7))
* **text-interpolation:** basic implementation ([67f5735](https://github.com/aurelia/aurelia/commit/67f5735))
* ***:** track read on observable & bindable ([011804f](https://github.com/aurelia/aurelia/commit/011804f))


### Bug Fixes:

* **template-binder:** check if as-element was used ([35284f2](https://github.com/aurelia/aurelia/commit/35284f2))
* **template-binder:** check if as-element was used ([6bc5d40](https://github.com/aurelia/aurelia/commit/6bc5d40))
* **syntax-transformer:** don't transform attr of .class & .style commands ([c07b9d0](https://github.com/aurelia/aurelia/commit/c07b9d0))
* **syntax-transformer): ?? vs ? vs () :dizz:**  ([af12ed7](https://github.com/aurelia/aurelia/commit/af12ed7))
* ***:** binder ignore attr correctly ([311fe1e](https://github.com/aurelia/aurelia/commit/311fe1e))
* **binder-test:** adjust the expected output as interpolation is removed ([2684446](https://github.com/aurelia/aurelia/commit/2684446))
* **binder:** only remove attr when there's an interpolation ([51bb404](https://github.com/aurelia/aurelia/commit/51bb404))
* ***:** remove attr with interpolation ([a0a1df9](https://github.com/aurelia/aurelia/commit/a0a1df9))
* **content-interpolation:** cancel task if any when latest value is update ([6784103](https://github.com/aurelia/aurelia/commit/6784103))
* **content-interpolation:** bogus null assignment ([815469e](https://github.com/aurelia/aurelia/commit/815469e))
* **content-interpolation:** queue in both normal & collection change ([b8b6bbc](https://github.com/aurelia/aurelia/commit/b8b6bbc))
* **interpolation-binding:** cleanup old value in unbind ([bdc394c](https://github.com/aurelia/aurelia/commit/bdc394c))
* **binder:** dont remove the physical text node ([6beab31](https://github.com/aurelia/aurelia/commit/6beab31))
* **bindings:** remove redundant return and ensure .updateSource flag ([4d975f7](https://github.com/aurelia/aurelia/commit/4d975f7))
* **interpolation:** release task in unbind ([08933e4](https://github.com/aurelia/aurelia/commit/08933e4))
* **debounce/throttle:** override queue when source changes ([3c366fd](https://github.com/aurelia/aurelia/commit/3c366fd))


### Refactorings:

* ***:** remove left over unused ids ([97fc845](https://github.com/aurelia/aurelia/commit/97fc845))
* **template-binder:** handle binding plain attr differently ([a0a1df9](https://github.com/aurelia/aurelia/commit/a0a1df9))
* **all:** remove .update flags ([3fc1632](https://github.com/aurelia/aurelia/commit/3fc1632))
* **bindable:** use controller for determining bound state & change handler ([f4acedd](https://github.com/aurelia/aurelia/commit/f4acedd))
* **content-interpolation:** put text node next to the original one ([b78a210](https://github.com/aurelia/aurelia/commit/b78a210))
* **content-binding:** dont remove on unbind, add assertion for post tearDown ([343f790](https://github.com/aurelia/aurelia/commit/343f790))
* **interpolation:** rename interpolation part binding, remove redundant code ([8a1a21e](https://github.com/aurelia/aurelia/commit/8a1a21e))
* **bindable:** use controller for determining bound state & change handler ([043c679](https://github.com/aurelia/aurelia/commit/043c679))
* ***:** update attr binding, throttle/debounce, add tests ([cab73f4](https://github.com/aurelia/aurelia/commit/cab73f4))
* **prop-binding:** remove necessity for id stamping infra ([409d977](https://github.com/aurelia/aurelia/commit/409d977))

<a name="0.9.0"></a>
# 0.9.0 (2021-01-31)

### Features:

* **runtime-html:** add @lifecycleHooks wiring ([4076293](https://github.com/aurelia/aurelia/commit/4076293))
* **runtime:** add getRef/setRef API's and expose $au object on nodes ([c47cc85](https://github.com/aurelia/aurelia/commit/c47cc85))
* **runtime-html:** invoke created() hook on custom attributes ([3e90d68](https://github.com/aurelia/aurelia/commit/3e90d68))
* ***:** decorator auSlots wip ([6ddb362](https://github.com/aurelia/aurelia/commit/6ddb362))
* ***:** processContent wip ([cb8a103](https://github.com/aurelia/aurelia/commit/cb8a103))
* **show/hide:** port show & hide attributes from v1 ([8dd9562](https://github.com/aurelia/aurelia/commit/8dd9562))
* **compiler:** preserve 'alias' in the compiled instruction for usage by component instance ([e80a837](https://github.com/aurelia/aurelia/commit/e80a837))
* **di:** remove DI.createInterface builder ([8146dcc](https://github.com/aurelia/aurelia/commit/8146dcc))
* **work-tracker:** initial implementation for an app-wide 'wait-for-idle' api ([c677a4d](https://github.com/aurelia/aurelia/commit/c677a4d))


### Bug Fixes:

* **runtime:** prevent early taskQueue yield ([a72c8b2](https://github.com/aurelia/aurelia/commit/a72c8b2))
* **custom-attribute:** fix CustomAttribute.for ([4c97444](https://github.com/aurelia/aurelia/commit/4c97444))
* ***:** as-element support for au-slot ([ae233e3](https://github.com/aurelia/aurelia/commit/ae233e3))
* ***:** linting issue ([0613391](https://github.com/aurelia/aurelia/commit/0613391))
* ***:** compilation skipping ([c9f5bda](https://github.com/aurelia/aurelia/commit/c9f5bda))
* ***:** order-agnostic processContent decorator ([c3a4bb6](https://github.com/aurelia/aurelia/commit/c3a4bb6))
* **batch:** ensure nested batch not batched in outer ([ae61005](https://github.com/aurelia/aurelia/commit/ae61005))
* ***:** ensure bindable & observable behavior match v1 ([200ac40](https://github.com/aurelia/aurelia/commit/200ac40))
* **accessors:** add index signature ([617c416](https://github.com/aurelia/aurelia/commit/617c416))
* ***:** use sub count from record only ([e9f578e](https://github.com/aurelia/aurelia/commit/e9f578e))
* **semantic-model:** include alias in cache key ([ad09693](https://github.com/aurelia/aurelia/commit/ad09693))
* **tests:** correct validation controller tests ([2849c99](https://github.com/aurelia/aurelia/commit/2849c99))
* **attribute:** queue new task ([5f7fa27](https://github.com/aurelia/aurelia/commit/5f7fa27))
* **controller:** fix async unbind with dispose race condition ([987d69d](https://github.com/aurelia/aurelia/commit/987d69d))


### Performance Improvements:

* **controller:** use stack to minimize promise tick overhead ([d861da8](https://github.com/aurelia/aurelia/commit/d861da8))


### Refactorings:

* ***:** au-slot info via DI ([1719669](https://github.com/aurelia/aurelia/commit/1719669))
* **all:** rename macroTaskQueue to taskQueue ([87c073d](https://github.com/aurelia/aurelia/commit/87c073d))
* ***:** decorator auSlots ([26e980c](https://github.com/aurelia/aurelia/commit/26e980c))
* ***:** decorator auSlots ([9fbb312](https://github.com/aurelia/aurelia/commit/9fbb312))
* ***:** and more tests for processContent ([893831e](https://github.com/aurelia/aurelia/commit/893831e))
* **connectable:** merge observer record & collection observer record ([f2c1501](https://github.com/aurelia/aurelia/commit/f2c1501))
* **all:** rename interfaces, simplify subscriber collection ([1c37183](https://github.com/aurelia/aurelia/commit/1c37183))
* **all:** remove ILifecycle ([d141d8e](https://github.com/aurelia/aurelia/commit/d141d8e))
* **observation:** minor cleanup, tweak accessor type ([2756ece](https://github.com/aurelia/aurelia/commit/2756ece))
* **connectable:** more cryptic, less generic name ([0f303cb](https://github.com/aurelia/aurelia/commit/0f303cb))
* **subscribers:** use a separate record for managing subscribers ([9f9152d](https://github.com/aurelia/aurelia/commit/9f9152d))
* **di:** store factory per container root instead of via metadata ([dbbd8b9](https://github.com/aurelia/aurelia/commit/dbbd8b9))
* ***:** use private static, tweak comments, simplify vs ast code ([d8f1c69](https://github.com/aurelia/aurelia/commit/d8f1c69))
* ***:** use private static, tweak comments, simplify vs ast code ([98d33b4](https://github.com/aurelia/aurelia/commit/98d33b4))
* **runtime-html:** more cleanup ([5bde778](https://github.com/aurelia/aurelia/commit/5bde778))
* **watch:** move to runtime-html ([1250402](https://github.com/aurelia/aurelia/commit/1250402))
* **runtime:** move binding implementations to runtime-html ([8d9a177](https://github.com/aurelia/aurelia/commit/8d9a177))
* **connectable:** make observe coll part of IConnectable, updat watchers ([3df866c](https://github.com/aurelia/aurelia/commit/3df866c))
* ***:** remove IPropertyChangeTracker interface ([d9ba9a4](https://github.com/aurelia/aurelia/commit/d9ba9a4))
* **obs:** remove IPropertyObserver ([d29bc28](https://github.com/aurelia/aurelia/commit/d29bc28))
* **all:** remove IBindingTargetAccessor & IBindingTargetObserver interfaces ([d9c27c6](https://github.com/aurelia/aurelia/commit/d9c27c6))
* **runtime:** reexport watch on aurelia package ([af29a73](https://github.com/aurelia/aurelia/commit/af29a73))
* **el-accessor:** merge size & length observersremove task reuse ([3af2d9f](https://github.com/aurelia/aurelia/commit/3af2d9f))
* **obs:** clean up bind from observer, ([3006d3b](https://github.com/aurelia/aurelia/commit/3006d3b))
* **if:** cleanup & utilize WorkTracker ([df3a5d5](https://github.com/aurelia/aurelia/commit/df3a5d5))
* **bench-apps:** measurement ([ae4ecaf](https://github.com/aurelia/aurelia/commit/ae4ecaf))

<a name="0.8.0"></a>
# 0.8.0 (2020-11-30)

### Features:

* **templating-syntax:** ability to define custom bind to two way transform ([aa5a693](https://github.com/aurelia/aurelia/commit/aa5a693))
* **computed:** no type check proxy, reorg args order ([6f3d36f](https://github.com/aurelia/aurelia/commit/6f3d36f))
* **controller:** enable shadowDOM and containerless for host-less components ([89856c4](https://github.com/aurelia/aurelia/commit/89856c4))
* ***:** allow configurable dirty check for el observation ([5636608](https://github.com/aurelia/aurelia/commit/5636608))
* **kernel:** add resource create/find api's to the container ([1cab5bb](https://github.com/aurelia/aurelia/commit/1cab5bb))
* **runtime-html:** add IEventTarget interface to specify event delegate target ([90b804c](https://github.com/aurelia/aurelia/commit/90b804c))
* **setter-observer:** separate start/stop from subscribe, ([c895f93](https://github.com/aurelia/aurelia/commit/c895f93))
* **runtime-html:** add interfaces for IWindow, IHistory, ILocation ([5273d0a](https://github.com/aurelia/aurelia/commit/5273d0a))
* **runtime:** add cancel api and properly propagate async errors ([3c05ebe](https://github.com/aurelia/aurelia/commit/3c05ebe))
* **runtime:** add component tree visitor infra ([5dd0f67](https://github.com/aurelia/aurelia/commit/5dd0f67))
* **runtime:** implement/wireup dispose hook ([1e1819e](https://github.com/aurelia/aurelia/commit/1e1819e))
* **observation:** move scheduling to bindings ([3237d3d](https://github.com/aurelia/aurelia/commit/3237d3d))
* **obs-type:** add type & last update to all observers in runtime-html ([2f7feb8](https://github.com/aurelia/aurelia/commit/2f7feb8))
* ***:** enhance API ([976ae0c](https://github.com/aurelia/aurelia/commit/976ae0c))


### Bug Fixes:

* **syntax-extension:** tweak two mapping, add some more comments ([f267f68](https://github.com/aurelia/aurelia/commit/f267f68))
* **style-accessor-for-custom-properties' of http:** //github.com/aurelia/aurelia into fix-style-accessor-for-custom-properties ([e210496](https://github.com/aurelia/aurelia/commit/e210496))
* **style-attribute-accessor:** handle prop and url ([89c878a](https://github.com/aurelia/aurelia/commit/89c878a))
* ***:** linting issues ([e2fa345](https://github.com/aurelia/aurelia/commit/e2fa345))
* **observer-loc:** new api for overriding accessors ([8af6c46](https://github.com/aurelia/aurelia/commit/8af6c46))
* ***:** update trigger uses NodeObserverConfig ([b06fad0](https://github.com/aurelia/aurelia/commit/b06fad0))
* ***:** delay default configuration ([02134f7](https://github.com/aurelia/aurelia/commit/02134f7))
* ***:** alias node observer registration ([7541638](https://github.com/aurelia/aurelia/commit/7541638))
* **update-trigger:** get all original handler config ([228c0a8](https://github.com/aurelia/aurelia/commit/228c0a8))
* **tests:** adapt el observation changes ([7ac6f4a](https://github.com/aurelia/aurelia/commit/7ac6f4a))
* **select-observer:** correctly toggle observing status ([7f45560](https://github.com/aurelia/aurelia/commit/7f45560))
* **shadow-dom-registry:** remove StyleElementStylesFactory incorrect guard ([288a2a0](https://github.com/aurelia/aurelia/commit/288a2a0))
* **controller:** add controller metadata to host ([9f1b23a](https://github.com/aurelia/aurelia/commit/9f1b23a))
* ***:** disabled template controllers on local template surrogate ([62a45b9](https://github.com/aurelia/aurelia/commit/62a45b9))
* **switch:** add missing accept impl ([d497214](https://github.com/aurelia/aurelia/commit/d497214))
* **portal:** fallback to body on empty string querySelector ([8783bb3](https://github.com/aurelia/aurelia/commit/8783bb3))
* **switch:** pass initiator through for correct deactivate hook timings ([3ea306c](https://github.com/aurelia/aurelia/commit/3ea306c))
* **aurelia:** move controller dispose to stop() hook via a flag ([4305a7d](https://github.com/aurelia/aurelia/commit/4305a7d))
* ***:** use interface instead ([9fc8323](https://github.com/aurelia/aurelia/commit/9fc8323))
* **event-manager:** properly handle delegate events with shadowDOM / cleanup ([b79e7ba](https://github.com/aurelia/aurelia/commit/b79e7ba))
* **attr-binding:** store task on observer ([b8e37b3](https://github.com/aurelia/aurelia/commit/b8e37b3))
* ***:** linting/deepscan issues ([d9b275b](https://github.com/aurelia/aurelia/commit/d9b275b))
* ***:** deepscan + linting issues ([2f75f1e](https://github.com/aurelia/aurelia/commit/2f75f1e))
* **tests:** keep bind/unbind for now ([5a5174e](https://github.com/aurelia/aurelia/commit/5a5174e))
* **observers:** merge flags instead ([1dc7165](https://github.com/aurelia/aurelia/commit/1dc7165))
* ***:** broken tests ([3a73602](https://github.com/aurelia/aurelia/commit/3a73602))
* ***:** ducktype checking for nodelist ([b6d650a](https://github.com/aurelia/aurelia/commit/b6d650a))


### Performance Improvements:

* **controller:** use stack to minimize promise tick overhead ([2cac413](https://github.com/aurelia/aurelia/commit/2cac413))
* **bindings:** use eval/connect merge ([da4b49d](https://github.com/aurelia/aurelia/commit/da4b49d))


### Refactorings:

* **binding:** adapt obs record on attribute binding ([eddb58f](https://github.com/aurelia/aurelia/commit/eddb58f))
* **binding:** chore try use an obs record ([1a93644](https://github.com/aurelia/aurelia/commit/1a93644))
* **bindings:** use ??= instead ([830fdf5](https://github.com/aurelia/aurelia/commit/830fdf5))
* **bindings:** optimize task queue update a bit more ([842ab26](https://github.com/aurelia/aurelia/commit/842ab26))
* **prop-accessor:** simplify property accessor ([d19c0aa](https://github.com/aurelia/aurelia/commit/d19c0aa))
* **bindings:** always cache source value in binding ([9d3aad2](https://github.com/aurelia/aurelia/commit/9d3aad2))
* ***:** timing for binding state of controller ([4eb09f7](https://github.com/aurelia/aurelia/commit/4eb09f7))
* **bindable:** let bindable take action based on controller ([a42949f](https://github.com/aurelia/aurelia/commit/a42949f))
* **attr-syntax-transformer:** adapt code review merge, make interpret independent again ([1e09e9c](https://github.com/aurelia/aurelia/commit/1e09e9c))
* **collection:** make lifecycle optionial, more type imports re-org ([9f8b189](https://github.com/aurelia/aurelia/commit/9f8b189))
* **runtime-html:** remove unnecessary flag requirements ([86e8e9e](https://github.com/aurelia/aurelia/commit/86e8e9e))
* **obs:** don't use Proxy on platform ([f7882e0](https://github.com/aurelia/aurelia/commit/f7882e0))
* **dom:** allow parent-less nodes to be converted to render locations ([68aef8f](https://github.com/aurelia/aurelia/commit/68aef8f))
* **computed-observer:** correctly call subscribers when set ([8497f38](https://github.com/aurelia/aurelia/commit/8497f38))
* **dom:** give INode, IEventTarget and IRenderLocation overrideable generic types ([e2ac8b2](https://github.com/aurelia/aurelia/commit/e2ac8b2))
* ***:** remove persistent flags ([ffba588](https://github.com/aurelia/aurelia/commit/ffba588))
* **all:** add .js extensions for native esm compat ([0308e2e](https://github.com/aurelia/aurelia/commit/0308e2e))
* **el-observation:** allow different observer ctor config ([161b544](https://github.com/aurelia/aurelia/commit/161b544))
* **node-observation:** move interface to runtime-html ([42626f8](https://github.com/aurelia/aurelia/commit/42626f8))
* **validation:** merge evaluate & connect, more efficient handling of classes ([7803dc6](https://github.com/aurelia/aurelia/commit/7803dc6))
* ***:** use readonly from config ([b88e102](https://github.com/aurelia/aurelia/commit/b88e102))
* ***:** better lookup for el obs loc ([9c5197c](https://github.com/aurelia/aurelia/commit/9c5197c))
* **observation:** simplified el observers/accessors more ([e818e2f](https://github.com/aurelia/aurelia/commit/e818e2f))
* **node-observation:** merge target observer/accessor, ([2c318ee](https://github.com/aurelia/aurelia/commit/2c318ee))
* **accessors:** no cache in accessors ([2640c38](https://github.com/aurelia/aurelia/commit/2640c38))
* **checked-observer:** make non-layout ([b75d6a8](https://github.com/aurelia/aurelia/commit/b75d6a8))
* **accessors:** more static accessors ([6d83921](https://github.com/aurelia/aurelia/commit/6d83921))
* **prop/attr-bindings:** always call update ([3fd75c8](https://github.com/aurelia/aurelia/commit/3fd75c8))
* **select-observer:** remove flags & task props ([0622450](https://github.com/aurelia/aurelia/commit/0622450))
* **select-observer:** remove dedundant handler/methods, add more mutation test ([28c5fe2](https://github.com/aurelia/aurelia/commit/28c5fe2))
* **all:** rename noTargetQueue flag, remove infrequent mutationtc ([edfd2a4](https://github.com/aurelia/aurelia/commit/edfd2a4))
* **obervers:** remove task property of IAccessor ([affd9d1](https://github.com/aurelia/aurelia/commit/affd9d1))
* **controller:** remove bindingContext property ([3cb6a32](https://github.com/aurelia/aurelia/commit/3cb6a32))
* **styles:** move style related stuff to single file ([80a6381](https://github.com/aurelia/aurelia/commit/80a6381))
* **lifecycle:** move types to controller file ([93fdb7e](https://github.com/aurelia/aurelia/commit/93fdb7e))
* **controller:** remove projector abstraction & rework attaching ([d69d03d](https://github.com/aurelia/aurelia/commit/d69d03d))
* **projector:** inline take() ([189064a](https://github.com/aurelia/aurelia/commit/189064a))
* **projector-locator:** merge into controller ([2577af5](https://github.com/aurelia/aurelia/commit/2577af5))
* **instructions:** move instructions to renderer file ([3b71a44](https://github.com/aurelia/aurelia/commit/3b71a44))
* **instructions:** merge listener instructions into one class ([5ef5e2e](https://github.com/aurelia/aurelia/commit/5ef5e2e))
* **instructions:** declare instr type as getters ([97c5900](https://github.com/aurelia/aurelia/commit/97c5900))
* **all:** remove binding strategy export ([cd258cd](https://github.com/aurelia/aurelia/commit/cd258cd))
* **all:** remove strategy configuration ([0ae57c0](https://github.com/aurelia/aurelia/commit/0ae57c0))
* **instructions:** merge to-view, two-way, from-view and one-time ([4a12c1d](https://github.com/aurelia/aurelia/commit/4a12c1d))
* **resource-model:** merge with semantic-model file ([c497c16](https://github.com/aurelia/aurelia/commit/c497c16))
* ***:** remove references to proxy strategy & proxy observer ([b1dfe93](https://github.com/aurelia/aurelia/commit/b1dfe93))
* **attribute-pattern:** merge the two files ([437d5e4](https://github.com/aurelia/aurelia/commit/437d5e4))
* **binding-command:** move to resources folder ([f9d20de](https://github.com/aurelia/aurelia/commit/f9d20de))
* **attribute-pattern:** move to resources folder ([df52acf](https://github.com/aurelia/aurelia/commit/df52acf))
* **templating:** remove hooks from CE definition ([dcd2762](https://github.com/aurelia/aurelia/commit/dcd2762))
* **render-context:** rename compose to render ([f839165](https://github.com/aurelia/aurelia/commit/f839165))
* **templating:** remove ResourceModel ([e4f2042](https://github.com/aurelia/aurelia/commit/e4f2042))
* **all:** rename beforeUnbind to unbinding ([17a82ed](https://github.com/aurelia/aurelia/commit/17a82ed))
* **all:** rename beforeDetach to detaching ([0fcb64d](https://github.com/aurelia/aurelia/commit/0fcb64d))
* **all:** rename afterAttach to attaching ([0178027](https://github.com/aurelia/aurelia/commit/0178027))
* **all:** rename afterAttachChildren to attached ([9e6e97e](https://github.com/aurelia/aurelia/commit/9e6e97e))
* **all:** rename afterBind to bound ([696f5d4](https://github.com/aurelia/aurelia/commit/696f5d4))
* **all:** rename beforeBind to binding ([67b1c5d](https://github.com/aurelia/aurelia/commit/67b1c5d))
* **runtime-html:** rename InstructionComposer to Renderer and remove Composer abstraction ([6499d31](https://github.com/aurelia/aurelia/commit/6499d31))
* **all:** rename CompositionContext back to RenderContext again ([1d7673b](https://github.com/aurelia/aurelia/commit/1d7673b))
* **controller:** rename compileChildren to hydrateChildren ([4b6fddb](https://github.com/aurelia/aurelia/commit/4b6fddb))
* **controller:** rename compile to hydrate ([868d125](https://github.com/aurelia/aurelia/commit/868d125))
* **controller:** rename afterCompose to created ([02e9412](https://github.com/aurelia/aurelia/commit/02e9412))
* **controller:** rename beforeComposeChildren to hydrated ([041a2ff](https://github.com/aurelia/aurelia/commit/041a2ff))
* **controller:** rename beforeCompose to hydrating ([64b405e](https://github.com/aurelia/aurelia/commit/64b405e))
* **all:** remove afterUnbind and afterUnbindChildren, and make deactivate bottom-up ([a431fdc](https://github.com/aurelia/aurelia/commit/a431fdc))
* **controller:** simplify activate/deactivate ([b839126](https://github.com/aurelia/aurelia/commit/b839126))
* **controller:** peel out cancellation for now ([bbf6c92](https://github.com/aurelia/aurelia/commit/bbf6c92))
* **controller:** remove cancel api for now ([367f6c3](https://github.com/aurelia/aurelia/commit/367f6c3))
* **all:** simplify update flags ([5c2cc3a](https://github.com/aurelia/aurelia/commit/5c2cc3a))
* **all:** rename RuntimeHtmlConfiguration to StandardConfiguration ([665f3ba](https://github.com/aurelia/aurelia/commit/665f3ba))
* **all:** move scheduler implementation to platform ([e22285a](https://github.com/aurelia/aurelia/commit/e22285a))
* **scheduler:** remove ITaskQueue interface ([5b7b276](https://github.com/aurelia/aurelia/commit/5b7b276))
* **all:** remove IDOM, HTMLDOM and DOM; replace DOM with PLATFORM ([6447468](https://github.com/aurelia/aurelia/commit/6447468))
* **plugin-svg:** cleanup and move to runtime-html as a registration ([55a3938](https://github.com/aurelia/aurelia/commit/55a3938))
* **all:** move html-specific stuff from runtime to runtime-html and remove Node generics ([c745963](https://github.com/aurelia/aurelia/commit/c745963))
* **all:** remove PLATFORM global ([fdef656](https://github.com/aurelia/aurelia/commit/fdef656))
* **dom:** remove setAttribute ([5cd8905](https://github.com/aurelia/aurelia/commit/5cd8905))
* **dom:** remove removeEventListener ([1179737](https://github.com/aurelia/aurelia/commit/1179737))
* **dom:** remove addEventListener ([706a833](https://github.com/aurelia/aurelia/commit/706a833))
* **event-manager:** rename EventManager to EventDelegator ([9150bb4](https://github.com/aurelia/aurelia/commit/9150bb4))
* **listener-tracker:** subscribe with EventListenerObject instead ([e100eb4](https://github.com/aurelia/aurelia/commit/e100eb4))
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
* **all:** cut back on the dispose calls ([9fec528](https://github.com/aurelia/aurelia/commit/9fec528))
* **all:** simplify Aurelia#start/stop & AppTask#run, returning promise instead of task ([6c7608d](https://github.com/aurelia/aurelia/commit/6c7608d))
* **observer-locator:** improve the flow / work out a few quirks ([cc042b4](https://github.com/aurelia/aurelia/commit/cc042b4))
* **scope:** remove IScope interface and use import type where possible for Scope ([6b8eb5f](https://github.com/aurelia/aurelia/commit/6b8eb5f))
* **focus:** only focus blur when *really* needed ([e71f36c](https://github.com/aurelia/aurelia/commit/e71f36c))
* ***:** rename multi interpolation to interpolation ([d1c2202](https://github.com/aurelia/aurelia/commit/d1c2202))
* **all:** remove reporter ([425fe96](https://github.com/aurelia/aurelia/commit/425fe96))
* **interpolation:** remove interpolation binding reference, tweak html interpolation ([f3a8952](https://github.com/aurelia/aurelia/commit/f3a8952))
* ***:** removed linktype in favor of link cb ([5af8498](https://github.com/aurelia/aurelia/commit/5af8498))
* **runtime-html:** ensure .evaluate() is called with null ([8dc3b88](https://github.com/aurelia/aurelia/commit/8dc3b88))
* **start-task:** rename StartTask to AppTask ([b52fc9c](https://github.com/aurelia/aurelia/commit/b52fc9c))
* **all:** remove AST interfaces ([7e04d83](https://github.com/aurelia/aurelia/commit/7e04d83))
* **all:** merge jit-html into runtime-html and remove jit-html-* packages ([f530bcf](https://github.com/aurelia/aurelia/commit/f530bcf))
* **runtime:** cleanup unused flags ([77a930e](https://github.com/aurelia/aurelia/commit/77a930e))
* **runtime:** merge controller api bind+attach into activate, detach+unbind into deactivate, and remove ILifecycleTask usage from controller ([15f3885](https://github.com/aurelia/aurelia/commit/15f3885))
* **lifecycles:** pass down first + parent controller in the 'before' hooks and use that as the queue instead of ILifecycle ([031b7fd](https://github.com/aurelia/aurelia/commit/031b7fd))
* **runtime:** rename 'caching' to 'dispose' and hook cache/dispose logic up to unbind based on isReleased flag ([e346ed4](https://github.com/aurelia/aurelia/commit/e346ed4))
* **controller:** rename 'hold' to 'setLocation' ([eb43d9e](https://github.com/aurelia/aurelia/commit/eb43d9e))
* **all:** remove State enum and use simple booleans instead ([762d3c7](https://github.com/aurelia/aurelia/commit/762d3c7))
* **all:** rename afterDetach to afterDetachChildren ([080a724](https://github.com/aurelia/aurelia/commit/080a724))
* **all:** rename afterAttach to afterAttachChildren ([02b573e](https://github.com/aurelia/aurelia/commit/02b573e))
* **bindings:** always sync, control flush ([01db28d](https://github.com/aurelia/aurelia/commit/01db28d))
* **html-observers:** controllable flush ([f0ec574](https://github.com/aurelia/aurelia/commit/f0ec574))
* **html-observers:** keep tasks ([78e01f4](https://github.com/aurelia/aurelia/commit/78e01f4))
* **html-observers:** remove unused code/commented code ([ae111f3](https://github.com/aurelia/aurelia/commit/ae111f3))
* **bindings:** queue with preempt in handle change ([24350ce](https://github.com/aurelia/aurelia/commit/24350ce))
* ***:** more tests flush revert, linting issues ([f3fdfc9](https://github.com/aurelia/aurelia/commit/f3fdfc9))
* **bindings:** treat changes during bind differently ([cf65629](https://github.com/aurelia/aurelia/commit/cf65629))
* **html-observers:** initialize values in bind ([83aeff3](https://github.com/aurelia/aurelia/commit/83aeff3))
* **bindings:** no queue during bind ([2a7a0a0](https://github.com/aurelia/aurelia/commit/2a7a0a0))
* **html-observers:** move task check top in setValue ([455ee23](https://github.com/aurelia/aurelia/commit/455ee23))
* **bindings:** seprate flow entirely for layout accessors ([3915230](https://github.com/aurelia/aurelia/commit/3915230))
* **html-observers:** handle task inside setValue ([2ac796d](https://github.com/aurelia/aurelia/commit/2ac796d))
* **html-observers:** add todo for unsafe cache ([8cd7c68](https://github.com/aurelia/aurelia/commit/8cd7c68))
* **style-attr-accessor.ts:** no read during bind ([1be26f5](https://github.com/aurelia/aurelia/commit/1be26f5))
* **observers:** rename ObserverType to AccessorType ([5f8d0e1](https://github.com/aurelia/aurelia/commit/5f8d0e1))
* ***:** host scope & AST ([9067a2c](https://github.com/aurelia/aurelia/commit/9067a2c))
* ***:** facilitated host enhancement directly ([ad8c53c](https://github.com/aurelia/aurelia/commit/ad8c53c))

<a name="0.7.0"></a>
# 0.7.0 (2020-05-08)

### Features:

* ***:** support binding for Set/Map for CheckedObserver ([7b0dc48](https://github.com/aurelia/aurelia/commit/7b0dc48))
* **array-index-observer:** add select/checkbox tests ([4237825](https://github.com/aurelia/aurelia/commit/4237825))


### Bug Fixes:

* **listener:** fix listener binding to work with interceptors (e.g. debounce) ([4dedf7e](https://github.com/aurelia/aurelia/commit/4dedf7e))
* ***:** create local RepeatableCollection type ([c462a6d](https://github.com/aurelia/aurelia/commit/c462a6d))
* ***:** remove down level iteration config in tsconfig ([c9e5fce](https://github.com/aurelia/aurelia/commit/c9e5fce))
* **shadow-dom-registry:** improve monomorphism by caching via weakmap ([1634cdd](https://github.com/aurelia/aurelia/commit/1634cdd))
* **shadow-dom-registry:** change find to some for efficient any check ([dff6280](https://github.com/aurelia/aurelia/commit/dff6280))


### Refactorings:

* ***:** rename alias to aliasto for readability and consistency ([f3904fe](https://github.com/aurelia/aurelia/commit/f3904fe))
* ***:** use to string to check for array/set/map for checkedobserver ([f246c0f](https://github.com/aurelia/aurelia/commit/f246c0f))
* ***:** use lifecycle instead of observer locator for collection observation in CheckedObserver ([147bec2](https://github.com/aurelia/aurelia/commit/147bec2))
* **shadow-dom-registry:** make explicit factory classes ([a9771ad](https://github.com/aurelia/aurelia/commit/a9771ad))
* **styles:** a more explicit api for shadow styles and css modules ([3b1f978](https://github.com/aurelia/aurelia/commit/3b1f978))

<a name="0.6.0"></a>
# 0.6.0 (2019-12-18)

### Bug Fixes:

* **compose:** use $controller instead of injected controller ([d8c2878](https://github.com/aurelia/aurelia/commit/d8c2878))
* **dom:** clone fragment before creating nodes ([bf595b1](https://github.com/aurelia/aurelia/commit/bf595b1))


### Refactorings:

* **all:** refine+document controller interfaces and fix types/tests ([0a77fbd](https://github.com/aurelia/aurelia/commit/0a77fbd))
* **controller:** split up IController into several specialized interfaces + various small bugfixes ([05d8a8d](https://github.com/aurelia/aurelia/commit/05d8a8d))
* **dom:** add null-object NodeSequence back in ([c9244ad](https://github.com/aurelia/aurelia/commit/c9244ad))
* **runtime-html:** fix types / api calls ([3d42dc2](https://github.com/aurelia/aurelia/commit/3d42dc2))
* **html-renderer:** synchronize with renderer refactor ([4219e02](https://github.com/aurelia/aurelia/commit/4219e02))
* **binding-behavior:** integrate interceptors with renderer ([580b76e](https://github.com/aurelia/aurelia/commit/580b76e))
* **runtime:** make binding behaviors transient and formalize interceptor api ([facbe47](https://github.com/aurelia/aurelia/commit/facbe47))
* **runtime:** rename CustomElementBoilerplate back to RenderContext ([a844ccc](https://github.com/aurelia/aurelia/commit/a844ccc))
* **runtime:** factor out rendering engine + context + compiled template, introduce ce boilerplate, fix create-element etc ([a3cc2ad](https://github.com/aurelia/aurelia/commit/a3cc2ad))
* **runtime:** simplify render process / prepare for removing CompiledTemplate layer ([6f47ee8](https://github.com/aurelia/aurelia/commit/6f47ee8))
* **runtime:** rename 'detached' to 'afterDetach' ([d1e2b0c](https://github.com/aurelia/aurelia/commit/d1e2b0c))
* **runtime:** rename 'attached' to 'afterAttach' ([6ae7be1](https://github.com/aurelia/aurelia/commit/6ae7be1))
* **runtime:** rename 'detaching' to 'beforeDetach' ([9f8b858](https://github.com/aurelia/aurelia/commit/9f8b858))
* **runtime:** rename 'unbinding' to 'beforeUnbind' ([79cd5fa](https://github.com/aurelia/aurelia/commit/79cd5fa))
* **runtime:** rename 'attaching' to 'beforeAttach' ([4685bb1](https://github.com/aurelia/aurelia/commit/4685bb1))
* **runtime:** rename 'binding' to 'beforeBind' ([45b2e91](https://github.com/aurelia/aurelia/commit/45b2e91))

<a name="0.5.0"></a>
# 0.5.0 (2019-11-15)

### Features:

* **dom:** add setEffectiveParentNode for portal-like components ([5f40cd5](https://github.com/aurelia/aurelia/commit/5f40cd5))
* **dom:** let the getEffectiveParentNode api also traverse out of shadow roots ([325601b](https://github.com/aurelia/aurelia/commit/325601b))
* **dom:** add getEffectiveParentNode api for containerless support ([77a04e0](https://github.com/aurelia/aurelia/commit/77a04e0))


### Bug Fixes:

* **getEffectiveParentNode:** skip over sibling containerless elements above the node ([6a6dd76](https://github.com/aurelia/aurelia/commit/6a6dd76))
* **runtime-html:** do not use DOM types in constructor args ([4505abd](https://github.com/aurelia/aurelia/commit/4505abd))
* **attribute:** do not use DOM type in constructor param ([bc383c1](https://github.com/aurelia/aurelia/commit/bc383c1))
* **runtime-html:** style-attribute-accessor issue ([40db3dc](https://github.com/aurelia/aurelia/commit/40db3dc))
* **runtime-html:** uniform syntax for class CA ([feede3a](https://github.com/aurelia/aurelia/commit/feede3a))
* **renderer:** add fromBinding to setPropertyBinding ([ac1c8ac](https://github.com/aurelia/aurelia/commit/ac1c8ac))


### Refactorings:

* **runtime:** use metadata api to associate resources with nodes ([f46dacc](https://github.com/aurelia/aurelia/commit/f46dacc))

<a name="0.4.0"></a>
# 0.4.0 (2019-10-26)

### Features:

* **portal:** add portal attribute ([8602dd0](https://github.com/aurelia/aurelia/commit/8602dd0))
* **dom:** add prependTo api to nodesequences ([b958d57](https://github.com/aurelia/aurelia/commit/b958d57))
* **integration:** new tests for text input ([dc87cea](https://github.com/aurelia/aurelia/commit/dc87cea))
* **integration:** test plan for runtime-html ([32c0de5](https://github.com/aurelia/aurelia/commit/32c0de5))
* **runtime-html:** Enhance the style accessor ([57bc7b1](https://github.com/aurelia/aurelia/commit/57bc7b1))
* **blur:** blur attribute ([9e844a8](https://github.com/aurelia/aurelia/commit/9e844a8))
* **styles:** support the new css modules spec ([9b36a8e](https://github.com/aurelia/aurelia/commit/9b36a8e))
* **runtime:** initial runtime support for styles ([6aafcca](https://github.com/aurelia/aurelia/commit/6aafcca))
* **observer:** Add the ability to bind an array of objects and strings to a class perf fix ([80fd26b](https://github.com/aurelia/aurelia/commit/80fd26b))
* **blur:** blur attribute, basic working state ([177684e](https://github.com/aurelia/aurelia/commit/177684e))
* **observer:** Add the ability to bind an array of objects and strings to a class ([5d4ad6e](https://github.com/aurelia/aurelia/commit/5d4ad6e))
* **observer:** Add the ability to bind an array of objects and strings to a class ([75c8418](https://github.com/aurelia/aurelia/commit/75c8418))
* **observer:** Add the ability to bind an array of objects and strings to a class ([e80b279](https://github.com/aurelia/aurelia/commit/e80b279))
* **focus:** add focus attribute ([1972323](https://github.com/aurelia/aurelia/commit/1972323))
* **observer:** Add the ability to bind an object to class ([13bd1d1](https://github.com/aurelia/aurelia/commit/13bd1d1))
* **observer:** Fix up tests and remove redundancy from class accessor ([64294ad](https://github.com/aurelia/aurelia/commit/64294ad))
* **observer:** Add the ability to bind an object to class ([3e7dba7](https://github.com/aurelia/aurelia/commit/3e7dba7))
* **focus:** add focus attribute ([ec6ba76](https://github.com/aurelia/aurelia/commit/ec6ba76))
* **child-observation:** make query pluggable ([81f1a9a](https://github.com/aurelia/aurelia/commit/81f1a9a))
* **runtime:** add lifecycle flag propagating template controllers for perf tweaks ([c28db65](https://github.com/aurelia/aurelia/commit/c28db65))
* **runtime:** add PriorityBindingBehavior ([2d06ef7](https://github.com/aurelia/aurelia/commit/2d06ef7))
* **attr-binding:** add configuration/renderer/instruction/exports ([41cb920](https://github.com/aurelia/aurelia/commit/41cb920))
* **attr-observer:** add attribute observer ([a82d143](https://github.com/aurelia/aurelia/commit/a82d143))
* **attr-binding:** add attribute binding ([fd284a2](https://github.com/aurelia/aurelia/commit/fd284a2))
* **runtime-html:** re-enable svg ([52bf399](https://github.com/aurelia/aurelia/commit/52bf399))
* **runtime:** expose full DOM ([0680c16](https://github.com/aurelia/aurelia/commit/0680c16))
* **runtime-html:** add custom event constructor ([31d4536](https://github.com/aurelia/aurelia/commit/31d4536))
* **runtime:** added exportable dom object ([9419faa](https://github.com/aurelia/aurelia/commit/9419faa))
* **runtime-html:** create event and dispatch methods ([447646e](https://github.com/aurelia/aurelia/commit/447646e))
* **kernel:** add performance profiler ([32c2a66](https://github.com/aurelia/aurelia/commit/32c2a66))
* **event-manager:** make EventManager disposable ([c857547](https://github.com/aurelia/aurelia/commit/c857547))
* **runtime:** make runtime-html fully work in jsdom/nodejs ([e34f9b1](https://github.com/aurelia/aurelia/commit/e34f9b1))
* **runtime-html:** expose individual registrations and configs ([dc12f77](https://github.com/aurelia/aurelia/commit/dc12f77))
* **all:** add friendly names to all interface symbols ([57876db](https://github.com/aurelia/aurelia/commit/57876db))
* **dom-initializer:** allow undefined ISinglePageApp ([add1822](https://github.com/aurelia/aurelia/commit/add1822))
* **runtime-html:** implement DI configurations and expose configuration API ([1d2b457](https://github.com/aurelia/aurelia/commit/1d2b457))
* **runtime-html:** add runtime-html package with html-specific runtime features ([412b01a](https://github.com/aurelia/aurelia/commit/412b01a))


### Bug Fixes:

* **observers:** clear task when done ([6163a89](https://github.com/aurelia/aurelia/commit/6163a89))
* **rendering-engine:** always return a CompiledTemplate even if there is no template ([7042ca8](https://github.com/aurelia/aurelia/commit/7042ca8))
* **portal:** add 2nd param for hold, add tests, export mountstrategy ([d797f9a](https://github.com/aurelia/aurelia/commit/d797f9a))
* **portal:** separate API for hold parent container ([537eb97](https://github.com/aurelia/aurelia/commit/537eb97))
* **create-element:** fix types and refs ([9fd883d](https://github.com/aurelia/aurelia/commit/9fd883d))
* **set-class-inst:** pre-prepare classlist ([292cf5a](https://github.com/aurelia/aurelia/commit/292cf5a))
* **setstyle-inst:** use correct type ([0c468ed](https://github.com/aurelia/aurelia/commit/0c468ed))
* **inst:** add missing exports, instruction for surrogate style attr ([dede01e](https://github.com/aurelia/aurelia/commit/dede01e))
* **runtime-html:** add infra for rendering surrogate class/style attributes ([8d2659a](https://github.com/aurelia/aurelia/commit/8d2659a))
* **tests:** linting issues ([3f85553](https://github.com/aurelia/aurelia/commit/3f85553))
* **styles:** proper local vs. global style resolution ([95791b1](https://github.com/aurelia/aurelia/commit/95791b1))
* **styles:** adjust some types ([dbddd70](https://github.com/aurelia/aurelia/commit/dbddd70))
* **styles:** ensure all styles infrastructure uses the dom abstraction ([2c397ec](https://github.com/aurelia/aurelia/commit/2c397ec))
* **styles:** address two deep scan issues ([4906098](https://github.com/aurelia/aurelia/commit/4906098))
* **styles:** ensure there is always a root shadow dom style ([4e69c3f](https://github.com/aurelia/aurelia/commit/4e69c3f))
* **styles:** only allow css strings w/ shadow dom style element strategy ([6328ba4](https://github.com/aurelia/aurelia/commit/6328ba4))
* **runtime:** export style configuration ([0e47d7c](https://github.com/aurelia/aurelia/commit/0e47d7c))
* **all:** build errors related to children observers ([1658844](https://github.com/aurelia/aurelia/commit/1658844))
* **flags:** only store persistent observer flags ([e597b77](https://github.com/aurelia/aurelia/commit/e597b77))
* **child-observation:** correct shadow projector and children observer ([721d6d8](https://github.com/aurelia/aurelia/commit/721d6d8))
* **event-manager:** fix 'this' scope issue in removeEventListener ([637f7d3](https://github.com/aurelia/aurelia/commit/637f7d3))
* **replaceable:** fix some more edge cases with multi nested elements and template controllers ([b600463](https://github.com/aurelia/aurelia/commit/b600463))
* **replaceable:** make part scopes also work when not immediately bound from the wrapping replaceable ([78803f1](https://github.com/aurelia/aurelia/commit/78803f1))
* **observer-locator:** fix attribute NS accessor and tests ([923c326](https://github.com/aurelia/aurelia/commit/923c326))
* **compose:** fix typo and tests ([a3060e9](https://github.com/aurelia/aurelia/commit/a3060e9))
* **repeat:** correctly reorder nodes, fix several small bugs in node state tracking ([283af76](https://github.com/aurelia/aurelia/commit/283af76))
* **lint:** fix all lint issues ([6b163bd](https://github.com/aurelia/aurelia/commit/6b163bd))
* **class-binding:** targetKey -> propertyKey ([0971d7d](https://github.com/aurelia/aurelia/commit/0971d7d))
* **style-attr-binding:** properly handle rules, add important tests, non happy path tests ([a2b7c62](https://github.com/aurelia/aurelia/commit/a2b7c62))
* **attr-binding-instruction): fro:** string -> string | IsBindingBehavior ([cafc325](https://github.com/aurelia/aurelia/commit/cafc325))
* **value-attribute-observer:** fix two-way binding back propagation ([b53b863](https://github.com/aurelia/aurelia/commit/b53b863))
* **runtime:** fix two-way binding ([d60b952](https://github.com/aurelia/aurelia/commit/d60b952))
* **dom:** add event listener to document instead of body ([c8fa239](https://github.com/aurelia/aurelia/commit/c8fa239))
* **dom:** add delegate/capture listeners to body instead of window by default ([4219d6d](https://github.com/aurelia/aurelia/commit/4219d6d))
* **shadow-dom-projector:** get mutation observer from dom ([97333c2](https://github.com/aurelia/aurelia/commit/97333c2))
* **create-element:** pass null to parentContext ([6581dfb](https://github.com/aurelia/aurelia/commit/6581dfb))
* **host-projector:** also observe children of non-shadowROot ([502ad2f](https://github.com/aurelia/aurelia/commit/502ad2f))
* **shadow-dom-projector:** observe children of the shadowRoot ([443ed52](https://github.com/aurelia/aurelia/commit/443ed52))
* **runtime-html:** export attribute-ns-accessor ([4f08d48](https://github.com/aurelia/aurelia/commit/4f08d48))
* **projectors:** append and return childNodes from the shadowRoot + use correct defaults ([09bb7d7](https://github.com/aurelia/aurelia/commit/09bb7d7))
* **runtime:** add missing renderer registrations ([c301823](https://github.com/aurelia/aurelia/commit/c301823))


### Performance Improvements:

* **all:** remove tracer/profiler from ts source ([cc9c1fc](https://github.com/aurelia/aurelia/commit/cc9c1fc))
* **all): add sideEffect:** false for better tree shaking ([59b5e55](https://github.com/aurelia/aurelia/commit/59b5e55))
* **all:** pre-declare variables used in loops ([16b9c18](https://github.com/aurelia/aurelia/commit/16b9c18))
* **runtime-html:** remove DOM dependency from DOM target accessors ([74b649a](https://github.com/aurelia/aurelia/commit/74b649a))


### Refactorings:

* **blur:** convert from lifecycle to scheduler ([fa65ee7](https://github.com/aurelia/aurelia/commit/fa65ee7))
* **attr:** convert from lifecycle to scheduler ([9c33fbe](https://github.com/aurelia/aurelia/commit/9c33fbe))
* **attribute:** convert from lifecycle to scheduler ([f4ba90b](https://github.com/aurelia/aurelia/commit/f4ba90b))
* **observer-locator:** convert from lifecycle to scheduler ([6cc0160](https://github.com/aurelia/aurelia/commit/6cc0160))
* **value-attribute-observer:** convert from lifecycle to scheduler ([3fdb6ad](https://github.com/aurelia/aurelia/commit/3fdb6ad))
* **style-attribute-accessor:** convert from lifecycle to scheduler ([7313429](https://github.com/aurelia/aurelia/commit/7313429))
* **select-value-observer:** convert from lifecycle to scheduler ([060e872](https://github.com/aurelia/aurelia/commit/060e872))
* **element-property-accessor:** convert from lifecycle to scheduler ([31138f0](https://github.com/aurelia/aurelia/commit/31138f0))
* **data-attribute-accessor:** convert from lifecycle to scheduler ([d2b3202](https://github.com/aurelia/aurelia/commit/d2b3202))
* **class-attribute-observer:** convert from lifecycle to scheduler ([f59d6a4](https://github.com/aurelia/aurelia/commit/f59d6a4))
* **element-attribute-observer:** convert from lifecycle to scheduler ([7135094](https://github.com/aurelia/aurelia/commit/7135094))
* **checked-observer:** convert from lifecycle to scheduler ([3205a68](https://github.com/aurelia/aurelia/commit/3205a68))
* **attribute-ns-accessor:** convert from lifecycle to scheduler ([99b75e1](https://github.com/aurelia/aurelia/commit/99b75e1))
* **dom:** remove AuMarker and TextNodeSequence ([49042ad](https://github.com/aurelia/aurelia/commit/49042ad))
* **compose:** generate anonymous name if no name is provided in the definition ([211d3d9](https://github.com/aurelia/aurelia/commit/211d3d9))
* **all:** enforce 2nd param for hold ([dfda3fe](https://github.com/aurelia/aurelia/commit/dfda3fe))
* **binding-behaviors:** back to decorators ([1047099](https://github.com/aurelia/aurelia/commit/1047099))
* **compose:** update to use metadata etc ([009a96c](https://github.com/aurelia/aurelia/commit/009a96c))
* **all:** update definition refs ([676e86a](https://github.com/aurelia/aurelia/commit/676e86a))
* **html-renderer:** follow general theme ([9af1c64](https://github.com/aurelia/aurelia/commit/9af1c64))
* **inst:** move classlist comp to renderer ([223f907](https://github.com/aurelia/aurelia/commit/223f907))
* **resources): prepend with a:**  ([dd7c238](https://github.com/aurelia/aurelia/commit/dd7c238))
* ***:** drop unused imports ([7755bbf](https://github.com/aurelia/aurelia/commit/7755bbf))
* ***:** un-ignore some ts-ignore ([5e19c62](https://github.com/aurelia/aurelia/commit/5e19c62))
* **all:** rename BasicConfiguration in various packages ([7e330d8](https://github.com/aurelia/aurelia/commit/7e330d8))
* **custom-attrs:** first pass removing dynamic options ([03c5480](https://github.com/aurelia/aurelia/commit/03c5480))
* **blur:** use nodetype enum, remove unnecessary comments ([577f4f2](https://github.com/aurelia/aurelia/commit/577f4f2))
* **blur/focus:** isolated tests in their own host elements ([8111b96](https://github.com/aurelia/aurelia/commit/8111b96))
* **blur:** make contains work across dom boundaries ([3f6b88d](https://github.com/aurelia/aurelia/commit/3f6b88d))
* **blur:** drop wheel by default, remove redundant code ([263afac](https://github.com/aurelia/aurelia/commit/263afac))
* **blur:** avoid doing unnecessary work ([3a1ef25](https://github.com/aurelia/aurelia/commit/3a1ef25))
* **css-modules-registry:** use object spread ([f958ca7](https://github.com/aurelia/aurelia/commit/f958ca7))
* **blur:** use lifecycle to enqueue/dequeue ([27413cd](https://github.com/aurelia/aurelia/commit/27413cd))
* **styles:** rename to make processor clear ([d703dcf](https://github.com/aurelia/aurelia/commit/d703dcf))
* **blur:** remove alien pattern code ([b66d518](https://github.com/aurelia/aurelia/commit/b66d518))
* **styles:** additional renaming for consistency ([77e728b](https://github.com/aurelia/aurelia/commit/77e728b))
* **styles:** better naming ([761b925](https://github.com/aurelia/aurelia/commit/761b925))
* **styles:** rename internal var for clarity ([d8dfd53](https://github.com/aurelia/aurelia/commit/d8dfd53))
* **styles:** enable simpler caching ([4bd58af](https://github.com/aurelia/aurelia/commit/4bd58af))
* **focus:** use param deco, add readonly ([fde14ff](https://github.com/aurelia/aurelia/commit/fde14ff))
* **resources:** shorten resource names ([499634b](https://github.com/aurelia/aurelia/commit/499634b))
* **binding:** rename bindings ([35d4dff](https://github.com/aurelia/aurelia/commit/35d4dff))
* **all): more cleaning up after TS breaking changes:** ( ([c4c3fc7](https://github.com/aurelia/aurelia/commit/c4c3fc7))
* **all:** use nextId for controller and all resources ([e9ed2ac](https://github.com/aurelia/aurelia/commit/e9ed2ac))
* **all:** move isNumeric/camelCase/kebabCase/toArray to separate functions and fix typings ([f746e5b](https://github.com/aurelia/aurelia/commit/f746e5b))
* **observation:** only eager flush with bind flags ([47957d9](https://github.com/aurelia/aurelia/commit/47957d9))
* **observer-locator:** fixup observer ctors ([8a6c133](https://github.com/aurelia/aurelia/commit/8a6c133))
* **attribute:** fix ctor call ([fbf79a9](https://github.com/aurelia/aurelia/commit/fbf79a9))
* **element-attribute-observer:** cleanup and integrate with raf queue ([08f6442](https://github.com/aurelia/aurelia/commit/08f6442))
* **select-value-observer:** cleanup and integrate with raf queue ([5c5850f](https://github.com/aurelia/aurelia/commit/5c5850f))
* **observation:** improve accessor consistency and perf ([1a6fbb6](https://github.com/aurelia/aurelia/commit/1a6fbb6))
* **value-attribute-observer:** cleanup and integrate with raf queue ([bae0045](https://github.com/aurelia/aurelia/commit/bae0045))
* **class-attribute-accessor:** cleanup and integrate with raf queue ([8448681](https://github.com/aurelia/aurelia/commit/8448681))
* **checked-observer:** cleanup and integrate with raf queue ([8ae2fdb](https://github.com/aurelia/aurelia/commit/8ae2fdb))
* **observation:** cleanup the html accessors and integrate with raf queue ([9b8a12d](https://github.com/aurelia/aurelia/commit/9b8a12d))
* **resources:** expose view property ([3168044](https://github.com/aurelia/aurelia/commit/3168044))
* **all:** rename $customElement to $controller ([aacf278](https://github.com/aurelia/aurelia/commit/aacf278))
* **runtime-html:** fix create-element types and remove RuntimeBehavior ([a34a9da](https://github.com/aurelia/aurelia/commit/a34a9da))
* **compose:** integrate compose with tasks / controllers, fix typings ([d86267e](https://github.com/aurelia/aurelia/commit/d86267e))
* **runtime:** add activator class and make the runtime compile again ([b2a707a](https://github.com/aurelia/aurelia/commit/b2a707a))
* **runtime:** encapsulate lifecycle behavior in controller class ([4c12498](https://github.com/aurelia/aurelia/commit/4c12498))
* **all:** break out patch mode for now ([e173d0c](https://github.com/aurelia/aurelia/commit/e173d0c))
* **all:** more loosening up of null/undefined ([6794c30](https://github.com/aurelia/aurelia/commit/6794c30))
* **all:** loosen up null/undefined ([40bc93a](https://github.com/aurelia/aurelia/commit/40bc93a))
* **runtime:** fix binding and observation strict types ([b01d69a](https://github.com/aurelia/aurelia/commit/b01d69a))
* ***:** remove Constructable "hack" and fix exposed typing errors ([c3b6d46](https://github.com/aurelia/aurelia/commit/c3b6d46))
* ***:** use InjectArray ([b35215f](https://github.com/aurelia/aurelia/commit/b35215f))
* **observer-locator:** deduplicate and optimize data attribute accessor detection ([a41578f](https://github.com/aurelia/aurelia/commit/a41578f))
* **all:** split traceInfo.name up in objName and methodName ([2cdc203](https://github.com/aurelia/aurelia/commit/2cdc203))
* **lifecycle-render:** remove arguments that can be resolved from the context ([7eb2b5d](https://github.com/aurelia/aurelia/commit/7eb2b5d))
* **lifecycle:** merge ILifecycleMount and ILifecycleUnmount into IMountableComponent ([5e6db98](https://github.com/aurelia/aurelia/commit/5e6db98))
* **all:** combine bindable and attachable into component ([a10461f](https://github.com/aurelia/aurelia/commit/a10461f))
* **lifecycle:** bind bindings before binding() hook and use binding() hook instead of bound() in repeater ([970b70d](https://github.com/aurelia/aurelia/commit/970b70d))
* **ast:** extract interfaces ([7f16091](https://github.com/aurelia/aurelia/commit/7f16091))
* ***:** make unknown the default for InterfaceSymbol ([0b77ce3](https://github.com/aurelia/aurelia/commit/0b77ce3))
* **all:** prepare lifecycle flags arguments for proxy observation ([1f8bf19](https://github.com/aurelia/aurelia/commit/1f8bf19))
* ***:** fix bantypes in tests ([2d7bad8](https://github.com/aurelia/aurelia/commit/2d7bad8))
* ***:** enable ban-types linting rule and fix violations ([00e61b1](https://github.com/aurelia/aurelia/commit/00e61b1))
* **all:** reorganize all registrations and make them more composable ([6fcce8b](https://github.com/aurelia/aurelia/commit/6fcce8b))
* **all:** expose registrations and registerables in a consistent manner ([ea9e59c](https://github.com/aurelia/aurelia/commit/ea9e59c))
* **runtime-html:** move the dom initializer to runtime-html-browser ([444082e](https://github.com/aurelia/aurelia/commit/444082e))
* ***:** linting fixes ([a9e26ad](https://github.com/aurelia/aurelia/commit/a9e26ad))
* **runtime-html:** explicitly export non-internal stuff ([554efcb](https://github.com/aurelia/aurelia/commit/554efcb))
* **runtime:** explicitly export non-internal items ([1c05730](https://github.com/aurelia/aurelia/commit/1c05730))
* **all:** use Resource.define instead of decorators ([045aa90](https://github.com/aurelia/aurelia/commit/045aa90))
* **all:** replace inject decorators with static inject properties ([9fc37c1](https://github.com/aurelia/aurelia/commit/9fc37c1))
* **jit:** move html-specific logic to new jit-html package ([3372cc8](https://github.com/aurelia/aurelia/commit/3372cc8))
* **runtime:** reduce DOM API surface and dependencies on it ([5512c64](https://github.com/aurelia/aurelia/commit/5512c64))

