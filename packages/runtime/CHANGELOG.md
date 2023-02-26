# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

<a name="2.0.0-beta.2"></a>
# 2.0.0-beta.2 (2023-02-26)

### Features:

* **compat:** add binding engine (#1679) ([a6dd0de](https://github.com/aurelia/aurelia/commit/a6dd0de))


### Bug Fixes:

* ***:** linting errors ([e6010d0](https://github.com/aurelia/aurelia/commit/e6010d0))
* **ast:** correctly resolves access keyed on primitve (#1662) ([0eae2ce](https://github.com/aurelia/aurelia/commit/0eae2ce))

<a name="2.0.0-beta.1"></a>
# 2.0.0-beta.1 (2023-01-12)

### Features:

* ***:** key assignment notify changes (#1601) ([4163dd4](https://github.com/aurelia/aurelia/commit/4163dd4))
* **repeat:** add keyed mode (#1583) ([d0c5706](https://github.com/aurelia/aurelia/commit/d0c5706))
* **compat:** add ast methods to compat package ([8b99581](https://github.com/aurelia/aurelia/commit/8b99581))


### Bug Fixes:

* **array-length-observer:** notify array subscribers ([9ea3d85](https://github.com/aurelia/aurelia/commit/9ea3d85))


### Refactorings:

* ***:** rename scope file ([6adce39](https://github.com/aurelia/aurelia/commit/6adce39))
* ***:** prefix private props on bindings ([d9cfc83](https://github.com/aurelia/aurelia/commit/d9cfc83))
* **event:** remove .delegate, add .delegate to compat package ([d1539a2](https://github.com/aurelia/aurelia/commit/d1539a2))
* **runtime:** cleanup & size opt, rename binding methods (#1582) ([2000e3b](https://github.com/aurelia/aurelia/commit/2000e3b))
* **runtime:** remove interceptor prop from interface ([3074f54](https://github.com/aurelia/aurelia/commit/3074f54))
* **bindings:** create override fn instead of binding interceptor ([5c2ed80](https://github.com/aurelia/aurelia/commit/5c2ed80))
* **all:** error msg code & better bundle size ([d81ec6d](https://github.com/aurelia/aurelia/commit/d81ec6d))
* **ast:** extract evaluate into a seprate fn ([6691f7f](https://github.com/aurelia/aurelia/commit/6691f7f))
* ***:** rename Scope.parentScope -> parent ([937d29e](https://github.com/aurelia/aurelia/commit/937d29e))
* **ast:** extract visit APIs into a fn ([a9d2abb](https://github.com/aurelia/aurelia/commit/a9d2abb))

<a name="2.0.0-alpha.41"></a>
# 2.0.0-alpha.41 (2022-09-22)

### Features:

* **collection-observation:** add ability to batch mutation into a single indexmap ([39b3f82](https://github.com/aurelia/aurelia/commit/39b3f82))


### Bug Fixes:

* ***:** call listener with correct scope, move flush queue to binding ([70d1329](https://github.com/aurelia/aurelia/commit/70d1329))
* **expression-parser:** throw on invalid template continuations in interpolation ([9abab48](https://github.com/aurelia/aurelia/commit/9abab48))
* **ast:** dont observe on sort ([beeba4e](https://github.com/aurelia/aurelia/commit/beeba4e))


### Refactorings:

* ***:** cleanup unnecessary exports in kernel ([045d80d](https://github.com/aurelia/aurelia/commit/045d80d))
* **binding-command:** make expr parser & attr mapper parameters of command build ([0ff9756](https://github.com/aurelia/aurelia/commit/0ff9756))
* **runtime:** simplify expressionkind enum ([0f480e1](https://github.com/aurelia/aurelia/commit/0f480e1))
* **runtime:** make Char local to expr parser only ([3272fb7](https://github.com/aurelia/aurelia/commit/3272fb7))
* **runtime:** move LifecycleFlags to runtime-html ([ef35bc7](https://github.com/aurelia/aurelia/commit/ef35bc7))
* **ast:** observe after eval fn call ([aca7b0f](https://github.com/aurelia/aurelia/commit/aca7b0f))
* **observation:** also pass collection in change handler ([c382e8a](https://github.com/aurelia/aurelia/commit/c382e8a))
* ***:** cleanup context & scope ([e806937](https://github.com/aurelia/aurelia/commit/e806937))
* ***:** remove/reorg interfaces ([925f50d](https://github.com/aurelia/aurelia/commit/925f50d))
* ***:** move subscriber flags to sub record file ([066457a](https://github.com/aurelia/aurelia/commit/066457a))
* ***:** move delegation strategy to runtime-html ([f387b2a](https://github.com/aurelia/aurelia/commit/f387b2a))
* ***:** cleanup iterable AST, reorganise e2e tests (#1562) ([3853f2d](https://github.com/aurelia/aurelia/commit/3853f2d))
* **bindings:** remove flags from bind/unbind (#1560) ([eaaf4bb](https://github.com/aurelia/aurelia/commit/eaaf4bb))
* **ast:** move VC signal to bind (#1558) ([3fffacf](https://github.com/aurelia/aurelia/commit/3fffacf))
* ***:** remove flags from observers (#1557) ([9f9a8fe](https://github.com/aurelia/aurelia/commit/9f9a8fe))
* **binding:** move BindingMode to runtime-html (#1555) ([c75618b](https://github.com/aurelia/aurelia/commit/c75618b))
* **ast:** remove flags from evaluate (#1553) ([dda997b](https://github.com/aurelia/aurelia/commit/dda997b))

<a name="2.0.0-alpha.40"></a>
# 2.0.0-alpha.40 (2022-09-07)

### Features:

* ***:** template expression auto observe array methods ([001fe4c](https://github.com/aurelia/aurelia/commit/001fe4c))
* **template:** support arrow function syntax (#1541) ([499ace7](https://github.com/aurelia/aurelia/commit/499ace7))


### Bug Fixes:

* **binding:** fix regression from nullish coalescing (#1537) ([a96511a](https://github.com/aurelia/aurelia/commit/a96511a))


### Performance Improvements:

* **binding:** inline keyword lookup (decrease bundle size) ([1384dc2](https://github.com/aurelia/aurelia/commit/1384dc2))
* **binding:** make parser state module-scoped ([1384dc2](https://github.com/aurelia/aurelia/commit/1384dc2))


### Refactorings:

* **ast:** remove observe leaf only flag ([8b1c7e1](https://github.com/aurelia/aurelia/commit/8b1c7e1))
* **expression-parser:** cleanup / reduce bundle size (#1539) ([1384dc2](https://github.com/aurelia/aurelia/commit/1384dc2))
* **binding:** fix expression parser keyword lookup issue ([1384dc2](https://github.com/aurelia/aurelia/commit/1384dc2))

<a name="2.0.0-alpha.39"></a>
# 2.0.0-alpha.39 (2022-09-01)

### Features:

* **binding:** optional chaining & nullish coalescing (#1523) ([e33d563](https://github.com/aurelia/aurelia/commit/e33d563))


### Bug Fixes:

* **repeater:** re attaching when using the same array with if (#1511) ([89248cc](https://github.com/aurelia/aurelia/commit/89248cc))
* **repeat:** unsubscribe collection on detaching ([89248cc](https://github.com/aurelia/aurelia/commit/89248cc))
* **e2e:** better e2e test scripts ([855a03f](https://github.com/aurelia/aurelia/commit/855a03f))
* **build:** remove reference directive, use files in tsconfig instead ([855a03f](https://github.com/aurelia/aurelia/commit/855a03f))
* **typings:** make ListenerOptions public ([855a03f](https://github.com/aurelia/aurelia/commit/855a03f))


### Refactorings:

* ***:** clean up instanceof code ([89248cc](https://github.com/aurelia/aurelia/commit/89248cc))

<a name="2.0.0-alpha.38"></a>
# 2.0.0-alpha.38 (2022-08-17)

**Note:** Version bump only for package @aurelia/runtime

<a name="2.0.0-alpha.37"></a>
# 2.0.0-alpha.37 (2022-08-03)

**Note:** Version bump only for package @aurelia/runtime

<a name="2.0.0-alpha.36"></a>
# 2.0.0-alpha.36 (2022-07-25)

**Note:** Version bump only for package @aurelia/runtime

<a name="2.0.0-alpha.35"></a>
# 2.0.0-alpha.35 (2022-06-08)

### Features:

* **ts-jest,babel-jest:** upgrade to jest v28 (#1449) ([b1ec85c](https://github.com/aurelia/aurelia/commit/b1ec85c))

<a name="2.0.0-alpha.34"></a>
# 2.0.0-alpha.34 (2022-06-03)

**Note:** Version bump only for package @aurelia/runtime

<a name="2.0.0-alpha.33"></a>
# 2.0.0-alpha.33 (2022-05-26)

### Bug Fixes:

* **state:** binding behavior observe (#1437) ([b6e1b28](https://github.com/aurelia/aurelia/commit/b6e1b28))
* **array-observer:** don't mutate incoming indexmap (#1429) ([a77a104](https://github.com/aurelia/aurelia/commit/a77a104))

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


### Refactorings:

* ***:** cleanup unused flags ([c4ce901](https://github.com/aurelia/aurelia/commit/c4ce901))
* ***:** add code to DEV err msg, unify error message quote ([b4909fb](https://github.com/aurelia/aurelia/commit/b4909fb))

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

**Note:** Version bump only for package @aurelia/runtime

<a name="2.0.0-alpha.28"></a>
# 2.0.0-alpha.28 (2022-04-16)

**Note:** Version bump only for package @aurelia/runtime

<a name="2.0.0-alpha.27"></a>
# 2.0.0-alpha.27 (2022-04-08)

### Bug Fixes:

* **build:** ensure correct __DEV__ build value replacement (#1377) ([40ce0e3](https://github.com/aurelia/aurelia/commit/40ce0e3))


### Refactorings:

* **all:** removing unnecessary assertions & lintings (#1371) ([05cec15](https://github.com/aurelia/aurelia/commit/05cec15))

<a name="2.0.0-alpha.26"></a>
# 2.0.0-alpha.26 (2022-03-13)

**Note:** Version bump only for package @aurelia/runtime

<a name="2.0.0-alpha.25"></a>
# 2.0.0-alpha.25 (2022-03-08)

**Note:** Version bump only for package @aurelia/runtime

<a name="2.0.0-alpha.24"></a>
# 2.0.0-alpha.24 (2022-01-18)

### Bug Fixes:

* **computed-obs:** fix typo, ensure multiple layers of getter work ([09971a2](https://github.com/aurelia/aurelia/commit/09971a2))

<a name="2.0.0-alpha.23"></a>
# 2.0.0-alpha.23 (2021-11-22)

### Refactorings:

* ***:** disabling type-coercion by default ([e5028c1](https://github.com/aurelia/aurelia/commit/e5028c1))
* ***:** injectable coercion configuration ([b901c4b](https://github.com/aurelia/aurelia/commit/b901c4b))

<a name="2.0.0-alpha.22"></a>
# 2.0.0-alpha.22 (2021-10-24)

### Features:

* ***:** destructure map pair ([961f1a6](https://github.com/aurelia/aurelia/commit/961f1a6))
* ***:** parse destructuring assignment ([c0555de](https://github.com/aurelia/aurelia/commit/c0555de))
* ***:** destructuring assignment expr ([d06f7bd](https://github.com/aurelia/aurelia/commit/d06f7bd))
* ***:** rest expr in destructuring assignment ([f4b1652](https://github.com/aurelia/aurelia/commit/f4b1652))
* **runtime:** started destructuring AST ([0b4d579](https://github.com/aurelia/aurelia/commit/0b4d579))


### Bug Fixes:

* ***:** deepscan issue ([582686b](https://github.com/aurelia/aurelia/commit/582686b))
* **runtime:** correction in expression kinf flag ([f05684f](https://github.com/aurelia/aurelia/commit/f05684f))


### Refactorings:

* **repeat:** destructuring support WIP ([a6257f0](https://github.com/aurelia/aurelia/commit/a6257f0))

<a name="2.0.0-alpha.21"></a>
# 2.0.0-alpha.21 (2021-09-12)

### Refactorings:

* **runtime:** use isType utilities for fn & string ([37a8fd9](https://github.com/aurelia/aurelia/commit/37a8fd9))

<a name="2.0.0-alpha.20"></a>
# 2.0.0-alpha.20 (2021-09-04)

**Note:** Version bump only for package @aurelia/runtime

<a name="2.0.0-alpha.19"></a>
# 2.0.0-alpha.19 (2021-08-29)

### Refactorings:

* **all:** remove more internal typings ([1ffc38b](https://github.com/aurelia/aurelia/commit/1ffc38b))

<a name="2.0.0-alpha.18"></a>
# 2.0.0-alpha.18 (2021-08-22)

**Note:** Version bump only for package @aurelia/runtime

<a name="2.0.0-alpha.17"></a>
# 2.0.0-alpha.17 (2021-08-16)

### Bug Fixes:

* ***:** bug #1253 ([9b98b48](https://github.com/aurelia/aurelia/commit/9b98b48))


### Refactorings:

* **command:** extract CommandType out of ExpressionType ([e24fbed](https://github.com/aurelia/aurelia/commit/e24fbed))
* **all:** rename BindingType -> ExpressionType ([8cf4061](https://github.com/aurelia/aurelia/commit/8cf4061))
* **expr-parser:** simplify BindingType enum ([4c4cbc9](https://github.com/aurelia/aurelia/commit/4c4cbc9))
* **command:** simplify binding type enum ([6651678](https://github.com/aurelia/aurelia/commit/6651678))

<a name="2.0.0-alpha.16"></a>
# 2.0.0-alpha.16 (2021-08-07)

### Performance Improvements:

* **bindings:** simpler observer tracking/clearing ([c867cd1](https://github.com/aurelia/aurelia/commit/c867cd1))


### Refactorings:

* **all:** use a terser name cache for predictable prop mangling ([7649ced](https://github.com/aurelia/aurelia/commit/7649ced))
* **setter-obs:** shorter prop names ([4154147](https://github.com/aurelia/aurelia/commit/4154147))

<a name="2.0.0-alpha.15"></a>
# 2.0.0-alpha.15 (2021-08-01)

**Note:** Version bump only for package @aurelia/runtime

<a name="2.0.0-alpha.14"></a>
# 2.0.0-alpha.14 (2021-07-25)

### Refactorings:

* **runtime-html:** more error coded ([928d75e](https://github.com/aurelia/aurelia/commit/928d75e))
* **runtime:** mark more private properties ([8ecf70b](https://github.com/aurelia/aurelia/commit/8ecf70b))

<a name="2.0.0-alpha.13"></a>
# 2.0.0-alpha.13 (2021-07-19)

### Refactorings:

* **bindings:** rename observeProperty -> observe, add doc ([fed517f](https://github.com/aurelia/aurelia/commit/fed517f))
* **ast:** simplify AST kind enum ([fed517f](https://github.com/aurelia/aurelia/commit/fed517f))
* ***:** avoid creating blocks ([27dcf0b](https://github.com/aurelia/aurelia/commit/27dcf0b))
* **binding-context:** add comment explaning difference in behavior ([f4bcc9f](https://github.com/aurelia/aurelia/commit/f4bcc9f))
* **scope:** remove host scope ([0349810](https://github.com/aurelia/aurelia/commit/0349810))
* **au-slot:** make host exposure a normal, explicit prop ([e2ce36c](https://github.com/aurelia/aurelia/commit/e2ce36c))

<a name="2.0.0-alpha.12"></a>
# 2.0.0-alpha.12 (2021-07-11)

**Note:** Version bump only for package @aurelia/runtime

<a name="2.0.0-alpha.11"></a>
# 2.0.0-alpha.11 (2021-07-11)

### Bug Fixes:

* **call-binding:** assign args to event property, fixes #1231 ([fa4c0d4](https://github.com/aurelia/aurelia/commit/fa4c0d4))


### Performance Improvements:

* **renderer:** don't always call applyBb ([5e2d624](https://github.com/aurelia/aurelia/commit/5e2d624))

<a name="2.0.0-alpha.10"></a>
# 2.0.0-alpha.10 (2021-07-04)

### Bug Fixes:

* **scope:** disable host scope on CE controller ([ac0ff15](https://github.com/aurelia/aurelia/commit/ac0ff15))

<a name="2.0.0-alpha.9"></a>
# 2.0.0-alpha.9 (2021-06-25)

**Note:** Version bump only for package @aurelia/runtime

<a name="2.0.0-alpha.8"></a>
# 2.0.0-alpha.8 (2021-06-22)

**Note:** Version bump only for package @aurelia/runtime

<a name="2.0.0-alpha.7"></a>
# 2.0.0-alpha.7 (2021-06-20)

### Refactorings:

* **scope:** rename isComponentBoundary -> isBoundary ([a3a4281](https://github.com/aurelia/aurelia/commit/a3a4281))

<a name="2.0.0-alpha.6"></a>
# 2.0.0-alpha.6 (2021-06-11)

**Note:** Version bump only for package @aurelia/runtime

<a name="2.0.0-alpha.5"></a>
# 2.0.0-alpha.5 (2021-05-31)

**Note:** Version bump only for package @aurelia/runtime

<a name="2.0.0-alpha.4"></a>
# 2.0.0-alpha.4 (2021-05-25)

**Note:** Version bump only for package @aurelia/runtime

<a name="2.0.0-alpha.3"></a>
# 2.0.0-alpha.3 (2021-05-19)

### Bug Fixes:

* **obs-record:** separate count & slot number ([c824801](https://github.com/aurelia/aurelia/commit/c824801))
* **array-obs:** handle array.find for computed obs, dont cache index obs ([79ba544](https://github.com/aurelia/aurelia/commit/79ba544))
* ***:** #1114 ([eed272e](https://github.com/aurelia/aurelia/commit/eed272e))
* ***:** revert changes in attr-observer, remove unused code in dirty checker ([192a26f](https://github.com/aurelia/aurelia/commit/192a26f))
* **observers:** ensure oldValue is correctly updated in flush,with optz ([07bc335](https://github.com/aurelia/aurelia/commit/07bc335))
* ***:** queue the size observer ([0317bce](https://github.com/aurelia/aurelia/commit/0317bce))


### Refactorings:

* ***:** binding context resolution with bindingmode participation" ([b84813c](https://github.com/aurelia/aurelia/commit/b84813c))
* ***:** binding context resolution with bindingmode participation ([3abe3f6](https://github.com/aurelia/aurelia/commit/3abe3f6))
* **all:** rename currentValue -> value ([6dc943e](https://github.com/aurelia/aurelia/commit/6dc943e))
* **flush-queue:** wrap with finally ([1c14950](https://github.com/aurelia/aurelia/commit/1c14950))
* **observation:** fix linting issues ([e738bc1](https://github.com/aurelia/aurelia/commit/e738bc1))
* **observation:** don't propagate changes with depth first resolution ([235f227](https://github.com/aurelia/aurelia/commit/235f227))

<a name="2.0.0-alpha.2"></a>
# 2.0.0-alpha.2 (2021-03-07)

**Note:** Version bump only for package @aurelia/runtime

<a name="2.0.0-alpha.1"></a>
# 2.0.0-alpha.1 (2021-03-03)

**Note:** Version bump only for package @aurelia/runtime

<a name="2.0.0-alpha.0"></a>
# 2.0.0-alpha.0 (2021-03-02)

### Features:

* ***:** track read on observable & bindable ([011804f](https://github.com/aurelia/aurelia/commit/011804f))
* **effect:** add IEffectRunner & Effect ([4a357c6](https://github.com/aurelia/aurelia/commit/4a357c6))


### Bug Fixes:

* **setter-obs:** dont notify if incoming val is the same ([8bf519a](https://github.com/aurelia/aurelia/commit/8bf519a))


### Refactorings:

* ***:** remove left over unused ids ([97fc845](https://github.com/aurelia/aurelia/commit/97fc845))
* **all:** remove .update flags ([3fc1632](https://github.com/aurelia/aurelia/commit/3fc1632))
* **prop-binding:** remove necessity for id stamping infra ([409d977](https://github.com/aurelia/aurelia/commit/409d977))
* **effect:** rename IEffectRunner -> IObservation r ([de5d272](https://github.com/aurelia/aurelia/commit/de5d272))
* **connectable:** clearer interface for connectable to receive changes ([bec6ed0](https://github.com/aurelia/aurelia/commit/bec6ed0))

<a name="0.9.0"></a>
# 0.9.0 (2021-01-31)

### Features:

* **batch:** update implementation ([ecd4c8f](https://github.com/aurelia/aurelia/commit/ecd4c8f))
* **batch:** clone batches before flushing ([c3659ea](https://github.com/aurelia/aurelia/commit/c3659ea))
* **batch:** basic impl ([0ef7178](https://github.com/aurelia/aurelia/commit/0ef7178))
* **di:** remove DI.createInterface builder ([8146dcc](https://github.com/aurelia/aurelia/commit/8146dcc))


### Bug Fixes:

* **au-slot:** non-strictly-initialized property ([699e7b8](https://github.com/aurelia/aurelia/commit/699e7b8))
* **batch:** ensure nested batch not batched in outer ([ae61005](https://github.com/aurelia/aurelia/commit/ae61005))
* ***:** ensure bindable & observable behavior match v1 ([200ac40](https://github.com/aurelia/aurelia/commit/200ac40))
* ***:** use sub count from record only ([e9f578e](https://github.com/aurelia/aurelia/commit/e9f578e))
* **computed-observer:** ensure getter invoked efficiently ([8b2bcf9](https://github.com/aurelia/aurelia/commit/8b2bcf9))
* **tests:** correct validation controller tests ([2849c99](https://github.com/aurelia/aurelia/commit/2849c99))


### Refactorings:

* **all:** rename macroTaskQueue to taskQueue ([87c073d](https://github.com/aurelia/aurelia/commit/87c073d))
* **connectable:** merge observer record & collection observer record ([f2c1501](https://github.com/aurelia/aurelia/commit/f2c1501))
* **all:** rename interfaces, simplify subscriber collection ([1c37183](https://github.com/aurelia/aurelia/commit/1c37183))
* ***:** remove ILifecycle export ([7ed7c6b](https://github.com/aurelia/aurelia/commit/7ed7c6b))
* **all:** remove ILifecycle ([d141d8e](https://github.com/aurelia/aurelia/commit/d141d8e))
* **collection:** remove lifecycle from collection ([a0fc5fb](https://github.com/aurelia/aurelia/commit/a0fc5fb))
* **array-obs:** remove ILifecycle from array-obs ([da92d9f](https://github.com/aurelia/aurelia/commit/da92d9f))
* ***:** simplify subscriber collection deco invocation ([a3547d5](https://github.com/aurelia/aurelia/commit/a3547d5))
* ***:** use the same utility in runtime ([7340905](https://github.com/aurelia/aurelia/commit/7340905))
* **observation:** minor cleanup, tweak accessor type ([2756ece](https://github.com/aurelia/aurelia/commit/2756ece))
* **connectable:** more cryptic, less generic name ([0f303cb](https://github.com/aurelia/aurelia/commit/0f303cb))
* **subscribers:** use a separate record for managing subscribers ([9f9152d](https://github.com/aurelia/aurelia/commit/9f9152d))
* ***:** use private static, tweak comments, simplify vs ast code ([98d33b4](https://github.com/aurelia/aurelia/commit/98d33b4))
* **connectable:** make record/cRecord first class, remove other methods ([d0cb810](https://github.com/aurelia/aurelia/commit/d0cb810))
* **runtime:** simplify generated code ([7a8f876](https://github.com/aurelia/aurelia/commit/7a8f876))
* **watch:** move to runtime-html ([1250402](https://github.com/aurelia/aurelia/commit/1250402))
* **runtime:** move binding implementations to runtime-html ([8d9a177](https://github.com/aurelia/aurelia/commit/8d9a177))
* **connectable:** make observe coll part of IConnectable, updat watchers ([3df866c](https://github.com/aurelia/aurelia/commit/3df866c))
* ***:** remove IPropertyChangeTracker interface ([d9ba9a4](https://github.com/aurelia/aurelia/commit/d9ba9a4))
* **obs:** remove IPropertyObserver ([d29bc28](https://github.com/aurelia/aurelia/commit/d29bc28))
* **all:** remove IBindingTargetAccessor & IBindingTargetObserver interfaces ([d9c27c6](https://github.com/aurelia/aurelia/commit/d9c27c6))
* **subscribers:** shorter internal prop names, add some more comments ([1c6cb2d](https://github.com/aurelia/aurelia/commit/1c6cb2d))
* **el-accessor:** merge size & length observersremove task reuse ([3af2d9f](https://github.com/aurelia/aurelia/commit/3af2d9f))
* **observer:** ensure length subscription adds array subscription, add tests ([64182ae](https://github.com/aurelia/aurelia/commit/64182ae))
* **obs:** clean up bind from observer, ([3006d3b](https://github.com/aurelia/aurelia/commit/3006d3b))

<a name="0.8.0"></a>
# 0.8.0 (2020-11-30)

### Features:

* **computed:** no type check proxy, reorg args order ([6f3d36f](https://github.com/aurelia/aurelia/commit/6f3d36f))
* **array:** handle sort, better perf for checking obj type ([e2f6a4e](https://github.com/aurelia/aurelia/commit/e2f6a4e))
* **proxy:** ensure not wrapping built in class with special slots ([52d2e39](https://github.com/aurelia/aurelia/commit/52d2e39))
* **watch:** export switcher, add basic tests ([3d9ae50](https://github.com/aurelia/aurelia/commit/3d9ae50))
* ***:** allow configurable dirty check for el observation ([5636608](https://github.com/aurelia/aurelia/commit/5636608))
* **watch:** add more coverage, correct array[Symbol.iterator] values ([eb94e63](https://github.com/aurelia/aurelia/commit/eb94e63))
* **watch:** add handler for reverse, add tests for mutation methods ([d51fa9b](https://github.com/aurelia/aurelia/commit/d51fa9b))
* **watch:** add [].includes/.every() ([bf8624e](https://github.com/aurelia/aurelia/commit/bf8624e))
* **watch:** ability to disable proxy ([701b8ac](https://github.com/aurelia/aurelia/commit/701b8ac))
* **proxy-obs:** export proxy obs, @watch ([5444309](https://github.com/aurelia/aurelia/commit/5444309))
* **watch:** handle collection delete ([3a8c670](https://github.com/aurelia/aurelia/commit/3a8c670))
* **ast:** allow accessscope to have PropertyKey as name ([526456e](https://github.com/aurelia/aurelia/commit/526456e))
* **watch:** wrap before invoke in computed watcher, ([ff2abc7](https://github.com/aurelia/aurelia/commit/ff2abc7))
* **watch:** refactor proxy observation, use watcher ([7c2cdc0](https://github.com/aurelia/aurelia/commit/7c2cdc0))
* **watch:** implement computed & expression watchers ([6a0a265](https://github.com/aurelia/aurelia/commit/6a0a265))
* **watch:** enhance IWatcher contract ([8ad136e](https://github.com/aurelia/aurelia/commit/8ad136e))
* **watch:** move things around for more efficient minification ([7fdee3a](https://github.com/aurelia/aurelia/commit/7fdee3a))
* **watch:** prepare for watch definition ([35619ca](https://github.com/aurelia/aurelia/commit/35619ca))
* **ast:** ability to connect in evaluate ([63e7dec](https://github.com/aurelia/aurelia/commit/63e7dec))
* **observable:** ensure works with binding ([c74716f](https://github.com/aurelia/aurelia/commit/c74716f))
* **lifecycle-task:** add beforeDeactivate and afterDeactivate ([79282ad](https://github.com/aurelia/aurelia/commit/79282ad))
* ***:** add dispose() method to Aurelia, CompositionRoot & Container ([39374de](https://github.com/aurelia/aurelia/commit/39374de))
* **setter:** add notifier ([78c04fb](https://github.com/aurelia/aurelia/commit/78c04fb))
* **observable:** add converter, fix linting issues ([9b7492c](https://github.com/aurelia/aurelia/commit/9b7492c))
* **observable:** implement observable decorator ([0ecb9e3](https://github.com/aurelia/aurelia/commit/0ecb9e3))
* **setter-observer:** separate start/stop from subscribe, ([c895f93](https://github.com/aurelia/aurelia/commit/c895f93))
* **runtime:** add cancel api and properly propagate async errors ([3c05ebe](https://github.com/aurelia/aurelia/commit/3c05ebe))
* **runtime:** add dispose flag for disposing controllers asap after unbind ([8a97e61](https://github.com/aurelia/aurelia/commit/8a97e61))
* **runtime:** add beforeCompileChildren startup hook ([d28b9d1](https://github.com/aurelia/aurelia/commit/d28b9d1))
* **runtime:** add component tree visitor infra ([5dd0f67](https://github.com/aurelia/aurelia/commit/5dd0f67))
* **aurelia:** add CompositionRoot resolver ([8c59df0](https://github.com/aurelia/aurelia/commit/8c59df0))
* **runtime:** add support for automatic partial lifecycle cancellation ([ada5ac7](https://github.com/aurelia/aurelia/commit/ada5ac7))
* **runtime:** await promises returned by 'beforeDetach' and 'afterAttach' ([b6bb2e3](https://github.com/aurelia/aurelia/commit/b6bb2e3))
* **runtime:** implement/wireup dispose hook ([1e1819e](https://github.com/aurelia/aurelia/commit/1e1819e))
* **runtime:** add afterDetach hook ([239c7d4](https://github.com/aurelia/aurelia/commit/239c7d4))
* **runtime:** add afterAttach hook ([e3e9167](https://github.com/aurelia/aurelia/commit/e3e9167))
* **runtime:** add afterUnbind hook ([55484f9](https://github.com/aurelia/aurelia/commit/55484f9))
* **runtime:** add afterBind hook ([47ff91f](https://github.com/aurelia/aurelia/commit/47ff91f))
* ***:** first working draft of au-switch ([c665c8e](https://github.com/aurelia/aurelia/commit/c665c8e))
* **observation:** move scheduling to bindings ([6394674](https://github.com/aurelia/aurelia/commit/6394674))
* **obs-type:** add type property to all observers in runtime ([8723299](https://github.com/aurelia/aurelia/commit/8723299))
* **obs-type:** add const enum ObserverType to runtime ([c30a267](https://github.com/aurelia/aurelia/commit/c30a267))
* ***:** enhance API ([976ae0c](https://github.com/aurelia/aurelia/commit/976ae0c))


### Bug Fixes:

* **binding:** add interceptor to binding mediator ([01abd35](https://github.com/aurelia/aurelia/commit/01abd35))
* ***:** tests, remove unused vars ([dfe9e30](https://github.com/aurelia/aurelia/commit/dfe9e30))
* **binding-interceptor:** expand connectable deco ([24de181](https://github.com/aurelia/aurelia/commit/24de181))
* **computed:** throw on set for readonly ([b84030e](https://github.com/aurelia/aurelia/commit/b84030e))
* **tests:** adapt el observation changes ([7ac6f4a](https://github.com/aurelia/aurelia/commit/7ac6f4a))
* **connectable:** correctly change slots ([4542f01](https://github.com/aurelia/aurelia/commit/4542f01))
* ***:** linting issue ([98089f3](https://github.com/aurelia/aurelia/commit/98089f3))
* ***:** binding-context choice ([de50639](https://github.com/aurelia/aurelia/commit/de50639))
* **watcher:** only run when bound ([7d509ff](https://github.com/aurelia/aurelia/commit/7d509ff))
* ***:** failing tests ([310f47a](https://github.com/aurelia/aurelia/commit/310f47a))
* **watch:** observe in .some() too ([e72c0db](https://github.com/aurelia/aurelia/commit/e72c0db))
* **watch:** use peek watcher ([09d6f8b](https://github.com/aurelia/aurelia/commit/09d6f8b))
* **computed:** use a simple boolean to prevent side effects ([af3f791](https://github.com/aurelia/aurelia/commit/af3f791))
* ***:** deepscan issue ([807a866](https://github.com/aurelia/aurelia/commit/807a866))
* **computed-obs:** no eager subscription ([fbcfd08](https://github.com/aurelia/aurelia/commit/fbcfd08))
* **connectable:** ensure default version, set slot count correctly ([3bcde57](https://github.com/aurelia/aurelia/commit/3bcde57))
* **computed:** remove all observers on unbind ([4cb43c5](https://github.com/aurelia/aurelia/commit/4cb43c5))
* **watch:** set collecting on early return too ([86a8c5e](https://github.com/aurelia/aurelia/commit/86a8c5e))
* **watch:** resolve callback properly in watchers ([a44f611](https://github.com/aurelia/aurelia/commit/a44f611))
* ***:** deepscan issues ([813c5bd](https://github.com/aurelia/aurelia/commit/813c5bd))
* **observer-locator:** use instanceof instead of toStringTag for collections ([b95a36c](https://github.com/aurelia/aurelia/commit/b95a36c))
* **interpolation:** align with v1 behavior ([d601e76](https://github.com/aurelia/aurelia/commit/d601e76))
* **interpolation:** triple negative = dizzy ([bdfac9a](https://github.com/aurelia/aurelia/commit/bdfac9a))
* **interpolation:** build string in normal way ([3ad7eba](https://github.com/aurelia/aurelia/commit/3ad7eba))
* **interpolation:** use templateexpression concatenation ([43c46a2](https://github.com/aurelia/aurelia/commit/43c46a2))
* **interpolation:** properly concatenate parts ([e423f46](https://github.com/aurelia/aurelia/commit/e423f46))
* **interpolation:** properly concatenate parts ([72ba4c7](https://github.com/aurelia/aurelia/commit/72ba4c7))
* **debounce-throttle:** clean up floating tasks ([c8e5fd3](https://github.com/aurelia/aurelia/commit/c8e5fd3))
* **runtime:** export ProjectionProvider registration ([0dd58f1](https://github.com/aurelia/aurelia/commit/0dd58f1))
* **runtime:** add missing registration exports ([abe3cc4](https://github.com/aurelia/aurelia/commit/abe3cc4))
* **switch:** disallowed multiple default-case ([e92c316](https://github.com/aurelia/aurelia/commit/e92c316))
* **ast:** properly handle VC signals in evaluate with conncet merge ([e37ea2f](https://github.com/aurelia/aurelia/commit/e37ea2f))
* **ast:** tweak return type ([85f48d4](https://github.com/aurelia/aurelia/commit/85f48d4))
* **let:** ensure re-observe in handleChange ([5ad84fa](https://github.com/aurelia/aurelia/commit/5ad84fa))
* **binding-mode-behavior:** add hostScope param ([c846994](https://github.com/aurelia/aurelia/commit/c846994))
* **signal:** cleanup & fix buggy implementation ([78318db](https://github.com/aurelia/aurelia/commit/78318db))
* **signal:** update host scope, add interface to guard refactoring ([3447702](https://github.com/aurelia/aurelia/commit/3447702))
* **observable:** fix deepscan suggestions ([50e823a](https://github.com/aurelia/aurelia/commit/50e823a))
* **observable:** avoid using Function/Object ([157ad3e](https://github.com/aurelia/aurelia/commit/157ad3e))
* **runtime:** ignore index type for internal lookup ([68dfb78](https://github.com/aurelia/aurelia/commit/68dfb78))
* ***:** i18n integration tests ([44b0ba7](https://github.com/aurelia/aurelia/commit/44b0ba7))
* **binding:** resolve merge issue ([892ff27](https://github.com/aurelia/aurelia/commit/892ff27))
* **children:** add optional CustomElement.for option ([8953900](https://github.com/aurelia/aurelia/commit/8953900))
* **controller:** store CE and CA definitions for more deterministic hydration ([0291e66](https://github.com/aurelia/aurelia/commit/0291e66))
* **controller:** fix deactivate idempotency ([bda1b1c](https://github.com/aurelia/aurelia/commit/bda1b1c))
* **controller:** fix a few cancellation-related slip ups, add more tests ([472d0ae](https://github.com/aurelia/aurelia/commit/472d0ae))
* ***:** failing tests ([95414bd](https://github.com/aurelia/aurelia/commit/95414bd))
* **switch:** view holding and attaching ([4934627](https://github.com/aurelia/aurelia/commit/4934627))
* **switch:** holding view for fall-through ([632334a](https://github.com/aurelia/aurelia/commit/632334a))
* **switch:** failing test + another test ([d2a5fb3](https://github.com/aurelia/aurelia/commit/d2a5fb3))
* **switch:** binding for `case`s ([8f04746](https://github.com/aurelia/aurelia/commit/8f04746))
* **switch:** default-case linking ([2720d8d](https://github.com/aurelia/aurelia/commit/2720d8d))
* ***:** switch-case bind,attach pipeline ([691cef6](https://github.com/aurelia/aurelia/commit/691cef6))
* **interpolation-binding:** cancel existing before queueing new one ([71425b3](https://github.com/aurelia/aurelia/commit/71425b3))
* ***:** linting/deepscan issues ([d9b275b](https://github.com/aurelia/aurelia/commit/d9b275b))
* **interpolation-binding:** no reusable in bind ([8f99603](https://github.com/aurelia/aurelia/commit/8f99603))
* **property-binding:** task.run() -> task.cancel() in unbind ([a18257c](https://github.com/aurelia/aurelia/commit/a18257c))
* **interpolation-binding:** get IScheduler instead of Scheduler ([7b2fc9a](https://github.com/aurelia/aurelia/commit/7b2fc9a))
* **interpolation:** update from interpolation ast ([5bc3dba](https://github.com/aurelia/aurelia/commit/5bc3dba))
* ***:** fix build ([7ae1f1f](https://github.com/aurelia/aurelia/commit/7ae1f1f))
* ***:** ensure runtime build ([3dcc937](https://github.com/aurelia/aurelia/commit/3dcc937))
* ***:** linting issues ([5718999](https://github.com/aurelia/aurelia/commit/5718999))
* ***:** deepscap issues ([e35e20e](https://github.com/aurelia/aurelia/commit/e35e20e))
* **validation:** au-slot integration tests ([12c80ae](https://github.com/aurelia/aurelia/commit/12c80ae))
* **au-slot:** projection plumbing ([dd7f8b4](https://github.com/aurelia/aurelia/commit/dd7f8b4))
* ***:** broken tests ([3a73602](https://github.com/aurelia/aurelia/commit/3a73602))
* **runtime:** broken tests ([1d11be7](https://github.com/aurelia/aurelia/commit/1d11be7))
* ***:** the projection plumbing via scope ([e79194b](https://github.com/aurelia/aurelia/commit/e79194b))
* **au-slot:** corrected compilation ([6235f7f](https://github.com/aurelia/aurelia/commit/6235f7f))
* **au-slot:** plumbing for slot-name ([400bcd9](https://github.com/aurelia/aurelia/commit/400bcd9))
* **au-slot:** projections plumbing ([786fdb5](https://github.com/aurelia/aurelia/commit/786fdb5))
* ***:** ducktype checking for nodelist ([b6d650a](https://github.com/aurelia/aurelia/commit/b6d650a))
* **di:** registerFactory #822 ([4ac6543](https://github.com/aurelia/aurelia/commit/4ac6543))


### Performance Improvements:

* **bindings:** use eval/connect merge ([da4b49d](https://github.com/aurelia/aurelia/commit/da4b49d))
* **ast:** reduce polymorphism in evaluate calls ([489953f](https://github.com/aurelia/aurelia/commit/489953f))
* **ast:** use getters instead of instance properties for $kind ([a488dbd](https://github.com/aurelia/aurelia/commit/a488dbd))


### Refactorings:

* ***:** remove commented code, fix linting issues ([40f73d8](https://github.com/aurelia/aurelia/commit/40f73d8))
* **binding:** adapt changes in runtime for i18n ([f3c174a](https://github.com/aurelia/aurelia/commit/f3c174a))
* **binding:** adapt obs record on attribute binding ([eddb58f](https://github.com/aurelia/aurelia/commit/eddb58f))
* **binding:** chore try use an obs record ([1a93644](https://github.com/aurelia/aurelia/commit/1a93644))
* **bindings:** use ??= instead ([830fdf5](https://github.com/aurelia/aurelia/commit/830fdf5))
* **bindings:** optimize task queue update a bit more ([842ab26](https://github.com/aurelia/aurelia/commit/842ab26))
* **bindings:** always cache source value in binding ([9d3aad2](https://github.com/aurelia/aurelia/commit/9d3aad2))
* ***:** timing for binding state of controller ([4eb09f7](https://github.com/aurelia/aurelia/commit/4eb09f7))
* **bindable:** let bindable take action based on controller ([a42949f](https://github.com/aurelia/aurelia/commit/a42949f))
* **collection:** make lifecycle optionial, more type imports re-org ([9f8b189](https://github.com/aurelia/aurelia/commit/9f8b189))
* **runtime:** remove unnecessary flag requirements ([46a491a](https://github.com/aurelia/aurelia/commit/46a491a))
* **obs:** don't use Proxy on platform ([f7882e0](https://github.com/aurelia/aurelia/commit/f7882e0))
* **obs:** reorg imports, always try get adapter first ([69beda1](https://github.com/aurelia/aurelia/commit/69beda1))
* ***:** separate type import for runtime ([f1fd69f](https://github.com/aurelia/aurelia/commit/f1fd69f))
* **watch-proxy:** use short name for wrap/unwrap ([944c5d9](https://github.com/aurelia/aurelia/commit/944c5d9))
* ***:** change import to import type, cleaning typings ([9854438](https://github.com/aurelia/aurelia/commit/9854438))
* **computed-observer:** correctly call subscribers when set ([8497f38](https://github.com/aurelia/aurelia/commit/8497f38))
* ***:** remove persistent flags ([ffba588](https://github.com/aurelia/aurelia/commit/ffba588))
* ***:** return in try block for watchers ([78032f0](https://github.com/aurelia/aurelia/commit/78032f0))
* **all:** add .js extensions for native esm compat ([0308e2e](https://github.com/aurelia/aurelia/commit/0308e2e))
* **node-observation:** move interface to runtime-html ([42626f8](https://github.com/aurelia/aurelia/commit/42626f8))
* ***:** remove all ast.connect() ([54b4718](https://github.com/aurelia/aurelia/commit/54b4718))
* **validation:** merge evaluate & connect, more efficient handling of classes ([7803dc6](https://github.com/aurelia/aurelia/commit/7803dc6))
* ***:** better lookup for el obs loc ([9c5197c](https://github.com/aurelia/aurelia/commit/9c5197c))
* **observation:** simplified el observers/accessors more ([e818e2f](https://github.com/aurelia/aurelia/commit/e818e2f))
* **node-observation:** merge target observer/accessor, ([2c318ee](https://github.com/aurelia/aurelia/commit/2c318ee))
* **interpolation:** works similar to other bindings ([ad9c2ee](https://github.com/aurelia/aurelia/commit/ad9c2ee))
* **prop/attr-bindings:** always call update ([3fd75c8](https://github.com/aurelia/aurelia/commit/3fd75c8))
* **all:** rename noTargetQueue flag, remove infrequent mutationtc ([edfd2a4](https://github.com/aurelia/aurelia/commit/edfd2a4))
* ***:** post-review changes ([d484bd6](https://github.com/aurelia/aurelia/commit/d484bd6))
* **obervers:** remove task property of IAccessor ([affd9d1](https://github.com/aurelia/aurelia/commit/affd9d1))
* **runtime:** ensure non-enumerable method by decor ([e8e79ff](https://github.com/aurelia/aurelia/commit/e8e79ff))
* **all:** remove binding strategy export ([cd258cd](https://github.com/aurelia/aurelia/commit/cd258cd))
* ***:** remove proxy decorator, cleanup interfaces ([fb05ccf](https://github.com/aurelia/aurelia/commit/fb05ccf))
* ***:** remove references to proxy strategy & proxy observer ([b1dfe93](https://github.com/aurelia/aurelia/commit/b1dfe93))
* **all:** simplify update flags ([5c2cc3a](https://github.com/aurelia/aurelia/commit/5c2cc3a))
* **all:** move scheduler implementation to platform ([e22285a](https://github.com/aurelia/aurelia/commit/e22285a))
* **scheduler:** remove ITaskQueue interface ([5b7b276](https://github.com/aurelia/aurelia/commit/5b7b276))
* **all:** move html-specific stuff from runtime to runtime-html and remove Node generics ([c745963](https://github.com/aurelia/aurelia/commit/c745963))
* **all:** remove debug package ([a1bdb60](https://github.com/aurelia/aurelia/commit/a1bdb60))
* **all:** remove PLATFORM global ([fdef656](https://github.com/aurelia/aurelia/commit/fdef656))
* **watch:** rename observeProperty -> observe, fix linting issues ([32ea361](https://github.com/aurelia/aurelia/commit/32ea361))
* **dom:** remove setAttribute ([5cd8905](https://github.com/aurelia/aurelia/commit/5cd8905))
* **dom:** remove removeEventListener ([1179737](https://github.com/aurelia/aurelia/commit/1179737))
* **dom:** remove addEventListener ([706a833](https://github.com/aurelia/aurelia/commit/706a833))
* ***:** wip fix for the scope traversal issue ([f93da3c](https://github.com/aurelia/aurelia/commit/f93da3c))
* **dom:** remove DOM.createNodeObserver ([2dc0282](https://github.com/aurelia/aurelia/commit/2dc0282))
* **watch:** rename ariables, tweak typings ([675cecb](https://github.com/aurelia/aurelia/commit/675cecb))
* **runtime:** rename afterCompileChildren to afterCompose ([d8d940a](https://github.com/aurelia/aurelia/commit/d8d940a))
* **runtime:** rename afterCompose to beforeComposeChildren ([f65bb7b](https://github.com/aurelia/aurelia/commit/f65bb7b))
* **runtime:** rename beforeCompile to beforeCompose ([570a9ab](https://github.com/aurelia/aurelia/commit/570a9ab))
* **runtime:** rename create to define ([d2d9cba](https://github.com/aurelia/aurelia/commit/d2d9cba))
* **watch:** create watcher at start of  hydration, add tests for expression ([48dd4e9](https://github.com/aurelia/aurelia/commit/48dd4e9))
* **watch:** tweak validation ([4a5f0b1](https://github.com/aurelia/aurelia/commit/4a5f0b1))
* **switch:** registration ([0258041](https://github.com/aurelia/aurelia/commit/0258041))
* **watch:** rename some interfaces ([7c6f442](https://github.com/aurelia/aurelia/commit/7c6f442))
* **watch:** handle array auto obs ([89931da](https://github.com/aurelia/aurelia/commit/89931da))
* **watch:** idempotent bind, unbind, conciser names ([d958ccf](https://github.com/aurelia/aurelia/commit/d958ccf))
* **all:** simplify DOM initialization, remove DOMInitializer ([ff13185](https://github.com/aurelia/aurelia/commit/ff13185))
* **watch:** cast prop key to string in manual AccessScope build ([7e53215](https://github.com/aurelia/aurelia/commit/7e53215))
* **watch:** use conciser names ([5c9b25c](https://github.com/aurelia/aurelia/commit/5c9b25c))
* **runtime:** rename CompositionRoot to AppRoot ([3141a2c](https://github.com/aurelia/aurelia/commit/3141a2c))
* **runtime:** move Aurelia from runtime to runtime-html ([d56c4ca](https://github.com/aurelia/aurelia/commit/d56c4ca))
* **all:** shorten TargetedInstruction to Instruction ([a7e61c6](https://github.com/aurelia/aurelia/commit/a7e61c6))
* **all:** finish renaming render to compose ([ede127b](https://github.com/aurelia/aurelia/commit/ede127b))
* **computed:** resolve callback outside watchers ([a865900](https://github.com/aurelia/aurelia/commit/a865900))
* **all:** rename render to compose ([2d11d9e](https://github.com/aurelia/aurelia/commit/2d11d9e))
* **runtime:** move rendering, binding commands, attr patterns and instructions to runtime-html ([bc010f5](https://github.com/aurelia/aurelia/commit/bc010f5))
* **all:** rename renderer to composer ([c1a0f3c](https://github.com/aurelia/aurelia/commit/c1a0f3c))
* **all:** rename Hydrator to ExpressionHydrator ([71e2e6f](https://github.com/aurelia/aurelia/commit/71e2e6f))
* **interpolation' of http:** //github.com/aurelia/aurelia into feat/watch-decorator ([05e4152](https://github.com/aurelia/aurelia/commit/05e4152))
* **property-accessor:** make PropertyAccessor static again ([39861c4](https://github.com/aurelia/aurelia/commit/39861c4))
* **projection-provider:** use default registration ([ebcae56](https://github.com/aurelia/aurelia/commit/ebcae56))
* **view-locator:** use default registration ([5a49229](https://github.com/aurelia/aurelia/commit/5a49229))
* **expression-parser:** use default registration ([0126a04](https://github.com/aurelia/aurelia/commit/0126a04))
* **renderer:** use default registration ([6ec39ec](https://github.com/aurelia/aurelia/commit/6ec39ec))
* **lifecycle:** use default registration ([77c88a2](https://github.com/aurelia/aurelia/commit/77c88a2))
* **observer-locator:** use default registration ([71ed8e5](https://github.com/aurelia/aurelia/commit/71ed8e5))
* **runtime:** remove ILifecycleTask ([69f5fac](https://github.com/aurelia/aurelia/commit/69f5fac))
* **all:** cut back on the dispose calls ([9fec528](https://github.com/aurelia/aurelia/commit/9fec528))
* **runtime:** properly wireup root controller compilation hooks with apptasks & cleanup ([6a1f32f](https://github.com/aurelia/aurelia/commit/6a1f32f))
* **runtime:** add ICompositionRoot and IAurelia interfaces and pass container+root into controllers ([23477a3](https://github.com/aurelia/aurelia/commit/23477a3))
* **app-task:** use strings instead of enum for slots ([bfff559](https://github.com/aurelia/aurelia/commit/bfff559))
* **all:** simplify Aurelia#start/stop & AppTask#run, returning promise instead of task ([6c7608d](https://github.com/aurelia/aurelia/commit/6c7608d))
* **expr-watcher:** make start/stop private ([bb4ceb8](https://github.com/aurelia/aurelia/commit/bb4ceb8))
* **computed-watcher:** dispose prop & collection observers in change ([d2ab5f4](https://github.com/aurelia/aurelia/commit/d2ab5f4))
* **watcher:** remove impl details from expression watcher interface ([8360876](https://github.com/aurelia/aurelia/commit/8360876))
* **controller:** have context in custom attr hydration too ([a722775](https://github.com/aurelia/aurelia/commit/a722775))
* **watch:** remove old file organisation ([6112fb8](https://github.com/aurelia/aurelia/commit/6112fb8))
* **app-task:** cleanup interfaces and remove unused 'from' api ([5447e87](https://github.com/aurelia/aurelia/commit/5447e87))
* **proxy:** move handlers out of old file, group all ([44a0646](https://github.com/aurelia/aurelia/commit/44a0646))
* **all:** rename StartTask to AppTask ([e76ae41](https://github.com/aurelia/aurelia/commit/e76ae41))
* **runtime:** merge Activator into CompositionRoot and fix beforeCompile hook ([fd7547a](https://github.com/aurelia/aurelia/commit/fd7547a))
* **composition-root:** remove antecedent parameter ([c886c6b](https://github.com/aurelia/aurelia/commit/c886c6b))
* **observer-locator:** improve the flow / work out a few quirks ([cc042b4](https://github.com/aurelia/aurelia/commit/cc042b4))
* **primitive-observer:** cleanup/simplify ([4f4b86c](https://github.com/aurelia/aurelia/commit/4f4b86c))
* **observer-locator:** cleanup/simplify ([4e1db6f](https://github.com/aurelia/aurelia/commit/4e1db6f))
* **scope:** remove IScope interface and use import type where possible for Scope ([6b8eb5f](https://github.com/aurelia/aurelia/commit/6b8eb5f))
* **ast:** shorten param names ([482485d](https://github.com/aurelia/aurelia/commit/482485d))
* **ast:** remove pointless guards and cleanup tests ([fdc9d9f](https://github.com/aurelia/aurelia/commit/fdc9d9f))
* ***:** rename multi interpolation to interpolation ([d1c2202](https://github.com/aurelia/aurelia/commit/d1c2202))
* **all:** remove reporter ([425fe96](https://github.com/aurelia/aurelia/commit/425fe96))
* **interpolation:** remove interpolation binding reference, tweak html interpolation ([f3a8952](https://github.com/aurelia/aurelia/commit/f3a8952))
* **interpolation:** ignore targetObserver in content binding, remove single interpolation bd ([3c6d3c3](https://github.com/aurelia/aurelia/commit/3c6d3c3))
* **interpolation:** always use multi mode ([145eadb](https://github.com/aurelia/aurelia/commit/145eadb))
* **interpolation:** simplify target update ([50e7087](https://github.com/aurelia/aurelia/commit/50e7087))
* ***:** removed linktype in favor of link cb ([5af8498](https://github.com/aurelia/aurelia/commit/5af8498))
* **interpolation:** handle multi/single interpolation differently ([877494f](https://github.com/aurelia/aurelia/commit/877494f))
* **runtime:** ensure .evaluate() is called with null ([4ae4b49](https://github.com/aurelia/aurelia/commit/4ae4b49))
* **ast:** use null instead of ? ([61639be](https://github.com/aurelia/aurelia/commit/61639be))
* **ast:** use optinal chainin ([a6d6da3](https://github.com/aurelia/aurelia/commit/a6d6da3))
* **binding-mode-behavior:** add trace logging ([fc1a45d](https://github.com/aurelia/aurelia/commit/fc1a45d))
* **signaler:** add trace logging ([52519e2](https://github.com/aurelia/aurelia/commit/52519e2))
* **switch:** promise queuing, test correction ([78fd733](https://github.com/aurelia/aurelia/commit/78fd733))
* **observable:** sync naming with bindable ([3e05441](https://github.com/aurelia/aurelia/commit/3e05441))
* **start-task:** rename StartTask to AppTask ([b52fc9c](https://github.com/aurelia/aurelia/commit/b52fc9c))
* **lifecycle-task:** rename afterAttach to afterActivate ([4045977](https://github.com/aurelia/aurelia/commit/4045977))
* **lifecycle-task:** rename beforeBind to beforeActivate ([b363f2f](https://github.com/aurelia/aurelia/commit/b363f2f))
* **lifecycle-task:** rename beforeRender to beforeCompile ([970e68a](https://github.com/aurelia/aurelia/commit/970e68a))
* **observable:** use notifier ([7614d19](https://github.com/aurelia/aurelia/commit/7614d19))
* **ast:** remove unused stuff ([d2ecf5e](https://github.com/aurelia/aurelia/commit/d2ecf5e))
* **all:** remove AST interfaces ([7e04d83](https://github.com/aurelia/aurelia/commit/7e04d83))
* **switch:** partial fix after merging master ([1bc2624](https://github.com/aurelia/aurelia/commit/1bc2624))
* **all:** merge jit into runtime and remove jit package + references ([d7b626b](https://github.com/aurelia/aurelia/commit/d7b626b))
* ***:** remove unused import ([3f66b08](https://github.com/aurelia/aurelia/commit/3f66b08))
* **primitive-observer:** remove variable in scope ([edf854b](https://github.com/aurelia/aurelia/commit/edf854b))
* **jit:** move expression parser to runtime ([709a56a](https://github.com/aurelia/aurelia/commit/709a56a))
* **all:** sync up remaining api changes ([29d6520](https://github.com/aurelia/aurelia/commit/29d6520))
* ***:** template controller link type ([1bd39ef](https://github.com/aurelia/aurelia/commit/1bd39ef))
* **switch:** view de/attach ([1c4cd39](https://github.com/aurelia/aurelia/commit/1c4cd39))
* **switch:** active case change handling ([4830f18](https://github.com/aurelia/aurelia/commit/4830f18))
* **runtime:** cleanup unused flags ([77a930e](https://github.com/aurelia/aurelia/commit/77a930e))
* **runtime:** merge controller api bind+attach into activate, detach+unbind into deactivate, and remove ILifecycleTask usage from controller ([15f3885](https://github.com/aurelia/aurelia/commit/15f3885))
* **lifecycle-task:** remove cancellation ([23af2af](https://github.com/aurelia/aurelia/commit/23af2af))
* **controller:** normalize linkedlist properties ([9420d1e](https://github.com/aurelia/aurelia/commit/9420d1e))
* **lifecycles:** pass down first + parent controller in the 'before' hooks and use that as the queue instead of ILifecycle ([031b7fd](https://github.com/aurelia/aurelia/commit/031b7fd))
* **lifecycle:** simplify afterChildren hooks to singly-linked list ([cc65c09](https://github.com/aurelia/aurelia/commit/cc65c09))
* **controller:** cleanup/simplify unbind lifecycle ([4f33063](https://github.com/aurelia/aurelia/commit/4f33063))
* **controller:** cleanup/simplify bind lifecycle ([1fb6a3f](https://github.com/aurelia/aurelia/commit/1fb6a3f))
* **runtime:** rename 'caching' to 'dispose' and hook cache/dispose logic up to unbind based on isReleased flag ([e346ed4](https://github.com/aurelia/aurelia/commit/e346ed4))
* **controller:** rename 'hold' to 'setLocation' ([eb43d9e](https://github.com/aurelia/aurelia/commit/eb43d9e))
* **all:** remove State enum and use simple booleans instead ([762d3c7](https://github.com/aurelia/aurelia/commit/762d3c7))
* **lifecycle:** cleanup&simplify attach/detach lifecycles, remove mount ([694257b](https://github.com/aurelia/aurelia/commit/694257b))
* **view:** add missing hooks ([13e0b85](https://github.com/aurelia/aurelia/commit/13e0b85))
* **all:** rename afterDetach to afterDetachChildren ([080a724](https://github.com/aurelia/aurelia/commit/080a724))
* **all:** rename afterUnbind to afterUnbindChildren ([09f1972](https://github.com/aurelia/aurelia/commit/09f1972))
* **all:** rename afterAttach to afterAttachChildren ([02b573e](https://github.com/aurelia/aurelia/commit/02b573e))
* **all:** rename afterBind to afterBindChildren ([bf0d79e](https://github.com/aurelia/aurelia/commit/bf0d79e))
* ***:** switch ([94a70a6](https://github.com/aurelia/aurelia/commit/94a70a6))
* **switch:** switch-case controller linking ([ce835e2](https://github.com/aurelia/aurelia/commit/ce835e2))
* **switch:** case change handler ([a4d3872](https://github.com/aurelia/aurelia/commit/a4d3872))
* **switch:** provision for fallthrough ([8210bf8](https://github.com/aurelia/aurelia/commit/8210bf8))
* **switch:** change handler ([80c6eab](https://github.com/aurelia/aurelia/commit/80c6eab))
* **bindings:** always sync, control flush ([01db28d](https://github.com/aurelia/aurelia/commit/01db28d))
* **switch:** converted to TC ([4a1b8e6](https://github.com/aurelia/aurelia/commit/4a1b8e6))
* **html-observers:** remove unused code/commented code ([ae111f3](https://github.com/aurelia/aurelia/commit/ae111f3))
* **bindings:** queue with preempt in handle change ([24350ce](https://github.com/aurelia/aurelia/commit/24350ce))
* **bindings:** treat changes during bind differently ([cf65629](https://github.com/aurelia/aurelia/commit/cf65629))
* **bindings:** no queue during bind ([2a7a0a0](https://github.com/aurelia/aurelia/commit/2a7a0a0))
* **setter-observer:** remove lastupdate ([0c70a1d](https://github.com/aurelia/aurelia/commit/0c70a1d))
* **bindings:** seprate flow entirely for layout accessors ([3915230](https://github.com/aurelia/aurelia/commit/3915230))
* **runtime-observers:** add task to runtime observers ([9d1e795](https://github.com/aurelia/aurelia/commit/9d1e795))
* **observers:** rename ObserverType to AccessorType ([5f8d0e1](https://github.com/aurelia/aurelia/commit/5f8d0e1))
* **au-slot:** stricter binding rule ([eee5c92](https://github.com/aurelia/aurelia/commit/eee5c92))
* ***:** host scope & AST ([9067a2c](https://github.com/aurelia/aurelia/commit/9067a2c))
* ***:** putting projections to scope ([25dcc83](https://github.com/aurelia/aurelia/commit/25dcc83))
* ***:** deregisterResolverFor ([f221eb9](https://github.com/aurelia/aurelia/commit/f221eb9))
* ***:** added hostScope to bindings ([7f42564](https://github.com/aurelia/aurelia/commit/7f42564))
* ***:** $host scope wip ([6990470](https://github.com/aurelia/aurelia/commit/6990470))
* **au-slot:** view factory injection ([70c5dfd](https://github.com/aurelia/aurelia/commit/70c5dfd))
* ***:** part2 of plumbing fallback projection ([a470f9b](https://github.com/aurelia/aurelia/commit/a470f9b))
* ***:** partial plumbing for projections ([f974ec5](https://github.com/aurelia/aurelia/commit/f974ec5))
* ***:** encapsulated enhance in ce-definition ([ffd831e](https://github.com/aurelia/aurelia/commit/ffd831e))
* ***:** facilitated host enhancement directly ([ad8c53c](https://github.com/aurelia/aurelia/commit/ad8c53c))

<a name="0.7.0"></a>
# 0.7.0 (2020-05-08)

### Features:

* **validation:** started deserialization support ([4296f9d](https://github.com/aurelia/aurelia/commit/4296f9d))
* ***:** AST hydration ([92125d6](https://github.com/aurelia/aurelia/commit/92125d6))
* **custom-attr:** add no multi bindings cfg ([4daa950](https://github.com/aurelia/aurelia/commit/4daa950))
* **runtime:** binding mediator ([3f37cb8](https://github.com/aurelia/aurelia/commit/3f37cb8))
* **observation:** observe array index ([a51edc2](https://github.com/aurelia/aurelia/commit/a51edc2))
* **validation:** used new BindingInterceptor ([bb8dff2](https://github.com/aurelia/aurelia/commit/bb8dff2))
* **runtime+html:** binding middleware ([3dc8143](https://github.com/aurelia/aurelia/commit/3dc8143))


### Bug Fixes:

* ***:** don't jitRegister intrinsic types. resolves #840 ([4f5d7e8](https://github.com/aurelia/aurelia/commit/4f5d7e8))
* ***:** validation controller factory fix ([e2e5da4](https://github.com/aurelia/aurelia/commit/e2e5da4))
* ***:** misc issues + cleanup ([c318d91](https://github.com/aurelia/aurelia/commit/c318d91))
* **binding:** fromView update source initial value ([5e23f6c](https://github.com/aurelia/aurelia/commit/5e23f6c))
* ***:** use void 0 instead of undefined ([49322cd](https://github.com/aurelia/aurelia/commit/49322cd))
* **bindable-observer:** ensure initial value is valid ([6255b03](https://github.com/aurelia/aurelia/commit/6255b03))
* **bindable-observer:** reverse set interceptor ([0c98007](https://github.com/aurelia/aurelia/commit/0c98007))
* **array-index-observer:** dont update current value during set value ([6eefd78](https://github.com/aurelia/aurelia/commit/6eefd78))
* **lint:** fix deep scan issues ([601bbfc](https://github.com/aurelia/aurelia/commit/601bbfc))
* **index-observation:** simplify keyed access connect ([57e9607](https://github.com/aurelia/aurelia/commit/57e9607))
* **computed:** always to string ([359706b](https://github.com/aurelia/aurelia/commit/359706b))
* **observer-locator:** compare against null ([7fc39a2](https://github.com/aurelia/aurelia/commit/7fc39a2))
* **computed:** observer collection correctly ([7b2db01](https://github.com/aurelia/aurelia/commit/7b2db01))
* **observer-locator:** use SetterObserver instead of dirty check ([1dc1983](https://github.com/aurelia/aurelia/commit/1dc1983))
* **computed:** flatter stack ([cadb819](https://github.com/aurelia/aurelia/commit/cadb819))
* **controller:** correct the timing of beforeBind hook ([d2e4f59](https://github.com/aurelia/aurelia/commit/d2e4f59))
* **injectable:** prevent renderContext caching ([625348a](https://github.com/aurelia/aurelia/commit/625348a))
* **computed:** dont bind unnecessarily ([b7dbb46](https://github.com/aurelia/aurelia/commit/b7dbb46))
* **observation:** don't eagerly dirty check array prop ([fdfb353](https://github.com/aurelia/aurelia/commit/fdfb353))
* **computed-observer:** better efficiency & works in basic array scenarios ([ad12769](https://github.com/aurelia/aurelia/commit/ad12769))


### Refactorings:

* ***:** rename alias to aliasto for readability and consistency ([f3904fe](https://github.com/aurelia/aurelia/commit/f3904fe))
* **scheduler:** move scheduler to separate package and simplify a few things ([cf33b1a](https://github.com/aurelia/aurelia/commit/cf33b1a))
* ***:** moved ast hydration to debug package ([691a63f](https://github.com/aurelia/aurelia/commit/691a63f))
* **validation:** normalized binding host ([732234b](https://github.com/aurelia/aurelia/commit/732234b))
* **array-index-observer:** behave like native when setting value ([e8fb47e](https://github.com/aurelia/aurelia/commit/e8fb47e))
* ***:** rename isNumeric to isArrayIndex ([2fab646](https://github.com/aurelia/aurelia/commit/2fab646))
* **computed-observer:** compare with 0 using > instead of === ([331aed7](https://github.com/aurelia/aurelia/commit/331aed7))
* **computed:** dont wrap value if function ([e60a2b9](https://github.com/aurelia/aurelia/commit/e60a2b9))
* **runtime:** add controllers, bindings to custom attribute interface ([5378dbc](https://github.com/aurelia/aurelia/commit/5378dbc))

<a name="0.6.0"></a>
# 0.6.0 (2019-12-18)

### Features:

* **controller:** add create/beforeCompile/afterCompile/afterCompileChildren hooks ([3a8c215](https://github.com/aurelia/aurelia/commit/3a8c215))
* **runtime:** add CustomElement.createInjectable api ([c2ea5fc](https://github.com/aurelia/aurelia/commit/c2ea5fc))
* **bindable:** basic working state for set/get ([ae1d87a](https://github.com/aurelia/aurelia/commit/ae1d87a))
* **bindable-observer:** add getter/setter interceptors ([6c22b91](https://github.com/aurelia/aurelia/commit/6c22b91))
* **bindable-observer:** invoke propertyChanged ([1af2ab0](https://github.com/aurelia/aurelia/commit/1af2ab0))


### Bug Fixes:

* **render-context:** do not dispose viewModelProvider due to if.bind etc ([e28f5b2](https://github.com/aurelia/aurelia/commit/e28f5b2))
* **controller:** merge parts ([2e184fd](https://github.com/aurelia/aurelia/commit/2e184fd))
* **repeat:** initialize module-scoped index eagerly to fix reference error ([c8a571f](https://github.com/aurelia/aurelia/commit/c8a571f))
* **customelement.for:** correctly traverse up ([abb6dac](https://github.com/aurelia/aurelia/commit/abb6dac))
* **bindable:** ensure value is intercepted correctly in first delayed subscription ([37c818c](https://github.com/aurelia/aurelia/commit/37c818c))


### Refactorings:

* **all:** refine+document controller interfaces and fix types/tests ([0a77fbd](https://github.com/aurelia/aurelia/commit/0a77fbd))
* **controller:** split up IController into several specialized interfaces + various small bugfixes ([05d8a8d](https://github.com/aurelia/aurelia/commit/05d8a8d))
* **controller:** fixup/improve controller partial interfaces ([571ac18](https://github.com/aurelia/aurelia/commit/571ac18))
* **dom:** add null-object NodeSequence back in ([c9244ad](https://github.com/aurelia/aurelia/commit/c9244ad))
* **runtime:** fix types / api calls ([7bb863a](https://github.com/aurelia/aurelia/commit/7bb863a))
* **renderer:** cleanup/simplify the rendering process and part propagation ([0018838](https://github.com/aurelia/aurelia/commit/0018838))
* **kernel:** remove 'id' and 'path' properties from container ([26120ad](https://github.com/aurelia/aurelia/commit/26120ad))
* **binding-behavior:** integrate interceptors with renderer ([580b76e](https://github.com/aurelia/aurelia/commit/580b76e))
* **throttle:** change to new interceptor api ([f955498](https://github.com/aurelia/aurelia/commit/f955498))
* **debounce:** change to new interceptor api ([e2effc5](https://github.com/aurelia/aurelia/commit/e2effc5))
* **runtime:** make binding behaviors transient and formalize interceptor api ([facbe47](https://github.com/aurelia/aurelia/commit/facbe47))
* **runtime:** rename CustomElementBoilerplate back to RenderContext ([a844ccc](https://github.com/aurelia/aurelia/commit/a844ccc))
* **runtime:** factor out rendering engine + context + compiled template, introduce ce boilerplate, fix create-element etc ([a3cc2ad](https://github.com/aurelia/aurelia/commit/a3cc2ad))
* **runtime:** simplify render process / prepare for removing CompiledTemplate layer ([6f47ee8](https://github.com/aurelia/aurelia/commit/6f47ee8))
* **runtime:** rename 'detached' to 'afterDetach' ([d1e2b0c](https://github.com/aurelia/aurelia/commit/d1e2b0c))
* **runtime:** rename 'attached' to 'afterAttach' ([6ae7be1](https://github.com/aurelia/aurelia/commit/6ae7be1))
* **runtime:** rename 'unbound' to 'afterUnbind' ([35e203c](https://github.com/aurelia/aurelia/commit/35e203c))
* **runtime:** rename 'detaching' to 'beforeDetach' ([9f8b858](https://github.com/aurelia/aurelia/commit/9f8b858))
* **runtime:** rename 'unbinding' to 'beforeUnbind' ([79cd5fa](https://github.com/aurelia/aurelia/commit/79cd5fa))
* **runtime:** rename 'attaching' to 'beforeAttach' ([4685bb1](https://github.com/aurelia/aurelia/commit/4685bb1))
* **runtime:** rename 'bound' to 'afterBind' ([4060bbe](https://github.com/aurelia/aurelia/commit/4060bbe))
* **runtime:** rename 'binding' to 'beforeBind' ([45b2e91](https://github.com/aurelia/aurelia/commit/45b2e91))
* **bindable:** remove getter interceptor ([269d6ff](https://github.com/aurelia/aurelia/commit/269d6ff))
* **bindable-observer:** tweak interfaces ([00bd459](https://github.com/aurelia/aurelia/commit/00bd459))
* **bindable-observer:** use similar mechansm to callback for propertyChanged callback ([a6f3762](https://github.com/aurelia/aurelia/commit/a6f3762))
* **bindable-observer:** rename self-observer -> bindable-observer ([bc0647c](https://github.com/aurelia/aurelia/commit/bc0647c))

<a name="0.5.0"></a>
# 0.5.0 (2019-11-15)

### Features:

* **dom:** add setEffectiveParentNode for portal-like components ([5f40cd5](https://github.com/aurelia/aurelia/commit/5f40cd5))
* **custom-element:** add 'name' and 'searchParents' parameters to CustomElement.for api ([46da0dc](https://github.com/aurelia/aurelia/commit/46da0dc))
* **controller:** add 'is' api for checking if the resource name matches ([47b61a6](https://github.com/aurelia/aurelia/commit/47b61a6))
* **dom:** add getEffectiveParentNode api for containerless support ([77a04e0](https://github.com/aurelia/aurelia/commit/77a04e0))
* **custom-attribute:** add behaviorFor api ([31145e1](https://github.com/aurelia/aurelia/commit/31145e1))


### Bug Fixes:

* **repeat:** unsubscribe from array observer when unbinding ([ebf237d](https://github.com/aurelia/aurelia/commit/ebf237d))
* **runtime:** remove stray semicolon triggering Terser error ([0fabdee](https://github.com/aurelia/aurelia/commit/0fabdee))
* **renderer:** revert to observer.setValue again ([9038263](https://github.com/aurelia/aurelia/commit/9038263))
* **renderer:** set default value instead ([f9d5960](https://github.com/aurelia/aurelia/commit/f9d5960))
* **renderer:** add fromBinding to setPropertyBinding ([ac1c8ac](https://github.com/aurelia/aurelia/commit/ac1c8ac))


### Performance Improvements:

* **collection-observation:** store observers in weakmaps ([c6e0a70](https://github.com/aurelia/aurelia/commit/c6e0a70))
* **collection-observation:** store observers in weakmaps ([26114ea](https://github.com/aurelia/aurelia/commit/26114ea))
* **all:** remove unnecessary Object.freezes ([16b0484](https://github.com/aurelia/aurelia/commit/16b0484))


### Refactorings:

* **ref:** check element name again ([2625040](https://github.com/aurelia/aurelia/commit/2625040))
* **all:** rename behaviorFor to for ([0823dfe](https://github.com/aurelia/aurelia/commit/0823dfe))
* **runtime:** use metadata api to associate resources with nodes ([f46dacc](https://github.com/aurelia/aurelia/commit/f46dacc))
* **custom-element:** retrieve controller from metadata ([2c715f5](https://github.com/aurelia/aurelia/commit/2c715f5))

<a name="0.4.0"></a>
# 0.4.0 (2019-10-26)

### Features:

* **scheduler:** add repeat parameter to yieldAll for dirty checker etc ([9f24306](https://github.com/aurelia/aurelia/commit/9f24306))
* **scheduler:** add yieldAll api ([f39c640](https://github.com/aurelia/aurelia/commit/f39c640))
* **scheduler:** add delta time param ([cf00768](https://github.com/aurelia/aurelia/commit/cf00768))
* **scheduler:** add support for persistent tasks ([f152a4a](https://github.com/aurelia/aurelia/commit/f152a4a))
* **bindable:** add fluent api ([c36108b](https://github.com/aurelia/aurelia/commit/c36108b))
* **dom:** add prependTo api to nodesequences ([b958d57](https://github.com/aurelia/aurelia/commit/b958d57))
* **scheduler:** add shims and initializers ([341dd69](https://github.com/aurelia/aurelia/commit/341dd69))
* **scheduler:** impl initial structure for new scheduler ([66f7e11](https://github.com/aurelia/aurelia/commit/66f7e11))
* **strict-binding:** Allow null/und to be '' ([a44720e](https://github.com/aurelia/aurelia/commit/a44720e))
* **integration:** starting integration tests ([aaefd34](https://github.com/aurelia/aurelia/commit/aaefd34))
* **alias:** Add convention add tests fix conv log ([19399af](https://github.com/aurelia/aurelia/commit/19399af))
* **alias:** Cleanup and tests added ([5cabba3](https://github.com/aurelia/aurelia/commit/5cabba3))
* **alias:** Provide alias functionality ([7dd9764](https://github.com/aurelia/aurelia/commit/7dd9764))
* **ViewLocator:** enable custom view selector functions ([ee6f03f](https://github.com/aurelia/aurelia/commit/ee6f03f))
* **i18n:** core translation service and related auxiliary features ([c3d4a85](https://github.com/aurelia/aurelia/commit/c3d4a85))
* **view-locator:** allow associating views with classes ([9a89686](https://github.com/aurelia/aurelia/commit/9a89686))
* **i18n:** all binding behavior ([f002dd7](https://github.com/aurelia/aurelia/commit/f002dd7))
* **i18n:** support for `t=${key}`, `t=[attr]key` ([5f2fdfd](https://github.com/aurelia/aurelia/commit/5f2fdfd))
* **router:** make lifecycle task add promise when callback returns void ([1877126](https://github.com/aurelia/aurelia/commit/1877126))
* **children:** add and integrate decorator ([ef556b4](https://github.com/aurelia/aurelia/commit/ef556b4))
* **router:** make lifecycle task callback allow void return ([649a911](https://github.com/aurelia/aurelia/commit/649a911))
* **child-observation:** make query pluggable ([81f1a9a](https://github.com/aurelia/aurelia/commit/81f1a9a))
* **child-observation:** hook into runtime process ([f484f84](https://github.com/aurelia/aurelia/commit/f484f84))
* **runtime:** add lifecycle flag propagating template controllers for perf tweaks ([c28db65](https://github.com/aurelia/aurelia/commit/c28db65))
* **runtime:** initial implementation for startup tasks ([e4e1a14](https://github.com/aurelia/aurelia/commit/e4e1a14))
* **runtime:** add parent to $controller ([d00dbc0](https://github.com/aurelia/aurelia/commit/d00dbc0))
* **lifecycle:** add inline method for begin/end pairs ([7e70443](https://github.com/aurelia/aurelia/commit/7e70443))
* **observation:** implement batching ([943c0d7](https://github.com/aurelia/aurelia/commit/943c0d7))
* **runtime:** add PriorityBindingBehavior ([2d06ef7](https://github.com/aurelia/aurelia/commit/2d06ef7))
* **controller:** add getAccessor API (and expose $controller to repeater view) ([f19c669](https://github.com/aurelia/aurelia/commit/f19c669))
* **lifecycle:** implement adaptive timeslicing ([84b8e20](https://github.com/aurelia/aurelia/commit/84b8e20))
* **kernel:** add InstanceProvider to public api ([02b6d16](https://github.com/aurelia/aurelia/commit/02b6d16))
* **aurelia:** make the host element available for injection in the app root ([a696649](https://github.com/aurelia/aurelia/commit/a696649))
* **runtime:** fully implement patch mode ([e37c0f3](https://github.com/aurelia/aurelia/commit/e37c0f3))
* **all:** add tracer argument stringification and improve tracing ([5ccdc42](https://github.com/aurelia/aurelia/commit/5ccdc42))
* **runtime:** expose full DOM ([0680c16](https://github.com/aurelia/aurelia/commit/0680c16))
* **runtime:** initial implementation for patch lifecycle ([209a59a](https://github.com/aurelia/aurelia/commit/209a59a))
* **repeat:** add support for keyed mode ([56dacce](https://github.com/aurelia/aurelia/commit/56dacce))
* **runtime:** added exportable dom object ([9419faa](https://github.com/aurelia/aurelia/commit/9419faa))
* **runtime:** interfaces for create and dispatch event methods ([9967a6c](https://github.com/aurelia/aurelia/commit/9967a6c))
* **di:** autoregister plain class as singleton and add recursion guard ([72f76aa](https://github.com/aurelia/aurelia/commit/72f76aa))
* **observation:** add tracing to observer constructors ([5aead83](https://github.com/aurelia/aurelia/commit/5aead83))
* **binding:** initial implementation for proxy observer ([71db77d](https://github.com/aurelia/aurelia/commit/71db77d))
* **dirty-checker:** expose dirty check settings ([4bd3980](https://github.com/aurelia/aurelia/commit/4bd3980))
* **runtime:** fix+test the computed observer ([3611625](https://github.com/aurelia/aurelia/commit/3611625))
* **kernel:** add performance profiler ([32c2a66](https://github.com/aurelia/aurelia/commit/32c2a66))
* **runtime:** make runtime-html fully work in jsdom/nodejs ([e34f9b1](https://github.com/aurelia/aurelia/commit/e34f9b1))
* **runtime:** expose individual registrations and configs ([b9b4c49](https://github.com/aurelia/aurelia/commit/b9b4c49))
* **all:** add friendly names to all interface symbols ([57876db](https://github.com/aurelia/aurelia/commit/57876db))
* **dom-initializer:** allow undefined ISinglePageApp ([add1822](https://github.com/aurelia/aurelia/commit/add1822))
* **lifecycle:** expose queue processing methods ([2086e4e](https://github.com/aurelia/aurelia/commit/2086e4e))
* **runtime:** expose mixed decorator api's ([cae5959](https://github.com/aurelia/aurelia/commit/cae5959))
* **runtime:** expose RuntimeConfiguration api ([a37a375](https://github.com/aurelia/aurelia/commit/a37a375))
* **aurelia:** implement API to provide a DOM instance to the runtime ([2089dcb](https://github.com/aurelia/aurelia/commit/2089dcb))
* **all:** implement dynamicOptions decorator and convention ([b5893ef](https://github.com/aurelia/aurelia/commit/b5893ef))
* **runtime:** add tracing capabilities to various lifecycle flows ([7018662](https://github.com/aurelia/aurelia/commit/7018662))
* **replaceable:** allow one level of parent scope traversal ([8c34244](https://github.com/aurelia/aurelia/commit/8c34244))
* **aurelia:** add startup api shorthand ([a898049](https://github.com/aurelia/aurelia/commit/a898049))
* **lifecycle:** initial implementation for general-purpose lifecycle task ([d921922](https://github.com/aurelia/aurelia/commit/d921922))
* **runtime:** pass LifecycleFlags through all regular lifecycle methods ([a3eeec5](https://github.com/aurelia/aurelia/commit/a3eeec5))
* **binding:** implement BindLifecycle for correct ordering of bound/unbound calls ([c403035](https://github.com/aurelia/aurelia/commit/c403035))
* **customElement:** make build and instructions properties optional ([8f70dcf](https://github.com/aurelia/aurelia/commit/8f70dcf))
* **lifecycle:** add state flags for binding/unbinding/attaching/detaching ([d504f5d](https://github.com/aurelia/aurelia/commit/d504f5d))
* **templating:** centralize all TemplateDefinition creation into reusable definitionBuilder ([25aba89](https://github.com/aurelia/aurelia/commit/25aba89))
* **customElement:** report error code on nil nameOrSource ([0a42e5e](https://github.com/aurelia/aurelia/commit/0a42e5e))
* **bindable:** allow declaring a bindable property via class decorator and direct invocation ([b9d1b12](https://github.com/aurelia/aurelia/commit/b9d1b12))


### Bug Fixes:

* **scheduler:** pass in correct delta ([93ea64a](https://github.com/aurelia/aurelia/commit/93ea64a))
* **dirty-checker:** use render task queue ([21f9b69](https://github.com/aurelia/aurelia/commit/21f9b69))
* **scheduler:** try another microTaskQueue thing for ff ([f2f954a](https://github.com/aurelia/aurelia/commit/f2f954a))
* **scheduler:** set/unset appropriate task for recursive microtask checking ([22ff346](https://github.com/aurelia/aurelia/commit/22ff346))
* **scheduler:** fix persistent task cancellation and add more tests ([88c897b](https://github.com/aurelia/aurelia/commit/88c897b))
* **scheduler:** account for persistent tasks when yielding ([850657d](https://github.com/aurelia/aurelia/commit/850657d))
* **scheduler:** various bugfixes/improvements in task reuse and removal ([107ae0c](https://github.com/aurelia/aurelia/commit/107ae0c))
* **runtime:** binary expression connect issue ([039f4f2](https://github.com/aurelia/aurelia/commit/039f4f2))
* **scheduler:** properly implement persistent tasks ([d604394](https://github.com/aurelia/aurelia/commit/d604394))
* **rendering-engine:** always return a CompiledTemplate even if there is no template ([7042ca8](https://github.com/aurelia/aurelia/commit/7042ca8))
* **controller:** use the compiled definition to get the projector ([7208b6c](https://github.com/aurelia/aurelia/commit/7208b6c))
* **bindable:** inherit from prototype ([b3f6c44](https://github.com/aurelia/aurelia/commit/b3f6c44))
* **children:** inherit from prototype ([e08e5a1](https://github.com/aurelia/aurelia/commit/e08e5a1))
* **view:** handle inheritance correctly / fix tests ([4956c68](https://github.com/aurelia/aurelia/commit/4956c68))
* **view:** more decorator/metadata fixes ([8db676b](https://github.com/aurelia/aurelia/commit/8db676b))
* **bindable:** correctly traverse bindable lookup ([5cdf5f3](https://github.com/aurelia/aurelia/commit/5cdf5f3))
* **runtime:** missing notify on new value of key ([55c9fdf](https://github.com/aurelia/aurelia/commit/55c9fdf))
* **children:** handle definition properly ([a9e4339](https://github.com/aurelia/aurelia/commit/a9e4339))
* **bindable:** handle definition properly ([b66aac8](https://github.com/aurelia/aurelia/commit/b66aac8))
* **mount-strategy:** make const enum ([4fb0274](https://github.com/aurelia/aurelia/commit/4fb0274))
* **portal:** add 2nd param for hold, add tests, export mountstrategy ([d797f9a](https://github.com/aurelia/aurelia/commit/d797f9a))
* **portal:** separate API for hold parent container ([537eb97](https://github.com/aurelia/aurelia/commit/537eb97))
* **bindable:** use ctor instead of prototype to store metadata ([7844925](https://github.com/aurelia/aurelia/commit/7844925))
* **children:** use ctor instead of prototype to store metadata ([5912462](https://github.com/aurelia/aurelia/commit/5912462))
* **controller:** assign $controller again ([e6ef63b](https://github.com/aurelia/aurelia/commit/e6ef63b))
* **custom-element:** use transient registration ([54048cd](https://github.com/aurelia/aurelia/commit/54048cd))
* **custom-attribute:** use transient registration ([1f97380](https://github.com/aurelia/aurelia/commit/1f97380))
* **controller:** store host ([266652d](https://github.com/aurelia/aurelia/commit/266652d))
* **rendering-engine:** property inject compiler ([617f215](https://github.com/aurelia/aurelia/commit/617f215))
* **custom-element:** use generated type if null ([69aed3c](https://github.com/aurelia/aurelia/commit/69aed3c))
* **bindable:** fix deco signature ([5528572](https://github.com/aurelia/aurelia/commit/5528572))
* **custom-element:** add missing isType and behaviorFor back in + renames ([8e55a2a](https://github.com/aurelia/aurelia/commit/8e55a2a))
* **custom-attribute:** add getDefinition ([3b22abb](https://github.com/aurelia/aurelia/commit/3b22abb))
* **runtime:** attribute order for checkbox ([49a1d43](https://github.com/aurelia/aurelia/commit/49a1d43))
* **ref:** add update source flag to binding ([19fdc34](https://github.com/aurelia/aurelia/commit/19fdc34))
* **ref:** remove bind optimization ([a270f82](https://github.com/aurelia/aurelia/commit/a270f82))
* **ref:** add always notify flag ([261bc10](https://github.com/aurelia/aurelia/commit/261bc10))
* **renderer:** copy metadata to decorated target ([b5d647e](https://github.com/aurelia/aurelia/commit/b5d647e))
* **render-context:** add path property ([bd999f5](https://github.com/aurelia/aurelia/commit/bd999f5))
* **tests:** computed-observer typing issue ([6a6043c](https://github.com/aurelia/aurelia/commit/6a6043c))
* **tests:** computed observer ([a074800](https://github.com/aurelia/aurelia/commit/a074800))
* **tests:** linting issues ([3f85553](https://github.com/aurelia/aurelia/commit/3f85553))
* **runtime:** computed bug ([641ba1c](https://github.com/aurelia/aurelia/commit/641ba1c))
* **runtime:** computed-observer overridden config ([6363d47](https://github.com/aurelia/aurelia/commit/6363d47))
* **custom-attr:** define parsing behavior clearer ([32e7ec8](https://github.com/aurelia/aurelia/commit/32e7ec8))
* **let:** to-view-model -> to-binding-context ([a201a32](https://github.com/aurelia/aurelia/commit/a201a32))
* **repeat:** revert changes related to iterator binding ([3edbcd0](https://github.com/aurelia/aurelia/commit/3edbcd0))
* **repeat:** fix map delete observation, add more tests, normalize items in repeat ([f62df34](https://github.com/aurelia/aurelia/commit/f62df34))
* **repeat:** add contextual props back ([4083fb4](https://github.com/aurelia/aurelia/commit/4083fb4))
* **array-observer:** fix splice edge case ([5a246a7](https://github.com/aurelia/aurelia/commit/5a246a7))
* **kernel:** only propagate globally registered resources to child render contexts ([1ccf9c0](https://github.com/aurelia/aurelia/commit/1ccf9c0))
* **bindable-primary:** cleanup debug code, add more tests ([f812a55](https://github.com/aurelia/aurelia/commit/f812a55))
* **all:** rename root au -> aurelia, auRefs -> au, fix tests ([edeb66b](https://github.com/aurelia/aurelia/commit/edeb66b))
* **template-binderf:** ensure custom attribute are processed first ([b6177cb](https://github.com/aurelia/aurelia/commit/b6177cb))
* **ref:** tweak reference setting timing ([6c7b30a](https://github.com/aurelia/aurelia/commit/6c7b30a))
* **ref:** refactor wacky getRefTarget logic ([781a14a](https://github.com/aurelia/aurelia/commit/781a14a))
* **ref:** compile ref normally ([86b27c3](https://github.com/aurelia/aurelia/commit/86b27c3))
* **ref:** properly set reference on host ([719e50b](https://github.com/aurelia/aurelia/commit/719e50b))
* **binding-language:** allow binding command to take precedence over custom attr ([cf24681](https://github.com/aurelia/aurelia/commit/cf24681))
* **harmony-compilation:** tweaks flags, revert cond ([dd403bd](https://github.com/aurelia/aurelia/commit/dd403bd))
* **resources:** base registration on the actual registered type ([f8fc3d6](https://github.com/aurelia/aurelia/commit/f8fc3d6))
* **view-locator:** final typing issue ([bb903f1](https://github.com/aurelia/aurelia/commit/bb903f1))
* **binding-type:** add back isEventCommand ([2f37532](https://github.com/aurelia/aurelia/commit/2f37532))
* **binding-type:** adjust flags bits, tweak tests ([0bac00f](https://github.com/aurelia/aurelia/commit/0bac00f))
* **binding-language:** add IgnoreCustomAttr to binding type ([02b6903](https://github.com/aurelia/aurelia/commit/02b6903))
* **view-locator:** improve types and simplify tests ([2ecb8c4](https://github.com/aurelia/aurelia/commit/2ecb8c4))
* **IViewLocator:** change registration strategy ([033d9d7](https://github.com/aurelia/aurelia/commit/033d9d7))
* **jit-html:** add convention for html attributes ([ce07a92](https://github.com/aurelia/aurelia/commit/ce07a92))
* **view-locator:** improve some typings ([800fe80](https://github.com/aurelia/aurelia/commit/800fe80))
* **all:** build errors related to children observers ([1658844](https://github.com/aurelia/aurelia/commit/1658844))
* **child-observation:** ensure observers and get/set always present ([1c27331](https://github.com/aurelia/aurelia/commit/1c27331))
* **ChildObserver:** remove redundant lifecycle arg ([50f86ac](https://github.com/aurelia/aurelia/commit/50f86ac))
* **child-observation:** correct shadow projector and children observer ([721d6d8](https://github.com/aurelia/aurelia/commit/721d6d8))
* **runtime:** cleanup unused flags to get the highest flag no to SMI again ([4bc20d3](https://github.com/aurelia/aurelia/commit/4bc20d3))
* **start-task:** fix strategy mapping ([3279354](https://github.com/aurelia/aurelia/commit/3279354))
* **activator:** add task manager inject key ([720dfab](https://github.com/aurelia/aurelia/commit/720dfab))
* **replaceable:** fix some more edge cases with multi nested elements and template controllers ([b600463](https://github.com/aurelia/aurelia/commit/b600463))
* **replaceable:** more scoping fixes, enable most of bigopon's tests ([0daea3a](https://github.com/aurelia/aurelia/commit/0daea3a))
* **property-accessor:** properly distinguish observer lookup types ([9733f93](https://github.com/aurelia/aurelia/commit/9733f93))
* **replaceable:** make part scopes also work when not immediately bound from the wrapping replaceable ([78803f1](https://github.com/aurelia/aurelia/commit/78803f1))
* **replaceable:** retain parts through template controllers in the replace-part ([69fdd0c](https://github.com/aurelia/aurelia/commit/69fdd0c))
* **lifecycle:** fix raf timing issue ([54f0f19](https://github.com/aurelia/aurelia/commit/54f0f19))
* **debug:** add missing error codes and fix a few reporting issues ([25148d0](https://github.com/aurelia/aurelia/commit/25148d0))
* **repeat:** fix indexMap synchronization ([16c69f9](https://github.com/aurelia/aurelia/commit/16c69f9))
* **proxy-observer:** make proxies work again ([c2627bc](https://github.com/aurelia/aurelia/commit/c2627bc))
* **self-observer:** fix subscribe slip-up ([075e31a](https://github.com/aurelia/aurelia/commit/075e31a))
* **setter-observer:** correctly update inner state ([8a7ef50](https://github.com/aurelia/aurelia/commit/8a7ef50))
* **repeat:** correctly reorder nodes, fix several small bugs in node state tracking ([283af76](https://github.com/aurelia/aurelia/commit/283af76))
* **di:** make the decorators compatible with ts strict mode for end users ([4a3d7a2](https://github.com/aurelia/aurelia/commit/4a3d7a2))
* **controller:** detach custom element controllers ([b113700](https://github.com/aurelia/aurelia/commit/b113700))
* **if:** correct a lifecycle bug ([d273563](https://github.com/aurelia/aurelia/commit/d273563))
* **lifecycle:** fix some flags and hook callback slip-ups ([e769249](https://github.com/aurelia/aurelia/commit/e769249))
* **controller:** use provided property name ([25d7be2](https://github.com/aurelia/aurelia/commit/25d7be2))
* **if:** set elseFactory ([f01af55](https://github.com/aurelia/aurelia/commit/f01af55))
* **interpolation-binding:** bind observers ([537cbcc](https://github.com/aurelia/aurelia/commit/537cbcc))
* **renderer:** use the correct targets ([885c7af](https://github.com/aurelia/aurelia/commit/885c7af))
* **controller:** mount via the raf queue ([1691161](https://github.com/aurelia/aurelia/commit/1691161))
* **repeat:** mount via the raf queue ([2e0662a](https://github.com/aurelia/aurelia/commit/2e0662a))
* **repeat:** get sourceExpression correctly again ([24daae1](https://github.com/aurelia/aurelia/commit/24daae1))
* **controller:** respect noProxy property ([5f88d30](https://github.com/aurelia/aurelia/commit/5f88d30))
* **runtime:** fix index exports ([711837d](https://github.com/aurelia/aurelia/commit/711837d))
* **subscriber-collection:** allow recursion ([2c1b4dd](https://github.com/aurelia/aurelia/commit/2c1b4dd))
* **target-observer:** fix dom binding update when initial value matches empty string ([38fdc71](https://github.com/aurelia/aurelia/commit/38fdc71))
* **self-observer:** call valueChanged after callSubscribers ([bfff190](https://github.com/aurelia/aurelia/commit/bfff190))
* **runtime:** fix two-way binding ([d60b952](https://github.com/aurelia/aurelia/commit/d60b952))
* **repeater:** fix null and undefined collection observer initialization for proxies ([ce9d265](https://github.com/aurelia/aurelia/commit/ce9d265))
* **repeat:** fix proxy observer edge case ([0708221](https://github.com/aurelia/aurelia/commit/0708221))
* **proxies:** properly observe array indexers and source items ([2c3923e](https://github.com/aurelia/aurelia/commit/2c3923e))
* **proxies:** ensure proxy context is passed to created() hook ([41cbf85](https://github.com/aurelia/aurelia/commit/41cbf85))
* **patch:** always process changes synchronously on patch ([35ec87a](https://github.com/aurelia/aurelia/commit/35ec87a))
* **binding:** fix patch mode (again) ([e3eb280](https://github.com/aurelia/aurelia/commit/e3eb280))
* **runtime:** remove dom types ([b085dd1](https://github.com/aurelia/aurelia/commit/b085dd1))
* **ast:** fix forOf bind slip-up ([b715cc0](https://github.com/aurelia/aurelia/commit/b715cc0))
* **runtime:** tsconfig needs libs for dom interfaces ([9819239](https://github.com/aurelia/aurelia/commit/9819239))
* **runtime:** allow dom interfaces to be used in typings ([60423bc](https://github.com/aurelia/aurelia/commit/60423bc))
* **proxy-observer:** only invoke subscribers specific to properties ([237d60d](https://github.com/aurelia/aurelia/commit/237d60d))
* **proxy-observer:** make sure array/set/map work ([d07f412](https://github.com/aurelia/aurelia/commit/d07f412))
* **dirty-checker:** use tick counter instead of frameDelta counter and revert tests back to normal ([a9f9822](https://github.com/aurelia/aurelia/commit/a9f9822))
* **aurelia:** initialize dom before trying to resolve component ([306c497](https://github.com/aurelia/aurelia/commit/306c497))
* **binding:** force updateSourceExpression when bindingMode is fromView ([366301f](https://github.com/aurelia/aurelia/commit/366301f))
* **lifecycle:** temporary solution for a mounting race condition ([9f11a93](https://github.com/aurelia/aurelia/commit/9f11a93))
* **runtime:** register local dependencies before going into the template compiler ([13a7fd4](https://github.com/aurelia/aurelia/commit/13a7fd4))
* **view:** also use lockedUnbind on lockScope ([bba81ca](https://github.com/aurelia/aurelia/commit/bba81ca))
* **runtime:** add missing renderer registrations ([c301823](https://github.com/aurelia/aurelia/commit/c301823))
* **custom-element:** use the correct $bind interface ([7000b9a](https://github.com/aurelia/aurelia/commit/7000b9a))
* **template-factory:** fix an edge case with whitespace around the element ([1cb386e](https://github.com/aurelia/aurelia/commit/1cb386e))
* **aurelia:** make the host property runtime agnostic ([b45dca0](https://github.com/aurelia/aurelia/commit/b45dca0))
* **dom.interfaces:** keep dom interfaces compatible with lib.dom.d.ts ([9fd0409](https://github.com/aurelia/aurelia/commit/9fd0409))
* **template-definition:** accept any node/template type ([6111e1e](https://github.com/aurelia/aurelia/commit/6111e1e))
* **dom:** tolerate non string types for template markup ([0676a0f](https://github.com/aurelia/aurelia/commit/0676a0f))
* **replaceable:** use IBindScope instead of IBindSelf and remove IBindSelf ([7fd2b10](https://github.com/aurelia/aurelia/commit/7fd2b10))
* **runtime:** enable LengthObserver ([c7b3373](https://github.com/aurelia/aurelia/commit/c7b3373))
* **aurelia:** add attach/detach flags to start/stop task ([fa2ba9c](https://github.com/aurelia/aurelia/commit/fa2ba9c))
* **mounting:** defer mount/unmount decision to processQueue, cleanup unnecessary guards ([22a79d0](https://github.com/aurelia/aurelia/commit/22a79d0))
* **host-projector:** allow children of host element to be removed for router-view-like scenarios ([634db1a](https://github.com/aurelia/aurelia/commit/634db1a))
* **lifecycle:** temporary solution for infinite flush loop on $detach ([647e0d8](https://github.com/aurelia/aurelia/commit/647e0d8))
* **target-observer:** revert aurelia-cli incompatible async change ([c262ab2](https://github.com/aurelia/aurelia/commit/c262ab2))
* **ast:** fix slip-up in arePureLiterals helper function ([69c5e32](https://github.com/aurelia/aurelia/commit/69c5e32))
* **binding:** add null check to check for existing behaviorKey ([6fc286c](https://github.com/aurelia/aurelia/commit/6fc286c))
* **lifecycle:** properly implement unbindAfterDetach behavior ([9d3f41b](https://github.com/aurelia/aurelia/commit/9d3f41b))
* **repeat:** always re-subscribe arrayObserver during binding ([3ebe065](https://github.com/aurelia/aurelia/commit/3ebe065))
* **lifecycle:** temporary workaround for issue with flushChanges during attaching() ([6483ed9](https://github.com/aurelia/aurelia/commit/6483ed9))
* **custom-element:** ensure the correct runtime behavior is applied ([1a74855](https://github.com/aurelia/aurelia/commit/1a74855))
* **dom:** make attachShadow work with custom elements" ([bd22ea7](https://github.com/aurelia/aurelia/commit/bd22ea7))
* **dom:** make attachShadow work with custom elements ([18d2e15](https://github.com/aurelia/aurelia/commit/18d2e15))
* **containerless:** replace element with marker for proper containerless behavior ([75bcaa5](https://github.com/aurelia/aurelia/commit/75bcaa5))
* **dom:** set text.textContent to empty after hydration ([7831726](https://github.com/aurelia/aurelia/commit/7831726))
* **with:** only invoke change handler if the controller is bound ([935eedb](https://github.com/aurelia/aurelia/commit/935eedb))
* **dom:** use emptyNodeSequence when fragment has no children ([d600da4](https://github.com/aurelia/aurelia/commit/d600da4))
* **dom:** ensure the correct nodes are removed on unmounting containerless views ([8fbe26b](https://github.com/aurelia/aurelia/commit/8fbe26b))
* **dom:** ensure renderLocation keeps the correct parent and is removed with the rest of the fragment nodes ([43005e7](https://github.com/aurelia/aurelia/commit/43005e7))
* **runtime:** correctly remove root element children on stopTask ([46f1d5f](https://github.com/aurelia/aurelia/commit/46f1d5f))
* **LinkedChangeList:** fix idempotency and recursion to behave the same way as ChangeSet ([c79df13](https://github.com/aurelia/aurelia/commit/c79df13))
* **LinkedChangeList:** recursively flush changes ([4926397](https://github.com/aurelia/aurelia/commit/4926397))
* **binding:** add fromBind flags to $bind->$unbind call ([0b57e63](https://github.com/aurelia/aurelia/commit/0b57e63))
* **compose:** change resolution order in provideViewFor from least common to most common properties ([1ee26ea](https://github.com/aurelia/aurelia/commit/1ee26ea))
* **runtime:** add some missing exports ([a4deeeb](https://github.com/aurelia/aurelia/commit/a4deeeb))
* **binding-context:** make addObserver optional to make typescript happy ([e1acc1f](https://github.com/aurelia/aurelia/commit/e1acc1f))
* **customElement:** use provided def.cache value ([dde367a](https://github.com/aurelia/aurelia/commit/dde367a))
* **customAttribute:** register aliases with the correct key ([e3bf5ef](https://github.com/aurelia/aurelia/commit/e3bf5ef))
* **lifecycle:** pass changeSet  into controller and always flush before processing attach/detach ([94197db](https://github.com/aurelia/aurelia/commit/94197db))
* **else:** do not remove renderLocation (to prevent parentNode null issue) ([17f2d01](https://github.com/aurelia/aurelia/commit/17f2d01))


### Performance Improvements:

* **repeat:** only update contextual props when necessary ([651e81a](https://github.com/aurelia/aurelia/commit/651e81a))
* **all:** remove tracer/profiler from ts source ([cc9c1fc](https://github.com/aurelia/aurelia/commit/cc9c1fc))
* **all): add sideEffect:** false for better tree shaking ([59b5e55](https://github.com/aurelia/aurelia/commit/59b5e55))
* **runtime:** move collection observer initializers to observer constructors ([838b325](https://github.com/aurelia/aurelia/commit/838b325))
* **controller:** abort attach/detach sooner ([b96cc99](https://github.com/aurelia/aurelia/commit/b96cc99))
* **binding:** don't bind observers in onetime mode ([4fb7fef](https://github.com/aurelia/aurelia/commit/4fb7fef))
* **custom-attributes:** use merged flags ([37373d9](https://github.com/aurelia/aurelia/commit/37373d9))
* **repeat:** small tweak to lis algorithm ([36ea371](https://github.com/aurelia/aurelia/commit/36ea371))
* **if:** unroll the custom attribute lifecycle ([4b7bc3f](https://github.com/aurelia/aurelia/commit/4b7bc3f))
* **binding:** use string id property instead of number ([db8e1f9](https://github.com/aurelia/aurelia/commit/db8e1f9))
* **repeat:** small tweaks to lis algorithm ([6ae65f5](https://github.com/aurelia/aurelia/commit/6ae65f5))
* **all:** pre-declare variables used in loops ([16b9c18](https://github.com/aurelia/aurelia/commit/16b9c18))
* **repeat:** reuse existing binding context if a mutated item is the same ([b106cdf](https://github.com/aurelia/aurelia/commit/b106cdf))
* **runtime-html:** remove DOM dependency from DOM target accessors ([74b649a](https://github.com/aurelia/aurelia/commit/74b649a))
* **all:** shorten au-marker to au-m ([e04fe9c](https://github.com/aurelia/aurelia/commit/e04fe9c))
* **all:** shorten au-marker to au- ([c3f82ff](https://github.com/aurelia/aurelia/commit/c3f82ff))
* **renderer:** use normal object instead of null object for renderers lookup ([afb4720](https://github.com/aurelia/aurelia/commit/afb4720))
* **instruction-renderer:** set instructionType on the instance instead of the prototype ([c15b25f](https://github.com/aurelia/aurelia/commit/c15b25f))
* **lifecycle:** properly enforce only-root-removal but unmount everything on stopTask ([365ddcc](https://github.com/aurelia/aurelia/commit/365ddcc))
* **runtime:** don't update DOM during flush if it's about to be detached ([83f3e8f](https://github.com/aurelia/aurelia/commit/83f3e8f))
* **lifecycle:** use lifecycle as first node to reduce the number of null checks needed ([c1930af](https://github.com/aurelia/aurelia/commit/c1930af))
* **binding:** connect after mounting ([388f189](https://github.com/aurelia/aurelia/commit/388f189))
* **target-accessor:** only batch DOM changes if target is already attached ([0a875ce](https://github.com/aurelia/aurelia/commit/0a875ce))
* **dom:** only remove root nodes ([c5c8865](https://github.com/aurelia/aurelia/commit/c5c8865))
* **LinkedChangeSet:** remove $linked property and use marker instead ([a4b0bfc](https://github.com/aurelia/aurelia/commit/a4b0bfc))
* **lifecycle:** change BindLifecycle to linked list, preallocate properties ([17ac407](https://github.com/aurelia/aurelia/commit/17ac407))
* **runtime-behavior:** replace boolean properties with single flags property ([9e168bc](https://github.com/aurelia/aurelia/commit/9e168bc))
* **dom:** declare DOM api as loose functions" ([6087767](https://github.com/aurelia/aurelia/commit/6087767))
* **view:** add BindingFlags.fromBind to unbind call ([92068ee](https://github.com/aurelia/aurelia/commit/92068ee))
* **dom:** use nodeType instead of instanceof for isNodeInstance ([7e1321b](https://github.com/aurelia/aurelia/commit/7e1321b))
* **dom:** declare DOM api as loose functions ([10f657f](https://github.com/aurelia/aurelia/commit/10f657f))
* **node-sequence:** implement special textNodeSequence and reorganize a few things ([0e66eb3](https://github.com/aurelia/aurelia/commit/0e66eb3))
* **binding:** reduce redundant calls to evaluate() ([7750743](https://github.com/aurelia/aurelia/commit/7750743))
* **if:** batch state changes between if/else view ([022040f](https://github.com/aurelia/aurelia/commit/022040f))


### Refactorings:

* **throttle:** cleanup and use scheduler ([fd2caa5](https://github.com/aurelia/aurelia/commit/fd2caa5))
* **debounce:** cleanup and use scheduler ([9d8d9e7](https://github.com/aurelia/aurelia/commit/9d8d9e7))
* **scheduler:** add tracing hooks for debugging and fix task pool ([2a518a1](https://github.com/aurelia/aurelia/commit/2a518a1))
* **scheduler:** return boolean from cancel instead of throwing ([c541747](https://github.com/aurelia/aurelia/commit/c541747))
* **observer-locator:** convert from lifecycle to scheduler ([2586102](https://github.com/aurelia/aurelia/commit/2586102))
* **dirty-checker:** convert from lifecycle to scheduler ([e081285](https://github.com/aurelia/aurelia/commit/e081285))
* **scheduler:** improve persistent and reusable task logic ([0094761](https://github.com/aurelia/aurelia/commit/0094761))
* ***:** remove timeSlicing api calls ([0e05c43](https://github.com/aurelia/aurelia/commit/0e05c43))
* **lifecycle:** remove rafQueue & related stuff ([9b06b5a](https://github.com/aurelia/aurelia/commit/9b06b5a))
* **scheduler:** remove evenLoop priority ([bb1fe5a](https://github.com/aurelia/aurelia/commit/bb1fe5a))
* **view:** get the closest definition instead of the view ([67f1791](https://github.com/aurelia/aurelia/commit/67f1791))
* **custom-element:** properly differentiate between clone/propagate/override ([ab1577b](https://github.com/aurelia/aurelia/commit/ab1577b))
* **view:** make the view decorator work with metadata ([566d713](https://github.com/aurelia/aurelia/commit/566d713))
* **compose:** generate anonymous name if no name is provided in the definition ([211d3d9](https://github.com/aurelia/aurelia/commit/211d3d9))
* **binding-behavior:** sync with attribute+element resource api ([6b66e38](https://github.com/aurelia/aurelia/commit/6b66e38))
* **value-converter:** sync with attribute+element resource api ([14bd3c4](https://github.com/aurelia/aurelia/commit/14bd3c4))
* **controller:** use switch in mount synthetic ([46f62bf](https://github.com/aurelia/aurelia/commit/46f62bf))
* **all:** enforce 2nd param for hold ([dfda3fe](https://github.com/aurelia/aurelia/commit/dfda3fe))
* **custom-element:** allow non-function types to be passed into isType ([6990132](https://github.com/aurelia/aurelia/commit/6990132))
* **view:** always clone parts ([a058ac1](https://github.com/aurelia/aurelia/commit/a058ac1))
* **jit:** fix template compiler+binder" ([32181f8](https://github.com/aurelia/aurelia/commit/32181f8))
* **resources:** move merge helpers to kernel ([9ceb1f7](https://github.com/aurelia/aurelia/commit/9ceb1f7))
* **controller:** fix types and correctly use metadata ([22ce19a](https://github.com/aurelia/aurelia/commit/22ce19a))
* **rendering-engine:** fix types and correctly use metadata ([26b6931](https://github.com/aurelia/aurelia/commit/26b6931))
* **if:** cleanup, go back to idiomatic aurelia code ([fa12de4](https://github.com/aurelia/aurelia/commit/fa12de4))
* **repeat:** cleanup, go back to idiomatic aurelia code ([71c451d](https://github.com/aurelia/aurelia/commit/71c451d))
* **with:** cleanup, go back to idiomatic aurelia code ([1efd937](https://github.com/aurelia/aurelia/commit/1efd937))
* **custom-element:** self-register definition in metadata ([2d9c300](https://github.com/aurelia/aurelia/commit/2d9c300))
* **renderer:** fix types and line length ([a267098](https://github.com/aurelia/aurelia/commit/a267098))
* **render-context:** fix types ([3913596](https://github.com/aurelia/aurelia/commit/3913596))
* **ast:** fix refs ([4e0e01f](https://github.com/aurelia/aurelia/commit/4e0e01f))
* **lifecycle:** fix types ([50d70b0](https://github.com/aurelia/aurelia/commit/50d70b0))
* **instructions:** fix types ([7bf3bb3](https://github.com/aurelia/aurelia/commit/7bf3bb3))
* **view:** fix types ([d46ef67](https://github.com/aurelia/aurelia/commit/d46ef67))
* **definitions:** cleanup unnecessary types/logic and fix refs ([d0955b6](https://github.com/aurelia/aurelia/commit/d0955b6))
* **bindable:** fix types ([428c2e7](https://github.com/aurelia/aurelia/commit/428c2e7))
* **children:** fixup naming ([1b3b2c2](https://github.com/aurelia/aurelia/commit/1b3b2c2))
* **custom-attribute:** fixup bindable references ([19ba25d](https://github.com/aurelia/aurelia/commit/19ba25d))
* **custom-element:** fixup bindable/children references ([3f4973e](https://github.com/aurelia/aurelia/commit/3f4973e))
* **children:** normalize to similar mechanism as bindable ([5083b10](https://github.com/aurelia/aurelia/commit/5083b10))
* **bindable:** cleanup decorator signature and definition logic ([c84ea69](https://github.com/aurelia/aurelia/commit/c84ea69))
* **runtime:** overhaul bindable, add annotations, fixup resource definitions ([8cffcf5](https://github.com/aurelia/aurelia/commit/8cffcf5))
* **custom-attribute:** apply new metadata api ([1b3a8d7](https://github.com/aurelia/aurelia/commit/1b3a8d7))
* **binding-behavior:** apply new metadata api ([c498f5f](https://github.com/aurelia/aurelia/commit/c498f5f))
* **value-converter:** apply new metadata api ([d75aa91](https://github.com/aurelia/aurelia/commit/d75aa91))
* **resources): prepend with a:**  ([dd7c238](https://github.com/aurelia/aurelia/commit/dd7c238))
* **runtime:** use metadata for customElement def and renderer cache ([bccdc54](https://github.com/aurelia/aurelia/commit/bccdc54))
* **scheduler:** add prio specific apis ([5115f58](https://github.com/aurelia/aurelia/commit/5115f58))
* **scheduler:** reorder priorities ([12cc85a](https://github.com/aurelia/aurelia/commit/12cc85a))
* **scheduler:** add tests and fix the bugs they exposed ([2babe82](https://github.com/aurelia/aurelia/commit/2babe82))
* **scheduler:** add global initialization and initial test setup ([2d15388](https://github.com/aurelia/aurelia/commit/2d15388))
* **scheduler:** add interfaces ([d141d94](https://github.com/aurelia/aurelia/commit/d141d94))
* ***:** drop unused imports ([7755bbf](https://github.com/aurelia/aurelia/commit/7755bbf))
* ***:** un-ignore some ts-ignore ([5e19c62](https://github.com/aurelia/aurelia/commit/5e19c62))
* **all:** rename BasicConfiguration in various packages ([7e330d8](https://github.com/aurelia/aurelia/commit/7e330d8))
* **runtime:** switch to switch ([6ae23fe](https://github.com/aurelia/aurelia/commit/6ae23fe))
* **custom-attrs:** first pass removing dynamic options ([03c5480](https://github.com/aurelia/aurelia/commit/03c5480))
* **ref:** move $au to INode ([dbf1fce](https://github.com/aurelia/aurelia/commit/dbf1fce))
* **controller:** better typings ([4cd9aab](https://github.com/aurelia/aurelia/commit/4cd9aab))
* **ref:** add component host interfaces, tweak getRefTarget ([fb36d8b](https://github.com/aurelia/aurelia/commit/fb36d8b))
* **ref:** add ref command, add target ref ([722778f](https://github.com/aurelia/aurelia/commit/722778f))
* **renderers:** add getRefTarget ([3a7387a](https://github.com/aurelia/aurelia/commit/3a7387a))
* **view-locator:** some naming changes ([271ce6d](https://github.com/aurelia/aurelia/commit/271ce6d))
* **view-locator:** renaming a type ([b227e15](https://github.com/aurelia/aurelia/commit/b227e15))
* **blur/focus:** isolated tests in their own host elements ([8111b96](https://github.com/aurelia/aurelia/commit/8111b96))
* **replaceable:** use templateController deco ([6c5dd91](https://github.com/aurelia/aurelia/commit/6c5dd91))
* **resources:** make the string keys the primary keys ([747772a](https://github.com/aurelia/aurelia/commit/747772a))
* **runtime:** clean up resource definitions ([e58381a](https://github.com/aurelia/aurelia/commit/e58381a))
* **runtime:** cleanup binding behaviors & value converters ([104bb10](https://github.com/aurelia/aurelia/commit/104bb10))
* **renderer:** cleanup renderer types and pre-bind render methods for perf ([5b3ed88](https://github.com/aurelia/aurelia/commit/5b3ed88))
* **resources:** shorten resource names ([499634b](https://github.com/aurelia/aurelia/commit/499634b))
* **binding:** rename bindings ([35d4dff](https://github.com/aurelia/aurelia/commit/35d4dff))
* **ast:** add -Expression suffix to AST expression classes ([0870538](https://github.com/aurelia/aurelia/commit/0870538))
* **all): more cleaning up after TS breaking changes:** ( ([c4c3fc7](https://github.com/aurelia/aurelia/commit/c4c3fc7))
* **replaceable:** fix scoping and some variations of nesting ([99b356c](https://github.com/aurelia/aurelia/commit/99b356c))
* **lifecycle:** split up the queues and take mounting out of RAF for now ([766a743](https://github.com/aurelia/aurelia/commit/766a743))
* **if:** do not use RAF queue for updates ([9621a8a](https://github.com/aurelia/aurelia/commit/9621a8a))
* **all:** use nextId for controller and all resources ([e9ed2ac](https://github.com/aurelia/aurelia/commit/e9ed2ac))
* **controller:** fix typings and add id property ([e149ee0](https://github.com/aurelia/aurelia/commit/e149ee0))
* **all:** move isNumeric/camelCase/kebabCase/toArray to separate functions and fix typings ([f746e5b](https://github.com/aurelia/aurelia/commit/f746e5b))
* **lifecycle:** experiment with priority-based deadlines ([3e389a2](https://github.com/aurelia/aurelia/commit/3e389a2))
* **if:** use raf queue ([b45a868](https://github.com/aurelia/aurelia/commit/b45a868))
* **subscriber-collection:** simplify the callbacks for now ([b3603d7](https://github.com/aurelia/aurelia/commit/b3603d7))
* **aurelia:** properly integrate start/stop with lifecycle task again ([1d3ac52](https://github.com/aurelia/aurelia/commit/1d3ac52))
* **observation:** cleanup unused flags and remove decorator layer for the time being ([a16863b](https://github.com/aurelia/aurelia/commit/a16863b))
* **ticker:** move ticker + listener to runtime and integrate properly with lifecycle ([0ba386c](https://github.com/aurelia/aurelia/commit/0ba386c))
* **lifecycle:** move LifecycleTask to separate file ([4770366](https://github.com/aurelia/aurelia/commit/4770366))
* **runtime:** wire up the tasks a bit more properly ([b7d3e4b](https://github.com/aurelia/aurelia/commit/b7d3e4b))
* **resources:** expose view property ([3168044](https://github.com/aurelia/aurelia/commit/3168044))
* **pixi:** move pixi to plugin-pixi and fix/sync ([50b1705](https://github.com/aurelia/aurelia/commit/50b1705))
* **router:** fix types and integrate controller ([96c15d8](https://github.com/aurelia/aurelia/commit/96c15d8))
* **all:** rename $customElement to $controller ([aacf278](https://github.com/aurelia/aurelia/commit/aacf278))
* **all:** rename ILifecycleHooks to IViewModel ([a4e2dad](https://github.com/aurelia/aurelia/commit/a4e2dad))
* **runtime-html:** fix create-element types and remove RuntimeBehavior ([a34a9da](https://github.com/aurelia/aurelia/commit/a34a9da))
* **compose:** integrate compose with tasks / controllers, fix typings ([d86267e](https://github.com/aurelia/aurelia/commit/d86267e))
* **custom-attributes:** freeze the definitions ([acc5813](https://github.com/aurelia/aurelia/commit/acc5813))
* **runtime:** add activator class and make the runtime compile again ([b2a707a](https://github.com/aurelia/aurelia/commit/b2a707a))
* **runtime:** minor fixes for custom attributes ([6d99575](https://github.com/aurelia/aurelia/commit/6d99575))
* **replaceable:** integrate with controller and tasks ([7eb1f57](https://github.com/aurelia/aurelia/commit/7eb1f57))
* **runtime:** remove non-keyed mode ([c80fadb](https://github.com/aurelia/aurelia/commit/c80fadb))
* **repeat:** refactor to use tasks and controller ([cf7f079](https://github.com/aurelia/aurelia/commit/cf7f079))
* **if:** integrate with controller ([1259fc7](https://github.com/aurelia/aurelia/commit/1259fc7))
* **runtime:** encapsulate lifecycle behavior in controller class ([4c12498](https://github.com/aurelia/aurelia/commit/4c12498))
* **subscriber-collection:** cleanup and specialize the decorators, cleanup observers ([4ae3768](https://github.com/aurelia/aurelia/commit/4ae3768))
* **all:** move all testing utilities to aurelia-testing package ([8f2fe34](https://github.com/aurelia/aurelia/commit/8f2fe34))
* **replaceable:** unwrap replaceable attribute lifecycle ([ad0f29d](https://github.com/aurelia/aurelia/commit/ad0f29d))
* **all:** break out patch mode for now ([e173d0c](https://github.com/aurelia/aurelia/commit/e173d0c))
* **all:** more loosening up of null/undefined ([6794c30](https://github.com/aurelia/aurelia/commit/6794c30))
* **all:** loosen up null/undefined ([40bc93a](https://github.com/aurelia/aurelia/commit/40bc93a))
* **runtime:** fix binding and observation strict types ([b01d69a](https://github.com/aurelia/aurelia/commit/b01d69a))
* ***:** remove Constructable "hack" and fix exposed typing errors ([c3b6d46](https://github.com/aurelia/aurelia/commit/c3b6d46))
* ***:** use InjectArray ([b35215f](https://github.com/aurelia/aurelia/commit/b35215f))
* **ast:** let flags pass through to getter/setter observers ([a27dae0](https://github.com/aurelia/aurelia/commit/a27dae0))
* **runtime:** remove/cleanup more flags ([71b598b](https://github.com/aurelia/aurelia/commit/71b598b))
* **runtime:** remove unused instanceMutation flag ([a57c484](https://github.com/aurelia/aurelia/commit/a57c484))
* **runtime:** remove connect-queue ([b827710](https://github.com/aurelia/aurelia/commit/b827710))
* ***:** minor linting refactor ([f692d1f](https://github.com/aurelia/aurelia/commit/f692d1f))
* **runtime:** support bindable array ([943eed0](https://github.com/aurelia/aurelia/commit/943eed0))
* **all:** consolidate binding mechanisms into BindingStrategy enum ([d319ba8](https://github.com/aurelia/aurelia/commit/d319ba8))
* **all:** split traceInfo.name up in objName and methodName ([2cdc203](https://github.com/aurelia/aurelia/commit/2cdc203))
* **lifecycles:** use resource name for tracing ([6febc5b](https://github.com/aurelia/aurelia/commit/6febc5b))
* ***:** another round of linting fixes ([ca0660b](https://github.com/aurelia/aurelia/commit/ca0660b))
* ***:** another round of linting fixes ([3e0f393](https://github.com/aurelia/aurelia/commit/3e0f393))
* **keyed:** make lifecycles work properly in repeater keyed mode ([e11d89e](https://github.com/aurelia/aurelia/commit/e11d89e))
* **ast:** temporarily loosen up binding behavior idempotency ([12b6f21](https://github.com/aurelia/aurelia/commit/12b6f21))
* **repeat:** initial infra work for repeater keyed mode ([ba31c62](https://github.com/aurelia/aurelia/commit/ba31c62))
* **lifecycle-render:** remove arguments that can be resolved from the context ([7eb2b5d](https://github.com/aurelia/aurelia/commit/7eb2b5d))
* **lifecycle:** merge ILifecycleMount and ILifecycleUnmount into IMountableComponent ([5e6db98](https://github.com/aurelia/aurelia/commit/5e6db98))
* **runtime:** merge IHooks into ILifecycleHooks ([3ed5116](https://github.com/aurelia/aurelia/commit/3ed5116))
* **all:** combine bindable and attachable into component ([a10461f](https://github.com/aurelia/aurelia/commit/a10461f))
* **lifecycle:** bind bindings before binding() hook and use binding() hook instead of bound() in repeater ([970b70d](https://github.com/aurelia/aurelia/commit/970b70d))
* **lifecycle:** merge hooks interfaces ([bbd3869](https://github.com/aurelia/aurelia/commit/bbd3869))
* **ast:** make $kind property readonly ([bdf2cb2](https://github.com/aurelia/aurelia/commit/bdf2cb2))
* **ast:** abstract IConnectable ([c2abd6e](https://github.com/aurelia/aurelia/commit/c2abd6e))
* **ast:** extract interfaces ([7f16091](https://github.com/aurelia/aurelia/commit/7f16091))
* **runtime:** reduce dependencies in lifecycles ([0a660e1](https://github.com/aurelia/aurelia/commit/0a660e1))
* **runtime:** move all const enums to flags.ts ([27da4ec](https://github.com/aurelia/aurelia/commit/27da4ec))
* ***:** make unknown the default for InterfaceSymbol ([0b77ce3](https://github.com/aurelia/aurelia/commit/0b77ce3))
* **proxy-observer:** move lookup to runtime ([22f25db](https://github.com/aurelia/aurelia/commit/22f25db))
* **proxy-observer:** various tweaks and fixes ([30f91e8](https://github.com/aurelia/aurelia/commit/30f91e8))
* **observation:** initial wireup for proxy observation ([86422eb](https://github.com/aurelia/aurelia/commit/86422eb))
* **proxy-observer:** use direct variable instead of weakmap for checking proxy existence ([2bbab4d](https://github.com/aurelia/aurelia/commit/2bbab4d))
* **proxy-observer:** use string instead of symbol for raw prop ([f1e09ce](https://github.com/aurelia/aurelia/commit/f1e09ce))
* **all:** prepare lifecycle flags arguments for proxy observation ([1f8bf19](https://github.com/aurelia/aurelia/commit/1f8bf19))
* ***:** fix bantypes in tests ([2d7bad8](https://github.com/aurelia/aurelia/commit/2d7bad8))
* ***:** enable ban-types linting rule and fix violations ([00e61b1](https://github.com/aurelia/aurelia/commit/00e61b1))
* **ticker:** improve frameDelta rounding ([53e3aff](https://github.com/aurelia/aurelia/commit/53e3aff))
* **dirty-checker:** rename disable to disabled ([ed4803f](https://github.com/aurelia/aurelia/commit/ed4803f))
* **dirty-checker:** cleanup and pass fromTick flag ([871269f](https://github.com/aurelia/aurelia/commit/871269f))
* **dirty-checker:** integrate with the raf ticker ([848ca2e](https://github.com/aurelia/aurelia/commit/848ca2e))
* **all:** reorganize all registrations and make them more composable ([6fcce8b](https://github.com/aurelia/aurelia/commit/6fcce8b))
* **all:** expose registrations and registerables in a consistent manner ([ea9e59c](https://github.com/aurelia/aurelia/commit/ea9e59c))
* ***:** linting fixes ([a9e26ad](https://github.com/aurelia/aurelia/commit/a9e26ad))
* **runtime:** explicitly export non-internal items ([1c05730](https://github.com/aurelia/aurelia/commit/1c05730))
* **collection-observer:** cleanup collection observation ([c43244f](https://github.com/aurelia/aurelia/commit/c43244f))
* **all:** use Resource.define instead of decorators ([045aa90](https://github.com/aurelia/aurelia/commit/045aa90))
* **all:** replace inject decorators with static inject properties ([9fc37c1](https://github.com/aurelia/aurelia/commit/9fc37c1))
* **all:** move timer globals to PLATFORM ([fa3bda3](https://github.com/aurelia/aurelia/commit/fa3bda3))
* **observation:** move observers to own files and rename Observer to SelfObserver ([24beabf](https://github.com/aurelia/aurelia/commit/24beabf))
* **jit:** move html-specific logic to new jit-html package ([3372cc8](https://github.com/aurelia/aurelia/commit/3372cc8))
* **runtime:** reduce DOM API surface and dependencies on it ([5512c64](https://github.com/aurelia/aurelia/commit/5512c64))
* **observation:** make isDOMObserver property optional ([389ac47](https://github.com/aurelia/aurelia/commit/389ac47))
* **runtime:** completely remove dependencies on DOM-specific types ([24819d2](https://github.com/aurelia/aurelia/commit/24819d2))
* **runtime:** further generalize the runtime ([ab2b1d1](https://github.com/aurelia/aurelia/commit/ab2b1d1))
* **runtime:** move html-specific stuff out of the runtime ([645697f](https://github.com/aurelia/aurelia/commit/645697f))
* **all:** use IDOM interface instead of DOM class ([2f50900](https://github.com/aurelia/aurelia/commit/2f50900))
* **dom:** remove unused methods ([c1927f4](https://github.com/aurelia/aurelia/commit/c1927f4))
* **all:** make DOM injectable ([a6305a0](https://github.com/aurelia/aurelia/commit/a6305a0))
* **signaler:** move signaler to observation ([4c71bac](https://github.com/aurelia/aurelia/commit/4c71bac))
* **runtime:** move binding-context to observation ([750e32f](https://github.com/aurelia/aurelia/commit/750e32f))
* **runtime:** move observers together ([6022939](https://github.com/aurelia/aurelia/commit/6022939))
* **binding-behavior:** shorten names ([8e9ff09](https://github.com/aurelia/aurelia/commit/8e9ff09))
* **runtime:** put resources together ([afed7b9](https://github.com/aurelia/aurelia/commit/afed7b9))
* **all:** move resourceType from runtime to kernel ([2c82c14](https://github.com/aurelia/aurelia/commit/2c82c14))
* **template-compiler:** reimplement the template compiler with the template binder ([ad94bd1](https://github.com/aurelia/aurelia/commit/ad94bd1))
* **instructions:** improve naming/typing consistency ([1ad8d2a](https://github.com/aurelia/aurelia/commit/1ad8d2a))
* **jit:** properly implement more complex replaceable scenarios ([752e21f](https://github.com/aurelia/aurelia/commit/752e21f))
* **runtime:** strictNullChecks fixes ([b000aa2](https://github.com/aurelia/aurelia/commit/b000aa2))
* ***:** standardise on "as" type casts ([d0933b8](https://github.com/aurelia/aurelia/commit/d0933b8))
* **runtime:** fix or suppress Sonart linting errors ([068174c](https://github.com/aurelia/aurelia/commit/068174c))
* **runtime:** changes to Templating for strictPropertyInitialization ([b24758f](https://github.com/aurelia/aurelia/commit/b24758f))
* ***:** linting fixes for IIndexable ([63abddb](https://github.com/aurelia/aurelia/commit/63abddb))
* **runtime:** change Templating for strictPropertyInitialization ([107a06e](https://github.com/aurelia/aurelia/commit/107a06e))
* **runtime:** fix no-http-string linting supression ([26e2431](https://github.com/aurelia/aurelia/commit/26e2431))
* ***:** linting fixes for IIndexable ([4faffed](https://github.com/aurelia/aurelia/commit/4faffed))
* ***:** fix no-floating-promises linting warnings ([03cc0eb](https://github.com/aurelia/aurelia/commit/03cc0eb))
* ***:** partially revert renames due to no-reserved-keywords ([478bd4b](https://github.com/aurelia/aurelia/commit/478bd4b))
* ***:** fix no-floating-promises linting warnings ([fc4018b](https://github.com/aurelia/aurelia/commit/fc4018b))
* ***:** partially revert renames due to no-reserved-keywords ([87501c1](https://github.com/aurelia/aurelia/commit/87501c1))
* ***:** more any to strict typing conversions ([26f2d41](https://github.com/aurelia/aurelia/commit/26f2d41))
* ***:** remove no-reserved-keywords suppressions and fix most of them ([adde468](https://github.com/aurelia/aurelia/commit/adde468))
* ***:** remove no-reserved-keywords suppressions and fix most of them ([579c606](https://github.com/aurelia/aurelia/commit/579c606))
* **runtime:** remove StrictAny in favor of unknown ([eecb4a1](https://github.com/aurelia/aurelia/commit/eecb4a1))
* **runtime:** changes to Binding for strictPropertyInitialization ([1e1d804](https://github.com/aurelia/aurelia/commit/1e1d804))
* **runtime:** changes to Binding for strictPropertyInitialization ([857efa1](https://github.com/aurelia/aurelia/commit/857efa1))
* **resources:** improve flexibility & strictness of resource types ([499a189](https://github.com/aurelia/aurelia/commit/499a189))
* ***:** fix errors and warnings reported by "lgtm" ([173f364](https://github.com/aurelia/aurelia/commit/173f364))
* ***:** add typeguards to decorators and rename Source to Definition ([e8ea550](https://github.com/aurelia/aurelia/commit/e8ea550))
* ***:** decorators use standalone function and has overload signatures ([dffb514](https://github.com/aurelia/aurelia/commit/dffb514))
* **runtime:** add function overloads to "define" on "IResourceKind" ([56425bf](https://github.com/aurelia/aurelia/commit/56425bf))
* **runtime:** decorate customElement ([fa021a0](https://github.com/aurelia/aurelia/commit/fa021a0))
* **runtime:** decorate customAttribute ([b5de1a7](https://github.com/aurelia/aurelia/commit/b5de1a7))
* **runtime:** decorate valueConverter ([62b5bc4](https://github.com/aurelia/aurelia/commit/62b5bc4))
* **runtime:** decorate bindingBehavior ([406edce](https://github.com/aurelia/aurelia/commit/406edce))
* ***:** fix errors and warnings reported by "lgtm" ([c77b12c](https://github.com/aurelia/aurelia/commit/c77b12c))
* **runtime:** move ICustomAttribute+ and ICustomElement+ interfaces ([11b016c](https://github.com/aurelia/aurelia/commit/11b016c))
* ***:** derive ISomethingDefinition from a base IResourceDefinition ([bdc0b6f](https://github.com/aurelia/aurelia/commit/bdc0b6f))
* ***:** rename ISomethingSource to ISomethingDefinition ([8f2727e](https://github.com/aurelia/aurelia/commit/8f2727e))
* **ast:** define properties explicitly in constructor ([7882fb7](https://github.com/aurelia/aurelia/commit/7882fb7))
* **runtime:** define properties explicitly in constructor ([b34bf00](https://github.com/aurelia/aurelia/commit/b34bf00))
* **runtime:** decorate bindingBehavior ([2507ffd](https://github.com/aurelia/aurelia/commit/2507ffd))
* **instructions:** remove renderStrategy in favor of instructionRenderer ([9aca18a](https://github.com/aurelia/aurelia/commit/9aca18a))
* **renderer:** decouple instruction-specific processing from the renderer ([c4cd235](https://github.com/aurelia/aurelia/commit/c4cd235))
* **instructions:** move instruction classes from jit to runtime ([45c186e](https://github.com/aurelia/aurelia/commit/45c186e))
* **lifecycle:** add registerTask api back in + preliminary test ([738d32f](https://github.com/aurelia/aurelia/commit/738d32f))
* **lifecycle:** add task functionality back in (still a few details left todo) ([59d7c6e](https://github.com/aurelia/aurelia/commit/59d7c6e))
* **lifecycle:** only unmount roots and several small tweaks for consistency ([c0c948b](https://github.com/aurelia/aurelia/commit/c0c948b))
* **templating:** move definitions up one level ([1ea759e](https://github.com/aurelia/aurelia/commit/1ea759e))
* **templating:** move view abstraction and composition-coordinator into lifecycle.ts ([721bc43](https://github.com/aurelia/aurelia/commit/721bc43))
* **lifecycle:** remove unnecessary $connectFlags property ([b616676](https://github.com/aurelia/aurelia/commit/b616676))
* **lifecycle:** change the global lifecycle object into an injectable dependency ([dc38d91](https://github.com/aurelia/aurelia/commit/dc38d91))
* **lifecycle:** make bind + attach lifecycles more consistent, remove unneeded flag properties ([ad9eafb](https://github.com/aurelia/aurelia/commit/ad9eafb))
* **runtime:** rename BindingFlags to LifecycleFlags ([a3ad7f2](https://github.com/aurelia/aurelia/commit/a3ad7f2))
* **binding:** initial implementation for new connect queue ([481714f](https://github.com/aurelia/aurelia/commit/481714f))
* **view:** move lifecycle logic to lifecycle files ([da82092](https://github.com/aurelia/aurelia/commit/da82092))
* **runtime:** shorten flushChanges to flush ([e27e4f7](https://github.com/aurelia/aurelia/commit/e27e4f7))
* **lifecycle-attach:** wrap element/attribute attach in begin/end attach lifecycle ([9f72223](https://github.com/aurelia/aurelia/commit/9f72223))
* **templating:** initial restructuring for lifecycle integration ([fc8cf7b](https://github.com/aurelia/aurelia/commit/fc8cf7b))
* **runtime-behavior:** merge $behavior.hooks into the resource definition ([d41ecf1](https://github.com/aurelia/aurelia/commit/d41ecf1))
* **lifecycle:** shorten LifecycleHooks to Hooks ([9c4efdb](https://github.com/aurelia/aurelia/commit/9c4efdb))
* **lifecycle:** shorten LifecycleState to State ([42fe7c4](https://github.com/aurelia/aurelia/commit/42fe7c4))
* **lifecycle:** merge changeSet into lifecycle ([63da3bb](https://github.com/aurelia/aurelia/commit/63da3bb))
* **lifecycle:** merge bind and attach lifecycles ([20b651a](https://github.com/aurelia/aurelia/commit/20b651a))
* **lifecycle:** normalize the start/end mechanism across lifecycle hooks ([acd1fde](https://github.com/aurelia/aurelia/commit/acd1fde))
* **lifecycle:** remove the async stuff for the time being ([300820f](https://github.com/aurelia/aurelia/commit/300820f))
* **lifecycle:** flatten the link structure ([88c562c](https://github.com/aurelia/aurelia/commit/88c562c))
* **lifecycle:** merge attach with detach lifecycle (first integration step) ([4a05985](https://github.com/aurelia/aurelia/commit/4a05985))
* **templating:** reorganize instructions/definitions ([a16844f](https://github.com/aurelia/aurelia/commit/a16844f))
* **runtime:** cleanup/reorganize lifecycle types ([a744a9f](https://github.com/aurelia/aurelia/commit/a744a9f))
* **all:** reorganize/consolidate type structure ([57b086f](https://github.com/aurelia/aurelia/commit/57b086f))
* **create-element:** rename PotentialRenderable to RenderPlan ([38a188a](https://github.com/aurelia/aurelia/commit/38a188a))
* **dom:** try using 2 render locations" ([b3d42b9](https://github.com/aurelia/aurelia/commit/b3d42b9))
* **runtime:** move change-set up one level ([d2b7fe5](https://github.com/aurelia/aurelia/commit/d2b7fe5))
* **runtime:** remove index.ts files from non-root locations and don't import from index ([af19838](https://github.com/aurelia/aurelia/commit/af19838))
* **dom:** try using 2 render locations ([df68f15](https://github.com/aurelia/aurelia/commit/df68f15))
* **containerless-projector:** use component $state to determine needsMount ([1657181](https://github.com/aurelia/aurelia/commit/1657181))
* **templating:** move $isAttached, $needsMount and $isCached to flags ([d0f384c](https://github.com/aurelia/aurelia/commit/d0f384c))
* **runtime:** switch from $isBound to $state flags ([f4d12bd](https://github.com/aurelia/aurelia/commit/f4d12bd))
* **templating:** make bindables and attachables into linked lists for lifecycle refactor ([b5d12b3](https://github.com/aurelia/aurelia/commit/b5d12b3))
* **templating:** move createNodeSequence into factory class, move rendering related classes to rendering-engine, some tweaks in how templates are created ([b9f7516](https://github.com/aurelia/aurelia/commit/b9f7516))
* **view:** split up ViewFactory into ViewFactory and ViewCache ([4fde7ef](https://github.com/aurelia/aurelia/commit/4fde7ef))
* **change-set:** implement changeSet as linked list ([2c4a9f1](https://github.com/aurelia/aurelia/commit/2c4a9f1))
* **lifecycle:** finish rename from add/remove nodes to mount/unmount ([afc25fb](https://github.com/aurelia/aurelia/commit/afc25fb))
* **templating:** rename $addNodes to $mount, $removeNodes to $unmount, mount to hold ([83a11c6](https://github.com/aurelia/aurelia/commit/83a11c6))
* **customElement:** rename onElementRemoved() to take() ([fa699c7](https://github.com/aurelia/aurelia/commit/fa699c7))
* **dom:** use static class properties instead of object" ([b608223](https://github.com/aurelia/aurelia/commit/b608223))
* **bindable:** improve typings and small tweak to the flow ([27486a2](https://github.com/aurelia/aurelia/commit/27486a2))
* **dom:** don't declare globals ([22f5765](https://github.com/aurelia/aurelia/commit/22f5765))
* **dom:** use static class properties instead of object ([6d3604f](https://github.com/aurelia/aurelia/commit/6d3604f))
* **target-accessors:** remove DOM dependency ([dc5334e](https://github.com/aurelia/aurelia/commit/dc5334e))
* **element-observation:** remove DOM dependency from element observers ([7aa22aa](https://github.com/aurelia/aurelia/commit/7aa22aa))
* **dom:** remove DOM dependency from dom.ts ([6175167](https://github.com/aurelia/aurelia/commit/6175167))
* **all:** rename ICustomAttributeSource to IAttributeDefinition ([df4babf](https://github.com/aurelia/aurelia/commit/df4babf))
* **all:** rename ITemplateSource to ITemplateDefinition and 'src' to 'def' ([5c398c8](https://github.com/aurelia/aurelia/commit/5c398c8))
* **all:** rename 'srcOrExpr' to 'from' and 'dest' to 'to' ([e71b758](https://github.com/aurelia/aurelia/commit/e71b758))
* **all:** rename templateOrNode to template ([ae04e9f](https://github.com/aurelia/aurelia/commit/ae04e9f))
* **dom:** create a stub class to represent au-marker ([72b8905](https://github.com/aurelia/aurelia/commit/72b8905))
* **templating:** temporarily disable optimizations to get templating working correctly first ([c0a6690](https://github.com/aurelia/aurelia/commit/c0a6690))

<a name="0.3.0"></a>
# 0.3.0 (2018-10-12)

### Features:

* **binding:** improve AST $kind classifying and other small tweaks/fixes (#213) ([7267165](https://github.com/aurelia/aurelia/commit/7267165))
* **ast:** add additional $kind classifications and eager initialize literals if they are pure ([7267165](https://github.com/aurelia/aurelia/commit/7267165))
* **all:** implement InterpolationBinding ([1e804a0](https://github.com/aurelia/aurelia/commit/1e804a0))
* **binding-context:** improve error reporting ([1e804a0](https://github.com/aurelia/aurelia/commit/1e804a0))
* **kernel:** add decoratable interface to support strongly typed decorators ([f67a414](https://github.com/aurelia/aurelia/commit/f67a414))
* **binding:** add @connectable decorator back in (strongly typed) ([f67a414](https://github.com/aurelia/aurelia/commit/f67a414))
* **all:** implement InterpolationBinding ([f67a414](https://github.com/aurelia/aurelia/commit/f67a414))
* **unparser:** implement interpolation unparsing ([f67a414](https://github.com/aurelia/aurelia/commit/f67a414))
* **kernel:** add unwrap interface ([197235c](https://github.com/aurelia/aurelia/commit/197235c))
* **ast:** add visitor interface and implement accept methods on AST ([197235c](https://github.com/aurelia/aurelia/commit/197235c))
* **expression-parser:** allow member expressions on numeric literals ([197235c](https://github.com/aurelia/aurelia/commit/197235c))
* **potential-renderable:** autodetect when build is required ([f296d04](https://github.com/aurelia/aurelia/commit/f296d04))
* **render-context:** throw more informative errors when the context is not prepared yet ([f296d04](https://github.com/aurelia/aurelia/commit/f296d04))
* **Aurelia:** self register to container ([5971d36](https://github.com/aurelia/aurelia/commit/5971d36))
* **lifecycle:** new callbacks, async tasks, and updated template controllers (#171) ([7a9a635](https://github.com/aurelia/aurelia/commit/7a9a635))
* **lifecycle:** minimal add/remove of nodes ([7a9a635](https://github.com/aurelia/aurelia/commit/7a9a635))
* **lifecycle:** enable detach tasks ([7a9a635](https://github.com/aurelia/aurelia/commit/7a9a635))
* **lifecycle:** enable attach tasks ([7a9a635](https://github.com/aurelia/aurelia/commit/7a9a635))
* **lifecycle:** stub out lifecycle flags ([7a9a635](https://github.com/aurelia/aurelia/commit/7a9a635))
* **lifecycle:** introduce child lifecycles ([7a9a635](https://github.com/aurelia/aurelia/commit/7a9a635))
* **lifecycle:** make detach/attach lifecycle symetric ([7a9a635](https://github.com/aurelia/aurelia/commit/7a9a635))
* **lifecycle:** add flags ([7a9a635](https://github.com/aurelia/aurelia/commit/7a9a635))
* **lifecycle:** overhaul ([7a9a635](https://github.com/aurelia/aurelia/commit/7a9a635))
* **lifecycle:** auto unbind after node removal ([7a9a635](https://github.com/aurelia/aurelia/commit/7a9a635))
* **lifecycle:** introduce lifecycle task ([7a9a635](https://github.com/aurelia/aurelia/commit/7a9a635))
* **template-compiler:** handle semicolon-separated bindings in attributes ([ad6eeb4](https://github.com/aurelia/aurelia/commit/ad6eeb4))
* **jit:** decouple attribute/element parsing from template compiler ([ad6eeb4](https://github.com/aurelia/aurelia/commit/ad6eeb4))
* **template-compiler:** add initial implementation of semantic model ([ad6eeb4](https://github.com/aurelia/aurelia/commit/ad6eeb4))
* **renderer:** throw specific error codes on target/instruction count mismatch ([ad6eeb4](https://github.com/aurelia/aurelia/commit/ad6eeb4))
* **expression-parser:** map empty attribute value to empty string for bound properties ([7a92cd8](https://github.com/aurelia/aurelia/commit/7a92cd8))


### Bug Fixes:

* **subscriber-collection:** remove circular dependency ([c3e3779](https://github.com/aurelia/aurelia/commit/c3e3779))
* **ast:** do not eager initialize pure literals ([7267165](https://github.com/aurelia/aurelia/commit/7267165))
* **ast:** fix a few issues with $kind and define static properties last ([7267165](https://github.com/aurelia/aurelia/commit/7267165))
* **self-binding-behavior:** fix event.path and type defs ([7267165](https://github.com/aurelia/aurelia/commit/7267165))
* **expression-parser:** fix differentation for caching of expressions/interpolations ([1e804a0](https://github.com/aurelia/aurelia/commit/1e804a0))
* **iterator-binding:** correctly compile and render ForOfStatement ([1e804a0](https://github.com/aurelia/aurelia/commit/1e804a0))
* **signaler:** make addSignalListener idempotent ([1e804a0](https://github.com/aurelia/aurelia/commit/1e804a0))
* **kernel:** fix decorated interface ([f67a414](https://github.com/aurelia/aurelia/commit/f67a414))
* **binding:** wrap updatetarget/updatesource so vCurrent BBs work again ([f67a414](https://github.com/aurelia/aurelia/commit/f67a414))
* **expression-parser:** fix differentation for caching of expressions/interpolations ([f67a414](https://github.com/aurelia/aurelia/commit/f67a414))
* **iterator-binding:** correctly compile and render ForOfStatement ([f67a414](https://github.com/aurelia/aurelia/commit/f67a414))
* **SelectObserver:** complete implementation, adjust tests ([ffdf01d](https://github.com/aurelia/aurelia/commit/ffdf01d))
* **SelectObserver:** simplify flow, remove debugger, add test ([ffdf01d](https://github.com/aurelia/aurelia/commit/ffdf01d))
* **debug:** correct / update unparser and debug mode ([197235c](https://github.com/aurelia/aurelia/commit/197235c))
* **expression-parser:** fix parsing error with trailing elision ([197235c](https://github.com/aurelia/aurelia/commit/197235c))
* **expression-parser:** allow AccessThis as the last element of an array ([197235c](https://github.com/aurelia/aurelia/commit/197235c))
* **expression-parser:** allow AccessThis as the condition in a conditional ([197235c](https://github.com/aurelia/aurelia/commit/197235c))
* **expression-parser:** allow AccessThis as left-hand side of binary expressions ([197235c](https://github.com/aurelia/aurelia/commit/197235c))
* **expression-parser:** reset access after parsing non-identifiers ([197235c](https://github.com/aurelia/aurelia/commit/197235c))
* **unparser:** explicitly reconstruct precedence ([197235c](https://github.com/aurelia/aurelia/commit/197235c))
* **repeat:** properly hook into attach/detach lifecycles ([f296d04](https://github.com/aurelia/aurelia/commit/f296d04))
* **repeat:** synchronously bind child views ([f296d04](https://github.com/aurelia/aurelia/commit/f296d04))
* **repeat:** use the correct lifecycle api for attach/detach ([f296d04](https://github.com/aurelia/aurelia/commit/f296d04))
* **lifecycle:** fix task variable shadowing issue ([f296d04](https://github.com/aurelia/aurelia/commit/f296d04))
* **view:** check nextSibling instead of previousSibling in mount() ([f296d04](https://github.com/aurelia/aurelia/commit/f296d04))
* **view:** validate renderLocation and ensure $nodes.lastChild exists on mount ([f296d04](https://github.com/aurelia/aurelia/commit/f296d04))
* **RuntimeCompilationResources:** do not auto register ([5971d36](https://github.com/aurelia/aurelia/commit/5971d36))
* **Observer:** use identity instead of noop ([5971d36](https://github.com/aurelia/aurelia/commit/5971d36))
* **test:** remove .only ([5971d36](https://github.com/aurelia/aurelia/commit/5971d36))
* **CustomElement:** flush at startup ([5971d36](https://github.com/aurelia/aurelia/commit/5971d36))
* **CustomElement:** remove unnecessary flush ([5971d36](https://github.com/aurelia/aurelia/commit/5971d36))
* **Observer:** revert to noop ([5971d36](https://github.com/aurelia/aurelia/commit/5971d36))
* **Renderer:** remove unnecessary checks ([5971d36](https://github.com/aurelia/aurelia/commit/5971d36))
* **lifecycle:** remove unused code ([7a9a635](https://github.com/aurelia/aurelia/commit/7a9a635))
* **lifecycle:** improve types and resolve style issues ([7a9a635](https://github.com/aurelia/aurelia/commit/7a9a635))
* **runtime:** fix template controller tests ([7a9a635](https://github.com/aurelia/aurelia/commit/7a9a635))
* **runtime:** get remaining tests working again ([7a9a635](https://github.com/aurelia/aurelia/commit/7a9a635))
* **template-compiler:** make non-bindable customElement instructions siblings of the element instruction ([ad6eeb4](https://github.com/aurelia/aurelia/commit/ad6eeb4))
* **template-compiler:** properly resolve bindable customElement instructions by the registered attribute name ([ad6eeb4](https://github.com/aurelia/aurelia/commit/ad6eeb4))
* **scope:** add bindingContext to overrideContext ([ad6eeb4](https://github.com/aurelia/aurelia/commit/ad6eeb4))
* **binding:** lazy initialize slotNames based on need ([57c07e8](https://github.com/aurelia/aurelia/commit/57c07e8))
* **observation:** make property-accessor synchronous ([57c07e8](https://github.com/aurelia/aurelia/commit/57c07e8))
* **observation:** keep dom target accessors batched ([57c07e8](https://github.com/aurelia/aurelia/commit/57c07e8))
* **resources:** ensure null is returned for non-existing resources ([7a92cd8](https://github.com/aurelia/aurelia/commit/7a92cd8))
* **template-compiler:** correct a few edge cases in target and bindingMode resolution ([7a92cd8](https://github.com/aurelia/aurelia/commit/7a92cd8))
* **template-compiler:** correct handling of kebab-cased custom attributes ([7a92cd8](https://github.com/aurelia/aurelia/commit/7a92cd8))
* **repeat.for:** add missing instruction properties ([7a92cd8](https://github.com/aurelia/aurelia/commit/7a92cd8))


### Performance Improvements:

* **ast:** predefine keyword literals and AccessThis, and reuse them ([7267165](https://github.com/aurelia/aurelia/commit/7267165))
* **expression-parser:** remove unreachable branch ([f67a414](https://github.com/aurelia/aurelia/commit/f67a414))
* **expression-parser:** use explicit numeric comparisons for bitwise operators ([197235c](https://github.com/aurelia/aurelia/commit/197235c))
* **repeat:** basic utilization for indexMap to reduce unnecessary processing ([f296d04](https://github.com/aurelia/aurelia/commit/f296d04))
* **element-parser:** use PLATFORM.emptyArray where possible and remove redundant property ([ad6eeb4](https://github.com/aurelia/aurelia/commit/ad6eeb4))
* **template-compiler:** convert parseAttribute to class instance with cache ([ad6eeb4](https://github.com/aurelia/aurelia/commit/ad6eeb4))
* **semantic-model:** use PLATFORM.emptyArray when possible ([ad6eeb4](https://github.com/aurelia/aurelia/commit/ad6eeb4))
* **element-parser:** use PLATFORM.emptyArray when possible ([ad6eeb4](https://github.com/aurelia/aurelia/commit/ad6eeb4))
* **template-compiler:** index the inspect/resolve buffers directly instead of destructuring ([7a92cd8](https://github.com/aurelia/aurelia/commit/7a92cd8))


### Refactorings:

* **binding-context:** explicitly model scope, context and observer lookup (#216) ([c3e3779](https://github.com/aurelia/aurelia/commit/c3e3779))
* **binding:** explicitly model scope, override/bindingctx and observerlookup ([c3e3779](https://github.com/aurelia/aurelia/commit/c3e3779))
* **observer-locator:** use direct lookup from bindingContext if available ([c3e3779](https://github.com/aurelia/aurelia/commit/c3e3779))
* **binding:** use more precise types ([7267165](https://github.com/aurelia/aurelia/commit/7267165))
* **ast:** move common properties back to static declaration ([7267165](https://github.com/aurelia/aurelia/commit/7267165))
* **template-compiler:** cleanup/inline instruction classes ([1e804a0](https://github.com/aurelia/aurelia/commit/1e804a0))
* **binding:** cleanup/shuffle some interfaces accordingly ([f67a414](https://github.com/aurelia/aurelia/commit/f67a414))
* **template-compiler:** cleanup/inline instruction classes ([f67a414](https://github.com/aurelia/aurelia/commit/f67a414))
* **view-factory:** use static maxCacheSize property ([eff5bb7](https://github.com/aurelia/aurelia/commit/eff5bb7))
* **SelectObserver:** adjust SelectValueObserver synchronization (#208) ([ffdf01d](https://github.com/aurelia/aurelia/commit/ffdf01d))
* **repeat:** use templateController decorator and clean everything up ([f296d04](https://github.com/aurelia/aurelia/commit/f296d04))
* **lifecycle:** better naming and types for task api ([7a9a635](https://github.com/aurelia/aurelia/commit/7a9a635))
* **jit:** improve parser registration and attribute testing ([ad6eeb4](https://github.com/aurelia/aurelia/commit/ad6eeb4))
* **attribute-parser:** store raw attribute values in syntax ([ad6eeb4](https://github.com/aurelia/aurelia/commit/ad6eeb4))
* **template-compiler:** decouple entrypoint from internal recursion point ([ad6eeb4](https://github.com/aurelia/aurelia/commit/ad6eeb4))
* **template-compiler:** first step to integrate the semantic model ([ad6eeb4](https://github.com/aurelia/aurelia/commit/ad6eeb4))
* **template-compiler:** initial migration steps to semantic model ([ad6eeb4](https://github.com/aurelia/aurelia/commit/ad6eeb4))
* **template-compiler:** more small tweaks, enable a few more tests ([ad6eeb4](https://github.com/aurelia/aurelia/commit/ad6eeb4))
* **template-compiler:** recognize single value attribute as bindable ([ad6eeb4](https://github.com/aurelia/aurelia/commit/ad6eeb4))
* **template-compiler:** fix plain attribute compilation ([ad6eeb4](https://github.com/aurelia/aurelia/commit/ad6eeb4))
* **template-compiler:** fix template controller / repeater compilation ([ad6eeb4](https://github.com/aurelia/aurelia/commit/ad6eeb4))
* **template-compiler:** fix semicolon-separated attribute bindings ([ad6eeb4](https://github.com/aurelia/aurelia/commit/ad6eeb4))
* **template-compiler:** fix let and textNodes ([ad6eeb4](https://github.com/aurelia/aurelia/commit/ad6eeb4))
* **template-compiler:** fix as-element ([ad6eeb4](https://github.com/aurelia/aurelia/commit/ad6eeb4))
* **template-compiler:** fix surrogates ([ad6eeb4](https://github.com/aurelia/aurelia/commit/ad6eeb4))
* **template-compiler:** fix let.dest ([ad6eeb4](https://github.com/aurelia/aurelia/commit/ad6eeb4))
* **template-compiler:** fix as-element / resourceKey ([ad6eeb4](https://github.com/aurelia/aurelia/commit/ad6eeb4))
* **template-compiler:** fix bindable precedence ([ad6eeb4](https://github.com/aurelia/aurelia/commit/ad6eeb4))
* **template-compiler:** fix slots ([ad6eeb4](https://github.com/aurelia/aurelia/commit/ad6eeb4))
* **template-compiler:** fix nested+sibling template controllers and cleanup the api a bit ([ad6eeb4](https://github.com/aurelia/aurelia/commit/ad6eeb4))
* **template-compiler:** fix let ([ad6eeb4](https://github.com/aurelia/aurelia/commit/ad6eeb4))
* **call:** deprecate confusing $event property ([57c07e8](https://github.com/aurelia/aurelia/commit/57c07e8))
* **binding-command:** reuse specific binding command prototype methods on the default binding command ([7a92cd8](https://github.com/aurelia/aurelia/commit/7a92cd8))
* **template-compiler:** destructure with reused object ([7a92cd8](https://github.com/aurelia/aurelia/commit/7a92cd8))

<a name="0.2.0"></a>
# 0.2.0 (2018-09-18)

### Features:

* **create-element:** experimenting with supporting JSX ([66504c8](https://github.com/aurelia/aurelia/commit/66504c8))
* **compose:** incrementally working towards implementation ([66504c8](https://github.com/aurelia/aurelia/commit/66504c8))
* **view:** remove animations apis from view ([66504c8](https://github.com/aurelia/aurelia/commit/66504c8))
* **renderable:** enable dynamically added children ([66504c8](https://github.com/aurelia/aurelia/commit/66504c8))
* **custom-element:** enable better handling of containerless scenarios ([66504c8](https://github.com/aurelia/aurelia/commit/66504c8))
* **compose:** enable composing of loose views ([66504c8](https://github.com/aurelia/aurelia/commit/66504c8))
* **compose:** support rendering more types ([66504c8](https://github.com/aurelia/aurelia/commit/66504c8))
* **createElement:** support text nodes and targeted instructions ([66504c8](https://github.com/aurelia/aurelia/commit/66504c8))
* **di:** recurse through static registrations to find register methods in more edge cases ([6bc2d4d](https://github.com/aurelia/aurelia/commit/6bc2d4d))
* **Let:** let binding (#132) ([c2a8324](https://github.com/aurelia/aurelia/commit/c2a8324))
* **runtime:** Let binding, priorityInstructions ([c2a8324](https://github.com/aurelia/aurelia/commit/c2a8324))
* **jit:** implement instruction-compiler decorator ([1067e03](https://github.com/aurelia/aurelia/commit/1067e03))
* **runtime:** implement render-strategy decorator ([1067e03](https://github.com/aurelia/aurelia/commit/1067e03))
* **JIT:** template compiler ([d584528](https://github.com/aurelia/aurelia/commit/d584528))
* **TemplateCompiler:** surrogate behavior ([d584528](https://github.com/aurelia/aurelia/commit/d584528))
* **kernel:** add fast camelCase and kebabCase functions with caching ([8debe4f](https://github.com/aurelia/aurelia/commit/8debe4f))
* **binding-context:** add helper for creating a basic scope ([5577a53](https://github.com/aurelia/aurelia/commit/5577a53))
* **dbmonster:** make dbmonster aot example work again (#101) ([9e1eb5a](https://github.com/aurelia/aurelia/commit/9e1eb5a))
* **dbmonster:** make dbmonster aot example work again ([9e1eb5a](https://github.com/aurelia/aurelia/commit/9e1eb5a))
* **jit:** move/extend attribute value parsing to the expression parser (#98) ([53864a1](https://github.com/aurelia/aurelia/commit/53864a1))
* **observers:** auto-enable collection observers and make the toggles idempotent ([d6a10b5](https://github.com/aurelia/aurelia/commit/d6a10b5))
* **runtime:** convert with attribute to use render location (#64) ([5830a36](https://github.com/aurelia/aurelia/commit/5830a36))
* **runtime:** convert with attribute to use render location ([5830a36](https://github.com/aurelia/aurelia/commit/5830a36))
* **runtime:** improvements to attribute and element bindable control and common interfaces ([5830a36](https://github.com/aurelia/aurelia/commit/5830a36))
* **templating:** convert replaceable to use render location (#59) ([7d1f8d4](https://github.com/aurelia/aurelia/commit/7d1f8d4))
* **templating:** generalize attribute and element attachable child ([7d1f8d4](https://github.com/aurelia/aurelia/commit/7d1f8d4))
* **templating:** switch replaceable to use render location ([7d1f8d4](https://github.com/aurelia/aurelia/commit/7d1f8d4))
* **binding:** implement ChangeSet (#58) ([144b1c6](https://github.com/aurelia/aurelia/commit/144b1c6))
* **binding:** implement ChangeSet ([144b1c6](https://github.com/aurelia/aurelia/commit/144b1c6))
* **templating:** add the low-level render location abstraction (#57) ([3c9735e](https://github.com/aurelia/aurelia/commit/3c9735e))
* **templating:** add the low-level render location abstraction ([3c9735e](https://github.com/aurelia/aurelia/commit/3c9735e))
* **custom-elements:** define basic abstraction for element projection ([0a17b16](https://github.com/aurelia/aurelia/commit/0a17b16))
* **runtime:** enable getting the custom element behavior... ([0a17b16](https://github.com/aurelia/aurelia/commit/0a17b16))
* **jit:** implement interpolation & iterator (with destructuring) parsing ([8ab2173](https://github.com/aurelia/aurelia/commit/8ab2173))
* **ast:** initial implementation of ForOfStatement for iterating different collection types ([8ab2173](https://github.com/aurelia/aurelia/commit/8ab2173))
* **ast:** add metadata to the AST for ExpressionKind ([8ab2173](https://github.com/aurelia/aurelia/commit/8ab2173))
* **jit:** initial skeleton for customizeable binding commands ([8ab2173](https://github.com/aurelia/aurelia/commit/8ab2173))
* **jit:** simple first implementation for template-compiler ([8ab2173](https://github.com/aurelia/aurelia/commit/8ab2173))


### Bug Fixes:

* **custom-element:** address typo in method check ([66504c8](https://github.com/aurelia/aurelia/commit/66504c8))
* **custom-element:** remove special $child prop ([66504c8](https://github.com/aurelia/aurelia/commit/66504c8))
* **compose:** correct inject metadata ([66504c8](https://github.com/aurelia/aurelia/commit/66504c8))
* **di:** invoke correct method on array strategy resolver ([6bc2d4d](https://github.com/aurelia/aurelia/commit/6bc2d4d))
* **di:** invalidate Object keys to help diagnose invalid design:paramTypes ([6bc2d4d](https://github.com/aurelia/aurelia/commit/6bc2d4d))
* **di:** add a non-any type alternative to the InterfaceSymbol<T> so that container.get() returns correctly typed instances ([6bc2d4d](https://github.com/aurelia/aurelia/commit/6bc2d4d))
* **let:** cleanup ([c2a8324](https://github.com/aurelia/aurelia/commit/c2a8324))
* **template compiler:** slot signal ([c2a8324](https://github.com/aurelia/aurelia/commit/c2a8324))
* **observer-locator:** add collection length back in, fix precedence, add tests (#139) ([581a680](https://github.com/aurelia/aurelia/commit/581a680))
* **observer-locator:** add collection length back in, fix precedence, add tests ([581a680](https://github.com/aurelia/aurelia/commit/581a680))
* **length-observer:** add subscribe method ([581a680](https://github.com/aurelia/aurelia/commit/581a680))
* **runtime-behavior:** pass target flags to getterSetter observer ([cf8390b](https://github.com/aurelia/aurelia/commit/cf8390b))
* **binding:** report flags instead of nonexistent context ([cf8390b](https://github.com/aurelia/aurelia/commit/cf8390b))
* **examples:** correct versions ([1b7c764](https://github.com/aurelia/aurelia/commit/1b7c764))
* **template-compiler:** workaround for DI issue ([1067e03](https://github.com/aurelia/aurelia/commit/1067e03))
* **binding-command:** rename file ([1067e03](https://github.com/aurelia/aurelia/commit/1067e03))
* **binding-command:** pass correct bindingType to parser ([1067e03](https://github.com/aurelia/aurelia/commit/1067e03))
* **observer:** store obj and propertyKey ([d584528](https://github.com/aurelia/aurelia/commit/d584528))
* **template-compiler:** merge camel-kebab changes and reuse platform functions ([d584528](https://github.com/aurelia/aurelia/commit/d584528))
* **template-compiler:** fix slip-up with attribute name ([d584528](https://github.com/aurelia/aurelia/commit/d584528))
* **event-manager:** use spec-compliant composedPath for shadowdom / fix linting ([6381c5b](https://github.com/aurelia/aurelia/commit/6381c5b))
* **event-manager:** fix .delegate and .capture, and add unit tests ([6381c5b](https://github.com/aurelia/aurelia/commit/6381c5b))
* **typings:** export event subscribers ([6381c5b](https://github.com/aurelia/aurelia/commit/6381c5b))
* **event-manager:** export listener tracker to resolve typing issues ([6381c5b](https://github.com/aurelia/aurelia/commit/6381c5b))
* **tsconfig:** correct extends path ([797674f](https://github.com/aurelia/aurelia/commit/797674f))
* **e2e-benchmark:** simplify markers and use setTimeout to include render time ([8a8b619](https://github.com/aurelia/aurelia/commit/8a8b619))
* **binding-resources:** lift register methods ([5577a53](https://github.com/aurelia/aurelia/commit/5577a53))
* **custom-attribute:** life lifecycle methods ([5577a53](https://github.com/aurelia/aurelia/commit/5577a53))
* **custom-element:** lift lifecycle methods ([5577a53](https://github.com/aurelia/aurelia/commit/5577a53))
* **runtime:** convert if/else to use render location (#96) ([22b32b5](https://github.com/aurelia/aurelia/commit/22b32b5))
* **runtime:** convert if/else to use render location ([22b32b5](https://github.com/aurelia/aurelia/commit/22b32b5))
* **if/else:** set default value ([22b32b5](https://github.com/aurelia/aurelia/commit/22b32b5))
* **binding-behavior:** fix BindingModeBehavior ([bb32291](https://github.com/aurelia/aurelia/commit/bb32291))
* **binding-behavior:** fix debounce, add unit tests ([bb32291](https://github.com/aurelia/aurelia/commit/bb32291))
* **repeat:** reuse views when re-binding and allow null observer for non-collection iterables ([9e1eb5a](https://github.com/aurelia/aurelia/commit/9e1eb5a))
* **expression-parser:** use a separate lookup for non-interpolation attribute values ([53864a1](https://github.com/aurelia/aurelia/commit/53864a1))
* **template-compiler:** use the target name instead of full name + fix tests ([53864a1](https://github.com/aurelia/aurelia/commit/53864a1))
* **template-compiler:** add dest to one-time instruction ([1ddff95](https://github.com/aurelia/aurelia/commit/1ddff95))
* **value-attribute-observer:** don't notify subscribers if value hasn't changed (#95) ([30e1099](https://github.com/aurelia/aurelia/commit/30e1099))
* **element-observation:** fix binding flags ([4dc6cb8](https://github.com/aurelia/aurelia/commit/4dc6cb8))
* **checked-observer:** fix fromValue updates / add unit tests ([4dc6cb8](https://github.com/aurelia/aurelia/commit/4dc6cb8))
* **element-observation:** remove error-causing notify ([4dc6cb8](https://github.com/aurelia/aurelia/commit/4dc6cb8))
* **runtime:** remove lazy bindable location and encapsulate observer (#90) ([6607a14](https://github.com/aurelia/aurelia/commit/6607a14))
* **runtime:** remove lazy bindable location and encapsulate observer ([6607a14](https://github.com/aurelia/aurelia/commit/6607a14))
* **event-manager:** use uppercase tagname ([08d4bac](https://github.com/aurelia/aurelia/commit/08d4bac))
* **jit-parcel:** remove else for now, fix instructions ([d6a10b5](https://github.com/aurelia/aurelia/commit/d6a10b5))
* **template-compiler:** wrap the nodes in a fragment ([d6a10b5](https://github.com/aurelia/aurelia/commit/d6a10b5))
* **jit-parcel:** remove path mappings from tsconfig ([d6a10b5](https://github.com/aurelia/aurelia/commit/d6a10b5))
* **template-compiler:** use firstElementChild instead of wrapper ([d6a10b5](https://github.com/aurelia/aurelia/commit/d6a10b5))
* **template-compiler:** various small tweaks and fixes, make example work ([d6a10b5](https://github.com/aurelia/aurelia/commit/d6a10b5))
* **jit-parcel:** make the example work with something simple ([d6a10b5](https://github.com/aurelia/aurelia/commit/d6a10b5))
* **aurelia:** set isStarted=true after tasks have finished ([d6a10b5](https://github.com/aurelia/aurelia/commit/d6a10b5))
* **e2e:** move publish into e2e job ([d6a10b5](https://github.com/aurelia/aurelia/commit/d6a10b5))
* **ci:** fix typo ([d6a10b5](https://github.com/aurelia/aurelia/commit/d6a10b5))
* **ci:** set the correct path before each cmd ([d6a10b5](https://github.com/aurelia/aurelia/commit/d6a10b5))
* **ci:** try a different approach for the workspaces ([d6a10b5](https://github.com/aurelia/aurelia/commit/d6a10b5))
* **runtime:** dry up bindable callback behavior (#71) ([11b26a5](https://github.com/aurelia/aurelia/commit/11b26a5))
* **runtime:** correct observer current value update and callback ordering ([5830a36](https://github.com/aurelia/aurelia/commit/5830a36))
* **runtime:** ensure all bindable callback slots are initialized ([5830a36](https://github.com/aurelia/aurelia/commit/5830a36))
* **runtime-behavior:** remove use of Toggle in favor of simple boolean ([5830a36](https://github.com/aurelia/aurelia/commit/5830a36))
* **dom:** append nodes to the correct thing (doh) (#66) ([c7a8285](https://github.com/aurelia/aurelia/commit/c7a8285))
* **repeat:** adjust repeater logic + tests to new mutation batching mechanism ([c2a5e82](https://github.com/aurelia/aurelia/commit/c2a5e82))
* **runtime:** interface clarity (#61) ([c4e26d3](https://github.com/aurelia/aurelia/commit/c4e26d3))
* **runtime:** correct kernel import ([c4e26d3](https://github.com/aurelia/aurelia/commit/c4e26d3))
* **runtime:** make renderable and view factories interfaces have no default ([c4e26d3](https://github.com/aurelia/aurelia/commit/c4e26d3))
* **observation:** fix subscriber typing ([144b1c6](https://github.com/aurelia/aurelia/commit/144b1c6))
* **dom:** correct TS error ([3c9735e](https://github.com/aurelia/aurelia/commit/3c9735e))
* **templating:** address trivial errors when removing emulation ([0a17b16](https://github.com/aurelia/aurelia/commit/0a17b16))
* **templating:** remove shadow dom from compose element ([0a17b16](https://github.com/aurelia/aurelia/commit/0a17b16))
* **all:** last few corrections from the merge ([0a17b16](https://github.com/aurelia/aurelia/commit/0a17b16))
* **runtime:** various fixes related to compose ([0a17b16](https://github.com/aurelia/aurelia/commit/0a17b16))
* **all:** correct types/properties and fix unit tests ([8ab2173](https://github.com/aurelia/aurelia/commit/8ab2173))
* **template-compiler:** small fixes, setup first simple integration tests ([8ab2173](https://github.com/aurelia/aurelia/commit/8ab2173))
* **kernel:** scripts working ([9302580](https://github.com/aurelia/aurelia/commit/9302580))
* **all:** lots of path fixes and a few typing fixes, make sure everything builds correctly ([9302580](https://github.com/aurelia/aurelia/commit/9302580))
* **test:** make all the tests run via lerna ([9302580](https://github.com/aurelia/aurelia/commit/9302580))


### Performance Improvements:

* **ast:** various small perf tweaks / cleanup redundancies ([acf9ebc](https://github.com/aurelia/aurelia/commit/acf9ebc))
* **ast:** first evaluate, then connect ([acf9ebc](https://github.com/aurelia/aurelia/commit/acf9ebc))
* **binding:** remove unnecessary work / cleanup ([8a8b619](https://github.com/aurelia/aurelia/commit/8a8b619))


### Refactorings:

* **di:** append new resolvers on existing keys to a single array strategy resolver instead of nesting them ([6bc2d4d](https://github.com/aurelia/aurelia/commit/6bc2d4d))
* **Let:** add LetElementInstruction ([c2a8324](https://github.com/aurelia/aurelia/commit/c2a8324))
* **template-compiler:** move stuff around / fix various edge cases (#134) ([5920299](https://github.com/aurelia/aurelia/commit/5920299))
* **template-compiler:** move stuff around / fix various edge cases ([5920299](https://github.com/aurelia/aurelia/commit/5920299))
* **template-compiler:** hoist attribute inspection array / fix tests ([5920299](https://github.com/aurelia/aurelia/commit/5920299))
* **template-compiler:** various fixes and cleanups ([1067e03](https://github.com/aurelia/aurelia/commit/1067e03))
* **template-compiler:** move binding commands to decorators ([1067e03](https://github.com/aurelia/aurelia/commit/1067e03))
* **binding-command:** add handles method ([1067e03](https://github.com/aurelia/aurelia/commit/1067e03))
* **all:** remove viewslot (#123) ([fc9cbff](https://github.com/aurelia/aurelia/commit/fc9cbff))
* **bindable:** use platform.kebabCase ([8debe4f](https://github.com/aurelia/aurelia/commit/8debe4f))
* **ast:** switch while loops to for loops (same perf, more readable) ([acf9ebc](https://github.com/aurelia/aurelia/commit/acf9ebc))
* **binding:** convert subscriber-collection to decorator for sync and async ([8a8b619](https://github.com/aurelia/aurelia/commit/8a8b619))
* **view:** increase cohesion of view code (#111) ([2ccc770](https://github.com/aurelia/aurelia/commit/2ccc770))
* **runtime:** lift resource methods (#107) ([5577a53](https://github.com/aurelia/aurelia/commit/5577a53))
* **if/else:** some internal refactoring ([22b32b5](https://github.com/aurelia/aurelia/commit/22b32b5))
* **if/else:** remove some more duplication ([22b32b5](https://github.com/aurelia/aurelia/commit/22b32b5))
* **parser:** extract template/object/array literal parsing into functions ([53864a1](https://github.com/aurelia/aurelia/commit/53864a1))
* **jit:** move interpolation parsing to the expression parser ([53864a1](https://github.com/aurelia/aurelia/commit/53864a1))
* **expression-parser:** make bindingType mandatory and pass the correct types to the parser everywhere ([53864a1](https://github.com/aurelia/aurelia/commit/53864a1))
* **template-compiler:** make compiler flow a bit more logical ([53864a1](https://github.com/aurelia/aurelia/commit/53864a1))
* **instructions:** change number type to string (#97) ([1ddff95](https://github.com/aurelia/aurelia/commit/1ddff95))
* **instructions:** change number type to string, make const enum ([1ddff95](https://github.com/aurelia/aurelia/commit/1ddff95))
* **binding:** decouple BindingFlags.context from subscribers ([4dc6cb8](https://github.com/aurelia/aurelia/commit/4dc6cb8))
* **binding-flags:** cleanup unused flags ([4dc6cb8](https://github.com/aurelia/aurelia/commit/4dc6cb8))
* **binding-flags:** add fromFlushChanges to reduce batching redundancy, and expand the zeroes ([4dc6cb8](https://github.com/aurelia/aurelia/commit/4dc6cb8))
* **binding-flags:** rename binding-flags ([4dc6cb8](https://github.com/aurelia/aurelia/commit/4dc6cb8))
* **property-observation:** improve parameter naming ([6607a14](https://github.com/aurelia/aurelia/commit/6607a14))
* **dom:** use uppercase tag names (#88) ([08d4bac](https://github.com/aurelia/aurelia/commit/08d4bac))
* **dom:** use uppercase tag names ([08d4bac](https://github.com/aurelia/aurelia/commit/08d4bac))
* **dom:** remove normalizedTagName ([08d4bac](https://github.com/aurelia/aurelia/commit/08d4bac))
* **all:** improving a couple of method names related to resources (#70) ([49484e3](https://github.com/aurelia/aurelia/commit/49484e3))
* **all:** more flags (#69) ([9e29f42](https://github.com/aurelia/aurelia/commit/9e29f42))
* **all:** more flags ([9e29f42](https://github.com/aurelia/aurelia/commit/9e29f42))
* **binding-flags:** rename and add clarifying comments ([9e29f42](https://github.com/aurelia/aurelia/commit/9e29f42))
* **binding-flags:** change context to origin ([9e29f42](https://github.com/aurelia/aurelia/commit/9e29f42))
* **repeater:** use render-location instead of view-slot / general cleanup ([6889328](https://github.com/aurelia/aurelia/commit/6889328))
* **repeater:** first implementation step for ForOfStatement ([6889328](https://github.com/aurelia/aurelia/commit/6889328))
* **binding:** move the responsibility of batching target mutations to the target observers ([c2a5e82](https://github.com/aurelia/aurelia/commit/c2a5e82))
* **observation:** move all element observers to element-observation ([c2a5e82](https://github.com/aurelia/aurelia/commit/c2a5e82))
* **class-observer:** update class-observer to the new mutation batching mechanism ([c2a5e82](https://github.com/aurelia/aurelia/commit/c2a5e82))
* **checked-observer:** update checked-observer to the new mutation batching mechanism ([c2a5e82](https://github.com/aurelia/aurelia/commit/c2a5e82))
* **select-value-observer:** update select-value-observer to the new mutation batching mechanism ([c2a5e82](https://github.com/aurelia/aurelia/commit/c2a5e82))
* **observers:** rename/move target accessors, cleanup typings, fix linting errors ([c2a5e82](https://github.com/aurelia/aurelia/commit/c2a5e82))
* **target-accessors:** remove redundant previousValue ([c2a5e82](https://github.com/aurelia/aurelia/commit/c2a5e82))
* **observers:** move from 'hasChanges' to 'this.oldValue !== currentValue' ([c2a5e82](https://github.com/aurelia/aurelia/commit/c2a5e82))
* **observers:** extract common logic out into a decorator / cleanup select-value-observer ([c2a5e82](https://github.com/aurelia/aurelia/commit/c2a5e82))
* **runtime:** renaming core interfaces for clarity ([c4e26d3](https://github.com/aurelia/aurelia/commit/c4e26d3))
* **runtime:** move test fakes to a shareable location ([7d1f8d4](https://github.com/aurelia/aurelia/commit/7d1f8d4))
* **binding:** use ChangeSet instead of TaskQueue ([144b1c6](https://github.com/aurelia/aurelia/commit/144b1c6))
* **property-observer:** make reusable decorator for setter/observer ([144b1c6](https://github.com/aurelia/aurelia/commit/144b1c6))
* **runtime:** use "render location" terminology throughout ([3c9735e](https://github.com/aurelia/aurelia/commit/3c9735e))
* **all:** remove vCurrent repeater and collection observers (#55) ([70b6696](https://github.com/aurelia/aurelia/commit/70b6696))
* **jit:** merge attribute name/value parsers into template-compiler ([8ab2173](https://github.com/aurelia/aurelia/commit/8ab2173))
* **jit:** use IResourceDescriptions for looking up resources ([8ab2173](https://github.com/aurelia/aurelia/commit/8ab2173))
