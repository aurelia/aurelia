---
description: >-
  Learn how you can dynamically synthesize views from templates generated on
  runtime.
---

# Synthetic Views

Synthetic views in Aurelia 2 are a powerful feature that allows developers to create and manage views programmatically at runtime. Unlike traditional views in HTML templates, synthetic views offer complete control over view creation, binding, and lifecycle management.

## When to Use Synthetic Views

Synthetic views are particularly useful when:
- Rendering server-generated HTML with Aurelia bindings
- Dynamically creating templates based on runtime data
- Integrating with CMS or third-party content that needs Aurelia binding capabilities
- Creating complex, programmatically-generated UIs

## Basic Concepts

A synthetic view in Aurelia 2 consists of several key components:

1. **Template Creation**: A programmatically created template element containing your dynamic HTML
2. **Render Location**: A marker in the DOM where Aurelia will render your view
3. **View Factory**: Creates view instances from your template
4. **Scope**: Provides the binding context for your view
5. **View Instance**: The actual view that gets rendered and managed

## Prerequisites

Before working with synthetic views, you should be familiar with:

- Basic Aurelia 2 concepts and templating
- JavaScript DOM APIs (particularly `createElement` and `appendChild`)
- Aurelia's dependency injection system
- Basic understanding of scopes and binding contexts

## Getting Started

Here's a basic example of creating a synthetic view:

```typescript
import { 
    convertToRenderLocation, 
    CustomElementDefinition, 
    ICustomElementController, 
    ISyntheticView 
} from '@aurelia/runtime-html';
import { Scope } from '@aurelia/runtime';
import { 
    customElement, 
    IContainer, 
    ViewFactory,
    IPlatform, 
    resolve 
} from "aurelia";

@customElement({
    name: 'synthetic-example',
    template: '<div ref="container"></div>'
})
export class SyntheticExample {
    private container: HTMLElement;
    private view: ISyntheticView;
    private readonly platform = resolve(IPlatform);
    private readonly diContainer = resolve(IContainer);

    $controller!: ICustomElementController<this>;

    async attached() {
        // 1. Create template
        const template = this.platform.document.createElement('template');
        template.innerHTML = `
            <div>
                <h1>\${title}</h1>
                <button click.trigger="handleClick()">Click Me</button>
            </div>
        `;

        // 2. Add to DOM and create render location
        this.container.appendChild(template);
        const renderLocation = convertToRenderLocation(template);

        // 3. Create view factory
        const factory = new ViewFactory(
            this.diContainer,
            CustomElementDefinition.create({
                name: 'dynamic-view',
                template
            })
        );

        // 4. Create view instance
        this.view = factory.create(this.$controller)
            .setLocation(renderLocation);

        // 5. Create scope and activate view
        const viewModel = {
            title: 'Dynamic View',
            handleClick: () => console.log('Clicked!')
        };

        await this.view.activate(
            this.view,
            this.$controller,
            Scope.create(viewModel)
        );
    }

    async detaching() {
        if (this.view) {
            await this.view.deactivate(this.view, this.$controller);
        }
    }
}
```

This code demonstrates the basic pattern for creating and managing synthetic views in Aurelia 2. Each step is essential:

1. **Template Creation**: Create a template element with your dynamic content
2. **DOM Integration**: Add the template to the DOM and create a render location
3. **Factory Creation**: Create a view factory from your template
4. **View Creation**: Create a view instance and set its location
5. **Activation**: Activate the view with a scope containing your view model
6. **Cleanup**: Properly deactivate the view when done

## Working with Scopes and Bindings

Understanding how to handle scopes and bindings properly is crucial when creating synthetic views. The scope provides the context for all bindings within your dynamic template.

### Basic Scope Handling

Here's how to create and use scopes effectively:

