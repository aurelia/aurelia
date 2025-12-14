import { IStore, type IStoreRegistry } from './interfaces';

export class StoreRegistry implements IStoreRegistry {
  private readonly storesByName = new Map<string, IStore<object>>();

  public registerStore<T extends object>(name: string, store: IStore<T>): void {

    if (name != null) {
      if (this.storesByName.has(name)) {
        throw new Error(`A store with name "${name}" has already been registered.`);
      }
      this.storesByName.set(name, store as IStore<object>);
    }
  }

  public getStore<T extends object>(name: string): IStore<T> {
    const storeByName = this.storesByName.get(name);
    if (storeByName == null) {
      throw new Error(`No store registered with name "${name}".`);
    }
    return storeByName as IStore<T>;
  }
}
