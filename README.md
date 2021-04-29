<p>
  <a href="https://aurelia.io/" target="_blank">
    <img alt="Aurelia" src="https://aurelia.io/styles/images/aurelia.svg">
  </a>
</p>

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://badge.fury.io/js/%40aurelia%2Fkernel.svg)](https://badge.fury.io/js/%40aurelia%2Fkernel)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

# Aurelia Direct Router

This plugin is the original and fully featured Aurelia v2 router. It is a way to provide additional features for those who need or want it. It might later be added back into the core of Aurelia v2.

## Installing

For the latest stable version:

```bash
npm i aurelia-direct-router
```

For our nightly builds:

```bash
npm i aurelia-direct-router@dev
```

## Using

Once the Aurelia Direct Router is installed, simply `import` anything router related from `aurelia-direct-router` instead of from `aurelia` or `@aurelia/router`. So, for example, in your `main.js/ts` file

```js
import Aurelia, { RouterConfiguration } from 'aurelia';
```
should be changed to
```js
import Aurelia from 'aurelia';
import { RouterConfiguration } from 'aurelia-direct-router';
```
Note that while a lot of the API of the router shipping with Aurelia is a subset of the API of Aurelia Direct Router, there are some differences. Please consult the Aurelia Direct Router documentation for details.

## Documentation

You can read the documentation on the Aurelia Direct Router [here](https://jwx.gitbook.io/aurelia-direct-router/). The documentation is still a work-in-progress, with new content added regularly.

## License

The Aurelia Direct Router is MIT licensed. You can find out more and read the license document [here](LICENSE).
