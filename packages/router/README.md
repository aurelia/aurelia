[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![npm](https://img.shields.io/npm/v/aurelia-direct-router.svg?maxAge=3600)](https://www.npmjs.com/package/aurelia-direct-router)
# aurelia-direct-router

## Installing

For the latest stable version:

```bash
npm i aurelia-direct-router
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

You can read the documentation on the Aurelia Direct Router [here](https://jwx.gitbook.io/aurelia-direct-router/).

