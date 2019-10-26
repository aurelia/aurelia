# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

<a name="0.4.0"></a>
# 0.4.0 (2019-10-26)

### Features:

* **scheduler:** add yieldAll api ([f39c640](https://github.com/aurelia/aurelia/commit/f39c640))
* **scheduler:** add shims and initializers ([341dd69](https://github.com/aurelia/aurelia/commit/341dd69))
* **runtime-html-browser:** add customevent constructor to instantiation ([c2b5630](https://github.com/aurelia/aurelia/commit/c2b5630))
* **runtime:** make runtime-html fully work in jsdom/nodejs ([e34f9b1](https://github.com/aurelia/aurelia/commit/e34f9b1))


### Bug Fixes:

* **scheduler:** add timeout to idleCallback for ff ([620340e](https://github.com/aurelia/aurelia/commit/620340e))
* **scheduler:** pass through persistent / reusable params ([9078400](https://github.com/aurelia/aurelia/commit/9078400))
* **scheduler:** fix registrations and move to separate file ([2561c5e](https://github.com/aurelia/aurelia/commit/2561c5e))
* **styles:** ensure all styles infrastructure uses the dom abstraction ([2c397ec](https://github.com/aurelia/aurelia/commit/2c397ec))


### Performance Improvements:

* **all): add sideEffect:** false for better tree shaking ([59b5e55](https://github.com/aurelia/aurelia/commit/59b5e55))


### Refactorings:

* **scheduler:** remove evenLoop priority ([bb1fe5a](https://github.com/aurelia/aurelia/commit/bb1fe5a))
* **scheduler:** add prio specific apis ([5115f58](https://github.com/aurelia/aurelia/commit/5115f58))
* **scheduler:** reorder priorities ([12cc85a](https://github.com/aurelia/aurelia/commit/12cc85a))
* **scheduler:** add more tests and more fixes ([d613137](https://github.com/aurelia/aurelia/commit/d613137))
* **scheduler:** add tests and fix the bugs they exposed ([2babe82](https://github.com/aurelia/aurelia/commit/2babe82))
* **scheduler:** add global initialization and initial test setup ([2d15388](https://github.com/aurelia/aurelia/commit/2d15388))
* **all:** rename BasicConfiguration in various packages ([7e330d8](https://github.com/aurelia/aurelia/commit/7e330d8))
* **all): more cleaning up after TS breaking changes:** ( ([c4c3fc7](https://github.com/aurelia/aurelia/commit/c4c3fc7))
* ***:** use InjectArray ([b35215f](https://github.com/aurelia/aurelia/commit/b35215f))
* **all:** reorganize all registrations and make them more composable ([6fcce8b](https://github.com/aurelia/aurelia/commit/6fcce8b))
* **all:** expose registrations and registerables in a consistent manner ([ea9e59c](https://github.com/aurelia/aurelia/commit/ea9e59c))
* **runtime-html:** move the dom initializer to runtime-html-browser ([444082e](https://github.com/aurelia/aurelia/commit/444082e))

