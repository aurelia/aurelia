import { IContainer, PLATFORM, Reporter } from '@aurelia/kernel';
import { BehaviorSubject, Observable } from 'rxjs';

import { jump, applyLimits, HistoryOptions, isStateHistory } from './history';
import { Middleware, MiddlewarePlacement, CallingAction } from './middleware';
import { LogDefinitions, LogLevel, getLogType, GenericLogger } from './logging';
import { DevToolsOptions, Action } from './devtools';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Reducer<T, P extends any[] = any[]> = (state: T, ...params: P) => T | false | Promise<T | false>;

export enum PerformanceMeasurement {
  StartEnd = 'startEnd',
  All = 'all'
}

export interface StoreOptions {
  history?: Partial<HistoryOptions>;
  logDispatchedActions?: boolean;
  measurePerformance?: PerformanceMeasurement;
  propagateError?: boolean;
  logDefinitions?: LogDefinitions;
  devToolsOptions?: DevToolsOptions;
}

export interface PipedDispatch<T> {
  pipe: <P extends any[]>(reducer: Reducer<T, P> | string, ...params: P) => PipedDispatch<T>;
  dispatch: () => Promise<void>;
}

interface DispatchAction<T> {
  reducer: Reducer<T>;
  params: any[];
}

interface DispatchQueueItem<T> {
  actions: DispatchAction<T>[];
  resolve: any;
  reject: any;
}

/** @internal */
export const STORE: { container: IContainer } = {
  container: null!
};

export class UnregisteredActionError<T, P extends any[]> extends Error {
  public constructor(reducer?: string | Reducer<T, P>) {
    super(`Tried to dispatch an unregistered action ${reducer && (typeof reducer === "string" ? reducer : reducer.name)}`);
  }
}

export class Store<T> {
  public readonly state: Observable<T>;
  // TODO: need an alternative for the Reporter which supports multiple log levels
  private readonly logger = Reporter as GenericLogger;
  private devToolsAvailable: boolean = false;
  private devTools: any;
  private readonly actions: Map<Reducer<T>, Action<string>> = new Map();
  private readonly middlewares: Map<Middleware<T>, { placement: MiddlewarePlacement; settings?: any }> = new Map();
  private readonly _state: BehaviorSubject<T>;
  private readonly options: Partial<StoreOptions>;
  private readonly dispatchQueue: DispatchQueueItem<T>[] = [];

  public constructor(private readonly initialState: T, options?: Partial<StoreOptions>) {
    this.options = options || {};
    const isUndoable = this.options?.history?.undoable === true;
    this._state = new BehaviorSubject<T>(initialState);
    this.state = this._state.asObservable();

    if (!this.options?.devToolsOptions?.disable !== true) {
      this.setupDevTools();
    }

    if (isUndoable) {
      this.registerHistoryMethods();
    }
  }

  public registerMiddleware<S extends undefined>(reducer: Middleware<T, undefined>, placement: MiddlewarePlacement): void;
  public registerMiddleware<S extends NonNullable<any>>(reducer: Middleware<T, S>, placement: MiddlewarePlacement, settings: S): void;
  public registerMiddleware<S>(reducer: Middleware<T, S>, placement: MiddlewarePlacement, settings?: S) {
    this.middlewares.set(reducer, { placement, settings });
  }

  public unregisterMiddleware(reducer: Middleware<T>) {
    if (this.middlewares.has(reducer)) {
      this.middlewares.delete(reducer);
    }
  }

  public isMiddlewareRegistered(middleware: Middleware<T>) {
    return this.middlewares.has(middleware);
  }

  public registerAction(name: string, reducer: Reducer<T>) {
    if (reducer.length === 0) {
      // The reducer is expected to have one or more parameters, where the first will be the present state
      Reporter.error(508);
    }

    this.actions.set(reducer, { type: name });
  }

  public unregisterAction(reducer: Reducer<T>) {
    if (this.actions.has(reducer)) {
      this.actions.delete(reducer);
    }
  }

  public isActionRegistered(reducer: Reducer<T> | string) {
    if (typeof reducer === 'string') {
      return Array.from(this.actions).find((action) => action[1].type === reducer) !== undefined;
    }

    return this.actions.has(reducer);
  }

