---
description: >-
  Learn about an alternative routing option available in the Aurelia router that
  offers zero-configuration routing.
---

# Direct Routing

The Aurelia router supports different ways of routing. In sections such as Creating Routes, we talk about configured routes, which require you to map out your routes ahead of time and have an understanding of how things are mapped. With direct routing, the router works on the basis of zero-configuration routing.

It might sound like some kind of developer-hype, but zero-configuration routing in the form of direct routing allows you to route in your application without configuring your routes. Think of the direct router as a form of dynamic composition for routing.

By default, you don't need to tell the router you want to use direct routing. Instead of referencing route names or paths, you reference component names.

## Direct Routing explained in code

A picture is worth a thousand words, so let's go through the makeup of a direct router-based Aurelia application. Fortunately, for us, by choosing "direct routing" when prompted via `npx makes aurelia` we will have an application that uses direct routing by default.
