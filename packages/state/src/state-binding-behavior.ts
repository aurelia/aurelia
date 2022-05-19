import { bindingBehavior, BindingBehaviorExpression, BindingInterceptor, IInterceptableBinding, LifecycleFlags, Scope } from '@aurelia/runtime';
import { IStore } from './interfaces';
import { StateBinding } from './state-binding';
import { createStateBindingScope } from './state-utilities';

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
    if (!(this.binding instanceof StateBinding)) {
      this.binding.$bind(flags, createStateBindingScope(this._store.getState(), scope));
    }
  }
}