  public resetToState(state: T) {
    this._state.next(state);
  }

  public dispatch<P extends any[]>(reducer: Reducer<T, P> | string, ...params: P): Promise<void> {
    const action = this.lookupAction(reducer as Reducer<T> | string);
    if (!action) {
      return Promise.reject(new UnregisteredActionError(reducer));
    }

    return this.queueDispatch([{
      reducer: action,
      params
    }]);
  }

  public pipe<P extends any[]>(reducer: Reducer<T, P> | string, ...params: P): PipedDispatch<T> {
    const pipeline: DispatchAction<T>[] = [];

    const dispatchPipe: PipedDispatch<T> = {
      dispatch: () => this.queueDispatch(pipeline),
      pipe: <NextP extends any[]>(nextReducer: Reducer<T, NextP> | string, ...nextParams: NextP) => {
        const action = this.lookupAction(nextReducer as Reducer<T> | string);
        if (!action) {
          throw new UnregisteredActionError(reducer);
        }
        pipeline.push({ reducer: action, params: nextParams });
        return dispatchPipe;
      }
    };

    return dispatchPipe.pipe(reducer, ...params);
  }

  private lookupAction(reducer: Reducer<T> | string): Reducer<T> | undefined {
    if (typeof reducer === "string") {
      const result = Array.from(this.actions).find(([_, action]) => action.type === reducer);
      if (result) {
        return result[0];
      }
    } else if (this.actions.has(reducer)) {
      return reducer;
    }

    return undefined;
  }

  private async queueDispatch(actions: DispatchAction<T>[]) {
    return new Promise<void>((resolve, reject) => {
      this.dispatchQueue.push({ actions, resolve, reject });
      if (this.dispatchQueue.length === 1) {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this.handleQueue();
      }
    });
  }

  private async handleQueue() {
    if (this.dispatchQueue.length > 0) {
      const queueItem = this.dispatchQueue[0];

      try {
        await this.internalDispatch(queueItem.actions);
        queueItem.resolve();
      } catch (e) {
        queueItem.reject(e);
      }

      this.dispatchQueue.shift();
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this.handleQueue();
    }
  }

  private async internalDispatch(actions: DispatchAction<T>[]) {
    const unregisteredAction = actions.find((a) => !this.actions.has(a.reducer));
    if (unregisteredAction) {
      throw new UnregisteredActionError(unregisteredAction.reducer);
    }

    PLATFORM.global.performance.mark("dispatch-start");

    const pipedActions = actions.map((a) => ({
      type: this.actions.get(a.reducer)!.type,
      params: a.params,
      reducer: a.reducer
    }));

    const callingAction: CallingAction = {
      name: pipedActions.map((a) => a.type).join("->"),
      params: pipedActions.reduce<any[]>((p, a) => p.concat(a.params), []),
      pipedActions: pipedActions.map((a) => ({
        name: a.type,
        params: a.params
      }))
    };

    if (this.options.logDispatchedActions) {
      this.logger[getLogType(this.options, "dispatchedActions", LogLevel.info)](`Dispatching: ${callingAction.name}`);
    }

    // eslint-disable-next-line @typescript-eslint/await-thenable
    const beforeMiddleswaresResult = await this.executeMiddlewares(
      this._state.getValue(),
      MiddlewarePlacement.Before,
      callingAction
    );

    if (beforeMiddleswaresResult === false) {
      PLATFORM.global.performance.clearMarks();
      PLATFORM.global.performance.clearMeasures();

      return;
    }

    let result: T | false = beforeMiddleswaresResult;
    for (const action of pipedActions) {
      result = await action.reducer(result, ...action.params);
      if (result === false) {
        PLATFORM.global.performance.clearMarks();
        PLATFORM.global.performance.clearMeasures();

        return;
      }

      PLATFORM.global.performance.mark(`dispatch-after-reducer-${action.type}`);

      if (!result && typeof result !== "object") {
        throw new Error("The reducer has to return a new state");
      }
    }

    // eslint-disable-next-line @typescript-eslint/await-thenable
    let resultingState = await this.executeMiddlewares(
      result,
      MiddlewarePlacement.After,
      callingAction
    );

    if (resultingState === false) {
      PLATFORM.global.performance.clearMarks();
      PLATFORM.global.performance.clearMeasures();

      return;
    }

    if (isStateHistory(resultingState) &&
      this.options.history &&
      this.options.history.limit) {
      resultingState = applyLimits(resultingState, this.options.history.limit);
    }

    this._state.next(resultingState);
    PLATFORM.global.performance.mark("dispatch-end");

    if (this.options.measurePerformance === PerformanceMeasurement.StartEnd) {
      PLATFORM.global.performance.measure(
        "startEndDispatchDuration",
        "dispatch-start",
        "dispatch-end"
      );

      const measures = PLATFORM.global.performance.getEntriesByName("startEndDispatchDuration");
      this.logger[getLogType(this.options, "performanceLog", LogLevel.info)](
        `Total duration ${measures[0].duration} of dispatched action ${callingAction.name}:`,
        measures
      );
    } else if (this.options.measurePerformance === PerformanceMeasurement.All) {
      const marks = PLATFORM.global.performance.getEntriesByType("mark");
      const totalDuration = marks[marks.length - 1].startTime - marks[0].startTime;
      this.logger[getLogType(this.options, "performanceLog", LogLevel.info)](
        `Total duration ${totalDuration} of dispatched action ${callingAction.name}:`,
        marks
      );
    }

    PLATFORM.global.performance.clearMarks();
    PLATFORM.global.performance.clearMeasures();

    this.updateDevToolsState({ type: callingAction.name, params: callingAction.params }, resultingState);
  }

