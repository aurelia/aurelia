# Extending the Template Compiler

The Aurelia template compiler is highly extensible, providing multiple hooks and extension points for advanced customization. This guide covers the advanced features and extension mechanisms available for developers who need to extend template compilation behavior.

## Template Compiler Hooks

### Registering Compilation Hooks

Template compiler hooks allow you to modify templates during the compilation process:

```typescript
import { templateCompilerHooks, ITemplateCompilerHooks } from 'aurelia';

@templateCompilerHooks
class MyCompilerHook implements ITemplateCompilerHooks {
  compiling(template: HTMLElement): void {
    // Modify template before compilation
    this.addDefaultAttributes(template);
    this.injectDevelopmentHelpers(template);
  }

  private addDefaultAttributes(template: HTMLElement): void {
    // Add default attributes to form elements
    template.querySelectorAll('input[type="text"]').forEach(input => {
      if (!input.hasAttribute('autocomplete')) {
        input.setAttribute('autocomplete', 'off');
      }
    });
  }

  private injectDevelopmentHelpers(template: HTMLElement): void {
    if (__DEV__) {
      // Add development-only attributes
      template.querySelectorAll('[data-dev-hint]').forEach(el => {
        el.setAttribute('title', el.getAttribute('data-dev-hint')!);
      });
    }
  }
}
```

### Global vs Component-Level Hooks

Hooks can be registered globally or at the component level:

```typescript
// Global hook registration
container.register(MyCompilerHook);

// Component-level hook
@customElement({
  name: 'my-component',
  template: '<div>...</div>',
  hooks: [MyCompilerHook]
})
export class MyComponent { }
```

## Advanced Attribute Pattern System

### Creating Custom Attribute Syntax

The attribute pattern system allows you to create custom binding syntax:

```typescript
import { attributePattern, AttrSyntax } from 'aurelia';

@attributePattern({ pattern: 'PART.vue:PART', symbols: '.:' })
class VueStyleAttributePattern {
  'PART.vue:PART'(rawName: string, rawValue: string, parts: string[]): AttrSyntax {
    const [target, event] = parts;
    return new AttrSyntax(rawName, rawValue, target, 'trigger', [event]);
  }
}

// Usage: <button click.vue:prevent="handleClick()">
```

### Complex Pattern Matching

Support for multi-part patterns with custom symbols:

```typescript
@attributePattern({ pattern: 'PART.PART.PART', symbols: '.' })
class NestedPropertyPattern {
  'PART.PART.PART'(rawName: string, rawValue: string, parts: string[]): AttrSyntax {
    const [obj, prop, command] = parts;
    return new AttrSyntax(rawName, rawValue, `${obj}.${prop}`, command, parts);
  }
}

// Usage: <input user.profile.bind="userProfile">
```

## Custom Binding Commands

### Advanced Binding Command Features

Binding commands can take full control of attribute processing:

```typescript
import { bindingCommand, BindingCommandInstance, IInstruction } from 'aurelia';

@bindingCommand('throttle')
class ThrottleBindingCommand implements BindingCommandInstance {
  ignoreAttr = true; // Take full control of attribute processing

  build(info: ICommandBuildInfo, parser: IExpressionParser): IInstruction {
    const [delay = '250', event = 'input'] = info.attr.rawValue.split(':');
    
    return new ThrottleInstruction(
      parser.parse(info.attr.rawValue),
      parseInt(delay, 10),
      event
    );
  }
}

// Usage: <input value.throttle="500:input">
```

### Multi-Attribute Processing

Commands can process multiple attributes for complex scenarios:

```typescript
@bindingCommand('form')
class FormBindingCommand implements BindingCommandInstance {
  build(info: ICommandBuildInfo, parser: IExpressionParser): IInstruction {
    const formAttributes = this.collectFormAttributes(info.attr.syntax.target);
    
    return new FormInstruction(
      parser.parse(info.attr.rawValue),
      formAttributes
    );
  }

  private collectFormAttributes(element: Element): Record<string, string> {
    const attrs: Record<string, string> = {};
    for (const attr of element.attributes) {
      if (attr.name.startsWith('form-')) {
        attrs[attr.name.substring(5)] = attr.value;
      }
    }
    return attrs;
  }
}
```

