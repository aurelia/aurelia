---
description: 'Get acquainted with Aurelia, the documentation, and the basic project setup.'
---

# Introduction

So, you've been scouring the internet and have managed to find yourself here, of all places. Now you're wondering, what is this thing called "Aurelia" that everyone's talking about?

{% hint style="success" %}
**Here's what you'll learn...**

* What is Aurelia?
* How do I use this documentation?
* How do I contribute to the community?
* How do I create an Aurelia project?
{% endhint %}

## What is Aurelia?

Aurelia is an open-source, JavaScript, front-end platform, designed to enable you to easily build even the most demanding web, mobile, or desktop applications. Aurelia stands out for its commitment to open web standards and its no-nonsense, get-out-of-your-way conventions that enable vanilla JavaScript development. Of course, Aurelia is also packed full of features, performs at the highest standards, extensible to its core, and supports a fully-testable component-oriented design. But you knew all that already, didn't you? 😎 

To get started right now, jump to our Quick Start Guide, or read on to get more of an overview.

{% page-ref page="getting-started/quick-start-guide.md" %}

## Using the Docs

Welcome to the Aurelia docs! This is where you will find guides, tutorials, API documentation, examples, resources, and more. We recommend that you begin your journey in the "Getting Started" section with the [Quick Start Guide](getting-started/quick-start-guide.md) where you will learn to build your first application and be introduced to the basics of Aurelia. After you complete the Quick Start, you should continue reading through the "Getting Started" section where you will learn the bulk of what is needed to get up and running with your own apps. Next, the "App Basics" section is filled with a variety of topics to help you begin to use Aurelia on a regular basis.

Once you feel more comfortable using the product, the "Advanced Scenarios" section covers performance optimization, large-scale projects, UI architecture, and more. There is also a detailed "API" reference for all of Aurelia's classes, methods, and properties, although it is likely that you will find that you will not need the raw API documentation as much as with other frameworks or libraries since Aurelia focuses on conventions and vanilla JavaScript. Instead, you might find the "Examples" section more helpful since it includes code samples for common scenarios that can be copied and pasted into your own app. Also, the "Resources" section includes a basic FAQ, information about browser support, versioning, comparisons to other frameworks and various other information you might find useful.

If you happen to find anything in the documentation that is incorrect or missing, every page has an "Edit on GitHub" link that you can use to easily report or correct the issue.

## How to Be Part of the Community

As you become more and more familiar with Aurelia, perhaps you will even come up with something that you would like to share with the community. 🎉 The Aurelia team welcomes any contributions that you feel would be beneficial to others in the community. If that is the case, check out the "Community Contributions" section. We also welcome any feedback or suggestions that will help improve the product and enrich the community. Check out the "[Contributor Guide](https://app.gitbook.com/@aurelia-1/s/aurelia/~/edit/drafts/-LqkvcyEElnC_WdxU2ER/community-contribution/contributor-guide)" for details about the contributing process and how to contact us. 

## Creating Your First Aurelia App

There are various ways that you can set up an Aurelia project, including everything from adding a simple script tag to your HTML page to creating a custom [Webpack](https://github.com/aurelia/aurelia/tree/master/packages/webpack-loader) configuration. One of the easiest and most powerful ways to get started is by using [the `makes` tool.](https://github.com/aurelia/new)

Before you run `makes`, you will need a recent version of Node.js installed on your machine \(version `8.9.0` or above should work\). If you do not have Node.js, you can [get it here.](https://nodejs.org/en/)

With Node.js installed, open a command prompt and run the following command:

```bash
npx makes aurelia
```

`makes` will then start the Aurelia project wizard, asking you a few questions to help you get things set up properly. When prompted, give your project a name and then select a default setup, either ESNext or TypeScript, depending on your preference. Finally, click "yes" to install the project dependencies.

You now have an Aurelia setup ready for you to run, debug, or deploy. To try it out, `cd` into your project folder and run `npm start`. Your project will then build and a web browser will open, displaying the message "Hello World".

Congratulations! 🎊 You just ran your first Aurelia app. If you want to see how it is structured, you can look at the code in the `src` folder. Regardless, it is recommended that the next thing that you do is read the [Quick Start Guide](getting-started/quick-start-guide.md) to begin learning details about building apps.

