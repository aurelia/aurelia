# Aurelia 2 Simple Demo with JSONPlaceholder API

A simplified, working demonstration of Aurelia 2 with a real API, loaded directly from jsDelivr CDN without any build tools. This example uses JSONPlaceholder API which has proper CORS support.

## Features

- **Real API Integration** - Uses JSONPlaceholder API (no CORS issues)
- **No build tools required** - Just open `index.html` in your browser
- **Performance optimized** - DNS prefetch and modulepreload
- **Complete routing setup** with multiple pages and navigation
- **HTTP Client** - Demonstrates API calls and data fetching
- **Error handling** - Proper loading states and error handling
- **Real-world functionality** including:
  - Post listing and viewing
  - User directory
  - Comments loading
  - Route parameters
  - Navigation between pages

## Demo Pages

- **Posts** (`/` or `/posts`) - List of blog posts from JSONPlaceholder
- **Post Details** (`/post/:id`) - Individual post view with comments
- **Users** (`/users`) - Directory of users from the API
- **About** (`/about`) - Information about the demo

## Usage

Simply open `index.html` in your browser - no server required! The app uses fragment hash routing (`#/page`) which works with static file hosting.

## Key Aurelia 2 Features Demonstrated

- ✅ **HTTP Client Configuration** - Configured with base URL and headers
- ✅ **Router Configuration** - Multiple routes with parameters
- ✅ **Component Navigation** - Using `load` attributes for navigation  
- ✅ **Route Parameters** - Accessing URL parameters in components
- ✅ **Data Binding** - Displaying API data with interpolation
- ✅ **Event Handling** - Component lifecycle and async operations
- ✅ **Conditional Rendering** - `if.bind` for loading states and errors
- ✅ **Repeating Templates** - `repeat.for` for lists
- ✅ **Lifecycle Hooks** - `load()` method for route changes
- ✅ **Component Dependencies** - Organizing multiple components
- ✅ **Async Operations** - Proper async/await handling

## API Details

This demo uses [JSONPlaceholder](https://jsonplaceholder.typicode.com/), a free fake REST API:

- **Base URL**: `https://jsonplaceholder.typicode.com`
- **CORS Enabled**: No cross-origin issues
- **Endpoints Used**:
  - `GET /posts?_limit=10` - List of posts
  - `GET /posts/:id` - Individual post
  - `GET /posts/:id/comments` - Comments for a post
  - `GET /users` - List of users

## Technical Implementation

### CDN URLs Used
```javascript
import { Aurelia, CustomElement } from 'https://cdn.jsdelivr.net/npm/aurelia@latest/+esm';
import { RouterConfiguration } from 'https://cdn.jsdelivr.net/npm/@aurelia/router@latest/+esm';
import { IHttpClient } from 'https://cdn.jsdelivr.net/npm/@aurelia/fetch-client@latest/+esm';
```

### HTTP Client Setup
```javascript
http.configure(config => config
  .withBaseUrl('https://jsonplaceholder.typicode.com')
  .withDefaults({
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  })
);
```

### Route Definitions
```javascript
static routes = [
  { path: ['', 'posts'], component: Posts, title: 'Posts' },
  { path: 'post/:id', component: Post, title: 'Post' },
  { path: 'users', component: Users, title: 'Users' },
  { path: 'about', component: About, title: 'About' }
];
```

## Production Considerations

For production use, consider pinning to specific versions:

```javascript
import { Aurelia, CustomElement } from 'https://cdn.jsdelivr.net/npm/aurelia@2.0.0-beta.25/+esm';
import { RouterConfiguration } from 'https://cdn.jsdelivr.net/npm/@aurelia/router@2.0.0-beta.25/+esm';
import { IHttpClient } from 'https://cdn.jsdelivr.net/npm/@aurelia/fetch-client@2.0.0-beta.25/+esm';
```

## Related Examples

- **realworld-vanilla**: Complex RealWorld app implementation
- **realworld-vanilla-router**: Router demo with mock data
- **Other examples**: See the `/examples` directory for build-tool based projects

This example demonstrates how Aurelia 2 can handle real API integration without any build configuration, perfect for learning, prototyping, or simple deployments where you need working external data.