## Template Element Factory Customization

### Custom Template Caching

The template element factory supports custom caching strategies:

```typescript
import { ITemplateElementFactory, IMarkupCache } from 'aurelia';

class CustomTemplateElementFactory implements ITemplateElementFactory {
  private customCache = new Map<string, HTMLTemplateElement>();

  createTemplate(markup: string): HTMLTemplateElement {
    // Custom caching logic
    const cacheKey = this.generateCacheKey(markup);
    
    if (this.customCache.has(cacheKey)) {
      return this.customCache.get(cacheKey)!.cloneNode(true) as HTMLTemplateElement;
    }

    const template = this.createTemplateElement(markup);
    this.customCache.set(cacheKey, template);
    return template;
  }

  private generateCacheKey(markup: string): string {
    // Custom cache key generation
    return `${markup.length}-${this.hashCode(markup)}`;
  }
}
```

### Template Wrapping Detection

Customize how templates are wrapped for proper compilation:

```typescript
class SmartTemplateFactory implements ITemplateElementFactory {
  createTemplate(markup: string): HTMLTemplateElement {
    const wrapped = this.intelligentWrap(markup);
    return this.createTemplateElement(wrapped);
  }

  private intelligentWrap(markup: string): string {
    // Custom wrapping logic based on content
    if (markup.includes('<tr>')) {
      return `<table><tbody>${markup}</tbody></table>`;
    }
    if (markup.includes('<option>')) {
      return `<select>${markup}</select>`;
    }
    return markup;
  }
}
```

## Advanced Resource Resolution

### Custom Resource Discovery

Implement custom resource resolution for dynamic components:

```typescript
import { IResourceResolver, IResourceDescriptions } from 'aurelia';

class DynamicResourceResolver implements IResourceResolver {
  resolve(name: string, context: IContainer): IResourceDescriptions | null {
    // Check if this is a dynamic component request
    if (name.startsWith('dynamic-')) {
      return this.resolveDynamicComponent(name, context);
    }
    
    return null; // Let default resolver handle it
  }

  private resolveDynamicComponent(name: string, context: IContainer): IResourceDescriptions {
    const componentType = this.loadDynamicComponent(name);
    return {
      [name]: {
        type: componentType,
        keyFrom: name,
        definition: componentType.definition
      }
    };
  }
}
```

### Bindables Information Caching

Optimize bindable resolution with custom caching:

```typescript
class OptimizedResourceResolver implements IResourceResolver {
  private bindablesCache = new Map<Function, Record<string, BindableDefinition>>();

  getBindables(Type: Function): Record<string, BindableDefinition> {
    if (this.bindablesCache.has(Type)) {
      return this.bindablesCache.get(Type)!;
    }

    const bindables = this.computeBindables(Type);
    this.bindablesCache.set(Type, bindables);
    return bindables;
  }
}
```

## Local Template System

### Advanced Local Element Definitions

Create complex local element hierarchies:

```typescript
@customElement({
  name: 'dashboard',
  template: `
    <template as-custom-element="widget">
      <bindable property="title"></bindable>
      <bindable property="data"></bindable>
      <div class="widget">
        <h3>\${title}</h3>
        <div class="content" innerhtml.bind="data"></div>
      </div>
    </template>
    
    <template as-custom-element="chart-widget">
      <bindable property="chart-data"></bindable>
      <widget title="Chart" data.bind="renderChart(chartData)"></widget>
    </template>
    
    <div class="dashboard">
      <chart-widget chart-data.bind="metrics"></chart-widget>
    </div>
  `
})
export class Dashboard {
  renderChart(data: any): string {
    return `<canvas data-chart="${JSON.stringify(data)}"></canvas>`;
  }
}
```

### Dynamic Local Template Creation

Create local templates programmatically:

```typescript
@customElement({
  name: 'dynamic-layout',
  template: `<div ref="container"></div>`
})
export class DynamicLayout {
  @ViewSlot() container!: ViewSlot;

  attached(): void {
    this.createLocalTemplate();
  }

  private createLocalTemplate(): void {
    const template = `
      <template as-custom-element="dynamic-item">
        <bindable property="item"></bindable>
        <div class="item">\${item.name}</div>
      </template>
    `;
    
    this.container.add(this.viewFactory.create(template));
  }
}
```

