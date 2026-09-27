---
"@aurelia/vite-plugin": patch
---

Static asset references in Vite templates now retain their intended URLs during development and production builds.

- Inlined SVG images work with single-quoted and unquoted attributes. Quotes and HTML entities in asset URLs are preserved when the template is parsed.
- Stylesheets, JSON manifests, and embedded HTML documents load as assets. Percent-encoded filenames and SVG fragments resolve correctly.
- Responsive image source sets preserve data URLs and filenames containing commas.

Unsupported local filenames and `?raw` references now report an error with guidance on how to load the asset.
