# Table of contents

* [Introduction](README.md)

## Introduction

* [Quick start](getting-started/quick-install-guide.md)
* [Aurelia for new developers](getting-started/aurelia-for-new-developers.md)
* [Hello world](getting-started/quick-start-guide/README.md)
  * [Creating your first app](getting-started/quick-start-guide/creating-your-first-app.md)
  * [Your first component - part 1: the view model](getting-started/quick-start-guide/your-first-component-part-1-the-view-model.md)
  * [Your first component - part 2: the view](getting-started/quick-start-guide/your-first-component-part-2-the-view.md)
  * [Running our app](getting-started/quick-start-guide/running-our-app.md)
  * [Next steps](getting-started/quick-start-guide/next-steps.md)

## Templates

* [Template Syntax](templates/template-syntax/overview.md)
  * [Attribute binding](templates/template-syntax/attribute-binding.md)
  * [Event binding](templates/template-syntax/event-binding.md)
  * [Text interpolation](templates/template-syntax/text-interpolation.md)
  * [Template promises](templates/template-syntax/template-promises.md)
  * [Template references](templates/template-syntax/template-references.md)
  * [Template variables](templates/template-syntax/template-variables.md)
  * [Globals](templates/globals.md)
* [Custom attributes](templates/custom-attributes.md)
* [Advanced custom attributes](templates/advanced-custom-attributes.md)
* [Value converters (pipes)](templates/value-converters.md)
* [Binding behaviors](templates/binding-behaviors.md)
* [Form Inputs](templates/forms.md)
* [CSS classes and styling](templates/class-and-style-bindings.md)
* [Conditional Rendering](templates/conditional-rendering.md)
* [List Rendering](templates/repeats-and-list-rendering.md)
* [Lambda Expressions](templates/lambda-expressions.md)
* [Local templates (inline templates)](templates/local-templates.md)
* [SVG](templates/svg.md)

## Components

* [Component basics](components/components.md)
* [Component lifecycles](components/component-lifecycles.md)
* [Bindable properties](components/bindable-properties.md)
* [Styling components](components/class-and-style-binding.md)
* [Slotted content](components/shadow-dom-and-slots.md)
* [Scope and context](components/scope-and-binding-context.md)
* [CustomElement API](components/customelement-api.md)
* Template compilation
  * [processContent](developer-guides/scenarios/process-content.md)
  * [Extending templating syntax](developer-guides/scenarios/extending-templating-syntax.md)
  * [Modifying template parsing with AttributePattern](developer-guides/scenarios/attributepattern.md)
  * [Extending binding language](developer-guides/scenarios/bindingcommand.md)
  * [Using the template compiler](developer-guides/scenarios/the-template-compiler.md)
  * [Extending the template compiler](advanced-scenarios/extending-the-template-compiler.md)
  * [Attribute mapping](developer-guides/scenarios/attributemapper.md)

## Getting to know Aurelia

* Routing
  * @aurelia/router
    * [Getting started](router/getting-started.md)
    * [Router configuration](router/router-configuration.md)
    * [Configuring routes](router/configuring-routes.md)
    * [Viewports](router/viewports.md)
    * [Navigating](router/navigating.md)
    * [Lifecycle hooks](router/routing-lifecycle.md)
    * [Router hooks](router/router-hooks.md)
    * [Router events](router/router-events.md)
    * [Navigation model](router/navigation-model.md)
    * [Current route](router/current-route.md)
    * [Transition plan](router/transition-plans.md)
  * @aurelia/router-direct
    * [Getting Started](router-direct/getting-started.md)
    * [Creating Routes](router-direct/creating-routes.md)
    * [Routing Lifecycle](router-direct/routing-lifecycle.md)
    * [Viewports](router-direct/viewports.md)
    * [Navigating](router-direct/navigating.md)
    * [Route hooks](router-direct/router-hooks.md)
    * [Router animation](router-direct/router-animation.md)
    * [Route Events](router-direct/route-events.md)
    * [Router Tutorial](router-direct/router-tutorial.md)
    * [Router Recipes](router-direct/router-recipes.md)
