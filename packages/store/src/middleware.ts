export const DEFAULT_LOCAL_STORAGE_KEY = "aurelia-store-state";

export interface CallingAction {
  name: string;
  params?: unknown[];
  pipedActions?: {
    name: string;
    params?: unknown[];
  }[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Middleware<T, S = any> = (state: T, originalState: T | undefined, settings: S, action?: CallingAction) => T | Promise<T | undefined | false> | void | false;
export enum MiddlewarePlacement {
  Before = "before",
  After = "after"
}

export function logMiddleware(state: unknown, _: unknown, settings?: { logType: "debug" | "error" | "info" | "log" | "trace" | "warn" }) {
  // eslint-disable-next-line no-undef
  const logType = settings?.logType !== undefined && console?.hasOwnProperty(settings.logType) ? settings.logType : "log";
  // eslint-disable-next-line no-console, no-undef
  console[logType]("New state: ", state);
}

export function localStorageMiddleware(state: unknown, _: unknown, settings?: { key: string }) {
  if (globalThis.localStorage !== undefined) {
    const key = settings?.key !== undefined ? settings.key : DEFAULT_LOCAL_STORAGE_KEY;

    globalThis.localStorage.setItem(key, JSON.stringify(state));
  }
}

export function rehydrateFromLocalStorage<T>(state: T, key?: string) {
  if (globalThis.localStorage === undefined) {
    return state;
  }

  const storedState = globalThis.localStorage.getItem(key === undefined ? DEFAULT_LOCAL_STORAGE_KEY : key);
  if (storedState === null || storedState === "") {
    return state;
  }

  try {
    return JSON.parse(storedState);
  } catch { /**/ }

  return state;
}
