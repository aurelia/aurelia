# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

<a name="0.6.0"></a>
# 0.6.0 (2019-12-18)

### Bug Fixes:

* **template-compiler:** just return the definition if template is null ([9f3d595](https://github.com/aurelia/aurelia/commit/9f3d595))


### Refactorings:

* **template-compiler:** merge RuntimeCompilationResources into ResourceModel ([43f09d3](https://github.com/aurelia/aurelia/commit/43f09d3))
* **runtime:** rename 'attached' to 'afterAttach' ([6ae7be1](https://github.com/aurelia/aurelia/commit/6ae7be1))

<a name="0.5.0"></a>
# 0.5.0 (2019-11-15)

### Features:

* **replace:** Nested replaceables didn't render ([71e815c](https://github.com/aurelia/aurelia/commit/71e815c))

<a name="0.4.0"></a>
# 0.4.0 (2019-10-26)

### Features:

* **default-replaceable:** allow replace conv ([73ca7b0](https://github.com/aurelia/aurelia/commit/73ca7b0))
* **default-replaceable:** allow replace conv ([1300933](https://github.com/aurelia/aurelia/commit/1300933))
* **jit:** default to attr name on empty binding command value ([79a4a5f](https://github.com/aurelia/aurelia/commit/79a4a5f))
* **attr-binding:** add tests for class/style binding command ([ee0e29a](https://github.com/aurelia/aurelia/commit/ee0e29a))
* **attr-binding:** configure,exports,attr-pattern,commands ([2dd7124](https://github.com/aurelia/aurelia/commit/2dd7124))
* **attr-syntax:** attr,style, class pattern ([66e3035](https://github.com/aurelia/aurelia/commit/66e3035))
* **runtime:** initial implementation for patch lifecycle ([209a59a](https://github.com/aurelia/aurelia/commit/209a59a))
* **kernel:** add performance profiler ([32c2a66](https://github.com/aurelia/aurelia/commit/32c2a66))
* **jit-html:** expose individual registrations and configs ([1a2b839](https://github.com/aurelia/aurelia/commit/1a2b839))
* **all:** add friendly names to all interface symbols ([57876db](https://github.com/aurelia/aurelia/commit/57876db))


### Bug Fixes:

* **tests:** failing test for checked matcher ([374ce9b](https://github.com/aurelia/aurelia/commit/374ce9b))
* **template-binder:** camel name in multi bindings ([7abc6ae](https://github.com/aurelia/aurelia/commit/7abc6ae))
* **jit-html:** checked-observer issue ([d8693cc](https://github.com/aurelia/aurelia/commit/d8693cc))
* **template-compiler:** minifier friendlier ([498e3d5](https://github.com/aurelia/aurelia/commit/498e3d5))
* **template-compiler:** make surrogate signal mandatory ([6b04898](https://github.com/aurelia/aurelia/commit/6b04898))
* **style-inst:** correctly compile surrogate style/ add more tests ([1ee91df](https://github.com/aurelia/aurelia/commit/1ee91df))
* **template-compiler:** differentiate class on surrogate ([23b6b93](https://github.com/aurelia/aurelia/commit/23b6b93))
* **template-binder:** fix slip-up ([6142db4](https://github.com/aurelia/aurelia/commit/6142db4))
* **custom-attr:** define parsing behavior clearer ([32e7ec8](https://github.com/aurelia/aurelia/commit/32e7ec8))
* **let:** to-view-model -> to-binding-context ([be22bc7](https://github.com/aurelia/aurelia/commit/be22bc7))
* **template-binder:** properly handle multiAttr binding edge cases ([d44d8fd](https://github.com/aurelia/aurelia/commit/d44d8fd))
* **let:** to-view-model -> to-binding-context ([a201a32](https://github.com/aurelia/aurelia/commit/a201a32))
* **convention:** map inputmode -> inputMode ([3e7b0e6](https://github.com/aurelia/aurelia/commit/3e7b0e6))
* **template-binder:** parse attr value to detect multi bindings ([4898e7f](https://github.com/aurelia/aurelia/commit/4898e7f))
* **custom-attr:** define parsing behavior clearer ([526b557](https://github.com/aurelia/aurelia/commit/526b557))
* **bindable-primary:** cleanup debug code, add more tests ([f812a55](https://github.com/aurelia/aurelia/commit/f812a55))
* **compiler:** correctly build surrogates length ([5c032f4](https://github.com/aurelia/aurelia/commit/5c032f4))
* **template-binderf:** ensure custom attribute are processed first ([b6177cb](https://github.com/aurelia/aurelia/commit/b6177cb))
* **ref:** compile ref normally ([86b27c3](https://github.com/aurelia/aurelia/commit/86b27c3))
* **ref:** add ref binding cmd registration ([e69966a](https://github.com/aurelia/aurelia/commit/e69966a))
* **template-compiler:** harmony compilation on surrogate el ([53b8a49](https://github.com/aurelia/aurelia/commit/53b8a49))
* **harmony-compilation:** tweaks flags, revert cond ([dd403bd](https://github.com/aurelia/aurelia/commit/dd403bd))
* **template-binder:** use new flag ([06e7089](https://github.com/aurelia/aurelia/commit/06e7089))
* **binding-language:** add IgnoreCustomAttr to binding type ([02b6903](https://github.com/aurelia/aurelia/commit/02b6903))
* **binding-language:** allow binding command to take precedence over custom attr ([bc6dcfc](https://github.com/aurelia/aurelia/commit/bc6dcfc))
* **html-convention:** 3 ls in scrollleft ([51d8f04](https://github.com/aurelia/aurelia/commit/51d8f04))
* **jit-html:** add convention for html attributes ([ce07a92](https://github.com/aurelia/aurelia/commit/ce07a92))
* **jit:** fix camelcasing of html attributes ([f7b3eaf](https://github.com/aurelia/aurelia/commit/f7b3eaf))
* **template-binder:** correctly map attribute names to js names ([41596e0](https://github.com/aurelia/aurelia/commit/41596e0))
* **template-binder:** don't bind replace-part child nodes twice ([139c3ad](https://github.com/aurelia/aurelia/commit/139c3ad))
* **template-binder:** do not ignore empty attributes with binding commands ([166d67d](https://github.com/aurelia/aurelia/commit/166d67d))
* **template-binder:** use the target name for default bindings ([445c369](https://github.com/aurelia/aurelia/commit/445c369))
* **replaceable:** fix some more edge cases with multi nested elements and template controllers ([b600463](https://github.com/aurelia/aurelia/commit/b600463))
* **replaceable:** more scoping fixes, enable most of bigopon's tests ([0daea3a](https://github.com/aurelia/aurelia/commit/0daea3a))
* **template-compiler:** set buildRequired to false after compilation ([dc8f116](https://github.com/aurelia/aurelia/commit/dc8f116))
* **template-binder:** compile slot element ([bc190e0](https://github.com/aurelia/aurelia/commit/bc190e0))
* **class-binding:** targetKey -> propertyKey ([0971d7d](https://github.com/aurelia/aurelia/commit/0971d7d))
* **style-attr-binding:** properly handle rules, add important tests, non happy path tests ([a2b7c62](https://github.com/aurelia/aurelia/commit/a2b7c62))
* **tests:** remove only, add skip ([4000b1a](https://github.com/aurelia/aurelia/commit/4000b1a))
* **tests:** adjust h fn name ([3d0aa44](https://github.com/aurelia/aurelia/commit/3d0aa44))
* **replaceable-tests:** adjust tests, skip failing ([ffb71f6](https://github.com/aurelia/aurelia/commit/ffb71f6))
* **tests:** fix tests description ([90f45b3](https://github.com/aurelia/aurelia/commit/90f45b3))
* **template-binder:** clear interpolation expressions from attribute during compilation ([d0c9a65](https://github.com/aurelia/aurelia/commit/d0c9a65))
* **target-observer:** fix dom binding update when initial value matches empty string ([38fdc71](https://github.com/aurelia/aurelia/commit/38fdc71))
* **runtime:** fix two-way binding ([d60b952](https://github.com/aurelia/aurelia/commit/d60b952))
* **binding:** fix patch mode (again) ([e3eb280](https://github.com/aurelia/aurelia/commit/e3eb280))
* **proxy-observer:** only invoke subscribers specific to properties ([237d60d](https://github.com/aurelia/aurelia/commit/237d60d))
* **template-binder:** handle ref attribute on custom elements ([233dd69](https://github.com/aurelia/aurelia/commit/233dd69))
* **runtime:** register local dependencies before going into the template compiler ([13a7fd4](https://github.com/aurelia/aurelia/commit/13a7fd4))
* **jit-html:** correct the iife exports ([f6e72ab](https://github.com/aurelia/aurelia/commit/f6e72ab))
* **jit-html:** rename TemplateFactory to TemplateElementFactory due to name conflict ([1e6dadb](https://github.com/aurelia/aurelia/commit/1e6dadb))
* **jit:** add missing registrations ([848881d](https://github.com/aurelia/aurelia/commit/848881d))


### Performance Improvements:

* **all:** remove tracer/profiler from ts source ([cc9c1fc](https://github.com/aurelia/aurelia/commit/cc9c1fc))
* **jit-html:** cache parsed html ([bc9ada2](https://github.com/aurelia/aurelia/commit/bc9ada2))
* **all): add sideEffect:** false for better tree shaking ([59b5e55](https://github.com/aurelia/aurelia/commit/59b5e55))


### Refactorings:

* **template-binder:** simplify replace logic ([ed2f389](https://github.com/aurelia/aurelia/commit/ed2f389))
* **jit:** fix template compiler+binder" ([32181f8](https://github.com/aurelia/aurelia/commit/32181f8))
* **all:** update definition refs ([676e86a](https://github.com/aurelia/aurelia/commit/676e86a))
* **replaceable:** rename 'replace-part' to 'replace' and 'replaceable part' to 'replaceable' ([603b68b](https://github.com/aurelia/aurelia/commit/603b68b))
* **jit-html:** cleanup template-binder and improve semantic-model types ([156311d](https://github.com/aurelia/aurelia/commit/156311d))
* ***:** un-ignore some ts-ignore ([5e19c62](https://github.com/aurelia/aurelia/commit/5e19c62))
* **all:** rename BasicConfiguration in various packages ([7e330d8](https://github.com/aurelia/aurelia/commit/7e330d8))
* **compilation:** distinguish between custom/plain attributes ([34db977](https://github.com/aurelia/aurelia/commit/34db977))
* **ref:** add ref command, add target ref ([722778f](https://github.com/aurelia/aurelia/commit/722778f))
* **html-convention:** cleaner flow/naming ([ce1d3cb](https://github.com/aurelia/aurelia/commit/ce1d3cb))
* **jit-html:** cleanup binding-commands and attribute-patterns ([c35bdbe](https://github.com/aurelia/aurelia/commit/c35bdbe))
* **all): more cleaning up after TS breaking changes:** ( ([c4c3fc7](https://github.com/aurelia/aurelia/commit/c4c3fc7))
* **replaceable:** fix scoping and some variations of nesting ([99b356c](https://github.com/aurelia/aurelia/commit/99b356c))
* **all:** move isNumeric/camelCase/kebabCase/toArray to separate functions and fix typings ([f746e5b](https://github.com/aurelia/aurelia/commit/f746e5b))
* **all:** break out patch mode for now ([e173d0c](https://github.com/aurelia/aurelia/commit/e173d0c))
* **all:** more loosening up of null/undefined ([6794c30](https://github.com/aurelia/aurelia/commit/6794c30))
* **runtime:** fix binding and observation strict types ([b01d69a](https://github.com/aurelia/aurelia/commit/b01d69a))
* ***:** remove Constructable "hack" and fix exposed typing errors ([c3b6d46](https://github.com/aurelia/aurelia/commit/c3b6d46))
* ***:** use InjectArray ([b35215f](https://github.com/aurelia/aurelia/commit/b35215f))
* **all:** consolidate binding mechanisms into BindingStrategy enum ([d319ba8](https://github.com/aurelia/aurelia/commit/d319ba8))
* **all:** split traceInfo.name up in objName and methodName ([2cdc203](https://github.com/aurelia/aurelia/commit/2cdc203))
* ***:** another round of linting fixes ([ca0660b](https://github.com/aurelia/aurelia/commit/ca0660b))
* ***:** another round of linting fixes ([3e0f393](https://github.com/aurelia/aurelia/commit/3e0f393))
* **lifecycle-render:** remove arguments that can be resolved from the context ([7eb2b5d](https://github.com/aurelia/aurelia/commit/7eb2b5d))
* **all:** combine bindable and attachable into component ([a10461f](https://github.com/aurelia/aurelia/commit/a10461f))
* **lifecycle:** bind bindings before binding() hook and use binding() hook instead of bound() in repeater ([970b70d](https://github.com/aurelia/aurelia/commit/970b70d))
* **ast:** extract interfaces ([7f16091](https://github.com/aurelia/aurelia/commit/7f16091))
* **jit-html:** more linting fixes through test generation scripts ([ab04628](https://github.com/aurelia/aurelia/commit/ab04628))
* **jit-html:** more linting fixes through test generation scripts ([c4595c6](https://github.com/aurelia/aurelia/commit/c4595c6))
* ***:** make unknown the default for InterfaceSymbol ([d74da2c](https://github.com/aurelia/aurelia/commit/d74da2c))
* ***:** make unknown the default for InterfaceSymbol ([0b77ce3](https://github.com/aurelia/aurelia/commit/0b77ce3))
* **proxy-observer:** various tweaks and fixes ([30f91e8](https://github.com/aurelia/aurelia/commit/30f91e8))
* **proxy-observer:** use string instead of symbol for raw prop ([f1e09ce](https://github.com/aurelia/aurelia/commit/f1e09ce))
* ***:** enable ban-types linting rule and fix violations ([00e61b1](https://github.com/aurelia/aurelia/commit/00e61b1))
* **all:** reorganize all registrations and make them more composable ([6fcce8b](https://github.com/aurelia/aurelia/commit/6fcce8b))
* **all:** expose registrations and registerables in a consistent manner ([ea9e59c](https://github.com/aurelia/aurelia/commit/ea9e59c))
* ***:** linting fixes ([a9e26ad](https://github.com/aurelia/aurelia/commit/a9e26ad))
* **runtime-html:** explicitly export non-internal stuff ([554efcb](https://github.com/aurelia/aurelia/commit/554efcb))
* **jit-html:** explicitly export non-internal stuff ([e78a2f4](https://github.com/aurelia/aurelia/commit/e78a2f4))
* **all:** use Resource.define instead of decorators ([045aa90](https://github.com/aurelia/aurelia/commit/045aa90))
* **all:** replace inject decorators with static inject properties ([9fc37c1](https://github.com/aurelia/aurelia/commit/9fc37c1))
* **jit:** move html-specific logic to new jit-html package ([3372cc8](https://github.com/aurelia/aurelia/commit/3372cc8))

