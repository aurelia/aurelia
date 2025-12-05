---
description: Practical component recipes for building common UI elements in Aurelia
---

# Component Recipes

This section contains practical, real-world examples of building reusable UI components in Aurelia. Each recipe shows you how to create a complete, production-ready component from scratch.

## What You'll Find Here

These recipes demonstrate:

- **Best practices** for component architecture
- **Accessibility** considerations
- **TypeScript** with proper typing
- **Testing** patterns for each component
- **Real-world** features and edge cases

## Available Recipes

### UI Components

- **[Dropdown Menu](dropdown-menu.md)**: A fully-featured dropdown with keyboard navigation and accessibility
- **[Modal Dialog](modal-dialog.md)**: A flexible modal system with backdrop, animations, and focus management
- **[Tabs Component](tabs-component.md)**: An accessible tab interface with dynamic content
- **[Tooltip](tooltip.md)**: Position-aware tooltips with smart placement
- **[Accordion](accordion.md)**: Collapsible content panels with smooth animations

## How to Use These Recipes

Each recipe includes:

1. **Overview**: What the component does and when to use it
2. **Complete Code**: TypeScript and HTML for the component
3. **Usage Examples**: How to consume the component
4. **Styling**: Base CSS to get you started
5. **Testing**: How to test the component
6. **Enhancements**: Ideas for extending the component

## Prerequisites

These recipes assume you're familiar with:

- [Aurelia components](../components.md)
- [Bindable properties](../bindable-properties.md)
- [Template syntax](../../templates/template-syntax/overview.md)
- [Dependency injection](../../essentials/dependency-injection.md)

## Code Standards

All recipes follow Aurelia 2 best practices:

- Use `resolve()` for dependency injection (not decorators)
- No `<template>` wrappers in HTML files
- Named exports for reusable components
- Proper cleanup in `detaching()` lifecycle hooks
- Accessible markup with ARIA attributes

## Contributing

Have a component recipe you'd like to share? Contributions are welcome! Make sure your recipe includes:

- Complete, working code
- Accessibility considerations
- Usage examples
- Tests
- Clear explanations

---

Ready to build something? Pick a recipe and start coding!
