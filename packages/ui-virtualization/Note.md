# aurelia-v2-virtual-repeat

A plugin for doing virtualization with Aurelia 2

[DEMO](https://aurelia-v2-virtual-repeat.vercel.app/)

Size:
- Minified: 12KB
- Minified + gzip: 4KB

## Installation

To install the plugin, do:
```
npm install aurelia-v2-virtual-repeat
```

To register the standard behavior of the plugin in your application, add `DefaultVirtualRepeatConfiguration` to your Aurelia instance:

```ts
import { DefaultVirtualRepeatConfiguration } from 'aurelia-v2-virtual-repeat';

Aurelia.register(DefaultVirtualRepeatConfiguration).app(MyApp).start();
```

## Usage

### Standard usages:

This plugin can be used like the standard repeater, like in the following example:

#### With div
```html
<template>
  <div virtual-repeat.for="item of items">
    ${$index} ${item}
  </div>
</template>
```

#### With table
```html
<template>
  <table>
    <tr virtual-repeat.for="item of items">
      <td>${$index}</td>
      <td>${item}</td>
    </tr>
  </table>
</template>
```

#### With ordered/unordered lists
```html
<template>
  <ul>
    <li virtual-repeat.for="item of items">
      ${$index} ${item}
    </li>
  </ul>
</template>
```

### Note:

The `virtual-repeat` requires to be placed inside a "scrollable" element, which means the element should have either `overflow: scroll` or `overflow: auto` in its styles. An error will be throw if the `virtual-repeat` is unable to locate such element.

## Caveats

1. There's only a single mode for the attribute `virtual-repeat`: DOM recycling mode. In this mode, it is expected that the DOM nodes will be moved around, and only binding data will be changed. Application should be aware of this and employ reactive programming model with change handler `xxxxxChanged()` to avoid surprises.
2. `<template/>` is not supported as a root of a repeat template, use a normal element instead
3. Similar to (1), beware of `:nth-child` and similar CSS selectors. This implementation requires appropriate shifting visible items, based on scroll position. This means DOM elements order will not stay the same, thus creating unexpected `:nth-child` CSS selector behavior. To work around this, you can use contextual properties `$index`, `$odd`, `$even`, `$first`, `$last`, `$middle`, `$length` to determine the position of an item, and apply CSS classes/styles against it, like the following example:
    ```html
    <template>
      <div virtual-repeat.for="person of persons" class="${$odd ? 'odd' : 'even'}-row">
        ${person.name}
      </div>
    </template>
    ```
4. Similar to (2), other template controllers cannot be used in conjunction with the `virtual-repeat`, unlike the standard `repeat`. I.e: built-in template controllers: `with`, `if`, `au-slot` cannot be used with the `virtual-repeat`. This can be workaround'd by nesting other template controllers inside the repeated element, with `<template/>` element, for example:
    ```html
    <template>
      <h1>${message}</h1>
      <div virtual-repeat.for="person of persons">
        <template with.bind="person">
          Person name is: ${name}
        </template>
      </div>
    </template>
    ```

## Plugin Development & Contribution

To develop the plugin, run

```
npm run test
```

Run unit tests in watch mode.

```
npm run test:watch
```

## Development plan

- This plugin is a way to provide the feature earlier for those who need, and later will be incorporated into the core of Aurelia v2.
- Only a single DOM recycling, same items height assumed mode is supported with the `virtual-repeat` attribute at the moment. In the future, there will be more: non-recycling mode, variable height, and maybe an additional of `<au-virtual-repeat>` custom element for more control over the behavior of the repeat.
- Only array/null/undefined are supported at the moment, `Set` & `Map` are harder as they require better collection to index mapping
- Infinite scrolling is not supported yet, if there's a need to load more items, can listen to the scroll even on the scroller element, and invoke the item retrieval calls
- Virtualization on the whole page (document mode) support is removed. If there's enough demand, it will be added back.
- Cross shadow DOM boundary virtualization is not supported, as the algorithm for determining the scroller element is more comlex, though it should be doable.

## TODO:

- [ ] More tests
- [ ] Infinite scrolling aka load more (v1)
- [ ] Variable height mode
- [ ] Listenable events
- [ ] Non dom-recycling mode
- [ ] Cross shadow DOM boundary
- [ ] Custom element
- [ ] Set/Map support
- [ ] Whole page mode
