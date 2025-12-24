# Releasing Aurelia 2

## What Is This?

We use [Changesets](https://github.com/changesets/changesets) to manage versioning and changelogs. Here's the basic idea:

1. **Contributors** add a small markdown file (a "changeset") to their PR describing what changed
2. **Release managers** run a GitHub Action that collects all changesets, bumps versions, updates changelogs, and publishes to npm

This keeps changelogs accurate and automates the tedious parts of releasing.

---

## Quick Glossary

| Term | Meaning |
|------|---------|
| **Changeset** | A markdown file in `.changeset/` that describes a change (created by running `npx changeset`) |
| **Pre-mode** | When the repo is configured to release prereleases like `2.0.0-beta.27` instead of stable versions |
| **Version PR** | A pull request automatically created by the release workflow that bumps all package versions and updates changelogs |
| **dist-tag** | npm's way of labeling versions (e.g., `latest` for stable, `beta` for prereleases) |

---

## Check Current State

Before releasing, check what state the repo is in:

```bash
# Are we in pre-mode (beta/rc) or stable mode?
ls .changeset/pre.json 2>/dev/null && echo "In pre-mode (beta/rc releases)" || echo "In stable mode"

# What's currently published?
npm view aurelia dist-tags

# Any pending changesets waiting to be released?
npx changeset status
```

---

## For Contributors

When your PR changes published packages (features, bug fixes, refactors), add a changeset:

```bash
npx changeset
```

The wizard asks three questions:
1. **Which packages?** → Select `aurelia` (all 30+ packages release together as one version)
2. **Bump type?** → `patch` for fixes, `minor` for features, `major` for breaking changes
3. **Summary?** → One line describing the change (this goes in the changelog)

This creates a file like `.changeset/friendly-words-here.md`. Commit it with your PR.

**When to skip:** Docs-only changes, test-only changes, examples, and e2e tests don't need changesets.

---

## For Release Managers

### Releasing a Beta (e.g., beta.27)

The repo must be in pre-mode. Check with `ls .changeset/pre.json`.

**Steps:**

1. **Check for pending changesets**
   ```bash
   npx changeset status
   ```
   If empty, no PRs included changesets — you need at least one to release.

2. **Create the Version PR**
   - Go to GitHub → Actions → **Release (manual)**
   - Set: `lane: auto`, `dry_run: true`
   - Click "Run workflow"

   This creates a PR titled "Version Packages (prerelease)" that shows:
   - Version bumps (e.g., `beta.26` → `beta.27`)
   - Changelog updates
   - The changeset files will be deleted (they've been "consumed")

3. **Review and merge the Version PR**

   Check that versions and changelog look right. Merge when satisfied.

   ⚠️ Merging does NOT publish to npm yet.

4. **Publish to npm**
   - Go to GitHub → Actions → **Release (manual)**
   - Set: `lane: auto`, `dry_run: false`
   - Click "Run workflow"

5. **Verify**
   ```bash
   npm view aurelia dist-tags
   # Should show: beta: 2.0.0-beta.27
   ```

### Releasing Stable (e.g., 2.0.0)

First, exit pre-mode to switch from beta versions to stable versions.

**Steps:**

1. **Exit pre-mode**
   - Go to GitHub → Actions → **Dev Pre-release**
   - Set: `action: exit`
   - Click "Run workflow"
   - This creates a PR that removes `.changeset/pre.json` — merge it

2. **Create the Version PR** (same as beta, step 2)
   - Actions → **Release (manual)** → `lane: auto`, `dry_run: true`
   - The PR will show stable versions (e.g., `2.0.0` not `2.0.0-beta.X`)

3. **Review and merge the Version PR**

4. **Publish to npm**
   - Actions → **Release (manual)** → `lane: auto`, `dry_run: false`

5. **Verify**
   ```bash
   npm view aurelia dist-tags
   # Should show: latest: 2.0.0
   ```

6. **(Optional) Re-enter pre-mode** for the next beta cycle
   - Actions → **Dev Pre-release** → `action: enter`, `tag: beta`

### Entering Pre-Mode (Starting a Beta Cycle)

If you want to start releasing betas (e.g., for 2.1.0):

- Go to GitHub → Actions → **Dev Pre-release**
- Set: `action: enter`, `tag: beta`
- Click "Run workflow"
- Merge the PR that's created

Now all releases will be `X.Y.Z-beta.N` until you exit pre-mode.

---

## How the Pieces Fit Together

```
Contributors                          Release Managers
     │                                      │
     │  1. Make code changes                │
     │  2. Run: npx changeset               │
     │  3. Commit the .changeset/*.md file  │
     │  4. Open PR ─────────────────────►  Merge PR
     │                                      │
     │                            5. Run workflow (dry_run: true)
     │                               └─► Creates "Version PR"
     │                                      │
     │                            6. Review Version PR
     │                               └─► Versions, changelogs look good?
     │                                      │
     │                            7. Merge Version PR
     │                               └─► Changeset files deleted
     │                               └─► Versions bumped in package.json
     │                               └─► CHANGELOGs updated
     │                                      │
     │                            8. Run workflow (dry_run: false)
     │                               └─► Published to npm!
```

**Key safety feature:** Nothing publishes automatically. You always have to:
1. Review the Version PR
2. Explicitly run the publish step

---

## Troubleshooting

### "No packages changed" error
No changeset files exist. Either:
- Merge a PR that includes a changeset, or
- Create one manually: `npx changeset` → select `aurelia` → commit and push

### Version PR shows wrong versions
Close the PR, fix the changesets, and re-run the workflow with `dry_run: true`.

### Want to cancel a release
Just close the Version PR. Nothing publishes until you explicitly run `dry_run: false`.

### Config error about a deleted package
A package was removed but still listed in `.changeset/config.json`. Edit the `fixed` array to remove it.

---

## Reference

### Workflow Inputs

**Release (manual):**
| Input | Options | What it does |
|-------|---------|--------------|
| `lane` | `auto` | Detects beta vs stable from pre.json |
| | `dev` | Force prerelease mode |
| | `latest` | Force stable mode |
| `dry_run` | `true` | Only create/update Version PR |
| | `false` | Actually publish to npm |

**Dev Pre-release:**
| Input | Options | What it does |
|-------|---------|--------------|
| `action` | `enter` | Start releasing betas/rcs |
| | `exit` | Switch back to stable releases |
| `tag` | `beta`, `rc`, etc. | The prerelease label |

### Local Commands

```bash
npx changeset status          # See pending changesets
npx changeset                 # Create a new changeset
npx changeset pre enter beta  # Enter pre-mode locally
npx changeset pre exit        # Exit pre-mode locally
```

---

## First-Time Setup

If changesets has never been used or the config is broken:

1. Check `.changeset/config.json` exists and lists all packages in the `fixed` array
2. Enter pre-mode if releasing betas: `npx changeset pre enter beta`
3. Create at least one changeset summarizing changes since last release
4. Run the release workflow

See [PR #2332](https://github.com/aurelia/aurelia/pull/2332) for an example of bootstrapping the workflow.
