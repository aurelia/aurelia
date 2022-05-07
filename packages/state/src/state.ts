import { all, DI, IContainer, ILogger, optional, Registration } from '@aurelia/kernel';
import { IReducer, IStateAction } from './reducer';

export interface IStateContainer<T extends object> {
  subscribe(subscriber: IStateSubscriber<T>): void;
  unsubscribe(subscriber: IStateSubscriber<T>): void;
  // setState(state: T): void;
  getState(): T;
  dispatch<TT, TP>(action: IStateAction<TT, TP>): void;
}
export const IStateContainer = DI.createInterface<object>('IStateContainer');

export const IState = DI.createInterface<object>('IState');

export class StateContainer<T extends object> {
  public static register(c: IContainer) {
    Registration.singleton(IStateContainer, this).register(c);
  }

  /** @internal */ protected static inject = [optional(IState), all(IReducer), ILogger];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  /** @internal */ private _state: any;
  /** @internal */ private readonly _subs = new Set<IStateSubscriber<T>>();
  /** @internal */ private readonly _logger: ILogger;
  /** @internal */ private readonly _reducers: IReducer[];
  /** @internal */ private _publishing = 0;
  /** @internal */ private readonly _dispatchQueues: IStateAction[] = [];

  public constructor(initialState: T | null, reducers: IReducer[], logger: ILogger) {
    this._state = initialState ?? new State() as T;
    this._reducers = reducers;
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

  private setState(state: T): void {
    const prevState = this._state;
    this._state = state;
    this._subs.forEach(sub => sub.handleStateChange(state, prevState));
  }

  public getState(): T {
    if (__DEV__) {
      return new Proxy(this._state, new StateProxyHandler(this));
    }
    return this._state;
  }

  public dispatch(action: IStateAction): void {
    if (this._reducers.length === 0) {
      if (__DEV__) {
        this._logger.warn(`Theres no reducer registered, ignoring action "${action.type}"`);
      }
      return;
    }
    if (this._publishing > 0) {
      this._dispatchQueues.push(action);
      return;
    }

    const publishing = this._publishing++;
    this.setState(this._reducers.reduce(($state, r) => r($state, action), this._state));
    this._publishing--;

    if (publishing !== this._publishing) {
      while (this._dispatchQueues.length > 0) {
        action = this._dispatchQueues.shift() as IStateAction;
        this.setState(this._reducers.reduce(($state, r) => r($state, action), this._state));
      }
    }
  }

  /** @internal */
  public warn(...args: Parameters<ILogger['warn']>): void {
    this._logger.warn(...args);
  }
}

export interface IStateSubscriber<T extends object> {
  handleStateChange(state: T, prevState: T): void;
}

class State {}

class StateProxyHandler<T extends object> implements ProxyHandler<T> {
  public constructor(
    /** @internal */ private readonly _owner: StateContainer<T>
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public set(target: T, prop: string | symbol, value: unknown, receiver: unknown): boolean {
    this._owner.warn(`Setting State is immutable. Dispatch an action to create a new state`);
    return true;
  }
}
