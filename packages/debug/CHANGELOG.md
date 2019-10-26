# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

<a name="0.4.0"></a>
# 0.4.0 (2019-10-26)

### Features:

* **all:** add tracer argument stringification and improve tracing ([5ccdc42](https://github.com/aurelia/aurelia/commit/5ccdc42))
* **kernel,debug:** add a simple tracer implementation ([89bc436](https://github.com/aurelia/aurelia/commit/89bc436))


### Bug Fixes:

* **reporter:** use correct message for code 16 and apply format variables to error msg ([1c8bdb1](https://github.com/aurelia/aurelia/commit/1c8bdb1))
* **runtime:** cleanup unused flags to get the highest flag no to SMI again ([4bc20d3](https://github.com/aurelia/aurelia/commit/4bc20d3))
* **debug:** add missing error codes and fix a few reporting issues ([25148d0](https://github.com/aurelia/aurelia/commit/25148d0))
* **debug:** add fromTick to stringifyLifecycleFlags ([8502236](https://github.com/aurelia/aurelia/commit/8502236))
* **tracer:** fix symbols ([760bcf9](https://github.com/aurelia/aurelia/commit/760bcf9))


### Performance Improvements:

* **all): add sideEffect:** false for better tree shaking ([59b5e55](https://github.com/aurelia/aurelia/commit/59b5e55))


### Refactorings:

* **debug:** rename Tracer to DebugTracer ([a6c28b3](https://github.com/aurelia/aurelia/commit/a6c28b3))
* **binding:** rename bindings ([35d4dff](https://github.com/aurelia/aurelia/commit/35d4dff))
* **ast:** add -Expression suffix to AST expression classes ([0870538](https://github.com/aurelia/aurelia/commit/0870538))
* **observation:** cleanup unused flags and remove decorator layer for the time being ([a16863b](https://github.com/aurelia/aurelia/commit/a16863b))
* **runtime:** encapsulate lifecycle behavior in controller class ([4c12498](https://github.com/aurelia/aurelia/commit/4c12498))
* **all:** break out patch mode for now ([e173d0c](https://github.com/aurelia/aurelia/commit/e173d0c))
* **all:** more loosening up of null/undefined ([6794c30](https://github.com/aurelia/aurelia/commit/6794c30))
* **all:** loosen up null/undefined ([40bc93a](https://github.com/aurelia/aurelia/commit/40bc93a))
* **runtime:** fix binding and observation strict types ([b01d69a](https://github.com/aurelia/aurelia/commit/b01d69a))
* **runtime:** remove/cleanup more flags ([71b598b](https://github.com/aurelia/aurelia/commit/71b598b))
* **runtime:** remove connect-queue ([b827710](https://github.com/aurelia/aurelia/commit/b827710))
* **tracer:** implement bbosman's suggestion for _ctorName ([9068c03](https://github.com/aurelia/aurelia/commit/9068c03))
* **debug:** use Reporter for the trace writer ([ee6a45d](https://github.com/aurelia/aurelia/commit/ee6a45d))
* **runtime:** support bindable array ([943eed0](https://github.com/aurelia/aurelia/commit/943eed0))
* **all:** consolidate binding mechanisms into BindingStrategy enum ([d319ba8](https://github.com/aurelia/aurelia/commit/d319ba8))
* **all:** split traceInfo.name up in objName and methodName ([2cdc203](https://github.com/aurelia/aurelia/commit/2cdc203))
* **debug:** put tracer in separate file ([2a169a1](https://github.com/aurelia/aurelia/commit/2a169a1))
* **debug:** explicitly export non-internal stuff ([840fe57](https://github.com/aurelia/aurelia/commit/840fe57))
* ***:** standardise on "as" type casts ([d0933b8](https://github.com/aurelia/aurelia/commit/d0933b8))
* ***:** partially revert renames due to no-reserved-keywords ([87501c1](https://github.com/aurelia/aurelia/commit/87501c1))
* ***:** remove no-reserved-keywords suppressions and fix most of them ([579c606](https://github.com/aurelia/aurelia/commit/579c606))
* ***:** fix errors and warnings reported by "lgtm" ([c77b12c](https://github.com/aurelia/aurelia/commit/c77b12c))

<a name="0.3.0"></a>
# 0.3.0 (2018-10-12)

### Features:

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
* **template-compiler:** handle semicolon-separated bindings in attributes ([ad6eeb4](https://github.com/aurelia/aurelia/commit/ad6eeb4))
* **jit:** decouple attribute/element parsing from template compiler ([ad6eeb4](https://github.com/aurelia/aurelia/commit/ad6eeb4))
* **template-compiler:** add initial implementation of semantic model ([ad6eeb4](https://github.com/aurelia/aurelia/commit/ad6eeb4))
* **renderer:** throw specific error codes on target/instruction count mismatch ([ad6eeb4](https://github.com/aurelia/aurelia/commit/ad6eeb4))


### Bug Fixes:

* **kernel:** fix decorated interface ([f67a414](https://github.com/aurelia/aurelia/commit/f67a414))
* **binding:** wrap updatetarget/updatesource so vCurrent BBs work again ([f67a414](https://github.com/aurelia/aurelia/commit/f67a414))
* **expression-parser:** fix differentation for caching of expressions/interpolations ([f67a414](https://github.com/aurelia/aurelia/commit/f67a414))
* **iterator-binding:** correctly compile and render ForOfStatement ([f67a414](https://github.com/aurelia/aurelia/commit/f67a414))
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
* **template-compiler:** make non-bindable customElement instructions siblings of the element instruction ([ad6eeb4](https://github.com/aurelia/aurelia/commit/ad6eeb4))
* **template-compiler:** properly resolve bindable customElement instructions by the registered attribute name ([ad6eeb4](https://github.com/aurelia/aurelia/commit/ad6eeb4))
* **scope:** add bindingContext to overrideContext ([ad6eeb4](https://github.com/aurelia/aurelia/commit/ad6eeb4))


### Performance Improvements:

* **expression-parser:** remove unreachable branch ([f67a414](https://github.com/aurelia/aurelia/commit/f67a414))
* **expression-parser:** reuse one ParserState object ([a0c9b0e](https://github.com/aurelia/aurelia/commit/a0c9b0e))
* **expression-parser:** use explicit numeric comparisons for bitwise operators ([197235c](https://github.com/aurelia/aurelia/commit/197235c))
* **element-parser:** use PLATFORM.emptyArray where possible and remove redundant property ([ad6eeb4](https://github.com/aurelia/aurelia/commit/ad6eeb4))
* **template-compiler:** convert parseAttribute to class instance with cache ([ad6eeb4](https://github.com/aurelia/aurelia/commit/ad6eeb4))
* **semantic-model:** use PLATFORM.emptyArray when possible ([ad6eeb4](https://github.com/aurelia/aurelia/commit/ad6eeb4))
* **element-parser:** use PLATFORM.emptyArray when possible ([ad6eeb4](https://github.com/aurelia/aurelia/commit/ad6eeb4))


### Refactorings:

* **binding:** cleanup/shuffle some interfaces accordingly ([f67a414](https://github.com/aurelia/aurelia/commit/f67a414))
* **template-compiler:** cleanup/inline instruction classes ([f67a414](https://github.com/aurelia/aurelia/commit/f67a414))
* **expression-parser:** extract enums and util function out into common.ts ([a0c9b0e](https://github.com/aurelia/aurelia/commit/a0c9b0e))
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

<a name="0.2.0"></a>
# 0.2.0 (2018-09-18)

### Features:

* **observers:** auto-enable collection observers and make the toggles idempotent ([d6a10b5](https://github.com/aurelia/aurelia/commit/d6a10b5))
* **custom-elements:** define basic abstraction for element projection ([0a17b16](https://github.com/aurelia/aurelia/commit/0a17b16))
* **runtime:** enable getting the custom element behavior... ([0a17b16](https://github.com/aurelia/aurelia/commit/0a17b16))


### Bug Fixes:

* **examples:** correct versions ([1b7c764](https://github.com/aurelia/aurelia/commit/1b7c764))
* **tsconfig:** correct extends path ([797674f](https://github.com/aurelia/aurelia/commit/797674f))
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
* **templating:** address trivial errors when removing emulation ([0a17b16](https://github.com/aurelia/aurelia/commit/0a17b16))
* **templating:** remove shadow dom from compose element ([0a17b16](https://github.com/aurelia/aurelia/commit/0a17b16))
* **all:** last few corrections from the merge ([0a17b16](https://github.com/aurelia/aurelia/commit/0a17b16))
* **runtime:** various fixes related to compose ([0a17b16](https://github.com/aurelia/aurelia/commit/0a17b16))
* **kernel:** scripts working ([9302580](https://github.com/aurelia/aurelia/commit/9302580))
* **all:** lots of path fixes and a few typing fixes, make sure everything builds correctly ([9302580](https://github.com/aurelia/aurelia/commit/9302580))
* **test:** make all the tests run via lerna ([9302580](https://github.com/aurelia/aurelia/commit/9302580))
