# Contributing to Aurelia

We'd love for you to contribute to our source code and to make our projects even better than they are today! Here are the guidelines we'd like you to follow:

 - [Code of Conduct](#coc)
 - [Questions or Problems](#question)
 - [Issues and Bugs](#issue)
 - [Feature Requests](#feature)
 - [Submission Guidelines](#submit)
 - [Coding Rules](#rules)
 - [Commit Message Guidelines](#commit)
 - [Signing the CLA](#cla)

## <a name="coc"></a> Code of Conduct

As contributors and maintainers of Aurelia, we pledge to respect every contributor.

Communication through any channels under the control of Aurelia must always be constructive and professional.

We promise to extend courtesy and respect to everyone involved in this project. We expect anyone contributing to Aurelia to do the same.

If any member of the community violates this code of conduct, the maintainers of Aurelia may take action as deemed appropriate.

If you are subject to or witness unacceptable behavior, or have any other concerns, please email us at conduct@bluespire.com.

## <a name="question"></a> Got a Question or Problem?

If you have questions about how to use Aurelia, please direct these to the Gitter Channels or StackOverflow.

## <a name="issue"></a> Found an Issue?

If you find a bug in the source code or a mistake in the documentation, you can help us by submitting an issue. Even better you can submit a Pull Request with a fix.

**Please see the Submission Guidelines below**.

## <a name="feature"></a> Want a Feature?

You can request a new feature by submitting an issue. If you would like to implement a new feature then consider what kind of change it is:

* **Major Changes** that you wish to contribute to the project should be discussed first via an RFC so that we can better coordinate our efforts, prevent duplication of work, and help you to craft the change so that it is successfully accepted into the project.
* **Small Changes** can be crafted and submitted to the GitHub Repository as a Pull Request.

## <a name="developing"></a> Developing

Check out our [engineering/README.md](engineering/README.md) to get started with setting up the repo, building, testing and debugging.

## <a name="submit"></a> Submission Guidelines

### Submitting an Issue

Before you submit your issue, search the archive. It may be that it was already addressed. If your issue appears to be a bug, and hasn't been reported, open a new issue. Help us to maximize the effort we can spend fixing issues and adding new features, by not reporting duplicate issues. Please provide all the information requested in the issue template. This will increase the chances of your issue being dealt with quickly.

### Submitting a Pull Request

Before you submit your pull request consider the following guidelines:

* Search the appropriate GitHub Repository for an open or closed Pull Request that relates to your submission. You don't want to duplicate effort.
* Make your changes in a new git branch:

	```shell
	git checkout -b my-fix-branch master
	```

* Create your patch, **including appropriate test cases**.
* Follow our [Coding Rules](#rules).
* Run the full test suite and ensure that all tests pass.
* Commit your changes using a descriptive commit message that follows our
  [commit message conventions](#commit). Adherence to the [commit message conventions](#commit) is required because release notes are automatically generated from these messages.

	```shell
	git commit -a
	```

	> Note: The optional commit `-a` command line option will automatically "add" and "rm" edited files.

* Build your changes locally to ensure all the tests pass

	```shell
	npm run test
	```

* Push your branch to GitHub:

  ```shell
  git push origin my-fix-branch
  ```

* In GitHub, send a Pull Request to the master branch.
* If we suggest changes then:
	* Make the required updates.
  	* Re-run the test suite to ensure tests are still passing.
  	* Rebase your branch and force push to your GitHub Repository (this will update your Pull Request):

    ```shell
    git rebase master -i
    git push -f
    ```

> Note: The first time you submit a PR to a project under the Aurelia organization on GitHub, you will be prompted to sign the [Contributor License Agreement (CLA)](#cla). We cannot accept the PR without this.

### After Your Pull Request is Merged

After your pull request is merged, you can safely delete your branch and pull the changes from the main (upstream) repository:

* Delete the remote branch on GitHub either through the GitHub web UI or your local shell as follows:

  ```shell
  git push origin --delete my-fix-branch
  ```

* Check out the master branch:

  ```shell
  git checkout master -f
  ```

* Delete the local branch:

  ```shell
  git branch -D my-fix-branch
  ```

* Update your master with the latest upstream version:

  ```shell
  git pull --ff upstream master
  ```

## <a name="rules"></a> Coding Rules

To ensure consistency throughout the source code, keep these rules in mind as you are working:

* All features or bug fixes **must be tested** by one or more specs.
* All public API methods **must be documented**. To see how we document our APIs, please check out the existing docs.
* Instead of complex inheritance hierarchies, we **prefer simple objects**.

## <a name="commit"></a> Git Commit Guidelines

We have very precise rules over how our git commit messages can be formatted.  This leads to **more readable messages** that are easy to follow when looking through the **project history**.  But also, we use the git commit messages to **generate the change log**.

### Commit Message Format

Each commit message consists of a **header**, a **body** and a **footer**.  The header has a special format that includes a **type**, a **scope** and a **subject**:

```
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

The subject line of the commit message cannot be longer 100 characters. This allows the message to be easier to read on GitHub as well as in various git tools.

### Type

Please use one of the following:

* **feat**: A new feature
* **fix**: A bug fix
* **doc**: Documentation only changes
* **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing
  semi-colons, etc)
* **refactor**: A code change that neither fixes a bug or adds a feature
* **perf**: A code change that improves performance
* **test**: Adding missing tests
* **chore**: Changes to the build process or auxiliary tools and libraries such as documentation generation

### Scope

The scope could be anything specifying the location of the commit change. For example `template-compiler` or `reporter`.

### Subject

The subject contains a succinct description of the change:

* Use the imperative, present tense: "change" not "changed" nor "changes".
* Don't capitalize the first letter.
* Do not add a dot (.) at the end.

### Body

The body should include the motivation for the change and contrast this with previous behavior.

### Footer

The footer should contain any information about **Breaking Changes** and is also the place to reference GitHub issues that this commit **Closes**.

## <a name="cla"></a> Signing the CLA

Please sign our Contributor License Agreement (CLA) as part of the pull request process. You will see GitHub prompt you in the "checks" section of the PR after you have made your submission. For any code changes to be accepted, the CLA must be signed. It's a quick process, we promise! You can view the CLA in advance [here](https://gist.github.com/EisenbergEffect/fda70f8bf335118dd4fb84ee6d49e64a).
