# Building a drag & drop Kanban board

{% hint style="danger" %}
This tutorial is a work in progress and not yet complete.
{% endhint %}

## What we will be building

We will be creating a Kanban-style interface with columns where items can be dragged between each column. This will showcase how Aurelia's reactive binding system can work with drag and drop libraries without the need for installing any additional packages.

## Prerequisites

Before going any further, you should be familiar with some basic Aurelia concepts as well as some fundamental Javascript ones as well. While these are not hard prerequisites, please know that some concepts used in this tutorial out of context might be confusing or difficult to understand.

* You have familiarized yourself with the [Aurelia template syntax](../getting-to-know-aurelia/introduction/).
* You have familiarized yourself with [components in Aurelia](../getting-to-know-aurelia/components/).
* You are familiar with [Dependency Injection](../getting-to-know-aurelia/dependency-injection-di.md). You don't need to be a master of it, just familiar with its existence and why it matters in Aurelia.

## Create the app

When creating a new Aurelia 2 application, it is considered best practice to use the CLI. You can simply type `npx makes aurelia` to do this, but for the purposes of this tutorial, we are going to give you the shorthand syntax to do this faster.

```bash
npx makes aurelia aurelia-2-kanban -s dev,typescript,css-module
```

For this tutorial application, we will be using TypeScript for writing our view models and CSS Modules for our CSS to keep things neat. If you are interested in using Shadow DOM, please see our other tutorial [Building a realtime cryptocurrency price tracker](building-a-realtime-cryptocurrency-price-tracker.md) to see Shadow DOM in action.

We now have the barebones Aurelia starter for the basis of our dashboard application.

