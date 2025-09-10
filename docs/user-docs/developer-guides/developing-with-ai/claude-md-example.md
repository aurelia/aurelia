# CLAUDE.md

Guidance for Claude Code when working with this Aurelia 2 app.

## Framework & Architecture

- Aurelia 2.x TypeScript application
- DI via `aurelia` and `@aurelia/kernel`, hierarchical containers
- MVVM separation of concerns
- Lifecycle order: constructor → define → hydrating → hydrated → created → binding → bound → attaching → attached → detaching → unbinding → dispose

## Project Structure

- `/src/components/` - custom elements, kebab-case names in templates
- `/src/attributes/` - custom attributes and template controllers
- `/src/value-converters/` - value converters
- `/src/binding-behaviors/` - binding behaviors
- `/src/services/` - DI-registered app services
- Tests colocated as `*.spec.ts` or under `/tests` using Jest or Vitest

## Development Commands

- `npm run build` - production build, run after package changes or before publishing
- `npm test` - run tests
- `npm test -- -t "pattern"` - run tests matching a pattern
- `npm run lint` - ESLint
- `npm run dev` - dev server (tooling-specific)

## Code Standards

### TypeScript
- Strict mode on, avoid `any`
- Use explicit return types for public APIs
- Handle `undefined` and `null` explicitly
- Use interfaces or type aliases consistently, no `var`

### Aurelia Patterns
- `@singleton` for stateful or shared services
- `@transient` for lightweight, per-use services
- Custom elements are kebab-case in markup, classes are PascalCase
- Clean up in `detaching`, `unbinding`, or `dispose` as appropriate
- `.delegate` has been removed in Aurelia 2, use `.trigger` instead

### DI Registration
- Register resources and services with `Aurelia.register(...)` or `container.register(...)`
- Use `Registration.singleton(...)`, `Registration.transient(...)`, or `DI.createInterface(...)` for typed tokens
- Use `resolve(...)` for property injection or `@inject(...)` for constructor injection
- Router settings via `RouterConfiguration.customize(...)`

## Testing
- Use `@aurelia/testing` fixtures and helpers
- Set up a browser-like platform (jsdom) for Node-based tests
- Follow AAA: Arrange, Act, Assert
- Building before tests is not required for standard apps, only for package builds

## Key Conventions
- Quote file paths with spaces
- Prefer early returns
- Prefer `const` over `let`
- Type all bindable properties
- Use Aurelia’s logger (`ILogger` with `LoggerConfiguration`) over `console.log`

## Links

- Consult the Aurelia 2 docs when you are unsure or want to ensure you have latest up to date syntax and APIs https://docs.aurelia.io
