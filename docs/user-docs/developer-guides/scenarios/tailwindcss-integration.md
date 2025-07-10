---
description: Learn how to use TailwindCSS in Aurelia 2 with this detailed guide.
---

# TailwindCSS integration

## What is Tailwind CSS?

Tailwind CSS is a highly customizable, low-level CSS framework that gives you all of the building blocks you need to build bespoke designs without any annoying opinionated styles you have to fight to override.

For more information take a look at [Tailwind CSS](https://tailwindcss.com/)

## How to configure an Aurelia 2 project with Tailwind CSS v4?

### Step 1: Create Aurelia 2 Project

Run the following command in your terminal:

```bash
npx makes aurelia
```

Choose your preferred bundler (Webpack, Vite, or Parcel) and TypeScript/JavaScript preference.

### Step 2: Install Tailwind CSS

Choose the installation method based on your bundler:

#### For Webpack Projects

```bash
npm install tailwindcss@next @tailwindcss/postcss@next postcss postcss-loader
```

#### For Vite Projects (Recommended)

```bash
npm install tailwindcss@next @tailwindcss/vite@next
```

#### For Parcel Projects

```bash
npm install tailwindcss@next @tailwindcss/postcss@next
```

### Step 3: Configure Your Bundler

#### Webpack Configuration

1. Create a `postcss.config.js` file in your project root:

```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  }
}
```

2. Ensure your `webpack.config.js` includes the PostCSS loader:

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
    ],
  },
}
```

#### Vite Configuration

Add the Tailwind CSS plugin to your `vite.config.js`:

```javascript
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
})
```

#### Parcel Configuration

Create a `.postcssrc` file in your project root:

```json
{
  "plugins": {
    "@tailwindcss/postcss": {}
  }
}
```

### Step 4: Add Tailwind CSS to Your Styles

Add this single line to the **top** of your main CSS file (for example `my-app.css`):

```css
@import "tailwindcss";
```

**Note**: In v4, you no longer need the `@tailwind` directives (`@tailwind base;`, `@tailwind components;`, `@tailwind utilities;`). The single `@import` statement handles everything.

## How to test it?

In an easy way you can add the following Tailwind CSS snippet code to your project.

```css
<div class="p-6">
    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
      <strong class="font-bold">Holy smokes!</strong>
      <span class="block sm:inline">Something seriously bad happened.</span>
      <span class="absolute top-0 bottom-0 right-0 px-4 py-3">
        <svg class="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
      </span>
    </div>
</div>
```

now you can run the project by

```bash
npm run start
or
yarn run
```

## Content Detection and Optimization

Tailwind CSS v4 includes **automatic content detection** - no configuration required. The framework automatically discovers all your template files and only includes the CSS you're actually using.

### Traditional v3 Approach (No Longer Needed)

In previous versions, you needed to manually configure content paths in `tailwind.config.js`:

```javascript
// NOT NEEDED IN v4
module.exports = {
  content: ['./src/**/*.html', './src/**/*.ts'],
  // ...
}
```

### v4 Automatic Detection

In v4, this happens automatically with zero configuration. The framework:
- Automatically finds all template files
- Only includes CSS for classes you actually use
- Optimizes bundle size without manual configuration

### Manual Configuration (Optional)

If you need custom configuration, you can create a `tailwind.config.js` file:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      // Your custom theme extensions
    },
  },
  plugins: [],
}
```

### Build Size Optimization

Tailwind CSS v4 automatically optimizes your CSS bundle size:

```bash
npm run build
```

The build process will automatically:
- Remove unused CSS classes
- Optimize the final bundle size
- Include only the styles you're using

## Migration from v3 to v4

If you're upgrading from Tailwind CSS v3:

1. **Remove old directives**: Replace `@tailwind base;`, `@tailwind components;`, `@tailwind utilities;` with `@import "tailwindcss";`

2. **Update dependencies**: Install v4 packages (`tailwindcss@next`, `@tailwindcss/vite@next`, etc.)

3. **Remove autoprefixer**: v4 handles vendor prefixing automatically

4. **Optional config cleanup**: You can remove most `tailwind.config.js` content as v4 works with zero config
