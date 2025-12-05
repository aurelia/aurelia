# Aurelia 2 – Releasing via GitHub Workflows

This doc shows **how to cut releases** with our two GitHub workflows, for both the **prerelease** lane (configurable tag, default **beta**) and the **latest** (stable) lane. It's designed to be fast to follow and hard to misuse.

---

## TL;DR – One‑page cheat sheet

**Prerelease lane (default tag = `beta`)**

```
1) Actions → Dev Pre-release → Run → action: enter (tag: beta) → merge the PR
2) On a feature PR, run `npx changeset` and commit the changeset file
3) Actions → Release (manual) → lane: dev (or auto) → dry_run: true
   → Review the "Version Packages (prerelease)" PR
4) Merge that PR
5) Actions → Release (manual) → lane: dev (or auto) → dry_run: false
   → Publishes to npm@<tag> (beta by default)
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
6) (Optional) Re-enter prerelease: Actions → Dev Pre-release → action: enter (tag: beta)
```

> **Nothing publishes automatically.** Always merge the **Version Packages PR** first and then run **Release (manual)** again (not dry‑run) to actually publish.

---

## Workflows & roles

* **Dev Pre-release**
  Toggles prerelease mode by opening a PR that adds/removes `.changeset/pre.json`.

  * **Enter** ⇒ subsequent releases target the **prerelease lane**; the **npm dist‑tag and semver pre‑id** come from the workflow input **`tag`** (default `beta`).
    Example: `2.0.0-beta.26`, published to **`beta`**.
  * **Exit**  ⇒ subsequent releases target **latest** (stable).
    It's safe to close the PR if you change your mind—state changes only when merged.

* **Release (manual)**
  Manually builds and runs Changesets. Two phases:

  1. **Plan phase** (`dry_run: true`) – opens/updates a **Version Packages** PR that bumps versions and writes changelogs.
     *No tags, no npm publish.*
  2. **Publish phase** (`dry_run: false`) – after you merge that PR, actually **publishes to npm** (to the prerelease tag from `pre.json` or to `latest`).

---

## Prerequisites

* **Secrets:** `NPM_TOKEN` (publish to all packages).
* **Changesets config:** `.changeset/config.json` with:

  * `fixed`: **explicit lockstep list** of all publishable packages (so a single `"aurelia": patch` bumps everything together and updates inter‑package ranges).
  * `ignore`: non‑publish workspaces (examples, e2e, test helpers, benchmarks).
  * `privatePackages: { "version": false, "tag": false }`.
* **Commit hooks:** The Release workflow disables Husky hooks so the bot can commit its "Version Packages" branch cleanly.
* **Each feature PR:** includes a **changeset** created with `npx changeset` (short summaries). With a **fixed** group, selecting **`aurelia`** is enough—everything bumps in lockstep.

---

## Prerelease lane — step‑by‑step (default tag = `beta`)

### 1) Enter prerelease mode

* **Actions → Dev Pre-release → Run workflow →**
  **action:** `enter`, **tag:** `beta` (or `rc`, etc.) → merge the PR that adds `.changeset/pre.json`.

### 2) Land changes with a changeset

On your feature branch:

```bash
# Make your change inside a publishable package
npx changeset
# pick target package(s) (tip: select "aurelia"), choose patch/minor/major, write a short summary
git add .
git commit -m "feat: thing X (changeset)"
git push
# open PR and merge as usual
```

### 3) Draft the release (no publishing)

* **Actions → Release (manual) → Run workflow**

  * **lane:** `dev` (or `auto`)
  * **dry_run:** `true`
* This opens/updates a **"Version Packages (prerelease)"** PR with:

  * version bumps,
  * per‑package `CHANGELOG.md` entries (from your changeset summaries),
  * dependency range updates across packages (lockstep).

Review the PR. If it looks wrong, adjust/add changesets in a new PR, merge, and re‑run the plan to regenerate.

### 4) Approve the release plan

* **Merge** the "Version Packages (prerelease)" PR into `master`.
  *(Merging does not publish.)*

### 5) Publish to npm@<tag>

* **Actions → Release (manual) → Run workflow** again:

  * **lane:** `dev` (or `auto`)
  * **dry_run:** `false`
* Publishes the prepared versions to **npm with the prerelease dist‑tag** from `.changeset/pre.json` (e.g. `beta`).

### 6) Verify

```bash
npm view aurelia dist-tags
npm view @aurelia/kernel versions | tail -n 10
```

`beta` (or your chosen tag) should point to your new `x.y.z-<tag>.N`. `latest` remains unchanged.

---

## Latest lane (stable) — step‑by‑step

### 1) Exit prerelease mode

* **Actions → Dev Pre-release → Run workflow → action: `exit`** → merge the PR that removes `.changeset/pre.json`.

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

* **Actions → Dev Pre-release → Run → action: `enter` (tag: `beta`)**
  Now future cuts go to your prerelease tag again.

---

## Understanding **`lane`** and **`dry_run`**

* **`lane` input:** `auto | dev | latest`

  * `auto` = if `.changeset/pre.json` exists → **dev** (prerelease); else **latest** (stable).
  * `dev`   = force **prerelease** lane (uses the tag inside `.changeset/pre.json`, e.g. `beta`).
  * `latest`= force **stable** lane.

* **`dry_run: true` (plan only):**

  * **Does not** run `changeset publish`.
  * **Does not** create git tags.
  * **Does** open/update the **Version Packages PR**.

* **`dry_run: false` (publish):**

  * After you merge the Version PR, it **publishes to npm** and creates git tags.

> We **do not** create GitHub Releases in the workflows (to avoid size limits on large monorepos). Your source of truth is the per‑package `CHANGELOG.md` plus git tags. If you want Releases for stable cuts, add them separately.

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

* **Wizard says "no packages changed"**
  You edited only root files or ignored/private workspaces.
  Edit inside a publishable package, or use the wizard's "show all packages", or add a changeset file manually.

* **Examples/e2e/benchmarks show up**
  Ensure they are `"private": true` and listed in `ignore` by **package name**.

* **Release run did nothing**
  There were no changesets on `master`. Create/merge a PR with a changeset and re‑run.

* **Want to switch prerelease id/tag (e.g., dev → beta)**
  Run **Dev Pre-release → action: exit** → merge.
  Then **Dev Pre-release → action: enter (tag: beta)** → merge.
  Run **Release (manual)** with `dry_run: true` to regenerate the Version PR with `-beta.N`, merge, then publish.

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

Keep the repo **in prerelease most of the time**:

```
[enter (tag: beta)] --beta.0--> --beta.1--> --beta.2--> [exit] --latest--> [enter (tag: beta)] --beta.0--> ...
```

Early adopters pull `@beta` often while stable users only see intentional cuts to `latest`.

---

If anything in the workflows changes, update this doc in the repo (`docs/RELEASING.md`) so the steps stay in sync.
