import { IContainer } from '@aurelia/kernel';
import { IWindow } from '@aurelia/runtime-html';
import { createInterface } from './state-utilities';

/**
 * Official doc at https://github.com/zalmoxisus/redux-devtools-extension/blob/master/docs/API/Methods.md#communicate-with-the-extension-directly
 */
export interface IDevToolsExtension {
  connect: (options?: IDevToolsOptions) => IDevTools<unknown>;
  /**
   * Open the extension's window.
   * This should be conditional (usually you don't need to open extension's window automatically).
   */
  open: (position?: string | { x: number; y: number }) => void;
  /**
   * When called, the extension will listen for uncaught exceptions on the page,
   * and, if any, will show native notifications.
   * Optionally, you can provide a function to be called when an exception occurs.
   */
  notifyErrors: (onError: (error: unknown) => void) => void;
}
export const IDevToolsExtension = /*@__PURE__*/createInterface<IDevToolsExtension>(
  "IDevToolsExtension",
  x => x.cachedCallback((container: IContainer) => {
    const win = container.get(IWindow) as Window & { __REDUX_DEVTOOLS_EXTENSION__: IDevToolsExtension };
    const devToolsExtension = win.__REDUX_DEVTOOLS_EXTENSION__;
    return devToolsExtension ?? null;
  })
);

export interface IDevToolsMessage {
  type: "ACTION" | "DISPATCH";
  payload?: string | IDevToolsPayload;
  state: string;
}

export interface IDevToolsPayload {
  name: string;
  args?: string[];
  type: "JUMP_TO_STATE" | "JUMP_TO_ACTION" | "COMMIT" | "RESET" | "ROLLBACK";
}

export interface IDevtoolsAction<T = unknown> {
  type: T;
  params?: unknown[];
}

export type IDevtoolsActionCreator<T> = (...args: unknown[]) => T;

/**
 * Official doc at https://github.com/zalmoxisus/redux-devtools-extension/blob/master/docs/API/Methods.md#returns
 */
export interface IDevTools<T> {
  /**
   * sends the initial state to the monitor.
   */
  init: (initialState: T) => void;
  /**
   * adds a change listener. It will be called any time an action is dispatched from the monitor.
   *
   * Returns a function to unsubscribe the current listener.
   */
  subscribe: (cb: (message: IDevToolsMessage) => void) => void;
  /**
   * Unsubscribe all listeners
   */
  unsubscribe: () => void;
  /**
   * sends a new action and state manually to be shown on the monitor.
   *
   * If action is null then we suppose we send liftedState
   */
  send: (action: string | IDevtoolsAction<string>, state: T) => void;
  /**
   * sends the error message to be shown in the extension's monitor.
   */
  error: (message: string) => void;
}

