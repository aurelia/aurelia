# User Documentation Guidelines

## Scope
This subtree contains the published user documentation. The root `AGENTS.md` still applies; this file adds GitBook and writing guidance.

## GitBook Structure
- Use GitBook-flavored Markdown.
- `docs/user-docs/TOC.md` is the main navigation. When adding, moving, or renaming a page, update `TOC.md` in the same change.
- Avoid orphan pages. Every user-facing page should be reachable from the main navigation unless it is intentionally hidden or included only through another page.
- Keep frontmatter descriptions concise and useful when a page already has frontmatter.
- Use relative links to other docs pages. Prefer human link text over filename-like labels.
- Use fenced code blocks with language identifiers whenever possible.

## GitBook Blocks
- Preserve existing GitBook blocks such as `{% content-ref %}`, `{% hint %}`, `{% tabs %}`, and `{% tab %}`.
- Use `{% hint style="info" %}` for context, `style="warning"` for non-destructive cautions, and `style="danger"` only for destructive or security-sensitive actions.
- Use tab blocks for parallel platform or framework variants. Do not use tabs to hide required sequential steps.
- Do not replace GitBook blocks with raw HTML unless GitBook Markdown cannot express the result.

## Aurelia Examples
- Always import `resolve` from `@aurelia/kernel` when showing dependency injection.
- Use `resolve()` for injected dependencies: `private service = resolve(IService);`.
- Do not use constructor parameter decorators such as `@IService` or `@inject(...)` in docs examples.
- Do not wrap Aurelia 2 component HTML examples in `<template>` tags.
- Keep examples small enough to teach one idea, then link to a larger recipe or guide when needed.

## Voice And Style
- Use American English spelling.
- Write like a senior Aurelia maintainer explaining the feature to a developer who is trying to ship something.
- Prefer direct, concrete sentences. Start with what the reader can do, then explain why it works.
- Be accurate before being persuasive. Do not oversell Aurelia with vague claims such as "seamless", "powerful", "robust", "future-proof", or "game-changing" unless the sentence proves the claim with a specific behavior.
- Acknowledge practical tradeoffs and common failure modes. Good docs include the "watch out for this" detail.
- Avoid formulaic openings such as "In this guide, we'll explore", "Whether you're new to...", "Let's dive in", and "In today's landscape".
- Avoid generic AI tells: "delve", "unlock", "leverage" as a verb, "utilize", "boasts", "serves as", "it is important to note", "not only... but also", and "X is not just Y; it is Z".
- Avoid vague attribution such as "many developers say", "experts agree", or "it is widely known" unless you cite or name the source.
- Vary paragraph length and sentence rhythm, but keep the tone calm and technical. Do not add jokes or personality flourishes that distract from the task.
- Do not end pages with generic recap paragraphs. End when the reader has the next useful action, link, or verification step.
