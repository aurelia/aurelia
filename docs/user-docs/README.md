---
description: 'Get acquainted with Aurelia, the docs, and basic project setup.'
---

# Introduction

So, you've been scouring the internet and have managed to find yourself here, of all places. Now you're wondering, what is this thing called "Aurelia" that everyone's talking about?

{% hint style="success" %}
**Here's what you'll learn...**

* What is Aurelia?
* How do I use this documentation?
* How do I create an Aurelia project?
{% endhint %}

## What is Aurelia?

Aurelia is an open source, JavaScript, front-end platform, designed to enable you to build even the most demanding web, mobile, or desktop applications with ease. Aurelia stands out for its commitment to open web standards and its no-nonsense, get-out-of-your-way conventions that enable vanilla JavaScript development. Of course, Aurelia is also feature-packed, highly-performant, extensible to its core, and supports a fully-testable component-oriented design. But you knew all that already, didn't you? 😎 

## Using the Docs

Welcome to the Aurelia docs! Here you'll find guides, tutorials, API documentation, examples, reference, and more. We recommend that you begin your journey in the "Getting Started" section with our [Quick Start Guide](getting-started/quick-start-guide.md). There, you'll learn to build your first application, and be introduced to the basics of Aurelia. After you complete the quick start, we invite you to continue reading through the "Getting Started" section, where you'll learn the bulk of what is needed to get up and running with your own apps. Following that, we've prepared a section named "App Basics", and filled it with a variety of topics we think you'll find relevant as you begin to use Aurelia regularly. _Don't feel pressured to read this all on your first go._ Rather, we recommend that you skim the topic list so that you can easily jump in and out as you encounter different needs while you work.

Once you're feeling like you've got the hang of things, we've got a very special section for you, "Advanced Scenarios", which covers performance optimization, large-scale projects, UI architecture, and more. Like most documentation, we have detailed "API" reference on all of Aurelia's classes, methods, properties, etc. However, because Aurelia focuses on conventions and vanilla JavaScript, we think you'll find that you need the raw API docs less than you are used to with other frameworks or libraries. As an alternative, consider having a look through our "Examples" section, which includes code samples for common scenarios, designed to be copied from our docs and pasted into your own app. Perhaps you'll even come up with something neat you'd like to share with the community. 🎉 We'd love to have you contribute in any way you feel you can. If that's you, you'll want to check out the "Community Contributions" section. Finally, you'll find basic FAQ, browser support, and other resources in the aptly-named "Resources" area of our docs.

Should you find anything to be incorrect or missing as you read our documentation, every page has an "Edit on GitHub" link, so you can easily report or correct the issue. We hope your journey with us through this documentation will be an enjoyable one, and we look forward to seeing what you create with Aurelia!

## Creating Your First Aurelia App

There are various ways that you can setup an Aurelia project, including everything from adding a simple script tag to your HTML page to creating a custom [Webpack](https://github.com/aurelia/aurelia/tree/master/packages/webpack-loader) configuration. We think one of the easiest and most powerful ways to get started is by using the Aurelia CLI.

Before you run the CLI, you'll need a recent version of Node.js installed on your machine. Anything from version `8.9.0` or above should do the trick. If you don't have Node.js at all, you can [get it here.](https://nodejs.org/en/)

With Node.js installed, open a command prompt and run the following command:

```bash
npx au2 new
```

The CLI will then start the Aurelia project wizard, asking you a few questions to help you get things set up properly. When prompted, give your project a name and then select a default setup, either ESNext or TypeScript, depending on your preference. Finally, say "yes" to install the project dependencies.

That's all there is to creating a new project. You now have an Aurelia setup ready for you to run, debug, or deploy. To try it out, `cd` into your project folder and run `npx au2 start`. Your project will then build and a web browser will open, showing you the message "Hello World".

Congratulations! 🎊 You just ran your first Aurelia app. If you're feeling adventurous, have a look through the code in the `src` folder yourself to see how it's put together. Either way, you'll want to head on over to our [Quick Start Guide](getting-started/quick-start-guide.md) next, to begin learning the interesting details of building apps.

