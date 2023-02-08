---
description: A guide on working with the Aurelia Store plugin.
---

# Store

This guide aims to help you become familiar with the Aurelia Store plugin, a means of managing state in your Aurelia applications.

## When should you use state management?

Before we delve too deeply into Aurelia Store and how it can help manage the state in your Aurelia applications, we should discuss when to use state management and when not to.

* When you need to reuse data in other parts of your application — State management shines when it comes to helping keep your data organized for cross-application reuse.
* When dealing with complex data structures — An ephermal state is great for simple use cases. Still, when working with complex data structures (think multi-step forms or deeply structured data), state management can help keep it consistent.
* For apps that require the ability to undo or replay data — Because Javascript passes everything by default, passing objects and modifying them can cause complications, especially if you need to undo changes made to an object or redo them. Aurelia Store can help you implement undo/redo functionality.
* For debugging — State management is exceptionally helpful when you want to see what is happening with your data. Mutating objects directly leaves no trail, so they are fragile and hard to debug. You can see what data is being mutated through your actions in the Redux Inspector extension for your browser.

## Aurelia Store guides

Please visit one or more of the following sections to learn about the Aurelia Store plugin. If you want to know how to install and configure it, head to the [Configuration and setup page](configuration-and-setup.md) first.

{% content-ref url="broken-reference" %}
[Broken link](broken-reference)
{% endcontent-ref %}
