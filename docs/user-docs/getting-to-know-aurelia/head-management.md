---
description: Set the title, meta, link and JSON-LD tags from routes and components, and render them on the server.
---

# Managing the document head

Public pages need more than a title: a description, Open Graph tags for link previews, a canonical URL, `hreflang` alternates, and structured data. Aurelia manages these through `IHead`, a small opt-in service in `@aurelia/runtime-html`. Routes and components contribute tags; the service keeps one tag per key in `document.head`, puts back whatever a tag replaced when its owner goes away, and writes the same tags on the server so crawlers and link-preview scrapers see them.

## Setup

Register `HeadConfiguration`:

```typescript
import Aurelia, { HeadConfiguration } from 'aurelia';
import { MyApp } from './my-app';

Aurelia
  .register(HeadConfiguration)
  .app(MyApp)
  .start();
```

Apps that don't register it don't ship the service or `<au-head>`, since bundlers drop both. The router detects the service and only then routes its titles through it.

## In a template: `<au-head>`

Put `<au-head>` anywhere in a component's template. Its children are rendered into `document.head` instead of in place, and their bindings stay live:

```html
<au-head>
  <title>${product.name}</title>
  <meta name="description" content.bind="product.summary">
  <meta property="og:title" content.bind="product.name">
  <meta property="og:image" content.bind="product.imageUrl">
  <link rel="canonical" href="https://shop.example/products/${product.slug}">
</au-head>
```

When `product` changes, the tags update. When the component is removed, its tags are removed too, and the tags they had replaced come back.

`<au-head>` itself doesn't exist at runtime. `HeadConfiguration` registers a template compiler hook that removes it and leaves each child in its place under a small template controller, so the page body only gets a pair of comment markers per tag. That is also why it hydrates cleanly after server rendering. If your templates are compiled at build time, the build has to register `HeadConfiguration` too.

The allowed children are `<title>`, `<meta>`, `<link>`, `<script>` and `<base>`. `<let>` and `<template>` with template controllers are allowed for structure:

```html
<au-head>
  <link repeat.for="locale of locales" rel="alternate" hreflang.bind="locale.code" href.bind="locale.url">
  <template if.bind="!product.published">
    <meta name="robots" content="noindex">
  </template>
</au-head>
```

Anything else throws [AUR0825](../developer-guides/error-messages/runtime-html/aur0825.md).

### Structured data

Bind JSON-LD with `json.bind` on a `<script>`. The value goes through `JSON.stringify`, and `<`, `>` and `&` are escaped, so a product name containing `</script>` can't break out of the element:

```html
<au-head>
  <script type="application/ld+json" key="product" json.bind="productSchema"></script>
</au-head>
```

While the bound value is `null` or `undefined`, the script is left out. Interpolating inside a `<script>` is rejected with [AUR0826](../developer-guides/error-messages/runtime-html/aur0826.md) because the interpolated value would not be escaped.

## On a route

Routes accept a `head` option next to `title`. It takes the same tags as `IHead`, except `title`, which keeps coming from the route's `title`:

```typescript
import { route } from '@aurelia/router';

@route({
  routes: [
    {
      path: 'products',
      component: import('./product-list'),
      title: 'Products',
      head: {
        meta: [{ name: 'description', content: 'Everything we sell, in one place.' }],
      },
    },
    {
      path: 'c/:category',
      component: import('./category'),
      head: node => ({
        link: [{ rel: 'canonical', href: `https://shop.example/c/${node.params.category}` }],
      }),
    },
  ],
})
export class MyApp {}
```

A child route's tag replaces a parent route's tag with the same key. Route titles, `buildTitle` and `router.load(..., { title })` go through the same service, so the [title template](#app-defaults-and-title-template) applies to them.

With `HeadConfiguration` registered, the router updates the head on every navigation, including navigations with `historyStrategy: 'none'`. A route without a title, or a `buildTitle` that returns `null`, contributes no title, so the next title down (`defaults`, or the page's original `<title>`) shows instead of the previous route's title lingering. Without `HeadConfiguration`, the router keeps setting `document.title` exactly as it did before.

## From code: `IHead`

`<au-head>` and the router are both built on `IHead`. Use it directly when the tags come from data you load in code:

```typescript
import { resolve } from '@aurelia/kernel';
import { IHead } from '@aurelia/runtime-html';
import type { Params } from '@aurelia/router';

export class ProductPage {
  private readonly head = resolve(IHead);
  private readonly tags = this.head.create();
  private readonly api = resolve(IProductApi);

  async loading(params: Params) {
    const product = await this.api.product(params.id);
    this.tags.set({
      title: product.name,
      meta: [{ name: 'description', content: product.summary }],
      script: [{ type: 'application/ld+json', key: 'product', json: toProductSchema(product) }],
    });
  }

