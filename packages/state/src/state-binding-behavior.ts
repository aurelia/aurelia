import { type Writable, resolve } from '@aurelia/kernel';
import { type ISubscriber, type IOverrideContext, Scope } from '@aurelia/runtime';
import { type IBinding, BindingBehavior } from '@aurelia/runtime-html';
import { IStore, type IStoreSubscriber, IStoreRegistry, type StoreLocator } from './interfaces';
import { StateBinding } from './state-binding';
import { createStateBindingScope, isStoreInstance } from './state-utilities';
import { getStoreOverride, clearStoreOverride } from './store-binding-behavior';

type BindingStateRecord = {
  store: IStore<object>;
  subscriber: StateSubscriber;
};

const bindingStateRecordMap = new WeakMap<IBinding, BindingStateRecord>();

export class StateBindingBehavior {

  /** @internal */ private readonly _defaultStore = resolve(IStore);
  /** @internal */ private readonly _storeRegistry = resolve(IStoreRegistry);

  public bind(scope: Scope, binding: IBinding, storeLocator?: StoreLocator | IStore<object>): void {
    const isStateBinding = binding instanceof StateBinding;
    const override = getStoreOverride(binding);
    const store = override ?? this._resolveStore(storeLocator);
    const effectiveScope = isStateBinding ? scope : createStateBindingScope(store.getState(), scope);

    if (!isStateBinding) {
      const record = getOrCreateBindingRecord(binding, store, effectiveScope);
      record.subscriber.scope = effectiveScope;
      if (__DEV__ && !binding.useScope) {
        // eslint-disable-next-line no-console
        console.warn(`Binding ${binding.constructor.name} does not support "state" binding behavior`);
      }
      binding.useScope?.(effectiveScope);
    }
  }

  public unbind(_scope: Scope, binding: IBinding): void {
    const record = bindingStateRecordMap.get(binding);
    if (record != null) {
      record.store.unsubscribe(record.subscriber);
      bindingStateRecordMap.delete(binding);
    }
    clearStoreOverride(binding);
  }

  private _resolveStore(locator?: StoreLocator | IStore<object>): IStore<object> {
    if (locator == null) {
      return this._defaultStore;
    }
    if (isStoreInstance(locator)) {
      return locator;
    }
    return this._storeRegistry.getStore(locator);
  }
}
BindingBehavior.define('state', StateBindingBehavior);

function getOrCreateBindingRecord(binding: IBinding, store: IStore<object>, scope: Scope): BindingStateRecord {
  let record = bindingStateRecordMap.get(binding);
  if (record == null) {
    const subscriber = new StateSubscriber(binding, scope);
    record = { store, subscriber };
    bindingStateRecordMap.set(binding, record);
    store.subscribe(subscriber);
    return record;
  }

  if (record.store !== store) {
    record.store.unsubscribe(record.subscriber);
    record.store = store;
    store.subscribe(record.subscriber);
  }
  record.subscriber.scope = scope;
  return record;
}

class StateSubscriber implements IStoreSubscriber<object> {
  public constructor(
    private readonly binding: IBinding,
    public scope: Scope,
  ) {}

  public handleStateChange(state: object): void {
    const overrideContext = this.scope.overrideContext as Writable<IOverrideContext>;
    this.scope.bindingContext = overrideContext.bindingContext = state;
    (this.binding as unknown as ISubscriber).handleChange?.(undefined, undefined);
  }
}
