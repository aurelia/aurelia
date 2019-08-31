# Writing Documentation

Greetings! We're so glad that you're interested in contributing to Aurelia's documentation. We'd love for you to join us in our quest to create great documentation, guidance, code examples, and more.

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

Articles are narrative-form content and come in two flavors: tutorials and guides. A guide introduces the reader to a topic, using a logical, progressive flow to explain relevant details. The goal for a guide is that the reader gain competence in the subject-matter by the time they finish reading the article. On the other hand, a tutorial is a step-by-step article that walks the reader through building a project. The goal for a tutorial is that the reader have a completed, functional project to show off by the end of the article.

Every article has several things in common:

* **Title** - An article has a clear, short title. The title is not only displayed at the top of the article, but also within the Table of Contents (ToC), index pages, and search results. It's also encoded in the page's metadata, which is used by search engines.
* **Description** - An article has a 1-3 sentence description, designed to help the reader understand whether it covers the material they are interested in. The description is displayed primarily on index pages. It's also used as a highly weighted input to the full-text site search and it's a key piece of metadata used by search engines.
* **Keywords** - Each article should have at least 2-3 keywords associated with it. This metadata is used to power the in-site search as well as in meta tags for external search engines.
* **Here's what you'll learn...** - At the top of every article, there's a bulleted list of what the reader will learn by the end of the article. This should be 3-5 high-level bullet points. They do NOT need to map directly to the sections within the document.
* **H2s** - Each article should be broken down into sections, delineated by level-2 headers. The headers should be clear, but short. They are displayed not only in the article itself, but also in the expanded ToC. Additionally, the full-text search indexes by section, allowing search results to deep-link to a particular section within a document. Articles MAY contain level-3 headers as well.
* **Next** - Each article has a "next link" which designates a single article to be read after the current article. We want to keep readers moving through the documentation as-a-whole, ensuring that they gain both broad and deep knowledge. The next article link will be displayed specially at the bottom of the article. It will also be encoded as link metadata in the document head for SEO purposes.
* **Additional Resources** (Optional) - If appropriate, articles MAY specify a set of additional resources for readers, including links to relevant HTML specifications, other articles, API Reference, code examples within the site, sandboxes, or any other item related to the current article content.

#### Article Syntax

Articles are composed of a [Yaml](https://yaml.org/) metadata header and [CommonMark](https://commonmark.org/) Markdown body. Aurelia also interprets a few Markdown constructs specially, in order to create its site experience.

// TODO: Explain special syntax.

### API Reference

API Reference is descriptive documentation that accompanies each class, method, and property of the framework. The purpose of this documentation is to show the reader how to correctly use a specific API. Often times, key APIs are accompanied by a short example, demonstrating correct usage for a common use case.

API reference documentation is written inline within the code, using [TSDoc](https://github.com/Microsoft/tsdoc) syntax. Examples can be written inline using the `@example` tag.

### Code Examples

These are code-focused documents that demonstrates a solution for a specific task. e.g. "Configuring Auth-Protected Routes". A code example MUST have a title and MAY have a 1-5 sentence explanation. Importantly, code examples should be designed, as much as possible, to be copy->paste->modified by readers who need a fast, task-oriented solution for their own project.

## Docs Organization

The documentation is organized into seven major sections, all available through a single `Docs` link in the main site navigation:

* **Getting Started** - These are guides and tutorials oriented towards a person's first encounter with Aurelia. They teach the foundational topics needed to get them up and running with the framework. After reading these docs, a person should feel comfortable creating a new project and building a small-scale application on their own.
* **App Building Basics** - These are primarily guides covering topics relevant to someone who has started building a production app. They introduce additional topics beyond those in the "getting started" section, but also go deeper in areas previously covered. After reading these articles, a person should feel confident that they can tackle most front-end challenges and particularly that they know what is needed to build their specific app.
* **Advanced Scenarios** - These are guides that cover more advanced topics, such as architecture, framework extensibility, performance optimization, etc. Someone should not need to read these docs to accomplish the majority of their use cases. They are designed to be read "as needed" in conjunction with more complex, real-world situations they encounter.
* **API Reference** - This section of the ToC brings up a page where every class, function, constant, etc. is listed. The page will group these APIs by package. The API reference for a given class will be contained within a single page. This content is generated from source code.
* **Code Examples** - This section provides access to code examples as described above.
* **Community Contributions** - These articles include our basic contribution guide and code of conduct, along with a version of this doc and a subset of our engineering notes, designed to help people start contributing quickly and with confidence.
* **Resources** - This is a collection of articles that address common questions and provide more information around the project itself.

Each of these sections is represented in the ToC as a bold section delimiter. Articles and Packages are listed after each section, not nested. When an article is clicked on, it expands inline to show its level-2 headings, nested under the article name. API reference does not expand inline.
