---
description: Join us in making Aurelia's docs better for everyone!
---

# Writing Documentation

Greetings! We're so glad that you're interested in contributing to Aurelia's documentation. 🙏 We'd love for you to join us on our journey to create outstanding guides, tutorials, API references, and code examples that enhance the experience for everyone. This guide provides instructions to help you write clear and consistent documentation.

{% hint style="success" %}
**Here's what you'll learn:**

- The fundamental types of documentation and their purposes.
- How to contribute to each type of documentation.
- The custom syntax used across our docs, including GitBook-friendly tags.
- The overall structure and organization of our documentation.
{% endhint %}

## Documentation Types

Our documentation is divided into three core types:

- **Articles** (tutorials and guides)
- **API Reference**
- **Code Examples**

### Articles

Articles provide narrative content and come in two main flavors:

- **Guides:** These offer a logical, progressive flow of information, helping readers gain competence in a topic by the end of the article.
- **Tutorials:** These are step-by-step instructions that walk the reader through building a project, ensuring a completed and functional outcome.

Every article should include the following elements:

- **Title:** A clear and concise title that appears at the top of the article, within the Table of Contents (ToC), and in search results. It's also embedded in the page metadata for SEO.
- **Description:** A brief sentence or fragment to let readers know what the article covers.
- **Introduction:** A short overview (3–5 sentences) providing context and outlining the article's content.
- **Headers:** Articles should be divided into sections using level-1 headers (H1) with optional level-2 and level-3 subheaders for additional structure.
- **Additional Resources (Optional):** When applicable, include a list of resources (e.g., links to HTML specifications, related articles, API references, code examples, sandboxes, etc.) within an info hint block for clarity. For example:

{% hint style="info" %}
- [Example Specification](#)
- [Related Article](#)
{% endhint %}

#### Article Syntax

Articles begin with a YAML metadata header followed by a [CommonMark](https://commonmark.org/) Markdown body. Aurelia's docs also support some custom Markdown extensions that enhance the reader's experience. For example, you can use GitBook-friendly hint blocks such as:

- **Hint Blocks:** `{% hint style="info" %}`, `{% hint style="warning" %}`, and `{% hint style="success" %}` to emphasize important notes, alerts, or achievements.
- **Callouts:** To draw attention to key information.

These syntaxes allow you to include interactive components (like dynamic code examples) or highlight resources more effectively. For more details, please refer to the [GitBook documentation](https://docs.gitbook.com/).

### API Reference

The API Reference provides descriptive documentation for each class, method, or property in the framework. Its main goal is to show users how to correctly utilize a specific API, often complemented by an inline example using the `@example` tag. API reference documentation is integrated directly into the source code via [TSDoc](https://github.com/Microsoft/tsdoc) syntax.

### Code Examples

These documents are code-focused guides that demonstrate solutions to specific tasks (e.g., "Configuring Auth-Protected Routes"). Each code example must have a title and may include a brief explanation (1–5 sentences). They are designed for quick copy-paste modifications by readers addressing task-oriented needs.

## Docs Organization

The documentation is organized into seven main sections, accessible via the `Docs` link in the main navigation:

- **Getting Started:** Guides and tutorials for newcomers covering essential topics to kickstart your Aurelia experience.
- **App Basics:** Detailed guides for building production applications, addressing more advanced challenges beyond the basics.
- **Advanced Scenarios:** In-depth guides covering complex topics such as application architecture, extensibility, and performance optimization. These docs are meant to be used as needed.
- **API:** A comprehensive list of every class, function, and constant grouped by package. The content is generated directly from the source code.
- **Examples:** A categorized collection of code examples (e.g., routing, templating) that offer rapid, task-specific solutions.
- **Community Contribution:** Includes our contribution guidelines, code of conduct, and supplementary engineering notes to help you start contributing quickly and confidently.
- **Resources:** A collection of articles addressing common questions and providing further insight into the project.

## GitBook Tags and Best Practices

When writing documentation for Aurelia on GitBook, consider using the following GitBook-friendly tags and practices:

- **Hint Blocks:**
  Use `{% hint style="info" %}` for additional context, `{% hint style="warning" %}` for cautionary notes, and `{% hint style="success" %}` to highlight achievements.

- **Callout Boxes:**
  Employ callout blocks to draw attention to crucial information or useful tips.

- **Code Blocks:**
  Wrap code examples in triple backticks with the appropriate language identifier (e.g., ` ```javascript `) to enable syntax highlighting.

Adhering to these conventions ensures that your documentation remains consistent, engaging, and easy to navigate.
