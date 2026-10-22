[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![CircleCI](https://circleci.com/gh/aurelia/aurelia.svg?style=shield)](https://circleci.com/gh/aurelia/aurelia)
[![npm](https://img.shields.io/npm/v/@aurelia/runtime-html.svg?maxAge=3600)](https://www.npmjs.com/package/@aurelia/runtime-html)
# @aurelia/runtime-html

## Installing

For the latest stable version:

```bash
npm i @aurelia/runtime-html
```

## SSR producer protocol

This reference is for tools that produce server-rendered Aurelia markup, SSR manifests, or compiled definitions. It covers the text-node preparation and instruction contracts used by `Aurelia.hydrate()`.

### Prepare the rendered root

HTML serialization and parsing can drop empty text nodes and merge adjacent ones. To preserve the boundaries recorded in the SSR manifest:

1. Render with hydration markers and record the manifest from that DOM. When rendering through Aurelia, register `ISSRContext` with `preserveMarkers: true`.
2. Call `prepareSSRForSerialization(root)` **after recording the manifest**, immediately before serializing that root. The helper mutates the DOM, so recording node counts afterward would include its extra markers.
3. Preserve hydration comments and whitespace through serialization, minification, and delivery.

The helper uses these comments to protect ordinary text nodes. It skips content inside elements such as `<script>`, `<style>`, `<textarea>`, and `<title>`:

| Marker | Purpose |
| --- | --- |
| `<!--au-e-->` | Stands in for an empty text node. |
| `<!--au-t-->` | Separates adjacent text nodes that would otherwise merge. |
| `<!--au-hm-->` | Records preparation of the supplied root as its first child. |

The root marker does not prove that all other markers or whitespace survived delivery. Its absence triggers a development warning during hydration, but does not by itself mean hydration will fail.

### Restore the corresponding root

For `Aurelia.hydrate({ host, ... })`, prepare the corresponding server host before serializing its contents. `hydrate()` calls `restoreSSRTextNodes(host)` before adopting the client DOM; do not restore that host separately first.

Custom adoption code can call `restoreSSRTextNodes(root)` itself. Pair preparation and restoration at the same boundary: a prepared document with the parsed document, a fragment with the parsed fragment, or a host's contents with the corresponding client host. A marker on a nested root does not establish preparation of its parent.

Restoration replaces `au-e` with empty text nodes and removes `au-t` and `au-hm`. Its boolean result says whether the supplied root started with `au-hm` before restoration; it is not a check of the full DOM against the manifest.

### Emit textarea and title content instructions

The HTML parser treats the contents of native `<textarea>` and `<title>` elements as RCDATA: comment syntax inside them becomes text. Target the element itself, with the normal `<!--au-->` target marker **before** the element:

```html
<!--au--><textarea></textarea>
```

For content such as `${value}`, emit:

```typescript
import { itInterpolation, type InterpolationInstruction } from '@aurelia/template-compiler';

const instruction: InterpolationInstruction = {
  type: itInterpolation,
  from: '${value}',
  to: 'textContent',
  isTextContent: true,
};
```

The renderer recreates text targets inside the element and binds each expression independently using `ContentBinding`. This keeps `null` and `undefined` empty and prevents a neighboring expression's update from bypassing a debounced expression.

For the `ISSRDefinition` wire format, include `isTextContent: true` alongside `type: itInterpolation`, `exprIds`, `parts`, and `to: 'textContent'`. `hydrateSSRDefinition()` preserves explicit `true`. Without the flag, the instruction keeps its existing property-interpolation behavior, even when `to` is `textContent`.

Update or regenerate older native textarea/title output to use this element target and flag. Adding serialization markers or calling `prepareSSRForSerialization()` cannot repair the earlier instruction layout. The helper skips text inside these elements; emitting comments there would display them as literal text. Ordinary property interpolation and SVG `<title>` handling are unchanged.
