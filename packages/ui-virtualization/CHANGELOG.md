# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

<a name="2.0.0-beta.9"></a>
# 2.0.0-beta.9 (2023-12-12)

**Note:** Version bump only for package @aurelia/ui-virtualization

<a name="2.0.0-beta.8"></a>
# 2.0.0-beta.8 (2023-07-24)

### Refactorings:

* **ref:** deprecate view-model.ref and introduce component.ref (#1803) ([97e8dad](https://github.com/aurelia/aurelia/commit/97e8dad))
* ***:** bindable property -> name (#1783) ([ca0eda7](https://github.com/aurelia/aurelia/commit/ca0eda7))

<a name="2.0.0-beta.7"></a>
# 2.0.0-beta.7 (2023-06-16)

### Features:

* **build:** add a development entry point (#1770) ([69ff445](https://github.com/aurelia/aurelia/commit/69ff445))

<a name="2.0.0-beta.6"></a>
# 2.0.0-beta.6 (2023-05-21)

### Bug Fixes:

* **ui-virtualization:** fix empty array edge cases (#1759) ([7a2f17f](https://github.com/aurelia/aurelia/commit/7a2f17f))

<a name="2.0.0-beta.5"></a>
# 2.0.0-beta.5 (2023-04-27)

### Bug Fixes:

* ***:** readme (minor) (#1744) ([6720195](https://github.com/aurelia/aurelia/commit/6720195))


### Refactorings:

* **build:** preserve pure annotation for better tree shaking (#1745) ([0bc5cd6](https://github.com/aurelia/aurelia/commit/0bc5cd6))

<a name="2.0.0-beta.4"></a>
# 2.0.0-beta.4 (2023-04-13)

**Note:** Version bump only for package @aurelia/ui-virtualization

<a name="2.0.0-beta.3"></a>
# 2.0.0-beta.3 (2023-03-24)

### Refactorings:

* **controller:** remove lifecycle flags (#1707) ([a31cd75](https://github.com/aurelia/aurelia/commit/a31cd75))
* **ci:** remove e2e safari from pipeline ([a31cd75](https://github.com/aurelia/aurelia/commit/a31cd75))
* **tests:** disable hook tests ([a31cd75](https://github.com/aurelia/aurelia/commit/a31cd75))
* **build:** use turbo to boost build speed (#1692) ([d99b136](https://github.com/aurelia/aurelia/commit/d99b136))

<a name="2.0.0-beta.2"></a>
# 2.0.0-beta.2 (2023-02-26)

**Note:** Version bump only for package @aurelia/ui-virtualization

<a name="2.0.0-beta.1"></a>
# 2.0.0-beta.1 (2023-01-12)

### Features:

* **repeat:** add keyed mode (#1583) ([d0c5706](https://github.com/aurelia/aurelia/commit/d0c5706))


### Performance Improvements:

* ***:** move render location creation to compiler (#1605) ([66846b1](https://github.com/aurelia/aurelia/commit/66846b1))


### Refactorings:

* **ast:** extract evaluate into a seprate fn ([6691f7f](https://github.com/aurelia/aurelia/commit/6691f7f))

<a name="2.0.0-alpha.41"></a>
# 2.0.0-alpha.41 (2022-09-22)

### Features:

* **collection-observation:** add ability to batch mutation into a single indexmap ([39b3f82](https://github.com/aurelia/aurelia/commit/39b3f82))


### Refactorings:

* **observation:** also pass collection in change handler ([c382e8a](https://github.com/aurelia/aurelia/commit/c382e8a))
* ***:** cleanup context & scope ([e806937](https://github.com/aurelia/aurelia/commit/e806937))
* ***:** remove flags from observers (#1557) ([9f9a8fe](https://github.com/aurelia/aurelia/commit/9f9a8fe))
* **ast:** remove flags from evaluate (#1553) ([dda997b](https://github.com/aurelia/aurelia/commit/dda997b))

<a name="2.0.0-alpha.40"></a>
# 2.0.0-alpha.40 (2022-09-07)

**Note:** Version bump only for package @aurelia/ui-virtualization

<a name="2.0.0-alpha.39"></a>
# 2.0.0-alpha.39 (2022-09-01)

### Bug Fixes:

* **e2e:** better e2e test scripts ([855a03f](https://github.com/aurelia/aurelia/commit/855a03f))
* **build:** remove reference directive, use files in tsconfig instead ([855a03f](https://github.com/aurelia/aurelia/commit/855a03f))
* **typings:** make ListenerOptions public ([855a03f](https://github.com/aurelia/aurelia/commit/855a03f))

<a name="2.0.0-alpha.38"></a>
# 2.0.0-alpha.38 (2022-08-17)

**Note:** Version bump only for package @aurelia/ui-virtualization

<a name="2.0.0-alpha.37"></a>
# 2.0.0-alpha.37 (2022-08-03)

**Note:** Version bump only for package @aurelia/ui-virtualization

<a name="2.0.0-alpha.36"></a>
# 2.0.0-alpha.36 (2022-07-25)

**Note:** Version bump only for package @aurelia/ui-virtualization

<a name="2.0.0-alpha.35"></a>
# 2.0.0-alpha.35 (2022-06-08)

### Features:

* **ts-jest,babel-jest:** upgrade to jest v28 (#1449) ([b1ec85c](https://github.com/aurelia/aurelia/commit/b1ec85c))

<a name="2.0.0-alpha.34"></a>
# 2.0.0-alpha.34 (2022-06-03)

**Note:** Version bump only for package @aurelia/ui-virtualization

<a name="2.0.0-alpha.33"></a>
# 2.0.0-alpha.33 (2022-05-26)

**Note:** Version bump only for package @aurelia/ui-virtualization

<a name="2.0.0-alpha.32"></a>
# 2.0.0-alpha.32 (2022-05-22)

**Note:** Version bump only for package @aurelia/ui-virtualization

<a name="2.0.0-alpha.31"></a>
# 2.0.0-alpha.31 (2022-05-15)

### Features:

* **ui-virtualization:** prepare to port ui virtualization plugin (#1420) ([3e61198](https://github.com/aurelia/aurelia/commit/3e61198))
* **virtualization:** basic implementation ([3e61198](https://github.com/aurelia/aurelia/commit/3e61198))


### Bug Fixes:

* **hmr:** works with components that has created lifecycle ([3e61198](https://github.com/aurelia/aurelia/commit/3e61198))

