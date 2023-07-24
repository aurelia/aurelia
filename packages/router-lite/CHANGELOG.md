# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

<a name="2.0.0-beta.8"></a>
# 2.0.0-beta.8 (2023-07-24)

### Bug Fixes:

* **router-lite:** handling slash in parameter value (#1805) ([3fbb698](https://github.com/aurelia/aurelia/commit/3fbb698))
* **router-lite:** e2e build ([a1ca36d](https://github.com/aurelia/aurelia/commit/a1ca36d))


### Refactorings:

* **ref:** deprecate view-model.ref and introduce component.ref (#1803) ([97e8dad](https://github.com/aurelia/aurelia/commit/97e8dad))
* **router-lite:** query in fragment when using useUrlFragmentHash option (#1794) ([a1ca36d](https://github.com/aurelia/aurelia/commit/a1ca36d))
* **router-lite:** url serializer ([a1ca36d](https://github.com/aurelia/aurelia/commit/a1ca36d))
* **router-lite:** url parser ([a1ca36d](https://github.com/aurelia/aurelia/commit/a1ca36d))
* **router-lite:** url parser stringify ([a1ca36d](https://github.com/aurelia/aurelia/commit/a1ca36d))
* **router-lite:** e2e tests ([a1ca36d](https://github.com/aurelia/aurelia/commit/a1ca36d))
* **router-lite:** nested fragment ([a1ca36d](https://github.com/aurelia/aurelia/commit/a1ca36d))
* ***:** router-lite ([a1ca36d](https://github.com/aurelia/aurelia/commit/a1ca36d))
* **router-lite:** optimize object creation (#1782) ([c1ef0a3](https://github.com/aurelia/aurelia/commit/c1ef0a3))

<a name="2.0.0-beta.7"></a>
# 2.0.0-beta.7 (2023-06-16)

### Features:

* **router-lite:** error recovery ([99a6191](https://github.com/aurelia/aurelia/commit/99a6191))
* **build:** add a development entry point (#1770) ([69ff445](https://github.com/aurelia/aurelia/commit/69ff445))


### Bug Fixes:

* **router-lite:** hash compatibility with v1 (#1779) ([9302db5](https://github.com/aurelia/aurelia/commit/9302db5))
* **router-lite:** URL generation in child component (#1778) ([fd4de06](https://github.com/aurelia/aurelia/commit/fd4de06))
* **router-lite:** broken tests ([fd4de06](https://github.com/aurelia/aurelia/commit/fd4de06))
* **router-lite:** viewport name match for contains check in RouteNode ([99a6191](https://github.com/aurelia/aurelia/commit/99a6191))
* **router-lite:** error recovery from child's hook ([99a6191](https://github.com/aurelia/aurelia/commit/99a6191))
* **router-lite:** tests ([99a6191](https://github.com/aurelia/aurelia/commit/99a6191))
* **router-lite:** deepscan issue ([99a6191](https://github.com/aurelia/aurelia/commit/99a6191))
* **plugin-conventions:** fill up explicit .js/.ts dep filename in html module (#1752) ([17af0c8](https://github.com/aurelia/aurelia/commit/17af0c8))


### Refactorings:

* **router-lite:** miscellaneous changes (#1773) ([99a6191](https://github.com/aurelia/aurelia/commit/99a6191))
* **router-lite:** residue handling ([99a6191](https://github.com/aurelia/aurelia/commit/99a6191))
* **router-lite:** component-agent event trc ([99a6191](https://github.com/aurelia/aurelia/commit/99a6191))
* **router-lite:** loc-mngr event log ([99a6191](https://github.com/aurelia/aurelia/commit/99a6191))
* **router-lite:** logging ([99a6191](https://github.com/aurelia/aurelia/commit/99a6191))
* **router-lite:** router event log ([99a6191](https://github.com/aurelia/aurelia/commit/99a6191))
* **router-lite:** logging ([99a6191](https://github.com/aurelia/aurelia/commit/99a6191))
* **router-lite:** logging ([99a6191](https://github.com/aurelia/aurelia/commit/99a6191))
* **router-lite:** logging ([99a6191](https://github.com/aurelia/aurelia/commit/99a6191))
* **router-lite:** error handling ([99a6191](https://github.com/aurelia/aurelia/commit/99a6191))
* **router-lite/vi:** removed obtrusive props from public API ([99a6191](https://github.com/aurelia/aurelia/commit/99a6191))
* **router-lite:** optimize for bundle size ([99a6191](https://github.com/aurelia/aurelia/commit/99a6191))
* **router-lite:** optimize for bundle size ([99a6191](https://github.com/aurelia/aurelia/commit/99a6191))
* **router-lite:** optimize for bundle size ([99a6191](https://github.com/aurelia/aurelia/commit/99a6191))
* **router-lite:** optimize for bundle size ([99a6191](https://github.com/aurelia/aurelia/commit/99a6191))
* **router-lite:** optimize for bundle size ([99a6191](https://github.com/aurelia/aurelia/commit/99a6191))
* **router-lite:** optimize for bundle size ([99a6191](https://github.com/aurelia/aurelia/commit/99a6191))
* **router-lite:** optimize for bundle size ([99a6191](https://github.com/aurelia/aurelia/commit/99a6191))

<a name="2.0.0-beta.6"></a>
# 2.0.0-beta.6 (2023-05-21)

### Refactorings:

* ***:** rename resolveAll -> onResolveAll (#1764) ([fdf0747](https://github.com/aurelia/aurelia/commit/fdf0747))

<a name="2.0.0-beta.5"></a>
# 2.0.0-beta.5 (2023-04-27)

### Refactorings:

* **build:** preserve pure annotation for better tree shaking (#1745) ([0bc5cd6](https://github.com/aurelia/aurelia/commit/0bc5cd6))
* **router-lite:** alias registrations (#1741) ([f5e7140](https://github.com/aurelia/aurelia/commit/f5e7140))

<a name="2.0.0-beta.4"></a>
# 2.0.0-beta.4 (2023-04-13)

### Features:

* **router-lite:** extended support for ../ prefix (#1738) ([75732f1](https://github.com/aurelia/aurelia/commit/75732f1))
* **router-lite:** extended support for ../ prefix ([75732f1](https://github.com/aurelia/aurelia/commit/75732f1))
* **router-lite:** activeClass router configuration (#1733) ([bd18fde](https://github.com/aurelia/aurelia/commit/bd18fde))
* **router-lite:** activeClass router configuration ([bd18fde](https://github.com/aurelia/aurelia/commit/bd18fde))
* **router-lite:** non-string support for fallback (#1730) ([59da952](https://github.com/aurelia/aurelia/commit/59da952))
* **router-lite:** class as fallback ([59da952](https://github.com/aurelia/aurelia/commit/59da952))
* **router-lite:** ce aliases as configured route (#1723) ([2b7f9fc](https://github.com/aurelia/aurelia/commit/2b7f9fc))
* **router-lite:** transitionplan as nav opt ([7905d98](https://github.com/aurelia/aurelia/commit/7905d98))


### Bug Fixes:

* ** Previously, it was only available to the string instruction. This commit adds support for `{ component: '../../route', params: { wha:** 'ever' } }`. ([75732f1](https://github.com/aurelia/aurelia/commit/75732f1))
* **router-lite:** deepscan issues ([ddebae8](https://github.com/aurelia/aurelia/commit/ddebae8))
* **router-lite:** residual dispose ([e274535](https://github.com/aurelia/aurelia/commit/e274535))
* **router-lite:** broken smoke tests ([f1ba19c](https://github.com/aurelia/aurelia/commit/f1ba19c))
* **router-lite:** tests ([7715cc1](https://github.com/aurelia/aurelia/commit/7715cc1))
* **router-lite:** some failing tests ([1d427fc](https://github.com/aurelia/aurelia/commit/1d427fc))
* **router-lite:** build errors ([45d7063](https://github.com/aurelia/aurelia/commit/45d7063))


### Refactorings:

* **router-lite:** routable fallback ([59da952](https://github.com/aurelia/aurelia/commit/59da952))
* ***:** router-lite ([25304d5](https://github.com/aurelia/aurelia/commit/25304d5))
* ***:** router-lite ([5a56a89](https://github.com/aurelia/aurelia/commit/5a56a89))
* ***:** router-lite ([4b12a9a](https://github.com/aurelia/aurelia/commit/4b12a9a))
* **router-lite:** route definition configuration ([eba6d61](https://github.com/aurelia/aurelia/commit/eba6d61))
* **router-lite:** wip ([06a05be](https://github.com/aurelia/aurelia/commit/06a05be))
* **router-lite:** route definition ([3de75a6](https://github.com/aurelia/aurelia/commit/3de75a6))

<a name="2.0.0-beta.3"></a>
# 2.0.0-beta.3 (2023-03-24)

### Features:

* **router-lite:** function for fallback ([3bfb1ce](https://github.com/aurelia/aurelia/commit/3bfb1ce))


### Bug Fixes:

* **router-lite:** removed pre-mature optimization ([c951f0c](https://github.com/aurelia/aurelia/commit/c951f0c))


### Refactorings:

* **controller:** remove lifecycle flags (#1707) ([a31cd75](https://github.com/aurelia/aurelia/commit/a31cd75))
* **ci:** remove e2e safari from pipeline ([a31cd75](https://github.com/aurelia/aurelia/commit/a31cd75))
* **tests:** disable hook tests ([a31cd75](https://github.com/aurelia/aurelia/commit/a31cd75))
* **build:** use turbo to boost build speed (#1692) ([d99b136](https://github.com/aurelia/aurelia/commit/d99b136))

<a name="2.0.0-beta.2"></a>
# 2.0.0-beta.2 (2023-02-26)

### Features:

* **router-lite:** useNavigationModel ([542d564](https://github.com/aurelia/aurelia/commit/542d564))
* **router-lite:** async getRouteConfig ([da650fb](https://github.com/aurelia/aurelia/commit/da650fb))


### Bug Fixes:

* **router-lite:** failing test for load CA ([bd52286](https://github.com/aurelia/aurelia/commit/bd52286))
* **router-lite:** nav model isActive param route ([91cc2cc](https://github.com/aurelia/aurelia/commit/91cc2cc))
* **router-lite:** location URL generation with redirectTo ([39ec38f](https://github.com/aurelia/aurelia/commit/39ec38f))
* **router-lite:** history state navigation ([40d7440](https://github.com/aurelia/aurelia/commit/40d7440))
* **router-lite:** lifecycle hooks were invoked twice (#1664) ([5aeaa54](https://github.com/aurelia/aurelia/commit/5aeaa54))
* **router-lite:** lifecycle hooks were invoked twice ([5aeaa54](https://github.com/aurelia/aurelia/commit/5aeaa54))
* **router-lite:** routeTree adjustment - canUnload ([3c9ee4b](https://github.com/aurelia/aurelia/commit/3c9ee4b))
* **router-lite:** redirectTo parameter remapping ([9687178](https://github.com/aurelia/aurelia/commit/9687178))
* **s the following use case of `{ path: 'fizz/:foo/:bar', redirectTo: 'p2/:bar:** foo' }`. ([9687178](https://github.com/aurelia/aurelia/commit/9687178))
* **router-lite:** parameterized redirectTo ([591f89c](https://github.com/aurelia/aurelia/commit/591f89c))
* **router-lite:** redirectTo URL adjustment ([37f1dfc](https://github.com/aurelia/aurelia/commit/37f1dfc))
* **router-lite:** fragment to url ([732ab3f](https://github.com/aurelia/aurelia/commit/732ab3f))
* **router-lite:** fragment to URL (#1645) ([4f29e66](https://github.com/aurelia/aurelia/commit/4f29e66))
* **router-lite:** queryParams and fragment propagation from nav option (#1643) ([8ad1c52](https://github.com/aurelia/aurelia/commit/8ad1c52))
* **router-lite:** various overloads for the load method (#1642) ([fad763e](https://github.com/aurelia/aurelia/commit/fad763e))
* **router-lite/viewport:** null default binding ([e1a49f1](https://github.com/aurelia/aurelia/commit/e1a49f1))
* **router-lite:** deepscan issue ([0bf36d1](https://github.com/aurelia/aurelia/commit/0bf36d1))
* **router-lite:** handling hash in load, href CAs ([8489a10](https://github.com/aurelia/aurelia/commit/8489a10))


### Refactorings:

* **router-lite:** redirectTo in nav model ([cc0f71b](https://github.com/aurelia/aurelia/commit/cc0f71b))
* ***:** router-lite ([0646607](https://github.com/aurelia/aurelia/commit/0646607))
* ***:** router-lite ([5386fd8](https://github.com/aurelia/aurelia/commit/5386fd8))
* **router-lite:** instance regn RouterOptions ([5993a8b](https://github.com/aurelia/aurelia/commit/5993a8b))
* **router-lite:** restored error guard ([556e396](https://github.com/aurelia/aurelia/commit/556e396))
* **router-lite:** transition plan ([186da90](https://github.com/aurelia/aurelia/commit/186da90))
* **router-lite:** removed SameUrlStrategy ([54efabf](https://github.com/aurelia/aurelia/commit/54efabf))

<a name="2.0.0-beta.1"></a>
# 2.0.0-beta.1 (2023-01-12)

### Bug Fixes:

* **router-lite:** support ../ prefix for load CA (#1635) ([bcf8afd](https://github.com/aurelia/aurelia/commit/bcf8afd))
* **router-lite/href:** parent context selection (#1634) ([03b86bf](https://github.com/aurelia/aurelia/commit/03b86bf))
* **router-lite:** viewport-request and viewport-agent vieport name matching (#1629) ([2dd75d9](https://github.com/aurelia/aurelia/commit/2dd75d9))
* **router-lite:** viewport adjustment (#1628) ([25eab0a](https://github.com/aurelia/aurelia/commit/25eab0a))
* **router-lite/viewport:** null default binding (#1627) ([dfe569f](https://github.com/aurelia/aurelia/commit/dfe569f))
* **router-lite:** fallback with ce-name (#1621) ([baed798](https://github.com/aurelia/aurelia/commit/baed798))
* **router-lite:** fallback with ce-name ([baed798](https://github.com/aurelia/aurelia/commit/baed798))
* **route-recognizer:** residue handling (#1620) ([bd8bd05](https://github.com/aurelia/aurelia/commit/bd8bd05))
* **route-recognizer:** residue handling ([bd8bd05](https://github.com/aurelia/aurelia/commit/bd8bd05))
* **router-lite:** history state change timing (#1606) ([2cf5b64](https://github.com/aurelia/aurelia/commit/2cf5b64))
* **router-lite:** handling hash in load, href CAs (#1578) ([5a951a0](https://github.com/aurelia/aurelia/commit/5a951a0))
* **router-lite:** handling hash in load, href CAs ([5a951a0](https://github.com/aurelia/aurelia/commit/5a951a0))
* **router-lite:** deepscan issue ([5a951a0](https://github.com/aurelia/aurelia/commit/5a951a0))


### Refactorings:

* ***:** route-recognizer ([bd8bd05](https://github.com/aurelia/aurelia/commit/bd8bd05))
* **router-lite:** same URL handling (#1603) ([590c8b6](https://github.com/aurelia/aurelia/commit/590c8b6))
* **router-lite:** removed SameUrlStrategy ([590c8b6](https://github.com/aurelia/aurelia/commit/590c8b6))
* **router-lite:** transition plan ([590c8b6](https://github.com/aurelia/aurelia/commit/590c8b6))
* **router-lite:** transition plan inheritance ([590c8b6](https://github.com/aurelia/aurelia/commit/590c8b6))
* ***:** remove event delegator, move completely to compat ([cca1ce8](https://github.com/aurelia/aurelia/commit/cca1ce8))
* ***:** remove delegation in load/href attrs ([649b078](https://github.com/aurelia/aurelia/commit/649b078))

<a name="2.0.0-alpha.41"></a>
# 2.0.0-alpha.41 (2022-09-22)

### Bug Fixes:

* **router-lite:** recovery from unconfigured route (#1569) ([e095490](https://github.com/aurelia/aurelia/commit/e095490))


### Refactorings:

* **runtime:** move LifecycleFlags to runtime-html ([ef35bc7](https://github.com/aurelia/aurelia/commit/ef35bc7))
* **binding:** move BindingMode to runtime-html (#1555) ([c75618b](https://github.com/aurelia/aurelia/commit/c75618b))

<a name="2.0.0-alpha.40"></a>
# 2.0.0-alpha.40 (2022-09-07)

### Bug Fixes:

* **router-lite:** specific module import (#1536) ([31f4af9](https://github.com/aurelia/aurelia/commit/31f4af9))
* **router-lite:** specific module import #1530 ([31f4af9](https://github.com/aurelia/aurelia/commit/31f4af9))
* **router-lite:** nav-model promise handling (#1535) ([d9d5dae](https://github.com/aurelia/aurelia/commit/d9d5dae))


### Refactorings:

* **app-task:** consistent hook name style ing/ed (#1540) ([5a11ea0](https://github.com/aurelia/aurelia/commit/5a11ea0))

<a name="2.0.0-alpha.39"></a>
# 2.0.0-alpha.39 (2022-09-01)

### Bug Fixes:

* **router-lite:** temporarily expose internal typings (#1517) ([8782392](https://github.com/aurelia/aurelia/commit/8782392))
* **router-lite:** navigation to routes configured in ancestor nodes (#1514) ([3882700](https://github.com/aurelia/aurelia/commit/3882700))
* **router-lite:** upward relative navigation ([3882700](https://github.com/aurelia/aurelia/commit/3882700))


### Refactorings:

* **router-lite:** lifecycle hook invocation (#1522) ([d6216d8](https://github.com/aurelia/aurelia/commit/d6216d8))
* **router-lite:** explicit ctx in href & load ([3882700](https://github.com/aurelia/aurelia/commit/3882700))
* **router-lite:** null context for root ([3882700](https://github.com/aurelia/aurelia/commit/3882700))

<a name="2.0.0-alpha.38"></a>
# 2.0.0-alpha.38 (2022-08-17)

### Features:

* **router-lite:** most-matching path generation ([affa866](https://github.com/aurelia/aurelia/commit/affa866))


### Bug Fixes:

* **router-lite:** eager route recognition ([affa866](https://github.com/aurelia/aurelia/commit/affa866))
* **router-lite:** broken test ([affa866](https://github.com/aurelia/aurelia/commit/affa866))
* **router-lite:** replace query for non-root ctx ([affa866](https://github.com/aurelia/aurelia/commit/affa866))
* **router-lite:** eager resolution for children ([affa866](https://github.com/aurelia/aurelia/commit/affa866))
* **router-lite:** tests ([affa866](https://github.com/aurelia/aurelia/commit/affa866))
* **router-lite:** deepscan issues ([affa866](https://github.com/aurelia/aurelia/commit/affa866))


### Refactorings:

* **router-lite:** better path generation and parameter handling (#1495) ([affa866](https://github.com/aurelia/aurelia/commit/affa866))
* **router-lite:** path generation ([affa866](https://github.com/aurelia/aurelia/commit/affa866))
* **router-lite:** route generation for non-string component ([affa866](https://github.com/aurelia/aurelia/commit/affa866))
* **router-lite:** routing-trigger ([affa866](https://github.com/aurelia/aurelia/commit/affa866))
* **router-lite:** viewportinstruction cleanup ([affa866](https://github.com/aurelia/aurelia/commit/affa866))
* **router-lite:** path generation ([affa866](https://github.com/aurelia/aurelia/commit/affa866))
* **router-lite:** support for CE,DEDef,VM,RtCfg in load ([affa866](https://github.com/aurelia/aurelia/commit/affa866))
* **router-lite:** support for complex type in configured route data ([affa866](https://github.com/aurelia/aurelia/commit/affa866))

<a name="2.0.0-alpha.37"></a>
# 2.0.0-alpha.37 (2022-08-03)

### Bug Fixes:

* **router-lite:** #1370 (#1482) ([8a39b13](https://github.com/aurelia/aurelia/commit/8a39b13))

<a name="2.0.0-alpha.36"></a>
# 2.0.0-alpha.36 (2022-07-25)

### Features:

* **router-lite:** custom root provider (#1463) ([d189d3b](https://github.com/aurelia/aurelia/commit/d189d3b))
* **router-lite:** custom root provider ([d189d3b](https://github.com/aurelia/aurelia/commit/d189d3b))


### Bug Fixes:

* **router-lite:** better handling of parameters and querystring (#1467) ([cd93312](https://github.com/aurelia/aurelia/commit/cd93312))


### Refactorings:

* **router-lite:** params in Router#load ([cd93312](https://github.com/aurelia/aurelia/commit/cd93312))
* **router-lite:** base path resolution ([d189d3b](https://github.com/aurelia/aurelia/commit/d189d3b))

<a name="2.0.0-alpha.35"></a>
# 2.0.0-alpha.35 (2022-06-08)

### Features:

* **router-lite:** navigation model (#1446) ([d6a1590](https://github.com/aurelia/aurelia/commit/d6a1590))
* **ts-jest,babel-jest:** upgrade to jest v28 (#1449) ([b1ec85c](https://github.com/aurelia/aurelia/commit/b1ec85c))


### Bug Fixes:

* **router-lite/nav-model): na:** false (#1452) ([c794bba](https://github.com/aurelia/aurelia/commit/c794bba))


### Refactorings:

* **router-lite:** isNavigating flag (#1457) ([b7077b7](https://github.com/aurelia/aurelia/commit/b7077b7))

<a name="2.0.0-alpha.34"></a>
# 2.0.0-alpha.34 (2022-06-03)

### Features:

* **router-lite:** getRouteConfig hook (#1439) ([3481d7e](https://github.com/aurelia/aurelia/commit/3481d7e))

<a name="2.0.0-alpha.33"></a>
# 2.0.0-alpha.33 (2022-05-26)

**Note:** Version bump only for package @aurelia/router-lite

<a name="2.0.0-alpha.32"></a>
# 2.0.0-alpha.32 (2022-05-22)

**Note:** Version bump only for package @aurelia/router-lite

<a name="2.0.0-alpha.31"></a>
# 2.0.0-alpha.31 (2022-05-15)

**Note:** Version bump only for package @aurelia/router-lite

<a name="2.0.0-alpha.30"></a>
# 2.0.0-alpha.30 (2022-05-07)

### Bug Fixes:

* **router-lite:** downstream propagation of fallback (#1406) ([53ce891](https://github.com/aurelia/aurelia/commit/53ce891))
* **router-lite:** reinstated the router state post navigation fail ([53ce891](https://github.com/aurelia/aurelia/commit/53ce891))
* **router-lite:** unrecognized route error even if empty route is configured ([53ce891](https://github.com/aurelia/aurelia/commit/53ce891))


### Refactorings:

* **runtime-html:** remove .js from im/export, add type to barrel ([973ae46](https://github.com/aurelia/aurelia/commit/973ae46))
* **runtime:** remove .js from im/export, add type to barrel ([973ae46](https://github.com/aurelia/aurelia/commit/973ae46))
* **kernel:** remove .js from im/ex, add type to barrel ([973ae46](https://github.com/aurelia/aurelia/commit/973ae46))
* **testing:** remove .js from im/ex, add type to barrel ([973ae46](https://github.com/aurelia/aurelia/commit/973ae46))
* **store-v1:** remove .js from im/ex, add type to barrel ([973ae46](https://github.com/aurelia/aurelia/commit/973ae46))
* **validation:** remove .js from im/ex, add type to barrel ([973ae46](https://github.com/aurelia/aurelia/commit/973ae46))
* **validation-html:** remove .js from im/ex, add type to barrel ([973ae46](https://github.com/aurelia/aurelia/commit/973ae46))
* **validation-i18n:** remove .js from im/ex, add type to barrel ([973ae46](https://github.com/aurelia/aurelia/commit/973ae46))
* **router-lite:** remove .js from im/ex, add type to barrel ([973ae46](https://github.com/aurelia/aurelia/commit/973ae46))
* **router:** remove .js from im/ex, add type to barrel ([973ae46](https://github.com/aurelia/aurelia/commit/973ae46))
* **i18n:** remove .js from im/ex, add type to barrel ([973ae46](https://github.com/aurelia/aurelia/commit/973ae46))
* **fetch-client:** remove .js from im/ex, add type to barrel ([973ae46](https://github.com/aurelia/aurelia/commit/973ae46))
* **tests:** correct import origins ([973ae46](https://github.com/aurelia/aurelia/commit/973ae46))
* **all:** remove imports from re-barrel ([973ae46](https://github.com/aurelia/aurelia/commit/973ae46))
* **all:** remove imports of re-barrel ([973ae46](https://github.com/aurelia/aurelia/commit/973ae46))
* **all:** remove imports of re-barrel ([973ae46](https://github.com/aurelia/aurelia/commit/973ae46))
* **all:** remove imports of re-barrel ([973ae46](https://github.com/aurelia/aurelia/commit/973ae46))

<a name="2.0.0-alpha.29"></a>
# 2.0.0-alpha.29 (2022-04-27)

### Features:

* **router-lite:** global fallback support ([ac9dd1d](https://github.com/aurelia/aurelia/commit/ac9dd1d))


### Bug Fixes:

* **router-lite:** eslint issues ([77c4191](https://github.com/aurelia/aurelia/commit/77c4191))
* **router-lite:** smoke tests ([8e30e43](https://github.com/aurelia/aurelia/commit/8e30e43))
* **router:** sibling-viewport resolution ([6ed9996](https://github.com/aurelia/aurelia/commit/6ed9996))


### Refactorings:

* **router-lite:** removal of direct routing wip ([80de920](https://github.com/aurelia/aurelia/commit/80de920))

<a name="2.0.0-alpha.28"></a>
# 2.0.0-alpha.28 (2022-04-16)

**Note:** Version bump only for package @aurelia/router-lite

<a name="2.0.0-alpha.27"></a>
# 2.0.0-alpha.27 (2022-04-08)

### Bug Fixes:

* **build:** ensure correct __DEV__ build value replacement (#1377) ([40ce0e3](https://github.com/aurelia/aurelia/commit/40ce0e3))


### Refactorings:

* **all:** removing unnecessary assertions & lintings (#1371) ([05cec15](https://github.com/aurelia/aurelia/commit/05cec15))

<a name="2.0.0-alpha.26"></a>
# 2.0.0-alpha.26 (2022-03-13)

**Note:** Version bump only for package @aurelia/router-lite

<a name="2.0.0-alpha.25"></a>
# 2.0.0-alpha.25 (2022-03-08)

**Note:** Version bump only for package @aurelia/router-lite

<a name="2.0.0-alpha.24"></a>
# 2.0.0-alpha.24 (2022-01-18)

**Note:** Version bump only for package @aurelia/router

<a name="2.0.0-alpha.23"></a>
# 2.0.0-alpha.23 (2021-11-22)

**Note:** Version bump only for package @aurelia/router

<a name="2.0.0-alpha.22"></a>
# 2.0.0-alpha.22 (2021-10-24)

### Refactorings:

* **router:** querystring propagation ([3defa87](https://github.com/aurelia/aurelia/commit/3defa87))

<a name="2.0.0-alpha.21"></a>
# 2.0.0-alpha.21 (2021-09-12)

**Note:** Version bump only for package @aurelia/router

<a name="2.0.0-alpha.20"></a>
# 2.0.0-alpha.20 (2021-09-04)

### Features:

* **router:** add support for component factory ([8541b48](https://github.com/aurelia/aurelia/commit/8541b48))

<a name="2.0.0-alpha.19"></a>
# 2.0.0-alpha.19 (2021-08-29)

**Note:** Version bump only for package @aurelia/router

<a name="2.0.0-alpha.18"></a>
# 2.0.0-alpha.18 (2021-08-22)

**Note:** Version bump only for package @aurelia/router

<a name="2.0.0-alpha.17"></a>
# 2.0.0-alpha.17 (2021-08-16)

### Bug Fixes:

* ***:** routing context ([c63be47](https://github.com/aurelia/aurelia/commit/c63be47))

<a name="2.0.0-alpha.16"></a>
# 2.0.0-alpha.16 (2021-08-07)

### Bug Fixes:

* **href:** avoid interfering with native href ([de625d2](https://github.com/aurelia/aurelia/commit/de625d2))

<a name="2.0.0-alpha.15"></a>
# 2.0.0-alpha.15 (2021-08-01)

**Note:** Version bump only for package @aurelia/router

<a name="2.0.0-alpha.14"></a>
# 2.0.0-alpha.14 (2021-07-25)

### Refactorings:

* **controller:** rename semi public APIs ([c2ee6e9](https://github.com/aurelia/aurelia/commit/c2ee6e9))

<a name="2.0.0-alpha.13"></a>
# 2.0.0-alpha.13 (2021-07-19)

### Refactorings:

* **controller:** remove ctx ctrl requirement from .forCustomElement ([7edcef2](https://github.com/aurelia/aurelia/commit/7edcef2))
* **render-context:** remove render context ([7d38f53](https://github.com/aurelia/aurelia/commit/7d38f53))

<a name="2.0.0-alpha.12"></a>
# 2.0.0-alpha.12 (2021-07-11)

**Note:** Version bump only for package @aurelia/router

<a name="2.0.0-alpha.11"></a>
# 2.0.0-alpha.11 (2021-07-11)

### Bug Fixes:

* **call-binding:** assign args to event property, fixes #1231 ([fa4c0d4](https://github.com/aurelia/aurelia/commit/fa4c0d4))


### Refactorings:

* **all:** use container from controller instead of context ([0822330](https://github.com/aurelia/aurelia/commit/0822330))
* **context:** remove IContainer interface impls out of Render/Route context ([18524de](https://github.com/aurelia/aurelia/commit/18524de))
* **router:** distinguish between RouteContext and IContainer ([39169bf](https://github.com/aurelia/aurelia/commit/39169bf))
* **context:** distinguish between render context and its container ([f216e98](https://github.com/aurelia/aurelia/commit/f216e98))

<a name="2.0.0-alpha.10"></a>
# 2.0.0-alpha.10 (2021-07-04)

### Refactorings:

* **templating:** remove projections param from getRenderContext ([cf34e40](https://github.com/aurelia/aurelia/commit/cf34e40))

<a name="2.0.0-alpha.9"></a>
# 2.0.0-alpha.9 (2021-06-25)

### Performance Improvements:

* **di:** do not create a new factory in .invoke() ([23c0405](https://github.com/aurelia/aurelia/commit/23c0405))
* **di:** minification friendlier di code ([23c0405](https://github.com/aurelia/aurelia/commit/23c0405))


### Refactorings:

* **templating:** change timing of the container of a CE ([23c0405](https://github.com/aurelia/aurelia/commit/23c0405))

<a name="2.0.0-alpha.8"></a>
# 2.0.0-alpha.8 (2021-06-22)

**Note:** Version bump only for package @aurelia/router

<a name="2.0.0-alpha.7"></a>
# 2.0.0-alpha.7 (2021-06-20)

### Bug Fixes:

* **router:** ensure href recognize external ([387c084](https://github.com/aurelia/aurelia/commit/387c084))

<a name="2.0.0-alpha.6"></a>
# 2.0.0-alpha.6 (2021-06-11)

**Note:** Version bump only for package @aurelia/router

<a name="2.0.0-alpha.5"></a>
# 2.0.0-alpha.5 (2021-05-31)

**Note:** Version bump only for package @aurelia/router

<a name="2.0.0-alpha.4"></a>
# 2.0.0-alpha.4 (2021-05-25)

**Note:** Version bump only for package @aurelia/router

<a name="2.0.0-alpha.3"></a>
# 2.0.0-alpha.3 (2021-05-19)

### Features:

* **app-task:** allow app task to be created without a key ([2786898](https://github.com/aurelia/aurelia/commit/2786898))


### Bug Fixes:

* **router:** fix baseHref issue and fragment hash routing ([6647e54](https://github.com/aurelia/aurelia/commit/6647e54))
* **router:** fix issue where @default would be included when last segment is empty ([ed54dd4](https://github.com/aurelia/aurelia/commit/ed54dd4))
* **router:** fix fragment hash routing ([4cc336e](https://github.com/aurelia/aurelia/commit/4cc336e))


### Refactorings:

* **app-task:** simplify usage, align with .createInterface ([2786898](https://github.com/aurelia/aurelia/commit/2786898))

<a name="2.0.0-alpha.2"></a>
# 2.0.0-alpha.2 (2021-03-07)

### Features:

* **di:** add invoke to route context ([3c51a30](https://github.com/aurelia/aurelia/commit/3c51a30))


### Bug Fixes:

* **runtime:** fix duplicate lifecycleHooks resolution at root ([3b245ec](https://github.com/aurelia/aurelia/commit/3b245ec))
* **router:** fix direct routing parenthesized parameters ([73f106d](https://github.com/aurelia/aurelia/commit/73f106d))
* **router:** restore au-viewport's fallback property ([4f57cc5](https://github.com/aurelia/aurelia/commit/4f57cc5))
* **router:** fix the au-viewport's default attribute ([25c87a8](https://github.com/aurelia/aurelia/commit/25c87a8))

<a name="2.0.0-alpha.1"></a>
# 2.0.0-alpha.1 (2021-03-03)

**Note:** Version bump only for package @aurelia/router

<a name="2.0.0-alpha.0"></a>
# 2.0.0-alpha.0 (2021-03-02)

**Note:** Version bump only for package @aurelia/router

<a name="0.9.0"></a>
# 0.9.0 (2021-01-31)

### Features:

* **router:** preserve original path / finalPath values in RouteNode ([e7aab7f](https://github.com/aurelia/aurelia/commit/e7aab7f))
* **router:** add simple title customization api ([8ad49ad](https://github.com/aurelia/aurelia/commit/8ad49ad))
* **di:** remove DI.createInterface builder ([8146dcc](https://github.com/aurelia/aurelia/commit/8146dcc))
* **route-recognizer:** support path array ([b1ef7f1](https://github.com/aurelia/aurelia/commit/b1ef7f1))


### Bug Fixes:

* **route-expression:** fix segment grouping, scoping and serialization ([5acd0ed](https://github.com/aurelia/aurelia/commit/5acd0ed))
* **router:** querystring ([eca9606](https://github.com/aurelia/aurelia/commit/eca9606))
* **router:** update document.title ([071fd38](https://github.com/aurelia/aurelia/commit/071fd38))
* **router:** set default swap strat to remove-first ([bad1f26](https://github.com/aurelia/aurelia/commit/bad1f26))
* **router:** fix component agent slip-up ([e49d579](https://github.com/aurelia/aurelia/commit/e49d579))
* **load:** apply the correct href attribute (preliminary)' ([e63d7fe](https://github.com/aurelia/aurelia/commit/e63d7fe))
* **router:** pass data property to route node in direct routing ([6fc0e6b](https://github.com/aurelia/aurelia/commit/6fc0e6b))
* **router:** fix params inheritance ([63df5ac](https://github.com/aurelia/aurelia/commit/63df5ac))
* **router:** fix relative/absolute navigation ([2bcf8d2](https://github.com/aurelia/aurelia/commit/2bcf8d2))
* **router:** fix absolute & relative paths ([6f2a49f](https://github.com/aurelia/aurelia/commit/6f2a49f))
* **router:** add transitionPlan validation prop ([0f1b271](https://github.com/aurelia/aurelia/commit/0f1b271))
* **router:** fix some lazy-loading edge cases / cleanup route-recognizer ([0043dad](https://github.com/aurelia/aurelia/commit/0043dad))
* **router:** fix load isActive and expose it as a fromView bindable ([2e3eaaf](https://github.com/aurelia/aurelia/commit/2e3eaaf))
* **router:** fix href isEnabled logic ([7f8ea00](https://github.com/aurelia/aurelia/commit/7f8ea00))
* **router:** fix several issues in link handler and add trace logging ([8b9fa29](https://github.com/aurelia/aurelia/commit/8b9fa29))
* **router:** add missing route config properties to the validator ([f8367a6](https://github.com/aurelia/aurelia/commit/f8367a6))
* **router:** stop the router on AppTask.afterDeactivate ([aca6d81](https://github.com/aurelia/aurelia/commit/aca6d81))
* **router:** use afterActivate app task ([d17bab7](https://github.com/aurelia/aurelia/commit/d17bab7))
* **router:** fix caching issue with two siblings that are the same component ([3e60c79](https://github.com/aurelia/aurelia/commit/3e60c79))


### Refactorings:

* **router:** renames 'children' to 'routes' ([90b56a2](https://github.com/aurelia/aurelia/commit/90b56a2))
* **router:** use @lifecycleHooks api for shared hooks ([b308328](https://github.com/aurelia/aurelia/commit/b308328))
* **router:** fix some title stuff ([ddac8e0](https://github.com/aurelia/aurelia/commit/ddac8e0))
* **router:** various fixes w.r.t. relative/absolute urls and default resolution ([b6dc3b9](https://github.com/aurelia/aurelia/commit/b6dc3b9))
* **router:** fix several reference / clone issues w.r.t. redirects etc ([665a4c7](https://github.com/aurelia/aurelia/commit/665a4c7))
* **router:** cleanup/simplify the tree compiler ([9e0a30b](https://github.com/aurelia/aurelia/commit/9e0a30b))
* **all:** rename macroTaskQueue to taskQueue ([87c073d](https://github.com/aurelia/aurelia/commit/87c073d))
* **router:** cleanup load & href custom attributes, add v1 compat ([b75ea31](https://github.com/aurelia/aurelia/commit/b75ea31))
* **router:** rename resolutionStrategy to resolutionMode ([9591c7f](https://github.com/aurelia/aurelia/commit/9591c7f))
* **router:** rename deferral back to resolutionStrategy ([1b6adf1](https://github.com/aurelia/aurelia/commit/1b6adf1))
* **router:** use stack to minimize promise tick overhead + various improvements ([09d2379](https://github.com/aurelia/aurelia/commit/09d2379))
* **viewport-agent:** utilize controller lifecycle linkage ([8e72222](https://github.com/aurelia/aurelia/commit/8e72222))
* **router:** remove guard-hooks option ([054f0a7](https://github.com/aurelia/aurelia/commit/054f0a7))
* **router:** port of PR #845 ([a67d0a2](https://github.com/aurelia/aurelia/commit/a67d0a2))

<a name="0.8.0"></a>
# 0.8.0 (2020-11-30)

### Features:

* **router:** review async in lifecycle hooks ([4c25d16](https://github.com/aurelia/aurelia/commit/4c25d16))
* **router:** add  swap & use coordinator and runner ([70d97a3](https://github.com/aurelia/aurelia/commit/70d97a3))
* **router:** add navigation coordinator ([071dc5f](https://github.com/aurelia/aurelia/commit/071dc5f))
* **router:** add runner ([a4f0310](https://github.com/aurelia/aurelia/commit/a4f0310))
* **runtime:** add component tree visitor infra ([5dd0f67](https://github.com/aurelia/aurelia/commit/5dd0f67))


### Bug Fixes:

* **event-manager:** properly handle delegate events with shadowDOM / cleanup ([b79e7ba](https://github.com/aurelia/aurelia/commit/b79e7ba))
* **router:** restore router ([822838c](https://github.com/aurelia/aurelia/commit/822838c))
* ***:** broken tests ([3a73602](https://github.com/aurelia/aurelia/commit/3a73602))


### Refactorings:

* **i18n-router:** adapt runtime flag refactoring ([8e2d7e7](https://github.com/aurelia/aurelia/commit/8e2d7e7))
* **dom:** give INode, IEventTarget and IRenderLocation overrideable generic types ([e2ac8b2](https://github.com/aurelia/aurelia/commit/e2ac8b2))
* **all:** add .js extensions for native esm compat ([0308e2e](https://github.com/aurelia/aurelia/commit/0308e2e))
* **controller:** remove projector abstraction & rework attaching ([d69d03d](https://github.com/aurelia/aurelia/commit/d69d03d))
* **all:** rename beforeUnbind to unbinding ([17a82ed](https://github.com/aurelia/aurelia/commit/17a82ed))
* **all:** rename beforeDetach to detaching ([0fcb64d](https://github.com/aurelia/aurelia/commit/0fcb64d))
* **all:** rename afterAttach to attaching ([0178027](https://github.com/aurelia/aurelia/commit/0178027))
* **all:** rename afterBind to bound ([696f5d4](https://github.com/aurelia/aurelia/commit/696f5d4))
* **all:** rename beforeBind to binding ([67b1c5d](https://github.com/aurelia/aurelia/commit/67b1c5d))
* **all:** rename CompositionContext back to RenderContext again ([1d7673b](https://github.com/aurelia/aurelia/commit/1d7673b))
* **controller:** rename beforeComposeChildren to hydrated ([041a2ff](https://github.com/aurelia/aurelia/commit/041a2ff))
* **all:** remove afterUnbind and afterUnbindChildren, and make deactivate bottom-up ([a431fdc](https://github.com/aurelia/aurelia/commit/a431fdc))
* **all:** move scheduler implementation to platform ([e22285a](https://github.com/aurelia/aurelia/commit/e22285a))
* **all:** remove IDOM, HTMLDOM and DOM; replace DOM with PLATFORM ([6447468](https://github.com/aurelia/aurelia/commit/6447468))
* **all:** move html-specific stuff from runtime to runtime-html and remove Node generics ([c745963](https://github.com/aurelia/aurelia/commit/c745963))
* **all:** remove PLATFORM global ([fdef656](https://github.com/aurelia/aurelia/commit/fdef656))
* **runtime:** rename afterCompose to beforeComposeChildren ([f65bb7b](https://github.com/aurelia/aurelia/commit/f65bb7b))
* **runtime:** rename CompositionRoot to AppRoot ([3141a2c](https://github.com/aurelia/aurelia/commit/3141a2c))
* **all:** shorten TargetedInstruction to Instruction ([a7e61c6](https://github.com/aurelia/aurelia/commit/a7e61c6))
* **all:** finish renaming render to compose ([ede127b](https://github.com/aurelia/aurelia/commit/ede127b))
* **runtime:** remove ILifecycleTask ([69f5fac](https://github.com/aurelia/aurelia/commit/69f5fac))
* **runtime:** properly wireup root controller compilation hooks with apptasks & cleanup ([6a1f32f](https://github.com/aurelia/aurelia/commit/6a1f32f))
* **runtime:** add ICompositionRoot and IAurelia interfaces and pass container+root into controllers ([23477a3](https://github.com/aurelia/aurelia/commit/23477a3))
* **all:** remove reporter ([425fe96](https://github.com/aurelia/aurelia/commit/425fe96))
* **start-task:** rename StartTask to AppTask ([b52fc9c](https://github.com/aurelia/aurelia/commit/b52fc9c))
* **router:** use afterDeactivate hook for stopping ([3683586](https://github.com/aurelia/aurelia/commit/3683586))
* **lifecycle-task:** rename afterAttach to afterActivate ([4045977](https://github.com/aurelia/aurelia/commit/4045977))
* **lifecycle-task:** rename beforeBind to beforeActivate ([b363f2f](https://github.com/aurelia/aurelia/commit/b363f2f))
* **all:** sync up remaining api changes ([29d6520](https://github.com/aurelia/aurelia/commit/29d6520))
* **router:** fix error (temporarily) ([3e57ecb](https://github.com/aurelia/aurelia/commit/3e57ecb))
* **router:** fix merge conflicts ([57076f0](https://github.com/aurelia/aurelia/commit/57076f0))
* **router:** add more lifecycle behaviors ([e46f77c](https://github.com/aurelia/aurelia/commit/e46f77c))
* **router:** add more lifecycle behaviors & change goto to load ([f49cca0](https://github.com/aurelia/aurelia/commit/f49cca0))
* **router:** fix viewport scope (unfinished) ([157683a](https://github.com/aurelia/aurelia/commit/157683a))
* **router:** replace bind+attach with activate ([19012ae](https://github.com/aurelia/aurelia/commit/19012ae))
* **router:** rename INavigatorFlags to INavigationFlags ([0ea131f](https://github.com/aurelia/aurelia/commit/0ea131f))
* **router:** replace INavigatorInstruction with Navigation ([081b602](https://github.com/aurelia/aurelia/commit/081b602))
* **runtime:** cleanup unused flags ([77a930e](https://github.com/aurelia/aurelia/commit/77a930e))
* **runtime:** merge controller api bind+attach into activate, detach+unbind into deactivate, and remove ILifecycleTask usage from controller ([15f3885](https://github.com/aurelia/aurelia/commit/15f3885))
* **lifecycle-task:** remove cancellation ([23af2af](https://github.com/aurelia/aurelia/commit/23af2af))
* **lifecycles:** pass down first + parent controller in the 'before' hooks and use that as the queue instead of ILifecycle ([031b7fd](https://github.com/aurelia/aurelia/commit/031b7fd))
* **all:** rename afterDetach to afterDetachChildren ([080a724](https://github.com/aurelia/aurelia/commit/080a724))
* **all:** rename afterUnbind to afterUnbindChildren ([09f1972](https://github.com/aurelia/aurelia/commit/09f1972))
* **all:** rename afterAttach to afterAttachChildren ([02b573e](https://github.com/aurelia/aurelia/commit/02b573e))
* **all:** rename afterBind to afterBindChildren ([bf0d79e](https://github.com/aurelia/aurelia/commit/bf0d79e))

<a name="0.7.0"></a>
# 0.7.0 (2020-05-08)

### Features:

* **router:** set no multi bindings on href attribute ([f6e6f23](https://github.com/aurelia/aurelia/commit/f6e6f23))
* **router:** set no multi bindings on href attribute ([a1762e7](https://github.com/aurelia/aurelia/commit/a1762e7))
* **router:** enable exist for viewport attributes ([568cd35](https://github.com/aurelia/aurelia/commit/568cd35))
* **router:** increase instructions capacity ([3a99fa0](https://github.com/aurelia/aurelia/commit/3a99fa0))
* **router:** make clear all instruction scope aware ([18c59f6](https://github.com/aurelia/aurelia/commit/18c59f6))
* **router:** add name and source to viewport scope ([487e510](https://github.com/aurelia/aurelia/commit/487e510))
* **router:** add name and source to viewport scope ([d0a4ea4](https://github.com/aurelia/aurelia/commit/d0a4ea4))
* **router:** add viewport scope custom element ([3ad63ba](https://github.com/aurelia/aurelia/commit/3ad63ba))
* **router:** add viewport scope custom element ([a88ca71](https://github.com/aurelia/aurelia/commit/a88ca71))
* **router:** improve viewport instruction stringification ([6317646](https://github.com/aurelia/aurelia/commit/6317646))
* **router:** implement TransformToUrl hook ([85ffc9a](https://github.com/aurelia/aurelia/commit/85ffc9a))
* **router:** make hooks async ([1cb3bcc](https://github.com/aurelia/aurelia/commit/1cb3bcc))
* **router:** make hooks async ([0367d76](https://github.com/aurelia/aurelia/commit/0367d76))
* **router:** implement TransformFromUrl hook ([86171eb](https://github.com/aurelia/aurelia/commit/86171eb))
* **router:** add hook overloads ([8ba832d](https://github.com/aurelia/aurelia/commit/8ba832d))
* **router:** implement BeforeNavigation hook ([5f4e3f9](https://github.com/aurelia/aurelia/commit/5f4e3f9))
* **router:** add hooks api ([e4db4c2](https://github.com/aurelia/aurelia/commit/e4db4c2))
* **router:** add hooks as configuration option ([a8665fc](https://github.com/aurelia/aurelia/commit/a8665fc))
* **router:** add hooks ([55ecd2c](https://github.com/aurelia/aurelia/commit/55ecd2c))
* **router:** add viewport fallback ([ea8137d](https://github.com/aurelia/aurelia/commit/ea8137d))
* **router:** add found route class ([08e6dcb](https://github.com/aurelia/aurelia/commit/08e6dcb))
* **router:** update find instruction ([fe74344](https://github.com/aurelia/aurelia/commit/fe74344))
* **router:** update parent update ([258f7e4](https://github.com/aurelia/aurelia/commit/258f7e4))
* **router:** use $au to find controller view model ([1e28f59](https://github.com/aurelia/aurelia/commit/1e28f59))
* **router:** clone found route before using it ([9210923](https://github.com/aurelia/aurelia/commit/9210923))
* **router:** remove whitespace in viewport html ([8ae2949](https://github.com/aurelia/aurelia/commit/8ae2949))
* **router:** add route configuration (temp commit) ([c497245](https://github.com/aurelia/aurelia/commit/c497245))
* **router:** add route configuration (temp commit) ([28ea406](https://github.com/aurelia/aurelia/commit/28ea406))


### Bug Fixes:

* **router:** make goto-active consider parameters ([b7391a0](https://github.com/aurelia/aurelia/commit/b7391a0))
* **router:** correct conditional check ([2827ea6](https://github.com/aurelia/aurelia/commit/2827ea6))
* **router:** fix rebase issue ([e39f82f](https://github.com/aurelia/aurelia/commit/e39f82f))
* **router:** fix rebase issue ([269a77d](https://github.com/aurelia/aurelia/commit/269a77d))


### Refactorings:

* **route-recognizer:** rewrite to fix ambiguous edge cases etc ([b636dc3](https://github.com/aurelia/aurelia/commit/b636dc3))
* **route-recognizer:** rewrite the route recognizer and move to separate package ([82995cd](https://github.com/aurelia/aurelia/commit/82995cd))
* **router:** clean up ([7a1414d](https://github.com/aurelia/aurelia/commit/7a1414d))
* **viewport-scope:** use template part substitution instead of replaceable ([e8bd7b2](https://github.com/aurelia/aurelia/commit/e8bd7b2))
* **router:** fix merge issues ([dcc0b2c](https://github.com/aurelia/aurelia/commit/dcc0b2c))
* **router:** await task queue execute ([aa5dbd8](https://github.com/aurelia/aurelia/commit/aa5dbd8))
* **router:** fix linting errors ([a2d4136](https://github.com/aurelia/aurelia/commit/a2d4136))
* **router:** fix merge issues ([f66d7ad](https://github.com/aurelia/aurelia/commit/f66d7ad))
* **router:** fix merge issues ([42b986e](https://github.com/aurelia/aurelia/commit/42b986e))
* **router:** set proper owning scope when add instruction ([63a4d6f](https://github.com/aurelia/aurelia/commit/63a4d6f))
* **router:** remove source item at finalize and remove id ([46f8b2d](https://github.com/aurelia/aurelia/commit/46f8b2d))
* **router:** exclude viewport scope in stringify viewport instruction ([1907ec3](https://github.com/aurelia/aurelia/commit/1907ec3))
* **router:** improve keep instances on clone viewport instruction ([91b42fe](https://github.com/aurelia/aurelia/commit/91b42fe))
* **router:** set viewport scope name in initial content ([f825db6](https://github.com/aurelia/aurelia/commit/f825db6))
* **router:** don't use viewport scope when add in find viewports ([ddd1720](https://github.com/aurelia/aurelia/commit/ddd1720))
* **router:** disconnect from parent not owning scope ([4964bfb](https://github.com/aurelia/aurelia/commit/4964bfb))
* **router:** only clone viewport scope when viewport instances ([bd51e5d](https://github.com/aurelia/aurelia/commit/bd51e5d))
* **router:** add clear scope owners to router ([e413bf3](https://github.com/aurelia/aurelia/commit/e413bf3))
* **router:** add isEmpty and improve find viewport scope ([0261080](https://github.com/aurelia/aurelia/commit/0261080))
* **router:** add isEmpty, add, default, catches to viewport scope ([4a3e65a](https://github.com/aurelia/aurelia/commit/4a3e65a))
* **router:** add isEmpty to viewport ([2539eb3](https://github.com/aurelia/aurelia/commit/2539eb3))
* **router:** support add viewport scope ([8889e6f](https://github.com/aurelia/aurelia/commit/8889e6f))
* **router:** replace browser navigator with browser viewer store ([95d0588](https://github.com/aurelia/aurelia/commit/95d0588))
* **router:** use lamdba functions in browser viewer store ([f0ff98c](https://github.com/aurelia/aurelia/commit/f0ff98c))
* **router:** add lamdba and no callback support to task queue ([4272e15](https://github.com/aurelia/aurelia/commit/4272e15))
* **router:** add browser viewer store ([807f106](https://github.com/aurelia/aurelia/commit/807f106))
* **router:** add task queue ([5605d57](https://github.com/aurelia/aurelia/commit/5605d57))
* **router:** implement scope owner and scoped clear ([0a63a5a](https://github.com/aurelia/aurelia/commit/0a63a5a))
* **router:** add collection property (not yet used) ([8aa8179](https://github.com/aurelia/aurelia/commit/8aa8179))
* **router:** implement scope owner and source ([7cf7963](https://github.com/aurelia/aurelia/commit/7cf7963))
* **router:** add instruction type checks ([7ba62ef](https://github.com/aurelia/aurelia/commit/7ba62ef))
* **router:** expand scope owner and find viewports ([3a9f92c](https://github.com/aurelia/aurelia/commit/3a9f92c))
* **router:** add collection for improved array iteration ([f890191](https://github.com/aurelia/aurelia/commit/f890191))
* **router:** connect viewport in creating ([2403df7](https://github.com/aurelia/aurelia/commit/2403df7))
* **router:** replace render context with container ([2889832](https://github.com/aurelia/aurelia/commit/2889832))
* **router:** clean up ([6a72d99](https://github.com/aurelia/aurelia/commit/6a72d99))
* **router:** use controller for goto active ([b1bd144](https://github.com/aurelia/aurelia/commit/b1bd144))
* **router:** don't updateNav after navigation ([43f0472](https://github.com/aurelia/aurelia/commit/43f0472))
* **router:** add check active to router and goto ([0d08008](https://github.com/aurelia/aurelia/commit/0d08008))
* **router:** use creating and containers in custom elements ([e7f4d7b](https://github.com/aurelia/aurelia/commit/e7f4d7b))
* **router:** add viewport instruction collection (unused) ([3b1d3a6](https://github.com/aurelia/aurelia/commit/3b1d3a6))
* **router:** remove default viewports and add stale check ([f71a0a7](https://github.com/aurelia/aurelia/commit/f71a0a7))
* **router:** use scope, viewport scope and Closest in container ([bdfc9d7](https://github.com/aurelia/aurelia/commit/bdfc9d7))
* **router:** use scope as connecting scope ([853f52a](https://github.com/aurelia/aurelia/commit/853f52a))
* **router:** add createViewportInstruction to type resolvers ([202edf9](https://github.com/aurelia/aurelia/commit/202edf9))
* **router:** add scope (back) ([dfb1344](https://github.com/aurelia/aurelia/commit/dfb1344))
* **router:** add viewport scope ([1e8f5ee](https://github.com/aurelia/aurelia/commit/1e8f5ee))
* **router:** use scope instead of viewport scope ([fef7363](https://github.com/aurelia/aurelia/commit/fef7363))
* **router:** copy viewport scope when cloning ([52d97c3](https://github.com/aurelia/aurelia/commit/52d97c3))
* **router:** use goto in nav ([14ebf89](https://github.com/aurelia/aurelia/commit/14ebf89))
* **router:** update closest and viewport scopes ([411315f](https://github.com/aurelia/aurelia/commit/411315f))
* **router:** add context to viewport instruction ([6911365](https://github.com/aurelia/aurelia/commit/6911365))
* **router:** relocate ensureRootScope to activate ([3b5d176](https://github.com/aurelia/aurelia/commit/3b5d176))
* **router:** add ViewportScope ([e764eb2](https://github.com/aurelia/aurelia/commit/e764eb2))
* **router:** implement own CustomElement.for ([46dd7e5](https://github.com/aurelia/aurelia/commit/46dd7e5))
* **router:** remove closest ([930396e](https://github.com/aurelia/aurelia/commit/930396e))
* **router:** move loadComponent/created first ([15edabc](https://github.com/aurelia/aurelia/commit/15edabc))
* **router:** add ParentViewport and setClosestViewport ([f753bb4](https://github.com/aurelia/aurelia/commit/f753bb4))
* **router:** add get/setClosestViewport & remove closest ([c87171e](https://github.com/aurelia/aurelia/commit/c87171e))
* **router:** fix rebase issues (temporary) ([3c6301c](https://github.com/aurelia/aurelia/commit/3c6301c))
* **router:** clean up ([5e49a09](https://github.com/aurelia/aurelia/commit/5e49a09))
* **router:** remove route transformer and route table ([dbdd399](https://github.com/aurelia/aurelia/commit/dbdd399))
* **router:** remove guardian ([af9a006](https://github.com/aurelia/aurelia/commit/af9a006))
* **router:** remove template from viewport ([3b8b1f2](https://github.com/aurelia/aurelia/commit/3b8b1f2))
* **router:** use and pass specified parameters ([7b012fa](https://github.com/aurelia/aurelia/commit/7b012fa))
* **router:** use createViewportInstruction ([c49688a](https://github.com/aurelia/aurelia/commit/c49688a))
* **router:** use new same parameters check ([e0a3f43](https://github.com/aurelia/aurelia/commit/e0a3f43))
* **router:** add createViewportInstruction & stringify specified parameters ([c9718de](https://github.com/aurelia/aurelia/commit/c9718de))
* **router:** keep parameter types & add specified, sorted and instruction resolver ([39a41db](https://github.com/aurelia/aurelia/commit/39a41db))
* **router:** use createViewportInstruction ([f4172e2](https://github.com/aurelia/aurelia/commit/f4172e2))
* **router:** add createViewportInstruction & skip parseQuery ([0e84473](https://github.com/aurelia/aurelia/commit/0e84473))
* **router:** remove mergeParameters & refactor parseQuery ([93ddcc1](https://github.com/aurelia/aurelia/commit/93ddcc1))
* **router:** remove parameterList from interface ([3adbb30](https://github.com/aurelia/aurelia/commit/3adbb30))
* **router:** update component parameters interface ([63d4a38](https://github.com/aurelia/aurelia/commit/63d4a38))
* **router:** add component parameters parsing & hidden component ([bfc4640](https://github.com/aurelia/aurelia/commit/bfc4640))
* **router:** rename to parametersRecord in viewport instruction ([e05f8d3](https://github.com/aurelia/aurelia/commit/e05f8d3))
* **router:** add route to viewport instruction ([f3f08d2](https://github.com/aurelia/aurelia/commit/f3f08d2))
* **router:** make refresh new default viewport load behavior ([f07722f](https://github.com/aurelia/aurelia/commit/f07722f))
* **router:** add add parameters to viewport instruction ([7e96cb9](https://github.com/aurelia/aurelia/commit/7e96cb9))
* **router:** clean up and fix linting issue ([32f940d](https://github.com/aurelia/aurelia/commit/32f940d))
* **router:** add replaced children to viewport ([5d34879](https://github.com/aurelia/aurelia/commit/5d34879))
* **router:** add children to IViewportInstruction ([fc380cb](https://github.com/aurelia/aurelia/commit/fc380cb))
* **router:** remove viewport header ([dbe6a88](https://github.com/aurelia/aurelia/commit/dbe6a88))
* **router:** clean up ([1490a74](https://github.com/aurelia/aurelia/commit/1490a74))
* **router:** use route recognizer in viewport ([2b9c527](https://github.com/aurelia/aurelia/commit/2b9c527))
* **router:** fix linting errors ([c59e761](https://github.com/aurelia/aurelia/commit/c59e761))
* **router:** excluded replaced viewports from enabled ([35b4f77](https://github.com/aurelia/aurelia/commit/35b4f77))
* **router:** renamed to appendedViewport & no config routes with siblings ([142b346](https://github.com/aurelia/aurelia/commit/142b346))
* **router:** update same viewport check in viewport instruction ([a8dcfa4](https://github.com/aurelia/aurelia/commit/a8dcfa4))

<a name="0.6.0"></a>
# 0.6.0 (2019-12-18)

### Features:

* **controller:** add create/beforeCompile/afterCompile/afterCompileChildren hooks ([3a8c215](https://github.com/aurelia/aurelia/commit/3a8c215))


### Refactorings:

* **all:** refine+document controller interfaces and fix types/tests ([0a77fbd](https://github.com/aurelia/aurelia/commit/0a77fbd))
* **controller:** split up IController into several specialized interfaces + various small bugfixes ([05d8a8d](https://github.com/aurelia/aurelia/commit/05d8a8d))
* **router:** fix types / api calls ([57196f1](https://github.com/aurelia/aurelia/commit/57196f1))
* **runtime:** rename 'detached' to 'afterDetach' ([d1e2b0c](https://github.com/aurelia/aurelia/commit/d1e2b0c))
* **runtime:** rename 'attached' to 'afterAttach' ([6ae7be1](https://github.com/aurelia/aurelia/commit/6ae7be1))
* **runtime:** rename 'unbound' to 'afterUnbind' ([35e203c](https://github.com/aurelia/aurelia/commit/35e203c))
* **runtime:** rename 'detaching' to 'beforeDetach' ([9f8b858](https://github.com/aurelia/aurelia/commit/9f8b858))
* **runtime:** rename 'unbinding' to 'beforeUnbind' ([79cd5fa](https://github.com/aurelia/aurelia/commit/79cd5fa))
* **runtime:** rename 'attaching' to 'beforeAttach' ([4685bb1](https://github.com/aurelia/aurelia/commit/4685bb1))
* **runtime:** rename 'bound' to 'afterBind' ([4060bbe](https://github.com/aurelia/aurelia/commit/4060bbe))
* **runtime:** rename 'binding' to 'beforeBind' ([45b2e91](https://github.com/aurelia/aurelia/commit/45b2e91))

<a name="0.5.0"></a>
# 0.5.0 (2019-11-15)

### Bug Fixes:

* **router:** do not use DOM types in constructor args ([778e48f](https://github.com/aurelia/aurelia/commit/778e48f))


### Refactorings:

* **all:** rename behaviorFor to for ([0823dfe](https://github.com/aurelia/aurelia/commit/0823dfe))
* **router:** use new resource apis ([6fc87ae](https://github.com/aurelia/aurelia/commit/6fc87ae))

<a name="0.4.0"></a>
# 0.4.0 (2019-10-26)

### Features:

* **router:** fix linting issues ([ac4f884](https://github.com/aurelia/aurelia/commit/ac4f884))
* **router:** export au-href ([992c9c0](https://github.com/aurelia/aurelia/commit/992c9c0))
* **router:** use au-href custom attribute for links ([fe211c4](https://github.com/aurelia/aurelia/commit/fe211c4))
* **router:** add au-href custom attribute ([ebf9166](https://github.com/aurelia/aurelia/commit/ebf9166))
* **router:** fix guard target resolve ([3776d00](https://github.com/aurelia/aurelia/commit/3776d00))
* **router:** improve instruction parser (working) ([cc760ff](https://github.com/aurelia/aurelia/commit/cc760ff))
* **router:** improve instruction parser (working) ([f4b4806](https://github.com/aurelia/aurelia/commit/f4b4806))
* **router:** improve instruction parser (incomplete) ([dc3c6ee](https://github.com/aurelia/aurelia/commit/dc3c6ee))
* **router:** consolidate / for "hash and pushstate" ([6492182](https://github.com/aurelia/aurelia/commit/6492182))
* **router:** fix options for browser navigator ([dbf5449](https://github.com/aurelia/aurelia/commit/dbf5449))
* **router:** add configuration for use browser  fragment hash ([4b2f0c1](https://github.com/aurelia/aurelia/commit/4b2f0c1))
* **router:** update compute active in nav route ([e923639](https://github.com/aurelia/aurelia/commit/e923639))
* **router:** add flattenViewportInstructions ([43e15ac](https://github.com/aurelia/aurelia/commit/43e15ac))
* **router:** default true for ownsScope in ViewportInstruction ([570824d](https://github.com/aurelia/aurelia/commit/570824d))
* **router:** update router interface ([7bfed46](https://github.com/aurelia/aurelia/commit/7bfed46))
* **router:** switch ownsScope separator to noScope ([ee79039](https://github.com/aurelia/aurelia/commit/ee79039))
* **router:** add upwards scope traversal feat to link ([8b32b3b](https://github.com/aurelia/aurelia/commit/8b32b3b))
* **router:** add scope modifcations to link ([80f42a0](https://github.com/aurelia/aurelia/commit/80f42a0))
* **router:** make true default for viewport scope ([4298d78](https://github.com/aurelia/aurelia/commit/4298d78))
* **router:** fix review comments ([a75c569](https://github.com/aurelia/aurelia/commit/a75c569))
* **router:** add comment to configuration ([6a34ab3](https://github.com/aurelia/aurelia/commit/6a34ab3))
* **router:** implement configuration customization ([c7f6fa5](https://github.com/aurelia/aurelia/commit/c7f6fa5))
* **router:** make individual route separators optional in config ([1e8b61d](https://github.com/aurelia/aurelia/commit/1e8b61d))
* **router:** rename methods in nav route ([634196f](https://github.com/aurelia/aurelia/commit/634196f))
* **router:** add separator to nav ([7b73409](https://github.com/aurelia/aurelia/commit/7b73409))
* **router:** separate execute from route for nav route ([5be96e6](https://github.com/aurelia/aurelia/commit/5be96e6))
* **router:** add compare parameters to nav route ([9c69430](https://github.com/aurelia/aurelia/commit/9c69430))
* **router:** add nav update & executable nav route ([9aed948](https://github.com/aurelia/aurelia/commit/9aed948))
* **router:** make link handler ignore anchors without href ([b47da64](https://github.com/aurelia/aurelia/commit/b47da64))
* **router:** add NavRoute export ([043b7f1](https://github.com/aurelia/aurelia/commit/043b7f1))
* **router:** add condition to NavRoute ([6d49758](https://github.com/aurelia/aurelia/commit/6d49758))
* **router:** make NavRoute consideredActive accept function value ([d4b348d](https://github.com/aurelia/aurelia/commit/d4b348d))
* **router:** make navs immutable in router interface ([430c2d4](https://github.com/aurelia/aurelia/commit/430c2d4))
* **router:** make lifecycle task callback allow void return ([649a911](https://github.com/aurelia/aurelia/commit/649a911))
* **router:** use router configuration and interface ([427e95d](https://github.com/aurelia/aurelia/commit/427e95d))
* **router:** extract load url from router activate ([af26abf](https://github.com/aurelia/aurelia/commit/af26abf))
* **runtime:** initial implementation for startup tasks ([e4e1a14](https://github.com/aurelia/aurelia/commit/e4e1a14))
* **router:** make nav title use innerhtml ([17dcd1b](https://github.com/aurelia/aurelia/commit/17dcd1b))
* **router:** add customizeable classes to au-nav ([a041251](https://github.com/aurelia/aurelia/commit/a041251))
* **router:** add only if processing to addProcessingViewports ([29690d0](https://github.com/aurelia/aurelia/commit/29690d0))
* **router:** add mergeViewportInstructions ([687dd5f](https://github.com/aurelia/aurelia/commit/687dd5f))
* **router:** add same component check to viewport instruction ([968e678](https://github.com/aurelia/aurelia/commit/968e678))
* **router:** check entry before replace in cancel ([7350e0c](https://github.com/aurelia/aurelia/commit/7350e0c))
* **router:** improve guard matching & remaining viewports ([6df8e8b](https://github.com/aurelia/aurelia/commit/6df8e8b))
* **router:** clean up guardian & move parameters next to component & refactor viewport defaults ([0c7eaca](https://github.com/aurelia/aurelia/commit/0c7eaca))
* **router:** add navigation guardian ([9130e40](https://github.com/aurelia/aurelia/commit/9130e40))
* **router:** hide viewport header ([15ac438](https://github.com/aurelia/aurelia/commit/15ac438))
* **router:** fix issue with scopeContext ([87c00bc](https://github.com/aurelia/aurelia/commit/87c00bc))
* **router:** improve viewport state and description ([178c318](https://github.com/aurelia/aurelia/commit/178c318))
* **router:** use controller parent to find closest ([bdb0804](https://github.com/aurelia/aurelia/commit/bdb0804))
* **router:** add customize to RouterConfiguration ([eed99ad](https://github.com/aurelia/aurelia/commit/eed99ad))
* **router:** remove await Promise.resolve in browser navigation activation ([f7c33e2](https://github.com/aurelia/aurelia/commit/f7c33e2))
* **router:** remove setTimeout in browser navigation activation ([93d1f2c](https://github.com/aurelia/aurelia/commit/93d1f2c))
* **router:** fix review comments ([e1c399a](https://github.com/aurelia/aurelia/commit/e1c399a))
* **router:** fix review issues ([c780a30](https://github.com/aurelia/aurelia/commit/c780a30))
* **router:** restructure default viewports & fix clear all viewports ([232e486](https://github.com/aurelia/aurelia/commit/232e486))
* **router:** await in navigator finalize and cancel ([7c7bec6](https://github.com/aurelia/aurelia/commit/7c7bec6))
* **router:** replace BrowserNavigation's queue with Queue ([769b1b8](https://github.com/aurelia/aurelia/commit/769b1b8))
* **router:** remove queued browser history ([7409151](https://github.com/aurelia/aurelia/commit/7409151))
* **router:** add navigation state ([6f553f3](https://github.com/aurelia/aurelia/commit/6f553f3))
* **router:** remove history browser ([81a28a8](https://github.com/aurelia/aurelia/commit/81a28a8))
* **router:** fix noHistory support ([d56a1bb](https://github.com/aurelia/aurelia/commit/d56a1bb))
* **router:** remove router queue ([27927bc](https://github.com/aurelia/aurelia/commit/27927bc))
* **router:** add browser navigation and queue ([95c8795](https://github.com/aurelia/aurelia/commit/95c8795))
* **router:** add navigator ([7ccf061](https://github.com/aurelia/aurelia/commit/7ccf061))
* **router:** add missing property ([916ee75](https://github.com/aurelia/aurelia/commit/916ee75))
* **router:** add IRouter ([46ba5c7](https://github.com/aurelia/aurelia/commit/46ba5c7))
* **router:** add configuration ([e1a23af](https://github.com/aurelia/aurelia/commit/e1a23af))
* **router:** update reentry defaults & add tests ([ac2e674](https://github.com/aurelia/aurelia/commit/ac2e674))
* **router:** add component reentry behavior ([8eae57d](https://github.com/aurelia/aurelia/commit/8eae57d))
* **router:** add initial cypress tests ([3ae5b7c](https://github.com/aurelia/aurelia/commit/3ae5b7c))
* **router:** change parameter separator to parantheses ([12eae80](https://github.com/aurelia/aurelia/commit/12eae80))
* **router:** add route table & update extension points ([bca6311](https://github.com/aurelia/aurelia/commit/bca6311))
* **router:** add stateful component caching for viewport ([5276f7b](https://github.com/aurelia/aurelia/commit/5276f7b))
* **router:** add redirect to canEnter result ([6e966d9](https://github.com/aurelia/aurelia/commit/6e966d9))
* **router:** add queued browser history ([26833b1](https://github.com/aurelia/aurelia/commit/26833b1))
* **router:** add first entry flag to history browser ([2c3982f](https://github.com/aurelia/aurelia/commit/2c3982f))
* **router:** add api for get all viewports to router ([cd73f04](https://github.com/aurelia/aurelia/commit/cd73f04))
* **router:** migrate route-recognizer ([13ea52e](https://github.com/aurelia/aurelia/commit/13ea52e))
* **router:** add previous to navigation instruction ([6cdc27b](https://github.com/aurelia/aurelia/commit/6cdc27b))
* **router:** add no-history on viewport ([45f19f0](https://github.com/aurelia/aurelia/commit/45f19f0))
* **router:** add no-link on viewport ([dc96230](https://github.com/aurelia/aurelia/commit/dc96230))
* **router:** add viewport default component & nav route consider active ([f70865c](https://github.com/aurelia/aurelia/commit/f70865c))
* **router:** add url transform & test app ([7597225](https://github.com/aurelia/aurelia/commit/7597225))
* **router:** add parallel activation of components ([530d9a2](https://github.com/aurelia/aurelia/commit/530d9a2))
* **router:** add lifecycle hooks & update import references ([86ef8a7](https://github.com/aurelia/aurelia/commit/86ef8a7))
* **router:** add parameters to navigation & add tests & add test app ([68858bd](https://github.com/aurelia/aurelia/commit/68858bd))
* **router:** add search to router and viewport ([6193768](https://github.com/aurelia/aurelia/commit/6193768))
* **router:** add history browser search ([b18a522](https://github.com/aurelia/aurelia/commit/b18a522))
* **router:** stop too late update on fullStatePath in history-browser ([4c5b50e](https://github.com/aurelia/aurelia/commit/4c5b50e))
* **router:** add navigation queue ([c067faf](https://github.com/aurelia/aurelia/commit/c067faf))
* **router:** add nav support & add "layout" test ([88db3ad](https://github.com/aurelia/aurelia/commit/88db3ad))
* **router:** add nav ([b7cb06f](https://github.com/aurelia/aurelia/commit/b7cb06f))
* **router:** add full state path & finish clear viewports ([da987be](https://github.com/aurelia/aurelia/commit/da987be))
* **router:** add clear viewports (incomplete) ([89911ae](https://github.com/aurelia/aurelia/commit/89911ae))
* **router:** make find viewports iterative ([20a8161](https://github.com/aurelia/aurelia/commit/20a8161))
* **router:** add clear viewport functionality ([6ec9357](https://github.com/aurelia/aurelia/commit/6ec9357))
* **router:** add link handler ([9a83d87](https://github.com/aurelia/aurelia/commit/9a83d87))
* **router:** add scope context and link handler & remove url duplicates ([d1a3f23](https://github.com/aurelia/aurelia/commit/d1a3f23))
* **router:** add url path rewrite ([4e61d20](https://github.com/aurelia/aurelia/commit/4e61d20))
* **router:** add routeless navigation ([54832af](https://github.com/aurelia/aurelia/commit/54832af))
* **router:** add first (temp) hierarchical viewports test in test app ([41837db](https://github.com/aurelia/aurelia/commit/41837db))
* **router:** add redirect on route, fix cancel replace issue ([92d9ccf](https://github.com/aurelia/aurelia/commit/92d9ccf))
* **router:** add INavigationInstruction and refresh ([f26a0a5](https://github.com/aurelia/aurelia/commit/f26a0a5))
* **router:** add navigation methods to router ([4023de4](https://github.com/aurelia/aurelia/commit/4023de4))
* **router:** add simple decorator implementation ([4d73440](https://github.com/aurelia/aurelia/commit/4d73440))


### Bug Fixes:

* **router:** fix viewport spacing issue ([acb3508](https://github.com/aurelia/aurelia/commit/acb3508))
* **kernel:** only propagate globally registered resources to child render contexts ([1ccf9c0](https://github.com/aurelia/aurelia/commit/1ccf9c0))
* **router:** explicitly export stuff ([1f1037f](https://github.com/aurelia/aurelia/commit/1f1037f))
* **router:** pass parentContext (null) to the rendering engine ([3bf9acf](https://github.com/aurelia/aurelia/commit/3bf9acf))
* **router:** remove initial blank navigation segment ([3ccd4c5](https://github.com/aurelia/aurelia/commit/3ccd4c5))


### Performance Improvements:

* **all): add sideEffect:** false for better tree shaking ([59b5e55](https://github.com/aurelia/aurelia/commit/59b5e55))


### Refactorings:

* **queue:** use render task ([bbd1eed](https://github.com/aurelia/aurelia/commit/bbd1eed))
* **browser-navigator:** convert from lifecycle to scheduler ([36c53af](https://github.com/aurelia/aurelia/commit/36c53af))
* **queue:** move from lifecycle to scheduler ([8b07b34](https://github.com/aurelia/aurelia/commit/8b07b34))
* **viewport:** remove unnecessary render() override and use deco ([e776943](https://github.com/aurelia/aurelia/commit/e776943))
* **all:** update definition refs ([676e86a](https://github.com/aurelia/aurelia/commit/676e86a))
* **router:** rename au-href to goto ([ec9c336](https://github.com/aurelia/aurelia/commit/ec9c336))
* **router:** fix review comments ([84c6cf0](https://github.com/aurelia/aurelia/commit/84c6cf0))
* **router:** fix review comments ([d6ea3c8](https://github.com/aurelia/aurelia/commit/d6ea3c8))
* **router:** rename href to instruction ([4242909](https://github.com/aurelia/aurelia/commit/4242909))
* **router:** use target view model & rename href to instruction ([87ebc81](https://github.com/aurelia/aurelia/commit/87ebc81))
* **router:** update au-href value in binding ([ba3365e](https://github.com/aurelia/aurelia/commit/ba3365e))
* **router:** add useHref option ([2b49e76](https://github.com/aurelia/aurelia/commit/2b49e76))
* **router:** inject DOM and au-href in link handler ([a13b333](https://github.com/aurelia/aurelia/commit/a13b333))
* ***:** drop unused imports ([7755bbf](https://github.com/aurelia/aurelia/commit/7755bbf))
* ***:** un-ignore some ts-ignore ([5e19c62](https://github.com/aurelia/aurelia/commit/5e19c62))
* **router:** remove internal strings and scope class ([17af5ad](https://github.com/aurelia/aurelia/commit/17af5ad))
* **router:** update types ([22d15f3](https://github.com/aurelia/aurelia/commit/22d15f3))
* **router:** update type resolver types ([f964761](https://github.com/aurelia/aurelia/commit/f964761))
* **router:** always unbind and cache in unload ([1424999](https://github.com/aurelia/aurelia/commit/1424999))
* **router:** add missing specifier ([b857dbe](https://github.com/aurelia/aurelia/commit/b857dbe))
* **router:** remove break in find one remaining viewport ([e3b72b2](https://github.com/aurelia/aurelia/commit/e3b72b2))
* **router:** fix linting issues ([d912226](https://github.com/aurelia/aurelia/commit/d912226))
* **router:** add missing specifier ([f17796f](https://github.com/aurelia/aurelia/commit/f17796f))
* **router:** free removed history entries ([db39cba](https://github.com/aurelia/aurelia/commit/db39cba))
* **router:** do nothing on same instance into viewport ([e362ba2](https://github.com/aurelia/aurelia/commit/e362ba2))
* **router:** clean up router ([a3f8a7f](https://github.com/aurelia/aurelia/commit/a3f8a7f))
* **router:** add history cache and free components ([eb03055](https://github.com/aurelia/aurelia/commit/eb03055))
* **router:** await unbinding ([626d7d6](https://github.com/aurelia/aurelia/commit/626d7d6))
* **router:** fix guard match bug ([70aa2ac](https://github.com/aurelia/aurelia/commit/70aa2ac))
* **router:** add stateful history length and free viewports ([a5ce912](https://github.com/aurelia/aurelia/commit/a5ce912))
* **router:** add force remove ([0f77ff7](https://github.com/aurelia/aurelia/commit/0f77ff7))
* **router:** add stateful history length ([f748350](https://github.com/aurelia/aurelia/commit/f748350))
* **router:** keep viewports when cloning path state ([2aefa23](https://github.com/aurelia/aurelia/commit/2aefa23))
* **router:** only reparent enabled viewports ([ae14dcd](https://github.com/aurelia/aurelia/commit/ae14dcd))
* **router:** propagate instance in clone instructions ([4e4492f](https://github.com/aurelia/aurelia/commit/4e4492f))
* **router:** delete scope.ts ([ed8f4fe](https://github.com/aurelia/aurelia/commit/ed8f4fe))
* **router:** clean up viewport ([d73b85e](https://github.com/aurelia/aurelia/commit/d73b85e))
* **router:** clean up index ([7f76da7](https://github.com/aurelia/aurelia/commit/7f76da7))
* **router:** clean up router ([3749f00](https://github.com/aurelia/aurelia/commit/3749f00))
* **router:** remove Scope ([c286ed8](https://github.com/aurelia/aurelia/commit/c286ed8))
* **router:** optionally get all viewports including disabled ([b1e6902](https://github.com/aurelia/aurelia/commit/b1e6902))
* **router:** add unload content ([fd803e4](https://github.com/aurelia/aurelia/commit/fd803e4))
* **router:** check children in canLeave ([d528024](https://github.com/aurelia/aurelia/commit/d528024))
* **router:** add children to viewport ([f7b4f4f](https://github.com/aurelia/aurelia/commit/f7b4f4f))
* **router:** add stateful history and append & move clear viewports ([85c323c](https://github.com/aurelia/aurelia/commit/85c323c))
* **router:** add from history ([53caa0b](https://github.com/aurelia/aurelia/commit/53caa0b))
* **router:** find already found viewports first ([762a608](https://github.com/aurelia/aurelia/commit/762a608))
* **router:** optionally clone viewport instances ([7a1b212](https://github.com/aurelia/aurelia/commit/7a1b212))
* **router:** improve component resolve ([2a61761](https://github.com/aurelia/aurelia/commit/2a61761))
* **router:** fix linting issues ([c74467c](https://github.com/aurelia/aurelia/commit/c74467c))
* **router:** fix linting issues ([a9aab21](https://github.com/aurelia/aurelia/commit/a9aab21))
* **router:** fix linting issues ([c5bef76](https://github.com/aurelia/aurelia/commit/c5bef76))
* **router:** find siblings together ([5a9e513](https://github.com/aurelia/aurelia/commit/5a9e513))
* **router:** clean up router ([099c88f](https://github.com/aurelia/aurelia/commit/099c88f))
* **router:** clean up viewport content ([6037ea7](https://github.com/aurelia/aurelia/commit/6037ea7))
* **router:** clean up instruction resolver ([4d183b3](https://github.com/aurelia/aurelia/commit/4d183b3))
* **router:** clean up scope ([10b9e99](https://github.com/aurelia/aurelia/commit/10b9e99))
* **router:** flatten find viewports in scope ([96e8f71](https://github.com/aurelia/aurelia/commit/96e8f71))
* **router:** always tag child nodes ([35683c9](https://github.com/aurelia/aurelia/commit/35683c9))
* **router:** tag top child nodes (interrim) ([782bcfa](https://github.com/aurelia/aurelia/commit/782bcfa))
* **router:** update closest viewport (interrim) ([5e0edd2](https://github.com/aurelia/aurelia/commit/5e0edd2))
* **router:** support root scope / ([42340b7](https://github.com/aurelia/aurelia/commit/42340b7))
* **router:** add start scope to findViewports & fix removeViewport & add goto scope & use clone ([c5e71a5](https://github.com/aurelia/aurelia/commit/c5e71a5))
* **router:** improve scope traversal in findViewports & fix removeScope ([6612266](https://github.com/aurelia/aurelia/commit/6612266))
* **router:** update toComponentX conversions ([2a3c6bd](https://github.com/aurelia/aurelia/commit/2a3c6bd))
* **router:** add cloneViewportInstructions to instruction resolver ([216eb4d](https://github.com/aurelia/aurelia/commit/216eb4d))
* **router:** add scope to ViewportInstruction ([300098c](https://github.com/aurelia/aurelia/commit/300098c))
* **router:** upgrade active components to viewport instructions ([1e98a07](https://github.com/aurelia/aurelia/commit/1e98a07))
* **router:** fix navigation replace behavior ([e092b30](https://github.com/aurelia/aurelia/commit/e092b30))
* **router:** use viewport instructions in navigation process ([150c267](https://github.com/aurelia/aurelia/commit/150c267))
* **router:** add reparent instructions and find without viewports to scope ([655b112](https://github.com/aurelia/aurelia/commit/655b112))
* **router:** add needs viewport described to viewport instruction ([2f53ae4](https://github.com/aurelia/aurelia/commit/2f53ae4))
* **router:** add viewport context to stringify ([35cdde0](https://github.com/aurelia/aurelia/commit/35cdde0))
* **router:** clarify full state instruction ([2490663](https://github.com/aurelia/aurelia/commit/2490663))
* **router:** clarify clear viewport instruction ([b7d4efa](https://github.com/aurelia/aurelia/commit/b7d4efa))
* **router:** change goto to use navigation instruction ([7bf5f40](https://github.com/aurelia/aurelia/commit/7bf5f40))
* **router:** enable viewport instructions for full state instruction ([56eb9c8](https://github.com/aurelia/aurelia/commit/56eb9c8))
* **router:** fix full description viewport issue ([6fcb904](https://github.com/aurelia/aurelia/commit/6fcb904))
* **router:** clean up code clutter ([ae06466](https://github.com/aurelia/aurelia/commit/ae06466))
* **router:** improve type resolver ([87da15d](https://github.com/aurelia/aurelia/commit/87da15d))
* **router:** clean up ([de97e54](https://github.com/aurelia/aurelia/commit/de97e54))
* **router:** use ViewportInstruction in Viewport ([5f0e1f0](https://github.com/aurelia/aurelia/commit/5f0e1f0))
* **router:** use ViewportInstruction in ViewportContent ([deddb4c](https://github.com/aurelia/aurelia/commit/deddb4c))
* **router:** add helpers to viewport instruction ([21a7843](https://github.com/aurelia/aurelia/commit/21a7843))
* **router:** add componentInstance to ViewportInstruction ([35a85b4](https://github.com/aurelia/aurelia/commit/35a85b4))
* **router:** add isClearViewportInstruction to instruction resolver ([fb56a99](https://github.com/aurelia/aurelia/commit/fb56a99))
* **router:** add getter accesses ([2b39b8b](https://github.com/aurelia/aurelia/commit/2b39b8b))
* **router:** make load url awaitable ([db4b45e](https://github.com/aurelia/aurelia/commit/db4b45e))
* **router:** add viewer state ([ca8acab](https://github.com/aurelia/aurelia/commit/ca8acab))
* **router:** update viewer interfaces ([f4e0ad7](https://github.com/aurelia/aurelia/commit/f4e0ad7))
* **router:** rename stringifyScopedViewportInstruction to ...instructions ([0ec9128](https://github.com/aurelia/aurelia/commit/0ec9128))
* **router:** rename useBrowserFragmentHash to useUrlFragmentHash ([1fd2ba7](https://github.com/aurelia/aurelia/commit/1fd2ba7))
* **router:** fix review comments ([5ac5891](https://github.com/aurelia/aurelia/commit/5ac5891))
* **router:** fix review comments ([205e04c](https://github.com/aurelia/aurelia/commit/205e04c))
* **router:** fix review comments ([4f27931](https://github.com/aurelia/aurelia/commit/4f27931))
* **router:** fix linting issues ([be8ca59](https://github.com/aurelia/aurelia/commit/be8ca59))
* **router:** strict enabled! ([0f85176](https://github.com/aurelia/aurelia/commit/0f85176))
* **router:** strict route-recognizer ([2b0b146](https://github.com/aurelia/aurelia/commit/2b0b146))
* **router:** strict misc remaining ([42e75e0](https://github.com/aurelia/aurelia/commit/42e75e0))
* **router:** strict router ([aafe8e6](https://github.com/aurelia/aurelia/commit/aafe8e6))
* **router:** strict scope ([b0b0446](https://github.com/aurelia/aurelia/commit/b0b0446))
* **router:** strict viewport ([79d7d7b](https://github.com/aurelia/aurelia/commit/79d7d7b))
* **router:** strict resources/nav ([9c24faa](https://github.com/aurelia/aurelia/commit/9c24faa))
* **router:** strict nav-route ([ce4b87e](https://github.com/aurelia/aurelia/commit/ce4b87e))
* **router:** strict guardian ([21d9409](https://github.com/aurelia/aurelia/commit/21d9409))
* **router:** strict guard ([9e1a136](https://github.com/aurelia/aurelia/commit/9e1a136))
* **router:** strict parser ([ed29cdd](https://github.com/aurelia/aurelia/commit/ed29cdd))
* **router:** strict queue ([217ed08](https://github.com/aurelia/aurelia/commit/217ed08))
* **router:** strict utils ([20250c6](https://github.com/aurelia/aurelia/commit/20250c6))
* **router:** strict link-handler ([a149b64](https://github.com/aurelia/aurelia/commit/a149b64))
* **router:** strict type-resolvers ([41579d2](https://github.com/aurelia/aurelia/commit/41579d2))
* **router:** strict instruction-resolver ([7f5df71](https://github.com/aurelia/aurelia/commit/7f5df71))
* **router:** strict viewport-content ([9baa389](https://github.com/aurelia/aurelia/commit/9baa389))
* **router:** strict  navigator ([a2865a6](https://github.com/aurelia/aurelia/commit/a2865a6))
* **router:** strict  browser-navigator ([f86024d](https://github.com/aurelia/aurelia/commit/f86024d))
* **router:** strict  resources/viewport ([4d6f5c5](https://github.com/aurelia/aurelia/commit/4d6f5c5))
* **router:** strict  viewport-instruction ([8c86feb](https://github.com/aurelia/aurelia/commit/8c86feb))
* **router:** update interfaces and types ([1245a9d](https://github.com/aurelia/aurelia/commit/1245a9d))
* **router:** clean up imports ([c32c7f2](https://github.com/aurelia/aurelia/commit/c32c7f2))
* **router:** remove generic from ComponentAppellation ([6b14d9c](https://github.com/aurelia/aurelia/commit/6b14d9c))
* **router:** reintroduce ComponentAppellation ([88c4a14](https://github.com/aurelia/aurelia/commit/88c4a14))
* **router:** add instance resolver ([f91dcef](https://github.com/aurelia/aurelia/commit/f91dcef))
* **router:** extract type resolvers to new file ([f898467](https://github.com/aurelia/aurelia/commit/f898467))
* **router:** rename Appellation to Handle ([b96456f](https://github.com/aurelia/aurelia/commit/b96456f))
* **router:** add Constructable to ComponentAppellation ([71146a4](https://github.com/aurelia/aurelia/commit/71146a4))
* **router:** add more generics ([6b687ce](https://github.com/aurelia/aurelia/commit/6b687ce))
* **router:** fix wrong import path ([53eccef](https://github.com/aurelia/aurelia/commit/53eccef))
* **router:** update realworld ([e640119](https://github.com/aurelia/aurelia/commit/e640119))
* **router:** remove IGuardTarget ([87bc923](https://github.com/aurelia/aurelia/commit/87bc923))
* **router:** update types & add resolvers ([9384608](https://github.com/aurelia/aurelia/commit/9384608))
* **router:** update interfaces and types ([ed9a8e6](https://github.com/aurelia/aurelia/commit/ed9a8e6))
* **router:** move interfaces and types to interfaces ([f9b3318](https://github.com/aurelia/aurelia/commit/f9b3318))
* **router:** remove IRouteViewport ([a9df422](https://github.com/aurelia/aurelia/commit/a9df422))
* **router:** remove IViewportComponentType ([56bee94](https://github.com/aurelia/aurelia/commit/56bee94))
* **router:** create interfaces and move shared interfaces ([bcb79af](https://github.com/aurelia/aurelia/commit/bcb79af))
* **router:** rename IViewportCustomElementType to IViewportComponentType ([02c8e52](https://github.com/aurelia/aurelia/commit/02c8e52))
* **router:** use IRouteableComponentType instead of ICustomElementType ([72d3ce1](https://github.com/aurelia/aurelia/commit/72d3ce1))
* **router:** rename RouteableCustomElement to RouteableComponent ([25ef24e](https://github.com/aurelia/aurelia/commit/25ef24e))
* **router:** add Viewport to IViewportComponent ([d10affb](https://github.com/aurelia/aurelia/commit/d10affb))
* **router:** move NavigationInstruction type to Router ([d80b781](https://github.com/aurelia/aurelia/commit/d80b781))
* **router:** rename NavInstruction to NavigationInstruction ([c770703](https://github.com/aurelia/aurelia/commit/c770703))
* **router:** move Navigator interfaces to navigator ([e4d467f](https://github.com/aurelia/aurelia/commit/e4d467f))
* **router:** rename browser-navigation to browser-navigator ([0c2a179](https://github.com/aurelia/aurelia/commit/0c2a179))
* **router:** rename all Navigation to Navigator for Navigator ([173ca6e](https://github.com/aurelia/aurelia/commit/173ca6e))
* **resources:** shorten resource names ([499634b](https://github.com/aurelia/aurelia/commit/499634b))
* **router:** remove unused history and test files ([01ea880](https://github.com/aurelia/aurelia/commit/01ea880))
* **all): more cleaning up after TS breaking changes:** ( ([c4c3fc7](https://github.com/aurelia/aurelia/commit/c4c3fc7))
* **router:** fix types ([eca04c0](https://github.com/aurelia/aurelia/commit/eca04c0))
* **router:** fix types / deps ([edcfe55](https://github.com/aurelia/aurelia/commit/edcfe55))
* **router:** fix types and integrate controller ([96c15d8](https://github.com/aurelia/aurelia/commit/96c15d8))
* **all:** rename $customElement to $controller ([aacf278](https://github.com/aurelia/aurelia/commit/aacf278))
* **router:** use DOM abstraction ([27d4eeb](https://github.com/aurelia/aurelia/commit/27d4eeb))
* **all:** more loosening up of null/undefined ([6794c30](https://github.com/aurelia/aurelia/commit/6794c30))
* **runtime:** fix binding and observation strict types ([b01d69a](https://github.com/aurelia/aurelia/commit/b01d69a))
* **router:** clean up ([2287ed3](https://github.com/aurelia/aurelia/commit/2287ed3))
* **router:** clean up ([5cf0e31](https://github.com/aurelia/aurelia/commit/5cf0e31))
* **router:** implement viewport instruction in scope & move hydrate after enter ([88907ec](https://github.com/aurelia/aurelia/commit/88907ec))
* **router:** rename viewportInstructionsTo/FromString to parse/stringifyViewportInstructions ([171f415](https://github.com/aurelia/aurelia/commit/171f415))
* **router:** add nextScopeInstruction to viewport instruction and parse/stringify ([40da70c](https://github.com/aurelia/aurelia/commit/40da70c))
* **router:** rename viewport instruction scope to ownsScope ([8401aab](https://github.com/aurelia/aurelia/commit/8401aab))
* **router:** add IRouteTransformer interface ([5423e2d](https://github.com/aurelia/aurelia/commit/5423e2d))
* **router:** remove example in route table ([b3d0ba7](https://github.com/aurelia/aurelia/commit/b3d0ba7))
* ***:** remove Constructable "hack" and fix exposed typing errors ([c3b6d46](https://github.com/aurelia/aurelia/commit/c3b6d46))
* **router:** implement instruction resolver in scope ([431a620](https://github.com/aurelia/aurelia/commit/431a620))
* **router:** clean up old find viewports in scope ([a6173db](https://github.com/aurelia/aurelia/commit/a6173db))
* **router:** remove IComponentViewport ([254dbe3](https://github.com/aurelia/aurelia/commit/254dbe3))
* **router:** implement instruction resolver in find viewports in scope ([7e43a9c](https://github.com/aurelia/aurelia/commit/7e43a9c))
* **router:** add scoped parse/stringify in instruction resolver ([5344bb9](https://github.com/aurelia/aurelia/commit/5344bb9))
* **router:** remove redirect from history browser ([2cce2c2](https://github.com/aurelia/aurelia/commit/2cce2c2))
* **router:** add scope to viewport instruction & implement in viewport ([f6534e2](https://github.com/aurelia/aurelia/commit/f6534e2))
* ***:** use InjectArray ([b35215f](https://github.com/aurelia/aurelia/commit/b35215f))
* **router:** remove redirect from history browser ([a5d0fee](https://github.com/aurelia/aurelia/commit/a5d0fee))
* **router:** clean up cancel with new go option suppress popstate ([cd9c3ac](https://github.com/aurelia/aurelia/commit/cd9c3ac))
* **router:** clean up cancel with new go option suppress popstate ([1217b5d](https://github.com/aurelia/aurelia/commit/1217b5d))
* **router:** clean up pop with new go option suppress popstate ([ee2a986](https://github.com/aurelia/aurelia/commit/ee2a986))
* **router:** fix typo bug ([b9a5592](https://github.com/aurelia/aurelia/commit/b9a5592))
* **router:** make go await popstate & add suppress popstate callback option ([c7da907](https://github.com/aurelia/aurelia/commit/c7da907))
* **router:** implement viewport instruction in nav ([0089c3a](https://github.com/aurelia/aurelia/commit/0089c3a))
* **router:** replace IComponentViewportParameters with ViewportInstruction ([93ff3da](https://github.com/aurelia/aurelia/commit/93ff3da))
* **router:** add same component check & implement instruction resolver in nav route ([a5a6bf2](https://github.com/aurelia/aurelia/commit/a5a6bf2))
* **router:** add parse viewport instruction ([4cd6e4f](https://github.com/aurelia/aurelia/commit/4cd6e4f))
* **router:** implement instruction resolver in router ([e5db3d9](https://github.com/aurelia/aurelia/commit/e5db3d9))
* **router:** add instruction resolver ([4be96aa](https://github.com/aurelia/aurelia/commit/4be96aa))
* **router:** add viewport instruction ([7e36eb8](https://github.com/aurelia/aurelia/commit/7e36eb8))
* **router:** rename method to methodName ([f3c96c4](https://github.com/aurelia/aurelia/commit/f3c96c4))
* **router:** rename processingItem, object to currentHistoryActivity, target ([eba9aaa](https://github.com/aurelia/aurelia/commit/eba9aaa))
* **router:** rename deactivated, _viewports, viewports to enabled,viewports,getEnabledViewports ([5fcf55d](https://github.com/aurelia/aurelia/commit/5fcf55d))
* **:** fix linting errors ([b660421](https://github.com/aurelia/aurelia/commit/b660421))
* **router:** remove elementVM in viewport ([3ae294b](https://github.com/aurelia/aurelia/commit/3ae294b))
* **router:** give viewport element own Viewport & clean lifecycles ([16e8713](https://github.com/aurelia/aurelia/commit/16e8713))
* **router:** make scope viewports a list & add repeat navigation & element vm ([f955ef0](https://github.com/aurelia/aurelia/commit/f955ef0))
* **router:** move component methods to viewport content ([346a147](https://github.com/aurelia/aurelia/commit/346a147))
* **router:** move from cache to viewport content ([9ef5d2b](https://github.com/aurelia/aurelia/commit/9ef5d2b))
* **router:** move navigation status into viewport content status ([6fdca9d](https://github.com/aurelia/aurelia/commit/6fdca9d))
* **router:** delay browser history dequeue ([2b48179](https://github.com/aurelia/aurelia/commit/2b48179))
* **router:** add viewport content class ([1621229](https://github.com/aurelia/aurelia/commit/1621229))
* **router:** add queued browser history and appropriate awaits ([78f44ee](https://github.com/aurelia/aurelia/commit/78f44ee))
* **router:** simplify tick in queued browser history ([03cfc66](https://github.com/aurelia/aurelia/commit/03cfc66))
* **router:** add navigation status to viewport ([fef1f9d](https://github.com/aurelia/aurelia/commit/fef1f9d))
* **router:** add cancel navigation & add waits to test app ([e306d0b](https://github.com/aurelia/aurelia/commit/e306d0b))
* **router:** change entering timing & add viewport render and state ([923ee93](https://github.com/aurelia/aurelia/commit/923ee93))
* **router:** update closest & add container influence on load ([bea22f3](https://github.com/aurelia/aurelia/commit/bea22f3))
* **router:** add container to viewport ([beb22e4](https://github.com/aurelia/aurelia/commit/beb22e4))
* **all:** consolidate binding mechanisms into BindingStrategy enum ([d319ba8](https://github.com/aurelia/aurelia/commit/d319ba8))
* **all:** split traceInfo.name up in objName and methodName ([2cdc203](https://github.com/aurelia/aurelia/commit/2cdc203))
* ***:** another round of linting fixes ([ca0660b](https://github.com/aurelia/aurelia/commit/ca0660b))
* ***:** another round of linting fixes ([3e0f393](https://github.com/aurelia/aurelia/commit/3e0f393))
* **router:** change entering timing & add viewport render and state ([91cfb64](https://github.com/aurelia/aurelia/commit/91cfb64))
* **viewport-custom-element:** directly implement custom element behavior ([845dfc4](https://github.com/aurelia/aurelia/commit/845dfc4))
* **router:** update closest & add container influence on load ([cdce786](https://github.com/aurelia/aurelia/commit/cdce786))
* **router:** add container to viewport ([406967a](https://github.com/aurelia/aurelia/commit/406967a))
* **lifecycle-render:** remove arguments that can be resolved from the context ([7eb2b5d](https://github.com/aurelia/aurelia/commit/7eb2b5d))
* ***:** make unknown the default for InterfaceSymbol ([d74da2c](https://github.com/aurelia/aurelia/commit/d74da2c))
* ***:** make unknown the default for InterfaceSymbol ([0b77ce3](https://github.com/aurelia/aurelia/commit/0b77ce3))
* ***:** use substring in favor of substr ([ab0dece](https://github.com/aurelia/aurelia/commit/ab0dece))
* **all:** prepare lifecycle flags arguments for proxy observation ([1f8bf19](https://github.com/aurelia/aurelia/commit/1f8bf19))
* ***:** fix bantypes in tests ([2d7bad8](https://github.com/aurelia/aurelia/commit/2d7bad8))
* ***:** enable ban-types linting rule and fix violations ([00e61b1](https://github.com/aurelia/aurelia/commit/00e61b1))
* **router:** remove old configured routes code ([73f7d8c](https://github.com/aurelia/aurelia/commit/73f7d8c))
* ***:** linting fixes ([a9e26ad](https://github.com/aurelia/aurelia/commit/a9e26ad))
* **router:** move late viewport element catch up into viewport ([45b58e6](https://github.com/aurelia/aurelia/commit/45b58e6))
* **all:** use Resource.define instead of decorators ([045aa90](https://github.com/aurelia/aurelia/commit/045aa90))
* **all:** replace inject decorators with static inject properties ([9fc37c1](https://github.com/aurelia/aurelia/commit/9fc37c1))
* **all:** move timer globals to PLATFORM ([fa3bda3](https://github.com/aurelia/aurelia/commit/fa3bda3))
* **router:** adapt to new runtime-html ([104e47b](https://github.com/aurelia/aurelia/commit/104e47b))
* **router:** pass DOM to hydrate ([8f69833](https://github.com/aurelia/aurelia/commit/8f69833))
* **router:** resolve reamaining viewports statefully in scope ([a55b2c4](https://github.com/aurelia/aurelia/commit/a55b2c4))
* **router:** move find viewports to scope & add used by & clean url ([4c5879d](https://github.com/aurelia/aurelia/commit/4c5879d))
* **router:** change url syntax (incomplete) ([1c38239](https://github.com/aurelia/aurelia/commit/1c38239))
* **router:** switch to await & add more tests ([14511e1](https://github.com/aurelia/aurelia/commit/14511e1))
* **router:** add object parameter to history setState ([a7e74ce](https://github.com/aurelia/aurelia/commit/a7e74ce))
* **router:** add separation characters and fix history update bug ([dd7eab3](https://github.com/aurelia/aurelia/commit/dd7eab3))
* **router:** inline viewport template & add more tests ([9b4e48a](https://github.com/aurelia/aurelia/commit/9b4e48a))
* **router:** fix more linting issues ([64a5a73](https://github.com/aurelia/aurelia/commit/64a5a73))
* **router:** fix more linting issues ([4ad30b5](https://github.com/aurelia/aurelia/commit/4ad30b5))
* **router:** remove route.ts and route-config.ts ([da0856f](https://github.com/aurelia/aurelia/commit/da0856f))
* **router:** fix linting issues ([c084b59](https://github.com/aurelia/aurelia/commit/c084b59))
* **router:** only set scope for viewports with scope ([4e61d20](https://github.com/aurelia/aurelia/commit/4e61d20))
* **router:** add remove scope ([4e61d20](https://github.com/aurelia/aurelia/commit/4e61d20))
* **router:** add scopes for viewport ([8e21371](https://github.com/aurelia/aurelia/commit/8e21371))
* **router:** add new scope indicator to url ([8e21371](https://github.com/aurelia/aurelia/commit/8e21371))
* **router:** change separator characters ([8e21371](https://github.com/aurelia/aurelia/commit/8e21371))
* **router:** halway through scope refactor ([a35d435](https://github.com/aurelia/aurelia/commit/a35d435))
* **router:** improve recursive find viewport ([8faa3d7](https://github.com/aurelia/aurelia/commit/8faa3d7))
* **router:** add expanded/parent viewports ([8faa3d7](https://github.com/aurelia/aurelia/commit/8faa3d7))
* **router:** split viewport scope to parent scope and scope ([8faa3d7](https://github.com/aurelia/aurelia/commit/8faa3d7))
* **router:** move custom element's add viewport to attached ([8faa3d7](https://github.com/aurelia/aurelia/commit/8faa3d7))
* **router:** add scopes ([54832af](https://github.com/aurelia/aurelia/commit/54832af))
* **router:** cancel aborts earlier in router, test app update ([343a33e](https://github.com/aurelia/aurelia/commit/343a33e))

<a name="0.3.0"></a>
# 0.3.0 (2018-10-12)

**Note:** Version bump only for package @aurelia/router

<a name="0.2.0"></a>
# 0.2.0 (2018-09-18)

### Bug Fixes:

* **examples:** correct versions ([1b7c764](https://github.com/aurelia/aurelia/commit/1b7c764))
* **tsconfig:** correct extends path ([797674f](https://github.com/aurelia/aurelia/commit/797674f))
