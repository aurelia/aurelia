# Errors

## Error message format

Encountered an error and looking for answers? You've come to the right place.

{% hint style="danger" %}
This section is a work in progress and not yet complete. If you would like to help us document errors in Aurelia, we welcome all contributions.
{% endhint %}

Coded errors in Aurelia use the format `AURxxxx:yyyy` where:

* `AUR` is the prefix to indicate it's an error from Aurelia
* `xxxx` is the code
* `:` is the delimiter between the prefix, code and the dynamic information associated with the error
* `yyyy` is the extra information, or parameters related to the error

## Enabling development debug information

When using production builds of the core Aurelia packages, you may see an error message like `AUR0015:abcxyz`, which can be hard to interpret during development.

In development builds, Aurelia errors typically include a human-readable message and a link to the corresponding documentation page.

### Vite

`@aurelia/vite-plugin` automatically picks the development build when `process.env.NODE_ENV` is not `production`. You can also override this using the `useDev` option:

```ts
import { defineConfig } from 'vite';
import aurelia from '@aurelia/plugin-vite';

export default defineConfig({
  plugins: [
    aurelia({ useDev: true }),
  ],
});
```

### Webpack

Add an alias to `resolve.alias` in your `webpack.config.js`, similar to the scaffolding template at:

`https://github.com/aurelia/new/blob/06f06862bab5f7b13107237a69cf59de1385d126/webpack/webpack.config.js#L117-L123`

### Other bundlers/dev servers

The `dist` folder of an Aurelia core package looks like this:

```text
dist
  |
  + -> cjs
  |     |
  |     + -> index.cjs
  |     + -> index.dev.cjs
  |
  + -> esm
        |
        + -> index.mjs
        + -> index.dev.mjs
```

Whenever there's a request to retrieve `dist/esm/index.mjs`, you can redirect it to `dist/esm/index.dev.mjs`.

## Error docs index

In development builds, follow the documentation link printed in the error message. Some `AURxxxx` codes are reused across packages; the link printed by the package is the authoritative source.

### Core

- `@aurelia/kernel` — [0001-to-0023](0001-to-0023/)
- `@aurelia/expression-parser` — [0151-to-0179](0151-to-0179/)
- `@aurelia/runtime` — [0203-to-0227](0203-to-0227/)
- `@aurelia/template-compiler` — [0088-to-0723](0088-to-0723/)
- `@aurelia/runtime-html` — [runtime-html](runtime-html/)
- `@aurelia/platform` — [platform](platform/)

### Routing

- `@aurelia/router` — [router](router/)

### Optional packages

- `@aurelia/dialog` — [0901-to-0908](0901-to-0908/)
- `@aurelia/i18n` — [4000-to-4002](4000-to-4002/)
- `@aurelia/validation` — [4100-to-4106](4100-to-4106/)
- `@aurelia/validation-html` — [4200-to-4206](4200-to-4206/)
- `@aurelia/fetch-client` — [5000-to-5008](5000-to-5008/)
- `@aurelia/ui-virtualization` — [ui-virtualization](ui-virtualization/)
