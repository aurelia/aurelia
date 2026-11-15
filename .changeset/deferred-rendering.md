---
"@aurelia/template-compiler": minor
"@aurelia/runtime-html": minor
"@aurelia/plugin-conventions": minor
"aurelia": minor
---

Add the opt-in `defer` template controller (`DeferConfiguration`), which renders a block after an `idle`, `viewport`, `interaction`, `hover`, `timer` or `immediate` trigger or a `when` condition, loads the block's elements first, and supports `defer-placeholder`, `defer-loading` and `defer-error` branches, with `$defer.state`, `$defer.error` and `$defer.retry()`. Errors name the component that contains the block, and `<script defer>` keeps its native meaning. Template controllers can keep their content uncompiled with `compileContent: 'deferred'`, elements can declare `deferredDependencies`, the conventions plugin supports `<import from="..." defer>`, and the experimental template type checking types `$defer` in the branches and checks the bound options of `defer`.
