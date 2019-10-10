# Release Procedure


## Prerequisites

- Make sure you're on the master branch and `git status` reports `nothing to commit, working tree clean`.

- Do a `git pull origin master` to make sure you've got all the latest changes.

- Go to [circleci](https://circleci.com/gh/aurelia/aurelia) and make sure that the last build on the `master` branch succeeded.

- Before triggering the release build, make sure no other builds are currently running or about to run

> If multiple builds run at the same time this may cause the browserstack e2e tests to fail. While not the end of the world, this can waste some time and cause confusion. In the future this will be solved with a queue mechanism. The current remedy is to "rerun from failed"


## Steps

Releasing consists of 3 high-level steps: preparing the release (by generating changelogs and bumping versions), pushing a tag, and approving the final publish build.

In this example we're assuming that we're releasing v0.1.0

### 1. Preparing the release

- From the project root, run the prepare-release script:
```shell
npm run prepare-release
```

> This generates/updates the changelogs, both on root and on package level. It also bumps the version of the package.json, package-lock.json and lerna.json files.

- Commit and push the changes. Either to a separate branch and merge them in via a PR, or directly to master. For example:

```shell
git add .
git commit -m "chore(all): prepare release v0.1.0"
git push
```

### 2. Pushing the tag

```shell
git tag v0.1.0
git push origin v0.1.0
```

Now keep an eye on [circleci](https://circleci.com/gh/aurelia/aurelia) and see that the `prepare_release` workflow runs without issues. If any individual job fails and the failure may be transient (such as browserstack executor errors), you can simply go directly to the workflow and from the dropdown pick "rerun from failed". This will rerun the workflow, starting at the failed job (instead of at the beginning).

At the end of the job, it will commit everything to the `release` branch which then triggers the `prepare_release` workflow again, but with different steps.

### 3. Approving the publish

At the final job of the `prepare_release` workflow there is an approval step. This gives you the opportunity to look at the `release` branch and/or the build log to verify for example the generated artifacts for that extra peace of mind.

- Hit the approve button

And voila!

## Error recovery

Should something go wrong in the release process itself and it needs to rerun from scratch, the best way to go about this is deleting the tag and pushing it again. There is no need to rerun prepare-release.

After applying the needed fixes and pushing/merging those to master, assuming you are checked out on the latest master branch locally (or simply on the commit that contains the fixes):

- Delete the tag locally

```shell
git tag --delete v0.1.0
git push --delete origin v0.1.0
```

- Proceed from step 2.
