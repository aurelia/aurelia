# @aurelia/webpack-plugin

A Webpack plugin for Aurelia applications that automatically applies Aurelia preprocessing to JavaScript and TypeScript files.

## Installation

```bash
npm install @aurelia/webpack-plugin
```

## Basic Usage

Add the plugin to your Webpack configuration:

```js
// webpack.config.js
const AureliaPlugin = require('@aurelia/webpack-plugin');

module.exports = {
  // ... other webpack config
  plugins: [
    new AureliaPlugin()
  ]
};
```

Or with ES modules:

```js
// webpack.config.js
import AureliaPlugin from '@aurelia/webpack-plugin';

export default {
  // ... other webpack config
  plugins: [
    new AureliaPlugin()
  ]
};
```

## Options

The plugin accepts an options object that supports all options from `@aurelia/plugin-conventions`:

### Basic Options

```js
new AureliaPlugin({
  // Enable hot module replacement (default: true)
  hmr: true,
  
  // Enable Aurelia conventions (default: true)
  enableConventions: true,
  
  // Configure shadow DOM options
  defaultShadowOptions: { mode: 'open' },
  
  // Enable CSS modules
  useCSSModule: false
})
```

### Type Checking Support

Enable experimental template type checking for enhanced TypeScript support:

```js
new AureliaPlugin({
  // Enable experimental template type checking
  experimentalTemplateTypeCheck: true
})
```

When enabled, this feature:
- Generates type-safe TypeScript code for Aurelia templates
- Provides compile-time type checking for template expressions
- Supports binding expressions, repeat loops, and contextual properties
- Works with both TypeScript and JavaScript projects (via JSDoc)

**Note:** Template type checking is experimental and may change in future versions.

### File Extension Configuration

```js
new AureliaPlugin({
  // Supported CSS extensions (default: ['.css', '.scss', '.sass', '.less', '.styl'])
  cssExtensions: ['.css', '.scss'],
  
  // Supported JS extensions (default: ['.js', '.jsx', '.ts', '.tsx', '.coffee'])
  jsExtensions: ['.js', '.ts'],
  
  // Supported template extensions (default: ['.html', '.md', '.pug', '.haml', '.jade', '.slim', '.slm'])
  templateExtensions: ['.html']
})
```

### Advanced Options

```js
new AureliaPlugin({
  // Transform HTML import specifiers
  transformHtmlImportSpecifier: (specifier) => specifier.replace('.html', '.$au.ts'),
  
  // Custom HMR code generation
  getHmrCode: (className, moduleName) => `/* custom HMR code */`,
  
  // Use processed file pair filenames
  useProcessedFilePairFilename: false
})
```

## How It Works

The plugin automatically:

1. **Hooks into Webpack's module resolution** using the `normalModuleFactory.beforeResolve` hook
2. **Processes `.js` and `.ts` files** through Aurelia's preprocessing system
3. **Applies Aurelia conventions** like automatic component registration and template pairing
4. **Injects HMR code** for hot module replacement during development
5. **Generates type-checked templates** when experimental type checking is enabled

## Integration with TypeScript

The plugin works seamlessly with TypeScript compilation:

1. Aurelia preprocessing runs first (this plugin)
2. TypeScript compilation runs second (ts-loader or similar)
3. Generated code includes proper type annotations and imports

## Common Use Cases

### Basic Aurelia App
```js
// webpack.config.js
module.exports = {
  plugins: [
    new AureliaPlugin()
  ]
};
```

### Production Build with Type Checking
```js
// webpack.config.js
module.exports = {
  plugins: [
    new AureliaPlugin({
      hmr: false, // Disable HMR in production
      experimentalTemplateTypeCheck: true // Enable type checking
    })
  ]
};
```

### Development with Enhanced Features
```js
// webpack.config.js
module.exports = {
  plugins: [
    new AureliaPlugin({
      hmr: true,
      experimentalTemplateTypeCheck: true,
      defaultShadowOptions: { mode: 'open' }
    })
  ]
};
```

## Troubleshooting

### Type Checking Issues
- Ensure TypeScript is properly configured in your project
- Check that template files have proper type definitions
- Verify that experimental type checking is enabled for both the plugin and your TypeScript configuration

### HMR Not Working
- Ensure HMR is enabled in both the Aurelia plugin and Webpack dev server
- Check browser console for HMR-related warnings
- Verify that your components follow Aurelia conventions

## See Also

- [@aurelia/plugin-conventions](https://www.npmjs.com/package/@aurelia/plugin-conventions) - The underlying preprocessing system
- [@aurelia/webpack-loader](https://www.npmjs.com/package/@aurelia/webpack-loader) - Alternative loader-based approach
- [Aurelia Documentation](https://docs.aurelia.io/) - Complete Aurelia framework documentation