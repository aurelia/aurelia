# Cursor Rules Example for Aurelia Projects

This document shows both legacy `.cursorrules` format and the modern `.cursor/rules/*.mdc` system for Aurelia development with Cursor AI.

## Legacy Format: .cursorrules

Place this file in your project root (note: this format will be deprecated):

```markdown
# Aurelia 2.x TypeScript Application Rules

## Framework Context
- Aurelia 2.x application with TypeScript strict mode
- Dependency injection via @aurelia/kernel with hierarchical containers
- MVVM architecture with clear view/view-model separation
- Template compilation to instruction objects for DOM binding

## Project Structure
- /packages/ - Core Aurelia framework packages
- /packages/__tests__/ - Test files (require npm run build before execution)
- /src/components/ - Custom elements using kebab-case naming
- /src/services/ - Application services with DI registration

## Development Workflow
- Always run `npm run build` after package changes before testing
- Use `npm run dev -- -t "pattern"` for specific test execution
- Build required for both package and test file modifications
- Run `npm run lint` before committing changes

## TypeScript Standards
- Strict mode enabled - never use `any` type
- Prefer interfaces over type aliases for object shapes
- Use explicit return types for public methods
- Handle undefined/null with strict null checks

## Aurelia Conventions
- Custom elements: kebab-case names, PascalCase classes
- Services: @singleton for stateless, @transient for stateful
- Lifecycle: creating → created → binding → bound → attaching → attached
- Always implement cleanup in detaching/unbinding hooks
- Use constructor injection with @resolve() when needed

## Code Style
- Prefer positive if statements over negative
- Use early returns to reduce nesting
- Always use curly braces for control structures
- Prefer const over let, never use var
- Use Aurelia logger (ILogger) instead of console.log

## Testing Requirements
- Use @aurelia/testing package for component tests
- Follow AAA pattern (Arrange, Act, Assert)  
- Test both happy path and error scenarios
- Avoid loops in unit tests - write explicit cases
```

## Modern Format: .cursor/rules/*.mdc

Create rule files in the `.cursor/rules/` directory with the `.mdc` extension:

### `.cursor/rules/aurelia-framework.mdc`
```markdown
---
description: "Aurelia framework patterns and conventions"
globs: ["**/*.ts", "**/*.html"]
alwaysApply: true
---

Generate Aurelia 2.x components following these patterns:

- Use `@customElement` decorator with kebab-case names
- Implement proper lifecycle hooks when needed
- Use TypeScript strict mode with explicit types
- Follow MVVM architecture principles
```

### `.cursor/rules/dependency-injection.mdc`
```markdown
---
description: "Dependency injection patterns for Aurelia"
globs: ["**/services/**/*.ts", "**/*service.ts"]
alwaysApply: false
---

Create services with proper DI registration:

- Use `@singleton` for stateless services
- Use `@transient` for stateful services
- Implement constructor injection for dependencies
- Register services via StandardConfiguration.customize()
```

### `.cursor/rules/component-lifecycle.mdc`
```markdown
---
description: "Aurelia component lifecycle management"
globs: ["**/components/**/*.ts", "**/*element.ts"]
alwaysApply: false
---

Implement Aurelia lifecycle hooks correctly:

- Use lifecycle order: creating → created → binding → bound → attaching → attached
- Always provide cleanup in detaching/unbinding hooks
- Handle errors gracefully in lifecycle methods
- Use bindable properties with explicit TypeScript types
```

### `.cursor/rules/testing-patterns.mdc`
```markdown
---
description: "Testing patterns for Aurelia applications"
globs: ["**/__tests__/**/*.ts", "**/*.spec.ts", "**/*.test.ts"]
alwaysApply: false
---

Generate tests using Aurelia testing patterns:

- Use @aurelia/testing package for component testing
- Follow AAA pattern: Arrange, Act, Assert
- Create explicit test cases instead of loops
- Test both success and error conditions
- Remember: `npm run build` required before test execution
```

### `.cursor/rules/build-requirements.mdc`
```markdown
---
description: "Build and development workflow requirements"
globs: ["**/*.ts", "**/*.js"]
alwaysApply: true
---

Remember Aurelia build requirements:

- Run `npm run build` after making changes to packages
- Build required before running tests
- Use `npm run dev -- -t "pattern"` for specific tests
- Run `npm run lint` before committing
```

## Project-Specific Rules Directory Structure

For larger projects, organize rules hierarchically:

```
project/
├── .cursor/
│   └── rules/
│       ├── aurelia-framework.mdc      # Framework-wide rules
│       ├── build-requirements.mdc     # Build workflow
│       └── typescript-standards.mdc   # TypeScript conventions
├── src/
│   ├── components/
│   │   └── .cursor/
│   │       └── rules/
│   │           └── component-patterns.mdc  # Component-specific rules
│   └── services/
│       └── .cursor/
│           └── rules/
│               └── service-patterns.mdc    # Service-specific rules
```

## Rule Generation with Cursor

### Using the Command Palette
1. Open Cursor Settings > Rules
2. Click "New Cursor Rule" to create a rule file
3. Use the command palette: "New Cursor Rule"

### Auto-Generation from Conversations
Use the `/Generate Cursor Rules` command during conversations to create rules based on decisions made during coding sessions.

### Example Auto-Generated Rule
After discussing Aurelia component patterns, you might generate:

```markdown
---
description: "Custom element bindable properties pattern"
globs: ["**/components/**/*.ts"]
alwaysApply: false
---

When creating bindable properties for Aurelia custom elements:

- Use @bindable decorator with explicit TypeScript types
- Provide default values when appropriate
- Consider property change callbacks for complex logic
- Document bindable properties in component comments
```

## Best Practices for Cursor Rules

### 1. Keep Rules Focused
Each rule should address a specific pattern or convention, not multiple concerns.

### 2. Use Appropriate Globs
Target rules to relevant file types and locations to avoid context pollution.

### 3. Set alwaysApply Strategically
- `true` for fundamental patterns that always apply
- `false` for context-specific rules that apply to certain file types

### 4. Regular Refinement
Update rules based on team feedback and evolving project needs.

### 5. Team Collaboration
Keep rule files in version control for consistent team experience.

## Migration from Legacy .cursorrules

To migrate from `.cursorrules` to the modern system:

1. Create `.cursor/rules/` directory
2. Break down your `.cursorrules` content into focused rule files
3. Add appropriate frontmatter with globs and descriptions
4. Test rules with relevant file types
5. Remove or rename the legacy `.cursorrules` file

The modern system provides better organization, context control, and team collaboration compared to the legacy format.