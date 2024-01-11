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
      }else {
        // Ensure that in case of no queued dispatches, the result is returned
        return $state instanceof Promise ? $state.then(() => {}) : undefined;
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
  const store = {} as unknown as IStore<{ a: number }, { type: 'edit'; value: string } | { type: 'clear' }>;

  store.dispatch({ type: 'clear' });
  // @ts-expect-error
  store.dispatch({ type: 'edit' });
  // @ts-expect-error
  store.dispatch({ type: 'edit', value: 5 });
  // @ts-expect-error
  store.dispatch({ type: 'hello' });
}
/* eslint-enable */
