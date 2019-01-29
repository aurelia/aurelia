import { PLATFORM } from '@aurelia/kernel';

export interface CallingAction {
  name: string;
  params?: unknown[];
}

export type Middleware<T> = (state: T, originalState?: T, settings?: unknown, action?: CallingAction) => T | Promise<T | undefined | false> | void | false;

export enum MiddlewarePlacement {
  Before = 'before',
  After = 'after'
}

export type LogType = 'log' | 'info' | 'warn' | 'error' | 'debug';

interface IMiddlewareSettings {
  key: string;
  logType: LogType;
}

interface IConsole extends Console {
  hasOwnProperty(key: string): boolean;
}

export function logMiddleware<T>(state: T, _: T, settings?: IMiddlewareSettings): void {
  if (settings && settings.logType && (console as IConsole).hasOwnProperty(settings.logType)) {
    console[settings.logType]('New state: ', state);
  } else {
    // tslint:disable-next-line:no-console
    console.log('New state: ', state);
  }
}

export function localStorageMiddleware<T>(state: T, _: T, settings?: IMiddlewareSettings): void {
  if (PLATFORM.global.localStorage) {
    const key = settings && settings.key && typeof settings.key === 'string'
      ? settings.key
      : 'aurelia-store-state';

    PLATFORM.global.localStorage.setItem(key, JSON.stringify(state));
  }
}

export function rehydrateFromLocalStorage<T>(state: T, key?: string): unknown {
  if (!PLATFORM.global.localStorage) {
    return state;
  }

  const storedState = PLATFORM.global.localStorage.getItem(key || 'aurelia-store-state');
  if (!storedState) {
    return state;
  }

  try {
    return JSON.parse(storedState);
  } catch (e) {
    // tslint:disable-next-line:no-console
    console.error(e);
  }

  return state;
}
