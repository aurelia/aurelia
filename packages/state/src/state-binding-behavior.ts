import { type Writable, resolve } from '@aurelia/kernel';
import { type ISubscriber, type IOverrideContext, Scope } from '@aurelia/runtime';
import { type IBinding, BindingBehavior } from '@aurelia/runtime-html';
import { IStore, type IStoreSubscriber, IStoreManager, type StoreLocator } from './interfaces';
import { StateBinding } from './state-binding';
import { createStateBindingScope } from './state-utilities';

const bindingStateSubscriberMap = new WeakMap<IBinding, StateSubscriber>();

export class StateBindingBehavior {

  /** @internal */ private readonly _defaultStore = resolve(IStore);
  /** @internal */ private readonly _storeManager = resolve(IStoreManager);

  public bind(scope: Scope, binding: IBinding, storeLocator?: StoreLocator): void {
    const isStateBinding = binding instanceof StateBinding;
    const store = storeLocator == null ? this._defaultStore : this._storeManager.getStore(storeLocator);
    const effectiveScope = isStateBinding ? scope : createStateBindingScope(store.getState(), scope);

    if (!isStateBinding) {
      let subscriber = bindingStateSubscriberMap.get(binding);
      if (subscriber == null) {
        subscriber = new StateSubscriber(binding, effectiveScope, store);
        bindingStateSubscriberMap.set(binding, subscriber);
        store.subscribe(subscriber);
      } else {
        subscriber._wrappedScope = effectiveScope;
        if (subscriber._store !== store) {
          subscriber._store.unsubscribe(subscriber);
          subscriber._store = store;
          store.subscribe(subscriber);
        }
      }

      if (__DEV__ && !binding.useScope) {
        // eslint-disable-next-line no-console
        console.warn(`Binding ${binding.constructor.name} does not support "state" binding behavior`);
      }
      binding.useScope?.(effectiveScope);
      void Promise.resolve().then(() => subscriber!.handleStateChange(store.getState()));
    }
  }

  public unbind(scope: Scope, binding: IBinding): void {
    const subscriber = bindingStateSubscriberMap.get(binding);
    if (subscriber != null) {
      subscriber._store.unsubscribe(subscriber);
      bindingStateSubscriberMap.delete(binding);
    }
  }
}
BindingBehavior.define('state', StateBindingBehavior);

class StateSubscriber implements IStoreSubscriber<object> {
  public constructor(
    public _binding: IBinding,
    public _wrappedScope: Scope,
    public _store: IStore<object>,
  ) {}

  public handleStateChange(state: object): void {
    const scope = this._wrappedScope;
    const overrideContext = scope.overrideContext as Writable<IOverrideContext>;
    scope.bindingContext = overrideContext.bindingContext = state;
    (this._binding as unknown as ISubscriber).handleChange?.(undefined, undefined);
  }
}
