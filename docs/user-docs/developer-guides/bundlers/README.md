---
description: >-
  A comprehensive guide for configuring different bundlers with Aurelia 2 applications, including Webpack, Vite, and Parcel.
---

# Aurelia Bundler Guide

Aurelia is a framework that prides itself on flexibility and minimal boilerplate. This flexibility extends to how you bundle and build your application. Whether you prefer **Webpack**, **Vite**, **Parcel**, or another bundler, Aurelia 2 offers a straightforward approach to configuration.

Bundling is the process of gathering your source code, templates, styles, and related assets into optimized sets of files that are easier for browsers to load. Below, we'll walk through common bundler choices in Aurelia 2 and how to integrate them.

---

## Webpack

Webpack is a powerful and widely used bundler that allows deep customization of your build. Below is an overview of how to set up and configure a basic Aurelia 2 app with Webpack.

### Installing Webpack

```bash
npm install --save-dev webpack webpack-cli webpack-dev-server
npm install --save-dev @aurelia/webpack-plugin ts-loader
```

The `@aurelia/webpack-plugin` is essential for properly processing Aurelia's HTML templates and TypeScript files with Aurelia-specific transformations.

> **Tip**: If you are migrating from Aurelia 1, you may already have a `webpack.config.js` that you can adapt for Aurelia 2, but you'll need to update the plugin configuration.

### Basic Configuration

Here's a complete webpack configuration for Aurelia 2:

```js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const AureliaPlugin = require('@aurelia/webpack-plugin');

module.exports = function(env, { mode }) {
  const production = mode === 'production';

  return {
    target: 'web',
    mode: production ? 'production' : 'development',
    devtool: production ? 'source-map' : 'eval-cheap-source-map',
    entry: {
      app: './src/main.ts'
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: production ? '[name].[contenthash].bundle.js' : '[name].bundle.js'
    },
    resolve: {
      extensions: ['.ts', '.js'],
      modules: [path.resolve(__dirname, 'src'), 'node_modules']
    },
    devServer: {
      historyApiFallback: true,
      open: !process.env.CI,
      port: 9000
    },
    module: {
      rules: [
        // Asset loaders
        { test: /\.(png|gif|jpg|cur)$/i, loader: 'url-loader', options: { limit: 8192 } },
        { test: /\.woff2(\?v=[0-9]\.[0-9]\.[0-9])?$/i, loader: 'url-loader', options: { limit: 10000, mimetype: 'application/font-woff2' } },
        { test: /\.woff(\?v=[0-9]\.[0-9]\.[0-9])?$/i, loader: 'url-loader', options: { limit: 10000, mimetype: 'application/font-woff' } },
        { test: /\.(ttf|eot|svg|otf)(\?v=[0-9]\.[0-9]\.[0-9])?$/i, loader: 'file-loader' },

        // CSS handling
        { test: /\.css$/i, use: ['style-loader', 'css-loader'] },

        // TypeScript loader
        { test: /\.ts$/i, use: 'ts-loader', exclude: /node_modules/ },

        // Aurelia HTML templates
        {
          test: /\.html$/i,
          use: '@aurelia/webpack-plugin',
          exclude: /index\.html$/
        }
      ]
    },
    plugins: [
      new AureliaPlugin(),
      new HtmlWebpackPlugin({ template: 'index.html' })
    ]
  };
};
```

### Advanced Configuration Options

#### Development Aliases
For development, you can alias Aurelia packages to their development builds for better debugging:

```js
// In resolve.alias section
alias: {
  ...[
    'aurelia',
    'fetch-client',
    'kernel',
    'metadata',
    'platform',
    'platform-browser',
    'route-recognizer',
    'router',
    'router',
    'runtime',
    'runtime-html',
    'testing',
    'state',
    'ui-virtualization'
  ].reduce((map, pkg) => {
    const name = pkg === 'aurelia' ? pkg : `@aurelia/${pkg}`;
    map[name] = path.resolve(__dirname, 'node_modules', name, 'dist/esm/index.dev.mjs');
    return map;
  }, {})
}
```

#### Hot Module Replacement (HMR)
To enable HMR for Aurelia components, pass the `hmr` option to the plugin:

```js
// In plugins array
plugins: [
  new AureliaPlugin({ hmr: true }),
  new HtmlWebpackPlugin({ template: 'index.html' })
]
```

#### TypeScript Type Checking
For enhanced TypeScript support with template type checking, pass the `experimentalTemplateTypeCheck` option to the plugin:

```js
// In plugins array
plugins: [
  new AureliaPlugin({ experimentalTemplateTypeCheck: true }),
  new HtmlWebpackPlugin({ template: 'index.html' })
]
```

### Production Optimizations

- **Minification**: Webpack 5+ includes Terser plugin by default for production builds
- **Code Splitting**: Configure `optimization.splitChunks` for better caching
- **Source Maps**: Use `'source-map'` for production debugging
- **Content Hashing**: Use `[contenthash]` in filenames for long-term caching

---

## Vite

Vite is a fast, modern bundler (and dev server) that works excellently with Aurelia. Its plugin system provides quick project startup, HMR (Hot Module Replacement), and speedy builds.

### Installing

```bash
npm install --save-dev @aurelia/vite-plugin
```

### Basic Usage

In `vite.config.js`:

