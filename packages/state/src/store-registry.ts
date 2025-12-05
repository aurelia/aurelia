import type { Key } from '@aurelia/kernel';
import { IStore, type IStoreRegistration, type IStoreRegistry, type StoreLocator } from './interfaces';

export class StoreRegistry implements IStoreRegistry {
  private readonly storesByName = new Map<string, IStore<object>>();
  private readonly storesByKey = new Map<Key, IStore<object>>();
  private defaultStore: IStore<object> | undefined = void 0;

  public register<T extends object>(store: IStore<T>, info: IStoreRegistration = {}): void {
    const { name, key, isDefault } = info;

    if (name != null) {
      if (this.storesByName.has(name)) {
        throw new Error(`A store with name "${name}" has already been registered.`);
      }
      this.storesByName.set(name, store as IStore<object>);
    }

    if (key != null) {
      if (this.storesByKey.has(key)) {
        throw new Error('A store with the provided key has already been registered.');
      }
      this.storesByKey.set(key, store as IStore<object>);
    }

    if (isDefault === true || this.defaultStore == null) {
      this.defaultStore = store as IStore<object>;
      if (!this.storesByName.has('default')) {
        this.storesByName.set('default', store as IStore<object>);
      }
    }
  }

  public getStore<T extends object>(locator?: StoreLocator): IStore<T> {
    if (locator == null) {
      if (this.defaultStore == null) {
        throw new Error('No default store has been registered.');
      }
      return this.defaultStore as IStore<T>;
    }

    if (typeof locator === 'string') {
      const storeByName = this.storesByName.get(locator);
      if (storeByName == null) {
        throw new Error(`No store registered with name "${locator}".`);
      }
      return storeByName as IStore<T>;
    }

    const storeByKey = this.storesByKey.get(locator);
    if (storeByKey == null) {
      throw new Error(`No store registered for the provided locator.`);
    }
    return storeByKey as IStore<T>;
  }

  public tryGetStore<T extends object>(locator?: StoreLocator): IStore<T> | undefined {
    try {
      return this.getStore(locator);
    } catch (error) {
      return void 0;
    }
  }
}
