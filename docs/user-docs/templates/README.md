# Aurelia Templates

Welcome to the Aurelia templating documentation! This guide covers everything you need to build dynamic, interactive UIs with Aurelia's powerful templating system.

## Quick Start

New to Aurelia templates? Start here:

1. **[Cheat Sheet](CHEAT_SHEET.md)** - Quick syntax reference for all template features
2. **[Template Syntax Overview](template-syntax/overview.md)** - Core concepts and features
3. **[Real-World Recipes](recipes/README.md)** - Complete working examples

## How Do I...?

Find what you need quickly with this task-based guide:

### Display Data

- **Show dynamic text?** → [Text Interpolation](template-syntax/text-interpolation.md) - Use `${property}`
- **Bind to element properties?** → [Attribute Binding](template-syntax/attribute-binding.md) - Use `.bind`, `.to-view`, `.two-way`
- **Format data for display?** → [Value Converters](value-converters.md) - Use `${value | converter}`
- **Show/hide elements?** → [Conditional Rendering](conditional-rendering.md) - Use `if.bind` or `show.bind`

### Work with Lists

- **Loop through an array?** → [List Rendering](repeats-and-list-rendering.md) - Use `repeat.for="item of items"`
- **Get the current index?** → [List Rendering: Contextual Properties](repeats-and-list-rendering.md#contextual-properties) - Use `$index`, `$first`, `$last`
- **Handle empty lists?** → [Conditional Rendering](conditional-rendering.md) - Combine `if.bind="items.length === 0"` with `else`
- **Optimize large lists?** → [List Rendering: Performance](repeats-and-list-rendering.md#performance-optimization-with-keys) - Use `key.bind` or `key:`

### Handle User Input

- **Capture button clicks?** → [Event Binding](template-syntax/event-binding.md) - Use `click.trigger="method()"`
- **Handle keyboard input?** → [Event Binding: Keyboard Events](template-syntax/event-binding.md#keyboard-key-mappings-and-custom-modifiers) - Use `keydown.trigger:enter="submit()"`
- **Create two-way form bindings?** → [Forms](forms/README.md) - Use `value.bind="property"`
- **Prevent default behavior?** → [Event Binding: Modifiers](template-syntax/event-binding.md#event-modifiers-enhancing-event-handling) - Use `click.trigger:prevent="method()"`
- **Debounce rapid input?** → [Event Binding: Binding Behaviors](template-syntax/event-binding.md#throttling-and-debouncing-event-handlers) - Use `input.trigger="search() & debounce:300"`

### Conditional Logic

- **Show content based on a condition?** → [Conditional Rendering: if.bind](conditional-rendering.md#using-ifbind)
- **Toggle visibility frequently?** → [Conditional Rendering: show.bind](conditional-rendering.md#using-showbind)
- **Handle multiple conditions?** → [Conditional Rendering: switch.bind](conditional-rendering.md#using-switchbind)
- **Show if/else branches?** → [Conditional Rendering: else](conditional-rendering.md#ifelse-structures) - Use `else` after `if.bind`

### Styling

- **Apply dynamic CSS classes?** → [Class & Style Binding](class-and-style-bindings.md)
- **Bind inline styles?** → [Class & Style Binding](class-and-style-bindings.md)
- **Toggle classes conditionally?** → [Class & Style Binding](class-and-style-bindings.md)

### Components

- **Use a component in my template?** → [Component Basics: Importing](../components/components.md#importing-components) - Use `<import from="./my-component"></import>`
- **Make a component available globally?** → [Component Basics: Global Registration](../components/components.md#global-registration)
- **Pass data to a component?** → [Bindable Properties](../components/bindable-properties.md) - Use `@bindable` and bind in parent
- **Get a reference to an element?** → [Template References](template-syntax/template-references.md) - Use `ref="elementName"`
- **Slot content into a component?** → [Slotted Content](../components/shadow-dom-and-slots.md)

### Forms

- **Build a form?** → [Forms: Basic Inputs](forms/README.md#basic-input-binding)
- **Validate form input?** → [Validation Plugin](../aurelia-packages/validation/README.md)
- **Handle form submission?** → [Forms: Submission](forms/submission.md)
- **Work with checkboxes?** → [Forms: Collections](forms/collections.md#boolean-checkboxes)
- **Handle file uploads?** → [Forms: File Uploads](forms/file-uploads.md)

### Advanced

- **Create reusable template behaviors?** → [Custom Attributes](custom-attributes.md)
- **Transform data in templates?** → [Value Converters](value-converters.md)
- **Control binding behavior?** → [Binding Behaviors](binding-behaviors.md)
- **Work with promises?** → [Template Promises](template-syntax/template-promises.md) - Use `promise.bind`
- **Create local template variables?** → [Template Variables](template-syntax/template-variables.md) - Use `<let>`
- **Change binding context for a section?** → [`with.bind`](with.md)
- **Bind element focus state?** → [`focus`](focus.md) - Use `focus.bind`
- **Spread config objects / forward captured attrs?** → [Spread operators](spread-binding.md) - Use `...$bindables` / `...$attrs`
- **Render markup elsewhere in the DOM?** → [Portalling elements](../getting-to-know-aurelia/portalling-elements.md) - Use `portal`
- **Compose components dynamically?** → [Dynamic composition](../getting-to-know-aurelia/dynamic-composition.md) - Use `<au-compose>`
- **Work with SVG?** → [SVG](svg.md)
- **Use lambda expressions?** → [Lambda Expressions](lambda-expressions.md)

## Documentation Structure

### Core Concepts

- **[Template Syntax Overview](template-syntax/overview.md)** - Start here for the big picture
- **[Cheat Sheet](CHEAT_SHEET.md)** - Quick reference for all syntax

### Template Syntax

- **[Text Interpolation](template-syntax/text-interpolation.md)** - Display data with `${}`
- **[Attribute Binding](template-syntax/attribute-binding.md)** - Bind to element properties and attributes
- **[Event Binding](template-syntax/event-binding.md)** - Handle user interactions
- **[Template References](template-syntax/template-references.md)** - Access DOM elements with `ref`
- **[Template Variables](template-syntax/template-variables.md)** - Create local variables with `<let>`
- **[`with.bind`](with.md)** - Re-scope a section to an object
- **[Template Promises](template-syntax/template-promises.md)** - Handle async data with `promise.bind`
- **[Spread operators](spread-binding.md)** - Bindables spreading and attribute transferring
- **[Globals](globals.md)** - Built-in global functions and values

### Display Logic

- **[Conditional Rendering](conditional-rendering.md)** - Show/hide content with `if`, `show`, `switch`
- **[List Rendering](repeats-and-list-rendering.md)** - Loop over data with `repeat.for`
- **[Class & Style Bindings](class-and-style-bindings.md)** - Dynamic CSS

### Data Transformation

- **[Value Converters](value-converters.md)** - Format and transform data (like pipes)
- **[Binding Behaviors](binding-behaviors.md)** - Control binding flow (debounce, throttle, etc.)

### Forms & Input

- **[Forms Overview](forms/README.md)** - Working with form inputs
- **[Form Collections](forms/collections.md)** - Checkboxes, radios, multi-select
- **[Form Submission](forms/submission.md)** - Submit forms and handle user feedback
- **[File Uploads](forms/file-uploads.md)** - Handle file inputs and uploads
- **[Validation Plugin](../aurelia-packages/validation/README.md)** - Validate user input

### Extensibility

- **[Custom Attributes](custom-attributes.md)** - Create reusable template behaviors
- **[Advanced Custom Attributes](advanced-custom-attributes.md)** - Complex attribute patterns

### Other Features

- **[Lambda Expressions](lambda-expressions.md)** - Arrow functions in templates
- **[Local Templates](local-templates.md)** - Inline component definitions
- **[SVG](svg.md)** - Working with SVG elements

### Real-World Examples

- **[Recipes](recipes/README.md)** - Complete, production-ready examples
  - [Product Catalog](recipes/product-catalog.md) - Search, filter, sort
  - [Shopping Cart](recipes/shopping-cart.md) - Add/remove items, calculate totals
  - More coming soon—follow the contribution guide in the recipes index to share yours!

## Learning Path

Not sure where to start? Follow this path:

### Beginner

1. Read **[Template Syntax Overview](template-syntax/overview.md)**
2. Learn **[Text Interpolation](template-syntax/text-interpolation.md)** and **[Attribute Binding](template-syntax/attribute-binding.md)**
3. Try **[Event Binding](template-syntax/event-binding.md)** for interactivity
4. Practice with **[Product Catalog Recipe](recipes/product-catalog.md)**

### Intermediate

5. Master **[Conditional Rendering](conditional-rendering.md)** (`if`, `show`, `switch`)
6. Learn **[List Rendering](repeats-and-list-rendering.md)** (`repeat.for`)
7. Explore **[Value Converters](value-converters.md)** for data formatting
8. Build forms with **[Forms Guide](forms/README.md)**
9. Try **[Shopping Cart Recipe](recipes/shopping-cart.md)**

### Advanced

10. Create **[Custom Attributes](custom-attributes.md)**
11. Use **[Binding Behaviors](binding-behaviors.md)** for fine control
12. Work with **[Template Promises](template-syntax/template-promises.md)**
13. Explore **[Advanced Custom Attributes](advanced-custom-attributes.md)**
14. Adapt real-world patterns from the **[Template Recipes collection](recipes/README.md)**

## Performance Tips

- Use `.to-view` binding for display-only data
- Add `key` to `repeat.for` for dynamic lists
- Use `show.bind` for frequent visibility toggles
- Use `if.bind` for infrequent changes
- Debounce rapid input events
- Keep expressions simple - move logic to view model

## Common Pitfalls

- **Components not appearing?** → Don't forget `<import from="./component"></import>` (or register globally)
- **Array changes not detected?** → Use array methods like `push()`, `splice()`, not direct index assignment
- **Form input not updating?** → Use `.bind` or `.two-way`, not `.to-view`
- **Performance issues with large lists?** → Add `key.bind` or `key:` to `repeat.for`
- **Bindings not working?** → Check for typos in property names and binding commands

## Need Help?

- Check the **[Cheat Sheet](CHEAT_SHEET.md)** for quick syntax reference
- Browse **[Recipes](recipes/README.md)** for complete examples
- Review **[Template Syntax Overview](template-syntax/overview.md)** for core concepts
- Search the "How Do I...?" section above
- Visit [Aurelia Discourse](https://discourse.aurelia.io/) for community support
- Check [GitHub Issues](https://github.com/aurelia/aurelia/issues) for known issues

## Related Documentation

- **[Components](../components/components.md)** - Build reusable UI components
- **[Essentials](../essentials/README.md)** - Core Aurelia concepts
- **[Router](../router/getting-started.md)** - Navigation and routing
- **[Dependency Injection](../essentials/dependency-injection.md)** - Share services between components