```typescript
@customElement({
    name: 'scope-example',
    template: '<div ref="container"></div>'
})
export class ScopeExample {
    private container: HTMLElement;
    private view: ISyntheticView;
    private readonly platform = resolve(IPlatform);
    private readonly diContainer = resolve(IContainer);

    $controller!: ICustomElementController<this>;

    async attached() {
        const template = this.platform.document.createElement('template');
        template.innerHTML = `
            <div>
                <!-- Basic property binding -->
                <h1>\${title}</h1>
                
                <!-- Event binding -->
                <button click.trigger="handleClick()">Click Me</button>
                
                <!-- Two-way binding -->
                <input value.bind="inputValue">
                <p>You typed: \${inputValue}</p>
                
                <!-- Repeater binding -->
                <ul>
                    <li repeat.for="item of items">\${item.name}</li>
                </ul>
            </div>
        `;

        this.container.appendChild(template);
        const renderLocation = convertToRenderLocation(template);

        const factory = new ViewFactory(
            this.diContainer,
            CustomElementDefinition.create({
                name: 'scope-example-view',
                template
            })
        );

        this.view = factory.create(this.$controller)
            .setLocation(renderLocation);

        // Create view model with reactive properties
        const viewModel = {
            title: 'Dynamic View with Bindings',
            inputValue: '',
            items: [
                { name: 'Item 1' },
                { name: 'Item 2' }
            ],
            handleClick: () => {
                console.log('Current input:', viewModel.inputValue);
            }
        };

        await this.view.activate(
            this.view,
            this.$controller,
            Scope.create(viewModel)
        );
    }
}
```

### Working with Parent Scopes

Sometimes, you need to access the parent component's scope in your synthetic view. Here's how to do that:

```typescript
@customElement({
    name: 'parent-scope-example',
    template: '<div ref="container"></div>'
})
export class ParentScopeExample {
    // Parent component property
    message = 'Hello from parent';

    private container: HTMLElement;
    private view: ISyntheticView;
    private readonly platform = resolve(IPlatform);
    private readonly diContainer = resolve(IContainer);

    $controller!: ICustomElementController<this>;

    async attached() {
        const template = this.platform.document.createElement('template');
        template.innerHTML = `
            <div>
                <!-- Access parent scope -->
                <h2>\${parentMessage}</h2>
                
                <!-- Access local scope -->
                <p>\${localMessage}</p>
                
                <button click.trigger="handleClick()">
                    Update Messages
                </button>
            </div>
        `;

        this.container.appendChild(template);
        const renderLocation = convertToRenderLocation(template);

        const factory = new ViewFactory(
            this.diContainer,
            CustomElementDefinition.create({
                name: 'parent-scope-view',
                template
            })
        );

        this.view = factory.create(this.$controller)
            .setLocation(renderLocation);

        // Create child scope with parent scope access
        const childScope = Scope.create(
            {
                localMessage: 'Hello from child',
                handleClick: () => {
                    // Can access both scopes
                    childScope.localMessage = 'Updated child message';
                    this.message = 'Updated parent message';
                }
            },
            this.$controller.scope // Parent scope
        );

        await this.view.activate(
            this.view,
            this.$controller,
            childScope
        );
    }
}
```

### Handling Dynamic Updates

When your view model data changes, the bindings will automatically update. However, if you need to rebuild the view completely, you'll need to handle that manually:

```typescript
@customElement({
    name: 'dynamic-update-example',
    template: '<div ref="container"></div>'
})
export class DynamicUpdateExample {
    private container: HTMLElement;
    private view: ISyntheticView;
    private readonly platform = resolve(IPlatform);
    private readonly diContainer = resolve(IContainer);

    $controller!: ICustomElementController<this>;

    async updateView(newData: any) {
        // Deactivate existing view if it exists
        if (this.view) {
            await this.view.deactivate(this.view, this.$controller);
            this.container.innerHTML = ''; // Clear container
        }

        // Create new view with updated data
        const template = this.platform.document.createElement('template');
        template.innerHTML = `
            <div>
                <h2>\${title}</h2>
                <div repeat.for="item of items">
                    \${item.name}
                </div>
            </div>
        `;

        this.container.appendChild(template);
        const renderLocation = convertToRenderLocation(template);

        const factory = new ViewFactory(
            this.diContainer,
            CustomElementDefinition.create({
                name: 'dynamic-update-view',
                template
            })
        );

        this.view = factory.create(this.$controller)
            .setLocation(renderLocation);

        await this.view.activate(
            this.view,
            this.$controller,
            Scope.create(newData)
        );
    }
}
```

