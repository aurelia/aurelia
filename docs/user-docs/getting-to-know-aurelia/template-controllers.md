---
description: Encapsulate templating logic in reusable controllers that coordinate rendering in Aurelia views.
---

# Template Controllers

Template controllers are custom attributes that control how Aurelia renders the children of an element. Built-ins such as `if.bind`, `repeat.for`, `with.bind`, `switch.case`, `portal`, and `promise` live under `packages/runtime-html/src/resources/template-controllers` and all follow the same pattern:

1. The template compiler detects an attribute whose definition sets `isTemplateController: true` (see `packages/template-compiler/src/template-compiler.ts`).
2. It emits a `HydrateTemplateController` instruction that carries the element's compiled view.
3. At runtime the `TemplateControllerRenderer` ( `packages/runtime-html/src/renderer.ts` ) instantiates your view model, provides an `IViewFactory`, an `IRenderLocation`, and an `ICustomAttributeController`, and expects you to activate/deactivate the supplied `ISyntheticView` as conditions change.

Because template controllers sit in the compilation pipeline, they obey a few structural rules:

- If you place several template controllers on the same element, Aurelia processes them from **right to left** so that the right-most controller receives the compiled template while the others receive markers that point at the inner instruction stack.
- They cannot live on a surrogate `<template as-element="...">` and they cannot be applied via spread bindings (`...attrs`); both cases raise the `no_tc_on_surrogate` / `no_spread_template_controller` compiler errors.

## Declaring a Template Controller

A template controller is just a custom attribute whose definition sets `isTemplateController: true`. There is **no implicit naming convention**—you must provide metadata via one of the following:

### 1. `@templateController()` decorator

```typescript
import { bindable, ICustomAttributeController, IRenderLocation, ISyntheticView, IViewFactory, templateController } from '@aurelia/runtime-html';
import { resolve } from '@aurelia/kernel';

@templateController({
  name: 'permission',
  bindables: ['userRole', 'requiredRole'],
  containerStrategy: 'reuse',
})
export class PermissionTemplateController {
  public readonly $controller!: ICustomAttributeController<this>;

  @bindable() public userRole = '';
  @bindable() public requiredRole = '';

  private readonly factory = resolve(IViewFactory);
  private readonly location = resolve(IRenderLocation);
  private view?: ISyntheticView;

  public binding() {
    this.view ??= this.factory.create().setLocation(this.location);
  }

  public bound() {
    this.updateVisibility();
  }

  public userRoleChanged() {
    this.updateVisibility();
  }

  public requiredRoleChanged() {
    this.updateVisibility();
  }

  public detaching() {
    this.view?.deactivate(this.view, this.$controller);
  }

  private updateVisibility() {
    if (!this.view) {
      return;
    }
    const canSee = this.userRole === this.requiredRole;
    if (canSee && !this.view.isActive) {
      void this.view.activate(this.view, this.$controller, this.$controller.scope);
    } else if (!canSee && this.view.isActive) {
      void this.view.deactivate(this.view, this.$controller);
    }
  }
}
```

Register the class just like any other resource:

```typescript
import Aurelia from 'aurelia';
import { PermissionTemplateController } from './permission-template-controller';
import { App } from './app';

Aurelia
  .register(PermissionTemplateController)
  .app(App)
  .start();
```

### 2. `@customAttribute({ isTemplateController: true })`

If you already use the `@customAttribute` decorator, add the `isTemplateController` flag plus any `bindables`, `noMultiBindings`, or `containerStrategy` options you need. This is equivalent to calling `templateController` but keeps all attribute metadata in one place.

### 3. Static `$au` definition / `CustomAttribute.define`

For generated code or library helpers, provide a static `$au` definition or call `CustomAttribute.define({ name: 'x', isTemplateController: true }, Type)`. Every built-in template controller uses this approach so the compiler can tree-shake unused controllers while still providing strongly typed metadata.

## Managing the Hosted View

The renderer gives each template controller three important collaborators:

- `IViewFactory` — produces `ISyntheticView` instances backed by the compiled markup.
- `IRenderLocation` — the DOM marker where your view should attach.
- `ICustomAttributeController` — exposes state (`isActive`, `scope`, lifecycle queues) and lets Aurelia coordinate activation.

The minimal lifecycle looks like this:

```typescript
public binding() {
  this.view ??= this.factory.create().setLocation(this.location);
}

public attaching() {
  return this.show(); // return a promise if activation is async
}

public detaching() {
  return this.hide();
}

private show() {
  if (this.condition && this.view && !this.view.isActive) {
    return this.view.activate(this.view, this.$controller, this.$controller.scope);
  }
}

private hide() {
  if (this.view?.isActive) {
    return this.view.deactivate(this.view, this.$controller);
  }
}
```

Because the same view gets reused, you can cache work (see `If.cache` and `PromiseTemplateController` for examples). If you need a fresh container per instantiation—for example, each repeated row should get a unique dependency graph—set `containerStrategy: 'new'` on the definition so the renderer asks the DI container for a child scope before creating the view.

## Coordinating Multiple Template Controllers

When several template controllers decorate the same element, Aurelia walks the instruction list from **right to left** (`packages/template-compiler/src/template-compiler.ts`, section 4.1). Only the right-most controller receives the original compiled template. The controllers to its left only see the marker emitted by the inner controller. This is why sequences like `repeat.for="item of items" if.bind="item.visible"` behave predictably—the `if` sees the repeated view because it is to the right of `repeat`.

Template controllers can also cooperate via the optional `link()` hook. The built-in `else` controller uses it to register its `IViewFactory` with the nearest preceding `if`:

```typescript
import { ICustomAttributeController, IHydratableController } from '@aurelia/runtime-html';
import { IInstruction } from '@aurelia/template-compiler';

export class ElseTemplateController {
  public link(
    parent: IHydratableController,
    _ownController: ICustomAttributeController,
    _target: Node,
    _instruction: IInstruction,
  ) {
    const lastChild = parent.children?.at(-1);
    // lastChild.viewModel will be the matching If instance; hand it our factory
  }
}
```

Use this hook whenever two controllers must share state (think `switch` / `case` / `default-case`).

## Restrictions and Gotchas

- **No surrogate usage** – Placing a template controller on `<template as-element="foo">` throws `compiler_no_tc_on_surrogate` because surrogates do not own render locations.
- **No spread bindings** – `...attrs="bindable"` intentionally skips template controllers since spreading could hide structural markup (`packages/template-compiler/src/errors.ts`, `no_spread_template_controller`). Register them explicitly instead.
- **One template per controller** – The compiler only emits one `IViewFactory` per controller. If you need secondary content (like the `else` branch), capture another controller's factory in `link()` or build an additional view manually using `ViewFactory`/`CustomElementDefinition` as shown earlier.
- **Container strategy matters** – Setting `containerStrategy: 'new'` ensures each rendered view gets a fresh child container (see `PromiseTemplateController`); the default `'reuse'` is faster but shares services.
- **Lifecycle must be balanced** – Always deactivate and dispose views you created. Built-ins call `.dispose()` in `detaching` to release DOM and avoid leaks.

## Next Steps

- Browse `packages/runtime-html/src/resources/template-controllers` for production-grade patterns (`repeat`, `if/else`, `promise`, `portal`).
- Revisit [custom attribute metadata](../templates/custom-attributes.md#template-controller-custom-attributes) for additional definition options (default binding modes, multi-binding syntax, watches, etc.).
- Combine template controllers with [dynamic composition](dynamic-composition.md) or [portalling](portalling-elements.md) when you need to re-parent DOM nodes at runtime.
