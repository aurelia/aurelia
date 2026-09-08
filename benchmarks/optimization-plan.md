# Rendering optimization plan

This file is the extensible ledger for rendering-pipeline performance work. Its scope includes Repeat reconciliation,
controller creation and lifecycle, binding creation and activation, observation, AST evaluation, DOM writes, and
scheduling. Change one hypothesis at a time, preserve correctness, and record the Tachometer result before moving to
the next hypothesis. Live JSON files are intentionally ignored; copy the relevant compact summary into the experiment
record so conclusions survive cleanup.

## Benchmark selection

Start with the matching CPU profile so theories are ranked by measured self and inclusive time:

```sh
npm run dev -- --profile startup
npm run dev -- --profile refresh
```

Read `benchmarks/live-results/profiles/<mode>-summary-latest.json`, then validate a selected change with Tachometer:

```sh
npm run dev -- --bench app-repeat-realistic/refresh.json --bench-samples 10
```

The live runner accepts any local Tachometer config whose fixture has an `index.js` bundle entry and whose expanded
names end in `base` and `candidate`. Select the scenario according to the mechanism being tested:

| Scenario | Primary coverage |
| --- | --- |
| `app-repeat-realistic/startup.json` | Controller creation, hydration, initial activation, binding creation/bind, initial AST evaluation, and DOM creation. |
| `app-repeat-realistic/refresh.json` | Keyed Repeat reconciliation, retained binding reevaluation, observer notification, target writes, and settled scheduling. |
| `app-repeat-realistic/refresh-loop.json` | Warmed diagnostic: 20 warm-ups, then total and median latency across 20 keyed refreshes per sample; also available in full/master CI. |
| `app-repeat-realistic/dependency-rotation.json` | Browser-engine isolation of AST evaluation and one-retained/one-replaced observer rotation, with fresh records and a warmed observer pool, without measured DOM work. |
| `app-repeat-realistic/mixed.json` | Keyed insertion/deletion/movement, controller activation/deactivation, binding bind/unbind, and DOM movement. |
| `app-repeat-realistic/heap-lifecycle.json` | Live and post-teardown retained heap across controller, binding, observer, and DOM lifecycle. |

The refresh scenario replaces 1,000 records while retaining their keyed order and controllers. Its measured interval
starts immediately before assigning `app.items` and ends after scheduled framework work settles. DOM assertions,
controller identity checks, and event checks run outside the interval.

When an aggregate scenario cannot attribute a change to one subsystem, add a focused fixture/config and register its
hypothesis below. A focused microbenchmark complements the realistic browser scenario; it does not replace the real-DOM
result for a rendering claim.

Before interpreting a result, confirm `benchmarks/live-results/results/status.json` has `state: "complete"`, then read
`benchmarks/live-results/results/latest.json`. Treat a change as supported only when Tachometer's 95% candidate delta
interval excludes zero in the expected direction. Confirm an adopted change with the exact-revision benchmark flow.

## Workflow

1. Select the highest-priority `queued` hypothesis supported by the matching CPU profile and whose benchmark isolates
   its expected effect, then mark it `testing`.
2. Record why the current code could cause the predicted cost.
3. Make the smallest implementation change that isolates that mechanism.
4. Wait for a new complete live result and record its compact summary.
5. Mark the hypothesis `supported`, `rejected`, or `inconclusive`.
6. Revert rejected experiments; retain supported changes and run correctness tests before continuing.
7. Add newly discovered hypotheses with a new stable ID instead of silently changing the current experiment.

Allowed states are `queued`, `testing`, `supported`, `rejected`, `inconclusive`, and `adopted`.

## Adding hypotheses

New theories are expected. Append them to the queue at any time using an area-prefixed stable ID:

- `R`: Repeat and collection reconciliation.
- `C`: controller creation, hydration, activation, and deactivation.
- `B`: binding creation, bind/unbind, connection, and target updates.
- `A`: AST evaluation, assignment, converters, and behaviors.
- `O`: observation, subscription, notification, and batching.
- `D`: DOM node, attribute, property, event, and render-location operations.
- `S`: task scheduling and async lifecycle coordination.

Every hypothesis must name its expected mechanism, suitable benchmark, correctness risk, and measurable prediction.
Do not delete rejected or inconclusive entries: their experiment records prevent the same theory being repeated later.

## Hypothesis queue