```js
import { defineConfig } from 'vite';
import aurelia from '@aurelia/vite-plugin';

export default defineConfig({
  plugins: [aurelia()],
});
```

### TypeScript Support

For TypeScript apps, add this declaration file to your project (usually generated by the Aurelia CLI):

`html.d.ts`
```ts
declare module '*.html' {
  import { IContainer } from '@aurelia/kernel';
  import { BindableDefinition } from '@aurelia/runtime';
  export const name: string;
  export const template: string;
  export default template;
  export const dependencies: string[];
  export const containerless: boolean | undefined;
  export const bindables: Record<string, BindableDefinition>;
  export const shadowOptions: { mode: 'open' | 'closed'} | undefined;
  export function register(container: IContainer);
}
```

### Plugin Configuration Options

The Aurelia Vite plugin accepts several configuration options:

```js
import { defineConfig } from 'vite';
import aurelia from '@aurelia/vite-plugin';

export default defineConfig({
  plugins: [
    aurelia({
      // Always use development bundles
      useDev: true,

      // File inclusion/exclusion patterns
      include: 'src/**/*.{ts,js,html}',
      exclude: 'node_modules/**',

      // Plugin execution order
      pre: true,

      // Enable/disable conventions
      enableConventions: true,

      // HMR configuration
      hmr: true
    })
  ]
});
```

#### Development Configuration

By default, the Aurelia Vite plugin automatically uses development bundles when in development mode:

```js
export default defineConfig({
  plugins: [
    aurelia({
      useDev: true  // Force development bundles regardless of mode
    })
  ]
});
```

#### Production & Code Splitting

Vite automatically optimizes for production. You can customize chunk splitting:

```js
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['aurelia'],
          'router': ['@aurelia/router-direct', '@aurelia/router']
        }
      }
    }
  },
  plugins: [aurelia()]
});
```

#### Source Maps and Debugging

```js
export default defineConfig({
  build: {
    sourcemap: true  // Enable source maps in production
  },
  plugins: [aurelia()]
});
```

---

## Parcel

Parcel is a zero-configuration bundler that works well with Aurelia 2 through the official transformer.

### Installing

```bash
npm install --save-dev @aurelia/parcel-transformer
npm install --save-dev @parcel/transformer-typescript-tsc  # For TypeScript projects
```

### Configuration

Create a `.parcelrc` file in your project root:

```json
{
  "extends": "@parcel/config-default",
  "transformers": {
    "*.ts": ["@aurelia/parcel-transformer", "@parcel/transformer-typescript-tsc"],
    "*.html": ["@aurelia/parcel-transformer", "..."]
  }
}
```

For JavaScript projects:
```json
{
  "extends": "@parcel/config-default",
  "transformers": {
    "*.js": ["@aurelia/parcel-transformer", "..."],
    "*.html": ["@aurelia/parcel-transformer", "..."]
  }
}
```

### Package.json Configuration

You can configure Aurelia-specific options in your `package.json`:

```json
{
  "aurelia": {
    "hmr": true,
    "defaultShadowOptions": { "mode": "open" },
    "useCSSModule": false
  }
}
```

### TypeScript Support

For TypeScript projects, add the same `html.d.ts` declaration file mentioned in the Vite section.

---

## CSS and Styling

### CSS Modules
Aurelia supports CSS modules with proper bundler configuration:

```js
// Webpack
{
  test: /\.css$/,
  use: [
    'style-loader',
    {
      loader: 'css-loader',
      options: {
        modules: true
      }
    }
  ]
}

// Vite (built-in support)
// Just name your files with .module.css extension
```

### SCSS/SASS Support
Add SASS loaders for SCSS support:

```bash
npm install --save-dev sass sass-loader  # Webpack
npm install --save-dev sass              # Vite (built-in)
```

---

## Troubleshooting

### Common Issues

#### "Cannot resolve module" errors
- Ensure file extensions are properly configured in bundler resolve settings
- Check that the Aurelia plugin is properly configured for HTML and TypeScript files

#### Slow development builds
- For Webpack: Enable `experiments.lazyCompilation` and proper development aliases
- For Vite: Ensure `useDev: true` is set in the Aurelia plugin options

#### HMR not working
- Verify HMR is enabled in both the bundler configuration and the Aurelia plugin
- Check browser console for HMR-related warnings

#### TypeScript template errors
- Ensure proper HTML type definitions are included
- Consider enabling `experimentalTemplateTypeCheck` in the webpack plugin options

### Performance Tips

1. **Use development bundles**: Always alias to `.dev.mjs` files during development
2. **Enable code splitting**: Configure manual chunks for better loading performance
3. **Optimize assets**: Use appropriate loaders for images, fonts, and other assets
4. **Source map strategy**: Use `eval-cheap-source-map` for development, `source-map` for production

---

## Conclusion

Aurelia 2 provides excellent bundler flexibility through dedicated plugins and transformers. **Vite** offers the fastest development experience with minimal configuration, while **Webpack** provides maximum customization options. **Parcel** offers a good middle ground with zero-configuration setup.

Key points to remember:
- Always use the official Aurelia bundler plugins
- Configure proper TypeScript declarations for HTML modules
- Use development bundles during development for better debugging
- Enable HMR for the best development experience

For advanced configurations and bundler-specific optimizations, refer to the official documentation of your chosen bundler alongside Aurelia's guides.
