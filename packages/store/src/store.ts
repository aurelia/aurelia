import { IContainer, IWindowOrWorkerGlobalScope, PLATFORM, Reporter } from '@aurelia/kernel';
import { BehaviorSubject, Observable } from 'rxjs';
import { LogDefinitions } from './index';

import { Action, DevToolsOptions } from './devtools';
import { applyLimits, HistoryOptions, isStateHistory, jump } from './history';
import { CallingAction, Middleware, MiddlewarePlacement } from './middleware';

export type Reducer<T, P extends unknown[]= unknown[]> = (state: T, ...params: P) => T | false | Promise<T | false>;

interface IReduxConnect {
  init(initialState: unknown): void;
  subscribe(message: (message: IStoreMessage) => void): void;
  send(action: Action<string>, state: unknown): void;
}

interface IReduxDevtoolsExtension {
  connect(devToolsOptions: DevToolsOptions): IReduxConnect;
}

interface IStoreMessage {
  type: 'DISPATCH';
  state: string;
}

interface IStoreGlobal extends IWindowOrWorkerGlobalScope {
  devToolsExtension?: string;
  __REDUX_DEVTOOLS_EXTENSION__?: IReduxDevtoolsExtension;
}

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

interface DispatchQueueItem<T> {
  reducer: Reducer<T>;
  // tslint:disable-next-line:no-any
  params: any[];
  // tslint:disable-next-line:no-any
  resolve: any;
  // tslint:disable-next-line:no-any
  reject: any;
}

interface IStoreObject {
  container: IContainer;
  global: IStoreGlobal;
}

/** @internal */
export const STORE: IStoreObject = {
  container: null,
  get global(): IStoreGlobal {
    return PLATFORM.global;
  }
};

export class Store<T> {
  public readonly state: Observable<T>;

  private devToolsAvailable: boolean = false;
  private devTools?: IReduxConnect;
  private actions: Map<Reducer<T>, Action<string>> = new Map();
  private middlewares: Map<Middleware<T>, { placement: MiddlewarePlacement; settings?: unknown }> = new Map();
  private _state: BehaviorSubject<T>;
  private options: Partial<StoreOptions>;

  private dispatchQueue: DispatchQueueItem<T>[] = [];

  constructor(private initialState: T, options?: Partial<StoreOptions>) {
    this.options = options || {};
    const isUndoable = this.options.history && this.options.history.undoable === true;
    this._state = new BehaviorSubject<T>(initialState);
    this.state = this._state.asObservable();

    if (!this.options.devToolsOptions || this.options.devToolsOptions.disable !== true) {
      this.setupDevTools();
    }

    if (isUndoable) {
      this.registerHistoryMethods();
    }
  }

  public registerMiddleware(reducer: Middleware<T>, placement: MiddlewarePlacement, settings?: unknown): void {
    this.middlewares.set(reducer, { placement, settings });
  }

  public unregisterMiddleware(reducer: Middleware<T>): void {
    if (this.middlewares.has(reducer)) {
      this.middlewares.delete(reducer);
    }
  }

  public isMiddlewareRegistered(middleware: Middleware<T>): boolean {
    return this.middlewares.has(middleware);
  }

  public registerAction(name: string, reducer: Reducer<T>): void {
    if (reducer.length === 0) {
      // The reducer is expected to have one or more parameters, where the first will be the present state
      Reporter.error(508);
    }

    this.actions.set(reducer, { type: name });
  }

  public unregisterAction(reducer: Reducer<T>): void {
    if (this.actions.has(reducer)) {
      this.actions.delete(reducer);
    }
  }

  public isActionRegistered(reducer: Reducer<T> | string): boolean {
    if (typeof reducer === 'string') {
      return Array.from(this.actions).find((action) => action[1].type === reducer) !== undefined;
    }

    return this.actions.has(reducer);
  }

  public resetToState(state: T): void {
    this._state.next(state);
  }

  public dispatch<P extends unknown[]>(reducer: Reducer<T, P> | string, ...params: P): Promise<void> {
    let action: Reducer<T, P>;

    if (typeof reducer === 'string') {
      const result = Array.from(this.actions)
        .find((val) => val[1].type === reducer);

      if (result) {
        action = result[0];
      }
    } else {
      action = reducer;
    }

    /* tslint:disable-next-line */
    return new Promise<void>((resolve, reject) => {
      /* tslint:disable-next-line */
      this.dispatchQueue.push({ reducer: action, params, resolve, reject } as any);

      if (this.dispatchQueue.length === 1) {
        this.handleQueue();
      }
    });
  }