## Compilation Context System

### Hierarchical Resource Resolution

Work with compilation contexts for advanced scenarios:

```typescript
class CustomCompiler {
  compileWithContext(template: string, parentContext?: ICompilationContext): ICompiledTemplate {
    const context = this.createCompilationContext(parentContext);
    
    // Add custom resources to context
    context.addResource('custom-element', MyCustomElement);
    context.addResource('value-converter', MyConverter);
    
    return this.compile(template, context);
  }

  private createCompilationContext(parent?: ICompilationContext): ICompilationContext {
    const context = new CompilationContext(parent);
    
    // Configure context for specific compilation needs
    context.resolveResources = true;
    context.debug = __DEV__;
    
    return context;
  }
}
```

### Custom Dependency Injection

Customize DI container behavior during compilation:

```typescript
class ScopedCompiler {
  compileWithScope(template: string, scope: Record<string, any>): ICompiledTemplate {
    const container = this.createScopedContainer(scope);
    const context = new CompilationContext(container);
    
    return this.compile(template, context);
  }

  private createScopedContainer(scope: Record<string, any>): IContainer {
    const container = DI.createContainer();
    
    // Register scope variables as services
    Object.entries(scope).forEach(([key, value]) => {
      container.register(Registration.instance(key, value));
    });
    
    return container;
  }
}
```

## Performance Optimization

### Template Compilation Caching

Implement aggressive template caching for performance:

```typescript
class CachedTemplateCompiler {
  private compilationCache = new Map<string, ICompiledTemplate>();
  private templateHashCache = new Map<string, string>();

  compile(template: string, context: ICompilationContext): ICompiledTemplate {
    const hash = this.getTemplateHash(template, context);
    
    if (this.compilationCache.has(hash)) {
      return this.compilationCache.get(hash)!;
    }

    const compiled = this.performCompilation(template, context);
    this.compilationCache.set(hash, compiled);
    return compiled;
  }

  private getTemplateHash(template: string, context: ICompilationContext): string {
    const contextHash = this.getContextHash(context);
    return `${template.length}-${contextHash}`;
  }
}
```

### Compilation Mode Optimization

Configure compilation for different environments:

```typescript
interface CompilationOptions {
  resolveResources?: boolean;
  debug?: boolean;
  enhance?: boolean;
  aot?: boolean;
}

class OptimizedCompiler {
  compile(template: string, options: CompilationOptions = {}): ICompiledTemplate {
    const context = this.createOptimizedContext(options);
    
    if (options.aot) {
      return this.compileAOT(template, context);
    }
    
    return this.compileJIT(template, context);
  }

  private createOptimizedContext(options: CompilationOptions): ICompilationContext {
    const context = new CompilationContext();
    
    context.resolveResources = options.resolveResources ?? true;
    context.debug = options.debug ?? __DEV__;
    context.enhance = options.enhance ?? false;
    
    return context;
  }
}
```

## Best Practices

### 1. Hook Registration

- Register global hooks early in application bootstrap
- Use component-level hooks for specific customizations
- Keep hooks lightweight to avoid compilation performance impact

### 2. Pattern and Command Design

- Design patterns to be intuitive and consistent with Aurelia conventions
- Use descriptive names and clear syntax
- Provide good error messages for invalid usage

### 3. Resource Resolution

- Cache expensive resource lookups
- Implement fallback mechanisms for missing resources
- Use lazy loading for dynamic components

### 4. Performance Considerations

- Profile template compilation in development
- Use AOT compilation for production builds
- Implement smart caching strategies
- Monitor memory usage with large template caches

### 5. Testing Extensions

- Create unit tests for custom hooks and commands
- Test compilation output for correctness
- Verify performance impact of extensions
- Test edge cases and error handling

The template compiler's extensibility allows for powerful customizations while maintaining framework performance and consistency. Use these extension points judiciously to enhance your application's template processing capabilities.

