# Aurelia benchmarks

This directory compares exact Aurelia revisions under one benchmark harness. It provides performance evidence for
maintainers without turning noisy browser measurements into an automatic merge gate.

## Comparison model

A pull-request run freezes three revisions:

```text
base SHA ──────── clean install → release build → packed package graph → base bundles
                                                              │
test-merge SHA ─ clean install → release build → packed package graph → candidate bundles
                                                              │
candidate harness ─────────────────────────────────────────────┴→ interleaved samples
```

The candidate is GitHub's test merge of the frozen base and PR head. CircleCI verifies both merge parents before it
builds anything. A master run compares the current commit with its first parent.

Each revision gets its own source snapshot, clean install, and release build. The builder discovers the internal
`@aurelia/runtime-html` package closure, packs those packages, and installs them into an isolated graph. Both graphs
are then bundled with the same candidate-owned fixture source and Rollup configuration. This prevents workspace links
or root dependencies from mixing the two revisions.

`results/variants/provenance.json` records the revisions, source trees, package graph, tool versions, resolved entry
points, bundle hashes, and harness hash. Authoritative reports require a clean candidate harness and the exact result
set for their profile.

## CI profiles

| Profile | Trigger | Purpose |
| --- | --- | --- |
| `smoke` | `/ci full` | A stable subset, including the realistic keyed refresh workload. |
| `full` | `/ci bench` | The complete PR comparison, including startup, reconciliation, and after-GC heap scenarios. |
| `master` | Push to `master` | The complete suite against the current commit's first parent. |

PR reporting currently supports same-repository PRs targeting `master`. The trusted GitHub workflow updates one
marker comment. It discards results when the PR base, head, or test merge changes while CircleCI is running. PR code
never receives the GitHub write token.

## Run locally

Use the repository's pinned Node and npm versions. Install the root workspace and make sure Chrome is available.
Commands below run from `benchmarks/`.

### Live optimization loop

For fast local iteration against the workspace package watchers, run from the repository root:

```sh
npm run dev -- --bench app-repeat-realistic/refresh.json
```

This mode skips exact-revision preparation, clean installs, release builds, and package packing. It incrementally
bundles the selected fixture against the workspace production entry points, captures the first settled bundle as the
session baseline, and reruns Tachometer after relevant package or fixture changes. The default minimum is 20 samples;
override it with `--bench-samples <count>`.

The mini-app bundler waits for 15 seconds without another input change before rebuilding. This coalesces the
JavaScript, declaration, and dependent-package output phases before Rollup performs its bundle and minification work.
Use `--bench-debounce <milliseconds>` to tune this quiet period (minimum 250ms) for a local build with a longer burst.
The runner also fingerprints the executable bundle and suppresses benchmark runs when a later rebuild is
byte-for-byte identical.

Completed results are written to `benchmarks/live-results/results/latest.json`, with previous completed runs appended to
`history.jsonl`. `status.json` reports whether the runner is active, complete, or failed. Use `--bench-output <folder>`
to select another output directory. Each Tachometer run copies its base and candidate bundles to an immutable active
snapshot first, so an edit made during sampling is deferred to the next run instead of mixing builds.

Changing the fixture resets the session baseline automatically. Restart the command when an explicit new baseline is
preferred. Live results are intended for optimization feedback; confirm promising changes with the exact-revision
workflow below before treating them as benchmark evidence. Chrome and a compatible ChromeDriver must be locally
available, as with the other Tachometer commands.

### Live CPU profiles

Use Chrome's sampling profiler to rank measured hotspots before selecting an optimization theory:

```sh
npm run dev -- --profile startup
npm run dev -- --profile refresh
```

Profiling uses the same package watchers and a second, unminified source-mapped output from the same Rollup build.
It does not run Tachometer unless `--bench` is also supplied. Startup profiling prepares modules and deterministic
records before capture, then profiles one real-DOM application start by default. Refresh profiling creates and warms
the application first, prepares every replacement collection outside the measured region, then profiles 50 settled
real-DOM refreshes. Override either count with `--profile-iterations <count>`.

The latest raw Chrome profile is written to
`benchmarks/live-results/profiles/<mode>-latest.cpuprofile`. The corresponding
`<mode>-summary-latest.json` ranks frames by self time and includes inclusive time, sample count, source location,
and a framework-only ranking. `status.json` reports capture state. Use `--profile-output <folder>` to select another
directory. Chrome DevTools can open the `.cpuprofile` directly.

The profiler identifies expensive functions; it is not comparative performance evidence. After changing a measured
hotspot, keep the profile watcher running for diagnostic feedback and use the matching live Tachometer configuration
to decide whether end-to-end duration improved. Both can run after each rebuild when requested together:

```sh
npm run dev -- --bench app-repeat-realistic/refresh.json --bench-samples 10 --profile refresh
```

When a likely refresh optimization is smaller than the confidence interval of the single-refresh scenario, use the
local diagnostic loop. It performs five warm-up refreshes, then reports both total time and the median of 20
individually timed settled refreshes per Tachometer sample. The median isolates typical hot-path latency while total
time retains GC and allocation costs; record creation and correctness assertions remain outside both intervals:

```sh
npm run dev -- --bench app-repeat-realistic/refresh-loop.json --bench-samples 20 --profile refresh --profile-iterations 100
```

This loop is intended to distinguish small hot-path changes locally. Keep `refresh.json` as the authoritative
single-interaction result and confirm any candidate there before adoption.

For changes to AST dependency connection, observer lookup, or stale subscription rotation, remove DOM-write noise
with the focused browser-engine scenario:

```sh
npm run dev -- --bench app-repeat-realistic/dependency-rotation.json --bench-samples 20
```

It reports both fresh-record rotation, which includes observer creation and disposal, and cached rotation through a
warmed observer pool, which isolates repeated AST connection and subscription cleanup. The focused result establishes
whether the binding/observation mechanism improved. A retained candidate must still pass `refresh-loop.json` or the
authoritative real-DOM `refresh.json` as a regression guard.

Run the harness tests:

```sh
npm run bench:test
```

Prepare exact bundles for the checked-out commit and its parent:

```sh
npm run bench:variants -- --base HEAD~1 --candidate HEAD --profile master --output results/variants
```

Variant preparation intentionally performs two clean installs and release builds. It refuses to overwrite an
existing output directory. Keep the top level of `results/` free of extra JSON result files because the report builder
rejects unexpected artifacts. `results/variants/provenance.json` is required.

Run an individual scenario after preparing `results/variants`:

```sh
npm run bench:realistic-refresh
npm run bench:realistic-heap500
```

`npm run bench` is a convenience batch of common local scenarios. It is not the formal `full` profile. Once every
result required by the selected provenance profile exists, build the machine-readable and Markdown report with:

```sh
npm run bench:report
```

An A/A run proves that variant preparation produces byte-identical bundles for identical source:

```sh
npm run bench:variants -- --base HEAD --candidate HEAD --profile master --output results/a-a-variants --expect-identical
```

## Reading the results

Tachometer interleaves base and candidate samples and computes 95% confidence intervals. “No clear change” means the
difference interval includes zero. It does not prove that the revisions are identical. Results remain advisory while
the suite gathers enough history to establish scenario-specific variance and practical thresholds.

The report uses four kinds of evidence:

- **Duration** uses the boundary declared by each scenario. Startup fixtures require synchronous `Aurelia.start()`;
  update and reconciliation scenarios await their scheduled framework work. Correctness assertions run outside the
  measured interval.
- **Immediate used JS heap** is Chrome's point-in-time reading after completed work and before assertion traversals. It
  does not force collection.
- **Used JS heap after GC** belongs to the full and master profiles. The page runs two warm-up lifecycles, then awaits
  two async major collections for each reading. It reports whole-page JavaScript heap with a live 500-row list and
  again after successful application teardown.
- **Minified ESM bundle size** is the size of one benchmark fixture bundle. It is not the size of an Aurelia package or
  a developer's application.

The two after-GC rows are independent base-to-candidate comparisons. Do not subtract them as a paired before/after
measurement. Post-teardown heap still includes loaded modules and engine or framework caches. It is useful comparative
evidence, not a leak verdict. `performance.memory` also excludes native DOM and renderer memory.

Tachometer's generic console table labels expression values as time. Use the compact summary or generated report for
the correct byte and MiB presentation.

## Add or change a scenario

Keep the workload small enough to understand and rich enough to exercise the framework behavior under review.

- Generate data and complete setup before the start mark.
- Keep raw startup fixtures synchronous, call their startup helper without `await`, and fail if `Aurelia.start()`
  returns a Promise.
- Await scheduled framework work before the end mark in update and reconciliation scenarios.
- Capture immediate heap before assertion traversals allocate temporary structures. Clear assertion-owned references
  before an after-GC reading.
- Assert final DOM output. Check controller identity and events when they are part of the workload contract.
- Publish all values for a multi-metric page together, after every value is ready.
- Load framework code through `loadVariant()` so the same page selects only the exact base or candidate bundle.
- Keep input data and mutation plans deterministic.

See [AGENTS.md](./AGENTS.md) for the files and validation that must change with a new fixture, result, metric, or
profile.

## Why the custom Tachometer runner remains

`run-tachometer.mjs` uses Tachometer's configuration, server, and runner implementation, closes every server, writes
the raw Tachometer JSON, and adds Aurelia's unit-aware compact summary.

On Windows, Tachometer 0.7.1's public CLI invokes `npm.cmd` through `execFile`. That path fails with `spawn EINVAL` on
the supported Node 22 runtime and on Node 24. The small wrapper keeps local Windows runs usable without changing
benchmark semantics. It imports private Tachometer modules, so the dependency stays exactly pinned. Validate the
runner on Windows and CI before changing Tachometer or replacing the wrapper.

The exact `chromedriver` npm dependency satisfies Tachometer's module check. Repository installs disable dependency
scripts, so this package does not supply the executable. CircleCI installs a ChromeDriver matched to its Chrome build;
local Selenium uses the driver available for the developer's browser.
