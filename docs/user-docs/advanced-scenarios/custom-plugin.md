One of the most important needs of users is to design custom plugins. In the following, we want to get acquainted with how to design a plugin in the form of a mono-repository structure with configuration.

### What is mono-repository?


### How NPM v7 helps us?


### What is the scenario?

To move forward with a practical example. We want to implement Bootstrap components in a custom mono-repository with a lot of configuration to make it customizable.

### What is the library structure?

We want to separate our plugin in three packages.

* **bootstrap-v5-core**

We will add the Bootstrap 5 configurations in this package.

* **bootstrap-v5**

Our Bootstrap 5 components will define in this package. `bootstrap-v5` depends `bootstrap-v5-core` packages.

* **demo**

We will use our plugin in this package as a demo. `demo` depends on `bootstrap-v5-core` and `bootstrap-v5`.

![](/images/write-a-custom-plugin-with-aurelia-2-and-lerna/packages.png)

### How to configure NPM v7?

To config your monorepos, you should do as following:

Install `Lerna` as a global tool.

```bash
npm i lerna -g
```

Go to a folder that you want to make project and run

```bash
lerna init
```

The result should contain

* `packages`: The folder you will create your repositories there.
* `lerna.json`: Lerna's configuration file.
* `package.json`: Node's configuration file.

Open your `packages` folder and install the projects inside it.

```bash
npx makes aurelia bootstrap-v5-core -s typescript
npx makes aurelia bootstrap-v5 -s typescript
npx makes aurelia demo -s typescript
```

After creating, delete all files inside `src` folders of `bootstrap-v5-core` and `bootstrap-v5`. We will add our files there.

To continue we need to config `Lerna`, Open your `lerna.json` and paste the followimg code:

```json
{
  "version": "0.1.0",
  "npmClient": "npm",
  "command": {
    "bootstrap": {
      "hoist": "**"
    }
  },
  "packages": ["packages/*"]
}
```

**version**: the current version of the repository.

**npmClient**: an option to specify a specific client to run commands with (this can also be specified on a per command basis). Change to "yarn" to run all commands with yarn. Defaults to "npm".

**command.bootstrap.hoist**: Common dependencies will be installed only to the top-level `node_modules`, and omitted from individual package `node_modules`.

**packages**: Array of globs to use as package locations.

## How to manage dependencies?

As described in the structure section defined packages depend on each other. So, we link them together and add the other prerequisites for each.

* **bootstrap-v5-core**

This package has no dependency.

* **bootstrap-v5**

Go to `package.json` and add the following dependencies:

```js
// bootstrap-v5/package.json
"dependencies": {	
    "aurelia": "dev",
    "bootstrap": "^5.0.0-alpha2",	
    "bootstrap-v5-core": "0.1.0"
},
```

* **demo**

Go to `package.json` and add the following dependencies

```js
// demo/package.json
"dependencies": {	
    "aurelia": "dev",	
    "bootstrap-v5-core": "0.1.0",
    "bootstrap-v5": "0.1.0"
},
```

**Note**: All created packages have `0.1.0` version so pay attention if the version changes, update it in other packages.

Finally, run the below command inside your root folder (where `lerna.json` is) to install packages.

```bash
lerna bootstrap
```

### How to define plugin configuration?

Go to the `src` folder of `bootstrap-v5-core` package and create each of below files there.

**Size**

As I mentioned before, I want to write a configurable Bootstrap plugin so create `src/Size.ts` file.

```js
export enum Size {
    ExtraSmall = 'xs',
    Small = 'sm',
    Medium = 'md',
    Large = 'lg',
    ExtraLarge = 'xl',
}
```

I made a `Size` enum to handle all Bootstrap sizes. Next we can manage our components according to size value.

**Global Bootstrap 5 Options**

Create `src/IGlobalBootstrapV5Options.ts` file.

```js
import { Size } from "./Size";
export interface IGlobalBootstrapV5Options {
    defaultSize?: Size;
}
export const defaultOptions: IGlobalBootstrapV5Options = {
    defaultSize: Size.Medium
};
```

You need to define your configs via an interface With its default values as a constant.

**DI**

Create `src/BootstrapV5Configuration.ts` file.

```js
import { DI, IContainer, Registration } from "aurelia";
import { IGlobalBootstrapV5Options, defaultOptions } from './IGlobalBootstrapV5Options';

export const IBootstrapV5Options = DI.createInterface<IGlobalBootstrapV5Options>('IBootstrapV5Options').noDefault();

function createIBootstrapV5Configuration(optionsProvider: (options: IGlobalBootstrapV5Options) => void) {
    return {
        optionsProvider,
        register(container: IContainer) {
            optionsProvider(defaultOptions);
            return container.register(Registration.instance(IBootstrapV5Options, defaultOptions))
        },
        customize(cb?: (options: IGlobalBootstrapV5Options) => void) {
            return createIBootstrapV5Configuration(cb ?? optionsProvider);
        },
    };
}

export const BootstrapV5Configuration = createIBootstrapV5Configuration(() => {});
```

