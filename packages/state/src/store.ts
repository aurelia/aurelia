import { all, IContainer, ILogger, lazy, MaybePromise, optional, Registration, resolve } from '@aurelia/kernel';
import { IActionHandler, IState, IStore, IStoreSubscriber } from './interfaces';
import { IDevToolsExtension, IDevToolsOptions, IDevToolsPayload } from './interfaces-devtools';

export class Store<T extends object, TAction = unknown> implements IStore<T> {
  public static register(c: IContainer) {
    c.register(
      Registration.singleton(this, this),
      Registration.aliasTo(this, IStore),
    );
  }

  /** @internal */ private readonly _initialState: any;
  /** @internal */ private _state: any;
  /** @internal */ private readonly _subs = new Set<IStoreSubscriber<T>>();
  /** @internal */ private readonly _logger: ILogger;
  /** @internal */ private readonly _handlers: readonly IActionHandler<T>[];
  /** @internal */ private _dispatching = 0;
  /** @internal */ private readonly _dispatchQueues: TAction[] = [];
  /** @internal */ private readonly _getDevTools: () => IDevToolsExtension;

  public constructor() {
    this._initialState = this._state = resolve(optional(IState)) ?? new State() as T;
    this._handlers = resolve(all(IActionHandler));
    this._logger = resolve(ILogger);
    this._getDevTools = resolve(lazy(IDevToolsExtension));
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

  /* istanbul ignore next */
  public connectDevTools(options: IDevToolsOptions) {
    const extension = this._getDevTools();
    const hasDevTools = extension != null;
    if (!hasDevTools) {
      throw new Error('Devtools extension is not available');
    }
    options.name ??= 'Aurelia State plugin';

    const devTools = extension.connect(options);
    devTools.init(this._initialState);
    devTools.subscribe((message) => {
      this._logger.info('DevTools sent a message:', message);
      const payload: IDevToolsPayload = typeof message.payload === 'string'
        ? tryParseJson(message.payload)
        : message.payload;

      if (payload === void 0) {
        return;
      }

      if (message.type === "ACTION") {
        if (payload == null) {
          throw new Error('DevTools sent an action with no payload');
        }
        void new Promise<void>(r => {
          r(this.dispatch(payload as TAction));
        }).catch((ex) => {
          throw new Error(`Issue when trying to dispatch an action through devtools:\n${ex}`);
        }).then(() => {
          devTools.send('ACTION', this._state);
        });
        return;
      }

      if (message.type === "DISPATCH" && payload != null) {
        switch (payload.type) {
          case "JUMP_TO_STATE":
          case "JUMP_TO_ACTION":
            this._setState(JSON.parse(message.state));
            return;
          case "COMMIT":
            devTools.init(this._state);
            return;
          case "RESET":
            devTools.init(this._initialState);
            this._setState(this._initialState);
            return;
          case "ROLLBACK": {
            const parsedState = JSON.parse(message.state) as T;
            this._setState(parsedState);
            devTools.send('ROLLBACK', parsedState);
            return;
          }
        }
      }
    });
  }
}
class State { }

class StateProxyHandler<T extends object> implements ProxyHandler<T> {
  public constructor(
    /** @internal */ private readonly _owner: Store<T>,
    /** @internal */ private readonly _logger: ILogger,
  ) { }

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

function tryParseJson(str: string) {
  try {
    return JSON.parse(str);
  } catch (ex) {
    // eslint-disable-next-line no-console
    console.log(`Error parsing JSON:\n${(str ?? '').slice(0, 200)}\n${ex}`);
    return undefined;
  }
}