### Best Practices for Scope Management

1. **Cleanup**: Always deactivate views when they're no longer needed
2. **Scope Isolation**: Create isolated scopes when you don't need parent scope access
3. **Parent Scope Access**: Use parent scopes judiciously to avoid tight coupling
4. **Memory Management**: Clear references to views and scopes when disposing
5. **Error Handling**: Wrap view creation and activation in try-catch blocks

```typescript
async createView(data: any) {
    try {
        // ... view creation code ...
        
        await this.view.activate(
            this.view,
            this.$controller,
            Scope.create(data)
        );
    } catch (error) {
        console.error('Failed to create view:', error);
        // Handle error appropriately
    }
}

async detaching() {
    try {
        if (this.view) {
            await this.view.deactivate(this.view, this.$controller);
            this.view = null;
        }
    } catch (error) {
        console.error('Failed to cleanup view:', error);
    }
}
```

## Real-World Examples

### 1. Server-Rendered Content with Aurelia Bindings

This example shows how to take HTML content from a server (like a CMS) and make it interactive with Aurelia bindings:

```typescript
@customElement({
    name: 'cms-content',
    template: '<div ref="container"></div>'
})
export class CmsContent {
    private container: HTMLElement;
    private view: ISyntheticView;
    private readonly platform = resolve(IPlatform);
    private readonly diContainer = resolve(IContainer);

    $controller!: ICustomElementController<this>;

    async attached() {
        try {
            // Fetch content from CMS/server
            const response = await fetch('/api/content/page-123');
            const html = await response.text();
            
            await this.renderContent(html);
        } catch (error) {
            console.error('Failed to load content:', error);
        }
    }

    private async renderContent(html: string) {
        const template = this.platform.document.createElement('template');
        
        // Server returns HTML with Aurelia binding expressions
        // Example: <button click.trigger="handleAction('${id}')">...</button>
        template.innerHTML = html;

        this.container.appendChild(template);
        const renderLocation = convertToRenderLocation(template);

        const factory = new ViewFactory(
            this.diContainer,
            CustomElementDefinition.create({
                name: 'cms-content-view',
                template
            })
        );

        this.view = factory.create(this.$controller)
            .setLocation(renderLocation);

        // Create view model with methods that the server-rendered content can bind to
        const viewModel = {
            handleAction: (id: string) => {
                console.log('Action triggered:', id);
            },
            submitForm: async (formData: any) => {
                const response = await fetch('/api/submit', {
                    method: 'POST',
                    body: JSON.stringify(formData)
                });
                return response.json();
            }
        };

        await this.view.activate(
            this.view,
            this.$controller,
            Scope.create(viewModel)
        );
    }

    async detaching() {
        if (this.view) {
            await this.view.deactivate(this.view, this.$controller);
        }
    }
}
```

### 2. Dynamic Form Builder with Validation

This example creates forms dynamically based on a schema, with validation:

