import { Scope } from '@aurelia/runtime';

export function createStateBindingScope(state: object, scope: Scope) {
  const overrideContext = { bindingContext: state };
  const stateScope = Scope.create(state, overrideContext, true);
  stateScope.parentScope = scope;
  return stateScope;
}