  private async handleQueue(): Promise<void> {
    if (this.dispatchQueue.length > 0) {
      const queueItem = this.dispatchQueue[0];

      try {
        await this.internalDispatch(queueItem.reducer, ...queueItem.params);
        queueItem.resolve();
      } catch (e) {
        queueItem.reject(e);
      }

      this.dispatchQueue.shift();
      this.handleQueue();
    }
  }

  private async internalDispatch(reducer: Reducer<T>, ...params: unknown[]): Promise<void> {
    if (!this.actions.has(reducer)) {
      // Tried to dispatch an unregistered action
      Reporter.error(505, reducer ? reducer.name : '');
    }

    PLATFORM.mark('dispatch-start');

    const action = {
      ...this.actions.get(reducer),
      params
    };

    if (this.options.logDispatchedActions) {
      // Dispatching:
      Reporter.write(504, action.type);
    }

    const beforeMiddleswaresResult = await this.executeMiddlewares(
      this._state.getValue(),
      MiddlewarePlacement.Before,
      {
        name: action.type,
        params
      }
    );

    if (beforeMiddleswaresResult === false) {
      PLATFORM.clearMarks();
      PLATFORM.clearMeasures();

      return;
    }

    const result = await reducer(beforeMiddleswaresResult, ...params);
    if (result === false) {
      PLATFORM.clearMarks();
      PLATFORM.clearMeasures();

      return;
    }
    PLATFORM.mark(`dispatch-after-reducer-${action.type}`);

    if (!result && typeof result !== 'object') {
      Reporter.error(509);
    }

    let resultingState = await this.executeMiddlewares(
      result,
      MiddlewarePlacement.After,
      {
        name: action.type,
        params
      }
    );

    if (resultingState === false) {
      PLATFORM.clearMarks();
      PLATFORM.clearMeasures();

      return;
    }

    if (isStateHistory(resultingState) &&
      this.options.history &&
      this.options.history.limit) {
      resultingState = applyLimits(resultingState, this.options.history.limit);
    }

    this._state.next(resultingState);
    PLATFORM.mark('dispatch-end');

    if (this.options.measurePerformance === PerformanceMeasurement.StartEnd) {
      PLATFORM.measure(
        'startEndDispatchDuration',
        'dispatch-start',
        'dispatch-end'
      );

      const measures = PLATFORM.getEntriesByName('startEndDispatchDuration');

      Reporter.write(500, measures[0].duration, action.type, measures);
    } else if (this.options.measurePerformance === PerformanceMeasurement.All) {
      const marks = PLATFORM.getEntriesByType('mark');
      const totalDuration = marks[marks.length - 1].startTime - marks[0].startTime;
      Reporter.write(501, totalDuration, action.type, marks);
    }

    PLATFORM.clearMarks();
    PLATFORM.clearMeasures();

    this.updateDevToolsState(action, resultingState);
  }

  private executeMiddlewares(state: T, placement: MiddlewarePlacement, action: CallingAction): T | false {
    return Array.from(this.middlewares)
      .filter((middleware) => middleware[1].placement === placement)
      // tslint:disable-next-line:no-any
      .reduce(async (prev: any, curr, _, _arr) => {
        try {
          const result = await curr[0](await prev, this._state.getValue(), curr[1].settings, action);

          if (result === false) {
            _arr = [];

            return false;
          }

          return result || await prev;
        } catch (e) {
          if (this.options.propagateError) {
            _arr = [];
            throw e;
          }

          return await prev;
        } finally {
          PLATFORM.mark(`dispatch-${placement}-${curr[0].name}`);
        }
      },      state);
  }

  private setupDevTools(): void {
    if (STORE.global.devToolsExtension) {
      Reporter.write(502);
      this.devToolsAvailable = true;
      this.devTools = STORE.global.__REDUX_DEVTOOLS_EXTENSION__.connect(this.options.devToolsOptions);
      this.devTools.init(this.initialState);

      this.devTools.subscribe((message: IStoreMessage) => {
        Reporter.write(503, message.type);

        if (message.type === 'DISPATCH') {
          this._state.next(JSON.parse(message.state));
        }
      });
    }
  }

  private updateDevToolsState(action: Action<string>, state: T): void {
    if (this.devToolsAvailable) {
      this.devTools.send(action, state);
    }
  }

  private registerHistoryMethods(): void {
    this.registerAction('jump', jump as unknown as Reducer<T>);
  }
}

// tslint:disable-next-line
export function dispatchify<T, P extends any[]>(action: Reducer<T, P> | string): (...params: P) => Promise<void> {
  const store = STORE.container.get(Store);

  return function (...params: P): Promise<void> {
    return store.dispatch(action, ...params) as Promise<void>;
  };
}
