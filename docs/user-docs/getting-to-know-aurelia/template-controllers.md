# Template Controllers

Template controllers are a unique and powerful feature in Aurelia 2, providing a way to encapsulate and reuse templating logic directly within your views.  They allow you to manipulate the rendering of a template based on custom logic, offering a higher level of abstraction compared to simple value bindings or even custom attributes.

Think of template controllers as building blocks for creating reusable templating patterns. They are distinct from [components)(../components/components.md) in that they don't define new HTML elements. Instead, they *control* the rendering behavior of existing elements and their content.  Common examples of built-in template controllers in Aurelia include `if.bind`, `repeat.for`, and `with.bind`.

## Understanding Template Controllers

At their core, template controllers are classes that interact with Aurelia's rendering engine to dynamically manage the display of content. They operate on the element they are declared on and can conditionally render, repeat, or otherwise modify the template based on your defined logic.

### Defining a Template Controller: Conventions and Decorators

Aurelia 2 offers two primary ways to define a template controller, providing flexibility based on your preference and project style:

1.  **Using the `@templateController()` Decorator**: This approach uses a decorator to explicitly register your class as a template controller and assign it a name for use in templates.

    ```typescript
    import { templateController } from 'aurelia';

    @templateController('permission') // Registers as 'permission' template controller
    export class PermissionTemplateController {
        // ... template controller logic ...
    }
    ```

2.  **Using Naming Conventions**: Aurelia's convention-based approach automatically recognizes classes as template controllers if their names end with `TemplateController`. The name used in templates will be the class name with `TemplateController` removed, in lower camel case.  This method often leads to cleaner and more intention-revealing code, as the class name itself clearly signals its purpose.

    ```typescript
    import { templateController } from 'aurelia';

    export class PermissionTemplateController { // Convention-based: recognized as 'permission'
        // ... template controller logic ...
    }
    ```

    In this case, `PermissionTemplateController` is automatically recognized and registered as a template controller with the name `permission`. This convention clearly communicates the role of the class as a template controller.

## Creating a working template controller

Let's create a custom template controller for handling permissions, demonstrating the convention-based approach. This example will conditionally display content based on a user's role and a required role.

```typescript
import { bindable, CustomElementDefinition, ICustomElementController, IRenderLocation, ISyntheticView, IViewFactory, ViewFactory } from "@aurelia/runtime-html";
import { IContainer, resolve, templateController } from "aurelia";

export class PermissionTemplateController { // Convention: recognized as 'permission'
    readonly $controller: ICustomElementController<this>;

    private viewFactory = resolve(IViewFactory);
    private renderLocation = resolve(IRenderLocation);
    private container = resolve(IContainer);

    // Original view (content inside the element with the template controller)
    private mainView: ISyntheticView;
    // View to display when permission is denied
    private deniedView: ISyntheticView;

    @bindable() userRole: string = '';
    @bindable() requiredRole: string = '';

    // Definition for a simple custom element to display "Access Denied" message
    private static deniedDefinition = CustomElementDefinition.create({
        name: 'denied-message',
        template: `
            <div style="border: 2px solid red; padding: 8px; margin: 4px 0;">
                <strong>Access Denied:</strong> Sorry, you do not have permission to see this content.
            </div>
        `
    });

    constructor() {
        // Create the main view - this represents the original content
        this.mainView = this.viewFactory.create().setLocation(this.renderLocation);

        // Create the "denied" view using our deniedDefinition
        const deniedViewFactory = new ViewFactory(this.container, PermissionTemplateController.deniedDefinition);
        this.deniedView = deniedViewFactory.create().setLocation(this.renderLocation);
    }

    // Lifecycle: Called when the template controller is attached to the DOM
    attaching() {
        this.updateViews(); // Initial view update on attachment
    }

    // React to changes in the 'userRole' bindable property
    userRoleChanged() {
        this.updateViews();
    }

    // React to changes in the 'requiredRole' bindable property
    requiredRoleChanged() {
        this.updateViews();
    }

    private updateViews() {
        // Ensure the controller is active before proceeding
        if (!this.$controller.isActive) {
            return;
        }

        if (this.userRole === this.requiredRole) {
            // User has the required role: Show main content, hide denied message
            this.deniedView.deactivate(this.deniedView, this.$controller); // Deactivate denied view
            this.mainView.activate(this.mainView, this.$controller, this.$controller.scope); // Activate main view
        } else {
            // User does not have the required role: Hide main content, show denied message
            this.mainView.deactivate(this.mainView, this.$controller); // Deactivate main view
            this.deniedView.activate(this.deniedView, this.$controller, this.$controller.scope); // Activate denied view
        }
    }

    // Lifecycle: Called when the template controller is detached from the DOM
    detaching() {
        this.mainView.deactivate(this.mainView, this.$controller); // Deactivate main view on detach
        this.deniedView.deactivate(this.deniedView, this.$controller); // Deactivate denied view on detach
    }
}
```