| ID | Area | State | Benchmark | Hypothesis | Primary evidence | Risk |
| --- | --- | --- | --- | --- | --- | --- |
| R1 | Repeat | inconclusive | refresh, mixed | Keyed replacement reconciliation performs avoidable collection snapshots and lookup allocations that can be combined or reused. | `Repeat` slices normalized items, old scopes, and old views, then allocates a key array, maps, a set, and an index map across `_normalizeToArray`, `_createScopes`, and `_applyIndexMap`. | Duplicate keys and asynchronous row lifecycles rely on stable snapshots. |
| R2 | Repeat/DOM | inconclusive | refresh, mixed | A keyed replacement with unchanged key order can bypass general view sorting and DOM movement checks. | The realistic refresh retains every key in the same position but still reaches `_createAndActivateAndSortViewsByKey`. | The fast path must prove order and controller identity are unchanged. |
| R3 | Repeat/scope | inconclusive | focused fixture needed | Scope remapping can avoid work for contextual properties when a repeat does not consume `$index` or related context. | `_createScopes` reuses scopes and replaces their items; later reconciliation updates contextual state conditionally. | Compiler/runtime contextual detection must remain correct for nested expressions. |
| R4 | Repeat | inconclusive | mixed | Deleted views can be removed with one stable linear compaction instead of repeated `Array.splice` suffix shifts. | `_deactivateAndRemoveViewsByKey` sorts deleted indices, then splices the live views array once per deletion. | Compaction must retain array identity, surviving view order, and async teardown ownership. |
| C1 | Controller | inconclusive | startup | The synchronous controller activation path can reduce generic async/lifecycle coordination overhead. | `Controller.activate` coordinates lifecycle hooks, view-model callbacks, binding, child activation, and `onResolveAll` even when the whole tree is synchronous. | Async hooks, reentrant start/stop, and lifecycle ordering must remain identical. |
| C2 | Controller | rejected | startup, mixed | Controller creation/hydration repeats metadata, container, scope, and lifecycle setup that can be cached or initialized more directly. | Every row creates or reactivates a controller graph before binding and attachment. | Cached state must remain container- and definition-specific and must not leak between controllers. |
| C3 | Controller | rejected | startup, heap lifecycle | Per-instance lifecycle-hook descriptors can be interned by their exact hook-presence mask. | Every custom-element and custom-attribute controller constructs an object with eleven boolean fields, even when thousands of instances have the same hook shape. | Instance-owned hook methods and later view-model replacement must compute the exact current shape rather than assuming constructor/prototype uniformity. |
| B1 | Binding | rejected | startup, heap lifecycle | Binding initialization performs repeated mode checks, observer setup, and connection-state work that can use specialized common paths. | Property, content, attribute, and interpolation bindings each initialize scope/state and call `astEvaluate` during `bind`. | Specialized paths must preserve converters, behaviors, custom expressions, from-view modes, and reconnection. |
| B2 | Binding | inconclusive | startup, refresh | Interpolation wrapper/part traversal and retained binding reevaluation can reduce intermediate calls or allocations. | `InterpolationBinding.bind` iterates part bindings, and each part independently evaluates and tracks its expression. | Multi-part interpolation and collection observation must remain atomic and ordered. |
| B3 | Binding/DOM | inconclusive | focused fixture needed | Target updates can avoid writes where the evaluated value is unchanged. | New record objects make retained row bindings reevaluate even when some displayed values remain stable. | Equality guards can cost more than DOM writes and must preserve coercion and behavior semantics. |
| A1 | AST | inconclusive | startup, refresh | Common AST node kinds can reduce recursive dispatch and scope-lookup overhead. | `astEvaluate` recursively dispatches access, call, interpolation, converter, behavior, and operator nodes for binding initialization and updates. | Strict/non-strict behavior, optional access, proxies, converters, and connectable tracking must agree. |
| A2 | AST/binding | inconclusive | startup | Binding-time evaluation and dependency connection duplicate traversals that can share work for simple expressions. | Bindings evaluate with a connectable argument to both obtain a value and collect dependencies. | Dependency collection must update correctly when conditional expression branches change. |
| O1 | Observation | adopted | refresh | Batched observer notification and retained-binding dispatch can reduce per-subscriber bookkeeping. | Record replacement notifies bindings which reevaluate ASTs and update targets before `tasksSettled` completes. | Notification order, collection batching, reentrancy, and subscriber mutation are observable behavior. |
| O2 | Observation | inconclusive | refresh, mixed | Multi-subscriber notification can snapshot lazily only when subscription mutation occurs during dispatch. | Each row `item` observer fans out to seven property bindings, and `SubscriberRecord` eagerly slices its subscriber array before every notification. | Add/remove, nested notification, thrown handlers, value/collection/dirty ordering, and batching semantics must remain exact. |
| O3 | Observation/property | inconclusive | refresh, mixed | Setter notification can skip its post-notification equality check when no callback is installed. | `SetterObserver.setValue` always compares the notified value again before optional-calling `_callback`, including ordinary observed scope properties without callbacks. | Reentrant subscriber writes must still suppress callbacks for stale values when a callback exists. |
| O4 | Binding/observation | inconclusive | refresh loop, refresh | Dependency connection can use the stored observer version as the membership lookup instead of probing a `Map` twice. | The refresh profile attributes 606ms self time to `observe`; `BindingObserverRecord.add` calls `Map.has` and then `Map.set` for every dependency, while stored versions are always numbers so `undefined` identifies absence. | Subscription counts and dependency-version refresh must remain exact across reconnect, branch changes, unbind, and rebind. |
| O10 | Observation/subscribers | adopted | dependency rotation, refresh | Removing the sole subscriber can bypass two searches and array splicing while retaining efficient array reuse. | Stale dependency cleanup commonly removes the only binding from an observer; the general path searches both subscriber arrays and splices the value-subscriber array. | Dirty-subscriber state, failed removal, re-subscription, fan-out mutation, and repeatedly reused observers must remain exact. |
| D1 | DOM | inconclusive | startup, mixed | Node-sequence insertion and movement can reduce repeated DOM calls for contiguous row blocks. | Rendering and Repeat sorting ultimately insert or move node sequences through render locations. | Containerless views, multi-node templates, projection, and SSR-adopted nodes must remain correct. |
| D2 | DOM/rendering | inconclusive | startup, mixed | Cached node creation can avoid redundant template-cache work before cloning a view. | `Rendering.createNodes` performs both `WeakMap.has` and `WeakMap.get` for every cached row view. | `null` cached templates and definitions without templates must retain empty-sequence behavior. |
| D3 | DOM/hydration | rejected | startup, mixed | Repeated clones can reuse compiled target-location metadata instead of tree-walking every cloned fragment for `<!--au-->` markers. | Every `FragmentNodeSequence` constructor performs native comment traversal even though clones of one compiled definition have identical marker locations. | Containerless marker pairs, marker preservation, enhanced templates, and SSR adoption have different ownership rules. |
| D4 | DOM/hydration | rejected | startup | Fragment target discovery can transform marker comments during TreeWalker traversal without retaining and revisiting a marker array. | `FragmentNodeSequence` currently collects every marker into a temporary array, then performs a second loop to resolve targets and remove markers. | Removing the current marker must not disturb TreeWalker order; SSR marker preservation and render-location pairing must remain exact. |
| B7 | Property binding | rejected | startup, heap lifecycle | Queue and from-view subscriber state can be allocated lazily for the uncommon bindings that use them. | Every `PropertyBinding` eagerly emits `_isQueued = false` and `_targetSubscriber = null`; ordinary non-layout to-view bindings never change either field. | Layout queue deduplication, from-view subscription teardown, and binding-behavior subscriber replacement must retain exact state transitions. |
| B8 | Interpolation binding | inconclusive | startup, heap lifecycle | Queue and dirty state can be allocated lazily for interpolation owners and parts that actually receive updates. | Every interpolation owner and part eagerly initializes transient booleans even when the bound value remains stable for its lifetime. | Initial evaluation, collection observation, queued layout writes, change coalescing, unbind, and rebind must treat absent state exactly like `false`. |
| C4 | Controller/bindables | rejected | startup | Observer initialization can reuse bindable property names for every instance of one definition. | `createObservers` calls `Object.getOwnPropertyNames` on the same definition bindables object for each repeated component instance. | Bindable definition mutation after first controller creation would require invalidation; supported definitions are expected to be immutable once consumed. |
| B4 | Binding/renderer | inconclusive | startup, mixed | Adjacent binding instructions can reuse target transformation and common construction inputs. | Each property/interpolation renderer independently resolves the same controller target, container, strict flag, parser, and observer locator. | Native nodes and controller targets share renderer entry points; class accessors and custom-element bindables need exact behavior. |
| B5 | Property binding | inconclusive | refresh, mixed | Non-layout target updates can avoid a second controller-state read by checking accessor type before the layout-only activation condition. | `PropertyBinding.handleChange` checks controller state in its guard, then checks it again before testing whether the accessor is a layout target. | Boolean reordering must not change queuing during activation or deactivation. |
| B6 | Renderer/SSR | inconclusive | startup | Client rendering can short-circuit SSR child-instruction classification before testing instruction types. | The inner renderer loop compares every instruction against both child-creating types even when the controller has no SSR scope. | SSR child-scope indexing must remain exact for hydrated element and template-controller instructions. |
| S1 | Scheduling | inconclusive | refresh, mixed | Fully synchronous reconciliation can avoid promise/task bookkeeping while retaining the general async path. | `_beginReconciliation`, `_drainReconciliation`, and row-transition handling coordinate both synchronous and asynchronous lifecycles. | Queued mutations, teardown ownership, and raw rejection values must retain their existing semantics. |
| D5 | Binding/DOM | inconclusive | startup | Dynamic class initialization can batch normalized tokens into one `DOMTokenList.add` call. | The startup CPU profile attributes 6.99ms self time to `ClassAttributeAccessor._flushChanges`; the realistic row class produces multiple tokens and the accessor calls `classList.add` separately for each. | Mapping, empty tokens, duplicate tokens, invalid tokens, and removal bookkeeping must retain correct behavior. |
| D6 | Binding/DOM | inconclusive | refresh loop, refresh | Text-content updates can avoid a native `instanceof Node` test for primitive interpolation values. | `ContentBinding.updateTarget` is the second-largest refresh frame at 612ms self time; the realistic text bindings produce strings and numbers but every update tests them against the platform `Node` constructor. | Real DOM-node interpolation, null, objects, proxies, and cross-realm values must preserve existing insertion and stringification behavior. |
| O5 | Observation/property | rejected | startup, refresh, mixed, heap lifecycle | Setter observation can avoid allocating a second closure and temporary assignment object for every installed property descriptor. | `SetterObserver.start` is the largest named framework self-time frame in the startup profile at 10.95ms; each call uses `Object.assign` to attach a newly allocated `getObserver` closure to the property getter. | Observer rediscovery, descriptor inspection, stop/restart, coercion, callbacks, and subscriber notification must retain exact behavior. |
| O6 | Binding/observation | rejected | refresh | Small binding dependency records can use ordered arrays instead of a `Map`. | The 100-iteration refresh profile attributes 614ms self time to dependency `observe`, 224ms to observer lookup, and 137ms to stale unsubscription; realistic bindings retain only a small dependency set. | Dependency uniqueness, ordering, version refresh, branch changes, reentrant subscription changes, thrown unsubscribe handlers, and large computed dependency sets must remain correct. |
| O7 | Observation/property | rejected | refresh loop, startup, heap lifecycle | Optional setter-observer callback and coercion state can be materialized only when configured. | Every replacement record creates observers for its bound properties; ordinary observers never use `_callback`, `_coercer`, or `_coercionConfig`, but the constructor eagerly writes all three fields. | Callback/coercer installation, object shape transitions, coercion configuration, reentrancy, stop/restart, and observer rediscovery must retain exact behavior. |
| O8 | Binding/observation | inconclusive | refresh loop, refresh | Connectable dependency tracking can consume an already-cached property observer without re-entering the general observer locator. | The refresh profile attributes roughly 250-316ms self time to `ObserverLocator.getObserver`; bindable view-model properties and previously observed scope properties already expose their observer through `$observers`. | Function-key computed observers, primitives, cache misses, non-cacheable observers, and user-supplied observer lookups must retain general locator behavior. |
| O9 | Binding/observation | inconclusive | refresh loop, refresh | Stable dependency sets can prove completeness by unique-observer count and skip stale-map traversal. | `unsubscribeStale` consumes roughly 120-145ms per 100 refreshes, and every binding calls `Map.forEach` after evaluation even when it re-observed every existing dependency. | Duplicate reads, conditional branch changes, added/replaced dependencies, evaluation throws, unbind/rebind, and externally visible record counts must remain exact. |
| D7 | Binding/DOM | inconclusive | refresh loop, refresh | Content bindings can update their known `Text` target through `CharacterData.data` instead of generic `Node.textContent`. | `ContentBinding.updateTarget` consistently consumes roughly 570-612ms self time; its target is statically typed and constructed as a `Text` placeholder, but `textContent` dispatches through the generic node-content API. | String conversion, MutationObserver behavior, interpolated DOM-node placeholders, node cleanup, and custom platform implementations must remain equivalent. |
| A3 | AST/member access | inconclusive | refresh | A member access rooted directly in an access-scope expression can avoid a recursive evaluator dispatch. | `astEvaluate` is the largest refresh-profile self-time frame at 658ms; seven row inputs use the common `item.property` AST shape, which currently re-enters the full evaluator for `item` before evaluating the member. | Strict and optional access, ancestor scope resolution, `$host`, function binding, dependency connection, and nullish behavior must remain exact. |
| D8 | DOM/hydration | inconclusive | startup | Zero-target, single-target, and single-root fragments can bypass parts of generic marker collection, target-array construction, and child-node snapshotting. | The startup profile attributes 6.35ms self to `collectMarkerComments` and 4.11ms self / 11.49ms inclusive to `FragmentNodeSequence`; D3 and D4 already rejected general marker-path caching and single-pass mutation. | Multi-node views, paired render locations, marker preservation, enhanced templates, projection, and SSR adoption must stay on the general path. |
| O11 | Observation/allocation | rejected | startup, heap lifecycle | Concrete hot objects that always consume `obs` or `subs` can install their record with a normal own slot instead of invoking `Reflect.defineProperty` through a lazy prototype getter. | The startup profile attributes 7.27ms self to `rtDefineHiddenProp`, while GC accounts for 20.94ms; the generic lazy path trades unused-object memory for installation work on every active binding/observer. | Enumerability, prototype decoration, devtools access, mixins, objects that never observe, hidden-class transitions, and teardown behavior must remain compatible. |
| D9 | Binding/DOM | rejected | startup | Initial class/style binding can initialize the target and accessor cache without running the full incremental diff used for later changes. | `_flushChanges` uses 6.37ms self / 8.46ms inclusive and `splitClassString` another 2.10ms self in the startup profile; D5 showed that merely batching `classList.add` calls is insufficient. | Static classes/styles, mapped tokens, duplicate and invalid tokens, multiple bindings, SVG, MutationObserver behavior, and later removals must remain correct. |
| C5 | Controller/DI | inconclusive | startup | Controller and renderer construction can reuse already-resolved stable services within one hydration operation instead of repeating general container resolution. | Startup samples include `registerResolver`, `get`, `invoke`, `resolve`, `getObserver`, and `createObservers`; their individual self times are small but their construction stacks repeat for every row. | Child-container overrides, scoped resources, new-instance resolvers, custom factories, SSR scopes, and user registrations must still resolve from the correct container. |
| D10 | DOM/hydration | rejected | startup, heap lifecycle | The completed marker array can be reused as the final target array after native traversal. | Each realistic row discovers eight markers, then allocates a second eight-element target array and overwrites it during marker transformation. | Every marker entry must be replaced, target order must remain stable, and SSR-preserved markers must remain independently reachable through the DOM. |
| K1 | Kernel/DI | rejected | startup | Invoking a type with no static constructor dependencies can avoid mapping and spreading a newly allocated empty array. | The realistic row component has no constructor dependencies, while startup profiles repeatedly include `invoke` in row construction. | The active container must remain established for field-initializer `resolve()` calls and dynamic dependencies must retain their ordering. |

## Startup investigation run

The saved 1,000-row startup profile completed on 2026-09-06 with a 166.40ms measured workload. Its CPU recording
covered 327.26ms and one startup iteration, so frame percentages include profiler setup and module work outside the
User Timing interval. Use the frame ranking to select theories, not as a decomposition that must sum to 166.40ms.
This capture also predates the conservative runtime-html revert in `a6e7a13ef6`; establish a fresh baseline before
changing source.

| Frame or subsystem | Self time | Inclusive time | Investigation meaning |
| --- | ---: | ---: | --- |
| Garbage collector | 20.94ms | 20.94ms | Capture allocation stacks before attempting another field-removal or cache theory. |
| Native `cloneNode` | 13.77ms | 13.77ms | Browser-owned cost; reduce clones or specialize view creation rather than rewriting the native operation. |
| `rtDefineHiddenProp` | 7.27ms | 7.27ms | Test O11 on concrete consumers; do not globally make internal properties enumerable. |
| `_flushChanges` | 6.37ms | 8.46ms | Test an initial-write path, not D5's rejected multi-argument `classList.add` variant. |
| `collectMarkerComments` | 6.35ms | 7.38ms | Test D8 special cases; do not repeat D3 or D4. |
| Native `appendChild` / `insertBefore` | 11.69ms combined | 11.69ms | Count calls and nodes per call before attempting batching. |
| `astEvaluate` | 4.22ms | 21.95ms | Attribute child time between scope lookup, observer connection, and target update before specializing AST dispatch. |
| `FragmentNodeSequence` | 4.11ms | 11.49ms | Measure marker targets, root-node count, temporary arrays, and constructor calls. |
| `render` | 2.26ms | 56.74ms | Inclusive umbrella; instrument its hydration, instruction, binding, and node-creation descendants. |
| `bind` | 2.08ms | 42.17ms | Count binding kinds and split evaluation, dependency connection, observer lookup, and initial target writes. |
| `createNodes` | 2.11ms | 28.37ms | Separate template-cache access, cloning, target discovery, and NodeSequence construction. |

