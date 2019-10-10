---
description: Get setup to build and test the Aurelia 2 source!
---

# Build and Testing Aurelia

If you're looking to contribute directly to Aurelia or its test suite, you've come to the right place!

{% hint style="success" %}
**Here's what you'll learn...**

* Setting up your machine and cloning the Aurelia repository.
* Building the entire Aurelia 2 monorepo.
* Running tests in the browser and Node.js.
{% endhint %}

## Setup

In order to setup Aurelia, ensure that you have [Git](https://git-scm.com/downloads), the latest LTS version of [Node.js](https://nodejs.org/), and `npm@6.0.0` or higher installed.

Clone a copy of the Aurelia repo:

```bash
git clone https://github.com/aurelia/aurelia.git
```

Change to the `aurelia` directory:

```bash
cd aurelia
```

Install the development dependencies:

```bash
npm ci
```

Install and symlink the internal package dependencies:

```bash
npm run bootstrap
```

{% hint style="info" %}
**Note**

The `npm ci` and `npm run bootstrap` commands only need to be run once for the repo.
{% endhint %}

## Build

Once the above steps have been completed, you should be able to build the entire Aurelia monorepo with this command:

```bash
npm run build
```

## Testing

To develop while running tests, you will need two console windows. In one console window, run the following command to build and put the monorepo in development mode:

```bash
npm run dev
```

Next, open a second console window, and change directory to the `__tests__` project:

```bash
cd packages/__tests__
```

From within this directory, you can run tests in a variety of ways:

* `npm run test-node` - Run all tests in Node.js.
* `npm run test-chrome` - Run all tests in Chrome.
* `npm run test-chrome:watch` - Run all tests in Chrome with watch mode enabled.
* `npm run test-chrome:debugger` - Run all tests in Chrome with the debugger enabled.

{% hint style="info" %}
**Additional Test Commands**

See the `package.json` file within the `__tests__` project for additional test-related commands.
{% endhint %}

