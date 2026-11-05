---
description: Point Gemini CLI, Windsurf, Zed, Aider, and other coding agents at your Aurelia project's AGENTS.md and the Aurelia docs.
---

# Other AI agents

Most coding agents now read [`AGENTS.md`](https://agents.md/), so the [Aurelia AGENTS.md template](agents-md-template.md) works with them without changes. Tool-specific options change often, so check each tool's docs for the current details.

| Tool | Instructions | Notes |
| --- | --- | --- |
| [Gemini CLI](https://github.com/google-gemini/gemini-cli) | `GEMINI.md` by default | Set `context.fileName` to `["AGENTS.md", "GEMINI.md"]` in `.gemini/settings.json` to read `AGENTS.md`. |
| Windsurf | `AGENTS.md` | Windsurf is now Devin Desktop. See [Devin](devin.md#devin-desktop-and-devin-cli). |
| [Zed](https://zed.dev/docs/ai/rules) | `AGENTS.md` | Zed also reads other tools' instruction files, such as `.rules` and `CLAUDE.md`. |
| [Aider](https://aider.chat/docs/usage/conventions.html) | Files you pass with `--read` | Add `read: AGENTS.md` to `.aider.conf.yml` so it loads every session. |
| [JetBrains Junie](https://www.jetbrains.com/junie/) | `AGENTS.md` | |
| [Amp](https://ampcode.com) | `AGENTS.md` | |
| [Jules](https://jules.google) | `AGENTS.md` | |

## Tools without AGENTS.md support

If a tool only accepts its own file name, point it at `AGENTS.md` instead of keeping a second copy:

- **Imports.** If the tool supports `@path` imports, as Claude Code does, make its file a one-line import of `AGENTS.md`.
- **Symlinks.** `ln -s AGENTS.md TOOLFILE.md` works for tools that read files from disk. Windows needs developer mode or `git config core.symlinks true` for this.
- **A pointer.** As a last resort, write "Read `AGENTS.md` before starting work." Most agents will follow it.

## Docs

For tools that support MCP, add the Aurelia docs server at `https://docs.aurelia.io/~gitbook/mcp` using the HTTP transport. For tools that don't, point the agent at `https://docs.aurelia.io/llms.txt`, or add `.md` to a page URL and paste the Markdown into the chat.
