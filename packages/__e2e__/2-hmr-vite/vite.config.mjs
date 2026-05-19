import { defineConfig } from 'vite';
import aurelia from '@aurelia/vite-plugin';
import { minify } from 'html-minifier-terser';

function minifyHtml() {
  return {
    name: 'html-minify',
    // enforce: 'pre',
    async transform(code, id) {
      const [path] = id.split('?', 1);
      if (!path.endsWith('.html')) {
        return null;
      }
      return minify(code, {
        collapseWhitespace: true,
        keepClosingSlash: true,
        removeComments: true,
      });
    },
  };
}

function htmlProbe() {
  return {
    name: 'html-probe',
    enforce: 'pre',
    transform(code, id) {
      const [path] = id.split('?', 1);
      if (!path.endsWith('/src/app.html')) {
        return null;
      }
      return Promise.resolve(code.replace(
        `<div>\${message | identity}</div>`,
        `<div data-html-probe="yes"><span>Mesage is:</span>\${message | identity}</div>`,
      ));
    },
  };
}

export default defineConfig({
  server: {
    port: process.env.APP_PORT ?? 5173,
  },
  build: {
    minify: false,
    target: "es2022",
  },
  plugins: [
    minifyHtml(),
    htmlProbe(),
    aurelia()
  ],
  esbuild: {
    target: "es2022"
  },
});
