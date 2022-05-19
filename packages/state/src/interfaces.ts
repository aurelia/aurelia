import { DI, MaybePromise, IRegistry } from '@aurelia/kernel';

export const IReducerAction = DI.createInterface<IReducerAction>('IReducerAction');
export type IReducerAction<T = any> = (state: MaybePromise<T>, ...params: any) => MaybePromise<T>;

export const IStateContainer = DI.createInterface<object>('IStateContainer');
export interface IStateContainer<T extends object> {
  subscribe(subscriber: IStateSubscriber<T>): void;
  unsubscribe(subscriber: IStateSubscriber<T>): void;
  getState(): T;
  dispatch(action: string | IReducerAction<T>, ...params: any[]): void | Promise<void>;
}

export const IState = DI.createInterface<object>('IState');

export type IRegistrableReducer = IReducerAction & IRegistry;

export interface IStateSubscriber<T extends object> {
  handleStateChange(state: T, prevState: T): void;
}