* [App configuration and startup](getting-to-know-aurelia/app-configuration-and-startup.md)
* [Enhance](getting-to-know-aurelia/enhance.md)
* [Template controllers](getting-to-know-aurelia/template-controllers.md)
* [Understanding synchronous binding](getting-to-know-aurelia/synchronous-binding-system.md)
* [Dynamic composition](getting-to-know-aurelia/dynamic-composition.md)
* [Portalling elements](getting-to-know-aurelia/portalling-elements.md)
* [Observation](getting-to-know-aurelia/observation/README.md)
  * [Observing property changes with @observable](getting-to-know-aurelia/observation/observing-property-changes-with-observable.md)
  * [Effect observation](getting-to-know-aurelia/observation/effect-observation.md)
  * [HTML observation](getting-to-know-aurelia/observation/html-observation.md)
  * [Using observerLocator](getting-to-know-aurelia/observation/using-observerlocator.md)
* [Watching data](getting-to-know-aurelia/watching-data.md)
* [Dependency injection (DI)](getting-to-know-aurelia/dependency-injection.md)
* [App Tasks](getting-to-know-aurelia/app-tasks.md)
* [Task Queue](getting-to-know-aurelia/task-queue.md)
* [Event Aggregator](getting-to-know-aurelia/event-aggregator.md)

## Developer Guides

* [Animation](developer-guides/animation.md)
* [Testing](developer-guides/testing/overview.md)
  * [Overview](developer-guides/testing/overview.md)
  * [Testing attributes](developer-guides/testing/testing-attributes.md)
  * [Testing components](developer-guides/testing/testing-components.md)
  * [Testing value converters](developer-guides/testing/testing-value-converters.md)
  * [Working with the fluent API](developer-guides/testing/fluent-api.md)
  * [Stubs, mocks & spies](developer-guides/testing/mocks-spies.md)
* [Logging](getting-to-know-aurelia/logging.md)
* [Building plugins](developer-guides/building-plugins.md)
* [Web Components](developer-guides/web-components.md)
* [UI virtualization](developer-guides/ui-virtualization.md)
* [Performance optimization techniques](advanced-scenarios/performance-optimization-techniques.md)
* [Organizing large-scale projects](advanced-scenarios/organizing-large-scale-projects.md)
* [Debugging and Troubleshooting](developer-guides/debugging-and-troubleshooting.md)
* [Error Handling Patterns](developer-guides/error-handling-patterns.md)
* [Errors](developer-guides/error-messages/README.md)
  * [Kernel Errors](developer-guides/error-messages/0001-to-0023/README.md)
  * [Template Compiler Errors](developer-guides/error-messages/0088-to-0723/README.md)
  * [Dialog Errors](developer-guides/error-messages/0901-to-0908/README.md)
  * [Runtime HTML Errors](developer-guides/error-messages/runtime-html/README.md)
