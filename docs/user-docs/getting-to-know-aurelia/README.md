---
description: A guided tour of Aurelia fundamentals; start here before diving into the deeper topic guides.
---

# Getting to Know Aurelia

Use this section as your orientation to Aurelia. Each topic builds on the last, moving from first render through composition patterns, state management, and the services that power real applications.

## How to Navigate

- **Start with the introductions** to see Aurelia's templating flavor and ergonomics in action.
- **Pick the boot path** (full app vs. enhancement) that matches your project.
- **Add capabilities incrementally**: routing, composition, observation, without waiting for a rewrite.
- **Dip into advanced topics last**, once the fundamentals are comfortable.

## Topic Map

| Theme | Read this first | Follow with |
| --- | --- | --- |
| Templates & syntax | [Built-in template features](introduction/built-in-template-features.md) | [Class & style binding](introduction/class-and-style-binding.md), [Attribute transferring](introduction/attribute-transferring.md) |
| Bootstrapping | [App configuration & startup](app-configuration-and-startup.md) | [Enhance](enhance.md) |
| Navigation | [Choosing a router](routing/choosing-a-router.md) | Router fundamentals, navigation, lifecycle, and advanced guides for each router package |
| Composition patterns | [Template controllers](template-controllers.md) | [Dynamic composition](dynamic-composition.md), [Portalling elements](portalling-elements.md) |
| State & observation | [Understanding the binding system](synchronous-binding-system.md) | [Observation overview](observation/README.md), [Watching data](watching-data.md) |
| Services & runtime hooks | [Dependency injection primer](dependency-injection.md) | [App tasks](app-tasks.md), [Task queue](task-queue.md), [Event aggregator](event-aggregator.md), [Logging](logging.md) |
| Deep dives | None | [Framework internals](framework-internals.md) |

## Suggested Learning Path

1. Skim the **templating introductions** to get comfortable with Aurelia's binding language.
2. Choose your **startup approach**: full SPA bootstrap or incremental enhancement.
3. Layer on **routing** once you have more than one screen.
4. Explore **composition and state tools** to keep components small and expressive.
5. Wire in **services and lifecycle hooks** as the app grows in complexity.
6. Only then crack open the **framework internals** for architecture digging or advanced debugging.

Each article calls out prerequisites and links forward so you can keep learning without losing the big picture.