Run theories in this order unless a fresh profile changes the ranking:

1. D10 confirmation: reproduce the immediate allocation reduction, then use forced-GC lifecycle and allocation
   evidence to classify it as transient-allocation or retained-heap improvement. Keep it only with neutral startup,
   refresh, and mixed guards.
2. A2 instrumentation: split initial binding work among expression evaluation, observer lookup/creation, dependency
   connection, and target writes. Use the result to define a narrower optimization; do not repeat A3's AST dispatch
   specialization or O11's record-storage changes.
3. D1 instrumentation and experiment: count initial node-sequence mounts, native insertions, and nodes per insertion;
   if repeated rows mount independently, test staging contiguous initial rows in a fragment while preserving lifecycle
   and render-location order.
4. C5 attribution: aggregate container creation, registration, invocation, and resolution by service and call site.
   Only specialize a stable service proven hot; K1 established that empty constructor-dependency mapping is too small.
5. Update-path DOM work: test D7 and then D6 with a focused content-binding fixture before realistic refresh guards.
6. Update-path observation work: test O8 and O9 independently with dependency rotation and refresh-loop guards.
7. Reconciliation work: revisit R2 for stable keyed order and R4 for deletion compaction using refresh and mixed;
   retain the generic paths for changed order, duplicate keys, and asynchronous lifecycles.

D8 requires a separate simple-template fixture because its zero/single-target specialization does not apply to the
eight-target realistic row. B2, B3, and R3 likewise remain deferred until their focused fixtures exist.

For each theory, preserve the unmodified startup bundle as the live session baseline, change one mechanism, wait for
both result and profile status files to report `complete`, and record bundle hashes. The three-start diagnostic profile
amplifies recurring creation/hydration frames but includes warmed second and third application starts; only the
Tachometer scenario's fresh-page, single-start samples decide end-to-end startup performance. Require two completed
runs whose 95% duration intervals exclude zero in the expected direction. Use `mixed.json`, `refresh.json`, and
`heap-lifecycle.json` as regression guards when a candidate changes DOM behavior, binding/observer layout, or
allocation respectively.

Duration and memory are independent acceptance axes. The investigation prioritizes duration, but a candidate with
neutral duration may still be retained as a memory optimization when the reduction excludes zero, follows directly
from the changed allocation mechanism, reproduces, and passes duration/DOM correctness guards. Immediate used-heap
readings can include uncollected temporary objects, so distinguish reduced allocation pressure from retained-memory
improvement with `heap-lifecycle.json` and, where needed, allocation profiling. Do not reject such a candidate merely
because its duration interval includes zero; do not describe it as a speed improvement either.

## Experiment record

Copy this block for each attempt:

```md
### R1 / attempt 1

- State: inconclusive
- Commit/worktree description:
- Mechanism changed:
- Expected result:
- Correctness validation:
- Tachometer started/completed timestamps:
- Duration summary:
- Heap summary:
- Decision:
- Follow-up:
```

## Decisions

### O9 / attempt 1

- State: inconclusive
- Profile evidence: baseline `unsubscribeStale` used roughly 120-145ms self time per 100 refreshes.
- Commit/worktree description: reset the public observer count when the evaluation version advances, increment it once
  per unique dependency seen in that version, and skip stale traversal when it equals the map size.
- Mechanism changed: stable complete dependency sets avoid `Map.forEach`; changed branches retain version-based removal.
- Expected result: lower median refresh latency with neutral or lower total time.
- Correctness validation: runtime build and lint passed; all 49,386 Node runtime tests passed.
- Tachometer started/completed timestamps: valid production result 2026-09-06T12:26:37.040Z /
  2026-09-06T12:30:50.917Z.
- Duration summary: total candidate delta -5.56% to +2.85%; median refresh delta -6.99% to +4.08%. Neither
  excludes zero.
- Decision: reverted. The candidate profile still attributed 148ms to `unsubscribeStale`: each `item.property`
  binding retains the scope dependency but replaces the record-property observer, so the common set is not stable.
- Follow-up: do not use set-size completeness for record replacement; any follow-up must directly optimize one-stale,
  one-retained dependency rotation without adding per-binding retained state.

### D7 / attempt 1

- State: inconclusive
- Profile evidence: `ContentBinding.updateTarget` consistently used roughly 570-612ms self time in 100-refresh
  profiles and its target is always a `Text` placeholder.
- Commit/worktree description: assign serialized content through `Text.data` rather than `Node.textContent`.
- Mechanism changed: use the statically known CharacterData setter instead of generic node-content dispatch.
- Expected result: reduce text interpolation DOM-write time with identical rendered content and node placeholders.
- Correctness validation: runtime-html build and lint passed (14 pre-existing warnings); 100 focused interpolation
  and value-converter tests passed. The preceding full runtime-html run covered 14,189 tests.
- Tachometer started/completed timestamps: 2026-09-06T12:06:00.207Z / 2026-09-06T12:10:19.400Z.
- Duration summary: candidate delta -8.62% to +8.91%; no clear change.
- Decision: reverted because the result did not separate from zero and candidate `updateTarget` self time remained
  587ms, within the baseline profile range.
- Follow-up: retain `textContent`; optimize evaluation/observation before changing the DOM setter again.

### O8 / attempt 1

- State: inconclusive
- Profile evidence: the cached-observer candidate reduced sampled `ObserverLocator.getObserver` self time from
  roughly 250-316ms to 156ms in a 100-refresh profile.
- Commit/worktree description: read `$observers[key]` in connectable `observe()` before entering the general locator;
  function keys and cache misses retain the existing lookup.
- Mechanism changed: avoid repeated object/key classification and observer-lookup retrieval for cached dependencies.
- Expected result: reduce warmed binding reevaluation time while leaving cache misses and subscriptions unchanged.
- Correctness validation: runtime build and lint passed; all 49,386 Node runtime tests passed.
- Tachometer started/completed timestamps: valid run 2026-09-06T11:55:08.558Z / 2026-09-06T11:59:05.929Z;
  frozen-snapshot confirmation completed in 257.4 seconds.
- Duration summary: valid candidate delta -3.83% to +1.13%; confirmation -2.69% to +3.16%. Neither excludes zero.
- Decision: reverted because the diagnostic function-level reduction did not establish an end-to-end improvement.
- Follow-up: use a binding-evaluation microbenchmark if observer-locator dispatch itself becomes an optimization target.

### O7 / attempt 1

- State: rejected
- Profile evidence: each replacement record causes observer creation for its bound properties; `SetterObserver`
  construction feeds the profiled observer/notification and GC costs.
- Commit/worktree description: omit initial writes for optional `_callback`, `_coercer`, and `_coercionConfig` fields.
- Mechanism changed: ordinary setter observers remain on the smaller initial object shape; callback and coercion APIs
  materialize their state only when used.
- Expected result: reduce constructor work and allocation across newly observed replacement records.
- Correctness validation: runtime build and lint passed; all 49,386 Node runtime tests passed, including 818
  property-observation tests.
- Tachometer started/completed timestamps: 2026-09-06T11:40:24.375Z / 2026-09-06T11:44:29.409Z.
- Duration summary: candidate was clearly slower by +0.14% to +9.17% on the 20-refresh diagnostic.
- Decision: rejected and reverted. The candidate profile exposed `SubscriberRecord.notify` as a 341ms self-time
  frame, consistent with the changed observer shape preventing favorable optimization/inlining in the notification path.
- Follow-up: retain the eager fields; removing writes is not automatically beneficial when it changes hot object shapes.

### D6 / attempt 1

- State: inconclusive
- Profile evidence: `ContentBinding.updateTarget` was the second-largest baseline refresh frame at 612ms self time;
  the fixture sends only primitive string and number values through its text-content bindings.
- Commit/worktree description: guard the platform `Node` `instanceof` check with `typeof value === 'object'`.
- Mechanism changed: primitive interpolation values skip a native constructor test; DOM-node values retain the same
  insertion, cleanup, and placeholder behavior.
- Expected result: reduce warmed keyed-refresh duration without affecting heap or rendered output.
- Correctness validation: runtime-html build and lint passed (14 pre-existing warnings); all 14,189 Node
  runtime-html tests passed after a clean test-workspace rebuild.
- Tachometer started/completed timestamps: 2026-09-06T11:29:43.219Z / 2026-09-06T11:31:23.614Z.
- Duration summary: candidate delta -13.80% to +9.37%; no clear change.
- Decision: reverted because the matching-provenance result did not separate from zero. A later automatic result was
  discarded because a different build phase made its candidate bundle 23,734 bytes smaller than the frozen base.
- Follow-up: retry only after the diagnostic loop includes enough refreshes per sample to stabilize GC variance.

### O4 / attempt 1

- State: inconclusive
- Profile evidence: the 100-iteration refresh baseline attributed 606ms self time to dependency `observe`; the
  candidate profile attributed 576ms, but sampling profiles are diagnostic rather than comparative evidence.
- Commit/worktree description: use `Map.get(observer) === undefined` as the dependency membership test instead of
  calling `Map.has(observer)` before updating its numeric evaluation version.
- Mechanism changed: remove one membership probe from every dependency observed during retained binding evaluation.
- Expected result: reduce warmed keyed-refresh duration without changing subscriptions or retained state.
- Correctness validation: runtime build and lint passed; all 49,386 Node runtime tests passed.
- Tachometer started/completed timestamps: 2026-09-06T11:21:15.809Z / 2026-09-06T11:23:10.190Z.
- Duration summary: candidate delta -6.03% to +6.42%; no clear change.
- Decision: reverted because the matching-provenance result did not separate from zero. A later automatic run was
  discarded because its candidate bundle was 7,834 bytes smaller than the frozen base after a different build phase.
- Follow-up: retain `Map.has` unless a dependency-only microbenchmark demonstrates a meaningful engine-level gain.

### D5 / attempt 1

- State: inconclusive
- Profile evidence: startup capture completed 2026-09-06T10:34:31.634Z; `_flushChanges` used 6.99ms self time
  (1.77% of the captured samples) while initializing the realistic row classes.
- Commit/worktree description: batch mapped, non-empty dynamic class tokens into one `DOMTokenList.add` call.
- Mechanism changed: compact the existing token array in place after mapping, update the existing version index, and
  invoke the variadic DOM API once instead of once per token.
- Expected result: lower startup duration and `_flushChanges` self time without adding an intermediate array.
- Correctness validation: runtime-html and test-workspace builds passed; all 1,678 target-observer tests passed,
  including a focused mapped-token batching assertion.
