# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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

