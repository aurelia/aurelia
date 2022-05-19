import { DI, MaybePromise, IRegistry } from '@aurelia/kernel';

export const IReducerAction = DI.createInterface<IReducerAction>('IReducerAction');
export type IReducerAction<T = any> = (state: MaybePromise<T>, ...params: any) => MaybePromise<T>;

export const IStore = DI.createInterface<object>('IStore');
export interface IStore<T extends object> {
  subscribe(subscriber: IStoreSubscriber<T>): void;
  unsubscribe(subscriber: IStoreSubscriber<T>): void;
  getState(): T;
  /**
   * Dispatch an action by name or the function itself. The action needs to be registered with the store.
   *
   * @param action - the name or the action to be dispatched
   * @param params - all the parameters to be called with the action
   */
  dispatch(action: string | IReducerAction<T>, ...params: any[]): void | Promise<void>;
}

export const IState = DI.createInterface<object>('IState');

export type IRegistrableReducer = IReducerAction & IRegistry;

export interface IStoreSubscriber<T extends object> {
  handleStateChange(state: T, prevState: T): void;
}