We can define our `IGlobalBootstrapV5Options` to DI container so this happened via `IBootstrapV5Options` constant.

`createIBootstrapV5Configuration` is the most important part of creating settings. 

* `register(container: IContainer)` helps us to introduce our default config to DI container.

* `customize(cb?: (options: IGlobalBootstrapV5Options) => void)` alse helps us to introduce our custom config to the DI container.

Finally, we should export our current configuration with default options via `BootstrapV5Configuration`.

**Exports**

Create `src/index.ts` file.

```js
export * from './BootstrapV5Configuration';
export * from './IGlobalBootstrapV5Options';
export * from './Size';
```

Create new `index.ts` file inside `bootstrap-v5-core` package.

```js
export * from './src';
```

### How to implement the custom plugin?

Go to the `src` folder of `bootstrap-v5` package, create a `button` folder then create each of below files there.

![](/images/write-a-custom-plugin-with-aurelia-2-and-lerna/button.png)

* **Resource**

Create `resource.d.ts` file.

```js
declare module '*.html' {
  import { IContainer } from '@aurelia/kernel';
  import { IBindableDescription } from '@aurelia/runtime';
  export const name: string;
  export const template: string;
  export default template;
  export const dependencies: string[];
  export const containerless: boolean | undefined;
  export const bindables: Record<string, IBindableDescription>;
  export const shadowOptions: { mode: 'open' | 'closed'} | undefined;
  export function register(container: IContainer);
}

declare module '*.css';
declare module '*.scss';
```

* **View**

Create `bs-button.html` file.

```html
<button class="btn btn-primary" ref="bsButtonTemplate">
    Primary Button
</button>
```

* **ViewModel**

Create `bs-button.ts` file.

```js
import { customElement, INode, containerless } from "aurelia";
import template from "./bs-button.html";
import { IBootstrapV5Options, IGlobalBootstrapV5Options, Size } from "bootstrap-v5-core";

@customElement({ name: "bs-button", template })
@containerless
export class BootstrapButton {
  private bsButtonTemplate: Element;
  constructor(
    @IBootstrapV5Options private options: IGlobalBootstrapV5Options
  ) {
  }

  afterAttach() {
    if (this.options.defaultSize) {
      switch (this.options.defaultSize) {
        case Size.ExtraSmall:
        case Size.Small:
          this.bsButtonTemplate.classList.add("btn-sm");
          break;
        case Size.Large:
        case Size.ExtraLarge:
          this.bsButtonTemplate.classList.add("btn-lg");
          break;
        default:
          this.bsButtonTemplate.classList.remove("btn-sm", "btn-lg");
      }
    }
  }
}
```

As you can see we are able to access to plugin options easy via `ctor` (DI) and react appropriately to its values.

In this example I get the size from the user and apply it to the button component.

* **Button Index**

Create `src/button/index.ts` file.

```js
export * from './bs-button';
```

* **Src Index**

Create `src/index.ts` file.

```js
export * from './button';
```

* **Global Index**

Create new `index.ts` file inside `bootstrap-v5` package.

```js
import 'bootstrap/dist/css/bootstrap.min.css';
export * from './src';
```

### How to use it?

Open `demo` package and go to the `src` and update `main.ts`.

```js
import Aurelia from 'aurelia';
import { MyApp } from './my-app';

import { BootstrapV5Configuration, Size } from 'bootstrap-v5-core';
// import { BootstrapButton } from 'bootstrap-v5';
import * as BsComponents from 'bootstrap-v5';

Aurelia

  //.register(BootstrapButton)
  .register(BsComponents)

  //.register(BootstrapV5Configuration)
  .register(BootstrapV5Configuration.customize((options) => { options.defaultSize = Size.Small }))

  .app(MyApp)
  .start();
```

Importing is available for whole components

```js
import * as BsComponents from 'bootstrap-v5';
```

Or just a component

```js
import { BootstrapButton } from 'bootstrap-v5';
```

To register your components you should add them to `register` method. 

```js
.register(BsComponents) // For whole components
// Or
.register(BootstrapButton) // For a component
```

Proudly, we support configuration so we should introduce it to `register` method too.

```js
 // With default options
.register(BootstrapV5Configuration)
// Or with a custom option
.register(BootstrapV5Configuration.customize((options) => { options.defaultSize = Size.Small }))
```

Now, You are able to use your `bs-button` inside `src/my-app.html`.

```html
<div class="message">${message}</div>
<bs-button></bs-button>
```

To run the `demo` easily, go to the root folder (where `lerna.json` is) and add the following script to `package.json`.

```bash
"scripts": {
  "start": "lerna run start --stream --scope demo"
}
```

Then, call the command

```bash
npm start
```

![](/images/write-a-custom-plugin-with-aurelia-2-and-lerna/demo.png)

### How to publish it?
