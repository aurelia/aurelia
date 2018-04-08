export const targetContext = 'Binding:target';
export const sourceContext = 'Binding:source';

export interface IOverrideContext {
  parentOverrideContext: IOverrideContext;
  bindingContext: any;
}

export interface IScope {
  bindingContext: any;
  overrideContext: IOverrideContext;
}

export const BindingContext = {
  createOverride(bindingContext?: any, parentOverrideContext?: IOverrideContext): IOverrideContext {
    return {
      bindingContext: bindingContext,
      parentOverrideContext: parentOverrideContext || null
    };
  },
  get(scope: IScope, name: string, ancestor: number): any {
    let oc = scope.overrideContext;
  
    if (ancestor) {
      // jump up the required number of ancestor contexts (eg $parent.$parent requires two jumps)
      while (ancestor && oc) {
        ancestor--;
        oc = oc.parentOverrideContext;
      }
      if (ancestor || !oc) {
        return undefined;
      }
      return name in oc ? oc : oc.bindingContext;
    }
  
    // traverse the context and it's ancestors, searching for a context that has the name.
    while (oc && !(name in oc) && !(oc.bindingContext && name in oc.bindingContext)) {
      oc = oc.parentOverrideContext;
    }
    if (oc) {
      // we located a context with the property.  return it.
      return name in oc ? oc : oc.bindingContext;
    }
    // the name wasn't found.  return the root binding context.
    return scope.bindingContext || scope.overrideContext;
  }
};
