import { IIndexable, Reporter, StrictPrimitive } from '@aurelia/kernel';
import { LifecycleFlags } from '../flags';
import { IBinding, ILifecycle } from '../lifecycle';
import {
  IBindingContext,
  IOverrideContext,
  IScope,
  ObservedCollection,
  ObserversLookup,
  PropertyObserver
} from '../observation';
import { ProxyObserver } from './proxy-observer';
import { SetterObserver } from './setter-observer';

const enum RuntimeError {
  NilScope = 250,
  NilOverrideContext = 252,
  NilParentScope = 253
}

const marker = Object.freeze({});

/** @internal */
export class InternalObserversLookup {
  public getOrCreate(
    this: { [key: string]: PropertyObserver },
    lifecycle: ILifecycle,
    flags: LifecycleFlags,
    obj: IBindingContext | IOverrideContext,
    key: string,
  ): PropertyObserver {
    if (this[key] === void 0) {
      this[key] = new SetterObserver(lifecycle, flags, obj, key);
    }
    return this[key];
  }
}

export type BindingContextValue = ObservedCollection | StrictPrimitive | IIndexable;

export class BindingContext implements IBindingContext {
  [key: string]: unknown;

  public readonly $synthetic: true;

  public $observers?: ObserversLookup;

  private constructor(keyOrObj?: string | IIndexable, value?: unknown) {
    this.$synthetic = true;

    if (keyOrObj !== void 0) {
      if (value !== void 0) {
        // if value is defined then it's just a property and a value to initialize with
        this[keyOrObj as string] = value;
      } else {
        // can either be some random object or another bindingContext to clone from
        for (const prop in keyOrObj as IIndexable) {
          if (Object.prototype.hasOwnProperty.call(keyOrObj, prop)) {
            this[prop] = (keyOrObj as IIndexable)[prop];
          }
        }
      }
    }
  }

  /**
   * Create a new synthetic `BindingContext` for use in a `Scope`.
   *
   * @param obj - Optional. An existing object or `BindingContext` to (shallow) clone (own) properties from.
   */
  public static create(flags: LifecycleFlags, obj?: IIndexable): BindingContext;
  /**
   * Create a new synthetic `BindingContext` for use in a `Scope`.
   *
   * @param key - The name of the only property to initialize this `BindingContext` with.
   * @param value - The value of the only property to initialize this `BindingContext` with.
   */
  public static create(flags: LifecycleFlags, key: string, value: unknown): BindingContext;
  /**
   * Create a new synthetic `BindingContext` for use in a `Scope`.
   *
   * This overload signature is simply the combined signatures of the other two, and can be used
   * to keep strong typing in situations where the arguments are dynamic.
   */
  public static create(flags: LifecycleFlags, keyOrObj?: string | IIndexable, value?: unknown): BindingContext;
  public static create(flags: LifecycleFlags, keyOrObj?: string | IIndexable, value?: unknown): BindingContext {
    const bc = new BindingContext(keyOrObj, value);
    if (flags & LifecycleFlags.proxyStrategy) {
      return ProxyObserver.getOrCreate(bc).proxy;
    }
    return bc;
  }

  public static get(scope: IScope, name: string, ancestor: number, flags: LifecycleFlags, hostScope?: IScope | null): IBindingContext | IOverrideContext | IBinding | undefined | null {
    if (scope == null && hostScope == null) {
      throw Reporter.error(RuntimeError.NilScope);
    }

    let context = chooseContext(scope, name, ancestor);
    if (context !== null) { return context; }
    if (hostScope !== scope && hostScope != null) {
      context = chooseContext(hostScope, name, ancestor);
      if (context !== null) { return context; }
    }

    // still nothing found. return the root binding context (or null
    // if this is a parent scope traversal, to ensure we fall back to the
    // correct level)
    if (flags & LifecycleFlags.isTraversingParentScope) {
      return marker;
    }
    return scope.bindingContext || scope.overrideContext;
  }

  public getObservers(flags: LifecycleFlags): ObserversLookup {
    if (this.$observers == null) {
      this.$observers = new InternalObserversLookup() as ObserversLookup;
    }
    return this.$observers;
  }
}

