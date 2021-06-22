# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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

