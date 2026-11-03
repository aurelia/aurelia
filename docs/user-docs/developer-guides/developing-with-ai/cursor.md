---
description: Set up Cursor for an Aurelia 2 project with AGENTS.md, project rules, and the Aurelia docs MCP server.
---

# Cursor

[Cursor](https://cursor.com/docs) reads `AGENTS.md` from the project root and from subdirectories. For most Aurelia apps, the [Aurelia AGENTS.md template](agents-md-template.md) is all you need.

Use project rules in `.cursor/rules/` when you want a rule to load only for certain files, or only when it's relevant.

## Project rules

Each rule is an `.mdc` file with frontmatter. Cursor ignores plain `.md` files in `.cursor/rules/`, with no warning.

A rule that applies to Aurelia templates:

```markdown
---
description: Aurelia 2 template syntax
globs: src/**/*.html
alwaysApply: false
---

- Plain HTML, no `<template>` wrapper.
- `click.trigger`, never `.delegate` or `.call`.
- Pass callbacks as lambdas: `on-select.bind="(item) => select(item)"`.
- Use `${}`, `repeat.for="item of items"`, and `if.bind` / `else`.
```

The frontmatter decides when a rule loads:

| Frontmatter | Loads |
| --- | --- |
| `alwaysApply: true` | In every chat |
| `globs` set | When a matching file is in context |
| `description` only | When the agent decides the description matches the task |
| None of these | Only when you mention it with `@` |

Keep `alwaysApply: false` unless a rule belongs in every chat. Cursor recommends keeping each rule under 500 lines. Shorter is better.

The old `.cursorrules` file in the project root is legacy. Move its contents into `AGENTS.md` or `.cursor/rules/`.

## Skills

Cursor reads [Agent Skills](https://agentskills.io) from `.agents/skills/` and `.cursor/skills/`. See the [Claude Code page](claude-code.md#skills) for an example skill. The format is the same.

## Docs MCP server

Add this to `.cursor/mcp.json` in your project, or `~/.cursor/mcp.json` to use it everywhere:

```json
{
  "mcpServers": {
    "aurelia-docs": {
      "url": "https://docs.aurelia.io/~gitbook/mcp"
    }
  }
}
```

## Check the setup

Open **Customize → Rules** to see which rules Cursor found. Then ask the agent how this project injects services. The answer should mention `resolve()`, not `@inject` or `@autoinject`.