export interface IDevToolsOptions {
  /**
   * If disable is true, devtools monitoring
   * will be disabled in the browser (disallowing a user to see your state using Redux Dev Tools)
   */
  disable?: boolean;
  /**
   * the instance name to be showed on the monitor page. Default value is `document.title`.
   * If not specified and there's no document title, it will consist of `tabId` and `instanceId`.
   */
  name?: string;
  /**
   * action creators functions to be available in the Dispatcher.
   */
  actionCreators?: IDevtoolsActionCreator<any>[] | { [key: string]: IDevtoolsActionCreator<any> };
  /**
   * if more than one action is dispatched in the indicated interval, all new actions will be collected and sent at once.
   * It is the joint between performance and speed. When set to `0`, all actions will be sent instantly.
   * Set it to a higher value when experiencing perf issues (also `maxAge` to a lower value).
   *
   * @default 500 ms.
   */
  latency?: number;
  /**
   * (> 1) - maximum allowed actions to be stored in the history tree. The oldest actions are removed once maxAge is reached. It's critical for performance.
   *
   * @default 50
   */
  maxAge?: number;
  /**
   * - `undefined` - will use regular `JSON.stringify` to send data (it's the fast mode).
   * - `false` - will handle also circular references.
   * - `true` - will handle also date, regex, undefined, error objects, symbols, maps, sets and functions.
   * - object, which contains `date`, `regex`, `undefined`, `error`, `symbol`, `map`, `set` and `function` keys.
   * For each of them you can indicate if to include (by setting as `true`).
   * For `function` key you can also specify a custom function which handles serialization.
   * See [`jsan`](https://github.com/kolodny/jsan) for more details.
   */
  serialize?: boolean | {
    date?: boolean;
    regex?: boolean;
    undefined?: boolean;
    error?: boolean;
    symbol?: boolean;
    map?: boolean;
    set?: boolean;
    // eslint-disable-next-line @typescript-eslint/ban-types
    function?: boolean | Function;
  };
  /**
   * function which takes `action` object and id number as arguments, and should return `action` object back.
   */
  actionSanitizer?: <A extends IDevtoolsAction>(action: A, id: number) => A;
  /**
   * function which takes `state` object and index as arguments, and should return `state` object back.
   */
  stateSanitizer?: <S>(state: S, index: number) => S;
  /**
   * - *array of strings as regex* - actions types to be hidden / shown in the monitors (while passed to the reducers).
   * If `actionsWhitelist` specified, `actionsBlacklist` is ignored.
   */
  actionsBlacklist?: string[];
  /**
   * - *array of strings as regex* - actions types to be hidden / shown in the monitors (while passed to the reducers).
   * If `actionsWhitelist` specified, `actionsBlacklist` is ignored.
   */
  actionsWhitelist?: string[];
  /**
   * called for every action before sending, takes `state` and `action` object, and returns `true` in case it allows sending the current data to the monitor.
   * Use it as a more advanced version of `actionsBlacklist`/`actionsWhitelist` parameters.
   */
  predicate?: <S, A extends IDevtoolsAction>(state: S, action: A) => boolean;
  /**
   * if specified as `false`, it will not record the changes till clicking on `Start recording` button.
   * Available only for Redux enhancer, for others use `autoPause`.
   *
   * @default true
   */
  shouldRecordChanges?: boolean;
  /**
   * if specified, whenever clicking on `Pause recording` button and there are actions in the history log, will add this action type.
   * If not specified, will commit when paused. Available only for Redux enhancer.
   *
   * @default "@@PAUSED""
   */
  pauseActionType?: string;
  /**
   * auto pauses when the extension’s window is not opened, and so has zero impact on your app when not in use.
   * Not available for Redux enhancer (as it already does it but storing the data to be sent).
   *
   * @default false
   */
  autoPause?: boolean;
  /**
   * if specified as `true`, it will not allow any non-monitor actions to be dispatched till clicking on `Unlock changes` button.
   * Available only for Redux enhancer.
   *
   * @default false
   */
  shouldStartLocked?: boolean;
  /**
   * if set to `false`, will not recompute the states on hot reloading (or on replacing the reducers). Available only for Redux enhancer.
   *
   * @default true
   */
  shouldHotReload?: boolean;
  /**
   * if specified as `true`, whenever there's an exception in reducers, the monitors will show the error message, and next actions will not be dispatched.
   *
   * @default false
   */
  shouldCatchErrors?: boolean;
  /**
   * If you want to restrict the extension, specify the features you allow.
   * If not specified, all of the features are enabled. When set as an object, only those included as `true` will be allowed.
   * Note that except `true`/`false`, `import` and `export` can be set as `custom` (which is by default for Redux enhancer), meaning that the importing/exporting occurs on the client side.
   * Otherwise, you'll get/set the data right from the monitor part.
   */
  features?: {
    /**
     * start/pause recording of dispatched actions
     */
    pause?: boolean;
    /**
     * lock/unlock dispatching actions and side effects
     */
    lock?: boolean;
    /**
     * persist states on page reloading
     */
    persist?: boolean;
    /**
     * export history of actions in a file
     */
    export?: boolean | "custom";
    /**
     * import history of actions from a file
     */
    import?: boolean | "custom";
    /**
     * jump back and forth (time travelling)
     */
    jump?: boolean;
    /**
     * skip (cancel) actions
     */
    skip?: boolean;
    /**
     * drag and drop actions in the history list
     */
    reorder?: boolean;
    /**
     * dispatch custom actions or action creators
     */
    dispatch?: boolean;
    /**
     * generate tests for the selected actions
     */
    test?: boolean;
  };
}
