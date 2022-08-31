# For plugin authors

Aurelia 1 was released in 2015. In the years that have passed, an ecosystem of user-created libraries and plugins has been created. If you are a plugin author of a v1 plugin or looking to port over a plugin to v2, this is the section you are looking for.

Before proceeding, you should read through [the parent section](./) to understand the differences between v1 and v2.

In Aurelia 2, the `plugin` method you called in v1 is no more. Plugins in Aurelia 2 are no different to components and other resources. You pass them to the `register` method inside your bootstrap code to load them.

* computedFrom is gone
