export interface IOverrideContext {
  parentOverrideContext: IOverrideContext;
  bindingContext: any;
}

export interface IScope {
  bindingContext: any;
  overrideContext: IOverrideContext;
}

export const BindingContext = {
  createScope(bindingContext: any, overrideContext?: IOverrideContext): IScope {
    return {
      bindingContext: bindingContext,
      overrideContext: overrideContext || BindingContext.createOverride()
    };
  },

  createScopeFromOverride(overrideContext: IOverrideContext): IScope {
    return {
      bindingContext: overrideContext.bindingContext,
      overrideContext
    };
  },

  createScopeFromParent(parentScope: IScope, bindingContext: any): IScope {
    return {
      bindingContext: bindingContext,
      overrideContext: BindingContext.createOverride(
        bindingContext,
        parentScope.overrideContext
      )
    };
  },

  createOverride(bindingContext?: any, parentOverrideContext?: IOverrideContext): IOverrideContext {
    return {
      bindingContext: bindingContext,
      parentOverrideContext: parentOverrideContext || null
    };
  },

  get(scope: IScope, name: string, ancestor: number): any {
    let overrideContext = scope.overrideContext;

    if (ancestor) {
      // jump up the required number of ancestor contexts (eg $parent.$parent requires two jumps)
      while (ancestor && overrideContext) {
        ancestor--;
        overrideContext = overrideContext.parentOverrideContext;
      }

      if (ancestor || !overrideContext) {
        return undefined;
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
};
