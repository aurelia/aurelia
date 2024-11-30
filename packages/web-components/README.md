[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![CircleCI](https://circleci.com/gh/aurelia/aurelia.svg?style=shield)](https://circleci.com/gh/aurelia/aurelia)
[![npm](https://img.shields.io/npm/v/@aurelia/web-components.svg?maxAge=3600)](https://www.npmjs.com/package/@aurelia/web-components)

# @aurelia/web-components

## Installing

For the latest stable version:

```bash
npm i @aurelia/web-components
```

For our nightly builds:

```bash
npm i @aurelia/addons@web-components
```

## Usage

Here is an example configuration for webcomponents.js to show how to register aurelia custom elements into web components:

```
import { WcCustomElementRegistry } from '@aurelia/web-components'; 
import { DI, Registration  } from '@aurelia/kernel';
import { StandardConfiguration, IPlatform } from '@aurelia/runtime-html';
import {BrowserPlatform} from '@aurelia/platform-browser'

// Create the Aurelia container
const container = DI.createContainer();
// Register the platform
container.register(
  Registration.instance(IPlatform, BrowserPlatform.getOrCreate(globalThis)));
// Register the StandardConfiguration
container.register(StandardConfiguration); // This registers core services like IExpressionParser
const registry = container.get(WcCustomElementRegistry);

// Import custom component classes
import { HelloName} from './components/hello-name';
// Register web component name with it's view model implementation
registry.define('my-hello-name', HelloName);
```

An example `vite.webcomponents.config`:
```
export default defineConfig({
  ...
  
  build: {
    lib: {
      entry: './src/webcomponents.js', // Entry point for the web components
      name: 'MyComponents', // Global name for the library
      fileName: (format) => `my-components.${format}.js`, // Output file name
    },
    rollupOptions: {
      external: [], // Add external dependencies here if needed
      output: {
        globals: {}, // Define global variables for external libraries if any
      },
    },
    outDir: './dist-webcomponents', // Output directory for the web components
  },
  ...
});
```
You may also add separate `buildwc` task for building web components inside `package.json`:
```
...
"scripts": {
    ...
    "buildwc": "vite build --config vite.webcomponents.config.js",
    ...
  },
...
```  
Then you may build web components using `npm run buildwc` and copy e.g. the resulting `dist/my-components.es.js` and style `style.css` into your desired location and use '<my-hello-name></my-hello-name>' web component in `index.html`:
```
<html>
  <head>
  ...
    <script src="my-components.es.js" type="module"></script>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>    
  ...
  <my-hello-name></my-hello-name>
  ...
  </body>
</html>
```
