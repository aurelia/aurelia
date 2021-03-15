---
description: The basic and not so basic fundamentals of routing in Aurelia.
---

# Fundamentals

### Getting Started

The Aurelia Router is included in the Aurelia package, which means when you create a new Aurelia project or `npm install aurelia` you are also installing the router package alongside it.

It is important to know that Aurelia's router is unlike most traditional routing packages in that it supports multiple routing modes \(three to be exact\) and they can all be used together.

All routing modes rely on the presence of a `<au-viewport></au-viewport>` element pair where components are rendered/projected from the router. The contents of `au-viewport` gets replaced with whatever route is being loaded.

### Routing Modes \(explained\)

#### Direct Routing

Direct routing is zero-configuration convention-based routing. This means you can route to components within your Aurelia applications by simply referencing them by name, no need to create convoluted objects or call API's: just components.

Understandably, despite the simplicity of Direct Routing, it's a new paradigm for developers to learn. For so long, routers have always used the tried and tested array of objects approach. Letting the framework handle your routing for you is liberating, but an uncommon feeling.

To use the direct router, all you have to do is ensure your components have been registered with Dependency Injection. An easy way you can do this is using the `<import>` element inside of your views. You can also specify dependencies on the custom element itself \(using the decorator\) or inside of your main file which instantiates Aurelia.

#### Component Configured Routing

In many ways, component configured routing is just Direct Routing with the ability to specify router configuration settings on a per-component basis. If this sounds confusing to you, think of it this way. The Direct Router can be used without writing a single line of configuration code, but you can specify the names of your route parameters from within components. 

#### Configured Routing

This is the routing style most developers are accustomed to. Whether it is Aurelia v1 routing, Express.js routing or routing in other front-end frameworks and libraries, configured routing is the traditional routing approach where you define an array of routing objects.