function chooseContext(scope: IScope, name: string, ancestor: number) {
  let overrideContext: IOverrideContext | null = scope.overrideContext;
  let currentScope: IScope | null = scope;

  if (ancestor > 0) {
    // jump up the required number of ancestor contexts (eg $parent.$parent requires two jumps)
    while (ancestor > 0) {
      ancestor--;
      currentScope = currentScope.parentScope;
      if (currentScope?.overrideContext == null) {
        return void 0;
      }
    }

    overrideContext = currentScope!.overrideContext;
    return name in overrideContext ? overrideContext : overrideContext.bindingContext;
  }

  // traverse the context and it's ancestors, searching for a context that has the name.
  while (overrideContext && !(name in overrideContext) && !(overrideContext.bindingContext && name in overrideContext.bindingContext)) {
    currentScope = currentScope!.parentScope ?? null;
    overrideContext = currentScope?.overrideContext ?? null;
  }

  if (overrideContext) {
    // we located a context with the property.  return it.
    return name in overrideContext ? overrideContext : overrideContext.bindingContext;
  }

  return null;
}

export class Scope implements IScope {
  public parentScope: IScope | null;
  public bindingContext: IBindingContext;
  public overrideContext: IOverrideContext;

  private constructor(
    parentScope: IScope | null,
    bindingContext: IBindingContext,
    overrideContext: IOverrideContext,
    public readonly isComponentScope: boolean,
  ) {
    this.parentScope = parentScope;
    this.bindingContext = bindingContext;
    this.overrideContext = overrideContext;
  }

  /**
   * Create a new `Scope` backed by the provided `BindingContext` and a new standalone `OverrideContext`.
   *
   * Use this overload when the scope is for the root component, in a unit test,
   * or when you simply want to prevent binding expressions from traversing up the scope.
   *
   * @param bc - The `BindingContext` to back the `Scope` with.
   */
  public static create(flags: LifecycleFlags, bc: object): Scope;
  /**
   * Create a new `Scope` backed by the provided `BindingContext` and `OverrideContext`.
   *
   * @param bc - The `BindingContext` to back the `Scope` with.
   * @param oc - The `OverrideContext` to back the `Scope` with.
   * If a binding expression attempts to access a property that does not exist on the `BindingContext`
   * during binding, it will traverse up via the `parentScope` of the scope until
   * it finds the property.
   */
  public static create(flags: LifecycleFlags, bc: object, oc: IOverrideContext, isComponentScope?: boolean): Scope;
  /**
   * Create a new `Scope` backed by the provided `BindingContext` and `OverrideContext`.
   *
   * Use this overload when the scope is for the root component, in a unit test,
   * or when you simply want to prevent binding expressions from traversing up the scope.
   *
   * @param bc - The `BindingContext` to back the `Scope` with.
   * @param oc - null. This overload is functionally equivalent to not passing this argument at all.
   */
  public static create(flags: LifecycleFlags, bc: object, oc: null, isComponentScope?: boolean): Scope;
  public static create(
    flags: LifecycleFlags,
    bc: object,
    oc?: IOverrideContext | null,
    isComponentScope: boolean = false
  ): Scope {
    return new Scope(null, bc as IBindingContext, oc == null ? OverrideContext.create(flags, bc) : oc, isComponentScope);
  }

  public static fromOverride(flags: LifecycleFlags, oc: IOverrideContext): Scope {
    if (oc == null) {
      throw Reporter.error(RuntimeError.NilOverrideContext);
    }
    return new Scope(null, oc.bindingContext, oc, false);
  }

  public static fromParent(flags: LifecycleFlags, ps: IScope | null, bc: object): Scope {
    if (ps == null) {
      throw Reporter.error(RuntimeError.NilParentScope);
    }
    return new Scope(ps, bc as IBindingContext, OverrideContext.create(flags, bc), false);
  }
}

export class OverrideContext implements IOverrideContext {
  [key: string]: unknown;

  public readonly $synthetic: true;
  public $observers?: ObserversLookup;
  public bindingContext: IBindingContext;

  private constructor(bindingContext: IBindingContext) {
    this.$synthetic = true;
    this.bindingContext = bindingContext;
  }

  public static create(flags: LifecycleFlags, bc: object): OverrideContext {
    return new OverrideContext(bc as IBindingContext);
  }

  public getObservers(): ObserversLookup {
    if (this.$observers === void 0) {
      this.$observers = new InternalObserversLookup() as ObserversLookup;
    }
    return this.$observers;
  }
}
