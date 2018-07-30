import { BindingContext as RuntimeContext, IScope } from '../../runtime/binding/binding-context';

export const BindingContext = Object.assign(RuntimeContext, {
  createScopeForTest(bindingContext: any, parentBindingContext?: any): IScope {
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
});
