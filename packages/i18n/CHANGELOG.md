# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

<a name="2.0.0-alpha.21"></a>
# 2.0.0-alpha.21 (2021-09-12)

**Note:** Version bump only for package @aurelia/i18n

<a name="2.0.0-alpha.20"></a>
# 2.0.0-alpha.20 (2021-09-04)

**Note:** Version bump only for package @aurelia/i18n

<a name="2.0.0-alpha.19"></a>
# 2.0.0-alpha.19 (2021-08-29)

**Note:** Version bump only for package @aurelia/i18n

<a name="2.0.0-alpha.18"></a>
# 2.0.0-alpha.18 (2021-08-22)

**Note:** Version bump only for package @aurelia/i18n

<a name="2.0.0-alpha.17"></a>
# 2.0.0-alpha.17 (2021-08-16)

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

* **binding-command:** bindingType -> type ([e38e7f2](https://github.com/aurelia/aurelia/commit/e38e7f2))
* **all:** use a terser name cache for predictable prop mangling ([7649ced](https://github.com/aurelia/aurelia/commit/7649ced))

<a name="2.0.0-alpha.15"></a>
# 2.0.0-alpha.15 (2021-08-01)

### Refactorings:

* **all:** remove lifecycle flags from various APIs ([b05db02](https://github.com/aurelia/aurelia/commit/b05db02))
* **template-compiler:** let binding command determine parsing work ([63aace4](https://github.com/aurelia/aurelia/commit/63aace4))

<a name="2.0.0-alpha.14"></a>
# 2.0.0-alpha.14 (2021-07-25)

### Refactorings:

* **runtime:** mark more private properties ([8ecf70b](https://github.com/aurelia/aurelia/commit/8ecf70b))

<a name="2.0.0-alpha.13"></a>
# 2.0.0-alpha.13 (2021-07-19)

### Refactorings:

* **render-context:** remove render context ([7d38f53](https://github.com/aurelia/aurelia/commit/7d38f53))
* **scope:** remove host scope ([0349810](https://github.com/aurelia/aurelia/commit/0349810))

<a name="2.0.0-alpha.12"></a>
# 2.0.0-alpha.12 (2021-07-11)

**Note:** Version bump only for package @aurelia/i18n

<a name="2.0.0-alpha.11"></a>
# 2.0.0-alpha.11 (2021-07-11)

### Bug Fixes:

* **call-binding:** assign args to event property, fixes #1231 ([fa4c0d4](https://github.com/aurelia/aurelia/commit/fa4c0d4))


### Refactorings:

* **all:** use container from controller instead of context ([0822330](https://github.com/aurelia/aurelia/commit/0822330))
* **context:** distinguish between render context and its container ([f216e98](https://github.com/aurelia/aurelia/commit/f216e98))

<a name="2.0.0-alpha.10"></a>
# 2.0.0-alpha.10 (2021-07-04)

### Refactorings:

* **templating:** remove projections param from getRenderContext ([cf34e40](https://github.com/aurelia/aurelia/commit/cf34e40))

<a name="2.0.0-alpha.9"></a>
# 2.0.0-alpha.9 (2021-06-25)

### Refactorings:

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
* **template-compiler:** merge binder & compiler ([240692d](https://github.com/aurelia/aurelia/commit/240692d))

<a name="2.0.0-alpha.7"></a>
# 2.0.0-alpha.7 (2021-06-20)

**Note:** Version bump only for package @aurelia/i18n

<a name="2.0.0-alpha.6"></a>
# 2.0.0-alpha.6 (2021-06-11)

**Note:** Version bump only for package @aurelia/i18n

<a name="2.0.0-alpha.5"></a>
# 2.0.0-alpha.5 (2021-05-31)

**Note:** Version bump only for package @aurelia/i18n

<a name="2.0.0-alpha.4"></a>
# 2.0.0-alpha.4 (2021-05-25)

**Note:** Version bump only for package @aurelia/i18n

<a name="2.0.0-alpha.3"></a>
# 2.0.0-alpha.3 (2021-05-19)

### Features:

* **app-task:** allow app task to be created without a key ([2786898](https://github.com/aurelia/aurelia/commit/2786898))


### Refactorings:

* **app-task:** simplify usage, align with .createInterface ([2786898](https://github.com/aurelia/aurelia/commit/2786898))

<a name="2.0.0-alpha.2"></a>
# 2.0.0-alpha.2 (2021-03-07)

**Note:** Version bump only for package @aurelia/i18n

<a name="2.0.0-alpha.1"></a>
# 2.0.0-alpha.1 (2021-03-03)

**Note:** Version bump only for package @aurelia/i18n

<a name="2.0.0-alpha.0"></a>
# 2.0.0-alpha.0 (2021-03-02)

### Bug Fixes:

* **translation-binding:** properly queue per target/attribute pair ([9ac40a6](https://github.com/aurelia/aurelia/commit/9ac40a6))
* **i18n:** also queue param updates, fix tests ([ea5875a](https://github.com/aurelia/aurelia/commit/ea5875a))
* **translation-binding:** align update behavior during bind, tweak tests ([d189000](https://github.com/aurelia/aurelia/commit/d189000))
* **param-renderer:** resolve platform once only ([3ad49fe](https://github.com/aurelia/aurelia/commit/3ad49fe))


### Refactorings:

* ***:** remove left over unused ids ([97fc845](https://github.com/aurelia/aurelia/commit/97fc845))
* **all:** remove .update flags ([3fc1632](https://github.com/aurelia/aurelia/commit/3fc1632))
* **i18n:** batch updates in changes ([f838be2](https://github.com/aurelia/aurelia/commit/f838be2))

<a name="0.9.0"></a>
# 0.9.0 (2021-01-31)

### Features:

* **di:** remove DI.createInterface builder ([8146dcc](https://github.com/aurelia/aurelia/commit/8146dcc))


### Refactorings:

* **all:** remove IBindingTargetAccessor & IBindingTargetObserver interfaces ([d9c27c6](https://github.com/aurelia/aurelia/commit/d9c27c6))

<a name="0.8.0"></a>
# 0.8.0 (2020-11-30)

### Features:

* **i18n:** dedicated API for locale subscribption ([06a3cef](https://github.com/aurelia/aurelia/commit/06a3cef))
* **runtime:** implement/wireup dispose hook ([1e1819e](https://github.com/aurelia/aurelia/commit/1e1819e))


### Bug Fixes:

* **translation-binding:** use the optional CustomElement.for api ([e8807af](https://github.com/aurelia/aurelia/commit/e8807af))
* ***:** broken tests ([3a73602](https://github.com/aurelia/aurelia/commit/3a73602))


### Refactorings:

* **binding:** adapt changes in runtime for i18n ([f3c174a](https://github.com/aurelia/aurelia/commit/f3c174a))
* **i18n-router:** adapt runtime flag refactoring ([8e2d7e7](https://github.com/aurelia/aurelia/commit/8e2d7e7))
* **all:** add .js extensions for native esm compat ([0308e2e](https://github.com/aurelia/aurelia/commit/0308e2e))
* **i18n:** use separate binding for parameters, ([cb86d44](https://github.com/aurelia/aurelia/commit/cb86d44))
* **i18n-binding:** pass obj & key to set value ([1e69e48](https://github.com/aurelia/aurelia/commit/1e69e48))
* **controller:** remove projector abstraction & rework attaching ([d69d03d](https://github.com/aurelia/aurelia/commit/d69d03d))
* **runtime-html:** rename InstructionComposer to Renderer and remove Composer abstraction ([6499d31](https://github.com/aurelia/aurelia/commit/6499d31))
* **all:** move scheduler implementation to platform ([e22285a](https://github.com/aurelia/aurelia/commit/e22285a))
* **all:** remove IDOM, HTMLDOM and DOM; replace DOM with PLATFORM ([6447468](https://github.com/aurelia/aurelia/commit/6447468))
* **all:** move html-specific stuff from runtime to runtime-html and remove Node generics ([c745963](https://github.com/aurelia/aurelia/commit/c745963))
* **all:** remove PLATFORM global ([fdef656](https://github.com/aurelia/aurelia/commit/fdef656))
* **all:** finish renaming render to compose ([ede127b](https://github.com/aurelia/aurelia/commit/ede127b))
* **all:** rename render to compose ([2d11d9e](https://github.com/aurelia/aurelia/commit/2d11d9e))
* **runtime:** move rendering, binding commands, attr patterns and instructions to runtime-html ([bc010f5](https://github.com/aurelia/aurelia/commit/bc010f5))
* **all:** rename renderer to composer ([c1a0f3c](https://github.com/aurelia/aurelia/commit/c1a0f3c))
* **runtime:** remove ILifecycleTask ([69f5fac](https://github.com/aurelia/aurelia/commit/69f5fac))
* **all:** cut back on the dispose calls ([9fec528](https://github.com/aurelia/aurelia/commit/9fec528))
* **all:** simplify Aurelia#start/stop & AppTask#run, returning promise instead of task ([6c7608d](https://github.com/aurelia/aurelia/commit/6c7608d))
* **scope:** remove IScope interface and use import type where possible for Scope ([6b8eb5f](https://github.com/aurelia/aurelia/commit/6b8eb5f))
* **i18n:** ensure .evaluate() is called with null ([c19fb30](https://github.com/aurelia/aurelia/commit/c19fb30))
* **start-task:** rename StartTask to AppTask ([b52fc9c](https://github.com/aurelia/aurelia/commit/b52fc9c))
* **lifecycle-task:** rename beforeBind to beforeActivate ([b363f2f](https://github.com/aurelia/aurelia/commit/b363f2f))
* **all:** remove AST interfaces ([7e04d83](https://github.com/aurelia/aurelia/commit/7e04d83))
* **all:** merge jit into runtime and remove jit package + references ([d7b626b](https://github.com/aurelia/aurelia/commit/d7b626b))
* **all:** remove State enum and use simple booleans instead ([762d3c7](https://github.com/aurelia/aurelia/commit/762d3c7))
* ***:** host scope & AST ([9067a2c](https://github.com/aurelia/aurelia/commit/9067a2c))

<a name="0.7.0"></a>
# 0.7.0 (2020-05-08)

### Features:

* ***:** AST hydration ([92125d6](https://github.com/aurelia/aurelia/commit/92125d6))


### Bug Fixes:

* **i18n:** i18next plugin type correction ([af078d2](https://github.com/aurelia/aurelia/commit/af078d2))
* **i18n:** support for null/undefined key exprs ([3375563](https://github.com/aurelia/aurelia/commit/3375563))
* **i18n:** convert undefined and null to empty string ([43c4b80](https://github.com/aurelia/aurelia/commit/43c4b80))
* **i18n:** bypassed tests for february ([9e1c2ae](https://github.com/aurelia/aurelia/commit/9e1c2ae))

<a name="0.6.0"></a>
# 0.6.0 (2019-12-18)

### Features:

* **controller:** add create/beforeCompile/afterCompile/afterCompileChildren hooks ([3a8c215](https://github.com/aurelia/aurelia/commit/3a8c215))


### Refactorings:

* **controller:** split up IController into several specialized interfaces + various small bugfixes ([05d8a8d](https://github.com/aurelia/aurelia/commit/05d8a8d))
* **i18n:** fix types / api calls ([ac4da3c](https://github.com/aurelia/aurelia/commit/ac4da3c))

<a name="0.5.0"></a>
# 0.5.0 (2019-11-15)

### Bug Fixes:

* **i18n:** do not use DOM types in constructor args ([bef63b3](https://github.com/aurelia/aurelia/commit/bef63b3))


### Refactorings:

* **all:** rename behaviorFor to for ([0823dfe](https://github.com/aurelia/aurelia/commit/0823dfe))

<a name="0.4.0"></a>
# 0.4.0 (2019-10-26)

### Features:

* **i18n:** prepend, append HTML content support ([b9aeca8](https://github.com/aurelia/aurelia/commit/b9aeca8))
* **i18n:** support for [text] ([2576139](https://github.com/aurelia/aurelia/commit/2576139))
* **i18n:** core translation service and related auxiliary features ([c3d4a85](https://github.com/aurelia/aurelia/commit/c3d4a85))
* **i18n:** skipTranslationOnMissingKey ([a544563](https://github.com/aurelia/aurelia/commit/a544563))
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
* **i18n:** support for `t=${key}`, `t=[attr]key` ([5f2fdfd](https://github.com/aurelia/aurelia/commit/5f2fdfd))
* **i18n:** alias integration ([03ab122](https://github.com/aurelia/aurelia/commit/03ab122))
* **i18n:** add t-params ([2f559d0](https://github.com/aurelia/aurelia/commit/2f559d0))
* **i18n:** add binding+renderer+instructn+pattern ([adb4439](https://github.com/aurelia/aurelia/commit/adb4439))
* **18n:** add basic unit tests ([d16fcb1](https://github.com/aurelia/aurelia/commit/d16fcb1))
* **i18n:** replacement of textContent ([df53fbf](https://github.com/aurelia/aurelia/commit/df53fbf))
* **i18n:** add i18n skeleton integration with t ([2157bf5](https://github.com/aurelia/aurelia/commit/2157bf5))
* **i18n:** add skeleton package for i18n ([70b5ecf](https://github.com/aurelia/aurelia/commit/70b5ecf))


### Bug Fixes:

* **i18n:** i18n interface ([1635784](https://github.com/aurelia/aurelia/commit/1635784))
* **i18n:** TranslationBinding did not re-evalute parametersExpr correctly ([fc20327](https://github.com/aurelia/aurelia/commit/fc20327))
* **i18n:** fixed relative-time formatting issue ([19f32c5](https://github.com/aurelia/aurelia/commit/19f32c5))
* **i18n:** post-review changes ([b797d3f](https://github.com/aurelia/aurelia/commit/b797d3f))
* **i18n:** post-review changes ([81265bd](https://github.com/aurelia/aurelia/commit/81265bd))
* **i18n:** waited for i18next init in beforeBind ([fc3073d](https://github.com/aurelia/aurelia/commit/fc3073d))
* **i18n:** code-climate issues ([3871ac3](https://github.com/aurelia/aurelia/commit/3871ac3))
* **i18n:** code climate fix ([4e62564](https://github.com/aurelia/aurelia/commit/4e62564))
* **i18n:** code climate ([0b0502e](https://github.com/aurelia/aurelia/commit/0b0502e))
* **i18n:** build-failure correction ([3235970](https://github.com/aurelia/aurelia/commit/3235970))
* **i18n:** code-climate issues ([1a1ee6d](https://github.com/aurelia/aurelia/commit/1a1ee6d))
* **i18n:** alias registration for `.bind` pattern ([47b95c5](https://github.com/aurelia/aurelia/commit/47b95c5))


### Refactorings:

* ***:** drop unused imports ([7755bbf](https://github.com/aurelia/aurelia/commit/7755bbf))

