---
description: >-
  A developer guide for enabling SVG binding in the Aurelia.
---

# SVG

Learn about enabling SVG binding in Aurelia template.

## Adding SVG registration

By default, Aurelia won't work with SVG elements, since SVG elements and their attributes require different parsing rules. To teach Aurelia how to handle SVG element bindings, add the `SVGAnalyzer` like the following example:

```typescript
import { SVGAnalyzer } from '@aurelia/runtime-html';
import { Aurelia } from 'aurelia';

Aurelia
    .register(SVGAnalyzer) // <-- add this line
    ...
```

After adding this registration, bindings with attributes will work as expected and the syntax is the same with the other bindings. Readmore on the basic binding syntax of Aurelia [here](./template-syntax.md#attribute-bindings).
