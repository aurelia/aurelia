---
description: >-
  Practical guide for creating reusable Aurelia 2 component libraries, covering architecture patterns, distribution strategies, and best practices without strong opinions.
---

# Component Library Development

Creating reusable component libraries enables code sharing across projects and contributes to the Aurelia ecosystem. This guide covers practical approaches to building, packaging, and distributing Aurelia 2 component libraries.

## Library Architecture Options

### Monolithic Library
Single package containing all components:

```
my-ui-library/
├── src/
│   ├── button/
│   ├── input/
│   ├── modal/
│   └── index.ts
└── package.json
```

**Benefits**: Simple to manage, single install
**Trade-offs**: Larger bundle if using only some components

### Modular Library
Separate packages for each component or component group:

```
@my-ui/
├── button/
├── input/
├── form-controls/
└── overlays/
```

**Benefits**: Granular imports, smaller bundles
**Trade-offs**: More complex management, multiple packages

### Hybrid Approach
Main package with optional modular packages:

```
my-ui-library/          # Main package with all components
├── packages/
│   ├── button/         # Optional standalone packages
│   ├── input/
│   └── modal/
```

## Project Setup

### Basic Structure

```
my-aurelia-library/
├── src/
│   ├── components/
│   │   ├── button/
│   │   │   ├── button.html
│   │   │   ├── button.ts
│   │   │   └── button.css
│   │   └── index.ts
│   ├── index.ts              # Main export
│   └── configuration.ts      # Registration helper
├── dist/                     # Build output
├── examples/                 # Usage examples
├── package.json
├── tsconfig.json
└── build.config.js           # Build configuration
```

### Package.json Configuration

```json
{
  "name": "@yourorg/aurelia-ui-library",
  "version": "1.0.0",
  "main": "dist/index.js",
  "module": "dist/index.esm.js",
  "types": "dist/index.d.ts",
  "files": [
    "dist"
  ],
  "exports": {
    ".": {
      "import": "./dist/index.esm.js",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "peerDependencies": {
    "@aurelia/kernel": "^2.0.0",
    "@aurelia/runtime": "^2.0.0",
    "@aurelia/runtime-html": "^2.0.0"
  },
  "devDependencies": {
    "aurelia": "^2.0.0",
    "typescript": "^4.9.0"
  }
}
```

## Component Development Patterns

### Base Component Structure

```typescript
// src/components/button/button.ts
import { bindable, customElement } from 'aurelia';

@customElement({
  name: 'ui-button',
  template: `
    <button 
      class="\${classes}" 
      disabled.bind="disabled"
      click.trigger="handleClick($event)">
      <slot></slot>
    </button>
  `,
  shadowOptions: { mode: 'open' } // Optional: use Shadow DOM
})
export class UiButton {
  @bindable variant: 'primary' | 'secondary' | 'danger' = 'primary';
  @bindable size: 'small' | 'medium' | 'large' = 'medium';
  @bindable disabled: boolean = false;

  get classes(): string {
    return `btn btn--${this.variant} btn--${this.size}`;
  }

  handleClick(event: MouseEvent): boolean {
    if (this.disabled) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
    return true;
  }
}
```

### Component Registration

Create a configuration helper for easy registration:

```typescript
// src/configuration.ts
import { IContainer, IRegistration } from 'aurelia';
import { UiButton } from './components/button/button';
import { UiInput } from './components/input/input';
import { UiModal } from './components/modal/modal';

export const UILibraryConfiguration = {
  register(container: IContainer): IContainer {
    return container.register(
      UiButton,
      UiInput,
      UiModal
    );
  },

  // Individual component registration
  button: UiButton as IRegistration,
  input: UiInput as IRegistration,
  modal: UiModal as IRegistration
};
```

### Barrel Exports

```typescript
// src/index.ts
export { UiButton } from './components/button/button';
export { UiInput } from './components/input/input';
export { UiModal } from './components/modal/modal';
export { UILibraryConfiguration } from './configuration';

// Default configuration export
export default UILibraryConfiguration;
```