* [Bundlers](developer-guides/bundlers/README.md)
* [Recipes](developer-guides/scenarios/README.md)
  * [Apollo GraphQL integration](developer-guides/scenarios/graphql.md)
  * [Auth0 integration](developer-guides/scenarios/auth0.md)
  * [Containerizing Aurelia apps with Docker](developer-guides/scenarios/docker.md)
  * [Cordova/Phonegap integration](developer-guides/scenarios/cordova.md)
  * [CSS-in-JS with Emotion](developer-guides/scenarios/css-in-js-with-emotion.md)
  * [DOM style injection](developer-guides/scenarios/dom-style-injection.md)
  * [Firebase integration](developer-guides/scenarios/firebase-integration.md)
  * [Markdown integration](developer-guides/scenarios/markdown-integration.md)
  * [Multi root](developer-guides/scenarios/multi-root.md)
  * [Progress Web Apps (PWA's)](developer-guides/scenarios/pwa.md)
  * [Securing an app](developer-guides/scenarios/securing-an-app.md)
  * [SignalR integration](developer-guides/scenarios/signalr-integration.md)
  * [Strongly-typed templates](developer-guides/scenarios/strongly-typed-template.md)
  * [TailwindCSS integration](developer-guides/scenarios/tailwindcss-integration.md)
  * [WebSockets Integration](developer-guides/scenarios/websockets.md)
  * [Web Workers Integration](developer-guides/scenarios/using-webworkers.md)
* [Playground](reference/examples/README.md)
  * [Binding & Templating](reference/examples/binding-and-templating/README.md)
  * [Custom Attributes](reference/examples/custom-attributes/README.md)
    * [Binding to Element Size](reference/examples/custom-attributes/binding-to-element-size.md)
  * [Integration](reference/examples/integration/README.md)
    * [Microsoft FAST](reference/examples/integration/ms-fast.md)
    * [Ionic](reference/examples/integration/ionic.md)
* [Migrating to Aurelia 2](developer-guides/migrating-to-aurelia-2/README.md)
  * [For plugin authors](developer-guides/migrating-to-aurelia-2/for-plugin-authors.md)
  * [Side-by-side comparison](developer-guides/migrating-to-aurelia-2/side-by-side-comparison.md)
* [Cheat Sheet](developer-guides/cheat-sheet.md)

## Aurelia Packages

* [Validation](aurelia-packages/validation/README.md)
  * [Validation Tutorial](aurelia-packages/validation/validation-tutorial.md)
  * [Plugin Configuration](aurelia-packages/validation/registering-the-plugin.md)
  * [Defining & Customizing Rules](aurelia-packages/validation/defining-rules.md)
  * [Architecture](aurelia-packages/validation/architecture.md)
  * [Tagging Rules](aurelia-packages/validation/tagging-rules.md)
  * [Model Based Validation](aurelia-packages/validation/model-based-validation.md)
  * [Validation Controller](aurelia-packages/validation/validation-controller.md)
  * [Validate Binding Behavior](aurelia-packages/validation/validate-binding-behavior.md)
  * [Displaying Errors](aurelia-packages/validation/displaying-errors.md)
  * [I18n Internationalization](aurelia-packages/validation/i18n-internationalization.md)
  * [Migration Guide & Breaking Changes](aurelia-packages/validation/migration-guide.md)
* [i18n Internationalization](aurelia-packages/internationalization.md)
* [Fetch Client](aurelia-packages/fetch-client/overview.md)
  * [Overview](aurelia-packages/fetch-client/overview.md)
  * [Setup and Configuration](aurelia-packages/fetch-client/setting-up.md)
  * [Response types](aurelia-packages/fetch-client/response-types.md)
  * [Working with forms](aurelia-packages/fetch-client/forms.md)
  * [Intercepting responses & requests](aurelia-packages/fetch-client/interceptors.md)
  * [Advanced](aurelia-packages/fetch-client/advanced.md)
* [Event Aggregator](aurelia-packages/event-aggregator.md)
* [State](aurelia-packages/state.md)
* [Store](aurelia-packages/store/README.md)
  * [Configuration and Setup](aurelia-packages/store/configuration-and-setup.md)
  * [Middleware](aurelia-packages/store/middleware.md)
* [Dialog](aurelia-packages/dialog.md)

## Tutorials

* [Building a ChatGPT inspired app](tutorials/build-a-chatgpt-inspired-app.md)
* [Building a realtime cryptocurrency price tracker](tutorials/building-a-realtime-cryptocurrency-price-tracker.md)
* [Building a todo application](tutorials/building-a-todo-application.md)
* [Building a weather application](tutorials/building-a-weather-application.md)
* [Building a widget-based dashboard](tutorials/create-a-dashboard-using-dynamic-composition.md)
* [React inside Aurelia](tutorials/using-react-inside-aurelia.md)
* [Svelte inside Aurelia](tutorials/using-svelte-inside-aurelia.md)
* [Synthetic view](tutorials/synthetic-view.md)
* [Vue inside Aurelia](tutorials/using-vue-inside-aurelia.md)

## Community Contribution

* [Joining the community](community-contribution/joining-the-community.md)
* [Code of conduct](community-contribution/code-of-conduct.md)
* [Contributor guide](community-contribution/contributor-guide.md)
* [Building and testing aurelia](community-contribution/building-and-testing-aurelia.md)
* [Writing documentation](community-contribution/writing-documentation.md)
* [Translating documentation](community-contribution/translating-documentation.md)
