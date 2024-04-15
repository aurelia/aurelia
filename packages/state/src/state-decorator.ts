import { IContainer, Protocol, Registration } from '@aurelia/kernel';
import { IHydratedComponentController, ILifecycleHooks, LifecycleHooks } from '@aurelia/runtime-html';
import { IStore } from './interfaces';
import { StateGetterBinding } from './state-getter-binding';

/**
 * A decorator for component properties whose values derived from global state
 * Usage example:
 *
 * ```ts
 * class MyComponent {
 *  \@fromState(s => s.items)
 *   data: Item[]
 * }
 * ```
 */
export function fromState<T, K = unknown>(
  getValue: (state: T) => K
): ((target: unknown, context: ClassFieldDecoratorContext<unknown, K> | ClassSetterDecoratorContext<unknown, K>) => void) {
  return function (
    target: unknown,
    context: ClassFieldDecoratorContext<unknown,K> | ClassSetterDecoratorContext<unknown, K>,
  ) {
    if (!((target === void 0 && context.kind === 'field') || (typeof target === 'function' && context.kind === 'setter'))) {
      throw new Error(`Invalid usage. @state can only be used on a field ${target} - ${context.kind}`);
    }

    const key = context.name;
    const dependencies = (context.metadata[dependenciesKey] as unknown[]) ??= [];

    // As we don't have a way to grab the constructor function here, we add both the hooks as dependencies.
    // However, the hooks checks how the component is used and adds only a single binding.
    // Improvement idea: add a way to declare the target types for the hooks and lazily create the hooks only for those types (sort of hook factory?).
    dependencies.push(
      new HydratingLifecycleHooks(getValue, key),
      new CreatedLifecycleHooks(getValue, key)
    );
  };
}

const dependenciesKey = Protocol.annotation.keyFor('dependencies');

class HydratingLifecycleHooks {
  public constructor(
    private readonly $get: (s: any) => unknown,
    private readonly key: PropertyKey,
  ) {

  }

  public register(c: IContainer) {
    Registration.instance(ILifecycleHooks, this).register(c);
  }

  public hydrating(vm: object, controller: IHydratedComponentController) {
    const container = controller.container;
    if (controller.vmKind !== 'customElement') return;
    controller.addBinding(new StateGetterBinding(
      vm,
      this.key,
      container.get(IStore),
      this.$get,
    ));
  }
}
LifecycleHooks.define({}, HydratingLifecycleHooks);

class CreatedLifecycleHooks {
  public constructor(
    private readonly $get: (s: any) => unknown,
    private readonly key: PropertyKey,
  ) {}

  public register(c: IContainer) {
    Registration.instance(ILifecycleHooks, this).register(c);
  }

  public created(vm: object, controller: IHydratedComponentController) {
    const container = controller.container;
    if (controller.vmKind !== 'customAttribute') return;
    controller.addBinding(new StateGetterBinding(
      vm,
      this.key,
      container.get(IStore),
      this.$get,
    ));
  }
}
LifecycleHooks.define({}, CreatedLifecycleHooks);
