---
description: Set up Claude Code for an Aurelia 2 project with AGENTS.md, path-scoped rules, skills, and the Aurelia docs MCP server.
---

# Claude Code

[Claude Code](https://code.claude.com/docs) reads project instructions from `CLAUDE.md`. Recent versions (2.1.277 and later) also read `AGENTS.md` directly, but only when the repository has no `CLAUDE.md`.

## Instructions

If your team uses several agents, keep the rules in [`AGENTS.md`](agents-md-template.md) and add a `CLAUDE.md` that imports it:

```markdown
@AGENTS.md

## Claude Code

Notes that only apply to Claude Code go here.
```

The `@AGENTS.md` line pulls the whole file into context. This works on every Claude Code version, and it keeps working after someone adds a `CLAUDE.md` for Claude-specific notes. Without the import, adding that `CLAUDE.md` would stop Claude from reading `AGENTS.md`.

If Claude Code is the only agent on the project, put everything in `CLAUDE.md` instead. Running `/init` drafts one from your codebase. Review it before committing, because it may describe your app's current patterns rather than the ones you want.

Keep personal preferences, such as a local API URL, in `CLAUDE.local.md` and add that file to `.gitignore`.

## Path-scoped rules

Rules that only matter for some files can go in `.claude/rules/` with a `paths` field. They load only when Claude reads or edits a matching file, so they don't cost context in other sessions:

```markdown
---
paths:
  - "src/**/*.html"
---

# Aurelia templates

- Plain HTML, no `<template>` wrapper.
- `click.trigger`, never `.delegate` or `.call`.
- Pass callbacks as lambdas: `on-select.bind="(item) => select(item)"`.
```

## Skills

Use a skill for a multi-step procedure you repeat, such as adding a routed page or a component with its test. Put it in `.claude/skills/<name>/SKILL.md`:

```markdown
---
name: new-page
description: Add a routed page to the Aurelia app with its template, route entry, and test.
---

1. Create `src/pages/<name>.ts` and `src/pages/<name>.html` using conventions.
2. Add the route to the `routes` list in `src/my-app.ts`.
3. Add `src/pages/<name>.spec.ts` using `createFixture`.
4. Run `npm test` and `npm run build`.
```

Claude loads a skill when its description matches the task, or you can run it with `/new-page`. Skills follow the [Agent Skills](https://agentskills.io) format, so Codex, Copilot, Cursor, and Devin can use the same file if you place it in `.agents/skills/` instead.

## Docs MCP server

Add the Aurelia docs MCP server for your user:

```bash
claude mcp add --transport http aurelia-docs https://docs.aurelia.io/~gitbook/mcp
```

To share it with the team, add `--scope project`. This writes the server to `.mcp.json` in the repository root:

```json
{
  "mcpServers": {
    "aurelia-docs": {
      "type": "http",
      "url": "https://docs.aurelia.io/~gitbook/mcp"
    }
  }
}
```

The `type` field is required. Claude Code treats an entry with a `url` and no `type` as a misconfigured stdio server and skips it.

## Check the setup

Run `/context` and check the **Memory files** list to see which instruction files loaded, and `/mcp` to confirm `aurelia-docs` is connected. Then ask Claude how this project defines routes. The answer should mention `@route` or `static routes`, not Aurelia 1's `configureRouter`.
