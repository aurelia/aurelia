# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

<a name="2.0.0-alpha.22"></a>
# 2.0.0-alpha.22 (2021-10-24)

### Features:

* ***:** destructure map pair ([961f1a6](https://github.com/aurelia/aurelia/commit/961f1a6))
* ***:** parse destructuring assignment ([c0555de](https://github.com/aurelia/aurelia/commit/c0555de))
* ***:** destructuring assignment expr ([d06f7bd](https://github.com/aurelia/aurelia/commit/d06f7bd))
* ***:** rest expr in destructuring assignment ([f4b1652](https://github.com/aurelia/aurelia/commit/f4b1652))
* **runtime:** started destructuring AST ([0b4d579](https://github.com/aurelia/aurelia/commit/0b4d579))


### Bug Fixes:

* ***:** build issues ([1a32a43](https://github.com/aurelia/aurelia/commit/1a32a43))
* ***:** deepscan issue ([582686b](https://github.com/aurelia/aurelia/commit/582686b))
* ***:** linting error ([35e11c8](https://github.com/aurelia/aurelia/commit/35e11c8))

<a name="2.0.0-alpha.21"></a>
# 2.0.0-alpha.21 (2021-09-12)

**Note:** Version bump only for package @aurelia/__tests__

<a name="2.0.0-alpha.20"></a>
# 2.0.0-alpha.20 (2021-09-04)

### Features:

* **au-slot:** work with containerless ([9fa0a06](https://github.com/aurelia/aurelia/commit/9fa0a06))


### Refactorings:

* **au-compose:** move initiator out of change info, add tests for #1299 ([8f2bf0c](https://github.com/aurelia/aurelia/commit/8f2bf0c))

<a name="2.0.0-alpha.19"></a>
# 2.0.0-alpha.19 (2021-08-29)

### Bug Fixes:

* **store-v1:** rename _state to $state, short timeout ([2177b79](https://github.com/aurelia/aurelia/commit/2177b79))
* **store-v1:** adjust decorator tests ([b998863](https://github.com/aurelia/aurelia/commit/b998863))
* **template-compiler:** capture ignore attr command on bindable like props ([0a52fbf](https://github.com/aurelia/aurelia/commit/0a52fbf))
* ***:** export ITemplateCompiler from aurelia package ([0a52fbf](https://github.com/aurelia/aurelia/commit/0a52fbf))


### Refactorings:

* **all:** remove more internal typings ([1ffc38b](https://github.com/aurelia/aurelia/commit/1ffc38b))
* **store-v1:** arrange sut ([d440a26](https://github.com/aurelia/aurelia/commit/d440a26))

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
* **validation:** broken test in node ([809220a](https://github.com/aurelia/aurelia/commit/809220a))
* **validation:** broken tests ([c334bf9](https://github.com/aurelia/aurelia/commit/c334bf9))


### Refactorings:

* **command:** extract CommandType out of ExpressionType ([e24fbed](https://github.com/aurelia/aurelia/commit/e24fbed))
* **all:** rename BindingType -> ExpressionType ([8cf4061](https://github.com/aurelia/aurelia/commit/8cf4061))
* **expr-parser:** simplify BindingType enum ([4c4cbc9](https://github.com/aurelia/aurelia/commit/4c4cbc9))
* **command:** simplify binding type enum ([6651678](https://github.com/aurelia/aurelia/commit/6651678))
* **di:** resolver disposal ([7c50556](https://github.com/aurelia/aurelia/commit/7c50556))
* **validation:** controller-factories ([3ebc6d1](https://github.com/aurelia/aurelia/commit/3ebc6d1))

<a name="2.0.0-alpha.16"></a>
# 2.0.0-alpha.16 (2021-08-07)

### Features:

* **wc:** add web-component plugin ([74589bc](https://github.com/aurelia/aurelia/commit/74589bc))


### Bug Fixes:

* **href:** avoid interfering with native href ([de625d2](https://github.com/aurelia/aurelia/commit/de625d2))


### Refactorings:

* **all:** use a terser name cache for predictable prop mangling ([7649ced](https://github.com/aurelia/aurelia/commit/7649ced))

<a name="2.0.0-alpha.15"></a>
# 2.0.0-alpha.15 (2021-08-01)

### Features:

* **promise:** re-enable promise patterns .resolve/then/catch ([d0fa65c](https://github.com/aurelia/aurelia/commit/d0fa65c))


### Bug Fixes:

* **attr-parser:** avoid mutating non endpoint state ([9996ae4](https://github.com/aurelia/aurelia/commit/9996ae4))


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
* **controller:** rename semi public APIs ([c2ee6e9](https://github.com/aurelia/aurelia/commit/c2ee6e9))

<a name="2.0.0-alpha.13"></a>
# 2.0.0-alpha.13 (2021-07-19)

### Refactorings:

* **enhance:** incorporate reviews, enhance returns raw controller ([5504ad9](https://github.com/aurelia/aurelia/commit/5504ad9))
* **controller:** remove unneeded param from Controller.forCustomElement ([4abb1ee](https://github.com/aurelia/aurelia/commit/4abb1ee))
* **enhance:** make enhance works in a disconnected way ([52c2c1c](https://github.com/aurelia/aurelia/commit/52c2c1c))
* **bindings:** rename observeProperty -> observe, add doc ([fed517f](https://github.com/aurelia/aurelia/commit/fed517f))
* **ast:** simplify AST kind enum ([fed517f](https://github.com/aurelia/aurelia/commit/fed517f))
* ***:** avoid creating blocks ([27dcf0b](https://github.com/aurelia/aurelia/commit/27dcf0b))
* **controller:** remove ctx ctrl requirement from .forCustomElement ([7edcef2](https://github.com/aurelia/aurelia/commit/7edcef2))
* **render-context:** remove render context ([7d38f53](https://github.com/aurelia/aurelia/commit/7d38f53))
* **render-context:** remove all main render-context usages ([efc607a](https://github.com/aurelia/aurelia/commit/efc607a))
* **render-context:** prepare to remove .getViewFactory()/.compile() methods ([db9a9ab](https://github.com/aurelia/aurelia/commit/db9a9ab))
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


### Performance Improvements:

* **rendering:** use definition for attrs & els ([3a26b46](https://github.com/aurelia/aurelia/commit/3a26b46))
* **templating:** avoid retrieving definition unnecessarily ([f0e597f](https://github.com/aurelia/aurelia/commit/f0e597f))
* **templating:** resolved Type for CE instruction ([0b52d11](https://github.com/aurelia/aurelia/commit/0b52d11))


### Refactorings:

* **all:** use container from controller instead of context ([0822330](https://github.com/aurelia/aurelia/commit/0822330))
* **context:** remove IContainer interface impls out of Render/Route context ([18524de](https://github.com/aurelia/aurelia/commit/18524de))
* **router:** distinguish between RouteContext and IContainer ([39169bf](https://github.com/aurelia/aurelia/commit/39169bf))
* **context:** distinguish between render context and its container ([f216e98](https://github.com/aurelia/aurelia/commit/f216e98))

<a name="2.0.0-alpha.10"></a>
# 2.0.0-alpha.10 (2021-07-04)

### Features:

* **template-compiler:** ability to toggle expressions removal ([93272a2](https://github.com/aurelia/aurelia/commit/93272a2))
* **template-compiler:** add hooks decorator support, more integration tests ([dd3698d](https://github.com/aurelia/aurelia/commit/dd3698d))
* **template-compiler:** add beforeCompile hooks ([5e42b76](https://github.com/aurelia/aurelia/commit/5e42b76))
* **di:** add @factory resolver ([3c1bef8](https://github.com/aurelia/aurelia/commit/3c1bef8))
* **au-compose:** add support for composition with containerless on au-compose ([dec8a5a](https://github.com/aurelia/aurelia/commit/dec8a5a))
* **t-compiler:** add ability to recognize containerless attr ([23ec6cd](https://github.com/aurelia/aurelia/commit/23ec6cd))


### Bug Fixes:

* **watch:** construct scope properly for custom attr + expression watch ([cb26b0c](https://github.com/aurelia/aurelia/commit/cb26b0c))
* **scope:** disable host scope on CE controller ([ac0ff15](https://github.com/aurelia/aurelia/commit/ac0ff15))


### Refactorings:

* **di:** no longer tries to instantiate interface ([e757eb6](https://github.com/aurelia/aurelia/commit/e757eb6))
* **templating:** remove blur CA, tweak doc/tests ([1286b3b](https://github.com/aurelia/aurelia/commit/1286b3b))
* **au-slot:** remove unused exports ([58cc0b5](https://github.com/aurelia/aurelia/commit/58cc0b5))

<a name="2.0.0-alpha.9"></a>
# 2.0.0-alpha.9 (2021-06-25)

### Bug Fixes:

* **with:** update bindings scope properly when value change ([906105d](https://github.com/aurelia/aurelia/commit/906105d))
* **let:** camel-case let target when using with interpolation/literal ([bee73cc](https://github.com/aurelia/aurelia/commit/bee73cc))


### Performance Improvements:

* **templating:** inline injectable preparation ([2f0ea95](https://github.com/aurelia/aurelia/commit/2f0ea95))
* **di:** do not create a new factory in .invoke() ([23c0405](https://github.com/aurelia/aurelia/commit/23c0405))
* **di:** minification friendlier di code ([23c0405](https://github.com/aurelia/aurelia/commit/23c0405))


### Refactorings:

* **templating:** change timing of the container of a CE ([23c0405](https://github.com/aurelia/aurelia/commit/23c0405))
* **attr-syntax-transformer:** rename IAttrSyntaxTransformer ([71f5ceb](https://github.com/aurelia/aurelia/commit/71f5ceb))
* **all:** separate value from typing imports ([71f5ceb](https://github.com/aurelia/aurelia/commit/71f5ceb))

<a name="2.0.0-alpha.8"></a>
# 2.0.0-alpha.8 (2021-06-22)

### Features:

* **binding-command:** add a build method, and let binding command have access to more raw information. ([240692d](https://github.com/aurelia/aurelia/commit/240692d))
* **attr-syntax-transformer:** add isTwoWay & map methods. These are lower & purer primitives compared to existing ones, allowing better control in the compilation. ([240692d](https://github.com/aurelia/aurelia/commit/240692d))
* **au-slot:** ability to use au-slot on the same element with a template controller ([240692d](https://github.com/aurelia/aurelia/commit/240692d))


### Refactorings:

* **template-compiler:** remove BindingCommand.prototype.compile ([63dee52](https://github.com/aurelia/aurelia/commit/63dee52))
* **template-compiler:** remove existing TemplateCompiler, remove TemplateBinder ([0ab0cde](https://github.com/aurelia/aurelia/commit/0ab0cde))
* **template-compiler:** merge binder & compiler ([240692d](https://github.com/aurelia/aurelia/commit/240692d))

<a name="2.0.0-alpha.7"></a>
# 2.0.0-alpha.7 (2021-06-20)

### Bug Fixes:

* **router:** ensure href recognize external ([387c084](https://github.com/aurelia/aurelia/commit/387c084))
* **new-instance:** correctly invoke a registered interface ([8753b4e](https://github.com/aurelia/aurelia/commit/8753b4e))
* **s #1166: this commit prepares a test where the most intuitive behavior is show:** ability to invoke an interface without having to declare it, if it has a default registration. Though this is inconsistent with the core, so will have to reconsider ([8753b4e](https://github.com/aurelia/aurelia/commit/8753b4e))
* **di:** disallow resource key override ([f92ac3b](https://github.com/aurelia/aurelia/commit/f92ac3b))


### Refactorings:

* **hydration-compilation:** use an object to carry more than projections information ([39c5497](https://github.com/aurelia/aurelia/commit/39c5497))
* **au-slot:** remove unused exports, fix tests ([aaf81de](https://github.com/aurelia/aurelia/commit/aaf81de))

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

* ***:** broken tests ([17ccba5](https://github.com/aurelia/aurelia/commit/17ccba5))
* **content:** fix content array auto observation ([98f14ef](https://github.com/aurelia/aurelia/commit/98f14ef))


### Refactorings:

* ***:** dropped superfluous props view factory ([9ef9664](https://github.com/aurelia/aurelia/commit/9ef9664))

<a name="2.0.0-alpha.4"></a>
# 2.0.0-alpha.4 (2021-05-25)

### Features:

* **store:** move tests into tests folder ([bd0029b](https://github.com/aurelia/aurelia/commit/bd0029b))


### Bug Fixes:

* **store:** adjusted IConfigure method names ([0ec0728](https://github.com/aurelia/aurelia/commit/0ec0728))
* **store:** connectTo store obtaining API updated ([7f713b3](https://github.com/aurelia/aurelia/commit/7f713b3))
* **store:** inject window via DI; fix redux tests ([5ca4b07](https://github.com/aurelia/aurelia/commit/5ca4b07))
* **store:** decorator afterUnbind ([44225c1](https://github.com/aurelia/aurelia/commit/44225c1))
* **store:** throw on non-history-state for jump ([e795e47](https://github.com/aurelia/aurelia/commit/e795e47))
* **store:** test imports should reference package ([55adcd6](https://github.com/aurelia/aurelia/commit/55adcd6))


### Refactorings:

* **store:** remove unnecessary injection token ([53d12bf](https://github.com/aurelia/aurelia/commit/53d12bf))
* **store:** get rid of Reporter; additional tests ([8ac53c4](https://github.com/aurelia/aurelia/commit/8ac53c4))

<a name="2.0.0-alpha.3"></a>
# 2.0.0-alpha.3 (2021-05-19)

### Features:

* **app-task:** allow app task to be created without a key ([2786898](https://github.com/aurelia/aurelia/commit/2786898))
* **dialog:** add dialog prop, rename controller to dialog, add more doc ([8696093](https://github.com/aurelia/aurelia/commit/8696093))
* **dialog:** ensure inject IDialogController, add test for injection ([9455c7f](https://github.com/aurelia/aurelia/commit/9455c7f))
* **dialog:** more tests, ensure lifecycle invocation ([66e8b10](https://github.com/aurelia/aurelia/commit/66e8b10))
* **dialog:** keyboard handling impl, more tests, tweak doc ([f7099ba](https://github.com/aurelia/aurelia/commit/f7099ba))
* **dialog:** better interfaces/names + tweak tests ([a4c801a](https://github.com/aurelia/aurelia/commit/a4c801a))
* **dialog:** fix linting & deepscan issues ([55d47b1](https://github.com/aurelia/aurelia/commit/55d47b1))
* **dialog:** add more tests ([8bc8191](https://github.com/aurelia/aurelia/commit/8bc8191))
* **dialog:** better messages, reorganise tests ([7425ba1](https://github.com/aurelia/aurelia/commit/7425ba1))
* **dialog:** add tests ([7ca0502](https://github.com/aurelia/aurelia/commit/7ca0502))
* **promise-tc:** initial implementation ([228085b](https://github.com/aurelia/aurelia/commit/228085b))


### Bug Fixes:

* ***:** broken i18n tests ([2da8e72](https://github.com/aurelia/aurelia/commit/2da8e72))
* ***:** broken tests ([eb0effe](https://github.com/aurelia/aurelia/commit/eb0effe))
* **debounce:** respect default delay ([420829c](https://github.com/aurelia/aurelia/commit/420829c))
* **select-observer:** ensure value is fresh when flush ([99e0172](https://github.com/aurelia/aurelia/commit/99e0172))
* ***:** #1114 ([eed272e](https://github.com/aurelia/aurelia/commit/eed272e))
* **lifecycle-hooks:** more convoluted usage tests ([60763e1](https://github.com/aurelia/aurelia/commit/60763e1))
* **lifecycle-hooks:** properly maintain resources semantic ([6bfefcb](https://github.com/aurelia/aurelia/commit/6bfefcb))
* ***:** tests ([c258891](https://github.com/aurelia/aurelia/commit/c258891))
* **observers:** ensure oldValue is correctly updated in flush,with optz ([07bc335](https://github.com/aurelia/aurelia/commit/07bc335))
* ***:** tweak watch decorator tests ([ffb82fe](https://github.com/aurelia/aurelia/commit/ffb82fe))
* ***:** queue the size observer ([0317bce](https://github.com/aurelia/aurelia/commit/0317bce))
* ***:** promise-tc tests ([1fca482](https://github.com/aurelia/aurelia/commit/1fca482))
* **promise-tc:** flaky tests ([43730ef](https://github.com/aurelia/aurelia/commit/43730ef))
* **promise-tc:** node tests ([3801b0b](https://github.com/aurelia/aurelia/commit/3801b0b))
* **promise-tc:** linting error ([ce91832](https://github.com/aurelia/aurelia/commit/ce91832))
* **promise-tc:** activation and deactivation ([54ad4ea](https://github.com/aurelia/aurelia/commit/54ad4ea))


### Refactorings:

* ***:** binding context resolution with bindingmode participation" ([b84813c](https://github.com/aurelia/aurelia/commit/b84813c))
* **app-task:** simplify usage, align with .createInterface ([2786898](https://github.com/aurelia/aurelia/commit/2786898))
* **dialog:** stricter interface, tweak tests, fix deepscan ([53f95a4](https://github.com/aurelia/aurelia/commit/53f95a4))
* ***:** binding context resolution with bindingmode participation ([3abe3f6](https://github.com/aurelia/aurelia/commit/3abe3f6))
* **all:** rename currentValue -> value ([6dc943e](https://github.com/aurelia/aurelia/commit/6dc943e))
* ***:** separate scope for promise ([1d0de63](https://github.com/aurelia/aurelia/commit/1d0de63))
* ***:** add basic tests of multi layer change propagation with VC in between ([0578fa4](https://github.com/aurelia/aurelia/commit/0578fa4))
* ***:** tweak effect test to align with queue behavior ([43da015](https://github.com/aurelia/aurelia/commit/43da015))
* **observation:** temporarily disable mutation in getter test ([20fac68](https://github.com/aurelia/aurelia/commit/20fac68))
* **promise-tc:** then, catch redirections ([7723332](https://github.com/aurelia/aurelia/commit/7723332))
* **promise-tc:** promise.resolve redirection ([1ba35df](https://github.com/aurelia/aurelia/commit/1ba35df))
* **promise-tc:** task queuing + timing tests ([7b2224f](https://github.com/aurelia/aurelia/commit/7b2224f))
* **promise-tc:** task queue ([7abe877](https://github.com/aurelia/aurelia/commit/7abe877))
* **promise-tc:** and test ([1aaf36a](https://github.com/aurelia/aurelia/commit/1aaf36a))

<a name="2.0.0-alpha.2"></a>
# 2.0.0-alpha.2 (2021-03-07)

### Features:

* **di:** add invoke API back ([9892bfc](https://github.com/aurelia/aurelia/commit/9892bfc))


### Bug Fixes:

* **router:** fix direct routing parenthesized parameters ([73f106d](https://github.com/aurelia/aurelia/commit/73f106d))
* **router:** restore au-viewport's fallback property ([4f57cc5](https://github.com/aurelia/aurelia/commit/4f57cc5))
* **router:** fix the au-viewport's default attribute ([25c87a8](https://github.com/aurelia/aurelia/commit/25c87a8))

<a name="2.0.0-alpha.1"></a>
# 2.0.0-alpha.1 (2021-03-03)

**Note:** Version bump only for package @aurelia/__tests__

<a name="2.0.0-alpha.0"></a>
# 2.0.0-alpha.0 (2021-03-02)

### Features:

* ***:** benchmark viz app ([3a21977](https://github.com/aurelia/aurelia/commit/3a21977))
* ***:** input[type=number/date] value as number binding ([d7bc69d](https://github.com/aurelia/aurelia/commit/d7bc69d))
* **r:** interpolation with HTML nodes/elements ([fd14933](https://github.com/aurelia/aurelia/commit/fd14933))
* **text-interpolation:** basic tests, with VC tests ([3d0d9c4](https://github.com/aurelia/aurelia/commit/3d0d9c4))


### Bug Fixes:

* **template-binder:** check if as-element was used ([35284f2](https://github.com/aurelia/aurelia/commit/35284f2))
* **template-binder:** check if as-element was used ([6bc5d40](https://github.com/aurelia/aurelia/commit/6bc5d40))
* **syntax-transformer:** don't transform attr of .class & .style commands ([c07b9d0](https://github.com/aurelia/aurelia/commit/c07b9d0))
* **syntax-transformer): ?? vs ? vs () :dizz:**  ([af12ed7](https://github.com/aurelia/aurelia/commit/af12ed7))
* ***:** tweak compilation tests to match camelization of prop ([c6449ca](https://github.com/aurelia/aurelia/commit/c6449ca))
* **binder-test:** adjust the expected output as interpolation is removed ([2684446](https://github.com/aurelia/aurelia/commit/2684446))
* **translation-binding:** properly queue per target/attribute pair ([9ac40a6](https://github.com/aurelia/aurelia/commit/9ac40a6))
* **i18n:** also queue param updates, fix tests ([ea5875a](https://github.com/aurelia/aurelia/commit/ea5875a))
* ***:** Update packages/__tests__/i18n/t/translation-integration.spec.ts ([7e66afe](https://github.com/aurelia/aurelia/commit/7e66afe))
* **di:** cached callback always returns same ([eb69711](https://github.com/aurelia/aurelia/commit/eb69711))
* **i18n-tests:** fix null/undefined + default value test ([26b900c](https://github.com/aurelia/aurelia/commit/26b900c))
* **translation-binding:** align update behavior during bind, tweak tests ([d189000](https://github.com/aurelia/aurelia/commit/d189000))
* **i18n-tests:** tweak assertion to match fixtures ([effaf50](https://github.com/aurelia/aurelia/commit/effaf50))
* **interpolation-binding:** cleanup old value in unbind ([bdc394c](https://github.com/aurelia/aurelia/commit/bdc394c))
* **router:** querystring ([044bfde](https://github.com/aurelia/aurelia/commit/044bfde))
* **tests:** fix translation tests ([8db92a0](https://github.com/aurelia/aurelia/commit/8db92a0))
* **debounce/throttle:** override queue when source changes ([3c366fd](https://github.com/aurelia/aurelia/commit/3c366fd))
* **di:** cached callback always returns same ([3ba5343](https://github.com/aurelia/aurelia/commit/3ba5343))


### Refactorings:

* ***:** remove left over unused ids ([97fc845](https://github.com/aurelia/aurelia/commit/97fc845))
* **all:** remove .update flags ([3fc1632](https://github.com/aurelia/aurelia/commit/3fc1632))
* **content-binding:** dont remove on unbind, add assertion for post tearDown ([343f790](https://github.com/aurelia/aurelia/commit/343f790))
* **benchmark:** data-service ([f3b0c58](https://github.com/aurelia/aurelia/commit/f3b0c58))
* ***:** update attr binding, throttle/debounce, add tests ([cab73f4](https://github.com/aurelia/aurelia/commit/cab73f4))
* **effect:** rename IEffectRunner -> IObservation r ([de5d272](https://github.com/aurelia/aurelia/commit/de5d272))
* **connectable:** clearer interface for connectable to receive changes ([bec6ed0](https://github.com/aurelia/aurelia/commit/bec6ed0))

<a name="0.9.0"></a>
# 0.9.0 (2021-01-31)

### Features:

* ***:** decorator auSlots wip ([6ddb362](https://github.com/aurelia/aurelia/commit/6ddb362))
* ***:** processContent wip ([cb8a103](https://github.com/aurelia/aurelia/commit/cb8a103))
* **show/hide:** port show & hide attributes from v1 ([8dd9562](https://github.com/aurelia/aurelia/commit/8dd9562))
* **compiler:** preserve 'alias' in the compiled instruction for usage by component instance ([e80a837](https://github.com/aurelia/aurelia/commit/e80a837))
* **plugin-conventions:** rejects usage of <slot> in non-ShadowDOM mode ([0b545f4](https://github.com/aurelia/aurelia/commit/0b545f4))
* **di:** remove DI.createInterface builder ([8146dcc](https://github.com/aurelia/aurelia/commit/8146dcc))
* **route-recognizer:** support path array ([b1ef7f1](https://github.com/aurelia/aurelia/commit/b1ef7f1))
* **kernel:** add inheritParentResources config option ([ce5e17d](https://github.com/aurelia/aurelia/commit/ce5e17d))


### Bug Fixes:

* **route-expression:** fix segment grouping, scoping and serialization ([5acd0ed](https://github.com/aurelia/aurelia/commit/5acd0ed))
* **router:** querystring ([eca9606](https://github.com/aurelia/aurelia/commit/eca9606))
* ***:** broken validation tests ([a051257](https://github.com/aurelia/aurelia/commit/a051257))
* **logger:** fix sink registration ([6f93797](https://github.com/aurelia/aurelia/commit/6f93797))
* **au-slot:** non-strictly-initialized property ([699e7b8](https://github.com/aurelia/aurelia/commit/699e7b8))
* ***:** as-element support for au-slot ([ae233e3](https://github.com/aurelia/aurelia/commit/ae233e3))
* ***:** compilation skipping ([c9f5bda](https://github.com/aurelia/aurelia/commit/c9f5bda))
* ***:** broken test in node ([054f4b3](https://github.com/aurelia/aurelia/commit/054f4b3))
* ***:** linting issue ([fbddf28](https://github.com/aurelia/aurelia/commit/fbddf28))
* ***:** broken tests ([e968b79](https://github.com/aurelia/aurelia/commit/e968b79))
* ***:** order-agnostic processContent decorator ([c3a4bb6](https://github.com/aurelia/aurelia/commit/c3a4bb6))
* **batch:** ensure nested batch not batched in outer ([ae61005](https://github.com/aurelia/aurelia/commit/ae61005))
* **tests:** rename sub flag prop in test ([e4dc092](https://github.com/aurelia/aurelia/commit/e4dc092))
* **accessors:** add index signature ([617c416](https://github.com/aurelia/aurelia/commit/617c416))
* **computed-observer:** ensure getter invoked efficiently ([8b2bcf9](https://github.com/aurelia/aurelia/commit/8b2bcf9))
* **route-recognizer:** cleanup & fix empty path routes ([5edb119](https://github.com/aurelia/aurelia/commit/5edb119))
* **tests:** correct validation controller tests ([2849c99](https://github.com/aurelia/aurelia/commit/2849c99))


### Performance Improvements:

* **controller:** use stack to minimize promise tick overhead ([d861da8](https://github.com/aurelia/aurelia/commit/d861da8))


### Refactorings:

* **router:** renames 'children' to 'routes' ([90b56a2](https://github.com/aurelia/aurelia/commit/90b56a2))
* ***:** au-slot info via DI ([1719669](https://github.com/aurelia/aurelia/commit/1719669))
* **logging:** replace $console config option with ConsoleSink ([4ea5d22](https://github.com/aurelia/aurelia/commit/4ea5d22))
* **all:** rename macroTaskQueue to taskQueue ([87c073d](https://github.com/aurelia/aurelia/commit/87c073d))
* ***:** decorator auSlots ([26e980c](https://github.com/aurelia/aurelia/commit/26e980c))
* ***:** decorator auSlots ([9fbb312](https://github.com/aurelia/aurelia/commit/9fbb312))
* ***:** and more tests for processContent ([893831e](https://github.com/aurelia/aurelia/commit/893831e))
* **test:** inline resources via karma preprocessor ([f74bce9](https://github.com/aurelia/aurelia/commit/f74bce9))
* **all:** rename interfaces, simplify subscriber collection ([1c37183](https://github.com/aurelia/aurelia/commit/1c37183))
* **test:** migrate from webpack to karma native modules ([e3e99f7](https://github.com/aurelia/aurelia/commit/e3e99f7))
* **all:** remove ILifecycle ([d141d8e](https://github.com/aurelia/aurelia/commit/d141d8e))
* **array-obs:** remove ILifecycle from array-obs ([da92d9f](https://github.com/aurelia/aurelia/commit/da92d9f))
* **connectable:** more cryptic, less generic name ([0f303cb](https://github.com/aurelia/aurelia/commit/0f303cb))
* **subscribers:** use a separate record for managing subscribers ([9f9152d](https://github.com/aurelia/aurelia/commit/9f9152d))
* **di:** store factory per container root instead of via metadata ([dbbd8b9](https://github.com/aurelia/aurelia/commit/dbbd8b9))
* **connectable:** make record/cRecord first class, remove other methods ([d0cb810](https://github.com/aurelia/aurelia/commit/d0cb810))
* **connectable:** make observe coll part of IConnectable, updat watchers ([3df866c](https://github.com/aurelia/aurelia/commit/3df866c))
* **all:** remove IBindingTargetAccessor & IBindingTargetObserver interfaces ([d9c27c6](https://github.com/aurelia/aurelia/commit/d9c27c6))
* **subscribers:** shorter internal prop names, add some more comments ([1c6cb2d](https://github.com/aurelia/aurelia/commit/1c6cb2d))
* **router:** rename resolutionStrategy to resolutionMode ([9591c7f](https://github.com/aurelia/aurelia/commit/9591c7f))
* **el-accessor:** merge size & length observersremove task reuse ([3af2d9f](https://github.com/aurelia/aurelia/commit/3af2d9f))
* **router:** rename deferral back to resolutionStrategy ([1b6adf1](https://github.com/aurelia/aurelia/commit/1b6adf1))
* **observer:** ensure length subscription adds array subscription, add tests ([64182ae](https://github.com/aurelia/aurelia/commit/64182ae))
* **obs:** clean up bind from observer, ([3006d3b](https://github.com/aurelia/aurelia/commit/3006d3b))
* **router:** use stack to minimize promise tick overhead + various improvements ([09d2379](https://github.com/aurelia/aurelia/commit/09d2379))
* **if:** cleanup & utilize WorkTracker ([df3a5d5](https://github.com/aurelia/aurelia/commit/df3a5d5))
* **router:** remove guard-hooks option ([054f0a7](https://github.com/aurelia/aurelia/commit/054f0a7))
* **router:** port of PR #845 ([a67d0a2](https://github.com/aurelia/aurelia/commit/a67d0a2))

<a name="0.8.0"></a>
# 0.8.0 (2020-11-30)

### Features:

* **proxy:** ensure not wrapping built in class with special slots ([52d2e39](https://github.com/aurelia/aurelia/commit/52d2e39))
* **watch:** export switcher, add basic tests ([3d9ae50](https://github.com/aurelia/aurelia/commit/3d9ae50))
* **kernel:** add inheritParentResources config option ([b7a07a9](https://github.com/aurelia/aurelia/commit/b7a07a9))
* ***:** allow configurable dirty check for el observation ([5636608](https://github.com/aurelia/aurelia/commit/5636608))
* **watch:** add more coverage, correct array[Symbol.iterator] values ([eb94e63](https://github.com/aurelia/aurelia/commit/eb94e63))
* **watch:** add handler for reverse, add tests for mutation methods ([d51fa9b](https://github.com/aurelia/aurelia/commit/d51fa9b))
* **watch:** add [].includes/.every() ([bf8624e](https://github.com/aurelia/aurelia/commit/bf8624e))
* **watch:** basic tests for computed observation ([ed56551](https://github.com/aurelia/aurelia/commit/ed56551))
* **scheduler:** always await promises for yielding, and rename 'async' to 'suspend' to more accurately represent its purpose ([ad14017](https://github.com/aurelia/aurelia/commit/ad14017))
* **setter:** add notifier ([78c04fb](https://github.com/aurelia/aurelia/commit/78c04fb))
* **observable:** add converter, fix linting issues ([9b7492c](https://github.com/aurelia/aurelia/commit/9b7492c))
* **di:** report InterfaceSymbol friendly name when converted to string ([a66882b](https://github.com/aurelia/aurelia/commit/a66882b))
* **runtime:** add cancel api and properly propagate async errors ([3c05ebe](https://github.com/aurelia/aurelia/commit/3c05ebe))
* **runtime:** add support for automatic partial lifecycle cancellation ([ada5ac7](https://github.com/aurelia/aurelia/commit/ada5ac7))
* **runtime:** await promises returned by 'beforeDetach' and 'afterAttach' ([b6bb2e3](https://github.com/aurelia/aurelia/commit/b6bb2e3))
* **scheduler:** add support for internally awaited async tasks ([da37231](https://github.com/aurelia/aurelia/commit/da37231))
* **di:** add scoped decorator ([1c20d51](https://github.com/aurelia/aurelia/commit/1c20d51))
* **di:** remove jitRegisterInRoot ([d8dd7d8](https://github.com/aurelia/aurelia/commit/d8dd7d8))


### Bug Fixes:

* ***:** build issue with node ([be6462d](https://github.com/aurelia/aurelia/commit/be6462d))
* **style-accessor-for-custom-properties' of http:** //github.com/aurelia/aurelia into fix-style-accessor-for-custom-properties ([e210496](https://github.com/aurelia/aurelia/commit/e210496))
* **tests:** node tests should skip url tests ([53d692f](https://github.com/aurelia/aurelia/commit/53d692f))
* **style-attribute-accessor:** handle prop and url ([89c878a](https://github.com/aurelia/aurelia/commit/89c878a))
* **observer-loc:** new api for overriding accessors ([8af6c46](https://github.com/aurelia/aurelia/commit/8af6c46))
* ***:** tweak tests to adapt the removal of computed deco ([dc6a5bd](https://github.com/aurelia/aurelia/commit/dc6a5bd))
* **tests:** adapt el observation changes ([5660d17](https://github.com/aurelia/aurelia/commit/5660d17))
* ***:** linting issue ([879ad8f](https://github.com/aurelia/aurelia/commit/879ad8f))
* ***:** disabled template controllers on local template surrogate ([62a45b9](https://github.com/aurelia/aurelia/commit/62a45b9))
* **aurelia:** move controller dispose to stop() hook via a flag ([4305a7d](https://github.com/aurelia/aurelia/commit/4305a7d))
* ***:** post-merge build error ([951682f](https://github.com/aurelia/aurelia/commit/951682f))
* **event-manager:** properly handle delegate events with shadowDOM / cleanup ([b79e7ba](https://github.com/aurelia/aurelia/commit/b79e7ba))
* **switch:** disallowed multiple default-case ([e92c316](https://github.com/aurelia/aurelia/commit/e92c316))
* **tests:** remove .only, correct assertion ([cd3c047](https://github.com/aurelia/aurelia/commit/cd3c047))
* **tests:** forgot to use vc in 2 way binding ([3c4c68b](https://github.com/aurelia/aurelia/commit/3c4c68b))
* ***:** i18n integration tests ([44b0ba7](https://github.com/aurelia/aurelia/commit/44b0ba7))
* **router:** restore router tests ([80dccfa](https://github.com/aurelia/aurelia/commit/80dccfa))
* **controller:** fix a few cancellation-related slip ups, add more tests ([472d0ae](https://github.com/aurelia/aurelia/commit/472d0ae))
* ***:** failing tests ([95414bd](https://github.com/aurelia/aurelia/commit/95414bd))
* **di-getall:** handle search ancestors in a different path, add failing tests ([edc4ba3](https://github.com/aurelia/aurelia/commit/edc4ba3))
* **switch:** view holding and attaching ([4934627](https://github.com/aurelia/aurelia/commit/4934627))
* **switch:** holding view for fall-through ([632334a](https://github.com/aurelia/aurelia/commit/632334a))
* **switch:** failing test + another test ([d2a5fb3](https://github.com/aurelia/aurelia/commit/d2a5fb3))
* **switch:** binding for `case`s ([8f04746](https://github.com/aurelia/aurelia/commit/8f04746))
* ***:** tweak tests back to previous stage ([2a11245](https://github.com/aurelia/aurelia/commit/2a11245))
* **i18n:** failing tests in ci ([c8cb555](https://github.com/aurelia/aurelia/commit/c8cb555))
* ***:** linting issues ([5718999](https://github.com/aurelia/aurelia/commit/5718999))
* ***:** deepscap issues ([e35e20e](https://github.com/aurelia/aurelia/commit/e35e20e))
* ***:** i18n df tests as per Vildan's suggestion ([62a9ad8](https://github.com/aurelia/aurelia/commit/62a9ad8))
* ***:** template-compiler - au-slot tests ([1f00af5](https://github.com/aurelia/aurelia/commit/1f00af5))
* ***:** template-binder.au-slot tests ([87fa00b](https://github.com/aurelia/aurelia/commit/87fa00b))
* **validation:** au-slot integration tests ([12c80ae](https://github.com/aurelia/aurelia/commit/12c80ae))
* **au-slot:** projection plumbing ([dd7f8b4](https://github.com/aurelia/aurelia/commit/dd7f8b4))
* ***:** broken tests ([3a73602](https://github.com/aurelia/aurelia/commit/3a73602))
* **runtime:** broken tests ([1d11be7](https://github.com/aurelia/aurelia/commit/1d11be7))
* **jit-html:** avoided kebab-casing for bindable instructions for local template ([e7b8ed0](https://github.com/aurelia/aurelia/commit/e7b8ed0))
* **jit-html:** tests for local template ([68a181b](https://github.com/aurelia/aurelia/commit/68a181b))
* ***:** deepscan issue ([2e3f814](https://github.com/aurelia/aurelia/commit/2e3f814))


### Performance Improvements:

* **controller:** use stack to minimize promise tick overhead ([2cac413](https://github.com/aurelia/aurelia/commit/2cac413))
* **task-queue:** use numeric status ([49d9156](https://github.com/aurelia/aurelia/commit/49d9156))


### Refactorings:

* ***:** remove commented code, fix linting issues ([40f73d8](https://github.com/aurelia/aurelia/commit/40f73d8))
* ***:** fix build issues ([2ffbd3f](https://github.com/aurelia/aurelia/commit/2ffbd3f))
* ***:** timing for binding state of controller ([4eb09f7](https://github.com/aurelia/aurelia/commit/4eb09f7))
* **attr-syntax-transformer:** adapt code review merge, make interpret independent again ([1e09e9c](https://github.com/aurelia/aurelia/commit/1e09e9c))
* **collection:** make lifecycle optionial, more type imports re-org ([9f8b189](https://github.com/aurelia/aurelia/commit/9f8b189))
* **tests:** adapt runtime flags removal ([064deba](https://github.com/aurelia/aurelia/commit/064deba))
* **computed-observer:** correctly call subscribers when set ([8497f38](https://github.com/aurelia/aurelia/commit/8497f38))
* **dom:** give INode, IEventTarget and IRenderLocation overrideable generic types ([e2ac8b2](https://github.com/aurelia/aurelia/commit/e2ac8b2))
* **testing:** improve/simplify shadow-piercing text assert ([bdba8ba](https://github.com/aurelia/aurelia/commit/bdba8ba))
* ***:** remove persistent flags ([ffba588](https://github.com/aurelia/aurelia/commit/ffba588))
* **all:** add .js extensions for native esm compat ([0308e2e](https://github.com/aurelia/aurelia/commit/0308e2e))
* **module-loader:** cache per transform function ([3c90743](https://github.com/aurelia/aurelia/commit/3c90743))
* **el-observation:** tweak imports ([31886ef](https://github.com/aurelia/aurelia/commit/31886ef))
* **module-analyzer:** rename, cleanup, add tests ([1d3c8bf](https://github.com/aurelia/aurelia/commit/1d3c8bf))
* ***:** remove all ast.connect() ([54b4718](https://github.com/aurelia/aurelia/commit/54b4718))
* **observation:** simplified el observers/accessors more ([e818e2f](https://github.com/aurelia/aurelia/commit/e818e2f))
* **checked-observer:** make non-layout ([b75d6a8](https://github.com/aurelia/aurelia/commit/b75d6a8))
* **accessors:** more static accessors ([6d83921](https://github.com/aurelia/aurelia/commit/6d83921))
* **select-observer:** remove dedundant handler/methods, add more mutation test ([28c5fe2](https://github.com/aurelia/aurelia/commit/28c5fe2))
* **all:** rename noTargetQueue flag, remove infrequent mutationtc ([edfd2a4](https://github.com/aurelia/aurelia/commit/edfd2a4))
* **controller:** remove bindingContext property ([3cb6a32](https://github.com/aurelia/aurelia/commit/3cb6a32))
* **styles:** move style related stuff to single file ([80a6381](https://github.com/aurelia/aurelia/commit/80a6381))
* **controller:** remove projector abstraction & rework attaching ([d69d03d](https://github.com/aurelia/aurelia/commit/d69d03d))
* **projector-locator:** merge into controller ([2577af5](https://github.com/aurelia/aurelia/commit/2577af5))
* **all:** remove strategy configuration ([0ae57c0](https://github.com/aurelia/aurelia/commit/0ae57c0))
* **tests:** remove binding strategy test vector ([328f754](https://github.com/aurelia/aurelia/commit/328f754))
* ***:** remove references to proxy strategy & proxy observer ([b1dfe93](https://github.com/aurelia/aurelia/commit/b1dfe93))
* **templating:** remove hooks from CE definition ([dcd2762](https://github.com/aurelia/aurelia/commit/dcd2762))
* **templating:** remove ResourceModel ([e4f2042](https://github.com/aurelia/aurelia/commit/e4f2042))
* **all:** rename beforeUnbind to unbinding ([17a82ed](https://github.com/aurelia/aurelia/commit/17a82ed))
* **all:** rename beforeDetach to detaching ([0fcb64d](https://github.com/aurelia/aurelia/commit/0fcb64d))
* **all:** rename afterAttach to attaching ([0178027](https://github.com/aurelia/aurelia/commit/0178027))
* **all:** rename afterAttachChildren to attached ([9e6e97e](https://github.com/aurelia/aurelia/commit/9e6e97e))
* **all:** rename afterBind to bound ([696f5d4](https://github.com/aurelia/aurelia/commit/696f5d4))
* **all:** rename beforeBind to binding ([67b1c5d](https://github.com/aurelia/aurelia/commit/67b1c5d))
* **runtime-html:** rename InstructionComposer to Renderer and remove Composer abstraction ([6499d31](https://github.com/aurelia/aurelia/commit/6499d31))
* **all:** rename CompositionContext back to RenderContext again ([1d7673b](https://github.com/aurelia/aurelia/commit/1d7673b))
* **controller:** rename afterCompose to created ([02e9412](https://github.com/aurelia/aurelia/commit/02e9412))
* **controller:** rename beforeComposeChildren to hydrated ([041a2ff](https://github.com/aurelia/aurelia/commit/041a2ff))
* **controller:** rename beforeCompose to hydrating ([64b405e](https://github.com/aurelia/aurelia/commit/64b405e))
* **all:** remove afterUnbind and afterUnbindChildren, and make deactivate bottom-up ([a431fdc](https://github.com/aurelia/aurelia/commit/a431fdc))
* **controller:** peel out cancellation for now ([bbf6c92](https://github.com/aurelia/aurelia/commit/bbf6c92))
* **all:** simplify update flags ([5c2cc3a](https://github.com/aurelia/aurelia/commit/5c2cc3a))
* **all:** rename RuntimeHtmlConfiguration to StandardConfiguration ([665f3ba](https://github.com/aurelia/aurelia/commit/665f3ba))
* **all:** move scheduler implementation to platform ([e22285a](https://github.com/aurelia/aurelia/commit/e22285a))
* **scheduler:** remove microtask priority ([c95b7f6](https://github.com/aurelia/aurelia/commit/c95b7f6))
* **all:** remove IDOM, HTMLDOM and DOM; replace DOM with PLATFORM ([6447468](https://github.com/aurelia/aurelia/commit/6447468))
* **plugin-svg:** cleanup and move to runtime-html as a registration ([55a3938](https://github.com/aurelia/aurelia/commit/55a3938))
* **all:** move html-specific stuff from runtime to runtime-html and remove Node generics ([c745963](https://github.com/aurelia/aurelia/commit/c745963))
* **all:** remove debug package ([a1bdb60](https://github.com/aurelia/aurelia/commit/a1bdb60))
* **all:** remove PLATFORM global ([fdef656](https://github.com/aurelia/aurelia/commit/fdef656))
* **test:** cleanup setup code and add basic instrumentation ([9f009e3](https://github.com/aurelia/aurelia/commit/9f009e3))
* **platform:** remove isBrowserLike and run browser-specific tests in node ([2ce90dd](https://github.com/aurelia/aurelia/commit/2ce90dd))
* **platform:** remove isNodeLike ([ef19903](https://github.com/aurelia/aurelia/commit/ef19903))
* **dom:** remove setAttribute ([5cd8905](https://github.com/aurelia/aurelia/commit/5cd8905))
* **dom:** remove removeEventListener ([1179737](https://github.com/aurelia/aurelia/commit/1179737))
* **dom:** remove addEventListener ([706a833](https://github.com/aurelia/aurelia/commit/706a833))
* **event-manager:** rename EventManager to EventDelegator ([9150bb4](https://github.com/aurelia/aurelia/commit/9150bb4))
* ***:** tweak tests ([cf44170](https://github.com/aurelia/aurelia/commit/cf44170))
* **runtime:** rename afterCompileChildren to afterCompose ([d8d940a](https://github.com/aurelia/aurelia/commit/d8d940a))
* **runtime:** rename afterCompose to beforeComposeChildren ([f65bb7b](https://github.com/aurelia/aurelia/commit/f65bb7b))
* **runtime:** rename beforeCompile to beforeCompose ([570a9ab](https://github.com/aurelia/aurelia/commit/570a9ab))
* **runtime:** rename create to define ([d2d9cba](https://github.com/aurelia/aurelia/commit/d2d9cba))
* **watch:** create watcher at start of  hydration, add tests for expression ([48dd4e9](https://github.com/aurelia/aurelia/commit/48dd4e9))
* **all:** simplify DOM initialization, remove DOMInitializer ([ff13185](https://github.com/aurelia/aurelia/commit/ff13185))
* **runtime:** move Aurelia from runtime to runtime-html ([d56c4ca](https://github.com/aurelia/aurelia/commit/d56c4ca))
* **instructions:** rename hydrate to compose ([2ab10b3](https://github.com/aurelia/aurelia/commit/2ab10b3))
* **all:** shorten TargetedInstruction to Instruction ([a7e61c6](https://github.com/aurelia/aurelia/commit/a7e61c6))
* **all:** shorten TargetedInstructionType to InstructionType ([7fe8d04](https://github.com/aurelia/aurelia/commit/7fe8d04))
* **all:** finish renaming render to compose ([ede127b](https://github.com/aurelia/aurelia/commit/ede127b))
* **all:** rename render to compose ([2d11d9e](https://github.com/aurelia/aurelia/commit/2d11d9e))
* **runtime:** move rendering, binding commands, attr patterns and instructions to runtime-html ([bc010f5](https://github.com/aurelia/aurelia/commit/bc010f5))
* **all:** rename renderer to composer ([c1a0f3c](https://github.com/aurelia/aurelia/commit/c1a0f3c))
* **all:** rename Hydrator to ExpressionHydrator ([71e2e6f](https://github.com/aurelia/aurelia/commit/71e2e6f))
* **interpolation' of http:** //github.com/aurelia/aurelia into feat/watch-decorator ([05e4152](https://github.com/aurelia/aurelia/commit/05e4152))
* **runtime:** remove ILifecycleTask ([69f5fac](https://github.com/aurelia/aurelia/commit/69f5fac))
* **runtime:** properly wireup root controller compilation hooks with apptasks & cleanup ([6a1f32f](https://github.com/aurelia/aurelia/commit/6a1f32f))
* **runtime:** add ICompositionRoot and IAurelia interfaces and pass container+root into controllers ([23477a3](https://github.com/aurelia/aurelia/commit/23477a3))
* **all:** simplify Aurelia#start/stop & AppTask#run, returning promise instead of task ([6c7608d](https://github.com/aurelia/aurelia/commit/6c7608d))
* **all:** rename StartTask to AppTask ([e76ae41](https://github.com/aurelia/aurelia/commit/e76ae41))
* **scheduler:** remove idleTaskQueue ([34da902](https://github.com/aurelia/aurelia/commit/34da902))
* **scope:** remove IScope interface and use import type where possible for Scope ([6b8eb5f](https://github.com/aurelia/aurelia/commit/6b8eb5f))
* **ast:** remove pointless guards and cleanup tests ([fdc9d9f](https://github.com/aurelia/aurelia/commit/fdc9d9f))
* ***:** removed linktype in favor of link cb ([5af8498](https://github.com/aurelia/aurelia/commit/5af8498))
* **tests:** ensure .evaluate() is called with null ([2605e75](https://github.com/aurelia/aurelia/commit/2605e75))
* **switch:** promise queuing, test correction ([78fd733](https://github.com/aurelia/aurelia/commit/78fd733))
* **observable:** sync naming with bindable ([3e05441](https://github.com/aurelia/aurelia/commit/3e05441))
* **start-task:** rename StartTask to AppTask ([b52fc9c](https://github.com/aurelia/aurelia/commit/b52fc9c))
* **router:** use afterDeactivate hook for stopping ([3683586](https://github.com/aurelia/aurelia/commit/3683586))
* **lifecycle-task:** rename beforeRender to beforeCompile ([970e68a](https://github.com/aurelia/aurelia/commit/970e68a))
* **ast:** remove unused stuff ([d2ecf5e](https://github.com/aurelia/aurelia/commit/d2ecf5e))
* **all:** remove AST interfaces ([7e04d83](https://github.com/aurelia/aurelia/commit/7e04d83))
* **switch:** partial fix after merging master ([1bc2624](https://github.com/aurelia/aurelia/commit/1bc2624))
* **all:** merge jit-html into runtime-html and remove jit-html-* packages ([f530bcf](https://github.com/aurelia/aurelia/commit/f530bcf))
* **all:** merge jit into runtime and remove jit package + references ([d7b626b](https://github.com/aurelia/aurelia/commit/d7b626b))
* **jit:** move expression parser to runtime ([709a56a](https://github.com/aurelia/aurelia/commit/709a56a))
* ***:** template controller link type ([1bd39ef](https://github.com/aurelia/aurelia/commit/1bd39ef))
* **switch:** view de/attach ([1c4cd39](https://github.com/aurelia/aurelia/commit/1c4cd39))
* **router:** fix viewport scope (unfinished) ([157683a](https://github.com/aurelia/aurelia/commit/157683a))
* **router:** replace bind+attach with activate ([19012ae](https://github.com/aurelia/aurelia/commit/19012ae))
* **router:** replace INavigatorInstruction with Navigation ([081b602](https://github.com/aurelia/aurelia/commit/081b602))
* **switch:** active case change handling ([4830f18](https://github.com/aurelia/aurelia/commit/4830f18))
* **runtime:** cleanup unused flags ([77a930e](https://github.com/aurelia/aurelia/commit/77a930e))
* **runtime:** merge controller api bind+attach into activate, detach+unbind into deactivate, and remove ILifecycleTask usage from controller ([15f3885](https://github.com/aurelia/aurelia/commit/15f3885))
* **lifecycles:** pass down first + parent controller in the 'before' hooks and use that as the queue instead of ILifecycle ([031b7fd](https://github.com/aurelia/aurelia/commit/031b7fd))
* **runtime:** rename 'caching' to 'dispose' and hook cache/dispose logic up to unbind based on isReleased flag ([e346ed4](https://github.com/aurelia/aurelia/commit/e346ed4))
* **controller:** rename 'hold' to 'setLocation' ([eb43d9e](https://github.com/aurelia/aurelia/commit/eb43d9e))
* **all:** remove State enum and use simple booleans instead ([762d3c7](https://github.com/aurelia/aurelia/commit/762d3c7))
* **event-aggregator:** fix types ([6b89325](https://github.com/aurelia/aurelia/commit/6b89325))
* **all:** rename afterDetach to afterDetachChildren ([080a724](https://github.com/aurelia/aurelia/commit/080a724))
* **all:** rename afterUnbind to afterUnbindChildren ([09f1972](https://github.com/aurelia/aurelia/commit/09f1972))
* **all:** rename afterAttach to afterAttachChildren ([02b573e](https://github.com/aurelia/aurelia/commit/02b573e))
* **all:** rename afterBind to afterBindChildren ([bf0d79e](https://github.com/aurelia/aurelia/commit/bf0d79e))
* **di:** rename requester -> requestor, remove .only ([686f400](https://github.com/aurelia/aurelia/commit/686f400))
* **di:** clean up linting issues, move stuff closer each other ([3785abb](https://github.com/aurelia/aurelia/commit/3785abb))
* **tests:** ensure all are run with scheduler isolation ([abf5eea](https://github.com/aurelia/aurelia/commit/abf5eea))
* **tests:** ignore replaceable tests ([281e9a4](https://github.com/aurelia/aurelia/commit/281e9a4))
* **tests:** ensure scheduler errors are detected & isolated ([938bc55](https://github.com/aurelia/aurelia/commit/938bc55))
* **html-observers:** remove unused code/commented code ([ae111f3](https://github.com/aurelia/aurelia/commit/ae111f3))
* **bindings:** queue with preempt in handle change ([5ae18a7](https://github.com/aurelia/aurelia/commit/5ae18a7))
* ***:** more tests flush revert, linting issues ([f3fdfc9](https://github.com/aurelia/aurelia/commit/f3fdfc9))
* **bindings:** treat changes during bind differently ([cf65629](https://github.com/aurelia/aurelia/commit/cf65629))
* ***:** adapt self bb tests to prop binding changes ([420ccc9](https://github.com/aurelia/aurelia/commit/420ccc9))
* **au-slot:** stricter binding rule ([eee5c92](https://github.com/aurelia/aurelia/commit/eee5c92))
* ***:** host scope & AST ([9067a2c](https://github.com/aurelia/aurelia/commit/9067a2c))
* ***:** generated tests ([c29e413](https://github.com/aurelia/aurelia/commit/c29e413))
* **jit-html:** restrictions for localTemplate ([bb20c7a](https://github.com/aurelia/aurelia/commit/bb20c7a))
* ***:** encapsulated enhance in ce-definition ([ffd831e](https://github.com/aurelia/aurelia/commit/ffd831e))
* **logging:** minor improvements ([71e601b](https://github.com/aurelia/aurelia/commit/71e601b))

<a name="0.7.0"></a>
# 0.7.0 (2020-05-08)

### Features:

* **di:** allow configuration of Container ([a3e5319](https://github.com/aurelia/aurelia/commit/a3e5319))
* **@lazy:** stop lazy caching, let container control lifecycle ([bfb7391](https://github.com/aurelia/aurelia/commit/bfb7391))
* ***:** add caching for callbacks ([b5086ad](https://github.com/aurelia/aurelia/commit/b5086ad))
* **validation:** new changeOrEvent behavior ([d7e33dc](https://github.com/aurelia/aurelia/commit/d7e33dc))
* **validation:** customizable container template ([16a9e2a](https://github.com/aurelia/aurelia/commit/16a9e2a))
* **plugin-conventions:** support customized element name in customElement ([ed51357](https://github.com/aurelia/aurelia/commit/ed51357))
* ***:** support binding for Set/Map for CheckedObserver ([7b0dc48](https://github.com/aurelia/aurelia/commit/7b0dc48))
* **validation:** condtionals support in hydration ([1be45de](https://github.com/aurelia/aurelia/commit/1be45de))
* **validation:** adding model based validation ([994cbee](https://github.com/aurelia/aurelia/commit/994cbee))
* **validation:** draft#1 of ModelBased validation ([0c5c130](https://github.com/aurelia/aurelia/commit/0c5c130))
* **validation:** fallback to rules for class ([36053b1](https://github.com/aurelia/aurelia/commit/36053b1))
* **validation:** fallback to rules for class ([38f1189](https://github.com/aurelia/aurelia/commit/38f1189))
* **validation:** rule-property deserialization ([4bf1ff7](https://github.com/aurelia/aurelia/commit/4bf1ff7))
* **validation:** started deserialization support ([4296f9d](https://github.com/aurelia/aurelia/commit/4296f9d))
* **validation:** serialization support ([a14fb0a](https://github.com/aurelia/aurelia/commit/a14fb0a))
* ***:** AST hydration ([92125d6](https://github.com/aurelia/aurelia/commit/92125d6))
* **validation-i18n:** default ns, prefix ([78ba301](https://github.com/aurelia/aurelia/commit/78ba301))
* **validation-i18n:** i18n support for validation ([767855e](https://github.com/aurelia/aurelia/commit/767855e))
* **validation:** presenter subscriber service ([9d8d897](https://github.com/aurelia/aurelia/commit/9d8d897))
* **validation:** tagged rules and objects ([5326488](https://github.com/aurelia/aurelia/commit/5326488))
* **validation:** integration with binding behavior ([bd42bc3](https://github.com/aurelia/aurelia/commit/bd42bc3))
* **custom-attr:** add more no multi-bindings tests ([978dbe8](https://github.com/aurelia/aurelia/commit/978dbe8))
* **custom-attr:** add no multi bindings cfg ([4daa950](https://github.com/aurelia/aurelia/commit/4daa950))
* **array-index-observer:** add select/checkbox tests ([4237825](https://github.com/aurelia/aurelia/commit/4237825))
* **index-observation:** more tests ([9883842](https://github.com/aurelia/aurelia/commit/9883842))
* **observation:** tests for observing array idx ([3e3c961](https://github.com/aurelia/aurelia/commit/3e3c961))
* **validation:** overwritting default messages ([d084946](https://github.com/aurelia/aurelia/commit/d084946))
* **validation:** @validationRule deco ([f8caa30](https://github.com/aurelia/aurelia/commit/f8caa30))
* **validation:** metadata annotation for rules + type defn fix ([7e6569b](https://github.com/aurelia/aurelia/commit/7e6569b))
* **aot:** add some basic stack tracing ([9ead836](https://github.com/aurelia/aurelia/commit/9ead836))
* **ast:** add timeout guard ([9226425](https://github.com/aurelia/aurelia/commit/9226425))
* **aot:** implement and propagate isAbrupt semantics ([b67d13e](https://github.com/aurelia/aurelia/commit/b67d13e))
* **router:** add route configuration (temp commit) ([c497245](https://github.com/aurelia/aurelia/commit/c497245))
* **router:** add route configuration (temp commit) ([28ea406](https://github.com/aurelia/aurelia/commit/28ea406))
* **aot:** typeof operator (expr) implementation ([8070e66](https://github.com/aurelia/aurelia/commit/8070e66))
* **aot:** void and new RS impl ([a12097b](https://github.com/aurelia/aurelia/commit/a12097b))
* **aot:** add ServiceHost api / reorganize stuff ([b0d0590](https://github.com/aurelia/aurelia/commit/b0d0590))
* **aot:** implementation ThrowStatement#Evaluate ([334ac4f](https://github.com/aurelia/aurelia/commit/334ac4f))
* **ast:** implement ArgumentListEvaluation ([f344146](https://github.com/aurelia/aurelia/commit/f344146))
* **ast:** implement EvaluateModule ([91b0443](https://github.com/aurelia/aurelia/commit/91b0443))


### Bug Fixes:

* **validation:** optional IValidationController ([5a5114b](https://github.com/aurelia/aurelia/commit/5a5114b))
* **di:** improve error checking for DI.createInterface() ([2c73033](https://github.com/aurelia/aurelia/commit/2c73033))
* ***:** don't jitRegister intrinsic types. resolves #840 ([4f5d7e8](https://github.com/aurelia/aurelia/commit/4f5d7e8))
* **listener:** fix listener binding to work with interceptors (e.g. debounce) ([4dedf7e](https://github.com/aurelia/aurelia/commit/4dedf7e))
* **i18n:** i18next plugin type correction ([af078d2](https://github.com/aurelia/aurelia/commit/af078d2))
* **validation:** addError-revalidateError bug ([61c6f44](https://github.com/aurelia/aurelia/commit/61c6f44))
* **validation:** prop parsing with istanbul instr ([d5123df](https://github.com/aurelia/aurelia/commit/d5123df))
* **validation:** subscription to validate event ([f4bb10d](https://github.com/aurelia/aurelia/commit/f4bb10d))
* **validation-html:** controller injection ([800516e](https://github.com/aurelia/aurelia/commit/800516e))
* ***:** validation controller factory fix ([e2e5da4](https://github.com/aurelia/aurelia/commit/e2e5da4))
* **runtime+html:** tests" ([533b59a](https://github.com/aurelia/aurelia/commit/533b59a))
* **debug:** skipped escaping ' for serialization ([dc7437a](https://github.com/aurelia/aurelia/commit/dc7437a))
* **i18n:** support for null/undefined key exprs ([3375563](https://github.com/aurelia/aurelia/commit/3375563))
* **i18n:** bypassed tests for february ([9e1c2ae](https://github.com/aurelia/aurelia/commit/9e1c2ae))
* **validation:** deepscan issues ([0f72686](https://github.com/aurelia/aurelia/commit/0f72686))
* **validation:** fixed the property parsing ([f6af7f2](https://github.com/aurelia/aurelia/commit/f6af7f2))
* **bindable-observer:** ensure initial value is valid ([6255b03](https://github.com/aurelia/aurelia/commit/6255b03))
* **validation:** validationRules#on 1+ objects ([bb65039](https://github.com/aurelia/aurelia/commit/bb65039))
* ***:** update conventions to use latest shadowCSS and cssModules ([bcbbe77](https://github.com/aurelia/aurelia/commit/bcbbe77))
* **is-arry-index:** properly check for 0 vs 0xx ([400ff0d](https://github.com/aurelia/aurelia/commit/400ff0d))
* **tests:** fix tests for array keyed observation ([2a89eae](https://github.com/aurelia/aurelia/commit/2a89eae))
* **lint:** fix deep scan issues ([601bbfc](https://github.com/aurelia/aurelia/commit/601bbfc))
* **computed:** commented out unexpected volatile/static computed behavior ([e67b4fa](https://github.com/aurelia/aurelia/commit/e67b4fa))
* **computed:** add test for setter/getter pair ([41b1ec7](https://github.com/aurelia/aurelia/commit/41b1ec7))
* **computed:** observer collection correctly ([7b2db01](https://github.com/aurelia/aurelia/commit/7b2db01))
* **observer-locator:** use SetterObserver instead of dirty check ([1dc1983](https://github.com/aurelia/aurelia/commit/1dc1983))
* **computed:** correctly check observer type ([3349b8a](https://github.com/aurelia/aurelia/commit/3349b8a))
* **computed:** tweak computed + let/repeat ([8e964a6](https://github.com/aurelia/aurelia/commit/8e964a6))
* **computed:** add more tests for let + repeat ([0aa7624](https://github.com/aurelia/aurelia/commit/0aa7624))
* **validation:** collection property accessor parsing ([7d2cd1d](https://github.com/aurelia/aurelia/commit/7d2cd1d))
* **computed:** add more tests for multiple computed ([6365859](https://github.com/aurelia/aurelia/commit/6365859))
* **controller:** correct the timing of beforeBind hook ([d2e4f59](https://github.com/aurelia/aurelia/commit/d2e4f59))
* **validation:** accessing nested property value ([22698f0](https://github.com/aurelia/aurelia/commit/22698f0))
* **tests:** more computed observer tests ([13b5b9d](https://github.com/aurelia/aurelia/commit/13b5b9d))
* **computed-observer:** better efficiency & works in basic array scenarios ([ad12769](https://github.com/aurelia/aurelia/commit/ad12769))
* **tests:** removing validaion tests ([772125f](https://github.com/aurelia/aurelia/commit/772125f))
* **runtime+html:** tests ([85cd02c](https://github.com/aurelia/aurelia/commit/85cd02c))


### Performance Improvements:

* **aot:** add dispose() api to difficult to GC objects ([c2dea46](https://github.com/aurelia/aurelia/commit/c2dea46))


### Refactorings:

* **validation:** tests correction ([7138530](https://github.com/aurelia/aurelia/commit/7138530))
* ***:** rename alias to aliasto for readability and consistency ([f3904fe](https://github.com/aurelia/aurelia/commit/f3904fe))
* **validation:** optional scoped controller ([1484ed3](https://github.com/aurelia/aurelia/commit/1484ed3))
* **validation:** removed usage of BaseValidationRule in favor of IValidationRule ([72d4536](https://github.com/aurelia/aurelia/commit/72d4536))
* **validation:** validation-html bifurcation ([e2ca34f](https://github.com/aurelia/aurelia/commit/e2ca34f))
* **all:** fixup scheduler bootstrapping code, cleanup deprecated stuff ([acf66f2](https://github.com/aurelia/aurelia/commit/acf66f2))
* **route-recognizer:** use URLSearchParams ([b359298](https://github.com/aurelia/aurelia/commit/b359298))
* **route-recognizer:** more optional segment related fixes and tests ([b198a18](https://github.com/aurelia/aurelia/commit/b198a18))
* **route-recognizer:** more bugfixes and some perf improvements ([d044408](https://github.com/aurelia/aurelia/commit/d044408))
* **route-recognizer:** add star segment tests and more cleanup / minor fixes ([581b9f6](https://github.com/aurelia/aurelia/commit/581b9f6))
* ***:** use lifecycle instead of observer locator for collection observation in CheckedObserver ([147bec2](https://github.com/aurelia/aurelia/commit/147bec2))
* ***:** moved value evaluation to PropertyRule ([072526f](https://github.com/aurelia/aurelia/commit/072526f))
* **validation:** message provider usage ([a9e4b3e](https://github.com/aurelia/aurelia/commit/a9e4b3e))
* **validation:** integrated validation message provider for property displayname ([9b870f6](https://github.com/aurelia/aurelia/commit/9b870f6))
* **validation:** enhanced custom message key ([30f6b3f](https://github.com/aurelia/aurelia/commit/30f6b3f))
* **validation:** clean up ValidateInstruction ([666a5ac](https://github.com/aurelia/aurelia/commit/666a5ac))
* **styles:** a more explicit api for shadow styles and css modules ([3b1f978](https://github.com/aurelia/aurelia/commit/3b1f978))
* **validation:** normalized binding host ([732234b](https://github.com/aurelia/aurelia/commit/732234b))
* **validation:** removed errors in favor of results ([124d54f](https://github.com/aurelia/aurelia/commit/124d54f))
* **validation:** extracted test utils ([eb686af](https://github.com/aurelia/aurelia/commit/eb686af))
* **validation:** handled rules change in BB ([7669c19](https://github.com/aurelia/aurelia/commit/7669c19))
* **validation:** support for arg value change handling ([e7acfbe](https://github.com/aurelia/aurelia/commit/e7acfbe))
* **validation:** validate bb test ([92e09e0](https://github.com/aurelia/aurelia/commit/92e09e0))
* **validation:** scheduler in validation-controller ([c118e90](https://github.com/aurelia/aurelia/commit/c118e90))
* **validation:** fixed validation result ([de3f4cf](https://github.com/aurelia/aurelia/commit/de3f4cf))
* **computed-tests:** setupApp -> createFixture ([5152844](https://github.com/aurelia/aurelia/commit/5152844))
* **testing:** rename setup to createFixture ([6af10d7](https://github.com/aurelia/aurelia/commit/6af10d7))
* **ast:** a few finishing touches for script execution ([0ca9bdd](https://github.com/aurelia/aurelia/commit/0ca9bdd))
* **aot:** rename $SourceFile to $ESModule to allow differentiating $Script ([52d0830](https://github.com/aurelia/aurelia/commit/52d0830))
* **aot:** improve overall error propagation and reporting ([4762123](https://github.com/aurelia/aurelia/commit/4762123))
* **aot:** reorganize FormalParameterList static semantics and properly fix class/function eval ([b055f9e](https://github.com/aurelia/aurelia/commit/b055f9e))
* **aot:** pass through the execution context in all calls ([b14352e](https://github.com/aurelia/aurelia/commit/b14352e))
* **aot:** merge CompletionRecord into $Value types and rework/integrate the new types ([b9b692c](https://github.com/aurelia/aurelia/commit/b9b692c))

<a name="0.6.0"></a>
# 0.6.0 (2019-12-18)

### Features:

* **runtime:** add CustomElement.createInjectable api ([c2ea5fc](https://github.com/aurelia/aurelia/commit/c2ea5fc))
* **bindable:** basic working state for set/get ([ae1d87a](https://github.com/aurelia/aurelia/commit/ae1d87a))


### Bug Fixes:

* **container:** ignore primitive values in register ([b5eb137](https://github.com/aurelia/aurelia/commit/b5eb137))
* **webpack-loader:** canot use raw-loader on scss or less ([7e00cc5](https://github.com/aurelia/aurelia/commit/7e00cc5))


### Refactorings:

* **all:** refine+document controller interfaces and fix types/tests ([0a77fbd](https://github.com/aurelia/aurelia/commit/0a77fbd))
* **runtime:** rename 'detached' to 'afterDetach' ([d1e2b0c](https://github.com/aurelia/aurelia/commit/d1e2b0c))
* **runtime:** rename 'attached' to 'afterAttach' ([6ae7be1](https://github.com/aurelia/aurelia/commit/6ae7be1))
* **runtime:** rename 'unbound' to 'afterUnbind' ([35e203c](https://github.com/aurelia/aurelia/commit/35e203c))
* **runtime:** rename 'detaching' to 'beforeDetach' ([9f8b858](https://github.com/aurelia/aurelia/commit/9f8b858))
* **runtime:** rename 'unbinding' to 'beforeUnbind' ([79cd5fa](https://github.com/aurelia/aurelia/commit/79cd5fa))
* **runtime:** rename 'attaching' to 'beforeAttach' ([4685bb1](https://github.com/aurelia/aurelia/commit/4685bb1))
* **runtime:** rename 'bound' to 'afterBind' ([4060bbe](https://github.com/aurelia/aurelia/commit/4060bbe))
* **runtime:** rename 'binding' to 'beforeBind' ([45b2e91](https://github.com/aurelia/aurelia/commit/45b2e91))
* **bindable:** remove getter interceptor ([269d6ff](https://github.com/aurelia/aurelia/commit/269d6ff))
* **bindable-observer:** rename self-observer -> bindable-observer ([bc0647c](https://github.com/aurelia/aurelia/commit/bc0647c))

<a name="0.5.0"></a>
# 0.5.0 (2019-11-15)

### Features:

* **replace:** Nested replaceables didn't render ([71e815c](https://github.com/aurelia/aurelia/commit/71e815c))
* **kernel:** initial logger implementation ([7f77340](https://github.com/aurelia/aurelia/commit/7f77340))


### Bug Fixes:

* **test-nod:** verbose script ([42a18a8](https://github.com/aurelia/aurelia/commit/42a18a8))
* **di:** warn instead of throwing on native function dependencies ([7d56668](https://github.com/aurelia/aurelia/commit/7d56668))
* **integration:** fixing testfor FF ([edaae69](https://github.com/aurelia/aurelia/commit/edaae69))
* **runtime-html:** style-attribute-accessor issue ([40db3dc](https://github.com/aurelia/aurelia/commit/40db3dc))
* **runtime-html:** uniform syntax for class CA ([feede3a](https://github.com/aurelia/aurelia/commit/feede3a))


### Refactorings:

* **ref:** check element name again ([2625040](https://github.com/aurelia/aurelia/commit/2625040))
* **all:** rename behaviorFor to for ([0823dfe](https://github.com/aurelia/aurelia/commit/0823dfe))

<a name="0.4.0"></a>
# 0.4.0 (2019-10-26)

### Features:

* **portal:** add portal attribute ([8602dd0](https://github.com/aurelia/aurelia/commit/8602dd0))
* **dom:** add prependTo api to nodesequences ([b958d57](https://github.com/aurelia/aurelia/commit/b958d57))
* **testing:** new tracing capabolities ([ffb65ba](https://github.com/aurelia/aurelia/commit/ffb65ba))
* **test:** new html assertions for text and value ([46cdfdd](https://github.com/aurelia/aurelia/commit/46cdfdd))
* **strict-binding:** Allow null/und to be '' ([a44720e](https://github.com/aurelia/aurelia/commit/a44720e))
* **integration:** tests for updateTrigger and if ([caf1136](https://github.com/aurelia/aurelia/commit/caf1136))
* **integration:** new tests for text input ([dc87cea](https://github.com/aurelia/aurelia/commit/dc87cea))
* **tests:** added script to copy htmls ([823833d](https://github.com/aurelia/aurelia/commit/823833d))
* **integration:** starting integration tests ([aaefd34](https://github.com/aurelia/aurelia/commit/aaefd34))
* **integration:** test plan for runtime-html ([32c0de5](https://github.com/aurelia/aurelia/commit/32c0de5))
* **integration:** plan for binding behaviors ([e6ea738](https://github.com/aurelia/aurelia/commit/e6ea738))
* **integration:** test plan for runtime observers ([4d4525f](https://github.com/aurelia/aurelia/commit/4d4525f))
* **integration:** wip plan for runtime observers ([86bb368](https://github.com/aurelia/aurelia/commit/86bb368))
* **integration-test:** further test plan ([709ad73](https://github.com/aurelia/aurelia/commit/709ad73))
* **test:** starting integration test plan ([2dce7d0](https://github.com/aurelia/aurelia/commit/2dce7d0))
* **alias:** Added additional test cases ([4a45a5c](https://github.com/aurelia/aurelia/commit/4a45a5c))
* **alias:** Add convention add tests fix conv log ([19399af](https://github.com/aurelia/aurelia/commit/19399af))
* **alias:** Binding command aliases ([efffff8](https://github.com/aurelia/aurelia/commit/efffff8))
* **alias:** Cleanup and tests added ([5cabba3](https://github.com/aurelia/aurelia/commit/5cabba3))
* **kernel:** cover more edge cases in camel/kebabCase ([a37ca76](https://github.com/aurelia/aurelia/commit/a37ca76))
* **runtime-html:** Enhance the style accessor ([57bc7b1](https://github.com/aurelia/aurelia/commit/57bc7b1))
* **plugin-conventions:** improve compatibility with uppercase resource name ([b67b839](https://github.com/aurelia/aurelia/commit/b67b839))
* **plugin-conventions:** support foo.js + foo-view.html convention ([625ec6a](https://github.com/aurelia/aurelia/commit/625ec6a))
* **router:** improve instruction parser (working) ([f4b4806](https://github.com/aurelia/aurelia/commit/f4b4806))
* **router:** improve instruction parser (incomplete) ([dc3c6ee](https://github.com/aurelia/aurelia/commit/dc3c6ee))
* **plugin-conventions:** support conventional css pair, support alternative file extentions ([cfb9446](https://github.com/aurelia/aurelia/commit/cfb9446))
* **plugin-conventions:** support metadata containerless and bindable tag/attr ([b5395b4](https://github.com/aurelia/aurelia/commit/b5395b4))
* **plugin-conventions:** always wrap others resources in defer ([082b83b](https://github.com/aurelia/aurelia/commit/082b83b))
* **plugin-conventions:** enable ShadomDOM option in html-only-element ([e44eadd](https://github.com/aurelia/aurelia/commit/e44eadd))
* **plugin-conventions:** support defaultShadowOptions in conventions support ([dcf0bba](https://github.com/aurelia/aurelia/commit/dcf0bba))
* **router:** configure to not use url fragment hash ([88b4ada](https://github.com/aurelia/aurelia/commit/88b4ada))
* **i18n:** prepend, append HTML content support ([b9aeca8](https://github.com/aurelia/aurelia/commit/b9aeca8))
* **i18n:** support for [text] ([2576139](https://github.com/aurelia/aurelia/commit/2576139))
* **router:** add configuration for use browser  fragment hash ([4b2f0c1](https://github.com/aurelia/aurelia/commit/4b2f0c1))
* **i18n:** core translation service and related auxiliary features ([c3d4a85](https://github.com/aurelia/aurelia/commit/c3d4a85))
* **default-replaceable:** allow replace conv ([73ca7b0](https://github.com/aurelia/aurelia/commit/73ca7b0))
* **default-replaceable:** allow replace conv ([1300933](https://github.com/aurelia/aurelia/commit/1300933))
* **router:** add scope modifcations to link ([80f42a0](https://github.com/aurelia/aurelia/commit/80f42a0))
* **router:** make true default for viewport scope ([4298d78](https://github.com/aurelia/aurelia/commit/4298d78))
* **blur:** blur attribute ([9e844a8](https://github.com/aurelia/aurelia/commit/9e844a8))
* **observer:** Add the ability to bind an array of objects and strings to a class ([cd94c43](https://github.com/aurelia/aurelia/commit/cd94c43))
* **router:** fix review comments ([a75c569](https://github.com/aurelia/aurelia/commit/a75c569))
* **i18n:** skipTranslationOnMissingKey ([a544563](https://github.com/aurelia/aurelia/commit/a544563))
* **styles:** support the new css modules spec ([9b36a8e](https://github.com/aurelia/aurelia/commit/9b36a8e))
* **i18n:** all binding behavior ([f002dd7](https://github.com/aurelia/aurelia/commit/f002dd7))
* **i18n:** signalable rt value converter ([e4dfb10](https://github.com/aurelia/aurelia/commit/e4dfb10))
* **i18n:** signalable nf value-converter ([1e38acb](https://github.com/aurelia/aurelia/commit/1e38acb))
* **i18n:** signalable date-format value-converter ([24653f3](https://github.com/aurelia/aurelia/commit/24653f3))
* **i18n:** signalable t value-converter ([6d31d83](https://github.com/aurelia/aurelia/commit/6d31d83))
* **i18n:** support for unformat ([8d5a4fa](https://github.com/aurelia/aurelia/commit/8d5a4fa))
* **i18n:** basic relative-time implementation ([2ea21b7](https://github.com/aurelia/aurelia/commit/2ea21b7))
* **i18n:** date and number format with Intl API ([c2405b0](https://github.com/aurelia/aurelia/commit/c2405b0))
* **i18n:** support CE attribute translation ([58e2b93](https://github.com/aurelia/aurelia/commit/58e2b93))
* **i18n:** support for current locale change ([f450b68](https://github.com/aurelia/aurelia/commit/f450b68))
* **i18n:** added change handler to binding ([591f1d8](https://github.com/aurelia/aurelia/commit/591f1d8))
* **i18n:** improved support of append, prepend ([2db042c](https://github.com/aurelia/aurelia/commit/2db042c))
* **i18n:** support for [html],[prepend],[append] ([f0aadd6](https://github.com/aurelia/aurelia/commit/f0aadd6))
* **blur:** blur attribute, basic working state ([177684e](https://github.com/aurelia/aurelia/commit/177684e))
* **i18n:** support for `t=${key}`, `t=[attr]key` ([5f2fdfd](https://github.com/aurelia/aurelia/commit/5f2fdfd))
* **i18n:** alias integration ([03ab122](https://github.com/aurelia/aurelia/commit/03ab122))
* **observer:** Add the ability to bind an array of objects and strings to a class ([fb3ccf2](https://github.com/aurelia/aurelia/commit/fb3ccf2))
* **observer:** Add the ability to bind an array of objects and strings to a class ([75c8418](https://github.com/aurelia/aurelia/commit/75c8418))
* **observer:** Add the ability to bind an array of objects and strings to a class ([e80b279](https://github.com/aurelia/aurelia/commit/e80b279))
* **focus:** add focus attribute ([1972323](https://github.com/aurelia/aurelia/commit/1972323))
* **i18n:** add t-params ([2f559d0](https://github.com/aurelia/aurelia/commit/2f559d0))
* **observer:** Add the ability to bind an object to class ([13bd1d1](https://github.com/aurelia/aurelia/commit/13bd1d1))
* **observer:** Fix up tests and remove redundancy from class accessor ([64294ad](https://github.com/aurelia/aurelia/commit/64294ad))
* **observer:** Add the ability to bind an object to class ([3e7dba7](https://github.com/aurelia/aurelia/commit/3e7dba7))
* **focus:** add focus attribute ([ec6ba76](https://github.com/aurelia/aurelia/commit/ec6ba76))
* **i18n:** add binding+renderer+instructn+pattern ([adb4439](https://github.com/aurelia/aurelia/commit/adb4439))
* **router:** use router configuration and interface ([427e95d](https://github.com/aurelia/aurelia/commit/427e95d))
* **router:** extract load url from router activate ([af26abf](https://github.com/aurelia/aurelia/commit/af26abf))
* **runtime:** add lifecycle flag propagating template controllers for perf tweaks ([c28db65](https://github.com/aurelia/aurelia/commit/c28db65))
* **i18n:** skeleton implementation ([4ab2cff](https://github.com/aurelia/aurelia/commit/4ab2cff))
* **plugin-gulp:** conventions plugin for gulp, replaced plugin-requirejs ([ddb65b8](https://github.com/aurelia/aurelia/commit/ddb65b8))
* **router:** clean up debug for innerhtml ([3509464](https://github.com/aurelia/aurelia/commit/3509464))
* **router:** clean up debug for innerhtml ([1091baf](https://github.com/aurelia/aurelia/commit/1091baf))
* **router:** make nav title use innerhtml ([17dcd1b](https://github.com/aurelia/aurelia/commit/17dcd1b))
* **18n:** add basic unit tests ([d16fcb1](https://github.com/aurelia/aurelia/commit/d16fcb1))
* **webpack-loader:** webpack-loader on top of plugin-conventions ([0a4b131](https://github.com/aurelia/aurelia/commit/0a4b131))
* **plugin-conventions:** preprocess html template ([fd7134d](https://github.com/aurelia/aurelia/commit/fd7134d))
* **plugin-conventions:** preprocess js/ts resources, adding decorators ([0fa3cb2](https://github.com/aurelia/aurelia/commit/0fa3cb2))
* **router:** check entry before replace in cancel ([7350e0c](https://github.com/aurelia/aurelia/commit/7350e0c))
* **router:** improve guard matching & remaining viewports ([6df8e8b](https://github.com/aurelia/aurelia/commit/6df8e8b))
* **router:** clean up guardian & move parameters next to component & refactor viewport defaults ([0c7eaca](https://github.com/aurelia/aurelia/commit/0c7eaca))
* **router:** add navigation guardian ([9130e40](https://github.com/aurelia/aurelia/commit/9130e40))
* **router:** add style loader to navigation skeleton ([40a742d](https://github.com/aurelia/aurelia/commit/40a742d))
* **router:** add css to navigation skeleton ([2af8e37](https://github.com/aurelia/aurelia/commit/2af8e37))
* **router:** improve viewport state and description ([178c318](https://github.com/aurelia/aurelia/commit/178c318))
* **router:** replace BrowserNavigation's queue with Queue ([769b1b8](https://github.com/aurelia/aurelia/commit/769b1b8))
* **router:** remove router queue ([27927bc](https://github.com/aurelia/aurelia/commit/27927bc))
* **router:** add browser navigation and queue ([95c8795](https://github.com/aurelia/aurelia/commit/95c8795))


### Bug Fixes:

* **tests:** correction ([8edc003](https://github.com/aurelia/aurelia/commit/8edc003))
* **dirty-checker:** use render task queue ([21f9b69](https://github.com/aurelia/aurelia/commit/21f9b69))
* **test:** linting issues ([74c0cfc](https://github.com/aurelia/aurelia/commit/74c0cfc))
* **scheduler:** fix persistent task cancellation and add more tests ([88c897b](https://github.com/aurelia/aurelia/commit/88c897b))
* **runtime:** binary expression connect issue ([039f4f2](https://github.com/aurelia/aurelia/commit/039f4f2))
* **metadata:** add metadata and decorate function polyfills ([b79f55f](https://github.com/aurelia/aurelia/commit/b79f55f))
* **tests:** tri-state boolean radio buttons ([d201f09](https://github.com/aurelia/aurelia/commit/d201f09))
* **tests:** correction ([328cba8](https://github.com/aurelia/aurelia/commit/328cba8))
* **tests:** make sure test run on both node/browser ([4896920](https://github.com/aurelia/aurelia/commit/4896920))
* **tests:** make sure test run on both node/browser ([554386a](https://github.com/aurelia/aurelia/commit/554386a))
* **tests:** make sure test run on both node/browser ([f800bea](https://github.com/aurelia/aurelia/commit/f800bea))
* **view:** handle inheritance correctly / fix tests ([4956c68](https://github.com/aurelia/aurelia/commit/4956c68))
* **view:** more decorator/metadata fixes ([8db676b](https://github.com/aurelia/aurelia/commit/8db676b))
* **runtime:** missing notify on new value of key ([55c9fdf](https://github.com/aurelia/aurelia/commit/55c9fdf))
* **portal:** add 2nd param for hold, add tests, export mountstrategy ([d797f9a](https://github.com/aurelia/aurelia/commit/d797f9a))
* **au-dom:** revert weird changes ([a696579](https://github.com/aurelia/aurelia/commit/a696579))
* **portal:** separate API for hold parent container ([537eb97](https://github.com/aurelia/aurelia/commit/537eb97))
* **rendering-engine:** property inject compiler ([617f215](https://github.com/aurelia/aurelia/commit/617f215))
* **tests:** build issue correction ([b843149](https://github.com/aurelia/aurelia/commit/b843149))
* **tests:** build issue correction ([158ff3f](https://github.com/aurelia/aurelia/commit/158ff3f))
* **runtime:** attribute order for checkbox ([49a1d43](https://github.com/aurelia/aurelia/commit/49a1d43))
* **tests:** tweak affected tests ([8678836](https://github.com/aurelia/aurelia/commit/8678836))
* **style-inst:** correctly compile surrogate style/ add more tests ([1ee91df](https://github.com/aurelia/aurelia/commit/1ee91df))
* **ref:** add update source flag to binding ([19fdc34](https://github.com/aurelia/aurelia/commit/19fdc34))
* **ref:** use updatesource in self observer ([9354994](https://github.com/aurelia/aurelia/commit/9354994))
* **tests:** comment out pre-refactoring tests (has todo) ([4aee8bd](https://github.com/aurelia/aurelia/commit/4aee8bd))
* **tests:** comment out pre-refactoring tests (has todo) ([b5854f8](https://github.com/aurelia/aurelia/commit/b5854f8))
* **tests:** comment out pre-refactoring tests (has todo) ([75e8c99](https://github.com/aurelia/aurelia/commit/75e8c99))
* **ref-tests:** add tests for abitrary declaration order of ref binding ([82d8ed4](https://github.com/aurelia/aurelia/commit/82d8ed4))
* **tests:** computed-observer typing issue ([6a6043c](https://github.com/aurelia/aurelia/commit/6a6043c))
* **test:** linting issue ([0ef3878](https://github.com/aurelia/aurelia/commit/0ef3878))
* **tests:** computed observer ([a074800](https://github.com/aurelia/aurelia/commit/a074800))
* **test:** CI issues ([1554cdd](https://github.com/aurelia/aurelia/commit/1554cdd))
* **tests:** linitng issues ([16df0e1](https://github.com/aurelia/aurelia/commit/16df0e1))
* **tests:** linting issues ([3f85553](https://github.com/aurelia/aurelia/commit/3f85553))
* **integration:** easier test boilerplate ([11b2f35](https://github.com/aurelia/aurelia/commit/11b2f35))
* **plugin-conventions:** check import statement on new "aurelia" package, add test coverage ([fcff1de](https://github.com/aurelia/aurelia/commit/fcff1de))
* **plugin-conventions:** add missing support of templateController ([8ab115c](https://github.com/aurelia/aurelia/commit/8ab115c))
* **runtime:** computed bug ([641ba1c](https://github.com/aurelia/aurelia/commit/641ba1c))
* **runtime:** computed-observer overridden config ([6363d47](https://github.com/aurelia/aurelia/commit/6363d47))
* **custom-attr:** define parsing behavior clearer ([32e7ec8](https://github.com/aurelia/aurelia/commit/32e7ec8))
* **let:** to-view-model -> to-binding-context ([be22bc7](https://github.com/aurelia/aurelia/commit/be22bc7))
* **template-binder:** properly handle multiAttr binding edge cases ([d44d8fd](https://github.com/aurelia/aurelia/commit/d44d8fd))
* **let:** minor left over ([ae806eb](https://github.com/aurelia/aurelia/commit/ae806eb))
* **let:** to-view-model -> to-binding-context ([a201a32](https://github.com/aurelia/aurelia/commit/a201a32))
* **convention:** map inputmode -> inputMode ([3e7b0e6](https://github.com/aurelia/aurelia/commit/3e7b0e6))
* **repeat:** revert changes related to iterator binding ([3edbcd0](https://github.com/aurelia/aurelia/commit/3edbcd0))
* **repeat:** fix map delete observation, add more tests, normalize items in repeat ([f62df34](https://github.com/aurelia/aurelia/commit/f62df34))
* **repeat:** remove debugger ([c42f28a](https://github.com/aurelia/aurelia/commit/c42f28a))
* **repeat:** basic test case with array ([530eb33](https://github.com/aurelia/aurelia/commit/530eb33))
* **repeat:** add contextual props back ([4083fb4](https://github.com/aurelia/aurelia/commit/4083fb4))
* **custom-attr:** skip failing tests, tweak tests to reflect real usage ([e91f40d](https://github.com/aurelia/aurelia/commit/e91f40d))
* **custom-attr:** more tests for some common scenarios ([e41e3ff](https://github.com/aurelia/aurelia/commit/e41e3ff))
* **custom-attr:** more test cases for multi binding detection ([9c118ea](https://github.com/aurelia/aurelia/commit/9c118ea))
* **custom-attr:** define parsing behavior clearer ([526b557](https://github.com/aurelia/aurelia/commit/526b557))
* **array-observer:** fix splice edge case ([5a246a7](https://github.com/aurelia/aurelia/commit/5a246a7))
* **kernel:** only propagate globally registered resources to child render contexts ([1ccf9c0](https://github.com/aurelia/aurelia/commit/1ccf9c0))
* **kernel:** cover more edge cases in camel/kebabCase ([a7a594f](https://github.com/aurelia/aurelia/commit/a7a594f))
* **tests:** use map/reduce instead of flatmap ([b591f14](https://github.com/aurelia/aurelia/commit/b591f14))
* **plugin-conventions:** upgrade modify-code to latest version to fix a preprocess bug ([6d018a2](https://github.com/aurelia/aurelia/commit/6d018a2))
* **plugin-conventions:** new decorator has to be injected before existing decorators ([437596c](https://github.com/aurelia/aurelia/commit/437596c))
* **styles:** proper local vs. global style resolution ([95791b1](https://github.com/aurelia/aurelia/commit/95791b1))
* **bindable-primary:** cleanup debug code, add more tests ([8e2054d](https://github.com/aurelia/aurelia/commit/8e2054d))
* **bindable-primary:** cleanup debug code, add more tests ([f812a55](https://github.com/aurelia/aurelia/commit/f812a55))
* **ref:** fix ref usage ([bbdfbec](https://github.com/aurelia/aurelia/commit/bbdfbec))
* **all:** rename root au -> aurelia, auRefs -> au, fix tests ([edeb66b](https://github.com/aurelia/aurelia/commit/edeb66b))
* **template-binderf:** ensure custom attribute are processed first ([b6177cb](https://github.com/aurelia/aurelia/commit/b6177cb))
* **template-compiler:** add recursive test cases for custom attr + event pair ([27c19ee](https://github.com/aurelia/aurelia/commit/27c19ee))
* **template-compiler:** harmony compilation on surrogate el ([53b8a49](https://github.com/aurelia/aurelia/commit/53b8a49))
* **webpack-loader:** need to use "!!" in "!!raw-loader!" to bypass all loaders in webpack config ([5c00dbd](https://github.com/aurelia/aurelia/commit/5c00dbd))
* **plugin-conventions:** proper support of HTML-only element in format other than .html ([73860ec](https://github.com/aurelia/aurelia/commit/73860ec))
* **plugin-conventions:** turn off ShadowDOM for element with one-word tag name ([d1f10ff](https://github.com/aurelia/aurelia/commit/d1f10ff))
* **di:** defer should not register primitives ([2d19d6e](https://github.com/aurelia/aurelia/commit/2d19d6e))
* **binding-language:** allow binding command to take precedence over custom attr ([cf24681](https://github.com/aurelia/aurelia/commit/cf24681))
* **harmony-compilation:** tweaks flags, revert cond ([dd403bd](https://github.com/aurelia/aurelia/commit/dd403bd))
* **view-locator:** final typing issue ([bb903f1](https://github.com/aurelia/aurelia/commit/bb903f1))
* **binding-type:** adjust flags bits, tweak tests ([0bac00f](https://github.com/aurelia/aurelia/commit/0bac00f))
* **binding-language:** add IgnoreCustomAttr to binding type ([02b6903](https://github.com/aurelia/aurelia/commit/02b6903))
* **bindign-language-tests:** let some tests run in browser only ([1614052](https://github.com/aurelia/aurelia/commit/1614052))
* **binding-language-tests:** Element -> INode ([9dc9574](https://github.com/aurelia/aurelia/commit/9dc9574))
* **binding-language:** allow binding command to take precedence over custom attr ([bc6dcfc](https://github.com/aurelia/aurelia/commit/bc6dcfc))
* **view-locator:** improve types and simplify tests ([2ecb8c4](https://github.com/aurelia/aurelia/commit/2ecb8c4))
* **jit-html:** add convention for html attributes ([3c2a05a](https://github.com/aurelia/aurelia/commit/3c2a05a))
* **i18n:** fixed relative-time formatting issue ([19f32c5](https://github.com/aurelia/aurelia/commit/19f32c5))
* **i18n:** fixed i18n related CI issues ([fa994d7](https://github.com/aurelia/aurelia/commit/fa994d7))
* **tests:** tweak TemplateBinder ([b00e3da](https://github.com/aurelia/aurelia/commit/b00e3da))
* **i18n:** post-review changes ([b797d3f](https://github.com/aurelia/aurelia/commit/b797d3f))
* **i18n:** type def for locale ([eabf0e3](https://github.com/aurelia/aurelia/commit/eabf0e3))
* **i18n:** post-review changes ([81265bd](https://github.com/aurelia/aurelia/commit/81265bd))
* **i18n:** waited for i18next init in beforeBind ([fc3073d](https://github.com/aurelia/aurelia/commit/fc3073d))
* **i18n:** post-review changes ([d94d030](https://github.com/aurelia/aurelia/commit/d94d030))
* **styles:** pull shadow root type from jsdom ([8e9f1a5](https://github.com/aurelia/aurelia/commit/8e9f1a5))
* **styles:** ensure all styles infrastructure uses the dom abstraction ([2c397ec](https://github.com/aurelia/aurelia/commit/2c397ec))
* **styles:** address two deep scan issues ([4906098](https://github.com/aurelia/aurelia/commit/4906098))
* **i18n:** alias registration for `.bind` pattern ([47b95c5](https://github.com/aurelia/aurelia/commit/47b95c5))
* **deepscan:** removed unused import ([ec883a1](https://github.com/aurelia/aurelia/commit/ec883a1))
* **i18n:** disabling singular rt tests ([52dcaab](https://github.com/aurelia/aurelia/commit/52dcaab))
* **i18n:** correction for node ([78efceb](https://github.com/aurelia/aurelia/commit/78efceb))
* **all:** build errors related to children observers ([1658844](https://github.com/aurelia/aurelia/commit/1658844))
* **plugin-gulp:** fix html pair checking in plugin-gulp ([be01413](https://github.com/aurelia/aurelia/commit/be01413))
* **plugin-conventions:** fix TS TS2449 error for custom element with in-file dep ([efdc2ae](https://github.com/aurelia/aurelia/commit/efdc2ae))
* **replaceable:** fix some more edge cases with multi nested elements and template controllers ([b600463](https://github.com/aurelia/aurelia/commit/b600463))
* **replaceable:** more scoping fixes, enable most of bigopon's tests ([0daea3a](https://github.com/aurelia/aurelia/commit/0daea3a))
* **replaceable:** make part scopes also work when not immediately bound from the wrapping replaceable ([78803f1](https://github.com/aurelia/aurelia/commit/78803f1))
* **replaceable:** retain parts through template controllers in the replace-part ([69fdd0c](https://github.com/aurelia/aurelia/commit/69fdd0c))
* **observer-locator:** fix attribute NS accessor and tests ([923c326](https://github.com/aurelia/aurelia/commit/923c326))
* **repeat:** fix indexMap synchronization ([16c69f9](https://github.com/aurelia/aurelia/commit/16c69f9))
* **compose:** fix typo and tests ([a3060e9](https://github.com/aurelia/aurelia/commit/a3060e9))


### Refactorings:

* ***:** remove timeSlicing api calls ([0e05c43](https://github.com/aurelia/aurelia/commit/0e05c43))
* **scheduler:** remove evenLoop priority ([bb1fe5a](https://github.com/aurelia/aurelia/commit/bb1fe5a))
* **di:** sync annotation prefix ([ef905ff](https://github.com/aurelia/aurelia/commit/ef905ff))
* **all:** update definition refs ([676e86a](https://github.com/aurelia/aurelia/commit/676e86a))
* **resources): prepend with a:**  ([dd7c238](https://github.com/aurelia/aurelia/commit/dd7c238))
* **scheduler:** reorder priorities ([12cc85a](https://github.com/aurelia/aurelia/commit/12cc85a))
* **scheduler:** add more tests and more fixes ([d613137](https://github.com/aurelia/aurelia/commit/d613137))
* **scheduler:** add tests and fix the bugs they exposed ([2babe82](https://github.com/aurelia/aurelia/commit/2babe82))
* **scheduler:** add global initialization and initial test setup ([2d15388](https://github.com/aurelia/aurelia/commit/2d15388))
* **replaceable:** rename 'replace-part' to 'replace' and 'replaceable part' to 'replaceable' ([603b68b](https://github.com/aurelia/aurelia/commit/603b68b))
* ***:** drop unused imports ([7755bbf](https://github.com/aurelia/aurelia/commit/7755bbf))
* ***:** un-ignore some ts-ignore ([5e19c62](https://github.com/aurelia/aurelia/commit/5e19c62))
* **router:** remove internal strings and scope class ([17af5ad](https://github.com/aurelia/aurelia/commit/17af5ad))
* **all:** rename BasicConfiguration in various packages ([7e330d8](https://github.com/aurelia/aurelia/commit/7e330d8))
* **event-agg:** Change interface signature ([78658eb](https://github.com/aurelia/aurelia/commit/78658eb))
* **di:** cleanup resourceFactories stuff and add some tests ([e1ee6d2](https://github.com/aurelia/aurelia/commit/e1ee6d2))
* **debug:** rename Tracer to DebugTracer ([a6c28b3](https://github.com/aurelia/aurelia/commit/a6c28b3))
* **custom-attrs:** first pass removing dynamic options ([03c5480](https://github.com/aurelia/aurelia/commit/03c5480))
* **plugin-conventions:** simplify usage of html only element ([2d31b7f](https://github.com/aurelia/aurelia/commit/2d31b7f))
* **plugin-conventions:** simplify usage of html only element ([c52b8e4](https://github.com/aurelia/aurelia/commit/c52b8e4))
* **ref:** move $au to INode ([dbf1fce](https://github.com/aurelia/aurelia/commit/dbf1fce))
* **ref:** remove ref.xx binding command, tweak tests ([12d88b2](https://github.com/aurelia/aurelia/commit/12d88b2))
* **router:** fix review comments ([5ac5891](https://github.com/aurelia/aurelia/commit/5ac5891))
* **router:** fix review comments ([205e04c](https://github.com/aurelia/aurelia/commit/205e04c))
* **router:** strict route-recognizer ([2b0b146](https://github.com/aurelia/aurelia/commit/2b0b146))
* **router:** strict viewport-content ([9baa389](https://github.com/aurelia/aurelia/commit/9baa389))
* **blur:** skip some tests ([5dc99be](https://github.com/aurelia/aurelia/commit/5dc99be))
* **blur/focus:** use testhost instead of doc ([cedcd47](https://github.com/aurelia/aurelia/commit/cedcd47))
* **focus:** use ctx.doc instead of document in tests ([a345b62](https://github.com/aurelia/aurelia/commit/a345b62))
* **blur:** always wait 1 frame before/after each test ([6e6e677](https://github.com/aurelia/aurelia/commit/6e6e677))
* **blur/focus:** isolated tests in their own host elements ([8111b96](https://github.com/aurelia/aurelia/commit/8111b96))
* **blur:** make contains work across dom boundaries ([3f6b88d](https://github.com/aurelia/aurelia/commit/3f6b88d))
* **router:** rename browser-navigation to browser-navigator ([0c2a179](https://github.com/aurelia/aurelia/commit/0c2a179))
* **router:** rename all Navigation to Navigator for Navigator ([173ca6e](https://github.com/aurelia/aurelia/commit/173ca6e))
* **styles:** rename to make processor clear ([d703dcf](https://github.com/aurelia/aurelia/commit/d703dcf))
* **plugin-conventions:** push down common logic to base package ([cb96d99](https://github.com/aurelia/aurelia/commit/cb96d99))
* **resources:** shorten resource names ([499634b](https://github.com/aurelia/aurelia/commit/499634b))
* **binding:** rename bindings ([35d4dff](https://github.com/aurelia/aurelia/commit/35d4dff))
* **ast:** add -Expression suffix to AST expression classes ([0870538](https://github.com/aurelia/aurelia/commit/0870538))
* **router:** remove unused history and test files ([01ea880](https://github.com/aurelia/aurelia/commit/01ea880))
* **all): more cleaning up after TS breaking changes:** ( ([c4c3fc7](https://github.com/aurelia/aurelia/commit/c4c3fc7))
* **replaceable:** fix scoping and some variations of nesting ([99b356c](https://github.com/aurelia/aurelia/commit/99b356c))
* **test:** consolidate / cleanup ([6c83b4e](https://github.com/aurelia/aurelia/commit/6c83b4e))
* **all:** rename ICustomElement to IViewModel ([8092acf](https://github.com/aurelia/aurelia/commit/8092acf))
* **all:** rename $customElement to $controller ([aacf278](https://github.com/aurelia/aurelia/commit/aacf278))
* **all:** rename ILifecycleHooks to IViewModel ([a4e2dad](https://github.com/aurelia/aurelia/commit/a4e2dad))
* **runtime:** encapsulate lifecycle behavior in controller class ([4c12498](https://github.com/aurelia/aurelia/commit/4c12498))
* **router:** use DOM abstraction ([27d4eeb](https://github.com/aurelia/aurelia/commit/27d4eeb))
* **all:** move all testing utilities to aurelia-testing package ([8f2fe34](https://github.com/aurelia/aurelia/commit/8f2fe34))

