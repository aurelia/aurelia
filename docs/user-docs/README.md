# User Documentation

This folder contains documentation targeted at people who are using Aurelia to create applications, component libraries, and plugins. For documentation on how to build or work on Aurelia itself, see our [engineering notes](../engineering-notes/README.md).

> What you'll learn...
> * What are the three types of documentation?
> * How do I contribute to each type of documentation?
> * What syntax is used throughout the documentation?
> * How is the documentation organized?

## Documentation Types

The three fundamental types of documentation are **articles**, **API reference**, and **recipes**.

### Articles

Articles are narrative-form content and come in two flavors: tutorials and guides. A guide introduces the reader to a topic, using a logical, progressive flow to explain relevant details. The goal for a guide is that the reader gain competence in the subject-matter by the time they finish reading the article. On the other hand, a tutorial is a step-by-step article that walks the reader through building a project. The goal for a tutorial is that the reader have a completed, functional project to show off by the end of the article.

Every article has several things in common:

* **Title** - An article has a clear, short title. The title is not only displayed at the top of the article, but also within the Table of Contents (ToC), index pages, and search results. It's also encoded in the page's metadata, which is used by search engines.
* **Description** - An article has a 1-3 sentence description, designed to help the reader understand whether it covers the material they are interested in. The description is displayed primarily on index pages. It's also used as a highly weighted input to the full-text site search and it's a key piece of metadata used by search engines.
* **What you'll learn...** - At the top of every article, there's a bulleted list of what the reader will learn by the end of the article. This should be 3-5 high-level bullet points. They do not need to map directly to the sections within the document.
* **H2s** - Each article should be broken down into sections, delineated by level-2 headers. The headers should be clear, but short. They are displayed not only in the article itself, but also in the expanded ToC. Additionally, the full-text search indexes by section, allowing search results to deep-link to a particular section with in a document.
* **Next** - Each article has a "next link" which designate a single article to be read after the current article. We want to keep readers moving through the documentation as-a-whole, ensuring that they gain both broad and deep knowledge. The next article link will be displayed specially at the bottom of the article. It will also be encoded as link metadata in the document head for SEO purposes.
* **Additional Resources** (Optional) - If appropriate, articles may specify a set of additional resources for readers, including links to relevant HTML specifications, other articles, API Reference, or recipes within the site, sandboxes, or any other item related to the current article content.

#### Article Syntax

// TODO

### API Reference

API Reference is descriptive documentation that accompanies each class, method, and property of the framework. The purpose of this documentation is to show the reader how to properly use a specific API. Often times, key APIs are accompanied by a short example, demonstrating correct usage for a common use case.

API reference documentation is written inline within the code, using [TSDoc](https://github.com/Microsoft/tsdoc) syntax. Examples can be written inline using the `@example` tag or recipes can be inlined using the `@recipe` tag to point to a recipe document.

// TODO Provide example of how to use `@recipe` once it has been written.

### Recipes

Recipes are code-focused documentation that demonstrate solutions for specific tasks. e.g. How to configure auth-protected routes.

## Docs Organization

The documentation is organized into seven major sections, all available through a single `Docs` link in the main site navigation:

* **Foundations** - These are guides and tutorials oriented towards a person's first encounter with Aurelia. They teach the foundational topics needed to get them up and running with the framework. After reading these docs, a person should feel comfortable creating a new project and building a small-scale application on their own.
* **Essentials** - These are primarily guides covering topics relevant to someone who has started building a production app. They introduce additional topics beyond Foundations, but also go deeper in areas previously covered by Foundations. After reading these articles, a person should feel confident that they can tackle most front-end challenges and particularly that they know what is needed to build their specific app.
* **Mastery** - These are guides that cover more advanced topics, such as architecture, framework extensibility, performance optimization, etc.
* **API Reference** - This section of the ToC contains an entry for each shippable package. The API reference for a give package should all be contained within a single page. This content is generated from source code.
* **Recipes** - This section provides access to code examples and recipes as described above.
* **Contributing** - This includes our basic contribution guide and code of conduct, along with a version of this doc and a subset of our engineering notes, designed to help people start contributing quickly and with confidence.
* **FAQ** - This section has various articles that address common questions and provides more information around the project itself.

Each of these sections is represented in the ToC as a bold section delimiter. Articles and Packages are listed below each section. When an article is clicked on, it expands inline to show its level-2 headings. API reference does not expand inline. Instead, it has an in-page sub-ToC.

### WIP vNext ToC

* Foundations
  * Introduction [Guide]
    * What is Aurelia?
    * How to use these docs.
    * Installation
    * Hello World
  * Building a TodoApp [Tutorial]
  *
  *
* Essentials
  * Managing Application State
  * Securing Your App
  * Integrating 3rd Party Libraries
  *
  *
* Mastery
  * UI Modeling with Composite MVVM
  * Extending the Template Compiler
  * Extending the Binding Engine
  *
  *
* API Reference
  * CLI Command Reference
  * Core Framework
    * @aurelia/kernel
    * @aurelia/jit
    * ...
  * Plugins
    * @aurelia/fetch
    * @aurelia/router
    * @aurelia/store
    * ...
* Recipes
  * Configuring Auth-Protected Routes
  * ...
* Contributing
  * Contributor's Guide
  * Building and Testing Aurelia
  * Writing Documentation
* FAQ
  * Framework Comparison
  * Versioning Policy
  * Migrating to Aurelia 2.0
  * Glossary
