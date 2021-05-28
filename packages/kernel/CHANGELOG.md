# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

<a name="2.0.0-alpha.4"></a>
# 2.0.0-alpha.4 (2021-05-25)

**Note:** Version bump only for package @aurelia/kernel

<a name="2.0.0-alpha.3"></a>
# 2.0.0-alpha.3 (2021-05-19)

### Refactorings:

* ***:** ease multiple metadata polyfill strictness ([54f485a](https://github.com/aurelia/aurelia/commit/54f485a))

<a name="2.0.0-alpha.2"></a>
# 2.0.0-alpha.2 (2021-03-07)

### Features:

* **di:** add invoke API back ([9892bfc](https://github.com/aurelia/aurelia/commit/9892bfc))


### Bug Fixes:

* **runtime:** fix duplicate lifecycleHooks resolution at root ([3b245ec](https://github.com/aurelia/aurelia/commit/3b245ec))

<a name="2.0.0-alpha.1"></a>
# 2.0.0-alpha.1 (2021-03-03)

**Note:** Version bump only for package @aurelia/kernel

<a name="2.0.0-alpha.0"></a>
# 2.0.0-alpha.0 (2021-03-02)

### Bug Fixes:

* **di:** cached callback always returns same ([3ba5343](https://github.com/aurelia/aurelia/commit/3ba5343))

<a name="0.9.0"></a>
# 0.9.0 (2021-01-31)

### Features:

* **runtime-html:** add @lifecycleHooks wiring ([4076293](https://github.com/aurelia/aurelia/commit/4076293))
* **di:** remove DI.createInterface builder ([8146dcc](https://github.com/aurelia/aurelia/commit/8146dcc))
* **logger:** process string placeholders ([8b5c026](https://github.com/aurelia/aurelia/commit/8b5c026))
* **kernel:** add module analyzer ([4edd891](https://github.com/aurelia/aurelia/commit/4edd891))
* **kernel:** add inheritParentResources config option ([ce5e17d](https://github.com/aurelia/aurelia/commit/ce5e17d))


### Bug Fixes:

* **logger:** fix sink registration ([6f93797](https://github.com/aurelia/aurelia/commit/6f93797))
* **di:** use requestor to resolve alias ([9face4b](https://github.com/aurelia/aurelia/commit/9face4b))


### Refactorings:

* **logging:** replace $console config option with ConsoleSink ([4ea5d22](https://github.com/aurelia/aurelia/commit/4ea5d22))
* **di:** dont create lambda ([4265bfd](https://github.com/aurelia/aurelia/commit/4265bfd))
* **di:** store factory per container root instead of via metadata ([dbbd8b9](https://github.com/aurelia/aurelia/commit/dbbd8b9))
* **di:** simplify factory ([795bdea](https://github.com/aurelia/aurelia/commit/795bdea))

<a name="0.8.0"></a>
# 0.8.0 (2020-11-30)

### Features:

* **kernel:** add module analyzer ([3fa12d1](https://github.com/aurelia/aurelia/commit/3fa12d1))
* **kernel:** add inheritParentResources config option ([b7a07a9](https://github.com/aurelia/aurelia/commit/b7a07a9))
* **kernel:** add resource create/find api's to the container ([1cab5bb](https://github.com/aurelia/aurelia/commit/1cab5bb))
* ***:** add dispose() method to Aurelia, CompositionRoot & Container ([39374de](https://github.com/aurelia/aurelia/commit/39374de))
* **di:** report InterfaceSymbol friendly name when converted to string ([a66882b](https://github.com/aurelia/aurelia/commit/a66882b))
* **runtime:** add cancel api and properly propagate async errors ([3c05ebe](https://github.com/aurelia/aurelia/commit/3c05ebe))
* **kernel:** add onResolve and resolveAll functions ([b76ff2e](https://github.com/aurelia/aurelia/commit/b76ff2e))
* **ct-get-all:** ability to traverse when get all ([5d479f4](https://github.com/aurelia/aurelia/commit/5d479f4))
* **di:** add scoped decorator ([1c20d51](https://github.com/aurelia/aurelia/commit/1c20d51))
* **di:** remove jitRegisterInRoot ([d8dd7d8](https://github.com/aurelia/aurelia/commit/d8dd7d8))


### Bug Fixes:

* **di-getall:** handle search ancestors in a different path, add failing tests ([edc4ba3](https://github.com/aurelia/aurelia/commit/edc4ba3))
* **ct:** optional traverse in impl too ([f5710f3](https://github.com/aurelia/aurelia/commit/f5710f3))
* **di:** registerFactory #822 ([4ac6543](https://github.com/aurelia/aurelia/commit/4ac6543))


### Refactorings:

* **all:** add .js extensions for native esm compat ([0308e2e](https://github.com/aurelia/aurelia/commit/0308e2e))
* **module-loader:** cache per transform function ([3c90743](https://github.com/aurelia/aurelia/commit/3c90743))
* **module-analyzer:** rename, cleanup, add tests ([1d3c8bf](https://github.com/aurelia/aurelia/commit/1d3c8bf))
* **all:** move scheduler implementation to platform ([e22285a](https://github.com/aurelia/aurelia/commit/e22285a))
* **all:** remove IDOM, HTMLDOM and DOM; replace DOM with PLATFORM ([6447468](https://github.com/aurelia/aurelia/commit/6447468))
* **all:** remove PLATFORM global ([fdef656](https://github.com/aurelia/aurelia/commit/fdef656))
* **platform:** remove hasOwnProperty ([90d95d5](https://github.com/aurelia/aurelia/commit/90d95d5))
* **platform:** remove isBrowserLike and run browser-specific tests in node ([2ce90dd](https://github.com/aurelia/aurelia/commit/2ce90dd))
* **platform:** remove isNodeLike ([ef19903](https://github.com/aurelia/aurelia/commit/ef19903))
* **platform:** remove isWebWorkerLike ([622c34b](https://github.com/aurelia/aurelia/commit/622c34b))
* **all:** cut back on the dispose calls ([9fec528](https://github.com/aurelia/aurelia/commit/9fec528))
* **all:** remove reporter ([425fe96](https://github.com/aurelia/aurelia/commit/425fe96))
* **logger:** remove type duplication and cleanup DefaultLogger ([f7de00f](https://github.com/aurelia/aurelia/commit/f7de00f))
* **eventaggregator:** remove duplicate type ([f4fb651](https://github.com/aurelia/aurelia/commit/f4fb651))
* **runtime:** merge controller api bind+attach into activate, detach+unbind into deactivate, and remove ILifecycleTask usage from controller ([15f3885](https://github.com/aurelia/aurelia/commit/15f3885))
* **event-aggregator:** fix types ([6b89325](https://github.com/aurelia/aurelia/commit/6b89325))
* **di:** rename requester -> requestor, remove .only ([686f400](https://github.com/aurelia/aurelia/commit/686f400))
* **di:** clean up linting issues, move stuff closer each other ([3785abb](https://github.com/aurelia/aurelia/commit/3785abb))
* ***:** putting projections to scope ([25dcc83](https://github.com/aurelia/aurelia/commit/25dcc83))
* ***:** deregisterResolverFor ([f221eb9](https://github.com/aurelia/aurelia/commit/f221eb9))
* **logging:** minor improvements ([71e601b](https://github.com/aurelia/aurelia/commit/71e601b))

<a name="0.7.0"></a>
# 0.7.0 (2020-05-08)

### Features:

* **di:** allow configuration of Container ([a3e5319](https://github.com/aurelia/aurelia/commit/a3e5319))
* **@lazy:** stop lazy caching, let container control lifecycle ([bfb7391](https://github.com/aurelia/aurelia/commit/bfb7391))
* ***:** add caching for callbacks ([b5086ad](https://github.com/aurelia/aurelia/commit/b5086ad))
* **validation:** started deserialization support ([4296f9d](https://github.com/aurelia/aurelia/commit/4296f9d))
* **kernel:** export format ([aca18ae](https://github.com/aurelia/aurelia/commit/aca18ae))


### Bug Fixes:

* **di:** should have a return type ([61266da](https://github.com/aurelia/aurelia/commit/61266da))
* **di:** improve error checking for DI.createInterface() ([2c73033](https://github.com/aurelia/aurelia/commit/2c73033))
* ***:** don't jitRegister intrinsic types. resolves #840 ([4f5d7e8](https://github.com/aurelia/aurelia/commit/4f5d7e8))
* ***:** validation controller factory fix ([e2e5da4](https://github.com/aurelia/aurelia/commit/e2e5da4))
* **is-arry-index:** properly check for 0 vs 0xx ([400ff0d](https://github.com/aurelia/aurelia/commit/400ff0d))


### Performance Improvements:

* **logger:** cache scoped loggers with the same name ([110b30e](https://github.com/aurelia/aurelia/commit/110b30e))


### Refactorings:

* **metadata:** make the polyfill application more foolproof and dedupe helper fns ([9c94ae1](https://github.com/aurelia/aurelia/commit/9c94ae1))
* ***:** rename alias to aliasto for readability and consistency ([f3904fe](https://github.com/aurelia/aurelia/commit/f3904fe))
* **kernel:** move metadata to separate package ([471b77d](https://github.com/aurelia/aurelia/commit/471b77d))
* **di:** make ResolverBuilder into a class ([0854f38](https://github.com/aurelia/aurelia/commit/0854f38))
* ***:** rename isNumeric to isArrayIndex ([2fab646](https://github.com/aurelia/aurelia/commit/2fab646))

<a name="0.6.0"></a>
# 0.6.0 (2019-12-18)

### Bug Fixes:

* **container:** ignore primitive values in register ([b5eb137](https://github.com/aurelia/aurelia/commit/b5eb137))


### Refactorings:

* **template-compiler:** merge RuntimeCompilationResources into ResourceModel ([43f09d3](https://github.com/aurelia/aurelia/commit/43f09d3))
* **kernel:** remove 'id' and 'path' properties from container ([26120ad](https://github.com/aurelia/aurelia/commit/26120ad))
* **runtime:** rename 'attached' to 'afterAttach' ([6ae7be1](https://github.com/aurelia/aurelia/commit/6ae7be1))
* **runtime:** rename 'attaching' to 'beforeAttach' ([4685bb1](https://github.com/aurelia/aurelia/commit/4685bb1))

<a name="0.5.0"></a>
# 0.5.0 (2019-11-15)

### Features:

* **kernel:** add isNativeFunction helper ([6e2fdda](https://github.com/aurelia/aurelia/commit/6e2fdda))
* **kernel:** add isNullOrUndefined function ([a783f07](https://github.com/aurelia/aurelia/commit/a783f07))
* **kernel:** add isObject function ([c158a22](https://github.com/aurelia/aurelia/commit/c158a22))
* **kernel:** initial logger implementation ([7f77340](https://github.com/aurelia/aurelia/commit/7f77340))


### Bug Fixes:

* **kernel:** use WeakMap for isNativeFunction for mem leaks ([61f29a6](https://github.com/aurelia/aurelia/commit/61f29a6))
* **di:** warn instead of throwing on native function dependencies ([7d56668](https://github.com/aurelia/aurelia/commit/7d56668))


### Performance Improvements:

* **all:** remove unnecessary Object.freezes ([16b0484](https://github.com/aurelia/aurelia/commit/16b0484))


### Refactorings:

* **metadata:** improve error detection and reporting ([8c17492](https://github.com/aurelia/aurelia/commit/8c17492))
* **reporter:** improve and document log levels ([aa78655](https://github.com/aurelia/aurelia/commit/aa78655))

<a name="0.4.0"></a>
# 0.4.0 (2019-10-26)

### Features:

* **kernel:** add resource definition helpers ([a318317](https://github.com/aurelia/aurelia/commit/a318317))
* **kernel:** add getPrototypeChain and pascalCase functions ([b85bb6e](https://github.com/aurelia/aurelia/commit/b85bb6e))
* **container:** add path property ([4ba48e9](https://github.com/aurelia/aurelia/commit/4ba48e9))
* **kernel:** add metadata implementation ([cc503ee](https://github.com/aurelia/aurelia/commit/cc503ee))
* **kernel:** add bound decorator ([ecae358](https://github.com/aurelia/aurelia/commit/ecae358))
* **alias:** Cleanup and tests added ([5cabba3](https://github.com/aurelia/aurelia/commit/5cabba3))
* **alias:** Provide alias functionality ([7dd9764](https://github.com/aurelia/aurelia/commit/7dd9764))
* **kernel:** cover more edge cases in camel/kebabCase ([a37ca76](https://github.com/aurelia/aurelia/commit/a37ca76))
* **(di:** enhance defer to fallback reasonably if no handler found ([3edb9ec](https://github.com/aurelia/aurelia/commit/3edb9ec))
* **i18n:** core translation service and related auxiliary features ([c3d4a85](https://github.com/aurelia/aurelia/commit/c3d4a85))
* **runtime:** initial runtime support for styles ([6aafcca](https://github.com/aurelia/aurelia/commit/6aafcca))
* **i18n:** date and number format with Intl API ([c2405b0](https://github.com/aurelia/aurelia/commit/c2405b0))
* **runtime:** initial implementation for startup tasks ([e4e1a14](https://github.com/aurelia/aurelia/commit/e4e1a14))
* **platform:** add isBrowserLike/isWebWorkerLike/isNodeLike variables ([8fd7e8a](https://github.com/aurelia/aurelia/commit/8fd7e8a))
* **kernel:** add restore() fn to PLATFORM ([2ced7dd](https://github.com/aurelia/aurelia/commit/2ced7dd))
* **event-aggregator:** export injectable interface ([e4463c0](https://github.com/aurelia/aurelia/commit/e4463c0))
* **kernel:** expose general-purpose nextId/resetId functions ([5f4f5a6](https://github.com/aurelia/aurelia/commit/5f4f5a6))
* **kernel:** move isNumeric utility to platform for now ([877fddb](https://github.com/aurelia/aurelia/commit/877fddb))
* **di:** list typing constraint on registration ([37c5524](https://github.com/aurelia/aurelia/commit/37c5524))
* **kernel:** add InstanceProvider to public api ([02b6d16](https://github.com/aurelia/aurelia/commit/02b6d16))
* **kernel:** add InjectArray shorthand type ([313e0bd](https://github.com/aurelia/aurelia/commit/313e0bd))
* **kernel:** migrate aurelia-path functions ([aa840e7](https://github.com/aurelia/aurelia/commit/aa840e7))
* **all:** add tracer argument stringification and improve tracing ([5ccdc42](https://github.com/aurelia/aurelia/commit/5ccdc42))
* **kernel:** add localStorage property to global ([53fe994](https://github.com/aurelia/aurelia/commit/53fe994))
* **kernel:** port EventAggregator to vNext ([4e8699c](https://github.com/aurelia/aurelia/commit/4e8699c))
* **kernel:** make EventAggregatorCallback generic ([d6bf68a](https://github.com/aurelia/aurelia/commit/d6bf68a))
* **kernel:** add EventAggregator to vNext ([6388074](https://github.com/aurelia/aurelia/commit/6388074))
* **di:** autoregister plain class as singleton and add recursion guard ([72f76aa](https://github.com/aurelia/aurelia/commit/72f76aa))
* **kernel:** add a global raf ticker ([32680a0](https://github.com/aurelia/aurelia/commit/32680a0))
* **kernel:** add performance profiler ([32c2a66](https://github.com/aurelia/aurelia/commit/32c2a66))
* **di:** make registration api fluent and allow adding registrations directly to createContainer ([4af2fd5](https://github.com/aurelia/aurelia/commit/4af2fd5))
* **all:** add friendly names to all interface symbols ([57876db](https://github.com/aurelia/aurelia/commit/57876db))
* **kernel:** make everything work correctly in node env ([4a10d77](https://github.com/aurelia/aurelia/commit/4a10d77))
* **di:** add tracing to get and construct methods ([1c0fb83](https://github.com/aurelia/aurelia/commit/1c0fb83))
* **kernel,debug:** add a simple tracer implementation ([89bc436](https://github.com/aurelia/aurelia/commit/89bc436))
* **di:** report meaningful error when trying to resolve an interface with no registrations ([43b299e](https://github.com/aurelia/aurelia/commit/43b299e))
* **di:** add transient and singleton decorators ([7afc5dd](https://github.com/aurelia/aurelia/commit/7afc5dd))


### Bug Fixes:

* **metadata:** add metadata and decorate function polyfills ([b79f55f](https://github.com/aurelia/aurelia/commit/b79f55f))
* **di:** properly jitRegister resource definitions ([2659889](https://github.com/aurelia/aurelia/commit/2659889))
* **di:** fix annotation name conflict ([177604a](https://github.com/aurelia/aurelia/commit/177604a))
* **di:** pass in the requestor to factory.construct for singletons ([7b54baa](https://github.com/aurelia/aurelia/commit/7b54baa))
* **resource:** use metadata for resolution ([471d90a](https://github.com/aurelia/aurelia/commit/471d90a))
* **di:** look for resource registration first ([028ad0b](https://github.com/aurelia/aurelia/commit/028ad0b))
* **kernel:** fix bound deco ([f7a9d2f](https://github.com/aurelia/aurelia/commit/f7a9d2f))
* **kernel:** only propagate globally registered resources to child render contexts ([1ccf9c0](https://github.com/aurelia/aurelia/commit/1ccf9c0))
* **kernel:** cover more edge cases in camel/kebabCase ([a7a594f](https://github.com/aurelia/aurelia/commit/a7a594f))
* **platform:** add now() polyfill for strange runtimes ([364dc06](https://github.com/aurelia/aurelia/commit/364dc06))
* **di:** defer should not register primitives ([2d19d6e](https://github.com/aurelia/aurelia/commit/2d19d6e))
* **styles:** adjust some types ([dbddd70](https://github.com/aurelia/aurelia/commit/dbddd70))
* **platform:** do not throw if platform perf methods are not defined ([4636cd9](https://github.com/aurelia/aurelia/commit/4636cd9))
* **replaceable:** fix some more edge cases with multi nested elements and template controllers ([b600463](https://github.com/aurelia/aurelia/commit/b600463))
* **di:** fix ts 3.5.x regression ([8a713f5](https://github.com/aurelia/aurelia/commit/8a713f5))
* **debug:** add missing error codes and fix a few reporting issues ([25148d0](https://github.com/aurelia/aurelia/commit/25148d0))
* **repeat:** correctly reorder nodes, fix several small bugs in node state tracking ([283af76](https://github.com/aurelia/aurelia/commit/283af76))
* **di:** make the decorators compatible with ts strict mode for end users ([4a3d7a2](https://github.com/aurelia/aurelia/commit/4a3d7a2))
* **eventaggregator:** fix types ([7bcff62](https://github.com/aurelia/aurelia/commit/7bcff62))
* **di:** detect newly registered resolver as an alternative to returned resolver from register method ([10131f2](https://github.com/aurelia/aurelia/commit/10131f2))
* **di:** fix false positive type error in resolver ([1f43cac](https://github.com/aurelia/aurelia/commit/1f43cac))
* **kernel:** fix master with workaround for now ([8a9db61](https://github.com/aurelia/aurelia/commit/8a9db61))
* **di:** expose resources from parent containers in child containers via a separate lookup ([c6d3db6](https://github.com/aurelia/aurelia/commit/c6d3db6))
* **kernel:** remove unnecessary iife call context ([7b6e2f9](https://github.com/aurelia/aurelia/commit/7b6e2f9))
* **di:** call resolve in buildAllResponse ([65bcff1](https://github.com/aurelia/aurelia/commit/65bcff1))
* **kernel:** fix a small typing regression in iindexable and add clarification ([bf48fce](https://github.com/aurelia/aurelia/commit/bf48fce))
* **kernel:** fix small regression in decorator typings and add clarifications ([d464e12](https://github.com/aurelia/aurelia/commit/d464e12))
* **di:** report a meaningful error when register() returns an invalid resolver ([0306348](https://github.com/aurelia/aurelia/commit/0306348))
* **kernel:** fix circular type reference issue introduced by ts 3.1 ([bb2a0f2](https://github.com/aurelia/aurelia/commit/bb2a0f2))


### Performance Improvements:

* **all:** remove tracer/profiler from ts source ([cc9c1fc](https://github.com/aurelia/aurelia/commit/cc9c1fc))
* **all): add sideEffect:** false for better tree shaking ([59b5e55](https://github.com/aurelia/aurelia/commit/59b5e55))
* **all:** pre-declare variables used in loops ([16b9c18](https://github.com/aurelia/aurelia/commit/16b9c18))
* **ticker:** minor perf tweaks and normalize frame delta ([fb73c58](https://github.com/aurelia/aurelia/commit/fb73c58))


### Refactorings:

* **kernel:** remove timer related methods from platform ([6827f9c](https://github.com/aurelia/aurelia/commit/6827f9c))
* **di:** sync annotation prefix ([ef905ff](https://github.com/aurelia/aurelia/commit/ef905ff))
* **resources:** move merge helpers to kernel ([9ceb1f7](https://github.com/aurelia/aurelia/commit/9ceb1f7))
* **kernel:** correctly wireup resource registrations ([33dfbee](https://github.com/aurelia/aurelia/commit/33dfbee))
* **runtime:** overhaul bindable, add annotations, fixup resource definitions ([8cffcf5](https://github.com/aurelia/aurelia/commit/8cffcf5))
* **kernel:** refine metadata ([d320730](https://github.com/aurelia/aurelia/commit/d320730))
* **metadata:** expose internal slot for debugging purposes, make polyfill non-enumerable ([d0dadcd](https://github.com/aurelia/aurelia/commit/d0dadcd))
* **di:** use metadata instead of static properties ([4edf542](https://github.com/aurelia/aurelia/commit/4edf542))
* **runtime:** use metadata for customElement def and renderer cache ([bccdc54](https://github.com/aurelia/aurelia/commit/bccdc54))
* ***:** drop unused imports ([7755bbf](https://github.com/aurelia/aurelia/commit/7755bbf))
* **event-agg:** Change interface signature ([78658eb](https://github.com/aurelia/aurelia/commit/78658eb))
* **di:** cleanup resourceFactories stuff and add some tests ([e1ee6d2](https://github.com/aurelia/aurelia/commit/e1ee6d2))
* **all): more cleaning up after TS breaking changes:** ( ([c4c3fc7](https://github.com/aurelia/aurelia/commit/c4c3fc7))
* **di:** overhaul the types to fix latest ts compatibility ([de8586e](https://github.com/aurelia/aurelia/commit/de8586e))
* **all:** move isNumeric/camelCase/kebabCase/toArray to separate functions and fix typings ([f746e5b](https://github.com/aurelia/aurelia/commit/f746e5b))
* **ticker:** move ticker + listener to runtime and integrate properly with lifecycle ([0ba386c](https://github.com/aurelia/aurelia/commit/0ba386c))
* **runtime:** wire up the tasks a bit more properly ([b7d3e4b](https://github.com/aurelia/aurelia/commit/b7d3e4b))
* **runtime:** encapsulate lifecycle behavior in controller class ([4c12498](https://github.com/aurelia/aurelia/commit/4c12498))
* **all:** more loosening up of null/undefined ([6794c30](https://github.com/aurelia/aurelia/commit/6794c30))
* **all:** loosen up null/undefined ([40bc93a](https://github.com/aurelia/aurelia/commit/40bc93a))
* ***:** remove Constructable "hack" and fix exposed typing errors ([c3b6d46](https://github.com/aurelia/aurelia/commit/c3b6d46))
* **all:** split traceInfo.name up in objName and methodName ([2cdc203](https://github.com/aurelia/aurelia/commit/2cdc203))
* ***:** another round of linting fixes ([ca0660b](https://github.com/aurelia/aurelia/commit/ca0660b))
* ***:** another round of linting fixes ([3e0f393](https://github.com/aurelia/aurelia/commit/3e0f393))
* **kernel:** drop Subscription in favor of IDisposable ([860394e](https://github.com/aurelia/aurelia/commit/860394e))
* ***:** make unknown the default for InterfaceSymbol ([0b77ce3](https://github.com/aurelia/aurelia/commit/0b77ce3))
* **kernel:** more DI typing ([97b7849](https://github.com/aurelia/aurelia/commit/97b7849))
* ***:** enable ban-types linting rule and fix violations ([00e61b1](https://github.com/aurelia/aurelia/commit/00e61b1))
* **ticker:** improve frameDelta rounding ([53e3aff](https://github.com/aurelia/aurelia/commit/53e3aff))
* ***:** linting fixes ([a9e26ad](https://github.com/aurelia/aurelia/commit/a9e26ad))
* **kernel:** cleanup exports ([dda5c5d](https://github.com/aurelia/aurelia/commit/dda5c5d))
* **kernel:** explicitly export non-internal resources ([43381a5](https://github.com/aurelia/aurelia/commit/43381a5))
* **all:** move timer globals to PLATFORM ([fa3bda3](https://github.com/aurelia/aurelia/commit/fa3bda3))
* **all:** move resourceType from runtime to kernel ([2c82c14](https://github.com/aurelia/aurelia/commit/2c82c14))
* **kernel:** strictNullChecks fixes ([49d37f3](https://github.com/aurelia/aurelia/commit/49d37f3))
* ***:** standardise on "as" type casts ([d0933b8](https://github.com/aurelia/aurelia/commit/d0933b8))
* **kernel:** fix or suppress Sonart linting errors ([da21118](https://github.com/aurelia/aurelia/commit/da21118))
* ***:** linting fixes for IIndexable ([63abddb](https://github.com/aurelia/aurelia/commit/63abddb))
* **kernel:** linting fixes for di ([d4a51a0](https://github.com/aurelia/aurelia/commit/d4a51a0))
* ***:** linting fixes for IIndexable ([4faffed](https://github.com/aurelia/aurelia/commit/4faffed))
* ***:** more any to strict typing conversions ([26f2d41](https://github.com/aurelia/aurelia/commit/26f2d41))
* ***:** remove no-reserved-keywords suppressions and fix most of them ([adde468](https://github.com/aurelia/aurelia/commit/adde468))
* ***:** remove no-reserved-keywords suppressions and fix most of them ([579c606](https://github.com/aurelia/aurelia/commit/579c606))
* ***:** fix errors and warnings reported by "lgtm" ([c77b12c](https://github.com/aurelia/aurelia/commit/c77b12c))
* **all:** reorganize/consolidate type structure ([57b086f](https://github.com/aurelia/aurelia/commit/57b086f))

<a name="0.3.0"></a>
# 0.3.0 (2018-10-12)

### Features:

* **kernel:** add decoratable interface to support strongly typed decorators ([f67a414](https://github.com/aurelia/aurelia/commit/f67a414))
* **binding:** add @connectable decorator back in (strongly typed) ([f67a414](https://github.com/aurelia/aurelia/commit/f67a414))
* **all:** implement InterpolationBinding ([f67a414](https://github.com/aurelia/aurelia/commit/f67a414))
* **unparser:** implement interpolation unparsing ([f67a414](https://github.com/aurelia/aurelia/commit/f67a414))
* **kernel:** add unwrap interface ([197235c](https://github.com/aurelia/aurelia/commit/197235c))
* **ast:** add visitor interface and implement accept methods on AST ([197235c](https://github.com/aurelia/aurelia/commit/197235c))
* **expression-parser:** allow member expressions on numeric literals ([197235c](https://github.com/aurelia/aurelia/commit/197235c))
* **expression-parser:** map empty attribute value to empty string for bound properties ([7a92cd8](https://github.com/aurelia/aurelia/commit/7a92cd8))


### Bug Fixes:

* **kernel:** fix decorated interface ([f67a414](https://github.com/aurelia/aurelia/commit/f67a414))
* **binding:** wrap updatetarget/updatesource so vCurrent BBs work again ([f67a414](https://github.com/aurelia/aurelia/commit/f67a414))
* **expression-parser:** fix differentation for caching of expressions/interpolations ([f67a414](https://github.com/aurelia/aurelia/commit/f67a414))
* **iterator-binding:** correctly compile and render ForOfStatement ([f67a414](https://github.com/aurelia/aurelia/commit/f67a414))
* **debug:** correct / update unparser and debug mode ([197235c](https://github.com/aurelia/aurelia/commit/197235c))
* **expression-parser:** fix parsing error with trailing elision ([197235c](https://github.com/aurelia/aurelia/commit/197235c))
* **expression-parser:** allow AccessThis as the last element of an array ([197235c](https://github.com/aurelia/aurelia/commit/197235c))
* **expression-parser:** allow AccessThis as the condition in a conditional ([197235c](https://github.com/aurelia/aurelia/commit/197235c))
* **expression-parser:** allow AccessThis as left-hand side of binary expressions ([197235c](https://github.com/aurelia/aurelia/commit/197235c))
* **expression-parser:** reset access after parsing non-identifiers ([197235c](https://github.com/aurelia/aurelia/commit/197235c))
* **unparser:** explicitly reconstruct precedence ([197235c](https://github.com/aurelia/aurelia/commit/197235c))
* **DI:** alias registration param order and tests (#202) ([1683135](https://github.com/aurelia/aurelia/commit/1683135))
* **resources:** ensure null is returned for non-existing resources ([7a92cd8](https://github.com/aurelia/aurelia/commit/7a92cd8))
* **template-compiler:** correct a few edge cases in target and bindingMode resolution ([7a92cd8](https://github.com/aurelia/aurelia/commit/7a92cd8))
* **template-compiler:** correct handling of kebab-cased custom attributes ([7a92cd8](https://github.com/aurelia/aurelia/commit/7a92cd8))
* **repeat.for:** add missing instruction properties ([7a92cd8](https://github.com/aurelia/aurelia/commit/7a92cd8))


### Performance Improvements:

* **expression-parser:** remove unreachable branch ([f67a414](https://github.com/aurelia/aurelia/commit/f67a414))
* **expression-parser:** use explicit numeric comparisons for bitwise operators ([197235c](https://github.com/aurelia/aurelia/commit/197235c))
* **template-compiler:** index the inspect/resolve buffers directly instead of destructuring ([7a92cd8](https://github.com/aurelia/aurelia/commit/7a92cd8))


### Refactorings:

* **binding:** cleanup/shuffle some interfaces accordingly ([f67a414](https://github.com/aurelia/aurelia/commit/f67a414))
* **template-compiler:** cleanup/inline instruction classes ([f67a414](https://github.com/aurelia/aurelia/commit/f67a414))
* **binding-command:** reuse specific binding command prototype methods on the default binding command ([7a92cd8](https://github.com/aurelia/aurelia/commit/7a92cd8))
* **template-compiler:** destructure with reused object ([7a92cd8](https://github.com/aurelia/aurelia/commit/7a92cd8))

<a name="0.2.0"></a>
# 0.2.0 (2018-09-18)

### Features:

* **di:** recurse through static registrations to find register methods in more edge cases ([6bc2d4d](https://github.com/aurelia/aurelia/commit/6bc2d4d))
* **kernel:** add fast camelCase and kebabCase functions with caching ([8debe4f](https://github.com/aurelia/aurelia/commit/8debe4f))
* **observers:** auto-enable collection observers and make the toggles idempotent ([d6a10b5](https://github.com/aurelia/aurelia/commit/d6a10b5))
* **runtime:** convert with attribute to use render location (#64) ([5830a36](https://github.com/aurelia/aurelia/commit/5830a36))
* **runtime:** convert with attribute to use render location ([5830a36](https://github.com/aurelia/aurelia/commit/5830a36))
* **runtime:** improvements to attribute and element bindable control and common interfaces ([5830a36](https://github.com/aurelia/aurelia/commit/5830a36))
* **binding:** implement ChangeSet (#58) ([144b1c6](https://github.com/aurelia/aurelia/commit/144b1c6))
* **binding:** implement ChangeSet ([144b1c6](https://github.com/aurelia/aurelia/commit/144b1c6))


### Bug Fixes:

* **di:** invoke correct method on array strategy resolver ([6bc2d4d](https://github.com/aurelia/aurelia/commit/6bc2d4d))
* **di:** invalidate Object keys to help diagnose invalid design:paramTypes ([6bc2d4d](https://github.com/aurelia/aurelia/commit/6bc2d4d))
* **di:** add a non-any type alternative to the InterfaceSymbol<T> so that container.get() returns correctly typed instances ([6bc2d4d](https://github.com/aurelia/aurelia/commit/6bc2d4d))
* **examples:** correct versions ([1b7c764](https://github.com/aurelia/aurelia/commit/1b7c764))
* **tsconfig:** correct extends path ([797674f](https://github.com/aurelia/aurelia/commit/797674f))
* **di:** convert invokers to an array (#106) ([9236dec](https://github.com/aurelia/aurelia/commit/9236dec))
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
* **runtime:** correct observer current value update and callback ordering ([5830a36](https://github.com/aurelia/aurelia/commit/5830a36))
* **runtime:** ensure all bindable callback slots are initialized ([5830a36](https://github.com/aurelia/aurelia/commit/5830a36))
* **runtime-behavior:** remove use of Toggle in favor of simple boolean ([5830a36](https://github.com/aurelia/aurelia/commit/5830a36))
* **observation:** fix subscriber typing ([144b1c6](https://github.com/aurelia/aurelia/commit/144b1c6))
* **kernel:** scripts working ([9302580](https://github.com/aurelia/aurelia/commit/9302580))
* **all:** lots of path fixes and a few typing fixes, make sure everything builds correctly ([9302580](https://github.com/aurelia/aurelia/commit/9302580))
* **test:** make all the tests run via lerna ([9302580](https://github.com/aurelia/aurelia/commit/9302580))


### Refactorings:

* **di:** append new resolvers on existing keys to a single array strategy resolver instead of nesting them ([6bc2d4d](https://github.com/aurelia/aurelia/commit/6bc2d4d))
* **bindable:** use platform.kebabCase ([8debe4f](https://github.com/aurelia/aurelia/commit/8debe4f))
* **binding:** use ChangeSet instead of TaskQueue ([144b1c6](https://github.com/aurelia/aurelia/commit/144b1c6))
* **property-observer:** make reusable decorator for setter/observer ([144b1c6](https://github.com/aurelia/aurelia/commit/144b1c6))
