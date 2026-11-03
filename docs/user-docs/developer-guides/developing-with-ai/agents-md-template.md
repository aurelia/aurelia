---
description: A starting AGENTS.md for Aurelia 2 apps that works with Claude Code, Codex, Cursor, GitHub Copilot, Devin, and other coding agents.
---

# AGENTS.md template

Copy this into `AGENTS.md` at your repository root, then edit it. Replace the commands with the scripts in your `package.json` and delete any rule that doesn't apply to your project. Rules your project doesn't follow are worse than none, because the agent will apply them anyway.

The file is about 70 lines. Keep yours short: everything in it loads into every agent session.

```markdown
# AGENTS.md

## Project

- Aurelia 2 single-page app written in TypeScript, built with Vite (`@aurelia/vite-plugin`).
- Routing uses `@aurelia/router`.
- Look up APIs in the Aurelia 2 docs (https://docs.aurelia.io, or the `aurelia-docs` MCP server)
  instead of relying on memory. Many examples online are for Aurelia 1 and do not work here.

## Commands

- `npm run dev` - start the dev server
- `npm run build` - production build and type check
- `npm test` - run unit and component tests (Vitest)
- `npm run lint` - lint

Run `npm test` and `npm run build` after every change. Do not report a task as done until both pass.

## Structure

- `src/main.ts` - app startup and global registrations
- `src/components/` - shared custom elements
- `src/pages/` - routed components
- `src/resources/` - value converters, binding behaviors, custom attributes
- `src/services/` - DI services
- Tests sit next to the code as `*.spec.ts`

## Components

- Use conventions: `user-card.ts` pairs with `user-card.html` and becomes `<user-card>`.
  Only use `@customElement` when a component needs options conventions can't express.
- Component HTML is plain HTML. Do not wrap it in `<template>`.
- Import local resources in the template with `<import from="./user-card"></import>`.
  Register a resource globally in `main.ts` only when most of the app uses it.
- Declare inputs with `@bindable` and give each one a type.
- Clean up anything started in `binding` or `attached` (subscriptions, timers, listeners)
  in `unbinding` or `detaching`.

## Templates

- Events: `click.trigger="save()"`. Never use `.delegate` or `.call`.
- Pass callbacks as lambdas: `on-select.bind="(item) => select(item)"`.
- Use `${}` for text, `.bind` for properties, `repeat.for="item of items"` for lists,
  and `if.bind` / `else` for conditionals.
- Get a component's view model with `component.ref`, not `view-model.ref`.

## Dependency injection

- Inject with `resolve()`: `private readonly api = resolve(IApiClient);`
- Do not use `@inject`, `@autoinject`, or constructor parameter injection.
- Define service interfaces with `DI.createInterface<IApiClient>('IApiClient', x => x.singleton(ApiClient))`.

## Reactivity

- Plain properties and getters are observed automatically. Do not add `@computedFrom`.
- Use `@watch` or `@observable` only when you need to react to a change with side effects.

## Routing

- Define routes with `@route` or a static `routes` property. Render them in `<au-viewport>`.
- Link with `load="users/42"` and navigate in code with `router.load(...)`.
- Route hooks are `canLoad`, `loading`, `canUnload`, and `unloading`.
  Aurelia 1's `activate` and `canActivate` do not exist.

## Testing

- Component tests use `createFixture` from `@aurelia/testing`.
- Assert on rendered output, not on private fields.

## Avoid

- Adding dependencies without asking.
- React, Vue, or Angular patterns (hooks, JSX, `className`, `*ngFor`).
- Rewriting unrelated code while fixing something else.
```

## Edit it for your app

Most edits fall into a few places:

- **No conventions.** If your components use `@customElement({ name, template })`, replace the first rule under Components and drop the `<import>` rule if you register resources another way.
- **Different test runner.** Replace Vitest with Jest or your runner, and add the setup file path so the agent doesn't create a second one.
- **Plugins.** Add one line per first-party plugin you use, such as `@aurelia/validation`, `@aurelia/state`, `@aurelia/i18n`, or `@aurelia/dialog`, with the pattern your app follows.
- **Monorepos.** Keep the root file short and put package-specific commands in an `AGENTS.md` inside each package. Most agents read the file nearest the code they are editing.
- **Router choice.** If you use `@aurelia/router-direct`, change the Routing section. Its API is different.

## Check that it loads

Ask your agent: "Which instruction files did you load, and what does this project use for routing?" If it can't name `AGENTS.md` or answers with Aurelia 1 APIs, see the setup page for your tool.
