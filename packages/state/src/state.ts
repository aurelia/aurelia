import { DI, IContainer, ILogger, Registration } from '@aurelia/kernel';

export interface IStateContainer<T extends object> {
  subscribe(subscriber: IStateSubscriber<T>): void;
  unsubscribe(subscriber: IStateSubscriber<T>): void;
  setState(state: T): void;
  getState(): T;
}
export const IStateContainer = DI.createInterface<object>('IStateContainer');

export class StateContainer<T extends object> {
  public static register(c: IContainer) {
    Registration.singleton(IStateContainer, this).register(c);
  }

  /** @internal */ private _state: T;
  /** @internal */ private readonly _subs = new Set<IStateSubscriber<T>>();
  /** @internal */ private readonly _logger: ILogger;

  public constructor(initialState: T, logger: ILogger) {
    this._state = initialState;
    this._logger = logger;
  }

  public subscribe(subscriber: IStateSubscriber<T>): void {
    if (__DEV__) {
      if (this._subs.has(subscriber)) {
        this._logger.warn('A subscriber is trying to subscribe to state change again.');
      }
    }
    this._subs.add(subscriber);
  }

  public unsubscribe(subscriber: IStateSubscriber<T>): void {
    if (__DEV__) {
      if (!this._subs.has(subscriber)) {
        this._logger.warn('Unsubscribing a non-listening subscriber');
      }
    }
    this._subs.delete(subscriber);
  }

  public setState(state: T) {
    const prevState = this._state;
    this._state = state;
    this._subs.forEach(sub => sub.handleStateChange(state, prevState));
  }

  public getState() {
    if (__DEV__) {
      return /* todo: proxy */ this._state;
    }
    return this._state;
  }
}

export interface IStateSubscriber<T extends object> {
  handleStateChange(state: T, prevState: T): void;
}
