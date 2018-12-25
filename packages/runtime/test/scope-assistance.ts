import { IScope, Scope, OverrideContext } from "../../../src/index";

export function createScope(bindingContext: any = {}): IScope {
  return Scope.create(bindingContext, OverrideContext.create(bindingContext, OverrideContext.create(null, null)))
}
