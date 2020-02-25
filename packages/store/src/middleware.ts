import { PLATFORM } from '@aurelia/kernel';

export const DEFAULT_LOCAL_STORAGE_KEY = "aurelia-store-state";

export interface CallingAction {
  name: string;
  params?: any[];
  pipedActions?: {
    name: string;
    params?: any[];
  }[];
}

export type Middleware<T, S = any> = (state: T, originalState: T | undefined, settings: S, action?: CallingAction) => T | Promise<T | undefined | false> | void | false;
export enum MiddlewarePlacement {
  Before = "before",
  After = "after"
}

export function logMiddleware(state: unknown, _: unknown, settings?: { logType: "debug" | "error" | "info" | "log" | "trace" | "warn" }) {
  const logType = settings?.logType && console?.hasOwnProperty(settings.logType) ? settings.logType : "log";
  console[logType]("New state: ", state);
}

export function localStorageMiddleware(state: unknown, _: unknown, settings?: { key: string }) {
  if (PLATFORM.global.localStorage) {
    const key = settings && settings.key || DEFAULT_LOCAL_STORAGE_KEY;

    PLATFORM.global.localStorage.setItem(key, JSON.stringify(state));
  }
}

export function rehydrateFromLocalStorage<T>(state: T, key?: string) {
  if (!PLATFORM.global.localStorage) {
    return state;
  }

  const storedState = PLATFORM.global.localStorage.getItem(key || DEFAULT_LOCAL_STORAGE_KEY);
  if (!storedState) {
    return state;
  }

  try {
    return JSON.parse(storedState);
  } catch { /**/ }

  return state;
}
