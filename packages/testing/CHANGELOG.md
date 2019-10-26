# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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

