import { IIndexable, Reporter, StrictPrimitive, Tracer } from '@aurelia/kernel';
import { IBindScope } from '../lifecycle';
import {
  IBindingContext,
  IOverrideContext,
  IScope,
  LifecycleFlags,
  ObservedCollection,
  ObserversLookup,
  PropertyObserver
} from '../observation';
import { SetterObserver } from './setter-observer';

const slice = Array.prototype.slice;

const enum RuntimeError {
  UndefinedScope = 250, // trying to evaluate on something that's not a valid binding
  NullScope = 251, // trying to evaluate on an unbound binding
  NilOverrideContext = 252,
  NilParentScope = 253
}

/** @internal */
export class InternalObserversLookup {
  public getOrCreate(obj: IBindingContext | IOverrideContext, key: string): PropertyObserver {
    if (Tracer.enabled) { Tracer.enter('InternalObserversLookup.getOrCreate', slice.call(arguments)); }
    let observer = this[key];
    if (observer === undefined) {
      observer = this[key] = new SetterObserver(obj, key);
    }
    if (Tracer.enabled) { Tracer.leave(); }
    return observer;
  }
}

type BindingContextValue = ObservedCollection | StrictPrimitive | IIndexable;

export class BindingContext implements IBindingContext {
  [key: string]: BindingContextValue;

  public readonly $synthetic: true;

  public $observers: ObserversLookup<IOverrideContext>;

  private constructor(keyOrObj?: string | IIndexable, value?: BindingContextValue) {
    this.$synthetic = true;

    if (keyOrObj !== undefined) {
      if (value !== undefined) {
        // if value is defined then it's just a property and a value to initialize with
        this[keyOrObj as string] = value;
      } else {
        // can either be some random object or another bindingContext to clone from
        for (const prop in keyOrObj as IIndexable) {
          if (keyOrObj.hasOwnProperty(prop)) {
            this[prop] = keyOrObj[prop];
          }
        }
      }
    }
  }

  /**
   * Create a new synthetic `BindingContext` for use in a `Scope`.
   * @param obj Optional. An existing object or `BindingContext` to (shallow) clone (own) properties from.
   */
  public static create(obj?: IIndexable): BindingContext;
  /**
   * Create a new synthetic `BindingContext` for use in a `Scope`.
   * @param key The name of the only property to initialize this `BindingContext` with.
   * @param value The value of the only property to initialize this `BindingContext` with.
   */
  public static create(key: string, value: BindingContextValue): BindingContext;
  /**
   * Create a new synthetic `BindingContext` for use in a `Scope`.
   *
   * This overload signature is simply the combined signatures of the other two, and can be used
   * to keep strong typing in situations where the arguments are dynamic.
   */
  public static create(keyOrObj?: string | IIndexable, value?: BindingContextValue): BindingContext;
  public static create(keyOrObj?: string | IIndexable, value?: BindingContextValue): BindingContext {
    return new BindingContext(keyOrObj, value);
  }

  public static get(scope: IScope, name: string, ancestor: number, flags: LifecycleFlags): IBindingContext | IOverrideContext | IBindScope {
    if (Tracer.enabled) { Tracer.enter('BindingContext.get', slice.call(arguments)); }
    if (scope === undefined) {
      throw Reporter.error(RuntimeError.UndefinedScope);
    }
    if (scope === null) {
      throw Reporter.error(RuntimeError.NullScope);
    }
    let overrideContext = scope.overrideContext;

    if (ancestor > 0) {
      // jump up the required number of ancestor contexts (eg $parent.$parent requires two jumps)
      while (ancestor > 0) {
        if (overrideContext.parentOverrideContext === null) {
          if (Tracer.enabled) { Tracer.leave(); }
          return undefined;
        }
        ancestor--;
        overrideContext = overrideContext.parentOverrideContext;
      }

      if (Tracer.enabled) { Tracer.leave(); }
      return name in overrideContext ? overrideContext : overrideContext.bindingContext;
    }

    // traverse the context and it's ancestors, searching for a context that has the name.
    while (overrideContext && !(name in overrideContext) && !(overrideContext.bindingContext && name in overrideContext.bindingContext)) {
      overrideContext = overrideContext.parentOverrideContext;
    }

    if (overrideContext) {
      if (Tracer.enabled) { Tracer.leave(); }
      // we located a context with the property.  return it.
      return name in overrideContext ? overrideContext : overrideContext.bindingContext;
    }

    // the name wasn't found. see if parent scope traversal is allowed and if so, try that
    if ((flags & LifecycleFlags.allowParentScopeTraversal) && scope.parentScope !== null) {
      const result = this.get(scope.parentScope, name, ancestor, flags
        // unset the flag; only allow one level of scope boundary traversal
        & ~LifecycleFlags.allowParentScopeTraversal
        // tell the scope to return null if the name could not be found
        | LifecycleFlags.isTraversingParentScope);
      if (result !== null) {
        if (Tracer.enabled) { Tracer.leave(); }
        return result;
      }
    }

    // still nothing found. return the root binding context (or null
    // if this is a parent scope traversal, to ensure we fall back to the
    // correct level)
    if (flags & LifecycleFlags.isTraversingParentScope) {
      if (Tracer.enabled) { Tracer.leave(); }
      return null;
    }
    if (Tracer.enabled) { Tracer.leave(); }
    return scope.bindingContext || scope.overrideContext;
  }

