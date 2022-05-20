/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { bindingBehavior, BindingBehaviorExpression, BindingInterceptor, IInterceptableBinding, LifecycleFlags, Scope } from '@aurelia/runtime';
import { IStore } from './interfaces';
import { StateBinding } from './state-binding';
import { createStateBindingScope, defProto } from './state-utilities';

@bindingBehavior('state')
export class StateBindingBehavior extends BindingInterceptor {
  /** @internal */protected static inject = [IStore];

  /** @internal */private readonly _store: IStore<object>;

  public constructor(
    store: IStore<object>,
    binding: IInterceptableBinding,
    expr: BindingBehaviorExpression,
  ) {
    super(binding, expr);
    this._store = store;
  }

  public $bind(flags: LifecycleFlags, scope: Scope): void {
    const binding = this.binding;
    const $scope = binding instanceof StateBinding ? scope : createStateBindingScope(this._store.getState(), scope);
    binding.$bind(flags, $scope);
  }
}

['target', 'targetProperty'].forEach(p => {
  defProto(StateBindingBehavior, p, {
    enumerable: false,
    configurable: true,
    get(this: BindingInterceptor) {
      return (this.binding as any)[p];
    },
    set(this: BindingInterceptor, v: unknown) {
      (this.binding as any)[p] = v;
    }
  });
});