- Tachometer started/completed timestamps: 2026-09-06T10:36:34.498Z / 2026-09-06T10:37:04.792Z.
- Duration summary: candidate delta -10.93% to +6.60%; no clear change.
- Heap summary: candidate delta -0.05% to +0.21%; no clear change.
- Decision: reverted. The candidate profile increased `_flushChanges` from 6.99ms / 1.77% to 14.00ms / 2.68%
  self time while the whole profiled workload was also slower. Fewer JS-to-DOM calls did not translate into a
  supported end-to-end improvement.
- Follow-up: retain individual `classList.add` calls unless a class-heavy focused benchmark shows a threshold where
  batching wins.

### O5 / attempt 1

- State: inconclusive
- Profile evidence: startup capture completed 2026-09-06T10:34:31.634Z; `SetterObserver.start` used 10.95ms self
  time (2.78% of captured samples), the largest named framework self-time frame.
- Commit/worktree description: reuse the installed property getter as the observer lookup carrier.
- Mechanism changed: store the observer on the getter and attach one module-level `getObserver` function instead of
  allocating a per-property recovery closure and temporary object for `Object.assign`.
- Expected result: lower observer installation time and allocation during binding startup.
- Correctness validation: runtime and test-workspace builds passed; all 819 property-observation tests passed,
  including focused observer rediscovery through the installed getter.
- Tachometer started/completed timestamps: 2026-09-06T10:40:45.875Z / 2026-09-06T10:41:14.257Z;
  confirmation 2026-09-06T10:42:49.399Z / 2026-09-06T10:43:16.734Z.
- Duration summary: first delta -8.07% to +4.17%; confirmation -4.85% to +3.78%. Neither excludes zero.
- Heap summary: first delta -0.04% to +0.20%; confirmation -0.18% to +0.09%. Neither excludes zero.
- Decision: reverted. Both candidate profiles reduced the measured `SetterObserver.start` cost (10.95ms baseline;
  5.89ms and 9.37ms candidates), but the end-to-end benchmark did not establish a startup improvement.
- Follow-up: revisit only with a focused property-observer installation benchmark or a higher-sample startup run.

### A2 / attribution investigation

- State: inconclusive; original mechanism falsified without a code change.
- Finding: initial property, content, attribute, and interpolation binding paths call `astEvaluate` once with the
  connectable, so value evaluation and dependency discovery already share one AST traversal. Initial bind also does
  not increment the observer-record version or call stale-dependency cleanup. The large inclusive AST stack consists
  of required scope reads plus observer lookup/creation, setter installation, and subscription.
- Existing isolation evidence: A3 reduced recursive member-access dispatch without an end-to-end improvement; O4's
  map membership change and O8's cached observer lookup reduced subframe costs but were also end-to-end neutral.
- Decision: do not add a second simple-expression evaluator or repeat those subpath implementations. Continue with
  the independently hot observer-installation path under O5.

### O5 / attempt 2

- State: testing; startup-positive, realistic guards pending.
- Commit/worktree description: install one getter closure whose module-owned symbol points directly to its
  `SetterObserver`; descriptor rediscovery reads that symbol before retaining the established custom `getObserver`
  callback convention. This removes the per-property recovery closure and temporary `Object.assign` source object.
- Correctness design: a symbol prevents collisions with properties on user-authored getter functions, and cached
  observer lookup remains unchanged. A focused test removes the ordinary cache entry and verifies that descriptor
  rediscovery returns the original observer; existing custom-getter callback tests retain their behavior.
- Startup results for the initial string-slot prototype: attempt 1 improved 0.52% to 6.44%; attempt 2 was
  inconclusive at -6.65% to +0.64%; attempt 3 improved 0.47% to 8.90%. Immediate heap was consistently higher.
- Collision-safe symbol result: candidate improved 0.21% to 6.64%; immediate heap increased 0.03-0.38 MiB
  (+0.20% to +2.35%). Base bundle was `e5fd2030`; candidate was `862667a7`.
- Profile evidence: the first direct-observer prototype reduced `SetterObserver.start` from 19.59ms to 9.27ms self.
  Sampling varied on later runs, but the end-to-end improvement excluded zero in three of four candidate runs.
- Correctness validation: runtime build and lint passed; test-workspace build passed; all 1,938 focused property
  observation and observer-locator tests passed.
- Decision: retain for refresh, mixed-reconciliation, and forced-GC heap guards. A small heap increase is acceptable
  only if the startup improvement remains and the authoritative real-DOM update paths do not regress.

### O6 / attempt 1

- State: rejected
- Profile evidence: the 100-iteration refresh capture completed 2026-09-06T10:59:05.461Z; dependency `observe`
  used 614ms self time, observer lookup 224ms, and stale unsubscription 137ms. The fixture's property bindings have
  small ordered dependency sets that are repeatedly refreshed.
- Commit/worktree description: replace the binding observer record's `Map` with parallel observer/version arrays.
- Mechanism changed: use `indexOf` for small-set membership and ordered in-place stale removal, avoiding Map hashing,
  entry allocation, and callback-based iteration.
- Expected result: lower refresh duration and retained binding-record heap for common one- and two-dependency bindings.
- Correctness validation: runtime and test-workspace builds passed; 137 focused AST, computed-observer, behavior,
  converter, and binding-mode tests passed.
- Tachometer started/completed timestamps: 2026-09-06T11:00:48.181Z / 2026-09-06T11:01:42.255Z.
- Duration summary: candidate delta -18.28% to +1.03%; no clear change.
- Heap summary: candidate increased immediate heap by 2.85 to 2.89 MB (+11.73% to +11.91%).
- Decision: rejected. Two arrays per binding record cost substantially more retained heap, and stale removal introduced
  65ms of `splice` self time in the 100-iteration profile.
- Follow-up: attempt one flat observer/version array with a tail-removal fast path before reverting to `Map`.

### O6 / attempt 2

- State: rejected
- Commit/worktree description: store alternating observer/version entries in one flat array.
- Mechanism changed: remove the second array, scan only observer slots, and truncate when the stale dependency is the
  final entry; preserve ordered `splice` for non-tail removals.
- Expected result: retain the lower lookup overhead without the two-array heap regression or common tail `splice`.
- Correctness validation: runtime build and lint passed; the same 137 focused tests passed.
- Tachometer started/completed timestamps: 2026-09-06T11:02:58.936Z / 2026-09-06T11:03:58.270Z.
- Duration summary: candidate delta -12.68% to +6.17%; no clear change.
- Heap summary: candidate increased immediate heap by 0.61 to 0.65 MB (+2.51% to +2.69%).
- Decision: rejected and reverted. One flat array reduced the two-array regression but remained clearly larger than
  the original Map and did not establish a duration improvement.
- Follow-up: retain Map-backed dependency records; do not revisit representation without per-record heap evidence.

### A3 / attempt 1

- State: inconclusive
- Profile evidence: the 100-iteration baseline refresh profile attributes 658ms self and 1,552ms inclusive time to
  `astEvaluate`; the realistic row has seven direct `item.property` input expressions per row.
- Commit/worktree description: inline access-scope evaluation inside the access-member evaluator case.
- Mechanism changed: bypass one recursive `astEvaluate` call for `AccessMember(AccessScope)` when bound-function
  semantics are not requested, while preserving the existing scope, observation, strict, optional, and `$host` logic.
- Expected result: lower AST self time and refresh duration without changing retained heap.
- Correctness validation: runtime build and lint passed; 574 AST, optional-chain, and integration tests passed.
- Tachometer started/completed timestamps: 2026-09-06T11:05:24.222Z / 2026-09-06T11:06:31.464Z;
  confirmation 2026-09-06T11:06:48.387Z / 2026-09-06T11:07:54.846Z.
- Duration summary: first delta -8.38% to +8.40%; confirmation -4.58% to +4.34%. Neither excludes zero.
- Heap summary: first delta -0.17% to +0.01%; confirmation +0.005% to +0.177%, narrowly higher.
- Decision: reverted. `astEvaluate` self time fell relative to the baseline profile, but total workload time rose and
  dependency `observe` became the dominant frame; recursive dispatch was not the end-to-end constraint.
- Follow-up: do not duplicate AccessScope semantics inside AccessMember without a focused AST-only benchmark showing
  value independent of the real refresh result.

### O3 / attempt 2

- State: inconclusive
- Profile evidence: the 100-iteration baseline refresh profile attributes 313ms self time and 2,281ms inclusive
  time to the primary `SetterObserver.setValue` frame. This is stronger attribution than attempt 1 had.
- Commit/worktree description: guard the reentrancy equality check behind callback presence.
- Mechanism changed: cache `_callback` after notification and only compare the post-notification value when a callback
  exists; callback-bearing observers retain the exact stale-value suppression check.
- Expected result: lower setter notification self time and refresh duration for ordinary callback-free observers.
- Correctness validation: runtime build and lint passed; all 819 property-observation tests passed, including a new
  reentrant callback test proving that the stale outer value remains suppressed.
- Tachometer started/completed timestamps: 2026-09-06T11:10:51.187Z / 2026-09-06T11:11:53.865Z.
- Duration summary: candidate delta -10.08% to +6.81%; no clear change.
- Heap summary: candidate delta -0.12% to +0.05%; no clear change.
- Decision: reverted. The 100-iteration profile did not consistently reduce setter self time, and the end-to-end
  refresh comparison remained much wider than the expected gain.
- Follow-up: require a warmed multi-refresh-per-sample benchmark before revisiting callback-free notification paths.

### R1 / attempt 1

- State: adopted
- Commit/worktree description: transfer the previous scope-array reference instead of cloning all references.
- Mechanism changed: `_createScopes` assigns `oldScopes` directly to `_oldScopes`; `_scopes` is replaced and the old
  array is not mutated during reconciliation.
- Expected result: lower keyed-refresh allocation with no behavioral or material duration regression.
- Correctness validation: runtime-html package build and lint passed; 5,043 compiled Repeat tests passed with 4 pending.
- Tachometer started/completed timestamps: 2026-09-06T06:46:01.916Z / 2026-09-06T06:46:35.227Z.
- Duration summary: candidate 145.70-164.61ms vs base 147.35-167.22ms; delta -15.85ms to +11.58ms, no clear change.
- Heap summary: candidate 23.57-23.61 MiB vs base 23.46-23.50 MiB; the higher candidate offset was also present in the A/A baseline and is not attributed to this change.
- Decision: inconclusive; the isolated array-copy removal is below this scenario's detectable duration threshold.
- Follow-up: retain the ownership-transfer simplification during R1 attempt 2 and remove the duplicate matched-index `Set` and deletion scan.

### R1 / attempt 2

- State: inconclusive
- Commit/worktree description: consume matched scopes from the existing old-scope-to-index map.
- Mechanism changed: remove the per-refresh `Set<number>` and final indexed membership scan; unmatched map values directly provide deleted indices in insertion order.
- Expected result: lower keyed-refresh CPU and allocation, particularly for fully retained lists.
- Correctness validation: runtime-html package build and lint passed; 5,043 compiled Repeat tests passed with 4 pending.
- Tachometer started/completed timestamps: 2026-09-06T06:49:27.986Z / 2026-09-06T06:50:00.319Z.
- Duration summary: candidate 139.49-153.83ms vs base 133.46-145.49ms; delta -2.17ms to +16.54ms, no clear change.
- Heap summary: candidate 23.57-23.59 MiB vs base 23.47-23.50 MiB; the same systematic candidate offset remains.
- Decision: inconclusive with an unfavorable point estimate.
- Follow-up: revert both R1 attempts; do not retain allocation changes without measurable evidence.

