import { appendResourceKey, defineMetadata, getAnnotationKeyFor, getOwnMetadata } from '../utilities-metadata';
import { createInterface, singletonRegistration } from '../utilities-di';
import { getOwnPropertyNames, objectFreeze, baseObjectPrototype } from '../utilities';

import type { Constructable, IContainer, AnyFunction, FunctionPropNames } from '@aurelia/kernel';

export type LifecycleHook<TViewModel, TKey extends keyof TViewModel> =
  TViewModel[TKey] extends (AnyFunction | undefined)
    ? (vm: TViewModel, ...args: Parameters<NonNullable<TViewModel[TKey]>>) => ReturnType<NonNullable<TViewModel[TKey]>>
    : never;

export type ILifecycleHooks<TViewModel = {}, TKey extends keyof TViewModel = keyof TViewModel> = { [K in TKey]-?: LifecycleHook<TViewModel, K>; };
export const ILifecycleHooks = /*@__PURE__*/createInterface<ILifecycleHooks<object>>('ILifecycleHooks');

export type LifecycleHooksLookup<TViewModel = {}> = {
  [K in FunctionPropNames<TViewModel>]?: readonly LifecycleHooksEntry<TViewModel, K>[];
};
export class LifecycleHooksEntry<TViewModel = {}, TKey extends keyof TViewModel = keyof TViewModel, THooks extends Constructable = Constructable> {
  public constructor(
    public readonly definition: LifecycleHooksDefinition<THooks>,
    public readonly instance: ILifecycleHooks<TViewModel, TKey>,
  ) {}
}

/**
 * This definition has no specific properties yet other than the type, but is in place for future extensions.
 *
 * See: https://github.com/aurelia/aurelia/issues/1044
 */
export class LifecycleHooksDefinition<T extends Constructable = Constructable> {
  private constructor(
    public readonly Type: T,
    public readonly propertyNames: ReadonlySet<string>,
  ) {}

  /**
   * @param def - Placeholder for future extensions. Currently always an empty object.
   */
  public static create<T extends Constructable>(def: {}, Type: T): LifecycleHooksDefinition<T> {
    const propertyNames = new Set<string>();
    let proto = Type.prototype;
    while (proto !== baseObjectPrototype) {
      for (const name of getOwnPropertyNames(proto)) {
        // This is the only check we will do for now. Filtering on e.g. function types might not always work properly when decorators come into play. This would need more testing first.
        if (name !== 'constructor' && !name.startsWith('_')) {
          propertyNames.add(name);
        }
      }
      proto = Object.getPrototypeOf(proto);
    }

    return new LifecycleHooksDefinition(Type, propertyNames);
  }

  public register(container: IContainer): void {
    singletonRegistration(ILifecycleHooks, this.Type).register(container);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const containerLookup = new WeakMap<IContainer, LifecycleHooksLookup<any>>();

const lhBaseName = getAnnotationKeyFor('lifecycle-hooks');

export const LifecycleHooks = objectFreeze({
  name: lhBaseName,
  /**
   * @param def - Placeholder for future extensions. Currently always an empty object.
   */
  define<T extends Constructable>(def: {}, Type: T): T {
    const definition = LifecycleHooksDefinition.create(def, Type);
    defineMetadata(lhBaseName, definition, Type);
    appendResourceKey(Type, lhBaseName);
    return definition.Type;
  },
  /**
   * @param ctx - The container where the resolution starts
   * @param Type - The constructor of the Custom element/ Custom attribute with lifecycle metadata
   */
  resolve(ctx: IContainer): LifecycleHooksLookup {
    let lookup = containerLookup.get(ctx);
    if (lookup === void 0) {
      containerLookup.set(ctx, lookup = new LifecycleHooksLookupImpl());
      const root = ctx.root;
      const instances = root.id === ctx.id
        ? ctx.getAll(ILifecycleHooks)
        // if it's not root, only resolve it from the current context when it has the resolver
        // to maintain resources semantic: current -> root
        : ctx.has(ILifecycleHooks, false)
          ? root.getAll(ILifecycleHooks).concat(ctx.getAll(ILifecycleHooks))
          : root.getAll(ILifecycleHooks);

      let instance: ILifecycleHooks;
      let definition: LifecycleHooksDefinition;
      let entry: LifecycleHooksEntry;
      let name: string;
      let entries: LifecycleHooksEntry[];

      for (instance of instances) {
        definition = getOwnMetadata(lhBaseName, instance.constructor) as LifecycleHooksDefinition;
        entry = new LifecycleHooksEntry(definition, instance);
        for (name of definition.propertyNames) {
          entries = lookup[name] as LifecycleHooksEntry[];
          if (entries === void 0) {
            lookup[name] = [entry];
          } else {
            entries.push(entry);
          }
        }
      }
    }
    return lookup;
  },
});

class LifecycleHooksLookupImpl implements LifecycleHooksLookup {}

/**
 * Decorator: Indicates that the decorated class is a custom element.
 */
export function lifecycleHooks(): <T extends Constructable>(target: T) => T {
  return function decorator<T extends Constructable>(target: T): T {
    return LifecycleHooks.define({}, target);
  };
}
