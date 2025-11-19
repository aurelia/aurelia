# Overview

Aurelia 2's templating system is the cornerstone of crafting rich, interactive user interfaces for your web applications.  It transcends the limitations of static HTML, empowering you to create truly dynamic views that respond intelligently to both application data and user interactions.  At its core, Aurelia templating establishes a fluid and intuitive connection between your HTML templates and your application logic written in JavaScript or TypeScript, resulting in a responsive and data-driven UI development experience.

Forget static HTML pages. Aurelia 2 templates are living, breathing views that actively engage with your application's underlying code. They react in real-time to data modifications and user actions, ensuring your UI is always in sync and providing a seamless user experience. This deep integration not only streamlines your development workflow but also significantly reduces boilerplate, allowing you to build sophisticated UIs with greater clarity and efficiency.

From the moment you initiate an Aurelia 2 project, you'll find yourself working with templates that are both comfortably familiar in their HTML structure and remarkably powerful in their extended capabilities. Whether you're structuring the layout for a complex component or simply displaying data within your HTML, Aurelia 2's templating syntax is meticulously designed to be both highly expressive and exceptionally developer-friendly, making UI development a truly enjoyable and productive process.

If you need even finer control, dive into the focused guides linked throughout this section—for example, [binding mode behaviors](../binding-behaviors.md#binding-mode-behaviors) for forcing one-time/one-way flow on demand, or the new [event modifier catalog](event-binding.md#event-modifiers) for tailoring DOM events.

## Key Features of Aurelia Templating

Aurelia's templating engine is packed with features designed to enhance your UI development workflow and capabilities:

- **Effortless Two-Way Data Binding:** Experience truly seamless synchronization between your application's data model and the rendered view. Aurelia's robust two-way data binding automatically keeps your model and UI in perfect harmony, eliminating manual DOM manipulation and ensuring data consistency with minimal effort.

- **Extendable HTML with Custom Elements and Attributes:**  Break free from standard HTML limitations by creating your own reusable components and HTML attributes.  Encapsulate complex UI logic and behavior into custom elements and attributes, promoting modularity, code reuse, and a more maintainable codebase. This allows you to tailor HTML to the specific needs of your application.

- **Adaptive Dynamic Composition for Flexible UIs:**  Build truly dynamic and adaptable user interfaces with Aurelia's dynamic composition. Render different components and templates on-the-fly based on your application's state, user interactions, or any dynamic condition. This enables you to create flexible layouts and UI structures that respond intelligently to changing requirements.

- **Expressive and Intuitive Templating Syntax:**  Harness the power of Aurelia's rich templating syntax to handle common UI patterns with ease.  From iterating over lists of data and conditionally rendering UI elements to effortlessly managing user events, Aurelia's syntax is designed to be both powerful and remarkably intuitive, reducing complexity and boosting productivity.

- **Simplified Data Integration with Expressions and Interpolation:**  Seamlessly integrate your application data into your templates using Aurelia's straightforward expression syntax.  Effortlessly bind data to HTML elements and manipulate attributes directly within your templates using interpolation, making data display and interaction a breeze.

Aurelia 2's templating system is more than just a way to write HTML; it's a comprehensive toolkit for building modern, dynamic web applications with efficiency and elegance. By embracing its features, you'll unlock a more productive and enjoyable UI development experience.

## Learn the Syntax by Topic

Jump straight into the focused articles that break down each template capability:

- **Text & expression binding** – Start with the [text interpolation guide](text-interpolation.md) to master `${ }` expressions and formatting tips.
- **Attribute & property binding** – Control DOM attributes, classes, and styles with the [attribute binding reference](attribute-binding.md).
- **Event handling** – Wire up DOM interactions plus modifiers using the [event binding guide](event-binding.md#event-modifiers).
- **Template references** – Capture DOM elements, child components, or controllers via the [template reference walkthrough](template-references.md).
- **Template variables** – Share computed values inside markup with the [template variables guide](template-variables.md).
- **Async UI flows** – Render placeholders or await data using the [template promises article](template-promises.md).
- **Advanced scenarios** – Combine bindings with conditionals, loops, and partials in the [recipes collection](../recipes/README.md) and [forms guide](../forms/README.md).
