# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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

