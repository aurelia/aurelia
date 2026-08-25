# Benchmark maintenance guidance

## Scope

- `app-*` directories own browser fixtures and Tachometer configuration.
- `utils/` owns browser-side loading, assertions, data, measurement publication, and GC helpers.
- `prepare-variants.mjs`, `rollup.variant.mjs`, and `variant-utils.mjs` own exact source builds and package isolation.
- `run-tachometer.mjs` owns execution and the local compact summary.
- `benchmark-report.mjs` owns result contracts, strict validation, and trusted Markdown rendering.
- `.circleci/config.yml` owns benchmark jobs. `.github/workflows/trigger-circleci-bench.yml`,
  `.github/workflows/trigger-circleci-pr-full.yml`, and `.github/scripts/benchmark-comment.cjs` own trusted dispatch
  and PR reporting.

## Comparison invariants

- Use full immutable SHAs. A PR candidate is the verified GitHub test merge with the requested base and head parents.
- Build each revision from its own source snapshot, lockfile, release output, and packed package graph.
- Resolve every bundled `@aurelia/*` module inside the selected variant root. Never fall back to workspace packages,
  npm `dev`, or another moving label.
- Run base and candidate with identical fixture source, filenames, bundler configuration, browser, and interleaved
  sampling order.
- Keep the authoritative harness clean and owned by the candidate revision.
- Treat CircleCI artifacts as untrusted input. Do not weaken hashes, revision checks, schemas, artifact limits, or the
  final staleness check to accept a new result.

## Scenario rules

- Expanded benchmark names end in `base` and `candidate`.
- Pages load Aurelia through `loadVariant()` and publish multi-metric values atomically.
- Keep preparation outside latency intervals. Startup fixtures call `startSynchronousApplication()` without `await`
  and reject an async `Aurelia.start()` result. Update scenarios await their scheduled framework work before the end
  mark.
- Capture immediate heap before assertion traversals. Correctness must still be proven before publishing a sample.
- Clear avoidable assertion roots before after-GC readings and use `measureUsedJsHeapAfterGc()`.
- Assert the behavior the timing represents: DOM count, order, content, controller identity, or event handling as
  applicable.
- Keep data and mutation plans deterministic. A fast result from incomplete work is a failed benchmark.

## Required updates

When adding a fixture, update its entry module and page/config, the `defaultFixtures` list in
`prepare-variants.mjs`, provenance expectations, and bundle tests.

When adding a result file, update:

- `benchmarks/package.json`;
- the relevant CircleCI job and report dependency;
- `resultContracts` and profile membership in `benchmark-report.mjs`;
- report fixtures and strict validation tests.

When adding a metric, update compact-summary classification and formatting, the report metric definition and
validator, the human explanation, and tests for units and confidence-interval assessment.

Choose profile membership deliberately. Expensive after-GC lifecycle work belongs in `full` and `master`, not
`smoke`.

## Validation

Run the checks relevant to the change:

```sh
cd benchmarks
npm run bench:test
```

- Run the changed page through its real Tachometer command against prepared exact variants.
- Run an A/A byte-identical proof after changing source preparation, package isolation, or bundling.
- Generate and strictly validate a complete report after changing result files, profiles, metrics, or artifacts.
- Validate CircleCI configuration and GitHub Actions syntax after changing CI.
- Run `git diff --check` before committing.

## Version-coupled runner

`run-tachometer.mjs` intentionally retains Tachometer's config, server, runner, JSON output, and cleanup path while
avoiding the public CLI's broken Windows `npm.cmd` launch. Its imports are private and version-coupled. Keep Tachometer
exactly pinned and verify the public CLI on supported Windows Node before removing the wrapper.

Keep ChromeDriver's two roles separate. The exact benchmark dependency satisfies Tachometer's module resolution, and
CircleCI owns the executable matched to its Chrome build. Repository-wide `ignore-scripts=true` prevents the npm
package from downloading a competing driver.
