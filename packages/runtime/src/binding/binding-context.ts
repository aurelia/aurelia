import { IIndexable, Reporter, StrictPrimitive } from '@aurelia/kernel';
import { IBindScope } from '../lifecycle';
import { IBindingContext, IOverrideContext, IScope, ObservedCollection, ObserversLookup, PropertyObserver } from '../observation';
import { SetterObserver } from './property-observation';

const enum RuntimeError {
  UndefinedScope = 250, // trying to evaluate on something that's not a valid binding
  NullScope = 251, // trying to evaluate on an unbound binding
  NilOverrideContext = 252,
  NilParentScope = 253
}

/*@internal*/
export class InternalObserversLookup {
  public getOrCreate(obj: IBindingContext | IOverrideContext, key: string): PropertyObserver {
    let observer = this[key];
    if (observer === undefined) {
      observer = this[key] = new SetterObserver(obj, key);
    }
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

  public static create(obj?: IIndexable): BindingContext;
  public static create(key: string, value: BindingContextValue): BindingContext;
  public static create(keyOrObj?: string | IIndexable, value?: BindingContextValue): BindingContext {
    return new BindingContext(keyOrObj, value);
  }

  public static get(scope: IScope, name: string, ancestor: number): IBindingContext | IOverrideContext | IBindScope {
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
          return undefined;
        }
        ancestor--;
        overrideContext = overrideContext.parentOverrideContext;
      }

      return name in overrideContext ? overrideContext : overrideContext.bindingContext;
    }

    // traverse the context and it's ancestors, searching for a context that has the name.
    while (overrideContext && !(name in overrideContext) && !(overrideContext.bindingContext && name in overrideContext.bindingContext)) {
      overrideContext = overrideContext.parentOverrideContext;
    }

    if (overrideContext) {
      // we located a context with the property.  return it.
      return name in overrideContext ? overrideContext : overrideContext.bindingContext;
    }

    // the name wasn't found.  return the root binding context.
    return scope.bindingContext || scope.overrideContext;
  }

  public getObservers(): ObserversLookup<IOverrideContext> {
    let observers = this.$observers;
    if (observers === undefined) {
      this.$observers = observers = new InternalObserversLookup() as any;
    }
    return observers;
  }
}

export class Scope implements IScope {
  public readonly bindingContext: IBindingContext | IBindScope;
  public readonly overrideContext: IOverrideContext;

  private constructor(bindingContext: IBindingContext | IBindScope, overrideContext: IOverrideContext) {
    this.bindingContext = bindingContext;
    this.overrideContext = overrideContext;
  }

  public static create(bc: IBindingContext | IBindScope, oc: IOverrideContext | null): Scope {
    return new Scope(bc, oc === null || oc === undefined ? OverrideContext.create(bc, oc) : oc);
  }

  public static fromOverride(oc: IOverrideContext): Scope {
    if (oc === null || oc === undefined) {
      throw Reporter.error(RuntimeError.NilOverrideContext);
    }
    return new Scope(oc.bindingContext, oc);
  }

  public static fromParent(ps: IScope, bc: IBindingContext | IBindScope): Scope {
    if (ps === null || ps === undefined) {
      throw Reporter.error(RuntimeError.NilParentScope);
    }
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
    return new OverrideContext(bc, poc === undefined ? null : poc);
  }

  public getObservers(): ObserversLookup<IOverrideContext> {
    let observers = this.$observers;
    if (observers === undefined) {
      this.$observers = observers = new InternalObserversLookup();
    }
    return observers as ObserversLookup<IOverrideContext>;
  }
}
