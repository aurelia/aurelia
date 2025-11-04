# Markdown integration

{% hint style="info" %}
**Bundler note:** These examples import '.html' files as raw strings (showing '?raw' for Vite/esbuild). Configure your bundler as described in [Importing external HTML templates with bundlers](../../components/components.md#importing-external-html-templates-with-bundlers) so the imports resolve to strings on Webpack, Parcel, etc.
{% endhint %}

The default Aurelia 2 starter uses Vite, which can import plaintext assets with the built-in `?raw` query string. That makes it easy to store content in `.md` files, load the raw Markdown at build time, and render it with a library such as `markdown-it` before handing it to Aurelia's templating system.

## 1. Install the Markdown toolchain

```bash
npm install markdown-it dompurify
```

- `markdown-it` converts Markdown into HTML on the client with support for GFM tables, autolinks, etc.
- `dompurify` sanitizes the rendered HTML so untrusted Markdown cannot inject scripts.

## 2. Tell TypeScript about `?raw` Markdown imports

Add the following to `src/env.d.ts` so TypeScript understands `import doc from './doc.md?raw'`:

```ts
declare module '*.md?raw' {
  const content: string;
  export default content;
}
```

## 3. (Optional) Hint Vite about Markdown assets

If you keep Markdown outside `src/`, add an `assetsInclude` entry so Vite watches those files:

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import aurelia from '@aurelia/vite-plugin';

export default defineConfig({
  plugins: [aurelia()],
  assetsInclude: ['**/*.md'],
});
```

## 4. Create a reusable Markdown viewer

### Component template

```html
<!-- src/resources/markdown-viewer.html -->
<template>
  <article class="markdown-body" innerhtml.bind="html"></article>
</template>
```

### Component logic

This example automatically loads files from `src/content` via `import.meta.glob`, converts them with `markdown-it`, and sanitizes the HTML before binding it to the DOM.

```ts
// src/resources/markdown-viewer.ts
import { bindable, customElement } from '@aurelia/runtime-html';
import MarkdownIt from 'markdown-it';
import DOMPurify from 'dompurify';

const markdownFiles = import.meta.glob('../content/**/*.md', { as: 'raw' });
const md = new MarkdownIt({ html: false, linkify: true, typographer: true });

import template from './markdown-viewer.html?raw';

@customElement({ name: 'markdown-viewer', template })
export class MarkdownViewer {
  @bindable() src: string = 'about.md';
  protected html = '';

  binding() {
    void this.load(this.src);
  }

  protected srcChanged(newValue: string) {
    void this.load(newValue);
  }

  private async load(path: string | undefined) {
    if (!path) {
      this.html = '';
      return;
    }

    const key = `../content/${path}`;
    const loader = markdownFiles[key];
    if (!loader) {
      this.html = `<p>Cannot find ${path}</p>`;
      return;
    }

    const raw = await loader();
    const rendered = md.render(raw);
    this.html = DOMPurify.sanitize(rendered);
  }
}
```

## 5. Author Markdown content

Place any `.md` files under `src/content`. For example:

```markdown
<!-- src/content/about.md -->
# About

Aurelia renders *Markdown* via **markdown-viewer**.
```

## 6. Use Markdown inside your views

```html
<!-- src/components/my-app.html -->
<template>
  <markdown-viewer src="about.md"></markdown-viewer>
</template>
```

## Troubleshooting & tips

- **Hot reload:** Because the files are imported through Vite's module graph, edits to `.md` files trigger HMR automatically.
- **Frontmatter:** If you need YAML frontmatter, parse it in `load()` (e.g., with `gray-matter`) before passing the Markdown body to `markdown-it`.
- **Accessibility:** Keep semantic headings in your Markdown so screen readers can navigate the generated article structure.
- **Security:** Always sanitize rendered HTML before binding it with `innerhtml.bind` when authors can edit Markdown content.

With this setup you can freely mix `.html` and `.md` files in your Aurelia project, while still leveraging Vite features such as `import.meta.glob`, lazy loading, and HMR.
