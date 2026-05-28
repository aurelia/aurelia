---
description: Run Aurelia 2 directly in the browser with a module script and CDN imports.
---

# Run Aurelia in the browser without a build step

You can run Aurelia from a plain HTML page by importing the framework as a browser ES module. This works well for CodePen demos, reduced bug reproductions, documentation examples, and small pages where a Vite or Webpack setup would be more ceremony than value.

For application development, the scaffolded Vite setup is still the recommended path. A build tool gives you TypeScript, file-based templates, CSS imports, optimized output, and local package management.

## What to include

A no-build Aurelia page needs these pieces:

- A host element, such as `<app-root></app-root>`.
- A `<script type="module">` block. Static `import` statements only work in module scripts.
- An ESM CDN URL for `aurelia`.
- `CustomElement.define(...)` for inline component definitions.
- `new Aurelia().app({ component, host }).start()` to attach Aurelia to the host element.

The smallest useful page looks like this:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Aurelia without a build step</title>
    <link rel="modulepreload" href="https://esm.sh/aurelia@2.0.0-rc.1" crossorigin>
  </head>
  <body>
    <app-root></app-root>

    <script type="module">
      import { Aurelia, CustomElement } from 'https://esm.sh/aurelia@2.0.0-rc.1';

      const AppRoot = CustomElement.define({
        name: 'app-root',
        template: `
          <h1>\${message}</h1>
          <input value.bind="message">
          <p>You typed: \${message}</p>
        `,
      }, class {
        message = 'Hello from Aurelia';
      });

      await new Aurelia()
        .app({
          component: AppRoot,
          host: document.querySelector('app-root'),
        })
        .start();
    </script>
  </body>
</html>
```

In CodePen, put the host element and the `<script type="module">` block in the HTML panel. If you put the JavaScript in a normal script panel, the browser will reject static `import` statements unless that panel is explicitly configured to emit a module script.

## Pin package versions

Use `@latest` only for quick local experiments. For bug reports, examples in issues, CodePen links, and documentation, pin every Aurelia package to the same version:

```javascript
import { Aurelia, CustomElement } from 'https://esm.sh/aurelia@2.0.0-rc.1';
import { I18nConfiguration } from 'https://esm.sh/@aurelia/i18n@2.0.0-rc.1';
```

When you update one Aurelia package URL, update the others in the same page. Mixing versions can produce duplicate containers, missing registrations, or subtle binding/runtime mismatches.

Avoid bundling each Aurelia package URL independently in a multi-package browser demo. For example, do not add `?bundle` to both `aurelia` and `@aurelia/i18n` unless you have confirmed the CDN keeps a single shared copy of Aurelia's internals. Separate bundles can hide duplicated framework modules.

The examples on this page use `esm.sh`. The same pattern also works with other CDNs that serve browser-ready ES modules. For example, jsDelivr exposes Aurelia's ESM build at `https://cdn.jsdelivr.net/npm/aurelia@2.0.0-rc.1/+esm`.

## Add official Aurelia packages

Import each package from the CDN and register its configuration before calling `.app(...).start()`. This i18n example shows the pattern:

```html
<app-root></app-root>

<script type="module">
  import { Aurelia, CustomElement } from 'https://esm.sh/aurelia@2.0.0-rc.1';
  import { I18nConfiguration } from 'https://esm.sh/@aurelia/i18n@2.0.0-rc.1';

  const AppRoot = CustomElement.define({
    name: 'app-root',
    template: `
      <h1 t="heading"></h1>
      <p t="[text]intro"></p>
    `,
  }, class {});

  await new Aurelia()
    .register(
      I18nConfiguration.customize((options) => {
        options.initOptions = {
          lng: 'en',
          resources: {
            en: {
              translation: {
                heading: 'Hello from i18n',
                intro: 'Text translations update textContent.',
              },
            },
          },
        };
      }),
    )
    .app({
      component: AppRoot,
      host: document.querySelector('app-root'),
    })
    .start();
</script>
```

The `t` attribute writes translated text by default. Use `t="[html]key"` only when the translated value is trusted HTML that you intentionally want inserted as markup.

## Enhance existing HTML

Use `enhance(...)` when the page already contains the markup you want Aurelia to bind. This is useful for progressive enhancement, server-rendered HTML, or a small demo that does not need a custom root element definition.

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Aurelia without a build step</title>
  </head>
  <body>
    <p>${message}</p>

    <script type="module">
      import { Aurelia } from 'https://esm.sh/aurelia@2.0.0-rc.1';

      await new Aurelia()
        .enhance({
          component: { message: 'Hello from enhanced HTML' },
          host: document.body,
        })
        .start();
    </script>
  </body>
</html>
```

Use `.app(...)` when Aurelia owns a component host such as `<app-root>`. Use `.enhance(...)` when Aurelia should bind markup that is already in the document.

## Browser-only constraints

No-build examples run as plain browser JavaScript. Keep these constraints in mind:

- Browsers do not run TypeScript directly. Use JavaScript in the page, or use a build tool for TypeScript examples.
- Decorator syntax needs transpilation. Prefer `CustomElement.define(...)` for no-build examples.
- Local `.html`, `.css`, and `.json` imports are bundler features in most Aurelia apps. Inline small templates in the component definition, or fetch external data over HTTP.
- If your example fetches local files, serve it from `http://localhost` instead of opening it with `file://`. Browser security rules block many `file://` fetches.
- Keep CDN package versions aligned across `aurelia`, `@aurelia/*` packages, and any plugin packages used by those integrations.

When an example grows beyond a single page, move it to the normal project setup from the [Quick Install Guide](quick-install-guide.md).