### R2 / attempt 1

- State: testing
- Commit/worktree description: identity-index-map fast path before LIS calculation and DOM movement checks.
- Mechanism changed: after view mapping, detect a deletion-free identity map, refresh contextual references, and return.
- Expected result: reduced keyed-refresh duration and allocation with unchanged DOM/controller identity.
- Correctness validation: runtime-html package build and lint passed; 5,043 compiled Repeat tests passed with 4 pending.
- Tachometer started/completed timestamps: 2026-09-06T06:52:49.253Z / 2026-09-06T06:53:21.347Z.
- Duration summary: candidate 138.46-150.32ms vs base 139.43-152.40ms; delta -10.31ms to +7.27ms, no clear change.
- Heap summary: candidate 23.56-23.59 MiB vs base 23.56-23.61 MiB; delta -0.04 MiB to +0.02 MiB, no clear change.
- Decision: inconclusive; the realistic refresh cannot resolve the small LIS fast-path cost.
- Follow-up: revert and revisit only with a focused reconciliation benchmark.

### R3 / initial investigation

- State: inconclusive
- Finding: Repeat already supports explicit `contextual: false`, but automatic elimination requires compiler analysis of
  every binding under the repeated template, including nested lexical access.
- Decision: create a focused contextual/no-contextual fixture before changing compiler/runtime contracts.

### B3 / initial investigation

- State: inconclusive
- Finding: the realistic refresh changes label, owner, progress, status, selected, and detail for every record, so it
  does not exercise unchanged-target write suppression.
- Decision: create a workload with a controlled mixture of changed and unchanged binding values before testing guards.

### A1 / attempt 1

- State: testing
- Commit/worktree description: direct common-path lookup in `Scope.getContext`.
- Mechanism changed: return immediately for a name in the current override/binding context, boundary scope, or root
  scope; begin ancestor traversal at the parent only when the current scope cannot satisfy the name.
- Expected result: reduce repeated `in` checks and loop setup for common row-local binding expressions.
- Correctness validation: runtime package build and lint passed; 54 focused scope and AST integration tests passed.
- Tachometer started/completed timestamps: 2026-09-06T06:56:47.807Z / 2026-09-06T06:57:20.536Z.
- Duration summary: candidate 139.55-153.96ms vs base 141.89-159.14ms; delta -15.00ms to +7.48ms, no clear change.
- Heap summary: candidate 23.56-23.60 MiB vs base 23.57-23.59 MiB; delta -0.02 MiB to +0.03 MiB, no clear change.
- Decision: inconclusive; revert because the realistic refresh does not establish a benefit.
- Follow-up: revisit AST specialization with a focused evaluator benchmark or the startup scenario.

### O1 / attempt 1

- State: testing
- Commit/worktree description: singleton subscriber notification fast paths.
- Mechanism changed: invoke the sole value, collection, or dirty subscriber directly; retain snapshot iteration when
  multiple subscribers can mutate the list during notification.
- Expected result: avoid a short-lived array allocation for the common one-observer/one-binding relationship.
- Correctness validation: runtime package build/lint and existing subscriber tests passed; explicit singleton value,
  collection, and dirty-dispatch coverage added.
- Tachometer started/completed timestamps: 2026-09-06T06:59:06.404Z / 2026-09-06T06:59:37.425Z.
- Duration summary: candidate 131.47-144.05ms vs base 131.72-143.48ms; delta -8.44ms to +8.78ms, no clear change.
- Heap summary: candidate 23.52-23.54 MiB vs base 23.56-23.60 MiB; delta -0.07 MiB to -0.03 MiB, lower.
- Decision: adopted as a measured allocation/heap reduction with neutral duration.
- Follow-up: an independent live confirmation again measured lower heap (candidate 23.52-23.57 MiB vs base
  23.57-23.60 MiB; delta -0.07 MiB to -0.01 MiB) with neutral duration. Confirm with the exact-revision workflow
  before presenting a formal performance claim.

### B2 / initial investigation

- State: inconclusive
- Finding: each interpolation part caches its value and `_evaluate` traverses only dirty parts; the current refresh
  changes all displayed values, so it supplies neither redundant part evaluation nor unchanged output to remove.
- Decision: require a focused multi-part interpolation workload before changing wrapper/part coordination.

### S1 / initial investigation

- State: inconclusive
- Finding: synchronous Repeat reconciliation does not allocate a promise or operation record. Those are created only
  after a promise result, a reentrant update, or teardown during reconciliation; none is isolated by ordered refresh.
- Decision: use the mixed scenario with deliberately asynchronous row lifecycle coverage before changing coordination.

### D2 / attempt 1

- State: testing
- Commit/worktree description: single cached-fragment lookup in `Rendering.createNodes`.
- Mechanism changed: use `WeakMap.get` and its `undefined` miss result instead of `has` followed by `get`; cached
  template-less definitions remain represented by `null`.
- Expected result: a small creation-path reduction with no duration or heap regression.
- Correctness validation: runtime-html package build/lint passed; 48 DOM tests passed with 9 pending.
- Tachometer started/completed timestamps: 2026-09-06T07:12:08.068Z / 2026-09-06T07:12:36.658Z.
- Duration summary: candidate 19.64-20.74ms vs base 19.81-22.81ms; delta -2.72ms to +0.47ms, no clear change.
- Heap summary: candidate 19.08-19.13 MiB vs base 19.08-19.11 MiB; delta -0.01 MiB to +0.04 MiB, no clear change.
- Decision: inconclusive; reverted because neither duration nor heap excludes zero.
- Follow-up: subsumed by the larger D3 cached marker-location experiment.

### D3 / attempt 1

- State: rejected
- Commit/worktree description: cache marker node paths per compiled definition.
- Mechanism changed: discover `<!--au-->` marker paths once on the cached source fragment, then resolve those paths in
  each clone instead of creating and traversing a comment TreeWalker per view.
- Expected result: lower creation/hydration time for inserted rows without changing target order or marker ownership.
- Correctness validation: runtime-html lint passed; 48 DOM tests passed with 9 pending.
- Tachometer started/completed timestamps: 2026-09-06T07:34:41.020Z / 2026-09-06T07:35:10.811Z.
- Duration summary: candidate 21.28-23.79ms vs base 20.66-23.51ms; delta -1.46ms to +2.35ms, no clear change.
- Heap summary: candidate 19.20-19.23 MiB vs base 19.07-19.11 MiB; delta +0.10 MiB to +0.15 MiB, higher.
- Decision: rejected; cached paths add retained metadata without a measurable duration benefit.
- Follow-up: retain native TreeWalker marker discovery.

### R1 / mixed attempt 1

- State: inconclusive
- Commit/worktree description: transfer the previous scope-array reference instead of cloning it.
- Mechanism changed: `_createScopes` preserves the old array by ownership transfer before assigning the new scopes;
  reconciliation reads but does not mutate that old array.
- Expected result: lower mixed-reconciliation allocation with no lifecycle or duplicate-key behavior change.
- Correctness validation: runtime-html build/lint passed; 6,539 Repeat tests passed with 4 pending.
- Tachometer started/completed timestamps: 2026-09-06T07:26:24.611Z / 2026-09-06T07:26:55.163Z.
- Duration summary: candidate 21.45-23.77ms vs base 21.10-23.57ms; delta -1.42ms to +1.97ms, no clear change.
- Heap summary: candidate 19.07-19.10 MiB vs base 19.07-19.11 MiB; delta -0.03 MiB to +0.02 MiB, no clear change.
- Decision: inconclusive in isolation; carried into the combined allocation attempt.
- Follow-up: test removal of the matched-index set and redundant deletion membership scan.

### R1 / mixed attempt 2

- State: inconclusive
- Commit/worktree description: consume matched scopes from the existing old-scope index map.
- Mechanism changed: delete each reused scope from `oldScopeToIndex`, then use the map's remaining ascending values
  as deleted indices instead of allocating a second `Set` and scanning every old index.
- Expected result: lower CPU and allocation for mixed keyed deletion/reuse while retaining ascending deletion order.
- Correctness validation: runtime-html build/lint passed; 198 focused keyed, duplicate, batched, and async-lifecycle
  tests passed. The ownership-only form passed the complete Repeat selection above.
- Tachometer started/completed timestamps: 2026-09-06T07:28:08.059Z / 2026-09-06T07:28:36.336Z.
- Duration summary: candidate 19.40-20.30ms vs base 19.53-20.39ms; delta -0.73ms to +0.51ms, no clear change.
- Heap summary: candidate 19.06-19.08 MiB vs base 19.06-19.10 MiB; delta -0.03 MiB to +0.01 MiB, no clear change.
- Decision: inconclusive; reverted both allocation changes because mixed reconciliation establishes no benefit.
- Follow-up: do not revisit without a focused reconciliation-only fixture large enough to resolve sub-millisecond work.

### R4 / attempt 1

- State: inconclusive
- Commit/worktree description: stable in-place compaction of surviving Repeat views.
- Mechanism changed: after deleted rows are released/deactivated, scan the sorted deletion indices and view array
  once, copy survivors forward, and truncate the same array instead of invoking `splice` per deletion.
- Expected result: reduce mixed reconciliation CPU with neutral or lower heap; retained view order and identity remain exact.
- Correctness validation: runtime-html lint passed; 198 focused keyed, duplicate, batched, and async-lifecycle tests passed.
- Tachometer started/completed timestamps: 2026-09-06T07:33:11.370Z / 2026-09-06T07:33:41.003Z.
- Duration summary: candidate 20.99-23.20ms vs base 20.42-21.62ms; delta -0.19ms to +2.33ms, no clear change.
- Heap summary: candidate 19.07-19.10 MiB vs base 19.08-19.11 MiB; delta -0.03 MiB to +0.01 MiB, no clear change.
- Decision: inconclusive with an unfavorable duration estimate; reverted.
- Follow-up: retain native `splice` unless a deletion-heavy focused benchmark establishes a compaction threshold.

### B4 / attempt 1

- State: inconclusive
- Commit/worktree description: reuse child view-model targets across nested renderer instructions.
- Mechanism changed: child element/attribute/template-controller renderers pass their already-created view model to
  set/property/interpolation/iterator renderers, which retain `getTarget` as the fallback for all other calls.
- Expected result: reduce repeated target classification and controller property reads while hydrating inserted rows.
- Correctness validation: runtime-html lint passed; 98 custom-element, binding-command, and repeated-custom-element tests passed.
- Tachometer started/completed timestamps: 2026-09-06T07:37:55.060Z / 2026-09-06T07:38:25.041Z; confirmation 2026-09-06T07:39:19.492Z / 2026-09-06T07:39:48.363Z.
- Duration summary: first delta -2.69ms to +0.72ms; confirmation delta -0.88ms to +1.07ms, both no clear change.
- Heap summary: first delta -0.02 MiB to +0.03 MiB; confirmation -0.04 MiB to 0.00 MiB, not consistently lower.
- Decision: inconclusive; reverted because the favorable duration estimate did not reproduce as a supported change.
- Follow-up: target selection needs a creation-focused startup fixture or a larger instruction batch to isolate it.

