---
description: Libception. Learn how to use React inside of your Aurelia applications.
---

# Using React inside Aurelia

Aurelia's design embraces flexibility and interoperability, making it well-suited for integration with other libraries and frameworks. One common scenario is incorporating React components into an Aurelia application. This integration showcases Aurelia's adaptability and how it can leverage the strengths of other ecosystems. Below, we provide a detailed guide and code examples to integrate a React component seamlessly into an Aurelia 2 application.

## Install Dependencies

First, ensure that your Aurelia project has the necessary dependencies to use React. You'll need React and ReactDOM, along with any types of TypeScript support if needed.

```bash
npm install react react-dom
npm install --save-dev @types/react @types/react-dom
```

## Create a React Component

For this example, let's create a simple React component. You can replace this with any React component you need.

```jsx
// src/components/MyReactComponent.jsx
import React from 'react';

const MyReactComponent = ({ message = 'Hello from React!' }) => {
  return <div>{message}</div>;
};

export default MyReactComponent;
```

## Create an Aurelia Wrapper Component

To integrate the React component into Aurelia, create a wrapper Aurelia component that will render the React component.

```typescript
// src/resources/elements/react-wrapper.ts
import { customElement, bindable } from 'aurelia';
import { createElement } from 'react';
import { createRoot, Root } from 'react-dom/client';

@customElement({ name: 'react-wrapper', template: '<template><div ref="container"></div></template>' })
export class ReactWrapper {
  @bindable public reactComponent: React.ComponentType<any>;
  @bindable public props?: Record<string, any>;
  private container!: HTMLDivElement;
  private root: Root | null = null;

  public attached(): void {
    if (this.container && this.reactComponent) {
      this.root = createRoot(this.container);
      this.renderReactComponent();
    }
  }

  public propertyChanged(): void {
    if (this.root) {
      this.renderReactComponent();
    }
  }

  public detaching(): void {
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }
  }

  private renderReactComponent(): void {
    if (this.root && this.reactComponent) {
      this.root.render(createElement(this.reactComponent, this.props || {}));
    }
  }
}
```

This wrapper takes a React component and optional props as bindable properties. It uses React's `createRoot` API (React 18+) to render the component inside the Aurelia component's DOM container. The wrapper properly handles React lifecycle by creating the root in `attached()` and cleaning up in `detaching()`, and supports reactive updates when props change via `propertyChanged()`.

## Register the Wrapper Component and Use It

Now, you must register the wrapper component with Aurelia and then use it in your application.

```typescript
// src/main.ts
import { Aurelia } from 'aurelia';
import { ReactWrapper } from './resources/elements/react-wrapper';
import { MyApp } from './my-app';

Aurelia
  .register(ReactWrapper)
  .app(MyApp)
  .start();
```

Then, use it in a view:

```html
<!-- src/my-view.html -->
<template>
  <react-wrapper 
    react-component.bind="myReactComponent" 
    props.bind="reactProps">
  </react-wrapper>
</template>
```

Ensure you import and make the React component available in your Aurelia component:

```typescript
// src/my-view.ts
import MyReactComponent from './components/MyReactComponent';

export class MyView {
  public myReactComponent = MyReactComponent;
  public reactProps = { message: 'Hello from Aurelia!' };
}
```

## Advanced Integration Patterns

### Error Boundaries

For production applications, consider wrapping React components in error boundaries:

```jsx
// src/components/ErrorBoundary.jsx
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('React component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong with the React component.</div>;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
```

Then modify your wrapper to use the error boundary:

```typescript
private renderReactComponent(): void {
  if (this.root && this.reactComponent) {
    const wrappedComponent = createElement(ErrorBoundary, {}, 
      createElement(this.reactComponent, this.props || {})
    );
    this.root.render(wrappedComponent);
  }
}
```

### React 18+ and 19 Compatibility

This integration pattern works with React 18, 19, and future versions. The `createRoot` API is the modern standard and provides:

- **Concurrent rendering** for better performance
- **Automatic batching** of state updates  
- **Improved TypeScript support** in React 19
- **Better error handling** with onCaughtError and onUncaughtError options

### Performance Considerations

- React components are re-rendered when `props` change via Aurelia's `propertyChanged()` lifecycle
- Use React's `memo()` for expensive components to prevent unnecessary re-renders
- Consider implementing `shouldComponentUpdate` logic in your wrapper if needed

Following these steps, you can integrate React components into your Aurelia 2 application. This process highlights the flexibility of Aurelia, allowing you to take advantage of React's component library while enjoying the benefits of Aurelia's powerful features.
