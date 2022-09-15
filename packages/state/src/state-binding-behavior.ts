/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Writable } from '@aurelia/kernel';
import { BindingBehaviorExpression, IOverrideContext, LifecycleFlags, Scope } from '@aurelia/runtime';
import { bindingBehavior, BindingInterceptor, IInterceptableBinding, } from '@aurelia/runtime-html';
import { IStore, IStoreSubscriber } from './interfaces';
import { StateBinding } from './state-binding';
import { createStateBindingScope, defProto } from './state-utilities';

@bindingBehavior('state')
export class StateBindingBehavior extends BindingInterceptor implements IStoreSubscriber<object> {
  /** @internal */protected static inject = [IStore];

  /** @internal */private readonly _store: IStore<object>;
  /** @internal */private readonly _isStateBinding: boolean;

  public constructor(
    store: IStore<object>,
    binding: IInterceptableBinding,
    expr: BindingBehaviorExpression,
  ) {
    super(binding, expr);
    this._store = store;
    this._isStateBinding = binding instanceof StateBinding;
  }

  public $bind(flags: LifecycleFlags, scope: Scope): void {
    const binding = this.binding;
    const $scope = this._isStateBinding ? scope : createStateBindingScope(this._store.getState(), scope);
    if (!this._isStateBinding) {
      this._store.subscribe(this);
    }
    binding.$bind(flags, $scope);
  }

  public $unbind(flags: LifecycleFlags): void {
    if (!this._isStateBinding) {
      this._store.unsubscribe(this);
    }
    this.binding.$unbind(flags);
  }

  public handleStateChange(state: object): void {
    const $scope = this.$scope!;
    const overrideContext = $scope.overrideContext as Writable<IOverrideContext>;
    $scope.bindingContext = overrideContext.bindingContext = overrideContext.$state = state;
    this.binding.handleChange(undefined, undefined);
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
