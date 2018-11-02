import { BindingContext as RuntimeContext, IBindingContext, IScope } from '@aurelia/runtime';

export const BindingContext = {
  ...RuntimeContext,
  createScopeForTest(bindingContext: IBindingContext, parentBindingContext?: IBindingContext): IScope {
    if (parentBindingContext) {
      return {
        bindingContext,
        overrideContext: this.createOverride(bindingContext, this.createOverride(parentBindingContext))
      };
    }

    return {
      bindingContext,
      overrideContext: this.createOverride(bindingContext)
    };
  }
};
