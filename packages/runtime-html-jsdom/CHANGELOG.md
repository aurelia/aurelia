# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

<a name="0.4.0"></a>
# 0.4.0 (2019-10-26)

### Features:

* **scheduler:** add repeat parameter to yieldAll for dirty checker etc ([9f24306](https://github.com/aurelia/aurelia/commit/9f24306))
* **scheduler:** add yieldAll api ([f39c640](https://github.com/aurelia/aurelia/commit/f39c640))
* **scheduler:** add shims and initializers ([341dd69](https://github.com/aurelia/aurelia/commit/341dd69))
* **runtime-html-jsdom:** add customevent constructor to instantiation ([62225de](https://github.com/aurelia/aurelia/commit/62225de))
* **runtime:** make runtime-html fully work in jsdom/nodejs ([e34f9b1](https://github.com/aurelia/aurelia/commit/e34f9b1))
* **runtime-html-jsdom:** add jsdom initializer ([277fc7d](https://github.com/aurelia/aurelia/commit/277fc7d))


### Bug Fixes:

* **scheduler:** pass through persistent / reusable params ([9078400](https://github.com/aurelia/aurelia/commit/9078400))
* **scheduler:** fix registrations and move to separate file ([2561c5e](https://github.com/aurelia/aurelia/commit/2561c5e))
* **scheduler:** correct setTimeout requestor index ([02298b2](https://github.com/aurelia/aurelia/commit/02298b2))
* **jsdom:** enable pretendToBeVisual by default ([396cafe](https://github.com/aurelia/aurelia/commit/396cafe))
* **styles:** pull shadow root type from jsdom ([8e9f1a5](https://github.com/aurelia/aurelia/commit/8e9f1a5))
* **jsdom:** add missing types ([084f4e2](https://github.com/aurelia/aurelia/commit/084f4e2))


### Performance Improvements:

* **all): add sideEffect:** false for better tree shaking ([59b5e55](https://github.com/aurelia/aurelia/commit/59b5e55))


### Refactorings:

* **scheduler:** remove evenLoop priority ([bb1fe5a](https://github.com/aurelia/aurelia/commit/bb1fe5a))
* **scheduler:** add prio specific apis ([5115f58](https://github.com/aurelia/aurelia/commit/5115f58))
* **scheduler:** reorder priorities ([12cc85a](https://github.com/aurelia/aurelia/commit/12cc85a))
* **scheduler:** add tests and fix the bugs they exposed ([2babe82](https://github.com/aurelia/aurelia/commit/2babe82))
* **scheduler:** add global initialization and initial test setup ([2d15388](https://github.com/aurelia/aurelia/commit/2d15388))
* **all:** rename BasicConfiguration in various packages ([7e330d8](https://github.com/aurelia/aurelia/commit/7e330d8))
* **all): more cleaning up after TS breaking changes:** ( ([c4c3fc7](https://github.com/aurelia/aurelia/commit/c4c3fc7))
* ***:** use InjectArray ([b35215f](https://github.com/aurelia/aurelia/commit/b35215f))
* **all:** reorganize all registrations and make them more composable ([6fcce8b](https://github.com/aurelia/aurelia/commit/6fcce8b))
* **all:** expose registrations and registerables in a consistent manner ([ea9e59c](https://github.com/aurelia/aurelia/commit/ea9e59c))

