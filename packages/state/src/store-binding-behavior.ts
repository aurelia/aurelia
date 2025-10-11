import { resolve } from '@aurelia/kernel';
import { Scope } from '@aurelia/runtime';
import { type IBinding, BindingBehavior } from '@aurelia/runtime-html';
import { IStore, type StoreLocator, IStoreRegistry } from './interfaces';
import { isStoreInstance } from './state-utilities';

type StoreAwareBinding = IBinding & {
  useStore(store: IStore<object>): void;
};

function isStoreAware(binding: IBinding): binding is StoreAwareBinding {
  return typeof (binding as StoreAwareBinding).useStore === 'function';
}

const storeOverrideMap = new WeakMap<IBinding, IStore<object>>();

export function getStoreOverride(binding: IBinding): IStore<object> | undefined {
  return storeOverrideMap.get(binding);
}

export function clearStoreOverride(binding: IBinding): void {
  storeOverrideMap.delete(binding);
}

export class StoreBindingBehavior {
  /** @internal */ private readonly _defaultStore = resolve(IStore);
  /** @internal */ private readonly _storeRegistry = resolve(IStoreRegistry);

  public bind(_scope: Scope, binding: IBinding, locator?: StoreLocator | IStore<object>): void {
    const store = this._resolveStore(locator);
    storeOverrideMap.set(binding, store);
    if (isStoreAware(binding)) {
      binding.useStore(store);
    }
  }

  public unbind(_scope: Scope, binding: IBinding): void {
    storeOverrideMap.delete(binding);
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
BindingBehavior.define('store', StoreBindingBehavior);