### An overview of our template controller

Let's break down the key parts of this `PermissionTemplateController`:

1.  **Convention-based Registration**:  By naming the class `PermissionTemplateController`, Aurelia automatically registers it as a template controller with the name `permission`. This is the name you will use in your HTML templates. Alternatively, you could have used the decorator `@templateController('permission')` on a class named `Permission`, achieving the same result.
2.  **Dependency Injection**:
    *   `IViewFactory`: Injected via `resolve(IViewFactory)`. This service is responsible for creating views, which are instances of templates. We use it to create both the `mainView` (for the original content) and the `deniedView` (for the "Access Denied" message).
    *   `IRenderLocation`: Injected via `resolve(IRenderLocation)`. This represents the precise location in the DOM where the template controller's content should be rendered. Aurelia automatically provides the `IRenderLocation` that corresponds to the element where the template controller is used in the HTML.
    *   `IContainer`: Injected via `resolve(IContainer)`. This is Aurelia's dependency injection container itself. We use it here to create a specialized `ViewFactory` specifically for the `deniedDefinition`.
3.  **`$controller: ICustomElementController<this>`**:  Aurelia automatically injects the controller instance for this template controller. This controller provides access to the template controller's lifecycle and its internal state management within Aurelia's rendering system.
4.  **`mainView: ISyntheticView` and `deniedView: ISyntheticView`**: These properties hold instances of `ISyntheticView`. `ISyntheticView` represents a lightweight, reusable view instance in Aurelia.
    *   `mainView` represents the original content within the element in your HTML where you apply the `permission` template controller.
    *   `deniedView` represents the "Access Denied" message template, which is rendered when the permission check fails.
5.  **`@bindable() userRole: string = '';` and `@bindable() requiredRole: string = '';`**: These are `@bindable` properties.  They define inputs to your template controller that you can bind to from your HTML. In this case, `userRole` will be bound to the current user's role, and `requiredRole` will be set to the role required to view the content.
6.  **`deniedDefinition`**: This `static` property holds a `CustomElementDefinition`. It defines a simple, anonymous custom element named `denied-message` that is used to render the "Access Denied" message.  Defining it directly within the template controller encapsulates this specific view logic.
7.  **Constructor**:
    *   `this.mainView = this.viewFactory.create().setLocation(this.renderLocation);`: This line creates the `mainView`. `this.viewFactory.create()` gets a new view instance from the `IViewFactory`. `.setLocation(this.renderLocation)` tells Aurelia where in the DOM this `mainView` should be rendered – at the `IRenderLocation` associated with the element using the `permission` template controller.
    *   The code then creates a `ViewFactory` specifically for the `deniedDefinition` using `new ViewFactory(this.container, PermissionTemplateController.deniedDefinition)`. This specialized factory is then used to create the `deniedView`, and its location is also set to `this.renderLocation`.
8.  **Lifecycle Hooks: `attaching()` and `detaching()`**:
    *   `attaching()`: This lifecycle method is called by Aurelia when the template controller is being attached to the DOM. Inside, `this.updateViews()` is called to determine and render the correct view based on initial property values.
    *   `detaching()`: This lifecycle method is called when the template controller is being detached from the DOM. It's crucial for cleanup. Here, it deactivates both `mainView` and `deniedView` using `.deactivate()`. Deactivating views ensures that resources are released and lifecycle methods of any child view resources are correctly invoked.
9.  **`userRoleChanged()` and `requiredRoleChanged()`**: These are property change handler methods. Aurelia automatically calls these methods whenever the value of the `@bindable` properties `userRole` or `requiredRole` changes. Each method calls `this.updateViews()` to re-evaluate the permission and update the view accordingly.
10. **`updateViews()`**: This private method contains the core logic of the template controller:
    *   `if (!this.$controller.isActive) { return; }`: This is a safety check. It ensures that `updateViews` only proceeds if the template controller is currently active in the view.
    *   `if (this.userRole === this.requiredRole)`: This is the permission check. It compares the `userRole` and `requiredRole`.
        *   If the roles match (permission granted):  `this.deniedView.deactivate(...)` is called to hide the "Access Denied" message, and `this.mainView.activate(...)` is called to display the original content. `activate()` and `deactivate()` are methods on `ISyntheticView` that control the view's lifecycle (attaching/detaching from DOM, invoking lifecycle hooks).
        *   If the roles do not match (permission denied): `this.mainView.deactivate(...)` hides the original content, and `this.deniedView.activate(...)` shows the "Access Denied" message.

### Using the Template Controller in HTML