## Styling Strategies

### CSS Custom Properties (Recommended)

```css
/* button.css */
.btn {
  --btn-padding: var(--ui-button-padding, 0.5rem 1rem);
  --btn-border-radius: var(--ui-button-border-radius, 0.25rem);
  --btn-font-weight: var(--ui-button-font-weight, 600);
  
  padding: var(--btn-padding);
  border-radius: var(--btn-border-radius);
  font-weight: var(--btn-font-weight);
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn--primary {
  background: var(--ui-primary-color, #007bff);
  color: var(--ui-primary-text, white);
}

.btn--primary:hover {
  background: var(--ui-primary-hover, #0056b3);
}
```

Users can customize by setting CSS variables:

```css
/* User's app styles */
:root {
  --ui-primary-color: #6366f1;
  --ui-button-border-radius: 0.5rem;
}
```

### Shadow DOM + CSS Modules

```typescript
@customElement({
  name: 'ui-button',
  template: `<button class="${classes}"><slot></slot></button>`,
  shadowOptions: { mode: 'open' }
})
export class UiButton {
  // Styles are encapsulated in Shadow DOM
}
```

### Themeable Design System

```typescript
// src/theme/theme.ts
export interface UITheme {
  colors: {
    primary: string;
    secondary: string;
    danger: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
  };
  typography: {
    fontFamily: string;
    fontSizes: Record<string, string>;
  };
}

export const defaultTheme: UITheme = {
  colors: {
    primary: '#007bff',
    secondary: '#6c757d',
    danger: '#dc3545'
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem'
  },
  typography: {
    fontFamily: 'system-ui, sans-serif',
    fontSizes: {
      sm: '0.875rem',
      md: '1rem',
      lg: '1.125rem'
    }
  }
};
```

## Build Configuration

### TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ES2020",
    "moduleResolution": "node",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "strict": true,
    "skipLibCheck": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "examples"]
}
```

### Rollup Build (Recommended)

```javascript
// rollup.config.js
import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import postcss from 'rollup-plugin-postcss';

export default {
  input: 'src/index.ts',
  external: [
    '@aurelia/kernel',
    '@aurelia/runtime',
    '@aurelia/runtime-html'
  ],
  output: [
    {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true
    },
    {
      file: 'dist/index.esm.js',
      format: 'es',
      sourcemap: true
    }
  ],
  plugins: [
    nodeResolve(),
    typescript(),
    postcss({
      extract: 'styles.css',
      minimize: true
    })
  ]
};
```

### Vite Build Alternative

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'AureliaUILibrary',
      fileName: (format) => `index.${format}.js`
    },
    rollupOptions: {
      external: [
        '@aurelia/kernel',
        '@aurelia/runtime',
        '@aurelia/runtime-html'
      ],
      output: {
        globals: {
          '@aurelia/kernel': 'AureliaKernel',
          '@aurelia/runtime': 'AureliaRuntime',
          '@aurelia/runtime-html': 'AureliaRuntimeHtml'
        }
      }
    }
  }
});
```

## Distribution Strategies

### NPM Package

```bash
# Build and publish
npm run build
npm publish

# Scoped package
npm publish --access public
```

### CDN Distribution

Build UMD bundles for CDN usage:

```javascript
// Additional Rollup output for CDN
{
  file: 'dist/index.umd.js',
  format: 'umd',
  name: 'AureliaUILibrary',
  globals: {
    '@aurelia/kernel': 'AureliaKernel',
    '@aurelia/runtime': 'AureliaRuntime',
    '@aurelia/runtime-html': 'AureliaRuntimeHtml'
  }
}
```

### Usage Examples

Include usage examples for better adoption:

