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

const MyReactComponent = () => {
  return <div>Hello from React!</div>;
};

export default MyReactComponent;
```

## Create an Aurelia Wrapper Component

To integrate the React component into Aurelia, create a wrapper Aurelia component that will render the React component.

```typescript
// src/resources/elements/react-wrapper.ts
import { customElement, bindable, INode } from 'aurelia';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

@customElement({ name: 'react-wrapper', template: '<template></template>' })
export class ReactWrapper {
  @bindable public reactComponent: React.FunctionComponent;

  constructor(@INode private element: Element) {}

  public binding(): void {
    ReactDOM.render(React.createElement(this.reactComponent), this.element);
  }

  public unbinding(): void {
    ReactDOM.unmountComponentAtNode(this.element);
  }
}
```

This wrapper takes a React component as a bindable property and uses ReactDOM to render it inside the Aurelia component's DOM node.

## Register the Wrapper Component and Use It

Now, you must register the wrapper component with Aurelia and then use it in your application.

```typescript
// src/main.ts
import { Aurelia } from 'aurelia';
import { ReactWrapper } from './resources/elements/react-wrapper';

Aurelia
  .register(ReactWrapper)
  .app(MyApp)
  .start();
```

Then, use it in a view:

```html
<!-- src/my-view.html -->
<template>
  <react-wrapper react-component.bind="MyReactComponent"></react-wrapper>
</template>
```

Ensure you import and make the React component available in your Aurelia component:

```typescript
// src/my-view.ts
import MyReactComponent from './components/MyReactComponent';

export class MyView {
  public MyReactComponent = MyReactComponent;
}
```

Following these steps, you can integrate React components into your Aurelia 2 application. This process highlights the flexibility of Aurelia, allowing you to take advantage of React's component library while enjoying the benefits of Aurelia's powerful features.