  public getObservers(): ObserversLookup<IOverrideContext> {
    if (Tracer.enabled) { Tracer.enter('BindingContext.getObservers', slice.call(arguments)); }
    let observers = this.$observers;
    if (observers === undefined) {
      this.$observers = observers = new InternalObserversLookup() as ObserversLookup<IOverrideContext>;
    }
    if (Tracer.enabled) { Tracer.leave(); }
    return observers;
  }
}

export class Scope implements IScope {
  public readonly bindingContext: IBindingContext | IBindScope;
  public readonly overrideContext: IOverrideContext;
  // parentScope is strictly internal API and mainly for replaceable template controller.
  // NOT intended for regular scope traversal!
  /** @internal */public readonly parentScope: IScope | null;

  private constructor(bindingContext: IBindingContext | IBindScope, overrideContext: IOverrideContext) {
    this.bindingContext = bindingContext;
    this.overrideContext = overrideContext;
    this.parentScope = null;
  }

  public static create(bc: IBindingContext | IBindScope, oc: IOverrideContext | null): Scope {
    if (Tracer.enabled) { Tracer.enter('Scope.create', slice.call(arguments)); }
    if (Tracer.enabled) { Tracer.leave(); }
    return new Scope(bc, oc === null || oc === undefined ? OverrideContext.create(bc, oc) : oc);
  }

  public static fromOverride(oc: IOverrideContext): Scope {
    if (Tracer.enabled) { Tracer.enter('Scope.fromOverride', slice.call(arguments)); }
    if (oc === null || oc === undefined) {
      throw Reporter.error(RuntimeError.NilOverrideContext);
    }
    if (Tracer.enabled) { Tracer.leave(); }
    return new Scope(oc.bindingContext, oc);
  }

  public static fromParent(ps: IScope | null, bc: IBindingContext | IBindScope): Scope {
    if (Tracer.enabled) { Tracer.enter('Scope.fromParent', slice.call(arguments)); }
    if (ps === null || ps === undefined) {
      throw Reporter.error(RuntimeError.NilParentScope);
    }
    if (Tracer.enabled) { Tracer.leave(); }
    return new Scope(bc, OverrideContext.create(bc, ps.overrideContext));
  }
}

export class OverrideContext implements IOverrideContext {
  [key: string]: ObservedCollection | StrictPrimitive | IIndexable;

  public readonly $synthetic: true;
  public readonly bindingContext: IBindingContext | IBindScope;
  public readonly parentOverrideContext: IOverrideContext | null;

  private constructor(bindingContext: IBindingContext | IBindScope, parentOverrideContext: IOverrideContext | null) {
    this.$synthetic = true;
    this.bindingContext = bindingContext;
    this.parentOverrideContext = parentOverrideContext;
  }

  public static create(bc: IBindingContext | IBindScope, poc: IOverrideContext | null): OverrideContext {
    if (Tracer.enabled) { Tracer.enter('OverrideContext.create', slice.call(arguments)); }
    if (Tracer.enabled) { Tracer.leave(); }
    return new OverrideContext(bc, poc === undefined ? null : poc);
  }

  public getObservers(): ObserversLookup<IOverrideContext> {
    if (Tracer.enabled) { Tracer.enter('OverrideContext.getObservers', slice.call(arguments)); }
    let observers = this.$observers;
    if (observers === undefined) {
      this.$observers = observers = new InternalObserversLookup();
    }
    if (Tracer.enabled) { Tracer.leave(); }
    return observers as ObserversLookup<IOverrideContext>;
  }
}
