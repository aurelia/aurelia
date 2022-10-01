import { Writable } from '@aurelia/kernel';
import { IBinding, IOverrideContext, ISubscriber, Scope } from '@aurelia/runtime';
import { bindingBehavior } from '@aurelia/runtime-html';
import { IStore, IStoreSubscriber } from './interfaces';
import { StateBinding } from './state-binding';
import { createStateBindingScope } from './state-utilities';

const bindingStateSubscriberMap = new WeakMap<IBinding, StateSubscriber>();

@bindingBehavior('state')
export class StateBindingBehavior {
  /** @internal */protected static inject = [IStore];

  /** @internal */private readonly _store: IStore<object>;

  public constructor(
    store: IStore<object>,
  ) {
    this._store = store;
  }

  public bind(scope: Scope, binding: IBinding): void {
    const isStateBinding = binding instanceof StateBinding;
    scope = isStateBinding ? scope : createStateBindingScope(this._store.getState(), scope);
    let subscriber: StateSubscriber | undefined;
    if (!isStateBinding) {
      subscriber = bindingStateSubscriberMap.get(binding);
      if (subscriber == null) {
        bindingStateSubscriberMap.set(binding, subscriber = new StateSubscriber(binding, scope));
      } else {
        subscriber._wrappedScope = scope;
      }
      this._store.subscribe(subscriber);
      binding.useScope(scope);
    }
  }

  public unbind(scope: Scope, binding: IBinding): void {
    const isStateBinding = binding instanceof StateBinding;
    if (!isStateBinding) {
      this._store.unsubscribe(bindingStateSubscriberMap.get(binding)!);
      bindingStateSubscriberMap.delete(binding);
    }
  }
}

class StateSubscriber implements IStoreSubscriber<object> {
  public constructor(
    public _binding: IBinding,
    public _wrappedScope: Scope,
  ) {}

  public handleStateChange(state: object): void {
    const scope = this._wrappedScope;
    const overrideContext = scope.overrideContext as Writable<IOverrideContext>;
    scope.bindingContext = overrideContext.bindingContext = overrideContext.$state = state;
    (this._binding as unknown as ISubscriber).handleChange?.(undefined, undefined);
  }
}
