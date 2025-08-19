---
description: >-
  Learn how to use Aurelia's enhance feature to add interactivity to existing HTML,
  integrate with other frameworks, hydrate server-rendered content, and create
  multiple Aurelia instances in your application.
---

# Enhance

## What is Enhancement?

Enhancement allows you to bring Aurelia's data binding, templating, and component features to existing DOM content without replacing it entirely. Instead of starting with an empty element and rendering into it, enhancement takes existing HTML and makes it "Aurelia-aware".

This is perfect for:
- **Progressive enhancement** of server-rendered pages
- **Integration** with existing applications or other frameworks  
- **Widget development** where you control specific sections of a page
- **Content Management Systems** where you want to add interactivity to generated content
- **Legacy application modernization** done incrementally

The [startup sections](app-configuration-and-startup.md) showed how to start Aurelia for empty elements. Enhancement lets you work with existing DOM trees instead.

## Understanding What Gets Enhanced

When you enhance an element, Aurelia treats that element as if it were the template of a custom element. The existing HTML becomes the "template" and your component object becomes the "view model" that provides data and behavior.

### Basic Enhancement Syntax

```typescript
// Using the convenience method (recommended)
const enhanceRoot = await Aurelia.enhance({
  host: document.querySelector('#my-content'),
  component: { message: 'Hello World' }
});

// Using instance method  
const au = new Aurelia();
const enhanceRoot = await au.enhance({
  host: document.querySelector('#my-content'),
  component: { message: 'Hello World' }
});
```

### Component Types: Classes, Instances, or Objects

You can enhance with three different component types:

```typescript
// 1. Plain object (most common for simple cases)
const enhanceRoot = await Aurelia.enhance({
  host: element,
  component: {
    message: 'Hello',
    items: [1, 2, 3],
    handleClick() { 
      console.log('Clicked!'); 
    }
  }
});

// 2. Class instance (when you need constructor logic)
class MyViewModel {
  message = 'Hello';
  constructor() {
    // initialization logic
  }
}
const enhanceRoot = await Aurelia.enhance({
  host: element,
  component: new MyViewModel()
});

// 3. Custom element class (for reusable components)
@customElement({ name: 'my-widget' })
class MyWidget {
  @bindable message: string;
}
const enhanceRoot = await Aurelia.enhance({
  host: element,
  component: MyWidget
});
```

### Key Enhancement Concepts

1. **Existing DOM is preserved**: Enhancement doesn't replace your HTML - it makes it interactive
2. **Existing event handlers remain**: Any JavaScript event listeners you've already attached stay functional  
3. **Manual lifecycle management**: You're responsible for calling `deactivate()` when done
4. **Template compilation**: Aurelia compiles the existing HTML for bindings and directives

### Proper Cleanup

Always clean up enhanced content to prevent memory leaks:

```typescript
const enhanceRoot = await Aurelia.enhance({ host, component });

// Later, when you're done:
await enhanceRoot.deactivate();
```

## Practical Enhancement Examples

### Server-Rendered Content Enhancement

Suppose your server renders this HTML:

```html
<!-- Server-rendered content -->
<div id="user-profile">
  <h2>Welcome back!</h2>
  <div class="stats">
    <span>Loading user data...</span>
  </div>
  <button id="refresh-btn">Refresh</button>
</div>
```

You can enhance it to make it interactive:

```typescript
import Aurelia from 'aurelia';

// Your existing server-rendered element
const profileElement = document.querySelector('#user-profile');

// Enhance with Aurelia interactivity
const enhanceRoot = await Aurelia.enhance({
  host: profileElement,
  component: {
    username: 'Loading...',
    loginCount: 0,
    
    async created() {
      // Load user data when component initializes
      const userData = await fetch('/api/user/profile').then(r => r.json());
      this.username = userData.username;
      this.loginCount = userData.loginCount;
    },
    
    refreshData() {
      this.created(); // Reload data
    }
  }
});

// Update your HTML to use bindings:
// <h2>Welcome back, ${username}!</h2>
// <div class="stats">
//   <span>Login count: ${loginCount}</span>
// </div>
// <button click.delegate="refreshData()">Refresh</button>
```

### Widget Integration Example

Create interactive widgets within existing pages:

```html
<!-- Existing page content -->
<div class="article">
  <h1>My Blog Post</h1>
  <p>Some content...</p>
  
  <!-- Widget placeholder -->
  <div id="comment-widget">
    <h3>Comments</h3>
    <div class="loading">Loading comments...</div>
  </div>
</div>
```

```typescript
// Enhance just the comment widget
const commentWidget = document.querySelector('#comment-widget');

const enhanceRoot = await Aurelia.enhance({
  host: commentWidget,
  component: {
    comments: [],
    newComment: '',
    
    async created() {
      this.comments = await this.loadComments();
    },
    
    async loadComments() {
      return fetch('/api/comments/123').then(r => r.json());
    },
    
    async addComment() {
      if (!this.newComment.trim()) return;
      
      await fetch('/api/comments', {
        method: 'POST',
        body: JSON.stringify({ text: this.newComment }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      this.newComment = '';
      this.comments = await this.loadComments();
    }
  }
});

// Update HTML to:
// <div id="comment-widget">
//   <h3>Comments (${comments.length})</h3>
//   <div repeat.for="comment of comments">
//     <p>${comment.text}</p>
//   </div>
//   <div>
//     <input value.bind="newComment" placeholder="Add comment...">
//     <button click.delegate="addComment()">Post</button>
//   </div>
// </div>
```

