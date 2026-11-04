---
description: Set up OpenAI Codex for an Aurelia 2 project with AGENTS.md, skills, and the Aurelia docs MCP server.
---

# OpenAI Codex

[Codex](https://developers.openai.com/codex) reads `AGENTS.md` before it starts work, in the CLI, the IDE extension, and Codex cloud tasks. Start from the [Aurelia AGENTS.md template](agents-md-template.md) and commit it to your repository root.

## How Codex finds instructions

Codex builds its instructions from these files, in this order:

1. `~/.codex/AGENTS.md`, for preferences that apply to every repository.
2. One file per directory, from the repository root down to the directory you started in. In each directory it uses `AGENTS.override.md` if there is one, otherwise `AGENTS.md`.

Files closer to your working directory come later, so their rules win when two conflict. Codex stops adding files once the total reaches 32 KiB. If a large monorepo hits that limit, move package rules into the packages instead of raising `project_doc_max_bytes`.

In a monorepo with several Aurelia apps, put shared rules in the root file and app-specific commands in each app:

```text
AGENTS.md              # Aurelia version, code style, review rules
apps/admin/AGENTS.md   # admin app commands and structure
apps/store/AGENTS.md   # store app commands and structure
```

## Skills

Put repeatable procedures in `.agents/skills/<name>/SKILL.md`. Codex scans `.agents/skills` in every directory from where you launch it up to the repository root. See the [Claude Code page](claude-code.md#skills) for an example skill. The format is the same.

## Docs MCP server

```bash
codex mcp add aurelia-docs --url https://docs.aurelia.io/~gitbook/mcp
```

Or add it to `~/.codex/config.toml`:

```toml
[mcp_servers.aurelia-docs]
url = "https://docs.aurelia.io/~gitbook/mcp"
```

## Cloud tasks

Codex cloud runs each task in a container built from the environment you configure. Set its Node version to match your app and add `npm ci` to the setup script. Otherwise Codex can't run the build and test commands your `AGENTS.md` asks for.

## Check the setup

```bash
codex "List the instruction files you loaded, then tell me which router this project uses."
```

The answer should name your `AGENTS.md` and `@aurelia/router`.