```typescript
// examples/basic-usage.ts
import { Aurelia } from 'aurelia';
import { UILibraryConfiguration } from '@yourorg/aurelia-ui-library';

const au = new Aurelia();
au.register(UILibraryConfiguration);
au.app({
  host: document.querySelector('#app'),
  component: MyApp
}).start();
```

## Testing Your Library

### Component Testing

```typescript
// tests/button.spec.ts
import { createFixture } from '@aurelia/testing';
import { UiButton } from '../src/components/button/button';

describe('UiButton', () => {
  it('renders with default properties', async () => {
    const { startPromise, stop, appHost } = createFixture(
      '<ui-button>Click me</ui-button>',
      class App {},
      [UiButton]
    );

    await startPromise;

    const button = appHost.querySelector('button');
    expect(button).toBeTruthy();
    expect(button!.textContent).toBe('Click me');
    expect(button!.className).toContain('btn--primary');

    await stop(true);
  });

  it('handles click events', async () => {
    const clickSpy = jest.fn();
    
    const { startPromise, stop, trigger } = createFixture(
      '<ui-button click.trigger="handleClick()">Click me</ui-button>',
      class App { handleClick = clickSpy; },
      [UiButton]
    );

    await startPromise;

    trigger.click('button');
    expect(clickSpy).toHaveBeenCalled();

    await stop(true);
  });
});
```

### Integration Testing

Test library configuration and registration:

```typescript
describe('UILibraryConfiguration', () => {
  it('registers all components', async () => {
    const { container, startPromise, stop } = createFixture(
      '<div></div>',
      class App {},
      [UILibraryConfiguration]
    );

    await startPromise;

    expect(container.has(UiButton)).toBe(true);
    expect(container.has(UiInput)).toBe(true);
    expect(container.has(UiModal)).toBe(true);

    await stop(true);
  });
});
```

## Documentation

### README Template

```markdown
# @yourorg/aurelia-ui-library

A collection of reusable UI components for Aurelia 2.

## Installation

```bash
npm install @yourorg/aurelia-ui-library
```

## Usage

### Register All Components

```typescript
import { UILibraryConfiguration } from '@yourorg/aurelia-ui-library';

au.register(UILibraryConfiguration);
```

### Register Individual Components

```typescript
import { UiButton } from '@yourorg/aurelia-ui-library';

au.register(UiButton);
```

### Components

#### Button

```html
<ui-button variant="primary" size="large">Click me</ui-button>
```

**Properties:**
- `variant`: 'primary' | 'secondary' | 'danger'
- `size`: 'small' | 'medium' | 'large'
- `disabled`: boolean

## Theming

Override CSS custom properties:

```css
:root {
  --ui-primary-color: #your-color;
  --ui-button-border-radius: 0.5rem;
}
```
```

## Versioning and Compatibility

### Semantic Versioning
- **Major**: Breaking changes (Aurelia version updates, API changes)
- **Minor**: New components or features
- **Patch**: Bug fixes and improvements

### Aurelia Version Support

```json
{
  "peerDependencies": {
    "aurelia": "^2.0.0"
  },
  "engines": {
    "node": ">=16"
  }
}
```

## Maintenance Considerations

### Bundle Size Optimization
- Use tree-shaking friendly exports
- Minimize dependencies
- Provide both full and modular imports

### TypeScript Support
- Include comprehensive type definitions
- Export component interfaces
- Provide good IntelliSense experience

### Accessibility
- Include ARIA attributes by default
- Support keyboard navigation
- Provide accessible color contrasts

### Performance
- Lazy load heavy components
- Optimize CSS delivery
- Minimize runtime overhead

## Publishing Checklist

- [ ] Tests pass
- [ ] TypeScript declarations generated
- [ ] Bundle size is acceptable
- [ ] Examples work correctly
- [ ] Documentation is updated
- [ ] Version is bumped appropriately
- [ ] CHANGELOG is updated

This guide provides flexible patterns for component library development while avoiding prescriptive decisions about specific architectural choices. Choose the approaches that best fit your project's needs and constraints.