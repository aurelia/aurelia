import { all, IContainer, ILogger, isPromise, lazy, onResolve, optional, Registration, resolve } from '@aurelia/kernel';
import { IActionHandler, IState, IStore, IStoreSubscriber, IStateMiddleware, MiddlewarePlacement, IMiddlewareSettings } from './interfaces';
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
  /** @internal */ private readonly _middlewares = new Map<IStateMiddleware<T>, IMiddlewareSettings>();
  /** @internal */ private _dispatching = false;
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

  public registerMiddleware<S = any>(middleware: IStateMiddleware<T, S>, placement: MiddlewarePlacement, settings?: S): void {
    this._middlewares.set(middleware, { placement, settings });
  }

  public unregisterMiddleware(middleware: IStateMiddleware<T>): void {
    if (this._middlewares.has(middleware)) {
      this._middlewares.delete(middleware);
    }
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
  private _executeMiddlewares(state: T, placement: MiddlewarePlacement, action: unknown): T | Promise<T | false> {
    const middlewares = Array.from(this._middlewares.entries())
      .filter(([_, settings]) => settings.placement === placement);

    if (middlewares.length === 0) {
      return state;
    }

    return this._executeMiddlewaresAsync(state, middlewares, action);
  }

  /** @internal */
  private async _executeMiddlewaresAsync(state: T, middlewares: [IStateMiddleware<T>, IMiddlewareSettings][], action: unknown): Promise<T | false> {
    let currentState: T = state;

    for (const [middleware, settings] of middlewares) {
      try {
        const middlewareResult = await middleware(currentState, action, settings.settings);

        if (middlewareResult === false) {
          return false;
        }

        if (middlewareResult !== undefined && middlewareResult !== null) {
          currentState = middlewareResult as T;
        }
      } catch (error) {
        this._logger.error(`Middleware execution failed: ${error}`);
        // Continue with current state on error
      }
    }

    return currentState;
  }

  /** @internal */
  private _handleAction<T>(handlers: readonly IActionHandler<T>[], $state: T | Promise<T>, $action: unknown): T | Promise<T> {
    for (const handler of handlers) {
      $state = onResolve($state, $state => handler($state, $action));
    }
    return onResolve($state, s => s);
  }

  public dispatch(action: TAction): void | Promise<void> {
    if (this._dispatching) {
      this._dispatchQueues.push(action);
      return;
    }

    this._dispatching = true;

    const afterDispatch = ($state: T | Promise<T>): void | Promise<void> => {
      return onResolve($state, s => {
        const $$action = this._dispatchQueues.shift()!;
        if ($$action != null) {
          // Execute before middlewares
          const beforeResult = this._executeMiddlewares(s, MiddlewarePlacement.Before, $$action);

          return onResolve(beforeResult, beforeState => {
            if (beforeState === false) {
              this._dispatching = false;
              return;
            }

            return onResolve(this._handleAction<T>(this._handlers, beforeState, $$action), handlerState => {
              // Execute after middlewares
              const afterResult = this._executeMiddlewares(handlerState, MiddlewarePlacement.After, $$action);

              return onResolve(afterResult, finalState => {
                if (finalState === false) {
                  this._dispatching = false;
                  return;
                }

                this._setState(finalState);
                return afterDispatch(finalState);
              });
            });
          });
        } else {
          this._dispatching = false;
        }
      });
    };

    // Execute before middlewares
    const beforeResult = this._executeMiddlewares(this._state, MiddlewarePlacement.Before, action);

    return onResolve(beforeResult, beforeState => {
      if (beforeState === false) {
        this._dispatching = false;
        return;
      }

      const newState = this._handleAction<T>(this._handlers, beforeState, action);

      if (isPromise(newState)) {
        return newState.then($state => {
          // Execute after middlewares
          const afterResult = this._executeMiddlewares($state, MiddlewarePlacement.After, action);

          return onResolve(afterResult, finalState => {
            if (finalState === false) {
              this._dispatching = false;
              return;
            }

            this._setState(finalState);
            return afterDispatch(this._state);
          });
        }, ex => {
          this._dispatching = false;
          throw ex;
        });
      } else {
        // Execute after middlewares
        const afterResult = this._executeMiddlewares(newState, MiddlewarePlacement.After, action);

        return onResolve(afterResult, finalState => {
          if (finalState === false) {
            this._dispatching = false;
            return;
          }

          this._setState(finalState);
          return afterDispatch(this._state);
        });
      }
    });
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
      this._logger.info(`DevTools sent a message: ${JSON.stringify(message)}`);
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
    this._logger.warn(`State is immutable. Dispatch an action to create a new state`);
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
