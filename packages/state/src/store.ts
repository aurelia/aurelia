import { all, IContainer, ILogger, optional, Registration } from '@aurelia/kernel';
import { IReducerAction, IState, IStore, IStoreSubscriber } from './interfaces';

export class Store<T extends object> implements IStore<T> {
  public static register(c: IContainer) {
    Registration.singleton(IStore, this).register(c);
  }

  /** @internal */ protected static inject = [optional(IState), all(IReducerAction), ILogger];

  /** @internal */ private _state: any;
  /** @internal */ private readonly _subs = new Set<IStoreSubscriber<T>>();
  /** @internal */ private readonly _logger: ILogger;
  /** @internal */ private readonly _reducers: Map<string | IReducerAction<T>, IReducerAction<T>>;
  /** @internal */ private _publishing = 0;
  /** @internal */ private readonly _dispatchQueues: { action: string | IReducerAction<T>; params: any[] }[] = [];

  public constructor(initialState: T | null, actions: [string | IReducerAction<T>, IReducerAction<T>][], logger: ILogger) {
    this._state = initialState ?? new State() as T;
    this._reducers = new Map(actions);
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

  /** @internal */
  private _getAction(action: string | IReducerAction<T>): IReducerAction<T> | undefined {
    return this._reducers.get(action);
  }

  public dispatch(action: string | IReducerAction<T>, ...params: any[]): void | Promise<void> {
    // if (this._reducers.size === 0) {
    //   if (__DEV__) {
    //     this._logger.warn(`Theres no reducer registered, ignoring action "${$action.type ?? '(anonymous)'}"`);
    //   }
    //   return;
    // }

    if (this._publishing > 0) {
      this._dispatchQueues.push({ action: action, params });
      return;
    }

    this._publishing++;
    const dispatch = ($action: string | IReducerAction<T> | undefined, $params: any[]): void | Promise<void> => {
      if ($action == null) {
        if (__DEV__) {
          this._logger.warn('Dispatching an invalid action: undefined');
        }
        return;
      }
      $action = this._getAction($action);
      if ($action == null) {
        if (typeof action === 'string') {
          if (__DEV__) {
            this._logger.warn(`Unrecognized action type "${action}"`);
          }
          return;
        }
        $action = action;
      }

      let newState: T | Promise<T> | undefined = void 0;
      try {
        newState = $action(this._state, ...$params);
      } catch (ex) {
        this._publishing--;
        throw ex;
      }

      if (newState instanceof Promise) {
        return newState.then(s => {
          this._setState(s);

          return afterDispatch();
        }).then(() => {
          this._publishing--;
        }, ex => {
          this._publishing--;
          throw ex;
        });
      } else {
        this._setState(newState);

        const res = afterDispatch();
        if (res instanceof Promise) {
          return res.then(() => {
            this._publishing--;
          }, ex => {
            this._publishing--;
            throw ex;
          });
        } else {
          this._publishing--;
        }
      }
    };

    const afterDispatch = (): void | Promise<void> => {
      if (this._dispatchQueues.length > 0) {
        const queuedItem = this._dispatchQueues.shift()!;
        return dispatch(queuedItem.action, queuedItem.params);
      }
    };

    return dispatch(action, params);
    // let promise: Promise<void> | undefined = void 0;
    // const reduce = ($state: T | Promise<T>, $action: IReducerAction<T>, params: unknown[]) =>
    //   this._reducers.reduce(($state, r) => {
    //     if ($state instanceof Promise) {
    //       return $state.then($ => r($, $action)) as Promise<T>;
    //     }
    //     return r($state, $action) as T | Promise<T>;
    //   }, $state);

    // const afterDispatch = ($state: T | Promise<T>): void | Promise<void> => {
    //   if (publishing !== this._publishing && this._dispatchQueues.length > 0) {
    //     action = this._dispatchQueues.shift() as IReducerAction<T>;
    //     const newState = reduce($state, action);
    //     return afterDispatch(newState);
    //   }
    // };
    // const state = reduce(this._state, action, params);

    // if (state instanceof Promise) {
    //   return state.then($state => {
    //     this.setState($state);
    //     this._publishing--;

    //     return afterDispatch(this._state);
    //   });
    // } else {
    //   this.setState(state);
    //   this._publishing--;

    //   return afterDispatch(this._state);
    // }
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
