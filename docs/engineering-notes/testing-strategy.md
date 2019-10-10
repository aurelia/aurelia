<!---
Links pointing to this document:
packages\jit\test\generated\testing-strategy.md
-->
# Testing strategy

## Full integration tests

Full integration tests are close to e2e tests in that they verify functionality at the highest level API (the `Aurelia` class) using the JIT to compile the templates.

These tests are meant to give contributors and core team members close to 100% confidence that when they make a change and these tests still pass, it won't break anyone's app, even if some unit tests fail (depending of course on what those unit tests are verifying).

There are a few common patterns across all these tests to help accomplish this. Even if this results in what may appear like redundant tests, in reality they are still useful when it comes to preventing regressions.

### 1. Some (preliminary) common terms:

- **root template**: the top-level template which is a direct child of the app host (typically the template of the `app` element)

- **leaf template**: a template that does not contain another template (but may be a sequential repetition of itself). See [2. Test vectors for leaf templates](#2-test-vectors-for-leaf-templates)) for examples

  > By these semantics, a template can be a root and a leaf at the same time

- **child template** or **parent template** (depending on the direction from which it's described): a template that is neither a root nor a leaf.

  > By these semantics, a template can be a root and a parent at the same time - and can also be a leaf and a child at the same time

- **test vector**: a single aspect of test that, when changed into something else, results in another test with some meaningful difference in which code path it hits.

  > The word "meaningful" pertains to hitting a different code path. This is open to interpretation since technically every letter in a name of a binding that is different will result in a different code path in the parser, so some common sense applies here: what matters most in these tests are the template compiler, renderer, lifecycle and lifecycle methods.
  For example: wrapping an interpolation in a `div` vs. a `template` gives two meaningful tests because they are rendered differently by the framework, but a `div` vs. a `span` does not

- **variation**: essentially a different word for a single **test**, with emphasis on the fact that the test is composed of one particular variant of at least one vector

- **leaf combination set**: a collection of leaf templates with some variations in different vectors, multiplied (e.g. one wrapped in a div, one wrapped in a template, one with static text, one with an interpolation, giving a total of 4 **leaf template** **variations**)


### 2. Test vectors for leaf templates


  - **text**: differently behaving text nodes in otherwise identical leaf templates (test different rendering and lifecycle):

    1. `<div>foo</div>` (static)
    2. `<div>${x}</div>` (interpolation)

  - **wrapper**: different elements types wrapping a particular child in an otherwise identical template (test different rendering behavior):

    1. `<div>${x}</div>` (wrapped in div)
    2. `<template>${x}</template>` (wrapped in template)

  - **sequential repetition count**: the same template, either once or repeated N times (more than 1 item is often processed differently from just 1 item due to optimizations)

    1. `<div>${x}</div>`
    2. `<div>${x}</div><div>${x}</div>`

  - **sequential repetition structure**: the same number of sequential repetitions, but in a different structure (rendered differently but resulting in the same `textContent`):

    1. `<div>${x}${x}</div>`
    2. `<div>${x}</div><div>${x}</div>`

  - **behavior**: the same template, but wrapped in different behaviors (goes through a different lifecycle, usually rendered differently, but same `textContent`)

    1. `<div if.bind="true">${x}</div>`
    2. `<div if.bind="false"></div><div else>${x}</div>`
    3. `<div repeat.for="i of 1">${x}</div>`
    4. `<show-x x.bind="x"></show-x>` (`foo` being a custom element with template `<template>${x}</template>`)
    5. `<au-compose subject.bind="sub"></au-compose>` (`sub` being template definition `{template:'<template>${x}</template>'}` (the `template` here is not to be confused with a variation of the **wrapper** vector; this is effectively a naked interpolation and has no further variations in the context of being a leaf template))
    6. TODO: replaceable

  - **negative behavior**:

This brings us to a **leaf combination set** with total of 2x2x2x2x6=96 **leaf templates**. This number may increase in the future if additional template controllers are added or if justifications are found for additional vectors / variations.

### 3. Test vectors for parent/child templates with behavior combinations

  (empty space symbolizes a leaf template)

  - **behavior set**: different combinations of template controllers on the same element, distinguished only by the number of unique behaviors:

    1. `<div if.bind="a"> </div>`
    2. `<div if.bind="a"> </div><div else> </div>`
    3. `<div repeat.for="a of b"> </div>`
    4. `<div if.bind="a" repeat.for="a of b"> </div>`
    5. `<div if.bind="a" repeat.for="a of b"> </div><div else> </div>` (adding a repeater to the `else` would not make this a different set)


  - **order**: the same behavior set on the same element, but in a different order (results in completely different rendering and output):

    1. `<div repeat.for="a of b" if.bind="c"> </div>` (outer repeat, inner if)
    2. `<div if.bind="c" repeat.for="a of b"> </div>` (outer if, inner repeat)

  - **placement**: the same behavior set in the same order, but either on the same element or nested (results in the same rendered output but is compiled/rendered via different paths):

    1. `<div repeat.for="a of b" if.bind="c"> </div>` (if+repeat on same element)
    2. `<div repeat.for="a of b"><div if.bind="c"> </div></div>` (if with nested repeat)

  - **nested repetition count**: the number of nested template controllers of the same type (one or more types):

    1. `<div if.bind="a"><div if.bind="b"> </div></div>`
    2. `<div repeat.for="a of b" if.bind="c"><div if.bind="d"> </div></div>`
    3. `<div repeat.for="a of b" if.bind="c"><div repeat.for="d of e"> </div></div>`
    4. `<div repeat.for="a of b" if.bind="c"><div repeat.for="d of e" if.bind="f"> </div></div>`