### B5 / attempt 1

- State: inconclusive
- Commit/worktree description: accessor-type-first property change queue check.
- Mechanism changed: after the active-state guard, test `atLayout` before reading whether the controller is activating.
- Expected result: reduce retained custom-element property-binding update overhead with identical layout scheduling.
- Correctness validation: runtime-html watcher build and lint passed; the existing property/custom-element integration
  paths remained green in the preceding 98-test renderer selection.
- Tachometer started/completed timestamps: 2026-09-06T07:41:04.827Z / 2026-09-06T07:41:33.742Z; duplicate confirmation 2026-09-06T07:41:33.748Z / 2026-09-06T07:42:02.252Z.
- Duration summary: first delta -1.88ms to +0.36ms; confirmation delta -0.78ms to +0.98ms, both no clear change.
- Heap summary: both intervals overlap zero.
- Decision: inconclusive; reverted because the favorable first estimate did not reproduce.
- Follow-up: investigate larger property-binding costs rather than branch-order micro-optimizations.

### O2 / attempt 1

- State: rejected
- Commit/worktree description: copy-on-write subscriber snapshots during active notification.
- Mechanism changed: iterate the stable current subscriber array directly; `add` or `remove` clones before mutation
  only when a value/collection or dirty notification is actively reading that array.
- Expected result: remove per-refresh fan-out arrays while preserving mutation and nested-dispatch behavior.
- Correctness validation: runtime lint and test compilation passed; 7 subscriber tests passed, including value,
  collection, dirty, mutation-during-dispatch, and nested notification behavior.
- Tachometer started/completed timestamps: 2026-09-06T07:50:31.345Z / 2026-09-06T07:50:59.712Z.
- Duration summary: candidate 19.27-20.96ms vs base 19.53-21.52ms; delta -1.71ms to +0.89ms, no clear change.
- Heap summary: candidate 19.16-19.18 MiB vs base 19.07-19.11 MiB; delta +0.07 MiB to +0.11 MiB, higher.
- Decision: rejected because two eager depth fields penalize every subscriber record.
- Follow-up: retain copy-on-write behavior for attempt 2 but replace eager per-record state with one erased/lazy depth property.

### O2 / attempt 2

- State: inconclusive
- Commit/worktree description: one type-only/lazy reentrant notification-depth property.
- Mechanism changed: value, collection, and dirty dispatch share one depth guard; records without multi-subscriber
  notification have no emitted counter field, and only records that fan out acquire it.
- Expected result: preserve attempt 1's avoided snapshots without its application-wide retained-field penalty.
- Correctness validation: runtime lint passed; all 7 subscriber mutation/nesting tests passed.
- Tachometer started/completed timestamps: 2026-09-06T07:53:13.679Z / 2026-09-06T07:53:42.951Z.
- Duration summary: candidate 20.17-22.05ms vs base 20.39-21.71ms; delta -1.08ms to +1.21ms, no clear change.
- Heap summary: candidate 19.07-19.09 MiB vs base 19.08-19.12 MiB; delta -0.05 MiB to 0.00 MiB, no clear change.
- Decision: inconclusive; reverted because copy-on-write complexity remains unsupported.
- Follow-up: retain the mutation-semantics tests but keep eager snapshots.

### O3 / attempt 1

- State: inconclusive
- Commit/worktree description: callback-presence guard for SetterObserver's reentrancy comparison.
- Mechanism changed: perform the second `areEqual` only when `_callback` exists; callback-bearing observers retain
  the same stale-value suppression after reentrant notification.
- Expected result: reduce ordinary observed scope/property writes with neutral heap.
- Correctness validation: runtime lint passed; all 7 subscriber tests and 818 property-observation tests passed.
- Tachometer started/completed timestamps: 2026-09-06T07:56:35.247Z / 2026-09-06T07:57:03.731Z.
- Duration summary: candidate 19.80-22.23ms vs base 20.40-23.72ms; delta -3.10ms to +1.01ms,
  no clear change.
- Heap summary: candidate 19.08-19.12 MiB vs base 19.09-19.12 MiB; delta -0.03 MiB to +0.03 MiB,
  no clear change.
- Decision: inconclusive; reverted because neither duration nor retained heap separated from zero.
- Follow-up: investigate binding reconnection/evaluation work with higher per-update leverage.

### O4 / attempt 1

- State: inconclusive
- Commit/worktree description: single membership lookup in `BindingObserverRecord.add`.
- Mechanism changed: use `Map.get(observer) === undefined` to detect an untracked dependency before the existing
  subscribe/count/set sequence, replacing the separate `Map.has` probe.
- Expected result: reduce dependency-connection lookup work for every evaluated binding with neutral retained heap.
- Correctness validation: runtime lint passed.
- Tachometer started/completed timestamps: 2026-09-06T07:59:31.137Z / 2026-09-06T08:00:00.378Z.
- Duration summary: candidate 20.08-21.47ms vs base 20.31-21.59ms; delta -1.11ms to +0.77ms,
  no clear change.
- Heap summary: candidate 19.08-19.12 MiB vs base 19.08-19.11 MiB; delta -0.018 MiB to +0.037 MiB,
  no clear change.
- Decision: inconclusive; reverted because neither metric separated from zero.
- Follow-up: revisit only under startup if dependency connection is shown to dominate a profile.

### B1 / attempt 1

- State: adopted
- Commit/worktree description: skip no-op property-expression bind lifecycle dispatch.
- Mechanism changed: ordinary property AST kinds bypass `astBind`; binding behaviors, value converters, and iterator
  expressions retain the general recursive lifecycle path; custom expressions are explicitly accepted and retain
  their `bind`/`unbind` lifecycle callbacks.
- Expected result: reduce one function call and AST-kind dispatch for each ordinary property binding initialized.
- Correctness validation: runtime-html lint had no errors (14 pre-existing warnings); its DEV_MODE package build passed;
  52 focused binding-behavior, value-converter, and repeat lifecycle tests passed.
- Tachometer started/completed timestamps: 2026-09-06T08:15:47.487Z / 2026-09-06T08:15:58.871Z;
  confirmation 2026-09-06T08:17:50.150Z / 2026-09-06T08:18:01.615Z. An earlier run was discarded
  because a non-DEV_MODE package build changed bundle provenance and size.
- Duration summary: first clean delta -7.37ms to -2.19ms (-6.66% to -2.06%); confirmation -8.16ms to
  -0.56ms (-7.33% to -0.62%). Both favor the candidate.
- Heap summary: immediate post-startup used heap was +1.06 to +1.13 MiB first and +0.52 to +1.22 MiB on
  confirmation. This measurement is taken without forced GC and may reflect the faster candidate reaching the
  measurement sooner; validate retained live-list and post-teardown heap with `heap-lifecycle.json`.
- Decision: retain the reproducible startup-time improvement. The dedicated forced-GC lifecycle result below found
  no clear retained-memory difference at its measured precision.
- Follow-up: expand the fast lifecycle guard to interpolation parts only if profiling supports it.

### B1 / forced-GC validation

- State: adopted
- Baseline: finalized B1 fast path including explicit custom-expression lifecycle support.
- Candidate: general `astBind` call restored for every property binding; all other adopted changes remain identical.
- Expected result: if B1 has no retained-memory cost, removing it will not clearly reduce live-list or post-teardown
  heap after forced GC.
- Correctness validation: custom expression type/lifecycle test passes with the general candidate and fast baseline.
- Tachometer started/completed timestamps: 2026-09-06T09:26:04.266Z / 2026-09-06T09:26:19.985Z.
- Live-list heap summary: candidate without B1 was -0.01 to +0.02 MiB (-0.10% to +0.17%) relative to the
  finalized B1 baseline, so there is no clear retained-heap change.
- Post-teardown heap summary: candidate without B1 was -0.07 to +0.06 MiB (-2.58% to +2.23%) relative to the
  finalized B1 baseline, so there is no clear retained-heap change after teardown.
- Decision: adopted. Forced GC found no clear retained-memory increase, and the startup benchmark's reproducible
  time improvement remains. The fast dispatch explicitly retains lifecycle
  binding for `CustomExpression`, `ForOfStatement`, value converters, and binding behaviors.

### C2 / attempt 1

- State: adopted
- Commit/worktree description: reuse root lifecycle-hook lookup for child containers without local hooks.
- Mechanism changed: `LifecycleHooks.resolve` returns the cached root lookup directly when a controller's child
  container has no locally registered `ILifecycleHooks`, avoiding a per-container lookup object, WeakMap entry,
  root hook resolution, and entry-array construction.
- Expected result: reduce controller hydration time and retained heap for each repeated custom-element container.
- Correctness validation: runtime-html lint had no errors (14 pre-existing warnings); 26 focused lifecycle-hook
  resolution, combined-hook, binding, and attached tests passed.
- Tachometer started/completed timestamps: 2026-09-06T08:20:31.724Z / 2026-09-06T08:20:58.929Z;
  confirmation 2026-09-06T08:21:53.643Z / 2026-09-06T08:22:21.572Z.
- Duration summary: first delta -3.92ms to +4.38ms; confirmation -9.11ms to +4.59ms, no clear change.
- Heap summary: first delta -154 KiB to -115 KiB (-0.89% to -0.67%); confirmation -124 KiB to -89 KiB
  (-0.72% to -0.52%). Both favor the candidate.
- Decision: adopted because the retained lookup reduction reproduced and the implementation reuses the exact root
  lookup only when the child container has no local hook resolver.
- Follow-up: verify the reduction in the forced-GC lifecycle fixture after completing startup experiments.

### C3 / attempt 1

- State: adopted
- Commit/worktree description: intern controller hook descriptors by exact presence mask.
- Mechanism changed: hook presence is still checked on every view-model instance, including own properties, but the
  resulting eleven-bit shape reuses one immutable `HooksDefinition` instead of retaining one object per controller.
- Expected result: reduce controller initialization assignments and retained heap with no lifecycle behavior change.
- Correctness validation: runtime-html lint had no errors (14 pre-existing warnings); all 78 lifecycle-hook tests passed.
- Tachometer started/completed timestamps: 2026-09-06T08:24:32.596Z / 2026-09-06T08:25:00.564Z;
  confirmation 2026-09-06T08:26:02.427Z / 2026-09-06T08:26:29.528Z.
- Duration summary: first delta -4.83ms to +4.68ms; confirmation -2.61ms to +5.18ms, no clear change.
- Heap summary: first delta -148 KiB to -101 KiB (-0.86% to -0.59%); confirmation -180 KiB to -130 KiB
  (-1.05% to -0.76%). Both favor the candidate.
- Decision: adopted because the retained descriptor reduction reproduced while exact per-instance hook detection remains.
- Follow-up: verify forced-GC live-list and teardown behavior with `heap-lifecycle.json`.

