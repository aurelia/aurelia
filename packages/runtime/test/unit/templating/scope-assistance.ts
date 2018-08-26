import { IScope, BindingContext } from "../../../src/index";

export function createScope(bindingContext: any = {}): IScope {
  return {
    bindingContext,
    overrideContext: BindingContext.createOverride(
      bindingContext,
      BindingContext.createOverride()
    )
  };
}
