# Aurelia 2 RealWorld Router CDN Example

A comprehensive example demonstrating Aurelia 2 with routing capabilities, loaded directly from jsDelivr CDN without any build tools.

## Features

- **Complete routing setup** with multiple pages and navigation
- **No build tools required** - just open `index.html` in your browser
- **Performance optimized** with DNS prefetch and modulepreload
- **Real-world functionality** including:
  - Article listing and viewing
  - Article creation/editing
  - Favorites functionality
  - Route parameters
  - Navigation between pages

## Demo Pages

- **Home** (`/` or `/home`) - Article feed with favorites
- **Article** (`/article/:id`) - Individual article view with parameters
- **Editor** (`/editor` or `/editor/:id`) - Create/edit articles with forms
- **About** (`/about`) - Information about the demo

## Usage

Simply open `index.html` in your browser - no server required! The app uses fragment hash routing (`#/page`) which works with static file hosting.

## Key Aurelia 2 Features Demonstrated

- ✅ **Router Configuration** - Multiple routes with parameters
- ✅ **Component Navigation** - Using `load` attributes for navigation  
- ✅ **Route Parameters** - Accessing URL parameters in components
- ✅ **Data Binding** - Two-way binding with forms and displays
- ✅ **Event Handling** - Click handlers and form submission
- ✅ **Conditional Rendering** - `if.bind` for dynamic content
- ✅ **Repeating Templates** - `repeat.for` for lists
- ✅ **Lifecycle Hooks** - `load()` method for route changes
- ✅ **Component Dependencies** - Organizing multiple components

## Technical Implementation

### CDN URLs Used
```javascript
import { Aurelia, CustomElement } from 'https://cdn.jsdelivr.net/npm/aurelia@latest/+esm';
import { RouterConfiguration } from 'https://cdn.jsdelivr.net/npm/@aurelia/router@latest/+esm';
```

### Router Setup
```javascript
RouterConfiguration.customize({ useUrlFragmentHash: true })
```

### Route Definitions
```javascript
static routes = [
  { path: ['', 'home'], component: Home, title: 'Home' },
  { path: 'article/:id', component: Article, title: 'Article' },
  { path: 'editor/:id?', component: Editor, title: 'Editor' },
  { path: 'about', component: About, title: 'About' }
];
```

## Production Considerations

For production use, consider pinning to specific versions:

```javascript
import { Aurelia, CustomElement } from 'https://cdn.jsdelivr.net/npm/aurelia@2.0.0-beta.25/+esm';
import { RouterConfiguration } from 'https://cdn.jsdelivr.net/npm/@aurelia/router@2.0.0-beta.25/+esm';
```

## Related Examples

- **realworld-vanilla** - Complex single-file Aurelia app without routing
- **Other examples** - See the `/examples` directory for build-tool based projects

This example shows how Aurelia 2 can create sophisticated single-page applications with zero build configuration, perfect for prototyping, learning, or simple deployments.