```typescript
interface FormField {
    type: 'text' | 'number' | 'select' | 'date';
    name: string;
    label: string;
    required?: boolean;
    options?: { value: string; label: string; }[];
    validation?: {
        pattern?: string;
        min?: number;
        max?: number;
        message?: string;
    };
}

@customElement({
    name: 'dynamic-form',
    template: '<div ref="container"></div>'
})
export class DynamicForm {
    private container: HTMLElement;
    private view: ISyntheticView;
    private readonly platform = resolve(IPlatform);
    private readonly diContainer = resolve(IContainer);

    @bindable() schema: FormField[] = [];
    @bindable() onSubmit: (data: any) => Promise<void>;

    $controller!: ICustomElementController<this>;

    async schemaChanged() {
        await this.renderForm();
    }

    private generateFieldHtml(field: FormField): string {
        const validationAttrs = field.validation ? `
            pattern="${field.validation.pattern || ''}"
            min="${field.validation.min || ''}"
            max="${field.validation.max || ''}"
        ` : '';

        switch (field.type) {
            case 'select':
                return `
                    <div class="form-group">
                        <label for="${field.name}">${field.label}</label>
                        <select 
                            class="form-control \${errors.${field.name} ? 'is-invalid' : ''}"
                            id="${field.name}"
                            value.bind="formData.${field.name}"
                            required.bind="${field.required}"
                        >
                            <option value="">Select...</option>
                            ${field.options?.map(opt => 
                                `<option value="${opt.value}">${opt.label}</option>`
                            ).join('')}
                        </select>
                        <div class="invalid-feedback">
                            \${errors.${field.name}}
                        </div>
                    </div>
                `;
            
            default:
                return `
                    <div class="form-group">
                        <label for="${field.name}">${field.label}</label>
                        <input 
                            type="${field.type}"
                            class="form-control \${errors.${field.name} ? 'is-invalid' : ''}"
                            id="${field.name}"
                            value.bind="formData.${field.name}"
                            required.bind="${field.required}"
                            ${validationAttrs}
                        >
                        <div class="invalid-feedback">
                            \${errors.${field.name}}
                        </div>
                    </div>
                `;
        }
    }

    private async renderForm() {
        if (this.view) {
            await this.view.deactivate(this.view, this.$controller);
            this.container.innerHTML = '';
        }

        const template = this.platform.document.createElement('template');
        template.innerHTML = `
            <form submit.trigger="submitForm($event)">
                ${this.schema.map(field => 
                    this.generateFieldHtml(field)
                ).join('')}
                <button type="submit" class="btn btn-primary">
                    Submit
                </button>
            </form>
        `;

        this.container.appendChild(template);
        const renderLocation = convertToRenderLocation(template);

        const factory = new ViewFactory(
            this.diContainer,
            CustomElementDefinition.create({
                name: 'dynamic-form-view',
                template
            })
        );

        this.view = factory.create(this.$controller)
            .setLocation(renderLocation);

        const viewModel = {
            formData: {},
            errors: {},
            validateField: (name: string, value: any) => {
                const field = this.schema.find(f => f.name === name);
                if (!field) return;

                if (field.required && !value) {
                    viewModel.errors[name] = 'This field is required';
                    return false;
                }

                if (field.validation) {
                    // Add validation logic here
                    // Return false if validation fails
                }

                delete viewModel.errors[name];
                return true;
            },
            submitForm: async (event: Event) => {
                event.preventDefault();
                
                // Validate all fields
                let isValid = true;
                for (const field of this.schema) {
                    const valid = viewModel.validateField(
                        field.name, 
                        viewModel.formData[field.name]
                    );
                    if (!valid) isValid = false;
                }

                if (!isValid) return;

                if (this.onSubmit) {
                    await this.onSubmit(viewModel.formData);
                }
            }
        };

        await this.view.activate(
            this.view,
            this.$controller,
            Scope.create(viewModel)
        );
    }
}
```

Usage:
```typescript
@customElement({
    template: `
        <dynamic-form 
            schema.bind="formSchema"
            on-submit.call="handleSubmit($event)">
        </dynamic-form>
    `
})
export class FormPage {
    formSchema: FormField[] = [
        {
            type: 'text',
            name: 'username',
            label: 'Username',
            required: true,
            validation: {
                pattern: '^[a-zA-Z0-9]{3,}$',
                message: 'Username must be at least 3 characters'
            }
        },
        {
            type: 'select',
            name: 'role',
            label: 'Role',
            required: true,
            options: [
                { value: 'user', label: 'User' },
                { value: 'admin', label: 'Admin' }
            ]
        }
    ];

    async handleSubmit(formData: any) {
        try {
            await fetch('/api/users', {
                method: 'POST',
                body: JSON.stringify(formData)
            });
        } catch (error) {
            console.error('Submit failed:', error);
        }
    }
}
```

