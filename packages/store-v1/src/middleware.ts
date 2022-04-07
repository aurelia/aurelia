import { IPlatform } from '@aurelia/kernel';
import { IWindow } from '@aurelia/runtime-html';
import { STORE } from './store.js';

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

export function logMiddleware(state: unknown, _: unknown, settings?: { logType: "debug" | "error" | "info" | "log" | "trace" | "warn" }): void {
  const cons = STORE.container.get(IPlatform).console;
  const logType = settings?.logType !== undefined && cons[settings.logType] !== undefined ? settings.logType : "log";

  cons[logType]("New state: ", state);
}

export function localStorageMiddleware(state: unknown, _: unknown, settings?: { key: string }): void {
  const localStorage = STORE.container.get(IWindow).localStorage;

  if (localStorage !== undefined) {
    const key = settings?.key !== undefined ? settings.key : DEFAULT_LOCAL_STORAGE_KEY;

    localStorage.setItem(key, JSON.stringify(state));
  }
}

export function rehydrateFromLocalStorage<T>(state: T, key?: string): T {
  const localStorage = STORE.container.get(IWindow).localStorage;

  if (localStorage === undefined) {
    return state;
  }

  const storedState = localStorage.getItem(key === undefined ? DEFAULT_LOCAL_STORAGE_KEY : key);
  if (storedState === null || storedState === "") {
    return state;
  }

  try {
    return JSON.parse(storedState) as T;
  } catch { /**/ }

  return state;
}
