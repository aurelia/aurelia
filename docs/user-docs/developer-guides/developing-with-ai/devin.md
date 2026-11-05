---
description: Set up Devin for an Aurelia 2 project with AGENTS.md, repo setup, skills, and the Aurelia docs MCP server.
---

# Devin

[Devin](https://docs.devin.ai) reads `AGENTS.md` before it starts coding. Start from the [Aurelia AGENTS.md template](agents-md-template.md) and commit it to your repository root.

Devin includes only the first 16 KiB of each `AGENTS.md` automatically. Anything after that loads only if Devin decides to open the full file. Put the Aurelia version, commands, and the rules agents break most often near the top.

## Repo setup

Devin works in its own machine, so it needs your toolchain installed before it can run the commands in `AGENTS.md`. Complete [repo setup](https://docs.devin.ai/onboard-devin/environment) for each repository: install the Node version your app uses, run `npm ci`, and confirm `npm run build` and `npm test` pass. Devin saves the result as a snapshot, so later sessions start ready.

If the dev server needs environment variables or a backend, add them during setup. Devin can open the app in its browser and check for console errors, which catches template mistakes that type checks miss.

## Skills

Put repeatable procedures, such as "add a routed page" or "verify the app before opening a PR", in `.agents/skills/<name>/SKILL.md`. Devin finds them in every connected repository. See the [Claude Code page](claude-code.md#skills) for an example skill. The format is the same.

Devin may also suggest a skill after a session, for example how to start your API alongside the Aurelia dev server. Review these before merging, the same as code.

## Knowledge

Devin's **Knowledge** holds notes that live in Devin, not in your repository. Use it for organization-wide context. Keep Aurelia project rules in `AGENTS.md`, where they are versioned with the code and other agents can read them.

## Docs MCP server

Open **Customize → MCPs**, add a custom server, choose the HTTP transport, and enter:

```text
https://docs.aurelia.io/~gitbook/mcp
```

Add it at the organization scope to make it available in every session.

## Devin Desktop and Devin CLI

Devin Desktop (formerly Windsurf) and the Devin CLI run the agent on your own machine. They read `AGENTS.md` and `AGENTS.local.md` at the workspace root and in each directory between the root and the file being edited. Keep personal notes in `AGENTS.local.md` and add it to `.gitignore`.

For rules that apply only to some files, add one rule per file in `.devin/rules/`, and use `trigger` frontmatter to set when each one applies. The **Customize** page lists the rules, skills, and MCP servers the agent has loaded.

## Check the setup

Start a session and ask Devin which instruction files it read and how this project injects services. The answer should mention `AGENTS.md` and `resolve()`.
