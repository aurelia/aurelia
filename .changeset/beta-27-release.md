---
"aurelia": minor
---

### Features

- **state:** Add support for multiple named and keyed stores - enables registering and managing stores identified by names or DI keys alongside the default store ([#2262](https://github.com/aurelia/aurelia/pull/2262)) - by @Vheissu
- **dialog:** Add ability to create child dialog service with default settings for simplified dialog management in larger applications ([#2300](https://github.com/aurelia/aurelia/pull/2300)) - by @bigopon
- **router:** Add `routeParameters` helper for aggregated params - nested views can access ancestor params without walking parent chains ([#2264](https://github.com/aurelia/aurelia/pull/2264)) - by @Vheissu
- **router:** Add `loaded` lifecycle hook that fires after swap, once per navigation, to complement `loading` ([#2267](https://github.com/aurelia/aurelia/pull/2267)) - by @Vheissu
- **router:** Add history navigation direction marker - detect back/forward via `isBack` property in lifecycle hooks ([#2243](https://github.com/aurelia/aurelia/pull/2243)) - by @Sayan751
- **router:** Auto-detect absolute, protocol and protocol-relative hrefs as external links with configurable allow-list ([#2270](https://github.com/aurelia/aurelia/pull/2270)) - by @Vheissu
- **repeat:** Add opt-in `contextual` property and `$previous` variable - enables section headers, dividers, and diff-style displays ([#2261](https://github.com/aurelia/aurelia/pull/2261)) - by @Vheissu
- **observation:** Add ability to declare getter dependencies manually via `@computed('prop1', 'prop2')` for explicit observation control ([#2260](https://github.com/aurelia/aurelia/pull/2260)) - by @bigopon
- **validation:** Add `ensureGroup` method for cross-field validation scenarios like date range consistency ([#2217](https://github.com/aurelia/aurelia/pull/2217)) - by @Sayan751
- **ui-virtualization:** Add variable item heights, horizontal scrolling, infinite scrolling, and better configurability ([#2178](https://github.com/aurelia/aurelia/pull/2178)) - by @Vheissu
- **plugin-conventions:** Add `transformHtml` option to transform HTML during build ([#2320](https://github.com/aurelia/aurelia/pull/2320)) - by @bigopon
- **plugin-conventions:** Add `<let>` support to template type-checker with proper scope visibility ([#2223](https://github.com/aurelia/aurelia/pull/2223)) - by @fkleuver
- **plugin-conventions:** Add `with` support to template type-checker - identifiers resolve to RHS object properties ([#2224](https://github.com/aurelia/aurelia/pull/2224)) - by @fkleuver

### Bug Fixes

- **build:** Fix package.json exports structure for `development` condition - bundlers were incorrectly resolving production builds ([#2321](https://github.com/aurelia/aurelia/pull/2321)) - by @fkleuver
- **build:** Add lmdb override for Node 22 compatibility ([#2327](https://github.com/aurelia/aurelia/pull/2327)) - by @fkleuver
- **webpack-loader:** Fix HMR code generation - missing import and incorrect delete expression ([#2326](https://github.com/aurelia/aurelia/pull/2326)) - by @fkleuver
- **hmr:** Fix doubly rendered element on change by clearing node reference before reactivation ([#2206](https://github.com/aurelia/aurelia/pull/2206)) - by @Sayan751
- **hmr:** Fix broken state due to bad handling of old/new data with proper deregistration ([#2316](https://github.com/aurelia/aurelia/pull/2316)) - by @bigopon
- **web-components:** Ensure naming conventions on observed attributes ([#2298](https://github.com/aurelia/aurelia/pull/2298)) - by @RubenMaguregui
- **binding:** Stop property binding reacting to changes when controller starts deactivating ([#2293](https://github.com/aurelia/aurelia/pull/2293)) - by @bigopon
- **au-compose:** Apply surrogate attributes to host when using inline template compositions with tag ([#2272](https://github.com/aurelia/aurelia/pull/2272)) - by @Vheissu
- **router:** Fix error recovery ([#2263](https://github.com/aurelia/aurelia/pull/2263)) - by @Sayan751
- **router:** Fix inconsistent URL generation ([#2254](https://github.com/aurelia/aurelia/pull/2254)) - by @Sayan751
- **router:** Fix exception with `nav: false` ([#2251](https://github.com/aurelia/aurelia/pull/2251)) - by @Sayan751
- **router:** Fix path generation for `useUrlFragmentHash: true` ([#2218](https://github.com/aurelia/aurelia/pull/2218)) - by @Sayan751
- **computed-observer:** Fix callback timing to fire after subscribers, matching normal observer behavior ([#2249](https://github.com/aurelia/aurelia/pull/2249)) - by @bigopon
- **bindable:** Don't transform underscore in attribute names - preserves `_my_prop` instead of converting to `my-prop` ([#2241](https://github.com/aurelia/aurelia/pull/2241)) - by @bigopon
- **runtime-html:** Fix CSS Modules processing for static class attributes inside nested template elements ([#2226](https://github.com/aurelia/aurelia/pull/2226)) - by @Vheissu

### Refactoring

- **template-compiler:** Use numeric discriminants for instruction types - smaller SSR hydration payloads, faster runtime comparisons ([#2329](https://github.com/aurelia/aurelia/pull/2329)) - by @fkleuver
- **template-compiler:** Simplify internal structure ([#2310](https://github.com/aurelia/aurelia/pull/2310)) - by @fkleuver
- **ast:** Change AST nodes from classes to interfaces for SSR serialization ([#2309](https://github.com/aurelia/aurelia/pull/2309)) - by @fkleuver
- **runtime:** Remove old DOM queue (`platform.domQueue`/`platform.taskQueue`) in favor of new queue implementation ([#2305](https://github.com/aurelia/aurelia/pull/2305)) - by @bigopon
