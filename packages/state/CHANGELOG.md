# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

<a name="2.0.0-beta.3"></a>
# 2.0.0-beta.3 (2023-03-24)

### Refactorings:

* **state:** action to be comes a single value (#1709) ([6b598d6](https://github.com/aurelia/aurelia/commit/6b598d6))
* **build:** use turbo to boost build speed (#1692) ([d99b136](https://github.com/aurelia/aurelia/commit/d99b136))

<a name="2.0.0-beta.2"></a>
# 2.0.0-beta.2 (2023-02-26)

**Note:** Version bump only for package @aurelia/state

<a name="2.0.0-beta.1"></a>
# 2.0.0-beta.1 (2023-01-12)

### Refactorings:

* ***:** add platform & obs locator to renderers ([6763eed](https://github.com/aurelia/aurelia/commit/6763eed))
* ***:** prefix private props on bindings ([d9cfc83](https://github.com/aurelia/aurelia/commit/d9cfc83))
* **runtime:** cleanup & size opt, rename binding methods (#1582) ([2000e3b](https://github.com/aurelia/aurelia/commit/2000e3b))
* **runtime:** remove interceptor prop from interface ([3074f54](https://github.com/aurelia/aurelia/commit/3074f54))
* **binding-behavior:** remove binding interceptor ([767eee7](https://github.com/aurelia/aurelia/commit/767eee7))
* **state:** cleanup bindings ([76cbb04](https://github.com/aurelia/aurelia/commit/76cbb04))
* **bindings:** create override fn instead of binding interceptor ([5c2ed80](https://github.com/aurelia/aurelia/commit/5c2ed80))
* **ast:** extract evaluate into a seprate fn ([6691f7f](https://github.com/aurelia/aurelia/commit/6691f7f))

<a name="2.0.0-alpha.41"></a>
# 2.0.0-alpha.41 (2022-09-22)

### Bug Fixes:

* ***:** call listener with correct scope, move flush queue to binding ([70d1329](https://github.com/aurelia/aurelia/commit/70d1329))


### Refactorings:

* **binding-command:** make expr parser & attr mapper parameters of command build ([0ff9756](https://github.com/aurelia/aurelia/commit/0ff9756))
* **bindings:** remove flags from bind/unbind (#1560) ([eaaf4bb](https://github.com/aurelia/aurelia/commit/eaaf4bb))
* ***:** remove flags from observers (#1557) ([9f9a8fe](https://github.com/aurelia/aurelia/commit/9f9a8fe))
* **binding:** move BindingMode to runtime-html (#1555) ([c75618b](https://github.com/aurelia/aurelia/commit/c75618b))
* **ast:** remove flags from evaluate (#1553) ([dda997b](https://github.com/aurelia/aurelia/commit/dda997b))

<a name="2.0.0-alpha.40"></a>
# 2.0.0-alpha.40 (2022-09-07)

**Note:** Version bump only for package @aurelia/state

<a name="2.0.0-alpha.39"></a>
# 2.0.0-alpha.39 (2022-09-01)

### Bug Fixes:

* **e2e:** better e2e test scripts ([855a03f](https://github.com/aurelia/aurelia/commit/855a03f))
* **build:** remove reference directive, use files in tsconfig instead ([855a03f](https://github.com/aurelia/aurelia/commit/855a03f))
* **typings:** make ListenerOptions public ([855a03f](https://github.com/aurelia/aurelia/commit/855a03f))

<a name="2.0.0-alpha.38"></a>
# 2.0.0-alpha.38 (2022-08-17)

**Note:** Version bump only for package @aurelia/state

<a name="2.0.0-alpha.37"></a>
# 2.0.0-alpha.37 (2022-08-03)

**Note:** Version bump only for package @aurelia/state

<a name="2.0.0-alpha.36"></a>
# 2.0.0-alpha.36 (2022-07-25)

**Note:** Version bump only for package @aurelia/state

<a name="2.0.0-alpha.35"></a>
# 2.0.0-alpha.35 (2022-06-08)

### Features:

* **ts-jest,babel-jest:** upgrade to jest v28 (#1449) ([b1ec85c](https://github.com/aurelia/aurelia/commit/b1ec85c))
* **state:** fromState deco works on attribute (#1447) ([548b4fd](https://github.com/aurelia/aurelia/commit/548b4fd))

<a name="2.0.0-alpha.34"></a>
# 2.0.0-alpha.34 (2022-06-03)

**Note:** Version bump only for package @aurelia/state

<a name="2.0.0-alpha.33"></a>
# 2.0.0-alpha.33 (2022-05-26)

### Features:

* **state:** add fromState decorator ([38ab008](https://github.com/aurelia/aurelia/commit/38ab008))


### Bug Fixes:

* **state:** binding behavior observe (#1437) ([b6e1b28](https://github.com/aurelia/aurelia/commit/b6e1b28))

<a name="2.0.0-alpha.32"></a>
# 2.0.0-alpha.32 (2022-05-22)

### Features:

* **state:** add state binding behavior ([b05a0fb](https://github.com/aurelia/aurelia/commit/b05a0fb))
* **state:** observe view model properties in state bindings ([b05a0fb](https://github.com/aurelia/aurelia/commit/b05a0fb))
* ***:** prevent store dispatch on unreged action ([b05a0fb](https://github.com/aurelia/aurelia/commit/b05a0fb))


### Bug Fixes:

* ***:** avoid conflict in binding props ([b05a0fb](https://github.com/aurelia/aurelia/commit/b05a0fb))
* ***:** settable properties in binding interceptor ([b05a0fb](https://github.com/aurelia/aurelia/commit/b05a0fb))
* ***:** binding behavior base ([b05a0fb](https://github.com/aurelia/aurelia/commit/b05a0fb))
* ***:** state export names ([b05a0fb](https://github.com/aurelia/aurelia/commit/b05a0fb))


### Refactorings:

* ***:** disable scope traversal in state binding, group interfaces ([b05a0fb](https://github.com/aurelia/aurelia/commit/b05a0fb))
* **state:** rename default configuration export ([b05a0fb](https://github.com/aurelia/aurelia/commit/b05a0fb))
* **state:** enforce .dispatch return shape ([b05a0fb](https://github.com/aurelia/aurelia/commit/b05a0fb))
* **state:** allow reducers to handle more than 1 action type ([b05a0fb](https://github.com/aurelia/aurelia/commit/b05a0fb))
* **state:** distinction of action / reducer ([b05a0fb](https://github.com/aurelia/aurelia/commit/b05a0fb))

<a name="2.0.0-alpha.31"></a>
# 2.0.0-alpha.31 (2022-05-15)

### Features:

* **plugin:** aurelia store (v2) plugin (#1412) ([6989de0](https://github.com/aurelia/aurelia/commit/6989de0))