## Advanced Topics and Patterns

### 1. Dynamic Component Loading with Lazy Loading

This example shows how to load and render components based on server configuration dynamically:

```typescript
interface ComponentConfig {
    type: string;
    props: Record<string, any>;
    template: string;
    scriptUrl?: string;
}

@customElement({
    name: 'component-loader',
    template: '<div ref="container"></div>'
})
export class ComponentLoader {
    private container: HTMLElement;
    private view: ISyntheticView;
    private readonly platform = resolve(IPlatform);
    private readonly diContainer = resolve(IContainer);

    $controller!: ICustomElementController<this>;

    async loadComponent(config: ComponentConfig) {
        try {
            // Load external script if needed
            if (config.scriptUrl) {
                await this.loadScript(config.scriptUrl);
            }

            await this.renderComponent(config);
        } catch (error) {
            console.error('Failed to load component:', error);
        }
    }

    private async loadScript(url: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error(`Failed to load script: ${url}`));
            document.head.appendChild(script);
        });
    }

    private async renderComponent(config: ComponentConfig) {
        if (this.view) {
            await this.view.deactivate(this.view, this.$controller);
            this.container.innerHTML = '';
        }

        const template = this.platform.document.createElement('template');
        template.innerHTML = config.template;

        this.container.appendChild(template);
        const renderLocation = convertToRenderLocation(template);

        const factory = new ViewFactory(
            this.diContainer,
            CustomElementDefinition.create({
                name: `dynamic-component-${Date.now()}`,
                template
            })
        );

        this.view = factory.create(this.$controller)
            .setLocation(renderLocation);

        await this.view.activate(
            this.view,
            this.$controller,
            Scope.create(config.props)
        );
    }
}
```

### 2. Interactive Dashboard Builder

This example demonstrates building a dashboard with draggable widgets:

