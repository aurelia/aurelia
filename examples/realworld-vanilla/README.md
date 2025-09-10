# Aurelia 2 RealWorld Vanilla CDN Example

A comprehensive single-page application demonstrating Aurelia 2 loaded directly from jsDelivr CDN without any build tools. This is a complete implementation of the RealWorld demo app (Conduit) in a single HTML file, using JSONPlaceholder API with data transformation to match the RealWorld structure.

## Features

- **Complete RealWorld application** with authentication, articles, comments, and profiles
- **No build tools required** - just open `index.html` in your browser
- **Performance optimized** with DNS prefetch and modulepreload
- **Full-featured SPA** including:
  - User authentication (login/register)
  - Article CRUD operations
  - Comments system
  - User profiles and following
  - Article favoriting
  - Tag-based filtering
  - Pagination

## Usage

Simply open `index.html` in your browser - no server required! The app connects to JSONPlaceholder API at `https://jsonplaceholder.typicode.com` and transforms the data to match RealWorld structure. Authentication and write operations use mock data for demonstration purposes.

## Key Aurelia 2 Features Demonstrated

- ✅ **Router Configuration** - Complex routing with nested routes
- ✅ **Component System** - Multiple custom elements working together
- ✅ **Data Binding** - Comprehensive two-way binding throughout
- ✅ **Event Handling** - Form submission, clicks, and user interactions
- ✅ **HTTP Client** - API calls and data fetching
- ✅ **Value Converters** - Date formatting and other transformations
- ✅ **Template Controllers** - Conditional rendering and repeating
- ✅ **Lifecycle Hooks** - Component loading and data management
- ✅ **Watch Decorators** - Reactive updates based on state changes
- ✅ **Authentication Guards** - Route protection and access control

## Technical Implementation

### CDN URLs Used
```javascript
import { Aurelia, CustomElement, ValueConverter, LifecycleHooks } from 'https://cdn.jsdelivr.net/npm/aurelia@latest/+esm';
import { RouterConfiguration, Route, IRouter } from 'https://cdn.jsdelivr.net/npm/@aurelia/router@latest/+esm';
import { IHttpClient } from 'https://cdn.jsdelivr.net/npm/@aurelia/fetch-client@latest/+esm';
import { Watch } from 'https://cdn.jsdelivr.net/npm/@aurelia/runtime-html@latest/+esm';
import { marked } from 'https://cdn.jsdelivr.net/npm/marked@16.1.2/lib/marked.esm.js';
```

### Architecture Highlights

- **State Management** - Global state objects for user, articles, and UI state
- **API Integration** - Complete REST API integration with error handling
- **Component Composition** - Reusable components like article lists, forms, and meta information
- **Route-based Loading** - Dynamic content loading based on URL parameters
- **Template-based Components** - All components defined inline with HTML templates

## Application Structure

The app implements the complete RealWorld spec with these main views:

- **Home** - Article feed with global/user feeds and tag filtering
- **Authentication** - Login and registration forms
- **Article** - Individual article view with comments
- **Editor** - Article creation and editing
- **Profile** - User profiles with article listings
- **Settings** - User profile management

## Production Considerations

For production use, consider:

1. **Version Pinning** - Pin to specific Aurelia versions for stability
2. **Error Handling** - Add comprehensive error boundaries
3. **Loading States** - Enhance loading indicators
4. **Performance** - Consider code splitting for larger applications

## Related Examples

- **realworld-vanilla-router** - Simplified router example with mock data
- **Other realworld examples** - See build-tool based implementations in other directories

This example demonstrates that Aurelia 2 can handle complex, real-world applications without any build configuration, making it perfect for rapid prototyping or when you want to avoid build complexity.