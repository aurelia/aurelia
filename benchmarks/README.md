# Aurelia benchmarks

This directory compares exact Aurelia revisions under one benchmark harness. It provides performance evidence for
maintainers without turning noisy browser measurements into an automatic merge gate.

## Comparison model

An ordinary pull-request run freezes the base, PR head, and verified test merge:

```text
base SHA ──────── clean install → release build → packed package graph → base bundles
                                                              │
test-merge SHA ─ clean install → release build → packed package graph → candidate bundles
                                                              │
candidate harness ─────────────────────────────────────────────┴→ interleaved samples
```

The candidate is GitHub's test merge of the frozen base and PR head. CircleCI verifies both merge parents before it
builds anything. An automatic master run compares the current commit with its first parent.

An explicit revision comparison selects the two framework commits independently of the harness. The harness comes
from the current PR test merge, or current master for a standalone run. Its revision is frozen when the run is
requested. This lets maintainers measure older framework code with today's fixtures and runner.

Each revision gets its own source snapshot, clean install, and release build. The builder discovers the internal
`@aurelia/runtime-html` package closure, packs those packages, and installs them into an isolated graph. Both graphs
are then bundled with the same harness-owned fixture source and Rollup configuration. This prevents workspace links
or root dependencies from mixing the two revisions.

`results/variants/provenance.json` records the revisions, source trees, package graph, tool versions, resolved entry
points, bundle hashes, and harness hash. Authoritative reports require a clean frozen harness and the exact result
set for their profile.

## CI profiles

| Profile | Trigger | Purpose |
| --- | --- | --- |
| `smoke` | `/ci full` | A stable subset, including the realistic keyed refresh workload. |
| `full` | `/ci bench` or manual Actions dispatch | The complete comparison, including warmed refresh, dependency rotation, and after-GC heap scenarios. |
| `master` | Push to `master` | The complete suite against the current commit's first parent. |

PR reporting currently supports same-repository PRs targeting `master`. The trusted GitHub workflow updates one
marker comment. It discards results when the PR base, head, or test merge changes while CircleCI is running. PR code
never receives the GitHub write token.

### Choose framework revisions

Maintainers can use these commands on a same-repository PR targeting `master`:

| Command | Framework comparison |
| --- | --- |
| `/ci bench` | Current master → verified PR test merge |
| `/ci bench <base SHA>` | Selected baseline → verified PR test merge |
| `/ci bench <base SHA> <candidate SHA>` | Selected baseline → selected candidate |

SHA arguments accept 7–40 hexadecimal characters and resolve to full commits before dispatch. Branch names and tags
are not command arguments. Both sides run with the same frozen PR harness, including when the selected framework
commits predate its fixtures. The PR comment links the measured commits and harness separately. A subsequent command
updates the same comment.

For a comparison without a PR, open **Actions → Trigger benchmarks on /ci bench → Run workflow** on `master`:

1. Leave `pr_number` empty.
2. Enter `base_sha`.
3. Enter `candidate_sha`, or leave it empty to compare against current master.

The results appear in that Actions run's summary with links to the CircleCI workflow and artifacts. Supplying
`pr_number` instead uses that PR's verified harness and comment. `expected_base_sha` and `expected_head_sha` remain
optional PR freshness checks; use `base_sha` to choose a historical performance baseline.

CircleCI checks the harness checkout before preparation, measurement, and reporting. If it has moved since dispatch,
rerun the command. Standalone reports retain their frozen revisions when master later advances. An older source
revision must still install from its own lockfile and build with the selected toolchain; a preparation failure needs
investigation before that revision can be compared.

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
to select another output directory. Timing and CPU profiling use the outputs of the same completed Rollup build. A
framework rebuild queues the latest completed build for the next run. Editing the fixture or its shared browser
helpers cancels the current run and resets the baseline; the previous complete result is preserved.

The result's `live` field records the session, bundle/profile hashes, fixture and config hashes, and selected settings.
The paired profile summary contains the same metadata. This identifies local experiments without treating a live
workspace build as an exact-revision release comparison.