  unloading() {
    this.tags.dispose();
  }
}
```

`create()` returns a source. `set()` replaces everything the source contributes, and elements with an unchanged key are patched in place rather than recreated. `dispose()` removes the source's tags. A disposed source can be `set()` again.

The input has these fields:

| Field | Type | Notes |
|---|---|---|
| `title` | `string` | Formatted by `titleTemplate` |
| `meta` | `HeadTagInput[]` | Every property except `key` becomes an attribute |
| `link` | `HeadTagInput[]` | |
| `script` | `HeadScriptInput[]` | `json` is serialized safely, `text` is written as is |
| `base` | `HeadTagInput` | |
| `htmlAttrs` | `Record<string, string>` | Attributes on `<html>`, such as `lang` and `dir` |

`null`, `undefined` and `false` leave an attribute out, and `true` renders it without a value.

## Keys and precedence

Tags with the same key replace each other instead of being rendered twice:

| Tag | Key |
|---|---|
| `<title>` | one per document |
| `<base>`, `<meta charset>` | one per document |
| `<meta name>`, `property`, `http-equiv`, `itemprop` | that attribute's value, plus `media` when present |
| `<link rel="canonical">` | one per document |
| `<link rel="alternate" hreflang>` | `hreflang` |
| other `<link>` | `rel` and `href` |
| `<script src>` | `src` |
| anything else | no key, never replaced |

Pass `key` (a `key` attribute in `<au-head>`) to choose a key yourself. It is required to deduplicate JSON-LD, and the attribute is not written to the document.

Key attributes are read when a tag is added. Binding `name` or `rel` to a value that changes later does not move the tag to a new key.

When several sources set the same key, the highest priority wins, and within a priority the most recently activated source wins:

| Priority | Source |
|---|---|
| `HeadPriority.defaults` (-200) | `defaults` in `HeadConfiguration` |
| `HeadPriority.route` (-100) | route `title`, `head` and the generated canonical link |
| `HeadPriority.component` (0) | `<au-head>` and `head.create()` |

So a routed page's `<au-head>` always wins over its route config, and a nested component's `<au-head>` wins over its parent's. `head.create({ priority })` takes any number if you need to step outside these levels.

{% hint style="warning" %}
Within one template, "most recently activated" follows document order. Put `<au-head>` at the top of a template so tags from child components rendered below it win.
{% endhint %}

The service only touches tags it created, which carry a `data-au-head` attribute. The exception is a tag already in the page (usually `index.html`) with a key a source sets. That tag is swapped out while a source owns the key and put back afterwards, in the same position.

## App defaults and title template

```typescript
Aurelia.register(HeadConfiguration.customize({
  titleTemplate: title => title ? `${title} | Acme Shop` : 'Acme Shop',
  defaults: {
    title: '',
    meta: [{ property: 'og:site_name', content: 'Acme Shop' }],
  },
  canonical: { origin: 'https://shop.example', keepQuery: ['page'] },
}));
```

- `titleTemplate` formats every title, whichever source set it. With `defaults.title` set to `''`, pages without a title still get `Acme Shop`. When no source sets a title at all, the page's original `<title>` is restored as is.
- `defaults` applies for as long as the app runs, below everything else.
- `canonical` makes the router write `<link rel="canonical">` on every navigation: the origin, the base path, the route path, and only the query parameters in `keepQuery`. The fragment is dropped. With hash routing the hash path is kept, because it is the page's identity. A route or component that sets its own canonical link overrides the generated one.

## Server-side rendering

On the server the service writes to the server document the same way it does in the browser, so a server that renders the whole document needs nothing extra.

If your server renders only the app host and fills in the `<head>` of an HTML template itself, call `serialize()` after the app has started. It returns the managed `<title>` and tags as a string:

```typescript
await au.start();
const headHtml = container.get(IHead).serialize();
const html = template
  .replace('<!--head-->', headHtml)
  .replace('<!--app-->', host.innerHTML);
```

Remove from the template any tag the app manages, otherwise the page ends up with both. `htmlAttrs` are not part of `serialize()`; read them from the server document's `<html>` element.

When the client hydrates, the body markup is adopted as is: each head tag appears in the SSR manifest as an ordinary template controller entry and leaves nothing to adopt in the body. In the head, the service takes over server-rendered tags (`data-au-head`) by key instead of adding duplicates. Tags from routes and `IHead` sources keep the server element and only have their attributes patched. Tags from `<au-head>` are the client's own bound elements, so they replace the server element in the same position. Server tags that nothing on the client claims are removed once the app has activated and the router's first navigation has finished. If other async startup work sets head tags, such as loading translations before setting `lang`, pass its promise to `head.waitFor()` from an app task so its tags are counted too.

{% hint style="info" %}
A server-rendered page only contains the result, not what `index.html` had before. When a client navigation removes the last source for a key, a tag that came from the server is removed rather than restored, and the title keeps the text the server rendered. Put fallback values in `defaults` instead of in `index.html` when you render on the server.
{% endhint %}

Give JSON-LD scripts a `key`. Tags without a key can't be matched to their server-rendered copy, so both copies exist until the server one is removed after startup.

## What to keep out of `<au-head>`

`<au-head>` is meant for metadata. A `<script src>` in it runs again when the client takes over its server-rendered copy, and a `<link rel="stylesheet">` is swapped for a new element that has to load before it applies. Load application scripts and styles from `index.html` or your bundler, or add them through `IHead`, which reuses the server-rendered element.
