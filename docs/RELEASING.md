# Aurelia 2 – Releasing via GitHub Workflows

This doc shows **how to cut releases** with our two GitHub workflows, for both the **dev** (prerelease) and **latest** (stable) lanes. It's designed to be fast to follow and hard to misuse.

---

## TL;DR – One‑page cheat sheet

**Dev lane (prerelease)**

```
1) Actions → Dev Pre-release → Run → action: enter → merge the PR
2) On a feature PR, run `npx changeset` and commit the changeset file
3) Actions → Release (manual) → lane: dev (or auto) → dry_run: true
   → Review the "Version Packages (dev)" PR
4) Merge that PR
5) Actions → Release (manual) → lane: dev (or auto) → dry_run: false
   → Publishes to npm@dev
6) Verify: `npm view aurelia dist-tags`
```

**Latest lane (stable)**

```
1) Actions → Dev Pre-release → Run → action: exit → merge the PR
2) Ensure changesets are on master (from feature PRs)
3) Actions → Release (manual) → lane: latest (or auto) → dry_run: true
   → Review "Version Packages" PR
4) Merge that PR
5) Actions → Release (manual) → lane: latest (or auto) → dry_run: false
   → Publishes to npm@latest
6) (Optional) Re-enter prerelease: Actions → Dev Pre-release → action: enter
```

> **Nothing publishes automatically.** Always merge the **Version Packages PR** first and then run **Release (manual)** again (not dry‑run) to actually publish.

---

## Workflows & roles

* **Dev Pre-release**
  Toggles prerelease mode by opening a PR that adds/removes `.changeset/pre.json`.

  * **Enter** ⇒ subsequent releases target **dev** lane.
  * **Exit**  ⇒ subsequent releases target **latest** lane.
    Safe to close if you change your mind (state changes only when merged).

* **Release (manual)**
  Manually builds and runs Changesets. Two phases:

  1. **Draft phase** (often with `dry_run: true`) – opens/updates a **Version Packages** PR that bumps versions and writes changelogs.
  2. **Publish phase** (rerun with `dry_run: false` **after merging** that PR) – actually publishes to npm (`dev` or `latest` lane).

---

## Prerequisites

* **Secrets:** `NPM_TOKEN` (publish to all packages).
* **Changesets config:** `.changeset/config.json` with:

  * `fixed`: **explicit lockstep list** of all publishable packages (so a single `"aurelia": patch` bumps everything together and updates inter‑package ranges).
  * `ignore`: non‑publish workspaces (examples, e2e, test helpers, benchmarks).
  * `privatePackages: { "version": false, "tag": false }`.
* **Commit hooks:** Release workflow disables Husky hooks so the bot can commit its "Version Packages" branch cleanly.
* **Each feature PR:** includes a **changeset** created with `npx changeset` (one‑liner summaries).

---

## Dev lane (prerelease) — step‑by‑step

### 1) Enter prerelease mode

* **Actions → Dev Pre-release → Run workflow → action: `enter`**
  Merge the PR that adds `.changeset/pre.json`.

### 2) Land changes with a changeset

On your feature branch:

```bash
# Make your change inside a publishable package
npx changeset
# pick target package(s), choose patch/minor/major, write a short summary
git add .
git commit -m "feat: thing X (changeset)"
git push
# open PR and merge as usual
```

> You can simply select **`aurelia`**; the rest will follow lockstep.

### 3) Draft the release (no publishing)

* **Actions → Release (manual) → Run workflow**

  * **lane:** `dev` (or `auto`)
  * **dry_run:** `true`
* This opens/updates a **"Version Packages (dev)"** PR with:

  * version bumps,
  * per‑package `CHANGELOG.md` entries (using your changeset summaries),
  * dependency range updates across packages (lockstep).

Review that PR. If it looks wrong, edit or add changesets on a new branch, merge, and re‑run this step to regenerate.

### 4) Approve the release plan

* **Merge** the "Version Packages (dev)" PR into `master`.
  (Merging does not publish.)

### 5) Publish to npm@dev

* **Actions → Release (manual) → Run workflow** again:

  * **lane:** `dev` (or `auto`)
  * **dry_run:** `false`
* This publishes the prepared versions to **npm with dist‑tag `dev`**.

### 6) Verify

```bash
npm view aurelia dist-tags
npm view @aurelia/kernel versions | tail -n 10
```

`dev` should now point to your new `x.y.z-dev.N`. `latest` remains unchanged.

---

## Latest lane (stable) — step‑by‑step

### 1) Exit prerelease mode

* **Actions → Dev Pre-release → Run workflow → action: `exit`**
  Merge the PR that removes `.changeset/pre.json`.

### 2) Draft the release

* Ensure pending changesets exist on `master` (from feature PRs).
* **Actions → Release (manual) → Run workflow**

  * **lane:** `latest` (or `auto`)
  * **dry_run:** `true`
* Review the **"Version Packages"** PR (stable). If needed, adjust changesets and re‑run.

### 3) Approve and publish

* **Merge** the Version Packages PR.
* **Run Release (manual)** again (lane `latest`, `dry_run: false`) to publish to **npm@latest**.

### 4) (Optional) Re‑enter prerelease

* **Actions → Dev Pre-release → Run → action: `enter`**
  (Now future cuts go to `dev` again.)

---

## Understanding **dry_run**

* We set `NPM_CONFIG_DRY_RUN=true` in the job **only** when you tick the input.
* Effects:

  * Changesets still **opens/updates** the Version Packages PR (versioning phase).
  * `npm publish` prints the plan but **does not upload** anything to npm.
* Implications:

  * **Merging** the Version Packages PR after a dry‑run **does not publish**.
  * You must run **Release (manual)** **again** with `dry_run: false` to publish.

---

## Common tasks

### Cancel / postpone a release

* **Close** the Version Packages PR. Nothing publishes.
  Re‑run **Release (manual)** later to regenerate it.

### Prevent accidental publishes

* Keep non‑publish workspaces `"private": true` and listed in `ignore`.
* Release is **manual**; nothing happens on a normal push to `master`.

---

## Troubleshooting

* **Changeset wizard says "no packages changed"**
  You edited only root files or ignored/private workspaces.

  * Edit a file inside a publishable package **or**
  * Use the "show all packages" mode in the wizard **or** create a changeset file manually.

* **Examples/e2e/benchmarks appear in diffs**
  They might be versioned by default. Ensure they're `"private": true` and listed in the `ignore` array **by package name** (not paths).

* **Release run did nothing**
  There were no changesets on `master`. Create/merge a PR with a changeset and re‑run.

---

## Quick reference commands

Preview the plan locally:

```bash
npx changeset status --verbose
```

Check npm tags:

```bash
npm view aurelia dist-tags
npm view @aurelia/router versions | tail -n 10
```

---

## Release cadence recommendation

Keep the repo **in prerelease mode by default**:

```
[enter pre] --dev.0--> --dev.1--> --dev.2--> [exit] --latest--> [enter pre] --dev.0--> ...
```

This lets early adopters pull `@dev` often while stable users only see intentional cuts to `latest`.

---

If anything in the workflows changes, update this doc in the repo (`docs/RELEASING.md`) so the steps stay in sync.
