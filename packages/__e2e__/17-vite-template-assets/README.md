# Vite template asset tests

After building the framework packages, run `npm test` in this directory. It runs the same application and Playwright suite with Vite 7 and Vite 8, one after the other. Both versions are installed together through the `vite` and `vite8` package names. Build, preview, and development tests all use the selected package.

For a focused run:

- Vite 7: `npm run test:e2e`
- Vite 8: `npx cross-env VITE_PACKAGE=vite8 npm run test:e2e`

The fixture keeps Vite's default asset inlining. Browser assertions check that template URLs survive HTML parsing, load their intended contents, and still work in development. The explicit `?no-inline` image covers emitted files and URL fragments alongside the inlined images. An external SVG symbol must render through `<use>`. A 2x browser viewport selects the local image in the mixed data-URL `srcset`.

CircleCI runs this fixture on master and in `/ci full`.
