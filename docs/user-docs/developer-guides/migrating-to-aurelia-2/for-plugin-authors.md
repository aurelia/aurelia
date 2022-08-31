# For plugin authors

Aurelia 1 was released in 2015. In the years that have passed, an ecosystem of user-created libraries and plugins has been created. If you are a plugin author of a v1 plugin or looking to port over a plugin to v2, this is the section you are looking for.

Before proceeding, you should read through [the parent section](./) to understand the differences between v1 and v2.

In Aurelia 2, the `plugin` method you called in v1 is no more. Plugins in Aurelia 2 are no different to components and other resources. You pass them to the `register` method inside your bootstrap code to load them.

There are numerous ways you can create Aurelia 2 plugins or port over v1 plugins. However, the easiest reference point is to look at how other plugins have been ported over to Aurelia 2.

Please keep in mind these are third-party plugins, and the Aurelia team claims no responsibility for the quality and safety of the code. Use them as a reference point for your own Aurelia 2 plugins, but use precaution.

* [Cardigan UI](https://github.com/Vheissu/au-cardigan-ui)
* [Aurelia 2 Table](https://github.com/Vheissu/aurelia2-table)
* [Aurelia 2 Auth](https://github.com/Vheissu/aurelia2-auth)
* [Aurelia 2 Google Maps](https://github.com/Vheissu/aurelia2-google-maps)
