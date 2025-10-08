import { type Writable, resolve } from '@aurelia/kernel';
import { type ISubscriber, type IOverrideContext, Scope } from '@aurelia/runtime';
import { type IBinding, BindingBehavior } from '@aurelia/runtime-html';
import { IStore, type IStoreSubscriber, IStoreRegistry, type StoreLocator } from './interfaces';
import { StateBinding } from './state-binding';
import { createStateBindingScope } from './state-utilities';

type BindingStateRecord = {
  subscriber: IStoreSubscriber<object>;
  store: IStore<object>;
  scope: Scope;
};

const bindingStateRecordMap = new WeakMap<IBinding, BindingStateRecord>();

export class StateBindingBehavior {

  /** @internal */ private readonly _defaultStore = resolve(IStore);
  /** @internal */ private readonly _storeRegistry = resolve(IStoreRegistry);

  public bind(scope: Scope, binding: IBinding, storeLocator?: StoreLocator): void {
    const isStateBinding = binding instanceof StateBinding;
    const store = storeLocator == null ? this._defaultStore : this._storeRegistry.getStore(storeLocator);
    const effectiveScope = isStateBinding ? scope : createStateBindingScope(store.getState(), scope);

    if (!isStateBinding) {
      const record = getOrCreateBindingRecord(binding, store, effectiveScope);

      if (__DEV__ && !binding.useScope) {
        // eslint-disable-next-line no-console
        console.warn(`Binding ${binding.constructor.name} does not support "state" binding behavior`);
      }
      binding.useScope?.(effectiveScope);
      const currentState = store.getState();
      record.subscriber.handleStateChange(currentState, currentState);
    }
  }

  public unbind(_scope: Scope, binding: IBinding): void {
    const record = bindingStateRecordMap.get(binding);
    if (record != null) {
      record.store.unsubscribe(record.subscriber);
      bindingStateRecordMap.delete(binding);
    }
  }
}
BindingBehavior.define('state', StateBindingBehavior);

function getOrCreateBindingRecord(binding: IBinding, store: IStore<object>, scope: Scope): BindingStateRecord {
  let record = bindingStateRecordMap.get(binding);

  if (record == null) {
    const subscriber: IStoreSubscriber<object> = {
      handleStateChange(state: object, _prevState: object): void {
        const current = bindingStateRecordMap.get(binding);
        if (current == null) {
          return;
        }
        const currentScope = current.scope;
        const overrideContext = currentScope.overrideContext as Writable<IOverrideContext>;
        currentScope.bindingContext = overrideContext.bindingContext = state;
        (binding as unknown as ISubscriber).handleChange?.(undefined, undefined);
      },
    };
    record = { subscriber, store, scope };
    bindingStateRecordMap.set(binding, record);
    store.subscribe(subscriber);
  }

  if (record.store !== store) {
    record.store.unsubscribe(record.subscriber);
    record.store = store;
    store.subscribe(record.subscriber);
  }

  record.scope = scope;
  return record;
}
