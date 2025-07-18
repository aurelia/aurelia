# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

<a name="2.0.0-beta.25"></a>
# 2.0.0-beta.25 (2025-07-10)

### BREAKING CHANGES:

* **binding:** computed observers notify changes asynchronously by default (#2188) ([f874ccc](https://github.com/aurelia/aurelia/commit/f874ccc))

    this commit changes the way computed observer behave, with regards to change notification. It'll now wait for the next tick
    before sending out notification to subscribers about its changes. Since this is an observer, where access to platform is limited
    and often does not make sense, a new tick based queue has been introduced to replace the existing raf based one.

    To use the new queue, import it from aurelia runtime package during beta 25, and in beta 26, it'll be moved to the surrogate aurelia package
    The new queue related exports are:
    ```
    Task,
    tasksSettled,
    TaskAbortError,
    TaskStatus,
    runTasks,
    RecurringTask,
    getRecurringTasks,
    queueTask,
    queueAsyncTask,
    queueRecurringTask,
    ```
* **dialog:** add standard html dialog renderer (#2145) ([9aab108](https://github.com/aurelia/aurelia/commit/9aab108))

    This commit adds a new dialog renderer that renders the standard `<dialog>` element, and makes it the default renderer.
    This commit also changes the dialog rendering process, now animation can simply be done through `show`/`hide` either globally or per dialog `.open()` call
    making the plugin simpler to use.

    Change details:
    * Dialog dom property overlay is now optional, since not all dialog needs an overlay, having it optional allows renderer to skip populating this altogether.
    * Rename export DefaultDialogConfiguration -> DialogConfigurationClassic, this is because it's no longer the default implementation
    * Remove IDialogEventManager, this now becomes a private implementation of the classic dialog configuration, different dialog configuration may not need it
    * Remove IDialogAnimator, animation now can be done via show/hide property on settings.options (either global, or per dialog open() call)

### Features:

* **queue:** impl queueRecurringTask (#2195) ([ea874a1](https://github.com/aurelia/aurelia/commit/ea874a1))
* **state:** add middleware support (#2181) ([2c98a2e](https://github.com/aurelia/aurelia/commit/2c98a2e))
* **state:** adds memoized selector creator (#2193) ([f6b42af](https://github.com/aurelia/aurelia/commit/f6b42af))
* **router-lite:** path generation (#2158) ([b7f8fd5](https://github.com/aurelia/aurelia/commit/b7f8fd5))
* **runtime-html:** add value converter context (#2159) ([2fda2b5](https://github.com/aurelia/aurelia/commit/2fda2b5))


### Bug Fixes:

* **au-compose:** dont re-compose when detached (#2203) ([94b62ac](https://github.com/aurelia/aurelia/commit/94b62ac))
* **binding:** interpolation correctly react to array mutation (#2202) ([15fa2a6](https://github.com/aurelia/aurelia/commit/15fa2a6))
* **binding:** don't update source when unbound (#2201) ([dc019f8](https://github.com/aurelia/aurelia/commit/dc019f8))
* **vite:** detect production build mode better (#2194) ([e483a92](https://github.com/aurelia/aurelia/commit/e483a92))
* **queue:** prevent task cancellation from triggering unhandledRejection (#2192) ([aac94fd](https://github.com/aurelia/aurelia/commit/aac94fd))
* **runtime:** don't wrap non-configurable and non-writable object properties (#2191) ([bb03139](https://github.com/aurelia/aurelia/commit/bb03139))
* **runtime-html:** prevent unnecessary DOM manipulation in repeater (#2183) ([1fd536b](https://github.com/aurelia/aurelia/commit/1fd536b))
* **i18n:** Add isBound check in TranslationBinding.handleChange to prevent AUR0203 (#2171) ([2dd7323](https://github.com/aurelia/aurelia/commit/2dd7323))
* **route-recognizer:** uri component decoding (#2162) ([23d83f0](https://github.com/aurelia/aurelia/commit/23d83f0))


### Docs:

* **errors:** additional errors from aur0652 to 0757 ([9889291](https://github.com/aurelia/aurelia/commit/9889291))
* **docs:** mermaid fix ([9432f08](https://github.com/aurelia/aurelia/commit/9432f08))

<a name="2.0.0-beta.24"></a>
# 2.0.0-beta.24 (2025-04-27)

### BREAKING CHANGES:

* **vite-plugin:** update vite package to latest v6 (#2147) ([5834d05](https://github.com/aurelia/aurelia/commit/5834d05))
* **templating:** remove controller host (#2128) ([402c746](https://github.com/aurelia/aurelia/commit/402c746))
    Aurelia will no longer automatically create a host element when creating a custom element component from a host element
    that is already associated with another custom element component. This is to avoid surprising/magical behaviors.


### Features:

* **template-compiler:** add support for multiple .class values (#2146) ([3b7513a](https://github.com/aurelia/aurelia/commit/3b7513a))
* **router-lite:** navigation strategy (#2137) ([6a7757f](https://github.com/aurelia/aurelia/commit/6a7757f))
* **dom:** ability to toggle $au and $aurelia (#2130) ([7e1057b](https://github.com/aurelia/aurelia/commit/7e1057b))
* **tooling/type-checking:** support for non-public members ([165c213](https://github.com/aurelia/aurelia/commit/165c213))
* **docs:** add tutorial for using svelte in aurelia ([583d98d](https://github.com/aurelia/aurelia/commit/583d98d))
* **docs:** add tutorials for chatgpt and weather app ([583d98d](https://github.com/aurelia/aurelia/commit/583d98d))
* **docs:** enhance list rendering documentation ([583d98d](https://github.com/aurelia/aurelia/commit/583d98d))
* **docs:** add guides for web workers and websockets ([583d98d](https://github.com/aurelia/aurelia/commit/583d98d))
* **docs:** enhance lambda expressions documentation ([583d98d](https://github.com/aurelia/aurelia/commit/583d98d))


### Bug Fixes:

* **i18n:** reactive translation of conditional projected content - t-params (#2152) ([7fab7e6](https://github.com/aurelia/aurelia/commit/7fab7e6))
* **test:** dialog service test updated to reflect new error message ([4eb7805](https://github.com/aurelia/aurelia/commit/4eb7805))
* **router-lite:** cleanup while reusing route context due to nav strategy (#2144) ([a4d7a65](https://github.com/aurelia/aurelia/commit/a4d7a65))
* **validation:** release reference to binding behavior source (#2143) ([78d0229](https://github.com/aurelia/aurelia/commit/78d0229))
* **validation:** invalidate property info cache when source changes (#2138) ([a0b9ae6](https://github.com/aurelia/aurelia/commit/a0b9ae6))
* **router-lite:** cancelling navigation with redirection from canLoad hook from child route (#2131) ([bb0b09d](https://github.com/aurelia/aurelia/commit/bb0b09d))
* **router-lite:** support for conventional HTML-only component (#2126) ([922eccd](https://github.com/aurelia/aurelia/commit/922eccd))
* **router-lite:** support for local dependencies ([922eccd](https://github.com/aurelia/aurelia/commit/922eccd))
* **tooling/typechecking:** method call ([165c213](https://github.com/aurelia/aurelia/commit/165c213))
* **observation:** allow property deletion with proxy (#2114) ([7e652e9](https://github.com/aurelia/aurelia/commit/7e652e9))
* **validation:** for dynamically accessed fields (#2113) ([f1e8956](https://github.com/aurelia/aurelia/commit/f1e8956))
* **validation:** rule discovery for nested keyed expression ([f1e8956](https://github.com/aurelia/aurelia/commit/f1e8956))
* **ref-binding:** update value when key expression changes (#2108) ([9636d86](https://github.com/aurelia/aurelia/commit/9636d86))


<a name="2.0.0-beta.23"></a>
# 2.0.0-beta.23 (2025-01-26)

### Features:

* **compat:** ported noView and inlineView decorators (#2094) ([bdd1284](https://github.com/aurelia/aurelia/commit/bdd1284))
* **tooling:** type-checking for templates - Phase 1 (#2066) ([ebc1d0c](https://github.com/aurelia/aurelia/commit/ebc1d0c))
* **templating:** support exponentiation operator (#2070) ([373a656](https://github.com/aurelia/aurelia/commit/373a656))
* **templating:** support new operator (#2068) ([ae15ed8](https://github.com/aurelia/aurelia/commit/ae15ed8))


### Bug Fixes:

* **au-slot:** slotchange callback does not rely on deco (#2105) ([4cbef73](https://github.com/aurelia/aurelia/commit/4cbef73))
* **rendering:** render surrogate bindings before content bindings (#2104) ([5df4a6c](https://github.com/aurelia/aurelia/commit/5df4a6c))
* **i18n:** reactive translation of conditional projected content (#2102) ([02ce937](https://github.com/aurelia/aurelia/commit/02ce937))
* **computed-observer:** ensure notifying changes (#2103) ([b87cc11](https://github.com/aurelia/aurelia/commit/b87cc11))
* **docs:** missing double quote ([500c0c7](https://github.com/aurelia/aurelia/commit/500c0c7))
* **hmr:** disposed controllers to avoid memory leak issues (#2090) ([2eac93f](https://github.com/aurelia/aurelia/commit/2eac93f))
* **repeat:** change to key-based scope caching in keyed mode (#2088) ([c24eaaa](https://github.com/aurelia/aurelia/commit/c24eaaa))
* **validation:** removed bindings on unbind (#2082) ([8ecffbe](https://github.com/aurelia/aurelia/commit/8ecffbe))
* **router:** fix canLoad returning false issue (#2067) ([b83b03b](https://github.com/aurelia/aurelia/commit/b83b03b))


### Docs:

* **docs:** update dialog.md code sample (#2060) ([4789d15](https://github.com/aurelia/aurelia/commit/4789d15))


<a name="2.0.0-beta.22"></a>
# 2.0.0-beta.22 (2024-09-30)

### BREAKING CHANGES:

* **ast:** correct null/undefined handling (#2055) ([b96d7c4](https://github.com/aurelia/aurelia/commit/b96d7c4))

    the default non-strict mode now behaves like optional syntax: property access on null/undefined will return undefined
    null/undefined function calls will return undefined. The rest will behave like standard JS, including strict mode
* **observers:** change callback timing to after notify (#2039) ([1e587e1](https://github.com/aurelia/aurelia/commit/1e587e1))

    bindable callback will be called with the timing as "after all have settled", instead of "right when new value comes"
* **parser:** no longer provide default to exp parser interface (#2024) ([b55cbcd](https://github.com/aurelia/aurelia/commit/b55cbcd))

    In build time compilation, template expressions are parsed at build time, we don't need to bundle the expression parser code again.
    This cleanup is to prepare for that.

* **ast:** separate & allow binding behavior and value converter evaluation to be optional (#2058) ([7d7e21b](https://github.com/aurelia/aurelia/commit/7d7e21b))

    Try simplify the interface of ast evaluator so that evaluating ast doesn't always require value converter/binding behavior to be supported.
    This is useful in scenarios where we dont need those two: watch/effect/computed/validation message etc...


### Features:

* **observation:** ability to watch an expression (#2059) ([6cd6b8d](https://github.com/aurelia/aurelia/commit/6cd6b8d))
* **runtime-html:** reuse host and hostController (#2043) ([0fe216e](https://github.com/aurelia/aurelia/commit/0fe216e))
* **bindable:** support aggregated callback (#2033) ([7cdf3f0](https://github.com/aurelia/aurelia/commit/7cdf3f0))


### Bug Fixes:

* **router-lite:** allowed dot in parameter value (#2057) ([9337c84](https://github.com/aurelia/aurelia/commit/9337c84))
* **watch:** initialise only once (#2056) ([7ae2cfa](https://github.com/aurelia/aurelia/commit/7ae2cfa))
* **router:** fix refresh with url params issue (#2051) ([6b733b1](https://github.com/aurelia/aurelia/commit/6b733b1))
* **repeat:** fix update issues when there are duplicates ([9834c40](https://github.com/aurelia/aurelia/commit/9834c40))
* **router:** fix redirect to async raise cond issue (#2046) ([c5dfca3](https://github.com/aurelia/aurelia/commit/c5dfca3))
* **router-lite:** element injection issue (#2045) ([4d93507](https://github.com/aurelia/aurelia/commit/4d93507))
* **validation-i18n:** prioritization of translated messages (#2029) ([a5340f8](https://github.com/aurelia/aurelia/commit/a5340f8))
* **radio:** handle repeated start/stop correctly (#2031) ([430b8f0](https://github.com/aurelia/aurelia/commit/430b8f0))
* **validation-html:** reset binding while unbinding BB (#2027) ([a3b1d09](https://github.com/aurelia/aurelia/commit/a3b1d09))


### Docs:

* **vite-plugin:** add vite instruction for tailwindcss-integration.md (#2028) ([47913c5](https://github.com/aurelia/aurelia/commit/47913c5))


<a name="2.0.0-beta.21"></a>
# 2.0.0-beta.21 (2024-08-08)

### Features:

* **ast:** support increment/decrement assign (#2004) ([4cfc0a3](https://github.com/aurelia/aurelia/commit/4cfc0a3))


### Bug Fixes:

* **state:** ensure all actions queued are called (#2023) ([062f398](https://github.com/aurelia/aurelia/commit/062f398))
* **binding:** handle glitch (#2020) ([0f3dbee](https://github.com/aurelia/aurelia/commit/0f3dbee))
* **router:** fix missing filter part for available endpoints (#2013) ([af7c252](https://github.com/aurelia/aurelia/commit/af7c252))
* **router-lite:** element injection for routed view-model (#2012) ([b1508fb](https://github.com/aurelia/aurelia/commit/b1508fb))
* **types:** bindable definitions (#2010) ([d81b471](https://github.com/aurelia/aurelia/commit/d81b471))
* **task-queue:** fix timing issue (#2007) ([6777dba](https://github.com/aurelia/aurelia/commit/6777dba))
* **router-lite:** location URL with no history and fragment routing (#2005) ([8a84b09](https://github.com/aurelia/aurelia/commit/8a84b09))
* **vite-plugin:** fix vitest Windows issue with html file (#2006) ([27ec4dd](https://github.com/aurelia/aurelia/commit/27ec4dd))


### Refactorings:

* **task-queue:** remove 'reusable' param (#2008) ([54f43e8](https://github.com/aurelia/aurelia/commit/54f43e8))

<a name="2.0.0-beta.20"></a>
# 2.0.0-beta.20 (2024-07-07)

### BREAKING CHANGES:

* **router-lite:** can* hook semantics (#2002) ([ac5359f](https://github.com/aurelia/aurelia/commit/ac5359f))
    `canLoad`/`canUnload` hooks now only treat `false` as `false`.
    Previously `canLoad` and `canUnload` only consider `true` as can do, means if a routing component has either the hook `canLoad`/`canUnload`,
    those hooks must return `true` to `load`/`unload`. This is not consistent with the rest of the frameowrk, and generally will be easier to miss during refactoring.
* **router:** navigation coordinator refactor (#1997) ([1b97340](https://github.com/aurelia/aurelia/commit/1b97340))
    `canLoad`/`canUnload` hooks now only treat `false` as `false`.
    Moves responsibilities and recursive code from routing scope to iterative code in navigation coordinator.
    Refresh and browser back and forward now behave the same way deep links does; if a viewport with a default component/route has been emptied/cleared the mentioned browser actions will now load the default (instead of keeping the viewport empty).
* **tooling:** bindable inheritance ([bb1fe26](https://github.com/aurelia/aurelia/commit/bb1fe26))
    When generating types for `.html` file with convention, `bindables` export will be a record, instead of array now.
    Applications migrating from `beta.15`-`beta.19` will need to change the types for `.html` modules in `resource.d.ts` like the following example:
    ```ts
    ...
    export const bindables: Record<string, Partial<BindableDefinition>>
    ...
    ```
    or if it doesn't matter to your applications, simple having
    ```ts
    ...
    export const bindables: Record<string, any>
    ...
    ```
    will also work.
* **metadata:** metadata is defined on the immediate target class, instead of first available metadata source (i.e inherited from parent) (#1992) ([bb1fe26](https://github.com/aurelia/aurelia/commit/bb1fe26))

### Bug Fixes:

* **router-lite:** external attribute for href (#2000) ([f062ba0](https://github.com/aurelia/aurelia/commit/f062ba0))

### Refactorings:

* **validation:** state rule using record to declare messages ([9df93e0](https://github.com/aurelia/aurelia/commit/9df93e0))

<a name="2.0.0-beta.19"></a>
# 2.0.0-beta.19 (2024-06-12)

### Features:

* **event:** support common event modifier on all events (#1994) ([631d1e8](https://github.com/aurelia/aurelia/commit/631d1e8))
* **di:** ability to deregister key (#1981) ([8eb5c36](https://github.com/aurelia/aurelia/commit/8eb5c36))
* **validation:** state rule (#1985) ([8f2df94](https://github.com/aurelia/aurelia/commit/8f2df94))
* **plugin-conventions:** support foo.module.css CSS module convention (#1988) ([d8791ae](https://github.com/aurelia/aurelia/commit/d8791ae))
* **dialog:** ability to animate using animator instead of lifecycles (#1986) ([a2477e5](https://github.com/aurelia/aurelia/commit/a2477e5))


### Bug Fixes:

* **dialog:** prevent default actionless form submit ([631d1e8](https://github.com/aurelia/aurelia/commit/631d1e8))
* **plugin-conventions:** relax typescript dependency version ([02921ca](https://github.com/aurelia/aurelia/commit/02921ca))
* **router-lite:** replace transition plan for same component with different paths (#1982) ([5d54b7f](https://github.com/aurelia/aurelia/commit/5d54b7f))


### Refactorings:

* **css-modules:** alter bindings instead of class registration (#1989) ([85917a9](https://github.com/aurelia/aurelia/commit/85917a9))
* **projection:** use $all instead of * to include all node types (#1987) ([337cb34](https://github.com/aurelia/aurelia/commit/337cb34))

<a name="2.0.0-beta.18"></a>
# 2.0.0-beta.18 (2024-05-23)

### BREAKING CHANGES:

* **dom-queue:** merge dom read and write queues (#1970) ([3a63cde](https://github.com/aurelia/aurelia/commit/3a63cde))


### Features:

* **dialog:** ability to specify dialog per open call (#1978) ([7d44ed1](https://github.com/aurelia/aurelia/commit/7d44ed1))
* **dialog:** add event manager for custom event handling extension ([7d44ed1](https://github.com/aurelia/aurelia/commit/7d44ed1))
* **kernel:** add last resolver (#1976) ([c47817c](https://github.com/aurelia/aurelia/commit/c47817c))
* **router-lite:** current route (#1966) ([d966e15](https://github.com/aurelia/aurelia/commit/d966e15))


### Bug Fixes:

* **di:** use official metadata instead of weakmap (#1977) ([9aeeffa](https://github.com/aurelia/aurelia/commit/9aeeffa))
* **router-lite:** current route subscription disposal (#1969) ([ace4c65](https://github.com/aurelia/aurelia/commit/ace4c65))
* **convention:** typing: use array for bindables isntead of object (#1967) ([f1a73d6](https://github.com/aurelia/aurelia/commit/f1a73d6))


### Refactorings:

* **collection:** define map & set overrides on the instance instead of prototype (#1975) ([253e92a](https://github.com/aurelia/aurelia/commit/253e92a))
* **runtime:** reoganise utils import ([253e92a](https://github.com/aurelia/aurelia/commit/253e92a))
* **fetch-client:** extract error codes and cleanup (#1974) ([63ffdc9](https://github.com/aurelia/aurelia/commit/63ffdc9))
* **i18n-validation:** replace errors with error codes (#1972) ([f91f31c](https://github.com/aurelia/aurelia/commit/f91f31c))
* **dev:** turbo package input glob + ts dev script ([253e92a](https://github.com/aurelia/aurelia/commit/253e92a))

### Docs:

* **doc:** updated ISignaler documentation example (#1973) ([e0481d6](https://github.com/aurelia/aurelia/commit/e0481d6))


<a name="2.0.0-beta.17"></a>
# 2.0.0-beta.17 (2024-05-11)

### BREAKING CHANGES:

* **template:** auto infer binding expression when empty (#1963) ([3359939](https://github.com/aurelia/aurelia/commit/3359939))
    
    Previously only the expression of binding to element bindables get auto inferred, now it's expanded to all bindings
    with `.bind`/`.to-view`/`.from-view`/`.two-way`/`.one-time`
    Examples:
    ```html
    <div some-prop.bind=""> means <div some-prop.bind="someProp">
    <div some-prop.bind> means <div some-prop.bind="someProp">
    <div some-prop.one-time> means <div some-prop.one-time="someProp">
    ...
    ```
* **convention:** rewrite runtime-html decorators (#1960) ([eaf2cd7](https://github.com/aurelia/aurelia/commit/eaf2cd7))

    With tooling in the instable state for the tc39 decorator support, we will generate standard fn call code instead of decorator.
    This will likely be changed when browsers start officially supporting it, or at least when the tooling (both spec & tooling stability + compat) gets better


### Features:

* **template:** support spread syntax with `spread` command and ... (#1965) ([ccae63b](https://github.com/aurelia/aurelia/commit/ccae63b))
* **repeat:** allow custom repeatable value (#1962) ([c47df91](https://github.com/aurelia/aurelia/commit/c47df91))


### Bug Fixes:

* **compiler:** fix order when spreading custom attribute into element bindable ([ccae63b](https://github.com/aurelia/aurelia/commit/ccae63b))
* **au-slot:** separate parent scope selection from host scope selection (#1961) ([ff605fb](https://github.com/aurelia/aurelia/commit/ff605fb))


### Refactorings:

* **kernel:** mark side effect free (#1964) ([22c8f71](https://github.com/aurelia/aurelia/commit/22c8f71))

<a name="2.0.0-beta.16"></a>
# 2.0.0-beta.16 (2024-05-03)

### Bug Fixes:

* **au-slot:** ensure passthrough slot get the right host value (#1959) ([f266ddd](https://github.com/aurelia/aurelia/commit/f266ddd))
* **rendering:** correctly handle compilation cache (#1955) ([c11491b](https://github.com/aurelia/aurelia/commit/c11491b))


### Refactorings:

* **router-lite:** avoided duplicate CE defn reg to same container (#1956) ([6578e54](https://github.com/aurelia/aurelia/commit/6578e54))
* **compiler:** extract template compiler into own package (#1954) ([ad7ae1e](https://github.com/aurelia/aurelia/commit/ad7ae1e))
* **compiler:** simplify definition creation (#1950) ([bb0fcab](https://github.com/aurelia/aurelia/commit/bb0fcab))
* **observers:** use static blocks, group related code ([ca22bc8](https://github.com/aurelia/aurelia/commit/ca22bc8))
* **runtime:** move scope to runtime html (#1945) ([bca0290](https://github.com/aurelia/aurelia/commit/bca0290))

<a name="2.0.0-beta.15"></a>
# 2.0.0-beta.15 (2024-04-17)

### BREAKING CHANGES:

* **expression-parser:** move exp parser to its own package (#1943) ([6e7dcad](https://github.com/aurelia/aurelia/commit/6e7dcad))
* **bindings:** move binding infra to runtime html (#1944) ([1c7608a](https://github.com/aurelia/aurelia/commit/1c7608a))
* **runtime:** migration to TC39 decorators + metadata simplification (#1932) ([22f90ad](https://github.com/aurelia/aurelia/commit/22f90ad))

### Features:

* **resources:** support static `$au` property for definition (#1939) ([877a385](https://github.com/aurelia/aurelia/commit/877a385))


### Bug Fixes:

* **ts-jest:** add isolated modules for internal ts-jest instance (#1941) ([7eb31f4](https://github.com/aurelia/aurelia/commit/7eb31f4))
* **vite-plugin:** missed some default options in "load" preprocess (#1936) ([794f3c6](https://github.com/aurelia/aurelia/commit/794f3c6))
* **vite-plugin:** when using ShadowDOM, need to load css as string (#1934) ([32e8cc1](https://github.com/aurelia/aurelia/commit/32e8cc1))


<a name="2.0.0-beta.14"></a>
# 2.0.0-beta.14 (2024-04-03)

### Features:

* **custom-attribute:** ability to find closest attr by name or ctor (#1928) ([ab28585](https://github.com/aurelia/aurelia/commit/ab28585))
* **i18n:** support multiple versions of i18next (#1927) ([0789ee5](https://github.com/aurelia/aurelia/commit/0789ee5))


### Bug Fixes:

* **enhance:** dont call app tasks from parent container (#1933) ([e7119ec](https://github.com/aurelia/aurelia/commit/e7119ec))
* **form:** prevent actionless submission (#1931) ([1fc74d4](https://github.com/aurelia/aurelia/commit/1fc74d4))


### Refactorings:

* **attr:** treat empty string as no binding (#1930) ([8fc5275](https://github.com/aurelia/aurelia/commit/8fc5275))

<a name="2.0.0-beta.13"></a>
# 2.0.0-beta.13 (2024-03-15)

### BREAKING CHANGE:

* **event:** no longer call prevent default by default (#1926) ([f71e9e7](https://github.com/aurelia/aurelia/commit/f71e9e7))
* **exports:** no longer re-export fetch client package (#1926) ([f71e9e7](https://github.com/aurelia/aurelia/commit/f71e9e7))

### Features:

* **process-content:** ability to add template information to a data object (#1925) ([2a4c436](https://github.com/aurelia/aurelia/commit/2a4c436))
* **template-controller:** ability to have a container per factory (#1924) ([6727b56](https://github.com/aurelia/aurelia/commit/6727b56))
* **convention:** add import as support (#1920) ([7a15551](https://github.com/aurelia/aurelia/commit/7a15551))
* **resources:** api to register resources with alias key ([7a15551](https://github.com/aurelia/aurelia/commit/7a15551))
* **dev:** better DI error messages for instantiation (#1917) ([2fca6ea](https://github.com/aurelia/aurelia/commit/2fca6ea))


### Bug Fixes:

* **router-lite:** dont register config ([f71e9e7](https://github.com/aurelia/aurelia/commit/f71e9e7))
* **di:** cache factory on singleton resolution ([dc22fb7](https://github.com/aurelia/aurelia/commit/dc22fb7))


### Refactorings:

* **router:** (DEV) dont swallow instantiation error details ([deee8e6](https://github.com/aurelia/aurelia/commit/deee8e6))
* **compiler:** remove special treatment for au slot ([2a4c436](https://github.com/aurelia/aurelia/commit/2a4c436))
* **kernel:** smaller di files, assert text options, more au slot tests ([deee8e6](https://github.com/aurelia/aurelia/commit/deee8e6))
* **runtime:** move constructor registration into controller ([7a15551](https://github.com/aurelia/aurelia/commit/7a15551))
* **resource:** cleanup registration, APIs (#1918) ([dc22fb7](https://github.com/aurelia/aurelia/commit/dc22fb7))
* **resources:** cleanup util fn, move to kernel package ([dc22fb7](https://github.com/aurelia/aurelia/commit/dc22fb7))
* **resources:** move find to corresponding resource kind ([dc22fb7](https://github.com/aurelia/aurelia/commit/dc22fb7))
* **di:** add registrable, remove unecessary infra for attr pattern ([dc22fb7](https://github.com/aurelia/aurelia/commit/dc22fb7))
* **resource:** remove resource protocol, simplify resource metadata ([dc22fb7](https://github.com/aurelia/aurelia/commit/dc22fb7))

### Docs:

* **docs:** add key documentation for the repeater (#1921) ([c3d0ed3](https://github.com/aurelia/aurelia/commit/c3d0ed3))
* **docs:** add documentation for event preventDefault breaking change (#1926) ([f71e9e7](https://github.com/aurelia/aurelia/commit/f71e9e7))

<a name="2.0.0-beta.12"></a>
# 2.0.0-beta.12 (2024-03-02)

### BREAKING CHANGE:

* **enhance:** call app tasks with `.enhance` API, return app root instead of controller (#1916) ([4d522b2](https://github.com/aurelia/aurelia/commit/4d522b2))
* **au-compose:** always create host for non custom element composition (#1906) ([8a28e0a](https://github.com/aurelia/aurelia/commit/8a28e0a))


### Features:

* **au-compose:** ability to compose string as element name (#1913) ([06aa113](https://github.com/aurelia/aurelia/commit/06aa113))


### Bug Fixes:

* **router:** prevent multiple navigation at the same time (#1895) ([deed11e](https://github.com/aurelia/aurelia/commit/deed11e))
* **router:** properly handle false in conditional router hooks (#1900) ([a671463](https://github.com/aurelia/aurelia/commit/a671463))
* **di:** dont jit register resources ([8ffde34](https://github.com/aurelia/aurelia/commit/8ffde34))
* **di:** new instance resolver (#1909) ([efe208c](https://github.com/aurelia/aurelia/commit/efe208c))
* **runtime:** tweak typings of injectable token ([89f76eb](https://github.com/aurelia/aurelia/commit/89f76eb))


### Refactorings:

* **runtime:** delay overriding array prototypes (#1914) ([d8be144](https://github.com/aurelia/aurelia/commit/d8be144))
* **router:** use resolve ([89f76eb](https://github.com/aurelia/aurelia/commit/89f76eb))
* **runtime:** better type inferrence for injectable token ([89f76eb](https://github.com/aurelia/aurelia/commit/89f76eb))
* **di:** simplify container has, cleanup router ([89f76eb](https://github.com/aurelia/aurelia/commit/89f76eb))

### Docs:

* **docs:** add JS examples using resolve for IHttpClient (#1907) ([d57c1f1](https://github.com/aurelia/aurelia/commit/d57c1f1))
* **doc:** remove define hook from documentation (#1903) ([f684141](https://github.com/aurelia/aurelia/commit/f684141))

<a name="2.0.0-beta.11"></a>
# 2.0.0-beta.11 (2024-02-13)

### BREAKING CHANGE:

* **templating:** custom element takes priority over custom attribute (#1897) ([e8b2c80](https://github.com/aurelia/aurelia/commit/e8b2c80))
* **fetch-client:** cleanup, add tests, tweak doc & prepare cache interceptor (#1756) ([a931dac](https://github.com/aurelia/aurelia/commit/a931dac))
    * rename interfaces
* **controller:** remove define lifecycle hook (#1899) ([ec2e270](https://github.com/aurelia/aurelia/commit/ec2e270))


### Features:

* **event:** ability to add modifier (#1891) ([67a3c22](https://github.com/aurelia/aurelia/commit/67a3c22))
* **runtime:** impl 'this' / AccessBoundary (#1892) ([6d3d250](https://github.com/aurelia/aurelia/commit/6d3d250))
* **state:** support redux devtools for the state plugin (#1888) ([bd07160](https://github.com/aurelia/aurelia/commit/bd07160))


### Bug Fixes:

* **i18n:** unsubscribe locale change ([ec2e270](https://github.com/aurelia/aurelia/commit/ec2e270))
* **convention:** no longer process shadowdom + `<slot>` (#1889) ([e29bbef](https://github.com/aurelia/aurelia/commit/e29bbef))


### Refactorings:

* **build:** upgrade rollup, tweak build scripts ([bd07160](https://github.com/aurelia/aurelia/commit/bd07160))


<a name="2.0.0-beta.10"></a>
# 2.0.0-beta.10 (2024-01-26)

### BREAKING CHANGE:

* **enums:** string literal types replace const enums (#1870) ([e21e0c9](https://github.com/aurelia/aurelia/commit/e21e0c9))


### Features:

* **route-recognizer:** support for route parameter constraints (#1862) ([8f29cfd](https://github.com/aurelia/aurelia/commit/8f29cfd))


### Bug Fixes:

* **docs:** various doc fix
* **au-slot:** properly handle nested projection registration (#1881) ([00e8dee](https://github.com/aurelia/aurelia/commit/00e8dee))
* **kernel:** stack preserving error logging for console (#1884) ([030bfa1](https://github.com/aurelia/aurelia/commit/030bfa1))
* **portal:** remove target marker when deactivated (#1883) ([3db4c17](https://github.com/aurelia/aurelia/commit/3db4c17))
* **validation:** evaluation of tagged rules from bindings (#1878) ([43d12f6](https://github.com/aurelia/aurelia/commit/43d12f6))
* **validation:** property parsing with lambda and istanbul (#1877) ([71f82cf](https://github.com/aurelia/aurelia/commit/71f82cf))
* **router:** store root/default page instruction correctly (#1869) ([84e6380](https://github.com/aurelia/aurelia/commit/84e6380))
* **runtime-html:** template wrapping  (#1875) ([bfdaa3b](https://github.com/aurelia/aurelia/commit/bfdaa3b))
* **i18n:** handle change of key in t.bind (#1868) ([c185764](https://github.com/aurelia/aurelia/commit/c185764))
* **router-lite:** Router injection and ignoring null/undefined values for query parameters (#1859) ([6a79bc9](https://github.com/aurelia/aurelia/commit/6a79bc9))
* **router-lite:** injection of Router alias ([6a79bc9](https://github.com/aurelia/aurelia/commit/6a79bc9))
* **runtime-html:** fix broken tests ([bfdaa3b](https://github.com/aurelia/aurelia/commit/bfdaa3b))


<a name="2.0.0-beta.9"></a>
# 2.0.0-beta.9 (2023-12-12)

### Features:

* **vite:** allow all the options to be passed for the plugin (#1830) ([3d87341](https://github.com/aurelia/aurelia/commit/3d87341))
* **template:** properly set attrs and add tests (#1851) ([f4b552b](https://github.com/aurelia/aurelia/commit/f4b552b))


### Bug Fixes:

* **build:** fix generative native modules, examples (#1854) ([9a7cc65](https://github.com/aurelia/aurelia/commit/9a7cc65))
* **au-slot:** ensure work with shadow dom (#1841) ([c750d4f](https://github.com/aurelia/aurelia/commit/c750d4f))
* **repeater:** duplicate primitive handling, batched mutation fix (#1840) ([703d275](https://github.com/aurelia/aurelia/commit/703d275))
* **repeat:** fix sort+splice batched operation bug ([703d275](https://github.com/aurelia/aurelia/commit/703d275))
* **validation:** property accessor ignore instrumenter ([342847f](https://github.com/aurelia/aurelia/commit/342847f))
* **validation:** allowed rules.off on object w/o rules ([342847f](https://github.com/aurelia/aurelia/commit/342847f))
* **i18n:** translating camelCased bindables (#1838) ([ff761fb](https://github.com/aurelia/aurelia/commit/ff761fb))
* **router-lite:** invoke-lifecycles transition plan (#1821) ([8e961af](https://github.com/aurelia/aurelia/commit/8e961af))
* **router-lite:** transition plan selection (#1817) ([d214fdc](https://github.com/aurelia/aurelia/commit/d214fdc))
* **router-lite:** excluded redirectTo from nav-model (#1816) ([085a491](https://github.com/aurelia/aurelia/commit/085a491))
* **dialog:** use startingZIndex (#1809) ([de79aea](https://github.com/aurelia/aurelia/commit/de79aea))


### Refactorings:

* **runtime-html:** if TC (#1833) ([7192e74](https://github.com/aurelia/aurelia/commit/7192e74))
* **templating:** remove strict binding option from CE (#1807) ([7b4455f](https://github.com/aurelia/aurelia/commit/7b4455f))
* **tests:** move all under src folder ([7b4455f](https://github.com/aurelia/aurelia/commit/7b4455f))
* **docs:** various improvements

<a name="2.0.0-beta.8"></a>
# 2.0.0-beta.8 (2023-07-24)

### Features:

* **compose:** passthrough bindings + support containerless (#1792) ([e8e39a9](https://github.com/aurelia/aurelia/commit/e8e39a9))
* **template:** access global (#1790) ([2486b58](https://github.com/aurelia/aurelia/commit/2486b58))


### Bug Fixes:

* **router-lite:** handling slash in parameter value (#1805) ([3fbb698](https://github.com/aurelia/aurelia/commit/3fbb698))
* **au-slot:** correctly prepare resources for slotted view (#1802) ([bf1ca4c](https://github.com/aurelia/aurelia/commit/bf1ca4c))
* **router-lite:** e2e build ([a1ca36d](https://github.com/aurelia/aurelia/commit/a1ca36d))


### Refactorings:

* **ref:** deprecate view-model.ref and introduce component.ref (#1803) ([97e8dad](https://github.com/aurelia/aurelia/commit/97e8dad))
* **text-binding:** always evaluate expressions in strict mode (#1801) ([15acfee](https://github.com/aurelia/aurelia/commit/15acfee))
* **router-lite:** query in fragment when using useUrlFragmentHash option (#1794) ([a1ca36d](https://github.com/aurelia/aurelia/commit/a1ca36d))
* ***:** bindable property -> name (#1783) ([ca0eda7](https://github.com/aurelia/aurelia/commit/ca0eda7))
* **router-lite:** optimize object creation (#1782) ([c1ef0a3](https://github.com/aurelia/aurelia/commit/c1ef0a3))

<a name="2.0.0-beta.7"></a>
# 2.0.0-beta.7 (2023-06-16)

### Features:

* **router-lite:** error recovery ([99a6191](https://github.com/aurelia/aurelia/commit/99a6191))
* **build:** add a development entry point (#1770) ([69ff445](https://github.com/aurelia/aurelia/commit/69ff445))


### Bug Fixes:

* **router-lite:** hash compatibility with v1 (#1779) ([9302db5](https://github.com/aurelia/aurelia/commit/9302db5))
* **router-lite:** URL generation in child component (#1778) ([fd4de06](https://github.com/aurelia/aurelia/commit/fd4de06))
* **resolver:** mark private as internal ([07689bf](https://github.com/aurelia/aurelia/commit/07689bf))
* **router-lite:** viewport name match for contains check in RouteNode ([99a6191](https://github.com/aurelia/aurelia/commit/99a6191))
* **router-lite:** error recovery from child's hook ([99a6191](https://github.com/aurelia/aurelia/commit/99a6191))
* **plugin-conventions:** fill up explicit .js/.ts dep filename in html module (#1752) ([17af0c8](https://github.com/aurelia/aurelia/commit/17af0c8))


### Refactorings:

* **runtime:** cleanup, extract error to const enums (#1775) ([07689bf](https://github.com/aurelia/aurelia/commit/07689bf))
* **router-lite:** residue handling ([99a6191](https://github.com/aurelia/aurelia/commit/99a6191))
* **router-lite:** error handling ([99a6191](https://github.com/aurelia/aurelia/commit/99a6191))
* **router-lite:** optimize for bundle size ([99a6191](https://github.com/aurelia/aurelia/commit/99a6191))
* **compiler:** use comment to mark target (#1774) ([e37802c](https://github.com/aurelia/aurelia/commit/e37802c))
* **runtime-html:** cleanup errors, remove unused code. (#1771) ([750210d](https://github.com/aurelia/aurelia/commit/750210d))

<a name="2.0.0-beta.6"></a>
# 2.0.0-beta.6 (2023-05-21)

### BREAKING CHANGE:

* **compiler:** avoid using au class to find targets (#1768) ([0d30998](https://github.com/aurelia/aurelia/commit/0d30998)).
* ***:** rename resolveAll -> onResolveAll (#1764) ([fdf0747](https://github.com/aurelia/aurelia/commit/fdf0747))

### Features:

* **di:** ability to use newInstance()/forScope() with interface (#1767) ([a0d39e9](https://github.com/aurelia/aurelia/commit/a0d39e9))
* **all:** allow injection of implementation (#1766) ([a60db13](https://github.com/aurelia/aurelia/commit/a60db13))
* **templating:** allow deactivate when activating (#1729) ([1c9c97c](https://github.com/aurelia/aurelia/commit/1c9c97c))
* **bindable:** support getter/setter (#1753) ([4279851](https://github.com/aurelia/aurelia/commit/4279851))
* **ui-virtualization:** enhance implementation & publish package (#1759) ([7a2f17f](https://github.com/aurelia/aurelia/commit/7a2f17f)). Thanks [@Lakerfield](https://github.com/Lakerfield)


### Refactorings:

* ***:** cleanup up unused code & decouple interface from default impl (#1761) ([7a71d43](https://github.com/aurelia/aurelia/commit/7a71d43))
* **router:** add warning for unsupported behavior (#1757) ([ce87339](https://github.com/aurelia/aurelia/commit/ce87339)). The router used to allow container traversal to
find resources when a string is used as a route to find the corresponding component.
Going forward this will be invalid and resources must be registered either locally
or globally to be routable. A warning is added first so app that accidentally used
this behavior can detect the invalid usages and fix accordingly first. This behavior will be removed in a near future release.


<a name="2.0.0-beta.5"></a>
# 2.0.0-beta.5 (2023-04-27)

### Features:

* **observer-locator:** ability to create getter based observer (#1750) ([ba40b2d](https://github.com/aurelia/aurelia/commit/ba40b2d))
* **effect:** add watch ([ba40b2d](https://github.com/aurelia/aurelia/commit/ba40b2d))
* **di:** property injection with `resolve` (#1748) ([a22826a](https://github.com/aurelia/aurelia/commit/a22826a))
* **aurelia:** ability to inject with `Aurelia` export beside `IAurelia` ([a22826a](https://github.com/aurelia/aurelia/commit/a22826a))


### Bug Fixes:

* **plugin-conventions:** ensure esm cjs compat (#1751) ([f808503](https://github.com/aurelia/aurelia/commit/f808503))
* **compat-v1:** dont use both writable and getter/setter ([b58f967](https://github.com/aurelia/aurelia/commit/b58f967))


### Refactorings:

* **build:** preserve pure annotation for better tree shaking (#1745) ([0bc5cd6](https://github.com/aurelia/aurelia/commit/0bc5cd6))
* **router-lite:** alias registrations (#1741) ([f5e7140](https://github.com/aurelia/aurelia/commit/f5e7140))

<a name="2.0.0-beta.4"></a>
# 2.0.0-beta.4 (2023-04-13)

### Features:

* **debounce-throttle:** flush via signals (#1739) ([af238a9](https://github.com/aurelia/aurelia/commit/af238a9))
* **slotted:** add slotted decorator, slotchange bindable for au-slot (#1735) ([8cf87af](https://github.com/aurelia/aurelia/commit/8cf87af))
* **router-lite:** extended support for ../ prefix, activeClass router configuration (#1733) ([bd18fde](https://github.com/aurelia/aurelia/commit/bd18fde))
* **router-lite:** non-string support for fallback (#1730) ([59da952](https://github.com/aurelia/aurelia/commit/59da952))
* **vite-plugin:** add vite plugin (#1726) ([564e533](https://github.com/aurelia/aurelia/commit/564e533))
* **router-lite:** ce aliases as configured route (#1723) ([2b7f9fc](https://github.com/aurelia/aurelia/commit/2b7f9fc))
* **router-lite:** transitionplan as nav opt ([7905d98](https://github.com/aurelia/aurelia/commit/7905d98))


### Bug Fixes:

* **repeat:** fix mismatchedLengthError on assigning an array with duplicate primitive values (#1737) ([cf60ac8](https://github.com/aurelia/aurelia/commit/cf60ac8))
* **vite-plugin:** optionally resolve alias, add preliminary doc (#1731) ([3f37f8d](https://github.com/aurelia/aurelia/commit/3f37f8d))
* **select:** insensitive multiple.bind order (#1727) ([c8d912f](https://github.com/aurelia/aurelia/commit/c8d912f))
* **ci:** fix vite build in ci, upgrade chromedriver ([564e533](https://github.com/aurelia/aurelia/commit/564e533))
* **proxy-observation:** prevent proxies from being wrapped in proxies again (#1716) ([7792e9c](https://github.com/aurelia/aurelia/commit/7792e9c))


### Refactorings:

* **children:** remove children observers from custom element def, make children deco as a hook (#1732) ([5bde983](https://github.com/aurelia/aurelia/commit/5bde983))
* **all:** ignore dev message coverage ([5bde983](https://github.com/aurelia/aurelia/commit/5bde983))
* **router-lite:** routable fallback ([59da952](https://github.com/aurelia/aurelia/commit/59da952))
* **platform:** remove unnecessary properties on PLATFORM (#1722) ([7cd77ad](https://github.com/aurelia/aurelia/commit/7cd77ad))
* **router-lite:** route definition configuration ([eba6d61](https://github.com/aurelia/aurelia/commit/eba6d61))


<a name="2.0.0-beta.3"></a>
# 2.0.0-beta.3 (2023-03-24)

## BREAKING CHANGES

* **compose:** rename props and add compat layer (#1699) ([2e7ce43](https://github.com/aurelia/aurelia/commit/2e7ce43))
* **controller:** remove lifecycle flags (#1707) ([a31cd75](https://github.com/aurelia/aurelia/commit/a31cd75))
* **state:** action to be comes a single value (#1709) ([6b598d6](https://github.com/aurelia/aurelia/commit/6b598d6))

### Features:

* **proxy:** add nowrap decorator (#1708) ([6edddab](https://github.com/aurelia/aurelia/commit/6edddab))
* **style:** add warning messages when binding number to ambiguous properties (#1702) ([0937b63](https://github.com/aurelia/aurelia/commit/0937b63))
* **router-lite:** function for fallback ([3bfb1ce](https://github.com/aurelia/aurelia/commit/3bfb1ce))


### Bug Fixes:

* **doc:** Update navigating.md (#1706) ([6b02bc4](https://github.com/aurelia/aurelia/commit/6b02bc4))
* **router-lite:** removed pre-mature optimization ([c951f0c](https://github.com/aurelia/aurelia/commit/c951f0c))
* **css-modules:** class command css module (#1690) ([b6606d4](https://github.com/aurelia/aurelia/commit/b6606d4))
* **au-slot:** register the right view model instance for injection (#1685) ([b42d52f](https://github.com/aurelia/aurelia/commit/b42d52f))


### Refactorings:

* **i18n:** do not wrap i18next with proxy ([6edddab](https://github.com/aurelia/aurelia/commit/6edddab))
* **ci:** remove e2e safari from pipeline ([a31cd75](https://github.com/aurelia/aurelia/commit/a31cd75))
* **tests:** disable hook tests ([a31cd75](https://github.com/aurelia/aurelia/commit/a31cd75))
* **build:** use turbo to boost build speed (#1692) ([d99b136](https://github.com/aurelia/aurelia/commit/d99b136))

<a name="2.0.0-beta.2"></a>
# 2.0.0-beta.2 (2023-02-26)

### Features:

* **router-lite:** useNavigationModel ([542d564](https://github.com/aurelia/aurelia/commit/542d564))
* **compat:** add binding engine (#1679) ([a6dd0de](https://github.com/aurelia/aurelia/commit/a6dd0de))
* **router-lite:** async getRouteConfig ([da650fb](https://github.com/aurelia/aurelia/commit/da650fb))
* add vite plugin (#1651) ([5f3a88d](https://github.com/aurelia/aurelia/commit/5f3a88d))


### Bug Fixes:

* **dom:** broken in safari16 (#1680) ([62321a7](https://github.com/aurelia/aurelia/commit/62321a7))
* **templating:** ensure fragment always have proper owner document ([62321a7](https://github.com/aurelia/aurelia/commit/62321a7))
* **router-lite:** nav model isActive for parameterized route ([91cc2cc](https://github.com/aurelia/aurelia/commit/91cc2cc))
* **docs:** fix enhance example code ([8bbf6f2](https://github.com/aurelia/aurelia/commit/8bbf6f2))
* **router-lite:** location URL generation with redirectTo ([39ec38f](https://github.com/aurelia/aurelia/commit/39ec38f))
* **router-lite:** history state navigation ([40d7440](https://github.com/aurelia/aurelia/commit/40d7440))
* **router-lite:** lifecycle hooks were invoked twice (#1664) ([5aeaa54](https://github.com/aurelia/aurelia/commit/5aeaa54))
* **ast:** correctly resolves access keyed on primitve (#1662) ([0eae2ce](https://github.com/aurelia/aurelia/commit/0eae2ce))
* **router-lite:** routeTree adjustment - canUnload ([3c9ee4b](https://github.com/aurelia/aurelia/commit/3c9ee4b))
* **router-lite:** redirectTo parameter remapping ([9687178](https://github.com/aurelia/aurelia/commit/9687178))
* **router-lite:** parameterized redirectTo ([591f89c](https://github.com/aurelia/aurelia/commit/591f89c))
* **router-lite:** redirectTo URL adjustment ([37f1dfc](https://github.com/aurelia/aurelia/commit/37f1dfc))
* **hmr:** no invalidate on parcel (#1647) ([843ca70](https://github.com/aurelia/aurelia/commit/843ca70))
* **router-lite:** fragment to URL (#1645) ([4f29e66](https://github.com/aurelia/aurelia/commit/4f29e66))
* **router-lite:** queryParams and fragment propagation from nav option (#1643) ([8ad1c52](https://github.com/aurelia/aurelia/commit/8ad1c52))
* **router-lite:** various overloads for the load method (#1642) ([fad763e](https://github.com/aurelia/aurelia/commit/fad763e))
* **router-lite:** `null` binding for default attribute of viewport ([e1a49f1](https://github.com/aurelia/aurelia/commit/e1a49f1))
* **router-lite:** handling hash in load, href CAs ([8489a10](https://github.com/aurelia/aurelia/commit/8489a10))


### Refactorings:

* **router-lite:** redirectTo in nav model ([cc0f71b](https://github.com/aurelia/aurelia/commit/cc0f71b))
* **router-lite:** instance registration of RouterOptions in DI ([5993a8b](https://github.com/aurelia/aurelia/commit/5993a8b))
* **router-lite:** transition plan ([186da90](https://github.com/aurelia/aurelia/commit/186da90))
* **router-lite:** removed SameUrlStrategy ([54efabf](https://github.com/aurelia/aurelia/commit/54efabf))


### Deprecated:

The `@aurelia/store-v1` package is deprecated in favor of [`@aurelia/state`](https://www.npmjs.com/package/@aurelia/state).
There will be no further development for this package and this is planned to be removed in the `v2.0.0-beta.3` release.
Note that this does not affect the Aurelia v1 in any way (the Aurelia v1 plugin can be found at https://github.com/aurelia/store).



<a name="2.0.0-beta.1"></a>
# 2.0.0-beta.1 (2023-01-12)

### BREAKING CHANGES

* dropped routers as deps from aurelia ([03987fe](https://github.com/aurelia/aurelia/commit/03987fe)). Both the `@aurelia/router` and the `@aurelia/router-lite` have been dropped as the dependencies for the the `aurelia` package. You need to import the router that you want to use directly from the desired package. Hence, instead of do the the following,

    ```typescript
    import { RouterConfiguration } from 'aurelia'
    ```

    you need to do the following.

    ```typescript
    import { RouterConfiguration } from '@aurelia/router';

    // or

    import { RouterConfiguration } from '@aurelia/router-lite';
    ```


### Features:

* **router:** improve href creation ([d963c72](https://github.com/aurelia/aurelia/commit/d963c72))
* **portal:** ability to specify position ([6e78e4c](https://github.com/aurelia/aurelia/commit/6e78e4c))
* **runtime:** key assignment notify changes (#1601) ([4163dd4](https://github.com/aurelia/aurelia/commit/4163dd4))
* **repeat:** add keyed mode (#1583) ([d0c5706](https://github.com/aurelia/aurelia/commit/d0c5706))
* **compat:** add binding property to compat package ([b58be1e](https://github.com/aurelia/aurelia/commit/b58be1e))
* **compat:** add ast methods to compat package ([8b99581](https://github.com/aurelia/aurelia/commit/8b99581))
* **compat:** add a compat-v1 package for migration ([6cec5a2](https://github.com/aurelia/aurelia/commit/6cec5a2))


### Bug Fixes:

* **router-lite:** support ../ prefix for load CA (#1635) ([bcf8afd](https://github.com/aurelia/aurelia/commit/bcf8afd))
* **router-lite/href:** parent context selection (#1634) ([03b86bf](https://github.com/aurelia/aurelia/commit/03b86bf))
* **router:** check to make sure hooks are valid ([0daa097](https://github.com/aurelia/aurelia/commit/0daa097))
* **router-lite:** viewport-request and viewport-agent vieport name matching (#1629) ([2dd75d9](https://github.com/aurelia/aurelia/commit/2dd75d9))
* **router-lite:** viewport adjustment (#1628) ([25eab0a](https://github.com/aurelia/aurelia/commit/25eab0a))
* **router-lite/viewport:** null default binding (#1627) ([dfe569f](https://github.com/aurelia/aurelia/commit/dfe569f))
* **router-lite:** fallback with ce-name (#1621) ([baed798](https://github.com/aurelia/aurelia/commit/baed798))
* **router-lite:** fallback with ce-name ([baed798](https://github.com/aurelia/aurelia/commit/baed798))
* **route-recognizer:** residue handling (#1620) ([bd8bd05](https://github.com/aurelia/aurelia/commit/bd8bd05))
* **route-recognizer:** residue handling ([bd8bd05](https://github.com/aurelia/aurelia/commit/bd8bd05))
* **runtime-html:** remove direct dependency on Reflect polyfill (#1610) ([5b37ff5](https://github.com/aurelia/aurelia/commit/5b37ff5))
* **router-lite:** history state change timing (#1606) ([2cf5b64](https://github.com/aurelia/aurelia/commit/2cf5b64))
* **toc:** missing app tasks docs from toc ([4ccc3e7](https://github.com/aurelia/aurelia/commit/4ccc3e7))
* **router-lite:** handling hash in load, href CAs (#1578) ([5a951a0](https://github.com/aurelia/aurelia/commit/5a951a0))
* **router-lite:** handling hash in load, href CAs ([5a951a0](https://github.com/aurelia/aurelia/commit/5a951a0))
* **router-lite:** deepscan issue ([5a951a0](https://github.com/aurelia/aurelia/commit/5a951a0))
* **array-length-observer:** notify array subscribers ([9ea3d85](https://github.com/aurelia/aurelia/commit/9ea3d85))


### Performance Improvements:

* **runtime:** move render location creation to compiler (#1605) ([66846b1](https://github.com/aurelia/aurelia/commit/66846b1))


### Refactorings:

* **route-recognizer:** residue handling ([bd8bd05](https://github.com/aurelia/aurelia/commit/bd8bd05))
* **router:** improve href creation (#1609) ([d963c72](https://github.com/aurelia/aurelia/commit/d963c72))
* **router-lite:** same URL handling (#1603) ([590c8b6](https://github.com/aurelia/aurelia/commit/590c8b6))
* **router-lite:** removed SameUrlStrategy ([590c8b6](https://github.com/aurelia/aurelia/commit/590c8b6))
* **router-lite:** transition plan ([590c8b6](https://github.com/aurelia/aurelia/commit/590c8b6))
* **router-lite:** transition plan inheritance ([590c8b6](https://github.com/aurelia/aurelia/commit/590c8b6))
* **web-components:** move webcomponents plugin into separate package ([065a949](https://github.com/aurelia/aurelia/commit/065a949))
* **runtime:** add platform & obs locator to renderers ([6763eed](https://github.com/aurelia/aurelia/commit/6763eed))
* **runtime:** add expr parser to renderers via param ([06449b0](https://github.com/aurelia/aurelia/commit/06449b0))
* **route-recognizer:** remove create element API ([de5faf4](https://github.com/aurelia/aurelia/commit/de5faf4))
* **dialog:** remove dialog export from aurelia pkg ([73e3078](https://github.com/aurelia/aurelia/commit/73e3078))
* **dialog:** move to a separate plugin package ([1fb795e](https://github.com/aurelia/aurelia/commit/1fb795e))
* **runtime:** remove au render + infra ([0a18ed1](https://github.com/aurelia/aurelia/commit/0a18ed1))
* **runtime:** rename scope file ([6adce39](https://github.com/aurelia/aurelia/commit/6adce39))
* **route-recognizer:** prefix private props on bindings ([d9cfc83](https://github.com/aurelia/aurelia/commit/d9cfc83))
* **compat:** remove call command, move to compat package ([d302d72](https://github.com/aurelia/aurelia/commit/d302d72))
* **compat:** remove event delegator, move completely to compat ([cca1ce8](https://github.com/aurelia/aurelia/commit/cca1ce8))
* **event:** remove .delegate, add .delegate to compat package ([d1539a2](https://github.com/aurelia/aurelia/commit/d1539a2))
* **router-lite:** remove delegation in load/href attrs ([649b078](https://github.com/aurelia/aurelia/commit/649b078))
* **runtime:** cleanup & size opt, rename binding methods (#1582) ([2000e3b](https://github.com/aurelia/aurelia/commit/2000e3b))
* **runtime:** remove interceptor prop from interface ([3074f54](https://github.com/aurelia/aurelia/commit/3074f54))
* **binding-behavior:** remove binding interceptor ([767eee7](https://github.com/aurelia/aurelia/commit/767eee7))
* **state:** cleanup bindings ([76cbb04](https://github.com/aurelia/aurelia/commit/76cbb04))
* **bindings:** create override fn instead of binding interceptor ([5c2ed80](https://github.com/aurelia/aurelia/commit/5c2ed80))
* **all:** error msg code & better bundle size ([d81ec6d](https://github.com/aurelia/aurelia/commit/d81ec6d))
* **ast:** extract evaluate into a seprate fn ([6691f7f](https://github.com/aurelia/aurelia/commit/6691f7f))
* **runtime:** rename Scope.parentScope -> parent ([937d29e](https://github.com/aurelia/aurelia/commit/937d29e))
* **ast:** extract visit APIs into a fn ([a9d2abb](https://github.com/aurelia/aurelia/commit/a9d2abb))
* **templating:** cleanup commands, renderers & compiler ([099e988](https://github.com/aurelia/aurelia/commit/099e988))

<a name="2.0.0-alpha.41"></a>
# 2.0.0-alpha.41 (2022-09-22)

### BREAKING CHANGES:

* **binding-command:** make expr parser & attr mapper parameters of command build ([0ff9756](https://github.com/aurelia/aurelia/commit/0ff9756))
* **runtime:** simplify expressionkind enum ([0f480e1](https://github.com/aurelia/aurelia/commit/0f480e1))
* **runtime:** make Char local to expr parser only ([3272fb7](https://github.com/aurelia/aurelia/commit/3272fb7))
* **runtime:** move LifecycleFlags to runtime-html ([ef35bc7](https://github.com/aurelia/aurelia/commit/ef35bc7))
* **runtime:** move delegation strategy to runtime-html ([f387b2a](https://github.com/aurelia/aurelia/commit/f387b2a))
* **events:** always handle event handler as fn (#1563) ([6037495](https://github.com/aurelia/aurelia/commit/6037495))
* **bindings:** remove flags from bindings bind/unbind (#1560) ([eaaf4bb](https://github.com/aurelia/aurelia/commit/eaaf4bb))
* **observers:** remove flags from observers (#1557) ([9f9a8fe](https://github.com/aurelia/aurelia/commit/9f9a8fe))
* **runtime:** move BindingMode to runtime-html (#1555) ([c75618b](https://github.com/aurelia/aurelia/commit/c75618b))
* **router:** rename load, unload to loading, unloading (#1546) ([9cd3f02](https://github.com/aurelia/aurelia/commit/9cd3f02))
* **ast:** remove flags from evaluate (#1553) ([dda997b](https://github.com/aurelia/aurelia/commit/dda997b))


### Features:

* **collection-observation:** add ability to batch mutation into a single indexmap ([39b3f82](https://github.com/aurelia/aurelia/commit/39b3f82))
* **router:** multiple bindable props for load attribute (#1554) ([02ca208](https://github.com/aurelia/aurelia/commit/02ca208))
* **router:** support configured route in canLoad redirect string (#1545) ([a4c7a37](https://github.com/aurelia/aurelia/commit/a4c7a37))


### Bug Fixes:

* **events:** call listener with correct scope ([70d1329](https://github.com/aurelia/aurelia/commit/70d1329))
* **router-lite:** recovery from unconfigured route (#1569) ([e095490](https://github.com/aurelia/aurelia/commit/e095490))
* **router:** fix path issue when redirecting (#1564) ([e8b5d3f](https://github.com/aurelia/aurelia/commit/e8b5d3f))
* **runtime-html:** add more attrs to remove on null/undefined (#1561) ([2de6f17](https://github.com/aurelia/aurelia/commit/2de6f17))
* **expression-parser:** throw on invalid template continuations in interpolation ([9abab48](https://github.com/aurelia/aurelia/commit/9abab48))
* **router:** fix default refresh issue (#1547) ([8ddadc6](https://github.com/aurelia/aurelia/commit/8ddadc6))
* **ast:** dont observe on sort ([beeba4e](https://github.com/aurelia/aurelia/commit/beeba4e))


### Refactorings:

* **runtime:** use utils for smaller bundle ([d35e24a](https://github.com/aurelia/aurelia/commit/d35e24a))
* **runtime:** remove work tracker ([96f90c6](https://github.com/aurelia/aurelia/commit/96f90c6))
* **kernel:** cleanup unnecessary exports in kernel ([045d80d](https://github.com/aurelia/aurelia/commit/045d80d))
* **ast:** observe after eval fn call ([aca7b0f](https://github.com/aurelia/aurelia/commit/aca7b0f))
* **observation:** also pass collection in change handler ([c382e8a](https://github.com/aurelia/aurelia/commit/c382e8a))
* **runtime:** cleanup context & scope ([e806937](https://github.com/aurelia/aurelia/commit/e806937))
* **interfaces:** remove/reorg interfaces ([925f50d](https://github.com/aurelia/aurelia/commit/925f50d))
* **runtime:** move subscriber flags to sub record file ([066457a](https://github.com/aurelia/aurelia/commit/066457a))
* **ast:** cleanup iterable AST, reorganise e2e tests (#1562) ([3853f2d](https://github.com/aurelia/aurelia/commit/3853f2d))
* **hmr:** retain bindable state closes #1550 ([e71026a](https://github.com/aurelia/aurelia/commit/e71026a))
* **ast:** move VC signal to bind (#1558) ([3fffacf](https://github.com/aurelia/aurelia/commit/3fffacf))
* **router:** add route compare to active check (#1556) ([f325c1a](https://github.com/aurelia/aurelia/commit/f325c1a))


<a name="2.0.0-alpha.40"></a>
# 2.0.0-alpha.40 (2022-09-07)

### BREAKING CHANGES:

* **binding:** template expression auto observe array methods ([001fe4c](https://github.com/aurelia/aurelia/commit/001fe4c))
* **app-task:** consistent hook name style ing/ed (#1540) ([5a11ea0](https://github.com/aurelia/aurelia/commit/5a11ea0))

### Features:

* **template:** support arrow function syntax (#1541) ([499ace7](https://github.com/aurelia/aurelia/commit/499ace7))


### Bug Fixes:

* **binding:** fix regression from nullish coalescing (#1537) ([a96511a](https://github.com/aurelia/aurelia/commit/a96511a))
* **router-lite:** specific module import (#1536) ([31f4af9](https://github.com/aurelia/aurelia/commit/31f4af9))
* **router-lite:** nav-model promise handling (#1535) ([d9d5dae](https://github.com/aurelia/aurelia/commit/d9d5dae))
* **router:** fix route import component issue (#1534) ([15b84f1](https://github.com/aurelia/aurelia/commit/15b84f1))


### Performance Improvements:

* **binding:** inline keyword lookup for bundle size ([1384dc2](https://github.com/aurelia/aurelia/commit/1384dc2))
* **binding:** make parser state module-scoped ([1384dc2](https://github.com/aurelia/aurelia/commit/1384dc2))


### Refactorings:

* **ast:** remove observe leaf only flag ([8b1c7e1](https://github.com/aurelia/aurelia/commit/8b1c7e1))
* **expression-parser:** cleanup / reduce bundle size (#1539) ([1384dc2](https://github.com/aurelia/aurelia/commit/1384dc2))
* **binding:** fix expression parser keyword lookup issue ([1384dc2](https://github.com/aurelia/aurelia/commit/1384dc2))
* **kernel:** avoid analyzing non-object module (#1538) ([cdfcd39](https://github.com/aurelia/aurelia/commit/cdfcd39))

<a name="2.0.0-alpha.39"></a>
# 2.0.0-alpha.39 (2022-09-01)

### Features:

* **binding:** optional chaining & nullish coalescing (#1523) ([e33d563](https://github.com/aurelia/aurelia/commit/e33d563))
* **router:** configurable viewport fallback behavior (#1507) ([1e50194](https://github.com/aurelia/aurelia/commit/1e50194))

BREAKING CHANGES: the router now does not process child instructions after loading a fallback component.


### Bug Fixes:

* **validation:** transient injection symbol for presenter service ([8652550](https://github.com/aurelia/aurelia/commit/8652550))
* **containerless:** ensure host of dynamically created containerless comp is removed (#1518) ([358b2ed](https://github.com/aurelia/aurelia/commit/358b2ed))
* **router-lite:** temporarily expose internal typings (#1517) ([8782392](https://github.com/aurelia/aurelia/commit/8782392))
* **router-lite:** navigation to routes configured in ancestor nodes (#1514) ([3882700](https://github.com/aurelia/aurelia/commit/3882700))
* **hmr:** fix a bug in strict TS (#1515) ([f571004](https://github.com/aurelia/aurelia/commit/f571004))
* **repeat:** unsubscribe collection on detaching ([89248cc](https://github.com/aurelia/aurelia/commit/89248cc))
* **typings:** make ListenerOptions public ([855a03f](https://github.com/aurelia/aurelia/commit/855a03f))
* **router:** fix default on refresh issue (#1501) ([6ad851f](https://github.com/aurelia/aurelia/commit/6ad851f))
* **i18n:** t param binding handleChange should not call after unbound ([f42e536](https://github.com/aurelia/aurelia/commit/f42e536))


### Refactorings:

* **router:** change fallback action default to abort (#1524) ([13617e2](https://github.com/aurelia/aurelia/commit/13617e2))
* **router-lite:** lifecycle hook invocation (#1522) ([d6216d8](https://github.com/aurelia/aurelia/commit/d6216d8))
* **router-lite:** explicit ctx in load ([3882700](https://github.com/aurelia/aurelia/commit/3882700))
* **router-lite:** null context for root ([3882700](https://github.com/aurelia/aurelia/commit/3882700))
* **ci:** tweak router e2e test script (#1516) ([dcb9541](https://github.com/aurelia/aurelia/commit/dcb9541))
* **build:** remove reference directive, use files in tsconfig instead ([855a03f](https://github.com/aurelia/aurelia/commit/855a03f))

<a name="2.0.0-alpha.38"></a>
# 2.0.0-alpha.38 (2022-08-17)

### Features:

* **router-lite:** most-matching path generation ([affa866](https://github.com/aurelia/aurelia/commit/affa866))
* **router-lite:** support for CE,DEDef,VM,RtCfg in load ([affa866](https://github.com/aurelia/aurelia/commit/affa866))
* **router-lite:** support for complex type in configured route data ([affa866](https://github.com/aurelia/aurelia/commit/affa866))


### Bug Fixes:

* **router:** update component creation (#1499) ([efda82e](https://github.com/aurelia/aurelia/commit/efda82e))
* **router-lite:** eager route recognition ([affa866](https://github.com/aurelia/aurelia/commit/affa866))
* **router-lite:** replace query for non-root ctx ([affa866](https://github.com/aurelia/aurelia/commit/affa866))
* **router-lite:** eager resolution for children ([affa866](https://github.com/aurelia/aurelia/commit/affa866))
* **plugin-conventions:** fix wrong options reference (#1493) ([abd3a3f](https://github.com/aurelia/aurelia/commit/abd3a3f))


### Refactorings:

* **router-lite:** better path generation and parameter handling (#1495) ([affa866](https://github.com/aurelia/aurelia/commit/affa866))
* **router-lite:** viewportinstruction cleanup ([affa866](https://github.com/aurelia/aurelia/commit/affa866))

BREAKING CHANGES: the router-lite now mathces path with the highest number of matching parameters first

<a name="2.0.0-alpha.37"></a>
# 2.0.0-alpha.37 (2022-08-03)

### Features:

* **capture:** ability to define attr filtering filter ([e9a22be](https://github.com/aurelia/aurelia/commit/e9a22be))


### Bug Fixes:

* **capture:** dont capture slot attr ([5ef1a18](https://github.com/aurelia/aurelia/commit/5ef1a18))
* **hmr:** add some more ignores for strict mode TS (#1483) ([6f7ca00](https://github.com/aurelia/aurelia/commit/6f7ca00))
* **router-lite:** #1370 (#1482) ([8a39b13](https://github.com/aurelia/aurelia/commit/8a39b13))

<a name="2.0.0-alpha.36"></a>
# 2.0.0-alpha.36 (2022-07-25)

### Features:

* **custom-element:** capture convention & decorator shortcut (#1469) ([e89d3ad](https://github.com/aurelia/aurelia/commit/e89d3ad))
* **router-lite:** custom root provider (#1463) ([d189d3b](https://github.com/aurelia/aurelia/commit/d189d3b))


### Bug Fixes:

* **runtime-html:** containerless #1474 (#1475) ([35e571f](https://github.com/aurelia/aurelia/commit/35e571f))
* **validation-html:** validate BB trigger (#1472) ([10ee21c](https://github.com/aurelia/aurelia/commit/10ee21c))
* **node-obs:** dont treat role differently (#1473) ([0cde114](https://github.com/aurelia/aurelia/commit/0cde114))
* **router-lite:** better handling of parameters and querystring (#1467) ([cd93312](https://github.com/aurelia/aurelia/commit/cd93312))
* **plugin-conventions:** skip ShadowDOM tag name check, leave it to runtime (#1464) ([20fccbf](https://github.com/aurelia/aurelia/commit/20fccbf))


### Refactorings:

* **router-lite:** params in Router#load ([cd93312](https://github.com/aurelia/aurelia/commit/cd93312))
* **router-lite:** base path resolution ([d189d3b](https://github.com/aurelia/aurelia/commit/d189d3b))

<a name="2.0.0-alpha.35"></a>
# 2.0.0-alpha.35 (2022-06-08)

### Features:

* **lifecycle-hooks:** bound ([668a0a8](https://github.com/aurelia/aurelia/commit/668a0a8))
* **lifecycle-hooks:** unbinding ([2d94910](https://github.com/aurelia/aurelia/commit/2d94910))
* **lifecycle-hooks:** binding ([ddb98ce](https://github.com/aurelia/aurelia/commit/ddb98ce))
* **lifecycle-hooks:** attached (#1456) ([4a9b3bb](https://github.com/aurelia/aurelia/commit/4a9b3bb))
* **lifecycle-hooks:** detaching (#1455) ([e4fc0de](https://github.com/aurelia/aurelia/commit/e4fc0de))
* **lifecycle-hooks:** add attaching (#1454) ([0aa386d](https://github.com/aurelia/aurelia/commit/0aa386d))
* **router-lite:** navigation model (#1446) ([d6a1590](https://github.com/aurelia/aurelia/commit/d6a1590))
* **ts-jest,babel-jest:** upgrade to jest v28 (#1449) ([b1ec85c](https://github.com/aurelia/aurelia/commit/b1ec85c))
* **state:** fromState deco works on attribute (#1447) ([548b4fd](https://github.com/aurelia/aurelia/commit/548b4fd))
* **lifecycle-hooks:** invoke on custom attributes ([5a15abd](https://github.com/aurelia/aurelia/commit/5a15abd))
* **router-lite:** isNavigating flag (#1457) ([b7077b7](https://github.com/aurelia/aurelia/commit/b7077b7))


### Refactorings:

* **attr:** expose attr own container ([286977a](https://github.com/aurelia/aurelia/commit/286977a))

<a name="2.0.0-alpha.34"></a>
# 2.0.0-alpha.34 (2022-06-03)

### Features:

* **router:** add default route to child viewports (#1444) ([b574851](https://github.com/aurelia/aurelia/commit/b574851))
* **router-lite:** getRouteConfig hook (#1439) ([3481d7e](https://github.com/aurelia/aurelia/commit/3481d7e))


### Bug Fixes:

* **hmr:** prevent compilation hot.invalidate issue (#1441) ([4e5ca74](https://github.com/aurelia/aurelia/commit/4e5ca74)) thanks [aegenet](https://github.com/aegenet)


### BREAKING CHANGES:

* **template-compiler:** remove no-action mode for custom element content (#1438) ([f9c8170](https://github.com/aurelia/aurelia/commit/f9c8170))

  Prior to this change, the default template compiler has a compilation mode where content of a custom element is left intact, and compiled as is. This can be understood as no slot mode, where it the behavior is neither shadow DOM or au-slot. Now it's always assumed that au-slot is the behavior, unless `shadowOptions` is present in the element definition.

* **router-lite**: default transition strategy is now `replace`, changed from `invoke-lifecycle`.

  This change is to make it clearer what happens when there's a routing action.


<a name="2.0.0-alpha.33"></a>
# 2.0.0-alpha.33 (2022-05-26)

### Features:

* **state:** add [state plugin (successor of v1 store)](https://docs.aurelia.io/developer-guides/state)
* **lifecycle-hooks:** call hydrated ([75650c5](https://github.com/aurelia/aurelia/commit/75650c5))
* **lifecycle-hooks:** call hydrating ([737d9ed](https://github.com/aurelia/aurelia/commit/737d9ed))


### Bug Fixes:

* **hmr:** call invoke on controller container ([fa92c3d](https://github.com/aurelia/aurelia/commit/fa92c3d))
* **repeat:** don't mutate incoming indexmap (#1429) ([a77a104](https://github.com/aurelia/aurelia/commit/a77a104))


<a name="2.0.0-alpha.32"></a>
# 2.0.0-alpha.32 (2022-05-22)

### Features:

* **lifecycle-hooks:** support `created` (#1428) ([3a0e93d](https://github.com/aurelia/aurelia/commit/3a0e93d))
* **router:** add previous to instruction ([b9a4e20](https://github.com/aurelia/aurelia/commit/b9a4e20))
* **state:** add state binding behavior ([b05a0fb](https://github.com/aurelia/aurelia/commit/b05a0fb))
* **state:** observe view model properties in state bindings ([b05a0fb](https://github.com/aurelia/aurelia/commit/b05a0fb))


### Bug Fixes:

* **router:** right navigation to unload lifecycleHooks ([b9a4e20](https://github.com/aurelia/aurelia/commit/b9a4e20))
* **plugin-conventions:** upgrade source-map dep to fix nodejs v18 compat (#1424) ([572d101](https://github.com/aurelia/aurelia/commit/572d101))
* **kernel:** alter copypasted comments (#1423) ([44df8c6](https://github.com/aurelia/aurelia/commit/44df8c6))


### Refactorings:

* **example:** tweak config for router animation test ([b9a4e20](https://github.com/aurelia/aurelia/commit/b9a4e20))

<a name="2.0.0-alpha.31"></a>
# 2.0.0-alpha.31 (2022-05-15)

### Features:

* **testing:** add html assertion helpers for IFixture ([fbb85d0](https://github.com/aurelia/aurelia/commit/fbb85d0))
* **testing:** enable builder pattern for fixture creation (#1414) ([af64b4c](https://github.com/aurelia/aurelia/commit/af64b4c))
* **runtime-html:** ability to override `containerless` config from view (#1417) ([26968cc](https://github.com/aurelia/aurelia/commit/26968cc))
* **plugin:** prepare store (v2) plugin (#1412) ([6989de0](https://github.com/aurelia/aurelia/commit/6989de0))
* **plugin:** prepare an addons package (#1415) ([d32b847](https://github.com/aurelia/aurelia/commit/d32b847))
* **plugin:** prepare ui-virtualization plugin ([3e61198](https://github.com/aurelia/aurelia/commit/3e61198))


### Bug Fixes:

* **hmr:** invoke created with correct this ([d78d301](https://github.com/aurelia/aurelia/commit/d78d301))
* **hmr:** works with components that has created lifecycle ([3e61198](https://github.com/aurelia/aurelia/commit/3e61198))
* **hmr:** create view model with injection ([bda3e1f](https://github.com/aurelia/aurelia/commit/bda3e1f))
* **hmr:** HMR works with both TS and JS ([3c3fe36](https://github.com/aurelia/aurelia/commit/3c3fe36))


### Refactorings:

* **runtime:** cleanup unused flags ([c4ce901](https://github.com/aurelia/aurelia/commit/c4ce901))
* **all:** add code to DEV err msg, unify error message quote ([b4909fb](https://github.com/aurelia/aurelia/commit/b4909fb))
  Both prod and dev error messages should have the same start pattern now: `AURxxxx:`.

<a name="2.0.0-alpha.30"></a>
# 2.0.0-alpha.30 (2022-05-07)

### Features:

* **events:** expr as listener handler (#1411) ([ff6ebb8](https://github.com/aurelia/aurelia/commit/ff6ebb8))
* **testing:** automatically hook fixture create promise / tear down ([ff6ebb8](https://github.com/aurelia/aurelia/commit/ff6ebb8))
* **testing:** enhance createFixture helper props ([ff6ebb8](https://github.com/aurelia/aurelia/commit/ff6ebb8))
* **tooling/hmr:** add in hmr capabilities (#1400) ([6d932a7](https://github.com/aurelia/aurelia/commit/6d932a7))


### Bug Fixes:

* **router-lite:** downstream propagation of fallback (#1406) ([53ce891](https://github.com/aurelia/aurelia/commit/53ce891))
* **router-lite:** reinstated the router state post navigation fail ([53ce891](https://github.com/aurelia/aurelia/commit/53ce891))
* **router-lite:** unrecognized route error even if empty route is configured ([53ce891](https://github.com/aurelia/aurelia/commit/53ce891))


### Refactorings:

* **all:** remove re-barrelled imports/exports ([973ae46](https://github.com/aurelia/aurelia/commit/973ae46))


In this version, the extensions of all package dist are changed to `.cjs` and `.mjs` for `commonjs` and `esm` module formats respectively.
This may cause a breakage for applications that were created with the old skeleton, as their webpack config may have the wrong module alias resolution, that looks like this:

```ts
alias: production ? {
  // add your production aliasing here
} : {
  ...[
    'fetch-client',
    ...
  ].reduce((map, pkg) => {
    const name = `@aurelia/${pkg}`;
    map[name] = path.resolve(__dirname, 'node_modules', name, 'dist/esm/index.dev.js');
    return map;
  }, {
    'aurelia': path.resolve(__dirname, 'node_modules/aurelia/dist/esm/index.dev.js'),
    // add your development aliasing here
  })
}
```
The error will look like this:
```
Module not found: Error: Can't resolve 'aurelia' in  ...
```

Changing the above webpack configuration to the following
```ts
alias: production ? {
  // add your production aliasing here
} : {
  ...[
    'fetch-client',
    ...
  ].reduce((map, pkg) => {
    const name = `@aurelia/${pkg}`;
    map[name] = path.resolve(__dirname, 'node_modules', name, 'dist/esm/index.dev.mjs');
    return map;
  }, {
    'aurelia': path.resolve(__dirname, 'node_modules/aurelia/dist/esm/index.dev.mjs'),
    // add your development aliasing here
  })
}
```
will fix the issue.

<a name="2.0.0-alpha.29"></a>
# 2.0.0-alpha.29 (2022-04-27)

### Features:

* **router:** support this/instance in @lifecycleHooks (#1390) ([5f5df47](https://github.com/aurelia/aurelia/commit/5f5df47))
* **router-lite:** global fallback support ([ac9dd1d](https://github.com/aurelia/aurelia/commit/ac9dd1d))


### Bug Fixes:

* **router-lite:** eslint issues ([77c4191](https://github.com/aurelia/aurelia/commit/77c4191))
* **router-lite:** hook tests ([73aa3cf](https://github.com/aurelia/aurelia/commit/73aa3cf))
* **router-lite:** parent-child hooks tests ([2cfb8f4](https://github.com/aurelia/aurelia/commit/2cfb8f4))
* **router-lite:** smoke tests ([8e30e43](https://github.com/aurelia/aurelia/commit/8e30e43))
* **router:** sibling-viewport resolution ([6ed9996](https://github.com/aurelia/aurelia/commit/6ed9996))


### Refactorings:

* **router-lite:** removal of direct routing wip ([80de920](https://github.com/aurelia/aurelia/commit/80de920))

<a name="2.0.0-alpha.28"></a>
# 2.0.0-alpha.28 (2022-04-16)

### Features:

* **router:** Bring back original router (#1382)


### Bug Fixes:

* **css-module:** allow colon in class names (#1388) ([47860ab](https://github.com/aurelia/aurelia/commit/47860ab))

<a name="2.0.0-alpha.27"></a>
# 2.0.0-alpha.27 (2022-04-08)

### Features:

* **convention:** support foo-bar/index.js Nodejs convention (#1383) ([54a8a29](https://github.com/aurelia/aurelia/commit/54a8a29))
* **tooling:** support parcel2 (#1376) ([ba95a5d](https://github.com/aurelia/aurelia/commit/ba95a5d))


### Bug Fixes:

* **build:** ensure correct __DEV__ build value replacement (#1377) ([40ce0e3](https://github.com/aurelia/aurelia/commit/40ce0e3))
* **local-template:** local element see the dependencies of owning element (#1375) ([0d48dbf](https://github.com/aurelia/aurelia/commit/0d48dbf))
* **switch+promise:** deferred view instantiation (#1372) ([63cf5d0](https://github.com/aurelia/aurelia/commit/63cf5d0))


### Refactorings:

* **all:** upgrade TS dev dependencies, removing unnecessary assertions & lintings (#1371) ([05cec15](https://github.com/aurelia/aurelia/commit/05cec15))

<a name="2.0.0-alpha.26"></a>
# 2.0.0-alpha.26 (2022-03-13)

### Bug Fixes:

* **template-compiler:** custom attribute works with attr-pattern in all cases ([6a190b8](https://github.com/aurelia/aurelia/commit/6a190b8))

<a name="2.0.0-alpha.25"></a>
# 2.0.0-alpha.25 (2022-03-08)

### Features:

* **router:** custom title builder ([765df97](https://github.com/aurelia/aurelia/commit/765df97))


### Bug Fixes:

* **deps:** update dependency marked to v4 [security] (#1323) ([da0436c](https://github.com/aurelia/aurelia/commit/da0436c))
* **router:** ensured base title ([2d01292](https://github.com/aurelia/aurelia/commit/2d01292))


### BREAKING CHANGES:

* **router:** renamed `@aurelia/router` to `@aurelia/router-lite` ([a28be0c](https://github.com/aurelia/aurelia/commit/a28be0c))

<a name="2.0.0-alpha.24"></a>
# 2.0.0-alpha.24 (2022-01-18)

### Bug Fixes:

* **computed-obs:** fix typo, ensure multiple layers of getter work ([09971a2](https://github.com/aurelia/aurelia/commit/09971a2))
* **promise:** suppressed TaskAbortError on cancellation ([b917470](https://github.com/aurelia/aurelia/commit/b917470))


### Refactorings:

* **promise:** pre-settled task result rejection ([0e5d75d](https://github.com/aurelia/aurelia/commit/0e5d75d))

<a name="2.0.0-alpha.23"></a>
# 2.0.0-alpha.23 (2021-11-22)

### Features:

* **bindable:** auto discover coercer https://github.com/aurelia/aurelia/pull/1313

<a name="2.0.0-alpha.22"></a>
# 2.0.0-alpha.22 (2021-10-24)

### Features:

* ***:** destructure map pair ([961f1a6](https://github.com/aurelia/aurelia/commit/961f1a6))
* ***:** parse destructuring assignment ([c0555de](https://github.com/aurelia/aurelia/commit/c0555de))
* ***:** destructuring assignment expr ([d06f7bd](https://github.com/aurelia/aurelia/commit/d06f7bd))
* ***:** rest expr in destructuring assignment ([f4b1652](https://github.com/aurelia/aurelia/commit/f4b1652))
* **runtime:** added destructuring AST ([0b4d579](https://github.com/aurelia/aurelia/commit/0b4d579))


### Bug Fixes:

* ***:** build issues ([1a32a43](https://github.com/aurelia/aurelia/commit/1a32a43))
* ***:** deepscan issue ([582686b](https://github.com/aurelia/aurelia/commit/582686b))
* ***:** linting error ([35e11c8](https://github.com/aurelia/aurelia/commit/35e11c8))
* ***:** broken test ([257326c](https://github.com/aurelia/aurelia/commit/257326c))
* ***:** broken build ([3ececf2](https://github.com/aurelia/aurelia/commit/3ececf2))
* **runtime:** correction in expression kinf flag ([f05684f](https://github.com/aurelia/aurelia/commit/f05684f))


### Refactorings:

* **router:** querystring propagation ([3defa87](https://github.com/aurelia/aurelia/commit/3defa87))
* **repeat:** destructuring support ([a6257f0](https://github.com/aurelia/aurelia/commit/a6257f0))

<a name="2.0.0-alpha.21"></a>
# 2.0.0-alpha.21 (2021-09-12)

### Refactorings:

* **kernel:** use isType utilities for fn & string ([009562b](https://github.com/aurelia/aurelia/commit/009562b))
* **runtime:** use isType utilities for fn & string ([37a8fd9](https://github.com/aurelia/aurelia/commit/37a8fd9))
* **runtime:** use isType utility for string ([64b41b5](https://github.com/aurelia/aurelia/commit/64b41b5))
* **runtime:** use isType utility for function ([f621365](https://github.com/aurelia/aurelia/commit/f621365))

<a name="2.0.0-alpha.20"></a>
# 2.0.0-alpha.20 (2021-09-04)

### Features:

* **au-slot:** work with containerless ([9fa0a06](https://github.com/aurelia/aurelia/commit/9fa0a06))
* **router:** add support for component factory ([8541b48](https://github.com/aurelia/aurelia/commit/8541b48))


### Refactorings:

* **router:** add tests for component factory ([f749658](https://github.com/aurelia/aurelia/commit/f749658))
* **au-compose:** move initiator out of change info, add tests for #1299 ([8f2bf0c](https://github.com/aurelia/aurelia/commit/8f2bf0c))

<a name="2.0.0-alpha.19"></a>
# 2.0.0-alpha.19 (2021-08-29)

### Bug Fixes:

* **store-v1:** revert back to strings for setup/teardown types ([02ebd33](https://github.com/aurelia/aurelia/commit/02ebd33))
* **store-v1:** adjust decorator tests ([b998863](https://github.com/aurelia/aurelia/commit/b998863))
* **store-v1:** unbinding instead of bound for teardown defaults ([c5c128f](https://github.com/aurelia/aurelia/commit/c5c128f))
* **template-compiler:** capture ignore attr command on bindable like props ([0a52fbf](https://github.com/aurelia/aurelia/commit/0a52fbf))
* **barrel:** export ITemplateCompiler from aurelia package ([0a52fbf](https://github.com/aurelia/aurelia/commit/0a52fbf))


### Refactorings:

* **all:** remove more internal typings ([1ffc38b](https://github.com/aurelia/aurelia/commit/1ffc38b))
* **store-v1:** arrange sut ([d440a26](https://github.com/aurelia/aurelia/commit/d440a26))

<a name="2.0.0-alpha.18"></a>
# 2.0.0-alpha.18 (2021-08-22)

### Features:

* **au-compose:** works with au-slot ([4bfcc00](https://github.com/aurelia/aurelia/commit/4bfcc00))
* **attr-transfer:** implement attr capturing & spreading with ...$attrs syntax ([998b91c](https://github.com/aurelia/aurelia/commit/998b91c))


### Bug Fixes:

* **repeat:** ensure binding behavior works with .for binding ([30a27a0](https://github.com/aurelia/aurelia/commit/30a27a0))

<a name="2.0.0-alpha.17"></a>
# 2.0.0-alpha.17 (2021-08-16)

### Bug Fixes:

* **repeat:** handle inner collection mutation. Closes #779 ([4c121b9](https://github.com/aurelia/aurelia/commit/4c121b9))


### Refactorings:

* **platform:** smaller props setup ([079e820](https://github.com/aurelia/aurelia/commit/079e820))
* **task-queue:** mark private with _, remove tracer on non-dev ([1dfaa13](https://github.com/aurelia/aurelia/commit/1dfaa13))
* **command:** extract CommandType out of ExpressionType ([e24fbed](https://github.com/aurelia/aurelia/commit/e24fbed))
* **all:** rename BindingType -> ExpressionType ([8cf4061](https://github.com/aurelia/aurelia/commit/8cf4061))
* **expr-parser:** simplify BindingType enum ([4c4cbc9](https://github.com/aurelia/aurelia/commit/4c4cbc9))
* **command:** simplify binding type enum ([6651678](https://github.com/aurelia/aurelia/commit/6651678))
* **di:** resolver disposal ([7c50556](https://github.com/aurelia/aurelia/commit/7c50556))
* **di:** deregisterResolver API ([46737b9](https://github.com/aurelia/aurelia/commit/46737b9))
* **validation:** controller-factories ([3ebc6d1](https://github.com/aurelia/aurelia/commit/3ebc6d1))

<a name="2.0.0-alpha.16"></a>
# 2.0.0-alpha.16 (2021-08-07)

### Features:

* **web-component:** add a web-component plugin ([74589bc](https://github.com/aurelia/aurelia/commit/74589bc))


### Bug Fixes:

* **href:** avoid interfering with native href ([de625d2](https://github.com/aurelia/aurelia/commit/de625d2))


### Performance Improvements:

* **bindings:** simpler observer tracking/clearing ([c867cd1](https://github.com/aurelia/aurelia/commit/c867cd1))


### Refactorings:

* **binding-command:** bindingType -> type ([e38e7f2](https://github.com/aurelia/aurelia/commit/e38e7f2))


### Others:

* **all:** use a terser name cache for predictable prop mangling ([7649ced](https://github.com/aurelia/aurelia/commit/7649ced))
* **setter-obs:** shorter prop names ([4154147](https://github.com/aurelia/aurelia/commit/4154147))

<a name="2.0.0-alpha.15"></a>
# 2.0.0-alpha.15 (2021-08-01)

### Features:

* **promise:** re-enable promise patterns .resolve/then/catch ([d0fa65c](https://github.com/aurelia/aurelia/commit/d0fa65c))


### Bug Fixes:

* **attr-parser:** correctly handles multiple overlapping patterns ([9996ae4](https://github.com/aurelia/aurelia/commit/9996ae4))
* **plugin-conventions:** fix compatibility with webpack css extraction ([c1ab6cc](https://github.com/aurelia/aurelia/commit/c1ab6cc))


### Refactorings:

* **all:** remove lifecycle flags from various APIs ([b05db02](https://github.com/aurelia/aurelia/commit/b05db02))
* **template-compiler:** let binding command determine parsing work ([63aace4](https://github.com/aurelia/aurelia/commit/63aace4))

<a name="2.0.0-alpha.14"></a>
# 2.0.0-alpha.14 (2021-07-25)

### Refactorings:

* **runtime-html:** more error coded ([928d75e](https://github.com/aurelia/aurelia/commit/928d75e))
* **template-compiler:** codeify error messages, add more doc ([8004b8c](https://github.com/aurelia/aurelia/commit/8004b8c))
* **instructions:** rename instructions to props for CE/CA/TC ([ce307f4](https://github.com/aurelia/aurelia/commit/ce307f4))
* **runtime:** mark more private properties ([8ecf70b](https://github.com/aurelia/aurelia/commit/8ecf70b))
* **controller:** rename semi public APIs ([c2ee6e9](https://github.com/aurelia/aurelia/commit/c2ee6e9))

### BREAKING CHANGES:

* **controller:** The following static methods of class `Controller` have been renamed as:
  - `Controller.forCustomElement` -> `Controller.$el`
  - `Controller.forCustomAttrbite` -> `Controller.$attr`
  - `Controller.forSyntheticView` -> `Controller.$view`

<a name="2.0.0-alpha.13"></a>
# 2.0.0-alpha.13 (2021-07-19)

### Features:
* **enhance**: Now works similarly like v1, can be used as disconnected enhancement from an existing Aurelia instance.

### Refactorings:

* **controller:** remove unneeded param from Controller.forCustomElement ([4abb1ee](https://github.com/aurelia/aurelia/commit/4abb1ee))
* **controller:** remove root from IController ([c51ed16](https://github.com/aurelia/aurelia/commit/c51ed16))
* **bindings:** rename observeProperty -> observe, add doc ([fed517f](https://github.com/aurelia/aurelia/commit/fed517f))
* **ast:** simplify AST kind enum ([fed517f](https://github.com/aurelia/aurelia/commit/fed517f))
* **controller:** remove ctx ctrl requirement from .forCustomElement ([7edcef2](https://github.com/aurelia/aurelia/commit/7edcef2))
* **render-context:** remove render context ([7d38f53](https://github.com/aurelia/aurelia/commit/7d38f53))
* **scope:** remove host scope ([0349810](https://github.com/aurelia/aurelia/commit/0349810))
* **au-slot:** make host exposure a normal, explicit prop ([e2ce36c](https://github.com/aurelia/aurelia/commit/e2ce36c))

### Documentation:

* **binding-context:** add comment explaning difference in behavior ([f4bcc9f](https://github.com/aurelia/aurelia/commit/f4bcc9f))

<a name="2.0.0-alpha.12"></a>
# 2.0.0-alpha.12 (2021-07-11)

### BREAKING CHANGE:

* **template-compiler:** hooks name changes: beforeCompile -> compiling ([d8d8cc5](https://github.com/aurelia/aurelia/commit/d8d8cc5))

<a name="2.0.0-alpha.11"></a>
# 2.0.0-alpha.11 (2021-07-11)

### Features:

* **au-render:** ability to compose element using string as name ([aa466b4](https://github.com/aurelia/aurelia/commit/aa466b4))
* **if-else:** add ability to disable cache ([600c33f](https://github.com/aurelia/aurelia/commit/600c33f))


### Bug Fixes:

* **if:** fix actvation/deactivation timing ([020de51](https://github.com/aurelia/aurelia/commit/020de51))
* **call-binding:** assign args to event property, fixes #1231 ([fa4c0d4](https://github.com/aurelia/aurelia/commit/fa4c0d4))


### Performance Improvements:

* **renderer:** don't always call applyBindingBehavior ([5e2d624](https://github.com/aurelia/aurelia/commit/5e2d624))
* **rendering:** use definition for attribute & element instructions ([3a26b46](https://github.com/aurelia/aurelia/commit/3a26b46))
* **templating:** avoid retrieving definition unnecessarily ([f0e597f](https://github.com/aurelia/aurelia/commit/f0e597f))


### Refactorings:

* **templating:** use container from controller instead of context ([0822330](https://github.com/aurelia/aurelia/commit/0822330))
* **renderer:** use container from rendering controller as cotnext ([edc5dd8](https://github.com/aurelia/aurelia/commit/edc5dd8))
* **render-context:** cache renderers and compiled definition ([6a3be10](https://github.com/aurelia/aurelia/commit/6a3be10))
* **context:** remove IContainer interface impls out of Render/Route context ([18524de](https://github.com/aurelia/aurelia/commit/18524de))
* **context:** distinguish between render context and its container ([f216e98](https://github.com/aurelia/aurelia/commit/f216e98))

<a name="2.0.0-alpha.10"></a>
# 2.0.0-alpha.10 (2021-07-04)

### Features:

* **template-compiler:** ability to toggle expressions removal ([93272a2](https://github.com/aurelia/aurelia/commit/93272a2))
* **template-compiler:** add hooks decorator support, more integration tests ([dd3698d](https://github.com/aurelia/aurelia/commit/dd3698d))
* **template-compiler:** add beforeCompile hooks ([5e42b76](https://github.com/aurelia/aurelia/commit/5e42b76))
* **template-compiler:** add ability to recognize containerless attr ([23ec6cd](https://github.com/aurelia/aurelia/commit/23ec6cd))
* **di:** add @factory resolver ([3c1bef8](https://github.com/aurelia/aurelia/commit/3c1bef8))
* **di:** instance-provider now accepts predefined instance in 2nd param ([54edac9](https://github.com/aurelia/aurelia/commit/54edac9))
* **au-compose:** add support for composition with containerless on au-compose ([dec8a5a](https://github.com/aurelia/aurelia/commit/dec8a5a))
* **hydration:** add hydration context hierarchy ([9afb70c](https://github.com/aurelia/aurelia/commit/9afb70c))


### Bug Fixes:

* **watch:** construct scope properly for custom attr + expression watch ([cb26b0c](https://github.com/aurelia/aurelia/commit/cb26b0c))
* **scope:** disable host scope on CE controller ([ac0ff15](https://github.com/aurelia/aurelia/commit/ac0ff15))


### Refactorings:

* **di:** no longer tries to instantiate interface ([e757eb6](https://github.com/aurelia/aurelia/commit/e757eb6))
* **templating:** remove projections param from getRenderContext ([cf34e40](https://github.com/aurelia/aurelia/commit/cf34e40))
* **templating:** remove blur CA, tweak doc/tests ([1286b3b](https://github.com/aurelia/aurelia/commit/1286b3b))
* **au-slot:** remove unused exports ([58cc0b5](https://github.com/aurelia/aurelia/commit/58cc0b5))
* **au-slot:** lazily determine view factory at runtime ([5d3fa25](https://github.com/aurelia/aurelia/commit/5d3fa25))
* **controller:** remove unneccessary typings ([39ed707](https://github.com/aurelia/aurelia/commit/39ed707))

<a name="2.0.0-alpha.9"></a>
# 2.0.0-alpha.9 (2021-06-25)

### Features:

* **templating:** add a injectable hydration token ([52f11c4](https://github.com/aurelia/aurelia/commit/52f11c4))


### Bug Fixes:

* **with:** update bindings scope properly when value change ([906105d](https://github.com/aurelia/aurelia/commit/906105d))
* **deps:** update dependency marked to v2 [security] ([96f8649](https://github.com/aurelia/aurelia/commit/96f8649))
* **deps:** update dependency marked to v2 [security] ([4e0f388](https://github.com/aurelia/aurelia/commit/4e0f388))
* **let:** camel-case let target when using with interpolation/literal ([bee73cc](https://github.com/aurelia/aurelia/commit/bee73cc))


### Performance Improvements:

* **templating:** inline injectable preparation ([2f0ea95](https://github.com/aurelia/aurelia/commit/2f0ea95))
* **di:** do not create a new factory in .invoke() ([23c0405](https://github.com/aurelia/aurelia/commit/23c0405))
* **di:** minification friendlier di code ([23c0405](https://github.com/aurelia/aurelia/commit/23c0405))


### Refactorings:

* **au-slot:** use new hydration context token ([52f11c4](https://github.com/aurelia/aurelia/commit/52f11c4))
* **templating:** change custom element own container timing ([f1a2b7e](https://github.com/aurelia/aurelia/commit/f1a2b7e))
* **templating:** change timing of the container of a CE ([23c0405](https://github.com/aurelia/aurelia/commit/23c0405))
* **attr-syntax-transformer:** rename IAttrSyntaxTransformer ([71f5ceb](https://github.com/aurelia/aurelia/commit/71f5ceb))
* **all:** separate value from typing imports ([71f5ceb](https://github.com/aurelia/aurelia/commit/71f5ceb))

<a name="2.0.0-alpha.8"></a>
# 2.0.0-alpha.8 (2021-06-22)

### Features:

* **binding-command:** replace compile method with build, and get more raw information. ([240692d](https://github.com/aurelia/aurelia/commit/240692d))
* **attr-syntax-transformer:** add isTwoWay & map methods. These are lower & purer primitives compared to existing ones, allowing better control in the compilation. ([240692d](https://github.com/aurelia/aurelia/commit/240692d))
* **au-slot:** ability to use au-slot on the same element with a template controller ([240692d](https://github.com/aurelia/aurelia/commit/240692d))


### Bug Fixes:

* **dialog:** correct dialog dom structure ([42ae808](https://github.com/aurelia/aurelia/commit/42ae808))
* **jest:** fix jest v27 exports ([520ab8e](https://github.com/aurelia/aurelia/commit/520ab8e))

### Refactorings:

* **template-compiler:** remove BindingCommand.prototype.compile ([63dee52](https://github.com/aurelia/aurelia/commit/63dee52))
* **template-compiler:** remove existing TemplateCompiler, remove TemplateBinder ([0ab0cde](https://github.com/aurelia/aurelia/commit/0ab0cde))
* **template-compiler:** use class base impl for compilation context ([6cf1435](https://github.com/aurelia/aurelia/commit/6cf1435))
* **template-compiler:** merge binder & compiler ([240692d](https://github.com/aurelia/aurelia/commit/240692d))

  A breaking change is that custom attribute bindables are always checked against attribute form of bindables. This means it should be changed
  from:
  ```html
  <form form-expander="isActive: true">
  ```
  to:
  ```html
  <form form-expander="is-active: true">
  ```
  this is to align with the style attribute, and CE bindable.

  It's still possible to have any case for bindable properties inside multi-binding custom attribute usage, via `attribute` configuration of bindables:
  ```ts
  class MyAttr {
    @bindable({ attribute: 'isActive' })
    isActive: boolean;
  }
  ```

<a name="2.0.0-alpha.7"></a>
# 2.0.0-alpha.7 (2021-06-20)

### Features:

* **babel-jest,ts-jest:** support jest v27 ([2145bbe](https://github.com/aurelia/aurelia/commit/2145bbe))


### Bug Fixes:

* **router:** ensure href recognize external ([387c084](https://github.com/aurelia/aurelia/commit/387c084))
* **new-instance:** correctly invoke a registered interface ([8753b4e](https://github.com/aurelia/aurelia/commit/8753b4e))

  Add a few failling tests (skipped) for the most intuitive behaviors:** ability to invoke an interface without having to declare it, if it has a default registration. ([8753b4e](https://github.com/aurelia/aurelia/commit/8753b4e))
* **di:** disallow resource key override ([f92ac3b](https://github.com/aurelia/aurelia/commit/f92ac3b))


### Refactorings:

* **hydration-compilation:** use an object to carry more than projections information ([39c5497](https://github.com/aurelia/aurelia/commit/39c5497))
* **au-slot:** remove unused exports, fix tests ([aaf81de](https://github.com/aurelia/aurelia/commit/aaf81de))
* **au-slot:** do not associate scope with instruction/definition during compilation ([2fafe21](https://github.com/aurelia/aurelia/commit/2fafe21))
* **slot:** drop the use of projection provider in <au-slot/> ([560e3c5](https://github.com/aurelia/aurelia/commit/560e3c5))
* **di:** don't always copy root resources ([aadf5df](https://github.com/aurelia/aurelia/commit/aadf5df))
* **scope:** rename isComponentBoundary -> isBoundary ([a3a4281](https://github.com/aurelia/aurelia/commit/a3a4281))

<a name="2.0.0-alpha.6"></a>
# 2.0.0-alpha.6 (2021-06-11)

### Features:

* **compose:** au-compose -> au-render, implement v1 compose ([7b1502c](https://github.com/aurelia/aurelia/commit/7b1502c))
* **compose-v1:** better composition queues ([7b1502c](https://github.com/aurelia/aurelia/commit/7b1502c))
* **compose-v1:** better basic impl, timing ([7b1502c](https://github.com/aurelia/aurelia/commit/7b1502c))
* **compose-v1:** cleanup typings & unnecessary props ([7b1502c](https://github.com/aurelia/aurelia/commit/7b1502c))
* **compose-v1:** basic working tests with deactivation ([7b1502c](https://github.com/aurelia/aurelia/commit/7b1502c))
* **compose-v1:** better race condition handling ([7b1502c](https://github.com/aurelia/aurelia/commit/7b1502c))
* **compose-v1:** correct value change handling during detach ([7b1502c](https://github.com/aurelia/aurelia/commit/7b1502c))
* **compose-v1:** add test for scoped view-only behavior ([7b1502c](https://github.com/aurelia/aurelia/commit/7b1502c))
* **compose-v1:** add test for custom element composition, tweak detaching ([7b1502c](https://github.com/aurelia/aurelia/commit/7b1502c))
* **compose-v1:** more view-model composition tests ([7b1502c](https://github.com/aurelia/aurelia/commit/7b1502c))
* **compose-v1:** only re-activate when model changes ([7b1502c](https://github.com/aurelia/aurelia/commit/7b1502c))
* **compose-v1:** add more tests for integration ([7b1502c](https://github.com/aurelia/aurelia/commit/7b1502c))
* **build:** try aggregate logs ([7327945](https://github.com/aurelia/aurelia/commit/7327945))


### Bug Fixes:

* **compose-v1:** ensure remove the old composition ([7b1502c](https://github.com/aurelia/aurelia/commit/7b1502c))
* **attr:** ensure attr binding command take precedence over custom attr ([5ecd6a7](https://github.com/aurelia/aurelia/commit/5ecd6a7))


### Refactorings:

* **children:** make children observer a controlled observer ([673c8ac](https://github.com/aurelia/aurelia/commit/673c8ac))

<a name="2.0.0-alpha.5"></a>
# 2.0.0-alpha.5 (2021-05-31)

### Bug Fixes:

* ***:** deepscan issue ([f7b9dcc](https://github.com/aurelia/aurelia/commit/f7b9dcc))
* ***:** broken tests ([17ccba5](https://github.com/aurelia/aurelia/commit/17ccba5))
* **content:** fix content array auto observation ([98f14ef](https://github.com/aurelia/aurelia/commit/98f14ef))


### Refactorings:

* ***:** dropped superfluous props view factory ([9ef9664](https://github.com/aurelia/aurelia/commit/9ef9664))

<a name="2.0.0-alpha.4"></a>
# 2.0.0-alpha.4 (2021-05-25)

### Features:

* **store:** use STORE.container for performance api ([4024a5b](https://github.com/aurelia/aurelia/commit/4024a5b))
* **store:** use STORE.container for global DOM api ([f9e7620](https://github.com/aurelia/aurelia/commit/f9e7620))
* **store:** switch to ILogger ([8ffa768](https://github.com/aurelia/aurelia/commit/8ffa768))
* **store:** ff action dispatch feature from v1 ([3a00cae](https://github.com/aurelia/aurelia/commit/3a00cae))
* **kernel:** add full IPerformance to PLATFORM ([0dadea9](https://github.com/aurelia/aurelia/commit/0dadea9))
* **store:** bring store up-to-state with v1 features ([111dc0c](https://github.com/aurelia/aurelia/commit/111dc0c))
* **kernel:** update performance interface ([1a3fff8](https://github.com/aurelia/aurelia/commit/1a3fff8))
* **store:** move tests into tests folder ([bd0029b](https://github.com/aurelia/aurelia/commit/bd0029b))
* **store:** getting tsconfig to acknowledge environment and other fixes ([dfd2fc8](https://github.com/aurelia/aurelia/commit/dfd2fc8))
* **store:** remove unneeded and irrelevant parameters from created ([154a8e3](https://github.com/aurelia/aurelia/commit/154a8e3))
* **store:** merged in bigopon changes from original repo pr ([37bb425](https://github.com/aurelia/aurelia/commit/37bb425))
* **store:** getting tests to work ([a0f0125](https://github.com/aurelia/aurelia/commit/a0f0125))
* **store:** initial wip migration work of store ([49be9b2](https://github.com/aurelia/aurelia/commit/49be9b2))


### Bug Fixes:

* **store:** adjusted IConfigure method names ([0ec0728](https://github.com/aurelia/aurelia/commit/0ec0728))
* **store:** connectTo store obtaining API updated ([7f713b3](https://github.com/aurelia/aurelia/commit/7f713b3))
* **store:** inject window via DI; fix redux tests ([5ca4b07](https://github.com/aurelia/aurelia/commit/5ca4b07))
* **store:** decorator afterUnbind ([44225c1](https://github.com/aurelia/aurelia/commit/44225c1))
* **store:** throw on non-history-state for jump ([e795e47](https://github.com/aurelia/aurelia/commit/e795e47))
* **store:** test imports should reference package ([55adcd6](https://github.com/aurelia/aurelia/commit/55adcd6))
* **store:** merging syntax broke package file ([3f4cc8b](https://github.com/aurelia/aurelia/commit/3f4cc8b))


### Refactorings:

* **store:** remove unnecessary injection token ([53d12bf](https://github.com/aurelia/aurelia/commit/53d12bf))
* **store:** get rid of Reporter; additional tests ([8ac53c4](https://github.com/aurelia/aurelia/commit/8ac53c4))
* **store:** new lifecycle hooks ([78d5d81](https://github.com/aurelia/aurelia/commit/78d5d81))
* **store:** adapt to new IPerformance interface ([68c2452](https://github.com/aurelia/aurelia/commit/68c2452))
* **debug:** reporter codes properly sorted and fixed names for obj ([6163a3a](https://github.com/aurelia/aurelia/commit/6163a3a))
* **store:** comment out broken tests, clean up testing setup ([b07832b](https://github.com/aurelia/aurelia/commit/b07832b))
* **store:** refactoring tests and setup ([4b24b03](https://github.com/aurelia/aurelia/commit/4b24b03))
* **store:** exported object is more explicit for configuration ([2e3a364](https://github.com/aurelia/aurelia/commit/2e3a364))

<a name="2.0.0-alpha.3"></a>
# 2.0.0-alpha.3 (2021-05-19)

### Features:

* ***:** promise TC thanks @Sayan751 ([c6df35a](https://github.com/aurelia/aurelia/commit/c6df35a))
* **app-task:** allow app task to be created without a key ([2786898](https://github.com/aurelia/aurelia/commit/2786898))
* **dialog:** add dialog prop, rename controller to dialog, add more doc ([8696093](https://github.com/aurelia/aurelia/commit/8696093))
* **dialog:** better error msg, encourage IDialogController ([fe82826](https://github.com/aurelia/aurelia/commit/fe82826))
* **dialog:** ensure inject IDialogController, add test for injection ([9455c7f](https://github.com/aurelia/aurelia/commit/9455c7f))
* **dialog:** naming consistency, more doc, clear prop names ([64a32fa](https://github.com/aurelia/aurelia/commit/64a32fa))
* **dialog:** ensure naming consistency ([b49cc6f](https://github.com/aurelia/aurelia/commit/b49cc6f))
* **dialog:** more tests, ensure lifecycle invocation ([66e8b10](https://github.com/aurelia/aurelia/commit/66e8b10))
* **dialog:** keyboard handling impl, more tests, tweak doc ([f7099ba](https://github.com/aurelia/aurelia/commit/f7099ba))
* **dialog:** better interfaces/names + tweak tests ([a4c801a](https://github.com/aurelia/aurelia/commit/a4c801a))
* **dialog:** fix linting & deepscan issues ([55d47b1](https://github.com/aurelia/aurelia/commit/55d47b1))
* **dialog:** add more tests ([8bc8191](https://github.com/aurelia/aurelia/commit/8bc8191))
* **dialog:** better interface names ([499e926](https://github.com/aurelia/aurelia/commit/499e926))
* **dialog:** better messages, reorganise tests ([7425ba1](https://github.com/aurelia/aurelia/commit/7425ba1))
* **dialog:** move close promise handling to dialog activation, simplify dialog service ([2b817d9](https://github.com/aurelia/aurelia/commit/2b817d9))
* **dialog:** update dom impl ([b50d4e8](https://github.com/aurelia/aurelia/commit/b50d4e8))
* **dialog:** add tests ([7ca0502](https://github.com/aurelia/aurelia/commit/7ca0502))
* **dialog:** better implementation ([c8c7a1b](https://github.com/aurelia/aurelia/commit/c8c7a1b))
* **dialog:** add default IDIalogService ([eb92a73](https://github.com/aurelia/aurelia/commit/eb92a73))
* **composer:** better definition creation ([10e2d05](https://github.com/aurelia/aurelia/commit/10e2d05))
* **dialog:** add entry module for dialog exports ([3ada28b](https://github.com/aurelia/aurelia/commit/3ada28b))
* **composer:** tweak the view model invokcation & INode registration ([8f33a80](https://github.com/aurelia/aurelia/commit/8f33a80))
* **dialog:** add configuration ([8e396d4](https://github.com/aurelia/aurelia/commit/8e396d4))
* **dialog:** rearrange timing in dialog controller, adjust based objects ([e433054](https://github.com/aurelia/aurelia/commit/e433054))
* **dialog:** move all default implementations together ([7287b29](https://github.com/aurelia/aurelia/commit/7287b29))
* **dialog:** refactor interfaces organisation ([1f93ded](https://github.com/aurelia/aurelia/commit/1f93ded))
* **dialog:** refactor dialog controller ([7d53df3](https://github.com/aurelia/aurelia/commit/7d53df3))
* **dialog:** refactor interfaces, introduce new ext points ([1e0bfc6](https://github.com/aurelia/aurelia/commit/1e0bfc6))
* **dialog:** add basic dialog service to runtime-html ([347f00e](https://github.com/aurelia/aurelia/commit/347f00e))
* ***:** complete custom plugin doc ([5e0d8d2](https://github.com/aurelia/aurelia/commit/5e0d8d2))
* **compose:** basic friendly composer API implementation ([3022d76](https://github.com/aurelia/aurelia/commit/3022d76))
* **promise-tc:** initial implementation ([228085b](https://github.com/aurelia/aurelia/commit/228085b))


### Bug Fixes:

* ***:** deepscan issues ([48b1843](https://github.com/aurelia/aurelia/commit/48b1843))
* ***:** broken i18n tests ([2da8e72](https://github.com/aurelia/aurelia/commit/2da8e72))
* ***:** broken tests ([eb0effe](https://github.com/aurelia/aurelia/commit/eb0effe))
* **d the url for extending templating syntax to point to: http:** //docs.aurelia.io/app-basics/extending-templating-syntax ([428609f](https://github.com/aurelia/aurelia/commit/428609f))
* **router:** fix baseHref issue and fragment hash routing ([6647e54](https://github.com/aurelia/aurelia/commit/6647e54))
* **router:** fix issue where @default would be included when last segment is empty ([ed54dd4](https://github.com/aurelia/aurelia/commit/ed54dd4))
* **obs-record:** separate count & slot number ([c824801](https://github.com/aurelia/aurelia/commit/c824801))
* **array-obs:** handle array.find for computed obs, dont cache index obs ([79ba544](https://github.com/aurelia/aurelia/commit/79ba544))
* **debounce:** respect default delay ([420829c](https://github.com/aurelia/aurelia/commit/420829c))
* **router:** fix fragment hash routing ([4cc336e](https://github.com/aurelia/aurelia/commit/4cc336e))
* **select-observer:** ensure value is fresh when flush ([99e0172](https://github.com/aurelia/aurelia/commit/99e0172))
* **plugin-conventions:** accept class FooBarCustomElement convention ([8098c9f](https://github.com/aurelia/aurelia/commit/8098c9f))
* **plugin-conventions:** accept class FooBarCustomElement convention ([1dfac6f](https://github.com/aurelia/aurelia/commit/1dfac6f))
* ***:** #1114 ([eed272e](https://github.com/aurelia/aurelia/commit/eed272e))
* **lifecycle-hooks:** properly maintain resources semantic ([74e1b78](https://github.com/aurelia/aurelia/commit/74e1b78))
* **lifecycle-hooks:** more convoluted usage tests ([60763e1](https://github.com/aurelia/aurelia/commit/60763e1))
* **lifecycle-hooks:** properly maintain resources semantic ([6bfefcb](https://github.com/aurelia/aurelia/commit/6bfefcb))
* ***:** tests ([c258891](https://github.com/aurelia/aurelia/commit/c258891))
* ***:** revert changes in attr-observer, remove unused code in dirty checker ([192a26f](https://github.com/aurelia/aurelia/commit/192a26f))
* **observers:** ensure oldValue is correctly updated in flush,with optz ([07bc335](https://github.com/aurelia/aurelia/commit/07bc335))
* ***:** tweak watch decorator tests ([ffb82fe](https://github.com/aurelia/aurelia/commit/ffb82fe))
* ***:** queue the size observer ([0317bce](https://github.com/aurelia/aurelia/commit/0317bce))
* ***:** promise-tc tests ([1fca482](https://github.com/aurelia/aurelia/commit/1fca482))
* **promise-tc:** flaky tests ([43730ef](https://github.com/aurelia/aurelia/commit/43730ef))
* **promise-tc:** node tests ([3801b0b](https://github.com/aurelia/aurelia/commit/3801b0b))
* **promise-tc:** linting error ([ce91832](https://github.com/aurelia/aurelia/commit/ce91832))
* **promise-tc:** activation and deactivation ([54ad4ea](https://github.com/aurelia/aurelia/commit/54ad4ea))


### Refactorings:

* ***:** binding context resolution with bindingmode participation" ([b84813c](https://github.com/aurelia/aurelia/commit/b84813c))
* **app-task:** simplify usage, align with .createInterface ([2786898](https://github.com/aurelia/aurelia/commit/2786898))
* **dialog:** stricter interface, tweak tests, fix deepscan ([53f95a4](https://github.com/aurelia/aurelia/commit/53f95a4))
* **dialog:** simplify interfaces, renmove default animator ([49e3c70](https://github.com/aurelia/aurelia/commit/49e3c70))
* **dialog:** remove IDialogAnimator ([9e1a354](https://github.com/aurelia/aurelia/commit/9e1a354))
* ***:** ease multiple metadata polyfill strictness ([54f485a](https://github.com/aurelia/aurelia/commit/54f485a))
* ***:** default observation flush q ([ec47fe9](https://github.com/aurelia/aurelia/commit/ec47fe9))
* ***:** binding context resolution with bindingmode participation ([3abe3f6](https://github.com/aurelia/aurelia/commit/3abe3f6))
* **all:** rename currentValue -> value ([6dc943e](https://github.com/aurelia/aurelia/commit/6dc943e))
* ***:** separate scope for promise ([1d0de63](https://github.com/aurelia/aurelia/commit/1d0de63))
* ***:** add basic tests of multi layer change propagation with VC in between ([0578fa4](https://github.com/aurelia/aurelia/commit/0578fa4))
* ***:** tweak effect test to align with queue behavior ([43da015](https://github.com/aurelia/aurelia/commit/43da015))
* **flush-queue:** wrap with finally ([1c14950](https://github.com/aurelia/aurelia/commit/1c14950))
* **observable:** queue value attr observer ([920bd59](https://github.com/aurelia/aurelia/commit/920bd59))
* **observation:** temporarily disable mutation in getter test ([20fac68](https://github.com/aurelia/aurelia/commit/20fac68))
* **observation:** fix linting issues ([e738bc1](https://github.com/aurelia/aurelia/commit/e738bc1))
* **observation:** don't propagate changes with depth first resolution ([235f227](https://github.com/aurelia/aurelia/commit/235f227))
* **promise-tc:** then, catch redirections ([7723332](https://github.com/aurelia/aurelia/commit/7723332))
* **promise-tc:** promise.resolve redirection ([1ba35df](https://github.com/aurelia/aurelia/commit/1ba35df))
* **promise-tc:** task queuing + timing tests ([7b2224f](https://github.com/aurelia/aurelia/commit/7b2224f))
* **promise-tc:** task queue ([7abe877](https://github.com/aurelia/aurelia/commit/7abe877))
* **promise-tc:** and test ([1aaf36a](https://github.com/aurelia/aurelia/commit/1aaf36a))

<a name="2.0.0-alpha.2"></a>
# 2.0.0-alpha.2 (2021-03-07)

### Features:

* **di:** add invoke to route context ([3c51a30](https://github.com/aurelia/aurelia/commit/3c51a30))
* **di:** add invoke to render context too ([ead0522](https://github.com/aurelia/aurelia/commit/ead0522))
* **di:** add invoke API back ([9892bfc](https://github.com/aurelia/aurelia/commit/9892bfc))


### Bug Fixes:

* **runtime:** fix duplicate lifecycleHooks resolution at root ([3b245ec](https://github.com/aurelia/aurelia/commit/3b245ec))
* **router:** fix direct routing parenthesized parameters ([73f106d](https://github.com/aurelia/aurelia/commit/73f106d))
* **router:** restore au-viewport's fallback property ([4f57cc5](https://github.com/aurelia/aurelia/commit/4f57cc5))
* **router:** fix the au-viewport's default attribute ([25c87a8](https://github.com/aurelia/aurelia/commit/25c87a8))

<a name="2.0.0-alpha.1"></a>
# 2.0.0-alpha.1 (2021-03-03)

**Note:** Version bump only for package undefined

<a name="2.0.0-alpha.0"></a>
# 2.0.0-alpha.0 (2021-03-02)

### Features:

* ***:** benchmark viz app ([3a21977](https://github.com/aurelia/aurelia/commit/3a21977))
* ***:** input[type=number/date] value as number binding ([d7bc69d](https://github.com/aurelia/aurelia/commit/d7bc69d))
* ***:** ability to teach attr-prop mapping ([55c8ca7](https://github.com/aurelia/aurelia/commit/55c8ca7))
* **r:** interpolation with HTML nodes/elements ([fd14933](https://github.com/aurelia/aurelia/commit/fd14933))
* **text-interpolation:** basic tests, with VC tests ([3d0d9c4](https://github.com/aurelia/aurelia/commit/3d0d9c4))
* **text-interpolation:** basic implementation ([67f5735](https://github.com/aurelia/aurelia/commit/67f5735))
* ***:** track read on observable & bindable ([011804f](https://github.com/aurelia/aurelia/commit/011804f))
* **effect:** add IEffectRunner & Effect ([4a357c6](https://github.com/aurelia/aurelia/commit/4a357c6))


### Bug Fixes:

* **template-binder:** check if as-element was used ([35284f2](https://github.com/aurelia/aurelia/commit/35284f2))
* **template-binder:** check if as-element was used ([6bc5d40](https://github.com/aurelia/aurelia/commit/6bc5d40))
* **syntax-transformer:** don't transform attr of .class & .style commands ([c07b9d0](https://github.com/aurelia/aurelia/commit/c07b9d0))
* **syntax-transformer): ?? vs ? vs () :dizz:**  ([af12ed7](https://github.com/aurelia/aurelia/commit/af12ed7))
* ***:** binder ignore attr correctly ([311fe1e](https://github.com/aurelia/aurelia/commit/311fe1e))
* ***:** tweak compilation tests to match camelization of prop ([c6449ca](https://github.com/aurelia/aurelia/commit/c6449ca))
* **binder-test:** adjust the expected output as interpolation is removed ([2684446](https://github.com/aurelia/aurelia/commit/2684446))
* **binder:** only remove attr when there's an interpolation ([51bb404](https://github.com/aurelia/aurelia/commit/51bb404))
* ***:** remove attr with interpolation ([a0a1df9](https://github.com/aurelia/aurelia/commit/a0a1df9))
* **translation-binding:** properly queue per target/attribute pair ([9ac40a6](https://github.com/aurelia/aurelia/commit/9ac40a6))
* **i18n:** also queue param updates, fix tests ([ea5875a](https://github.com/aurelia/aurelia/commit/ea5875a))
* ***:** Update packages/__tests__/i18n/t/translation-integration.spec.ts ([7e66afe](https://github.com/aurelia/aurelia/commit/7e66afe))
* **di:** cached callback always returns same ([eb69711](https://github.com/aurelia/aurelia/commit/eb69711))
* **ci:** master branch commit ([a66e993](https://github.com/aurelia/aurelia/commit/a66e993))
* **i18n-tests:** fix null/undefined + default value test ([26b900c](https://github.com/aurelia/aurelia/commit/26b900c))
* **translation-binding:** align update behavior during bind, tweak tests ([d189000](https://github.com/aurelia/aurelia/commit/d189000))
* **i18n-tests:** tweak assertion to match fixtures ([effaf50](https://github.com/aurelia/aurelia/commit/effaf50))
* **benchmakr-viz:** linting errors ([728a8f5](https://github.com/aurelia/aurelia/commit/728a8f5))
* **testing:** instantiate app root with ctx container ([d43365d](https://github.com/aurelia/aurelia/commit/d43365d))
* **setter-obs:** dont notify if incoming val is the same ([8bf519a](https://github.com/aurelia/aurelia/commit/8bf519a))
* **content-interpolation:** cancel task if any when latest value is update ([6784103](https://github.com/aurelia/aurelia/commit/6784103))
* **content-interpolation:** bogus null assignment ([815469e](https://github.com/aurelia/aurelia/commit/815469e))
* **content-interpolation:** queue in both normal & collection change ([b8b6bbc](https://github.com/aurelia/aurelia/commit/b8b6bbc))
* **interpolation-binding:** cleanup old value in unbind ([bdc394c](https://github.com/aurelia/aurelia/commit/bdc394c))
* **binder:** dont remove the physical text node ([6beab31](https://github.com/aurelia/aurelia/commit/6beab31))
* **missing:** resource.d.ts exposing incorrect ([2d71ce5](https://github.com/aurelia/aurelia/commit/2d71ce5))
* **bindings:** remove redundant return and ensure .updateSource flag ([4d975f7](https://github.com/aurelia/aurelia/commit/4d975f7))
* **interpolation:** release task in unbind ([08933e4](https://github.com/aurelia/aurelia/commit/08933e4))
* **router:** querystring ([044bfde](https://github.com/aurelia/aurelia/commit/044bfde))
* ***:** minor benchmark issues ([4113ab0](https://github.com/aurelia/aurelia/commit/4113ab0))
* **tests:** fix translation tests ([8db92a0](https://github.com/aurelia/aurelia/commit/8db92a0))
* **param-renderer:** resolve platform once only ([3ad49fe](https://github.com/aurelia/aurelia/commit/3ad49fe))
* **circleci:** try fixing build ([d489bcf](https://github.com/aurelia/aurelia/commit/d489bcf))
* **missing:** resource.d.ts exposing incorrect ([142b31f](https://github.com/aurelia/aurelia/commit/142b31f))
* **debounce/throttle:** override queue when source changes ([3c366fd](https://github.com/aurelia/aurelia/commit/3c366fd))
* **di:** cached callback always returns same ([3ba5343](https://github.com/aurelia/aurelia/commit/3ba5343))


### Refactorings:

* ***:** remove left over unused ids ([97fc845](https://github.com/aurelia/aurelia/commit/97fc845))
* **template-binder:** handle binding plain attr differently ([a0a1df9](https://github.com/aurelia/aurelia/commit/a0a1df9))
* **all:** remove .update flags ([3fc1632](https://github.com/aurelia/aurelia/commit/3fc1632))
* **bindable:** use controller for determining bound state & change handler ([f4acedd](https://github.com/aurelia/aurelia/commit/f4acedd))
* **benchmark-viz:** set history state on successful comparison ([df85530](https://github.com/aurelia/aurelia/commit/df85530))
* **benchmark-viz:** ci correction ([e607b6f](https://github.com/aurelia/aurelia/commit/e607b6f))
* **benchmark-viz:** enhanced error information ([dc96927](https://github.com/aurelia/aurelia/commit/dc96927))
* **content-interpolation:** put text node next to the original one ([b78a210](https://github.com/aurelia/aurelia/commit/b78a210))
* **content-binding:** dont remove on unbind, add assertion for post tearDown ([343f790](https://github.com/aurelia/aurelia/commit/343f790))
* **interpolation:** rename interpolation part binding, remove redundant code ([8a1a21e](https://github.com/aurelia/aurelia/commit/8a1a21e))
* **bindable:** use controller for determining bound state & change handler ([043c679](https://github.com/aurelia/aurelia/commit/043c679))
* **benchmark-viz:** basic support to compare branches ([f098b74](https://github.com/aurelia/aurelia/commit/f098b74))
* **benchmark:** measurement consolidation ([b318675](https://github.com/aurelia/aurelia/commit/b318675))
* **benchmark:** result query support ([3e87a4b](https://github.com/aurelia/aurelia/commit/3e87a4b))
* **benchmark/dataviz:** grouped measurements ([9d1328d](https://github.com/aurelia/aurelia/commit/9d1328d))
* **i18n:** batch updates in changes ([f838be2](https://github.com/aurelia/aurelia/commit/f838be2))
* ***:** dataviz stacked bars ([60e6617](https://github.com/aurelia/aurelia/commit/60e6617))
* **benchmark-dataviz:** changed legend layout ([4161b02](https://github.com/aurelia/aurelia/commit/4161b02))
* **benchmark/dataviz:** stacked bars ([b8a6756](https://github.com/aurelia/aurelia/commit/b8a6756))
* **bench-dataviz:** avg measurements ([37b48ef](https://github.com/aurelia/aurelia/commit/37b48ef))
* ***:** dataviz ([81b0bc6](https://github.com/aurelia/aurelia/commit/81b0bc6))
* **bench/dataviz:** result via data service ([c05de23](https://github.com/aurelia/aurelia/commit/c05de23))
* **benchmark:** storage API to fetch result ([a65b6da](https://github.com/aurelia/aurelia/commit/a65b6da))
* **benchmark:** data-service ([f3b0c58](https://github.com/aurelia/aurelia/commit/f3b0c58))
* ***:** update attr binding, throttle/debounce, add tests ([cab73f4](https://github.com/aurelia/aurelia/commit/cab73f4))
* **prop-binding:** remove necessity for id stamping infra ([409d977](https://github.com/aurelia/aurelia/commit/409d977))
* **effect:** rename IEffectRunner -> IObservation r ([de5d272](https://github.com/aurelia/aurelia/commit/de5d272))
* **connectable:** clearer interface for connectable to receive changes ([bec6ed0](https://github.com/aurelia/aurelia/commit/bec6ed0))

<a name="0.9.0"></a>
# 0.9.0 (2021-01-31)

### Features:

* **runtime-html:** add @lifecycleHooks wiring ([4076293](https://github.com/aurelia/aurelia/commit/4076293))
* **router:** preserve original path / finalPath values in RouteNode ([e7aab7f](https://github.com/aurelia/aurelia/commit/e7aab7f))
* **runtime:** add getRef/setRef API's and expose $au object on nodes ([c47cc85](https://github.com/aurelia/aurelia/commit/c47cc85))
* **runtime-html:** invoke created() hook on custom attributes ([3e90d68](https://github.com/aurelia/aurelia/commit/3e90d68))
* **router:** add simple title customization api ([8ad49ad](https://github.com/aurelia/aurelia/commit/8ad49ad))
* ***:** decorator auSlots wip ([6ddb362](https://github.com/aurelia/aurelia/commit/6ddb362))
* ***:** processContent wip ([cb8a103](https://github.com/aurelia/aurelia/commit/cb8a103))
* **batch:** update implementation ([ecd4c8f](https://github.com/aurelia/aurelia/commit/ecd4c8f))
* **batch:** clone batches before flushing ([c3659ea](https://github.com/aurelia/aurelia/commit/c3659ea))
* **batch:** basic impl ([0ef7178](https://github.com/aurelia/aurelia/commit/0ef7178))
* **show/hide:** port show & hide attributes from v1 ([8dd9562](https://github.com/aurelia/aurelia/commit/8dd9562))
* **compiler:** preserve 'alias' in the compiled instruction for usage by component instance ([e80a837](https://github.com/aurelia/aurelia/commit/e80a837))
* **plugin-conventions:** rejects usage of <slot> in non-ShadowDOM mode ([0b545f4](https://github.com/aurelia/aurelia/commit/0b545f4))
* **fetch-client:** add IHttpClient interface ([b1a7a6d](https://github.com/aurelia/aurelia/commit/b1a7a6d))
* **di:** remove DI.createInterface builder ([8146dcc](https://github.com/aurelia/aurelia/commit/8146dcc))
* **route-recognizer:** support path array ([b1ef7f1](https://github.com/aurelia/aurelia/commit/b1ef7f1))
* **fetch-client:** add IHttpClient interface ([867887d](https://github.com/aurelia/aurelia/commit/867887d))
* **work-tracker:** initial implementation for an app-wide 'wait-for-idle' api ([c677a4d](https://github.com/aurelia/aurelia/commit/c677a4d))
* **logger:** process string placeholders ([8b5c026](https://github.com/aurelia/aurelia/commit/8b5c026))
* **kernel:** add module analyzer ([4edd891](https://github.com/aurelia/aurelia/commit/4edd891))
* **kernel:** add inheritParentResources config option ([ce5e17d](https://github.com/aurelia/aurelia/commit/ce5e17d))


### Bug Fixes:

* **route-expression:** fix segment grouping, scoping and serialization ([5acd0ed](https://github.com/aurelia/aurelia/commit/5acd0ed))
* **router:** querystring ([eca9606](https://github.com/aurelia/aurelia/commit/eca9606))
* **conventions:** skip local template, leave it to runtime ([0501dfc](https://github.com/aurelia/aurelia/commit/0501dfc))
* **router:** update document.title ([071fd38](https://github.com/aurelia/aurelia/commit/071fd38))
* **http-server:** add platform initialization ([b1ad799](https://github.com/aurelia/aurelia/commit/b1ad799))
* **router:** set default swap strat to remove-first ([bad1f26](https://github.com/aurelia/aurelia/commit/bad1f26))
* ***:** broken validation tests ([a051257](https://github.com/aurelia/aurelia/commit/a051257))
* **router:** fix component agent slip-up ([e49d579](https://github.com/aurelia/aurelia/commit/e49d579))
* **runtime:** prevent early taskQueue yield ([a72c8b2](https://github.com/aurelia/aurelia/commit/a72c8b2))
* **custom-attribute:** fix CustomAttribute.for ([4c97444](https://github.com/aurelia/aurelia/commit/4c97444))
* **logger:** fix sink registration ([6f93797](https://github.com/aurelia/aurelia/commit/6f93797))
* ***:** typo correction ([eaf81d2](https://github.com/aurelia/aurelia/commit/eaf81d2))
* **task-queue:** fix a yield bug ([7262479](https://github.com/aurelia/aurelia/commit/7262479))
* **platform:** let yield await async tasks ([576edba](https://github.com/aurelia/aurelia/commit/576edba))
* **au-slot:** non-strictly-initialized property ([699e7b8](https://github.com/aurelia/aurelia/commit/699e7b8))
* **load:** apply the correct href attribute (preliminary)' ([e63d7fe](https://github.com/aurelia/aurelia/commit/e63d7fe))
* **router:** pass data property to route node in direct routing ([6fc0e6b](https://github.com/aurelia/aurelia/commit/6fc0e6b))
* **router:** fix params inheritance ([63df5ac](https://github.com/aurelia/aurelia/commit/63df5ac))
* **router:** fix relative/absolute navigation ([2bcf8d2](https://github.com/aurelia/aurelia/commit/2bcf8d2))
* **router:** fix absolute & relative paths ([6f2a49f](https://github.com/aurelia/aurelia/commit/6f2a49f))
* **router:** add transitionPlan validation prop ([0f1b271](https://github.com/aurelia/aurelia/commit/0f1b271))
* **router:** fix some lazy-loading edge cases / cleanup route-recognizer ([0043dad](https://github.com/aurelia/aurelia/commit/0043dad))
* **router:** fix load isActive and expose it as a fromView bindable ([2e3eaaf](https://github.com/aurelia/aurelia/commit/2e3eaaf))
* **router:** fix href isEnabled logic ([7f8ea00](https://github.com/aurelia/aurelia/commit/7f8ea00))
* ***:** as-element support for au-slot ([ae233e3](https://github.com/aurelia/aurelia/commit/ae233e3))
* **router:** fix several issues in link handler and add trace logging ([8b9fa29](https://github.com/aurelia/aurelia/commit/8b9fa29))
* **router:** add missing route config properties to the validator ([f8367a6](https://github.com/aurelia/aurelia/commit/f8367a6))
* ***:** linting issue ([0613391](https://github.com/aurelia/aurelia/commit/0613391))
* ***:** compilation skipping ([c9f5bda](https://github.com/aurelia/aurelia/commit/c9f5bda))
* ***:** broken test in node ([054f4b3](https://github.com/aurelia/aurelia/commit/054f4b3))
* ***:** linting issue ([fbddf28](https://github.com/aurelia/aurelia/commit/fbddf28))
* ***:** broken tests ([e968b79](https://github.com/aurelia/aurelia/commit/e968b79))
* ***:** order-agnostic processContent decorator ([c3a4bb6](https://github.com/aurelia/aurelia/commit/c3a4bb6))
* **batch:** ensure nested batch not batched in outer ([ae61005](https://github.com/aurelia/aurelia/commit/ae61005))
* **fetch-client:** http-client.ts ([5137832](https://github.com/aurelia/aurelia/commit/5137832))
* ***:** ensure bindable & observable behavior match v1 ([200ac40](https://github.com/aurelia/aurelia/commit/200ac40))
* **tests:** rename sub flag prop in test ([e4dc092](https://github.com/aurelia/aurelia/commit/e4dc092))
* **accessors:** add index signature ([617c416](https://github.com/aurelia/aurelia/commit/617c416))
* ***:** use sub count from record only ([e9f578e](https://github.com/aurelia/aurelia/commit/e9f578e))
* **semantic-model:** include alias in cache key ([ad09693](https://github.com/aurelia/aurelia/commit/ad09693))
* **di:** use requestor to resolve alias ([9face4b](https://github.com/aurelia/aurelia/commit/9face4b))
* **computed-observer:** ensure getter invoked efficiently ([8b2bcf9](https://github.com/aurelia/aurelia/commit/8b2bcf9))
* **route-recognizer:** cleanup & fix empty path routes ([5edb119](https://github.com/aurelia/aurelia/commit/5edb119))
* **eslint:** no warn == for a null check ([2f41f28](https://github.com/aurelia/aurelia/commit/2f41f28))
* **tests:** correct validation controller tests ([2849c99](https://github.com/aurelia/aurelia/commit/2849c99))
* **aurelia:** export IRouterEvents ([09e5785](https://github.com/aurelia/aurelia/commit/09e5785))
* **router:** stop the router on AppTask.afterDeactivate ([aca6d81](https://github.com/aurelia/aurelia/commit/aca6d81))
* **attribute:** queue new task ([5f7fa27](https://github.com/aurelia/aurelia/commit/5f7fa27))
* **export:** export new interfaces ([5febd83](https://github.com/aurelia/aurelia/commit/5febd83))
* **bench:** deepscan issues ([8af08d6](https://github.com/aurelia/aurelia/commit/8af08d6))
* **bench:** cosmos-db persistence ([529007f](https://github.com/aurelia/aurelia/commit/529007f))
* **controller:** fix async unbind with dispose race condition ([987d69d](https://github.com/aurelia/aurelia/commit/987d69d))
* **router:** use afterActivate app task ([d17bab7](https://github.com/aurelia/aurelia/commit/d17bab7))
* **router:** fix caching issue with two siblings that are the same component ([3e60c79](https://github.com/aurelia/aurelia/commit/3e60c79))


### Performance Improvements:

* **controller:** use stack to minimize promise tick overhead ([d861da8](https://github.com/aurelia/aurelia/commit/d861da8))


### Refactorings:

* **router:** renames 'children' to 'routes' ([90b56a2](https://github.com/aurelia/aurelia/commit/90b56a2))
* **router:** use @lifecycleHooks api for shared hooks ([b308328](https://github.com/aurelia/aurelia/commit/b308328))
* ***:** au-slot info via DI ([1719669](https://github.com/aurelia/aurelia/commit/1719669))
* **logging:** replace $console config option with ConsoleSink ([4ea5d22](https://github.com/aurelia/aurelia/commit/4ea5d22))
* **router:** fix some title stuff ([ddac8e0](https://github.com/aurelia/aurelia/commit/ddac8e0))
* **router:** various fixes w.r.t. relative/absolute urls and default resolution ([b6dc3b9](https://github.com/aurelia/aurelia/commit/b6dc3b9))
* **router:** fix several reference / clone issues w.r.t. redirects etc ([665a4c7](https://github.com/aurelia/aurelia/commit/665a4c7))
* **router:** cleanup/simplify the tree compiler ([9e0a30b](https://github.com/aurelia/aurelia/commit/9e0a30b))
* **all:** rename macroTaskQueue to taskQueue ([87c073d](https://github.com/aurelia/aurelia/commit/87c073d))
* **route-recognizer:** make handler mutable ([d8a3ad2](https://github.com/aurelia/aurelia/commit/d8a3ad2))
* **router:** cleanup load & href custom attributes, add v1 compat ([b75ea31](https://github.com/aurelia/aurelia/commit/b75ea31))
* ***:** decorator auSlots ([26e980c](https://github.com/aurelia/aurelia/commit/26e980c))
* ***:** decorator auSlots ([9fbb312](https://github.com/aurelia/aurelia/commit/9fbb312))
* ***:** and more tests for processContent ([893831e](https://github.com/aurelia/aurelia/commit/893831e))
* **au:** make esm compatible ([0fcbbe2](https://github.com/aurelia/aurelia/commit/0fcbbe2))
* **http-server:** convert to native modules ([109b1fb](https://github.com/aurelia/aurelia/commit/109b1fb))
* **connectable:** merge observer record & collection observer record ([f2c1501](https://github.com/aurelia/aurelia/commit/f2c1501))
* **test:** inline resources via karma preprocessor ([f74bce9](https://github.com/aurelia/aurelia/commit/f74bce9))
* **all:** rename interfaces, simplify subscriber collection ([1c37183](https://github.com/aurelia/aurelia/commit/1c37183))
* **test:** migrate from webpack to karma native modules ([e3e99f7](https://github.com/aurelia/aurelia/commit/e3e99f7))
* ***:** remove ILifecycle export ([7ed7c6b](https://github.com/aurelia/aurelia/commit/7ed7c6b))
* **ci-env:** remove dependency on request ([c07c5f5](https://github.com/aurelia/aurelia/commit/c07c5f5))
* **all:** remove ILifecycle ([d141d8e](https://github.com/aurelia/aurelia/commit/d141d8e))
* **collection:** remove lifecycle from collection ([a0fc5fb](https://github.com/aurelia/aurelia/commit/a0fc5fb))
* **array-obs:** remove ILifecycle from array-obs ([da92d9f](https://github.com/aurelia/aurelia/commit/da92d9f))
* ***:** simplify subscriber collection deco invocation ([a3547d5](https://github.com/aurelia/aurelia/commit/a3547d5))
* ***:** use the same utility in runtime ([7340905](https://github.com/aurelia/aurelia/commit/7340905))
* **observation:** minor cleanup, tweak accessor type ([2756ece](https://github.com/aurelia/aurelia/commit/2756ece))
* **di:** dont create lambda ([4265bfd](https://github.com/aurelia/aurelia/commit/4265bfd))
* **connectable:** more cryptic, less generic name ([0f303cb](https://github.com/aurelia/aurelia/commit/0f303cb))
* **subscribers:** use a separate record for managing subscribers ([9f9152d](https://github.com/aurelia/aurelia/commit/9f9152d))
* **di:** store factory per container root instead of via metadata ([dbbd8b9](https://github.com/aurelia/aurelia/commit/dbbd8b9))
* **di:** simplify factory ([795bdea](https://github.com/aurelia/aurelia/commit/795bdea))
* ***:** use private static, tweak comments, simplify vs ast code ([d8f1c69](https://github.com/aurelia/aurelia/commit/d8f1c69))
* ***:** use private static, tweak comments, simplify vs ast code ([98d33b4](https://github.com/aurelia/aurelia/commit/98d33b4))
* **connectable:** make record/cRecord first class, remove other methods ([d0cb810](https://github.com/aurelia/aurelia/commit/d0cb810))
* **runtime:** simplify generated code ([7a8f876](https://github.com/aurelia/aurelia/commit/7a8f876))
* **runtime-html:** more cleanup ([5bde778](https://github.com/aurelia/aurelia/commit/5bde778))
* **watch:** move to runtime-html ([1250402](https://github.com/aurelia/aurelia/commit/1250402))
* **runtime:** move binding implementations to runtime-html ([8d9a177](https://github.com/aurelia/aurelia/commit/8d9a177))
* **connectable:** make observe coll part of IConnectable, updat watchers ([3df866c](https://github.com/aurelia/aurelia/commit/3df866c))
* ***:** remove IPropertyChangeTracker interface ([d9ba9a4](https://github.com/aurelia/aurelia/commit/d9ba9a4))
* **obs:** remove IPropertyObserver ([d29bc28](https://github.com/aurelia/aurelia/commit/d29bc28))
* **all:** remove IBindingTargetAccessor & IBindingTargetObserver interfaces ([d9c27c6](https://github.com/aurelia/aurelia/commit/d9c27c6))
* **subscribers:** shorter internal prop names, add some more comments ([1c6cb2d](https://github.com/aurelia/aurelia/commit/1c6cb2d))
* **runtime:** reexport watch on aurelia package ([e7a46e4](https://github.com/aurelia/aurelia/commit/e7a46e4))
* **runtime:** reexport watch on aurelia package ([af29a73](https://github.com/aurelia/aurelia/commit/af29a73))
* **router:** rename resolutionStrategy to resolutionMode ([9591c7f](https://github.com/aurelia/aurelia/commit/9591c7f))
* **el-accessor:** merge size & length observersremove task reuse ([3af2d9f](https://github.com/aurelia/aurelia/commit/3af2d9f))
* **router:** rename deferral back to resolutionStrategy ([1b6adf1](https://github.com/aurelia/aurelia/commit/1b6adf1))
* **observer:** ensure length subscription adds array subscription, add tests ([64182ae](https://github.com/aurelia/aurelia/commit/64182ae))
* **obs:** clean up bind from observer, ([3006d3b](https://github.com/aurelia/aurelia/commit/3006d3b))
* **realworld:** use DI interfaces ([25de717](https://github.com/aurelia/aurelia/commit/25de717))
* **router:** use stack to minimize promise tick overhead + various improvements ([09d2379](https://github.com/aurelia/aurelia/commit/09d2379))
* **if:** cleanup & utilize WorkTracker ([df3a5d5](https://github.com/aurelia/aurelia/commit/df3a5d5))
* **bench-apps:** measurement ([ae4ecaf](https://github.com/aurelia/aurelia/commit/ae4ecaf))
* **viewport-agent:** utilize controller lifecycle linkage ([8e72222](https://github.com/aurelia/aurelia/commit/8e72222))
* **router:** remove guard-hooks option ([054f0a7](https://github.com/aurelia/aurelia/commit/054f0a7))
* **router:** port of PR #845 ([a67d0a2](https://github.com/aurelia/aurelia/commit/a67d0a2))

<a name="0.8.0"></a>
# 0.8.0 (2020-11-30)

### Features:

* **templating-syntax:** ability to define custom bind to two way transform ([aa5a693](https://github.com/aurelia/aurelia/commit/aa5a693))
* **computed:** no type check proxy, reorg args order ([6f3d36f](https://github.com/aurelia/aurelia/commit/6f3d36f))
* **array:** handle sort, better perf for checking obj type ([e2f6a4e](https://github.com/aurelia/aurelia/commit/e2f6a4e))
* **proxy:** ensure not wrapping built in class with special slots ([52d2e39](https://github.com/aurelia/aurelia/commit/52d2e39))
* **watch:** export switcher, add basic tests ([3d9ae50](https://github.com/aurelia/aurelia/commit/3d9ae50))
* **controller:** enable shadowDOM and containerless for host-less components ([89856c4](https://github.com/aurelia/aurelia/commit/89856c4))
* **kernel:** add module analyzer ([3fa12d1](https://github.com/aurelia/aurelia/commit/3fa12d1))
* **kernel:** add inheritParentResources config option ([b7a07a9](https://github.com/aurelia/aurelia/commit/b7a07a9))
* **i18n:** dedicated API for locale subscribption ([06a3cef](https://github.com/aurelia/aurelia/commit/06a3cef))
* ***:** allow configurable dirty check for el observation ([5636608](https://github.com/aurelia/aurelia/commit/5636608))
* **watch:** add more coverage, correct array[Symbol.iterator] values ([eb94e63](https://github.com/aurelia/aurelia/commit/eb94e63))
* **kernel:** add resource create/find api's to the container ([1cab5bb](https://github.com/aurelia/aurelia/commit/1cab5bb))
* **watch:** add handler for reverse, add tests for mutation methods ([d51fa9b](https://github.com/aurelia/aurelia/commit/d51fa9b))
* **watch:** add [].includes/.every() ([bf8624e](https://github.com/aurelia/aurelia/commit/bf8624e))
* **runtime-html:** add IEventTarget interface to specify event delegate target ([90b804c](https://github.com/aurelia/aurelia/commit/90b804c))
* **watch:** ability to disable proxy ([701b8ac](https://github.com/aurelia/aurelia/commit/701b8ac))
* **aurelia:** export PLATFORM global ([7f666c8](https://github.com/aurelia/aurelia/commit/7f666c8))
* **watch:** basic tests for computed observation ([ed56551](https://github.com/aurelia/aurelia/commit/ed56551))
* **proxy-obs:** export proxy obs, @watch ([5444309](https://github.com/aurelia/aurelia/commit/5444309))
* **watch:** handle collection delete ([3a8c670](https://github.com/aurelia/aurelia/commit/3a8c670))
* **ast:** allow accessscope to have PropertyKey as name ([526456e](https://github.com/aurelia/aurelia/commit/526456e))
* **watch:** wrap before invoke in computed watcher, ([ff2abc7](https://github.com/aurelia/aurelia/commit/ff2abc7))
* **watch:** refactor proxy observation, use watcher ([7c2cdc0](https://github.com/aurelia/aurelia/commit/7c2cdc0))
* **watch:** implement computed & expression watchers ([6a0a265](https://github.com/aurelia/aurelia/commit/6a0a265))
* **watch:** enhance IWatcher contract ([8ad136e](https://github.com/aurelia/aurelia/commit/8ad136e))
* **watch:** move things around for more efficient minification ([7fdee3a](https://github.com/aurelia/aurelia/commit/7fdee3a))
* **watch:** prepare for watch definition ([35619ca](https://github.com/aurelia/aurelia/commit/35619ca))
* **scheduler:** always await promises for yielding, and rename 'async' to 'suspend' to more accurately represent its purpose ([ad14017](https://github.com/aurelia/aurelia/commit/ad14017))
* **platform-browser:** initial impl ([3600faa](https://github.com/aurelia/aurelia/commit/3600faa))
* **platform:** add performanceNow property ([3514e04](https://github.com/aurelia/aurelia/commit/3514e04))
* **platform:** add console property ([9c5cfd5](https://github.com/aurelia/aurelia/commit/9c5cfd5))
* **platform:** initial platform impl with WindowOrWorkerOrGlobalScope properties ([a978c3c](https://github.com/aurelia/aurelia/commit/a978c3c))
* **ast:** ability to connect in evaluate ([63e7dec](https://github.com/aurelia/aurelia/commit/63e7dec))
* **observable:** ensure works with binding ([c74716f](https://github.com/aurelia/aurelia/commit/c74716f))
* **lifecycle-task:** add beforeDeactivate and afterDeactivate ([79282ad](https://github.com/aurelia/aurelia/commit/79282ad))
* ***:** add dispose() method to Aurelia, CompositionRoot & Container ([39374de](https://github.com/aurelia/aurelia/commit/39374de))
* **setter:** add notifier ([78c04fb](https://github.com/aurelia/aurelia/commit/78c04fb))
* **observable:** add converter, fix linting issues ([9b7492c](https://github.com/aurelia/aurelia/commit/9b7492c))
* **observable:** implement observable decorator ([0ecb9e3](https://github.com/aurelia/aurelia/commit/0ecb9e3))
* **setter-observer:** separate start/stop from subscribe, ([c895f93](https://github.com/aurelia/aurelia/commit/c895f93))
* **di:** report InterfaceSymbol friendly name when converted to string ([a66882b](https://github.com/aurelia/aurelia/commit/a66882b))
* **router:** review async in lifecycle hooks ([4c25d16](https://github.com/aurelia/aurelia/commit/4c25d16))
* **router:** add  swap & use coordinator and runner ([70d97a3](https://github.com/aurelia/aurelia/commit/70d97a3))
* **router:** add navigation coordinator ([071dc5f](https://github.com/aurelia/aurelia/commit/071dc5f))
* **router:** add runner ([a4f0310](https://github.com/aurelia/aurelia/commit/a4f0310))
* **runtime-html:** add interfaces for IWindow, IHistory, ILocation ([5273d0a](https://github.com/aurelia/aurelia/commit/5273d0a))
* **runtime:** add cancel api and properly propagate async errors ([3c05ebe](https://github.com/aurelia/aurelia/commit/3c05ebe))
* **kernel:** add onResolve and resolveAll functions ([b76ff2e](https://github.com/aurelia/aurelia/commit/b76ff2e))
* **runtime:** add dispose flag for disposing controllers asap after unbind ([8a97e61](https://github.com/aurelia/aurelia/commit/8a97e61))
* **runtime:** add beforeCompileChildren startup hook ([d28b9d1](https://github.com/aurelia/aurelia/commit/d28b9d1))
* **runtime:** add component tree visitor infra ([5dd0f67](https://github.com/aurelia/aurelia/commit/5dd0f67))
* **aurelia:** add CompositionRoot resolver ([8c59df0](https://github.com/aurelia/aurelia/commit/8c59df0))
* **runtime:** add support for automatic partial lifecycle cancellation ([ada5ac7](https://github.com/aurelia/aurelia/commit/ada5ac7))
* **runtime:** await promises returned by 'beforeDetach' and 'afterAttach' ([b6bb2e3](https://github.com/aurelia/aurelia/commit/b6bb2e3))
* **runtime:** implement/wireup dispose hook ([1e1819e](https://github.com/aurelia/aurelia/commit/1e1819e))
* **runtime:** add afterDetach hook ([239c7d4](https://github.com/aurelia/aurelia/commit/239c7d4))
* **runtime:** add afterAttach hook ([e3e9167](https://github.com/aurelia/aurelia/commit/e3e9167))
* **runtime:** add afterUnbind hook ([55484f9](https://github.com/aurelia/aurelia/commit/55484f9))
* **runtime:** add afterBind hook ([47ff91f](https://github.com/aurelia/aurelia/commit/47ff91f))
* **scheduler:** add support for internally awaited async tasks ([da37231](https://github.com/aurelia/aurelia/commit/da37231))
* **ct-get-all:** ability to traverse when get all ([5d479f4](https://github.com/aurelia/aurelia/commit/5d479f4))
* **testing:** overload assert.isSchedulerEmpty with empty before throw ([b926ad1](https://github.com/aurelia/aurelia/commit/b926ad1))
* **testing:** add scheduler emptier ([81cec43](https://github.com/aurelia/aurelia/commit/81cec43))
* ***:** first working draft of au-switch ([c665c8e](https://github.com/aurelia/aurelia/commit/c665c8e))
* **observation:** move scheduling to bindings ([3237d3d](https://github.com/aurelia/aurelia/commit/3237d3d))
* **observation:** move scheduling to bindings ([6394674](https://github.com/aurelia/aurelia/commit/6394674))
* **obs-type:** add type & last update to all observers in runtime-html ([2f7feb8](https://github.com/aurelia/aurelia/commit/2f7feb8))
* **obs-type:** add type property to all observers in runtime ([8723299](https://github.com/aurelia/aurelia/commit/8723299))
* **obs-type:** add const enum ObserverType to runtime ([c30a267](https://github.com/aurelia/aurelia/commit/c30a267))
* **metadata:** add some config options for dealing with unsolvable conflicts ([7d5a4af](https://github.com/aurelia/aurelia/commit/7d5a4af))
* **di:** add scoped decorator ([1c20d51](https://github.com/aurelia/aurelia/commit/1c20d51))
* **di:** remove jitRegisterInRoot ([d8dd7d8](https://github.com/aurelia/aurelia/commit/d8dd7d8))
* **jit-html:** local template ([fa84742](https://github.com/aurelia/aurelia/commit/fa84742))
* ***:** enhance API ([976ae0c](https://github.com/aurelia/aurelia/commit/976ae0c))
* **http-server:** cache-control support ([e1eb156](https://github.com/aurelia/aurelia/commit/e1eb156))
* **runtime-node:** autoindex ([49b97ca](https://github.com/aurelia/aurelia/commit/49b97ca))
* **runtime-node:** ssl support ([f2af407](https://github.com/aurelia/aurelia/commit/f2af407))
* **runtime-node:** compression support ([39fd056](https://github.com/aurelia/aurelia/commit/39fd056))
* **au:** support for configuration file ([7413467](https://github.com/aurelia/aurelia/commit/7413467))
* ***:** http/2 with Push ([c97a4bd](https://github.com/aurelia/aurelia/commit/c97a4bd))


### Bug Fixes:

* **binding:** add interceptor to binding mediator ([01abd35](https://github.com/aurelia/aurelia/commit/01abd35))
* ***:** tests, remove unused vars ([dfe9e30](https://github.com/aurelia/aurelia/commit/dfe9e30))
* **binding-interceptor:** expand connectable deco ([24de181](https://github.com/aurelia/aurelia/commit/24de181))
* **syntax-extension:** tweak two mapping, add some more comments ([f267f68](https://github.com/aurelia/aurelia/commit/f267f68))
* ***:** build issue with node ([be6462d](https://github.com/aurelia/aurelia/commit/be6462d))
* **style-accessor-for-custom-properties' of http:** //github.com/aurelia/aurelia into fix-style-accessor-for-custom-properties ([e210496](https://github.com/aurelia/aurelia/commit/e210496))
* **tests:** node tests should skip url tests ([53d692f](https://github.com/aurelia/aurelia/commit/53d692f))
* **style-attribute-accessor:** handle prop and url ([89c878a](https://github.com/aurelia/aurelia/commit/89c878a))
* ***:** linting issues ([e2fa345](https://github.com/aurelia/aurelia/commit/e2fa345))
* **observer-loc:** new api for overriding accessors ([8af6c46](https://github.com/aurelia/aurelia/commit/8af6c46))
* ***:** tweak tests to adapt the removal of computed deco ([dc6a5bd](https://github.com/aurelia/aurelia/commit/dc6a5bd))
* **computed:** throw on set for readonly ([b84030e](https://github.com/aurelia/aurelia/commit/b84030e))
* ***:** update trigger uses NodeObserverConfig ([b06fad0](https://github.com/aurelia/aurelia/commit/b06fad0))
* ***:** delay default configuration ([02134f7](https://github.com/aurelia/aurelia/commit/02134f7))
* ***:** alias node observer registration ([7541638](https://github.com/aurelia/aurelia/commit/7541638))
* **update-trigger:** get all original handler config ([228c0a8](https://github.com/aurelia/aurelia/commit/228c0a8))
* **tests:** adapt el observation changes ([5660d17](https://github.com/aurelia/aurelia/commit/5660d17))
* **tests:** adapt el observation changes ([7ac6f4a](https://github.com/aurelia/aurelia/commit/7ac6f4a))
* **test-builder:** remove leftover imports ([54fa103](https://github.com/aurelia/aurelia/commit/54fa103))
* **select-observer:** correctly toggle observing status ([7f45560](https://github.com/aurelia/aurelia/commit/7f45560))
* **shadow-dom-registry:** remove StyleElementStylesFactory incorrect guard ([288a2a0](https://github.com/aurelia/aurelia/commit/288a2a0))
* **controller:** add controller metadata to host ([9f1b23a](https://github.com/aurelia/aurelia/commit/9f1b23a))
* ***:** linting issue ([879ad8f](https://github.com/aurelia/aurelia/commit/879ad8f))
* ***:** disabled template controllers on local template surrogate ([62a45b9](https://github.com/aurelia/aurelia/commit/62a45b9))
* **switch:** add missing accept impl ([d497214](https://github.com/aurelia/aurelia/commit/d497214))
* **portal:** fallback to body on empty string querySelector ([8783bb3](https://github.com/aurelia/aurelia/commit/8783bb3))
* **switch:** pass initiator through for correct deactivate hook timings ([3ea306c](https://github.com/aurelia/aurelia/commit/3ea306c))
* **aurelia:** move controller dispose to stop() hook via a flag ([4305a7d](https://github.com/aurelia/aurelia/commit/4305a7d))
* **connectable:** correctly change slots ([4542f01](https://github.com/aurelia/aurelia/commit/4542f01))
* **http-server:** linting issue ([2f77f10](https://github.com/aurelia/aurelia/commit/2f77f10))
* **http-server:** accept header parsing ([d468f2b](https://github.com/aurelia/aurelia/commit/d468f2b))
* ***:** linting issue ([98089f3](https://github.com/aurelia/aurelia/commit/98089f3))
* ***:** post-merge build error ([951682f](https://github.com/aurelia/aurelia/commit/951682f))
* **platform:** remove dom-specific type deps ([115666c](https://github.com/aurelia/aurelia/commit/115666c))
* **platform:** don't throw on initialization for missing functions ([5b00b79](https://github.com/aurelia/aurelia/commit/5b00b79))
* ***:** tweak e2e based on latest refactoring ([5f4e335](https://github.com/aurelia/aurelia/commit/5f4e335))
* ***:** use interface instead ([9fc8323](https://github.com/aurelia/aurelia/commit/9fc8323))
* **conventions:** update package imports ([8e91cc3](https://github.com/aurelia/aurelia/commit/8e91cc3))
* **aurelia:** use PLATFORM.getOrCreate(globalThis) instead of new with window ([56c65e5](https://github.com/aurelia/aurelia/commit/56c65e5))
* ***:** eslint issue ([cd4e65f](https://github.com/aurelia/aurelia/commit/cd4e65f))
* ***:** deepscan issues ([37f436d](https://github.com/aurelia/aurelia/commit/37f436d))
* ***:** correction ([c0429ff](https://github.com/aurelia/aurelia/commit/c0429ff))
* ***:** build failure ([59ece95](https://github.com/aurelia/aurelia/commit/59ece95))
* ***:** streamlined the push state to a middleware ([531fb39](https://github.com/aurelia/aurelia/commit/531fb39))
* **task:** return to pool as late as possible to prevent race condition ([f161781](https://github.com/aurelia/aurelia/commit/f161781))
* ***:** binding-context choice ([de50639](https://github.com/aurelia/aurelia/commit/de50639))
* **watcher:** only run when bound ([7d509ff](https://github.com/aurelia/aurelia/commit/7d509ff))
* ***:** failing tests ([310f47a](https://github.com/aurelia/aurelia/commit/310f47a))
* **watch:** observe in .some() too ([e72c0db](https://github.com/aurelia/aurelia/commit/e72c0db))
* **event-manager:** properly handle delegate events with shadowDOM / cleanup ([b79e7ba](https://github.com/aurelia/aurelia/commit/b79e7ba))
* **watch:** use peek watcher ([09d6f8b](https://github.com/aurelia/aurelia/commit/09d6f8b))
* **computed:** use a simple boolean to prevent side effects ([af3f791](https://github.com/aurelia/aurelia/commit/af3f791))
* ***:** deepscan issue ([807a866](https://github.com/aurelia/aurelia/commit/807a866))
* **computed-obs:** no eager subscription ([fbcfd08](https://github.com/aurelia/aurelia/commit/fbcfd08))
* **connectable:** ensure default version, set slot count correctly ([3bcde57](https://github.com/aurelia/aurelia/commit/3bcde57))
* **build:** cast to string in validation ([26c41f8](https://github.com/aurelia/aurelia/commit/26c41f8))
* **computed:** remove all observers on unbind ([4cb43c5](https://github.com/aurelia/aurelia/commit/4cb43c5))
* **unparser:** use String() ([1cb7209](https://github.com/aurelia/aurelia/commit/1cb7209))
* **watch:** set collecting on early return too ([86a8c5e](https://github.com/aurelia/aurelia/commit/86a8c5e))
* **watch:** resolve callback properly in watchers ([a44f611](https://github.com/aurelia/aurelia/commit/a44f611))
* ***:** deepscan issues ([813c5bd](https://github.com/aurelia/aurelia/commit/813c5bd))
* **observer-locator:** use instanceof instead of toStringTag for collections ([b95a36c](https://github.com/aurelia/aurelia/commit/b95a36c))
* **interpolation:** align with v1 behavior ([d601e76](https://github.com/aurelia/aurelia/commit/d601e76))
* **interpolation:** triple negative = dizzy ([bdfac9a](https://github.com/aurelia/aurelia/commit/bdfac9a))
* **interpolation:** build string in normal way ([3ad7eba](https://github.com/aurelia/aurelia/commit/3ad7eba))
* **interpolation:** use templateexpression concatenation ([43c46a2](https://github.com/aurelia/aurelia/commit/43c46a2))
* **interpolation:** properly concatenate parts ([e423f46](https://github.com/aurelia/aurelia/commit/e423f46))
* **interpolation:** properly concatenate parts ([72ba4c7](https://github.com/aurelia/aurelia/commit/72ba4c7))
* **debounce-throttle:** clean up floating tasks ([c8e5fd3](https://github.com/aurelia/aurelia/commit/c8e5fd3))
* **runtime:** export ProjectionProvider registration ([0dd58f1](https://github.com/aurelia/aurelia/commit/0dd58f1))
* **runtime:** add missing registration exports ([abe3cc4](https://github.com/aurelia/aurelia/commit/abe3cc4))
* **switch:** disallowed multiple default-case ([e92c316](https://github.com/aurelia/aurelia/commit/e92c316))
* **ast:** properly handle VC signals in evaluate with conncet merge ([e37ea2f](https://github.com/aurelia/aurelia/commit/e37ea2f))
* **ast:** tweak return type ([85f48d4](https://github.com/aurelia/aurelia/commit/85f48d4))
* **tests:** remove .only, correct assertion ([cd3c047](https://github.com/aurelia/aurelia/commit/cd3c047))
* **let:** ensure re-observe in handleChange ([5ad84fa](https://github.com/aurelia/aurelia/commit/5ad84fa))
* **binding-mode-behavior:** add hostScope param ([c846994](https://github.com/aurelia/aurelia/commit/c846994))
* **signal:** cleanup & fix buggy implementation ([78318db](https://github.com/aurelia/aurelia/commit/78318db))
* **tests:** forgot to use vc in 2 way binding ([3c4c68b](https://github.com/aurelia/aurelia/commit/3c4c68b))
* **signal:** update host scope, add interface to guard refactoring ([3447702](https://github.com/aurelia/aurelia/commit/3447702))
* **observable:** fix deepscan suggestions ([50e823a](https://github.com/aurelia/aurelia/commit/50e823a))
* **observable:** avoid using Function/Object ([157ad3e](https://github.com/aurelia/aurelia/commit/157ad3e))
* **runtime:** ignore index type for internal lookup ([68dfb78](https://github.com/aurelia/aurelia/commit/68dfb78))
* ***:** quick fix for push state on file server ([98b5805](https://github.com/aurelia/aurelia/commit/98b5805))
* ***:** i18n integration tests ([44b0ba7](https://github.com/aurelia/aurelia/commit/44b0ba7))
* **binding:** resolve merge issue ([892ff27](https://github.com/aurelia/aurelia/commit/892ff27))
* **translation-binding:** use the optional CustomElement.for api ([e8807af](https://github.com/aurelia/aurelia/commit/e8807af))
* **router:** restore router tests ([80dccfa](https://github.com/aurelia/aurelia/commit/80dccfa))
* **router:** restore router ([822838c](https://github.com/aurelia/aurelia/commit/822838c))
* **children:** add optional CustomElement.for option ([8953900](https://github.com/aurelia/aurelia/commit/8953900))
* **controller:** store CE and CA definitions for more deterministic hydration ([0291e66](https://github.com/aurelia/aurelia/commit/0291e66))
* **controller:** fix deactivate idempotency ([bda1b1c](https://github.com/aurelia/aurelia/commit/bda1b1c))
* **controller:** fix a few cancellation-related slip ups, add more tests ([472d0ae](https://github.com/aurelia/aurelia/commit/472d0ae))
* ***:** failing tests ([95414bd](https://github.com/aurelia/aurelia/commit/95414bd))
* **validation-binding-behavior:** cancel pending task on unbind ([6288382](https://github.com/aurelia/aurelia/commit/6288382))
* **scheduler:** sort out some race conditions ([49738a1](https://github.com/aurelia/aurelia/commit/49738a1))
* **scheduler:** return resolved value from promise task ([923e98e](https://github.com/aurelia/aurelia/commit/923e98e))
* **scheduler:** yield the task queues in a more sensible way ([d2985d1](https://github.com/aurelia/aurelia/commit/d2985d1))
* **scheduler:** prevent cross-queue deadlock with yieldAll() ([e81af31](https://github.com/aurelia/aurelia/commit/e81af31))
* **di-getall:** handle search ancestors in a different path, add failing tests ([edc4ba3](https://github.com/aurelia/aurelia/commit/edc4ba3))
* **ct:** optional traverse in impl too ([f5710f3](https://github.com/aurelia/aurelia/commit/f5710f3))
* **switch:** view holding and attaching ([4934627](https://github.com/aurelia/aurelia/commit/4934627))
* **switch:** holding view for fall-through ([632334a](https://github.com/aurelia/aurelia/commit/632334a))
* **switch:** failing test + another test ([d2a5fb3](https://github.com/aurelia/aurelia/commit/d2a5fb3))
* **switch:** binding for `case`s ([8f04746](https://github.com/aurelia/aurelia/commit/8f04746))
* **template-factory:** avoid modifying source ([6ffc433](https://github.com/aurelia/aurelia/commit/6ffc433))
* **switch:** default-case linking ([2720d8d](https://github.com/aurelia/aurelia/commit/2720d8d))
* ***:** build failure ([b8f9d2b](https://github.com/aurelia/aurelia/commit/b8f9d2b))
* ***:** switch-case bind,attach pipeline ([691cef6](https://github.com/aurelia/aurelia/commit/691cef6))
* **attr-binding:** store task on observer ([b8e37b3](https://github.com/aurelia/aurelia/commit/b8e37b3))
* **validation-binding-behavior:** cancel pending task on unbind ([bdec1e8](https://github.com/aurelia/aurelia/commit/bdec1e8))
* **interpolation-binding:** cancel existing before queueing new one ([71425b3](https://github.com/aurelia/aurelia/commit/71425b3))
* ***:** tweak tests back to previous stage ([2a11245](https://github.com/aurelia/aurelia/commit/2a11245))
* ***:** linting/deepscan issues ([d9b275b](https://github.com/aurelia/aurelia/commit/d9b275b))
* ***:** deepscan + linting issues ([2f75f1e](https://github.com/aurelia/aurelia/commit/2f75f1e))
* **interpolation-binding:** no reusable in bind ([8f99603](https://github.com/aurelia/aurelia/commit/8f99603))
* **property-binding:** task.run() -> task.cancel() in unbind ([a18257c](https://github.com/aurelia/aurelia/commit/a18257c))
* **interpolation-binding:** get IScheduler instead of Scheduler ([7b2fc9a](https://github.com/aurelia/aurelia/commit/7b2fc9a))
* **tests:** keep bind/unbind for now ([5a5174e](https://github.com/aurelia/aurelia/commit/5a5174e))
* **observers:** merge flags instead ([1dc7165](https://github.com/aurelia/aurelia/commit/1dc7165))
* **interpolation:** update from interpolation ast ([5bc3dba](https://github.com/aurelia/aurelia/commit/5bc3dba))
* ***:** fix build ([7ae1f1f](https://github.com/aurelia/aurelia/commit/7ae1f1f))
* ***:** ensure runtime build ([3dcc937](https://github.com/aurelia/aurelia/commit/3dcc937))
* **i18n:** failing tests in ci ([c8cb555](https://github.com/aurelia/aurelia/commit/c8cb555))
* ***:** linting issues ([5718999](https://github.com/aurelia/aurelia/commit/5718999))
* ***:** deepscap issues ([e35e20e](https://github.com/aurelia/aurelia/commit/e35e20e))
* ***:** i18n df tests as per Vildan's suggestion ([62a9ad8](https://github.com/aurelia/aurelia/commit/62a9ad8))
* ***:** template-compiler - au-slot tests ([1f00af5](https://github.com/aurelia/aurelia/commit/1f00af5))
* ***:** template-binder.au-slot tests ([87fa00b](https://github.com/aurelia/aurelia/commit/87fa00b))
* **validation:** au-slot integration tests ([12c80ae](https://github.com/aurelia/aurelia/commit/12c80ae))
* **au-slot:** projection plumbing ([dd7f8b4](https://github.com/aurelia/aurelia/commit/dd7f8b4))
* ***:** broken tests ([3a73602](https://github.com/aurelia/aurelia/commit/3a73602))
* **jit:** broken tests ([1f7dc11](https://github.com/aurelia/aurelia/commit/1f7dc11))
* **runtime:** broken tests ([1d11be7](https://github.com/aurelia/aurelia/commit/1d11be7))
* ***:** the projection plumbing via scope ([e79194b](https://github.com/aurelia/aurelia/commit/e79194b))
* **metadata:** fix slot name check thing ([5bd3eac](https://github.com/aurelia/aurelia/commit/5bd3eac))
* **au-slot:** corrected compilation ([6235f7f](https://github.com/aurelia/aurelia/commit/6235f7f))
* **au-slot:** plumbing for slot-name ([400bcd9](https://github.com/aurelia/aurelia/commit/400bcd9))
* **au-slot:** projections plumbing ([786fdb5](https://github.com/aurelia/aurelia/commit/786fdb5))
* **au-slot:** plumbing of prjection fallback ([2c50293](https://github.com/aurelia/aurelia/commit/2c50293))
* **jit-html:** avoided kebab-casing for bindable instructions for local template ([e7b8ed0](https://github.com/aurelia/aurelia/commit/e7b8ed0))
* **jit-html:** tests for local template ([68a181b](https://github.com/aurelia/aurelia/commit/68a181b))
* ***:** deepscan issue ([2e3f814](https://github.com/aurelia/aurelia/commit/2e3f814))
* ***:** ducktype checking for nodelist ([b6d650a](https://github.com/aurelia/aurelia/commit/b6d650a))
* **di:** registerFactory #822 ([4ac6543](https://github.com/aurelia/aurelia/commit/4ac6543))
* ***:** build issue ([3f93359](https://github.com/aurelia/aurelia/commit/3f93359))
* ***:** cli arg parsing ([edeeceb](https://github.com/aurelia/aurelia/commit/edeeceb))
* ***:** serve script ([6133b45](https://github.com/aurelia/aurelia/commit/6133b45))
* ** buil:** release ([e751152](https://github.com/aurelia/aurelia/commit/e751152))
* ***:** linting issue ([8c14745](https://github.com/aurelia/aurelia/commit/8c14745))
* ***:** versions ([7f4cae6](https://github.com/aurelia/aurelia/commit/7f4cae6))
* ***:** packages wireup ([2ecb2e0](https://github.com/aurelia/aurelia/commit/2ecb2e0))
* ***:** 2 deepscan issues ([1e74059](https://github.com/aurelia/aurelia/commit/1e74059))
* **runtime-node:** compression support ([3953279](https://github.com/aurelia/aurelia/commit/3953279))


### Performance Improvements:

* **controller:** use stack to minimize promise tick overhead ([2cac413](https://github.com/aurelia/aurelia/commit/2cac413))
* **task-queue:** use numeric status ([49d9156](https://github.com/aurelia/aurelia/commit/49d9156))
* **scheduler:** make tracer instance-based and avoid unnecessary calls ([20d0196](https://github.com/aurelia/aurelia/commit/20d0196))
* **bindings:** use eval/connect merge ([da4b49d](https://github.com/aurelia/aurelia/commit/da4b49d))
* **ast:** reduce polymorphism in evaluate calls ([489953f](https://github.com/aurelia/aurelia/commit/489953f))
* **ast:** use getters instead of instance properties for $kind ([a488dbd](https://github.com/aurelia/aurelia/commit/a488dbd))


### Refactorings:

* ***:** remove commented code, fix linting issues ([40f73d8](https://github.com/aurelia/aurelia/commit/40f73d8))
* **binding:** fix mock binding build ([73aa6dd](https://github.com/aurelia/aurelia/commit/73aa6dd))
* **binding:** adapt changes in runtime for i18n ([f3c174a](https://github.com/aurelia/aurelia/commit/f3c174a))
* **binding:** adapt obs record on attribute binding ([eddb58f](https://github.com/aurelia/aurelia/commit/eddb58f))
* **binding:** chore try use an obs record ([1a93644](https://github.com/aurelia/aurelia/commit/1a93644))
* ***:** fix build issues ([2ffbd3f](https://github.com/aurelia/aurelia/commit/2ffbd3f))
* **bindings:** use ??= instead ([830fdf5](https://github.com/aurelia/aurelia/commit/830fdf5))
* **bindings:** optimize task queue update a bit more ([842ab26](https://github.com/aurelia/aurelia/commit/842ab26))
* **prop-accessor:** simplify property accessor ([d19c0aa](https://github.com/aurelia/aurelia/commit/d19c0aa))
* **bindings:** always cache source value in binding ([9d3aad2](https://github.com/aurelia/aurelia/commit/9d3aad2))
* **aurelia:** re-export AppTask and IAttrSyntaxTransformer ([433a8bc](https://github.com/aurelia/aurelia/commit/433a8bc))
* ***:** timing for binding state of controller ([4eb09f7](https://github.com/aurelia/aurelia/commit/4eb09f7))
* **bindable:** let bindable take action based on controller ([a42949f](https://github.com/aurelia/aurelia/commit/a42949f))
* **attr-syntax-transformer:** adapt code review merge, make interpret independent again ([1e09e9c](https://github.com/aurelia/aurelia/commit/1e09e9c))
* **collection:** make lifecycle optionial, more type imports re-org ([9f8b189](https://github.com/aurelia/aurelia/commit/9f8b189))
* **tests:** adapt runtime flags removal ([064deba](https://github.com/aurelia/aurelia/commit/064deba))
* **i18n-router:** adapt runtime flag refactoring ([8e2d7e7](https://github.com/aurelia/aurelia/commit/8e2d7e7))
* **validation:** adapt runtime refactoring ([85e4b8e](https://github.com/aurelia/aurelia/commit/85e4b8e))
* **testing:** adapt runtime refactoring ([5d2b1f6](https://github.com/aurelia/aurelia/commit/5d2b1f6))
* **runtime-html:** remove unnecessary flag requirements ([86e8e9e](https://github.com/aurelia/aurelia/commit/86e8e9e))
* **runtime:** remove unnecessary flag requirements ([46a491a](https://github.com/aurelia/aurelia/commit/46a491a))
* **obs:** don't use Proxy on platform ([f7882e0](https://github.com/aurelia/aurelia/commit/f7882e0))
* **obs:** reorg imports, always try get adapter first ([69beda1](https://github.com/aurelia/aurelia/commit/69beda1))
* ***:** separate type import for runtime ([f1fd69f](https://github.com/aurelia/aurelia/commit/f1fd69f))
* **watch-proxy:** use short name for wrap/unwrap ([944c5d9](https://github.com/aurelia/aurelia/commit/944c5d9))
* **dom:** allow parent-less nodes to be converted to render locations ([68aef8f](https://github.com/aurelia/aurelia/commit/68aef8f))
* ***:** change import to import type, cleaning typings ([9854438](https://github.com/aurelia/aurelia/commit/9854438))
* **computed-observer:** correctly call subscribers when set ([8497f38](https://github.com/aurelia/aurelia/commit/8497f38))
* **dom:** give INode, IEventTarget and IRenderLocation overrideable generic types ([e2ac8b2](https://github.com/aurelia/aurelia/commit/e2ac8b2))
* **testing:** improve/simplify shadow-piercing text assert ([bdba8ba](https://github.com/aurelia/aurelia/commit/bdba8ba))
* ***:** remove persistent flags ([ffba588](https://github.com/aurelia/aurelia/commit/ffba588))
* ***:** return in try block for watchers ([78032f0](https://github.com/aurelia/aurelia/commit/78032f0))
* **all:** add .js extensions for native esm compat ([0308e2e](https://github.com/aurelia/aurelia/commit/0308e2e))
* **module-loader:** cache per transform function ([3c90743](https://github.com/aurelia/aurelia/commit/3c90743))
* **el-observation:** tweak imports ([31886ef](https://github.com/aurelia/aurelia/commit/31886ef))
* **el-observation:** allow different observer ctor config ([161b544](https://github.com/aurelia/aurelia/commit/161b544))
* **module-analyzer:** rename, cleanup, add tests ([1d3c8bf](https://github.com/aurelia/aurelia/commit/1d3c8bf))
* **node-observation:** move interface to runtime-html ([42626f8](https://github.com/aurelia/aurelia/commit/42626f8))
* ***:** remove all ast.connect() ([54b4718](https://github.com/aurelia/aurelia/commit/54b4718))
* **validation:** merge evaluate & connect, more efficient handling of classes ([7803dc6](https://github.com/aurelia/aurelia/commit/7803dc6))
* ***:** use readonly from config ([b88e102](https://github.com/aurelia/aurelia/commit/b88e102))
* **i18n:** use separate binding for parameters, ([cb86d44](https://github.com/aurelia/aurelia/commit/cb86d44))
* ***:** better lookup for el obs loc ([9c5197c](https://github.com/aurelia/aurelia/commit/9c5197c))
* **observation:** simplified el observers/accessors more ([e818e2f](https://github.com/aurelia/aurelia/commit/e818e2f))
* **node-observation:** merge target observer/accessor, ([2c318ee](https://github.com/aurelia/aurelia/commit/2c318ee))
* **accessors:** no cache in accessors ([2640c38](https://github.com/aurelia/aurelia/commit/2640c38))
* **i18n-binding:** pass obj & key to set value ([1e69e48](https://github.com/aurelia/aurelia/commit/1e69e48))
* **interpolation:** works similar to other bindings ([ad9c2ee](https://github.com/aurelia/aurelia/commit/ad9c2ee))
* **checked-observer:** make non-layout ([b75d6a8](https://github.com/aurelia/aurelia/commit/b75d6a8))
* **accessors:** more static accessors ([6d83921](https://github.com/aurelia/aurelia/commit/6d83921))
* **prop/attr-bindings:** always call update ([3fd75c8](https://github.com/aurelia/aurelia/commit/3fd75c8))
* **select-observer:** remove flags & task props ([0622450](https://github.com/aurelia/aurelia/commit/0622450))
* **select-observer:** remove dedundant handler/methods, add more mutation test ([28c5fe2](https://github.com/aurelia/aurelia/commit/28c5fe2))
* **all:** rename noTargetQueue flag, remove infrequent mutationtc ([edfd2a4](https://github.com/aurelia/aurelia/commit/edfd2a4))
* ***:** post-review changes ([d484bd6](https://github.com/aurelia/aurelia/commit/d484bd6))
* **obervers:** remove task property of IAccessor ([affd9d1](https://github.com/aurelia/aurelia/commit/affd9d1))
* **runtime:** ensure non-enumerable method by decor ([e8e79ff](https://github.com/aurelia/aurelia/commit/e8e79ff))
* **controller:** remove bindingContext property ([3cb6a32](https://github.com/aurelia/aurelia/commit/3cb6a32))
* **styles:** move style related stuff to single file ([80a6381](https://github.com/aurelia/aurelia/commit/80a6381))
* **lifecycle:** move types to controller file ([93fdb7e](https://github.com/aurelia/aurelia/commit/93fdb7e))
* **controller:** remove projector abstraction & rework attaching ([d69d03d](https://github.com/aurelia/aurelia/commit/d69d03d))
* **projector:** inline take() ([189064a](https://github.com/aurelia/aurelia/commit/189064a))
* **projector-locator:** merge into controller ([2577af5](https://github.com/aurelia/aurelia/commit/2577af5))
* **instructions:** move instructions to renderer file ([3b71a44](https://github.com/aurelia/aurelia/commit/3b71a44))
* **instructions:** merge listener instructions into one class ([5ef5e2e](https://github.com/aurelia/aurelia/commit/5ef5e2e))
* **instructions:** declare instr type as getters ([97c5900](https://github.com/aurelia/aurelia/commit/97c5900))
* **all:** remove binding strategy export ([cd258cd](https://github.com/aurelia/aurelia/commit/cd258cd))
* **all:** remove strategy configuration ([0ae57c0](https://github.com/aurelia/aurelia/commit/0ae57c0))
* **instructions:** merge to-view, two-way, from-view and one-time ([4a12c1d](https://github.com/aurelia/aurelia/commit/4a12c1d))
* **tests:** remove binding strategy test vector ([328f754](https://github.com/aurelia/aurelia/commit/328f754))
* **resource-model:** merge with semantic-model file ([c497c16](https://github.com/aurelia/aurelia/commit/c497c16))
* ***:** remove proxy decorator, cleanup interfaces ([fb05ccf](https://github.com/aurelia/aurelia/commit/fb05ccf))
* ***:** remove references to proxy strategy & proxy observer ([b1dfe93](https://github.com/aurelia/aurelia/commit/b1dfe93))
* **attribute-pattern:** merge the two files ([437d5e4](https://github.com/aurelia/aurelia/commit/437d5e4))
* **binding-command:** move to resources folder ([f9d20de](https://github.com/aurelia/aurelia/commit/f9d20de))
* **attribute-pattern:** move to resources folder ([df52acf](https://github.com/aurelia/aurelia/commit/df52acf))
* **templating:** remove hooks from CE definition ([dcd2762](https://github.com/aurelia/aurelia/commit/dcd2762))
* **render-context:** rename compose to render ([f839165](https://github.com/aurelia/aurelia/commit/f839165))
* **templating:** remove ResourceModel ([e4f2042](https://github.com/aurelia/aurelia/commit/e4f2042))
* **all:** rename beforeUnbind to unbinding ([17a82ed](https://github.com/aurelia/aurelia/commit/17a82ed))
* **all:** rename beforeDetach to detaching ([0fcb64d](https://github.com/aurelia/aurelia/commit/0fcb64d))
* **all:** rename afterAttach to attaching ([0178027](https://github.com/aurelia/aurelia/commit/0178027))
* **all:** rename afterAttachChildren to attached ([9e6e97e](https://github.com/aurelia/aurelia/commit/9e6e97e))
* **all:** rename afterBind to bound ([696f5d4](https://github.com/aurelia/aurelia/commit/696f5d4))
* **all:** rename beforeBind to binding ([67b1c5d](https://github.com/aurelia/aurelia/commit/67b1c5d))
* **runtime-html:** rename InstructionComposer to Renderer and remove Composer abstraction ([6499d31](https://github.com/aurelia/aurelia/commit/6499d31))
* **all:** rename CompositionContext back to RenderContext again ([1d7673b](https://github.com/aurelia/aurelia/commit/1d7673b))
* **controller:** rename compileChildren to hydrateChildren ([4b6fddb](https://github.com/aurelia/aurelia/commit/4b6fddb))
* **controller:** rename compile to hydrate ([868d125](https://github.com/aurelia/aurelia/commit/868d125))
* **controller:** rename afterCompose to created ([02e9412](https://github.com/aurelia/aurelia/commit/02e9412))
* **controller:** rename beforeComposeChildren to hydrated ([041a2ff](https://github.com/aurelia/aurelia/commit/041a2ff))
* **controller:** rename beforeCompose to hydrating ([64b405e](https://github.com/aurelia/aurelia/commit/64b405e))
* **all:** remove afterUnbind and afterUnbindChildren, and make deactivate bottom-up ([a431fdc](https://github.com/aurelia/aurelia/commit/a431fdc))
* **controller:** simplify activate/deactivate ([b839126](https://github.com/aurelia/aurelia/commit/b839126))
* **controller:** peel out cancellation for now ([bbf6c92](https://github.com/aurelia/aurelia/commit/bbf6c92))
* **controller:** remove cancel api for now ([367f6c3](https://github.com/aurelia/aurelia/commit/367f6c3))
* **all:** simplify update flags ([5c2cc3a](https://github.com/aurelia/aurelia/commit/5c2cc3a))
* **all:** rename RuntimeHtmlConfiguration to StandardConfiguration ([665f3ba](https://github.com/aurelia/aurelia/commit/665f3ba))
* **all:** move scheduler implementation to platform ([e22285a](https://github.com/aurelia/aurelia/commit/e22285a))
* **scheduler:** use array instead of linkedlist ([41ef05c](https://github.com/aurelia/aurelia/commit/41ef05c))
* **task-queue:** remove the take() api ([892978a](https://github.com/aurelia/aurelia/commit/892978a))
* **scheduler:** remove ITaskQueue interface ([5b7b276](https://github.com/aurelia/aurelia/commit/5b7b276))
* **scheduler:** remove microtask priority ([c95b7f6](https://github.com/aurelia/aurelia/commit/c95b7f6))
* **all:** remove IDOM, HTMLDOM and DOM; replace DOM with PLATFORM ([6447468](https://github.com/aurelia/aurelia/commit/6447468))
* **plugin-svg:** cleanup and move to runtime-html as a registration ([55a3938](https://github.com/aurelia/aurelia/commit/55a3938))
* **fetch-client:** remove dom dep ([fa511d4](https://github.com/aurelia/aurelia/commit/fa511d4))
* **all:** move html-specific stuff from runtime to runtime-html and remove Node generics ([c745963](https://github.com/aurelia/aurelia/commit/c745963))
* **all:** remove debug package ([a1bdb60](https://github.com/aurelia/aurelia/commit/a1bdb60))
* **all:** remove PLATFORM global ([fdef656](https://github.com/aurelia/aurelia/commit/fdef656))
* **test:** cleanup setup code and add basic instrumentation ([9f009e3](https://github.com/aurelia/aurelia/commit/9f009e3))
* **watch:** rename observeProperty -> observe, fix linting issues ([32ea361](https://github.com/aurelia/aurelia/commit/32ea361))
* **platform:** remove hasOwnProperty ([90d95d5](https://github.com/aurelia/aurelia/commit/90d95d5))
* **platform:** remove isBrowserLike and run browser-specific tests in node ([2ce90dd](https://github.com/aurelia/aurelia/commit/2ce90dd))
* **platform:** remove isNodeLike ([ef19903](https://github.com/aurelia/aurelia/commit/ef19903))
* **platform:** remove isWebWorkerLike ([622c34b](https://github.com/aurelia/aurelia/commit/622c34b))
* **dom:** remove setAttribute ([5cd8905](https://github.com/aurelia/aurelia/commit/5cd8905))
* **dom:** remove removeEventListener ([1179737](https://github.com/aurelia/aurelia/commit/1179737))
* **dom:** remove addEventListener ([706a833](https://github.com/aurelia/aurelia/commit/706a833))
* **event-manager:** rename EventManager to EventDelegator ([9150bb4](https://github.com/aurelia/aurelia/commit/9150bb4))
* **listener-tracker:** subscribe with EventListenerObject instead ([e100eb4](https://github.com/aurelia/aurelia/commit/e100eb4))
* ***:** wip fix for the scope traversal issue ([f93da3c](https://github.com/aurelia/aurelia/commit/f93da3c))
* **dom:** remove DOM.createNodeObserver ([2dc0282](https://github.com/aurelia/aurelia/commit/2dc0282))
* ***:** tweak tests ([cf44170](https://github.com/aurelia/aurelia/commit/cf44170))
* **watch:** rename ariables, tweak typings ([675cecb](https://github.com/aurelia/aurelia/commit/675cecb))
* **runtime:** rename afterCompileChildren to afterCompose ([d8d940a](https://github.com/aurelia/aurelia/commit/d8d940a))
* **runtime:** rename afterCompose to beforeComposeChildren ([f65bb7b](https://github.com/aurelia/aurelia/commit/f65bb7b))
* **runtime:** rename beforeCompile to beforeCompose ([570a9ab](https://github.com/aurelia/aurelia/commit/570a9ab))
* **runtime:** rename create to define ([d2d9cba](https://github.com/aurelia/aurelia/commit/d2d9cba))
* **watch:** create watcher at start of  hydration, add tests for expression ([48dd4e9](https://github.com/aurelia/aurelia/commit/48dd4e9))
* **watch:** tweak validation ([4a5f0b1](https://github.com/aurelia/aurelia/commit/4a5f0b1))
* **switch:** registration ([0258041](https://github.com/aurelia/aurelia/commit/0258041))
* **watch:** rename some interfaces ([7c6f442](https://github.com/aurelia/aurelia/commit/7c6f442))
* **watch:** handle array auto obs ([89931da](https://github.com/aurelia/aurelia/commit/89931da))
* **watch:** idempotent bind, unbind, conciser names ([d958ccf](https://github.com/aurelia/aurelia/commit/d958ccf))
* **all:** simplify DOM initialization, remove DOMInitializer ([ff13185](https://github.com/aurelia/aurelia/commit/ff13185))
* **watch:** cast prop key to string in manual AccessScope build ([7e53215](https://github.com/aurelia/aurelia/commit/7e53215))
* **watch:** use conciser names ([5c9b25c](https://github.com/aurelia/aurelia/commit/5c9b25c))
* **runtime:** rename CompositionRoot to AppRoot ([3141a2c](https://github.com/aurelia/aurelia/commit/3141a2c))
* **runtime:** move Aurelia from runtime to runtime-html ([d56c4ca](https://github.com/aurelia/aurelia/commit/d56c4ca))
* **instructions:** rename hydrate to compose ([2ab10b3](https://github.com/aurelia/aurelia/commit/2ab10b3))
* **all:** shorten TargetedInstruction to Instruction ([a7e61c6](https://github.com/aurelia/aurelia/commit/a7e61c6))
* **all:** shorten TargetedInstructionType to InstructionType ([7fe8d04](https://github.com/aurelia/aurelia/commit/7fe8d04))
* **all:** finish renaming render to compose ([ede127b](https://github.com/aurelia/aurelia/commit/ede127b))
* **computed:** resolve callback outside watchers ([a865900](https://github.com/aurelia/aurelia/commit/a865900))
* **all:** rename render to compose ([2d11d9e](https://github.com/aurelia/aurelia/commit/2d11d9e))
* **runtime:** move rendering, binding commands, attr patterns and instructions to runtime-html ([bc010f5](https://github.com/aurelia/aurelia/commit/bc010f5))
* **all:** rename renderer to composer ([c1a0f3c](https://github.com/aurelia/aurelia/commit/c1a0f3c))
* **all:** rename Hydrator to ExpressionHydrator ([71e2e6f](https://github.com/aurelia/aurelia/commit/71e2e6f))
* **interpolation' of http:** //github.com/aurelia/aurelia into feat/watch-decorator ([05e4152](https://github.com/aurelia/aurelia/commit/05e4152))
* **property-accessor:** make PropertyAccessor static again ([39861c4](https://github.com/aurelia/aurelia/commit/39861c4))
* **projection-provider:** use default registration ([ebcae56](https://github.com/aurelia/aurelia/commit/ebcae56))
* **view-locator:** use default registration ([5a49229](https://github.com/aurelia/aurelia/commit/5a49229))
* **expression-parser:** use default registration ([0126a04](https://github.com/aurelia/aurelia/commit/0126a04))
* **renderer:** use default registration ([6ec39ec](https://github.com/aurelia/aurelia/commit/6ec39ec))
* **lifecycle:** use default registration ([77c88a2](https://github.com/aurelia/aurelia/commit/77c88a2))
* **observer-locator:** use default registration ([71ed8e5](https://github.com/aurelia/aurelia/commit/71ed8e5))
* **runtime:** remove ILifecycleTask ([69f5fac](https://github.com/aurelia/aurelia/commit/69f5fac))
* **all:** cut back on the dispose calls ([9fec528](https://github.com/aurelia/aurelia/commit/9fec528))
* **runtime:** properly wireup root controller compilation hooks with apptasks & cleanup ([6a1f32f](https://github.com/aurelia/aurelia/commit/6a1f32f))
* **runtime:** add ICompositionRoot and IAurelia interfaces and pass container+root into controllers ([23477a3](https://github.com/aurelia/aurelia/commit/23477a3))
* **app-task:** use strings instead of enum for slots ([bfff559](https://github.com/aurelia/aurelia/commit/bfff559))
* **all:** simplify Aurelia#start/stop & AppTask#run, returning promise instead of task ([6c7608d](https://github.com/aurelia/aurelia/commit/6c7608d))
* **expr-watcher:** make start/stop private ([bb4ceb8](https://github.com/aurelia/aurelia/commit/bb4ceb8))
* **computed-watcher:** dispose prop & collection observers in change ([d2ab5f4](https://github.com/aurelia/aurelia/commit/d2ab5f4))
* **watcher:** remove impl details from expression watcher interface ([8360876](https://github.com/aurelia/aurelia/commit/8360876))
* **controller:** have context in custom attr hydration too ([a722775](https://github.com/aurelia/aurelia/commit/a722775))
* **watch:** remove old file organisation ([6112fb8](https://github.com/aurelia/aurelia/commit/6112fb8))
* **app-task:** cleanup interfaces and remove unused 'from' api ([5447e87](https://github.com/aurelia/aurelia/commit/5447e87))
* **proxy:** move handlers out of old file, group all ([44a0646](https://github.com/aurelia/aurelia/commit/44a0646))
* **all:** rename StartTask to AppTask ([e76ae41](https://github.com/aurelia/aurelia/commit/e76ae41))
* **runtime:** merge Activator into CompositionRoot and fix beforeCompile hook ([fd7547a](https://github.com/aurelia/aurelia/commit/fd7547a))
* **composition-root:** remove antecedent parameter ([c886c6b](https://github.com/aurelia/aurelia/commit/c886c6b))
* **scheduler:** remove idleTaskQueue ([34da902](https://github.com/aurelia/aurelia/commit/34da902))
* **observer-locator:** improve the flow / work out a few quirks ([cc042b4](https://github.com/aurelia/aurelia/commit/cc042b4))
* **primitive-observer:** cleanup/simplify ([4f4b86c](https://github.com/aurelia/aurelia/commit/4f4b86c))
* **observer-locator:** cleanup/simplify ([4e1db6f](https://github.com/aurelia/aurelia/commit/4e1db6f))
* **scope:** remove IScope interface and use import type where possible for Scope ([6b8eb5f](https://github.com/aurelia/aurelia/commit/6b8eb5f))
* **ast:** shorten param names ([482485d](https://github.com/aurelia/aurelia/commit/482485d))
* **ast:** remove pointless guards and cleanup tests ([fdc9d9f](https://github.com/aurelia/aurelia/commit/fdc9d9f))
* **focus:** only focus blur when *really* needed ([e71f36c](https://github.com/aurelia/aurelia/commit/e71f36c))
* ***:** rename multi interpolation to interpolation ([d1c2202](https://github.com/aurelia/aurelia/commit/d1c2202))
* **all:** remove reporter ([425fe96](https://github.com/aurelia/aurelia/commit/425fe96))
* **interpolation:** remove interpolation binding reference, tweak html interpolation ([f3a8952](https://github.com/aurelia/aurelia/commit/f3a8952))
* **interpolation:** ignore targetObserver in content binding, remove single interpolation bd ([3c6d3c3](https://github.com/aurelia/aurelia/commit/3c6d3c3))
* **interpolation:** always use multi mode ([145eadb](https://github.com/aurelia/aurelia/commit/145eadb))
* **interpolation:** simplify target update ([50e7087](https://github.com/aurelia/aurelia/commit/50e7087))
* **logger:** remove type duplication and cleanup DefaultLogger ([f7de00f](https://github.com/aurelia/aurelia/commit/f7de00f))
* **eventaggregator:** remove duplicate type ([f4fb651](https://github.com/aurelia/aurelia/commit/f4fb651))
* ***:** removed linktype in favor of link cb ([5af8498](https://github.com/aurelia/aurelia/commit/5af8498))
* **interpolation:** handle multi/single interpolation differently ([877494f](https://github.com/aurelia/aurelia/commit/877494f))
* **validation:** update based on updated ast ([ef13c54](https://github.com/aurelia/aurelia/commit/ef13c54))
* **testing:** truncate title stringification to avoid out of memory issues ([5bdb9bb](https://github.com/aurelia/aurelia/commit/5bdb9bb))
* **tests:** ensure .evaluate() is called with null ([2605e75](https://github.com/aurelia/aurelia/commit/2605e75))
* **validation-html:** ensure .evaluate() is called with null ([340bc1a](https://github.com/aurelia/aurelia/commit/340bc1a))
* **i18n:** ensure .evaluate() is called with null ([c19fb30](https://github.com/aurelia/aurelia/commit/c19fb30))
* **runtime-html:** ensure .evaluate() is called with null ([8dc3b88](https://github.com/aurelia/aurelia/commit/8dc3b88))
* **runtime:** ensure .evaluate() is called with null ([4ae4b49](https://github.com/aurelia/aurelia/commit/4ae4b49))
* **ast:** use null instead of ? ([61639be](https://github.com/aurelia/aurelia/commit/61639be))
* **ast:** use optinal chainin ([a6d6da3](https://github.com/aurelia/aurelia/commit/a6d6da3))
* **binding-mode-behavior:** add trace logging ([fc1a45d](https://github.com/aurelia/aurelia/commit/fc1a45d))
* **signaler:** add trace logging ([52519e2](https://github.com/aurelia/aurelia/commit/52519e2))
* **switch:** promise queuing, test correction ([78fd733](https://github.com/aurelia/aurelia/commit/78fd733))
* **observable:** sync naming with bindable ([3e05441](https://github.com/aurelia/aurelia/commit/3e05441))
* **start-task:** rename StartTask to AppTask ([b52fc9c](https://github.com/aurelia/aurelia/commit/b52fc9c))
* **router:** use afterDeactivate hook for stopping ([3683586](https://github.com/aurelia/aurelia/commit/3683586))
* **lifecycle-task:** rename afterAttach to afterActivate ([4045977](https://github.com/aurelia/aurelia/commit/4045977))
* **lifecycle-task:** rename beforeBind to beforeActivate ([b363f2f](https://github.com/aurelia/aurelia/commit/b363f2f))
* **lifecycle-task:** rename beforeRender to beforeCompile ([970e68a](https://github.com/aurelia/aurelia/commit/970e68a))
* **observable:** use notifier ([7614d19](https://github.com/aurelia/aurelia/commit/7614d19))
* **ast:** remove unused stuff ([d2ecf5e](https://github.com/aurelia/aurelia/commit/d2ecf5e))
* **all:** remove AST interfaces ([7e04d83](https://github.com/aurelia/aurelia/commit/7e04d83))
* **preprocess-resource:** move bindingCommand from jit to runtime ([f02aba8](https://github.com/aurelia/aurelia/commit/f02aba8))
* **switch:** partial fix after merging master ([1bc2624](https://github.com/aurelia/aurelia/commit/1bc2624))
* **all:** merge jit-html into runtime-html and remove jit-html-* packages ([f530bcf](https://github.com/aurelia/aurelia/commit/f530bcf))
* **all:** merge jit into runtime and remove jit package + references ([d7b626b](https://github.com/aurelia/aurelia/commit/d7b626b))
* ***:** remove unused import ([3f66b08](https://github.com/aurelia/aurelia/commit/3f66b08))
* **primitive-observer:** remove variable in scope ([edf854b](https://github.com/aurelia/aurelia/commit/edf854b))
* **jit:** move expression parser to runtime ([709a56a](https://github.com/aurelia/aurelia/commit/709a56a))
* **all:** sync up remaining api changes ([29d6520](https://github.com/aurelia/aurelia/commit/29d6520))
* **router:** fix error (temporarily) ([3e57ecb](https://github.com/aurelia/aurelia/commit/3e57ecb))
* **router:** fix merge conflicts ([57076f0](https://github.com/aurelia/aurelia/commit/57076f0))
* ***:** template controller link type ([1bd39ef](https://github.com/aurelia/aurelia/commit/1bd39ef))
* **switch:** view de/attach ([1c4cd39](https://github.com/aurelia/aurelia/commit/1c4cd39))
* **router:** add more lifecycle behaviors ([e46f77c](https://github.com/aurelia/aurelia/commit/e46f77c))
* **router:** add more lifecycle behaviors & change goto to load ([f49cca0](https://github.com/aurelia/aurelia/commit/f49cca0))
* **router:** fix viewport scope (unfinished) ([157683a](https://github.com/aurelia/aurelia/commit/157683a))
* **router:** replace bind+attach with activate ([19012ae](https://github.com/aurelia/aurelia/commit/19012ae))
* **router:** rename INavigatorFlags to INavigationFlags ([0ea131f](https://github.com/aurelia/aurelia/commit/0ea131f))
* **router:** replace INavigatorInstruction with Navigation ([081b602](https://github.com/aurelia/aurelia/commit/081b602))
* **switch:** active case change handling ([4830f18](https://github.com/aurelia/aurelia/commit/4830f18))
* **runtime:** cleanup unused flags ([77a930e](https://github.com/aurelia/aurelia/commit/77a930e))
* **runtime:** merge controller api bind+attach into activate, detach+unbind into deactivate, and remove ILifecycleTask usage from controller ([15f3885](https://github.com/aurelia/aurelia/commit/15f3885))
* **lifecycle-task:** remove cancellation ([23af2af](https://github.com/aurelia/aurelia/commit/23af2af))
* **controller:** normalize linkedlist properties ([9420d1e](https://github.com/aurelia/aurelia/commit/9420d1e))
* **lifecycles:** pass down first + parent controller in the 'before' hooks and use that as the queue instead of ILifecycle ([031b7fd](https://github.com/aurelia/aurelia/commit/031b7fd))
* **lifecycle:** simplify afterChildren hooks to singly-linked list ([cc65c09](https://github.com/aurelia/aurelia/commit/cc65c09))
* **controller:** cleanup/simplify unbind lifecycle ([4f33063](https://github.com/aurelia/aurelia/commit/4f33063))
* **controller:** cleanup/simplify bind lifecycle ([1fb6a3f](https://github.com/aurelia/aurelia/commit/1fb6a3f))
* **runtime:** rename 'caching' to 'dispose' and hook cache/dispose logic up to unbind based on isReleased flag ([e346ed4](https://github.com/aurelia/aurelia/commit/e346ed4))
* **controller:** rename 'hold' to 'setLocation' ([eb43d9e](https://github.com/aurelia/aurelia/commit/eb43d9e))
* **all:** remove State enum and use simple booleans instead ([762d3c7](https://github.com/aurelia/aurelia/commit/762d3c7))
* **lifecycle:** cleanup&simplify attach/detach lifecycles, remove mount ([694257b](https://github.com/aurelia/aurelia/commit/694257b))
* **event-aggregator:** fix types ([6b89325](https://github.com/aurelia/aurelia/commit/6b89325))
* **view:** add missing hooks ([13e0b85](https://github.com/aurelia/aurelia/commit/13e0b85))
* **all:** rename afterDetach to afterDetachChildren ([080a724](https://github.com/aurelia/aurelia/commit/080a724))
* **all:** rename afterUnbind to afterUnbindChildren ([09f1972](https://github.com/aurelia/aurelia/commit/09f1972))
* **all:** rename afterAttach to afterAttachChildren ([02b573e](https://github.com/aurelia/aurelia/commit/02b573e))
* **all:** rename afterBind to afterBindChildren ([bf0d79e](https://github.com/aurelia/aurelia/commit/bf0d79e))
* ***:** switch ([94a70a6](https://github.com/aurelia/aurelia/commit/94a70a6))
* **di:** rename requester -> requestor, remove .only ([686f400](https://github.com/aurelia/aurelia/commit/686f400))
* **di:** clean up linting issues, move stuff closer each other ([3785abb](https://github.com/aurelia/aurelia/commit/3785abb))
* **plugin-svg:** work in node ([9f5f228](https://github.com/aurelia/aurelia/commit/9f5f228))
* **switch:** switch-case controller linking ([ce835e2](https://github.com/aurelia/aurelia/commit/ce835e2))
* **switch:** case change handler ([a4d3872](https://github.com/aurelia/aurelia/commit/a4d3872))
* **switch:** provision for fallthrough ([8210bf8](https://github.com/aurelia/aurelia/commit/8210bf8))
* **switch:** change handler ([80c6eab](https://github.com/aurelia/aurelia/commit/80c6eab))
* **bindings:** always sync, control flush ([01db28d](https://github.com/aurelia/aurelia/commit/01db28d))
* **html-observers:** controllable flush ([f0ec574](https://github.com/aurelia/aurelia/commit/f0ec574))
* **html-observers:** keep tasks ([78e01f4](https://github.com/aurelia/aurelia/commit/78e01f4))
* **tests:** ensure all are run with scheduler isolation ([abf5eea](https://github.com/aurelia/aurelia/commit/abf5eea))
* **tests:** ignore replaceable tests ([281e9a4](https://github.com/aurelia/aurelia/commit/281e9a4))
* **tests:** ensure scheduler errors are detected & isolated ([938bc55](https://github.com/aurelia/aurelia/commit/938bc55))
* **switch:** converted to TC ([4a1b8e6](https://github.com/aurelia/aurelia/commit/4a1b8e6))
* **html-observers:** remove unused code/commented code ([ae111f3](https://github.com/aurelia/aurelia/commit/ae111f3))
* **bindings:** queue with preempt in handle change ([24350ce](https://github.com/aurelia/aurelia/commit/24350ce))
* **bindings:** queue with preempt in handle change ([5ae18a7](https://github.com/aurelia/aurelia/commit/5ae18a7))
* ***:** more tests flush revert, linting issues ([f3fdfc9](https://github.com/aurelia/aurelia/commit/f3fdfc9))
* **bindings:** treat changes during bind differently ([cf65629](https://github.com/aurelia/aurelia/commit/cf65629))
* **html-observers:** initialize values in bind ([83aeff3](https://github.com/aurelia/aurelia/commit/83aeff3))
* **bindings:** no queue during bind ([2a7a0a0](https://github.com/aurelia/aurelia/commit/2a7a0a0))
* **setter-observer:** remove lastupdate ([0c70a1d](https://github.com/aurelia/aurelia/commit/0c70a1d))
* **html-observers:** move task check top in setValue ([455ee23](https://github.com/aurelia/aurelia/commit/455ee23))
* **bindings:** seprate flow entirely for layout accessors ([3915230](https://github.com/aurelia/aurelia/commit/3915230))
* **html-observers:** handle task inside setValue ([2ac796d](https://github.com/aurelia/aurelia/commit/2ac796d))
* **runtime-observers:** add task to runtime observers ([9d1e795](https://github.com/aurelia/aurelia/commit/9d1e795))
* **html-observers:** add todo for unsafe cache ([8cd7c68](https://github.com/aurelia/aurelia/commit/8cd7c68))
* ***:** adapt self bb tests to prop binding changes ([420ccc9](https://github.com/aurelia/aurelia/commit/420ccc9))
* **style-attr-accessor.ts:** no read during bind ([1be26f5](https://github.com/aurelia/aurelia/commit/1be26f5))
* **js-bench:** remove template controllers to test ([75e1ea3](https://github.com/aurelia/aurelia/commit/75e1ea3))
* **observers:** rename ObserverType to AccessorType ([5f8d0e1](https://github.com/aurelia/aurelia/commit/5f8d0e1))
* **au-slot:** stricter binding rule ([eee5c92](https://github.com/aurelia/aurelia/commit/eee5c92))
* ***:** host scope & AST ([9067a2c](https://github.com/aurelia/aurelia/commit/9067a2c))
* ***:** generated tests ([c29e413](https://github.com/aurelia/aurelia/commit/c29e413))
* ***:** putting projections to scope ([25dcc83](https://github.com/aurelia/aurelia/commit/25dcc83))
* ***:** deregisterResolverFor ([f221eb9](https://github.com/aurelia/aurelia/commit/f221eb9))
* ***:** added hostScope to bindings ([7f42564](https://github.com/aurelia/aurelia/commit/7f42564))
* ***:** $host scope wip ([6990470](https://github.com/aurelia/aurelia/commit/6990470))
* **au-slot:** view factory injection ([70c5dfd](https://github.com/aurelia/aurelia/commit/70c5dfd))
* ***:** part2 of plumbing fallback projection ([a470f9b](https://github.com/aurelia/aurelia/commit/a470f9b))
* ***:** partial plumbing for projections ([f974ec5](https://github.com/aurelia/aurelia/commit/f974ec5))
* **jit-html:** restrictions for localTemplate ([bb20c7a](https://github.com/aurelia/aurelia/commit/bb20c7a))
* ***:** correction ([1a587e7](https://github.com/aurelia/aurelia/commit/1a587e7))
* ***:** encapsulated enhance in ce-definition ([ffd831e](https://github.com/aurelia/aurelia/commit/ffd831e))
* ***:** facilitated host enhancement directly ([ad8c53c](https://github.com/aurelia/aurelia/commit/ad8c53c))
* **logging:** minor improvements ([71e601b](https://github.com/aurelia/aurelia/commit/71e601b))

<a name="0.7.0"></a>
# 0.7.0 (2020-05-08)

### Features:

* **di:** allow configuration of Container ([a3e5319](https://github.com/aurelia/aurelia/commit/a3e5319))
* **@lazy:** stop lazy caching, let container control lifecycle ([bfb7391](https://github.com/aurelia/aurelia/commit/bfb7391))
* **router:** set no multi bindings on href attribute ([f6e6f23](https://github.com/aurelia/aurelia/commit/f6e6f23))
* **router:** set no multi bindings on href attribute ([a1762e7](https://github.com/aurelia/aurelia/commit/a1762e7))
* **ts-jest:** wrap ts-jest to support conventions ([9d7d093](https://github.com/aurelia/aurelia/commit/9d7d093))
* **babel-jest:** wrap babel-jest to support conventions ([5796ac0](https://github.com/aurelia/aurelia/commit/5796ac0))
* ***:** add caching for callbacks ([b5086ad](https://github.com/aurelia/aurelia/commit/b5086ad))
* **validation:** new changeOrEvent behavior ([d7e33dc](https://github.com/aurelia/aurelia/commit/d7e33dc))
* **validation:** customizable container template ([16a9e2a](https://github.com/aurelia/aurelia/commit/16a9e2a))
* **router:** enable exist for viewport attributes ([568cd35](https://github.com/aurelia/aurelia/commit/568cd35))
* **plugin-conventions:** support customized element name in customElement ([ed51357](https://github.com/aurelia/aurelia/commit/ed51357))
* **scheduler-dom:** new dom scheduler implementation ([206ac9f](https://github.com/aurelia/aurelia/commit/206ac9f))
* **scheduler-node:** new node scheduler implementation ([ca86582](https://github.com/aurelia/aurelia/commit/ca86582))
* ***:** support binding for Set/Map for CheckedObserver ([7b0dc48](https://github.com/aurelia/aurelia/commit/7b0dc48))
* **validation:** condtionals support in hydration ([1be45de](https://github.com/aurelia/aurelia/commit/1be45de))
* **validation:** adding model based validation ([994cbee](https://github.com/aurelia/aurelia/commit/994cbee))
* **validation:** draft#1 of ModelBased validation ([0c5c130](https://github.com/aurelia/aurelia/commit/0c5c130))
* **validation:** fallback to rules for class ([36053b1](https://github.com/aurelia/aurelia/commit/36053b1))
* **validation:** fallback to rules for class ([38f1189](https://github.com/aurelia/aurelia/commit/38f1189))
* **validation:** rule-property deserialization ([4bf1ff7](https://github.com/aurelia/aurelia/commit/4bf1ff7))
* **validation:** started deserialization support ([4296f9d](https://github.com/aurelia/aurelia/commit/4296f9d))
* **validation:** serialization support ([a14fb0a](https://github.com/aurelia/aurelia/commit/a14fb0a))
* ***:** AST hydration ([92125d6](https://github.com/aurelia/aurelia/commit/92125d6))
* **validation-i18n:** default ns, prefix ([78ba301](https://github.com/aurelia/aurelia/commit/78ba301))
* **validation-i18n:** i18n support for validation ([767855e](https://github.com/aurelia/aurelia/commit/767855e))
* **validation:** presenter subscriber service ([9d8d897](https://github.com/aurelia/aurelia/commit/9d8d897))
* **validation:** validated CE ([ef0427e](https://github.com/aurelia/aurelia/commit/ef0427e))
* **validation:** tagged rules and objects ([5326488](https://github.com/aurelia/aurelia/commit/5326488))
* **validation:** integration with binding behavior ([bd42bc3](https://github.com/aurelia/aurelia/commit/bd42bc3))
* **custom-attr:** add more no multi-bindings tests ([978dbe8](https://github.com/aurelia/aurelia/commit/978dbe8))
* **custom-attr:** add no multi bindings cfg ([4daa950](https://github.com/aurelia/aurelia/commit/4daa950))
* **validation:** change handling of the BB args ([e11f1b5](https://github.com/aurelia/aurelia/commit/e11f1b5))
* **runtime:** binding mediator ([3f37cb8](https://github.com/aurelia/aurelia/commit/3f37cb8))
* **array-index-observer:** add select/checkbox tests ([4237825](https://github.com/aurelia/aurelia/commit/4237825))
* **index-observation:** more tests ([9883842](https://github.com/aurelia/aurelia/commit/9883842))
* **observation:** tests for observing array idx ([3e3c961](https://github.com/aurelia/aurelia/commit/3e3c961))
* **observation:** observe array index ([a51edc2](https://github.com/aurelia/aurelia/commit/a51edc2))
* **router:** increase instructions capacity ([3a99fa0](https://github.com/aurelia/aurelia/commit/3a99fa0))
* **validation:** overwritting default messages ([d084946](https://github.com/aurelia/aurelia/commit/d084946))
* **runtime:** add temporary creating hook ([44b90b8](https://github.com/aurelia/aurelia/commit/44b90b8))
* **validation:** @validationRule deco ([f8caa30](https://github.com/aurelia/aurelia/commit/f8caa30))
* **validation:** metadata annotation for rules + type defn fix ([7e6569b](https://github.com/aurelia/aurelia/commit/7e6569b))
* **validation:** used new BindingInterceptor ([bb8dff2](https://github.com/aurelia/aurelia/commit/bb8dff2))
* **runtime+html:** binding middleware ([3dc8143](https://github.com/aurelia/aurelia/commit/3dc8143))
* **router:** make clear all instruction scope aware ([18c59f6](https://github.com/aurelia/aurelia/commit/18c59f6))
* **router:** add name and source to viewport scope ([487e510](https://github.com/aurelia/aurelia/commit/487e510))
* **router:** add name and source to viewport scope ([d0a4ea4](https://github.com/aurelia/aurelia/commit/d0a4ea4))
* **aot:** add %Reflect% global ([9c4a562](https://github.com/aurelia/aurelia/commit/9c4a562))
* **aot:** add %Proxy% global ([27f0b29](https://github.com/aurelia/aurelia/commit/27f0b29))
* **aot:** implement %AsyncIteratorPrototype%, %AsyncFromSyncIteratorPrototype% ([15bca98](https://github.com/aurelia/aurelia/commit/15bca98))
* **aot:** implement %AsyncFunction%, %AsyncFunctionPrototype% ([7b2d969](https://github.com/aurelia/aurelia/commit/7b2d969))
* **aot:** implement %AsyncGeneratorFunction%, %AsyncGenerator%, %AsyncGeneratorPrototype% ([33bc22f](https://github.com/aurelia/aurelia/commit/33bc22f))
* **aot:** implement %PromiseProto_then% ([7beb68e](https://github.com/aurelia/aurelia/commit/7beb68e))
* **aot:** implement %PromiseProto_finally% ([c0964ed](https://github.com/aurelia/aurelia/commit/c0964ed))
* **aot:** implement %PromiseProto_catch% ([ffea1a3](https://github.com/aurelia/aurelia/commit/ffea1a3))
* **aot:** implement %Promise_reject% ([24c65e7](https://github.com/aurelia/aurelia/commit/24c65e7))
* **aot:** implement %Promise_resolve% ([ffeb9a8](https://github.com/aurelia/aurelia/commit/ffeb9a8))
* **aot:** implement %Promise_race% ([62524ff](https://github.com/aurelia/aurelia/commit/62524ff))
* **aot:** implement %Promise_all% ([e082053](https://github.com/aurelia/aurelia/commit/e082053))
* **aot:** implement %Promise% and %PromisePrototype% ([da5aead](https://github.com/aurelia/aurelia/commit/da5aead))
* **aot:** implement generator ([1d65c76](https://github.com/aurelia/aurelia/commit/1d65c76))
* **aot): implement R:** Evaluation for Generator, AsyncGenerator and Async ([78f7dea](https://github.com/aurelia/aurelia/commit/78f7dea))
* **aot:** implement InstantiateFunctionObject for Generator, AsyncGenerator and Async ([69724ea](https://github.com/aurelia/aurelia/commit/69724ea))
* **aot:** implement GeneratorFunctionCreate, AsyncGeneratorFunctionCreate, AsyncFunctionCreate ([34bb72c](https://github.com/aurelia/aurelia/commit/34bb72c))
* **aot:** add some basic stack tracing ([9ead836](https://github.com/aurelia/aurelia/commit/9ead836))
* **router:** add viewport scope custom element ([3ad63ba](https://github.com/aurelia/aurelia/commit/3ad63ba))
* **router:** add viewport scope custom element ([a88ca71](https://github.com/aurelia/aurelia/commit/a88ca71))
* **aot:** implement ScriptEvaluationJob ([15d917b](https://github.com/aurelia/aurelia/commit/15d917b))
* **ast:** implement ScriptEvaluation ([e55e1fa](https://github.com/aurelia/aurelia/commit/e55e1fa))
* **ast): implement R:** GlobalDeclarationInstantiation ([ba755ba](https://github.com/aurelia/aurelia/commit/ba755ba))
* **ast:** add ESScript type / make changes to accomodate for script evaluation ([ad24b2c](https://github.com/aurelia/aurelia/commit/ad24b2c))
* **aot:** implement CreateDynamicFunction ([43d856c](https://github.com/aurelia/aurelia/commit/43d856c))
* **aot:** implement GetMethod ([0c21230](https://github.com/aurelia/aurelia/commit/0c21230))
* **ast): implement R:** Evaluation for SpreadElement ([8983e2d](https://github.com/aurelia/aurelia/commit/8983e2d))
* **ast:** add timeout guard ([9226425](https://github.com/aurelia/aurelia/commit/9226425))
* **aot:** implements %ThrowTypeError% ([406ee02](https://github.com/aurelia/aurelia/commit/406ee02))
* **ast): implement R:** LabelledEvaluation for WhileStatement ([f42e860](https://github.com/aurelia/aurelia/commit/f42e860))
* **ast): implement R:** LabelledEvaluation for DoStatement ([d1e7a14](https://github.com/aurelia/aurelia/commit/d1e7a14))
* **ast): implement R:** Evaluation for ObjectLiteral ([04d5eab](https://github.com/aurelia/aurelia/commit/04d5eab))
* **ast): implement R:** PropertyDefinitionEvaluation for SpreadAssignment ([65efb20](https://github.com/aurelia/aurelia/commit/65efb20))
* **aot:** implement CopyDataProperties ([f8870cc](https://github.com/aurelia/aurelia/commit/f8870cc))
* **aot): implement R:** PropertyDefinitionEvaluation for ShorthandPropertyAssignment ([681971e](https://github.com/aurelia/aurelia/commit/681971e))
* **aot): implement R:** PropertyDefinitionEvaluation for PropertyAssignment ([0e561b1](https://github.com/aurelia/aurelia/commit/0e561b1))
* **ast): implement R:** Evaluation for ArrayLiteralExpression ([64f8368](https://github.com/aurelia/aurelia/commit/64f8368))
* **ast): implement R:** ArrayAccumulation for SpreadElement ([482b695](https://github.com/aurelia/aurelia/commit/482b695))
* **aot:** add %URIError% and %URIErrorPrototype% ([efe3bbc](https://github.com/aurelia/aurelia/commit/efe3bbc))
* **aot:** add %TypeError% and %TypeErrorPrototype% ([090616d](https://github.com/aurelia/aurelia/commit/090616d))
* **aot:** add %SyntaxError% and %SyntaxErrorPrototype% ([0cc3aa4](https://github.com/aurelia/aurelia/commit/0cc3aa4))
* **aot:** add %ReferenceError% and %ReferenceErrorPrototype% ([ea0a202](https://github.com/aurelia/aurelia/commit/ea0a202))
* **aot:** add %RangeError% and %RangeErrorPrototype% ([dd9132b](https://github.com/aurelia/aurelia/commit/dd9132b))
* **aot:** add %EvalError% and %EvalErrorPrototype% ([089d096](https://github.com/aurelia/aurelia/commit/089d096))
* **aot:** add+implement %Error% and %ErrorPrototype% ([67acf33](https://github.com/aurelia/aurelia/commit/67acf33))
* **aot:** add %Symbol% and %SymbolPrototype% ([4afbcba](https://github.com/aurelia/aurelia/commit/4afbcba))
* **aot:** add %Boolean% and %BooleanPrototype% ([d72f162](https://github.com/aurelia/aurelia/commit/d72f162))
* **aot:** add %Number% and %NumberPrototype% ([0d28a05](https://github.com/aurelia/aurelia/commit/0d28a05))
* **aot:** add %StringPrototype% ([3b9b2cb](https://github.com/aurelia/aurelia/commit/3b9b2cb))
* **validation:** started porting ([00249b4](https://github.com/aurelia/aurelia/commit/00249b4))
* **aot:** implement Function.prototype.call ([4e232b9](https://github.com/aurelia/aurelia/commit/4e232b9))
* **aot:** implement %ObjProto_toString% and %FunctionPrototype% wireup ([fe654e0](https://github.com/aurelia/aurelia/commit/fe654e0))
* **aot:** implement %Object% ([5efbc5f](https://github.com/aurelia/aurelia/commit/5efbc5f))
* **aot:** implement %String% ([59656dc](https://github.com/aurelia/aurelia/commit/59656dc))
* **ast): implement R:** Evaluation for compound assignment and null coalescing ([29f8d04](https://github.com/aurelia/aurelia/commit/29f8d04))
* **ast): implement R:** Evaluation for PostfixUnaryExpression ([9a24db9](https://github.com/aurelia/aurelia/commit/9a24db9))
* **ast): implement R:** Evaluation for UnaryExpression ([d91f0fa](https://github.com/aurelia/aurelia/commit/d91f0fa))
* **ast): implement R:** Evaluation for MemberAccessor ([285469e](https://github.com/aurelia/aurelia/commit/285469e))
* **ast): implement R:** Evaluation for PropertyAccessor ([ddfae35](https://github.com/aurelia/aurelia/commit/ddfae35))
* **ast): implement R:** Evaluation for FunctionExpression ([31378a2](https://github.com/aurelia/aurelia/commit/31378a2))
* **ast): implement R:** Evaluation for ClassExpression ([ca1f628](https://github.com/aurelia/aurelia/commit/ca1f628))
* **ast): implement R:** NamedEvaluation for ClassExpression ([b46eaf7](https://github.com/aurelia/aurelia/commit/b46eaf7))
* **ast): implement R:** BindingClassDeclarationEvaluation ([e45a533](https://github.com/aurelia/aurelia/commit/e45a533))
* **ast): implement R:** ClassDefinitionEvaluation ([b3aac6a](https://github.com/aurelia/aurelia/commit/b3aac6a))
* **aot:** implement and propagate isAbrupt semantics ([b67d13e](https://github.com/aurelia/aurelia/commit/b67d13e))
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
* **aot:** typeof operator (expr) implementation ([8070e66](https://github.com/aurelia/aurelia/commit/8070e66))
* **aot:** void and new RS impl ([a12097b](https://github.com/aurelia/aurelia/commit/a12097b))
* **aot:** add ServiceHost api / reorganize stuff ([b0d0590](https://github.com/aurelia/aurelia/commit/b0d0590))
* **aot:** implement Agent ([ac357b6](https://github.com/aurelia/aurelia/commit/ac357b6))
* **aot:** implement Job and JobQueue ([9ab313e](https://github.com/aurelia/aurelia/commit/9ab313e))
* **aot:** implementation ThrowStatement#Evaluate ([334ac4f](https://github.com/aurelia/aurelia/commit/334ac4f))
* **aot:** try-catch RS implementation ([9e392f1](https://github.com/aurelia/aurelia/commit/9e392f1))
* **ast:** implement ArgumentListEvaluation ([f344146](https://github.com/aurelia/aurelia/commit/f344146))
* **aot): implement R:** BindingInitialization for identifier and binding patterns ([1ae1575](https://github.com/aurelia/aurelia/commit/1ae1575))
* **aot): implement R:** BindingInitialization for Identifier ([978fbfc](https://github.com/aurelia/aurelia/commit/978fbfc))
* **aot:** add $Error type ([8617989](https://github.com/aurelia/aurelia/commit/8617989))
* **aot:** implement iteration operations ([22ef442](https://github.com/aurelia/aurelia/commit/22ef442))
* **intrinsics:** add %IteratorPrototype% ([2e1065c](https://github.com/aurelia/aurelia/commit/2e1065c))
* **aot:** implement BuiltinFunction ([d8e4774](https://github.com/aurelia/aurelia/commit/d8e4774))
* **ast:** add VarDeclaredNames and LexicallyDeclaredNames missing semantics ([e175ba6](https://github.com/aurelia/aurelia/commit/e175ba6))
* **aot:** implement CreateUnmappedArgumentsObject ([03bfc1e](https://github.com/aurelia/aurelia/commit/03bfc1e))
* **ast:** implement EvaluateModule ([91b0443](https://github.com/aurelia/aurelia/commit/91b0443))
* **ast): implement partial R:** Evaluate for CallExpression + add some wireup ([3d66943](https://github.com/aurelia/aurelia/commit/3d66943))
* **ast): implement R:** EvaluateBody for FunctionDeclaration ([7ad648d](https://github.com/aurelia/aurelia/commit/7ad648d))
* **ast): implement R:** Evaluation for FunctionDeclaration ([d7a1c08](https://github.com/aurelia/aurelia/commit/d7a1c08))
* **ast): implement R:** Evaluation for BreakStatement ([64331e8](https://github.com/aurelia/aurelia/commit/64331e8))
* **ast): implement R:** Evaluation for ContinueStatement ([5e6db08](https://github.com/aurelia/aurelia/commit/5e6db08))
* **aot:** implement ImmutablePrototypeExoticObject ([1f8e3fb](https://github.com/aurelia/aurelia/commit/1f8e3fb))
* **aot:** implement StringExoticObject ([2517e55](https://github.com/aurelia/aurelia/commit/2517e55))
* **namespace:** implement [[OwnPropertyKeys]] ([9afae00](https://github.com/aurelia/aurelia/commit/9afae00))
* **operations:** add GetFunctionRealm ([19776dc](https://github.com/aurelia/aurelia/commit/19776dc))
* **aot:** implement ArrayExoticObject ([5c69eb0](https://github.com/aurelia/aurelia/commit/5c69eb0))
* **aot:** implement ProxyExoticObject ([3963f3b](https://github.com/aurelia/aurelia/commit/3963f3b))
* **operations:** implement CreateArrayFromList ([366b3db](https://github.com/aurelia/aurelia/commit/366b3db))
* **operations:** implement CreateListFromArrayLike ([2e15b9d](https://github.com/aurelia/aurelia/commit/2e15b9d))
* **operations:** implement FromPropertyDescriptor ([16762a0](https://github.com/aurelia/aurelia/commit/16762a0))
* **property-descriptor:** implement CompletePropertyDescriptor ([177ffda](https://github.com/aurelia/aurelia/commit/177ffda))
* **operations:** implement ToPropertyDescriptor ([b6b6100](https://github.com/aurelia/aurelia/commit/b6b6100))
* **object:** implement [[OwnPropertyKeys]] ([41d886f](https://github.com/aurelia/aurelia/commit/41d886f))
* **aot:** implement ArgumentsExoticObject ([4f8b2cf](https://github.com/aurelia/aurelia/commit/4f8b2cf))
* **aot:** $SwitchStatement#Evaluate impl. ([8e28476](https://github.com/aurelia/aurelia/commit/8e28476))
* **kernel:** export format ([aca18ae](https://github.com/aurelia/aurelia/commit/aca18ae))
* **aot:** implement (most of) FunctionDeclarationInstantiation ([a7fd52a](https://github.com/aurelia/aurelia/commit/a7fd52a))
* **aot:** $Block#Evaluate implementation ([f74dac8](https://github.com/aurelia/aurelia/commit/f74dac8))
* **aot:** implements [[Construct]] ([671f8e6](https://github.com/aurelia/aurelia/commit/671f8e6))
* **aot:** implement [[Call]] ([ec64257](https://github.com/aurelia/aurelia/commit/ec64257))
* **aot:** implement OrdinaryCallBindThis ([551fa51](https://github.com/aurelia/aurelia/commit/551fa51))
* **aot:** implement PrepareForOrdinaryCall ([023dea8](https://github.com/aurelia/aurelia/commit/023dea8))
* **aot:** EmptyStmt Evaluate implementation ([450e3b8](https://github.com/aurelia/aurelia/commit/450e3b8))
* **aot:** RS IfStatement#Evaluate ([f4dc5b7](https://github.com/aurelia/aurelia/commit/f4dc5b7))
* **aot:** add api for running a single file ([04e31fa](https://github.com/aurelia/aurelia/commit/04e31fa))
* **ast:** implement BinaryExpression evaluation ([fbea6f9](https://github.com/aurelia/aurelia/commit/fbea6f9))
* **aot:** implement AbstractEqualityComparison ([7a00db2](https://github.com/aurelia/aurelia/commit/7a00db2))
* **aot:** implement ToPropertyKey and ToLength ([06be8c6](https://github.com/aurelia/aurelia/commit/06be8c6))
* **aot:** implement InstanceOfOperator ([ea38559](https://github.com/aurelia/aurelia/commit/ea38559))
* **aot:** implement BoundFunctionExoticObject ([f220b59](https://github.com/aurelia/aurelia/commit/f220b59))
* **aot:** add remaining primitive type conversions ([2d78781](https://github.com/aurelia/aurelia/commit/2d78781))
* **aot:** implement AbstractRelationalComparison ([615bd28](https://github.com/aurelia/aurelia/commit/615bd28))
* **aot:** implement ToString ([32a92ae](https://github.com/aurelia/aurelia/commit/32a92ae))
* **aot:** implement ToPrimitive and ToNumber ([ef1173b](https://github.com/aurelia/aurelia/commit/ef1173b))
* **aot:** add preliminary SpeculativeValue impl ([093664c](https://github.com/aurelia/aurelia/commit/093664c))
* **ast): implement ParenthesizedExpression R:** Evaluation ([bd16c16](https://github.com/aurelia/aurelia/commit/bd16c16))
* **ast): implement ThisKeyword R:** Evaluation ([7ac6cc8](https://github.com/aurelia/aurelia/commit/7ac6cc8))
* **aot): implement StringLiteral R:** Evaluation ([da15530](https://github.com/aurelia/aurelia/commit/da15530))
* **aot): implement NumericLiteral R:** Evaluation ([44ddfc2](https://github.com/aurelia/aurelia/commit/44ddfc2))
* **aot): implement NullLiteral R:** Evaluation ([748c825](https://github.com/aurelia/aurelia/commit/748c825))
* **aot): implement BooleanLiteral R:** Evaluation ([b322395](https://github.com/aurelia/aurelia/commit/b322395))
* **aot): implement Identifier R:** Evaluation ([680ddd9](https://github.com/aurelia/aurelia/commit/680ddd9))
* **aot:** implement ResolveBinding ([cbd70a9](https://github.com/aurelia/aurelia/commit/cbd70a9))
* **aot:** parse/resolve html modules ([c7e6ff9](https://github.com/aurelia/aurelia/commit/c7e6ff9))
* **ast:** add typescript type exports etc ([210e8d4](https://github.com/aurelia/aurelia/commit/210e8d4))
* **aot:** implement Module.Instantiate ([83e90cf](https://github.com/aurelia/aurelia/commit/83e90cf))
* **aot:** implement InstantiateFunctionObject and finish InitializeEnvironment ([9ca53c9](https://github.com/aurelia/aurelia/commit/9ca53c9))
* **aot:** implement SetFunctionName ([27f2956](https://github.com/aurelia/aurelia/commit/27f2956))
* **aot:** implement MakeConstructor ([c7c67f1](https://github.com/aurelia/aurelia/commit/c7c67f1))
* **aot:** implement FunctionCreate ([bdd69b0](https://github.com/aurelia/aurelia/commit/bdd69b0))
* **aot:** implement FunctionInitialize ([66fefd9](https://github.com/aurelia/aurelia/commit/66fefd9))
* **realm:** implement GetActiveScriptOrModule ([957278f](https://github.com/aurelia/aurelia/commit/957278f))
* **aot:** implement FunctionAllocate ([c9eed44](https://github.com/aurelia/aurelia/commit/c9eed44))
* **aot:** implement NamespaceExoticObject ([c073f67](https://github.com/aurelia/aurelia/commit/c073f67))
* **aot:** implement InitializeHostDefinedRealm ([a99d81e](https://github.com/aurelia/aurelia/commit/a99d81e))
* **aot:** implement ObjectCreate ([f3b9e0c](https://github.com/aurelia/aurelia/commit/f3b9e0c))
* **aot:** implement CreateRealm ([b8fc344](https://github.com/aurelia/aurelia/commit/b8fc344))
* **aot:** implement NewGlobalEnvironment ([8d1d668](https://github.com/aurelia/aurelia/commit/8d1d668))
* **aot:** implement NewFunctionEnvironment ([8f36ab5](https://github.com/aurelia/aurelia/commit/8f36ab5))
* **aot:** implement ModuleEnvRec ([4773c66](https://github.com/aurelia/aurelia/commit/4773c66))
* **aot:** implement GlobalEnvRec ([319bae8](https://github.com/aurelia/aurelia/commit/319bae8))
* **aot:** implement FunctionEnvRec ([53cfc58](https://github.com/aurelia/aurelia/commit/53cfc58))
* **aot:** implement ObjectEnvironmentRecord ([1d6ae72](https://github.com/aurelia/aurelia/commit/1d6ae72))
* **aot:** implement [[Delete]] ([704b9c1](https://github.com/aurelia/aurelia/commit/704b9c1))
* **aot:** implement [[Set]] ([fb37643](https://github.com/aurelia/aurelia/commit/fb37643))
* **aot:** implement [[DefineOwnProperty]] ([75b3ca3](https://github.com/aurelia/aurelia/commit/75b3ca3))
* **aot:** implement [[Get]] ([d1ab80c](https://github.com/aurelia/aurelia/commit/d1ab80c))
* **aot:** implement PropertyDescriptor ([2d17d26](https://github.com/aurelia/aurelia/commit/2d17d26))
* **environment:** implement DeclarativeEnvironmentRecord ([9c5c3e3](https://github.com/aurelia/aurelia/commit/9c5c3e3))
* **aot:** implement some basic object runtime semantics ([a17a3f9](https://github.com/aurelia/aurelia/commit/a17a3f9))
* **aot:** add basic structure for CreateBuiltinFunction ([1cc8df3](https://github.com/aurelia/aurelia/commit/1cc8df3))
* **aot:** implement ResolveExport ([24b2e95](https://github.com/aurelia/aurelia/commit/24b2e95))
* **aot:** implement ParseModule ([67f8070](https://github.com/aurelia/aurelia/commit/67f8070))
* **aot): implement R:** HostResolveImportedModule ([b4c0a5a](https://github.com/aurelia/aurelia/commit/b4c0a5a))
* **aot:** load entry file ([460631b](https://github.com/aurelia/aurelia/commit/460631b))
* **ast:** implement module static semantics + cleanup ([69bb4a5](https://github.com/aurelia/aurelia/commit/69bb4a5))
* **ast:** add Import/Export SS for FunctionDeclaration ([0d2dc99](https://github.com/aurelia/aurelia/commit/0d2dc99))
* **ast:** add Import/Export SS for ClassDeclaration ([56f50b2](https://github.com/aurelia/aurelia/commit/56f50b2))
* **ast:** implement Export static semantics for VariableStatement ([7c5743c](https://github.com/aurelia/aurelia/commit/7c5743c))
* **ast): add S:** ModuleRequests for imports ([f0a96a1](https://github.com/aurelia/aurelia/commit/f0a96a1))
* **ast): add SS:ImportEntries and S:** ModuleRequests for ES import decl + cleanup a bit ([6f67afa](https://github.com/aurelia/aurelia/commit/6f67afa))
* **ast:** implement ExportDeclaration static semantics ([1db06ee](https://github.com/aurelia/aurelia/commit/1db06ee))
* **ast:** finish class SS and cleanup ([d511717](https://github.com/aurelia/aurelia/commit/d511717))
* **ast): implement S:** IsStatic ([fd68bcf](https://github.com/aurelia/aurelia/commit/fd68bcf))
* **ast): finish S:** HasName ([7f5dfa0](https://github.com/aurelia/aurelia/commit/7f5dfa0))
* **ast): finish S:** AssignmentTargetType ([c3783af](https://github.com/aurelia/aurelia/commit/c3783af))
* **ast:** add strictMode detection ([1c6b20b](https://github.com/aurelia/aurelia/commit/1c6b20b))
* **ast): add S:** PropName ([7d308e1](https://github.com/aurelia/aurelia/commit/7d308e1))
* **aot:** add explicit empty value type ([f310403](https://github.com/aurelia/aurelia/commit/f310403))
* **ast): add S:** StringValue ([4bf3fc3](https://github.com/aurelia/aurelia/commit/4bf3fc3))
* **ast:** add CoveredParenthesizedExpression props ([6353640](https://github.com/aurelia/aurelia/commit/6353640))
* **ast:** finish declaration related static semantics ([c63c144](https://github.com/aurelia/aurelia/commit/c63c144))
* **ast): implement S:** VarDeclaredNames ([071063a](https://github.com/aurelia/aurelia/commit/071063a))
* **ast): implement S:** ContainsDuplicateLabels ([4f53977](https://github.com/aurelia/aurelia/commit/4f53977))
* **aot): finish S:** IsSimpleParameterList ([92245df](https://github.com/aurelia/aurelia/commit/92245df))
* **aot:** add the majority of ts-based ast with static semantic properties ([e77c392](https://github.com/aurelia/aurelia/commit/e77c392))
* **aot:** add some initial npm package discovery logic ([713622f](https://github.com/aurelia/aurelia/commit/713622f))


### Bug Fixes:

* **di:** should have a return type ([61266da](https://github.com/aurelia/aurelia/commit/61266da))
* **validation:** optional IValidationController ([5a5114b](https://github.com/aurelia/aurelia/commit/5a5114b))
* **di:** improve error checking for DI.createInterface() ([2c73033](https://github.com/aurelia/aurelia/commit/2c73033))
* ***:** don't jitRegister intrinsic types. resolves #840 ([4f5d7e8](https://github.com/aurelia/aurelia/commit/4f5d7e8))
* **listener:** fix listener binding to work with interceptors (e.g. debounce) ([4dedf7e](https://github.com/aurelia/aurelia/commit/4dedf7e))
* **i18n:** i18next plugin type correction ([af078d2](https://github.com/aurelia/aurelia/commit/af078d2))
* **validation:** addError-revalidateError bug ([61c6f44](https://github.com/aurelia/aurelia/commit/61c6f44))
* **ts-jest:** skip type checking on generated html module ([9e2cd1f](https://github.com/aurelia/aurelia/commit/9e2cd1f))
* **ts-jest,babel-jest:** should not ignore error in jest transformer ([f974d88](https://github.com/aurelia/aurelia/commit/f974d88))
* **validation-html:** deepscan issue ([c53c78b](https://github.com/aurelia/aurelia/commit/c53c78b))
* **validation:** prop parsing with istanbul instr ([d5123df](https://github.com/aurelia/aurelia/commit/d5123df))
* **validation:** subscription to validate event ([f4bb10d](https://github.com/aurelia/aurelia/commit/f4bb10d))
* **validation-html:** controller injection ([800516e](https://github.com/aurelia/aurelia/commit/800516e))
* ***:** create local RepeatableCollection type ([c462a6d](https://github.com/aurelia/aurelia/commit/c462a6d))
* **route-recognizer:** fix adding route array ([d60f4e8](https://github.com/aurelia/aurelia/commit/d60f4e8))
* ***:** remove down level iteration config in tsconfig ([c9e5fce](https://github.com/aurelia/aurelia/commit/c9e5fce))
* **router:** make goto-active consider parameters ([b7391a0](https://github.com/aurelia/aurelia/commit/b7391a0))
* ***:** validation controller factory fix ([e2e5da4](https://github.com/aurelia/aurelia/commit/e2e5da4))
* **runtime+html:** tests" ([533b59a](https://github.com/aurelia/aurelia/commit/533b59a))
* ***:** misc issues + cleanup ([c318d91](https://github.com/aurelia/aurelia/commit/c318d91))
* **debug:** skipped escaping ' for serialization ([dc7437a](https://github.com/aurelia/aurelia/commit/dc7437a))
* **i18n:** support for null/undefined key exprs ([3375563](https://github.com/aurelia/aurelia/commit/3375563))
* **i18n:** convert undefined and null to empty string ([43c4b80](https://github.com/aurelia/aurelia/commit/43c4b80))
* **validation:** lint correction ([401b976](https://github.com/aurelia/aurelia/commit/401b976))
* **i18n:** bypassed tests for February ([8e1a858](https://github.com/aurelia/aurelia/commit/8e1a858))
* **shadow-dom-registry:** improve monomorphism by caching via weakmap ([1634cdd](https://github.com/aurelia/aurelia/commit/1634cdd))
* **shadow-dom-registry:** change find to some for efficient any check ([dff6280](https://github.com/aurelia/aurelia/commit/dff6280))
* **i18n:** bypassed tests for february ([9e1c2ae](https://github.com/aurelia/aurelia/commit/9e1c2ae))
* **binding:** fromView update source initial value ([5e23f6c](https://github.com/aurelia/aurelia/commit/5e23f6c))
* **validation:** correction for Node.js ([656cdb0](https://github.com/aurelia/aurelia/commit/656cdb0))
* **validation:** deepscan issues ([0f72686](https://github.com/aurelia/aurelia/commit/0f72686))
* **validation:** fixed the property parsing ([f6af7f2](https://github.com/aurelia/aurelia/commit/f6af7f2))
* ***:** use void 0 instead of undefined ([49322cd](https://github.com/aurelia/aurelia/commit/49322cd))
* **bindable-observer:** ensure initial value is valid ([6255b03](https://github.com/aurelia/aurelia/commit/6255b03))
* **bindable-observer:** reverse set interceptor ([0c98007](https://github.com/aurelia/aurelia/commit/0c98007))
* **validation:** validationRules#on 1+ objects ([bb65039](https://github.com/aurelia/aurelia/commit/bb65039))
* ***:** update conventions to use latest shadowCSS and cssModules ([bcbbe77](https://github.com/aurelia/aurelia/commit/bcbbe77))
* ***:** remove deleted export ([6a562ff](https://github.com/aurelia/aurelia/commit/6a562ff))
* **array-index-observer:** dont update current value during set value ([6eefd78](https://github.com/aurelia/aurelia/commit/6eefd78))
* **is-arry-index:** properly check for 0 vs 0xx ([400ff0d](https://github.com/aurelia/aurelia/commit/400ff0d))
* **tests:** fix tests for array keyed observation ([2a89eae](https://github.com/aurelia/aurelia/commit/2a89eae))
* **lint:** fix deep scan issues ([601bbfc](https://github.com/aurelia/aurelia/commit/601bbfc))
* **index-observation:** simplify keyed access connect ([57e9607](https://github.com/aurelia/aurelia/commit/57e9607))
* **computed:** always to string ([359706b](https://github.com/aurelia/aurelia/commit/359706b))
* **computed:** commented out unexpected volatile/static computed behavior ([e67b4fa](https://github.com/aurelia/aurelia/commit/e67b4fa))
* **observer-locator:** compare against null ([7fc39a2](https://github.com/aurelia/aurelia/commit/7fc39a2))
* **computed:** add test for setter/getter pair ([41b1ec7](https://github.com/aurelia/aurelia/commit/41b1ec7))
* **computed:** observer collection correctly ([7b2db01](https://github.com/aurelia/aurelia/commit/7b2db01))
* **observer-locator:** use SetterObserver instead of dirty check ([1dc1983](https://github.com/aurelia/aurelia/commit/1dc1983))
* **computed:** correctly check observer type ([3349b8a](https://github.com/aurelia/aurelia/commit/3349b8a))
* **computed:** tweak computed + let/repeat ([8e964a6](https://github.com/aurelia/aurelia/commit/8e964a6))
* **computed:** flatter stack ([cadb819](https://github.com/aurelia/aurelia/commit/cadb819))
* **computed:** add more tests for let + repeat ([0aa7624](https://github.com/aurelia/aurelia/commit/0aa7624))
* **validation:** collection property accessor parsing ([7d2cd1d](https://github.com/aurelia/aurelia/commit/7d2cd1d))
* **computed:** add more tests for multiple computed ([6365859](https://github.com/aurelia/aurelia/commit/6365859))
* **controller:** correct the timing of beforeBind hook ([d2e4f59](https://github.com/aurelia/aurelia/commit/d2e4f59))
* **injectable:** prevent renderContext caching ([625348a](https://github.com/aurelia/aurelia/commit/625348a))
* **validation:** accessing nested property value ([22698f0](https://github.com/aurelia/aurelia/commit/22698f0))
* **computed:** dont bind unnecessarily ([b7dbb46](https://github.com/aurelia/aurelia/commit/b7dbb46))
* **observation:** don't eagerly dirty check array prop ([fdfb353](https://github.com/aurelia/aurelia/commit/fdfb353))
* **tests:** more computed observer tests ([13b5b9d](https://github.com/aurelia/aurelia/commit/13b5b9d))
* **computed-observer:** better efficiency & works in basic array scenarios ([ad12769](https://github.com/aurelia/aurelia/commit/ad12769))
* **runtime:** fix splice first indice bug ([3a654f5](https://github.com/aurelia/aurelia/commit/3a654f5))
* **tests:** removing validaion tests ([772125f](https://github.com/aurelia/aurelia/commit/772125f))
* **runtime+html:** tests ([85cd02c](https://github.com/aurelia/aurelia/commit/85cd02c))
* **aot:** add stack to throw completions ([d8185ce](https://github.com/aurelia/aurelia/commit/d8185ce))
* **ast:** pass the correct execution context into script evaluation ([f473313](https://github.com/aurelia/aurelia/commit/f473313))
* **ast:** fix slip-up in envRec ([c73133b](https://github.com/aurelia/aurelia/commit/c73133b))
* **ast:** return abrupt completion per module item ([bea0c2d](https://github.com/aurelia/aurelia/commit/bea0c2d))
* **aot:** fix a few bugs in proxy and improve error messages ([a263d8e](https://github.com/aurelia/aurelia/commit/a263d8e))
* **modules:** fix error propagation in module code ([4d37044](https://github.com/aurelia/aurelia/commit/4d37044))
* **aot:** fix execution context suspend issue ([6836028](https://github.com/aurelia/aurelia/commit/6836028))
* **aot:** fix ScriptOrModule selection issue in CreateDynamicFunction ([3ec68d1](https://github.com/aurelia/aurelia/commit/3ec68d1))
* **aot:** fix some argument destructuring issues ([9371427](https://github.com/aurelia/aurelia/commit/9371427))
* **router:** correct conditional check ([2827ea6](https://github.com/aurelia/aurelia/commit/2827ea6))
* **ast:** add missing statement kind ([4722e5e](https://github.com/aurelia/aurelia/commit/4722e5e))
* **ast:** use the correct [[SourceText]] for class constructor ([9cf2db6](https://github.com/aurelia/aurelia/commit/9cf2db6))
* **aot:** fix context issue in [[Construct]] ([83bdc51](https://github.com/aurelia/aurelia/commit/83bdc51))
* **router:** fix rebase issue ([e39f82f](https://github.com/aurelia/aurelia/commit/e39f82f))
* **router:** fix rebase issue ([269a77d](https://github.com/aurelia/aurelia/commit/269a77d))
* **aot:** add truthy check in ToPropertyDescriptor ([08fd8fe](https://github.com/aurelia/aurelia/commit/08fd8fe))
* **aot:** fix a few minor slip-ups in function evaluation ([1e40ceb](https://github.com/aurelia/aurelia/commit/1e40ceb))
* **aot:** make parameter bindings in functions work ([e5a3884](https://github.com/aurelia/aurelia/commit/e5a3884))
* **ast:** complete arrow function static semantics ([94a2dd6](https://github.com/aurelia/aurelia/commit/94a2dd6))
* **ast:** map formals.BoundNames ([189d0aa](https://github.com/aurelia/aurelia/commit/189d0aa))
* **ast:** assign elseStatement ([172c0fc](https://github.com/aurelia/aurelia/commit/172c0fc))
* **aot:** fix build error ([70669a4](https://github.com/aurelia/aurelia/commit/70669a4))
* **ast:** fix export static semantics to be compliant with 262 test suite ([707f131](https://github.com/aurelia/aurelia/commit/707f131))
* **realm:** fix single file module resolution ([e3720c8](https://github.com/aurelia/aurelia/commit/e3720c8))
* **aot:** preserve path casing ([c013530](https://github.com/aurelia/aurelia/commit/c013530))
* **aot:** properly resolve hoisted packages with arbitrary import specifiers ([397d561](https://github.com/aurelia/aurelia/commit/397d561))
* **aot:** fix typo in AbstractRelationalComparison ([c266935](https://github.com/aurelia/aurelia/commit/c266935))
* **ast:** fix mixup in exportSpecifier ([fda9fb0](https://github.com/aurelia/aurelia/commit/fda9fb0))
* **ast:** initialize env and namespace with instrinsic undefined ([ec196d4](https://github.com/aurelia/aurelia/commit/ec196d4))
* **ast:** set context ScriptOrModule ([7c225a9](https://github.com/aurelia/aurelia/commit/7c225a9))
* **ast:** actually add exported bindings ([56469fc](https://github.com/aurelia/aurelia/commit/56469fc))
* **intrinsics:** initialize/assign realm and intrinsics stuff in the correct order ([ef7ec8d](https://github.com/aurelia/aurelia/commit/ef7ec8d))
* **ast:** add missing import/export resolution pieces ([18fd0bf](https://github.com/aurelia/aurelia/commit/18fd0bf))


### Performance Improvements:

* **aot:** add dispose() api to difficult to GC objects ([c2dea46](https://github.com/aurelia/aurelia/commit/c2dea46))
* **aot:** share single logger in the ast ([9ddabba](https://github.com/aurelia/aurelia/commit/9ddabba))
* **aot:** add reusable common strings for proxies and descriptors ([c01cd30](https://github.com/aurelia/aurelia/commit/c01cd30))
* **aot:** add eager file loading with EMFILE error guard ([18d1f43](https://github.com/aurelia/aurelia/commit/18d1f43))
* **logger:** cache scoped loggers with the same name ([110b30e](https://github.com/aurelia/aurelia/commit/110b30e))


### Refactorings:

* **metadata:** make the polyfill application more foolproof and dedupe helper fns ([9c94ae1](https://github.com/aurelia/aurelia/commit/9c94ae1))
* **validation:** tests correction ([7138530](https://github.com/aurelia/aurelia/commit/7138530))
* ***:** rename alias to aliasto for readability and consistency ([f3904fe](https://github.com/aurelia/aurelia/commit/f3904fe))
* **validation:** optional scoped controller ([1484ed3](https://github.com/aurelia/aurelia/commit/1484ed3))
* **validation:** removed usage of BaseValidationRule in favor of IValidationRule ([72d4536](https://github.com/aurelia/aurelia/commit/72d4536))
* **validation:** validation-html bifurcation ([e2ca34f](https://github.com/aurelia/aurelia/commit/e2ca34f))
* **scheduler-node:** use weakmap cache and fix flush logic ([2fa66ba](https://github.com/aurelia/aurelia/commit/2fa66ba))
* **scheduler-dom:** use weakmap cache and fix flush logic ([ada4399](https://github.com/aurelia/aurelia/commit/ada4399))
* **scheduler:** add module-scoped weakmap cache for instances ([7c3da22](https://github.com/aurelia/aurelia/commit/7c3da22))
* **all:** fixup scheduler bootstrapping code, cleanup deprecated stuff ([acf66f2](https://github.com/aurelia/aurelia/commit/acf66f2))
* **scheduler:** minor improvements to api ([586be7e](https://github.com/aurelia/aurelia/commit/586be7e))
* **scheduler:** reduce abstract api surface ([5b95233](https://github.com/aurelia/aurelia/commit/5b95233))
* **scheduler:** move scheduler to separate package and simplify a few things ([cf33b1a](https://github.com/aurelia/aurelia/commit/cf33b1a))
* **kernel:** move metadata to separate package ([471b77d](https://github.com/aurelia/aurelia/commit/471b77d))
* **route-recognizer:** use URLSearchParams ([b359298](https://github.com/aurelia/aurelia/commit/b359298))
* **route-recognizer:** more optional segment related fixes and tests ([b198a18](https://github.com/aurelia/aurelia/commit/b198a18))
* **route-recognizer:** more bugfixes and some perf improvements ([d044408](https://github.com/aurelia/aurelia/commit/d044408))
* **route-recognizer:** add star segment tests and more cleanup / minor fixes ([581b9f6](https://github.com/aurelia/aurelia/commit/581b9f6))
* **route-recognizer:** cleanup and various fixes ([df5d18a](https://github.com/aurelia/aurelia/commit/df5d18a))
* ***:** use to string to check for array/set/map for checkedobserver ([f246c0f](https://github.com/aurelia/aurelia/commit/f246c0f))
* **route-recognizer:** rewrite to fix ambiguous edge cases etc ([b636dc3](https://github.com/aurelia/aurelia/commit/b636dc3))
* ***:** use lifecycle instead of observer locator for collection observation in CheckedObserver ([147bec2](https://github.com/aurelia/aurelia/commit/147bec2))
* **route-recognizer:** rewrite the route recognizer and move to separate package ([82995cd](https://github.com/aurelia/aurelia/commit/82995cd))
* ***:** moved ast hydration to debug package ([691a63f](https://github.com/aurelia/aurelia/commit/691a63f))
* **validation-i18n:** agnositc configuration ([a315fd3](https://github.com/aurelia/aurelia/commit/a315fd3))
* ***:** moved value evaluation to PropertyRule ([072526f](https://github.com/aurelia/aurelia/commit/072526f))
* **validation:** message provider usage ([a9e4b3e](https://github.com/aurelia/aurelia/commit/a9e4b3e))
* **validation:** integrated validation message provider for property displayname ([9b870f6](https://github.com/aurelia/aurelia/commit/9b870f6))
* **shadow-dom-registry:** make explicit factory classes ([a9771ad](https://github.com/aurelia/aurelia/commit/a9771ad))
* **validation:** flags in ValidateInstruction ([e0d142b](https://github.com/aurelia/aurelia/commit/e0d142b))
* **validation:** enhanced custom message key ([30f6b3f](https://github.com/aurelia/aurelia/commit/30f6b3f))
* **validation:** cleanup ([c53bf72](https://github.com/aurelia/aurelia/commit/c53bf72))
* **validation:** clean up ValidateInstruction ([666a5ac](https://github.com/aurelia/aurelia/commit/666a5ac))
* **di:** make ResolverBuilder into a class ([0854f38](https://github.com/aurelia/aurelia/commit/0854f38))
* **styles:** a more explicit api for shadow styles and css modules ([3b1f978](https://github.com/aurelia/aurelia/commit/3b1f978))
* **validation:** normalized binding host ([732234b](https://github.com/aurelia/aurelia/commit/732234b))
* **validation:** removed errors in favor of results ([124d54f](https://github.com/aurelia/aurelia/commit/124d54f))
* **validation:** extracted test utils ([eb686af](https://github.com/aurelia/aurelia/commit/eb686af))
* **validation:** handled rules change in BB ([7669c19](https://github.com/aurelia/aurelia/commit/7669c19))
* **validation:** support for arg value change handling ([e7acfbe](https://github.com/aurelia/aurelia/commit/e7acfbe))
* **validation:** removed trigger from controller ([d1dccdc](https://github.com/aurelia/aurelia/commit/d1dccdc))
* **validation:** validate bb test ([92e09e0](https://github.com/aurelia/aurelia/commit/92e09e0))
* **validation:** scheduler in validation-controller ([c118e90](https://github.com/aurelia/aurelia/commit/c118e90))
* **array-index-observer:** behave like native when setting value ([e8fb47e](https://github.com/aurelia/aurelia/commit/e8fb47e))
* ***:** rename isNumeric to isArrayIndex ([2fab646](https://github.com/aurelia/aurelia/commit/2fab646))
* **validation:** fixed validation result ([de3f4cf](https://github.com/aurelia/aurelia/commit/de3f4cf))
* **computed-tests:** setupApp -> createFixture ([5152844](https://github.com/aurelia/aurelia/commit/5152844))
* **computed-observer:** compare with 0 using > instead of === ([331aed7](https://github.com/aurelia/aurelia/commit/331aed7))
* **computed:** dont wrap value if function ([e60a2b9](https://github.com/aurelia/aurelia/commit/e60a2b9))
* **router:** clean up ([7a1414d](https://github.com/aurelia/aurelia/commit/7a1414d))
* **viewport-scope:** use template part substitution instead of replaceable ([e8bd7b2](https://github.com/aurelia/aurelia/commit/e8bd7b2))
* **router:** fix merge issues ([dcc0b2c](https://github.com/aurelia/aurelia/commit/dcc0b2c))
* **router:** await task queue execute ([aa5dbd8](https://github.com/aurelia/aurelia/commit/aa5dbd8))
* **router:** fix linting errors ([a2d4136](https://github.com/aurelia/aurelia/commit/a2d4136))
* **testing:** rename setup to createFixture ([6af10d7](https://github.com/aurelia/aurelia/commit/6af10d7))
* **router:** fix merge issues ([f66d7ad](https://github.com/aurelia/aurelia/commit/f66d7ad))
* **router:** fix merge issues ([42b986e](https://github.com/aurelia/aurelia/commit/42b986e))
* **runtime:** add controllers, bindings to custom attribute interface ([5378dbc](https://github.com/aurelia/aurelia/commit/5378dbc))
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
* **validation:** restructuring + binding behavior wip ([e8cb986](https://github.com/aurelia/aurelia/commit/e8cb986))
* **aot:** use $List type for arguments / typing improvements ([f9b7e3e](https://github.com/aurelia/aurelia/commit/f9b7e3e))
* **aot:** tweak error propagation for IfAbruptRejectPromise ([d65d6de](https://github.com/aurelia/aurelia/commit/d65d6de))
* **aot:** normalize function allocation string to enum ([d6be430](https://github.com/aurelia/aurelia/commit/d6be430))
* **aot:** cleanup functions a bit ([856f0fe](https://github.com/aurelia/aurelia/commit/856f0fe))
* **validation:** fixed property name parsing ([e56613b](https://github.com/aurelia/aurelia/commit/e56613b))
* **router:** update closest and viewport scopes ([411315f](https://github.com/aurelia/aurelia/commit/411315f))
* **ast:** a few finishing touches for script execution ([0ca9bdd](https://github.com/aurelia/aurelia/commit/0ca9bdd))
* **ast:** remove ClassDeclaration from VarScopedDeclarations union ([42201bc](https://github.com/aurelia/aurelia/commit/42201bc))
* **validation:** minor return type change ([250e3d5](https://github.com/aurelia/aurelia/commit/250e3d5))
* **aot:** rename $SourceFile to $ESModule to allow differentiating $Script ([52d0830](https://github.com/aurelia/aurelia/commit/52d0830))
* **router:** add context to viewport instruction ([6911365](https://github.com/aurelia/aurelia/commit/6911365))
* **aot:** add Symbol.toPrimitive and Symbol.toStringTag to internal value types ([5de58b2](https://github.com/aurelia/aurelia/commit/5de58b2))
* **aot:** improve overall error propagation and reporting ([4762123](https://github.com/aurelia/aurelia/commit/4762123))
* **validation:** rule execution and validator ([2e019a0](https://github.com/aurelia/aurelia/commit/2e019a0))
* **ast:** add node index property ([53564fb](https://github.com/aurelia/aurelia/commit/53564fb))
* **router:** relocate ensureRootScope to activate ([3b5d176](https://github.com/aurelia/aurelia/commit/3b5d176))
* **ast:** remove nodeFlags and combinedNodeFlags ([1d64995](https://github.com/aurelia/aurelia/commit/1d64995))
* **ast:** remove node id and registration ([5e092fb](https://github.com/aurelia/aurelia/commit/5e092fb))
* **ast:** remove deprecated context flags ([1c53e6d](https://github.com/aurelia/aurelia/commit/1c53e6d))
* **ast:** remove dependency on realm property of ast nodes ([c098c75](https://github.com/aurelia/aurelia/commit/c098c75))
* **router:** add ViewportScope ([e764eb2](https://github.com/aurelia/aurelia/commit/e764eb2))
* **validation:** cleaned up validation rules ([74b312e](https://github.com/aurelia/aurelia/commit/74b312e))
* **validation:** unified fluent API ([5dfccc1](https://github.com/aurelia/aurelia/commit/5dfccc1))
* **validation:** fixed misc build issues ([b947b7f](https://github.com/aurelia/aurelia/commit/b947b7f))
* **aot:** specify and reorder some intrinsic types ([3f5f57c](https://github.com/aurelia/aurelia/commit/3f5f57c))
* **aot:** reorganize FormalParameterList static semantics and properly fix class/function eval ([b055f9e](https://github.com/aurelia/aurelia/commit/b055f9e))
* **aot:** make some optional ctor args explicit ([7051581](https://github.com/aurelia/aurelia/commit/7051581))
* **aot:** cleanup constructor/prototype wireups ([f1b5a89](https://github.com/aurelia/aurelia/commit/f1b5a89))
* **router:** revert change to CustomElement.for ([5ddee60](https://github.com/aurelia/aurelia/commit/5ddee60))
* **router:** implement own CustomElement.for ([46dd7e5](https://github.com/aurelia/aurelia/commit/46dd7e5))
* **router:** revert change to CustomElement.for ([acca6db](https://github.com/aurelia/aurelia/commit/acca6db))
* **runtime:** add componentType property back ([aebb378](https://github.com/aurelia/aurelia/commit/aebb378))
* **runtime:** add node name to .for search ([c426c68](https://github.com/aurelia/aurelia/commit/c426c68))
* **router:** remove closest ([930396e](https://github.com/aurelia/aurelia/commit/930396e))
* **router:** move loadComponent/created first ([15edabc](https://github.com/aurelia/aurelia/commit/15edabc))
* **router:** add ParentViewport and setClosestViewport ([f753bb4](https://github.com/aurelia/aurelia/commit/f753bb4))
* **router:** add get/setClosestViewport & remove closest ([c87171e](https://github.com/aurelia/aurelia/commit/c87171e))
* **router:** fix rebase issues (temporary) ([3c6301c](https://github.com/aurelia/aurelia/commit/3c6301c))
* **router:** clean up ([a3a4d5b](https://github.com/aurelia/aurelia/commit/a3a4d5b))
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
* **aot:** inline [[Get]] ([e75b749](https://github.com/aurelia/aurelia/commit/e75b749))
* **aot:** various tweaks to execution context + add more logging ([7afb36c](https://github.com/aurelia/aurelia/commit/7afb36c))
* **arguments:** use $BuiltinFunction ([33487fb](https://github.com/aurelia/aurelia/commit/33487fb))
* **intrinsics:** use $BuiltinFunction for @@iterator ([27daa09](https://github.com/aurelia/aurelia/commit/27daa09))
* **aot:** pass through the execution context in all calls ([b14352e](https://github.com/aurelia/aurelia/commit/b14352e))
* **aot:** merge CompletionRecord into $Value types and rework/integrate the new types ([b9b692c](https://github.com/aurelia/aurelia/commit/b9b692c))
* **aot:** inline HasProperty ([32d6518](https://github.com/aurelia/aurelia/commit/32d6518))
* **aot:** move types to separate files ([e68572e](https://github.com/aurelia/aurelia/commit/e68572e))
* **value:** add array and proxy exotic properties ([d3e2ad6](https://github.com/aurelia/aurelia/commit/d3e2ad6))
* **property-descriptor:** allow passing in properties into ctor ([18080b6](https://github.com/aurelia/aurelia/commit/18080b6))
* **aot:** move exotics to separate files ([491be02](https://github.com/aurelia/aurelia/commit/491be02))
* **aot:** merge ECMAScriptFunction into Function ([bda1cf2](https://github.com/aurelia/aurelia/commit/bda1cf2))
* **aot:** moved the statement evaluation ([2006f9f](https://github.com/aurelia/aurelia/commit/2006f9f))
* **realm:** register IOptions as per-realm instead ([cde518c](https://github.com/aurelia/aurelia/commit/cde518c))
* **ast:** add sourceFile property to all nodes ([0875739](https://github.com/aurelia/aurelia/commit/0875739))
* **aot:** wrap all primitives and add some important logging points ([7381308](https://github.com/aurelia/aurelia/commit/7381308))
* **aot:** consolidate realm and host ([08deba5](https://github.com/aurelia/aurelia/commit/08deba5))
* **environment:** use wrapped values everywhere ([8d199cd](https://github.com/aurelia/aurelia/commit/8d199cd))
* **aot:** reorganize a few things, replace project with host ([635c6de](https://github.com/aurelia/aurelia/commit/635c6de))
* **ast:** reorganize and further refine the types and unions ([dd47a7c](https://github.com/aurelia/aurelia/commit/dd47a7c))
* **aot): remove placeholders and finish S:** IsFunctionDefinition ([2158fbf](https://github.com/aurelia/aurelia/commit/2158fbf))

<a name="0.6.0"></a>
# 0.6.0 (2019-12-18)

### Features:

* **controller:** add create/beforeCompile/afterCompile/afterCompileChildren hooks ([3a8c215](https://github.com/aurelia/aurelia/commit/3a8c215))
* **runtime:** add CustomElement.createInjectable api ([c2ea5fc](https://github.com/aurelia/aurelia/commit/c2ea5fc))
* **bindable:** basic working state for set/get ([ae1d87a](https://github.com/aurelia/aurelia/commit/ae1d87a))
* **bindable-observer:** add getter/setter interceptors ([6c22b91](https://github.com/aurelia/aurelia/commit/6c22b91))
* **bindable-observer:** invoke propertyChanged ([1af2ab0](https://github.com/aurelia/aurelia/commit/1af2ab0))


### Bug Fixes:

* **compose:** use $controller instead of injected controller ([d8c2878](https://github.com/aurelia/aurelia/commit/d8c2878))
* **dom:** clone fragment before creating nodes ([bf595b1](https://github.com/aurelia/aurelia/commit/bf595b1))
* **render-context:** do not dispose viewModelProvider due to if.bind etc ([e28f5b2](https://github.com/aurelia/aurelia/commit/e28f5b2))
* **template-compiler:** just return the definition if template is null ([9f3d595](https://github.com/aurelia/aurelia/commit/9f3d595))
* **controller:** merge parts ([2e184fd](https://github.com/aurelia/aurelia/commit/2e184fd))
* **container:** ignore primitive values in register ([b5eb137](https://github.com/aurelia/aurelia/commit/b5eb137))
* **repeat:** initialize module-scoped index eagerly to fix reference error ([c8a571f](https://github.com/aurelia/aurelia/commit/c8a571f))
* **customelement.for:** correctly traverse up ([abb6dac](https://github.com/aurelia/aurelia/commit/abb6dac))
* **webpack-loader:** canot use raw-loader on scss or less ([7e00cc5](https://github.com/aurelia/aurelia/commit/7e00cc5))
* **bindable:** ensure value is intercepted correctly in first delayed subscription ([37c818c](https://github.com/aurelia/aurelia/commit/37c818c))
* **fetch-client:** use correct prototype checks ([405a8dd](https://github.com/aurelia/aurelia/commit/405a8dd))


### Refactorings:

* **all:** refine+document controller interfaces and fix types/tests ([0a77fbd](https://github.com/aurelia/aurelia/commit/0a77fbd))
* **controller:** split up IController into several specialized interfaces + various small bugfixes ([05d8a8d](https://github.com/aurelia/aurelia/commit/05d8a8d))
* **controller:** fixup/improve controller partial interfaces ([571ac18](https://github.com/aurelia/aurelia/commit/571ac18))
* **dom:** add null-object NodeSequence back in ([c9244ad](https://github.com/aurelia/aurelia/commit/c9244ad))
* **i18n:** fix types / api calls ([ac4da3c](https://github.com/aurelia/aurelia/commit/ac4da3c))
* **router:** fix types / api calls ([57196f1](https://github.com/aurelia/aurelia/commit/57196f1))
* **testing:** fix types / api calls ([6279c49](https://github.com/aurelia/aurelia/commit/6279c49))
* **runtime-html:** fix types / api calls ([3d42dc2](https://github.com/aurelia/aurelia/commit/3d42dc2))
* **runtime:** fix types / api calls ([7bb863a](https://github.com/aurelia/aurelia/commit/7bb863a))
* **html-renderer:** synchronize with renderer refactor ([4219e02](https://github.com/aurelia/aurelia/commit/4219e02))
* **renderer:** cleanup/simplify the rendering process and part propagation ([0018838](https://github.com/aurelia/aurelia/commit/0018838))
* **template-compiler:** merge RuntimeCompilationResources into ResourceModel ([43f09d3](https://github.com/aurelia/aurelia/commit/43f09d3))
* **kernel:** remove 'id' and 'path' properties from container ([26120ad](https://github.com/aurelia/aurelia/commit/26120ad))
* **binding-behavior:** integrate interceptors with renderer ([580b76e](https://github.com/aurelia/aurelia/commit/580b76e))
* **throttle:** change to new interceptor api ([f955498](https://github.com/aurelia/aurelia/commit/f955498))
* **debounce:** change to new interceptor api ([e2effc5](https://github.com/aurelia/aurelia/commit/e2effc5))
* **runtime:** make binding behaviors transient and formalize interceptor api ([facbe47](https://github.com/aurelia/aurelia/commit/facbe47))
* **runtime:** rename CustomElementBoilerplate back to RenderContext ([a844ccc](https://github.com/aurelia/aurelia/commit/a844ccc))
* **runtime:** factor out rendering engine + context + compiled template, introduce ce boilerplate, fix create-element etc ([a3cc2ad](https://github.com/aurelia/aurelia/commit/a3cc2ad))
* **runtime:** simplify render process / prepare for removing CompiledTemplate layer ([6f47ee8](https://github.com/aurelia/aurelia/commit/6f47ee8))
* **runtime:** rename 'detached' to 'afterDetach' ([d1e2b0c](https://github.com/aurelia/aurelia/commit/d1e2b0c))
* **runtime:** rename 'attached' to 'afterAttach' ([6ae7be1](https://github.com/aurelia/aurelia/commit/6ae7be1))
* **runtime:** rename 'unbound' to 'afterUnbind' ([35e203c](https://github.com/aurelia/aurelia/commit/35e203c))
* **runtime:** rename 'detaching' to 'beforeDetach' ([9f8b858](https://github.com/aurelia/aurelia/commit/9f8b858))
* **runtime:** rename 'unbinding' to 'beforeUnbind' ([79cd5fa](https://github.com/aurelia/aurelia/commit/79cd5fa))
* **runtime:** rename 'attaching' to 'beforeAttach' ([4685bb1](https://github.com/aurelia/aurelia/commit/4685bb1))
* **runtime:** rename 'bound' to 'afterBind' ([4060bbe](https://github.com/aurelia/aurelia/commit/4060bbe))
* **runtime:** rename 'binding' to 'beforeBind' ([45b2e91](https://github.com/aurelia/aurelia/commit/45b2e91))
* **bindable:** remove getter interceptor ([269d6ff](https://github.com/aurelia/aurelia/commit/269d6ff))
* **bindable-observer:** tweak interfaces ([00bd459](https://github.com/aurelia/aurelia/commit/00bd459))
* **bindable-observer:** use similar mechansm to callback for propertyChanged callback ([a6f3762](https://github.com/aurelia/aurelia/commit/a6f3762))
* **bindable-observer:** rename self-observer -> bindable-observer ([bc0647c](https://github.com/aurelia/aurelia/commit/bc0647c))

<a name="0.5.0"></a>
# 0.5.0 (2019-11-15)

### Features:

* **dom:** add setEffectiveParentNode for portal-like components ([5f40cd5](https://github.com/aurelia/aurelia/commit/5f40cd5))
* **dom:** let the getEffectiveParentNode api also traverse out of shadow roots ([325601b](https://github.com/aurelia/aurelia/commit/325601b))
* **custom-element:** add 'name' and 'searchParents' parameters to CustomElement.for api ([46da0dc](https://github.com/aurelia/aurelia/commit/46da0dc))
* **controller:** add 'is' api for checking if the resource name matches ([47b61a6](https://github.com/aurelia/aurelia/commit/47b61a6))
* **dom:** add getEffectiveParentNode api for containerless support ([77a04e0](https://github.com/aurelia/aurelia/commit/77a04e0))
* **custom-attribute:** add behaviorFor api ([31145e1](https://github.com/aurelia/aurelia/commit/31145e1))
* **kernel:** add isNativeFunction helper ([6e2fdda](https://github.com/aurelia/aurelia/commit/6e2fdda))
* **kernel:** add isNullOrUndefined function ([a783f07](https://github.com/aurelia/aurelia/commit/a783f07))
* **kernel:** add isObject function ([c158a22](https://github.com/aurelia/aurelia/commit/c158a22))
* **test:** Added the projects under test to lerna ([7b1d1ad](https://github.com/aurelia/aurelia/commit/7b1d1ad))
* **replace:** Nested replaceables didn't render ([71e815c](https://github.com/aurelia/aurelia/commit/71e815c))
* **kernel:** initial logger implementation ([7f77340](https://github.com/aurelia/aurelia/commit/7f77340))


### Bug Fixes:

* **getEffectiveParentNode:** skip over sibling containerless elements above the node ([6a6dd76](https://github.com/aurelia/aurelia/commit/6a6dd76))
* **test-nod:** verbose script ([42a18a8](https://github.com/aurelia/aurelia/commit/42a18a8))
* **repeat:** unsubscribe from array observer when unbinding ([ebf237d](https://github.com/aurelia/aurelia/commit/ebf237d))
* **kernel:** use WeakMap for isNativeFunction for mem leaks ([61f29a6](https://github.com/aurelia/aurelia/commit/61f29a6))
* **i18n:** do not use DOM types in constructor args ([bef63b3](https://github.com/aurelia/aurelia/commit/bef63b3))
* **router:** do not use DOM types in constructor args ([778e48f](https://github.com/aurelia/aurelia/commit/778e48f))
* **runtime-html:** do not use DOM types in constructor args ([4505abd](https://github.com/aurelia/aurelia/commit/4505abd))
* **attribute:** do not use DOM type in constructor param ([bc383c1](https://github.com/aurelia/aurelia/commit/bc383c1))
* **di:** warn instead of throwing on native function dependencies ([7d56668](https://github.com/aurelia/aurelia/commit/7d56668))
* **integration:** fixing testfor FF ([edaae69](https://github.com/aurelia/aurelia/commit/edaae69))
* **runtime-html:** style-attribute-accessor issue ([40db3dc](https://github.com/aurelia/aurelia/commit/40db3dc))
* **runtime-html:** uniform syntax for class CA ([feede3a](https://github.com/aurelia/aurelia/commit/feede3a))
* **runtime:** remove stray semicolon triggering Terser error ([0fabdee](https://github.com/aurelia/aurelia/commit/0fabdee))
* **renderer:** revert to observer.setValue again ([9038263](https://github.com/aurelia/aurelia/commit/9038263))
* **renderer:** set default value instead ([f9d5960](https://github.com/aurelia/aurelia/commit/f9d5960))
* **renderer:** add fromBinding to setPropertyBinding ([ac1c8ac](https://github.com/aurelia/aurelia/commit/ac1c8ac))


### Performance Improvements:

* **collection-observation:** store observers in weakmaps ([c6e0a70](https://github.com/aurelia/aurelia/commit/c6e0a70))
* **collection-observation:** store observers in weakmaps ([26114ea](https://github.com/aurelia/aurelia/commit/26114ea))
* **all:** remove unnecessary Object.freezes ([16b0484](https://github.com/aurelia/aurelia/commit/16b0484))


### Refactorings:

* **ref:** check element name again ([2625040](https://github.com/aurelia/aurelia/commit/2625040))
* **all:** rename behaviorFor to for ([0823dfe](https://github.com/aurelia/aurelia/commit/0823dfe))
* **au-dom:** use new resource apis ([2d8d6f0](https://github.com/aurelia/aurelia/commit/2d8d6f0))
* **router:** use new resource apis ([6fc87ae](https://github.com/aurelia/aurelia/commit/6fc87ae))
* **runtime:** use metadata api to associate resources with nodes ([f46dacc](https://github.com/aurelia/aurelia/commit/f46dacc))
* **custom-element:** retrieve controller from metadata ([2c715f5](https://github.com/aurelia/aurelia/commit/2c715f5))
* **metadata:** improve error detection and reporting ([8c17492](https://github.com/aurelia/aurelia/commit/8c17492))
* **reporter:** improve and document log levels ([aa78655](https://github.com/aurelia/aurelia/commit/aa78655))

<a name="0.4.0"></a>
# 0.4.0 (2019-10-26)

### Features:

* **scheduler:** add repeat parameter to yieldAll for dirty checker etc ([9f24306](https://github.com/aurelia/aurelia/commit/9f24306))
* **scheduler:** add yieldAll api ([f39c640](https://github.com/aurelia/aurelia/commit/f39c640))
* **test:** add schedulerIsEmpty assert helper ([b20318e](https://github.com/aurelia/aurelia/commit/b20318e))
* **scheduler:** add delta time param ([cf00768](https://github.com/aurelia/aurelia/commit/cf00768))
* **scheduler:** add support for persistent tasks ([f152a4a](https://github.com/aurelia/aurelia/commit/f152a4a))
* **bindable:** add fluent api ([c36108b](https://github.com/aurelia/aurelia/commit/c36108b))
* **kernel:** add resource definition helpers ([a318317](https://github.com/aurelia/aurelia/commit/a318317))
* **kernel:** add getPrototypeChain and pascalCase functions ([b85bb6e](https://github.com/aurelia/aurelia/commit/b85bb6e))
* **portal:** add portal attribute ([8602dd0](https://github.com/aurelia/aurelia/commit/8602dd0))
* **dom:** add prependTo api to nodesequences ([b958d57](https://github.com/aurelia/aurelia/commit/b958d57))
* **container:** add path property ([4ba48e9](https://github.com/aurelia/aurelia/commit/4ba48e9))
* **kernel:** add metadata implementation ([cc503ee](https://github.com/aurelia/aurelia/commit/cc503ee))
* **kernel:** add bound decorator ([ecae358](https://github.com/aurelia/aurelia/commit/ecae358))
* **testing:** new tracing capabolities ([ffb65ba](https://github.com/aurelia/aurelia/commit/ffb65ba))
* **scheduler:** add shims and initializers ([341dd69](https://github.com/aurelia/aurelia/commit/341dd69))
* **test:** new html assertions for text and value ([46cdfdd](https://github.com/aurelia/aurelia/commit/46cdfdd))
* **scheduler:** impl initial structure for new scheduler ([66f7e11](https://github.com/aurelia/aurelia/commit/66f7e11))
* **strict-binding:** Allow null/und to be '' ([a44720e](https://github.com/aurelia/aurelia/commit/a44720e))
* **integration:** tests for updateTrigger and if ([caf1136](https://github.com/aurelia/aurelia/commit/caf1136))
* **integration:** new tests for text input ([dc87cea](https://github.com/aurelia/aurelia/commit/dc87cea))
* **tests:** added script to copy htmls ([823833d](https://github.com/aurelia/aurelia/commit/823833d))
* **integration:** starting integration tests ([aaefd34](https://github.com/aurelia/aurelia/commit/aaefd34))
* **integration:** test plan for runtime-html ([32c0de5](https://github.com/aurelia/aurelia/commit/32c0de5))
* **integration:** plan for binding behaviors ([e6ea738](https://github.com/aurelia/aurelia/commit/e6ea738))
* **integration:** test plan for runtime observers ([4d4525f](https://github.com/aurelia/aurelia/commit/4d4525f))
* **integration:** wip plan for runtime observers ([86bb368](https://github.com/aurelia/aurelia/commit/86bb368))
* **integration-test:** further test plan ([709ad73](https://github.com/aurelia/aurelia/commit/709ad73))
* **test:** starting integration test plan ([2dce7d0](https://github.com/aurelia/aurelia/commit/2dce7d0))
* **router:** fix linting issues ([ac4f884](https://github.com/aurelia/aurelia/commit/ac4f884))
* **router:** export au-href ([992c9c0](https://github.com/aurelia/aurelia/commit/992c9c0))
* **router:** use au-href custom attribute for links ([fe211c4](https://github.com/aurelia/aurelia/commit/fe211c4))
* **router:** add au-href custom attribute ([ebf9166](https://github.com/aurelia/aurelia/commit/ebf9166))
* **aurelia:** re-export all in a single "aurelia" package, and a wrapper to start app ([31c9ccf](https://github.com/aurelia/aurelia/commit/31c9ccf))
* **alias:** Provide alias functionality ([f0baee7](https://github.com/aurelia/aurelia/commit/f0baee7))
* **alias:** Added additional test cases ([4a45a5c](https://github.com/aurelia/aurelia/commit/4a45a5c))
* **alias:** Add convention add tests fix conv log ([19399af](https://github.com/aurelia/aurelia/commit/19399af))
* **alias:** Binding command aliases ([efffff8](https://github.com/aurelia/aurelia/commit/efffff8))
* **alias:** Cleanup and tests added ([5cabba3](https://github.com/aurelia/aurelia/commit/5cabba3))
* **alias:** Provide alias functionality ([7dd9764](https://github.com/aurelia/aurelia/commit/7dd9764))
* **bench:** Add pre/post merge results ([efd9a4a](https://github.com/aurelia/aurelia/commit/efd9a4a))
* **bench:** Add pre/post merge results ([78c3467](https://github.com/aurelia/aurelia/commit/78c3467))
* **kernel:** cover more edge cases in camel/kebabCase ([a37ca76](https://github.com/aurelia/aurelia/commit/a37ca76))
* **runtime-html:** Enhance the style accessor ([890c380](https://github.com/aurelia/aurelia/commit/890c380))
* **runtime-html:** Enhance the style accessor ([57bc7b1](https://github.com/aurelia/aurelia/commit/57bc7b1))
* **plugin-conventions:** improve compatibility with uppercase resource name ([b67b839](https://github.com/aurelia/aurelia/commit/b67b839))
* **plugin-conventions:** support foo.js + foo-view.html convention ([625ec6a](https://github.com/aurelia/aurelia/commit/625ec6a))
* **router:** fix guard target resolve ([3776d00](https://github.com/aurelia/aurelia/commit/3776d00))
* **router:** improve instruction parser (working) ([cc760ff](https://github.com/aurelia/aurelia/commit/cc760ff))
* **router:** improve instruction parser (working) ([f4b4806](https://github.com/aurelia/aurelia/commit/f4b4806))
* **router:** improve instruction parser (incomplete) ([dc3c6ee](https://github.com/aurelia/aurelia/commit/dc3c6ee))
* **plugin-conventions:** support conventional css pair, support alternative file extentions ([cfb9446](https://github.com/aurelia/aurelia/commit/cfb9446))
* **plugin-conventions:** support metadata containerless and bindable tag/attr ([b5395b4](https://github.com/aurelia/aurelia/commit/b5395b4))
* **plugin-conventions:** always wrap others resources in defer ([082b83b](https://github.com/aurelia/aurelia/commit/082b83b))
* **plugin-conventions:** enable ShadomDOM option in html-only-element ([e44eadd](https://github.com/aurelia/aurelia/commit/e44eadd))
* **plugin-conventions:** support defaultShadowOptions in conventions support ([dcf0bba](https://github.com/aurelia/aurelia/commit/dcf0bba))
* **router:** configure to not use url fragment hash ([88b4ada](https://github.com/aurelia/aurelia/commit/88b4ada))
* **i18n:** prepend, append HTML content support ([b9aeca8](https://github.com/aurelia/aurelia/commit/b9aeca8))
* **i18n:** support for [text] ([2576139](https://github.com/aurelia/aurelia/commit/2576139))
* **router:** consolidate / for "hash and pushstate" ([6492182](https://github.com/aurelia/aurelia/commit/6492182))
* **router:** fix options for browser navigator ([dbf5449](https://github.com/aurelia/aurelia/commit/dbf5449))
* **router:** add configuration for use browser  fragment hash ([4b2f0c1](https://github.com/aurelia/aurelia/commit/4b2f0c1))
* **ViewLocator:** enable custom view selector functions ([ee6f03f](https://github.com/aurelia/aurelia/commit/ee6f03f))
* **(di:** enhance defer to fallback reasonably if no handler found ([3edb9ec](https://github.com/aurelia/aurelia/commit/3edb9ec))
* **i18n:** core translation service and related auxiliary features ([c3d4a85](https://github.com/aurelia/aurelia/commit/c3d4a85))
* **default-replaceable:** allow replace conv ([73ca7b0](https://github.com/aurelia/aurelia/commit/73ca7b0))
* **router:** update compute active in nav route ([e923639](https://github.com/aurelia/aurelia/commit/e923639))
* **router:** add flattenViewportInstructions ([43e15ac](https://github.com/aurelia/aurelia/commit/43e15ac))
* **default-replaceable:** allow replace conv ([1300933](https://github.com/aurelia/aurelia/commit/1300933))
* **view-locator:** allow associating views with classes ([9a89686](https://github.com/aurelia/aurelia/commit/9a89686))
* **router:** default true for ownsScope in ViewportInstruction ([570824d](https://github.com/aurelia/aurelia/commit/570824d))
* **router:** update router interface ([7bfed46](https://github.com/aurelia/aurelia/commit/7bfed46))
* **router:** switch ownsScope separator to noScope ([ee79039](https://github.com/aurelia/aurelia/commit/ee79039))
* **router:** add upwards scope traversal feat to link ([8b32b3b](https://github.com/aurelia/aurelia/commit/8b32b3b))
* **router:** add scope modifcations to link ([80f42a0](https://github.com/aurelia/aurelia/commit/80f42a0))
* **router:** make true default for viewport scope ([4298d78](https://github.com/aurelia/aurelia/commit/4298d78))
* **blur:** blur attribute ([9e844a8](https://github.com/aurelia/aurelia/commit/9e844a8))
* **observer:** Add the ability to bind an array of objects and strings to a class ([cd94c43](https://github.com/aurelia/aurelia/commit/cd94c43))
* **realworld:** configure for conventions ([c58b97d](https://github.com/aurelia/aurelia/commit/c58b97d))
* **router:** fix review comments ([a75c569](https://github.com/aurelia/aurelia/commit/a75c569))
* **router:** add comment to configuration ([6a34ab3](https://github.com/aurelia/aurelia/commit/6a34ab3))
* **router:** implement configuration customization ([c7f6fa5](https://github.com/aurelia/aurelia/commit/c7f6fa5))
* **router:** make individual route separators optional in config ([1e8b61d](https://github.com/aurelia/aurelia/commit/1e8b61d))
* **i18n:** skipTranslationOnMissingKey ([a544563](https://github.com/aurelia/aurelia/commit/a544563))
* **styles:** support the new css modules spec ([9b36a8e](https://github.com/aurelia/aurelia/commit/9b36a8e))
* **i18n:** all binding behavior ([f002dd7](https://github.com/aurelia/aurelia/commit/f002dd7))
* **runtime:** initial runtime support for styles ([6aafcca](https://github.com/aurelia/aurelia/commit/6aafcca))
* **i18n:** signalable rt value converter ([e4dfb10](https://github.com/aurelia/aurelia/commit/e4dfb10))
* **i18n:** signalable nf value-converter ([1e38acb](https://github.com/aurelia/aurelia/commit/1e38acb))
* **i18n:** signalable date-format value-converter ([24653f3](https://github.com/aurelia/aurelia/commit/24653f3))
* **i18n:** signalable t value-converter ([6d31d83](https://github.com/aurelia/aurelia/commit/6d31d83))
* **i18n:** support for unformat ([8d5a4fa](https://github.com/aurelia/aurelia/commit/8d5a4fa))
* **i18n:** basic relative-time implementation ([2ea21b7](https://github.com/aurelia/aurelia/commit/2ea21b7))
* **router:** rename methods in nav route ([634196f](https://github.com/aurelia/aurelia/commit/634196f))
* **i18n:** date and number format with Intl API ([c2405b0](https://github.com/aurelia/aurelia/commit/c2405b0))
* **router:** add separator to nav ([7b73409](https://github.com/aurelia/aurelia/commit/7b73409))
* **router:** separate execute from route for nav route ([5be96e6](https://github.com/aurelia/aurelia/commit/5be96e6))
* **router:** add compare parameters to nav route ([9c69430](https://github.com/aurelia/aurelia/commit/9c69430))
* **router:** add nav update & executable nav route ([9aed948](https://github.com/aurelia/aurelia/commit/9aed948))
* **router:** make link handler ignore anchors without href ([b47da64](https://github.com/aurelia/aurelia/commit/b47da64))
* **router:** add NavRoute export ([043b7f1](https://github.com/aurelia/aurelia/commit/043b7f1))
* **router:** add condition to NavRoute ([6d49758](https://github.com/aurelia/aurelia/commit/6d49758))
* **router:** make NavRoute consideredActive accept function value ([d4b348d](https://github.com/aurelia/aurelia/commit/d4b348d))
* **i18n:** support CE attribute translation ([58e2b93](https://github.com/aurelia/aurelia/commit/58e2b93))
* **observer:** Add the ability to bind an array of objects and strings to a class perf fix ([80fd26b](https://github.com/aurelia/aurelia/commit/80fd26b))
* **i18n:** support for current locale change ([f450b68](https://github.com/aurelia/aurelia/commit/f450b68))
* **i18n:** added change handler to binding ([591f1d8](https://github.com/aurelia/aurelia/commit/591f1d8))
* **i18n:** improved support of append, prepend ([2db042c](https://github.com/aurelia/aurelia/commit/2db042c))
* **i18n:** support for [html],[prepend],[append] ([f0aadd6](https://github.com/aurelia/aurelia/commit/f0aadd6))
* **blur:** blur attribute, basic working state ([177684e](https://github.com/aurelia/aurelia/commit/177684e))
* **i18n:** support for `t=${key}`, `t=[attr]key` ([5f2fdfd](https://github.com/aurelia/aurelia/commit/5f2fdfd))
* **i18n:** alias integration ([03ab122](https://github.com/aurelia/aurelia/commit/03ab122))
* **observer:** Add the ability to bind an array of objects and strings to a class ([fb3ccf2](https://github.com/aurelia/aurelia/commit/fb3ccf2))
* **observer:** Add the ability to bind an array of objects and strings to a class ([5d4ad6e](https://github.com/aurelia/aurelia/commit/5d4ad6e))
* **observer:** Add the ability to bind an array of objects and strings to a class ([75c8418](https://github.com/aurelia/aurelia/commit/75c8418))
* **observer:** Add the ability to bind an array of objects and strings to a class ([e80b279](https://github.com/aurelia/aurelia/commit/e80b279))
* **focus:** add focus attribute ([1972323](https://github.com/aurelia/aurelia/commit/1972323))
* **i18n:** add t-params ([2f559d0](https://github.com/aurelia/aurelia/commit/2f559d0))
* **observer:** Add the ability to bind an object to class ([13bd1d1](https://github.com/aurelia/aurelia/commit/13bd1d1))
* **observer:** Fix up tests and remove redundancy from class accessor ([64294ad](https://github.com/aurelia/aurelia/commit/64294ad))
* **observer:** Add the ability to bind an object to class ([3e7dba7](https://github.com/aurelia/aurelia/commit/3e7dba7))
* **router:** make navs immutable in router interface ([430c2d4](https://github.com/aurelia/aurelia/commit/430c2d4))
* **focus:** add focus attribute ([ec6ba76](https://github.com/aurelia/aurelia/commit/ec6ba76))
* **router:** make lifecycle task add promise when callback returns void ([1877126](https://github.com/aurelia/aurelia/commit/1877126))
* **children:** add and integrate decorator ([ef556b4](https://github.com/aurelia/aurelia/commit/ef556b4))
* **i18n:** add binding+renderer+instructn+pattern ([adb4439](https://github.com/aurelia/aurelia/commit/adb4439))
* **router:** make lifecycle task callback allow void return ([649a911](https://github.com/aurelia/aurelia/commit/649a911))
* **router:** use router configuration and interface ([427e95d](https://github.com/aurelia/aurelia/commit/427e95d))
* **router:** extract load url from router activate ([af26abf](https://github.com/aurelia/aurelia/commit/af26abf))
* **child-observation:** make query pluggable ([81f1a9a](https://github.com/aurelia/aurelia/commit/81f1a9a))
* **child-observation:** hook into runtime process ([f484f84](https://github.com/aurelia/aurelia/commit/f484f84))
* **runtime:** add lifecycle flag propagating template controllers for perf tweaks ([c28db65](https://github.com/aurelia/aurelia/commit/c28db65))
* **runtime:** initial implementation for startup tasks ([57b3363](https://github.com/aurelia/aurelia/commit/57b3363))
* **i18n:** skeleton implementation ([4ab2cff](https://github.com/aurelia/aurelia/commit/4ab2cff))
* **runtime:** initial implementation for startup tasks ([e4e1a14](https://github.com/aurelia/aurelia/commit/e4e1a14))
* **realworld:** use au-nav for main menu ([6f000b9](https://github.com/aurelia/aurelia/commit/6f000b9))
* **plugin-gulp:** conventions plugin for gulp, replaced plugin-requirejs ([c659cc5](https://github.com/aurelia/aurelia/commit/c659cc5))
* **plugin-gulp:** conventions plugin for gulp, replaced plugin-requirejs ([ddb65b8](https://github.com/aurelia/aurelia/commit/ddb65b8))
* **router:** clean up debug for innerhtml ([3509464](https://github.com/aurelia/aurelia/commit/3509464))
* **router:** clean up debug for innerhtml ([1091baf](https://github.com/aurelia/aurelia/commit/1091baf))
* **router:** make nav title use innerhtml ([17dcd1b](https://github.com/aurelia/aurelia/commit/17dcd1b))
* **18n:** add basic unit tests ([d16fcb1](https://github.com/aurelia/aurelia/commit/d16fcb1))
* **i18n:** replacement of textContent ([df53fbf](https://github.com/aurelia/aurelia/commit/df53fbf))
* **i18n:** add i18n skeleton integration with t ([2157bf5](https://github.com/aurelia/aurelia/commit/2157bf5))
* **i18n:** add skeleton package for i18n ([70b5ecf](https://github.com/aurelia/aurelia/commit/70b5ecf))
* **webpack-loader:** webpack-loader on top of plugin-conventions ([0a4b131](https://github.com/aurelia/aurelia/commit/0a4b131))
* **plugin-conventions:** preprocess html template ([fd7134d](https://github.com/aurelia/aurelia/commit/fd7134d))
* **plugin-conventions:** preprocess js/ts resources, adding decorators ([0fa3cb2](https://github.com/aurelia/aurelia/commit/0fa3cb2))
* **realworld:** replace route-href with href & add parameters ([3b7d7d3](https://github.com/aurelia/aurelia/commit/3b7d7d3))
* **realworld:** use au-nav for profile-posts ([6e634d7](https://github.com/aurelia/aurelia/commit/6e634d7))
* **router:** add customizeable classes to au-nav ([a041251](https://github.com/aurelia/aurelia/commit/a041251))
* **realworld:** remove leading / from href ([6730643](https://github.com/aurelia/aurelia/commit/6730643))
* **realworld:** remove -component suffix ([d40b4ba](https://github.com/aurelia/aurelia/commit/d40b4ba))
* **realworld:** rename main viewport ([bff6e9e](https://github.com/aurelia/aurelia/commit/bff6e9e))
* **realworld:** add RouterConfiguration ([bee9832](https://github.com/aurelia/aurelia/commit/bee9832))
* **router:** add only if processing to addProcessingViewports ([29690d0](https://github.com/aurelia/aurelia/commit/29690d0))
* **router:** add mergeViewportInstructions ([687dd5f](https://github.com/aurelia/aurelia/commit/687dd5f))
* **router:** add same component check to viewport instruction ([968e678](https://github.com/aurelia/aurelia/commit/968e678))
* **router:** check entry before replace in cancel ([7350e0c](https://github.com/aurelia/aurelia/commit/7350e0c))
* **router:** improve guard matching & remaining viewports ([6df8e8b](https://github.com/aurelia/aurelia/commit/6df8e8b))
* **router:** clean up guardian & move parameters next to component & refactor viewport defaults ([0c7eaca](https://github.com/aurelia/aurelia/commit/0c7eaca))
* **router:** add navigation guardian ([9130e40](https://github.com/aurelia/aurelia/commit/9130e40))
* **router:** hide viewport header ([15ac438](https://github.com/aurelia/aurelia/commit/15ac438))
* **router:** add style loader to navigation skeleton ([40a742d](https://github.com/aurelia/aurelia/commit/40a742d))
* **router:** add css to navigation skeleton ([2af8e37](https://github.com/aurelia/aurelia/commit/2af8e37))
* **router:** fix issue with scopeContext ([87c00bc](https://github.com/aurelia/aurelia/commit/87c00bc))
* **jit:** default to attr name on empty binding command value ([79a4a5f](https://github.com/aurelia/aurelia/commit/79a4a5f))
* **router:** improve viewport state and description ([178c318](https://github.com/aurelia/aurelia/commit/178c318))
* **router:** use controller parent to find closest ([bdb0804](https://github.com/aurelia/aurelia/commit/bdb0804))
* **router:** add customize to RouterConfiguration ([eed99ad](https://github.com/aurelia/aurelia/commit/eed99ad))
* **runtime:** add parent to $controller ([d00dbc0](https://github.com/aurelia/aurelia/commit/d00dbc0))
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
* **platform:** add isBrowserLike/isWebWorkerLike/isNodeLike variables ([8fd7e8a](https://github.com/aurelia/aurelia/commit/8fd7e8a))
* **kernel:** add restore() fn to PLATFORM ([2ced7dd](https://github.com/aurelia/aurelia/commit/2ced7dd))
* **event-aggregator:** export injectable interface ([e4463c0](https://github.com/aurelia/aurelia/commit/e4463c0))
* **testing:** add match asserts ([f0e0201](https://github.com/aurelia/aurelia/commit/f0e0201))
* **testing:** add more assertions ([62e511b](https://github.com/aurelia/aurelia/commit/62e511b))
* **testing:** implement simple spy ([b8869b5](https://github.com/aurelia/aurelia/commit/b8869b5))
* **testing:** add instanceof assert ([01322f3](https://github.com/aurelia/aurelia/commit/01322f3))
* **lifecycle:** add inline method for begin/end pairs ([7e70443](https://github.com/aurelia/aurelia/commit/7e70443))
* **router:** add missing property ([916ee75](https://github.com/aurelia/aurelia/commit/916ee75))
* **router:** add IRouter ([46ba5c7](https://github.com/aurelia/aurelia/commit/46ba5c7))
* **router:** add configuration ([e1a23af](https://github.com/aurelia/aurelia/commit/e1a23af))
* **router:** update reentry defaults & add tests ([ac2e674](https://github.com/aurelia/aurelia/commit/ac2e674))
* **kernel:** expose general-purpose nextId/resetId functions ([5f4f5a6](https://github.com/aurelia/aurelia/commit/5f4f5a6))
* **jit:** export Char enum ([b4f017c](https://github.com/aurelia/aurelia/commit/b4f017c))
* **router:** add component reentry behavior ([8eae57d](https://github.com/aurelia/aurelia/commit/8eae57d))
* **kernel:** move isNumeric utility to platform for now ([877fddb](https://github.com/aurelia/aurelia/commit/877fddb))
* **testing:** port assert logic from nodejs ([1f7cdb9](https://github.com/aurelia/aurelia/commit/1f7cdb9))
* **observation:** implement batching ([943c0d7](https://github.com/aurelia/aurelia/commit/943c0d7))
* **runtime:** add PriorityBindingBehavior ([2d06ef7](https://github.com/aurelia/aurelia/commit/2d06ef7))
* **controller:** add getAccessor API (and expose $controller to repeater view) ([f19c669](https://github.com/aurelia/aurelia/commit/f19c669))
* **lifecycle:** implement adaptive timeslicing ([84b8e20](https://github.com/aurelia/aurelia/commit/84b8e20))
* **di:** list typing constraint on registration ([37c5524](https://github.com/aurelia/aurelia/commit/37c5524))
* **kernel:** add InstanceProvider to public api ([02b6d16](https://github.com/aurelia/aurelia/commit/02b6d16))
* **attr-binding:** add class/style binding ([7daf461](https://github.com/aurelia/aurelia/commit/7daf461))
* **attr-binding:** add tests for class/style binding command ([ee0e29a](https://github.com/aurelia/aurelia/commit/ee0e29a))
* **script-utils:** add call index to cartesian join loop, add async version ([bfba4cd](https://github.com/aurelia/aurelia/commit/bfba4cd))
* **attr-binding:** configure,exports,attr-pattern,commands ([2dd7124](https://github.com/aurelia/aurelia/commit/2dd7124))
* **attr-syntax:** attr,style, class pattern ([66e3035](https://github.com/aurelia/aurelia/commit/66e3035))
* **attr-binding:** add configuration/renderer/instruction/exports ([41cb920](https://github.com/aurelia/aurelia/commit/41cb920))
* **attr-observer:** add attribute observer ([a82d143](https://github.com/aurelia/aurelia/commit/a82d143))
* **attr-binding:** add attribute binding ([fd284a2](https://github.com/aurelia/aurelia/commit/fd284a2))
* **router:** add initial cypress tests ([3ae5b7c](https://github.com/aurelia/aurelia/commit/3ae5b7c))
* **router:** change parameter separator to parantheses ([12eae80](https://github.com/aurelia/aurelia/commit/12eae80))
* **router:** add route table & update extension points ([bca6311](https://github.com/aurelia/aurelia/commit/bca6311))
* **e2e:** added in au-nav to testing app ([b32303e](https://github.com/aurelia/aurelia/commit/b32303e))
* **e2e:** fix up scripts and pathing for cypress ([cccb788](https://github.com/aurelia/aurelia/commit/cccb788))
* **e2e:** default router package testing route ([a403f5e](https://github.com/aurelia/aurelia/commit/a403f5e))
* **e2e:** more router configuration for testing app ([da81006](https://github.com/aurelia/aurelia/commit/da81006))
* **e2e:** update test run task ([bbd93c5](https://github.com/aurelia/aurelia/commit/bbd93c5))
* **e2e:** added in beginning of test app for cypress testing ([a5195f2](https://github.com/aurelia/aurelia/commit/a5195f2))
* **e2e:** add in cypress package.json ([51a10c6](https://github.com/aurelia/aurelia/commit/51a10c6))
* **e2e:** configure cypress to use test folder ([9176c66](https://github.com/aurelia/aurelia/commit/9176c66))
* **e2e:** add in cypress for e2e testing ([6d6730d](https://github.com/aurelia/aurelia/commit/6d6730d))
* **aurelia:** make the host element available for injection in the app root ([a696649](https://github.com/aurelia/aurelia/commit/a696649))
* **kernel:** add InjectArray shorthand type ([313e0bd](https://github.com/aurelia/aurelia/commit/313e0bd))
* **router:** add stateful component caching for viewport ([5276f7b](https://github.com/aurelia/aurelia/commit/5276f7b))
* **router:** add redirect to canEnter result ([6e966d9](https://github.com/aurelia/aurelia/commit/6e966d9))
* **router:** add queued browser history ([26833b1](https://github.com/aurelia/aurelia/commit/26833b1))
* **router:** add first entry flag to history browser ([2c3982f](https://github.com/aurelia/aurelia/commit/2c3982f))
* **router:** add api for get all viewports to router ([cd73f04](https://github.com/aurelia/aurelia/commit/cd73f04))
* **router:** migrate route-recognizer ([13ea52e](https://github.com/aurelia/aurelia/commit/13ea52e))
* **kernel:** migrate aurelia-path functions ([aa840e7](https://github.com/aurelia/aurelia/commit/aa840e7))
* **runtime:** fully implement patch mode ([e37c0f3](https://github.com/aurelia/aurelia/commit/e37c0f3))
* **runtime-html:** re-enable svg ([52bf399](https://github.com/aurelia/aurelia/commit/52bf399))
* **all:** add tracer argument stringification and improve tracing ([5ccdc42](https://github.com/aurelia/aurelia/commit/5ccdc42))
* **kernel:** add localStorage property to global ([53fe994](https://github.com/aurelia/aurelia/commit/53fe994))
* **runtime:** expose full DOM ([0680c16](https://github.com/aurelia/aurelia/commit/0680c16))
* **kernel:** port EventAggregator to vNext ([4e8699c](https://github.com/aurelia/aurelia/commit/4e8699c))
* **runtime:** initial implementation for patch lifecycle ([209a59a](https://github.com/aurelia/aurelia/commit/209a59a))
* **kernel:** make EventAggregatorCallback generic ([d6bf68a](https://github.com/aurelia/aurelia/commit/d6bf68a))
* **kernel:** add EventAggregator to vNext ([6388074](https://github.com/aurelia/aurelia/commit/6388074))
* **repeat:** add support for keyed mode ([56dacce](https://github.com/aurelia/aurelia/commit/56dacce))
* **runtime-html-jsdom:** add customevent constructor to instantiation ([62225de](https://github.com/aurelia/aurelia/commit/62225de))
* **runtime-html-browser:** add customevent constructor to instantiation ([c2b5630](https://github.com/aurelia/aurelia/commit/c2b5630))
* **runtime-html:** add custom event constructor ([31d4536](https://github.com/aurelia/aurelia/commit/31d4536))
* **runtime:** added exportable dom object ([9419faa](https://github.com/aurelia/aurelia/commit/9419faa))
* **fetch-client:** tests and package changes ([96cf064](https://github.com/aurelia/aurelia/commit/96cf064))
* **runtime:** interfaces for create and dispatch event methods ([9967a6c](https://github.com/aurelia/aurelia/commit/9967a6c))
* **runtime-html:** create event and dispatch methods ([447646e](https://github.com/aurelia/aurelia/commit/447646e))
* **fetch-client:** porting fetch client ([e0d3ac9](https://github.com/aurelia/aurelia/commit/e0d3ac9))
* **di:** autoregister plain class as singleton and add recursion guard ([72f76aa](https://github.com/aurelia/aurelia/commit/72f76aa))
* **observation:** add tracing to observer constructors ([5aead83](https://github.com/aurelia/aurelia/commit/5aead83))
* **binding:** initial implementation for proxy observer ([71db77d](https://github.com/aurelia/aurelia/commit/71db77d))
* **dirty-checker:** expose dirty check settings ([4bd3980](https://github.com/aurelia/aurelia/commit/4bd3980))
* **kernel:** add a global raf ticker ([32680a0](https://github.com/aurelia/aurelia/commit/32680a0))
* **runtime:** fix+test the computed observer ([3611625](https://github.com/aurelia/aurelia/commit/3611625))
* **router:** add previous to navigation instruction ([6cdc27b](https://github.com/aurelia/aurelia/commit/6cdc27b))
* **router:** add no-history on viewport ([45f19f0](https://github.com/aurelia/aurelia/commit/45f19f0))
* **router:** add no-link on viewport ([dc96230](https://github.com/aurelia/aurelia/commit/dc96230))
* **router:** add viewport default component & nav route consider active ([f70865c](https://github.com/aurelia/aurelia/commit/f70865c))
* **router:** add url transform & test app ([7597225](https://github.com/aurelia/aurelia/commit/7597225))
* **kernel:** add performance profiler ([32c2a66](https://github.com/aurelia/aurelia/commit/32c2a66))
* **event-manager:** make EventManager disposable ([c857547](https://github.com/aurelia/aurelia/commit/c857547))
* **runtime:** make runtime-html fully work in jsdom/nodejs ([e34f9b1](https://github.com/aurelia/aurelia/commit/e34f9b1))
* **di:** make registration api fluent and allow adding registrations directly to createContainer ([4af2fd5](https://github.com/aurelia/aurelia/commit/4af2fd5))
* **runtime-html-jsdom:** add jsdom initializer ([277fc7d](https://github.com/aurelia/aurelia/commit/277fc7d))
* **jit-html:** expose individual registrations and configs ([1a2b839](https://github.com/aurelia/aurelia/commit/1a2b839))
* **runtime-html:** expose individual registrations and configs ([dc12f77](https://github.com/aurelia/aurelia/commit/dc12f77))
* **runtime:** expose individual registrations and configs ([b9b4c49](https://github.com/aurelia/aurelia/commit/b9b4c49))
* **jit:** expose individual registrations and configs ([0ce71e2](https://github.com/aurelia/aurelia/commit/0ce71e2))
* **router:** add parallel activation of components ([530d9a2](https://github.com/aurelia/aurelia/commit/530d9a2))
* **runtime-pixi:** simple initial implementation for renderer and sprite ([9a53ba8](https://github.com/aurelia/aurelia/commit/9a53ba8))
* **router:** add lifecycle hooks & update import references ([86ef8a7](https://github.com/aurelia/aurelia/commit/86ef8a7))
* **router:** add parameters to navigation & add tests & add test app ([68858bd](https://github.com/aurelia/aurelia/commit/68858bd))
* **router:** add search to router and viewport ([6193768](https://github.com/aurelia/aurelia/commit/6193768))
* **router:** add history browser search ([b18a522](https://github.com/aurelia/aurelia/commit/b18a522))
* **router:** stop too late update on fullStatePath in history-browser ([4c5b50e](https://github.com/aurelia/aurelia/commit/4c5b50e))
* **router:** add navigation queue ([c067faf](https://github.com/aurelia/aurelia/commit/c067faf))
* **router:** add nav support & add "layout" test ([88db3ad](https://github.com/aurelia/aurelia/commit/88db3ad))
* **router:** add nav ([b7cb06f](https://github.com/aurelia/aurelia/commit/b7cb06f))
* **all:** add friendly names to all interface symbols ([57876db](https://github.com/aurelia/aurelia/commit/57876db))
* **dom-initializer:** allow undefined ISinglePageApp ([add1822](https://github.com/aurelia/aurelia/commit/add1822))
* **lifecycle:** expose queue processing methods ([2086e4e](https://github.com/aurelia/aurelia/commit/2086e4e))
* **jit:** expose parseExpression method ([f47d335](https://github.com/aurelia/aurelia/commit/f47d335))
* **runtime:** expose mixed decorator api's ([cae5959](https://github.com/aurelia/aurelia/commit/cae5959))
* **kernel:** make everything work correctly in node env ([4a10d77](https://github.com/aurelia/aurelia/commit/4a10d77))
* **di:** add tracing to get and construct methods ([1c0fb83](https://github.com/aurelia/aurelia/commit/1c0fb83))
* **runtime-html:** implement DI configurations and expose configuration API ([1d2b457](https://github.com/aurelia/aurelia/commit/1d2b457))
* **runtime:** expose RuntimeConfiguration api ([a37a375](https://github.com/aurelia/aurelia/commit/a37a375))
* **runtime-html:** add runtime-html package with html-specific runtime features ([412b01a](https://github.com/aurelia/aurelia/commit/412b01a))
* **aurelia:** implement API to provide a DOM instance to the runtime ([2089dcb](https://github.com/aurelia/aurelia/commit/2089dcb))
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
* **template-compiler:** implement surrogate instructions ([fa65d6a](https://github.com/aurelia/aurelia/commit/fa65d6a))
* **all:** implement dynamicOptions decorator and convention ([b5893ef](https://github.com/aurelia/aurelia/commit/b5893ef))
* **jit:** generalize the 'for' binding command ([93a8edb](https://github.com/aurelia/aurelia/commit/93a8edb))
* **jit:** initial element-binder implementation ([aa002d8](https://github.com/aurelia/aurelia/commit/aa002d8))
* **semantic-model:** trace compile methods ([9904da5](https://github.com/aurelia/aurelia/commit/9904da5))
* **runtime:** add tracing capabilities to various lifecycle flows ([7018662](https://github.com/aurelia/aurelia/commit/7018662))
* **kernel,debug:** add a simple tracer implementation ([89bc436](https://github.com/aurelia/aurelia/commit/89bc436))
* **replaceable:** allow one level of parent scope traversal ([8c34244](https://github.com/aurelia/aurelia/commit/8c34244))
* **jit:** implement replaceable compilation ([59c86b7](https://github.com/aurelia/aurelia/commit/59c86b7))
* **di:** report meaningful error when trying to resolve an interface with no registrations ([43b299e](https://github.com/aurelia/aurelia/commit/43b299e))
* **jit:** initial implementation of configurable syntax-interpreter ([bc3ff3c](https://github.com/aurelia/aurelia/commit/bc3ff3c))
* **aurelia:** add startup api shorthand ([a898049](https://github.com/aurelia/aurelia/commit/a898049))
* **lifecycle:** initial implementation for general-purpose lifecycle task ([d921922](https://github.com/aurelia/aurelia/commit/d921922))
* **di:** add transient and singleton decorators ([7afc5dd](https://github.com/aurelia/aurelia/commit/7afc5dd))
* **runtime:** pass LifecycleFlags through all regular lifecycle methods ([a3eeec5](https://github.com/aurelia/aurelia/commit/a3eeec5))
* **binding:** implement BindLifecycle for correct ordering of bound/unbound calls ([c403035](https://github.com/aurelia/aurelia/commit/c403035))
* **customElement:** make build and instructions properties optional ([8f70dcf](https://github.com/aurelia/aurelia/commit/8f70dcf))
* **lifecycle:** add state flags for binding/unbinding/attaching/detaching ([d504f5d](https://github.com/aurelia/aurelia/commit/d504f5d))
* **templating:** centralize all TemplateDefinition creation into reusable definitionBuilder ([25aba89](https://github.com/aurelia/aurelia/commit/25aba89))
* **customElement:** report error code on nil nameOrSource ([0a42e5e](https://github.com/aurelia/aurelia/commit/0a42e5e))
* **bindable:** allow declaring a bindable property via class decorator and direct invocation ([b9d1b12](https://github.com/aurelia/aurelia/commit/b9d1b12))


### Bug Fixes:

* **tests:** correction ([8edc003](https://github.com/aurelia/aurelia/commit/8edc003))
* **scheduler:** pass in correct delta ([93ea64a](https://github.com/aurelia/aurelia/commit/93ea64a))
* **dirty-checker:** use render task queue ([21f9b69](https://github.com/aurelia/aurelia/commit/21f9b69))
* **scheduler:** add timeout to idleCallback for ff ([620340e](https://github.com/aurelia/aurelia/commit/620340e))
* **test:** linting issues ([74c0cfc](https://github.com/aurelia/aurelia/commit/74c0cfc))
* **scheduler:** try another microTaskQueue thing for ff ([f2f954a](https://github.com/aurelia/aurelia/commit/f2f954a))
* **test:** fix spy issue ([c2f43fd](https://github.com/aurelia/aurelia/commit/c2f43fd))
* **scheduler:** set/unset appropriate task for recursive microtask checking ([22ff346](https://github.com/aurelia/aurelia/commit/22ff346))
* **scheduler:** fix persistent task cancellation and add more tests ([88c897b](https://github.com/aurelia/aurelia/commit/88c897b))
* **scheduler:** pass through persistent / reusable params ([9078400](https://github.com/aurelia/aurelia/commit/9078400))
* **scheduler:** account for persistent tasks when yielding ([850657d](https://github.com/aurelia/aurelia/commit/850657d))
* **observers:** clear task when done ([6163a89](https://github.com/aurelia/aurelia/commit/6163a89))
* **scheduler:** various bugfixes/improvements in task reuse and removal ([107ae0c](https://github.com/aurelia/aurelia/commit/107ae0c))
* **scheduler:** fix registrations and move to separate file ([2561c5e](https://github.com/aurelia/aurelia/commit/2561c5e))
* **runtime:** binary expression connect issue ([039f4f2](https://github.com/aurelia/aurelia/commit/039f4f2))
* **metadata:** add metadata and decorate function polyfills ([b79f55f](https://github.com/aurelia/aurelia/commit/b79f55f))
* **scheduler:** properly implement persistent tasks ([d604394](https://github.com/aurelia/aurelia/commit/d604394))
* **scheduler:** correct setTimeout requestor index ([02298b2](https://github.com/aurelia/aurelia/commit/02298b2))
* **rendering-engine:** always return a CompiledTemplate even if there is no template ([7042ca8](https://github.com/aurelia/aurelia/commit/7042ca8))
* **controller:** use the compiled definition to get the projector ([7208b6c](https://github.com/aurelia/aurelia/commit/7208b6c))
* **di:** properly jitRegister resource definitions ([2659889](https://github.com/aurelia/aurelia/commit/2659889))
* **bindable:** inherit from prototype ([b3f6c44](https://github.com/aurelia/aurelia/commit/b3f6c44))
* **children:** inherit from prototype ([e08e5a1](https://github.com/aurelia/aurelia/commit/e08e5a1))
* **tests:** tri-state boolean radio buttons ([d201f09](https://github.com/aurelia/aurelia/commit/d201f09))
* **tests:** failing test for checked matcher ([374ce9b](https://github.com/aurelia/aurelia/commit/374ce9b))
* **tests:** correction ([328cba8](https://github.com/aurelia/aurelia/commit/328cba8))
* **tests:** make sure test run on both node/browser ([4896920](https://github.com/aurelia/aurelia/commit/4896920))
* **tests:** make sure test run on both node/browser ([554386a](https://github.com/aurelia/aurelia/commit/554386a))
* **tests:** make sure test run on both node/browser ([f800bea](https://github.com/aurelia/aurelia/commit/f800bea))
* **template-binder:** camel name in multi bindings ([7abc6ae](https://github.com/aurelia/aurelia/commit/7abc6ae))
* **view:** handle inheritance correctly / fix tests ([4956c68](https://github.com/aurelia/aurelia/commit/4956c68))
* **view:** more decorator/metadata fixes ([8db676b](https://github.com/aurelia/aurelia/commit/8db676b))
* **router:** fix viewport spacing issue ([acb3508](https://github.com/aurelia/aurelia/commit/acb3508))
* **au-dom:** add template compiler dep ([31b3c94](https://github.com/aurelia/aurelia/commit/31b3c94))
* **bindable:** correctly traverse bindable lookup ([5cdf5f3](https://github.com/aurelia/aurelia/commit/5cdf5f3))
* **runtime:** missing notify on new value of key ([55c9fdf](https://github.com/aurelia/aurelia/commit/55c9fdf))
* **binding-command:** default to null type ([8900699](https://github.com/aurelia/aurelia/commit/8900699))
* **di:** fix annotation name conflict ([177604a](https://github.com/aurelia/aurelia/commit/177604a))
* **children:** handle definition properly ([a9e4339](https://github.com/aurelia/aurelia/commit/a9e4339))
* **bindable:** handle definition properly ([b66aac8](https://github.com/aurelia/aurelia/commit/b66aac8))
* **jit-html:** checked-observer issue ([d8693cc](https://github.com/aurelia/aurelia/commit/d8693cc))
* **mount-strategy:** make const enum ([4fb0274](https://github.com/aurelia/aurelia/commit/4fb0274))
* **portal:** add 2nd param for hold, add tests, export mountstrategy ([d797f9a](https://github.com/aurelia/aurelia/commit/d797f9a))
* **au-dom:** revert weird changes ([a696579](https://github.com/aurelia/aurelia/commit/a696579))
* **au-dom:** revert weird changes ([bcf4c85](https://github.com/aurelia/aurelia/commit/bcf4c85))
* **portal:** separate API for hold parent container ([537eb97](https://github.com/aurelia/aurelia/commit/537eb97))
* **bindable:** use ctor instead of prototype to store metadata ([7844925](https://github.com/aurelia/aurelia/commit/7844925))
* **children:** use ctor instead of prototype to store metadata ([5912462](https://github.com/aurelia/aurelia/commit/5912462))
* **controller:** assign $controller again ([e6ef63b](https://github.com/aurelia/aurelia/commit/e6ef63b))
* **custom-element:** use transient registration ([54048cd](https://github.com/aurelia/aurelia/commit/54048cd))
* **custom-attribute:** use transient registration ([1f97380](https://github.com/aurelia/aurelia/commit/1f97380))
* **di:** pass in the requestor to factory.construct for singletons ([7b54baa](https://github.com/aurelia/aurelia/commit/7b54baa))
* **reporter:** use correct message for code 16 and apply format variables to error msg ([1c8bdb1](https://github.com/aurelia/aurelia/commit/1c8bdb1))
* **controller:** store host ([266652d](https://github.com/aurelia/aurelia/commit/266652d))
* **resource:** use metadata for resolution ([471d90a](https://github.com/aurelia/aurelia/commit/471d90a))
* **di:** look for resource registration first ([028ad0b](https://github.com/aurelia/aurelia/commit/028ad0b))
* **rendering-engine:** property inject compiler ([617f215](https://github.com/aurelia/aurelia/commit/617f215))
* **custom-element:** use generated type if null ([69aed3c](https://github.com/aurelia/aurelia/commit/69aed3c))
* **tests:** build issue correction ([b843149](https://github.com/aurelia/aurelia/commit/b843149))
* **tests:** build issue correction ([158ff3f](https://github.com/aurelia/aurelia/commit/158ff3f))
* **create-element:** fix types and refs ([9fd883d](https://github.com/aurelia/aurelia/commit/9fd883d))
* **bindable:** fix deco signature ([5528572](https://github.com/aurelia/aurelia/commit/5528572))
* **custom-element:** add missing isType and behaviorFor back in + renames ([8e55a2a](https://github.com/aurelia/aurelia/commit/8e55a2a))
* **custom-attribute:** add getDefinition ([3b22abb](https://github.com/aurelia/aurelia/commit/3b22abb))
* **runtime:** attribute order for checkbox ([49a1d43](https://github.com/aurelia/aurelia/commit/49a1d43))
* **tests:** tweak affected tests ([8678836](https://github.com/aurelia/aurelia/commit/8678836))
* **template-compiler:** minifier friendlier ([498e3d5](https://github.com/aurelia/aurelia/commit/498e3d5))
* **template-compiler:** make surrogate signal mandatory ([6b04898](https://github.com/aurelia/aurelia/commit/6b04898))
* **set-class-inst:** pre-prepare classlist ([292cf5a](https://github.com/aurelia/aurelia/commit/292cf5a))
* **style-inst:** correctly compile surrogate style/ add more tests ([1ee91df](https://github.com/aurelia/aurelia/commit/1ee91df))
* **setstyle-inst:** use correct type ([0c468ed](https://github.com/aurelia/aurelia/commit/0c468ed))
* **inst:** add missing exports, instruction for surrogate style attr ([dede01e](https://github.com/aurelia/aurelia/commit/dede01e))
* **template-compiler:** differentiate class on surrogate ([23b6b93](https://github.com/aurelia/aurelia/commit/23b6b93))
* **runtime-html:** add infra for rendering surrogate class/style attributes ([8d2659a](https://github.com/aurelia/aurelia/commit/8d2659a))
* **ref:** add update source flag to binding ([19fdc34](https://github.com/aurelia/aurelia/commit/19fdc34))
* **ref:** use updatesource in self observer ([9354994](https://github.com/aurelia/aurelia/commit/9354994))
* **tests:** comment out pre-refactoring tests (has todo) ([4aee8bd](https://github.com/aurelia/aurelia/commit/4aee8bd))
* **tests:** comment out pre-refactoring tests (has todo) ([b5854f8](https://github.com/aurelia/aurelia/commit/b5854f8))
* **tests:** comment out pre-refactoring tests (has todo) ([75e8c99](https://github.com/aurelia/aurelia/commit/75e8c99))
* **ref:** remove bind optimization ([a270f82](https://github.com/aurelia/aurelia/commit/a270f82))
* **ref-tests:** add tests for abitrary declaration order of ref binding ([82d8ed4](https://github.com/aurelia/aurelia/commit/82d8ed4))
* **ref:** add always notify flag ([261bc10](https://github.com/aurelia/aurelia/commit/261bc10))
* **i18n:** type definition ([64332d4](https://github.com/aurelia/aurelia/commit/64332d4))
* **renderer:** copy metadata to decorated target ([b5d647e](https://github.com/aurelia/aurelia/commit/b5d647e))
* **i18n:** i18n interface ([1635784](https://github.com/aurelia/aurelia/commit/1635784))
* **render-context:** add path property ([bd999f5](https://github.com/aurelia/aurelia/commit/bd999f5))
* **tests:** computed-observer typing issue ([6a6043c](https://github.com/aurelia/aurelia/commit/6a6043c))
* **test:** linting issue ([0ef3878](https://github.com/aurelia/aurelia/commit/0ef3878))
* **tests:** computed observer ([a074800](https://github.com/aurelia/aurelia/commit/a074800))
* **kernel:** fix bound deco ([f7a9d2f](https://github.com/aurelia/aurelia/commit/f7a9d2f))
* **test:** CI issues ([1554cdd](https://github.com/aurelia/aurelia/commit/1554cdd))
* **tests:** linitng issues ([16df0e1](https://github.com/aurelia/aurelia/commit/16df0e1))
* **tests:** linting issues ([3f85553](https://github.com/aurelia/aurelia/commit/3f85553))
* **jsdom:** enable pretendToBeVisual by default ([396cafe](https://github.com/aurelia/aurelia/commit/396cafe))
* **integration:** easier test boilerplate ([11b2f35](https://github.com/aurelia/aurelia/commit/11b2f35))
* **plugin-conventions:** check import statement on new "aurelia" package, add test coverage ([fcff1de](https://github.com/aurelia/aurelia/commit/fcff1de))
* **plugin-conventions:** add missing support of templateController ([8ab115c](https://github.com/aurelia/aurelia/commit/8ab115c))
* **runtime:** computed bug ([641ba1c](https://github.com/aurelia/aurelia/commit/641ba1c))
* **runtime:** computed-observer overridden config ([6363d47](https://github.com/aurelia/aurelia/commit/6363d47))
* **template-binder:** fix slip-up ([6142db4](https://github.com/aurelia/aurelia/commit/6142db4))
* **custom-attr:** define parsing behavior clearer ([32e7ec8](https://github.com/aurelia/aurelia/commit/32e7ec8))
* **let:** to-view-model -> to-binding-context ([be22bc7](https://github.com/aurelia/aurelia/commit/be22bc7))
* **template-binder:** properly handle multiAttr binding edge cases ([d44d8fd](https://github.com/aurelia/aurelia/commit/d44d8fd))
* **let:** minor left over ([ae806eb](https://github.com/aurelia/aurelia/commit/ae806eb))
* **let:** to-view-model -> to-binding-context ([a201a32](https://github.com/aurelia/aurelia/commit/a201a32))
* **convention:** map inputmode -> inputMode ([3e7b0e6](https://github.com/aurelia/aurelia/commit/3e7b0e6))
* **repeat:** revert changes related to iterator binding ([3edbcd0](https://github.com/aurelia/aurelia/commit/3edbcd0))
* **repeat:** fix map delete observation, add more tests, normalize items in repeat ([f62df34](https://github.com/aurelia/aurelia/commit/f62df34))
* **repeat:** remove debugger ([c42f28a](https://github.com/aurelia/aurelia/commit/c42f28a))
* **repeat:** basic test case with array ([530eb33](https://github.com/aurelia/aurelia/commit/530eb33))
* **repeat:** add contextual props back ([4083fb4](https://github.com/aurelia/aurelia/commit/4083fb4))
* **i18n-docs:** removed last code-block file name ([1884b15](https://github.com/aurelia/aurelia/commit/1884b15))
* **i18n-docs:** removed last code-block file name ([698f626](https://github.com/aurelia/aurelia/commit/698f626))
* **docs:** removed file name from code block ([70961d8](https://github.com/aurelia/aurelia/commit/70961d8))
* **i18n:** TranslationBinding did not re-evalute parametersExpr correctly ([fc20327](https://github.com/aurelia/aurelia/commit/fc20327))
* ***:** Text and code example did not match. ([8c79790](https://github.com/aurelia/aurelia/commit/8c79790))
* **custom-attr:** skip failing tests, tweak tests to reflect real usage ([e91f40d](https://github.com/aurelia/aurelia/commit/e91f40d))
* **custom-attr:** more tests for some common scenarios ([e41e3ff](https://github.com/aurelia/aurelia/commit/e41e3ff))
* **custom-attr:** more test cases for multi binding detection ([9c118ea](https://github.com/aurelia/aurelia/commit/9c118ea))
* **template-binder:** parse attr value to detect multi bindings ([4898e7f](https://github.com/aurelia/aurelia/commit/4898e7f))
* **custom-attr:** define parsing behavior clearer ([526b557](https://github.com/aurelia/aurelia/commit/526b557))
* **array-observer:** fix splice edge case ([5a246a7](https://github.com/aurelia/aurelia/commit/5a246a7))
* **kernel:** only propagate globally registered resources to child render contexts ([1ccf9c0](https://github.com/aurelia/aurelia/commit/1ccf9c0))
* **kernel:** cover more edge cases in camel/kebabCase ([a7a594f](https://github.com/aurelia/aurelia/commit/a7a594f))
* **:** Remove tearDown barrel ([212207d](https://github.com/aurelia/aurelia/commit/212207d))
* **:** Fix broken http server ([3f9614b](https://github.com/aurelia/aurelia/commit/3f9614b))
* **tests:** use map/reduce instead of flatmap ([b591f14](https://github.com/aurelia/aurelia/commit/b591f14))
* **pathing:** Fix pathing for js resolution ([2d0dead](https://github.com/aurelia/aurelia/commit/2d0dead))
* **:** Try http-server now that paths r fixed ([13c445a](https://github.com/aurelia/aurelia/commit/13c445a))
* **platform:** add now() polyfill for strange runtimes ([364dc06](https://github.com/aurelia/aurelia/commit/364dc06))
* **plugin-conventions:** upgrade modify-code to latest version to fix a preprocess bug ([6d018a2](https://github.com/aurelia/aurelia/commit/6d018a2))
* **plugin-conventions:** new decorator has to be injected before existing decorators ([437596c](https://github.com/aurelia/aurelia/commit/437596c))
* **styles:** proper local vs. global style resolution ([95791b1](https://github.com/aurelia/aurelia/commit/95791b1))
* **bindable-primary:** cleanup debug code, add more tests ([8e2054d](https://github.com/aurelia/aurelia/commit/8e2054d))
* **bindable-primary:** cleanup debug code, add more tests ([f812a55](https://github.com/aurelia/aurelia/commit/f812a55))
* **ref:** fix ref usage ([bbdfbec](https://github.com/aurelia/aurelia/commit/bbdfbec))
* **compiler:** correctly build surrogates length ([5c032f4](https://github.com/aurelia/aurelia/commit/5c032f4))
* **testing:** import correct interfaces ([2b534f3](https://github.com/aurelia/aurelia/commit/2b534f3))
* **all:** rename root au -> aurelia, auRefs -> au, fix tests ([edeb66b](https://github.com/aurelia/aurelia/commit/edeb66b))
* **template-binderf:** ensure custom attribute are processed first ([b6177cb](https://github.com/aurelia/aurelia/commit/b6177cb))
* **ref:** tweak reference setting timing ([6c7b30a](https://github.com/aurelia/aurelia/commit/6c7b30a))
* **ref:** refactor wacky getRefTarget logic ([781a14a](https://github.com/aurelia/aurelia/commit/781a14a))
* **ref:** compile ref normally ([86b27c3](https://github.com/aurelia/aurelia/commit/86b27c3))
* **ref:** add ref binding cmd registration ([e69966a](https://github.com/aurelia/aurelia/commit/e69966a))
* **ref:** properly set reference on host ([719e50b](https://github.com/aurelia/aurelia/commit/719e50b))
* **template-compiler:** add recursive test cases for custom attr + event pair ([27c19ee](https://github.com/aurelia/aurelia/commit/27c19ee))
* **template-compiler:** harmony compilation on surrogate el ([53b8a49](https://github.com/aurelia/aurelia/commit/53b8a49))
* **webpack-loader:** need to use "!!" in "!!raw-loader!" to bypass all loaders in webpack config ([5c00dbd](https://github.com/aurelia/aurelia/commit/5c00dbd))
* **plugin-conventions:** proper support of HTML-only element in format other than .html ([73860ec](https://github.com/aurelia/aurelia/commit/73860ec))
* **plugin-conventions:** turn off ShadowDOM for element with one-word tag name ([d1f10ff](https://github.com/aurelia/aurelia/commit/d1f10ff))
* **di:** defer should not register primitives ([2d19d6e](https://github.com/aurelia/aurelia/commit/2d19d6e))
* **binding-language:** allow binding command to take precedence over custom attr ([cf24681](https://github.com/aurelia/aurelia/commit/cf24681))
* **i18n:** e2e test correction ([4c8e312](https://github.com/aurelia/aurelia/commit/4c8e312))
* **harmony-compilation:** tweaks flags, revert cond ([dd403bd](https://github.com/aurelia/aurelia/commit/dd403bd))
* **resources:** base registration on the actual registered type ([f8fc3d6](https://github.com/aurelia/aurelia/commit/f8fc3d6))
* **view-locator:** final typing issue ([bb903f1](https://github.com/aurelia/aurelia/commit/bb903f1))
* **template-binder:** use new flag ([06e7089](https://github.com/aurelia/aurelia/commit/06e7089))
* **binding-type:** add back isEventCommand ([2f37532](https://github.com/aurelia/aurelia/commit/2f37532))
* **binding-type:** adjust flags bits, tweak tests ([0bac00f](https://github.com/aurelia/aurelia/commit/0bac00f))
* **binding-language:** add IgnoreCustomAttr to binding type ([02b6903](https://github.com/aurelia/aurelia/commit/02b6903))
* **bindign-language-tests:** let some tests run in browser only ([1614052](https://github.com/aurelia/aurelia/commit/1614052))
* **binding-language-tests:** Element -> INode ([9dc9574](https://github.com/aurelia/aurelia/commit/9dc9574))
* **binding-language:** allow binding command to take precedence over custom attr ([bc6dcfc](https://github.com/aurelia/aurelia/commit/bc6dcfc))
* **view-locator:** improve types and simplify tests ([2ecb8c4](https://github.com/aurelia/aurelia/commit/2ecb8c4))
* **IViewLocator:** change registration strategy ([033d9d7](https://github.com/aurelia/aurelia/commit/033d9d7))
* **jit-html:** add convention for html attributes ([3c2a05a](https://github.com/aurelia/aurelia/commit/3c2a05a))
* **html-convention:** 3 ls in scrollleft ([51d8f04](https://github.com/aurelia/aurelia/commit/51d8f04))
* **i18n:** fixed relative-time formatting issue ([19f32c5](https://github.com/aurelia/aurelia/commit/19f32c5))
* **i18n:** fixed i18n related CI issues ([fa994d7](https://github.com/aurelia/aurelia/commit/fa994d7))
* **tests:** tweak TemplateBinder ([b00e3da](https://github.com/aurelia/aurelia/commit/b00e3da))
* **jit-html:** add convention for html attributes ([ce07a92](https://github.com/aurelia/aurelia/commit/ce07a92))
* **i18n:** post-review changes ([b797d3f](https://github.com/aurelia/aurelia/commit/b797d3f))
* **i18n:** type def for locale ([eabf0e3](https://github.com/aurelia/aurelia/commit/eabf0e3))
* **i18n:** post-review changes ([81265bd](https://github.com/aurelia/aurelia/commit/81265bd))
* **view-locator:** improve some typings ([800fe80](https://github.com/aurelia/aurelia/commit/800fe80))
* **i18n:** waited for i18next init in beforeBind ([fc3073d](https://github.com/aurelia/aurelia/commit/fc3073d))
* **i18n:** post-review changes ([d94d030](https://github.com/aurelia/aurelia/commit/d94d030))
* **i18n:** corrected indentation ([7b5a6f3](https://github.com/aurelia/aurelia/commit/7b5a6f3))
* **styles:** pull shadow root type from jsdom ([8e9f1a5](https://github.com/aurelia/aurelia/commit/8e9f1a5))
* **styles:** adjust some types ([dbddd70](https://github.com/aurelia/aurelia/commit/dbddd70))
* **jsdom:** add missing types ([084f4e2](https://github.com/aurelia/aurelia/commit/084f4e2))
* **styles:** ensure all styles infrastructure uses the dom abstraction ([2c397ec](https://github.com/aurelia/aurelia/commit/2c397ec))
* **i18n:** code-climate issues ([3871ac3](https://github.com/aurelia/aurelia/commit/3871ac3))
* **styles:** address two deep scan issues ([4906098](https://github.com/aurelia/aurelia/commit/4906098))
* **styles:** ensure there is always a root shadow dom style ([4e69c3f](https://github.com/aurelia/aurelia/commit/4e69c3f))
* **i18n:** code climate fix ([4e62564](https://github.com/aurelia/aurelia/commit/4e62564))
* **i18n:** code climate ([0b0502e](https://github.com/aurelia/aurelia/commit/0b0502e))
* **i18n:** build-failure correction ([3235970](https://github.com/aurelia/aurelia/commit/3235970))
* **i18n:** code-climate issues ([1a1ee6d](https://github.com/aurelia/aurelia/commit/1a1ee6d))
* **i18n:** alias registration for `.bind` pattern ([47b95c5](https://github.com/aurelia/aurelia/commit/47b95c5))
* **deepscan:** removed unused import ([ec883a1](https://github.com/aurelia/aurelia/commit/ec883a1))
* **styles:** only allow css strings w/ shadow dom style element strategy ([6328ba4](https://github.com/aurelia/aurelia/commit/6328ba4))
* **i18n:** disabling singular rt tests ([52dcaab](https://github.com/aurelia/aurelia/commit/52dcaab))
* **runtime:** export style configuration ([0e47d7c](https://github.com/aurelia/aurelia/commit/0e47d7c))
* **i18n:** correction for node ([78efceb](https://github.com/aurelia/aurelia/commit/78efceb))
* **realworld:** update to latest router ([15392e5](https://github.com/aurelia/aurelia/commit/15392e5))
* **all:** build errors related to children observers ([1658844](https://github.com/aurelia/aurelia/commit/1658844))
* **child-observation:** ensure observers and get/set always present ([1c27331](https://github.com/aurelia/aurelia/commit/1c27331))
* **ChildObserver:** remove redundant lifecycle arg ([50f86ac](https://github.com/aurelia/aurelia/commit/50f86ac))
* **flags:** only store persistent observer flags ([e597b77](https://github.com/aurelia/aurelia/commit/e597b77))
* **child-observation:** correct shadow projector and children observer ([721d6d8](https://github.com/aurelia/aurelia/commit/721d6d8))
* **runtime:** cleanup unused flags to get the highest flag no to SMI again ([4bc20d3](https://github.com/aurelia/aurelia/commit/4bc20d3))
* **binding-command:** export getTarget ([6d316cc](https://github.com/aurelia/aurelia/commit/6d316cc))
* **plugin-gulp:** fix html pair checking in plugin-gulp ([be01413](https://github.com/aurelia/aurelia/commit/be01413))
* **start-task:** fix strategy mapping ([3279354](https://github.com/aurelia/aurelia/commit/3279354))
* **activator:** add task manager inject key ([720dfab](https://github.com/aurelia/aurelia/commit/720dfab))
* **plugin-conventions): fix plugin-conventions tsconfig:** ( ([acfb095](https://github.com/aurelia/aurelia/commit/acfb095))
* **plugin-conventions:** fix TS TS2449 error for custom element with in-file dep ([efdc2ae](https://github.com/aurelia/aurelia/commit/efdc2ae))
* **jit:** fix camelcasing of html attributes ([f7b3eaf](https://github.com/aurelia/aurelia/commit/f7b3eaf))
* **template-binder:** correctly map attribute names to js names ([41596e0](https://github.com/aurelia/aurelia/commit/41596e0))
* **platform:** do not throw if platform perf methods are not defined ([4636cd9](https://github.com/aurelia/aurelia/commit/4636cd9))
* **event-manager:** fix 'this' scope issue in removeEventListener ([637f7d3](https://github.com/aurelia/aurelia/commit/637f7d3))
* **deps:** update dependency lodash to v4.17.13 [security] ([759ccc1](https://github.com/aurelia/aurelia/commit/759ccc1))
* **deps:** update dependency lodash to v4.17.13 [security] ([6eea0e9](https://github.com/aurelia/aurelia/commit/6eea0e9))
* **all:** properly support browserify, use umd build in "browser" field of package.json ([c2217d5](https://github.com/aurelia/aurelia/commit/c2217d5))
* **all:** properly support browserify, use umd build in "browser" field of package.json ([48c688c](https://github.com/aurelia/aurelia/commit/48c688c))
* **template-binder:** don't bind replace-part child nodes twice ([139c3ad](https://github.com/aurelia/aurelia/commit/139c3ad))
* **template-binder:** do not ignore empty attributes with binding commands ([166d67d](https://github.com/aurelia/aurelia/commit/166d67d))
* **template-binder:** use the target name for default bindings ([445c369](https://github.com/aurelia/aurelia/commit/445c369))
* **resource-model:** don't camelcase attribute names ([3f251e6](https://github.com/aurelia/aurelia/commit/3f251e6))
* **replaceable:** fix some more edge cases with multi nested elements and template controllers ([b600463](https://github.com/aurelia/aurelia/commit/b600463))
* **replaceable:** more scoping fixes, enable most of bigopon's tests ([0daea3a](https://github.com/aurelia/aurelia/commit/0daea3a))
* **property-accessor:** properly distinguish observer lookup types ([9733f93](https://github.com/aurelia/aurelia/commit/9733f93))
* **replaceable:** make part scopes also work when not immediately bound from the wrapping replaceable ([78803f1](https://github.com/aurelia/aurelia/commit/78803f1))
* **replaceable:** retain parts through template controllers in the replace-part ([69fdd0c](https://github.com/aurelia/aurelia/commit/69fdd0c))
* **router:** explicitly export stuff ([1f1037f](https://github.com/aurelia/aurelia/commit/1f1037f))
* **inspect:** make inspect FF compatible ([509b771](https://github.com/aurelia/aurelia/commit/509b771))
* **lifecycle:** fix raf timing issue ([54f0f19](https://github.com/aurelia/aurelia/commit/54f0f19))
* **template-compiler:** set buildRequired to false after compilation ([dc8f116](https://github.com/aurelia/aurelia/commit/dc8f116))
* **di:** fix ts 3.5.x regression ([8a713f5](https://github.com/aurelia/aurelia/commit/8a713f5))
* **observer-locator:** fix attribute NS accessor and tests ([923c326](https://github.com/aurelia/aurelia/commit/923c326))
* **debug:** add missing error codes and fix a few reporting issues ([25148d0](https://github.com/aurelia/aurelia/commit/25148d0))
* **repeat:** fix indexMap synchronization ([16c69f9](https://github.com/aurelia/aurelia/commit/16c69f9))
* **template-binder:** compile slot element ([bc190e0](https://github.com/aurelia/aurelia/commit/bc190e0))
* **compose:** fix typo and tests ([a3060e9](https://github.com/aurelia/aurelia/commit/a3060e9))
* **au-dom:** sync with node-sequence changes ([41cd1c1](https://github.com/aurelia/aurelia/commit/41cd1c1))
* **proxy-observer:** make proxies work again ([c2627bc](https://github.com/aurelia/aurelia/commit/c2627bc))
* **self-observer:** fix subscribe slip-up ([075e31a](https://github.com/aurelia/aurelia/commit/075e31a))
* **setter-observer:** correctly update inner state ([8a7ef50](https://github.com/aurelia/aurelia/commit/8a7ef50))
* **repeat:** correctly reorder nodes, fix several small bugs in node state tracking ([283af76](https://github.com/aurelia/aurelia/commit/283af76))
* **di:** make the decorators compatible with ts strict mode for end users ([4a3d7a2](https://github.com/aurelia/aurelia/commit/4a3d7a2))
* **controller:** detach custom element controllers ([b113700](https://github.com/aurelia/aurelia/commit/b113700))
* **if:** correct a lifecycle bug ([d273563](https://github.com/aurelia/aurelia/commit/d273563))
* **debug:** add fromTick to stringifyLifecycleFlags ([8502236](https://github.com/aurelia/aurelia/commit/8502236))
* **lifecycle:** fix some flags and hook callback slip-ups ([e769249](https://github.com/aurelia/aurelia/commit/e769249))
* **eventaggregator:** fix types ([7bcff62](https://github.com/aurelia/aurelia/commit/7bcff62))
* **controller:** use provided property name ([25d7be2](https://github.com/aurelia/aurelia/commit/25d7be2))
* **if:** set elseFactory ([f01af55](https://github.com/aurelia/aurelia/commit/f01af55))
* **interpolation-binding:** bind observers ([537cbcc](https://github.com/aurelia/aurelia/commit/537cbcc))
* **renderer:** use the correct targets ([885c7af](https://github.com/aurelia/aurelia/commit/885c7af))
* **controller:** mount via the raf queue ([1691161](https://github.com/aurelia/aurelia/commit/1691161))
* **repeat:** mount via the raf queue ([2e0662a](https://github.com/aurelia/aurelia/commit/2e0662a))
* **repeat:** get sourceExpression correctly again ([24daae1](https://github.com/aurelia/aurelia/commit/24daae1))
* **di:** detect newly registered resolver as an alternative to returned resolver from register method ([10131f2](https://github.com/aurelia/aurelia/commit/10131f2))
* **di:** fix false positive type error in resolver ([1f43cac](https://github.com/aurelia/aurelia/commit/1f43cac))
* **controller:** respect noProxy property ([5f88d30](https://github.com/aurelia/aurelia/commit/5f88d30))
* **runtime:** fix index exports ([711837d](https://github.com/aurelia/aurelia/commit/711837d))
* **lint:** fix all lint issues ([6b163bd](https://github.com/aurelia/aurelia/commit/6b163bd))
* **class-binding:** targetKey -> propertyKey ([0971d7d](https://github.com/aurelia/aurelia/commit/0971d7d))
* **style-attr-binding:** properly handle rules, add important tests, non happy path tests ([a2b7c62](https://github.com/aurelia/aurelia/commit/a2b7c62))
* **attr-binding-instruction): fro:** string -> string | IsBindingBehavior ([cafc325](https://github.com/aurelia/aurelia/commit/cafc325))
* **tests:** remove only, add skip ([4000b1a](https://github.com/aurelia/aurelia/commit/4000b1a))
* **kernel:** fix master with workaround for now ([8a9db61](https://github.com/aurelia/aurelia/commit/8a9db61))
* **tests:** adjust h fn name ([3d0aa44](https://github.com/aurelia/aurelia/commit/3d0aa44))
* **replaceable-tests:** adjust tests, skip failing ([ffb71f6](https://github.com/aurelia/aurelia/commit/ffb71f6))
* **tests:** fix tests description ([90f45b3](https://github.com/aurelia/aurelia/commit/90f45b3))
* **e2e:** local test app now working ([38b94e1](https://github.com/aurelia/aurelia/commit/38b94e1))
* **e2e:** router import and utils from jurgen demo ([11eb956](https://github.com/aurelia/aurelia/commit/11eb956))
* **subscriber-collection:** allow recursion ([2c1b4dd](https://github.com/aurelia/aurelia/commit/2c1b4dd))
* **value-attribute-observer:** fix two-way binding back propagation ([b53b863](https://github.com/aurelia/aurelia/commit/b53b863))
* **template-binder:** clear interpolation expressions from attribute during compilation ([d0c9a65](https://github.com/aurelia/aurelia/commit/d0c9a65))
* **target-observer:** fix dom binding update when initial value matches empty string ([38fdc71](https://github.com/aurelia/aurelia/commit/38fdc71))
* **self-observer:** call valueChanged after callSubscribers ([bfff190](https://github.com/aurelia/aurelia/commit/bfff190))
* **runtime:** fix two-way binding ([d60b952](https://github.com/aurelia/aurelia/commit/d60b952))
* **repeater:** fix null and undefined collection observer initialization for proxies ([ce9d265](https://github.com/aurelia/aurelia/commit/ce9d265))
* **repeat:** fix proxy observer edge case ([0708221](https://github.com/aurelia/aurelia/commit/0708221))
* **proxies:** properly observe array indexers and source items ([2c3923e](https://github.com/aurelia/aurelia/commit/2c3923e))
* **proxies:** ensure proxy context is passed to created() hook ([41cbf85](https://github.com/aurelia/aurelia/commit/41cbf85))
* **patch:** always process changes synchronously on patch ([35ec87a](https://github.com/aurelia/aurelia/commit/35ec87a))
* **tracer:** fix symbols ([760bcf9](https://github.com/aurelia/aurelia/commit/760bcf9))
* **binding:** fix patch mode (again) ([e3eb280](https://github.com/aurelia/aurelia/commit/e3eb280))
* **runtime:** remove dom types ([b085dd1](https://github.com/aurelia/aurelia/commit/b085dd1))
* **ast:** fix forOf bind slip-up ([b715cc0](https://github.com/aurelia/aurelia/commit/b715cc0))
* **runtime:** tsconfig needs libs for dom interfaces ([9819239](https://github.com/aurelia/aurelia/commit/9819239))
* **runtime:** allow dom interfaces to be used in typings ([60423bc](https://github.com/aurelia/aurelia/commit/60423bc))
* **expression-parser:** handle trailing comma correctly ([23e4c0c](https://github.com/aurelia/aurelia/commit/23e4c0c))
* **proxy-observer:** only invoke subscribers specific to properties ([237d60d](https://github.com/aurelia/aurelia/commit/237d60d))
* **proxy-observer:** make sure array/set/map work ([d07f412](https://github.com/aurelia/aurelia/commit/d07f412))
* **dirty-checker:** use tick counter instead of frameDelta counter and revert tests back to normal ([a9f9822](https://github.com/aurelia/aurelia/commit/a9f9822))
* **dom:** add event listener to document instead of body ([c8fa239](https://github.com/aurelia/aurelia/commit/c8fa239))
* **dom:** add delegate/capture listeners to body instead of window by default ([4219d6d](https://github.com/aurelia/aurelia/commit/4219d6d))
* **shadow-dom-projector:** get mutation observer from dom ([97333c2](https://github.com/aurelia/aurelia/commit/97333c2))
* **aurelia:** initialize dom before trying to resolve component ([306c497](https://github.com/aurelia/aurelia/commit/306c497))
* **attribute-pattern:** reset pattern index to 0 for each matched state ([045e2d7](https://github.com/aurelia/aurelia/commit/045e2d7))
* **pixi:** leave the resource task out for now ([6b78bbf](https://github.com/aurelia/aurelia/commit/6b78bbf))
* **template-binder:** handle ref attribute on custom elements ([233dd69](https://github.com/aurelia/aurelia/commit/233dd69))
* **binding:** force updateSourceExpression when bindingMode is fromView ([366301f](https://github.com/aurelia/aurelia/commit/366301f))
* **lifecycle:** temporary solution for a mounting race condition ([9f11a93](https://github.com/aurelia/aurelia/commit/9f11a93))
* **create-element:** pass null to parentContext ([6581dfb](https://github.com/aurelia/aurelia/commit/6581dfb))
* **router:** pass parentContext (null) to the rendering engine ([3bf9acf](https://github.com/aurelia/aurelia/commit/3bf9acf))
* **di:** expose resources from parent containers in child containers via a separate lookup ([c6d3db6](https://github.com/aurelia/aurelia/commit/c6d3db6))
* **runtime:** register local dependencies before going into the template compiler ([13a7fd4](https://github.com/aurelia/aurelia/commit/13a7fd4))
* **kernel:** remove unnecessary iife call context ([7b6e2f9](https://github.com/aurelia/aurelia/commit/7b6e2f9))
* **host-projector:** also observe children of non-shadowROot ([502ad2f](https://github.com/aurelia/aurelia/commit/502ad2f))
* **shadow-dom-projector:** observe children of the shadowRoot ([443ed52](https://github.com/aurelia/aurelia/commit/443ed52))
* **runtime-html:** export attribute-ns-accessor ([4f08d48](https://github.com/aurelia/aurelia/commit/4f08d48))
* **projectors:** append and return childNodes from the shadowRoot + use correct defaults ([09bb7d7](https://github.com/aurelia/aurelia/commit/09bb7d7))
* **jit-html:** correct the iife exports ([f6e72ab](https://github.com/aurelia/aurelia/commit/f6e72ab))
* **view:** also use lockedUnbind on lockScope ([bba81ca](https://github.com/aurelia/aurelia/commit/bba81ca))
* **jit-html:** rename TemplateFactory to TemplateElementFactory due to name conflict ([1e6dadb](https://github.com/aurelia/aurelia/commit/1e6dadb))
* **jit:** add missing registrations ([848881d](https://github.com/aurelia/aurelia/commit/848881d))
* **runtime:** add missing renderer registrations ([c301823](https://github.com/aurelia/aurelia/commit/c301823))
* **svg-analyzer:** fix runtime reference ([6e60798](https://github.com/aurelia/aurelia/commit/6e60798))
* **custom-element:** use the correct $bind interface ([7000b9a](https://github.com/aurelia/aurelia/commit/7000b9a))
* **template-binder:** correctly traverse not-compilable node types ([0a2a392](https://github.com/aurelia/aurelia/commit/0a2a392))
* **template-binder:** correctly traverse not-compilable node types ([0eaeccc](https://github.com/aurelia/aurelia/commit/0eaeccc))
* **router:** remove initial blank navigation segment ([3ccd4c5](https://github.com/aurelia/aurelia/commit/3ccd4c5))
* **template-factory:** fix an edge case with whitespace around the element ([1cb386e](https://github.com/aurelia/aurelia/commit/1cb386e))
* **template-factory:** revert multiple node thing due to regression ([ab51946](https://github.com/aurelia/aurelia/commit/ab51946))
* **template-factory:** correctly handle multiple node scenario ([71c774d](https://github.com/aurelia/aurelia/commit/71c774d))
* **aurelia:** make the host property runtime agnostic ([b45dca0](https://github.com/aurelia/aurelia/commit/b45dca0))
* **dom.interfaces:** keep dom interfaces compatible with lib.dom.d.ts ([9fd0409](https://github.com/aurelia/aurelia/commit/9fd0409))
* **template-definition:** accept any node/template type ([6111e1e](https://github.com/aurelia/aurelia/commit/6111e1e))
* **dom:** tolerate non string types for template markup ([0676a0f](https://github.com/aurelia/aurelia/commit/0676a0f))
* **template-binder:** fix some exotic replace-part placements by tracking markers ([9655daa](https://github.com/aurelia/aurelia/commit/9655daa))
* **template-binder:** fix let again ([99605f4](https://github.com/aurelia/aurelia/commit/99605f4))
* **template-binder:** get replaceable to work properly ([63c320e](https://github.com/aurelia/aurelia/commit/63c320e))
* **template-compiler:** use correct parsing rules for non-bound attributes and remove template controllers ([8128a3a](https://github.com/aurelia/aurelia/commit/8128a3a))
* **semantic-model:** throw on unknown binding command ([354523e](https://github.com/aurelia/aurelia/commit/354523e))
* **replaceable:** use IBindScope instead of IBindSelf and remove IBindSelf ([7fd2b10](https://github.com/aurelia/aurelia/commit/7fd2b10))
* **runtime:** enable LengthObserver ([c7b3373](https://github.com/aurelia/aurelia/commit/c7b3373))
* **aurelia:** add attach/detach flags to start/stop task ([fa2ba9c](https://github.com/aurelia/aurelia/commit/fa2ba9c))
* **mounting:** defer mount/unmount decision to processQueue, cleanup unnecessary guards ([22a79d0](https://github.com/aurelia/aurelia/commit/22a79d0))
* **host-projector:** allow children of host element to be removed for router-view-like scenarios ([634db1a](https://github.com/aurelia/aurelia/commit/634db1a))
* **lifecycle:** temporary solution for infinite flush loop on $detach ([647e0d8](https://github.com/aurelia/aurelia/commit/647e0d8))
* **attribute-pattern:** make multi patterns work ([4c62000](https://github.com/aurelia/aurelia/commit/4c62000))
* **di:** call resolve in buildAllResponse ([65bcff1](https://github.com/aurelia/aurelia/commit/65bcff1))
* **target-observer:** revert aurelia-cli incompatible async change ([c262ab2](https://github.com/aurelia/aurelia/commit/c262ab2))
* **ast:** fix slip-up in arePureLiterals helper function ([69c5e32](https://github.com/aurelia/aurelia/commit/69c5e32))
* **binding:** add null check to check for existing behaviorKey ([6fc286c](https://github.com/aurelia/aurelia/commit/6fc286c))
* **lifecycle:** properly implement unbindAfterDetach behavior ([9d3f41b](https://github.com/aurelia/aurelia/commit/9d3f41b))
* **kernel:** fix a small typing regression in iindexable and add clarification ([bf48fce](https://github.com/aurelia/aurelia/commit/bf48fce))
* **kernel:** fix small regression in decorator typings and add clarifications ([d464e12](https://github.com/aurelia/aurelia/commit/d464e12))
* **di:** report a meaningful error when register() returns an invalid resolver ([0306348](https://github.com/aurelia/aurelia/commit/0306348))
* **repeat:** always re-subscribe arrayObserver during binding ([3ebe065](https://github.com/aurelia/aurelia/commit/3ebe065))
* **lifecycle:** temporary workaround for issue with flushChanges during attaching() ([6483ed9](https://github.com/aurelia/aurelia/commit/6483ed9))
* **custom-element:** ensure the correct runtime behavior is applied ([1a74855](https://github.com/aurelia/aurelia/commit/1a74855))
* **dom:** make attachShadow work with custom elements" ([bd22ea7](https://github.com/aurelia/aurelia/commit/bd22ea7))
* **dom:** make attachShadow work with custom elements ([18d2e15](https://github.com/aurelia/aurelia/commit/18d2e15))
* **containerless:** replace element with marker for proper containerless behavior ([75bcaa5](https://github.com/aurelia/aurelia/commit/75bcaa5))
* **dom:** set text.textContent to empty after hydration ([7831726](https://github.com/aurelia/aurelia/commit/7831726))
* **with:** only invoke change handler if the controller is bound ([935eedb](https://github.com/aurelia/aurelia/commit/935eedb))
* **dom:** use emptyNodeSequence when fragment has no children ([d600da4](https://github.com/aurelia/aurelia/commit/d600da4))
* **dom:** ensure the correct nodes are removed on unmounting containerless views ([8fbe26b](https://github.com/aurelia/aurelia/commit/8fbe26b))
* **dom:** ensure renderLocation keeps the correct parent and is removed with the rest of the fragment nodes ([43005e7](https://github.com/aurelia/aurelia/commit/43005e7))
* **runtime:** correctly remove root element children on stopTask ([46f1d5f](https://github.com/aurelia/aurelia/commit/46f1d5f))
* **LinkedChangeList:** fix idempotency and recursion to behave the same way as ChangeSet ([c79df13](https://github.com/aurelia/aurelia/commit/c79df13))
* **LinkedChangeList:** recursively flush changes ([4926397](https://github.com/aurelia/aurelia/commit/4926397))
* **binding:** add fromBind flags to $bind->$unbind call ([0b57e63](https://github.com/aurelia/aurelia/commit/0b57e63))
* **compose:** change resolution order in provideViewFor from least common to most common properties ([1ee26ea](https://github.com/aurelia/aurelia/commit/1ee26ea))
* **runtime:** add some missing exports ([a4deeeb](https://github.com/aurelia/aurelia/commit/a4deeeb))
* **binding-context:** make addObserver optional to make typescript happy ([e1acc1f](https://github.com/aurelia/aurelia/commit/e1acc1f))
* **customElement:** use provided def.cache value ([dde367a](https://github.com/aurelia/aurelia/commit/dde367a))
* **customAttribute:** register aliases with the correct key ([e3bf5ef](https://github.com/aurelia/aurelia/commit/e3bf5ef))
* **kernel:** fix circular type reference issue introduced by ts 3.1 ([bb2a0f2](https://github.com/aurelia/aurelia/commit/bb2a0f2))
* **lifecycle:** pass changeSet  into controller and always flush before processing attach/detach ([94197db](https://github.com/aurelia/aurelia/commit/94197db))
* **else:** do not remove renderLocation (to prevent parentNode null issue) ([17f2d01](https://github.com/aurelia/aurelia/commit/17f2d01))


### Performance Improvements:

* **repeat:** only update contextual props when necessary ([651e81a](https://github.com/aurelia/aurelia/commit/651e81a))
* **all:** remove tracer/profiler from ts source ([cc9c1fc](https://github.com/aurelia/aurelia/commit/cc9c1fc))
* **jit-html:** cache parsed html ([bc9ada2](https://github.com/aurelia/aurelia/commit/bc9ada2))
* **all): add sideEffect:** false for better tree shaking ([59b5e55](https://github.com/aurelia/aurelia/commit/59b5e55))
* **runtime:** move collection observer initializers to observer constructors ([838b325](https://github.com/aurelia/aurelia/commit/838b325))
* **controller:** abort attach/detach sooner ([b96cc99](https://github.com/aurelia/aurelia/commit/b96cc99))
* **binding:** don't bind observers in onetime mode ([4fb7fef](https://github.com/aurelia/aurelia/commit/4fb7fef))
* **custom-attributes:** use merged flags ([37373d9](https://github.com/aurelia/aurelia/commit/37373d9))
* **repeat:** small tweak to lis algorithm ([36ea371](https://github.com/aurelia/aurelia/commit/36ea371))
* **if:** unroll the custom attribute lifecycle ([4b7bc3f](https://github.com/aurelia/aurelia/commit/4b7bc3f))
* **binding:** use string id property instead of number ([db8e1f9](https://github.com/aurelia/aurelia/commit/db8e1f9))
* **repeat:** small tweaks to lis algorithm ([6ae65f5](https://github.com/aurelia/aurelia/commit/6ae65f5))
* **all:** pre-declare variables used in loops ([16b9c18](https://github.com/aurelia/aurelia/commit/16b9c18))
* **ticker:** minor perf tweaks and normalize frame delta ([fb73c58](https://github.com/aurelia/aurelia/commit/fb73c58))
* **all:** remove profiler from bundled outputs ([e3952c6](https://github.com/aurelia/aurelia/commit/e3952c6))
* **repeat:** reuse existing binding context if a mutated item is the same ([b106cdf](https://github.com/aurelia/aurelia/commit/b106cdf))
* **runtime-html:** remove DOM dependency from DOM target accessors ([74b649a](https://github.com/aurelia/aurelia/commit/74b649a))
* **resource-model:** resolve info lazily ([42c12cc](https://github.com/aurelia/aurelia/commit/42c12cc))
* **template-binder:** traverse via nextSibling instead of using array ([7f05167](https://github.com/aurelia/aurelia/commit/7f05167))
* **template-compiler:** create fewer variables and arrays ([1ad7e9c](https://github.com/aurelia/aurelia/commit/1ad7e9c))
* **template-compiler:** prevent the same template from getting compiled multiple times ([5bbece9](https://github.com/aurelia/aurelia/commit/5bbece9))
* **all:** shorten au-marker to au-m ([e04fe9c](https://github.com/aurelia/aurelia/commit/e04fe9c))
* **all:** shorten au-marker to au- ([c3f82ff](https://github.com/aurelia/aurelia/commit/c3f82ff))
* **attribute-pattern:** declare callback function for eachChar earlier ([22a15c1](https://github.com/aurelia/aurelia/commit/22a15c1))
* **renderer:** use normal object instead of null object for renderers lookup ([afb4720](https://github.com/aurelia/aurelia/commit/afb4720))
* **instruction-renderer:** set instructionType on the instance instead of the prototype ([c15b25f](https://github.com/aurelia/aurelia/commit/c15b25f))
* **lifecycle:** properly enforce only-root-removal but unmount everything on stopTask ([365ddcc](https://github.com/aurelia/aurelia/commit/365ddcc))
* **runtime:** don't update DOM during flush if it's about to be detached ([83f3e8f](https://github.com/aurelia/aurelia/commit/83f3e8f))
* **lifecycle:** use lifecycle as first node to reduce the number of null checks needed ([c1930af](https://github.com/aurelia/aurelia/commit/c1930af))
* **binding:** connect after mounting ([388f189](https://github.com/aurelia/aurelia/commit/388f189))
* **target-accessor:** only batch DOM changes if target is already attached ([0a875ce](https://github.com/aurelia/aurelia/commit/0a875ce))
* **dom:** only remove root nodes ([c5c8865](https://github.com/aurelia/aurelia/commit/c5c8865))
* **LinkedChangeSet:** remove $linked property and use marker instead ([a4b0bfc](https://github.com/aurelia/aurelia/commit/a4b0bfc))
* **lifecycle:** change BindLifecycle to linked list, preallocate properties ([17ac407](https://github.com/aurelia/aurelia/commit/17ac407))
* **runtime-behavior:** replace boolean properties with single flags property ([9e168bc](https://github.com/aurelia/aurelia/commit/9e168bc))
* **dom:** declare DOM api as loose functions" ([6087767](https://github.com/aurelia/aurelia/commit/6087767))
* **view:** add BindingFlags.fromBind to unbind call ([92068ee](https://github.com/aurelia/aurelia/commit/92068ee))
* **dom:** use nodeType instead of instanceof for isNodeInstance ([7e1321b](https://github.com/aurelia/aurelia/commit/7e1321b))
* **dom:** declare DOM api as loose functions ([10f657f](https://github.com/aurelia/aurelia/commit/10f657f))
* **node-sequence:** implement special textNodeSequence and reorganize a few things ([0e66eb3](https://github.com/aurelia/aurelia/commit/0e66eb3))
* **binding:** reduce redundant calls to evaluate() ([7750743](https://github.com/aurelia/aurelia/commit/7750743))
* **if:** batch state changes between if/else view ([022040f](https://github.com/aurelia/aurelia/commit/022040f))


### Refactorings:

* **throttle:** cleanup and use scheduler ([fd2caa5](https://github.com/aurelia/aurelia/commit/fd2caa5))
* **debounce:** cleanup and use scheduler ([9d8d9e7](https://github.com/aurelia/aurelia/commit/9d8d9e7))
* **fetch-client:** replace PLATFORM methods ([626645d](https://github.com/aurelia/aurelia/commit/626645d))
* **kernel:** remove timer related methods from platform ([6827f9c](https://github.com/aurelia/aurelia/commit/6827f9c))
* **queue:** use render task ([bbd1eed](https://github.com/aurelia/aurelia/commit/bbd1eed))
* **scheduler:** add tracing hooks for debugging and fix task pool ([2a518a1](https://github.com/aurelia/aurelia/commit/2a518a1))
* **scheduler:** return boolean from cancel instead of throwing ([c541747](https://github.com/aurelia/aurelia/commit/c541747))
* **browser-navigator:** convert from lifecycle to scheduler ([36c53af](https://github.com/aurelia/aurelia/commit/36c53af))
* **testing:** convert from lifecycle to scheduler ([5f0a30a](https://github.com/aurelia/aurelia/commit/5f0a30a))
* **blur:** convert from lifecycle to scheduler ([fa65ee7](https://github.com/aurelia/aurelia/commit/fa65ee7))
* **attr:** convert from lifecycle to scheduler ([9c33fbe](https://github.com/aurelia/aurelia/commit/9c33fbe))
* **attribute:** convert from lifecycle to scheduler ([f4ba90b](https://github.com/aurelia/aurelia/commit/f4ba90b))
* **observer-locator:** convert from lifecycle to scheduler ([6cc0160](https://github.com/aurelia/aurelia/commit/6cc0160))
* **observer-locator:** convert from lifecycle to scheduler ([2586102](https://github.com/aurelia/aurelia/commit/2586102))
* **value-attribute-observer:** convert from lifecycle to scheduler ([3fdb6ad](https://github.com/aurelia/aurelia/commit/3fdb6ad))
* **style-attribute-accessor:** convert from lifecycle to scheduler ([7313429](https://github.com/aurelia/aurelia/commit/7313429))
* **select-value-observer:** convert from lifecycle to scheduler ([060e872](https://github.com/aurelia/aurelia/commit/060e872))
* **element-property-accessor:** convert from lifecycle to scheduler ([31138f0](https://github.com/aurelia/aurelia/commit/31138f0))
* **data-attribute-accessor:** convert from lifecycle to scheduler ([d2b3202](https://github.com/aurelia/aurelia/commit/d2b3202))
* **class-attribute-observer:** convert from lifecycle to scheduler ([f59d6a4](https://github.com/aurelia/aurelia/commit/f59d6a4))
* **element-attribute-observer:** convert from lifecycle to scheduler ([7135094](https://github.com/aurelia/aurelia/commit/7135094))
* **checked-observer:** convert from lifecycle to scheduler ([3205a68](https://github.com/aurelia/aurelia/commit/3205a68))
* **attribute-ns-accessor:** convert from lifecycle to scheduler ([99b75e1](https://github.com/aurelia/aurelia/commit/99b75e1))
* **dirty-checker:** convert from lifecycle to scheduler ([e081285](https://github.com/aurelia/aurelia/commit/e081285))
* **scheduler:** improve persistent and reusable task logic ([0094761](https://github.com/aurelia/aurelia/commit/0094761))
* **queue:** move from lifecycle to scheduler ([8b07b34](https://github.com/aurelia/aurelia/commit/8b07b34))
* ***:** remove timeSlicing api calls ([0e05c43](https://github.com/aurelia/aurelia/commit/0e05c43))
* **lifecycle:** remove rafQueue & related stuff ([9b06b5a](https://github.com/aurelia/aurelia/commit/9b06b5a))
* **scheduler:** remove evenLoop priority ([bb1fe5a](https://github.com/aurelia/aurelia/commit/bb1fe5a))
* **template-binder:** simplify replace logic ([ed2f389](https://github.com/aurelia/aurelia/commit/ed2f389))
* **dom:** remove AuMarker and TextNodeSequence ([49042ad](https://github.com/aurelia/aurelia/commit/49042ad))
* **view:** get the closest definition instead of the view ([67f1791](https://github.com/aurelia/aurelia/commit/67f1791))
* **custom-element:** properly differentiate between clone/propagate/override ([ab1577b](https://github.com/aurelia/aurelia/commit/ab1577b))
* **view:** make the view decorator work with metadata ([566d713](https://github.com/aurelia/aurelia/commit/566d713))
* **di:** sync annotation prefix ([ef905ff](https://github.com/aurelia/aurelia/commit/ef905ff))
* **compose:** generate anonymous name if no name is provided in the definition ([211d3d9](https://github.com/aurelia/aurelia/commit/211d3d9))
* **binding-command:** sync with attribute+element resource api ([518ef9b](https://github.com/aurelia/aurelia/commit/518ef9b))
* **binding-behavior:** sync with attribute+element resource api ([6b66e38](https://github.com/aurelia/aurelia/commit/6b66e38))
* **value-converter:** sync with attribute+element resource api ([14bd3c4](https://github.com/aurelia/aurelia/commit/14bd3c4))
* **controller:** use switch in mount synthetic ([46f62bf](https://github.com/aurelia/aurelia/commit/46f62bf))
* **all:** enforce 2nd param for hold ([dfda3fe](https://github.com/aurelia/aurelia/commit/dfda3fe))
* **viewport:** remove unnecessary render() override and use deco ([e776943](https://github.com/aurelia/aurelia/commit/e776943))
* **custom-element:** allow non-function types to be passed into isType ([6990132](https://github.com/aurelia/aurelia/commit/6990132))
* **view:** always clone parts ([a058ac1](https://github.com/aurelia/aurelia/commit/a058ac1))
* **jit:** fix template compiler+binder" ([32181f8](https://github.com/aurelia/aurelia/commit/32181f8))
* **resource-model:** fix types ([d75e939](https://github.com/aurelia/aurelia/commit/d75e939))
* **binding-command:** use metadata ([0734325](https://github.com/aurelia/aurelia/commit/0734325))
* **resources:** move merge helpers to kernel ([9ceb1f7](https://github.com/aurelia/aurelia/commit/9ceb1f7))
* **binding-behaviors:** back to decorators ([1047099](https://github.com/aurelia/aurelia/commit/1047099))
* **compose:** update to use metadata etc ([009a96c](https://github.com/aurelia/aurelia/commit/009a96c))
* **all:** update definition refs ([676e86a](https://github.com/aurelia/aurelia/commit/676e86a))
* **controller:** fix types and correctly use metadata ([22ce19a](https://github.com/aurelia/aurelia/commit/22ce19a))
* **rendering-engine:** fix types and correctly use metadata ([26b6931](https://github.com/aurelia/aurelia/commit/26b6931))
* **if:** cleanup, go back to idiomatic aurelia code ([fa12de4](https://github.com/aurelia/aurelia/commit/fa12de4))
* **repeat:** cleanup, go back to idiomatic aurelia code ([71c451d](https://github.com/aurelia/aurelia/commit/71c451d))
* **with:** cleanup, go back to idiomatic aurelia code ([1efd937](https://github.com/aurelia/aurelia/commit/1efd937))
* **custom-element:** self-register definition in metadata ([2d9c300](https://github.com/aurelia/aurelia/commit/2d9c300))
* **renderer:** fix types and line length ([a267098](https://github.com/aurelia/aurelia/commit/a267098))
* **render-context:** fix types ([3913596](https://github.com/aurelia/aurelia/commit/3913596))
* **ast:** fix refs ([4e0e01f](https://github.com/aurelia/aurelia/commit/4e0e01f))
* **lifecycle:** fix types ([50d70b0](https://github.com/aurelia/aurelia/commit/50d70b0))
* **instructions:** fix types ([7bf3bb3](https://github.com/aurelia/aurelia/commit/7bf3bb3))
* **view:** fix types ([d46ef67](https://github.com/aurelia/aurelia/commit/d46ef67))
* **definitions:** cleanup unnecessary types/logic and fix refs ([d0955b6](https://github.com/aurelia/aurelia/commit/d0955b6))
* **bindable:** fix types ([428c2e7](https://github.com/aurelia/aurelia/commit/428c2e7))
* **children:** fixup naming ([1b3b2c2](https://github.com/aurelia/aurelia/commit/1b3b2c2))
* **kernel:** correctly wireup resource registrations ([33dfbee](https://github.com/aurelia/aurelia/commit/33dfbee))
* **custom-attribute:** fixup bindable references ([19ba25d](https://github.com/aurelia/aurelia/commit/19ba25d))
* **custom-element:** fixup bindable/children references ([3f4973e](https://github.com/aurelia/aurelia/commit/3f4973e))
* **children:** normalize to similar mechanism as bindable ([5083b10](https://github.com/aurelia/aurelia/commit/5083b10))
* **bindable:** cleanup decorator signature and definition logic ([c84ea69](https://github.com/aurelia/aurelia/commit/c84ea69))
* **html-renderer:** follow general theme ([9af1c64](https://github.com/aurelia/aurelia/commit/9af1c64))
* **inst:** move classlist comp to renderer ([223f907](https://github.com/aurelia/aurelia/commit/223f907))
* **runtime:** overhaul bindable, add annotations, fixup resource definitions ([8cffcf5](https://github.com/aurelia/aurelia/commit/8cffcf5))
* **custom-attribute:** apply new metadata api ([1b3a8d7](https://github.com/aurelia/aurelia/commit/1b3a8d7))
* **binding-behavior:** apply new metadata api ([c498f5f](https://github.com/aurelia/aurelia/commit/c498f5f))
* **value-converter:** apply new metadata api ([d75aa91](https://github.com/aurelia/aurelia/commit/d75aa91))
* **kernel:** refine metadata ([d320730](https://github.com/aurelia/aurelia/commit/d320730))
* **resources): prepend with a:**  ([dd7c238](https://github.com/aurelia/aurelia/commit/dd7c238))
* **metadata:** expose internal slot for debugging purposes, make polyfill non-enumerable ([d0dadcd](https://github.com/aurelia/aurelia/commit/d0dadcd))
* **di:** use metadata instead of static properties ([4edf542](https://github.com/aurelia/aurelia/commit/4edf542))
* **runtime:** use metadata for customElement def and renderer cache ([bccdc54](https://github.com/aurelia/aurelia/commit/bccdc54))
* **scheduler:** add prio specific apis ([5115f58](https://github.com/aurelia/aurelia/commit/5115f58))
* **scheduler:** reorder priorities ([12cc85a](https://github.com/aurelia/aurelia/commit/12cc85a))
* **scheduler:** add more tests and more fixes ([d613137](https://github.com/aurelia/aurelia/commit/d613137))
* **scheduler:** add tests and fix the bugs they exposed ([2babe82](https://github.com/aurelia/aurelia/commit/2babe82))
* **scheduler:** add global initialization and initial test setup ([2d15388](https://github.com/aurelia/aurelia/commit/2d15388))
* **scheduler:** add interfaces ([d141d94](https://github.com/aurelia/aurelia/commit/d141d94))
* **replaceable:** rename 'replace-part' to 'replace' and 'replaceable part' to 'replaceable' ([603b68b](https://github.com/aurelia/aurelia/commit/603b68b))
* **router:** rename au-href to goto ([ec9c336](https://github.com/aurelia/aurelia/commit/ec9c336))
* **router:** fix review comments ([84c6cf0](https://github.com/aurelia/aurelia/commit/84c6cf0))
* **router:** fix review comments ([d6ea3c8](https://github.com/aurelia/aurelia/commit/d6ea3c8))
* **router:** rename href to instruction ([4242909](https://github.com/aurelia/aurelia/commit/4242909))
* **router:** use target view model & rename href to instruction ([87ebc81](https://github.com/aurelia/aurelia/commit/87ebc81))
* **router:** update au-href value in binding ([ba3365e](https://github.com/aurelia/aurelia/commit/ba3365e))
* **router:** add useHref option ([2b49e76](https://github.com/aurelia/aurelia/commit/2b49e76))
* **router:** inject DOM and au-href in link handler ([a13b333](https://github.com/aurelia/aurelia/commit/a13b333))
* ***:** drop unused imports ([7755bbf](https://github.com/aurelia/aurelia/commit/7755bbf))
* **jit-html:** cleanup template-binder and improve semantic-model types ([156311d](https://github.com/aurelia/aurelia/commit/156311d))
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
* **aurelia:** extend Aurelia to create static methods for quick start ([11f8a87](https://github.com/aurelia/aurelia/commit/11f8a87))
* **all:** rename BasicConfiguration in various packages ([7e330d8](https://github.com/aurelia/aurelia/commit/7e330d8))
* **runtime:** switch to switch ([6ae23fe](https://github.com/aurelia/aurelia/commit/6ae23fe))
* **event-agg:** Change interface signature ([78658eb](https://github.com/aurelia/aurelia/commit/78658eb))
* **di:** cleanup resourceFactories stuff and add some tests ([e1ee6d2](https://github.com/aurelia/aurelia/commit/e1ee6d2))
* **debug:** rename Tracer to DebugTracer ([a6c28b3](https://github.com/aurelia/aurelia/commit/a6c28b3))
* **custom-attrs:** first pass removing dynamic options ([03c5480](https://github.com/aurelia/aurelia/commit/03c5480))
* **plugin-conventions:** simplify usage of html only element ([2d31b7f](https://github.com/aurelia/aurelia/commit/2d31b7f))
* **plugin-conventions:** simplify usage of html only element ([c52b8e4](https://github.com/aurelia/aurelia/commit/c52b8e4))
* **router:** add getter accesses ([2b39b8b](https://github.com/aurelia/aurelia/commit/2b39b8b))
* **router:** make load url awaitable ([db4b45e](https://github.com/aurelia/aurelia/commit/db4b45e))
* **router:** add viewer state ([ca8acab](https://github.com/aurelia/aurelia/commit/ca8acab))
* **router:** update viewer interfaces ([f4e0ad7](https://github.com/aurelia/aurelia/commit/f4e0ad7))
* **attr-symbol:** tweak hierarchy structure, properly add properties for symbols ([cefd28e](https://github.com/aurelia/aurelia/commit/cefd28e))
* **ref:** move $au to INode ([dbf1fce](https://github.com/aurelia/aurelia/commit/dbf1fce))
* **controller:** better typings ([4cd9aab](https://github.com/aurelia/aurelia/commit/4cd9aab))
* **ref:** remove ref.xx binding command, tweak tests ([12d88b2](https://github.com/aurelia/aurelia/commit/12d88b2))
* **compilation:** distinguish between custom/plain attributes ([34db977](https://github.com/aurelia/aurelia/commit/34db977))
* **ref:** add component host interfaces, tweak getRefTarget ([fb36d8b](https://github.com/aurelia/aurelia/commit/fb36d8b))
* **router:** rename stringifyScopedViewportInstruction to ...instructions ([0ec9128](https://github.com/aurelia/aurelia/commit/0ec9128))
* **ref:** add ref command, add target ref ([722778f](https://github.com/aurelia/aurelia/commit/722778f))
* **renderers:** add getRefTarget ([3a7387a](https://github.com/aurelia/aurelia/commit/3a7387a))
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
* **router:** refactor interfaces and types ([222447f](https://github.com/aurelia/aurelia/commit/222447f))
* **html-convention:** cleaner flow/naming ([ce1d3cb](https://github.com/aurelia/aurelia/commit/ce1d3cb))
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
* **view-locator:** some naming changes ([271ce6d](https://github.com/aurelia/aurelia/commit/271ce6d))
* **view-locator:** renaming a type ([b227e15](https://github.com/aurelia/aurelia/commit/b227e15))
* **blur:** use nodetype enum, remove unnecessary comments ([577f4f2](https://github.com/aurelia/aurelia/commit/577f4f2))
* **blur:** skip some tests ([5dc99be](https://github.com/aurelia/aurelia/commit/5dc99be))
* **blur/focus:** use testhost instead of doc ([cedcd47](https://github.com/aurelia/aurelia/commit/cedcd47))
* **focus:** use ctx.doc instead of document in tests ([a345b62](https://github.com/aurelia/aurelia/commit/a345b62))
* **blur:** always wait 1 frame before/after each test ([6e6e677](https://github.com/aurelia/aurelia/commit/6e6e677))
* **blur/focus:** isolated tests in their own host elements ([8111b96](https://github.com/aurelia/aurelia/commit/8111b96))
* **blur:** make contains work across dom boundaries ([3f6b88d](https://github.com/aurelia/aurelia/commit/3f6b88d))
* **blur:** drop wheel by default, remove redundant code ([263afac](https://github.com/aurelia/aurelia/commit/263afac))
* **blur:** avoid doing unnecessary work ([3a1ef25](https://github.com/aurelia/aurelia/commit/3a1ef25))
* **css-modules-registry:** use object spread ([f958ca7](https://github.com/aurelia/aurelia/commit/f958ca7))
* **router:** add Viewport to IViewportComponent ([d10affb](https://github.com/aurelia/aurelia/commit/d10affb))
* **router:** move NavigationInstruction type to Router ([d80b781](https://github.com/aurelia/aurelia/commit/d80b781))
* **router:** rename NavInstruction to NavigationInstruction ([c770703](https://github.com/aurelia/aurelia/commit/c770703))
* **router:** move Navigator interfaces to navigator ([e4d467f](https://github.com/aurelia/aurelia/commit/e4d467f))
* **router:** rename browser-navigation to browser-navigator ([0c2a179](https://github.com/aurelia/aurelia/commit/0c2a179))
* **router:** rename all Navigation to Navigator for Navigator ([173ca6e](https://github.com/aurelia/aurelia/commit/173ca6e))
* **blur:** use lifecycle to enqueue/dequeue ([27413cd](https://github.com/aurelia/aurelia/commit/27413cd))
* **styles:** rename to make processor clear ([d703dcf](https://github.com/aurelia/aurelia/commit/d703dcf))
* **blur:** remove alien pattern code ([b66d518](https://github.com/aurelia/aurelia/commit/b66d518))
* **styles:** additional renaming for consistency ([77e728b](https://github.com/aurelia/aurelia/commit/77e728b))
* **styles:** better naming ([761b925](https://github.com/aurelia/aurelia/commit/761b925))
* **styles:** rename internal var for clarity ([d8dfd53](https://github.com/aurelia/aurelia/commit/d8dfd53))
* **styles:** enable simpler caching ([4bd58af](https://github.com/aurelia/aurelia/commit/4bd58af))
* **focus:** use param deco, add readonly ([fde14ff](https://github.com/aurelia/aurelia/commit/fde14ff))
* **replaceable:** use templateController deco ([6c5dd91](https://github.com/aurelia/aurelia/commit/6c5dd91))
* **resources:** make the string keys the primary keys ([747772a](https://github.com/aurelia/aurelia/commit/747772a))
* **runtime:** clean up resource definitions ([e58381a](https://github.com/aurelia/aurelia/commit/e58381a))
* **runtime:** cleanup binding behaviors & value converters ([104bb10](https://github.com/aurelia/aurelia/commit/104bb10))
* **jit-html:** cleanup binding-commands and attribute-patterns ([c35bdbe](https://github.com/aurelia/aurelia/commit/c35bdbe))
* **renderer:** cleanup renderer types and pre-bind render methods for perf ([5b3ed88](https://github.com/aurelia/aurelia/commit/5b3ed88))
* **jit:** refactor binding command & attribute pattern to idiomatic aurelia code ([cdb55d3](https://github.com/aurelia/aurelia/commit/cdb55d3))
* **plugin-conventions:** push down common logic to base package ([cb96d99](https://github.com/aurelia/aurelia/commit/cb96d99))
* **resources:** shorten resource names ([499634b](https://github.com/aurelia/aurelia/commit/499634b))
* **binding:** rename bindings ([35d4dff](https://github.com/aurelia/aurelia/commit/35d4dff))
* **ast:** add -Expression suffix to AST expression classes ([0870538](https://github.com/aurelia/aurelia/commit/0870538))
* **router:** remove unused history and test files ([01ea880](https://github.com/aurelia/aurelia/commit/01ea880))
* **all): more cleaning up after TS breaking changes:** ( ([c4c3fc7](https://github.com/aurelia/aurelia/commit/c4c3fc7))
* **di:** overhaul the types to fix latest ts compatibility ([de8586e](https://github.com/aurelia/aurelia/commit/de8586e))
* **replaceable:** fix scoping and some variations of nesting ([99b356c](https://github.com/aurelia/aurelia/commit/99b356c))
* **test:** consolidate / cleanup ([6c83b4e](https://github.com/aurelia/aurelia/commit/6c83b4e))
* **lifecycle:** split up the queues and take mounting out of RAF for now ([766a743](https://github.com/aurelia/aurelia/commit/766a743))
* **if:** do not use RAF queue for updates ([9621a8a](https://github.com/aurelia/aurelia/commit/9621a8a))
* **all:** use nextId for controller and all resources ([e9ed2ac](https://github.com/aurelia/aurelia/commit/e9ed2ac))
* **router:** fix types ([eca04c0](https://github.com/aurelia/aurelia/commit/eca04c0))
* **controller:** fix typings and add id property ([e149ee0](https://github.com/aurelia/aurelia/commit/e149ee0))
* **all:** move isNumeric/camelCase/kebabCase/toArray to separate functions and fix typings ([f746e5b](https://github.com/aurelia/aurelia/commit/f746e5b))
* **examples:** fix sierpinski ([307fd3c](https://github.com/aurelia/aurelia/commit/307fd3c))
* **lifecycle:** experiment with priority-based deadlines ([3e389a2](https://github.com/aurelia/aurelia/commit/3e389a2))
* **if:** use raf queue ([b45a868](https://github.com/aurelia/aurelia/commit/b45a868))
* **subscriber-collection:** simplify the callbacks for now ([b3603d7](https://github.com/aurelia/aurelia/commit/b3603d7))
* **observation:** only eager flush with bind flags ([47957d9](https://github.com/aurelia/aurelia/commit/47957d9))
* **router:** fix types / deps ([edcfe55](https://github.com/aurelia/aurelia/commit/edcfe55))
* **observer-locator:** fixup observer ctors ([8a6c133](https://github.com/aurelia/aurelia/commit/8a6c133))
* **attribute:** fix ctor call ([fbf79a9](https://github.com/aurelia/aurelia/commit/fbf79a9))
* **element-attribute-observer:** cleanup and integrate with raf queue ([08f6442](https://github.com/aurelia/aurelia/commit/08f6442))
* **select-value-observer:** cleanup and integrate with raf queue ([5c5850f](https://github.com/aurelia/aurelia/commit/5c5850f))
* **observation:** improve accessor consistency and perf ([1a6fbb6](https://github.com/aurelia/aurelia/commit/1a6fbb6))
* **value-attribute-observer:** cleanup and integrate with raf queue ([bae0045](https://github.com/aurelia/aurelia/commit/bae0045))
* **class-attribute-accessor:** cleanup and integrate with raf queue ([8448681](https://github.com/aurelia/aurelia/commit/8448681))
* **checked-observer:** cleanup and integrate with raf queue ([8ae2fdb](https://github.com/aurelia/aurelia/commit/8ae2fdb))
* **observation:** cleanup the html accessors and integrate with raf queue ([9b8a12d](https://github.com/aurelia/aurelia/commit/9b8a12d))
* **aurelia:** properly integrate start/stop with lifecycle task again ([1d3ac52](https://github.com/aurelia/aurelia/commit/1d3ac52))
* **observation:** cleanup unused flags and remove decorator layer for the time being ([a16863b](https://github.com/aurelia/aurelia/commit/a16863b))
* **ticker:** move ticker + listener to runtime and integrate properly with lifecycle ([0ba386c](https://github.com/aurelia/aurelia/commit/0ba386c))
* **lifecycle:** move LifecycleTask to separate file ([4770366](https://github.com/aurelia/aurelia/commit/4770366))
* **runtime:** wire up the tasks a bit more properly ([b7d3e4b](https://github.com/aurelia/aurelia/commit/b7d3e4b))
* **resources:** expose view property ([3168044](https://github.com/aurelia/aurelia/commit/3168044))
* **all:** rename ICustomAttribute to IViewModel ([8df17a8](https://github.com/aurelia/aurelia/commit/8df17a8))
* **all:** rename ICustomElement to IViewModel ([8092acf](https://github.com/aurelia/aurelia/commit/8092acf))
* **pixi:** move pixi to plugin-pixi and fix/sync ([50b1705](https://github.com/aurelia/aurelia/commit/50b1705))
* **router:** fix types and integrate controller ([96c15d8](https://github.com/aurelia/aurelia/commit/96c15d8))
* **all:** rename $customElement to $controller ([aacf278](https://github.com/aurelia/aurelia/commit/aacf278))
* **all:** rename ILifecycleHooks to IViewModel ([a4e2dad](https://github.com/aurelia/aurelia/commit/a4e2dad))
* **runtime-html:** fix create-element types and remove RuntimeBehavior ([a34a9da](https://github.com/aurelia/aurelia/commit/a34a9da))
* **compose:** integrate compose with tasks / controllers, fix typings ([d86267e](https://github.com/aurelia/aurelia/commit/d86267e))
* **custom-attributes:** freeze the definitions ([acc5813](https://github.com/aurelia/aurelia/commit/acc5813))
* **runtime:** add activator class and make the runtime compile again ([b2a707a](https://github.com/aurelia/aurelia/commit/b2a707a))
* **runtime:** minor fixes for custom attributes ([6d99575](https://github.com/aurelia/aurelia/commit/6d99575))
* **replaceable:** integrate with controller and tasks ([7eb1f57](https://github.com/aurelia/aurelia/commit/7eb1f57))
* **runtime:** remove non-keyed mode ([c80fadb](https://github.com/aurelia/aurelia/commit/c80fadb))
* **repeat:** refactor to use tasks and controller ([cf7f079](https://github.com/aurelia/aurelia/commit/cf7f079))
* **if:** integrate with controller ([1259fc7](https://github.com/aurelia/aurelia/commit/1259fc7))
* **runtime:** encapsulate lifecycle behavior in controller class ([4c12498](https://github.com/aurelia/aurelia/commit/4c12498))
* **subscriber-collection:** cleanup and specialize the decorators, cleanup observers ([4ae3768](https://github.com/aurelia/aurelia/commit/4ae3768))
* **router:** use DOM abstraction ([27d4eeb](https://github.com/aurelia/aurelia/commit/27d4eeb))
* **all:** move all testing utilities to aurelia-testing package ([8f2fe34](https://github.com/aurelia/aurelia/commit/8f2fe34))
* **replaceable:** unwrap replaceable attribute lifecycle ([ad0f29d](https://github.com/aurelia/aurelia/commit/ad0f29d))
* **all:** break out patch mode for now ([e173d0c](https://github.com/aurelia/aurelia/commit/e173d0c))
* **all:** more loosening up of null/undefined ([6794c30](https://github.com/aurelia/aurelia/commit/6794c30))
* **all:** loosen up null/undefined ([40bc93a](https://github.com/aurelia/aurelia/commit/40bc93a))
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
* **ast:** let flags pass through to getter/setter observers ([a27dae0](https://github.com/aurelia/aurelia/commit/a27dae0))
* **runtime:** remove/cleanup more flags ([71b598b](https://github.com/aurelia/aurelia/commit/71b598b))
* **runtime:** remove unused instanceMutation flag ([a57c484](https://github.com/aurelia/aurelia/commit/a57c484))
* **runtime:** remove connect-queue ([b827710](https://github.com/aurelia/aurelia/commit/b827710))
* ***:** minor linting refactor ([f692d1f](https://github.com/aurelia/aurelia/commit/f692d1f))
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
* **tracer:** implement bbosman's suggestion for _ctorName ([9068c03](https://github.com/aurelia/aurelia/commit/9068c03))
* **observer-locator:** deduplicate and optimize data attribute accessor detection ([a41578f](https://github.com/aurelia/aurelia/commit/a41578f))
* **debug:** use Reporter for the trace writer ([ee6a45d](https://github.com/aurelia/aurelia/commit/ee6a45d))
* **runtime:** support bindable array ([943eed0](https://github.com/aurelia/aurelia/commit/943eed0))
* **all:** consolidate binding mechanisms into BindingStrategy enum ([d319ba8](https://github.com/aurelia/aurelia/commit/d319ba8))
* **fetch-client:** switch from delete to     Reflect.deleteProperty ([1e63cfc](https://github.com/aurelia/aurelia/commit/1e63cfc))
* **all:** split traceInfo.name up in objName and methodName ([2cdc203](https://github.com/aurelia/aurelia/commit/2cdc203))
* **fetch-client:** linting and typing fixes/changes ([e7658aa](https://github.com/aurelia/aurelia/commit/e7658aa))
* **debug:** put tracer in separate file ([2a169a1](https://github.com/aurelia/aurelia/commit/2a169a1))
* **fetch-client:** use DOM.d.ts RequestInit ([7c1a130](https://github.com/aurelia/aurelia/commit/7c1a130))
* **lifecycles:** use resource name for tracing ([6febc5b](https://github.com/aurelia/aurelia/commit/6febc5b))
* ***:** another round of linting fixes ([ca0660b](https://github.com/aurelia/aurelia/commit/ca0660b))
* ***:** another round of linting fixes ([3e0f393](https://github.com/aurelia/aurelia/commit/3e0f393))
* **kernel:** drop Subscription in favor of IDisposable ([860394e](https://github.com/aurelia/aurelia/commit/860394e))
* **keyed:** make lifecycles work properly in repeater keyed mode ([e11d89e](https://github.com/aurelia/aurelia/commit/e11d89e))
* **ast:** temporarily loosen up binding behavior idempotency ([12b6f21](https://github.com/aurelia/aurelia/commit/12b6f21))
* **fetch-client:** tslint fixes ([c9a8f8d](https://github.com/aurelia/aurelia/commit/c9a8f8d))
* **repeat:** initial infra work for repeater keyed mode ([ba31c62](https://github.com/aurelia/aurelia/commit/ba31c62))
* **router:** change entering timing & add viewport render and state ([91cfb64](https://github.com/aurelia/aurelia/commit/91cfb64))
* **viewport-custom-element:** directly implement custom element behavior ([845dfc4](https://github.com/aurelia/aurelia/commit/845dfc4))
* **router:** update closest & add container influence on load ([cdce786](https://github.com/aurelia/aurelia/commit/cdce786))
* **router:** add container to viewport ([406967a](https://github.com/aurelia/aurelia/commit/406967a))
* **lifecycle-render:** remove arguments that can be resolved from the context ([7eb2b5d](https://github.com/aurelia/aurelia/commit/7eb2b5d))
* **lifecycle:** merge ILifecycleMount and ILifecycleUnmount into IMountableComponent ([5e6db98](https://github.com/aurelia/aurelia/commit/5e6db98))
* **runtime:** merge IHooks into ILifecycleHooks ([3ed5116](https://github.com/aurelia/aurelia/commit/3ed5116))
* **all:** combine bindable and attachable into component ([a10461f](https://github.com/aurelia/aurelia/commit/a10461f))
* **lifecycle:** bind bindings before binding() hook and use binding() hook instead of bound() in repeater ([970b70d](https://github.com/aurelia/aurelia/commit/970b70d))
* **lifecycle:** merge hooks interfaces ([bbd3869](https://github.com/aurelia/aurelia/commit/bbd3869))
* **ast:** make $kind property readonly ([bdf2cb2](https://github.com/aurelia/aurelia/commit/bdf2cb2))
* **ast:** abstract IConnectable ([c2abd6e](https://github.com/aurelia/aurelia/commit/c2abd6e))
* **ast:** extract interfaces ([7f16091](https://github.com/aurelia/aurelia/commit/7f16091))
* **runtime:** reduce dependencies in lifecycles ([0a660e1](https://github.com/aurelia/aurelia/commit/0a660e1))
* **runtime:** move all const enums to flags.ts ([27da4ec](https://github.com/aurelia/aurelia/commit/27da4ec))
* **jit-html:** more linting fixes through test generation scripts ([ab04628](https://github.com/aurelia/aurelia/commit/ab04628))
* **jit-html:** more linting fixes through test generation scripts ([c4595c6](https://github.com/aurelia/aurelia/commit/c4595c6))
* ***:** make unknown the default for InterfaceSymbol ([d74da2c](https://github.com/aurelia/aurelia/commit/d74da2c))
* ***:** make unknown the default for InterfaceSymbol ([0b77ce3](https://github.com/aurelia/aurelia/commit/0b77ce3))
* ***:** use substring in favor of substr ([ab0dece](https://github.com/aurelia/aurelia/commit/ab0dece))
* **proxy-observer:** move lookup to runtime ([22f25db](https://github.com/aurelia/aurelia/commit/22f25db))
* **proxy-observer:** various tweaks and fixes ([30f91e8](https://github.com/aurelia/aurelia/commit/30f91e8))
* **observation:** initial wireup for proxy observation ([86422eb](https://github.com/aurelia/aurelia/commit/86422eb))
* **proxy-observer:** use direct variable instead of weakmap for checking proxy existence ([2bbab4d](https://github.com/aurelia/aurelia/commit/2bbab4d))
* **proxy-observer:** use string instead of symbol for raw prop ([f1e09ce](https://github.com/aurelia/aurelia/commit/f1e09ce))
* **all:** prepare lifecycle flags arguments for proxy observation ([1f8bf19](https://github.com/aurelia/aurelia/commit/1f8bf19))
* ***:** fix bantypes in tests ([2d7bad8](https://github.com/aurelia/aurelia/commit/2d7bad8))
* **kernel:** more DI typing ([97b7849](https://github.com/aurelia/aurelia/commit/97b7849))
* ***:** enable ban-types linting rule and fix violations ([00e61b1](https://github.com/aurelia/aurelia/commit/00e61b1))
* **ticker:** improve frameDelta rounding ([53e3aff](https://github.com/aurelia/aurelia/commit/53e3aff))
* **dirty-checker:** rename disable to disabled ([ed4803f](https://github.com/aurelia/aurelia/commit/ed4803f))
* **dirty-checker:** cleanup and pass fromTick flag ([871269f](https://github.com/aurelia/aurelia/commit/871269f))
* **dirty-checker:** integrate with the raf ticker ([848ca2e](https://github.com/aurelia/aurelia/commit/848ca2e))
* **router:** remove old configured routes code ([73f7d8c](https://github.com/aurelia/aurelia/commit/73f7d8c))
* **all:** reorganize all registrations and make them more composable ([6fcce8b](https://github.com/aurelia/aurelia/commit/6fcce8b))
* **all:** expose registrations and registerables in a consistent manner ([ea9e59c](https://github.com/aurelia/aurelia/commit/ea9e59c))
* **runtime-html:** move the dom initializer to runtime-html-browser ([444082e](https://github.com/aurelia/aurelia/commit/444082e))
* ***:** linting fixes ([a9e26ad](https://github.com/aurelia/aurelia/commit/a9e26ad))
* **router:** move late viewport element catch up into viewport ([45b58e6](https://github.com/aurelia/aurelia/commit/45b58e6))
* **debug:** explicitly export non-internal stuff ([840fe57](https://github.com/aurelia/aurelia/commit/840fe57))
* **runtime-html:** explicitly export non-internal stuff ([554efcb](https://github.com/aurelia/aurelia/commit/554efcb))
* **jit-html:** explicitly export non-internal stuff ([e78a2f4](https://github.com/aurelia/aurelia/commit/e78a2f4))
* **jit:** explicitly export non-internal stuff ([ee6f102](https://github.com/aurelia/aurelia/commit/ee6f102))
* **runtime:** explicitly export non-internal items ([1c05730](https://github.com/aurelia/aurelia/commit/1c05730))
* **kernel:** cleanup exports ([dda5c5d](https://github.com/aurelia/aurelia/commit/dda5c5d))
* **collection-observer:** cleanup collection observation ([c43244f](https://github.com/aurelia/aurelia/commit/c43244f))
* **kernel:** explicitly export non-internal resources ([43381a5](https://github.com/aurelia/aurelia/commit/43381a5))
* **all:** use Resource.define instead of decorators ([045aa90](https://github.com/aurelia/aurelia/commit/045aa90))
* **all:** replace inject decorators with static inject properties ([9fc37c1](https://github.com/aurelia/aurelia/commit/9fc37c1))
* **all:** move timer globals to PLATFORM ([fa3bda3](https://github.com/aurelia/aurelia/commit/fa3bda3))
* **observation:** move observers to own files and rename Observer to SelfObserver ([24beabf](https://github.com/aurelia/aurelia/commit/24beabf))
* **router:** adapt to new runtime-html ([104e47b](https://github.com/aurelia/aurelia/commit/104e47b))
* **jit:** move html-specific logic to new jit-html package ([3372cc8](https://github.com/aurelia/aurelia/commit/3372cc8))
* **runtime:** reduce DOM API surface and dependencies on it ([5512c64](https://github.com/aurelia/aurelia/commit/5512c64))
* **observation:** make isDOMObserver property optional ([389ac47](https://github.com/aurelia/aurelia/commit/389ac47))
* **runtime:** completely remove dependencies on DOM-specific types ([24819d2](https://github.com/aurelia/aurelia/commit/24819d2))
* **runtime:** further generalize the runtime ([ab2b1d1](https://github.com/aurelia/aurelia/commit/ab2b1d1))
* **runtime:** move html-specific stuff out of the runtime ([645697f](https://github.com/aurelia/aurelia/commit/645697f))
* **router:** pass DOM to hydrate ([8f69833](https://github.com/aurelia/aurelia/commit/8f69833))
* **svg-analyzer:** use document instead of DOM for html browser specific code ([52427aa](https://github.com/aurelia/aurelia/commit/52427aa))
* **all:** use IDOM interface instead of DOM class ([2f50900](https://github.com/aurelia/aurelia/commit/2f50900))
* **dom:** remove unused methods ([c1927f4](https://github.com/aurelia/aurelia/commit/c1927f4))
* **all:** make DOM injectable ([a6305a0](https://github.com/aurelia/aurelia/commit/a6305a0))
* **signaler:** move signaler to observation ([4c71bac](https://github.com/aurelia/aurelia/commit/4c71bac))
* **runtime:** move binding-context to observation ([750e32f](https://github.com/aurelia/aurelia/commit/750e32f))
* **runtime:** move observers together ([6022939](https://github.com/aurelia/aurelia/commit/6022939))
* **binding-behavior:** shorten names ([8e9ff09](https://github.com/aurelia/aurelia/commit/8e9ff09))
* **runtime:** put resources together ([afed7b9](https://github.com/aurelia/aurelia/commit/afed7b9))
* **all:** move resourceType from runtime to kernel ([2c82c14](https://github.com/aurelia/aurelia/commit/2c82c14))
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
* **jit:** rename metadata-model to resource-model ([0c1e647](https://github.com/aurelia/aurelia/commit/0c1e647))
* **template-binder:** extract text interpolation into separate function ([771b88c](https://github.com/aurelia/aurelia/commit/771b88c))
* **template-binder:** extract replace-part processing into separate function ([160f7cb](https://github.com/aurelia/aurelia/commit/160f7cb))
* **template-binder:** extract template controller lifting into separate function ([8e8e27e](https://github.com/aurelia/aurelia/commit/8e8e27e))
* **template-compiler:** fix slots ([550619b](https://github.com/aurelia/aurelia/commit/550619b))
* **template-compiler:** reimplement let element ([27ab73f](https://github.com/aurelia/aurelia/commit/27ab73f))
* **template-compiler:** recognize slots ([21a2dc9](https://github.com/aurelia/aurelia/commit/21a2dc9))
* **template-compiler:** fix ref ([61ea9ec](https://github.com/aurelia/aurelia/commit/61ea9ec))
* **template-binder:** simplify symbol flags ([fa021c5](https://github.com/aurelia/aurelia/commit/fa021c5))
* **template-binder:** fix plain attribute binding commands ([2e0c36a](https://github.com/aurelia/aurelia/commit/2e0c36a))
* **template-binder:** fix multi attribute bindings ([80ec607](https://github.com/aurelia/aurelia/commit/80ec607))
* **template-compiler:** more fixes ([a916c64](https://github.com/aurelia/aurelia/commit/a916c64))
* **template-compiler:** sort of fix replace-part ([398c4f0](https://github.com/aurelia/aurelia/commit/398c4f0))
* **template-compiler:** fix a command slip up ([07ec65a](https://github.com/aurelia/aurelia/commit/07ec65a))
* **template-compiler:** reimplement the template compiler with the template binder ([ad94bd1](https://github.com/aurelia/aurelia/commit/ad94bd1))
* **instructions:** improve naming/typing consistency ([1ad8d2a](https://github.com/aurelia/aurelia/commit/1ad8d2a))
* **jit:** rename element-binder to template-binder ([d8065e9](https://github.com/aurelia/aurelia/commit/d8065e9))
* **element-binder:** consolidate flags and add some helper functions ([a321100](https://github.com/aurelia/aurelia/commit/a321100))
* **element-binder:** add tracing and fix a couple things ([b6158ee](https://github.com/aurelia/aurelia/commit/b6158ee))
* **element-binder:** properly implement dynamicOptions parsing and other tweaks ([8e46176](https://github.com/aurelia/aurelia/commit/8e46176))
* **element-binder:** cleanup and add some initial expression parsing ([646b7da](https://github.com/aurelia/aurelia/commit/646b7da))
* **template-compiler:** more template controller compilation fixes ([2517567](https://github.com/aurelia/aurelia/commit/2517567))
* **template-compiler:** add ref as attribute pattern ([71f0c45](https://github.com/aurelia/aurelia/commit/71f0c45))
* **template-compiler:** fix custom attribute bindables & binding commands ([8109e11](https://github.com/aurelia/aurelia/commit/8109e11))
* **template-compiler:** add missing au class to render targets ([fbe27fc](https://github.com/aurelia/aurelia/commit/fbe27fc))
* **template-compiler:** fix sibling template controller compilation ([6f7d5ce](https://github.com/aurelia/aurelia/commit/6f7d5ce))
* **semantic-model:** fix element binding interpolations ([06de9fa](https://github.com/aurelia/aurelia/commit/06de9fa))
* **semantic-model:** emit element instructions in the correct order ([c400646](https://github.com/aurelia/aurelia/commit/c400646))
* **semantic-model:** fix setPropertyInstruction again ([6873ba6](https://github.com/aurelia/aurelia/commit/6873ba6))
* **template-compiler:** fix multi template controller compilation on regular elements ([d60d384](https://github.com/aurelia/aurelia/commit/d60d384))
* **template-compiler:** fix multi template controller compilation on surrogates ([7cc3c4b](https://github.com/aurelia/aurelia/commit/7cc3c4b))
* **binding-command:** update binding command to utilize the metadata model ([c5a8e0a](https://github.com/aurelia/aurelia/commit/c5a8e0a))
* **template-compiler:** create resource lookups eagerly / small fixes ([2bf976a](https://github.com/aurelia/aurelia/commit/2bf976a))
* **template-compiler:** more refactor/fixes/cleanup ([7b422ac](https://github.com/aurelia/aurelia/commit/7b422ac))
* **template-compiler:** first steps at cleaning up the last compiler pass ([7169744](https://github.com/aurelia/aurelia/commit/7169744))
* **jit:** various small fixes ([67b1b9b](https://github.com/aurelia/aurelia/commit/67b1b9b))
* **template-compiler:** track attribute ownership to prevent duplicate processing & set interpolation textNode to empty in the compiler itself ([535bf95](https://github.com/aurelia/aurelia/commit/535bf95))
* **template-compiler:** add trace calls to symbol visitors ([bb4cf6c](https://github.com/aurelia/aurelia/commit/bb4cf6c))
* **template-compiler:** start migrating binding commands, various small fixes ([9c00402](https://github.com/aurelia/aurelia/commit/9c00402))
* **jit:** full rewrite of the TemplateCompiler and SemanticModel (draft) ([8a0fe63](https://github.com/aurelia/aurelia/commit/8a0fe63))
* **jit:** properly implement more complex replaceable scenarios ([752e21f](https://github.com/aurelia/aurelia/commit/752e21f))
* **runtime:** strictNullChecks fixes ([b000aa2](https://github.com/aurelia/aurelia/commit/b000aa2))
* **plugin-svg:** strictNullChecks fixes ([63b8a15](https://github.com/aurelia/aurelia/commit/63b8a15))
* **plugin-requirejs:** strictNullChecks fixes ([73a87b8](https://github.com/aurelia/aurelia/commit/73a87b8))
* **kernel:** strictNullChecks fixes ([49d37f3](https://github.com/aurelia/aurelia/commit/49d37f3))
* ***:** standardise on "as" type casts ([d0933b8](https://github.com/aurelia/aurelia/commit/d0933b8))
* ***:** suppress some Sonart linting errors globally ([08a4679](https://github.com/aurelia/aurelia/commit/08a4679))
* **runtime:** fix or suppress Sonart linting errors ([068174c](https://github.com/aurelia/aurelia/commit/068174c))
* **jit:** fix or suppress Sonart linting errors ([7cdfaa3](https://github.com/aurelia/aurelia/commit/7cdfaa3))
* **requirejs:** fix or suppress Sonart linting errors ([b4d182b](https://github.com/aurelia/aurelia/commit/b4d182b))
* **kernel:** fix or suppress Sonart linting errors ([da21118](https://github.com/aurelia/aurelia/commit/da21118))
* **runtime:** changes to Templating for strictPropertyInitialization ([b24758f](https://github.com/aurelia/aurelia/commit/b24758f))
* ***:** linting fixes for IIndexable ([63abddb](https://github.com/aurelia/aurelia/commit/63abddb))
* **runtime:** change Templating for strictPropertyInitialization ([107a06e](https://github.com/aurelia/aurelia/commit/107a06e))
* **runtime:** fix no-http-string linting supression ([26e2431](https://github.com/aurelia/aurelia/commit/26e2431))
* **kernel:** linting fixes for di ([d4a51a0](https://github.com/aurelia/aurelia/commit/d4a51a0))
* ***:** linting fixes for IIndexable ([4faffed](https://github.com/aurelia/aurelia/commit/4faffed))
* ***:** fix no-floating-promises linting warnings ([03cc0eb](https://github.com/aurelia/aurelia/commit/03cc0eb))
* ***:** partially revert renames due to no-reserved-keywords ([478bd4b](https://github.com/aurelia/aurelia/commit/478bd4b))
* ***:** fix no-floating-promises linting warnings ([fc4018b](https://github.com/aurelia/aurelia/commit/fc4018b))
* ***:** partially revert renames due to no-reserved-keywords ([87501c1](https://github.com/aurelia/aurelia/commit/87501c1))
* ***:** more any to strict typing conversions ([26f2d41](https://github.com/aurelia/aurelia/commit/26f2d41))
* **attribute-pattern:** use negative pattern matching based on registered symbols, improve side-by-side compat ([bcaec51](https://github.com/aurelia/aurelia/commit/bcaec51))
* **jit:** properly implement @attributePattern and separate the jit AST from parsers ([07a8f16](https://github.com/aurelia/aurelia/commit/07a8f16))
* **attribute-pattern:** return interpretation result and initial decorator setup ([9c640be](https://github.com/aurelia/aurelia/commit/9c640be))
* ***:** remove no-reserved-keywords suppressions and fix most of them ([adde468](https://github.com/aurelia/aurelia/commit/adde468))
* ***:** remove no-reserved-keywords suppressions and fix most of them ([579c606](https://github.com/aurelia/aurelia/commit/579c606))
* **runtime:** remove StrictAny in favor of unknown ([eecb4a1](https://github.com/aurelia/aurelia/commit/eecb4a1))
* **runtime:** changes to Binding for strictPropertyInitialization ([1e1d804](https://github.com/aurelia/aurelia/commit/1e1d804))
* **runtime:** changes to Binding for strictPropertyInitialization ([857efa1](https://github.com/aurelia/aurelia/commit/857efa1))
* **resources:** improve flexibility & strictness of resource types ([499a189](https://github.com/aurelia/aurelia/commit/499a189))
* ***:** fix errors and warnings reported by "lgtm" ([173f364](https://github.com/aurelia/aurelia/commit/173f364))
* ***:** add typeguards to decorators and rename Source to Definition ([e8ea550](https://github.com/aurelia/aurelia/commit/e8ea550))
* ***:** decorators use standalone function and has overload signatures ([dffb514](https://github.com/aurelia/aurelia/commit/dffb514))
* **runtime:** add function overloads to "define" on "IResourceKind" ([56425bf](https://github.com/aurelia/aurelia/commit/56425bf))
* **runtime:** decorate customElement ([fa021a0](https://github.com/aurelia/aurelia/commit/fa021a0))
* **runtime:** decorate customAttribute ([b5de1a7](https://github.com/aurelia/aurelia/commit/b5de1a7))
* **runtime:** decorate valueConverter ([62b5bc4](https://github.com/aurelia/aurelia/commit/62b5bc4))
* **runtime:** decorate bindingBehavior ([406edce](https://github.com/aurelia/aurelia/commit/406edce))
* **jit:** decorate bindingCommand ([385a3d3](https://github.com/aurelia/aurelia/commit/385a3d3))
* ***:** fix errors and warnings reported by "lgtm" ([c77b12c](https://github.com/aurelia/aurelia/commit/c77b12c))
* **runtime:** move ICustomAttribute+ and ICustomElement+ interfaces ([11b016c](https://github.com/aurelia/aurelia/commit/11b016c))
* ***:** derive ISomethingDefinition from a base IResourceDefinition ([bdc0b6f](https://github.com/aurelia/aurelia/commit/bdc0b6f))
* ***:** rename ISomethingSource to ISomethingDefinition ([8f2727e](https://github.com/aurelia/aurelia/commit/8f2727e))
* **ast:** define properties explicitly in constructor ([7882fb7](https://github.com/aurelia/aurelia/commit/7882fb7))
* **runtime:** define properties explicitly in constructor ([b34bf00](https://github.com/aurelia/aurelia/commit/b34bf00))
* **runtime:** decorate bindingBehavior ([2507ffd](https://github.com/aurelia/aurelia/commit/2507ffd))
* **instructions:** remove renderStrategy in favor of instructionRenderer ([9aca18a](https://github.com/aurelia/aurelia/commit/9aca18a))
* **renderer:** decouple instruction-specific processing from the renderer ([c4cd235](https://github.com/aurelia/aurelia/commit/c4cd235))
* **instructions:** move instruction classes from jit to runtime ([45c186e](https://github.com/aurelia/aurelia/commit/45c186e))
* **lifecycle:** add registerTask api back in + preliminary test ([738d32f](https://github.com/aurelia/aurelia/commit/738d32f))
* **expression-parser:** get rid of exponentiation to preserve ES2015 parser compatibility ([b0dbe1c](https://github.com/aurelia/aurelia/commit/b0dbe1c))
* **lifecycle:** add task functionality back in (still a few details left todo) ([59d7c6e](https://github.com/aurelia/aurelia/commit/59d7c6e))
* **lifecycle:** only unmount roots and several small tweaks for consistency ([c0c948b](https://github.com/aurelia/aurelia/commit/c0c948b))
* **templating:** move definitions up one level ([1ea759e](https://github.com/aurelia/aurelia/commit/1ea759e))
* **templating:** move view abstraction and composition-coordinator into lifecycle.ts ([721bc43](https://github.com/aurelia/aurelia/commit/721bc43))
* **lifecycle:** remove unnecessary $connectFlags property ([b616676](https://github.com/aurelia/aurelia/commit/b616676))
* **lifecycle:** change the global lifecycle object into an injectable dependency ([dc38d91](https://github.com/aurelia/aurelia/commit/dc38d91))
* **lifecycle:** make bind + attach lifecycles more consistent, remove unneeded flag properties ([ad9eafb](https://github.com/aurelia/aurelia/commit/ad9eafb))
* **runtime:** rename BindingFlags to LifecycleFlags ([a3ad7f2](https://github.com/aurelia/aurelia/commit/a3ad7f2))
* **binding:** initial implementation for new connect queue ([481714f](https://github.com/aurelia/aurelia/commit/481714f))
* **view:** move lifecycle logic to lifecycle files ([da82092](https://github.com/aurelia/aurelia/commit/da82092))
* **runtime:** shorten flushChanges to flush ([e27e4f7](https://github.com/aurelia/aurelia/commit/e27e4f7))
* **lifecycle-attach:** wrap element/attribute attach in begin/end attach lifecycle ([9f72223](https://github.com/aurelia/aurelia/commit/9f72223))
* **templating:** initial restructuring for lifecycle integration ([fc8cf7b](https://github.com/aurelia/aurelia/commit/fc8cf7b))
* **runtime-behavior:** merge $behavior.hooks into the resource definition ([d41ecf1](https://github.com/aurelia/aurelia/commit/d41ecf1))
* **lifecycle:** shorten LifecycleHooks to Hooks ([9c4efdb](https://github.com/aurelia/aurelia/commit/9c4efdb))
* **lifecycle:** shorten LifecycleState to State ([42fe7c4](https://github.com/aurelia/aurelia/commit/42fe7c4))
* **lifecycle:** merge changeSet into lifecycle ([63da3bb](https://github.com/aurelia/aurelia/commit/63da3bb))
* **lifecycle:** merge bind and attach lifecycles ([20b651a](https://github.com/aurelia/aurelia/commit/20b651a))
* **lifecycle:** normalize the start/end mechanism across lifecycle hooks ([acd1fde](https://github.com/aurelia/aurelia/commit/acd1fde))
* **lifecycle:** remove the async stuff for the time being ([300820f](https://github.com/aurelia/aurelia/commit/300820f))
* **lifecycle:** flatten the link structure ([88c562c](https://github.com/aurelia/aurelia/commit/88c562c))
* **lifecycle:** merge attach with detach lifecycle (first integration step) ([4a05985](https://github.com/aurelia/aurelia/commit/4a05985))
* **templating:** reorganize instructions/definitions ([a16844f](https://github.com/aurelia/aurelia/commit/a16844f))
* **runtime:** cleanup/reorganize lifecycle types ([a744a9f](https://github.com/aurelia/aurelia/commit/a744a9f))
* **all:** reorganize/consolidate type structure ([57b086f](https://github.com/aurelia/aurelia/commit/57b086f))
* **create-element:** rename PotentialRenderable to RenderPlan ([38a188a](https://github.com/aurelia/aurelia/commit/38a188a))
* **dom:** try using 2 render locations" ([b3d42b9](https://github.com/aurelia/aurelia/commit/b3d42b9))
* **runtime:** move change-set up one level ([d2b7fe5](https://github.com/aurelia/aurelia/commit/d2b7fe5))
* **runtime:** remove index.ts files from non-root locations and don't import from index ([af19838](https://github.com/aurelia/aurelia/commit/af19838))
* **dom:** try using 2 render locations ([df68f15](https://github.com/aurelia/aurelia/commit/df68f15))
* **containerless-projector:** use component $state to determine needsMount ([1657181](https://github.com/aurelia/aurelia/commit/1657181))
* **templating:** move $isAttached, $needsMount and $isCached to flags ([d0f384c](https://github.com/aurelia/aurelia/commit/d0f384c))
* **runtime:** switch from $isBound to $state flags ([f4d12bd](https://github.com/aurelia/aurelia/commit/f4d12bd))
* **templating:** make bindables and attachables into linked lists for lifecycle refactor ([b5d12b3](https://github.com/aurelia/aurelia/commit/b5d12b3))
* **templating:** move createNodeSequence into factory class, move rendering related classes to rendering-engine, some tweaks in how templates are created ([b9f7516](https://github.com/aurelia/aurelia/commit/b9f7516))
* **view:** split up ViewFactory into ViewFactory and ViewCache ([4fde7ef](https://github.com/aurelia/aurelia/commit/4fde7ef))
* **change-set:** implement changeSet as linked list ([2c4a9f1](https://github.com/aurelia/aurelia/commit/2c4a9f1))
* **lifecycle:** finish rename from add/remove nodes to mount/unmount ([afc25fb](https://github.com/aurelia/aurelia/commit/afc25fb))
* **templating:** rename $addNodes to $mount, $removeNodes to $unmount, mount to hold ([83a11c6](https://github.com/aurelia/aurelia/commit/83a11c6))
* **customElement:** rename onElementRemoved() to take() ([fa699c7](https://github.com/aurelia/aurelia/commit/fa699c7))
* **dom:** use static class properties instead of object" ([b608223](https://github.com/aurelia/aurelia/commit/b608223))
* **bindable:** improve typings and small tweak to the flow ([27486a2](https://github.com/aurelia/aurelia/commit/27486a2))
* **dom:** don't declare globals ([22f5765](https://github.com/aurelia/aurelia/commit/22f5765))
* **dom:** use static class properties instead of object ([6d3604f](https://github.com/aurelia/aurelia/commit/6d3604f))
* **target-accessors:** remove DOM dependency ([dc5334e](https://github.com/aurelia/aurelia/commit/dc5334e))
* **element-observation:** remove DOM dependency from element observers ([7aa22aa](https://github.com/aurelia/aurelia/commit/7aa22aa))
* **dom:** remove DOM dependency from dom.ts ([6175167](https://github.com/aurelia/aurelia/commit/6175167))
* **all:** rename ICustomAttributeSource to IAttributeDefinition ([df4babf](https://github.com/aurelia/aurelia/commit/df4babf))
* **all:** rename ITemplateSource to ITemplateDefinition and 'src' to 'def' ([5c398c8](https://github.com/aurelia/aurelia/commit/5c398c8))
* **all:** rename 'srcOrExpr' to 'from' and 'dest' to 'to' ([e71b758](https://github.com/aurelia/aurelia/commit/e71b758))
* **all:** rename templateOrNode to template ([ae04e9f](https://github.com/aurelia/aurelia/commit/ae04e9f))
* **dom:** create a stub class to represent au-marker ([72b8905](https://github.com/aurelia/aurelia/commit/72b8905))
* **templating:** temporarily disable optimizations to get templating working correctly first ([c0a6690](https://github.com/aurelia/aurelia/commit/c0a6690))

<a name="0.3.0"></a>
# 0.3.0 (2018-10-12)

### Features:

* **binding:** improve AST $kind classifying and other small tweaks/fixes (#213) ([7267165](https://github.com/aurelia/aurelia/commit/7267165))
* **ast:** add additional $kind classifications and eager initialize literals if they are pure ([7267165](https://github.com/aurelia/aurelia/commit/7267165))
* **all:** implement InterpolationBinding ([1e804a0](https://github.com/aurelia/aurelia/commit/1e804a0))
* **binding-context:** improve error reporting ([1e804a0](https://github.com/aurelia/aurelia/commit/1e804a0))
* **kernel:** add decoratable interface to support strongly typed decorators ([f67a414](https://github.com/aurelia/aurelia/commit/f67a414))
* **binding:** add @connectable decorator back in (strongly typed) ([f67a414](https://github.com/aurelia/aurelia/commit/f67a414))
* **all:** implement InterpolationBinding ([f67a414](https://github.com/aurelia/aurelia/commit/f67a414))
* **unparser:** implement interpolation unparsing ([f67a414](https://github.com/aurelia/aurelia/commit/f67a414))
* **expression-parser:** delegate errors to Reporter for more descriptive errors ([a0c9b0e](https://github.com/aurelia/aurelia/commit/a0c9b0e))
* **debug:** create AST expression serializer ([a0c9b0e](https://github.com/aurelia/aurelia/commit/a0c9b0e))
* **expression-parser:** improve error reporting ([a0c9b0e](https://github.com/aurelia/aurelia/commit/a0c9b0e))
* **kernel:** add unwrap interface ([197235c](https://github.com/aurelia/aurelia/commit/197235c))
* **ast:** add visitor interface and implement accept methods on AST ([197235c](https://github.com/aurelia/aurelia/commit/197235c))
* **expression-parser:** allow member expressions on numeric literals ([197235c](https://github.com/aurelia/aurelia/commit/197235c))
* **potential-renderable:** autodetect when build is required ([f296d04](https://github.com/aurelia/aurelia/commit/f296d04))
* **render-context:** throw more informative errors when the context is not prepared yet ([f296d04](https://github.com/aurelia/aurelia/commit/f296d04))
* **Aurelia:** self register to container ([5971d36](https://github.com/aurelia/aurelia/commit/5971d36))
* **lifecycle:** new callbacks, async tasks, and updated template controllers (#171) ([7a9a635](https://github.com/aurelia/aurelia/commit/7a9a635))
* **lifecycle:** minimal add/remove of nodes ([7a9a635](https://github.com/aurelia/aurelia/commit/7a9a635))
* **lifecycle:** enable detach tasks ([7a9a635](https://github.com/aurelia/aurelia/commit/7a9a635))
* **lifecycle:** enable attach tasks ([7a9a635](https://github.com/aurelia/aurelia/commit/7a9a635))
* **lifecycle:** stub out lifecycle flags ([7a9a635](https://github.com/aurelia/aurelia/commit/7a9a635))
* **lifecycle:** introduce child lifecycles ([7a9a635](https://github.com/aurelia/aurelia/commit/7a9a635))
* **lifecycle:** make detach/attach lifecycle symetric ([7a9a635](https://github.com/aurelia/aurelia/commit/7a9a635))
* **lifecycle:** add flags ([7a9a635](https://github.com/aurelia/aurelia/commit/7a9a635))
* **lifecycle:** overhaul ([7a9a635](https://github.com/aurelia/aurelia/commit/7a9a635))
* **lifecycle:** auto unbind after node removal ([7a9a635](https://github.com/aurelia/aurelia/commit/7a9a635))
* **lifecycle:** introduce lifecycle task ([7a9a635](https://github.com/aurelia/aurelia/commit/7a9a635))
* **template-compiler:** allow multiple template controllers per element ([9eb0764](https://github.com/aurelia/aurelia/commit/9eb0764))
* **template-compiler:** handle semicolon-separated bindings in attributes ([ad6eeb4](https://github.com/aurelia/aurelia/commit/ad6eeb4))
* **jit:** decouple attribute/element parsing from template compiler ([ad6eeb4](https://github.com/aurelia/aurelia/commit/ad6eeb4))
* **template-compiler:** add initial implementation of semantic model ([ad6eeb4](https://github.com/aurelia/aurelia/commit/ad6eeb4))
* **renderer:** throw specific error codes on target/instruction count mismatch ([ad6eeb4](https://github.com/aurelia/aurelia/commit/ad6eeb4))
* **expression-parser:** map empty attribute value to empty string for bound properties ([7a92cd8](https://github.com/aurelia/aurelia/commit/7a92cd8))


### Bug Fixes:

* **subscriber-collection:** remove circular dependency ([c3e3779](https://github.com/aurelia/aurelia/commit/c3e3779))
* **ast:** do not eager initialize pure literals ([7267165](https://github.com/aurelia/aurelia/commit/7267165))
* **ast:** fix a few issues with $kind and define static properties last ([7267165](https://github.com/aurelia/aurelia/commit/7267165))
* **self-binding-behavior:** fix event.path and type defs ([7267165](https://github.com/aurelia/aurelia/commit/7267165))
* **TemplateCompiler:** properly startup compilation when passed a template (#214) ([c74a44c](https://github.com/aurelia/aurelia/commit/c74a44c))
* **expression-parser:** fix differentation for caching of expressions/interpolations ([1e804a0](https://github.com/aurelia/aurelia/commit/1e804a0))
* **iterator-binding:** correctly compile and render ForOfStatement ([1e804a0](https://github.com/aurelia/aurelia/commit/1e804a0))
* **signaler:** make addSignalListener idempotent ([1e804a0](https://github.com/aurelia/aurelia/commit/1e804a0))
* **kernel:** fix decorated interface ([f67a414](https://github.com/aurelia/aurelia/commit/f67a414))
* **binding:** wrap updatetarget/updatesource so vCurrent BBs work again ([f67a414](https://github.com/aurelia/aurelia/commit/f67a414))
* **expression-parser:** fix differentation for caching of expressions/interpolations ([f67a414](https://github.com/aurelia/aurelia/commit/f67a414))
* **iterator-binding:** correctly compile and render ForOfStatement ([f67a414](https://github.com/aurelia/aurelia/commit/f67a414))
* **SelectObserver:** complete implementation, adjust tests ([ffdf01d](https://github.com/aurelia/aurelia/commit/ffdf01d))
* **SelectObserver:** simplify flow, remove debugger, add test ([ffdf01d](https://github.com/aurelia/aurelia/commit/ffdf01d))
* **expression-parser:** correctly parse "unsafe" integers ([a0c9b0e](https://github.com/aurelia/aurelia/commit/a0c9b0e))
* **expression-parser:** disable broken "raw" values on template for now ([a0c9b0e](https://github.com/aurelia/aurelia/commit/a0c9b0e))
* **expression-parser:** correctly parse member expressions when preceded by a unary operator ([a0c9b0e](https://github.com/aurelia/aurelia/commit/a0c9b0e))
* **expression-parser:** allow template strings to have member expressions ([a0c9b0e](https://github.com/aurelia/aurelia/commit/a0c9b0e))
* **expression-parser:** allow AccessThis to be the tag for a template ([a0c9b0e](https://github.com/aurelia/aurelia/commit/a0c9b0e))
* **expression-parser:** use IsAssign instead of Conditional precedence for nested expressions ([a0c9b0e](https://github.com/aurelia/aurelia/commit/a0c9b0e))
* **expression-parser:** fix binary sibling operator precedence ([a0c9b0e](https://github.com/aurelia/aurelia/commit/a0c9b0e))
* **expression-parser:** ensure AccessScope is assignable ([a0c9b0e](https://github.com/aurelia/aurelia/commit/a0c9b0e))
* **expression-parser:** properly detect EOF for unterminated quote instead of hanging ([a0c9b0e](https://github.com/aurelia/aurelia/commit/a0c9b0e))
* **expression-parser:** throw on invalid dot terminal in AccessThis ([a0c9b0e](https://github.com/aurelia/aurelia/commit/a0c9b0e))
* **expression-parser:** throw on unterminated template instead of hanging ([a0c9b0e](https://github.com/aurelia/aurelia/commit/a0c9b0e))
* **expression-parser:** correctly parse number with trailing dot ([a0c9b0e](https://github.com/aurelia/aurelia/commit/a0c9b0e))
* **debug:** correct / update unparser and debug mode ([197235c](https://github.com/aurelia/aurelia/commit/197235c))
* **expression-parser:** fix parsing error with trailing elision ([197235c](https://github.com/aurelia/aurelia/commit/197235c))
* **expression-parser:** allow AccessThis as the last element of an array ([197235c](https://github.com/aurelia/aurelia/commit/197235c))
* **expression-parser:** allow AccessThis as the condition in a conditional ([197235c](https://github.com/aurelia/aurelia/commit/197235c))
* **expression-parser:** allow AccessThis as left-hand side of binary expressions ([197235c](https://github.com/aurelia/aurelia/commit/197235c))
* **expression-parser:** reset access after parsing non-identifiers ([197235c](https://github.com/aurelia/aurelia/commit/197235c))
* **unparser:** explicitly reconstruct precedence ([197235c](https://github.com/aurelia/aurelia/commit/197235c))
* **repeat:** properly hook into attach/detach lifecycles ([f296d04](https://github.com/aurelia/aurelia/commit/f296d04))
* **repeat:** synchronously bind child views ([f296d04](https://github.com/aurelia/aurelia/commit/f296d04))
* **repeat:** use the correct lifecycle api for attach/detach ([f296d04](https://github.com/aurelia/aurelia/commit/f296d04))
* **lifecycle:** fix task variable shadowing issue ([f296d04](https://github.com/aurelia/aurelia/commit/f296d04))
* **view:** check nextSibling instead of previousSibling in mount() ([f296d04](https://github.com/aurelia/aurelia/commit/f296d04))
* **view:** validate renderLocation and ensure $nodes.lastChild exists on mount ([f296d04](https://github.com/aurelia/aurelia/commit/f296d04))
* **RuntimeCompilationResources:** do not auto register ([5971d36](https://github.com/aurelia/aurelia/commit/5971d36))
* **Observer:** use identity instead of noop ([5971d36](https://github.com/aurelia/aurelia/commit/5971d36))
* **test:** remove .only ([5971d36](https://github.com/aurelia/aurelia/commit/5971d36))
* **CustomElement:** flush at startup ([5971d36](https://github.com/aurelia/aurelia/commit/5971d36))
* **CustomElement:** remove unnecessary flush ([5971d36](https://github.com/aurelia/aurelia/commit/5971d36))
* **Observer:** revert to noop ([5971d36](https://github.com/aurelia/aurelia/commit/5971d36))
* **Renderer:** remove unnecessary checks ([5971d36](https://github.com/aurelia/aurelia/commit/5971d36))
* **DI:** alias registration param order and tests (#202) ([1683135](https://github.com/aurelia/aurelia/commit/1683135))
* **template-compiler:** do not treat DocumentFragment symbol as definition root ([48c4151](https://github.com/aurelia/aurelia/commit/48c4151))
* **template-compiler:** target the defintion root when detecting slots ([48c4151](https://github.com/aurelia/aurelia/commit/48c4151))
* **lifecycle:** remove unused code ([7a9a635](https://github.com/aurelia/aurelia/commit/7a9a635))
* **lifecycle:** improve types and resolve style issues ([7a9a635](https://github.com/aurelia/aurelia/commit/7a9a635))
* **runtime:** fix template controller tests ([7a9a635](https://github.com/aurelia/aurelia/commit/7a9a635))
* **runtime:** get remaining tests working again ([7a9a635](https://github.com/aurelia/aurelia/commit/7a9a635))
* **template-compiler:** fix template controllers on template nodes ([9eb0764](https://github.com/aurelia/aurelia/commit/9eb0764))
* **template-compiler:** make non-bindable customElement instructions siblings of the element instruction ([ad6eeb4](https://github.com/aurelia/aurelia/commit/ad6eeb4))
* **template-compiler:** properly resolve bindable customElement instructions by the registered attribute name ([ad6eeb4](https://github.com/aurelia/aurelia/commit/ad6eeb4))
* **scope:** add bindingContext to overrideContext ([ad6eeb4](https://github.com/aurelia/aurelia/commit/ad6eeb4))
* **binding:** lazy initialize slotNames based on need ([57c07e8](https://github.com/aurelia/aurelia/commit/57c07e8))
* **observation:** make property-accessor synchronous ([57c07e8](https://github.com/aurelia/aurelia/commit/57c07e8))
* **observation:** keep dom target accessors batched ([57c07e8](https://github.com/aurelia/aurelia/commit/57c07e8))
* **resources:** ensure null is returned for non-existing resources ([7a92cd8](https://github.com/aurelia/aurelia/commit/7a92cd8))
* **template-compiler:** correct a few edge cases in target and bindingMode resolution ([7a92cd8](https://github.com/aurelia/aurelia/commit/7a92cd8))
* **template-compiler:** correct handling of kebab-cased custom attributes ([7a92cd8](https://github.com/aurelia/aurelia/commit/7a92cd8))
* **repeat.for:** add missing instruction properties ([7a92cd8](https://github.com/aurelia/aurelia/commit/7a92cd8))


### Performance Improvements:

* **ast:** predefine keyword literals and AccessThis, and reuse them ([7267165](https://github.com/aurelia/aurelia/commit/7267165))
* **expression-parser:** remove unreachable branch ([f67a414](https://github.com/aurelia/aurelia/commit/f67a414))
* **expression-parser:** reuse one ParserState object ([a0c9b0e](https://github.com/aurelia/aurelia/commit/a0c9b0e))
* **expression-parser:** use explicit numeric comparisons for bitwise operators ([197235c](https://github.com/aurelia/aurelia/commit/197235c))
* **repeat:** basic utilization for indexMap to reduce unnecessary processing ([f296d04](https://github.com/aurelia/aurelia/commit/f296d04))
* **template-compiler:** prevent creating unnecessary arrays when there are no attributes ([9eb0764](https://github.com/aurelia/aurelia/commit/9eb0764))
* **element-parser:** use PLATFORM.emptyArray where possible and remove redundant property ([ad6eeb4](https://github.com/aurelia/aurelia/commit/ad6eeb4))
* **template-compiler:** convert parseAttribute to class instance with cache ([ad6eeb4](https://github.com/aurelia/aurelia/commit/ad6eeb4))
* **semantic-model:** use PLATFORM.emptyArray when possible ([ad6eeb4](https://github.com/aurelia/aurelia/commit/ad6eeb4))
* **element-parser:** use PLATFORM.emptyArray when possible ([ad6eeb4](https://github.com/aurelia/aurelia/commit/ad6eeb4))
* **template-compiler:** index the inspect/resolve buffers directly instead of destructuring ([7a92cd8](https://github.com/aurelia/aurelia/commit/7a92cd8))


### Refactorings:

* **binding-context:** explicitly model scope, context and observer lookup (#216) ([c3e3779](https://github.com/aurelia/aurelia/commit/c3e3779))
* **binding:** explicitly model scope, override/bindingctx and observerlookup ([c3e3779](https://github.com/aurelia/aurelia/commit/c3e3779))
* **observer-locator:** use direct lookup from bindingContext if available ([c3e3779](https://github.com/aurelia/aurelia/commit/c3e3779))
* **binding:** use more precise types ([7267165](https://github.com/aurelia/aurelia/commit/7267165))
* **ast:** move common properties back to static declaration ([7267165](https://github.com/aurelia/aurelia/commit/7267165))
* **template-compiler:** cleanup/inline instruction classes ([1e804a0](https://github.com/aurelia/aurelia/commit/1e804a0))
* **binding:** cleanup/shuffle some interfaces accordingly ([f67a414](https://github.com/aurelia/aurelia/commit/f67a414))
* **template-compiler:** cleanup/inline instruction classes ([f67a414](https://github.com/aurelia/aurelia/commit/f67a414))
* **view-factory:** use static maxCacheSize property ([eff5bb7](https://github.com/aurelia/aurelia/commit/eff5bb7))
* **SelectObserver:** adjust SelectValueObserver synchronization (#208) ([ffdf01d](https://github.com/aurelia/aurelia/commit/ffdf01d))
* **expression-parser:** extract enums and util function out into common.ts ([a0c9b0e](https://github.com/aurelia/aurelia/commit/a0c9b0e))
* **repeat:** use templateController decorator and clean everything up ([f296d04](https://github.com/aurelia/aurelia/commit/f296d04))
* **lifecycle:** better naming and types for task api ([7a9a635](https://github.com/aurelia/aurelia/commit/7a9a635))
* **jit:** improve parser registration and attribute testing ([ad6eeb4](https://github.com/aurelia/aurelia/commit/ad6eeb4))
* **attribute-parser:** store raw attribute values in syntax ([ad6eeb4](https://github.com/aurelia/aurelia/commit/ad6eeb4))
* **template-compiler:** decouple entrypoint from internal recursion point ([ad6eeb4](https://github.com/aurelia/aurelia/commit/ad6eeb4))
* **template-compiler:** first step to integrate the semantic model ([ad6eeb4](https://github.com/aurelia/aurelia/commit/ad6eeb4))
* **template-compiler:** initial migration steps to semantic model ([ad6eeb4](https://github.com/aurelia/aurelia/commit/ad6eeb4))
* **template-compiler:** more small tweaks, enable a few more tests ([ad6eeb4](https://github.com/aurelia/aurelia/commit/ad6eeb4))
* **template-compiler:** recognize single value attribute as bindable ([ad6eeb4](https://github.com/aurelia/aurelia/commit/ad6eeb4))
* **template-compiler:** fix plain attribute compilation ([ad6eeb4](https://github.com/aurelia/aurelia/commit/ad6eeb4))
* **template-compiler:** fix template controller / repeater compilation ([ad6eeb4](https://github.com/aurelia/aurelia/commit/ad6eeb4))
* **template-compiler:** fix semicolon-separated attribute bindings ([ad6eeb4](https://github.com/aurelia/aurelia/commit/ad6eeb4))
* **template-compiler:** fix let and textNodes ([ad6eeb4](https://github.com/aurelia/aurelia/commit/ad6eeb4))
* **template-compiler:** fix as-element ([ad6eeb4](https://github.com/aurelia/aurelia/commit/ad6eeb4))
* **template-compiler:** fix surrogates ([ad6eeb4](https://github.com/aurelia/aurelia/commit/ad6eeb4))
* **template-compiler:** fix let.dest ([ad6eeb4](https://github.com/aurelia/aurelia/commit/ad6eeb4))
* **template-compiler:** fix as-element / resourceKey ([ad6eeb4](https://github.com/aurelia/aurelia/commit/ad6eeb4))
* **template-compiler:** fix bindable precedence ([ad6eeb4](https://github.com/aurelia/aurelia/commit/ad6eeb4))
* **template-compiler:** fix slots ([ad6eeb4](https://github.com/aurelia/aurelia/commit/ad6eeb4))
* **template-compiler:** fix nested+sibling template controllers and cleanup the api a bit ([ad6eeb4](https://github.com/aurelia/aurelia/commit/ad6eeb4))
* **template-compiler:** fix let ([ad6eeb4](https://github.com/aurelia/aurelia/commit/ad6eeb4))
* **call:** deprecate confusing $event property ([57c07e8](https://github.com/aurelia/aurelia/commit/57c07e8))
* **binding-command:** reuse specific binding command prototype methods on the default binding command ([7a92cd8](https://github.com/aurelia/aurelia/commit/7a92cd8))
* **template-compiler:** destructure with reused object ([7a92cd8](https://github.com/aurelia/aurelia/commit/7a92cd8))

<a name="0.2.0"></a>
# 0.2.0 (2018-09-18)

### Features:

* **create-element:** experimenting with supporting JSX ([66504c8](https://github.com/aurelia/aurelia/commit/66504c8))
* **compose:** incrementally working towards implementation ([66504c8](https://github.com/aurelia/aurelia/commit/66504c8))
* **view:** remove animations apis from view ([66504c8](https://github.com/aurelia/aurelia/commit/66504c8))
* **renderable:** enable dynamically added children ([66504c8](https://github.com/aurelia/aurelia/commit/66504c8))
* **custom-element:** enable better handling of containerless scenarios ([66504c8](https://github.com/aurelia/aurelia/commit/66504c8))
* **compose:** enable composing of loose views ([66504c8](https://github.com/aurelia/aurelia/commit/66504c8))
* **compose:** support rendering more types ([66504c8](https://github.com/aurelia/aurelia/commit/66504c8))
* **createElement:** support text nodes and targeted instructions ([66504c8](https://github.com/aurelia/aurelia/commit/66504c8))
* **di:** recurse through static registrations to find register methods in more edge cases ([6bc2d4d](https://github.com/aurelia/aurelia/commit/6bc2d4d))
* **template-compiler:** as-element (#146) ([4aa8538](https://github.com/aurelia/aurelia/commit/4aa8538))
* **template-compiler:** as-element ([4aa8538](https://github.com/aurelia/aurelia/commit/4aa8538))
* **Let:** let binding (#132) ([c2a8324](https://github.com/aurelia/aurelia/commit/c2a8324))
* **runtime:** Let binding, priorityInstructions ([c2a8324](https://github.com/aurelia/aurelia/commit/c2a8324))
* **jit:** implement instruction-compiler decorator ([1067e03](https://github.com/aurelia/aurelia/commit/1067e03))
* **runtime:** implement render-strategy decorator ([1067e03](https://github.com/aurelia/aurelia/commit/1067e03))
* **JIT:** template compiler ([d584528](https://github.com/aurelia/aurelia/commit/d584528))
* **TemplateCompiler:** surrogate behavior ([d584528](https://github.com/aurelia/aurelia/commit/d584528))
* **kernel:** add fast camelCase and kebabCase functions with caching ([8debe4f](https://github.com/aurelia/aurelia/commit/8debe4f))
* **binding-context:** add helper for creating a basic scope ([5577a53](https://github.com/aurelia/aurelia/commit/5577a53))
* **dbmonster:** make dbmonster aot example work again (#101) ([9e1eb5a](https://github.com/aurelia/aurelia/commit/9e1eb5a))
* **dbmonster:** make dbmonster aot example work again ([9e1eb5a](https://github.com/aurelia/aurelia/commit/9e1eb5a))
* **examples:** add browserify example ([d803211](https://github.com/aurelia/aurelia/commit/d803211))
* **jit:** move/extend attribute value parsing to the expression parser (#98) ([53864a1](https://github.com/aurelia/aurelia/commit/53864a1))
* **observers:** auto-enable collection observers and make the toggles idempotent ([d6a10b5](https://github.com/aurelia/aurelia/commit/d6a10b5))
* **runtime:** convert with attribute to use render location (#64) ([5830a36](https://github.com/aurelia/aurelia/commit/5830a36))
* **runtime:** convert with attribute to use render location ([5830a36](https://github.com/aurelia/aurelia/commit/5830a36))
* **runtime:** improvements to attribute and element bindable control and common interfaces ([5830a36](https://github.com/aurelia/aurelia/commit/5830a36))
* **templating:** convert replaceable to use render location (#59) ([7d1f8d4](https://github.com/aurelia/aurelia/commit/7d1f8d4))
* **templating:** generalize attribute and element attachable child ([7d1f8d4](https://github.com/aurelia/aurelia/commit/7d1f8d4))
* **templating:** switch replaceable to use render location ([7d1f8d4](https://github.com/aurelia/aurelia/commit/7d1f8d4))
* **binding:** implement ChangeSet (#58) ([144b1c6](https://github.com/aurelia/aurelia/commit/144b1c6))
* **binding:** implement ChangeSet ([144b1c6](https://github.com/aurelia/aurelia/commit/144b1c6))
* **templating:** add the low-level render location abstraction (#57) ([3c9735e](https://github.com/aurelia/aurelia/commit/3c9735e))
* **templating:** add the low-level render location abstraction ([3c9735e](https://github.com/aurelia/aurelia/commit/3c9735e))
* **custom-elements:** define basic abstraction for element projection ([0a17b16](https://github.com/aurelia/aurelia/commit/0a17b16))
* **runtime:** enable getting the custom element behavior... ([0a17b16](https://github.com/aurelia/aurelia/commit/0a17b16))
* **jit:** implement interpolation & iterator (with destructuring) parsing ([8ab2173](https://github.com/aurelia/aurelia/commit/8ab2173))
* **ast:** initial implementation of ForOfStatement for iterating different collection types ([8ab2173](https://github.com/aurelia/aurelia/commit/8ab2173))
* **ast:** add metadata to the AST for ExpressionKind ([8ab2173](https://github.com/aurelia/aurelia/commit/8ab2173))
* **jit:** initial skeleton for customizeable binding commands ([8ab2173](https://github.com/aurelia/aurelia/commit/8ab2173))
* **jit:** simple first implementation for template-compiler ([8ab2173](https://github.com/aurelia/aurelia/commit/8ab2173))
* **repeater:** implement repeater with the new observation logic ([3ad2a6a](https://github.com/aurelia/aurelia/commit/3ad2a6a))
* **repeater:** implement repeater with the new observation logic ([1893be3](https://github.com/aurelia/aurelia/commit/1893be3))
* **observation:** add improved collection observers ([3222e4d](https://github.com/aurelia/aurelia/commit/3222e4d))
* **observation:** add improved collection observers ([383b052](https://github.com/aurelia/aurelia/commit/383b052))
* **rendering-engine:** enable passing cache size through ([91b4365](https://github.com/aurelia/aurelia/commit/91b4365))
* **templating:** add property name to bindable info ([a9e715c](https://github.com/aurelia/aurelia/commit/a9e715c))
* **runtime:** making resources into an explicit concept again ([559e008](https://github.com/aurelia/aurelia/commit/559e008))
* **template-compiler:** a proper abstraction for resources ([3d62b7a](https://github.com/aurelia/aurelia/commit/3d62b7a))
* **di:** add optional resolver ([7d7cbeb](https://github.com/aurelia/aurelia/commit/7d7cbeb))
* **all:** prepare for template compiler integration ([b314260](https://github.com/aurelia/aurelia/commit/b314260))
* **requirejs:** implemented plugins for require.js ([e6b7087](https://github.com/aurelia/aurelia/commit/e6b7087))
* **task-queue:** sync with latest from current ([bf242a7](https://github.com/aurelia/aurelia/commit/bf242a7))
* **component:** enable differentiating types ([7b1defa](https://github.com/aurelia/aurelia/commit/7b1defa))
* **DI:** plumb IRegistry throughout and rename handlers to factories ([a9dc8c9](https://github.com/aurelia/aurelia/commit/a9dc8c9))
* **templating:** express readonly intent in many interfaces ([5d28fb1](https://github.com/aurelia/aurelia/commit/5d28fb1))
* **component:** options param for hydrate API ([57b0902](https://github.com/aurelia/aurelia/commit/57b0902))
* **di:** update to latest TS and improve DI sigs ([76d95a3](https://github.com/aurelia/aurelia/commit/76d95a3))
* **lifecycle:** introduce encapsulation source ([59595da](https://github.com/aurelia/aurelia/commit/59595da))
* **ast:** removed chain ast node ([592f036](https://github.com/aurelia/aurelia/commit/592f036))
* **computed:** handle all combintations of getters and setters ([fb71631](https://github.com/aurelia/aurelia/commit/fb71631))
* **binding:** automatic computed observation ([eff6fe2](https://github.com/aurelia/aurelia/commit/eff6fe2))
* **expressions:** add simple parser ([41eeba6](https://github.com/aurelia/aurelia/commit/41eeba6))
* **DI:** lots of new apis, including transformers ([2c8f08f](https://github.com/aurelia/aurelia/commit/2c8f08f))
* **repeat:** port repeat implementation ([147f0f1](https://github.com/aurelia/aurelia/commit/147f0f1))
* **component:** enable $children property ([750f984](https://github.com/aurelia/aurelia/commit/750f984))
* **view:** finished first pass content view and observer work ([3927f90](https://github.com/aurelia/aurelia/commit/3927f90))
* **shadow-dom:** getting closer to consistent child observation ([02d71d6](https://github.com/aurelia/aurelia/commit/02d71d6))
* **pal:** working on view abstractions ([db361dc](https://github.com/aurelia/aurelia/commit/db361dc))
* **signals:** port from vCurrent ([49ea175](https://github.com/aurelia/aurelia/commit/49ea175))
* **with:** port the with template controller from vCurrent ([4b39aae](https://github.com/aurelia/aurelia/commit/4b39aae))
* **update-trigger-binding-behavior:** port from vCurrent ([1aa6d5b](https://github.com/aurelia/aurelia/commit/1aa6d5b))
* **throttle-binding-behavior:** port from vCurrent ([7b1fc51](https://github.com/aurelia/aurelia/commit/7b1fc51))
* **self-binding-behavior:** port from vCurrent ([2f22815](https://github.com/aurelia/aurelia/commit/2f22815))
* **sanitize:** port from vCurrent ([e0c08cd](https://github.com/aurelia/aurelia/commit/e0c08cd))
* **replaceable:** port from vCurrent ([aefee1d](https://github.com/aurelia/aurelia/commit/aefee1d))
* **debounce-binding-behavior:** port from vCurrent ([d042d6f](https://github.com/aurelia/aurelia/commit/d042d6f))
* **binding-mode-behaviors:** port from vCurrent ([7af5c3b](https://github.com/aurelia/aurelia/commit/7af5c3b))
* **attr-binding-behavior:** port from vCurrent ([1d3478e](https://github.com/aurelia/aurelia/commit/1d3478e))
* **templating:** implement compose element ([48f91d3](https://github.com/aurelia/aurelia/commit/48f91d3))
* **di:** extract debug messages to debug module ([4bef6f8](https://github.com/aurelia/aurelia/commit/4bef6f8))
* **templating:** templated part replacement ([ee58d8d](https://github.com/aurelia/aurelia/commit/ee58d8d))
* **visual:** move animation from view slot to visual ([655f443](https://github.com/aurelia/aurelia/commit/655f443))
* **slots:** reduce duplication in view slot and shadow slot ([5e75eab](https://github.com/aurelia/aurelia/commit/5e75eab))
* **lifecycle:** lots of work on view slot and component lifecycle ([e7677b0](https://github.com/aurelia/aurelia/commit/e7677b0))
* **view-slot:** add APIs for auto cache return ([a54aa51](https://github.com/aurelia/aurelia/commit/a54aa51))
* **all:** synchronous and properly ordered attach/detach lifecycle ([eb26d92](https://github.com/aurelia/aurelia/commit/eb26d92))
* **visual:** making visual caching an implementation detail ([5d9b669](https://github.com/aurelia/aurelia/commit/5d9b669))
* **view-factory:** enable visual caching ([5356de5](https://github.com/aurelia/aurelia/commit/5356de5))
* **templating:** improve imperative component APIs ([97b2c0a](https://github.com/aurelia/aurelia/commit/97b2c0a))
* **templating:** enable HTML-only components ([e5cbbac](https://github.com/aurelia/aurelia/commit/e5cbbac))
* **templating:** enable value converters and binding behaviors ([950a4ca](https://github.com/aurelia/aurelia/commit/950a4ca))
* **svg:** enable full optional svg binding ([b92d80e](https://github.com/aurelia/aurelia/commit/b92d80e))
* **debug:** improved expression debugging ([e412d0f](https://github.com/aurelia/aurelia/commit/e412d0f))
* **configuration:** use named configuration export objects throughout ([144b79c](https://github.com/aurelia/aurelia/commit/144b79c))
* **debug:** introduce debug mode ([92a5e34](https://github.com/aurelia/aurelia/commit/92a5e34))
* **task-queue:** make debug mode for task queue ([eb46814](https://github.com/aurelia/aurelia/commit/eb46814))
* **component:** introduce runtime characteristics ([b072535](https://github.com/aurelia/aurelia/commit/b072535))
* **bindable:** finish bindable implementation and convert if ([ecf6a7f](https://github.com/aurelia/aurelia/commit/ecf6a7f))
* **decorators:** add bindable ([bfcb9c6](https://github.com/aurelia/aurelia/commit/bfcb9c6))
* **template:** support component recursion ([9632579](https://github.com/aurelia/aurelia/commit/9632579))
* **component:** enabling configuring containerless ([bde07aa](https://github.com/aurelia/aurelia/commit/bde07aa))
* **component:** enable configuration shadow DOM ([82e1bd6](https://github.com/aurelia/aurelia/commit/82e1bd6))
* **templating:** v0 custom attribute support ([e946acf](https://github.com/aurelia/aurelia/commit/e946acf))
* **decorators:** add DI decorators ([aaaa353](https://github.com/aurelia/aurelia/commit/aaaa353))
* **aurelia:** remove unnecessary api ([0f558b4](https://github.com/aurelia/aurelia/commit/0f558b4))
* **main:** improve startup configuration ([e4b5c83](https://github.com/aurelia/aurelia/commit/e4b5c83))
* **all:** view engine and DI throughout ([4e53884](https://github.com/aurelia/aurelia/commit/4e53884))
* **di:** ported DI ([0002dae](https://github.com/aurelia/aurelia/commit/0002dae))
* **aurelia:** improve startup api ([36e23db](https://github.com/aurelia/aurelia/commit/36e23db))
* **main:** demonstrate global resources ([d360004](https://github.com/aurelia/aurelia/commit/d360004))
* **view-resources:** implemented root and view-scoped resources ([0e58601](https://github.com/aurelia/aurelia/commit/0e58601))
* **expression:** create expression facade ([4a2bf59](https://github.com/aurelia/aurelia/commit/4a2bf59))
* **shadow-dom:** finish fixing up emulation ([6a2ac31](https://github.com/aurelia/aurelia/commit/6a2ac31))
* **designtime:** example of how designtime augments runtime ([b5d0a00](https://github.com/aurelia/aurelia/commit/b5d0a00))
* **shadow-dom:** add native shadow dom support ([551ff15](https://github.com/aurelia/aurelia/commit/551ff15))
* **content-projection:** added simple demo ([c7faa74](https://github.com/aurelia/aurelia/commit/c7faa74))
* **shadow-dom:** continuing to work towards content projection ([32a1784](https://github.com/aurelia/aurelia/commit/32a1784))
* **shadow-dom:** first steps towards content projection ([2d5fb90](https://github.com/aurelia/aurelia/commit/2d5fb90))
* **component:** add support for containerless elements ([d06f731](https://github.com/aurelia/aurelia/commit/d06f731))
* **aurelia:** cleaning up the Aurelia gateway class ([63834ca](https://github.com/aurelia/aurelia/commit/63834ca))
* **compiled-element:** no view components ([51f17f5](https://github.com/aurelia/aurelia/commit/51f17f5))
* **compiled-element:** enabled per-instance views for components ([16e89fe](https://github.com/aurelia/aurelia/commit/16e89fe))
* **compiled-element:** enable custom element property setting ([457857a](https://github.com/aurelia/aurelia/commit/457857a))
* **binding:** implement call binding command ([da5b957](https://github.com/aurelia/aurelia/commit/da5b957))
* **compiled-element:** enable delegate and capture listeners ([9203f39](https://github.com/aurelia/aurelia/commit/9203f39))
* **compiled-element:** custom attributes and from view bindings ([083790b](https://github.com/aurelia/aurelia/commit/083790b))
* **compiled-element:** add template controllers and view factories ([06c0855](https://github.com/aurelia/aurelia/commit/06c0855))
* **app2:** add configuration for custom element in view ([5fc6f9b](https://github.com/aurelia/aurelia/commit/5fc6f9b))
* **compiled-element:** support custom elements ([8974fc1](https://github.com/aurelia/aurelia/commit/8974fc1))
* **name-tag2:** enable all features needed for name-tag ([6d88055](https://github.com/aurelia/aurelia/commit/6d88055))
* **compiled-element:** hooking up more lifecycle events ([9fc1682](https://github.com/aurelia/aurelia/commit/9fc1682))
* **compiled-element:** setup getter/setter for observables ([6439900](https://github.com/aurelia/aurelia/commit/6439900))
* **compiled-element:** more generic implementation ([ec58973](https://github.com/aurelia/aurelia/commit/ec58973))
* **app2:** a basic idea for an altnerative approach to runtime ([6340643](https://github.com/aurelia/aurelia/commit/6340643))
* **observers:** building in self observers and value coercion ([32665f4](https://github.com/aurelia/aurelia/commit/32665f4))
* **templating:** working on component lifecycle ([8d01b4c](https://github.com/aurelia/aurelia/commit/8d01b4c))
* **binding:** working on improved binding lifecycle ([f8f5fb9](https://github.com/aurelia/aurelia/commit/f8f5fb9))
* **binding:** add support for ref bindings to framework ([4029fae](https://github.com/aurelia/aurelia/commit/4029fae))
* **aurelia:** better app start/stop model ([fd0e9fb](https://github.com/aurelia/aurelia/commit/fd0e9fb))
* **compiler:** basic compilation ([df15bd5](https://github.com/aurelia/aurelia/commit/df15bd5))
* **ast:** add typings ([fa7e744](https://github.com/aurelia/aurelia/commit/fa7e744))
* **visual:** extract base class for all dynamic visuals to reduce duplication ([a6c67ae](https://github.com/aurelia/aurelia/commit/a6c67ae))
* **app:** add else demo ([f673743](https://github.com/aurelia/aurelia/commit/f673743))
* **if:** rename api to link if/else ([3e582b8](https://github.com/aurelia/aurelia/commit/3e582b8))
* **if:** is this how we want to handle internal property change events? ([3394769](https://github.com/aurelia/aurelia/commit/3394769))
* **templating:** working on views, components, slots ([e250ac4](https://github.com/aurelia/aurelia/commit/e250ac4))
* **templating:** adding some basic primitives ([f35534f](https://github.com/aurelia/aurelia/commit/f35534f))
* **framework:** proper support for text node interpolation ([11227a1](https://github.com/aurelia/aurelia/commit/11227a1))
* **aurelia:** better startup ([deac3a8](https://github.com/aurelia/aurelia/commit/deac3a8))
* **all:** converting much more over to real Aurelia code ([46ebbad](https://github.com/aurelia/aurelia/commit/46ebbad))
* **framework:** using more real Aurelia code from the AST ([49cd5a4](https://github.com/aurelia/aurelia/commit/49cd5a4))
* **framework:** porting pieces needed for observer locator ([b8a264f](https://github.com/aurelia/aurelia/commit/b8a264f))


### Bug Fixes:

* **custom-element:** address typo in method check ([66504c8](https://github.com/aurelia/aurelia/commit/66504c8))
* **custom-element:** remove special $child prop ([66504c8](https://github.com/aurelia/aurelia/commit/66504c8))
* **compose:** correct inject metadata ([66504c8](https://github.com/aurelia/aurelia/commit/66504c8))
* **di:** invoke correct method on array strategy resolver ([6bc2d4d](https://github.com/aurelia/aurelia/commit/6bc2d4d))
* **di:** invalidate Object keys to help diagnose invalid design:paramTypes ([6bc2d4d](https://github.com/aurelia/aurelia/commit/6bc2d4d))
* **di:** add a non-any type alternative to the InterfaceSymbol<T> so that container.get() returns correctly typed instances ([6bc2d4d](https://github.com/aurelia/aurelia/commit/6bc2d4d))
* **let:** cleanup ([c2a8324](https://github.com/aurelia/aurelia/commit/c2a8324))
* **template compiler:** slot signal ([c2a8324](https://github.com/aurelia/aurelia/commit/c2a8324))
* **observer-locator:** add collection length back in, fix precedence, add tests (#139) ([581a680](https://github.com/aurelia/aurelia/commit/581a680))
* **observer-locator:** add collection length back in, fix precedence, add tests ([581a680](https://github.com/aurelia/aurelia/commit/581a680))
* **length-observer:** add subscribe method ([581a680](https://github.com/aurelia/aurelia/commit/581a680))
* **runtime-behavior:** pass target flags to getterSetter observer ([cf8390b](https://github.com/aurelia/aurelia/commit/cf8390b))
* **binding:** report flags instead of nonexistent context ([cf8390b](https://github.com/aurelia/aurelia/commit/cf8390b))
* **examples:** correct versions ([1b7c764](https://github.com/aurelia/aurelia/commit/1b7c764))
* **template-compiler:** workaround for DI issue ([1067e03](https://github.com/aurelia/aurelia/commit/1067e03))
* **binding-command:** rename file ([1067e03](https://github.com/aurelia/aurelia/commit/1067e03))
* **binding-command:** pass correct bindingType to parser ([1067e03](https://github.com/aurelia/aurelia/commit/1067e03))
* **template-compiler:** template controller instrs order, linking (#129) ([d2f632f](https://github.com/aurelia/aurelia/commit/d2f632f))
* **observer:** store obj and propertyKey ([d584528](https://github.com/aurelia/aurelia/commit/d584528))
* **template-compiler:** merge camel-kebab changes and reuse platform functions ([d584528](https://github.com/aurelia/aurelia/commit/d584528))
* **template-compiler:** fix slip-up with attribute name ([d584528](https://github.com/aurelia/aurelia/commit/d584528))
* **event-manager:** use spec-compliant composedPath for shadowdom / fix linting ([6381c5b](https://github.com/aurelia/aurelia/commit/6381c5b))
* **event-manager:** fix .delegate and .capture, and add unit tests ([6381c5b](https://github.com/aurelia/aurelia/commit/6381c5b))
* **typings:** export event subscribers ([6381c5b](https://github.com/aurelia/aurelia/commit/6381c5b))
* **event-manager:** export listener tracker to resolve typing issues ([6381c5b](https://github.com/aurelia/aurelia/commit/6381c5b))
* **tsconfig:** correct extends path ([797674f](https://github.com/aurelia/aurelia/commit/797674f))
* **e2e-benchmark:** simplify markers and use setTimeout to include render time ([8a8b619](https://github.com/aurelia/aurelia/commit/8a8b619))
* **jit-aurelia-cli:** apply huochunpeng's fixes ([9517feb](https://github.com/aurelia/aurelia/commit/9517feb))
* **jit-aurelia-cli:** fix html file ([9517feb](https://github.com/aurelia/aurelia/commit/9517feb))
* **e2e-benchmark:** fix vcurrent ([a3db3a8](https://github.com/aurelia/aurelia/commit/a3db3a8))
* **e2e-benchmark:** add top-level deps ([a3db3a8](https://github.com/aurelia/aurelia/commit/a3db3a8))
* **e2e-benchmark:** various fixes to make it all work ([a3db3a8](https://github.com/aurelia/aurelia/commit/a3db3a8))
* **binding-resources:** lift register methods ([5577a53](https://github.com/aurelia/aurelia/commit/5577a53))
* **custom-attribute:** life lifecycle methods ([5577a53](https://github.com/aurelia/aurelia/commit/5577a53))
* **custom-element:** lift lifecycle methods ([5577a53](https://github.com/aurelia/aurelia/commit/5577a53))
* **di:** convert invokers to an array (#106) ([9236dec](https://github.com/aurelia/aurelia/commit/9236dec))
* **runtime:** convert if/else to use render location (#96) ([22b32b5](https://github.com/aurelia/aurelia/commit/22b32b5))
* **runtime:** convert if/else to use render location ([22b32b5](https://github.com/aurelia/aurelia/commit/22b32b5))
* **if/else:** set default value ([22b32b5](https://github.com/aurelia/aurelia/commit/22b32b5))
* **binding-behavior:** fix BindingModeBehavior ([bb32291](https://github.com/aurelia/aurelia/commit/bb32291))
* **binding-behavior:** fix debounce, add unit tests ([bb32291](https://github.com/aurelia/aurelia/commit/bb32291))
* **repeat:** reuse views when re-binding and allow null observer for non-collection iterables ([9e1eb5a](https://github.com/aurelia/aurelia/commit/9e1eb5a))
* **jit-browserify:** build before serve so the e2e tests can run ([d803211](https://github.com/aurelia/aurelia/commit/d803211))
* **expression-parser:** use a separate lookup for non-interpolation attribute values ([53864a1](https://github.com/aurelia/aurelia/commit/53864a1))
* **template-compiler:** use the target name instead of full name + fix tests ([53864a1](https://github.com/aurelia/aurelia/commit/53864a1))
* **template-compiler:** add dest to one-time instruction ([1ddff95](https://github.com/aurelia/aurelia/commit/1ddff95))
* **value-attribute-observer:** don't notify subscribers if value hasn't changed (#95) ([30e1099](https://github.com/aurelia/aurelia/commit/30e1099))
* **element-observation:** fix binding flags ([4dc6cb8](https://github.com/aurelia/aurelia/commit/4dc6cb8))
* **checked-observer:** fix fromValue updates / add unit tests ([4dc6cb8](https://github.com/aurelia/aurelia/commit/4dc6cb8))
* **element-observation:** remove error-causing notify ([4dc6cb8](https://github.com/aurelia/aurelia/commit/4dc6cb8))
* **runtime:** remove lazy bindable location and encapsulate observer (#90) ([6607a14](https://github.com/aurelia/aurelia/commit/6607a14))
* **runtime:** remove lazy bindable location and encapsulate observer ([6607a14](https://github.com/aurelia/aurelia/commit/6607a14))
* **event-manager:** use uppercase tagname ([08d4bac](https://github.com/aurelia/aurelia/commit/08d4bac))
* **jit-parcel:** remove else for now, fix instructions ([d6a10b5](https://github.com/aurelia/aurelia/commit/d6a10b5))
* **template-compiler:** wrap the nodes in a fragment ([d6a10b5](https://github.com/aurelia/aurelia/commit/d6a10b5))
* **jit-parcel:** remove path mappings from tsconfig ([d6a10b5](https://github.com/aurelia/aurelia/commit/d6a10b5))
* **template-compiler:** use firstElementChild instead of wrapper ([d6a10b5](https://github.com/aurelia/aurelia/commit/d6a10b5))
* **template-compiler:** various small tweaks and fixes, make example work ([d6a10b5](https://github.com/aurelia/aurelia/commit/d6a10b5))
* **jit-parcel:** make the example work with something simple ([d6a10b5](https://github.com/aurelia/aurelia/commit/d6a10b5))
* **aurelia:** set isStarted=true after tasks have finished ([d6a10b5](https://github.com/aurelia/aurelia/commit/d6a10b5))
* **e2e:** move publish into e2e job ([d6a10b5](https://github.com/aurelia/aurelia/commit/d6a10b5))
* **ci:** fix typo ([d6a10b5](https://github.com/aurelia/aurelia/commit/d6a10b5))
* **ci:** set the correct path before each cmd ([d6a10b5](https://github.com/aurelia/aurelia/commit/d6a10b5))
* **ci:** try a different approach for the workspaces ([d6a10b5](https://github.com/aurelia/aurelia/commit/d6a10b5))
* **runtime:** dry up bindable callback behavior (#71) ([11b26a5](https://github.com/aurelia/aurelia/commit/11b26a5))
* **runtime:** correct observer current value update and callback ordering ([5830a36](https://github.com/aurelia/aurelia/commit/5830a36))
* **runtime:** ensure all bindable callback slots are initialized ([5830a36](https://github.com/aurelia/aurelia/commit/5830a36))
* **runtime-behavior:** remove use of Toggle in favor of simple boolean ([5830a36](https://github.com/aurelia/aurelia/commit/5830a36))
* **dom:** append nodes to the correct thing (doh) (#66) ([c7a8285](https://github.com/aurelia/aurelia/commit/c7a8285))
* **repeat:** adjust repeater logic + tests to new mutation batching mechanism ([c2a5e82](https://github.com/aurelia/aurelia/commit/c2a5e82))
* **runtime:** interface clarity (#61) ([c4e26d3](https://github.com/aurelia/aurelia/commit/c4e26d3))
* **runtime:** correct kernel import ([c4e26d3](https://github.com/aurelia/aurelia/commit/c4e26d3))
* **runtime:** make renderable and view factories interfaces have no default ([c4e26d3](https://github.com/aurelia/aurelia/commit/c4e26d3))
* **observation:** fix subscriber typing ([144b1c6](https://github.com/aurelia/aurelia/commit/144b1c6))
* **dom:** correct TS error ([3c9735e](https://github.com/aurelia/aurelia/commit/3c9735e))
* **templating:** address trivial errors when removing emulation ([0a17b16](https://github.com/aurelia/aurelia/commit/0a17b16))
* **templating:** remove shadow dom from compose element ([0a17b16](https://github.com/aurelia/aurelia/commit/0a17b16))
* **all:** last few corrections from the merge ([0a17b16](https://github.com/aurelia/aurelia/commit/0a17b16))
* **runtime:** various fixes related to compose ([0a17b16](https://github.com/aurelia/aurelia/commit/0a17b16))
* **all:** correct types/properties and fix unit tests ([8ab2173](https://github.com/aurelia/aurelia/commit/8ab2173))
* **template-compiler:** small fixes, setup first simple integration tests ([8ab2173](https://github.com/aurelia/aurelia/commit/8ab2173))
* **kernel:** scripts working ([9302580](https://github.com/aurelia/aurelia/commit/9302580))
* **all:** lots of path fixes and a few typing fixes, make sure everything builds correctly ([9302580](https://github.com/aurelia/aurelia/commit/9302580))
* **test:** make all the tests run via lerna ([9302580](https://github.com/aurelia/aurelia/commit/9302580))
* **observation:** add unit tests for map/set observation & fix some issues ([7ad02c4](https://github.com/aurelia/aurelia/commit/7ad02c4))
* **DOM:** accidental import add ([7064c0f](https://github.com/aurelia/aurelia/commit/7064c0f))
* **ci:** fix path ([3271c4c](https://github.com/aurelia/aurelia/commit/3271c4c))
* **signals:** correct argument count ([dec74e8](https://github.com/aurelia/aurelia/commit/dec74e8))
* **binding/resources:** update bindingBehaviors with flags and new bindingMode ([1b7c345](https://github.com/aurelia/aurelia/commit/1b7c345))
* **coverage:** hacky workaround to fix the dtd url for cobertura ([a293f64](https://github.com/aurelia/aurelia/commit/a293f64))
* **test-dbmonster:** do not require lifecycles for views ([f9e3be3](https://github.com/aurelia/aurelia/commit/f9e3be3))
* **repeat-strategy-array:** missing visual type results in bad property ([a569ddc](https://github.com/aurelia/aurelia/commit/a569ddc))
* **render-slot:** correct insertion index ([f9eed7c](https://github.com/aurelia/aurelia/commit/f9eed7c))
* **render-slot:** ensure that after insert, the render operation switches back to add ([4cda527](https://github.com/aurelia/aurelia/commit/4cda527))
* **test-dbmonster:** adding missing whitespace ([fbcb9c9](https://github.com/aurelia/aurelia/commit/fbcb9c9))
* **platform:** improve node and strict mode global support ([83e772a](https://github.com/aurelia/aurelia/commit/83e772a))
* **resource:** make name readonly ([0d8a58c](https://github.com/aurelia/aurelia/commit/0d8a58c))
* **name-tag.html:** fix some incorrect markup ([623ae30](https://github.com/aurelia/aurelia/commit/623ae30))
* **svg:** fix typo in svg analyzer ([73aa471](https://github.com/aurelia/aurelia/commit/73aa471))
* **demo:** add html for compiled templates ([e1eff3a](https://github.com/aurelia/aurelia/commit/e1eff3a))
* **component:** incorrect pluralization ([412cacd](https://github.com/aurelia/aurelia/commit/412cacd))
* **component:** reduce code and fix variable bug in helper ([2a16af3](https://github.com/aurelia/aurelia/commit/2a16af3))
* **component:** correct slot type ([a53514d](https://github.com/aurelia/aurelia/commit/a53514d))
* **repeat:** sync with Aurelia current fixes ([c62bcda](https://github.com/aurelia/aurelia/commit/c62bcda))
* **unparser:** update prefix to unary naming ([bd8228e](https://github.com/aurelia/aurelia/commit/bd8228e))
* **parser:** remove unnecessary cache check ([c6ee36c](https://github.com/aurelia/aurelia/commit/c6ee36c))
* **dom:** improve INode interface symbol definition. ([662af7e](https://github.com/aurelia/aurelia/commit/662af7e))
* **shadow-dom:** shrink api ([82d3d6b](https://github.com/aurelia/aurelia/commit/82d3d6b))
* **task-queue:** remove use of setImmediate for throwing errors ([e7e75f2](https://github.com/aurelia/aurelia/commit/e7e75f2))
* **component:** simplify and fix faulty slotted content ([fada3d6](https://github.com/aurelia/aurelia/commit/fada3d6))
* **shadow-dom:** refer to object by name ([9e6cefc](https://github.com/aurelia/aurelia/commit/9e6cefc))
* **binding-behavior/value-converter:** correct registration ([314445d](https://github.com/aurelia/aurelia/commit/314445d))
* **shadow-dom:** add missing marker for template controllers ([d064914](https://github.com/aurelia/aurelia/commit/d064914))
* **view-engine:** element registration from pal ([2f43193](https://github.com/aurelia/aurelia/commit/2f43193))
* **view-slot:** remove bogus import ([015f553](https://github.com/aurelia/aurelia/commit/015f553))
* **view-slot:** improve some typings ([c38cf4e](https://github.com/aurelia/aurelia/commit/c38cf4e))
* **component/visual:** lifecycle hardening and timing fixes ([1bc219e](https://github.com/aurelia/aurelia/commit/1bc219e))
* **visual:** make lifecycle methods safe to call regardless of state ([2cb2e4c](https://github.com/aurelia/aurelia/commit/2cb2e4c))
* **visual/slot:** working on view slots, visuals and if/else ([49c5d4d](https://github.com/aurelia/aurelia/commit/49c5d4d))
* **select-value-observer:** pull fixes from current Aurelia ([50a3b6a](https://github.com/aurelia/aurelia/commit/50a3b6a))
* **di:** tighten up typing on createInterface ([970b434](https://github.com/aurelia/aurelia/commit/970b434))
* **aurelia:** enable apps after framework start ([3a14557](https://github.com/aurelia/aurelia/commit/3a14557))
* **bindable:** more corrections for scenarios ([f3db68f](https://github.com/aurelia/aurelia/commit/f3db68f))
* **bindable:** enable decorator with and w/o parens ([7c276a2](https://github.com/aurelia/aurelia/commit/7c276a2))
* **aurelia:** naming for consistency ([405e76c](https://github.com/aurelia/aurelia/commit/405e76c))
* **designtime:** flix the assignment ([e766aa8](https://github.com/aurelia/aurelia/commit/e766aa8))
* **shadow-dom:** improvements to types ([5b35af8](https://github.com/aurelia/aurelia/commit/5b35af8))
* **compiled-element:** make templates a string in the config ([44b342e](https://github.com/aurelia/aurelia/commit/44b342e))
* **compiled-element:** correct lifecycle callback name ([4ca3b6c](https://github.com/aurelia/aurelia/commit/4ca3b6c))
* **demo:** correct html ([44f81ed](https://github.com/aurelia/aurelia/commit/44f81ed))
* **app:** make $observers non-enumerable ([48bd5b1](https://github.com/aurelia/aurelia/commit/48bd5b1))
* **generated:** comment out incomplete code ([1cfaf08](https://github.com/aurelia/aurelia/commit/1cfaf08))
* **If:** some fixes to if and template controller generated code ([4320e2c](https://github.com/aurelia/aurelia/commit/4320e2c))
* **if:** lots of fixes to if, binding order and view slot ([630bb33](https://github.com/aurelia/aurelia/commit/630bb33))
* **name-tag:** set correct defaults ([b90359d](https://github.com/aurelia/aurelia/commit/b90359d))
* **checked-observer:** update observer property name ([3474373](https://github.com/aurelia/aurelia/commit/3474373))
* **framework:** correct binding assign call ([7a3aae1](https://github.com/aurelia/aurelia/commit/7a3aae1))


### Performance Improvements:

* **ast:** various small perf tweaks / cleanup redundancies ([acf9ebc](https://github.com/aurelia/aurelia/commit/acf9ebc))
* **ast:** first evaluate, then connect ([acf9ebc](https://github.com/aurelia/aurelia/commit/acf9ebc))
* **binding:** remove unnecessary work / cleanup ([8a8b619](https://github.com/aurelia/aurelia/commit/8a8b619))
* **event-manager:** remove unnecessary code ([b635016](https://github.com/aurelia/aurelia/commit/b635016))
* **computed:** add computed caching ([92e9132](https://github.com/aurelia/aurelia/commit/92e9132))


### Refactorings:

* **di:** append new resolvers on existing keys to a single array strategy resolver instead of nesting them ([6bc2d4d](https://github.com/aurelia/aurelia/commit/6bc2d4d))
* **Let:** add LetElementInstruction ([c2a8324](https://github.com/aurelia/aurelia/commit/c2a8324))
* **template-compiler:** move stuff around / fix various edge cases (#134) ([5920299](https://github.com/aurelia/aurelia/commit/5920299))
* **template-compiler:** move stuff around / fix various edge cases ([5920299](https://github.com/aurelia/aurelia/commit/5920299))
* **template-compiler:** hoist attribute inspection array / fix tests ([5920299](https://github.com/aurelia/aurelia/commit/5920299))
* **template-compiler:** various fixes and cleanups ([1067e03](https://github.com/aurelia/aurelia/commit/1067e03))
* **template-compiler:** move binding commands to decorators ([1067e03](https://github.com/aurelia/aurelia/commit/1067e03))
* **binding-command:** add handles method ([1067e03](https://github.com/aurelia/aurelia/commit/1067e03))
* **all:** remove viewslot (#123) ([fc9cbff](https://github.com/aurelia/aurelia/commit/fc9cbff))
* **bindable:** use platform.kebabCase ([8debe4f](https://github.com/aurelia/aurelia/commit/8debe4f))
* **ast:** switch while loops to for loops (same perf, more readable) ([acf9ebc](https://github.com/aurelia/aurelia/commit/acf9ebc))
* **binding:** convert subscriber-collection to decorator for sync and async ([8a8b619](https://github.com/aurelia/aurelia/commit/8a8b619))
* **view:** increase cohesion of view code (#111) ([2ccc770](https://github.com/aurelia/aurelia/commit/2ccc770))
* **runtime:** lift resource methods (#107) ([5577a53](https://github.com/aurelia/aurelia/commit/5577a53))
* **if/else:** some internal refactoring ([22b32b5](https://github.com/aurelia/aurelia/commit/22b32b5))
* **if/else:** remove some more duplication ([22b32b5](https://github.com/aurelia/aurelia/commit/22b32b5))
* **parser:** extract template/object/array literal parsing into functions ([53864a1](https://github.com/aurelia/aurelia/commit/53864a1))
* **jit:** move interpolation parsing to the expression parser ([53864a1](https://github.com/aurelia/aurelia/commit/53864a1))
* **expression-parser:** make bindingType mandatory and pass the correct types to the parser everywhere ([53864a1](https://github.com/aurelia/aurelia/commit/53864a1))
* **template-compiler:** make compiler flow a bit more logical ([53864a1](https://github.com/aurelia/aurelia/commit/53864a1))
* **instructions:** change number type to string (#97) ([1ddff95](https://github.com/aurelia/aurelia/commit/1ddff95))
* **instructions:** change number type to string, make const enum ([1ddff95](https://github.com/aurelia/aurelia/commit/1ddff95))
* **binding:** decouple BindingFlags.context from subscribers ([4dc6cb8](https://github.com/aurelia/aurelia/commit/4dc6cb8))
* **binding-flags:** cleanup unused flags ([4dc6cb8](https://github.com/aurelia/aurelia/commit/4dc6cb8))
* **binding-flags:** add fromFlushChanges to reduce batching redundancy, and expand the zeroes ([4dc6cb8](https://github.com/aurelia/aurelia/commit/4dc6cb8))
* **binding-flags:** rename binding-flags ([4dc6cb8](https://github.com/aurelia/aurelia/commit/4dc6cb8))
* **property-observation:** improve parameter naming ([6607a14](https://github.com/aurelia/aurelia/commit/6607a14))
* **dom:** use uppercase tag names (#88) ([08d4bac](https://github.com/aurelia/aurelia/commit/08d4bac))
* **dom:** use uppercase tag names ([08d4bac](https://github.com/aurelia/aurelia/commit/08d4bac))
* **dom:** remove normalizedTagName ([08d4bac](https://github.com/aurelia/aurelia/commit/08d4bac))
* **all:** improving a couple of method names related to resources (#70) ([49484e3](https://github.com/aurelia/aurelia/commit/49484e3))
* **all:** more flags (#69) ([9e29f42](https://github.com/aurelia/aurelia/commit/9e29f42))
* **all:** more flags ([9e29f42](https://github.com/aurelia/aurelia/commit/9e29f42))
* **binding-flags:** rename and add clarifying comments ([9e29f42](https://github.com/aurelia/aurelia/commit/9e29f42))
* **binding-flags:** change context to origin ([9e29f42](https://github.com/aurelia/aurelia/commit/9e29f42))
* **repeater:** use render-location instead of view-slot / general cleanup ([6889328](https://github.com/aurelia/aurelia/commit/6889328))
* **repeater:** first implementation step for ForOfStatement ([6889328](https://github.com/aurelia/aurelia/commit/6889328))
* **binding:** move the responsibility of batching target mutations to the target observers ([c2a5e82](https://github.com/aurelia/aurelia/commit/c2a5e82))
* **observation:** move all element observers to element-observation ([c2a5e82](https://github.com/aurelia/aurelia/commit/c2a5e82))
* **class-observer:** update class-observer to the new mutation batching mechanism ([c2a5e82](https://github.com/aurelia/aurelia/commit/c2a5e82))
* **checked-observer:** update checked-observer to the new mutation batching mechanism ([c2a5e82](https://github.com/aurelia/aurelia/commit/c2a5e82))
* **select-value-observer:** update select-value-observer to the new mutation batching mechanism ([c2a5e82](https://github.com/aurelia/aurelia/commit/c2a5e82))
* **observers:** rename/move target accessors, cleanup typings, fix linting errors ([c2a5e82](https://github.com/aurelia/aurelia/commit/c2a5e82))
* **target-accessors:** remove redundant previousValue ([c2a5e82](https://github.com/aurelia/aurelia/commit/c2a5e82))
* **observers:** move from 'hasChanges' to 'this.oldValue !== currentValue' ([c2a5e82](https://github.com/aurelia/aurelia/commit/c2a5e82))
* **observers:** extract common logic out into a decorator / cleanup select-value-observer ([c2a5e82](https://github.com/aurelia/aurelia/commit/c2a5e82))
* **runtime:** renaming core interfaces for clarity ([c4e26d3](https://github.com/aurelia/aurelia/commit/c4e26d3))
* **runtime:** move test fakes to a shareable location ([7d1f8d4](https://github.com/aurelia/aurelia/commit/7d1f8d4))
* **binding:** use ChangeSet instead of TaskQueue ([144b1c6](https://github.com/aurelia/aurelia/commit/144b1c6))
* **property-observer:** make reusable decorator for setter/observer ([144b1c6](https://github.com/aurelia/aurelia/commit/144b1c6))
* **runtime:** use "render location" terminology throughout ([3c9735e](https://github.com/aurelia/aurelia/commit/3c9735e))
* **all:** remove vCurrent repeater and collection observers (#55) ([70b6696](https://github.com/aurelia/aurelia/commit/70b6696))
* **jit:** merge attribute name/value parsers into template-compiler ([8ab2173](https://github.com/aurelia/aurelia/commit/8ab2173))
* **jit:** use IResourceDescriptions for looking up resources ([8ab2173](https://github.com/aurelia/aurelia/commit/8ab2173))
* **observation:** simplify map/set/array synchronization from the indexMap by explicitly tracking deleted items ([7ad02c4](https://github.com/aurelia/aurelia/commit/7ad02c4))
* **binding-mode:** deprecate oneWay and addturn bindingMode into flags ([4bb62ab](https://github.com/aurelia/aurelia/commit/4bb62ab))
* **binding:** change things in the runtime accordingly, and apply a few optimizations to binding.ts (both related and unrelated to binding.ts) ([4bb62ab](https://github.com/aurelia/aurelia/commit/4bb62ab))
* **ast:** various perf tweaks / remove redundancy / make behavior more similar to normal js ([e81c33a](https://github.com/aurelia/aurelia/commit/e81c33a))
* **ast:** various perf tweaks / remove redundancy / make behavior more similar to normal js ([25c18ee](https://github.com/aurelia/aurelia/commit/25c18ee))
* **all:** add binding-flags and reorder parameters to be more consistent ([12b73f0](https://github.com/aurelia/aurelia/commit/12b73f0))
* **binding:** remove connect-queue (temporarily) ([fd4a56b](https://github.com/aurelia/aurelia/commit/fd4a56b))
* **binding:** merge binding with connectableBinding and connect-queue ([7c26800](https://github.com/aurelia/aurelia/commit/7c26800))
* **task-queue:** change to a moving-cursor mechanism ([e4403d4](https://github.com/aurelia/aurelia/commit/e4403d4))
* **binding:** merge binding with connectableBinding and connect-queue ([0183386](https://github.com/aurelia/aurelia/commit/0183386))
* **dom:** various perf tweaks ([7458be7](https://github.com/aurelia/aurelia/commit/7458be7))
* **task-queue:** change to a moving-cursor mechanism ([44c9464](https://github.com/aurelia/aurelia/commit/44c9464))
* **all:** standardizing on "description" terminology ([3e65665](https://github.com/aurelia/aurelia/commit/3e65665))
* **bindable:** move description/source to bindable file ([1be6068](https://github.com/aurelia/aurelia/commit/1be6068))
* **resources:** move resources around ([a08b4bb](https://github.com/aurelia/aurelia/commit/a08b4bb))
* **all:** solidfying the resource concept and updating all resource implementations ([d7ad1cb](https://github.com/aurelia/aurelia/commit/d7ad1cb))
* **all:** increasing cohesion ([041aa0b](https://github.com/aurelia/aurelia/commit/041aa0b))
* **templating:** move custom element, et al each into their own file ([f7c78fc](https://github.com/aurelia/aurelia/commit/f7c78fc))
* **runtime:** some renaming of resources ([16f02be](https://github.com/aurelia/aurelia/commit/16f02be))
* **rendering-engine:** some minor renaming of parameters ([93fd1ac](https://github.com/aurelia/aurelia/commit/93fd1ac))
* **all:** extract kernel ([4a711c3](https://github.com/aurelia/aurelia/commit/4a711c3))
* **component:** consistent interface naming ([4a90498](https://github.com/aurelia/aurelia/commit/4a90498))
* **debug:** make consistent debug feature function names ([27bbb76](https://github.com/aurelia/aurelia/commit/27bbb76))
* **runtime:** first attempt to add some immutability to the structures ([f7da70a](https://github.com/aurelia/aurelia/commit/f7da70a))
* **parser:** move main parser from runtime to jit ([dde71e0](https://github.com/aurelia/aurelia/commit/dde71e0))
* **visual:** improve lifecycle sigs ([e3c47f7](https://github.com/aurelia/aurelia/commit/e3c47f7))
* **lifecycle:** improve lifecycle api ([5c5b1ea](https://github.com/aurelia/aurelia/commit/5c5b1ea))
* **resources:** use interface merging instead of dupe props ([dfe31f5](https://github.com/aurelia/aurelia/commit/dfe31f5))
* **component:** don't use inheritance for components ([1273fad](https://github.com/aurelia/aurelia/commit/1273fad))
* **computed:** move error to reporter ([d0fee67](https://github.com/aurelia/aurelia/commit/d0fee67))
* **computed-observer:** export create function as internal ([15ed1cd](https://github.com/aurelia/aurelia/commit/15ed1cd))
* **signals:** remove duplicate signal mechanism ([52d1e8f](https://github.com/aurelia/aurelia/commit/52d1e8f))
* **expressions:** rename parser to expression-parser ([6b7a8a3](https://github.com/aurelia/aurelia/commit/6b7a8a3))
* **all:** lots of refactoring including introducing abstraction layers ([9a96a1c](https://github.com/aurelia/aurelia/commit/9a96a1c))
* **all:** lots of re-org in templating ([1235992](https://github.com/aurelia/aurelia/commit/1235992))
* **templating:** lots of shuffling around ([542b338](https://github.com/aurelia/aurelia/commit/542b338))
* **all:** lots of work cleaning things up ([facf81c](https://github.com/aurelia/aurelia/commit/facf81c))
* **expression:** remove singleton and introduce IParser service ([ade5c06](https://github.com/aurelia/aurelia/commit/ade5c06))
* **all:** more work on refactoring DI use ([670bfd9](https://github.com/aurelia/aurelia/commit/670bfd9))
* **all:** first step of improving DI use throughout ([8c952a9](https://github.com/aurelia/aurelia/commit/8c952a9))
* **dom:** preparing for child observation on components ([fe587d1](https://github.com/aurelia/aurelia/commit/fe587d1))
* **all:** major rework to pal ([f8ee287](https://github.com/aurelia/aurelia/commit/f8ee287))
* **customElement:** rename decorator for multiple scenarios ([3f10db9](https://github.com/aurelia/aurelia/commit/3f10db9))
* **visual:** fix visual lifecycle method names to match others ([0d10576](https://github.com/aurelia/aurelia/commit/0d10576))
* **components:** ensure no conflicting method additions ([378f460](https://github.com/aurelia/aurelia/commit/378f460))
* **custom-element:** rename hydrate to $hydrate ([4fe6008](https://github.com/aurelia/aurelia/commit/4fe6008))
* **bindables:** unify all bindable configuration sources ([29ce162](https://github.com/aurelia/aurelia/commit/29ce162))
* **instructions:** clarify template runtime instructions ([db0f5d5](https://github.com/aurelia/aurelia/commit/db0f5d5))
* **slots/factories:** rename types and properties ([163daee](https://github.com/aurelia/aurelia/commit/163daee))
* **view-slot:** introduce IViewSlot interface ([5ba5234](https://github.com/aurelia/aurelia/commit/5ba5234))
* **shadow-dom:** name types to reflect that it relates to emulation ([f773bfd](https://github.com/aurelia/aurelia/commit/f773bfd))
* **component:** merging apply to target into element component ([c49c35b](https://github.com/aurelia/aurelia/commit/c49c35b))
* **slots:** remove some unnecessary code and shuffle a bit ([9cf613c](https://github.com/aurelia/aurelia/commit/9cf613c))
* **shadow-dom:** reduce duplication ([be3724a](https://github.com/aurelia/aurelia/commit/be3724a))
* **animation:** improve encapsulation and APIs around animation ([0d770a8](https://github.com/aurelia/aurelia/commit/0d770a8))
* **lifecycle:** renaming various APIs related to lifecycle management ([2709033](https://github.com/aurelia/aurelia/commit/2709033))
* **observerlocator/pal:** lots of cleanup ([b766764](https://github.com/aurelia/aurelia/commit/b766764))
* **event-manager:** big cleanup ([59369ac](https://github.com/aurelia/aurelia/commit/59369ac))
* **signals:** reshape api ([33aa14d](https://github.com/aurelia/aurelia/commit/33aa14d))
* **binding:** lots of reorg, type changes, etc. ([2e862e6](https://github.com/aurelia/aurelia/commit/2e862e6))
* **interfaces:** move IDisposable to generatel interfaces ([020bb9f](https://github.com/aurelia/aurelia/commit/020bb9f))
* **all:** move and rename some interfaces ([7354c0c](https://github.com/aurelia/aurelia/commit/7354c0c))
* **task-queue:** make simpler api and introduce full interface ([b1139a8](https://github.com/aurelia/aurelia/commit/b1139a8))
* **designtime:** rename to jit ([2f8b191](https://github.com/aurelia/aurelia/commit/2f8b191))
* **decorators:** moved to the runtime root ([9b07c8c](https://github.com/aurelia/aurelia/commit/9b07c8c))
* **template:** eliminate unnecessary binding helpers ([8cff8ce](https://github.com/aurelia/aurelia/commit/8cff8ce))
* **all:** moving a bunch of stuff around related to templating ([88461ac](https://github.com/aurelia/aurelia/commit/88461ac))
* **util:** move single util to DOM ([c1cd306](https://github.com/aurelia/aurelia/commit/c1cd306))
* **all:** fixing some interface names for consistency ([da52f1c](https://github.com/aurelia/aurelia/commit/da52f1c))
* **component:** create a better API for creating component constructors ([1a3eb61](https://github.com/aurelia/aurelia/commit/1a3eb61))
* **all:** rename framework to runtime ([c536a8a](https://github.com/aurelia/aurelia/commit/c536a8a))
* **templating:** encapsulate view creation logic into template ([b0d3787](https://github.com/aurelia/aurelia/commit/b0d3787))
* **view-factory:** re-use class for plain views ([1a94d36](https://github.com/aurelia/aurelia/commit/1a94d36))
* **compiled-element:** some renaming and signature fixups ([42f8a57](https://github.com/aurelia/aurelia/commit/42f8a57))
* **templating:** move visual and various interfaces and related to new places ([029dde2](https://github.com/aurelia/aurelia/commit/029dde2))
* **all:** more organization for expansion ([3f89493](https://github.com/aurelia/aurelia/commit/3f89493))
* **all:** organizing the framework code ([0e308fc](https://github.com/aurelia/aurelia/commit/0e308fc))
* **core:** rename template instance to view ([cd20f55](https://github.com/aurelia/aurelia/commit/cd20f55))
