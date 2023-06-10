import { createGlobalContext, type IBinding, type IBindingContext, type IGlobalContext, type IOverrideContext } from '../observation';
import { createError } from '../utilities-objects';

/**
 * A class for creating context in synthetic scope to keep the number of classes of context in scope small
 */
export class BindingContext implements IBindingContext {
  [key: PropertyKey]: unknown;

  public constructor();
  public constructor(key: PropertyKey, value: unknown);
  public constructor(key?: PropertyKey, value?: unknown) {
    if (key !== void 0) {
      this[key] = value;
    }
  }
}

export class Scope {
  private constructor(
    public parent: Scope | null,
    public bindingContext: IBindingContext,
    public overrideContext: IOverrideContext,
    public globalContext: IGlobalContext,
    public readonly isBoundary: boolean,
  ) { }

  public static getContext(scope: Scope, name: string, ancestor: number): IBindingContext | IOverrideContext | IBinding | undefined | null {
    if (scope == null) {
      throw nullScopeError();
    }
    const globalContext = scope.globalContext;
    let overrideContext: IOverrideContext | null = scope.overrideContext;
    let currentScope: Scope | null = scope;

    if (ancestor > 0) {
      // jump up the required number of ancestor contexts (eg $parent.$parent requires two jumps)
      while (ancestor > 0) {
        ancestor--;
        currentScope = currentScope.parent;
        if (currentScope == null) {
          return void 0;
        }
      }

      overrideContext = currentScope.overrideContext;
      // Here we are giving benefit of doubt considering the dev has used one or more `$parent` token, and thus should know what s/he is targeting.
      return name in overrideContext ? overrideContext : currentScope.bindingContext;
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
      currentScope != null
      && !currentScope.isBoundary
      && !(name in currentScope.overrideContext)
      && !(name in currentScope.bindingContext)
    ) {
      currentScope = currentScope.parent;
    }

    if (currentScope == null) {
      return name in globalContext ? globalContext : scope.bindingContext;
    }

    overrideContext = currentScope.overrideContext;
    return name in overrideContext
      ? overrideContext
      : name in globalContext
        ? globalContext
        : currentScope.bindingContext;
  }

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
    if (bc == null) {
      throw nullContextError();
    }
    const globalContext = createGlobalContext(globalThis);
    return new Scope(null, bc as IBindingContext, oc == null ? new OverrideContext() : oc, globalContext, isBoundary ?? false);
  }

  public static fromParent(ps: Scope | null, bc: object): Scope {
    if (ps == null) {
      throw nullScopeError();
    }
    return new Scope(ps, bc as IBindingContext, new OverrideContext(), ps.globalContext, false);
  }
}

const nullScopeError = () => {
  return __DEV__
    ? createError(`AUR0203: scope is null/undefined.`)
    : createError(`AUR0203`);
};
const nullContextError = () => {
  return __DEV__
    ? createError('AUR0204: binding context is null/undefined')
    : createError('AUR0204');
};

class OverrideContext implements IOverrideContext {
  [key: PropertyKey]: unknown;
}
