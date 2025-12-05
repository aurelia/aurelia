---
description: Libception. Learn how to use React inside of your Aurelia applications.
---

# Using React inside Aurelia

Aurelia's design embraces flexibility and interoperability, making it well-suited for integration with other libraries and frameworks. One common scenario is incorporating React components into an Aurelia application. This integration showcases Aurelia's adaptability and how it can leverage the strengths of other ecosystems. Below, we provide a detailed guide and code examples to integrate a React component seamlessly into an Aurelia 2 application.

## Install Dependencies

First, ensure that your Aurelia project has the necessary dependencies to use React. You'll need React and ReactDOM, plus the matching type packages when you compile with TypeScript.

```bash
npm install react react-dom
npm install --save-dev @types/react @types/react-dom
```

> Keep the `@types` versions in sync with the React major you're using (for example, `@types/react@19` with `react@19`). If you're validating a future React release candidate, follow the React upgrade guide instructions to alias the preview `types-react` packages so your compiler picks up the experimental definitions.

## Create a React Component

For this example, let's create a simple React component. You can replace this with any React component you need.

```tsx
// src/components/my-react-component.tsx
import type { FC } from 'react';

export interface MyReactComponentProps {
  message?: string;
}

export const MyReactComponent: FC<MyReactComponentProps> = ({ message = 'Hello from React!' }) => (
  <div>{message}</div>
);

export default MyReactComponent;
```

## Create an Aurelia Wrapper Component

To integrate the React component into Aurelia, create a wrapper Aurelia component that will render the React component.

```typescript
// src/resources/elements/react-wrapper.ts
import { customElement, bindable } from '@aurelia/runtime-html';
import { createElement, type ComponentType } from 'react';
import { createRoot, type Root } from 'react-dom/client';

@customElement({ name: 'react-wrapper', template: '<div ref="container"></div>' })
export class ReactWrapper {
  @bindable public reactComponent?: ComponentType<any>;
  @bindable public props?: Record<string, unknown>;
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
      this.root.render(createElement(this.reactComponent, this.props ?? {}));
    }
  }
}
```

This wrapper exposes the React component and its props as bindables. It uses React's `createRoot` API—the modern entry point for React 18 and React 19 apps—to render the component inside Aurelia's DOM container. The wrapper handles the full React lifecycle by creating the root in `attached()`, re-rendering in response to Aurelia bindable updates via `propertyChanged()`, and calling `unmount()` inside `detaching()` so that React cleans up timers and subscriptions.

## Register the Wrapper Component and Use It

Now, register the wrapper component with Aurelia and then use it in your application.

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

Then, reference the wrapper in a view:

```html
<!-- src/my-view.html -->
<react-wrapper
  react-component.bind="myReactComponent"
  props.bind="reactProps">
</react-wrapper>
```

Ensure you import and make the React component available in your Aurelia component:

```typescript
// src/my-view.ts
import MyReactComponent from './components/my-react-component';

export class MyView {
  public myReactComponent = MyReactComponent;
  public reactProps = { message: 'Hello from Aurelia!' };
}
```

## Advanced Integration Patterns

### Error Boundaries

For production applications, consider wrapping React components in error boundaries:

```tsx
// src/components/error-boundary.tsx
import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  readonly children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = { hasError: false };

  public static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  public componentDidCatch(error: unknown, errorInfo: ErrorInfo): void {
    console.error('React component error:', error, errorInfo);
  }

  public render(): ReactNode {
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
    const wrappedComponent = createElement(
      ErrorBoundary,
      {},
      createElement(this.reactComponent, this.props ?? {}),
    );
    this.root.render(wrappedComponent);
  }
}
```

### React Root Error Hooks

React 19 exposes additional root options, letting you hook into caught or uncaught errors even before they reach an error boundary. Add another bindable for `rootOptions` and pass it to `createRoot` when you need centralized logging:

```typescript
import type { RootOptions } from 'react-dom/client';

@bindable public rootOptions?: RootOptions;

public attached(): void {
  if (this.container && this.reactComponent) {
    this.root = createRoot(this.container, this.rootOptions);
    this.renderReactComponent();
  }
}
```

You can populate `rootOptions` from Aurelia with callbacks such as:

```typescript
import type { RootOptions } from 'react-dom/client';

export class MyView {
  public reactRootOptions: RootOptions = {
    onCaughtError(error, errorInfo) {
      console.warn('Recoverable React error', error, errorInfo);
    },
    onUncaughtError(error, errorInfo) {
      // Report to an error service
    },
  };
}
```

Wire it up in the view: `<react-wrapper root-options.bind="reactRootOptions" ...></react-wrapper>`.

### React 18+ and 19 Compatibility

This integration pattern embraces the React DOM client API introduced in React 18 and retained in React 19:

- `createRoot` is the entry point to Concurrent React. Using it ensures your embedded components can opt into features like transitions without any extra glue.
- React 18+ automatically batches state updates, so React components you host inside Aurelia get predictable renders even if multiple Aurelia bindings mutate the props in the same tick.
- React 19 ships improved TypeScript definitions and keeps the expanded root options (`onCaughtError`, `onUncaughtError`, and `onRecoverableError`), letting you consolidate error handling in one place.

### Performance Considerations

- React components are re-rendered when `props` change via Aurelia's `propertyChanged()` lifecycle
- Use `React.memo()` (or `PureComponent`) for expensive components to prevent unnecessary re-renders when Aurelia pushes the same data reference
- Avoid recreating prop objects inline in your view—store them on the view-model so Aurelia only notifies React when values actually change
- Consider implementing `shouldComponentUpdate` logic or memoization in the React component itself for fine-grained control

Following these steps, you can integrate React components into your Aurelia 2 application. This process highlights the flexibility of Aurelia, allowing you to take advantage of React's component library while enjoying the benefits of Aurelia's powerful features.