### B6 / attempt 1

- State: inconclusive
- Commit/worktree description: short-circuit SSR instruction classification in client rendering.
- Mechanism changed: the renderer's inner instruction loop tests `isHydrating` before comparing instruction kinds
  that consume SSR child scopes, reducing normal client rendering to one predictable false branch.
- Expected result: reduce instruction dispatch overhead across every rendered row with neutral heap.
- Correctness validation: runtime-html lint had no errors (14 pre-existing warnings).
- Tachometer started/completed timestamps: 2026-09-06T08:28:00.320Z / 2026-09-06T08:28:27.203Z.
- Duration summary: delta -2.59ms to +4.66ms (-2.38% to +4.27%), no clear change.
- Heap summary: delta -32 KiB to +19 KiB (-0.19% to +0.11%), no clear change.
- Decision: inconclusive; reverted because neither metric separated from zero.
- Follow-up: retain the general renderer loop unless a dedicated instruction-dispatch profile shows this branch hot.

### B1 / attempt 2

- State: inconclusive
- Commit/worktree description: skip no-op interpolation-part bind lifecycle dispatch.
- Mechanism changed: simple interpolation expressions bypass `astBind`; value converters and binding behaviors retain
  recursive lifecycle setup.
- Expected result: reduce one call and AST-kind dispatch for every simple interpolation part initialized.
- Correctness validation: covered by the 52 focused behavior/converter/interpolation-adjacent lifecycle tests from
  attempt 1; runtime-html lint had no errors.
- Tachometer started/completed timestamps: 2026-09-06T08:29:41.700Z / 2026-09-06T08:30:08.416Z.
- Duration summary: delta -1.32ms to +6.97ms (-1.25% to +6.46%), no clear change.
- Heap summary: delta -16 KiB to +30 KiB (-0.09% to +0.18%), no clear change.
- Decision: inconclusive; reverted because neither metric separated from zero.
- Follow-up: keep the interpolation lifecycle path general.

### C1 / attempt 1

- State: inconclusive
- Commit/worktree description: iterative activation-stack ancestor entry.
- Mechanism changed: `_enterActivating` increments the same controller/ancestor counters with one loop instead of a
  recursive method call per ancestor.
- Expected result: reduce controller-tree call overhead during synchronous startup with neutral heap.
- Correctness validation: runtime-html lint had no errors (14 pre-existing warnings).
- Tachometer started/completed timestamps: 2026-09-06T08:31:20.800Z / 2026-09-06T08:31:47.459Z.
- Duration summary: delta -2.68ms to +5.48ms (-2.48% to +5.04%), no clear change.
- Heap summary: delta -23 KiB to +29 KiB (-0.13% to +0.17%), no clear change.
- Decision: inconclusive; reverted because neither metric separated from zero.
- Follow-up: profile the matching leave/attached cascade before revisiting activation-stack structure.

### A1 / attempt 2

- State: inconclusive
- Commit/worktree description: boundary-local access-scope context resolution.
- Mechanism changed: zero-ancestor expressions in a boundary scope resolve override/binding context inline; all
  traversable and ancestor-qualified scopes retain `Scope.getContext` behavior.
- Expected result: reduce context-search call overhead for bindings inside every repeated custom element.
- Correctness validation: runtime lint passed.
- Tachometer started/completed timestamps: 2026-09-06T08:33:02.985Z / 2026-09-06T08:33:30.018Z.
- Duration summary: delta -3.71ms to +5.16ms (-3.41% to +4.73%), no clear change.
- Heap summary: delta -27 KiB to +22 KiB (-0.16% to +0.13%), no clear change.
- Decision: inconclusive; reverted because neither metric separated from zero, consistent with attempt 1 on refresh.
- Follow-up: do not add scope-boundary branching without a focused profile identifying context lookup as dominant.

### D4 / attempt 1

- State: rejected
- Commit/worktree description: single-pass fragment marker transformation and target collection.
- Mechanism changed: TreeWalker marker results are transformed immediately with one-node lookahead; only resolved
  targets are retained, eliminating the temporary marker array and second marker traversal.
- Expected result: reduce node-sequence hydration time and transient allocation for every cloned row template.
- Correctness validation: runtime-html lint had no errors.
- Tachometer started/completed timestamps: 2026-09-06T08:36:07.789Z / 2026-09-06T08:36:34.825Z.
- Duration summary: delta -2.01ms to +5.67ms (-1.85% to +5.16%), no clear change.
- Heap summary: delta +24 KiB to +60 KiB (+0.14% to +0.36%), higher.
- Decision: rejected and reverted because single-pass traversal did not improve time and increased heap.
- Follow-up: retain native TreeWalker collection plus the fixed-size target transformation loop.

### B7 / attempt 1

- State: adopted
- Commit/worktree description: lazy queue and target-subscriber fields on `PropertyBinding`.
- Mechanism changed: ordinary bindings no longer emit initial own properties for layout-queue and from-view subscriber
  state; those properties are created only when the corresponding uncommon path is used.
- Expected result: reduce property-binding construction work and retained heap across all ordinary to-view bindings.
- Correctness validation: the emitted development bundle contains neither eager assignment; 16 focused layout-queue,
  update-trigger, two-way integration, and focus-adjacent tests passed.
- Tachometer started/completed timestamps: 2026-09-06T08:38:43.870Z / 2026-09-06T08:39:11.108Z;
  confirmation 2026-09-06T08:40:31.718Z / 2026-09-06T08:40:59.657Z.
- Duration summary: first delta -3.57ms to +4.25ms; confirmation -2.87ms to +5.60ms, no clear change.
- Heap summary: first delta -117 KiB to -86 KiB (-0.69% to -0.51%); confirmation -123 KiB to -72 KiB
  (-0.73% to -0.42%). Both favor the candidate.
- Decision: adopted because lazy absence is equivalent to false/nullish on all reads and the retained reduction reproduced.
- Follow-up: validate live-list/post-teardown heap with forced GC.

### B8 / attempt 1

- State: inconclusive
- Commit/worktree description: lazy interpolation queue and dirty fields.
- Mechanism changed: interpolation owners omit `_isQueued` and stable interpolation parts omit `_isDirty`; the existing
  update paths materialize the properties when their true state is first needed.
- Expected result: reduce binding construction writes and retained heap for stable rendered text/attributes.
- Correctness validation: existing interpolation behavior remained covered by the focused binding suites.
- Tachometer started/completed timestamps: 2026-09-06T08:42:07.450Z / 2026-09-06T08:42:34.597Z.
- Duration summary: delta -4.32ms to +5.12ms (-3.90% to +4.62%), no clear change.
- Heap summary: delta -3 KiB to +42 KiB (-0.02% to +0.25%), no clear change.
- Decision: inconclusive; reverted because removing one field per shape did not measurably reduce object size.
- Follow-up: consider field packing only as a larger coordinated layout change with heap-object evidence.

### C4 / attempt 1

- State: adopted
- Commit/worktree description: definition-keyed bindable-name cache.
- Mechanism changed: `createObservers` enumerates each bindables record once and reuses the resulting name array for
  all controller instances sharing it.
- Expected result: reduce repeated reflection and transient arrays during row-controller hydration.
- Correctness validation: 231 bindable coercion, primary-bindable, custom-element, and custom-attribute tests passed.
- Tachometer started/completed timestamps: 2026-09-06T08:44:22.865Z / 2026-09-06T08:44:50.206Z;
  confirmation 2026-09-06T08:45:23.813Z / 2026-09-06T08:45:51.189Z.
- Duration summary: first delta -3.09ms to +5.33ms; confirmation -8.09ms to +6.71ms, no clear change.
- Heap summary: first delta -44 KiB to -8 KiB (-0.26% to -0.05%); confirmation -56 KiB to -9 KiB
  (-0.33% to -0.05%). Both narrowly favor the candidate.
- Decision: adopted because the allocation reduction reproduced and framework definitions are immutable once consumed;
  the cache is weakly keyed by the exact bindables record.
- Follow-up: confirm the cumulative reduction in the forced-GC lifecycle fixture.

### O10 / attempts 1-2

- State: adopted
- Commit/worktree description: sole-subscriber removal fast path using `Array.pop`.
- Mechanism changed: when the requested subscriber is the only value subscriber, remove it directly and clear the
  corresponding sole dirty subscriber when present; retain the existing search/splice path for zero, mismatched, and
  multi-subscriber records.
- Profile evidence: stale dependency unsubscribe was prominent in the refresh CPU profile. The focused benchmark
  exercises one retained and one replaced dependency per evaluation.
- Rejected variant: assigning `length = 0` made fresh/discarded observers 11.04% to 20.99% faster but made a warmed,
  repeatedly reused observer pool 10.57% to 19.23% slower. It was rejected as a lifecycle tradeoff.
- Focused result: the `pop` candidate improved warmed cached rotation by 13.80% to 19.19%; confirmation improved it
  by 13.82% to 17.64%. Fresh-record rotation was inconclusive in both runs (-0.16% to +4.41%, then -0.87% to +2.72%).
- Realistic guard: keyed refresh latency was inconclusive at -6.30% to +6.24%, and immediate heap was neutral at
  -0.06% to +0.07%.
- Correctness validation: the runtime package build and lint passed; all 49,388 Node runtime tests passed, including
  focused coverage for sole ordinary removal/re-add, dirty-state cleanup/re-add, mismatched removal,
  multi-subscriber removal, and mutation during value, dirty, and collection notifications.
- Decision: adopted because the focused cached-observer improvement reproduced without a fresh-observer, real-DOM,
  or heap regression.

### B1+B7+C2+C3+C4 / exact-revision interaction validation

- State: rejected; reverted by `a6e7a13ef6`. O10 remains adopted.
- Revisions: `ae44897b38d2076a6c2d38604504a5d6068aa26d` base and
  `547b5d40332d303e840a91c4a69f8303ec599fef` candidate, rebuilt from isolated source/package graphs.
- Trigger: exact-revision CI and local reruns found a reproducible realistic mixed-reconciliation regression despite
  individually favorable or neutral live results for the allocation changes.
- Exact candidate result: realistic refresh was 0.54% to 6.89% slower, mixed reconciliation was 15.89% to 23.46%
  slower, and live-list heap after GC was 1.37% to 1.52% lower. The warmed refresh loop was neutral.
- Isolation result: restoring all subscriber behavior was neutral for refresh and mixed reconciliation. Restoring
  PropertyBinding plus all controller/lifecycle behavior recovered 14.08% to 17.87% on mixed reconciliation;
  restoring either group alone was neutral. PropertyBinding plus old hook handling and either old bindable-name
  lookup or old lifecycle lookup also recovered mixed performance, while the other tested subsets did not identify
  one independently causal optimization.
- Engine evidence: the regression remained under `--no-opt`, shrank substantially under `--jitless`, and was not
  removed by warming. Sampling profiles placed the manifestation around NodeSequence/DOM insertion, not inside a
  changed subscriber method.
