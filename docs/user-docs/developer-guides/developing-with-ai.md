---
description: Set up Claude Code, Codex, Cursor, GitHub Copilot, Devin, and other coding agents to write correct Aurelia 2 code.
---

# Developing with AI

Coding agents write Aurelia 2 code well when they have two things: the current documentation, and a short instruction file that describes your project. Without them, most models fall back on Aurelia 1 patterns or habits from React and Angular, because those dominate their training data.

This page covers both, then lists the mistakes agents make most often in Aurelia code so you know what to check in review.

## Connect the docs

The Aurelia docs are available in formats that agents can read directly. Use whichever your tool supports.

| Source | URL | Use it for |
| --- | --- | --- |
| MCP server | `https://docs.aurelia.io/~gitbook/mcp` | Search and fetch pages on demand. Best option when your tool supports MCP. |
| Page index | `https://docs.aurelia.io/llms.txt` | A list of every page with a one-line summary. |
| Full docs | `https://docs.aurelia.io/llms-full.txt` | The entire docs as one Markdown file (about 1.4 MB, so too large for most context windows). |
| Single page | Add `.md` to any page URL | Paste a specific page into a chat, for example `https://docs.aurelia.io/router/getting-started.md`. |

The MCP server exposes two read-only tools: `searchDocumentation` and `getPage`. It needs no API key. Once it's connected, an agent can look up the current router or DI API instead of guessing.

{% tabs %}
{% tab title="Claude Code" %}
```bash
claude mcp add --transport http aurelia-docs https://docs.aurelia.io/~gitbook/mcp
```
{% endtab %}

{% tab title="Codex" %}
```bash
codex mcp add aurelia-docs --url https://docs.aurelia.io/~gitbook/mcp
```
{% endtab %}

{% tab title="Cursor" %}
Add to `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "aurelia-docs": {
      "url": "https://docs.aurelia.io/~gitbook/mcp"
    }
  }
}
```
{% endtab %}

{% tab title="GitHub Copilot" %}
In VS Code, run **MCP: Add Server** from the Command Palette, choose **HTTP**, and enter the URL.

For the Copilot cloud agent, go to the repository's **Settings → Copilot → MCP servers** and add:

```json
{
  "mcpServers": {
    "aurelia-docs": {
      "type": "http",
      "url": "https://docs.aurelia.io/~gitbook/mcp",
      "tools": ["searchDocumentation", "getPage"]
    }
  }
}
```
{% endtab %}

{% tab title="Devin" %}
Open **Customize → MCPs**, add a custom server, choose the HTTP transport, and enter `https://docs.aurelia.io/~gitbook/mcp`.
{% endtab %}
{% endtabs %}

## Add an AGENTS.md file

[`AGENTS.md`](https://agents.md/) is a plain Markdown file in your repository root that tells coding agents how your project works. Codex, Cursor, GitHub Copilot, Devin, Zed, Jules, and many other tools read it automatically. Claude Code reads it when there is no `CLAUDE.md`, and it can import it from one when there is.

Write one `AGENTS.md` and let each tool read it. Keeping separate rule files per tool means they drift apart over time, and the agent ends up following whichever copy is out of date.

Start from the [Aurelia AGENTS.md template](developing-with-ai/agents-md-template.md) and edit it to match your app. A good file:

- **Lists the exact commands** for dev, build, test, and lint. Agents run these to check their own work, so a wrong command means unchecked code.
- **States the Aurelia version and packages.** Write "Aurelia 2" and name the router package. This one line prevents most Aurelia 1 output.
- **Records decisions the code doesn't show.** Examples: "We use conventions, not `@customElement`" or "State lives in `@aurelia/state`, not in services."
- **Stays short.** Agents load the whole file into every session. Claude Code recommends staying under 200 lines, Devin reads only the first 16 KiB automatically, and Codex stops at 32 KiB by default. Move detail into nested `AGENTS.md` files or skills.

Leave out generic advice such as "write clean code" or "use TypeScript best practices". Models already know it, and it takes space that project-specific rules need.

## Where agents go wrong

Most bad Aurelia output comes from a short list of patterns. Put the ones that bite your team into your instruction file, and check for them in review.

| Agents write | Aurelia 2 uses |
| --- | --- |
| `@inject(Foo)` or `@autoinject` with constructor parameters | `private foo = resolve(Foo);` |
| `<require from="./x">` | `<import from="./x">` |
| A `<template>` wrapper around the component's HTML | Plain HTML, no wrapper |
| `click.delegate` | `click.trigger` (`.delegate` exists only in `@aurelia/compat-v1`) |
| `.call` binding command | A lambda: `on-save.bind="(item) => save(item)"` |
| `view-model.ref` | `component.ref` |
| `@computedFrom('a', 'b')` | A plain getter, since dependencies are tracked automatically. Use `@computed` only to control tracking. |
| `PLATFORM.moduleName('./page')` | A normal import or `() => import('./page')` |
| `<router-view>`, `route-href`, `router.navigate()` | `<au-viewport>`, `load`, `router.load()` |
| `activate()` and `canActivate()` route hooks | `loading()` and `canLoad()` |
| Expecting `preventDefault()` by default | `click.trigger:prevent` when you need it |
| React or Angular idioms such as `useState`, `className`, `*ngFor`, or `(click)` | `${}` interpolation, `class.bind`, `repeat.for`, and `click.trigger` |

The [migration guide](migrating-to-aurelia-2/README.md) covers each of these in more detail.

Agents also tend to over-build. They register every resource globally, add a state library to a five-component app, or wrap a simple value converter in a service. Ask for the smallest change that works, and say so in your instruction file if it keeps happening.

## Let the agent check its work

An agent that can build and run tests catches its own template errors. One that can't will report success on code that fails at runtime.

- **Test templates, not just types.** Templates are compiled at runtime, so a bad binding expression only fails when the component renders. A misspelled or unregistered custom element fails silently: the browser renders it as an unknown HTML element. A component test with `createFixture` from `@aurelia/testing` renders the template and lets the agent assert on the output. See [testing components](testing/testing-components.md).
- **Give it the browser.** Agents with browser access, such as Claude Code with Chrome, Cursor's browser, Copilot's Playwright MCP, or Devin's built-in browser, can open the dev server and read console errors. For UI work, that catches mistakes a type check misses.
- **Tell it when to stop.** "Run `npm test` and `npm run build`; do not report done until both pass" in your instruction file works better than asking in each prompt.

## Review what it produces

Review agent output the way you would review a pull request from a new teammate who has read the docs but never seen your app.

- Check templates as closely as TypeScript. Type checks don't cover binding expressions.
- Look for subscriptions, timers, and event listeners added in `attached` or `binding` without cleanup in `detaching` or `unbinding`.
- Watch for new dependencies. Agents add packages to solve problems Aurelia already handles, such as a date library for a value converter or an event bus when `IEventAggregator` exists.
- Be careful with router and DI changes. Lifecycle timing and container scope bugs look correct in a diff and fail only when components are reused or navigated away from.

## Tool setup

Each tool reads instructions from slightly different places. These pages show the setup for each one, using the shared `AGENTS.md`:

- [Claude Code](developing-with-ai/claude-code.md)
- [OpenAI Codex](developing-with-ai/codex.md)
- [Cursor](developing-with-ai/cursor.md)
- [GitHub Copilot](developing-with-ai/github-copilot.md)
- [Devin](developing-with-ai/devin.md)
- [Other AI agents](developing-with-ai/other-ai-agents.md): Gemini CLI, Zed, Aider, Junie, and others