  private executeMiddlewares(state: T, placement: MiddlewarePlacement, action: CallingAction): T | false {
    return Array.from(this.middlewares)
      .filter((middleware) => middleware[1].placement === placement)
      .reduce(async (prev: any, curr, _) => {
        try {
          const result = await curr[0](await prev, this._state.getValue(), curr[1].settings, action);

          if (result === false) {

            return false;
          }

          return result || await prev;
        } catch (e) {
          if (this.options.propagateError) {
            throw e;
          }

          // eslint-disable-next-line @typescript-eslint/return-await
          return await prev;
        } finally {
          PLATFORM.global.performance.mark(`dispatch-${placement}-${curr[0].name}`);
        }
      }, state);
  }

  private setupDevTools() {
    // TODO: needs a better solution for global override
    if ((PLATFORM.global as any).devToolsExtension) {
      this.logger[getLogType(this.options, "devToolsStatus", LogLevel.debug)]("DevTools are available");
      this.devToolsAvailable = true;
    // TODO: needs a better solution for global override
      this.devTools = (PLATFORM.global as any).__REDUX_DEVTOOLS_EXTENSION__.connect(this.options.devToolsOptions);
      this.devTools.init(this.initialState);

      this.devTools.subscribe((message: any) => {
        this.logger[getLogType(this.options, "devToolsStatus", LogLevel.debug)](`DevTools sent change ${message.type}`);

        if (message.type === "DISPATCH" && message.payload) {
          switch (message.payload.type) {
            case "JUMP_TO_STATE":
            case "JUMP_TO_ACTION":
              this._state.next(JSON.parse(message.state));
              return;
            case "COMMIT":
              this.devTools.init(this._state.getValue());
              return;
            case "RESET":
              this.devTools.init(this.initialState);
              this.resetToState(this.initialState);
              return;
            case "ROLLBACK": {
              const parsedState = JSON.parse(message.state);

              this.resetToState(parsedState);
              this.devTools.init(parsedState);
              return;
            }
          }
        }
      });
    }
  }

  private updateDevToolsState(action: Action<string>, state: T) {
    if (this.devToolsAvailable) {
      this.devTools.send(action, state);
    }
  }

  private registerHistoryMethods() {
    this.registerAction("jump", jump as Reducer<T>);
  }
}

export function dispatchify<T, P extends any[]>(action: Reducer<T, P> | string) {
  const store = STORE.container.get<Store<T>>(Store);

  // eslint-disable-next-line @typescript-eslint/require-await
  return async function (...params: P): Promise<void> {
    return store.dispatch(action, ...params);
  };
}
