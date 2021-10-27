---
description: Join us in making Aurelia's docs better for everyone!
---

# Writing documentation

Greetings! We're so glad that you're interested in contributing to Aurelia's documentation. :pray: We'd love for you to join us in our quest to create great documentation, guidance, code examples, and more. To assist you in this effort, we've created this guide to writing documentation.

{% hint style="success" %}
**Here's what you'll learn...**

* What are the three types of documentation?
* How do I contribute to each type of documentation?
* What syntax is used throughout the documentation?
* How is the documentation organized?
{% endhint %}

## Documentation Types

The three fundamental types of documentation are **articles**, **API reference**, and **code examples**.

### Articles

Articles are narrative-form content and come in two flavors: _tutorials_ and _guides_. A guide introduces the reader to a topic, using a logical, progressive flow to explain relevant details. The goal for a guide is that the reader gain competence in the subject-matter by the time they finish reading the article. On the other hand, a tutorial is a step-by-step article that walks the reader through building a project. The goal for a tutorial is that the reader have a completed, functional project to show off by the end of the article.

Every article has several things in common:

* **Title** - An article has a clear, short title. The title is not only displayed at the top of the article, but also within the Table of Contents (ToC), index pages, and search results. It's also encoded in the page's metadata, which is used by search engines.
* **Description** - An article has a 1 sentence or short fragment description, designed to help the reader understand whether it covers the material they are interested in. The description is displayed at the top of the article and on some index pages.
* **Introduction** - A short 3 - 5 sentence introduction to the article. It should be immediately followed by the "Here's what you'll learn..." box.
* **Here's what you'll learn...** - At the top of every article, there's a bulleted list of what the reader will learn by the end of the article. This should be 3-5 high-level bullet points. They do NOT need to map directly to the sections within the document. Use a Hint Box with the "success" style to contain the the list.
* **H1s** - Each article should be broken down into major sections, delineated by level-1 headers. The headers should be clear, but short. They are displayed not only in the article itself, but also in the in-page ToC. Additionally, the full-text search indexes by section, allowing search results to deep-link to a particular section within a document. Articles MAY contain level-2 and level-3 headers as well.
* **Additional Resources** (Optional) - If appropriate, articles MAY specify a set of additional resources for readers, including links to relevant HTML specifications, other articles, API Reference, code examples within the site, sandboxes, or any other item related to the current article content. Use a Hint Box with the "info" style to contain the resources, and a bulleted list for the links.

#### Article Syntax

Articles are composed of a [Yaml](https://yaml.org) metadata header and [CommonMark](https://commonmark.org) Markdown body. Aurelia also interprets a few Markdown constructs specially, in order to create its site experience.

// TODO: Explain special syntax.

### API Reference

API Reference is descriptive documentation that accompanies each class, method, and property of the framework. The purpose of this documentation is to show the reader how to correctly use a specific API. Often times, key APIs are accompanied by a short example, demonstrating correct usage for a common use case.

API reference documentation is written inline within the code, using [TSDoc](https://github.com/Microsoft/tsdoc) syntax. Examples can be written inline using the `@example` tag.

### Code Examples

These are code-focused documents that demonstrates a solution for a specific task. e.g. "Configuring Auth-Protected Routes". A code example MUST have a title and MAY have a 1-5 sentence explanation. Importantly, code examples should be designed, as much as possible, to be copy->paste->modified by readers who need a fast, task-oriented solution for their own project.

## Docs Organization

The documentation is organized into seven major sections, all available through a single `Docs` link in the main site navigation:

* **Getting Started** - These are guides and tutorials oriented towards a person's first encounter with Aurelia. They teach the foundational topics needed to get them up and running with the framework. After reading these docs, a person should feel comfortable creating a new project and building a small-scale application on their own.
* **App Basics** - These are primarily guides covering topics relevant to someone who has started building a production app. They introduce additional topics beyond those in the "Getting Started" section, but also go deeper in areas previously covered. After reading these articles, a person should feel confident that they can tackle most front-end challenges and particularly that they know what is needed to build their specific app.
* **Advanced Scenarios** - These are guides that cover more advanced topics, such as architecture, framework extensibility, performance optimization, etc. Someone should not need to read these docs to accomplish the majority of their use cases. They are designed to be read _as needed_ in conjunction with more complex, real-world situations they encounter.
* **API** - This section of the ToC brings up a page where every class, function, constant, etc. is listed. The page will group these APIs by package. The API reference for a given class will be contained within a single page. This content is generated from source code.
* **Examples** - This section provides access to code examples as described above. The examples are organized into categories such as "routing", "templating", etc.
* **Community Contribution** - These articles include our basic contribution guide and code of conduct, along with a version of this doc and a subset of our engineering notes, designed to help people start contributing quickly and with confidence.
* **Resources** - This is a collection of articles that addresses common questions and provides more information around the project itself.
