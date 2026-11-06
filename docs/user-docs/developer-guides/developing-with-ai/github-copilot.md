---
description: Set up GitHub Copilot for an Aurelia 2 project with AGENTS.md, path-specific instructions, cloud agent setup steps, and the Aurelia docs MCP server.
---

# GitHub Copilot

[GitHub Copilot](https://docs.github.com/en/copilot) reads instructions from several files. Use the [Aurelia AGENTS.md template](agents-md-template.md) as your main file, since Copilot agents read `AGENTS.md` and so do the other tools on this list.

| File | Use it for |
| --- | --- |
| `AGENTS.md` | Main project instructions. The nearest file in the directory tree takes precedence. |
| `.github/copilot-instructions.md` | Repository-wide instructions for Copilot Chat and code review. |
| `.github/instructions/*.instructions.md` | Rules for specific paths, selected with `applyTo`. |

If you have both `AGENTS.md` and `.github/copilot-instructions.md`, Copilot applies both. Don't repeat rules across them: when instructions conflict, GitHub says Copilot's choice is non-deterministic. A short `copilot-instructions.md` that says "Follow `AGENTS.md`" plus any Chat-specific notes avoids that.

## Path-specific instructions

```markdown
---
applyTo: "src/**/*.html"
---

# Aurelia templates

- Plain HTML, no `<template>` wrapper.
- `click.trigger`, never `.delegate` or `.call`.
- Pass callbacks as lambdas: `on-select.bind="(item) => select(item)"`.
```

Save it as `.github/instructions/aurelia-templates.instructions.md`. Add `excludeAgent: "code-review"` or `excludeAgent: "cloud-agent"` to the frontmatter to keep a file away from one of those features.

## Cloud agent setup

The Copilot cloud agent works in a GitHub Actions environment. Install dependencies there so it can run your build and tests. Create `.github/workflows/copilot-setup-steps.yml` on your default branch:

```yaml
name: Copilot setup steps

on: workflow_dispatch

jobs:
  copilot-setup-steps:
    runs-on: ubuntu-latest
    permissions:
      contents: read
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v7
        with:
          node-version: 22
          cache: npm
      - run: npm ci
```

The job must be named `copilot-setup-steps`, or Copilot ignores it.

## Docs MCP server

**VS Code:** Run **MCP: Add Server** from the Command Palette, choose **HTTP**, and enter `https://docs.aurelia.io/~gitbook/mcp`.

**Cloud agent:** In the repository, open **Settings → Copilot → MCP servers** and add:

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

## Skills

Copilot reads [Agent Skills](https://agentskills.io) from `.github/skills/` and `.agents/skills/`. See the [Claude Code page](claude-code.md#skills) for an example skill. The format is the same.

## Check the setup

In Copilot Chat, open the references list on a response to see which instruction files were used. Ask how this project handles route hooks. The answer should mention `canLoad` and `loading`, not `canActivate` and `activate`.
