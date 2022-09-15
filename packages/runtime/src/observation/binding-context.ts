import type { IIndexable } from '@aurelia/kernel';
import type { IBinding, IBindingContext, IOverrideContext } from '../observation';
import { hasOwnProp } from '../utilities-objects';

export class BindingContext implements IBindingContext {
  [key: string]: unknown;

  private constructor(keyOrObj?: string | IIndexable, value?: unknown) {
    if (keyOrObj !== void 0) {
      if (value !== void 0) {
        // if value is defined then it's just a property and a value to initialize with
        this[keyOrObj as string] = value;
      } else {
        // can either be some random object or another bindingContext to clone from
        for (const prop in keyOrObj as IIndexable) {
          if (hasOwnProp.call(keyOrObj, prop)) {
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
  public static create(obj?: IIndexable): BindingContext;
  /**
   * Create a new synthetic `BindingContext` for use in a `Scope`.
   *
   * @param key - The name of the only property to initialize this `BindingContext` with.
   * @param value - The value of the only property to initialize this `BindingContext` with.
   */
  public static create(key: string, value: unknown): BindingContext;
  /**
   * Create a new synthetic `BindingContext` for use in a `Scope`.
   *
   * This overload signature is simply the combined signatures of the other two, and can be used
   * to keep strong typing in situations where the arguments are dynamic.
   */
  public static create(keyOrObj?: string | IIndexable, value?: unknown): BindingContext;
  public static create(keyOrObj?: string | IIndexable, value?: unknown): BindingContext {
    return new BindingContext(keyOrObj, value);
  }

  public static get(scope: Scope, name: string, ancestor: number): IBindingContext | IOverrideContext | IBinding | undefined | null {
    if (scope == null) {
      if (__DEV__)
        throw new Error(`AUR0203: Scope is ${scope}.`);
      else
        throw new Error(`AUR0203:${scope}`);
    }
    let overrideContext: IOverrideContext | null = scope.overrideContext;
    let currentScope: Scope | null = scope;
    // let bc: IBindingContext | null;

    if (ancestor > 0) {
      // jump up the required number of ancestor contexts (eg $parent.$parent requires two jumps)
      while (ancestor > 0) {
        ancestor--;
        currentScope = currentScope.parentScope;
        if (currentScope?.overrideContext == null) {
          return void 0;
        }
      }

      overrideContext = currentScope.overrideContext;
      // Here we are giving benefit of doubt considering the dev has used one or more `$parent` token, and thus should know what s/he is targeting.
      return name in overrideContext ? overrideContext : overrideContext.bindingContext;
    }

    // walk the scope hierarchy until
    // the first scope that has the property in its contexts
    // or
    // the closet boundary scope
    // -------------------------
    // this behavior is different with v1
    // where it would fallback to the immediate scope instead of the root one
    // TODO: maybe avoid immediate loop and return earlier
    // -------------------------
    while (
      !currentScope?.isBoundary
      && overrideContext != null
      && !(name in overrideContext)
      && !(
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        overrideContext.bindingContext
        && name in overrideContext.bindingContext
      )
    ) {
      currentScope = currentScope!.parentScope ?? null;
      overrideContext = currentScope?.overrideContext ?? null;
    }

    if (overrideContext) {
      return name in overrideContext ? overrideContext : overrideContext.bindingContext;
    }

    // This following code block is the v1 behavior of scope selection
    // where it would walk the scope hierarchy and stop at the first scope
    // that has matching property.
    // if no scope in the hierarchy, until the closest boundary scope has the property
    // then pick the scope it started with
    // ------------------
    // if (currentScope.isBoundary) {
    //   if (overrideContext != null) {
    //     if (name in overrideContext) {
    //       return overrideContext;
    //     }
    //     bc = overrideContext.bindingContext;
    //     if (bc != null && name in bc) {
    //       return bc;
    //     }
    //   }
    // } else {
    //   // traverse the context and it's ancestors, searching for a context that has the name.
    //   do {
    //     if (overrideContext != null) {
    //       if (name in overrideContext) {
    //         return overrideContext;
    //       }
    //       bc = overrideContext.bindingContext;
    //       if (bc != null && name in bc) {
    //         return bc;
    //       }
    //     }
    //     if (currentScope.isBoundary) {
    //       break;
    //     }
    //     currentScope = currentScope.parentScope;
    //     overrideContext = currentScope == null ? null : currentScope.overrideContext;
    //   } while (currentScope != null);
    // }

    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    return scope.bindingContext || scope.overrideContext;
  }
}

export class Scope {
  private constructor(
    public parentScope: Scope | null,
    public bindingContext: IBindingContext,
    public overrideContext: IOverrideContext,
    public readonly isBoundary: boolean,
  ) { }

  /**
   * Create a new `Scope` backed by the provided `BindingContext` and a new standalone `OverrideContext`.
   *
   * Use this overload when the scope is for the root component, in a unit test,
   * or when you simply want to prevent binding expressions from traversing up the scope.
   *
   * @param bc - The `BindingContext` to back the `Scope` with.
   */
  public static create(bc: object): Scope;
  /**
   * Create a new `Scope` backed by the provided `BindingContext` and `OverrideContext`.
   *
   * @param bc - The `BindingContext` to back the `Scope` with.
   * @param oc - The `OverrideContext` to back the `Scope` with.
   * If a binding expression attempts to access a property that does not exist on the `BindingContext`
   * during binding, it will traverse up via the `parentScope` of the scope until
   * it finds the property.
   */
  public static create(bc: object, oc: IOverrideContext, isBoundary?: boolean): Scope;
  /**
   * Create a new `Scope` backed by the provided `BindingContext` and `OverrideContext`.
   *
   * Use this overload when the scope is for the root component, in a unit test,
   * or when you simply want to prevent binding expressions from traversing up the scope.
   *
   * @param bc - The `BindingContext` to back the `Scope` with.
   * @param oc - null. This overload is functionally equivalent to not passing this argument at all.
   */
  public static create(bc: object, oc: null, isBoundary?: boolean): Scope;
  public static create(bc: object, oc?: IOverrideContext | null, isBoundary?: boolean): Scope {
    return new Scope(null, bc as IBindingContext, oc == null ? OverrideContext.create(bc) : oc, isBoundary ?? false);
  }

  public static fromOverride(oc: IOverrideContext): Scope {
    if (oc == null) {
      if (__DEV__)
        throw new Error(`AUR0204: OverrideContext is ${oc}`);
      else
        throw new Error(`AUR0204:${oc}`);
    }
    return new Scope(null, oc.bindingContext, oc, false);
  }

  public static fromParent(ps: Scope | null, bc: object): Scope {
    if (ps == null) {
      if (__DEV__)
        throw new Error(`AUR0205: ParentScope is ${ps}`);
      else
        throw new Error(`AUR0205:${ps}`);
    }
    return new Scope(ps, bc as IBindingContext, OverrideContext.create(bc), false);
  }
}

export class OverrideContext implements IOverrideContext {
  [key: string]: unknown;

  public bindingContext: IBindingContext;

  private constructor(bindingContext: IBindingContext) {
    this.bindingContext = bindingContext;
  }

  public static create(bc: object): OverrideContext {
    return new OverrideContext(bc as IBindingContext);
  }
}