To switch scenarios without restarting the package watchers, opt into the ignored control file:

```sh
npm run dev -- --bench app-repeat-realistic/startup.json --bench-samples 20 --bench-control
```

The command initializes `benchmarks/live-results/control.json` from `--bench`, so a stale file can never choose the
initial baseline. Replace its `config` value with another path below `benchmarks/`, for example
`app-repeat-realistic/refresh.json`. The supervisor cancels and cleans up the current browser run, starts the new
fixture, and gives it a fresh session and baseline. `--bench-samples` and profiling options remain fixed until the dev
command is restarted. Wait for `status.json` to report `complete` with the requested `metadata.config` before reading
`latest.json`.

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
and a ranking of frames in the benchmark bundle. That bundle includes both framework and fixture code. `status.json`
reports capture state. Use `--profile-output <folder>` to select another
directory. Chrome DevTools can open the `.cpuprofile` directly.

The profiler identifies expensive functions; it is not comparative performance evidence. After changing a measured
hotspot, keep the profile watcher running for diagnostic feedback and use the matching live Tachometer configuration
to decide whether end-to-end duration improved. Both can run after each rebuild when requested together:

```sh
npm run dev -- --bench app-repeat-realistic/refresh.json --bench-samples 10 --profile refresh
```

When a likely refresh optimization is smaller than the confidence interval of the single-refresh scenario, use the
warmed diagnostic loop. It performs 20 warm-up refreshes, then reports both total time and the median of 20
individually timed settled refreshes per Tachometer sample. The median isolates typical hot-path latency while total
time retains GC and allocation costs; record creation and correctness assertions remain outside both intervals:

```sh
npm run dev -- --bench app-repeat-realistic/refresh-loop.json --bench-samples 20 --profile refresh --profile-iterations 100
```

The loop also runs in the full and master CI profiles. Keep `refresh.json` as the single-interaction result and use
the loop to investigate smaller hot-path changes.

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

To compare any two framework commits using the checked-out harness:

```sh
npm run bench:variants -- --comparison revisions --base <base SHA> --candidate <candidate SHA> --profile full --output results/variants
```

Local preparation also accepts Git revision expressions such as `HEAD~2` and records their resolved SHAs. The harness
defaults to the current checkout; `--harness <SHA>` asserts that it matches an expected revision. For an explicit PR
comparison, check out its test merge and also supply `--pull-request <number> --pr-base <SHA> --head <SHA>`. These
identify the merge parents independently of the two measured framework revisions.

Local edits are permitted for diagnostic preparation and recorded as a dirty harness. Authoritative report generation
requires a clean harness.

Variant preparation intentionally performs two clean installs and release builds. It refuses to overwrite an
existing output directory. Keep the top level of `results/` free of extra JSON result files because the report builder
rejects unexpected artifacts. `results/variants/provenance.json` is required.

Keep each comparison's variants and timing JSON together. Archive the existing `results/` directory before preparing
a different revision pair so its report contains only freshly measured results. Raw Tachometer files do not carry
revision identities; CI keeps them together in a separate workspace for each workflow.

Run an individual scenario after preparing `results/variants`:

```sh
npm run bench:realistic-refresh
npm run bench:realistic-heap500
npm run bench:realistic-refresh-loop
npm run bench:dependency-rotation
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
the supported Node 22 runtime and on Node 24. The wrapper also owns browser-session cleanup on success, failure, and
cancellation. The live loop calls the same runner directly, so stopping a measurement can close its browser and
server before starting another one. Sampling and statistics remain Tachometer's implementation.

These integrations use private Tachometer modules, so the dependency stays exactly pinned. Validate the runner on
Windows and CI before upgrading or replacing it.

The exact `chromedriver` npm dependency satisfies Tachometer's module check. Repository installs disable dependency
scripts, so this package does not supply the executable. CircleCI installs a ChromeDriver matched to its Chrome build;
local Selenium uses the driver available for the developer's browser.
