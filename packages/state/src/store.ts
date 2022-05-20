import { all, IContainer, ILogger, MaybePromise, optional, Registration } from '@aurelia/kernel';
import { IAction, IReducer, IState, IStore, IStoreSubscriber } from './interfaces';

export class Store<T extends object> implements IStore<T> {
  public static register(c: IContainer) {
    Registration.singleton(IStore, this).register(c);
  }

  /** @internal */ protected static inject = [optional(IState), all(IReducer), ILogger];

  /** @internal */ private _state: any;
  /** @internal */ private readonly _subs = new Set<IStoreSubscriber<T>>();
  /** @internal */ private readonly _logger: ILogger;
  /** @internal */ private readonly _reducers: IReducer<T>[];
  /** @internal */ private _publishing = 0;
  /** @internal */ private readonly _dispatchQueues: IAction[] = [];

  public constructor(initialState: T | null, reducers: IReducer<T>[], logger: ILogger) {
    this._state = initialState ?? new State() as T;
    this._reducers = reducers;
    this._logger = logger;
  }

  public subscribe(subscriber: IStoreSubscriber<T>): void {
    if (__DEV__) {
      if (this._subs.has(subscriber)) {
        this._logger.warn('A subscriber is trying to subscribe to state change again.');
        return;
      }
    }
    this._subs.add(subscriber);
  }

  public unsubscribe(subscriber: IStoreSubscriber<T>): void {
    if (__DEV__) {
      if (!this._subs.has(subscriber)) {
        this._logger.warn('Unsubscribing a non-listening subscriber');
        return;
      }
    }
    this._subs.delete(subscriber);
  }

  /** @internal */
  private _setState(state: T): void {
    const prevState = this._state;
    this._state = state;
    this._subs.forEach(sub => sub.handleStateChange(state, prevState));
  }

  public getState(): T {
    if (__DEV__) {
      return new Proxy(this._state, new StateProxyHandler(this, this._logger));
    }
    return this._state;
  }

  public dispatch(action: unknown, ...params: any[]): void | Promise<void> {
    if (this._publishing > 0) {
      this._dispatchQueues.push({ type: action, params });
      return;
    }

    this._publishing++;
    // const dispatch = ($actionType: unknown, $params: any[]): void | Promise<void> => {
    //   const $$reducer = this._reducers;
    //   if ($$reducer.length === 0) {
    //     if (__DEV__) {
    //       this._logger.warn(`No reducers registered.`);
    //     }
    //     return;
    //   }

    //   let newState: T | Promise<T> | undefined = void 0;
    //   try {
    //     newState = $$reducer(this._state, $actionType, ...$params);
    //   } catch (ex) {
    //     this._publishing--;
    //     throw ex;
    //   }

    //   if (newState instanceof Promise) {
    //     return newState.then(s => {
    //       this._setState(s);

    //       return afterDispatch();
    //     }).then(() => {
    //       this._publishing--;
    //     }, ex => {
    //       this._publishing--;
    //       throw ex;
    //     });
    //   } else {
    //     this._setState(newState);

    //     const res = afterDispatch();
    //     if (res instanceof Promise) {
    //       return res.then(() => {
    //         this._publishing--;
    //       }, ex => {
    //         this._publishing--;
    //         throw ex;
    //       });
    //     } else {
    //       this._publishing--;
    //     }
    //   }
    // };

    // const afterDispatch = (): void | Promise<void> => {
    //   if (this._dispatchQueues.length > 0) {
    //     const queuedItem = this._dispatchQueues.shift()!;
    //     return dispatch(queuedItem.action, queuedItem.params);
    //   }
    // };

    // return dispatch(action, params);

    let $$action: IAction;
    const reduce = ($state: T | Promise<T>, $action: unknown, params?: unknown[]) =>
      this._reducers.reduce(($state, r) => {
        if ($state instanceof Promise) {
          return $state.then($ => r($, $action, ...params ?? [])) as Promise<T>;
        }
        return r($state, $action, ...params ?? []) as T | Promise<T>;
      }, $state);

    const afterDispatch = ($state: MaybePromise<T>): void | Promise<void> => {
      if (this._dispatchQueues.length > 0) {
        $$action = this._dispatchQueues.shift()!;
        const newState = reduce($state, $$action.type, $$action.params);
        if (newState instanceof Promise) {
          return newState.then($ => afterDispatch($));
        } else {
          return afterDispatch(newState);
        }
      }
    };
    const newState = reduce(this._state, action, params);

    if (newState instanceof Promise) {
      return newState.then($state => {
        this._setState($state);
        this._publishing--;

        return afterDispatch(this._state);
      }, ex => {
        this._publishing--;
        throw ex;
      });
    } else {
      this._setState(newState);
      this._publishing--;

      return afterDispatch(this._state);
    }
  }
}
class State {}

class StateProxyHandler<T extends object> implements ProxyHandler<T> {
  public constructor(
    /** @internal */ private readonly _owner: Store<T>,
    /** @internal */ private readonly _logger: ILogger,
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public set(target: T, prop: string | symbol, value: unknown, receiver: unknown): boolean {
    this._logger.warn(`Setting State is immutable. Dispatch an action to create a new state`);
    return true;
  }
}
