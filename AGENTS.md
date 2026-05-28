# Repository Guidelines

## Agent Operating Notes
- Keep guidance repo-specific and actionable: commands, validation rules, code style, package boundaries, and known gotchas belong here.
- Put package- or directory-specific rules in nested `AGENTS.md` files near the code they govern instead of adding broad root-level exceptions.
- When delegating work in Codex, use native subagents for parallel exploration, implementation, or review. Do not orchestrate extra headless `codex exec` processes from shell unless the user explicitly asks for that fallback or native subagents are unavailable.
- Keep delegated tasks tightly scoped and evidence-driven. The parent agent remains responsible for final verification and hand-off.

## Project Structure & Module Organization
Aurelia core uses npm workspaces. Framework and plugin source lives under `packages/` (for example `packages/runtime`, `packages/router`, `packages/state`), each with its own `src/` and local tests. Build tooling and adapters sit in `packages-tooling/`, while end-to-end fixtures reside in `packages/__e2e__/`. Documentation belongs in `docs/user-docs/`, runnable samples are in `examples/`, and performance harnesses live in `benchmarks/`. Shared automation scripts are under `scripts/`.

## Build, Test, and Development Commands
- `npm run build` - Turbo-powered full workspace build; always run after dependency or API changes and before kicking off the test suite.
- `cd packages/<package> && npm run build` - Use the package-local builder when a workspace exposes its own script; run this immediately after editing that package.
- `npm run lint` - ESLint across all packages plus script utilities; ensures style compliance.
- `npm run dev` - Launches the development helper script for local experimentation.

## Coding Style & Naming Conventions
Write TypeScript with 2-space indentation, trailing commas, and single quotes as enforced by ESLint. Keep filenames kebab-case (for example, `subscriber-batch.ts`), prefer named exports from package entry points, and co-locate reusable helpers in `src/resources/` when a package provides templating resources. Run `npm run lint` before committing to catch formatting drift.
- Prefer simple, direct implementations with descriptive names.
- Keep functions focused; refactor only when it improves readability or reuse.
- Add comments that explain why a choice was made, not what the code does.
- Prefer inlined helpers for single-use logic; only extract new functions when the code is exported or reused in multiple places.

### Framework-Friendly Implementations
- Default to concise, memory-aware code paths. Minimize helper churn, prefer reusing existing utilities, and avoid creating large allocation footprints for hot paths.
- Before introducing new helpers or abstractions, survey existing packages for analogous functionality you can extend instead of duplicating.
- Keep new API surface incremental and well-justified; brief, well-named helpers with clear responsibilities are easier for downstream contributors to reason about and optimize.
- When a change must be more involved, break it into small, testable pieces and explain the rationale inline or in docs so future maintainers understand why the complexity is necessary.
- When prefixing properties or methods with an underscore e.g. `_myMethod` ensure they're denoted with an internal comment `/** @internal */`

## Testing Guidelines
Specs generally live beside source or within test workspaces. Use Jasmine/Mocha-style `describe`/`it` names and reference the feature or bug ID when practical. After rebuilding affected packages (`npm run build` or the scoped build commands above), run the relevant package-local or root test command. Follow nested `AGENTS.md` guidance for subtree-specific test commands.

**Agent discipline:** if you change code, you must personally run the relevant build and test commands before reporting back. Note the exact commands in your hand-off so reviewers can see what already passed. Skipping validation or hand-waving about "should work" is not acceptable.

### Docs-only exception
When a task is **documentation-only** (for example, changes under `docs/` or updates to agent guidance Markdown files):

- Do **not** run `npm run build`, `npm run lint`, or any test suites.
- Do **not** modify runtime/core packages or tests unless the task explicitly requests code changes.

## Commit & Pull Request Guidelines
Follow Conventional Commits enforced by Commitlint: `type(scope): subject` with lower-case types such as `feat`, `fix`, `docs`, or `test`, a 100-character subject limit, and no trailing period. Scope names should mirror npm package names (for example, `feat(router): add fallback pipeline`). Each PR should include a clear summary, linked issues, confirmation of validation commands (`build`, `lint`, `test`), and screenshots or recordings for UI-affecting work. Update README and `docs/user-docs/` when user-facing behavior changes.

## Environment & Tooling
Target Node 22.12.x and npm 10.9.x as pinned in `package.json` and the Volta config. Use `npm ci` for clean installs. Husky hooks run linting and tests on commit; if they fail, resolve locally rather than bypassing the hook.