- Decision: retain the subscriber-collection improvements, including O10's sole-subscriber removal fast path. Revert B1, B7, C2, C3, and C4 as a
  group because their combined allocation/object/code-layout interaction regressed an authoritative real-DOM path.
  Do not re-adopt one of these entries solely from an isolated live result; require exact-revision mixed, refresh,
  dependency-rotation, and heap guards.

### O11 / attempt 1

- State: rejected and reverted.
- Commit/worktree description: retain the lazy prototype `obs` getter but store its first `BindingObserverRecord` in
  an internal symbol property with ordinary assignment, avoiding `Reflect.defineProperty`; leave subscriber-record
  storage unchanged.
- Profile evidence: the three-start baseline attributed 20.70ms self to `rtDefineHiddenProp`. Caller attribution
  assigned roughly 11.6ms to `getObserverRecord` and 9.1ms to `getSubscriberRecord`.
- Startup result: candidate 108.86-115.87ms versus base 115.94-123.81ms; delta -12.78ms to -2.23ms
  (-10.51% to -2.02%), faster. Candidate `rtDefineHiddenProp` profile time fell to 12.01ms.
- Focused result: fresh dependency rotation improved 0.15% to 1.53%; cached dependency rotation improved 18.19% to
  20.37%.
- Heap result: immediate startup heap was 2.88% to 5.57% higher, but after forced GC the live 500-row list was 1.31%
  to 1.52% lower and post-teardown heap was neutral.
- Real-DOM guards: keyed refresh regressed 0.74% to 8.01%; mixed reconciliation regressed 17.68% to 23.25%. Their
  immediate heap readings were respectively 3.34% to 3.52% and 3.50% to 3.67% lower.
- Decision: reject. A different observer-record storage/shape independently recreates the same faster-focused-work,
  lower-heap, slower-realistic-rendering pattern seen in the reverted allocation set. Do not optimize
  `rtDefineHiddenProp` by changing connectable record representation without exact refresh and mixed guards.

### D9 / attempt 1

- State: rejected and reverted.
- Commit/worktree description: on the first class binding update, when the element starts with no classes and the CSS
  mapping is empty, populate removal bookkeeping but install the normalized class string with one `className`
  assignment; retain `classList` diffing for every later update and all mapped/static-class cases.
- Expected result: reduce initial JS-to-DOM calls without repeating D5's rejected variadic `classList.add` approach.
- Startup result: candidate 112.54-118.73ms; delta -3.99ms to +4.81ms (-3.47% to +4.18%), no clear change.
  Immediate heap was 1.13% to 3.58% lower.
- Profile result: `_flushChanges` remained 9.10ms self / 12.34ms inclusive versus 9.19ms / 14.40ms in the adjacent
  candidate profile; sampling does not establish a reduction in its own work.
- Decision: reject. The narrower DOM assignment did not improve end-to-end startup or clearly remove the profiled
  accessor cost.

### O11 / attempt 2

- State: rejected and reverted.
- Commit/worktree description: store lazy connectable observer records in a module-local `WeakMap`, preserving the
  prototype `obs` getter while leaving each binding object's own-property shape unchanged.
- Expected result: avoid `Reflect.defineProperty` without the symbol attempt's binding-shape change and real-DOM
  regression.
- Startup result: candidate 116.48-120.86ms; delta -2.28ms to +5.67ms (-1.98% to +4.88%), no clear change.
  Immediate heap was 5.54% to 7.94% higher.
- Profile result: `getObserverRecord` became the largest named framework self-time frame at 33.77ms, reflecting the
  repeated `WeakMap.get` path; the three-start workload increased to 508.40ms.
- Decision: reject without further guards because the primary startup metric did not improve and both profile cost
  and immediate heap worsened. Retain the own non-enumerable `obs` property installed on first access.

### D8 / workload applicability investigation

- State: inconclusive; no code change.
- Finding: the root compiled template has one instruction target, but the hot repeated-row definition has eight
  instruction targets and one root article after marker removal. Therefore zero/single-target specialization does
  not apply to the 1,000 repeated controllers responsible for most node-sequence construction in this workload.
- Decision: retain D8 for a focused simple-template fixture; do not use realistic startup to accept it.

### D10 / attempt 1

- State: rejected and reverted after forced-GC lifecycle validation.
- Commit/worktree description: reuse the array returned by native marker collection as `FragmentNodeSequence`'s
  target array, overwriting each marker only after traversal has completed.
- Expected result: remove one eight-element array allocation and eight copy writes for each realistic row without
  repeating D4's DOM mutation during TreeWalker traversal.
- Startup result: candidate 117.21-122.83ms versus base 114.59-125.51ms; delta -6.17ms to +6.11ms
  (-5.14% to +5.09%), no clear change. Immediate heap was 0.10-0.49 MiB lower (-2.86% to -0.61%).
- Clean-baseline confirmation: candidate 112.12-117.17ms versus base 111.77-116.52ms; delta -2.97ms to +3.96ms
  (-2.61% to +3.48%), again no clear duration change. Immediate heap was 0.06-0.40 MiB lower
  (-2.46% to -0.38%), reproducing the allocation signal with base bundle `e5fd2030` and candidate `c2f180df`.
- Profile result: `FragmentNodeSequence` measured 32.15ms self / 46.98ms inclusive versus 24.82ms / 39.47ms in
  the preceding restored profile, so sampling provides no CPU evidence for the candidate.
- Correctness validation: the runtime-html package build passed, package lint reported no errors, and the focused
  Node/JSDOM DOM suite passed 48 tests with 9 existing pending.
- Forced-GC result: live-list heap increased by 0.05-0.06 MiB (+0.47% to +0.61%); post-teardown heap was neutral at
  -0.03 MiB to +0.05 MiB (-1.20% to +1.91%). Base bundle was `e5fd2030`; candidate was `c2f180df`.
- Decision: reject. The reproducibly lower immediate heap represents less temporary garbage before collection, but
  the reused push-grown marker arrays retain more live memory than the original exact-length target arrays. With
  neutral duration and higher forced-GC live heap, preserving the separate fixed-size target array is preferable.

### K1 / attempt 1

- State: rejected and reverted.
- Commit/worktree description: cache `getDependencies(Type)` within `Container.invoke` and construct directly when
  it is empty, while retaining the active-container bracket required by field-initializer `resolve()` calls.
- Expected result: avoid mapping and spreading an empty dependency array for each zero-dependency row component.
- Startup result: candidate 115.47-122.96ms versus base 115.30-124.49ms; delta -6.61ms to +5.25ms
  (-5.50% to +4.36%), no clear change. Immediate heap was also neutral (-2.37% to +0.60%).
- Run note: the benchmark and profile completed before an unrelated `subscriber-count.json` fixture-change event
  marked the status cancelled and rebased the live session; the completed measurements above retain the original
  baseline hash.
- Decision: reject. Removing empty dependency-array work is too small to affect end-to-end startup.

### O5 / attempt 2

- State: rejected and reverted.
- Commit/worktree description: store the `SetterObserver` under a module-owned symbol on the installed getter,
  eliminating the second `getObserver` closure and temporary `Object.assign` object while retaining the generic
  `getObserver` fallback for decorators and custom getters.
- Preliminary startup evidence: three string-slot runs were faster twice and neutral once; the collision-safe symbol
  run was 0.21% to 6.64% faster. A later startup run was discarded because package-build output changed during the
  comparison and its base/candidate transfer sizes were not comparable.
- Realistic refresh guard: duration was inconclusive at -0.79% to +10.28%; immediate heap was 4.02% to 4.22% lower.
- Realistic mixed guard: duration regressed 16.36% to 25.74%; immediate heap was 3.88% to 4.30% lower.
- Correctness validation: the runtime build and lint passed. A generic rediscovery test covers recovering the same
  observer from its installed property descriptor after its `$observers` cache entry is removed.
- Decision: reject. Changing the installed getter's representation recreates the lower-heap but substantially slower
  real-DOM reconciliation pattern seen in O11 and the reverted allocation group. Do not retain this optimization for
  its isolated startup signal.

### D1 / call-shape investigation

- State: inconclusive; no code change.
- Finding: an unmounted `FragmentNodeSequence` already inserts its whole `DocumentFragment` with one native call.
  Mounted sequences move one top-level node per call, but the realistic repeated view has exactly one top-level
  `article`, so each moved row already uses the minimum one `insertBefore` call.
- Decision: there is no contiguous-node batching opportunity in the measured startup or mixed workloads. A
  multi-root focused fixture would be required before considering a Range- or fragment-based move path.

### C5 / attribution investigation

- State: inconclusive; no code change.
- Profile evidence: across three realistic starts, generic DI `get` accounted for 7.67ms self / 12.37ms inclusive
  with only six samples; `resolve` and `invoke` had 3.87ms and 2.05ms self time respectively.
- Finding: repeated controller observer/coercion lookups are container-sensitive. Caching across controllers would
  bypass supported child-container overrides or require invalidation when registrations change. Rendering already
  caches its root-scoped platform, parser, and observer locator once.
- Decision: the attributable time is too small and sparse to justify weakening container semantics. Revisit only if
  a service-key/call-site profile identifies one immutable resolver with a larger end-to-end share.

### D6 / attempt 2

- State: inconclusive and reverted.
- Commit/worktree description: primitive content-binding values bypass the native platform `Node` `instanceof` test;
  object values retain the existing DOM-node insertion and placeholder path.
- Benchmark: the warmed 20x1,000 keyed refresh loop at 20 samples.
- Duration summary: total refresh delta -60.54ms to +23.86ms (-3.69% to +1.45%); median single-refresh delta
  -2.04ms to +0.93ms (-2.64% to +1.20%). Both cross zero.
- Decision: attempt 1 and the lower-variance warmed loop both failed to establish an end-to-end improvement. Retain
  the direct `instanceof` path unless a content-only benchmark demonstrates a meaningful isolated threshold.

### D1 / call-shape investigation

- State: inconclusive; no code change.
- Finding: an unmounted `FragmentNodeSequence` already inserts all of its nodes with one native
  `insertBefore(DocumentFragment, location)` call. A mounted sequence must move its nodes individually, but the hot
  realistic repeated-row definition has exactly one root article, so each moved row already uses the minimum one
  native insertion. The LIS reconciliation also already avoids moving rows whose relative order is stable.
- Decision: there is no contiguous-node batching opportunity in startup or realistic mixed reconciliation. Revisit
  only with a measured multi-root movement workload; grouping single-root rows would add bookkeeping without reducing
  DOM calls.

### D8 / attempt 1

- State: inconclusive and reverted.
- Commit/worktree description: pass the compiled target count into `FragmentNodeSequence`; skip marker traversal for
  zero-target fragments and use a no-array first-marker path for single-target fragments.
- Focused result: on the existing 10,000-row single-target startup fixture, duration was inconclusive at -4.16% to
  1.20%. Immediate heap was 0.33-0.47 MiB lower (-2.19% to -1.57%).
- Interpretation: the heap signal matches removal of 10,000 short-lived one-element marker arrays. They are not
  retained after construction, and the allocation reduction did not improve startup duration.
- Decision: revert rather than add a target-count invariant and special branches for a transient allocation whose
  end-to-end cost did not separate from noise.
