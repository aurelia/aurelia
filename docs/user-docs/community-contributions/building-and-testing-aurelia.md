# Build and Testing Aurelia

## Setup

In order to setup Aurelia, ensure that you have [Git](https://git-scm.com/downloads), the latest LTS version of [Node.js](https://nodejs.org/) and `npm@6.0.0` or higher installed.

Clone a copy of the repo:

```text
git clone https://github.com/aurelia/aurelia.git
```

Change to the `aurelia` directory:

```text
cd aurelia
```

Install dev dependencies:

```text
npm ci
```

Install/symlink package dependencies:

```text
npm run bootstrap # just like npm ci, this command only needs to be run once
```

## Build

Once the above steps have been completed, you should be able to build the entire monorepo with this command:

```text
npm run build
```

## Testing

To develop while running tests, you will need two console windows. In one console window, run the following command to build and put the monorepo in dev mode:

```text
npm run dev
```

Next, open a second console window, and change directory to the tests project:

```text
cd packages/__tests__
```

From within this directory, you can run tests in a variety of ways:

* `npm run test-node` - Run all tests in Node.js.
* `npm run test-chrome` - Run all tests in Chrome.
* `npm run test-chrome:watch` - Run all tests in Chrome with watch mode enabled.
* `npm run test-chrome:debugger` - Run all tests in Chrome with the debugger enabled.

> Info See the `package.json` file within the `__tests__` project for additional test-related commands.

