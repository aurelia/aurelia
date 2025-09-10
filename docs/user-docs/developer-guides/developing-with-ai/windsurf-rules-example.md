# Windsurf Rules Example for Aurelia Projects

This document shows how to configure Windsurf AI IDE for optimal Aurelia development using both global and workspace-level rules.

## Global Rules: ~/global_rules.md

Place this file in your home directory for rules that apply to all Windsurf sessions:

```markdown
# Global Windsurf Rules for Aurelia Development

## TypeScript Best Practices
- Always use strict TypeScript - never use `any` type
- Prefer interfaces over type aliases for object shapes
- Use explicit return types for public methods
- Handle undefined/null explicitly with strict null checks

## Code Style Standards
- Use positive if statements instead of negative conditions
- Implement early returns to reduce nesting depth
- Always use curly braces for if/for/switch statements
- Prefer const over let, never use var
- Use arrow functions over function declarations

## Framework Agnostic Patterns
- Follow Single Responsibility Principle
- Implement proper error handling and logging
- Write clear, self-documenting code
- Use meaningful variable and function names
- Avoid deep nesting - extract methods when needed
```

## Workspace Rules: .windsurf/rules/

Create rule files in your project's `.windsurf/rules/` directory:

### `aurelia-framework.md`
```markdown
# Aurelia Framework Rules

## Architecture Context
This is an Aurelia 2.x TypeScript application using dependency injection and MVVM patterns.

Core packages: @aurelia/kernel, @aurelia/runtime, @aurelia/runtime-html, @aurelia/template-compiler.

Components follow lifecycle: creating → created → binding → bound → attaching → attached.

## Component Patterns
- Custom elements use kebab-case names: `<user-profile>`
- Classes use PascalCase: `UserProfileCustomElement`
- Always implement proper cleanup in `detaching`/`unbinding` hooks
- Use `@bindable` properties with explicit TypeScript types

## Dependency Injection
- Use `@singleton` decorator for stateless services
- Use `@transient` decorator for stateful services
- Implement constructor injection with `@resolve()` when needed
- Register services via `StandardConfiguration.customize()`

## Template Binding
- Use `.bind` for two-way binding
- Use `.one-way` for read-only binding
- Use `.to-view` for display-only data
- Handle binding expressions with proper null checking
```

### `build-workflow.md`
```markdown
# Build and Development Workflow

## Critical Requirements
- Always run `npm run build` after making changes to packages
- Build is required before running any tests
- Tests are located in `packages/__tests__/` directory
- Use `npm run rebuild` for clean builds when encountering issues

## Development Commands
- `npm run build` - Build all packages (REQUIRED before testing)
- `npm run test` - Run all tests
- `npm run dev -- -t "pattern"` - Run specific test patterns
- `npm run lint` - ESLint validation
- `npm run typecheck` - TypeScript type checking

## Project Structure
- `/packages/` - Core Aurelia framework packages
- `/packages/__tests__/` - Test files requiring build
- `/packages-tooling/` - Development and build tools
- `/examples/` - Example applications
```

### `testing-patterns.md`
```markdown
# Testing Patterns for Aurelia

## Testing Framework
Use `@aurelia/testing` package for all component and service testing.

## Test Structure
Follow AAA pattern consistently:
- Arrange: Set up test data and dependencies
- Act: Execute the code being tested  
- Assert: Verify expected outcomes

## Best Practices
- Write explicit test cases instead of using loops
- Test both happy path and error scenarios
- Create proper setup and teardown for component tests
- Use meaningful test descriptions that explain the scenario

## Component Testing Example
```typescript
import { CustomElement } from '@aurelia/runtime-html';
import { TestContext, assert } from '@aurelia/testing';

it('should render user name when user is provided', async () => {
  // Arrange
  const ctx = TestContext.create();
  const { component } = ctx.createComponent(UserProfile);
  component.user = { name: 'John Doe' };
  
  // Act
  await ctx.startPromise;
  
  // Assert
  assert.includes(ctx.host.textContent, 'John Doe');
});
```

## Service Testing
Mock dependencies using appropriate testing patterns and verify service behavior.
```

### `code-quality.md`
```markdown
# Code Quality Standards

## TypeScript Standards
- Enable strict mode in tsconfig.json
- Use explicit types for all public interfaces
- Prefer readonly properties when data shouldn't change
- Use union types and generic constraints appropriately

## Aurelia-Specific Quality
- Implement proper error handling in lifecycle hooks
- Use Aurelia's logger system (ILogger) instead of console.log
- Never expose secrets or API keys in configuration
- Follow security best practices for user input handling

## Performance Patterns
- Implement proper cleanup to prevent memory leaks
- Use appropriate observation strategies for data binding
- Consider component lifecycle impact on performance
- Optimize template binding expressions

## Documentation
- Document complex binding expressions and lifecycle logic  
- Include JSDoc comments for public APIs
- Provide usage examples for custom elements and attributes
- Document service dependencies and their purposes
```

## Character Limits and Organization

### Rule File Limits
- Individual rule files are limited to 6,000 characters
- Total combined characters for global and local rules: 12,000
- Global rules take priority if limit is exceeded

### Organization Tips
- Break complex rules into focused, single-purpose files
- Use clear, descriptive filenames
- Keep rules concise and actionable
- Avoid redundant information across files

## Advanced Windsurf Configuration

### Multiple Agent Windows
For complex Aurelia projects, use multiple Cascade windows:

```markdown
# Multi-Agent Workflow

## Frontend Components (Window 1)
Focus on custom elements, templates, and UI logic.
Context: src/components/, template files, styling.

## Backend Services (Window 2)  
Focus on services, business logic, and data access.
Context: src/services/, API integration, data models.

## Testing & Quality (Window 3)
Focus on test generation, debugging, and code quality.
Context: packages/__tests__/, quality assurance.
```

### Context Management
Use `@` syntax to reference specific files and provide targeted context:

- `@src/components/user-profile.ts` - Reference specific component
- `@packages/__tests__/` - Reference test directory
- `@package.json` - Reference build configuration

## Example Prompts for Windsurf

### Component Generation
```
Create an Aurelia custom element for displaying user statistics. Include:
- Bindable properties for user data
- Proper lifecycle hooks for data fetching
- Error handling and loading states
- TypeScript interfaces for type safety

@src/interfaces/user.ts for user type definitions
```

### Service Creation
```
Generate a data service for managing user preferences with:
- Singleton registration pattern
- HTTP client injection
- Proper error handling and logging
- TypeScript return types

Follow the patterns in @src/services/auth-service.ts
```

### Test Generation
```
Create comprehensive tests for the UserProfile component including:
- Happy path rendering scenarios
- Error handling cases
- Lifecycle hook behavior
- Bindable property updates

Use @aurelia/testing patterns from @packages/__tests__/src/component-tests.ts
```

## Team Collaboration

### Version Control
Keep all `.windsurf/rules/` files in version control for consistent team experience.

### Rule Evolution
- Update rules based on team feedback and project evolution
- Document rule changes in commit messages
- Review rule effectiveness during retrospectives
- Share successful patterns across team projects

### Onboarding
New team members benefit from pre-configured Windsurf rules that encode team knowledge and project-specific patterns.

## Troubleshooting

### Common Issues
- **Rules not applying**: Check character limits and file locations
- **Context overload**: Break complex rules into focused files
- **Inconsistent suggestions**: Ensure rules don't contradict each other

### Performance Optimization
- Keep rules concise and specific
- Use appropriate context references with `@` syntax
- Avoid overlapping or redundant rule files
- Test rule effectiveness with actual coding scenarios