Once you have created the `PermissionTemplateController`, you can use it in your HTML templates.  Because we used the convention or the decorator `@templateController('permission')`, we use `permission` as the attribute name in our HTML:

```html
<div permission="user-role.bind: user.role; required-role.bind: 'admin'">
  <h2>VIP Area</h2>
  <p>Welcome to the VIP area. You must be an admin to see this.</p>
</div>

<div permission="user-role.bind: user.role; required-role.bind: 'editor'">
  <h3>Editor Section</h3>
  <p>This section is for editors only.</p>
</div>

<div>
  <p>This content is always visible.</p>
</div>
```

In this example:

*   `permission="user-role.bind: user.role; required-role.bind: 'admin'"`:  This is how you apply the `permission` template controller to a `div` element.
    *   `user-role.bind: user.role`: This binds the `userRole` bindable property of the `PermissionTemplateController` to the `role` property of the `user` object in your view model.  Whenever `user.role` changes in your view model, the `userRoleChanged()` method in the template controller will be automatically invoked.
    *   `required-role.bind: 'admin'`: This binds the `requiredRole` bindable property to the string literal `'admin'`. The template controller will use `'admin'` as the role required to view this section. Changes to `'admin'` (which is a constant here) won't trigger updates, but if you bound this to a view model property, changes would trigger `requiredRoleChanged()`.

When Aurelia processes this HTML:

1.  It encounters the `permission` attribute on the `div` element. Aurelia recognizes `permission` as a registered template controller.
2.  Aurelia creates an instance of `PermissionTemplateController` and associates it with this `div`.
3.  The `attaching()` lifecycle hook of `PermissionTemplateController` is called. Inside `attaching()`, `this.updateViews()` is initially invoked.
4.  `updateViews()` checks the bound values of `user.role` (from your view model) and the `required-role: 'admin'`.
5.  Based on the comparison, `updateViews()` will either:
    *   Activate the `mainView`, rendering the `<h2>VIP Area</h2>` and `<p>Welcome to the VIP area...</p>` content within the `div`, and deactivate the `deniedView`.
    *   Or, deactivate the `mainView` and activate the `deniedView`, rendering the "Access Denied" message instead of the original content.
6.  The last `div` in the example, which does not have the `permission` attribute, is rendered normally without any template controller logic applied.

## Use Cases for Template Controllers

Template controllers are highly versatile and can be used to implement various templating behaviors, including:

*   **Conditional Rendering**:  The built-in `if.bind` and `else.bind` template controllers are prime examples of conditional rendering. You can create custom template controllers for more complex conditional logic, like the `permission` example we just built.
*   **List Rendering/Repeating**:  The `repeat.for` template controller is used for efficiently rendering lists of items. You could create custom template controllers for specialized list rendering scenarios, such as virtual scrolling or infinite scrolling.
*   **Contextual Scoping**:  Template controllers like `with.bind` can create new binding scopes, useful for working with nested data structures or isolating parts of your template. You could build template controllers to manage specific data contexts or apply transformations to the scope.
*   **Lazy Loading**:  A template controller could be created to lazily load and render content only when it becomes visible in the viewport, improving initial load times and performance for content-heavy pages.
*   **Custom Templating Logic**:  Any scenario where you need to programmatically control the rendering of a template based on custom logic is a good candidate for a template controller. This could involve complex data transformations, dynamic template selection, or integration with external services.

## Benefits of Template Controllers

*   **Reusability**: Template controllers encapsulate templating logic into reusable components. Once created, you can apply a template controller across your application to enforce consistent behavior in templates.
*   **Encapsulation**: They keep templating logic contained within a dedicated class, separating it from your view model and making your templates cleaner and more declarative.
*   **Improved Template Readability**:  By abstracting complex templating logic into template controllers, your HTML templates become more concise and easier to understand.
*   **Enhanced Expressiveness**: Template controllers extend the expressiveness of Aurelia's templating system, allowing you to create custom templating constructs tailored to your application's needs.

## Template Controllers vs. Custom Attributes and Custom Elements

While template controllers, custom attributes, and custom elements are all view resources in Aurelia, they serve distinct purposes:

*   **Template Controllers**: Control the rendering of a template. They don't add new HTML elements or modify element attributes directly. Their primary focus is managing whether and how template content is rendered and its lifecycle.
*   **Custom Attributes**: Primarily modify the behavior or appearance of *existing* HTML elements. They are applied as attributes and typically interact with element properties, attributes, or styles. They do not control the rendering of the element's *content* in the way template controllers do.
*   **Custom Elements**: Define completely *new* HTML elements, encapsulating both template structure and behavior. They are used to create reusable UI components with their own encapsulated logic and markup.

Template controllers are specifically designed for manipulating the *template rendering process* itself, making them the ideal choice when you need to create reusable templating patterns and implement conditional or dynamic content display logic.
