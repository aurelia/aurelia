import { IScope, BindingContext } from "@aurelia/runtime";

export function createScope(bindingContext: any = {}): IScope {
  return {
    bindingContext,
    overrideContext: BindingContext.createOverride(
      bindingContext,
      BindingContext.createOverride()
    )
  };
}
