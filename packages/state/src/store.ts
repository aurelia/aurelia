import { all, IContainer, ILogger, MaybePromise, optional, Registration } from '@aurelia/kernel';
import { IActionHandler, IState, IStore, IStoreSubscriber } from './interfaces';

export class Store<T extends object, TAction = unknown> implements IStore<T> {
  public static register(c: IContainer) {
    Registration.singleton(IStore, this).register(c);
  }

  /** @internal */ protected static inject = [optional(IState), all(IActionHandler), ILogger];

  /** @internal */ private _state: any;
  /** @internal */ private readonly _subs = new Set<IStoreSubscriber<T>>();
  /** @internal */ private readonly _logger: ILogger;
  /** @internal */ private readonly _handlers: IActionHandler<T>[];
  /** @internal */ private _dispatching = 0;
  /** @internal */ private readonly _dispatchQueues: TAction[] = [];

  public constructor(initialState: T | null, actionHandlers: IActionHandler<T>[], logger: ILogger) {
    this._state = initialState ?? new State() as T;
    this._handlers = actionHandlers;
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

  public dispatch(action: TAction): void | Promise<void> {
    if (this._dispatching > 0) {
      this._dispatchQueues.push(action);
      return;
    }

    this._dispatching++;
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

    let $$action: TAction;
    const reduce = ($state: T | Promise<T>, $action: unknown) =>
      this._handlers.reduce(($state, handler) => {
        if ($state instanceof Promise) {
          return $state.then($ => handler($, $action));
        }
        return handler($state, $action) as T | Promise<T>;
      }, $state);

    const afterDispatch = ($state: MaybePromise<T>): void | Promise<void> => {
      if (this._dispatchQueues.length > 0) {
        $$action = this._dispatchQueues.shift()!;
        const newState = reduce($state, $$action);
        if (newState instanceof Promise) {
          return newState.then($ => afterDispatch($));
        } else {
          return afterDispatch(newState);
        }
      }
    };
    const newState = reduce(this._state, action);

    if (newState instanceof Promise) {
      return newState.then($state => {
        this._setState($state);
        this._dispatching--;

        return afterDispatch(this._state);
      }, ex => {
        this._dispatching--;
        throw ex;
      });
    } else {
      this._setState(newState);
      this._dispatching--;

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

/* eslint-disable */
function typingsTest() {
  let store: IStore<{ a: number }, { type: 'edit'; value: string } | { type: 'clear' }> = null!;

  store.dispatch({ type: 'clear' });
  // @ts-expect-error
  store.dispatch({ type: 'edit' });
  // @ts-expect-error
  store.dispatch({ type: 'hello' });
}
/* eslint-enable */
