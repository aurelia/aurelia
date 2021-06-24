---
description: Learn about our coding rules and contributing process.
---

# Contributor guide

We'd love for you to contribute to Aurelia's source code and help make our projects even better than they are today! ❤ To help you out, we've put together some guidelines we all like to follow.

{% hint style="success" %}
**Here's what you'll learn...**

* How to handle bugs, small changes, and major feature work.
* Guidelines for submitting issues and pull requests.
* Git/GitHub practices for contributing to our project.
* Coding rules.
* Legal
{% endhint %}

## Got a Question or Problem?

If you have questions about how to use Aurelia, please direct these to [Discord](https://discordapp.com/channels/448698263508615178/448698263508615180), [Discourse](https://discourse.aurelia.io/), or [StackOverflow](https://stackoverflow.com/questions/tagged/aurelia).

## Found an Issue?

If you find a bug in the source code or a mistake in the documentation, you can help us by submitting an issue. Or, even better, you can submit a Pull Request with a fix.

**Please see the Submission Guidelines below**.

## Want a Feature?

You can request a new feature by submitting an issue. If you would like to implement a new feature then consider what kind of change it is.

* **Major Changes** that you wish to contribute to the project should be discussed first via an RFC so that we can better coordinate our efforts, prevent duplication of work, and help you to craft the change so that it is successfully accepted into the project.
* **Small Changes** can be crafted and submitted to [the GitHub Repository](https://github.com/aurelia/aurelia) as a Pull Request.

## Developing

Check out [building and testing Aurelia](building-and-testing-aurelia.md) to get started with setting up the repo, building, testing, and debugging.

## Submission Guidelines

### Submitting an Issue

Before you submit your issue, search the archive. It may be that it was already addressed. If your issue appears to be a bug and hasn't been reported, open a new issue. Help us to maximize the effort we can spend fixing issues and adding new features by not reporting duplicate issues. Please provide all the information requested in the issue template. This will increase the chances of your issue being dealt with quickly.

### Submitting a Pull Request

Before you submit your pull request consider the following guidelines:

* Search the appropriate GitHub Repository for an open or closed Pull Request that relates to your submission. You don't want to duplicate effort.
* Make your changes in a new git branch:

  ```bash
  git checkout -b my-fix-branch master
  ```

* Create your patch, **including appropriate test cases**.
* Follow our code rules \(see below\).
* Run the full test suite and ensure that all tests pass.
* Commit your changes using a descriptive commit message that follows our commit message conventions \(see below\). Adherence to the commit message conventions is required because release notes are automatically generated from these messages.

  ```bash
  git commit -a
  ```

  > **Note**: The optional commit `-a` command line option will automatically "add" and "rm" edited files.

* Build your changes locally and ensure all the tests in `__tests__` pass:

  ```bash
  npm run test-chrome
  ```

* Push your branch to GitHub:

  ```bash
  git push origin my-fix-branch
  ```

* In GitHub, send a Pull Request to the master branch.
* If we suggest changes then:
  * Make the required updates.
  * Re-run the test suite to ensure tests are still passing.
  * Rebase your branch and force push to your GitHub Repository \(this will update your Pull Request\):

    ```bash
    git rebase master -i
    git push -f
    ```

{% hint style="warning" %}
**Important**

The first time you submit a PR to a project under the Aurelia organization on GitHub, you will be prompted to sign the Contributor License Agreement \(CLA\). We cannot accept the PR without this \(see below for details\).
{% endhint %}

### After Your Pull Request is Merged

After your pull request is merged, you can safely delete your branch and pull the changes from the main \(upstream\) repository:

* Delete the remote branch on GitHub either through the GitHub web UI or your local shell as follows:

  ```bash
  git push origin --delete my-fix-branch
  ```

* Check out the master branch:

  ```bash
  git checkout master -f
  ```

* Delete the local branch:

  ```bash
  git branch -D my-fix-branch
  ```

* Update your master with the latest upstream version:

  ```bash
  git pull --ff upstream master
  ```

## Coding Rules

To ensure consistency throughout the source code, keep these rules in mind as you are working:

* All features or bug fixes **must be tested** by one or more specs.
* All public API methods **must be documented**. To see how we document our APIs, please check out the existing docs.
* Instead of complex inheritance hierarchies, we **prefer simple objects**.
* Ensure that your code passes the lint check.

## Git Commit Guidelines

We have very precise rules over how our git commit messages can be formatted. This leads to **more readable messages** that are easy to follow when looking through the **project history**. But also, we use the git commit messages to **generate the changelog**.

### Commit Message Format

Each commit message consists of a **header**, a **body** and a **footer**. The header has a special format that includes a **type**, a **scope**, and a **subject**:

```text
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

The subject line of the commit message cannot be longer than 100 characters. This allows the message to be easier to read on GitHub as well as in various git tools.

#### Type

Please use one of the following:

* **feat**: A new feature
* **fix**: A bug fix
* **docs**: Documentation only changes
* **style**: Changes that do not affect the meaning of the code \(white-space, formatting, missing semi-colons, etc.\)
* **refactor**: A code change that neither fixes a bug or adds a feature
* **perf**: A code change that improves performance
* **test**: Adding missing tests
* **chore**: Changes to the build process or auxiliary tools and libraries such as documentation generation

#### Scope

The scope could be anything specifying the location of the commit change. For example `template-compiler` or `reporter`.

#### Subject

The subject contains a succinct description of the change:

* Use the imperative, present tense: "change" not "changed" nor "changes".
* Don't capitalize the first letter.
* Do not add a dot \(.\) at the end.

#### Body

The body should include the motivation for the change and contrast this with previous behavior.

#### Footer

The footer should contain any information about **Breaking Changes** and is also the place to reference GitHub issues that this commit **Closes**.

## Joining the Core Team

[The Aurelia Core Team](https://github.com/orgs/aurelia/people) is made up of select community members who are committed to maintaining and evolving Aurelia over the long-term. The team may grow or shrink depending on project needs, member availability, and other factors. Core team members are typically long-time Aurelia community members who have shown enthusiasm while taking the initiative to improve Aurelia in various ways, including fixing bugs, implementing features, writing documentation/books/blogs, triaging issues, and more. Each member has shown a consistency of quality and cadence in their contributions. If you are interested in joining the core team, please reach out to aurelia-team@bluespire.com. We'd be happy to discuss opportunities with you.

