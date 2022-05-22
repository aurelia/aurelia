import { DI, Registration } from '@aurelia/kernel';
import { appendResourceKey, defineMetadata, getAnnotationKeyFor, getOwnMetadata } from '../shared';
import type { Constructable, IContainer, AnyFunction, FunctionPropNames } from '@aurelia/kernel';

export type LifecycleHook<TViewModel, TKey extends keyof TViewModel, P extends TViewModel[TKey] = TViewModel[TKey]> =
  P extends AnyFunction
    ? (vm: TViewModel, ...args: Parameters<NonNullable<P>>) => ReturnType<NonNullable<P>>
    : never;

export type ILifecycleHooks<TViewModel = {}, TKey extends keyof TViewModel = keyof TViewModel> = { [K in TKey]-?: LifecycleHook<TViewModel, K>; };
export const ILifecycleHooks = DI.createInterface<ILifecycleHooks>('ILifecycleHooks');

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
    while (proto !== Object.prototype) {
      for (const name of Object.getOwnPropertyNames(proto)) {
        // This is the only check we will do for now. Filtering on e.g. function types might not always work properly when decorators come into play. This would need more testing first.
        if (name !== 'constructor') {
          propertyNames.add(name);
        }
      }
      proto = Object.getPrototypeOf(proto);
    }

    return new LifecycleHooksDefinition(Type, propertyNames);
  }

  public static fromCallback(lifecycle: string, callback: AnyFunction): LifecycleHooksDefinition {
    const Type = class {
      [key: string]: AnyFunction;
      public constructor() {
        this[lifecycle] = callback;
      }
    };
    return new LifecycleHooksDefinition(Type, new Set([lifecycle]));
  }

  public register(container: IContainer): void {
    Registration.singleton(ILifecycleHooks, this.Type).register(container);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const containerLookup = new WeakMap<IContainer, LifecycleHooksLookup<any>>();

const lhBaseName = getAnnotationKeyFor('lifecycle-hooks');
const callbackHooksName = `${lhBaseName}:callback`;

export const LifecycleHooks = Object.freeze({
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
  fromCallback<T>(lifecycle: string, callback: (vm: T, ...params: unknown[]) => unknown): LifecycleHooksDefinition {
    return LifecycleHooksDefinition.fromCallback(lifecycle, callback);
  },
  add<T extends Constructable>(Type: T, lifecycle: string, callback: AnyFunction): void {
    let existing = getOwnMetadata(Type, callbackHooksName) as Record<string, AnyFunction[]>;
    if (existing === void 0) {
      defineMetadata(callbackHooksName, existing = {}, Type);
    }
    (existing[lifecycle] ??= []).push(callback);
  },
  /**
   * @param ctx - The container where the resolution starts
   * @param Type - The constructor of the Custom element/ Custom attribute with lifecycle metadata
   */
  resolve(ctx: IContainer, Type: Constructable): LifecycleHooksLookup {
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
      const callbackLifecycleHooks = getOwnMetadata(callbackHooksName, Type) as Record<string, AnyFunction[]>;

      let instance: ILifecycleHooks;
      let definition: LifecycleHooksDefinition;
      let entry: LifecycleHooksEntry;
      let name: string;
      let entries: LifecycleHooksEntry[];
      let callbacks: AnyFunction[];

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

      if (callbackLifecycleHooks != null) {
        for (name in callbackLifecycleHooks) {
          entries = lookup[name] as LifecycleHooksEntry[];
          if (entries === void 0) {
            entries = lookup[name] = [];
          }
          callbacks = callbackLifecycleHooks[name];
          callbacks.forEach(callback => {
            definition = LifecycleHooksDefinition.fromCallback(name, callback);
            entries.push(new LifecycleHooksEntry(definition, new definition.Type()));
          });
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
