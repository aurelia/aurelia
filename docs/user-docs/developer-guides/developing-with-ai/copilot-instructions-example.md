# GitHub Copilot Instructions Example for Aurelia Projects

This is an example `.github/copilot-instructions.md` file optimized for Aurelia development with GitHub Copilot. Place this file in your repository root.

```markdown
# GitHub Copilot Instructions

## Project Overview

This is an Aurelia 2.x TypeScript application using a monorepo structure with Turbo for build orchestration.

## Architecture

We use Aurelia's dependency injection system from `@aurelia/kernel` with hierarchical containers.

Components follow MVVM pattern with clear separation between view models and templates.

Resources (custom elements, attributes, value converters) are registered via `StandardConfiguration.customize()`.

Templates compile to instruction objects that describe DOM bindings and component instantiation.

## Folder Structure

- `/packages/` - Core Aurelia packages
- `/packages/__tests__/` - Test files requiring build before execution
- `/packages-tooling/` - Development and build tools
- `/src/` - Application source code in typical projects
- `/examples/` - Example applications

## Coding Standards

### TypeScript
We use strict TypeScript with explicit types - avoid `any` type.

Prefer interfaces over type aliases for object shapes.

Use union types and generic constraints appropriately.

Handle undefined and null explicitly with strict null checks.

### Aurelia Conventions
Custom elements use kebab-case naming: `<user-profile>` maps to `UserProfileCustomElement`.

Classes use PascalCase: `UserService`, `MyCustomElement`.

Use `@singleton` decorator for stateless services.

Use `@transient` decorator for stateful services.

Bindable properties should have explicit TypeScript types.

### Component Lifecycle
Implement proper cleanup in `detaching` and `unbinding` lifecycle hooks.

Use lifecycle hooks in order: creating → created → binding → bound → attaching → attached.

Always handle errors in lifecycle methods appropriately.

### Dependency Injection
Use constructor injection with `@resolve()` decorator when needed.

Register services in DI container before use.

Services resolve through `container.get()` or constructor injection.

## Development Workflow

### Building
Always run `npm run build` after making changes to packages before running tests.

Use `npm run rebuild` for clean builds when encountering issues.

Build is required for both package changes and test file modifications.

### Testing
Tests are located in `packages/__tests__` directory.

Use `@aurelia/testing` package for component testing.

Follow AAA pattern: Arrange, Act, Assert.

Run specific tests with `npm run dev -- -t "pattern"` for faster feedback.

### Code Quality
Run `npm run lint` before committing changes.

Prefer positive if statements over negative conditions.

Use early returns to reduce nesting.

Always use curly braces for control structures.

Prefer const over let, never use var.

## Framework-Specific Patterns

### Custom Elements
```typescript
@customElement({
  name: 'user-profile',
  template: '<div>Template content</div>'
})
export class UserProfile {
  @bindable public user?: User;
  
  public binding(): void {
    // Setup logic
  }
  
  public unbinding(): void {
    // Cleanup logic
  }
}
```

### Services
```typescript
import { resolve } from '@aurelia/kernel';
import { IHttpClient } from '@aurelia/fetch-client';

@singleton
export class UserService {
  private readonly http = resolve(IHttpClient);
}
```

### Value Converters
```typescript
@valueConverter('formatDate')
export class DateFormatValueConverter {
  public toView(value: Date, format?: string): string {
    // Conversion logic
  }
}
```

## Logging

Use Aurelia's logger system (ILogger) instead of console.log.

Refer to router package for logging implementation patterns.

## Error Handling

Never expose or log secrets and keys.

Handle binding and lifecycle errors gracefully.

Provide meaningful error messages for development debugging.

## Testing Patterns

Avoid loops in unit tests - write explicit test cases.

Use methods from `@aurelia/testing` package for assertions.

Test both happy path and error scenarios.

Create proper test setups and teardowns for component tests.
```

## Key Features of This Configuration

### 1. **Repository-Wide Context**
This file provides broad guidance that applies to all developers working with GitHub Copilot in the repository.

### 2. **Short, Self-Contained Instructions**
Each instruction is a simple statement that can be applied broadly across different coding scenarios.

### 3. **Framework-Specific Patterns**
Includes concrete examples of Aurelia patterns that Copilot can reference when generating code.

### 4. **Development Workflow Integration**
Covers build requirements and testing patterns specific to the Aurelia monorepo structure.

## Alternative: Multiple Instruction Files

For larger projects, consider using the newer `.github/instructions/` directory with multiple `.instructions.md` files:

### `.github/instructions/components.instructions.md`
```markdown
---
appliesTo:
  - "src/components/**/*.ts"
  - "packages/*/src/**/*element.ts"
---

Generate Aurelia custom elements with proper lifecycle hooks and TypeScript types.

Use kebab-case for element names and PascalCase for classes.

Always include proper cleanup in unbinding lifecycle hook.
```

### `.github/instructions/services.instructions.md`
```markdown
---
appliesTo:
  - "src/services/**/*.ts"
  - "packages/*/src/**/*service.ts"
---

Create services with appropriate DI decorators (@singleton or @transient).

Use constructor injection for dependencies.

Implement proper error handling and logging.
```

## Team Collaboration

Keep this file under version control and treat it as a living document.

Update instructions as team coding practices evolve.

All team members benefit from consistent Copilot behavior through shared instructions.

Reference this file during code reviews to ensure Copilot suggestions align with project standards.