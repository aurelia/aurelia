import { IContainer, Key, Registration } from '@aurelia/kernel';
import { CustomAttribute, CustomElement, IHydratedComponentController, ILifecycleHooks, lifecycleHooks } from '@aurelia/runtime-html';
import { IStore } from './interfaces';
import { StateGetterBinding } from './state-getter-binding';

/**
 * A decorator for component properties whose values derived from global state
 * Usage example:
 *
 * ```ts
 * class MyComponent {
 *  \@state(s => s.items)
 *   data: Item[]
 * }
 * ```
 */
export function fromState<T, K = unknown>(getValue: (state: T) => K): PropertyDecorator {
  return function (
    target: any,
    key: PropertyKey,
    desc?: PropertyDescriptor
  ) {
    if (typeof target === 'function') {
      throw new Error(`Invalid usage. @state can only be used on a field`);
    }
    if (typeof desc?.value !== 'undefined') {
      throw new Error(`Invalid usage. @state can only be used on a field`);
    }

    target = (target as object).constructor;

    let dependencies = CustomElement.getAnnotation(target, dependenciesKey) as Key[] | undefined;
    if (dependencies == null) {
      CustomElement.annotate(target, dependenciesKey, dependencies = []);
    }
    dependencies.push(new HydratingLifecycleHooks(getValue, key));

    dependencies = CustomAttribute.getAnnotation(target, dependenciesKey) as Key[] | undefined;
    if (dependencies == null) {
      CustomElement.annotate(target, dependenciesKey, dependencies = []);
    }
    dependencies.push(new CreatedLifecycleHooks(getValue, key));
  };
}
const dependenciesKey = 'dependencies';

@lifecycleHooks()
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
    controller.addBinding(new StateGetterBinding(
      container,
      container.get(IStore),
      this.$get,
      vm,
      this.key
    ));
  }
}

@lifecycleHooks()
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
    controller.addBinding(new StateGetterBinding(
      container,
      container.get(IStore),
      this.$get,
      vm,
      this.key
    ));
  }
}
