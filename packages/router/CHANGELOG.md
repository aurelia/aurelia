# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

<a name="2.0.0-beta.14"></a>
# 2.0.0-beta.14 (2024-04-03)

### Features:

* **i18n:** support multiple versions of i18next (#1927) ([0789ee5](https://github.com/aurelia/aurelia/commit/0789ee5))

<a name="2.0.0-beta.13"></a>
# 2.0.0-beta.13 (2024-03-15)

### Bug Fixes:

* **router:** dont swallow instantiation error details ([deee8e6](https://github.com/aurelia/aurelia/commit/deee8e6))
* ***:** cleanup di & router tests, add timeout ([deee8e6](https://github.com/aurelia/aurelia/commit/deee8e6))
* ***:** router errors stringify ([deee8e6](https://github.com/aurelia/aurelia/commit/deee8e6))
* ***:** deepscan issues ([deee8e6](https://github.com/aurelia/aurelia/commit/deee8e6))
* ***:** element get own metadata call ([dc22fb7](https://github.com/aurelia/aurelia/commit/dc22fb7))
* **di:** cache factory on singleton resolution ([dc22fb7](https://github.com/aurelia/aurelia/commit/dc22fb7))


### Refactorings:

* ***:** smaller di files, assert text options, more au slot tests ([deee8e6](https://github.com/aurelia/aurelia/commit/deee8e6))
* **resource:** cleanup registration, APIs (#1918) ([dc22fb7](https://github.com/aurelia/aurelia/commit/dc22fb7))
* ***:** cleanup util fn ([dc22fb7](https://github.com/aurelia/aurelia/commit/dc22fb7))
* **resources:** move find to corresponding resource kind ([dc22fb7](https://github.com/aurelia/aurelia/commit/dc22fb7))
* **di:** add registrable, remove unecessary infra for attr pattern ([dc22fb7](https://github.com/aurelia/aurelia/commit/dc22fb7))
* **resources:** use registrable ([dc22fb7](https://github.com/aurelia/aurelia/commit/dc22fb7))
* **di:** dont search for resources when register ([dc22fb7](https://github.com/aurelia/aurelia/commit/dc22fb7))
* **resource:** remove resource protocol, simplify resource metadata ([dc22fb7](https://github.com/aurelia/aurelia/commit/dc22fb7))
* **resources:** add get for vc & bb resource kinds ([dc22fb7](https://github.com/aurelia/aurelia/commit/dc22fb7))
* **resource:** binding command resolution ([dc22fb7](https://github.com/aurelia/aurelia/commit/dc22fb7))

<a name="2.0.0-beta.12"></a>
# 2.0.0-beta.12 (2024-03-02)

### Bug Fixes:

* **router:** prevent multiple navigation at the same time (#1895) ([deed11e](https://github.com/aurelia/aurelia/commit/deed11e))
* **router:** properly handle false in conditional router hooks (#1900) ([a671463](https://github.com/aurelia/aurelia/commit/a671463))
* **di:** dont jit register resources [skip ci] ([8ffde34](https://github.com/aurelia/aurelia/commit/8ffde34))
* ***:** tweak typings of injectable token ([89f76eb](https://github.com/aurelia/aurelia/commit/89f76eb))
* ***:** use ?? instead of || ([89f76eb](https://github.com/aurelia/aurelia/commit/89f76eb))
* ***:** typings for injectable token ([89f76eb](https://github.com/aurelia/aurelia/commit/89f76eb))
* ***:** injectable token resolver ([89f76eb](https://github.com/aurelia/aurelia/commit/89f76eb))


### Refactorings:

* ***:** cleanup (#1912) ([8ffde34](https://github.com/aurelia/aurelia/commit/8ffde34))
* ***:** cleanup (#1908) ([89f76eb](https://github.com/aurelia/aurelia/commit/89f76eb))
* **router:** use resolve ([89f76eb](https://github.com/aurelia/aurelia/commit/89f76eb))
* ***:** better type inferrence for injectable token ([89f76eb](https://github.com/aurelia/aurelia/commit/89f76eb))
* ***:** simplify container has, cleanup router ([89f76eb](https://github.com/aurelia/aurelia/commit/89f76eb))

<a name="2.0.0-beta.11"></a>
# 2.0.0-beta.11 (2024-02-13)

### Features:

* **state:** support redux devtools for the state plugin (#1888) ([bd07160](https://github.com/aurelia/aurelia/commit/bd07160))


### Bug Fixes:

* ***:** upgrade rollup, tweak build scripts ([bd07160](https://github.com/aurelia/aurelia/commit/bd07160))

<a name="2.0.0-beta.10"></a>
# 2.0.0-beta.10 (2024-01-26)

### Bug Fixes:

* **router:** store root/default page instruction correctly (#1869) ([84e6380](https://github.com/aurelia/aurelia/commit/84e6380))
* **router:** store root/default page instruction correctly ([84e6380](https://github.com/aurelia/aurelia/commit/84e6380))


### Refactorings:

* **enums:** string literal types in favour of const enums (#1870) ([e21e0c9](https://github.com/aurelia/aurelia/commit/e21e0c9))

<a name="2.0.0-beta.9"></a>
# 2.0.0-beta.9 (2023-12-12)

**Note:** Version bump only for package @aurelia/router

<a name="2.0.0-beta.8"></a>
# 2.0.0-beta.8 (2023-07-24)

### Refactorings:

* **ref:** deprecate view-model.ref and introduce component.ref (#1803) ([97e8dad](https://github.com/aurelia/aurelia/commit/97e8dad))

<a name="2.0.0-beta.7"></a>
# 2.0.0-beta.7 (2023-06-16)

### Features:

* **build:** add a development entry point (#1770) ([69ff445](https://github.com/aurelia/aurelia/commit/69ff445))

<a name="2.0.0-beta.6"></a>
# 2.0.0-beta.6 (2023-05-21)

### Refactorings:

* **router:** add warning for unsupported behavior (#1757) ([ce87339](https://github.com/aurelia/aurelia/commit/ce87339))

<a name="2.0.0-beta.5"></a>
# 2.0.0-beta.5 (2023-04-27)

### Refactorings:

* **build:** preserve pure annotation for better tree shaking (#1745) ([0bc5cd6](https://github.com/aurelia/aurelia/commit/0bc5cd6))

<a name="2.0.0-beta.4"></a>
# 2.0.0-beta.4 (2023-04-13)

**Note:** Version bump only for package @aurelia/router

<a name="2.0.0-beta.3"></a>
# 2.0.0-beta.3 (2023-03-24)

### Refactorings:

* **controller:** remove lifecycle flags (#1707) ([a31cd75](https://github.com/aurelia/aurelia/commit/a31cd75))
* **ci:** remove e2e safari from pipeline ([a31cd75](https://github.com/aurelia/aurelia/commit/a31cd75))
* **tests:** disable hook tests ([a31cd75](https://github.com/aurelia/aurelia/commit/a31cd75))
* **build:** use turbo to boost build speed (#1692) ([d99b136](https://github.com/aurelia/aurelia/commit/d99b136))

<a name="2.0.0-beta.2"></a>
# 2.0.0-beta.2 (2023-02-26)

**Note:** Version bump only for package @aurelia/router

<a name="2.0.0-beta.1"></a>
# 2.0.0-beta.1 (2023-01-12)

### Features:

* **router:** improve href creation ([d963c72](https://github.com/aurelia/aurelia/commit/d963c72))


### Bug Fixes:

* **router:** check to make sure hooks are valid ([0daa097](https://github.com/aurelia/aurelia/commit/0daa097))


### Refactorings:

* **router:** improve href creation (#1609) ([d963c72](https://github.com/aurelia/aurelia/commit/d963c72))

<a name="2.0.0-alpha.41"></a>
# 2.0.0-alpha.41 (2022-09-22)

### Features:

* **router:** multiple bindable props for load attribute (#1554) ([02ca208](https://github.com/aurelia/aurelia/commit/02ca208))
* **router:** support configured route in canLoad redirect string (#1545) ([a4c7a37](https://github.com/aurelia/aurelia/commit/a4c7a37))


### Bug Fixes:

* **router:** fix path issue when redirecting (#1564) ([e8b5d3f](https://github.com/aurelia/aurelia/commit/e8b5d3f))
* **router:** fix default refresh issue (#1547) ([8ddadc6](https://github.com/aurelia/aurelia/commit/8ddadc6))


### Refactorings:

* **runtime:** move LifecycleFlags to runtime-html ([ef35bc7](https://github.com/aurelia/aurelia/commit/ef35bc7))
* **router:** add route compare to active check (#1556) ([f325c1a](https://github.com/aurelia/aurelia/commit/f325c1a))
* **binding:** move BindingMode to runtime-html (#1555) ([c75618b](https://github.com/aurelia/aurelia/commit/c75618b))
* **router:** rename load, unload to loading, unloading (#1546) ([9cd3f02](https://github.com/aurelia/aurelia/commit/9cd3f02))

<a name="2.0.0-alpha.40"></a>
# 2.0.0-alpha.40 (2022-09-07)

### Bug Fixes:

* **router:** fix route import component issue (#1534) ([15b84f1](https://github.com/aurelia/aurelia/commit/15b84f1))


### Refactorings:

* **app-task:** consistent hook name style ing/ed (#1540) ([5a11ea0](https://github.com/aurelia/aurelia/commit/5a11ea0))

<a name="2.0.0-alpha.39"></a>
# 2.0.0-alpha.39 (2022-09-01)

### Features:

* **router:** configurable viewport fallback behavior (#1507) ([1e50194](https://github.com/aurelia/aurelia/commit/1e50194))


### Bug Fixes:

* **router:** fix default on refresh issue (#1501) ([6ad851f](https://github.com/aurelia/aurelia/commit/6ad851f))


### Refactorings:

* **router:** change fallback action default to abort (#1524) ([13617e2](https://github.com/aurelia/aurelia/commit/13617e2))

<a name="2.0.0-alpha.38"></a>
# 2.0.0-alpha.38 (2022-08-17)

### Bug Fixes:

* **router:** update component creation (#1499) ([efda82e](https://github.com/aurelia/aurelia/commit/efda82e))
* **router:** update component creation ([efda82e](https://github.com/aurelia/aurelia/commit/efda82e))
* **router:** fix linting errors ([efda82e](https://github.com/aurelia/aurelia/commit/efda82e))

<a name="2.0.0-alpha.37"></a>
# 2.0.0-alpha.37 (2022-08-03)

**Note:** Version bump only for package @aurelia/router

<a name="2.0.0-alpha.36"></a>
# 2.0.0-alpha.36 (2022-07-25)

**Note:** Version bump only for package @aurelia/router

<a name="2.0.0-alpha.35"></a>
# 2.0.0-alpha.35 (2022-06-08)

### Features:

* **ts-jest,babel-jest:** upgrade to jest v28 (#1449) ([b1ec85c](https://github.com/aurelia/aurelia/commit/b1ec85c))

<a name="2.0.0-alpha.34"></a>
# 2.0.0-alpha.34 (2022-06-03)

### Features:

* **router:** add default route to child viewports (#1444) ([b574851](https://github.com/aurelia/aurelia/commit/b574851))

<a name="2.0.0-alpha.33"></a>
# 2.0.0-alpha.33 (2022-05-26)

**Note:** Version bump only for package @aurelia/router

<a name="2.0.0-alpha.32"></a>
# 2.0.0-alpha.32 (2022-05-22)

### Features:

* **router:** add previous to instruction (#1418) ([fc61481](https://github.com/aurelia/aurelia/commit/fc61481))


### Bug Fixes:

* **router:** right navigation to unload lifecycleHooks (#1419) ([af11523](https://github.com/aurelia/aurelia/commit/af11523))

<a name="2.0.0-alpha.31"></a>
# 2.0.0-alpha.31 (2022-05-15)

**Note:** Version bump only for package @aurelia/router

<a name="2.0.0-alpha.30"></a>
# 2.0.0-alpha.30 (2022-05-07)

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

* **router:** support this/instance in @lifecycleHooks (#1390) ([5f5df47](https://github.com/aurelia/aurelia/commit/5f5df47))

<a name="2.0.0-alpha.28"></a>
# 2.0.0-alpha.28 (2022-04-16)

### Features:

* **router:** add current step to Runner ([35069fd](https://github.com/aurelia/aurelia/commit/35069fd))
* **router:** add lifecycleHooks ([36d8dce](https://github.com/aurelia/aurelia/commit/36d8dce))
* **router:** add exit feature to Runner ([d41dfd2](https://github.com/aurelia/aurelia/commit/d41dfd2))
* **router:** no url comp name for default leaf ([94909b0](https://github.com/aurelia/aurelia/commit/94909b0))
* **router:** make load add href hash ([01d8448](https://github.com/aurelia/aurelia/commit/01d8448))
* **router:** allow path array in route config ([cbad4a9](https://github.com/aurelia/aurelia/commit/cbad4a9))
* **router:** allow path array in route config ([c9d57f4](https://github.com/aurelia/aurelia/commit/c9d57f4))
* **router:** add base path support ([363f4ee](https://github.com/aurelia/aurelia/commit/363f4ee))
* **router:** activate parallelism in runner ([53d6e8d](https://github.com/aurelia/aurelia/commit/53d6e8d))
* **router:** make load return boolean outcome ([8ccd739](https://github.com/aurelia/aurelia/commit/8ccd739))
* **router:** make load return boolean outcome ([68dbfe8](https://github.com/aurelia/aurelia/commit/68dbfe8))
* **router:** add definition to component appelation ([fb9e226](https://github.com/aurelia/aurelia/commit/fb9e226))
* **router:** fix static route config ([b90d814](https://github.com/aurelia/aurelia/commit/b90d814))


### Bug Fixes:

* **router:** handle url fragment properly ([7b41c7b](https://github.com/aurelia/aurelia/commit/7b41c7b))
* **router:** add search query to non-hash instruction ([635fe4d](https://github.com/aurelia/aurelia/commit/635fe4d))
* **router:** make default attribute work again ([d5bbce3](https://github.com/aurelia/aurelia/commit/d5bbce3))
* **router:** make sure routes is checked for empty path ([b6d99e4](https://github.com/aurelia/aurelia/commit/b6d99e4))
* **router:** filter dumber exports ([f472985](https://github.com/aurelia/aurelia/commit/f472985))
* **viewport:** context is gone, access container directly ([bb8dd73](https://github.com/aurelia/aurelia/commit/bb8dd73))
* **routing-scope:** get container from controller ([94e8285](https://github.com/aurelia/aurelia/commit/94e8285))
* **router:** new param to forCustomElement (temp fix) ([be5e4d7](https://github.com/aurelia/aurelia/commit/be5e4d7))
* **router:** use full state instruction when appropriate ([10fd90d](https://github.com/aurelia/aurelia/commit/10fd90d))
* **router:** re-use navigation when refresh ([41596da](https://github.com/aurelia/aurelia/commit/41596da))
* **router:** make links check active when binding ([68ceffd](https://github.com/aurelia/aurelia/commit/68ceffd))
* **router:** no click event on external href ([59bbd62](https://github.com/aurelia/aurelia/commit/59bbd62))
* **router:** add AppTask version fallback ([fb5723d](https://github.com/aurelia/aurelia/commit/fb5723d))
* **router:** remove extra call with viewport default ([3cfbd6f](https://github.com/aurelia/aurelia/commit/3cfbd6f))
* **router:** remove superflous ? in query param ([7cad361](https://github.com/aurelia/aurelia/commit/7cad361))


### Refactorings:

* **router:** clean up (incomplete) ([892d042](https://github.com/aurelia/aurelia/commit/892d042))
* **router:** hierarchy match in routing scope (incomplete) ([58eda2e](https://github.com/aurelia/aurelia/commit/58eda2e))
* **router:** add endpoint step to coordinator ([79f121f](https://github.com/aurelia/aurelia/commit/79f121f))
* **router:** remove coordinator endpoint on redirect ([bed9be8](https://github.com/aurelia/aurelia/commit/bed9be8))
* **router:** add remove endpoint to coordinator ([10af6a3](https://github.com/aurelia/aurelia/commit/10af6a3))
* **build:** make tests work ([8323312](https://github.com/aurelia/aurelia/commit/8323312))
* **router:** add instruction component function ([a118e62](https://github.com/aurelia/aurelia/commit/a118e62))
* **router:** process multiple configured routes ([c570bfb](https://github.com/aurelia/aurelia/commit/c570bfb))
* **all:** adapt latest changes in core ([0388048](https://github.com/aurelia/aurelia/commit/0388048))
* **all:** adapt latest changes in core ([0cb2d32](https://github.com/aurelia/aurelia/commit/0cb2d32))
* **all:** adapt latest changes in dev ([6cb62fb](https://github.com/aurelia/aurelia/commit/6cb62fb))
* **all:** adapt latest changes in dev ([76a02bb](https://github.com/aurelia/aurelia/commit/76a02bb))
* **router:** make component param 0 to fallback ([ce83a47](https://github.com/aurelia/aurelia/commit/ce83a47))
* **router:** remove old AppTask with ([dea458e](https://github.com/aurelia/aurelia/commit/dea458e))
* **router:** add viewport activity classes ([2cff08d](https://github.com/aurelia/aurelia/commit/2cff08d))
* **router:** clean up ([30255ae](https://github.com/aurelia/aurelia/commit/30255ae))
* **router:** remove static RouterConfiguration ([4e14051](https://github.com/aurelia/aurelia/commit/4e14051))
* **router:** replace RouterConfiguration ([6cd8b69](https://github.com/aurelia/aurelia/commit/6cd8b69))
* **router:** replace RouterConfiguration ([02ab5cf](https://github.com/aurelia/aurelia/commit/02ab5cf))
* **router:** replace RouterConfiguration ([56b2bdf](https://github.com/aurelia/aurelia/commit/56b2bdf))
* **router:** improve parameter comparison ([7a05554](https://github.com/aurelia/aurelia/commit/7a05554))
* **router:** replace RouterConfiguration ([8aaeca1](https://github.com/aurelia/aurelia/commit/8aaeca1))
* **router:** replace RouterConfiguration ([5bba91e](https://github.com/aurelia/aurelia/commit/5bba91e))
* **router:** clean up ([eca6801](https://github.com/aurelia/aurelia/commit/eca6801))
* **router:** implement injectable configuration ([a4f6e73](https://github.com/aurelia/aurelia/commit/a4f6e73))
* **router:** clean up ([8796c85](https://github.com/aurelia/aurelia/commit/8796c85))
* **router:** turn router options into classes ([277615c](https://github.com/aurelia/aurelia/commit/277615c))
* **router:** add contains to instruction parameters ([8cb168c](https://github.com/aurelia/aurelia/commit/8cb168c))
* **router:** add considered-active attribute ([8ee65a2](https://github.com/aurelia/aurelia/commit/8ee65a2))
* **router:** add considered-active attribute ([747dca6](https://github.com/aurelia/aurelia/commit/747dca6))
* **router:** create injectable RouterConfiguration ([dcfd333](https://github.com/aurelia/aurelia/commit/dcfd333))
* **router:** implement indicators configuration ([7105cec](https://github.com/aurelia/aurelia/commit/7105cec))
* **router:** add indicators configuration ([780d9cd](https://github.com/aurelia/aurelia/commit/780d9cd))
* **router:** clean up ([5cff96b](https://github.com/aurelia/aurelia/commit/5cff96b))
* **router:** clean up ([ae4dde7](https://github.com/aurelia/aurelia/commit/ae4dde7))
* ***:** simplify notify code, tweak some repetitive & unneeded types ([1f00188](https://github.com/aurelia/aurelia/commit/1f00188))
* **router:** implement coordinator en/dequeue instructions ([dd727fc](https://github.com/aurelia/aurelia/commit/dd727fc))
* **router:** en/dequeue appended coordinator instructions ([7a8c00c](https://github.com/aurelia/aurelia/commit/7a8c00c))
* **router:** add pending children ([8a566e0](https://github.com/aurelia/aurelia/commit/8a566e0))
* **router:** propagate parameters to child loads ([be06813](https://github.com/aurelia/aurelia/commit/be06813))
* **router:** add type parameters to instruction ([38c3dad](https://github.com/aurelia/aurelia/commit/38c3dad))
* **router:** unique getOwnedRoutingScopes ([ab4d068](https://github.com/aurelia/aurelia/commit/ab4d068))
* **router:** rename load-active to active ([92b26df](https://github.com/aurelia/aurelia/commit/92b26df))
* **router:** use full state for refresh navigation ([dcddac7](https://github.com/aurelia/aurelia/commit/dcddac7))
* ***:** simplify notify code, tweak some repetitive & unneeded types ([8e8d096](https://github.com/aurelia/aurelia/commit/8e8d096))
* **router:** fix missed condition ([8448349](https://github.com/aurelia/aurelia/commit/8448349))
* **router:** add unresolvedInstructionsError ([644819d](https://github.com/aurelia/aurelia/commit/644819d))
* **router:** remove processingNavigation ([4f43313](https://github.com/aurelia/aurelia/commit/4f43313))
* **router:** use handleEvent for popstate ([7f778b7](https://github.com/aurelia/aurelia/commit/7f778b7))
* **router:** clean up ([9efb2fd](https://github.com/aurelia/aurelia/commit/9efb2fd))
* **router:** rename viewport to endpoint ([474c4aa](https://github.com/aurelia/aurelia/commit/474c4aa))
* **router:** rename parameters ([ac147ef](https://github.com/aurelia/aurelia/commit/ac147ef))
* **router:** use classList.toggle! ([4832e19](https://github.com/aurelia/aurelia/commit/4832e19))
* **router:** clean up ([a3a9220](https://github.com/aurelia/aurelia/commit/a3a9220))
* **router:** clean up ([ac24da4](https://github.com/aurelia/aurelia/commit/ac24da4))
* **router:** update tech notes ([03b81f9](https://github.com/aurelia/aurelia/commit/03b81f9))
* **router:** clear instruction parameters on set ([c89c462](https://github.com/aurelia/aurelia/commit/c89c462))
* **router:** rename syncState to syncingState ([45b80d8](https://github.com/aurelia/aurelia/commit/45b80d8))
* **router:** clean up ([9e5e124](https://github.com/aurelia/aurelia/commit/9e5e124))
* **router:** extract ensureRootScope to start ([7a6a939](https://github.com/aurelia/aurelia/commit/7a6a939))
* **router:** clean up ([4b4d8f8](https://github.com/aurelia/aurelia/commit/4b4d8f8))
* **router:** add errors & tests for instruction parser ([b3b5e25](https://github.com/aurelia/aurelia/commit/b3b5e25))
* **router:** enable multiple transition waits ([21e1816](https://github.com/aurelia/aurelia/commit/21e1816))
* **router:** move flags from stored to navigation class ([def9f8d](https://github.com/aurelia/aurelia/commit/def9f8d))
* **router:** remove Navigator navigation queue ([c37c2ca](https://github.com/aurelia/aurelia/commit/c37c2ca))
* **router:** rename params ([6c97a98](https://github.com/aurelia/aurelia/commit/6c97a98))
* **router:** clean up ([f391f2f](https://github.com/aurelia/aurelia/commit/f391f2f))
* **router:** fix type ([e701c5b](https://github.com/aurelia/aurelia/commit/e701c5b))
* ***:** use handleEvent in link handler instead ([089a576](https://github.com/aurelia/aurelia/commit/089a576))
* ***:** tweak some repetition ([37eea7d](https://github.com/aurelia/aurelia/commit/37eea7d))
* **router:** clean up ([78405bf](https://github.com/aurelia/aurelia/commit/78405bf))
* **router:** fix rebase issues ([7e9d6c3](https://github.com/aurelia/aurelia/commit/7e9d6c3))
* **router:** non-blocking unqueued navigations ([a4fb8a8](https://github.com/aurelia/aurelia/commit/a4fb8a8))
* ***:** use handleEvent in link handler instead ([b18de0c](https://github.com/aurelia/aurelia/commit/b18de0c))
* ***:** tweak some repetition ([4108a00](https://github.com/aurelia/aurelia/commit/4108a00))
* **router:** clean up ([712d41a](https://github.com/aurelia/aurelia/commit/712d41a))
* **router:** update router events ([4ffb138](https://github.com/aurelia/aurelia/commit/4ffb138))
* **router:** clean up ([7000e65](https://github.com/aurelia/aurelia/commit/7000e65))
* **router:** update title ([d9ad930](https://github.com/aurelia/aurelia/commit/d9ad930))
* **router:** add RouterOptions class ([a84de00](https://github.com/aurelia/aurelia/commit/a84de00))
* **router:** move type check to endpoint ([4a47704](https://github.com/aurelia/aurelia/commit/4a47704))
* **router:** delete instruction viewport ([f6ed870](https://github.com/aurelia/aurelia/commit/f6ed870))
* **router:** rename viewports & clean up ([36a01ac](https://github.com/aurelia/aurelia/commit/36a01ac))
* **router:** implement instruction endpoint ([b98cd2a](https://github.com/aurelia/aurelia/commit/b98cd2a))
* **router:** add instruction endpoint ([a1a19bb](https://github.com/aurelia/aurelia/commit/a1a19bb))
* **router:** comment ([7b3d95f](https://github.com/aurelia/aurelia/commit/7b3d95f))
* **router:** add routeStart to routing instruction ([8ba8151](https://github.com/aurelia/aurelia/commit/8ba8151))
* **router:** comment & clean up ([3b2e832](https://github.com/aurelia/aurelia/commit/3b2e832))
* **router:** delete parser utilities ([9f0d660](https://github.com/aurelia/aurelia/commit/9f0d660))
* **router:** add reload behavior to configured route ([c1c4e32](https://github.com/aurelia/aurelia/commit/c1c4e32))
* **router:** clean up ([92f9e62](https://github.com/aurelia/aurelia/commit/92f9e62))
* **router:** clean up ([5ea6cb4](https://github.com/aurelia/aurelia/commit/5ea6cb4))
* **router:** move link-handler into resources ([d1d5475](https://github.com/aurelia/aurelia/commit/d1d5475))
* **router:** add CustomElementDefinition to ComponentAppellation ([45ee788](https://github.com/aurelia/aurelia/commit/45ee788))
* **router:** comment & clean up ([40b07bc](https://github.com/aurelia/aurelia/commit/40b07bc))
* **router:** clean up & comment ([d860884](https://github.com/aurelia/aurelia/commit/d860884))
* **router:** split navigation to viewer+store & comment ([b480426](https://github.com/aurelia/aurelia/commit/b480426))
* **router:** comment & clean up ([c449491](https://github.com/aurelia/aurelia/commit/c449491))
* **router:** clean up ([33021b9](https://github.com/aurelia/aurelia/commit/33021b9))
* **router:** merge StateCoordinator/NavigationCoordinator ([a8fff05](https://github.com/aurelia/aurelia/commit/a8fff05))
* **router:** clean up ([dbd6f0e](https://github.com/aurelia/aurelia/commit/dbd6f0e))
* **router:** restructure events ([eb91b0d](https://github.com/aurelia/aurelia/commit/eb91b0d))
* **router:** improve parameter handling ([2748479](https://github.com/aurelia/aurelia/commit/2748479))
* **router:** clean up ([2a9f10e](https://github.com/aurelia/aurelia/commit/2a9f10e))
* **router:** rename reentry to reload ([17d1b0d](https://github.com/aurelia/aurelia/commit/17d1b0d))
* **router:** add EventManager ([d6d26ca](https://github.com/aurelia/aurelia/commit/d6d26ca))
* **router:** comment & clean up ([dc6bb7c](https://github.com/aurelia/aurelia/commit/dc6bb7c))
* **router:** comment ([3bd8241](https://github.com/aurelia/aurelia/commit/3bd8241))
* **router:** rename NextContentAction to TransitionAction ([f80b0e1](https://github.com/aurelia/aurelia/commit/f80b0e1))
* **router:** comment ([503177d](https://github.com/aurelia/aurelia/commit/503177d))
* **router:** clean up ([871601c](https://github.com/aurelia/aurelia/commit/871601c))
* **router:** remove _owningScope & _scope ([a0ad0e5](https://github.com/aurelia/aurelia/commit/a0ad0e5))
* **router:** clean up ([b328a89](https://github.com/aurelia/aurelia/commit/b328a89))
* **router:** clean up ([24cc10e](https://github.com/aurelia/aurelia/commit/24cc10e))
* **router:** remove routingContainer & comment ([81ae828](https://github.com/aurelia/aurelia/commit/81ae828))
* **router:** clean up ([89665b3](https://github.com/aurelia/aurelia/commit/89665b3))
* **router:** replace SwapStrategy with SwapOrder ([eb7f31c](https://github.com/aurelia/aurelia/commit/eb7f31c))
* **router:** clean up ([02ae99e](https://github.com/aurelia/aurelia/commit/02ae99e))
* **router:** remove unnecessary checks ([e4b9896](https://github.com/aurelia/aurelia/commit/e4b9896))
* **router:** make Runner reject when cancelled ([dcad056](https://github.com/aurelia/aurelia/commit/dcad056))
* **router:** move endpoint files ([a73539a](https://github.com/aurelia/aurelia/commit/a73539a))
* **router:** clean up ([bc9f887](https://github.com/aurelia/aurelia/commit/bc9f887))
* **router:** clean up ([025468f](https://github.com/aurelia/aurelia/commit/025468f))
* **router:** remove performLoad & performSwap ([e99c718](https://github.com/aurelia/aurelia/commit/e99c718))
* **router:** remove replacedChildren, parentNextContentAction, performLoad & performSwap ([0c34769](https://github.com/aurelia/aurelia/commit/0c34769))
* **router:** improve before navigation redirect ([079fcbf](https://github.com/aurelia/aurelia/commit/079fcbf))
* **router:** make hook invoke return outcome ([919eaf6](https://github.com/aurelia/aurelia/commit/919eaf6))
* **router:** match params in isIn routing instructions ([4d633ca](https://github.com/aurelia/aurelia/commit/4d633ca))
* **router:** set title after push/replace state ([61fcf7a](https://github.com/aurelia/aurelia/commit/61fcf7a))
* **router:** clean up ([cf6f65e](https://github.com/aurelia/aurelia/commit/cf6f65e))
* **router:** use resource utils ([d8de3b1](https://github.com/aurelia/aurelia/commit/d8de3b1))
* **router:** add resource utils ([642f963](https://github.com/aurelia/aurelia/commit/642f963))
* **router:** clean up and comment ([11782ca](https://github.com/aurelia/aurelia/commit/11782ca))
* **router:** remove unused code ([c06a31e](https://github.com/aurelia/aurelia/commit/c06a31e))
* **router:** export more router events ([cb5bd37](https://github.com/aurelia/aurelia/commit/cb5bd37))
* **router:** use start event in wait for router ([bc7e9b8](https://github.com/aurelia/aurelia/commit/bc7e9b8))
* **router:** add router start stop events ([9d3b9f7](https://github.com/aurelia/aurelia/commit/9d3b9f7))
* **router:** add hooks to router configuration ([f4f0195](https://github.com/aurelia/aurelia/commit/f4f0195))
* **router:** clean up and comment ([6af3aa8](https://github.com/aurelia/aurelia/commit/6af3aa8))
* **router:** remove IRouterStartOptions ([658311f](https://github.com/aurelia/aurelia/commit/658311f))
* **router:** move router options into RouterConfiguration ([9ef3d54](https://github.com/aurelia/aurelia/commit/9ef3d54))
* **router:** use events for link active update ([23840ad](https://github.com/aurelia/aurelia/commit/23840ad))
* **router:** add router navigation events ([45d971e](https://github.com/aurelia/aurelia/commit/45d971e))
* **router:** update promise/import handling ([d781433](https://github.com/aurelia/aurelia/commit/d781433))
* **router:** remove link handler from router ([5411883](https://github.com/aurelia/aurelia/commit/5411883))
* **router:** delete type resolvers file ([a283c6c](https://github.com/aurelia/aurelia/commit/a283c6c))
* **router:** update routing hook signatures ([5e84327](https://github.com/aurelia/aurelia/commit/5e84327))
* **router:** rename Params to Parameters ([9d22b70](https://github.com/aurelia/aurelia/commit/9d22b70))
* **router:** update/comment router options ([d986d63](https://github.com/aurelia/aurelia/commit/d986d63))
* **router:** cleanup ([6cada2b](https://github.com/aurelia/aurelia/commit/6cada2b))
* **router:** update/comment router options ([e88a4fb](https://github.com/aurelia/aurelia/commit/e88a4fb))
* **router:** reset router options on stop ([d43a33a](https://github.com/aurelia/aurelia/commit/d43a33a))
* **router:** improve router options api ([740f477](https://github.com/aurelia/aurelia/commit/740f477))
* **router:** replace LoadInstructionResolver with routing instruction and router ([44b4f70](https://github.com/aurelia/aurelia/commit/44b4f70))
* **router:** no router in LoadInstructionResolver ([348ce99](https://github.com/aurelia/aurelia/commit/348ce99))
* **router:** fix bad component assignment ([e0a9ac3](https://github.com/aurelia/aurelia/commit/e0a9ac3))
* **router:** no router in LoadInstructionResolver ([79f2889](https://github.com/aurelia/aurelia/commit/79f2889))
* **router:** remove router from toLoadInstructions ([647bcde](https://github.com/aurelia/aurelia/commit/647bcde))
* **router:** clean up ([97a8afa](https://github.com/aurelia/aurelia/commit/97a8afa))
* **router:** clean up old closest scope ([ac51f41](https://github.com/aurelia/aurelia/commit/ac51f41))
* **router:** remove bad internal comments ([ffe18e6](https://github.com/aurelia/aurelia/commit/ffe18e6))
* **router:** add wait for entity in coordinator ([5f09437](https://github.com/aurelia/aurelia/commit/5f09437))
* **router:** implement endpoint content ([f72d44c](https://github.com/aurelia/aurelia/commit/f72d44c))
* **router:** add endpoint content ([883ad00](https://github.com/aurelia/aurelia/commit/883ad00))
* **router:** fix need viewport check ([52b6442](https://github.com/aurelia/aurelia/commit/52b6442))
* **router:** add viewport set active ([b2db555](https://github.com/aurelia/aurelia/commit/b2db555))
* **router:** improve compare instruction ([f8bba99](https://github.com/aurelia/aurelia/commit/f8bba99))
* **router:** improve Runner ([c0a5bac](https://github.com/aurelia/aurelia/commit/c0a5bac))
* **router:** remove InstructionResolver ([645c0a5](https://github.com/aurelia/aurelia/commit/645c0a5))
* **router:** refactor InstructionResolver ([b073730](https://github.com/aurelia/aurelia/commit/b073730))
* **router:** add InstructionParser ([067e5d3](https://github.com/aurelia/aurelia/commit/067e5d3))
* **router:** refactor instruction resolver ([626140b](https://github.com/aurelia/aurelia/commit/626140b))
* **router:** add arrayUnique ([db93387](https://github.com/aurelia/aurelia/commit/db93387))
* **router:** improve tech notes ([f231f30](https://github.com/aurelia/aurelia/commit/f231f30))
* **router:** improve tech notes ([e6ccc82](https://github.com/aurelia/aurelia/commit/e6ccc82))
* **router:** improve tech notes ([7d62820](https://github.com/aurelia/aurelia/commit/7d62820))
* **router:** update comments ([9412c0f](https://github.com/aurelia/aurelia/commit/9412c0f))
* **router:** clean up ([f026f7e](https://github.com/aurelia/aurelia/commit/f026f7e))
* **router:** clean up and comments Navigator ([0910265](https://github.com/aurelia/aurelia/commit/0910265))
* **router:** add stringify to RoutingInstruction ([a067e2f](https://github.com/aurelia/aurelia/commit/a067e2f))
* **router:** rename entry to navigation ([517a1e1](https://github.com/aurelia/aurelia/commit/517a1e1))
* **router:** restructure Navigation ([41e1727](https://github.com/aurelia/aurelia/commit/41e1727))
* **router:** implement RoutingHook ([fe628d7](https://github.com/aurelia/aurelia/commit/fe628d7))
* **router:** add comments ([44ee118](https://github.com/aurelia/aurelia/commit/44ee118))
* **router:** implement RoutingHook ([9ba1bf6](https://github.com/aurelia/aurelia/commit/9ba1bf6))
* **router:** add RoutingHook ([093bbe9](https://github.com/aurelia/aurelia/commit/093bbe9))
* **router:** clean up & comment ([32d91b1](https://github.com/aurelia/aurelia/commit/32d91b1))
* **router:** clean up & router processNavigation ([3038dbc](https://github.com/aurelia/aurelia/commit/3038dbc))
* **router:** create Title ([12a47bb](https://github.com/aurelia/aurelia/commit/12a47bb))
* **router:** create Nav ([51e3633](https://github.com/aurelia/aurelia/commit/51e3633))
* **router:** implement RoutingInstruction ([c5b566b](https://github.com/aurelia/aurelia/commit/c5b566b))
* **router:** implement Endpoint ([8230e2e](https://github.com/aurelia/aurelia/commit/8230e2e))
* **router:** clean up ([cf62def](https://github.com/aurelia/aurelia/commit/cf62def))
* **router:** remove createRoutingInstruction ([42d69c7](https://github.com/aurelia/aurelia/commit/42d69c7))
* **router:** clean up ([002b00c](https://github.com/aurelia/aurelia/commit/002b00c))
* **router:** clean up & add comments ([c026398](https://github.com/aurelia/aurelia/commit/c026398))
* **router:** implement Endpoint ([e6b9fc1](https://github.com/aurelia/aurelia/commit/e6b9fc1))
* **router:** add EndpointMatcher ([e00692c](https://github.com/aurelia/aurelia/commit/e00692c))
* **router:** add InstructionViewportScope ([67cd670](https://github.com/aurelia/aurelia/commit/67cd670))
* **router:** restructure utilities ([60a873a](https://github.com/aurelia/aurelia/commit/60a873a))
* **router:** implement RouterOptions ([78ac2c0](https://github.com/aurelia/aurelia/commit/78ac2c0))
* **router:** rename Scope to RoutingScope ([d501d77](https://github.com/aurelia/aurelia/commit/d501d77))
* **router:** rename content and instruction properties ([6e716c9](https://github.com/aurelia/aurelia/commit/6e716c9))
* **router:** move endpoint interfaces ([8a5971e](https://github.com/aurelia/aurelia/commit/8a5971e))
* **router:** add Endpoint ([2e7b9d0](https://github.com/aurelia/aurelia/commit/2e7b9d0))
* **router:** move instruction files ([b1da166](https://github.com/aurelia/aurelia/commit/b1da166))
* **router:** add back promise for routing instruction ([0c21176](https://github.com/aurelia/aurelia/commit/0c21176))
* **router:** replace ViewportInstruction with RoutingInstruction ([4e15dbc](https://github.com/aurelia/aurelia/commit/4e15dbc))
* **router:** implement Runner changes (interim) ([e354513](https://github.com/aurelia/aurelia/commit/e354513))
* **router:** improve Runner ([bf1d78e](https://github.com/aurelia/aurelia/commit/bf1d78e))
* **router:** pass parent to viewport content activate ([d2575a4](https://github.com/aurelia/aurelia/commit/d2575a4))
* **router:** reactivate content states reset ([abf4e1d](https://github.com/aurelia/aurelia/commit/abf4e1d))
* **router:** add dispose null instance check ([9562fd1](https://github.com/aurelia/aurelia/commit/9562fd1))
* **router:** consolidate load and check active ([dbb4c4a](https://github.com/aurelia/aurelia/commit/dbb4c4a))
* **router:** change to separate platform injects & add safe push/replace ([a90e370](https://github.com/aurelia/aurelia/commit/a90e370))
* **router:** move load error msg to viewport content ([13f68e4](https://github.com/aurelia/aurelia/commit/13f68e4))
* **router:** move viewport disconnect to unbinding ([2b3e706](https://github.com/aurelia/aurelia/commit/2b3e706))
* **router:** move viewport disconnect to unbinding ([577dd04](https://github.com/aurelia/aurelia/commit/577dd04))
* **router:** add redirectTo ([7eecd6c](https://github.com/aurelia/aurelia/commit/7eecd6c))
* **router:** enable empty route decorator ([860a847](https://github.com/aurelia/aurelia/commit/860a847))
* **router:** fix rebase issues ([344a5e7](https://github.com/aurelia/aurelia/commit/344a5e7))
* **router:** add configuration decorators ([54e7afa](https://github.com/aurelia/aurelia/commit/54e7afa))
* **router:** rename several navigation parts ([740d23b](https://github.com/aurelia/aurelia/commit/740d23b))
* **router:** add checkedUnload to viewport content ([f10cac8](https://github.com/aurelia/aurelia/commit/f10cac8))
* **router:** modify viewport navigation check ([c83441a](https://github.com/aurelia/aurelia/commit/c83441a))
* **router:** only await swap when necessary ([fdc80b7](https://github.com/aurelia/aurelia/commit/fdc80b7))