## Dynamic Content Enhancement

Enhancement is perfect for content that gets added to the page after initial load.

### Enhancing Dynamically Loaded Content

```typescript
import { Aurelia, resolve } from 'aurelia';

export class DynamicContentComponent {
  private enhancedRoots: Array<any> = [];
  
  constructor(private au = resolve(Aurelia)) {}

  async loadMoreContent() {
    // Load HTML from server
    const response = await fetch('/api/content/next-page');
    const htmlContent = await response.text();
    
    // Create container for new content
    const container = document.createElement('div');
    container.innerHTML = htmlContent;
    document.querySelector('#content-area').appendChild(container);
    
    // Enhance the new content
    const enhanceRoot = await this.au.enhance({
      host: container,
      component: {
        currentUser: this.currentUser,
        likePost: (postId) => this.likePost(postId),
        sharePost: (postId) => this.sharePost(postId)
      }
    });
    
    // Keep track for cleanup
    this.enhancedRoots.push(enhanceRoot);
  }
  
  // Clean up when component is destroyed
  async unbinding() {
    for (const root of this.enhancedRoots) {
      await root.deactivate();
    }
    this.enhancedRoots = [];
  }
}
```

### Enhancing Modal or Dialog Content

```typescript
export class ModalService {
  private currentModal: any = null;
  
  async showModal(contentHtml: string, viewModel: any) {
    // Create modal element
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <button class="close" click.delegate="closeModal()">&times;</button>
        ${contentHtml}
      </div>
    `;
    
    document.body.appendChild(modal);

    // Enhance the modal content
    this.currentModal = await Aurelia.enhance({
      host: modal,
      component: {
        ...viewModel,
        closeModal: () => this.closeModal()
      }
    });
  }
  
  async closeModal() {
    if (this.currentModal) {
      await this.currentModal.deactivate();
      document.querySelector('.modal')?.remove();
      this.currentModal = null;
    }
  }
}
```

## Advanced Enhancement Patterns

### Using Custom Containers

When you need specific services or configurations for enhanced content:

```typescript
import { DI, Registration } from '@aurelia/kernel';
import { LoggerConfiguration, LogLevel } from 'aurelia';

// Create custom container for widget
const widgetContainer = DI.createContainer()
  .register(
    Registration.singleton('ApiService', MyApiService),
    LoggerConfiguration.create({ level: LogLevel.debug })
  );

const enhanceRoot = await Aurelia.enhance({
  host: document.querySelector('#my-widget'),
  component: MyWidget,
  container: widgetContainer  // Use custom container
});
```

### Lifecycle Hooks in Enhanced Components

Enhanced components support all standard Aurelia lifecycle hooks:

```typescript
const enhanceRoot = await Aurelia.enhance({
  host: element,
  component: {
    data: null,
    
    // Called when component is being set up
    created() {
      console.log('Component created');
    },
    
    // Called before data binding starts
    binding() {
      console.log('Starting data binding');
    },
    
    // Called after data binding completes
    bound() {
      console.log('Data binding complete');
    },
    
    // Called when component is being attached to DOM
    attaching() {
      console.log('Attaching to DOM');
    },
    
    // Called after component is attached to DOM
    attached() {
      console.log('Attached to DOM - ready for user interaction');
      // Good place for focus, animations, etc.
    },
    
    // Called when component is being removed
    detaching() {
      console.log('Detaching from DOM');
    },
    
    // Called when data bindings are being torn down
    unbinding() {
      console.log('Unbinding data');
      // Cleanup subscriptions, timers, etc.
    }
  }
});
```

## Common Enhancement Patterns

### Progressive Enhancement Checklist

1. **Identify enhancement targets**: Elements that need interactivity
2. **Preserve existing functionality**: Don't break existing event handlers
3. **Plan your data flow**: How will data get to enhanced components?
4. **Handle cleanup**: Always deactivate when done
5. **Test without JavaScript**: Ensure basic functionality works without enhancement

### Best Practices

- **Start small**: Enhance specific widgets before entire sections
- **Use meaningful component objects**: Include methods and properties that make sense
- **Handle errors gracefully**: Enhancement might fail if DOM structure changes
- **Document what gets enhanced**: Make it clear to other developers
- **Consider performance**: Don't enhance too many elements at once

### When NOT to Use Enhancement

- **New applications**: Use regular `Aurelia.app()` for greenfield projects
- **Full page control**: When you control the entire page, standard app startup is simpler
- **Simple static content**: If content doesn't need interactivity
- **Performance critical sections**: Enhancement has overhead compared to pre-compiled templates

Enhancement shines when you need to add Aurelia's power to existing content without rebuilding everything from scratch.