```typescript
interface DashboardWidget {
    id: string;
    type: 'chart' | 'table' | 'metrics';
    position: { x: number; y: number };
    size: { width: number; height: number };
    config: Record<string, any>;
}

@customElement({
    name: 'dashboard-builder',
    template: '<div ref="container" class="dashboard-container"></div>'
})
export class DashboardBuilder {
    private container: HTMLElement;
    private view: ISyntheticView;
    private readonly platform = resolve(IPlatform);
    private readonly diContainer = resolve(IContainer);

    $controller!: ICustomElementController<this>;
    private widgets: DashboardWidget[] = [];

    private generateWidgetHtml(widget: DashboardWidget): string {
        const style = `
            position: absolute;
            left: ${widget.position.x}px;
            top: ${widget.position.y}px;
            width: ${widget.size.width}px;
            height: ${widget.size.height}px;
        `;

        return `
            <div class="widget" style="${style}"
                 draggable="true"
                 dragstart.trigger="startDrag($event, '${widget.id}')"
                 dragend.trigger="endDrag($event)">
                <div class="widget-header">
                    ${widget.type.toUpperCase()}
                    <button click.trigger="removeWidget('${widget.id}')">×</button>
                </div>
                <div class="widget-content">
                    ${this.generateWidgetContent(widget)}
                </div>
            </div>
        `;
    }

    private generateWidgetContent(widget: DashboardWidget): string {
        switch (widget.type) {
            case 'chart':
                return `
                    <canvas ref="chart-${widget.id}"
                           afterAttach.call="initChart($event, '${widget.id}')">
                    </canvas>
                `;
            case 'table':
                return `
                    <table class="table">
                        <thead>
                            <tr>
                                ${widget.config.columns.map(col => 
                                    `<th>${col.header}</th>`
                                ).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            <tr repeat.for="row of widget.config.data">
                                ${widget.config.columns.map(col => 
                                    `<td>\${row[col.field]}</td>`
                                ).join('')}
                            </tr>
                        </tbody>
                    </table>
                `;
            case 'metrics':
                return `
                    <div class="metrics-grid">
                        ${widget.config.metrics.map(metric => `
                            <div class="metric-card">
                                <div class="metric-value">\${${metric.value}}</div>
                                <div class="metric-label">${metric.label}</div>
                            </div>
                        `).join('')}
                    </div>
                `;
            default:
                return '';
        }
    }

    async attached() {
        await this.renderDashboard();
    }

    private async renderDashboard() {
        const template = this.platform.document.createElement('template');
        template.innerHTML = `
            <div class="dashboard">
                ${this.widgets.map(widget => 
                    this.generateWidgetHtml(widget)
                ).join('')}
                <div class="dashboard-controls">
                    <button click.trigger="addWidget('chart')">Add Chart</button>
                    <button click.trigger="addWidget('table')">Add Table</button>
                    <button click.trigger="addWidget('metrics')">Add Metrics</button>
                    <button click.trigger="saveDashboard()">Save Layout</button>
                </div>
            </div>
        `;

        this.container.appendChild(template);
        const renderLocation = convertToRenderLocation(template);

        const factory = new ViewFactory(
            this.diContainer,
            CustomElementDefinition.create({
                name: 'dashboard-view',
                template
            })
        );

        this.view = factory.create(this.$controller)
            .setLocation(renderLocation);

        const viewModel = {
            widgets: this.widgets,
            startDrag: (event: DragEvent, widgetId: string) => {
                event.dataTransfer.setData('widgetId', widgetId);
            },
            endDrag: (event: DragEvent) => {
                const widgetId = event.dataTransfer.getData('widgetId');
                const widget = this.widgets.find(w => w.id === widgetId);
                if (widget) {
                    widget.position = {
                        x: event.clientX - this.container.offsetLeft,
                        y: event.clientY - this.container.offsetTop
                    };
                    this.renderDashboard();
                }
            },
            addWidget: async (type: DashboardWidget['type']) => {
                const widget: DashboardWidget = {
                    id: `widget-${Date.now()}`,
                    type,
                    position: { x: 0, y: 0 },
                    size: { width: 300, height: 200 },
                    config: await this.getDefaultConfig(type)
                };
                this.widgets.push(widget);
                await this.renderDashboard();
            },
            removeWidget: async (widgetId: string) => {
                this.widgets = this.widgets.filter(w => w.id !== widgetId);
                await this.renderDashboard();
            },
            initChart: (element: HTMLCanvasElement, widgetId: string) => {
                const widget = this.widgets.find(w => w.id === widgetId);
                if (widget && widget.type === 'chart') {
                    // Initialize chart using your preferred library
                    // Example with Chart.js:
                    new Chart(element, widget.config.chartConfig);
                }
            },
            saveDashboard: async () => {
                try {
                    await fetch('/api/dashboard', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(this.widgets)
                    });
                } catch (error) {
                    console.error('Failed to save dashboard:', error);
                }
            }
        };

        await this.view.activate(
            this.view,
            this.$controller,
            Scope.create(viewModel)
        );
    }

    private async getDefaultConfig(type: DashboardWidget['type']) {
        // Return default configuration based on widget type
        switch (type) {
            case 'chart':
                return {
                    chartConfig: {
                        // Default chart configuration
                    }
                };
            case 'table':
                return {
                    columns: [
                        { field: 'id', header: 'ID' },
                        { field: 'name', header: 'Name' }
                    ],
                    data: []
                };
            case 'metrics':
                return {
                    metrics: [
                        { label: 'Total', value: 0 },
                        { label: 'Average', value: 0 }
                    ]
                };
        }
    }
}
```
