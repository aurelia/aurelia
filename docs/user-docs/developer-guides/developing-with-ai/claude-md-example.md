# CLAUDE.md Example for Aurelia Projects

This is an example `CLAUDE.md` file optimized for Aurelia development with Claude Code. Place this file in your project root or use hierarchical placement for monorepos.

```markdown
# CLAUDE.md

This file provides guidance to Claude Code when working with this Aurelia application.

## Framework & Architecture

- Aurelia 2.x TypeScript application
- Dependency injection with `@aurelia/kernel` - hierarchical containers
- Template compiler with `@aurelia/template-compiler`
- Resources follow MVVM pattern with clear separation of concerns
- Components use lifecycle hooks: creating → created → binding → bound → attaching → attached

## Project Structure

- `/src/components/` - Custom elements following kebab-case naming
- `/src/attributes/` - Custom attributes and behaviors
- `/src/value-converters/` - Value converters and binding behaviors
- `/src/services/` - Application services registered via DI
- `/packages/__tests__/` - Test files (require building before execution)

## Development Commands

- `npm run build` - Build all packages (REQUIRED before testing)
- `npm run test` - Run all tests
- `npm run dev -- -t "pattern"` - Run specific test patterns
- `npm run lint` - ESLint validation
- `npm run rebuild` - Clean build from scratch

## Code Standards

### TypeScript
- Strict mode enabled - avoid `any` type
- Prefer interfaces over type aliases for object shapes
- Use explicit return types for public methods
- Handle undefined/null explicitly

### Aurelia Patterns
- Use `@singleton` for stateless services
- Use `@transient` for stateful services  
- Custom elements use kebab-case: `<user-profile>`
- Classes use PascalCase: `UserProfileCustomElement`
- Always implement proper cleanup in `detaching`/`unbinding`

### DI Registration
- Register resources via `StandardConfiguration.customize()`
- Use constructor injection with `@resolve()` decorator
- Services resolve through `container.get()` or injection

### Testing
- Use `@aurelia/testing` package for component tests
- Follow AAA pattern: Arrange, Act, Assert
- Test both happy path and error scenarios
- Build packages before running tests

## Key Conventions

- Always quote file paths with spaces: `"path with spaces/file.ts"`
- Use early returns to reduce nesting
- Prefer const over let, never use var
- Include TypeScript types for all bindable properties
- Implement proper error handling in lifecycle hooks
- Use Aurelia logger system (ILogger) instead of console.log

## Architecture Notes

- Resources have metadata and are discoverable via conventions
- Templates compile to instruction objects for DOM binding
- Observation system uses automatic dependency tracking
- Container hierarchy enables scoped services per component tree
```

## Key Features of This Configuration

### 1. **Concise and Focused**
Following 2025 best practices, this configuration is under 500 lines and uses short, declarative bullet points rather than long paragraphs.

### 2. **Aurelia-Specific Context**
Provides essential information about Aurelia's architecture, DI system, and lifecycle patterns that Claude needs to generate appropriate code.

### 3. **Development Workflow**
Includes critical build requirements and commands specific to the Aurelia monorepo structure.

### 4. **Code Quality Standards**
Specifies TypeScript best practices and Aurelia-specific naming conventions to ensure consistent code generation.

## Usage Tips

### Hierarchical Placement
For monorepos, you can place CLAUDE.md files at different levels:
- Root `/CLAUDE.md` - Project-wide conventions
- `/packages/runtime/CLAUDE.md` - Package-specific rules
- `/examples/CLAUDE.md` - Example-specific context

### Regular Refinement
Update your CLAUDE.md file as your project evolves:
- Add new architectural decisions
- Update build commands
- Refine coding standards based on team feedback
- Remove outdated or redundant information

### Auto-Generation
Use Claude Code's `/init` command to automatically generate a CLAUDE.md file by analyzing your codebase, then refine it with project-specific details.

### Integration with Existing Files
This example works well with the existing `.cursorrules` file in the Aurelia repository, providing complementary guidance for different AI tools.